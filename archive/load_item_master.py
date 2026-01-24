#!/usr/bin/env python3
"""
ETL Script: Load Item Master Data into dim_items table
Loads 12,852 items with 31 attributes from #3 - Item Data File.xlsx
"""

import pandas as pd
import sys
from pathlib import Path
from datetime import datetime
from decimal import Decimal
from src.db.postgresql_client import PostgreSQLClient

EXCEL_FOLDER = "/Users/inder/projects/mantrix-unified-nexxt-v1/excelfolder"
EXCEL_FILE = "#3 - Item Data File.xlsx"

def clean_and_transform_item_data(df):
    """Clean and transform item master data for loading"""
    print(f"\n📊 Original data shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")

    # Create a copy
    df_clean = df.copy()

    # Column mapping - map Excel columns to database columns
    column_mapping = {
        'Item No.': 'item_number',
        'Item Number': 'item_number',  # Alternative column name
        'Item Description': 'item_description',
        'Label Impl Hgt': 'label_impl_hgt',
        'In Stock': 'in_stock',
        'Rev Level': 'rev_level',
        'Part Status': 'part_status',
        'Active': 'active',
        'Item Group': 'item_group',
        'Batch Prefix': 'batch_prefix',
        'UDI #': 'udi_number',
        'System Name': 'system_name',
        'Label System': 'label_system',
        'IFU #': 'ifu_number',
        'Min Stock': 'min_stock',
        'Drawing #': 'drawing_number',
        'Inventory UOM': 'inventory_uom',
        'Sales UOM': 'sales_uom',
        'Item Cost': 'item_cost',
        'Last Evaluated Price': 'last_evaluated_price',
        'Procurement Method': 'procurement_method',
        'Purchasing UOM': 'purchasing_uom',
        'Preferred Vendor': 'preferred_vendor',
        'Mfr Catalog #': 'mfr_catalog_no',
        'Material': 'material',
        'Manage Batch #': 'manage_batch_no',
        'Attachment Path': 'attachment_path',
        'Attachment Entry': 'attachment_entry',
        'Assessable Value': 'assessable_value',
        'Items per Purchase Unit': 'items_per_purchase_unit',
        'Serial # Management': 'serial_no_management'
    }

    # Rename columns (case-insensitive matching)
    actual_mapping = {}
    for excel_col in df_clean.columns:
        for expected_col, db_col in column_mapping.items():
            if excel_col.strip().lower() == expected_col.lower():
                actual_mapping[excel_col] = db_col
                break

    print(f"\n🔄 Column mapping detected ({len(actual_mapping)} columns):")
    for old, new in list(actual_mapping.items())[:10]:
        print(f"   {old} → {new}")
    if len(actual_mapping) > 10:
        print(f"   ... and {len(actual_mapping) - 10} more")

    # Rename columns
    df_clean = df_clean.rename(columns=actual_mapping)

    # Ensure item_number exists (required primary key)
    if 'item_number' not in df_clean.columns:
        print(f"\n❌ ERROR: 'item_number' column not found!")
        print(f"Available columns: {list(df_clean.columns)}")
        sys.exit(1)

    # Remove completely empty rows
    df_clean = df_clean.dropna(how='all')

    # Clean item_number - convert to string, strip whitespace
    df_clean['item_number'] = df_clean['item_number'].astype(str).str.strip()
    df_clean = df_clean[df_clean['item_number'].notna()]
    df_clean = df_clean[df_clean['item_number'] != '']
    df_clean = df_clean[df_clean['item_number'] != 'nan']

    # Remove duplicates (keep first occurrence)
    original_count = len(df_clean)
    df_clean = df_clean.drop_duplicates(subset=['item_number'], keep='first')
    duplicates_removed = original_count - len(df_clean)
    if duplicates_removed > 0:
        print(f"\n⚠️  Removed {duplicates_removed} duplicate item_numbers")

    # Clean text fields
    text_fields = ['item_description', 'label_impl_hgt', 'rev_level', 'part_status',
                   'item_group', 'batch_prefix', 'udi_number', 'system_name', 'label_system',
                   'ifu_number', 'drawing_number', 'inventory_uom', 'sales_uom',
                   'procurement_method', 'purchasing_uom', 'preferred_vendor', 'mfr_catalog_no',
                   'material', 'attachment_path', 'attachment_entry']

    for field in text_fields:
        if field in df_clean.columns:
            df_clean[field] = df_clean[field].astype(str).str.strip()
            df_clean[field] = df_clean[field].replace('nan', None)
            df_clean[field] = df_clean[field].replace('', None)

    # Clean numeric fields
    numeric_fields = ['in_stock', 'min_stock', 'item_cost', 'last_evaluated_price',
                      'assessable_value', 'items_per_purchase_unit']

    for field in numeric_fields:
        if field in df_clean.columns:
            df_clean[field] = pd.to_numeric(df_clean[field], errors='coerce')

    # Clean boolean fields
    boolean_fields = ['active', 'manage_batch_no', 'serial_no_management']

    for field in boolean_fields:
        if field in df_clean.columns:
            # Convert various representations to boolean
            df_clean[field] = df_clean[field].map({
                'Yes': True, 'yes': True, 'Y': True, 'y': True, 'TRUE': True, 'True': True, True: True, 1: True,
                'No': False, 'no': False, 'N': False, 'n': False, 'FALSE': False, 'False': False, False: False, 0: False
            })

    # Select only columns that exist in the database schema
    db_columns = [
        'item_number', 'item_description', 'label_impl_hgt', 'in_stock', 'rev_level',
        'part_status', 'active', 'item_group', 'batch_prefix', 'udi_number', 'system_name',
        'label_system', 'ifu_number', 'min_stock', 'drawing_number', 'inventory_uom',
        'sales_uom', 'item_cost', 'last_evaluated_price', 'procurement_method',
        'purchasing_uom', 'preferred_vendor', 'mfr_catalog_no', 'material',
        'manage_batch_no', 'attachment_path', 'attachment_entry', 'assessable_value',
        'items_per_purchase_unit', 'serial_no_management'
    ]

    existing_cols = [col for col in db_columns if col in df_clean.columns]
    df_clean = df_clean[existing_cols]

    print(f"\n✅ Cleaned data shape: {df_clean.shape}")
    print(f"\n📊 Data quality:")
    print(f"   Total items: {len(df_clean):,}")
    print(f"   Columns mapped: {len(existing_cols)}/31")

    if 'item_group' in df_clean.columns:
        print(f"   Unique item groups: {df_clean['item_group'].nunique()}")

    if 'system_name' in df_clean.columns:
        print(f"   Unique systems: {df_clean['system_name'].nunique()}")

    if 'active' in df_clean.columns:
        active_count = df_clean['active'].sum() if df_clean['active'].notna().any() else 0
        print(f"   Active items: {active_count:,}")

    return df_clean

