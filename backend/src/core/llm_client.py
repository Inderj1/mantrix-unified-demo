from typing import List, Dict, Any, Optional, Tuple
import anthropic
from anthropic import Anthropic
import structlog
import json
import time
from src.config import settings
from src.core.error_handler import QueryErrorHandler, ErrorType
from src.core.schema_aware_generator import SchemaAwareGenerator
from src.core.gross_margin_examples import GROSS_MARGIN_EXAMPLES, COPA_GROSS_MARGIN_RULES
from src.core.financial_analysis_queries import FINANCIAL_ANALYSIS_QUERIES

# Import knowledge service for semantic search (optional)
try:
    from src.core.knowledge_graph.weaviate_knowledge_service import (
        get_knowledge_service,
        WeaviateKnowledgeService
    )
    KNOWLEDGE_SERVICE_AVAILABLE = True
except ImportError:
    KNOWLEDGE_SERVICE_AVAILABLE = False

logger = structlog.get_logger()


class LLMClient:
    def __init__(self):
        self.client = Anthropic(api_key=settings.anthropic_api_key)
        self.model = settings.anthropic_model
        self.error_handler = QueryErrorHandler(llm_client=self)
        self.max_retries = 3
        self.retry_delay = 1.0  # Base delay in seconds
        self.schema_aware = SchemaAwareGenerator()

        # Initialize knowledge service for semantic search (optional)
        self.knowledge_service = None
        if KNOWLEDGE_SERVICE_AVAILABLE:
            try:
                self.knowledge_service = get_knowledge_service()
                logger.info("Knowledge service initialized for LLMClient")
            except Exception as e:
                logger.warning(f"Failed to initialize knowledge service: {e}")
                self.knowledge_service = None

        # Few-shot examples for better SQL generation (fallback when knowledge service unavailable)
        self.few_shot_examples = [
            {
                "question": "Show me total sales by month for last year",
                "sql": """SELECT 
  FORMAT_DATE('%Y-%m', order_date) as month,
  SUM(total_amount) as total_sales
FROM {project}.{dataset}.sales
WHERE DATE(order_date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)
GROUP BY month
ORDER BY month"""
            },
            {
                "question": "What are the top 10 customers by revenue?",
                "sql": """SELECT 
  customer_id,
  customer_name,
  SUM(revenue) as total_revenue
FROM {project}.{dataset}.customers
GROUP BY customer_id, customer_name
ORDER BY total_revenue DESC
LIMIT 10"""
            },
            {
                "question": "Show me top 5 GL accounts by total amount",
                "sql": """SELECT 
  GL_Account,
  GL_Account_Description,
  SUM(GL_Amount_in_CC) as total_amount
FROM {project}.{dataset}.table_name
WHERE GL_Account IS NOT NULL 
  AND GL_Amount_in_CC IS NOT NULL
GROUP BY GL_Account, GL_Account_Description
ORDER BY total_amount DESC
LIMIT 5"""
            },
            {
                "question": "Show products with low inventory",
                "sql": """SELECT 
  product_id,
  product_name,
  current_inventory,
  reorder_level
FROM {project}.{dataset}.inventory
WHERE current_inventory < reorder_level
ORDER BY current_inventory ASC"""
            }
        ]

    def simplify_explanation(self, explanation: str, enable_technical_mode: bool = False) -> Tuple[str, str]:
        """
        Simplify technical SQL explanations to be more user-friendly.

        Returns:
            Tuple[str, str]: (simplified_explanation, technical_explanation)
        """
        technical_explanation = explanation

        if enable_technical_mode:
            # Return original as both if technical mode is enabled
            return explanation, technical_explanation

        # Remove overly technical SQL details
        technical_terms = [
            "CTE", "Common Table Expression", "WITH clause",
            "LOWER()", "to_char()", "CONCAT", "FORMAT",
            "GROUP BY", "ORDER BY", "WHERE clause", "JOIN",
            "aggregation", "aggregated", "subquery",
            "PostgreSQL", "case-insensitive", "NULLIF",
            "descending", "ascending"
        ]

        simplified = explanation

        # Replace technical phrases with simpler ones
        replacements = {
            "I'm generating a SQL query to": "I'm analyzing",
            "I create a CTE called": "I'm organizing",
            "First, I create": "I'm looking at",
            "Then in the main SELECT": "Then I'm showing",
            "using LOWER() for case-insensitive matching": "matching any capitalization",
            "case-insensitive": "regardless of capitalization",
            "GROUP BY": "organized by",
            "ORDER BY": "sorted by",
            "descending": "from highest to lowest",
            "ascending": "from lowest to highest",
        }

        for old, new in replacements.items():
            simplified = simplified.replace(old, new)

        # If still too technical after replacements, simplify further but keep business context
        if len(simplified) > 400 or any(term.lower() in simplified.lower() for term in technical_terms):
            # Extract key business entities and metrics from the original
            import re

            # Try to preserve the core business message
            # Extract entity names in quotes
            entity_matches = re.findall(r'"([^"]+)"', explanation)
            entities = [e for e in entity_matches if len(e) < 50]  # Filter out long strings

            # Extract key metrics mentioned
            metrics = []
            metric_keywords = ['quantity', 'sales', 'revenue', 'margin', 'gm', 'cost', 'profit', 'total']
            for keyword in metric_keywords:
                if keyword in explanation.lower():
                    metrics.append(keyword)

            # Build a concise but informative explanation
            if entities and metrics:
                entity_str = ', '.join(entities[:2])  # Limit to first 2 entities
                metric_str = ', '.join(set(metrics[:3]))  # Limit to first 3 unique metrics
                simplified = f"I'm analyzing {metric_str} data for {entity_str}, broken down by the dimensions you requested."
            elif entities:
                entity_str = ', '.join(entities[:2])
                simplified = f"I'm gathering the requested data for {entity_str}."
            elif metrics:
                metric_str = ', '.join(set(metrics[:3]))
                simplified = f"I'm calculating the {metric_str} metrics you requested."
            elif "distributor" in explanation.lower():
                simplified = "I'm analyzing distributor sales data to provide the breakdown you requested."
            elif "customer" in explanation.lower():
                simplified = "I'm gathering customer data to answer your question."
            elif "revenue" in explanation.lower() or "sales" in explanation.lower():
                simplified = "I'm calculating the sales and revenue metrics you requested."
            elif "total" in explanation.lower():
                simplified = "I'm computing the totals you asked for."
            else:
                simplified = "I'm analyzing the data to provide the information you requested."

        return simplified, technical_explanation

    def generate_sql(
        self, 
        user_query: str, 
        table_schemas: List[Dict[str, Any]], 
        examples: Optional[List[Dict[str, str]]] = None,
        retry_count: int = 0,
        financial_context: Optional[Dict[str, Any]] = None,
        business_context: Optional[Dict[str, Any]] = None,
        join_hints: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Generate SQL query from natural language using table schemas."""
        logger.info(f"=== Starting SQL generation ===")
        logger.info(f"User query: {user_query}")
        logger.info(f"Table schemas type: {type(table_schemas)}")
        logger.info(f"Table schemas count: {len(table_schemas) if table_schemas else 0}")
        if table_schemas:
            logger.info(f"First table schema type: {type(table_schemas[0]) if table_schemas else 'N/A'}")
            if table_schemas and isinstance(table_schemas[0], dict):
                logger.info(f"First table name: {table_schemas[0].get('table_name', 'NO TABLE NAME')}")
        logger.info(f"Financial context type: {type(financial_context)}")
        logger.info(f"Business context type: {type(business_context)}")
        try:
            logger.info("Building system prompt...")
            system_prompt = self._build_system_prompt(financial_context)
            logger.info("System prompt built successfully")
            
            # Use provided examples or default few-shot examples
            logger.info("Getting relevant examples...")
            effective_examples = examples if examples else self._get_relevant_examples(user_query, financial_context)
            logger.info(f"Got {len(effective_examples) if effective_examples else 0} examples")
            
            logger.info("Building user prompt...")
            user_prompt = self._build_user_prompt(user_query, table_schemas, effective_examples, financial_context, business_context, join_hints)
            logger.info("User prompt built successfully")
            if join_hints:
                logger.info(f"JOIN hints included in prompt: {len(join_hints)} relationships")
            
            logger.info(f"Generating SQL for query: {user_query[:100]}...", retry_count=retry_count)
            
            # Define the tool for structured output
            sql_generation_tool = {
                "name": "generate_sql_query",
                "description": "Generate a SQL query with metadata",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "sql": {
                            "type": "string",
                            "description": "The generated PostgreSQL SQL query"
                        },
                        "explanation": {
                            "type": "string",
                            "description": "Brief, user-friendly explanation from AXIS.AI's perspective about what you're doing to answer the question. Focus on the BUSINESS INTENT and high-level approach (e.g., 'I'm analyzing sales data for Audrey Le', 'I'm calculating total revenue across all regions'). Use first-person (I'm..., I've...). Keep it simple - avoid mentioning SQL syntax, CTEs, JOINs, or technical database details. Maximum 2-3 sentences."
                        },
                        "tables_used": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of table names referenced in the query"
                        },
                        "estimated_complexity": {
                            "type": "string",
                            "enum": ["low", "medium", "high"],
                            "description": "Estimated query complexity"
                        },
                        "optimization_notes": {
                            "type": "string",
                            "description": "Any performance considerations or optimizations applied"
                        }
                    },
                    "required": ["sql", "explanation", "tables_used", "estimated_complexity"]
                }
            }
            
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                temperature=0,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt + "\n\nPlease use the generate_sql_query tool to provide your response."}
                ],
                tools=[sql_generation_tool],
                tool_choice={"type": "tool", "name": "generate_sql_query"}
            )
            
            # Debug logging for response structure
            logger.info(f"Response type: {type(response)}")
            logger.info(f"Response content type: {type(response.content)}")
            logger.info(f"Response content length: {len(response.content) if response.content else 'None'}")
            if response.content:
                for i, content in enumerate(response.content):
                    logger.info(f"Content[{i}] type: {type(content)}, content type: {getattr(content, 'type', 'no type attr')}")
                    if hasattr(content, 'type') and content.type == "tool_use":
                        logger.info(f"Tool use name: {getattr(content, 'name', 'no name')}")
                        logger.info(f"Tool use input type: {type(getattr(content, 'input', 'no input'))}")
                        logger.info(f"Tool use input: {repr(getattr(content, 'input', 'no input'))}")
            
            # Extract the tool use response
            tool_use = None
            for content in response.content:
                if content.type == "tool_use" and content.name == "generate_sql_query":
                    tool_use = content
                    break
            
            if tool_use and hasattr(tool_use, 'input'):
                raw_result = tool_use.input
                logger.info(f"Tool use raw result type: {type(raw_result)}")
                logger.info(f"Tool use raw result content: {repr(raw_result)}")
                
                # Handle different response formats from Anthropic
                if isinstance(raw_result, dict):
                    result = raw_result
                    logger.info("Tool returned dict - using directly")
                elif isinstance(raw_result, str):
                    logger.warning("Tool returned string - attempting JSON parse")
                    try:
                        result = json.loads(raw_result)
                        logger.info("Successfully parsed JSON from string response")
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse JSON from tool response: {e}")
                        # Fallback to text parsing
                        result = self._parse_llm_response(raw_result)
                else:
                    logger.error(f"Unexpected tool response type: {type(raw_result)}")
                    result = {
                        "sql": str(raw_result) if raw_result else "",
                        "explanation": "I've generated a SQL query to answer your question.",
                        "tables_used": [],
                        "estimated_complexity": "medium",
                        "optimization_notes": ""
                    }

                # Final safety check - ensure result is a dict
                if not isinstance(result, dict):
                    logger.error(f"Result is still not a dict after processing: {type(result)}")
                    result = {
                        "sql": str(result) if result else "",
                        "explanation": "I've generated a SQL query to answer your question.",
                        "tables_used": [],
                        "estimated_complexity": "medium",
                        "optimization_notes": ""
                    }
                
                logger.info("SQL generation completed successfully")

                # Post-process: Remove BigQuery-style backticks for PostgreSQL compatibility
                if "sql" in result and result["sql"]:
                    result["sql"] = result["sql"].replace('`', '')
                    logger.info("Removed backticks from generated SQL")

                # Post-process: Fix LOWER() in SELECT/GROUP BY to preserve original casing
                if "sql" in result and result["sql"]:
                    import re
                    sql = result["sql"]
                    logger.info("POST-PROCESSING: Checking for LOWER() in SELECT/GROUP BY")

                    # Fix pattern: LOWER(column) AS column in SELECT
                    # Replace with: column (original casing)
                    text_columns = ['distributor', 'customer', 'customer_name', 'item_name', 'product_name']
                    for col in text_columns:
                        # Pattern: LOWER(distributor) AS distributor (with optional comma/whitespace after)
                        # This will match in SELECT statements
                        old_sql = sql
                        sql = re.sub(
                            rf'LOWER\(\s*{col}\s*\)\s+AS\s+{col}\b',
                            col,
                            sql,
                            flags=re.IGNORECASE
                        )
                        if sql != old_sql:
                            logger.info(f"POST-PROCESSING: Removed LOWER() from SELECT for column: {col}")

                        # Pattern: GROUP BY LOWER(distributor) or , LOWER(distributor)
                        old_sql = sql
                        sql = re.sub(
                            rf'(GROUP\s+BY|,)\s+LOWER\(\s*{col}\s*\)',
                            rf'\1 {col}',
                            sql,
                            flags=re.IGNORECASE
                        )
                        if sql != old_sql:
                            logger.info(f"POST-PROCESSING: Removed LOWER() from GROUP BY for column: {col}")

                    if sql != result["sql"]:
                        result["sql"] = sql
                        logger.info("POST-PROCESSING: Successfully fixed LOWER() to preserve original casing")

                # Add confidence score based on complexity
                result["confidence_score"] = self._calculate_confidence(result, table_schemas)

                # Simplify explanation for end users (keep technical version optional)
                if "explanation" in result:
                    simplified, technical = self.simplify_explanation(
                        result["explanation"],
                        enable_technical_mode=getattr(settings, 'enable_technical_explanations', False)
                    )
                    result["explanation"] = simplified
                    result["technical_explanation"] = technical

                return result
            else:
                # Fallback to text parsing if tool use fails
                logger.warning("Tool use failed, falling back to text parsing")
                if response.content and hasattr(response.content[0], 'text'):
                    result = self._parse_llm_response(response.content[0].text)
                    result["confidence_score"] = self._calculate_confidence(result, table_schemas)

                    # Simplify explanation for end users
                    if "explanation" in result:
                        simplified, technical = self.simplify_explanation(
                            result["explanation"],
                            enable_technical_mode=getattr(settings, 'enable_technical_explanations', False)
                        )
                        result["explanation"] = simplified
                        result["technical_explanation"] = technical

                    return result
                else:
                    raise ValueError("No valid response from LLM")
            
        except anthropic.RateLimitError as e:
            logger.warning(f"Rate limit hit: {e}")
            if retry_count < self.max_retries:
                time.sleep(self.retry_delay * (2 ** retry_count))  # Exponential backoff
                return self.generate_sql(user_query, table_schemas, examples, retry_count + 1)
            else:
                error_result = self.error_handler.handle_error(
                    e,
                    {"user_query": user_query, "tables_used": [s["table_name"] for s in table_schemas] if table_schemas and isinstance(table_schemas[0], dict) else []},
                    retry_count
                )
                error_result["sql"] = None
                return error_result
                
        except anthropic.APIError as e:
            logger.error(f"API error: {e}")
            if retry_count < self.max_retries and "timeout" in str(e).lower():
                time.sleep(self.retry_delay)
                return self.generate_sql(user_query, table_schemas, examples, retry_count + 1)
            else:
                error_result = self.error_handler.handle_error(
                    e,
                    {"user_query": user_query, "tables_used": [s["table_name"] for s in table_schemas] if table_schemas and isinstance(table_schemas[0], dict) else []},
                    retry_count
                )
                error_result["sql"] = None
                return error_result
                
        except Exception as e:
            logger.error(f"Failed to generate SQL: {e}")
            # Safely extract table names
            table_names = []
            if table_schemas and isinstance(table_schemas, list):
                for s in table_schemas:
                    if isinstance(s, dict) and "table_name" in s:
                        table_names.append(s["table_name"])
            
            error_result = self.error_handler.handle_error(
                e,
                {"user_query": user_query, "tables_used": table_names},
                retry_count
            )
            error_result["sql"] = None
            return error_result
    
    def _build_system_prompt(self, financial_context: Optional[Dict[str, Any]] = None) -> str:
        base_prompt = f"""You are an expert SQL query generator for PostgreSQL. Your task is to convert natural language questions into optimized PostgreSQL SQL queries.

!!!! ABSOLUTELY CRITICAL - CASE-INSENSITIVE TEXT MATCHING !!!!
⚠️ PostgreSQL string comparisons are CASE-SENSITIVE by default! ⚠️

ALWAYS use case-insensitive matching for text columns:
- distributor names: WHERE LOWER(distributor) = LOWER('audrey le')
- customer names: WHERE LOWER(customer_name) = LOWER('John Smith')
- item names: WHERE LOWER(item_name) ILIKE '%widget%'
- ANY text column: Use LOWER() on BOTH sides or use ILIKE instead of LIKE/=

⚠️ CRITICAL: Use LOWER() ONLY in WHERE clause, NEVER in SELECT/GROUP BY!

✅ CORRECT - Preserves original casing "Audrey Le" from database:
   SELECT distributor, item_name, SUM(quantity) AS total
   FROM csg_data
   WHERE LOWER(distributor) = LOWER('audrey le')
   GROUP BY distributor, item_name

❌ WRONG - Outputs lowercase "audrey le" instead of "Audrey Le":
   SELECT LOWER(distributor) AS distributor, item_name, SUM(quantity) AS total
   FROM csg_data
   WHERE LOWER(distributor) = LOWER('audrey le')
   GROUP BY LOWER(distributor), item_name

The LOWER() function is ONLY for filtering in WHERE clause. NEVER apply it to SELECT or GROUP BY!

!!!! ABSOLUTELY CRITICAL - REVENUE CALCULATION RULES !!!!
THIS IS THE MOST IMPORTANT RULE - FOLLOW EXACTLY:

For ANY query about revenue, sales, or income:
1. ALWAYS use the Gross_Revenue column: SUM(COALESCE(Gross_Revenue, 0))
2. NEVER use GL_Amount_in_CC for revenue calculations
3. NEVER use "CASE WHEN GL_Amount_in_CC > 0" pattern for revenue
4. NEVER use "SUM(CASE WHEN GL_Amount_in_CC > 0 THEN GL_Amount_in_CC ELSE 0 END)"

CORRECT revenue query pattern:
  SELECT EXTRACT(YEAR FROM Posting_Date) as year,
         ROUND(SUM(COALESCE(Gross_Revenue, 0)), 2) as total_revenue
  FROM table_name
  WHERE Posting_Date >= CURRENT_DATE - INTERVAL '2 years'
  GROUP BY year

INCORRECT patterns (NEVER USE THESE):
  ❌ SUM(CASE WHEN GL_Amount_in_CC > 0 THEN GL_Amount_in_CC ELSE 0 END)
  ❌ ROUND(SUM(CASE WHEN GL_Amount_in_CC > 0 THEN GL_Amount_in_CC ELSE 0 END), 2)
  ❌ GL_Amount_in_CC > 0 for revenue

Revenue column mapping:
- "revenue", "total revenue", "sales revenue" → SUM(COALESCE(Gross_Revenue, 0))
- "net sales" → SUM(COALESCE(Net_Sales, 0))  
- "gross sales" → SUM(COALESCE(Gross_Sales, 0))

Rules:
1. Generate valid PostgreSQL SQL syntax

2. ⚠️ CRITICAL: When filtering by text (distributor, customer, item names):
   - Use LOWER() ONLY in WHERE clause for case-insensitive matching
   - NEVER use LOWER() in SELECT or GROUP BY - this changes the output to lowercase!
   - Example CORRECT:
     SELECT distributor, SUM(quantity)
     WHERE LOWER(distributor) = LOWER('audrey le')
     GROUP BY distributor
   - Example WRONG:
     SELECT LOWER(distributor) AS distributor  -- ❌ This outputs "audrey le" instead of "Audrey Le"
     GROUP BY LOWER(distributor)  -- ❌ Also wrong!

3. Use simple table names without schema qualification (tables are in the public schema)
3. IMPORTANT: DO NOT use backticks - PostgreSQL uses double quotes for identifiers if needed
4. Use standard PostgreSQL functions and syntax (NOT BigQuery syntax)
5. Optimize queries for performance (use appropriate JOINs, filters, and aggregations)
5. Use CTEs for complex queries to improve readability
6. Consider using APPROX functions for large datasets when exact results aren't required
7. Use proper date/timestamp functions for time-based queries
8. Always include appropriate WHERE clauses to limit data scanned
9. Do not include backticks or triple quotes around the SQL - just provide the raw SQL query
10. For better performance, consider using materialized views when available
11. Always validate column names against the provided schema
12. CRITICAL: Check column data types before applying CAST:
    - DO NOT use CAST on numeric columns (FLOAT64, INT64, NUMERIC) for SUM/AVG operations
    - DO NOT use NULLIF(column, '') on numeric columns - they cannot contain empty strings
    - Only use CAST when converting between incompatible types (e.g., STRING to FLOAT64)
13. IMPORTANT: Window functions (RANK(), ROW_NUMBER(), etc.) cannot be used in WHERE clauses
    - Use a CTE or subquery to filter on window function results
    - For simple "top N" queries, prefer ORDER BY with LIMIT instead of RANK()

13a. CRITICAL - ORDER BY with Formatted Columns (RANKING QUERIES):

    ⚠️ When using ORDER BY with LIMIT for "top N" queries on formatted currency/percentage columns:

    **WRONG PATTERN** (causes alphabetic sorting on strings like "$8,240" before "$80,333"):
    ```sql
    SELECT
      distributor,
      '$' || to_char(ROUND(SUM(total_gm), 2), 'FM999,999,999.00') AS gross_margin
    FROM csg_data
    GROUP BY distributor
    ORDER BY gross_margin DESC  -- ❌ This sorts the FORMATTED STRING alphabetically!
    LIMIT 5
    ```

    **CORRECT PATTERN** (use CTE and order by raw numeric value):
    ```sql
    WITH distributor_metrics AS (
      SELECT
        distributor,
        SUM(total_gm) AS gross_margin_raw,  -- Keep raw numeric value
        SUM(total_sales) AS revenue_raw
      FROM csg_data
      GROUP BY distributor
      ORDER BY gross_margin_raw DESC  -- ✅ Sort on RAW numeric INSIDE CTE
      LIMIT 5  -- ✅ LIMIT also goes in CTE
    )
    SELECT
      distributor,
      '$' || to_char(ROUND(gross_margin_raw, 2), 'FM999,999,999.00') AS gross_margin,
      '$' || to_char(ROUND(revenue_raw, 2), 'FM999,999,999.00') AS total_revenue
    FROM distributor_metrics
    -- NO ORDER BY here - already sorted in CTE!
    ```

    **KEY RULES:**
    - For ANY "top N", "bottom N", "highest", "lowest", "best", "worst" query:
      1. Create CTE with RAW numeric aggregations
      2. Put ORDER BY + LIMIT in the CTE (on numeric columns)
      3. Format in outer SELECT (after sorting is done)
      4. Do NOT add ORDER BY in outer SELECT on formatted columns

    - Queries this applies to:
      * "show top 5 distributors by revenue"
      * "who are the most profitable customers"
      * "rank facilities by sales"
      * "best performing surgeons"
      * "highest margin products"
      * Any query with: top, bottom, best, worst, highest, lowest, rank

    - Why this matters:
      * String sorting: "$8,240" < "$80,333" (wrong!)
      * Numeric sorting: 8240 < 80333 (correct!)
      * Always sort on NUMBERS, format AFTER sorting
14. COPA Schema Revenue and Margin Rules:
    - Gross Revenue: Use Gross_Revenue column for total gross revenue queries
    - Net Sales: Use Net_Sales column for net sales after deductions
    - Gross Sales: Use Gross_Sales column for gross sales amounts
    - General Revenue: Check for Revenue column or use appropriate revenue column based on context
    - COGS: Use the pre-calculated Total_COGS field, NOT GL account ranges
    - Margin %: Use Sales_Margin_of_Gross_Sales for pre-calculated percentages
    - Gross Profit: Calculate as (Gross_Revenue - Total_COGS)
    - Net Profit: Calculate as (Net_Sales - Total_COS)
    - Fiscal Year: Data is typically for previous year (2024), not current year
    - GL Accounts: 6-digit range (400000-700000), not 4-digit ranges like 4000-4999
    - PROFIT MARGIN %: ALWAYS calculate as (SUM(Gross_Revenue) - SUM(Total_COGS)) / NULLIF(SUM(Gross_Revenue), 0) * 100. Never invent alternative formulas.
    - CUSTOMER PROFIT MARGIN: Group by Sold_to_Name (or Customer), use SUM(COALESCE(Gross_Revenue, 0)) and SUM(COALESCE(Total_COGS, 0)). Add HAVING SUM(Gross_Revenue) > 0 to avoid division by zero.
    - COLUMN WHITELIST for P&L queries:
      * Revenue columns: Gross_Revenue, Net_Sales, Gross_Sales, Revenue
      * Cost columns: Total_COGS, Cogs, Total_COS
      * Pre-calculated margins: Sales_Margin_of_Net_Sales, Sales_Margin_of_Gross_Sales
    - NEVER HALLUCINATE COLUMNS: Only use columns from the provided schema. Specifically, these columns DO NOT EXIST and must NEVER be used: Pallet_Revenue_Net, Promotional_Allowances, Freight_Allowance, Net_Revenue, Revenue_Adjustments. If unsure whether a column exists, use only the whitelisted columns above.
15. CRITICAL: When generating queries for revenue, margin, profitability, cost analysis:
    - ALWAYS use the appropriate revenue columns (Gross_Revenue, Net_Sales, Gross_Sales) NOT GL_Amount_in_CC
    - Use Total_COGS for cost of goods sold, not manual calculations
    - Use COALESCE to handle NULL values in revenue and cost columns
    - Follow the column mapping: revenue queries should use revenue columns, not GL account amounts
16. For GL account total amount queries:
    - Use dataset_25m_table as the primary table
    - Always include GL_Account in SELECT and GROUP BY
    - Use ROUND(SUM(GL_Amount_in_CC), 2) for total amounts
    - Filter by Posting_Date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR) unless otherwise specified
    - Order by GL_Account for consistency
    - IMPORTANT: GL accounts have format 'ACA1/XXXXXXXX' (e.g., 'ACA1/41000000')
    - When filtering specific GL accounts, use the full format: WHERE GL_Account = 'ACA1/41000000'
    - For partial matches, use: WHERE GL_Account LIKE '%41000000'
