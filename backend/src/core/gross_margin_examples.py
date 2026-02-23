"""Reference queries for gross margin calculations in COPA schema."""

GROSS_MARGIN_EXAMPLES = [
    {
        "question": "Show me all my customers profit margin",
        "sql": """SELECT
    Sold_to_Name AS customer_name,
    '$' || to_char(ROUND(SUM(COALESCE(Gross_Sales, 0)), 2), 'FM999,999,999.00') AS total_revenue,
    '$' || to_char(ROUND(SUM(COALESCE(Total_COGS, 0)), 2), 'FM999,999,999.00') AS total_cogs,
    '$' || to_char(ROUND(SUM(COALESCE(Gross_Sales, 0)) + SUM(COALESCE(Total_COGS, 0)), 2), 'FM999,999,999.00') AS gross_profit,
    to_char(ROUND(SAFE_DIVIDE(SUM(COALESCE(Gross_Sales, 0)) + SUM(COALESCE(Total_COGS, 0)), SUM(COALESCE(Gross_Sales, 0))) * 100, 2), 'FM999.00') || '%' AS profit_margin_pct
FROM {table}
WHERE Sold_to_Name IS NOT NULL
GROUP BY Sold_to_Name
HAVING SUM(COALESCE(Gross_Sales, 0)) > 0
ORDER BY SUM(COALESCE(Gross_Sales, 0)) + SUM(COALESCE(Total_COGS, 0)) DESC""",
        "explanation": "Customer profit margin using Gross_Sales and Total_COGS. Total_COGS is stored as NEGATIVE, so use ADDITION for profit: Gross_Sales + Total_COGS. NEVER use Gross_Revenue or Pallet_Revenue_Net."
    },
    {
        "question": "Calculate gross margin by customer",
        "sql": """SELECT
    Sold_to_Name,
    Sold_to_Number,
    COUNT(*) as Transaction_Count,

    ROUND(SUM(COALESCE(Gross_Sales, 0)), 2) as Gross_Sales,
    ROUND(SUM(COALESCE(Net_Sales, 0)), 2) as Net_Sales,

    ROUND(SUM(COALESCE(Total_COGS, 0)), 2) as Total_COGS,

    -- Gross Profit = Gross_Sales + Total_COGS (COGS is negative)
    ROUND(SUM(COALESCE(Gross_Sales, 0)) + SUM(COALESCE(Total_COGS, 0)), 2) as Gross_Profit,

    -- Gross Margin % calculated from amounts
    ROUND(SAFE_DIVIDE(
        SUM(COALESCE(Gross_Sales, 0)) + SUM(COALESCE(Total_COGS, 0)),
        SUM(COALESCE(Gross_Sales, 0))
    ) * 100, 2) as Gross_Margin_Pct

FROM {table}
WHERE Sold_to_Name IS NOT NULL
GROUP BY Sold_to_Name, Sold_to_Number
HAVING SUM(COALESCE(Gross_Sales, 0)) > 0
ORDER BY Gross_Profit DESC""",
        "explanation": "Gross margin by customer using Gross_Sales + Total_COGS (COGS is negative, so ADD). Group by Sold_to_Name/Sold_to_Number."
    },
    {
        "question": "Calculate gross margin by product or material",
        "sql": """SELECT
    Material_Number,
    MAX(Material_Name) as Product_Name,
    Brand,
    COUNT(DISTINCT Sold_to_Number) as Customer_Count,
    COUNT(*) as Transaction_Count,

    ROUND(SUM(COALESCE(Gross_Sales, 0)), 2) as Gross_Sales,
    ROUND(SUM(COALESCE(Net_Sales, 0)), 2) as Net_Sales,

    ROUND(SUM(COALESCE(Total_COGS, 0)), 2) as Total_COGS,

    -- Gross Profit = Gross_Sales + Total_COGS (COGS is negative)
    ROUND(SUM(COALESCE(Gross_Sales, 0)) + SUM(COALESCE(Total_COGS, 0)), 2) as Gross_Profit,

    -- Gross Margin %
    ROUND(SAFE_DIVIDE(
        SUM(COALESCE(Gross_Sales, 0)) + SUM(COALESCE(Total_COGS, 0)),
        SUM(COALESCE(Gross_Sales, 0))
    ) * 100, 2) as Gross_Margin_Pct

FROM {table}
WHERE Material_Number IS NOT NULL
    AND Total_COGS IS NOT NULL
GROUP BY Material_Number, Brand
HAVING COUNT(*) >= 5
ORDER BY Gross_Profit DESC""",
        "explanation": "Gross margin by product using Gross_Sales + Total_COGS. Uses Material_Name and Brand (NOT Material_Description or Material_Group_Description)."
    },
    {
        "question": "Show gross profit by customer",
        "sql": """SELECT
    Sold_to_Name,
    Sold_to_Number,
    COUNT(*) as Transaction_Count,
    ROUND(SUM(COALESCE(Gross_Sales, 0)), 2) as Gross_Sales,
    ROUND(SUM(COALESCE(Net_Sales, 0)), 2) as Net_Sales,
    ROUND(SUM(COALESCE(Total_COGS, 0)), 2) as Total_COGS,
    ROUND(SUM(COALESCE(Gross_Sales, 0)) + SUM(COALESCE(Total_COGS, 0)), 2) as Gross_Profit,
    ROUND(SAFE_DIVIDE(
        SUM(COALESCE(Gross_Sales, 0)) + SUM(COALESCE(Total_COGS, 0)),
        SUM(COALESCE(Gross_Sales, 0))
    ) * 100, 2) as Gross_Margin_Pct
FROM {table}
WHERE Sold_to_Name IS NOT NULL
GROUP BY Sold_to_Name, Sold_to_Number
HAVING SUM(COALESCE(Gross_Sales, 0)) > 0
ORDER BY Gross_Profit DESC""",
        "explanation": "Gross profit by customer using Gross_Sales + Total_COGS (COGS is negative). Groups by Sold_to_Name/Sold_to_Number."
    },
    {
        "question": "Calculate revenue by time period",
        "sql": """SELECT
    EXTRACT(YEAR FROM Posting_Date) as Year,
    EXTRACT(MONTH FROM Posting_Date) as Month,
    COUNT(*) as Transaction_Count,

    ROUND(SUM(COALESCE(Gross_Sales, 0)), 2) as Total_Gross_Sales,
    ROUND(SUM(COALESCE(Net_Sales, 0)), 2) as Total_Net_Sales,

    ROUND(SUM(COALESCE(Total_COGS, 0)), 2) as Total_COGS,
    ROUND(SAFE_DIVIDE(
        SUM(COALESCE(Gross_Sales, 0)) + SUM(COALESCE(Total_COGS, 0)),
        SUM(COALESCE(Gross_Sales, 0))
    ) * 100, 2) as Gross_Margin_Pct

FROM {table}
WHERE Posting_Date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR)
GROUP BY Year, Month
ORDER BY Year DESC, Month DESC""",
        "explanation": "Revenue analysis by time period using Gross_Sales. NEVER use GL_Amount_in_CC or Gross_Revenue for revenue."
    },
    {
        "question": "Show top gross margin by region",
        "sql": """SELECT
    Region,
    COUNT(DISTINCT Sold_to_Number) as Customer_Count,
    COUNT(*) as Transaction_Count,

    ROUND(SUM(COALESCE(Gross_Sales, 0)), 2) as Total_Gross_Sales,
    ROUND(SUM(COALESCE(Net_Sales, 0)), 2) as Total_Net_Sales,

    ROUND(SUM(COALESCE(Total_COGS, 0)), 2) as Total_COGS,

    ROUND(SUM(COALESCE(Gross_Sales, 0)) + SUM(COALESCE(Total_COGS, 0)), 2) as Gross_Profit,

    ROUND(SAFE_DIVIDE(
        SUM(COALESCE(Gross_Sales, 0)) + SUM(COALESCE(Total_COGS, 0)),
        SUM(COALESCE(Gross_Sales, 0))
    ) * 100, 2) as Gross_Margin_Pct

FROM {table}
WHERE Region IS NOT NULL
GROUP BY Region
HAVING SUM(COALESCE(Gross_Sales, 0)) > 0
ORDER BY Gross_Margin_Pct DESC""",
        "explanation": "Gross margin by Region (NOT Sales_Region or Sales_Region_Description — those columns don't exist). Uses Gross_Sales + Total_COGS."
    },
    {
        "question": "What's the total revenue for the last 2 years",
        "sql": """SELECT
    EXTRACT(YEAR FROM Posting_Date) as year,
    ROUND(SUM(COALESCE(Gross_Sales, 0)), 2) as total_revenue
FROM {table}
WHERE Posting_Date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR)
GROUP BY year
ORDER BY year DESC""",
        "explanation": "Total revenue by year using Gross_Sales (NOT Gross_Revenue or GL_Amount_in_CC)"
    },
    {
        "question": "Show revenue by month",
        "sql": """SELECT
    DATE_TRUNC(Posting_Date, MONTH) as month,
    ROUND(SUM(COALESCE(Gross_Sales, 0)), 2) as monthly_revenue
FROM {table}
WHERE Posting_Date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
GROUP BY month
ORDER BY month DESC""",
        "explanation": "Monthly revenue using Gross_Sales - NEVER use GL_Amount_in_CC or Gross_Revenue for revenue"
    }
]

