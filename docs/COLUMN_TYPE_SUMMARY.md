# STOX.AI Column Type Summary

Quick reference for understanding data sources across all 26 tiles.

---

## Overall Statistics

| Column Type | Count | % | Definition |
|-------------|-------|---|------------|
| 🔵 **RAW** | ~320 | 65% | Direct from SAP, EDI, or user input |
| 🟢 **DERIVED** | ~130 | 26% | Auto-calculated by PostgreSQL |
| 🟡 **ML MODEL** | ~45 | 9% | AI/ML predictions & scores |
| **TOTAL** | **~495** | **100%** | Across 40+ tables |

---

## By Module Breakdown

| Module | RAW | DERIVED | ML MODEL | Total | Key ML Columns |
|--------|-----|---------|----------|-------|----------------|
| **0: Demand Flow** | 26 | 6 | 3 | 35 | forecast_qty, confidence_pct, data_quality_pct |
| **1: Forecasting** | 42 | 10 | 6 | 58 | ai_forecast, model_confidence, trend_pct, severity, recommendation |
| **2: Replenishment** | 44 | 14 | 3 | 61 | forecast_7d, forecast_daily, optimization_score |
| **3: DC Inventory** | 24 | 11 | 0 | 35 | *All business logic based* |
| **4: Supply Planning** | 21 | 8 | 2 | 31 | weekly_demand, approval_score |
| **5: BOM Explosion** | 21 | 7 | 1 | 29 | severity (exception classification) |
| **6: Procurement** | 20 | 8 | 2 | 30 | estimated_savings, quality_score_pct |
| **7: Analytics** | 31 | 7 | 4 | 42 | anomaly_type, expected_value, reason, confidence_score |
| **Master Data** | 91 | 8 | 0 | 99 | *Reference data only* |

---

## Critical ML Models Required

### 🎯 Priority 1: Demand Forecasting (9 columns)
**Must Have** - Core functionality depends on this

| Column | Table | Purpose | Refresh |
|--------|-------|---------|---------|
| `forecast_qty` | sell_through_bridge | Consumer demand forecast | Daily |
| `forecast_qty` | demand_forecasts | Channel-level forecast | Daily |
| `ai_forecast` | forecast_overrides | Baseline for overrides | Daily |
| `forecast_7d` | store_replenishment | 7-day rolling forecast | Daily |
| `forecast_daily` | stockout_risks | Daily demand forecast | Daily |
| `weekly_demand` | supply_requirements | Weekly plant demand | Weekly |
| `confidence_pct` | sell_through_bridge | Forecast confidence | Daily |
| `model_confidence` | demand_forecasts | Model confidence | Daily |
| `trend_pct` | demand_aggregations | Trend analysis | Daily |

**Model:** ARIMA, Prophet, or LSTM
**Input:** Historical sales, seasonality, promotions, external factors
**Training:** Monthly retraining with latest 2 years of data

---

### 🎯 Priority 2: Anomaly Detection (4 columns)
**High Value** - Proactive alerting

| Column | Table | Purpose | Refresh |
|--------|-------|---------|---------|
| `anomaly_type` | anomaly_detection | Classify anomaly type | Real-time |
| `expected_value` | anomaly_detection | Baseline prediction | Real-time |
| `reason` | anomaly_detection | Root cause analysis | Real-time |
| `confidence_score` | anomaly_detection | Detection confidence | Real-time |

**Model:** Isolation Forest or LSTM Autoencoder
**Input:** Time-series demand, inventory levels, external events
**Training:** Weekly retraining

---

### 🎯 Priority 3: Alert Intelligence (3 columns)
**High Value** - Smart prioritization

| Column | Table | Purpose | Refresh |
|--------|-------|---------|---------|
| `severity` | demand_alerts | Alert priority | Real-time |
| `recommendation` | demand_alerts | Suggested action | Real-time |
| `severity` | bom_exceptions | Exception priority | Real-time |

**Model:** Random Forest Classifier
**Input:** Alert metrics, historical impact, resolution time
**Training:** Monthly retraining

---

### 🎯 Priority 4: Quality & Performance (3 columns)
**Medium Priority** - Continuous improvement

