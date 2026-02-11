#!/usr/bin/env python3
"""Test all 50 AP queries against remote instance and validate results."""
import requests
import json
import sys
import time
import re
from datetime import datetime

# Remote instance
API_URL = "https://sandbox.cloudmantra.ai/api/v1/query"

QUERIES = [
    "What invoices are currently open by vendor?",
    "Which invoices are overdue as of today?",
    "What is the total AP balance by company code?",
    "Which invoices are blocked for payment and why?",
    "What is the aging summary in 30/60/90 buckets?",
    "Which invoices are due within the next 7 days?",
    "What is our total GR/IR balance?",
    "Which GR/IR items are older than 60 days?",
    "Which invoices have price variances versus the PO?",
    "Which invoices have quantity mismatches with goods receipts?",
    "Which POs have been fully received but not invoiced?",
    "Which invoices were posted without a PO reference?",
    "Which vendors have the highest outstanding balances?",
    "What is the average days payable outstanding (DPO)?",
    "Which invoices are eligible for cash discount?",
    "How much discount did we miss last month?",
    "Which vendors consistently invoice above PO price?",
    "Which invoices were paid late?",
    "Which invoices were paid early?",
    "What payments are scheduled for this week?",
    "What is the total expected cash outflow in the next 30 days?",
    "Which vendors were created in the last 90 days?",
    "Which new vendors have already received payments?",
    "Are there any potential duplicate invoices?",
    "Which invoices have the same amount and reference number?",
    "Which invoices exceed $100,000 and were manually posted?",
    "What is the invoice processing cycle time on average?",
    "How long does it take from GR to invoice posting?",
    "Which invoices are pending approval?",
    "Who approved a specific invoice?",
    "Which invoices are stuck in workflow?",
    "What is the total spend by vendor year-to-date?",
    "What is the spend by material group?",
    "Which cost centers have the highest AP spend?",
    "Which POs are close to exceeding their budget?",
    "Which invoices have tax discrepancies?",
    "What is the total tax posted last quarter?",
    "Which invoices were reversed or cancelled?",
    "What is the monthly trend of invoice volume?",
    "How many invoices were auto-posted versus manually posted?",
    "Which vendors have payment term exceptions?",
    "What is the average payment term by vendor?",
    "Which vendors have changed bank details recently?",
    "What is the total liability in foreign currency?",
    "Which invoices are related to capital expenditures?",
    "What accruals are required for goods received but not invoiced?",
    "Which invoices are on hold pending GR?",
    "What is the historical payment performance by vendor?",
    "Which invoices impact a specific G/L account?",
    "What is the month-end AP closing checklist status?",
]

# --- Formatting validation helpers ---

# SAP ID column patterns (should never have commas or $ formatting)
ID_COL_PATTERN = re.compile(
    r'(lifnr|belnr|ebeln|ebelp|bukrs|gjahr|matnr|werks|ekorg|banfn|mblnr|vbeln|kostl|prctr|saknr|hkont|augbl|vendor_id|vendor_number|supplier_id|invoice_number|po_number|document_number|company_code)',
    re.IGNORECASE
)

# Count/quantity columns (should NOT have $ prefix)
COUNT_COL_PATTERN = re.compile(
    r'(count|qty|quantity|units|items|num_|_count|total_invoices|total_vendors|total_pos|invoice_count|vendor_count|order_count|po_count|number_of|volume)',
    re.IGNORECASE
)

# Amount/currency columns (SHOULD have $ prefix)
AMOUNT_COL_PATTERN = re.compile(
    r'(amount|balance|total_ap|total_spend|revenue|cost|price|payment|value|liability|accrual|outflow|spend|discount|variance_amount|tax_amount|invoice_amount)',
    re.IGNORECASE
)

# Percentage columns
PCT_COL_PATTERN = re.compile(
    r'(percent|pct|ratio|rate|margin|share|proportion|dpo)',
    re.IGNORECASE
)

