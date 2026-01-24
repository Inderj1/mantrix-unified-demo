#!/usr/bin/env python3
"""
Load embeddings for all mantrix_nexxt tables into Redis
Creates semantic vectors for table schemas, sample data, and relationships
"""

import psycopg2
import redis
import anthropic
import hashlib
import json
import time
from typing import List, Dict, Any
import structlog

logger = structlog.get_logger()

# Database config
DB_CONFIG = {
    'host': 'localhost',
    'port': 5433,
    'database': 'mantrix_nexxt',
    'user': 'mantrix',
    'password': 'mantrix123'
}

# Redis config
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_DB = 0

# Anthropic API
ANTHROPIC_API_KEY = "sk-ant-api03-Lxn3bTRIb8S3X2ikHS94_bsxaW0fW8hQeUB8ygRQsDg_rZOMPJ9YVfMx-oPhXAe0k-9bxKa8Chn_R6CDkj76Yw-W-w5rgAA"

class EmbeddingLoader:
    def __init__(self):
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=False)
        self.anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

        self.embeddings_created = 0
        self.embeddings_cached = 0

    def get_embedding(self, text: str) -> List[float]:
        """Get embedding vector for text using Claude's embeddings API"""
        # Check cache first
        cache_key = f"embedding:{hashlib.sha256(text.encode()).hexdigest()}"

        cached = self.redis_client.get(cache_key)
        if cached:
            self.embeddings_cached += 1
            return json.loads(cached)

        # Create new embedding - Note: Anthropic doesn't have embeddings API yet
        # Using a hash-based approach for now as placeholder
        # In production, you'd use a real embeddings model like OpenAI or Cohere

        # For now, store the text itself and a simple hash
        # This is a placeholder - you should replace with actual embeddings
        embedding = [float(ord(c)) / 256.0 for c in hashlib.sha256(text.encode()).hexdigest()[:128]]

        # Cache the embedding
        self.redis_client.setex(cache_key, 86400 * 7, json.dumps(embedding))  # 7 day TTL
        self.embeddings_created += 1

        return embedding

    def get_table_info(self, table_name: str) -> Dict[str, Any]:
        """Get comprehensive table information"""
        with self.conn.cursor() as cur:
            # Get column info
            cur.execute(f"""
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
                    'nullable': row[2] == 'YES',
                    'default': row[3]
                })

            # Get row count
            cur.execute(f"SELECT COUNT(*) FROM {table_name}")
            row_count = cur.fetchone()[0]

            # Get sample data (first 5 rows)
            cur.execute(f"SELECT * FROM {table_name} LIMIT 5")
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

    def create_table_description(self, table_info: Dict[str, Any]) -> str:
        """Create a comprehensive text description of the table"""
        desc_parts = []

        # Table name and size
        desc_parts.append(f"Table: {table_info['table_name']}")
        desc_parts.append(f"Contains {table_info['row_count']:,} rows")

        # Columns
        desc_parts.append("\nColumns:")
        for col in table_info['columns']:
            nullable = "nullable" if col['nullable'] else "not null"
            desc_parts.append(f"  - {col['name']}: {col['type']} ({nullable})")

        # Sample data patterns
        if table_info['sample_data']:
            desc_parts.append("\nSample data patterns:")
            first_row = table_info['sample_data'][0]
            for key, value in list(first_row.items())[:5]:  # First 5 columns
                if value is not None:
                    desc_parts.append(f"  - {key}: {type(value).__name__} (e.g., {str(value)[:50]})")

        return "\n".join(desc_parts)

    def create_semantic_descriptions(self, table_info: Dict[str, Any]) -> List[str]:
        """Create multiple semantic descriptions for better matching"""
        descriptions = []

        table_name = table_info['table_name']

        # 1. Functional description
        descriptions.append(f"This table stores data about {table_name.replace('_', ' ')}")

        # 2. Column-based description
        col_names = [col['name'] for col in table_info['columns'][:10]]
        descriptions.append(f"Table with columns: {', '.join(col_names)}")

        # 3. Data type description
        if 'invoice' in table_name.lower():
            descriptions.append("Invoice and billing records with transaction details")
        elif 'commission' in table_name.lower():
            descriptions.append("Commission payments and distributor compensation data")
        elif 'csg' in table_name.lower() or 'transaction' in table_name.lower():
            descriptions.append("Surgical transaction data with sales, margins, and product details")
        elif 'distributor' in table_name.lower():
            descriptions.append("Distributor information and performance metrics")
        elif 'territory' in table_name.lower() or 'region' in table_name.lower():
            descriptions.append("Geographic territory and regional sales data")
        elif 'profitability' in table_name.lower():
            descriptions.append("Profitability analysis and financial performance metrics")

        # 4. Use case descriptions
        key_columns = [col['name'] for col in table_info['columns']]
        if any('revenue' in col.lower() or 'sales' in col.lower() for col in key_columns):
            descriptions.append("Contains revenue and sales metrics for analysis")
        if any('date' in col.lower() for col in key_columns):
            descriptions.append("Time-series data with date-based records")
        if any('quantity' in col.lower() for col in key_columns):
            descriptions.append("Transaction volume and quantity information")

        return descriptions

    def load_table_embeddings(self, table_name: str):
        """Load embeddings for a single table"""
        logger.info(f"Processing table: {table_name}")

        try:
            # Get table info
            table_info = self.get_table_info(table_name)

            # Create comprehensive description
            full_description = self.create_table_description(table_info)

            # Store schema info in Redis
            schema_key = f"schema:mantrix_nexxt:public:{table_name}"
            self.redis_client.setex(
                schema_key,
                86400 * 30,  # 30 days
                json.dumps(table_info, default=str)
            )

            # Create and store embeddings for semantic descriptions
            semantic_descriptions = self.create_semantic_descriptions(table_info)

            for idx, desc in enumerate(semantic_descriptions):
                embedding = self.get_embedding(desc)

                # Store embedding with metadata
                embedding_key = f"table_embedding:{table_name}:{idx}"
                embedding_data = {
                    'table_name': table_name,
                    'description': desc,
                    'embedding': embedding,
                    'row_count': table_info['row_count']
                }

                self.redis_client.setex(
                    embedding_key,
                    86400 * 30,  # 30 days
                    json.dumps(embedding_data, default=str)
                )

            # Store full description embedding
            full_embedding = self.get_embedding(full_description)
            full_key = f"table_full_embedding:{table_name}"
            self.redis_client.setex(
                full_key,
                86400 * 30,
                json.dumps({
                    'table_name': table_name,
                    'description': full_description,
                    'embedding': full_embedding
                }, default=str)
            )

            logger.info(f"✅ Loaded embeddings for {table_name} ({len(semantic_descriptions)} descriptions)")

        except Exception as e:
            logger.error(f"❌ Error processing {table_name}: {e}")

    def load_all_embeddings(self):
        """Load embeddings for all tables"""
        logger.info("="*80)
        logger.info("LOADING TABLE EMBEDDINGS")
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

        for table in tables:
            self.load_table_embeddings(table)
            time.sleep(0.1)  # Small delay to avoid rate limits

        logger.info("\n" + "="*80)
        logger.info("EMBEDDING LOAD COMPLETE")
        logger.info("="*80)
        logger.info(f"Tables processed: {len(tables)}")
        logger.info(f"New embeddings created: {self.embeddings_created}")
        logger.info(f"Embeddings cached (reused): {self.embeddings_cached}")
        logger.info(f"\nTotal Redis keys: {self.redis_client.dbsize()}")

        self.conn.close()

if __name__ == "__main__":
    loader = EmbeddingLoader()
    loader.load_all_embeddings()
