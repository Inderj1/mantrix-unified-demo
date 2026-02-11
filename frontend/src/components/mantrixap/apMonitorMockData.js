/**
 * AP Monitor — Mock Data
 * Data for the SAP Monitor component (6 tabs)
 * Matches the spec in documents/MANTRIX_SAP_Monitor.html
 * Data sourced from Arizona Beverages BigQuery dataset
 */

// ─── KPI Strip (8 cards) ───
export const monitorKPIs = [
  { label: 'Posted Today', value: '28', sub: 'of 61 received', color: 'green', highlight: 'green', delta: '+3 vs avg', deltaDir: 'up' },
  { label: 'Value Posted', value: '$2.85M', sub: '$2,847,690', color: 'teal' },
  { label: 'Straight-Through', value: '72%', sub: 'No human touch', color: 'green', highlight: 'green', delta: '↑ 8%', deltaDir: 'up' },
  { label: 'Avg Post Time', value: '2.4s', sub: 'BAPI round-trip', color: 'teal' },
  { label: 'Queued', value: '2', sub: 'Submitting now', color: 'blue' },
  { label: 'Parked', value: '4', sub: 'Awaiting action', color: 'amber' },
  { label: 'Failed', value: '1', sub: 'Needs attention', color: 'red', highlight: 'red' },
  { label: 'Avg Cycle Time', value: '3.8d', sub: 'Invoice → Posted', color: 'green', delta: '↓ 2.1d', deltaDir: 'up' },
];

