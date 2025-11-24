-- Migration 003: Add Invoice and Master Data Tables
-- Phase 1 Integration: Invoices, Item Master, Item Costs

-- ============================================================================
-- 1. FACT_INVOICES - Complete invoice/billing data
-- ============================================================================
CREATE TABLE IF NOT EXISTS fact_invoices (
    invoice_id SERIAL PRIMARY KEY,
    inv_number VARCHAR(50) NOT NULL,
    surgery_date DATE,
    surgeon VARCHAR(255),
    facility VARCHAR(255),
    item_code VARCHAR(100),
    system VARCHAR(255),
    quantity INT,
    price_each DECIMAL(10,2),
    amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(inv_number, item_code, surgery_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fact_invoices_inv_number ON fact_invoices(inv_number);
CREATE INDEX IF NOT EXISTS idx_fact_invoices_item_code ON fact_invoices(item_code);
CREATE INDEX IF NOT EXISTS idx_fact_invoices_surgeon ON fact_invoices(surgeon);
CREATE INDEX IF NOT EXISTS idx_fact_invoices_facility ON fact_invoices(facility);
CREATE INDEX IF NOT EXISTS idx_fact_invoices_surgery_date ON fact_invoices(surgery_date);
CREATE INDEX IF NOT EXISTS idx_fact_invoices_system ON fact_invoices(system);

-- Comments
COMMENT ON TABLE fact_invoices IS 'Complete invoice/billing data from Invoice Data.xlsx (21,005 records)';
COMMENT ON COLUMN fact_invoices.inv_number IS 'Invoice number - 5,835 unique invoices';
COMMENT ON COLUMN fact_invoices.amount IS 'Total invoice amount for this line item';

-- ============================================================================
-- 2. DIM_ITEMS - Complete item master data
-- ============================================================================
CREATE TABLE IF NOT EXISTS dim_items (
    item_number VARCHAR(100) PRIMARY KEY,
    item_description VARCHAR(500),
    label_impl_hgt VARCHAR(100),
    in_stock DECIMAL(10,2),
    rev_level VARCHAR(10),
    part_status VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    item_group VARCHAR(100),
    batch_prefix VARCHAR(100),
    udi_number VARCHAR(100),
    system_name VARCHAR(255),
    label_system VARCHAR(255),
    ifu_number VARCHAR(100),
    min_stock DECIMAL(10,2),
    drawing_number VARCHAR(100),
    inventory_uom VARCHAR(50),
    sales_uom VARCHAR(50),
    item_cost DECIMAL(10,2),
    last_evaluated_price DECIMAL(10,2),
    procurement_method VARCHAR(50),
    purchasing_uom VARCHAR(50),
    preferred_vendor VARCHAR(255),
    mfr_catalog_no VARCHAR(100),
    material VARCHAR(500),
    manage_batch_no BOOLEAN,
    attachment_path TEXT,
    attachment_entry VARCHAR(100),
    assessable_value DECIMAL(10,2),
    items_per_purchase_unit DECIMAL(10,2),
    serial_no_management BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dim_items_item_group ON dim_items(item_group);
CREATE INDEX IF NOT EXISTS idx_dim_items_system_name ON dim_items(system_name);
CREATE INDEX IF NOT EXISTS idx_dim_items_active ON dim_items(active);
CREATE INDEX IF NOT EXISTS idx_dim_items_part_status ON dim_items(part_status);
CREATE INDEX IF NOT EXISTS idx_dim_items_preferred_vendor ON dim_items(preferred_vendor);
CREATE INDEX IF NOT EXISTS idx_dim_items_material ON dim_items(material);

-- Comments
COMMENT ON TABLE dim_items IS 'Complete item master catalog from Item Data File.xlsx (12,852 items with 31 attributes)';
COMMENT ON COLUMN dim_items.item_number IS 'Primary item identifier - matches item_code in transactions';
COMMENT ON COLUMN dim_items.in_stock IS 'Current inventory quantity';
COMMENT ON COLUMN dim_items.material IS 'Material specification (e.g., Ti-6Al-4V ELI Per ASTM F3001)';

-- ============================================================================
-- 3. DIM_ITEM_COSTS - Manufacturing standard costs
-- ============================================================================
CREATE TABLE IF NOT EXISTS dim_item_costs (
    item_number VARCHAR(100) PRIMARY KEY,
    item_description VARCHAR(500),
    base_price DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dim_item_costs_base_price ON dim_item_costs(base_price);
CREATE INDEX IF NOT EXISTS idx_dim_item_costs_unit_price ON dim_item_costs(unit_price);

-- Comments
COMMENT ON TABLE dim_item_costs IS 'Manufacturing standard costs from Manufacturing Std Cost.xlsx (15,407 items)';
COMMENT ON COLUMN dim_item_costs.base_price IS 'Base manufacturing cost';
COMMENT ON COLUMN dim_item_costs.unit_price IS 'Unit cost for pricing calculations';

-- ============================================================================
-- 4. RECONCILIATION VIEW - Compare Invoices vs Transactions
-- ============================================================================
CREATE OR REPLACE VIEW vw_invoice_transaction_reconciliation AS
SELECT
    COALESCE(i.inv_number, t.inv_number) as inv_number,
    COALESCE(i.item_code, t.item_code) as item_code,
    COALESCE(i.surgery_date, t.surgery_date) as surgery_date,
    i.invoice_id,
    t.transaction_id,
    i.amount as invoice_amount,
    t.total_sales as transaction_amount,
    i.amount - COALESCE(t.total_sales, 0) as variance,
    CASE
        WHEN i.invoice_id IS NULL THEN 'Missing Invoice'
        WHEN t.transaction_id IS NULL THEN 'Missing Transaction'
        WHEN ABS(i.amount - COALESCE(t.total_sales, 0)) > 0.01 THEN 'Amount Variance'
        ELSE 'Matched'
    END as reconciliation_status,
    i.surgeon as invoice_surgeon,
    t.surgeon as transaction_surgeon,
    i.facility as invoice_facility,
    t.facility as transaction_facility,
    i.system as invoice_system,
    t.system as transaction_system
FROM fact_invoices i
FULL OUTER JOIN fact_transactions t
    ON i.inv_number = t.inv_number
    AND i.item_code = t.item_code
    AND i.surgery_date = t.surgery_date;

COMMENT ON VIEW vw_invoice_transaction_reconciliation IS 'Reconciles invoices against transactions to identify missing data and variances';

-- ============================================================================
-- 5. ENRICHED TRANSACTIONS VIEW - Transactions with Item Master Data
-- ============================================================================
CREATE OR REPLACE VIEW vw_transactions_enriched AS
SELECT
    t.*,
    i.item_description as master_item_description,
    i.in_stock,
    i.item_group,
    i.system_name as master_system_name,
    i.material,
    i.preferred_vendor,
    i.active as item_active,
    i.part_status,
    c.base_price as manufacturing_base_price,
    c.unit_price as manufacturing_unit_price,
    t.price_each - COALESCE(c.unit_price, 0) as markup_amount,
    CASE
        WHEN c.unit_price > 0 THEN ((t.price_each - c.unit_price) / c.unit_price * 100)
        ELSE NULL
    END as markup_percent
FROM fact_transactions t
LEFT JOIN dim_items i ON t.item_code = i.item_number
LEFT JOIN dim_item_costs c ON t.item_code = c.item_number;

COMMENT ON VIEW vw_transactions_enriched IS 'Transactions enriched with item master data and cost information';

-- ============================================================================
-- 6. SUMMARY STATISTICS - New Data Coverage
-- ============================================================================
CREATE OR REPLACE VIEW vw_data_coverage_summary AS
SELECT
    'Transactions' as data_source,
    COUNT(*) as record_count,
    COUNT(DISTINCT inv_number) as unique_invoices,
    COUNT(DISTINCT item_code) as unique_items,
    SUM(total_sales) as total_revenue,
    MIN(surgery_date) as date_from,
    MAX(surgery_date) as date_to
FROM fact_transactions
UNION ALL
SELECT
    'Invoices' as data_source,
    COUNT(*) as record_count,
    COUNT(DISTINCT inv_number) as unique_invoices,
    COUNT(DISTINCT item_code) as unique_items,
    SUM(amount) as total_revenue,
    MIN(surgery_date) as date_from,
    MAX(surgery_date) as date_to
FROM fact_invoices
UNION ALL
SELECT
    'Item Master' as data_source,
    COUNT(*) as record_count,
    NULL as unique_invoices,
    COUNT(item_number) as unique_items,
    NULL as total_revenue,
    NULL as date_from,
    NULL as date_to
FROM dim_items
UNION ALL
SELECT
    'Item Costs' as data_source,
    COUNT(*) as record_count,
    NULL as unique_invoices,
    COUNT(item_number) as unique_items,
    NULL as total_revenue,
    NULL as date_from,
    NULL as date_to
FROM dim_item_costs;

COMMENT ON VIEW vw_data_coverage_summary IS 'Summary statistics showing data coverage across all sources';

-- ============================================================================
-- Grant permissions (if needed)
-- ============================================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON fact_invoices TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON dim_items TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON dim_item_costs TO your_app_user;
-- GRANT SELECT ON vw_invoice_transaction_reconciliation TO your_app_user;
-- GRANT SELECT ON vw_transactions_enriched TO your_app_user;
-- GRANT SELECT ON vw_data_coverage_summary TO your_app_user;
