/**
 * Arizona Beverages Master Data
 * Based on exact BigQuery data from arizona-poc.copa_export_copa_data_000000000000
 *
 * This file contains all Arizona Beverages products, plants, customers, and related data
 * for use across STOX, MARGEN, ORDLY, and other modules.
 */

// ============================================================================
// PRODUCTS - From BigQuery dataset_25m_table and stox_demo_inventory_health
// ============================================================================

export const products = [
  // Flagship Products
  { id: '1003608', sku: 'AZ-GT-001', name: 'AZ GREEN TEA $1 24PK 20OZ TALLBOY', category: '24PET20', unitPrice: 24.99, casePrice: 24.99, cogs: 8.50 },
  { id: '1104095', sku: 'AZ-AP-001', name: 'AZ ARNOLD PALMER BLACK 4PK GALLON PECO', category: '04PPL128', unitPrice: 19.99, casePrice: 19.99, cogs: 6.80 },
  { id: '1001420', sku: 'AZ-LT-001', name: 'AZ LEMON TEA NP 24PK 22OZ CAN', category: '24CAN23NP', unitPrice: 22.99, casePrice: 22.99, cogs: 7.20 },
  { id: '1003600', sku: 'AZ-LT-002', name: 'AZ LEMON TEA $1 24PK 20OZ TALLBOY', category: '24PET20', unitPrice: 24.99, casePrice: 24.99, cogs: 8.50 },
  { id: '1004022', sku: 'AZ-MM-001', name: 'AZ MUCHO MANGO 4PK GALLON', category: '04PPL128', unitPrice: 19.99, casePrice: 19.99, cogs: 6.80 },

  // Tea Products
  { id: '1001763', sku: 'AZ-GT-002', name: 'AZ GREEN TEA 12PK 11.5OZ CAN SLEEK', category: '12CAN11.5', unitPrice: 12.99, casePrice: 12.99, cogs: 4.20 },
  { id: '1100919', sku: 'AZ-SL-001', name: 'AZ STRAWBRY LEMONADE 24PK 15OZ CAN PECO', category: '24CAN15', unitPrice: 21.99, casePrice: 21.99, cogs: 7.00 },
  { id: '1104322', sku: 'AZ-LT-003', name: 'AZ LEMON TEA 12PK 34OZ PET PECO', category: '12PET34', unitPrice: 18.99, casePrice: 18.99, cogs: 6.20 },
  { id: '1002551', sku: 'AZ-LT-004', name: 'AZ LEMON TEA NP 12PK 22OZ CAN', category: '12CAN22', unitPrice: 14.99, casePrice: 14.99, cogs: 4.80 },

  // Arnold Palmer Products
  { id: '1107380', sku: 'AZ-AP-002', name: 'AZ AP BLACK 12PK 22OZ CAN CUBE PECO', category: '12CAN23QB', unitPrice: 16.99, casePrice: 16.99, cogs: 5.50 },
  { id: '1104722', sku: 'AZ-MG-001', name: 'AZ MANGO NP 4/6PK 20OZ TALLBOY PECO', category: '24PET20NP', unitPrice: 24.99, casePrice: 24.99, cogs: 8.00 },

  // Fruit Punch & Specialty
  { id: '1101758', sku: 'AZ-FP-001', name: 'AZ FRUIT PUNCH 12PK 11OZ CAN SUITCS PECO', category: '12CAN11.5', unitPrice: 12.99, casePrice: 12.99, cogs: 4.20 },
  { id: '1008641', sku: 'AZ-FS-001', name: 'AZ FRUIT SNACKS GREEN TEA 10-10PK 0.9OZ', category: '10PAC0.9', unitPrice: 14.99, casePrice: 14.99, cogs: 5.00 },

  // Hard Beverages
  { id: '1001581', sku: 'AZ-HV-001', name: 'AZ HARD VARIETY 2-12PK 12OZ CAN 6/3/3', category: '24SLK12', unitPrice: 29.99, casePrice: 29.99, cogs: 12.00 },
  { id: '1001594', sku: 'AZ-HL-001', name: 'AZ HARD LEMON TEA UTAH 12PK 22OZ CAN', category: '12CAN22', unitPrice: 24.99, casePrice: 24.99, cogs: 10.00 },

  // Premium Products
  { id: '1002322', sku: 'AZ-MV-001', name: 'AZ MARVEL LXR LEMON LIME 12PK 28OZ PET', category: '12PET28', unitPrice: 21.99, casePrice: 21.99, cogs: 8.50 },
];