// ─── Posted Tab (6 rows, 13 columns) ───
export const postedRows = [
  {
    id: 1, status: 'POSTED', sapDoc: '5100000341', fy: '2026', postDate: '02/08',
    vendor: 'Krones Inc', vendorCode: '0001000217', lines: 6,
    invoiceRef: 'VND-INV-004501', poNumber: '3900051320',
    poValue: 128400, invValue: 128400, variance: '$0 (0%)', varianceClass: 'ok',
    grRef: '4900000200', paymentDue: 'Mar 05', paymentNote: '2%', paymentClass: 'disc',
    postedAt: '8:15 AM', auto: true, speed: '2.1s',
    matchDetail: {
      invoice: { value: '$128,400', ref: 'VND-INV-004501', lines: 6, date: 'Feb 3, 2026' },
      po: { value: '$128,400', ref: 'PO 3900051320', items: 6, date: 'Oct 15, 2025' },
      gr: { value: '$128,400', ref: 'GR 4900000200', items: 6, date: 'Jan 28, 2026' },
      confirmText: '✓ INVOICE = PO = GR → 3-Way Match Confirmed → MIRO Doc 5100000341',
      lineItems: [
        { line: 10, material: '1000910', desc: 'AZ LEMON 24PK 15OZ CAN', poQty: '2 EA', grQty: '2 EA', invQty: '2 EA', poPrice: '$34,200', invPrice: '$34,200' },
        { line: 20, material: '1000912', desc: 'AZ GREEN 24PK 15OZ CAN', poQty: '4 EA', grQty: '4 EA', invQty: '4 EA', poPrice: '$12,600', invPrice: '$12,600' },
        { line: 30, material: '1000913', desc: 'AZ PEACH 24PK 15OZ CAN', poQty: '2 EA', grQty: '2 EA', invQty: '2 EA', poPrice: '$18,400', invPrice: '$18,400' },
        { line: 40, material: '1000914', desc: 'AZ ARNOLD PALMER 24PK 15OZ CAN', poQty: '6 EA', grQty: '6 EA', invQty: '6 EA', poPrice: '$4,200', invPrice: '$4,200' },
        { line: 50, material: '1000921', desc: 'AZ HARD LEMONADE 24PK 12OZ CAN', poQty: '8 EA', grQty: '8 EA', invQty: '8 EA', poPrice: '$1,800', invPrice: '$1,800' },
        { line: 60, material: '1000922', desc: 'AZ HARD MANGO LEMONADE 24PK 12OZ CAN', poQty: '2 EA', grQty: '2 EA', invQty: '2 EA', poPrice: '$2,100', invPrice: '$2,100' },
      ],
    },
  },
  {
    id: 2, status: 'POSTED', sapDoc: '5100000342', fy: '2026', postDate: '02/08',
    vendor: 'Nvenia LLC', vendorCode: '0001000018', lines: 3,
    invoiceRef: 'VND-INV-004502', poNumber: '3900051400',
    poValue: 18200, invValue: 18200, variance: '$0 (0%)', varianceClass: 'ok',
    grRef: '4900000250', paymentDue: 'Mar 06', paymentNote: '', paymentClass: 'norm',
    postedAt: '8:18 AM', auto: true, speed: '1.8s',
    matchDetail: {
      invoice: { value: '$18,200', ref: 'VND-INV-004502', lines: 3, date: 'Feb 4, 2026' },
      po: { value: '$18,200', ref: 'PO 3900051400', items: 3, date: 'Nov 10, 2025' },
      gr: { value: '$18,200', ref: 'GR 4900000250', items: 3, date: 'Jan 30, 2026' },
      confirmText: '✓ INVOICE = PO = GR → 3-Way Match Confirmed → MIRO Doc 5100000342',
      lineItems: [
        { line: 10, material: '1001324', desc: 'AZ HARD WATERMELON 12PK 22OZ CAN', poQty: '200 EA', grQty: '200 EA', invQty: '200 EA', poPrice: '$8,400', invPrice: '$8,400' },
        { line: 20, material: '1001446', desc: 'AZ DIET GREEN NP 24PK 22OZ CAN', poQty: '50 EA', grQty: '50 EA', invQty: '50 EA', poPrice: '$6,200', invPrice: '$6,200' },
        { line: 30, material: '1001424', desc: 'AZ WATERMELON NP 24PK 22OZ CAN', poQty: '200 EA', grQty: '200 EA', invQty: '200 EA', poPrice: '$3,600', invPrice: '$3,600' },
      ],
    },
  },
  {
    id: 3, status: 'POSTED', sapDoc: '5100000343', fy: '2026', postDate: '02/08',
    vendor: 'Johnson Controls Security', vendorCode: '0001000004', lines: 5,
    invoiceRef: 'VND-INV-004507', poNumber: '3900051380',
    poValue: 45600, invValue: 45600, variance: '$0 (0%)', varianceClass: 'ok',
    grRef: '4900000220', paymentDue: 'Mar 10', paymentNote: '', paymentClass: 'norm',
    postedAt: '8:22 AM', auto: false, speed: '2.4s',
    matchDetail: {
      invoice: { value: '$45,600', ref: 'VND-INV-004507', lines: 5, date: 'Feb 2, 2026' },
      po: { value: '$45,600', ref: 'PO 3900051380', items: 5, date: 'Sep 22, 2025' },
      gr: { value: '$45,600', ref: 'GR 4900000220', items: 5, date: 'Jan 25, 2026' },
      confirmText: '✓ INVOICE = PO = GR → 3-Way Match Confirmed → MIRO Doc 5100000343',
      lineItems: [
        { line: 10, material: '1000953', desc: 'AZ HARD GREEN TEA 24PK 12OZ SLEEK', poQty: '2 EA', grQty: '2 EA', invQty: '2 EA', poPrice: '$12,400', invPrice: '$12,400' },
        { line: 20, material: '1000951', desc: 'AZ HARD LEMON TEA 24PK 12OZ SLEEK', poQty: '4 EA', grQty: '4 EA', invQty: '4 EA', poPrice: '$3,600', invPrice: '$3,600' },
        { line: 30, material: '1001222', desc: 'AZ GREEN TEA 12PK 8QT CANISTER MIX', poQty: '3 EA', grQty: '3 EA', invQty: '3 EA', poPrice: '$2,800', invPrice: '$2,800' },
        { line: 40, material: '1000964', desc: 'AZ ZERO GREEN TEA NS 4PK 128OZ PPL', poQty: '6 EA', grQty: '6 EA', invQty: '6 EA', poPrice: '$1,200', invPrice: '$1,200' },
        { line: 50, material: '1001554', desc: 'CC CRAZY COWBOY NP 24PK 24OZ CAN', poQty: '1 EA', grQty: '1 EA', invQty: '1 EA', poPrice: '$2,000', invPrice: '$2,000' },
      ],
    },
  },
  {
    id: 4, status: 'POSTED', sapDoc: '5100000344', fy: '2026', postDate: '02/08',
    vendor: 'ADP', vendorCode: '0001000003', lines: 24,
    invoiceRef: 'VND-INV-004503', poNumber: '3900051350',
    poValue: 343285, invValue: 342600, variance: '-$685 (0.2%)', varianceClass: 'ok',
    grRef: '4900000260', paymentDue: 'Mar 18', paymentNote: '', paymentClass: 'norm',
    postedAt: '8:35 AM', auto: false, speed: '3.1s',
    matchDetail: {
      invoice: { value: '$342,600', ref: 'VND-INV-004503', lines: 24, date: 'Feb 1, 2026' },
      po: { value: '$343,285', ref: 'PO 3900051350', items: 24, date: 'Aug 15, 2025' },
      gr: { value: '$342,600', ref: 'GR 4900000260', items: 24, date: 'Jan 20, 2026' },
      confirmText: '✓ INVOICE ≈ PO (−$685, 0.2% within tolerance) = GR → MIRO Doc 5100000344',
      lineItems: [
        { line: 10, material: '1001535', desc: 'HB ARNOLD PALMER SPIKED (4X6) 24PK', poQty: '4 EA', grQty: '4 EA', invQty: '4 EA', poPrice: '$48,200', invPrice: '$48,000' },
        { line: 20, material: '1000972', desc: 'HB AP SPIKED MANGO 24PK 12OZ CAN', poQty: '8 EA', grQty: '8 EA', invQty: '8 EA', poPrice: '$12,600', invPrice: '$12,600' },
        { line: 30, material: '1001523', desc: 'HB AP SPIKED STRAWBERRY 12PK 24OZ', poQty: '16 EA', grQty: '16 EA', invQty: '16 EA', poPrice: '$4,200', invPrice: '$4,200' },
        { line: 40, material: '1000910', desc: 'AZ LEMON 24PK 15OZ CAN', poQty: '8 EA', grQty: '8 EA', invQty: '8 EA', poPrice: '$3,800', invPrice: '$3,800' },
        { line: 50, material: '1000912', desc: 'AZ GREEN 24PK 15OZ CAN', poQty: '4 EA', grQty: '4 EA', invQty: '4 EA', poPrice: '$2,100', invPrice: '$2,100' },
        { line: 60, material: '1000913', desc: 'AZ PEACH 24PK 15OZ CAN', poQty: '2 EA', grQty: '2 EA', invQty: '2 EA', poPrice: '$6,400', invPrice: '$6,400' },
      ],
    },
  },
  {
    id: 5, status: 'POSTED', sapDoc: '5100000345', fy: '2026', postDate: '02/08',
    vendor: 'Cintas Corporation #062', vendorCode: '0001000031', lines: 1, vendorNote: 'Non-PO',
    invoiceRef: 'VND-INV-004509', poNumber: '— Non-PO',
    poValue: null, invValue: 1850, variance: '—', varianceClass: 'na',
    grRef: '— No GR', paymentDue: 'Mar 03', paymentNote: '', paymentClass: 'norm',
    postedAt: '8:40 AM', auto: true, speed: '1.6s',
    matchDetail: {
      invoice: { value: '$1,850', ref: 'VND-INV-004509', lines: 1, date: 'Feb 5, 2026' },
      po: { value: '— N/A', ref: 'Non-PO Invoice', items: 0, date: '—' },
      gr: { value: '— N/A', ref: 'No GR Required', items: 0, date: '—' },
      confirmText: '✓ Non-PO Auto-Coded: GL 62100 / CC 4200 · AI Trust 95.8% → MIRO Doc 5100000345',
      lineItems: [
        { line: 10, material: 'SVC-UNI', desc: 'Uniform Service — Monthly', poQty: '—', grQty: '—', invQty: '1 EA', poPrice: '—', invPrice: '$1,850' },
      ],
    },
  },
  {
    id: 6, status: 'POSTED', sapDoc: '5100000346', fy: '2026', postDate: '02/08',
    vendor: 'Federal Express Corporation', vendorCode: '0001000002', lines: 3, vendorNote: 'Was parked',
    invoiceRef: 'VND-INV-004480', poNumber: '3900051300',
    poValue: 94200, invValue: 94200, variance: '$0 (0%)', varianceClass: 'ok',
    grRef: '4900000310', paymentDue: 'Feb 20', paymentNote: '⚠', paymentClass: 'soon',
    postedAt: '9:04 AM', auto: false, speed: '2.8s · Unparked',
    matchDetail: {
      invoice: { value: '$94,200', ref: 'VND-INV-004480', lines: 3, date: 'Jan 28, 2026' },
      po: { value: '$94,200', ref: 'PO 3900051300', items: 3, date: 'Oct 5, 2025' },
      gr: { value: '$94,200', ref: 'GR 4900000310', items: 3, date: 'Feb 8, 2026' },
      confirmText: '✓ INVOICE = PO = GR → 3-Way Match Confirmed (Unparked) → MIRO Doc 5100000346',
      lineItems: [
        { line: 10, material: '1000914', desc: 'AZ ARNOLD PALMER 24PK 15OZ CAN', poQty: '1 EA', grQty: '1 EA', invQty: '1 EA', poPrice: '$68,400', invPrice: '$68,400' },
        { line: 20, material: '1000921', desc: 'AZ HARD LEMONADE 24PK 12OZ CAN', poQty: '1 EA', grQty: '1 EA', invQty: '1 EA', poPrice: '$18,600', invPrice: '$18,600' },
        { line: 30, material: '1000922', desc: 'AZ HARD MANGO LEMONADE 24PK 12OZ', poQty: '2 EA', grQty: '2 EA', invQty: '2 EA', poPrice: '$3,600', invPrice: '$3,600' },
      ],
    },
  },
];

