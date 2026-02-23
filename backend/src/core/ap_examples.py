"""Reference queries for AP (Accounts Payable) domain in BigQuery.

Provides few-shot examples and business rules to guide SQL generation
for AP tables: RBKP, RSEG, EKKO, EKPO, EKKN, LFA1, LFBK, REGUH, REGUP,
GRIR_Reconciliation, T052_PaymentTerms, etc.

Each example has a 'keywords' list for targeted selection — only the most
relevant 3-4 examples are injected per query to avoid diluting the prompt.
"""

AP_SQL_EXAMPLES = [
    # --- 1. Invoices without PO reference ---
    {
        "keywords": ["without po", "no po", "without purchase order", "posted without"],
        "question": "Which invoices were posted without a PO reference?",
        "sql": """SELECT
    r.BELNR AS invoice_number,
    r.GJAHR AS fiscal_year,
    r.LIFNR AS vendor_number,
    s.NAME1 AS vendor_name,
    r.RMWWR AS invoice_amount,
    r.WAERS AS currency,
    r.BUDAT AS posting_date
FROM `{project}.{dataset}.RBKP_InvoiceHeaders` r
LEFT JOIN `{project}.{dataset}.RSEG_InvoiceItems` i
    ON r.BELNR = i.BELNR AND r.GJAHR = i.GJAHR
LEFT JOIN `{project}.{dataset}.LFA1_Suppliers` s
    ON r.LIFNR = s.LIFNR
WHERE i.EBELN IS NULL
ORDER BY r.RMWWR DESC
LIMIT 100""",
        "explanation": "Invoices without PO: LEFT JOIN RSEG to RBKP and check i.EBELN IS NULL (EBELN is on RSEG line items, NOT on RBKP header). Amount column in RBKP is RMWWR, not WRBTR."
    },

    # --- 2. Cash discount eligible invoices ---
    {
        "keywords": ["cash discount", "discount eligible", "early payment discount"],
        "question": "Which invoices are eligible for cash discount?",
        "sql": """SELECT
    r.BELNR AS invoice_number,
    r.GJAHR AS fiscal_year,
    r.LIFNR AS vendor_number,
    s.NAME1 AS vendor_name,
    ROUND(r.RMWWR, 2) AS invoice_amount,
    ROUND(r.DISC_AMOUNT, 2) AS discount_amount,
    r.WAERS AS currency,
    r.ZTERM AS payment_terms,
    r.DUE_DATE AS due_date,
    r.DISC_DUE_DATE AS discount_due_date
FROM `{project}.{dataset}.RBKP_InvoiceHeaders` r
LEFT JOIN `{project}.{dataset}.LFA1_Suppliers` s
    ON r.LIFNR = s.LIFNR
WHERE r.DISC_DUE_DATE IS NOT NULL
    AND r.DISC_AMOUNT IS NOT NULL
    AND r.DISC_AMOUNT > 0
ORDER BY r.DISC_AMOUNT DESC
LIMIT 100""",
        "explanation": "Cash discount eligible invoices: filter WHERE DISC_DUE_DATE IS NOT NULL AND DISC_AMOUNT > 0. RBKP has DISC_DUE_DATE and DISC_AMOUNT columns. Amount column in RBKP is RMWWR (not WRBTR)."
    },

    # --- 3. Vendors invoicing above PO price (price variance) ---
    {
        "keywords": ["above po price", "invoice above", "price variance", "consistently invoice"],
        "question": "Which vendors consistently invoice above the PO price?",
        "sql": """SELECT
    s.LIFNR AS vendor_number,
    s.NAME1 AS vendor_name,
    COUNT(*) AS invoice_count,
    ROUND(AVG(
        SAFE_DIVIDE(rs.WRBTR, NULLIF(rs.MENGE, 0))
        - SAFE_DIVIDE(ep.NETPR, NULLIF(ep.PEINH, 0))
    ), 2) AS avg_price_variance,
    ROUND(SUM(rs.WRBTR - SAFE_DIVIDE(ep.NETPR * rs.MENGE, NULLIF(ep.PEINH, 0))), 2) AS total_excess_amount
FROM `{project}.{dataset}.RSEG_InvoiceItems` rs
JOIN `{project}.{dataset}.RBKP_InvoiceHeaders` r
    ON rs.BELNR = r.BELNR AND rs.GJAHR = r.GJAHR
JOIN `{project}.{dataset}.EKPO_POItems` ep
    ON rs.EBELN = ep.EBELN AND rs.EBELP = ep.EBELP
JOIN `{project}.{dataset}.LFA1_Suppliers` s
    ON r.LIFNR = s.LIFNR
WHERE rs.WRBTR > SAFE_DIVIDE(ep.NETPR * rs.MENGE, NULLIF(ep.PEINH, 0))
GROUP BY s.LIFNR, s.NAME1
HAVING COUNT(*) >= 2
ORDER BY total_excess_amount DESC
LIMIT 50""",
        "explanation": "Compare invoice unit price (RSEG.WRBTR/MENGE) vs PO unit price (EKPO.NETPR/PEINH). Use HAVING >= 2 for 'consistently' rather than very high thresholds."
    },

    # --- 4. Duplicate invoices by external reference ---
    {
        "keywords": ["duplicate", "same amount", "same reference", "reference number"],
        "question": "Which invoices have the same amount and reference number?",
        "sql": """SELECT
    r.XBLNR AS external_reference,
    r.LIFNR AS vendor_number,
    s.NAME1 AS vendor_name,
    r.WRBTR AS invoice_amount,
    r.WAERS AS currency,
    COUNT(*) AS duplicate_count,
    STRING_AGG(r.BELNR, ', ') AS document_numbers
FROM `{project}.{dataset}.RBKP_InvoiceHeaders` r
LEFT JOIN `{project}.{dataset}.LFA1_Suppliers` s
    ON r.LIFNR = s.LIFNR
WHERE r.XBLNR IS NOT NULL AND r.XBLNR != ''
GROUP BY r.XBLNR, r.LIFNR, s.NAME1, r.WRBTR, r.WAERS
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, r.WRBTR DESC
LIMIT 100""",
        "explanation": "Detect duplicate invoices by grouping on XBLNR (external vendor invoice reference), LIFNR (vendor), and WRBTR (amount). XBLNR is the vendor's invoice number; BELNR is the SAP document number. Always use XBLNR for duplicate detection, never BELNR."
    },

    # --- 5. Vendors with payment term exceptions ---
    {
        "keywords": ["payment term exception", "term exception", "payment term differ"],
        "question": "Which vendors have payment term exceptions?",
        "sql": """SELECT
    r.LIFNR AS vendor_number,
    s.NAME1 AS vendor_name,
    s.ZTERM AS vendor_default_terms,
    r.ZTERM AS invoice_terms,
    COUNT(*) AS exception_count,
    ROUND(SUM(r.RMWWR), 2) AS total_amount
FROM `{project}.{dataset}.RBKP_InvoiceHeaders` r
JOIN `{project}.{dataset}.LFA1_Suppliers` s
    ON r.LIFNR = s.LIFNR
WHERE CAST(r.ZTERM AS STRING) != CAST(s.ZTERM AS STRING)
    AND r.ZTERM IS NOT NULL
    AND s.ZTERM IS NOT NULL
GROUP BY r.LIFNR, s.NAME1, s.ZTERM, r.ZTERM
ORDER BY exception_count DESC
LIMIT 100""",
        "explanation": "Payment term exceptions: compare RBKP.ZTERM (invoice-level terms) vs LFA1.ZTERM (vendor master default terms). Use RBKP (not REGUP). Amount in RBKP is RMWWR."
    },

    # --- 6. Vendors with changed bank details ---
    {
        "keywords": ["bank detail", "changed bank", "bank account", "vendor bank"],
        "question": "Which vendors have changed bank details recently?",
        "sql": """SELECT
    s.LIFNR AS vendor_number,
    s.NAME1 AS vendor_name,
    vb.BANKL AS bank_key,
    vb.BANKN AS bank_account,
    vb.BKONT AS bank_control_key,
    vb.BANKA AS bank_name
FROM `{project}.{dataset}.LFA1_Suppliers` s
JOIN `{project}.{dataset}.LFBK_VendorBanks` vb
    ON s.LIFNR = vb.LIFNR
ORDER BY s.LIFNR
LIMIT 100""",
        "explanation": "Vendor bank details: JOIN LFA1_Suppliers with LFBK_VendorBanks ON LIFNR = LIFNR. Always use LIFNR as the join key between vendor tables. NEVER use NAME1 as a join key."
    },

    # --- 7. Capital expenditure invoices ---
    {
        "keywords": ["capital expenditure", "capex", "capital", "asset"],
        "question": "Which invoices are related to capital expenditures?",
        "sql": """SELECT
    r.BELNR AS invoice_number,
    r.GJAHR AS fiscal_year,
    r.LIFNR AS vendor_number,
    s.NAME1 AS vendor_name,
    rs.EBELN AS po_number,
    rs.EBELP AS po_item,
    rs.WRBTR AS item_amount,
    ek.ANLN1 AS asset_number,
    ek.KOSTL AS cost_center
FROM `{project}.{dataset}.RSEG_InvoiceItems` rs
JOIN `{project}.{dataset}.RBKP_InvoiceHeaders` r
    ON rs.BELNR = r.BELNR AND rs.GJAHR = r.GJAHR
JOIN `{project}.{dataset}.EKKN_AcctAssignment` ek
    ON rs.EBELN = ek.EBELN AND rs.EBELP = ek.EBELP
LEFT JOIN `{project}.{dataset}.LFA1_Suppliers` s
    ON r.LIFNR = s.LIFNR
WHERE ek.ANLN1 IS NOT NULL AND ek.ANLN1 != '' AND ek.ANLN1 != '0'
ORDER BY rs.WRBTR DESC
LIMIT 100""",
        "explanation": "Capital expenditure invoices: JOIN RSEG to EKKN_AcctAssignment on EBELN+EBELP, then filter WHERE ANLN1 IS NOT NULL. A non-empty asset number (ANLN1) in the account assignment indicates capex. Do NOT use LIKE '%capital%' on text columns."
    },

    # --- 8. GR/IR accruals (goods received not invoiced) ---
    {
        "keywords": ["gr/ir", "grir", "accrual", "goods received not invoiced", "gr not invoiced"],
        "question": "What accruals are required for goods received but not invoiced?",
        "sql": """SELECT
    EBELN AS po_number,
    EBELP AS po_item,
    LIFNR AS vendor_number,
    MATNR AS material_number,
    STATUS,
    ROUND(GR_AMOUNT, 2) AS gr_amount,
    ROUND(IR_AMOUNT, 2) AS ir_amount,
    ROUND(GR_AMOUNT - IR_AMOUNT, 2) AS accrual_amount,
    WAERS AS currency
FROM `{project}.{dataset}.GRIR_Reconciliation`
WHERE STATUS = 'GR>IR'
ORDER BY (GR_AMOUNT - IR_AMOUNT) DESC
LIMIT 100""",
        "explanation": "GR/IR accruals: use GRIR_Reconciliation table with STATUS = 'GR>IR' (goods received exceeds invoiced). Do NOT use STATUS = 'Open' or 'matched' — actual values are 'GR>IR' and 'IR>GR'."
    },

    # --- 9. Historical payment performance by vendor ---
    {
        "keywords": ["payment performance", "payment history", "historical payment"],
        "question": "What is the historical payment performance by vendor?",
        "sql": """SELECT
    s.LIFNR AS vendor_number,
    s.NAME1 AS vendor_name,
    COUNT(DISTINCT rp.BELNR) AS total_payments,
    ROUND(SUM(rp.WRBTR), 2) AS total_paid_amount,
    COUNT(DISTINCT r.BELNR) AS total_invoices,
    ROUND(SUM(r.RMWWR), 2) AS total_invoice_amount
FROM `{project}.{dataset}.LFA1_Suppliers` s
LEFT JOIN `{project}.{dataset}.REGUP_PaymentItems` rp
    ON s.LIFNR = rp.LIFNR
LEFT JOIN `{project}.{dataset}.RBKP_InvoiceHeaders` r
    ON s.LIFNR = r.LIFNR
GROUP BY s.LIFNR, s.NAME1
HAVING COUNT(DISTINCT rp.BELNR) > 0
ORDER BY total_paid_amount DESC
LIMIT 100""",
        "explanation": "Payment performance by vendor: JOIN LFA1 to REGUP_PaymentItems on LIFNR for payments, and to RBKP on LIFNR for invoices. RBKP amount is RMWWR. REGUP amount is WRBTR. Never CAST NAME1 to INTEGER."
    },
]

