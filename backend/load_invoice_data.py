#!/usr/bin/env python3
"""
ETL Script: Load Invoice Data into fact_invoices table
Loads 21,005 invoice records from #1 - Invoice Data.xlsx
"""

import pandas as pd
import sys
from pathlib import Path
from datetime import datetime
from decimal import Decimal
from src.db.postgresql_client import PostgreSQLClient

EXCEL_FOLDER = "/Users/inder/projects/mantrix-unified-nexxt-v1/excelfolder"
EXCEL_FILE = "#1 - Invoice Data.xlsx"
SHEET_NAME = "Sheet1"  # Will be detected automatically

def clean_and_transform_invoice_data(df):
    """Clean and transform invoice data for loading"""
    print(f"\n📊 Original data shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")

    # Create a copy
    df_clean = df.copy()

    # Detect actual column names (they might vary)
    # Common patterns: INV#, Invoice Number, Invoice #, etc.
    column_mapping = {}
    for col in df_clean.columns:
        col_lower = str(col).lower().strip()
        if 'inv' in col_lower and ('number' in col_lower or '#' in col_lower or col_lower == 'inv'):
            column_mapping[col] = 'inv_number'
        elif 'surgery' in col_lower and 'date' in col_lower:
            column_mapping[col] = 'surgery_date'
        elif 'surgeon' in col_lower:
            column_mapping[col] = 'surgeon'
        elif 'facility' in col_lower:
            column_mapping[col] = 'facility'
        elif 'item' in col_lower and ('code' in col_lower or 'number' in col_lower or col_lower == 'item'):
            column_mapping[col] = 'item_code'
        elif 'system' in col_lower:
            column_mapping[col] = 'system'
        elif 'qty' in col_lower or 'quantity' in col_lower:
            column_mapping[col] = 'quantity'
        elif 'price' in col_lower and 'each' in col_lower:
            column_mapping[col] = 'price_each'
        elif 'amount' in col_lower or 'total' in col_lower:
            column_mapping[col] = 'amount'

    print(f"\n🔄 Column mapping detected:")
    for old, new in column_mapping.items():
        print(f"   {old} → {new}")

    # Rename columns
    df_clean = df_clean.rename(columns=column_mapping)

    # Ensure required columns exist
    required_cols = ['inv_number', 'surgery_date', 'item_code', 'amount']
    missing_cols = [col for col in required_cols if col not in df_clean.columns]
    if missing_cols:
        print(f"\n❌ ERROR: Missing required columns: {missing_cols}")
        print(f"Available columns: {list(df_clean.columns)}")
        sys.exit(1)

    # Select only the columns we need
    target_cols = ['inv_number', 'surgery_date', 'surgeon', 'facility', 'item_code',
                   'system', 'quantity', 'price_each', 'amount']
    existing_cols = [col for col in target_cols if col in df_clean.columns]
    df_clean = df_clean[existing_cols]

    # Remove completely empty rows
    df_clean = df_clean.dropna(how='all')

    # Clean inv_number - convert to string, strip whitespace
    df_clean['inv_number'] = df_clean['inv_number'].astype(str).str.strip()
    df_clean = df_clean[df_clean['inv_number'].notna()]
    df_clean = df_clean[df_clean['inv_number'] != '']
    df_clean = df_clean[df_clean['inv_number'] != 'nan']

    # Clean surgery_date - convert to datetime
    if 'surgery_date' in df_clean.columns:
        df_clean['surgery_date'] = pd.to_datetime(df_clean['surgery_date'], errors='coerce')

    # Clean text fields
    text_fields = ['surgeon', 'facility', 'item_code', 'system']
    for field in text_fields:
        if field in df_clean.columns:
            df_clean[field] = df_clean[field].astype(str).str.strip()
            df_clean[field] = df_clean[field].replace('nan', None)
            df_clean[field] = df_clean[field].replace('', None)

    # Clean numeric fields
    numeric_fields = ['quantity', 'price_each', 'amount']
    for field in numeric_fields:
        if field in df_clean.columns:
            df_clean[field] = pd.to_numeric(df_clean[field], errors='coerce')

    # Remove rows with missing critical data
    df_clean = df_clean[df_clean['inv_number'].notna()]
    df_clean = df_clean[df_clean['item_code'].notna()]

    print(f"\n✅ Cleaned data shape: {df_clean.shape}")
    print(f"\n📊 Data quality:")
    print(f"   Unique invoices: {df_clean['inv_number'].nunique()}")
    print(f"   Unique items: {df_clean['item_code'].nunique()}")
    print(f"   Date range: {df_clean['surgery_date'].min()} to {df_clean['surgery_date'].max()}")
    print(f"   Total amount: ${df_clean['amount'].sum():,.2f}")

    return df_clean

