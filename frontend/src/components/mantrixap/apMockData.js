/**
 * MANTRIX AP — Centralized Mock Data
 * All static data extracted from the 6 op_*.html product story files
 * Data sourced from Arizona Beverages BigQuery dataset
 */

// ============ OVERVIEW / LANDING ============

export const workflowTiles = [
  {
    id: 'invoice-entry',
    num: 'Tile 1',
    title: 'Invoice Entry',
    subtitle: 'AI-Assisted Data Capture',
    description: 'Invoice arrives. AI scans, extracts, pre-fills. Clerk reviews and verifies every field.',
    stats: { value: '8', label: 'New' },
    color: '#00357a',
    icon: 'DocumentScanner',
  },
  {
    id: 'work-queue',
    num: 'Tile 2',
    title: 'Work Queue',
    subtitle: 'Smart Prioritization',
    description: 'All invoices ranked by financial impact. Clerk works highest-priority items first.',
    stats: { value: '47', label: 'Items' },
    color: '#00357a',
    icon: 'ViewList',
  },
  {
    id: 'exception-review',
    num: 'Tile 3',
    title: 'Exception Review',
    subtitle: 'Root Cause & Resolution',
    description: 'Variances and issues. AI identifies root cause and precedent. Clerk decides resolution.',
    stats: { value: '4', label: 'Open' },
    color: '#00357a',
    icon: 'ReportProblem',
  },
  {
    id: 'posting-review',
    num: 'Tile 4',
    title: 'Posting Review',
    subtitle: 'Batch Confirmation',
    description: 'AI-prepared batch of postings. Clerk reviews confidence scores and confirms the batch.',
    stats: { value: '31', label: 'Ready' },
    color: '#00357a',
    icon: 'FactCheck',
  },
  {
    id: 'my-status',
    num: 'Tile 5',
    title: 'My Status',
    subtitle: 'Personal Tracker',
    description: "The clerk's home base. Every invoice touched, what happened, and what needs attention.",
    stats: { value: '107', label: 'Tracked' },
    color: '#00357a',
    icon: 'Assessment',
  },
];

export const timelineEvents = [
  {
    time: '8:00 AM',
    title: '47 invoices waiting, already prioritized',
    heading: 'Opens Work Queue',
    description: 'Sarah opens Mantrix and sees her queue. AI has already sorted everything by financial impact. The $312K US Bottlers Machinery exception (blocking a payment run) is at the top, not buried. 31 invoices are flagged "Ready to Post" with 94+ confidence.',
    tileColor: '#00357a',
  },
  {
    time: '8:05 AM',
    title: 'US Bottlers Machinery price variance — AI already diagnosed it',
    heading: 'Handles Top Exception',
    description: 'Sarah clicks the exception. Instead of opening ME23N, MB03, MRBR — Mantrix shows her everything on one screen: root cause is contract escalation, variance 2.04% within 3% clause, seen 18 times before, all approved. She clicks "Approve & Post." 3 minutes, not 45.',
    result: '$312,500 invoice posted → $2.1M payment run unblocked',
    tileColor: '#00357a',
  },
  {
    time: '8:15 AM',
    title: 'Partial GR, freight variance, duplicate flag',
    heading: 'Reviews 3 More Exceptions',
    description: "The partial GR: AI shows EKET delivery date, MATDOC status, vendor's typical delivery lag. Sarah parks it — GR expected tomorrow. The freight variance: she routes to procurement with AI-generated context. The duplicate: AI shows the matching invoice side-by-side. She confirms it's a true duplicate and rejects.",
    tileColor: '#00357a',
  },
  {
    time: '8:30 AM',
    title: '31 invoices, 12 minutes, $842K posted',
    heading: 'Batch Reviews Ready Invoices',
    description: 'Sarah switches to the Posting Review tile. 31 invoices AI has pre-matched and prepared. She scrolls through — each one has a confidence score, match summary, and AI reasoning. She unchecks 2 that look unusual, confirms the other 29. $842K posted in 12 minutes.',
    result: '29 invoices posted · 2 sent back for individual review · 12 min total',
    tileColor: '#00357a',
  },
  {
    time: '9:00 AM',
    title: '8 new invoices arrived — AI already pre-filled everything',
    heading: 'Processes New Arrivals',
    description: "New invoices came in via email. By the time Sarah opens them, AI has extracted every field, matched to POs, run duplicate checks, and calculated match scores. She's verifying, not data-entering. Average: 90 seconds per invoice instead of 10 minutes.",
    tileColor: '#00357a',
  },
  {
    time: '9:30 AM',
    title: '90% of today\'s queue processed before 10 AM',
    heading: 'Queue Nearly Clear',
    description: 'By 9:30, Sarah has processed 43 of 47 invoices. The remaining 4 are parked waiting for GRs or buyer responses. She used to spend until 3 PM getting through her daily volume. Mantrix gave her 5 hours back.',
    result: '43 invoices · $1.7M posted · 4 exceptions resolved · 1 duplicate caught · 90 min total',
    tileColor: '#00357a',
  },
];

export const beforeAfterMetrics = {
  before: [
    { label: 'Invoices per clerk per day', value: '35-45' },
    { label: 'Avg time per invoice', value: '8-12 min' },
    { label: 'Exception investigation time', value: '30-60 min each' },
    { label: 'First-pass post rate', value: '55-65%' },
    { label: 'T-codes opened per invoice', value: '3-5' },
    { label: 'Duplicate catch rate', value: '~80%' },
    { label: 'Clerk satisfaction', value: '2.1 / 5' },
  ],
  after: [
    { label: 'Invoices per clerk per day', value: '120-150' },
    { label: 'Avg time per invoice', value: '< 90 sec' },
    { label: 'Exception investigation time', value: '< 15 min each' },
    { label: 'First-pass post rate', value: '> 85%' },
    { label: 'T-codes opened per invoice', value: '0 (everything in Mantrix)' },
    { label: 'Duplicate catch rate', value: '> 99%' },
    { label: 'Clerk satisfaction', value: '4.2 / 5' },
  ],
};

