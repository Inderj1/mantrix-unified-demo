// Fulfillment Configuration Data for SKU Decisioning
// This file contains static data for plants, components, suppliers, and customers

// Loparex Plants with SAP plant codes
// NOTE: Plant names are placeholders - T001W (Plant Master) table not available in SAP extract
// Real plant names should come from SAP T001W table
export const plants = [
  {
    id: '7604',
    sapPlantCode: '7604',
    name: 'Plant 7604 (T001W Missing)',
    location: 'Unknown - Awaiting T001W',
    coordinates: { lat: 41.7595, lng: -87.9356 }, // Placeholder coordinates
    capacity: 'full', // full, limited, constrained
    capabilities: ['PET Film', 'PP Film', 'Kraft', 'Silicone Coating'],
    orderVolume: 28092, // From SAP VBAP
    // Outbound costs by region ($ per shipment) - varies significantly by distance
    outboundCosts: {
      midwest: 2800,
      southwest: 4500,
      west: 7200,
      northeast: 3900,
      southeast: 3200,
      default: 4500,
    },
  },
  {
    id: '7248',
    sapPlantCode: '7248',
    name: 'Plant 7248 (T001W Missing)',
    location: 'Unknown - Awaiting T001W',
    coordinates: { lat: 41.6611, lng: -91.5302 }, // Placeholder coordinates
    capacity: 'full',
    capabilities: ['PET Film', 'PP Film', 'Kraft'],
    orderVolume: 15751, // From SAP VBAP
    outboundCosts: {
      midwest: 2200,
      southwest: 5100,
      west: 6800,
      northeast: 4800,
      southeast: 4200,
      default: 5100,
    },
  },
  {
    id: '7401',
    sapPlantCode: '7401',
    name: 'Plant 7401 (T001W Missing)',
    location: 'Unknown - Awaiting T001W',
    coordinates: { lat: 41.5833, lng: -87.5 }, // Placeholder coordinates
    capacity: 'full',
    capabilities: ['PET Film', 'Silicone Coating', 'Release Liner'],
    orderVolume: 12041, // From SAP VBAP
    outboundCosts: {
      midwest: 3500,
      southwest: 6800,
      west: 9500,
      northeast: 3200,
      southeast: 4100,
      default: 6800,
    },
  },
  {
    id: '7289',
    sapPlantCode: '7289',
    name: 'Plant 7289 (T001W Missing)',
    location: 'Unknown - Awaiting T001W',
    coordinates: { lat: 41.8389, lng: -89.4795 }, // Placeholder coordinates
    capacity: 'full',
    capabilities: ['Kraft Paper', 'Release Liner'],
    orderVolume: 11075, // From SAP VBAP
    outboundCosts: {
      midwest: 2500,
      southwest: 5800,
      west: 8100,
      northeast: 4500,
      southeast: 3800,
      default: 5500,
    },
  },
  {
    id: '7450',
    sapPlantCode: '7450',
    name: 'Plant 7450 (T001W Missing)',
    location: 'Unknown - Awaiting T001W',
    coordinates: { lat: 41.7000, lng: -88.0000 }, // Placeholder coordinates
    capacity: 'limited',
    capabilities: ['PET Film', 'PP Film'],
    orderVolume: 6409, // From SAP VBAP
    outboundCosts: {
      midwest: 3100,
      southwest: 5500,
      west: 7800,
      northeast: 4200,
      southeast: 3500,
      default: 5500,
    },
  },
  {
    id: '7291',
    sapPlantCode: '7291',
    name: 'Plant 7291 (T001W Missing)',
    location: 'Unknown - Awaiting T001W',
    coordinates: { lat: 41.6500, lng: -87.8000 }, // Placeholder coordinates
    capacity: 'limited',
    capabilities: ['Release Liner', 'Silicone Coating'],
    orderVolume: 5710, // From SAP VBAP
    outboundCosts: {
      midwest: 3800,
      southwest: 7200,
      west: 10200,
      northeast: 3500,
      southeast: 4500,
      default: 7200,
    },
  },
  {
    id: '7293',
    sapPlantCode: '7293',
    name: 'Plant 7293 (T001W Missing)',
    location: 'Unknown - Awaiting T001W',
    coordinates: { lat: 41.6000, lng: -87.9000 }, // Placeholder coordinates
    capacity: 'constrained',
    capabilities: ['Specialty Products'],
    orderVolume: 292, // From SAP VBAP
    outboundCosts: {
      midwest: 4200,
      southwest: 8500,
      west: 12000,
      northeast: 3800,
      southeast: 5200,
      default: 8500,
    },
  },
];

