-- COMMS.AI Database Schema
-- Tables for Email & Communication Intelligence Platform

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS comms_ai;

-- Vendor Communications Table
CREATE TABLE IF NOT EXISTS comms_ai.vendor_communications (
    id SERIAL PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    email_body TEXT,
    email_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'resolved', 'escalated')),
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('normal', 'high', 'critical')),
    sentiment VARCHAR(50) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer Inquiries Table
CREATE TABLE IF NOT EXISTS comms_ai.customer_inquiries (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    email_body TEXT,
    email_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('open', 'closed', 'urgent')),
    response_time VARCHAR(50),
    sentiment VARCHAR(50) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Validations Table
CREATE TABLE IF NOT EXISTS comms_ai.order_validations (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(100) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('confirmed', 'pending', 'cancelled')),
    amount DECIMAL(15, 2) NOT NULL,
    order_date DATE NOT NULL,
    match_status VARCHAR(50) NOT NULL CHECK (match_status IN ('matched', 'mismatch', 'pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Escalations Table
CREATE TABLE IF NOT EXISTS comms_ai.escalations (
    id SERIAL PRIMARY KEY,
    escalation_type VARCHAR(100) NOT NULL CHECK (escalation_type IN ('vendor_dispute', 'customer_complaint', 'payment_issue', 'delivery_issue')),
    subject VARCHAR(500) NOT NULL,
    party_name VARCHAR(255) NOT NULL,
    escalation_date DATE NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('open', 'escalated', 'resolved')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vendor_communications_date ON comms_ai.vendor_communications(email_date);
CREATE INDEX IF NOT EXISTS idx_vendor_communications_status ON comms_ai.vendor_communications(status);
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_date ON comms_ai.customer_inquiries(email_date);
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_status ON comms_ai.customer_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_order_validations_date ON comms_ai.order_validations(order_date);
CREATE INDEX IF NOT EXISTS idx_order_validations_match_status ON comms_ai.order_validations(match_status);
CREATE INDEX IF NOT EXISTS idx_escalations_date ON comms_ai.escalations(escalation_date);
CREATE INDEX IF NOT EXISTS idx_escalations_severity ON comms_ai.escalations(severity);

-- Insert sample data for vendor communications
INSERT INTO comms_ai.vendor_communications (vendor_name, subject, email_body, email_date, status, priority, sentiment) VALUES
('ABC Suppliers Inc.', 'Delivery Schedule Update', 'We are writing to inform you about an update to our delivery schedule...', '2025-10-18', 'pending', 'high', 'neutral'),
('XYZ Manufacturing', 'Invoice #12345 Dispute', 'There appears to be a discrepancy in the recent invoice...', '2025-10-17', 'escalated', 'critical', 'negative'),
('Global Logistics Ltd', 'Shipment Confirmation', 'Your order has been shipped and will arrive by...', '2025-10-16', 'resolved', 'normal', 'positive'),
('Tech Components Co', 'Price Quote Request Response', 'Thank you for your inquiry. Please find our competitive pricing...', '2025-10-15', 'resolved', 'normal', 'positive'),
('Premium Parts LLC', 'Quality Issue Report', 'We have identified a quality concern with the recent batch...', '2025-10-14', 'pending', 'high', 'negative')
ON CONFLICT DO NOTHING;

-- Insert sample data for customer inquiries
INSERT INTO comms_ai.customer_inquiries (customer_name, subject, email_body, email_date, status, response_time, sentiment) VALUES
('Acme Corporation', 'Product Availability Query', 'We would like to inquire about the availability of...', '2025-10-18', 'open', '2h', 'neutral'),
('Tech Solutions Inc', 'Urgent: Order Delay Complaint', 'Our order was expected to arrive yesterday but...', '2025-10-18', 'urgent', '30m', 'negative'),
('Retail Partners LLC', 'Thank you for excellent service', 'We wanted to express our appreciation for the exceptional service...', '2025-10-17', 'closed', '1h', 'positive'),
('Enterprise Systems', 'Technical Support Request', 'We are experiencing issues with the product integration...', '2025-10-17', 'open', '3h', 'neutral'),
('Global Trading Co', 'Bulk Order Discount Inquiry', 'We are interested in placing a bulk order and would like to discuss...', '2025-10-16', 'closed', '45m', 'positive')
ON CONFLICT DO NOTHING;

-- Insert sample data for order validations
INSERT INTO comms_ai.order_validations (order_number, customer_name, status, amount, order_date, match_status) VALUES
('ORD-2025-1001', 'Acme Corporation', 'confirmed', 45230.00, '2025-10-18', 'matched'),
('ORD-2025-1002', 'Tech Solutions Inc', 'pending', 12450.00, '2025-10-18', 'mismatch'),
('ORD-2025-1003', 'Retail Partners LLC', 'confirmed', 78900.00, '2025-10-17', 'matched'),
('ORD-2025-1004', 'Enterprise Systems', 'confirmed', 34560.00, '2025-10-17', 'matched'),
('ORD-2025-1005', 'Global Trading Co', 'pending', 156780.00, '2025-10-16', 'pending')
ON CONFLICT (order_number) DO NOTHING;

-- Insert sample data for escalations
INSERT INTO comms_ai.escalations (escalation_type, subject, party_name, escalation_date, severity, status, description) VALUES
('vendor_dispute', 'Payment Terms Disagreement', 'XYZ Manufacturing', '2025-10-17', 'high', 'open', 'Vendor is disputing the payment terms agreed upon in the contract'),
('customer_complaint', 'Delayed Delivery - 3rd Instance', 'Tech Solutions Inc', '2025-10-18', 'critical', 'escalated', 'Customer has experienced delivery delays three times in a row'),
('payment_issue', 'Invoice Processing Delay', 'ABC Suppliers Inc', '2025-10-16', 'medium', 'open', 'Payment processing has been delayed due to system issues'),
('delivery_issue', 'Damaged Goods Received', 'Retail Partners LLC', '2025-10-15', 'high', 'escalated', 'Customer reported receiving damaged goods in the last shipment')
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION comms_ai.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_vendor_communications_updated_at BEFORE UPDATE ON comms_ai.vendor_communications FOR EACH ROW EXECUTE FUNCTION comms_ai.update_updated_at_column();
CREATE TRIGGER update_customer_inquiries_updated_at BEFORE UPDATE ON comms_ai.customer_inquiries FOR EACH ROW EXECUTE FUNCTION comms_ai.update_updated_at_column();
CREATE TRIGGER update_order_validations_updated_at BEFORE UPDATE ON comms_ai.order_validations FOR EACH ROW EXECUTE FUNCTION comms_ai.update_updated_at_column();
CREATE TRIGGER update_escalations_updated_at BEFORE UPDATE ON comms_ai.escalations FOR EACH ROW EXECUTE FUNCTION comms_ai.update_updated_at_column();
