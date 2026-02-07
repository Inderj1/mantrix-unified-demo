/**
 * Pulse Command Center — Mock Data
 * Cross-module agentic dashboard data for all CORE.AI modules
 */

// ============================================
// MODULE_TREE — 7 modules with drill-down features
// ============================================
export const MODULE_TREE = [
  {
    id: 'stox', label: 'STOX.AI', description: 'Inventory Intelligence',
    icon: 'Inventory2', color: '#00357a',
    features: [
      { id: 'stox_stockout_risk', label: 'Stockout Risk' },
      { id: 'stox_excess_inventory', label: 'Excess Inventory' },
      { id: 'stox_demand_shift', label: 'Demand Shift' },
      { id: 'stox_lead_time_risk', label: 'Lead Time Risk' },
      { id: 'stox_mrp_optimization', label: 'MRP Optimization' },
      { id: 'stox_safety_stock', label: 'Safety Stock' },
      { id: 'stox_dc_rebalancing', label: 'DC Rebalancing' },
    ],
  },
  {
    id: 'margen', label: 'MARGEN.AI', description: 'Margin & Pricing Intelligence',
    icon: 'TrendingUp', color: '#0d47a1',
    features: [
      { id: 'margen_margin_erosion', label: 'Margin Erosion' },
      { id: 'margen_price_optimization', label: 'Price Optimization' },
      { id: 'margen_discount_leakage', label: 'Discount Leakage' },
      { id: 'margen_cost_variance', label: 'Cost Variance' },
      { id: 'margen_revenue_risk', label: 'Revenue Risk' },
    ],
  },
  {
    id: 'ap', label: 'AP.AI', description: 'Accounts Payable Intelligence',
    icon: 'AccountBalance', color: '#1565c0',
    features: [
      { id: 'ap_early_pay_discount', label: 'Early Pay Discount' },
      { id: 'ap_duplicate_detection', label: 'Duplicate Detection' },
      { id: 'ap_vendor_risk', label: 'Vendor Risk' },
      { id: 'ap_cash_flow', label: 'Cash Flow Optimization' },
      { id: 'ap_compliance', label: 'Compliance Check' },
    ],
  },
  {
    id: 'ordly', label: 'ORDLY.AI', description: 'Order Intelligence',
    icon: 'ShoppingCart', color: '#1976d2',
    features: [
      { id: 'ordly_order_anomaly', label: 'Order Anomaly' },
      { id: 'ordly_fulfillment_risk', label: 'Fulfillment Risk' },
      { id: 'ordly_demand_sensing', label: 'Demand Sensing' },
      { id: 'ordly_allocation', label: 'Allocation Optimization' },
      { id: 'ordly_atp_check', label: 'ATP Check' },
    ],
  },
  {
    id: 'o2c', label: 'O2C.AI', description: 'Order-to-Cash Intelligence',
    icon: 'Receipt', color: '#1e88e5',
    features: [
      { id: 'o2c_dso_risk', label: 'DSO Risk' },
      { id: 'o2c_credit_exposure', label: 'Credit Exposure' },
      { id: 'o2c_collection_priority', label: 'Collection Priority' },
      { id: 'o2c_dispute_prediction', label: 'Dispute Prediction' },
      { id: 'o2c_revenue_leakage', label: 'Revenue Leakage' },
    ],
  },
  {
    id: 'traxx', label: 'TRAXX.AI', description: 'Logistics Intelligence',
    icon: 'LocalShipping', color: '#2196f3',
    features: [
      { id: 'traxx_shipment_delay', label: 'Shipment Delay' },
      { id: 'traxx_carrier_performance', label: 'Carrier Performance' },
      { id: 'traxx_freight_cost', label: 'Freight Cost' },
      { id: 'traxx_route_compliance', label: 'Route Compliance' },
      { id: 'traxx_dock_scheduling', label: 'Dock Scheduling' },
    ],
  },
  {
    id: 'route', label: 'ROUTE.AI', description: 'Route & Distribution Intelligence',
    icon: 'AltRoute', color: '#42a5f5',
    features: [
      { id: 'route_network_optimization', label: 'Network Optimization' },
      { id: 'route_last_mile', label: 'Last Mile Efficiency' },
      { id: 'route_consolidation', label: 'Load Consolidation' },
      { id: 'route_carbon_footprint', label: 'Carbon Footprint' },
    ],
  },
];

