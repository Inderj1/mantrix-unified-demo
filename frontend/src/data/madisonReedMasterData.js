// Madison Reed Master Data - Production Scenario Data
// Comprehensive product catalog, locations, BOMs, and business rules

export const madisonReedProducts = [
  // PERMANENT HAIR COLOR (30 SKUs) - Core Product Line
  { sku: 'MR-PC-001', name: 'Ravenna Brown 4N', category: 'Permanent Color', shade_family: 'Brown', shade_code: '4N', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-002', name: 'Amalfi Blonde 8N', category: 'Permanent Color', shade_family: 'Blonde', shade_code: '8N', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-003', name: 'Milan Espresso 2N', category: 'Permanent Color', shade_family: 'Black', shade_code: '2N', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-004', name: 'Florence Auburn 6RC', category: 'Permanent Color', shade_family: 'Red', shade_code: '6RC', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-005', name: 'Verona Red 5RR', category: 'Permanent Color', shade_family: 'Red', shade_code: '5RR', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-006', name: 'Siena Chestnut 5N', category: 'Permanent Color', shade_family: 'Brown', shade_code: '5N', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-007', name: 'Como Ash Brown 6NA', category: 'Permanent Color', shade_family: 'Brown', shade_code: '6NA', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-008', name: 'Positano Light Blonde 9N', category: 'Permanent Color', shade_family: 'Blonde', shade_code: '9N', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-009', name: 'Capri Golden Blonde 7G', category: 'Permanent Color', shade_family: 'Blonde', shade_code: '7G', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-010', name: 'Venice Dark Brown 3N', category: 'Permanent Color', shade_family: 'Brown', shade_code: '3N', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-011', name: 'Genoa Caramel Brown 6G', category: 'Permanent Color', shade_family: 'Brown', shade_code: '6G', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-012', name: 'Naples Copper 6R', category: 'Permanent Color', shade_family: 'Red', shade_code: '6R', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-013', name: 'Turin Medium Brown 5N', category: 'Permanent Color', shade_family: 'Brown', shade_code: '5N', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-014', name: 'Palermo Black 1N', category: 'Permanent Color', shade_family: 'Black', shade_code: '1N', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-015', name: 'Bologna Burgundy 4RV', category: 'Permanent Color', shade_family: 'Red', shade_code: '4RV', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-016', name: 'Pisa Honey Blonde 7N', category: 'Permanent Color', shade_family: 'Blonde', shade_code: '7N', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-017', name: 'Lucca Light Brown 6N', category: 'Permanent Color', shade_family: 'Brown', shade_code: '6N', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-018', name: 'Modena Mocha 5C', category: 'Permanent Color', shade_family: 'Brown', shade_code: '5C', price: 29.95, cogs: 12.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-019', name: 'Rimini Rose Gold 7RP', category: 'Permanent Color', shade_family: 'Blonde', shade_code: '7RP', price: 32.95, cogs: 13.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },
  { sku: 'MR-PC-020', name: 'Parma Platinum 10N', category: 'Permanent Color', shade_family: 'Blonde', shade_code: '10N', price: 32.95, cogs: 13.50, lead_time_days: 14, shelf_life_days: 365, moq: 500, case_pack: 12 },

  // ROOT TOUCH-UP (15 SKUs)
  { sku: 'MR-RT-001', name: 'Root Touch-Up Brown 4N', category: 'Root Touch-Up', shade_family: 'Brown', shade_code: '4N', price: 24.95, cogs: 10.00, lead_time_days: 10, shelf_life_days: 365, moq: 300, case_pack: 24 },
  { sku: 'MR-RT-002', name: 'Root Touch-Up Blonde 8N', category: 'Root Touch-Up', shade_family: 'Blonde', shade_code: '8N', price: 24.95, cogs: 10.00, lead_time_days: 10, shelf_life_days: 365, moq: 300, case_pack: 24 },
  { sku: 'MR-RT-003', name: 'Root Touch-Up Black 2N', category: 'Root Touch-Up', shade_family: 'Black', shade_code: '2N', price: 24.95, cogs: 10.00, lead_time_days: 10, shelf_life_days: 365, moq: 300, case_pack: 24 },
  { sku: 'MR-RT-004', name: 'Root Touch-Up Auburn 6RC', category: 'Root Touch-Up', shade_family: 'Red', shade_code: '6RC', price: 24.95, cogs: 10.00, lead_time_days: 10, shelf_life_days: 365, moq: 300, case_pack: 24 },
  { sku: 'MR-RT-005', name: 'Root Touch-Up Light Brown 6N', category: 'Root Touch-Up', shade_family: 'Brown', shade_code: '6N', price: 24.95, cogs: 10.00, lead_time_days: 10, shelf_life_days: 365, moq: 300, case_pack: 24 },

  // COLOR REVIVING GLOSS (20 SKUs)
  { sku: 'MR-CG-001', name: 'Reviving Gloss Chocolate', category: 'Color Gloss', shade_family: 'Brown', shade_code: 'CHOC', price: 19.95, cogs: 8.00, lead_time_days: 7, shelf_life_days: 730, moq: 200, case_pack: 36 },
  { sku: 'MR-CG-002', name: 'Reviving Gloss Golden Blonde', category: 'Color Gloss', shade_family: 'Blonde', shade_code: 'GOLD', price: 19.95, cogs: 8.00, lead_time_days: 7, shelf_life_days: 730, moq: 200, case_pack: 36 },
  { sku: 'MR-CG-003', name: 'Reviving Gloss Cherry', category: 'Color Gloss', shade_family: 'Red', shade_code: 'CHER', price: 19.95, cogs: 8.00, lead_time_days: 7, shelf_life_days: 730, moq: 200, case_pack: 36 },
  { sku: 'MR-CG-004', name: 'Reviving Gloss Ash Blonde', category: 'Color Gloss', shade_family: 'Blonde', shade_code: 'ASH', price: 19.95, cogs: 8.00, lead_time_days: 7, shelf_life_days: 730, moq: 200, case_pack: 36 },
  { sku: 'MR-CG-005', name: 'Reviving Gloss Espresso', category: 'Color Gloss', shade_family: 'Brown', shade_code: 'ESP', price: 19.95, cogs: 8.00, lead_time_days: 7, shelf_life_days: 730, moq: 200, case_pack: 36 },

  // HAIR CARE (15 SKUs)
  { sku: 'MR-HC-001', name: 'Color Protect Shampoo', category: 'Hair Care', subcategory: 'Shampoo', price: 18.95, cogs: 7.00, lead_time_days: 5, shelf_life_days: 730, moq: 500, case_pack: 12 },
  { sku: 'MR-HC-002', name: 'Color Protect Conditioner', category: 'Hair Care', subcategory: 'Conditioner', price: 18.95, cogs: 7.00, lead_time_days: 5, shelf_life_days: 730, moq: 500, case_pack: 12 },
  { sku: 'MR-HC-003', name: 'Shine Therapy Serum', category: 'Hair Care', subcategory: 'Treatment', price: 24.95, cogs: 9.50, lead_time_days: 5, shelf_life_days: 730, moq: 300, case_pack: 12 },
  { sku: 'MR-HC-004', name: 'Volume Boost Shampoo', category: 'Hair Care', subcategory: 'Shampoo', price: 18.95, cogs: 7.00, lead_time_days: 5, shelf_life_days: 730, moq: 500, case_pack: 12 },
  { sku: 'MR-HC-005', name: 'Deep Repair Mask', category: 'Hair Care', subcategory: 'Treatment', price: 26.95, cogs: 10.00, lead_time_days: 5, shelf_life_days: 730, moq: 300, case_pack: 12 },

  // ACCESSORIES & KITS (10 SKUs)
  { sku: 'MR-AC-001', name: 'Color Application Kit', category: 'Accessories', price: 9.95, cogs: 3.50, lead_time_days: 3, shelf_life_days: 1095, moq: 1000, case_pack: 50 },
  { sku: 'MR-AC-002', name: 'Deluxe Starter Bundle', category: 'Kit', price: 79.95, cogs: 35.00, lead_time_days: 14, shelf_life_days: 365, moq: 100, case_pack: 6 },
  { sku: 'MR-AC-003', name: 'Professional Brush Set', category: 'Accessories', price: 14.95, cogs: 5.00, lead_time_days: 7, shelf_life_days: 1095, moq: 500, case_pack: 24 },
];

