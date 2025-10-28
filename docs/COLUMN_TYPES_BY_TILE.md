# Column Types by Tile - Quick Reference

One-page reference showing RAW/DERIVED/ML breakdown for each of 26 tiles.

---

## Legend
- 🔵 **RAW** = From SAP/EDI/User input
- 🟢 **DERIVED** = Auto-calculated by PostgreSQL
- 🟡 **ML** = AI/ML predictions

---

## MODULE 0: Demand Flow

### Tile 1: Sell-Through to Sell-In Bridge
**Table:** `sell_through_bridge`
- 🔵 RAW: `channel_id`, `location_id`, `sku_id`, `transaction_date`, `sell_through_qty`, `sell_in_qty`
- 🟡 ML: `forecast_qty`, `confidence_pct`
- 🟢 DERIVED: `variance_qty`, `variance_pct`
- **Total:** 10 columns (6 RAW, 2 ML, 2 DERIVED)

### Tile 2: Partner POS Monitor
**Table:** `partner_pos_feeds`
- 🔵 RAW: `partner_id`, `edi_feed_type`, `last_update`, `feed_status`, `record_count`, `error_message`, `sla_threshold_mins`
- 🟡 ML: `data_quality_pct`
- 🟢 DERIVED: `is_sla_breach`
- **Total:** 9 columns (7 RAW, 1 ML, 1 DERIVED)

---

## MODULE 1: Demand Forecasting

### Tile 3: Forecast Dashboard
**Table:** `demand_forecasts`
- 🔵 RAW: `sku_id`, `channel_id`, `forecast_date`, `actual_qty`, `model_version`
- 🟡 ML: `forecast_qty`, `model_confidence`
- 🟢 DERIVED: `accuracy_pct`, `bias_qty`, `mape_pct`
- **Total:** 10 columns (5 RAW, 2 ML, 3 DERIVED)

### Tile 4: Demand Analyzer
**Table:** `demand_aggregations`
- 🔵 RAW: `dimension_type`, `dimension_value`, `category`, `sku_id`, `aggregation_date`, `region`
- 🟡 ML: `trend_pct`
- 🟢 DERIVED: `total_demand`, `trend_direction`
- **Total:** 9 columns (6 RAW, 1 ML, 2 DERIVED)

### Tile 5: Forecast Workbench
**Table:** `forecast_overrides`
- 🔵 RAW: `sku_id`, `week_id`, `override_forecast`, `has_promo`, `promo_type`, `promo_impact_pct`, `status`, `override_reason`, `overridden_by`, `approved_by`
- 🟡 ML: `ai_forecast`
- 🟢 DERIVED: `week_start_date`, `final_forecast`
- **Total:** 13 columns (10 RAW, 1 ML, 2 DERIVED)

### Tile 6: Demand Alerts
**Table:** `demand_alerts`
- 🔵 RAW: `alert_type`, `sku_id`, `location_id`, `alert_date`, `alert_value`, `threshold_value`, `message`, `acknowledged`, `resolved`
- 🟡 ML: `severity`, `recommendation`
- 🟢 DERIVED: None
- **Total:** 11 columns (9 RAW, 2 ML, 0 DERIVED)

---

## MODULE 2: Store Replenishment

### Tile 7: Store Replenishment
**Table:** `store_replenishment`
- 🔵 RAW: `location_id`, `sku_id`, `on_hand_qty`, `in_transit_qty`, `safety_stock_qty`, `calculation_date`
- 🟡 ML: `forecast_7d`
- 🟢 DERIVED: `replenishment_qty`, `days_of_supply`, `stockout_risk`
- **Total:** 10 columns (6 RAW, 1 ML, 3 DERIVED)

### Tile 8: Route Optimizer
**Table:** `delivery_routes`
- 🔵 RAW: `route_id`, `truck_id`, `driver_name`, `route_date`, `capacity_units`, `capacity_used`, `distance_mi`, `estimated_cost`, `actual_cost`, `status`
- 🟡 ML: `optimization_score`
- 🟢 DERIVED: `capacity_pct`
- **Total:** 12 columns (10 RAW, 1 ML, 1 DERIVED)

### Tile 9: Stockout Monitor
**Table:** `stockout_risks`
- 🔵 RAW: `location_id`, `sku_id`, `current_stock`, `in_transit_qty`, `expected_delivery_date`, `calculation_date`, `alert_sent`
- 🟡 ML: `forecast_daily`
- 🟢 DERIVED: `days_to_stockout`, `risk_level`, `recommended_action`
- **Total:** 11 columns (7 RAW, 1 ML, 3 DERIVED)

