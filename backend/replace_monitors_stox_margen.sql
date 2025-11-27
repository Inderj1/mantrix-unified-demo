-- Replace existing monitors with Stox.AI and Margen.AI monitors
-- This script deletes all global monitors and creates new ones

BEGIN;

-- Delete existing global monitors
DELETE FROM pulse_monitors WHERE scope = 'global';

-- ============================================
-- STOX.AI MONITORS (5 agents)
-- ============================================

-- 1. Low Stock Alert - Stox.AI
INSERT INTO pulse_monitors (
    user_id, name, description, natural_language_query, sql_query, data_source,
    alert_condition, severity, frequency, enabled, scope, category,
    next_run
) VALUES (
    'global',
    'Low Stock Alert - Stox.AI',
    'Alert when inventory falls below reorder point threshold',
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
    'mantrix_nexxt',
    'current_stock < reorder_point',
    'high',
    'hourly',
    true,
    'global',
    'stox',
    NOW() + INTERVAL '1 hour'
);

-- 2. Stockout Risk Alert - Stox.AI
INSERT INTO pulse_monitors (
    user_id, name, description, natural_language_query, sql_query, data_source,
    alert_condition, severity, frequency, enabled, scope, category,
    next_run
) VALUES (
    'global',
    'Stockout Risk Alert - Stox.AI',
    'Identify products at risk of stockout based on days of supply',
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
    'mantrix_nexxt',
    'days_of_supply < 7',
    'high',
    'daily',
    true,
    'global',
    'stox',
    NOW() + INTERVAL '1 day'
);

-- 3. Overstock Alert - Stox.AI
INSERT INTO pulse_monitors (
    user_id, name, description, natural_language_query, sql_query, data_source,
    alert_condition, severity, frequency, enabled, scope, category,
    next_run
) VALUES (
    'global',
    'Overstock Alert - Stox.AI',
    'Identify items exceeding warehouse capacity thresholds',
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
    'mantrix_nexxt',
    'capacity_pct > 90',
    'medium',
    'weekly',
    true,
    'global',
    'stox',
    NOW() + INTERVAL '1 week'
);

-- 4. Slow-Moving Inventory Alert - Stox.AI
INSERT INTO pulse_monitors (
    user_id, name, description, natural_language_query, sql_query, data_source,
    alert_condition, severity, frequency, enabled, scope, category,
    next_run
) VALUES (
    'global',
    'Slow-Moving Inventory Alert - Stox.AI',
    'Identify products with no sales activity in 30+ days',
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
    'mantrix_nexxt',
    'days_since_last_sale > 30',
    'medium',
    'weekly',
    true,
    'global',
    'stox',
    NOW() + INTERVAL '1 week'
);

-- 5. Delivery Delay Alert - Stox.AI
INSERT INTO pulse_monitors (
    user_id, name, description, natural_language_query, sql_query, data_source,
    alert_condition, severity, frequency, enabled, scope, category,
    next_run
) VALUES (
    'global',
    'Delivery Delay Alert - Stox.AI',
    'Monitor shipments and deliveries delayed beyond threshold',
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
    'mantrix_nexxt',
    'delay_hours > 2',
    'high',
    'hourly',
    true,
    'global',
    'stox',
    NOW() + INTERVAL '1 hour'
);

-- ============================================
-- MARGEN.AI MONITORS (5 agents)
-- ============================================

-- 6. Margin Compression Alert - Margen.AI
INSERT INTO pulse_monitors (
    user_id, name, description, natural_language_query, sql_query, data_source,
    alert_condition, severity, frequency, enabled, scope, category,
    next_run
) VALUES (
    'global',
    'Margin Compression Alert - Margen.AI',
    'Alert when gross margin falls below threshold',
    'Alert me when any product or customer margin falls below 15%',
    'SELECT
        item_description as product_name,
        surgeon_name as customer_name,
        SUM(ext_sales) as total_revenue,
        SUM(cogs_amount) as total_cogs,
        SUM(ext_sales - cogs_amount) as gross_profit,
        ROUND((SUM(ext_sales - cogs_amount)::numeric / NULLIF(SUM(ext_sales), 0)) * 100, 2) as gross_margin_pct
    FROM csg_data
    WHERE ext_sales > 0
    GROUP BY item_description, surgeon_name
    HAVING (SUM(ext_sales - cogs_amount)::numeric / NULLIF(SUM(ext_sales), 0)) * 100 < 15
    ORDER BY gross_margin_pct ASC
    LIMIT 50',
    'mantrix_nexxt',
    'gross_margin_pct < 15',
    'high',
    'daily',
    true,
    'global',
    'margen',
    NOW() + INTERVAL '1 day'
);

