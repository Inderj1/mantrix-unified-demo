"""
MARGEN.AI Data ETL Pipeline
Loads Excel files from excelfolder/ into PostgreSQL database
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from db.postgresql_client import PostgreSQLClient


class MargenETL:
    """ETL pipeline for MARGEN.AI data"""

    def __init__(self, database="customer_analytics"):
        self.pg_client = PostgreSQLClient(database=database)
        self.conn = psycopg2.connect(
            host="localhost",
            database=database,
            user="postgres",
            password="postgres"
        )
        self.cursor = self.conn.cursor()

    def load_csg_transactions(self, file_path="/Users/inder/projects/mantrix-unified-nexxt-v1/excelfolder/csg.xlsx"):
        """Load primary fact table from csg.xlsx"""
        print(f"\n{'='*60}")
        print("Loading CSG Transactions from csg.xlsx")
        print(f"{'='*60}")

        try:
            # Read Excel file (skip first 2 rows, row 2 is header)
            print(f"Reading file: {file_path}")
            df = pd.read_excel(file_path, sheet_name='2025 - Data', header=2)
            print(f"✓ Loaded {len(df)} rows from Excel")

            # Data cleaning and transformation
            print("\nCleaning and transforming data...")

            # Clean date
            df['surgery_date'] = pd.to_datetime(df['Surgery Date'], errors='coerce')

            # Clean numeric fields
            numeric_fields = ['Quantity', 'Price Each', 'Total Sales', 'Total Std Cost', 'Total GM']
            for field in numeric_fields:
                if field in df.columns:
                    df[field.lower().replace(' ', '_')] = pd.to_numeric(
                        df[field], errors='coerce'
                    )

            # Clean string fields
            string_fields = {
                'Surgeon': 'surgeon',
                'Distributor': 'distributor',
                'Region': 'region',
                'Facility': 'facility',
                'System': 'system',
                'Item Code': 'item_code',
                'Item Description': 'item_description'
            }

            for excel_col, db_col in string_fields.items():
                if excel_col in df.columns:
                    df[db_col] = df[excel_col].astype(str).str.strip()
                    df[db_col] = df[db_col].replace('nan', None)

            # Calculate GM percent
            df['gm_percent'] = df.apply(
                lambda row: (row['total_gm'] / row['total_sales'] * 100)
                if row['total_sales'] and row['total_sales'] > 0 else 0,
                axis=1
            )

            # Remove rows with invalid dates
            df = df[df['surgery_date'].notna()]
            print(f"✓ After cleaning: {len(df)} valid rows")

            # Data validation
            print("\nValidating data...")
            total_revenue = df['total_sales'].sum()
            total_cogs = df['total_std_cost'].sum()
            total_gm = df['total_gm'].sum()
            print(f"Total Revenue: ${total_revenue:,.2f}")
            print(f"Total COGS: ${total_cogs:,.2f}")
            print(f"Total Gross Margin: ${total_gm:,.2f}")
            print(f"Date Range: {df['surgery_date'].min()} to {df['surgery_date'].max()}")

            # Load dimension tables first
            print("\nPopulating dimension tables...")
            self._load_dimensions(df)

            # Insert transactions
            print("\nInserting transactions into fact_transactions...")
            insert_query = """
                INSERT INTO fact_transactions (
                    surgery_date, surgeon, distributor, region, facility, system,
                    item_code, item_description, quantity, price_each,
                    total_sales, total_std_cost, total_gm, gm_percent
                ) VALUES %s
                ON CONFLICT DO NOTHING
            """

            # Prepare data for bulk insert
            values = []
            for _, row in df.iterrows():
                values.append((
                    row['surgery_date'],
                    row.get('surgeon'),
                    row.get('distributor'),
                    row.get('region'),
                    row.get('facility'),
                    row.get('system'),
                    row.get('item_code'),
                    row.get('item_description'),
                    row.get('quantity'),
                    row.get('price_each'),
                    row.get('total_sales'),
                    row.get('total_std_cost'),
                    row.get('total_gm'),
                    row.get('gm_percent')
                ))

            # Bulk insert
            execute_values(self.cursor, insert_query, values, page_size=1000)
            self.conn.commit()
            print(f"✓ Inserted {len(values)} transactions")

            # Refresh materialized views
            print("\nRefreshing materialized views...")
            self.cursor.execute("SELECT refresh_margen_views()")
            self.conn.commit()
            print("✓ Materialized views refreshed")

            print(f"\n{'='*60}")
            print("✓ CSG Transaction load complete!")
            print(f"{'='*60}\n")

            return {
                'status': 'success',
                'rows_loaded': len(values),
                'total_revenue': float(total_revenue),
                'total_cogs': float(total_cogs),
                'total_gm': float(total_gm)
            }

        except Exception as e:
            self.conn.rollback()
            print(f"\n✗ Error loading CSG transactions: {e}")
            import traceback
            traceback.print_exc()
            return {'status': 'error', 'message': str(e)}

    def _load_dimensions(self, df):
        """Load dimension tables from dataframe"""

        # Surgeons
        if 'surgeon' in df.columns:
            surgeons = df['surgeon'].dropna().unique()
            for surgeon in surgeons:
                self.cursor.execute("""
                    INSERT INTO dim_surgeon (surgeon_name)
                    VALUES (%s)
                    ON CONFLICT (surgeon_name) DO NOTHING
                """, (surgeon,))
            print(f"  ✓ Loaded {len(surgeons)} surgeons")

        # Distributors
        if 'distributor' in df.columns:
            distributors = df['distributor'].dropna().unique()
            for distributor in distributors:
                self.cursor.execute("""
                    INSERT INTO dim_distributor (distributor_name)
                    VALUES (%s)
                    ON CONFLICT (distributor_name) DO NOTHING
                """, (distributor,))
            print(f"  ✓ Loaded {len(distributors)} distributors")

        # Facilities
        if 'facility' in df.columns:
            facilities = df['facility'].dropna().unique()
            for facility in facilities:
                self.cursor.execute("""
                    INSERT INTO dim_facility (facility_name)
                    VALUES (%s)
                    ON CONFLICT (facility_name) DO NOTHING
                """, (facility,))
            print(f"  ✓ Loaded {len(facilities)} facilities")

        # Regions
        if 'region' in df.columns:
            regions = df['region'].dropna().unique()
            for region in regions:
                self.cursor.execute("""
                    INSERT INTO dim_region (region_name)
                    VALUES (%s)
                    ON CONFLICT (region_name) DO NOTHING
                """, (region,))
            print(f"  ✓ Loaded {len(regions)} regions")

        # Systems
        if 'system' in df.columns:
            systems = df['system'].dropna().unique()
            for system in systems:
                self.cursor.execute("""
                    INSERT INTO dim_system (system_name)
                    VALUES (%s)
                    ON CONFLICT (system_name) DO NOTHING
                """, (system,))
            print(f"  ✓ Loaded {len(systems)} product systems")

        self.conn.commit()

    def load_distributor_pl(self, file_path="/Users/inder/projects/mantrix-unified-nexxt-v1/excelfolder/SOP 6.0-01-10 Distributor Profitability Q3 2025 (3).xlsx"):
        """Load P&L data from SOP Distributor Profitability file"""
        print(f"\n{'='*60}")
        print("Loading Distributor P&L Data")
        print(f"{'='*60}")

        try:
            # Read Excel file
            print(f"Reading file: {file_path}")
            df = pd.read_excel(file_path, sheet_name='Sheet1')
            print(f"✓ Loaded {len(df)} rows from Excel")

            # Clean data
            print("\nCleaning and transforming data...")

            # Map column names (adjust based on actual Excel structure)
            column_mapping = {
                'Distributor': 'distributor',
                'Month': 'month',
                'Grand Total': 'grand_total',
                'Total Product Cost': 'total_product_cost',
                'Gross Profit': 'gross_profit',
                'GP %': 'gross_profit_percent',
                'Commission': 'commission',
                'COMM %': 'commission_percent',
                'Inv Carry Cost': 'inventory_carrying_cost',
                'Inventory %': 'inventory_percent',
                'Operating Profit': 'operating_profit',
                'OP %': 'operating_profit_percent',
                'Net Profit': 'net_profit',
                'NP %': 'net_profit_percent'
            }

            # Rename columns that exist
            for old_name, new_name in column_mapping.items():
                if old_name in df.columns:
                    df[new_name] = df[old_name]

            # Convert month to date
            if 'month' in df.columns:
                df['month_date'] = pd.to_datetime(df['month'] + '-01', errors='coerce')

            # Clean numeric fields
            numeric_cols = [
                'grand_total', 'total_product_cost', 'gross_profit',
                'commission', 'inventory_carrying_cost',
                'operating_profit', 'net_profit'
            ]
            for col in numeric_cols:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')

            # Calculate total OPEX
            df['total_opex'] = df.get('commission', 0) + df.get('inventory_carrying_cost', 0)

            # Remove invalid rows
            df = df[df['distributor'].notna()]
            print(f"✓ After cleaning: {len(df)} valid rows")

            # Insert P&L records
            print("\nInserting P&L records into fact_distributor_pl...")
            insert_query = """
                INSERT INTO fact_distributor_pl (
                    distributor, month, month_date,
                    grand_total, total_product_cost, gross_profit, gross_profit_percent,
                    commission, commission_percent,
                    inventory_carrying_cost, inventory_percent,
                    total_opex, operating_profit, operating_profit_percent,
                    net_profit, net_profit_percent
                ) VALUES %s
                ON CONFLICT (distributor, month) DO UPDATE SET
                    grand_total = EXCLUDED.grand_total,
                    total_product_cost = EXCLUDED.total_product_cost,
                    gross_profit = EXCLUDED.gross_profit,
                    updated_at = CURRENT_TIMESTAMP
            """

            values = []
            for _, row in df.iterrows():
                values.append((
                    row.get('distributor'),
                    row.get('month'),
                    row.get('month_date'),
                    row.get('grand_total'),
                    row.get('total_product_cost'),
                    row.get('gross_profit'),
                    row.get('gross_profit_percent'),
                    row.get('commission'),
                    row.get('commission_percent'),
                    row.get('inventory_carrying_cost'),
                    row.get('inventory_percent'),
                    row.get('total_opex'),
                    row.get('operating_profit'),
                    row.get('operating_profit_percent'),
                    row.get('net_profit'),
                    row.get('net_profit_percent')
                ))

            execute_values(self.cursor, insert_query, values, page_size=100)
            self.conn.commit()
            print(f"✓ Inserted/Updated {len(values)} P&L records")

            print(f"\n{'='*60}")
            print("✓ Distributor P&L load complete!")
            print(f"{'='*60}\n")

            return {
                'status': 'success',
                'rows_loaded': len(values)
            }

        except Exception as e:
            self.conn.rollback()
            print(f"\n✗ Error loading Distributor P&L: {e}")
            import traceback
            traceback.print_exc()
            return {'status': 'error', 'message': str(e)}

    def validate_data(self):
        """Validate loaded data"""
        print(f"\n{'='*60}")
        print("Data Validation Report")
        print(f"{'='*60}")

        # Count records
        self.cursor.execute("SELECT COUNT(*) FROM fact_transactions")
        txn_count = self.cursor.fetchone()[0]
        print(f"\nFact Transactions: {txn_count:,} rows")

        # Sum totals
        self.cursor.execute("""
            SELECT
                SUM(total_sales) as revenue,
                SUM(total_std_cost) as cogs,
                SUM(total_gm) as gm
            FROM fact_transactions
        """)
        totals = self.cursor.fetchone()
        print(f"Total Revenue: ${totals[0]:,.2f}")
        print(f"Total COGS: ${totals[1]:,.2f}")
        print(f"Total GM: ${totals[2]:,.2f}")
        print(f"GM %: {(totals[2] / totals[0] * 100):.2f}%")

        # Dimension counts
        self.cursor.execute("SELECT COUNT(*) FROM dim_surgeon")
        print(f"\nDimension Counts:")
        print(f"  Surgeons: {self.cursor.fetchone()[0]}")

        self.cursor.execute("SELECT COUNT(*) FROM dim_distributor")
        print(f"  Distributors: {self.cursor.fetchone()[0]}")

        self.cursor.execute("SELECT COUNT(*) FROM dim_facility")
        print(f"  Facilities: {self.cursor.fetchone()[0]}")

        self.cursor.execute("SELECT COUNT(*) FROM dim_region")
        print(f"  Regions: {self.cursor.fetchone()[0]}")

        self.cursor.execute("SELECT COUNT(*) FROM dim_system")
        print(f"  Systems: {self.cursor.fetchone()[0]}")

        # Date range
        self.cursor.execute("""
            SELECT MIN(surgery_date), MAX(surgery_date)
            FROM fact_transactions
        """)
        date_range = self.cursor.fetchone()
        print(f"\nDate Range: {date_range[0]} to {date_range[1]}")

        # Materialized views
        self.cursor.execute("SELECT COUNT(*) FROM mv_monthly_revenue")
        print(f"\nMaterialized Views:")
        print(f"  Monthly Revenue: {self.cursor.fetchone()[0]} months")

        self.cursor.execute("SELECT COUNT(*) FROM mv_revenue_by_system")
        print(f"  Revenue by System: {self.cursor.fetchone()[0]} systems")

        print(f"\n{'='*60}\n")

    def close(self):
        """Close database connections"""
        self.cursor.close()
        self.conn.close()


def main():
    """Main ETL execution"""
    print("\n" + "="*60)
    print("MARGEN.AI ETL Pipeline")
    print("="*60)

    etl = MargenETL()

    try:
        # Load CSG transactions
        result1 = etl.load_csg_transactions()
        if result1['status'] == 'error':
            print(f"✗ Failed to load CSG transactions: {result1['message']}")
            return

        # Load Distributor P&L
        result2 = etl.load_distributor_pl()
        if result2['status'] == 'error':
            print(f"⚠ Warning: Failed to load Distributor P&L: {result2['message']}")

        # Validate
        etl.validate_data()

        print("="*60)
        print("✓ ETL Pipeline Complete!")
        print("="*60)

    except Exception as e:
        print(f"\n✗ ETL Pipeline Failed: {e}")
        import traceback
        traceback.print_exc()

    finally:
        etl.close()


if __name__ == '__main__':
    main()
