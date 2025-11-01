# SAP Data Extraction Integration Plan for STOX.AI

**Module Focus**: Store Replenishment Flow
**Date**: 2025-10-29
**Status**: Architecture Design

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Scenario: Store Replenishment Flow](#scenario-store-replenishment-flow)
3. [Method 1: OData Services](#method-1-odata-services)
4. [Method 2: BAPI Functions](#method-2-bapi-functions)
5. [Method 3: RabbitMQ Event Stream](#method-3-rabbitmq-event-stream)
6. [Method 4: File-Based Integration](#method-4-file-based-integration)
7. [Hybrid Architecture](#hybrid-architecture)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Overview

### Business Context

**STOX.AI Store Replenishment Module** needs real-time data from SAP to:
1. Calculate optimal order quantities (ROP, EOQ, Safety Stock)
2. Monitor inventory levels across 12 stores
3. Track open purchase orders and inbound shipments
4. Generate replenishment recommendations
5. Update ATP (Available-to-Promise) commitments

### Data Sources Required

| Data Type | SAP Tables | Update Frequency | Method |
|-----------|------------|------------------|--------|
| **Master Data** | MARA, MARC, MARD | Daily | OData/File |
| **Inventory Levels** | MARD, MBEW | Hourly | OData |
| **Sales Orders** | VBAK, VBAP, VBEP | Real-time | RabbitMQ |
| **Purchase Orders** | EKKO, EKPO | Real-time | RabbitMQ |
| **Commitments** | VBBE | Real-time | BAPI |
| **Forecasts** | PBED, PBIM | Daily | File |

---

## Scenario: Store Replenishment Flow

### User Story
```
As a Store Manager at "Chicago Magnificent Mile" (Store-Chicago-001),
I need STOX.AI to automatically generate replenishment orders
when my inventory drops below reorder point (ROP),
so that I can maintain optimal stock levels without stockouts.
```

### Data Flow Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    SAP ERP System                               │
├─────────────────────────────────────────────────────────────────┤
│  [MARD]      [VBBE]      [EKPO]      [VBAP]      [PBED]       │
│  Inventory   ATP         Inbound     Open        Forecast      │
│  On-Hand     Committed   Shipments   Orders      Demand        │
└────┬────────────┬───────────┬──────────┬───────────┬───────────┘
     │            │           │          │           │
     │ OData      │ BAPI      │ RabbitMQ │ RabbitMQ  │ File
     │ (Hourly)   │ (RT)      │ (RT)     │ (RT)      │ (Daily)
     ▼            ▼           ▼          ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│              STOX.AI Integration Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  [Redis Cache] [PostgreSQL] [MongoDB] [Event Bus]              │
└────┬────────────┬───────────┬──────────┬───────────┬───────────┘
     │            │           │          │           │
     └────────────┴───────────┴──────────┴───────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              STOX.AI Store Replenishment Engine                 │
├─────────────────────────────────────────────────────────────────┤
│  1. Calculate Available = Current + Inbound - Committed         │
│  2. Check if Available < ROP                                    │
│  3. Calculate Order Qty = Target - Available                    │
│  4. Apply MOQ/Multiples constraints                             │
│  5. Generate Purchase Requisition                               │
└────────────────────────────────────┬───────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              Write Back to SAP                                  │
├─────────────────────────────────────────────────────────────────┤
│  [EBAN] - Purchase Requisition via BAPI_PR_CREATE               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Method 1: OData Services

### Use Case: Periodic Inventory Snapshots

**Best For**: Master data, inventory levels, non-time-critical data

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  SAP Gateway (Port 8000/44300)                              │
│  ├─ /sap/opu/odata/sap/API_MATERIAL_STOCK_SRV               │
│  ├─ /sap/opu/odata/sap/API_PRODUCT_SRV                      │
│  └─ /sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV        │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS (OAuth 2.0)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  STOX.AI OData Connector (Node.js)                          │
│  ├─ Authentication (OAuth token refresh)                    │
│  ├─ Rate limiting (100 req/min)                             │
│  ├─ Retry logic (exponential backoff)                       │
│  ├─ Response caching (Redis)                                │
│  └─ Error handling & logging                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL - Staging Tables                                │
│  ├─ stg_sap_mard (inventory snapshots)                      │
│  ├─ stg_sap_marc (plant data)                               │
│  └─ stg_sap_ekpo (PO items)                                 │
└─────────────────────────────────────────────────────────────┘
```

### Implementation

#### Step 1: OData Service Discovery

```bash
# Test SAP OData endpoint
curl -X GET "https://sap.madison.com:44300/sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/$metadata" \
  -H "Authorization: Basic base64(user:pass)"
```

#### Step 2: Node.js OData Client

```javascript
// stox-odata-connector.js
const axios = require('axios');
const redis = require('redis');
const { Pool } = require('pg');

class StoxODataConnector {
  constructor(config) {
    this.baseUrl = config.sapGatewayUrl; // https://sap.madison.com:44300
    this.auth = Buffer.from(`${config.user}:${config.pass}`).toString('base64');
    this.cache = redis.createClient();
    this.db = new Pool(config.postgres);
  }

  /**
   * Extract inventory levels for all stores (MARD table)
   * Scenario: Get current stock for Store-Chicago-001
   */
  async extractInventoryLevels(plant = 'P001', storageLocation = 'SL01') {
    const cacheKey = `sap:mard:${plant}:${storageLocation}`;

    // Check cache first (TTL: 1 hour)
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      // OData query with filters
      const url = `${this.baseUrl}/sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_MatlStkInAcctMod`;
      const params = {
        $filter: `Plant eq '${plant}' and StorageLocation eq '${storageLocation}'`,
        $select: 'Material,Plant,StorageLocation,MatlWrhsStkQtyInMatlBaseUnit,MaterialBaseUnit',
        $format: 'json'
      };

      const response = await axios.get(url, {
        headers: { 'Authorization': `Basic ${this.auth}` },
        params: params,
        timeout: 30000
      });

      const inventory = response.data.d.results.map(item => ({
        material: item.Material,
        plant: item.Plant,
        storage_location: item.StorageLocation,
        stock_qty: parseFloat(item.MatlWrhsStkQtyInMatlBaseUnit),
        unit: item.MaterialBaseUnit,
        extracted_at: new Date().toISOString()
      }));

      // Cache for 1 hour
      await this.cache.setex(cacheKey, 3600, JSON.stringify(inventory));

      // Load to staging table
      await this.loadToStaging('stg_sap_mard', inventory);

      return inventory;

    } catch (error) {
      console.error('OData extraction failed:', error);
      throw error;
    }
  }

  /**
   * Extract open purchase orders (EKPO table)
   * Scenario: Get inbound shipments for Chicago store
   */
  async extractPurchaseOrders(plant = 'P001', material = 'MR_HAIR_101') {
    const url = `${this.baseUrl}/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem`;
    const params = {
      $filter: `Plant eq '${plant}' and Material eq '${material}' and IsCompletelyDelivered eq false`,
      $select: 'PurchaseOrder,PurchaseOrderItem,Material,Plant,OrderQuantity,OrderQuantityUnit,ScheduleLine,NetPriceAmount',
      $expand: 'to_PurOrdScheduleLine',
      $format: 'json'
    };

    const response = await axios.get(url, {
      headers: { 'Authorization': `Basic ${this.auth}` },
      params: params
    });

    const poItems = response.data.d.results.map(item => ({
      po_number: item.PurchaseOrder,
      po_item: item.PurchaseOrderItem,
      material: item.Material,
      plant: item.Plant,
      order_qty: parseFloat(item.OrderQuantity),
      unit: item.OrderQuantityUnit,
      net_price: parseFloat(item.NetPriceAmount),
      delivery_date: item.to_PurOrdScheduleLine?.results?.[0]?.ScheduleLineDeliveryDate,
      extracted_at: new Date().toISOString()
    }));

    await this.loadToStaging('stg_sap_ekpo', poItems);
    return poItems;
  }

  /**
   * Load data to PostgreSQL staging table
   */
  async loadToStaging(tableName, data) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      for (const row of data) {
        const columns = Object.keys(row).join(', ');
        const values = Object.values(row);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        await client.query(
          `INSERT INTO ${tableName} (${columns})
           VALUES (${placeholders})
           ON CONFLICT DO NOTHING`,
          values
        );
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

// Usage
const connector = new StoxODataConnector({
  sapGatewayUrl: 'https://sap.madison.com:44300',
  user: 'STOX_AI',
  pass: process.env.SAP_PASSWORD,
  postgres: {
    host: 'localhost',
    database: 'stox_ai',
    user: 'stox',
    password: process.env.DB_PASSWORD
  }
});

// Schedule: Run every hour
setInterval(async () => {
  console.log('Starting OData extraction...');

  // Extract for DC-East stores
  const inventory = await connector.extractInventoryLevels('P001', 'SL01');
  console.log(`Extracted ${inventory.length} inventory records`);

  const orders = await connector.extractPurchaseOrders('P001', 'MR_HAIR_101');
  console.log(`Extracted ${orders.length} PO records`);

}, 3600000); // Every hour
```

#### Step 3: Create Staging Tables

```sql
-- PostgreSQL staging tables
CREATE TABLE stg_sap_mard (
  id SERIAL PRIMARY KEY,
  material VARCHAR(18),
  plant VARCHAR(4),
  storage_location VARCHAR(4),
  stock_qty DECIMAL(13,3),
  unit VARCHAR(3),
  extracted_at TIMESTAMP,
  loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(material, plant, storage_location, extracted_at)
);

CREATE INDEX idx_mard_material_plant ON stg_sap_mard(material, plant);

CREATE TABLE stg_sap_ekpo (
  id SERIAL PRIMARY KEY,
  po_number VARCHAR(10),
  po_item VARCHAR(5),
  material VARCHAR(18),
  plant VARCHAR(4),
  order_qty DECIMAL(13,3),
  unit VARCHAR(3),
  net_price DECIMAL(13,2),
  delivery_date DATE,
  extracted_at TIMESTAMP,
  loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(po_number, po_item, extracted_at)
);

CREATE INDEX idx_ekpo_material_plant ON stg_sap_ekpo(material, plant, delivery_date);
```

---

## Method 2: BAPI Functions

### Use Case: Real-Time ATP Checks & Write Operations

**Best For**: Transactional operations, ATP checks, creating purchase requisitions

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  SAP Application Server (RFC Gateway)                       │
│  ├─ BAPI_MATERIAL_AVAILABILITY                              │
│  ├─ BAPI_REQUIREMENT_CHECK                                  │
│  ├─ BAPI_PR_CREATE (Purchase Requisition)                   │
│  └─ BAPI_TRANSACTION_COMMIT                                 │
└────────────────┬────────────────────────────────────────────┘
                 │ RFC (JCo/PyRFC)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  STOX.AI BAPI Service (Python FastAPI)                      │
│  ├─ Connection pool management                              │
│  ├─ Request/response mapping                                │
│  ├─ Transaction handling                                    │
│  └─ Error recovery & logging                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  STOX.AI Store Replenishment Module                         │
└─────────────────────────────────────────────────────────────┘
```

### Implementation

#### Step 1: Python BAPI Client (using PyRFC)

```python
# stox_bapi_client.py
from pyrfc import Connection, ABAPApplicationError, ABAPRuntimeError
from typing import Dict, List
import logging
from datetime import datetime

class StoxBAPIClient:
    """
    STOX.AI BAPI client for real-time SAP integration
    """

    def __init__(self, config: Dict):
        self.conn = Connection(
            user=config['user'],
            passwd=config['passwd'],
            ashost=config['ashost'],
            sysnr=config['sysnr'],
            client=config['client']
        )
        self.logger = logging.getLogger(__name__)

    def check_atp(self, material: str, plant: str, required_qty: float,
                   req_date: str) -> Dict:
        """
        Check Available-to-Promise (ATP) for material

        Scenario: Before generating order for Store-Chicago-001,
                  check if DC-East has sufficient ATP

        Args:
            material: Material number (e.g., 'MR_HAIR_101')
            plant: Plant code (e.g., 'P001' for DC-East)
            required_qty: Quantity needed (e.g., 36.0)
            req_date: Required date (e.g., '2025-11-05')

        Returns:
            {
                'available_qty': 150.0,
                'confirmed_qty': 36.0,
                'shortage_qty': 0.0,
                'confirmed_date': '2025-11-05',
                'atp_status': 'AVAILABLE'
            }
        """
        try:
            result = self.conn.call('BAPI_MATERIAL_AVAILABILITY',
                MATERIAL=material,
                PLANT=plant,
                UNIT='EA',
                CHECK_RULE='A',  # ATP check
                STGE_LOC='SL01',
                BATCH='',
                AV_QTY_PLT=required_qty,
                WANTDATE=req_date
            )

            atp_result = {
                'material': material,
                'plant': plant,
                'required_qty': required_qty,
                'available_qty': float(result.get('AV_QTY_PLT', 0)),
                'confirmed_qty': float(result.get('CONF_QTY', 0)),
                'shortage_qty': max(0, required_qty - float(result.get('CONF_QTY', 0))),
                'confirmed_date': result.get('CONF_DATE', req_date),
                'atp_status': 'AVAILABLE' if float(result.get('CONF_QTY', 0)) >= required_qty else 'SHORTAGE',
                'messages': result.get('RETURN', [])
            }

            self.logger.info(f"ATP Check: {material} @ {plant} = {atp_result['atp_status']}")
            return atp_result

        except (ABAPApplicationError, ABAPRuntimeError) as e:
            self.logger.error(f"ATP check failed: {e}")
            raise

    def create_purchase_requisition(self, store_id: str, material: str,
                                     plant: str, quantity: float,
                                     delivery_date: str) -> Dict:
        """
        Create Purchase Requisition for store replenishment

        Scenario: Store-Chicago-001 needs 36 units of MR_HAIR_101
                  Auto-create PR for DC-East to replenish store

        Args:
            store_id: Store identifier (e.g., 'Store-Chicago-001')
            material: Material number
            plant: Receiving plant
            quantity: Order quantity (after MOQ/multiple adjustment)
            delivery_date: Required delivery date

        Returns:
            {
                'pr_number': '0010001234',
                'pr_item': '00010',
                'status': 'SUCCESS'
            }
        """
        try:
            # Prepare PR item
            pr_items = [{
                'PREQ_ITEM': '00010',
                'MATERIAL': material,
                'PLANT': plant,
                'QUANTITY': quantity,
                'UNIT': 'EA',
                'DELIV_DATE': delivery_date,
                'PREQ_NAME': 'STOX_AI',
                'SHORT_TEXT': f'Store Replenishment - {store_id}',
                'ACCTASSCAT': 'U',  # Unknown account assignment
                'PREQ_PRICE': 25.00,  # Unit price
                'PRICE_UNIT': 1,
                'CURRENCY': 'USD',
                'PUR_GROUP': '001',  # Purchasing group
                'PURCH_ORG': '1000',
                'DOC_TYPE': 'NB',  # Standard PR
                'TRACKINGNO': f'STOX_{datetime.now().strftime("%Y%m%d%H%M%S")}'
            }]

            # Call BAPI
            result = self.conn.call('BAPI_PR_CREATE',
                PREQITN=pr_items
            )

            # Check for errors
            messages = result.get('RETURN', [])
            errors = [m for m in messages if m['TYPE'] in ('E', 'A')]

            if errors:
                error_msg = '; '.join([m['MESSAGE'] for m in errors])
                raise Exception(f"PR creation failed: {error_msg}")

            # Get PR number from result
            pr_number = result.get('NUMBER', '')

            if pr_number:
                # Commit transaction
                self.conn.call('BAPI_TRANSACTION_COMMIT', WAIT='X')

                pr_result = {
                    'pr_number': pr_number,
                    'pr_item': '00010',
                    'material': material,
                    'plant': plant,
                    'quantity': quantity,
                    'delivery_date': delivery_date,
                    'status': 'SUCCESS',
                    'created_by': 'STOX_AI',
                    'created_at': datetime.now().isoformat(),
                    'tracking_number': pr_items[0]['TRACKINGNO']
                }

                self.logger.info(f"PR created: {pr_number} for {store_id}")
                return pr_result
            else:
                raise Exception("PR number not returned")

        except Exception as e:
            self.logger.error(f"PR creation failed: {e}")
            raise

    def get_stock_overview(self, material: str, plant: str) -> Dict:
        """
        Get comprehensive stock overview for material at plant

        Returns current, inbound, committed, available quantities
        """
        try:
            result = self.conn.call('BAPI_MATERIAL_STOCK_REQ_LIST',
                MATERIAL=material,
                PLANT=plant
            )

            stock_overview = {
                'material': material,
                'plant': plant,
                'unrestricted_stock': 0.0,
                'quality_inspection': 0.0,
                'blocked_stock': 0.0,
                'on_order': 0.0,
                'reserved': 0.0,
                'available': 0.0
            }

            # Parse stock data from BAPI response
            if 'STGE_LOC_STOCK' in result:
                for stock in result['STGE_LOC_STOCK']:
                    stock_overview['unrestricted_stock'] += float(stock.get('UNRES_STOCK', 0))
                    stock_overview['quality_inspection'] += float(stock.get('QUAL_INSP', 0))
                    stock_overview['blocked_stock'] += float(stock.get('BLOCKED', 0))

            stock_overview['available'] = (
                stock_overview['unrestricted_stock'] -
                stock_overview['reserved']
            )

            return stock_overview

        except Exception as e:
            self.logger.error(f"Stock overview failed: {e}")
            raise

    def close(self):
        """Close RFC connection"""
        self.conn.close()

# Usage Example
if __name__ == '__main__':
    config = {
        'user': 'STOX_AI',
        'passwd': 'secure_password',
        'ashost': 'sap.madison.com',
        'sysnr': '00',
        'client': '100'
    }

    bapi = StoxBAPIClient(config)

    try:
        # Scenario: Store-Chicago-001 needs replenishment
        # Step 1: Check ATP at DC-East
        atp = bapi.check_atp(
            material='MR_HAIR_101',
            plant='P001',
            required_qty=36.0,
            req_date='2025-11-05'
        )

        print(f"ATP Status: {atp['atp_status']}")
        print(f"Confirmed Qty: {atp['confirmed_qty']}")

        # Step 2: If ATP available, create PR
        if atp['atp_status'] == 'AVAILABLE':
            pr = bapi.create_purchase_requisition(
                store_id='Store-Chicago-001',
                material='MR_HAIR_101',
                plant='P001',
                quantity=36.0,
                delivery_date='2025-11-05'
            )

            print(f"PR Created: {pr['pr_number']}")
        else:
            print(f"ATP Shortage: {atp['shortage_qty']} units")

    finally:
        bapi.close()
```

#### Step 2: FastAPI Service Wrapper

```python
# stox_bapi_service.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

app = FastAPI(title="STOX.AI BAPI Service")
logger = logging.getLogger(__name__)

class ATPCheckRequest(BaseModel):
    material: str
    plant: str
    required_qty: float
    req_date: str

class PRCreateRequest(BaseModel):
    store_id: str
    material: str
    plant: str
    quantity: float
    delivery_date: str

@app.post("/api/v1/atp/check")
async def check_atp(request: ATPCheckRequest):
    """
    Check Available-to-Promise

    POST /api/v1/atp/check
    {
        "material": "MR_HAIR_101",
        "plant": "P001",
        "required_qty": 36.0,
        "req_date": "2025-11-05"
    }
    """
    try:
        bapi = StoxBAPIClient(get_sap_config())
        result = bapi.check_atp(
            material=request.material,
            plant=request.plant,
            required_qty=request.required_qty,
            req_date=request.req_date
        )
        bapi.close()
        return result
    except Exception as e:
        logger.error(f"ATP check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/pr/create")
async def create_pr(request: PRCreateRequest):
    """
    Create Purchase Requisition

    POST /api/v1/pr/create
    {
        "store_id": "Store-Chicago-001",
        "material": "MR_HAIR_101",
        "plant": "P001",
        "quantity": 36.0,
        "delivery_date": "2025-11-05"
    }
    """
    try:
        bapi = StoxBAPIClient(get_sap_config())
        result = bapi.create_purchase_requisition(
            store_id=request.store_id,
            material=request.material,
            plant=request.plant,
            quantity=request.quantity,
            delivery_date=request.delivery_date
        )
        bapi.close()
        return result
    except Exception as e:
        logger.error(f"PR creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

---

## Method 3: RabbitMQ Event Stream

### Use Case: Real-Time Transactional Events

**Best For**: Sales orders, purchase orders, goods movements - event-driven updates

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  SAP Application Server                                     │
│  ├─ Change Pointers (BD52, BD61)                            │
│  ├─ Event Linkages (SWEC, SWETYPV)                          │
│  └─ Custom Z-program (triggered on VBAP/EKPO changes)       │
└────────────────┬────────────────────────────────────────────┘
                 │ IDoc / Custom RFC
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  SAP Event Publisher (ABAP)                                 │
│  ├─ Detects table changes (VBAP, EKPO, VBBE)               │
│  ├─ Publishes to RabbitMQ exchange                          │
│  └─ Includes before/after values                            │
└────────────────┬────────────────────────────────────────────┘
                 │ AMQP Protocol
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  RabbitMQ Message Broker                                    │
│  ├─ Exchange: sap.events (topic)                            │
│  ├─ Queue: stox.sales_orders                                │
│  ├─ Queue: stox.purchase_orders                             │
│  └─ Queue: stox.commitments                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  STOX.AI Event Consumer (Node.js)                           │
│  ├─ Subscribes to queues                                    │
│  ├─ Processes events in real-time                           │
│  ├─ Updates PostgreSQL/Redis                                │
│  └─ Triggers replenishment logic                            │
└─────────────────────────────────────────────────────────────┘
```

### Implementation

#### Step 1: SAP ABAP Event Publisher

```abap
*&---------------------------------------------------------------------*
*& Report Z_STOX_RABBITMQ_PUBLISHER
*&---------------------------------------------------------------------*
*& Publish SAP events to RabbitMQ for STOX.AI real-time integration
*&---------------------------------------------------------------------*
REPORT z_stox_rabbitmq_publisher.

* RabbitMQ connection parameters
CONSTANTS: gc_rabbitmq_host TYPE string VALUE 'rabbitmq.madison.com',
           gc_rabbitmq_port TYPE string VALUE '5672',
           gc_rabbitmq_vhost TYPE string VALUE '/stox',
           gc_rabbitmq_user TYPE string VALUE 'stox_publisher',
           gc_rabbitmq_exchange TYPE string VALUE 'sap.events'.

* Change Pointer table for VBAP (Sales Order Items)
TABLES: vbap, cdhdr, cdpos.

* Event structure
TYPES: BEGIN OF ty_event,
         event_id TYPE string,
         event_type TYPE string,
         timestamp TYPE timestamp,
         table_name TYPE string,
         object_id TYPE string,
         change_type TYPE string,
         old_values TYPE string,
         new_values TYPE string,
       END OF ty_event.

DATA: lt_events TYPE TABLE OF ty_event,
      ls_event TYPE ty_event,
      lv_json TYPE string,
      lv_routing_key TYPE string.

*&---------------------------------------------------------------------*
*& Event: Sales Order Item Created/Changed
*&---------------------------------------------------------------------*
* Triggered when VBAP record changes
* Use Case: New sales order for Store-Chicago-001
*           → Push to RabbitMQ
*           → STOX.AI recalculates committed quantities
*&---------------------------------------------------------------------*
FORM publish_sales_order_event USING p_vbeln TYPE vbeln_va
                                      p_posnr TYPE posnr_va.

  DATA: lv_vbap TYPE vbap.

  " Get sales order item data
  SELECT SINGLE * FROM vbap INTO lv_vbap
    WHERE vbeln = p_vbeln
      AND posnr = p_posnr.

  IF sy-subrc = 0.
    " Build event payload
    CLEAR ls_event.
    ls_event-event_id = cl_system_uuid=>create_uuid_x16_static( ).
    ls_event-event_type = 'SALES_ORDER_ITEM_CHANGE'.
    GET TIME STAMP FIELD ls_event-timestamp.
    ls_event-table_name = 'VBAP'.
    ls_event-object_id = |{ lv_vbap-vbeln }-{ lv_vbap-posnr }|.
    ls_event-change_type = 'UPDATE'.

    " Serialize to JSON
    lv_json = /ui2/cl_json=>serialize(
      data = VALUE #(
        event_id = ls_event-event_id
        event_type = ls_event-event_type
        timestamp = ls_event-timestamp
        payload = VALUE #(
          sales_order = lv_vbap-vbeln
          item = lv_vbap-posnr
          material = lv_vbap-matnr
          plant = lv_vbap-werks
          order_qty = lv_vbap-kwmeng
          unit = lv_vbap-vrkme
          delivery_date = lv_vbap-edatu
          customer = lv_vbap-kunnr
        )
      )
      pretty_name = /ui2/cl_json=>pretty_mode-low_case
    ).

    " Publish to RabbitMQ
    lv_routing_key = 'sales.order.item.change'.
    PERFORM send_to_rabbitmq USING lv_json lv_routing_key.

  ENDIF.

ENDFORM.

*&---------------------------------------------------------------------*
*& Event: Purchase Order Item Created/Changed
*&---------------------------------------------------------------------*
* Triggered when EKPO record changes
* Use Case: New PO for DC-East inbound shipment
*           → Push to RabbitMQ
*           → STOX.AI updates "on_order" quantity
*&---------------------------------------------------------------------*
FORM publish_purchase_order_event USING p_ebeln TYPE ebeln
                                        p_ebelp TYPE ebelp.

  DATA: lv_ekpo TYPE ekpo.

  SELECT SINGLE * FROM ekpo INTO lv_ekpo
    WHERE ebeln = p_ebeln
      AND ebelp = p_ebelp.

  IF sy-subrc = 0.
    lv_json = /ui2/cl_json=>serialize(
      data = VALUE #(
        event_id = cl_system_uuid=>create_uuid_x16_static( )
        event_type = 'PURCHASE_ORDER_ITEM_CHANGE'
        timestamp = sy-datum && sy-uzeit
        payload = VALUE #(
          po_number = lv_ekpo-ebeln
          po_item = lv_ekpo-ebelp
          material = lv_ekpo-matnr
          plant = lv_ekpo-werks
          order_qty = lv_ekpo-menge
          unit = lv_ekpo-meins
          delivery_date = lv_ekpo-eindt
          vendor = lv_ekpo-lifnr
          net_price = lv_ekpo-netpr
        )
      )
      pretty_name = /ui2/cl_json=>pretty_mode-low_case
    ).

    lv_routing_key = 'purchase.order.item.change'.
    PERFORM send_to_rabbitmq USING lv_json lv_routing_key.
  ENDIF.

ENDFORM.

*&---------------------------------------------------------------------*
*& Send message to RabbitMQ
*&---------------------------------------------------------------------*
FORM send_to_rabbitmq USING p_message TYPE string
                            p_routing_key TYPE string.

  " Use HTTP REST API to publish to RabbitMQ
  " Alternative: Use AMQP library if available

  DATA: lo_http_client TYPE REF TO if_http_client,
        lv_url TYPE string,
        lv_response TYPE string,
        lv_status_code TYPE i.

  " Build RabbitMQ HTTP API URL
  lv_url = |http://{ gc_rabbitmq_host }:15672/api/exchanges/%2Fstox/{ gc_rabbitmq_exchange }/publish|.

  " Create HTTP client
  cl_http_client=>create_by_url(
    EXPORTING url = lv_url
    IMPORTING client = lo_http_client
  ).

  " Set authentication
  lo_http_client->authenticate(
    username = gc_rabbitmq_user
    password = 'secure_password'  " Store in secure parameter
  ).

  " Set headers
  lo_http_client->request->set_method( 'POST' ).
  lo_http_client->request->set_content_type( 'application/json' ).

  " Build publish payload
  DATA(lv_publish_body) = /ui2/cl_json=>serialize(
    data = VALUE #(
      routing_key = p_routing_key
      payload = p_message
      properties = VALUE #( delivery_mode = 2 )  " Persistent
    )
  ).

  lo_http_client->request->set_cdata( lv_publish_body ).

  " Send request
  lo_http_client->send( ).
  lo_http_client->receive( ).

  lv_status_code = lo_http_client->response->get_status( )-code.

  IF lv_status_code = 200 OR lv_status_code = 204.
    WRITE: / 'Event published to RabbitMQ:', p_routing_key.
  ELSE:
    WRITE: / 'Failed to publish event. Status:', lv_status_code.
  ENDIF.

  lo_http_client->close( ).

ENDFORM.

*&---------------------------------------------------------------------*
*& Event Linkage (SWEC)
*& Link to Business Object Events
*&---------------------------------------------------------------------*
* Transaction: SWEC
* Business Object: BUS2032 (Sales Order)
* Event: Changed
* Receiver Function Module: Z_STOX_EVENT_HANDLER

INITIALIZATION.
  " Register event handlers for real-time publishing
  " This runs on SAP application server as background job
  " Polls change pointers every 30 seconds

  WRITE: / 'STOX.AI RabbitMQ Publisher - Active'.
  WRITE: / 'Monitoring: VBAP, EKPO, VBBE for changes'.
```

#### Step 2: Node.js RabbitMQ Consumer

```javascript
// stox-rabbitmq-consumer.js
const amqp = require('amqplib');
const { Pool } = require('pg');
const Redis = require('redis');

class StoxRabbitMQConsumer {
  constructor(config) {
    this.rabbitUrl = config.rabbitMqUrl; // amqp://stox:pass@rabbitmq.madison.com:5672/stox
    this.db = new Pool(config.postgres);
    this.cache = Redis.createClient(config.redis);
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      // Connect to RabbitMQ
      this.connection = await amqp.connect(this.rabbitUrl);
      this.channel = await this.connection.createChannel();

      // Declare exchange
      await this.channel.assertExchange('sap.events', 'topic', { durable: true });

      // Declare queues
      await this.channel.assertQueue('stox.sales_orders', { durable: true });
      await this.channel.assertQueue('stox.purchase_orders', { durable: true });
      await this.channel.assertQueue('stox.commitments', { durable: true });

      // Bind queues to exchange
      await this.channel.bindQueue('stox.sales_orders', 'sap.events', 'sales.order.#');
      await this.channel.bindQueue('stox.purchase_orders', 'sap.events', 'purchase.order.#');
      await this.channel.bindQueue('stox.commitments', 'sap.events', 'commitment.#');

      console.log('✅ Connected to RabbitMQ');

      // Set prefetch count (process 10 messages at a time)
      await this.channel.prefetch(10);

    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * Consume sales order events
   *
   * Scenario: New order for Store-Chicago-001
   *           → Update committed quantities in real-time
   *           → Trigger replenishment check
   */
  async consumeSalesOrders() {
    await this.channel.consume('stox.sales_orders', async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          console.log('📦 Sales Order Event:', event.event_type);

          // Extract payload
          const { sales_order, item, material, plant, order_qty, delivery_date } = event.payload;

          // Update committed quantities in database
          await this.db.query(`
            INSERT INTO stox_committed_orders (
              sales_order, item, material, plant, committed_qty, delivery_date, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (sales_order, item)
            DO UPDATE SET
              committed_qty = $5,
              delivery_date = $6,
              updated_at = NOW()
          `, [sales_order, item, material, plant, order_qty, delivery_date]);

          // Update Redis cache (for real-time queries)
          const cacheKey = `committed:${plant}:${material}`;
          const currentCommitted = parseFloat(await this.cache.get(cacheKey) || 0);
          await this.cache.set(cacheKey, currentCommitted + parseFloat(order_qty));

          // Trigger replenishment check
          await this.checkReplenishmentNeeded(material, plant);

          // Acknowledge message
          this.channel.ack(msg);

        } catch (error) {
          console.error('Error processing sales order event:', error);
          // Negative acknowledge (requeue for retry)
          this.channel.nack(msg, false, true);
        }
      }
    });
  }

  /**
   * Consume purchase order events
   *
   * Scenario: New PO for DC-East inbound
   *           → Update on_order quantities
   *           → Recalculate available inventory
   */
  async consumePurchaseOrders() {
    await this.channel.consume('stox.purchase_orders', async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          console.log('🚚 Purchase Order Event:', event.event_type);

          const { po_number, po_item, material, plant, order_qty, delivery_date } = event.payload;

          // Update on_order quantities
          await this.db.query(`
            INSERT INTO stox_inbound_orders (
              po_number, po_item, material, plant, inbound_qty, delivery_date, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (po_number, po_item)
            DO UPDATE SET
              inbound_qty = $5,
              delivery_date = $6,
              updated_at = NOW()
          `, [po_number, po_item, material, plant, order_qty, delivery_date]);

          // Update Redis cache
          const cacheKey = `inbound:${plant}:${material}`;
          const currentInbound = parseFloat(await this.cache.get(cacheKey) || 0);
          await this.cache.set(cacheKey, currentInbound + parseFloat(order_qty));

          // Recalculate available inventory
          await this.recalculateAvailable(material, plant);

          this.channel.ack(msg);

        } catch (error) {
          console.error('Error processing purchase order event:', error);
          this.channel.nack(msg, false, true);
        }
      }
    });
  }

  /**
   * Check if replenishment is needed
   * Formula: If available < ROP, trigger order
   */
  async checkReplenishmentNeeded(material, plant) {
    const result = await this.db.query(`
      SELECT
        current_inventory,
        inbound_qty,
        committed_qty,
        reorder_point,
        target_inventory
      FROM stox_inventory_view
      WHERE material = $1 AND plant = $2
    `, [material, plant]);

    if (result.rows.length > 0) {
      const inv = result.rows[0];
      const available = inv.current_inventory + inv.inbound_qty - inv.committed_qty;

      if (available < inv.reorder_point) {
        console.log(`🚨 REPLENISHMENT NEEDED: ${material} @ ${plant}`);
        console.log(`   Available: ${available}, ROP: ${inv.reorder_point}`);

        // Publish event to trigger replenishment module
        await this.channel.publish(
          'stox.internal',
          'replenishment.trigger',
          Buffer.from(JSON.stringify({
            material,
            plant,
            available,
            reorder_point: inv.reorder_point,
            order_qty: inv.target_inventory - available
          }))
        );
      }
    }
  }

  /**
   * Recalculate available inventory
   */
  async recalculateAvailable(material, plant) {
    await this.db.query(`
      UPDATE stox_inventory_summary
      SET
        available = current_inventory + inbound_qty - committed_qty,
        health_pct = (current_inventory + inbound_qty - committed_qty) / target_inventory * 100,
        updated_at = NOW()
      WHERE material = $1 AND plant = $2
    `, [material, plant]);

    console.log(`✅ Recalculated available for ${material} @ ${plant}`);
  }

  async start() {
    await this.connect();
    await this.consumeSalesOrders();
    await this.consumePurchaseOrders();
    console.log('🎧 STOX.AI RabbitMQ Consumer - Listening for events...');
  }

  async close() {
    await this.channel.close();
    await this.connection.close();
    await this.db.end();
    await this.cache.quit();
  }
}

// Usage
const consumer = new StoxRabbitMQConsumer({
  rabbitMqUrl: 'amqp://stox:password@rabbitmq.madison.com:5672/stox',
  postgres: {
    host: 'localhost',
    database: 'stox_ai',
    user: 'stox',
    password: process.env.DB_PASSWORD
  },
  redis: {
    host: 'localhost',
    port: 6379
  }
});

consumer.start();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down consumer...');
  await consumer.close();
  process.exit(0);
});
```

#### Step 3: Create Database Tables

```sql
-- Tables for real-time event processing
CREATE TABLE stox_committed_orders (
  id SERIAL PRIMARY KEY,
  sales_order VARCHAR(10),
  item VARCHAR(6),
  material VARCHAR(18),
  plant VARCHAR(4),
  committed_qty DECIMAL(13,3),
  delivery_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sales_order, item)
);

CREATE TABLE stox_inbound_orders (
  id SERIAL PRIMARY KEY,
  po_number VARCHAR(10),
  po_item VARCHAR(5),
  material VARCHAR(18),
  plant VARCHAR(4),
  inbound_qty DECIMAL(13,3),
  delivery_date DATE,
  goods_received BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(po_number, po_item)
);

-- Real-time inventory view
CREATE OR REPLACE VIEW stox_inventory_view AS
SELECT
  m.material,
  m.plant,
  m.current_inventory,
  COALESCE(SUM(i.inbound_qty), 0) as inbound_qty,
  COALESCE(SUM(c.committed_qty), 0) as committed_qty,
  m.current_inventory + COALESCE(SUM(i.inbound_qty), 0) - COALESCE(SUM(c.committed_qty), 0) as available,
  m.reorder_point,
  m.target_inventory,
  CASE
    WHEN m.current_inventory + COALESCE(SUM(i.inbound_qty), 0) - COALESCE(SUM(c.committed_qty), 0) < m.reorder_point
    THEN 'BELOW_ROP'
    ELSE 'OK'
  END as status
FROM stox_inventory_master m
  LEFT JOIN stox_inbound_orders i ON m.material = i.material AND m.plant = i.plant AND i.goods_received = FALSE
  LEFT JOIN stox_committed_orders c ON m.material = c.material AND m.plant = c.plant
GROUP BY m.material, m.plant, m.current_inventory, m.reorder_point, m.target_inventory;
```

---

## Method 4: File-Based Integration

### Use Case: Bulk Data Loads & Historical Data

**Best For**: Nightly batch loads, forecasts, historical analysis

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  SAP Application Server (AL11 - File System)               │
│  ├─ /sap/interface/stox/outbound/                           │
│  │  ├─ MARA_YYYYMMDD.csv (materials extract)               │
│  │  ├─ MARD_YYYYMMDD.csv (inventory snapshot)              │
│  │  ├─ VBAP_YYYYMMDD.csv (sales orders)                    │
│  │  └─ EKPO_YYYYMMDD.csv (purchase orders)                 │
│  └─ /sap/interface/stox/inbound/                            │
│     └─ STOX_FORECAST_YYYYMMDD.csv (ML forecasts)           │
└────────────────┬────────────────────────────────────────────┘
                 │ SFTP / NFS Mount
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  File Transfer Zone (DMZ)                                   │
│  ├─ Virus scanning                                          │
│  ├─ File validation                                         │
│  └─ Audit logging                                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  STOX.AI File Processor (Python)                            │
│  ├─ Watches /incoming directory                             │
│  ├─ Validates CSV structure                                 │
│  ├─ Loads to PostgreSQL staging                             │
│  ├─ Data quality checks                                     │
│  └─ Moves to /processed or /error                           │
└─────────────────────────────────────────────────────────────┘
```

### Implementation

#### Step 1: ABAP Extract Program

```abap
*&---------------------------------------------------------------------*
*& Report Z_STOX_EXTRACT_INVENTORY
*&---------------------------------------------------------------------*
*& Extract inventory data (MARD) to CSV for STOX.AI
*& Schedule: Daily @ 2:00 AM
*&---------------------------------------------------------------------*
REPORT z_stox_extract_inventory.

PARAMETERS: p_werks TYPE werks_d DEFAULT 'P001',  " Plant
            p_date TYPE datum DEFAULT sy-datum.     " Extract date

DATA: lv_filename TYPE string,
      lv_path TYPE string,
      lt_mard TYPE TABLE OF mard,
      lv_line TYPE string,
      lv_file TYPE REF TO cl_abap_conv_out_ce.

" Build filename: MARD_P001_20251027.csv
CONCATENATE 'MARD' p_werks p_date INTO lv_filename SEPARATED BY '_'.
CONCATENATE lv_filename '.csv' INTO lv_filename.
lv_path = |/sap/interface/stox/outbound/{ lv_filename }|.

" Extract inventory data
SELECT * FROM mard INTO TABLE lt_mard
  WHERE werks = p_werks
    AND labst > 0  " Only non-zero stock
  ORDER BY matnr, lgort.

IF sy-subrc = 0.
  " Open file for writing
  OPEN DATASET lv_path FOR OUTPUT IN TEXT MODE ENCODING UTF-8.

  IF sy-subrc = 0.
    " Write CSV header
    lv_line = 'MANDT,MATNR,WERKS,LGORT,LABST,EINME,SPEME,KLABS,KINSM,UMLME'.
    TRANSFER lv_line TO lv_path.

    " Write data rows
    LOOP AT lt_mard INTO DATA(ls_mard).
      CONCATENATE ls_mard-mandt
                  ls_mard-matnr
                  ls_mard-werks
                  ls_mard-lgort
                  ls_mard-labst
                  ls_mard-einme
                  ls_mard-speme
                  ls_mard-klabs
                  ls_mard-kinsm
                  ls_mard-umlme
        INTO lv_line SEPARATED BY ','.

      TRANSFER lv_line TO lv_path.
    ENDLOOP.

    CLOSE DATASET lv_path.

    WRITE: / 'Extract completed:', lv_filename.
    WRITE: / 'Records:', lines( lt_mard ).

    " Log extract to control table
    INSERT INTO zstox_extract_log VALUES (
      extract_id = cl_system_uuid=>create_uuid_x16_static( )
      extract_date = sy-datum
      extract_time = sy-uzeit
      table_name = 'MARD'
      filename = lv_filename
      record_count = lines( lt_mard )
      status = 'SUCCESS'
    ).
    COMMIT WORK.

  ELSE.
    WRITE: / 'Failed to open file:', lv_path.
  ENDIF.

ELSE.
  WRITE: / 'No data found for plant:', p_werks.
ENDIF.
```

#### Step 2: Python File Processor

```python
# stox_file_processor.py
import pandas as pd
import os
import shutil
from pathlib import Path
from datetime import datetime
import psycopg2
from psycopg2.extras import execute_batch
import logging

class StoxFileProcessor:
    """
    Process SAP extract files for STOX.AI
    """

    def __init__(self, config):
        self.incoming_dir = Path(config['incoming_dir'])
        self.processed_dir = Path(config['processed_dir'])
        self.error_dir = Path(config['error_dir'])
        self.db_conn = psycopg2.connect(**config['postgres'])
        self.logger = logging.getLogger(__name__)

    def process_mard_file(self, filepath: Path):
        """
        Process MARD (inventory) extract file

        Scenario: Nightly inventory snapshot for all stores
                  File: MARD_P001_20251027.csv
        """
        try:
            self.logger.info(f"Processing {filepath.name}")

            # Read CSV
            df = pd.read_csv(filepath, dtype={
                'MANDT': str,
                'MATNR': str,
                'WERKS': str,
                'LGORT': str,
                'LABST': float,
                'EINME': float,
                'SPEME': float
            })

            # Data validation
            if df['LABST'].isnull().any():
                raise ValueError("NULL values found in LABST column")

            if not df['WERKS'].isin(['P001', 'P002']).all():
                raise ValueError("Invalid plant codes found")

            # Load to PostgreSQL
            cursor = self.db_conn.cursor()

            # Truncate staging table
            cursor.execute("TRUNCATE TABLE stg_sap_mard")

            # Bulk insert
            records = df.to_dict('records')
            execute_batch(cursor, """
                INSERT INTO stg_sap_mard (
                    mandt, matnr, werks, lgort, labst, einme, speme,
                    extract_date, loaded_at
                ) VALUES (
                    %(MANDT)s, %(MATNR)s, %(WERKS)s, %(LGORT)s,
                    %(LABST)s, %(EINME)s, %(SPEME)s,
                    CURRENT_DATE, CURRENT_TIMESTAMP
                )
            """, records, page_size=1000)

            self.db_conn.commit()
            cursor.close()

            self.logger.info(f"Loaded {len(df)} inventory records")

            # Move to processed
            shutil.move(str(filepath),
                       str(self.processed_dir / filepath.name))

            return {
                'status': 'SUCCESS',
                'filename': filepath.name,
                'records_loaded': len(df),
                'processed_at': datetime.now().isoformat()
            }

        except Exception as e:
            self.logger.error(f"Failed to process {filepath}: {e}")

            # Move to error directory
            shutil.move(str(filepath),
                       str(self.error_dir / filepath.name))

            return {
                'status': 'ERROR',
                'filename': filepath.name,
                'error': str(e),
                'processed_at': datetime.now().isoformat()
            }

    def process_forecast_file(self, filepath: Path):
        """
        Process STOX.AI forecast file for upload to SAP

        Scenario: Daily ML forecast upload
                  File: STOX_FORECAST_20251027.csv
                  → Validates data
                  → Loads to PBED staging
                  → Triggers SAP upload via BAPI
        """
        try:
            self.logger.info(f"Processing forecast file: {filepath.name}")

            # Read forecast CSV
            df = pd.read_csv(filepath, dtype={
                'material': str,
                'plant': str,
                'forecast_date': str,
                'daily_forecast': float,
                'confidence': float
            })

            # Validate forecasts
            if df['daily_forecast'].min() < 0:
                raise ValueError("Negative forecast values found")

            if not df['forecast_date'].str.match(r'\d{4}-\d{2}-\d{2}').all():
                raise ValueError("Invalid date format (expected YYYY-MM-DD)")

            # Load to forecast staging table
            cursor = self.db_conn.cursor()

            records = df.to_dict('records')
            execute_batch(cursor, """
                INSERT INTO stg_stox_forecast (
                    material, plant, forecast_date, daily_forecast, confidence, uploaded_at
                ) VALUES (
                    %(material)s, %(plant)s, %(forecast_date)s,
                    %(daily_forecast)s, %(confidence)s, CURRENT_TIMESTAMP
                )
                ON CONFLICT (material, plant, forecast_date)
                DO UPDATE SET
                    daily_forecast = EXCLUDED.daily_forecast,
                    confidence = EXCLUDED.confidence,
                    uploaded_at = CURRENT_TIMESTAMP
            """, records, page_size=1000)

            self.db_conn.commit()
            cursor.close()

            self.logger.info(f"Loaded {len(df)} forecast records")

            # TODO: Trigger SAP BAPI upload
            # Call BAPI_REQUIREMENT_CREATE with forecast data

            # Move to processed
            shutil.move(str(filepath),
                       str(self.processed_dir / filepath.name))

            return {
                'status': 'SUCCESS',
                'filename': filepath.name,
                'records_loaded': len(df)
            }

        except Exception as e:
            self.logger.error(f"Failed to process forecast: {e}")
            shutil.move(str(filepath),
                       str(self.error_dir / filepath.name))
            return {'status': 'ERROR', 'error': str(e)}

    def watch_and_process(self):
        """
        Watch incoming directory and process files as they arrive
        """
        from watchdog.observers import Observer
        from watchdog.events import FileSystemEventHandler

        class FileHandler(FileSystemEventHandler):
            def __init__(self, processor):
                self.processor = processor

            def on_created(self, event):
                if event.is_directory:
                    return

                filepath = Path(event.src_path)

                # Wait for file to be fully written
                import time
                time.sleep(2)

                # Route to appropriate processor
                if filepath.name.startswith('MARD_'):
                    self.processor.process_mard_file(filepath)
                elif filepath.name.startswith('STOX_FORECAST_'):
                    self.processor.process_forecast_file(filepath)
                else:
                    self.processor.logger.warning(f"Unknown file type: {filepath.name}")

        observer = Observer()
        observer.schedule(FileHandler(self), str(self.incoming_dir), recursive=False)
        observer.start()

        self.logger.info(f"Watching directory: {self.incoming_dir}")

        try:
            while True:
                import time
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()

        observer.join()

# Usage
if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    processor = StoxFileProcessor({
        'incoming_dir': '/mnt/sap_interface/stox/incoming',
        'processed_dir': '/mnt/sap_interface/stox/processed',
        'error_dir': '/mnt/sap_interface/stox/error',
        'postgres': {
            'host': 'localhost',
            'database': 'stox_ai',
            'user': 'stox',
            'password': os.getenv('DB_PASSWORD')
        }
    })

    # Start watching for files
    processor.watch_and_process()
```

---

## Hybrid Architecture

### Recommended Integration Strategy

```
┌───────────────────────────────────────────────────────────────────┐
│                    STOX.AI Data Integration Layer                 │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   OData     │  │    BAPI     │  │  RabbitMQ   │  │  Files  │ │
│  │  (Hourly)   │  │  (Real-time)│  │ (Real-time) │  │ (Daily) │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬────┘ │
│         │                │                │               │      │
│         ▼                ▼                ▼               ▼      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            PostgreSQL (Staging Tables)                   │   │
│  │  ├─ stg_sap_mard (inventory snapshots)                   │   │
│  │  ├─ stg_sap_vbap (sales orders)                          │   │
│  │  ├─ stg_sap_ekpo (purchase orders)                       │   │
│  │  └─ stg_sap_vbbe (commitments)                           │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Data Transformation & Aggregation                │   │
│  │  ├─ Deduplicate records                                  │   │
│  │  ├─ Calculate Available = Current + Inbound - Committed  │   │
│  │  ├─ Aggregate store → DC level                           │   │
│  │  └─ Apply business rules                                 │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │       STOX.AI Operational Data Store (PostgreSQL)        │   │
│  │  ├─ stox_inventory_master                                │   │
│  │  ├─ stox_committed_orders                                │   │
│  │  ├─ stox_inbound_orders                                  │   │
│  │  └─ stox_forecasts                                       │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Redis Cache (Real-Time Queries)               │   │
│  │  ├─ Key: inv:{plant}:{material} → current_stock         │   │
│  │  ├─ Key: committed:{plant}:{material} → committed_qty   │   │
│  │  └─ TTL: 5 minutes                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│              STOX.AI Store Replenishment Module                   │
│  ├─ Reads from operational data store                             │
│  ├─ Calculates ROP/EOQ/Safety Stock                               │
│  ├─ Generates replenishment recommendations                       │
│  └─ Writes back to SAP via BAPI (Purchase Requisitions)           │
└───────────────────────────────────────────────────────────────────┘
```

### Data Flow Matrix

| Data Type | Source | Method | Frequency | Latency | Use In STOX.AI |
|-----------|--------|--------|-----------|---------|----------------|
| **Inventory Levels** | MARD | OData | Hourly | 5-10 min | Current Stock Calc |
| **Material Master** | MARA, MARC | File | Daily | 24 hours | Product Info |
| **Sales Orders (New)** | VBAP | RabbitMQ | Real-time | < 1 min | Committed Qty |
| **Purchase Orders (New)** | EKPO | RabbitMQ | Real-time | < 1 min | Inbound Qty |
| **ATP Check** | - | BAPI | On-demand | < 1 sec | Order Validation |
| **Create PR** | EBAN | BAPI | On-demand | < 2 sec | Replenishment |
| **Forecasts (Upload)** | PBED | File | Daily | 1 hour | MRP Planning |

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up PostgreSQL staging tables
- [ ] Configure Redis cache
- [ ] Deploy RabbitMQ broker
- [ ] Create SAP service account (STOX_AI)
- [ ] Set up SFTP/file share for file exchange

### Phase 2: OData Integration (Week 3-4)
- [ ] Implement Node.js OData connector
- [ ] Schedule hourly inventory extracts
- [ ] Build data validation layer
- [ ] Test with DC-East (P001) first

### Phase 3: BAPI Integration (Week 5-6)
- [ ] Build Python BAPI client (PyRFC)
- [ ] Implement ATP check function
- [ ] Implement PR creation function
- [ ] Deploy FastAPI service wrapper
- [ ] Load test (100 req/sec)

### Phase 4: RabbitMQ Event Streaming (Week 7-9)
- [ ] Develop ABAP event publisher (Z-program)
- [ ] Configure SAP change pointers (VBAP, EKPO)
- [ ] Build Node.js event consumer
- [ ] Test end-to-end real-time flow
- [ ] Set up monitoring & alerting

### Phase 5: File Integration (Week 10-11)
- [ ] Create ABAP extract programs (MARD, MARC, etc.)
- [ ] Build Python file processor
- [ ] Schedule nightly batch jobs
- [ ] Implement error handling & retry logic

### Phase 6: Testing & Go-Live (Week 12-14)
- [ ] Integration testing with all 12 stores
- [ ] Performance testing (10k orders/hour)
- [ ] Failover & disaster recovery testing
- [ ] User acceptance testing
- [ ] Production cutover

---

## Monitoring & Observability

### Key Metrics to Track

```javascript
// Example: Monitoring dashboard metrics
const metrics = {
  odata: {
    requests_per_hour: 60,
    avg_response_time_ms: 1200,
    error_rate: 0.01,  // 1%
    cache_hit_rate: 0.85  // 85%
  },
  bapi: {
    atp_checks_per_hour: 150,
    pr_created_per_hour: 45,
    avg_response_time_ms: 800,
    error_rate: 0.02
  },
  rabbitmq: {
    messages_per_second: 12,
    queue_depth: 50,
    consumer_lag_seconds: 2,
    message_ack_rate: 0.99
  },
  files: {
    files_processed_today: 8,
    records_processed_today: 45000,
    failed_files_today: 0,
    avg_processing_time_sec: 45
  }
};
```

---

## Error Handling Strategy

### Retry Logic

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
def call_sap_bapi_with_retry(bapi_name, **params):
    """
    Retry BAPI calls with exponential backoff
    - Attempt 1: Immediate
    - Attempt 2: Wait 4 seconds
    - Attempt 3: Wait 8 seconds
    """
    return sap_client.call(bapi_name, **params)
```

### Circuit Breaker

```javascript
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000, // 3 seconds
  errorThresholdPercentage: 50,
  resetTimeout: 30000 // 30 seconds
};

const breaker = new CircuitBreaker(callSAPOData, options);

breaker.on('open', () => {
  console.error('Circuit breaker OPEN - SAP OData unavailable');
  // Fallback to cached data
});
```

---

## Security Considerations

### Authentication & Authorization

```python
# Credential management
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential

# Retrieve SAP credentials from Azure Key Vault
credential = DefaultAzureCredential()
client = SecretClient(vault_url="https://stox-keyvault.vault.azure.net/", credential=credential)

sap_user = client.get_secret("SAP-STOX-USER").value
sap_pass = client.get_secret("SAP-STOX-PASSWORD").value
```

### Data Encryption

- **In Transit**: TLS 1.3 for all API calls
- **At Rest**: PostgreSQL encryption, RabbitMQ disk encryption
- **Secrets**: Azure Key Vault / AWS Secrets Manager

### Audit Logging

```sql
-- Audit table for all SAP operations
CREATE TABLE stox_sap_audit_log (
  id SERIAL PRIMARY KEY,
  operation_type VARCHAR(50),  -- 'ATP_CHECK', 'PR_CREATE', 'DATA_EXTRACT'
  user_id VARCHAR(50),
  sap_transaction VARCHAR(10),
  request_payload TEXT,
  response_payload TEXT,
  status VARCHAR(20),  -- 'SUCCESS', 'ERROR'
  error_message TEXT,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_operation ON stox_sap_audit_log(operation_type, executed_at);
```

---

## 📁 File Deliverables

All code samples available in:
```
/db/integration/
├── odata/
│   └── stox-odata-connector.js
├── bapi/
│   ├── stox_bapi_client.py
│   └── stox_bapi_service.py
├── rabbitmq/
│   ├── z_stox_rabbitmq_publisher.abap
│   └── stox-rabbitmq-consumer.js
├── files/
│   ├── z_stox_extract_inventory.abap
│   └── stox_file_processor.py
└── README.md
```

---

## ✅ Decision Matrix

| Criteria | OData | BAPI | RabbitMQ | Files |
|----------|-------|------|----------|-------|
| **Real-time** | ⚠️ Near real-time | ✅ Yes | ✅ Yes | ❌ Batch only |
| **Complexity** | 🟢 Low | 🟡 Medium | 🔴 High | 🟢 Low |
| **SAP Load** | 🟡 Medium | 🔴 High | 🟢 Low | 🟢 Low |
| **Reliability** | ✅ High | ✅ High | 🟡 Medium | ✅ High |
| **Best For** | Periodic queries | Transactions | Events | Bulk data |

---

**Status**: ✅ Ready for implementation - Complete integration architecture for STOX.AI Store Replenishment flow.
