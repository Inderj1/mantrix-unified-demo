"""
Comprehensive Executive & Business Queries Test Suite

Tests queries that different business roles would ask:
- CEO: Strategic overview, performance trends
- CFO: Financial metrics, profitability analysis
- Controller/Accounting: Detailed financial tracking
- CPA/CA: Compliance, reconciliation, audit trails
- Business Planning: Forecasting, trends, scenarios
- Operations: Efficiency, volumes, utilization

Also tests synonym variations (revenue/sales, cost/expense, etc.)
"""

import requests
import json
from datetime import datetime
import re

BASE_URL = "http://localhost:8000"

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

def test_query(category, role, query, description):
    """Test a single query"""
    print(f"\n{'='*80}")
    print(f"[{role}] {description}")
    print(f"Query: \"{query}\"")
    print(f"{'='*80}")

    response = execute_query(query)

    if response.get("error"):
        print(f"❌ FAIL: {response['error']}")
        return {"category": category, "role": role, "query": query, "passed": False, "error": response["error"]}

    results = response.get("results", [])
    if not results:
        print(f"❌ FAIL: No results returned")
        return {"category": category, "role": role, "query": query, "passed": False, "error": "No results"}

    print(f"✅ PASS - {len(results)} rows")
    print(f"   Columns: {', '.join(results[0].keys())}")
    print(f"   Sample: {results[0]}")

    return {
        "category": category,
        "role": role,
        "query": query,
        "description": description,
        "passed": True,
        "row_count": len(results),
        "columns": list(results[0].keys()),
        "sample": results[0]
    }

# ============================================================================
# TEST SUITES BY ROLE
# ============================================================================

CEO_QUERIES = [
    ("What's our total revenue?", "Top-line revenue overview"),
    ("What is our gross profit?", "Overall profitability"),
    ("What's our gross margin percentage?", "Margin health check"),
    ("Who are our top 5 distributors?", "Key partners"),
    ("Who are our top 10 distributors by revenue?", "Revenue concentration"),
    ("Which regions generate the most revenue?", "Geographic performance"),
    ("What is our revenue by region?", "Regional breakdown"),
    ("How many distributors do we have?", "Partner count"),
    ("How many surgeons are we working with?", "Provider network size"),
    ("What's the total value of all sales?", "Total business volume"),
    ("Show me our biggest accounts", "Top customers"),
    ("Which facilities generate the most business?", "Facility performance"),
    ("What is revenue by facility?", "Facility-level analysis"),
    ("Compare revenue across all regions", "Regional comparison"),
    ("Show me total sales by distributor", "Partner performance"),
]

CFO_QUERIES = [
    ("What is total revenue and gross margin?", "P&L summary"),
    ("Show me revenue, cost, and margin", "Core financials"),
    ("What's our gross margin by distributor?", "Partner profitability"),
    ("Calculate gross profit percentage", "Margin calculation"),
    ("Show revenue minus cost", "Gross profit"),
    ("What is our average margin percentage?", "Average profitability"),
    ("Which distributors have the highest margins?", "Most profitable partners"),
    ("Which distributors have margins above 90%?", "High-margin partners"),
    ("What's the margin percentage by region?", "Regional profitability"),
    ("Show total cost of goods sold", "COGS total"),
    ("What is our total standard cost?", "Cost basis"),
    ("Calculate profit margin for each distributor", "Distributor margins"),
    ("Show revenue and cost breakdown by facility", "Facility P&L"),
    ("What's the margin on each system?", "Product line profitability"),
    ("Compare costs across distributors", "Cost comparison"),
    ("Show me the cost structure by region", "Regional cost analysis"),
]

CONTROLLER_ACCOUNTING_QUERIES = [
    ("Show all transactions", "Transaction list"),
    ("Show me invoice numbers", "Invoice tracking"),
    ("What are all the invoice numbers?", "Invoice list"),
    ("Show transactions by invoice number", "Invoice detail"),
    ("List all item codes", "SKU catalog"),
    ("Show me all item names", "Product list"),
    ("What items were sold?", "Product sales"),
    ("Show price for each item", "Price list"),
    ("What is the unit price for each item?", "Unit pricing"),
    ("Show standard cost by item", "Item costing"),
    ("What's the cost of each item?", "Item costs"),
    ("Show quantity sold by item", "Volume by SKU"),
    ("How many units were sold?", "Total units"),
    ("Show sales by surgery date", "Daily sales"),
    ("What sales occurred on each date?", "Date-based sales"),
    ("Show transactions by creation date", "Booking date"),
    ("List all surgery dates", "Procedure dates"),
]

