# STOX.AI Data & Configuration Guide

## Table of Contents
1. [Data Classification by Tile](#data-classification-by-tile)
2. [Multi-Tenant Configuration Architecture](#multi-tenant-configuration-architecture)
3. [Quick Customer Enablement](#quick-customer-enablement)

---

# Part 1: Data Classification by Tile

## Overview
All data fields in STOX.AI fall into three categories:
- **Raw Data**: Direct from source systems (SAP, ERP, databases)
- **Derived Data**: Calculated from raw data using formulas/aggregations (no ML)
- **ML-Derived Data**: Output from ML models (classification, prediction, optimization)

### Summary Statistics
| Category | Fields | Percentage |
|----------|--------|------------|
| Raw Data | ~45 | 30% |
| Derived Data | ~55 | 37% |
| ML-Derived | ~50 | 33% |

---

## Tile 0: SAP Data Hub
**Purpose**: Monitor SAP system connections, data quality, extraction jobs

| Field | Type | Source/Method |
|-------|------|---------------|
| Connection Status | Raw | SAP System Check |
| Data Quality Score | Derived | Formula: completeness + accuracy metrics |
| Extraction Job Status | Raw | ODQ Queue Status |
| Record Counts | Raw | Table counts from SAP |
| Last Sync Time | Raw | Timestamp from extraction log |
| Error Counts | Derived | Aggregation of error logs |

**ML Models**: None (infrastructure monitoring only)

---

## Tile 1: Plant Inventory Intelligence
**Purpose**: Plant-level inventory analytics, SLOB analysis, GMROI tracking, ABC/XYZ segmentation

| Field | Type | Source/Method |
|-------|------|---------------|
| Material ID | Raw | SAP MARD table |
| Material Name | Raw | SAP MARA table |
| Plant | Raw | SAP T001W table |
| Stock Quantity | Raw | SAP MARD (LABST) |
| Stock Value | Raw | SAP MBEW |
| Annual Consumption | Raw | SAP MB51/MSEG aggregation |
| ABC Class | ML-Derived | Rule-based classification (80/15/5 rule) |
| XYZ Class | ML-Derived | Statistical: CV < 0.5 = X, 0.5-1.0 = Y, > 1.0 = Z |
| GMROI | Derived | Gross Margin / Avg Inventory Investment |
| Inventory Turns | Derived | COGS / Average Inventory |
| Days on Hand | Derived | (Inventory / Daily Usage) |
| SLOB Value | Derived | Stock where age > threshold or no movement |
| Anomaly Flag | ML-Derived | Isolation Forest model |
| Slow-Mover Cluster | ML-Derived | K-means clustering |

---

## Tile 2: Inventory Health Check
**Purpose**: SKU-level health scores, excess analysis, coverage metrics

| Field | Type | Source/Method |
|-------|------|---------------|
| Material ID | Raw | SAP MARD |
| Stock Quantity | Raw | SAP MARD |
| Stock Value | Raw | SAP MBEW |
| Age (days) | Derived | Current Date - Receipt Date |
| DOH (Days on Hand) | Derived | Stock / Daily Demand |
| Coverage (months) | Derived | Stock / Monthly Demand |
| Excess Qty | Derived | Stock - (Safety Stock + Pipeline) |
| Health Score (0-100) | ML-Derived | Gradient Boosting model |
| Risk Level | ML-Derived | Derived from Health Score thresholds |
| Target Days | Derived | Safety Stock Days + Lead Time |
| Write-off Risk | ML-Derived | Logistic Regression probability |
| Recommended Action | ML-Derived | Decision tree classifier |

---

## Tile 3: Demand Intelligence
**Purpose**: Demand pattern analysis, anomaly detection, classification management

| Field | Type | Source/Method |
|-------|------|---------------|
| Material ID | Raw | SAP MARA |
| Material Name | Raw | SAP MARA |
| Plant | Raw | SAP T001W |
| Avg Daily Demand | Derived | Sum(Demand) / Days |
| Peak Demand | Derived | MAX(daily demand) |
| Min Demand | Derived | MIN(daily demand) |
| Standard Deviation | Derived | STDDEV(demand) |
| CV (Coefficient of Variation) | Derived | StdDev / Mean |
| ADI (Average Demand Interval) | Derived | Avg periods between non-zero demand |
| Pattern | ML-Derived | Pattern classifier (Stable/Trending/Seasonal/Intermittent/Erratic) |
| Trend | ML-Derived | Trend detection model (Up/Down/Flat) |
| Seasonality Index | ML-Derived | Seasonal decomposition |
| Anomaly Count | ML-Derived | Isolation Forest anomaly detection |
| ABC Class | ML-Derived | Value-based classification |
| XYZ Class | ML-Derived | Variability-based classification |
| Risk Score | ML-Derived | Composite risk model |
| Forecast Accuracy | Derived | (1 - MAPE) * 100 |
| Reclassification Rec | ML-Derived | Rule-based + ML recommendation |
| Volatility Score | Derived | CV * 100 |
| Supply Risk | ML-Derived | Risk model output |
| Demand Risk | ML-Derived | Risk model output |

---

## Tile 4: Forecasting Engine
**Purpose**: AI-powered demand forecasting with model selection

| Field | Type | Source/Method |
|-------|------|---------------|
| Material ID | Raw | SAP MARA |
| Material Name | Raw | SAP MARA |
| Plant | Raw | SAP T001W |
| Pattern | ML-Derived | Demand pattern classifier |
| Selected Model | ML-Derived | Auto model selection algorithm |
| Forecast 1M | ML-Derived | Time series forecast (SES/HW/Croston/etc.) |
| Forecast 3M | ML-Derived | Time series forecast |
| Forecast 6M | ML-Derived | Time series forecast |
| P10 (10th percentile) | ML-Derived | Bootstrap/probabilistic forecast |
| P90 (90th percentile) | ML-Derived | Bootstrap/probabilistic forecast |
| MAPE | Derived | Mean Absolute Percentage Error |
| MAE | Derived | Mean Absolute Error |
| RMSE | Derived | Root Mean Square Error |
| Bias | Derived | (Forecast - Actual) / Actual |
| Accuracy Rating | Derived | Based on MAPE thresholds |
| Bias Direction | Derived | Based on bias value thresholds |
| Model Comparison MAPE | ML-Derived | Cross-validation results per model |
| Confidence Level | ML-Derived | Model confidence score |

**ML Models**: SES, Holt-Winters, Croston, SARIMA, Ensemble, Bootstrap

---

## Tile 5: MRP Parameter Optimizer
**Purpose**: Optimize safety stock, reorder points, lot sizes

| Field | Type | Source/Method |
|-------|------|---------------|
| Material ID | Raw | SAP MARC |
| Material Name | Raw | SAP MARA |
| MRP Type | Raw | SAP MARC (DISMM) |
| ABC Class | ML-Derived | Classification model |
| Current Safety Stock | Raw | SAP MARC (EISBE) |
| Optimal Safety Stock | ML-Derived | Safety stock optimization model |
| SS Difference | Derived | Current SS - Optimal SS |
| SS Action | Derived | Based on difference thresholds |
| Current ROP | Raw | SAP MARC (MINBE) |
| Optimal ROP | ML-Derived | ROP optimization model |
| ROP Difference | Derived | Current ROP - Optimal ROP |
| Current Lot Size | Raw | SAP MARC (BSTFE) |
| Optimal Lot Size | ML-Derived | EOQ/Lot size optimizer |
| Lot Size Change | Derived | Boolean: current != optimal |
| Service Level | Derived | (1 - Stockout Events / Total Demands) |
| Fill Rate | Derived | Qty Fulfilled / Qty Demanded |
| Stockout Risk | ML-Derived | Risk classification model |
| Savings Potential | ML-Derived | Cost optimization model output |
| Lead Time | Raw | SAP MARC (PLIFZ) |
| Demand Variability | Derived | CV of demand |
| Supply Variability | Derived | CV of lead time |
| Review Cycle | Raw | SAP MARC configuration |
| Last Optimized | Raw | Timestamp |

**ML Models**: Safety Stock Optimizer, Dynamic ROP Calculator, Lot Size Optimizer

---

## Tile 6: Cost Policy Engine
**Purpose**: Manage cost methods, inventory policies, EOQ parameters

| Field | Type | Source/Method |
|-------|------|---------------|
| Material ID | Raw | SAP MBEW |
| Material Name | Raw | SAP MARA |
| Category | Raw | SAP material group |
| Cost Type/Method | Raw | SAP MBEW (VPRSV) |
| Standard Cost | Raw | SAP MBEW (STPRS) |
| Moving Average Cost | Raw | SAP MBEW (VERPR) |
| Last Purchase Cost | Raw | SAP EKPO/EKBE |
| Variance | Derived | (Moving Avg - Standard) / Standard * 100 |
| Status | Derived | Based on variance thresholds |
| Holding Cost % | Raw/Configured | Policy configuration |
| Ordering Cost | Raw/Configured | Policy configuration |
| Lead Time Days | Raw | SAP MARC (PLIFZ) |
| Min Order Qty | Raw | SAP MARC (BSTMI) |
| Safety Stock Days | Derived | Safety Stock / Daily Demand |
| Reorder Point | Raw | SAP MARC (MINBE) |
| EOQ (Economic Order Qty) | ML-Derived | EOQ optimization model |
| Last Review Date | Raw | Timestamp |
| Next Review Date | Derived | Last Review + Review Cycle |
| Annual Volume | Derived | Sum of annual demand |
| Annual Value | Derived | Annual Volume * Unit Cost |

**ML Models**: EOQ Optimizer, Cost Policy Recommender

---

## Tile 7: Procurement Intelligence
**Purpose**: Purchase order analytics, supplier performance, spend analysis

| Field | Type | Source/Method |
|-------|------|---------------|
| PO Number | Raw | SAP EKKO |
| Vendor | Raw | SAP LFA1 |
| Material | Raw | SAP EKPO |
| PO Quantity | Raw | SAP EKPO (MENGE) |
| PO Value | Raw | SAP EKPO (NETWR) |
| Delivery Date | Raw | SAP EKET |
| Actual Receipt Date | Raw | SAP EKBE |
| Lead Time Actual | Derived | Receipt Date - PO Date |
| Lead Time Variance | Derived | Actual LT - Planned LT |
| On-Time Delivery % | Derived | On-time deliveries / Total deliveries |
| Supplier Score | ML-Derived | Supplier performance model |
| Price Trend | ML-Derived | Price forecasting model |
| Demand-Supply Gap | Derived | Demand - Available Supply |
| Recommended Supplier | ML-Derived | Supplier selection model |
| Order Recommendation | ML-Derived | Procurement optimization |

---

## Tile 8: Stock Rebalancing
**Purpose**: Multi-plant inventory optimization, transfer recommendations

| Field | Type | Source/Method |
|-------|------|---------------|
| Material ID | Raw | SAP MARD |
| Source Plant | Raw | SAP T001W |
| Target Plant | Raw | SAP T001W |
| Source Stock | Raw | SAP MARD (LABST) |
| Target Stock | Raw | SAP MARD (LABST) |
| Source DOH | Derived | Stock / Daily Demand |
| Target DOH | Derived | Stock / Daily Demand |
| Transfer Qty | ML-Derived | Network optimization model |
| Transfer Cost | Derived | Qty * Unit Transfer Cost |
| Savings | ML-Derived | Optimization model output |
| Priority | ML-Derived | Urgency classification |
| Service Impact | ML-Derived | Service level simulation |

**ML Models**: Multi-Echelon Optimizer, Network Flow Optimizer

---

## Tile 9: Obsolescence Management
**Purpose**: Identify and manage obsolete/slow-moving inventory

| Field | Type | Source/Method |
|-------|------|---------------|
| Material ID | Raw | SAP MARD |
| Material Name | Raw | SAP MARA |
| Stock Quantity | Raw | SAP MARD |
| Stock Value | Raw | SAP MBEW |
| Last Movement Date | Raw | SAP MSEG |
| Days Since Movement | Derived | Current Date - Last Movement |
| Movement Frequency | Derived | Count of movements / Time period |
| Lifecycle Stage | ML-Derived | Lifecycle classifier (Growth/Mature/Decline/EOL) |
| Obsolescence Risk | ML-Derived | Obsolescence prediction model |
| Write-off Probability | ML-Derived | Logistic regression probability |
| Recovery Value | ML-Derived | Value estimation model |
| Recommended Action | ML-Derived | Disposition recommendation (Sell/Scrap/Reuse) |
| Alternative Materials | ML-Derived | Product substitution model |

**ML Models**: Lifecycle Classifier, Obsolescence Predictor, Disposition Recommender

---

## Tile 10: Safety Stock Simulator
**Purpose**: What-if analysis for safety stock levels

| Field | Type | Source/Method |
|-------|------|---------------|
| Material ID | Raw | SAP MARC |
| Current SS | Raw | SAP MARC (EISBE) |
| Proposed SS | User Input | Simulation parameter |
| Demand Mean | Derived | Avg of historical demand |
| Demand StdDev | Derived | StdDev of historical demand |
| Lead Time Mean | Derived | Avg of historical lead times |
| Lead Time StdDev | Derived | StdDev of historical lead times |
| Target Service Level | User Input | Simulation parameter |
| Simulated Service Level | ML-Derived | Monte Carlo simulation result |
| Stockout Probability | ML-Derived | Simulation result |
| Inventory Cost Impact | Derived | SS Change * Unit Cost * Holding % |
| Fill Rate Projection | ML-Derived | Simulation result |

**ML Models**: Monte Carlo Simulator, Service Level Calculator

---

## Tile 11: Lead Time Analytics
**Purpose**: Analyze and predict supplier lead times

| Field | Type | Source/Method |
|-------|------|---------------|
| Vendor ID | Raw | SAP LFA1 |
| Vendor Name | Raw | SAP LFA1 |
| Material ID | Raw | SAP EKPO |
| Planned Lead Time | Raw | SAP MARC (PLIFZ) |
| Actual Lead Time | Derived | Avg(Receipt Date - PO Date) |
| Lead Time Variance | Derived | StdDev of actual lead times |
| On-Time % | Derived | On-time deliveries / Total |
| Predicted Lead Time | ML-Derived | Lead time forecasting model |
| Reliability Score | ML-Derived | Supplier reliability model |
| Risk Level | ML-Derived | Lead time risk classifier |
| Trend | ML-Derived | Trend analysis model |

**ML Models**: Lead Time Predictor, Supplier Reliability Model

---

## Tile 12: Inventory Optimization Dashboard
**Purpose**: Executive KPI dashboard

| Field | Type | Source/Method |
|-------|------|---------------|
| Total Inventory Value | Derived | Sum of all stock values |
| Inventory Turns | Derived | COGS / Avg Inventory |
| GMROI | Derived | Gross Margin / Avg Inventory |
| Service Level | Derived | (1 - Stockouts / Demands) |
| Fill Rate | Derived | Units Fulfilled / Units Ordered |
| SLOB % | Derived | SLOB Value / Total Inventory |
| Excess Inventory | Derived | Stock > (SS + Pipeline) |
| Days on Hand | Derived | Inventory / Daily Demand |
| Optimization Savings | ML-Derived | Sum of all optimization recommendations |
| Items Needing Action | Derived | Count by status/risk |
| Forecast Accuracy | Derived | 100 - MAPE |
| Supplier Performance | ML-Derived | Avg supplier scores |

---

## ML Models Summary (25-30 Required)

| Model | Type | Used In Tiles |
|-------|------|---------------|
| ABC Classifier | Rule-based | 1, 3, 5 |
| XYZ Classifier | Statistical | 1, 3 |
| Anomaly Detector | Isolation Forest | 1, 3 |
| Slow-Mover Clustering | K-means | 1 |
| Health Score Model | Gradient Boosting | 2 |
| Write-off Risk | Logistic Regression | 2, 9 |
| Pattern Classifier | ML Classification | 3, 4 |
| Trend Detector | Time Series | 3, 11 |
| Demand Forecaster (SES) | Exponential Smoothing | 4 |
| Demand Forecaster (Holt-Winters) | Time Series | 4 |
| Demand Forecaster (Croston) | Intermittent Demand | 4 |
| Demand Forecaster (SARIMA) | ARIMA | 4 |
| Ensemble Forecaster | Ensemble | 4 |
| Bootstrap Forecaster | Probabilistic | 4 |
| Safety Stock Optimizer | Optimization | 5 |
| ROP Calculator | Formula + Optimization | 5 |
| Lot Size/EOQ Optimizer | Optimization | 5, 6 |
| Supplier Score Model | ML Scoring | 7 |
| Price Trend Forecaster | Time Series | 7 |
| Supplier Selection | Multi-criteria | 7 |
| Network Flow Optimizer | Optimization | 8 |
| Multi-Echelon Optimizer | Optimization | 8 |
| Lifecycle Classifier | ML Classification | 9 |
| Obsolescence Predictor | ML Prediction | 9 |
| Disposition Recommender | Decision Tree | 9 |
| Monte Carlo Simulator | Simulation | 10 |
| Lead Time Predictor | Time Series | 11 |
| Supplier Reliability Model | ML Scoring | 11 |

---

## SAP Table Reference

| Table | Description | Used In Tiles |
|-------|-------------|---------------|
| MARD | Plant-level stock | 1, 2, 8, 9 |
| MBEW | Material valuation | 1, 2, 6, 9 |
| MARC | Plant-material master | 5, 6, 10, 11 |
| MARA | Material master | All tiles |
| T001W | Plants | All tiles |
| MSEG/MB51 | Material documents | 1, 9 |
| EKKO | Purchase order header | 6, 7 |
| EKPO | Purchase order items | 6, 7, 11 |
| EKBE | PO history | 6, 7, 11 |
| EKET | PO schedule lines | 7 |
| LFA1 | Vendor master | 7, 11 |

---

# Part 2: Multi-Tenant Configuration Architecture

## Overview

Enable quick deployment for any customer by making three layers configurable:
1. **Data Layer** - Connect to any ERP/data source
2. **UI Layer** - Show relevant tiles and fields
3. **ML Layer** - Tune algorithms and thresholds

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONFIGURATION LAYERS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Data Source  │  │    UI/Tile   │  │  ML Model    │          │
│  │   Config     │  │    Config    │  │   Config     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                 │                   │
│         ▼                 ▼                 ▼                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Customer Configuration Store                │   │
│  │           (Database / JSON Files / API)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Data Source Configuration

### Canonical Data Model
Create an abstracted data model that all sources map to:

```
┌─────────────────────────────────────────────────────────────┐
│                    CANONICAL DATA MODEL                      │
├─────────────────────────────────────────────────────────────┤
│  Material    │ Location    │ Inventory   │ Transaction     │
│  - id        │ - id        │ - qty       │ - date          │
│  - name      │ - name      │ - value     │ - type          │
│  - category  │ - type      │ - age       │ - qty           │
│  - uom       │ - region    │ - status    │ - material_id   │
└─────────────────────────────────────────────────────────────┘
           ↑              ↑              ↑              ↑
    ┌──────┴──────┐ ┌─────┴─────┐ ┌──────┴──────┐ ┌─────┴─────┐
    │  SAP        │ │  Oracle   │ │  Dynamics   │ │  CSV/DB   │
    │  Connector  │ │  Connector│ │  Connector  │ │  Connector│
    └─────────────┘ └───────────┘ └─────────────┘ └───────────┘
```

### Data Source Configuration Schema
```json
{
  "customer_id": "arizona_beverages",
  "data_sources": [
    {
      "source_type": "SAP_S4HANA",
      "connection": {
        "host": "sap.customer.com",
        "client": "100",
        "credentials_vault": "aws-secrets/arizona-sap"
      },
      "field_mappings": {
        "material": {
          "id": "MARA.MATNR",
          "name": "MARA.MAKTX",
          "category": "MARA.MATKL",
          "uom": "MARA.MEINS"
        },
        "inventory": {
          "qty": "MARD.LABST",
          "value": "MBEW.SALK3 / MBEW.LBKUM",
          "plant": "MARD.WERKS"
        },
        "demand": {
          "source_table": "MSEG",
          "qty_field": "MENGE",
          "date_field": "BUDAT",
          "filter": "BWART IN ('601','602')"
        }
      }
    }
  ]
}
```

### Pre-built Data Connectors

| ERP | Connector | Status | Setup Time |
|-----|-----------|--------|------------|
| SAP S/4HANA | `SAPHanaConnector` | Ready | 2 hours |
| SAP ECC | `SAPRfcConnector` | Ready | 4 hours |
| Oracle EBS | `OracleEBSConnector` | Template | 1 day |
| MS Dynamics | `DynamicsConnector` | Template | 1 day |
| NetSuite | `NetSuiteConnector` | Template | 1 day |
| Generic SQL | `SQLConnector` | Ready | 2 hours |
| CSV/Excel | `FileConnector` | Ready | 30 mins |

---

## Layer 2: UI/Tile Configuration

### Tile Configuration Schema
```json
{
  "customer_id": "arizona_beverages",
  "enabled_tiles": [
    {
      "tile_id": "plant_inventory",
      "enabled": true,
      "display_name": "Plant Inventory",
      "icon": "Inventory2",
      "color": "#0891b2",
      "fields": {
        "visible": ["material_id", "material_name", "plant", "stock_qty", "stock_value", "abc_class", "xyz_class", "doh"],
        "hidden": ["gmroi", "slob_value"],
        "custom_fields": [
          {
            "field_id": "brand",
            "label": "Brand",
            "source": "material.custom_attr_1"
          }
        ]
      },
      "filters": {
        "default": { "plant": "all", "abc": "all" },
        "available": ["plant", "abc", "xyz", "category"]
      }
    },
    {
      "tile_id": "demand_intelligence",
      "enabled": true,
      "fields": {
        "visible": ["material_id", "pattern", "cv", "trend", "risk_score"],
        "hidden": ["adi", "seasonality"]
      }
    },
    {
      "tile_id": "forecasting_engine",
      "enabled": false
    }
  ]
}
```

### Field Registry
Central registry of all available fields with metadata:

```json
{
  "fields": {
    "stock_qty": {
      "type": "raw",
      "data_type": "number",
      "label": "Stock Quantity",
      "format": "number",
      "source_mapping": "inventory.qty"
    },
    "doh": {
      "type": "derived",
      "data_type": "number",
      "label": "Days on Hand",
      "format": "decimal:1",
      "formula": "stock_qty / avg_daily_demand",
      "dependencies": ["stock_qty", "avg_daily_demand"]
    },
    "abc_class": {
      "type": "ml_derived",
      "data_type": "category",
      "label": "ABC Class",
      "model": "abc_classifier",
      "values": ["A", "B", "C"]
    },
    "health_score": {
      "type": "ml_derived",
      "data_type": "number",
      "label": "Health Score",
      "format": "score:0-100",
      "model": "inventory_health_model"
    }
  }
}
```

---

## Layer 3: ML Model Configuration

### ML Configuration Schema
```json
{
  "customer_id": "arizona_beverages",
  "ml_config": {
    "abc_classifier": {
      "enabled": true,
      "type": "rule_based",
      "parameters": {
        "a_threshold": 80,
        "b_threshold": 95,
        "value_field": "annual_value"
      }
    },
    "xyz_classifier": {
      "enabled": true,
      "type": "statistical",
      "parameters": {
        "x_cv_max": 0.5,
        "y_cv_max": 1.0,
        "lookback_days": 365
      }
    },
    "demand_forecaster": {
      "enabled": true,
      "type": "auto_select",
      "models": {
        "stable": "simple_exponential_smoothing",
        "seasonal": "holt_winters",
        "intermittent": "croston",
        "erratic": "ensemble"
      },
      "parameters": {
        "forecast_horizon": 90,
        "confidence_intervals": [10, 90],
        "seasonality_period": 12
      }
    },
    "safety_stock_optimizer": {
      "enabled": true,
      "parameters": {
        "target_service_level": 95,
        "lead_time_factor": 1.2,
        "demand_variability_factor": 1.5
      }
    },
    "health_score_model": {
      "enabled": true,
      "type": "gradient_boosting",
      "weights": {
        "age_factor": 0.25,
        "turnover_factor": 0.25,
        "coverage_factor": 0.20,
        "excess_factor": 0.15,
        "trend_factor": 0.15
      },
      "thresholds": {
        "healthy": 70,
        "warning": 40,
        "critical": 0
      }
    }
  }
}
```

### ML Model Registry

| Model ID | Type | Input | Output |
|----------|------|-------|--------|
| abc_classifier | Rule-based | value | A/B/C |
| xyz_classifier | Statistical | demand history | X/Y/Z |
| pattern_detector | ML | demand series | pattern |
| demand_forecaster | Ensemble | history+external | forecast |
| anomaly_detector | ML | time series | flag |
| health_scorer | ML | inventory data | 0-100 |
| ss_optimizer | Optimization | demand, LT, SL | qty |
| rop_calculator | Formula | demand, LT, SS | qty |
| obsolescence_predictor | ML | movement data | probability |
| lead_time_predictor | ML | supplier data | days |

---

# Part 3: Quick Customer Enablement

## Onboarding Process (Target: 1-2 weeks)

```
Week 1: Setup
├── Day 1-2: Data Connection
│   ├── Select/configure data connector
│   ├── Map source fields to canonical model
│   └── Validate data extraction
│
├── Day 3-4: UI Configuration
│   ├── Enable relevant tiles
│   ├── Configure visible fields
│   └── Set up filters and defaults
│
├── Day 5: ML Configuration
│   ├── Set classification thresholds
│   ├── Configure forecast parameters
│   └── Define business rules

Week 2: Validation & Go-Live
├── Day 6-7: Testing
│   ├── Validate calculations
│   ├── Test ML outputs
│   └── UAT with customer
│
├── Day 8-9: Training & Handoff
│   └── User training
│
└── Day 10: Go-Live
```

---

## Configuration Storage Options

### Option 1: Database-Driven (Recommended for Production)
```sql
CREATE TABLE customer_config (
  customer_id VARCHAR(50) PRIMARY KEY,
  config_json JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE data_source_config (
  customer_id VARCHAR(50),
  source_type VARCHAR(50),
  connection_config JSONB,
  field_mappings JSONB
);

CREATE TABLE tile_config (
  customer_id VARCHAR(50),
  tile_id VARCHAR(50),
  enabled BOOLEAN,
  field_config JSONB,
  filter_config JSONB
);

CREATE TABLE ml_config (
  customer_id VARCHAR(50),
  model_id VARCHAR(50),
  enabled BOOLEAN,
  parameters JSONB
);
```

### Option 2: Config Files (Development/Small Scale)
```
/config/customers/
├── arizona_beverages/
│   ├── data_sources.json
│   ├── tiles.json
│   ├── ml_config.json
│   └── branding.json
├── distributor_xyz/
│   ├── data_sources.json
│   └── ...
└── _defaults/
    ├── data_sources.json
    ├── tiles.json
    └── ml_config.json
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        STOX.AI Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Frontend   │    │   API Layer  │    │   ML Layer   │      │
│  │   (React)    │◄──►│   (FastAPI)  │◄──►│   (Python)   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Configuration Service                       │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │ Data    │  │ Tile    │  │ ML      │  │ Field   │    │   │
│  │  │ Config  │  │ Config  │  │ Config  │  │ Registry│    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Data Abstraction Layer                      │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │   SAP   │  │ Oracle  │  │Dynamics │  │  SQL    │    │   │
│  │  │Connector│  │Connector│  │Connector│  │Connector│    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Components to Build

| Priority | Component | Purpose |
|----------|-----------|---------|
| P0 | `ConfigService` | Load/cache customer config at runtime |
| P0 | `DataConnectorFactory` | Instantiate correct connector per customer |
| P0 | `FieldResolver` | Resolve field values (raw/derived/ML) |
| P0 | `TileConfigLoader` | Load tile settings for UI |
| P1 | `MLModelRouter` | Route to correct ML model with params |
| P1 | `AdminConfigAPI` | CRUD for configurations |
| P1 | `ConfigValidationService` | Validate config changes |
| P2 | `CustomerOnboardingWizard` | Guided setup UI |

---

## Benefits

1. **Quick Enablement**: New customer in 1-2 weeks vs months
2. **No Code Changes**: Enable features via config, not code
3. **Flexible**: Support any ERP with field mapping
4. **Scalable**: Same codebase, many customers
5. **Maintainable**: Update ML models centrally, config per customer
