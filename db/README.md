# STOX.AI PostgreSQL Database Migration

Complete database schema and migration scripts for all 26 STOX.AI tiles.

## Overview

This directory contains SQL migration scripts to create a complete PostgreSQL database for the STOX.AI supply chain optimization platform.

**Total Tables:** 40+ tables across 7 modules
**Total Tiles Supported:** 26 tiles
**Database:** PostgreSQL 12+

## Migration Files

Execute in this order:

| File | Description | Tables Created |
|------|-------------|----------------|
| `001_create_master_tables.sql` | Master data (SKU, Location, Channel, Supplier, BOM) | 8 tables |
| `002_create_demand_flow_tables.sql` | MODULE 0: Demand Flow (2 tiles) | 3 tables |
| `003_create_demand_forecasting_tables.sql` | MODULE 1: Demand Forecasting (4 tiles) | 5 tables |
| `004_create_replenishment_tables.sql` | MODULE 2: Store Replenishment (4 tiles) | 6 tables |
| `005_create_remaining_modules.sql` | MODULES 3-7: All remaining tiles (16 tiles) | 20+ tables |

## Quick Start

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE stoxai_db;

# Connect to the new database
\c stoxai_db
```

### 2. Run Migrations

```bash
# Execute all migration scripts in order
cd db/migrations

psql -U postgres -d stoxai_db -f 001_create_master_tables.sql
psql -U postgres -d stoxai_db -f 002_create_demand_flow_tables.sql
psql -U postgres -d stoxai_db -f 003_create_demand_forecasting_tables.sql
psql -U postgres -d stoxai_db -f 004_create_replenishment_tables.sql
psql -U postgres -d stoxai_db -f 005_create_remaining_modules.sql
```

### 3. Verify Installation

```sql
-- Check all tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should return 40+ tables
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check sample data
SELECT * FROM channels;
SELECT * FROM users;
```

## Database Schema Overview

### Master Data Tables
- `sku_master` - Product/SKU master data
- `locations` - Stores, DCs, Plants, Partners
- `channels` - Sales channels (CH01-CH04)
- `suppliers` - Component suppliers
- `bom_headers` - Bill of materials headers
- `bom_items` - BOM line items
- `users` - STOX.AI application users

### MODULE 0: Demand Flow
- `sell_through_bridge` - POS to shipment tracking
- `partner_pos_feeds` - EDI feed monitoring
- `partner_pos_transactions` - Raw POS data

### MODULE 1: Demand Forecasting
- `demand_forecasts` - AI forecast with accuracy metrics
- `demand_aggregations` - Multi-dimensional aggregations
- `forecast_overrides` - Manual forecast adjustments
- `demand_alerts` - Automated alerts
- `forecast_models` - ML model metadata

### MODULE 2: Store Replenishment
- `store_replenishment` - Store-level replen calculations
- `delivery_routes` - Route optimization
- `route_stops` - Delivery stop details
- `stockout_risks` - Stockout risk monitoring
- `channel_allocations` - DC to channel allocation

### MODULE 3: DC Inventory
- `dc_inventory` - DC inventory cockpit
- `working_capital_metrics` - Working capital tracking
- `excess_obsolete_inventory` - E&O management

### MODULE 4: Supply Planning
- `supply_requirements` - Plant supply needs
- `production_campaigns` - Production optimization
- `mrp_planned_orders` - MRP accelerator

### MODULE 5: BOM Explosion
- `bom_explosions` - Multi-level BOM explosion
- `component_usage` - Component where-used tracking
- `bom_exceptions` - BOM exceptions

### MODULE 6: Procurement
- `component_consolidation` - Consolidation engine
- `consolidated_pos` - Consolidated purchase orders
- `supplier_performance_history` - Supplier metrics

### MODULE 7: Analytics
- `what_if_scenarios` - Scenario planning
- `kpi_metrics` - Executive KPI dashboard
- `anomaly_detection` - Predictive analytics
- `working_capital_optimization` - WC optimizer

## Key Features

### Auto-Calculated Columns
Many tables use PostgreSQL **GENERATED ALWAYS AS** columns for automatic calculations:
- `replenishment_qty` - Auto-calculated from forecast, on-hand, safety stock
- `days_to_stockout` - Auto-calculated from current stock and daily forecast
- `accuracy_pct` - Auto-calculated forecast accuracy
- `variance_pct` - Auto-calculated variance from forecast

### Triggers
- **update_updated_at_column()** - Auto-updates `updated_at` timestamp on all tables

### Indexes
- Optimized indexes on frequently queried columns
- Composite indexes for common query patterns
- Partial indexes for filtered queries (e.g., unresolved alerts)

### Constraints
- Foreign key relationships for data integrity
- Unique constraints on business keys
- Check constraints for valid values

## Data Loading Strategy

### Phase 1: Master Data
1. Load SKU master from Excel
2. Import location master (stores, DCs, plants)
3. Load supplier master
4. Import BOM structures

### Phase 2: Historical Transactional Data
1. Generate 90 days of historical sell-through data
2. Import historical demand forecasts
3. Load inventory snapshots

### Phase 3: Real-Time Integration
1. Connect to SAP for live data (VBRK, MARD, MD04, etc.)
2. Set up EDI feeds for partner POS
3. Enable real-time forecast updates

## Sample Data Generation

See `../data/sample_data_generator.py` for scripts to generate realistic test data for all tables.

```bash
# Generate sample data
python data/sample_data_generator.py --days 90 --skus 20 --stores 50
```

## Connection Examples

### Node.js (pg)
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'stoxai_db',
  user: 'postgres',
  password: 'your_password',
  port: 5432,
});

// Query example
const result = await pool.query(
  'SELECT * FROM sell_through_bridge WHERE sku_id = $1 AND transaction_date = $2',
  ['SKU_HC_001', '2024-10-25']
);
```