// Customer Ship-To Locations (historic data from SAP)
export const customerShipToLocations = {
  '3M': {
    customerId: 'CUST-3M-001',
    customerName: '3M Industrial Adhesives',
    locations: [
      { id: 'austin', name: '3M Austin, TX', region: 'southwest', coordinates: { lat: 30.2672, lng: -97.7431 } },
      { id: 'stpaul', name: '3M St. Paul, MN', region: 'midwest', coordinates: { lat: 44.9537, lng: -93.09 } },
      { id: 'springfield', name: '3M Springfield, MO', region: 'midwest', coordinates: { lat: 37.2090, lng: -93.2923 } },
    ],
    defaultLocation: 'austin',
  },
  'Quanex': {
    customerId: 'CUST-QNX-001',
    customerName: 'Quanex Building Products',
    locations: [
      { id: 'houston', name: 'Quanex Houston, TX', region: 'southwest', coordinates: { lat: 29.7604, lng: -95.3698 } },
      { id: 'cambridge', name: 'Quanex Cambridge, OH', region: 'midwest', coordinates: { lat: 40.0312, lng: -81.5885 } },
    ],
    defaultLocation: 'houston',
  },
  'Shurtape': {
    customerId: 'CUST-SHR-001',
    customerName: 'Shurtape Technologies',
    locations: [
      { id: 'hickory', name: 'Shurtape Hickory, NC', region: 'southeast', coordinates: { lat: 35.7333, lng: -81.3414 } },
    ],
    defaultLocation: 'hickory',
  },
  'Royal Adhesives': {
    customerId: 'CUST-RAD-001',
    customerName: 'Royal Adhesives & Sealants',
    locations: [
      { id: 'south_bend', name: 'Royal South Bend, IN', region: 'midwest', coordinates: { lat: 41.6764, lng: -86.2520 } },
      { id: 'belleville', name: 'Royal Belleville, NJ', region: 'northeast', coordinates: { lat: 40.7935, lng: -74.1507 } },
    ],
    defaultLocation: 'south_bend',
  },
};

// Overrun Stock by Customer and Plant (using SAP plant codes)
export const overrunStock = {
  '3M': {
    '7604': { qty: 5000, unit: 'm²', material: 'RL-PP-BT-S-OPT1', age: '30 days' },
    '7248': null,
    '7401': { qty: 2500, unit: 'm²', material: 'RL-PET75-FP-S', age: '45 days' },
  },
  'Quanex': {
    '7604': null,
    '7248': { qty: 3200, unit: 'm²', material: 'RL-SIL50-P-S', age: '15 days' },
    '7401': null,
  },
  'Shurtape': {
    '7604': { qty: 8000, unit: 'm²', material: 'RL-PET75-FP-S', age: '60 days' },
    '7248': null,
    '7401': null,
  },
  'Royal Adhesives': {
    '7604': null,
    '7248': null,
    '7401': { qty: 1500, unit: 'm²', material: 'RL-KFT60-P-S', age: '20 days' },
  },
};

