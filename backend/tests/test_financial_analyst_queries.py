"""
Financial Analyst Query Test Suite

This test suite validates SQL generation from a financial analyst's perspective.
Tests cover common analytical queries and validate:
- Correct columns are returned
- Values are properly formatted
- Data makes logical sense
- No missing or incorrect calculations
"""

import requests
import json
import re
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
import pandas as pd


@dataclass
class ColumnExpectation:
    """Expected column definition with validation rules"""
    name: str
    required: bool = True
    data_type: Optional[str] = None  # 'currency', 'percentage', 'number', 'text'
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    pattern: Optional[str] = None  # Regex pattern for formatting


@dataclass
class QueryTest:
    """Test case for a financial analyst query"""
    category: str
    query: str
    description: str
    expected_columns: List[ColumnExpectation]
    min_rows: int = 1
    max_rows: Optional[int] = None
    logical_validations: List[str] = field(default_factory=list)  # e.g., "revenue >= margin"


class FinancialAnalystTestSuite:
    """Test suite for financial analyst queries"""

    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.results: List[Dict[str, Any]] = []
        self.test_cases = self._define_test_cases()

    def _define_test_cases(self) -> List[QueryTest]:
        """Define comprehensive test cases from financial analyst perspective"""

        tests = []

        # ============================================================================
        # CATEGORY 1: PERFORMANCE OVERVIEW
        # ============================================================================
        tests.append(QueryTest(
            category="Performance Overview",
            query="what is total revenue and gross margin for each distributor",
            description="Key performance metrics by distributor",
            expected_columns=[
                ColumnExpectation("distributor", data_type="text"),
                ColumnExpectation("total_revenue", data_type="currency"),
                ColumnExpectation("gross_margin", data_type="currency"),
                ColumnExpectation("gross_margin_pct", data_type="percentage", min_value=0, max_value=100)
            ],
            min_rows=50,
            logical_validations=[
                "total_revenue >= gross_margin",
                "gross_margin >= 0"
            ]
        ))

        tests.append(QueryTest(
            category="Performance Overview",
            query="show total revenue, total cost, and gross margin for all sales",
            description="Overall company performance",
            expected_columns=[
                ColumnExpectation("total_revenue", data_type="currency"),
                ColumnExpectation("total_cost", data_type="currency"),
                ColumnExpectation("gross_margin", data_type="currency")
            ],
            min_rows=1,
            max_rows=1,
            logical_validations=[
                "total_revenue = total_cost + gross_margin"
            ]
        ))

        # ============================================================================
        # CATEGORY 2: TOP/BOTTOM PERFORMERS
        # ============================================================================
        tests.append(QueryTest(
            category="Rankings",
            query="show me top 10 distributors by revenue",
            description="Top revenue generators",
            expected_columns=[
                ColumnExpectation("distributor", data_type="text"),
                ColumnExpectation("total_revenue", data_type="currency")
            ],
            min_rows=10,
            max_rows=10
        ))

        tests.append(QueryTest(
            category="Rankings",
            query="show me top 5 surgeons by total sales",
            description="Top performing surgeons",
            expected_columns=[
                ColumnExpectation("surgeon", data_type="text"),
                ColumnExpectation("total_sales", data_type="currency")
            ],
            min_rows=5,
            max_rows=5
        ))

        tests.append(QueryTest(
            category="Rankings",
            query="which distributors have the highest gross margin percentage",
            description="Most profitable distributors by margin %",
            expected_columns=[
                ColumnExpectation("distributor", data_type="text"),
                ColumnExpectation("gross_margin_pct", data_type="percentage", min_value=0, max_value=100)
            ],
            min_rows=5
        ))

        # ============================================================================
        # CATEGORY 3: DETAILED ANALYSIS
        # ============================================================================
        tests.append(QueryTest(
            category="Detailed Analysis",
            query="show revenue, cost, and margin for Albert Turgon",
            description="Drill-down into specific distributor",
            expected_columns=[
                ColumnExpectation("distributor", data_type="text"),
                ColumnExpectation("total_revenue", data_type="currency"),
                ColumnExpectation("total_cost", data_type="currency"),
                ColumnExpectation("gross_margin", data_type="currency")
            ],
            min_rows=1,
            max_rows=1,
            logical_validations=[
                "total_revenue >= gross_margin"
            ]
        ))

        tests.append(QueryTest(
            category="Detailed Analysis",
            query="what are the sales and margins for each surgeon",
            description="Surgeon-level performance",
            expected_columns=[
                ColumnExpectation("surgeon", data_type="text"),
                ColumnExpectation("total_sales", data_type="currency"),
                ColumnExpectation("gross_margin", data_type="currency")
            ],
            min_rows=100
        ))

        # ============================================================================
        # CATEGORY 4: COMPARISONS & SEGMENTATION
        # ============================================================================
        tests.append(QueryTest(
            category="Comparisons",
            query="compare revenue between distributors Albert Turgon and House",
            description="Side-by-side distributor comparison",
            expected_columns=[
                ColumnExpectation("distributor", data_type="text"),
                ColumnExpectation("total_revenue", data_type="currency")
            ],
            min_rows=2,
            max_rows=2
        ))

        tests.append(QueryTest(
            category="Comparisons",
            query="show average revenue per distributor",
            description="Average metrics analysis",
            expected_columns=[
                ColumnExpectation("avg_revenue", data_type="currency")
            ],
            min_rows=1,
            max_rows=1
        ))

        # ============================================================================
        # CATEGORY 5: COUNTS & VOLUMES
        # ============================================================================
        tests.append(QueryTest(
            category="Volume Analysis",
            query="how many distributors are there",
            description="Distributor count",
            expected_columns=[
                ColumnExpectation("count", data_type="number")
            ],
            min_rows=1,
            max_rows=1
        ))

        tests.append(QueryTest(
            category="Volume Analysis",
            query="show number of transactions per distributor",
            description="Transaction volume by distributor",
            expected_columns=[
                ColumnExpectation("distributor", data_type="text"),
                ColumnExpectation("transaction_count", data_type="number")
            ],
            min_rows=50
        ))

        # ============================================================================
        # CATEGORY 6: MARGIN ANALYSIS
        # ============================================================================
        tests.append(QueryTest(
            category="Margin Analysis",
            query="show distributors with gross margin percentage above 90%",
            description="High-margin distributors",
            expected_columns=[
                ColumnExpectation("distributor", data_type="text"),
                ColumnExpectation("gross_margin_pct", data_type="percentage", min_value=90, max_value=100)
            ],
            min_rows=1
        ))

        tests.append(QueryTest(
            category="Margin Analysis",
            query="what is the average gross margin percentage across all distributors",
            description="Overall margin performance",
            expected_columns=[
                ColumnExpectation("avg_margin_pct", data_type="percentage", min_value=0, max_value=100)
            ],
            min_rows=1,
            max_rows=1
        ))

        # ============================================================================
        # CATEGORY 7: COST ANALYSIS
        # ============================================================================
        tests.append(QueryTest(
            category="Cost Analysis",
            query="show total standard cost by distributor",
            description="Cost breakdown by distributor",
            expected_columns=[
                ColumnExpectation("distributor", data_type="text"),
                ColumnExpectation("total_standard_cost", data_type="currency")
            ],
            min_rows=50
        ))

        tests.append(QueryTest(
            category="Cost Analysis",
            query="which distributors have the highest costs",
            description="Top cost drivers",
            expected_columns=[
                ColumnExpectation("distributor", data_type="text"),
                ColumnExpectation("total_cost", data_type="currency")
            ],
            min_rows=5
        ))

        # ============================================================================
        # CATEGORY 8: MULTI-METRIC ANALYSIS
        # ============================================================================
        tests.append(QueryTest(
            category="Multi-Metric",
            query="show total sales, gross margin, total standard cost for Christy Schaffer",
            description="Complete financial picture for one distributor",
            expected_columns=[
                ColumnExpectation("distributor", data_type="text"),
                ColumnExpectation("total_sales", data_type="currency"),
                ColumnExpectation("gross_margin", data_type="currency"),
                ColumnExpectation("total_standard_cost", data_type="currency")
            ],
            min_rows=1,
            max_rows=1
        ))

        tests.append(QueryTest(
            category="Multi-Metric",
            query="show revenue, cost, margin, and margin percentage for all distributors",
            description="Full metrics dashboard",
            expected_columns=[
                ColumnExpectation("distributor", data_type="text"),
                ColumnExpectation("total_revenue", data_type="currency"),
                ColumnExpectation("total_cost", data_type="currency"),
                ColumnExpectation("gross_margin", data_type="currency"),
                ColumnExpectation("gross_margin_pct", data_type="percentage", min_value=0, max_value=100)
            ],
            min_rows=50,
            logical_validations=[
                "total_revenue >= gross_margin",
                "total_revenue >= total_cost"
            ]
        ))

        return tests

    def execute_query(self, query: str) -> Dict[str, Any]:
        """Execute query against the API"""
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/query",
                json={"question": query, "conversationId": None},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}

    def parse_currency(self, value: str) -> float:
        """Parse currency string to float"""
        if not isinstance(value, str):
            return float(value)
        # Remove $, commas, and % signs
        cleaned = re.sub(r'[$,]', '', value)
        return float(cleaned)

    def parse_percentage(self, value: str) -> float:
        """Parse percentage string to float"""
        if not isinstance(value, str):
            return float(value)
        # Remove % sign
        cleaned = re.sub(r'%', '', value)
        return float(cleaned)

    def validate_column_format(self, value: Any, data_type: str) -> tuple[bool, str]:
        """Validate column formatting"""
        if value is None:
            return False, "Value is NULL"

        if not isinstance(value, str):
            return True, "OK"  # Already numeric

        if data_type == "currency":
            # Should be formatted as $1,234.56
            if not re.match(r'^\$[\d,]+\.\d{2}$', value):
                return False, f"Invalid currency format: {value}"
        elif data_type == "percentage":
            # Should be formatted as 12.34%
            if not re.match(r'^[\d,]+\.\d{1,2}%$', value):
                return False, f"Invalid percentage format: {value}"
        elif data_type == "number":
            # Should be integer or formatted with commas
            if not re.match(r'^[\d,]+$', value):
                return False, f"Invalid number format: {value}"

        return True, "OK"

    def validate_value_range(self, value: Any, data_type: str, min_val: Optional[float], max_val: Optional[float]) -> tuple[bool, str]:
        """Validate value is within expected range"""
        try:
            if data_type == "currency":
                num_val = self.parse_currency(value)
            elif data_type == "percentage":
                num_val = self.parse_percentage(value)
            else:
                num_val = float(value)

            if min_val is not None and num_val < min_val:
                return False, f"Value {num_val} below minimum {min_val}"
            if max_val is not None and num_val > max_val:
                return False, f"Value {num_val} above maximum {max_val}"

            return True, "OK"
        except Exception as e:
            return False, f"Failed to validate range: {e}"

    def validate_logical_consistency(self, row: Dict[str, Any], validation: str) -> tuple[bool, str]:
        """Validate logical relationships between columns"""
        try:
            # Parse the validation expression (e.g., "revenue >= margin")
            # Support operators: =, >=, <=, >, <, +, -

            # Replace column names with values
            expr = validation
            for col_name, col_value in row.items():
                # Parse value based on type
                if isinstance(col_value, str):
                    if '$' in col_value:
                        num_val = self.parse_currency(col_value)
                    elif '%' in col_value:
                        num_val = self.parse_percentage(col_value)
                    else:
                        num_val = col_value
                else:
                    num_val = col_value

                # Replace in expression (case-insensitive)
                expr = re.sub(rf'\b{re.escape(col_name)}\b', str(num_val), expr, flags=re.IGNORECASE)

            # Evaluate the expression
            result = eval(expr)
            if not result:
                return False, f"Logical validation failed: {validation} (evaluated: {expr})"

            return True, "OK"
        except Exception as e:
            return False, f"Failed to validate logic: {e}"

    def run_test(self, test: QueryTest) -> Dict[str, Any]:
        """Run a single test case"""
        print(f"\n{'='*80}")
        print(f"Testing: {test.description}")
        print(f"Query: {test.query}")
        print(f"{'='*80}")

        result = {
            "category": test.category,
            "query": test.query,
            "description": test.description,
            "timestamp": datetime.now().isoformat(),
            "passed": True,
            "errors": [],
            "warnings": [],
            "sql_generated": None,
            "row_count": 0,
            "sample_data": []
        }

        # Execute query
        response = self.execute_query(test.query)

        if "error" in response:
            result["passed"] = False
            result["errors"].append(f"Query execution failed: {response['error']}")
            return result

        result["sql_generated"] = response.get("sql", "")
        results_data = response.get("results", [])
        result["row_count"] = len(results_data)

        # Validate row count
        if result["row_count"] < test.min_rows:
            result["passed"] = False
            result["errors"].append(f"Expected at least {test.min_rows} rows, got {result['row_count']}")

        if test.max_rows and result["row_count"] > test.max_rows:
            result["passed"] = False
            result["errors"].append(f"Expected at most {test.max_rows} rows, got {result['row_count']}")

        if result["row_count"] == 0:
            return result

        # Get actual columns
        actual_columns = set(results_data[0].keys())

        # Validate expected columns are present
        for expected_col in test.expected_columns:
            # Try case-insensitive match
            matched_col = None
            for actual_col in actual_columns:
                if actual_col.lower() == expected_col.name.lower():
                    matched_col = actual_col
                    break

            if not matched_col:
                if expected_col.required:
                    result["passed"] = False
                    result["errors"].append(f"Missing required column: {expected_col.name}")
                else:
                    result["warnings"].append(f"Missing optional column: {expected_col.name}")
                continue

            # Validate formatting and values for first 3 rows
            sample_size = min(3, len(results_data))
            for i in range(sample_size):
                row = results_data[i]
                value = row.get(matched_col)

                # Validate format
                if expected_col.data_type:
                    format_ok, format_msg = self.validate_column_format(value, expected_col.data_type)
                    if not format_ok:
                        result["warnings"].append(f"Row {i}: {matched_col} - {format_msg}")

                # Validate range
                if expected_col.min_value is not None or expected_col.max_value is not None:
                    range_ok, range_msg = self.validate_value_range(
                        value, expected_col.data_type or "number",
                        expected_col.min_value, expected_col.max_value
                    )
                    if not range_ok:
                        result["passed"] = False
                        result["errors"].append(f"Row {i}: {matched_col} - {range_msg}")

        # Validate logical consistency for first 3 rows
        sample_size = min(3, len(results_data))
        for i in range(sample_size):
            row = results_data[i]
            for validation in test.logical_validations:
                logic_ok, logic_msg = self.validate_logical_consistency(row, validation)
                if not logic_ok:
                    result["passed"] = False
                    result["errors"].append(f"Row {i}: {logic_msg}")

        # Store sample data
        result["sample_data"] = results_data[:3]

        # Print status
        status = "✅ PASS" if result["passed"] else "❌ FAIL"
        print(f"\nStatus: {status}")
        print(f"Rows returned: {result['row_count']}")
        if result["errors"]:
            print(f"Errors: {len(result['errors'])}")
            for error in result["errors"][:3]:
                print(f"  - {error}")
        if result["warnings"]:
            print(f"Warnings: {len(result['warnings'])}")

        return result

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all test cases"""
        print(f"\n{'#'*80}")
        print(f"# Financial Analyst Query Test Suite")
        print(f"# Total Tests: {len(self.test_cases)}")
        print(f"# Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'#'*80}")

        for test in self.test_cases:
            result = self.run_test(test)
            self.results.append(result)

        return self.generate_report()

    def generate_report(self) -> Dict[str, Any]:
        """Generate summary report"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r["passed"])
        failed = total - passed

        # Group by category
        by_category = {}
        for result in self.results:
            cat = result["category"]
            if cat not in by_category:
                by_category[cat] = {"total": 0, "passed": 0, "failed": 0}
            by_category[cat]["total"] += 1
            if result["passed"]:
                by_category[cat]["passed"] += 1
            else:
                by_category[cat]["failed"] += 1

        report = {
            "summary": {
                "total_tests": total,
                "passed": passed,
                "failed": failed,
                "pass_rate": f"{(passed/total*100):.1f}%",
                "timestamp": datetime.now().isoformat()
            },
            "by_category": by_category,
            "failed_tests": [r for r in self.results if not r["passed"]],
            "all_results": self.results
        }

        # Print summary
        print(f"\n{'#'*80}")
        print(f"# TEST SUMMARY")
        print(f"{'#'*80}")
        print(f"Total Tests: {total}")
        print(f"Passed: {passed} ({passed/total*100:.1f}%)")
        print(f"Failed: {failed} ({failed/total*100:.1f}%)")
        print(f"\n{'='*80}")
        print("By Category:")
        print(f"{'='*80}")
        for cat, stats in by_category.items():
            status = "✅" if stats["failed"] == 0 else "❌"
            print(f"{status} {cat}: {stats['passed']}/{stats['total']} passed")

        if report["failed_tests"]:
            print(f"\n{'='*80}")
            print("Failed Tests:")
            print(f"{'='*80}")
            for failed in report["failed_tests"]:
                print(f"\n❌ {failed['description']}")
                print(f"   Query: {failed['query']}")
                print(f"   Errors:")
                for error in failed["errors"]:
                    print(f"     - {error}")

        return report

    def save_results(self, filename: str = "financial_test_results.json"):
        """Save test results to file"""
        report = self.generate_report()
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"\n✅ Results saved to: {filename}")
        return filename


if __name__ == "__main__":
    # Run the test suite
    suite = FinancialAnalystTestSuite()
    report = suite.run_all_tests()
    suite.save_results("/tmp/financial_test_results.json")
