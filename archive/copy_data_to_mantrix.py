#!/usr/bin/env python3
"""
Copy loaded Excel data from customer_analytics to mantrix_nexxt
"""
import psycopg2
import sys

# Databases
SOURCE_DB = {'host': 'localhost', 'port': 5432, 'database': 'customer_analytics', 'user': 'inder'}
TARGET_DB = {'host': 'localhost', 'port': 5433, 'database': 'mantrix_nexxt', 'user': 'mantrix', 'password': 'mantrix123'}

def copy_table_data(table_name):
    print(f"\n📊 Copying {table_name}...")

    source_conn = psycopg2.connect(**SOURCE_DB)
    target_conn = psycopg2.connect(**TARGET_DB)

    # Get data from source
    with source_conn.cursor() as cur:
        cur.execute(f"SELECT * FROM {table_name}")
        rows = cur.fetchall()

        if not rows:
            print(f"  ⚠️  No data in {table_name}")
            return 0

        # Get column names
        columns = [desc[0] for desc in cur.description]

    print(f"  Found {len(rows):,} rows")

    # Insert into target
    with target_conn.cursor() as cur:
        placeholders = ','.join(['%s'] * len(columns))
        insert_sql = f"INSERT INTO {table_name} ({','.join(columns)}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"

        inserted = 0
        for row in rows:
            try:
                cur.execute(insert_sql, row)
                inserted += 1
            except Exception as e:
                if inserted == 0:  # Show first error
                    print(f"  ⚠️  Error: {str(e)[:100]}")

        target_conn.commit()

    print(f"  ✅ Inserted {inserted:,} rows")

    source_conn.close()
    target_conn.close()
    return inserted

print("="*80)
print("COPY EXCEL DATA TO MANTRIX_NEXXT")
print("="*80)

tables = ['fact_invoices', 'dim_items', 'dim_item_costs']

for table in tables:
    try:
        copy_table_data(table)
    except Exception as e:
        print(f"❌ Error with {table}: {e}")

print("\n" + "="*80)
print("COPY COMPLETE")
print("="*80)
