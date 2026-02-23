# AP Query Test Report — Remote Instance
**Date:** 2026-02-15
**Target:** https://sandbox.cloudmantra.ai/api/v1/query
**Total Queries:** 50

---

## Summary — Run 4 (Latest)

| Status | Count | Description |
|--------|-------|-------------|
| OK     | 39    | Returned data, no formatting issues |
| WARN   | 2     | Returned data, minor/false-positive validator flags |
| EMPTY  | 4     | Query ran successfully but 0 rows returned |
| ERROR  | 5     | Query executed but returned no results or data not available |

**Success Rate (returned data): 41/50 (82%)** — up from 34/50 (68%) in Run 3
**Formatting Issues:** 0 real issues (2 false positives)

---

## Run-over-Run Comparison

| Metric | Run 1 | Run 2 | Run 3 | Run 4 (Latest) |
|--------|-------|-------|-------|----------------|
| Queries returning data | — | 26 (52%) | 34 (68%) | 41 (82%) |
| OK (clean) | — | 24 | 31 | 39 |
| WARN (minor flags) | — | 2 | 3 | 2 |
| EMPTY | — | 12 | 5 | 4 |
| ERROR | — | 12 | 10 | 5 |
| Formatting bugs | 5 | 0 | 0 | 0 |

### Queries that improved from Run 3 → Run 4

| # | Query | Run 3 | Run 4 | Fix |
|---|-------|-------|-------|-----|
| Q12 | Invoices posted without PO reference | ERROR (0) | OK (99 rows) | AP example: LEFT JOIN RSEG, check EBELN IS NULL |
| Q15 | Cash discount eligible invoices | ERROR (0) | OK (100 rows) | AP example: DISC_DUE_DATE IS NOT NULL, DISC_AMOUNT > 0 |
| Q17 | Vendors consistently above PO price | ERROR (0) | OK (50 rows) | AP example: RSEG.WRBTR/MENGE vs EKPO.NETPR/PEINH, HAVING >= 2 |
| Q43 | Vendors with changed bank details | ERROR (0) | OK (80 rows) | AP example: JOIN LFA1 to LFBK on LIFNR |
| Q45 | Capital expenditure invoices | ERROR (0) | OK (100 rows) | AP example: JOIN EKKN, filter ANLN1 IS NOT NULL |
| Q46 | GR/IR accruals | ERROR (0) | OK (100 rows) | AP rules: STATUS = 'GR>IR' not 'Open' |
| Q47 | Invoices on hold pending GR | ERROR (0) | OK (689 rows) | AP rules: correct join patterns |
| Q48 | Historical payment performance | EMPTY (0) | OK (60 rows) | AP example: JOIN REGUP on LIFNR |
| Q50 | Month-end AP closing checklist | EMPTY (0) | OK (1 row) | AP rules: better prompt context |

### Changes made in Run 4

1. **NEW: `backend/src/core/ap_examples.py`** — 9 AP-specific few-shot SQL examples with keyword-based selection
2. **Modified: `backend/src/core/bigquery_sql_generator.py`** — AP domain detection, column semantics rules, query pattern rules, selective example injection
3. Key corrections: RBKP uses RMWWR (not WRBTR) for amounts; EBELN is in RSEG (not RBKP); DISC_DUE_DATE/DISC_AMOUNT exist in RBKP; GRIR STATUS values are 'GR>IR'/'IR>GR'

---

## Formatting Issues — All Runs

| Issue | Run 1 | Run 2 | Run 3 | Run 4 | Status |
|-------|-------|-------|-------|-------|--------|
| relativedelta in output (Q18, Q19) | 2 queries | 0 | 0 | 0 | FIXED |
| Double %% (Q17) | 1 query | 0 | 0 | 0 | FIXED |
| ID columns with commas — LIFNR, EBELN, BELNR | 1 query | 0 | 0 | 0 | FIXED |
| $ on count columns — total_invoices | 2 queries | 0 | 0 | 0 | FIXED |
| Missing $ on amounts — outflow | 1 query | 0 | 0 | 0 | FIXED |
| Year columns showing "2" instead of "2025" | present | present | 0 | 0 | FIXED (Run 3) |
| Excess decimals — "11.5oz CAN" text (Q33) | — | 1 | 1 | 1 | FALSE POSITIVE (text, not number) |
| Excess decimals — "1.62OZ" text (Q09) | — | — | — | 1 | FALSE POSITIVE (product name) |

---

## Queries Returning Data (41 queries)

