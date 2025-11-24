-- Insert new Pulse Monitor Templates for Kit Tracking

-- 1. Loaner Kit Workflow Delay Alert
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Loaner Kit Workflow Delay Alert',
    'Monitor loaner kits stuck in workflow steps longer than expected duration',
    'coo',
    'Alert when loaner kit is delayed in any step by more than 4 hours',
    'SELECT
        request_id,
        asset_id,
        current_step,
        CASE current_step
            WHEN 1 THEN ''Kit Request''
            WHEN 2 THEN ''Transfer Order''
            WHEN 3 THEN ''Pick & Ship DC''
            WHEN 4 THEN ''Kit in Transit''
            WHEN 5 THEN ''Receipt''
            WHEN 6 THEN ''Surgery''
            WHEN 7 THEN ''Usage Report''
            WHEN 8 THEN ''Return Arrange''
            WHEN 9 THEN ''Return Transit''
            WHEN 10 THEN ''DC Receipt & QC''
            WHEN 11 THEN ''Invoice Process''
        END as step_name,
        workflow_status,
        EXTRACT(EPOCH FROM (NOW() - updated_at))/3600 as hours_in_step,
        expected_completion_date
    FROM loaner_process_flow
    WHERE workflow_status = ''active''
    AND EXTRACT(EPOCH FROM (NOW() - updated_at))/3600 > 4',
    'postgresql',
    'hourly',
    'high',
    'hours_in_step > 4',
    true
);

-- 2. Loaner Kit Overdue Return Alert
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Loaner Kit Overdue Return Alert',
    'Alert when loaner kits are not returned by expected date',
    'coo',
    'Show me loaner kits overdue for return',
    'SELECT
        lf.request_id,
        lf.asset_id,
        sk.asset_name,
        lf.step6_surgeon as surgeon,
        lf.step1_hospital_id as hospital,
        lf.expected_completion_date,
        EXTRACT(DAY FROM (NOW() - lf.expected_completion_date)) as days_overdue,
        lf.current_step
    FROM loaner_process_flow lf
    JOIN surgical_kits sk ON lf.asset_id = sk.asset_id
    WHERE lf.is_overdue = true
    AND lf.workflow_status = ''active''
    AND lf.current_step BETWEEN 5 AND 9
    ORDER BY days_overdue DESC',
    'postgresql',
    'daily',
    'critical',
    'days_overdue > 0',
    true
);

-- 3. Consignment Kit Restocking Delay
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Consignment Kit Restocking Delay',
    'Monitor consignment kits waiting for replenishment',
    'supply_chain',
    'Alert when consignment kit restocking takes more than 2 days',
    'SELECT
        cf.consignment_id,
        cf.asset_id,
        sk.asset_name,
        cf.step1_hospital_id as hospital,
        cf.step5_items_used,
        cf.step5_record_timestamp,
        EXTRACT(DAY FROM (NOW() - cf.step5_record_timestamp)) as days_since_usage,
        cf.current_step,
        CASE cf.current_step
            WHEN 5 THEN ''Waiting for replacement shipment''
            WHEN 6 THEN ''Replacements in transit''
            WHEN 7 THEN ''Ready to restock''
        END as status
    FROM consignment_process_flow cf
    JOIN surgical_kits sk ON cf.asset_id = sk.asset_id
    WHERE cf.workflow_status = ''active''
    AND cf.current_step BETWEEN 5 AND 8
    AND EXTRACT(DAY FROM (NOW() - cf.step5_record_timestamp)) > 2',
    'postgresql',
    'daily',
    'high',
    'days_since_usage > 2',
    true
);

-- 4. High Autoclave Cycle Count Alert
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'High Autoclave Cycle Count Alert',
    'Monitor surgical kits approaching lifecycle limits',
    'coo',
    'Alert when kit autoclave cycles exceed 140 (approaching 150 limit)',
    'SELECT
        sk.asset_id,
        sk.asset_name,
        sk.logistics_status,
        MAX(kle.total_autoclave_cycles) as autoclave_cycles,
        MAX(kle.total_usage_count) as usage_count,
        it.tracker_id,
        it.battery_level,
        sk.value_usd
    FROM surgical_kits sk
    JOIN kit_lifecycle_events kle ON sk.asset_id = kle.asset_id
    JOIN iot_trackers it ON sk.tracker_id = it.tracker_id
    WHERE kle.total_autoclave_cycles > 140
    GROUP BY sk.asset_id, sk.asset_name, sk.logistics_status, it.tracker_id, it.battery_level, sk.value_usd
    ORDER BY autoclave_cycles DESC',
    'postgresql',
    'daily',
    'warning',
    'autoclave_cycles > 140',
    true
);

-- 5. IoT Tracker Battery Low Alert
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'IoT Tracker Battery Low Alert',
    'Monitor IoT tracker battery levels to prevent tracking loss',
    'coo',
    'Alert when IoT tracker battery drops below 20%',
    'SELECT
        it.tracker_id,
        it.serial_number,
        sk.asset_id,
        sk.asset_name,
        it.battery_level,
        it.battery_status,
        it.estimated_battery_life_days,
        it.last_transmission,
        EXTRACT(HOUR FROM (NOW() - it.last_transmission)) as hours_since_transmission
    FROM iot_trackers it
    LEFT JOIN surgical_kits sk ON it.tracker_id = sk.tracker_id
    WHERE it.battery_level < 20
    OR it.battery_status != ''good''
    OR EXTRACT(HOUR FROM (NOW() - it.last_transmission)) > 24
    ORDER BY it.battery_level ASC',
    'postgresql',
    'daily',
    'high',
    'battery_level < 20 OR hours_since_transmission > 24',
    true
);

