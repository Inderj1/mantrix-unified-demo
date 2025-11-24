-- Command Tower Ticketing and Audit System Schema
-- Tracks all operations across MARGEN.AI, REVEQ.AI, and Enterprise Pulse

-- Drop existing table if it exists
DROP TABLE IF EXISTS command_tower_tickets CASCADE;

-- Create tickets table
CREATE TABLE command_tower_tickets (
    ticket_id SERIAL PRIMARY KEY,
    ticket_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Open',
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    source_module VARCHAR(50) NOT NULL,
    source_tile VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id VARCHAR(100),
    user_name VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT chk_ticket_type CHECK (ticket_type IN (
        'STO_CREATION', 'FORECAST_OVERRIDE', 'FINANCIAL_APPROVAL', 'SUPPLIER_ORDER',
        'MARGEN_ANALYSIS', 'MARGEN_REPORT', 'REVEQ_MAINTENANCE', 'REVEQ_UTILIZATION',
        'PULSE_AGENT_EXEC', 'PULSE_ALERT', 'PULSE_CONFIG'
    )),
    CONSTRAINT chk_status CHECK (status IN (
        'Open', 'In Progress', 'Completed', 'Failed', 'Cancelled'
    )),
    CONSTRAINT chk_priority CHECK (priority IN (
        'Low', 'Medium', 'High', 'Critical'
    ))
);

-- Create indexes for better query performance
CREATE INDEX idx_tickets_ticket_type ON command_tower_tickets(ticket_type);
CREATE INDEX idx_tickets_status ON command_tower_tickets(status);
CREATE INDEX idx_tickets_priority ON command_tower_tickets(priority);
CREATE INDEX idx_tickets_source_module ON command_tower_tickets(source_module);
CREATE INDEX idx_tickets_created_at ON command_tower_tickets(created_at DESC);
CREATE INDEX idx_tickets_user_id ON command_tower_tickets(user_id);
CREATE INDEX idx_tickets_metadata ON command_tower_tickets USING GIN(metadata);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    IF NEW.status IN ('Completed', 'Failed', 'Cancelled') AND OLD.status NOT IN ('Completed', 'Failed', 'Cancelled') THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_ticket_timestamp
BEFORE UPDATE ON command_tower_tickets
FOR EACH ROW
EXECUTE FUNCTION update_ticket_timestamp();

-- Insert sample data for MARGEN.AI operations
INSERT INTO command_tower_tickets (ticket_type, status, priority, source_module, source_tile, title, description, user_id, user_name, metadata) VALUES
('MARGEN_ANALYSIS', 'Completed', 'High', 'MARGEN.AI', 'Revenue & Growth Analytics', 'Revenue Analysis - Q4 2024', 'Comprehensive revenue analysis across all systems', 'user_001', 'John Smith', '{"analysis_type": "quarterly", "systems_analyzed": 5, "revenue_total": 2456789.50, "gm_percent": 34.2}'::jsonb),
('MARGEN_ANALYSIS', 'In Progress', 'Medium', 'MARGEN.AI', 'Customer Segmentation', 'Customer Segmentation - High Value', 'Identifying top 20% revenue-generating customers', 'user_002', 'Sarah Johnson', '{"segment_criteria": "revenue_contribution", "threshold": 80, "customers_identified": 156}'::jsonb),
('MARGEN_REPORT', 'Completed', 'Medium', 'MARGEN.AI', 'Financial Dashboard', 'Monthly Financial Report - November', 'Generated monthly P&L and margin analysis', 'user_001', 'John Smith', '{"report_type": "monthly", "period": "2024-11", "total_pages": 15, "charts_included": 8}'::jsonb),
('MARGEN_ANALYSIS', 'Open', 'High', 'MARGEN.AI', 'Margin Analytics', 'Margin Erosion Analysis', 'Investigate declining margins in cardiovascular segment', 'user_003', 'Mike Chen', '{"segment": "cardiovascular", "margin_decline": 3.5, "time_period": "last_quarter"}'::jsonb),
('MARGEN_REPORT', 'Completed', 'Low', 'MARGEN.AI', 'System Performance', 'System Comparison Report', 'Comparative analysis of all revenue systems', 'user_002', 'Sarah Johnson', '{"systems_compared": 5, "metrics": ["revenue", "gm", "volume"], "format": "PDF"}'::jsonb);

