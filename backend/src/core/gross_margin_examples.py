"""Reference queries for gross margin calculations in COPA schema."""

GROSS_MARGIN_EXAMPLES = [
    {
        "question": "What's the total revenue for the last 2 years",
        "sql": """SELECT 
    EXTRACT(YEAR FROM Posting_Date) as year,
    ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as total_revenue
FROM {table}
WHERE Posting_Date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR)
GROUP BY year
ORDER BY year DESC""",
        "explanation": "Calculate total revenue by year using Gross_Revenue column (NOT GL_Amount_in_CC)"
    },
    {
        "question": "Show revenue by month",
        "sql": """SELECT 
    DATE_TRUNC(Posting_Date, MONTH) as month,
    ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as monthly_revenue
FROM {table}
WHERE Posting_Date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
GROUP BY month
ORDER BY month DESC""",
        "explanation": "Monthly revenue using Gross_Revenue - NEVER use GL_Amount_in_CC for revenue"
    },
    {
        "question": "Calculate gross margin by customer",
        "sql": """SELECT 
    Customer,
    MAX(Payer_Name) as Customer_Name,
    COUNT(DISTINCT BILLINGDOCUMENT) as Invoice_Count,
    COUNT(*) as Transaction_Count,
    
    -- Revenue columns based on actual COPA schema
    ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Gross_Revenue,
    ROUND(SUM(COALESCE(Net_Sales, 0)), 2) as Net_Sales,
    
    -- COGS from pre-calculated field
    ROUND(SUM(COALESCE(Total_COGS, 0)), 2) as Total_COGS,
    
    -- Gross Profit (using Gross_Revenue - Total_COGS)
    ROUND(SUM(COALESCE(Gross_Revenue, 0)) - SUM(COALESCE(Total_COGS, 0)), 2) as Gross_Profit,
    
    -- Gross Margin % (pre-calculated field)
    ROUND(AVG(COALESCE(Sales_Margin_of_Gross_Sales, 0)), 2) as Avg_Gross_Margin_Pct,
    
    -- Calculate margin from amounts
    ROUND(SAFE_DIVIDE(
        SUM(COALESCE(Gross_Revenue, 0)) - SUM(COALESCE(Total_COGS, 0)),
        SUM(COALESCE(Gross_Revenue, 0))
    ) * 100, 2) as Calculated_Margin_Pct
    
FROM {table}
WHERE Customer IS NOT NULL
    AND Fiscal_Year = EXTRACT(YEAR FROM CURRENT_DATE()) - 1  -- Previous year
GROUP BY Customer
HAVING SUM(COALESCE(Gross_Revenue, 0)) > 0
ORDER BY Gross_Profit DESC""",
        "explanation": "Calculate gross margin metrics by customer using Gross_Revenue and Total_COGS fields"
    },
    {
        "question": "Calculate gross margin by product or material",
        "sql": """SELECT 
    Material_Number,
    MAX(Material_Description) as Product_Name,
    Material_Group,
    MAX(Material_Group_Description) as Material_Group_Desc,
    COUNT(DISTINCT Customer) as Customer_Count,
    COUNT(*) as Transaction_Count,
    
    -- Revenue columns
    ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Gross_Revenue,
    ROUND(SUM(COALESCE(Net_Sales, 0)), 2) as Net_Sales,
    
    -- COGS
    ROUND(SUM(COALESCE(Total_COGS, 0)), 2) as Total_COGS,
    
    -- Gross Profit
    ROUND(SUM(COALESCE(Gross_Revenue, 0)) - SUM(COALESCE(Total_COGS, 0)), 2) as Gross_Profit,
    
    -- Average Margin %
    ROUND(AVG(COALESCE(Sales_Margin_of_Gross_Sales, 0)), 2) as Avg_Gross_Margin_Pct,
    
    -- Min/Max margins
    ROUND(MIN(Sales_Margin_of_Gross_Sales), 2) as Min_Margin_Pct,
    ROUND(MAX(Sales_Margin_of_Gross_Sales), 2) as Max_Margin_Pct
    
FROM {table}
WHERE Material_Number IS NOT NULL
    AND Fiscal_Year = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
    AND Total_COGS IS NOT NULL
GROUP BY Material_Number, Material_Group
HAVING COUNT(*) >= 5  -- Only products with meaningful transaction volume
ORDER BY Gross_Profit DESC""",
        "explanation": "Calculate gross margin by product/material using actual revenue and COGS fields"
    },
    {
        "question": "Show gross profit by customer",
        "sql": """SELECT 
    Customer,
    MAX(Payer_Name) as Customer_Name,
    COUNT(*) as Transaction_Count,
    ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Gross_Revenue,
    ROUND(SUM(COALESCE(Net_Sales, 0)), 2) as Net_Sales,
    ROUND(SUM(COALESCE(Total_COGS, 0)), 2) as Total_COGS,
    ROUND(SUM(COALESCE(Gross_Revenue, 0)) - SUM(COALESCE(Total_COGS, 0)), 2) as Gross_Profit,
    ROUND(AVG(COALESCE(Sales_Margin_of_Gross_Sales, 0)), 2) as Avg_Gross_Margin_Pct
FROM {table}
WHERE Customer IS NOT NULL
GROUP BY Customer
HAVING SUM(COALESCE(Gross_Revenue, 0)) > 0
ORDER BY Gross_Profit DESC""",
        "explanation": "Simple gross profit calculation by customer using proper revenue columns"
    },
    {
        "question": "Calculate revenue by time period", 
        "sql": """SELECT 
    EXTRACT(YEAR FROM Posting_Date) as Year,
    EXTRACT(MONTH FROM Posting_Date) as Month,
    COUNT(*) as Transaction_Count,
    
    -- Different revenue types
    ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Total_Gross_Revenue,
    ROUND(SUM(COALESCE(Net_Sales, 0)), 2) as Total_Net_Sales,
    ROUND(SUM(COALESCE(Gross_Sales, 0)), 2) as Total_Gross_Sales,
    
    -- COGS and Margin
    ROUND(SUM(COALESCE(Total_COGS, 0)), 2) as Total_COGS,
    ROUND(AVG(COALESCE(Sales_Margin_of_Gross_Sales, 0)), 2) as Avg_Gross_Margin_Pct
    
FROM {table}
WHERE Posting_Date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR)
GROUP BY Year, Month
ORDER BY Year DESC, Month DESC""",
        "explanation": "Revenue analysis by time period using appropriate revenue columns"
    },
    {
        "question": "Show top gross margin sales regions",
        "sql": """SELECT 
    Sales_Region,
    MAX(Sales_Region_Description) as Region_Description,
    COUNT(DISTINCT Customer) as Customer_Count,
    COUNT(*) as Transaction_Count,
    
    -- Revenue columns
    ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Total_Gross_Revenue,
    ROUND(SUM(COALESCE(Net_Sales, 0)), 2) as Total_Net_Sales,
    
    -- COGS
    ROUND(SUM(COALESCE(Total_COGS, 0)), 2) as Total_COGS,
    
    -- Gross Profit
    ROUND(SUM(COALESCE(Gross_Revenue, 0)) - SUM(COALESCE(Total_COGS, 0)), 2) as Gross_Profit,
    
    -- Gross Margin %
    ROUND(AVG(COALESCE(Sales_Margin_of_Gross_Sales, 0)), 2) as Avg_Gross_Margin_Pct
    
FROM {table}
WHERE Sales_Region IS NOT NULL
GROUP BY Sales_Region
HAVING SUM(COALESCE(Gross_Revenue, 0)) > 0
ORDER BY Avg_Gross_Margin_Pct DESC""",
        "explanation": "Gross margin by sales region using proper revenue columns. Note: Only 4 regions exist (APAC, NA, EMEA, LATAM)"
    }
]