export const designPrinciples = [
  { icon: 'Person', title: 'Human Decides. Always.', text: 'No invoice posts to SAP without a human clicking "Confirm." AI recommends. AI explains. AI prepares. But the human is the gatekeeper.' },
  { icon: 'Label', title: 'AI Is Labeled. Always.', text: "Every AI-generated field, recommendation, and insight is clearly tagged. The clerk always knows what's AI and what's verified data." },
  { icon: 'Edit', title: 'Everything Is Editable.', text: 'Every field AI pre-fills can be overridden. Every recommendation can be rejected. The clerk has full control of every value.' },
  { icon: 'Sync', title: 'Overrides Train the Model.', text: 'When a clerk changes an AI suggestion, that feedback improves future recommendations. The system learns your business.' },
  { icon: 'Description', title: 'Full Audit Trail.', text: 'Every posting logs: AI recommendation + clerk decision + timestamp. Auditors can trace any document back to the exact decision chain.' },
  { icon: 'Storage', title: 'SAP Is Truth.', text: 'AI reads from SAP tables (EKKO, EKPO, EKET, MATDOC, EKBE). Writes via BAPIs. No shadow database. No data lake. SAP is the source.' },
];

// ============ TILE 1: INVOICE ENTRY ============

export const invoiceList = [
  { id: 1, invoiceNum: 'VND-INV-004231', vendor: 'Krones Inc', date: '02/04/2026', amount: '$45,200.00', poRef: '3900051320', type: 'PO-Backed', matchType: '3-Way Match', aiScore: 97.4, scoreLevel: 'high', status: 'matched', aiHint: 'Full match — 0.3% variance within tolerance' },
  { id: 2, invoiceNum: 'VND-INV-004232', vendor: 'Process Tech Sales and Service', date: '02/04/2026', amount: '$234,000.00', poRef: '3900051366', type: 'PO-Backed', matchType: '3-Way Match', aiScore: 95.8, scoreLevel: 'high', status: 'matched', aiHint: 'Exact match — vendor 94 reliability' },
  { id: 3, invoiceNum: 'VND-INV-004233', vendor: 'US Bottlers Machinery Co', date: '02/04/2026', amount: '$312,500.00', poRef: '3900049229', type: 'PO-Backed', matchType: 'Price Variance', aiScore: 42, scoreLevel: 'low', status: 'exception', aiHint: 'Price variance 2.04% — contract escalation clause' },
  { id: 4, invoiceNum: 'VND-INV-004120', vendor: 'Radwell International Inc', date: '02/04/2026', amount: '$1,840.00', poRef: '—', type: 'Non-PO', matchType: 'GL Coded', aiScore: 96.1, scoreLevel: 'high', status: 'matched', aiHint: 'Matches 14 prior invoices — GL 54200/CC1000' },
  { id: 5, invoiceNum: 'VND-INV-009920', vendor: 'Avenel Truck & Equipment', date: '02/04/2026', amount: '$8,750.00', poRef: '3900051500', type: 'Service Entry', matchType: 'Partial GR', aiScore: 72, scoreLevel: 'mid', status: 'review', aiHint: '35/50 EA received — remaining expected today' },
  { id: 6, invoiceNum: 'VND-INV-002241', vendor: 'New Jersey American Water', date: '02/03/2026', amount: '$8,420.00', poRef: '3900051510', type: 'PO-Backed', matchType: 'Freight Issue', aiScore: 68, scoreLevel: 'mid', status: 'review', aiHint: 'Freight 4.8% above contract — drift pattern' },
  { id: 7, invoiceNum: 'VND-INV-022104', vendor: 'US Bottlers Machinery (Non-PO)', date: '02/04/2026', amount: '$342.00', poRef: '—', type: 'Non-PO', matchType: 'GL Coded', aiScore: 98.2, scoreLevel: 'high', status: 'matched', aiHint: 'Recurring vendor — exact GL pattern match' },
  { id: 8, invoiceNum: 'VND-INV-004234', vendor: 'US Bottlers Machinery Co', date: '02/03/2026', amount: '$156,000.00', poRef: '3900049250', type: 'PO-Backed', matchType: 'Missing SES', aiScore: null, scoreLevel: 'parked', status: 'parked', aiHint: 'Service PO — no entry sheet in ML81N yet' },
];

export const workflowSteps = [
  { step: 1, name: 'Scan / Upload', who: 'ai', desc: 'Invoice arrives (email, scan, EDI). AI extracts all fields via OCR. Structures the data.' },
  { step: 2, name: 'Pre-Fill & Classify', who: 'ai', desc: 'AI pre-fills SAP fields, classifies invoice type (PO-backed, Non-PO, Service, Credit), identifies PO candidates.' },
  { step: 3, name: 'Review & Verify', who: 'human', desc: 'Clerk reviews AI pre-fill, corrects any fields, confirms PO match. Every field is editable inline.' },
  { step: 4, name: 'AI Match Analysis', who: 'ai', desc: 'AI compares against PO/GR/SES, calculates variance, checks for duplicates, surfaces confidence score.' },
  { step: 5, name: 'Decide & Post', who: 'human', desc: 'Clerk sees AI recommendation + confidence. Clerk decides: Post, Park, Route to buyer, or Reject. Human clicks the button.' },
];

export const invoiceFields = [
  { label: 'Invoice #', value: 'VND-INV-004231', aiFilled: true },
  { label: 'Vendor', value: 'Krones Inc', aiFilled: true },
  { label: 'Date', value: '02/04/2026', aiFilled: true },
  { label: 'Amount', value: '$45,200.00', aiFilled: true },
  { label: 'PO Ref', value: '3900051320', aiFilled: true },
  { label: 'Terms', value: 'Z001 — Net 30', editable: true },
];

export const matchDetails = [
  { label: 'Price', value: '$45,200 vs PO $45,065 (Δ 0.3%)', status: 'pass' },
  { label: 'Quantity', value: '100 EA = 100 EA (exact)', status: 'pass' },
  { label: 'GR Status', value: 'GR 4900000200 posted 02/03', status: 'pass' },
  { label: 'Duplicates', value: 'None found (checked 2,340)', status: 'pass' },
  { label: 'Vendor Score', value: '96.8 reliability', status: 'pass' },
];

