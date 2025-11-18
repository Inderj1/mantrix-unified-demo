"""Quick test runner - runs a subset of critical financial analyst queries"""

import sys
sys.path.insert(0, '/Users/inder/projects/mantrix-unified-nexxt-v1/backend')

from tests.test_financial_analyst_queries import FinancialAnalystTestSuite, QueryTest, ColumnExpectation

# Create suite with just 5 critical tests
suite = FinancialAnalystTestSuite()

# Override with just critical tests
suite.test_cases = [
    QueryTest(
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
            "total_revenue >= gross_margin"
        ]
    ),
    QueryTest(
        category="Rankings",
        query="show me top 10 distributors by revenue",
        description="Top revenue generators",
        expected_columns=[
            ColumnExpectation("distributor", data_type="text"),
            ColumnExpectation("total_revenue", data_type="currency")
        ],
        min_rows=10,
        max_rows=10
    ),
    QueryTest(
        category="Detailed Analysis",
        query="show total sales, gross margin, total standard cost for Christy Schaffer",
        description="Complete metrics for specific distributor",
        expected_columns=[
            ColumnExpectation("distributor", data_type="text"),
            ColumnExpectation("total_sales", data_type="currency"),
            ColumnExpectation("gross_margin", data_type="currency"),
            ColumnExpectation("total_standard_cost", data_type="currency")
        ],
        min_rows=1,
        max_rows=1
    ),
    QueryTest(
        category="Margin Analysis",
        query="what is the average gross margin percentage across all distributors",
        description="Overall margin performance",
        expected_columns=[
            ColumnExpectation("avg_margin_pct", data_type="percentage", min_value=0, max_value=100)
        ],
        min_rows=1,
        max_rows=1
    ),
    QueryTest(
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
            "total_revenue >= gross_margin"
        ]
    )
]

# Run tests
report = suite.run_all_tests()
suite.save_results("/tmp/financial_test_results_quick.json")
