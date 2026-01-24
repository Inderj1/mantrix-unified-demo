// Ordly AI Alert Mock Data for Enterprise Pulse
// Business intelligence alerts from ML models

// Alert Types - Organized by Business Value Category
export const ALERT_TYPES = {
  // STOX.AI - Inventory Intelligence Alerts
  STOCKOUT_RISK: 'stockout_risk',
  REORDER_POINT_REACHED: 'reorder_point_reached',
  EXCESS_INVENTORY: 'excess_inventory',
  DC_REBALANCE_NEEDED: 'dc_rebalance_needed',
  SEASONAL_DEMAND_SHIFT: 'seasonal_demand_shift',

  // Pricing Intelligence Alerts
  PRICE_BELOW_OPTIMAL: 'price_below_optimal',
  MARGIN_EROSION: 'margin_erosion',

  // Customer Intelligence Alerts
  ORDER_GAP_DETECTED: 'order_gap_detected',
  CHURN_RISK_HIGH: 'churn_risk_high',
  REORDER_OPPORTUNITY: 'reorder_opportunity',

  // Operations Intelligence Alerts
  LEAD_TIME_RISK: 'lead_time_risk',
  UPSELL_OPPORTUNITY: 'upsell_opportunity',
};

// Alert Type Labels
export const ALERT_TYPE_LABELS = {
  // STOX.AI - Inventory Intelligence
  stockout_risk: 'Stockout Risk',
  reorder_point_reached: 'Reorder Point Reached',
  excess_inventory: 'Excess Inventory',
  dc_rebalance_needed: 'DC Rebalance Needed',
  seasonal_demand_shift: 'Seasonal Demand Shift',

  // Pricing Intelligence
  price_below_optimal: 'Price Below Optimal',
  margin_erosion: 'Margin Erosion',

  // Customer Intelligence
  order_gap_detected: 'Order Gap Detected',
  churn_risk_high: 'High Churn Risk',
  reorder_opportunity: 'Reorder Opportunity',

  // Operations Intelligence
  lead_time_risk: 'Lead Time Risk',
  upsell_opportunity: 'Upsell Opportunity',
};

// Alert Category mapping
export const ALERT_CATEGORIES = {
  stox_inventory: ['stockout_risk', 'reorder_point_reached', 'excess_inventory', 'dc_rebalance_needed', 'seasonal_demand_shift'],
  pricing_intelligence: ['price_below_optimal', 'margin_erosion'],
  customer_intelligence: ['order_gap_detected', 'churn_risk_high', 'reorder_opportunity'],
  operations_intelligence: ['lead_time_risk', 'upsell_opportunity'],
};

// Severity Levels
export const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  HIGH: 'high',
  CRITICAL: 'critical',
  OPPORTUNITY: 'opportunity', // Special severity for positive alerts
};

// Alert Status
export const STATUS = {
  NEW: 'new',
  ACKNOWLEDGED: 'acknowledged',
  IN_PROGRESS: 'in_progress',
  SNOOZED: 'snoozed',
  RESOLVED: 'resolved',
};

// Sample customers - Arizona Beverages retail partners
const customers = [
  { id: 'CUST-001', name: 'Walmart', segment: 'STRATEGIC', avgOrderValue: 850000, region: 'National' },
  { id: 'CUST-002', name: 'Costco', segment: 'STRATEGIC', avgOrderValue: 720000, region: 'National' },
  { id: 'CUST-003', name: 'Target', segment: 'KEY', avgOrderValue: 425000, region: 'National' },
  { id: 'CUST-004', name: 'Kroger', segment: 'KEY', avgOrderValue: 380000, region: 'National' },
  { id: 'CUST-005', name: '7-Eleven', segment: 'KEY', avgOrderValue: 285000, region: 'National' },
  { id: 'CUST-006', name: 'Publix', segment: 'KEY', avgOrderValue: 195000, region: 'Southeast' },
  { id: 'CUST-007', name: 'HEB', segment: 'GROWTH', avgOrderValue: 165000, region: 'Central' },
  { id: 'CUST-008', name: 'CVS', segment: 'GROWTH', avgOrderValue: 125000, region: 'National' },
  { id: 'CUST-009', name: 'Walgreens', segment: 'STANDARD', avgOrderValue: 95000, region: 'National' },
  { id: 'CUST-010', name: 'Safeway', segment: 'GROWTH', avgOrderValue: 145000, region: 'West' },
];

