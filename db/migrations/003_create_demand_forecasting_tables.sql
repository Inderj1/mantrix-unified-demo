-- ========================================
-- STOX.AI Database Migration Script
-- Part 3: MODULE 1 - Demand Forecasting Tables
-- ========================================
-- Created: 2025-10-25
-- Purpose: Create tables for Multi-Channel Demand Forecasting (4 tiles)
-- ========================================

-- ========================================
-- TILE 3: Forecast Dashboard
-- ========================================

CREATE TABLE IF NOT EXISTS demand_forecasts (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    channel_id VARCHAR(20) NOT NULL REFERENCES channels(channel_id),
    forecast_date DATE NOT NULL,
    actual_qty INT,
    forecast_qty INT NOT NULL,
    accuracy_pct DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN actual_qty IS NOT NULL AND forecast_qty > 0
            THEN ROUND((1 - ABS(actual_qty - forecast_qty)::DECIMAL / GREATEST(actual_qty, forecast_qty)) * 100, 2)
            ELSE NULL
        END
    ) STORED,
    bias_qty INT GENERATED ALWAYS AS (
        CASE
            WHEN actual_qty IS NOT NULL THEN actual_qty - forecast_qty
            ELSE NULL
        END
    ) STORED,
    mape_pct DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN actual_qty IS NOT NULL AND actual_qty > 0
            THEN ROUND(ABS(actual_qty - forecast_qty)::DECIMAL / actual_qty * 100, 2)
            ELSE NULL
        END
    ) STORED,
    model_version VARCHAR(50),
    model_confidence DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, channel_id, forecast_date)
);

CREATE INDEX idx_forecast_date ON demand_forecasts(forecast_date DESC);
CREATE INDEX idx_forecast_sku ON demand_forecasts(sku_id);
CREATE INDEX idx_forecast_channel ON demand_forecasts(channel_id);
CREATE INDEX idx_forecast_accuracy ON demand_forecasts(accuracy_pct DESC);
CREATE INDEX idx_forecast_composite ON demand_forecasts(sku_id, channel_id, forecast_date);

COMMENT ON TABLE demand_forecasts IS 'MODULE 1 - Tile 3: AI-driven demand forecasts with accuracy metrics';

-- ========================================
-- TILE 4: Demand Analyzer (Aggregations)
-- ========================================

CREATE TABLE IF NOT EXISTS demand_aggregations (
    id SERIAL PRIMARY KEY,
    dimension_type VARCHAR(50) NOT NULL, -- PRODUCT, REGION, STORE, CHANNEL
    dimension_value VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    aggregation_date DATE NOT NULL,
    total_demand INT NOT NULL DEFAULT 0,
    trend_pct DECIMAL(5,2),
    trend_direction VARCHAR(10), -- UP, DOWN, FLAT
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dimension_type, dimension_value, sku_id, aggregation_date)
);

CREATE INDEX idx_demand_agg_type ON demand_aggregations(dimension_type);
CREATE INDEX idx_demand_agg_date ON demand_aggregations(aggregation_date DESC);
CREATE INDEX idx_demand_agg_region ON demand_aggregations(region);

COMMENT ON TABLE demand_aggregations IS 'MODULE 1 - Tile 4: Demand aggregated by various dimensions';

-- ========================================
-- TILE 5: Forecast Workbench (Overrides)
-- ========================================

CREATE TABLE IF NOT EXISTS forecast_overrides (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    week_id VARCHAR(10) NOT NULL, -- Format: 2024-W06
    week_start_date DATE,
    ai_forecast INT NOT NULL,
    override_forecast INT,
    has_promo BOOLEAN DEFAULT FALSE,
    promo_type VARCHAR(50),
    promo_impact_pct DECIMAL(5,2),
    final_forecast INT GENERATED ALWAYS AS (COALESCE(override_forecast, ai_forecast)) STORED,
    status VARCHAR(20) DEFAULT 'PENDING', -- APPROVED, OVERRIDDEN, PENDING, REJECTED
    override_reason TEXT,
    overridden_by VARCHAR(100),
    overridden_at TIMESTAMP,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, week_id)
);