### Tile 10: Channel Allocation
**Table:** `channel_allocations`
- 🔵 RAW: `sku_id`, `dc_available`, `ch01_allocation`, `ch02_allocation`, `ch03_allocation`, `ch04_allocation`, `total_demand`, `allocation_date`, `allocation_logic`, `locked`
- 🟡 ML: None
- 🟢 DERIVED: `total_allocated`, `allocation_pct`, `unfulfilled_demand`
- **Total:** 13 columns (10 RAW, 0 ML, 3 DERIVED)

---

## MODULE 3: DC Inventory

### Tile 11: DC Cockpit
**Table:** `dc_inventory`
- 🔵 RAW: `sku_id`, `on_hand_qty`, `in_transit_qty`, `allocated_ch01`, `allocated_ch02`, `allocated_ch03`, `allocated_ch04`, `safety_stock_qty`, `snapshot_date`
- 🟡 ML: None
- 🟢 DERIVED: `available_atp`, `total_allocated`
- **Total:** 11 columns (9 RAW, 0 ML, 2 DERIVED)

### Tile 12: Working Capital
**Table:** `working_capital_metrics`
- 🔵 RAW: `sku_id`, `inventory_units`, `unit_cost`, `target_turns`, `target_dio`, `calculation_date`
- 🟡 ML: None
- 🟢 DERIVED: `inventory_value`, `inventory_turns`, `days_inventory_outstanding`, `status`
- **Total:** 10 columns (6 RAW, 0 ML, 4 DERIVED)

### Tile 13: Excess & Obsolete
**Table:** `excess_obsolete_inventory`
- 🔵 RAW: `sku_id`, `inventory_qty`, `last_sale_date`, `recommended_action`, `inventory_value`, `snapshot_date`
- 🟡 ML: None
- 🟢 DERIVED: `days_no_sale`, `category`
- **Total:** 8 columns (6 RAW, 0 ML, 2 DERIVED)

---

## MODULE 4: Supply Planning

### Tile 14: Supply Dashboard
**Table:** `supply_requirements`
- 🔵 RAW: `sku_id`, `safety_stock`, `dc_on_hand`, `dc_on_order`, `week_id`
- 🟡 ML: `weekly_demand`
- 🟢 DERIVED: `plant_supply_req`, `week_start_date`
- **Total:** 8 columns (5 RAW, 1 ML, 2 DERIVED)

### Tile 15: Production Optimizer
**Table:** `production_campaigns`
- 🔵 RAW: `product_family`, `campaign_id`, `campaign_size`, `changeover_time_hrs`, `production_days`, `campaign_date`, `status`
- 🟡 ML: None
- 🟢 DERIVED: `capacity_utilization_pct`, `efficiency_pct`
- **Total:** 9 columns (7 RAW, 0 ML, 2 DERIVED)

### Tile 16: MRP Accelerator
**Table:** `mrp_planned_orders`
- 🔵 RAW: `sku_id`, `planned_order_id`, `quantity`, `mrp_date`, `lead_time_days`, `status`
- 🟡 ML: `approval_score`
- 🟢 DERIVED: `required_date`
- **Total:** 8 columns (6 RAW, 1 ML, 1 DERIVED)

---

## MODULE 5: BOM Explosion

### Tile 17: BOM Analyzer
**Table:** `bom_explosions`
- 🔵 RAW: `fg_sku`, `plant_requirement`, `component_sku`, `qty_per_fg`, `supplier_id`, `calculation_date`
- 🟡 ML: None
- 🟢 DERIVED: `component_requirement`
- **Total:** 7 columns (6 RAW, 0 ML, 1 DERIVED)

### Tile 18: Component Tracker
**Table:** `component_usage`
- 🔵 RAW: `component_sku`, `on_hand_qty`, `snapshot_date`
- 🟡 ML: None
- 🟢 DERIVED: `used_in_fg_list`, `total_fg_count`, `total_demand`, `shortage_qty`
- **Total:** 7 columns (3 RAW, 0 ML, 4 DERIVED)

### Tile 19: BOM Exceptions
**Table:** `bom_exceptions`
- 🔵 RAW: `sku_id`, `exception_type`, `component_sku`, `action_required`, `impact_description`, `resolved`, `resolution_notes`
- 🟡 ML: `severity`
- 🟢 DERIVED: None
- **Total:** 8 columns (7 RAW, 1 ML, 0 DERIVED)

---

## MODULE 6: Procurement

### Tile 20: Consolidation Engine
**Table:** `component_consolidation`
- 🔵 RAW: `component_sku`, `current_inventory`, `supplier_id`, `consolidation_date`
- 🟡 ML: `estimated_savings`
- 🟢 DERIVED: `used_in_fg_list`, `total_requirement`, `purchase_qty`
- **Total:** 8 columns (4 RAW, 1 ML, 3 DERIVED)

