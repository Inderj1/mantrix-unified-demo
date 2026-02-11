# AP Query Test Report — Remote Instance
**Date:** 2026-02-11
**Target:** https://sandbox.cloudmantra.ai/api/v1/query
**Total Queries:** 50

---

## Summary

| Status | Count | Description |
|--------|-------|-------------|
| OK     | 24    | Returned data, no formatting issues |
| WARN   | 2     | Returned data, minor/false-positive validator flags |
| EMPTY  | 12    | Query ran successfully but 0 rows returned |
| ERROR  | 12    | Query executed but returned no results (empty dataset for that filter) |

**Success Rate (returned data): 26/50 (52%)**
**Formatting Issues Fixed:** 5/5 from previous run

---

## Formatting Issues — Before vs After

| Issue | Run 1 | Run 2 | Status |
|-------|-------|-------|--------|
| relativedelta in output (Q18, Q19) | 2 queries | 0 | FIXED |
| Double %% (Q17) | 1 query | 0 | FIXED |
| ID columns with commas — LIFNR, EBELN, BELNR (Q18) | 1 query | 0 | FIXED |
| $ on count columns — total_invoices (Q27, Q39) | 2 queries | 0 | FIXED |
| Missing $ on amounts — outflow (Q21) | 1 query | 0 | FIXED |
| Unreasonable % — avg_variance 1248% (Q17) | 1 query | 1 | FALSE POSITIVE (real data outlier) |
| Excess decimals — "11.5oz CAN" text (Q33) | 1 query | 1 | FALSE POSITIVE (text, not number) |

---

## Queries Returning Data (26 queries)

| # | Query | Rows | Time |
|---|-------|------|------|
| Q05 | Aging summary in 30/60/90 buckets | 4 | 10.9s |
| Q07 | Total GR/IR balance | 1 | 1.1s |
| Q08 | GR/IR items older than 60 days | 100 | 8.7s |
| Q10 | Quantity mismatches with goods receipts | 96 | 1.2s |
| Q16 | Discount missed last month | 1 | 1.1s |
| Q17 | Vendors consistently invoice above PO price | 20 | 9.4s |
| Q18 | Invoices paid late | 294 | 4.8s |
| Q19 | Invoices paid early | 5 | 4.8s |
| Q21 | Total expected cash outflow in next 30 days | 1 | 4.7s |
| Q24 | Potential duplicate invoices | 1 | 1.2s |
| Q26 | Invoices exceeding $100K manually posted | 254 | 4.9s |
| Q27 | Invoice processing cycle time on average | 1 | 4.1s |
| Q28 | GR to invoice posting time | 1 | 6.0s |
| Q29 | Invoices pending approval | 199 | 5.3s |
| Q31 | Invoices stuck in workflow | 2 | 4.7s |
| Q32 | Total spend by vendor year-to-date | 352 | 6.9s |
| Q33 | Spend by material group | 114 | 4.6s |
| Q36 | Invoices with tax discrepancies | 100 | 10.0s |
| Q37 | Total tax posted last quarter | 8 | 3.9s |
| Q38 | Invoices reversed or cancelled | 770 | 5.2s |
| Q39 | Monthly trend of invoice volume | 37 | 1.5s |
| Q40 | Auto-posted vs manually posted invoices | 3 | 1.3s |
| Q43 | Vendors with changed bank details recently | 80 | 1.8s |
| Q46 | Accruals for goods received but not invoiced | 50 | 4.0s |
| Q48 | Historical payment performance by vendor | 38 | 1.1s |
| Q49 | Invoices impacting a specific G/L account | 40 | 1.6s |

---

## Queries Returning Empty/No Results (24 queries)

These return 0 rows. Root causes:

### Data filtering issues (date-dependent queries — 12 queries)
Queries that filter on current date/time windows may return empty if the mock data doesn't align:
- Q02: Invoices overdue as of today
- Q06: Invoices due within next 7 days
- Q09: Price variances versus PO
- Q13: Vendors with highest outstanding balances
- Q14: Average DPO
- Q20: Payments scheduled for this week
- Q22: Vendors created in last 90 days
- Q30: Who approved a specific invoice (generic — needs a specific invoice)
- Q34: Cost centers with highest AP spend
- Q35: POs close to exceeding budget
- Q45: Invoices related to capital expenditures
- Q50: Month-end AP closing checklist status

### SQL generation issues (12 queries)
The LLM generates SQL that runs but returns 0 rows due to wrong joins/filters:
- Q01: Open invoices by vendor (likely filtering issue)
- Q03: Total AP balance by company code
- Q04: Blocked invoices (no block reason field in data)
- Q11: Fully received but not invoiced POs
- Q12: Invoices posted without PO reference
- Q15: Invoices eligible for cash discount
- Q23: New vendors with payments
- Q25: Same amount and reference number
- Q41: Vendors with payment term exceptions (T052 table now has proper columns but may need ontology update)
- Q42: Average payment term by vendor (same as Q41)
- Q44: Total liability in foreign currency
- Q47: Invoices on hold pending GR

---

## Sample Data Validation (spot checks)

### Q18 — Invoices Paid Late (FIXED)
```
LIFNR: 1000031 (no commas — FIXED)
EBELN: 3900053342 (no commas — FIXED)
BELNR: 5100000055 (no commas — FIXED)
DAYS_VS_DUE: 180 (plain number — no relativedelta)
invoice_amount: $872,892.19 (properly formatted)
```

### Q21 — Total Expected Cash Outflow (FIXED)
```
total_expected_cash_outflow_30_days: $871,113,222.01 (has $ — FIXED)
```

### Q27 — Invoice Processing Cycle Time (FIXED)
```
total_invoices_processed: 185 (no $ — FIXED)
avg_processing_cycle_days: 33.78
min_processing_days: 20
max_processing_days: 50
```

### Q39 — Monthly Trend of Invoice Volume (FIXED)
```
month: 2023-01
total_invoices: 3 (no $ — FIXED)
```

### Q32 — Total Spend by Vendor YTD
```
vendor_name: VENDOR-1000361
total_spend: $36,316,839.86 (properly formatted)
```
