"""
Test Suite: Validate Queries for ALL Columns in csg_data Table

This ensures every column can be queried and returns proper results.
"""

import requests
import json
from datetime import datetime
import re

BASE_URL = "http://localhost:8000"

# Define all columns in csg_data
ALL_COLUMNS = {
    # Identifiers
    "id": {"type": "numeric", "test_query": "show me the id for all transactions"},

    # Entities
    "surgeon": {"type": "text", "test_query": "show me all surgeons"},
    "distributor": {"type": "text", "test_query": "show me all distributors"},
    "facility": {"type": "text", "test_query": "show me all facilities"},

    # Categorical
    "region": {"type": "text", "test_query": "show me all regions"},
    "type": {"type": "text", "test_query": "show me all types"},
    "system": {"type": "text", "test_query": "show me all systems"},

    # Product Details
    "item_code": {"type": "text", "test_query": "show me all item codes"},
    "item_name": {"type": "text", "test_query": "show me all item names"},
    "inv_num": {"type": "text", "test_query": "show me all invoice numbers"},

    # Dates
    "surgery_date": {"type": "date", "test_query": "show me all surgery dates"},
    "created_at": {"type": "timestamp", "test_query": "show me when records were created"},

    # Quantities
    "quantity": {"type": "numeric", "test_query": "show me quantity for all items"},

    # Monetary - Unit Level
    "price_each": {"type": "currency", "test_query": "show me price for each item"},
    "std_cost": {"type": "currency", "test_query": "show me standard cost for each item"},

    # Monetary - Total Level
    "total_sales": {"type": "currency", "test_query": "show me total sales"},
    "total_std_cost": {"type": "currency", "test_query": "show me total standard cost"},
    "total_gm": {"type": "currency", "test_query": "show me total gross margin"}
}