# Key insights for COPA gross margin calculations:
COPA_GROSS_MARGIN_RULES = {
    "revenue_columns": {
        "gross_sales": "Use Gross_Sales column for gross revenue (NEVER use Gross_Revenue)",
        "net_sales": "Use Net_Sales column for net sales after deductions",
        "revenue": "Use Gross_Sales for general revenue queries"
    },
    "cogs_field": "Use the pre-calculated Total_COGS field for cost of goods sold (stored as NEGATIVE values)",
    "margin_calculations": {
        "gross_margin": "(Gross_Sales + Total_COGS) / NULLIF(Gross_Sales, 0) * 100 — COGS is negative so ADD",
        "net_margin": "(Net_Sales + Total_COGS) / NULLIF(Net_Sales, 0) * 100 — COGS is negative so ADD",
        "pre_calculated": "Sales_Margin_of_Gross_Sales for pre-calculated margin percentages"
    },
    "profit_columns": {
        "gross_profit": "Gross_Sales + Total_COGS (COGS is negative, so ADD not subtract)",
        "net_profit": "Net_Sales + Total_COGS (COGS is negative, so ADD not subtract)",
        "gross_margin_field": "Gross_Margin (pre-calculated)"
    },
    "customer_columns": {
        "name": "Sold_to_Name (NOT Customer)",
        "number": "Sold_to_Number (NOT Customer)"
    },
    "banned_columns": [
        "Gross_Revenue — produces wrong negative values",
        "Pallet_Revenue_Net — does not exist",
        "Promotional_Allowances — does not exist",
        "Freight_Allowance — does not exist",
        "Sales_Region — does not exist (use Region)",
        "Sales_Region_Description — does not exist",
        "Material_Description — does not exist (use Material_Name)",
        "Material_Group_Description — does not exist",
        "BILLINGDOCUMENT — does not exist",
        "Sales_Margin_of_Gross_Sales — do not AVG this for margin; calculate from amounts instead"
    ],
    "fiscal_year": "Data is typically for previous year (2024), not current year",
    "gl_accounts": "GL accounts are in 6-digit range (400000-700000), not 4-digit",
    "aggregations": "Always use SUM for amounts; calculate margin % from SUM amounts, not AVG of pre-calculated percentages",
    "filters": "Filter out NULL values and use HAVING clause for post-aggregation filters",
    "null_handling": "Use COALESCE to handle NULL values in revenue and cost columns"
}
