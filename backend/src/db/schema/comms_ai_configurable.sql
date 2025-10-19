-- COMMS.AI Configurable Schema
-- Flexible, metadata-driven architecture for customer-configurable communication tracking

-- Communication Types Table (defines tabs/categories)
CREATE TABLE IF NOT EXISTS comms_ai.communication_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(50),
    tab_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Field Definitions Table (defines columns for each type)
CREATE TABLE IF NOT EXISTS comms_ai.field_definitions (
    id SERIAL PRIMARY KEY,
    communication_type_id INTEGER REFERENCES comms_ai.communication_types(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'datetime', 'email', 'dropdown', 'boolean', 'currency', 'url', 'textarea')),
    is_required BOOLEAN DEFAULT false,
    is_searchable BOOLEAN DEFAULT true,
    is_filterable BOOLEAN DEFAULT true,
    is_sortable BOOLEAN DEFAULT true,
    column_order INTEGER DEFAULT 0,
    column_width INTEGER DEFAULT 150,
    validation_rules JSONB,
    dropdown_options JSONB,
    default_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(communication_type_id, field_name)
);

-- Main Communications Table (stores all communication records with flexible data)
CREATE TABLE IF NOT EXISTS comms_ai.communications (
    id SERIAL PRIMARY KEY,
    communication_type_id INTEGER REFERENCES comms_ai.communication_types(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    status VARCHAR(50),
    priority VARCHAR(50),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow States Table (configurable statuses for each type)
CREATE TABLE IF NOT EXISTS comms_ai.workflow_states (
    id SERIAL PRIMARY KEY,
    communication_type_id INTEGER REFERENCES comms_ai.communication_types(id) ON DELETE CASCADE,
    state_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    state_color VARCHAR(50),
    state_order INTEGER DEFAULT 0,
    is_initial BOOLEAN DEFAULT false,
    is_final BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(communication_type_id, state_name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_communications_type ON comms_ai.communications(communication_type_id);
CREATE INDEX IF NOT EXISTS idx_communications_data ON comms_ai.communications USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_communications_status ON comms_ai.communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON comms_ai.communications(created_at);
CREATE INDEX IF NOT EXISTS idx_field_definitions_type ON comms_ai.field_definitions(communication_type_id);

-- Insert default communication types
INSERT INTO comms_ai.communication_types (name, display_name, description, icon, color, tab_order) VALUES
('vendor_communications', 'Vendor Communications', 'Track communications with suppliers and vendors', 'Business', '#FF9800', 1),
('customer_inquiries', 'Customer Inquiries', 'Monitor and respond to customer inquiries', 'Person', '#4CAF50', 2),
('order_validations', 'Order Validations', 'Validate order confirmations against ERP data', 'Receipt', '#9C27B0', 3),
('escalations', 'Escalations', 'Track issues requiring immediate attention', 'Notifications', '#F44336', 4),
('sales_orders', 'Sales Orders', 'Track and manage sales orders', 'ShoppingCart', '#2196F3', 5),
('inventory_alerts', 'Inventory Alerts', 'Monitor inventory levels and alerts', 'Inventory', '#00BCD4', 6),
('email_campaigns', 'Email Campaigns', 'Track email marketing campaigns', 'Email', '#673AB7', 7)
ON CONFLICT (name) DO NOTHING;

-- Insert field definitions for Vendor Communications
INSERT INTO comms_ai.field_definitions (communication_type_id, field_name, display_name, field_type, column_order, column_width, is_required) VALUES
((SELECT id FROM comms_ai.communication_types WHERE name = 'vendor_communications'), 'vendor_name', 'Vendor', 'text', 1, 200, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'vendor_communications'), 'subject', 'Subject', 'text', 2, 300, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'vendor_communications'), 'email_date', 'Date', 'date', 3, 120, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'vendor_communications'), 'priority', 'Priority', 'dropdown', 4, 120, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'vendor_communications'), 'status', 'Status', 'dropdown', 5, 120, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'vendor_communications'), 'sentiment', 'Sentiment', 'dropdown', 6, 100, false)
ON CONFLICT (communication_type_id, field_name) DO NOTHING;