// ============================================================================
// PLANTS / MANUFACTURING FACILITIES - From BigQuery dataset_25m_table
// ============================================================================

export const plants = [
  // Primary Arizona Facilities
  { id: 'ARIZONA_KEASBEY', name: 'ARIZONA KEASBEY DISTRO CENTER', city: 'KEASBEY', state: 'NJ', region: 'Northeast', type: 'Distribution', lat: 40.5207, lng: -74.2932 },
  { id: 'US_BEVERAGE_PACKERS', name: 'US BEVERAGE PACKERS', city: 'KEASBEY', state: 'NJ', region: 'Northeast', type: 'Manufacturing', lat: 40.5207, lng: -74.2932 },
  { id: 'MAPLEWOOD_NJ', name: 'MAPLEWOOD BEVERAGE SERVICES', city: 'KEASBEY', state: 'NJ', region: 'Northeast', type: 'Manufacturing', lat: 40.5207, lng: -74.2932 },
  { id: 'ARIZONA_SERVICES', name: 'ARIZONA BEVERAGES SERVICES', city: 'WOODBURY', state: 'NY', region: 'Northeast', type: 'Corporate', lat: 40.8215, lng: -73.4579 },

  // West Coast Operations
  { id: 'DRINKPAK_CA', name: 'DRINKPAK LLC', city: 'SANTA CLARITA', state: 'CA', region: 'West', type: 'Manufacturing', lat: 34.3917, lng: -118.5426 },
  { id: 'SWORX_CA', name: 'SWORX CA', city: 'SANTA CLARITA', state: 'CA', region: 'West', type: 'Manufacturing', lat: 34.3917, lng: -118.5426 },
  { id: 'NIAGARA_CA', name: 'NIAGARA BOTTLING, CA', city: 'RIALTO', state: 'CA', region: 'West', type: 'Manufacturing', lat: 34.1064, lng: -117.3703 },
  { id: 'SADDLE_CREEK_CA', name: 'SADDLE CREEK CA', city: 'Redland', state: 'CA', region: 'West', type: 'Warehouse', lat: 34.0556, lng: -117.1825 },
  { id: 'REFRESCO_WA', name: 'REFRESCO WA', city: 'SEATTLE', state: 'WA', region: 'West', type: 'Manufacturing', lat: 47.6062, lng: -122.3321 },

  // Central Operations
  { id: 'TAMPICO_TX', name: 'TAMPICO TX', city: 'WHARTON', state: 'TX', region: 'Central', type: 'Manufacturing', lat: 29.3116, lng: -96.1025 },
  { id: 'REFRESCO_OK', name: 'REFRESCO BEV. INC. US, OK', city: 'FORT GIBSON', state: 'OK', region: 'Central', type: 'Manufacturing', lat: 35.7998, lng: -95.2508 },

  // Southeast Operations
  { id: 'POLAR_GA', name: 'POLAR BEVERAGES, DOUGLAS', city: 'DOUGLAS', state: 'GA', region: 'Southeast', type: 'Manufacturing', lat: 31.5085, lng: -82.8496 },
  { id: 'MAXPAK_FL', name: 'MAXPAK', city: 'LAKELAND', state: 'FL', region: 'Southeast', type: 'Manufacturing', lat: 28.0395, lng: -81.9498 },
  { id: 'CAROLINA_NC', name: 'CAROLINA BEVERAGE', city: 'Mooresville', state: 'NC', region: 'Southeast', type: 'Manufacturing', lat: 35.5849, lng: -80.8101 },

  // Northeast Additional
  { id: 'KNOUSE_PA', name: 'KNOUSE FOODS, ORRTANNA', city: 'ORRTANNA', state: 'PA', region: 'Northeast', type: 'Manufacturing', lat: 39.8645, lng: -77.3569 },
  { id: 'KNOUSE_OR', name: 'KNOUSE OR', city: 'PORTLAND', state: 'OR', region: 'West', type: 'Manufacturing', lat: 45.5152, lng: -122.6784 },
  { id: 'FX_MATTS_NY', name: 'FX MATTS BREWING CO.', city: 'UTICA', state: 'NY', region: 'Northeast', type: 'Manufacturing', lat: 43.1009, lng: -75.2327 },

  // International
  { id: 'ARIZONA_MX', name: 'ARIZONA MX', city: 'Mexico City', state: 'MX', region: 'International', type: 'Manufacturing', lat: 19.4326, lng: -99.1332 },
  { id: 'CANADIAN_BEV', name: 'CANADIAN BEVERAGE CO-PACKING', city: 'MISSISSAUGA', state: 'ON', region: 'Canada', type: 'Manufacturing', lat: 43.5890, lng: -79.6441 },
];