def load_item_master():
    """Main ETL function"""
    print("=" * 100)
    print("MARGEN.AI - ITEM MASTER DATA ETL")
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
    df_clean = clean_and_transform_item_data(df)

    # 4. Check for existing data
    print("\n🔍 Checking existing data in dim_items...")
    existing_count_query = "SELECT COUNT(*) as count FROM dim_items"
    existing_result = pg_client.execute_query(existing_count_query)
    existing_count = existing_result[0]['count'] if existing_result else 0
    print(f"   Current records: {existing_count:,}")

    if existing_count > 0:
        print("\n⚠️  WARNING: dim_items table already has data!")
        print("   This script will INSERT new records (duplicates will be skipped)")
        response = input("   Continue? (yes/no): ")
        if response.lower() != 'yes':
            print("❌ Aborted by user")
            sys.exit(0)

    # 5. Prepare data for insertion
    print("\n📝 Preparing data for insertion...")

    # Convert DataFrame to list of dicts
    records = df_clean.to_dict('records')

    # Convert NaN to None
    for record in records:
        for key, value in record.items():
            if pd.isna(value):
                record[key] = None
            elif key in ['in_stock', 'min_stock', 'item_cost', 'last_evaluated_price',
                        'assessable_value', 'items_per_purchase_unit'] and value is not None:
                record[key] = float(value)

    print(f"✅ Prepared {len(records):,} records for insertion")

    # 6. Insert data in batches
    print("\n💾 Inserting data into dim_items...")

    BATCH_SIZE = 500
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
                INSERT INTO dim_items ({column_names})
                VALUES ({placeholders})
                ON CONFLICT (item_number) DO NOTHING
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
    final_count_query = "SELECT COUNT(*) as count FROM dim_items"
    final_result = pg_client.execute_query(final_count_query)
    final_count = final_result[0]['count'] if final_result else 0

    print(f"\n📊 Final validation:")
    print(f"   Total records in dim_items: {final_count:,}")
    print(f"   Expected records: ~12,852")

    if final_count > 12000:
        print("   ✅ Load successful!")
    else:
        print("   ⚠️  WARNING: Record count is lower than expected")

    # Show summary statistics
    print("\n📈 Summary statistics:")
    summary_query = """
    SELECT
        COUNT(*) as total_items,
        COUNT(DISTINCT item_group) as unique_groups,
        COUNT(DISTINCT system_name) as unique_systems,
        COUNT(CASE WHEN active = TRUE THEN 1 END) as active_items,
        COUNT(CASE WHEN in_stock > 0 THEN 1 END) as items_in_stock,
        ROUND(AVG(in_stock)::numeric, 2) as avg_stock_level
    FROM dim_items
    """

    summary = pg_client.execute_query(summary_query)
    if summary:
        s = summary[0]
        print(f"   Total items: {s['total_items']:,}")
        print(f"   Unique item groups: {s['unique_groups']}")
        print(f"   Unique systems: {s['unique_systems']}")
        print(f"   Active items: {s['active_items']:,}")
        print(f"   Items in stock: {s['items_in_stock']:,}")
        print(f"   Avg stock level: {s['avg_stock_level']}")

    print("\n" + "=" * 100)
    print("ETL COMPLETE")
    print("=" * 100 + "\n")

if __name__ == "__main__":
    load_item_master()
