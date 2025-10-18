"""Financial analysis queries extracted from reference images with GL accounting concepts."""

FINANCIAL_ANALYSIS_QUERIES = [
    # ========== Profitability & Margin Questions (Query3.jpeg) ==========
    {
        "question": "What is my gross margin by product line?",
        "sql": """SELECT 
    Material_Group as Product_Line,
    MAX(Material_Group_Description) as Product_Line_Description,
    COUNT(DISTINCT Material_Number) as Product_Count,
    COUNT(DISTINCT Customer) as Customer_Count,
    
    -- Revenue calculation using proper revenue columns
    ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Total_Revenue,
    
    -- COGS (GL debit entries related to cost of sales)
    ROUND(SUM(Total_COGS), 2) as Total_COGS,
    
    -- Gross Profit = Revenue - COGS
    ROUND(SUM(COALESCE(Gross_Revenue, 0)) - SUM(Total_COGS), 2) as Gross_Profit,
    
    -- Gross Margin % = (Revenue - COGS) / Revenue * 100
    ROUND(AVG(Sales_Margin_of_Gross_Sales), 2) as Avg_Gross_Margin_Pct,
    
    -- Calculated margin for verification
    ROUND(SAFE_DIVIDE(
        SUM(COALESCE(Gross_Revenue, 0)) - SUM(Total_COGS),
        SUM(COALESCE(Gross_Revenue, 0))
    ) * 100, 2) as Calculated_Margin_Pct
    
FROM `{project}.{dataset}.{table}`
WHERE Material_Group IS NOT NULL
    AND Fiscal_Year = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
GROUP BY Material_Group
HAVING SUM(COALESCE(Gross_Revenue, 0)) > 0
ORDER BY Gross_Profit DESC""",
        "explanation": "Calculate gross margin by product line using GL accounting principles: Revenue (credit entries) minus COGS (debit entries)"
    },
    
    {
        "question": "Which customers are the most profitable?",
        "sql": """WITH customer_profitability AS (
    SELECT 
        Customer,
        MAX(Payer_Name) as Customer_Name,
        COUNT(DISTINCT BILLINGDOCUMENT) as Invoice_Count,
        
        -- Revenue from GL credits
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Total_Revenue,
        
        -- Direct costs (COGS)
        ROUND(SUM(Total_COGS), 2) as Total_COGS,
        
        -- Operating expenses allocation (simplified)
        ROUND(SUM(Total_COS) - SUM(Total_COGS), 2) as Operating_Expenses,
        
        -- Gross Profit
        ROUND(SUM(COALESCE(Gross_Revenue, 0)) - SUM(Total_COGS), 2) as Gross_Profit,
        
        -- Net Profit (after operating expenses)
        ROUND(SUM(COALESCE(Gross_Revenue, 0)) - SUM(Total_COS), 2) as Net_Profit,
        
        -- Profitability metrics
        ROUND(AVG(Sales_Margin_of_Gross_Sales), 2) as Avg_Gross_Margin_Pct,
        ROUND(AVG(Sales_Margin_of_Net_Sales), 2) as Avg_Net_Margin_Pct
        
    FROM `{project}.{dataset}.{table}`
    WHERE Customer IS NOT NULL
        AND Fiscal_Year = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
    GROUP BY Customer
)
SELECT *,
    -- Profitability ranking
    RANK() OVER (ORDER BY Net_Profit DESC) as Profitability_Rank,
    -- Profit per invoice
    ROUND(Net_Profit / NULLIF(Invoice_Count, 0), 2) as Profit_Per_Invoice
FROM customer_profitability
WHERE Total_Revenue > 0
ORDER BY Net_Profit DESC
LIMIT 20""",
        "explanation": "Identify most profitable customers using full P&L analysis including gross and net margins"
    },
    
    {
        "question": "What is the gross margin trend over the last 12 months?",
        "sql": """WITH monthly_margins AS (
    SELECT 
        EXTRACT(YEAR FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))) as Year,
        EXTRACT(MONTH FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))) as Month,
        FORMAT_DATE('%Y-%m', PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))) as Year_Month,
        
        -- Monthly revenue
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Monthly_Revenue,
        
        -- Monthly COGS
        ROUND(SUM(Total_COGS), 2) as Monthly_COGS,
        
        -- Gross Profit
        ROUND(SUM(COALESCE(Gross_Revenue, 0)) - SUM(Total_COGS), 2) as Gross_Profit,
        
        -- Average margin %
        ROUND(AVG(Sales_Margin_of_Gross_Sales), 2) as Avg_Gross_Margin_Pct,
        
        -- Transaction count for context
        COUNT(*) as Transaction_Count
        
    FROM `{project}.{dataset}.{table}`
    WHERE Posting_Date IS NOT NULL
        AND PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING)) >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
    GROUP BY Year, Month, Year_Month
)
SELECT 
    Year_Month,
    Monthly_Revenue,
    Monthly_COGS,
    Gross_Profit,
    Avg_Gross_Margin_Pct,
    -- Month-over-month change
    LAG(Avg_Gross_Margin_Pct) OVER (ORDER BY Year_Month) as Previous_Month_Margin,
    ROUND(Avg_Gross_Margin_Pct - LAG(Avg_Gross_Margin_Pct) OVER (ORDER BY Year_Month), 2) as MoM_Change,
    Transaction_Count
FROM monthly_margins
ORDER BY Year_Month""",
        "explanation": "Track gross margin trend over 12 months with month-over-month changes"
    },
    
    {
        "question": "How does margin vary by sales region or channel?",
        "sql": """SELECT 
    Sales_Region,
    MAX(Sales_Region_Description) as Region_Description,
    Distribution_Channel,
    COUNT(DISTINCT Customer) as Customer_Count,
    COUNT(*) as Transaction_Count,
    
    -- Revenue by region/channel
    ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Total_Revenue,
    
    -- COGS
    ROUND(SUM(Total_COGS), 2) as Total_COGS,
    
    -- Gross metrics
    ROUND(SUM(COALESCE(Gross_Revenue, 0)) - SUM(Total_COGS), 2) as Gross_Profit,
    ROUND(AVG(Sales_Margin_of_Gross_Sales), 2) as Avg_Gross_Margin_Pct,
    
    -- Variability metrics
    ROUND(MIN(Sales_Margin_of_Gross_Sales), 2) as Min_Margin_Pct,
    ROUND(MAX(Sales_Margin_of_Gross_Sales), 2) as Max_Margin_Pct,
    ROUND(STDDEV(Sales_Margin_of_Gross_Sales), 2) as Margin_StdDev
    
FROM `{project}.{dataset}.{table}`
WHERE Sales_Region IS NOT NULL 
    AND Distribution_Channel IS NOT NULL
GROUP BY Sales_Region, Distribution_Channel
HAVING COUNT(*) > 100  -- Meaningful sample size
ORDER BY Sales_Region, Avg_Gross_Margin_Pct DESC""",
        "explanation": "Analyze margin variation by sales region and distribution channel"
    },
    
    {
        "question": "Which SKUs are below the target contribution margin?",
        "sql": """WITH sku_margins AS (
    SELECT 
        Material_Number as SKU,
        MAX(Material_Description) as SKU_Description,
        Material_Group,
        COUNT(DISTINCT Customer) as Customer_Count,
        COUNT(*) as Transaction_Count,
        
        -- Revenue
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Total_Revenue,
        
        -- Variable costs (COGS)
        ROUND(SUM(Total_COGS), 2) as Variable_Costs,
        
        -- Contribution Margin = Revenue - Variable Costs
        ROUND(SUM(COALESCE(Gross_Revenue, 0)) - SUM(Total_COGS), 2) as Contribution_Margin,
        
        -- Contribution Margin %
        ROUND(AVG(Sales_Margin_of_Gross_Sales), 2) as Avg_Contribution_Margin_Pct
        
    FROM `{project}.{dataset}.{table}`
    WHERE Material_Number IS NOT NULL
        AND Fiscal_Year = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
    GROUP BY Material_Number, Material_Group
    HAVING COUNT(*) >= 10  -- Minimum transactions for reliability
)
SELECT *,
    -- Flag SKUs below 25% target margin (adjust as needed)
    CASE 
        WHEN Avg_Contribution_Margin_Pct < 25 THEN 'Below Target'
        WHEN Avg_Contribution_Margin_Pct < 30 THEN 'Near Target'
        ELSE 'Above Target'
    END as Margin_Status
FROM sku_margins
WHERE Avg_Contribution_Margin_Pct < 30  -- Show all below/near target
ORDER BY Avg_Contribution_Margin_Pct ASC""",
        "explanation": "Identify SKUs with contribution margin below target threshold (25%)"
    },
    
    # ========== Cost Breakdown & COGS (Query3.jpeg continued) ==========
    {
        "question": "What are my top 5 cost drivers in COGS?",
        "sql": """WITH cost_components AS (
    SELECT 
        'Material Costs' as Cost_Driver,
        ROUND(SUM(Total_COGM), 2) as Total_Cost,
        ROUND(AVG(Total_COGM / NULLIF(Total_COGS, 0) * 100), 2) as Pct_of_COGS
    FROM `{project}.{dataset}.{table}`
    WHERE Total_COGM > 0 AND Total_COGS > 0
    
    UNION ALL
    
    SELECT 
        'Freight & Delivery' as Cost_Driver,
        ROUND(SUM(TL_Delivery_Costs + Incoming_Freight_Var), 2) as Total_Cost,
        ROUND(AVG((TL_Delivery_Costs + Incoming_Freight_Var) / NULLIF(Total_COGS, 0) * 100), 2) as Pct_of_COGS
    FROM `{project}.{dataset}.{table}`
    WHERE Total_COGS > 0
    
    UNION ALL
    
    SELECT 
        'Packaging' as Cost_Driver,
        ROUND(SUM(Packaging), 2) as Total_Cost,
        ROUND(AVG(Packaging / NULLIF(Total_COGS, 0) * 100), 2) as Pct_of_COGS
    FROM `{project}.{dataset}.{table}`
    WHERE Packaging > 0 AND Total_COGS > 0
    
    UNION ALL
    
    SELECT 
        'Warehouse & Storage' as Cost_Driver,
        ROUND(SUM(ABS(Warehouse_AND_Storage_Abs_Var)), 2) as Total_Cost,
        ROUND(AVG(ABS(Warehouse_AND_Storage_Abs_Var) / NULLIF(Total_COGS, 0) * 100), 2) as Pct_of_COGS
    FROM `{project}.{dataset}.{table}`
    WHERE Warehouse_AND_Storage_Abs_Var != 0 AND Total_COGS > 0
    
    UNION ALL
    
    SELECT 
        'Purchase Price Variance' as Cost_Driver,
        ROUND(SUM(ABS(Purchase_Price_Variance)), 2) as Total_Cost,
        ROUND(AVG(ABS(Purchase_Price_Variance) / NULLIF(Total_COGS, 0) * 100), 2) as Pct_of_COGS
    FROM `{project}.{dataset}.{table}`
    WHERE Purchase_Price_Variance != 0 AND Total_COGS > 0
)
SELECT 
    Cost_Driver,
    Total_Cost,
    Pct_of_COGS,
    ROUND(Total_Cost / SUM(Total_Cost) OVER () * 100, 2) as Pct_of_Total
FROM cost_components
WHERE Total_Cost > 0
ORDER BY Total_Cost DESC
LIMIT 5""",
        "explanation": "Identify top 5 cost drivers within COGS using GL cost components"
    },
    
    {
        "question": "Has the material cost increased this quarter vs. last quarter?",
        "sql": """WITH quarterly_costs AS (
    SELECT 
        EXTRACT(YEAR FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))) as Year,
        EXTRACT(QUARTER FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))) as Quarter,
        CONCAT(EXTRACT(YEAR FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))), 
               '-Q', EXTRACT(QUARTER FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING)))) as Year_Quarter,
        
        -- Material costs (COGM = Cost of Goods Manufactured)
        ROUND(SUM(Total_COGM), 2) as Total_Material_Cost,
        ROUND(AVG(Total_COGM), 2) as Avg_Material_Cost_Per_Transaction,
        
        -- As percentage of revenue
        ROUND(SUM(Total_COGM) / NULLIF(SUM(COALESCE(Gross_Revenue, 0)), 0) * 100, 2) as Material_Cost_Pct_Revenue,
        
        COUNT(*) as Transaction_Count
        
    FROM `{project}.{dataset}.{table}`
    WHERE Posting_Date IS NOT NULL
        AND Total_COGM > 0
        AND PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING)) >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
    GROUP BY Year, Quarter, Year_Quarter
)
SELECT 
    Year_Quarter,
    Total_Material_Cost,
    Avg_Material_Cost_Per_Transaction,
    Material_Cost_Pct_Revenue,
    -- Quarter-over-quarter comparison
    LAG(Total_Material_Cost) OVER (ORDER BY Year_Quarter) as Previous_Quarter_Cost,
    ROUND(Total_Material_Cost - LAG(Total_Material_Cost) OVER (ORDER BY Year_Quarter), 2) as QoQ_Change,
    ROUND((Total_Material_Cost - LAG(Total_Material_Cost) OVER (ORDER BY Year_Quarter)) / 
          NULLIF(LAG(Total_Material_Cost) OVER (ORDER BY Year_Quarter), 0) * 100, 2) as QoQ_Change_Pct,
    Transaction_Count
FROM quarterly_costs
ORDER BY Year_Quarter DESC""",
        "explanation": "Compare material costs quarter-over-quarter with percentage changes"
    },
    
    {
        "question": "How much did freight costs contribute to total COGS last month?",
        "sql": """WITH last_month_freight AS (
    SELECT 
        FORMAT_DATE('%Y-%m', PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))) as Month,
        
        -- Freight cost components
        ROUND(SUM(TL_Delivery_Costs), 2) as Delivery_Costs,
        ROUND(SUM(Incoming_Freight_Var), 2) as Incoming_Freight_Variance,
        ROUND(SUM(TL_Delivery_Costs + Incoming_Freight_Var), 2) as Total_Freight_Costs,
        
        -- Total COGS
        ROUND(SUM(Total_COGS), 2) as Total_COGS,
        
        -- Freight as % of COGS
        ROUND(SUM(TL_Delivery_Costs + Incoming_Freight_Var) / NULLIF(SUM(Total_COGS), 0) * 100, 2) as Freight_Pct_of_COGS,
        
        COUNT(*) as Transaction_Count
        
    FROM `{project}.{dataset}.{table}`
    WHERE Posting_Date IS NOT NULL
        AND PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING)) >= DATE_SUB(DATE_TRUNC(CURRENT_DATE(), MONTH), INTERVAL 1 MONTH)
        AND PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING)) < DATE_TRUNC(CURRENT_DATE(), MONTH)
    GROUP BY Month
)
SELECT 
    Month as Last_Month,
    Delivery_Costs,
    Incoming_Freight_Variance,
    Total_Freight_Costs,
    Total_COGS,
    Freight_Pct_of_COGS,
    Transaction_Count,
    -- Additional breakdown
    ROUND(Delivery_Costs / NULLIF(Total_Freight_Costs, 0) * 100, 2) as Delivery_Pct_of_Freight,
    ROUND(Incoming_Freight_Variance / NULLIF(Total_Freight_Costs, 0) * 100, 2) as Variance_Pct_of_Freight
FROM last_month_freight""",
        "explanation": "Calculate freight costs contribution to COGS for last month"
    },
    
    {
        "question": "What's the average unit cost for Product X?",
        "sql": """-- Replace 'PRODUCT_X_ID' with actual product ID
WITH product_costs AS (
    SELECT 
        Material_Number,
        Material_Description,
        Material_Base_Unit,
        
        -- Average costs per unit
        ROUND(AVG(Total_COGS), 2) as Avg_Total_Cost,
        ROUND(AVG(Total_COGM), 2) as Avg_Material_Cost,
        ROUND(AVG(Packaging), 2) as Avg_Packaging_Cost,
        ROUND(AVG(TL_Delivery_Costs), 2) as Avg_Delivery_Cost,
        
        -- Cost breakdown
        ROUND(AVG(Total_COGM / NULLIF(Total_COGS, 0) * 100), 2) as Material_Pct,
        ROUND(AVG(Packaging / NULLIF(Total_COGS, 0) * 100), 2) as Packaging_Pct,
        ROUND(AVG(TL_Delivery_Costs / NULLIF(Total_COGS, 0) * 100), 2) as Delivery_Pct,
        
        -- Statistics
        COUNT(*) as Transaction_Count,
        ROUND(MIN(Total_COGS), 2) as Min_Cost,
        ROUND(MAX(Total_COGS), 2) as Max_Cost,
        ROUND(STDDEV(Total_COGS), 2) as Cost_StdDev
        
    FROM `{project}.{dataset}.{table}`
    WHERE Material_Number = 'PRODUCT_X_ID'  -- Replace with actual product
        OR LOWER(Material_Description) LIKE '%product x%'  -- Or search by name
    GROUP BY Material_Number, Material_Description, Material_Base_Unit
)
SELECT * FROM product_costs
ORDER BY Transaction_Count DESC
LIMIT 10""",
        "explanation": "Calculate average unit cost with breakdown for specific product"
    },
    
    {
        "question": "Which vendors have the highest impact on cost structure?",
        "sql": """WITH vendor_impact AS (
    SELECT 
        Vendor_lifnr as Vendor_ID,
        MAX(VendorName) as Vendor_Name,
        COUNT(DISTINCT Material_Number) as Product_Count,
        COUNT(*) as Transaction_Count,
        
        -- Total costs associated with vendor
        ROUND(SUM(Total_COGS), 2) as Total_Vendor_COGS,
        ROUND(AVG(Total_COGS), 2) as Avg_Transaction_Cost,
        
        -- Cost variances (indicating pricing volatility)
        ROUND(SUM(ABS(Purchase_Price_Variance)), 2) as Total_Price_Variance,
        ROUND(AVG(Purchase_Price_Variance), 2) as Avg_Price_Variance,
        
        -- Percentage of total company COGS
        ROUND(SUM(Total_COGS) / (SELECT SUM(Total_COGS) FROM `{project}.{dataset}.{table}`) * 100, 2) as Pct_of_Total_COGS,
        
        -- Quality metrics (using variances as proxy)
        ROUND(SUM(ABS(Subcontracting_Var_Check)), 2) as Quality_Variances
        
    FROM `{project}.{dataset}.{table}`
    WHERE Vendor_lifnr IS NOT NULL
        AND Fiscal_Year = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
    GROUP BY Vendor_ID
)
SELECT 
    *,
    -- Vendor risk score (combination of size and variance)
    ROUND(Pct_of_Total_COGS * (1 + ABS(Avg_Price_Variance) / 1000), 2) as Cost_Impact_Score
FROM vendor_impact
WHERE Total_Vendor_COGS > 0
ORDER BY Cost_Impact_Score DESC
LIMIT 20""",
        "explanation": "Identify vendors with highest impact on cost structure based on volume and price variance"
    },
    
    # ========== Variance Analysis (Query2.jpeg) ==========
    {
        "question": "What was the variance between budgeted and actual gross margin?",
        "sql": """-- Note: This assumes budget data is stored in a separate table or as a field
-- This query shows actual margins and would need budget data integration
WITH actual_margins AS (
    SELECT 
        Fiscal_Year,
        EXTRACT(MONTH FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))) as Month,
        
        -- Actual revenue and costs
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Actual_Revenue,
        ROUND(SUM(Total_COGS), 2) as Actual_COGS,
        
        -- Actual gross margin
        ROUND(AVG(Sales_Margin_of_Gross_Sales), 2) as Actual_Gross_Margin_Pct,
        
        -- Assuming budget margin target of 40% (adjust based on actual budget)
        40.0 as Budget_Gross_Margin_Pct
        
    FROM `{project}.{dataset}.{table}`
    WHERE Fiscal_Year = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
    GROUP BY Fiscal_Year, Month
)
SELECT 
    Fiscal_Year,
    Month,
    Actual_Revenue,
    Actual_COGS,
    Actual_Gross_Margin_Pct,
    Budget_Gross_Margin_Pct,
    ROUND(Actual_Gross_Margin_Pct - Budget_Gross_Margin_Pct, 2) as Margin_Variance,
    CASE 
        WHEN Actual_Gross_Margin_Pct >= Budget_Gross_Margin_Pct THEN 'Favorable'
        ELSE 'Unfavorable'
    END as Variance_Type,
    -- Revenue needed to achieve budget margin
    ROUND(Actual_COGS / (1 - Budget_Gross_Margin_Pct/100), 2) as Revenue_for_Budget_Margin
FROM actual_margins
ORDER BY Fiscal_Year, Month""",
        "explanation": "Calculate variance between actual and budgeted gross margin (requires budget data integration)"
    },
    
    {
        "question": "Why did margin dip in April?",
        "sql": """WITH april_analysis AS (
    SELECT 
        EXTRACT(MONTH FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))) as Month,
        Material_Group,
        Sales_Region,
        
        -- Revenue and costs
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Revenue,
        ROUND(SUM(Total_COGS), 2) as COGS,
        ROUND(AVG(Sales_Margin_of_Gross_Sales), 2) as Gross_Margin_Pct,
        
        -- Cost components for analysis
        ROUND(AVG(Total_COGM), 2) as Avg_Material_Cost,
        ROUND(AVG(TL_Delivery_Costs), 2) as Avg_Freight_Cost,
        ROUND(AVG(Purchase_Price_Variance), 2) as Avg_Price_Variance,
        
        COUNT(*) as Transaction_Count
        
    FROM `{project}.{dataset}.{table}`
    WHERE EXTRACT(YEAR FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))) = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
        AND EXTRACT(MONTH FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))) IN (3, 4, 5)  -- March, April, May
    GROUP BY Month, Material_Group, Sales_Region
),
april_comparison AS (
    SELECT 
        Material_Group,
        Sales_Region,
        -- April metrics
        MAX(CASE WHEN Month = 4 THEN Gross_Margin_Pct END) as April_Margin,
        MAX(CASE WHEN Month = 4 THEN Avg_Material_Cost END) as April_Material_Cost,
        MAX(CASE WHEN Month = 4 THEN Avg_Price_Variance END) as April_Price_Variance,
        -- March metrics for comparison
        MAX(CASE WHEN Month = 3 THEN Gross_Margin_Pct END) as March_Margin,
        MAX(CASE WHEN Month = 3 THEN Avg_Material_Cost END) as March_Material_Cost,
        -- Calculate changes
        MAX(CASE WHEN Month = 4 THEN Gross_Margin_Pct END) - 
        MAX(CASE WHEN Month = 3 THEN Gross_Margin_Pct END) as Margin_Change
    FROM april_analysis
    GROUP BY Material_Group, Sales_Region
)
SELECT 
    Material_Group,
    Sales_Region,
    April_Margin,
    March_Margin,
    ROUND(Margin_Change, 2) as Margin_Drop,
    ROUND(April_Material_Cost - March_Material_Cost, 2) as Material_Cost_Increase,
    April_Price_Variance,
    -- Identify main driver
    CASE 
        WHEN April_Material_Cost > March_Material_Cost * 1.05 THEN 'Material Cost Increase'
        WHEN April_Price_Variance < -100 THEN 'Negative Price Variance'
        ELSE 'Other Factors'
    END as Likely_Cause
FROM april_comparison
WHERE Margin_Change < 0  -- Only show segments with margin drops
ORDER BY Margin_Change ASC
LIMIT 20""",
        "explanation": "Analyze factors contributing to margin dip in April by comparing with previous month"
    },
    
    # ========== Regional & Segment Analysis (Query2.jpeg & Query4.jpeg) ==========
    {
        "question": "Which region saw the biggest drop in profitability vs. last quarter?",
        "sql": """WITH quarterly_regional_profit AS (
    SELECT 
        Sales_Region,
        EXTRACT(YEAR FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))) as Year,
        EXTRACT(QUARTER FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))) as Quarter,
        CONCAT(EXTRACT(YEAR FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))), 
               '-Q', EXTRACT(QUARTER FROM PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING)))) as Year_Quarter,
        
        -- Profitability metrics
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Revenue,
        ROUND(SUM(Total_COGS), 2) as COGS,
        ROUND(SUM(Total_COS), 2) as Total_Cost_of_Sales,
        ROUND(SUM(COALESCE(Gross_Revenue, 0)) - SUM(Total_COS), 2) as Net_Profit,
        ROUND(AVG(Sales_Margin_of_Net_Sales), 2) as Avg_Net_Margin_Pct
        
    FROM `{project}.{dataset}.{table}`
    WHERE Sales_Region IS NOT NULL
        AND PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING)) >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
    GROUP BY Sales_Region, Year, Quarter, Year_Quarter
),
regional_comparison AS (
    SELECT 
        Sales_Region,
        Year_Quarter,
        Net_Profit,
        Avg_Net_Margin_Pct,
        -- Get previous quarter metrics
        LAG(Net_Profit) OVER (PARTITION BY Sales_Region ORDER BY Year_Quarter) as Prev_Quarter_Profit,
        LAG(Avg_Net_Margin_Pct) OVER (PARTITION BY Sales_Region ORDER BY Year_Quarter) as Prev_Quarter_Margin
    FROM quarterly_regional_profit
)
SELECT 
    Sales_Region,
    Year_Quarter as Current_Quarter,
    Net_Profit as Current_Profit,
    Prev_Quarter_Profit,
    ROUND(Net_Profit - Prev_Quarter_Profit, 2) as Profit_Change,
    ROUND((Net_Profit - Prev_Quarter_Profit) / NULLIF(Prev_Quarter_Profit, 0) * 100, 2) as Profit_Change_Pct,
    Avg_Net_Margin_Pct as Current_Margin,
    Prev_Quarter_Margin,
    ROUND(Avg_Net_Margin_Pct - Prev_Quarter_Margin, 2) as Margin_Change
FROM regional_comparison
WHERE Prev_Quarter_Profit IS NOT NULL
    AND Year_Quarter = (SELECT MAX(Year_Quarter) FROM quarterly_regional_profit)
ORDER BY Profit_Change ASC
LIMIT 1""",
        "explanation": "Identify region with biggest profitability drop compared to previous quarter"
    },
    
    {
        "question": "What market segments are driving our profit?",
        "sql": """WITH segment_profitability AS (
    SELECT 
        -- Multiple segmentation dimensions
        CONCAT(Sales_Region, ' - ', Material_Group, ' - ', Distribution_Channel) as Market_Segment,
        Sales_Region,
        Material_Group,
        Distribution_Channel,
        
        -- Customer metrics
        COUNT(DISTINCT Customer) as Customer_Count,
        
        -- Financial metrics
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Revenue,
        ROUND(SUM(Total_COGS), 2) as COGS,
        ROUND(SUM(Total_COS), 2) as Total_Costs,
        ROUND(SUM(COALESCE(Gross_Revenue, 0)) - SUM(Total_COS), 2) as Net_Profit,
        
        -- Margin metrics
        ROUND(AVG(Sales_Margin_of_Gross_Sales), 2) as Avg_Gross_Margin,
        ROUND(AVG(Sales_Margin_of_Net_Sales), 2) as Avg_Net_Margin,
        
        -- Volume metrics
        COUNT(*) as Transaction_Count
        
    FROM `{project}.{dataset}.{table}`
    WHERE Sales_Region IS NOT NULL
        AND Material_Group IS NOT NULL
        AND Distribution_Channel IS NOT NULL
        AND Fiscal_Year = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
    GROUP BY Sales_Region, Material_Group, Distribution_Channel
)
SELECT 
    Market_Segment,
    Sales_Region,
    Material_Group,
    Distribution_Channel,
    Customer_Count,
    Revenue,
    Net_Profit,
    Avg_Net_Margin,
    -- Contribution to total profit
    ROUND(Net_Profit / SUM(Net_Profit) OVER () * 100, 2) as Profit_Contribution_Pct,
    -- Rank by profit contribution
    RANK() OVER (ORDER BY Net_Profit DESC) as Profit_Rank,
    -- Efficiency metric (profit per customer)
    ROUND(Net_Profit / NULLIF(Customer_Count, 0), 2) as Profit_Per_Customer
FROM segment_profitability
WHERE Net_Profit > 0
ORDER BY Net_Profit DESC
LIMIT 20""",
        "explanation": "Identify market segments (region x product x channel) driving profit using COPA profitability segments"
    },
    
    # ========== Contribution Margin Analysis (Query4.jpeg) ==========
    {
        "question": "What's the contribution margin of each product or customer?",
        "sql": """WITH contribution_analysis AS (
    SELECT 
        Material_Number as Product,
        MAX(Material_Description) as Product_Description,
        Customer,
        MAX(Payer_Name) as Customer_Name,
        
        -- Revenue
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Revenue,
        
        -- Variable costs breakdown (from COPA value fields)
        ROUND(SUM(Total_COGM), 2) as Material_Cost,
        ROUND(SUM(Packaging), 2) as Packaging_Cost,
        ROUND(SUM(TL_Delivery_Costs + Incoming_Freight_Var), 2) as Freight_Cost,
        ROUND(SUM(Total_COGM + Packaging + TL_Delivery_Costs + Incoming_Freight_Var), 2) as Total_Variable_Cost,
        
        -- Contribution margin
        ROUND(SUM(COALESCE(Gross_Revenue, 0)) - 
              SUM(Total_COGM + Packaging + TL_Delivery_Costs + Incoming_Freight_Var), 2) as Contribution_Margin,
        
        -- Contribution margin %
        ROUND(SAFE_DIVIDE(
            SUM(COALESCE(Gross_Revenue, 0)) - 
            SUM(Total_COGM + Packaging + TL_Delivery_Costs + Incoming_Freight_Var),
            SUM(COALESCE(Gross_Revenue, 0))
        ) * 100, 2) as Contribution_Margin_Pct,
        
        COUNT(*) as Transaction_Count
        
    FROM `{project}.{dataset}.{table}`
    WHERE Material_Number IS NOT NULL
        AND Customer IS NOT NULL
        AND Fiscal_Year = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
    GROUP BY Material_Number, Customer
    HAVING COUNT(*) >= 5  -- Minimum transactions for reliability
)
SELECT 
    Product,
    Product_Description,
    Customer,
    Customer_Name,
    Revenue,
    Material_Cost,
    Packaging_Cost,
    Freight_Cost,
    Total_Variable_Cost,
    Contribution_Margin,
    Contribution_Margin_Pct,
    -- Rank by contribution margin
    RANK() OVER (PARTITION BY Product ORDER BY Contribution_Margin DESC) as Customer_Rank_For_Product,
    RANK() OVER (PARTITION BY Customer ORDER BY Contribution_Margin DESC) as Product_Rank_For_Customer
FROM contribution_analysis
WHERE Revenue > 0
ORDER BY Contribution_Margin DESC
LIMIT 100""",
        "explanation": "Calculate detailed contribution margin by product-customer combination with variable cost breakdown"
    },
    
    # ========== Advanced Analysis (Query1.jpeg & Query4.jpeg) ==========
    {
        "question": "Why is product X showing low margins despite high sales?",
        "sql": """-- Replace 'PRODUCT_X' with actual product identifier
WITH product_analysis AS (
    SELECT 
        Material_Number,
        Material_Description,
        Sales_Region,
        Distribution_Channel,
        
        -- Sales volume and revenue
        COUNT(*) as Transaction_Count,
        COUNT(DISTINCT Customer) as Customer_Count,
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Total_Revenue,
        ROUND(AVG(COALESCE(Gross_Revenue, 0)), 2) as Avg_Revenue_Per_Transaction,
        
        -- Cost analysis
        ROUND(SUM(Total_COGS), 2) as Total_COGS,
        ROUND(AVG(Total_COGS), 2) as Avg_COGS_Per_Transaction,
        ROUND(SUM(Purchase_Price_Variance), 2) as Total_Price_Variance,
        ROUND(SUM(Sales_Discounts), 2) as Total_Discounts_Given,
        
        -- Margin analysis
        ROUND(AVG(Sales_Margin_of_Gross_Sales), 2) as Avg_Gross_Margin,
        ROUND(MIN(Sales_Margin_of_Gross_Sales), 2) as Min_Margin,
        ROUND(MAX(Sales_Margin_of_Gross_Sales), 2) as Max_Margin,
        ROUND(STDDEV(Sales_Margin_of_Gross_Sales), 2) as Margin_Volatility
        
    FROM `{project}.{dataset}.{table}`
    WHERE Material_Number = 'PRODUCT_X'  -- Replace with actual product
        OR LOWER(Material_Description) LIKE '%product x%'
    GROUP BY Material_Number, Material_Description, Sales_Region, Distribution_Channel
),
product_issues AS (
    SELECT 
        *,
        -- Identify potential issues
        CASE 
            WHEN Total_Price_Variance < -10000 THEN 'High negative price variance'
            WHEN Total_Discounts_Given > Total_Revenue * 0.1 THEN 'Excessive discounting'
            WHEN Margin_Volatility > 10 THEN 'High margin volatility'
            WHEN Avg_COGS_Per_Transaction > Avg_Revenue_Per_Transaction * 0.7 THEN 'High cost ratio'
            ELSE 'Other factors'
        END as Primary_Issue,
        -- Calculate discount rate
        ROUND(Total_Discounts_Given / NULLIF(Total_Revenue, 0) * 100, 2) as Discount_Rate_Pct
    FROM product_analysis
)
SELECT * FROM product_issues
ORDER BY Total_Revenue DESC""",
        "explanation": "Analyze why a high-sales product has low margins by examining pricing, costs, and discounts"
    },
    
    {
        "question": "If freight costs increase by 10%, how will it affect overall margins?",
        "sql": """WITH current_state AS (
    SELECT 
        -- Current totals
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Total_Revenue,
        ROUND(SUM(Total_COGS), 2) as Current_Total_COGS,
        ROUND(SUM(TL_Delivery_Costs + Incoming_Freight_Var), 2) as Current_Freight_Costs,
        ROUND(AVG(Sales_Margin_of_Gross_Sales), 2) as Current_Avg_Margin_Pct,
        
        -- Calculate current gross profit
        ROUND(SUM(COALESCE(Gross_Revenue, 0)) - SUM(Total_COGS), 2) as Current_Gross_Profit
        
    FROM `{project}.{dataset}.{table}`
    WHERE Fiscal_Year = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
),
scenario_analysis AS (
    SELECT 
        Total_Revenue,
        Current_Total_COGS,
        Current_Freight_Costs,
        Current_Avg_Margin_Pct,
        Current_Gross_Profit,
        
        -- Scenario: 10% freight increase
        ROUND(Current_Freight_Costs * 1.10, 2) as New_Freight_Costs,
        ROUND(Current_Freight_Costs * 0.10, 2) as Freight_Cost_Increase,
        ROUND(Current_Total_COGS + (Current_Freight_Costs * 0.10), 2) as New_Total_COGS,
        
        -- New margins
        ROUND(Total_Revenue - (Current_Total_COGS + (Current_Freight_Costs * 0.10)), 2) as New_Gross_Profit,
        ROUND((Total_Revenue - (Current_Total_COGS + (Current_Freight_Costs * 0.10))) / NULLIF(Total_Revenue, 0) * 100, 2) as New_Margin_Pct
        
    FROM current_state
)
SELECT 
    Total_Revenue,
    Current_Total_COGS,
    Current_Freight_Costs,
    ROUND(Current_Freight_Costs / Current_Total_COGS * 100, 2) as Freight_Pct_of_COGS,
    Current_Avg_Margin_Pct,
    Freight_Cost_Increase as Additional_Freight_Cost,
    New_Total_COGS,
    New_Margin_Pct,
    ROUND(New_Margin_Pct - Current_Avg_Margin_Pct, 2) as Margin_Impact_Pct,
    ROUND(Current_Gross_Profit - New_Gross_Profit, 2) as Profit_Impact
FROM scenario_analysis""",
        "explanation": "Model impact of 10% freight cost increase on overall margins"
    },
    
    {
        "question": "How do fixed vs. variable costs impact profitability?",
        "sql": """WITH cost_classification AS (
    SELECT 
        Material_Group,
        Sales_Region,
        
        -- Revenue
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Revenue,
        
        -- Variable costs (vary with volume)
        ROUND(SUM(Total_COGM), 2) as Material_Costs_Variable,
        ROUND(SUM(Packaging), 2) as Packaging_Variable,
        ROUND(SUM(TL_Delivery_Costs + Incoming_Freight_Var), 2) as Freight_Variable,
        ROUND(SUM(Sales_Discounts), 2) as Discounts_Variable,
        ROUND(SUM(Total_COGM + Packaging + TL_Delivery_Costs + Incoming_Freight_Var + Sales_Discounts), 2) as Total_Variable_Costs,
        
        -- Fixed/Semi-fixed costs (allocated)
        ROUND(SUM(Warehouse_AND_Storage_Abs_Var), 2) as Warehouse_Fixed,
        ROUND(SUM(Cost_Center_Allocation_Var), 2) as Overhead_Allocation_Fixed,
        ROUND(SUM(Act_Cost_Adj_In + Act_Cost_Adj_Out), 2) as Other_Fixed_Allocations,
        
        -- Volume metrics
        COUNT(*) as Transaction_Count,
        COUNT(DISTINCT Customer) as Customer_Count
        
    FROM `{project}.{dataset}.{table}`
    WHERE Fiscal_Year = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
    GROUP BY Material_Group, Sales_Region
    HAVING COUNT(*) > 100  -- Significant volume only
),
profitability_analysis AS (
    SELECT 
        Material_Group,
        Sales_Region,
        Revenue,
        Total_Variable_Costs,
        
        -- Variable cost ratio
        ROUND(Total_Variable_Costs / NULLIF(Revenue, 0) * 100, 2) as Variable_Cost_Ratio,
        
        -- Contribution margin (Revenue - Variable Costs)
        ROUND(Revenue - Total_Variable_Costs, 2) as Contribution_Margin,
        ROUND((Revenue - Total_Variable_Costs) / NULLIF(Revenue, 0) * 100, 2) as Contribution_Margin_Pct,
        
        -- Fixed costs
        ROUND(Warehouse_Fixed + Overhead_Allocation_Fixed + Other_Fixed_Allocations, 2) as Total_Fixed_Costs,
        
        -- Operating profit (Contribution Margin - Fixed Costs)
        ROUND(Revenue - Total_Variable_Costs - (Warehouse_Fixed + Overhead_Allocation_Fixed + Other_Fixed_Allocations), 2) as Operating_Profit,
        
        -- Break-even analysis
        ROUND((Warehouse_Fixed + Overhead_Allocation_Fixed + Other_Fixed_Allocations) / 
              NULLIF((Revenue - Total_Variable_Costs) / Revenue, 0), 2) as Breakeven_Revenue,
              
        Transaction_Count,
        Customer_Count
        
    FROM cost_classification
)
SELECT 
    *,
    -- Operating leverage (high = more sensitive to volume changes)
    ROUND(Contribution_Margin / NULLIF(Operating_Profit, 0), 2) as Operating_Leverage,
    -- Safety margin
    ROUND((Revenue - Breakeven_Revenue) / NULLIF(Revenue, 0) * 100, 2) as Safety_Margin_Pct
FROM profitability_analysis
WHERE Revenue > 0
ORDER BY Operating_Profit DESC""",
        "explanation": "Analyze fixed vs variable cost structure impact on profitability with break-even analysis"
    }
]

