-- IoT Tracker Master Data
CREATE TABLE IF NOT EXISTS iot_trackers (
    tracker_id VARCHAR(50) PRIMARY KEY,
    tracker_type VARCHAR(20), -- HOT, COLD, etc.
    serial_number VARCHAR(50) UNIQUE,
    firmware_version VARCHAR(20),
    battery_level INTEGER,
    battery_status VARCHAR(20),
    estimated_battery_life_days INTEGER,
    connectivity_type VARCHAR(20),
    signal_strength INTEGER,
    last_transmission TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Surgical Kit Assets
CREATE TABLE IF NOT EXISTS surgical_kits (
    asset_id VARCHAR(50) PRIMARY KEY,
    asset_name VARCHAR(255),
    asset_type VARCHAR(50),
    manufacturer VARCHAR(100),
    logistics_status VARCHAR(20), -- loaner, consignment
    value_usd DECIMAL(12,2),
    tracker_id VARCHAR(50) REFERENCES iot_trackers(tracker_id),
    pairing_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kit Location History
CREATE TABLE IF NOT EXISTS kit_location_history (
    location_id SERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES surgical_kits(asset_id),
    tracker_id VARCHAR(50) REFERENCES iot_trackers(tracker_id),
    facility_id VARCHAR(50),
    facility_name VARCHAR(255),
    department VARCHAR(100),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip VARCHAR(20),
    address_country VARCHAR(50),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    accuracy_meters INTEGER,
    location_method VARCHAR(20),
    arrival_timestamp TIMESTAMP,
    departure_timestamp TIMESTAMP,
    duration_hours DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kit Lifecycle Events
CREATE TABLE IF NOT EXISTS kit_lifecycle_events (
    event_id SERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES surgical_kits(asset_id),
    tracker_id VARCHAR(50) REFERENCES iot_trackers(tracker_id),
    event_type VARCHAR(50), -- autoclave, washing, drop, usage, surgery
    event_timestamp TIMESTAMP,
    facility_id VARCHAR(50),

    -- Autoclave/Sterilization data
    autoclave_duration_minutes INTEGER,
    max_temperature_celsius DECIMAL(5, 2),
    max_pressure_bar DECIMAL(4, 2),
    cycle_complete BOOLEAN,

    -- Drop/Impact data
    impact_force_g DECIMAL(6, 2),

    -- Cumulative counters
    total_autoclave_cycles INTEGER,
    total_washing_cycles INTEGER,
    total_usage_count INTEGER,
    total_drop_count INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loaner Process Workflow
CREATE TABLE IF NOT EXISTS loaner_process_flow (
    flow_id SERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES surgical_kits(asset_id),
    request_id VARCHAR(50) UNIQUE,

    -- Step 1: Kit Request
    step1_request_timestamp TIMESTAMP,
    step1_requestor VARCHAR(100),
    step1_hospital_id VARCHAR(50),
    step1_status VARCHAR(20),

    -- Step 2: Transfer Order
    step2_transfer_timestamp TIMESTAMP,
    step2_distributor_id VARCHAR(50),
    step2_status VARCHAR(20),

    -- Step 3: Pick & Ship DC
    step3_pick_timestamp TIMESTAMP,
    step3_ship_timestamp TIMESTAMP,
    step3_tracking_number VARCHAR(100),
    step3_status VARCHAR(20),

    -- Step 4: Kit in Transit
    step4_transit_start TIMESTAMP,
    step4_carrier VARCHAR(50),
    step4_status VARCHAR(20),

    -- Step 5: Receipt
    step5_receipt_timestamp TIMESTAMP,
    step5_received_by VARCHAR(100),
    step5_status VARCHAR(20),

    -- Step 6: Surgery
    step6_surgery_timestamp TIMESTAMP,
    step6_surgeon VARCHAR(100),
    step6_procedure_type VARCHAR(100),
    step6_status VARCHAR(20),

    -- Step 7: Usage Report
    step7_report_timestamp TIMESTAMP,
    step7_items_used JSONB,
    step7_status VARCHAR(20),

    -- Step 8: Return Arrange
    step8_arrange_timestamp TIMESTAMP,
    step8_return_tracking VARCHAR(100),
    step8_status VARCHAR(20),

    -- Step 9: Return Transit
    step9_return_start TIMESTAMP,
    step9_return_carrier VARCHAR(50),
    step9_status VARCHAR(20),

    -- Step 10: DC Receipt & QC
    step10_dc_receipt TIMESTAMP,
    step10_qc_pass BOOLEAN,
    step10_qc_notes TEXT,
    step10_status VARCHAR(20),

    -- Step 11: Invoice Process
    step11_invoice_timestamp TIMESTAMP,
    step11_invoice_amount DECIMAL(12, 2),
    step11_payment_status VARCHAR(20),
    step11_status VARCHAR(20),

    -- Overall metrics
    current_step INTEGER,
    workflow_status VARCHAR(20), -- active, complete, delayed
    total_duration_hours DECIMAL(10, 2),
    is_overdue BOOLEAN DEFAULT FALSE,
    expected_completion_date TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consignment Process Workflow
CREATE TABLE IF NOT EXISTS consignment_process_flow (
    flow_id SERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES surgical_kits(asset_id),
    consignment_id VARCHAR(50) UNIQUE,

    -- Step 1: Kit Request
    step1_request_timestamp TIMESTAMP,
    step1_requestor VARCHAR(100),
    step1_hospital_id VARCHAR(50),
    step1_status VARCHAR(20),

    -- Step 2: Transfer Order (Consign)
    step2_consign_timestamp TIMESTAMP,
    step2_distributor_id VARCHAR(50),
    step2_consignment_agreement VARCHAR(100),
    step2_status VARCHAR(20),

    -- Step 3: Deploy Kit
    step3_deploy_timestamp TIMESTAMP,
    step3_tracking_number VARCHAR(100),
    step3_carrier VARCHAR(50),
    step3_delivery_timestamp TIMESTAMP,
    step3_status VARCHAR(20),

    -- Step 4: Surgery & Usage
    step4_surgery_timestamp TIMESTAMP,
    step4_surgeon VARCHAR(100),
    step4_procedure_type VARCHAR(100),
    step4_status VARCHAR(20),

    -- Step 5: Usage Record
    step5_record_timestamp TIMESTAMP,
    step5_items_used JSONB,
    step5_status VARCHAR(20),

    -- Step 6: Ship Replacements
    step6_ship_timestamp TIMESTAMP,
    step6_replacement_tracking VARCHAR(100),
    step6_status VARCHAR(20),

    -- Step 7: Replace Transit
    step7_transit_start TIMESTAMP,
    step7_carrier VARCHAR(50),
    step7_status VARCHAR(20),

    -- Step 8: Restock Kit
    step8_restock_timestamp TIMESTAMP,
    step8_restocked_by VARCHAR(100),
    step8_status VARCHAR(20),

    -- Step 9: Kit Available
    step9_available_timestamp TIMESTAMP,
    step9_status VARCHAR(20),

    -- Step 10: Invoice Process
    step10_invoice_timestamp TIMESTAMP,
    step10_invoice_amount DECIMAL(12, 2),
    step10_payment_status VARCHAR(20),
    step10_status VARCHAR(20),

    -- Overall metrics
    current_step INTEGER,
    workflow_status VARCHAR(20), -- active, complete, delayed
    total_duration_hours DECIMAL(10, 2),
    is_overdue BOOLEAN DEFAULT FALSE,
    expected_completion_date TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Process Alerts & Anomalies
CREATE TABLE IF NOT EXISTS kit_process_alerts (
    alert_id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50), -- delay, missing_step, overdue, high_cycles, battery_low
    severity VARCHAR(20), -- info, warning, critical
    asset_id VARCHAR(50),
    tracker_id VARCHAR(50),
    workflow_type VARCHAR(20), -- loaner, consignment
    workflow_id VARCHAR(50),
    current_step INTEGER,

    message TEXT,
    threshold_value DECIMAL(12, 2),
    current_value DECIMAL(12, 2),

    alert_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP,
    resolution_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Process Performance Metrics
CREATE TABLE IF NOT EXISTS kit_process_metrics (
    metric_id SERIAL PRIMARY KEY,
    metric_date DATE,
    workflow_type VARCHAR(20), -- loaner, consignment

    -- Volume metrics
    total_requests INTEGER,
    completed_workflows INTEGER,
    active_workflows INTEGER,
    delayed_workflows INTEGER,

    -- Timing metrics
    avg_total_duration_hours DECIMAL(10, 2),
    avg_transit_time_hours DECIMAL(10, 2),
    avg_processing_time_hours DECIMAL(10, 2),

    -- Quality metrics
    on_time_completion_rate DECIMAL(5, 2), -- percentage
    qc_pass_rate DECIMAL(5, 2),
    utilization_rate DECIMAL(5, 2),

    -- Financial metrics
    total_revenue DECIMAL(12, 2),
    avg_invoice_amount DECIMAL(12, 2),
    payment_collection_rate DECIMAL(5, 2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kit_location_asset ON kit_location_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_kit_location_timestamp ON kit_location_history(arrival_timestamp);
CREATE INDEX IF NOT EXISTS idx_kit_events_asset ON kit_lifecycle_events(asset_id);
CREATE INDEX IF NOT EXISTS idx_kit_events_type ON kit_lifecycle_events(event_type);
CREATE INDEX IF NOT EXISTS idx_loaner_flow_status ON loaner_process_flow(workflow_status);
CREATE INDEX IF NOT EXISTS idx_loaner_flow_step ON loaner_process_flow(current_step);
CREATE INDEX IF NOT EXISTS idx_consignment_flow_status ON consignment_process_flow(workflow_status);
CREATE INDEX IF NOT EXISTS idx_consignment_flow_step ON consignment_process_flow(current_step);
CREATE INDEX IF NOT EXISTS idx_alerts_workflow ON kit_process_alerts(workflow_type, workflow_id);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON kit_process_alerts(acknowledged);
