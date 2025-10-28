# STOX.AI Module Feature Mapping

## Overview
This document defines the purpose and core features for each of the 12 STOX.AI modules (5 Store + 7 DC).

---

## STORE SYSTEM MODULES (5)

### 1. Store Demand Forecasting
**Purpose**: AI-driven store-level demand forecasting with seasonality, trends, and promotion impact

**Core Features**:
- ✅ Store-level demand forecast by SKU
- ✅ Seasonality patterns and trend analysis
- ✅ Promotion impact modeling
- ✅ Multi-algorithm forecasting (ML, statistical)
- ✅ Forecast accuracy metrics (MAPE, MAD, Bias)
- ✅ Historical vs Forecast comparison
- ✅ Time horizon: Daily/Weekly/Monthly views
- ✅ Exception alerts (high variance, outliers)

**IBP Features**:
- Time bucketing (Daily → Weekly → Monthly)
- Baseline vs Adjusted forecast
- Forecast version control
- Export to Excel/S/4HANA

---

### 2. Store Health Monitor
**Purpose**: Real-time store inventory health monitoring with stock alerts and availability tracking

**Core Features**:
- ✅ Real-time inventory levels per store/SKU
- ✅ Stock alerts (Low, Out of Stock, Overstock)
- ✅ Availability % tracking
- ✅ Days of Supply (DOS) calculation
- ✅ Stockout risk indicators
- ✅ Inventory aging (slow-moving, obsolete)
- ✅ Store performance scorecard
- ✅ Heatmap view (stores × SKUs)

**IBP Features**:
- Threshold-based alerts
- Grouping by Store/SKU/Region
- Drill-down to transaction details
- Exception management workflow

---

### 3. Store Inventory Optimization
**Purpose**: Store-level inventory optimization with min/max levels, safety stock, and reorder points

**Core Features**:
- ✅ Min/Max level recommendations
- ✅ Safety stock calculation (service level-based)
- ✅ Reorder point (ROP) optimization
- ✅ Economic Order Quantity (EOQ)
- ✅ Lead time variability analysis
- ✅ Service level targets (95%, 98%, 99%)
- ✅ Simulation: What-if scenarios
- ✅ Cost optimization (holding vs stockout)

**IBP Features**:
- Policy simulation (Min/Max adjustments)
- Bulk parameter updates
- Constraint modeling (shelf space, budget)
- Approval workflow for policy changes

---

### 4. Store Auto Replenishment
**Purpose**: Automated replenishment order generation with DC integration and order tracking

**Core Features**:
- ✅ Auto-generated replenishment orders
- ✅ DC-to-Store order suggestions
- ✅ Order status tracking (Pending, Shipped, Received)
- ✅ Lead time monitoring
- ✅ Order quantity optimization
- ✅ Replenishment frequency planning
- ✅ Supplier/DC capacity constraints
- ✅ Order history and performance

**IBP Features**:
- Order approval workflow
- Batch order generation
- Split shipment optimization
- Integration with DC Supplier Execution

---

### 5. Store Financial Impact
**Purpose**: Store-level financial impact analysis with inventory carrying costs and stockout costs

**Core Features**:
- ✅ Inventory valuation by store/SKU
- ✅ Carrying cost calculation (% of inventory value)
- ✅ Stockout cost estimation (lost sales)
- ✅ Working capital tied up in inventory
- ✅ Inventory turnover ratio
- ✅ ROI analysis (optimization savings)
- ✅ Cost breakdown (storage, obsolescence, shrinkage)
- ✅ Profitability impact by SKU

**IBP Features**:
- Financial scenario modeling
- Cost/benefit analysis
- Budget tracking
- Export to Finance systems

---

## DC SYSTEM MODULES (7)

### 1. DC Demand Aggregation
**Purpose**: Aggregate demand forecasts from all store locations and channels for centralized planning

**Core Features**:
- ✅ **Channel Aggregation**: Retail + Amazon + Wholesale + D2C
- ✅ **Statistical Measures**: Weekly mean (μ), Variability (σ), Correlation-adjusted variance
- ✅ **Group By**: DC Location, Product SKU, ISO Week
- ✅ **Selection Aggregation**: Sum, Average, Min, Max on selected rows
- ✅ **Channel Mix**: Percentage breakdown by channel
- ✅ **Time Periods**: Daily/Weekly aggregation
- ✅ **Export**: Excel, CSV for downstream planning

**IBP Features**:
- ✅ Real-time aggregation calculations
- ✅ Pivot/Group By functionality
- Multi-level hierarchy (Channel → DC → SKU)
- Filter by threshold values

**DO NOT ADD**:
- ❌ What-if scenarios (belongs in separate Scenario Planner)
- ❌ Alerts (belongs in Health Monitor)
- ❌ Forecast accuracy (belongs in Optimization)

---

### 2. DC Health Monitor
**Purpose**: Real-time visibility into DC inventory health, stock levels, and availability across network

**Core Features**:
- ✅ Real-time DC inventory dashboard
- ✅ **Alerts & Exceptions**:
  - Stockout risk warnings
  - Overstock alerts (>X days supply)
  - Capacity constraint warnings
  - Inbound delays
- ✅ Availability % by DC/SKU
- ✅ Days of Supply (DOS) tracking
- ✅ Inventory aging by category
- ✅ Exception management (acknowledge, resolve)
- ✅ DC performance scorecard
- ✅ Heatmap: DCs × SKUs

**IBP Features**:
- Threshold configuration (alert rules)
- Exception workflow (assign, track, resolve)
- Drill-down to root cause
- Historical trend analysis

---