export const poScheduleCheck = [
  { label: 'PO Delivery Date', value: '02/01/2026', sapCode: 'EKET' },
  { label: 'GR Posted', value: '02/03/2026', sapCode: 'MATDOC' },
  { label: 'Vendor Avg Lag', value: '+1.2 days typical' },
];

export const aiCapabilities = [
  { icon: 'CameraAlt', name: 'Intelligent OCR', desc: 'Reads invoice image/PDF, extracts vendor name, invoice #, amounts, line items, PO references. Pre-fills every SAP field.', badge: 'AI Pre-Fills → Human Verifies' },
  { icon: 'Search', name: 'PO Candidate Ranking', desc: 'Searches EKKO/EKPO for matching POs. Ranks candidates by probability. Shows top 3 with confidence scores.', badge: 'AI Suggests → Human Selects' },
  { icon: 'BarChart', name: '3-Way Match Analysis', desc: 'Compares invoice vs PO vs GR. Calculates price/qty variances. Checks EKET delivery dates vs MATDOC for GR status.', badge: 'AI Analyzes → Human Reviews' },
  { icon: 'Sync', name: 'Duplicate Detection', desc: 'Multi-dimensional check: invoice #, amount, vendor, date, PO combo. Flags potential duplicates with similarity score.', badge: 'AI Flags → Human Confirms' },
  { icon: 'Label', name: 'GL Auto-Coding (Non-PO)', desc: 'For Non-PO invoices, AI suggests GL account and cost center based on vendor history and invoice description.', badge: 'AI Suggests → Human Approves' },
  { icon: 'Bolt', name: 'Variance Explanation', desc: 'When variance exists, AI explains why — contract escalation? PO error? Freight surcharge? Shows historical precedent.', badge: 'AI Explains → Human Decides' },
];

export const sapDataSources = [
  { domain: 'Purchase Orders', tables: ['EKKO', 'EKPO'], purpose: 'Header + line item match' },
  { domain: 'PO Schedule Lines', tables: ['EKET'], purpose: 'Delivery dates, quantities expected' },
  { domain: 'Goods Receipts', tables: ['MATDOC', 'MSEG'], purpose: '101 movements, qty received, GR dates' },
  { domain: 'PO History', tables: ['EKBE'], purpose: 'Prior invoices, GR history per PO line' },
  { domain: 'Invoice Docs', tables: ['RBKP', 'RSEG'], purpose: 'Invoice header + items for duplicate check' },
  { domain: 'Vendor Master', tables: ['LFA1', 'LFB1'], purpose: 'Vendor data, payment terms, bank details' },
  { domain: 'Pricing', tables: ['KONV'], purpose: 'Contract conditions, escalation clauses' },
  { domain: 'GR/IR Accruals', tables: ['WRX'], purpose: 'Expected invoice amounts from GR' },
  { domain: 'Tolerances', tables: ['T169', 'OMR6'], purpose: 'SAP tolerance groups and limits' },
];

export const entryKPIs = [
  { name: 'Invoice Processing Time', value: '< 90 sec', desc: 'From invoice open to post decision. Pre-Mantrix avg: 8-12 minutes.' },
  { name: 'AI Pre-Fill Accuracy', value: '> 95%', desc: '% of fields correctly pre-filled. Clerk override rate < 5%.' },
  { name: 'First-Pass Post Rate', value: '> 85%', desc: '% of invoices posted on first review without rework or parking.' },
  { name: 'Duplicate Catch Rate', value: '> 99%', desc: '% of duplicate invoices flagged before clerk posts.' },
  { name: 'PO Match Suggestion Accuracy', value: '> 92%', desc: '% of time top PO candidate is correct match.' },
  { name: 'Clerk Satisfaction', value: '> 4.2/5', desc: 'Monthly pulse survey. Does AI make your job easier?' },
];

export const differentiatorEntry = {
  them: [
    'Clerk manually types every field',
    'PO search is manual — enter PO # or search',
    'No confidence score — match or error message',
    'Variance = cryptic error code',
    'GR check = open another T-code (MB03)',
    'Duplicate check = run report separately',
  ],
  us: [
    'AI pre-fills every field — clerk verifies',
    'AI ranks PO candidates with confidence scores',
    'Confidence dial shows match quality 0-100',
    'AI explains variance in plain English',
    'GR status inline — EKET date vs MATDOC check',
    'Duplicate detection runs automatically on entry',
  ],
};

// ============ TILE 2: WORK QUEUE ============

export const queueStats = [
  { value: 47, label: 'In My Queue', sub: 'Assigned to me today', color: '#00357a' },
  { value: 31, label: 'Ready to Post', sub: 'AI pre-matched, high confidence', color: '#059669' },
  { value: 12, label: 'Need Review', sub: 'Partial match or variance', color: '#d97706' },
  { value: 4, label: 'Exceptions', sub: 'Need investigation', color: '#dc2626' },
];

export const queueItems = [
  { id: 1, score: 42, scoreLevel: 'low', vendor: 'US Bottlers Machinery Co', detail: 'VND-INV-004233 · PO 3900049229 · Stuck 4 days', amount: '$312,500', type: 'PO-Backed\nPrice Variance', status: 'exception', aiHint: 'PO price wrong — buyer needs to correct ME22N' },
  { id: 2, score: 68, scoreLevel: 'mid', vendor: 'New Jersey American Water', detail: 'VND-INV-002241 · PO 3900051510 · Freight variance', amount: '$8,420', type: 'PO-Backed\nFreight Issue', status: 'review', aiHint: 'Freight 4.8% above contract — drift pattern detected' },
  { id: 3, score: 97, scoreLevel: 'high', vendor: 'Krones Inc', detail: 'VND-INV-004231 · PO 3900051320 · 3-way match', amount: '$45,200', type: 'PO-Backed\n3-Way Match', status: 'ready', aiHint: 'Full match — 0.3% variance within tolerance' },
  { id: 4, score: 96, scoreLevel: 'high', vendor: 'Radwell International Inc', detail: 'VND-INV-004120 · Non-PO · Packaging Supplies', amount: '$1,840', type: 'Non-PO\nGL 54200', status: 'ready', aiHint: 'Matches 14 prior invoices — GL/CC suggested' },
  { id: 5, score: 72, scoreLevel: 'mid', vendor: 'Avenel Truck & Equipment', detail: 'VND-INV-009920 · PO 3900051500 · Partial GR', amount: '$8,750', type: 'Service Entry\nPartial GR', status: 'review', aiHint: '35/50 EA received — remaining expected today per EKET' },
  { id: 6, score: null, scoreLevel: 'parked', vendor: 'UDMC', detail: 'VND-INV-001102 · Parked 02/04 · Waiting on buyer', amount: '$24,500', type: 'PO-Backed\nAwaiting Info', status: 'parked', aiHint: 'Buyer J. Martinez notified — no response yet' },
];

