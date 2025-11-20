#!/usr/bin/env python3
"""
Extended CGS Testing - 50+ representative questions from the 300+ question bank
"""

import requests
import json
import time
from datetime import datetime

API_URL = "http://localhost:8000/api/v1/query"
TIMEOUT = 20

# Extended test covering all major question types
QUESTIONS = [
    # Profitability Analysis (10 questions)
    "What is the overall gross margin percentage?",
    "What is the total gross margin in dollars?",
    "Which month had the highest gross margin?",
    "Which month had the lowest gross margin?",
    "What is the average gross margin per invoice?",
    "How many transactions have negative margins?",
    "What is the total value of negative margin transactions?",
    "What percentage of transactions have margins above 90%?",
    "What is the median gross margin percentage?",
    "What percentage of revenue comes from the top 10% of transactions?",

    # Distributor Performance (10 questions)
    "show me the top 5 most profitable distributors",
    "Who has the highest total sales?",
    "show me top 10 distributors by gross margin percentage",
    "Which distributor has the most invoices?",
    "Which distributor has the highest average invoice value?",
    "What percentage of total profit comes from the top 5 distributors?",
    "Which distributors are underperforming (below average GM%)?",
    "Which distributor has the most facilities?",
    "Which distributor has the most surgeons?",
    "What is the average number of surgeons per distributor?",

    # Surgeon Analysis (8 questions)
    "show me the top 5 most profitable surgeons",
    "Who generates the highest total sales among surgeons?",
    "Which surgeon has the most invoices?",
    "Which surgeons have negative margins?",
    "Which surgeons operate at the most facilities?",
    "Which surgeons are exclusive to one facility?",
    "What is the average revenue per surgeon?",
    "Which surgeon has the highest average items per invoice?",

    # Facility Analysis (6 questions)
    "show me the top 5 facilities by gross margin",
    "Which facility has the highest total sales?",
    "How many unique facilities are there?",
    "Which facilities serve the most surgeons?",
    "Which facility has the highest average invoice value?",
    "Which facilities work with the most distributors?",

    # Product/Item Analysis (8 questions)
    "Which product generates the most profit?",
    "Which product has the highest sales volume?",
    "How many unique products are there?",
    "What is the most expensive product?",
    "Which product is sold most frequently?",
    "What percentage of revenue comes from the top 20% of products?",
    "Which products have negative margins?",
    "show me top 10 products by profit",

    # Regional Analysis (5 questions)
    "Which region is most profitable?",
    "Which region has the highest total sales?",
    "Which region has the most facilities?",
    "What is the average invoice value per region?",
    "What is each region's market share of total sales?",

    # Trend Analysis (5 questions)
    "Which month had the highest sales?",
    "Which month had the lowest sales?",
    "What is the month-over-month sales trend?",
    "Are margins improving or declining over time?",
    "What is the trend in number of invoices per month?",

    # Pricing & Cost (4 questions)
    "What is the average price per item?",
    "What is the average standard cost per item?",
    "What is the cost-to-revenue ratio?",
    "What is the price range across all products?",

    # Operational Efficiency (4 questions)
    "How many total invoices are there?",
    "What is the average number of line items per invoice?",
    "What is the largest invoice by value?",
    "What is the total quantity of all items sold?",

    # Mix of complex questions (5 questions)
    "show me quantity, sales and GM for top 3 distributors by region",
    "Which surgeon-distributor pairs are most profitable?",
    "show me monthly sales and margin trends for top 5 distributors",
    "Which products are used by the most surgeons?",
    "show me facility count and revenue by region and distributor",
]