export const madisonReedLocations = {
  // MADISON REED OWNED STORES (25 locations)
  stores: [
    { id: 'MR-STORE-001', name: 'Madison Reed Flagship NYC', city: 'New York', state: 'NY', type: 'Flagship', capacity: 200 },
    { id: 'MR-STORE-002', name: 'Madison Reed LA', city: 'Los Angeles', state: 'CA', type: 'Standard', capacity: 150 },
    { id: 'MR-STORE-003', name: 'Madison Reed SF', city: 'San Francisco', state: 'CA', type: 'Standard', capacity: 150 },
    { id: 'MR-STORE-004', name: 'Madison Reed Chicago', city: 'Chicago', state: 'IL', type: 'Standard', capacity: 150 },
    { id: 'MR-STORE-005', name: 'Madison Reed Boston', city: 'Boston', state: 'MA', type: 'Standard', capacity: 120 },
    { id: 'MR-STORE-006', name: 'Madison Reed Miami', city: 'Miami', state: 'FL', type: 'Standard', capacity: 130 },
    { id: 'MR-STORE-007', name: 'Madison Reed Seattle', city: 'Seattle', state: 'WA', type: 'Standard', capacity: 140 },
    { id: 'MR-STORE-008', name: 'Madison Reed Austin', city: 'Austin', state: 'TX', type: 'Standard', capacity: 120 },
    { id: 'MR-STORE-009', name: 'Madison Reed Denver', city: 'Denver', state: 'CO', type: 'Standard', capacity: 110 },
    { id: 'MR-STORE-010', name: 'Madison Reed Portland', city: 'Portland', state: 'OR', type: 'Standard', capacity: 100 },
  ],

  // RETAIL PARTNERS (Distribution Centers)
  partners: [
    { id: 'ULTA-DC-001', name: 'ULTA Beauty DC - Dallas', city: 'Dallas', state: 'TX', channel: 'Retail Partner', edi_enabled: true, lead_time: 3, min_order: 5000 },
    { id: 'ULTA-DC-002', name: 'ULTA Beauty DC - Chicago', city: 'Chicago', state: 'IL', channel: 'Retail Partner', edi_enabled: true, lead_time: 3, min_order: 5000 },
    { id: 'SEPHORA-DC-001', name: 'Sephora DC - Memphis', city: 'Memphis', state: 'TN', channel: 'Retail Partner', edi_enabled: true, lead_time: 4, min_order: 8000 },
    { id: 'SEPHORA-DC-002', name: 'Sephora DC - Phoenix', city: 'Phoenix', state: 'AZ', channel: 'Retail Partner', edi_enabled: true, lead_time: 4, min_order: 8000 },
    { id: 'TARGET-DC-001', name: 'Target DC - Minneapolis', city: 'Minneapolis', state: 'MN', channel: 'Retail Partner', edi_enabled: true, lead_time: 5, min_order: 10000 },
    { id: 'WALMART-DC-001', name: 'Walmart DC - Bentonville', city: 'Bentonville', state: 'AR', channel: 'Retail Partner', edi_enabled: true, lead_time: 5, min_order: 15000 },
    { id: 'AMAZON-FC-001', name: 'Amazon FC - Phoenix', city: 'Phoenix', state: 'AZ', channel: 'E-Commerce Partner', edi_enabled: true, lead_time: 2, min_order: 3000 },
    { id: 'AMAZON-FC-002', name: 'Amazon FC - Newark', city: 'Newark', state: 'NJ', channel: 'E-Commerce Partner', edi_enabled: true, lead_time: 2, min_order: 3000 },
  ],

  // MADISON REED DISTRIBUTION CENTERS
  distributionCenters: [
    { id: 'MR-DC-001', name: 'Madison Reed Main DC', city: 'Oakland', state: 'CA', capacity: 50000, layout: 'Multi-Level' },
    { id: 'MR-DC-002', name: 'Madison Reed East Coast DC', city: 'Newark', state: 'NJ', capacity: 30000, layout: 'Single-Level' },
  ],

  // MANUFACTURING PLANTS
  plants: [
    { id: 'MR-PLANT-001', name: 'Madison Reed Manufacturing - Italy', city: 'Milan', country: 'Italy', type: 'Co-Manufacturer', capacity: 100000 },
    { id: 'MR-PLANT-002', name: 'Madison Reed Manufacturing - USA', city: 'Oakland', state: 'CA', country: 'USA', type: 'In-House', capacity: 50000 },
  ]
};

