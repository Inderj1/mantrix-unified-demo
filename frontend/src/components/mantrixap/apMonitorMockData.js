/**
 * AP Monitor — Mock Data
 * Data for the SAP Monitor component (6 tabs)
 * Matches the spec in documents/MANTRIX_SAP_Monitor.html
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
    id: 1, status: 'POSTED', sapDoc: '5105002341', fy: '2026', postDate: '02/08',
    vendor: 'Safran Electronics', vendorCode: '0000198450', lines: 6,
    invoiceRef: 'INV-2026-4501', poNumber: '4500087200',
    poValue: 128400, invValue: 128400, variance: '$0 (0%)', varianceClass: 'ok',
    grRef: '5000441200', paymentDue: 'Mar 05', paymentNote: '2%', paymentClass: 'disc',
    postedAt: '8:15 AM', auto: true, speed: '2.1s',
    matchDetail: {
      invoice: { value: '$128,400', ref: 'INV-2026-4501', lines: 6, date: 'Feb 3, 2026' },
      po: { value: '$128,400', ref: 'PO 4500087200', items: 6, date: 'Oct 15, 2025' },
      gr: { value: '$128,400', ref: 'GR 5000441200', items: 6, date: 'Jan 28, 2026' },
      confirmText: '✓ INVOICE = PO = GR → 3-Way Match Confirmed → MIRO Doc 5105002341',
      lineItems: [
        { line: 10, material: 'INU-4000', desc: 'Inertial Nav Unit', poQty: '2 EA', grQty: '2 EA', invQty: '2 EA', poPrice: '$34,200', invPrice: '$34,200' },
        { line: 20, material: 'RLG-580', desc: 'Ring Laser Gyro', poQty: '4 EA', grQty: '4 EA', invQty: '4 EA', poPrice: '$12,600', invPrice: '$12,600' },
        { line: 30, material: 'NAV-900', desc: 'Navigation Computer', poQty: '2 EA', grQty: '2 EA', invQty: '2 EA', poPrice: '$18,400', invPrice: '$18,400' },
        { line: 40, material: 'SU-200', desc: 'AHRS Sensor Unit', poQty: '6 EA', grQty: '6 EA', invQty: '6 EA', poPrice: '$4,200', invPrice: '$4,200' },
        { line: 50, material: 'GA-100', desc: 'GPS Antenna Module', poQty: '8 EA', grQty: '8 EA', invQty: '8 EA', poPrice: '$1,800', invPrice: '$1,800' },
        { line: 60, material: 'ITK-50', desc: 'Integration Test Kit', poQty: '2 EA', grQty: '2 EA', invQty: '2 EA', poPrice: '$2,100', invPrice: '$2,100' },
      ],
    },
  },
  {
    id: 2, status: 'POSTED', sapDoc: '5105002342', fy: '2026', postDate: '02/08',
    vendor: 'TE Connectivity', vendorCode: '0000187600', lines: 3,
    invoiceRef: 'INV-2026-4502', poNumber: '4500087215',
    poValue: 18200, invValue: 18200, variance: '$0 (0%)', varianceClass: 'ok',
    grRef: '5000441250', paymentDue: 'Mar 06', paymentNote: '', paymentClass: 'norm',
    postedAt: '8:18 AM', auto: true, speed: '1.8s',
    matchDetail: {
      invoice: { value: '$18,200', ref: 'INV-2026-4502', lines: 3, date: 'Feb 4, 2026' },
      po: { value: '$18,200', ref: 'PO 4500087215', items: 3, date: 'Nov 10, 2025' },
      gr: { value: '$18,200', ref: 'GR 5000441250', items: 3, date: 'Jan 30, 2026' },
      confirmText: '✓ INVOICE = PO = GR → 3-Way Match Confirmed → MIRO Doc 5105002342',
      lineItems: [
        { line: 10, material: 'CON-HV200', desc: 'HV Power Connector', poQty: '50 EA', grQty: '50 EA', invQty: '50 EA', poPrice: '$8,500', invPrice: '$8,500' },
        { line: 20, material: 'CON-SIG48', desc: 'Signal Connector 48-pin', poQty: '100 EA', grQty: '100 EA', invQty: '100 EA', poPrice: '$5,200', invPrice: '$5,200' },
        { line: 30, material: 'CON-FO12', desc: 'Fiber Optic Connector', poQty: '30 EA', grQty: '30 EA', invQty: '30 EA', poPrice: '$4,500', invPrice: '$4,500' },
      ],
    },
  },
  {
    id: 3, status: 'POSTED', sapDoc: '5105002343', fy: '2026', postDate: '02/08',
    vendor: 'Curtiss-Wright', vendorCode: '0000195400', lines: 5,
    invoiceRef: 'INV-2026-4507', poNumber: '4500087195',
    poValue: 45600, invValue: 45600, variance: '$0 (0%)', varianceClass: 'ok',
    grRef: '5000441220', paymentDue: 'Mar 10', paymentNote: '', paymentClass: 'norm',
    postedAt: '8:22 AM', auto: false, speed: '2.4s',
    matchDetail: {
      invoice: { value: '$45,600', ref: 'INV-2026-4507', lines: 5, date: 'Feb 2, 2026' },
      po: { value: '$45,600', ref: 'PO 4500087195', items: 5, date: 'Sep 22, 2025' },
      gr: { value: '$45,600', ref: 'GR 5000441220', items: 5, date: 'Jan 25, 2026' },
      confirmText: '✓ INVOICE = PO = GR → 3-Way Match Confirmed → MIRO Doc 5105002343',
      lineItems: [
        { line: 10, material: 'DPM-400', desc: 'Data Processing Module', poQty: '2 EA', grQty: '2 EA', invQty: '2 EA', poPrice: '$12,400', invPrice: '$12,400' },
        { line: 20, material: 'PSU-750', desc: 'Power Supply Unit 750W', poQty: '4 EA', grQty: '4 EA', invQty: '4 EA', poPrice: '$3,600', invPrice: '$3,600' },
        { line: 30, material: 'VME-64X', desc: 'VME64x Carrier Board', poQty: '3 EA', grQty: '3 EA', invQty: '3 EA', poPrice: '$2,800', invPrice: '$2,800' },
        { line: 40, material: 'FAN-220', desc: 'Cooling Fan Assembly', poQty: '6 EA', grQty: '6 EA', invQty: '6 EA', poPrice: '$1,200', invPrice: '$1,200' },
        { line: 50, material: 'CHK-100', desc: 'Chassis Kit MIL-STD', poQty: '1 EA', grQty: '1 EA', invQty: '1 EA', poPrice: '$2,000', invPrice: '$2,000' },
      ],
    },
  },
  {
    id: 4, status: 'POSTED', sapDoc: '5105002344', fy: '2026', postDate: '02/08',
    vendor: 'Mercury Systems', vendorCode: '0000203100', lines: 24,
    invoiceRef: 'INV-2026-4503', poNumber: '4500087180',
    poValue: 343285, invValue: 342600, variance: '-$685 (0.2%)', varianceClass: 'ok',
    grRef: '5000441260', paymentDue: 'Mar 18', paymentNote: '', paymentClass: 'norm',
    postedAt: '8:35 AM', auto: false, speed: '3.1s',
    matchDetail: {
      invoice: { value: '$342,600', ref: 'INV-2026-4503', lines: 24, date: 'Feb 1, 2026' },
      po: { value: '$343,285', ref: 'PO 4500087180', items: 24, date: 'Aug 15, 2025' },
      gr: { value: '$342,600', ref: 'GR 5000441260', items: 24, date: 'Jan 20, 2026' },
      confirmText: '✓ INVOICE ≈ PO (−$685, 0.2% within tolerance) = GR → MIRO Doc 5105002344',
      lineItems: [
        { line: 10, material: 'GPU-5000', desc: 'GPGPU Processing Board', poQty: '4 EA', grQty: '4 EA', invQty: '4 EA', poPrice: '$48,200', invPrice: '$48,000' },
        { line: 20, material: 'SBC-420', desc: 'Single Board Computer', poQty: '8 EA', grQty: '8 EA', invQty: '8 EA', poPrice: '$12,600', invPrice: '$12,600' },
        { line: 30, material: 'MEM-DDR5', desc: 'DDR5 ECC Memory 64GB', poQty: '16 EA', grQty: '16 EA', invQty: '16 EA', poPrice: '$4,200', invPrice: '$4,200' },
        { line: 40, material: 'SSD-NVM2', desc: 'NVMe SSD 2TB MIL', poQty: '8 EA', grQty: '8 EA', invQty: '8 EA', poPrice: '$3,800', invPrice: '$3,800' },
        { line: 50, material: 'NET-10G', desc: '10GbE Network Card', poQty: '4 EA', grQty: '4 EA', invQty: '4 EA', poPrice: '$2,100', invPrice: '$2,100' },
        { line: 60, material: 'BPL-900', desc: 'Backplane Assembly', poQty: '2 EA', grQty: '2 EA', invQty: '2 EA', poPrice: '$6,400', invPrice: '$6,400' },
      ],
    },
  },
  {
    id: 5, status: 'POSTED', sapDoc: '5105002345', fy: '2026', postDate: '02/08',
    vendor: 'Cintas Corporation', vendorCode: '0000142800', lines: 1, vendorNote: 'Non-PO',
    invoiceRef: 'INV-2026-4509', poNumber: '— Non-PO',
    poValue: null, invValue: 1850, variance: '—', varianceClass: 'na',
    grRef: '— No GR', paymentDue: 'Mar 03', paymentNote: '', paymentClass: 'norm',
    postedAt: '8:40 AM', auto: true, speed: '1.6s',
    matchDetail: {
      invoice: { value: '$1,850', ref: 'INV-2026-4509', lines: 1, date: 'Feb 5, 2026' },
      po: { value: '— N/A', ref: 'Non-PO Invoice', items: 0, date: '—' },
      gr: { value: '— N/A', ref: 'No GR Required', items: 0, date: '—' },
      confirmText: '✓ Non-PO Auto-Coded: GL 62100 / CC 4200 · AI Trust 95.8% → MIRO Doc 5105002345',
      lineItems: [
        { line: 10, material: 'SVC-UNI', desc: 'Uniform Service — Monthly', poQty: '—', grQty: '—', invQty: '1 EA', poPrice: '—', invPrice: '$1,850' },
      ],
    },
  },
  {
    id: 6, status: 'POSTED', sapDoc: '5105002346', fy: '2026', postDate: '02/08',
    vendor: 'Honeywell Aerospace', vendorCode: '0000188900', lines: 3, vendorNote: 'Was parked',
    invoiceRef: 'INV-2026-4480', poNumber: '4500087160',
    poValue: 94200, invValue: 94200, variance: '$0 (0%)', varianceClass: 'ok',
    grRef: '5000441310', paymentDue: 'Feb 20', paymentNote: '⚠', paymentClass: 'soon',
    postedAt: '9:04 AM', auto: false, speed: '2.8s · Unparked',
    matchDetail: {
      invoice: { value: '$94,200', ref: 'INV-2026-4480', lines: 3, date: 'Jan 28, 2026' },
      po: { value: '$94,200', ref: 'PO 4500087160', items: 3, date: 'Oct 5, 2025' },
      gr: { value: '$94,200', ref: 'GR 5000441310', items: 3, date: 'Feb 8, 2026' },
      confirmText: '✓ INVOICE = PO = GR → 3-Way Match Confirmed (Unparked) → MIRO Doc 5105002346',
      lineItems: [
        { line: 10, material: 'APU-131', desc: 'Auxiliary Power Unit', poQty: '1 EA', grQty: '1 EA', invQty: '1 EA', poPrice: '$68,400', invPrice: '$68,400' },
        { line: 20, material: 'ECS-300', desc: 'Environmental Control System', poQty: '1 EA', grQty: '1 EA', invQty: '1 EA', poPrice: '$18,600', invPrice: '$18,600' },
        { line: 30, material: 'VLV-PKT', desc: 'Valve Packet Assembly', poQty: '2 EA', grQty: '2 EA', invQty: '2 EA', poPrice: '$3,600', invPrice: '$3,600' },
      ],
    },
  },
];

// ─── Queued Tab (2 rows, 8 columns) ───
export const queuedRows = [
  {
    id: 1, status: 'QUEUED', sapDoc: 'Pending...', vendor: 'BAE Systems',
    vendorSub: '38 of 42 lines', invoiceRef: 'INV-2026-4504', poNumber: '4500087190',
    value: 515600, lines: 38, submitted: '9:15 AM · 2s ago',
  },
  {
    id: 2, status: 'QUEUED', sapDoc: 'Pending...', vendor: 'Leonardo DRS',
    vendorSub: '86 of 98 lines', invoiceRef: 'INV-2026-4506', poNumber: '4500087220',
    value: 1111000, lines: 86, submitted: '9:14 AM · 3s ago',
  },
];

// ─── Parked Tab (4 rows, 9 columns) ───
export const parkedRows = [
  {
    id: 1, status: 'PARKED', parkDoc: 'P-5105002350', vendor: 'Leonardo DRS',
    vendorSub: '5 lines · GR pending', invoiceRef: 'INV-2026-4498', poNumber: '4500087220',
    value: 87400, lines: 5, reason: 'Hold — GR overdue 2d',
    owner: 'Time', ownerIcon: '⏸', ownerColor: 'slate',
  },
  {
    id: 2, status: 'PARKED', parkDoc: 'P-5105002351', vendor: 'BAE Systems',
    vendorSub: '4 lines · price var', invoiceRef: 'INV-2026-4504', poNumber: '4500087190',
    value: 52200, lines: 4, reason: 'Price +6.2%',
    owner: 'Buyer', ownerIcon: '→', ownerColor: 'blue',
  },
  {
    id: 3, status: 'PARKED', parkDoc: 'P-5105002352', vendor: 'L3Harris',
    vendorSub: '2 lines · qty mismatch', invoiceRef: 'INV-2026-4505', poNumber: '4500087205',
    value: 18600, lines: 2, reason: 'Qty: 24 vs GR 18',
    owner: 'GR/Ops', ownerIcon: '🏭', ownerColor: 'amber',
  },
  {
    id: 4, status: 'PARKED', parkDoc: 'P-5105002353', vendor: 'Kaman Aerospace',
    vendorSub: '1 line · exp vs cap', invoiceRef: 'INV-2026-4513', poNumber: '— Non-PO',
    value: 8400, lines: 1, reason: 'Expense vs Capital',
    owner: 'Controller', ownerIcon: '↑', ownerColor: 'purple',
  },
];

// ─── Failed Tab (1 detail card) ───
export const failedDetail = {
  vendor: 'Amphenol Aerospace',
  invoiceRef: 'INV-2026-4510',
  lines: 15,
  value: 67200,
  failedAt: '9:12 AM',
  error: 'SAP Error F5 201 — Company code 1000: Posting period 002 2026 is not open',
  translation: 'Posting period February 2026 has not been opened in SAP (transaction OB52). This is a system configuration issue, not an invoice error. All 15 lines matched perfectly with GR 5000441290 and PO 4500087210.',
  aiAssessment: '3rd invoice blocked by period closure today. Finance team likely needs to run period-open job. Similar delay occurred Feb 1 (resolved by 10:00 AM). Expected resolution: within 2 hours. Invoice will post with zero changes once period opens.',
  po: '4500087210',
  gr: '5000441290',
  matchCount: '15/15 ✓',
  actions: [
    { label: '⏸ Hold + Auto-Retry', primary: true, toast: '⏸ Held — auto-retry when period opens' },
    { label: 'Notify Finance', primary: false, toast: '📧 Finance team notified' },
    { label: 'Escalate', primary: false, toast: '↑ Escalated' },
  ],
};

// ─── Activity Log (13 entries) ───
export const activityLog = [
  { time: '9:15 AM', type: 'queued', typeLabel: 'QUEUED', msg: '<b>BAE Systems</b> 38 of 42 lines submitted via BAPI_INCOMINGINVOICE_CREATE', value: '$515,600' },
  { time: '9:14 AM', type: 'queued', typeLabel: 'QUEUED', msg: '<b>Leonardo DRS</b> 86 of 98 lines submitted via BAPI', value: '$1,111,000' },
  { time: '9:12 AM', type: 'failed', typeLabel: 'FAILED', msg: '<b>Amphenol</b> F5 201 — period not open. 15/15 matched. Queued for auto-retry.', value: '$67,200' },
  { time: '9:04 AM', type: 'posted', typeLabel: 'POSTED', msg: '<b>Honeywell</b> 3 parked lines unparked — GR 5000441310 posted 7:58 AM', doc: 'Doc 5105002346', value: '$94,200' },
  { time: '8:48 AM', type: 'queued', typeLabel: 'SUBMITTED', msg: '<b>Amphenol</b> 15 lines submitted via BAPI_INCOMINGINVOICE_CREATE' },
  { time: '8:45 AM', type: 'parked', typeLabel: 'PARKED', msg: '<b>BAE Systems</b> 4 variance lines parked, routed to buyer Dupont', doc: 'P-5105002351', value: '$52,200' },
  { time: '8:40 AM', type: 'auto', typeLabel: 'AUTO-POST', msg: '<b>Cintas</b> Non-PO, AI coded GL 62100 / CC 4200. Trust ≥95%', doc: 'Doc 5105002345', value: '$1,850' },
  { time: '8:35 AM', type: 'posted', typeLabel: 'POSTED', msg: '<b>Mercury Systems</b> 24 lines, 0.2% KONV within tolerance', doc: 'Doc 5105002344', value: '$342,600' },
  { time: '8:22 AM', type: 'posted', typeLabel: 'POSTED', msg: '<b>Curtiss-Wright</b> 5 lines exact match', doc: 'Doc 5105002343', value: '$45,600' },
  { time: '8:18 AM', type: 'auto', typeLabel: 'AUTO-POST', msg: '<b>TE Connectivity</b> 3 lines, trust 99.1%', doc: 'Doc 5105002342', value: '$18,200' },
  { time: '8:15 AM', type: 'auto', typeLabel: 'AUTO-POST', msg: '<b>Safran</b> 6 lines, trust 98.2%', doc: 'Doc 5105002341', value: '$128,400' },
  { time: '7:58 AM', type: 'gr', typeLabel: 'GR DETECTED', msg: 'Movement 101 for <b>Honeywell</b> PO 4500087160 → 3 parked lines now eligible for posting' },
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
