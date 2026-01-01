// Command Tower - Ticket Tracking System
// Tracks all actions performed across the platform (manual or automated)

// Ticket Sources - where the ticket originated
export const TICKET_SOURCES = {
  // Core Sources
  ALERT_ACTION: 'alert_action',       // From ML alert action
  AGENT_AUTOMATED: 'agent_automated', // Automated agent action
  MANUAL_ENTRY: 'manual_entry',       // Manually created
  SYSTEM_TRIGGER: 'system_trigger',   // System-generated

  // Module Sources
  STOX_AI: 'stox_ai',                 // STOX.AI inventory actions
  MARGEN_AI: 'margen_ai',             // MargenAI margin analytics
  ORDLY_AI: 'ordly_ai',               // OrdlyAI order management
  AXIS_AI: 'axis_ai',                 // AXIS.AI financial planning
  PROCESS_AI: 'process_ai',           // Process AI workflow
  EMAIL_INTEL: 'email_intel',         // Email Intelligence
};

// Ticket Status
export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  PENDING_REVIEW: 'pending_review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Ticket Priority
export const TICKET_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Ticket Categories aligned with all AI modules
export const TICKET_CATEGORIES = {
  // Existing
  PRICING: 'pricing',
  CUSTOMER: 'customer',
  ML_MODEL: 'ml_model',
  OPERATIONS: 'operations',
  QUOTE: 'quote',
  GENERAL: 'general',

  // New Categories
  INVENTORY: 'inventory',       // STOX.AI
  FINANCIAL: 'financial',       // MargenAI
  ORDER: 'order',               // OrdlyAI
  AI_QUERY: 'ai_query',         // All AI chat queries
  SUPPLY_CHAIN: 'supply_chain', // Supply chain actions
  FORECAST: 'forecast',         // AXIS.AI forecasting
};