def validate_value(col, val, q_num):
    """Validate a single cell value for formatting issues."""
    issues = []
    if val is None or val == '':
        return issues

    str_val = str(val)
    col_lower = col.lower()

    # 1. Check for relativedelta in output
    if 'relativedelta' in str_val:
        issues.append(f"RELATIVEDELTA: {col}={str_val}")

    # 2. Check for double %%
    if '%%' in str_val:
        issues.append(f"DOUBLE_PERCENT: {col}={str_val}")

    # 3. ID columns should NOT have commas in numeric values
    if ID_COL_PATTERN.search(col_lower):
        if ',' in str_val and str_val.replace(',', '').replace('.', '').replace('-', '').isdigit():
            issues.append(f"ID_WITH_COMMAS: {col}={str_val}")
        if str_val.startswith('$'):
            issues.append(f"ID_WITH_DOLLAR: {col}={str_val}")

    # 4. Count columns should NOT have $ prefix
    if COUNT_COL_PATTERN.search(col_lower) and not AMOUNT_COL_PATTERN.search(col_lower):
        if str_val.startswith('$'):
            issues.append(f"COUNT_WITH_DOLLAR: {col}={str_val}")

    # 5. Amount columns SHOULD have $ or be formatted
    if AMOUNT_COL_PATTERN.search(col_lower) and not COUNT_COL_PATTERN.search(col_lower) and not PCT_COL_PATTERN.search(col_lower):
        try:
            # If it's a raw number > 1, it probably should have $ formatting
            num = float(str_val.replace(',', ''))
            if abs(num) >= 1 and not str_val.startswith('$') and not str_val.startswith('-$'):
                issues.append(f"AMOUNT_MISSING_DOLLAR: {col}={str_val}")
        except (ValueError, TypeError):
            pass

    # 6. Check for excessive decimals (more than 2)
    if '.' in str_val:
        try:
            parts = str_val.replace('$', '').replace('%', '').replace(',', '').split('.')
            if len(parts) == 2 and len(parts[1]) > 2 and parts[1].rstrip('0') != parts[1][:2]:
                # Has trailing zeros beyond 2 decimals, or genuinely too many
                if len(parts[1]) > 2:
                    issues.append(f"EXCESS_DECIMALS: {col}={str_val}")
        except:
            pass

    # 7. Check for unreasonable percentages (> 1000%)
    if PCT_COL_PATTERN.search(col_lower) or str_val.endswith('%'):
        try:
            pct_val = float(str_val.replace('%', '').replace(',', ''))
            if abs(pct_val) > 1000:
                issues.append(f"UNREASONABLE_PCT: {col}={str_val}")
        except (ValueError, TypeError):
            pass

    # 8. Check for hallucinated column names in the value (shouldn't happen, but check)
    hallucinated_cols = ['Pallet_Revenue_Net', 'Promotional_Allowances', 'Freight_Allowance']
    for hc in hallucinated_cols:
        if hc.lower() in str_val.lower():
            issues.append(f"HALLUCINATED_REF: {col}={str_val}")

    return issues


def validate_sql(sql):
    """Validate SQL for known issues."""
    issues = []
    if not sql:
        return issues

    sql_upper = sql.upper()

    # Check for hallucinated columns
    for bad_col in ["PALLET_REVENUE_NET", "PROMOTIONAL_ALLOWANCES", "FREIGHT_ALLOWANCE", "NET_REVENUE", "REVENUE_ADJUSTMENTS"]:
        if bad_col in sql_upper:
            issues.append(f"HALLUCINATED_SQL_COL: {bad_col}")

    # Check for FORMAT with %% (BigQuery pattern that causes double %)
    if "FORMAT('%'" in sql or 'FORMAT("' in sql:
        if '%%' in sql:
            issues.append("SQL_DOUBLE_PERCENT: FORMAT with %%")

    # Check for string_field_0 (generic column names from bad BQ load)
    if 'STRING_FIELD_' in sql_upper:
        issues.append("GENERIC_COLUMNS: SQL uses string_field_N")

    # Check for non-existent tables
    if 'TRANSACTIONS' in sql_upper and 'TRANSACTIONS' not in ['REGUH', 'REGUP']:
        # Check if it's a made-up table
        pass

    return issues


# ==================== MAIN TEST LOOP ====================

results = []
all_issues = []

print(f"AP Query Test Suite - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Target: {API_URL}")
print(f"Queries: {len(QUERIES)}")
print(f"{'='*80}\n")