// ============================================
// SCOPE_DIMENSIONS — 7 filterable dimensions
// ============================================
export const SCOPE_DIMENSIONS = [
  {
    id: 'plant', label: 'Plant', icon: 'Factory',
    items: [
      { id: 'P1000', label: 'P1000 — Dallas' },
      { id: 'P2000', label: 'P2000 — Chicago' },
      { id: 'P3000', label: 'P3000 — Atlanta' },
      { id: 'P4000', label: 'P4000 — Phoenix' },
      { id: 'P5000', label: 'P5000 — Seattle' },
    ],
    applicableModules: ['stox', 'margen', 'ordly', 'o2c', 'route'],
  },
  {
    id: 'dc', label: 'DC', icon: 'Warehouse',
    items: [
      { id: 'DC-EAST', label: 'DC-East — Newark' },
      { id: 'DC-CENTRAL', label: 'DC-Central — Memphis' },
      { id: 'DC-WEST', label: 'DC-West — Reno' },
      { id: 'DC-SOUTH', label: 'DC-South — Houston' },
    ],
    applicableModules: ['stox', 'route', 'traxx'],
  },
  {
    id: 'customer', label: 'Customer', icon: 'People',
    items: [
      { id: 'CUST-1001', label: 'Acme Manufacturing' },
      { id: 'CUST-1002', label: 'Global Electronics Inc' },
      { id: 'CUST-1003', label: 'Pacific Metals Corp' },
      { id: 'CUST-1004', label: 'Atlas Industrial' },
      { id: 'CUST-1005', label: 'Meridian Components' },
      { id: 'CUST-1006', label: 'Summit Precision Ltd' },
    ],
    applicableModules: ['stox', 'margen', 'ordly', 'o2c'],
  },
  {
    id: 'vendor', label: 'Vendor', icon: 'Business',
    items: [
      { id: 'VEND-2001', label: 'United Raw Materials' },
      { id: 'VEND-2002', label: 'PrimeTech Supplies' },
      { id: 'VEND-2003', label: 'Continental Chemicals' },
      { id: 'VEND-2004', label: 'Northern Steel Works' },
    ],
    applicableModules: ['stox', 'ap', 'margen'],
  },
  {
    id: 'material', label: 'Material', icon: 'Category',
    items: [
      { id: 'MAT-3001', label: 'MAT-3001 Alloy Sheet A4' },
      { id: 'MAT-3002', label: 'MAT-3002 Polymer Resin B7' },
      { id: 'MAT-3003', label: 'MAT-3003 Copper Wire C12' },
      { id: 'MAT-3004', label: 'MAT-3004 Carbon Fiber D9' },
      { id: 'MAT-3005', label: 'MAT-3005 Titanium Rod E3' },
    ],
    applicableModules: ['stox', 'margen', 'ordly'],
  },
  {
    id: 'region', label: 'Region', icon: 'Public',
    items: [
      { id: 'NA-EAST', label: 'North America East' },
      { id: 'NA-WEST', label: 'North America West' },
      { id: 'NA-CENTRAL', label: 'North America Central' },
      { id: 'EMEA', label: 'EMEA' },
      { id: 'APAC', label: 'Asia Pacific' },
      { id: 'LATAM', label: 'Latin America' },
    ],
    applicableModules: ['stox', 'margen', 'ap', 'ordly', 'o2c', 'traxx', 'route'],
  },
  {
    id: 'order', label: 'Order', icon: 'Assignment',
    items: [
      { id: 'SO-900101', label: 'SO-900101' },
      { id: 'SO-900234', label: 'SO-900234' },
      { id: 'SO-900378', label: 'SO-900378' },
      { id: 'SO-900412', label: 'SO-900412' },
    ],
    applicableModules: ['ordly', 'o2c'],
  },
];

// ============================================
// PULSE_EVENTS — 18 cross-module events
// ============================================
const now = new Date();
const minutesAgo = (m) => new Date(now.getTime() - m * 60000).toISOString();

