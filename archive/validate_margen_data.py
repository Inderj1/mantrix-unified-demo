#!/usr/bin/env python3
"""
MARGEN.AI Data Validation Script
Validates PostgreSQL database totals against source Excel file

Expected Totals from Excel (csg.xlsx - 2025 Data sheet):
- Total Transactions: 13,440
- Total Revenue: $17,761,184.18
- Total COGS: $1,516,694.00
- Total Gross Margin: $16,244,490.18
- Overall GM%: 91.46%
- Total Quantity: 33,221 units
- Date Range: 2025-01-01 to 2025-08-21
- Unique Surgeons: 292 (excluding nulls)
- Unique Distributors: 128
- Unique Systems: 28
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.db.postgresql_client import PostgreSQLClient
from decimal import Decimal
from datetime import date

# Expected values from Excel analysis
EXPECTED = {
    'total_transactions': 13440,
    'total_revenue': Decimal('17761184.18'),
    'total_cogs': Decimal('1516694.00'),
    'total_gm': Decimal('16244490.18'),
    'gm_percent': Decimal('91.46'),
    'total_quantity': 33221,
    'start_date': date(2025, 1, 1),
    'end_date': date(2025, 8, 21),
    'unique_surgeons': 292,
    'unique_distributors': 128,
    'unique_systems': 28,
    'top_surgeon': 'McDermott',
    'top_surgeon_revenue': Decimal('1411439.67'),
    'top_distributor': 'Albert Turgon',
    'top_distributor_revenue': Decimal('2279371.13'),
    'top_system': 'Struxxure',
    'top_system_revenue': Decimal('2207998.44'),
    'march_revenue': Decimal('2618074.00'),
    'march_transactions': 1773,
}

def validate_totals(pg_client):
    """Test 1: Validate overall totals"""
    print("\n" + "="*80)
    print("TEST 1: OVERALL TOTALS VALIDATION")
    print("="*80)

    query = """
    SELECT
        COUNT(*) as transaction_count,
        ROUND(SUM(total_sales)::numeric, 2) as total_revenue,
        ROUND(SUM(total_std_cost)::numeric, 2) as total_cogs,
        ROUND(SUM(total_gm)::numeric, 2) as total_gm,
        ROUND((SUM(total_gm) / NULLIF(SUM(total_sales), 0) * 100)::numeric, 2) as gm_percent,
        SUM(quantity) as total_quantity,
        MIN(surgery_date) as start_date,
        MAX(surgery_date) as end_date
    FROM fact_transactions
    """

    result = pg_client.execute_query(query)
    if not result:
        print("❌ FAILED: No data returned from database")
        return False

    actual = result[0]
    passed = True

    # Transaction count
    if actual['transaction_count'] == EXPECTED['total_transactions']:
        print(f"✅ Transaction Count: {actual['transaction_count']:,}")
    else:
        print(f"❌ Transaction Count: Expected {EXPECTED['total_transactions']:,}, Got {actual['transaction_count']:,}")
        passed = False

    # Total Revenue
    if abs(Decimal(str(actual['total_revenue'])) - EXPECTED['total_revenue']) < Decimal('0.01'):
        print(f"✅ Total Revenue: ${actual['total_revenue']:,.2f}")
    else:
        print(f"❌ Total Revenue: Expected ${EXPECTED['total_revenue']:,.2f}, Got ${actual['total_revenue']:,.2f}")
        passed = False

    # Total COGS
    if abs(Decimal(str(actual['total_cogs'])) - EXPECTED['total_cogs']) < Decimal('0.01'):
        print(f"✅ Total COGS: ${actual['total_cogs']:,.2f}")
    else:
        print(f"❌ Total COGS: Expected ${EXPECTED['total_cogs']:,.2f}, Got ${actual['total_cogs']:,.2f}")
        passed = False

    # Total GM
    if abs(Decimal(str(actual['total_gm'])) - EXPECTED['total_gm']) < Decimal('0.01'):
        print(f"✅ Total Gross Margin: ${actual['total_gm']:,.2f}")
    else:
        print(f"❌ Total Gross Margin: Expected ${EXPECTED['total_gm']:,.2f}, Got ${actual['total_gm']:,.2f}")
        passed = False

    # GM Percent
    if abs(Decimal(str(actual['gm_percent'])) - EXPECTED['gm_percent']) < Decimal('0.01'):
        print(f"✅ GM Percent: {actual['gm_percent']}%")
    else:
        print(f"❌ GM Percent: Expected {EXPECTED['gm_percent']}%, Got {actual['gm_percent']}%")
        passed = False

    # Total Quantity
    if actual['total_quantity'] == EXPECTED['total_quantity']:
        print(f"✅ Total Quantity: {actual['total_quantity']:,} units")
    else:
        print(f"❌ Total Quantity: Expected {EXPECTED['total_quantity']:,}, Got {actual['total_quantity']:,}")
        passed = False

    # Date Range
    if actual['start_date'] == EXPECTED['start_date'] and actual['end_date'] == EXPECTED['end_date']:
        print(f"✅ Date Range: {actual['start_date']} to {actual['end_date']}")
    else:
        print(f"❌ Date Range: Expected {EXPECTED['start_date']} to {EXPECTED['end_date']}, Got {actual['start_date']} to {actual['end_date']}")
        passed = False

    return passed

def validate_unique_counts(pg_client):
    """Test 2: Validate unique entity counts"""
    print("\n" + "="*80)
    print("TEST 2: UNIQUE ENTITY COUNTS")
    print("="*80)

    # Surgeons (excluding nulls)
    query = "SELECT COUNT(DISTINCT surgeon) as count FROM fact_transactions WHERE surgeon IS NOT NULL"
    result = pg_client.execute_query(query)
    actual_surgeons = result[0]['count']

    if actual_surgeons == EXPECTED['unique_surgeons']:
        print(f"✅ Unique Surgeons: {actual_surgeons}")
    else:
        print(f"❌ Unique Surgeons: Expected {EXPECTED['unique_surgeons']}, Got {actual_surgeons}")

    # Distributors
    query = "SELECT COUNT(DISTINCT distributor) as count FROM fact_transactions"
    result = pg_client.execute_query(query)
    actual_distributors = result[0]['count']

    if actual_distributors == EXPECTED['unique_distributors']:
        print(f"✅ Unique Distributors: {actual_distributors}")
    else:
        print(f"❌ Unique Distributors: Expected {EXPECTED['unique_distributors']}, Got {actual_distributors}")

    # Systems
    query = "SELECT COUNT(DISTINCT system) as count FROM fact_transactions"
    result = pg_client.execute_query(query)
    actual_systems = result[0]['count']

    if actual_systems == EXPECTED['unique_systems']:
        print(f"✅ Unique Systems: {actual_systems}")
    else:
        print(f"❌ Unique Systems: Expected {EXPECTED['unique_systems']}, Got {actual_systems}")

def validate_top_performers(pg_client):
    """Test 3: Validate top performers"""
    print("\n" + "="*80)
    print("TEST 3: TOP PERFORMERS VALIDATION")
    print("="*80)

    # Top Surgeon
    query = """
    SELECT surgeon, ROUND(SUM(total_sales)::numeric, 2) as revenue
    FROM fact_transactions
    WHERE surgeon IS NOT NULL
    GROUP BY surgeon
    ORDER BY revenue DESC
    LIMIT 1
    """
    result = pg_client.execute_query(query)
    if result:
        actual = result[0]
        if actual['surgeon'] == EXPECTED['top_surgeon'] and abs(Decimal(str(actual['revenue'])) - EXPECTED['top_surgeon_revenue']) < Decimal('0.01'):
            print(f"✅ Top Surgeon: {actual['surgeon']} (${actual['revenue']:,.2f})")
        else:
            print(f"❌ Top Surgeon: Expected {EXPECTED['top_surgeon']} (${EXPECTED['top_surgeon_revenue']:,.2f}), Got {actual['surgeon']} (${actual['revenue']:,.2f})")

    # Top Distributor
    query = """
    SELECT distributor, ROUND(SUM(total_sales)::numeric, 2) as revenue
    FROM fact_transactions
    GROUP BY distributor
    ORDER BY revenue DESC
    LIMIT 1
    """
    result = pg_client.execute_query(query)
    if result:
        actual = result[0]
        if actual['distributor'] == EXPECTED['top_distributor'] and abs(Decimal(str(actual['revenue'])) - EXPECTED['top_distributor_revenue']) < Decimal('0.01'):
            print(f"✅ Top Distributor: {actual['distributor']} (${actual['revenue']:,.2f})")
        else:
            print(f"❌ Top Distributor: Expected {EXPECTED['top_distributor']} (${EXPECTED['top_distributor_revenue']:,.2f}), Got {actual['distributor']} (${actual['revenue']:,.2f})")

    # Top System
    query = """
    SELECT system, ROUND(SUM(total_sales)::numeric, 2) as revenue
    FROM fact_transactions
    GROUP BY system
    ORDER BY revenue DESC
    LIMIT 1
    """
    result = pg_client.execute_query(query)
    if result:
        actual = result[0]
        if actual['system'] == EXPECTED['top_system'] and abs(Decimal(str(actual['revenue'])) - EXPECTED['top_system_revenue']) < Decimal('0.01'):
            print(f"✅ Top System: {actual['system']} (${actual['revenue']:,.2f})")
        else:
            print(f"❌ Top System: Expected {EXPECTED['top_system']} (${EXPECTED['top_system_revenue']:,.2f}), Got {actual['system']} (${actual['revenue']:,.2f})")

def validate_monthly_breakdown(pg_client):
    """Test 4: Validate monthly data (March 2025 - peak month)"""
    print("\n" + "="*80)
    print("TEST 4: MONTHLY BREAKDOWN (MARCH 2025 - PEAK MONTH)")
    print("="*80)

    query = """
    SELECT
        COUNT(*) as transaction_count,
        ROUND(SUM(total_sales)::numeric, 2) as revenue
    FROM fact_transactions
    WHERE DATE_TRUNC('month', surgery_date) = '2025-03-01'::date
    """
    result = pg_client.execute_query(query)
    if result:
        actual = result[0]

        if actual['transaction_count'] == EXPECTED['march_transactions']:
            print(f"✅ March Transaction Count: {actual['transaction_count']:,}")
        else:
            print(f"❌ March Transaction Count: Expected {EXPECTED['march_transactions']:,}, Got {actual['transaction_count']:,}")

        if abs(Decimal(str(actual['revenue'])) - EXPECTED['march_revenue']) < Decimal('0.01'):
            print(f"✅ March Revenue: ${actual['revenue']:,.2f}")
        else:
            print(f"❌ March Revenue: Expected ${EXPECTED['march_revenue']:,.2f}, Got ${actual['revenue']:,.2f}")

def validate_api_endpoints(pg_client):
    """Test 5: Validate API endpoint calculations"""
    print("\n" + "="*80)
    print("TEST 5: API ENDPOINT CALCULATIONS")
    print("="*80)

    # Revenue Summary API
    query = """
    SELECT
        ROUND(SUM(total_sales)::numeric, 2) as total_revenue,
        ROUND(SUM(total_gm)::numeric, 2) as total_gm,
        ROUND((SUM(total_gm) / NULLIF(SUM(total_sales), 0) * 100)::numeric, 2) as gm_percent,
        COUNT(*) as transaction_count
    FROM fact_transactions
    """
    result = pg_client.execute_query(query)
    if result:
        print(f"✅ Revenue Summary API: ${result[0]['total_revenue']:,.2f} revenue, {result[0]['gm_percent']}% GM")

    # COGS Summary API
    query = """
    SELECT
        ROUND(SUM(total_std_cost)::numeric, 2) as total_cogs,
        ROUND((SUM(total_std_cost) / NULLIF(SUM(total_sales), 0) * 100)::numeric, 2) as cogs_percent
    FROM fact_transactions
    """
    result = pg_client.execute_query(query)
    if result:
        print(f"✅ COGS Summary API: ${result[0]['total_cogs']:,.2f} COGS, {result[0]['cogs_percent']}% of revenue")

    # Margin by System API (top 5)
    query = """
    SELECT
        system,
        ROUND(SUM(total_gm)::numeric, 2) as total_gm,
        ROUND((SUM(total_gm) / NULLIF(SUM(total_sales), 0) * 100)::numeric, 2) as gm_percent
    FROM fact_transactions
    GROUP BY system
    ORDER BY gm_percent DESC
    LIMIT 5
    """
    result = pg_client.execute_query(query)
    if result:
        print(f"✅ Top 5 Systems by GM%:")
        for i, row in enumerate(result, 1):
            print(f"   {i}. {row['system']}: {row['gm_percent']}% (${row['total_gm']:,.2f})")

def main():
    print("\n" + "="*80)
    print("MARGEN.AI DATA VALIDATION SUITE")
    print("Validating PostgreSQL database against Excel source (csg.xlsx)")
    print("="*80)

    pg_client = PostgreSQLClient()

    try:
        # Run all validation tests
        test_results = []

        test_results.append(("Overall Totals", validate_totals(pg_client)))
        validate_unique_counts(pg_client)
        validate_top_performers(pg_client)
        validate_monthly_breakdown(pg_client)
        validate_api_endpoints(pg_client)

        # Summary
        print("\n" + "="*80)
        print("VALIDATION SUMMARY")
        print("="*80)

        for test_name, passed in test_results:
            status = "✅ PASSED" if passed else "❌ FAILED"
            print(f"{status}: {test_name}")

        print("\n" + "="*80)
        print("All critical validations completed!")
        print("="*80 + "\n")

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
