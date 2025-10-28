# PostgreSQL Database Schema - Customer Analytics

## Database: `customer_analytics`

This document describes all PostgreSQL tables required for the Mantrix Unified DI Platform.

---

## Table Overview (26 Tables)

### Customer Analytics Tables (5)
Core customer and transaction data for analytics and segmentation.

### Cohort Analysis Tables (3)
Customer cohort retention and revenue analysis.

### Regional Analytics Tables (3)
Regional product performance and clustering.

### Stock/Inventory Tables (9)
Inventory management, forecasting, and working capital analysis.

### Enterprise Pulse Monitoring Tables (6)
Alert monitoring, templates, and execution tracking.

---

## Detailed Table Definitions

### 1. Customer Analytics Tables

#### `customer_master`
**Description:** Master customer data with RFM (Recency, Frequency, Monetary) segmentation.

**Expected Row Count:** ~2,900 rows

**Key Columns:**
- `customer` - Customer identifier
- `rfm_segment` - RFM segment (Champions, Loyal Customers, etc.)
- `monetary` - Total revenue from customer
- `frequency` - Number of orders
- `recency` - Days since last order
- `abc_revenue` - ABC classification by revenue
- `abc_profit` - ABC classification by profit
- `abc_combined` - Combined ABC classification
- `profitability` - Total profit from customer
- `margin_percent` - Average margin percentage

**Used By:**
- Customer 360 views
- Segmentation analysis
- Churn prediction
- Revenue attribution

---

#### `transaction_data`
**Description:** Individual transaction/order line items.

**Expected Row Count:** ~150,000 rows

**Key Columns:**
- `order_number` - Unique order identifier
- `customer` - Customer identifier
- `material_number` - Product/SKU identifier
- `posting_date` - Transaction date
- `net_sales` - Net sales amount
- `gross_margin` - Gross margin amount
- `total_cogs` - Cost of goods sold
- `inv_quantity_cases` - Quantity in cases
- `year_month` - Year-month for aggregation

**Used By:**
- Financial reporting
- Product performance analysis
- Customer purchase history
- Time series analysis
- Margin analysis (Margen module)

---

#### `segment_performance`
**Description:** Aggregated performance metrics by customer segment.

**Expected Row Count:** ~25 rows

**Key Columns:**
- `segment_name` - Segment identifier
- `segment_type` - Type of segmentation (RFM_Segment, ABC, etc.)
- `customer_count` - Number of customers in segment
- `monetary_sum` - Total revenue
- `monetary_mean` - Average revenue per customer
- `frequency_mean` - Average order frequency
- `revenue_percentage` - Share of total revenue
- `profit_percentage` - Share of total profit
- `margin_percent_mean` - Average margin percentage

**Used By:**
- Segment comparison
- Strategic planning
- Resource allocation

---

#### `time_series_performance`
**Description:** Monthly performance metrics by segment.

**Expected Row Count:** ~576 rows

**Key Columns:**
- `year` - Year
- `month` - Month number
- `year_month` - YYYY-MM format
- `rfm_segment` - Customer segment
- `customer` - Customer count
- `net_sales` - Revenue
- `gross_margin` - Margin amount

**Used By:**
- Trend analysis
- Forecasting
- Seasonal pattern detection

---

#### `product_customer_matrix`
**Description:** Product performance across customer segments.

**Expected Row Count:** ~5,272 rows

**Key Columns:**
- `material_number` - Product identifier
- `rfm_segment` - Customer segment
- `total_product_customers` - Customers who bought product
- `total_product_sales` - Total sales
- `total_product_margin` - Total margin
- `segment_sales_contribution` - % contribution to segment

**Used By:**
- Product-segment analysis
- Cross-sell opportunities
- Product portfolio optimization

---

### 2. Cohort Analysis Tables

#### `cohort_retention`
**Description:** Customer retention rates by cohort over time.

**Expected Row Count:** ~60 rows (5 years of monthly cohorts)

**Key Columns:**
- `cohort_month` - Cohort starting month (DATE)
- `retention_data` - JSONB with retention % by month