def test_question(question: str, index: int, total: int):
    """Test a single question"""
    print(f"\n[{index}/{total}] {question}")

    try:
        start = time.time()
        response = requests.post(
            API_URL,
            json={"question": question, "conversationId": None},
            timeout=TIMEOUT
        )
        elapsed = time.time() - start

        if response.status_code == 200:
            data = response.json()

            # Check for errors in response
            if data.get("error") or data.get("validation", {}).get("valid") == False:
                error_msg = data.get("error") or data.get("validation", {}).get("error", "Unknown validation error")
                print(f"  ❌ Query error: {error_msg[:80]}")
                return {
                    "question": question,
                    "success": False,
                    "error": error_msg,
                    "time": elapsed
                }

            results = data.get("results", [])
            explanation = data.get("explanation", "")

            # Check explanation type
            technical_terms = ["CTE", "LOWER()", "GROUP BY", "ORDER BY", "WITH clause"]
            is_technical = any(term in explanation for term in technical_terms)
            exp_type = "technical" if is_technical else "simplified"

            row_count = len(results) if results else 0
            print(f"  ✅ {row_count} rows | {exp_type} | {elapsed:.1f}s")

            # Show first row of data for verification
            if results and row_count > 0:
                first_row = results[0]
                cols = list(first_row.keys())[:3]  # First 3 columns
                preview = ", ".join([f"{k}: {first_row[k]}" for k in cols])
                print(f"     Preview: {preview[:80]}")

            return {
                "question": question,
                "success": True,
                "rows": row_count,
                "explanation_type": exp_type,
                "time": elapsed,
                "has_data": row_count > 0
            }
        else:
            print(f"  ❌ HTTP {response.status_code}")
            return {
                "question": question,
                "success": False,
                "error": f"HTTP {response.status_code}",
                "time": elapsed
            }

    except requests.exceptions.Timeout:
        print(f"  ⏱️  Timeout after {TIMEOUT}s")
        return {
            "question": question,
            "success": False,
            "error": "Timeout"
        }
    except Exception as e:
        print(f"  ❌ Error: {str(e)[:60]}")
        return {
            "question": question,
            "success": False,
            "error": str(e)[:100]
        }

def main():
    print(f"\n{'='*80}")
    print(f"AXIS.AI Extended Test Suite")
    print(f"{'='*80}")
    print(f"Total questions: {len(QUESTIONS)}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}")

    results = []
    for i, question in enumerate(QUESTIONS, 1):
        result = test_question(question, i, len(QUESTIONS))
        results.append(result)
        time.sleep(0.3)  # Brief delay between queries

    # Summary
    print(f"\n\n{'='*80}")
    print(f"SUMMARY")
    print(f"{'='*80}")

    total = len(results)
    successful = sum(1 for r in results if r.get("success"))
    with_data = sum(1 for r in results if r.get("has_data"))
    technical = sum(1 for r in results if r.get("explanation_type") == "technical")
    simplified = sum(1 for r in results if r.get("explanation_type") == "simplified")
    failed = [r for r in results if not r.get("success")]

    print(f"\nTotal Questions:        {total}")
    print(f"Successful:             {successful} ({successful/total*100:.1f}%)")
    print(f"Failed:                 {total-successful}")
    print(f"With Data:              {with_data} ({with_data/total*100:.1f}%)")
    print(f"\nExplanation Types:")
    print(f"  Simplified:           {simplified} ({simplified/max(successful,1)*100:.1f}%)")
    print(f"  Technical:            {technical}")

    if failed:
        print(f"\n{'='*80}")
        print(f"FAILED QUERIES ({len(failed)})")
        print(f"{'='*80}")
        for r in failed:
            print(f"\n  Q: {r['question']}")
            print(f"     Error: {r.get('error', 'Unknown')}")

    # Save results
    output_file = f"/tmp/cgs_extended_test_{datetime.now().strftime('%H%M%S')}.json"
    with open(output_file, 'w') as f:
        json.dump({
            "summary": {
                "total": total,
                "successful": successful,
                "failed": total - successful,
                "with_data": with_data,
                "technical": technical,
                "simplified": simplified
            },
            "results": results
        }, f, indent=2)

    print(f"\n{'='*80}")
    print(f"Results saved: {output_file}")
    print(f"{'='*80}\n")

if __name__ == "__main__":
    main()
