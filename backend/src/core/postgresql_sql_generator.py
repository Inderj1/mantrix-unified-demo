"""
PostgreSQL SQL Generator - Lightweight NLP to SQL for PostgreSQL databases
"""
from typing import List, Dict, Any, Optional
import structlog
from src.core.llm_client import LLMClient
from src.core.cache_manager import CacheManager
from src.db.postgresql_client import PostgreSQLClient
from src.config import settings

logger = structlog.get_logger()


class PostgreSQLGenerator:
    """Lightweight SQL generator for PostgreSQL without vector search dependencies"""
    
    def __init__(self, database: str = "customer_analytics"):
        self.llm_client = LLMClient()
        self.pg_client = PostgreSQLClient(database=database)
        
        # Initialize cache manager if enabled
        self.cache_manager = None
        if settings.cache_enabled:
            try:
                self.cache_manager = CacheManager(
                    redis_url=settings.redis_url,
                    host=settings.redis_host,
                    port=settings.redis_port,
                    db=settings.redis_db,
                    decode_responses=settings.redis_decode_responses,
                    max_connections=settings.redis_max_connections
                )
                logger.info("Cache manager initialized for PostgreSQL generator")
            except Exception as e:
                logger.warning(f"Failed to initialize cache manager: {e}")
                self.cache_manager = None
    
    def get_table_schemas(self, relevant_tables: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Get schema information for relevant tables"""
        try:
            # Get all schema info
            all_schemas = self.pg_client.get_schema_info()
            
            # Filter to relevant tables if specified
            if relevant_tables:
                schemas = {k: v for k, v in all_schemas.items() if k in relevant_tables}
            else:
                schemas = all_schemas
            
            # Convert to format expected by LLM
            formatted_schemas = []
            for table_name, columns in schemas.items():
                # Format columns to match expected structure
                formatted_columns = []
                for col in columns:
                    formatted_col = {
                        "name": col.get("column", ""),
                        "type": col.get("type", ""),
                        "is_nullable": col.get("nullable", True),  # LLM client expects is_nullable
                        "description": ""
                    }
                    formatted_columns.append(formatted_col)
                
                schema_dict = {
                    "table_name": table_name,  # LLM client expects table_name
                    "columns": formatted_columns,
                    "description": self._get_table_description(table_name)
                }
                formatted_schemas.append(schema_dict)
            
            return formatted_schemas
        except Exception as e:
            logger.error(f"Error getting table schemas: {e}")
            return []
    
    def _get_table_description(self, table_name: str) -> str:
        """Get description for known tables"""
        descriptions = {
            "transaction_data": "Sales transactions with revenue, margin, and customer data (150k+ records)",
            "customer_master": "Customer information with RFM segmentation and CLV metrics",
            "product_master": "Product/material master data",
            "cohort_retention": "Customer cohort retention analysis by month",
            "segment_performance": "Customer segment performance metrics",
            "time_series_performance": "Time-based performance metrics by year/month/segment",
            "product_customer_matrix": "Product-customer cross matrix with segment analysis",
            "cohort_avg_revenue": "Average revenue per cohort over time",
            "cohort_sizes": "Customer count per cohort",
            "regional_product_matrix": "Regional product performance metrics",
            "regional_product_clusters": "Product clustering analysis by region",
            "regional_top_performers": "Top performing products by region"
        }
        return descriptions.get(table_name, f"Table: {table_name}")
    
    def _identify_relevant_tables(self, query: str) -> List[str]:
        """Simple heuristic to identify relevant tables based on query keywords"""
        query_lower = query.lower()
        
        # Define keyword mappings to tables
        table_keywords = {
            "transaction_data": [
                "sales", "revenue", "margin", "profit", "order", "transaction",
                "gross", "net", "quantity", "volume", "performance", "trend", "top"
            ],
            "customer_master": [
                "customer", "client", "buyer", "segment", "rfm", "champion",
                "loyal", "risk", "churn", "retention"
            ],
            "product_master": [
                "product", "material", "item", "sku", "catalog", "inventory"
            ]
        }
        
        relevant_tables = []
        for table, keywords in table_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                relevant_tables.append(table)
        
        # Default to transaction_data if no specific tables identified
        if not relevant_tables:
            relevant_tables = ["transaction_data"]
        
        # Always include customer_master if transaction_data is included (for joins)
        if "transaction_data" in relevant_tables and "customer_master" not in relevant_tables:
            relevant_tables.append("customer_master")
        
        return relevant_tables
    
    def generate_sql(
        self, 
        query: str,
        max_tables: int = 3,
        force_refresh: bool = False
    ) -> Dict[str, Any]:
        """Generate SQL from natural language query"""
        logger.info(f"Generating PostgreSQL SQL for query: {query}")
        
        try:
            # Check cache first if enabled
            cache_key = f"pg_sql:{query}"
            if self.cache_manager and not force_refresh:
                cached_result = self.cache_manager.redis.get(cache_key)
                if cached_result:
                    import json
                    logger.info("Returning cached PostgreSQL SQL")
                    return json.loads(cached_result)
            
            # Identify relevant tables
            relevant_tables = self._identify_relevant_tables(query)[:max_tables]
            logger.info(f"Identified relevant tables: {relevant_tables}")
            
            # Get schemas for relevant tables
            schemas = self.get_table_schemas(relevant_tables)
            
            if not schemas:
                return {
                    "error": "No relevant tables found",
                    "sql": None,
                    "tables_checked": relevant_tables
                }
            
            # Enhance query with PostgreSQL context
            enhanced_query = f"""
            {query}
            
            CRITICAL: This is PostgreSQL, NOT BigQuery! 
            - DO NOT use backticks (`) for identifiers
            - DO NOT use project.dataset.table format
            - Use double quotes for identifiers if needed, or no quotes at all
            - Table names are just: transaction_data, customer_master, product_master
            
            PostgreSQL syntax rules:
            - LIMIT for limiting results
            - :: for type casting (e.g., ::numeric, ::date)
            - CURRENT_DATE for today's date
            - INTERVAL '1 year' for date arithmetic
            - NULLIF to prevent division by zero
            
            Available tables (use exactly these names):
            - transaction_data: sales with net_sales, gross_margin, posting_date, material_number
            - customer_master: customers with rfm_segment
            - product_master: products with material_number, material_description
            
            For margin percentage: ROUND((SUM(gross_margin) / NULLIF(SUM(net_sales), 0) * 100)::numeric, 2)
            """
            
            # Generate SQL using LLM (using the standard interface)
            result = self.llm_client.generate_sql(
                enhanced_query, 
                schemas
            )
            
            # Validate PostgreSQL syntax (basic check)
            if result.get("sql"):
                sql = result["sql"]
                
                # Basic PostgreSQL validations
                if "LIMIT" not in sql.upper() and "SELECT" in sql.upper():
                    # Add default limit for safety
                    sql = sql.rstrip(';') + " LIMIT 100;"
                    result["sql"] = sql
                    result["limit_added"] = True
                
                # Ensure proper null handling for division
                if "/" in sql and "NULLIF" not in sql:
                    logger.warning("Division detected without NULLIF - potential division by zero")
                    result["warnings"] = result.get("warnings", []) + ["Consider using NULLIF to prevent division by zero"]
            
            # Cache the result if successful
            if self.cache_manager and not result.get("error"):
                import json
                cache_ttl = 3600  # 1 hour
                self.cache_manager.redis.setex(
                    cache_key,
                    cache_ttl,
                    json.dumps(result)
                )
            
            result["from_cache"] = False
            result["tables_used"] = relevant_tables
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to generate PostgreSQL SQL: {e}")
            return {
                "error": str(e),
                "sql": None,
                "error_type": "generation_error"
            }
    
    def execute_sql(self, sql: str) -> Dict[str, Any]:
        """Execute SQL query and return results"""
        try:
            logger.info(f"Executing SQL: {sql[:100]}...")
            
            # Execute query
            results = self.pg_client.execute_query(sql)
            
            # Format results
            if results:
                # Get column names from first row
                columns = list(results[0].keys()) if results else []
                
                return {
                    "success": True,
                    "data": results,
                    "columns": columns,
                    "row_count": len(results),
                    "sql": sql
                }
            else:
                return {
                    "success": True,
                    "data": [],
                    "columns": [],
                    "row_count": 0,
                    "sql": sql,
                    "message": "Query executed successfully but returned no results"
                }
                
        except Exception as e:
            logger.error(f"Failed to execute SQL: {e}")
            return {
                "success": False,
                "error": str(e),
                "sql": sql,
                "error_type": "execution_error"
            }
    
    def generate_and_execute(self, query: str, max_tables: int = 3) -> Dict[str, Any]:
        """Generate SQL from natural language and execute it"""
        # Generate SQL
        generation_result = self.generate_sql(query, max_tables)
        
        if generation_result.get("error"):
            return generation_result
        
        # Execute SQL
        sql = generation_result.get("sql")
        if sql:
            execution_result = self.execute_sql(sql)
            
            # Combine results
            return {
                **generation_result,
                "execution": execution_result
            }
        
        return generation_result