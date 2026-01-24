"""
BigQuery SQL Generator - NLP to SQL for AXIS.AI with configurable datasets

Integrates with WeaviateKnowledgeService for:
- Dynamic few-shot SQL examples
- Financial metric definitions and formulas
- Synonym resolution (e.g., "revenue" -> "Gross_Revenue")
- Column type detection for formatting
"""
from typing import List, Dict, Any, Optional
import structlog
from src.core.llm_client import LLMClient
from src.core.cache_manager import CacheManager
from src.db.bigquery import BigQueryClient
from src.config import settings

# Import knowledge service for semantic search
try:
    from src.core.knowledge_graph.weaviate_knowledge_service import (
        get_knowledge_service,
        WeaviateKnowledgeService
    )
    KNOWLEDGE_SERVICE_AVAILABLE = True
except ImportError:
    KNOWLEDGE_SERVICE_AVAILABLE = False

logger = structlog.get_logger()


class BigQuerySQLGenerator:
    """SQL generator for BigQuery with configurable project/dataset"""

    def __init__(self, project_id: str = None, dataset_id: str = None):
        self.project_id = project_id or settings.google_cloud_project
        self.dataset_id = dataset_id or settings.bigquery_dataset

        if not self.project_id:
            raise ValueError("BigQuery project ID not configured. Set GOOGLE_CLOUD_PROJECT in .env")
        if not self.dataset_id:
            raise ValueError("BigQuery dataset not configured. Set BIGQUERY_DATASET in .env")

        self.llm_client = LLMClient()
        self.bq_client = BigQueryClient()

        # Override client's dataset if different
        if self.dataset_id != self.bq_client.dataset_id:
            self.bq_client.dataset_id = self.dataset_id

        # Cache for schema info
        self._schema_cache = None

        # Parse allowed tables from config (comma-separated list)
        self.allowed_tables = None
        if settings.bigquery_allowed_tables:
            self.allowed_tables = [
                t.strip() for t in settings.bigquery_allowed_tables.split(',')
                if t.strip()
            ]
            logger.info(f"Table access restricted to: {self.allowed_tables}")

        # Initialize knowledge service for semantic search
        self.knowledge_service = None
        if KNOWLEDGE_SERVICE_AVAILABLE:
            try:
                self.knowledge_service = get_knowledge_service()
                logger.info("Knowledge service initialized for BigQuery generator")
            except Exception as e:
                logger.warning(f"Failed to initialize knowledge service: {e}")
                self.knowledge_service = None

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
                logger.info("Cache manager initialized for BigQuery generator")
            except Exception as e:
                logger.warning(f"Failed to initialize cache manager: {e}")
                self.cache_manager = None

        logger.info(f"BigQuery SQL Generator initialized: {self.project_id}.{self.dataset_id}")

    def get_available_datasets(self) -> List[str]:
        """List all available datasets in the project"""
        try:
            from google.cloud import bigquery
            datasets = list(self.bq_client.client.list_datasets(self.project_id))
            return [ds.dataset_id for ds in datasets]
        except Exception as e:
            logger.error(f"Failed to list datasets: {e}")
            return []

    def set_dataset(self, dataset_id: str):
        """Switch to a different dataset"""
        self.dataset_id = dataset_id
        self.bq_client.dataset_id = dataset_id
        self._schema_cache = None  # Clear schema cache
        logger.info(f"Switched to dataset: {dataset_id}")

    def list_tables(self) -> List[str]:
        """List all tables in the current dataset (filtered by allowed_tables if set)"""
        try:
            all_tables = self.bq_client.list_tables()
            if self.allowed_tables:
                # Filter to only allowed tables
                filtered = [t for t in all_tables if t in self.allowed_tables]
                logger.debug(f"Filtered tables from {len(all_tables)} to {len(filtered)}")
                return filtered
            return all_tables
        except Exception as e:
            logger.error(f"Failed to list tables: {e}")
            return []

    def get_table_schema(self, table_name: str) -> Dict[str, Any]:
        """Get schema for a specific table (respects allowed_tables restriction)"""
        try:
            # Check if table is allowed
            if self.allowed_tables and table_name not in self.allowed_tables:
                logger.warning(f"Access denied to table {table_name} - not in allowed_tables")
                return {}
            return self.bq_client.get_table_schema(table_name)
        except Exception as e:
            logger.error(f"Failed to get schema for {table_name}: {e}")
            return {}

    def _get_data_date_range(self) -> str:
        """Get the actual date range of data in the main transaction table.

        This is used to inform the LLM about available data dates so it doesn't
        query for dates outside the data range (which would return no results).
        """
        try:
            # Check cache first
            cache_key = f"data_date_range:{self.dataset_id}"
            if self.cache_manager:
                cached = self.cache_manager.redis.get(cache_key)
                if cached:
                    return cached

            # Query the date range from the main table
            sql = f"""
            SELECT
                MIN(Posting_Date) as min_date,
                MAX(Posting_Date) as max_date
            FROM `{self.project_id}.{self.dataset_id}.dataset_25m_table`
            WHERE Posting_Date IS NOT NULL
            """
            results = self.bq_client.execute_query(sql)

            if results and len(results) > 0:
                min_date = results[0].get('min_date')
                max_date = results[0].get('max_date')

                if min_date and max_date:
                    # Format as human-readable string
                    min_str = min_date.strftime('%B %Y') if hasattr(min_date, 'strftime') else str(min_date)
                    max_str = max_date.strftime('%B %Y') if hasattr(max_date, 'strftime') else str(max_date)

                    date_range_info = f"Data is available from {min_str} to {max_str}. The most recent data is {max_str}."

                    # Cache for 1 hour
                    if self.cache_manager:
                        self.cache_manager.redis.setex(cache_key, 3600, date_range_info)

                    logger.info(f"Data date range: {date_range_info}")
                    return date_range_info

            return "Data date range could not be determined. Use all available data without date filtering."

        except Exception as e:
            logger.warning(f"Failed to get data date range: {e}")
            return "Data date range could not be determined. Use all available data without date filtering."

    def get_table_schemas(self, relevant_tables: Optional[List[str]] = None, query: str = "") -> List[Dict[str, Any]]:
        """Get schema information for relevant tables"""
        try:
            # Get all tables if not specified
            if relevant_tables is None:
                relevant_tables = self.list_tables()

            schemas = []
            for table_name in relevant_tables:
                try:
                    schema_info = self.get_table_schema(table_name)
                    if schema_info:
                        # Format for LLM
                        formatted_columns = []
                        for col in schema_info.get("columns", []):
                            formatted_col = {
                                "name": col.get("name", ""),
                                "type": col.get("type", ""),
                                "is_nullable": col.get("is_nullable", True),
                                "description": col.get("description", "")
                            }
                            formatted_columns.append(formatted_col)

                        # Apply column filtering for relevance if query provided
                        if query:
                            formatted_columns = self._filter_relevant_columns(query, table_name, formatted_columns)

                        schemas.append({
                            "table_name": table_name,
                            "columns": formatted_columns,
                            "description": schema_info.get("description", f"Table: {table_name}"),
                            "row_count": schema_info.get("row_count", 0)
                        })
                except Exception as e:
                    logger.warning(f"Failed to get schema for {table_name}: {e}")
                    continue

            return schemas
        except Exception as e:
            logger.error(f"Error getting table schemas: {e}")
            return []

    def _filter_relevant_columns(
        self,
        query: str,
        table_name: str,
        all_columns: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Filter columns based on query relevance"""
        try:
            query_lower = query.lower()
            relevant_columns = []

            for col in all_columns:
                col_name = col['name'].lower()
                col_score = 0

                # Direct match with query terms
                query_terms = set(query_lower.split())
                if any(term in col_name for term in query_terms):
                    col_score += 10

                # Semantic matching for common patterns
                if 'sales' in query_lower or 'revenue' in query_lower:
                    if any(x in col_name for x in ['sales', 'revenue', 'amount', 'value']):
                        col_score += 5

                if 'margin' in query_lower or 'profit' in query_lower:
                    if any(x in col_name for x in ['margin', 'gm', 'profit', 'cost']):
                        col_score += 5

                if 'customer' in query_lower:
                    if any(x in col_name for x in ['customer', 'cust', 'party', 'buyer']):
                        col_score += 5

                if 'product' in query_lower or 'material' in query_lower:
                    if any(x in col_name for x in ['product', 'material', 'item', 'sku']):
                        col_score += 5

                if 'date' in query_lower or 'time' in query_lower or 'period' in query_lower:
                    if any(x in col_name for x in ['date', 'time', 'period', 'year', 'month']):
                        col_score += 5

                # Always include key columns
                if any(x in col_name for x in ['id', 'date', 'name', 'number', 'key']):
                    col_score += 2

                if col_score > 0:
                    col['relevance_score'] = col_score
                    relevant_columns.append(col)

            # Sort by relevance and limit
            relevant_columns.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
            top_columns = relevant_columns[:25] if len(relevant_columns) > 25 else relevant_columns

            if top_columns:
                logger.info(f"Filtered {len(all_columns)} → {len(top_columns)} columns for {table_name}")
                return top_columns

            return all_columns  # Fallback to all columns
        except Exception as e:
            logger.warning(f"Column filtering failed: {e}")
            return all_columns

    def _identify_relevant_tables(self, query: str) -> List[str]:
        """Identify relevant tables based on query keywords"""
        query_lower = query.lower()
        all_tables = self.list_tables()

        # Define keyword mappings - only for allowed tables
        table_keywords = {
            "dataset_25m_table": ["customer", "client", "buyer", "sold", "name", "sales", "revenue", "margin", "product", "material", "brand", "gross", "net", "profit", "transaction"],
            "sales_order_cockpit_export": ["sales order", "order", "delivery", "shipment", "ship"],
        }

        relevant_tables = []
        for table in all_tables:
            table_lower = table.lower()

            # Check if table name matches query keywords
            keywords = table_keywords.get(table, [])
            if any(keyword in query_lower for keyword in keywords):
                relevant_tables.append(table)
            # Also check if query mentions table name directly
            elif any(word in table_lower for word in query_lower.split()):
                relevant_tables.append(table)

        # Default to transaction_data if nothing found
        if not relevant_tables:
            if "transaction_data" in all_tables:
                relevant_tables = ["transaction_data"]
            else:
                # Take first 3 tables
                relevant_tables = all_tables[:3]

        return relevant_tables[:5]  # Limit to 5 tables

    def _fix_current_date_queries(self, sql: str) -> str:
        """Remove CURRENT_DATE() based filtering since data has fixed date range.

        Also fixes wrong date column usage (REFERENCESDDOCUMENT -> Posting_Date).
        """
        import re

        original_sql = sql

        # CRITICAL FIX: Replace EXTRACT(YEAR FROM CURRENT_DATE()) with 2025 (max year in data)
        # This catches patterns like: WHERE EXTRACT(YEAR FROM col) = EXTRACT(YEAR FROM CURRENT_DATE())
        sql = re.sub(
            r"EXTRACT\s*\(\s*YEAR\s+FROM\s+CURRENT_DATE\s*\(\s*\)\s*\)",
            '2025',
            sql,
            flags=re.IGNORECASE
        )

        # CRITICAL FIX: Replace date_column with Posting_Date (LLM sometimes hallucinates this column)
        sql = re.sub(r'\bdate_column\b', 'Posting_Date', sql, flags=re.IGNORECASE)

        # CRITICAL FIX: Replace Order_Date in WHERE clause date filtering with Posting_Date
        # Order_Date may not exist or have different meaning - Posting_Date is the canonical date
        sql = re.sub(
            r"EXTRACT\s*\(\s*(YEAR|MONTH|DAY|QUARTER)\s+FROM\s+Order_Date\s*\)",
            r'EXTRACT(\1 FROM Posting_Date)',
            sql,
            flags=re.IGNORECASE
        )

        # CRITICAL FIX: Replace Header_Creation_Date with Posting_Date (LLM hallucinates this column)
        sql = re.sub(
            r"PARSE_DATE\s*\(\s*'[^']+'\s*,\s*Header_Creation_Date\s*\)",
            'Posting_Date',
            sql,
            flags=re.IGNORECASE
        )
        sql = re.sub(r'\bHeader_Creation_Date\b', 'Posting_Date', sql, flags=re.IGNORECASE)

        # Fix 1: Replace wrong date column parsing with Posting_Date
        # Pattern: PARSE_DATE('%Y%m%d', SUBSTRING(REFERENCESDDOCUMENT, ...)) -> Posting_Date
        sql = re.sub(
            r"PARSE_DATE\s*\(\s*'%Y%m%d'\s*,\s*SUBSTRING\s*\(\s*REFERENCESDDOCUMENT[^)]*\)\s*\)",
            'Posting_Date',
            sql,
            flags=re.IGNORECASE
        )
        # Pattern: CAST(SUBSTRING(REFERENCESDDOCUMENT, ...) AS DATE) -> Posting_Date
        sql = re.sub(
            r"CAST\s*\(\s*SUBSTRING\s*\(\s*REFERENCESDDOCUMENT[^)]*\)\s*AS\s+DATE\s*\)",
            'Posting_Date',
            sql,
            flags=re.IGNORECASE
        )

        # Fix 2: Remove CURRENT_DATE() based filtering entirely
        # Remove conditions like: AND Posting_Date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
        sql = re.sub(
            r"\s+AND\s+\w+\s*>=\s*DATE_SUB\s*\(\s*CURRENT_DATE\s*\(\s*\)\s*,\s*INTERVAL\s+\d+\s+\w+\s*\)",
            '',
            sql,
            flags=re.IGNORECASE
        )

        # Remove standalone WHERE conditions with CURRENT_DATE (not preceded by AND)
        sql = re.sub(
            r"\s+AND\s+Posting_Date\s*>=\s*DATE_SUB\s*\(\s*CURRENT_DATE\s*\(\s*\)\s*,\s*INTERVAL\s+\d+\s+\w+\s*\)",
            '',
            sql,
            flags=re.IGNORECASE
        )

        # Remove WHERE conditions with CURRENT_DATE when followed by GROUP/ORDER
        sql = re.sub(
            r"WHERE\s+\w+\s*>=\s*DATE_SUB\s*\(\s*CURRENT_DATE\s*\(\s*\)\s*,\s*INTERVAL\s+\d+\s+\w+\s*\)\s*(GROUP|ORDER)",
            r'WHERE Posting_Date IS NOT NULL \1',
            sql,
            flags=re.IGNORECASE
        )

        # More general pattern - remove entire lines containing CURRENT_DATE()
        lines = sql.split('\n')
        filtered_lines = []
        removed_count = 0
        for line in lines:
            line_upper = line.upper()
            has_current_date = 'CURRENT_DATE' in line_upper
            has_condition = 'AND' in line_upper or '>=' in line_upper
            if has_current_date and has_condition:
                # Skip lines with CURRENT_DATE in conditions
                logger.warning(f"REMOVING CURRENT_DATE line: [{line.strip()}]")
                removed_count += 1
                continue
            filtered_lines.append(line)
        sql = '\n'.join(filtered_lines)
        if removed_count > 0:
            logger.warning(f"Removed {removed_count} lines containing CURRENT_DATE()")

        # Remove the complex REFERENCESDDOCUMENT conditions entirely
        sql = re.sub(
            r"\s+AND\s+LENGTH\s*\(\s*REFERENCESDDOCUMENT\s*\)\s*>=\s*\d+",
            '',
            sql,
            flags=re.IGNORECASE
        )
        sql = re.sub(
            r"\s+AND\s+REGEXP_CONTAINS\s*\(\s*SUBSTRING\s*\(\s*REFERENCESDDOCUMENT[^)]*\)[^)]*\)",
            '',
            sql,
            flags=re.IGNORECASE
        )
        sql = re.sub(
            r"WHERE\s+REFERENCESDDOCUMENT\s+IS\s+NOT\s+NULL\s+AND",
            'WHERE',
            sql,
            flags=re.IGNORECASE
        )

        # Clean up double spaces and newlines
        sql = re.sub(r'\n\s*\n', '\n', sql)
        sql = re.sub(r'  +', ' ', sql)

        # Fix BigQuery CTE column name conflicts - when a CTE and column have same name
        # This causes "No matching signature for aggregate function" errors
        # Solution: rename columns that conflict with CTE names
        cte_pattern = r'WITH\s+(\w+)\s+AS'
        cte_matches = re.findall(cte_pattern, sql, flags=re.IGNORECASE)
        logger.info(f"CTE conflict check - found CTEs: {cte_matches}")
        for cte_name in cte_matches:
            # If a column has same name as CTE, rename it with _value suffix
            col_pattern = rf'\b{cte_name}\s+AS\s+{cte_name}\b'
            if re.search(col_pattern, sql, flags=re.IGNORECASE):
                sql = re.sub(col_pattern, f'{cte_name} AS {cte_name}_value', sql, flags=re.IGNORECASE)
                # Also update references to this column in aggregates
                sql = re.sub(rf'AVG\s*\(\s*{cte_name}\s*\)', f'AVG({cte_name}_value)', sql, flags=re.IGNORECASE)
                sql = re.sub(rf'SUM\s*\(\s*{cte_name}\s*\)', f'SUM({cte_name}_value)', sql, flags=re.IGNORECASE)
                logger.info(f"Fixed CTE column name conflict for: {cte_name}")

            # Also fix case where column is named same as CTE in subsequent CTEs
            # e.g., SUM(...) AS monthly_revenue in CTE monthly_revenue
            # Use .+? to handle nested parentheses like SUM(COALESCE(...))
            sum_pattern = rf'(SUM\s*\(.+?\))\s+AS\s+{cte_name}\b'
            sum_match = re.search(sum_pattern, sql, flags=re.IGNORECASE)
            logger.info(f"CTE conflict check - SUM pattern for {cte_name}: {sum_match.group(0) if sum_match else 'No match'}")
            if sum_match:
                # Rename the column to avoid conflict
                sql = re.sub(sum_pattern, rf'\1 AS {cte_name}_amount', sql, flags=re.IGNORECASE)
                # Update all references to this column throughout the SQL
                # But be careful not to replace the CTE name itself in FROM clauses
                # Only replace column references (preceded by comma, SELECT, or in functions)
                sql = re.sub(rf'AVG\s*\(\s*{cte_name}\s*\)', f'AVG({cte_name}_amount)', sql, flags=re.IGNORECASE)
                sql = re.sub(rf',\s*\n\s*{cte_name}\s*,', f',\n {cte_name}_amount,', sql, flags=re.IGNORECASE)
                sql = re.sub(rf',\s*{cte_name}\s*,', f', {cte_name}_amount,', sql, flags=re.IGNORECASE)
                sql = re.sub(rf'SELECT\s+\n?\s*{cte_name}\s*,', f'SELECT\n {cte_name}_amount,', sql, flags=re.IGNORECASE)
                sql = re.sub(rf'ROUND\s*\(\s*{cte_name}\s*,', f'ROUND({cte_name}_amount,', sql, flags=re.IGNORECASE)
                # Also handle standalone column reference after SELECT or comma
                sql = re.sub(rf'(?<=,)\s*{cte_name}(?=\s*,|\s+AS)', f' {cte_name}_amount', sql, flags=re.IGNORECASE)
                sql = re.sub(rf'(?<=SELECT)\s+{cte_name}(?=\s*,)', f' {cte_name}_amount', sql, flags=re.IGNORECASE)
                logger.info(f"Fixed CTE column name conflict (SUM pattern) for: {cte_name}")

        if sql != original_sql:
            logger.info(f"Fixed CURRENT_DATE() and/or REFERENCESDDOCUMENT in SQL")

        return sql

    def _fix_postgresql_syntax(self, sql: str) -> str:
        """Fix common PostgreSQL syntax that might slip through to BigQuery"""
        import re

        fixed_sql = sql

        # Fix to_char() -> FORMAT() - handle nested parentheses
        # Pattern matches to_char with any content including nested parens
        def fix_to_char(sql_str):
            result = sql_str
            # Find all to_char occurrences
            while True:
                match = re.search(r'to_char\s*\(', result, flags=re.IGNORECASE)
                if not match:
                    break

                start = match.start()
                # Find matching closing paren
                paren_count = 0
                end = match.end() - 1  # Position of opening paren
                for i in range(match.end() - 1, len(result)):
                    if result[i] == '(':
                        paren_count += 1
                    elif result[i] == ')':
                        paren_count -= 1
                        if paren_count == 0:
                            end = i + 1
                            break

                # Extract the full to_char(...) call
                to_char_call = result[start:end]

                # Parse arguments (simple split by comma, handling nested parens)
                inner = to_char_call[to_char_call.index('(') + 1:-1]

                # Split on comma not inside parens
                args = []
                current_arg = ""
                depth = 0
                for char in inner:
                    if char == '(':
                        depth += 1
                    elif char == ')':
                        depth -= 1
                    elif char == ',' and depth == 0:
                        args.append(current_arg.strip())
                        current_arg = ""
                        continue
                    current_arg += char
                if current_arg.strip():
                    args.append(current_arg.strip())

                if len(args) >= 2:
                    value = args[0]
                    format_str = args[1].strip("'\"")
                    # Replace with CAST and ROUND for number formatting
                    # BigQuery FORMAT doesn't support %,.2f - use CAST instead
                    replacement = f"CAST(ROUND({value}, 2) AS STRING)"
                else:
                    replacement = f"CAST({args[0]} AS STRING)" if args else to_char_call

                result = result[:start] + replacement + result[end:]

            return result

        fixed_sql = fix_to_char(fixed_sql)

        # Fix ::type casting -> CAST()
        # Pattern: column::numeric, column::date, etc.
        cast_pattern = r"(\w+)::(\w+)"
        fixed_sql = re.sub(cast_pattern, r"CAST(\1 AS \2)", fixed_sql)

        # Fix NOW() -> CURRENT_TIMESTAMP()
        fixed_sql = re.sub(r'\bNOW\s*\(\s*\)', 'CURRENT_TIMESTAMP()', fixed_sql, flags=re.IGNORECASE)

        # Fix CURRENT_DATE without parentheses -> CURRENT_DATE()
        fixed_sql = re.sub(r'\bCURRENT_DATE\b(?!\s*\()', 'CURRENT_DATE()', fixed_sql, flags=re.IGNORECASE)

        # Fix PostgreSQL DATE_TRUNC syntax: DATE_TRUNC('month', date) -> DATE_TRUNC(date, MONTH)
        # BigQuery uses: DATE_TRUNC(date_expression, date_part)
        def fix_date_trunc(sql_str):
            """Convert PostgreSQL DATE_TRUNC to BigQuery syntax"""
            result = sql_str
            # Pattern: DATE_TRUNC('month', column) or DATE_TRUNC('year', column)
            pattern = r"DATE_TRUNC\s*\(\s*['\"](\w+)['\"]\s*,\s*([^)]+)\)"

            def replace_date_trunc(match):
                date_part = match.group(1).upper()
                date_expr = match.group(2).strip()
                return f"DATE_TRUNC({date_expr}, {date_part})"

            result = re.sub(pattern, replace_date_trunc, result, flags=re.IGNORECASE)
            return result

        fixed_sql = fix_date_trunc(fixed_sql)

        # Fix PostgreSQL INTERVAL syntax: INTERVAL '2 years' -> INTERVAL 2 YEAR
        # BigQuery uses: DATE_SUB/DATE_ADD with INTERVAL n UNIT
        def fix_interval_syntax(sql_str):
            """Convert PostgreSQL INTERVAL to BigQuery syntax"""
            result = sql_str

            # Pattern: CURRENT_DATE() - INTERVAL '2 years' -> DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR)
            # Also handle: date_col - INTERVAL '30 days'
            pattern = r"(\w+(?:\(\))?)\s*-\s*INTERVAL\s*['\"](\d+)\s*(\w+)['\"]"

            def replace_interval_sub(match):
                date_expr = match.group(1)
                num = match.group(2)
                unit = match.group(3).upper().rstrip('S')  # Remove plural 's'
                return f"DATE_SUB({date_expr}, INTERVAL {num} {unit})"

            result = re.sub(pattern, replace_interval_sub, result, flags=re.IGNORECASE)

            # Also fix: + INTERVAL '...'
            pattern_add = r"(\w+(?:\(\))?)\s*\+\s*INTERVAL\s*['\"](\d+)\s*(\w+)['\"]"

            def replace_interval_add(match):
                date_expr = match.group(1)
                num = match.group(2)
                unit = match.group(3).upper().rstrip('S')
                return f"DATE_ADD({date_expr}, INTERVAL {num} {unit})"

            result = re.sub(pattern_add, replace_interval_add, result, flags=re.IGNORECASE)

            # Fix standalone INTERVAL comparison: >= CURRENT_DATE() - INTERVAL 2 YEAR
            # This pattern handles when DATE_SUB was already partially applied but the format is still wrong
            pattern_standalone = r"INTERVAL\s*['\"]?(\d+)\s*(\w+)['\"]?"

            def replace_standalone_interval(match):
                num = match.group(1)
                unit = match.group(2).upper().rstrip('S')
                return f"INTERVAL {num} {unit}"

            result = re.sub(pattern_standalone, replace_standalone_interval, result, flags=re.IGNORECASE)

            return result

        fixed_sql = fix_interval_syntax(fixed_sql)

        # Fix malformed DATE_TRUNC with extra comma: DATE_TRUNC(CURRENT_DATE(, YEAR)) -> DATE_TRUNC(CURRENT_DATE(), YEAR)
        fixed_sql = re.sub(r'DATE_TRUNC\s*\(\s*CURRENT_DATE\s*\(\s*,', 'DATE_TRUNC(CURRENT_DATE(),', fixed_sql, flags=re.IGNORECASE)

        # Fix any remaining - INTERVAL patterns that weren't caught
        # Pattern: expression - INTERVAL n UNIT (without quotes) -> DATE_SUB(expression, INTERVAL n UNIT)
        def fix_remaining_interval(sql_str):
            """Fix any remaining date - INTERVAL patterns"""
            result = sql_str

            # First, fix nested DATE_TRUNC with matching parens
            # Pattern: DATE_TRUNC(DATE_TRUNC(...), UNIT)) - INTERVAL -> unbalanced parens issue
            # Find and fix: DATE_TRUNC(...)) - INTERVAL (extra close paren before INTERVAL)
            result = re.sub(r'\)\)\s*-\s*INTERVAL', ') - INTERVAL', result)

            # Now handle DATE_TRUNC(...) - INTERVAL patterns properly
            # Need to handle nested parens in DATE_TRUNC
            def replace_with_date_sub(sql):
                """Replace expr - INTERVAL with DATE_SUB(expr, INTERVAL)"""
                # Find - INTERVAL patterns
                interval_match = re.search(r'\s*-\s*(INTERVAL\s+\d+\s+\w+)', sql, flags=re.IGNORECASE)
                if not interval_match:
                    return sql

                interval_start = interval_match.start()
                interval_expr = interval_match.group(1)

                # Find the expression before - INTERVAL by matching parens backwards
                prefix = sql[:interval_start]

                # Try to find a balanced expression ending before the -
                # Could be: DATE_TRUNC(...), CURRENT_DATE(), or a column name
                expr_end = len(prefix.rstrip())

                # Check if it ends with a closing paren
                if prefix.rstrip().endswith(')'):
                    # Find matching open paren
                    paren_count = 0
                    expr_start = expr_end - 1
                    for i in range(expr_end - 1, -1, -1):
                        if prefix[i] == ')':
                            paren_count += 1
                        elif prefix[i] == '(':
                            paren_count -= 1
                            if paren_count == 0:
                                # Found the matching open paren, now find function name
                                # Go back to find word characters (function name)
                                j = i - 1
                                while j >= 0 and prefix[j] in ' \t\n':
                                    j -= 1
                                while j >= 0 and (prefix[j].isalnum() or prefix[j] == '_'):
                                    j -= 1
                                expr_start = j + 1
                                break

                    date_expr = prefix[expr_start:expr_end].strip()
                    before_expr = prefix[:expr_start]
                    after_interval = sql[interval_match.end():]

                    return before_expr + f"DATE_SUB({date_expr}, {interval_expr})" + after_interval
                else:
                    # Simple column or word, use basic pattern
                    word_match = re.search(r'(\w+)\s*$', prefix)
                    if word_match:
                        date_expr = word_match.group(1)
                        before_expr = prefix[:word_match.start()]
                        after_interval = sql[interval_match.end():]
                        return before_expr + f"DATE_SUB({date_expr}, {interval_expr})" + after_interval

                return sql

            # Apply the fix iteratively until no more changes
            prev_result = ""
            while prev_result != result and '- INTERVAL' in result.upper():
                prev_result = result
                if 'DATE_SUB' not in result[result.upper().find('- INTERVAL')-20:result.upper().find('- INTERVAL')].upper():
                    result = replace_with_date_sub(result)
                else:
                    break

            return result

        fixed_sql = fix_remaining_interval(fixed_sql)

        # Fix ROUND on DATE columns: CAST(ROUND(month, 2) AS STRING) -> FORMAT_DATE('%Y-%m', month)
        # This happens when LLM tries to format a DATE column incorrectly
        def fix_round_on_date(sql_str):
            """Fix ROUND applied to DATE columns"""
            result = sql_str

            # Pattern: CAST(ROUND(column, n) AS STRING) AS column
            # where column is likely a date (named month, date, period, etc.)
            pattern = r"CAST\s*\(\s*ROUND\s*\(\s*(\w+)\s*,\s*\d+\s*\)\s*AS\s+STRING\s*\)"

            def replace_if_date(match):
                col_name = match.group(1).lower()
                # Check if this looks like a date column
                date_indicators = ['month', 'date', 'period', 'day', 'year', 'week', 'quarter']
                if any(ind in col_name for ind in date_indicators):
                    # Replace with FORMAT_DATE for proper date formatting
                    if 'month' in col_name:
                        return f"FORMAT_DATE('%Y-%m', {match.group(1)})"
                    elif 'year' in col_name:
                        return f"FORMAT_DATE('%Y', {match.group(1)})"
                    elif 'quarter' in col_name:
                        return f"FORMAT_DATE('%Y-Q%Q', {match.group(1)})"
                    else:
                        return f"CAST({match.group(1)} AS STRING)"
                return match.group(0)  # Keep original if not a date

            result = re.sub(pattern, replace_if_date, result, flags=re.IGNORECASE)
            return result

        fixed_sql = fix_round_on_date(fixed_sql)

        # Fix || string concatenation to CONCAT() - BigQuery prefers CONCAT
        # Pattern: 'string' || expr or expr || 'string'
        def fix_string_concat(sql_str):
            """Convert || concatenation to CONCAT()"""
            result = sql_str

            # Simple pattern: expr || 'suffix'
            # Match: CAST(...) || '%' or similar
            pattern = r"((?:CAST\s*\([^)]+\)|[\w'\"]+(?:\([^)]*\))?)\s*\|\|\s*('[^']*'))"

            def replace_concat(match):
                left = match.group(1).strip()
                right = match.group(2).strip()
                return f"CONCAT({left}, {right})"

            result = re.sub(pattern, replace_concat, result, flags=re.IGNORECASE)

            # Also handle: 'prefix' || expr
            pattern2 = r"('[^']*')\s*\|\|\s*((?:CAST\s*\([^)]+\)|[\w]+(?:\([^)]*\))?))"

            result = re.sub(pattern2, replace_concat, result, flags=re.IGNORECASE)

            return result

        fixed_sql = fix_string_concat(fixed_sql)

        # Fix malformed ROUND(ROUND(...) AS pattern - missing closing paren
        # Pattern: ROUND(ROUND(expr, n) AS alias -> ROUND(expr, n) AS alias
        def fix_double_round(sql_str):
            """Fix double ROUND without proper closing"""
            result = sql_str

            # Pattern: ROUND(ROUND(something, n) AS - missing middle close paren
            # This is malformed - simplify to single ROUND
            pattern = r'ROUND\s*\(\s*ROUND\s*\(([^,]+),\s*(\d+)\s*\)\s+AS\s+'
            result = re.sub(pattern, r'ROUND(\1, \2) AS ', result, flags=re.IGNORECASE)

            return result

        fixed_sql = fix_double_round(fixed_sql)

        # Fix unbalanced parentheses - check whole SQL statement
        def fix_unbalanced_parens(sql_str):
            """Attempt to fix unbalanced parentheses in SQL at statement level"""
            # Check overall balance first
            total_open = sql_str.count('(')
            total_close = sql_str.count(')')

            if total_open == total_close:
                return sql_str  # Already balanced

            # If we have more opens than closes, we need to add closing parens
            if total_open > total_close:
                diff = total_open - total_close
                # Add before LIMIT or at end of last SELECT line
                if 'LIMIT' in sql_str.upper():
                    limit_pos = sql_str.upper().rfind('LIMIT')
                    # Find the start of LIMIT clause
                    sql_str = sql_str[:limit_pos].rstrip() + ')' * diff + ' ' + sql_str[limit_pos:]
                else:
                    sql_str = sql_str.rstrip(';') + ')' * diff + ';'

            return sql_str

        fixed_sql = fix_unbalanced_parens(fixed_sql)

        # Fix ORDER BY with original column name when using SELECT DISTINCT with aliases
        # BigQuery requires ORDER BY to use the alias, not the original column
        if 'SELECT DISTINCT' in fixed_sql.upper() and 'ORDER BY' in fixed_sql.upper():
            # Find all aliases: pattern AS alias_name
            alias_pattern = r'(\w+(?:\([^)]*\))?)\s+AS\s+(\w+)'
            aliases = re.findall(alias_pattern, fixed_sql, re.IGNORECASE)
            for original, alias in aliases:
                # Replace ORDER BY original_col with ORDER BY alias
                # Handle LOWER(col) and similar function calls
                escaped_original = re.escape(original)
                order_by_pattern = rf'(ORDER\s+BY\s+)({escaped_original})(\s|$|,)'
                fixed_sql = re.sub(order_by_pattern, rf'\g<1>{alias}\g<3>', fixed_sql, flags=re.IGNORECASE)

        # Remove currency formatting attempts - return raw numbers for frontend to format
        def remove_currency_formatting(sql_str):
            """Remove CONCAT('$', ...) patterns and return just the numeric expression"""
            result = sql_str

            # Pattern: CONCAT('$', CAST(ROUND(ROUND(expr, 2), 2) AS STRING))
            # Find CONCAT('$', and extract the inner numeric expression
            while True:
                match = re.search(r"CONCAT\s*\(\s*'\$'\s*,\s*CAST\s*\(", result, flags=re.IGNORECASE)
                if not match:
                    break

                start = match.start()
                # Find the matching closing paren for CONCAT
                paren_count = 0
                concat_start = result.find('(', start)
                end = concat_start
                for i in range(concat_start, len(result)):
                    if result[i] == '(':
                        paren_count += 1
                    elif result[i] == ')':
                        paren_count -= 1
                        if paren_count == 0:
                            end = i + 1
                            break

                # Extract inner expression - find ROUND or the expression inside CAST
                inner = result[match.end():end-1]  # Content after CAST(
                # Find the actual numeric expression
                round_match = re.search(r'ROUND\s*\(\s*ROUND\s*\((.+?),\s*2\s*\)\s*,\s*2\s*\)', inner, flags=re.IGNORECASE)
                if round_match:
                    numeric_expr = f"ROUND({round_match.group(1)}, 2)"
                else:
                    round_match = re.search(r'ROUND\s*\((.+?),\s*2\s*\)', inner, flags=re.IGNORECASE)
                    if round_match:
                        numeric_expr = f"ROUND({round_match.group(1)}, 2)"
                    else:
                        # Just use what's inside CAST
                        as_match = re.search(r'(.+?)\s+AS\s+STRING', inner, flags=re.IGNORECASE)
                        numeric_expr = as_match.group(1) if as_match else inner

                result = result[:start] + numeric_expr + result[end:]

            return result

        fixed_sql = remove_currency_formatting(fixed_sql)

        # Handle '$' || CAST(...) patterns - need to find matching parentheses
        def remove_dollar_concat(sql_str):
            """Remove '$' || CAST(...) patterns"""
            result = sql_str
            while True:
                match = re.search(r"'\$'\s*\|\|\s*CAST\s*\(", result, flags=re.IGNORECASE)
                if not match:
                    break

                start = match.start()
                # Find the opening paren of CAST
                cast_paren_start = result.find('(', match.end() - 1)
                # Find matching closing paren
                paren_count = 0
                end = cast_paren_start
                for i in range(cast_paren_start, len(result)):
                    if result[i] == '(':
                        paren_count += 1
                    elif result[i] == ')':
                        paren_count -= 1
                        if paren_count == 0:
                            end = i + 1
                            break

                # Extract content inside CAST(...)
                cast_content = result[cast_paren_start + 1:end - 1]

                # Find the actual expression (before AS STRING)
                as_match = re.search(r'(.+?)\s+AS\s+STRING', cast_content, flags=re.IGNORECASE)
                if as_match:
                    inner_expr = as_match.group(1).strip()
                    # Simplify double ROUND
                    inner_expr = re.sub(r'ROUND\s*\(\s*ROUND\s*\((.+?),\s*2\s*\)\s*,\s*2\s*\)',
                                       r'ROUND(\1, 2)', inner_expr, flags=re.IGNORECASE)
                else:
                    inner_expr = cast_content

                result = result[:start] + inner_expr + result[end:]

            return result

        fixed_sql = remove_dollar_concat(fixed_sql)

        # Fix ORDER BY with aggregate function referencing columns not in scope
        # When using CTE, ORDER BY should use alias from SELECT, not recalculate
        if 'WITH ' in fixed_sql.upper() and 'ORDER BY' in fixed_sql.upper():
            # Find ORDER BY position
            order_by_match = re.search(r'ORDER\s+BY\s+', fixed_sql, flags=re.IGNORECASE)
            if order_by_match:
                order_start = order_by_match.end()
                # Check if it starts with an aggregate function
                after_order = fixed_sql[order_start:].strip()
                if re.match(r'(SUM|AVG|COUNT|MAX|MIN)\s*\(', after_order, flags=re.IGNORECASE):
                    # Find the end of the aggregate function (matching parens)
                    paren_count = 0
                    func_end = 0
                    for i, c in enumerate(after_order):
                        if c == '(':
                            paren_count += 1
                        elif c == ')':
                            paren_count -= 1
                            if paren_count == 0:
                                func_end = i + 1
                                break

                    # Find aliases for aggregate columns in the CTE
                    select_part = fixed_sql.split('ORDER BY')[0]
                    # Match ROUND(SUM(...), 2) AS alias or SUM(...) AS alias
                    alias_pattern = r'(?:ROUND\s*\(\s*)?(SUM|AVG|COUNT|MAX|MIN)\s*\([^)]+\)[^)]*\)?\s*,?\s*\d*\s*\)?\s+AS\s+(\w+)'
                    aliases = re.findall(alias_pattern, select_part, flags=re.IGNORECASE)
                    if aliases:
                        alias_name = aliases[-1][1]
                        # Replace ORDER BY SUM(...) with ORDER BY alias
                        fixed_sql = fixed_sql[:order_start] + alias_name + fixed_sql[order_start + func_end:]

        if fixed_sql != sql:
            logger.info("Fixed PostgreSQL syntax in generated SQL")

        return fixed_sql

    def _get_metric_context(self, query: str) -> Optional[Dict[str, Any]]:
        """Get relevant metric definitions from knowledge service.

        Args:
            query: User's natural language query

        Returns:
            Dict with metric information or None if not found
        """
        if not self.knowledge_service:
            return None

        try:
            # Find metrics mentioned in the query
            metrics = self.knowledge_service.find_metrics(query, limit=3)

            if not metrics:
                return None

            # Build context for LLM
            metric_context = {
                "metrics": [],
                "formulas": {},
                "formatting_hints": {}
            }

            for metric in metrics:
                metric_info = {
                    "code": metric.metric_code,
                    "name": metric.metric_name,
                    "description": metric.description,
                    "formula": metric.formula,
                    "formula_sql": metric.formula_sql,
                    "is_percentage": metric.is_percentage,
                    "is_currency": metric.is_currency
                }
                metric_context["metrics"].append(metric_info)
                metric_context["formulas"][metric.metric_code] = metric.formula_sql

                # Add formatting hint
                if metric.is_percentage:
                    metric_context["formatting_hints"][metric.metric_code] = "percentage"
                elif metric.is_currency:
                    metric_context["formatting_hints"][metric.metric_code] = "currency"

            logger.info(f"Found {len(metrics)} relevant metrics for query")
            return metric_context

        except Exception as e:
            logger.warning(f"Error getting metric context: {e}")
            return None

    def _get_dynamic_examples(self, query: str) -> List[Dict[str, str]]:
        """Get relevant SQL examples from knowledge service.

        Args:
            query: User's natural language query

        Returns:
            List of SQL examples with question, sql, and explanation
        """
        if not self.knowledge_service:
            return []

        try:
            examples = self.knowledge_service.get_similar_sql_examples(
                query=query,
                limit=3,
                dialect="bigquery"
            )

            # Format examples for the LLM prompt
            formatted_examples = []
            for ex in examples:
                formatted_examples.append({
                    "question": ex["question"],
                    "sql": ex["sql"].format(
                        project=self.project_id,
                        dataset=self.dataset_id
                    ),
                    "explanation": ex.get("explanation", "")
                })

            logger.info(f"Retrieved {len(formatted_examples)} dynamic SQL examples")
            return formatted_examples

        except Exception as e:
            logger.warning(f"Error getting dynamic examples: {e}")
            return []

    def _build_metric_prompt_section(self, metric_context: Dict[str, Any]) -> str:
        """Build a prompt section with metric definitions.

        Args:
            metric_context: Dict containing metrics, formulas, formatting hints

        Returns:
            String to append to the LLM prompt
        """
        if not metric_context or not metric_context.get("metrics"):
            return ""

        prompt_parts = ["\n\n=== FINANCIAL METRIC DEFINITIONS ==="]
        prompt_parts.append("Use these definitions when calculating financial metrics:\n")

        for metric in metric_context["metrics"]:
            prompt_parts.append(f"**{metric['name']}** ({metric['code']}):")
            prompt_parts.append(f"  - Description: {metric['description']}")
            prompt_parts.append(f"  - Formula: {metric['formula']}")
            if metric.get('formula_sql'):
                prompt_parts.append(f"  - SQL Pattern: {metric['formula_sql']}")
            if metric['is_percentage']:
                prompt_parts.append("  - Format: Return as percentage (e.g., 25.5 for 25.5%)")
            elif metric['is_currency']:
                prompt_parts.append("  - Format: Return as numeric value (frontend will format as currency)")
            prompt_parts.append("")

        return "\n".join(prompt_parts)

    def generate_sql(
        self,
        query: str,
        max_tables: int = 5,
        force_refresh: bool = False,
        conversation_context: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Generate SQL from natural language query with optional conversation context"""
        logger.info(f"Generating BigQuery SQL for: {query}")

        try:
            # Check cache first
            cache_key = f"bq_sql:{self.dataset_id}:{query}"
            if self.cache_manager and not force_refresh:
                cached_result = self.cache_manager.redis.get(cache_key)
                if cached_result:
                    import json
                    logger.info("Returning cached BigQuery SQL")
                    result = json.loads(cached_result)
                    result["from_cache"] = True
                    return result

            # Identify relevant tables
            relevant_tables = self._identify_relevant_tables(query)
            logger.info(f"Identified relevant tables: {relevant_tables}")

            # Get schemas for relevant tables
            schemas = self.get_table_schemas(relevant_tables, query=query)

            if not schemas:
                return {
                    "error": "No relevant tables found in dataset",
                    "sql": None,
                    "tables_checked": relevant_tables,
                    "dataset": self.dataset_id
                }

            # Build fully qualified table reference
            table_prefix = f"`{self.project_id}.{self.dataset_id}`"

            # Get the actual data date range for time-based queries
            data_date_range = self._get_data_date_range()

            # Get metric context from knowledge service (if available)
            metric_context = self._get_metric_context(query)
            metric_prompt_section = self._build_metric_prompt_section(metric_context) if metric_context else ""

            # Get dynamic few-shot examples from knowledge service
            dynamic_examples = self._get_dynamic_examples(query)

            # Build conversation context section if available
            context_section = ""
            if conversation_context:
                context_section = """
            CONVERSATION CONTEXT - Use this to understand follow-up questions:
            The user may be asking a follow-up question. If the current question seems incomplete
            (e.g., "add customer name", "also show margin", "group by region"), refer to the
            previous SQL to understand what to modify.

            Recent conversation:
            """ + "\n            ".join(conversation_context) + """

            If this is a follow-up request, modify the previous SQL accordingly.
            """
                logger.info(f"Added conversation context: {len(conversation_context)} messages")

            # Enhance query with BigQuery context
            enhanced_query = f"""
            {query}
            {context_section}

            CRITICAL: This is Google BigQuery Standard SQL syntax - NOT PostgreSQL!
            {metric_prompt_section}

            BigQuery syntax rules:
            - Use backticks (`) for table names: `{self.project_id}.{self.dataset_id}.table_name`
            - Use LIMIT for limiting results
            - Use SAFE_DIVIDE(numerator, denominator) to prevent division by zero
            - Use DATE() for date functions
            - Use EXTRACT(YEAR FROM date_column) for extracting date parts
            - Use FORMAT_DATE('%Y-%m', date_column) for date formatting
            - Use IFNULL(column, default) or COALESCE() for null handling
            - Use CAST(column AS type) for type conversion
            - Use CONCAT() for string concatenation (NOT ||)
            - Use ROUND(value, decimals) for rounding

            CRITICAL - BigQuery Date/Time Functions (NOT PostgreSQL!):
            - DATE_TRUNC: Use DATE_TRUNC(date_column, MONTH) NOT DATE_TRUNC('month', date_column)
            - INTERVAL: Use DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR) NOT CURRENT_DATE() - INTERVAL '2 years'
            - Example monthly grouping: DATE_TRUNC(Posting_Date, MONTH) AS month
            - Example year filter: WHERE EXTRACT(YEAR FROM Posting_Date) IN (2023, 2024, 2025)
            - Year-over-year: Use EXTRACT(YEAR FROM date_column) and self-join or LAG() function

            CRITICAL - DATA DATE RANGE (MUST FOLLOW):
            {data_date_range}

            ABSOLUTE RULES FOR DATE HANDLING:
            1. NEVER use CURRENT_DATE(), DATE_SUB(CURRENT_DATE(), ...), or any function that references today's date
            2. The data has a FIXED date range - queries using CURRENT_DATE() WILL RETURN EMPTY RESULTS
            3. For "last N months" or "recent" queries: Use ORDER BY date DESC LIMIT N instead of date filtering
            4. For YoY: Compare specific years like 2024 vs 2023, not "this year vs last year"
            5. For MoM: Get all months with ORDER BY, not filtered by relative dates

            CORRECT PATTERNS:
            - "Last 6 months": ORDER BY month DESC LIMIT 6 (NOT: WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH))
            - "Recent data": ORDER BY Posting_Date DESC LIMIT 1000 (NOT: WHERE Posting_Date >= CURRENT_DATE() - 30)
            - "This year" or "YTD" or "year to date": WHERE EXTRACT(YEAR FROM Posting_Date) = 2025
            - "YTD revenue": SUM(Gross_Revenue) WHERE EXTRACT(YEAR FROM Posting_Date) = 2025

            CRITICAL - YEAR TO DATE (YTD) QUERIES:
            - For ANY "YTD", "year to date", "this year" query, use year = 2025 (the most recent complete year in data)
            - Example: "What is revenue YTD?" -> WHERE EXTRACT(YEAR FROM Posting_Date) = 2025
            - Example: "Show sales year to date" -> WHERE EXTRACT(YEAR FROM Posting_Date) = 2025
            - NEVER use CURRENT_DATE() or EXTRACT(YEAR FROM CURRENT_DATE()) - use the literal year 2025
            - The primary date column is Posting_Date - use this for all date filtering

            WRONG PATTERNS (WILL FAIL - RETURN EMPTY RESULTS):
            - DATE_SUB(CURRENT_DATE(), INTERVAL N MONTH)
            - WHERE Posting_Date >= CURRENT_DATE() - INTERVAL '6 months'
            - CURRENT_DATE() anywhere in the query
            - EXTRACT(YEAR FROM CURRENT_DATE())
            - WHERE EXTRACT(YEAR FROM column) = EXTRACT(YEAR FROM CURRENT_DATE())
            - Using Order_Date instead of Posting_Date for date filtering

            ROLLING AVERAGES AND WINDOW FUNCTIONS:
            - For rolling averages, use Posting_Date (the primary date column), NOT Sales_Order columns
            - Example rolling 3-month: AVG(value) OVER (ORDER BY DATE_TRUNC(Posting_Date, MONTH) ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)
            - Always use DATE_TRUNC(Posting_Date, MONTH) for monthly grouping

            IMPORTANT - Number and Currency Formatting in BigQuery:
            - Return numeric values as raw numbers (FLOAT64 or INT64), NOT as formatted strings
            - Do NOT format currency in SQL - return raw numeric values and let the frontend format them
            - Example: SELECT ROUND(SUM(revenue), 2) AS total_revenue (returns 1234567.89, not "$1,234,567.89")
            - Avoid CONCAT with $ or FORMAT for currency - just return the number

            DO NOT USE PostgreSQL functions like:
            - to_char() - not available in BigQuery
            - ::type casting - use CAST() instead
            - NOW() - use CURRENT_TIMESTAMP() instead
            - || for concatenation - use CONCAT() instead

            IMPORTANT TABLE GUIDANCE:
            - For customer data with names: Use `dataset_25m_table` which has Sold_to_Name (customer name), Sold_to_Number (customer ID), Payer_Name (parent company), Bill_to_Party_Name (billing entity)
            - When user asks for "customers" or "customer list", use dataset_25m_table and include Sold_to_Name (or Payer_Name for consolidated view), Sold_to_Number
            - For a simple customer list, use: SELECT DISTINCT Sold_to_Number, Sold_to_Name FROM dataset_25m_table
            - For sales orders and delivery info: Use `sales_order_cockpit_export`
            - ONLY use tables listed in AVAILABLE TABLES below - do not reference any other tables

            CRITICAL - TEXT CASE PRESERVATION:
            - NEVER use LOWER() on columns in SELECT statements - this converts "WALMART" to "walmart" which is wrong
            - Keep original case for all display columns: Sold_to_Name, Payer_Name, Material_Description, Brand, etc.
            - Example CORRECT: SELECT Sold_to_Name AS customer_name
            - Example WRONG: SELECT LOWER(Sold_to_Name) AS customer_name
            - Only use LOWER() in WHERE clauses for case-insensitive filtering, NOT in SELECT

            CRITICAL - NULL VALUE FILTERING FOR IDENTIFIER COLUMNS:
            - ALWAYS filter out NULL values for key identifier columns when listing or aggregating by them
            - When showing customers: WHERE Sold_to_Number IS NOT NULL AND Sold_to_Name IS NOT NULL
            - When showing products: WHERE Material IS NOT NULL AND Material_Description IS NOT NULL
            - When showing distributors: WHERE Distributor IS NOT NULL
            - When grouping by any column: Add WHERE column IS NOT NULL to exclude null groups
            - Example CORRECT: SELECT DISTINCT Sold_to_Number, Sold_to_Name FROM table WHERE Sold_to_Number IS NOT NULL
            - Example WRONG: SELECT DISTINCT Sold_to_Number, Sold_to_Name FROM table (returns null rows)
            - This prevents confusing "null | null" rows in query results

            AVAILABLE TABLES - YOU MUST ONLY USE THESE TABLES:
            {', '.join([f"`{self.project_id}.{self.dataset_id}.{s['table_name']}`" for s in schemas])}

            DERIVED METRICS - ALWAYS TRY TO CALCULATE:
            Before saying data is "not available", check if you can DERIVE the metric from available columns:

            1. Operating Income / EBIT = Net_Sales - Total_COGS (or Gross_Revenue - Total_COS)
            2. Gross Profit = Gross_Revenue - Cogs (or Net_Sales - Total_COGS)
            3. Gross Margin % = (Gross_Revenue - Cogs) / Gross_Revenue * 100
            4. Net Margin % = Sales_Margin_of_Net_Sales / Net_Sales * 100
            5. EBITDA = Operating Income + Depreciation (if available, else just use Operating Income proxy)
            6. Contribution Margin = Net_Sales - Variable Costs (Ingredients + Packaging + Incoming_Freight)
            7. Profit per Unit = Sales_Margin_of_Net_Sales / Inv_Quantity
            8. Revenue per Customer = SUM(Gross_Revenue) / COUNT(DISTINCT Customer)
            9. Average Order Value = SUM(Net_Sales) / COUNT(DISTINCT Order_ID)

            ONLY say "not available" for metrics that require data NOT derivable from transactional data:
            - Balance Sheet items: Total Assets, Total Equity, Total Debt, Cash, Working Capital, Inventory Value
            - ROIC, ROE, ROA (require balance sheet data)
            - Market Cap, Share Price, EV (require market data)
            - Headcount, Employee metrics (require HR data)

            CRITICAL RULES:
            1. ONLY use tables from the list above - DO NOT invent or assume tables exist
            2. If the required data truly cannot be derived from available columns (e.g., balance sheet data for ROIC), set sql to null and provide an error message explaining what data is missing
            3. DO NOT generate a SELECT statement that just returns an error message string - instead return null SQL with an error field
            4. DO NOT use placeholder names like 'my-project', 'mydataset', 'your_table', 'income_statements', etc.
            5. Every table reference MUST be one of the exact table names listed above
            6. Always use fully qualified table names with backticks: `{self.project_id}.{self.dataset_id}.table_name`
            7. ALWAYS attempt to derive/calculate metrics before saying they're not available
            """

            # Generate SQL using LLM with dynamic examples if available
            result = self.llm_client.generate_sql(
                enhanced_query,
                schemas,
                examples=dynamic_examples if dynamic_examples else None,
                financial_context=metric_context
            )

            # CRITICAL: Normalize tables_used to always be a list
            # LLM may return strings like '<item>table</item>' instead of arrays
            tables_used_raw = result.get("tables_used", [])
            if isinstance(tables_used_raw, str):
                # Try to extract table names from XML-like format or comma-separated
                import re as tables_re
                # Pattern for <item>table_name</item>
                xml_matches = tables_re.findall(r'<item>([^<]+)</item>', tables_used_raw)
                if xml_matches:
                    result["tables_used"] = xml_matches
                else:
                    # Try comma-separated
                    result["tables_used"] = [t.strip() for t in tables_used_raw.split(',') if t.strip()]
            elif not isinstance(tables_used_raw, list):
                result["tables_used"] = []

            logger.info(f"Normalized tables_used: {result.get('tables_used')}")

            # Post-process SQL to ensure BigQuery compatibility
            if result.get("sql"):
                sql = result["sql"]

                # VALIDATION: Check if LLM explanation says data is not available
                # This happens when the LLM can't calculate the metric with available tables
                import re as regex_check
                explanation = result.get("explanation", "")
                not_available_explanation_patterns = [
                    r"do not contain.*necessary.*data",
                    r"not available in.*tables",
                    r"would be needed",
                    r"balance sheet.*not available",
                    r"cannot.*calculate.*ROIC",
                    r"required data.*not available",
                ]
                for pattern in not_available_explanation_patterns:
                    if regex_check.search(pattern, explanation, regex_check.IGNORECASE):
                        logger.warning(f"LLM explanation indicates data not available: {explanation[:100]}")
                        result["sql"] = None
                        result["error"] = explanation
                        result["data_not_available"] = True
                        return result

                # VALIDATION: Check if LLM returned a "data not available" message as SQL
                not_available_sql_patterns = [
                    r"SELECT\s+['\"].*not available.*['\"]",
                    r"SELECT\s+['\"].*doesn't have.*balance sheet.*['\"]",
                    r"SELECT\s+['\"].*cannot calculate.*ROIC.*['\"]",
                    r"SELECT\s+['\"]The requested data.*['\"]",
                    r"AS message\s+LIMIT",
                ]
                for pattern in not_available_sql_patterns:
                    if regex_check.search(pattern, sql, regex_check.IGNORECASE):
                        logger.warning(f"LLM returned 'data not available' SQL instead of proper error")
                        msg_match = regex_check.search(r"SELECT\s+['\"](.+?)['\"]", sql, regex_check.IGNORECASE)
                        error_msg = msg_match.group(1) if msg_match else "The requested data is not available in the current dataset."
                        result["sql"] = None
                        result["error"] = error_msg
                        result["data_not_available"] = True
                        return result

                # Fix common PostgreSQL syntax that might slip through
                sql = self._fix_postgresql_syntax(sql)

                # Ensure fully qualified table names
                import re as regex_module

                # First, fix any malformed table names where LLM split table_name incorrectly
                # e.g., `arizona-poc.dataset.25m_table` should be `arizona-poc.copa_export_copa_data_000000000000.dataset_25m_table`
                # e.g., `arizona-poc.dataset_25m.table` should be `arizona-poc.copa_export_copa_data_000000000000.dataset_25m_table`
                for schema in schemas:
                    table_name = schema['table_name']
                    full_table = f"`{self.project_id}.{self.dataset_id}.{table_name}`"

                    # Fix malformed table references where table name was split at underscores
                    # e.g., dataset_25m_table became dataset.25m_table or dataset_25m.table
                    if '_' in table_name:
                        parts = table_name.split('_')
                        # Generate all possible malformed variations
                        for i in range(1, len(parts)):
                            # Split at each underscore position
                            prefix = '_'.join(parts[:i])
                            suffix = '_'.join(parts[i:])

                            # Pattern 1: `project.prefix.suffix` (underscore became dot)
                            malformed1 = f"`{self.project_id}.{prefix}.{suffix}`"
                            if malformed1 in sql:
                                sql = sql.replace(malformed1, full_table)
                                logger.info(f"Fixed malformed table name: {malformed1} -> {full_table}")

                            # Pattern 2: `project.prefix_suffix.remaining` (partial split)
                            for j in range(i + 1, len(parts)):
                                partial_prefix = '_'.join(parts[:j])
                                partial_suffix = '_'.join(parts[j:])
                                malformed2 = f"`{self.project_id}.{partial_prefix}.{partial_suffix}`"
                                if malformed2 in sql:
                                    sql = sql.replace(malformed2, full_table)
                                    logger.info(f"Fixed malformed table name: {malformed2} -> {full_table}")

                    # Also fix cases where LLM used wrong dataset but correct table name
                    # Pattern: `project.wrong_dataset.table_name`
                    wrong_dataset_pattern = regex_module.compile(
                        rf'`{regex_module.escape(self.project_id)}\.(?!{regex_module.escape(self.dataset_id)})[^`]+\.{regex_module.escape(table_name)}`'
                    )
                    sql = wrong_dataset_pattern.sub(full_table, sql)

                # Catch-all: Find any table reference with project ID that doesn't have correct dataset
                # Pattern: `project.anything.anything` where dataset is wrong
                def fix_all_malformed_tables(sql_str, project, correct_dataset, valid_tables):
                    """Fix all malformed table references in the SQL"""
                    # Find all backtick-quoted table references for this project
                    pattern = rf'`{regex_module.escape(project)}\.([^`\.]+)\.([^`]+)`'
                    matches = regex_module.findall(pattern, sql_str)

                    logger.info(f"Checking malformed tables. Found patterns: {matches}, valid tables: {valid_tables[:5]}...")

                    for dataset_part, table_part in matches:
                        if dataset_part == correct_dataset:
                            continue  # Already correct

                        # Try to find which valid table this might be
                        combined = f"{dataset_part}_{table_part}"
                        logger.info(f"Checking combined name: {combined}")

                        for valid_table in valid_tables:
                            # Check various match conditions
                            if (valid_table == combined or
                                valid_table == table_part or
                                valid_table.endswith(table_part) or
                                combined.endswith(valid_table) or
                                valid_table.replace('_', '') == f"{dataset_part}{table_part}".replace('_', '')):

                                old_ref = f"`{project}.{dataset_part}.{table_part}`"
                                new_ref = f"`{project}.{correct_dataset}.{valid_table}`"
                                logger.info(f"Replacing: {old_ref} -> {new_ref}")
                                sql_str = sql_str.replace(old_ref, new_ref)
                                break

                    return sql_str

                # Get ALL available tables, not just the ones selected as relevant
                all_available_tables = self.list_tables()
                valid_table_names = all_available_tables if all_available_tables else [s['table_name'] for s in schemas]
                sql = fix_all_malformed_tables(sql, self.project_id, self.dataset_id, valid_table_names)

                # Final catch-all: Replace any `project.wrong_dataset.valid_table` with correct dataset
                for table_name in valid_table_names:
                    correct_ref = f"`{self.project_id}.{self.dataset_id}.{table_name}`"
                    # Pattern: `project.anything.table_name` where anything != correct_dataset
                    wrong_dataset_pattern = regex_module.compile(
                        rf'`{regex_module.escape(self.project_id)}\.([^`\.]+)\.{regex_module.escape(table_name)}`'
                    )
                    for match in wrong_dataset_pattern.finditer(sql):
                        wrong_dataset = match.group(1)
                        if wrong_dataset != self.dataset_id:
                            old_ref = match.group(0)
                            sql = sql.replace(old_ref, correct_ref)
                            logger.info(f"Fixed wrong dataset: {old_ref} -> {correct_ref}")

                # CRITICAL: Validate all table names in SQL and replace invalid ones with default
                def replace_invalid_tables(sql_str, project, dataset, valid_tables, default_table='dataset_25m_table'):
                    """Replace any invalid table names with the default table"""
                    pattern = rf'`{regex_module.escape(project)}\.{regex_module.escape(dataset)}\.([^`]+)`'
                    matches = regex_module.findall(pattern, sql_str)

                    for table_name in matches:
                        if table_name not in valid_tables:
                            old_ref = f"`{project}.{dataset}.{table_name}`"
                            new_ref = f"`{project}.{dataset}.{default_table}`"
                            logger.warning(f"Invalid table '{table_name}' not in valid tables, replacing with default: {old_ref} -> {new_ref}")
                            sql_str = sql_str.replace(old_ref, new_ref)

                    return sql_str

                sql = replace_invalid_tables(sql, self.project_id, self.dataset_id, valid_table_names)

                for schema in schemas:
                    table_name = schema['table_name']
                    full_table = f"`{self.project_id}.{self.dataset_id}.{table_name}`"

                    # Skip if already fully qualified
                    if full_table in sql:
                        continue

                    # Replace backtick-quoted table name
                    sql = sql.replace(f"`{table_name}`", full_table)

                    # Replace FROM table_name (with word boundary to avoid partial matches)
                    sql = regex_module.sub(
                        rf'\bFROM\s+{regex_module.escape(table_name)}\b',
                        f'FROM {full_table}',
                        sql,
                        flags=regex_module.IGNORECASE
                    )

                    # Replace JOIN table_name
                    sql = regex_module.sub(
                        rf'\bJOIN\s+{regex_module.escape(table_name)}\b',
                        f'JOIN {full_table}',
                        sql,
                        flags=regex_module.IGNORECASE
                    )

                # Add LIMIT if not present (default 1000 to balance cost vs usability)
                if "LIMIT" not in sql.upper() and "SELECT" in sql.upper():
                    sql = sql.rstrip(';') + " LIMIT 1000;"
                    result["limit_added"] = True

                # CRITICAL: Remove CURRENT_DATE() based filtering - data has fixed date range
                sql = self._fix_current_date_queries(sql)
                logger.info(f"After _fix_current_date_queries - contains CURRENT_DATE: {'CURRENT_DATE' in sql.upper()}")

                # CRITICAL: Force correct project/dataset in case LLM hallucinated different ones
                # This catches cases like `arizona-poc.project_ops.table` and fixes to correct dataset
                sql = self._enforce_correct_dataset(sql)

                # Remove LOWER() from SELECT columns - preserves original text case
                sql = self._remove_lower_from_select(sql)

                # Add null filters for identifier columns (safety net)
                sql = self._add_null_filters_for_identifiers(sql)

                # VALIDATION: Check for invented/placeholder table names
                logger.info(f"Validating SQL for placeholder tables. SQL preview: {sql[:200]}...")
                invented_patterns = [
                    r'`my-project\.',
                    r'`your[_-]?project\.',
                    r'\.mydataset\.',
                    r'\.your[_-]?dataset\.',
                    r'\.income_statements`',
                    r'\.balance_sheet`',
                    r'\.your[_-]?table`',
                    r'`[^`]+\.[^`]+\.(?!(' + '|'.join(regex_module.escape(t) for t in valid_table_names) + r'))[^`]+`'
                ]

                for pattern in invented_patterns[:-1]:  # Check placeholder patterns first
                    if regex_module.search(pattern, sql, regex_module.IGNORECASE):
                        logger.warning(f"Detected invented table in SQL: pattern '{pattern}' matched")
                        result["sql"] = None
                        result["error"] = "The requested data is not available in the current dataset. The system only has access to: " + ", ".join(valid_table_names[:10])
                        result["invented_table_detected"] = True
                        return result

                # Check if any table reference is not in our valid list
                table_refs = regex_module.findall(r'`([^`]+)\.([^`]+)\.([^`]+)`', sql)
                for project, dataset, table in table_refs:
                    if table not in valid_table_names:
                        logger.warning(f"Detected unknown table '{table}' in SQL (valid tables: {valid_table_names[:5]}...)")
                        result["sql"] = None
                        result["error"] = f"The requested analysis requires data ('{table}') that is not available in the current dataset. Available tables: " + ", ".join(valid_table_names[:10])
                        result["invented_table_detected"] = True
                        return result

                result["sql"] = sql

            # Cache successful result
            if self.cache_manager and not result.get("error"):
                import json
                cache_ttl = 3600  # 1 hour
                self.cache_manager.redis.setex(cache_key, cache_ttl, json.dumps(result))

            result["from_cache"] = False
            result["tables_used"] = relevant_tables
            result["dataset"] = self.dataset_id
            result["project"] = self.project_id

            # Include metric context for frontend formatting
            if metric_context:
                result["metric_context"] = metric_context
                result["formatting_hints"] = metric_context.get("formatting_hints", {})

            # Track whether dynamic examples were used
            if dynamic_examples:
                result["dynamic_examples_used"] = len(dynamic_examples)

            return result

        except Exception as e:
            logger.error(f"Failed to generate BigQuery SQL: {e}")
            return {
                "error": str(e),
                "sql": None,
                "error_type": "generation_error",
                "dataset": self.dataset_id
            }

    def _format_value(self, value: Any, column_name: str) -> str:
        """Format a value based on column name patterns.

        Applies:
        - Currency formatting ($X,XXX.XX) for revenue, cost, margin, price columns
        - Percentage formatting (X.XX%) for percentage/ratio columns
        - Comma separators for large numbers (quantity, count)
        - Preserves ID/code columns as strings
        """
        if value is None:
            return None

        # Convert to string if needed
        str_value = str(value)

        # Check if it's already formatted (has $ or %)
        if str_value.startswith('$') or str_value.endswith('%'):
            return str_value

        column_lower = column_name.lower()

        # ID/Code/Year columns - preserve as-is (don't format as numbers)
        preserve_keywords = [
            'customer', 'id', 'code', 'sku', 'material', 'product_code',
            'order', 'document', 'reference', 'key', 'number', 'no',
            'account', 'gl_', 'segment', 'channel', 'region', 'territory',
            'year', 'month', 'date', 'period', 'fiscal', 'calendar',
            'quarter', 'week', 'day', 'hour', 'time', 'timestamp',
            'name', 'description', 'category', 'type', 'status',
            'product', 'item', 'brand', 'vendor', 'supplier', 'distributor',
            'employee', 'user', 'manager', 'owner', 'created', 'modified'
        ]
        for kw in preserve_keywords:
            if kw in column_lower:
                return str_value  # Return as-is, preserve original format

        # Try to parse as number
        try:
            # Remove any existing commas
            clean_value = str_value.replace(',', '')
            num_value = float(clean_value)
        except (ValueError, TypeError):
            return str_value  # Return as-is if not a number

        # Currency columns - format as $X,XXX.XX
        currency_keywords = [
            'revenue', 'sales', 'cost', 'margin', 'price', 'amount',
            'total', 'gross', 'net', 'profit', 'expense', 'fee',
            'cogs', 'cogm', 'cos', 'value', 'income', 'earning',
            'payment', 'charge', 'discount', 'rebate', 'allowance',
            'difference', 'delta', 'variance', 'budget', 'actual',
            'spend', 'expenditure', 'liability', 'asset', 'balance',
            'debit', 'credit', 'invoice', 'billing', 'freight',
            'shipping', 'handling', 'tax', 'duty', 'tariff'
        ]

        # Percentage columns - already formatted or need % suffix
        percentage_keywords = [
            'percent', 'pct', 'ratio', 'rate', 'growth', 'change',
            'margin_pct', 'margin_percent', 'percentage', 'yoy', 'mom',
            'qoq', 'wow', 'contribution', 'share', 'proportion',
            'utilization', 'efficiency', 'yield', 'conversion'
        ]

        # Quantity columns - just add comma separators, no decimals
        quantity_keywords = [
            'count', 'quantity', 'qty', 'units', 'items', 'rows',
            'number', 'num_', '_num', 'total_count', 'sold', 'ordered',
            'shipped', 'delivered', 'cases', 'volume'
        ]

        # Priority order: percentage -> quantity -> currency
        # This ensures 'margin_percentage' is percentage, 'quantity_sold' is quantity

        # 1. Check for percentage columns FIRST
        is_percentage = False
        for kw in percentage_keywords:
            if kw in column_lower:
                is_percentage = True
                break

        if is_percentage:
            # If value is already a percentage (e.g., "43.5%"), return as-is
            if '%' in str_value:
                return str_value
            # If value is a ratio (0-1), multiply by 100
            if -1 <= num_value <= 1 and 'ratio' in column_lower:
                return f"{num_value * 100:,.2f}%"
            # Otherwise just add % suffix
            return f"{num_value:,.2f}%"

        # 2. Check for quantity columns (before currency to avoid 'total_quantity' being currency)
        is_quantity = False
        for kw in quantity_keywords:
            if kw in column_lower:
                is_quantity = True
                break

        if is_quantity:
            # Format with commas, no decimals for whole numbers, 2 decimals otherwise
            if num_value == int(num_value):
                return f"{int(num_value):,}"
            return f"{num_value:,.2f}"

        # 3. Check for currency columns (only if not percentage or quantity)
        for kw in currency_keywords:
            if kw in column_lower:
                # Format as currency with $ and commas
                if num_value < 0:
                    return f"-${abs(num_value):,.2f}"
                return f"${num_value:,.2f}"

        # Default: if it's a large number, add commas but keep decimals
        if abs(num_value) >= 1000:
            if num_value == int(num_value):
                return f"{int(num_value):,}"
            return f"{num_value:,.2f}"

        # Small numbers - return with 2 decimal places if has decimals
        if num_value != int(num_value):
            return f"{num_value:.2f}"

        return str_value

    def _format_results(self, results: List[Dict[str, Any]], columns: List[str]) -> List[Dict[str, Any]]:
        """Format all result values based on column names."""
        if not results:
            return results

        formatted_results = []
        for row in results:
            formatted_row = {}
            for col in columns:
                value = row.get(col)
                formatted_row[col] = self._format_value(value, col)
            formatted_results.append(formatted_row)

        return formatted_results

    def execute_sql(self, sql: str) -> Dict[str, Any]:
        """Execute SQL query and return results"""
        try:
            logger.info(f"Executing BigQuery SQL: {sql[:100]}...")

            # Validate query first (dry run)
            validation = self.bq_client.validate_query(sql)
            if not validation.get("valid"):
                return {
                    "success": False,
                    "error": validation.get("error", "Query validation failed"),
                    "sql": sql,
                    "error_type": "validation_error"
                }

            # Execute query
            results = self.bq_client.execute_query(sql)

            # Format results
            if results:
                columns = list(results[0].keys()) if results else []

                # Apply formatting to results (currency, percentages, etc.)
                formatted_results = self._format_results(results, columns)

                return {
                    "success": True,
                    "data": formatted_results,
                    "columns": columns,
                    "row_count": len(results),
                    "sql": sql,
                    "bytes_processed": validation.get("total_bytes_processed"),
                    "estimated_cost_usd": validation.get("estimated_cost_usd")
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
            logger.error(f"Failed to execute BigQuery SQL: {e}")
            return {
                "success": False,
                "error": str(e),
                "sql": sql,
                "error_type": "execution_error"
            }

    def generate_and_execute(self, query: str, max_tables: int = 5, max_retries: int = 2, conversation_context: Optional[List[str]] = None) -> Dict[str, Any]:
        """Generate SQL from natural language and execute it with error retry"""
        # Generate SQL with conversation context
        generation_result = self.generate_sql(query, max_tables, conversation_context=conversation_context)

        if generation_result.get("error"):
            return generation_result

        # Execute SQL
        sql = generation_result.get("sql")
        if sql:
            execution_result = self.execute_sql(sql)

            # If execution failed with validation error, try to fix and retry
            retry_count = 0
            while not execution_result.get("success") and retry_count < max_retries:
                error_msg = execution_result.get("error", "")
                error_type = execution_result.get("error_type", "")

                # Only retry on validation/syntax errors
                if error_type != "validation_error":
                    break

                logger.info(f"SQL execution failed, attempting retry {retry_count + 1}/{max_retries}")

                # Try to fix the SQL using LLM
                fixed_sql = self._fix_sql_with_llm(sql, error_msg, query)

                if fixed_sql and fixed_sql != sql:
                    sql = fixed_sql
                    execution_result = self.execute_sql(sql)
                    generation_result["sql"] = sql
                    generation_result["retry_count"] = retry_count + 1
                else:
                    break

                retry_count += 1

            return {
                **generation_result,
                "execution": execution_result
            }

        return generation_result

    def _fix_sql_with_llm(self, sql: str, error: str, original_query: str) -> Optional[str]:
        """Use LLM to fix SQL based on error message"""
        try:
            fix_prompt = f"""Fix this BigQuery SQL that produced an error.

Original question: {original_query}

SQL that failed:
```sql
{sql}
```

Error message:
{error}

CRITICAL - Use these EXACT identifiers:
- Project: {self.project_id}
- Dataset: {self.dataset_id}
- Table format: `{self.project_id}.{self.dataset_id}.table_name`

IMPORTANT BigQuery syntax rules:
- Use backticks for table names: `{self.project_id}.{self.dataset_id}.table_name`
- DO NOT use any other project or dataset names - only use {self.project_id} and {self.dataset_id}
- Use DATE_TRUNC(date_column, MONTH) not DATE_TRUNC('month', date_column)
- Use DATE_SUB(date, INTERVAL n UNIT) not date - INTERVAL 'n units'
- Use CONCAT() not || for string concatenation
- Use CAST(x AS type) not ::type
- Ensure all parentheses are balanced
- Don't use ROUND on DATE columns

Return ONLY the corrected SQL, no explanation."""

            # Use LLM to fix
            response = self.llm_client.client.messages.create(
                model=self.llm_client.model,
                max_tokens=2000,
                messages=[{"role": "user", "content": fix_prompt}]
            )

            fixed_sql = response.content[0].text.strip()

            # Extract SQL if wrapped in code blocks
            if "```sql" in fixed_sql:
                fixed_sql = fixed_sql.split("```sql")[1].split("```")[0].strip()
            elif "```" in fixed_sql:
                fixed_sql = fixed_sql.split("```")[1].split("```")[0].strip()

            # Apply our syntax fixes
            fixed_sql = self._fix_postgresql_syntax(fixed_sql)

            # Force correct project/dataset in case LLM hallucinated different ones
            fixed_sql = self._enforce_correct_dataset(fixed_sql)

            # Fix CURRENT_DATE and CTE column name conflicts
            fixed_sql = self._fix_current_date_queries(fixed_sql)

            logger.info("LLM provided SQL fix")
            return fixed_sql

        except Exception as e:
            logger.warning(f"Failed to fix SQL with LLM: {e}")
            return None

    def _enforce_correct_dataset(self, sql: str) -> str:
        """Replace any wrong project/dataset references with correct ones"""
        import re

        # Pattern to find any backtick-quoted table reference
        # Matches: `anything.anything.tablename`
        pattern = r'`([^`\.]+)\.([^`\.]+)\.([^`]+)`'

        def replace_with_correct(match):
            project = match.group(1)
            dataset = match.group(2)
            table = match.group(3)

            # If project or dataset is wrong, fix it
            if project != self.project_id or dataset != self.dataset_id:
                logger.info(f"Fixing wrong reference: {project}.{dataset}.{table} -> {self.project_id}.{self.dataset_id}.{table}")
                return f"`{self.project_id}.{self.dataset_id}.{table}`"
            return match.group(0)

        fixed_sql = re.sub(pattern, replace_with_correct, sql)
        return fixed_sql

    def _remove_lower_from_select(self, sql: str) -> str:
        """Remove LOWER() function from SELECT columns to preserve original text case.

        This is important for display columns like customer names, product names, etc.
        LOWER() should only be used in WHERE clauses for filtering, not in SELECT.
        """
        import re

        original_sql = sql

        # Find ALL SELECT statements in the query (including CTEs)
        # We need to handle each SELECT...FROM block separately
        def remove_lower_from_select_block(match):
            select_keyword = match.group(1)  # SELECT or SELECT DISTINCT
            columns = match.group(2)          # The column expressions
            from_keyword = match.group(3)     # FROM

            # Replace LOWER(column) with just column
            cleaned = re.sub(
                r'LOWER\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?)\s*\)',
                r'\1',
                columns,
                flags=re.IGNORECASE
            )
            return select_keyword + cleaned + from_keyword

        # Pattern to match SELECT ... FROM blocks (handles CTEs and subqueries)
        pattern = r'(SELECT\s+(?:DISTINCT\s+)?)(.*?)(\s+FROM\s+)'
        sql = re.sub(pattern, remove_lower_from_select_block, sql, flags=re.IGNORECASE | re.DOTALL)

        if sql != original_sql:
            logger.info("Removed LOWER() from SELECT columns to preserve text case")

        return sql

    def _add_null_filters_for_identifiers(self, sql: str) -> str:
        """Add IS NOT NULL filters for identifier columns when missing.

        This is a safety net to prevent null rows from appearing in results
        when querying for customers, products, distributors, etc.
        """
        import re

        original_sql = sql

        # Key identifier columns that should always filter nulls when selected
        identifier_columns = {
            'Sold_to_Number': 'Sold_to_Number',
            'Sold_to_Name': 'Sold_to_Name',
            'customer_id': 'Sold_to_Number',
            'customer_name': 'Sold_to_Name',
            'Material': 'Material',
            'Material_Description': 'Material_Description',
            'Distributor': 'Distributor',
            'Payer_Name': 'Payer_Name',
            'Bill_to_Party_Name': 'Bill_to_Party_Name',
        }

        # Check if this is a DISTINCT query or GROUP BY query on identifier columns
        is_distinct = bool(re.search(r'SELECT\s+DISTINCT', sql, re.IGNORECASE))
        has_group_by = bool(re.search(r'GROUP\s+BY', sql, re.IGNORECASE))

        if not (is_distinct or has_group_by):
            return sql  # Only apply to listing/aggregation queries

        # Find which identifier columns are in the SELECT
        columns_to_filter = []
        for col_alias, actual_col in identifier_columns.items():
            # Check if column is in SELECT clause
            select_pattern = rf'SELECT\s+.*?\b{re.escape(col_alias)}\b.*?FROM'
            if re.search(select_pattern, sql, re.IGNORECASE | re.DOTALL):
                # Check if NOT NULL filter already exists
                null_pattern = rf'\b{re.escape(actual_col)}\s+IS\s+NOT\s+NULL'
                if not re.search(null_pattern, sql, re.IGNORECASE):
                    columns_to_filter.append(actual_col)

        if not columns_to_filter:
            return sql

        # Remove duplicates while preserving order
        columns_to_filter = list(dict.fromkeys(columns_to_filter))

        # Build the null filter clause
        null_filters = ' AND '.join([f'{col} IS NOT NULL' for col in columns_to_filter])

        # Add to WHERE clause
        if re.search(r'\bWHERE\b', sql, re.IGNORECASE):
            # WHERE exists - add to it
            # Find WHERE and add after it
            sql = re.sub(
                r'(\bWHERE\s+)',
                rf'\1{null_filters} AND ',
                sql,
                count=1,
                flags=re.IGNORECASE
            )
        else:
            # No WHERE - add one before GROUP BY, ORDER BY, or LIMIT
            for clause in ['GROUP BY', 'ORDER BY', 'LIMIT']:
                pattern = rf'(\s+{clause}\b)'
                if re.search(pattern, sql, re.IGNORECASE):
                    sql = re.sub(
                        pattern,
                        rf' WHERE {null_filters}\1',
                        sql,
                        count=1,
                        flags=re.IGNORECASE
                    )
                    break
            else:
                # No GROUP BY, ORDER BY, or LIMIT - add before trailing semicolon or at end
                sql = sql.rstrip(';').rstrip() + f' WHERE {null_filters};'

        if sql != original_sql:
            logger.info(f"Added null filters for identifier columns: {columns_to_filter}")

        return sql
