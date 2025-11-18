"""
Unified database client that uses PostgreSQL
This replaces the BigQuery client for all database operations
"""
from typing import List, Dict, Any, Optional
import structlog
from src.config import settings
from src.db.postgresql_client import PostgreSQLClient

logger = structlog.get_logger()


class DatabaseClient:
    """
    Unified database client using PostgreSQL.
    Provides a compatible interface with the legacy BigQueryClient.
    """

    def __init__(self):
        # For backward compatibility with BigQuery code
        self.project_id = settings.postgres_database
        self.dataset_id = "public"  # PostgreSQL default schema

        self.pg_client = PostgreSQLClient(
            host=settings.postgres_host,
            port=settings.postgres_port,
            user=settings.postgres_user,
            password=settings.postgres_password,
            database=settings.postgres_database
        )
        logger.info(f"DatabaseClient initialized with PostgreSQL backend: {settings.postgres_database}")

    def execute_query(self, query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """Execute a SQL query and return results as list of dictionaries."""
        try:
            logger.info(f"Executing query: {query[:100]}...")
            results = self.pg_client.execute_query(query, params)
            logger.info(f"Query returned {len(results)} rows")
            return results
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise

    def get_table_schema(self, table_name: str) -> Dict[str, Any]:
        """Get schema information for a specific table."""
        try:
            query = """
            SELECT
                column_name,
                data_type,
                is_nullable,
                column_default,
                character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = %s
            ORDER BY ordinal_position
            """

            columns_data = self.pg_client.execute_query(query, (table_name,))

            # Get row count
            count_query = f"SELECT COUNT(*) as count FROM {table_name}"
            count_result = self.pg_client.execute_query(count_query)
            row_count = count_result[0]['count'] if count_result else 0

            # Get table metadata
            table_query = """
            SELECT
                obj_description(c.oid) as description
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = %s AND n.nspname = 'public'
            """
            table_meta = self.pg_client.execute_query(table_query, (table_name,))

            schema_info = {
                "table_name": table_name,
                "database": settings.postgres_database,
                "description": table_meta[0]['description'] if table_meta and table_meta[0]['description'] else None,
                "row_count": row_count,
                "columns": []
            }

            for col in columns_data:
                column_info = {
                    "name": col['column_name'],
                    "type": col['data_type'],
                    "mode": "REQUIRED" if col['is_nullable'] == 'NO' else "NULLABLE",
                    "description": None,  # PostgreSQL doesn't store column descriptions by default
                    "is_nullable": col['is_nullable'] == 'YES'
                }
                schema_info["columns"].append(column_info)

            return schema_info
        except Exception as e:
            logger.error(f"Failed to get schema for table {table_name}: {e}")
            raise

    def list_tables(self) -> List[str]:
        """List all tables in the database."""
        try:
            query = """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
            """
            results = self.pg_client.execute_query(query)
            return [row['table_name'] for row in results]
        except Exception as e:
            logger.error(f"Failed to list tables: {e}")
            raise

    def get_dataset_schema(self) -> List[Dict[str, Any]]:
        """Get schema information for all tables in the database."""
        schemas = []
        table_names = self.list_tables()

        for table_name in table_names:
            try:
                schema = self.get_table_schema(table_name)
                schemas.append(schema)
            except Exception as e:
                logger.warning(f"Failed to get schema for {table_name}: {e}")
                continue

        return schemas

    def validate_query(self, query: str) -> Dict[str, Any]:
        """Validate a query without executing it (using EXPLAIN)."""
        try:
            explain_query = f"EXPLAIN {query}"
            self.pg_client.execute_query(explain_query)

            return {
                "valid": True,
                "message": "Query is valid"
            }
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }

    def test_connection(self) -> bool:
        """Test database connection."""
        return self.pg_client.test_connection()


# For backward compatibility with existing code
BigQueryClient = DatabaseClient
