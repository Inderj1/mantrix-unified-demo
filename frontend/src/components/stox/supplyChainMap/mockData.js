/**
 * Arizona Beverages Global Supply Chain Data
 * Clean, organized data for the Supply Chain Map tile
 */

// ============================================
// ARIZONA BEVERAGES FACILITIES
// ============================================
export const mockStores = [
  // Primary Distribution Centers
  {
    store_id: 'DC-KEASBEY',
    name: 'Keasbey NJ Distribution',
    facility_type: 'plant',
    latitude: 40.5207,
    longitude: -74.2932,
    region: 'Northeast',
    country: 'USA',
    stock_level: 78,
    inventory_value: 12500000,
    capacity: 500000,
    current_stock: 390000,
    demand_rate: 15000,
    status: 'operational',
    customers: ['Walmart Northeast', 'Target', 'Costco'],
  },
  {
    store_id: 'MFG-DRINKPAK',
    name: 'Santa Clarita CA',
    facility_type: 'plant',
    latitude: 34.3917,
    longitude: -118.5426,
    region: 'West',
    country: 'USA',
    stock_level: 82,
    inventory_value: 8900000,
    capacity: 450000,
    current_stock: 369000,
    demand_rate: 12000,
    status: 'operational',
    customers: ['Walmart West', 'Kroger', 'Safeway'],
  },
  {
    store_id: 'MFG-POLAR',
    name: 'Douglas GA',
    facility_type: 'plant',
    latitude: 31.5085,
    longitude: -82.8496,
    region: 'Southeast',
    country: 'USA',
    stock_level: 65,
    inventory_value: 6200000,
    capacity: 400000,
    current_stock: 260000,
    demand_rate: 18000,
    status: 'low-stock',
    customers: ['Publix', 'Winn-Dixie', 'Food Lion'],
  },
  {
    store_id: 'MFG-TAMPICO',
    name: 'Wharton TX',
    facility_type: 'plant',
    latitude: 29.3116,
    longitude: -96.1025,
    region: 'Central',
    country: 'USA',
    stock_level: 88,
    inventory_value: 7800000,
    capacity: 550000,
    current_stock: 484000,
    demand_rate: 22000,
    status: 'operational',
    customers: ['HEB', 'Walmart Central', '7-Eleven'],
  },
  {
    store_id: 'MFG-MAXPAK',
    name: 'Lakeland FL',
    facility_type: 'plant',
    latitude: 28.0395,
    longitude: -81.9498,
    region: 'Southeast',
    country: 'USA',
    stock_level: 58,
    inventory_value: 5400000,
    capacity: 300000,
    current_stock: 174000,
    demand_rate: 8000,
    status: 'low-stock',
    customers: ['Publix', 'Walmart Florida', 'CVS'],
  },
  // Key Suppliers/Vendors
  {
    store_id: 'VND-USBEV',
    name: 'US Beverage Packers',
    facility_type: 'vendor',
    latitude: 40.5207,
    longitude: -74.3032,
    region: 'Northeast',
    country: 'USA',
    stock_level: 92,
    vendor_rating: 4.5,
    lead_time: 14,
    status: 'operational',
  },
  {
    store_id: 'VND-NIAGARA',
    name: 'Niagara Bottling',
    facility_type: 'vendor',
    latitude: 34.1064,
    longitude: -117.3703,
    region: 'West',
    country: 'USA',
    stock_level: 88,
    vendor_rating: 4.3,
    lead_time: 21,
    status: 'operational',
  },
  {
    store_id: 'VND-REFRESCO',
    name: 'Refresco Beverages',
    facility_type: 'vendor',
    latitude: 35.7998,
    longitude: -95.2508,
    region: 'Central',
    country: 'USA',
    stock_level: 75,
    vendor_rating: 4.0,
    lead_time: 18,
    status: 'operational',
  },
];