export const priorityFactors = [
  { name: 'Financial Impact', icon: 'AttachMoney', desc: 'Higher dollar amounts rank higher. A $312K invoice blocking a payment run outranks a $1.8K routine posting.', weight: '35%' },
  { name: 'Payment Urgency', icon: 'Schedule', desc: 'Invoices approaching payment deadlines, especially those with early-pay discounts (2/10 Net 30), rank higher.', weight: '25%' },
  { name: 'Processing Complexity', icon: 'Assignment', desc: 'Exceptions and partial matches surface above clean matches. The clerk handles complex items when fresh, routine items later.', weight: '20%' },
  { name: 'Aging & SLA', icon: 'CalendarToday', desc: 'Invoices stuck longer than SLA targets get boosted. Parked items that have been waiting for responses get escalated.', weight: '20%' },
];

export const queueFeatures = [
  { icon: 'Inventory', name: 'Batch Review Mode', desc: 'For "Ready to Post" invoices — clerk can review AI recommendations in bulk and confirm/reject each with one click per invoice.' },
  { icon: 'Search', name: 'Pre-Loaded Context', desc: 'Click any queue item → Tile 1 opens with all AI analysis already complete. No waiting. Invoice, match, recommendation — instant.' },
  { icon: 'Notifications', name: 'Smart Notifications', desc: "Parked invoice got a response? GR just posted for a held invoice? AI surfaces changes so the clerk doesn't have to check manually." },
];

export const queueKPIs = [
  { name: 'Queue Clearance Rate', value: '> 90%', desc: '% of daily queue processed by end of day.' },
  { name: 'Avg Time per Invoice', value: '< 90 sec', desc: 'Including AI-assisted review. Pre-Mantrix: 8-12 min.' },
  { name: 'Payment Blockers Resolved', value: '< 4 hrs', desc: 'Time from queue entry to resolution for payment-blocking items.' },
];

// ============ TILE 3: EXCEPTION REVIEW ============

export const exceptionEvidence = [
  { label: 'PO Net Price', value: '$306,250.00', sapCode: 'EKPO-NETPR' },
  { label: 'Invoice Amount', value: '$312,500.00', sapCode: 'RSEG-WRBTR' },
  { label: 'Variance', value: '2.04% ($6,250)', highlight: 'amber' },
  { label: 'Contract Condition', value: 'ZPR0 — 3% esc.', sapCode: 'KONV-KBETR' },
  { label: 'GR Status', value: 'Complete', sapCode: 'EKBE', highlight: 'green' },
  { label: 'Vendor Reliability', value: '97.1 (89 invoices)' },
  { label: 'SAP Tolerance', value: '1.0% (exceeded)', sapCode: 'OMR6' },
];

export const exceptionTaxonomy = [
  { type: 'Price — Contract', badge: 'price', detection: 'Variance within KONV escalation clause', clerkSees: 'Clear explanation + contract reference + precedent count', resolution: 'Clerk posts within tolerance or routes for PO update' },
  { type: 'Price — PO Error', badge: 'price', detection: "PO price doesn't match contract — entry error likely", clerkSees: 'Root cause flagged as PO error, not invoice error', resolution: 'Clerk routes to buyer for PO correction (ME22N)' },
  { type: 'Qty — GR Pending', badge: 'qty', detection: 'EKET delivery date passed, no 101 in MATDOC', clerkSees: 'GR expected date + vendor delivery history + lag estimate', resolution: 'Clerk parks and waits, or contacts receiving' },
  { type: 'Qty — Partial GR', badge: 'qty', detection: 'EKBE shows partial GR, remaining qty outstanding', clerkSees: 'Received vs expected breakdown with timeline', resolution: 'Clerk posts partial or waits for remaining GR' },
  { type: 'Master Data', badge: 'master', detection: 'LFA1/LFB1 change detected — bank, terms, or address', clerkSees: 'Specific field change flagged with date and old/new values', resolution: 'Clerk routes to master data team for validation' },
  { type: 'Duplicate', badge: 'dup', detection: 'Multi-dimensional match against RBKP/RSEG', clerkSees: 'Matching invoice shown side-by-side with similarity %', resolution: 'Clerk confirms duplicate → reject, or confirms unique → post' },
  { type: 'Policy Violation', badge: 'policy', detection: 'SOX/delegation/segregation rule triggered', clerkSees: 'Specific policy cited with violation detail', resolution: 'Clerk escalates to compliance — cannot override' },
];

export const exceptionKPIs = [
  { name: 'Avg Resolution Time', value: '< 15 min', desc: 'From exception open to decision. Pre-Mantrix: 2-4 hours of investigation.' },
  { name: 'Root Cause Accuracy', value: '> 95%', desc: '% of time AI correctly identifies the actual root cause, not just the symptom.' },
  { name: 'Recommendation Acceptance', value: '> 85%', desc: '% of time clerk follows AI recommendation. Overrides train the model.' },
  { name: 'Exception Aging', value: '< 2 days', desc: 'Avg time exception stays open. Pre-Mantrix: 5-8 days.' },
  { name: 'Repeat Exception Rate', value: '< 10%', desc: '% of exceptions from the same root cause. AI surfaces structural issues.' },
  { name: 'Human Touch Reduction', value: '60%', desc: 'Reduction in time spent per exception vs manual investigation.' },
];

