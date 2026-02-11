/**
 * MANTRIX AP V2 — Mock Data for Inbox / Workbench / My Work
 * Aligned to MANTRIX_AP_MVP.html spec
 * Data sourced from Arizona Beverages BigQuery dataset
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
  { id: 'krones', type: 'po', vendor: 'Krones Inc', invoiceNum: 'VND-INV-004501', poRef: 'PO 3900051320', channel: 'edi', amount: 128400, confidence: 96, lineCount: 6, status: 'ready', statusDetail: null, summary: '6/6 exact · Auto-post' },
  { id: 'usbottlers', type: 'po', vendor: 'US Bottlers Machinery Co', invoiceNum: 'VND-INV-004504', poRef: 'PO 3900049229', channel: 'email', amount: 573300, confidence: 82, lineCount: 44, status: 'review', statusDetail: null, summary: '38 PO ok · 4 price · 2 GL lines' },
  { id: 'processtech', type: 'po', vendor: 'Process Tech Sales and Service', invoiceNum: 'VND-INV-004505', poRef: 'PO 3900051366', channel: 'email', amount: 91800, confidence: 78, lineCount: 9, status: 'review', statusDetail: null, summary: '6 PO ok · 2 GR · 1 GL freight' },
  { id: 'nvenia', type: 'po', vendor: 'Nvenia LLC', invoiceNum: 'VND-INV-004502', poRef: 'PO 3900051400', channel: 'portal', amount: 18200, confidence: 98, lineCount: 3, status: 'ready', statusDetail: null, summary: '3/3 exact' },
  { id: 'alliedsteel', type: 'po', vendor: 'Allied Steel Distribution', invoiceNum: 'VND-INV-004514', poRef: 'PO 3900051450', channel: 'email', amount: 194800, confidence: 22, lineCount: 6, status: 'exception', statusDetail: 'DUPLICATE', summary: '⚠ DUPLICATE' },
  { id: 'airoyal', type: 'po', vendor: 'Airoyal Company', invoiceNum: 'VND-INV-004515', poRef: 'PO 3900051480', channel: 'portal', amount: 86400, confidence: 31, lineCount: 4, status: 'exception', statusDetail: 'Wrong entity', summary: 'Wrong entity' },
  { id: 'motion', type: 'po', vendor: 'Motion Industries Inc', invoiceNum: null, poRef: null, channel: 'edi', amount: null, confidence: 65, lineCount: null, status: 'processing', statusDetail: 'Arrived 8:01 AM', summary: 'Matching...' },
  // Non-PO
  { id: 'cintas', type: 'nonpo', vendor: 'Cintas Corporation #062', invoiceNum: 'VND-INV-004509', poRef: null, channel: 'email', amount: 1850, confidence: 95, lineCount: 1, status: 'ready', statusDetail: null, summary: 'AI coded GL 62100 · Auto-post' },
  { id: 'radwell', type: 'nonpo', vendor: 'Radwell International Inc', invoiceNum: 'VND-INV-004508', poRef: null, channel: 'email', amount: 3240, confidence: 85, lineCount: 12, status: 'review', statusDetail: null, summary: '10/12 · 2 GL review' },
  { id: 'millerchitty', type: 'nonpo', vendor: 'Miller & Chitty Company Inc', invoiceNum: 'VND-INV-004513', poRef: null, channel: 'portal', amount: 22400, confidence: 80, lineCount: 3, status: 'review', statusDetail: null, summary: '2/3 · expense vs capital?' },
];

// ============ WORKBENCH — FULL INVOICE DATA ============

export const workbenchData = {
  krones: {
    pdfFile: '/invoices/VND-INV-004501.pdf',
    vendor: 'Krones Inc',
    meta: 'VND-INV-004501 · PO 3900051320 · 6 lines · ICS: 96',
    amount: '$128,400.00',
    channel: 'edi',
    isNonPO: false,
    editAll: true,
    evidence: [
      { label: 'Vendor #', value: '0001000217', ok: true },
      { label: 'Vendor', value: 'Krones Inc', ok: true },
      { label: 'Currency', value: 'USD', ok: true },
      { label: 'Tax', value: 'V1 — 8.25%', ok: true },
      { label: 'Company', value: 'ABUS — Arizona Beverages US', ok: true },
      { label: 'Channel', value: 'EDI 810 — structured', ok: true },
    ],
    headerFields: [
      { label: 'PO Number', value: '3900051320' },
      { label: 'Invoice Date', value: '02/03/2026' },
      { label: 'Invoice #', value: 'VND-INV-004501' },
      { label: 'Amount', value: '128,400.00' },
      { label: 'Terms', value: 'Z001 — Net 30' },
      { label: 'Vendor #', value: '0001000217', locked: true },
    ],
    verdicts: [
      { status: 'ok', text: '✔ 6/6 exact · GR Jan 28' },
      { status: 'ok', text: '✔ Trust 98.2% · no GL lines' },
    ],
    lines: [
      { desc: 'AZ LEMON 24PK 15OZ CAN', lineType: 'po', col2: '3900051320', col3: '10', col4: '1000910', qty: 2, uom: 'EA', price: '34,200.00', amount: '68,400.00', tax: 'V1', grOrConf: '4900000200', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-88401', delNote: 'DN-2026-0180' },
      { desc: 'AZ GREEN 24PK 15OZ CAN', lineType: 'po', col2: '3900051320', col3: '20', col4: '1000912', qty: 4, uom: 'EA', price: '12,600.00', amount: '50,400.00', tax: 'V1', grOrConf: '4900000200', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-88401', delNote: 'DN-2026-0180' },
      { desc: 'AZ PEACH 24PK 15OZ CAN', lineType: 'po', col2: '3900051320', col3: '30', col4: '1000913', qty: 2, uom: 'EA', price: '18,400.00', amount: '36,800.00', tax: 'V1', grOrConf: '4900000200', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-88401', delNote: 'DN-2026-0180' },
      { desc: 'AZ ARNOLD PALMER 24PK 15OZ CAN', lineType: 'po', col2: '3900051320', col3: '40', col4: '1000914', qty: 6, uom: 'EA', price: '4,200.00', amount: '25,200.00', tax: 'V1', grOrConf: '4900000201', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-88402', delNote: 'DN-2026-0181' },
      { desc: 'AZ HARD LEMONADE 24PK 12OZ CAN', lineType: 'po', col2: '3900051320', col3: '50', col4: '1000921', qty: 8, uom: 'EA', price: '1,800.00', amount: '14,400.00', tax: 'V1', grOrConf: '4900000201', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-88402', delNote: 'DN-2026-0181' },
      { desc: 'AZ HARD MANGO LEMONADE 24PK 12OZ CAN', lineType: 'po', col2: '3900051320', col3: '60', col4: '1000922', qty: 2, uom: 'EA', price: '2,100.00', amount: '4,200.00', tax: 'V1', grOrConf: '4900000201', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-88402', delNote: 'DN-2026-0181' },
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

  usbottlers: {
    pdfFile: '/invoices/VND-INV-004504.pdf',
    vendor: 'US Bottlers Machinery Co',
    meta: 'VND-INV-004504 · PO 3900049229 · 44 lines (42 PO + 2 GL) · ICS: 82',
    amount: '$573,300.00',
    channel: 'email',
    isNonPO: false,
    editAll: true,
    evidence: [
      { label: 'Vendor #', value: '0001000162', ok: true },
      { label: 'Currency', value: 'USD', ok: true },
      { label: 'Company', value: 'ABUS', ok: true },
      { label: 'Channel', value: 'Email — OCR extracted', ok: true },
    ],
    headerFields: [
      { label: 'PO Number', value: '3900049229' },
      { label: 'Invoice Date', value: '02/01/2026' },
      { label: 'Invoice #', value: 'VND-INV-004504' },
      { label: 'Amount', value: '573,300.00' },
      { label: 'Terms', value: 'Z003 — Net 45' },
      { label: 'Vendor #', value: '0001000162', locked: true },
    ],
    verdicts: [
      { status: 'ok', text: '✔ 38 PO lines exact' },
      { status: 'warning', text: '⚠ 4 PO lines — price +6.2%' },
      { status: 'info', text: '🟣 2 GL lines — freight + handling, need CC assignment' },
    ],
    lines: [
      { desc: 'HB ARNOLD PALMER SPIKED (4X6) 24PK 12OZ', lineType: 'po', col2: '3900049229', col3: '10', col4: '1001535', qty: 3, uom: 'EA', price: '42,000.00', amount: '126,000.00', tax: 'V1', grOrConf: '4900000210', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-91200', delNote: 'DN-2026-0195' },
      { desc: 'AZ HARD GREEN TEA 24PK 12OZ CAN SLEEK', lineType: 'po', col2: '3900049229', col3: '20', col4: '1000953', qty: 6, uom: 'EA', price: '18,400.00', amount: '110,400.00', tax: 'V1', grOrConf: '4900000210', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-91200', delNote: 'DN-2026-0195' },
      { desc: 'HB AP SPIKED STRAWBERRY 12PK 24OZ CAN', lineType: 'po', col2: '3900049229', col3: '30', col4: '1001523', qty: 4, uom: 'EA', price: '28,600.00', amount: '114,400.00', tax: 'V1', grOrConf: '4900000210', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-91201', delNote: 'DN-2026-0196' },
      { desc: 'AZ HARD LEMON TEA 24PK 12OZ CAN SLEEK', lineType: 'po', col2: '3900049229', col3: '35', col4: '1000951', qty: 2, uom: 'EA', price: '13,170.00', amount: '26,340.00', tax: 'V1', grOrConf: '4900000211', matchLabel: '+6.2%', matchStatus: 'warning', bol: 'BOL-91201', delNote: 'DN-2026-0196' },
      { desc: 'AZ GREEN TEA 12PK 8QT CANISTER MIX', lineType: 'po', col2: '3900049229', col3: '38', col4: '1001222', qty: 3, uom: 'EA', price: '8,600.00', amount: '25,800.00', tax: 'V1', grOrConf: '4900000211', matchLabel: '+6.2%', matchStatus: 'warning', bol: 'BOL-91201', delNote: 'DN-2026-0196' },
      { desc: 'Freight — Refrigerated LTL Shipment', lineType: 'gl', col2: '65000', col3: '4200', col4: 'PC-1100', qty: 1, uom: 'LOT', price: '3,860.00', amount: '3,860.00', tax: 'V0', grOrConf: 'AI 88%', matchLabel: 'AI Coded', matchStatus: 'ok', bol: '—', delNote: '—' },
      { desc: 'Handling — Palletizing & Shrink Wrap', lineType: 'gl', col2: '65200', col3: '4200', col4: 'PC-1100', qty: 1, uom: 'LOT', price: '1,640.00', amount: '1,640.00', tax: 'V0', grOrConf: 'AI 82%', matchLabel: 'AI 82%', matchStatus: 'warning', bol: '—', delNote: '—' },
    ],
    rootCause: {
      pattern: 'US Bottlers 22% variance on packaging equipment parts.',
      background: 'PO rev 03 not yet in EKPO. Freight/handling not on PO — standard for temperature-controlled shipments.',
      prediction: 'PO amend 48h. GL lines need CC owner sign-off.',
      recommendation: 'Post 38 PO clean. Route 4 → buyer. GL lines → approval.',
    },
    timeline: [1, 1, 2, 0, 0, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', 'Approval', 'Ready', 'Posted'],
    approval: { needed: true, reason: 'Price variance >5% on 4 PO lines + 2 unplanned GL lines.', who: 'J. Martinez (Buyer) + R. Torres (CC Owner)' },
    submit: { label: 'Submit 38 PO + 1 GL for Approval', variant: 'approval' },
    actions: [
      { label: 'Route 4 Price → Buyer Martinez', variant: 'buyer', icon: 'route', location: '→ Procurement' },
    ],
    reasonOptions: null,
    aiRec: '38 PO clean + 1 GL freight ok. 4 price variance → buyer. 1 GL handling at 82% → CC approval.',
    bapiInfo: 'Post 38 PO → BAPI ($515,600)\n1 GL freight → BAPI ($3,860)\nRoute 4 PO → WF ($52,200)\n1 GL handling → Approval',
  },

  processtech: {
    pdfFile: '/invoices/VND-INV-004505.pdf',
    vendor: 'Process Tech Sales and Service',
    meta: 'VND-INV-004505 · PO 3900051366 · 9 lines (8 PO + 1 GL) · ICS: 78',
    amount: '$91,800.00',
    channel: 'email',
    isNonPO: false,
    editAll: true,
    evidence: [
      { label: 'Vendor #', value: '0001000140', ok: true },
      { label: 'Currency', value: 'USD', ok: true },
      { label: 'Channel', value: 'Email — OCR', ok: true },
    ],
    headerFields: [
      { label: 'PO', value: '3900051366' },
      { label: 'Date', value: '02/02/2026' },
      { label: 'Inv #', value: 'VND-INV-004505' },
      { label: 'Amount', value: '91,800.00' },
      { label: 'Terms', value: 'Z003 — Net 45' },
      { label: 'Vendor #', value: '0001000140', locked: true },
    ],
    verdicts: [
      { status: 'ok', text: '✔ 6 PO lines exact' },
      { status: 'warning', text: '⚠ 2 PO — Qty 24 vs GR 18' },
      { status: 'info', text: '🟣 1 GL — freight charge $2,500, AI coded 94%' },
    ],
    lines: [
      { desc: 'AZ HARD LEMON TEA 24PK 12OZ CAN SLEEK', lineType: 'po', col2: '3900051366', col3: '10', col4: '1000951', qty: 2, uom: 'EA', price: '14,200.00', amount: '28,400.00', tax: 'V1', grOrConf: '4900000280', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-93100', delNote: 'DN-2026-0210' },
      { desc: 'AZ GREEN TEA 12PK 8QT CANISTER MIX', lineType: 'po', col2: '3900051366', col3: '20', col4: '1001222', qty: 10, uom: 'EA', price: '3,400.00', amount: '34,000.00', tax: 'V1', grOrConf: '4900000280', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-93100', delNote: 'DN-2026-0210' },
      { desc: 'AZ ZERO GREEN TEA NS 4PK 128OZ PPL', lineType: 'po', col2: '3900051366', col3: '40', col4: '1000964', qty: 24, uom: 'EA', price: '4,200.00', amount: '100,800.00', tax: 'V1', grOrConf: '—', matchLabel: 'GR:18', matchStatus: 'warning', bol: 'BOL-93101', delNote: 'DN-2026-0211' },
      { desc: 'CC CRAZY COWBOY NP 24PK 24OZ CAN', lineType: 'po', col2: '3900051366', col3: '42', col4: '1001554', qty: 24, uom: 'EA', price: '1,050.00', amount: '25,200.00', tax: 'V1', grOrConf: '—', matchLabel: 'GR:18', matchStatus: 'warning', bol: 'BOL-93101', delNote: 'DN-2026-0211' },
      { desc: 'Freight — Ground LTL Arizona Plant', lineType: 'gl', col2: '65000', col3: '4300', col4: 'PC-1200', qty: 1, uom: 'LOT', price: '2,500.00', amount: '2,500.00', tax: 'V0', grOrConf: 'AI 94%', matchLabel: 'AI 94%', matchStatus: 'ok', bol: '—', delNote: '—' },
    ],
    rootCause: {
      pattern: 'Process Tech partial-shipped 4×.',
      background: 'Arizona plant warehouse. Freight charge standard — $2,500 LTL recurring.',
      prediction: 'GR for remaining 6 expected Feb 12.',
      recommendation: 'Post 6 PO + 1 GL freight. Route 2 → GR/Ops.',
    },
    timeline: [1, 1, 2, 0, 0, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', 'Approval', 'Ready', 'Posted'],
    approval: { needed: false, reason: '6 PO matched. 2 GR pending. 1 GL freight AI-coded 94%.' },
    submit: { label: 'Submit 6 PO + 1 GL to SAP', variant: 'go' },
    actions: [
      { label: 'Send 2 → GR/Ops Arizona Plant', variant: 'gr', icon: 'gr', location: '→ Warehouse' },
      { label: 'Hold — AI Watch GR', variant: 'hold', icon: 'hold', location: '→ AI Monitor' },
    ],
    reasonOptions: null,
    aiRec: 'Post 6 PO ($62,400) + 1 GL freight ($2,500). Route 2 qty mismatch — separate BOL-93101.',
    bapiInfo: 'Post 6 PO → BAPI ($62,400)\n1 GL freight → BAPI ($2,500)\nRoute 2 → GR/Ops ($126,000)',
  },

  nvenia: {
    pdfFile: '/invoices/VND-INV-004502.pdf',
    vendor: 'Nvenia LLC',
    meta: 'VND-INV-004502 · PO 3900051400 · 3 lines · ICS: 98',
    amount: '$18,200.00',
    channel: 'portal',
    isNonPO: false,
    editAll: true,
    evidence: [
      { label: 'Vendor #', value: '0001000018', ok: true },
      { label: 'Currency', value: 'USD', ok: true },
      { label: 'Channel', value: 'Ariba — structured XML', ok: true },
    ],
    headerFields: [
      { label: 'PO', value: '3900051400' },
      { label: 'Date', value: '02/04/2026' },
      { label: 'Inv #', value: 'VND-INV-004502' },
      { label: 'Amount', value: '18,200.00' },
      { label: 'Terms', value: 'Z001 — Net 30' },
    ],
    verdicts: [
      { status: 'ok', text: '✔ 3/3 exact · 99.1%' },
    ],
    lines: [
      { desc: 'AZ HARD WATERMELON 12PK 22OZ CAN', lineType: 'po', col2: '3900051400', col3: '10', col4: '1001324', qty: 200, uom: 'EA', price: '42.00', amount: '8,400.00', tax: 'V1', grOrConf: '4900000250', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-90100', delNote: 'DN-2026-0170' },
      { desc: 'AZ DIET GREEN NP 24PK 22OZ CAN', lineType: 'po', col2: '3900051400', col3: '20', col4: '1001446', qty: 50, uom: 'EA', price: '124.00', amount: '6,200.00', tax: 'V1', grOrConf: '4900000250', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-90100', delNote: 'DN-2026-0170' },
      { desc: 'AZ WATERMELON NP 24PK 22OZ CAN', lineType: 'po', col2: '3900051400', col3: '30', col4: '1001424', qty: 200, uom: 'EA', price: '18.00', amount: '3,600.00', tax: 'V1', grOrConf: '4900000250', matchLabel: 'Match', matchStatus: 'ok', bol: 'BOL-90100', delNote: 'DN-2026-0170' },
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

  alliedsteel: {
    pdfFile: '/invoices/VND-INV-004514.pdf',
    vendor: 'Allied Steel Distribution',
    meta: 'VND-INV-004514 · DUPLICATE · ICS: 22',
    amount: '$194,800.00',
    channel: 'email',
    isNonPO: false,
    editAll: false,
    evidence: [
      { label: 'Vendor #', value: '0001000012', ok: true },
      { label: 'DUPLICATE OF', value: 'Doc 5100000320', ok: false },
      { label: 'Channel', value: 'Email — OCR', ok: true },
    ],
    headerFields: [
      { label: 'PO', value: '3900051450', locked: true },
      { label: 'Amount', value: '194,800.00', locked: true },
      { label: 'Original', value: 'Doc 5100000320', locked: true },
    ],
    verdicts: [
      { status: 'error', text: '⚠ DUPLICATE — Feb 3' },
      { status: 'error', text: '✗ BKPF exists' },
    ],
    lines: [
      { desc: 'AZ ZERO GREEN TEA NS 4PK 128OZ PPL', lineType: 'po', col2: '3900051450', col3: '10', col4: '1000964', qty: 2, uom: 'EA', price: '48,400.00', amount: '96,800.00', tax: 'V1', grOrConf: 'DUP', matchLabel: 'DUPLICATE', matchStatus: 'error', bol: 'BOL-94500', delNote: 'DN-2026-0220' },
      { desc: 'CC CRAZY COWBOY NP 24PK 24OZ CAN', lineType: 'po', col2: '3900051450', col3: '20', col4: '1001554', qty: 4, uom: 'EA', price: '24,500.00', amount: '98,000.00', tax: 'V1', grOrConf: 'DUP', matchLabel: 'DUPLICATE', matchStatus: 'error', bol: 'BOL-94500', delNote: 'DN-2026-0220' },
    ],
    rootCause: null,
    timeline: [1, 1, 2, 0, 0, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', '—', '—', '—'],
    approval: { needed: false, reason: 'Duplicate — rejection.' },
    submit: { label: '— Cannot Post', variant: 'disabled' },
    actions: [
      { label: 'Reject Duplicate', variant: 'reject', icon: 'reject', location: '→ Audit' },
      { label: 'Escalate', variant: 'escalate', icon: 'escalate', location: '→ AP Lead' },
    ],
    reasonOptions: ['Duplicate', 'Vendor error', 'Other'],
    aiRec: 'Confirmed duplicate. Reject.',
    bapiInfo: 'No BAPI — ZINV_AUDIT',
  },

  airoyal: {
    pdfFile: '/invoices/VND-INV-004515.pdf',
    vendor: 'Airoyal Company',
    meta: 'VND-INV-004515 · Wrong Entity · ICS: 31',
    amount: '$86,400.00',
    channel: 'portal',
    isNonPO: false,
    editAll: false,
    evidence: [
      { label: 'Vendor #', value: '0001000007', ok: true },
      { label: 'Bill To', value: 'ABCN — Arizona Beverages Canada', ok: false },
      { label: 'Should Be', value: 'ABUS — Arizona Beverages US', ok: false },
      { label: 'Channel', value: 'Portal', ok: true },
    ],
    headerFields: [
      { label: 'PO', value: '3900051480', locked: true },
      { label: 'Amount', value: '86,400.00', locked: true },
    ],
    verdicts: [
      { status: 'error', text: '✗ Wrong entity' },
      { status: 'ok', text: '✔ Lines match if rebilled' },
    ],
    lines: [
      { desc: 'HB AP SPIKED MANGO 24PK 12OZ CAN', lineType: 'po', col2: '3900051480', col3: '10', col4: '1000972', qty: 4, uom: 'EA', price: '12,600.00', amount: '50,400.00', tax: 'V1', grOrConf: '4900000300', matchLabel: 'Wrong Co', matchStatus: 'error', bol: 'BOL-95200', delNote: 'DN-2026-0230' },
      { desc: 'AZ HARD LEMON TEA 24PK 12OZ CAN SLEEK', lineType: 'po', col2: '3900051480', col3: '20', col4: '1000951', qty: 2, uom: 'EA', price: '18,000.00', amount: '36,000.00', tax: 'V1', grOrConf: '4900000300', matchLabel: 'Wrong Co', matchStatus: 'error', bol: 'BOL-95200', delNote: 'DN-2026-0230' },
    ],
    rootCause: null,
    timeline: [1, 1, 2, 0, 0, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', '—', '—', '—'],
    approval: { needed: false, reason: 'Return — no approval.' },
    submit: { label: '— Cannot Post', variant: 'disabled' },
    actions: [
      { label: 'Return to Supplier', variant: 'supplier', icon: 'supplier', location: '→ Vendor' },
    ],
    reasonOptions: ['Wrong entity', 'Other'],
    aiRec: 'Wrong entity. Reissue to ABUS.',
    bapiInfo: 'No BAPI — return',
  },

  cintas: {
    pdfFile: '/invoices/VND-INV-004509.pdf',
    vendor: 'Cintas Corporation #062',
    meta: 'VND-INV-004509 · Non-PO · 1 line · ICS: 95',
    amount: '$1,850.00',
    channel: 'email',
    isNonPO: true,
    editAll: true,
    evidence: [
      { label: 'Vendor #', value: '0001000031', ok: true },
      { label: 'Vendor', value: 'Cintas Corporation #062', ok: true },
      { label: 'Channel', value: 'Email — OCR', ok: true },
    ],
    headerFields: [
      { label: 'Date', value: '02/01/2026' },
      { label: 'Inv #', value: 'VND-INV-004509' },
      { label: 'Amount', value: '1,850.00' },
      { label: 'Terms', value: 'Z001 — Net 30' },
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

  radwell: {
    pdfFile: '/invoices/VND-INV-004508.pdf',
    vendor: 'Radwell International Inc',
    meta: 'VND-INV-004508 · Non-PO · 12 lines · ICS: 85',
    amount: '$3,240.00',
    channel: 'email',
    isNonPO: true,
    editAll: true,
    evidence: [
      { label: 'Vendor #', value: '0001000204', ok: true },
      { label: 'Vendor', value: 'Radwell International', ok: true },
      { label: 'Channel', value: 'Email — OCR', ok: true },
    ],
    headerFields: [
      { label: 'Date', value: '02/05/2026' },
      { label: 'Inv #', value: 'VND-INV-004508' },
      { label: 'Amount', value: '3,240.00' },
      { label: 'Terms', value: 'Z001 — Net 30' },
    ],
    verdicts: [
      { status: 'ok', text: '✔ 10/12 >90%' },
      { status: 'warning', text: '⚠ 2 conveyor parts — GL 65200 at 72%' },
    ],
    lines: [
      { desc: 'Shrink Wrap Film 18" Roll', lineType: 'gl', col2: '63100', col3: '4200', col4: 'PC-1100', qty: 10, uom: 'CS', price: '48.00', amount: '480.00', tax: 'V0', grOrConf: 'AI 95%', matchLabel: 'AI 95%', matchStatus: 'ok', bol: '—', delNote: '—' },
      { desc: 'Label Adhesive Industrial', lineType: 'gl', col2: '63100', col3: '4200', col4: 'PC-1100', qty: 4, uom: 'GAL', price: '32.00', amount: '128.00', tax: 'V0', grOrConf: 'AI 95%', matchLabel: 'AI 95%', matchStatus: 'ok', bol: '—', delNote: '—' },
      { desc: 'Conveyor Belt Section 6ft (NEW)', lineType: 'gl', col2: '65200', col3: '4200', col4: 'PC-1100', qty: 6, uom: 'EA', price: '42.00', amount: '252.00', tax: 'V0', grOrConf: 'AI 72%', matchLabel: 'AI 72%', matchStatus: 'warning', bol: '—', delNote: '—' },
      { desc: 'Conveyor Motor Drive (NEW)', lineType: 'gl', col2: '65200', col3: '4200', col4: 'PC-1100', qty: 6, uom: 'EA', price: '38.00', amount: '228.00', tax: 'V0', grOrConf: 'AI 72%', matchLabel: 'AI 72%', matchStatus: 'warning', bol: '—', delNote: '—' },
    ],
    rootCause: null,
    timeline: [1, 1, 2, 1, 0, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', 'Approval', 'Ready', 'Posted'],
    approval: { needed: true, reason: '2 new GL codes 72%.', who: 'R. Torres (CC Owner)' },
    submit: { label: 'Submit for Approval', variant: 'approval' },
    actions: [],
    reasonOptions: null,
    aiRec: '10 packaging supplies ok. 2 conveyor parts 72%. Edit→approval.',
    bapiInfo: 'BAPI (12 GL items · $3,240)',
  },

  millerchitty: {
    pdfFile: '/invoices/VND-INV-004513.pdf',
    vendor: 'Miller & Chitty Company Inc',
    meta: 'VND-INV-004513 · Non-PO · 3 lines · ICS: 80',
    amount: '$22,400.00',
    channel: 'portal',
    isNonPO: true,
    editAll: true,
    evidence: [
      { label: 'Vendor #', value: '0001000207', ok: true },
      { label: 'Vendor', value: 'Miller & Chitty Company', ok: true },
      { label: 'Channel', value: 'Portal', ok: true },
    ],
    headerFields: [
      { label: 'Date', value: '02/06/2026' },
      { label: 'Inv #', value: 'VND-INV-004513' },
      { label: 'Amount', value: '22,400.00' },
      { label: 'Terms', value: 'Z001 — Net 30' },
    ],
    verdicts: [
      { status: 'ok', text: '✔ 2/3 coded >90%' },
      { status: 'warning', text: '⚠ 1 line — expense vs capital?' },
    ],
    lines: [
      { desc: 'Filler Machine Overhaul Service', lineType: 'gl', col2: '62400', col3: '4200', col4: 'PC-1100', qty: 1, uom: 'LOT', price: '8,400.00', amount: '8,400.00', tax: 'V0', grOrConf: 'AI 92%', matchLabel: 'AI 92%', matchStatus: 'ok', bol: '—', delNote: '—' },
      { desc: 'Capper Seal Kit Replacement', lineType: 'gl', col2: '63100', col3: '4200', col4: 'PC-1100', qty: 4, uom: 'EA', price: '1,200.00', amount: '4,800.00', tax: 'V0', grOrConf: 'AI 91%', matchLabel: 'AI 91%', matchStatus: 'ok', bol: '—', delNote: '—' },
      { desc: 'Labeling System Upgrade', lineType: 'gl', col2: '21000', col3: '4200', col4: 'PC-1100', qty: 1, uom: 'LOT', price: '9,200.00', amount: '9,200.00', tax: 'V0', grOrConf: 'AI 68%', matchLabel: 'AI 68%', matchStatus: 'warning', bol: '—', delNote: '—' },
    ],
    rootCause: null,
    timeline: [1, 1, 2, 0, 0, 0],
    timelineLabels: ['Ingested', 'Extracted', 'Draft', 'Approval', 'Ready', 'Posted'],
    approval: { needed: true, reason: '$9,200 capital vs expense.', who: 'R. Torres (CC Owner)' },
    submit: { label: 'Submit for Approval', variant: 'approval' },
    actions: [],
    reasonOptions: null,
    aiRec: '2 service ok. 1 labeling upgrade $9,200 may be capital (GL 21000). Review.',
    bapiInfo: 'BAPI (3 GL items · $22,400)',
  },
};

// ============ MY WORK — IN FLIGHT ============

export const myWorkInFlight = [
  { id: 1, vendor: 'Federal Express Corporation', detail: 'GR posted 7:58 AM', amount: '$94,200', status: 'ready', statusLabel: '→ READY', actionLabel: '→ Post', actionVariant: 'ready', isNew: true, statusDetail: 'All matched' },
  { id: 2, vendor: 'Arctic Falls Spring Water', detail: 'AI monitoring GR', amount: '$87,400', status: 'hold', statusLabel: 'HOLD', actionLabel: 'Waiting', actionVariant: 'default', isNew: false, statusDetail: 'EKET 2d overdue' },
  { id: 3, vendor: 'Airoyal Company', detail: 'Wrong entity', amount: '$86,400', status: 'supplier', statusLabel: '→ SUPPLIER', actionLabel: 'Sent', actionVariant: 'default', isNew: false, statusDetail: 'Returned' },
  { id: 4, vendor: 'US Bottlers Machinery', detail: '4 lines → Martinez', amount: '$52,200', status: 'buyer', statusLabel: '→ BUYER', actionLabel: 'Pending', actionVariant: 'default', isNew: false, statusDetail: 'Routed' },
  { id: 5, vendor: 'Process Tech Sales', detail: 'Arizona Plant warehouse', amount: '$18,600', status: 'gr', statusLabel: '→ GR/OPS', actionLabel: 'Pending', actionVariant: 'default', isNew: false, statusDetail: 'Pending GR' },
  { id: 6, vendor: 'Krones (threshold)', detail: '$210K → M. Laurent', amount: '$210,000', status: 'escalated', statusLabel: '↑ AP LEAD', actionLabel: 'Pending', actionVariant: 'default', isNew: false, statusDetail: 'Escalated' },
  { id: 7, vendor: 'Radwell International', detail: 'New GL codes', amount: '$3,240', status: 'approval', statusLabel: '⏳ APPROVAL', actionLabel: 'Awaiting', actionVariant: 'default', isNew: false, statusDetail: 'R. Torres' },
];

// ============ MY WORK — POSTED TODAY ============

export const myWorkPosted = [
  { id: 1, vendor: 'Krones Inc', detail: '6 lines · EDI', amount: '$128,400', sapDoc: 'Doc 5100000341', time: '8:15 AM · Auto' },
  { id: 2, vendor: 'Nvenia LLC', detail: '3 lines · Portal', amount: '$18,200', sapDoc: 'Doc 5100000342', time: '8:18 AM · Auto' },
  { id: 3, vendor: 'ADP', detail: '24 lines · Email', amount: '$342,600', sapDoc: 'Doc 5100000344', time: '8:35 AM' },
  { id: 4, vendor: 'Cintas Corp #062', detail: '1 line · Email', amount: '$1,850', sapDoc: 'Doc 5100000345', time: '8:40 AM · Auto' },
  { id: 5, vendor: 'Johnson Controls Security', detail: '5 lines · EDI', amount: '$45,600', sapDoc: 'Doc 5100000343', time: '8:22 AM' },
];

// ============ MY WORK — THREADS ============

export const myWorkThreads = [
  {
    id: 1,
    vendor: 'Airoyal Company',
    issue: 'Wrong entity',
    status: 'Awaiting',
    messages: [
      { author: 'Sarah Chen', time: '7:45 AM', avatar: 'SC', text: 'Please reissue to Arizona Beverages US (ABUS), 305 N Arizona Ave, Chandler AZ 85225.' },
    ],
  },
  {
    id: 2,
    vendor: 'Process Tech Sales',
    issue: 'Qty 24→18',
    status: 'Pending',
    messages: [
      { author: 'Sarah Chen', time: 'Feb 6', avatar: 'SC', text: 'GR shows 18 EA. Confirm 6 shipped or revise.' },
    ],
  },
];
