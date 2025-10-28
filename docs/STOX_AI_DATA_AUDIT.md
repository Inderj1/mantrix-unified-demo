# STOX.AI Data Audit & PostgreSQL Migration Plan

**Date:** 2025-10-25
**Purpose:** Audit all 26 STOX.AI tiles for data completeness and plan PostgreSQL database schema

---

## Executive Summary

All 26 STOX.AI tiles currently use **in-memory mock data** generated in `FioriTileDetail.jsx` via the `generateTileData()` function. No tiles are connected to a real database or backend API.

**Current State:**
- ✅ All tiles have working mock data generators
- ✅ Column definitions are complete for all tiles
- ✅ KPI metrics are calculated from mock data
- ❌ No database persistence
- ❌ No backend API integration
- ❌ Data resets on page refresh

---

## Detailed Tile Audit

### MODULE 0: Demand Flow (2 tiles)

#### 1. Sell-Through to Sell-In Bridge (`sell-through-bridge`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 5 rows in FioriTileDetail.jsx lines 46-52
**Data Fields:**
- `id`, `channel`, `store_id`, `sku`, `date`, `sellThrough`, `sellIn`, `forecast`, `confidence`

**SAP Integration Required:**
- VBRK/VBRP (Sales documents)
- Partner EDI feeds
- TVTWT (Time intervals)

**Database Table:** `sell_through_bridge`

---

#### 2. Partner POS Monitor (`partner-pos-monitor`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 4 rows in FioriTileDetail.jsx lines 53-58
**Data Fields:**
- `id`, `partner`, `edi_feed`, `last_update`, `status`, `records`, `quality`

**Integration Required:**
- EDI-852 feeds from partners (ULTA, SEPHORA, TARGET, WALMART)
- Real-time feed monitoring

**Database Table:** `partner_pos_feeds`

---

### MODULE 1: Multi-Channel Demand Forecasting (4 tiles)

#### 3. Forecast Dashboard (`forecast-dashboard`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 5 rows in FioriTileDetail.jsx lines 61-67
**Data Fields:**
- `id`, `sku`, `channel`, `date`, `actual`, `forecast`, `accuracy`, `bias`, `mape`

**Database Table:** `demand_forecasts`

---

#### 4. Demand Analyzer (`demand-analyzer`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 4 rows in FioriTileDetail.jsx lines 68-73
**Data Fields:**
- `id`, `dimension`, `category`, `sku`, `demand`, `trend`, `region`

**Database Table:** `demand_aggregations`

---

#### 5. Forecast Workbench (`forecast-workbench`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 4 rows in FioriTileDetail.jsx lines 74-79
**Data Fields:**
- `id`, `sku`, `week`, `ai_forecast`, `override`, `promo`, `final_forecast`, `status`

**Database Table:** `forecast_overrides`

---

#### 6. Demand Alerts (`demand-alerts`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 80-84
**Data Fields:**
- `id`, `alert_type`, `sku`, `store`, `severity`, `date`, `message`

**Database Table:** `demand_alerts`

---

### MODULE 2: Store Replenishment Cockpit (4 tiles)

#### 7. Store Replenishment (`store-replenishment`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 87-91
**Data Fields:**
- `id`, `store`, `sku`, `forecast_7d`, `on_hand`, `in_transit`, `safety_stock`, `replenishment`

**SAP Integration Required:**
- MARD (Material storage location data)
- LIKP/LIPS (Delivery documents)
- MARC (Plant data for material)

**Database Table:** `store_replenishment`

---

#### 8. Route Optimizer (`route-optimizer`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 92-96
**Data Fields:**
- `id`, `route`, `truck`, `stores`, `capacity`, `distance`, `cost`

**Database Table:** `delivery_routes`

---

#### 9. Stockout Monitor (`stockout-monitor`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 97-101
**Data Fields:**
- `id`, `store`, `sku`, `current_stock`, `forecast_daily`, `days_to_stockout`, `risk`, `action`

**Database Table:** `stockout_risks`

---

#### 10. Channel Allocation (`channel-allocation`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 102-106
**Data Fields:**
- `id`, `sku`, `dc_available`, `ch01_allocation`, `ch02_allocation`, `ch03_allocation`, `ch04_allocation`, `total_demand`

