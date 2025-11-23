-- SQL script to fix pulse monitor table references
-- Run this against your customer_analytics PostgreSQL database

-- 1. Fix BigQuery table references (sales_data → dataset.sales_data)
-- Note: Replace 'your_dataset' with your actual BigQuery dataset name
UPDATE pulse_monitors
SET sql_query = REPLACE(sql_query, 'FROM sales_data', 'FROM `your_dataset.sales_data`')
WHERE data_source = 'bigquery'
  AND sql_query LIKE '%FROM sales_data%'
  AND sql_query NOT LIKE '%FROM `%';

UPDATE pulse_monitors
SET sql_query = REPLACE(sql_query, 'FROM "sales_data"', 'FROM `your_dataset.sales_data`')
WHERE data_source = 'bigquery'
  AND sql_query LIKE '%FROM "sales_data"%';

-- 2. Fix PostgreSQL sales table reference (if table is actually csg_data)
UPDATE pulse_monitors
SET sql_query = REPLACE(sql_query, 'FROM sales', 'FROM csg_data')
WHERE data_source = 'postgresql'
  AND sql_query LIKE '%FROM sales%'
  AND sql_query NOT LIKE '%FROM sales_%';  -- Don't replace sales_data

-- 3. Alternative: Disable monitors with missing tables instead of fixing
-- Uncomment if you want to just disable problematic monitors:

-- -- Disable monitors with missing PostgreSQL sales table
-- UPDATE pulse_monitors
-- SET enabled = false
-- WHERE data_source = 'postgresql'
--   AND sql_query LIKE '%FROM sales%'
--   AND sql_query NOT LIKE '%FROM sales_%';

-- -- Disable monitors with unqualified BigQuery tables
-- UPDATE pulse_monitors
-- SET enabled = false
-- WHERE data_source = 'bigquery'
--   AND (sql_query LIKE '%FROM sales_data%' OR sql_query LIKE '%FROM "sales_data"%')
--   AND sql_query NOT LIKE '%FROM `%';

-- 4. View monitors that still have issues
SELECT
    id,
    name,
    data_source,
    enabled,
    LEFT(sql_query, 100) as query_preview
FROM pulse_monitors
WHERE
    (data_source = 'bigquery' AND sql_query NOT LIKE '%FROM `%')
    OR (data_source = 'postgresql' AND sql_query LIKE '%FROM sales%' AND sql_query NOT LIKE '%FROM sales_%')
ORDER BY created_at DESC;