### Tile 21: Procurement Dashboard
**Table:** `consolidated_pos`
- 🔵 RAW: `consolidated_po_id`, `component_sku`, `quantity`, `supplier_id`, `unit_cost`, `discount_pct`, `po_date`, `delivery_date`, `status`
- 🟡 ML: None
- 🟢 DERIVED: `total_cost`, `savings_amount`
- **Total:** 11 columns (9 RAW, 0 ML, 2 DERIVED)

### Tile 22: Supplier Portal
**Table:** `supplier_performance_history`
- 🔵 RAW: `supplier_id`, `po_id`, `on_time_delivery`, `defect_count`, `measurement_date`
- 🟡 ML: `quality_score_pct`
- 🟢 DERIVED: `delivery_performance_pct`
- **Total:** 7 columns (5 RAW, 1 ML, 1 DERIVED)

---

## MODULE 7: Analytics & What-If

### Tile 23: Scenario Planner
**Table:** `what_if_scenarios`
- 🔵 RAW: `scenario_id`, `scenario_name`, `sku_id`, `base_demand`, `promo_impact_pct`, `holiday_impact_pct`, `supply_constraint_pct`, `inventory_requirement`, `safety_buffer_pct`, `created_by`, `is_baseline`
- 🟡 ML: None
- 🟢 DERIVED: `forecasted_demand`
- **Total:** 12 columns (11 RAW, 0 ML, 1 DERIVED)

### Tile 24: KPI Dashboard
**Table:** `kpi_metrics`
- 🔵 RAW: `kpi_name`, `kpi_category`, `target_value`, `unit`, `trend`, `calculation_date`
- 🟡 ML: None
- 🟢 DERIVED: `kpi_value`, `status`
- **Total:** 8 columns (6 RAW, 0 ML, 2 DERIVED)

### Tile 25: Predictive Analytics
**Table:** `anomaly_detection`
- 🔵 RAW: `anomaly_date`, `sku_id`, `location_id`, `actual_value`, `acknowledged`
- 🟡 ML: `anomaly_type`, `expected_value`, `reason`, `confidence_score`
- 🟢 DERIVED: `variance_pct`
- **Total:** 10 columns (5 RAW, 4 ML, 1 DERIVED)

### Tile 26: Working Capital Optimizer
**Table:** `working_capital_optimization`
- 🔵 RAW: `sku_id`, `inventory_value`, `target_turns`, `current_turns`, `days_inventory_outstanding`, `target_dio`, `calculation_date`
- 🟡 ML: None
- 🟢 DERIVED: `cash_impact`, `status`
- **Total:** 9 columns (7 RAW, 0 ML, 2 DERIVED)

---

## Summary Table - All 26 Tiles

| # | Tile Name | Table | RAW | ML | DERIVED | Total | ML Critical? |
|---|-----------|-------|-----|----|---------| ------|--------------|
| 1 | Sell-Through Bridge | sell_through_bridge | 6 | 2 | 2 | 10 | ✅ HIGH |
| 2 | Partner POS Monitor | partner_pos_feeds | 7 | 1 | 1 | 9 | ⚠️ MEDIUM |
| 3 | Forecast Dashboard | demand_forecasts | 5 | 2 | 3 | 10 | ✅ HIGH |
| 4 | Demand Analyzer | demand_aggregations | 6 | 1 | 2 | 9 | ⚠️ MEDIUM |
| 5 | Forecast Workbench | forecast_overrides | 10 | 1 | 2 | 13 | ✅ HIGH |
| 6 | Demand Alerts | demand_alerts | 9 | 2 | 0 | 11 | ⚠️ MEDIUM |
| 7 | Store Replenishment | store_replenishment | 6 | 1 | 3 | 10 | ✅ HIGH |
| 8 | Route Optimizer | delivery_routes | 10 | 1 | 1 | 12 | ⚠️ LOW |
| 9 | Stockout Monitor | stockout_risks | 7 | 1 | 3 | 11 | ✅ HIGH |
| 10 | Channel Allocation | channel_allocations | 10 | 0 | 3 | 13 | ⛔ NONE |
| 11 | DC Cockpit | dc_inventory | 9 | 0 | 2 | 11 | ⛔ NONE |
| 12 | Working Capital | working_capital_metrics | 6 | 0 | 4 | 10 | ⛔ NONE |
| 13 | Excess & Obsolete | excess_obsolete_inventory | 6 | 0 | 2 | 8 | ⛔ NONE |
| 14 | Supply Dashboard | supply_requirements | 5 | 1 | 2 | 8 | ✅ HIGH |
| 15 | Production Optimizer | production_campaigns | 7 | 0 | 2 | 9 | ⛔ NONE |
| 16 | MRP Accelerator | mrp_planned_orders | 6 | 1 | 1 | 8 | ⚠️ MEDIUM |
| 17 | BOM Analyzer | bom_explosions | 6 | 0 | 1 | 7 | ⛔ NONE |
| 18 | Component Tracker | component_usage | 3 | 0 | 4 | 7 | ⛔ NONE |
| 19 | BOM Exceptions | bom_exceptions | 7 | 1 | 0 | 8 | ⚠️ LOW |
| 20 | Consolidation Engine | component_consolidation | 4 | 1 | 3 | 8 | ⚠️ LOW |
| 21 | Procurement Dashboard | consolidated_pos | 9 | 0 | 2 | 11 | ⛔ NONE |
| 22 | Supplier Portal | supplier_performance_history | 5 | 1 | 1 | 7 | ⚠️ LOW |
| 23 | Scenario Planner | what_if_scenarios | 11 | 0 | 1 | 12 | ⛔ NONE |
| 24 | KPI Dashboard | kpi_metrics | 6 | 0 | 2 | 8 | ⛔ NONE |
| 25 | Predictive Analytics | anomaly_detection | 5 | 4 | 1 | 10 | ✅ HIGH |
| 26 | Working Capital Optimizer | working_capital_optimization | 7 | 0 | 2 | 9 | ⛔ NONE |
| | **TOTALS** | **26 tables** | **182** | **21** | **50** | **253** | **6 HIGH** |

