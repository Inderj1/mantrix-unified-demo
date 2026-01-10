/**
 * Lam Research Global Supply Chain Data
 * Clean, organized data for the Supply Chain Map tile
 */

// ============================================
// LAM RESEARCH MANUFACTURING PLANTS (5)
// ============================================
export const mockStores = [
  {
    store_id: 'PLT-1000',
    name: 'Fremont HQ',
    facility_type: 'plant',
    latitude: 37.5485,
    longitude: -121.9886,
    region: 'Americas',
    country: 'USA',
    stock_level: 78,
    inventory_value: 266100000,
    capacity: 500,
    current_stock: 390,
    demand_rate: 15,
    status: 'operational',
    customers: ['Intel', 'Micron', 'GlobalFoundries'],
  },
  {
    store_id: 'PLT-2000',
    name: 'Tualatin OR',
    facility_type: 'plant',
    latitude: 45.3841,
    longitude: -122.7642,
    region: 'Americas',
    country: 'USA',
    stock_level: 82,
    inventory_value: 305300000,
    capacity: 450,
    current_stock: 369,
    demand_rate: 12,
    status: 'operational',
    customers: ['Intel', 'Western Digital'],
  },
  {
    store_id: 'PLT-3000',
    name: 'Hwaseong Korea',
    facility_type: 'plant',
    latitude: 37.1997,
    longitude: 127.0540,
    region: 'Asia',
    country: 'Korea',
    stock_level: 65,
    inventory_value: 176600000,
    capacity: 400,
    current_stock: 260,
    demand_rate: 18,
    status: 'low-stock',
    customers: ['Samsung', 'SK Hynix'],
  },
  {
    store_id: 'PLT-4000',
    name: 'Hsinchu Taiwan',
    facility_type: 'plant',
    latitude: 24.8047,
    longitude: 120.9714,
    region: 'Asia',
    country: 'Taiwan',
    stock_level: 88,
    inventory_value: 317200000,
    capacity: 550,
    current_stock: 484,
    demand_rate: 22,
    status: 'operational',
    customers: ['TSMC', 'UMC', 'Powerchip'],
  },
  {
    store_id: 'PLT-5000',
    name: 'Villach Austria',
    facility_type: 'plant',
    latitude: 46.6103,
    longitude: 13.8558,
    region: 'EMEA',
    country: 'Austria',
    stock_level: 58,
    inventory_value: 132400000,
    capacity: 300,
    current_stock: 174,
    demand_rate: 8,
    status: 'low-stock',
    customers: ['Infineon', 'STMicro', 'NXP'],
  },
  // Key Vendors
  {
    store_id: 'VND-AMAT',
    name: 'Applied Materials',
    facility_type: 'vendor',
    latitude: 37.3541,
    longitude: -121.9552,
    region: 'Americas',
    country: 'USA',
    stock_level: 92,
    vendor_rating: 4.5,
    lead_time: 45,
    category: 'Equipment',
  },
  {
    store_id: 'VND-MKS',
    name: 'MKS Instruments',
    facility_type: 'vendor',
    latitude: 42.6584,
    longitude: -71.1374,
    region: 'Americas',
    country: 'USA',
    stock_level: 78,
    vendor_rating: 4.6,
    lead_time: 30,
    category: 'Power/RF',
  },
  {
    store_id: 'VND-HORIBA',
    name: 'Horiba Ltd',
    facility_type: 'vendor',
    latitude: 35.0116,
    longitude: 135.7681,
    region: 'Asia',
    country: 'Japan',
    stock_level: 68,
    vendor_rating: 4.4,
    lead_time: 50,
    category: 'Sensors',
  },
  {
    store_id: 'VND-VAT',
    name: 'VAT Group',
    facility_type: 'vendor',
    latitude: 47.1649,
    longitude: 9.4783,
    region: 'EMEA',
    country: 'Switzerland',
    stock_level: 82,
    vendor_rating: 4.1,
    lead_time: 55,
    category: 'Valves',
  },
];

// ============================================
// ACTIVE SHIPMENTS (6)
// ============================================
export const mockTrucks = [
  {
    truck_id: 'SHP-001',
    type: 'ground',
    status: 'in-transit',
    latitude: 37.4,
    longitude: -121.9,
    origin: 'Applied Materials',
    destination_id: 'PLT-1000',
    destination_name: 'Fremont HQ',
    cargo: 'Vacuum Pump Modules (3 units)',
    value: 450000,
    eta: '2 hours',
  },
  {
    truck_id: 'SHP-002',
    type: 'ground',
    status: 'delayed',
    latitude: 45.2,
    longitude: -122.8,
    origin: 'MKS Instruments',
    destination_id: 'PLT-2000',
    destination_name: 'Tualatin OR',
    cargo: 'RF Power Supply Units (5 units)',
    value: 425000,
    eta: '+6 hours delay',
  },
  {
    truck_id: 'AIR-001',
    type: 'air',
    status: 'in-transit',
    latitude: 45.0,
    longitude: -160.0,
    origin: 'Fremont HQ',
    destination_id: 'PLT-3000',
    destination_name: 'Hwaseong Korea',
    cargo: 'Etch System Components',
    value: 2800000,
    eta: '14 hours',
  },
  {
    truck_id: 'AIR-002',
    type: 'air',
    status: 'in-transit',
    latitude: 38.0,
    longitude: 170.0,
    origin: 'Fremont HQ',
    destination_id: 'PLT-4000',
    destination_name: 'Hsinchu Taiwan',
    cargo: 'Deposition System Parts',
    value: 3200000,
    eta: '8 hours',
  },
  {
    truck_id: 'SEA-001',
    type: 'sea',
    status: 'in-transit',
    latitude: 42.0,
    longitude: -40.0,
    origin: 'Fremont HQ',
    destination_id: 'PLT-5000',
    destination_name: 'Villach Austria',
    cargo: 'Bulk Components (Container)',
    value: 1500000,
    eta: '12 days',
  },
  {
    truck_id: 'SHP-003',
    type: 'ground',
    status: 'delivered',
    latitude: 45.3841,
    longitude: -122.7642,
    origin: 'Edwards Vacuum',
    destination_id: 'PLT-2000',
    destination_name: 'Tualatin OR',
    cargo: 'Chamber Liner Sets',
    value: 180000,
    eta: 'Delivered',
  },
];