CREATE INDEX idx_override_sku ON forecast_overrides(sku_id);
CREATE INDEX idx_override_week ON forecast_overrides(week_id);
CREATE INDEX idx_override_status ON forecast_overrides(status);
CREATE INDEX idx_override_promo ON forecast_overrides(has_promo) WHERE has_promo = TRUE;

COMMENT ON TABLE forecast_overrides IS 'MODULE 1 - Tile 5: Manual forecast overrides and adjustments';
COMMENT ON COLUMN forecast_overrides.final_forecast IS 'Auto-calculated: override if exists, otherwise AI forecast';

-- ========================================
-- TILE 6: Demand Alerts
-- ========================================

CREATE TABLE IF NOT EXISTS demand_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL, -- STOCKOUT_RISK, DEMAND_SPIKE, FORECAST_ERROR, PROMO_IMPACT
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    location_id VARCHAR(50) REFERENCES locations(location_id),
    severity VARCHAR(20) NOT NULL, -- HIGH, MEDIUM, LOW, CRITICAL
    alert_date DATE NOT NULL,
    alert_value DECIMAL(10,2),
    threshold_value DECIMAL(10,2),
    message TEXT NOT NULL,
    recommendation TEXT,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_type ON demand_alerts(alert_type);
CREATE INDEX idx_alerts_severity ON demand_alerts(severity);
CREATE INDEX idx_alerts_date ON demand_alerts(alert_date DESC);
CREATE INDEX idx_alerts_sku ON demand_alerts(sku_id);
CREATE INDEX idx_alerts_unresolved ON demand_alerts(resolved) WHERE resolved = FALSE;
CREATE INDEX idx_alerts_unacknowledged ON demand_alerts(acknowledged) WHERE acknowledged = FALSE;

COMMENT ON TABLE demand_alerts IS 'MODULE 1 - Tile 6: Automated demand alerts and exceptions';

-- ========================================
-- Supporting Table: Forecast Models
-- ========================================

CREATE TABLE IF NOT EXISTS forecast_models (
    model_id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) UNIQUE NOT NULL,
    model_type VARCHAR(50), -- ARIMA, PROPHET, LSTM, ENSEMBLE
    model_version VARCHAR(20),
    accuracy_pct DECIMAL(5,2),
    mape_pct DECIMAL(5,2),
    training_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    hyperparameters JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE forecast_models IS 'ML model metadata for forecasting engine';

-- ========================================
-- Update Triggers
-- ========================================

CREATE TRIGGER update_demand_forecasts_updated_at BEFORE UPDATE ON demand_forecasts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forecast_overrides_updated_at BEFORE UPDATE ON forecast_overrides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demand_alerts_updated_at BEFORE UPDATE ON demand_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forecast_models_updated_at BEFORE UPDATE ON forecast_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Helper Functions
-- ========================================

-- Function to calculate week_start_date from week_id
CREATE OR REPLACE FUNCTION get_week_start_date(week_id VARCHAR)
RETURNS DATE AS $$
DECLARE
    year INT;
    week_num INT;
BEGIN
    year := SUBSTRING(week_id FROM 1 FOR 4)::INT;
    week_num := SUBSTRING(week_id FROM 7)::INT;
    RETURN DATE_TRUNC('week', TO_DATE(year || '-01-01', 'YYYY-MM-DD')) + ((week_num - 1) * 7 * INTERVAL '1 day');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-populate week_start_date on insert/update
CREATE OR REPLACE FUNCTION set_week_start_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.week_id IS NOT NULL THEN
        NEW.week_start_date := get_week_start_date(NEW.week_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_forecast_override_week_start BEFORE INSERT OR UPDATE ON forecast_overrides
    FOR EACH ROW EXECUTE FUNCTION set_week_start_date();
