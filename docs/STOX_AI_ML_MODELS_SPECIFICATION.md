# STOX.AI ML Models Specification

## Overview

STOX.AI is a Smart Inventory & Supply Chain Optimization Platform requiring ~25-30 ML models across 14+ tiles. This document specifies all ML models, their inputs, outputs, data sources, and implementation details.

---

## Table of Contents

1. [ML Models by Tile](#ml-models-by-tile)
2. [Supply & Lead Time Analysis](#supply--lead-time-analysis)
3. [Implementation Priority](#high-priority-implementation-order)
4. [Data Requirements](#data-requirements)
5. [Tech Stack](#tech-stack)
6. [Files to Create](#files-to-modifycreate)
7. [Timeline](#estimated-timeline)

---

## ML Models by Tile

### Tile 0: SAP Data Hub
**Purpose**: Monitor SAP system connections, data quality, extraction jobs

| Model | Type | Notes |
|-------|------|-------|
| NONE | Infrastructure | Monitoring only - no predictive ML required |

**Data Sources**: SAP S/4HANA systems, ODQ delta queues

---

### Tile 1: Plant Inventory Intelligence
**Purpose**: Plant-level inventory analytics, SLOB analysis, GMROI tracking, ABC/XYZ segmentation

| Model | Type | Input Features | Output |
|-------|------|----------------|--------|
| ABC Classification | Rule-based | Inventory value, annual consumption | A/B/C class |
| XYZ Classification | Statistical | Demand coefficient of variation (CV) | X/Y/Z class |
| Anomaly Detection | Isolation Forest | Stock levels, turns, aging | Anomaly flag |
| Slow-Mover Clustering | K-means | Demand patterns, aging, turnover | Cluster ID |

**Data Sources**: MARD, MBEW, T001W, MARA

**ABC Classification Rules**:
- A: Top 80% of inventory value (typically 20% of SKUs)
- B: Next 15% of inventory value (typically 30% of SKUs)
- C: Remaining 5% of inventory value (typically 50% of SKUs)

**XYZ Classification Rules**:
- X: CV < 0.5 (stable demand)
- Y: 0.5 ≤ CV < 1.0 (variable demand)
- Z: CV ≥ 1.0 (highly variable/intermittent demand)

---

### Tile 2: Inventory Health Check
**Purpose**: SKU-level health scores, excess analysis, coverage metrics

| Model | Type | Input Features | Output |
|-------|------|----------------|--------|
| Health Score | Rule-based scoring | Days of supply, stockout risk, excess % | Score 0-100 |
| Risk Classification | Decision Tree / Logistic Regression | Stockout probability, demand volatility | Healthy/Moderate/High Risk |

**Data Sources**: MARD, MARC, MARA, VBRK/VBRP

**Health Score Formula**:
```
Health Score = w1 × Coverage_Score + w2 × Excess_Score + w3 × Stockout_Risk_Score
Where:
  Coverage_Score = min(100, (Days_of_Supply / Target_Days) × 100)
  Excess_Score = max(0, 100 - (Excess_Inventory / Max_Excess) × 100)
  Stockout_Risk_Score = (1 - Stockout_Probability) × 100
```

---

### Tile 3: Forecast Simulation
**Purpose**: Compare AI models, override forecasts, confirm baseline

| Model | Type | Use Case | Parameters |
|-------|------|----------|------------|
| SES (Simple Exponential Smoothing) | Exponential Smoothing | Stable demand | Alpha (smoothing constant) |
| Holt-Winters | Triple Exponential | Seasonal/trending | Trend, seasonality indices |
| ARIMA/SARIMA | Autoregressive | Time-series with autocorrelation | p, d, q, P, D, Q, m |
| Croston | Intermittent demand | Spare parts, slow movers | Probability of demand, avg size |
| Ensemble | Weighted average | Erratic patterns | Model weights |
| Bootstrap CI | Simulation | Uncertainty quantification | Number of iterations, confidence level |

**Data Sources**: VBRK/VBRP, MARD (52+ weeks minimum)

**Output Metrics**:
- Point forecast (1-month, 3-month, 6-month horizons)
- Confidence intervals (P10, P50, P90)
- MAPE (Mean Absolute Percentage Error)
- MAD (Mean Absolute Deviation)
- Bias (systematic over/under forecasting)

**Model Selection by Pattern**:
| Demand Pattern | Recommended Model |
|----------------|-------------------|
| Stable | SES |
| Seasonal | Holt-Winters |
| Trending | Holt-Winters |
| Intermittent | Croston |
| Erratic | Ensemble |

---

### Tile 4: Demand Intelligence
**Purpose**: Analyze demand patterns, detect anomalies, manage classification

| Model | Type | Input Features | Output |
|-------|------|----------------|--------|
| Anomaly Detection | Isolation Forest / LSTM Autoencoder | Demand series, seasonality | Anomaly probability (0-1) |
| Trend Analysis | Linear Regression | Time-windowed demand | Trend direction (Up/Down/Flat), slope |
| Pattern Classification | Decision Tree | CV, ADI, trend | Stable/Seasonal/Trending/Intermittent/Erratic |

**Data Sources**: Partner POS (ULTA, SEPHORA), VBRK/VBRP

**Anomaly Detection Thresholds**:
- Isolation Forest contamination: 0.05 (5% expected anomalies)
- Z-score threshold: |z| > 3 for univariate detection
- Alert when anomaly_probability > 0.8

**Pattern Classification Logic**:
```python
def classify_pattern(cv, adi, trend_slope):
    if cv < 0.5 and abs(trend_slope) < 0.01:
        return "Stable"
    elif cv < 0.5 and abs(trend_slope) >= 0.01:
        return "Trending"
    elif cv >= 0.5 and cv < 1.0 and adi < 1.32:
        return "Seasonal"
    elif adi >= 1.32:  # ADI > 1.32 indicates intermittent
        return "Intermittent"
    else:
        return "Erratic"
```

---

### Tile 5: Cost Policy Engine
**Purpose**: Manage cost methods, inventory policies, EOQ parameters

| Model | Type | Notes |
|-------|------|-------|
| NONE | Rule-based | Uses economic formulas (EOQ, holding cost calculations) |

**Formulas Used**:
- **EOQ**: `Q* = √(2DS/H)` where D=annual demand, S=order cost, H=holding cost
- **Holding Cost**: `H = Unit_Cost × Holding_Rate` (typically 15-25% annually)
- **Total Cost**: `TC = (D/Q)×S + (Q/2)×H`

---

### Tile 6: Forecasting Engine
**Purpose**: AI-powered demand forecasting with model selection and accuracy tracking

| Model | Type | Use Case | Complexity |
|-------|------|----------|------------|
| SES/ARIMA/Holt-Winters | Classical | Baseline models | Low |
| Prophet (Meta) | Additive regression | Auto seasonality, holidays | Medium |
| XGBoost Regressor | Gradient boosting | Feature-based forecasting | Medium |
| LSTM/GRU | Neural network | Long-term dependencies | High |
| Ensemble | Model combination | Best accuracy | Medium |

**Data Sources**: 104+ weeks demand by SKU/plant/channel

**Output**:
- 1-26 week forecast horizon
- 80%/95% confidence intervals
- Model accuracy ranking (by MAPE)
- Automatic model selection based on pattern

**Prophet Configuration**:
```python
model = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=True,
    daily_seasonality=False,
    changepoint_prior_scale=0.05,
    seasonality_prior_scale=10
)
```

**XGBoost Features**:
- Lag features (t-1, t-2, ..., t-52)
- Rolling statistics (7-day, 30-day mean/std)
- Calendar features (day_of_week, month, quarter)
- Promotional flags
- Holiday indicators

---

### Tile 7: MRP Parameter Optimizer
**Purpose**: AI-driven safety stock and reorder point optimization

| Model | Type | Formula/Method |
|-------|------|----------------|
| Safety Stock Optimization | Statistical | SS = Z × σ_d × √L |
| Reorder Point | Calculation | ROP = (Avg Daily Demand × LT) + SS |
| EOQ Optimization | Economic formula | EOQ = √(2DS/H) |
| Service Level Simulation | Monte Carlo | Fill rate, stockout probability |

**Input**: Demand stats, lead time, costs, service level targets
**Output**: Optimal SS, ROP, lot size, expected savings

**Safety Stock Formula**:
```
SS = Z × σ_d × √(L + σ_L² × d²/σ_d²)

Where:
  Z = Service level Z-score (95% → 1.65, 98% → 2.05, 99% → 2.33)
  σ_d = Standard deviation of daily demand
  L = Average lead time (days)
  σ_L = Standard deviation of lead time
  d = Average daily demand
```

**Monte Carlo Simulation**:
- Iterations: 10,000 simulations
- Inputs: Demand distribution, lead time distribution
- Outputs: Fill rate distribution, stockout probability, expected inventory levels

---

### Tile 8: Recommendations Hub
**Purpose**: AI-powered recommendations with approval workflow

| Model | Type | Input | Output |
|-------|------|-------|--------|
| Recommendation Ranking | Multi-criteria scoring | Impact, confidence, feasibility | Ranked list (1-100) |
| Approval Prediction | Logistic Regression | Historical approval patterns | Approval probability |

**Ranking Formula**:
```
Score = w1 × Impact_Score + w2 × Confidence_Score + w3 × Feasibility_Score

Where:
  Impact_Score = (Expected_Savings / Max_Savings) × 100
  Confidence_Score = Model_Accuracy × 100
  Feasibility_Score = (1 - Implementation_Complexity) × 100

Default weights: w1=0.5, w2=0.3, w3=0.2
```

---

### Tile 9: SAP Writeback
**Purpose**: Monitor parameter updates to SAP

| Model | Type | Notes |
|-------|------|-------|
| NONE | Integration | Monitoring and reconciliation only |

---

### Tile 10: Performance Monitor
**Purpose**: Track KPIs, service levels, optimization performance

| Model | Type | Input | Output |
|-------|------|-------|--------|
| KPI Anomaly Detection | Time-series anomaly | KPI values over time | Drift alerts |
| Trend Forecasting | Time-series | Historical KPIs | Future KPI values |
| Performance Attribution | Regression | Changes, outcomes | Impact attribution |

**KPI Anomaly Detection**:
- Method: Rolling Z-score with adaptive threshold
- Alert when: |z| > 2.5 for 2+ consecutive periods
- KPIs monitored: Service Level, Inventory Turns, GMROI, Stockout Rate

---

## Supply & Lead Time Analysis

| Model | Type | Input Features | Output |
|-------|------|----------------|--------|
| Lead Time Prediction | Regression | Vendor, PO qty, season, material type | LT forecast + std dev |
| Supplier Reliability | Logistic Regression / XGBoost | OTD %, variability, quality issues | Reliability score 0-1 |
| Lead Time Variance | Statistical | Historical LT data | σ_L for safety stock calculation |

**Data Sources**: EKKO/EKPO (Purchase Orders), MSEG (Goods Movements), LFA1 (Vendor Master)

**Lead Time Prediction Features**:
```python
features = [
    'vendor_id',           # Categorical
    'material_type',       # Categorical
    'order_quantity',      # Numeric
    'order_month',         # Numeric (1-12)
    'order_day_of_week',   # Numeric (0-6)
    'vendor_avg_lt',       # Numeric (historical)
    'vendor_lt_stddev',    # Numeric (historical)
    'material_complexity', # Ordinal (Low/Medium/High)
]
```

**Supplier Reliability Score**:
```
Reliability = 0.4 × OTD_Rate + 0.3 × Quality_Rate + 0.2 × (1 - LT_Variability) + 0.1 × Communication_Score
```

---

## High Priority Implementation Order

### Phase 1: Core Forecasting (Weeks 1-6)
| Priority | Model | Tile | Effort |
|----------|-------|------|--------|
| 1 | SES | Tile 3, 6 | Low |
| 2 | Holt-Winters | Tile 3, 6 | Medium |
| 3 | ARIMA/SARIMA | Tile 3, 6 | Medium |
| 4 | Croston | Tile 3, 6 | Low |
| 5 | Ensemble | Tile 3, 6 | Medium |

### Phase 2: Intelligence (Weeks 7-10)
| Priority | Model | Tile | Effort |
|----------|-------|------|--------|
| 6 | Isolation Forest | Tile 4 | Medium |
| 7 | ABC/XYZ Classification | Tile 1 | Low |
| 8 | Pattern Classification | Tile 4 | Low |
| 9 | Health Scoring | Tile 2 | Low |

### Phase 3: Optimization (Weeks 11-15)
| Priority | Model | Tile | Effort |
|----------|-------|------|--------|
| 10 | Safety Stock Optimization | Tile 7 | Medium |
| 11 | Monte Carlo Simulation | Tile 7 | Medium |
| 12 | Lead Time Prediction | Supply | Medium |
| 13 | EOQ Optimization | Tile 5 | Low |

### Phase 4: Advanced ML (Weeks 16-24)
| Priority | Model | Tile | Effort |
|----------|-------|------|--------|
| 14 | Prophet | Tile 6 | Medium |
| 15 | XGBoost Regressor | Tile 6 | Medium |
| 16 | LSTM/GRU | Tile 6 | High |
| 17 | Recommendation Ranking | Tile 8 | Medium |

---

## Data Requirements

| Requirement | Minimum | Recommended | Notes |
|-------------|---------|-------------|-------|
| Historical demand | 52 weeks | 104+ weeks | More data improves seasonality detection |
| Granularity | Weekly | Daily | Daily preferred for intermittent demand |
| Dimensions | SKU, Plant | SKU, Plant, Channel, Customer | Multi-dimensional for better insights |
| Lead time history | 20 POs per vendor | 50+ POs per vendor | For reliable LT prediction |
| Quality data | 6 months | 12+ months | For supplier reliability scoring |

---

## SAP Tables & Column Specifications

### Summary

| Table | Description | Columns Required |
|-------|-------------|------------------|
| MARA | General Material Data | 10 |
| MARC | Plant Data for Material | 17 |
| MARD | Storage Location Data | 10 |
| MBEW | Material Valuation | 11 |
| VBRK | Billing Document Header | 11 |
| VBRP | Billing Document Item | 14 |
| EKKO | Purchase Order Header | 14 |
| EKPO | Purchase Order Item | 13 |
| LFA1 | Vendor Master | 13 |
| MSEG | Goods Movement | 16 |
| **Total (Core)** | **10 tables** | **129 columns** |

### Additional Tables for Advanced ML

| Table | Description | Columns Required | Used For |
|-------|-------------|------------------|----------|
| HOLIDAY_CALENDAR | Holiday dates by country | 5 | Prophet, XGBoost seasonality |
| PROMOTIONS | Promotional campaigns | 8 | XGBoost promo features |
| ORDER_COSTS | Order/setup costs | 4 | EOQ optimization |
| QMEL | Quality Notifications | 10 | Supplier reliability scoring |
| PARTNER_POS | External POS data | 8 | ULTA/Sephora demand signals |
| **Total (Extended)** | **15 tables** | **~164 columns** |

---

### MARA - General Material Data
*Used for: Material attributes, ABC classification, pattern detection*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `MATNR` | Material Number | Primary key, joins all tables |
| `MTART` | Material Type | Classification, lead time prediction |
| `MATKL` | Material Group | Segmentation, pattern classification |
| `MEINS` | Base Unit of Measure | Unit conversion |
| `BRGEW` | Gross Weight | Lead time prediction feature |
| `NTGEW` | Net Weight | Lead time prediction feature |
| `GEWEI` | Weight Unit | Unit conversion |
| `VOLUM` | Volume | Lead time prediction feature |
| `PRDHA` | Product Hierarchy | Hierarchy-based forecasting |
| `ERSDA` | Created On | Material age analysis |

---

### MARC - Plant Data for Material
*Used for: MRP parameters, safety stock, reorder points*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `MATNR` | Material Number | Join key |
| `WERKS` | Plant | Plant-level analysis |
| `DISMM` | MRP Type | Parameter optimization |
| `DISPO` | MRP Controller | Grouping |
| `DISLS` | Lot Sizing Procedure | EOQ optimization |
| `BESKZ` | Procurement Type | Classification |
| `SOBSL` | Special Procurement | Lead time factors |
| `PLIFZ` | Planned Delivery Time | Lead time baseline |
| `WEBAZ` | GR Processing Time | Lead time calculation |
| `EISBE` | Safety Stock | Current SS (comparison) |
| `MINBE` | Reorder Point | Current ROP (comparison) |
| `MABST` | Maximum Stock Level | Excess detection |
| `BSTMI` | Minimum Lot Size | EOQ constraints |
| `BSTMA` | Maximum Lot Size | EOQ constraints |
| `BSTFE` | Fixed Lot Size | Lot sizing |
| `PERKZ` | Period Indicator | Demand aggregation |
| `STRGR` | Planning Strategy Group | Forecast method selection |

---

### MARD - Storage Location Data
*Used for: Inventory levels, stock analysis, SLOB detection*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `MATNR` | Material Number | Join key |
| `WERKS` | Plant | Plant-level grouping |
| `LGORT` | Storage Location | Location-level analysis |
| `LABST` | Unrestricted Stock | Current inventory |
| `UMLME` | Stock in Transfer | In-transit inventory |
| `INSME` | Quality Inspection Stock | Blocked stock |
| `EINME` | Restricted Stock | Blocked stock |
| `SPEME` | Blocked Stock | SLOB analysis |
| `RETME` | Returns Stock | Returns analysis |
| `ERSDA` | Date of Last Change | Aging analysis |

---

### MBEW - Material Valuation
*Used for: Cost calculations, GMROI, holding costs*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `MATNR` | Material Number | Join key |
| `BWKEY` | Valuation Area | Cost center grouping |
| `BWTAR` | Valuation Type | Cost method |
| `VPRSV` | Price Control | Standard/Moving avg |
| `VERPR` | Moving Average Price | Current cost |
| `STPRS` | Standard Price | Standard cost |
| `PEINH` | Price Unit | Cost normalization |
| `LBKUM` | Total Valuated Stock | Inventory value calc |
| `SALK3` | Total Value | Direct inventory value |
| `LFGJA` | Last Fiscal Year | Historical cost |
| `LFMON` | Last Period | Period-level tracking |

---

### VBRK - Billing Document Header
*Used for: Sales history, demand dating*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `VBELN` | Billing Document | Join key to VBRP |
| `FKART` | Billing Type | Filter invoices vs credits |
| `FKDAT` | Billing Date | Time-series dating |
| `WAERK` | Currency | Value normalization |
| `KURRF` | Exchange Rate | Currency conversion |
| `KUNAG` | Sold-to Party | Customer segmentation |
| `VKORG` | Sales Organization | Org-level analysis |
| `VTWEG` | Distribution Channel | Channel-level forecasting |
| `SPART` | Division | Product division |
| `NETWR` | Net Value | Revenue calculations |
| `BUKRS` | Company Code | Entity grouping |

---

### VBRP - Billing Document Item
*Used for: Demand history (primary source), SKU-level sales*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `VBELN` | Billing Document | Join to VBRK |
| `POSNR` | Item Number | Line item |
| `MATNR` | Material Number | SKU identification |
| `WERKS` | Plant | Plant-level demand |
| `FKIMG` | Billed Quantity | **Primary demand signal** |
| `VRKME` | Sales Unit | Unit conversion |
| `NETWR` | Net Value | Revenue/pricing |
| `WAVWR` | Cost | COGS calculation |
| `MWSBP` | Tax Amount | Gross margin calc |
| `AUBEL` | Sales Document | Link to sales order |
| `VGBEL` | Reference Document | Delivery reference |
| `PRSDT` | Pricing Date | Seasonality detection |
| `KURSK` | Exchange Rate | Currency normalization |
| `PSTYV` | Sales Document Item Category | Item type filtering |

---

### EKKO - Purchase Order Header
*Used for: Lead time analysis, supplier data*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `EBELN` | PO Number | Join key to EKPO |
| `BUKRS` | Company Code | Entity grouping |
| `BSTYP` | Document Category | Filter POs vs contracts |
| `BSART` | Document Type | Order type |
| `LIFNR` | Vendor Number | **Supplier analysis** |
| `EKORG` | Purchasing Org | Org grouping |
| `EKGRP` | Purchasing Group | Buyer grouping |
| `WAERS` | Currency | Cost normalization |
| `BEDAT` | PO Date | **Lead time start** |
| `KDATB` | Validity Start | Contract analysis |
| `KDATE` | Validity End | Contract analysis |
| `INCO1` | Incoterms | Shipping terms |
| `INCO2` | Incoterms Location | Location |
| `ZTERM` | Payment Terms | Supplier terms |

---

### EKPO - Purchase Order Item
*Used for: Lead time, order quantities, material-supplier mapping*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `EBELN` | PO Number | Join to EKKO |
| `EBELP` | PO Item | Line item |
| `MATNR` | Material Number | Material mapping |
| `WERKS` | Plant | Plant-level procurement |
| `LGORT` | Storage Location | Location tracking |
| `MENGE` | PO Quantity | **Order quantity feature** |
| `MEINS` | Order Unit | Unit conversion |
| `NETPR` | Net Price | Cost analysis |
| `PEINH` | Price Unit | Price normalization |
| `EINDT` | Delivery Date | **Requested delivery** |
| `MATKL` | Material Group | Grouping |
| `LOEKZ` | Deletion Indicator | Filter deleted items |
| `AFNAM` | Requisitioner | Demand source |

---

### LFA1 - Vendor Master
*Used for: Supplier reliability scoring*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `LIFNR` | Vendor Number | Primary key |
| `NAME1` | Vendor Name | Display |
| `NAME2` | Vendor Name 2 | Display |
| `LAND1` | Country | Geographic risk |
| `ORT01` | City | Location |
| `REGIO` | Region | Regional analysis |
| `SORTL` | Sort Field | Grouping |
| `STRAS` | Street | Address |
| `PSTLZ` | Postal Code | Location |
| `ERDAT` | Created Date | Vendor tenure |
| `KTOKK` | Account Group | Vendor classification |
| `LOEVM` | Deletion Flag | Active vendor filter |
| `SPERR` | Central Block | Active vendor filter |

---

### MSEG - Goods Movement
*Used for: Lead time calculation (GR date), receipt tracking*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `MBLNR` | Material Document | Document ID |
| `MJAHR` | Document Year | Date filtering |
| `ZEILE` | Item Number | Line item |
| `BWART` | Movement Type | **Filter: 101=GR, 102=GR reversal** |
| `MATNR` | Material Number | Material identification |
| `WERKS` | Plant | Plant-level tracking |
| `LGORT` | Storage Location | Location tracking |
| `MENGE` | Quantity | Receipt quantity |
| `MEINS` | Unit of Measure | Unit conversion |
| `EBELN` | PO Number | **Join to EKKO/EKPO** |
| `EBELP` | PO Item | Line item join |
| `BUDAT` | Posting Date | **Actual GR date** |
| `CPUDT` | Entry Date | System date |
| `CPUTM` | Entry Time | Timestamp |
| `LIFNR` | Vendor | Supplier tracking |
| `GRUND` | Reason for Movement | Movement analysis |

---

### HOLIDAY_CALENDAR - Holiday Reference Data
*Used for: Prophet holidays, XGBoost calendar features*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `COUNTRY_CODE` | Country ISO code | Country filtering |
| `HOLIDAY_DATE` | Date of holiday | Time-series alignment |
| `HOLIDAY_NAME` | Holiday name | Feature engineering |
| `HOLIDAY_TYPE` | Type (National/Regional/Religious) | Weighting |
| `YEAR` | Year | Date filtering |

**Sample Data**:
```sql
INSERT INTO holiday_calendar VALUES
('US', '2024-11-28', 'Thanksgiving', 'National', 2024),
('US', '2024-12-25', 'Christmas', 'National', 2024),
('US', '2024-07-04', 'Independence Day', 'National', 2024);
```

---

### PROMOTIONS - Promotional Campaign Data
*Used for: XGBoost promo features, demand spike explanation*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `PROMO_ID` | Promotion identifier | Primary key |
| `MATNR` | Material Number | SKU-level promos |
| `MATKL` | Material Group | Group-level promos |
| `START_DATE` | Promotion start | Feature window |
| `END_DATE` | Promotion end | Feature window |
| `PROMO_TYPE` | Type (Discount/BOGO/Bundle) | Feature engineering |
| `DISCOUNT_PCT` | Discount percentage | Impact estimation |
| `CHANNEL` | Sales channel | Channel-specific promos |

**Sample Data**:
```sql
INSERT INTO promotions VALUES
('P2024001', 'MAT001', NULL, '2024-11-24', '2024-11-30', 'Discount', 20.0, 'RETAIL'),
('P2024002', NULL, 'COSMETICS', '2024-12-01', '2024-12-31', 'Bundle', 15.0, 'ALL');
```

---

### ORDER_COSTS - Cost Parameters for EOQ
*Used for: EOQ optimization, total cost calculation*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `WERKS` | Plant | Plant-level costs |
| `MATKL` | Material Group | Group-level costs |
| `ORDER_COST` | Cost per order ($) | EOQ formula (S) |
| `HOLDING_RATE` | Annual holding rate (%) | EOQ formula (H) |

**Sample Data**:
```sql
INSERT INTO order_costs VALUES
('1000', 'COSMETICS', 150.00, 0.22),  -- $150 per order, 22% holding
('1000', 'FRAGRANCE', 200.00, 0.25);
```

---

### QMEL - Quality Notifications (Optional)
*Used for: Supplier reliability scoring, quality rate calculation*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `QMNUM` | Notification Number | Primary key |
| `QMART` | Notification Type | Filter quality issues |
| `MATNR` | Material Number | Material tracking |
| `LIFNR` | Vendor Number | Supplier quality |
| `ERDAT` | Created Date | Time-series |
| `QMGRP` | Code Group | Issue categorization |
| `QMCOD` | Code | Specific issue |
| `RKMNG` | Complaint Quantity | Severity |
| `LTRMN` | Deadline Date | Response tracking |
| `QMKAT` | Catalog Type | Issue classification |

---

### PARTNER_POS - External POS Data (Optional)
*Used for: Downstream demand signals from retail partners*

| Column | Description | ML Use Case |
|--------|-------------|-------------|
| `PARTNER_ID` | Partner identifier | ULTA, SEPHORA, etc. |
| `PARTNER_SKU` | Partner's SKU code | Cross-reference |
| `MATNR` | Internal Material Number | Join to master |
| `POS_DATE` | Point of sale date | Time-series |
| `POS_QTY` | Quantity sold | **Downstream demand** |
| `STORE_ID` | Store identifier | Location-level |
| `CHANNEL` | Sales channel | Online/Store |
| `PRICE` | Selling price | Price elasticity |

---

## Lead Time Calculation Example

```sql
-- Actual Lead Time = GR Date - PO Date
SELECT
    EKKO.LIFNR AS vendor,
    EKPO.MATNR AS material,
    EKKO.BEDAT AS po_date,
    MSEG.BUDAT AS gr_date,
    (MSEG.BUDAT - EKKO.BEDAT) AS actual_lead_time_days
FROM EKKO
JOIN EKPO ON EKKO.EBELN = EKPO.EBELN
JOIN MSEG ON EKPO.EBELN = MSEG.EBELN AND EKPO.EBELP = MSEG.EBELP
WHERE MSEG.BWART = '101'  -- Goods Receipt
  AND EKKO.BSTYP = 'F';   -- Standard PO
```

---

## ML Model to Data Mapping

| ML Model | Primary Tables | Key Columns |
|----------|---------------|-------------|
| **SES/ARIMA/Holt-Winters** | VBRK, VBRP | FKDAT, FKIMG, MATNR, WERKS |
| **Prophet** | VBRK, VBRP, HOLIDAY_CALENDAR | + HOLIDAY_DATE, HOLIDAY_NAME |
| **XGBoost** | VBRK, VBRP, PROMOTIONS, HOLIDAY_CALENDAR | + PROMO_TYPE, DISCOUNT_PCT |
| **Croston** | VBRK, VBRP | FKDAT, FKIMG (intermittent series) |
| **ABC Classification** | MARD, MBEW, VBRP | LABST, SALK3, FKIMG |
| **XYZ Classification** | VBRP | FKIMG (calculate CV) |
| **Isolation Forest** | MARD, VBRP | LABST, FKIMG time series |
| **Health Scoring** | MARD, MARC, VBRP | LABST, EISBE, MINBE, demand |
| **Safety Stock** | VBRP, EKKO, MSEG | Demand σ, BEDAT, BUDAT |
| **Lead Time Prediction** | EKKO, EKPO, MSEG, LFA1 | BEDAT, BUDAT, LIFNR, MENGE |
| **Supplier Reliability** | EKKO, MSEG, LFA1, QMEL | OTD calc, QMNUM |
| **EOQ Optimization** | VBRP, MBEW, ORDER_COSTS | FKIMG, VERPR, ORDER_COST |

---

## Tech Stack

| Component | Technology | Version | Notes |
|-----------|------------|---------|-------|
| Time-Series | statsmodels | 0.14+ | SES, ARIMA, Holt-Winters |
| Time-Series | prophet | 1.1+ | Meta's forecasting library |
| Time-Series | pmdarima | 2.0+ | Auto-ARIMA |
| ML Models | scikit-learn | 1.3+ | Classification, regression |
| ML Models | XGBoost | 2.0+ | Gradient boosting |
| ML Models | LightGBM | 4.0+ | Fast gradient boosting |
| Deep Learning | PyTorch | 2.0+ | LSTM/GRU models |
| Optimization | PuLP | 2.7+ | Linear programming |
| Optimization | scipy.optimize | 1.11+ | Non-linear optimization |
| Simulation | NumPy | 1.25+ | Monte Carlo |
| API | FastAPI | 0.100+ | Existing backend |
| Database | PostgreSQL | 14+ | mantrix_nexxt database |

---

## Files to Modify/Create

### Backend (Python)

```
backend/src/core/ml/
├── __init__.py
├── forecasting.py          # SES, ARIMA, Holt-Winters, Prophet, Croston
├── anomaly_detection.py    # Isolation Forest, LSTM Autoencoder
├── optimization.py         # Safety stock, EOQ, Monte Carlo
├── classification.py       # ABC/XYZ, pattern classification, health scoring
├── lead_time.py           # Lead time prediction, supplier reliability
├── ensemble.py            # Model combination, weighted averaging
└── utils.py               # Common utilities, metrics calculation

backend/src/api/
└── stox_ml_routes.py      # ML API endpoints
```

### Frontend (React)

```
frontend/src/
├── components/stox/
│   └── [existing tiles]   # Update for model selection UI
└── services/
    └── mlApi.js           # ML API client
```

### Database

```sql
-- ML model tracking tables
CREATE TABLE ml_model_runs (
    id UUID PRIMARY KEY,
    model_type VARCHAR(50),
    tile_id VARCHAR(20),
    sku_id VARCHAR(50),
    plant_id VARCHAR(10),
    run_timestamp TIMESTAMP,
    parameters JSONB,
    metrics JSONB,
    forecast_data JSONB
);

CREATE TABLE ml_model_performance (
    id UUID PRIMARY KEY,
    model_type VARCHAR(50),
    sku_id VARCHAR(50),
    mape DECIMAL(10,4),
    mad DECIMAL(10,4),
    bias DECIMAL(10,4),
    evaluation_date DATE
);
```

---

## Estimated Timeline

| Phase | Duration | Models | Deliverables |
|-------|----------|--------|--------------|
| Phase 1 | 4-6 weeks | 5 core forecasting | SES, ARIMA, Holt-Winters, Croston, Ensemble |
| Phase 2 | 3-4 weeks | 4 intelligence | Anomaly detection, ABC/XYZ, patterns, health |
| Phase 3 | 4-5 weeks | 4 optimization | Safety stock, Monte Carlo, lead time, EOQ |
| Phase 4 | 6-8 weeks | 4+ advanced | Prophet, XGBoost, LSTM, recommendations |

**Total**: 4-6 months for full ML suite

---

## API Endpoints (Proposed)

```
POST /api/v1/stox/ml/forecast
  - Input: sku_id, plant_id, horizon_weeks, model_type (optional)
  - Output: forecast_values, confidence_intervals, metrics

POST /api/v1/stox/ml/anomaly-detect
  - Input: sku_id, plant_id, demand_series
  - Output: anomaly_flags, anomaly_scores, detected_patterns

POST /api/v1/stox/ml/optimize-parameters
  - Input: sku_id, plant_id, service_level_target, cost_parameters
  - Output: optimal_safety_stock, optimal_rop, expected_savings

GET /api/v1/stox/ml/model-performance
  - Input: model_type, date_range
  - Output: accuracy_metrics, comparison_data
```

---

## References

- **Croston's Method**: Croston, J.D. (1972). Forecasting and Stock Control for Intermittent Demands
- **Holt-Winters**: Winters, P.R. (1960). Forecasting Sales by Exponentially Weighted Moving Averages
- **Safety Stock**: Silver, E.A., Pyke, D.F., Peterson, R. (1998). Inventory Management and Production Planning
- **Prophet**: Taylor, S.J., Letham, B. (2018). Forecasting at Scale