// ============================================
// SUPPLY CHAIN FLOW DATA
// ============================================
export const mockInTransit = [
  // Inbound from vendors
  {
    transit_id: 'SHP-001',
    origin: 'US Beverage Packers',
    destination: 'DC-KEASBEY',
    destination_name: 'Keasbey NJ',
    product: 'AZ Green Tea 24PK',
    quantity: 15000,
    status: 'in-transit',
    eta: '2024-01-18',
    carrier: 'XPO Logistics',
    shipment_type: 'inbound',
  },
  {
    transit_id: 'SHP-002',
    origin: 'Niagara Bottling',
    destination: 'MFG-DRINKPAK',
    destination_name: 'Santa Clarita CA',
    product: 'AZ Arnold Palmer 4PK',
    quantity: 12000,
    status: 'in-transit',
    eta: '2024-01-19',
    carrier: 'JB Hunt',
    shipment_type: 'inbound',
  },
  // Outbound to customers
  {
    transit_id: 'SHP-003',
    origin: 'Keasbey NJ',
    destination: 'Walmart Northeast DC',
    destination_name: 'Walmart Distribution',
    product: 'AZ Green Tea 24PK',
    quantity: 8500,
    status: 'in-transit',
    eta: '2024-01-17',
    carrier: 'Schneider',
    shipment_type: 'outbound',
  },
  {
    transit_id: 'SHP-004',
    origin: 'Keasbey NJ',
    destination: 'Target Northeast DC',
    destination_name: 'Target Distribution',
    product: 'AZ Lemon Tea 24PK',
    quantity: 6200,
    status: 'delivered',
    eta: '2024-01-16',
    carrier: 'UPS Freight',
    shipment_type: 'outbound',
  },
  {
    transit_id: 'SHP-005',
    origin: 'Keasbey NJ',
    destination: 'Costco Northeast',
    destination_name: 'Costco Distribution',
    product: 'AZ Mucho Mango 4PK',
    quantity: 4800,
    status: 'in-transit',
    eta: '2024-01-18',
    carrier: 'FedEx Freight',
    shipment_type: 'outbound',
  },
  {
    transit_id: 'SHP-006',
    origin: 'Refresco Beverages',
    destination: 'MFG-TAMPICO',
    destination_name: 'Wharton TX',
    product: 'Raw Materials',
    quantity: 25000,
    status: 'delayed',
    eta: '2024-01-20',
    carrier: 'Werner',
    shipment_type: 'inbound',
  },
];

// ============================================
// SUPPLY CHAIN ALERTS/EXCEPTIONS
// ============================================
export const mockAlerts = [
  {
    alert_id: 'ALT-001',
    type: 'delay',
    severity: 'high',
    title: 'Shipment Delay - Refresco',
    description: 'Raw materials shipment from Refresco delayed by 3 days due to weather',
    affected_shipment: 'SHP-006',
    timestamp: '2024-01-16T08:30:00',
    action: 'Notify Wharton production',
  },
  {
    alert_id: 'ALT-002',
    type: 'low-stock',
    severity: 'medium',
    title: 'Low Stock Alert - Douglas GA',
    description: 'AZ Arnold Palmer inventory below safety stock at Douglas facility',
    affected_store: 'MFG-POLAR',
    timestamp: '2024-01-16T10:15:00',
    action: 'Expedite transfer from Keasbey',
  },
  {
    alert_id: 'ALT-003',
    type: 'capacity',
    severity: 'low',
    title: 'High Utilization - Santa Clarita',
    description: 'Production capacity at 92% - approaching maximum',
    affected_store: 'MFG-DRINKPAK',
    timestamp: '2024-01-16T14:00:00',
    action: 'Review production schedule',
  },
];

// ============================================
// AI-POWERED RECOMMENDATIONS
// ============================================
export const mockRecommendations = [
  {
    id: 'REC-001',
    type: 'rebalancing',
    priority: 'high',
    title: 'Transfer Stock to Douglas GA',
    description: 'Move 15,000 cases of AZ Arnold Palmer from Keasbey to Douglas to prevent stockout',
    impact: '$125K revenue protection',
    savings: 125000,
    action: 'Initiate inter-facility transfer',
  },
  {
    id: 'REC-002',
    type: 'optimization',
    priority: 'medium',
    title: 'Reduce Keasbey Safety Stock',
    description: 'AZ Green Tea safety stock 20% above optimal - reduce by 8,000 cases',
    impact: '$85K working capital release',
    savings: 85000,
    action: 'Reduce Keasbey safety stock by 8,000 cases',
  },
  {
    id: 'REC-003',
    type: 'sourcing',
    priority: 'medium',
    title: 'Dual-Source Critical Materials',
    description: 'Add secondary supplier for tea concentrate to reduce risk',
    impact: 'Reduce supply risk by 35%',
    savings: 50000,
    action: 'Qualify backup supplier',
  },
];