-- Insert sample data for REVEQ.AI operations
INSERT INTO command_tower_tickets (ticket_type, status, priority, source_module, source_tile, title, description, user_id, user_name, metadata) VALUES
('REVEQ_MAINTENANCE', 'In Progress', 'Critical', 'REVEQ.AI', 'Fleet Management', 'Scheduled Maintenance - Unit REV-045', 'Quarterly maintenance for surgical equipment unit', 'user_004', 'Lisa Anderson', '{"equipment_id": "REV-045", "maintenance_type": "quarterly", "estimated_hours": 4, "parts_required": ["filter", "sensor"]}'::jsonb),
('REVEQ_UTILIZATION', 'Completed', 'Medium', 'REVEQ.AI', 'Asset Utilization', 'Utilization Report - November', 'Monthly utilization analysis for all equipment', 'user_005', 'David Park', '{"total_assets": 128, "avg_utilization": 76.5, "underutilized_count": 12, "high_performers": 45}'::jsonb),
('REVEQ_MAINTENANCE', 'Completed', 'High', 'REVEQ.AI', 'Equipment Analytics', 'Preventive Maintenance - Unit REV-023', 'Completed preventive maintenance on imaging equipment', 'user_004', 'Lisa Anderson', '{"equipment_id": "REV-023", "maintenance_type": "preventive", "issues_found": 2, "repairs_completed": 2, "downtime_hours": 3}'::jsonb),
('REVEQ_UTILIZATION', 'Open', 'Medium', 'REVEQ.AI', 'Performance Monitoring', 'Low Utilization Alert - 5 Units', 'Multiple units showing below 50% utilization', 'user_005', 'David Park', '{"alert_threshold": 50, "affected_units": ["REV-012", "REV-034", "REV-056", "REV-078", "REV-089"], "avg_utilization": 42.3}'::jsonb),
('REVEQ_MAINTENANCE', 'Open', 'Critical', 'REVEQ.AI', 'Fleet Management', 'Emergency Repair - Unit REV-067', 'Critical failure reported on surgical unit', 'user_004', 'Lisa Anderson', '{"equipment_id": "REV-067", "failure_type": "hydraulic_system", "impact": "unit_offline", "priority_reason": "scheduled_surgery_today"}'::jsonb);

-- Insert sample data for Enterprise Pulse operations
INSERT INTO command_tower_tickets (ticket_type, status, priority, source_module, source_tile, title, description, user_id, user_name, metadata) VALUES
('PULSE_AGENT_EXEC', 'Completed', 'Medium', 'Enterprise Pulse', 'Revenue Monitor', 'Revenue Threshold Check - Agent 001', 'Daily revenue monitoring agent executed successfully', 'system', 'Pulse System', '{"agent_id": "agent_001", "check_type": "threshold", "threshold_value": 100000, "actual_value": 145678, "status": "normal"}'::jsonb),
('PULSE_ALERT', 'Open', 'High', 'Enterprise Pulse', 'Inventory Monitor', 'Low Stock Alert - Agent 003', 'Critical inventory levels detected in 3 locations', 'system', 'Pulse System', '{"agent_id": "agent_003", "alert_type": "low_stock", "locations": ["LA", "NYC", "CHI"], "items_affected": 12, "notification_sent": true}'::jsonb),
('PULSE_CONFIG', 'Completed', 'Low', 'Enterprise Pulse', 'Agent Configuration', 'Updated Alert Settings - Agent 002', 'Modified notification channels for margin monitoring', 'user_006', 'Admin User', '{"agent_id": "agent_002", "changes": ["email_enabled", "frequency_changed"], "old_frequency": "daily", "new_frequency": "hourly"}'::jsonb),
('PULSE_AGENT_EXEC', 'In Progress', 'Medium', 'Enterprise Pulse', 'Margin Monitor', 'Margin Analysis - Agent 005', 'Weekly margin analysis in progress', 'system', 'Pulse System', '{"agent_id": "agent_005", "analysis_scope": "weekly", "systems_checked": 3, "progress_percent": 65}'::jsonb),
('PULSE_ALERT', 'Completed', 'Critical', 'Enterprise Pulse', 'System Health', 'Database Performance Alert - Agent 007', 'Slow query performance detected and resolved', 'system', 'Pulse System', '{"agent_id": "agent_007", "alert_type": "performance", "metric": "query_time", "threshold_ms": 1000, "actual_ms": 2500, "resolution": "index_added"}'::jsonb),
('PULSE_CONFIG', 'Open', 'Medium', 'Enterprise Pulse', 'Agent Configuration', 'New Agent Setup - Agent 010', 'Configuring new customer churn prediction agent', 'user_006', 'Admin User', '{"agent_id": "agent_010", "agent_type": "churn_prediction", "data_sources": ["CRM", "transactions"], "setup_stage": "notification_config"}'::jsonb);

