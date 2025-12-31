// Ordly AI Proactive ML Agents for Enterprise Pulse
// Business intelligence agents that help customers optimize revenue, margins, and operations

export const kitMonitoringAgents = [
  // ML Model Monitoring Agents
  {
    id: 'agent-ml-spec-001',
    name: 'Spec Extraction Confidence Monitor',
    description: 'Alerts when PO/RFQ specification extraction confidence falls below threshold, preventing bad quotes from misread documents',
    natural_language_query: 'Alert me when any PO or RFQ has extraction confidence below 85%, showing which fields need manual review',
    category: 'ordly_ml_models',
    enabled: true,
    severity: 'high',
    frequency: 'real-time',
    scope: 'global',
    true_positives: 156,
    false_positives: 12,
    last_run: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    business_value: 'Prevents quote errors from misread POs',
    ml_model: 'POSpecParser',
  },
  {
    id: 'agent-ml-match-002',
    name: 'Material Match Quality Agent',
    description: 'Identifies when no materials score above 80% fit, suggesting product gaps or alternative recommendations',
    natural_language_query: 'Alert when customer requests have no material matches above 80% TechFitScore, and suggest closest alternatives',
    category: 'ordly_ml_models',
    enabled: true,
    severity: 'medium',
    frequency: 'hourly',
    scope: 'global',
    true_positives: 89,
    false_positives: 8,
    last_run: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    business_value: 'Identifies product portfolio gaps',
    ml_model: 'MaterialMatcher',
  },

  // Pricing Intelligence Agents
  {
    id: 'agent-price-opt-003',
    name: 'Price Optimization Opportunity Agent',
    description: 'Detects quotes priced below ML-optimal price, identifying revenue left on the table',
    natural_language_query: 'Alert when any quote is priced more than 5% below the ML-optimal price while maintaining similar win probability',
    category: 'ordly_pricing',
    enabled: true,
    severity: 'high',
    frequency: 'real-time',
    scope: 'global',
    true_positives: 234,
    false_positives: 18,
    last_run: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    business_value: '3-5% revenue uplift potential',
    ml_model: 'PriceOptimizer',
  },
  {
    id: 'agent-margin-erosion-004',
    name: 'Margin Erosion Alert Agent',
    description: 'Tracks margin trends by customer/product and alerts on creeping discount patterns',
    natural_language_query: 'Alert when any customer or product shows margin decline for 3+ consecutive periods, with root cause analysis',
    category: 'ordly_pricing',
    enabled: true,
    severity: 'high',
    frequency: 'daily',
    scope: 'global',
    true_positives: 67,
    false_positives: 5,
    last_run: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    business_value: 'Stops discount creep early',
    ml_model: 'PricingConditions',
  },
  {
    id: 'agent-winloss-005',
    name: 'Win/Loss Learning Agent',
    description: 'Compares predicted vs actual win rates to identify pricing model blind spots',
    natural_language_query: 'Alert when actual win rate differs from predicted by more than 20% for any segment, with pattern analysis',
    category: 'ordly_pricing',
    enabled: true,
    severity: 'medium',
    frequency: 'weekly',
    scope: 'global',
    true_positives: 28,
    false_positives: 3,
    last_run: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    business_value: 'Improves pricing model accuracy',
    ml_model: 'PriceOptimizer',
  },

  // Customer Intelligence Agents
  {
    id: 'agent-customer-pattern-006',
    name: 'Customer Purchase Pattern Agent',
    description: 'Monitors order frequency and alerts on unusual gaps, enabling proactive outreach before churn',
    natural_language_query: 'Alert when any customer order gap exceeds 2x their normal interval, ranked by customer value',
    category: 'ordly_customer',
    enabled: true,
    severity: 'high',
    frequency: 'daily',
    scope: 'global',
    true_positives: 145,
    false_positives: 12,
    last_run: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    business_value: 'Proactive retention, not reactive',
    ml_model: 'CustomerValueScore',
  },

  // Operations Intelligence Agents
  {
    id: 'agent-leadtime-007',
    name: 'Lead Time Risk Agent',
    description: 'Compares promised delivery dates vs realistic capability, preventing over-commitment',
    natural_language_query: 'Alert when quoted lead time has less than 3 days buffer vs actual production + shipping capacity',
    category: 'ordly_operations',
    enabled: true,
    severity: 'high',
    frequency: 'real-time',
    scope: 'global',
    true_positives: 98,
    false_positives: 7,
    last_run: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    business_value: 'Prevents SLA breaches',
    ml_model: 'LeadTimeScore',
  },
  {
    id: 'agent-whatif-008',
    name: 'What-If Scenario Alert Agent',
    description: 'Proactively identifies upsell opportunities like volume tier thresholds and higher-margin alternatives',
    natural_language_query: 'Alert when active quotes have unexplored scenarios: volume tier within 10% reach, or alternative materials with better margin',
    category: 'ordly_operations',
    enabled: true,
    severity: 'medium',
    frequency: 'hourly',
    scope: 'global',
    true_positives: 178,
    false_positives: 15,
    last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    business_value: 'Upsell and margin protection',
    ml_model: 'ScenarioEngine',
  },
];

// Category info for Ordly AI agents
export const reveqCategoryInfo = {
  ordly_ml_models: {
    name: 'ML Models',
    color: '#8b5cf6',
    description: 'ML Model Health & Accuracy Monitoring',
    icon: 'SmartToy',
  },
  ordly_pricing: {
    name: 'Pricing Intel',
    color: '#10b981',
    description: 'Pricing Optimization & Margin Protection',
    icon: 'TrendingUp',
  },
  ordly_customer: {
    name: 'Customer Intel',
    color: '#0ea5e9',
    description: 'Customer Behavior & Retention',
    icon: 'People',
  },
  ordly_operations: {
    name: 'Operations',
    color: '#f59e0b',
    description: 'Delivery & Scenario Optimization',
    icon: 'LocalShipping',
  },
};

// Business value summary for dashboard
export const agentBusinessValue = {
  revenue_uplift: '3-5%',
  margin_protection: '2-3%',
  churn_reduction: '15-20%',
  sla_compliance: '98%+',
};

export default kitMonitoringAgents;