// BOM (Bill of Materials) - Components for each finished good
export const madisonReedBOMs = {
  'MR-PC-001': [
    { component_id: 'COMP-BASE-001', description: 'Ammonia-Free Color Base - Brown', qty: 1, unit: 'EA', lead_time: 30, supplier: 'ChemCo Italy', unit_cost: 4.50 },
    { component_id: 'COMP-DEV-001', description: 'Cream Developer 20vol', qty: 1, unit: 'EA', lead_time: 30, supplier: 'ChemCo Italy', unit_cost: 2.00 },
    { component_id: 'COMP-PKG-001', description: 'Premium Kit Packaging', qty: 1, unit: 'EA', lead_time: 14, supplier: 'PackPro USA', unit_cost: 3.00 },
    { component_id: 'COMP-GLOVE-001', description: 'Application Gloves', qty: 1, unit: 'PR', lead_time: 7, supplier: 'SafetyFirst USA', unit_cost: 0.50 },
    { component_id: 'COMP-BRUSH-001', description: 'Color Brush Professional', qty: 1, unit: 'EA', lead_time: 14, supplier: 'BeautyTools China', unit_cost: 1.50 },
    { component_id: 'COMP-INST-001', description: 'Instruction Card', qty: 1, unit: 'EA', lead_time: 7, supplier: 'PrintCo USA', unit_cost: 0.20 },
  ],
  'MR-PC-002': [
    { component_id: 'COMP-BASE-002', description: 'Ammonia-Free Color Base - Blonde', qty: 1, unit: 'EA', lead_time: 30, supplier: 'ChemCo Italy', unit_cost: 4.50 },
    { component_id: 'COMP-DEV-001', description: 'Cream Developer 20vol', qty: 1, unit: 'EA', lead_time: 30, supplier: 'ChemCo Italy', unit_cost: 2.00 },
    { component_id: 'COMP-PKG-001', description: 'Premium Kit Packaging', qty: 1, unit: 'EA', lead_time: 14, supplier: 'PackPro USA', unit_cost: 3.00 },
    { component_id: 'COMP-GLOVE-001', description: 'Application Gloves', qty: 1, unit: 'PR', lead_time: 7, supplier: 'SafetyFirst USA', unit_cost: 0.50 },
    { component_id: 'COMP-BRUSH-001', description: 'Color Brush Professional', qty: 1, unit: 'EA', lead_time: 14, supplier: 'BeautyTools China', unit_cost: 1.50 },
    { component_id: 'COMP-INST-001', description: 'Instruction Card', qty: 1, unit: 'EA', lead_time: 7, supplier: 'PrintCo USA', unit_cost: 0.20 },
  ],
  // ... Similar BOMs for all other SKUs (abbreviated for brevity)
};

