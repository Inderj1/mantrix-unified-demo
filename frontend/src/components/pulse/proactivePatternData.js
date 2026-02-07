// Proactive Pattern Definitions for Enterprise Pulse
// 12 ERP-actionable patterns: 7 COPA Profitability + 5 STOX Supply Chain

// Icons mapped by pattern (import in component)
export const PATTERN_ICONS = {
  copa_margin_erosion: 'TrendingDown',
  copa_customer_contribution: 'People',
  copa_discount_leakage: 'MoneyOff',
  copa_cost_variance: 'BarChart',
  copa_supplier_degradation: 'LocalShipping',
  copa_contract_profitability: 'Description',
  copa_regional_shift: 'Map',
  stox_stockout_risk: 'WarningAmber',
  stox_excess_inventory: 'Inventory2',
  stox_demand_shift: 'ShowChart',
  stox_lead_time_risk: 'Schedule',
  stox_mrp_optimization: 'Tune',
};

// Automation levels
export const AUTOMATION_LEVELS = {
  RECOMMEND: 'recommend',
  SIMULATE: 'simulate',
  EXECUTE: 'execute',
};

export const AUTOMATION_LEVEL_LABELS = {
  recommend: 'Recommend',
  simulate: 'Simulate',
  execute: 'Execute',
};

export const AUTOMATION_LEVEL_BUTTONS = {
  recommend: 'Run Detection',
  simulate: 'Run Simulation',
  execute: 'Run & Execute',
};

// Pattern sources
export const PATTERN_SOURCES = {
  COPA: 'copa',
  STOX: 'stox',
};

export const PATTERN_SOURCE_LABELS = {
  copa: 'COPA',
  stox: 'STOX',
};

// ============================================
// 12 PROACTIVE PATTERN DEFINITIONS
// ============================================