export const PULSE_EVENTS = [
  // --- STOX (3) ---
  {
    id: 'EVT-001', timestamp: minutesAgo(2),
    moduleId: 'stox', moduleLabel: 'STOX.AI', moduleColor: '#00357a',
    featureId: 'stox_stockout_risk', featureLabel: 'Stockout Risk',
    severity: 'critical', type: 'alert',
    title: 'Imminent stockout: MAT-3001 Alloy Sheet at P1000',
    summary: 'Current stock covers 3 days of demand. Replenishment lead time is 8 days. Immediate PO required to prevent production stoppage.',
    aiConfidence: 0.96, impactValue: 125000, impactLabel: 'Production at risk',
    scope: { plant: 'P1000', material: 'MAT-3001', region: 'NA-EAST' },
    erpActions: [
      { id: 'a1', label: 'Create Purchase Order', icon: 'ShoppingCart', target: 'ME21N', risk: 'write' },
      { id: 'a2', label: 'Stock Transfer from DC-East', icon: 'SwapHoriz', target: 'LT01', risk: 'write' },
      { id: 'a3', label: 'View Stock Overview', icon: 'Visibility', target: 'MMBE', risk: 'read' },
    ],
    erpFields: [
      { field: 'MATNR', label: 'Material', value: 'MAT-3001', table: 'MARA' },
      { field: 'WERKS', label: 'Plant', value: 'P1000', table: 'MARC' },
      { field: 'LABST', label: 'Unrestricted Stock', value: '1,240 EA', table: 'MARD' },
      { field: 'EISBE', label: 'Safety Stock', value: '3,000 EA', table: 'MARC' },
      { field: 'PLIFZ', label: 'Planned Delivery Time', value: '8 days', table: 'MARC' },
    ],
    relatedAlerts: ['EVT-007'],
    status: 'new',
  },
  {
    id: 'EVT-002', timestamp: minutesAgo(12),
    moduleId: 'stox', moduleLabel: 'STOX.AI', moduleColor: '#00357a',
    featureId: 'stox_excess_inventory', featureLabel: 'Excess Inventory',
    severity: 'warning', type: 'insight',
    title: 'Excess inventory detected: MAT-3002 at DC-West',
    summary: '142 days of supply on hand vs. 45-day target. Carrying cost accruing at $8.2K/month. Consider redistribution to DC-East where coverage is low.',
    aiConfidence: 0.89, impactValue: 98400, impactLabel: 'Annual carrying cost',
    scope: { dc: 'DC-WEST', material: 'MAT-3002', region: 'NA-WEST' },
    erpActions: [
      { id: 'a1', label: 'Create Stock Transfer', icon: 'SwapHoriz', target: 'LT01', risk: 'write' },
      { id: 'a2', label: 'View Inventory Aging', icon: 'Visibility', target: 'MB52', risk: 'read' },
    ],
    erpFields: [
      { field: 'MATNR', label: 'Material', value: 'MAT-3002', table: 'MARA' },
      { field: 'LGORT', label: 'Storage Location', value: 'DC-WEST', table: 'MARD' },
      { field: 'LABST', label: 'Unrestricted Stock', value: '28,400 EA', table: 'MARD' },
      { field: 'VERPR', label: 'Moving Avg Price', value: '$14.20', table: 'MBEW' },
    ],
    relatedAlerts: [],
    status: 'acknowledged',
  },
  {
    id: 'EVT-003', timestamp: minutesAgo(28),
    moduleId: 'stox', moduleLabel: 'STOX.AI', moduleColor: '#00357a',
    featureId: 'stox_demand_shift', featureLabel: 'Demand Shift',
    severity: 'info', type: 'recommendation',
    title: 'Demand pattern shift detected for Carbon Fiber D9',
    summary: 'Weekly demand increased 23% over the last 4 weeks. Seasonal model predicts sustained elevation through Q2. Safety stock adjustment recommended.',
    aiConfidence: 0.82, impactValue: 45000, impactLabel: 'Potential shortfall',
    scope: { material: 'MAT-3004', region: 'NA-CENTRAL' },
    erpActions: [
      { id: 'a1', label: 'Adjust Safety Stock', icon: 'TuneOutlined', target: 'MM02', risk: 'write' },
      { id: 'a2', label: 'View Consumption', icon: 'Visibility', target: 'MC.9', risk: 'read' },
    ],
    erpFields: [
      { field: 'MATNR', label: 'Material', value: 'MAT-3004', table: 'MARA' },
      { field: 'EISBE', label: 'Current Safety Stock', value: '1,800 EA', table: 'MARC' },
      { field: 'EISBE', label: 'Recommended Safety Stock', value: '2,450 EA', table: 'MARC' },
    ],
    relatedAlerts: [],
    status: 'new',
  },

  // --- MARGEN (3) ---
  {
    id: 'EVT-004', timestamp: minutesAgo(5),
    moduleId: 'margen', moduleLabel: 'MARGEN.AI', moduleColor: '#0d47a1',
    featureId: 'margen_margin_erosion', featureLabel: 'Margin Erosion',
    severity: 'high', type: 'alert',
    title: 'Margin erosion: Pacific Metals Corp — 4.2pp decline',
    summary: 'Gross margin dropped from 32.1% to 27.9% over 3 months. Primary driver: raw material cost increase not passed through in pricing. Revenue at risk if trend continues.',
    aiConfidence: 0.93, impactValue: 218000, impactLabel: 'Margin at risk (annual)',
    scope: { customer: 'CUST-1003', region: 'NA-WEST', plant: 'P4000' },
    erpActions: [
      { id: 'a1', label: 'Update Pricing Conditions', icon: 'AttachMoney', target: 'VK11', risk: 'write' },
      { id: 'a2', label: 'View COPA Report', icon: 'Visibility', target: 'KE24', risk: 'read' },
      { id: 'a3', label: 'Customer Profitability', icon: 'Assessment', target: 'KE30', risk: 'read' },
    ],
    erpFields: [
      { field: 'KUNNR', label: 'Customer', value: 'CUST-1003', table: 'KNA1' },
      { field: 'KSCHL', label: 'Condition Type', value: 'PR00', table: 'KONP' },
      { field: 'KBETR', label: 'Current Price', value: '$142.50', table: 'KONP' },
      { field: 'KWERT', label: 'Net Revenue', value: '$1.24M', table: 'CE1xxxx' },
    ],
    relatedAlerts: ['EVT-005'],
    status: 'new',
  },
  {
    id: 'EVT-005', timestamp: minutesAgo(18),
    moduleId: 'margen', moduleLabel: 'MARGEN.AI', moduleColor: '#0d47a1',
    featureId: 'margen_discount_leakage', featureLabel: 'Discount Leakage',
    severity: 'warning', type: 'insight',
    title: 'Discount leakage: $47K in unauthorized off-invoice discounts',
    summary: '12 orders in Q1 had discounts exceeding policy thresholds without proper approval chain. Concentrated in NA-East region under 3 sales reps.',
    aiConfidence: 0.91, impactValue: 47200, impactLabel: 'Leaked discount value',
    scope: { region: 'NA-EAST' },
    erpActions: [
      { id: 'a1', label: 'Audit Condition Records', icon: 'Search', target: 'VK13', risk: 'read' },
      { id: 'a2', label: 'Tighten Approval Workflow', icon: 'Lock', target: 'SPRO', risk: 'write' },
    ],
    erpFields: [
      { field: 'KSCHL', label: 'Condition Type', value: 'K007 (Discount)', table: 'KONP' },
      { field: 'KBETR', label: 'Avg Discount %', value: '18.4%', table: 'KONP' },
      { field: 'KBETR', label: 'Policy Max %', value: '12.0%', table: 'KONP' },
    ],
    relatedAlerts: ['EVT-004'],
    status: 'acknowledged',
  },
  {
    id: 'EVT-006', timestamp: minutesAgo(45),
    moduleId: 'margen', moduleLabel: 'MARGEN.AI', moduleColor: '#0d47a1',
    featureId: 'margen_price_optimization', featureLabel: 'Price Optimization',
    severity: 'opportunity', type: 'recommendation',
    title: 'Price optimization opportunity: Copper Wire C12 segment',
    summary: 'Win-rate analysis shows 15% headroom for price increase in industrial-grade C12. Competitors have already adjusted. Estimated additional revenue: $89K/quarter.',
    aiConfidence: 0.87, impactValue: 356000, impactLabel: 'Annual upside',
    scope: { material: 'MAT-3003', region: 'NA-CENTRAL' },
    erpActions: [
      { id: 'a1', label: 'Create Price Simulation', icon: 'Calculate', target: 'VK31', risk: 'read' },
      { id: 'a2', label: 'Update Condition Records', icon: 'AttachMoney', target: 'VK11', risk: 'write' },
    ],
    erpFields: [
      { field: 'MATNR', label: 'Material', value: 'MAT-3003', table: 'MARA' },
      { field: 'KBETR', label: 'Current Price', value: '$8.40/ft', table: 'KONP' },
      { field: 'KBETR', label: 'Recommended Price', value: '$9.65/ft', table: 'KONP' },
    ],
    relatedAlerts: [],
    status: 'new',
  },

  // --- AP (2) ---
  {
    id: 'EVT-007', timestamp: minutesAgo(8),
    moduleId: 'ap', moduleLabel: 'AP.AI', moduleColor: '#1565c0',
    featureId: 'ap_early_pay_discount', featureLabel: 'Early Pay Discount',
    severity: 'opportunity', type: 'recommendation',
    title: 'Early payment discount: $18.3K available — expires in 48h',
    summary: '7 invoices from United Raw Materials qualify for 2/10 net 30 terms. Current cash position supports early payment. Net benefit after cost of capital: $14.1K.',
    aiConfidence: 0.95, impactValue: 18300, impactLabel: 'Discount available',
    scope: { vendor: 'VEND-2001', region: 'NA-EAST' },
    erpActions: [
      { id: 'a1', label: 'Schedule Payment Run', icon: 'Payment', target: 'F110', risk: 'write' },
      { id: 'a2', label: 'View Open Items', icon: 'Visibility', target: 'FBL1N', risk: 'read' },
    ],
    erpFields: [
      { field: 'LIFNR', label: 'Vendor', value: 'VEND-2001', table: 'LFA1' },
      { field: 'ZTERM', label: 'Payment Terms', value: '2/10 Net 30', table: 'LFB1' },
      { field: 'DMBTR', label: 'Total Open Amount', value: '$915,000', table: 'BSIK' },
      { field: 'SKNTO', label: 'Discount Amount', value: '$18,300', table: 'BSIK' },
    ],
    relatedAlerts: [],
    status: 'new',
  },
  {
    id: 'EVT-008', timestamp: minutesAgo(35),
    moduleId: 'ap', moduleLabel: 'AP.AI', moduleColor: '#1565c0',
    featureId: 'ap_duplicate_detection', featureLabel: 'Duplicate Detection',
    severity: 'high', type: 'alert',
    title: 'Potential duplicate invoice: PrimeTech Supplies INV-8842',
    summary: 'Invoice INV-8842 ($24,600) has 94% similarity with INV-8839 posted 3 days ago. Same vendor, amount within $12, overlapping line items. Manual review required before payment.',
    aiConfidence: 0.94, impactValue: 24600, impactLabel: 'Duplicate exposure',
    scope: { vendor: 'VEND-2002' },
    erpActions: [
      { id: 'a1', label: 'Block Invoice', icon: 'Block', target: 'MRBR', risk: 'write' },
      { id: 'a2', label: 'Compare Documents', icon: 'Compare', target: 'MIR4', risk: 'read' },
    ],
    erpFields: [
      { field: 'BELNR', label: 'Document Number', value: 'INV-8842', table: 'RBKP' },
      { field: 'LIFNR', label: 'Vendor', value: 'VEND-2002', table: 'RBKP' },
      { field: 'RMWWR', label: 'Gross Amount', value: '$24,600.00', table: 'RBKP' },
      { field: 'BELNR', label: 'Potential Dup', value: 'INV-8839', table: 'RBKP' },
    ],
    relatedAlerts: [],
    status: 'new',
  },

  // --- ORDLY (3) ---
  {
    id: 'EVT-009', timestamp: minutesAgo(3),
    moduleId: 'ordly', moduleLabel: 'ORDLY.AI', moduleColor: '#1976d2',
    featureId: 'ordly_order_anomaly', featureLabel: 'Order Anomaly',
    severity: 'high', type: 'alert',
    title: 'Order anomaly: SO-900234 quantity 5x historical average',
    summary: 'Sales order SO-900234 from Acme Manufacturing requests 12,000 EA of MAT-3001 vs. typical order of 2,400 EA. Could indicate bulk buy, data entry error, or demand spike.',
    aiConfidence: 0.88, impactValue: 170400, impactLabel: 'Order value',
    scope: { customer: 'CUST-1001', order: 'SO-900234', material: 'MAT-3001', plant: 'P1000' },
    erpActions: [
      { id: 'a1', label: 'View Sales Order', icon: 'Visibility', target: 'VA03', risk: 'read' },
      { id: 'a2', label: 'Contact Customer', icon: 'Phone', target: 'BP', risk: 'read' },
      { id: 'a3', label: 'Run ATP Check', icon: 'CheckCircle', target: 'CO09', risk: 'read' },
    ],
    erpFields: [
      { field: 'VBELN', label: 'Sales Order', value: 'SO-900234', table: 'VBAK' },
      { field: 'KUNNR', label: 'Sold-to Party', value: 'CUST-1001', table: 'VBAK' },
      { field: 'KWMENG', label: 'Order Qty', value: '12,000 EA', table: 'VBAP' },
      { field: 'NETWR', label: 'Net Value', value: '$170,400', table: 'VBAP' },
      { field: 'EDATU', label: 'Req. Delivery Date', value: '2026-02-21', table: 'VBEP' },
    ],
    relatedAlerts: ['EVT-001'],
    status: 'new',
  },
  {
    id: 'EVT-010', timestamp: minutesAgo(22),
    moduleId: 'ordly', moduleLabel: 'ORDLY.AI', moduleColor: '#1976d2',
    featureId: 'ordly_fulfillment_risk', featureLabel: 'Fulfillment Risk',
    severity: 'critical', type: 'alert',
    title: 'Fulfillment at risk: 3 orders may miss committed dates',
    summary: 'Orders SO-900101, SO-900378, SO-900412 have delivery dates within 5 business days but insufficient ATP. Combined customer impact: Atlas Industrial, Meridian Components.',
    aiConfidence: 0.92, impactValue: 312000, impactLabel: 'Revenue at risk',
    scope: { plant: 'P2000', region: 'NA-CENTRAL' },
    erpActions: [
      { id: 'a1', label: 'Mass ATP Check', icon: 'CheckCircle', target: 'CO06', risk: 'read' },
      { id: 'a2', label: 'Reschedule Orders', icon: 'Schedule', target: 'VA02', risk: 'write' },
      { id: 'a3', label: 'Expedite Production', icon: 'Speed', target: 'CO02', risk: 'write' },
    ],
    erpFields: [
      { field: 'VBELN', label: 'Orders at Risk', value: '3 orders', table: 'VBAK' },
      { field: 'WERKS', label: 'Fulfilling Plant', value: 'P2000', table: 'VBAP' },
      { field: 'WMENG', label: 'Total Qty Short', value: '4,200 EA', table: 'VBEP' },
    ],
    relatedAlerts: [],
    status: 'in_progress',
  },
  {
    id: 'EVT-011', timestamp: minutesAgo(55),
    moduleId: 'ordly', moduleLabel: 'ORDLY.AI', moduleColor: '#1976d2',
    featureId: 'ordly_demand_sensing', featureLabel: 'Demand Sensing',
    severity: 'info', type: 'insight',
    title: 'Demand sensing: Atlas Industrial likely to place large Q2 order',
    summary: 'Based on order cadence, RFQ activity, and inventory drawdown patterns, Atlas Industrial has 78% probability of a $200K+ order within 3 weeks.',
    aiConfidence: 0.78, impactValue: 210000, impactLabel: 'Expected order value',
    scope: { customer: 'CUST-1004', region: 'NA-EAST' },
    erpActions: [
      { id: 'a1', label: 'View Customer Master', icon: 'People', target: 'XD03', risk: 'read' },
      { id: 'a2', label: 'Check Material Availability', icon: 'Inventory', target: 'MD04', risk: 'read' },
    ],
    erpFields: [
      { field: 'KUNNR', label: 'Customer', value: 'CUST-1004', table: 'KNA1' },
      { field: 'AUFNR', label: 'Last Order', value: 'SO-899821', table: 'VBAK' },
      { field: 'NETWR', label: 'Avg Order Value', value: '$185,000', table: 'VBAK' },
    ],
    relatedAlerts: [],
    status: 'new',
  },

  // --- O2C (2) ---
  {
    id: 'EVT-012', timestamp: minutesAgo(15),
    moduleId: 'o2c', moduleLabel: 'O2C.AI', moduleColor: '#1e88e5',
    featureId: 'o2c_dso_risk', featureLabel: 'DSO Risk',
    severity: 'high', type: 'alert',
    title: 'DSO spike: Global Electronics Inc — 68 days (target: 45)',
    summary: 'Days Sales Outstanding for Global Electronics increased from 42 to 68 days over last quarter. 3 invoices totaling $186K are past due. Credit limit utilization at 89%.',
    aiConfidence: 0.91, impactValue: 186000, impactLabel: 'Past due amount',
    scope: { customer: 'CUST-1002', region: 'NA-EAST' },
    erpActions: [
      { id: 'a1', label: 'View Aging Report', icon: 'Visibility', target: 'FBL5N', risk: 'read' },
      { id: 'a2', label: 'Send Dunning Notice', icon: 'Email', target: 'F150', risk: 'write' },
      { id: 'a3', label: 'Adjust Credit Limit', icon: 'CreditCard', target: 'FD32', risk: 'write' },
    ],
    erpFields: [
      { field: 'KUNNR', label: 'Customer', value: 'CUST-1002', table: 'KNA1' },
      { field: 'KLIMK', label: 'Credit Limit', value: '$500,000', table: 'KNKK' },
      { field: 'SKFOR', label: 'Credit Exposure', value: '$445,000', table: 'KNKK' },
      { field: 'MAHNS', label: 'Dunning Level', value: '2', table: 'KNB1' },
    ],
    relatedAlerts: [],
    status: 'new',
  },
  {
    id: 'EVT-013', timestamp: minutesAgo(40),
    moduleId: 'o2c', moduleLabel: 'O2C.AI', moduleColor: '#1e88e5',
    featureId: 'o2c_dispute_prediction', featureLabel: 'Dispute Prediction',
    severity: 'warning', type: 'insight',
    title: 'Dispute prediction: 72% chance of pricing dispute on INV-44521',
    summary: 'Invoice INV-44521 to Meridian Components shows pricing deviation from contract terms. Historical pattern: similar deviations led to disputes 72% of the time.',
    aiConfidence: 0.72, impactValue: 34800, impactLabel: 'Invoice amount',
    scope: { customer: 'CUST-1005', order: 'SO-900101' },
    erpActions: [
      { id: 'a1', label: 'Review Invoice', icon: 'Visibility', target: 'VF03', risk: 'read' },
      { id: 'a2', label: 'Create Credit Memo', icon: 'Receipt', target: 'VA01', risk: 'write' },
    ],
    erpFields: [
      { field: 'VBELN', label: 'Billing Doc', value: 'INV-44521', table: 'VBRK' },
      { field: 'NETWR', label: 'Net Amount', value: '$34,800', table: 'VBRK' },
      { field: 'KUNNR', label: 'Payer', value: 'CUST-1005', table: 'VBRK' },
    ],
    relatedAlerts: [],
    status: 'acknowledged',
  },

  // --- TRAXX (2) ---
  {
    id: 'EVT-014', timestamp: minutesAgo(10),
    moduleId: 'traxx', moduleLabel: 'TRAXX.AI', moduleColor: '#2196f3',
    featureId: 'traxx_shipment_delay', featureLabel: 'Shipment Delay',
    severity: 'high', type: 'alert',
    title: 'Shipment delay: 4 outbound loads from DC-Central delayed 2+ days',
    summary: 'Carrier FreightCo reported equipment shortage at Memphis hub. 4 loads scheduled for today are delayed. Affected customers: Acme Mfg, Pacific Metals. Consider alternate carriers.',
    aiConfidence: 0.97, impactValue: 82000, impactLabel: 'Shipment value',
    scope: { dc: 'DC-CENTRAL', region: 'NA-CENTRAL' },
    erpActions: [
      { id: 'a1', label: 'Reassign Carrier', icon: 'SwapHoriz', target: 'VT02N', risk: 'write' },
      { id: 'a2', label: 'View Shipment Status', icon: 'Visibility', target: 'VT03N', risk: 'read' },
      { id: 'a3', label: 'Notify Customers', icon: 'Email', target: 'SO01', risk: 'write' },
    ],
    erpFields: [
      { field: 'TKNUM', label: 'Shipments', value: '4 loads', table: 'VTTK' },
      { field: 'TDLNR', label: 'Carrier', value: 'FreightCo', table: 'VTTK' },
      { field: 'DPTBG', label: 'Orig. Departure', value: 'Today 06:00', table: 'VTTK' },
      { field: 'DPTBG', label: 'Revised Departure', value: 'Tomorrow 10:00', table: 'VTTK' },
    ],
    relatedAlerts: [],
    status: 'in_progress',
  },
  {
    id: 'EVT-015', timestamp: minutesAgo(60),
    moduleId: 'traxx', moduleLabel: 'TRAXX.AI', moduleColor: '#2196f3',
    featureId: 'traxx_freight_cost', featureLabel: 'Freight Cost',
    severity: 'warning', type: 'insight',
    title: 'Freight cost anomaly: LTL rates up 12% vs. contracted rates',
    summary: 'Last 30 days of LTL shipments from DC-South show average cost 12% above contracted rates. Fuel surcharge adjustments and accessorial charges are primary drivers.',
    aiConfidence: 0.85, impactValue: 64000, impactLabel: 'Annual overspend',
    scope: { dc: 'DC-SOUTH', region: 'NA-EAST' },
    erpActions: [
      { id: 'a1', label: 'View Freight Analysis', icon: 'Assessment', target: 'VF05N', risk: 'read' },
      { id: 'a2', label: 'Update Rate Table', icon: 'Edit', target: 'VT01N', risk: 'write' },
    ],
    erpFields: [
      { field: 'TDLNR', label: 'Primary Carrier', value: 'FastHaul Inc', table: 'VTTK' },
      { field: 'KBETR', label: 'Contracted Rate', value: '$2.15/mi', table: 'KONP' },
      { field: 'KBETR', label: 'Actual Avg Rate', value: '$2.41/mi', table: 'KONP' },
    ],
    relatedAlerts: [],
    status: 'new',
  },

  // --- ROUTE (2) ---
  {
    id: 'EVT-016', timestamp: minutesAgo(20),
    moduleId: 'route', moduleLabel: 'ROUTE.AI', moduleColor: '#42a5f5',
    featureId: 'route_consolidation', featureLabel: 'Load Consolidation',
    severity: 'opportunity', type: 'recommendation',
    title: 'Load consolidation opportunity: 3 partial loads to NA-West',
    summary: 'Three partial truckloads scheduled for NA-West region this week can be consolidated into 2 FTL shipments. Estimated savings: $4,200 in freight + 1.8 ton CO2 reduction.',
    aiConfidence: 0.90, impactValue: 4200, impactLabel: 'Freight savings',
    scope: { dc: 'DC-WEST', region: 'NA-WEST' },
    erpActions: [
      { id: 'a1', label: 'Create Consolidated Shipment', icon: 'MergeType', target: 'VT01N', risk: 'write' },
      { id: 'a2', label: 'View Route Plan', icon: 'Map', target: 'VT03N', risk: 'read' },
    ],
    erpFields: [
      { field: 'TKNUM', label: 'Shipments to Merge', value: '3 loads', table: 'VTTK' },
      { field: 'BTGEW', label: 'Combined Weight', value: '38,200 lbs', table: 'VTTK' },
      { field: 'ROUTE', label: 'Route', value: 'DC-West → NA-West', table: 'VTTK' },
    ],
    relatedAlerts: [],
    status: 'new',
  },
  {
    id: 'EVT-017', timestamp: minutesAgo(90),
    moduleId: 'route', moduleLabel: 'ROUTE.AI', moduleColor: '#42a5f5',
    featureId: 'route_last_mile', featureLabel: 'Last Mile Efficiency',
    severity: 'info', type: 'insight',
    title: 'Last mile efficiency: Phoenix metro delivery window optimization',
    summary: 'Analysis of 180 Phoenix-area deliveries shows 22% of stops fall outside optimal time windows. Resequencing could reduce fleet hours by 15% and improve on-time rate to 96%.',
    aiConfidence: 0.84, impactValue: 31000, impactLabel: 'Annual fleet savings',
    scope: { plant: 'P4000', region: 'NA-WEST' },
    erpActions: [
      { id: 'a1', label: 'View Route Analytics', icon: 'Map', target: 'VT03N', risk: 'read' },
      { id: 'a2', label: 'Update Delivery Windows', icon: 'Schedule', target: 'VD02', risk: 'write' },
    ],
    erpFields: [
      { field: 'WERKS', label: 'Shipping Point', value: 'P4000', table: 'TVST' },
      { field: 'ROUTE', label: 'Route Zone', value: 'PHX-Metro', table: 'TVRO' },
      { field: 'LFDAT', label: 'Avg Deliveries/Day', value: '14', table: 'LIKP' },
    ],
    relatedAlerts: [],
    status: 'new',
  },

  // --- Cross-module (1) ---
  {
    id: 'EVT-018', timestamp: minutesAgo(1),
    moduleId: 'stox', moduleLabel: 'CROSS-MODULE', moduleColor: '#00357a',
    featureId: 'stox_stockout_risk', featureLabel: 'Stockout Risk',
    severity: 'critical', type: 'action_complete',
    title: 'AI Agent completed: Emergency reorder for Titanium Rod E3',
    summary: 'STOX.AI agent triggered auto-PO for 5,000 EA of MAT-3005 based on critical stockout forecast. PO-4501187 created with VEND-2004 (Northern Steel). Delivery ETA: Feb 14. O2C notified for downstream order holds.',
    aiConfidence: 0.98, impactValue: 89000, impactLabel: 'PO value created',
    scope: { plant: 'P3000', vendor: 'VEND-2004', material: 'MAT-3005', region: 'NA-EAST' },
    erpActions: [
      { id: 'a1', label: 'View Purchase Order', icon: 'Visibility', target: 'ME23N', risk: 'read' },
      { id: 'a2', label: 'Track Delivery', icon: 'LocalShipping', target: 'ME2M', risk: 'read' },
    ],
    erpFields: [
      { field: 'EBELN', label: 'PO Number', value: 'PO-4501187', table: 'EKKO' },
      { field: 'LIFNR', label: 'Vendor', value: 'VEND-2004', table: 'EKKO' },
      { field: 'MATNR', label: 'Material', value: 'MAT-3005', table: 'EKPO' },
      { field: 'MENGE', label: 'Quantity', value: '5,000 EA', table: 'EKPO' },
      { field: 'EINDT', label: 'Delivery Date', value: '2026-02-14', table: 'EKET' },
      { field: 'NETWR', label: 'Net Value', value: '$89,000', table: 'EKPO' },
    ],
    relatedAlerts: ['EVT-001', 'EVT-010'],
    status: 'resolved',
  },
];

