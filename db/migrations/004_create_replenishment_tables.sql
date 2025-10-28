-- ========================================
-- STOX.AI Database Migration Script
-- Part 4: MODULE 2 - Store Replenishment Tables
-- ========================================
-- Created: 2025-10-25
-- Purpose: Create tables for Outbound Replenishment (4 tiles)
-- ========================================

-- ========================================
-- TILE 7: Store Replenishment
-- ========================================

CREATE TABLE IF NOT EXISTS store_replenishment (
    id SERIAL PRIMARY KEY,
    location_id VARCHAR(50) NOT NULL REFERENCES locations(location_id),
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    forecast_7d INT NOT NULL DEFAULT 0,
    on_hand_qty INT NOT NULL DEFAULT 0,
    in_transit_qty INT NOT NULL DEFAULT 0,
    safety_stock_qty INT NOT NULL DEFAULT 0,
    replenishment_qty INT GENERATED ALWAYS AS (
        GREATEST(0, forecast_7d + safety_stock_qty - on_hand_qty - in_transit_qty)
    ) STORED,
    days_of_supply DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN forecast_7d > 0
            THEN ROUND((on_hand_qty + in_transit_qty)::DECIMAL / (forecast_7d::DECIMAL / 7), 2)
            ELSE NULL
        END
    ) STORED,
    stockout_risk VARCHAR(20) GENERATED ALWAYS AS (
        CASE
            WHEN on_hand_qty + in_transit_qty <= safety_stock_qty THEN 'CRITICAL'
            WHEN on_hand_qty + in_transit_qty <= safety_stock_qty * 1.5 THEN 'HIGH'
            WHEN on_hand_qty + in_transit_qty <= forecast_7d THEN 'MEDIUM'
            ELSE 'LOW'
        END
    ) STORED,
    calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_replenishment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, sku_id, calculation_date)
);

CREATE INDEX idx_replen_location ON store_replenishment(location_id);
CREATE INDEX idx_replen_sku ON store_replenishment(sku_id);
CREATE INDEX idx_replen_date ON store_replenishment(calculation_date DESC);
CREATE INDEX idx_replen_risk ON store_replenishment(stockout_risk);
CREATE INDEX idx_replen_needed ON store_replenishment(replenishment_qty) WHERE replenishment_qty > 0;

COMMENT ON TABLE store_replenishment IS 'MODULE 2 - Tile 7: Store-level replenishment calculations';
COMMENT ON COLUMN store_replenishment.replenishment_qty IS 'Auto-calculated replenishment need';
COMMENT ON COLUMN store_replenishment.days_of_supply IS 'Days of inventory coverage';

-- ========================================
-- TILE 8: Route Optimizer
-- ========================================

CREATE TABLE IF NOT EXISTS delivery_routes (
    id SERIAL PRIMARY KEY,
    route_id VARCHAR(50) UNIQUE NOT NULL,
    truck_id VARCHAR(50),
    driver_name VARCHAR(100),
    route_date DATE NOT NULL,
    departure_time TIME,
    estimated_arrival TIME,
    actual_arrival TIME,
    capacity_units INT,
    capacity_used INT,
    capacity_pct DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN capacity_units > 0
            THEN ROUND((capacity_used::DECIMAL / capacity_units) * 100, 2)
            ELSE 0
        END
    ) STORED,
    distance_mi DECIMAL(8,2),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    fuel_cost DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'PLANNED', -- PLANNED, IN_TRANSIT, COMPLETED, CANCELLED
    optimization_score DECIMAL(5,2), -- 0-100 score for route efficiency
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_routes_date ON delivery_routes(route_date DESC);
CREATE INDEX idx_routes_truck ON delivery_routes(truck_id);
CREATE INDEX idx_routes_status ON delivery_routes(status);

COMMENT ON TABLE delivery_routes IS 'MODULE 2 - Tile 8: Delivery route master data';

-- Route Stops (many-to-many: routes to stores)
CREATE TABLE IF NOT EXISTS route_stops (
    id SERIAL PRIMARY KEY,
    route_id VARCHAR(50) NOT NULL REFERENCES delivery_routes(route_id) ON DELETE CASCADE,
    location_id VARCHAR(50) NOT NULL REFERENCES locations(location_id),
    stop_sequence INT NOT NULL,
    planned_arrival TIME,
    actual_arrival TIME,
    delivery_qty INT,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(route_id, stop_sequence)
);

CREATE INDEX idx_route_stops_route ON route_stops(route_id);
CREATE INDEX idx_route_stops_location ON route_stops(location_id);

COMMENT ON TABLE route_stops IS 'Individual stops on each delivery route';

-- ========================================
-- TILE 9: Stockout Monitor
-- ========================================