CPA_CA_COMPLIANCE_QUERIES = [
    ("Show total sales and total cost", "Revenue recognition"),
    ("Reconcile revenue to cost", "P&L reconciliation"),
    ("Show detailed transaction breakdown", "Audit trail"),
    ("List all invoices", "Invoice register"),
    ("Show revenue by invoice", "Invoice-level revenue"),
    ("What is revenue by item code?", "SKU-level revenue"),
    ("Show cost basis by item", "Inventory costing"),
    ("Calculate gross margin by transaction", "Transaction-level margin"),
    ("Show all transactions with dates", "Dated transactions"),
    ("List transactions by facility", "Facility-based tracking"),
    ("Show sales by type", "Category breakdown"),
    ("What is revenue by system?", "System-level revenue"),
]

BUSINESS_PLANNING_QUERIES = [
    ("What's our revenue trend?", "Trend analysis"),
    ("Show sales over time", "Time series"),
    ("Which products generate the most revenue?", "Product mix"),
    ("What's the revenue by item name?", "Product performance"),
    ("Show revenue by system type", "System analysis"),
    ("Which systems are most popular?", "System adoption"),
    ("What's the average transaction size?", "Deal size"),
    ("Show average price by distributor", "Distributor pricing"),
    ("What's the revenue concentration?", "Concentration risk"),
    ("How many transactions per distributor?", "Activity level"),
    ("Show transaction volume by region", "Regional activity"),
    ("What's the average quantity per transaction?", "Volume metrics"),
    ("Show revenue per surgeon", "Provider economics"),
    ("Which surgeons drive the most volume?", "High-volume providers"),
    ("What's the facility mix?", "Facility distribution"),
]

OPERATIONS_QUERIES = [
    ("How many surgeries were performed?", "Procedure volume"),
    ("Show quantity by item", "Inventory movement"),
    ("What's the total quantity sold?", "Volume total"),
    ("Show transactions by type", "Category volume"),
    ("How many items per transaction?", "Basket size"),
    ("Show volume by system", "System utilization"),
    ("Which facilities have the most activity?", "Facility activity"),
    ("How many transactions by facility?", "Facility volume"),
    ("Show surgeon activity levels", "Provider utilization"),
    ("How many surgeries per surgeon?", "Surgeon productivity"),
    ("What's the distribution by region?", "Regional distribution"),
    ("Show all regions", "Geographic coverage"),
    ("List all systems", "System inventory"),
    ("Show all types", "Category catalog"),
]

SYNONYM_TESTS = [
    # Revenue variations
    ("What is total revenue?", "revenue keyword"),
    ("What is total sales?", "sales keyword"),
    ("What are gross receipts?", "receipts synonym"),
    ("Show me income by distributor", "income synonym"),

    # Cost variations
    ("What is total cost?", "cost keyword"),
    ("What is total expense?", "expense synonym"),
    ("What are our expenditures?", "expenditure synonym"),
    ("Show me COGS", "COGS acronym"),
    ("What is cost of goods sold?", "COGS full name"),

    # Margin variations
    ("What is gross margin?", "margin keyword"),
    ("What is gross profit?", "profit keyword"),
    ("Show me earnings", "earnings synonym"),
    ("What's the profit margin?", "profit margin"),
    ("Calculate contribution margin", "contribution margin"),

    # Percentage variations
    ("What's the margin percentage?", "percentage"),
    ("What's the margin percent?", "percent"),
    ("What's the margin rate?", "rate"),
    ("Show margin as a percent", "as a percent"),

    # Entity variations
    ("Show me distributors", "distributor"),
    ("List all dealers", "dealer synonym"),
    ("Who are our partners?", "partner synonym"),
    ("Show resellers", "reseller synonym"),

    # Surgeon variations
    ("Show me surgeons", "surgeon"),
    ("List all doctors", "doctor synonym"),
    ("Who are the physicians?", "physician synonym"),
    ("Show all providers", "provider synonym"),

    # Ranking variations
    ("Top 10 by revenue", "top N"),
    ("Best 10 by sales", "best N"),
    ("Highest 10 by revenue", "highest N"),
    ("Show me the leading 10", "leading N"),

    # Comparison variations
    ("Compare distributors", "compare"),
    ("Show difference between regions", "difference"),
    ("Contrast margin by facility", "contrast"),

    # Aggregation variations
    ("Sum of revenue", "sum"),
    ("Total of sales", "total"),
    ("Aggregate revenue", "aggregate"),
    ("Combined sales", "combined"),
]

