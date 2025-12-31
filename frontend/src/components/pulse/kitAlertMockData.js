// Ordly AI Alert Mock Data for Enterprise Pulse
// Business intelligence alerts from ML models

// Alert Types - Organized by Business Value Category
export const ALERT_TYPES = {
  // ML Model Health Alerts
  SPEC_LOW_CONFIDENCE: 'spec_low_confidence',
  MATERIAL_MATCH_GAP: 'material_match_gap',
  MODEL_DRIFT_DETECTED: 'model_drift_detected',

  // Pricing Intelligence Alerts
  PRICE_BELOW_OPTIMAL: 'price_below_optimal',
  MARGIN_EROSION: 'margin_erosion',
  WIN_RATE_ANOMALY: 'win_rate_anomaly',
  PRICE_ELASTICITY_SHIFT: 'price_elasticity_shift',

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
  // ML Model Health
  spec_low_confidence: 'Low Extraction Confidence',
  material_match_gap: 'Material Match Gap',
  model_drift_detected: 'Model Drift Detected',

  // Pricing Intelligence
  price_below_optimal: 'Price Below Optimal',
  margin_erosion: 'Margin Erosion',
  win_rate_anomaly: 'Win Rate Anomaly',
  price_elasticity_shift: 'Price Elasticity Shift',

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
  ml_model_health: ['spec_low_confidence', 'material_match_gap', 'model_drift_detected'],
  pricing_intelligence: ['price_below_optimal', 'margin_erosion', 'win_rate_anomaly', 'price_elasticity_shift'],
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

// Sample customers for Loparex context
const customers = [
  { id: 'CUST-001', name: 'Avery Dennison', segment: 'STRATEGIC', avgOrderValue: 125000, region: 'North America' },
  { id: 'CUST-002', name: '3M Corporation', segment: 'STRATEGIC', avgOrderValue: 180000, region: 'North America' },
  { id: 'CUST-003', name: 'Berry Global', segment: 'KEY', avgOrderValue: 85000, region: 'North America' },
  { id: 'CUST-004', name: 'Mondi Group', segment: 'KEY', avgOrderValue: 72000, region: 'Europe' },
  { id: 'CUST-005', name: 'Constantia Flexibles', segment: 'KEY', avgOrderValue: 68000, region: 'Europe' },
  { id: 'CUST-006', name: 'Jindal Films', segment: 'GROWTH', avgOrderValue: 45000, region: 'Asia' },
  { id: 'CUST-007', name: 'Toray Industries', segment: 'GROWTH', avgOrderValue: 52000, region: 'Asia' },
  { id: 'CUST-008', name: 'Futamura Chemical', segment: 'STANDARD', avgOrderValue: 32000, region: 'Asia' },
  { id: 'CUST-009', name: 'Coveris Holdings', segment: 'STANDARD', avgOrderValue: 28000, region: 'Europe' },
  { id: 'CUST-010', name: 'ProAmpac', segment: 'GROWTH', avgOrderValue: 55000, region: 'North America' },
];

// Sample materials for Loparex context
const materials = [
  { id: 'MAT-PET-50', name: 'PET 50μm Silicone', category: 'Release Liner', margin: 0.42 },
  { id: 'MAT-PET-75', name: 'PET 75μm Silicone', category: 'Release Liner', margin: 0.38 },
  { id: 'MAT-BOPP-40', name: 'BOPP 40μm Matte', category: 'Release Liner', margin: 0.35 },
  { id: 'MAT-PP-100', name: 'PP 100μm Clear', category: 'Release Liner', margin: 0.32 },
  { id: 'MAT-HDPE-75', name: 'HDPE 75μm Natural', category: 'Release Liner', margin: 0.28 },
  { id: 'MAT-GLN-90', name: 'Glassine 90gsm', category: 'Paper Liner', margin: 0.45 },
  { id: 'MAT-SCK-80', name: 'SCK 80gsm', category: 'Paper Liner', margin: 0.40 },
  { id: 'MAT-CCK-120', name: 'CCK 120gsm', category: 'Paper Liner', margin: 0.48 },
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
  spec_low_confidence: [
    { action: 'manual_review', reason: 'Low confidence on critical specs requires human verification', confidence: 0.94 },
    { action: 'contact_customer', reason: 'Clarify ambiguous specifications with customer', confidence: 0.88 },
    { action: 'use_template', reason: 'Similar past orders can guide interpretation', confidence: 0.82 },
  ],
  material_match_gap: [
    { action: 'suggest_alternatives', reason: 'Present top 3 closest matching materials to customer', confidence: 0.91 },
    { action: 'custom_quote', reason: 'Create custom specification for this request', confidence: 0.85 },
    { action: 'notify_product', reason: 'Flag as potential new product opportunity', confidence: 0.78 },
  ],
  model_drift_detected: [
    { action: 'retrain_model', reason: 'Model accuracy below threshold, retraining recommended', confidence: 0.96 },
    { action: 'investigate_data', reason: 'Check for data quality issues in recent inputs', confidence: 0.89 },
    { action: 'monitor_closely', reason: 'Increase monitoring frequency temporarily', confidence: 0.82 },
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
    case ALERT_TYPES.SPEC_LOW_CONFIDENCE:
      if (metrics.confidence < 0.60) return SEVERITY.CRITICAL;
      if (metrics.confidence < 0.75) return SEVERITY.HIGH;
      return SEVERITY.WARNING;

    case ALERT_TYPES.MATERIAL_MATCH_GAP:
      if (metrics.bestMatchScore < 0.60) return SEVERITY.HIGH;
      if (metrics.bestMatchScore < 0.75) return SEVERITY.WARNING;
      return SEVERITY.INFO;

    case ALERT_TYPES.MODEL_DRIFT_DETECTED:
      if (metrics.accuracyDrop > 0.15) return SEVERITY.CRITICAL;
      if (metrics.accuracyDrop > 0.10) return SEVERITY.HIGH;
      return SEVERITY.WARNING;

    case ALERT_TYPES.PRICE_BELOW_OPTIMAL:
      if (metrics.gapPercent > 0.15) return SEVERITY.CRITICAL;
      if (metrics.gapPercent > 0.10) return SEVERITY.HIGH;
      return SEVERITY.WARNING;

    case ALERT_TYPES.MARGIN_EROSION:
      if (metrics.erosionPercent > 0.10) return SEVERITY.CRITICAL;
      if (metrics.erosionPercent > 0.05) return SEVERITY.HIGH;
      return SEVERITY.WARNING;

    case ALERT_TYPES.WIN_RATE_ANOMALY:
      if (metrics.anomalyPercent > 0.30) return SEVERITY.CRITICAL;
      if (metrics.anomalyPercent > 0.20) return SEVERITY.HIGH;
      return SEVERITY.WARNING;

    case ALERT_TYPES.PRICE_ELASTICITY_SHIFT:
      return SEVERITY.WARNING; // Usually informational

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

  switch (type) {
    case ALERT_TYPES.SPEC_LOW_CONFIDENCE:
      metrics = {
        confidence: randomFloat(0.55, 0.84),
        unclearFields: randomItem([['coating_type', 'release_level'], ['thickness', 'width'], ['surface_finish'], ['substrate', 'coating_weight']]),
        documentType: randomItem(['PO', 'RFQ', 'Email']),
      };
      title = `Low Extraction Confidence (${Math.round(metrics.confidence * 100)}%)`;
      message = `${metrics.documentType} from ${customer.name} has unclear specs: ${metrics.unclearFields.join(', ')}. Manual review recommended.`;
      revenueImpact = customer.avgOrderValue;
      break;

    case ALERT_TYPES.MATERIAL_MATCH_GAP:
      metrics = {
        bestMatchScore: randomFloat(0.55, 0.79),
        requestedSpecs: randomItem(['25μm PET thermal coating', 'Ultra-thin BOPP release', 'High-temp silicone liner', 'Food-grade paper liner']),
        topAlternatives: 3,
      };
      title = `No Material Match Above 80%`;
      message = `Request for "${metrics.requestedSpecs}" - best match is ${Math.round(metrics.bestMatchScore * 100)}%. ${metrics.topAlternatives} alternatives available.`;
      revenueImpact = randomInt(50000, 150000);
      break;

    case ALERT_TYPES.MODEL_DRIFT_DETECTED:
      metrics = {
        modelName: randomItem(['POSpecParser', 'MaterialMatcher', 'PriceOptimizer']),
        currentAccuracy: randomFloat(0.78, 0.88),
        baselineAccuracy: randomFloat(0.90, 0.95),
        accuracyDrop: 0,
      };
      metrics.accuracyDrop = metrics.baselineAccuracy - metrics.currentAccuracy;
      title = `Model Drift: ${metrics.modelName}`;
      message = `Accuracy dropped from ${Math.round(metrics.baselineAccuracy * 100)}% to ${Math.round(metrics.currentAccuracy * 100)}% (-${Math.round(metrics.accuracyDrop * 100)}%). Consider retraining.`;
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

    case ALERT_TYPES.WIN_RATE_ANOMALY:
      metrics = {
        segment: randomItem(['Medical Grade', 'Industrial', 'Food & Beverage', 'Electronics']),
        predictedWinRate: randomFloat(0.70, 0.85),
        actualWinRate: randomFloat(0.35, 0.55),
        anomalyPercent: 0,
        quotesAnalyzed: randomInt(10, 25),
      };
      metrics.anomalyPercent = Math.abs(metrics.predictedWinRate - metrics.actualWinRate);
      title = `Win Rate Anomaly: ${metrics.segment}`;
      message = `Predicted ${Math.round(metrics.predictedWinRate * 100)}% win rate, actual ${Math.round(metrics.actualWinRate * 100)}% (${metrics.quotesAnalyzed} quotes). Model may have blind spot.`;
      break;

    case ALERT_TYPES.PRICE_ELASTICITY_SHIFT:
      metrics = {
        segment: randomItem(['STRATEGIC', 'KEY', 'GROWTH', 'STANDARD']),
        previousElasticity: randomFloat(-1.5, -0.8),
        currentElasticity: randomFloat(-2.2, -1.2),
        shiftPercent: 0,
      };
      metrics.shiftPercent = Math.abs((metrics.currentElasticity - metrics.previousElasticity) / metrics.previousElasticity);
      title = `Price Sensitivity Changed: ${metrics.segment} Segment`;
      message = `Elasticity shifted from ${metrics.previousElasticity.toFixed(2)} to ${metrics.currentElasticity.toFixed(2)}. Customers ${Math.abs(metrics.currentElasticity) > Math.abs(metrics.previousElasticity) ? 'more' : 'less'} price sensitive.`;
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
        suggestedQuoteValue: randomInt(15000, 60000),
      };
      title = `Reorder Opportunity: ${customer.name}`;
      message = `Predicted reorder window opening. Typical order: ${metrics.typicalQuantity.toLocaleString()} M² of ${metrics.typicalProduct}. Suggest proactive quote.`;
      revenueImpact = metrics.suggestedQuoteValue;
      break;

    case ALERT_TYPES.LEAD_TIME_RISK:
      metrics = {
        promisedDate: daysAgo(-randomInt(5, 15)),
        realisticDate: daysAgo(-randomInt(8, 20)),
        bufferDays: 0,
        reason: randomItem(['Production backlog', 'Material shortage', 'Shipping delays', 'Capacity constraint']),
      };
      metrics.bufferDays = Math.round((new Date(metrics.promisedDate) - new Date(metrics.realisticDate)) / (1000 * 60 * 60 * 24));
      title = `Lead Time Risk: ${quoteId}`;
      message = `Promise date at risk. Buffer: ${metrics.bufferDays} days. Reason: ${metrics.reason}. Customer: ${customer.name}.`;
      revenueImpact = customer.avgOrderValue;
      break;

    case ALERT_TYPES.UPSELL_OPPORTUNITY:
      const upsellType = randomItem(['volume_tier', 'alternative_material', 'cross_sell']);
      if (upsellType === 'volume_tier') {
        metrics = {
          type: 'volume_tier',
          currentQuantity: randomInt(8000, 9500),
          tierThreshold: 10000,
          tierDiscount: randomInt(5, 10),
          customerSavings: randomInt(200, 500),
          marginChange: randomInt(-100, -50),
        };
        title = `Volume Tier Opportunity: ${customer.name}`;
        message = `Current order ${metrics.currentQuantity.toLocaleString()} M². At ${metrics.tierThreshold.toLocaleString()} M² customer saves ${metrics.tierDiscount}% ($${metrics.customerSavings}). Good upsell trigger.`;
      } else if (upsellType === 'alternative_material') {
        metrics = {
          type: 'alternative_material',
          currentMaterial: material.name,
          alternativeMaterial: randomItem(materials).name,
          marginLift: randomFloat(0.03, 0.08),
          techFitScore: randomFloat(0.92, 0.99),
        };
        title = `Higher-Margin Alternative Available`;
        message = `${customer.name} ordering ${metrics.currentMaterial}. Alternative "${metrics.alternativeMaterial}" has ${Math.round(metrics.marginLift * 100)}% better margin with ${Math.round(metrics.techFitScore * 100)}% tech fit.`;
        marginImpact = customer.avgOrderValue * metrics.marginLift;
      } else {
        metrics = {
          type: 'cross_sell',
          primaryProduct: material.name,
          suggestedProduct: randomItem(materials).name,
          crossSellProbability: randomFloat(0.65, 0.85),
          additionalRevenue: randomInt(8000, 25000),
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

  // Calculate average model health (inverse of critical ML alerts ratio)
  const mlAlerts = alerts.filter(a => ALERT_CATEGORIES.ml_model_health.includes(a.type));
  const criticalMlAlerts = mlAlerts.filter(a => a.severity === SEVERITY.CRITICAL || a.severity === SEVERITY.HIGH);
  const modelHealth = mlAlerts.length > 0 ? Math.round((1 - criticalMlAlerts.length / mlAlerts.length) * 100) : 98;

  return {
    activeAlerts: activeAlerts.length,
    criticalAlerts: criticalAlerts.length,
    opportunities: opportunities.length,
    revenueAtRisk: totalRevenueImpact,
    marginImpact: totalMarginImpact,
    modelHealth: `${modelHealth}%`,
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