**Data Structure:**
```json
{
  "1": 100.0,  // Month 0 (100% by definition)
  "2": 45.2,   // Month 1 retention
  "3": 38.1,   // Month 2 retention
  ...
}
```

**Used By:**
- Retention analysis
- Cohort comparison
- LTV calculation

---

#### `cohort_sizes`
**Description:** Initial size of each cohort.

**Expected Row Count:** ~60 rows

**Key Columns:**
- `cohort_month` - Cohort month (PRIMARY KEY)
- `customer_count` - Number of customers acquired

**Used By:**
- Cohort retention calculations
- Growth rate analysis

---

#### `cohort_avg_revenue`
**Description:** Average revenue per customer by cohort over time.

**Expected Row Count:** ~60 rows

**Key Columns:**
- `cohort_month` - Cohort starting month
- `revenue_data` - JSONB with avg revenue by month

**Data Structure:**
```json
{
  "1": 1250.00,  // Month 0 average revenue
  "2": 850.50,   // Month 1 average revenue
  ...
}
```

**Used By:**
- Revenue trend analysis
- LTV projection

---

### 3. Regional Analytics Tables

#### `regional_product_clusters`
**Description:** Product clusters identified by region.

**Key Columns:**
- `sales_office_name` - Region identifier
- `cluster_id` - Cluster number
- `material_number` - Product identifier
- `cluster_revenue` - Revenue within cluster
- `cluster_margin` - Margin within cluster

**Used By:**
- Regional assortment planning
- Distribution optimization

---

#### `regional_product_matrix`
**Description:** Product performance metrics by region.

**Key Columns:**
- `sales_office_name` - Region
- `material_number` - Product
- `revenue` - Total sales
- `margin` - Gross margin
- `customer_count` - Customers purchasing
- `revenue_rank` - Rank within region

**Used By:**
- Regional performance comparison
- Product allocation decisions

---

#### `regional_top_performers`
**Description:** Top performing products by region.

**Key Columns:**
- `sales_office_name` - Region
- `material_number` - Product
- `revenue` - Total revenue
- `margin_pct` - Margin percentage
- `rank` - Performance rank

**Used By:**
- Regional dashboards
- Performance benchmarking

---

### 4. Stock/Inventory Tables (Stox Module)

#### `stox_material_master`
**Description:** Material master data with inventory parameters.

**Key Columns:**
- `material_number` - Material/SKU identifier (PRIMARY KEY)
- `material_description` - Product name
- `unit_cost` - Cost per unit
- `unit_price` - Selling price
- `lead_time_days` - Replenishment lead time
- `storage_cost_pct` - Storage cost as % of unit cost

**Used By:**
- All inventory calculations
- Cost analysis
- Procurement planning

---

#### `stox_lot_size`
**Description:** Optimal lot sizes calculated using EOQ or similar methods.

**Key Columns:**
- `material_number` - Material identifier
- `economic_order_quantity` - EOQ
- `order_frequency_annual` - Orders per year
- `annual_ordering_cost` - Total ordering cost
- `annual_holding_cost` - Total holding cost
- `calculation_date` - When calculated

**Used By:**
- Procurement planning
- Cost optimization
- Order scheduling

---

#### `stox_safety_stock`
**Description:** Safety stock levels based on demand variability.

**Key Columns:**
- `material_number` - Material identifier
- `safety_stock_units` - Safety stock quantity
- `service_level_pct` - Target service level (e.g., 95%)
- `demand_std_dev` - Standard deviation of demand
- `lead_time_days` - Lead time
- `calculation_method` - Method used (statistical, fixed, etc.)

**Used By:**
- Inventory policy setting
- Risk management
- Service level monitoring

---

#### `stox_reorder_point`
**Description:** Reorder points for triggering replenishment.

**Key Columns:**
- `material_number` - Material identifier
- `reorder_point` - Trigger quantity
- `avg_daily_demand` - Average daily usage
- `safety_stock` - Safety stock component
- `lead_time_demand` - Expected demand during lead time

**Used By:**
- Automated ordering
- Inventory alerts
- Stock monitoring

---