**Database Table:** `channel_allocations`

---

### MODULE 3: DC Inventory Cockpit (3 tiles)

#### 11. DC Cockpit (`dc-cockpit`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 109-113
**Data Fields:**
- `id`, `sku`, `on_hand`, `in_transit`, `allocated_ch01`, `allocated_ch02`, `safety_stock`, `available`

**SAP Integration Required:**
- MARD (Material storage location data)
- Real-time ATP calculation

**Database Table:** `dc_inventory`

---

#### 12. Working Capital (`working-capital`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 4 rows in FioriTileDetail.jsx lines 114-119
**Data Fields:**
- `id`, `sku`, `inventory_units`, `unit_cost`, `inventory_value`, `turns`, `dio`, `status`

**SAP Integration Required:**
- MBEW (Material valuation)

**Database Table:** `working_capital_metrics`

---

#### 13. Excess & Obsolete (`excess-obsolete`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 120-124
**Data Fields:**
- `id`, `sku`, `inventory`, `last_sale`, `days_no_sale`, `category`, `action`, `value`

**Database Table:** `excess_obsolete_inventory`

---

### MODULE 4: Supply Requirements Dashboard (3 tiles)

#### 14. Supply Dashboard (`supply-dashboard`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 4 rows in FioriTileDetail.jsx lines 127-132
**Data Fields:**
- `id`, `sku`, `weekly_demand`, `safety_stock`, `dc_on_hand`, `dc_on_order`, `plant_supply_req`

**SAP Integration Required:**
- MD04 (Stock/Requirements list)
- PLAF (Planned order)

**Database Table:** `supply_requirements`

---

#### 15. Production Optimizer (`production-optimizer`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 133-137
**Data Fields:**
- `id`, `product_family`, `campaign_size`, `changeover_time`, `capacity_util`, `production_days`, `efficiency`

**SAP Integration Required:**
- AFKO/AFPO (Production orders)
- CM01 (Capacity planning)

**Database Table:** `production_campaigns`

---

#### 16. MRP Accelerator (`mrp-accelerator`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 138-142
**Data Fields:**
- `id`, `sku`, `planned_order`, `quantity`, `mrp_date`, `lead_time`, `status`

**SAP Integration Required:**
- MD04 (MRP controller)
- PLAF (Planned order)

**Database Table:** `mrp_planned_orders`

---

### MODULE 5: BOM Explosion Analyzer (3 tiles)

#### 17. BOM Analyzer (`bom-analyzer`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 6 rows in FioriTileDetail.jsx lines 145-152
**Data Fields:**
- `id`, `fg_sku`, `plant_req`, `component`, `qty_per_fg`, `component_req`, `supplier`

**SAP Integration Required:**
- STPO (BOM item)
- STKO (BOM header)
- MAST (Material BOM)
- CS15 (BOM explosion)

**Database Table:** `bom_explosions`

---

#### 18. Component Tracker (`component-tracker`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 4 rows in FioriTileDetail.jsx lines 153-158
**Data Fields:**
- `id`, `component`, `used_in`, `total_fgs`, `total_demand`, `on_hand`

**Database Table:** `component_usage`

---

#### 19. BOM Exceptions (`bom-exceptions`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 159-163
**Data Fields:**
- `id`, `sku`, `exception_type`, `component`, `severity`, `action_required`

**Database Table:** `bom_exceptions`

---

### MODULE 6: Component Consolidation Engine (3 tiles)

#### 20. Consolidation Engine (`consolidation-engine`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 4 rows in FioriTileDetail.jsx lines 166-171
**Data Fields:**
- `id`, `component`, `used_in`, `total_req`, `current_inventory`, `purchase_qty`, `supplier`, `savings`

**SAP Integration Required:**
- EBAN (Purchase requisition)
- EKKO/EKPO (Purchase orders)

**Database Table:** `component_consolidation`

---

#### 21. Procurement Dashboard (`procurement-dashboard`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 172-176
**Data Fields:**
- `id`, `component`, `consolidated_po`, `quantity`, `supplier`, `unit_cost`, `total_cost`, `discount`, `savings`

