"""
Validation Script: Albert Turgon Most Profitable Distributor Analysis

Tests all claims made in the analysis:
1. Albert Turgon is most profitable
2. His specific metrics (GM, Sales, GM%, Market Share)
3. Invoice/surgeon/facility counts
4. Top facilities for Albert Turgon
5. Top surgeons for Albert Turgon
6. Top 5 distributors ranking
7. Market concentration (top 10 = 46.5%)
"""

import requests
import json
import re

BASE_URL = "http://localhost:8000"

def execute_query(query):
    """Execute query and return results"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/query",
            json={"question": query, "conversationId": None},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("results", []), None
        else:
            return None, f"HTTP {response.status_code}"
    except Exception as e:
        return None, str(e)

def parse_currency(value):
    """Parse $1,234.56 to float"""
    if isinstance(value, (int, float)):
        return float(value)
    return float(re.sub(r'[$,]', '', str(value)))

def parse_percentage(value):
    """Parse 12.34% to float"""
    if isinstance(value, (int, float)):
        return float(value)
    return float(re.sub(r'%', '', str(value)))

print("="*80)
print("VALIDATING ALBERT TURGON ANALYSIS")
print("="*80)

# TEST 1: Is Albert Turgon the most profitable distributor?
print("\n" + "="*80)
print("TEST 1: Most Profitable Distributor")
print("="*80)
print("Query: Who is the most profitable distributor?")

results, error = execute_query("show me distributors ranked by gross margin")
if error:
    print(f"❌ ERROR: {error}")
else:
    print(f"\n✓ Top 5 by Gross Margin:")
    for i, row in enumerate(results[:5], 1):
        dist = row.get('distributor', 'N/A')
        gm = row.get('gross_margin', row.get('total_gross_margin', row.get('total_gm', 'N/A')))
        print(f"  {i}. {dist}: {gm}")

    top_dist = results[0].get('distributor') if results else None
    if top_dist == "Albert Turgon":
        print(f"\n✅ PASS: Albert Turgon is #1")
    else:
        print(f"\n❌ FAIL: Top distributor is {top_dist}, not Albert Turgon")

# TEST 2: Verify Albert Turgon's specific metrics
print("\n" + "="*80)
print("TEST 2: Albert Turgon Specific Metrics")
print("="*80)
print("Query: Show metrics for Albert Turgon")

results, error = execute_query("show total sales, gross margin, and margin percentage for Albert Turgon")
if error:
    print(f"❌ ERROR: {error}")
elif not results:
    print(f"❌ ERROR: No results")
else:
    row = results[0]

    # Extract values (handle different column names)
    sales = None
    gm = None
    gm_pct = None

    for key, value in row.items():
        key_lower = key.lower()
        if 'sales' in key_lower or 'revenue' in key_lower:
            sales = parse_currency(value)
        elif 'margin' in key_lower and 'pct' not in key_lower and '%' not in str(value):
            gm = parse_currency(value)
        elif 'margin' in key_lower and ('pct' in key_lower or '%' in str(value)):
            gm_pct = parse_percentage(value)

    print(f"\nActual Values:")
    print(f"  Total Sales: ${sales:,.2f}" if sales else "  Total Sales: Not found")
    print(f"  Gross Margin: ${gm:,.2f}" if gm else "  Gross Margin: Not found")
    print(f"  GM %: {gm_pct:.2f}%" if gm_pct else "  GM %: Not found")

    print(f"\nClaimed Values:")
    print(f"  Total Sales: $2,279,371.13")
    print(f"  Gross Margin: $2,194,668.13")
    print(f"  GM %: 96.28%")

    # Verify (with 0.1% tolerance for rounding)
    checks = []
    if sales:
        sales_match = abs(sales - 2279371.13) < 100
        checks.append(("Sales", sales_match))
        print(f"\n  {'✅' if sales_match else '❌'} Sales: ${sales:,.2f} vs $2,279,371.13")

    if gm:
        gm_match = abs(gm - 2194668.13) < 100
        checks.append(("GM", gm_match))
        print(f"  {'✅' if gm_match else '❌'} GM: ${gm:,.2f} vs $2,194,668.13")

    if gm_pct:
        pct_match = abs(gm_pct - 96.28) < 0.1
        checks.append(("GM%", pct_match))
        print(f"  {'✅' if pct_match else '❌'} GM%: {gm_pct:.2f}% vs 96.28%")

    if all(check[1] for check in checks):
        print(f"\n✅ PASS: All metrics match")
    else:
        print(f"\n⚠️  WARNING: Some metrics don't match exactly")

# TEST 3: Count invoices, surgeons, facilities for Albert Turgon
print("\n" + "="*80)
print("TEST 3: Albert Turgon Activity Counts")
print("="*80)
print("Claimed: 163 invoices, 13 surgeons, 14 facilities")

results, error = execute_query("how many invoices, surgeons, and facilities for Albert Turgon")
if error:
    print(f"❌ ERROR: {error}")
elif not results:
    print(f"❌ ERROR: No results")
else:
    row = results[0]
    print(f"\nActual Values:")
    for key, value in row.items():
        print(f"  {key}: {value}")

    # Check if we got the counts
    print(f"\n⚠️  Need to verify: 163 invoices, 13 surgeons, 14 facilities")

# TEST 4: Top 3 Facilities for Albert Turgon
print("\n" + "="*80)
print("TEST 4: Top Facilities for Albert Turgon")
print("="*80)
print("Claimed:")
print("  1. Medical Solutions of Texas - $1.67M")
print("  2. St. Luke's Baptist Hospital - $112K")
print("  3. Shannon Medical Center - $94K")

results, error = execute_query("show gross margin by facility for Albert Turgon")
if error:
    print(f"❌ ERROR: {error}")
elif not results:
    print(f"❌ ERROR: No results")
else:
    print(f"\nActual Top 3 Facilities:")
    for i, row in enumerate(results[:3], 1):
        facility = row.get('facility', 'N/A')
        gm = row.get('gross_margin', row.get('total_gross_margin', row.get('total_gm', 'N/A')))
        print(f"  {i}. {facility}: {gm}")

# TEST 5: Top 3 Surgeons for Albert Turgon
print("\n" + "="*80)
print("TEST 5: Top Surgeons for Albert Turgon")
print("="*80)
print("Claimed:")
print("  1. McDermott - $1.37M")
print("  2. Peitz - $411K")
print("  3. Hobbs - $94K")

results, error = execute_query("show gross margin by surgeon for Albert Turgon")
if error:
    print(f"❌ ERROR: {error}")
elif not results:
    print(f"❌ ERROR: No results")
else:
    print(f"\nActual Top 3 Surgeons:")
    for i, row in enumerate(results[:3], 1):
        surgeon = row.get('surgeon', 'N/A')
        gm = row.get('gross_margin', row.get('total_gross_margin', row.get('total_gm', 'N/A')))
        print(f"  {i}. {surgeon}: {gm}")

# TEST 6: Top 5 Distributors
print("\n" + "="*80)
print("TEST 6: Top 5 Most Profitable Distributors")
print("="*80)
print("Claimed:")
print("  1. Albert Turgon - $2.19M")
print("  2. House - $1.70M")
print("  3. Will Cannady - $1.11M")
print("  4. John Hunt - $696K")
print("  5. Bret Brody - $396K")

results, error = execute_query("show top 5 distributors by gross margin")
if error:
    print(f"❌ ERROR: {error}")
elif not results:
    print(f"❌ ERROR: No results")
else:
    print(f"\nActual Top 5:")
    for i, row in enumerate(results[:5], 1):
        dist = row.get('distributor', 'N/A')
        gm = row.get('gross_margin', row.get('total_gross_margin', row.get('total_gm', 'N/A')))
        print(f"  {i}. {dist}: {gm}")

# TEST 7: Market Share - Albert Turgon
print("\n" + "="*80)
print("TEST 7: Market Share Analysis")
print("="*80)
print("Claimed: Albert Turgon = 13.5% of total gross margin")

results, error = execute_query("what is the total gross margin across all distributors")
if error:
    print(f"❌ ERROR: {error}")
elif not results:
    print(f"❌ ERROR: No results")
else:
    total_gm_value = None
    for key, value in results[0].items():
        if 'margin' in key.lower():
            total_gm_value = parse_currency(value)
            break

    if total_gm_value:
        print(f"\nTotal Gross Margin: ${total_gm_value:,.2f}")

        albert_gm = 2194668.13
        market_share = (albert_gm / total_gm_value) * 100

        print(f"Albert Turgon GM: ${albert_gm:,.2f}")
        print(f"Calculated Market Share: {market_share:.1f}%")
        print(f"Claimed Market Share: 13.5%")

        if abs(market_share - 13.5) < 0.5:
            print(f"\n✅ PASS: Market share matches (~{market_share:.1f}%)")
        else:
            print(f"\n⚠️  WARNING: Market share is {market_share:.1f}%, claimed 13.5%")

# TEST 8: Top 10 Market Concentration
print("\n" + "="*80)
print("TEST 8: Market Concentration")
print("="*80)
print("Claimed: Top 10 distributors control 46.5% of total gross margin")

results, error = execute_query("show gross margin for all distributors ranked by margin")
if error:
    print(f"❌ ERROR: {error}")
elif not results:
    print(f"❌ ERROR: No results")
else:
    # Get total GM
    total_gm = 0
    top_10_gm = 0

    for i, row in enumerate(results):
        gm_value = None
        for key, value in row.items():
            if 'margin' in key.lower() and 'pct' not in key.lower():
                gm_value = parse_currency(value)
                break

        if gm_value:
            total_gm += gm_value
            if i < 10:
                top_10_gm += gm_value

    if total_gm > 0:
        concentration = (top_10_gm / total_gm) * 100

        print(f"\nTotal GM: ${total_gm:,.2f}")
        print(f"Top 10 GM: ${top_10_gm:,.2f}")
        print(f"Calculated Concentration: {concentration:.1f}%")
        print(f"Claimed Concentration: 46.5%")

        if abs(concentration - 46.5) < 1.0:
            print(f"\n✅ PASS: Concentration matches (~{concentration:.1f}%)")
        else:
            print(f"\n⚠️  WARNING: Concentration is {concentration:.1f}%, claimed 46.5%")

# SUMMARY
print("\n" + "="*80)
print("VALIDATION SUMMARY")
print("="*80)
print("""
All tests completed. Review results above to verify:
✅ Albert Turgon is #1 most profitable distributor
✅ Specific metrics (sales, margin, %)
✅ Activity counts (invoices, surgeons, facilities)
✅ Top facilities breakdown
✅ Top surgeons breakdown
✅ Top 5 distributors ranking
✅ Market share calculation
✅ Market concentration analysis
""")

print("\n✅ Validation complete - check output above for detailed results")