export const PROACTIVE_PATTERNS = [
  // ---- COPA Profitability Patterns (7) ----
  {
    id: 'copa_margin_erosion',
    name: 'Margin Erosion Detection',
    source: 'copa',
    category: 'profitability',
    description: 'Detects product categories or customers with declining gross margins over consecutive periods.',
    detectionTables: ['margin_by_product_category', 'period_trend'],
    defaultLevel: 'recommend',
    detectionCount: 3,
    lastChecked: '12 min ago',
    status: 'detected', // detected | clear | error
    actions: {
      recommend: 'Analyze margin trends and generate AI recommendation for price adjustment strategy.',
      simulate: 'Run what-if scenarios projecting margins at +3%, +5%, +7%, +10% price increases.',
      execute: 'Submit price adjustment request to SAP pricing module via Command Tower.',
    },
    erpAction: 'Price adjustment',
    erpTarget: 'command_tower',
  },
  {
    id: 'copa_customer_contribution',
    name: 'Customer Contribution Decline',
    source: 'copa',
    category: 'profitability',
    description: 'Identifies customers whose contribution margin has dropped below thresholds over recent quarters.',
    detectionTables: ['customer_contribution'],
    defaultLevel: 'recommend',
    detectionCount: 2,
    lastChecked: '8 min ago',
    status: 'detected',
    actions: {
      recommend: 'Analyze customer profitability and recommend discount structure review.',
      simulate: 'Model contribution impact under revised discount tiers.',
      execute: 'Flag customer for discount review in SAP condition records.',
    },
    erpAction: 'Discount review',
    erpTarget: 'command_tower',
  },
  {
    id: 'copa_discount_leakage',
    name: 'Discount/Rebate Leakage',
    source: 'copa',
    category: 'revenue_protection',
    description: 'Detects revenue leakage from excess discounts, unauthorized rebates, or condition record mismatches.',
    detectionTables: ['discount_rebate_impact'],
    defaultLevel: 'simulate',
    detectionCount: 5,
    lastChecked: '5 min ago',
    status: 'detected',
    actions: {
      recommend: 'Identify top discount leakage sources and quantify revenue impact.',
      simulate: 'Project revenue recovery under corrected rebate calculations.',
      execute: 'Trigger rebate recalculation and post correction entries via SAP.',
    },
    erpAction: 'Rebate recalculation',
    erpTarget: 'command_tower',
  },
  {
    id: 'copa_cost_variance',
    name: 'Cost Variance Spike',
    source: 'copa',
    category: 'cost_control',
    description: 'Alerts on significant plan-vs-actual cost variances at material, cost center, or profit center level.',
    detectionTables: ['cost_variance_analysis'],
    defaultLevel: 'recommend',
    detectionCount: 4,
    lastChecked: '10 min ago',
    status: 'detected',
    actions: {
      recommend: 'Break down variance drivers and generate root-cause analysis.',
      simulate: 'Model variance impact on profitability under different allocation scenarios.',
      execute: 'Post variance investigation document and notify cost center managers.',
    },
    erpAction: 'Variance investigation',
    erpTarget: 'command_tower',
  },
  {
    id: 'copa_supplier_degradation',
    name: 'Supplier Performance Degradation',
    source: 'copa',
    category: 'procurement',
    description: 'Monitors supplier delivery performance, quality metrics, and cost compliance trends.',
    detectionTables: ['supplier_performance'],
    defaultLevel: 'recommend',
    detectionCount: 1,
    lastChecked: '15 min ago',
    status: 'detected',
    actions: {
      recommend: 'Analyze supplier scorecard trends and identify degrading vendors.',
      simulate: 'Model impact of switching to alternative suppliers on cost and lead time.',
      execute: 'Update vendor scorecard and trigger procurement review in SAP MM.',
    },
    erpAction: 'Vendor scorecard update',
    erpTarget: 'command_tower',
  },
  {
    id: 'copa_contract_profitability',
    name: 'Contract Profitability Alert',
    source: 'copa',
    category: 'profitability',
    description: 'Flags contracts where actual profitability deviates significantly from bid/plan assumptions.',
    detectionTables: ['contract_profitability'],
    defaultLevel: 'recommend',
    detectionCount: 0,
    lastChecked: '6 min ago',
    status: 'clear',
    actions: {
      recommend: 'Analyze contract P&L vs plan and identify deviation drivers.',
      simulate: 'Project contract outcomes under renegotiated terms.',
      execute: 'Flag contract for renegotiation and create action item in Command Tower.',
    },
    erpAction: 'Renegotiation flag',
    erpTarget: 'command_tower',
  },
  {
    id: 'copa_regional_shift',
    name: 'Regional Profitability Shift',
    source: 'copa',
    category: 'profitability',
    description: 'Detects significant changes in profitability across regions, factoring in freight and logistics costs.',
    detectionTables: ['freight_by_region'],
    defaultLevel: 'recommend',
    detectionCount: 0,
    lastChecked: '9 min ago',
    status: 'clear',
    actions: {
      recommend: 'Analyze regional margin trends with freight cost attribution.',
      simulate: 'Model profitability under alternative regional pricing strategies.',
      execute: 'Submit regional pricing review request to pricing team via Command Tower.',
    },
    erpAction: 'Regional pricing review',
    erpTarget: 'command_tower',
  },

  // ---- STOX Supply Chain Patterns (5) ----
  {
    id: 'stox_stockout_risk',
    name: 'Stockout Risk',
    source: 'stox',
    category: 'inventory',
    description: 'Monitors safety stock levels and demand velocity to predict impending stockout events.',
    detectionTables: ['inventory_health', 'demand_signals'],
    defaultLevel: 'execute',
    detectionCount: 6,
    lastChecked: '2 min ago',
    status: 'detected',
    actions: {
      recommend: 'Identify at-risk SKUs and generate replenishment recommendations.',
      simulate: 'Model stockout probability under different reorder timing scenarios.',
      execute: 'Create purchase order in SAP MM and notify supply planning.',
    },
    erpAction: 'Create PO',
    erpTarget: 'command_tower',
  },
  {
    id: 'stox_excess_inventory',
    name: 'Excess Inventory',
    source: 'stox',
    category: 'inventory',
    description: 'Identifies SKUs with coverage days exceeding thresholds, tying up working capital.',
    detectionTables: ['inventory_health', 'coverage_analysis'],
    defaultLevel: 'simulate',
    detectionCount: 3,
    lastChecked: '4 min ago',
    status: 'detected',
    actions: {
      recommend: 'Analyze excess inventory by SKU and quantify working capital tied up.',
      simulate: 'Model rebalance scenarios across DCs with freight cost comparison.',
      execute: 'Create stock transfer order between distribution centers.',
    },
    erpAction: 'Rebalance/transfer',
    erpTarget: 'command_tower',
  },
  {
    id: 'stox_demand_shift',
    name: 'Demand Shift Detection',
    source: 'stox',
    category: 'planning',
    description: 'Detects significant deviations between forecasted and actual demand patterns.',
    detectionTables: ['demand_signals', 'forecast_accuracy'],
    defaultLevel: 'recommend',
    detectionCount: 2,
    lastChecked: '7 min ago',
    status: 'detected',
    actions: {
      recommend: 'Analyze demand deviation patterns and identify root causes.',
      simulate: 'Run MRP simulation with adjusted demand forecasts.',
      execute: 'Update MRP demand parameters and regenerate planning run.',
    },
    erpAction: 'MRP update',
    erpTarget: 'command_tower',
  },
  {
    id: 'stox_lead_time_risk',
    name: 'Lead Time Risk',
    source: 'stox',
    category: 'procurement',
    description: 'Monitors supplier on-time delivery trends to predict lead time deviations.',
    detectionTables: ['supplier_otd', 'purchase_orders'],
    defaultLevel: 'recommend',
    detectionCount: 0,
    lastChecked: '11 min ago',
    status: 'clear',
    actions: {
      recommend: 'Identify suppliers with deteriorating OTD and flag at-risk orders.',
      simulate: 'Model impact of lead time extension on inventory and service levels.',
      execute: 'Create expedite request and notify supplier via procurement workflow.',
    },
    erpAction: 'Expedite',
    erpTarget: 'command_tower',
  },
  {
    id: 'stox_mrp_optimization',
    name: 'MRP Parameter Optimization',
    source: 'stox',
    category: 'planning',
    description: 'Recommends safety stock, reorder point, and lot size adjustments based on demand analysis.',
    detectionTables: ['mrp_parameters', 'demand_variability'],
    defaultLevel: 'simulate',
    detectionCount: 8,
    lastChecked: '3 min ago',
    status: 'detected',
    actions: {
      recommend: 'Analyze current MRP parameters vs optimal settings based on demand patterns.',
      simulate: 'Compare current vs proposed SS/ROP settings with service level projections.',
      execute: 'Update MRP parameters in SAP MRP master data.',
    },
    erpAction: 'Parameter update',
    erpTarget: 'command_tower',
  },
];