// Sample products - Arizona Beverages product catalog
const materials = [
  { id: 'AZ-GT-24', name: 'AZ Green Tea 24PK', category: 'Tea', margin: 0.42 },
  { id: 'AZ-AP-24', name: 'AZ Arnold Palmer 24PK', category: 'Tea', margin: 0.45 },
  { id: 'AZ-GT-4', name: 'AZ Green Tea 4PK', category: 'Tea', margin: 0.38 },
  { id: 'AZ-AP-4', name: 'AZ Arnold Palmer 4PK', category: 'Tea', margin: 0.40 },
  { id: 'AZ-MM-24', name: 'AZ Mucho Mango 24PK', category: 'Fruit Drink', margin: 0.35 },
  { id: 'AZ-LT-24', name: 'AZ Lemon Tea 24PK', category: 'Tea', margin: 0.42 },
  { id: 'AZ-WM-24', name: 'AZ Watermelon 24PK', category: 'Fruit Drink', margin: 0.36 },
  { id: 'AZ-RX-12', name: 'AZ RX Energy 12PK', category: 'Energy', margin: 0.48 },
];

// Sample sales reps
const salesReps = [
  { name: 'John Mitchell', role: 'Senior Account Manager', region: 'North America' },
  { name: 'Sarah Chen', role: 'Account Executive', region: 'Asia Pacific' },
  { name: 'Michael Weber', role: 'Key Account Manager', region: 'Europe' },
  { name: 'Lisa Rodriguez', role: 'Sales Manager', region: 'Latin America' },
  { name: 'David Kim', role: 'Regional Director', region: 'Asia Pacific' },
];