// ============ TILE 4: POSTING REVIEW ============

export const batchSummary = [
  { value: 31, label: 'AI-Prepared for Posting', color: '#059669' },
  { value: '$842,340', label: 'Total Value', color: '#00357a' },
  { value: '94.2', label: 'Avg AI Confidence', color: '#1976d2' },
  { value: 0, label: 'Anomalies Detected', color: '#059669' },
];

export const postingQueue = [
  { id: 1, vendor: 'Krones Inc', detail: 'VND-INV-004231 · PO 3900051320', amount: '$45,200', matchType: '3-Way Match', confidence: 97.4, reason: 'Full match · 0.3% variance', action: 'MIRO', checked: true },
  { id: 2, vendor: 'Process Tech Sales and Service', detail: 'VND-INV-004232 · PO 3900051366', amount: '$234,000', matchType: '3-Way Match', confidence: 95.8, reason: 'Exact match · vendor 94 reliability', action: 'MIRO', checked: true },
  { id: 3, vendor: 'Avenel Truck & Equipment', detail: 'VND-INV-009920 · SES 1000023456', amount: '$8,750', matchType: 'Service Entry', confidence: 94.8, reason: 'ESKN/ESLH confirmed', action: 'MIRO', checked: true },
  { id: 4, vendor: 'Radwell International Inc', detail: 'VND-INV-004120 · Non-PO', amount: '$1,840', matchType: 'Non-PO', confidence: 96.1, reason: 'GL 54200/CC1000 · matches 14 prior', action: 'FB60', checked: true },
  { id: 5, vendor: 'US Bottlers Machinery (Non-PO)', detail: 'VND-INV-022104 · Non-PO', amount: '$342', matchType: 'Non-PO', confidence: 98.2, reason: 'Recurring vendor · exact GL pattern', action: 'FB60', checked: true },
];

export const confirmationDetails = [
  { label: 'MIRO Documents Created', value: '27' },
  { label: 'FB60 Documents Created', value: '4' },
  { label: 'Total Value Posted', value: '$842,340.00' },
  { label: 'Processing Time', value: '12 min 34 sec (batch review)' },
  { label: 'Posted By', value: 'Sarah Chen · AP Clerk' },
  { label: 'AI Audit Log', value: 'Stored for all 31 documents' },
];

export const postingFeatures = [
  { icon: 'Inventory', name: 'Batch Confirmation', desc: 'Review 31 invoices in 12 minutes instead of opening each one individually in MIRO. Select all or pick individual items.', badge: 'Human Confirms Batch' },
  { icon: 'Search', name: 'Drill-Down on Any Item', desc: 'Click any row to expand full AI analysis — match details, SAP fields checked, variance explanation, historical precedent.', badge: 'Human Reviews Detail' },
  { icon: 'Description', name: 'Audit Trail Built-In', desc: "Every posting logs: AI recommendation, confidence score, clerk who confirmed, timestamp. Stored in SAP doc text + Mantrix log.", badge: 'AI Documents Automatically' },
  { icon: 'RemoveCircleOutline', name: 'Deselect & Remove', desc: "Not comfortable with an AI recommendation? Uncheck it. It goes back to the work queue for individual review. No pressure.", badge: 'Human Controls Everything' },
  { icon: 'Warning', name: 'Anomaly Highlighting', desc: "If any item in the batch has unusual characteristics (first-time vendor-material, amount outlier), it's visually flagged.", badge: 'AI Flags → Human Decides' },
  { icon: 'BarChart', name: 'My Posting History', desc: 'Clerk can see their own posting stats: accuracy, volume, exceptions resolved. Professional development, not surveillance.', badge: 'AI Tracks → Human Grows' },
];

export const postingKPIs = [
  { name: 'Batch Review Time', value: '< 15 min', desc: 'For 30+ invoices. Pre-Mantrix: 4-6 hours (opening each in MIRO).' },
  { name: 'Posting Accuracy', value: '> 99.5%', desc: '% of postings not reversed. AI + Human = better than either alone.' },
  { name: 'Clerk Deselect Rate', value: '< 5%', desc: '% of AI-prepared items clerk removes from batch. Lower = better AI.' },
];

// ============ TILE 5: MY STATUS TRACKER ============

export const dailySummary = [
  { value: 94, label: 'Posted Today', sub: '$2.1M total value', color: '#059669' },
  { value: 7, label: 'Parked', sub: '3 awaiting GR · 2 routed · 2 on hold', color: '#d97706' },
  { value: 4, label: 'Routed to Buyer', sub: '1 response received', color: '#1976d2' },
  { value: 2, label: 'Rejected', sub: 'Vendor notified', color: '#dc2626' },
  { value: 3, label: 'Status Changed', sub: 'AI detected updates', color: '#00357a' },
];