# Additional helper queries for specific GL accounting concepts
GL_ACCOUNTING_HELPERS = {
    "period_close": """
    -- GL period closing entries check
    SELECT 
        Fiscal_Year,
        Fiscal_Year_Period,
        GL_Account_Type,
        COUNT(*) as Entry_Count,
        ROUND(SUM(GL_Amount_in_CC), 2) as Net_Amount,
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Debits,
        ROUND(SUM(CASE WHEN GL_Amount_in_CC < 0 THEN ABS(GL_Amount_in_CC) ELSE 0 END), 2) as Credits
    FROM `{project}.{dataset}.{table}`
    WHERE Fiscal_Year_Period = {period}
    GROUP BY Fiscal_Year, Fiscal_Year_Period, GL_Account_Type
    """,
    
    "trial_balance": """
    -- Trial balance by GL account
    SELECT 
        GL_Account,
        GL_Account_Description,
        GL_Account_Type,
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Debit_Total,
        ROUND(SUM(CASE WHEN GL_Amount_in_CC < 0 THEN ABS(GL_Amount_in_CC) ELSE 0 END), 2) as Credit_Total,
        ROUND(SUM(GL_Amount_in_CC), 2) as Net_Balance
    FROM `{project}.{dataset}.{table}`
    WHERE Fiscal_Year = {year}
    GROUP BY GL_Account, GL_Account_Description, GL_Account_Type
    ORDER BY GL_Account
    """,
    
    "journal_entries": """
    -- Journal entries detail
    SELECT 
        Reference_Doc,
        Document_Type,
        Posting_Date,
        GL_Account,
        GL_Account_Description,
        CASE WHEN GL_Amount_in_CC > 0 THEN GL_Amount_in_CC ELSE 0 END as Debit,
        CASE WHEN GL_Amount_in_CC < 0 THEN ABS(GL_Amount_in_CC) ELSE 0 END as Credit,
        Customer,
        Vendor_lifnr,
        Material_Number
    FROM `{project}.{dataset}.{table}`
    WHERE Posting_Date = {date}
    ORDER BY Reference_Doc, GL_Account
    """
}