// Action Types - what action was taken
export const ACTION_TYPES = {
  // Pricing Actions
  REPRICE_QUOTE: { key: 'reprice_quote', label: 'Reprice Quote', category: 'pricing' },
  MANAGER_REVIEW: { key: 'manager_review', label: 'Manager Review', category: 'pricing' },
  RESET_PRICING: { key: 'reset_pricing', label: 'Reset Pricing', category: 'pricing' },
  ADJUST_STRATEGY: { key: 'adjust_strategy', label: 'Adjust Strategy', category: 'pricing' },

  // Customer Actions
  CONTACT_CUSTOMER: { key: 'contact_customer', label: 'Contact Customer', category: 'customer' },
  SEND_QUOTE: { key: 'send_quote', label: 'Send Quote', category: 'customer' },
  SCHEDULE_REVIEW: { key: 'schedule_review', label: 'Schedule Review', category: 'customer' },
  EXECUTIVE_CALL: { key: 'executive_call', label: 'Executive Call', category: 'customer' },
  SPECIAL_OFFER: { key: 'special_offer', label: 'Special Offer', category: 'customer' },
  WIN_BACK_PLAN: { key: 'win_back_plan', label: 'Win-back Plan', category: 'customer' },

  // ML Model Actions
  MANUAL_REVIEW: { key: 'manual_review', label: 'Manual Review', category: 'ml_model' },
  RETRAIN_MODEL: { key: 'retrain_model', label: 'Retrain Model', category: 'ml_model' },
  INVESTIGATE_DATA: { key: 'investigate_data', label: 'Investigate Data', category: 'ml_model' },

  // Operations Actions
  EXPEDITE_PRODUCTION: { key: 'expedite_production', label: 'Expedite Production', category: 'operations' },
  SPLIT_SHIPMENT: { key: 'split_shipment', label: 'Split Shipment', category: 'operations' },
  SUGGEST_ALTERNATIVES: { key: 'suggest_alternatives', label: 'Suggest Alternatives', category: 'operations' },

  // Quote Actions
  AUTO_QUOTE: { key: 'auto_quote', label: 'Generate Quote', category: 'quote' },
  CUSTOM_QUOTE: { key: 'custom_quote', label: 'Custom Quote', category: 'quote' },
  VOLUME_TIER: { key: 'volume_tier', label: 'Volume Tier Offer', category: 'quote' },

  // STOX.AI - Inventory Actions
  REORDER_TRIGGERED: { key: 'reorder_triggered', label: 'Reorder Triggered', category: 'inventory' },
  SAFETY_STOCK_ADJUSTED: { key: 'safety_stock_adjusted', label: 'Safety Stock Adjusted', category: 'inventory' },
  REALLOCATION_EXECUTED: { key: 'reallocation_executed', label: 'Reallocation Executed', category: 'inventory' },
  SHORTAGE_ALERT_RAISED: { key: 'shortage_alert_raised', label: 'Shortage Alert', category: 'inventory' },
  WORKING_CAPITAL_OPTIMIZED: { key: 'working_capital_optimized', label: 'WC Optimized', category: 'inventory' },
  MRP_PARAMETER_CHANGED: { key: 'mrp_parameter_changed', label: 'MRP Parameter Changed', category: 'inventory' },
  STORE_REPLENISHMENT: { key: 'store_replenishment', label: 'Store Replenishment', category: 'inventory' },

  // MARGEN.AI - Financial Actions
  MARGIN_ALERT: { key: 'margin_alert', label: 'Margin Alert', category: 'financial' },
  CLV_UPDATED: { key: 'clv_updated', label: 'CLV Updated', category: 'financial' },
  SEGMENT_CHANGED: { key: 'segment_changed', label: 'Segment Changed', category: 'financial' },
  CHURN_RISK_FLAGGED: { key: 'churn_risk_flagged', label: 'Churn Risk Flagged', category: 'financial' },
  REVENUE_FORECAST: { key: 'revenue_forecast', label: 'Revenue Forecast', category: 'financial' },

  // ORDLY.AI - Order Actions
  ORDER_COMMITTED: { key: 'order_committed', label: 'Order Committed to SAP', category: 'order' },
  DEMAND_SIGNAL_PROCESSED: { key: 'demand_signal_processed', label: 'Demand Signal Processed', category: 'order' },
  NETWORK_OPTIMIZED: { key: 'network_optimized', label: 'Network Optimized', category: 'order' },
  ARBITRATION_COMPLETED: { key: 'arbitration_completed', label: 'Arbitration Completed', category: 'order' },
  ORDER_PROMISE_UPDATED: { key: 'order_promise_updated', label: 'Order Promise Updated', category: 'order' },

  // AI Query Actions
  AI_QUERY_EXECUTED: { key: 'ai_query_executed', label: 'AI Query Executed', category: 'ai_query' },
  RECOMMENDATION_GENERATED: { key: 'recommendation_generated', label: 'Recommendation Generated', category: 'ai_query' },
  INSIGHT_GENERATED: { key: 'insight_generated', label: 'Insight Generated', category: 'ai_query' },

  // AXIS.AI - Forecast Actions
  FORECAST_UPDATED: { key: 'forecast_updated', label: 'Forecast Updated', category: 'forecast' },
  SCENARIO_CREATED: { key: 'scenario_created', label: 'Scenario Created', category: 'forecast' },
  BUDGET_ALERT: { key: 'budget_alert', label: 'Budget Alert', category: 'forecast' },

  // Supply Chain Actions
  SUPPLIER_ALERT: { key: 'supplier_alert', label: 'Supplier Alert', category: 'supply_chain' },
  LEAD_TIME_BREACH: { key: 'lead_time_breach', label: 'Lead Time Breach', category: 'supply_chain' },
  INBOUND_RISK: { key: 'inbound_risk', label: 'Inbound Risk', category: 'supply_chain' },
};

// Sample team members
const teamMembers = [
  { id: 'user-001', name: 'John Mitchell', role: 'Senior Account Manager', avatar: 'JM' },
  { id: 'user-002', name: 'Sarah Chen', role: 'Account Executive', avatar: 'SC' },
  { id: 'user-003', name: 'Michael Weber', role: 'Key Account Manager', avatar: 'MW' },
  { id: 'user-004', name: 'Lisa Rodriguez', role: 'Sales Manager', avatar: 'LR' },
  { id: 'user-005', name: 'David Kim', role: 'Regional Director', avatar: 'DK' },
  { id: 'system', name: 'Ordly AI', role: 'Automated Agent', avatar: 'AI' },
];