def run_test_suite():
    """Run all test suites"""
    print(f"\n{'#'*80}")
    print(f"# COMPREHENSIVE EXECUTIVE & BUSINESS QUERIES TEST SUITE")
    print(f"# {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'#'*80}")

    all_results = []

    # Test each role
    test_suites = [
        ("Executive Dashboard", "CEO", CEO_QUERIES),
        ("Financial Analysis", "CFO", CFO_QUERIES),
        ("Accounting & Tracking", "Controller", CONTROLLER_ACCOUNTING_QUERIES),
        ("Compliance & Audit", "CPA/CA", CPA_CA_COMPLIANCE_QUERIES),
        ("Strategic Planning", "Business Planning", BUSINESS_PLANNING_QUERIES),
        ("Operational Metrics", "Operations", OPERATIONS_QUERIES),
        ("Synonym Variations", "Analyst", SYNONYM_TESTS),
    ]

    for category, role, queries in test_suites:
        print(f"\n{'#'*80}")
        print(f"# {category.upper()} ({role})")
        print(f"# Testing {len(queries)} queries")
        print(f"{'#'*80}")

        for query, description in queries:
            result = test_query(category, role, query, description)
            all_results.append(result)

    # Generate summary
    print(f"\n{'#'*80}")
    print(f"# SUMMARY")
    print(f"{'#'*80}")

    total = len(all_results)
    passed = sum(1 for r in all_results if r.get("passed"))
    failed = total - passed

    print(f"\nOverall: {passed}/{total} passed ({passed/total*100:.1f}%)")

    # By category
    by_category = {}
    for r in all_results:
        cat = r["category"]
        if cat not in by_category:
            by_category[cat] = {"total": 0, "passed": 0}
        by_category[cat]["total"] += 1
        if r.get("passed"):
            by_category[cat]["passed"] += 1

    print(f"\nBy Category:")
    for cat, stats in by_category.items():
        status = "✅" if stats["passed"] == stats["total"] else "⚠️"
        print(f"  {status} {cat}: {stats['passed']}/{stats['total']} ({stats['passed']/stats['total']*100:.0f}%)")

    # Failed queries
    failed_queries = [r for r in all_results if not r.get("passed")]
    if failed_queries:
        print(f"\n⚠️  Failed Queries ({len(failed_queries)}):")
        for r in failed_queries[:10]:  # Show first 10
            print(f"  - [{r['role']}] {r['query']}")
            print(f"    Error: {r.get('error', 'Unknown')}")

    # Save detailed report
    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total": total,
            "passed": passed,
            "failed": failed,
            "pass_rate": f"{passed/total*100:.1f}%"
        },
        "by_category": by_category,
        "all_results": all_results,
        "failed_queries": failed_queries
    }

    with open('/tmp/executive_queries_report.json', 'w') as f:
        json.dump(report, f, indent=2)

    print(f"\n✅ Detailed report saved to: /tmp/executive_queries_report.json")

    # Generate insights
    print(f"\n{'#'*80}")
    print(f"# KEY INSIGHTS")
    print(f"{'#'*80}")

    # Most tested role
    by_role = {}
    for r in all_results:
        role = r["role"]
        if role not in by_role:
            by_role[role] = {"total": 0, "passed": 0}
        by_role[role]["total"] += 1
        if r.get("passed"):
            by_role[role]["passed"] += 1

    print(f"\nQueries by Role:")
    for role in sorted(by_role.keys()):
        stats = by_role[role]
        print(f"  {role}: {stats['total']} queries ({stats['passed']} passed)")

    if passed == total:
        print(f"\n🎉 ALL {total} QUERIES PASSED!")
        print(f"   ✅ System is ready for production use across all business roles")
    else:
        print(f"\n⚠️  {failed} queries need attention")

    return report

if __name__ == "__main__":
    run_test_suite()
