/**
 * STOX.AI Tile Data Configuration
 * Maps each tile to its data source (real, demo, or mixed)
 * Used for displaying data source indicators in tile headers
 */

// Data source types
export const DATA_SOURCE_TYPES = {
  REAL: 'real',
  DEMO: 'demo',
  MIXED: 'mixed',
};

// Data source display configuration
export const DATA_SOURCE_CONFIG = {
  real: {
    label: 'Live Data',
    color: '#10b981', // Green
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: 'CloudDone',
    description: 'Connected to production BigQuery data',
  },
  demo: {
    label: 'Demo Data',
    color: '#f59e0b', // Amber/Orange
    bgColor: 'rgba(245, 158, 11, 0.1)',
    icon: 'Science',
    description: 'Synthetic data for demonstration',
  },
  mixed: {
    label: 'Mixed Data',
    color: '#0078d4', // Azure Blue
    bgColor: 'rgba(0, 120, 212, 0.1)',
    icon: 'Sync',
    description: 'Combination of live and demo data',
  },
};

/**
 * Complete tile-to-BigQuery table mapping
 * Organized by layer for easy reference
 */
export const TILE_DATA_CONFIG = {
  // Layer 0: Command Center
  'command-center': {
    dataType: DATA_SOURCE_TYPES.MIXED,
    tables: ['sales_order_cockpit_export', 'stox_demo_exceptions'],
    apiEndpoint: '/exceptions',
    description: 'Command Center with real order data and demo exceptions',
  },

  // Layer 1: Foundation
  'plant-inventory-intelligence': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_plant_inventory'],
    apiEndpoint: '/working-capital',
    description: 'Plant-level inventory insights',
  },
  'sap-data-hub': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_data_connections'],
    apiEndpoint: null,
    description: 'SAP system connections status',
  },
  'cost-configuration': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_cost_config'],
    apiEndpoint: null,
    description: 'Cost configuration settings',
  },

  // Layer 2: Diagnostics
  'working-capital-baseline': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_inventory_wc_baseline'],
    apiEndpoint: '/working-capital',
    description: 'Working capital decomposition analysis',
  },
  'inventory-health-check': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_inventory_health'],
    apiEndpoint: '/inventory-health',
    description: 'Inventory health scores and risk levels',
  },
  'demand-intelligence': {
    dataType: DATA_SOURCE_TYPES.MIXED,
    tables: ['transaction_data', 'stox_demo_demand_patterns'],
    apiEndpoint: '/demand-patterns',
    description: 'Demand patterns and forecasting',
  },
  'supply-lead-time': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_supplier_lead_times'],
    apiEndpoint: '/lead-times',
    description: 'Supplier lead time analytics',
  },
  'inventory-heatmap': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_inventory_wc_baseline'],
    apiEndpoint: '/working-capital',
    description: 'Inventory distribution heatmap',
  },
  'aging-stock-intelligence': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_aging_stock'],
    apiEndpoint: '/inventory-health',
    description: 'Aging and obsolescence analysis',
  },
  'sell-through-analytics': {
    dataType: DATA_SOURCE_TYPES.REAL,
    tables: ['time_series_performance'],
    apiEndpoint: '/sell-through',
    description: 'Sell-through performance metrics',
  },

  // Layer 3: Prediction
  'forecasting-engine': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_forecasts'],
    apiEndpoint: '/forecasts',
    description: 'ML-based demand forecasting',
  },
  'sell-in-forecast': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_sell_in_forecast'],
    apiEndpoint: '/forecasts',
    description: 'Sell-in predictions',
  },
  'store-forecast': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_store_forecast'],
    apiEndpoint: '/forecasts',
    description: 'Store-level demand forecasts',
  },

  // Layer 4: Optimization
  'mrp-parameter-optimizer': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_mrp_parameters'],
    apiEndpoint: '/mrp-parameters',
    description: 'MRP parameter optimization',
  },
  'recommendations-hub': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_recommendations'],
    apiEndpoint: '/recommendations',
    description: 'Optimization recommendations',
  },
  'supplier-terms-impact': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_supplier_terms'],
    apiEndpoint: '/lead-times',
    description: 'Supplier terms impact analysis',
  },
  'reallocation-optimizer': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_reallocation'],
    apiEndpoint: '/recommendations',
    description: 'Stock reallocation opportunities',
  },
  'cost-policy-engine': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_cost_policy'],
    apiEndpoint: null,
    description: 'Cost policy configuration',
  },
  'dc-optimization': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_dc_optimization'],
    apiEndpoint: '/working-capital',
    description: 'Distribution center optimization',
  },
  'dc-lot-size': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_dc_lot_size'],
    apiEndpoint: '/mrp-parameters',
    description: 'DC lot size optimization',
  },
  'store-optimization': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_store_optimization'],
    apiEndpoint: '/working-capital',
    description: 'Store inventory optimization',
  },

  // Layer 5: Sandbox
  'what-if-simulator': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_scenarios'],
    apiEndpoint: null,
    description: 'What-if scenario simulation',
  },
  'scenario-planner': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_scenarios'],
    apiEndpoint: null,
    description: 'Scenario planning workspace',
  },
  'mrp-parameter-tuner': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_mrp_parameters'],
    apiEndpoint: '/mrp-parameters',
    description: 'MRP parameter fine-tuning',
  },

  // Layer 6: Execution
  'cfo-rollup-dashboard': {
    dataType: DATA_SOURCE_TYPES.REAL,
    tables: ['transaction_data'],
    apiEndpoint: '/cfo-rollup',
    description: 'CFO financial rollup',
  },
  'cash-release-timeline': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_cash_release'],
    apiEndpoint: '/cash-release',
    description: 'Cash release timeline',
  },
  'performance-monitor': {
    dataType: DATA_SOURCE_TYPES.REAL,
    tables: ['sales_order_cockpit_export'],
    apiEndpoint: '/kpis/performance',
    description: 'Performance KPIs monitoring',
  },
  'sap-writeback': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_writeback_queue'],
    apiEndpoint: null,
    description: 'SAP writeback queue',
  },
  'ticketing-system': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_tickets'],
    apiEndpoint: null,
    description: 'Issue ticketing system',
  },
  'shortage-detector': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_shortages'],
    apiEndpoint: '/shortage-detector/alerts',
    description: 'Shortage detection alerts',
  },
  'inbound-risk-monitor': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_inbound_risk'],
    apiEndpoint: '/inbound-risk/vendor-metrics',
    description: 'Inbound shipment risk',
  },
  'bom-explorer': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_bom'],
    apiEndpoint: null,
    description: 'Bill of materials explorer',
  },
  'component-consolidation': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_components'],
    apiEndpoint: null,
    description: 'Component consolidation',
  },
  'consignment-kit-process': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_consignment'],
    apiEndpoint: '/consignment-kit-process',
    description: 'Consignment kit tracking',
  },

  // DC Tiles
  'dc-health-monitor': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_dc_health'],
    apiEndpoint: '/inventory-health',
    description: 'DC health monitoring',
  },
  'dc-financial-impact': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_dc_financial'],
    apiEndpoint: '/working-capital',
    description: 'DC financial impact',
  },
  'dc-supplier-execution': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_dc_supplier'],
    apiEndpoint: '/lead-times',
    description: 'DC supplier execution',
  },
  'dc-demand-aggregation': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_dc_demand'],
    apiEndpoint: '/demand-patterns',
    description: 'DC demand aggregation',
  },
  'dc-bom': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_bom'],
    apiEndpoint: null,
    description: 'DC bill of materials',
  },

  // Store Tiles
  'store-health-monitor': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_store_health'],
    apiEndpoint: '/inventory-health',
    description: 'Store health monitoring',
  },
  'store-financial-impact': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_store_financial'],
    apiEndpoint: '/working-capital',
    description: 'Store financial impact',
  },
  'store-deployment': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_store_deployment'],
    apiEndpoint: null,
    description: 'Store deployment planning',
  },
  'store-replenishment': {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: ['stox_demo_store_replenishment'],
    apiEndpoint: '/recommendations',
    description: 'Store replenishment',
  },
};

/**
 * Get data source config for a tile
 * @param {string} tileId - The tile identifier (kebab-case)
 * @returns {Object} Tile data configuration
 */
export function getTileDataConfig(tileId) {
  return TILE_DATA_CONFIG[tileId] || {
    dataType: DATA_SOURCE_TYPES.DEMO,
    tables: [],
    apiEndpoint: null,
    description: 'Unknown tile',
  };
}

/**
 * Get display config for data source type
 * @param {string} dataType - 'real', 'demo', or 'mixed'
 * @returns {Object} Display configuration
 */
export function getDataSourceDisplay(dataType) {
  return DATA_SOURCE_CONFIG[dataType] || DATA_SOURCE_CONFIG.demo;
}

export default TILE_DATA_CONFIG;
