# SAP OData Integration Plan - Mantrix Unified DI

## Overview

This document outlines the plan to integrate SAP OData services with the Mantrix Unified DI platform, enabling bidirectional data synchronization between SAP ERP and the analytics platform.

---

## Current SAP OData Capabilities (From Documentation)

### Existing Implementation
- **OData Service**: `ZS0_UPDATE_DEMO_SRV`
- **Entity Set**: `SALESORDERSet`
- **SAP Table**: `ZSALES_ORDER`
- **SAP Gateway**: `/OSEGW` and `/OSE16N`
- **Base URL**: `http://96.79.18.154:8000/sap/opu/odata/SAP/ZS0_UPDATE_DEMO_SRV/`

### Supported Operations

#### 1. Single Row Update (PUT)
**Endpoint**: `/SALESORDERSet('10002')`

**Payload Example**:
```json
{
  "Status": "APPROVED",
  "Remarks": "Order confirmed by customer"
}
```

**Authentication**: CSRF token-based
1. Send HEAD request with header `X-CSRF-Token: fetch`
2. Extract token from response
3. Send PUT request with token in header

---

#### 2. Mass Update (Batch Processing)
**Endpoint**: `/$batch`

**Payload Format**:
```
--batch_123
Content-Type: multipart/mixed; boundary=changeset_1

--changeset_1
Content-Type: application/http
Content-Transfer-Encoding: binary

PATCH SALESORDERSet('10001') HTTP/1.1
Content-Type: application/json

{
  "Status": "APPROVED",
  "Remarks": "Confirmed by customer"
}

--changeset_1--
--batch_123
Content-Type: multipart/mixed; boundary=changeset_2

--changeset_2
Content-Type: application/http
Content-Transfer-Encoding: binary

PATCH SALESORDERSet('10002') HTTP/1.1
Content-Type: application/json

{
  "Status": "REJECTED",
  "Remarks": "Out of stock"
}

--changeset_2--
--batch_123--
```

**Headers Required**:
- `X-CSRF-Token`: [token from initial fetch]
- `Content-Type`: `multipart/mixed; boundary=batch_123`

---

## Integration Architecture

### Components to Build