// Sample customers
const customers = [
  { id: 'CUST-001', name: 'Avery Dennison', segment: 'STRATEGIC' },
  { id: 'CUST-002', name: '3M Corporation', segment: 'STRATEGIC' },
  { id: 'CUST-003', name: 'Berry Global', segment: 'KEY' },
  { id: 'CUST-004', name: 'Mondi Group', segment: 'KEY' },
  { id: 'CUST-005', name: 'Jindal Films', segment: 'GROWTH' },
];

// Helper functions
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const hoursAgo = (hours) => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

const generateTicketId = () => `TKT-${new Date().getFullYear()}-${String(randomInt(1000, 9999)).padStart(4, '0')}`;

// Create a ticket from an action
export const createTicketFromAction = (action, alertData, user = null) => {
  const actionInfo = Object.values(ACTION_TYPES).find(a => a.key === action) || { key: action, label: action, category: 'general' };
  const assignedTo = user || randomItem(teamMembers);
  const customer = alertData?.customer || randomItem(customers);

  return {
    id: generateTicketId(),

    // Source info
    source: alertData ? TICKET_SOURCES.ALERT_ACTION : TICKET_SOURCES.MANUAL_ENTRY,
    source_alert_id: alertData?.id || null,
    source_alert_type: alertData?.type || null,

    // Action details
    action_type: actionInfo.key,
    action_label: actionInfo.label,
    category: actionInfo.category,

    // Context
    title: `${actionInfo.label}: ${customer.name}`,
    description: alertData?.message || `Action initiated for ${customer.name}`,

    // Business context
    customer: customer,
    quote_id: alertData?.quote_id || null,
    material: alertData?.material || null,
    revenue_impact: alertData?.revenue_impact || 0,

    // Status
    status: TICKET_STATUS.OPEN,
    priority: alertData?.severity === 'critical' ? TICKET_PRIORITY.CRITICAL :
              alertData?.severity === 'high' ? TICKET_PRIORITY.HIGH :
              alertData?.severity === 'opportunity' ? TICKET_PRIORITY.MEDIUM :
              TICKET_PRIORITY.MEDIUM,

    // Assignment
    created_by: assignedTo,
    assigned_to: assignedTo,

    // AI context
    ml_model: alertData?.ml_model || null,
    ai_confidence: alertData?.confidence_score || null,
    ai_recommendation: alertData?.ai_suggestion?.action || null,

    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: null,
    completed_at: null,

    // Activity log
    activity: [
      {
        action: 'created',
        by: assignedTo.name,
        at: new Date().toISOString(),
        notes: `Ticket created from ${alertData ? 'ML alert action' : 'manual entry'}`,
      },
    ],

    // Related items
    related_alerts: alertData ? [alertData.id] : [],
    related_tickets: [],

    // Tags
    tags: [actionInfo.category, customer.segment.toLowerCase()],
  };
};

