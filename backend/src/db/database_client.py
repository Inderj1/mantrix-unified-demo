"""
Unified database client that uses BigQuery
"""
from typing import List, Dict, Any, Optional
import structlog
from src.config import settings
from src.db.bigquery import BigQueryClient as BQClient

logger = structlog.get_logger()


class DatabaseClient:
    """
    Unified database client using BigQuery.
    """

    def __init__(self):
        self.bq_client = BQClient()
        self.project_id = self.bq_client.project_id
        self.dataset_id = self.bq_client.dataset_id
        logger.info(f"DatabaseClient initialized with BigQuery backend: {self.project_id}.{self.dataset_id}")

    def execute_query(self, query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """Execute a SQL query and return results as list of dictionaries."""
        return self.bq_client.execute_query(query)

    def get_table_schema(self, table_name: str) -> Dict[str, Any]:
        """Get schema information for a specific table."""
        return self.bq_client.get_table_schema(table_name)

    def list_tables(self) -> List[str]:
        """List all tables in the dataset."""
        return self.bq_client.list_tables()

    def get_dataset_schema(self) -> List[Dict[str, Any]]:
        """Get schema information for all tables in the dataset."""
        return self.bq_client.get_dataset_schema()

    def validate_query(self, query: str) -> Dict[str, Any]:
        """Validate a query without executing it."""
        return self.bq_client.validate_query(query)

    def test_connection(self) -> bool:
        """Test database connection."""
        try:
            self.bq_client.list_tables()
            return True
        except Exception:
            return False


# For backward compatibility with existing code
BigQueryClient = DatabaseClient