-- 6. Kit Location Tracking Gap Alert
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Kit Location Tracking Gap Alert',
    'Identify kits with no location updates for extended periods',
    'coo',
    'Show kits with no location update in last 48 hours',
    'SELECT
        sk.asset_id,
        sk.asset_name,
        sk.logistics_status,
        kl.facility_name as last_known_location,
        kl.arrival_timestamp as last_location_update,
        EXTRACT(HOUR FROM (NOW() - kl.arrival_timestamp)) as hours_since_update,
        it.tracker_id,
        it.last_transmission,
        it.signal_strength
    FROM surgical_kits sk
    JOIN iot_trackers it ON sk.tracker_id = it.tracker_id
    LEFT JOIN LATERAL (
        SELECT facility_name, arrival_timestamp
        FROM kit_location_history
        WHERE asset_id = sk.asset_id
        ORDER BY arrival_timestamp DESC
        LIMIT 1
    ) kl ON true
    WHERE EXTRACT(HOUR FROM (NOW() - kl.arrival_timestamp)) > 48
    ORDER BY hours_since_update DESC',
    'postgresql',
    'daily',
    'medium',
    'hours_since_update > 48',
    true
);

-- 7. Loaner Kit Invoice Delay Alert
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Loaner Kit Invoice Delay Alert',
    'Monitor invoicing delays for completed loaner workflows',
    'cfo',
    'Alert when invoice processing takes more than 10 days after kit return',
    'SELECT
        lf.request_id,
        lf.asset_id,
        sk.asset_name,
        lf.step10_dc_receipt as return_date,
        lf.step11_invoice_timestamp as invoice_date,
        lf.step11_payment_status,
        EXTRACT(DAY FROM (NOW() - lf.step10_dc_receipt)) as days_since_return,
        lf.step11_invoice_amount as expected_revenue,
        lf.step1_hospital_id as hospital
    FROM loaner_process_flow lf
    JOIN surgical_kits sk ON lf.asset_id = sk.asset_id
    WHERE lf.step10_status = ''Complete''
    AND (lf.step11_status IS NULL OR lf.step11_status != ''Complete'')
    AND EXTRACT(DAY FROM (NOW() - lf.step10_dc_receipt)) > 10
    ORDER BY days_since_return DESC',
    'postgresql',
    'daily',
    'medium',
    'days_since_return > 10',
    true
);

-- 8. Kit Process Performance Summary
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Kit Process Performance Summary',
    'Daily performance metrics for loaner and consignment workflows',
    'general',
    'Show me daily kit workflow performance metrics',
    'SELECT
        metric_date,
        workflow_type,
        total_requests,
        completed_workflows,
        active_workflows,
        delayed_workflows,
        ROUND(avg_total_duration_hours, 2) as avg_duration_hours,
        ROUND(on_time_completion_rate, 2) as on_time_pct,
        ROUND(utilization_rate, 2) as utilization_pct,
        total_revenue,
        ROUND(avg_invoice_amount, 2) as avg_invoice
    FROM kit_process_metrics
    WHERE metric_date >= CURRENT_DATE - INTERVAL ''30 days''
    ORDER BY metric_date DESC, workflow_type',
    'postgresql',
    'daily',
    'low',
    'on_time_completion_rate < 85',
    true
);

-- 9. Kit Impact & Drop Alert
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Kit Impact & Drop Alert',
    'Monitor high-impact events that may damage surgical kits',
    'coo',
    'Alert when kit experiences drop with impact force above 10G',
    'SELECT
        kle.asset_id,
        sk.asset_name,
        sk.value_usd,
        kle.event_timestamp,
        kle.impact_force_g,
        kle.facility_id,
        kle.total_drop_count,
        klh.facility_name as location
    FROM kit_lifecycle_events kle
    JOIN surgical_kits sk ON kle.asset_id = sk.asset_id
    LEFT JOIN kit_location_history klh ON kle.asset_id = klh.asset_id
        AND kle.facility_id = klh.facility_id
    WHERE kle.event_type = ''drop''
    AND kle.impact_force_g > 10
    AND kle.event_timestamp >= CURRENT_DATE - INTERVAL ''7 days''
    ORDER BY kle.impact_force_g DESC, kle.event_timestamp DESC',
    'postgresql',
    'hourly',
    'critical',
    'impact_force_g > 10',
    true
);

-- 10. Consignment Kit Utilization Report
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Consignment Kit Utilization Report',
    'Track consignment kit usage patterns and efficiency',
    'cfo',
    'Show consignment kit utilization and revenue metrics',
    'SELECT
        sk.asset_id,
        sk.asset_name,
        COUNT(DISTINCT cf.consignment_id) as total_uses,
        MIN(cf.step4_surgery_timestamp) as first_surgery,
        MAX(cf.step4_surgery_timestamp) as last_surgery,
        COUNT(CASE WHEN cf.workflow_status = ''complete'' THEN 1 END) as completed_cycles,
        AVG(cf.total_duration_hours) as avg_cycle_hours,
        SUM(cf.step10_invoice_amount) as total_revenue,
        AVG(cf.step10_invoice_amount) as avg_revenue_per_use,
        MAX(kle.total_usage_count) as usage_count,
        MAX(kle.total_autoclave_cycles) as autoclave_cycles
    FROM surgical_kits sk
    LEFT JOIN consignment_process_flow cf ON sk.asset_id = cf.asset_id
    LEFT JOIN kit_lifecycle_events kle ON sk.asset_id = kle.asset_id
    WHERE sk.logistics_status = ''consignment''
    GROUP BY sk.asset_id, sk.asset_name
    HAVING COUNT(DISTINCT cf.consignment_id) > 0
    ORDER BY total_revenue DESC',
    'postgresql',
    'weekly',
    'low',
    'avg_cycle_hours > 168',
    true
);