-- Insert dropdown options for vendor communications
UPDATE comms_ai.field_definitions SET dropdown_options = '["normal", "high", "critical"]'::jsonb
WHERE field_name = 'priority' AND communication_type_id = (SELECT id FROM comms_ai.communication_types WHERE name = 'vendor_communications');

UPDATE comms_ai.field_definitions SET dropdown_options = '["pending", "resolved", "escalated"]'::jsonb
WHERE field_name = 'status' AND communication_type_id = (SELECT id FROM comms_ai.communication_types WHERE name = 'vendor_communications');

UPDATE comms_ai.field_definitions SET dropdown_options = '["positive", "neutral", "negative"]'::jsonb
WHERE field_name = 'sentiment' AND communication_type_id = (SELECT id FROM comms_ai.communication_types WHERE name = 'vendor_communications');

-- Insert field definitions for Customer Inquiries
INSERT INTO comms_ai.field_definitions (communication_type_id, field_name, display_name, field_type, column_order, column_width, is_required) VALUES
((SELECT id FROM comms_ai.communication_types WHERE name = 'customer_inquiries'), 'customer_name', 'Customer', 'text', 1, 200, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'customer_inquiries'), 'subject', 'Subject', 'text', 2, 300, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'customer_inquiries'), 'email_date', 'Date', 'date', 3, 120, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'customer_inquiries'), 'response_time', 'Response Time', 'text', 4, 130, false),
((SELECT id FROM comms_ai.communication_types WHERE name = 'customer_inquiries'), 'status', 'Status', 'dropdown', 5, 120, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'customer_inquiries'), 'sentiment', 'Sentiment', 'dropdown', 6, 100, false)
ON CONFLICT (communication_type_id, field_name) DO NOTHING;

UPDATE comms_ai.field_definitions SET dropdown_options = '["open", "closed", "urgent"]'::jsonb
WHERE field_name = 'status' AND communication_type_id = (SELECT id FROM comms_ai.communication_types WHERE name = 'customer_inquiries');

-- Insert field definitions for Order Validations
INSERT INTO comms_ai.field_definitions (communication_type_id, field_name, display_name, field_type, column_order, column_width, is_required) VALUES
((SELECT id FROM comms_ai.communication_types WHERE name = 'order_validations'), 'order_number', 'Order Number', 'text', 1, 150, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'order_validations'), 'customer_name', 'Customer', 'text', 2, 200, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'order_validations'), 'amount', 'Amount', 'currency', 3, 120, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'order_validations'), 'order_date', 'Date', 'date', 4, 120, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'order_validations'), 'status', 'Status', 'dropdown', 5, 120, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'order_validations'), 'match_status', 'Match Status', 'dropdown', 6, 150, true)
ON CONFLICT (communication_type_id, field_name) DO NOTHING;

UPDATE comms_ai.field_definitions SET dropdown_options = '["confirmed", "pending", "cancelled"]'::jsonb
WHERE field_name = 'status' AND communication_type_id = (SELECT id FROM comms_ai.communication_types WHERE name = 'order_validations');

UPDATE comms_ai.field_definitions SET dropdown_options = '["matched", "mismatch", "pending"]'::jsonb
WHERE field_name = 'match_status' AND communication_type_id = (SELECT id FROM comms_ai.communication_types WHERE name = 'order_validations');