def execute_query(query):
    """Execute a query and return results"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/query",
            json={"question": query, "conversationId": None},
            timeout=30
        )
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"error": str(e)}

def test_column(column_name, column_info):
    """Test if a specific column can be queried"""
    print(f"\n{'='*80}")
    print(f"Testing Column: {column_name}")
    print(f"Type: {column_info['type']}")
    print(f"Query: {column_info['test_query']}")
    print(f"{'='*80}")

    result = {
        "column": column_name,
        "type": column_info["type"],
        "query": column_info["test_query"],
        "passed": False,
        "issues": [],
        "returned_columns": [],
        "row_count": 0,
        "sample_value": None
    }

    # Execute query
    response = execute_query(column_info["test_query"])

    if response.get("error"):
        result["issues"].append(f"Query failed: {response['error']}")
        print(f"❌ FAIL: {response['error']}")
        return result

    results_data = response.get("results", [])
    result["row_count"] = len(results_data)

    if not results_data:
        result["issues"].append("No results returned")
        print(f"❌ FAIL: No results")
        return result

    # Get returned columns
    result["returned_columns"] = list(results_data[0].keys())

    # Check if column appears in results (case-insensitive, with variations)
    column_found = False
    matched_col = None

    # Look for exact match or common variations
    variations = [
        column_name,
        column_name.replace("_", ""),
        f"total_{column_name}",
        f"{column_name}_total",
        f"all_{column_name}",
        column_name.split("_")[-1]  # Last part of name (e.g., "date" from "surgery_date")
    ]

    for returned_col in result["returned_columns"]:
        returned_col_clean = returned_col.lower().replace("_", "")
        for variation in variations:
            if variation.lower().replace("_", "") in returned_col_clean or returned_col_clean in variation.lower().replace("_", ""):
                column_found = True
                matched_col = returned_col
                break
        if column_found:
            break

    if not column_found:
        result["issues"].append(f"Column '{column_name}' not found in results. Got: {result['returned_columns']}")
        print(f"⚠️  Column not in results")
        print(f"   Expected: {column_name}")
        print(f"   Got: {result['returned_columns']}")
    else:
        result["sample_value"] = results_data[0][matched_col]
        print(f"✓ Column found as: {matched_col}")
        print(f"✓ Rows: {result['row_count']}")
        print(f"✓ Sample value: {result['sample_value']}")

        # Validate data type
        sample = result["sample_value"]

        if column_info["type"] == "currency" and sample:
            if isinstance(sample, str) and not re.match(r'^\$[\d,]+\.?\d*$', sample):
                result["issues"].append(f"Currency format issue: {sample}")

        if column_info["type"] == "numeric" and sample:
            try:
                if isinstance(sample, str):
                    float(sample.replace(",", ""))
            except:
                result["issues"].append(f"Not numeric: {sample}")

        if column_info["type"] in ["date", "timestamp"] and sample:
            if not isinstance(sample, str) or not any(c.isdigit() for c in str(sample)):
                result["issues"].append(f"Date format issue: {sample}")

    # Final status
    if len(result["issues"]) == 0:
        result["passed"] = True
        print(f"✅ PASS")
    else:
        print(f"⚠️  Issues: {', '.join(result['issues'])}")

    return result

def test_aggregation_queries():
    """Test common aggregation patterns"""
    print(f"\n{'#'*80}")
    print(f"# AGGREGATION TESTS")
    print(f"{'#'*80}")

    agg_tests = [
        {
            "name": "Total Revenue by Region",
            "query": "show total revenue by region",
            "expected_cols": ["region", "total_revenue"]
        },
        {
            "name": "Total Sales by Facility",
            "query": "show total sales by facility",
            "expected_cols": ["facility", "total_sales"]
        },
        {
            "name": "Total Quantity by System",
            "query": "show total quantity by system",
            "expected_cols": ["system", "total_quantity"]
        },
        {
            "name": "Average Price by Item",
            "query": "show average price for each item name",
            "expected_cols": ["item_name", "avg_price"]
        },
        {
            "name": "Sales by Surgery Date",
            "query": "show total sales by surgery date",
            "expected_cols": ["surgery_date", "total_sales"]
        },
        {
            "name": "Count by Type",
            "query": "how many transactions by type",
            "expected_cols": ["type", "count"]
        }
    ]

    results = []
    for test in agg_tests:
        print(f"\n{'='*80}")
        print(f"Aggregation: {test['name']}")
        print(f"Query: {test['query']}")
        print(f"{'='*80}")

        response = execute_query(test["query"])

        if response.get("error"):
            print(f"❌ FAIL: {response['error']}")
            results.append({"test": test["name"], "passed": False})
            continue

        results_data = response.get("results", [])
        if not results_data:
            print(f"❌ FAIL: No results")
            results.append({"test": test["name"], "passed": False})
            continue

        cols = list(results_data[0].keys())
        print(f"✓ Columns: {', '.join(cols)}")
        print(f"✓ Rows: {len(results_data)}")
        print(f"✓ Sample: {results_data[0]}")
        print(f"✅ PASS")

        results.append({"test": test["name"], "passed": True})

    return results

def main():
    """Run all column tests"""
    print(f"\n{'#'*80}")
    print(f"# COMPREHENSIVE COLUMN TEST SUITE")
    print(f"# Testing ALL {len(ALL_COLUMNS)} columns in csg_data")
    print(f"# {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'#'*80}")

    results = []

    # Test each column
    for column_name, column_info in ALL_COLUMNS.items():
        result = test_column(column_name, column_info)
        results.append(result)

    # Test aggregations
    agg_results = test_aggregation_queries()

    # Summary
    print(f"\n{'#'*80}")
    print(f"# SUMMARY")
    print(f"{'#'*80}")

    passed = sum(1 for r in results if r["passed"])
    total = len(results)

    print(f"\nColumn Tests: {passed}/{total} passed ({passed/total*100:.0f}%)")

    # Group by type
    by_type = {}
    for r in results:
        col_type = r["type"]
        if col_type not in by_type:
            by_type[col_type] = {"passed": 0, "total": 0}
        by_type[col_type]["total"] += 1
        if r["passed"]:
            by_type[col_type]["passed"] += 1

    print(f"\nBy Column Type:")
    for col_type, stats in by_type.items():
        status = "✅" if stats["passed"] == stats["total"] else "⚠️"
        print(f"  {status} {col_type}: {stats['passed']}/{stats['total']}")

    # Failed tests
    failed = [r for r in results if not r["passed"]]
    if failed:
        print(f"\n⚠️  Failed Columns:")
        for r in failed:
            print(f"  - {r['column']}: {', '.join(r['issues'])}")

    # Aggregation summary
    agg_passed = sum(1 for r in agg_results if r["passed"])
    agg_total = len(agg_results)
    print(f"\nAggregation Tests: {agg_passed}/{agg_total} passed ({agg_passed/agg_total*100:.0f}%)")

    # Save results
    report = {
        "timestamp": datetime.now().isoformat(),
        "column_tests": {
            "total": total,
            "passed": passed,
            "failed": total - passed,
            "by_type": by_type
        },
        "aggregation_tests": {
            "total": agg_total,
            "passed": agg_passed,
            "failed": agg_total - agg_passed
        },
        "detailed_results": results,
        "aggregation_results": agg_results
    }

    with open('/tmp/all_columns_test_report.json', 'w') as f:
        json.dump(report, f, indent=2)

    print(f"\n✅ Detailed report saved to: /tmp/all_columns_test_report.json")

    # Overall status
    overall_pass = (passed == total) and (agg_passed == agg_total)
    if overall_pass:
        print(f"\n🎉 ALL TESTS PASSED!")
    else:
        print(f"\n⚠️  Some tests failed - review details above")

if __name__ == "__main__":
    main()