// AI Suggestions by alert type
const aiSuggestions = {
  // STOX.AI Inventory Suggestions
  stockout_risk: [
    { action: 'expedite_reorder', reason: 'Create urgent purchase order to prevent stockout', confidence: 0.96 },
    { action: 'transfer_stock', reason: 'Transfer inventory from another DC with excess stock', confidence: 0.92 },
    { action: 'notify_sales', reason: 'Alert sales team to manage customer expectations', confidence: 0.85 },
  ],
  reorder_point_reached: [
    { action: 'create_po', reason: 'Generate purchase order based on optimal quantity', confidence: 0.94 },
    { action: 'review_forecast', reason: 'Verify demand forecast before ordering', confidence: 0.88 },
    { action: 'check_supplier', reason: 'Confirm supplier lead time and availability', confidence: 0.82 },
  ],
  excess_inventory: [
    { action: 'reduce_safety_stock', reason: 'Lower safety stock to release working capital', confidence: 0.91 },
    { action: 'promote_sku', reason: 'Create promotional campaign to move excess inventory', confidence: 0.85 },
    { action: 'transfer_to_dc', reason: 'Redistribute to DCs with higher demand', confidence: 0.80 },
  ],
  dc_rebalance_needed: [
    { action: 'initiate_transfer', reason: 'Create inter-DC transfer to balance inventory', confidence: 0.93 },
    { action: 'adjust_allocation', reason: 'Update allocation rules to prevent future imbalance', confidence: 0.87 },
    { action: 'review_demand', reason: 'Analyze regional demand patterns', confidence: 0.81 },
  ],
  seasonal_demand_shift: [
    { action: 'increase_safety_stock', reason: 'Build inventory ahead of seasonal surge', confidence: 0.92 },
    { action: 'accelerate_production', reason: 'Schedule additional bottling runs', confidence: 0.88 },
    { action: 'secure_capacity', reason: 'Reserve carrier capacity for peak season', confidence: 0.84 },
  ],
  price_below_optimal: [
    { action: 'reprice_quote', reason: 'Increase price to optimal while maintaining win probability', confidence: 0.92 },
    { action: 'manager_review', reason: 'Large deal requires pricing approval', confidence: 0.87 },
    { action: 'accept_strategic', reason: 'Accept lower price for strategic account growth', confidence: 0.75 },
  ],
  margin_erosion: [
    { action: 'pricing_review', reason: 'Reset base price to stop discount creep', confidence: 0.93 },
    { action: 'cost_analysis', reason: 'Investigate if cost increases justify margin drop', confidence: 0.86 },
    { action: 'customer_discussion', reason: 'Discuss value proposition to justify pricing', confidence: 0.81 },
  ],
  win_rate_anomaly: [
    { action: 'competitor_analysis', reason: 'Check for new competitor pricing in segment', confidence: 0.89 },
    { action: 'sales_feedback', reason: 'Gather qualitative feedback from sales team', confidence: 0.85 },
    { action: 'model_update', reason: 'Update pricing model with new market data', confidence: 0.82 },
  ],
  price_elasticity_shift: [
    { action: 'adjust_pricing', reason: 'Update pricing strategy for changed sensitivity', confidence: 0.91 },
    { action: 'segment_review', reason: 'Re-evaluate customer segment classifications', confidence: 0.84 },
    { action: 'test_pricing', reason: 'Run controlled pricing test in segment', confidence: 0.78 },
  ],
  order_gap_detected: [
    { action: 'proactive_outreach', reason: 'Contact customer before they reach out to competitor', confidence: 0.94 },
    { action: 'send_quote', reason: 'Proactively send quote for typical order', confidence: 0.88 },
    { action: 'schedule_review', reason: 'Schedule quarterly business review', confidence: 0.82 },
  ],
  churn_risk_high: [
    { action: 'executive_call', reason: 'Escalate to executive for relationship intervention', confidence: 0.95 },
    { action: 'special_offer', reason: 'Consider loyalty incentive or pricing adjustment', confidence: 0.87 },
    { action: 'win_back_plan', reason: 'Develop structured win-back strategy', confidence: 0.83 },
  ],
  reorder_opportunity: [
    { action: 'auto_quote', reason: 'Generate quote based on purchase history', confidence: 0.92 },
    { action: 'upsell_check', reason: 'Review for volume tier or cross-sell opportunity', confidence: 0.86 },
    { action: 'timing_optimize', reason: 'Align with customer production schedule', confidence: 0.79 },
  ],
  lead_time_risk: [
    { action: 'expedite_production', reason: 'Prioritize in production queue', confidence: 0.93 },
    { action: 'alternative_material', reason: 'Suggest in-stock alternative', confidence: 0.87 },
    { action: 'split_shipment', reason: 'Partial shipment to meet critical deadline', confidence: 0.81 },
  ],
  upsell_opportunity: [
    { action: 'suggest_volume_tier', reason: 'Customer close to next discount tier', confidence: 0.91 },
    { action: 'offer_alternative', reason: 'Higher-margin alternative meets same specs', confidence: 0.88 },
    { action: 'bundle_products', reason: 'Cross-sell complementary products', confidence: 0.82 },
  ],
};

// Helper functions
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const hoursAgo = (hours) => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const generateQuoteId = () => `Q-2025-${randomInt(1000, 9999)}`;
const generateOrderId = () => `ORD-${randomInt(40000, 50000)}`;
const generateAlertId = () => `ALT-${new Date().toISOString().split('T')[0]}-${String(randomInt(1, 9999)).padStart(4, '0')}`;

// Severity calculation based on alert type and metrics
const calculateSeverity = (type, metrics) => {
  switch (type) {
    // STOX.AI Inventory Alerts
    case ALERT_TYPES.STOCKOUT_RISK:
      if (metrics.daysUntilStockout <= 3) return SEVERITY.CRITICAL;
      if (metrics.daysUntilStockout <= 5) return SEVERITY.HIGH;
      return SEVERITY.WARNING;

    case ALERT_TYPES.REORDER_POINT_REACHED:
      return SEVERITY.HIGH;

    case ALERT_TYPES.EXCESS_INVENTORY:
      if (metrics.excessPercent > 100) return SEVERITY.HIGH;
      if (metrics.excessPercent > 50) return SEVERITY.WARNING;
      return SEVERITY.INFO;

    case ALERT_TYPES.DC_REBALANCE_NEEDED:
      return SEVERITY.HIGH;

    case ALERT_TYPES.SEASONAL_DEMAND_SHIFT:
      if (metrics.weeksUntilPeak <= 2) return SEVERITY.HIGH;
      return SEVERITY.WARNING;

    case ALERT_TYPES.PRICE_BELOW_OPTIMAL:
      if (metrics.gapPercent > 0.15) return SEVERITY.CRITICAL;
      if (metrics.gapPercent > 0.10) return SEVERITY.HIGH;
      return SEVERITY.WARNING;

    case ALERT_TYPES.MARGIN_EROSION:
      if (metrics.erosionPercent > 0.10) return SEVERITY.CRITICAL;
      if (metrics.erosionPercent > 0.05) return SEVERITY.HIGH;
      return SEVERITY.WARNING;

    case ALERT_TYPES.ORDER_GAP_DETECTED:
      if (metrics.gapMultiplier >= 4) return SEVERITY.CRITICAL;
      if (metrics.gapMultiplier >= 3) return SEVERITY.HIGH;
      return SEVERITY.WARNING;

    case ALERT_TYPES.CHURN_RISK_HIGH:
      if (metrics.churnProbability > 0.75) return SEVERITY.CRITICAL;
      if (metrics.churnProbability > 0.50) return SEVERITY.HIGH;
      return SEVERITY.WARNING;

    case ALERT_TYPES.REORDER_OPPORTUNITY:
      return SEVERITY.OPPORTUNITY; // Positive alert

    case ALERT_TYPES.LEAD_TIME_RISK:
      if (metrics.bufferDays < 1) return SEVERITY.CRITICAL;
      if (metrics.bufferDays < 3) return SEVERITY.HIGH;
      return SEVERITY.WARNING;

    case ALERT_TYPES.UPSELL_OPPORTUNITY:
      return SEVERITY.OPPORTUNITY; // Positive alert

    default:
      return SEVERITY.INFO;
  }
};

// Generate a single alert
const generateAlert = (type, overrides = {}) => {
  const customer = randomItem(customers);
  const material = randomItem(materials);
  const salesRep = randomItem(salesReps);
  const quoteId = generateQuoteId();

  let metrics = {};
  let title = '';
  let message = '';
  let revenueImpact = 0;
  let marginImpact = 0;

  // Arizona Beverages DC locations for STOX.AI alerts
  const dcLocations = [
    { id: 'DC-KEASBEY', name: 'Keasbey NJ', region: 'Northeast' },
    { id: 'MFG-DRINKPAK', name: 'Santa Clarita CA', region: 'West' },
    { id: 'MFG-POLAR', name: 'Douglas GA', region: 'Southeast' },
    { id: 'MFG-TAMPICO', name: 'Wharton TX', region: 'Central' },
    { id: 'MFG-MAXPAK', name: 'Lakeland FL', region: 'Southeast' },
  ];
  const dc = randomItem(dcLocations);

  switch (type) {
    // ============================================
    // STOX.AI - Inventory Intelligence Alerts
    // ============================================
    case ALERT_TYPES.STOCKOUT_RISK:
      metrics = {
        currentStock: randomInt(500, 2000),
        safetyStock: randomInt(2500, 4000),
        daysUntilStockout: randomInt(2, 7),
        demandVelocity: randomInt(300, 800),
        dc: dc,
      };
      title = `Stockout Risk: ${material.name} at ${dc.name}`;
      message = `Current stock ${metrics.currentStock.toLocaleString()} cases, below safety stock of ${metrics.safetyStock.toLocaleString()}. Projected stockout in ${metrics.daysUntilStockout} days at current demand velocity.`;
      revenueImpact = randomInt(50000, 150000);
      break;

    case ALERT_TYPES.REORDER_POINT_REACHED:
      metrics = {
        currentStock: randomInt(3000, 5000),
        reorderPoint: randomInt(4000, 6000),
        optimalOrderQty: randomInt(8000, 15000),
        supplierLeadTime: randomInt(7, 21),
        dc: dc,
      };
      title = `Reorder Point: ${material.name} at ${dc.name}`;
      message = `Inventory at ${metrics.currentStock.toLocaleString()} cases has reached reorder point of ${metrics.reorderPoint.toLocaleString()}. Recommended order: ${metrics.optimalOrderQty.toLocaleString()} cases. Supplier lead time: ${metrics.supplierLeadTime} days.`;
      revenueImpact = randomInt(30000, 80000);
      break;

    case ALERT_TYPES.EXCESS_INVENTORY:
      metrics = {
        currentStock: randomInt(25000, 40000),
        optimalStock: randomInt(12000, 18000),
        excessPercent: 0,
        workingCapitalTied: randomInt(50000, 120000),
        turnoverDays: randomInt(45, 90),
        dc: dc,
      };
      metrics.excessPercent = Math.round((metrics.currentStock - metrics.optimalStock) / metrics.optimalStock * 100);
      title = `Excess Inventory: ${material.name} at ${dc.name}`;
      message = `Stock at ${metrics.currentStock.toLocaleString()} cases is ${metrics.excessPercent}% above optimal level. $${metrics.workingCapitalTied.toLocaleString()} working capital tied up. Current turnover: ${metrics.turnoverDays} days.`;
      revenueImpact = metrics.workingCapitalTied;
      break;

    case ALERT_TYPES.DC_REBALANCE_NEEDED:
      const sourceDC = randomItem(dcLocations);
      const destDC = randomItem(dcLocations.filter(d => d.id !== sourceDC.id));
      metrics = {
        sourceDC: sourceDC,
        destDC: destDC,
        sourceStock: randomInt(20000, 35000),
        destStock: randomInt(1000, 3000),
        transferQty: randomInt(5000, 15000),
        freightCost: randomInt(2000, 8000),
      };
      title = `DC Rebalance: ${sourceDC.name} → ${destDC.name}`;
      message = `${material.name}: ${sourceDC.name} has ${metrics.sourceStock.toLocaleString()} cases while ${destDC.name} has only ${metrics.destStock.toLocaleString()}. Recommend transfer of ${metrics.transferQty.toLocaleString()} cases. Est. freight: $${metrics.freightCost.toLocaleString()}.`;
      revenueImpact = randomInt(40000, 100000);
      break;

    case ALERT_TYPES.SEASONAL_DEMAND_SHIFT:
      metrics = {
        season: randomItem(['Summer', 'Memorial Day', 'July 4th', 'Labor Day']),
        demandIncrease: randomInt(15, 40),
        weeksUntilPeak: randomInt(2, 6),
        currentSafetyStock: randomInt(8000, 12000),
        recommendedSafetyStock: randomInt(15000, 25000),
      };
      title = `Seasonal Alert: ${metrics.season} Demand Surge`;
      message = `${metrics.season} peak in ${metrics.weeksUntilPeak} weeks. Historical demand increase: +${metrics.demandIncrease}%. Current safety stock: ${metrics.currentSafetyStock.toLocaleString()} cases. Recommended: ${metrics.recommendedSafetyStock.toLocaleString()} cases.`;
      revenueImpact = randomInt(80000, 200000);
      break;

    case ALERT_TYPES.PRICE_BELOW_OPTIMAL:
      metrics = {
        quotedPrice: randomFloat(0.35, 0.48),
        optimalPrice: randomFloat(0.42, 0.55),
        gapPercent: 0,
        winProbCurrent: randomFloat(0.75, 0.88),
        winProbOptimal: randomFloat(0.70, 0.85),
        quantity: randomInt(5000, 50000),
      };
      metrics.gapPercent = (metrics.optimalPrice - metrics.quotedPrice) / metrics.optimalPrice;
      marginImpact = (metrics.optimalPrice - metrics.quotedPrice) * metrics.quantity;
      title = `Quote Priced ${Math.round(metrics.gapPercent * 100)}% Below Optimal`;
      message = `${quoteId} for ${customer.name}: $${metrics.quotedPrice.toFixed(2)}/unit vs optimal $${metrics.optimalPrice.toFixed(2)}. Win prob similar (${Math.round(metrics.winProbCurrent * 100)}% vs ${Math.round(metrics.winProbOptimal * 100)}%).`;
      revenueImpact = marginImpact;
      break;

    case ALERT_TYPES.MARGIN_EROSION:
      metrics = {
        currentMargin: randomFloat(0.28, 0.38),
        historicalMargin: randomFloat(0.38, 0.48),
        erosionPercent: 0,
        periodsDecline: randomInt(3, 6),
        cause: randomItem(['Discount creep', 'Cost increase not passed', 'Competitive pressure', 'Volume commitments']),
      };
      metrics.erosionPercent = (metrics.historicalMargin - metrics.currentMargin) / metrics.historicalMargin;
      marginImpact = customer.avgOrderValue * metrics.erosionPercent * 4; // Annualized
      title = `Margin Erosion: ${customer.name}`;
      message = `Margin dropped from ${Math.round(metrics.historicalMargin * 100)}% to ${Math.round(metrics.currentMargin * 100)}% over ${metrics.periodsDecline} quarters. Cause: ${metrics.cause}.`;
      revenueImpact = marginImpact;
      break;

    case ALERT_TYPES.ORDER_GAP_DETECTED:
      metrics = {
        daysSinceOrder: randomInt(30, 90),
        typicalInterval: randomInt(14, 30),
        gapMultiplier: 0,
        lastOrderValue: randomInt(20000, 80000),
      };
      metrics.gapMultiplier = metrics.daysSinceOrder / metrics.typicalInterval;
      title = `Order Gap: ${customer.name}`;
      message = `${metrics.daysSinceOrder} days since last order (typical: every ${metrics.typicalInterval} days). ${metrics.gapMultiplier.toFixed(1)}x normal interval. Last order: $${metrics.lastOrderValue.toLocaleString()}.`;
      revenueImpact = metrics.lastOrderValue;
      break;

    case ALERT_TYPES.CHURN_RISK_HIGH:
      metrics = {
        churnProbability: randomFloat(0.45, 0.85),
        riskFactors: randomItem([
          ['Order frequency -40%', 'Smaller order sizes'],
          ['No response to quotes', 'Competitor contact'],
          ['Payment delays', 'Complaints increase'],
          ['Key contact left', 'Budget cuts mentioned'],
        ]),
        customerLifetimeValue: customer.avgOrderValue * randomInt(8, 20),
      };
      title = `High Churn Risk: ${customer.name}`;
      message = `${Math.round(metrics.churnProbability * 100)}% churn probability. Risk factors: ${metrics.riskFactors.join(', ')}. CLV at risk: $${metrics.customerLifetimeValue.toLocaleString()}.`;
      revenueImpact = metrics.customerLifetimeValue;
      break;

    case ALERT_TYPES.REORDER_OPPORTUNITY:
      metrics = {
        predictedReorderDate: daysAgo(-randomInt(3, 14)),
        typicalProduct: material.name,
        typicalQuantity: randomInt(5000, 25000),
        suggestedQuoteValue: randomInt(50000, 200000),
      };
      title = `Reorder Opportunity: ${customer.name}`;
      message = `Predicted reorder window opening. Typical order: ${metrics.typicalQuantity.toLocaleString()} cases of ${metrics.typicalProduct}. Suggest proactive quote.`;
      revenueImpact = metrics.suggestedQuoteValue;
      break;

    case ALERT_TYPES.LEAD_TIME_RISK:
      metrics = {
        promisedDate: daysAgo(-randomInt(5, 15)),
        realisticDate: daysAgo(-randomInt(8, 20)),
        bufferDays: 0,
        reason: randomItem(['Bottling line backlog', 'Tea concentrate shortage', 'Carrier delays', 'DC capacity constraint']),
      };
      metrics.bufferDays = Math.round((new Date(metrics.promisedDate) - new Date(metrics.realisticDate)) / (1000 * 60 * 60 * 24));
      title = `Lead Time Risk: ${quoteId}`;
      message = `Promise date at risk. Buffer: ${metrics.bufferDays} days. Reason: ${metrics.reason}. Customer: ${customer.name}.`;
      revenueImpact = customer.avgOrderValue;
      break;

    case ALERT_TYPES.UPSELL_OPPORTUNITY:
      const upsellType = randomItem(['volume_tier', 'alternative_product', 'cross_sell']);
      if (upsellType === 'volume_tier') {
        metrics = {
          type: 'volume_tier',
          currentQuantity: randomInt(8000, 9500),
          tierThreshold: 10000,
          tierDiscount: randomInt(5, 10),
          customerSavings: randomInt(5000, 15000),
          marginChange: randomInt(-100, -50),
        };
        title = `Volume Tier Opportunity: ${customer.name}`;
        message = `Current order ${metrics.currentQuantity.toLocaleString()} cases. At ${metrics.tierThreshold.toLocaleString()} cases customer saves ${metrics.tierDiscount}% ($${metrics.customerSavings.toLocaleString()}). Good upsell trigger.`;
      } else if (upsellType === 'alternative_product') {
        metrics = {
          type: 'alternative_product',
          currentProduct: material.name,
          alternativeProduct: randomItem(materials).name,
          marginLift: randomFloat(0.03, 0.08),
          fitScore: randomFloat(0.92, 0.99),
        };
        title = `Higher-Margin Product Available`;
        message = `${customer.name} ordering ${metrics.currentProduct}. Alternative "${metrics.alternativeProduct}" has ${Math.round(metrics.marginLift * 100)}% better margin with ${Math.round(metrics.fitScore * 100)}% customer fit.`;
        marginImpact = customer.avgOrderValue * metrics.marginLift;
      } else {
        metrics = {
          type: 'cross_sell',
          primaryProduct: material.name,
          suggestedProduct: randomItem(materials).name,
          crossSellProbability: randomFloat(0.65, 0.85),
          additionalRevenue: randomInt(25000, 75000),
        };
        title = `Cross-Sell Opportunity: ${customer.name}`;
        message = `${Math.round(metrics.crossSellProbability * 100)}% likelihood to buy ${metrics.suggestedProduct} with ${metrics.primaryProduct}. Potential: $${metrics.additionalRevenue.toLocaleString()}.`;
        revenueImpact = metrics.additionalRevenue;
      }
      break;
  }

  const severity = calculateSeverity(type, metrics);
  const triggeredHoursAgo = randomInt(1, 48);
  const suggestions = aiSuggestions[type] || [];

  return {
    id: generateAlertId(),
    type,
    severity,
    status: randomItem([STATUS.NEW, STATUS.NEW, STATUS.NEW, STATUS.ACKNOWLEDGED, STATUS.IN_PROGRESS]),
    title,
    message,

    // Business context
    customer: {
      id: customer.id,
      name: customer.name,
      segment: customer.segment,
      region: customer.region,
    },
    quote_id: quoteId,
    material: material.name,
    sales_rep: salesRep,

    // Impact metrics
    revenue_impact: revenueImpact,
    margin_impact: marginImpact || revenueImpact * 0.35,

    // ML context
    ml_model: randomItem(['POSpecParser', 'MaterialMatcher', 'PriceOptimizer', 'CustomerValueScore']),
    confidence_score: randomFloat(0.75, 0.98),

    // Timing
    triggered_at: hoursAgo(triggeredHoursAgo),

    // Additional metrics
    metrics,

    // Actions taken
    action_history: [
      {
        action: 'created',
        by: 'Ordly AI',
        at: hoursAgo(triggeredHoursAgo),
        notes: `Alert generated by ML model analysis`,
      },
    ],

    // AI Suggestion
    ai_suggestion: suggestions.length > 0 ? randomItem(suggestions) : null,

    ...overrides,
  };
};

// Generate a batch of alerts
export const generateKitAlerts = (count = 15) => {
  const alerts = [];
  const types = Object.values(ALERT_TYPES);

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    alerts.push(generateAlert(type));
  }

  // Sort by severity (critical first) then by triggered_at (newest first)
  const severityOrder = { critical: 0, high: 1, warning: 2, opportunity: 3, info: 4 };
  alerts.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.triggered_at) - new Date(a.triggered_at);
  });

  return alerts;
};

// Generate sample detail data for drilldown
export const generateAlertDetail = (alert) => {
  const timeline = [
    {
      action: 'created',
      by: 'Ordly AI',
      at: alert.triggered_at,
      notes: 'Alert automatically generated by ML model analysis',
      icon: 'create',
    },
  ];

  if (alert.status !== STATUS.NEW) {
    timeline.push({
      action: 'acknowledged',
      by: alert.sales_rep?.name || 'Team Member',
      at: hoursAgo(randomInt(1, 12)),
      notes: 'Alert acknowledged and under review',
      icon: 'check',
    });
  }

  if (alert.status === STATUS.IN_PROGRESS) {
    timeline.push({
      action: 'action_taken',
      by: alert.sales_rep?.name || 'Team Member',
      at: hoursAgo(randomInt(1, 6)),
      notes: randomItem([
        'Customer contacted for clarification',
        'Quote revised with optimized pricing',
        'Manager escalation initiated',
        'Alternative solution proposed',
        'Follow-up meeting scheduled',
      ]),
      icon: 'work',
    });
  }

  timeline.sort((a, b) => new Date(b.at) - new Date(a.at));

  return {
    ...alert,
    action_history: timeline,
    related_quotes: [
      { id: generateQuoteId(), customer: alert.customer?.name, status: 'Active', value: randomInt(20000, 80000) },
      { id: generateQuoteId(), customer: alert.customer?.name, status: 'Won', value: randomInt(15000, 60000) },
    ],
    model_insights: {
      confidence: alert.confidence_score,
      factors: [
        `Historical pattern analysis: ${randomInt(85, 98)}% match`,
        `Similar cases outcome: ${randomInt(70, 90)}% positive`,
        `Risk assessment score: ${randomFloat(0.2, 0.8).toFixed(2)}`,
      ],
    },
  };
};

