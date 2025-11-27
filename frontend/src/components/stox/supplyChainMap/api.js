/**
 * API client for Supply Chain Map
 * Supports both mock data and live backend modes
 */

import {
  mockTrucks,
  mockStores,
  mockAlerts,
  mockAgents,
  mockAIActions,
  mockAutopilotStatus,
} from './mockData';

// Configuration - can be overridden via environment variables
export const USE_MOCK = import.meta.env.VITE_SUPPLY_CHAIN_USE_MOCK !== 'false';
export const API_URL = import.meta.env.VITE_SUPPLY_CHAIN_API_URL || 'http://localhost:8000';
const API_V1_PREFIX = '/api/v1';

/**
 * Fetch wrapper with error handling
 */
async function fetchApi(endpoint, options = {}) {
  if (USE_MOCK) {
    // Simulate network delay for mock data
    await new Promise(resolve => setTimeout(resolve, 300));
    return getMockData(endpoint);
  }

  try {
    const response = await fetch(`${API_URL}${API_V1_PREFIX}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return { data: await response.json(), error: null };
  } catch (error) {
    console.error(`API Error fetching ${endpoint}:`, error);
    return { data: null, error };
  }
}

/**
 * Get mock data based on endpoint
 */
function getMockData(endpoint) {
  if (endpoint.startsWith('/trucks')) {
    return { data: mockTrucks, error: null };
  }
  if (endpoint.startsWith('/stores')) {
    return { data: mockStores, error: null };
  }
  if (endpoint.startsWith('/alerts')) {
    return { data: mockAlerts, error: null };
  }
  if (endpoint.startsWith('/agents')) {
    return { data: { agents: mockAgents }, error: null };
  }
  return { data: null, error: new Error('Unknown endpoint') };
}

// Trucks API
export const trucksApi = {
  getAll: () => fetchApi('/trucks'),
  getById: (id) => fetchApi(`/trucks/${id}`),
  update: (id, data) => fetchApi(`/trucks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Stores API
export const storesApi = {
  getAll: () => fetchApi('/stores'),
  getById: (id) => fetchApi(`/stores/${id}`),
  update: (id, data) => fetchApi(`/stores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Alerts API
export const alertsApi = {
  getAll: (status) => {
    const query = status ? `?status=${status}` : '';
    return fetchApi(`/alerts${query}`);
  },
  generate: () => fetchApi('/alerts/generate', { method: 'POST' }),
  update: (id, data) => fetchApi(`/alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  dismiss: (id) => fetchApi(`/alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'dismissed' }),
  }),
};

// Agents API
export const agentsApi = {
  getAll: () => fetchApi('/agents'),
  getById: (id) => fetchApi(`/agents/${id}`),
  chat: (agentId, message) => fetchApi(`/agents/${agentId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  }),
};

// Seed database (for development)
export const seedDatabase = async () => {
  if (USE_MOCK) {
    return { data: { message: 'Using mock data' }, error: null };
  }
  return fetchApi('/seed', { method: 'POST' });
};

// AI Actions helpers (for mock mode)
export const getAIActions = () => {
  if (USE_MOCK) {
    return mockAIActions;
  }
  return [];
};

export const getAutopilotStatus = () => {
  if (USE_MOCK) {
    return mockAutopilotStatus;
  }
  return null;
};

// Generate AI actions based on current state
export function generateAIActions(trucks, stores, alerts) {
  if (USE_MOCK) {
    return mockAIActions;
  }

  // Generate actions based on current state
  const actions = [];

  // Check for low stock stores
  stores.forEach(store => {
    if (store.stock_level < 30) {
      actions.push({
        id: `action-stock-${store.store_id}`,
        timestamp: new Date(),
        agent_id: 'inventory-manager',
        agent_name: 'Stox.AI',
        action_type: 'transfer',
        description: `Urgent stock transfer needed for ${store.name}`,
        predicted_impact: 20,
        confidence: 90,
        status: 'pending-approval',
        requires_approval: true,
        auto_approved: false,
        facility_affected: store.store_id,
      });
    }
  });

  // Check for delayed trucks
  trucks.forEach(truck => {
    if (truck.status === 'delayed') {
      actions.push({
        id: `action-route-${truck.truck_id}`,
        timestamp: new Date(),
        agent_id: 'route-optimizer',
        agent_name: 'Route.AI',
        action_type: 'route',
        description: `Route optimization available for ${truck.truck_id}`,
        predicted_impact: 10,
        confidence: 85,
        status: 'pending-approval',
        requires_approval: true,
        auto_approved: false,
      });
    }
  });

  return actions;
}

// Calculate autopilot status
export function calculateAutopilotStatus(actions) {
  if (USE_MOCK) {
    return mockAutopilotStatus;
  }

  const pending = actions.filter(a => a.status === 'pending-approval');
  const completed = actions.filter(a => a.status === 'completed');
  const costSaved = completed.reduce((sum, a) => sum + (a.cost_saved || 0), 0);

  return {
    mode: pending.length > 0 ? 'proposals-ready' : 'monitoring',
    pending_count: pending.length,
    actions_today: actions.length,
    cost_saved_week: costSaved,
    issues_prevented: completed.length,
    ai_confidence_avg: actions.length > 0
      ? Math.round(actions.reduce((sum, a) => sum + a.confidence, 0) / actions.length)
      : 0,
  };
}

// Separate actions by status
export function separateActions(actions) {
  return {
    pending: actions.filter(a => a.status === 'pending-approval'),
    completed: actions.filter(a => a.status === 'completed' || a.status === 'in-progress'),
  };
}

export default {
  trucksApi,
  storesApi,
  alertsApi,
  agentsApi,
  seedDatabase,
  getAIActions,
  getAutopilotStatus,
  generateAIActions,
  calculateAutopilotStatus,
  separateActions,
  USE_MOCK,
  API_URL,
};