// Suppliers
export const suppliers = [
  { id: 'SUP-001', name: 'ChemCo Italy SpA', city: 'Milan', state: 'MI', country: 'Italy', category: 'Raw Materials', lead_time: 30, lead_time_days: 30, quality_rating: 98, on_time_delivery: 95, delivery_performance: 95, payment_terms: 'Net 60', contact: 'italy@chemco.com' },
  { id: 'SUP-002', name: 'PackPro Packaging Inc', city: 'Atlanta', state: 'GA', country: 'USA', category: 'Packaging', lead_time: 14, lead_time_days: 14, quality_rating: 96, on_time_delivery: 98, delivery_performance: 98, payment_terms: 'Net 30', contact: 'orders@packpro.com' },
  { id: 'SUP-003', name: 'SafetyFirst Manufacturing', city: 'Chicago', state: 'IL', country: 'USA', category: 'Accessories', lead_time: 7, lead_time_days: 7, quality_rating: 97, on_time_delivery: 99, delivery_performance: 99, payment_terms: 'Net 30', contact: 'safety@sfirst.com' },
  { id: 'SUP-004', name: 'BeautyTools Co Ltd', city: 'Shenzhen', state: 'GD', country: 'China', category: 'Tools', lead_time: 45, lead_time_days: 45, quality_rating: 94, on_time_delivery: 92, delivery_performance: 92, payment_terms: 'LC', contact: 'export@beautytools.cn' },
  { id: 'SUP-005', name: 'PrintCo Graphics', city: 'Portland', state: 'OR', country: 'USA', category: 'Print Materials', lead_time: 7, lead_time_days: 7, quality_rating: 95, on_time_delivery: 97, delivery_performance: 97, payment_terms: 'Net 15', contact: 'print@printco.com' },
];