export const statusInvoices = [
  { id: 1, hasNotif: true, vendor: 'Krones Inc', detail: 'VND-INV-008834 · PO 3900051320', amount: '$45,200', status: 'updated', statusLabel: 'GR POSTED', parkedReason: 'Missing GR (WEBRE)', days: 3, aiUpdate: 'GR 4900000200 posted today — ready to re-process' },
  { id: 2, hasNotif: true, vendor: 'US Bottlers Machinery Co', detail: 'VND-INV-009102 · PO 3900049229', amount: '$312,500', status: 'routed', statusLabel: 'ROUTED', parkedReason: 'Price variance → Buyer J. Martinez', days: 1, aiUpdate: 'Buyer responded: "Approved — contract escalation"' },
  { id: 3, hasNotif: false, vendor: 'Arctic Falls Spring Water', detail: 'VND-INV-008801 · PO 3900051520', amount: '$87,300', status: 'parked', statusLabel: 'PARKED', parkedReason: 'Partial GR — 80 of 120 units received', days: 5, aiUpdate: 'EKET shows delivery 2/7 — likely tomorrow' },
  { id: 4, hasNotif: true, vendor: 'Process Tech Sales and Service', detail: 'VND-INV-008790 · Non-PO', amount: '$4,200', status: 'routed', statusLabel: 'ROUTED', parkedReason: 'Non-PO > $2,500 → Mgr approval', days: 2, aiUpdate: 'Manager approved — ready to post as FB60' },
  { id: 5, hasNotif: false, vendor: 'Radwell International', detail: 'VND-INV-009230 · PO 3900051530', amount: '$1,840', status: 'parked', statusLabel: 'PARKED', parkedReason: 'UOM mismatch — invoice KG, PO LB', days: 1, aiUpdate: 'Converted: 50 KG = 110.23 LB. Within tolerance.' },
  { id: 6, hasNotif: false, vendor: 'Motion Industries Inc', detail: 'VND-INV-008712 · PO 3900051540', amount: '$23,400', status: 'parked', statusLabel: 'PARKED', parkedReason: 'Vendor on payment hold (LFB1 block)', days: 8, aiUpdate: 'No change — vendor still blocked' },
  { id: 7, hasNotif: false, vendor: 'US Bottlers Machinery Co', detail: 'VND-INV-008905 · PO 3900049250', amount: '$156,000', status: 'parked', statusLabel: 'PARKED', parkedReason: 'Missing SES — service PO, no entry sheet', days: 4, aiUpdate: 'SES not yet created in ML81N' },
];

export const statusDetectionFeatures = [
  { icon: 'Inventory', name: 'GR Posted Detection', desc: 'Invoice was parked because EKPO-WEBRE = \'X\' and no GR existed. Mantrix monitors MATDOC for movement type 101 against this PO line. When GR appears → notification: "GR posted. Ready to re-process."' },
  { icon: 'Chat', name: 'Buyer Response Detection', desc: 'Invoice was routed to a buyer for price variance approval. When buyer responds (via Mantrix routing or email), the response attaches to the invoice. Notification: "Buyer approved — contract escalation confirmed."' },
  { icon: 'Assignment', name: 'Service Entry Sheet Created', desc: 'Service PO invoice was parked because no SES existed in ESLH/ESKN. Mantrix monitors for SES creation against this PO line (ML81N completion). When SES appears → "Service entry sheet created."' },
  { icon: 'LockOpen', name: 'Vendor Block Lifted', desc: 'Invoice parked because vendor has payment block in LFB1-ZAHLS. Mantrix monitors vendor master for block removal. When cleared → "Vendor block removed. Invoice can proceed."' },
  { icon: 'Sync', name: 'PO Change Detection', desc: 'Invoice parked due to price mismatch. Buyer updates PO price in ME22N. Mantrix detects EKPO-NETPR change and re-runs match. If price now matches → "PO updated. Ready to post."' },
  { icon: 'Article', name: 'Additional GR (Partial Resolution)', desc: 'Invoice for 120 units, only 80 received. Parked. When additional GR posts (40 more units) → "Additional GR: now 120 of 120 received. Full match achieved."' },
];

export const personalStats = [
  { value: '94', label: 'Invoices Posted Today', trend: '↑ 12% vs. my 30-day avg (84)', trendType: 'up' },
  { value: '47s', label: 'Avg Time per Invoice', trend: '↓ from 62s last month', trendType: 'up' },
  { value: '91%', label: 'First-Pass Post Rate', trend: '↑ 3pts vs. last month', trendType: 'up' },
  { value: '14', label: 'AI Overrides This Week', trend: '12 improved accuracy · 2 neutral', trendType: 'neutral' },
];

export const personalKPIs = [
  { label: 'My Posted Value (This Month)', value: '$4.2M', sub: '1,847 invoices · 98.7% accuracy', color: '#059669' },
  { label: 'My Exception Resolution', value: '8 min avg', sub: 'Down from 22 min pre-Mantrix', color: '#d97706' },
  { label: 'AI Match Acceptance Rate', value: '89%', sub: 'I accepted 89% of AI matches — model learning from my 11% overrides', color: '#1976d2' },
  { label: 'Parked Items Avg Age', value: '2.4 days', sub: '7 currently parked · oldest: 8 days (vendor blocked)', color: '#00357a' },
];

// ============ LINE-ITEM MATCHING ENGINE ============

export const matchStrategies = [
  { id: 'key-based', name: 'Key-Based', weight: 30, description: 'PO line #, material #, item category — exact field match', icon: 'Key' },
  { id: 'vendor-material', name: 'Vendor-Material Dict', weight: 25, description: 'Learned vendor→material mapping from historical invoices', icon: 'MenuBook' },
  { id: 'semantic', name: 'Semantic', weight: 15, description: 'NLP comparison of invoice description vs PO description', icon: 'Psychology' },
  { id: 'qty-price', name: 'Qty/Price Heuristic', weight: 15, description: 'Quantity × unit-price cross-match with tolerance bands', icon: 'Calculate' },
  { id: 'gr-xref', name: 'GR Cross-Ref', weight: 10, description: 'Goods receipt line → PO line back-reference via MATDOC', icon: 'Inventory' },
  { id: 'elimination', name: 'Elimination', weight: 5, description: 'Remaining unmatched lines paired by exclusion', icon: 'FilterAlt' },
];

export const guardrailDefs = [
  // Hard stops — block posting
  { id: 'gs-price', name: 'Price Ceiling', type: 'hard', rule: 'Line unit price > PO price + tolerance → block', icon: 'Block' },
  { id: 'gs-qty', name: 'Over-Delivery', type: 'hard', rule: 'Invoice qty > GR qty (no tolerance override) → block', icon: 'Block' },
  { id: 'gs-dup', name: 'Duplicate Line', type: 'hard', rule: 'Same PO line billed twice in open invoices → block', icon: 'Block' },
  { id: 'gs-po-closed', name: 'PO Line Closed', type: 'hard', rule: 'EKPO delivery-complete flag set → block', icon: 'Block' },
  // Soft warnings — clerk can override
  { id: 'gs-price-drift', name: 'Price Drift', type: 'soft', rule: 'Unit price >1% but ≤3% above PO → warn', icon: 'Warning' },
  { id: 'gs-partial-gr', name: 'Partial GR', type: 'soft', rule: 'GR qty < invoice qty but remaining expected → warn', icon: 'Warning' },
  { id: 'gs-uom', name: 'UOM Mismatch', type: 'soft', rule: 'Invoice UOM ≠ PO UOM (convertible) → warn', icon: 'Warning' },
  // Audit rules — log only
  { id: 'gs-first-vendor', name: 'First Invoice', type: 'audit', rule: 'First invoice from this vendor-material combo → log', icon: 'Visibility' },
  { id: 'gs-amount-outlier', name: 'Amount Outlier', type: 'audit', rule: 'Line amount >2σ from vendor avg → log for review', icon: 'Visibility' },
];

