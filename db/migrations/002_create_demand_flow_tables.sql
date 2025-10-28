-- ========================================
-- STOX.AI Database Migration Script
-- Part 2: MODULE 0 - Demand Flow Tables
-- ========================================
-- Created: 2025-10-25
-- Purpose: Create tables for Demand Flow module (2 tiles)
-- ========================================

-- ========================================
-- TILE 1: Sell-Through to Sell-In Bridge
-- ========================================

CREATE TABLE IF NOT EXISTS sell_through_bridge (
    id SERIAL PRIMARY KEY,
    channel_id VARCHAR(20) NOT NULL REFERENCES channels(channel_id),
    location_id VARCHAR(50) NOT NULL REFERENCES locations(location_id),
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    transaction_date DATE NOT NULL,
    sell_through_qty INT DEFAULT 0,
    sell_in_qty INT DEFAULT 0,
    forecast_qty INT DEFAULT 0,
    confidence_pct DECIMAL(5,2) DEFAULT 85.0,
    variance_qty INT GENERATED ALWAYS AS (sell_through_qty - forecast_qty) STORED,
    variance_pct DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN forecast_qty > 0 THEN ROUND(((sell_through_qty - forecast_qty)::DECIMAL / forecast_qty) * 100, 2)
            ELSE 0
        END
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel_id, location_id, sku_id, transaction_date)
);

CREATE INDEX idx_st_bridge_date ON sell_through_bridge(transaction_date DESC);
CREATE INDEX idx_st_bridge_sku ON sell_through_bridge(sku_id);
CREATE INDEX idx_st_bridge_channel ON sell_through_bridge(channel_id);
CREATE INDEX idx_st_bridge_location ON sell_through_bridge(location_id);
CREATE INDEX idx_st_bridge_composite ON sell_through_bridge(sku_id, channel_id, transaction_date);

COMMENT ON TABLE sell_through_bridge IS 'MODULE 0 - Tile 1: Sell-through to sell-in demand flow tracking';
COMMENT ON COLUMN sell_through_bridge.sell_through_qty IS 'Consumer POS quantity';
COMMENT ON COLUMN sell_through_bridge.sell_in_qty IS 'Shipment forecast to channel';
COMMENT ON COLUMN sell_through_bridge.confidence_pct IS 'ML model confidence in forecast';

-- ========================================
-- TILE 2: Partner POS Monitor
-- ========================================

CREATE TABLE IF NOT EXISTS partner_pos_feeds (
    id SERIAL PRIMARY KEY,
    partner_id VARCHAR(50) NOT NULL REFERENCES locations(location_id),
    edi_feed_type VARCHAR(50) NOT NULL, -- EDI-852, EDI-867, API, SFTP
    last_update TIMESTAMP,
    feed_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- ACTIVE, DELAYED, ERROR, PENDING
    record_count INT DEFAULT 0,
    data_quality_pct DECIMAL(5,2) DEFAULT 100.0,
    error_message TEXT,
    next_expected_update TIMESTAMP,
    sla_threshold_mins INT DEFAULT 60,
    is_sla_breach BOOLEAN GENERATED ALWAYS AS (
        CASE
            WHEN last_update IS NOT NULL AND
                 EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_update))/60 > sla_threshold_mins
            THEN TRUE
            ELSE FALSE
        END
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partner_feeds_partner ON partner_pos_feeds(partner_id);
CREATE INDEX idx_partner_feeds_status ON partner_pos_feeds(feed_status);
CREATE INDEX idx_partner_feeds_last_update ON partner_pos_feeds(last_update DESC);

COMMENT ON TABLE partner_pos_feeds IS 'MODULE 0 - Tile 2: Partner EDI/POS feed monitoring';
COMMENT ON COLUMN partner_pos_feeds.edi_feed_type IS 'EDI transaction set or feed type';
COMMENT ON COLUMN partner_pos_feeds.is_sla_breach IS 'Auto-calculated SLA breach flag';

-- ========================================
-- Partner POS Transactions (raw data)
-- ========================================

CREATE TABLE IF NOT EXISTS partner_pos_transactions (
    id SERIAL PRIMARY KEY,
    feed_id INT REFERENCES partner_pos_feeds(id) ON DELETE CASCADE,
    partner_id VARCHAR(50) NOT NULL REFERENCES locations(location_id),
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    store_number VARCHAR(50),
    transaction_date DATE NOT NULL,
    pos_qty INT DEFAULT 0,
    sales_amount DECIMAL(10,2),
    inventory_on_hand INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partner_pos_feed ON partner_pos_transactions(feed_id);
CREATE INDEX idx_partner_pos_partner ON partner_pos_transactions(partner_id);
CREATE INDEX idx_partner_pos_sku ON partner_pos_transactions(sku_id);
CREATE INDEX idx_partner_pos_date ON partner_pos_transactions(transaction_date DESC);

COMMENT ON TABLE partner_pos_transactions IS 'Raw POS transactions from partner EDI feeds';

-- ========================================
-- Update Triggers
-- ========================================

CREATE TRIGGER update_sell_through_bridge_updated_at BEFORE UPDATE ON sell_through_bridge
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_pos_feeds_updated_at BEFORE UPDATE ON partner_pos_feeds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Sample Data (for testing)
-- ========================================

-- Commented out - uncomment for initial testing
/*
INSERT INTO sell_through_bridge (channel_id, location_id, sku_id, transaction_date, sell_through_qty, sell_in_qty, forecast_qty, confidence_pct) VALUES
    ('CH01', 'STORE_001', 'SKU_HC_001', '2024-10-25', 45, 215, 45, 92),
    ('CH02', 'ONLINE_DIR', 'SKU_HC_001', '2024-10-25', 51, 450, 48, 89),
    ('CH03', 'PARTNER_ULTA', 'SKU_HC_001', '2024-10-25', 450, 450, 465, 85)
ON CONFLICT DO NOTHING;

INSERT INTO partner_pos_feeds (partner_id, edi_feed_type, last_update, feed_status, record_count, data_quality_pct) VALUES
    ('PARTNER_ULTA', 'EDI-852', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 'ACTIVE', 1250, 98),
    ('PARTNER_SEPHORA', 'EDI-852', CURRENT_TIMESTAMP - INTERVAL '35 minutes', 'ACTIVE', 980, 96),
    ('PARTNER_TARGET', 'EDI-852', CURRENT_TIMESTAMP - INTERVAL '45 minutes', 'DELAYED', 750, 92),
    ('PARTNER_WALMART', 'EDI-852', CURRENT_TIMESTAMP - INTERVAL '12 hours', 'ERROR', 0, 0)
ON CONFLICT DO NOTHING;
*/