**SAP Integration Required:**
- EKKO/EKPO (Purchase orders)
- ME21N (Create PO)

**Database Table:** `consolidated_pos`

---

#### 22. Supplier Portal (`supplier-portal`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 4 rows in FioriTileDetail.jsx lines 177-182
**Data Fields:**
- `id`, `supplier`, `forecast_shared`, `last_po`, `next_po_est`, `delivery_performance`, `quality_score`

**SAP Integration Required:**
- LFA1 (Vendor master)
- EORD (Purchasing source list)

**Database Table:** `supplier_performance`

---

### MODULE 7: Executive KPI Dashboard (4 tiles)

#### 23. Scenario Planner (`scenario-planner`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 185-189
**Data Fields:**
- `id`, `scenario`, `sku`, `base_demand`, `promo_impact`, `holiday_impact`, `forecasted_demand`, `inventory_req`

**Note:** There's also a separate `ScenarioPlanner.jsx` component with interactive sliders

**Database Table:** `what_if_scenarios`

---

#### 24. KPI Dashboard (`kpi-dashboard`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 5 rows in FioriTileDetail.jsx lines 190-196
**Data Fields:**
- `id`, `kpi`, `value`, `target`, `unit`, `trend`, `status`

**Database Table:** `kpi_metrics`

---

#### 25. Predictive Analytics (`predictive-analytics`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 197-201
**Data Fields:**
- `id`, `date`, `anomaly_type`, `sku`, `store`, `expected`, `actual`, `variance`, `reason`

**Database Table:** `anomaly_detection`

---

#### 26. Working Capital Optimizer (`working-capital-optimizer`)
**Status:** Mock data only
**Current Data Source:** Hardcoded 3 rows in FioriTileDetail.jsx lines 202-206
**Data Fields:**
- `id`, `sku`, `inventory_value`, `target_turns`, `current_turns`, `dio`, `target_dio`, `cash_impact`, `status`

**Database Table:** `working_capital_optimization`

---

## Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| **Total Tiles** | 26 | 100% mock data |
| **Total Data Fields** | 173+ | All hardcoded |
| **SAP Integrations Required** | 15+ tables | Not implemented |
| **EDI Integrations Required** | 4 partners | Not implemented |

---

## PostgreSQL Database Schema Design

### Core Master Data Tables

```sql
-- 1. SKU Master
CREATE TABLE sku_master (
    sku_id VARCHAR(50) PRIMARY KEY,
    sku_name VARCHAR(255),
    product_family VARCHAR(100),
    category VARCHAR(100),
    unit_cost DECIMAL(10,2),
    lead_time_days INT,
    safety_stock_days INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Location Master (Stores, DCs, Plants, Partners)
CREATE TABLE locations (
    location_id VARCHAR(50) PRIMARY KEY,
    location_name VARCHAR(255),
    location_type VARCHAR(50), -- STORE, DC, PLANT, PARTNER
    address TEXT,
    region VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Channel Master
CREATE TABLE channels (
    channel_id VARCHAR(20) PRIMARY KEY,
    channel_name VARCHAR(100),
    channel_type VARCHAR(50), -- RETAIL, ECOMMERCE, B2B, DISTRIBUTOR
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Supplier Master
CREATE TABLE suppliers (
    supplier_id VARCHAR(50) PRIMARY KEY,
    supplier_name VARCHAR(255),
    contact_email VARCHAR(255),
    delivery_performance_pct DECIMAL(5,2),
    quality_score_pct DECIMAL(5,2),
    forecast_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. BOM Master
CREATE TABLE bom_headers (
    bom_id SERIAL PRIMARY KEY,
    fg_sku VARCHAR(50) REFERENCES sku_master(sku_id),
    bom_version VARCHAR(20),
    effective_date DATE,
    status VARCHAR(20), -- ACTIVE, OBSOLETE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bom_items (
    bom_item_id SERIAL PRIMARY KEY,
    bom_id INT REFERENCES bom_headers(bom_id),
    component_sku VARCHAR(50) REFERENCES sku_master(sku_id),
    qty_per_fg DECIMAL(10,4),
    supplier_id VARCHAR(50) REFERENCES suppliers(supplier_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MODULE 0: Demand Flow Tables

```sql
-- Sell-Through Bridge
CREATE TABLE sell_through_bridge (
    id SERIAL PRIMARY KEY,
    channel_id VARCHAR(20) REFERENCES channels(channel_id),
    location_id VARCHAR(50) REFERENCES locations(location_id),
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    transaction_date DATE,
    sell_through_qty INT,
    sell_in_qty INT,
    forecast_qty INT,
    confidence_pct DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel_id, location_id, sku_id, transaction_date)
);