// Line items for invoices — keyed by invoice id
export const invoiceLineItems = {
  // VND-INV-004231 — Krones Inc (id: 1) — clean 3-way match
  1: [
    { lineNum: 1, description: 'AZ LEMON 24PK 15OZ CAN', qty: 40, unit: 'EA', unitPrice: 680.00, amount: 27200.00, poLine: 10, matchStatus: 'matched', matchStrategy: 'key-based', confidence: 98.5, grRef: 'GR-4900000200' },
    { lineNum: 2, description: 'AZ GREEN 24PK 15OZ CAN', qty: 40, unit: 'EA', unitPrice: 245.00, amount: 9800.00, poLine: 20, matchStatus: 'matched', matchStrategy: 'key-based', confidence: 97.8, grRef: 'GR-4900000200' },
    { lineNum: 3, description: 'AZ PEACH 24PK 15OZ CAN', qty: 80, unit: 'EA', unitPrice: 52.50, amount: 4200.00, poLine: 30, matchStatus: 'matched', matchStrategy: 'vendor-material', confidence: 96.2, grRef: 'GR-4900000200' },
    { lineNum: 4, description: 'Shipping & Handling', qty: 1, unit: 'LS', unitPrice: 4000.00, amount: 4000.00, poLine: 40, matchStatus: 'matched', matchStrategy: 'elimination', confidence: 94.1, grRef: 'GR-4900000200' },
  ],
  // VND-INV-004233 — US Bottlers Machinery (id: 3) — price variance on line 2
  3: [
    { lineNum: 1, description: 'HB ARNOLD PALMER SPIKED (4X6) 24PK 12OZ', qty: 10, unit: 'EA', unitPrice: 18750.00, amount: 187500.00, poLine: 10, matchStatus: 'matched', matchStrategy: 'key-based', confidence: 97.2, grRef: 'GR-4900000210' },
    { lineNum: 2, description: 'AZ HARD GREEN TEA 24PK 12OZ CAN SLEEK', qty: 5, unit: 'EA', unitPrice: 22500.00, amount: 112500.00, poLine: 20, matchStatus: 'exception', matchStrategy: 'key-based', confidence: 42.0, grRef: 'GR-4900000210' },
    { lineNum: 3, description: 'AZ HARD LEMON TEA 24PK 12OZ CAN SLEEK', qty: 1, unit: 'LS', unitPrice: 12500.00, amount: 12500.00, poLine: 30, matchStatus: 'matched', matchStrategy: 'semantic', confidence: 91.5, grRef: 'GR-4900000210' },
  ],
  // VND-INV-009920 — Avenel Truck & Equipment (id: 5) — partial delivery, qty mismatch on line 3
  5: [
    { lineNum: 1, description: 'Shrink Wrap Film 18" Roll', qty: 500, unit: 'EA', unitPrice: 2.80, amount: 1400.00, poLine: 10, matchStatus: 'matched', matchStrategy: 'key-based', confidence: 99.1, grRef: 'GR-4900000260' },
    { lineNum: 2, description: 'Label Adhesive Industrial 5gal', qty: 500, unit: 'EA', unitPrice: 1.20, amount: 600.00, poLine: 20, matchStatus: 'matched', matchStrategy: 'vendor-material', confidence: 96.8, grRef: 'GR-4900000260' },
    { lineNum: 3, description: 'Pallet Corner Protectors', qty: 500, unit: 'EA', unitPrice: 1.90, amount: 950.00, poLine: 30, matchStatus: 'partial', matchStrategy: 'qty-price', confidence: 68.0, grRef: 'GR-4900000260' },
    { lineNum: 4, description: 'Stretch Band Wrap 20"', qty: 350, unit: 'EA', unitPrice: 0.85, amount: 297.50, poLine: 40, matchStatus: 'partial', matchStrategy: 'key-based', confidence: 72.4, grRef: null },
    { lineNum: 5, description: 'Expedited Freight Surcharge', qty: 1, unit: 'LS', unitPrice: 5502.50, amount: 5502.50, poLine: null, matchStatus: 'unplanned', matchStrategy: 'elimination', confidence: 35.0, grRef: null },
  ],
};

