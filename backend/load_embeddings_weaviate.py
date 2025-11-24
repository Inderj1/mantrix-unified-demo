#!/usr/bin/env python3
"""
Load embeddings for all mantrix_nexxt tables into Weaviate
Creates semantic vectors for table schemas with proper vector similarity search
"""

import psycopg2
import sys
import os
from typing import List, Dict, Any
import structlog

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.db.weaviate_client import WeaviateClient
from src.core.embeddings import EmbeddingService

logger = structlog.get_logger()

# Database config
DB_CONFIG = {
    'host': 'localhost',
    'port': 5433,
    'database': 'mantrix_nexxt',
    'user': 'mantrix',
    'password': 'mantrix123'
}


class WeaviateEmbeddingLoader:
    def __init__(self):
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.weaviate_client = WeaviateClient()
        self.embedding_service = EmbeddingService()

        self.tables_processed = 0
        self.embeddings_created = 0

    def get_table_info(self, table_name: str) -> Dict[str, Any]:
        """Get comprehensive table information"""
        with self.conn.cursor() as cur:
            # Get column info
            cur.execute("""
                SELECT
                    column_name,
                    data_type,
                    is_nullable,
                    column_default
                FROM information_schema.columns
                WHERE table_name = %s
                AND table_schema = 'public'
                ORDER BY ordinal_position
            """, (table_name,))

            columns = []
            for row in cur.fetchall():
                columns.append({
                    'name': row[0],
                    'type': row[1],
                    'is_nullable': row[2] == 'YES',
                    'nullable': row[2] == 'YES',
                    'default': row[3],
                    'description': ''  # Could be enhanced with column comments
                })

            # Get row count
            cur.execute(f"SELECT COUNT(*) FROM {table_name}")
            row_count = cur.fetchone()[0]

            # Get sample data (first 3 rows)
            cur.execute(f"SELECT * FROM {table_name} LIMIT 3")
            sample_rows = cur.fetchall()
            col_names = [desc[0] for desc in cur.description]

            samples = []
            for row in sample_rows:
                samples.append(dict(zip(col_names, row)))

            return {
                'table_name': table_name,
                'columns': columns,
                'row_count': row_count,
                'sample_data': samples
            }

    def get_table_description(self, table_name: str, table_info: Dict[str, Any]) -> str:
        """Get human-readable description for a table"""

        # Domain-specific descriptions
        descriptions = {
            'csg_data': 'Surgical transaction data with sales, gross margins, distributors, surgeons, and facilities',
            'csg_summary': 'Summary view of surgical transactions aggregated by key dimensions',
            'fact_invoices': 'Invoice and billing records with transaction details, amounts, and dates',
            'fact_transactions': 'Detailed transaction records with revenue, margins, quantities, and costs',
            'dim_items': 'Product/item master data with descriptions and categories',
            'dim_item_costs': 'Item cost information and pricing data',
        }

        if table_name in descriptions:
            return descriptions[table_name]

        # Pattern-based descriptions
        if 'commission' in table_name.lower():
            return "Commission payments and distributor compensation data"
        elif 'distributor' in table_name.lower():
            return "Distributor information and performance metrics"
        elif 'territory' in table_name.lower() or 'region' in table_name.lower():
            return "Geographic territory and regional sales data"
        elif 'profitability' in table_name.lower():
            return "Profitability analysis and financial performance metrics"
        elif 'msr' in table_name.lower():
            return "MSR (Medical Sales Representative) performance and case tracking data"
        elif 'system_usage' in table_name.lower():
            return "System usage and adoption metrics"

        # Default description
        key_columns = [col['name'] for col in table_info['columns'][:5]]
        return f"Table with data about {table_name.replace('_', ' ')} including {', '.join(key_columns)}"

    def create_combined_text(self, table_info: Dict[str, Any], description: str) -> str:
        """Create comprehensive text for embedding generation"""
        parts = []

        # Table name and description
        parts.append(f"Table: {table_info['table_name']}")
        parts.append(f"Description: {description}")
        parts.append(f"Contains {table_info['row_count']:,} rows")

        # Key columns
        parts.append("\nKey Columns:")
        for col in table_info['columns'][:10]:  # First 10 columns
            parts.append(f"  - {col['name']} ({col['type']})")

        # Identify key column patterns for better semantic matching
        col_names = [col['name'].lower() for col in table_info['columns']]

        patterns = []
        if any('sales' in c or 'revenue' in c for c in col_names):
            patterns.append("revenue metrics")
        if any('margin' in c or 'profit' in c for c in col_names):
            patterns.append("profitability data")
        if any('date' in c or 'time' in c for c in col_names):
            patterns.append("time-series data")
        if any('quantity' in c or 'volume' in c for c in col_names):
            patterns.append("volume metrics")
        if any('distributor' in c for c in col_names):
            patterns.append("distributor information")
        if any('surgeon' in c or 'physician' in c for c in col_names):
            patterns.append("surgeon/physician data")
        if any('facility' in c or 'hospital' in c for c in col_names):
            patterns.append("facility information")
        if any('region' in c or 'territory' in c for c in col_names):
            patterns.append("geographic data")

        if patterns:
            parts.append(f"\nData Categories: {', '.join(patterns)}")

        # Sample data insight
        if table_info['sample_data']:
            parts.append("\nSample Data Available: Yes")

        return "\n".join(parts)

    def load_table_to_weaviate(self, table_name: str):
        """Load a table schema and embedding into Weaviate"""
        logger.info(f"Processing table: {table_name}")

        try:
            # Get table info
            table_info = self.get_table_info(table_name)

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
                'dataset': 'public',
                'project': 'mantrix_nexxt',
                'description': description,
                'columns': table_info['columns'],
                'row_count': table_info['row_count']
            }

            # Index in Weaviate
            self.weaviate_client.index_table_schema(schema, embedding)
            self.tables_processed += 1

            logger.info(f"✅ Loaded {table_name} ({table_info['row_count']:,} rows)")

        except Exception as e:
            logger.error(f"❌ Error processing {table_name}: {e}")

    def load_all_tables(self):
        """Load all tables from mantrix_nexxt into Weaviate"""
        logger.info("="*80)
        logger.info("LOADING TABLE EMBEDDINGS TO WEAVIATE")
        logger.info("="*80)

        # Get all tables
        with self.conn.cursor() as cur:
            cur.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """)

            tables = [row[0] for row in cur.fetchall()]

        logger.info(f"\nFound {len(tables)} tables to process\n")

        # Clear existing schemas (optional - comment out to keep existing)
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
            "show me tables with sales and revenue data",
            "find tables with distributor information",
            "tables containing commission data",
        ]

        for query in test_queries:
            logger.info(f"\nQuery: {query}")
            query_embedding = self.embedding_service.generate_embedding(query)
            results = self.weaviate_client.search_similar_tables(query_embedding, limit=3)

            for i, result in enumerate(results, 1):
                logger.info(f"  {i}. {result['table_name']} (distance: {result.get('distance', 'N/A'):.4f})")
                logger.info(f"     {result['description']}")

        self.conn.close()
        self.weaviate_client.close()


if __name__ == "__main__":
    loader = WeaviateEmbeddingLoader()
    loader.load_all_tables()