// ============================================
// MODULE_KPIS — per-module + global KPI cards
// ============================================
export const MODULE_KPIS = {
  stox: [
    { id: 'stox_k1', label: 'Stockout Alerts', value: '4', trend: '+2 vs last week', trendDirection: 'up', color: '#ef4444', icon: 'Warning' },
    { id: 'stox_k2', label: 'Excess Inventory', value: '$1.4M', trend: '-8% vs target', trendDirection: 'down', color: '#f59e0b', icon: 'Inventory2' },
    { id: 'stox_k3', label: 'Fill Rate', value: '94.2%', trend: '+1.1pp', trendDirection: 'up', color: '#10b981', icon: 'CheckCircle' },
    { id: 'stox_k4', label: 'MRP Exceptions', value: '28', trend: '-5 resolved today', trendDirection: 'down', color: '#00357a', icon: 'Settings' },
  ],
  margen: [
    { id: 'margen_k1', label: 'Avg Gross Margin', value: '31.4%', trend: '-0.8pp vs Q4', trendDirection: 'down', color: '#ef4444', icon: 'TrendingDown' },
    { id: 'margen_k2', label: 'Revenue at Risk', value: '$574K', trend: '3 accounts flagged', trendDirection: 'up', color: '#f59e0b', icon: 'Warning' },
    { id: 'margen_k3', label: 'Price Opportunities', value: '7', trend: '$356K potential', trendDirection: 'up', color: '#10b981', icon: 'TrendingUp' },
    { id: 'margen_k4', label: 'Discount Leakage', value: '$47K', trend: 'Q1 to date', trendDirection: 'up', color: '#ff751f', icon: 'MoneyOff' },
  ],
  ap: [
    { id: 'ap_k1', label: 'Open Invoices', value: '142', trend: '+12 this week', trendDirection: 'up', color: '#00357a', icon: 'Receipt' },
    { id: 'ap_k2', label: 'Discounts Available', value: '$42K', trend: '9 invoices', trendDirection: 'up', color: '#10b981', icon: 'Savings' },
    { id: 'ap_k3', label: 'Duplicate Risk', value: '3', trend: '$58K exposure', trendDirection: 'up', color: '#ef4444', icon: 'ContentCopy' },
    { id: 'ap_k4', label: 'On-time Payment', value: '96.1%', trend: '+0.4pp', trendDirection: 'up', color: '#10b981', icon: 'Schedule' },
  ],
  ordly: [
    { id: 'ordly_k1', label: 'Orders at Risk', value: '5', trend: '3 critical', trendDirection: 'up', color: '#ef4444', icon: 'Warning' },
    { id: 'ordly_k2', label: 'Fulfillment Rate', value: '91.8%', trend: '-2.1pp vs target', trendDirection: 'down', color: '#f59e0b', icon: 'LocalShipping' },
    { id: 'ordly_k3', label: 'Open Order Value', value: '$2.8M', trend: '48 orders', trendDirection: 'up', color: '#00357a', icon: 'ShoppingCart' },
    { id: 'ordly_k4', label: 'Anomalies Detected', value: '2', trend: 'Last 24h', trendDirection: 'up', color: '#ff751f', icon: 'BugReport' },
  ],
  o2c: [
    { id: 'o2c_k1', label: 'Avg DSO', value: '52 days', trend: '+7 vs target', trendDirection: 'up', color: '#ef4444', icon: 'Schedule' },
    { id: 'o2c_k2', label: 'Past Due AR', value: '$420K', trend: '8 customers', trendDirection: 'up', color: '#f59e0b', icon: 'Warning' },
    { id: 'o2c_k3', label: 'Dispute Risk', value: '4', trend: '$112K exposure', trendDirection: 'up', color: '#ff751f', icon: 'Gavel' },
    { id: 'o2c_k4', label: 'Collection Rate', value: '88.3%', trend: '-1.2pp', trendDirection: 'down', color: '#10b981', icon: 'AttachMoney' },
  ],
  traxx: [
    { id: 'traxx_k1', label: 'On-time Delivery', value: '87.4%', trend: '-3.6pp vs SLA', trendDirection: 'down', color: '#ef4444', icon: 'Schedule' },
    { id: 'traxx_k2', label: 'Delayed Shipments', value: '6', trend: '4 from DC-Central', trendDirection: 'up', color: '#f59e0b', icon: 'Warning' },
    { id: 'traxx_k3', label: 'Freight Spend MTD', value: '$284K', trend: '+12% vs budget', trendDirection: 'up', color: '#ff751f', icon: 'AttachMoney' },
    { id: 'traxx_k4', label: 'Carrier Score', value: '3.8/5', trend: '-0.3 vs Q4', trendDirection: 'down', color: '#00357a', icon: 'Star' },
  ],
  route: [
    { id: 'route_k1', label: 'Route Efficiency', value: '82%', trend: '+4pp optimized', trendDirection: 'up', color: '#10b981', icon: 'Route' },
    { id: 'route_k2', label: 'Load Utilization', value: '76%', trend: '3 consolidation opps', trendDirection: 'up', color: '#f59e0b', icon: 'LocalShipping' },
    { id: 'route_k3', label: 'CO2 Savings', value: '12.4t', trend: 'MTD reduction', trendDirection: 'down', color: '#10b981', icon: 'Eco' },
    { id: 'route_k4', label: 'Last Mile Score', value: '91%', trend: '+2pp vs target', trendDirection: 'up', color: '#00357a', icon: 'PinDrop' },
  ],
  _global: [
    { id: 'g_k1', label: 'Active Events', value: '18', trend: '5 critical', trendDirection: 'up', color: '#ef4444', icon: 'Notifications' },
    { id: 'g_k2', label: 'Avg AI Confidence', value: '89%', trend: '+2pp vs last month', trendDirection: 'up', color: '#00357a', icon: 'Psychology' },
    { id: 'g_k3', label: 'Total Impact', value: '$2.1M', trend: 'Across all modules', trendDirection: 'up', color: '#ff751f', icon: 'AttachMoney' },
    { id: 'g_k4', label: 'Pending Actions', value: '12', trend: '4 auto-resolved', trendDirection: 'down', color: '#10b981', icon: 'PlaylistAddCheck' },
  ],
};