// Module-specific sample data for realistic scenarios
const moduleScenarios = {
  [TICKET_SOURCES.STOX_AI]: [
    { action: ACTION_TYPES.REORDER_TRIGGERED, title: 'Reorder Triggered: SKU-4521', desc: 'Safety stock threshold reached for DC Atlanta', material: 'SKU-4521 Premium Blend' },
    { action: ACTION_TYPES.SAFETY_STOCK_ADJUSTED, title: 'Safety Stock Adjusted: Chicago DC', desc: 'Increased safety stock by 15% for seasonal demand', material: 'SKU-8892 Holiday Pack' },
    { action: ACTION_TYPES.REALLOCATION_EXECUTED, title: 'Reallocation: Dallas → Houston', desc: 'Transferred 500 units to prevent stockout', material: 'SKU-2234 Standard Case' },
    { action: ACTION_TYPES.SHORTAGE_ALERT_RAISED, title: 'Shortage Alert: West Region', desc: 'Projected stockout in 5 days for high-velocity SKU', material: 'SKU-1156 Core Product' },
    { action: ACTION_TYPES.WORKING_CAPITAL_OPTIMIZED, title: 'Working Capital Optimized', desc: 'Released $125K through inventory optimization', material: 'Multiple SKUs' },
    { action: ACTION_TYPES.MRP_PARAMETER_CHANGED, title: 'MRP Lead Time Updated', desc: 'Adjusted supplier lead time from 14 to 21 days', material: 'Raw Material RM-445' },
    { action: ACTION_TYPES.STORE_REPLENISHMENT, title: 'Store Replenishment: Store #1842', desc: 'Auto-generated replenishment order for 12 SKUs', material: 'Assorted SKUs' },
  ],
  [TICKET_SOURCES.MARGEN_AI]: [
    { action: ACTION_TYPES.MARGIN_ALERT, title: 'Margin Alert: Premium Segment', desc: 'Gross margin dropped 3.2% vs last month', material: null },
    { action: ACTION_TYPES.CLV_UPDATED, title: 'CLV Recalculated: Enterprise Accounts', desc: 'Updated CLV for 45 enterprise customers', material: null },
    { action: ACTION_TYPES.SEGMENT_CHANGED, title: 'Segment Migration: 12 Accounts', desc: 'Moved from Growth to At Risk based on RFM', material: null },
    { action: ACTION_TYPES.CHURN_RISK_FLAGGED, title: 'Churn Risk: Acme Corp', desc: 'High churn probability (78%) detected', material: null },
    { action: ACTION_TYPES.REVENUE_FORECAST, title: 'Q2 Revenue Forecast Updated', desc: 'Revised forecast: $2.4M (+8% YoY)', material: null },
  ],
  [TICKET_SOURCES.ORDLY_AI]: [
    { action: ACTION_TYPES.ORDER_COMMITTED, title: 'SAP Commit: PO-2025-4521', desc: 'Order committed to SAP with 98% match confidence', material: 'PO-2025-4521' },
    { action: ACTION_TYPES.DEMAND_SIGNAL_PROCESSED, title: 'EDI 850 Processed: Walmart', desc: 'Processed 45 line items from demand signal', material: 'Multiple Items' },
    { action: ACTION_TYPES.NETWORK_OPTIMIZED, title: 'Network Optimization Complete', desc: 'Optimized fulfillment across 8 DCs', material: null },
    { action: ACTION_TYPES.ARBITRATION_COMPLETED, title: 'Arbitration: Multi-DC Conflict', desc: 'Resolved allocation conflict for high-demand SKU', material: 'SKU-7789' },
    { action: ACTION_TYPES.ORDER_PROMISE_UPDATED, title: 'Promise Date Updated: Order #8842', desc: 'Revised delivery from Jan 15 to Jan 12', material: 'Order #8842' },
  ],
  [TICKET_SOURCES.AXIS_AI]: [
    { action: ACTION_TYPES.FORECAST_UPDATED, title: 'Demand Forecast: Q1 2025', desc: 'ML model updated forecast with 94% accuracy', material: null },
    { action: ACTION_TYPES.SCENARIO_CREATED, title: 'Scenario: 10% Demand Surge', desc: 'Created what-if scenario for supply planning', material: null },
    { action: ACTION_TYPES.BUDGET_ALERT, title: 'Budget Variance Alert', desc: 'COGS exceeding budget by 4.2%', material: null },
  ],
  [TICKET_SOURCES.PROCESS_AI]: [
    { action: ACTION_TYPES.AI_QUERY_EXECUTED, title: 'Workflow Optimized: AP Process', desc: 'Identified 3 bottlenecks in accounts payable', material: null },
    { action: ACTION_TYPES.RECOMMENDATION_GENERATED, title: 'Process Improvement: Receiving', desc: 'Suggested automation for receiving dock', material: null },
  ],
  [TICKET_SOURCES.EMAIL_INTEL]: [
    { action: ACTION_TYPES.DEMAND_SIGNAL_PROCESSED, title: 'Email PO Extracted: ABC Corp', desc: 'Parsed order details from email attachment', material: 'PO-EMAIL-8842' },
    { action: ACTION_TYPES.INSIGHT_GENERATED, title: 'Customer Intent Detected', desc: 'Identified urgent order request in email thread', material: null },
  ],
};

