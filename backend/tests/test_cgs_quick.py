#!/usr/bin/env python3
"""
Quick CGS Analysis Testing Script
Tests representative samples from each category
"""

import requests
import json
import time
from datetime import datetime

API_URL = "http://localhost:8000/api/v1/query"
TIMEOUT = 20
DELAY = 0.5

# Quick test - 2 questions per category
TEST_QUESTIONS = {
    "Profitability": [
        "What is the overall gross margin percentage?",
        "What is the total gross margin in dollars?",
    ],
    "Distributor": [
        "Who is the most profitable distributor?",
        "Who has the highest total sales?",
    ],
    "Surgeon": [
        "Who is the most profitable surgeon?",
        "Which surgeon has the most invoices?",
    ],
    "Facility": [
        "Which facility generates the most gross margin?",
        "How many unique facilities are there?",
    ],
    "Product": [
        "Which product generates the most profit?",
        "How many unique products are there?",
    ],
    "Regional": [
        "Which region is most profitable?",
        "Which region has the most facilities?",
    ],
    "Trend": [
        "Which month had the highest sales?",
        "What is the month-over-month sales trend?",
    ],
    "Pricing": [
        "What is the average price per item?",
        "What is the cost-to-revenue ratio?",
    ],
    "Operational": [
        "How many total invoices are there?",
        "What is the average number of line items per invoice?",
    ],
}

results = []
total = sum(len(q) for q in TEST_QUESTIONS.values())
current = 0

print(f"\n{'='*80}")
print(f"AXIS.AI Quick Test Suite - {total} questions")
print(f"{'='*80}\n")

for category, questions in TEST_QUESTIONS.items():
    print(f"\n{category} Questions:")
    print(f"{'-'*80}")

    for question in questions:
        current += 1
        print(f"[{current}/{total}] {question}")

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
                row_count = len(data.get("results", []))
                explanation = data.get("explanation", "")

                # Check explanation type
                technical_terms = ["CTE", "LOWER()", "GROUP BY", "ORDER BY"]
                is_technical = any(term in explanation for term in technical_terms)
                exp_type = "technical" if is_technical else "simplified"

                print(f"  ✅ {row_count} rows | {exp_type} | {elapsed:.1f}s")
                results.append({
                    "category": category,
                    "question": question,
                    "success": True,
                    "rows": row_count,
                    "explanation_type": exp_type,
                    "time": elapsed
                })
            else:
                print(f"  ❌ HTTP {response.status_code}")
                results.append({
                    "category": category,
                    "question": question,
                    "success": False,
                    "error": f"HTTP {response.status_code}"
                })

        except requests.exceptions.Timeout:
            print(f"  ⏱️  Timeout after {TIMEOUT}s")
            results.append({
                "category": category,
                "question": question,
                "success": False,
                "error": "Timeout"
            })
        except Exception as e:
            print(f"  ❌ Error: {str(e)[:50]}")
            results.append({
                "category": category,
                "question": question,
                "success": False,
                "error": str(e)[:100]
            })

        time.sleep(DELAY)

# Summary
print(f"\n{'='*80}")
print(f"SUMMARY")
print(f"{'='*80}\n")

successful = sum(1 for r in results if r.get("success"))
technical = sum(1 for r in results if r.get("explanation_type") == "technical")
simplified = sum(1 for r in results if r.get("explanation_type") == "simplified")

print(f"Total:      {total}")
print(f"Success:    {successful} ({successful/total*100:.0f}%)")
print(f"Failed:     {total-successful}")
print(f"Technical:  {technical}")
print(f"Simplified: {simplified}")

# Save results
output = f"/tmp/cgs_quick_test_{datetime.now().strftime('%H%M%S')}.json"
with open(output, 'w') as f:
    json.dump(results, f, indent=2)

print(f"\nResults saved: {output}\n")