# Key insights for COPA gross margin calculations:
COPA_GROSS_MARGIN_RULES = {
    "revenue_columns": {
        "gross_revenue": "Use Gross_Revenue column for total gross revenue",
        "net_sales": "Use Net_Sales column for net sales after deductions",
        "gross_sales": "Use Gross_Sales column for gross sales amount",
        "revenue": "Use Revenue column for general revenue queries"
    },
    "cogs_field": "Use the pre-calculated Total_COGS field for cost of goods sold",
    "margin_calculations": {
        "gross_margin": "(Gross_Revenue - Total_COGS) / Gross_Revenue * 100",
        "net_margin": "(Net_Sales - Total_COS) / Net_Sales * 100",
        "pre_calculated": "Sales_Margin_of_Gross_Sales for pre-calculated margin percentages"
    },
    "profit_columns": {
        "gross_profit": "Gross_Revenue - Total_COGS",
        "net_profit": "Net_Sales - Total_COS",
        "gross_margin_field": "Gross_Margin (pre-calculated)"
    },
    "fiscal_year": "Data is typically for previous year (2024), not current year",
    "gl_accounts": "GL accounts are in 6-digit range (400000-700000), not 4-digit",
    "aggregations": "Always use SUM for amounts, AVG for margin percentages",
    "filters": "Filter out NULL values and use HAVING clause for post-aggregation filters",
    "null_handling": "Use COALESCE to handle NULL values in revenue and cost columns"
}