// All module sources for random selection
const allModuleSources = [
  TICKET_SOURCES.ALERT_ACTION,
  TICKET_SOURCES.AGENT_AUTOMATED,
  TICKET_SOURCES.STOX_AI,
  TICKET_SOURCES.STOX_AI,
  TICKET_SOURCES.MARGEN_AI,
  TICKET_SOURCES.ORDLY_AI,
  TICKET_SOURCES.ORDLY_AI,
  TICKET_SOURCES.AXIS_AI,
  TICKET_SOURCES.PROCESS_AI,
  TICKET_SOURCES.EMAIL_INTEL,
];

// Generate sample tickets for demo
export const generateSampleTickets = (count = 25) => {
  const tickets = [];
  const legacyActionTypes = Object.values(ACTION_TYPES).filter(a =>
    ['pricing', 'customer', 'ml_model', 'operations', 'quote'].includes(a.category)
  );

  for (let i = 0; i < count; i++) {
    const source = randomItem(allModuleSources);
    const createdBy = randomItem(teamMembers);
    const hoursOld = randomInt(1, 72);
    const status = randomItem([
      TICKET_STATUS.OPEN,
      TICKET_STATUS.OPEN,
      TICKET_STATUS.IN_PROGRESS,
      TICKET_STATUS.IN_PROGRESS,
      TICKET_STATUS.PENDING_REVIEW,
      TICKET_STATUS.COMPLETED,
    ]);

    // Get scenario based on source
    let scenario;
    let actionInfo;
    let title;
    let description;
    let material;

    if (moduleScenarios[source]) {
      scenario = randomItem(moduleScenarios[source]);
      actionInfo = scenario.action;
      title = scenario.title;
      description = scenario.desc;
      material = scenario.material;
    } else {
      // Legacy sources (ALERT_ACTION, AGENT_AUTOMATED)
      actionInfo = randomItem(legacyActionTypes);
      const customer = randomItem(customers);
      title = `${actionInfo.label}: ${customer.name}`;
      description = randomItem([
        `Pricing action required for ${customer.name}`,
        `Customer outreach initiated for ${customer.name}`,
        `Quote preparation for ${customer.name}`,
        `ML-recommended action for ${customer.name}`,
      ]);
      material = randomItem(['PET 50μm Silicone', 'BOPP 40μm Matte', 'Glassine 90gsm', 'CCK 120gsm']);
    }

    const activity = [
      {
        action: 'created',
        by: createdBy.name,
        at: hoursAgo(hoursOld),
        notes: `Ticket created from ${getSourceLabel(source)}`,
      },
    ];

    if (status !== TICKET_STATUS.OPEN) {
      activity.push({
        action: 'status_changed',
        by: createdBy.name,
        at: hoursAgo(hoursOld - randomInt(1, 12)),
        notes: `Status changed to ${status.replace('_', ' ')}`,
      });
    }

    if (status === TICKET_STATUS.COMPLETED) {
      activity.push({
        action: 'completed',
        by: createdBy.name,
        at: hoursAgo(randomInt(1, 6)),
        notes: randomItem([
          'Action executed successfully',
          'Recommendation applied',
          'Order processed',
          'Review completed',
          'Optimization verified',
        ]),
      });
    }

    tickets.push({
      id: `TKT-2025-${String(1000 + i).padStart(4, '0')}`,

      source: source,
      source_alert_id: `ALT-2025-01-${String(randomInt(1, 30)).padStart(2, '0')}-${String(randomInt(1, 9999)).padStart(4, '0')}`,
      source_alert_type: randomItem(['reorder_point', 'margin_erosion', 'demand_signal', 'forecast_variance', 'lead_time_risk']),

      action_type: actionInfo.key,
      action_label: actionInfo.label,
      category: actionInfo.category,

      title: title,
      description: description,

      customer: randomItem(customers),
      quote_id: `Q-2025-${randomInt(1000, 9999)}`,
      material: material,
      revenue_impact: randomInt(5000, 250000),

      status: status,
      priority: randomItem([TICKET_PRIORITY.CRITICAL, TICKET_PRIORITY.HIGH, TICKET_PRIORITY.MEDIUM, TICKET_PRIORITY.LOW]),

      created_by: createdBy,
      assigned_to: randomItem(teamMembers),

      ml_model: randomItem(['InventoryOptimizer', 'DemandForecaster', 'MarginAnalyzer', 'OrderMatcher', 'ChurnPredictor']),
      ai_confidence: Math.random() * 0.3 + 0.7, // 0.7 - 1.0
      ai_recommendation: actionInfo.key,

      created_at: hoursAgo(hoursOld),
      updated_at: hoursAgo(randomInt(0, hoursOld)),
      due_date: status === TICKET_STATUS.COMPLETED ? null : hoursAgo(-randomInt(12, 72)),
      completed_at: status === TICKET_STATUS.COMPLETED ? hoursAgo(randomInt(1, 6)) : null,

      activity: activity,

      related_alerts: [`ALT-2025-01-${String(randomInt(1, 30)).padStart(2, '0')}-${String(randomInt(1, 9999)).padStart(4, '0')}`],
      related_tickets: [],

      tags: [actionInfo.category, source],
    });
  }

  // Sort by created_at (newest first)
  tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return tickets;
};