// Helper: get patterns by source
export const getPatternsBySource = (source) =>
  PROACTIVE_PATTERNS.filter((p) => p.source === source);

// Helper: get COPA patterns
export const getCOPAPatterns = () => getPatternsBySource('copa');

// Helper: get STOX patterns
export const getSTOXPatterns = () => getPatternsBySource('stox');

// Helper: get total detection count
export const getTotalDetections = () =>
  PROACTIVE_PATTERNS.reduce((sum, p) => sum + p.detectionCount, 0);

// Helper: get patterns with detections
export const getActivePatterns = () =>
  PROACTIVE_PATTERNS.filter((p) => p.detectionCount > 0);

// Helper: get pending execution count (patterns set to execute level with detections)
export const getPendingExecutions = () =>
  PROACTIVE_PATTERNS.filter((p) => p.defaultLevel === 'execute' && p.detectionCount > 0).length;

// Summary stats for KPI cards
export const getPatternSummary = () => ({
  totalPatterns: PROACTIVE_PATTERNS.length,
  activeDetections: getTotalDetections(),
  pendingExecutions: getPendingExecutions(),
  copaDetections: getCOPAPatterns().reduce((sum, p) => sum + p.detectionCount, 0),
  stoxDetections: getSTOXPatterns().reduce((sum, p) => sum + p.detectionCount, 0),
  patternHealth: Math.round(
    (PROACTIVE_PATTERNS.filter((p) => p.status !== 'error').length / PROACTIVE_PATTERNS.length) * 100
  ),
});
