"""Simple test runner - validates key financial queries with immediate output"""

import requests
import json
import re
from datetime import datetime

def parse_currency(value):
    """Parse $1,234.56 to float"""
    if not isinstance(value, str):
        return float(value)
    return float(re.sub(r'[$,]', '', value))

def parse_percentage(value):
    """Parse 12.34% to float"""
    if not isinstance(value, str):
        return float(value)
    return float(re.sub(r'%', '', value))

def test_query(query, description, expected_cols, validations=None):
    """Test a single query"""
    print(f"\n{'='*80}")
    print(f"TEST: {description}")
    print(f"Query: {query}")
    print(f"{'='*80}")

    try:
        response = requests.post(
            'http://localhost:8000/api/v1/query',
            json={'question': query, 'conversationId': None},
            timeout=25
        )

        if response.status_code != 200:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False

        data = response.json()

        if data.get('error'):
            print(f"❌ FAIL: {data['error']}")
            return False

        results = data.get('results', [])
        print(f"✓ Rows returned: {len(results)}")

        if not results:
            print("❌ FAIL: No results returned")
            return False

        # Check columns
        actual_cols = list(results[0].keys())
        print(f"✓ Columns: {', '.join(actual_cols)}")

        missing = []
        for exp_col in expected_cols:
            if not any(col.lower() == exp_col.lower() for col in actual_cols):
                missing.append(exp_col)

        if missing:
            print(f"❌ FAIL: Missing columns: {', '.join(missing)}")
            return False

        # Show sample row
        print(f"\n📊 Sample Row:")
        for key, value in results[0].items():
            print(f"   {key}: {value}")

        # Run validations
        if validations:
            print(f"\n🔍 Running validations...")
            row = results[0]
            for validation in validations:
                try:
                    # Build expression
                    expr = validation
                    for col_name, col_value in row.items():
                        if isinstance(col_value, str):
                            if '$' in col_value:
                                num_val = parse_currency(col_value)
                            elif '%' in col_value:
                                num_val = parse_percentage(col_value)
                            else:
                                num_val = col_value
                        else:
                            num_val = col_value

                        expr = re.sub(rf'\b{re.escape(col_name)}\b', str(num_val), expr, flags=re.IGNORECASE)

                    result = eval(expr)
                    status = "✓" if result else "❌"
                    print(f"   {status} {validation}")
                    if not result:
                        print(f"      Failed: {expr}")
                        return False
                except Exception as e:
                    print(f"   ❌ {validation} - Error: {e}")
                    return False

        print(f"\n✅ PASS")
        return True

    except Exception as e:
        print(f"❌ FAIL: Exception - {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False

# Run tests
print(f"\n{'#'*80}")
print(f"# Financial Analyst Query Validation")
print(f"# {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"{'#'*80}")

results = []

# Test 1: Overall performance metrics
results.append(test_query(
    query="what is total revenue and gross margin for each distributor",
    description="Performance metrics by distributor",
    expected_cols=["distributor", "total_revenue", "gross_margin", "gross_margin_pct"],
    validations=["total_revenue >= gross_margin"]
))

# Test 2: Top performers
results.append(test_query(
    query="show me top 10 distributors by revenue",
    description="Top 10 revenue generators",
    expected_cols=["distributor", "total_revenue"]
))

# Test 3: Specific distributor drill-down
results.append(test_query(
    query="show total sales, gross margin, total standard cost for Christy Schaffer",
    description="Christy Schaffer complete metrics",
    expected_cols=["distributor", "total_sales", "gross_margin", "total_standard_cost"]
))

# Test 4: Average margin analysis
results.append(test_query(
    query="what is the average gross margin percentage across all distributors",
    description="Average gross margin %",
    expected_cols=["avg_margin_pct"]
))

# Test 5: Multi-metric dashboard
results.append(test_query(
    query="show revenue, cost, margin, and margin percentage for all distributors",
    description="Full metrics dashboard",
    expected_cols=["distributor", "total_revenue", "total_cost", "gross_margin", "gross_margin_pct"],
    validations=["total_revenue >= gross_margin"]
))

# Summary
print(f"\n{'#'*80}")
print(f"# TEST SUMMARY")
print(f"{'#'*80}")
passed = sum(results)
total = len(results)
print(f"Passed: {passed}/{total} ({passed/total*100:.0f}%)")
print(f"Failed: {total-passed}/{total}")

if passed == total:
    print(f"\n🎉 All tests passed!")
else:
    print(f"\n⚠️  Some tests failed - review output above")

# Save results
summary = {
    "timestamp": datetime.now().isoformat(),
    "total": total,
    "passed": passed,
    "failed": total - passed,
    "pass_rate": f"{passed/total*100:.1f}%"
}

with open('/tmp/financial_test_summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f"\n✅ Summary saved to: /tmp/financial_test_summary.json")
