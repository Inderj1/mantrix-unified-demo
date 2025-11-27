-- Enterprise Pulse Monitor Templates for Stox.AI and Margen.AI
-- Run this SQL to insert pre-built alert templates

-- ============================================
-- STOX.AI TEMPLATES (Inventory Management)
-- ============================================

-- 1. Low Stock Alert - Stox.AI
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Low Stock Alert - Stox.AI',
    'Alert when inventory falls below reorder point threshold',
    'stox',
    'Alert me when any product stock falls below reorder point',
    'SELECT
        product_id,
        product_name,
        warehouse_location,
        current_stock,
        reorder_point,
        (reorder_point - current_stock) as units_below_reorder,
        ROUND((current_stock::numeric / NULLIF(reorder_point, 0)) * 100, 1) as stock_pct
    FROM inventory_levels
    WHERE current_stock < reorder_point
    ORDER BY units_below_reorder DESC
    LIMIT 50',
    'postgresql',
    'hourly',
    'critical',
    'current_stock < reorder_point',
    true
);

-- 2. Stockout Risk Alert - Stox.AI
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Stockout Risk Alert - Stox.AI',
    'Identify products at risk of stockout based on days of supply',
    'stox',
    'Show me products with less than 7 days of supply remaining',
    'SELECT
        product_id,
        product_name,
        current_stock,
        avg_daily_demand,
        ROUND(current_stock::numeric / NULLIF(avg_daily_demand, 0), 1) as days_of_supply,
        warehouse_location
    FROM inventory_levels
    WHERE avg_daily_demand > 0
    AND (current_stock::numeric / NULLIF(avg_daily_demand, 0)) < 7
    ORDER BY days_of_supply ASC
    LIMIT 50',
    'postgresql',
    'daily',
    'high',
    'days_of_supply < 7',
    true
);

-- 3. Overstock Alert - Stox.AI
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Overstock Alert - Stox.AI',
    'Identify items exceeding warehouse capacity thresholds',
    'stox',
    'Alert when inventory exceeds 90% of storage capacity',
    'SELECT
        warehouse_id,
        warehouse_name,
        SUM(current_stock) as total_units,
        max_capacity,
        ROUND((SUM(current_stock)::numeric / NULLIF(max_capacity, 0)) * 100, 1) as capacity_pct,
        (SUM(current_stock) - max_capacity * 0.9) as units_over_threshold
    FROM inventory_levels il
    JOIN warehouses w ON il.warehouse_id = w.id
    GROUP BY warehouse_id, warehouse_name, max_capacity
    HAVING SUM(current_stock)::numeric / NULLIF(max_capacity, 0) > 0.9
    ORDER BY capacity_pct DESC',
    'postgresql',
    'weekly',
    'medium',
    'capacity_pct > 90',
    true
);

-- 4. Slow-Moving Inventory Alert - Stox.AI
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Slow-Moving Inventory Alert - Stox.AI',
    'Identify products with no sales activity in 30+ days',
    'stox',
    'Show me products with no sales in the last 30 days',
    'SELECT
        product_id,
        product_name,
        current_stock,
        unit_cost,
        (current_stock * unit_cost) as inventory_value,
        last_sale_date,
        EXTRACT(DAY FROM (CURRENT_DATE - last_sale_date)) as days_since_last_sale
    FROM inventory_levels
    WHERE last_sale_date < CURRENT_DATE - INTERVAL ''30 days''
    AND current_stock > 0
    ORDER BY inventory_value DESC
    LIMIT 50',
    'postgresql',
    'weekly',
    'medium',
    'days_since_last_sale > 30',
    true
);

-- 5. Delivery Delay Alert - Stox.AI
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Delivery Delay Alert - Stox.AI',
    'Monitor shipments and deliveries delayed beyond threshold',
    'stox',
    'Alert when shipments are delayed more than 2 hours',
    'SELECT
        shipment_id,
        truck_id,
        origin_location,
        destination_location,
        scheduled_arrival,
        estimated_arrival,
        EXTRACT(HOUR FROM (estimated_arrival - scheduled_arrival)) as delay_hours,
        shipment_status
    FROM shipments
    WHERE estimated_arrival > scheduled_arrival
    AND EXTRACT(HOUR FROM (estimated_arrival - scheduled_arrival)) > 2
    AND shipment_status IN (''in-transit'', ''delayed'')
    ORDER BY delay_hours DESC
    LIMIT 50',
    'postgresql',
    'hourly',
    'high',
    'delay_hours > 2',
    true
);

-- ============================================
-- MARGEN.AI TEMPLATES (Margin Intelligence)
-- ============================================

-- 6. Margin Compression Alert - Margen.AI
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Margin Compression Alert - Margen.AI',
    'Alert when gross margin falls below threshold',
    'margen',
    'Alert me when any product or customer margin falls below 15%',
    'SELECT
        product_id,
        product_name,
        customer_name,
        SUM(revenue) as total_revenue,
        SUM(cogs) as total_cogs,
        SUM(revenue - cogs) as gross_profit,
        ROUND((SUM(revenue - cogs)::numeric / NULLIF(SUM(revenue), 0)) * 100, 2) as gross_margin_pct
    FROM csg_data
    WHERE revenue > 0
    GROUP BY product_id, product_name, customer_name
    HAVING (SUM(revenue - cogs)::numeric / NULLIF(SUM(revenue), 0)) * 100 < 15
    ORDER BY gross_margin_pct ASC
    LIMIT 50',
    'postgresql',
    'daily',
    'critical',
    'gross_margin_pct < 15',
    true
);