def load_invoice_data():
    """Main ETL function"""
    print("=" * 100)
    print("MARGEN.AI - INVOICE DATA ETL")
    print("=" * 100)

    # 1. Connect to database
    print("\n📡 Connecting to PostgreSQL...")
    pg_client = PostgreSQLClient(
        host="localhost",
        database="customer_analytics",
        user="inder"
    )
    print("✅ Connected")

    # 2. Read Excel file
    excel_path = Path(EXCEL_FOLDER) / EXCEL_FILE
    print(f"\n📂 Reading Excel file: {excel_path}")

    if not excel_path.exists():
        print(f"❌ ERROR: File not found: {excel_path}")
        sys.exit(1)

    # Try to detect sheet name
    try:
        xl_file = pd.ExcelFile(excel_path)
        print(f"\n📋 Available sheets: {xl_file.sheet_names}")

        # Use first sheet or find the main data sheet
        sheet_to_use = xl_file.sheet_names[0]
        print(f"📊 Using sheet: {sheet_to_use}")

        df = pd.read_excel(excel_path, sheet_name=sheet_to_use)
        print(f"✅ Loaded {len(df):,} rows from Excel")

    except Exception as e:
        print(f"❌ ERROR reading Excel: {str(e)}")
        sys.exit(1)

    # 3. Clean and transform data
    print("\n🔄 Cleaning and transforming data...")
    df_clean = clean_and_transform_invoice_data(df)

    # 4. Check for existing data
    print("\n🔍 Checking existing data in fact_invoices...")
    existing_count_query = "SELECT COUNT(*) as count FROM fact_invoices"
    existing_result = pg_client.execute_query(existing_count_query)
    existing_count = existing_result[0]['count'] if existing_result else 0
    print(f"   Current records: {existing_count:,}")

    if existing_count > 0:
        print("\n⚠️  WARNING: fact_invoices table already has data!")
        print("   This script will INSERT new records (duplicates may occur)")
        response = input("   Continue? (yes/no): ")
        if response.lower() != 'yes':
            print("❌ Aborted by user")
            sys.exit(0)

    # 5. Prepare data for insertion
    print("\n📝 Preparing data for insertion...")

    # Convert DataFrame to list of dicts
    records = df_clean.to_dict('records')

    # Convert NaN to None and format values
    for record in records:
        for key, value in record.items():
            if pd.isna(value):
                record[key] = None
            elif key == 'surgery_date' and value is not None:
                record[key] = value.date() if hasattr(value, 'date') else value
            elif key in ['quantity'] and value is not None:
                record[key] = int(value)
            elif key in ['price_each', 'amount'] and value is not None:
                record[key] = float(value)

    print(f"✅ Prepared {len(records):,} records for insertion")

    # 6. Insert data in batches
    print("\n💾 Inserting data into fact_invoices...")

    BATCH_SIZE = 1000
    total_inserted = 0
    total_failed = 0

    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i:i+BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = (len(records) + BATCH_SIZE - 1) // BATCH_SIZE

        try:
            # Build INSERT query
            if batch:
                columns = list(batch[0].keys())
                placeholders = ', '.join(['%s'] * len(columns))
                column_names = ', '.join(columns)

                insert_query = f"""
                INSERT INTO fact_invoices ({column_names})
                VALUES ({placeholders})
                ON CONFLICT (inv_number, item_code, surgery_date) DO NOTHING
                """

                # Execute batch
                values_list = [[record[col] for col in columns] for record in batch]

                for values in values_list:
                    try:
                        pg_client.execute_query(insert_query, params=tuple(values))
                        total_inserted += 1
                    except Exception as e:
                        total_failed += 1
                        if total_failed <= 5:  # Show first 5 errors
                            print(f"   ⚠️  Error inserting record: {str(e)[:100]}")

                print(f"   Batch {batch_num}/{total_batches}: {len(batch)} records processed")

        except Exception as e:
            print(f"   ❌ ERROR in batch {batch_num}: {str(e)}")
            total_failed += len(batch)

    # 7. Validate load
    print("\n✅ Load complete!")
    print(f"   Records inserted: {total_inserted:,}")
    print(f"   Records failed: {total_failed:,}")

    # Count final records
    final_count_query = "SELECT COUNT(*) as count FROM fact_invoices"
    final_result = pg_client.execute_query(final_count_query)
    final_count = final_result[0]['count'] if final_result else 0

    print(f"\n📊 Final validation:")
    print(f"   Total records in fact_invoices: {final_count:,}")
    print(f"   Expected records: ~21,005")

    if final_count > 20000:
        print("   ✅ Load successful!")
    else:
        print("   ⚠️  WARNING: Record count is lower than expected")

    # Show summary statistics
    print("\n📈 Summary statistics:")
    summary_query = """
    SELECT
        COUNT(*) as total_records,
        COUNT(DISTINCT inv_number) as unique_invoices,
        COUNT(DISTINCT item_code) as unique_items,
        MIN(surgery_date) as earliest_date,
        MAX(surgery_date) as latest_date,
        ROUND(SUM(amount)::numeric, 2) as total_amount
    FROM fact_invoices
    """

    summary = pg_client.execute_query(summary_query)
    if summary:
        s = summary[0]
        print(f"   Total records: {s['total_records']:,}")
        print(f"   Unique invoices: {s['unique_invoices']:,}")
        print(f"   Unique items: {s['unique_items']:,}")
        print(f"   Date range: {s['earliest_date']} to {s['latest_date']}")
        print(f"   Total amount: ${s['total_amount']:,.2f}")

    print("\n" + "=" * 100)
    print("ETL COMPLETE")
    print("=" * 100 + "\n")

if __name__ == "__main__":
    load_invoice_data()