### 3. DC Optimization Engine
**Purpose**: Optimize inventory positioning and allocation across distribution center network

**Core Features**:
- ✅ **Forecast Accuracy Metrics**:
  - MAPE (Mean Absolute Percentage Error)
  - MAD (Mean Absolute Deviation)
  - Bias detection (over/under forecasting)
- ✅ **Trend Analysis**:
  - 4-week moving average
  - Seasonality index
  - Pattern recognition
- ✅ Safety stock optimization (multi-echelon)
- ✅ Network inventory positioning
- ✅ Allocation optimization (DC → Stores)
- ✅ Rebalancing recommendations
- ✅ Simulation engine (Monte Carlo)

**IBP Features**:
- Optimization runs (weekly, monthly)
- Constraint modeling (capacity, budget, lead time)
- Scenario comparison (Current vs Optimized)
- Sensitivity analysis

---

### 4. DC Bill of Materials (BOM)
**Purpose**: Multi-level BOM management and component tracking for finished goods assembly

**Core Features**:
- ✅ Multi-level BOM structure (parent → child → sub-components)
- ✅ Component inventory tracking
- ✅ BOM explosion (calculate component requirements)
- ✅ Implosion (where-used analysis)
- ✅ Shortage detection (missing components)
- ✅ Substitute components management
- ✅ Component lead time tracking
- ✅ Assembly scheduling

**IBP Features**:
- BOM version control
- Component availability check
- Production order suggestions
- Shortage resolution workflow

---

### 5. DC Lot Size Optimization
**Purpose**: Economic order quantity and lot size optimization for procurement efficiency

**Core Features**:
- ✅ Economic Order Quantity (EOQ) calculation
- ✅ Lot-for-Lot vs Fixed Lot sizing
- ✅ Order frequency optimization
- ✅ Quantity discount modeling
- ✅ Order cost vs Holding cost tradeoff
- ✅ Minimum order quantity (MOQ) constraints
- ✅ Lead time variability impact
- ✅ Bulk order recommendations

**IBP Features**:
- Policy simulation (EOQ vs POQ)
- Sensitivity analysis (demand changes)
- Constraint modeling (warehouse space, budget)
- Approval workflow for lot size changes

---

### 6. DC Supplier Execution
**Purpose**: Supplier collaboration portal with order tracking, delivery management, and performance metrics

**Core Features**:
- ✅ Purchase order (PO) tracking
- ✅ Order status: Pending, Confirmed, Shipped, Received
- ✅ Delivery performance metrics:
  - On-time delivery %
  - Lead time tracking
  - Quantity variance
  - Quality score
- ✅ Supplier scorecard (by supplier)
- ✅ Inbound shipment visibility
- ✅ Exception management (late deliveries, quality issues)
- ✅ Collaboration portal (supplier login)

**IBP Features**:
- Supplier performance benchmarking
- Alert escalation (late deliveries)
- Collaborative planning (CPFR)
- Integration with ERP (SAP, Oracle)

---

### 7. DC Financial Impact
**Purpose**: Working capital analysis, inventory valuation, and financial impact reporting

**Core Features**:
- ✅ Inventory valuation by DC/Category
- ✅ Working capital tied up
- ✅ Carrying cost breakdown:
  - Storage cost
  - Obsolescence cost
  - Insurance/Handling
- ✅ Inventory turnover ratio
- ✅ Cash-to-cash cycle time
- ✅ Potential savings identification
- ✅ Cost-to-serve analysis
- ✅ Financial impact of optimization scenarios

**IBP Features**:
- Financial scenario modeling
- ROI calculation (before/after optimization)
- Budget tracking
- Executive dashboards

---

## CROSS-MODULE FEATURES (System-Wide)

### Collaboration (All Modules)
- **Notes/Comments**: Add planning notes to records
- **@Mentions**: Tag colleagues for review
- **Change History**: Audit trail (who changed what)
- **Approval Workflow**: Submit → Review → Approve

### Data Integration (All Modules)
- **Excel Import/Export**: Bulk data upload/download
- **API Integration**: Real-time sync with S/4HANA, ERP
- **Template Download**: Pre-formatted Excel templates

### Visualization (All Modules)
- **Chart Toggle**: Switch table ↔ charts
- **Heatmap View**: Color-coded grid
- **Dashboard View**: Metrics + visualizations

### Time Management (Planning Modules)
- **Time Horizon**: Rolling forecast (4/8/13 weeks)
- **Time Buckets**: Daily/Weekly/Monthly/Quarterly
- **Freeze Zones**: Lock historical periods

### Versioning (Planning Modules)
- **Baseline**: Original system forecast
- **Adjusted**: Manual overrides
- **Consensus**: Final approved plan
- **Scenarios**: V1, V2, V3 (version control)

---

## MODULE PRIORITY & COMPLEXITY

### High Priority (MVP)
1. ✅ DC Demand Aggregation (DONE)
2. Store Demand Forecasting
3. DC Health Monitor
4. Store Health Monitor
5. DC Supplier Execution

### Medium Priority
6. Store Auto Replenishment
7. DC Optimization Engine
8. Store Inventory Optimization
9. DC Financial Impact
10. Store Financial Impact

### Lower Priority (Advanced)
11. DC BOM
12. DC Lot Size Optimization

---

## NEXT STEPS

1. **Review**: Confirm feature assignments are correct
2. **Prioritize**: Decide which modules to implement next
3. **Implement**: Build modules iteratively (1-2 per sprint)
4. **Integrate**: Connect modules (e.g., Store Replenishment ↔ DC Supplier Execution)

---

**Last Updated**: 2025-01-27
**Status**: Feature mapping complete, ready for implementation