for i, query in enumerate(QUERIES, 1):
    print(f"Q{i:02d}: {query}...", end=" ", flush=True)

    try:
        start = time.time()
        resp = requests.post(API_URL, json={"question": query}, timeout=120)
        elapsed = time.time() - start
        data = resp.json()

        sql = data.get("sql", "")
        execution = data.get("execution", {}) or {}
        rows = execution.get("data", []) or data.get("results", []) or []
        error = data.get("error", "") or execution.get("message", "") if not rows else ""
        row_count = len(rows) if isinstance(rows, list) else 0
        columns = list(rows[0].keys()) if rows and isinstance(rows, list) and len(rows) > 0 else []

        # Validate SQL
        sql_issues = validate_sql(sql)

        # Validate data formatting
        data_issues = []
        if rows and isinstance(rows, list):
            for row in rows[:5]:  # Check first 5 rows
                for col, val in row.items():
                    cell_issues = validate_value(col, val, i)
                    data_issues.extend(cell_issues)

        # De-duplicate issues (same type)
        seen = set()
        unique_issues = []
        for issue in sql_issues + data_issues:
            issue_type = issue.split(':')[0]
            if issue_type not in seen:
                seen.add(issue_type)
                unique_issues.append(issue)

        status = "OK" if row_count > 0 and not error and not unique_issues else \
                 "WARN" if row_count > 0 and unique_issues else \
                 "EMPTY" if row_count == 0 and not error else \
                 "ERROR"

        print(f"[{status}] {row_count} rows, {elapsed:.1f}s" +
              (f" | {len(unique_issues)} issues" if unique_issues else ""))

        result_entry = {
            "q_num": i,
            "query": query,
            "status": status,
            "sql": sql,
            "row_count": row_count,
            "columns": columns,
            "sample": rows[:3] if isinstance(rows, list) else [],
            "error": error,
            "issues": unique_issues,
            "elapsed_s": round(elapsed, 1),
        }
        results.append(result_entry)

        if unique_issues:
            all_issues.append({"q_num": i, "query": query, "issues": unique_issues})

    except Exception as e:
        print(f"[EXCEPTION] {e}")
        results.append({
            "q_num": i,
            "query": query,
            "status": "EXCEPTION",
            "sql": "",
            "row_count": 0,
            "columns": [],
            "sample": [],
            "error": str(e),
            "issues": [f"EXCEPTION: {e}"],
            "elapsed_s": 0,
        })
        all_issues.append({"q_num": i, "query": query, "issues": [f"EXCEPTION: {e}"]})

    time.sleep(1)

# ==================== SUMMARY ====================

output_file = "/tmp/ap_query_test_results_remote.json"
with open(output_file, "w") as f:
    json.dump(results, f, indent=2, default=str)

ok_count = sum(1 for r in results if r['status'] == 'OK')
warn_count = sum(1 for r in results if r['status'] == 'WARN')
empty_count = sum(1 for r in results if r['status'] == 'EMPTY')
error_count = sum(1 for r in results if r['status'] in ('ERROR', 'EXCEPTION'))

print(f"\n{'='*80}")
print(f"SUMMARY - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"{'='*80}")
print(f"Total queries:  {len(results)}")
print(f"  OK:           {ok_count}")
print(f"  WARN:         {warn_count} (data returned but has formatting issues)")
print(f"  EMPTY:        {empty_count} (query ran but 0 rows)")
print(f"  ERROR:        {error_count}")
print()

# Issue type breakdown
issue_types = {}
for entry in all_issues:
    for issue in entry['issues']:
        itype = issue.split(':')[0]
        issue_types[itype] = issue_types.get(itype, 0) + 1

if issue_types:
    print("ISSUE TYPE BREAKDOWN:")
    for itype, count in sorted(issue_types.items(), key=lambda x: -x[1]):
        print(f"  {itype}: {count}")
    print()

# Detailed issues per query
if all_issues:
    print("QUERIES WITH ISSUES:")
    for entry in all_issues:
        print(f"  Q{entry['q_num']:02d}: {entry['query']}")
        for issue in entry['issues']:
            print(f"       -> {issue}")
    print()

# Queries with errors
error_queries = [r for r in results if r['status'] in ('ERROR', 'EXCEPTION')]
if error_queries:
    print("QUERIES WITH ERRORS:")
    for r in error_queries:
        print(f"  Q{r['q_num']:02d}: {r['query']}")
        print(f"       -> {r['error'][:200]}")
    print()

# Empty queries
empty_queries = [r for r in results if r['status'] == 'EMPTY']
if empty_queries:
    print("QUERIES WITH EMPTY RESULTS:")
    for r in empty_queries:
        print(f"  Q{r['q_num']:02d}: {r['query']}")
    print()

print(f"Full results saved to: {output_file}")