```
┌─────────────────────────────────────────────────────────────┐
│                    Mantrix Frontend                         │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ SAP Sync UI      │  │ Data Validation  │                │
│  │ - Manual Trigger │  │ - Pre-sync Check │                │
│  │ - Schedule Config│  │ - Error Display  │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 Mantrix Backend (FastAPI)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SAP OData Service Layer                 │  │
│  │  - CSRF Token Management                             │  │
│  │  - Connection Pool                                   │  │
│  │  - Retry Logic                                       │  │
│  │  - Rate Limiting                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Data Transformation Layer                  │  │
│  │  - PostgreSQL → SAP Mapping                          │  │
│  │  - BigQuery → SAP Mapping                            │  │
│  │  - Field Validation                                  │  │
│  │  - Business Rules                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Sync Scheduler                          │  │
│  │  - Scheduled Jobs (Airflow/APScheduler)              │  │
│  │  - Manual Triggers                                   │  │
│  │  - Incremental Sync                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     SAP Gateway                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  OData Services                                      │  │
│  │  - ZS0_UPDATE_DEMO_SRV (Sales Orders)                │  │
│  │  - Future: Material Master, Inventory, Customers     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SAP Tables                                          │  │
│  │  - ZSALES_ORDER                                      │  │
│  │  - MARA (Material Master)                            │  │
│  │  - KNA1 (Customer Master)                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Core SAP OData Client (Week 1-2)

**Objective**: Build reusable SAP OData client library

**Tasks**:
1. **Create SAP OData Client** (`backend/src/integrations/sap_odata_client.py`)
   - CSRF token fetching and caching
   - Connection pooling
   - Automatic retry with exponential backoff
   - Error handling and logging

2. **Configuration Management** (`backend/src/config.py`)
   ```python
   # SAP OData Configuration
   sap_odata_base_url: str = "http://96.79.18.154:8000/sap/opu/odata/SAP"
   sap_odata_service: str = "ZS0_UPDATE_DEMO_SRV"
   sap_username: str
   sap_password: str
   sap_client: str = "100"  # SAP client number
   sap_language: str = "EN"
   sap_timeout: int = 30
   sap_max_batch_size: int = 100
   ```

3. **Database Schema** - Add to PostgreSQL:
   ```sql
   CREATE TABLE sap_sync_log (
       id SERIAL PRIMARY KEY,
       sync_type VARCHAR(50),  -- 'sales_order', 'material', 'customer'
       sync_direction VARCHAR(10),  -- 'to_sap', 'from_sap'
       status VARCHAR(20),  -- 'pending', 'success', 'failed'
       records_processed INTEGER,
       records_failed INTEGER,
       error_message TEXT,
       started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       completed_at TIMESTAMP
   );

   CREATE TABLE sap_sync_errors (
       id SERIAL PRIMARY KEY,
       sync_log_id INTEGER REFERENCES sap_sync_log(id),
       record_identifier VARCHAR(255),
       error_type VARCHAR(100),
       error_message TEXT,
       payload JSONB,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE sap_entity_mapping (
       id SERIAL PRIMARY KEY,
       entity_type VARCHAR(50),  -- 'sales_order', 'material', 'customer'
       local_field VARCHAR(100),
       sap_field VARCHAR(100),
       field_type VARCHAR(50),
       transformation_rule VARCHAR(255),
       is_required BOOLEAN DEFAULT false,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

**Deliverables**:
- `SAPODataClient` class with methods:
  - `get_csrf_token()`
  - `get(entity_set, key=None, filters=None)`
  - `create(entity_set, data)`
  - `update(entity_set, key, data)`
  - `delete(entity_set, key)`
  - `batch_update(entity_set, records)`
- Unit tests
- Configuration documented

---

### Phase 2: Sales Order Synchronization (Week 3-4)

**Objective**: Enable bidirectional sales order sync

**Data Flow**:

#### From Mantrix → SAP (Status Updates)
When orders are approved/rejected in Mantrix analytics:

**Source**: `transaction_data` table
**Target**: SAP `ZSALES_ORDER` table via `SALESORDERSet`

**Mapping**:
| Mantrix Field | SAP Field | Transformation |
|---------------|-----------|----------------|
| order_number | SO_ID | Direct mapping |
| order_status | Status | Map to SAP status codes |
| approval_remarks | Remarks | Direct mapping |
| updated_by | UpdatedBy | User ID |
| updated_at | UpdatedAt | Timestamp |

**Implementation**:
```python
# backend/src/integrations/sap_sales_order_sync.py

class SAPSalesOrderSync:
    def __init__(self):
        self.sap_client = SAPODataClient()
        self.pg_client = PostgreSQLClient()

    async def sync_order_status_to_sap(self, order_numbers: List[str]):
        """
        Push order status updates from Mantrix to SAP
        """
        # 1. Fetch orders from transaction_data
        orders = self.pg_client.execute_query(
            "SELECT order_number, order_status, approval_remarks "
            "FROM transaction_data WHERE order_number = ANY(%s)",
            (order_numbers,)
        )

        # 2. Transform to SAP format
        sap_updates = []
        for order in orders:
            sap_updates.append({
                'SO_ID': order['order_number'],
                'Status': self._map_status(order['order_status']),
                'Remarks': order['approval_remarks']
            })

        # 3. Send batch update to SAP
        result = await self.sap_client.batch_update(
            'SALESORDERSet',
            sap_updates
        )

        # 4. Log results
        self._log_sync(result)

        return result
```

#### From SAP → Mantrix (Order Data)
Periodic fetch of order data from SAP:

**Source**: SAP `ZSALES_ORDER` via OData
**Target**: `transaction_data` and related tables

**Schedule**: Every 15 minutes (configurable)

---

### Phase 3: Material Master Sync (Week 5-6)

**Objective**: Sync material/product data

**New OData Service Required** (SAP team):
- Service: `ZMATERIAL_MASTER_SRV`
- Entity: `MaterialSet`
- Base table: `MARA`, `MAKT`

**Mapping**:
| Mantrix Table | Mantrix Field | SAP Table | SAP Field |
|---------------|---------------|-----------|-----------|
| stox_material_master | material_number | MARA | MATNR |
| stox_material_master | material_description | MAKT | MAKTX |
| stox_material_master | unit_cost | MBEW | STPRS |
| stox_material_master | lead_time_days | MARC | WEBAZ |

**Sync Direction**: Primarily SAP → Mantrix (master data)

---

### Phase 4: Customer Master Sync (Week 7-8)

**New OData Service Required**:
- Service: `ZCUSTOMER_MASTER_SRV`
- Entity: `CustomerSet`
- Base table: `KNA1`, `KNVV`

**Mapping**:
| Mantrix Table | SAP Table | Purpose |
|---------------|-----------|---------|
| customer_master | KNA1 | Customer basic data |
| customer_master | KNVV | Sales area data |

---

### Phase 5: Advanced Features (Week 9-12)

#### 5.1 Real-time Webhooks (if SAP supports)
- SAP sends events when orders change
- Mantrix listens and updates in real-time

#### 5.2 Conflict Resolution
- Detect concurrent updates
- User-configurable resolution rules
- Manual review queue for conflicts

#### 5.3 Data Validation Rules
- Pre-sync validation
- SAP business rules enforcement
- Field-level validation

#### 5.4 Monitoring Dashboard
- Sync status monitoring
- Error rate tracking
- Data quality metrics
- Performance metrics (sync duration, throughput)

---

## Technical Specifications

### API Endpoints to Create

```python
# backend/src/api/sap_routes.py

@router.post("/sap/sync/sales-orders")
async def sync_sales_orders_to_sap(
    order_numbers: List[str],
    sync_mode: str = "batch"  # 'batch' or 'individual'
):
    """Sync specific sales orders to SAP"""
    pass

@router.get("/sap/sync/status/{sync_id}")
async def get_sync_status(sync_id: int):
    """Get status of a sync job"""
    pass

@router.get("/sap/sync/logs")
async def get_sync_logs(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None
):
    """Get sync history with pagination"""
    pass

@router.post("/sap/sync/schedule")
async def configure_sync_schedule(
    entity_type: str,
    frequency: str,  # 'hourly', 'daily', 'weekly'
    enabled: bool = True
):
    """Configure automated sync schedule"""
    pass

@router.get("/sap/entities/{entity_type}/{entity_id}")
async def get_sap_entity(
    entity_type: str,
    entity_id: str
):
    """Fetch single entity from SAP"""
    pass
```

---

## Configuration Files

### Environment Variables (.env)
```bash
# SAP OData Configuration
SAP_ODATA_BASE_URL=http://96.79.18.154:8000/sap/opu/odata/SAP
SAP_ODATA_SERVICE=ZS0_UPDATE_DEMO_SRV
SAP_USERNAME=<username>
SAP_PASSWORD=<password>
SAP_CLIENT=100
SAP_LANGUAGE=EN
SAP_TIMEOUT=30
SAP_MAX_BATCH_SIZE=100
SAP_RETRY_ATTEMPTS=3
SAP_RETRY_DELAY=2

# Sync Configuration
SAP_SYNC_ENABLED=true
SAP_SYNC_INTERVAL_MINUTES=15
SAP_SYNC_BATCH_SIZE=500
```

### Sync Configuration (YAML)
```yaml
# backend/configs/sap_sync_config.yaml

sales_orders:
  enabled: true
  direction: bidirectional
  schedule: "*/15 * * * *"  # Every 15 minutes
  batch_size: 100
  fields:
    - local: order_number
      sap: SO_ID
      required: true
    - local: order_status
      sap: Status
      transform: status_mapping
    - local: approval_remarks
      sap: Remarks

materials:
  enabled: false
  direction: from_sap
  schedule: "0 2 * * *"  # Daily at 2 AM
  batch_size: 1000

customers:
  enabled: false
  direction: from_sap
  schedule: "0 3 * * *"  # Daily at 3 AM
```

---

## Error Handling Strategy

### Error Types
1. **Network Errors**: Connection timeout, DNS failure
2. **Authentication Errors**: Invalid credentials, expired token
3. **Validation Errors**: Invalid data format, missing required fields
4. **Business Logic Errors**: SAP-side business rule violations
5. **Conflict Errors**: Concurrent modification

### Retry Strategy
```python
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(requests.exceptions.RequestException)
)
def _make_sap_request(self, method, endpoint, data=None):
    pass
```

### Error Logging
- All errors logged to `sap_sync_errors` table
- Critical errors trigger alerts (email, Slack, etc.)
- Error dashboard in UI for troubleshooting

---

## Security Considerations

### 1. Credential Management
- Store SAP credentials in environment variables (not code)
- Use secret management service (GCP Secret Manager, AWS Secrets Manager)
- Rotate credentials regularly

### 2. Network Security
- Use VPN or private network for SAP connection
- Whitelist Mantrix server IPs in SAP firewall
- Use HTTPS for all OData calls (if SAP supports)

### 3. Data Privacy
- Encrypt sensitive data in transit and at rest
- Implement role-based access for SAP sync
- Audit all sync operations

### 4. Rate Limiting
- Respect SAP system limits
- Implement backoff on rate limit errors
- Configure max concurrent requests

---

## Testing Strategy

### Unit Tests
- Test each SAP client method
- Mock SAP responses
- Test error handling

### Integration Tests
- Test against SAP sandbox/dev system
- Test full sync workflows
- Test error scenarios

### Performance Tests
- Test batch update with 1000+ records
- Measure sync duration
- Stress test SAP connection pool

### UAT Scenarios
1. Approve order in Mantrix → Verify in SAP
2. Reject order in Mantrix → Verify in SAP
3. Update material in SAP → Verify in Mantrix
4. Handle network failure gracefully
5. Handle SAP system downtime

---

## Deployment Checklist

### Prerequisites
- [ ] SAP credentials obtained
- [ ] SAP OData services tested via Postman
- [ ] Network connectivity verified (Mantrix → SAP)
- [ ] PostgreSQL tables created
- [ ] Environment variables configured

### Deployment Steps
1. Deploy backend code with SAP client
2. Run database migrations
3. Configure sync schedules
4. Enable sync for sales orders only (pilot)
5. Monitor for 48 hours
6. Gradually enable other entities

### Monitoring
- Track sync success rate (target: >99%)
- Monitor sync duration (target: <5 min for 10K records)
- Track error rate by error type
- Alert on sync failures

---

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| SAP system downtime | High | Medium | Retry logic, queue failed syncs |
| Data inconsistency | High | Low | Transaction logging, reconciliation job |
| Performance degradation | Medium | Medium | Batch processing, off-peak scheduling |
| Authentication failures | High | Low | Token refresh, credential rotation |
| Network issues | Medium | Medium | Retry with backoff, health checks |

---

## Future Enhancements

### 1. Advanced Analytics on SAP Data
- Real-time SAP dashboards in Mantrix
- Predictive analytics on order patterns
- Anomaly detection on order status changes

### 2. ML-Powered Recommendations
- Auto-suggest order approval based on historical patterns
- Predict order fulfillment time
- Identify at-risk orders

### 3. Multi-SAP Instance Support
- Support multiple SAP systems
- Cross-system analytics
- Consolidated reporting

### 4. Change Data Capture (CDC)
- Real-time streaming from SAP
- Use SAP Event Mesh or Kafka
- Near-zero latency sync

---

## References

### Documentation
- SAP OData Documentation: https://help.sap.com/docs/ODATA
- SAP Gateway Client Guide: `/OSEGW` transaction
- Mantrix PostgreSQL Schema: `terraform/gcp/POSTGRESQL_DATA_DICTIONARY.md`

### Existing Code
- SAP OData Example: `frontend/documents/SAP-ODATA.docx`
- Java Implementation: Reference for batch update logic
- PostgreSQL Client: `backend/src/db/postgresql_client.py`

### Tools
- SAP Gateway Client: `/OSEGW`
- Table Browser: `/OSE16N`
- Postman: For API testing
- Python requests library: For OData client

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Core Client | 2 weeks | SAP OData client library |
| Phase 2: Sales Orders | 2 weeks | Bidirectional sales order sync |
| Phase 3: Materials | 2 weeks | Material master sync |
| Phase 4: Customers | 2 weeks | Customer master sync |
| Phase 5: Advanced | 4 weeks | Webhooks, monitoring, validation |
| **Total** | **12 weeks** | **Full SAP Integration** |

---

## Appendix A: Sample Code

### CSRF Token Fetch
```python
def get_csrf_token(self) -> str:
    """Fetch CSRF token from SAP"""
    url = f"{self.base_url}/{self.service}/"
    response = requests.head(
        url,
        headers={'X-CSRF-Token': 'fetch'},
        auth=(self.username, self.password)
    )
    return response.headers.get('X-CSRF-Token')
```

### Batch Update
```python
async def batch_update(self, entity_set: str, records: List[dict]) -> dict:
    """Send batch update to SAP"""
    boundary = f"batch_{uuid.uuid4().hex}"

    # Build multipart payload
    payload = self._build_batch_payload(entity_set, records, boundary)

    headers = {
        'X-CSRF-Token': self.csrf_token,
        'Content-Type': f'multipart/mixed; boundary={boundary}'
    }

    response = requests.post(
        f"{self.base_url}/{self.service}/$batch",
        data=payload,
        headers=headers,
        auth=(self.username, self.password)
    )

    return self._parse_batch_response(response)
```

---

**Document Version**: 1.0
**Last Updated**: 2025-01-19
**Author**: Mantrix Integration Team