// ─── Queued Tab (2 rows, 8 columns) ───
export const queuedRows = [
  {
    id: 1, status: 'QUEUED', sapDoc: 'Pending...', vendor: 'US Bottlers Machinery',
    vendorSub: '38 of 42 lines', invoiceRef: 'VND-INV-004504', poNumber: '3900049229',
    value: 515600, lines: 38, submitted: '9:15 AM · 2s ago',
  },
  {
    id: 2, status: 'QUEUED', sapDoc: 'Pending...', vendor: 'Arctic Falls Spring Water',
    vendorSub: '86 of 98 lines', invoiceRef: 'VND-INV-004506', poNumber: '3900051420',
    value: 1111000, lines: 86, submitted: '9:14 AM · 3s ago',
  },
];

// ─── Parked Tab (4 rows, 9 columns) ───
export const parkedRows = [
  {
    id: 1, status: 'PARKED', parkDoc: 'P-5100000350', vendor: 'Arctic Falls Spring Water',
    vendorSub: '5 lines · GR pending', invoiceRef: 'VND-INV-004498', poNumber: '3900051420',
    value: 87400, lines: 5, reason: 'Hold — GR overdue 2d',
    owner: 'Time', ownerIcon: '⏸', ownerColor: 'slate',
  },
  {
    id: 2, status: 'PARKED', parkDoc: 'P-5100000351', vendor: 'US Bottlers Machinery',
    vendorSub: '4 lines · price var', invoiceRef: 'VND-INV-004504', poNumber: '3900049229',
    value: 52200, lines: 4, reason: 'Price +6.2%',
    owner: 'Buyer', ownerIcon: '→', ownerColor: 'blue',
  },
  {
    id: 3, status: 'PARKED', parkDoc: 'P-5100000352', vendor: 'Process Tech Sales',
    vendorSub: '2 lines · qty mismatch', invoiceRef: 'VND-INV-004505', poNumber: '3900051366',
    value: 18600, lines: 2, reason: 'Qty: 24 vs GR 18',
    owner: 'GR/Ops', ownerIcon: '🏭', ownerColor: 'amber',
  },
  {
    id: 4, status: 'PARKED', parkDoc: 'P-5100000353', vendor: 'Miller & Chitty Company',
    vendorSub: '1 line · exp vs cap', invoiceRef: 'VND-INV-004513', poNumber: '— Non-PO',
    value: 8400, lines: 1, reason: 'Expense vs Capital',
    owner: 'Controller', ownerIcon: '↑', ownerColor: 'purple',
  },
];