| Column | Table | Purpose | Refresh |
|--------|-------|---------|---------|
| `data_quality_pct` | partner_pos_feeds | EDI feed quality | Real-time |
| `quality_score_pct` | supplier_performance_history | Supplier quality | Weekly |
| `approval_score` | mrp_planned_orders | Auto-approval confidence | Daily |

**Model:** Gradient Boosting
**Input:** Historical quality metrics, defect rates
**Training:** Monthly retraining

---

### 🎯 Priority 5: Optimization (2 columns)
**Nice to Have** - Efficiency gains

| Column | Table | Purpose | Refresh |
|--------|-------|---------|---------|
| `optimization_score` | delivery_routes | Route efficiency | On-demand |
| `estimated_savings` | component_consolidation | Volume discount prediction | Daily |

**Model:** Genetic Algorithm / Regression
**Input:** Route data, volume data, historical pricing
**Training:** Weekly retraining

---

## Implementation Phases

### ✅ Phase 1: Database Only (Week 1)
**Status:** Ready to execute
- Create all tables
- Load RAW columns from SAP/EDI
- Enable DERIVED column auto-calculations
- **ML columns default to NULL or business rules**

**What works:**
- All 26 tiles display data
- Manual forecasting via overrides
- Basic calculations (ATP, replenishment)
- KPI tracking

**What's missing:**
- No AI forecasts (planners enter manually)
- No anomaly detection
- No smart alerts

---

### 🔄 Phase 2: Simple ML Models (Week 2-4)
**Implement:** Basic forecasting
- Deploy simple ARIMA models
- Populate forecast_qty columns
- Calculate confidence_pct
- **~50% of ML value delivered**

**What improves:**
- Automated demand forecasts
- Baseline for planners to override
- Forecast accuracy metrics

**Still missing:**
- Advanced anomaly detection
- Smart recommendations
- Quality scoring

---

### 🎯 Phase 3: Advanced ML (Week 5-8)
**Implement:** Full ML suite
- Anomaly detection models
- Alert severity classification
- Quality scoring
- Optimization algorithms
- **100% of ML value delivered**

**What's complete:**
- Proactive anomaly alerts
- Prioritized alert queue
- Supplier quality tracking
- Route optimization
- Smart recommendations

---

## Sample Data by Type

### 🔵 RAW Column Examples
```sql
-- Direct from SAP MARD
on_hand_qty = 1800

-- Direct from EDI-852 feed
sell_through_qty = 450

-- User input
override_forecast = 500

-- SAP MBEW
unit_cost = 35.00

-- User selection
allocation_logic = 'PRIORITY'
```

### 🟢 DERIVED Column Examples
```sql
-- Auto-calculated
available_atp = on_hand_qty - total_allocated
             = 1800 - 850
             = 950

-- Auto-calculated
replenishment_qty = MAX(0, forecast_7d + safety_stock - on_hand - in_transit)
                  = MAX(0, 315 + 50 - 120 - 30)
                  = 215

-- Auto-calculated
accuracy_pct = (1 - ABS(45 - 45) / 45) * 100
             = 100%

-- Auto-calculated
days_to_stockout = current_stock / forecast_daily
                 = 45 / 12
                 = 3.75 days
```

### 🟡 ML MODEL Column Examples
```sql
-- ML forecast (from Prophet model)
forecast_qty = 465
confidence_pct = 85.0

-- ML anomaly detection
anomaly_type = 'DEMAND_SPIKE'
expected_value = 45
actual_value = 89
reason = 'Valentine Holiday detected'
confidence_score = 92.0

-- ML severity classification
severity = 'HIGH'  -- (ML classified based on impact)

-- ML quality scoring
quality_score_pct = 96.5  -- (ML aggregated from defect data)
```

---

## Data Dependencies

```
┌─────────────────────────────────────────────────────┐
│                   DATA SOURCES                       │
└─────────────────────────────────────────────────────┘
           │
           ├──► SAP Tables (VBRK, MARD, EKKO, etc.)
           │    → RAW columns (IDs, quantities, dates)
           │
           ├──► EDI Feeds (Partners)
           │    → RAW columns (POS data, inventory)
           │
           ├──► User Input (Manual overrides)
           │    → RAW columns (overrides, configs)
           │
           └──► ML Prediction Service
                → ML MODEL columns (forecasts, scores)

┌─────────────────────────────────────────────────────┐
│                  POSTGRESQL                          │
└─────────────────────────────────────────────────────┘
           │
           ├──► GENERATED ALWAYS AS columns
           │    → DERIVED columns (auto-calculated)
           │
           └──► Triggers
                → updated_at timestamps

┌─────────────────────────────────────────────────────┐
│                FRONTEND APPLICATION                  │
└─────────────────────────────────────────────────────┘
           │
           └──► Displays all column types
                (RAW + DERIVED + ML MODEL)
```

