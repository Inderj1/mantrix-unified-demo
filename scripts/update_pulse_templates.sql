-- Update Enterprise Pulse Agent Templates for PostgreSQL
-- These templates create proactive agents that execute queries to ensure business is not impacted

-- Clear existing templates
TRUNCATE TABLE pulse_monitor_templates;

-- CFO Category Templates
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active, created_at
) VALUES

-- 1. Distributor Performance Monitor
(
    gen_random_uuid(),
    'Low Performance Distributor Alert',
    'Proactively monitor distributors with low on-time delivery rates to prevent business impact',
    'cfo',
    'Alert me when distributor on-time delivery falls below 85%',
    'SELECT distributor_name, territory, on_time_delivery_pct, total_kits_handled, period_end FROM distributor_performance WHERE on_time_delivery_pct < 85 AND period_end >= CURRENT_DATE - INTERVAL ''30 days'' ORDER BY on_time_delivery_pct ASC',
    'postgresql',
    'daily',
    'medium',
    'on_time_delivery_pct < 85',
    true,
    CURRENT_TIMESTAMP
),

-- 2. Kit Profitability Monitor
(
    gen_random_uuid(),
    'Low Profitability Kit Alert',
    'Identify kits with low profitability or utilization to prevent revenue loss',
    'cfo',
    'Show me kits with utilization rate below 60%',
    'SELECT kit_id, kit_type, total_profit, utilization_rate, avg_cycle_time_days FROM kit_profitability_summary WHERE utilization_rate < 60 ORDER BY utilization_rate ASC LIMIT 50',
    'postgresql',
    'daily',
    'high',
    'utilization_rate < 60',
    true,
    CURRENT_TIMESTAMP
),

-- 3. Revenue at Risk Monitor
(
    gen_random_uuid(),
    'Revenue at Risk Alert',
    'Monitor potential revenue loss from delayed or at-risk kits to protect business operations',
    'cfo',
    'Alert when kits have potential revenue loss exceeding $10,000',
    'SELECT kit_id, estimated_revenue_loss, days_delayed, status, reason, detected_date FROM revenue_at_risk_summary WHERE estimated_revenue_loss > 10000 AND detected_date >= CURRENT_DATE - INTERVAL ''7 days'' ORDER BY estimated_revenue_loss DESC',
    'postgresql',
    'daily',
    'high',
    'estimated_revenue_loss > 10000',
    true,
    CURRENT_TIMESTAMP
),

-- 4. Regional Performance Monitor
(
    gen_random_uuid(),
    'Regional Revenue Performance Alert',
    'Track regional revenue performance to identify opportunities and risks early',
    'cfo',
    'Show regional product performance by revenue',
    'SELECT region, product_cluster, total_revenue, total_profit, avg_profit_margin FROM regional_product_clusters ORDER BY total_revenue DESC LIMIT 20',
    'postgresql',
    'weekly',
    'medium',
    'avg_profit_margin < 15',
    true,
    CURRENT_TIMESTAMP
),

-- 5. Customer Segment Analysis
(
    gen_random_uuid(),
    'High-Value Segment Monitor',
    'Track high-value customer segments to ensure retention and growth',
    'cfo',
    'Show me customer segments ranked by monetary value',
    'SELECT segment_name, customer_count, monetary_sum, monetary_mean, profitability_sum, margin_percent_mean, clv_proxy_mean FROM segment_performance ORDER BY monetary_sum DESC LIMIT 10',
    'postgresql',
    'weekly',
    'low',
    NULL,
    true,
    CURRENT_TIMESTAMP
),

-- COO Category Templates

-- 6. Late Kit Returns
(
    gen_random_uuid(),
    'Late Kit Return Alert',
    'Proactively track kits not returned within expected timeframe to prevent operational disruption',
    'coo',
    'Show me kits that are overdue for return by more than 7 days',
    'SELECT kit_id, customer_name, expected_return_date, days_overdue, last_location, status FROM kit_return_tracking WHERE days_overdue > 7 AND status != ''Returned'' ORDER BY days_overdue DESC LIMIT 50',
    'postgresql',
    'daily',
    'high',
    'days_overdue > 7',
    true,
    CURRENT_TIMESTAMP
),

-- 7. Process Bottleneck Alert
(
    gen_random_uuid(),
    'Critical Process Bottleneck Alert',
    'Alert on activities causing significant cycle time delays to ensure business flow',
    'coo',
    'Alert when process activities exceed target cycle time by more than 50%',
    'SELECT activity_name, avg_duration_hours, target_duration_hours, variance_pct, case_count, analysis_date FROM process_bottleneck_analysis WHERE variance_pct > 50 AND analysis_date >= CURRENT_DATE - INTERVAL ''7 days'' ORDER BY variance_pct DESC',
    'postgresql',
    'daily',
    'high',
    'variance_pct > 50',
    true,
    CURRENT_TIMESTAMP
),

-- 8. Sterilization Capacity Monitor
(
    gen_random_uuid(),
    'Sterilization Capacity Alert',
    'Monitor sterilization facility capacity to prevent operational bottlenecks',
    'coo',
    'Alert when sterilization capacity utilization exceeds 90%',
    'SELECT facility_id, capacity_utilization_pct, total_kits_processed, avg_turnaround_hours, period_end FROM sterilization_capacity_metrics WHERE capacity_utilization_pct > 90 AND period_end >= CURRENT_DATE - INTERVAL ''7 days'' ORDER BY capacity_utilization_pct DESC',
    'postgresql',
    'daily',
    'high',
    'capacity_utilization_pct > 90',
    true,
    CURRENT_TIMESTAMP
),