// ============================================================================
// CUSTOMERS / RETAILERS - From BigQuery dataset_25m_table Sold_to_Name
// ============================================================================

export const customers = [
  // Major Retailers
  { id: 'WALMART', name: 'WALMART', type: 'Mass Retail', region: 'National' },
  { id: 'COSTCO_TRACY', name: 'COSTCO DEPOT TRACY', type: 'Club', region: 'West' },
  { id: 'SAMS_CLUB', name: "SAM'S CLUB #6434", type: 'Club', region: 'National' },
  { id: 'PUBLIX_MCCALLA', name: 'PUBLIX WAREHOUSE MCCALLA (GROCERY)', type: 'Grocery', region: 'Southeast' },
  { id: 'PUBLIX_JAX', name: 'PUBLIX JACKSONVILLE WAREHOUSE', type: 'Grocery', region: 'Southeast' },
  { id: 'WINCO', name: 'WINCO FOODS #132', type: 'Grocery', region: 'West' },
  { id: 'WALGREENS', name: 'WALGREENS WOODLAND', type: 'Drug/Convenience', region: 'National' },
  { id: 'BIG_LOTS', name: 'BIG LOTS (CHAPTER 11)', type: 'Discount', region: 'National' },
  { id: 'WOODMANS', name: 'WOODMANS STORE #15', type: 'Grocery', region: 'Midwest' },

  // E-commerce
  { id: 'AMAZON_CMH2', name: 'AMAZON - CMH2', type: 'E-commerce', region: 'Midwest' },
  { id: 'AMAZON_RFD2', name: 'AMAZON - RFD2', type: 'E-commerce', region: 'Midwest' },

  // Distributors
  { id: 'ARIZONA_KEASBEY_DC', name: 'ARIZONA KEASBEY DISTRO CENTER', type: 'Distribution', region: 'Northeast' },
  { id: 'HORNELL_DC', name: 'HORNELL EDISON DISTRO CENTER', type: 'Distribution', region: 'Northeast' },
  { id: 'MAINE_DIST', name: 'MAINE DISTRIBUTORS', type: 'Distribution', region: 'Northeast' },
  { id: 'NEVADA_BEV', name: 'NEVADA BEVERAGE CO', type: 'Distribution', region: 'West' },
  { id: 'ATLANTA_BEV', name: 'ATLANTA BEVERAGE COMPANY', type: 'Distribution', region: 'Southeast' },
  { id: 'SENTMAN', name: 'SENTMAN DISTRIBUTORS, INC.', type: 'Distribution', region: 'Midwest' },
  { id: 'LEHIGH', name: 'LEHIGH WHOLESALE', type: 'Distribution', region: 'Northeast' },
  { id: 'FARRELL', name: 'FARRELL DISTRIBUTING CORPORATION', type: 'Distribution', region: 'Northeast' },
  { id: 'BALKAN', name: 'BALKAN BEVERAGE', type: 'Distribution', region: 'Northeast' },
  { id: 'BALKAN_ELMIRA', name: 'BALKAN BEVERAGE / ELMIRA', type: 'Distribution', region: 'Northeast' },
  { id: 'STOKES', name: 'STOKES DISTRIBUTING DBA GREY EAGLE', type: 'Distribution', region: 'Central' },
  { id: 'MERCHANTS', name: 'MERCHANTS DISTRIBUTORS INC.', type: 'Distribution', region: 'Southeast' },

  // Foodservice
  { id: 'SYSCO_CIN', name: 'SYSCO CINCINNATI', type: 'Foodservice', region: 'Midwest' },
  { id: 'SYSCO_CLE', name: 'SYSCO CLEVELAND', type: 'Foodservice', region: 'Midwest' },
  { id: 'US_FOODS', name: 'US FOODS SWEDESBORO', type: 'Foodservice', region: 'Northeast' },
  { id: 'MCLANE', name: 'MCLANE GLOBAL INTERNATIONAL, LP', type: 'Foodservice', region: 'National' },

  // Specialty
  { id: 'AL_GEORGE', name: 'A.L. GEORGE', type: 'Specialty', region: 'Regional' },
  { id: 'COHEN', name: 'COHEN FOODS', type: 'Specialty', region: 'Regional' },
  { id: 'LANGER', name: 'LANGER JUICE COMPANY, INC.', type: 'Co-packer', region: 'West' },

  // International
  { id: 'COMERCIALIZADORA', name: 'COMERCIALIZADORA ELORO', type: 'International', region: 'Mexico' },
  { id: 'PIETERSZ', name: 'PIETERSZ IMPORT & CO', type: 'International', region: 'Caribbean' },
];

// ============================================================================
// CATEGORIES - Product categories from BigQuery
// ============================================================================

export const categories = [
  { id: '24PET20', name: '24-Pack 20oz Tallboy PET', volume: 480, unit: 'oz' },
  { id: '24PET20NP', name: '24-Pack 20oz Non-Priced Tallboy', volume: 480, unit: 'oz' },
  { id: '24CAN23NP', name: '24-Pack 22oz Can Non-Priced', volume: 528, unit: 'oz' },
  { id: '24CAN15', name: '24-Pack 15oz Can', volume: 360, unit: 'oz' },
  { id: '12CAN22', name: '12-Pack 22oz Can', volume: 264, unit: 'oz' },
  { id: '12CAN23QB', name: '12-Pack 22oz Can Cube', volume: 264, unit: 'oz' },
  { id: '12CAN11.5', name: '12-Pack 11.5oz Sleek Can', volume: 138, unit: 'oz' },
  { id: '12PET34', name: '12-Pack 34oz PET', volume: 408, unit: 'oz' },
  { id: '12PET28', name: '12-Pack 28oz PET', volume: 336, unit: 'oz' },
  { id: '04PPL128', name: '4-Pack Gallon', volume: 512, unit: 'oz' },
  { id: '24SLK12', name: '24-Pack 12oz Sleek Can', volume: 288, unit: 'oz' },
  { id: '10PAC0.9', name: '10-Pack Fruit Snacks', volume: 9, unit: 'oz' },
];

// ============================================================================
// BILL OF MATERIALS (BOM) - Beverage components
// ============================================================================