#### `stox_annual_cost`
**Description:** Annual cost breakdown by material.

**Key Columns:**
- `material_number` - Material identifier
- `annual_demand_units` - Yearly demand
- `ordering_cost` - Total ordering costs
- `holding_cost` - Total holding costs
- `shortage_cost` - Stockout costs (if applicable)
- `total_annual_cost` - Total inventory cost

**Used By:**
- Budget planning
- Cost allocation
- Performance measurement

---

#### `stox_working_capital`
**Description:** Working capital tied up in inventory.

**Key Columns:**
- `material_number` - Material identifier
- `avg_inventory_units` - Average inventory level
- `unit_cost` - Cost per unit
- `inventory_value` - Total value
- `turnover_ratio` - Inventory turns
- `days_on_hand` - Average days of inventory

**Used By:**
- Financial reporting
- Cash flow management
- Efficiency metrics

---

#### `stox_performance_metrics`
**Description:** Inventory KPIs and performance indicators.

**Key Columns:**
- `material_number` - Material identifier
- `fill_rate_pct` - Order fill rate
- `stockout_incidents` - Number of stockouts
- `excess_inventory_value` - Overstock value
- `obsolete_inventory_value` - Obsolete stock
- `inventory_accuracy_pct` - Physical vs system accuracy

**Used By:**
- KPI dashboards
- Performance reviews
- Process improvement

---

#### `stox_enterprise_summary`
**Description:** Enterprise-wide inventory summary statistics.

**Key Columns:**
- `calculation_date` - Report date
- `total_sku_count` - Number of active SKUs
- `total_inventory_value` - Total inventory worth
- `avg_turnover_ratio` - Average turns
- `total_working_capital` - Capital tied up
- `service_level_achievement` - Service level %

**Used By:**
- Executive dashboards
- Strategic planning
- Board reporting

---

#### `stox_future_projection`
**Description:** Forward-looking inventory projections.

**Key Columns:**
- `material_number` - Material identifier
- `projection_date` - Future date
- `projected_demand` - Expected demand
- `projected_inventory_level` - Expected stock
- `projected_orders` - Planned orders
- `confidence_interval` - Forecast accuracy range

**Used By:**
- Capacity planning
- Scenario modeling
- Financial forecasting

---

### 5. Enterprise Pulse Monitoring Tables

#### `pulse_monitors`
**Description:** Configuration for active monitoring queries.

**Expected Row Count:** Variable (user-created monitors)

**Key Columns:**
- `id` - Monitor UUID (PRIMARY KEY)
- `user_id` - Owner/creator
- `name` - Monitor name
- `description` - Purpose description
- `natural_language_query` - Original NL query
- `sql_query` - Generated SQL
- `data_source` - 'bigquery' or 'postgresql'
- `alert_condition` - JSONB alert rules
- `severity` - 'low', 'medium', 'high', 'critical'
- `frequency` - 'hourly', 'daily', 'weekly', 'monthly'
- `enabled` - Active status
- `next_run` - Scheduled execution time
- `last_run` - Last execution time
- `query_version` - Version number
- `true_positives` - Correct alert count
- `false_positives` - False alarm count

**Used By:**
- Enterprise Pulse scheduler
- Alert generation
- Monitor management UI

---

#### `pulse_alerts`
**Description:** Historical alerts triggered by monitors.

**Key Columns:**
- `id` - Alert UUID (PRIMARY KEY)
- `monitor_id` - Reference to pulse_monitors
- `detected_at` - When triggered
- `severity` - Alert severity
- `message` - Alert description
- `data` - JSONB with query results
- `acknowledged` - User acknowledgment flag
- `acknowledged_at` - Ack timestamp
- `acknowledged_by` - User who acknowledged
- `feedback` - 'true_positive' or 'false_positive'

**Used By:**
- Alert dashboard
- Notification system
- Feedback loop for monitor tuning

---

#### `pulse_monitor_templates`
**Description:** Pre-built monitor templates for common use cases.

**Expected Row Count:** ~11 templates