// BOM Components per Material/SKU
export const materialBOM = {
  'RL-PP-BT-S-OPT1': {
    name: 'PP Film Release Liner - Blue Tint Standard',
    components: [
      { id: 'pp-film', name: 'PP Base Film 50μ', qtyMultiplier: 1.05, unit: 'm²' },
      { id: 'silicone', name: 'Silicone Coating', qtyMultiplier: 0.015, unit: 'kg' },
      { id: 'release-agent', name: 'Release Agent', qtyMultiplier: 0.006, unit: 'kg' },
      { id: 'adhesion-promoter', name: 'Adhesion Promoter', qtyMultiplier: 0.003, unit: 'kg' },
      { id: 'core-tubes', name: 'Core Tubes 6"', qtyMultiplier: 0.003, unit: 'pcs' },
      { id: 'packaging', name: 'Packaging', qtyMultiplier: 1, unit: 'lot' },
    ],
  },
  'RL-SIL50-P-S': {
    name: 'Silicone Release Paper 50gsm',
    components: [
      { id: 'paper-base', name: 'Paper Base 50gsm', qtyMultiplier: 1.05, unit: 'm²' },
      { id: 'silicone', name: 'Silicone Coating', qtyMultiplier: 0.018, unit: 'kg' },
      { id: 'release-agent', name: 'Release Agent', qtyMultiplier: 0.005, unit: 'kg' },
      { id: 'core-tubes', name: 'Core Tubes 3"', qtyMultiplier: 0.005, unit: 'pcs' },
      { id: 'packaging', name: 'Packaging', qtyMultiplier: 1, unit: 'lot' },
    ],
  },
  'RL-KFT60-P-S': {
    name: 'Kraft Paper Release Liner 60gsm',
    components: [
      { id: 'kraft-paper', name: 'Kraft Paper 60gsm', qtyMultiplier: 1.05, unit: 'm²' },
      { id: 'pe-coating', name: 'PE Coating', qtyMultiplier: 0.012, unit: 'kg' },
      { id: 'release-agent', name: 'Release Agent', qtyMultiplier: 0.004, unit: 'kg' },
      { id: 'core-tubes', name: 'Core Tubes 6"', qtyMultiplier: 0.003, unit: 'pcs' },
      { id: 'packaging', name: 'Packaging', qtyMultiplier: 1, unit: 'lot' },
    ],
  },
  'RL-PET75-FP-S': {
    name: 'PET 75μm Fluoropolymer Release',
    components: [
      { id: 'pet-film', name: 'PET Base Film 75μ', qtyMultiplier: 1.05, unit: 'm²' },
      { id: 'fluoropolymer', name: 'Fluoropolymer Coating', qtyMultiplier: 0.008, unit: 'kg' },
      { id: 'primer', name: 'Primer Layer', qtyMultiplier: 0.003, unit: 'kg' },
      { id: 'core-tubes', name: 'Core Tubes 6"', qtyMultiplier: 0.003, unit: 'pcs' },
      { id: 'packaging', name: 'Packaging', qtyMultiplier: 1, unit: 'lot' },
    ],
  },
};

