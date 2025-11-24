-- Loaner Process Schema
-- Tracks the 11-step loaner equipment lifecycle

-- Table: loaner_process_tracking
-- Tracks individual loaner instances through the process
CREATE TABLE IF NOT EXISTS loaner_process_tracking (
    loaner_id VARCHAR(50) PRIMARY KEY,
    hospital_name VARCHAR(255) NOT NULL,
    distributor_name VARCHAR(255) NOT NULL,
    equipment_type VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    current_step INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Step timestamps
    kit_request_at TIMESTAMP WITH TIME ZONE,
    transfer_order_at TIMESTAMP WITH TIME ZONE,
    pick_ship_at TIMESTAMP WITH TIME ZONE,
    in_transit_at TIMESTAMP WITH TIME ZONE,
    receipt_at TIMESTAMP WITH TIME ZONE,
    surgery_at TIMESTAMP WITH TIME ZONE,
    usage_report_at TIMESTAMP WITH TIME ZONE,
    return_arrange_at TIMESTAMP WITH TIME ZONE,
    return_transit_at TIMESTAMP WITH TIME ZONE,
    dc_receipt_qc_at TIMESTAMP WITH TIME ZONE,
    invoice_process_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT chk_loaner_status CHECK (status IN (
        'Kit Request', 'Transfer Order', 'Pick & Ship DC', 'Kit in Transit',
        'Receipt', 'Surgery', 'Usage Report', 'Return Arrange',
        'Return Transit', 'DC Receipt & QC', 'Invoice Process', 'Completed', 'Cancelled'
    ))
);