17. CRITICAL - TABLE JOIN RULES (Data Format Transformations):
    - When joining dataset_25m_table with sales_order_cockpit_export:
      * COPA table (dataset_25m_table) has Sales_Order_KDAUF with leading zeros (e.g., '0000507250')
      * Cockpit table (sales_order_cockpit_export) has SalesDocument_VBELN without leading zeros (e.g., '507250')
      * MUST use: LTRIM(copa.Sales_Order_KDAUF, '0') = cockpit.SalesDocument_VBELN
      * DO NOT use direct equality: copa.Sales_Order_KDAUF = cockpit.SalesDocument_VBELN (this will match < 0.01% of records!)
    - Correct JOIN example:
      sql
      FROM dataset_25m_table copa
      LEFT JOIN sales_order_cockpit_export cockpit
        ON LTRIM(copa.Sales_Order_KDAUF, '0') = cockpit.SalesDocument_VBELN
      
    - This applies to ALL queries joining these two tables
    - Expected match rate with LTRIM: ~85-95% of COPA records

18. CRITICAL - COLUMN FORMATTING RULES (PostgreSQL):

    ⭐ ALWAYS FORMAT MONETARY VALUES AND PERCENTAGES FOR READABILITY ⭐

    **Currency Columns** - Use PostgreSQL to_char() function with dollar sign and thousand separators:

    CORRECT PATTERN for PostgreSQL:
    '$' || to_char(ROUND(column_value, 2), 'FM999,999,999.00')

    Apply to these column types:
    - Revenue, Sales, Gross_Revenue, Net_Sales, Total_Sales
    - Cost, COGS, Total_COGS, Expenses, OpEx, Std_Cost
    - Price, Amount, Value, Total, Sum
    - Profit, Margin (when not %), Income, EBITDA
    - Gross, Net (when monetary), Gross_Margin
    - Payment, Fee, Charge, Invoice, Freight
    - Discount, Rebate, Commission, Wage, Salary

    CORRECT Examples:
    '$' || to_char(ROUND(SUM(total_sales), 2), 'FM999,999,999.00') AS total_revenue
    '$' || to_char(ROUND(SUM(total_std_cost), 2), 'FM999,999,999.00') AS total_cost
    '$' || to_char(ROUND(SUM(total_sales) - SUM(total_std_cost), 2), 'FM999,999,999.00') AS gross_margin

    **Percentage Columns** - Calculate and append % symbol:

    CORRECT PATTERN for PostgreSQL:
    to_char(ROUND(100.0 * numerator / NULLIF(denominator, 0), 2), 'FM999.00') || '%'

    Apply to:
    - Margin_Percent, Margin_Pct, Gross_Margin_Pct
    - Growth_Rate, Change_Percent, Variance_Pct
    - Any column ending in _percent, _pct, _rate

    CORRECT Example:
    to_char(ROUND(100.0 * SUM(total_gm) / NULLIF(SUM(total_sales), 0), 2), 'FM999.00') || '%' AS gross_margin_pct

    **Count/Quantity Columns** - ⚠️ NEVER format with $ (currency symbol):

    ❌ WRONG - DO NOT add $ to quantity/count columns:
    '$' || to_char(SUM(quantity), 'FM999,999,999.00') AS total_quantity  -- WRONG!

    ✅ CORRECT - Return as plain number (PostgreSQL will handle display):
    SUM(quantity) AS total_quantity
    CAST(SUM(quantity) AS INTEGER) AS total_quantity
    COUNT(*) AS row_count
    COUNT(DISTINCT customer) AS unique_customers

    ✅ CORRECT - Optional: Format with commas but NO $ sign:
    to_char(SUM(quantity), 'FM999,999,999') AS total_quantity

    Apply to these column types (NO $ SYMBOL):
    - Quantity, Qty, Count, Number, Volume
    - Units, Cases, Items, Orders, Transactions
    - Any column with "_quantity", "_count", "_qty", "_units" in the name

    WRONG - DO NOT USE (these are BigQuery patterns):
    CAST(... AS INT64)                          -- WRONG: Use INTEGER for PostgreSQL
    CAST(... AS STRING)                         -- WRONG: Use TEXT or VARCHAR for PostgreSQL
    FORMAT('%d', ...)                           -- WRONG: Not a PostgreSQL function
    CONCAT('$', FORMAT(...))                    -- WRONG: BigQuery syntax

    Use PostgreSQL's to_char() function for all formatting, but NO $ for quantity/count columns.

    **IMPORTANT**:
    - Format EVERY applicable column in SELECT clause
    - Apply to BOTH raw columns AND calculated fields
    - The formatting pattern is complex but ensures thousand separators appear correctly
    - Use COALESCE before formatting: SUM(COALESCE(Gross_Revenue, 0))

    **Good Example** - Copy this formatting pattern exactly:

    WITH CustomerMetrics AS (
      SELECT
        Customer,
        SUM(COALESCE(Gross_Revenue, 0)) as total_revenue,
        SUM(COALESCE(Total_COGS, 0)) as total_cogs,
        COUNT(DISTINCT Sales_Order_KDAUF) as order_count
      FROM dataset_25m_table
      GROUP BY Customer
    )
    SELECT
      Customer,
      CONCAT('$', FORMAT('%\\'d', CAST(FLOOR(total_revenue) AS INT64)), FORMAT('.%02d', CAST(ROUND((total_revenue - FLOOR(total_revenue)) * 100) AS INT64))) as revenue,
      CONCAT('$', FORMAT('%\\'d', CAST(FLOOR(total_cogs) AS INT64)), FORMAT('.%02d', CAST(ROUND((total_cogs - FLOOR(total_cogs)) * 100) AS INT64))) as cogs,
      FORMAT('%\\'d', CAST(order_count AS INT64)) as order_count
    FROM CustomerMetrics

    NOTE: First character in CONCAT must be '$' (dollar sign, ASCII 36)

    **User Expectation**:
    - Revenue: $1,234,567.89 (NOT 1234567.89)
    - Margin: 25.5% (NOT 0.255 or 25.5)
    - Count: 1,234 (NOT 1234)

    ⚠️ DO NOT skip formatting - users expect presentation-ready results!

19. CRITICAL - CASE-INSENSITIVE TEXT MATCHING (PostgreSQL):

    ⭐ ALWAYS USE CASE-INSENSITIVE MATCHING FOR TEXT COMPARISONS ⭐

    When filtering by text columns (distributor, customer, item_name, product, etc.),
    PostgreSQL string comparisons are CASE-SENSITIVE by default!

    **WRONG PATTERN** (will miss results):
    ```sql
    WHERE distributor = 'john smith'  -- ❌ Won't match "John Smith"
    WHERE item_name = 'widget'        -- ❌ Won't match "Widget" or "WIDGET"
    ```

    **CORRECT PATTERN** - Use ILIKE or LOWER():
    ```sql
    WHERE LOWER(distributor) = LOWER('John Smith')    -- ✅ Case-insensitive exact match
    WHERE distributor ILIKE 'john smith'              -- ✅ Case-insensitive exact match
    WHERE LOWER(item_name) LIKE LOWER('%widget%')     -- ✅ Case-insensitive partial match
    WHERE item_name ILIKE '%widget%'                  -- ✅ Case-insensitive partial match
    ```

    **Apply to these column types:**
    - distributor, customer, customer_name, vendor
    - item_name, item_code, product, product_name, sku
    - plant, location, region, territory
    - Any text/VARCHAR column used in WHERE, HAVING, or JOIN conditions

    **KEY RULES:**
    1. Always use LOWER() on BOTH sides of comparison: LOWER(column) = LOWER('value')
    2. Or use ILIKE instead of LIKE or = for case-insensitive matching
    3. When user provides a name like "michael fitzgerald", match it as LOWER('michael fitzgerald')
    4. Apply to ALL text comparisons, not just distributor names

    **CORRECT Examples:**
    ```sql
    -- User asks: "show me sales for Michael Fitzgerald"
    WHERE LOWER(distributor) = LOWER('Michael Fitzgerald')

    -- User asks: "items containing widget"
    WHERE LOWER(item_name) LIKE LOWER('%widget%')

    -- User asks: "customers at dallas plant"
    WHERE LOWER(plant) = LOWER('Dallas')
    ```

20. CRITICAL - FORMATTING CORRECTNESS RULES:

    **Percentage formatting** - NEVER use FORMAT with %% (causes double percent signs):
    ❌ WRONG: FORMAT('%.2f%%', value)  -- Produces "45.00%%" (double percent)
    ✅ CORRECT: to_char(ROUND(value, 2), 'FM999.00') || '%'  -- Produces "45.00%"

    **Decimal precision** - ALWAYS ROUND calculated values to 2 decimal places:
    ❌ WRONG: SUM(amount) / COUNT(*)  -- May produce 12345.6789012
    ✅ CORRECT: ROUND(SUM(amount) / NULLIF(COUNT(*), 0), 2)

    **Date differences** - Use DATE_DIFF for day calculations, NOT INTERVAL arithmetic:
    ❌ WRONG: invoice_date - payment_date  -- May return 'relativedelta(days=+45)'
    ✅ CORRECT: DATE_DIFF(payment_date, invoice_date, DAY) AS days_to_pay
    ✅ CORRECT: TIMESTAMP_DIFF(end_ts, start_ts, DAY) AS processing_days

    **ID/Document columns** - NEVER apply FORMAT or to_char to ID columns:
    ❌ WRONG: to_char(LIFNR, 'FM999,999,999') -- Adds commas to vendor number
    ❌ WRONG: FORMAT('%d', EBELN) -- Formats PO number
    ✅ CORRECT: CAST(LIFNR AS STRING) AS vendor_number -- Plain string, no commas
    ✅ CORRECT: EBELN AS po_number -- Return as-is

    ID columns include: LIFNR, BELNR, EBELN, EBELP, BUKRS, GJAHR, MATNR, WERKS, EKORG,
    BANFN, MBLNR, VBELN, KOSTL, PRCTR, SAKNR, HKONT, AUGBL, and any column ending in
    _number, _code, _id, _key, _no

    **Count/Quantity columns** - NEVER prefix with $ sign:
    ❌ WRONG: '$' || to_char(COUNT(*), 'FM999,999,999') AS invoice_count
    ✅ CORRECT: COUNT(*) AS invoice_count
    ✅ CORRECT: to_char(COUNT(*), 'FM999,999,999') AS invoice_count  -- commas OK, no $"""

        # Add financial context if provided
        if financial_context:
            financial_rules = """

Financial Query Rules:
11. For financial metrics, use the provided formulas exactly as specified
12. When calculating margins, ensure proper handling of NULL values with SAFE_DIVIDE
13. For GL account queries, use the gl_account column to filter by account numbers
14. Apply the appropriate hierarchy level (L1, L2, or L3) based on the query intent
15. For time-based financial queries, use fiscal periods when available
16. Group financial data appropriately based on the requested dimensions"""
            
            if financial_context.get("formulas"):
                financial_rules += "\n\nAvailable Financial Formulas:"
                for metric, formula in financial_context["formulas"].items():
                    # Handle both dict and string formula formats
                    if isinstance(formula, dict):
                        formula_str = list(formula.values())[0] if formula else 'N/A'
                    else:
                        formula_str = str(formula) if formula else 'N/A'
                    financial_rules += f"\n- {metric}: {formula_str}"
            
            base_prompt += financial_rules
        
        return base_prompt
    
    def _build_user_prompt(
        self,
        query: str,
        schemas: List[Dict[str, Any]],
        examples: Optional[List[Dict[str, str]]] = None,
        financial_context: Optional[Dict[str, Any]] = None,
        business_context: Optional[Dict[str, Any]] = None,
        join_hints: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        prompt_parts = []

        # Check if query contains names that need case-insensitive matching
        query_lower = query.lower()
        name_keywords = ['audrey', 'michael', 'fitzgerald', 'john', 'smith', 'distributor', 'customer', 'for ', 'by ']
        needs_case_insensitive = any(keyword in query_lower for keyword in name_keywords)

        if needs_case_insensitive:
            prompt_parts.append("🚨 CRITICAL REQUIREMENT FOR THIS QUERY 🚨")
            prompt_parts.append("This query filters by names. PostgreSQL is CASE-SENSITIVE!")
            prompt_parts.append("")
            prompt_parts.append("✅ CORRECT SQL Pattern:")
            prompt_parts.append("  SELECT distributor, item_name, SUM(quantity)")
            prompt_parts.append("  FROM csg_data")
            prompt_parts.append("  WHERE LOWER(distributor) = LOWER('audrey le')  -- LOWER only here!")
            prompt_parts.append("  GROUP BY distributor, item_name  -- Original columns, NO LOWER()!")
            prompt_parts.append("")
            prompt_parts.append("❌ WRONG - DO NOT USE:")
            prompt_parts.append("  SELECT LOWER(distributor) AS distributor  -- Converts to lowercase!")
            prompt_parts.append("  GROUP BY LOWER(distributor)  -- Also wrong!")
            prompt_parts.append("")
            prompt_parts.append("Remember: Use '$' || to_char() for currency formatting")
            prompt_parts.append("")

        # Add table schemas
        prompt_parts.append("Available tables and their schemas:")
        for schema in schemas:
            table_info = f"\nTable: {schema['table_name']}"
            if schema.get('description'):
                table_info += f"\nDescription: {schema['description']}"
            
            table_info += "\nColumns:"
            for col in schema['columns']:
                col_info = f"\n  - {col['name']} ({col['type']})"
                if col.get('description'):
                    col_info += f": {col['description']}"
                col_info += f" {'[REQUIRED]' if not col['is_nullable'] else '[NULLABLE]'}"
                table_info += col_info
            
            prompt_parts.append(table_info)

        # Add JOIN hints if multiple tables are involved
        if join_hints and len(join_hints) > 0:
            prompt_parts.append("\n\n⚠️ MULTI-TABLE QUERY DETECTED - JOIN REQUIRED ⚠️")
            prompt_parts.append("\n=== CRITICAL: You MUST use JOINs for this query ===")
            prompt_parts.append("\nTable Relationships and JOIN Instructions:")

            for hint in join_hints:
                source = hint['source']
                target = hint['target']
                keys = hint['keys']
                join_type = hint.get('type', 'left').upper()

                prompt_parts.append(f"\n{source} → {target}:")
                for source_col, target_col in keys:
                    # Special handling for Sales_Order JOIN with leading zero issue
                    if source_col == "Sales_Order_KDAUF" and target_col == "SalesDocument_VBELN":
                        prompt_parts.append(f"  ⚠️ CRITICAL: JOIN ON LTRIM({source}.{source_col}, '0') = {target}.{target_col}")
                        prompt_parts.append(f"  (Leading zero transformation required!)")
                    else:
                        prompt_parts.append(f"  JOIN ON {source}.{source_col} = {target}.{target_col}")
                prompt_parts.append(f"  JOIN TYPE: {join_type} JOIN")

            # Add column-to-table mapping
            prompt_parts.append("\n\nColumn Ownership Guide:")
            prompt_parts.append("When using multiple tables, reference columns correctly:")

            # Build column mappings from schemas
            for schema in schemas:
                table_name = schema['table_name']
                table_alias = self._get_table_alias(table_name)

                # Identify key columns to highlight
                key_columns = []
                for col in schema['columns'][:10]:  # Show first 10 important columns
                    key_columns.append(col['name'])

                if key_columns:
                    prompt_parts.append(f"\n  {table_name} (alias: {table_alias}):")
                    for col in key_columns:
                        prompt_parts.append(f"    - {col} → Use {table_alias}.{col}")

            # Add JOIN example
            prompt_parts.append("\n\nEXAMPLE MULTI-TABLE QUERY PATTERN:")
            prompt_parts.append("sql")
            prompt_parts.append("SELECT")
            prompt_parts.append("    copa.Gross_Revenue,")
            prompt_parts.append("    copa.Customer,")
            prompt_parts.append("    cockpit.DocumentDate_AUDAT,")
            prompt_parts.append("    cockpit.Delivery_VBELN")
            prompt_parts.append("FROM project.dataset.dataset_25m_table copa")
            prompt_parts.append("LEFT JOIN project.dataset.sales_order_cockpit_export cockpit")
            prompt_parts.append("    ON LTRIM(copa.Sales_Order_KDAUF, '0') = cockpit.SalesDocument_VBELN")
            prompt_parts.append("WHERE copa.Posting_Date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)")
            prompt_parts.append("")
            prompt_parts.append("\n✓ REMEMBER: Use table aliases (copa, cockpit) to qualify ALL column references")
            prompt_parts.append("✓ REMEMBER: Choose the correct table for each column based on the guide above")

        # Add examples if provided
        if examples:
            prompt_parts.append("\n\nExamples:")
            for example in examples:
                prompt_parts.append(f"\nQuestion: {example['question']}")
                prompt_parts.append(f"SQL: {example['sql']}")
        
        # Add financial context if provided
        if financial_context:
            prompt_parts.append("\n\nFinancial Query Context:")
            prompt_parts.append(f"Hierarchy Level: {financial_context.get('hierarchy_level', 'Unknown')}")
            prompt_parts.append(f"Query Intent: {financial_context.get('intent', 'Unknown')}")
            
            if financial_context.get("metrics"):
                prompt_parts.append("\nRequested Metrics:")
                for metric in financial_context["metrics"]:
                    # Handle both dict and string formats
                    if isinstance(metric, dict):
                        prompt_parts.append(f"- {metric['name']} ({metric['code']}): {metric.get('formula', 'N/A')}")
                    else:
                        prompt_parts.append(f"- {metric}")
            
            if financial_context.get("buckets"):
                prompt_parts.append("\nRelevant GL Buckets:")
                for bucket in financial_context["buckets"]:
                    # Handle both dict and string formats
                    if isinstance(bucket, dict):
                        prompt_parts.append(f"- {bucket['name']} ({bucket['code']}): GL accounts {bucket['gl_accounts']}")
                    else:
                        prompt_parts.append(f"- {bucket}")
            
            if financial_context.get("gl_accounts"):
                prompt_parts.append("\nSpecific GL Accounts:")
                for account in financial_context["gl_accounts"][:5]:  # Limit to 5
                    # Handle both dict and string formats
                    if isinstance(account, dict):
                        prompt_parts.append(f"- {account['number']}: {account['description']}")
                    else:
                        prompt_parts.append(f"- {account}")
            
            if financial_context.get("time_filter"):
                prompt_parts.append(f"\nTime Filter: {financial_context['time_filter']}")
            
            if financial_context.get("dimensions"):
                prompt_parts.append(f"\nGroup By Dimensions: {', '.join(financial_context['dimensions'])}")
        
        # Add business context if available
        if business_context:
            if business_context.get("gl_accounts"):
                prompt_parts.append("\nBusiness Configuration - GL Accounts:")
                # Group by bucket for clarity
                bucket_groups = {}
                for gl in business_context["gl_accounts"][:20]:  # Limit to prevent prompt overflow
                    bucket = business_context.get("gl_to_bucket", {}).get(gl, "Unknown")
                    if bucket not in bucket_groups:
                        bucket_groups[bucket] = []
                    bucket_groups[bucket].append(gl)
                
                for bucket, accounts in bucket_groups.items():
                    prompt_parts.append(f"- {bucket}: {', '.join(accounts[:5])}...")  # Show first 5
            
            if business_context.get("material_filters"):
                prompt_parts.append("\nMaterial Hierarchy Filters:")
                for level, filter_info in business_context["material_filters"].items():
                    prompt_parts.append(f"- {level}: {filter_info['description']} (code: {filter_info['code']})")
            
            if business_context.get("resolved_terms"):
                prompt_parts.append("\nResolved Business Terms:")
                for term, info in list(business_context["resolved_terms"].items())[:5]:
                    prompt_parts.append(f"- '{term}' maps to: {info}")
        
        # Add the user query
        prompt_parts.append(f"\n\nUser question: {query}")
        prompt_parts.append("\nGenerate the SQL query in the specified JSON format.")
        prompt_parts.append("\nEnsure the SQL is optimized for PostgreSQL and follows best practices.")
        prompt_parts.append("\nIMPORTANT: DO NOT use backticks () in the SQL - use plain table names or double quotes if needed.")
        
        # Store examples used for confidence calculation
        self._last_examples_used = examples
        
        # Enhance prompt with type information
        final_prompt = "\n".join(prompt_parts)
        final_prompt = self.schema_aware.enhance_prompt_with_type_info(final_prompt, schemas)
        
        return final_prompt
    
    def _get_table_alias(self, table_name: str) -> str:
        """Generate a short alias for a table name."""
        # Predefined aliases for known tables
        alias_map = {
            'dataset_25m_table': 'copa',
            'sales_order_cockpit_export': 'cockpit',
            'customer_master': 'cust',
            'product_master': 'prod',
            'inventory': 'inv'
        }

        if table_name in alias_map:
            return alias_map[table_name]

        # Generate alias from table name (first letters of words)
        parts = table_name.replace('_', ' ').split()
        if len(parts) > 1:
            return ''.join(p[0] for p in parts[:3])
        else:
            return table_name[:4]

    def _parse_llm_response(self, content: str) -> Dict[str, Any]:
        """Parse the LLM response to extract SQL and metadata."""
        logger.info(f"Parsing LLM response of type: {type(content)}")
        
        # Ensure content is a string
        if not isinstance(content, str):
            logger.error(f"Expected string content, got {type(content)}: {repr(content)}")
            return {
                "sql": str(content) if content is not None else "",
                "explanation": "I've generated a SQL query to answer your question.",
                "tables_used": [],
                "estimated_complexity": "medium",
                "optimization_notes": "",
                "error": f"Invalid content type: {type(content)}"
            }
        
        try:
            # Try to parse as JSON first
            if content.strip().startswith("{"):
                logger.info("Attempting to parse as direct JSON")
                parsed = json.loads(content)
                
                # Ensure parsed result is a dict
                if not isinstance(parsed, dict):
                    logger.error(f"JSON parsing returned {type(parsed)}, expected dict")
                    raise ValueError(f"JSON parsing returned {type(parsed)}")
                
                # Clean up the SQL if it contains triple quotes
                if "sql" in parsed and isinstance(parsed["sql"], str):
                    sql = parsed["sql"].strip()
                    # Remove triple quotes if present
                    if sql.startswith('"""') and sql.endswith('"""'):
                        sql = sql[3:-3].strip()
                    parsed["sql"] = sql
                
                # Ensure required fields exist
                if "explanation" not in parsed:
                    parsed["explanation"] = "I've generated a SQL query to answer your question."
                if "tables_used" not in parsed:
                    parsed["tables_used"] = []
                if "estimated_complexity" not in parsed:
                    parsed["estimated_complexity"] = "medium"
                
                logger.info("Successfully parsed as direct JSON")
                return parsed
            
            # If not JSON, try to extract JSON from the content
            import re
            logger.info("Searching for JSON pattern in content")
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                logger.info("Found JSON pattern, attempting to parse")
                parsed = json.loads(json_match.group())
                
                # Ensure parsed result is a dict
                if not isinstance(parsed, dict):
                    logger.error(f"JSON pattern parsing returned {type(parsed)}, expected dict")
                    raise ValueError(f"JSON pattern parsing returned {type(parsed)}")
                
                # Clean up the SQL if it contains triple quotes
                if "sql" in parsed and isinstance(parsed["sql"], str):
                    sql = parsed["sql"].strip()
                    if sql.startswith('"""') and sql.endswith('"""'):
                        sql = sql[3:-3].strip()
                    parsed["sql"] = sql
                
                # Ensure required fields exist
                if "explanation" not in parsed:
                    parsed["explanation"] = "I've generated a SQL query to answer your question."
                if "tables_used" not in parsed:
                    parsed["tables_used"] = []
                if "estimated_complexity" not in parsed:
                    parsed["estimated_complexity"] = "medium"
                
                logger.info("Successfully parsed JSON pattern")
                return parsed
            
            # Fallback: treat entire content as SQL
            logger.warning("No JSON found, treating entire content as SQL")
            return {
                "sql": content.strip(),
                "explanation": "I've analyzed your question and generated the appropriate SQL query.",
                "tables_used": [],
                "estimated_complexity": "medium",
                "optimization_notes": ""
            }
            
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse JSON response: {e}")
            # Return a basic structure with the content as SQL
            return {
                "sql": content.strip() if content else "",
                "explanation": "I've analyzed your question and generated the appropriate SQL query.",
                "tables_used": [],
                "estimated_complexity": "medium",
                "optimization_notes": "",
                "parse_error": str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error in response parsing: {e}")
            return {
                "sql": content.strip() if isinstance(content, str) and content else "",
                "explanation": "I've generated a SQL query to answer your question.",
                "tables_used": [],
                "estimated_complexity": "medium",
                "optimization_notes": "",
                "error": str(e)
            }
    
    def optimize_query(self, sql: str, performance_stats: Dict[str, Any]) -> Dict[str, Any]:
        """Suggest query optimizations based on performance statistics."""
        try:
            prompt = f"""Analyze this PostgreSQL SQL query and suggest optimizations:

SQL Query:
{sql}

Performance Statistics:
- Bytes processed: {performance_stats.get('bytes_processed', 'Unknown')}
- Estimated cost: ${performance_stats.get('estimated_cost', 'Unknown')}
- Execution time: {performance_stats.get('execution_time', 'Unknown')}ms

Suggest optimizations for:
1. Reducing data scanned (partitioning, clustering, filters)
2. Improving query performance (CTEs, materialized views)
3. Cost optimization

Return a JSON object with:
{{
    "optimized_sql": "the optimized query",
    "optimizations_applied": ["list of optimizations"],
    "estimated_improvement": "percentage or description",
    "additional_recommendations": ["other suggestions"]
}}"""
            
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                temperature=0,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return self._parse_llm_response(response.content[0].text)
            
        except Exception as e:
            logger.error(f"Failed to optimize query: {e}")
            raise
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using the embedding service."""
        from src.core.embeddings import EmbeddingService
        embedding_service = EmbeddingService()
        return embedding_service.generate_embedding(text)

    def get_metric_context(self, query: str) -> Optional[Dict[str, Any]]:
        """Get relevant financial metric definitions from knowledge service.

        Args:
            query: Natural language query

        Returns:
            Dict with metric definitions or None if not found
        """
        if not self.knowledge_service:
            return None

        try:
            metrics = self.knowledge_service.find_metrics(query, limit=3)
            if not metrics:
                return None

            return {
                "metrics": [
                    {
                        "code": m.metric_code,
                        "name": m.metric_name,
                        "description": m.description,
                        "formula": m.formula,
                        "formula_sql": m.formula_sql,
                        "is_percentage": m.is_percentage,
                        "is_currency": m.is_currency
                    }
                    for m in metrics
                ]
            }
        except Exception as e:
            logger.warning(f"Error getting metric context: {e}")
            return None

    def _get_relevant_examples(self, user_query: str, financial_context: Optional[Dict[str, Any]] = None) -> List[Dict[str, str]]:
        """Get relevant few-shot examples based on the user query.

        First tries to get semantically similar examples from the knowledge service.
        Falls back to keyword-based matching if knowledge service is unavailable.
        """
        # Try knowledge service first for semantic similarity matching
        if self.knowledge_service:
            try:
                dynamic_examples = self.knowledge_service.get_similar_sql_examples(
                    query=user_query,
                    limit=3,
                    dialect="postgresql"  # LLMClient is used for PostgreSQL queries
                )
                if dynamic_examples:
                    logger.info(f"Using {len(dynamic_examples)} dynamic examples from knowledge service")
                    return [
                        {"question": ex["question"], "sql": ex["sql"]}
                        for ex in dynamic_examples
                    ]
            except Exception as e:
                logger.warning(f"Knowledge service example lookup failed: {e}")

        # Fallback to keyword-based matching
        query_lower = user_query.lower()
        relevant_examples = []

        # PRIORITY 1: Check for revenue queries FIRST - this is most critical
        if any(term in query_lower for term in ['revenue', 'sales', 'income', 'turnover']):
            # ALWAYS add revenue examples from GROSS_MARGIN_EXAMPLES that use Gross_Revenue correctly
            relevant_examples.extend([ex for ex in GROSS_MARGIN_EXAMPLES if 'revenue' in ex['question'].lower()][:2])
            # Ensure we have at least one revenue example
            if not relevant_examples:
                relevant_examples.append(GROSS_MARGIN_EXAMPLES[0])  # First example is always revenue
        
        # Check for specific financial analysis patterns
        if any(term in query_lower for term in ['variance', 'budget', 'actual vs', 'quarter', 'qoq', 'mom']):
            # Find variance/comparison queries
            relevant_examples.extend([q for q in FINANCIAL_ANALYSIS_QUERIES if 'variance' in q['question'].lower()][:1])
        
        if any(term in query_lower for term in ['cost driver', 'cost breakdown', 'freight', 'material cost']):
            # Find cost analysis queries
            relevant_examples.extend([q for q in FINANCIAL_ANALYSIS_QUERIES if 'cost' in q['question'].lower() and 'COGS' in q['sql']][:1])
        
        if any(term in query_lower for term in ['profitable', 'profitability', 'profit by', 'segment']):
            # Find profitability queries
            relevant_examples.extend([q for q in FINANCIAL_ANALYSIS_QUERIES if 'profitable' in q['question'].lower()][:1])
        
        if any(term in query_lower for term in ['contribution margin', 'fixed', 'variable', 'break-even']):
            # Find contribution margin queries
            relevant_examples.extend([q for q in FINANCIAL_ANALYSIS_QUERIES if 'contribution' in q['question'].lower()][:1])
        
        # ALWAYS check if this is a gross margin/profit query and add those examples too
        if any(term in query_lower for term in ['margin', 'profit margin']):
            # Margin/profit margin queries: use customer & product margin examples (indices 0-2)
            relevant_examples.extend(GROSS_MARGIN_EXAMPLES[:3])
        elif any(term in query_lower for term in ['gross profit', 'profit', 'cogs', 'gross margin']):
            # General profit/COGS queries: use gross margin examples
            relevant_examples.extend(GROSS_MARGIN_EXAMPLES[1:3])
        
        # If we have examples, return them (up to 3)
        if relevant_examples:
            return relevant_examples[:3]
        
        # If financial context is provided, use financial-specific examples
        if financial_context and financial_context.get("hierarchy_level"):
            return self._get_financial_examples(financial_context)
        
        # Default: return a mix of examples
        default_examples = []
        default_examples.extend(GROSS_MARGIN_EXAMPLES[:1])  # One gross margin example
        default_examples.extend(FINANCIAL_ANALYSIS_QUERIES[:1])  # One analysis example
        
        for example in self.few_shot_examples:
            example_lower = example["question"].lower()
            # Check for keyword overlap
            if any(word in query_lower for word in example_lower.split() if len(word) > 3):
                relevant_examples.append(example)
        
        # Return top 2 most relevant examples
        return relevant_examples[:2] if relevant_examples else self.few_shot_examples[:2]
    
    def _get_financial_examples(self, financial_context: Dict[str, Any]) -> List[Dict[str, str]]:
        """Get financial-specific few-shot examples based on hierarchy level."""
        logger.info(f"Getting financial examples for context: {type(financial_context)}")
        logger.info(f"Financial context content: {repr(financial_context)}")
        
        # Safety check for financial_context
        if not isinstance(financial_context, dict):
            logger.error(f"Expected dict for financial_context, got {type(financial_context)}")
            return self.few_shot_examples[:2]  # Return default examples
            
        hierarchy_level = financial_context.get("hierarchy_level", 1)
        logger.info(f"Hierarchy level: {hierarchy_level}, type: {type(hierarchy_level)}")
        
        # L1 Metric examples
        if hierarchy_level == 1:
            return [
                {
                    "question": "Show me gross margin by region for last quarter",
                    "sql": """SELECT 
    region,
    SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount ELSE 0 END) as revenue,
    SUM(CASE WHEN gl_account BETWEEN '5000' AND '5999' THEN amount ELSE 0 END) as cogs,
    SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount ELSE 0 END) - 
    SUM(CASE WHEN gl_account BETWEEN '5000' AND '5999' THEN amount ELSE 0 END) as gross_margin,
    SAFE_DIVIDE(
        SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount ELSE 0 END) - 
        SUM(CASE WHEN gl_account BETWEEN '5000' AND '5999' THEN amount ELSE 0 END),
        SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount ELSE 0 END)
    ) * 100 as gross_margin_pct
FROM {project}.{dataset}.gl_transactions
WHERE DATE_TRUNC(date, QUARTER) = DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 1 QUARTER), QUARTER)
GROUP BY region
ORDER BY gross_margin DESC"""
                },
                {
                    "question": "Calculate EBITDA for current year",
                    "sql": """SELECT 
    SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount 
             WHEN gl_account BETWEEN '5000' AND '6999' THEN -amount 
             ELSE 0 END) as operating_income,
    SUM(CASE WHEN gl_account IN ('6810', '6820', '6830') THEN amount ELSE 0 END) as depreciation,
    SUM(CASE WHEN gl_account IN ('6840', '6850') THEN amount ELSE 0 END) as amortization,
    SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount 
             WHEN gl_account BETWEEN '5000' AND '6999' THEN -amount 
             ELSE 0 END) + 
    SUM(CASE WHEN gl_account IN ('6810', '6820', '6830', '6840', '6850') THEN amount ELSE 0 END) as ebitda
FROM {project}.{dataset}.gl_transactions
WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE())"""
                }
            ]
        
        # L2 Bucket examples
        elif hierarchy_level == 2:
            return [
                {
                    "question": "Break down COGS by component for this month",
                    "sql": """SELECT 
    CASE 
        WHEN gl_account BETWEEN '5000' AND '5299' THEN 'Material Costs'
        WHEN gl_account BETWEEN '5300' AND '5499' THEN 'Direct Labor'
        WHEN gl_account BETWEEN '5500' AND '5799' THEN 'Manufacturing Overhead'
        ELSE 'Other COGS'
    END as cost_component,
    SUM(amount) as total_amount,
    COUNT(DISTINCT gl_account) as account_count
FROM {project}.{dataset}.gl_transactions
WHERE gl_account BETWEEN '5000' AND '5999'
    AND DATE_TRUNC(date, MONTH) = DATE_TRUNC(CURRENT_DATE(), MONTH)
GROUP BY cost_component
ORDER BY total_amount DESC"""
                },
                {
                    "question": "Show operating expense breakdown by category",
                    "sql": """SELECT 
    CASE 
        WHEN gl_account BETWEEN '6000' AND '6199' THEN 'Sales Expenses'
        WHEN gl_account BETWEEN '6200' AND '6299' THEN 'Marketing Expenses'
        WHEN gl_account BETWEEN '6300' AND '6499' THEN 'Administrative Expenses'
        WHEN gl_account BETWEEN '6500' AND '6599' THEN 'R&D Expenses'
        ELSE 'Other Operating Expenses'
    END as expense_category,
    SUM(amount) as total_expenses,
    COUNT(*) as transaction_count
FROM {project}.{dataset}.gl_transactions
WHERE gl_account BETWEEN '6000' AND '6999'
    AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE())
GROUP BY expense_category
ORDER BY total_expenses DESC"""
                }
            ]
        
        # L3 GL Account examples
        else:
            return [
                {
                    "question": "Show all freight charges for Q2",
                    "sql": """SELECT 
    date,
    gl_account,
    gl_description,
    amount,
    reference_number,
    vendor_name
FROM {project}.{dataset}.gl_transactions
WHERE LOWER(gl_description) LIKE '%freight%'
    AND EXTRACT(QUARTER FROM date) = 2
    AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE())
ORDER BY date DESC"""
                },
                {
                    "question": "List office rent expenses by location",
                    "sql": """SELECT 
    location,
    gl_account,
    gl_description,
    SUM(amount) as total_rent,
    COUNT(*) as payment_count
FROM {project}.{dataset}.gl_transactions
WHERE gl_account IN ('6300', '6301', '6302')
    OR LOWER(gl_description) LIKE '%office rent%'
GROUP BY location, gl_account, gl_description
ORDER BY location, total_rent DESC"""
                }
            ]
    
    def _calculate_confidence(self, result: Dict[str, Any], table_schemas: List[Dict[str, Any]]) -> float:
        """Calculate confidence score for generated SQL."""
        # Defensive check: ensure result is a dict
        if not isinstance(result, dict):
            logger.error(f"Expected dict for result, got {type(result)}")
            return 0.5  # Return moderate confidence as fallback
            
        confidence = 1.0
        
        # Reduce confidence for high complexity
        if result.get("estimated_complexity") == "high":
            confidence -= 0.2
        elif result.get("estimated_complexity") == "medium":
            confidence -= 0.1
        
        # Reduce confidence if many tables are involved
        tables_used = result.get("tables_used", [])
        if len(tables_used) > 3:
            confidence -= 0.15
        elif len(tables_used) > 5:
            confidence -= 0.25
        
        # Reduce confidence if no examples were used
        if not hasattr(self, '_last_examples_used') or not self._last_examples_used:
            confidence -= 0.1
        
        # Ensure confidence is between 0 and 1
        return max(0.1, min(1.0, confidence))
    
    def correct_sql_error(self, original_sql: str, error_message: str, table_schemas: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Attempt to correct SQL based on error message."""
        try:
            correction_prompt = f"""The following SQL query has an error:

SQL:
{original_sql}

Error:
{error_message}

Available table schemas:
{self._format_schemas_for_prompt(table_schemas)}

Please correct the SQL query to fix the error. Focus on:
1. Fixing syntax errors
2. Correcting column/table names
3. Adding necessary JOINs or conditions

Return the corrected SQL in the same JSON format."""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                temperature=0,
                system=self._build_system_prompt(),
                messages=[
                    {"role": "user", "content": correction_prompt}
                ]
            )
            
            if response.content and hasattr(response.content[0], 'text'):
                result = self._parse_llm_response(response.content[0].text)
                result["correction_applied"] = True
                result["original_error"] = error_message
                return result
            else:
                raise ValueError("No valid correction from LLM")
                
        except Exception as e:
            logger.error(f"Failed to correct SQL: {e}")
            return {
                "sql": original_sql,
                "error": f"Failed to correct: {str(e)}",
                "correction_applied": False
            }
    
    def _format_schemas_for_prompt(self, schemas: List[Dict[str, Any]]) -> str:
        """Format schemas concisely for error correction prompt."""
        formatted = []
        for schema in schemas:
            table_info = f"Table: {schema['table_name']}"
            columns = [f"{col['name']} ({col['type']})" for col in schema['columns'][:10]]  # Limit columns
            table_info += "\nColumns: " + ", ".join(columns)
            if len(schema['columns']) > 10:
                table_info += f" ... and {len(schema['columns']) - 10} more"
            formatted.append(table_info)
        return "\n\n".join(formatted)

    def generate_completion(self, prompt: str, max_tokens: int = 2000, system_prompt: str = None) -> str:
        """Generate a text completion using Claude.

        Args:
            prompt: The user prompt/question
            max_tokens: Maximum tokens in response
            system_prompt: Optional system prompt

        Returns:
            The text response from Claude
        """
        try:
            messages = [{"role": "user", "content": prompt}]

            kwargs = {
                "model": self.model,
                "max_tokens": max_tokens,
                "messages": messages
            }

            if system_prompt:
                kwargs["system"] = system_prompt

            response = self.client.messages.create(**kwargs)

            if response.content and hasattr(response.content[0], 'text'):
                return response.content[0].text
            return ""

        except Exception as e:
            logger.error(f"Error generating completion: {e}")
            raise

    def analyze_image(
        self,
        image_data: bytes,
        prompt: str,
        media_type: str = "image/png",
        max_tokens: int = 2000
    ) -> str:
        """Analyze an image using Claude's vision capabilities.

        Args:
            image_data: Raw bytes of the image
            prompt: The analysis prompt/question about the image
            media_type: MIME type of the image (image/png, image/jpeg, etc.)
            max_tokens: Maximum tokens in response

        Returns:
            Claude's analysis of the image
        """
        import base64

        try:
            # Encode image to base64
            image_base64 = base64.standard_b64encode(image_data).decode("utf-8")

            # Build message with image
            message_content = [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": media_type,
                        "data": image_base64
                    }
                },
                {
                    "type": "text",
                    "text": prompt
                }
            ]

            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                messages=[
                    {"role": "user", "content": message_content}
                ]
            )

            if response.content and hasattr(response.content[0], 'text'):
                return response.content[0].text
            return ""

        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            raise