-- 9. Delivery Performance Monitor
(
    gen_random_uuid(),
    'Distributor Delivery Delays',
    'Track distributor delivery performance to ensure customer satisfaction',
    'coo',
    'Show distributors with average delivery time exceeding 5 days',
    'SELECT distributor_name, territory, avg_delivery_days, on_time_delivery_pct, total_kits_handled FROM distributor_performance WHERE avg_delivery_days > 5 AND period_end >= CURRENT_DATE - INTERVAL ''30 days'' ORDER BY avg_delivery_days DESC',
    'postgresql',
    'weekly',
    'medium',
    'avg_delivery_days > 5',
    true,
    CURRENT_TIMESTAMP
),

-- 10. Kit Lifecycle Event Monitor
(
    gen_random_uuid(),
    'Kit Lifecycle Anomaly Alert',
    'Monitor unusual kit lifecycle events to prevent operational issues',
    'coo',
    'Show kits with abnormal lifecycle patterns',
    'SELECT kit_id, event_type, event_date, location, notes FROM kit_lifecycle_events WHERE event_date >= CURRENT_DATE - INTERVAL ''7 days'' AND event_type IN (''damaged'', ''lost'', ''recalled'') ORDER BY event_date DESC',
    'postgresql',
    'daily',
    'high',
    'event_type IN (''damaged'', ''lost'', ''recalled'')',
    true,
    CURRENT_TIMESTAMP
),

-- Supply Chain Category Templates

-- 11. Kit Availability Forecast
(
    gen_random_uuid(),
    'Low Kit Availability Alert',
    'Forecast kit availability to prevent stockouts and ensure business continuity',
    'supply_chain',
    'Alert when forecasted available kits fall below 100 units',
    'SELECT forecast_date, region, product_type, forecasted_available_kits, forecasted_demand FROM kit_availability_forecast WHERE forecasted_available_kits < 100 AND forecast_date >= CURRENT_DATE ORDER BY forecast_date, forecasted_available_kits ASC',
    'postgresql',
    'daily',
    'high',
    'forecasted_available_kits < 100',
    true,
    CURRENT_TIMESTAMP
),

-- 12. Sterilization Turnaround Monitor
(
    gen_random_uuid(),
    'Sterilization Delay Alert',
    'Monitor sterilization turnaround times to prevent supply chain delays',
    'supply_chain',
    'Alert when sterilization turnaround exceeds 48 hours',
    'SELECT facility_id, avg_turnaround_hours, total_kits_processed, capacity_utilization_pct FROM sterilization_capacity_metrics WHERE avg_turnaround_hours > 48 AND period_end >= CURRENT_DATE - INTERVAL ''7 days'' ORDER BY avg_turnaround_hours DESC',
    'postgresql',
    'daily',
    'medium',
    'avg_turnaround_hours > 48',
    true,
    CURRENT_TIMESTAMP
),

-- 13. Kit Utilization Tracking
(
    gen_random_uuid(),
    'Low Kit Utilization Alert',
    'Monitor kit utilization rates to optimize asset deployment',
    'supply_chain',
    'Show kits with low utilization rates for redeployment',
    'SELECT kit_id, utilization_rate, total_cycles, total_idle_days, avg_cycle_time_days, period_end FROM kit_utilization_metrics WHERE utilization_rate < 50 AND period_end >= CURRENT_DATE - INTERVAL ''30 days'' ORDER BY utilization_rate ASC LIMIT 50',
    'postgresql',
    'weekly',
    'medium',
    'utilization_rate < 50',
    true,
    CURRENT_TIMESTAMP
),

-- General Business Templates

-- 14. STOX.AI Working Capital Savings
(
    gen_random_uuid(),
    'STOX.AI Performance Overview',
    'Monitor STOX.AI working capital release and cost savings',
    'general',
    'Show me STOX.AI working capital and cost savings performance',
    'SELECT total_skus, total_working_capital_s4, total_working_capital_stoxai, total_working_capital_release, total_annual_cost_s4, total_annual_cost_stoxai, total_annual_cost_savings, avg_service_level_improvement, payback_period_months FROM stox_enterprise_summary ORDER BY created_at DESC LIMIT 1',
    'postgresql',
    'weekly',
    'low',
    NULL,
    true,
    CURRENT_TIMESTAMP
),

-- 15. Product-Customer Performance
(
    gen_random_uuid(),
    'Product-Customer Revenue Analysis',
    'Monitor revenue by product-customer combinations to identify opportunities',
    'general',
    'Show top product-customer combinations by revenue',
    'SELECT product_name, customer_name, total_revenue, total_profit, transaction_count FROM product_customer_matrix ORDER BY total_revenue DESC LIMIT 25',
    'postgresql',
    'weekly',
    'low',
    NULL,
    true,
    CURRENT_TIMESTAMP
),

-- 16. Regional Top Performers
(
    gen_random_uuid(),
    'Regional Top Performers Report',
    'Track top performing products and customers by region',
    'general',
    'Show regional top performers',
    'SELECT region, product_name, customer_name, total_revenue, total_profit FROM regional_top_performers ORDER BY region, total_revenue DESC LIMIT 30',
    'postgresql',
    'weekly',
    'low',
    NULL,
    true,
    CURRENT_TIMESTAMP
);

-- Update usage counts and ratings to zero for new templates
UPDATE pulse_monitor_templates SET usage_count = 0, avg_rating = 0;

-- Verify templates were inserted
SELECT category, COUNT(*) as template_count
FROM pulse_monitor_templates
WHERE is_active = true
GROUP BY category
ORDER BY category;
