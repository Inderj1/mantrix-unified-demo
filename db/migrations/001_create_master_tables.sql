-- ========================================
-- STOX.AI Database Migration Script
-- Part 1: Master Data Tables
-- ========================================
-- Created: 2025-10-25
-- Purpose: Create core master data tables for STOX.AI
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. SKU Master Table
-- ========================================
CREATE TABLE IF NOT EXISTS sku_master (
    sku_id VARCHAR(50) PRIMARY KEY,
    sku_name VARCHAR(255) NOT NULL,
    product_family VARCHAR(100),
    category VARCHAR(100),
    sub_category VARCHAR(100),
    unit_cost DECIMAL(10,2),
    lead_time_days INT DEFAULT 30,
    safety_stock_days INT DEFAULT 7,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sku_family ON sku_master(product_family);
CREATE INDEX idx_sku_category ON sku_master(category);
CREATE INDEX idx_sku_active ON sku_master(active);

COMMENT ON TABLE sku_master IS 'Master data for all SKUs/products';
COMMENT ON COLUMN sku_master.sku_id IS 'Primary key - SKU identifier';
COMMENT ON COLUMN sku_master.unit_cost IS 'Standard cost per unit in USD';

-- ========================================
-- 2. Location Master Table
-- ========================================
CREATE TABLE IF NOT EXISTS locations (
    location_id VARCHAR(50) PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    location_type VARCHAR(50) NOT NULL, -- STORE, DC, PLANT, PARTNER, DISTRIBUTOR
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'USA',
    region VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_location_type ON locations(location_type);
CREATE INDEX idx_location_region ON locations(region);
CREATE INDEX idx_location_active ON locations(active);

COMMENT ON TABLE locations IS 'Master data for all locations (stores, DCs, plants, partners)';
COMMENT ON COLUMN locations.location_type IS 'Type: STORE, DC, PLANT, PARTNER, DISTRIBUTOR';

-- ========================================
-- 3. Channel Master Table
-- ========================================
CREATE TABLE IF NOT EXISTS channels (
    channel_id VARCHAR(20) PRIMARY KEY,
    channel_name VARCHAR(100) NOT NULL,
    channel_type VARCHAR(50) NOT NULL, -- RETAIL, ECOMMERCE, B2B, DISTRIBUTOR
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_channel_type ON channels(channel_type);

COMMENT ON TABLE channels IS 'Master data for sales channels';

-- ========================================
-- 4. Supplier Master Table
-- ========================================
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id VARCHAR(50) PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_code VARCHAR(50),
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    payment_terms VARCHAR(100),
    delivery_performance_pct DECIMAL(5,2) DEFAULT 95.0,
    quality_score_pct DECIMAL(5,2) DEFAULT 95.0,
    forecast_shared BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_supplier_active ON suppliers(active);
CREATE INDEX idx_supplier_performance ON suppliers(delivery_performance_pct DESC);

COMMENT ON TABLE suppliers IS 'Master data for component/material suppliers';

-- ========================================
-- 5. BOM (Bill of Materials) Tables
-- ========================================

-- BOM Header
CREATE TABLE IF NOT EXISTS bom_headers (
    bom_id SERIAL PRIMARY KEY,
    fg_sku VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id) ON DELETE CASCADE,
    bom_version VARCHAR(20) DEFAULT 'V1',
    effective_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, OBSOLETE, DRAFT
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fg_sku, bom_version)
);

CREATE INDEX idx_bom_fg_sku ON bom_headers(fg_sku);
CREATE INDEX idx_bom_status ON bom_headers(status);

COMMENT ON TABLE bom_headers IS 'BOM header for finished goods';

-- BOM Items (Components)
CREATE TABLE IF NOT EXISTS bom_items (
    bom_item_id SERIAL PRIMARY KEY,
    bom_id INT NOT NULL REFERENCES bom_headers(bom_id) ON DELETE CASCADE,
    component_sku VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    qty_per_fg DECIMAL(10,4) NOT NULL,
    unit_of_measure VARCHAR(20) DEFAULT 'EA',
    scrap_pct DECIMAL(5,2) DEFAULT 0,
    supplier_id VARCHAR(50) REFERENCES suppliers(supplier_id),
    line_number INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bom_id, component_sku)
);

CREATE INDEX idx_bom_items_bom ON bom_items(bom_id);
CREATE INDEX idx_bom_items_component ON bom_items(component_sku);
CREATE INDEX idx_bom_items_supplier ON bom_items(supplier_id);

COMMENT ON TABLE bom_items IS 'BOM line items (components required for each FG)';

-- ========================================
-- 6. User/Planner Table
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50), -- DEMAND_PLANNER, SUPPLY_PLANNER, INVENTORY_MANAGER, EXECUTIVE
    department VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

COMMENT ON TABLE users IS 'User master for STOX.AI application';

-- ========================================
-- Update Triggers for timestamp columns
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sku_master_updated_at BEFORE UPDATE ON sku_master
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bom_headers_updated_at BEFORE UPDATE ON bom_headers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Initial Data Load
-- ========================================

-- Insert default channels
INSERT INTO channels (channel_id, channel_name, channel_type) VALUES
    ('CH01', 'Retail Stores', 'RETAIL'),
    ('CH02', 'E-Commerce Direct', 'ECOMMERCE'),
    ('CH03', 'ULTA Partnership', 'B2B'),
    ('CH04', 'CosmoProf Distribution', 'DISTRIBUTOR')
ON CONFLICT (channel_id) DO NOTHING;

-- Insert sample user roles
INSERT INTO users (username, email, full_name, role, department) VALUES
    ('admin', 'admin@madisonreed.com', 'System Administrator', 'EXECUTIVE', 'IT'),
    ('dplanner1', 'dplanner@madisonreed.com', 'Demand Planner', 'DEMAND_PLANNER', 'Supply Chain'),
    ('splanner1', 'splanner@madisonreed.com', 'Supply Planner', 'SUPPLY_PLANNER', 'Supply Chain'),
    ('invmgr1', 'invmgr@madisonreed.com', 'Inventory Manager', 'INVENTORY_MANAGER', 'Operations')
ON CONFLICT (username) DO NOTHING;

-- ========================================
-- Verification Queries
-- ========================================

-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- SELECT COUNT(*) FROM sku_master;
-- SELECT COUNT(*) FROM locations;
-- SELECT COUNT(*) FROM channels;
-- SELECT COUNT(*) FROM suppliers;