// Calculate ticket stats
export const calculateTicketStats = (tickets) => {
  const openTickets = tickets.filter(t => t.status === TICKET_STATUS.OPEN);
  const inProgressTickets = tickets.filter(t => t.status === TICKET_STATUS.IN_PROGRESS);
  const completedToday = tickets.filter(t => {
    if (t.status !== TICKET_STATUS.COMPLETED) return false;
    const today = new Date().toDateString();
    return new Date(t.completed_at).toDateString() === today;
  });

  const totalRevenue = tickets
    .filter(t => t.status === TICKET_STATUS.COMPLETED)
    .reduce((sum, t) => sum + (t.revenue_impact || 0), 0);

  // All categories
  const byCategory = {
    pricing: tickets.filter(t => t.category === TICKET_CATEGORIES.PRICING).length,
    customer: tickets.filter(t => t.category === TICKET_CATEGORIES.CUSTOMER).length,
    ml_model: tickets.filter(t => t.category === TICKET_CATEGORIES.ML_MODEL).length,
    operations: tickets.filter(t => t.category === TICKET_CATEGORIES.OPERATIONS).length,
    quote: tickets.filter(t => t.category === TICKET_CATEGORIES.QUOTE).length,
    inventory: tickets.filter(t => t.category === TICKET_CATEGORIES.INVENTORY).length,
    financial: tickets.filter(t => t.category === TICKET_CATEGORIES.FINANCIAL).length,
    order: tickets.filter(t => t.category === TICKET_CATEGORIES.ORDER).length,
    ai_query: tickets.filter(t => t.category === TICKET_CATEGORIES.AI_QUERY).length,
    supply_chain: tickets.filter(t => t.category === TICKET_CATEGORIES.SUPPLY_CHAIN).length,
    forecast: tickets.filter(t => t.category === TICKET_CATEGORIES.FORECAST).length,
  };

  // All sources including AI modules
  const bySource = {
    alert_action: tickets.filter(t => t.source === TICKET_SOURCES.ALERT_ACTION).length,
    agent_automated: tickets.filter(t => t.source === TICKET_SOURCES.AGENT_AUTOMATED).length,
    manual_entry: tickets.filter(t => t.source === TICKET_SOURCES.MANUAL_ENTRY).length,
    stox_ai: tickets.filter(t => t.source === TICKET_SOURCES.STOX_AI).length,
    margen_ai: tickets.filter(t => t.source === TICKET_SOURCES.MARGEN_AI).length,
    ordly_ai: tickets.filter(t => t.source === TICKET_SOURCES.ORDLY_AI).length,
    axis_ai: tickets.filter(t => t.source === TICKET_SOURCES.AXIS_AI).length,
    process_ai: tickets.filter(t => t.source === TICKET_SOURCES.PROCESS_AI).length,
    email_intel: tickets.filter(t => t.source === TICKET_SOURCES.EMAIL_INTEL).length,
  };

  return {
    open: openTickets.length,
    inProgress: inProgressTickets.length,
    completedToday: completedToday.length,
    totalRevenue,
    byCategory,
    bySource,
    total: tickets.length,
  };
};