-- Table: loaner_process_steps
-- Tracks performance metrics for each process step
CREATE TABLE IF NOT EXISTS loaner_process_steps (
    id SERIAL PRIMARY KEY,
    loaner_id VARCHAR(50) REFERENCES loaner_process_tracking(loaner_id),
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    owner VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    duration_hours NUMERIC(10, 2),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_loaner_step_status CHECK (status IN ('Pending', 'Active', 'Transit', 'In Progress', 'Completed', 'Failed')),
    CONSTRAINT chk_loaner_owner CHECK (owner IN ('Hospital', 'Distributor', 'FedEx', 'Both'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loaner_status ON loaner_process_tracking(status);
CREATE INDEX IF NOT EXISTS idx_loaner_hospital ON loaner_process_tracking(hospital_name);
CREATE INDEX IF NOT EXISTS idx_loaner_distributor ON loaner_process_tracking(distributor_name);
CREATE INDEX IF NOT EXISTS idx_loaner_updated ON loaner_process_tracking(updated_at);
CREATE INDEX IF NOT EXISTS idx_loaner_step_id ON loaner_process_steps(loaner_id);
CREATE INDEX IF NOT EXISTS idx_loaner_step_number ON loaner_process_steps(step_number);
CREATE INDEX IF NOT EXISTS idx_loaner_step_status ON loaner_process_steps(status);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_loaner_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_loaner_updated_at
    BEFORE UPDATE ON loaner_process_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_loaner_updated_at();

-- Sample data
INSERT INTO loaner_process_tracking (loaner_id, hospital_name, distributor_name, equipment_type, status, current_step, kit_request_at, transfer_order_at, pick_ship_at)
VALUES
    ('LOAN-2024-0001', 'Mayo Clinic', 'McKesson Medical', 'Spine Surgery Set', 'Pick & Ship DC', 3, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2.5 hours', NOW() - INTERVAL '1 hour'),
    ('LOAN-2024-0002', 'Cleveland Clinic', 'Cardinal Health', 'Hip Replacement Kit', 'Kit in Transit', 4, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1.8 days', NOW() - INTERVAL '1.2 days'),
    ('LOAN-2024-0003', 'Johns Hopkins', 'Henry Schein', 'Knee Surgery Tools', 'Surgery', 6, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4.8 days', NOW() - INTERVAL '4 days'),
    ('LOAN-2024-0004', 'Mass General', 'Medline', 'Trauma Surgery Kit', 'Kit Request', 1, NOW() - INTERVAL '3 hours', NULL, NULL),
    ('LOAN-2024-0005', 'Stanford Hospital', 'McKesson Medical', 'Neuro Surgery Set', 'Return Transit', 9, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9.5 days', NOW() - INTERVAL '9 days'),
    ('LOAN-2024-0006', 'UCLA Medical', 'Cardinal Health', 'Orthopedic Kit', 'Transfer Order', 2, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '45 minutes', NULL),
    ('LOAN-2024-0007', 'NYU Langone', 'Owens & Minor', 'Spinal Implant Kit', 'Receipt', 5, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2.7 days', NOW() - INTERVAL '2.3 days'),
    ('LOAN-2024-0008', 'UCSF Medical', 'Medline', 'Hip Replacement Set', 'Usage Report', 7, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6.8 days', NOW() - INTERVAL '6.5 days'),
    ('LOAN-2024-0009', 'Duke Hospital', 'Henry Schein', 'Knee Surgery Kit', 'Invoice Process', 11, NOW() - INTERVAL '15 days', NOW() - INTERVAL '14.8 days', NOW() - INTERVAL '14.5 days'),
    ('LOAN-2024-0010', 'Penn Medicine', 'McKesson Medical', 'Trauma Loaner Set', 'Return Arrange', 8, NOW() - INTERVAL '8 days', NOW() - INTERVAL '7.8 days', NOW() - INTERVAL '7.5 days'),
    ('LOAN-2024-0011', 'Cedars-Sinai', 'Cardinal Health', 'Spine Surgery Kit', 'DC Receipt & QC', 10, NOW() - INTERVAL '12 days', NOW() - INTERVAL '11.8 days', NOW() - INTERVAL '11.5 days'),
    ('LOAN-2024-0012', 'Mount Sinai', 'Henry Schein', 'Joint Replacement Kit', 'Kit in Transit', 4, NOW() - INTERVAL '1.5 days', NOW() - INTERVAL '1.3 days', NOW() - INTERVAL '1 day')
ON CONFLICT (loaner_id) DO NOTHING;

-- Sample process steps data
INSERT INTO loaner_process_steps (loaner_id, step_number, step_name, owner, status, duration_hours, started_at, completed_at)
VALUES
    -- LOAN-2024-0001 (currently at step 3 - Pick & Ship DC)
    ('LOAN-2024-0001', 1, 'Kit Request', 'Hospital', 'Completed', 1.5, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2.5 hours'),
    ('LOAN-2024-0001', 2, 'Transfer Order', 'Distributor', 'Completed', 1.5, NOW() - INTERVAL '2.5 hours', NOW() - INTERVAL '1 hour'),
    ('LOAN-2024-0001', 3, 'Pick & Ship DC', 'Distributor', 'Active', NULL, NOW() - INTERVAL '1 hour', NULL),

    -- LOAN-2024-0002 (currently at step 4 - Kit in Transit)
    ('LOAN-2024-0002', 1, 'Kit Request', 'Hospital', 'Completed', 2.0, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1.9 days'),
    ('LOAN-2024-0002', 2, 'Transfer Order', 'Distributor', 'Completed', 0.8, NOW() - INTERVAL '1.9 days', NOW() - INTERVAL '1.8 days'),
    ('LOAN-2024-0002', 3, 'Pick & Ship DC', 'Distributor', 'Completed', 14.4, NOW() - INTERVAL '1.8 days', NOW() - INTERVAL '1.2 days'),
    ('LOAN-2024-0002', 4, 'Kit in Transit', 'FedEx', 'Transit', NULL, NOW() - INTERVAL '1.2 days', NULL),

    -- LOAN-2024-0003 (currently at step 6 - Surgery)
    ('LOAN-2024-0003', 1, 'Kit Request', 'Hospital', 'Completed', 1.2, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4.95 days'),
    ('LOAN-2024-0003', 2, 'Transfer Order', 'Distributor', 'Completed', 1.0, NOW() - INTERVAL '4.95 days', NOW() - INTERVAL '4.8 days'),
    ('LOAN-2024-0003', 3, 'Pick & Ship DC', 'Distributor', 'Completed', 19.2, NOW() - INTERVAL '4.8 days', NOW() - INTERVAL '4 days'),
    ('LOAN-2024-0003', 4, 'Kit in Transit', 'FedEx', 'Completed', 48.0, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),
    ('LOAN-2024-0003', 5, 'Receipt', 'Hospital', 'Completed', 2.5, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1.9 days'),
    ('LOAN-2024-0003', 6, 'Surgery', 'Hospital', 'In Progress', NULL, NOW() - INTERVAL '1.9 days', NULL),

    -- LOAN-2024-0004 (currently at step 1 - Kit Request)
    ('LOAN-2024-0004', 1, 'Kit Request', 'Hospital', 'Active', NULL, NOW() - INTERVAL '3 hours', NULL),

    -- LOAN-2024-0009 (currently at step 11 - Invoice Process)
    ('LOAN-2024-0009', 1, 'Kit Request', 'Hospital', 'Completed', 2.0, NOW() - INTERVAL '15 days', NOW() - INTERVAL '14.9 days'),
    ('LOAN-2024-0009', 2, 'Transfer Order', 'Distributor', 'Completed', 1.0, NOW() - INTERVAL '14.9 days', NOW() - INTERVAL '14.8 days'),
    ('LOAN-2024-0009', 3, 'Pick & Ship DC', 'Distributor', 'Completed', 28.8, NOW() - INTERVAL '14.8 days', NOW() - INTERVAL '13.6 days'),
    ('LOAN-2024-0009', 4, 'Kit in Transit', 'FedEx', 'Completed', 36.0, NOW() - INTERVAL '13.6 days', NOW() - INTERVAL '12.1 days'),
    ('LOAN-2024-0009', 5, 'Receipt', 'Hospital', 'Completed', 3.0, NOW() - INTERVAL '12.1 days', NOW() - INTERVAL '12 days'),
    ('LOAN-2024-0009', 6, 'Surgery', 'Hospital', 'Completed', 24.0, NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days'),
    ('LOAN-2024-0009', 7, 'Usage Report', 'Hospital', 'Completed', 3.5, NOW() - INTERVAL '11 days', NOW() - INTERVAL '10.85 days'),
    ('LOAN-2024-0009', 8, 'Return Arrange', 'Distributor', 'Completed', 2.0, NOW() - INTERVAL '10.85 days', NOW() - INTERVAL '10.8 days'),
    ('LOAN-2024-0009', 9, 'Return Transit', 'FedEx', 'Completed', 48.0, NOW() - INTERVAL '10.8 days', NOW() - INTERVAL '8.8 days'),
    ('LOAN-2024-0009', 10, 'DC Receipt & QC', 'Distributor', 'Completed', 6.0, NOW() - INTERVAL '8.8 days', NOW() - INTERVAL '8.55 days'),
    ('LOAN-2024-0009', 11, 'Invoice Process', 'Both', 'In Progress', NULL, NOW() - INTERVAL '8.55 days', NULL)
ON CONFLICT DO NOTHING;

-- View: loaner_process_summary
-- Provides aggregated statistics for the dashboard
CREATE OR REPLACE VIEW loaner_process_summary AS
SELECT
    COUNT(DISTINCT loaner_id) as total_loaners,
    COUNT(DISTINCT CASE WHEN status IN ('Kit Request', 'Transfer Order', 'Receipt',
        'Surgery', 'Usage Report', 'Return Arrange', 'DC Receipt & QC', 'Invoice Process') THEN loaner_id END) as active_loaners,
    COUNT(DISTINCT CASE WHEN status IN ('Pick & Ship DC', 'Kit in Transit', 'Return Transit')
        THEN loaner_id END) as in_transit,
    COUNT(DISTINCT CASE WHEN status = 'Completed'
        AND DATE(updated_at) = CURRENT_DATE THEN loaner_id END) as completed_today,
    COUNT(DISTINCT hospital_name) as total_hospitals,
    COUNT(DISTINCT distributor_name) as total_distributors
FROM loaner_process_tracking;