### Python (psycopg2)
```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="stoxai_db",
    user="postgres",
    password="your_password"
)

cursor = conn.cursor()
cursor.execute("SELECT * FROM demand_forecasts WHERE sku_id = %s", ('SKU_HC_001',))
rows = cursor.fetchall()
```

## Performance Tuning

### Recommended PostgreSQL Settings
```sql
-- Increase shared buffers
shared_buffers = 256MB

-- Increase work memory for complex queries
work_mem = 16MB

-- Enable parallel queries
max_parallel_workers_per_gather = 4

-- Increase effective cache size
effective_cache_size = 1GB
```

### Partitioning (for large datasets)
Consider partitioning time-series tables by date:
- `sell_through_bridge` - Partition by month
- `demand_forecasts` - Partition by quarter
- `dc_inventory` - Partition by month

Example:
```sql
CREATE TABLE sell_through_bridge_2024_10 PARTITION OF sell_through_bridge
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
```

## Backup Strategy

```bash
# Full backup
pg_dump -U postgres stoxai_db > stoxai_backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres stoxai_db < stoxai_backup_20241025.sql

# Backup specific tables
pg_dump -U postgres -t sku_master -t locations stoxai_db > master_data_backup.sql
```

## Monitoring Queries

```sql
-- Table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Row counts
SELECT
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- Index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## Maintenance

```sql
-- Vacuum and analyze all tables
VACUUM ANALYZE;

-- Reindex if needed
REINDEX DATABASE stoxai_db;

-- Update table statistics
ANALYZE VERBOSE;
```

## Troubleshooting

### Issue: Slow queries
**Solution:** Check missing indexes, run EXPLAIN ANALYZE

### Issue: Locks and deadlocks
**Solution:** Check pg_stat_activity, kill long-running queries

### Issue: Disk space
**Solution:** Vacuum old data, enable autovacuum, partition large tables

## Next Steps

1. ✅ Create PostgreSQL database
2. ✅ Run migration scripts
3. ⏳ Load master data
4. ⏳ Generate sample transactional data
5. ⏳ Build backend API (Node.js/Python)
6. ⏳ Update frontend to use API instead of mock data
7. ⏳ Set up SAP integration
8. ⏳ Configure EDI feeds

## Support

For issues or questions:
- Review the main [STOX_AI_DATA_AUDIT.md](../docs/STOX_AI_DATA_AUDIT.md)
- Check PostgreSQL logs: `/var/log/postgresql/`
- Enable query logging in postgresql.conf

---

**Last Updated:** 2025-10-25
**Database Version:** PostgreSQL 12+
**Schema Version:** 1.0.0
