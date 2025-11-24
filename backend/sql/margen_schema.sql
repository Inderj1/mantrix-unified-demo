-- MARGEN.AI Database Schema
-- Created: 2025-11-23
-- Purpose: Fact and dimension tables for margin analytics

-- Drop existing tables if needed (for development)
-- DROP TABLE IF EXISTS fact_transactions CASCADE;
-- DROP TABLE IF EXISTS fact_distributor_pl CASCADE;
-- DROP TABLE IF EXISTS dim_surgeon CASCADE;
-- DROP TABLE IF EXISTS dim_distributor CASCADE;
-- DROP TABLE IF EXISTS dim_facility CASCADE;
-- DROP TABLE IF EXISTS dim_region CASCADE;
-- DROP TABLE IF EXISTS dim_system CASCADE;

-- ============================================
-- DIMENSION TABLES
-- ============================================

-- Dimension: Surgeons
CREATE TABLE IF NOT EXISTS dim_surgeon (
    surgeon_id SERIAL PRIMARY KEY,
    surgeon_name VARCHAR(255) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dim_surgeon_name ON dim_surgeon(surgeon_name);

-- Dimension: Distributors
CREATE TABLE IF NOT EXISTS dim_distributor (
    distributor_id SERIAL PRIMARY KEY,
    distributor_name VARCHAR(255) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dim_distributor_name ON dim_distributor(distributor_name);

-- Dimension: Facilities
CREATE TABLE IF NOT EXISTS dim_facility (
    facility_id SERIAL PRIMARY KEY,
    facility_name VARCHAR(255) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dim_facility_name ON dim_facility(facility_name);

-- Dimension: Regions
CREATE TABLE IF NOT EXISTS dim_region (
    region_id SERIAL PRIMARY KEY,
    region_name VARCHAR(100) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dim_region_name ON dim_region(region_name);

-- Dimension: Product Systems
CREATE TABLE IF NOT EXISTS dim_system (
    system_id SERIAL PRIMARY KEY,
    system_name VARCHAR(100) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dim_system_name ON dim_system(system_name);

-- ============================================
-- FACT TABLES
-- ============================================

-- Fact Table: Transactions (Primary source: csg.xlsx)
CREATE TABLE IF NOT EXISTS fact_transactions (
    transaction_id SERIAL PRIMARY KEY,
    surgery_date DATE NOT NULL,
    surgeon_id INTEGER REFERENCES dim_surgeon(surgeon_id),
    distributor_id INTEGER REFERENCES dim_distributor(distributor_id),
    region_id INTEGER REFERENCES dim_region(region_id),
    facility_id INTEGER REFERENCES dim_facility(facility_id),
    system_id INTEGER REFERENCES dim_system(system_id),
    -- Direct fields from csg.xlsx
    surgeon VARCHAR(255),
    distributor VARCHAR(255),
    region VARCHAR(100),
    facility VARCHAR(255),
    system VARCHAR(100),
    item_code VARCHAR(50),
    item_description VARCHAR(500),
    quantity INTEGER,
    price_each DECIMAL(10,2),
    total_sales DECIMAL(12,2),
    total_std_cost DECIMAL(12,2),
    total_gm DECIMAL(12,2),
    -- Calculated fields
    gm_percent DECIMAL(5,2), -- (total_gm / total_sales) * 100
    -- Metadata
    source_file VARCHAR(255) DEFAULT 'csg.xlsx',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_fact_txn_surgery_date ON fact_transactions(surgery_date);
CREATE INDEX idx_fact_txn_surgeon ON fact_transactions(surgeon);
CREATE INDEX idx_fact_txn_distributor ON fact_transactions(distributor);
CREATE INDEX idx_fact_txn_region ON fact_transactions(region);
CREATE INDEX idx_fact_txn_facility ON fact_transactions(facility);
CREATE INDEX idx_fact_txn_system ON fact_transactions(system);
CREATE INDEX idx_fact_txn_item_code ON fact_transactions(item_code);
CREATE INDEX idx_fact_txn_surgeon_id ON fact_transactions(surgeon_id);
CREATE INDEX idx_fact_txn_distributor_id ON fact_transactions(distributor_id);
CREATE INDEX idx_fact_txn_date_range ON fact_transactions(surgery_date, total_sales);

-- Fact Table: Distributor P&L (Source: SOP Distributor Profitability)
CREATE TABLE IF NOT EXISTS fact_distributor_pl (
    pl_id SERIAL PRIMARY KEY,
    distributor_id INTEGER REFERENCES dim_distributor(distributor_id),
    distributor VARCHAR(255) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    month_date DATE, -- First day of month for easier querying
    -- P&L Line Items
    grand_total DECIMAL(12,2), -- Revenue
    total_product_cost DECIMAL(12,2), -- COGS
    gross_profit DECIMAL(12,2),
    gross_profit_percent DECIMAL(5,2),
    -- Operating Expenses
    commission DECIMAL(12,2),
    commission_percent DECIMAL(5,2),
    inventory_carrying_cost DECIMAL(12,2),
    inventory_percent DECIMAL(5,2),
    total_opex DECIMAL(12,2),
    -- Profitability
    operating_profit DECIMAL(12,2),
    operating_profit_percent DECIMAL(5,2),
    net_profit DECIMAL(12,2),
    net_profit_percent DECIMAL(5,2),
    -- Metadata
    source_file VARCHAR(255) DEFAULT 'SOP Distributor Profitability',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(distributor, month)
);

CREATE INDEX idx_fact_pl_distributor ON fact_distributor_pl(distributor);
CREATE INDEX idx_fact_pl_month ON fact_distributor_pl(month);
CREATE INDEX idx_fact_pl_month_date ON fact_distributor_pl(month_date);
CREATE INDEX idx_fact_pl_distributor_id ON fact_distributor_pl(distributor_id);

-- ============================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- ============================================

-- View: Monthly Revenue Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_revenue AS
SELECT
    DATE_TRUNC('month', surgery_date) AS month,
    TO_CHAR(surgery_date, 'YYYY-MM') AS month_str,
    COUNT(*) AS transaction_count,
    SUM(total_sales) AS total_revenue,
    SUM(total_std_cost) AS total_cogs,
    SUM(total_gm) AS total_gross_margin,
    AVG(gm_percent) AS avg_gm_percent,
    SUM(quantity) AS total_units
FROM fact_transactions
GROUP BY DATE_TRUNC('month', surgery_date), TO_CHAR(surgery_date, 'YYYY-MM')
ORDER BY month;

CREATE UNIQUE INDEX idx_mv_monthly_revenue_month ON mv_monthly_revenue(month);

-- View: Revenue by System
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_by_system AS
SELECT
    system,
    COUNT(*) AS transaction_count,
    SUM(total_sales) AS total_revenue,
    SUM(total_std_cost) AS total_cogs,
    SUM(total_gm) AS total_gross_margin,
    AVG(gm_percent) AS avg_gm_percent,
    SUM(quantity) AS total_units,
    AVG(price_each) AS avg_price
FROM fact_transactions
WHERE system IS NOT NULL
GROUP BY system
ORDER BY total_revenue DESC;

CREATE UNIQUE INDEX idx_mv_revenue_by_system_system ON mv_revenue_by_system(system);

-- View: Revenue by Distributor
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_by_distributor AS
SELECT
    distributor,
    COUNT(*) AS transaction_count,
    SUM(total_sales) AS total_revenue,
    SUM(total_std_cost) AS total_cogs,
    SUM(total_gm) AS total_gross_margin,
    AVG(gm_percent) AS avg_gm_percent,
    SUM(quantity) AS total_units
FROM fact_transactions
WHERE distributor IS NOT NULL
GROUP BY distributor
ORDER BY total_revenue DESC;

CREATE UNIQUE INDEX idx_mv_revenue_by_distributor_dist ON mv_revenue_by_distributor(distributor);

-- View: Top Surgeons
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_surgeons AS
SELECT
    surgeon,
    COUNT(*) AS procedure_count,
    SUM(total_sales) AS total_revenue,
    SUM(total_gm) AS total_gross_margin,
    AVG(gm_percent) AS avg_gm_percent,
    SUM(quantity) AS total_units
FROM fact_transactions
WHERE surgeon IS NOT NULL
GROUP BY surgeon
ORDER BY total_revenue DESC
LIMIT 100;

CREATE UNIQUE INDEX idx_mv_top_surgeons_surgeon ON mv_top_surgeons(surgeon);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_margen_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_revenue;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_by_system;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_by_distributor;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_surgeons;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate GM percent if not set
CREATE OR REPLACE FUNCTION calculate_gm_percent()
RETURNS void AS $$
BEGIN
    UPDATE fact_transactions
    SET gm_percent = CASE
        WHEN total_sales > 0 THEN (total_gm / total_sales) * 100
        ELSE 0
    END
    WHERE gm_percent IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant appropriate permissions (adjust user as needed)
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE fact_transactions IS 'Primary fact table containing all transaction-level data from csg.xlsx';
COMMENT ON TABLE fact_distributor_pl IS 'P&L statements by distributor and month from SOP Distributor Profitability';
COMMENT ON TABLE dim_surgeon IS 'Dimension table for surgeons';
COMMENT ON TABLE dim_distributor IS 'Dimension table for distributors';
COMMENT ON TABLE dim_facility IS 'Dimension table for facilities';
COMMENT ON TABLE dim_region IS 'Dimension table for regions';
COMMENT ON TABLE dim_system IS 'Dimension table for product systems';

COMMENT ON COLUMN fact_transactions.gm_percent IS 'Gross margin percentage: (total_gm / total_sales) * 100';
COMMENT ON COLUMN fact_transactions.surgeon_id IS 'Foreign key to dim_surgeon (may be NULL if not linked)';

-- ============================================
-- END OF SCHEMA
-- ============================================