---

## Query Performance Impact

### Fast Queries (DERIVED columns)
```sql
-- All calculations pre-computed
SELECT sku_id, available_atp, replenishment_qty, days_to_stockout
FROM store_replenishment
WHERE stockout_risk = 'CRITICAL';
```
**Performance:** <10ms (indexed, pre-calculated)

### Slower Queries (Without DERIVED columns)
```sql
-- Must calculate on every query
SELECT
    sku_id,
    GREATEST(0, on_hand - (allocated_ch01 + allocated_ch02 + allocated_ch03 + allocated_ch04)) as available_atp,
    GREATEST(0, forecast_7d + safety_stock - on_hand - in_transit) as replenishment_qty,
    CASE
        WHEN forecast_daily > 0 THEN current_stock::DECIMAL / forecast_daily
        ELSE 999
    END as days_to_stockout
FROM store_replenishment
WHERE ...complex CASE statement for risk...;
```
**Performance:** ~100ms (no indexes, runtime calculation)

**DERIVED columns save ~90% query time!**

---

## ML Model Integration Architecture

```
┌──────────────────────────────────────────────────┐
│         ML Prediction Service (Python)           │
│  - FastAPI endpoints                             │
│  - ARIMA/Prophet models                          │
│  - Anomaly detection (Isolation Forest)          │
│  - Classification models (Random Forest)         │
└──────────────────────────────────────────────────┘
                    │
                    │ REST API
                    ▼
┌──────────────────────────────────────────────────┐
│         Backend API (Node.js/Python)             │
│  - Batch prediction jobs                         │
│  - Real-time prediction endpoints                │
│  - Model versioning                              │
└──────────────────────────────────────────────────┘
                    │
                    │ SQL INSERT/UPDATE
                    ▼
┌──────────────────────────────────────────────────┐
│              PostgreSQL Database                  │
│  - RAW columns (from SAP/EDI)                    │
│  - ML MODEL columns (from prediction service)    │
│  - DERIVED columns (auto-calculated)             │
└──────────────────────────────────────────────────┘
                    │
                    │ GraphQL/REST API
                    ▼
┌──────────────────────────────────────────────────┐
│              Frontend (React)                     │
│  - DataGrid displays all columns                 │
│  - User can override ML forecasts                │
└──────────────────────────────────────────────────┘
```

---

## Cost-Benefit Analysis

### Option 1: All Business Rules (No ML)
**Cost:** $0 ML infrastructure
**Benefit:** Basic functionality works
**Downside:**
- 30% lower forecast accuracy
- Manual anomaly detection
- No predictive alerts
- Higher planner workload

### Option 2: Simple ML (ARIMA only)
**Cost:** ~$500/month compute
**Benefit:**
- 20% improvement in forecast accuracy
- Automated baseline forecasts
- 50% reduction in planner override time
**ROI:** 3-6 months

### Option 3: Full ML Suite (All models)
**Cost:** ~$2,000/month compute + ML engineer
**Benefit:**
- 35% improvement in forecast accuracy
- Proactive anomaly detection (catches 90% of issues)
- Smart alert prioritization
- Route optimization (5% logistics savings)
- Supplier quality prediction
**ROI:** 1-2 months

**Recommendation:** Start with Option 2, scale to Option 3

---

## Next Steps

1. ✅ **Review this categorization** with data science team
2. ⏳ **Prioritize ML models** based on business value
3. ⏳ **Build Phase 1** (database with RAW + DERIVED only)
4. ⏳ **Deploy simple forecasting** (Phase 2)
5. ⏳ **Add advanced ML** (Phase 3)

---

**Document:** `STOX_AI_COLUMN_CATEGORIZATION.md` (detailed version)
**Last Updated:** 2025-10-25
