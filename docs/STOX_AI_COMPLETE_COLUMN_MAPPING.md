# STOX.AI Complete Column Mapping
## All Store & DC Modules - Raw, Derived, and ML Columns

**Document Version**: 1.0
**Last Updated**: 2025-10-28
**Total Modules**: 13 (6 Store + 7 DC)

---

## Table of Contents
1. [Store System Modules (6)](#store-system-modules)
2. [DC System Modules (7)](#dc-system-modules)
3. [Common SAP Tables Reference](#common-sap-tables-reference)
4. [ML Models Reference](#ml-models-reference)

---

# STORE SYSTEM MODULES

## 1. StoreForecast - Sell-Through Forecasting (Tile 1)

### Purpose
Predict future store-level demand using ML time series models with confidence intervals.

### Column Mapping

| Column | Type | SAP Table.Field | Derived Formula | ML Model | Description |
|--------|------|-----------------|-----------------|----------|-------------|
| id | Raw | Generated | - | - | Forecast record ID (FC####) |
| date | Raw | System Date | - | - | Forecast date |
| store_id | Raw | T001W.WERKS | - | - | Store/Plant ID |
| store_name | Raw | T001W.NAME1 | - | - | Store name |
| channel | Raw | Custom Config | - | - | Sales channel (Retail Store) |
| product_sku | Raw | MARA.MATNR | - | - | Material number |
| product_name | Raw | MAKT.MAKTX | - | - | Material description |
| **forecasted_units** | ML | - | - | Prophet/ARIMA | **Daily demand forecast** |
| **confidence_level** | ML | - | - | Bayesian | **Forecast confidence (0-1)** |
| forecast_method | ML | - | - | - | Model used (Prophet/ARIMA/ML) |
| **upper_bound** | ML | - | - | Prophet | **95% CI upper bound** |
| **lower_bound** | ML | - | - | Prophet | **95% CI lower bound** |
| historical_avg | Derived | - | `AVG(sales, 90d)` | - | 90-day historical average |
| promotion_flag | Raw | Custom Promo Table | - | - | Is promotion active? |
| seasonality_factor | ML | - | - | Prophet | Seasonal multiplier |

**Key Aggregation**: Sum of store forecasts → DC weekly demand (μDC)

---

## 2. StoreHealthMonitor - Inventory Health Monitor (Tile 3)

### Purpose
Real-time inventory status with health alerts and days of supply monitoring.

### Column Mapping

| Column | Type | SAP Table.Field | Derived Formula | ML Model | Description |
|--------|------|-----------------|-----------------|----------|-------------|
| id | Raw | Generated | - | - | Health monitor ID (HM####) |
| store_id | Raw | T001W.WERKS | - | - | Store/Plant ID |
| store_name | Raw | T001W.NAME1 | - | - | Store name |
| product_sku | Raw | MARA.MATNR | - | - | Material number |
| product_name | Raw | MAKT.MAKTX | - | - | Material description |
| forecasted_demand | ML | - | - | Prophet | Daily demand forecast (from Tile 1) |
| current_inventory | Raw | MARD.LABST | - | - | Stock on hand |
| inbound_shipments | Raw | EKET.MENGE | - | - | On-order quantity |
| committed_orders | Raw | VBBE.VMENG | - | - | Committed/allocated stock |
| **available_inventory** | Derived | - | `current + inbound - committed` | - | **Net available** |
| target_inventory | Raw/ML | MARC.EISBE | - | Optimization | Target stock level |
| safety_stock | Raw/ML | MARC.MINBE | - | Optimization | Safety stock |
| **days_of_supply** | Derived | - | `available / daily_demand` | - | **Days until stockout** |
| **inventory_health_pct** | Derived | - | `(avail - safety) / (target - safety) × 100` | - | **Health percentage** |
| **health_status** | Derived | - | See logic below | - | **Status indicator (🟢🟡🚨)** |
| fill_rate | Raw | Historical LIPS | - | - | Order fulfillment rate |
| **stockout_risk** | ML/Derived | - | Risk logic | XGBoost | **Risk classification** |
| **action** | Derived | - | Business rules | - | **Recommended action** |

**Health Status Logic**:
```
🟢 Green (Healthy): health_pct >= 70%
🟡 Yellow (Reorder Soon): 30% <= health_pct < 70%
🚨 Red (Critical): health_pct < 30%
🟠 Orange (Overstock): health_pct > 150%
```

---

## 3. StoreOptimization - Safety Stock & Targets (Tile 4)

### Purpose
Calculate optimal safety stock and target inventory levels per store-SKU.

### Column Mapping

| Column | Type | SAP Table.Field | Derived Formula | ML Model | Description |
|--------|------|-----------------|-----------------|----------|-------------|
| id | Raw | Generated | - | - | Optimization ID (SO####) |
| store_id | Raw | T001W.WERKS | - | - | Store/Plant ID |
| product_sku | Raw | MARA.MATNR | - | - | Material number |
| **daily_demand** | ML | - | - | Prophet | **Average daily demand (μ)** |
| **demand_stddev** | ML | - | - | Prophet | **Demand std dev (σ)** |
| lead_time_days | Raw | MARC.PLIFZ | - | - | Replenishment lead time |
| **service_level** | Raw | MARC.SERNR | - | - | **Target service level (95%, 98%)** |
| **z_score** | Derived | - | `NORMSINV(service_level)` | - | **Z-score for service level** |
| **safety_stock** | Derived | - | `z × σ × √L` | - | **Calculated safety stock** |
| **reorder_point** | Derived | - | `(μ × L) + safety_stock` | - | **ROP trigger point** |
| **target_inventory** | Derived | - | `ROP + order_qty` | - | **Target stock level** |
| current_stock | Raw | MARD.LABST | - | - | Current inventory |
| **gap** | Derived | - | `target - current` | - | **Inventory gap** |
| **status** | Derived | - | Optimization rules | - | **Optimal / Adjust / Critical** |

**Safety Stock Formula**:
```
SS = z × √((σ²×L) + (μ²×σL²))

Where:
- z = z-score for service level
- σ = demand standard deviation
- L = lead time (days)
- σL = lead time variability
- μ = average daily demand
```

---

## 4. StoreReplenishment - Replenishment Execution (Tile 5)

### Purpose
Auto-generate purchase orders with MOQ/lot size validation and truck optimization.

**See dedicated document**: `store_replenishment_raw_columns.md`, `store_replenishment_derived_columns.md`, `store_replenishment_ml_columns.md`

### Column Summary (28 columns total)

| Category | Count | Examples |
|----------|-------|----------|
| Raw (SAP) | 16 | store_id, product_sku, current_inventory, moq, unit_cost, lead_time |
| Derived | 8 | base_order_qty, final_order_qty, order_value, truck_utilization, priority, status, action |
| ML | 4 | forecasted_demand (Prophet), eoq (RL), confidence_level (Bayesian), stockout_probability (XGBoost) |

---

## 5. StoreFinancialImpact - Financial Impact Analysis

### Purpose
Calculate financial impact of inventory decisions (carrying costs, stockouts, working capital).

### Column Mapping

| Column | Type | SAP Table.Field | Derived Formula | ML Model | Description |
|--------|------|-----------------|-----------------|----------|-------------|
| id | Raw | Generated | - | - | Financial record ID (FI####) |
| store_id | Raw | T001W.WERKS | - | - | Store/Plant ID |
| product_sku | Raw | MARA.MATNR | - | - | Material number |
| current_inventory | Raw | MARD.LABST | - | - | Stock on hand |
| unit_cost | Raw | MBEW.VERPR | - | - | Standard/moving avg price |
| **inventory_value** | Derived | - | `current_inventory × unit_cost` | - | **Total inventory value** |
| **holding_cost_annual** | Derived | - | `inventory_value × holding_rate` | - | **Annual carrying cost** |
| holding_rate | Raw | Config | - | - | Holding cost rate (20-30%/year) |
| **stockout_cost** | Derived | - | `lost_sales × margin` | - | **Cost of stockouts** |
| lost_sales | ML | - | - | Counterfactual | Estimated lost sales |
| margin | Raw | MBEW | - | - | Gross margin % |
| **excess_inventory_cost** | Derived | - | `(current - target) × unit_cost × risk_rate` | - | **Overstock cost (obsolescence)** |
| target_inventory | Raw/ML | MARC.EISBE | - | - | Target stock level |
| **working_capital** | Derived | - | `inventory_value + receivables - payables` | - | **Working capital tied up** |
| **roi_impact** | Derived | - | `(revenue - costs) / inventory_value` | - | **Return on inventory investment** |
| **action** | Derived | - | Business rules | - | **Reduce / Increase / Optimize** |

---

## 6. StoreDeployment - Store Deployment Planning

### Purpose
Plan initial inventory deployment to new stores or seasonal inventory builds.

### Column Mapping

| Column | Type | SAP Table.Field | Derived Formula | ML Model | Description |
|--------|------|-----------------|-----------------|----------|-------------|
| id | Raw | Generated | - | - | Deployment ID (SD####) |
| store_id | Raw | T001W.WERKS | - | - | Store/Plant ID (new store) |
| store_type | Raw | T001W.Custom | - | - | Store classification (A/B/C) |
| opening_date | Raw | T001W.Custom | - | - | Store opening date |
| product_sku | Raw | MARA.MATNR | - | - | Material number |
| **forecasted_demand** | ML | - | - | Transfer Learning | **Demand forecast (from similar stores)** |
| comparable_stores | Derived | - | Similarity matching | ML | List of similar stores |
| **initial_stock_qty** | Derived | - | `demand × (lead_time + safety_days)` | - | **Opening stock quantity** |
| safety_days | Raw | Config | - | - | Buffer days (14-30) |
| **deployment_cost** | Derived | - | `qty × unit_cost + freight` | - | **Total deployment cost** |
| source_dc | Derived | - | Optimization | - | Sourcing DC |
| **deployment_date** | Derived | - | `opening_date - lead_time` | - | **Ship date** |
| status | Derived | - | Workflow state | - | Planned / In-Transit / Delivered |

---

# DC SYSTEM MODULES

## 7. DCDemandAggregation - Channel Demand Aggregation

### Purpose
Aggregate demand from multiple channels (Retail, Amazon, D2C, Wholesale) to DC level.

### Column Mapping

| Column | Type | SAP Table.Field | Derived Formula | ML Model | Description |
|--------|------|-----------------|-----------------|----------|-------------|
| id | Raw | Generated | - | - | Aggregation ID (DA####) |
| date | Raw | System Date | - | - | Aggregation date |
| iso_week | Derived | - | `YEAR-WW` | - | ISO week identifier |
| dc_location | Raw | T001W.WERKS | - | - | DC identifier |
| product_sku | Raw | MARA.MATNR | - | - | Material number |
| **retail_fcst** | ML | - | - | Prophet | **Retail stores forecast** |
| retail_stddev | ML | - | - | Prophet | Retail demand std dev |
| **amazon_fcst** | ML | - | - | Prophet | **Amazon channel forecast** |
| amazon_stddev | ML | - | - | Prophet | Amazon std dev |
| **wholesale_fcst** | ML | - | - | Prophet | **Wholesale/B2B forecast** |
| wholesale_stddev | ML | - | - | Prophet | Wholesale std dev |
| **d2c_fcst** | ML | - | - | Prophet | **Direct-to-consumer forecast** |
| d2c_stddev | ML | - | - | Prophet | D2C std dev |
| **daily_forecast_dc** | Derived | - | `Σ(channel forecasts)` | - | **Total daily DC demand** |
| **weekly_mean_dc** | Derived | - | `daily_forecast_dc × 7` | - | **Weekly DC demand (μDC)** |
| **weekly_stddev_dc** | Derived | - | `√(Σσ² + 2ρΣσiσj)` | - | **Weekly std dev (σDC)** |
| correlation_coeff | Raw/ML | - | - | Statistical | Channel correlation (ρ) |
| num_locations | Derived | - | Count of stores | - | Number of locations served |
| variance | Derived | - | `actual - forecast` | - | Variance amount |
| variance_pct | Derived | - | `variance / forecast × 100` | - | Variance percentage |
| status | Derived | - | Thresholds | - | Aligned / Good / Review |

**Aggregation Formula with Correlation**:
```
σDC = √(σ₁² + σ₂² + σ₃² + σ₄² + 2ρ(σ₁σ₂ + σ₁σ₃ + σ₁σ₄ + σ₂σ₃ + σ₂σ₄ + σ₃σ₄))

Where:
- σ₁, σ₂, σ₃, σ₄ = std dev of each channel
- ρ = correlation coefficient (0.2-0.4 typical)
```

---

## 8. DCHealthMonitor - DC Health Monitor

### Purpose
Real-time visibility into DC inventory health, stock levels, and availability across network.

### Column Mapping

| Column | Type | SAP Table.Field | Derived Formula | ML Model | Description |
|--------|------|-----------------|-----------------|----------|-------------|
| id | Raw | Generated | - | - | Health record ID (DH####) |
| dc_location | Raw | T001W.WERKS | - | - | DC identifier |
| product_sku | Raw | MARA.MATNR | - | - | Material number |
| channels | Derived | - | Aggregated list | - | Channels served |
| **weekly_mu** | Derived | - | Σ(store forecasts) | - | **Weekly demand (μDC)** |
| **sigma** | Derived | - | Aggregated σDC | - | **Demand std dev** |
| lead_time_weeks | Raw | MARC.PLIFZ | - | - | Supplier lead time |
| sigma_l | Raw | Historical | - | - | Lead time variability |
| service_level | Raw | Config | - | - | Target service level (95-99%) |
| z_score | Derived | - | `NORMSINV(service_level)` | - | Z-score for service level |
| beta | Raw | Config | - | - | Supplier unreliability factor |
| on_time | Raw | LFA1.Custom | - | - | Supplier on-time delivery % |
| **safety_stock** | Derived | - | `z × √((σ²×L)+(μ²×σL²)) × (1+β×(1-on_time))` | - | **Adjusted safety stock** |
| **rop** | Derived | - | `(μ × L) + safety_stock` | - | **Reorder point** |
| **target** | Derived | - | `ROP + order_qty` | - | **Target inventory** |
| on_hand | Raw | MARD.LABST | - | - | Current stock |
| on_order | Raw | EKET.MENGE | - | - | Inbound shipments |
| allocated | Raw | VBBE.VMENG | - | - | Committed to orders |
| **available** | Derived | - | `on_hand + on_order - allocated` | - | **Net available** |
| **health_pct** | Derived | - | `available / target` | - | **Health percentage** |
| **status** | Derived | - | Health thresholds | - | **🟢 Healthy / 🚨 Critical** |
| **requirement_qty** | Derived | - | `target - available` | - | **Quantity needed** |
| freight_util | Derived | - | Container utilization | - | Freight efficiency |
| action | Derived | - | Business rules | - | Generate Requirement / Rebalance |

---

## 9. DCOptimization - DC Safety Stock Layer

### Purpose
Optimize inventory positioning and allocation across distribution center network.

### Column Mapping

| Column | Type | SAP Table.Field | Derived Formula | ML Model | Description |
|--------|------|-----------------|-----------------|----------|-------------|
| id | Raw | Generated | - | - | Optimization ID (SS####) |
| dc_location | Raw | T001W.WERKS | - | - | DC identifier |
| product_sku | Raw | MARA.MATNR | - | - | Material number |
| channels | Derived | - | Aggregated list | - | Channels aggregated |
| **weekly_mu** | Derived | - | Σ(channel demands) | - | **Weekly demand (μDC)** |
| **sigma** | Derived | - | Aggregated σDC | - | **Demand std dev (σDC)** |
| lead_time_weeks | Raw | MARC.PLIFZ | - | - | Replenishment lead time |
| sigma_l | Raw | Historical | - | - | Lead time std dev (σL) |
| service_level | Raw | Config | - | - | Target service level |
| z_score | Derived | - | `NORMSINV(service_level)` | - | Z-score |
| **base_ss** | Derived | - | `z × √((σ²×L)+(μ²×σL²))` | - | **Base safety stock** |
| supplier_ontime | Raw | LFA1.Custom | - | - | Supplier on-time % |
| beta | Raw | Config | - | - | Unreliability factor (β) |
| **adjusted_ss** | Derived | - | `base_ss × (1 + β×(1-ontime))` | - | **Adjusted safety stock** |
| **rop** | Derived | - | `(μ × L) + adjusted_ss` | - | **Reorder point** |
| **target_inventory** | Derived | - | `ROP + EOQ` | - | **Target stock level** |

**Safety Stock Formula (DC Level)**:
```
SSDC = z × √((σDC² × L) + (μDC² × σL²)) × (1 + β × (1 - on_time_rate))

Adjustment factor for supplier unreliability:
- If on_time = 90%, β = 0.3 → Factor = 1 + 0.3 × 0.1 = 1.03 (3% increase)
- If on_time = 80%, β = 0.3 → Factor = 1 + 0.3 × 0.2 = 1.06 (6% increase)
```

---

## 10. DCBOM - BOM Explosion & Component Requirements

### Purpose
Explode finished goods BOM to calculate component requirements with yield loss.

### Column Mapping

| Column | Type | SAP Table.Field | Derived Formula | ML Model | Description |
|--------|------|-----------------|-----------------|----------|-------------|
| id | Raw | Generated | - | - | BOM explosion ID (BOM####) |
| parent_sku | Raw | MARA.MATNR | - | - | Finished goods SKU |
| dc | Raw | T001W.WERKS | - | - | DC location |
| **requirement_qty** | Derived | - | From DC Health | - | **FG requirement quantity** |
| **component** | Raw | STPO.IDNRK | - | - | **Component material** |
| **usage_per_kit** | Raw | STPO.MENGE | - | - | **Component usage per FG** |
| **yield_pct** | Raw | STPO.AUSCH | - | - | **Production yield %** |
| **gross_req** | Derived | - | `requirement_qty × usage_per_kit` | - | **Gross requirement** |
| **adj_req** | Derived | - | `gross_req / yield_pct` | - | **Adjusted for yield loss** |
| on_hand | Raw | MARD.LABST | - | - | Component inventory |
| on_order | Raw | EKET.MENGE | - | - | Inbound components |
| **net_req** | Derived | - | `MAX(0, adj_req - on_hand - on_order)` | - | **Net component requirement** |
| action | Derived | - | Make/Buy logic | - | Generate Requirement (Make/Buy) |

**BOM Explosion Logic**:
```
For each finished goods requirement:
1. Gross Req = FG_Qty × Usage_Per_Kit
2. Adjusted Req = Gross_Req / Yield% (accounts for scrap/waste)
3. Net Req = Adjusted_Req - On_Hand - On_Order

Example:
- FG Req: 4,334 kits
- Component: Conditioner (1 per kit)
- Yield: 98%
- Adjusted Req = 4,334 / 0.98 = 4,422
- On Hand: 1,000, On Order: 500
- Net Req = 4,422 - 1,000 - 500 = 2,922 (need to procure)
```

**SAP Tables**:
- `MAST` - Material to BOM Link
- `STKO` - BOM Header
- `STPO` - BOM Items (component list)

---

## 11. DCLotSize - Lot Sizing & MOQ Optimization

### Purpose
Determine optimal lot sizes considering MOQ, freight consolidation, and cost tradeoffs.

### Column Mapping

| Column | Type | SAP Table.Field | Derived Formula | ML Model | Description |
|--------|------|-----------------|-----------------|----------|-------------|
| id | Raw | Generated | - | - | Lot size record ID (LS####) |
| component | Raw | MARA.MATNR | - | - | Component material |
| dc | Raw | T001W.WERKS | - | - | DC location |
| **net_req** | Derived | - | From BOM | - | **Net requirement** |
| moq | Raw | MARC.BSTMI | - | - | Minimum order quantity |
| **lot_size_rule** | Raw | MARC.DISLS | - | - | **Lot sizing rule (EX/FX/HB)** |
| order_multiple | Raw | MARC.BSTRF | - | - | Rounding value (case pack) |
| **eoq** | Derived/ML | - | `√(2×D×S/H)` | RL | **Economic order quantity** |
| annual_demand | ML | - | - | Prophet | Annual demand forecast |
| order_cost | Raw | Config | - | - | Cost to place order ($) |
| holding_cost_rate | Raw | Config | - | - | Holding cost % (20-30%/year) |
| **lot_size** | Derived | - | `MAX(net_req, moq, eoq)` rounded | - | **Final lot size** |
| unit_cost | Raw | MBEW.VERPR | - | - | Component unit cost |
| **order_value** | Derived | - | `lot_size × unit_cost` | - | **Total order value** |
| container_capacity | Raw | Config | - | - | Container/truck capacity |
| **freight_util** | Derived | - | `lot_size / container_capacity` | - | **Freight utilization** |
| **optimization_status** | Derived | - | Cost analysis | - | **Optimal / Consolidate / Split** |

**Lot Sizing Rules (SAP MARC.DISLS)**:
- **EX (Exact)**: Order exactly the net requirement
- **FX (Fixed)**: Always order a fixed quantity (ignores net req)
- **HB (EOQ)**: Economic Order Quantity optimization
- **MB (Monthly)**: One month's requirement
- **WB (Weekly)**: One week's requirement

---

## 12. DCPlanningTable - DC Planning Table (MRP)

### Purpose
Material Requirements Planning (MRP) table showing planned orders, receipts, and inventory projection.

### Column Mapping

| Column | Type | SAP Table.Field | Derived Formula | ML Model | Description |
|--------|------|-----------------|-----------------|----------|-------------|
| id | Raw | Generated | - | - | Planning record ID (PT####) |
| component | Raw | MARA.MATNR | - | - | Material number |
| dc | Raw | T001W.WERKS | - | - | DC location |
| planning_date | Raw | System Date | - | - | MRP run date |
| period | Raw | Config | - | - | Planning period (weekly bucket) |
| **gross_req** | Derived | - | From BOM | - | **Gross requirements** |
| **scheduled_receipts** | Raw | EKET.MENGE | - | - | **Confirmed inbound** |
| **planned_receipts** | Derived | - | MRP logic | - | **Planned orders** |
| **projected_inventory** | Derived | - | `prev + receipts - gross_req` | - | **Projected on-hand** |
| safety_stock | Raw/Derived | MARC.MINBE | - | - | Safety stock level |
| **below_safety** | Derived | - | `projected < safety_stock` | - | **Safety stock breach** |
| **action_message** | Derived | - | MRP rules | - | **Expedite / Reschedule / Cancel** |
| mrp_element | Raw | PLAF/PBED | - | - | MRP element (PIR/PO/TO) |
| exception_code | Derived | - | Exception logic | - | 10 (shortage), 20 (excess), etc. |

**MRP Logic (Period-by-Period)**:
```
For each time bucket:
1. Beginning Inventory = Previous period ending inventory
2. Gross Requirements = Sum of demands in this period
3. Scheduled Receipts = Confirmed POs/TOs arriving this period
4. Projected Available = Beginning + Receipts - Gross Requirements
5. If Projected < Safety Stock → Generate Planned Order
6. Planned Order Qty = MAX(net req, lot size rule)
7. Ending Inventory = Projected Available
```

**SAP MRP Tables**:
- `MDKP` - MRP Document Header
- `MDTB` - MRP Table Entries
- `PBED` - Independent Requirements
- `PLAF` - Planned Orders

---

## 13. DCSupplierExecution - Supplier Execution (Make/Buy Split)

### Purpose
Split component requirements between internal manufacturing (Make) and external procurement (Buy).

### Column Mapping

| Column | Type | SAP Table.Field | Derived Formula | ML Model | Description |
|--------|------|-----------------|-----------------|----------|-------------|
| id | Raw | Generated | - | - | Execution ID (SE####) |
| component | Raw | MARA.MATNR | - | - | Component material |
| sku | Raw | Parent MATNR | - | - | Parent finished goods SKU |
| dc | Raw | T001W.WERKS | - | - | DC location |
| **net_req** | Derived | - | From BOM | - | **Net requirement** |
| **lot_size** | Derived | - | From Lot Sizing | - | **Order quantity** |
| lead_time_days | Raw | MARC.PLIFZ | - | - | Lead time |
| **source_type** | Raw | MARC.SOBSL | - | - | **Make (E) or Buy (F)** |
| supplier | Raw | MARC.LIFNR → LFA1.NAME1 | - | - | Vendor name or plant |
| on_time_pct | Raw | LFA1.Custom | - | - | Supplier on-time % |
| mode | Raw | Config | - | - | Transport mode (Sea/Air/Truck) |
| **release_date** | Derived | - | `need_date - lead_time` | - | **Order release date** |
| **need_date** | Derived | - | From MRP planning | - | **Required delivery date** |
| unit_cost | Raw | MBEW.VERPR or EINA.NETPR | - | - | Make cost or buy price |
| **order_value** | Derived | - | `lot_size × unit_cost` | - | **Total order value** |
| freight_util | Derived | - | Container utilization | - | Freight efficiency |
| **status** | Derived | - | Lead time analysis | - | **🟢 Normal / ⚠️ Tight / 🚨 Critical** |
| **action** | Derived | - | Make/Buy logic | - | **Generate PO / Trigger Production Order** |

**Make vs Buy Logic**:
```
Source Type Determination (SAP MARC.SOBSL):
- E (In-house production): Create Production Order (AFKO/AFPO)
- F (External procurement): Create Purchase Requisition (EBAN) → PO (EKKO)

Status Classification:
- 🟢 Normal: (need_date - today) >= lead_time × 1.2
- ⚠️ Tight: lead_time < (need_date - today) < lead_time × 1.2
- 🚨 Critical: (need_date - today) < lead_time (expedite required)

Action:
- Buy → Generate Purchase Requirement (send to procurement)
- Make → Trigger Production Order (send to manufacturing)
```

**SAP Tables for Make/Buy**:
- **Buy (Procurement)**:
  - `EBAN` - Purchase Requisition
  - `EKKO` - Purchase Order Header
  - `EKPO` - Purchase Order Items
  - `EINA` - Purchasing Info Record

- **Make (Production)**:
  - `AFKO` - Production Order Header
  - `AFPO` - Production Order Items
  - `PLAF` - Planned Orders

---

# COMMON SAP TABLES REFERENCE

## Master Data

| Table | Description | Key Fields |
|-------|-------------|------------|
| **T001W** | Plants/Facilities | WERKS (plant), NAME1 (name) |
| **MARA** | General Material Data | MATNR (material), MTART (type) |
| **MAKT** | Material Descriptions | MATNR, SPRAS (language), MAKTX (text) |
| **MARC** | Plant Data for Material | MATNR, WERKS, MINBE (reorder), EISBE (target), PLIFZ (lead time), BSTMI (MOQ), BSTRF (lot), SOBSL (make/buy) |
| **MARD** | Storage Location Data | MATNR, WERKS, LGORT (storage loc), LABST (stock) |
| **MBEW** | Material Valuation | MATNR, BWKEY (valuation area), VERPR (price) |
| **LFA1** | Vendor Master | LIFNR (vendor), NAME1 (name) |

## BOM

| Table | Description | Key Fields |
|-------|-------------|------------|
| **MAST** | Material to BOM Link | MATNR, WERKS, STLAN (BOM usage) |
| **STKO** | BOM Header | STLNR (BOM), STLAL (alternative) |
| **STPO** | BOM Items | STLNR, IDNRK (component), MENGE (quantity), AUSCH (scrap %) |

## Purchasing

| Table | Description | Key Fields |
|-------|-------------|------------|
| **EBAN** | Purchase Requisition | BANFN (req number), BNFPO (item) |
| **EKKO** | Purchase Order Header | EBELN (PO number), BEDAT (PO date), LIFNR (vendor) |
| **EKPO** | Purchase Order Items | EBELN, EBELP (item), MATNR, MENGE (quantity) |
| **EKET** | Scheduling Agreement Lines | EBELN, EBELP, EINDT (delivery date), MENGE (quantity) |
| **EINA** | Purchasing Info Record | INFNR, MATNR, LIFNR |

## Sales/Distribution

| Table | Description | Key Fields |
|-------|-------------|------------|
| **VBBE** | Sales Requirements (Stock) | MATNR, WERKS, VMENG (committed qty) |
| **LIPS** | Delivery Items | VBELN (delivery), POSNR (item), LFIMG (actual qty) |

## Production

| Table | Description | Key Fields |
|-------|-------------|------------|
| **PLAF** | Planned Orders | PLNUM (order), MATNR, GSMNG (quantity) |
| **AFKO** | Production Order Header | AUFNR (order number) |
| **AFPO** | Production Order Items | AUFNR, MATNR |

---

# ML MODELS REFERENCE

## 1. Time Series Forecasting (Demand)

**Model**: Prophet / ARIMA / LSTM Ensemble

**Input Features**:
- Historical sales (365+ days)
- Day of week, month, seasonality
- Promotions, holidays, events
- Weather, foot traffic
- Product lifecycle stage

**Output**:
- Daily/weekly demand forecast
- 95% confidence intervals (upper/lower bounds)
- Seasonality components
- Trend components

**Training Frequency**: Weekly
**Inference**: Daily (batch)
**Target Metrics**: MAPE < 15%, Coverage 95%

---

## 2. Safety Stock Optimization

**Model**: Reinforcement Learning (PPO) / Mathematical Optimization

**Input Features**:
- Demand forecast + uncertainty
- Lead time + variability
- Service level targets
- Holding costs, stockout costs
- Supplier reliability

**Output**:
- Optimal safety stock level
- Reorder point
- Target inventory

**Training Frequency**: Monthly
**Inference**: On-demand
**Target Metrics**: Minimize total cost, achieve service level

---

## 3. Economic Order Quantity (EOQ)

**Model**: RL Agent / Classic Wilson Formula with ML Enhancements

**Input Features**:
- Annual demand (from forecast)
- Order cost, holding cost
- Demand variability
- Storage constraints
- Freight consolidation opportunities

**Output**:
- Optimal order quantity
- Order frequency

**Training Frequency**: Monthly
**Inference**: On-demand

---

## 4. Stockout Risk Prediction

**Model**: XGBoost Classifier

**Input Features**:
- Current inventory, on-order
- Forecast demand (7-14 days)
- Lead time, supplier on-time rate
- Days of supply
- Historical stockout events

**Output**:
- Stockout probability (0-1)
- Risk classification (High/Med/Low)

**Training Frequency**: Bi-weekly
**Inference**: Daily (batch)
**Target Metrics**: AUC > 0.85

---

## 5. Demand Uncertainty Quantification

**Model**: Bayesian Neural Network

**Input Features**:
- Same as time series forecast
- Historical forecast accuracy
- Demand volatility metrics

**Output**:
- Confidence score (0-1)
- Prediction intervals

**Training Frequency**: Weekly
**Inference**: Daily

---

## 6. Transfer Learning (New Store Deployment)

**Model**: Few-Shot Learning / Transfer Learning

**Input Features**:
- Store attributes (size, location, type)
- Comparable store performance
- Market demographics
- Opening season

**Output**:
- Initial demand forecast
- Recommended stock levels

**Training Frequency**: Quarterly
**Inference**: As needed for new stores

---

# SUMMARY STATISTICS

## Total Column Count by Type

| Module | Raw (SAP) | Derived | ML | Total |
|--------|-----------|---------|-----|-------|
| StoreForecast | 7 | 1 | 6 | 14 |
| StoreHealthMonitor | 7 | 5 | 3 | 15 |
| StoreOptimization | 4 | 6 | 3 | 13 |
| StoreReplenishment | 16 | 8 | 4 | 28 |
| StoreFinancialImpact | 5 | 8 | 1 | 14 |
| StoreDeployment | 5 | 4 | 2 | 11 |
| DCDemandAggregation | 3 | 8 | 8 | 19 |
| DCHealthMonitor | 9 | 10 | 0 | 19 |
| DCOptimization | 5 | 7 | 1 | 13 |
| DCBOM | 5 | 5 | 0 | 10 |
| DCLotSize | 8 | 5 | 2 | 15 |
| DCPlanningTable | 5 | 6 | 0 | 11 |
| DCSupplierExecution | 8 | 5 | 0 | 13 |
| **TOTAL** | **87** | **78** | **30** | **195** |

## Column Type Distribution

- **Raw (SAP Tables)**: 87 columns (44.6%)
- **Derived (Calculations)**: 78 columns (40.0%)
- **ML (Predictive Models)**: 30 columns (15.4%)

---

**End of Document**