---

## ML Criticality Analysis

### ✅ HIGH Priority (6 tiles) - **MUST HAVE**
These tiles are useless without ML models:
1. Sell-Through Bridge - `forecast_qty` is core functionality
3. Forecast Dashboard - `forecast_qty` drives all decisions
5. Forecast Workbench - `ai_forecast` is baseline for overrides
7. Store Replenishment - `forecast_7d` calculates replenishment
9. Stockout Monitor - `forecast_daily` drives risk alerts
14. Supply Dashboard - `weekly_demand` feeds MRP
25. Predictive Analytics - All 4 ML columns are core value

**Without these ML models:** Planners must manually enter all forecasts

---

### ⚠️ MEDIUM Priority (5 tiles) - **HIGH VALUE**
These tiles work but lose significant value without ML:
2. Partner POS Monitor - `data_quality_pct` helps prioritize fixes
4. Demand Analyzer - `trend_pct` provides insights
6. Demand Alerts - `severity` & `recommendation` prioritize actions
16. MRP Accelerator - `approval_score` enables auto-approval

**Without these ML models:** Manual quality checks, basic alerts only

---

### ⚠️ LOW Priority (3 tiles) - **NICE TO HAVE**
These tiles function fine without ML:
8. Route Optimizer - `optimization_score` is optimization bonus
19. BOM Exceptions - `severity` helps prioritize
20. Consolidation Engine - `estimated_savings` is predictive
22. Supplier Portal - `quality_score_pct` is analytical

**Without these ML models:** Business logic defaults work fine

---

### ⛔ NO ML (12 tiles) - **BUSINESS LOGIC ONLY**
These tiles use only RAW + DERIVED columns:
10. Channel Allocation
11. DC Cockpit
12. Working Capital
13. Excess & Obsolete
15. Production Optimizer
17. BOM Analyzer
18. Component Tracker
21. Procurement Dashboard
23. Scenario Planner
24. KPI Dashboard
26. Working Capital Optimizer

**These work 100% without any ML!**

---

## Phased Rollout Recommendation

### Phase 1: Database + Business Logic (Week 1-2)
**Deploy:** All 26 tiles with RAW + DERIVED only
**ML Status:** Use business rule defaults
**Tiles Working:** 12 tiles fully functional, 14 tiles partially functional
**User Impact:** Manual forecasting required

### Phase 2: Core Forecasting (Week 3-4)
**Deploy:** ARIMA/Prophet models for 6 HIGH priority tiles
**ML Columns:** `forecast_qty`, `ai_forecast`, `forecast_7d`, `forecast_daily`, `weekly_demand`
**Tiles Working:** 18 tiles fully functional, 8 tiles partially functional
**User Impact:** 80% automation achieved

### Phase 3: Advanced ML (Week 5-8)
**Deploy:** All remaining ML models
**ML Columns:** All 21 ML columns populated
**Tiles Working:** All 26 tiles fully functional
**User Impact:** 95% automation, proactive insights

---

**Quick Reference:** `docs/STOX_AI_COLUMN_CATEGORIZATION.md` (detailed version)
**Last Updated:** 2025-10-25