export const bomComponents = [
  // Concentrates & Bases
  { id: 'COMP-TEA-001', name: 'Green Tea Concentrate Base', category: 'Concentrate', unit: 'gal', costPerUnit: 12.50, supplier: 'Arizona Tea Extracts' },
  { id: 'COMP-TEA-002', name: 'Black Tea Concentrate Base', category: 'Concentrate', unit: 'gal', costPerUnit: 11.80, supplier: 'Arizona Tea Extracts' },
  { id: 'COMP-TEA-003', name: 'Lemon Tea Concentrate', category: 'Concentrate', unit: 'gal', costPerUnit: 13.20, supplier: 'Arizona Tea Extracts' },
  { id: 'COMP-LEM-001', name: 'Lemonade Base Concentrate', category: 'Concentrate', unit: 'gal', costPerUnit: 9.50, supplier: 'Citrus Solutions Inc' },
  { id: 'COMP-MNG-001', name: 'Mango Puree Concentrate', category: 'Concentrate', unit: 'gal', costPerUnit: 15.00, supplier: 'Tropical Flavors LLC' },

  // Sweeteners
  { id: 'COMP-SWT-001', name: 'High Fructose Corn Syrup 55', category: 'Sweetener', unit: 'lb', costPerUnit: 0.32, supplier: 'ADM Sweeteners' },
  { id: 'COMP-SWT-002', name: 'Cane Sugar Liquid', category: 'Sweetener', unit: 'lb', costPerUnit: 0.45, supplier: 'US Sugar Corp' },
  { id: 'COMP-SWT-003', name: 'Honey Blend', category: 'Sweetener', unit: 'lb', costPerUnit: 2.80, supplier: 'Golden Honey Co' },

  // Additives
  { id: 'COMP-ADD-001', name: 'Citric Acid', category: 'Additive', unit: 'lb', costPerUnit: 1.20, supplier: 'Jungbunzlauer' },
  { id: 'COMP-ADD-002', name: 'Ascorbic Acid (Vitamin C)', category: 'Additive', unit: 'lb', costPerUnit: 8.50, supplier: 'DSM Nutritional' },
  { id: 'COMP-ADD-003', name: 'Natural Flavoring Blend', category: 'Additive', unit: 'lb', costPerUnit: 25.00, supplier: 'Givaudan' },

  // Packaging - Cans
  { id: 'PKG-CAN-22', name: '22oz Aluminum Can', category: 'Packaging', unit: 'ea', costPerUnit: 0.12, supplier: 'Ball Corporation' },
  { id: 'PKG-CAN-11', name: '11.5oz Sleek Aluminum Can', category: 'Packaging', unit: 'ea', costPerUnit: 0.09, supplier: 'Ball Corporation' },
  { id: 'PKG-CAN-15', name: '15oz Aluminum Can', category: 'Packaging', unit: 'ea', costPerUnit: 0.10, supplier: 'Crown Holdings' },

  // Packaging - PET
  { id: 'PKG-PET-20', name: '20oz PET Tallboy Bottle', category: 'Packaging', unit: 'ea', costPerUnit: 0.08, supplier: 'Plastipak' },
  { id: 'PKG-PET-34', name: '34oz PET Bottle', category: 'Packaging', unit: 'ea', costPerUnit: 0.11, supplier: 'Plastipak' },
  { id: 'PKG-PET-GAL', name: 'Gallon PET Jug', category: 'Packaging', unit: 'ea', costPerUnit: 0.22, supplier: 'Graham Packaging' },

  // Packaging - Secondary
  { id: 'PKG-SHRINK-24', name: '24-Pack Shrink Wrap', category: 'Packaging', unit: 'ea', costPerUnit: 0.15, supplier: 'Berry Global' },
  { id: 'PKG-TRAY-24', name: '24-Pack Corrugated Tray', category: 'Packaging', unit: 'ea', costPerUnit: 0.35, supplier: 'WestRock' },
  { id: 'PKG-PALLET', name: 'Pallet Wrap & Materials', category: 'Packaging', unit: 'pallet', costPerUnit: 4.50, supplier: 'Signode' },

  // Labels
  { id: 'LBL-GT-20', name: 'Green Tea 20oz Label', category: 'Label', unit: 'ea', costPerUnit: 0.02, supplier: 'Multi-Color Corp' },
  { id: 'LBL-AP-20', name: 'Arnold Palmer 20oz Label', category: 'Label', unit: 'ea', costPerUnit: 0.02, supplier: 'Multi-Color Corp' },
  { id: 'LBL-LT-22', name: 'Lemon Tea 22oz Can Print', category: 'Label', unit: 'ea', costPerUnit: 0.015, supplier: 'Ball Corporation' },
];

// ============================================================================
// SUPPLIERS - Beverage industry suppliers
// ============================================================================

export const suppliers = [
  { id: 'SUP-001', name: 'Ball Corporation', category: 'Packaging', location: 'Westminster, CO', leadTime: 14 },
  { id: 'SUP-002', name: 'Crown Holdings', category: 'Packaging', location: 'Philadelphia, PA', leadTime: 14 },
  { id: 'SUP-003', name: 'Plastipak', category: 'Packaging', location: 'Plymouth, MI', leadTime: 10 },
  { id: 'SUP-004', name: 'Graham Packaging', category: 'Packaging', location: 'Lancaster, PA', leadTime: 12 },
  { id: 'SUP-005', name: 'ADM Sweeteners', category: 'Ingredients', location: 'Decatur, IL', leadTime: 7 },
  { id: 'SUP-006', name: 'US Sugar Corp', category: 'Ingredients', location: 'Clewiston, FL', leadTime: 10 },
  { id: 'SUP-007', name: 'Jungbunzlauer', category: 'Ingredients', location: 'Boston, MA', leadTime: 21 },
  { id: 'SUP-008', name: 'DSM Nutritional', category: 'Ingredients', location: 'Parsippany, NJ', leadTime: 14 },
  { id: 'SUP-009', name: 'Givaudan', category: 'Flavors', location: 'Cincinnati, OH', leadTime: 21 },
  { id: 'SUP-010', name: 'Berry Global', category: 'Packaging', location: 'Evansville, IN', leadTime: 7 },
  { id: 'SUP-011', name: 'WestRock', category: 'Packaging', location: 'Atlanta, GA', leadTime: 7 },
  { id: 'SUP-012', name: 'Multi-Color Corp', category: 'Labels', location: 'Batavia, OH', leadTime: 10 },
];

// ============================================================================
// STORE LOCATIONS - Retail presence
// ============================================================================

export const storeLocations = [
  { id: 'AZ-STORE-PHX-001', name: 'Phoenix Metro Costco', city: 'Phoenix', state: 'AZ', region: 'West', lat: 33.4484, lng: -112.0740 },
  { id: 'AZ-STORE-LA-001', name: 'Los Angeles Walmart', city: 'Los Angeles', state: 'CA', region: 'West', lat: 34.0522, lng: -118.2437 },
  { id: 'AZ-STORE-NYC-001', name: 'New York Metro Stores', city: 'New York', state: 'NY', region: 'Northeast', lat: 40.7128, lng: -74.0060 },
  { id: 'AZ-STORE-CHI-001', name: 'Chicago Distribution', city: 'Chicago', state: 'IL', region: 'Midwest', lat: 41.8781, lng: -87.6298 },
  { id: 'AZ-STORE-DAL-001', name: 'Dallas Metro', city: 'Dallas', state: 'TX', region: 'Central', lat: 32.7767, lng: -96.7970 },
  { id: 'AZ-STORE-MIA-001', name: 'Miami Distribution', city: 'Miami', state: 'FL', region: 'Southeast', lat: 25.7617, lng: -80.1918 },
  { id: 'AZ-STORE-ATL-001', name: 'Atlanta Metro', city: 'Atlanta', state: 'GA', region: 'Southeast', lat: 33.7490, lng: -84.3880 },
  { id: 'AZ-STORE-SEA-001', name: 'Seattle Distribution', city: 'Seattle', state: 'WA', region: 'West', lat: 47.6062, lng: -122.3321 },
  { id: 'AZ-STORE-DEN-001', name: 'Denver Metro', city: 'Denver', state: 'CO', region: 'West', lat: 39.7392, lng: -104.9903 },
  { id: 'AZ-STORE-BOS-001', name: 'Boston Distribution', city: 'Boston', state: 'MA', region: 'Northeast', lat: 42.3601, lng: -71.0589 },
];

// ============================================================================
// DISTRIBUTION CENTERS
// ============================================================================

export const distributionCenters = [
  { id: 'AZ-DC-KEASBEY', name: 'Keasbey Distribution Center', city: 'Keasbey', state: 'NJ', region: 'Northeast', capacity: 500000, lat: 40.5207, lng: -74.2932 },
  { id: 'AZ-DC-TRACY', name: 'Tracy Distribution Center', city: 'Tracy', state: 'CA', region: 'West', capacity: 350000, lat: 37.7397, lng: -121.4252 },
  { id: 'AZ-DC-DALLAS', name: 'Dallas Distribution Center', city: 'Dallas', state: 'TX', region: 'Central', capacity: 400000, lat: 32.7767, lng: -96.7970 },
  { id: 'AZ-DC-CHICAGO', name: 'Chicago Distribution Center', city: 'Chicago', state: 'IL', region: 'Midwest', capacity: 380000, lat: 41.8781, lng: -87.6298 },
  { id: 'AZ-DC-ATLANTA', name: 'Atlanta Distribution Center', city: 'Atlanta', state: 'GA', region: 'Southeast', capacity: 320000, lat: 33.7490, lng: -84.3880 },
];

// ============================================================================
// MARKET SEGMENTS - For MARGEN.AI
// ============================================================================

export const marketSegments = [
  { id: 'SEG-CONV', name: 'Convenience Stores', revenueShare: 35, marginRange: [28, 38] },
  { id: 'SEG-GROCERY', name: 'Grocery Chains', revenueShare: 30, marginRange: [25, 32] },
  { id: 'SEG-CLUB', name: 'Club Stores', revenueShare: 15, marginRange: [22, 28] },
  { id: 'SEG-FOOD', name: 'Food Service', revenueShare: 12, marginRange: [30, 40] },
  { id: 'SEG-ECOM', name: 'E-commerce', revenueShare: 8, marginRange: [35, 45] },
];

// ============================================================================
// COMPETITORS - For MARKETS.AI
// ============================================================================

export const competitors = [
  { id: 'COMP-COKE', name: 'Coca-Cola (Gold Peak)', category: 'Ready-to-Drink Tea' },
  { id: 'COMP-PEPSI', name: 'PepsiCo (Lipton/Brisk)', category: 'Ready-to-Drink Tea' },
  { id: 'COMP-SNAPPLE', name: 'Keurig Dr Pepper (Snapple)', category: 'Ready-to-Drink Tea' },
  { id: 'COMP-HONEST', name: 'Coca-Cola (Honest Tea)', category: 'Organic Tea' },
  { id: 'COMP-PURE', name: 'PepsiCo (Pure Leaf)', category: 'Premium Tea' },
];

// ============================================================================
// FINANCIAL METRICS - Industry benchmarks
// ============================================================================