-- Insert additional STOX.AI sample data (existing functionality)
INSERT INTO command_tower_tickets (ticket_type, status, priority, source_module, source_tile, title, description, user_id, user_name, metadata) VALUES
('STO_CREATION', 'Completed', 'High', 'STOX.AI', 'Inventory Management', 'STO for Cardiovascular Supplies', 'Created stock transfer order for high-priority items', 'user_007', 'Operations Manager', '{"sto_number": "STO-2024-1145", "items_count": 45, "total_value": 125000, "from_location": "Central", "to_location": "West"}'::jsonb),
('FORECAST_OVERRIDE', 'Open', 'Medium', 'STOX.AI', 'Demand Forecasting', 'Manual Override - Surgical Kits', 'Override AI forecast due to known upcoming event', 'user_008', 'Demand Planner', '{"item_code": "SURG-KIT-001", "ai_forecast": 500, "manual_override": 750, "reason": "planned_hospital_expansion"}'::jsonb),
('FINANCIAL_APPROVAL', 'In Progress', 'High', 'STOX.AI', 'Purchase Orders', 'PO Approval - Q1 Inventory', 'Large purchase order pending financial approval', 'user_009', 'Finance Director', '{"po_number": "PO-2024-0892", "total_amount": 450000, "approval_stage": "finance_review", "items_count": 125}'::jsonb),
('SUPPLIER_ORDER', 'Completed', 'Medium', 'STOX.AI', 'Supplier Management', 'Reorder - Supplier MedTech Inc', 'Automatic reorder placed with primary supplier', 'system', 'STOX System', '{"supplier_id": "SUP-001", "order_number": "ORD-2024-3421", "items": 28, "total_value": 85000, "expected_delivery": "2024-12-15"}'::jsonb);

-- Create view for recent activity
CREATE OR REPLACE VIEW v_recent_tickets AS
SELECT
    ticket_id,
    ticket_type,
    status,
    priority,
    source_module,
    source_tile,
    title,
    description,
    user_name,
    created_at,
    updated_at,
    completed_at,
    metadata
FROM command_tower_tickets
ORDER BY created_at DESC
LIMIT 100;

-- Create view for open tickets by priority
CREATE OR REPLACE VIEW v_open_tickets_by_priority AS
SELECT
    priority,
    source_module,
    COUNT(*) as ticket_count,
    array_agg(ticket_type) as ticket_types
FROM command_tower_tickets
WHERE status IN ('Open', 'In Progress')
GROUP BY priority, source_module
ORDER BY
    CASE priority
        WHEN 'Critical' THEN 1
        WHEN 'High' THEN 2
        WHEN 'Medium' THEN 3
        WHEN 'Low' THEN 4
    END,
    source_module;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON command_tower_tickets TO PUBLIC;
GRANT USAGE, SELECT ON SEQUENCE command_tower_tickets_ticket_id_seq TO PUBLIC;
GRANT SELECT ON v_recent_tickets TO PUBLIC;
GRANT SELECT ON v_open_tickets_by_priority TO PUBLIC;