// Suppliers per Component with pricing and inbound costs
export const suppliers = {
  'pp-film': {
    suppliers: [
      {
        id: 'toray',
        name: 'Toray (Japan)',
        pricePerUnit: 0.79,
        leadTime: 21,
        recommended: true,
        inboundCost: { '7604': 4820, '7248': 5100, '7401': 5400, '7289': 4950 },
      },
      {
        id: 'skc',
        name: 'SKC (Korea)',
        pricePerUnit: 0.86,
        leadTime: 24,
        recommended: false,
        inboundCost: { '7604': 5200, '7248': 5500, '7401': 5800, '7289': 5350 },
      },
      {
        id: 'mitsubishi',
        name: 'Mitsubishi (Japan)',
        pricePerUnit: 0.82,
        leadTime: 21,
        recommended: false,
        inboundCost: { '7604': 4900, '7248': 5200, '7401': 5500, '7289': 5050 },
      },
    ],
  },
  'pet-film': {
    suppliers: [
      {
        id: 'toray',
        name: 'Toray (Japan)',
        pricePerUnit: 0.85,
        leadTime: 21,
        recommended: true,
        inboundCost: { '7604': 4820, '7248': 5100, '7401': 5400, '7289': 4950 },
      },
      {
        id: 'dupont',
        name: 'DuPont Teijin (US)',
        pricePerUnit: 0.92,
        leadTime: 7,
        recommended: false,
        inboundCost: { '7604': 1200, '7248': 1400, '7401': 1100, '7289': 1300 },
      },
    ],
  },
  'silicone': {
    suppliers: [
      {
        id: 'dow',
        name: 'Dow Corning (US)',
        pricePerUnit: 16.40,
        leadTime: 5,
        recommended: true,
        inboundCost: { '7604': 680, '7248': 720, '7401': 650, '7289': 700 },
      },
      {
        id: 'wacker',
        name: 'Wacker (Germany)',
        pricePerUnit: 15.80,
        leadTime: 18,
        recommended: false,
        inboundCost: { '7604': 2400, '7248': 2600, '7401': 2500, '7289': 2450 },
      },
      {
        id: 'momentive',
        name: 'Momentive (US)',
        pricePerUnit: 17.20,
        leadTime: 6,
        recommended: false,
        inboundCost: { '7604': 720, '7248': 780, '7401': 680, '7289': 740 },
      },
    ],
  },
  'release-agent': {
    suppliers: [
      {
        id: 'evonik',
        name: 'Evonik (US)',
        pricePerUnit: 18.00,
        leadTime: 4,
        recommended: true,
        inboundCost: { '7604': 320, '7248': 380, '7401': 300, '7289': 340 },
      },
      {
        id: 'shin-etsu',
        name: 'Shin-Etsu (Japan)',
        pricePerUnit: 17.50,
        leadTime: 25,
        recommended: false,
        inboundCost: { '7604': 1800, '7248': 1950, '7401': 1900, '7289': 1850 },
      },
    ],
  },
  'adhesion-promoter': {
    suppliers: [
      {
        id: 'basf',
        name: 'BASF (Germany)',
        pricePerUnit: 25.00,
        leadTime: 16,
        recommended: true,
        inboundCost: { '7604': 890, '7248': 950, '7401': 920, '7289': 900 },
      },
      {
        id: 'dow-chemical',
        name: 'Dow Chemical (US)',
        pricePerUnit: 26.50,
        leadTime: 5,
        recommended: false,
        inboundCost: { '7604': 450, '7248': 520, '7401': 420, '7289': 480 },
      },
    ],
  },
  'core-tubes': {
    suppliers: [
      {
        id: 'sonoco',
        name: 'Sonoco (US)',
        pricePerUnit: 7.50,
        leadTime: 3,
        recommended: true,
        inboundCost: { '7604': 180, '7248': 220, '7401': 160, '7289': 200 },
      },
      {
        id: 'greif',
        name: 'Greif (US)',
        pricePerUnit: 7.80,
        leadTime: 4,
        recommended: false,
        inboundCost: { '7604': 200, '7248': 240, '7401': 180, '7289': 220 },
      },
    ],
  },
  'packaging': {
    suppliers: [
      {
        id: 'stock',
        name: 'Stock - Local Plant',
        pricePerUnit: 1450,
        leadTime: 1,
        recommended: true,
        inboundCost: { '7604': 0, '7248': 0, '7401': 0, '7289': 0 },
      },
    ],
  },
  'paper-base': {
    suppliers: [
      {
        id: 'sappi',
        name: 'Sappi (US)',
        pricePerUnit: 0.42,
        leadTime: 7,
        recommended: true,
        inboundCost: { '7604': 1200, '7248': 1350, '7401': 1150, '7289': 1250 },
      },
    ],
  },
  'kraft-paper': {
    suppliers: [
      {
        id: 'westrock',
        name: 'WestRock (US)',
        pricePerUnit: 0.38,
        leadTime: 5,
        recommended: true,
        inboundCost: { '7604': 950, '7248': 1100, '7401': 900, '7289': 1000 },
      },
    ],
  },
  'pe-coating': {
    suppliers: [
      {
        id: 'lyondell',
        name: 'LyondellBasell (US)',
        pricePerUnit: 8.50,
        leadTime: 6,
        recommended: true,
        inboundCost: { '7604': 380, '7248': 450, '7401': 350, '7289': 400 },
      },
    ],
  },
  'fluoropolymer': {
    suppliers: [
      {
        id: 'chemours',
        name: 'Chemours (US)',
        pricePerUnit: 45.00,
        leadTime: 10,
        recommended: true,
        inboundCost: { '7604': 520, '7248': 580, '7401': 500, '7289': 540 },
      },
      {
        id: 'daikin',
        name: 'Daikin (Japan)',
        pricePerUnit: 42.00,
        leadTime: 28,
        recommended: false,
        inboundCost: { '7604': 2800, '7248': 3000, '7401': 2900, '7289': 2850 },
      },
    ],
  },
  'primer': {
    suppliers: [
      {
        id: '3m-industrial',
        name: '3M Industrial (US)',
        pricePerUnit: 32.00,
        leadTime: 4,
        recommended: true,
        inboundCost: { '7604': 280, '7248': 340, '7401': 260, '7289': 300 },
      },
    ],
  },
};

