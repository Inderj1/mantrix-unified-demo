from typing import List, Dict, Any, Optional
from google.cloud import bigquery
from google.oauth2 import service_account
from google.auth import default
import json
import structlog
from src.config import settings

logger = structlog.get_logger()


class BigQueryClient:
    def __init__(self):
        self.project_id = settings.google_cloud_project
        self.dataset_id = settings.bigquery_dataset
        self.client = self._initialize_client()
    
    def _initialize_client(self) -> bigquery.Client:
        """Initialize BigQuery client using gcloud SDK or service account."""
        try:
            if settings.google_application_credentials:
                # Only try service account if file actually exists
                import os
                if os.path.exists(settings.google_application_credentials):
                    # Check if it's a service account or user credentials file
                    with open(settings.google_application_credentials, 'r') as f:
                        cred_data = json.load(f)
                    
                    if cred_data.get('type') == 'service_account':
                        # Service account credentials
                        credentials = service_account.Credentials.from_service_account_file(
                            settings.google_application_credentials
                        )
                        client = bigquery.Client(
                            project=self.project_id,
                            credentials=credentials
                        )
                        logger.info("BigQuery client initialized with service account")
                    else:
                        # User credentials or other type - use default credentials
                        credentials, project = default()
                        client = bigquery.Client(
                            project=self.project_id,
                            credentials=credentials
                        )
                        logger.info("BigQuery client initialized with application default credentials")
                else:
                    # Fall back to default credentials
                    credentials, project = default()
                    client = bigquery.Client(
                        project=self.project_id,
                        credentials=credentials
                    )
                    logger.info("BigQuery client initialized with default credentials")
            else:
                # Use default credentials from gcloud
                credentials, project = default()
                client = bigquery.Client(
                    project=self.project_id,
                    credentials=credentials
                )
                logger.info("BigQuery client initialized with default credentials")
            
            return client
        except Exception as e:
            logger.error(f"Failed to initialize BigQuery client: {e}")
            raise
    
    def execute_query(self, query: str) -> List[Dict[str, Any]]:
        """Execute a SQL query and return results as list of dictionaries."""
        try:
            logger.info(f"Executing query: {query[:100]}...")
            query_job = self.client.query(query)
            results = query_job.result()
            
            rows = []
            for row in results:
                rows.append(dict(row))
            
            logger.info(f"Query returned {len(rows)} rows")
            return rows
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
    
    def get_table_schema(self, table_name: str) -> Dict[str, Any]:
        """Get schema information for a specific table."""
        try:
            table_ref = f"{self.project_id}.{self.dataset_id}.{table_name}"
            table = self.client.get_table(table_ref)
            
            schema_info = {
                "table_name": table_name,
                "dataset": self.dataset_id,
                "project": self.project_id,
                "description": table.description,
                "row_count": table.num_rows,
                "created": table.created.isoformat() if table.created else None,
                "modified": table.modified.isoformat() if table.modified else None,
                "columns": []
            }
            
            for field in table.schema:
                column_info = {
                    "name": field.name,
                    "type": field.field_type,
                    "mode": field.mode,
                    "description": field.description,
                    "is_nullable": field.mode != "REQUIRED"
                }
                schema_info["columns"].append(column_info)
            
            return schema_info
        except Exception as e:
            logger.error(f"Failed to get schema for table {table_name}: {e}")
            raise
    
    def list_tables(self) -> List[str]:
        """List all tables in the dataset."""
        try:
            dataset_ref = f"{self.project_id}.{self.dataset_id}"
            tables = list(self.client.list_tables(dataset_ref))
            return [table.table_id for table in tables]
        except Exception as e:
            logger.error(f"Failed to list tables: {e}")
            raise
    
    def get_dataset_schema(self) -> List[Dict[str, Any]]:
        """Get schema information for all tables in the dataset."""
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
        """Validate a query without executing it."""
        try:
            job_config = bigquery.QueryJobConfig(dry_run=True, use_query_cache=False)
            query_job = self.client.query(query, job_config=job_config)
            
            return {
                "valid": True,
                "total_bytes_processed": query_job.total_bytes_processed,
                "estimated_cost_usd": (query_job.total_bytes_processed / 1e12) * 5.0  # $5 per TB
            }
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }