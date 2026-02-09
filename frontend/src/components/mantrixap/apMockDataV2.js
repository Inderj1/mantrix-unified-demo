/**
 * MANTRIX AP V2 — Mock Data for Inbox / Workbench / My Work
 * Aligned to MANTRIX_AP_MVP.html spec
 */

// ============ INBOX — KPIs ============

export const inboxKPIs = [
  { value: 61, label: 'Total Today', color: null },
  { value: 46, label: 'Ready', color: '#059669' },
  { value: 9, label: 'Review', color: '#d97706' },
  { value: 4, label: 'Exception', color: '#dc2626' },
  { value: 2, label: 'Processing', color: '#94a3b8' },
];

// ============ INBOX — CHANNEL STRIP ============

export const inboxChannels = [
  { id: 'all', label: 'All Channels', count: 61, value: '$2.85M', pct: null, breakdown: { ready: 46, review: 9, exception: 4 }, desc: null },
  { id: 'email', label: 'Email / OCR', count: 34, value: '$1.68M', pct: '56%', breakdown: { ready: 26, review: 5, exception: 3 }, desc: 'Scanned PDF · email attach · AP mailbox' },
  { id: 'edi', label: 'EDI / IDOC', count: 18, value: '$892K', pct: '29%', breakdown: { ready: 16, review: 1, exception: 1 }, desc: 'EDI 810 · IDOC INVOIC02 · direct feed' },
  { id: 'portal', label: 'Supplier Portal', count: 9, value: '$286K', pct: '15%', breakdown: { ready: 4, review: 3, exception: 2 }, desc: 'Ariba · Coupa · self-service' },
];

// ============ INBOX — INVOICE ROWS ============

export const inboxInvoices = [
  // PO-Based
  { id: 'safran', type: 'po', vendor: 'Safran Electronics & Defense', invoiceNum: 'INV-2026-4501', poRef: 'PO 4500087200', channel: 'edi', amount: 128400, confidence: 96, lineCount: 6, status: 'ready', statusDetail: null, summary: '6/6 exact · Auto-post' },
  { id: 'bae', type: 'po', vendor: 'BAE Systems Electronic Systems', invoiceNum: 'INV-2026-4504', poRef: 'PO 4500087190', channel: 'email', amount: 573300, confidence: 82, lineCount: 44, status: 'review', statusDetail: null, summary: '38 PO ok · 4 price · 2 GL lines' },
  { id: 'l3harris', type: 'po', vendor: 'L3Harris Technologies', invoiceNum: 'INV-2026-4505', poRef: 'PO 4500087205', channel: 'email', amount: 91800, confidence: 78, lineCount: 9, status: 'review', statusDetail: null, summary: '6 PO ok · 2 GR · 1 GL freight' },
  { id: 'te', type: 'po', vendor: 'TE Connectivity Aerospace', invoiceNum: 'INV-2026-4502', poRef: 'PO 4500087215', channel: 'portal', amount: 18200, confidence: 98, lineCount: 3, status: 'ready', statusDetail: null, summary: '3/3 exact' },
  { id: 'raytheon', type: 'po', vendor: 'Raytheon Intelligence & Space', invoiceNum: 'INV-2026-4514', poRef: 'PO 4500087230', channel: 'email', amount: 194800, confidence: 22, lineCount: 6, status: 'exception', statusDetail: 'DUPLICATE', summary: '⚠ DUPLICATE' },
  { id: 'elbit', type: 'po', vendor: 'Elbit Systems of America', invoiceNum: 'INV-2026-4515', poRef: 'PO 4500087240', channel: 'portal', amount: 86400, confidence: 31, lineCount: 4, status: 'exception', statusDetail: 'Wrong entity', summary: 'Wrong entity' },
  { id: 'collins', type: 'po', vendor: 'Collins Aerospace', invoiceNum: null, poRef: null, channel: 'edi', amount: null, confidence: 65, lineCount: null, status: 'processing', statusDetail: 'Arrived 8:01 AM', summary: 'Matching...' },
  // Non-PO
  { id: 'cintas', type: 'nonpo', vendor: 'Cintas Corporation', invoiceNum: 'INV-2026-4509', poRef: null, channel: 'email', amount: 1850, confidence: 95, lineCount: 1, status: 'ready', statusDetail: null, summary: 'AI coded GL 62100 · Auto-post' },
  { id: 'grainger', type: 'nonpo', vendor: 'W.W. Grainger Inc.', invoiceNum: 'INV-2026-4508', poRef: null, channel: 'email', amount: 3240, confidence: 85, lineCount: 12, status: 'review', statusDetail: null, summary: '10/12 · 2 GL review' },
  { id: 'kaman', type: 'nonpo', vendor: 'Kaman Aerospace Services', invoiceNum: 'INV-2026-4513', poRef: null, channel: 'portal', amount: 22400, confidence: 80, lineCount: 3, status: 'review', statusDetail: null, summary: '2/3 · expense vs capital?' },
];

// ============ WORKBENCH — FULL INVOICE DATA ============

export const workbenchData = {
  safran: {
    vendor: 'Safran Electronics & Defense',
    meta: 'INV-2026-4501 · PO 4500087200 · 6 lines · ICS: 96',
    amount: '$128,400.00',
    channel: 'edi',
    isNonPO: false,
    evidence: [
      { label: 'Vendor #', value: '0000198450', ok: true },
      { label: 'Vendor', value: 'Safran Electronics', ok: true },
      { label: 'Currency', value: 'USD', ok: true },
      { label: 'Tax', value: 'V1 — 8.25%', ok: true },
      { label: 'Company', value: '1000 — Thales DSI', ok: true },
      { label: 'Channel', value: 'EDI 810 — structured', ok: true },
    ],
    headerFields: [
      { label: 'PO Number', value: '4500087200' },
      { label: 'Invoice Date', value: '02/03/2026' },
      { label: 'Invoice #', value: 'INV-2026-4501' },
      { label: 'Amount', value: '128,400.00' },
      { label: 'Terms', value: 'NET 30' },
      { label: 'Vendor #', value: '0000198450', locked: true },
    ],
    verdicts: [
      { status: 'ok', text: '✔ 6/6 exact · GR Jan 28' },
      { status: 'ok', text: '✔ Trust 98.2% · no GL lines' },
    ],
    lines: [
      { desc: 'Inertial Nav Unit INU-4000', lineType: 'po', col2: '4500087200', col3: '10', col4: 'INU-4000', qty: 2, uom: 'EA', price: '34,200.00', amount: '68,400.00', tax: 'V1', grOrConf: '5000441200', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-88401', delNote: 'DN-2026-0180' },
      { desc: 'Ring Laser Gyro RLG-580', lineType: 'po', col2: '4500087200', col3: '20', col4: 'RLG-580', qty: 4, uom: 'EA', price: '12,600.00', amount: '50,400.00', tax: 'V1', grOrConf: '5000441200', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-88401', delNote: 'DN-2026-0180' },
      { desc: 'Nav Computer NAV-900', lineType: 'po', col2: '4500087200', col3: '30', col4: 'NAV-900', qty: 2, uom: 'EA', price: '18,400.00', amount: '36,800.00', tax: 'V1', grOrConf: '5000441200', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-88401', delNote: 'DN-2026-0180' },
      { desc: 'AHRS Sensor SU-200', lineType: 'po', col2: '4500087200', col3: '40', col4: 'SU-200', qty: 6, uom: 'EA', price: '4,200.00', amount: '25,200.00', tax: 'V1', grOrConf: '5000441201', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-88402', delNote: 'DN-2026-0181' },
      { desc: 'GPS Antenna GA-100', lineType: 'po', col2: '4500087200', col3: '50', col4: 'GA-100', qty: 8, uom: 'EA', price: '1,800.00', amount: '14,400.00', tax: 'V1', grOrConf: '5000441201', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-88402', delNote: 'DN-2026-0181' },
      { desc: 'Integ Test Kit ITK-50', lineType: 'po', col2: '4500087200', col3: '60', col4: 'ITK-50', qty: 2, uom: 'EA', price: '2,100.00', amount: '4,200.00', tax: 'V1', grOrConf: '5000441201', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-88402', delNote: 'DN-2026-0181' },
    ],
    rootCause: null,
    timeline: [1, 1, 2, 0, 1, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', 'Approval', 'Ready', 'Posted'],
    approval: { needed: false, reason: 'PO match · trust 98.2%' },
    submit: { label: 'Submit to SAP', variant: 'go' },
    actions: [],
    reasonOptions: null,
    aiRec: 'All 6 exact. 2 shipments (BOL-88401/02). Auto-post.',
    bapiInfo: 'BAPI_INCOMINGINVOICE_CREATE\n6 PO items · $128,400 · 2 GR refs',
  },

  bae: {
    vendor: 'BAE Systems Electronic Systems',
    meta: 'INV-2026-4504 · PO 4500087190 · 44 lines (42 PO + 2 GL) · ICS: 82',
    amount: '$573,300.00',
    channel: 'email',
    isNonPO: false,
    evidence: [
      { label: 'Vendor #', value: '0000201340', ok: true },
      { label: 'Currency', value: 'USD', ok: true },
      { label: 'Company', value: '1000', ok: true },
      { label: 'Channel', value: 'Email — OCR extracted', ok: true },
    ],
    headerFields: [
      { label: 'PO Number', value: '4500087190' },
      { label: 'Invoice Date', value: '02/01/2026' },
      { label: 'Invoice #', value: 'INV-2026-4504' },
      { label: 'Amount', value: '573,300.00' },
      { label: 'Terms', value: 'NET 60' },
      { label: 'Vendor #', value: '0000201340', locked: true },
    ],
    verdicts: [
      { status: 'ok', text: '✔ 38 PO lines exact' },
      { status: 'warning', text: '⚠ 4 PO lines — price +6.2%' },
      { status: 'info', text: '🟣 2 GL lines — freight + handling, need CC assignment' },
    ],
    lines: [
      { desc: 'Threat Warning TWC-200', lineType: 'po', col2: '4500087190', col3: '10', col4: 'TWC-200', qty: 3, uom: 'EA', price: '42,000.00', amount: '126,000.00', tax: 'V1', grOrConf: '5000441210', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-91200', delNote: 'DN-2026-0195' },
      { desc: 'Countermeasure CMD-400', lineType: 'po', col2: '4500087190', col3: '20', col4: 'CMD-400', qty: 6, uom: 'EA', price: '18,400.00', amount: '110,400.00', tax: 'V1', grOrConf: '5000441210', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-91200', delNote: 'DN-2026-0195' },
      { desc: 'IR Jammer IJM-300', lineType: 'po', col2: '4500087190', col3: '30', col4: 'IJM-300', qty: 4, uom: 'EA', price: '28,600.00', amount: '114,400.00', tax: 'V1', grOrConf: '5000441210', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-91201', delNote: 'DN-2026-0196' },
      { desc: 'RF Exciter RFX-100', lineType: 'po', col2: '4500087190', col3: '35', col4: 'RFX-100', qty: 2, uom: 'EA', price: '13,170.00', amount: '26,340.00', tax: 'V1', grOrConf: '5000441211', matchLabel: '+6.2%', matchStatus: 'warning', bol: 'BOL-91201', delNote: 'DN-2026-0196' },
      { desc: 'Power Amp PAM-60', lineType: 'po', col2: '4500087190', col3: '38', col4: 'PAM-60', qty: 3, uom: 'EA', price: '8,600.00', amount: '25,800.00', tax: 'V1', grOrConf: '5000441211', matchLabel: '+6.2%', matchStatus: 'warning', bol: 'BOL-91201', delNote: 'DN-2026-0196' },
      { desc: 'Freight — Hazmat Air Shipment', lineType: 'gl', col2: '65000', col3: '4200', col4: 'PC-1100', qty: 1, uom: 'LOT', price: '3,860.00', amount: '3,860.00', tax: 'V0', grOrConf: 'AI 88%', matchLabel: 'AI Coded', matchStatus: 'ok', bol: '—', delNote: '—' },
      { desc: 'Handling — Export Crating', lineType: 'gl', col2: '65200', col3: '4200', col4: 'PC-1100', qty: 1, uom: 'LOT', price: '1,640.00', amount: '1,640.00', tax: 'V0', grOrConf: 'AI 82%', matchLabel: 'AI 82%', matchStatus: 'warning', bol: '—', delNote: '—' },
    ],
    rootCause: {
      pattern: 'BAE 22% variance on EW parts.',
      background: 'PO rev 03 not yet in EKPO. Freight/handling not on PO — standard for BAE hazmat.',
      prediction: 'PO amend 48h. GL lines need CC owner sign-off.',
      recommendation: 'Post 38 PO clean. Route 4 → buyer. GL lines → approval.',
    },
    timeline: [1, 1, 2, 0, 0, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', 'Approval', 'Ready', 'Posted'],
    approval: { needed: true, reason: 'Price variance >5% on 4 PO lines + 2 unplanned GL lines.', who: 'J.M. Dupont (Buyer) + P. Moreau (CC Owner)' },
    submit: { label: 'Submit 38 PO + 1 GL for Approval', variant: 'approval' },
    actions: [
      { label: 'Route 4 Price → Buyer Dupont', variant: 'buyer', icon: 'route' },
    ],
    reasonOptions: null,
    aiRec: '38 PO clean + 1 GL freight ok. 4 price variance → buyer. 1 GL handling at 82% → CC approval.',
    bapiInfo: 'Post 38 PO → BAPI ($515,600)\n1 GL freight → BAPI ($3,860)\nRoute 4 PO → WF ($52,200)\n1 GL handling → Approval',
  },

  l3harris: {
    vendor: 'L3Harris Technologies',
    meta: 'INV-2026-4505 · PO 4500087205 · 9 lines (8 PO + 1 GL) · ICS: 78',
    amount: '$91,800.00',
    channel: 'email',
    isNonPO: false,
    evidence: [
      { label: 'Vendor #', value: '0000199870', ok: true },
      { label: 'Currency', value: 'USD', ok: true },
      { label: 'Channel', value: 'Email — OCR', ok: true },
    ],
    headerFields: [
      { label: 'PO', value: '4500087205' },
      { label: 'Date', value: '02/02/2026' },
      { label: 'Inv #', value: 'INV-2026-4505' },
      { label: 'Amount', value: '91,800.00' },
      { label: 'Terms', value: 'NET 45' },
      { label: 'Vendor #', value: '0000199870', locked: true },
    ],
    verdicts: [
      { status: 'ok', text: '✔ 6 PO lines exact' },
      { status: 'warning', text: '⚠ 2 PO — Qty 24 vs GR 18' },
      { status: 'info', text: '🟣 1 GL — freight charge $2,500, AI coded 94%' },
    ],
    lines: [
      { desc: 'SATCOM Terminal STX-2000', lineType: 'po', col2: '4500087205', col3: '10', col4: 'STX-2000', qty: 2, uom: 'EA', price: '14,200.00', amount: '28,400.00', tax: 'V1', grOrConf: '5000441280', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-93100', delNote: 'DN-2026-0210' },
      { desc: 'Encryption Module CYZ-110', lineType: 'po', col2: '4500087205', col3: '20', col4: 'CYZ-110', qty: 10, uom: 'EA', price: '3,400.00', amount: '34,000.00', tax: 'V1', grOrConf: '5000441280', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-93100', delNote: 'DN-2026-0210' },
      { desc: 'Tactical Radio AN/PRC-163', lineType: 'po', col2: '4500087205', col3: '40', col4: 'AN/PRC-163', qty: 24, uom: 'EA', price: '4,200.00', amount: '100,800.00', tax: 'V1', grOrConf: '—', matchLabel: 'GR:18', matchStatus: 'warning', bol: 'BOL-93101', delNote: 'DN-2026-0211' },
      { desc: 'Radio Battery RBP-20', lineType: 'po', col2: '4500087205', col3: '42', col4: 'RBP-20', qty: 24, uom: 'EA', price: '1,050.00', amount: '25,200.00', tax: 'V1', grOrConf: '—', matchLabel: 'GR:18', matchStatus: 'warning', bol: 'BOL-93101', delNote: 'DN-2026-0211' },
      { desc: 'Freight — Ground LTL Bordeaux', lineType: 'gl', col2: '65000', col3: '4300', col4: 'PC-1200', qty: 1, uom: 'LOT', price: '2,500.00', amount: '2,500.00', tax: 'V0', grOrConf: 'AI 94%', matchLabel: 'AI 94%', matchStatus: 'ok', bol: '—', delNote: '—' },
    ],
    rootCause: {
      pattern: 'L3Harris partial-shipped 4×.',
      background: 'Warehouse Bordeaux. Freight charge standard — $2,500 LTL recurring.',
      prediction: 'GR for remaining 6 expected Feb 12.',
      recommendation: 'Post 6 PO + 1 GL freight. Route 2 → GR/Ops.',
    },
    timeline: [1, 1, 2, 0, 0, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', 'Approval', 'Ready', 'Posted'],
    approval: { needed: false, reason: '6 PO matched. 2 GR pending. 1 GL freight AI-coded 94%.' },
    submit: { label: 'Submit 6 PO + 1 GL to SAP', variant: 'go' },
    actions: [
      { label: 'Send 2 → GR/Ops Bordeaux', variant: 'gr', icon: 'gr' },
      { label: 'Hold — AI Watch GR', variant: 'hold', icon: 'hold' },
    ],
    reasonOptions: null,
    aiRec: 'Post 6 PO ($62,400) + 1 GL freight ($2,500). Route 2 qty mismatch — separate BOL-93101.',
    bapiInfo: 'Post 6 PO → BAPI ($62,400)\n1 GL freight → BAPI ($2,500)\nRoute 2 → GR/Ops ($126,000)',
  },

  te: {
    vendor: 'TE Connectivity Aerospace',
    meta: 'INV-2026-4502 · PO 4500087215 · 3 lines · ICS: 98',
    amount: '$18,200.00',
    channel: 'portal',
    isNonPO: false,
    evidence: [
      { label: 'Vendor #', value: '0000187600', ok: true },
      { label: 'Currency', value: 'USD', ok: true },
      { label: 'Channel', value: 'Ariba — structured XML', ok: true },
    ],
    headerFields: [
      { label: 'PO', value: '4500087215' },
      { label: 'Date', value: '02/04/2026' },
      { label: 'Inv #', value: 'INV-2026-4502' },
      { label: 'Amount', value: '18,200.00' },
      { label: 'Terms', value: 'NET 30' },
    ],
    verdicts: [
      { status: 'ok', text: '✔ 3/3 exact · 99.1%' },
    ],
    lines: [
      { desc: 'MIL-DTL-38999 Connector', lineType: 'po', col2: '4500087215', col3: '10', col4: '38999-III', qty: 200, uom: 'EA', price: '42.00', amount: '8,400.00', tax: 'V1', grOrConf: '5000441250', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-90100', delNote: 'DN-2026-0170' },
      { desc: 'Shielded Cable SCA-400', lineType: 'po', col2: '4500087215', col3: '20', col4: 'SCA-400', qty: 50, uom: 'EA', price: '124.00', amount: '6,200.00', tax: 'V1', grOrConf: '5000441250', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-90100', delNote: 'DN-2026-0170' },
      { desc: 'Backshell BS-22', lineType: 'po', col2: '4500087215', col3: '30', col4: 'BS-22', qty: 200, uom: 'EA', price: '18.00', amount: '3,600.00', tax: 'V1', grOrConf: '5000441250', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-90100', delNote: 'DN-2026-0170' },
    ],
    rootCause: null,
    timeline: [1, 1, 2, 0, 1, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', 'Approval', 'Ready', 'Posted'],
    approval: { needed: false, reason: 'Exact · trust 99.1%' },
    submit: { label: 'Submit to SAP', variant: 'go' },
    actions: [],
    reasonOptions: null,
    aiRec: 'Perfect match. Auto-post.',
    bapiInfo: 'BAPI (3 PO items · $18,200)',
  },

  raytheon: {
    vendor: 'Raytheon Intelligence & Space',
    meta: 'INV-2026-4514 · DUPLICATE · ICS: 22',
    amount: '$194,800.00',
    channel: 'email',
    isNonPO: false,
    evidence: [
      { label: 'Vendor #', value: '0000200100', ok: true },
      { label: 'DUPLICATE OF', value: 'Doc 5105002320', ok: false },
      { label: 'Channel', value: 'Email — OCR', ok: true },
    ],
    headerFields: [
      { label: 'PO', value: '4500087230', locked: true },
      { label: 'Amount', value: '194,800.00', locked: true },
      { label: 'Original', value: 'Doc 5105002320', locked: true },
    ],
    verdicts: [
      { status: 'error', text: '⚠ DUPLICATE — Feb 3' },
      { status: 'error', text: '✗ BKPF exists' },
    ],
    lines: [
      { desc: 'Radar RPU-3000', lineType: 'po', col2: '4500087230', col3: '10', col4: 'RPU-3000', qty: 2, uom: 'EA', price: '48,400.00', amount: '96,800.00', tax: 'V1', grOrConf: 'DUP', matchLabel: 'DUPLICATE', matchStatus: 'error', bol: 'BOL-94500', delNote: 'DN-2026-0220' },
      { desc: 'Signal Intel SIM-200', lineType: 'po', col2: '4500087230', col3: '20', col4: 'SIM-200', qty: 4, uom: 'EA', price: '24,500.00', amount: '98,000.00', tax: 'V1', grOrConf: 'DUP', matchLabel: 'DUPLICATE', matchStatus: 'error', bol: 'BOL-94500', delNote: 'DN-2026-0220' },
    ],
    rootCause: null,
    timeline: [1, 1, 2, 0, 0, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', '—', '—', '—'],
    approval: { needed: false, reason: 'Duplicate — rejection.' },
    submit: { label: '— Cannot Post', variant: 'disabled' },
    actions: [
      { label: 'Reject Duplicate', variant: 'reject', icon: 'reject' },
      { label: 'Escalate', variant: 'escalate', icon: 'escalate' },
    ],
    reasonOptions: ['Duplicate', 'Vendor error', 'Other'],
    aiRec: 'Confirmed duplicate. Reject.',
    bapiInfo: 'No BAPI — ZINV_AUDIT',
  },

  elbit: {
    vendor: 'Elbit Systems of America',
    meta: 'INV-2026-4515 · Wrong Entity · ICS: 31',
    amount: '$86,400.00',
    channel: 'portal',
    isNonPO: false,
    evidence: [
      { label: 'Vendor #', value: '0000208500', ok: true },
      { label: 'Bill To', value: 'Thales AVS (2000)', ok: false },
      { label: 'Should Be', value: 'Thales DSI (1000)', ok: false },
      { label: 'Channel', value: 'Portal', ok: true },
    ],
    headerFields: [
      { label: 'PO', value: '4500087240', locked: true },
      { label: 'Amount', value: '86,400.00', locked: true },
    ],
    verdicts: [
      { status: 'error', text: '✗ Wrong entity' },
      { status: 'ok', text: '✔ Lines match if rebilled' },
    ],
    lines: [
      { desc: 'Helmet Display HDU-100', lineType: 'po', col2: '4500087240', col3: '10', col4: 'HDU-100', qty: 4, uom: 'EA', price: '12,600.00', amount: '50,400.00', tax: 'V1', grOrConf: '5000441300', matchLabel: 'Wrong Co', matchStatus: 'error', bol: 'BOL-95200', delNote: 'DN-2026-0230' },
      { desc: 'Day/Night Cam DNC-40', lineType: 'po', col2: '4500087240', col3: '20', col4: 'DNC-40', qty: 2, uom: 'EA', price: '18,000.00', amount: '36,000.00', tax: 'V1', grOrConf: '5000441300', matchLabel: 'Wrong Co', matchStatus: 'error', bol: 'BOL-95200', delNote: 'DN-2026-0230' },
    ],
    rootCause: null,
    timeline: [1, 1, 2, 0, 0, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', '—', '—', '—'],
    approval: { needed: false, reason: 'Return — no approval.' },
    submit: { label: '— Cannot Post', variant: 'disabled' },
    actions: [
      { label: 'Return to Supplier', variant: 'supplier', icon: 'supplier' },
    ],
    reasonOptions: ['Wrong entity', 'Other'],
    aiRec: 'Wrong entity. Reissue to DSI.',
    bapiInfo: 'No BAPI — return',
  },

  cintas: {
    vendor: 'Cintas Corporation',
    meta: 'INV-2026-4509 · Non-PO · 1 line · ICS: 95',
    amount: '$1,850.00',
    channel: 'email',
    isNonPO: true,
    evidence: [
      { label: 'Vendor #', value: '0000142800', ok: true },
      { label: 'Vendor', value: 'Cintas', ok: true },
      { label: 'Channel', value: 'Email — OCR', ok: true },
    ],
    headerFields: [
      { label: 'Date', value: '02/01/2026' },
      { label: 'Inv #', value: 'INV-2026-4509' },
      { label: 'Amount', value: '1,850.00' },
      { label: 'Terms', value: 'NET 30' },
    ],
    verdicts: [
      { status: 'ok', text: '✔ Recurring · AI coded 98%' },
    ],
    lines: [
      { desc: 'Monthly Uniform Service Feb', lineType: 'gl', col2: '62100', col3: '4200', col4: 'PC-1100', qty: 1, uom: 'LOT', price: '1,850.00', amount: '1,850.00', tax: 'V0', grOrConf: 'AI 98%', matchLabel: 'AI 98%', matchStatus: 'ok', bol: '—', delNote: '—' },
    ],
    rootCause: null,
    timeline: [1, 1, 2, 0, 1, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', 'Approval', 'Ready', 'Posted'],
    approval: { needed: false, reason: 'Recurring · ±3%' },
    submit: { label: 'Submit to SAP', variant: 'go' },
    actions: [],
    reasonOptions: null,
    aiRec: 'Monthly Cintas. GL 62100/CC 4200. Auto-post.',
    bapiInfo: 'BAPI (1 GL item · $1,850)',
  },

  grainger: {
    vendor: 'W.W. Grainger Inc.',
    meta: 'INV-2026-4508 · Non-PO · 12 lines · ICS: 85',
    amount: '$3,240.00',
    channel: 'email',
    isNonPO: true,
    evidence: [
      { label: 'Vendor #', value: '0000156200', ok: true },
      { label: 'Vendor', value: 'Grainger', ok: true },
      { label: 'Channel', value: 'Email — OCR', ok: true },
    ],
    headerFields: [
      { label: 'Date', value: '02/05/2026' },
      { label: 'Inv #', value: 'INV-2026-4508' },
      { label: 'Amount', value: '3,240.00' },
      { label: 'Terms', value: 'NET 30' },
    ],
    verdicts: [
      { status: 'ok', text: '✔ 10/12 >90%' },
      { status: 'warning', text: '⚠ 2 LED — GL 65200 at 72%' },
    ],
    lines: [
      { desc: 'Safety Gloves Nitrile', lineType: 'gl', col2: '63100', col3: '4200', col4: 'PC-1100', qty: 10, uom: 'CS', price: '48.00', amount: '480.00', tax: 'V0', grOrConf: 'AI 95%', matchLabel: 'AI 95%', matchStatus: 'ok', bol: '—', delNote: '—' },
      { desc: 'WD-40 Industrial', lineType: 'gl', col2: '63100', col3: '4200', col4: 'PC-1100', qty: 4, uom: 'GAL', price: '32.00', amount: '128.00', tax: 'V0', grOrConf: 'AI 95%', matchLabel: 'AI 95%', matchStatus: 'ok', bol: '—', delNote: '—' },
      { desc: 'LED Panel 4ft (NEW)', lineType: 'gl', col2: '65200', col3: '4200', col4: 'PC-1100', qty: 6, uom: 'EA', price: '42.00', amount: '252.00', tax: 'V0', grOrConf: 'AI 72%', matchLabel: 'AI 72%', matchStatus: 'warning', bol: '—', delNote: '—' },
      { desc: 'LED Driver (NEW)', lineType: 'gl', col2: '65200', col3: '4200', col4: 'PC-1100', qty: 6, uom: 'EA', price: '38.00', amount: '228.00', tax: 'V0', grOrConf: 'AI 72%', matchLabel: 'AI 72%', matchStatus: 'warning', bol: '—', delNote: '—' },
    ],
    rootCause: null,
    timeline: [1, 1, 2, 1, 0, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', 'Approval', 'Ready', 'Posted'],
    approval: { needed: true, reason: '2 new GL codes 72%.', who: 'P. Moreau (CC Owner)' },
    submit: { label: 'Submit for Approval', variant: 'approval' },
    actions: [],
    reasonOptions: null,
    aiRec: '10 MRO ok. 2 LED 72%. Edit→approval.',
    bapiInfo: 'BAPI (12 GL items · $3,240)',
  },

  kaman: {
    vendor: 'Kaman Aerospace Services',
    meta: 'INV-2026-4513 · Non-PO · 3 lines · ICS: 80',
    amount: '$22,400.00',
    channel: 'portal',
    isNonPO: true,
    evidence: [
      { label: 'Vendor #', value: '0000175400', ok: true },
      { label: 'Vendor', value: 'Kaman Aerospace', ok: true },
      { label: 'Channel', value: 'Portal', ok: true },
    ],
    headerFields: [
      { label: 'Date', value: '02/06/2026' },
      { label: 'Inv #', value: 'INV-2026-4513' },
      { label: 'Amount', value: '22,400.00' },
      { label: 'Terms', value: 'NET 30' },
    ],
    verdicts: [
      { status: 'ok', text: '✔ 2/3 coded >90%' },
      { status: 'warning', text: '⚠ 1 line — expense vs capital?' },
    ],
    lines: [
      { desc: 'Bearing Overhaul Service', lineType: 'gl', col2: '62400', col3: '4200', col4: 'PC-1100', qty: 1, uom: 'LOT', price: '8,400.00', amount: '8,400.00', tax: 'V0', grOrConf: 'AI 92%', matchLabel: 'AI 92%', matchStatus: 'ok', bol: '—', delNote: '—' },
      { desc: 'Seal Kit Replacement', lineType: 'gl', col2: '63100', col3: '4200', col4: 'PC-1100', qty: 4, uom: 'EA', price: '1,200.00', amount: '4,800.00', tax: 'V0', grOrConf: 'AI 91%', matchLabel: 'AI 91%', matchStatus: 'ok', bol: '—', delNote: '—' },
      { desc: 'CNC Tooling Upgrade', lineType: 'gl', col2: '21000', col3: '4200', col4: 'PC-1100', qty: 1, uom: 'LOT', price: '9,200.00', amount: '9,200.00', tax: 'V0', grOrConf: 'AI 68%', matchLabel: 'AI 68%', matchStatus: 'warning', bol: '—', delNote: '—' },
    ],
    rootCause: null,
    timeline: [1, 1, 2, 0, 0, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', 'Approval', 'Ready', 'Posted'],
    approval: { needed: true, reason: '$9,200 capital vs expense.', who: 'P. Moreau (CC Owner)' },
    submit: { label: 'Submit for Approval', variant: 'approval' },
    actions: [],
    reasonOptions: null,
    aiRec: '2 service ok. 1 tooling $9,200 may be capital (GL 21000). Review.',
    bapiInfo: 'BAPI (3 GL items · $22,400)',
  },
};

// ============ MY WORK — IN FLIGHT ============

export const myWorkInFlight = [
  { id: 1, vendor: 'Honeywell Aerospace', detail: 'GR posted 7:58 AM', amount: '$94,200', status: 'ready', statusLabel: '→ READY', actionLabel: '→ Post', actionVariant: 'ready', isNew: true, statusDetail: 'All matched' },
  { id: 2, vendor: 'Leonardo DRS', detail: 'AI monitoring GR', amount: '$87,400', status: 'hold', statusLabel: 'HOLD', actionLabel: 'Waiting', actionVariant: 'default', isNew: false, statusDetail: 'EKET 2d overdue' },
  { id: 3, vendor: 'Elbit Systems', detail: 'Wrong entity', amount: '$86,400', status: 'supplier', statusLabel: '→ SUPPLIER', actionLabel: 'Sent', actionVariant: 'default', isNew: false, statusDetail: 'Returned' },
  { id: 4, vendor: 'BAE Systems', detail: '4 lines → Dupont', amount: '$52,200', status: 'buyer', statusLabel: '→ BUYER', actionLabel: 'Pending', actionVariant: 'default', isNew: false, statusDetail: 'Routed' },
  { id: 5, vendor: 'L3Harris', detail: 'Warehouse Bordeaux', amount: '$18,600', status: 'gr', statusLabel: '→ GR/OPS', actionLabel: 'Pending', actionVariant: 'default', isNew: false, statusDetail: 'Pending GR' },
  { id: 6, vendor: 'Safran (threshold)', detail: '$210K → M. Laurent', amount: '$210,000', status: 'escalated', statusLabel: '↑ AP LEAD', actionLabel: 'Pending', actionVariant: 'default', isNew: false, statusDetail: 'Escalated' },
  { id: 7, vendor: 'Grainger Inc.', detail: 'New GL codes', amount: '$3,240', status: 'approval', statusLabel: '⏳ APPROVAL', actionLabel: 'Awaiting', actionVariant: 'default', isNew: false, statusDetail: 'P. Moreau' },
];

// ============ MY WORK — POSTED TODAY ============

export const myWorkPosted = [
  { id: 1, vendor: 'Safran Electronics', detail: '6 lines · EDI', amount: '$128,400', sapDoc: 'Doc 5105002341', time: '8:15 AM · Auto' },
  { id: 2, vendor: 'TE Connectivity', detail: '3 lines · Portal', amount: '$18,200', sapDoc: 'Doc 5105002342', time: '8:18 AM · Auto' },
  { id: 3, vendor: 'Mercury Systems', detail: '24 lines · Email', amount: '$342,600', sapDoc: 'Doc 5105002344', time: '8:35 AM' },
  { id: 4, vendor: 'Cintas Corp', detail: '1 line · Email', amount: '$1,850', sapDoc: 'Doc 5105002345', time: '8:40 AM · Auto' },
  { id: 5, vendor: 'Curtiss-Wright', detail: '5 lines · EDI', amount: '$45,600', sapDoc: 'Doc 5105002343', time: '8:22 AM' },
];

// ============ MY WORK — THREADS ============

export const myWorkThreads = [
  {
    id: 1,
    vendor: 'Elbit Systems',
    issue: 'Wrong entity',
    status: 'Awaiting',
    messages: [
      { author: 'Sarah Chen', time: '7:45 AM', avatar: 'SC', text: 'Please reissue to Thales DSI Inc., 22 Campus Dr, Parsippany NJ 07054.' },
    ],
  },
  {
    id: 2,
    vendor: 'L3Harris',
    issue: 'Qty 24→18',
    status: 'Pending',
    messages: [
      { author: 'Sarah Chen', time: 'Feb 6', avatar: 'SC', text: 'GR shows 18 EA. Confirm 6 shipped or revise.' },
    ],
  },
];