// Material SKU to Required Capabilities Mapping
// Maps each material type to the plant capabilities required to manufacture it
export const materialCapabilities = {
  // PP Film products require PP Film capability + Silicone Coating
  'RL-PP-BT-S-OPT1': ['PP Film', 'Silicone Coating'],
  'RL-PP-BT-S-OPT2': ['PP Film', 'Silicone Coating'],
  'RL-PP-BT-S-OPT3': ['PP Film', 'Silicone Coating'],
  'RL-PP-BT-S-OPT4': ['PP Film'],

  // Silicone Release Paper requires Silicone Coating
  'RL-SIL50-P-S': ['Silicone Coating'],
  'RL-SIL50-P-S-OPT1': ['Silicone Coating'],
  'RL-SIL50-P-S-OPT2': ['Silicone Coating'],

  // Kraft Paper products - basic paper capability
  'RL-KFT60-P-S': ['Kraft', 'Kraft Paper'],
  'RL-KFT60-P-S-OPT1': ['Kraft', 'Kraft Paper'],
  'RL-KFT60-P-S-OPT2': ['Kraft', 'Kraft Paper'],

  // PET Film products require PET Film capability
  'RL-PET75-FP-S': ['PET Film'],
  'RL-PET75-FP-S-OPT1': ['PET Film'],
  'RL-PET75-FP-S-OPT2': ['PET Film'],
};

// Helper to get required capabilities from material name/SKU (fuzzy matching)
export const getRequiredCapabilities = (materialSku) => {
  if (!materialSku) return [];

  // Direct match first
  if (materialCapabilities[materialSku]) {
    return materialCapabilities[materialSku];
  }

  // Fuzzy match based on material name patterns
  const skuUpper = materialSku.toUpperCase();

  if (skuUpper.includes('PP') && skuUpper.includes('FILM')) {
    return ['PP Film', 'Silicone Coating'];
  }
  if (skuUpper.includes('SIL') || skuUpper.includes('SILICONE')) {
    return ['Silicone Coating'];
  }
  if (skuUpper.includes('KFT') || skuUpper.includes('KRAFT')) {
    return ['Kraft', 'Kraft Paper'];
  }
  if (skuUpper.includes('PET')) {
    return ['PET Film'];
  }

  // Default: no specific capability required (all plants can handle)
  return [];
};

// Check if a plant can manufacture a material
export const canPlantManufacture = (plant, materialSku) => {
  const requiredCaps = getRequiredCapabilities(materialSku);

  // If no specific capabilities required, all plants can do it
  if (requiredCaps.length === 0) return true;

  // Check if plant has at least one of the required capabilities
  return requiredCaps.some(cap =>
    plant.capabilities.some(plantCap =>
      plantCap.toLowerCase().includes(cap.toLowerCase()) ||
      cap.toLowerCase().includes(plantCap.toLowerCase())
    )
  );
};

// Get plants filtered by capability AND ranked by proximity
export const getPlantsByCapabilityAndProximity = (shipToCoordinates, materialSku) => {
  // First, filter plants that can manufacture the material
  const capablePlants = plants.filter(plant => canPlantManufacture(plant, materialSku));

  // Then rank by proximity
  const rankedPlants = capablePlants
    .map((plant) => ({
      ...plant,
      distance: calculateDistance(plant.coordinates, shipToCoordinates),
      canManufacture: true,
    }))
    .sort((a, b) => a.distance - b.distance);

  // Also include incapable plants at the end (greyed out in UI)
  const incapablePlants = plants
    .filter(plant => !canPlantManufacture(plant, materialSku))
    .map((plant) => ({
      ...plant,
      distance: calculateDistance(plant.coordinates, shipToCoordinates),
      canManufacture: false,
      disabledReason: `Cannot manufacture ${materialSku} - missing required capability`,
    }));

  return [...rankedPlants, ...incapablePlants];
};