// ============================================
// MAP VISUALIZATION ROUTES
// ============================================
export const mockRoutes = [
  // Main distribution routes
  [
    [40.5207, -74.2932],  // Keasbey NJ
    [40.7128, -74.0060],  // NYC area
    [41.8781, -87.6298],  // Chicago
  ],
  [
    [34.3917, -118.5426],  // Santa Clarita
    [34.0522, -118.2437],  // Los Angeles
    [32.7157, -117.1611],  // San Diego
  ],
  [
    [40.5207, -74.2932],  // Keasbey (origin)
    [39.9526, -75.1652],  // Philadelphia
    [38.9072, -77.0369],  // Washington DC
  ],
  [
    [29.3116, -96.1025],  // Wharton TX
    [29.7604, -95.3698],  // Houston
    [32.7767, -96.7970],  // Dallas
  ],
  [
    [31.5085, -82.8496],  // Douglas GA
    [33.7490, -84.3880],  // Atlanta
    [25.7617, -80.1918],  // Miami
  ],
];

// ============================================
// KPI SUMMARY DATA
// ============================================
export const mockKPIs = {
  totalInventoryValue: 40800000,
  totalShipments: 156,
  onTimeDelivery: 94.2,
  avgLeadTime: 4.8,
  stockoutRisk: 2,
  inTransitValue: 2850000,
  facilitiesOperational: 5,
  activeAlerts: 3,
};

// ============================================
// FLEET/TRUCKS DATA
// ============================================
export const mockTrucks = [
  {
    truck_id: 'TRK-001',
    driver: 'Mike Johnson',
    status: 'in-transit',
    current_location: { lat: 40.2, lng: -74.5 },
    destination: 'Keasbey NJ',
    eta: '2024-01-17 14:30',
    cargo: 'AZ Green Tea 24PK',
    capacity_used: 85,
  },
  {
    truck_id: 'TRK-002',
    driver: 'Sarah Williams',
    status: 'loading',
    current_location: { lat: 34.3917, lng: -118.5426 },
    destination: 'Los Angeles DC',
    eta: '2024-01-17 16:00',
    cargo: 'AZ Arnold Palmer 4PK',
    capacity_used: 0,
  },
  {
    truck_id: 'TRK-003',
    driver: 'Carlos Martinez',
    status: 'in-transit',
    current_location: { lat: 32.1, lng: -95.2 },
    destination: 'Wharton TX',
    eta: '2024-01-17 18:00',
    cargo: 'Raw Materials',
    capacity_used: 92,
  },
];

// ============================================
// AI AGENTS DATA
// ============================================
export const mockAgents = [
  {
    agent_id: 'AGT-001',
    name: 'Inventory Optimizer',
    status: 'active',
    last_action: 'Recommended safety stock reduction at Keasbey',
    actions_today: 12,
    success_rate: 94,
  },
  {
    agent_id: 'AGT-002',
    name: 'Route Optimizer',
    status: 'active',
    last_action: 'Optimized delivery route for TRK-001',
    actions_today: 8,
    success_rate: 97,
  },
  {
    agent_id: 'AGT-003',
    name: 'Demand Forecaster',
    status: 'analyzing',
    last_action: 'Updated forecast for AZ Green Tea',
    actions_today: 5,
    success_rate: 91,
  },
];

// ============================================
// AI ACTIONS LOG
// ============================================
export const mockAIActions = [
  {
    action_id: 'ACT-001',
    agent: 'Inventory Optimizer',
    action: 'Initiated stock transfer',
    description: 'Moving 5,000 cases from Keasbey to Douglas GA',
    timestamp: '2024-01-16T14:30:00',
    status: 'completed',
    impact: '$45K savings',
  },
  {
    action_id: 'ACT-002',
    agent: 'Route Optimizer',
    action: 'Route consolidation',
    description: 'Combined 3 shipments to Northeast region',
    timestamp: '2024-01-16T13:15:00',
    status: 'completed',
    impact: '$8K freight savings',
  },
  {
    action_id: 'ACT-003',
    agent: 'Demand Forecaster',
    action: 'Forecast adjustment',
    description: 'Increased AZ Green Tea forecast by 15% for Q2',
    timestamp: '2024-01-16T11:00:00',
    status: 'pending-approval',
    impact: 'Prevent $125K stockout',
  },
];

// ============================================
// AUTOPILOT STATUS
// ============================================
export const mockAutopilotStatus = {
  enabled: true,
  mode: 'semi-automatic',
  active_agents: 3,
  pending_approvals: 2,
  actions_today: 25,
  savings_today: 58000,
  last_updated: '2024-01-16T15:00:00',
};