-- Insert field definitions for Escalations
INSERT INTO comms_ai.field_definitions (communication_type_id, field_name, display_name, field_type, column_order, column_width, is_required) VALUES
((SELECT id FROM comms_ai.communication_types WHERE name = 'escalations'), 'escalation_type', 'Type', 'dropdown', 1, 180, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'escalations'), 'subject', 'Subject', 'text', 2, 300, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'escalations'), 'party_name', 'Party', 'text', 3, 200, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'escalations'), 'escalation_date', 'Date', 'date', 4, 120, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'escalations'), 'severity', 'Severity', 'dropdown', 5, 120, true),
((SELECT id FROM comms_ai.communication_types WHERE name = 'escalations'), 'status', 'Status', 'dropdown', 6, 120, true)
ON CONFLICT (communication_type_id, field_name) DO NOTHING;

UPDATE comms_ai.field_definitions SET dropdown_options = '["vendor_dispute", "customer_complaint", "payment_issue", "delivery_issue"]'::jsonb
WHERE field_name = 'escalation_type' AND communication_type_id = (SELECT id FROM comms_ai.communication_types WHERE name = 'escalations');

UPDATE comms_ai.field_definitions SET dropdown_options = '["low", "medium", "high", "critical"]'::jsonb
WHERE field_name = 'severity' AND communication_type_id = (SELECT id FROM comms_ai.communication_types WHERE name = 'escalations');

UPDATE comms_ai.field_definitions SET dropdown_options = '["open", "escalated", "resolved"]'::jsonb
WHERE field_name = 'status' AND communication_type_id = (SELECT id FROM comms_ai.communication_types WHERE name = 'escalations');

-- Migrate existing data to new flexible schema
INSERT INTO comms_ai.communications (communication_type_id, data, status, priority)
SELECT
    (SELECT id FROM comms_ai.communication_types WHERE name = 'vendor_communications'),
    jsonb_build_object(
        'vendor_name', vendor_name,
        'subject', subject,
        'email_date', email_date::text,
        'priority', priority,
        'status', status,
        'sentiment', sentiment
    ),
    status,
    priority
FROM comms_ai.vendor_communications
ON CONFLICT DO NOTHING;

INSERT INTO comms_ai.communications (communication_type_id, data, status)
SELECT
    (SELECT id FROM comms_ai.communication_types WHERE name = 'customer_inquiries'),
    jsonb_build_object(
        'customer_name', customer_name,
        'subject', subject,
        'email_date', email_date::text,
        'response_time', response_time,
        'status', status,
        'sentiment', sentiment
    ),
    status
FROM comms_ai.customer_inquiries
ON CONFLICT DO NOTHING;

INSERT INTO comms_ai.communications (communication_type_id, data, status)
SELECT
    (SELECT id FROM comms_ai.communication_types WHERE name = 'order_validations'),
    jsonb_build_object(
        'order_number', order_number,
        'customer_name', customer_name,
        'amount', amount::text,
        'order_date', order_date::text,
        'status', status,
        'match_status', match_status
    ),
    status
FROM comms_ai.order_validations
ON CONFLICT DO NOTHING;

INSERT INTO comms_ai.communications (communication_type_id, data, status)
SELECT
    (SELECT id FROM comms_ai.communication_types WHERE name = 'escalations'),
    jsonb_build_object(
        'escalation_type', escalation_type,
        'subject', subject,
        'party_name', party_name,
        'escalation_date', escalation_date::text,
        'severity', severity,
        'status', status
    ),
    status
FROM comms_ai.escalations
ON CONFLICT DO NOTHING;

-- Create triggers
CREATE TRIGGER update_communication_types_updated_at BEFORE UPDATE ON comms_ai.communication_types
FOR EACH ROW EXECUTE FUNCTION comms_ai.update_updated_at_column();

CREATE TRIGGER update_field_definitions_updated_at BEFORE UPDATE ON comms_ai.field_definitions
FOR EACH ROW EXECUTE FUNCTION comms_ai.update_updated_at_column();

CREATE TRIGGER update_communications_updated_at BEFORE UPDATE ON comms_ai.communications
FOR EACH ROW EXECUTE FUNCTION comms_ai.update_updated_at_column();