// Helper function to calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (coord1, coord2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Helper function to get plants ranked by proximity to a ship-to location
export const getPlantsByProximity = (shipToCoordinates) => {
  return plants
    .map((plant) => ({
      ...plant,
      distance: calculateDistance(plant.coordinates, shipToCoordinates),
    }))
    .sort((a, b) => a.distance - b.distance);
};

// Helper function to get outbound cost for a plant to a region
export const getOutboundCost = (plantId, region) => {
  const plant = plants.find((p) => p.id === plantId);
  if (!plant) return 0;
  return plant.outboundCosts[region] || plant.outboundCosts.default;
};

// Helper function to calculate component costs
export const calculateComponentCosts = (materialSku, orderQty, plantId, selectedSuppliers = {}) => {
  // Ensure orderQty is a valid number with fallback
  const validQty = typeof orderQty === 'number' && !isNaN(orderQty) && orderQty > 0 ? orderQty : 25000;

  // Find BOM or use first available as fallback
  let bom = materialBOM[materialSku];
  if (!bom) {
    // Try partial match (e.g., if SKU contains PET, PP, etc.)
    const bomKeys = Object.keys(materialBOM);
    const partialMatch = bomKeys.find((key) => {
      const keyParts = key.split('-');
      return keyParts.some((part) => materialSku?.includes(part));
    });
    bom = materialBOM[partialMatch] || materialBOM[bomKeys[0]];
  }
  if (!bom) return { components: [], totalMaterial: 0, totalInbound: 0 };

  const components = bom.components.map((comp) => {
    const supplierOptions = suppliers[comp.id]?.suppliers || [];
    const selectedSupplierId = selectedSuppliers[comp.id] || supplierOptions.find((s) => s.recommended)?.id;
    const supplier = supplierOptions.find((s) => s.id === selectedSupplierId) || supplierOptions[0];

    // Use validQty instead of orderQty to prevent NaN
    // Use Math.ceil and ensure minimum of 1 to avoid 0 quantities for small orders
    const qty = comp.unit === 'lot' ? 1 : Math.max(1, Math.ceil(validQty * comp.qtyMultiplier));
    const materialCost = supplier ? Math.round(qty * supplier.pricePerUnit) : 0;
    const inboundCost = supplier?.inboundCost?.[plantId] || 0;
    const leadTime = supplier?.leadTime || 7; // Default 7 days if not specified

    return {
      ...comp,
      qty,
      supplierOptions,
      selectedSupplier: supplier,
      materialCost,
      inboundCost,
      landedCost: materialCost + inboundCost,
      leadTime,
    };
  });

  const totalMaterial = components.reduce((sum, c) => sum + c.materialCost, 0);
  const totalInbound = components.reduce((sum, c) => sum + c.inboundCost, 0);

  // Calculate critical path (longest lead time component)
  const criticalPath = components.reduce((max, c) => c.leadTime > max.leadTime ? c : max, { leadTime: 0, name: 'N/A' });

  return { components, totalMaterial, totalInbound, criticalPath };
};

// Helper function to calculate total landed cost
export const calculateTotalLandedCost = (materialSku, orderQty, plantId, shipToRegion, selectedSuppliers = {}) => {
  const { components, totalMaterial, totalInbound, criticalPath } = calculateComponentCosts(
    materialSku,
    orderQty,
    plantId,
    selectedSuppliers
  );

  const acquisitionCost = totalMaterial + totalInbound;
  const outboundFreight = getOutboundCost(plantId, shipToRegion);
  const totalLanded = acquisitionCost + outboundFreight;

  return {
    components,
    totalMaterial,
    totalInbound,
    acquisitionCost,
    outboundFreight,
    totalLanded,
    criticalPath,
  };
};

export default {
  plants,
  customerShipToLocations,
  overrunStock,
  materialBOM,
  suppliers,
  materialCapabilities,
  calculateDistance,
  getPlantsByProximity,
  getPlantsByCapabilityAndProximity,
  getRequiredCapabilities,
  canPlantManufacture,
  getOutboundCost,
  calculateComponentCosts,
  calculateTotalLandedCost,
};