// ─── Failed Tab (1 detail card) ───
export const failedDetail = {
  vendor: 'JJ Keller & Associates Inc',
  invoiceRef: 'VND-INV-004510',
  lines: 15,
  value: 67200,
  failedAt: '9:12 AM',
  error: 'SAP Error F5 201 — Company code ABUS: Posting period 002 2026 is not open',
  translation: 'Posting period February 2026 has not been opened in SAP (transaction OB52). This is a system configuration issue, not an invoice error. All 15 lines matched perfectly with GR 4900000290 and PO 3900051410.',
  aiAssessment: '3rd invoice blocked by period closure today. Finance team likely needs to run period-open job. Similar delay occurred Feb 1 (resolved by 10:00 AM). Expected resolution: within 2 hours. Invoice will post with zero changes once period opens.',
  po: '3900051410',
  gr: '4900000290',
  matchCount: '15/15 ✓',
  actions: [
    { label: '⏸ Hold + Auto-Retry', primary: true, toast: '⏸ Held — auto-retry when period opens' },
    { label: 'Notify Finance', primary: false, toast: '📧 Finance team notified' },
    { label: 'Escalate', primary: false, toast: '↑ Escalated' },
  ],
};

// ─── Activity Log (13 entries) ───
export const activityLog = [
  { time: '9:15 AM', type: 'queued', typeLabel: 'QUEUED', msg: '<b>US Bottlers Machinery</b> 38 of 42 lines submitted via BAPI_INCOMINGINVOICE_CREATE', value: '$515,600' },
  { time: '9:14 AM', type: 'queued', typeLabel: 'QUEUED', msg: '<b>Arctic Falls Spring Water</b> 86 of 98 lines submitted via BAPI', value: '$1,111,000' },
  { time: '9:12 AM', type: 'failed', typeLabel: 'FAILED', msg: '<b>JJ Keller</b> F5 201 — period not open. 15/15 matched. Queued for auto-retry.', value: '$67,200' },
  { time: '9:04 AM', type: 'posted', typeLabel: 'POSTED', msg: '<b>Federal Express</b> 3 parked lines unparked — GR 4900000310 posted 7:58 AM', doc: 'Doc 5100000346', value: '$94,200' },
  { time: '8:48 AM', type: 'queued', typeLabel: 'SUBMITTED', msg: '<b>JJ Keller</b> 15 lines submitted via BAPI_INCOMINGINVOICE_CREATE' },
  { time: '8:45 AM', type: 'parked', typeLabel: 'PARKED', msg: '<b>US Bottlers Machinery</b> 4 variance lines parked, routed to buyer Martinez', doc: 'P-5100000351', value: '$52,200' },
  { time: '8:40 AM', type: 'auto', typeLabel: 'AUTO-POST', msg: '<b>Cintas</b> Non-PO, AI coded GL 62100 / CC 4200. Trust ≥95%', doc: 'Doc 5100000345', value: '$1,850' },
  { time: '8:35 AM', type: 'posted', typeLabel: 'POSTED', msg: '<b>ADP</b> 24 lines, 0.2% KONV within tolerance', doc: 'Doc 5100000344', value: '$342,600' },
  { time: '8:22 AM', type: 'posted', typeLabel: 'POSTED', msg: '<b>Johnson Controls</b> 5 lines exact match', doc: 'Doc 5100000343', value: '$45,600' },
  { time: '8:18 AM', type: 'auto', typeLabel: 'AUTO-POST', msg: '<b>Nvenia LLC</b> 3 lines, trust 99.1%', doc: 'Doc 5100000342', value: '$18,200' },
  { time: '8:15 AM', type: 'auto', typeLabel: 'AUTO-POST', msg: '<b>Krones Inc</b> 6 lines, trust 98.2%', doc: 'Doc 5100000341', value: '$128,400' },
  { time: '7:58 AM', type: 'gr', typeLabel: 'GR DETECTED', msg: 'Movement 101 for <b>Federal Express</b> PO 3900051300 → 3 parked lines now eligible for posting' },
  { time: '6:00 AM', type: 'ingest', typeLabel: 'INGESTION', msg: '<b>61 invoices</b> received (34 email, 18 EDI, 9 portal). OCR + AI verification started.' },
];