// ============================================
// ALERTS (4 key alerts)
// ============================================
export const mockAlerts = [
  {
    id: 1,
    alert_type: 'stock',
    title: 'Low Stock - Korea',
    message: 'Hwaseong plant at 65% capacity. Samsung order at risk.',
    latitude: 37.1997,
    longitude: 127.0540,
    severity: 'critical',
    priority: 9,
    action: 'Expedite AIR-001 shipment',
  },
  {
    id: 2,
    alert_type: 'shipment',
    title: 'Delay - Oregon Route',
    message: 'SHP-002 delayed 6 hours. Weather conditions.',
    latitude: 45.2,
    longitude: -122.8,
    severity: 'high',
    priority: 7,
    action: 'Notify Tualatin production',
  },
  {
    id: 3,
    alert_type: 'stock',
    title: 'Low Stock - Austria',
    message: 'Villach at 58% capacity. EMEA orders impacted.',
    latitude: 46.6103,
    longitude: 13.8558,
    severity: 'high',
    priority: 8,
    action: 'SEA-001 in transit (12 days)',
  },
  {
    id: 4,
    alert_type: 'demand',
    title: 'TSMC Demand Surge',
    message: 'N3 expansion: +40% demand expected.',
    latitude: 24.8047,
    longitude: 120.9714,
    severity: 'medium',
    priority: 6,
    action: 'Review Taiwan inventory',
  },
];

// ============================================
// AI AGENTS (4)
// ============================================
export const mockAgents = [
  {
    id: 'logistics',
    name: 'Logistics.AI',
    icon: 'flight',
    color: '#3b82f6',
    status: 'active',
    activity: 'Tracking 6 shipments globally',
  },
  {
    id: 'inventory',
    name: 'Stox.AI',
    icon: 'inventory',
    color: '#0078d4',
    status: 'alert',
    activity: '2 plants below threshold',
  },
  {
    id: 'forecast',
    name: 'Forecast.AI',
    icon: 'analytics',
    color: '#06b6d4',
    status: 'active',
    activity: 'TSMC demand spike detected',
  },
  {
    id: 'cost',
    name: 'WorkingCap.AI',
    icon: 'payments',
    color: '#10b981',
    status: 'active',
    activity: '$109.7M excess identified',
  },
];

// ============================================
// AI ACTIONS (3 recent)
// ============================================
export const mockAIActions = [
  {
    id: 'action-001',
    agent: 'Stox.AI',
    action: 'Transfer 3 Etch Systems: Taiwan → Korea',
    impact: 'Prevent Samsung stockout',
    status: 'pending-approval',
    savings: 850000,
  },
  {
    id: 'action-002',
    agent: 'Logistics.AI',
    action: 'Expedite AIR-001 to priority freight',
    impact: 'Meet Samsung deadline',
    status: 'completed',
    savings: 125000,
  },
  {
    id: 'action-003',
    agent: 'WorkingCap.AI',
    action: 'Reduce Fremont safety stock by 15 units',
    impact: 'Release $675K working capital',
    status: 'completed',
    savings: 675000,
  },
];

// ============================================
// AUTOPILOT STATUS
// ============================================
export const mockAutopilotStatus = {
  mode: 'proposals-ready',
  pending_count: 1,
  actions_today: 3,
  cost_saved_week: 1650000,
  ai_confidence_avg: 91,
};

// ============================================
// SHIPMENT ROUTES
// ============================================
export const mockRoutes = {
  'SHP-001': [
    [37.3541, -121.9552],  // Applied Materials
    [37.4, -121.9],        // Current
    [37.5485, -121.9886],  // Fremont HQ
  ],
  'SHP-002': [
    [42.6584, -71.1374],   // MKS (origin)
    [45.2, -122.8],        // Current (delayed)
    [45.3841, -122.7642],  // Tualatin
  ],
  'AIR-001': [
    [37.5485, -121.9886],  // Fremont (origin)
    [45.0, -160.0],        // Over Pacific
    [37.1997, 127.0540],   // Korea
  ],
  'AIR-002': [
    [37.5485, -121.9886],  // Fremont (origin)
    [38.0, 170.0],         // Over Pacific
    [24.8047, 120.9714],   // Taiwan
  ],
  'SEA-001': [
    [37.5485, -121.9886],  // Fremont (origin)
    [42.0, -40.0],         // Atlantic
    [46.6103, 13.8558],    // Austria
  ],
};
