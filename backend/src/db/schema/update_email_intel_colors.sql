-- Update EMAIL INTEL communication types to Blue/Grey theme
UPDATE comms_ai.communication_types SET color = '#0a6ed1' WHERE name = 'vendor_communications';
UPDATE comms_ai.communication_types SET color = '#0854a0' WHERE name = 'customer_inquiries';
UPDATE comms_ai.communication_types SET color = '#64748b' WHERE name = 'order_validations';
UPDATE comms_ai.communication_types SET color = '#354a5f' WHERE name = 'escalations';
UPDATE comms_ai.communication_types SET color = '#0ea5e9' WHERE name = 'sales_orders';
UPDATE comms_ai.communication_types SET color = '#1e3a5f' WHERE name = 'inventory_alerts';
UPDATE comms_ai.communication_types SET color = '#475569' WHERE name = 'email_campaigns';
