-- Consignment Kit Management Schema
-- Tracks the 11-step consignment kit lifecycle

-- Table: consignment_kit_tracking
-- Tracks individual kit instances through the process
CREATE TABLE IF NOT EXISTS consignment_kit_tracking (
    kit_id VARCHAR(50) PRIMARY KEY,
    hospital_name VARCHAR(255) NOT NULL,
    distributor_name VARCHAR(255) NOT NULL,
    kit_type VARCHAR(100),
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
    usage_record_at TIMESTAMP WITH TIME ZONE,
    ship_replacements_at TIMESTAMP WITH TIME ZONE,
    replace_transit_at TIMESTAMP WITH TIME ZONE,
    restock_at TIMESTAMP WITH TIME ZONE,
    available_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT chk_status CHECK (status IN (
        'Kit Request', 'Transfer Order', 'Pick & Ship DC', 'Kit in Transit',
        'Receipt', 'Surgery', 'Usage Record', 'Ship Replacements',
        'Replace Transit', 'Restock Kit', 'Kit Available', 'Cancelled'
    ))
);

-- Table: consignment_kit_process_steps
-- Tracks performance metrics for each process step
CREATE TABLE IF NOT EXISTS consignment_kit_process_steps (
    id SERIAL PRIMARY KEY,
    kit_id VARCHAR(50) REFERENCES consignment_kit_tracking(kit_id),
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    owner VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    duration_hours NUMERIC(10, 2),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_step_status CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Failed')),
    CONSTRAINT chk_owner CHECK (owner IN ('Hospital', 'Distributor', 'FedEx'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kit_status ON consignment_kit_tracking(status);
CREATE INDEX IF NOT EXISTS idx_kit_hospital ON consignment_kit_tracking(hospital_name);
CREATE INDEX IF NOT EXISTS idx_kit_distributor ON consignment_kit_tracking(distributor_name);
CREATE INDEX IF NOT EXISTS idx_kit_updated ON consignment_kit_tracking(updated_at);
CREATE INDEX IF NOT EXISTS idx_step_kit_id ON consignment_kit_process_steps(kit_id);
CREATE INDEX IF NOT EXISTS idx_step_number ON consignment_kit_process_steps(step_number);
CREATE INDEX IF NOT EXISTS idx_step_status ON consignment_kit_process_steps(status);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kit_updated_at
    BEFORE UPDATE ON consignment_kit_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_kit_updated_at();

-- Sample data
INSERT INTO consignment_kit_tracking (kit_id, hospital_name, distributor_name, kit_type, status, current_step, kit_request_at, transfer_order_at, pick_ship_at)
VALUES
    ('KIT-2024-0001', 'Mayo Clinic', 'McKesson Medical', 'Orthopedic Surgery Kit', 'Pick & Ship DC', 3, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour'),
    ('KIT-2024-0002', 'Cleveland Clinic', 'Cardinal Health', 'Cardiac Surgery Kit', 'Kit in Transit', 4, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1.5 days', NOW() - INTERVAL '1 day'),
    ('KIT-2024-0003', 'Johns Hopkins', 'Henry Schein', 'Neurosurgery Kit', 'Surgery', 6, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4.5 days', NOW() - INTERVAL '3 days'),
    ('KIT-2024-0004', 'Mass General', 'Medline', 'General Surgery Kit', 'Kit Request', 1, NOW() - INTERVAL '2 hours', NULL, NULL),
    ('KIT-2024-0005', 'Stanford Hospital', 'McKesson Medical', 'Spinal Surgery Kit', 'Replace Transit', 9, NOW() - INTERVAL '8 days', NOW() - INTERVAL '7.5 days', NOW() - INTERVAL '7 days'),
    ('KIT-2024-0006', 'UCLA Medical', 'Cardinal Health', 'Trauma Kit', 'Transfer Order', 2, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '30 minutes', NULL),
    ('KIT-2024-0007', 'NYU Langone', 'Owens & Minor', 'Orthopedic Surgery Kit', 'Receipt', 5, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2.5 days', NOW() - INTERVAL '2 days'),
    ('KIT-2024-0008', 'UCSF Medical', 'Medline', 'Cardiac Surgery Kit', 'Usage Record', 7, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5.5 days', NOW() - INTERVAL '5 days'),
    ('KIT-2024-0009', 'Duke Hospital', 'Henry Schein', 'General Surgery Kit', 'Kit Available', 11, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9.5 days', NOW() - INTERVAL '9 days'),
    ('KIT-2024-0010', 'Penn Medicine', 'McKesson Medical', 'Neurosurgery Kit', 'Ship Replacements', 8, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6.5 days', NOW() - INTERVAL '6 days')
ON CONFLICT (kit_id) DO NOTHING;

-- Sample process steps data
INSERT INTO consignment_kit_process_steps (kit_id, step_number, step_name, owner, status, duration_hours, started_at, completed_at)
VALUES
    -- KIT-2024-0001 (currently at step 3)
    ('KIT-2024-0001', 1, 'Kit Request', 'Hospital', 'Completed', 2.5, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '3 hours'),
    ('KIT-2024-0001', 2, 'Transfer Order', 'Distributor', 'Completed', 1.0, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour'),
    ('KIT-2024-0001', 3, 'Pick & Ship DC', 'Distributor', 'In Progress', NULL, NOW() - INTERVAL '1 hour', NULL),

    -- KIT-2024-0002 (currently at step 4)
    ('KIT-2024-0002', 1, 'Kit Request', 'Hospital', 'Completed', 3.0, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1.9 days'),
    ('KIT-2024-0002', 2, 'Transfer Order', 'Distributor', 'Completed', 0.8, NOW() - INTERVAL '1.9 days', NOW() - INTERVAL '1.5 days'),
    ('KIT-2024-0002', 3, 'Pick & Ship DC', 'Distributor', 'Completed', 12.0, NOW() - INTERVAL '1.5 days', NOW() - INTERVAL '1 day'),
    ('KIT-2024-0002', 4, 'Kit in Transit', 'FedEx', 'In Progress', NULL, NOW() - INTERVAL '1 day', NULL),

    -- KIT-2024-0003 (currently at step 6)
    ('KIT-2024-0003', 1, 'Kit Request', 'Hospital', 'Completed', 2.0, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4.9 days'),
    ('KIT-2024-0003', 2, 'Transfer Order', 'Distributor', 'Completed', 1.2, NOW() - INTERVAL '4.9 days', NOW() - INTERVAL '4.5 days'),
    ('KIT-2024-0003', 3, 'Pick & Ship DC', 'Distributor', 'Completed', 36.0, NOW() - INTERVAL '4.5 days', NOW() - INTERVAL '3 days'),
    ('KIT-2024-0003', 4, 'Kit in Transit', 'FedEx', 'Completed', 24.0, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
    ('KIT-2024-0003', 5, 'Receipt', 'Hospital', 'Completed', 3.5, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1.8 days'),
    ('KIT-2024-0003', 6, 'Surgery', 'Hospital', 'In Progress', NULL, NOW() - INTERVAL '1.8 days', NULL)
ON CONFLICT DO NOTHING;

-- View: consignment_kit_summary
-- Provides aggregated statistics for the dashboard
CREATE OR REPLACE VIEW consignment_kit_summary AS
SELECT
    COUNT(DISTINCT kit_id) as total_kits,
    COUNT(DISTINCT CASE WHEN status IN ('Kit Request', 'Transfer Order', 'Receipt',
        'Surgery', 'Usage Record', 'Ship Replacements', 'Restock Kit') THEN kit_id END) as active_kits,
    COUNT(DISTINCT CASE WHEN status IN ('Pick & Ship DC', 'Kit in Transit', 'Replace Transit')
        THEN kit_id END) as in_transit,
    COUNT(DISTINCT CASE WHEN status = 'Kit Available'
        AND DATE(updated_at) = CURRENT_DATE THEN kit_id END) as completed_today,
    COUNT(DISTINCT hospital_name) as total_hospitals,
    COUNT(DISTINCT distributor_name) as total_distributors
FROM consignment_kit_tracking;
