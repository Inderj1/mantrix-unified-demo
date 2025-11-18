"""Quick sample test - 2 queries per role"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def execute_query(query):
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/query",
            json={"question": query, "conversationId": None},
            timeout=25
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("results", []), None
        else:
            return None, f"HTTP {response.status_code}"
    except Exception as e:
        return None, str(e)

def test(role, query):
    print(f"\n[{role}] {query}")
    results, error = execute_query(query)

    if error:
        print(f"  ❌ {error}")
        return False
    if not results:
        print(f"  ❌ No results")
        return False

    print(f"  ✅ {len(results)} rows | Columns: {', '.join(results[0].keys())}")
    return True

# Quick tests
tests = [
    ("CEO", "What's our total revenue?"),
    ("CEO", "Who are our top 5 distributors?"),

    ("CFO", "What is total revenue and gross margin?"),
    ("CFO", "Which distributors have margins above 90%?"),

    ("Controller", "Show all invoice numbers"),
    ("Controller", "Show price for each item"),

    ("CPA", "Show total sales and total cost"),
    ("CPA", "List all invoices"),

    ("Planning", "Which products generate the most revenue?"),
    ("Planning", "Show revenue by system type"),

    ("Operations", "How many surgeries were performed?"),
    ("Operations", "Show quantity by item"),

    # Synonyms
    ("Synonym", "What is total sales?"),  # sales vs revenue
    ("Synonym", "What is total expense?"),  # expense vs cost
    ("Synonym", "What is gross profit?"),  # profit vs margin
    ("Synonym", "List all dealers"),  # dealer vs distributor
    ("Synonym", "Show all doctors"),  # doctor vs surgeon
    ("Synonym", "Best 10 by sales"),  # best vs top
]

print(f"{'#'*80}")
print(f"# QUICK EXECUTIVE QUERY SAMPLE TEST")
print(f"# {len(tests)} queries across all roles")
print(f"{'#'*80}")

results = [test(role, query) for role, query in tests]

passed = sum(results)
total = len(results)

print(f"\n{'#'*80}")
print(f"# RESULTS: {passed}/{total} passed ({passed/total*100:.0f}%)")
print(f"{'#'*80}")

report = {"passed": passed, "total": total, "timestamp": datetime.now().isoformat()}
with open('/tmp/exec_sample_results.json', 'w') as f:
    json.dump(report, f, indent=2)

print(f"\nSaved to: /tmp/exec_sample_results.json")