export const financialMetrics = {
  averageMarginPercent: 32,
  targetMarginPercent: 35,
  averageRevenuePerCase: 22.50,
  averageCOGSPerCase: 7.50,
  freightCostPercent: 8,
  warehouseCostPercent: 3,
  marketingCostPercent: 5,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getProductById = (id) => products.find(p => p.id === id);
export const getProductBySku = (sku) => products.find(p => p.sku === sku);
export const getPlantById = (id) => plants.find(p => p.id === id);
export const getCustomerById = (id) => customers.find(c => c.id === id);
export const getComponentById = (id) => bomComponents.find(c => c.id === id);

export const getProductsByCategory = (category) => products.filter(p => p.category === category);
export const getPlantsByRegion = (region) => plants.filter(p => p.region === region);
export const getCustomersByType = (type) => customers.filter(c => c.type === type);

// ============================================================================
// LAM-COMPATIBLE EXPORTS (for DemandIntelligence and other STOX tiles)
// These maintain backward compatibility with LAM Research data structure
// ============================================================================

export const LAM_MATERIALS = products.map((p, idx) => ({
  id: p.id,
  name: p.name,
  sku: p.sku,
  category: p.category,
  unitPrice: p.unitPrice,
  casePrice: p.casePrice,
  cogs: p.cogs,
  materialGroup: p.category?.substring(0, 4) || 'MISC',
  mrpType: ['PD', 'VB', 'V1'][idx % 3],
  lotSize: [100, 250, 500, 1000][idx % 4],
  leadTime: [7, 14, 21, 28][idx % 4],
  safetyStock: Math.floor(500 + Math.random() * 2000),
  reorderPoint: Math.floor(1000 + Math.random() * 3000),
}));

export const LAM_PLANTS = plants.map((p, idx) => ({
  id: p.id,
  name: p.name,
  region: p.region,
  country: p.state === 'MX' ? 'Mexico' : p.state === 'ON' ? 'Canada' : 'USA',
  currency: p.state === 'MX' ? 'MXN' : p.state === 'ON' ? 'CAD' : 'USD',
  city: p.city,
  state: p.state,
  type: p.type,
  lat: p.lat,
  lng: p.lng,
  plantCode: `P${String(idx + 1).padStart(3, '0')}`,
  sapClient: ['100', '200', '300'][idx % 3],
}));

export const LAM_MATERIAL_PLANT_DATA = products.slice(0, 12).flatMap((product, pIdx) =>
  plants.slice(0, 4).map((plant, plIdx) => ({
    materialId: product.id,
    plant: plant.id,
    abc: ['A', 'B', 'C'][pIdx % 3],
    xyz: ['X', 'Y', 'Z'][plIdx % 3],
    totalStock: 10000 + Math.floor(Math.random() * 50000),
    dos: 30 + Math.floor(Math.random() * 60),
    turns: 4 + Math.random() * 8,
    mape: 10 + Math.random() * 25,
    stockouts: Math.floor(Math.random() * 5),
    safetyStock: 2000 + Math.floor(Math.random() * 5000),
    reorderPoint: 5000 + Math.floor(Math.random() * 10000),
  }))
);

export const getMaterialById = (id) => LAM_MATERIALS.find(m => m.id === id);
export const getPlantName = (id) => {
  const plant = LAM_PLANTS.find(p => p.id === id);
  return plant?.name || id;
};

export const LAM_VENDORS = suppliers.map(s => ({
  id: s.id,
  name: s.name,
  leadTime: s.leadTime,
  otd: 85 + Math.random() * 10,
}));

export const getMaterialsByPlant = (plantId) =>
  LAM_MATERIAL_PLANT_DATA.filter(d => d.plant === plantId);

export const calculatePlantSummary = (plantId) => {
  const materials = getMaterialsByPlant(plantId);
  return {
    totalSKUs: materials.length,
    totalStock: materials.reduce((acc, m) => acc + (m.totalStock || 0), 0),
    avgDOS: materials.length > 0 ? materials.reduce((acc, m) => acc + (m.dos || 0), 0) / materials.length : 0,
    avgTurns: materials.length > 0 ? materials.reduce((acc, m) => acc + (m.turns || 0), 0) / materials.length : 0,
  };
};

export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
};

export const formatCurrencyUSD = (value) => formatCurrency(value, 'USD');

export const CURRENCY_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
};

export const MRP_TYPES = ['PD', 'VB', 'V1', 'V2', 'ND'];

// Default export for convenience
export default {
  products,
  plants,
  customers,
  categories,
  bomComponents,
  suppliers,
  storeLocations,
  distributionCenters,
  marketSegments,
  competitors,
  financialMetrics,
  getProductById,
  getProductBySku,
  getPlantById,
  getCustomerById,
  getComponentById,
  getProductsByCategory,
  getPlantsByRegion,
  getCustomersByType,
  // LAM-compatible exports
  LAM_MATERIALS,
  LAM_PLANTS,
  LAM_MATERIAL_PLANT_DATA,
  getMaterialById,
  getPlantName,
};
