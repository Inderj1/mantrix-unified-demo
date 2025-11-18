"""Combined financial queries from all sources for comprehensive coverage."""

from src.core.gross_margin_examples import GROSS_MARGIN_EXAMPLES
from src.core.financial_analysis_queries import FINANCIAL_ANALYSIS_QUERIES

# Combine all queries into one comprehensive list
ALL_FINANCIAL_QUERIES = []

# Add gross margin queries
ALL_FINANCIAL_QUERIES.extend(GROSS_MARGIN_EXAMPLES)

# Add financial analysis queries  
ALL_FINANCIAL_QUERIES.extend(FINANCIAL_ANALYSIS_QUERIES)

# Additional commonly requested queries that complement the image-based queries
ADDITIONAL_COMMON_QUERIES = [
    {
        "question": "What is my revenue by month?",
        "sql": """SELECT 
    FORMAT_DATE('%Y-%m', PARSE_DATE('%Y%m%d', CAST(Posting_Date AS STRING))) as Month,
    ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Monthly_Revenue,
    COUNT(DISTINCT Customer) as Customer_Count,
    COUNT(DISTINCT Material_Number) as Product_Count,
    COUNT(*) as Transaction_Count
FROM {table}
WHERE Posting_Date IS NOT NULL
    AND Gross_Revenue > 0
GROUP BY Month
ORDER BY Month DESC""",
        "explanation": "Monthly revenue summary with customer and product counts - uses Gross_Revenue column"
    },
    
    {
        "question": "Show P&L summary",
        "sql": """WITH pl_summary AS (
    SELECT 
        -- Revenue
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Total_Revenue,
        
        -- Cost components
        ROUND(SUM(Total_COGS), 2) as Cost_of_Goods_Sold,
        ROUND(SUM(Total_COS) - SUM(Total_COGS), 2) as Operating_Expenses,
        
        -- Margins
        ROUND(AVG(Sales_Margin_of_Gross_Sales), 2) as Avg_Gross_Margin_Pct,
        ROUND(AVG(Sales_Margin_of_Net_Sales), 2) as Avg_Net_Margin_Pct
        
    FROM {table}
    WHERE Fiscal_Year = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
)
SELECT 
    Total_Revenue,
    Cost_of_Goods_Sold,
    Total_Revenue - Cost_of_Goods_Sold as Gross_Profit,
    Operating_Expenses,
    Total_Revenue - Cost_of_Goods_Sold - Operating_Expenses as Operating_Income,
    Avg_Gross_Margin_Pct,
    Avg_Net_Margin_Pct
FROM pl_summary""",
        "explanation": "Profit & Loss statement summary"
    },
    
    {
        "question": "Top customers by revenue",
        "sql": """SELECT 
    Customer,
    MAX(Payer_Name) as Customer_Name,
    COUNT(DISTINCT BILLINGDOCUMENT) as Invoice_Count,
    COUNT(DISTINCT Material_Number) as Products_Purchased,
    ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Total_Revenue,
    ROUND(AVG(COALESCE(Gross_Revenue, 0)), 2) as Avg_Order_Value,
    FIRST_VALUE(Sales_Region) OVER (PARTITION BY Customer ORDER BY COUNT(*) DESC) as Primary_Region
FROM {table}
WHERE Customer IS NOT NULL
GROUP BY Customer
ORDER BY Total_Revenue DESC
LIMIT 20""",
        "explanation": "Top customers ranked by total revenue"
    },
    
    {
        "question": "YoY growth analysis",
        "sql": """WITH yearly_metrics AS (
    SELECT 
        Fiscal_Year,
        ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as Annual_Revenue,
        ROUND(SUM(Total_COGS), 2) as Annual_COGS,
        ROUND(AVG(Sales_Margin_of_Gross_Sales), 2) as Avg_Gross_Margin,
        COUNT(DISTINCT Customer) as Customer_Count,
        COUNT(DISTINCT Material_Number) as Product_Count
    FROM {table}
    WHERE Fiscal_Year >= EXTRACT(YEAR FROM CURRENT_DATE()) - 3
    GROUP BY Fiscal_Year
)
SELECT 
    Fiscal_Year,
    Annual_Revenue,
    LAG(Annual_Revenue) OVER (ORDER BY Fiscal_Year) as Previous_Year_Revenue,
    ROUND((Annual_Revenue - LAG(Annual_Revenue) OVER (ORDER BY Fiscal_Year)) / 
          NULLIF(LAG(Annual_Revenue) OVER (ORDER BY Fiscal_Year), 0) * 100, 2) as Revenue_Growth_Pct,
    Annual_COGS,
    Avg_Gross_Margin,
    Customer_Count,
    Product_Count
FROM yearly_metrics
ORDER BY Fiscal_Year DESC""",
        "explanation": "Year-over-year growth analysis with key metrics"
    }
]

# Add additional queries to the main list
ALL_FINANCIAL_QUERIES.extend(ADDITIONAL_COMMON_QUERIES)

# Query categories for better organization
QUERY_CATEGORIES = {
    "Gross Margin & Profitability": [
        "Calculate gross margin by customer",
        "Calculate gross margin by product or material", 
        "What is my gross margin by product line?",
        "Which customers are the most profitable?",
        "Show gross profit by customer",
        "Calculate gross margin by GL account",
        "Show top gross margin sales regions"
    ],
    
    "Cost Analysis": [
        "What are my top 5 cost drivers in COGS?",
        "Has the material cost increased this quarter vs. last quarter?",
        "How much did freight costs contribute to total COGS last month?",
        "What's the average unit cost for Product X?",
        "Which vendors have the highest impact on cost structure?"
    ],
    
    "Variance & Trends": [
        "What was the variance between budgeted and actual gross margin?",
        "Why did margin dip in April?",
        "What is the gross margin trend over the last 12 months?",
        "Which region saw the biggest drop in profitability vs. last quarter?",
        "How did margin shift after the new pricing strategy?"
    ],
    
    "Segment Analysis": [
        "What market segments are driving our profit?",
        "How does margin vary by sales region or channel?",
        "Which SKUs are below the target contribution margin?",
        "What's the contribution margin of each product or customer?"
    ],
    
    "Advanced Analysis": [
        "Why is product X showing low margins despite high sales?",
        "If freight costs increase by 10%, how will it affect overall margins?",
        "How do fixed vs. variable costs impact profitability?",
        "What can I do to improve gross margin in the EU market?",
        "How much margin can I save by switching vendors for Product Y?"
    ],
    
    "Basic Reporting": [
        "What is my revenue by month?",
        "Show P&L summary",
        "Top customers by revenue",
        "YoY growth analysis"
    ]
}

# Function to find queries by category
def get_queries_by_category(category: str) -> list:
    """Get all queries for a specific category."""
    if category not in QUERY_CATEGORIES:
        return []
    
    category_questions = QUERY_CATEGORIES[category]
    return [q for q in ALL_FINANCIAL_QUERIES if q['question'] in category_questions]

# Function to find query by question
def find_query_by_question(question: str) -> dict:
    """Find a specific query by its question text."""
    for query in ALL_FINANCIAL_QUERIES:
        if query['question'].lower() == question.lower():
            return query
    return None