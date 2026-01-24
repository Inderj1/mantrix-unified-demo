#!/usr/bin/env python3
"""
Load embeddings for BigQuery tables into Weaviate
Creates semantic vectors for table schemas with proper vector similarity search
"""

import sys
import os
from typing import List, Dict, Any
import structlog

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.db.bigquery import BigQueryClient
from src.db.weaviate_client import WeaviateClient
from src.core.embeddings import EmbeddingService

logger = structlog.get_logger()


class BigQueryWeaviateLoader:
    def __init__(self):
        self.bq_client = BigQueryClient()
        self.weaviate_client = WeaviateClient()
        self.embedding_service = EmbeddingService()

        self.tables_processed = 0
        self.embeddings_created = 0

    def get_table_description(self, table_name: str, table_info: Dict[str, Any]) -> str:
        """Get human-readable description for a table"""

        # Use BigQuery table description if available
        if table_info.get('description'):
            return table_info['description']

        # Pattern-based descriptions
        name_lower = table_name.lower()
        if 'customer' in name_lower:
            return "Customer data and analytics"
        elif 'sales' in name_lower:
            return "Sales transaction and order data"
        elif 'stox' in name_lower:
            return "Inventory and stock management data"
        elif 'cohort' in name_lower:
            return "Customer cohort analysis data"
        elif 'segment' in name_lower:
            return "Customer or product segmentation data"
        elif 'performance' in name_lower:
            return "Performance metrics and KPIs"
        elif 'gl_' in name_lower or 'account' in name_lower:
            return "General Ledger and accounting data"
        elif 'product' in name_lower:
            return "Product catalog and analysis data"
        elif 'regional' in name_lower:
            return "Regional breakdown and geographic analysis"

        # Default description
        key_columns = [col['name'] for col in table_info.get('columns', [])[:5]]
        return f"Table containing {table_name.replace('_', ' ')} data with columns: {', '.join(key_columns)}"

    def create_combined_text(self, table_info: Dict[str, Any], description: str) -> str:
        """Create comprehensive text for embedding generation"""
        parts = []

        # Table name and description
        parts.append(f"Table: {table_info['table_name']}")
        parts.append(f"Description: {description}")
        parts.append(f"Contains {table_info.get('row_count', 0):,} rows")

        # Key columns
        parts.append("\nKey Columns:")
        for col in table_info.get('columns', [])[:10]:
            col_desc = f"  - {col['name']} ({col['type']})"
            if col.get('description'):
                col_desc += f": {col['description']}"
            parts.append(col_desc)

        # Identify key column patterns for better semantic matching
        col_names = [col['name'].lower() for col in table_info.get('columns', [])]

        patterns = []
        if any('sales' in c or 'revenue' in c for c in col_names):
            patterns.append("revenue metrics")
        if any('margin' in c or 'profit' in c for c in col_names):
            patterns.append("profitability data")
        if any('date' in c or 'time' in c for c in col_names):
            patterns.append("time-series data")
        if any('quantity' in c or 'volume' in c or 'qty' in c for c in col_names):
            patterns.append("volume metrics")
        if any('customer' in c for c in col_names):
            patterns.append("customer information")
        if any('product' in c or 'item' in c for c in col_names):
            patterns.append("product data")
        if any('region' in c or 'territory' in c for c in col_names):
            patterns.append("geographic data")
        if any('inventory' in c or 'stock' in c for c in col_names):
            patterns.append("inventory data")

        if patterns:
            parts.append(f"\nData Categories: {', '.join(patterns)}")

        return "\n".join(parts)

    def load_table_to_weaviate(self, table_name: str):
        """Load a table schema and embedding into Weaviate"""
        logger.info(f"Processing table: {table_name}")

        try:
            # Get table info from BigQuery
            table_info = self.bq_client.get_table_schema(table_name)

            # Get description
            description = self.get_table_description(table_name, table_info)

            # Create combined text for embedding
            combined_text = self.create_combined_text(table_info, description)

            # Generate embedding
            embedding = self.embedding_service.generate_embedding(combined_text)
            self.embeddings_created += 1

            # Create schema object for Weaviate
            schema = {
                'table_name': table_name,
                'dataset': self.bq_client.dataset_id,
                'project': self.bq_client.project_id,
                'description': description,
                'columns': table_info.get('columns', []),
                'row_count': table_info.get('row_count', 0)
            }

            # Index in Weaviate
            self.weaviate_client.index_table_schema(schema, embedding)
            self.tables_processed += 1

            logger.info(f"Loaded {table_name} ({table_info.get('row_count', 0):,} rows)")

        except Exception as e:
            logger.error(f"Error processing {table_name}: {e}")

    def load_all_tables(self):
        """Load all tables from BigQuery into Weaviate"""
        logger.info("="*80)
        logger.info("LOADING BIGQUERY TABLE EMBEDDINGS TO WEAVIATE")
        logger.info(f"Project: {self.bq_client.project_id}")
        logger.info(f"Dataset: {self.bq_client.dataset_id}")
        logger.info("="*80)

        # Get all tables
        tables = self.bq_client.list_tables()
        logger.info(f"\nFound {len(tables)} tables to process\n")

        # Clear existing schemas
        try:
            logger.info("Clearing existing table schemas from Weaviate...")
            self.weaviate_client.delete_all_schemas()
        except Exception as e:
            logger.warning(f"Could not clear existing schemas: {e}")

        # Load each table
        for table in tables:
            self.load_table_to_weaviate(table)

        logger.info("\n" + "="*80)
        logger.info("WEAVIATE LOAD COMPLETE")
        logger.info("="*80)
        logger.info(f"Tables processed: {self.tables_processed}")
        logger.info(f"Embeddings created: {self.embeddings_created}")

        # Test search
        logger.info("\n" + "="*80)
        logger.info("TESTING SEMANTIC SEARCH")
        logger.info("="*80)

        test_queries = [
            "show me all customers",
            "sales and revenue data",
            "inventory health",
        ]

        for query in test_queries:
            logger.info(f"\nQuery: {query}")
            query_embedding = self.embedding_service.generate_embedding(query)
            results = self.weaviate_client.search_similar_tables(query_embedding, limit=3)

            for i, result in enumerate(results, 1):
                logger.info(f"  {i}. {result['table_name']} (distance: {result.get('distance', 'N/A'):.4f})")
                logger.info(f"     {result.get('description', 'No description')}")

        self.weaviate_client.close()


if __name__ == "__main__":
    loader = BigQueryWeaviateLoader()
    loader.load_all_tables()