-- 7. Profitability Risk Alert - Margen.AI
INSERT INTO pulse_monitors (
    user_id, name, description, natural_language_query, sql_query, data_source,
    alert_condition, severity, frequency, enabled, scope, category,
    next_run
) VALUES (
    'global',
    'Profitability Risk Alert - Margen.AI',
    'Identify products or customers generating negative margins',
    'Show me all products or customers with negative gross margin',
    'SELECT
        item_description as product_name,
        surgeon_name as customer_name,
        distributor_name,
        SUM(ext_sales) as total_revenue,
        SUM(cogs_amount) as total_cogs,
        SUM(ext_sales - cogs_amount) as gross_profit,
        ROUND((SUM(ext_sales - cogs_amount)::numeric / NULLIF(SUM(ext_sales), 0)) * 100, 2) as gross_margin_pct
    FROM csg_data
    WHERE ext_sales > 0
    GROUP BY item_description, surgeon_name, distributor_name
    HAVING SUM(ext_sales - cogs_amount) < 0
    ORDER BY gross_profit ASC
    LIMIT 50',
    'mantrix_nexxt',
    'gross_profit < 0',
    'high',
    'daily',
    true,
    'global',
    'margen',
    NOW() + INTERVAL '1 day'
);

-- 8. COGS Spike Alert - Margen.AI
INSERT INTO pulse_monitors (
    user_id, name, description, natural_language_query, sql_query, data_source,
    alert_condition, severity, frequency, enabled, scope, category,
    next_run
) VALUES (
    'global',
    'COGS Spike Alert - Margen.AI',
    'Monitor for significant increases in cost of goods sold',
    'Alert when COGS increases more than 10% compared to prior period',
    'WITH current_period AS (
        SELECT
            item_description as product_name,
            SUM(cogs_amount) as current_cogs,
            SUM(qty) as current_qty
        FROM csg_data
        WHERE invoice_date >= CURRENT_DATE - INTERVAL ''30 days''
        GROUP BY item_description
    ),
    prior_period AS (
        SELECT
            item_description as product_name,
            SUM(cogs_amount) as prior_cogs,
            SUM(qty) as prior_qty
        FROM csg_data
        WHERE invoice_date >= CURRENT_DATE - INTERVAL ''60 days''
        AND invoice_date < CURRENT_DATE - INTERVAL ''30 days''
        GROUP BY item_description
    )
    SELECT
        c.product_name,
        c.current_cogs,
        p.prior_cogs,
        ROUND(((c.current_cogs - p.prior_cogs)::numeric / NULLIF(p.prior_cogs, 0)) * 100, 2) as cogs_change_pct,
        (c.current_cogs - p.prior_cogs) as cogs_change_amt
    FROM current_period c
    JOIN prior_period p ON c.product_name = p.product_name
    WHERE p.prior_cogs > 0
    AND ((c.current_cogs - p.prior_cogs)::numeric / p.prior_cogs) * 100 > 10
    ORDER BY cogs_change_pct DESC
    LIMIT 50',
    'mantrix_nexxt',
    'cogs_change_pct > 10',
    'high',
    'daily',
    true,
    'global',
    'margen',
    NOW() + INTERVAL '1 day'
);

-- 9. Revenue by Region Alert - Margen.AI
INSERT INTO pulse_monitors (
    user_id, name, description, natural_language_query, sql_query, data_source,
    alert_condition, severity, frequency, enabled, scope, category,
    next_run
) VALUES (
    'global',
    'Revenue by Region Alert - Margen.AI',
    'Monitor regional revenue performance and variances',
    'Show me revenue by region with top performers',
    'SELECT
        region,
        COUNT(DISTINCT surgeon_name) as customers,
        COUNT(DISTINCT item_description) as products,
        SUM(ext_sales) as total_revenue,
        SUM(cogs_amount) as total_cogs,
        SUM(ext_sales - cogs_amount) as gross_profit,
        ROUND((SUM(ext_sales - cogs_amount)::numeric / NULLIF(SUM(ext_sales), 0)) * 100, 2) as margin_pct
    FROM csg_data
    WHERE invoice_date >= CURRENT_DATE - INTERVAL ''30 days''
    GROUP BY region
    ORDER BY total_revenue DESC',
    'mantrix_nexxt',
    'margin_pct < 20',
    'medium',
    'weekly',
    true,
    'global',
    'margen',
    NOW() + INTERVAL '1 week'
);

-- 10. Top Distributors Performance - Margen.AI
INSERT INTO pulse_monitors (
    user_id, name, description, natural_language_query, sql_query, data_source,
    alert_condition, severity, frequency, enabled, scope, category,
    next_run
) VALUES (
    'global',
    'Top Distributors Performance - Margen.AI',
    'Monitor top distributor performance and margins',
    'Show me top distributors by revenue and margin',
    'SELECT
        distributor_name,
        COUNT(DISTINCT surgeon_name) as customers_served,
        SUM(qty) as total_units,
        SUM(ext_sales) as total_revenue,
        SUM(cogs_amount) as total_cogs,
        SUM(ext_sales - cogs_amount) as gross_profit,
        ROUND((SUM(ext_sales - cogs_amount)::numeric / NULLIF(SUM(ext_sales), 0)) * 100, 2) as margin_pct
    FROM csg_data
    WHERE invoice_date >= CURRENT_DATE - INTERVAL ''90 days''
    GROUP BY distributor_name
    ORDER BY total_revenue DESC
    LIMIT 20',
    'mantrix_nexxt',
    'margin_pct < 15',
    'medium',
    'weekly',
    true,
    'global',
    'margen',
    NOW() + INTERVAL '1 week'
);

COMMIT;

-- Success message
SELECT 'Successfully replaced monitors with 10 Stox.AI and Margen.AI agents' as result;
SELECT name, category, severity, frequency FROM pulse_monitors WHERE scope = 'global' ORDER BY category, name;