CREATE TABLE IF NOT EXISTS stockout_risks (
    id SERIAL PRIMARY KEY,
    location_id VARCHAR(50) NOT NULL REFERENCES locations(location_id),
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    current_stock INT NOT NULL DEFAULT 0,
    forecast_daily INT NOT NULL,
    days_to_stockout DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN forecast_daily > 0
            THEN ROUND(current_stock::DECIMAL / forecast_daily, 2)
            ELSE 999
        END
    ) STORED,
    risk_level VARCHAR(20) GENERATED ALWAYS AS (
        CASE
            WHEN current_stock <= 0 THEN 'CRITICAL'
            WHEN forecast_daily > 0 AND current_stock::DECIMAL / forecast_daily <= 1 THEN 'CRITICAL'
            WHEN forecast_daily > 0 AND current_stock::DECIMAL / forecast_daily <= 3 THEN 'HIGH'
            WHEN forecast_daily > 0 AND current_stock::DECIMAL / forecast_daily <= 7 THEN 'MEDIUM'
            ELSE 'LOW'
        END
    ) STORED,
    recommended_action TEXT GENERATED ALWAYS AS (
        CASE
            WHEN current_stock <= 0 THEN 'Emergency shipment required'
            WHEN forecast_daily > 0 AND current_stock::DECIMAL / forecast_daily <= 1 THEN 'Emergency shipment'
            WHEN forecast_daily > 0 AND current_stock::DECIMAL / forecast_daily <= 3 THEN 'Priority replenishment'
            WHEN forecast_daily > 0 AND current_stock::DECIMAL / forecast_daily <= 7 THEN 'Standard replenishment'
            ELSE 'Monitor'
        END
    ) STORED,
    in_transit_qty INT DEFAULT 0,
    expected_delivery_date DATE,
    calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    alert_sent BOOLEAN DEFAULT FALSE,
    alert_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, sku_id, calculation_date)
);

CREATE INDEX idx_stockout_location ON stockout_risks(location_id);
CREATE INDEX idx_stockout_sku ON stockout_risks(sku_id);
CREATE INDEX idx_stockout_risk ON stockout_risks(risk_level);
CREATE INDEX idx_stockout_critical ON stockout_risks(risk_level) WHERE risk_level IN ('CRITICAL', 'HIGH');
CREATE INDEX idx_stockout_date ON stockout_risks(calculation_date DESC);

COMMENT ON TABLE stockout_risks IS 'MODULE 2 - Tile 9: Real-time stockout risk monitoring';
COMMENT ON COLUMN stockout_risks.days_to_stockout IS 'Auto-calculated days until stockout';

-- ========================================
-- TILE 10: Channel Allocation
-- ========================================

CREATE TABLE IF NOT EXISTS channel_allocations (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    dc_available INT NOT NULL DEFAULT 0,
    ch01_allocation INT DEFAULT 0,
    ch02_allocation INT DEFAULT 0,
    ch03_allocation INT DEFAULT 0,
    ch04_allocation INT DEFAULT 0,
    total_allocated INT GENERATED ALWAYS AS (
        ch01_allocation + ch02_allocation + ch03_allocation + ch04_allocation
    ) STORED,
    total_demand INT NOT NULL DEFAULT 0,
    allocation_pct DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN total_demand > 0
            THEN ROUND(((ch01_allocation + ch02_allocation + ch03_allocation + ch04_allocation)::DECIMAL / total_demand) * 100, 2)
            ELSE 0
        END
    ) STORED,
    unfulfilled_demand INT GENERATED ALWAYS AS (
        GREATEST(0, total_demand - (ch01_allocation + ch02_allocation + ch03_allocation + ch04_allocation))
    ) STORED,
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    allocation_logic VARCHAR(50) DEFAULT 'PRIORITY', -- PRIORITY, PROPORTIONAL, MANUAL
    locked BOOLEAN DEFAULT FALSE,
    locked_by VARCHAR(100),
    locked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, allocation_date)
);

CREATE INDEX idx_channel_alloc_sku ON channel_allocations(sku_id);
CREATE INDEX idx_channel_alloc_date ON channel_allocations(allocation_date DESC);
CREATE INDEX idx_channel_alloc_unfulfilled ON channel_allocations(unfulfilled_demand) WHERE unfulfilled_demand > 0;

COMMENT ON TABLE channel_allocations IS 'MODULE 2 - Tile 10: DC inventory allocation across channels';
COMMENT ON COLUMN channel_allocations.unfulfilled_demand IS 'Demand that cannot be fulfilled';

-- ========================================
-- Update Triggers
-- ========================================

CREATE TRIGGER update_store_replenishment_updated_at BEFORE UPDATE ON store_replenishment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_routes_updated_at BEFORE UPDATE ON delivery_routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stockout_risks_updated_at BEFORE UPDATE ON stockout_risks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channel_allocations_updated_at BEFORE UPDATE ON channel_allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