-- 7. Profitability Risk Alert - Margen.AI
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Profitability Risk Alert - Margen.AI',
    'Identify products or customers generating negative margins',
    'margen',
    'Show me all products or customers with negative gross margin',
    'SELECT
        product_id,
        product_name,
        customer_name,
        distributor_name,
        SUM(revenue) as total_revenue,
        SUM(cogs) as total_cogs,
        SUM(revenue - cogs) as gross_profit,
        ROUND((SUM(revenue - cogs)::numeric / NULLIF(SUM(revenue), 0)) * 100, 2) as gross_margin_pct
    FROM csg_data
    WHERE revenue > 0
    GROUP BY product_id, product_name, customer_name, distributor_name
    HAVING SUM(revenue - cogs) < 0
    ORDER BY gross_profit ASC
    LIMIT 50',
    'postgresql',
    'daily',
    'critical',
    'gross_profit < 0',
    true
);

-- 8. COGS Spike Alert - Margen.AI
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'COGS Spike Alert - Margen.AI',
    'Monitor for significant increases in cost of goods sold',
    'margen',
    'Alert when COGS increases more than 10% compared to prior period',
    'WITH current_period AS (
        SELECT
            product_id,
            product_name,
            SUM(cogs) as current_cogs,
            SUM(quantity) as current_qty
        FROM csg_data
        WHERE transaction_date >= CURRENT_DATE - INTERVAL ''30 days''
        GROUP BY product_id, product_name
    ),
    prior_period AS (
        SELECT
            product_id,
            SUM(cogs) as prior_cogs,
            SUM(quantity) as prior_qty
        FROM csg_data
        WHERE transaction_date >= CURRENT_DATE - INTERVAL ''60 days''
        AND transaction_date < CURRENT_DATE - INTERVAL ''30 days''
        GROUP BY product_id
    )
    SELECT
        c.product_id,
        c.product_name,
        c.current_cogs,
        p.prior_cogs,
        ROUND(((c.current_cogs - p.prior_cogs)::numeric / NULLIF(p.prior_cogs, 0)) * 100, 2) as cogs_change_pct,
        (c.current_cogs - p.prior_cogs) as cogs_change_amt
    FROM current_period c
    JOIN prior_period p ON c.product_id = p.product_id
    WHERE p.prior_cogs > 0
    AND ((c.current_cogs - p.prior_cogs)::numeric / p.prior_cogs) * 100 > 10
    ORDER BY cogs_change_pct DESC
    LIMIT 50',
    'postgresql',
    'daily',
    'high',
    'cogs_change_pct > 10',
    true
);

-- 9. Revenue Target Miss Alert - Margen.AI
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Revenue Target Miss Alert - Margen.AI',
    'Alert when revenue falls below target by more than 5%',
    'margen',
    'Alert when revenue is below target by more than 5%',
    'WITH actual_revenue AS (
        SELECT
            region,
            SUM(revenue) as actual_revenue
        FROM csg_data
        WHERE transaction_date >= DATE_TRUNC(''month'', CURRENT_DATE)
        GROUP BY region
    ),
    target_revenue AS (
        SELECT
            region,
            monthly_target
        FROM revenue_targets
        WHERE target_month = DATE_TRUNC(''month'', CURRENT_DATE)
    )
    SELECT
        a.region,
        a.actual_revenue,
        t.monthly_target as target_revenue,
        (a.actual_revenue - t.monthly_target) as variance,
        ROUND(((a.actual_revenue - t.monthly_target)::numeric / NULLIF(t.monthly_target, 0)) * 100, 2) as variance_pct
    FROM actual_revenue a
    JOIN target_revenue t ON a.region = t.region
    WHERE ((a.actual_revenue - t.monthly_target)::numeric / NULLIF(t.monthly_target, 0)) * 100 < -5
    ORDER BY variance_pct ASC',
    'postgresql',
    'weekly',
    'high',
    'variance_pct < -5',
    true
);

-- 10. Customer Concentration Alert - Margen.AI
INSERT INTO pulse_monitor_templates (
    id, name, description, category,
    natural_language_template, sql_template, data_source,
    default_frequency, default_severity, suggested_alert_condition,
    is_active
) VALUES (
    gen_random_uuid(),
    'Customer Concentration Risk - Margen.AI',
    'Monitor revenue concentration among top customers',
    'margen',
    'Alert when top 10 customers account for more than 60% of revenue',
    'WITH total_revenue AS (
        SELECT SUM(revenue) as total
        FROM csg_data
        WHERE transaction_date >= CURRENT_DATE - INTERVAL ''90 days''
    ),
    top_customers AS (
        SELECT
            customer_name,
            SUM(revenue) as customer_revenue,
            ROW_NUMBER() OVER (ORDER BY SUM(revenue) DESC) as rank
        FROM csg_data
        WHERE transaction_date >= CURRENT_DATE - INTERVAL ''90 days''
        GROUP BY customer_name
    )
    SELECT
        ''Top 10 Customer Concentration'' as metric,
        SUM(tc.customer_revenue) as top10_revenue,
        tr.total as total_revenue,
        ROUND((SUM(tc.customer_revenue)::numeric / NULLIF(tr.total, 0)) * 100, 2) as concentration_pct
    FROM top_customers tc
    CROSS JOIN total_revenue tr
    WHERE tc.rank <= 10
    GROUP BY tr.total
    HAVING (SUM(tc.customer_revenue)::numeric / NULLIF(tr.total, 0)) * 100 > 60',
    'postgresql',
    'monthly',
    'medium',
    'concentration_pct > 60',
    true
);

-- Success message
SELECT 'Successfully inserted 10 Enterprise Pulse templates (5 Stox.AI, 5 Margen.AI)' as result;
