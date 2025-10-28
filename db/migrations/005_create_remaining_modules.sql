-- ========================================
-- STOX.AI Database Migration Script
-- Part 5: Remaining Modules (3, 4, 5, 6, 7)
-- ========================================
-- Created: 2025-10-25
-- Purpose: Create tables for DC Inventory, Supply Planning, BOM, Procurement, Analytics
-- ========================================

-- ========================================
-- MODULE 3: DC INVENTORY COCKPIT (3 tiles)
-- ========================================

-- TILE 11: DC Cockpit
CREATE TABLE IF NOT EXISTS dc_inventory (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    on_hand_qty INT NOT NULL DEFAULT 0,
    in_transit_qty INT NOT NULL DEFAULT 0,
    allocated_ch01 INT DEFAULT 0,
    allocated_ch02 INT DEFAULT 0,
    allocated_ch03 INT DEFAULT 0,
    allocated_ch04 INT DEFAULT 0,
    safety_stock_qty INT DEFAULT 0,
    available_atp INT GENERATED ALWAYS AS (
        GREATEST(0, on_hand_qty - (allocated_ch01 + allocated_ch02 + allocated_ch03 + allocated_ch04))
    ) STORED,
    total_allocated INT GENERATED ALWAYS AS (
        allocated_ch01 + allocated_ch02 + allocated_ch03 + allocated_ch04
    ) STORED,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, snapshot_date)
);

CREATE INDEX idx_dc_inv_sku ON dc_inventory(sku_id);
CREATE INDEX idx_dc_inv_date ON dc_inventory(snapshot_date DESC);
CREATE INDEX idx_dc_inv_atp ON dc_inventory(available_atp);

-- TILE 12: Working Capital
CREATE TABLE IF NOT EXISTS working_capital_metrics (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    inventory_units INT NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    inventory_value DECIMAL(12,2) GENERATED ALWAYS AS (inventory_units * unit_cost) STORED,
    inventory_turns DECIMAL(5,2),
    days_inventory_outstanding INT,
    status VARCHAR(20) DEFAULT 'NORMAL', -- OPTIMAL, EXCESS, STOCKOUT, NORMAL
    target_turns DECIMAL(5,2) DEFAULT 10.0,
    target_dio INT DEFAULT 36,
    calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, calculation_date)
);

CREATE INDEX idx_wc_metrics_sku ON working_capital_metrics(sku_id);
CREATE INDEX idx_wc_metrics_date ON working_capital_metrics(calculation_date DESC);
CREATE INDEX idx_wc_metrics_status ON working_capital_metrics(status);

-- TILE 13: Excess & Obsolete
CREATE TABLE IF NOT EXISTS excess_obsolete_inventory (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    inventory_qty INT NOT NULL,
    last_sale_date DATE,
    days_no_sale INT GENERATED ALWAYS AS (
        CASE
            WHEN last_sale_date IS NOT NULL
            THEN DATE_PART('day', CURRENT_DATE - last_sale_date)::INT
            ELSE NULL
        END
    ) STORED,
    category VARCHAR(50) GENERATED ALWAYS AS (
        CASE
            WHEN inventory_qty = 0 THEN 'END_OF_LIFE'
            WHEN last_sale_date IS NOT NULL AND DATE_PART('day', CURRENT_DATE - last_sale_date) > 180 THEN 'OBSOLETE'
            WHEN last_sale_date IS NOT NULL AND DATE_PART('day', CURRENT_DATE - last_sale_date) > 90 THEN 'SLOW_MOVING'
            ELSE 'ACTIVE'
        END
    ) STORED,
    recommended_action TEXT,
    inventory_value DECIMAL(12,2),
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, snapshot_date)
);

CREATE INDEX idx_excess_sku ON excess_obsolete_inventory(sku_id);
CREATE INDEX idx_excess_category ON excess_obsolete_inventory(category);
CREATE INDEX idx_excess_date ON excess_obsolete_inventory(snapshot_date DESC);

-- ========================================
-- MODULE 4: SUPPLY PLANNING (3 tiles)
-- ========================================