// Calculate KPI stats from alerts
export const calculateAlertStats = (alerts) => {
  const activeAlerts = alerts.filter(a => a.status !== STATUS.RESOLVED);
  const criticalAlerts = alerts.filter(a => a.severity === SEVERITY.CRITICAL && a.status !== STATUS.RESOLVED);
  const opportunities = alerts.filter(a => a.severity === SEVERITY.OPPORTUNITY);

  const totalRevenueImpact = activeAlerts.reduce((sum, a) => sum + (a.revenue_impact || 0), 0);
  const totalMarginImpact = activeAlerts.reduce((sum, a) => sum + (a.margin_impact || 0), 0);

  // Calculate inventory health (inverse of critical STOX alerts ratio)
  const stoxAlerts = alerts.filter(a => ALERT_CATEGORIES.stox_inventory.includes(a.type));
  const criticalStoxAlerts = stoxAlerts.filter(a => a.severity === SEVERITY.CRITICAL || a.severity === SEVERITY.HIGH);
  const inventoryHealth = stoxAlerts.length > 0 ? Math.round((1 - criticalStoxAlerts.length / stoxAlerts.length) * 100) : 98;

  return {
    activeAlerts: activeAlerts.length,
    criticalAlerts: criticalAlerts.length,
    opportunities: opportunities.length,
    revenueAtRisk: totalRevenueImpact,
    marginImpact: totalMarginImpact,
    modelHealth: `${inventoryHealth}%`,
  };
};

// Default export
export default {
  ALERT_TYPES,
  ALERT_TYPE_LABELS,
  ALERT_CATEGORIES,
  SEVERITY,
  STATUS,
  generateKitAlerts,
  generateAlertDetail,
  calculateAlertStats,
};
