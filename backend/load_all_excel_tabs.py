#!/usr/bin/env python3
"""
Universal Excel Loader - Creates a table for each tab in each Excel file
Loads into mantrix_nexxt database
"""

import pandas as pd
import psycopg2
from psycopg2 import sql
import sys
import os
from pathlib import Path
import re

EXCEL_FOLDER = "/Users/inder/projects/mantrix-unified-nexxt-v1/excelfolder"
DB_CONFIG = {
    'host': 'localhost',
    'port': 5433,
    'database': 'mantrix_nexxt',
    'user': 'mantrix',
    'password': 'mantrix123'
}

def sanitize_name(name):
    """Convert Excel filename/sheet name to valid PostgreSQL table name"""
    # Remove special characters, convert to lowercase
    name = re.sub(r'[^\w\s-]', '', name.lower())
    # Replace spaces and hyphens with underscores
    name = re.sub(r'[\s-]+', '_', name)
    # Remove leading/trailing underscores
    name = name.strip('_')
    # Ensure it starts with a letter
    if name and name[0].isdigit():
        name = 't_' + name
    # Truncate to 63 chars (PostgreSQL limit)
    return name[:63]

def map_dtype_to_postgres(dtype):
    """Map pandas dtype to PostgreSQL type"""
    dtype_str = str(dtype)
    if 'int' in dtype_str:
        return 'INTEGER'
    elif 'float' in dtype_str:
        return 'NUMERIC'
    elif 'datetime' in dtype_str or 'date' in dtype_str:
        return 'TIMESTAMP'
    elif 'bool' in dtype_str:
        return 'BOOLEAN'
    else:
        return 'TEXT'

def create_table_from_dataframe(conn, table_name, df):
    """Create PostgreSQL table from DataFrame structure"""
    cursor = conn.cursor()

    # Generate column definitions
    column_defs = []
    for col in df.columns:
        col_name = sanitize_name(col)
        pg_type = map_dtype_to_postgres(df[col].dtype)
        column_defs.append(f'"{col_name}" {pg_type}')

    # Add metadata columns
    column_defs.append('loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')

    create_sql = f"""
    CREATE TABLE IF NOT EXISTS {table_name} (
        id SERIAL PRIMARY KEY,
        {', '.join(column_defs)}
    );
    """

    try:
        cursor.execute(create_sql)
        conn.commit()
        print(f"  ✅ Table created: {table_name}")
        return True
    except Exception as e:
        print(f"  ⚠️  Error creating table: {str(e)[:100]}")
        conn.rollback()
        return False
    finally:
        cursor.close()

def insert_data(conn, table_name, df):
    """Insert DataFrame data into table"""
    cursor = conn.cursor()

    # Sanitize column names to match table
    sanitized_cols = [sanitize_name(col) for col in df.columns]

    # Prepare data
    records = []
    for _, row in df.iterrows():
        record = []
        for val in row:
            if pd.isna(val):
                record.append(None)
            elif isinstance(val, (pd.Timestamp, pd.DatetimeTZDtype)):
                record.append(val.to_pydatetime() if hasattr(val, 'to_pydatetime') else val)
            else:
                record.append(val)
        records.append(tuple(record))

    if not records:
        print(f"  ⚠️  No data to insert")
        return 0

    # Build INSERT query
    placeholders = ', '.join(['%s'] * len(sanitized_cols))
    columns = ', '.join([f'"{col}"' for col in sanitized_cols])
    insert_sql = f'INSERT INTO {table_name} ({columns}) VALUES ({placeholders})'

    inserted = 0
    failed = 0

    for record in records:
        try:
            cursor.execute(insert_sql, record)
            inserted += 1
        except Exception as e:
            failed += 1
            if failed <= 3:  # Show first 3 errors
                print(f"    ⚠️  Insert error: {str(e)[:80]}")

    conn.commit()
    cursor.close()

    print(f"  ✅ Inserted {inserted:,} rows ({failed} failed)")
    return inserted

def load_excel_file(filepath, conn):
    """Load all sheets from an Excel file"""
    filename = os.path.basename(filepath)
    print(f"\n{'='*80}")
    print(f"📂 Loading: {filename}")
    print(f"{'='*80}")

    try:
        # Read Excel file
        xl_file = pd.ExcelFile(filepath)
        sheets = xl_file.sheet_names

        print(f"Found {len(sheets)} sheet(s): {', '.join(sheets)}")

        for sheet_name in sheets:
            print(f"\n📊 Sheet: {sheet_name}")

            try:
                # Read sheet
                df = pd.read_excel(filepath, sheet_name=sheet_name)

                # Skip empty sheets
                if df.empty or len(df) == 0:
                    print(f"  ⚠️  Empty sheet, skipping")
                    continue

                print(f"  Rows: {len(df):,}, Columns: {len(df.columns)}")

                # Generate table name: filename + sheet name
                file_prefix = sanitize_name(filename.replace('.xlsx', ''))
                sheet_suffix = sanitize_name(sheet_name)

                # Keep table name unique and descriptive
                if sheet_suffix and sheet_suffix != file_prefix:
                    table_name = f"{file_prefix}_{sheet_suffix}"
                else:
                    table_name = file_prefix

                print(f"  Table: {table_name}")

                # Create table
                if create_table_from_dataframe(conn, table_name, df):
                    # Insert data
                    insert_data(conn, table_name, df)

            except Exception as e:
                print(f"  ❌ Error loading sheet '{sheet_name}': {str(e)[:100]}")
                import traceback
                traceback.print_exc()

    except Exception as e:
        print(f"❌ Error reading file: {str(e)}")

def main():
    print("="*80)
    print("UNIVERSAL EXCEL LOADER - Load All Tabs as Tables")
    print("Target: mantrix_nexxt database (port 5433)")
    print("="*80)

    # Connect to database
    print("\n📡 Connecting to PostgreSQL...")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Connected to mantrix_nexxt")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    # Get all Excel files
    excel_files = [
        "#2 - Manufacturing Std Cost.xlsx",
        "#3 - Item Data File.xlsx",
        "#4 - 6 Region - 2025 MSR - Tab 2025 Data.xlsx",
        "2025 Territories - 6 Regions.xlsx",
        "CGS Review - ASP - System, Units, Facility - '25 8-20-25 9-5.xlsx",
        "Cibolo Spine (Turgon) 2025 Commission (2).xlsx",
        "Leap LLC (Knickerbocker) 2025 Commission (2).xlsx",
        "SOP 6.0-01-10 Distributor Profitability Q3 2025 (3).xlsx"
    ]

    # Load each file
    for filename in excel_files:
        filepath = os.path.join(EXCEL_FOLDER, filename)
        if os.path.exists(filepath):
            load_excel_file(filepath, conn)
        else:
            print(f"\n⚠️  File not found: {filename}")

    # Close connection
    conn.close()

    # Show summary
    print("\n" + "="*80)
    print("LOADING COMPLETE")
    print("="*80)
    print("\nVerify tables:")
    print("  PGPASSWORD=mantrix123 psql -U mantrix -h localhost -p 5433 -d mantrix_nexxt")
    print("  \\dt")
    print("  SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) as size")
    print("  FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")

if __name__ == "__main__":
    main()
