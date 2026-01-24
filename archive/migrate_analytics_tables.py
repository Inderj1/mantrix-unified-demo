#!/usr/bin/env python3
"""
Migrate customer analytics tables from port 5432 to mantrix_nexxt on port 5433
"""
import psycopg2
import sys

# Source database (port 5432)
SOURCE_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'customer_analytics',
    'user': 'inder'
}

# Target database (port 5433)
TARGET_CONFIG = {
    'host': 'localhost',
    'port': 5433,
    'database': 'mantrix_nexxt',
    'user': 'mantrix',
    'password': 'mantrix123'
}

# Tables to migrate (only tables used by MARGEN.AI and REVEQ.AI)
TABLES_TO_MIGRATE = [
    'customer_master',      # 2,903 rows - Customer segmentation and RFM data
    'transaction_data',     # 150,000 rows - Transaction history
]


def get_create_table_statement(source_cur, table_name):
    """Generate CREATE TABLE statement from information_schema"""

    # Get columns
    source_cur.execute("""
        SELECT
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_name = %s
        AND table_schema = 'public'
        ORDER BY ordinal_position
    """, (table_name,))

    columns = source_cur.fetchall()

    col_defs = []
    for col_name, data_type, char_len, is_nullable, col_default in columns:
        col_def = f'"{col_name}" {data_type}'

        if char_len and data_type in ('character varying', 'character'):
            col_def += f'({char_len})'

        if is_nullable == 'NO':
            col_def += ' NOT NULL'

        if col_default:
            col_def += f' DEFAULT {col_default}'

        col_defs.append(col_def)

    create_stmt = f'CREATE TABLE IF NOT EXISTS "{table_name}" (\n  ' + ',\n  '.join(col_defs) + '\n)'
    return create_stmt


def migrate_table(source_conn, target_conn, table_name):
    """Migrate a single table from source to target"""

    print(f"\n{'='*80}")
    print(f"Migrating: {table_name}")
    print(f"{'='*80}")

    source_cur = source_conn.cursor()
    target_cur = target_conn.cursor()

    try:
        # Get row count
        source_cur.execute(f'SELECT COUNT(*) FROM "{table_name}"')
        row_count = source_cur.fetchone()[0]
        print(f"Source rows: {row_count:,}")

        if row_count == 0:
            print(f"Skipping {table_name} (empty table)")
            return

        # Drop table if exists in target
        target_cur.execute(f'DROP TABLE IF EXISTS "{table_name}" CASCADE')
        target_conn.commit()
        print(f"Dropped existing table (if any)")

        # Get CREATE TABLE statement
        create_stmt = get_create_table_statement(source_cur, table_name)

        # Create table in target
        target_cur.execute(create_stmt)
        target_conn.commit()
        print(f"Created table structure")

        # Get column names
        source_cur.execute(f"""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = %s
            AND table_schema = 'public'
            ORDER BY ordinal_position
        """, (table_name,))
        columns = [row[0] for row in source_cur.fetchall()]
        col_list = ', '.join([f'"{col}"' for col in columns])

        # Copy data in batches
        batch_size = 5000
        offset = 0

        while offset < row_count:
            source_cur.execute(f'SELECT {col_list} FROM "{table_name}" LIMIT {batch_size} OFFSET {offset}')
            rows = source_cur.fetchall()

            if not rows:
                break

            # Insert into target
            placeholders = ', '.join(['%s'] * len(columns))
            insert_stmt = f'INSERT INTO "{table_name}" ({col_list}) VALUES ({placeholders})'
            target_cur.executemany(insert_stmt, rows)
            target_conn.commit()

            offset += len(rows)
            print(f"  Copied {offset:,} / {row_count:,} rows", end='\r')

        print(f"\n✅ Migrated {row_count:,} rows successfully")

    except Exception as e:
        print(f"\n❌ Error migrating {table_name}: {e}")
        target_conn.rollback()
        raise

    finally:
        source_cur.close()
        target_cur.close()


def main():
    print("="*80)
    print("CUSTOMER ANALYTICS MIGRATION")
    print("="*80)
    print(f"Source: {SOURCE_CONFIG['host']}:{SOURCE_CONFIG['port']}/{SOURCE_CONFIG['database']}")
    print(f"Target: {TARGET_CONFIG['host']}:{TARGET_CONFIG['port']}/{TARGET_CONFIG['database']}")
    print(f"Tables: {len(TABLES_TO_MIGRATE)}")
    print("="*80)

    # Connect to databases
    try:
        print("\nConnecting to source database...")
        source_conn = psycopg2.connect(**SOURCE_CONFIG)
        print("✅ Connected to source")

        print("Connecting to target database...")
        target_conn = psycopg2.connect(**TARGET_CONFIG)
        print("✅ Connected to target")

    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    # Migrate tables
    migrated = 0
    failed = 0

    for table in TABLES_TO_MIGRATE:
        try:
            migrate_table(source_conn, target_conn, table)
            migrated += 1
        except Exception as e:
            print(f"Failed to migrate {table}: {e}")
            failed += 1

    # Close connections
    source_conn.close()
    target_conn.close()

    # Summary
    print("\n" + "="*80)
    print("MIGRATION COMPLETE")
    print("="*80)
    print(f"Successfully migrated: {migrated}")
    print(f"Failed: {failed}")
    print("="*80)


if __name__ == "__main__":
    main()
