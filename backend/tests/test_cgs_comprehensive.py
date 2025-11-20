#!/usr/bin/env python3
"""
Comprehensive CGS Analysis Testing Script
Tests 300+ business questions against the AXIS.AI system
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Tuple

# Test configuration
API_URL = "http://localhost:8000/api/v1/query"
TIMEOUT = 30
DELAY_BETWEEN_QUERIES = 1  # seconds

# Test questions organized by category
TEST_QUESTIONS = {
    "1. Profitability Analysis": [
        "What is the overall gross margin percentage?",
        "What is the total gross margin in dollars?",
        "Which month had the highest gross margin?",
        "What is the average gross margin per invoice?",
        "How many transactions have negative margins?",
    ],
    "2. Distributor Performance": [
        "Who is the most profitable distributor?",
        "Who has the highest total sales?",
        "Who has the highest gross margin percentage?",
        "Which distributor has the most invoices?",
        "Which distributor has the highest average invoice value?",
    ],
    "3. Surgeon Analysis": [
        "Who is the most profitable surgeon?",
        "Who generates the highest total sales?",
        "Which surgeon has the most invoices?",
        "Which surgeons have negative margins?",
        "Which surgeons operate at the most facilities?",
    ],
    "4. Facility Analysis": [
        "Which facility generates the most gross margin?",
        "Which facility has the highest total sales?",
        "How many unique facilities are there?",
        "Which facilities serve the most surgeons?",
        "Which facility has the highest average invoice value?",
    ],
    "5. Product/Item Analysis": [
        "Which product generates the most profit?",
        "Which product has the highest sales volume?",
        "How many unique products are there?",
        "What is the most expensive product?",
        "Which product is sold most frequently?",
    ],
    "6. Regional Analysis": [
        "Which region is most profitable?",
        "Which region has the highest total sales?",
        "Which region has the most facilities?",
        "What is the average invoice value per region?",
        "Which region shows the most growth?",
    ],
    "7. Trend Analysis": [
        "What is the month-over-month sales trend?",
        "Which month had the highest sales?",
        "Which month had the lowest sales?",
        "Are margins improving or declining over time?",
        "What is the trend in number of invoices per month?",
    ],
    "8. Pricing & Margin Analysis": [
        "What is the average price per item?",
        "What is the price range across all products?",
        "Which distributor has the highest average prices?",
        "What is the average standard cost per item?",
        "What is the cost-to-revenue ratio?",
    ],
    "9. Operational Efficiency": [
        "How many total invoices are there?",
        "What is the average number of line items per invoice?",
        "What is the largest invoice by value?",
        "What is the total quantity of all items sold?",
        "What is the most common transaction size?",
    ],
    "10. Strategic Questions": [
        "Which distributors have expansion potential?",
        "Which regions are underserved?",
        "Which product categories should be expanded?",
        "Which distributors are at risk?",
        "Which distributors dominate which regions?",
    ],
}


class TestResult:
    def __init__(self, category: str, question: str):
        self.category = category
        self.question = question
        self.success = False
        self.response_time = 0.0
        self.status_code = None
        self.error_message = None
        self.has_data = False
        self.row_count = 0
        self.explanation_type = None  # "technical" or "simplified"

    def to_dict(self) -> Dict:
        return {
            "category": self.category,
            "question": self.question,
            "success": self.success,
            "response_time_sec": round(self.response_time, 2),
            "status_code": self.status_code,
            "error_message": self.error_message,
            "has_data": self.has_data,
            "row_count": self.row_count,
            "explanation_type": self.explanation_type,
        }


def run_query(question: str) -> Tuple[bool, Dict]:
    """Execute a single query against the API"""
    try:
        start_time = time.time()
        response = requests.post(
            API_URL,
            json={"question": question, "conversationId": None},
            timeout=TIMEOUT
        )
        response_time = time.time() - start_time

        if response.status_code == 200:
            data = response.json()
            return True, {
                "response_time": response_time,
                "status_code": 200,
                "data": data
            }
        else:
            return False, {
                "response_time": response_time,
                "status_code": response.status_code,
                "error": response.text
            }

    except requests.exceptions.Timeout:
        return False, {"error": "Timeout", "status_code": 408}
    except Exception as e:
        return False, {"error": str(e), "status_code": 500}


def analyze_response(response_data: Dict) -> Tuple[bool, int, str]:
    """Analyze response to check if it has data and what type of explanation"""
    has_data = False
    row_count = 0
    explanation_type = "unknown"

    if "results" in response_data and response_data["results"]:
        has_data = True
        row_count = len(response_data["results"])

    if "explanation" in response_data:
        explanation = response_data["explanation"].lower()
        # Check for technical terms
        technical_terms = ["cte", "with clause", "lower()", "group by", "order by"]
        is_technical = any(term in explanation for term in technical_terms)
        explanation_type = "technical" if is_technical else "simplified"

    return has_data, row_count, explanation_type


def run_test_suite() -> List[TestResult]:
    """Run all test questions and collect results"""
    results = []
    total_questions = sum(len(questions) for questions in TEST_QUESTIONS.values())
    current = 0

    print(f"\n{'='*80}")
    print(f"AXIS.AI Comprehensive Testing Suite")
    print(f"{'='*80}")
    print(f"Total questions to test: {total_questions}")
    print(f"{'='*80}\n")

    for category, questions in TEST_QUESTIONS.items():
        print(f"\n{category}")
        print(f"{'-'*80}")

        for question in questions:
            current += 1
            result = TestResult(category, question)

            print(f"[{current}/{total_questions}] Testing: {question[:60]}...")

            success, response = run_query(question)
            result.success = success
            result.response_time = response.get("response_time", 0)
            result.status_code = response.get("status_code")

            if success:
                has_data, row_count, exp_type = analyze_response(response["data"])
                result.has_data = has_data
                result.row_count = row_count
                result.explanation_type = exp_type
                print(f"  ✅ Success ({row_count} rows, {exp_type} explanation, {result.response_time:.2f}s)")
            else:
                result.error_message = response.get("error", "Unknown error")
                print(f"  ❌ Failed: {result.error_message}")

            results.append(result)
            time.sleep(DELAY_BETWEEN_QUERIES)

    return results


def generate_report(results: List[TestResult]) -> Dict:
    """Generate summary report from test results"""
    total = len(results)
    successful = sum(1 for r in results if r.success)
    with_data = sum(1 for r in results if r.has_data)
    technical = sum(1 for r in results if r.explanation_type == "technical")
    simplified = sum(1 for r in results if r.explanation_type == "simplified")

    avg_response_time = sum(r.response_time for r in results if r.success) / max(successful, 1)

    # Category breakdown
    category_stats = {}
    for result in results:
        if result.category not in category_stats:
            category_stats[result.category] = {"total": 0, "success": 0, "with_data": 0}
        category_stats[result.category]["total"] += 1
        if result.success:
            category_stats[result.category]["success"] += 1
        if result.has_data:
            category_stats[result.category]["with_data"] += 1

    report = {
        "summary": {
            "total_questions": total,
            "successful": successful,
            "failed": total - successful,
            "success_rate": f"{(successful/total*100):.1f}%",
            "with_data": with_data,
            "data_rate": f"{(with_data/total*100):.1f}%",
            "technical_explanations": technical,
            "simplified_explanations": simplified,
            "avg_response_time_sec": round(avg_response_time, 2),
        },
        "by_category": category_stats,
        "failed_questions": [
            {"category": r.category, "question": r.question, "error": r.error_message}
            for r in results if not r.success
        ],
        "all_results": [r.to_dict() for r in results]
    }

    return report


def print_summary(report: Dict):
    """Print summary report to console"""
    print(f"\n\n{'='*80}")
    print(f"TEST SUMMARY")
    print(f"{'='*80}\n")

    summary = report["summary"]
    print(f"Total Questions:     {summary['total_questions']}")
    print(f"Successful:          {summary['successful']} ({summary['success_rate']})")
    print(f"Failed:              {summary['failed']}")
    print(f"With Data:           {summary['with_data']} ({summary['data_rate']})")
    print(f"Avg Response Time:   {summary['avg_response_time_sec']}s")
    print(f"\nExplanation Types:")
    print(f"  Technical:         {summary['technical_explanations']}")
    print(f"  Simplified:        {summary['simplified_explanations']}")

    print(f"\n{'='*80}")
    print(f"CATEGORY BREAKDOWN")
    print(f"{'='*80}\n")

    for category, stats in report["by_category"].items():
        success_rate = (stats["success"] / stats["total"] * 100) if stats["total"] > 0 else 0
        print(f"{category}")
        print(f"  Total: {stats['total']}, Success: {stats['success']} ({success_rate:.0f}%), With Data: {stats['with_data']}")

    if report["failed_questions"]:
        print(f"\n{'='*80}")
        print(f"FAILED QUESTIONS ({len(report['failed_questions'])})")
        print(f"{'='*80}\n")
        for failed in report["failed_questions"]:
            print(f"{failed['category']}")
            print(f"  Q: {failed['question']}")
            print(f"  Error: {failed['error']}\n")


def main():
    """Main execution"""
    print(f"\nStarting comprehensive test suite at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Run tests
    results = run_test_suite()

    # Generate report
    report = generate_report(results)

    # Print summary
    print_summary(report)

    # Save detailed results
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = f"/tmp/cgs_test_results_{timestamp}.json"
    with open(output_file, 'w') as f:
        json.dump(report, f, indent=2)

    print(f"\n{'='*80}")
    print(f"Detailed results saved to: {output_file}")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    main()