// Priority colors
export const getPriorityColor = (priority) => {
  switch (priority) {
    case TICKET_PRIORITY.CRITICAL: return 'error';
    case TICKET_PRIORITY.HIGH: return 'warning';
    case TICKET_PRIORITY.MEDIUM: return 'info';
    case TICKET_PRIORITY.LOW: return 'default';
    default: return 'default';
  }
};

// Status colors
export const getStatusColor = (status) => {
  switch (status) {
    case TICKET_STATUS.OPEN: return 'error';
    case TICKET_STATUS.IN_PROGRESS: return 'info';
    case TICKET_STATUS.PENDING_REVIEW: return 'warning';
    case TICKET_STATUS.COMPLETED: return 'success';
    case TICKET_STATUS.CANCELLED: return 'default';
    default: return 'default';
  }
};

// Category colors
export const getCategoryColor = (category) => {
  switch (category) {
    case TICKET_CATEGORIES.PRICING: return '#10b981';
    case TICKET_CATEGORIES.CUSTOMER: return '#0ea5e9';
    case TICKET_CATEGORIES.ML_MODEL: return '#8b5cf6';
    case TICKET_CATEGORIES.OPERATIONS: return '#f59e0b';
    case TICKET_CATEGORIES.QUOTE: return '#0a6ed1';
    // New categories
    case TICKET_CATEGORIES.INVENTORY: return '#059669';     // STOX.AI green
    case TICKET_CATEGORIES.FINANCIAL: return '#7c3aed';     // MargenAI purple
    case TICKET_CATEGORIES.ORDER: return '#0891b2';         // OrdlyAI cyan
    case TICKET_CATEGORIES.AI_QUERY: return '#4f46e5';      // Indigo
    case TICKET_CATEGORIES.SUPPLY_CHAIN: return '#ea580c';  // Orange
    case TICKET_CATEGORIES.FORECAST: return '#ca8a04';      // Amber/Gold
    default: return '#64748b';
  }
};

// Source labels
export const getSourceLabel = (source) => {
  switch (source) {
    case TICKET_SOURCES.ALERT_ACTION: return 'ML Alert';
    case TICKET_SOURCES.AGENT_AUTOMATED: return 'Agent';
    case TICKET_SOURCES.MANUAL_ENTRY: return 'Manual';
    case TICKET_SOURCES.SYSTEM_TRIGGER: return 'System';
    case TICKET_SOURCES.STOX_AI: return 'STOX.AI';
    case TICKET_SOURCES.MARGEN_AI: return 'MARGEN.AI';
    case TICKET_SOURCES.ORDLY_AI: return 'ORDLY.AI';
    case TICKET_SOURCES.AXIS_AI: return 'AXIS.AI';
    case TICKET_SOURCES.PROCESS_AI: return 'PROCESS.AI';
    case TICKET_SOURCES.EMAIL_INTEL: return 'EMAIL INTEL';
    default: return 'Unknown';
  }
};

// Source colors for chips
export const getSourceColor = (source) => {
  switch (source) {
    case TICKET_SOURCES.STOX_AI: return '#10b981';      // Green
    case TICKET_SOURCES.MARGEN_AI: return '#8b5cf6';    // Purple
    case TICKET_SOURCES.ORDLY_AI: return '#0ea5e9';     // Cyan
    case TICKET_SOURCES.AXIS_AI: return '#f59e0b';      // Amber
    case TICKET_SOURCES.PROCESS_AI: return '#ec4899';   // Pink
    case TICKET_SOURCES.EMAIL_INTEL: return '#6366f1';  // Indigo
    case TICKET_SOURCES.AGENT_AUTOMATED: return '#0a6ed1';
    case TICKET_SOURCES.ALERT_ACTION: return '#ef4444';
    default: return '#64748b';
  }
};

export default {
  TICKET_SOURCES,
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_CATEGORIES,
  ACTION_TYPES,
  createTicketFromAction,
  generateSampleTickets,
  calculateTicketStats,
  getPriorityColor,
  getStatusColor,
  getCategoryColor,
  getSourceLabel,
  getSourceColor,
};