// ============================================
// ASK_PULSE_SUGGESTIONS — natural language prompts
// ============================================
export const ASK_PULSE_SUGGESTIONS = [
  'Which materials are at risk of stockout across all plants?',
  'Show me customers with margin erosion above 3%',
  'What early payment discounts expire this week?',
  'Are there any orders at risk of missing delivery dates?',
  'Which DCs have excess inventory I can redistribute?',
  'Summarize all critical events in the last 24 hours',
  'What is my total past-due AR by customer?',
  'Show freight cost anomalies above 10% variance',
];

// ============================================
// ERP_ACTIONS — per-module SAP transaction actions
// ============================================
// ============================================
// MOCK_AGENTS — re-export from kitAgentsMockData with accuracy
// ============================================
import { kitMonitoringAgents } from './kitAgentsMockData';

export const MOCK_AGENTS = kitMonitoringAgents.filter(a => a.id).map(a => ({
  ...a,
  accuracy: a.true_positives && a.false_positives
    ? Math.round((a.true_positives / (a.true_positives + a.false_positives)) * 100)
    : null,
}));

// ============================================
// ERP_ACTIONS — per-module SAP transaction actions
// ============================================
export const ERP_ACTIONS = {
  stox: [
    { id: 'create_po', label: 'Create Purchase Order', erpModule: 'MM', txCode: 'ME21N', readWrite: 'write' },
    { id: 'adjust_safety_stock', label: 'Adjust Safety Stock', erpModule: 'MM', txCode: 'MM02', readWrite: 'write' },
    { id: 'stock_transfer', label: 'Stock Transfer Order', erpModule: 'WM', txCode: 'LT01', readWrite: 'write' },
    { id: 'run_mrp', label: 'Run MRP', erpModule: 'PP', txCode: 'MD01', readWrite: 'read' },
    { id: 'view_stock', label: 'View Stock Overview', erpModule: 'MM', txCode: 'MMBE', readWrite: 'read' },
  ],
  margen: [
    { id: 'update_pricing', label: 'Update Pricing Conditions', erpModule: 'SD', txCode: 'VK11', readWrite: 'write' },
    { id: 'copa_report', label: 'View COPA Report', erpModule: 'CO', txCode: 'KE24', readWrite: 'read' },
    { id: 'price_simulation', label: 'Run Price Simulation', erpModule: 'SD', txCode: 'VK31', readWrite: 'read' },
    { id: 'condition_audit', label: 'Audit Condition Records', erpModule: 'SD', txCode: 'VK13', readWrite: 'read' },
  ],
  ap: [
    { id: 'payment_run', label: 'Schedule Payment Run', erpModule: 'FI', txCode: 'F110', readWrite: 'write' },
    { id: 'block_invoice', label: 'Block Invoice', erpModule: 'MM', txCode: 'MRBR', readWrite: 'write' },
    { id: 'open_items', label: 'View Open Items', erpModule: 'FI', txCode: 'FBL1N', readWrite: 'read' },
    { id: 'compare_docs', label: 'Compare Documents', erpModule: 'MM', txCode: 'MIR4', readWrite: 'read' },
  ],
  ordly: [
    { id: 'view_order', label: 'View Sales Order', erpModule: 'SD', txCode: 'VA03', readWrite: 'read' },
    { id: 'change_order', label: 'Change Sales Order', erpModule: 'SD', txCode: 'VA02', readWrite: 'write' },
    { id: 'atp_check', label: 'Run ATP Check', erpModule: 'SD', txCode: 'CO09', readWrite: 'read' },
    { id: 'create_delivery', label: 'Create Delivery', erpModule: 'SD', txCode: 'VL01N', readWrite: 'write' },
  ],
  o2c: [
    { id: 'aging_report', label: 'View Aging Report', erpModule: 'FI', txCode: 'FBL5N', readWrite: 'read' },
    { id: 'dunning_run', label: 'Execute Dunning Run', erpModule: 'FI', txCode: 'F150', readWrite: 'write' },
    { id: 'credit_mgmt', label: 'Adjust Credit Limit', erpModule: 'FI', txCode: 'FD32', readWrite: 'write' },
    { id: 'billing_doc', label: 'View Billing Document', erpModule: 'SD', txCode: 'VF03', readWrite: 'read' },
  ],
  traxx: [
    { id: 'reassign_carrier', label: 'Reassign Carrier', erpModule: 'LE', txCode: 'VT02N', readWrite: 'write' },
    { id: 'shipment_status', label: 'View Shipment Status', erpModule: 'LE', txCode: 'VT03N', readWrite: 'read' },
    { id: 'create_shipment', label: 'Create Shipment', erpModule: 'LE', txCode: 'VT01N', readWrite: 'write' },
    { id: 'freight_analysis', label: 'Freight Cost Analysis', erpModule: 'LE', txCode: 'VF05N', readWrite: 'read' },
  ],
  route: [
    { id: 'create_route', label: 'Create Route', erpModule: 'LE', txCode: 'VT01N', readWrite: 'write' },
    { id: 'view_route', label: 'View Route Plan', erpModule: 'LE', txCode: 'VT03N', readWrite: 'read' },
    { id: 'update_windows', label: 'Update Delivery Windows', erpModule: 'SD', txCode: 'VD02', readWrite: 'write' },
    { id: 'route_analytics', label: 'Route Analytics', erpModule: 'LE', txCode: 'VT70', readWrite: 'read' },
  ],
};
