#!/usr/bin/env python3
"""
Migrate MARGEN.AI tables from customer_analytics DB to mantrix_nexxt DB (margen schema)
"""

import psycopg2
from psycopg2.extras import execute_values
import sys

# Source database (customer_analytics)
SOURCE_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'customer_analytics',
    'user': 'inder'
}

# Target database (mantrix_nexxt)
TARGET_CONFIG = {
    'host': 'localhost',
    'port': 5433,
    'database': 'mantrix_nexxt',
    'user': 'mantrix',
    'password': 'mantrix123'
}

TABLES_TO_MIGRATE = [
    'fact_transactions',
    'fact_invoices',
    'dim_items',
    'dim_item_costs',
    'dim_distributor',
    'dim_surgeon',
    'dim_facility',
    'dim_system',
    'dim_region'
]

def get_table_schema(source_conn, table_name):
    """Get CREATE TABLE statement for a table"""
    with source_conn.cursor() as cur:
        cur.execute(f"""
            SELECT
                'CREATE TABLE IF NOT EXISTS margen.{table_name} (' ||
                string_agg(
                    column_name || ' ' ||
                    CASE
                        WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
                        WHEN data_type = 'numeric' THEN 'NUMERIC(' || numeric_precision || ',' || numeric_scale || ')'
                        ELSE UPPER(data_type)
                    END ||
                    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
                    ', '
                ) || ');' as create_stmt
            FROM information_schema.columns
            WHERE table_name = '{table_name}'
            AND table_schema = 'public'
            ORDER BY ordinal_position;
        """)
        result = cur.fetchone()
        return result[0] if result else None

def migrate_table(source_conn, target_conn, table_name):
    """Migrate a single table"""
    print(f"\n{'='*80}")
    print(f"Migrating: {table_name}")
    print(f"{'='*80}")

    # Get row count from source
    with source_conn.cursor() as cur:
        cur.execute(f"SELECT COUNT(*) FROM {table_name}")
        source_count = cur.fetchone()[0]
        print(f"Source rows: {source_count:,}")

    if source_count == 0:
        print(f"⚠️  Skipping {table_name} - no data")
        return

    # Get table schema
    with source_conn.cursor() as cur:
        cur.execute(f"""
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = '{table_name}'
            AND table_schema = 'public'
            ORDER BY ordinal_position
        """)
        columns_info = cur.fetchall()

    column_names = [col[0] for col in columns_info]
    columns_str = ', '.join(column_names)

    print(f"Columns: {len(column_names)}")

    # Create table in target
    with target_conn.cursor() as cur:
        # Get CREATE TABLE statement from source
        cur.execute(f"""
            SELECT
                'CREATE TABLE IF NOT EXISTS margen.{table_name} (' ||
                string_agg(
                    column_name || ' ' ||
                    CASE
                        WHEN data_type = 'character varying' THEN
                            'VARCHAR' || COALESCE('(' || character_maximum_length::text || ')', '')
                        WHEN data_type = 'numeric' THEN
                            'NUMERIC' || COALESCE('(' || numeric_precision::text || ',' || numeric_scale::text || ')', '')
                        WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
                        WHEN data_type = 'boolean' THEN 'BOOLEAN'
                        WHEN data_type = 'integer' THEN 'INTEGER'
                        WHEN data_type = 'bigint' THEN 'BIGINT'
                        WHEN data_type = 'date' THEN 'DATE'
                        WHEN data_type = 'text' THEN 'TEXT'
                        ELSE UPPER(data_type)
                    END ||
                    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
                    ', ' ORDER BY ordinal_position
                ) || ');' as create_stmt
            FROM information_schema.columns
            WHERE table_name = %s
            AND table_schema = 'public'
            GROUP BY table_name
        """, (table_name,))

        # Execute on target
        create_stmt = cur.fetchone()
        if create_stmt:
            target_cur = target_conn.cursor()
            try:
                target_cur.execute(create_stmt[0])
                target_conn.commit()
                print(f"✅ Table created in margen schema")
            except Exception as e:
                print(f"⚠️  Table creation: {str(e)[:100]}")
                target_conn.rollback()
            finally:
                target_cur.close()

    # Copy data in batches
    BATCH_SIZE = 1000
    offset = 0
    total_inserted = 0

    while True:
        # Fetch batch from source
        with source_conn.cursor() as cur:
            cur.execute(f"""
                SELECT {columns_str}
                FROM {table_name}
                ORDER BY 1
                LIMIT {BATCH_SIZE} OFFSET {offset}
            """)
            rows = cur.fetchall()

        if not rows:
            break

        # Insert into target
        with target_conn.cursor() as cur:
            placeholders = ', '.join(['%s'] * len(column_names))
            insert_query = f"""
                INSERT INTO margen.{table_name} ({columns_str})
                VALUES ({placeholders})
                ON CONFLICT DO NOTHING
            """

            for row in rows:
                try:
                    cur.execute(insert_query, row)
                    total_inserted += 1
                except Exception as e:
                    print(f"⚠️  Error inserting row: {str(e)[:100]}")

        target_conn.commit()
        offset += BATCH_SIZE
        print(f"  Inserted: {total_inserted:,}/{source_count:,} rows")

    # Verify
    with target_conn.cursor() as cur:
        cur.execute(f"SELECT COUNT(*) FROM margen.{table_name}")
        target_count = cur.fetchone()[0]

    print(f"\n✅ Migration complete:")
    print(f"   Source: {source_count:,} rows")
    print(f"   Target: {target_count:,} rows")

    if target_count == source_count:
        print(f"   ✅ All rows migrated successfully!")
    else:
        print(f"   ⚠️  Row count mismatch!")

def main():
    print("=" * 80)
    print("MARGEN.AI TABLE MIGRATION")
    print("From: customer_analytics (port 5432)")
    print("To: mantrix_nexxt.margen (port 5433)")
    print("=" * 80)

    # Connect to databases
    print("\n📡 Connecting to databases...")
    try:
        source_conn = psycopg2.connect(**SOURCE_CONFIG)
        print(f"✅ Connected to source: {SOURCE_CONFIG['database']}")
    except Exception as e:
        print(f"❌ Failed to connect to source: {e}")
        sys.exit(1)

    try:
        target_conn = psycopg2.connect(**TARGET_CONFIG)
        print(f"✅ Connected to target: {TARGET_CONFIG['database']}")
    except Exception as e:
        print(f"❌ Failed to connect to target: {e}")
        sys.exit(1)

    # Migrate each table
    for table_name in TABLES_TO_MIGRATE:
        try:
            migrate_table(source_conn, target_conn, table_name)
        except Exception as e:
            print(f"❌ Error migrating {table_name}: {e}")
            import traceback
            traceback.print_exc()

    # Close connections
    source_conn.close()
    target_conn.close()

    print("\n" + "=" * 80)
    print("MIGRATION COMPLETE")
    print("=" * 80)
    print("\nVerify with:")
    print("  PGPASSWORD=mantrix123 psql -U mantrix -h localhost -p 5433 -d mantrix_nexxt")
    print("  \\dt margen.*")
    print("  SELECT * FROM margen.fact_transactions LIMIT 5;")

if __name__ == "__main__":
    main()