# AP-specific business rules for prompt injection
AP_BUSINESS_RULES = {
    "join_keys": {
        "vendor": "LFA1_Suppliers (key: LIFNR). Always JOIN vendor tables using LIFNR = LIFNR.",
        "vendor_banks": "LFBK_VendorBanks: JOIN ON LFA1.LIFNR = LFBK.LIFNR",
        "invoice_header": "RBKP_InvoiceHeaders (vendor: LIFNR, PO: EBELN, doc: BELNR+GJAHR)",
        "invoice_items": "RSEG_InvoiceItems: JOIN ON RBKP.BELNR = RSEG.BELNR AND RBKP.GJAHR = RSEG.GJAHR",
        "po_headers": "EKKO_POHeaders (key: EBELN)",
        "po_items": "EKPO_POItems: JOIN ON EBELN + EBELP",
        "acct_assignment": "EKKN_AcctAssignment: JOIN ON EBELN + EBELP",
        "payment_headers": "REGUH_PaymentHeaders (key: LAUFD + LAUFI + LIFNR)",
        "payment_items": "REGUP_PaymentItems (key: BELNR, vendor: LIFNR)",
        "grir": "GRIR_Reconciliation (STATUS values: 'GR>IR', 'IR>GR' — NOT 'Open' or 'matched')",
    },
    "column_semantics": {
        "EBELN": "Purchase Order number — in RSEG, EKKO, EKPO, EKKN (NOT in RBKP!)",
        "BELNR": "SAP document number",
        "XBLNR": "External reference / vendor invoice number (in RBKP)",
        "LIFNR": "Vendor number",
        "ZLSPR": "Payment block code in RBKP (NULL = not blocked)",
        "ZTERM": "Payment terms key (Z001=Net30, Z002=2/10Net30, etc.)",
        "ANLN1": "Asset number in EKKN (NOT NULL = capital expenditure)",
        "RMWWR": "Gross invoice amount in RBKP (NOT WRBTR)",
        "WRBTR": "Amount in RSEG and REGUP (NOT in RBKP!)",
        "DISC_DUE_DATE": "Discount due date in RBKP",
        "DISC_AMOUNT": "Discount amount in RBKP",
        "DUE_DATE": "Payment due date in RBKP",
        "WAERS": "Currency key",
        "BUDAT": "Posting date",
        "ZFBDT": "Baseline date for payment terms",
        "NAME1": "Vendor name in LFA1_Suppliers",
    },
    "common_patterns": {
        "invoices_without_po": "Check EBELN IS NULL in RBKP, do NOT join EKPO",
        "duplicate_invoices": "Group by XBLNR (external ref) + LIFNR + WRBTR, HAVING COUNT(*) > 1",
        "payment_term_exceptions": "Compare RBKP.ZTERM != LFA1.ZTERM (vendor-level vs invoice-level)",
        "capital_expenditure": "JOIN EKKN on EBELN+EBELP, filter ANLN1 IS NOT NULL",
        "grir_accruals": "Use GRIR_Reconciliation WHERE STATUS = 'GR>IR', NOT 'Open'",
        "vendor_banks": "JOIN LFA1 to LFBK on LIFNR, never use NAME1 as join key",
        "payment_performance": "JOIN LFA1 to REGUP on LIFNR, never CAST NAME1 to INTEGER",
    },
}


def select_relevant_ap_examples(query: str, max_examples: int = 4):
    """Select the most relevant AP examples based on query keywords.

    Returns at most max_examples examples that have keyword matches with the query.
    This prevents injecting all examples which can dilute the prompt and cause
    the LLM to copy patterns from unrelated examples.
    """
    query_lower = query.lower()
    scored_examples = []

    for ex in AP_SQL_EXAMPLES:
        score = sum(1 for kw in ex["keywords"] if kw in query_lower)
        if score > 0:
            scored_examples.append((score, ex))

    # Sort by relevance score descending
    scored_examples.sort(key=lambda x: x[0], reverse=True)

    # Return only the top examples (without keywords field)
    return [
        {k: v for k, v in ex.items() if k != "keywords"}
        for _, ex in scored_examples[:max_examples]
    ]