// PO line items — keyed by PO reference
export const poLineItems = {
  '3900051320': [
    { lineNum: 10, material: '1000910', description: 'AZ LEMON 24PK 15OZ CAN', qty: 40, unit: 'EA', unitPrice: 680.00, amount: 27200.00, grQty: 40, grDate: '02/03/2026' },
    { lineNum: 20, material: '1000912', description: 'AZ GREEN 24PK 15OZ CAN', qty: 40, unit: 'EA', unitPrice: 245.00, amount: 9800.00, grQty: 40, grDate: '02/03/2026' },
    { lineNum: 30, material: '1000913', description: 'AZ PEACH 24PK 15OZ CAN', qty: 80, unit: 'EA', unitPrice: 52.50, amount: 4200.00, grQty: 80, grDate: '02/03/2026' },
    { lineNum: 40, material: '900001', description: 'Shipping & Handling', qty: 1, unit: 'LS', unitPrice: 4000.00, amount: 4000.00, grQty: 1, grDate: '02/03/2026' },
  ],
  '3900049229': [
    { lineNum: 10, material: '1001535', description: 'HB ARNOLD PALMER SPIKED (4X6) 24PK 12OZ', qty: 10, unit: 'EA', unitPrice: 18750.00, amount: 187500.00, grQty: 10, grDate: '02/01/2026' },
    { lineNum: 20, material: '1000953', description: 'AZ HARD GREEN TEA 24PK 12OZ CAN SLEEK', qty: 5, unit: 'EA', unitPrice: 22000.00, amount: 110000.00, grQty: 5, grDate: '02/01/2026' },
    { lineNum: 30, material: '1000951', description: 'AZ HARD LEMON TEA 24PK 12OZ CAN SLEEK', qty: 1, unit: 'LS', unitPrice: 12500.00, amount: 12500.00, grQty: 1, grDate: '02/01/2026' },
  ],
  '3900051500': [
    { lineNum: 10, material: '500200', description: 'Shrink Wrap Film 18" Roll', qty: 500, unit: 'EA', unitPrice: 2.80, amount: 1400.00, grQty: 500, grDate: '02/02/2026' },
    { lineNum: 20, material: '500201', description: 'Label Adhesive Industrial 5gal', qty: 500, unit: 'EA', unitPrice: 1.20, amount: 600.00, grQty: 500, grDate: '02/02/2026' },
    { lineNum: 30, material: '500202', description: 'Pallet Corner Protectors', qty: 750, unit: 'EA', unitPrice: 1.90, amount: 1425.00, grQty: 500, grDate: '02/02/2026' },
    { lineNum: 40, material: '500203', description: 'Stretch Band Wrap 20"', qty: 500, unit: 'EA', unitPrice: 0.85, amount: 425.00, grQty: 350, grDate: '02/02/2026' },
  ],
};

// Line-level match results — keyed by invoice id
export const lineMatchResults = {
  1: [
    { invoiceLine: 1, poLine: 10, strategy: 'key-based', confidence: 98.5, varianceType: null, variancePct: 0, guardrailFlags: [], resolved: true },
    { invoiceLine: 2, poLine: 20, strategy: 'key-based', confidence: 97.8, varianceType: null, variancePct: 0, guardrailFlags: [], resolved: true },
    { invoiceLine: 3, poLine: 30, strategy: 'vendor-material', confidence: 96.2, varianceType: null, variancePct: 0, guardrailFlags: ['gs-first-vendor'], resolved: true },
    { invoiceLine: 4, poLine: 40, strategy: 'elimination', confidence: 94.1, varianceType: null, variancePct: 0, guardrailFlags: [], resolved: true },
  ],
  3: [
    { invoiceLine: 1, poLine: 10, strategy: 'key-based', confidence: 97.2, varianceType: null, variancePct: 0, guardrailFlags: [], resolved: true },
    { invoiceLine: 2, poLine: 20, strategy: 'key-based', confidence: 42.0, varianceType: 'price', variancePct: 2.27, guardrailFlags: ['gs-price-drift'], resolved: false },
    { invoiceLine: 3, poLine: 30, strategy: 'semantic', confidence: 91.5, varianceType: null, variancePct: 0, guardrailFlags: [], resolved: true },
  ],
  5: [
    { invoiceLine: 1, poLine: 10, strategy: 'key-based', confidence: 99.1, varianceType: null, variancePct: 0, guardrailFlags: [], resolved: true },
    { invoiceLine: 2, poLine: 20, strategy: 'vendor-material', confidence: 96.8, varianceType: null, variancePct: 0, guardrailFlags: [], resolved: true },
    { invoiceLine: 3, poLine: 30, strategy: 'qty-price', confidence: 68.0, varianceType: 'qty', variancePct: -33.3, guardrailFlags: ['gs-partial-gr'], resolved: false },
    { invoiceLine: 4, poLine: 40, strategy: 'key-based', confidence: 72.4, varianceType: 'qty', variancePct: -30.0, guardrailFlags: ['gs-partial-gr'], resolved: false },
    { invoiceLine: 5, poLine: null, strategy: 'elimination', confidence: 35.0, varianceType: 'unplanned', variancePct: null, guardrailFlags: ['gs-amount-outlier'], resolved: false },
  ],
};

// Exception line details — for ExceptionReview line-level table
export const exceptionLineDetails = {
  // US Bottlers Machinery — VND-INV-004233 (id: 3)
  3: [
    { lineNum: 1, exceptionType: null, field: null, invoiceVal: '$18,750.00', poVal: '$18,750.00', variance: '0%', aiSuggestion: 'Exact match — no action needed' },
    { lineNum: 2, exceptionType: 'Price Variance', field: 'Unit Price', invoiceVal: '$22,500.00', poVal: '$22,000.00', variance: '+2.27%', aiSuggestion: 'Contract escalation clause ZPR0 allows up to 3% — approve' },
    { lineNum: 3, exceptionType: null, field: null, invoiceVal: '$12,500.00', poVal: '$12,500.00', variance: '0%', aiSuggestion: 'Exact match — no action needed' },
  ],
  // Avenel Truck & Equipment — VND-INV-009920 (id: 5)
  5: [
    { lineNum: 1, exceptionType: null, field: null, invoiceVal: '500 EA', poVal: '500 EA', variance: '0%', aiSuggestion: 'Exact match' },
    { lineNum: 2, exceptionType: null, field: null, invoiceVal: '500 EA', poVal: '500 EA', variance: '0%', aiSuggestion: 'Exact match' },
    { lineNum: 3, exceptionType: 'Qty Mismatch', field: 'Quantity', invoiceVal: '500 EA', poVal: '750 EA (500 received)', variance: '-33.3%', aiSuggestion: 'Partial GR — 500 of 750 received. Remaining expected 02/07.' },
    { lineNum: 4, exceptionType: 'Qty Mismatch', field: 'Quantity', invoiceVal: '350 EA', poVal: '500 EA (350 received)', variance: '-30.0%', aiSuggestion: 'Partial GR — 350 of 500 received. Park and wait for remaining.' },
    { lineNum: 5, exceptionType: 'Unplanned Cost', field: 'No PO Line', invoiceVal: '$5,502.50', poVal: '—', variance: 'N/A', aiSuggestion: 'Expedited freight — no PO line. Suggest GL 54300 / CC1000.' },
  ],
};