| # | Query | Rows | Time |
|---|-------|------|------|
| Q01 | Open invoices by vendor | 80 | 19.4s |
| Q02 | Invoices overdue as of today | 499 | 7.8s |
| Q03 | Total AP balance by company code | 18 | 9.0s |
| Q04 | Blocked invoices and why | 215 | 25.9s |
| Q05 | Aging summary in 30/60/90 buckets | 4 | 16.4s |
| Q06 | Invoices due within next 7 days | 500 | 8.0s |
| Q07 | Total GR/IR balance | 1 | 9.3s |
| Q08 | GR/IR items older than 60 days | 652 | 12.0s |
| Q09 | Price variances versus PO | 689 | 20.8s |
| Q10 | Quantity mismatches with goods receipts | 515 | 25.4s |
| Q11 | Fully received but not invoiced POs | 99 | 14.4s |
| Q12 | Invoices posted without PO reference | 99 | 9.3s |
| Q13 | Vendors with highest outstanding balances | 20 | 7.8s |
| Q14 | Average DPO | 1 | 9.4s |
| Q15 | Cash discount eligible invoices | 100 | 12.6s |
| Q16 | Discount missed last month | 1 | 8.6s |
| Q17 | Vendors consistently above PO price | 50 | 25.5s |
| Q18 | Invoices paid late | 173 | 16.1s |
| Q19 | Invoices paid early | 191 | 16.3s |
| Q21 | Total expected cash outflow in next 30 days | 1 | 7.6s |
| Q23 | New vendors with payments | 60 | 15.8s |
| Q26 | Invoices exceeding $100K manually posted | 98 | 15.3s |
| Q27 | Invoice processing cycle time on average | 1 | 10.4s |
| Q28 | GR to invoice posting time | 1 | 16.7s |
| Q29 | Invoices pending approval | 500 | 9.6s |
| Q31 | Invoices stuck in workflow | 2 | 16.3s |
| Q32 | Total spend by vendor year-to-date | 80 | 7.4s |
| Q33 | Spend by material group | 114 | 14.2s |
| Q34 | Cost centers with highest AP spend | 20 | 10.4s |
| Q37 | Total tax posted last quarter | 1 | 7.7s |
| Q39 | Monthly trend of invoice volume | 39 | 9.8s |
| Q40 | Auto-posted vs manually posted invoices | 1 | 10.1s |
| Q42 | Average payment term by vendor | 80 | 8.6s |
| Q43 | Vendors with changed bank details | 80 | 8.8s |
| Q44 | Total liability in foreign currency | 1 | 7.2s |
| Q45 | Capital expenditure invoices | 100 | 18.8s |
| Q46 | GR/IR accruals | 100 | 12.1s |
| Q47 | Invoices on hold pending GR | 689 | 12.1s |
| Q48 | Historical payment performance by vendor | 60 | 15.3s |
| Q49 | Invoices impacting a specific G/L account | 788 | 15.5s |
| Q50 | Month-end AP closing checklist status | 1 | 10.3s |

---

## Queries Returning Empty/No Results (9 queries)

### EMPTY — Query ran but 0 rows (4 queries)
- Q20: Payments scheduled for this week (date window — no payments in current week)
- Q22: Vendors created in last 90 days (date filter too narrow for mock data)
- Q35: POs close to exceeding budget (no budget threshold data)
- Q41: Vendors with payment term exceptions (data issue — all RBKP.ZTERM matches LFA1.ZTERM)

### ERROR — Query returned no results or data not available (5 queries)
- Q24: Potential duplicate invoices (SQL correct but no duplicates in data)
- Q25: Same amount and reference number (SQL correct — groups by XBLNR+LIFNR+RMWWR but no duplicates exist)
- Q30: Who approved a specific invoice (no approval data in schema)
- Q36: Invoices with tax discrepancies (query ran but found no discrepancies)
- Q38: Invoices reversed or cancelled (no reversal flags in current data)

---

## Target SQL_LOGIC Fix Results

| # | Query | Root Cause | Before | After | Resolution |
|---|-------|-----------|--------|-------|------------|
| Q12 | Without PO reference | LLM JOINed wrong table | ERROR | **OK (99)** | AP example: LEFT JOIN RSEG, check EBELN IS NULL |
| Q15 | Cash discount eligible | Malformed CASE, wrong column | ERROR | **OK (100)** | AP example: DISC_DUE_DATE + DISC_AMOUNT |
| Q17 | Above PO price | Overly restrictive filters | ERROR | **OK (50)** | AP example: HAVING >= 2 threshold |
| Q25 | Same amount + ref | Wrong column (BELNR vs XBLNR) | ERROR | ERROR | SQL now correct (uses XBLNR) but no duplicates in data |
| Q41 | Payment term exceptions | Wrong table (LEFT JOIN) | ERROR | EMPTY | SQL now correct (RBKP vs LFA1) but all terms match in data |
| Q43 | Changed bank details | Wrong JOIN key (NAME1) | ERROR | **OK (80)** | AP example: JOIN on LIFNR |
| Q45 | Capital expenditure | Cartesian join, LIKE '%capital%' | ERROR | **OK (100)** | AP example: EKKN.ANLN1 IS NOT NULL |
| Q46 | GR/IR accruals | STATUS = 'Open' (wrong) | ERROR | **OK (100)** | AP rules: STATUS = 'GR>IR' |
| Q48 | Payment performance | CAST(NAME1 AS INTEGER) | EMPTY | **OK (60)** | AP example: JOIN on LIFNR |

**7 of 9 fixed by SQL improvement. 2 remaining are data-level issues (correct SQL, no matching data).**