-- TILE 14: Supply Dashboard
CREATE TABLE IF NOT EXISTS supply_requirements (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    weekly_demand INT NOT NULL DEFAULT 0,
    safety_stock INT NOT NULL DEFAULT 0,
    dc_on_hand INT NOT NULL DEFAULT 0,
    dc_on_order INT DEFAULT 0,
    plant_supply_req INT GENERATED ALWAYS AS (
        GREATEST(0, weekly_demand + safety_stock - dc_on_hand - dc_on_order)
    ) STORED,
    week_id VARCHAR(10) NOT NULL,
    week_start_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, week_id)
);

CREATE INDEX idx_supply_req_sku ON supply_requirements(sku_id);
CREATE INDEX idx_supply_req_week ON supply_requirements(week_id);

-- TILE 15: Production Optimizer
CREATE TABLE IF NOT EXISTS production_campaigns (
    id SERIAL PRIMARY KEY,
    product_family VARCHAR(100) NOT NULL,
    campaign_id VARCHAR(50) UNIQUE,
    campaign_size INT NOT NULL,
    changeover_time_hrs DECIMAL(4,2),
    capacity_utilization_pct DECIMAL(5,2),
    production_days INT,
    efficiency_pct DECIMAL(5,2),
    campaign_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PLANNED', -- PLANNED, RUNNING, COMPLETED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prod_campaign_family ON production_campaigns(product_family);
CREATE INDEX idx_prod_campaign_date ON production_campaigns(campaign_date DESC);

-- TILE 16: MRP Accelerator
CREATE TABLE IF NOT EXISTS mrp_planned_orders (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    planned_order_id VARCHAR(50) UNIQUE NOT NULL,
    quantity INT NOT NULL,
    mrp_date DATE NOT NULL,
    lead_time_days INT DEFAULT 30,
    required_date DATE GENERATED ALWAYS AS (mrp_date + (lead_time_days || ' days')::INTERVAL) STORED,
    status VARCHAR(20) DEFAULT 'PENDING', -- AUTO_APPROVED, PENDING_REVIEW, EXPEDITED, COMPLETED
    approval_score DECIMAL(5,2), -- AI confidence score for auto-approval
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mrp_sku ON mrp_planned_orders(sku_id);
CREATE INDEX idx_mrp_date ON mrp_planned_orders(mrp_date);
CREATE INDEX idx_mrp_status ON mrp_planned_orders(status);

-- ========================================
-- MODULE 5: BOM EXPLOSION (3 tiles)
-- ========================================

-- TILE 17: BOM Analyzer (computed view)
CREATE TABLE IF NOT EXISTS bom_explosions (
    id SERIAL PRIMARY KEY,
    fg_sku VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    plant_requirement INT NOT NULL,
    component_sku VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    qty_per_fg DECIMAL(10,4) NOT NULL,
    component_requirement INT GENERATED ALWAYS AS (
        CEIL(plant_requirement * qty_per_fg)
    ) STORED,
    supplier_id VARCHAR(50) REFERENCES suppliers(supplier_id),
    calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fg_sku, component_sku, calculation_date)
);

CREATE INDEX idx_bom_exp_fg ON bom_explosions(fg_sku);
CREATE INDEX idx_bom_exp_comp ON bom_explosions(component_sku);
CREATE INDEX idx_bom_exp_date ON bom_explosions(calculation_date DESC);

-- TILE 18: Component Tracker
CREATE TABLE IF NOT EXISTS component_usage (
    id SERIAL PRIMARY KEY,
    component_sku VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    used_in_fg_list TEXT, -- Comma-separated list of FG SKUs
    total_fg_count INT DEFAULT 0,
    total_demand INT DEFAULT 0,
    on_hand_qty INT DEFAULT 0,
    shortage_qty INT GENERATED ALWAYS AS (GREATEST(0, total_demand - on_hand_qty)) STORED,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(component_sku, snapshot_date)
);

CREATE INDEX idx_comp_usage_comp ON component_usage(component_sku);
CREATE INDEX idx_comp_usage_shortage ON component_usage(shortage_qty) WHERE shortage_qty > 0;

-- TILE 19: BOM Exceptions
CREATE TABLE IF NOT EXISTS bom_exceptions (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    exception_type VARCHAR(50) NOT NULL, -- MISSING_COMPONENT, COMPONENT_SHORTAGE, PHANTOM_BOM, INVALID_QTY
    component_sku VARCHAR(50),
    severity VARCHAR(20) NOT NULL, -- HIGH, MEDIUM, LOW
    action_required TEXT NOT NULL,
    impact_description TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bom_exc_sku ON bom_exceptions(sku_id);
CREATE INDEX idx_bom_exc_type ON bom_exceptions(exception_type);
CREATE INDEX idx_bom_exc_severity ON bom_exceptions(severity);
CREATE INDEX idx_bom_exc_unresolved ON bom_exceptions(resolved) WHERE resolved = FALSE;

-- ========================================
-- MODULE 6: PROCUREMENT (3 tiles)
-- ========================================

-- TILE 20: Consolidation Engine
CREATE TABLE IF NOT EXISTS component_consolidation (
    id SERIAL PRIMARY KEY,
    component_sku VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    used_in_fg_list TEXT,
    total_requirement INT NOT NULL DEFAULT 0,
    current_inventory INT DEFAULT 0,
    purchase_qty INT GENERATED ALWAYS AS (GREATEST(0, total_requirement - current_inventory)) STORED,
    supplier_id VARCHAR(50) REFERENCES suppliers(supplier_id),
    estimated_savings DECIMAL(10,2),
    consolidation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(component_sku, consolidation_date)
);

CREATE INDEX idx_consol_comp ON component_consolidation(component_sku);
CREATE INDEX idx_consol_date ON component_consolidation(consolidation_date DESC);
CREATE INDEX idx_consol_supplier ON component_consolidation(supplier_id);

-- TILE 21: Procurement Dashboard
CREATE TABLE IF NOT EXISTS consolidated_pos (
    id SERIAL PRIMARY KEY,
    consolidated_po_id VARCHAR(50) UNIQUE NOT NULL,
    component_sku VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    quantity INT NOT NULL,
    supplier_id VARCHAR(50) NOT NULL REFERENCES suppliers(supplier_id),
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    discount_pct DECIMAL(5,2) DEFAULT 0,
    savings_amount DECIMAL(10,2) GENERATED ALWAYS AS (
        ROUND(quantity * unit_cost * (discount_pct / 100), 2)
    ) STORED,
    po_date DATE NOT NULL,
    delivery_date DATE,
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, APPROVED, RECEIVED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consol_po_comp ON consolidated_pos(component_sku);
CREATE INDEX idx_consol_po_supplier ON consolidated_pos(supplier_id);
CREATE INDEX idx_consol_po_date ON consolidated_pos(po_date DESC);

-- TILE 22: Supplier Portal (uses suppliers table + new perf tracking)
CREATE TABLE IF NOT EXISTS supplier_performance_history (
    id SERIAL PRIMARY KEY,
    supplier_id VARCHAR(50) NOT NULL REFERENCES suppliers(supplier_id),
    po_id VARCHAR(50),
    delivery_performance_pct DECIMAL(5,2),
    quality_score_pct DECIMAL(5,2),
    on_time_delivery BOOLEAN,
    defect_count INT DEFAULT 0,
    measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_supplier_perf_supplier ON supplier_performance_history(supplier_id);
CREATE INDEX idx_supplier_perf_date ON supplier_performance_history(measurement_date DESC);

-- ========================================
-- MODULE 7: ANALYTICS (4 tiles)
-- ========================================

-- TILE 23: Scenario Planner
CREATE TABLE IF NOT EXISTS what_if_scenarios (
    id SERIAL PRIMARY KEY,
    scenario_id VARCHAR(50) UNIQUE NOT NULL,
    scenario_name VARCHAR(100) NOT NULL,
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    base_demand INT NOT NULL,
    promo_impact_pct DECIMAL(5,2) DEFAULT 0,
    holiday_impact_pct DECIMAL(5,2) DEFAULT 0,
    supply_constraint_pct DECIMAL(5,2) DEFAULT 0,
    forecasted_demand INT GENERATED ALWAYS AS (
        ROUND(base_demand * (1 + promo_impact_pct/100) * (1 + holiday_impact_pct/100))
    ) STORED,
    inventory_requirement INT,
    safety_buffer_pct DECIMAL(5,2) DEFAULT 20,
    created_by VARCHAR(100),
    is_baseline BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scenario_sku ON what_if_scenarios(sku_id);
CREATE INDEX idx_scenario_created ON what_if_scenarios(created_by);

-- TILE 24: KPI Dashboard
CREATE TABLE IF NOT EXISTS kpi_metrics (
    id SERIAL PRIMARY KEY,
    kpi_name VARCHAR(100) NOT NULL,
    kpi_category VARCHAR(50), -- FORECAST, INVENTORY, FINANCIAL, OPERATIONAL
    kpi_value DECIMAL(10,2) NOT NULL,
    target_value DECIMAL(10,2),
    unit VARCHAR(20), -- %, x, $, days, etc.
    trend VARCHAR(50),
    status VARCHAR(20) GENERATED ALWAYS AS (
        CASE
            WHEN target_value IS NULL THEN 'NO_TARGET'
            WHEN kpi_value >= target_value THEN 'EXCEEDS'
            WHEN kpi_value >= target_value * 0.95 THEN 'MEETS'
            ELSE 'BELOW'
        END
    ) STORED,
    calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kpi_name, calculation_date)
);

CREATE INDEX idx_kpi_name ON kpi_metrics(kpi_name);
CREATE INDEX idx_kpi_date ON kpi_metrics(calculation_date DESC);
CREATE INDEX idx_kpi_category ON kpi_metrics(kpi_category);

-- TILE 25: Predictive Analytics
CREATE TABLE IF NOT EXISTS anomaly_detection (
    id SERIAL PRIMARY KEY,
    anomaly_date DATE NOT NULL,
    anomaly_type VARCHAR(50) NOT NULL, -- DEMAND_SPIKE, STOCKOUT, SLOW_SALES, FORECAST_ERROR
    sku_id VARCHAR(50) REFERENCES sku_master(sku_id),
    location_id VARCHAR(50) REFERENCES locations(location_id),
    expected_value INT,
    actual_value INT,
    variance_pct DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN expected_value > 0
            THEN ROUND(((actual_value - expected_value)::DECIMAL / expected_value) * 100, 2)
            ELSE NULL
        END
    ) STORED,
    reason TEXT,
    confidence_score DECIMAL(5,2), -- ML model confidence
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_anomaly_date ON anomaly_detection(anomaly_date DESC);
CREATE INDEX idx_anomaly_type ON anomaly_detection(anomaly_type);
CREATE INDEX idx_anomaly_sku ON anomaly_detection(sku_id);

-- TILE 26: Working Capital Optimizer
CREATE TABLE IF NOT EXISTS working_capital_optimization (
    id SERIAL PRIMARY KEY,
    sku_id VARCHAR(50) NOT NULL REFERENCES sku_master(sku_id),
    inventory_value DECIMAL(12,2) NOT NULL,
    target_turns DECIMAL(5,2) DEFAULT 10.0,
    current_turns DECIMAL(5,2) NOT NULL,
    days_inventory_outstanding INT NOT NULL,
    target_dio INT DEFAULT 36,
    cash_impact DECIMAL(12,2) GENERATED ALWAYS AS (
        CASE
            WHEN current_turns > target_turns
            THEN ROUND(inventory_value * (1 - target_turns / current_turns), 2)
            WHEN current_turns < target_turns
            THEN -ROUND(inventory_value * (target_turns / current_turns - 1), 2)
            ELSE 0
        END
    ) STORED,
    status VARCHAR(20) DEFAULT 'REVIEW', -- OPTIMAL, REVIEW, ACTION_REQUIRED
    calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, calculation_date)
);

CREATE INDEX idx_wc_opt_sku ON working_capital_optimization(sku_id);
CREATE INDEX idx_wc_opt_date ON working_capital_optimization(calculation_date DESC);
CREATE INDEX idx_wc_opt_status ON working_capital_optimization(status);

-- ========================================
-- Create all update triggers
-- ========================================

CREATE TRIGGER update_dc_inventory_updated_at BEFORE UPDATE ON dc_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_working_capital_metrics_updated_at BEFORE UPDATE ON working_capital_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_excess_obsolete_inventory_updated_at BEFORE UPDATE ON excess_obsolete_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supply_requirements_updated_at BEFORE UPDATE ON supply_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_campaigns_updated_at BEFORE UPDATE ON production_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mrp_planned_orders_updated_at BEFORE UPDATE ON mrp_planned_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_usage_updated_at BEFORE UPDATE ON component_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bom_exceptions_updated_at BEFORE UPDATE ON bom_exceptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_consolidation_updated_at BEFORE UPDATE ON component_consolidation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consolidated_pos_updated_at BEFORE UPDATE ON consolidated_pos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_what_if_scenarios_updated_at BEFORE UPDATE ON what_if_scenarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
