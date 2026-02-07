// Enterprise Pulse Proactive ML Agents
// Business intelligence agents that optimize inventory, margins, and operations across Composite1 plants

export const kitMonitoringAgents = [
  // ============================================
  // STOX.AI - Inventory Intelligence Agents
  // ============================================
  {
    id: 'agent-stox-stockout-001',
    name: 'Stockout Risk Monitor',
    description: 'Monitors inventory levels across all DCs and alerts when stock drops below safety threshold, preventing lost sales',
    natural_language_query: 'Alert me when any SKU at any DC falls below safety stock or is projected to stockout within 5 days based on demand velocity',
    category: 'stox_inventory',
    enabled: true,
    severity: 'critical',
    frequency: 'real-time',
    scope: 'All DCs',
    true_positives: 234,
    false_positives: 8,
    last_run: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    business_value: 'Prevents $125K+ stockout losses',
    ml_model: 'InventoryOptimizer',
  },
  {
    id: 'agent-stox-reorder-002',
    name: 'Smart Reorder Agent',
    description: 'Automatically triggers reorders based on ML-predicted demand patterns and supplier lead times',
    natural_language_query: 'Auto-generate reorder recommendations when inventory reaches reorder point, factoring in supplier lead time and demand forecast',
    category: 'stox_inventory',
    enabled: true,
    severity: 'high',
    frequency: 'hourly',
    scope: 'All DCs',
    true_positives: 189,
    false_positives: 12,
    last_run: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    business_value: 'Optimizes order timing, reduces rush orders',
    ml_model: 'DemandForecaster',
  },
  {
    id: 'agent-stox-working-capital-003',
    name: 'Working Capital Optimizer',
    description: 'Identifies excess inventory and slow-moving SKUs to free up working capital without risking stockouts',
    natural_language_query: 'Alert when any DC has inventory above 1.5x optimal level, or SKUs with turnover below threshold, with recommendations to reduce',
    category: 'stox_inventory',
    enabled: true,
    severity: 'medium',
    frequency: 'daily',
    scope: 'All DCs',
    true_positives: 67,
    false_positives: 5,
    last_run: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    business_value: 'Releases $85K+ working capital',
    ml_model: 'InventoryOptimizer',
  },
  {
    id: 'agent-stox-rebalance-004',
    name: 'DC Rebalancing Agent',
    description: 'Recommends inventory transfers between DCs to optimize stock levels and prevent regional stockouts',
    natural_language_query: 'Suggest inter-DC transfers when one DC is overstocked and another is at risk, optimizing for freight cost and service level',
    category: 'stox_inventory',
    enabled: true,
    severity: 'high',
    frequency: 'daily',
    scope: 'All DCs',
    true_positives: 45,
    false_positives: 3,
    last_run: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    business_value: 'Prevents regional stockouts, saves freight',
    ml_model: 'NetworkOptimizer',
  },
  {
    id: 'agent-stox-seasonal-005',
    name: 'Seasonal Demand Agent',
    description: 'Adjusts safety stock and reorder points based on seasonal demand patterns (Q4 ramp-up, production cycles)',
    natural_language_query: 'Alert when approaching seasonal demand surge and recommend safety stock adjustments based on historical patterns',
    category: 'stox_inventory',
    enabled: true,
    severity: 'medium',
    frequency: 'weekly',
    scope: 'All Products',
    true_positives: 28,
    false_positives: 2,
    last_run: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    business_value: 'Captures 15% seasonal demand uplift',
    ml_model: 'SeasonalForecaster',
  },

  // ============================================
  // Pricing Intelligence Agents
  // ============================================
  {
    id: 'agent-price-opt-006',
    name: 'Price Optimization Agent',
    description: 'Detects promotional pricing opportunities and margin leakage across retail channels',
    natural_language_query: 'Alert when pricing is suboptimal vs competitors or margin is below target by channel',
    category: 'ordly_pricing',
    enabled: true,
    severity: 'high',
    frequency: 'daily',
    scope: 'All Channels',
    true_positives: 134,
    false_positives: 18,
    last_run: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    business_value: '3-5% revenue uplift potential',
    ml_model: 'PriceOptimizer',
  },

  // ============================================
  // Customer Intelligence Agents
  // ============================================
  {
    id: 'agent-customer-pattern-007',
    name: 'Retail Partner Monitor',
    description: 'Monitors order patterns from major retailers and alerts on unusual gaps or volume changes',
    natural_language_query: 'Alert when any retail partner order pattern deviates significantly from forecast or historical norms',
    category: 'ordly_customer',
    enabled: true,
    severity: 'high',
    frequency: 'daily',
    scope: 'All Retailers',
    true_positives: 145,
    false_positives: 12,
    last_run: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    business_value: 'Proactive retail relationship management',
    ml_model: 'CustomerValueScore',
  },

  // ============================================
  // Operations Intelligence Agents
  // ============================================
  {
    id: 'agent-leadtime-008',
    name: 'Delivery Promise Agent',
    description: 'Monitors promised delivery dates vs production and logistics capacity to prevent SLA breaches',
    natural_language_query: 'Alert when promised delivery dates are at risk based on plant capacity and carrier availability',
    category: 'ordly_operations',
    enabled: true,
    severity: 'high',
    frequency: 'real-time',
    scope: 'All Orders',
    true_positives: 98,
    false_positives: 7,
    last_run: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    business_value: 'Prevents SLA breaches',
    ml_model: 'LeadTimeScore',
  },
];

// Category info for Enterprise Pulse agents
export const reveqCategoryInfo = {
  stox_inventory: {
    name: 'STOX.AI Inventory',
    color: '#10b981',
    description: 'Inventory Optimization & Stock Management',
    icon: 'Inventory',
  },
  ordly_pricing: {
    name: 'Pricing Intel',
    color: '#8b5cf6',
    description: 'Pricing Optimization & Margin Protection',
    icon: 'TrendingUp',
  },
  ordly_customer: {
    name: 'Retail Partners',
    color: '#0ea5e9',
    description: 'Retail Partner Monitoring & Engagement',
    icon: 'People',
  },
  ordly_operations: {
    name: 'Operations',
    color: '#f59e0b',
    description: 'Delivery & Fulfillment Optimization',
    icon: 'LocalShipping',
  },
};

// Business value summary for dashboard
export const agentBusinessValue = {
  stockout_prevention: '$125K+',
  working_capital_release: '$85K+',
  revenue_uplift: '3-5%',
  sla_compliance: '98%+',
};

export default kitMonitoringAgents;