**Key Columns:**
- `id` - Template UUID
- `name` - Template name
- `description` - What it monitors
- `category` - 'cfo', 'supply_chain', 'sales', etc.
- `natural_language_template` - NL query template
- `sql_template` - SQL with placeholders
- `data_source` - Target data source
- `default_frequency` - Recommended frequency
- `default_severity` - Recommended severity
- `suggested_alert_condition` - Default alert rule
- `usage_count` - Times used
- `avg_rating` - User rating

**Used By:**
- Monitor creation wizard
- Template library UI
- Quick start guides

---

#### `pulse_execution_log`
**Description:** Detailed execution history of monitors.

**Key Columns:**
- `id` - Log entry ID
- `monitor_id` - Monitor reference
- `executed_at` - Execution timestamp
- `execution_duration_ms` - Runtime
- `rows_returned` - Result count
- `alert_triggered` - Boolean
- `error_message` - If execution failed

**Used By:**
- Performance monitoring
- Debugging
- Audit trail

---

#### `pulse_query_history`
**Description:** User query history from Enterprise Pulse.

**Key Columns:**
- `id` - Entry ID
- `user_id` - User identifier
- `query_text` - Original query
- `executed_at` - Timestamp
- `data_source` - Target DB
- `rows_returned` - Result count

**Used By:**
- Usage analytics
- Query optimization
- User behavior analysis

---

#### `pulse_query_versions`
**Description:** Version history of monitor SQL queries.

**Key Columns:**
- `id` - Version ID (SERIAL)
- `monitor_id` - Monitor reference
- `version` - Version number
- `sql_query` - SQL at this version
- `change_reason` - Why changed
- `created_at` - When created

**Used By:**
- Query evolution tracking
- Rollback capability
- Audit compliance

---

## Data Import Requirements

### Prerequisites
- Local PostgreSQL with source data
- Network access to GCP VM
- Sufficient disk space (~100MB for full dump)

### Import Order
1. Create schema first (all table structures)
2. Import master/reference data:
   - `customer_master`
   - `stox_material_master`
   - `pulse_monitor_templates`
3. Import transactional data:
   - `transaction_data` (largest table)
4. Import derived/aggregated data:
   - `segment_performance`
   - `time_series_performance`
   - `product_customer_matrix`
   - Cohort tables
   - Regional tables
   - Stox calculation tables

### Validation Queries

```sql
-- Check all tables exist
SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';
-- Expected: 26

-- Check key table row counts
SELECT
    'transaction_data' as table_name, COUNT(*) FROM transaction_data
UNION ALL
SELECT 'customer_master', COUNT(*) FROM customer_master
UNION ALL
SELECT 'pulse_monitor_templates', COUNT(*) FROM pulse_monitor_templates;

-- Check for missing critical data
SELECT
    CASE WHEN EXISTS (SELECT 1 FROM transaction_data) THEN 'OK' ELSE 'MISSING' END as transaction_data,
    CASE WHEN EXISTS (SELECT 1 FROM customer_master) THEN 'OK' ELSE 'MISSING' END as customer_master,
    CASE WHEN EXISTS (SELECT 1 FROM pulse_monitor_templates) THEN 'OK' ELSE 'MISSING' END as templates;
```

---

## Maintenance

### Regular Tasks
- **Daily:** Monitor table sizes and query performance
- **Weekly:** Backup database using `pg_dump`
- **Monthly:** Vacuum and analyze tables
- **Quarterly:** Review and archive old alerts/logs

### Backup Strategy
```bash
# Full backup
PGPASSWORD=mantrix2024 pg_dump -h localhost -U inder -d customer_analytics -Fc \
  -f ~/backups/customer_analytics_$(date +%Y%m%d).dump

# Critical tables only (for quick recovery)
PGPASSWORD=mantrix2024 pg_dump -h localhost -U inder -d customer_analytics -Fc \
  -t customer_master -t transaction_data -t pulse_monitors -t pulse_monitor_templates \
  -f ~/backups/critical_$(date +%Y%m%d).dump
```

---

## References
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Mantrix Deployment Guide: `terraform/gcp/README.md`
- Backend Source: `backend/src/db/postgresql_client.py`