CREATE INDEX idx_st_bridge_date ON sell_through_bridge(transaction_date);
CREATE INDEX idx_st_bridge_sku ON sell_through_bridge(sku_id);

-- Partner POS Feeds
CREATE TABLE partner_pos_feeds (
    id SERIAL PRIMARY KEY,
    partner_id VARCHAR(50) REFERENCES locations(location_id),
    edi_feed_type VARCHAR(50),
    last_update TIMESTAMP,
    feed_status VARCHAR(20), -- ACTIVE, DELAYED, ERROR
    record_count INT,
    data_quality_pct DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MODULE 1: Demand Forecasting Tables

```sql
-- Forecast Dashboard
CREATE TABLE demand_forecasts (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    channel_id VARCHAR(20) REFERENCES channels(channel_id),
    forecast_date DATE,
    actual_qty INT,
    forecast_qty INT,
    accuracy_pct DECIMAL(5,2),
    bias_qty INT,
    mape_pct DECIMAL(5,2),
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, channel_id, forecast_date)
);

CREATE INDEX idx_forecast_date ON demand_forecasts(forecast_date);
CREATE INDEX idx_forecast_sku ON demand_forecasts(sku_id);

-- Forecast Overrides
CREATE TABLE forecast_overrides (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    week_id VARCHAR(10), -- Format: 2024-W06
    ai_forecast INT,
    override_forecast INT,
    has_promo BOOLEAN,
    final_forecast INT,
    status VARCHAR(20), -- APPROVED, OVERRIDDEN, PENDING
    overridden_by VARCHAR(100),
    overridden_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, week_id)
);

-- Demand Alerts
CREATE TABLE demand_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50), -- STOCKOUT_RISK, DEMAND_SPIKE, FORECAST_ERROR
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    location_id VARCHAR(50) REFERENCES locations(location_id),
    severity VARCHAR(20), -- HIGH, MEDIUM, LOW
    alert_date DATE,
    message TEXT,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_severity ON demand_alerts(severity, acknowledged);
```

### MODULE 2: Outbound Replenishment Tables

```sql
-- Store Replenishment
CREATE TABLE store_replenishment (
    id SERIAL PRIMARY KEY,
    location_id VARCHAR(50) REFERENCES locations(location_id),
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    forecast_7d INT,
    on_hand_qty INT,
    in_transit_qty INT,
    safety_stock_qty INT,
    replenishment_qty INT,
    calculation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, sku_id, calculation_date)
);

-- Delivery Routes
CREATE TABLE delivery_routes (
    id SERIAL PRIMARY KEY,
    route_id VARCHAR(50) UNIQUE,
    truck_id VARCHAR(50),
    store_list TEXT, -- Comma-separated location IDs
    capacity_pct DECIMAL(5,2),
    distance_mi DECIMAL(8,2),
    cost_usd DECIMAL(10,2),
    route_date DATE,
    status VARCHAR(20), -- PLANNED, IN_TRANSIT, COMPLETED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stockout Risks
CREATE TABLE stockout_risks (
    id SERIAL PRIMARY KEY,
    location_id VARCHAR(50) REFERENCES locations(location_id),
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    current_stock INT,
    forecast_daily INT,
    days_to_stockout INT,
    risk_level VARCHAR(20), -- CRITICAL, HIGH, MEDIUM, LOW
    recommended_action TEXT,
    calculation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, sku_id, calculation_date)
);

-- Channel Allocation
CREATE TABLE channel_allocations (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    dc_available INT,
    ch01_allocation INT,
    ch02_allocation INT,
    ch03_allocation INT,
    ch04_allocation INT,
    total_demand INT,
    allocation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, allocation_date)
);
```

### MODULE 3: DC Inventory Tables

```sql
-- DC Inventory Cockpit
CREATE TABLE dc_inventory (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    on_hand_qty INT,
    in_transit_qty INT,
    allocated_ch01 INT,
    allocated_ch02 INT,
    safety_stock_qty INT,
    available_atp INT,
    snapshot_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, snapshot_date)
);

-- Working Capital Metrics
CREATE TABLE working_capital_metrics (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    inventory_units INT,
    unit_cost DECIMAL(10,2),
    inventory_value DECIMAL(12,2),
    inventory_turns DECIMAL(5,2),
    days_inventory_outstanding INT,
    status VARCHAR(20), -- OPTIMAL, STOCKOUT, EXCESS
    calculation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, calculation_date)
);

-- Excess & Obsolete
CREATE TABLE excess_obsolete_inventory (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    inventory_qty INT,
    last_sale_date DATE,
    days_no_sale INT,
    category VARCHAR(50), -- END_OF_LIFE, SLOW_MOVING, OBSOLETE
    recommended_action VARCHAR(100),
    inventory_value DECIMAL(12,2),
    snapshot_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, snapshot_date)
);
```

### MODULE 4: Supply Planning Tables

```sql
-- Supply Requirements
CREATE TABLE supply_requirements (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    weekly_demand INT,
    safety_stock INT,
    dc_on_hand INT,
    dc_on_order INT,
    plant_supply_req INT,
    week_id VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, week_id)
);

-- Production Campaigns
CREATE TABLE production_campaigns (
    id SERIAL PRIMARY KEY,
    product_family VARCHAR(100),
    campaign_size INT,
    changeover_time_hrs DECIMAL(4,2),
    capacity_utilization_pct DECIMAL(5,2),
    production_days INT,
    efficiency_pct DECIMAL(5,2),
    campaign_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MRP Planned Orders
CREATE TABLE mrp_planned_orders (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    planned_order_id VARCHAR(50) UNIQUE,
    quantity INT,
    mrp_date DATE,
    lead_time_days INT,
    status VARCHAR(20), -- AUTO_APPROVED, PENDING_REVIEW, EXPEDITED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MODULE 5: BOM Explosion Tables

```sql
-- BOM Explosions (calculated view)
CREATE TABLE bom_explosions (
    id SERIAL PRIMARY KEY,
    fg_sku VARCHAR(50) REFERENCES sku_master(sku_id),
    plant_requirement INT,
    component_sku VARCHAR(50) REFERENCES sku_master(sku_id),
    qty_per_fg DECIMAL(10,4),
    component_requirement INT,
    supplier_id VARCHAR(50) REFERENCES suppliers(supplier_id),
    calculation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Component Usage Tracker
CREATE TABLE component_usage (
    id SERIAL PRIMARY KEY,
    component_sku VARCHAR(50) REFERENCES sku_master(sku_id),
    used_in_fg_list TEXT, -- Comma-separated SKU list
    total_fg_count INT,
    total_demand INT,
    on_hand_qty INT,
    snapshot_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(component_sku, snapshot_date)
);

-- BOM Exceptions
CREATE TABLE bom_exceptions (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    exception_type VARCHAR(50), -- MISSING_COMPONENT, COMPONENT_SHORTAGE, PHANTOM_BOM
    component_sku VARCHAR(50),
    severity VARCHAR(20), -- HIGH, MEDIUM, LOW
    action_required TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MODULE 6: Procurement Tables

```sql
-- Component Consolidation
CREATE TABLE component_consolidation (
    id SERIAL PRIMARY KEY,
    component_sku VARCHAR(50) REFERENCES sku_master(sku_id),
    used_in_fg_list TEXT,
    total_requirement INT,
    current_inventory INT,
    purchase_qty INT,
    supplier_id VARCHAR(50) REFERENCES suppliers(supplier_id),
    estimated_savings DECIMAL(10,2),
    consolidation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(component_sku, consolidation_date)
);

-- Consolidated Purchase Orders
CREATE TABLE consolidated_pos (
    id SERIAL PRIMARY KEY,
    consolidated_po_id VARCHAR(50) UNIQUE,
    component_sku VARCHAR(50) REFERENCES sku_master(sku_id),
    quantity INT,
    supplier_id VARCHAR(50) REFERENCES suppliers(supplier_id),
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(12,2),
    discount_pct DECIMAL(5,2),
    savings_amount DECIMAL(10,2),
    po_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MODULE 7: Analytics Tables

```sql
-- What-If Scenarios
CREATE TABLE what_if_scenarios (
    id SERIAL PRIMARY KEY,
    scenario_id VARCHAR(50) UNIQUE,
    scenario_name VARCHAR(100),
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    base_demand INT,
    promo_impact_pct DECIMAL(5,2),
    holiday_impact_pct DECIMAL(5,2),
    forecasted_demand INT,
    inventory_requirement INT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KPI Metrics
CREATE TABLE kpi_metrics (
    id SERIAL PRIMARY KEY,
    kpi_name VARCHAR(100),
    kpi_value DECIMAL(10,2),
    target_value DECIMAL(10,2),
    unit VARCHAR(20),
    trend VARCHAR(50),
    status VARCHAR(20), -- EXCEEDS, MEETS, BELOW
    calculation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kpi_name, calculation_date)
);

-- Anomaly Detection
CREATE TABLE anomaly_detection (
    id SERIAL PRIMARY KEY,
    anomaly_date DATE,
    anomaly_type VARCHAR(50), -- DEMAND_SPIKE, STOCKOUT, SLOW_SALES
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    location_id VARCHAR(50) REFERENCES locations(location_id),
    expected_value INT,
    actual_value INT,
    variance_pct DECIMAL(5,2),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Working Capital Optimization
CREATE TABLE working_capital_optimization (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    inventory_value DECIMAL(12,2),
    target_turns DECIMAL(5,2),
    current_turns DECIMAL(5,2),
    days_inventory_outstanding INT,
    target_dio INT,
    cash_impact DECIMAL(12,2),
    status VARCHAR(20), -- OPTIMAL, REVIEW
    calculation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, calculation_date)
);
```

---

## Migration Strategy

### Phase 1: Database Setup (Week 1)
1. Create PostgreSQL database instance
2. Execute master data table DDL scripts
3. Execute transactional table DDL scripts
4. Create indexes for performance
5. Set up database connection pooling

### Phase 2: Backend API Development (Week 2-3)
1. Set up Node.js/Express or Python/FastAPI backend
2. Implement REST API endpoints for each tile
3. Add authentication & authorization
4. Implement caching layer (Redis)
5. Add API rate limiting

### Phase 3: Data Migration (Week 4)
1. Import Madison Reed master data from Excel
2. Generate historical transactional data
3. Validate data quality
4. Create data refresh jobs

### Phase 4: Frontend Integration (Week 5)
1. Replace `generateTileData()` with API calls
2. Add loading states and error handling
3. Implement real-time data refresh
4. Add optimistic UI updates

### Phase 5: SAP Integration (Week 6-8)
1. Set up SAP RFC connections
2. Implement SAP table extractors
3. Create ETL pipelines
4. Schedule batch jobs
5. Real-time event processing

---

## API Endpoint Structure

```
GET  /api/stox/sell-through-bridge?date=2024-10-25&sku=SKU_HC_001
POST /api/stox/sell-through-bridge
PUT  /api/stox/sell-through-bridge/:id
DEL  /api/stox/sell-through-bridge/:id

GET  /api/stox/demand-forecasts?channel=CH01&date=2024-10-25
POST /api/stox/forecast-overrides
PUT  /api/stox/forecast-overrides/:id

... (26 endpoints total, one per tile)
```

---

## Next Steps

1. ✅ Review this audit with stakeholders
2. ⏳ Get database credentials for PostgreSQL instance
3. ⏳ Prioritize which modules to migrate first
4. ⏳ Create migration scripts for master data
5. ⏳ Build backend API framework
6. ⏳ Update frontend components to use APIs

---

**Prepared by:** Claude Code
**Last Updated:** 2025-10-25
