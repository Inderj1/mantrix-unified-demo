// Command Tower - Ticket Tracking System
// Tracks all actions performed across the platform (manual or automated)

// Ticket Sources - where the ticket originated
export const TICKET_SOURCES = {
  ALERT_ACTION: 'alert_action',       // From ML alert action
  AGENT_AUTOMATED: 'agent_automated', // Automated agent action
  MANUAL_ENTRY: 'manual_entry',       // Manually created
  SYSTEM_TRIGGER: 'system_trigger',   // System-generated
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

// Ticket Categories aligned with Ordly AI
export const TICKET_CATEGORIES = {
  PRICING: 'pricing',
  CUSTOMER: 'customer',
  ML_MODEL: 'ml_model',
  OPERATIONS: 'operations',
  QUOTE: 'quote',
  GENERAL: 'general',
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

// Generate sample tickets for demo
export const generateSampleTickets = (count = 20) => {
  const tickets = [];
  const actionTypes = Object.values(ACTION_TYPES);

  for (let i = 0; i < count; i++) {
    const actionInfo = randomItem(actionTypes);
    const customer = randomItem(customers);
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

    const activity = [
      {
        action: 'created',
        by: createdBy.name,
        at: hoursAgo(hoursOld),
        notes: `Ticket created from ${randomItem(['ML alert', 'agent automation', 'manual entry'])}`,
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
          'Quote sent successfully',
          'Customer confirmed receipt',
          'Price adjustment applied',
          'Review completed',
          'Action verified',
        ]),
      });
    }

    tickets.push({
      id: `TKT-2025-${String(1000 + i).padStart(4, '0')}`,

      source: randomItem([TICKET_SOURCES.ALERT_ACTION, TICKET_SOURCES.ALERT_ACTION, TICKET_SOURCES.AGENT_AUTOMATED, TICKET_SOURCES.MANUAL_ENTRY]),
      source_alert_id: `ALT-2024-12-${String(randomInt(1, 30)).padStart(2, '0')}-${String(randomInt(1, 9999)).padStart(4, '0')}`,
      source_alert_type: randomItem(['price_below_optimal', 'margin_erosion', 'order_gap_detected', 'churn_risk_high', 'lead_time_risk']),

      action_type: actionInfo.key,
      action_label: actionInfo.label,
      category: actionInfo.category,

      title: `${actionInfo.label}: ${customer.name}`,
      description: randomItem([
        `Pricing action required for ${customer.name}`,
        `Customer outreach initiated for ${customer.name}`,
        `Quote preparation for ${customer.name}`,
        `Follow-up action for ${customer.name}`,
        `ML-recommended action for ${customer.name}`,
      ]),

      customer: customer,
      quote_id: `Q-2025-${randomInt(1000, 9999)}`,
      material: randomItem(['PET 50μm Silicone', 'BOPP 40μm Matte', 'Glassine 90gsm', 'CCK 120gsm']),
      revenue_impact: randomInt(5000, 150000),

      status: status,
      priority: randomItem([TICKET_PRIORITY.CRITICAL, TICKET_PRIORITY.HIGH, TICKET_PRIORITY.MEDIUM, TICKET_PRIORITY.LOW]),

      created_by: createdBy,
      assigned_to: randomItem(teamMembers),

      ml_model: randomItem(['POSpecParser', 'MaterialMatcher', 'PriceOptimizer', 'CustomerValueScore']),
      ai_confidence: Math.random() * 0.3 + 0.7, // 0.7 - 1.0
      ai_recommendation: actionInfo.key,

      created_at: hoursAgo(hoursOld),
      updated_at: hoursAgo(randomInt(0, hoursOld)),
      due_date: status === TICKET_STATUS.COMPLETED ? null : hoursAgo(-randomInt(12, 72)),
      completed_at: status === TICKET_STATUS.COMPLETED ? hoursAgo(randomInt(1, 6)) : null,

      activity: activity,

      related_alerts: [`ALT-2024-12-${String(randomInt(1, 30)).padStart(2, '0')}-${String(randomInt(1, 9999)).padStart(4, '0')}`],
      related_tickets: [],

      tags: [actionInfo.category, customer.segment.toLowerCase()],
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

  const byCategory = {
    pricing: tickets.filter(t => t.category === TICKET_CATEGORIES.PRICING).length,
    customer: tickets.filter(t => t.category === TICKET_CATEGORIES.CUSTOMER).length,
    ml_model: tickets.filter(t => t.category === TICKET_CATEGORIES.ML_MODEL).length,
    operations: tickets.filter(t => t.category === TICKET_CATEGORIES.OPERATIONS).length,
    quote: tickets.filter(t => t.category === TICKET_CATEGORIES.QUOTE).length,
  };

  const bySource = {
    alert_action: tickets.filter(t => t.source === TICKET_SOURCES.ALERT_ACTION).length,
    agent_automated: tickets.filter(t => t.source === TICKET_SOURCES.AGENT_AUTOMATED).length,
    manual_entry: tickets.filter(t => t.source === TICKET_SOURCES.MANUAL_ENTRY).length,
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
    default: return 'Unknown';
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
};