// ─── Error Guide (6 cards) ───
export const errorGuide = [
  { code: 'F5 201', title: 'Period Not Open', sap: 'Company code XXXX: Posting period MMM YYYY is not open', human: 'Fiscal period hasn\'t been opened in OB52. System issue, not invoice error.', action: '→ Hold + Auto-retry · Notify Finance' },
  { code: 'M8 889', title: 'Tolerance Exceeded', sap: 'Variance exceeds tolerance limits for company code', human: 'Invoice amount exceeds configured tolerance vs PO/GR.', action: '→ Re-check in Workbench · Route to Buyer if PO wrong' },
  { code: 'F5 312', title: 'Document Locked', sap: 'Document is locked by another user', human: 'Another SAP session has the document open.', action: '→ Auto-retry in 60s · Usually self-resolves' },
  { code: 'M7 147', title: 'GR Quantity Differs', sap: 'GR quantity has been changed since verification', human: 'Someone modified the GR after you reviewed the invoice.', action: '→ Re-open in Workbench · AI will re-verify' },
  { code: 'FK 087', title: 'Vendor Blocked', sap: 'Payment block is set for vendor XXXXXXX', human: 'Vendor has an active payment block in master data.', action: '→ Escalate to AP Manager · Do NOT retry' },
  { code: 'F5 001', title: 'Already Entered', sap: 'Invoice XXXXXXX already entered for vendor', human: 'This exact invoice reference was already posted.', action: '→ Reject as duplicate · Log for audit' },
];
