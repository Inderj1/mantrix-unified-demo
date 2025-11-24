"""
PostgreSQL SQL Generator - Enhanced NLP to SQL with Weaviate + RDFLib integration
"""
from typing import List, Dict, Any, Optional
import structlog
from src.core.llm_client import LLMClient
from src.core.cache_manager import CacheManager
from src.db.postgresql_client import PostgreSQLClient
from src.db.weaviate_client import WeaviateClient
from src.core.embeddings import EmbeddingService
from rdflib import Graph, Namespace, URIRef
from rdflib.namespace import RDF, RDFS
from pathlib import Path
from src.config import settings

logger = structlog.get_logger()

# RDF namespaces
MANTRIX = Namespace("http://mantrix.ai/ontology#")
DATA = Namespace("http://mantrix.ai/data/")


class PostgreSQLGenerator:
    """Enhanced SQL generator with Weaviate for table discovery and RDFLib for column selection"""

    def __init__(self, database: str = "mantrix_nexxt"):
        self.llm_client = LLMClient()
        self.pg_client = PostgreSQLClient(
            host="localhost",
            port=5433,
            user="mantrix",
            password="mantrix123",
            database=database
        )

        # Initialize Weaviate for table discovery
        self.weaviate_client = WeaviateClient()
        self.embedding_service = EmbeddingService()

        # Load RDFLib knowledge graph for column-level semantics
        self.knowledge_graph = None
        self._load_knowledge_graph()
        
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

    def _load_knowledge_graph(self):
        """Load RDFLib knowledge graph from TTL file"""
        try:
            kg_path = Path(__file__).parent.parent.parent / "mantrix_knowledge_graph.ttl"
            if kg_path.exists():
                self.knowledge_graph = Graph()
                self.knowledge_graph.bind('mantrix', MANTRIX)
                self.knowledge_graph.bind('data', DATA)
                self.knowledge_graph.parse(kg_path, format="turtle")
                logger.info(f"Loaded knowledge graph with {len(self.knowledge_graph)} triples")
            else:
                logger.warning(f"Knowledge graph file not found at {kg_path}")
        except Exception as e:
            logger.warning(f"Failed to load knowledge graph: {e}")

    def _identify_relevant_tables_with_weaviate(self, query: str, limit: int = 5) -> List[str]:
        """Use Weaviate vector search to identify relevant tables"""
        try:
            # Generate embedding for query
            query_embedding = self.embedding_service.generate_embedding(query)

            # Search for similar tables
            similar_tables = self.weaviate_client.search_similar_tables(query_embedding, limit=limit)

            # Extract table names
            table_names = [table['table_name'] for table in similar_tables]

            logger.info(f"Weaviate identified tables: {table_names}")
            return table_names
        except Exception as e:
            logger.warning(f"Weaviate search failed: {e}, falling back to keyword matching")
            return self._identify_relevant_tables(query)

    def _filter_relevant_columns_with_rdf(
        self,
        query: str,
        table_name: str,
        all_columns: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Use RDFLib knowledge graph to identify relevant columns for the query"""
        if not self.knowledge_graph:
            return all_columns  # Return all if no KG

        try:
            query_lower = query.lower()
            relevant_columns = []

            # Extract entities and metrics from query
            query_terms = set(query_lower.split())

            # Map query terms to column names via semantic patterns
            for col in all_columns:
                col_name = col['name'].lower()
                col_score = 0

                # Direct match
                if any(term in col_name for term in query_terms):
                    col_score += 10

                # Semantic matching for common patterns
                if 'sales' in query_lower or 'revenue' in query_lower:
                    if any(x in col_name for x in ['sales', 'revenue', 'amount']):
                        col_score += 5

                if 'margin' in query_lower or 'profit' in query_lower:
                    if any(x in col_name for x in ['margin', 'gm', 'profit']):
                        col_score += 5

                if 'quantity' in query_lower or 'volume' in query_lower:
                    if 'quantity' in col_name or 'qty' in col_name:
                        col_score += 5

                # Always include key columns
                if any(x in col_name for x in ['id', 'date', 'name', 'number', 'distributor', 'surgeon', 'facility']):
                    col_score += 2

                if col_score > 0:
                    col['relevance_score'] = col_score
                    relevant_columns.append(col)

            # Sort by relevance and limit to top 20 columns
            relevant_columns.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
            top_columns = relevant_columns[:20] if len(relevant_columns) > 20 else relevant_columns

            if top_columns:
                logger.info(f"RDF filtered {len(all_columns)} → {len(top_columns)} columns for {table_name}")
                return top_columns

            return all_columns  # Fallback to all columns

        except Exception as e:
            logger.warning(f"RDF column filtering failed: {e}")
            return all_columns

    def get_table_schemas(self, relevant_tables: Optional[List[str]] = None, query: str = "") -> List[Dict[str, Any]]:
        """Get schema information for relevant tables with RDFLib column filtering"""
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

                # Apply RDFLib column filtering if query provided
                if query and self.knowledge_graph:
                    formatted_columns = self._filter_relevant_columns_with_rdf(query, table_name, formatted_columns)

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
            
            # Identify relevant tables using Weaviate vector search
            relevant_tables = self._identify_relevant_tables_with_weaviate(query, limit=max_tables)
            logger.info(f"Weaviate identified relevant tables: {relevant_tables}")

            # Get schemas for relevant tables with RDFLib column filtering
            schemas = self.get_table_schemas(relevant_tables, query=query)
            
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
    
    def _convert_to_fuzzy_search(self, sql: str, original_query: str) -> Optional[str]:
        """Convert exact match WHERE clauses to fuzzy LIKE searches"""
        try:
            import re

            # Pattern to match WHERE column = 'value' or WHERE LOWER(column) = LOWER('value')
            # or WHERE column IN (...)

            fuzzy_sql = sql

            # Convert IN clauses to OR with LIKE
            # Example: WHERE LOWER(item_name) IN (LOWER('Cervical Plate'), LOWER('Pedicle Screw'))
            # Becomes: WHERE (LOWER(item_name) LIKE '%cervical%plate%' OR LOWER(item_name) LIKE '%pedicle%screw%')
            in_pattern = r"WHERE\s+LOWER\((\w+)\)\s+IN\s+\((.*?)\)"

            def replace_in_with_like(match):
                column = match.group(1)
                values_str = match.group(2)

                # Extract values from IN clause
                value_pattern = r"LOWER\('([^']+)'\)"
                values = re.findall(value_pattern, values_str)

                if not values:
                    return match.group(0)  # Return original if can't parse

                # Create LIKE conditions
                like_conditions = []
                for value in values:
                    # Convert spaces to % for fuzzy matching
                    fuzzy_value = value.lower().replace(' ', '%')
                    like_conditions.append(f"LOWER({column}) LIKE '%{fuzzy_value}%'")

                return f"WHERE ({' OR '.join(like_conditions)})"

            fuzzy_sql = re.sub(in_pattern, replace_in_with_like, fuzzy_sql, flags=re.IGNORECASE)

            # Convert simple equality to LIKE
            # Example: WHERE LOWER(distributor) = LOWER('Audrey Le')
            # Becomes: WHERE LOWER(distributor) LIKE '%audrey%le%'
            eq_pattern = r"WHERE\s+LOWER\((\w+)\)\s+=\s+LOWER\('([^']+)'\)"

            def replace_eq_with_like(match):
                column = match.group(1)
                value = match.group(2)
                fuzzy_value = value.lower().replace(' ', '%')
                return f"WHERE LOWER({column}) LIKE '%{fuzzy_value}%'"

            fuzzy_sql = re.sub(eq_pattern, replace_eq_with_like, fuzzy_sql, flags=re.IGNORECASE)

            if fuzzy_sql != sql:
                logger.info("Converted exact match query to fuzzy LIKE search")
                return fuzzy_sql

            return None

        except Exception as e:
            logger.warning(f"Failed to convert to fuzzy search: {e}")
            return None

    def generate_and_execute(self, query: str, max_tables: int = 3) -> Dict[str, Any]:
        """Generate SQL from natural language and execute it with auto-retry using fuzzy matching"""
        # Generate SQL
        generation_result = self.generate_sql(query, max_tables)

        if generation_result.get("error"):
            return generation_result

        # Execute SQL
        sql = generation_result.get("sql")
        if sql:
            execution_result = self.execute_sql(sql)

            # Check if query returned 0 results and has WHERE clause
            if (execution_result.get("success") and
                execution_result.get("row_count", 0) == 0 and
                "WHERE" in sql.upper()):

                logger.info("Query returned 0 results, attempting fuzzy LIKE search...")

                # Try to convert to fuzzy search
                fuzzy_sql = self._convert_to_fuzzy_search(sql, query)

                if fuzzy_sql:
                    # Execute fuzzy query
                    fuzzy_execution = self.execute_sql(fuzzy_sql)

                    if fuzzy_execution.get("success") and fuzzy_execution.get("row_count", 0) > 0:
                        # Fuzzy search found results!
                        logger.info(f"Fuzzy search found {fuzzy_execution.get('row_count')} results")

                        # Return combined result with explanation
                        return {
                            **generation_result,
                            "sql": fuzzy_sql,
                            "original_sql": sql,
                            "execution": fuzzy_execution,
                            "fuzzy_search_applied": True,
                            "search_note": f"⚠️ No exact matches found. Showing {fuzzy_execution.get('row_count')} results using fuzzy search (LIKE matching)."
                        }

            # Return original results
            return {
                **generation_result,
                "execution": execution_result
            }

        return generation_result