// Business Scenarios
export const businessScenarios = {
  holidayRush: {
    name: 'Q4 Holiday Rush',
    period: 'Nov-Dec',
    demandMultiplier: 1.4,
    affectedSKUs: ['MR-PC-001', 'MR-PC-002', 'MR-PC-019', 'MR-CG-001', 'MR-CG-002'],
    description: '40% spike in top-selling shades during holiday season',
  },
  newShadeLaunch: {
    name: 'Rosewood Mauve Launch',
    sku: 'MR-PC-031',
    week1Demand: 500,
    week2Demand: 1200,
    week3Demand: 2000,
    week4Demand: 1800,
    description: 'New trending shade with influencer campaign',
  },
  partnerPromo: {
    name: 'ULTA BOGO Promotion',
    partner: 'ULTA',
    demandMultiplier: 3.0,
    duration: '1 week',
    affectedSKUs: ['MR-PC-001', 'MR-PC-002', 'MR-PC-006'],
    description: 'Unplanned 3x demand spike during partner promotion',
  },
  qualityIssue: {
    name: 'Batch Recall - Siena Chestnut',
    sku: 'MR-PC-006',
    recallQty: 2500,
    affectedLocations: ['MR-DC-001', 'ULTA-DC-001', 'SEPHORA-DC-001'],
    description: 'Quality hold and recall on specific batch',
  },
  subscriptionGrowth: {
    name: 'Subscription Model Expansion',
    currentPct: 15,
    targetPct: 25,
    reservedInventoryPct: 20,
    description: 'Growing subscription base requiring reserved inventory',
  },
  seasonalShift: {
    summer: {
      permanentColorMultiplier: 0.8,
      glossMultiplier: 1.3,
      description: 'Lower color demand, higher gloss demand in summer',
    },
    winter: {
      permanentColorMultiplier: 1.15,
      glossMultiplier: 0.9,
      description: 'Higher color demand, lower gloss demand in winter',
    },
  },
};

export default {
  madisonReedProducts,
  madisonReedLocations,
  madisonReedBOMs,
  suppliers,
  businessScenarios,
};
