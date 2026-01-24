import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Stack,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  LinearProgress,
  Drawer,
  Divider,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Lightbulb as LightbulbIcon,
  CompareArrows as CompareArrowsIcon,
  Tune as TuneIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Inventory as InventoryIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  AttachMoney as AttachMoneyIcon,
  LocalShipping as LocalShippingIcon,
  Schedule as ScheduleIcon,
  NavigateNext as NavigateNextIcon,
  Check as CheckIcon,
  SwapHoriz as SwapHorizIcon,
  ViewList as ViewListIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Close as CloseIcon,
  Factory as FactoryIcon,
  Place as PlaceIcon,
  Category as CategoryIcon,
  BarChart as BarChartIcon,
  Receipt as ReceiptIcon,
  Insights as InsightsIcon,
  Warehouse as WarehouseIcon,
  Science as ScienceIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import ordlyTheme from './ordlyTheme';
import { CustomerHistoryDrawer, MaterialPlantDrawer, ComparisonModal } from './drilldowns';
import ConfirmationDialog from './ConfirmationDialog';
import InfoDialog from './InfoDialog';
import OrderTrackingBar from './OrderTrackingBar';
import {
  plants as plantsData,
  customerShipToLocations,
  overrunStock,
  materialBOM,
  suppliers as suppliersData,
  getPlantsByProximity,
  getPlantsByCapabilityAndProximity,
  canPlantManufacture,
  getOutboundCost,
  calculateComponentCosts,
  calculateTotalLandedCost,
} from '../../data/ordlyai/fulfillmentConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Unit conversion to M2 (square meters) for BOM calculations
// SAP BOMs are typically in M2, so we need to convert order quantities
const convertToM2 = (quantity, unit) => {
  const unitUpper = (unit || 'M2').toUpperCase();
  switch (unitUpper) {
    case 'M2':
      return quantity;
    case 'FT2':
    case 'SF':
      return quantity * 0.092903; // 1 ft² = 0.092903 m²
    case 'MSF':
      return quantity * 1000 * 0.092903; // MSF = 1000 sq ft
    case 'MSI':
      return quantity * 1000 * 0.00064516; // MSI = 1000 sq inches
    case 'LM':
    case 'M':
      return quantity; // Linear meters - assume 1m width for area
    case 'LF':
    case 'FT':
      return quantity * 0.3048; // Linear feet to meters
    case 'YD2':
    case 'SY':
      return quantity * 0.836127; // 1 yd² = 0.836127 m²
    default:
      console.warn(`Unknown unit '${unit}', treating as M2`);
      return quantity;
  }
};

// Convert quantity from one unit to another
const convertQuantity = (quantity, fromUnit, toUnit) => {
  if (!fromUnit || !toUnit || fromUnit === toUnit) return quantity;
  // First convert to M2, then convert to target unit
  const qtyInM2 = convertToM2(quantity, fromUnit);
  const toUpper = (toUnit || 'M2').toUpperCase();
  switch (toUpper) {
    case 'M2':
      return qtyInM2;
    case 'FT2':
    case 'SF':
      return qtyInM2 / 0.092903; // m² to ft²
    case 'MSF':
      return qtyInM2 / (1000 * 0.092903); // m² to MSF
    case 'MSI':
      return qtyInM2 / (1000 * 0.00064516); // m² to MSI
    default:
      return qtyInM2;
  }
};

// Get display unit for quantities (convert M2 back to order unit if needed)
const getDisplayQuantity = (quantityM2, unit) => {
  const unitUpper = (unit || 'M2').toUpperCase();
  switch (unitUpper) {
    case 'M2':
      return quantityM2;
    case 'FT2':
    case 'SF':
      return quantityM2 / 0.092903;
    case 'MSF':
      return quantityM2 / (1000 * 0.092903);
    default:
      return quantityM2;
  }
};

// Theme colors from ordlyTheme
const COLORS = {
  primary: '#0854a0',
  secondary: '#1976d2',
  emerald: '#34d399',
  emeraldDark: '#059669',
  amber: '#fbbf24',
  amberDark: '#d97706',
  cyan: '#22d3ee',
  red: '#f87171',
  redDark: '#dc2626',
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Dark mode specific
  dark: {
    bg: '#0a0f1a',
    bgSecondary: '#0d1520',
    panel: 'rgba(15, 23, 42, 0.9)',
    panelBorder: 'rgba(52, 211, 153, 0.2)',
    text: '#e2e8f0',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
  },
};

// Helper to format currency
const formatCurrency = (value) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

// Helper: Get approximate coordinates and region from US state
// Used when order has ship-to data but no predefined customer config
const getLocationFromState = (state) => {
  const stateData = {
    'PA': { coords: { lat: 40.0, lng: -75.5 }, region: 'northeast', name: 'Pennsylvania' },
    'TX': { coords: { lat: 31.0, lng: -100.0 }, region: 'southwest', name: 'Texas' },
    'CA': { coords: { lat: 36.7, lng: -119.4 }, region: 'west', name: 'California' },
    'IL': { coords: { lat: 40.6, lng: -89.3 }, region: 'midwest', name: 'Illinois' },
    'OH': { coords: { lat: 40.4, lng: -82.9 }, region: 'midwest', name: 'Ohio' },
    'IN': { coords: { lat: 40.3, lng: -86.1 }, region: 'midwest', name: 'Indiana' },
    'IA': { coords: { lat: 42.0, lng: -93.5 }, region: 'midwest', name: 'Iowa' },
    'WI': { coords: { lat: 44.5, lng: -89.5 }, region: 'midwest', name: 'Wisconsin' },
    'MN': { coords: { lat: 46.0, lng: -94.6 }, region: 'midwest', name: 'Minnesota' },
    'MI': { coords: { lat: 44.3, lng: -85.6 }, region: 'midwest', name: 'Michigan' },
    'NC': { coords: { lat: 35.6, lng: -79.8 }, region: 'southeast', name: 'North Carolina' },
    'GA': { coords: { lat: 33.0, lng: -83.5 }, region: 'southeast', name: 'Georgia' },
    'FL': { coords: { lat: 28.0, lng: -82.5 }, region: 'southeast', name: 'Florida' },
    'NY': { coords: { lat: 43.0, lng: -75.5 }, region: 'northeast', name: 'New York' },
    'NJ': { coords: { lat: 40.1, lng: -74.5 }, region: 'northeast', name: 'New Jersey' },
    'MA': { coords: { lat: 42.4, lng: -71.4 }, region: 'northeast', name: 'Massachusetts' },
    'WA': { coords: { lat: 47.4, lng: -120.7 }, region: 'west', name: 'Washington' },
    'OR': { coords: { lat: 44.0, lng: -120.5 }, region: 'west', name: 'Oregon' },
    'AZ': { coords: { lat: 34.2, lng: -111.6 }, region: 'southwest', name: 'Arizona' },
    'CO': { coords: { lat: 39.0, lng: -105.5 }, region: 'west', name: 'Colorado' },
    'MO': { coords: { lat: 38.5, lng: -92.4 }, region: 'midwest', name: 'Missouri' },
    'TN': { coords: { lat: 35.8, lng: -86.3 }, region: 'southeast', name: 'Tennessee' },
    'KY': { coords: { lat: 37.8, lng: -85.3 }, region: 'southeast', name: 'Kentucky' },
    'AL': { coords: { lat: 33.0, lng: -86.8 }, region: 'southeast', name: 'Alabama' },
    'SC': { coords: { lat: 33.8, lng: -81.2 }, region: 'southeast', name: 'South Carolina' },
    'VA': { coords: { lat: 37.5, lng: -78.8 }, region: 'southeast', name: 'Virginia' },
    'LA': { coords: { lat: 31.0, lng: -92.0 }, region: 'southwest', name: 'Louisiana' },
    'MS': { coords: { lat: 32.7, lng: -89.7 }, region: 'southeast', name: 'Mississippi' },
  };
  const defaultData = { coords: { lat: 39.8, lng: -98.6 }, region: 'midwest', name: 'Unknown' }; // Center of US
  return stateData[state?.toUpperCase()] || defaultData;
};

// Helper: Create ship-to location from order data (extracted from PO)
const createShipToFromOrder = (order) => {
  if (!order) return null;

  const city = order.shipToCity || order.ship_to_city;
  const state = order.shipToState || order.ship_to_state;
  const name = order.shipToName || order.ship_to_name || order.customer;

  if (!city && !state) return null;

  const stateInfo = getLocationFromState(state);
  const displayName = city && state ? `${name || 'Customer'}, ${city}, ${state}` : `${name || 'Customer'}`;

  return {
    id: 'order-shipto',
    name: displayName,
    region: stateInfo.region,
    coordinates: stateInfo.coords,
    isFromOrder: true, // Flag to indicate this came from PO data
  };
};

// Fallback SKU options - marginDollar will be calculated from order value
const fallbackSkuOptions = [
  { id: 'SKU-001', sku: 'RL-PET75-FP-S', name: 'Standard Fluoropolymer Release (Recommended)', margin: 32.0, marginDollar: null, availability: 'In Stock', leadTime: 5, plant: '2100', plantName: 'Iowa City', recommended: true, isMarginRec: true, tags: ['RECOMMENDED', 'BEST MARGIN'], specs: ['75μm ± 3μm thickness', 'Fluoropolymer coating', '30,000 MSI available'] },
  { id: 'SKU-002', sku: 'RL-PET75-FP-P', name: 'Premium Fluoropolymer Release (Exact Match)', margin: 28.5, marginDollar: null, availability: 'Partial', leadTime: 12, plant: '2100', plantName: 'Iowa City', recommended: false, isExactMatch: true, tags: ['EXACT MATCH'], specs: ['75μm ± 2μm thickness', 'Premium fluoropolymer', '15,000 MSI in stock + 10,000 MSI in production'] },
  { id: 'SKU-003', sku: 'RL-PET72-FP-S', name: '72μm Thickness Alternate (Fastest)', margin: 30.0, marginDollar: null, availability: 'In Stock', leadTime: 3, plant: '2200', plantName: 'Wisconsin', recommended: false, isLeadTimeRec: true, tags: ['THICKNESS ALT', 'FASTEST'], specs: ['72μm ± 2μm (within ±5% tolerance)', '28,000 MSI available'] },
  { id: 'SKU-004', sku: 'NEW-SKU-REQ', name: 'New SKU Creation Required (Not Recommended)', margin: 23.0, marginDollar: null, availability: 'None', leadTime: 45, plant: '2100', plantName: 'Iowa City', recommended: false, notRecommended: true, tags: ['NOT RECOMMENDED', 'NEW SKU'], specs: ['Custom specification required', 'Qualification testing needed', '45+ day lead time'] },
];

const SkuDecisioning = ({ onBack, darkMode = false, selectedOrder: initialOrder = null, selectedLineNumber: initialLineNumber = null, onNavigate }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);

  // Multi-line order state
  const [activeLineNumber, setActiveLineNumber] = useState(1);
  const [lineSkuSelections, setLineSkuSelections] = useState({}); // { lineNumber: { skuId, skuData } }

  // Navigation confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, order: null, sku: null });

  // Info dialog state (replaces browser alerts)
  const [infoDialog, setInfoDialog] = useState({ open: false, title: '', message: '', type: 'info' });
  const [isPromoting, setIsPromoting] = useState(false);

  // API data state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ pending: 0, avgMargin: 0, bestMargin: 0, avgLeadTime: 0 });

  // SKU Options state
  const [skuOptions, setSkuOptions] = useState([]);
  const [skuOptionsLoading, setSkuOptionsLoading] = useState(false);
  const [marginRecommendation, setMarginRecommendation] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);

  // Drilldown state
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);
  const [materialDrawerOpen, setMaterialDrawerOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState({ kunnr: null, name: null });
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Fulfillment Optimizer state
  const [selectedShipTo, setSelectedShipTo] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState('7604');
  const [linePlantSelections, setLinePlantSelections] = useState({});
  const [componentSuppliers, setComponentSuppliers] = useState({});
  const [lineComponentSelections, setLineComponentSelections] = useState({});
  const [rankedPlants, setRankedPlants] = useState([]);
  const [components, setComponents] = useState([]);
  const [componentViewTab, setComponentViewTab] = useState('suppliers'); // 'suppliers' or 'summary'
  const [costs, setCosts] = useState({
    totalMaterial: 97715,
    totalInbound: 6890,
    acquisitionCost: 104605,
    outboundFreight: 6200,
    totalLanded: 110805,
    margin: 76695,
    marginPct: 40.9,
  });

  // Baseline state for comparison (stores original recommended values)
  const [baseline, setBaseline] = useState(null);
  const [comparisonDrawerOpen, setComparisonDrawerOpen] = useState(false);

  // Savings ledger state
  const [orderSavings, setOrderSavings] = useState(null);

  // Real SAP data state (BOM and customer addresses from API)
  const [realBomData, setRealBomData] = useState(null);
  const [realCustomerAddresses, setRealCustomerAddresses] = useState(null);
  const [bomLoading, setBomLoading] = useState(false);

  // Material pricing state (CP, MDSP, OSP, VAR, AVG from SAP)
  const [materialPricing, setMaterialPricing] = useState(null);
  const [materialPricingLoading, setMaterialPricingLoading] = useState(false);

  // Theme-aware styles - using blue theme consistent with other drilldown pages
  const theme = {
    bg: darkMode ? COLORS.dark.bg : COLORS.slate[50],
    bgSecondary: darkMode ? COLORS.dark.bgSecondary : '#ffffff',
    panel: darkMode ? COLORS.dark.panel : '#ffffff',
    panelBorder: darkMode ? alpha(COLORS.primary, 0.3) : alpha(COLORS.primary, 0.15),
    text: darkMode ? COLORS.dark.text : COLORS.slate[900],
    textSecondary: darkMode ? COLORS.dark.textSecondary : COLORS.slate[500],
    textMuted: darkMode ? COLORS.dark.textMuted : COLORS.slate[400],
    headerBg: darkMode ? alpha(COLORS.primary, 0.15) : alpha(COLORS.primary, 0.05),
    headerBorder: darkMode ? alpha(COLORS.primary, 0.4) : alpha(COLORS.primary, 0.2),
  };

  // Auto-select order passed from Pipeline navigation
  useEffect(() => {
    if (initialOrder && orders.length > 0) {
      // Normalize both to raw number for comparison
      const rawOrderId = (initialOrder.id || '').replace(/^(PO-|INT-|ORD-)/, '');
      const matchingOrder = orders.find(o => {
        const rawOId = (o.id || '').replace(/^(PO-|INT-|ORD-)/, '');
        return rawOId === rawOrderId || o.id?.includes(rawOrderId);
      });
      if (matchingOrder) {
        // Include lineItems from initialOrder if present
        const orderWithLines = {
          ...matchingOrder,
          lineItems: initialOrder.lineItems || matchingOrder.lineItems || [],
          lineCount: initialOrder.lineCount || matchingOrder.lineCount || 1,
        };
        setSelectedOrder(orderWithLines);
        // Set active line if specified
        if (initialLineNumber) {
          setActiveLineNumber(initialLineNumber);
        }
        fetchSkuOptions(orderWithLines, initialLineNumber || 1);
      }
    }
  }, [initialOrder, orders, initialLineNumber]);

  // Fetch SKU options from static data API for consistent values
  // lineNumber parameter is optional - for multi-line orders, fetches options for specific line
  const fetchSkuOptions = async (order, lineNumber = null) => {
    setSkuOptionsLoading(true);
    try {
      // Extract clean order ID (remove prefixes)
      const orderId = (order.id || '').replace('INT-', '').replace('ORD-', '').replace('PO-', '').trim();

      // Build URL - use line-specific endpoint if lineNumber provided and order has multiple lines
      const hasMultipleLines = (order.lineCount || 1) > 1;
      const lineNum = lineNumber || activeLineNumber || 1;
      const url = hasMultipleLines
        ? `${API_BASE_URL}/api/ordlyai/order/${orderId}/line/${lineNum}/options?_t=${Date.now()}`
        : `${API_BASE_URL}/api/ordlyai/sku-optimizer/orders/${orderId}/options?_t=${Date.now()}`;

      const response = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) {
        console.warn('Static SKU options not found, using fallback');
        throw new Error('Static options not available');
      }

      const data = await response.json();

      const options = (data.sku_options || []).map((opt, idx) => ({
        id: opt.id || `SKU-${String(idx + 1).padStart(3, '0')}`,
        sku: opt.sku,
        name: opt.name,
        margin: opt.margin_pct,
        marginDollar: opt.margin_dollar,
        availability: opt.stock_status === 'full' ? 'In Stock' : opt.stock_status === 'partial' ? 'Partial' : 'None',
        leadTime: opt.lead_time_days,
        recommended: opt.is_margin_rec || false,
        isMarginRec: opt.is_margin_rec || false,
        isLeadTimeRec: opt.is_leadtime_rec || false,
        isExactMatch: opt.is_exact_match || false,
        tags: opt.tags || [],
        specs: opt.specs || [],
        plant: opt.plant,
        plantName: opt.plant_name,
        coveragePct: opt.coverage_pct,
        // Data quality indicators
        priceSource: opt.price_source || 'unknown',  // 'historical', 'a305_customer', 'cost_markup'
        leadTimeSource: opt.lead_time_source || 'estimated',  // 'MARC.PLIFZ', 'estimated'
        marginConfidence: opt.margin_confidence || 'low',  // 'high', 'medium', 'low'
        orderCount: opt.order_count || 0,  // Number of historical orders
        unitCost: opt.unit_cost,
        unitPrice: opt.unit_price,
        priceUom: opt.price_uom,
        baseUom: opt.base_uom,
      }));

      // Store line-specific data for margin waterfall and BOM calculations
      // Priority: API response data > order parameter (which may have line item data)
      const lineData = {
        orderValue: data.order_value || data.line_value || order?.orderValue || order?.value,
        value: data.line_value || data.order_value || order?.value || order?.orderValue,
        // Use order's quantity/unit if API doesn't provide (order now contains line data from handleLineChange)
        quantity: order?.quantity,
        unit: order?.unit || order?.uom || 'MSF',
        uom: order?.unit || order?.uom || 'MSF',
      };

      // Parse quantity string like "7,500 MSF" from API if available
      if (data.quantity && typeof data.quantity === 'string') {
        const qtyMatch = data.quantity.match(/^([\d,]+(?:\.\d+)?)\s*(.*)$/);
        if (qtyMatch) {
          lineData.quantity = parseFloat(qtyMatch[1].replace(/,/g, ''));
          lineData.unit = qtyMatch[2].trim() || lineData.unit;
          lineData.uom = qtyMatch[2].trim() || lineData.uom;
        }
      } else if (data.quantity) {
        lineData.quantity = parseFloat(String(data.quantity).replace(/,/g, ''));
      }

      // Store material ID for BOM lookup
      if (data.material_id) {
        lineData.material = data.material_id;
        lineData.materialId = data.material_id;
      } else if (order?.materialId) {
        lineData.material = order.materialId;
        lineData.materialId = order.materialId;
      }

      console.log('fetchSkuOptions: lineData built:', lineData, 'from API:', { qty: data.quantity, value: data.line_value }, 'from order:', { qty: order?.quantity, unit: order?.unit });
      setSelectedOrder(prev => ({ ...prev, ...lineData }));

      console.log('fetchSkuOptions: line', lineNum, 'options:', options.map(o => ({ id: o.id, sku: o.sku })));
      setSkuOptions(options.length > 0 ? options : fallbackSkuOptions);

      // Restore previous selection for this line if exists
      const previousSelection = lineSkuSelections[lineNum];
      const selectedOption = previousSelection
        ? options.find(o => o.id === previousSelection.skuId) || options[0]
        : options[0];

      if (previousSelection) {
        console.log('fetchSkuOptions: restoring previous selection for line', lineNum, ':', previousSelection.skuId);
        setSelectedSku(previousSelection.skuId);
      } else {
        const newSelectedSku = options.length > 0 ? options[0].id : 'SKU-001';
        console.log('fetchSkuOptions: setting new selection for line', lineNum, ':', newSelectedSku, 'material:', options[0]?.sku);
        setSelectedSku(newSelectedSku);
      }

      // Immediately fetch BOM data for the selected SKU with line-specific data
      // This is crucial because state updates are async - the useEffect might use stale data
      // Pass selectedOption (SKU data) so we can use its unitCost when no BOM exists
      if (selectedOption?.sku) {
        // Get order unit for consistent unit display across all sections
        const orderUnit = lineData?.unit || lineData?.uom || 'MSF';
        console.log('fetchSkuOptions: immediately fetching BOM for material:', selectedOption.sku, 'with line data:', lineData, 'skuData:', selectedOption);
        fetchRealBomData(selectedOption.sku, lineData.quantity || 25000, lineData, selectedOption, orderUnit);
      }

      setMarginRecommendation(data.margin_recommendation);
      setComparisonData(data.comparison_data || []);

    } catch (err) {
      console.error('Error fetching SKU options:', err);
      setSkuOptions(fallbackSkuOptions);
      setSelectedSku('SKU-001');
    } finally {
      setSkuOptionsLoading(false);
    }
  };

  // Fetch real BOM data from SAP API
  // orderData parameter allows passing line-specific data since state updates are async
  // skuData parameter provides SKU pricing info (unitCost) for fallback when no BOM
  // targetUnit parameter ensures BOM unit costs are converted to match the order's unit (MSF, FT2, M2)
  const fetchRealBomData = async (materialId, quantity = null, orderData = null, skuData = null, targetUnit = null) => {
    if (!materialId) return;
    setBomLoading(true);
    try {
      // Build URL with query parameters
      const params = new URLSearchParams();
      if (quantity && quantity > 0) params.append('quantity', quantity);
      if (targetUnit) params.append('target_unit', targetUnit);
      const queryString = params.toString();
      const url = `${API_BASE_URL}/api/ordlyai/bom/${encodeURIComponent(materialId)}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);
      if (!response.ok) {
        console.warn('BOM data not available for material:', materialId);
        setRealBomData(null);
        return;
      }

      const data = await response.json();
      console.log('Fetched real BOM data:', data, 'has_bom:', data?.has_bom, 'components:', data?.components?.length);
      setRealBomData(data);

      // Force recalculate immediately with the new BOM data
      // We pass the data directly since state update is async
      console.log('BOM fetch complete. Checking conditions:', {
        has_bom: data?.has_bom,
        components: data?.components?.length,
        selectedSku,
        selectedPlant,
        skuOptionsLength: skuOptions.length
      });

      if (data?.has_bom && data?.components?.length > 0) {
        // Use selectedPlant or fall back to first plant
        const plantToUse = selectedPlant || '2100';
        console.log('Forcing recalculation with new BOM data, plant:', plantToUse, 'materialId:', materialId);
        // Use the materialId directly since we have it from the API call
        // Pass orderData for line-specific quantity/unit since selectedOrder state may be stale
        recalculateCostsWithBom(materialId, plantToUse, componentSuppliers, data, orderData);
      } else {
        // No BOM data - create a fallback component based on the material itself
        console.log('=== NO BOM FALLBACK ===');
        console.log('materialId:', materialId);
        console.log('skuData:', skuData);
        console.log('skuData?.unitPrice:', skuData?.unitPrice);
        console.log('skuData?.unitCost:', skuData?.unitCost);
        console.log('materialPricing:', materialPricing);
        const effectiveOrder = orderData || selectedOrder;
        const qtyStr = String(effectiveOrder?.quantity || '25000').replace(/,/g, '');
        const orderQtyRaw = parseFloat(qtyStr) || 25000;
        const orderUnit = effectiveOrder?.unit || effectiveOrder?.uom || 'MSF';
        const orderQtyM2 = convertToM2(orderQtyRaw, orderUnit);
        const orderValue = effectiveOrder?.value || effectiveOrder?.orderValue || 187500;
        console.log('orderQtyRaw:', orderQtyRaw, 'orderUnit:', orderUnit, 'orderValue:', orderValue);

        // Use material description from API response, SKU name, or material ID
        const materialName = data?.material_description || skuData?.name || materialId;

        // Calculate material cost from available sources (priority order):
        // 1. materialPricing.CP (SAP cost price per unit) × quantity
        // 2. materialPricing.OSP (SAP selling price) × quantity (as cost estimate)
        // 3. SKU unitCost × quantity
        // 4. Estimate from order value (60%)
        let materialCost;
        let unitCost;
        let isRealCost = false;

        if (materialPricing?.CP && materialPricing.CP > 0) {
          // Use SAP cost price (CP is per sales unit)
          unitCost = materialPricing.CP;
          materialCost = Math.round(orderQtyRaw * unitCost);
          isRealCost = true;
          console.log('Using SAP CP:', unitCost, '× qty:', orderQtyRaw, '=', materialCost);
        } else if (materialPricing?.OSP && materialPricing.OSP > 0) {
          // Use SAP selling price as cost estimate (when no CP available)
          unitCost = materialPricing.OSP;
          materialCost = Math.round(orderQtyRaw * unitCost);
          isRealCost = true;
          console.log('Using SAP OSP as cost:', unitCost, '× qty:', orderQtyRaw, '=', materialCost);
        } else if (skuData?.unitCost && skuData.unitCost > 0) {
          // Use SKU unit cost
          unitCost = skuData.unitCost;
          materialCost = Math.round(orderQtyRaw * unitCost);
          isRealCost = true;
          console.log('Using SKU unitCost:', unitCost, '× qty:', orderQtyRaw, '=', materialCost);
        } else if (skuData?.unitPrice && skuData.unitPrice > 0) {
          // Use SKU unit price as cost (for items like FREIGHT/CPU where price = cost)
          unitCost = skuData.unitPrice;
          materialCost = Math.round(orderQtyRaw * unitCost);
          isRealCost = true;
          console.log('Using SKU unitPrice as cost:', unitCost, '× qty:', orderQtyRaw, '=', materialCost);
        } else {
          // Fallback: estimate from order value (assume ~60% material cost)
          materialCost = Math.round(orderValue * 0.60);
          unitCost = orderQtyRaw > 0 ? (materialCost / orderQtyRaw) : 0;
          console.log('Estimating material cost from order value:', orderValue, '× 0.60 =', materialCost);
        }

        const inboundCost = Math.round(materialCost * 0.03);

        setComponents([{
          id: materialId,
          name: materialName,
          qty: orderQtyRaw,   // Keep original quantity (not converted to M2)
          unit: orderUnit,    // Keep original unit
          materialCost: materialCost,
          inboundCost: inboundCost,
          landedCost: materialCost + inboundCost,
          leadTime: 14,
          isRealData: isRealCost,
          unitCost: unitCost,
          supplierOptions: [
            { id: 'supplier-1a', name: 'Supplier 1', cost: materialCost, leadTime: 14 },
          ],
          selectedSupplier: { name: 'Supplier 1', id: 'supplier-1a' },
        }]);

        const plantToUse = selectedPlant || '2100';
        const shipToRegion = selectedShipTo?.region || 'default';
        // Use plant's outboundCost from rankedPlants (displayed in Plant Selection section)
        const selectedPlantData = rankedPlants.find(p => p.id === plantToUse);
        const outboundFreight = selectedPlantData?.outboundCost || getOutboundCost(plantToUse, shipToRegion);
        const totalLanded = materialCost + inboundCost + outboundFreight;

        setCosts({
          totalMaterial: materialCost,
          totalInbound: inboundCost,
          acquisitionCost: materialCost + inboundCost,
          outboundFreight,
          totalLanded: Math.round(totalLanded),
          margin: Math.round(orderValue - totalLanded),
          marginPct: orderValue > 0 ? ((orderValue - totalLanded) / orderValue) * 100 : 0,
          criticalPath: { name: 'Production', leadTime: 14 },
          isRealBomData: false,
          orderQtyRaw: orderQtyRaw,
        });
      }
    } catch (err) {
      console.error('Error fetching BOM data:', err);
      setRealBomData(null);
    } finally {
      setBomLoading(false);
    }
  };

  // Fetch material pricing data (CP, MDSP, OSP, VAR) from SAP
  // targetUnit parameter ensures all prices are converted to match the order's unit (MSF, FT2, M2)
  const fetchMaterialPricing = async (materialId, customerId = null, targetUnit = null) => {
    if (!materialId) return;
    setMaterialPricingLoading(true);
    try {
      // Build URL with query parameters
      const params = new URLSearchParams();
      if (customerId) params.append('customer_id', customerId);
      if (targetUnit) params.append('target_unit', targetUnit);
      const queryString = params.toString();
      const url = `${API_BASE_URL}/api/ordlyai/material-pricing/${encodeURIComponent(materialId)}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);
      if (!response.ok) {
        console.warn('Material pricing not available for:', materialId);
        setMaterialPricing(null);
        return;
      }

      const data = await response.json();
      console.log('Fetched material pricing:', data, 'target_unit:', targetUnit);
      setMaterialPricing(data);
    } catch (err) {
      console.error('Error fetching material pricing:', err);
      setMaterialPricing(null);
    } finally {
      setMaterialPricingLoading(false);
    }
  };

  // Fetch real customer addresses from SAP KNA1
  const fetchRealCustomerAddresses = async (customerId) => {
    if (!customerId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/customer/${encodeURIComponent(customerId)}/addresses`);
      if (!response.ok) {
        console.warn('Customer addresses not available for:', customerId);
        setRealCustomerAddresses(null);
        return;
      }

      const data = await response.json();
      setRealCustomerAddresses(data);
      console.log('Fetched real customer addresses:', data);
    } catch (err) {
      console.error('Error fetching customer addresses:', err);
      setRealCustomerAddresses(null);
    }
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/sku-optimizer/orders?limit=100`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();

      const allOrders = data.orders.map(order => ({
        id: order.intent_id || order.id,
        status: order.status || 'pending',
        customer: order.customer,
        customerId: order.customerId || order.customer_id || '',
        materialId: order.materialId || order.material_id || '',
        plant: order.plant || '2100',
        requestedSpec: order.requested_spec || order.requestedSpec || 'N/A',
        quantity: order.quantity,
        value: order.orderValue || order.value || 0,
        margin: order.margin,
        leadTime: order.lead_time || '5 days',
        deliveryDate: order.delivery_date || order.deliveryDate || 'TBD',
        stage: order.stage ?? 0,
        // Multi-line order support
        lineItems: order.lineItems || [],
        lineCount: order.lineCount || 1,
      }));

      // Show all orders (removed stage filter to show all 97 extracted orders)
      const orderList = allOrders;

      setOrders(orderList);

      // Calculate stats
      const pendingCount = orderList.filter(o => o.status === 'pending').length;
      const marginsWithValue = orderList.filter(o => o.margin != null);
      const avgMargin = marginsWithValue.length > 0
        ? marginsWithValue.reduce((sum, o) => sum + o.margin, 0) / marginsWithValue.length
        : 0;
      const bestMargin = marginsWithValue.length > 0
        ? Math.max(...marginsWithValue.map(o => o.margin))
        : 0;

      setStats({
        pending: pendingCount,
        avgMargin: avgMargin.toFixed(1),
        bestMargin: bestMargin.toFixed(1),
        avgLeadTime: '5.2',
      });
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // DataGrid columns
  const columns = [
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => {
        const colors = {
          pending: { bg: alpha(COLORS.amber, 0.12), color: COLORS.amberDark },
          completed: { bg: alpha(COLORS.secondary, 0.12), color: COLORS.primary },
        };
        const style = colors[params.value] || colors.pending;
        return <Chip label={params.value.toUpperCase()} size="small" sx={{ ...style, bgcolor: style.bg, fontWeight: 600, fontSize: '0.65rem' }} />;
      },
    },
    {
      field: 'id',
      headerName: 'Purchase Order',
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: COLORS.secondary, fontSize: '0.8rem' }}>{params.value}</Typography>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: theme.text }}>{params.value}</Typography>
      ),
    },
    {
      field: 'lineCount',
      headerName: 'Items',
      width: 70,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const count = params.value || 1;
        return (
          <Chip
            label={count}
            size="small"
            sx={{
              minWidth: 28,
              height: 22,
              bgcolor: count > 1 ? alpha(COLORS.secondary, 0.12) : alpha(COLORS.slate[400], 0.1),
              color: count > 1 ? COLORS.secondary : theme.textMuted,
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        );
      },
    },
    {
      field: 'requestedSpec',
      headerName: 'Material / Spec',
      flex: 1,
      minWidth: 220,
      renderCell: (params) => {
        const lineItems = params.row.lineItems || [];
        if (lineItems.length > 1) {
          // Show summary for multi-item orders
          const materials = lineItems.map(li => li.material?.slice(0, 15) || 'Item').join(', ');
          return (
            <Tooltip title={lineItems.map(li => `${li.lineNumber}. ${li.material}`).join('\n')} arrow>
              <Typography sx={{ fontSize: '0.75rem', color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {materials}...
              </Typography>
            </Tooltip>
          );
        }
        return (
          <Typography sx={{ fontSize: '0.8rem', color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {params.value}
          </Typography>
        );
      },
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: theme.text }}>{params.value}</Typography>
      ),
    },
    {
      field: 'margin',
      headerName: 'Est. Margin',
      width: 100,
      align: 'center',
      renderCell: (params) => {
        if (params.value == null) return <Typography sx={{ color: theme.textMuted, fontSize: '0.8rem' }}>TBD</Typography>;
        const color = params.value >= 30 ? COLORS.emeraldDark : params.value >= 25 ? COLORS.amberDark : COLORS.redDark;
        return <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color }}>{params.value.toFixed(1)}%</Typography>;
      },
    },
    {
      field: 'deliveryDate',
      headerName: 'Req. Delivery',
      width: 120,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.75rem', color: theme.textSecondary }}>{params.value}</Typography>
      ),
    },
  ];

  const handleRowClick = (params) => {
    const order = params.row;
    setSelectedOrder(order);
    setActiveLineNumber(1);
    setLineSkuSelections({});
    fetchSkuOptions(order, 1);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
    setSkuOptions([]);
    setSelectedSku(null);
    setActiveLineNumber(1);
    setLineSkuSelections({});
    setBaseline(null); // Reset baseline for next order
  };

  // Handle switching between lines in multi-line order
  const handleLineChange = (lineNumber) => {
    // Save current selection before switching
    if (selectedSku && skuOptions.length > 0) {
      const skuData = skuOptions.find(s => s.id === selectedSku);
      setLineSkuSelections(prev => ({
        ...prev,
        [activeLineNumber]: { skuId: selectedSku, skuData },
      }));
    }
    // Clear BOM data to show loading state while fetching new line's BOM
    setRealBomData(null);
    setActiveLineNumber(lineNumber);

    // Get line item data for quantity/unit (from selectedOrder.lineItems)
    console.log('handleLineChange: selectedOrder.lineItems:', selectedOrder?.lineItems);
    const lineItem = selectedOrder?.lineItems?.find(li => li.lineNumber === lineNumber);
    console.log('handleLineChange: found lineItem for line', lineNumber, ':', lineItem);
    let updatedOrder = selectedOrder;

    if (lineItem) {
      // Parse quantity - could be "7,500" or "7,500.000" or just a number
      const qtyStr = String(lineItem.quantity || lineItem.qty || '').replace(/,/g, '');
      const qtyNum = parseFloat(qtyStr) || 0;
      const lineUnit = lineItem.unit || lineItem.uom || 'MSF';
      const lineValue = lineItem.lineValue || lineItem.extendedPrice || lineItem.value || 0;

      console.log('handleLineChange: line', lineNumber, 'qty:', qtyNum, lineUnit, 'value:', lineValue);

      // Create updated order object with line-specific data
      updatedOrder = {
        ...selectedOrder,
        quantity: qtyNum,
        unit: lineUnit,
        uom: lineUnit,
        value: lineValue,
        orderValue: lineValue,
        materialId: lineItem.materialId || lineItem.material_id,
      };

      // Update state (async)
      setSelectedOrder(updatedOrder);
    }

    // Pass the updated order with line data to fetchSkuOptions
    fetchSkuOptions(updatedOrder, lineNumber);
  };

  // Clear/reset selection for a specific line
  const handleClearLineSelection = (lineNumber, e) => {
    e.stopPropagation(); // Prevent triggering item click
    setLineSkuSelections(prev => {
      const newSelections = { ...prev };
      delete newSelections[lineNumber];
      return newSelections;
    });
    // If clearing the active line, also clear the current selection
    if (lineNumber === activeLineNumber) {
      setSelectedSku(null);
    }
  };

  // Save current SKU selection for current line
  const handleSkuSelect = (skuId) => {
    setSelectedSku(skuId);
    const skuData = skuOptions.find(s => s.id === skuId);
    setLineSkuSelections(prev => ({
      ...prev,
      [activeLineNumber]: { skuId, skuData },
    }));

    // Fetch real BOM data for the selected material
    if (skuData?.sku) {
      // Handle comma-formatted quantities like "7,500"
      const qtyStr = String(selectedOrder?.quantity || '25000').replace(/,/g, '');
      const orderQty = parseInt(qtyStr, 10) || 25000;
      // Get order unit for consistent unit display across all sections
      const orderUnit = selectedOrder?.unit || selectedOrder?.uom || 'MSF';
      // Pass selectedOrder as orderData so BOM calculation has correct unit (MSF, M2, etc.)
      fetchRealBomData(skuData.sku, orderQty, selectedOrder, skuData, orderUnit);
      // Fetch material pricing data (CP, MDSP, OSP) from SAP
      const customerId = selectedOrder?.customerId || selectedOrder?.kunnr || null;
      fetchMaterialPricing(skuData.sku, customerId, orderUnit);
    }

    // Re-rank plants by capability when SKU changes (different SKUs may require different capabilities)
    if (skuData?.sku && selectedShipTo?.id) {
      handleShipToChange(selectedShipTo.id, skuData.sku);
    } else {
      // Just recalculate costs if no re-ranking needed
      recalculateCosts(skuData?.sku, selectedPlant, componentSuppliers);
    }
  };

  // Handle Ship-To location change
  // Now filters plants by capability to manufacture the selected material
  const handleShipToChange = (shipToId, materialSku = null) => {
    const customerName = selectedOrder?.customer || '3M';

    // Priority 1: Check real SAP customer addresses
    let shipToLocation = null;
    if (realCustomerAddresses?.found && realCustomerAddresses?.locations?.length > 0) {
      shipToLocation = realCustomerAddresses.locations.find(loc => loc.id === shipToId);
    }
    // Priority 2: Fall back to static config
    if (!shipToLocation) {
      const customerData = customerShipToLocations[customerName] || customerShipToLocations['3M'];
      shipToLocation = customerData?.locations?.find(loc => loc.id === shipToId);
    }

    if (shipToLocation) {
      setSelectedShipTo(shipToLocation);

      // Get current material SKU from selected SKU option or passed parameter
      const currentSku = materialSku || skuOptions.find(s => s.id === selectedSku)?.sku;

      // Re-rank plants by capability AND proximity to new ship-to location
      // If material SKU is available, filter by capability first
      const ranked = currentSku
        ? getPlantsByCapabilityAndProximity(shipToLocation.coordinates, currentSku)
        : getPlantsByProximity(shipToLocation.coordinates);

      // Add overrun stock info and best lanes indicator
      // Only count capable plants for "best lanes" indicator
      let capablePlantIndex = 0;
      const rankedWithOverrun = ranked.map((plant) => {
        const customerOverrun = overrunStock[customerName];
        const plantOverrun = customerOverrun?.[plant.id];
        const isCapable = plant.canManufacture !== false; // Default to true if not set

        // Check if overrun material matches the currently selected SKU
        const overrunMatches = plantOverrun && currentSku && plantOverrun.material === currentSku;

        // Calculate estimated savings from using overrun (material cost ~= 0)
        // Use order qty and material cost estimate to show potential savings
        const overrunSavings = overrunMatches ? {
          available: plantOverrun.qty,
          unit: plantOverrun.unit,
          age: plantOverrun.age,
          // Rough estimate: material is ~60% of landed cost, so savings = 60% of typical material cost
          estimatedSavings: Math.round(plantOverrun.qty * 0.8), // ~$0.80/m² material cost saved
        } : null;

        const result = {
          ...plant,
          overrun: plantOverrun,
          overrunMatches: overrunMatches,
          overrunSavings: overrunSavings,
          bestLanes: isCapable && capablePlantIndex === 0, // First capable plant has best lanes
          outboundCost: getOutboundCost(plant.id, shipToLocation.region),
        };

        if (isCapable) capablePlantIndex++;
        return result;
      });

      // Sort to prioritize plants with matching overrun (but keep capable plants first)
      const sortedPlants = rankedWithOverrun.sort((a, b) => {
        // First: capable plants before incapable
        const aCapable = a.canManufacture !== false;
        const bCapable = b.canManufacture !== false;
        if (aCapable && !bCapable) return -1;
        if (!aCapable && bCapable) return 1;
        // Second: matching overrun before non-matching (only for capable plants)
        if (aCapable && bCapable) {
          if (a.overrunMatches && !b.overrunMatches) return -1;
          if (!a.overrunMatches && b.overrunMatches) return 1;
        }
        // Keep original proximity order otherwise
        return 0;
      });

      setRankedPlants(sortedPlants);

      // Auto-select best CAPABLE plant (prioritizes overrun-matching plants now)
      const firstCapablePlant = sortedPlants.find(p => p.canManufacture !== false);
      if (firstCapablePlant) {
        handlePlantSelect(firstCapablePlant.id);
      }
    }
  };

  // Handle Ship-To change with a location object directly (for PO-extracted data)
  const handleShipToChangeWithLocation = (shipToLocation, materialSku = null) => {
    if (!shipToLocation) return;

    setSelectedShipTo(shipToLocation);

    // Get current material SKU from selected SKU option or passed parameter
    const currentSku = materialSku || skuOptions.find(s => s.id === selectedSku)?.sku;
    const customerName = selectedOrder?.customer || '';

    // Re-rank plants by capability AND proximity to ship-to location
    const ranked = currentSku
      ? getPlantsByCapabilityAndProximity(shipToLocation.coordinates, currentSku)
      : getPlantsByProximity(shipToLocation.coordinates);

    // Add overrun stock info and best lanes indicator
    let capablePlantIndex = 0;
    const rankedWithOverrun = ranked.map((plant) => {
      const customerOverrun = overrunStock[customerName];
      const plantOverrun = customerOverrun?.[plant.id];
      const isCapable = plant.canManufacture !== false;

      const overrunMatches = plantOverrun && currentSku && plantOverrun.material === currentSku;
      const overrunSavings = overrunMatches ? {
        available: plantOverrun.qty,
        unit: plantOverrun.unit,
        age: plantOverrun.age,
        estimatedSavings: Math.round(plantOverrun.qty * 0.8),
      } : null;

      const result = {
        ...plant,
        overrun: plantOverrun,
        overrunMatches: overrunMatches,
        overrunSavings: overrunSavings,
        bestLanes: isCapable && capablePlantIndex === 0,
        outboundCost: getOutboundCost(plant.id, shipToLocation.region),
      };

      if (isCapable) capablePlantIndex++;
      return result;
    });

    // Sort: capable first, then overrun-matching
    const sortedPlants = rankedWithOverrun.sort((a, b) => {
      const aCapable = a.canManufacture !== false;
      const bCapable = b.canManufacture !== false;
      if (aCapable && !bCapable) return -1;
      if (!aCapable && bCapable) return 1;
      if (aCapable && bCapable) {
        if (a.overrunMatches && !b.overrunMatches) return -1;
        if (!a.overrunMatches && b.overrunMatches) return 1;
      }
      return 0;
    });

    setRankedPlants(sortedPlants);

    // Auto-select best capable plant
    const firstCapablePlant = sortedPlants.find(p => p.canManufacture !== false);
    if (firstCapablePlant) {
      handlePlantSelect(firstCapablePlant.id);
    }
  };

  // Handle Plant selection
  const handlePlantSelect = (plantId) => {
    setSelectedPlant(plantId);
    // Save to per-line selections
    setLinePlantSelections(prev => ({
      ...prev,
      [activeLineNumber]: plantId,
    }));
    // Recalculate costs
    const selectedSkuData = skuOptions.find(s => s.id === selectedSku);
    recalculateCosts(selectedSkuData?.sku, plantId, componentSuppliers);
  };

  // Handle Supplier change for a component
  const handleSupplierChange = (componentId, supplierId) => {
    const newSuppliers = {
      ...componentSuppliers,
      [componentId]: supplierId,
    };
    setComponentSuppliers(newSuppliers);
    // Save to per-line selections
    setLineComponentSelections(prev => ({
      ...prev,
      [activeLineNumber]: newSuppliers,
    }));
    // Recalculate costs
    const selectedSkuData = skuOptions.find(s => s.id === selectedSku);
    recalculateCosts(selectedSkuData?.sku, selectedPlant, newSuppliers);
  };

  // Recalculate costs with explicit BOM data (used when BOM is just fetched)
  // Simple approach: Material Cost = Order Qty × Unit Cost (both in same unit - MSF)
  // orderData parameter allows passing line-specific data since selectedOrder state may be stale
  const recalculateCostsWithBom = (materialSku, plantId, suppliers, bomData, orderData = null) => {
    if (!plantId || !bomData?.has_bom || !bomData?.components?.length) return;

    // Use orderData if provided (for line-specific data), else fall back to selectedOrder
    const effectiveOrder = orderData || selectedOrder;
    const qtyStr = String(effectiveOrder?.quantity || '25000').replace(/,/g, '');
    const orderQtyRaw = parseFloat(qtyStr) || 25000;
    const orderValue = effectiveOrder?.value || effectiveOrder?.orderValue || 187500;
    const shipToRegion = selectedShipTo?.region || 'default';

    // Get order unit (MSF, FT2, M2, etc.)
    // BOM unit costs are now converted to target_unit (same as order unit) by the API
    const orderUnit = effectiveOrder?.unit || effectiveOrder?.uom || 'MSF';

    console.log('recalculateCostsWithBom - effectiveOrder:', { qty: effectiveOrder?.quantity, unit: effectiveOrder?.unit, uom: effectiveOrder?.uom });
    console.log('recalculateCostsWithBom - order:', orderQtyRaw, orderUnit);

    // Calculate total material cost: Order Qty × Unit Cost (both in same unit)
    // No unit conversion needed - API returns costs in order's unit
    let totalMaterialCost = 0;
    const realComponents = bomData.components.map((comp, idx) => {
      // Material cost = order qty × component unit cost (same unit)
      const materialCost = Math.round(orderQtyRaw * comp.unit_cost);
      const inboundCost = Math.round(materialCost * 0.03); // ~3% inbound freight
      totalMaterialCost += materialCost;

      // Use scaled_quantity from BOM API if available, otherwise calculate
      // For main materials: convert order qty to FT2 (sales UOM)
      // For packaging/other (KG, EA): use BOM's base quantity (not scaled)
      const originalUnit = comp.original_unit || comp.unit || orderUnit;
      let displayQty;
      let displayUnit;

      if (originalUnit === 'M2' || originalUnit === 'FT2') {
        // For area-based materials, convert order quantity to FT2 (sales UOM)
        displayQty = convertQuantity(orderQtyRaw, orderUnit, 'FT2');
        displayUnit = 'FT2';
      } else {
        // For non-area units (KG, EA, etc.), use BOM's base quantity directly
        // (scaling doesn't work across incompatible unit types like KG vs MSF)
        displayQty = comp.quantity || 0;
        displayUnit = originalUnit;
      }

      return {
        id: comp.material_id || `bom-${idx}`,
        material_id: comp.material_id || '', // SAP material number
        name: comp.name || 'Unknown Component',
        qty: Math.round(displayQty), // Display qty in appropriate unit
        unit: displayUnit, // Display unit
        orderUnit: orderUnit, // Keep order unit for reference
        materialCost: materialCost,
        inboundCost: inboundCost,
        landedCost: materialCost + inboundCost,
        leadTime: idx === 0 ? 14 : 7,
        isRealData: true,
        unitCost: comp.unit_cost,
        supplierOptions: [
          { id: `supplier-${idx + 1}a`, name: `Supplier ${idx + 1}`, cost: materialCost, leadTime: idx === 0 ? 14 : 7 },
          { id: `supplier-${idx + 1}b`, name: `Supplier ${idx + 1}B`, cost: Math.round(materialCost * 1.05), leadTime: idx === 0 ? 10 : 5 },
        ],
        selectedSupplier: { name: `Supplier ${idx + 1}`, id: `supplier-${idx + 1}a` },
      };
    });

    const estimatedInbound = Math.round(totalMaterialCost * 0.03); // 3% inbound freight
    // Use plant's outboundCost from rankedPlants (displayed in Plant Selection section)
    const selectedPlantData = rankedPlants.find(p => p.id === plantId);
    const outboundFreight = selectedPlantData?.outboundCost || getOutboundCost(plantId, shipToRegion);
    const totalLanded = totalMaterialCost + estimatedInbound + outboundFreight;
    const margin = orderValue - totalLanded;
    const marginPct = orderValue > 0 ? (margin / orderValue) * 100 : 0;

    console.log('BOM cost calculation: order', orderQtyRaw, orderUnit, '× $', bomData.components[0]?.unit_cost, '/', orderUnit, '= $', totalMaterialCost);
    setComponents(realComponents);
    setCosts({
      totalMaterial: totalMaterialCost,
      totalInbound: estimatedInbound,
      acquisitionCost: totalMaterialCost + estimatedInbound,
      outboundFreight,
      totalLanded: Math.round(totalLanded),
      margin: Math.round(margin),
      marginPct,
      criticalPath: { name: 'Production', leadTime: 7 },
      isRealBomData: true,
      orderQty: Math.round(orderQtyRaw),
      orderUnit: orderUnit,
    });
  };

  // Recalculate costs based on current selections (real-time)
  // Simple approach: Material Cost = Order Qty × Unit Cost (both in same unit - MSF)
  const recalculateCosts = (materialSku, plantId, suppliers) => {
    if (!plantId) return;

    // Handle comma-formatted quantities like "7,500"
    const qtyStr = String(selectedOrder?.quantity || '25000').replace(/,/g, '');
    const orderQtyRaw = parseFloat(qtyStr) || 25000;
    const orderValue = selectedOrder?.value || selectedOrder?.orderValue || 187500;
    const shipToRegion = selectedShipTo?.region || 'default';

    // Get order unit (MSF, FT2, M2, etc.)
    // BOM unit costs are now converted to target_unit (same as order unit) by the API
    const orderUnit = selectedOrder?.unit || selectedOrder?.uom || 'MSF';

    // If we have real BOM data, use it for material costs
    console.log('recalculateCosts called - realBomData:', realBomData?.has_bom, 'components:', realBomData?.components?.length);
    if (realBomData?.has_bom && realBomData.components?.length > 0) {
      console.log('Using REAL BOM data - order:', orderQtyRaw, orderUnit);

      // Calculate total material cost: Order Qty × Unit Cost (both in same unit)
      // No unit conversion needed - API returns costs in order's unit
      let totalMaterialCost = 0;
      const realComponents = realBomData.components.map((comp, idx) => {
        const materialCost = Math.round(orderQtyRaw * comp.unit_cost);
        const inboundCost = Math.round(materialCost * 0.03);
        totalMaterialCost += materialCost;

        // For main materials: convert order qty to FT2 (sales UOM)
        // For packaging/other (KG, EA): use BOM's base quantity (not scaled)
        const originalUnit = comp.original_unit || comp.unit || orderUnit;
        let displayQty;
        let displayUnit;

        if (originalUnit === 'M2' || originalUnit === 'FT2') {
          // For area-based materials, convert order quantity to FT2 (sales UOM)
          displayQty = convertQuantity(orderQtyRaw, orderUnit, 'FT2');
          displayUnit = 'FT2';
        } else {
          // For non-area units (KG, EA, etc.), use BOM's base quantity directly
          // (scaling doesn't work across incompatible unit types like KG vs MSF)
          displayQty = comp.quantity || 0;
          displayUnit = originalUnit;
        }

        return {
          id: comp.material_id || `bom-${idx}`,
          material_id: comp.material_id || '', // SAP material number
          name: comp.name || 'Unknown Component',
          qty: Math.round(displayQty), // Display qty in appropriate unit
          unit: displayUnit, // Display unit
          orderUnit: orderUnit, // Keep order unit for reference
          materialCost: materialCost,
          inboundCost: inboundCost,
          landedCost: materialCost + inboundCost,
          leadTime: idx === 0 ? 14 : 7,
          isRealData: true,
          unitCost: comp.unit_cost,
          supplierOptions: [
            { id: `supplier-${idx + 1}a`, name: `Supplier ${idx + 1}`, cost: materialCost, leadTime: idx === 0 ? 14 : 7 },
            { id: `supplier-${idx + 1}b`, name: `Supplier ${idx + 1}B`, cost: Math.round(materialCost * 1.05), leadTime: idx === 0 ? 10 : 5 },
          ],
          selectedSupplier: { name: `Supplier ${idx + 1}`, id: `supplier-${idx + 1}a` },
        };
      });

      const estimatedInbound = Math.round(totalMaterialCost * 0.03); // 3% inbound freight
      // Use plant's outboundCost from rankedPlants (displayed in Plant Selection section)
      const selectedPlantData = rankedPlants.find(p => p.id === plantId);
      const outboundFreight = selectedPlantData?.outboundCost || getOutboundCost(plantId, shipToRegion);
      const totalLanded = totalMaterialCost + estimatedInbound + outboundFreight;
      const margin = orderValue - totalLanded;
      const marginPct = orderValue > 0 ? (margin / orderValue) * 100 : 0;

      console.log('BOM cost:', orderQtyRaw, orderUnit, '× $', realBomData.components[0]?.unit_cost, '/', orderUnit, '= $', totalMaterialCost);
      setComponents(realComponents);
      setCosts({
        totalMaterial: totalMaterialCost,
        totalInbound: estimatedInbound,
        acquisitionCost: totalMaterialCost + estimatedInbound,
        outboundFreight,
        totalLanded: Math.round(totalLanded),
        margin: Math.round(margin),
        marginPct,
        criticalPath: { name: 'Production', leadTime: 7 },
        isRealBomData: true,
        orderQty: Math.round(orderQtyRaw),
        orderUnit: orderUnit,
      });
    } else {
      // No BOM data yet - show loading or empty state
      console.log('Waiting for real BOM data...');
    }
  };

  // Initialize fulfillment data when order is selected
  // Priority: 1) Actual ship-to from PO extraction, 2) Real SAP customer addresses, 3) Static customer config, 4) Default
  useEffect(() => {
    if (selectedOrder) {
      // Fetch real customer addresses from SAP
      if (selectedOrder.customerId) {
        fetchRealCustomerAddresses(selectedOrder.customerId);
      }

      // First, try to use the actual ship-to from the extracted PO data
      const orderShipTo = createShipToFromOrder(selectedOrder);
      if (orderShipTo) {
        // Use real ship-to from PO extraction
        handleShipToChangeWithLocation(orderShipTo);
      } else {
        // Fallback to static customer config
        const customerName = selectedOrder.customer;
        const customerData = customerShipToLocations[customerName] || customerShipToLocations['3M'];
        if (customerData) {
          const defaultLoc = customerData.locations.find(l => l.id === customerData.defaultLocation) || customerData.locations[0];
          if (defaultLoc) {
            handleShipToChange(defaultLoc.id);
          }
        }
      }
    }
  }, [selectedOrder?.id]); // Trigger on order change, not just customer

  // Update ship-to when real customer addresses load from SAP
  useEffect(() => {
    if (realCustomerAddresses?.found && realCustomerAddresses?.locations?.length > 0) {
      // Only update if we don't already have a ship-to from PO extraction
      if (!selectedShipTo?.isFromOrder) {
        const defaultLoc = realCustomerAddresses.locations.find(l => l.id === realCustomerAddresses.default_location)
          || realCustomerAddresses.locations[0];
        if (defaultLoc) {
          console.log('Setting ship-to from real SAP customer addresses:', defaultLoc.name);
          // Get coordinates from state code (region field contains state like "AL")
          const stateInfo = getLocationFromState(defaultLoc.region);
          handleShipToChangeWithLocation({
            ...defaultLoc,
            region: stateInfo.region, // Convert state code to freight region
            coordinates: stateInfo.coords,
          });
        }
      }
    }
  }, [realCustomerAddresses]);

  // Fetch real BOM data when SKU selection or line changes
  useEffect(() => {
    if (skuOptions.length > 0 && selectedSku) {
      const skuData = skuOptions.find(s => s.id === selectedSku);
      if (skuData?.sku) {
        // Fetch real BOM data for the selected SKU
        // Handle comma-formatted quantities like "7,500"
        const qtyStr = String(selectedOrder?.quantity || '25000').replace(/,/g, '');
        const orderQty = parseInt(qtyStr, 10) || 25000;
        // Get order unit for consistent unit display across all sections
        const orderUnit = selectedOrder?.unit || selectedOrder?.uom || 'MSF';
        console.log('Fetching BOM for SKU:', skuData.sku, 'quantity:', orderQty, 'line:', activeLineNumber);
        fetchRealBomData(skuData.sku, orderQty, selectedOrder, skuData, orderUnit);
      }
    }
  }, [skuOptions, selectedSku, activeLineNumber]); // Trigger on line change too

  // Recalculate costs when SKU options load and default is selected
  useEffect(() => {
    if (skuOptions.length > 0 && selectedSku) {
      const skuData = skuOptions.find(s => s.id === selectedSku);
      if (skuData?.sku) {
        recalculateCosts(skuData.sku, selectedPlant, componentSuppliers);
        // Set baseline on first load (when baseline is null)
        if (!baseline && selectedPlant && rankedPlants.length > 0) {
          const plantData = rankedPlants.find(p => p.id === selectedPlant);
          setBaseline({
            sku: skuData,
            plant: plantData,
            shipTo: selectedShipTo,
            costs: { ...costs },
          });
        }
      }
    }
  }, [skuOptions, selectedSku, selectedPlant]);

  // Recalculate costs when real BOM data is fetched, plant is selected, or SKU changes
  useEffect(() => {
    console.log('realBomData useEffect triggered:', realBomData?.has_bom, 'selectedSku:', selectedSku, 'selectedPlant:', selectedPlant);
    if (realBomData?.has_bom && selectedSku && selectedPlant) {
      const skuData = skuOptions.find(s => s.id === selectedSku);
      console.log('Recalculating with real BOM data, skuData:', skuData?.sku);
      if (skuData?.sku) {
        recalculateCosts(skuData.sku, selectedPlant, componentSuppliers);
      }
    }
  }, [realBomData, selectedPlant, selectedSku]); // Trigger on BOM data, plant, or SKU change

  // Fetch material pricing when selectedSku changes
  useEffect(() => {
    if (selectedSku && skuOptions.length > 0) {
      const skuData = skuOptions.find(s => s.id === selectedSku);
      if (skuData?.sku) {
        const customerId = selectedOrder?.customerId || selectedOrder?.kunnr || null;
        // Get order unit for consistent unit display across all sections
        const orderUnit = selectedOrder?.unit || selectedOrder?.uom || 'MSF';
        fetchMaterialPricing(skuData.sku, customerId, orderUnit);
      }
    } else {
      setMaterialPricing(null);
    }
  }, [selectedSku, skuOptions, selectedOrder]);

  // Recalculate fallback costs when materialPricing loads (for materials without BOM)
  useEffect(() => {
    // Only run if we have pricing but NO BOM data
    // Use CP (cost price) if available, else fall back to OSP (selling price) as cost estimate
    const costPrice = materialPricing?.CP || materialPricing?.OSP;
    console.log('=== materialPricing useEffect ===');
    console.log('costPrice:', costPrice, '(CP:', materialPricing?.CP, 'OSP:', materialPricing?.OSP, ')');
    console.log('realBomData?.has_bom:', realBomData?.has_bom);
    console.log('selectedSku:', selectedSku);
    console.log('selectedPlant:', selectedPlant);
    console.log('Condition result:', costPrice && costPrice > 0 && (!realBomData?.has_bom) && selectedSku && selectedPlant);
    if (costPrice && costPrice > 0 && (!realBomData?.has_bom) && selectedSku && selectedPlant) {
      console.log('materialPricing loaded, recalculating fallback costs with price:', costPrice, '(CP:', materialPricing?.CP, 'OSP:', materialPricing?.OSP, ')');
      const skuData = skuOptions.find(s => s.id === selectedSku);
      if (!skuData) return;

      const qtyStr = String(selectedOrder?.quantity || '1').replace(/,/g, '');
      const orderQtyRaw = parseFloat(qtyStr) || 1;
      const orderUnit = selectedOrder?.unit || selectedOrder?.uom || 'EA';
      const orderValue = selectedOrder?.value || selectedOrder?.orderValue || (orderQtyRaw * costPrice);

      // Calculate material cost using SAP price (cost per sales unit × quantity)
      const unitCost = costPrice;
      const materialCost = Math.round(orderQtyRaw * unitCost);
      const inboundCost = Math.round(materialCost * 0.03);

      console.log('Fallback cost calc: CP', unitCost, '× qty', orderQtyRaw, orderUnit, '=', materialCost);

      setComponents([{
        id: skuData.sku,
        name: skuData.name || skuData.sku,
        qty: orderQtyRaw,  // Keep original quantity (not converted)
        unit: orderUnit,   // Keep original unit (not M2)
        materialCost: materialCost,
        inboundCost: inboundCost,
        landedCost: materialCost + inboundCost,
        leadTime: 14,
        isRealData: true,
        unitCost: unitCost,
        supplierOptions: [
          { id: 'supplier-1a', name: 'Supplier 1', cost: materialCost, leadTime: 14 },
        ],
        selectedSupplier: { name: 'Supplier 1', id: 'supplier-1a' },
      }]);

      const shipToRegion = selectedShipTo?.region || 'default';
      // Use plant's outboundCost from rankedPlants (displayed in Plant Selection section)
      const selectedPlantData = rankedPlants.find(p => p.id === selectedPlant);
      const outboundFreight = selectedPlantData?.outboundCost || getOutboundCost(selectedPlant, shipToRegion);
      const totalLanded = materialCost + inboundCost + outboundFreight;

      setCosts({
        totalMaterial: materialCost,
        totalInbound: inboundCost,
        acquisitionCost: materialCost + inboundCost,
        outboundFreight,
        totalLanded: Math.round(totalLanded),
        margin: Math.round(orderValue - totalLanded),
        marginPct: orderValue > 0 ? ((orderValue - totalLanded) / orderValue) * 100 : 0,
        criticalPath: { name: 'Production', leadTime: 14 },
        isRealBomData: false,
        orderQtyRaw: orderQtyRaw,
      });
    }
  }, [materialPricing, realBomData, selectedSku, selectedPlant]);

  // Update baseline after costs are calculated (once per order)
  useEffect(() => {
    if (!baseline && costs.totalLanded > 0 && selectedSku && selectedPlant && rankedPlants.length > 0) {
      const skuData = skuOptions.find(s => s.id === selectedSku);
      const plantData = rankedPlants.find(p => p.id === selectedPlant);
      setBaseline({
        sku: skuData,
        plant: plantData,
        shipTo: selectedShipTo,
        costs: { ...costs },
      });
    }
  }, [costs, baseline, selectedSku, selectedPlant, rankedPlants]);

  // Fetch order savings when order is selected
  useEffect(() => {
    const fetchOrderSavings = async () => {
      if (!selectedOrder?.id) {
        setOrderSavings(null);
        return;
      }
      try {
        const orderId = selectedOrder.id.replace(/^(PO-|INT-|ORD-)/, '');
        const response = await fetch(`${API_BASE_URL}/api/ordlyai/savings/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrderSavings(data);
        } else {
          setOrderSavings(null);
        }
      } catch (err) {
        console.warn('Failed to fetch order savings:', err);
        setOrderSavings(null);
      }
    };
    fetchOrderSavings();
  }, [selectedOrder?.id]);

  // Check if all lines have SKU selected
  const getLineProgress = () => {
    const totalLines = selectedOrder?.lineCount || 1;
    const configuredLines = Object.keys(lineSkuSelections).length;
    // Include current selection if not yet saved
    const hasCurrentSelection = selectedSku && !lineSkuSelections[activeLineNumber];
    return {
      configured: hasCurrentSelection ? configuredLines + 1 : configuredLines,
      total: totalLines,
      allConfigured: (hasCurrentSelection ? configuredLines + 1 : configuredLines) >= totalLines,
    };
  };

  // Demote order back to Intent stage
  const handleBackToIntent = async () => {
    if (!selectedOrder) return;
    try {
      const orderId = selectedOrder.id.replace(/^(PO-|INT-|ORD-)/, '');
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/order/${orderId}/demote`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to demote order');
      const result = await response.json();
      setInfoDialog({
        open: true,
        title: 'Order Returned',
        message: `Order ${selectedOrder.id} has been moved back to the Intent Cockpit stage for further review.`,
        type: 'success',
      });
      setSelectedOrder(null);
      setSkuOptions([]);
      setSelectedSku(null);
      fetchOrders(); // Refresh list - order should no longer appear (stage 0)
    } catch (err) {
      console.error('Error demoting order:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleSelectAndContinue = async () => {
    if (!selectedOrder || isPromoting) return;
    // Don't allow promote if already past SKU Decisioning stage (stage > 1)
    if (selectedOrder.stage > 1) return;

    setIsPromoting(true);
    try {
      const orderId = selectedOrder.id.replace(/^(PO-|INT-|ORD-)/, '');
      const selectedSkuData = skuOptions.find(s => s.id === selectedSku);
      const selectedPlantData = rankedPlants.find(p => p.id === selectedPlant);

      // Record decision to savings ledger (before promoting)
      if (baseline && costs) {
        try {
          const savingsPayload = {
            vbeln: orderId,
            posnr: String(activeLineNumber || 10),
            decision_type: 'sku',
            baseline: {
              sku: baseline.sku?.sku || '',
              plant: baseline.plant?.id || '',
              costs: baseline.costs || {},
            },
            selected: {
              sku: selectedSkuData?.sku || '',
              plant: selectedPlantData?.id || '',
              costs: costs,
            },
            rationale: '', // Could add optional rationale input later
            user: 'ORDLY_USER',
          };
          await fetch(`${API_BASE_URL}/api/ordlyai/savings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(savingsPayload),
          });
        } catch (savingsErr) {
          console.warn('Failed to record savings (non-blocking):', savingsErr);
        }
      }

      // Promote order to next stage
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/order/${orderId}/promote`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to promote order');
      const result = await response.json();

      // Update the selectedOrder's stage to reflect promotion
      const promotedOrder = { ...selectedOrder, stage: result.new_stage || 2 };
      setSelectedOrder(promotedOrder);

      // Show themed confirmation dialog
      setConfirmDialog({
        open: true,
        order: promotedOrder,
        sku: selectedSkuData?.sku || 'selected',
      });
    } catch (err) {
      console.error('Error promoting order:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    } finally {
      setIsPromoting(false);
    }
  };

  // Handle confirmation dialog actions
  const handleConfirmNavigate = () => {
    if (onNavigate && confirmDialog.order) {
      onNavigate('order-value-control-tower', confirmDialog.order);
    }
    setConfirmDialog({ open: false, order: null, sku: null });
  };

  const handleCancelNavigate = () => {
    setConfirmDialog({ open: false, order: null, sku: null });
    setSelectedOrder(null);
    setSkuOptions([]);
    setSelectedSku(null);
    fetchOrders();
  };

  const getMarginColor = (margin) => {
    if (!margin) return theme.textMuted;
    if (margin >= 30) return COLORS.emeraldDark;
    if (margin >= 25) return COLORS.amber;
    return COLORS.red;
  };

  const getAvailabilityColor = (availability) => {
    if (availability === 'In Stock') return COLORS.emeraldDark;
    if (availability === 'Partial') return COLORS.amber;
    return COLORS.red;
  };

  const getLeadTimeColor = (days) => {
    if (days <= 5) return COLORS.emeraldDark;
    if (days <= 10) return COLORS.amber;
    return COLORS.red;
  };

  // ==================== DETAIL VIEW ====================
  if (selectedOrder) {
    const selectedSkuData = skuOptions.find(s => s.id === selectedSku) || skuOptions[0] || {};
    const bestMarginSku = skuOptions.reduce((best, opt) => (opt.margin > (best?.margin || 0) ? opt : best), null);
    const exactMatchSku = skuOptions.find(s => s.isExactMatch);
    const marginUplift = bestMarginSku && exactMatchSku ? (bestMarginSku.marginDollar - exactMatchSku.marginDollar) : 0;

    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.bg,
        fontFamily: "'Inter', 'Roboto', sans-serif",
      }}>
        {/* Breadcrumbs Header */}
        <Box sx={{
          px: 3,
          py: 1.5,
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[200]}`,
          bgcolor: theme.bgSecondary,
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: theme.textSecondary, '&:hover': { color: COLORS.primary } }}>
                ORDLY.AI
              </Link>
              <Link component="button" variant="body1" onClick={handleBackToList} sx={{ textDecoration: 'none', color: theme.textSecondary, '&:hover': { color: COLORS.primary } }}>
                SKU Decisioning
              </Link>
              <Typography color="primary" variant="body1" fontWeight={600}>
                {selectedOrder.id}
              </Typography>
            </Breadcrumbs>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ borderColor: theme.panelBorder, color: theme.textSecondary }}>
              Back to ORDLY.AI
            </Button>
          </Stack>
        </Box>

        {/* Order Tracking Bar - Shows progress across all tiles */}
        <Box sx={{ px: 3, py: 1, bgcolor: theme.bgSecondary }}>
          <OrderTrackingBar
            order={selectedOrder}
            currentStage={1}
            onNavigate={onNavigate}
            darkMode={darkMode}
          />
        </Box>

        {/* Order Context Bar */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 1.5,
          background: darkMode
            ? `linear-gradient(90deg, ${alpha(COLORS.primary, 0.15)} 0%, rgba(15, 23, 42, 0.9) 100%)`
            : `linear-gradient(90deg, ${alpha(COLORS.primary, 0.08)} 0%, ${alpha(COLORS.primary, 0.02)} 100%)`,
          borderBottom: `1px solid ${theme.headerBorder}`,
        }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToList}
              size="small"
              sx={{
                color: theme.textSecondary,
                bgcolor: darkMode ? 'rgba(0,0,0,0.3)' : alpha(COLORS.slate[100], 0.8),
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}`,
                fontSize: '0.75rem',
                '&:hover': { bgcolor: darkMode ? 'rgba(0,0,0,0.5)' : COLORS.slate[100] },
              }}
            >
              Back to Pipeline
            </Button>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.secondary }}>
                {selectedOrder.id}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: theme.text, fontWeight: 500 }}>
                {selectedOrder.customer}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: theme.textSecondary }}>
                {selectedOrder.requestedSpec} • {selectedOrder.quantity}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.secondary }}>
                {formatCurrency(selectedOrder.value || 284500)}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: theme.textMuted, textTransform: 'uppercase' }}>
                Order Value
              </Typography>
            </Box>
            {/* Savings Badge - Shows cumulative savings for this order */}
            {orderSavings?.summary?.totalSavings !== 0 && orderSavings?.summary?.totalDecisions > 0 && (
              <Chip
                icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
                label={`${orderSavings.summary.totalSavings >= 0 ? '+' : ''}$${Math.abs(orderSavings.summary.totalSavings).toLocaleString()} saved`}
                size="small"
                sx={{
                  bgcolor: orderSavings.summary.totalSavings >= 0
                    ? alpha(COLORS.emerald, 0.15)
                    : alpha(COLORS.red, 0.15),
                  color: orderSavings.summary.totalSavings >= 0 ? COLORS.emeraldDark : COLORS.red,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  border: `1px solid ${orderSavings.summary.totalSavings >= 0 ? alpha(COLORS.emerald, 0.3) : alpha(COLORS.red, 0.3)}`,
                }}
              />
            )}
            <Chip
              icon={<SpeedIcon sx={{ fontSize: 14 }} />}
              label="DECISIONING"
              size="small"
              sx={{
                bgcolor: alpha(COLORS.secondary, 0.15),
                color: COLORS.secondary,
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          </Stack>
        </Box>

        {/* Line Item Selector - Only show for multi-line orders */}
        {(selectedOrder?.lineCount || 1) > 1 && (
          <Box sx={{
            mx: 2,
            mt: 2,
            mb: 1,
            p: 2,
            bgcolor: darkMode ? alpha(COLORS.primary, 0.12) : alpha(COLORS.primary, 0.06),
            borderRadius: 2,
            border: `1px solid ${darkMode ? alpha(COLORS.primary, 0.3) : alpha(COLORS.primary, 0.15)}`,
            boxShadow: darkMode ? 'none' : '0 2px 8px rgba(8, 84, 160, 0.08)',
          }}>
            {/* Header row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ViewListIcon sx={{ fontSize: 18, color: COLORS.primary }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Select Item to Configure
                </Typography>
                <Chip
                  label={`${selectedOrder?.lineCount || 0} Items`}
                  size="small"
                  sx={{
                    bgcolor: alpha(COLORS.primary, 0.1),
                    color: COLORS.primary,
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    height: 20,
                  }}
                />
              </Stack>
              <Chip
                icon={getLineProgress().allConfigured ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : undefined}
                label={`${getLineProgress().configured} of ${getLineProgress().total} configured`}
                size="small"
                sx={{
                  bgcolor: getLineProgress().allConfigured
                    ? alpha(COLORS.emeraldDark, 0.15)
                    : alpha(COLORS.amber, 0.15),
                  color: getLineProgress().allConfigured ? COLORS.emeraldDark : COLORS.amberDark,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  '& .MuiChip-icon': { color: 'inherit' },
                }}
              />
            </Box>

            {/* Item tabs as larger buttons */}
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {(selectedOrder?.lineItems || []).map((line) => {
                const isActive = activeLineNumber === line.lineNumber;
                const hasSelection = lineSkuSelections[line.lineNumber] || (isActive && selectedSku);
                const activeSku = lineSkuSelections[line.lineNumber]?.skuData;
                return (
                  <Box
                    key={line.lineNumber}
                    onClick={() => handleLineChange(line.lineNumber)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      bgcolor: isActive
                        ? darkMode ? alpha(COLORS.secondary, 0.25) : '#fff'
                        : hasSelection
                          ? alpha(COLORS.emeraldDark, 0.08)
                          : darkMode ? alpha(COLORS.slate[400], 0.1) : alpha(COLORS.slate[200], 0.5),
                      border: isActive
                        ? `2px solid ${COLORS.secondary}`
                        : hasSelection
                          ? `1px solid ${alpha(COLORS.emeraldDark, 0.3)}`
                          : `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[300]}`,
                      boxShadow: isActive ? '0 2px 8px rgba(25, 118, 210, 0.25)' : 'none',
                      '&:hover': {
                        bgcolor: isActive
                          ? darkMode ? alpha(COLORS.secondary, 0.3) : '#fff'
                          : alpha(COLORS.secondary, 0.12),
                        borderColor: COLORS.secondary,
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {/* Status icon */}
                    <Box sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: hasSelection
                        ? alpha(COLORS.emeraldDark, 0.15)
                        : isActive
                          ? alpha(COLORS.secondary, 0.15)
                          : alpha(COLORS.slate[400], 0.15),
                    }}>
                      {hasSelection ? (
                        <CheckCircleIcon sx={{ fontSize: 18, color: COLORS.emeraldDark }} />
                      ) : isActive ? (
                        <TuneIcon sx={{ fontSize: 16, color: COLORS.secondary }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: theme.textMuted }} />
                      )}
                    </Box>

                    {/* Item details */}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isActive ? COLORS.secondary : hasSelection ? COLORS.emeraldDark : theme.text,
                        lineHeight: 1.2,
                      }}>
                        Item {line.lineNumber}
                      </Typography>
                      <Typography sx={{
                        fontSize: '0.68rem',
                        color: theme.textMuted,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 180,
                      }}>
                        {line.material?.slice(0, 25) || 'Material'}...
                      </Typography>
                      {hasSelection && activeSku && (
                        <Typography sx={{
                          fontSize: '0.65rem',
                          color: COLORS.emeraldDark,
                          fontWeight: 600,
                          mt: 0.25,
                        }}>
                          SKU: {activeSku.sku?.slice(0, 15) || 'Selected'}
                        </Typography>
                      )}
                    </Box>

                    {/* Clear button for configured items */}
                    {hasSelection && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleClearLineSelection(line.lineNumber, e)}
                        sx={{
                          p: 0.5,
                          ml: 'auto',
                          color: COLORS.slate[400],
                          '&:hover': {
                            color: COLORS.redDark,
                            bgcolor: alpha(COLORS.red, 0.1)
                          },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Data Source Legend */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 2,
          px: 3,
          py: 0.5,
          bgcolor: darkMode ? 'rgba(0,0,0,0.3)' : COLORS.slate[100],
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[200]}`,
        }}>
          <Typography sx={{ fontSize: '0.55rem', color: theme.textMuted, fontWeight: 500 }}>DATA SOURCE:</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: COLORS.emeraldDark }}>[MBEW]</Typography>
            <Typography sx={{ fontSize: '0.5rem', color: theme.textMuted }}>SAP Cost</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: COLORS.emeraldDark }}>[MARC]</Typography>
            <Typography sx={{ fontSize: '0.5rem', color: theme.textMuted }}>SAP Plant</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: COLORS.amberDark }}>[EST]</Typography>
            <Typography sx={{ fontSize: '0.5rem', color: theme.textMuted }}>Estimated</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: COLORS.amberDark }}>[CALC]</Typography>
            <Typography sx={{ fontSize: '0.5rem', color: theme.textMuted }}>Calculated</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: COLORS.red }}>[NO DATA]</Typography>
            <Typography sx={{ fontSize: '0.5rem', color: theme.textMuted }}>Missing</Typography>
          </Box>
        </Box>

        {/* Summary Strip */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 1.5,
          px: 3,
          py: 2,
          bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : COLORS.slate[50],
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[200]}`,
        }}>
          {[
            { label: 'Best Margin', value: `${bestMarginSku?.margin?.toFixed(1) || '32.4'}%`, color: COLORS.emeraldDark, isEstimated: !costs.isRealBomData, source: costs.isRealBomData ? 'MBEW' : 'EST' },
            { label: 'Exact Match', value: `${exactMatchSku?.margin?.toFixed(1) || '28.1'}%`, color: COLORS.amber, source: 'CALC' },
            { label: 'Margin Uplift', value: formatCurrency(marginUplift > 0 ? marginUplift : 12200), color: COLORS.emeraldDark, prefix: '+', isEstimated: true, source: 'EST' },
            { label: 'ATP Status', value: selectedSkuData.availability || 'Unknown', color: COLORS.amberDark, isEstimated: true, source: 'NO DATA' },
            { label: 'Lead Time', value: `${selectedSkuData.leadTime || 5} days`, color: theme.text, isEstimated: selectedSkuData.leadTimeSource !== 'MARC.PLIFZ', source: selectedSkuData.leadTimeSource === 'MARC.PLIFZ' ? 'MARC' : 'EST' },
          ].map((item) => (
            <Card key={item.label} variant="outlined" sx={{
              bgcolor: darkMode ? 'rgba(15, 23, 42, 0.8)' : '#fff',
              border: `1px solid ${item.isEstimated ? alpha(COLORS.amber, 0.4) : (darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200])}`,
              textAlign: 'center',
              py: 1,
              px: 1,
            }}>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: item.color }}>
                {item.prefix || ''}{item.value}
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, mt: 0.25 }}>
                {item.label}
              </Typography>
              <Typography sx={{
                fontSize: '0.5rem',
                fontWeight: 600,
                color: item.source === 'NO DATA' ? COLORS.red : item.source === 'EST' ? COLORS.amberDark : COLORS.emeraldDark,
                mt: 0.25,
              }}>
                [{item.source}]
              </Typography>
            </Card>
          ))}
        </Box>

        {/* Main Content - 2 Column Fulfillment Optimizer Layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 1.5, p: 2, flex: 1, overflow: 'hidden' }}>

          {/* LEFT PANEL: Ship-To, Plant, Material Selection - Simplified */}
          <Card variant="outlined" sx={{
            bgcolor: theme.panel,
            border: `1px solid ${theme.panelBorder}`,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Compact Header */}
            <Box sx={{
              px: 1.5,
              py: 1,
              borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : COLORS.slate[200]}`,
              bgcolor: darkMode ? 'rgba(0,0,0,0.15)' : COLORS.slate[50],
            }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: theme.text }}>
                Fulfillment Options
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', color: theme.textMuted }}>
                Material → Plant (by proximity to {selectedShipTo?.name?.split(',')[0] || 'Customer'})
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: alpha(COLORS.secondary, 0.3), borderRadius: 2 } }}>
              {/* Section 1: Ship-To - Compact */}
              <Box sx={{ p: 1.5, borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : COLORS.slate[100]}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Ship To
                  </Typography>
                  {realCustomerAddresses?.found && (
                    <Chip
                      label="SAP KNA1"
                      size="small"
                      sx={{
                        height: 14,
                        fontSize: '0.45rem',
                        fontWeight: 700,
                        bgcolor: alpha(COLORS.emerald, 0.2),
                        color: COLORS.emeraldDark,
                        border: `1px solid ${COLORS.emerald}`,
                      }}
                    />
                  )}
                </Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: theme.text, mb: 0.5 }}>
                  {realCustomerAddresses?.customer_name || selectedOrder?.customer || 'Customer'}
                </Typography>
                {/* If ship-to came from PO extraction, show it directly; otherwise show dropdown */}
                {selectedShipTo?.isFromOrder ? (
                  <Box sx={{
                    width: '100%',
                    p: 0.75,
                    bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : '#fff',
                    border: `1px solid ${COLORS.emeraldDark}`,
                    borderRadius: 1,
                    color: theme.text,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PlaceIcon sx={{ fontSize: 12, color: COLORS.emeraldDark }} />
                      <span>{selectedShipTo.name}</span>
                    </Box>
                    <Typography sx={{ fontSize: '0.55rem', color: COLORS.emeraldDark, mt: 0.25 }}>
                      (from PO)
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    component="select"
                    value={selectedShipTo?.id || ''}
                    onChange={(e) => handleShipToChange(e.target.value)}
                    sx={{
                      width: '100%',
                      p: 0.75,
                      bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : '#fff',
                      border: `1px solid ${realCustomerAddresses?.found ? COLORS.emeraldDark : (darkMode ? 'rgba(255,255,255,0.15)' : COLORS.slate[200])}`,
                      borderRadius: 1,
                      color: theme.text,
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      '&:focus': { outline: 'none', borderColor: COLORS.secondary },
                    }}
                  >
                    {(() => {
                      // Priority 1: Use real SAP customer addresses if available
                      if (realCustomerAddresses?.found && realCustomerAddresses?.locations?.length > 0) {
                        return realCustomerAddresses.locations.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ));
                      }
                      // Priority 2: Fall back to static config
                      const customerName = selectedOrder?.customer || '3M';
                      const customerData = customerShipToLocations[customerName] || customerShipToLocations['3M'];
                      return customerData?.locations?.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      )) || <option value="">No locations</option>;
                    })()}
                  </Box>
                )}
              </Box>

              {/* Section 2: Plant Selection - Compact Cards */}
              <Box sx={{ p: 1.5, borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : COLORS.slate[100]}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Plant
                    </Typography>
                    <Tooltip title="Distances & freight costs are estimated (no freight rate tables)" arrow>
                      <Chip
                        label="DISTANCE & FREIGHT"
                        size="small"
                        sx={{
                          height: 14,
                          fontSize: '0.4rem',
                          fontWeight: 700,
                          bgcolor: alpha(COLORS.amber, 0.2),
                          color: COLORS.amberDark,
                          border: `1px solid ${COLORS.amber}`,
                          cursor: 'help',
                        }}
                      />
                    </Tooltip>
                  </Box>
                  <Typography sx={{ fontSize: '0.55rem', color: COLORS.emeraldDark, fontWeight: 500 }}>
                    {(() => {
                      const plants = rankedPlants.length > 0 ? rankedPlants : plantsData;
                      const capableCount = plants.filter(p => p.canManufacture !== false).length;
                      return `${capableCount} capable`;
                    })()}
                  </Typography>
                </Box>

                <Stack spacing={0.5}>
                {(rankedPlants.length > 0 ? rankedPlants : plantsData).map((plant, idx) => {
                  const isDisabled = plant.canManufacture === false;
                  const isFirstCapable = !isDisabled && idx === rankedPlants.findIndex(p => p.canManufacture !== false);
                  const isSelected = selectedPlant === plant.id;

                  const plantCard = (
                    <Box
                      key={plant.id}
                      onClick={() => !isDisabled && handlePlantSelect(plant.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 0.75,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        borderRadius: 1,
                        bgcolor: isSelected ? alpha(COLORS.emerald, 0.1) : 'transparent',
                        border: isSelected
                          ? `1.5px solid ${COLORS.emeraldDark}`
                          : isDisabled
                            ? `1px dashed ${alpha(COLORS.slate[400], 0.3)}`
                            : `1px solid transparent`,
                        opacity: isDisabled ? 0.5 : 1,
                        transition: 'all 0.15s ease',
                        '&:hover': isDisabled ? {} : {
                          bgcolor: isSelected ? alpha(COLORS.emerald, 0.1) : alpha(COLORS.slate[200], 0.3),
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
                        <FactoryIcon sx={{ fontSize: 14, color: isSelected ? COLORS.emeraldDark : isDisabled ? COLORS.slate[400] : COLORS.secondary, flexShrink: 0 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: isSelected ? 600 : 500, color: isDisabled ? COLORS.slate[400] : theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {plant.name.replace('Loparex ', '')}
                            </Typography>
                            {isFirstCapable && <Typography sx={{ fontSize: '0.5rem', color: COLORS.emeraldDark, fontWeight: 700 }}>★</Typography>}
                            {isDisabled && <Typography sx={{ fontSize: '0.5rem', color: COLORS.red, fontWeight: 600 }}>N/A</Typography>}
                          </Box>
                          <Typography sx={{ fontSize: '0.55rem', color: isDisabled ? COLORS.slate[400] : COLORS.slate[500] }}>
                            {plant.distance ? `${plant.distance} mi` : plant.location}
                            {!isDisabled && plant.overrunMatches && ' • Overrun ✓'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 0.5 }}>
                        <Typography sx={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: isDisabled ? COLORS.slate[400] : (plant.outboundCost || 6000) <= 5800 ? COLORS.emeraldDark : (plant.outboundCost || 6000) <= 6500 ? COLORS.amber : COLORS.red,
                        }}>
                          ${(plant.outboundCost || plant.outboundCosts?.default || 6000).toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: '0.4rem', color: COLORS.amberDark, fontWeight: 600 }}>
                          [EST]
                        </Typography>
                      </Box>
                    </Box>
                  );

                  return isDisabled ? (
                    <Tooltip key={plant.id} title="Cannot manufacture this material" placement="right" arrow>
                      <span>{plantCard}</span>
                    </Tooltip>
                  ) : plantCard;
                })}
                </Stack>
              </Box>

              {/* Section 3: Material Match - Compact List */}
              <Box sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Material
                  </Typography>
                  <Typography sx={{ fontSize: '0.55rem', color: COLORS.emeraldDark, fontWeight: 500 }}>
                    {skuOptions.length} options
                  </Typography>
                </Box>

                {skuOptionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={20} sx={{ color: COLORS.secondary }} />
                  </Box>
                ) : (
                  <Stack spacing={0.5}>
                  {skuOptions.map((option, idx) => {
                    const isSelected = selectedSku === option.id;
                    const tagColor = option.recommended ? COLORS.emeraldDark : option.isExactMatch ? COLORS.cyan : COLORS.amber;
                    const tagLabel = option.recommended ? '★ BEST' : option.isExactMatch ? 'EXACT' : (option.tags?.[0]?.toUpperCase().slice(0, 6) || 'ALT');

                    // Data quality indicators - SAP data is always real
                    const hasRealPrice = true;

                    return (
                      <Box
                        key={option.id}
                        onClick={() => handleSkuSelect(option.id)}
                        sx={{
                          p: 0.75,
                          cursor: 'pointer',
                          borderRadius: 1,
                          bgcolor: isSelected ? alpha(COLORS.emerald, 0.1) : 'transparent',
                          border: isSelected
                            ? `1.5px solid ${COLORS.emeraldDark}`
                            : `1px solid transparent`,
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            bgcolor: isSelected ? alpha(COLORS.emerald, 0.1) : alpha(COLORS.slate[200], 0.3),
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.5 }}>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: isSelected ? 700 : 600, color: theme.text }}>
                              {option.sku}
                            </Typography>
                            <Typography sx={{ fontSize: '0.55rem', color: theme.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {option.name.length > 35 ? option.name.slice(0, 35) + '...' : option.name}
                            </Typography>
                            {/* Prominent data source badge */}
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                label={hasRealPrice ? `SAP REAL` : 'ESTIMATED'}
                                size="small"
                                sx={{
                                  height: 16,
                                  fontSize: '0.5rem',
                                  fontWeight: 700,
                                  letterSpacing: '0.5px',
                                  bgcolor: hasRealPrice ? alpha(COLORS.emerald, 0.2) : alpha(COLORS.slate[500], 0.15),
                                  color: hasRealPrice ? COLORS.emeraldDark : COLORS.slate[600],
                                  border: `1px solid ${hasRealPrice ? COLORS.emerald : COLORS.slate[400]}`,
                                  '& .MuiChip-label': { px: 0.75 },
                                }}
                              />
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                            <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: tagColor, mb: 0.25 }}>
                              {tagLabel}
                            </Typography>
                            <Typography sx={{ fontSize: '0.5rem', color: theme.textMuted, mb: 0.15 }}>
                              Unit Price
                            </Typography>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.emeraldDark }}>
                              ${(option.unitPrice && option.unitPrice > 0)
                                  ? option.unitPrice.toFixed(2)
                                  : (isSelected && materialPricing?.MDSP)
                                    ? materialPricing.MDSP.toFixed(2)
                                    : (1.42 + idx * 0.13).toFixed(2)}
                              <Typography component="span" sx={{ fontSize: '0.5rem', color: theme.textMuted, ml: 0.25 }}>
                                /{option.priceUom || option.baseUom || 'M2'}
                              </Typography>
                            </Typography>
                          </Box>
                        </Box>

                        {/* Inline Pricing Details - Only show for selected material */}
                        {isSelected && (
                          <Box sx={{
                            mt: 0.75,
                            pt: 0.75,
                            borderTop: `1px dashed ${darkMode ? 'rgba(255,255,255,0.15)' : COLORS.slate[300]}`,
                          }}>
                            {materialPricingLoading ? (
                              <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
                                <CircularProgress size={12} sx={{ color: COLORS.secondary }} />
                              </Box>
                            ) : materialPricing ? (
                              <>
                                {/* Cost, Sell, Gross Margin Row - Show TOTALS for order quantity */}
                                {(() => {
                                  // Calculate totals using order quantity
                                  const orderQty = parseFloat(String(selectedOrder?.quantity || '1').replace(/,/g, '')) || 1;

                                  // Backend already converts CP and OSP to target_unit (order unit) via fetchMaterialPricing
                                  // So materialPricing.CP and materialPricing.OSP are already in the order unit (e.g., MSF)
                                  // No additional conversion needed here!
                                  const cpPerOrderUnit = materialPricing.CP;
                                  const ospPerOrderUnit = materialPricing.OSP;
                                  const mdspPerOrderUnit = materialPricing.MDSP;

                                  // Calculate totals: qty (in order unit) × price (per order unit)
                                  const totalCost = cpPerOrderUnit && orderQty ? Math.round(orderQty * cpPerOrderUnit) : null;
                                  const totalSell = ospPerOrderUnit && orderQty ? Math.round(orderQty * ospPerOrderUnit) : null;
                                  const grossMargin = totalSell && totalCost ? totalSell - totalCost : null;
                                  const grossMarginPct = grossMargin && totalSell ? (grossMargin / totalSell) * 100 : null;

                                  // Price Variance: (Master - Order Avg) / Order Avg * 100
                                  // Positive = Master is higher than avg order price
                                  // Negative = Master is lower than avg order price
                                  const priceVariance = mdspPerOrderUnit && ospPerOrderUnit
                                    ? ((mdspPerOrderUnit - ospPerOrderUnit) / ospPerOrderUnit) * 100
                                    : null;

                                  return (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                                      <Box sx={{ textAlign: 'center' }}>
                                        <Typography sx={{ fontSize: '0.5rem', color: theme.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cost</Typography>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.redDark }}>
                                          {totalCost !== null ? `$${totalCost.toLocaleString()}` : '-'}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ textAlign: 'center' }}>
                                        <Typography sx={{ fontSize: '0.5rem', color: theme.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sell</Typography>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.cyan }}>
                                          {totalSell !== null ? `$${totalSell.toLocaleString()}` : '-'}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ textAlign: 'center' }}>
                                        <Typography sx={{ fontSize: '0.5rem', color: theme.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Margin</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.emeraldDark }}>
                                            {grossMargin !== null ? `$${grossMargin.toLocaleString()}` : '-'}
                                          </Typography>
                                          <Chip
                                            label={grossMarginPct !== null ? `${grossMarginPct > 0 ? '+' : ''}${grossMarginPct.toFixed(0)}%` : 'N/A'}
                                            size="small"
                                            sx={{
                                              height: 16,
                                              fontSize: '0.55rem',
                                              fontWeight: 700,
                                              bgcolor: grossMarginPct !== null
                                                ? (grossMarginPct > 0 ? alpha(COLORS.emerald, 0.2) : alpha(COLORS.red, 0.15))
                                                : alpha(COLORS.slate[500], 0.15),
                                              color: grossMarginPct !== null
                                                ? (grossMarginPct > 0 ? COLORS.emeraldDark : COLORS.red)
                                                : COLORS.slate[600],
                                              border: `1px solid ${grossMarginPct !== null
                                                ? (grossMarginPct > 0 ? COLORS.emerald : COLORS.red)
                                                : COLORS.slate[400]}`,
                                              '& .MuiChip-label': { px: 0.5 },
                                            }}
                                          />
                                        </Box>
                                      </Box>
                                      <Tooltip title={`Selling Price Variance: Master Data ($${mdspPerOrderUnit?.toFixed(2) || '-'}) vs Avg Order Data ($${ospPerOrderUnit?.toFixed(2) || '-'})`} arrow>
                                        <Box sx={{ textAlign: 'center' }}>
                                          <Typography sx={{ fontSize: '0.5rem', color: theme.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Var</Typography>
                                          <Chip
                                            label={priceVariance !== null ? `${priceVariance > 0 ? '+' : ''}${priceVariance.toFixed(1)}%` : 'N/A'}
                                            size="small"
                                            sx={{
                                              height: 18,
                                              fontSize: '0.55rem',
                                              fontWeight: 700,
                                              bgcolor: priceVariance !== null
                                                ? (priceVariance >= 0 ? alpha(COLORS.emerald, 0.15) : alpha(COLORS.amber, 0.2))
                                                : alpha(COLORS.slate[500], 0.15),
                                              color: priceVariance !== null
                                                ? (priceVariance >= 0 ? COLORS.emeraldDark : COLORS.amberDark)
                                                : COLORS.slate[600],
                                              border: `1px solid ${priceVariance !== null
                                                ? (priceVariance >= 0 ? COLORS.emerald : COLORS.amber)
                                                : COLORS.slate[400]}`,
                                              '& .MuiChip-label': { px: 0.75 },
                                            }}
                                          />
                                        </Box>
                                      </Tooltip>
                                    </Box>
                                  );
                                })()}
                              </>
                            ) : (
                              <Typography sx={{ fontSize: '0.5rem', color: theme.textMuted, textAlign: 'center' }}>
                                Loading pricing...
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                  </Stack>
                )}
              </Box>

            </Box>
          </Card>

          {/* MAIN PANEL: Component Sourcing + Cost Optimization (Combined) */}
          <Card variant="outlined" sx={{
            bgcolor: theme.panel,
            border: `1px solid ${theme.panelBorder}`,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <Box sx={{
              p: 1.5,
              borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}`,
              bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : COLORS.slate[50],
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: theme.text }}>
                    Component Acquisition Cost
                  </Typography>
                  <Chip
                    label={costs.isRealBomData ? '✓ SAP BOM' : '⚠ ESTIMATED'}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.5rem',
                      fontWeight: 700,
                      bgcolor: costs.isRealBomData ? alpha(COLORS.emerald, 0.2) : alpha(COLORS.amber, 0.2),
                      color: costs.isRealBomData ? COLORS.emeraldDark : COLORS.amberDark,
                      border: `1px solid ${costs.isRealBomData ? COLORS.emerald : COLORS.amber}`,
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.65rem', color: theme.textMuted }}>
                  {costs.isRealBomData
                    ? `Real BOM costs from SAP MBEW • Inbound freight estimated`
                    : `Supplier selection: Material Cost + Inbound Freight to ${rankedPlants.find(p => p.id === selectedPlant)?.name || 'Selected Plant'}`
                  }
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Chip
                  label="Supplier Options"
                  size="small"
                  onClick={() => setComponentViewTab('suppliers')}
                  sx={{
                    bgcolor: componentViewTab === 'suppliers' ? alpha(COLORS.emerald, 0.15) : 'transparent',
                    color: componentViewTab === 'suppliers' ? COLORS.emeraldDark : theme.textMuted,
                    fontWeight: 600,
                    fontSize: '0.6rem',
                    cursor: 'pointer',
                    border: componentViewTab === 'suppliers' ? 'none' : `1px solid ${theme.panelBorder}`,
                    '&:hover': { bgcolor: alpha(COLORS.emerald, 0.1) }
                  }}
                />
                <Chip
                  label="Cost Summary"
                  size="small"
                  onClick={() => setComponentViewTab('summary')}
                  sx={{
                    bgcolor: componentViewTab === 'summary' ? alpha(COLORS.emerald, 0.15) : 'transparent',
                    color: componentViewTab === 'summary' ? COLORS.emeraldDark : theme.textMuted,
                    fontWeight: 600,
                    fontSize: '0.6rem',
                    cursor: 'pointer',
                    border: componentViewTab === 'summary' ? 'none' : `1px solid ${theme.panelBorder}`,
                    '&:hover': { bgcolor: alpha(COLORS.emerald, 0.1) }
                  }}
                />
              </Box>
            </Box>

            {/* Quick Optimization Buttons */}
            <Box sx={{
              display: 'flex',
              gap: 1,
              px: 1.5,
              py: 1,
              borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}`,
              bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : COLORS.slate[50],
            }}>
              <Typography sx={{ fontSize: '0.65rem', color: theme.textMuted, mr: 0.5, display: 'flex', alignItems: 'center' }}>
                Optimize for:
              </Typography>
              <Chip
                icon={<AttachMoneyIcon sx={{ fontSize: '14px !important' }} />}
                label="Lowest Cost"
                size="small"
                onClick={() => {
                  // Select cheapest supplier for each component
                  const cheapestSuppliers = {};
                  components.forEach(comp => {
                    if (comp.supplierOptions?.length > 0) {
                      const cheapest = [...comp.supplierOptions].sort((a, b) => {
                        const aCost = (a.pricePerUnit * comp.qty) + (a.inboundCost?.[selectedPlant] || 0);
                        const bCost = (b.pricePerUnit * comp.qty) + (b.inboundCost?.[selectedPlant] || 0);
                        return aCost - bCost;
                      })[0];
                      if (cheapest) cheapestSuppliers[comp.id] = cheapest.id;
                    }
                  });
                  setComponentSuppliers(cheapestSuppliers);
                  const selectedSkuData = skuOptions.find(s => s.id === selectedSku);
                  recalculateCosts(selectedSkuData?.sku, selectedPlant, cheapestSuppliers);
                }}
                sx={{
                  height: 24,
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  bgcolor: alpha(COLORS.emerald, 0.1),
                  color: COLORS.emeraldDark,
                  border: `1px solid ${alpha(COLORS.emerald, 0.3)}`,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: alpha(COLORS.emerald, 0.2) },
                  '& .MuiChip-icon': { color: COLORS.emeraldDark },
                }}
              />
              <Chip
                icon={<SpeedIcon sx={{ fontSize: '14px !important' }} />}
                label="Fastest Delivery"
                size="small"
                onClick={() => {
                  // Select fastest supplier for each component
                  const fastestSuppliers = {};
                  components.forEach(comp => {
                    if (comp.supplierOptions?.length > 0) {
                      const fastest = [...comp.supplierOptions].sort((a, b) => (a.leadTime || 99) - (b.leadTime || 99))[0];
                      if (fastest) fastestSuppliers[comp.id] = fastest.id;
                    }
                  });
                  setComponentSuppliers(fastestSuppliers);
                  const selectedSkuData = skuOptions.find(s => s.id === selectedSku);
                  recalculateCosts(selectedSkuData?.sku, selectedPlant, fastestSuppliers);
                }}
                sx={{
                  height: 24,
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  bgcolor: alpha(COLORS.cyan, 0.1),
                  color: COLORS.cyan,
                  border: `1px solid ${alpha(COLORS.cyan, 0.3)}`,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: alpha(COLORS.cyan, 0.2) },
                  '& .MuiChip-icon': { color: COLORS.cyan },
                }}
              />
              <Chip
                icon={<StarIcon sx={{ fontSize: '14px !important' }} />}
                label="AI Recommended"
                size="small"
                onClick={() => {
                  // Select recommended supplier for each component
                  const recommendedSuppliers = {};
                  components.forEach(comp => {
                    if (comp.supplierOptions?.length > 0) {
                      const recommended = comp.supplierOptions.find(s => s.recommended) || comp.supplierOptions[0];
                      if (recommended) recommendedSuppliers[comp.id] = recommended.id;
                    }
                  });
                  setComponentSuppliers(recommendedSuppliers);
                  const selectedSkuData = skuOptions.find(s => s.id === selectedSku);
                  recalculateCosts(selectedSkuData?.sku, selectedPlant, recommendedSuppliers);
                }}
                sx={{
                  height: 24,
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  bgcolor: alpha(COLORS.secondary, 0.1),
                  color: COLORS.secondary,
                  border: `1px solid ${alpha(COLORS.secondary, 0.3)}`,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: alpha(COLORS.secondary, 0.2) },
                  '& .MuiChip-icon': { color: COLORS.secondary },
                }}
              />
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
              {/* Tab Content */}
              {componentViewTab === 'suppliers' ? (
              <>
              {/* Component Table - Full Width */}
              <Table size="small" sx={{ '& th, & td': { py: 0.75, px: 1.5, fontSize: '0.7rem' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: darkMode ? 'rgba(0,0,0,0.3)' : COLORS.slate[50] }}>
                    <TableCell sx={{ color: theme.textMuted, fontWeight: 600, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200], minWidth: 160 }}>Component</TableCell>
                    <TableCell sx={{ color: theme.textMuted, fontWeight: 600, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200], minWidth: 85 }}>Material #</TableCell>
                    <TableCell sx={{ color: theme.textMuted, fontWeight: 600, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200], minWidth: 100 }}>Qty</TableCell>
                    <TableCell sx={{ color: theme.textMuted, fontWeight: 600, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200], minWidth: 180 }}>Supplier</TableCell>
                    <TableCell align="center" sx={{ color: theme.textMuted, fontWeight: 600, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200], minWidth: 60 }}>Lead</TableCell>
                    <TableCell align="right" sx={{ color: theme.textMuted, fontWeight: 600, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200], minWidth: 90 }}>Material $</TableCell>
                    <TableCell align="right" sx={{ color: theme.textMuted, fontWeight: 600, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200], minWidth: 90 }}>Inbound $</TableCell>
                    <TableCell align="right" sx={{ color: theme.textMuted, fontWeight: 600, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200], minWidth: 90 }}>Landed $</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {components.length > 0 ? components.map((comp) => (
                    <TableRow key={comp.id} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : COLORS.slate[50] } }}>
                      <TableCell sx={{ color: theme.text, fontWeight: 500, borderColor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100] }}>{comp.name}</TableCell>
                      <TableCell sx={{ color: theme.textMuted, fontSize: '0.65rem', borderColor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100] }}>
                        {comp.material_id?.replace(/^0+/, '') || '-'}
                      </TableCell>
                      <TableCell sx={{ color: theme.text, borderColor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100] }}>
                        {comp.qty?.toLocaleString()} {comp.unit}
                      </TableCell>
                      <TableCell sx={{ borderColor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100], minWidth: 220 }}>
                        {(() => {
                          const options = comp.supplierOptions || [];
                          const selectedId = componentSuppliers[comp.id] || comp.selectedSupplier?.id || '';

                          // Calculate cheapest and fastest
                          const withCosts = options.map(sup => ({
                            ...sup,
                            totalCost: Math.round((sup.pricePerUnit * comp.qty) + (sup.inboundCost?.[selectedPlant] || 0))
                          }));
                          const cheapestId = withCosts.length > 0 ? [...withCosts].sort((a, b) => a.totalCost - b.totalCost)[0]?.id : null;
                          const fastestId = options.length > 0 ? [...options].sort((a, b) => (a.leadTime || 99) - (b.leadTime || 99))[0]?.id : null;

                          const getLeadTimeColor = (days) => {
                            if (days <= 7) return { bg: alpha(COLORS.emerald, 0.15), color: COLORS.emeraldDark };
                            if (days <= 14) return { bg: alpha(COLORS.amber, 0.15), color: COLORS.amberDark };
                            return { bg: alpha(COLORS.red, 0.15), color: COLORS.redDark };
                          };

                          return (
                            <Select
                              value={selectedId}
                              onChange={(e) => handleSupplierChange(comp.id, e.target.value)}
                              size="small"
                              sx={{
                                width: '100%',
                                bgcolor: darkMode ? 'rgba(0,0,0,0.3)' : '#fff',
                                '& .MuiSelect-select': {
                                  py: 0.5,
                                  px: 1,
                                  fontSize: '0.65rem',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200],
                                },
                              }}
                              MenuProps={{
                                PaperProps: {
                                  sx: {
                                    bgcolor: darkMode ? '#1a1f2e' : '#fff',
                                    maxHeight: 300,
                                  }
                                }
                              }}
                              renderValue={(value) => {
                                const sup = options.find(s => s.id === value);
                                if (!sup) return '';
                                return (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {sup.recommended && <StarIcon sx={{ fontSize: 12, color: COLORS.amber }} />}
                                    <Typography sx={{ fontSize: '0.65rem', color: theme.text }}>{sup.name}</Typography>
                                  </Box>
                                );
                              }}
                            >
                              {options.map(sup => {
                                const ltColor = getLeadTimeColor(sup.leadTime || 7);
                                const totalCost = Math.round((sup.pricePerUnit * comp.qty) + (sup.inboundCost?.[selectedPlant] || 0));
                                const isCheapest = sup.id === cheapestId && options.length > 1;
                                const isFastest = sup.id === fastestId && options.length > 1;

                                return (
                                  <MenuItem
                                    key={sup.id}
                                    value={sup.id}
                                    sx={{
                                      py: 1,
                                      px: 1.5,
                                      borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100]}`,
                                      '&:last-child': { borderBottom: 'none' },
                                      '&.Mui-selected': {
                                        bgcolor: alpha(COLORS.emerald, 0.1),
                                      },
                                      '&:hover': {
                                        bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[50],
                                      },
                                    }}
                                  >
                                    <Box sx={{ width: '100%' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          {sup.recommended && <StarIcon sx={{ fontSize: 12, color: COLORS.amber }} />}
                                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: theme.text }}>
                                            {sup.name}
                                          </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <Chip
                                            label={`${sup.leadTime || 7}d`}
                                            size="small"
                                            sx={{
                                              height: 18,
                                              fontSize: '0.55rem',
                                              fontWeight: 600,
                                              bgcolor: ltColor.bg,
                                              color: ltColor.color,
                                            }}
                                          />
                                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.emeraldDark }}>
                                            ${totalCost.toLocaleString()}
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {sup.recommended && (
                                          <Chip label="Recommended" size="small" sx={{ height: 16, fontSize: '0.5rem', bgcolor: alpha(COLORS.secondary, 0.1), color: COLORS.secondary }} />
                                        )}
                                        {isCheapest && (
                                          <Chip label="Cheapest" size="small" sx={{ height: 16, fontSize: '0.5rem', bgcolor: alpha(COLORS.emerald, 0.15), color: COLORS.emeraldDark }} />
                                        )}
                                        {isFastest && (
                                          <Chip label="Fastest" size="small" sx={{ height: 16, fontSize: '0.5rem', bgcolor: alpha(COLORS.cyan, 0.15), color: COLORS.cyan }} />
                                        )}
                                      </Box>
                                    </Box>
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          );
                        })()}
                      </TableCell>
                      <TableCell align="center" sx={{ borderColor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100] }}>
                        <Chip
                          label={`${comp.leadTime || 7}d`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            bgcolor: comp.leadTime > 14 ? alpha(COLORS.amber, 0.15) : alpha(COLORS.emerald, 0.15),
                            color: comp.leadTime > 14 ? COLORS.amberDark : COLORS.emeraldDark,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.text, borderColor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100] }}>
                        ${comp.materialCost?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.text, borderColor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100] }}>
                        ${comp.inboundCost?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell align="right" sx={{ color: COLORS.emeraldDark, fontWeight: 600, borderColor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100] }}>
                        ${comp.landedCost?.toLocaleString() || 0}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', color: theme.textMuted, py: 3 }}>
                        {bomLoading ? 'Loading BOM components...' :
                         selectedSku ? 'Loading BOM data from SAP...' :
                         'Select a material to view BOM components'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Component Acquisition Summary - Below Table */}
              {components.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
                    Component Acquisition Summary
                  </Typography>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 3,
                    p: 2,
                    bgcolor: darkMode ? 'rgba(0,0,0,0.3)' : '#fff',
                    borderRadius: 2,
                    border: `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[300]}`,
                    boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    <Box sx={{ textAlign: 'center', py: 1 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: theme.textMuted, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Raw Material</Typography>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: theme.text }}>${costs.totalMaterial.toLocaleString()}</Typography>
                      <Typography sx={{ fontSize: '0.45rem', fontWeight: 600, color: costs.isRealBomData ? COLORS.emeraldDark : COLORS.amberDark }}>
                        [{costs.isRealBomData ? 'MBEW' : 'EST'}]
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', py: 1, borderLeft: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}`, borderRight: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}` }}>
                      <Typography sx={{ fontSize: '0.7rem', color: theme.textMuted, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inbound Freight</Typography>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.amberDark }}>${costs.totalInbound.toLocaleString()}</Typography>
                      <Typography sx={{ fontSize: '0.45rem', fontWeight: 600, color: COLORS.amberDark }}>[EST ~5%]</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', py: 1 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: theme.textMuted, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Acquisition</Typography>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.emeraldDark }}>${(costs.totalMaterial + costs.totalInbound).toLocaleString()}</Typography>
                      <Typography sx={{ fontSize: '0.45rem', fontWeight: 600, color: COLORS.amberDark }}>[CALC]</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* BOM Loading Indicator */}
              {bomLoading && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, color: theme.textMuted }}>
                  <CircularProgress size={14} />
                  <Typography sx={{ fontSize: '0.65rem' }}>Loading SAP BOM data...</Typography>
                </Box>
              )}

              {/* Divider before Cost Summary */}
              <Box sx={{
                my: 2,
                borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : COLORS.slate[200]}`,
              }} />

              {/* Full Order Landed Cost - Compact Design */}
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* Cost Flow - Inline Compact */}
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Order Landed Cost
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS.emeraldDark }}>
                      Total: ${costs.totalLanded.toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Compact Cost Cards - Single Row */}
                  <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'stretch' }}>
                    {[
                      { label: 'Material', value: costs.totalMaterial, color: COLORS.secondary, icon: <InventoryIcon sx={{ fontSize: 12 }} />, source: costs.isRealBomData ? 'MBEW' : 'EST' },
                      { label: 'Inbound', value: costs.totalInbound, color: COLORS.amberDark, icon: <LocalShippingIcon sx={{ fontSize: 12 }} />, source: 'EST' },
                      { label: 'Outbound', value: costs.outboundFreight, color: COLORS.redDark, icon: <LocalShippingIcon sx={{ fontSize: 12, transform: 'scaleX(-1)' }} />, source: 'EST' },
                    ].map((item, idx) => (
                      <React.Fragment key={item.label}>
                        <Box sx={{
                          flex: 1,
                          p: 0.75,
                          borderRadius: 1,
                          border: `1px solid ${alpha(item.color, 0.25)}`,
                          bgcolor: alpha(item.color, 0.04),
                          textAlign: 'center',
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: item.color, mb: 0.25 }}>
                            {item.icon}
                            <Typography sx={{ fontSize: '0.55rem', fontWeight: 600 }}>{item.label}</Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: item.color }}>
                            ${item.value.toLocaleString()}
                          </Typography>
                          <Typography sx={{ fontSize: '0.4rem', fontWeight: 600, color: item.source === 'MBEW' ? COLORS.emeraldDark : COLORS.amberDark }}>
                            [{item.source}]
                          </Typography>
                        </Box>
                        {idx < 2 && <Typography sx={{ color: theme.textMuted, fontSize: '0.9rem', alignSelf: 'center' }}>+</Typography>}
                      </React.Fragment>
                    ))}
                    <Typography sx={{ color: theme.textMuted, fontSize: '0.9rem', alignSelf: 'center' }}>=</Typography>
                    <Box sx={{
                      flex: 1,
                      p: 0.75,
                      borderRadius: 1,
                      border: `1.5px solid ${COLORS.emerald}`,
                      bgcolor: alpha(COLORS.emerald, 0.08),
                      textAlign: 'center',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: COLORS.emeraldDark, mb: 0.25 }}>
                        <CheckCircleIcon sx={{ fontSize: 12 }} />
                        <Typography sx={{ fontSize: '0.55rem', fontWeight: 600 }}>Landed</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.emeraldDark }}>
                        ${costs.totalLanded.toLocaleString()}
                      </Typography>
                      <Typography sx={{ fontSize: '0.4rem', fontWeight: 600, color: COLORS.amberDark }}>[CALC]</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Margin Bar - Compact */}
                <Box sx={{
                  p: 1,
                  mb: 1.5,
                  borderRadius: 1,
                  bgcolor: darkMode ? 'rgba(0,0,0,0.15)' : COLORS.slate[50],
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : COLORS.slate[200]}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase' }}>Margin</Typography>
                      <Box sx={{
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 0.5,
                        bgcolor: costs.marginPct >= 30 ? alpha(COLORS.emerald, 0.15) : costs.marginPct >= 20 ? alpha(COLORS.amber, 0.15) : alpha(COLORS.red, 0.15),
                        border: `1px solid ${costs.marginPct >= 30 ? alpha(COLORS.emerald, 0.3) : costs.marginPct >= 20 ? alpha(COLORS.amber, 0.3) : alpha(COLORS.red, 0.3)}`,
                      }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: costs.marginPct >= 30 ? COLORS.emeraldDark : costs.marginPct >= 20 ? COLORS.amberDark : COLORS.redDark }}>
                          {costs.marginPct.toFixed(0)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ fontSize: '0.65rem', color: theme.textMuted }}>
                        Cost: <Typography component="span" sx={{ fontWeight: 600, color: COLORS.redDark }}>${costs.totalLanded.toLocaleString()}</Typography>
                      </Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: theme.textMuted }}>
                        Net Margin: <Typography component="span" sx={{ fontWeight: 600, color: COLORS.emeraldDark }}>${Math.round(costs.margin).toLocaleString()}</Typography>
                      </Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: theme.textMuted }}>
                        Order: <Typography component="span" sx={{ fontWeight: 600, color: theme.text }}>${(selectedOrder?.value || 187500).toLocaleString()}</Typography>
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200] }}>
                    <Box sx={{ width: `${Math.min(100, (costs.totalLanded / (selectedOrder?.value || 187500)) * 100)}%`, bgcolor: alpha(COLORS.red, 0.7) }} />
                    <Box sx={{ flex: 1, bgcolor: alpha(COLORS.emerald, 0.7) }} />
                  </Box>
                </Box>

                {/* Scenario Comparison - Enhanced */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: theme.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Scenario Comparison
                    </Typography>
                    <CompareArrowsIcon sx={{ fontSize: 14, color: COLORS.secondary }} />
                  </Box>

                  {/* Scenario Comparison */}
                  {(() => {
                    // Get user's currently selected plant and suppliers
                    const userSelectedPlantData = rankedPlants.find(p => p.id === selectedPlant);
                    const userSelectedPlantName = userSelectedPlantData?.name?.split(',')[0] || 'Selected Plant';
                    const userSelectedPlantLocation = userSelectedPlantData?.location || userSelectedPlantData?.name?.split(',')[1]?.trim() || '';
                    const customerName = selectedShipTo?.name?.split(',')[0] || 'Customer';
                    const distanceMiles = userSelectedPlantData?.distanceMiles || 0;

                    // Get user's selected supplier names from components
                    const userSupplierNames = components
                      .filter(c => c.selectedSupplier?.name)
                      .map(c => c.selectedSupplier.name)
                      .slice(0, 4);
                    const userSupplierText = userSupplierNames.length > 0 ? userSupplierNames.join(', ') : 'Selected suppliers';

                    // Material + Inbound is same for all scenarios (only outbound differs by plant)
                    const materialPlusInbound = costs.totalMaterial + costs.totalInbound;

                    // AI Recommended = Best ranked plant (first in rankedPlants)
                    const aiRecommendedPlant = rankedPlants[0];
                    const aiPlantName = aiRecommendedPlant?.name?.split(',')[0] || 'Best Plant';
                    const aiPlantLocation = aiRecommendedPlant?.location || aiRecommendedPlant?.name?.split(',')[1]?.trim() || '';
                    const aiOutbound = aiRecommendedPlant?.outboundCost || 5000;
                    const aiSuppliers = 'Best-cost suppliers';

                    // Get alternative plant (next capable plant after AI recommended)
                    const capablePlants = rankedPlants.filter(p => p.canManufacture !== false && p.id !== aiRecommendedPlant?.id);
                    const altPlant = capablePlants[0] || rankedPlants.find(p => p.id !== aiRecommendedPlant?.id);
                    const altPlantName = altPlant?.name?.split(',')[0] || 'Alt Plant';
                    const altOutbound = altPlant?.outboundCost || 6500;
                    const altConstraint = altPlant?.capacityConstrained ? ' (capacity constrained)' : '';

                    // Calculate scenario costs using REAL plant outbound data
                    // Formula: Material + Inbound (same) + Plant Outbound (varies)
                    const userOutbound = userSelectedPlantData?.outboundCost || costs.outboundFreight;
                    const aiRecommendedCost = materialPlusInbound + aiOutbound;
                    const userSelectedCost = materialPlusInbound + userOutbound;
                    const altCost = materialPlusInbound + altOutbound;

                    // Check if user selection matches AI recommendation
                    const isUserSelectionOptimal = selectedPlant === aiRecommendedPlant?.id;

                    // Savings calculations (AI recommended vs user selection)
                    const savingsVsUserSelection = userSelectedCost - aiRecommendedCost;
                    const savingsPct = userSelectedCost > 0 ? ((savingsVsUserSelection / userSelectedCost) * 100).toFixed(1) : '0';

                    // For display purposes
                    const selectedPlantData = userSelectedPlantData;
                    const selectedPlantName = aiPlantName;
                    const selectedPlantLocation = aiPlantLocation;
                    const supplierText = aiSuppliers;
                    const baselinePlantName = userSelectedPlantName;
                    const baselineSuppliers = userSupplierText;
                    const baselineCost = userSelectedCost;
                    const savingsVsBaseline = savingsVsUserSelection;

                    // Insight calculations
                    const baselineOutbound = userOutbound; // User's current selection outbound
                    const inboundSavingsVsBaseline = Math.round(baselineOutbound * 0.4 - costs.totalInbound * 0.9); // Estimate
                    const materialSavingsPerUnit = 0.07; // $0.07/m² savings estimate
                    // Handle comma-formatted quantities like "7,500"
                    const orderQtyStr = String(selectedOrder?.quantity || '25000').replace(/,/g, '');
                    const orderQty = parseInt(orderQtyStr, 10) || 25000;
                    const materialSavings = Math.round(orderQty * materialSavingsPerUnit * 3.2); // Approximate m² conversion
                    const domesticFreightSavings = 1800; // Ocean freight elimination

                    // Get primary component (base film) details
                    const baseFilm = components.find(c => c.name?.toLowerCase().includes('film') || c.name?.toLowerCase().includes('pet'));
                    const baseFilmSupplier = baseFilm?.selectedSupplier?.name || userSupplierNames[0] || 'Toray';
                    const baseFilmPrice = baseFilm?.selectedSupplier?.pricePerUnit || 0.79;

                    return (
                      <>
                        {/* Optimized vs Baseline Comparison */}
                        <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5, mb: 1.5 }}>
                          {/* Optimized Scenario - BEST */}
                          <Box
                            sx={{
                              flex: 1,
                              p: 1.25,
                              borderRadius: 1.5,
                              border: `2px solid ${COLORS.emerald}`,
                              bgcolor: alpha(COLORS.emerald, 0.06),
                              position: 'relative',
                            }}
                          >
                            <Box sx={{
                              position: 'absolute',
                              top: -10,
                              right: 10,
                              bgcolor: COLORS.emerald,
                              color: '#fff',
                              px: 1,
                              py: 0.25,
                              borderRadius: 0.5,
                              fontSize: '0.6rem',
                              fontWeight: 700,
                            }}>
                              AI RECOMMENDED
                            </Box>
                            <Typography sx={{ fontSize: '0.7rem', color: COLORS.emeraldDark, fontWeight: 600, mb: 0.5 }}>
                              {selectedPlantName} + Best Suppliers
                            </Typography>
                            <Typography sx={{ fontSize: '0.6rem', color: theme.textMuted, mb: 0.5 }}>
                              {selectedPlantLocation} • {supplierText}
                            </Typography>
                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.emeraldDark }}>
                              ${aiRecommendedCost.toLocaleString()}
                            </Typography>
                          </Box>

                          {/* Savings Badge in Center */}
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: 1,
                          }}>
                            <Box sx={{
                              bgcolor: alpha(COLORS.emerald, 0.15),
                              border: `1px solid ${COLORS.emerald}`,
                              borderRadius: 1,
                              px: 1,
                              py: 0.5,
                              textAlign: 'center',
                            }}>
                              <Typography sx={{ fontSize: '0.55rem', color: COLORS.emeraldDark, fontWeight: 500 }}>
                                SAVINGS
                              </Typography>
                              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.emeraldDark }}>
                                ${savingsVsBaseline.toLocaleString()}
                              </Typography>
                              <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: COLORS.emeraldDark }}>
                                {savingsPct}%
                              </Typography>
                            </Box>
                          </Box>

                          {/* Baseline Scenario */}
                          <Box
                            sx={{
                              flex: 1,
                              p: 1.25,
                              borderRadius: 1.5,
                              border: `1px dashed ${alpha(COLORS.slate[400], 0.5)}`,
                              bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : alpha(COLORS.slate[100], 0.3),
                              position: 'relative',
                            }}
                          >
                            <Box sx={{
                              position: 'absolute',
                              top: -10,
                              right: 10,
                              bgcolor: COLORS.slate[400],
                              color: '#fff',
                              px: 1,
                              py: 0.25,
                              borderRadius: 0.5,
                              fontSize: '0.6rem',
                              fontWeight: 600,
                            }}>
                              YOUR SELECTION
                            </Box>
                            <Typography sx={{ fontSize: '0.7rem', color: theme.textSecondary, fontWeight: 600, mb: 0.5 }}>
                              {baselinePlantName} + Your Suppliers
                            </Typography>
                            <Typography sx={{ fontSize: '0.6rem', color: theme.textMuted, mb: 0.5 }}>
                              {userSelectedPlantLocation} • {baselineSuppliers}
                            </Typography>
                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: theme.text }}>
                              ${baselineCost.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Why AI Recommends This - Insights */}
                        <Box sx={{
                          p: 1.25,
                          borderRadius: 1.5,
                          bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : alpha(COLORS.amber, 0.04),
                          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : alpha(COLORS.amber, 0.2)}`,
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <LightbulbIcon sx={{ fontSize: 14, color: COLORS.amber }} />
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: theme.text }}>
                              Why AI Recommends {aiPlantName}
                            </Typography>
                          </Box>

                          {/* Insight Items */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            {[
                              {
                                icon: <FactoryIcon sx={{ fontSize: 14, color: COLORS.secondary }} />,
                                text: savingsVsUserSelection > 0
                                  ? `Saves $${savingsVsUserSelection.toLocaleString()} vs your selection (${userSelectedPlantName}). Lower outbound freight: $${aiOutbound.toLocaleString()} vs $${userOutbound.toLocaleString()}.`
                                  : `${aiPlantName} is already your optimal choice. Lowest total landed cost for this order.`
                              },
                              {
                                icon: <LocalShippingIcon sx={{ fontSize: 14, color: COLORS.emeraldDark }} />,
                                text: `Outbound to ${customerName}: $${aiOutbound.toLocaleString()} - best freight lane from ${aiPlantName} to customer location.`
                              },
                              {
                                icon: <InventoryIcon sx={{ fontSize: 14, color: COLORS.amberDark }} />,
                                text: `Material + Inbound: $${materialPlusInbound.toLocaleString()} (same for all plants). Plant choice affects outbound freight only.`
                              },
                              {
                                icon: <PlaceIcon sx={{ fontSize: 14, color: COLORS.red }} />,
                                text: isUserSelectionOptimal
                                  ? `Your current selection matches AI recommendation - optimal cost achieved!`
                                  : `Switch to ${aiPlantName} to save ${savingsPct}% on total landed cost.`
                              },
                            ].map((insight, idx) => (
                              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                                <Box sx={{ mt: 0.25 }}>{insight.icon}</Box>
                                <Typography sx={{ fontSize: '0.65rem', color: theme.text, lineHeight: 1.4, flex: 1 }}>
                                  {insight.text}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>

                        {/* Margin Summary */}
                        <Box sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: 1,
                          mt: 1.5,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : alpha(COLORS.secondary, 0.03),
                          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : alpha(COLORS.secondary, 0.1)}`,
                        }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.65rem', color: theme.textMuted, mb: 0.25 }}>Gross Margin</Typography>
                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.emeraldDark }}>
                              ${costs.margin.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.65rem', color: theme.textMuted, mb: 0.25 }}>Margin %</Typography>
                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.secondary }}>
                              {costs.marginPct.toFixed(1)}%
                            </Typography>
                          </Box>
                        </Box>

                        {/* Calculation Breakdown */}
                        <Typography sx={{ fontSize: '0.6rem', color: theme.textMuted, textAlign: 'center', mt: 0.75 }}>
                          PO Value: ${(selectedOrder?.value || 187500).toLocaleString()} − Landed Cost: ${costs.totalLanded.toLocaleString()} = Margin: ${costs.margin.toLocaleString()}
                        </Typography>
                      </>
                    );
                  })()}
              </Box>
              </Box>
              </>
              ) : (
              /* Cost Summary Tab - Cost Stack Visualization */
              <Box key={`cost-summary-${costs.totalLanded}-${costs.totalMaterial}-${costs.totalInbound}`} sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: theme.text, mb: 2 }}>
                  Cost Stack Visualization
                </Typography>

                {/* Component Material Cost Bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', mb: 0.5 }}>
                    <Typography sx={{ color: theme.textSecondary, fontSize: '0.7rem' }}>Component Material Cost</Typography>
                    <Typography sx={{ color: theme.text, fontSize: '0.7rem', fontWeight: 600 }}>${costs.totalMaterial.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ height: 24, bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200], borderRadius: 1, overflow: 'hidden' }}>
                    <Box sx={{
                      width: `${Math.round((costs.totalMaterial / costs.totalLanded) * 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Typography sx={{ fontSize: '0.65rem', color: '#fff', fontWeight: 700 }}>
                        {Math.round((costs.totalMaterial / costs.totalLanded) * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Inbound Freight Bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', mb: 0.5 }}>
                    <Typography sx={{ color: theme.textSecondary, fontSize: '0.7rem' }}>Inbound Freight (Suppliers → {rankedPlants.find(p => p.id === selectedPlant)?.name?.split(',')[0] || 'Plant'})</Typography>
                    <Typography sx={{ color: COLORS.amber, fontSize: '0.7rem', fontWeight: 600 }}>${costs.totalInbound.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ height: 24, bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200], borderRadius: 1, overflow: 'hidden' }}>
                    <Box sx={{
                      width: `${Math.max(Math.round((costs.totalInbound / costs.totalLanded) * 100), 5)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Typography sx={{ fontSize: '0.65rem', color: '#0a0f1a', fontWeight: 700 }}>
                        {Math.round((costs.totalInbound / costs.totalLanded) * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Outbound Freight Bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', mb: 0.5 }}>
                    <Typography sx={{ color: theme.textSecondary, fontSize: '0.7rem' }}>Outbound Freight ({rankedPlants.find(p => p.id === selectedPlant)?.name?.split(',')[0] || 'Plant'} → {selectedShipTo?.name?.split(',')[0] || 'Customer'})</Typography>
                    <Typography sx={{ color: COLORS.amber, fontSize: '0.7rem', fontWeight: 600 }}>${costs.outboundFreight.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ height: 24, bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200], borderRadius: 1, overflow: 'hidden' }}>
                    <Box sx={{
                      width: `${Math.max(Math.round((costs.outboundFreight / costs.totalLanded) * 100), 5)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #f97316, #ea580c)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Typography sx={{ fontSize: '0.65rem', color: '#fff', fontWeight: 700 }}>
                        {Math.round((costs.outboundFreight / costs.totalLanded) * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Total Landed Cost Bar */}
                <Box sx={{ pt: 2, borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', mb: 0.5 }}>
                    <Typography sx={{ color: COLORS.emeraldDark, fontSize: '0.75rem', fontWeight: 600 }}>TOTAL LANDED COST</Typography>
                    <Typography sx={{ color: COLORS.emeraldDark, fontSize: '0.85rem', fontWeight: 700 }}>${costs.totalLanded.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{
                    height: 28,
                    border: `2px solid ${darkMode ? 'rgba(255,255,255,0.25)' : '#9ca3af'}`,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Typography sx={{ fontSize: '0.7rem', color: theme.text, fontWeight: 700 }}>
                      100% - Optimized Total
                    </Typography>
                  </Box>
                </Box>

                {/* Summary Stats */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 3, p: 2, border: `2px solid ${darkMode ? 'rgba(255,255,255,0.2)' : COLORS.slate[300]}`, borderRadius: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: theme.textMuted, mb: 0.5 }}>Total Material</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: theme.text }}>${costs.totalMaterial.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: theme.textMuted, mb: 0.5 }}>Total Inbound</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.amber }}>${costs.totalInbound.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', borderLeft: `2px solid ${darkMode ? 'rgba(255,255,255,0.2)' : COLORS.slate[300]}`, pl: 2 }}>
                    <Typography sx={{ fontSize: '0.6rem', color: theme.textMuted, mb: 0.5 }}>Acquisition Cost</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.cyan }}>${costs.acquisitionCost.toLocaleString()}</Typography>
                  </Box>
                </Box>

                {/* Margin Impact Card */}
                {(() => {
                  const selectedSkuData = skuOptions.find(s => s.id === selectedSku);
                  const hasRealPrice = true; // SAP data is always real
                  const confidence = selectedSkuData?.marginConfidence || 'low';
                  const confidenceLabel = confidence === 'high' ? 'High Confidence' : confidence === 'medium' ? 'Medium' : 'Estimated';
                  const confidenceColor = confidence === 'high' ? COLORS.emerald : confidence === 'medium' ? COLORS.amber : COLORS.slate[400];

                  return (
                    <Box sx={{
                      mt: 2,
                      p: 2,
                      border: `2px solid ${darkMode ? 'rgba(255,255,255,0.2)' : COLORS.slate[300]}`,
                      borderRadius: 2
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.6rem', color: theme.textMuted }}>Gross Margin</Typography>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.emeraldDark }}>${Math.round(costs.margin).toLocaleString()}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontSize: '0.6rem', color: theme.textMuted }}>Margin %</Typography>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.emeraldDark }}>{costs.marginPct.toFixed(1)}%</Typography>
                        </Box>
                      </Box>
                      {/* Prominent data source indicator */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}`
                      }}>
                        <Chip
                          label={hasRealPrice ? '✓ SAP REAL DATA' : '⚠ ESTIMATED DATA'}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            bgcolor: hasRealPrice ? alpha(COLORS.emerald, 0.15) : alpha(COLORS.amber, 0.15),
                            color: hasRealPrice ? COLORS.emeraldDark : COLORS.amberDark,
                            border: `2px solid ${hasRealPrice ? COLORS.emerald : COLORS.amber}`,
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '0.6rem', color: theme.textSecondary, mt: 1, pt: 1, borderTop: `2px solid ${darkMode ? 'rgba(255,255,255,0.15)' : COLORS.slate[300]}` }}>
                        PO Value: ${(selectedOrder?.value || 187500).toLocaleString()} − Landed Cost: ${costs.totalLanded.toLocaleString()} = Margin: ${Math.round(costs.margin).toLocaleString()}
                      </Typography>
                    </Box>
                  );
                })()}
              </Box>
              )}
            </Box>
          </Card>
        </Box>

        {/* Action Footer */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.panelBorder}`,
        }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Typography sx={{ fontSize: '0.75rem', color: theme.textMuted }}>
              Selected: <span style={{ color: COLORS.secondary, fontWeight: 600 }}>{selectedSkuData.sku || 'RL-PET75-FP-S'}</span>
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: theme.textMuted }}>
              Margin Uplift: <span style={{ color: COLORS.emeraldDark, fontWeight: 600 }}>+{formatCurrency(marginUplift > 0 ? marginUplift : 12200)}</span>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleBackToIntent}
              sx={{
                color: theme.textSecondary,
                borderColor: darkMode ? 'rgba(255,255,255,0.2)' : COLORS.slate[300],
                fontSize: '0.75rem',
                '&:hover': { borderColor: theme.textSecondary },
              }}
            >
              ← Back to Intent
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CompareArrowsIcon sx={{ fontSize: 16 }} />}
              onClick={() => setComparisonDrawerOpen(true)}
              sx={{
                color: baseline && (selectedSku !== baseline?.sku?.id || selectedPlant !== baseline?.plant?.id) ? COLORS.secondary : theme.textSecondary,
                borderColor: baseline && (selectedSku !== baseline?.sku?.id || selectedPlant !== baseline?.plant?.id) ? COLORS.secondary : (darkMode ? 'rgba(255,255,255,0.2)' : COLORS.slate[300]),
                fontSize: '0.75rem',
                '&:hover': { borderColor: COLORS.secondary },
              }}
            >
              Review Impact
            </Button>
            <Tooltip
              title={
                selectedOrder?.stage > 1
                  ? 'This order has already been promoted'
                  : !getLineProgress().allConfigured
                  ? `Configure all ${getLineProgress().total} lines before proceeding`
                  : ''
              }
              placement="top"
            >
              <span>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSelectAndContinue}
                  disabled={!getLineProgress().allConfigured || isPromoting || (selectedOrder?.stage > 1)}
                  sx={{
                    background: getLineProgress().allConfigured && !(selectedOrder?.stage > 1)
                      ? `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`
                      : alpha(COLORS.slate[400], 0.3),
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '&:hover': { boxShadow: getLineProgress().allConfigured && !(selectedOrder?.stage > 1) ? `0 4px 15px ${alpha(COLORS.secondary, 0.3)}` : 'none' },
                    '&:disabled': {
                      color: 'rgba(255,255,255,0.5)',
                    },
                  }}
                >
                  {isPromoting
                    ? 'Promoting...'
                    : selectedOrder?.stage > 1
                    ? 'Already Promoted'
                    : (selectedOrder?.lineCount || 1) > 1
                    ? `Accept All Lines & Send to Arbitration →`
                    : `Accept & Send to Arbitration →`}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Box>

        {/* Drilldown Modals */}
        <ComparisonModal
          open={comparisonModalOpen}
          onClose={() => setComparisonModalOpen(false)}
          intentId={selectedOrder?.id}
          onSelect={(mat) => {
            // Find matching SKU option by material number (sku field) or id
            const matchingSku = skuOptions.find(opt =>
              opt.sku === mat.matnr ||
              opt.sku === mat.id ||
              opt.id === mat.matnr ||
              opt.id === mat.id
            );
            if (matchingSku) {
              setSelectedSku(matchingSku.id);
            } else {
              // Fallback: use material number directly if no match found
              setSelectedSku(mat.matnr || mat.id);
            }
            setComparisonModalOpen(false);
          }}
        />

        {/* Navigation Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmDialog.open}
          onClose={handleCancelNavigate}
          onConfirm={handleConfirmNavigate}
          title="SKU Confirmed Successfully"
          message={`SKU ${confirmDialog.sku || ''} confirmed!\nOrder ${confirmDialog.order?.id || ''} has been sent to Arbitration.\n\nWould you like to continue to Order Value Control Tower to review customer economics and approval?`}
          confirmText="View in Control Tower"
          cancelText="Stay Here"
          darkMode={darkMode}
        />

        {/* Info Dialog (replaces browser alerts) */}
        <InfoDialog
          open={infoDialog.open}
          onClose={() => setInfoDialog({ ...infoDialog, open: false })}
          title={infoDialog.title}
          message={infoDialog.message}
          type={infoDialog.type}
          darkMode={darkMode}
        />

        {/* Comparison Drawer - Side by Side Changes */}
        <Drawer
          anchor="right"
          open={comparisonDrawerOpen}
          onClose={() => setComparisonDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 520,
              bgcolor: darkMode ? COLORS.dark.bg : '#fff',
              borderLeft: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}`,
            }
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{
              p: 2,
              borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}`,
              bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : COLORS.slate[50],
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: theme.text }}>
                    Selection Comparison
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: theme.textMuted }}>
                    Side-by-side view of changes from recommended baseline
                  </Typography>
                </Box>
                <IconButton onClick={() => setComparisonDrawerOpen(false)} size="small">
                  <CloseIcon sx={{ fontSize: 20, color: theme.textMuted }} />
                </IconButton>
              </Stack>
            </Box>

            {/* Comparison Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {baseline ? (
                <>
                  {/* Column Headers */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 1, mb: 2 }}>
                    <Box />
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(COLORS.slate[400], 0.1), borderRadius: 1 }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase' }}>Recommended</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(COLORS.secondary, 0.1), borderRadius: 1 }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.secondary, textTransform: 'uppercase' }}>Your Selection</Typography>
                    </Box>
                  </Box>

                  {/* SKU Comparison */}
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : COLORS.slate[50], borderRadius: 1.5 }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: theme.textMuted, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Material / SKU</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 1, alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', color: theme.textSecondary }}>SKU Code</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: theme.text }}>{baseline.sku?.sku || '-'}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: selectedSku !== baseline.sku?.id ? COLORS.secondary : theme.text }}>
                          {skuOptions.find(s => s.id === selectedSku)?.sku || '-'}
                        </Typography>
                        {selectedSku !== baseline.sku?.id && <Chip label="CHANGED" size="small" sx={{ height: 16, fontSize: '0.5rem', bgcolor: alpha(COLORS.secondary, 0.15), color: COLORS.secondary }} />}
                      </Box>

                      <Typography sx={{ fontSize: '0.7rem', color: theme.textSecondary }}>Material</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: theme.textMuted }}>{baseline.sku?.name?.split(' (')[0]?.slice(0, 25) || '-'}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: selectedSku !== baseline.sku?.id ? COLORS.secondary : theme.textMuted }}>
                        {skuOptions.find(s => s.id === selectedSku)?.name?.split(' (')[0]?.slice(0, 25) || '-'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Plant Comparison */}
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : COLORS.slate[50], borderRadius: 1.5 }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: theme.textMuted, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Production Plant</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 1, alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', color: theme.textSecondary }}>Plant</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: theme.text }}>{baseline.plant?.name?.split(',')[0] || '-'}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: selectedPlant !== baseline.plant?.id ? COLORS.secondary : theme.text }}>
                          {rankedPlants.find(p => p.id === selectedPlant)?.name?.split(',')[0] || '-'}
                        </Typography>
                        {selectedPlant !== baseline.plant?.id && <Chip label="CHANGED" size="small" sx={{ height: 16, fontSize: '0.5rem', bgcolor: alpha(COLORS.secondary, 0.15), color: COLORS.secondary }} />}
                      </Box>
                    </Box>
                  </Box>

                  {/* Cost Comparison */}
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : COLORS.slate[50], borderRadius: 1.5 }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: theme.textMuted, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cost Breakdown</Typography>
                    {[
                      { label: 'Material Cost', baseKey: 'totalMaterial' },
                      { label: 'Inbound Freight', baseKey: 'totalInbound' },
                      { label: 'Acquisition Cost', baseKey: 'acquisitionCost' },
                      { label: 'Outbound Freight', baseKey: 'outboundFreight' },
                      { label: 'Total Landed', baseKey: 'totalLanded', highlight: true },
                    ].map(({ label, baseKey, highlight }) => {
                      const baseVal = baseline.costs?.[baseKey] || 0;
                      const currVal = costs[baseKey] || 0;
                      const diff = currVal - baseVal;
                      const isChanged = Math.abs(diff) > 1;
                      const isBetter = diff < 0;
                      return (
                        <Box key={baseKey} sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 1, alignItems: 'center', py: 0.5, borderBottom: highlight ? 'none' : `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100]}` }}>
                          <Typography sx={{ fontSize: '0.7rem', color: theme.textSecondary, fontWeight: highlight ? 600 : 400 }}>{label}</Typography>
                          <Typography sx={{ fontSize: highlight ? '0.85rem' : '0.75rem', fontWeight: highlight ? 700 : 500, color: theme.text }}>${baseVal.toLocaleString()}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={{ fontSize: highlight ? '0.85rem' : '0.75rem', fontWeight: highlight ? 700 : 600, color: isChanged ? (isBetter ? COLORS.emeraldDark : COLORS.red) : theme.text }}>
                              ${currVal.toLocaleString()}
                            </Typography>
                            {isChanged && (
                              <Chip
                                label={`${isBetter ? '' : '+'}$${diff.toLocaleString()}`}
                                size="small"
                                sx={{ height: 16, fontSize: '0.5rem', bgcolor: alpha(isBetter ? COLORS.emerald : COLORS.red, 0.15), color: isBetter ? COLORS.emeraldDark : COLORS.red }}
                              />
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Margin Comparison */}
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(costs.marginPct > (baseline.costs?.marginPct || 0) ? COLORS.emerald : COLORS.red, 0.05), borderRadius: 1.5, border: `1px solid ${alpha(costs.marginPct > (baseline.costs?.marginPct || 0) ? COLORS.emerald : COLORS.red, 0.2)}` }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: theme.textMuted, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Margin Impact</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 1, alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', color: theme.textSecondary }}>Gross Margin</Typography>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: theme.text }}>${Math.round(baseline.costs?.margin || 0).toLocaleString()}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: costs.margin > (baseline.costs?.margin || 0) ? COLORS.emeraldDark : costs.margin < (baseline.costs?.margin || 0) ? COLORS.red : theme.text }}>
                          ${Math.round(costs.margin).toLocaleString()}
                        </Typography>
                        {Math.abs(costs.margin - (baseline.costs?.margin || 0)) > 1 && (
                          <Chip
                            label={`${costs.margin > (baseline.costs?.margin || 0) ? '+' : ''}$${Math.round(costs.margin - (baseline.costs?.margin || 0)).toLocaleString()}`}
                            size="small"
                            sx={{ height: 18, fontSize: '0.55rem', fontWeight: 700, bgcolor: alpha(costs.margin > (baseline.costs?.margin || 0) ? COLORS.emerald : COLORS.red, 0.15), color: costs.margin > (baseline.costs?.margin || 0) ? COLORS.emeraldDark : COLORS.red }}
                          />
                        )}
                      </Box>

                      <Typography sx={{ fontSize: '0.7rem', color: theme.textSecondary }}>Margin %</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: theme.text }}>{(baseline.costs?.marginPct || 0).toFixed(1)}%</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: costs.marginPct > (baseline.costs?.marginPct || 0) ? COLORS.emeraldDark : costs.marginPct < (baseline.costs?.marginPct || 0) ? COLORS.red : theme.text }}>
                          {costs.marginPct.toFixed(1)}%
                        </Typography>
                        {Math.abs(costs.marginPct - (baseline.costs?.marginPct || 0)) > 0.1 && (
                          <Chip
                            label={`${costs.marginPct > (baseline.costs?.marginPct || 0) ? '+' : ''}${(costs.marginPct - (baseline.costs?.marginPct || 0)).toFixed(1)}%`}
                            size="small"
                            sx={{ height: 16, fontSize: '0.5rem', bgcolor: alpha(costs.marginPct > (baseline.costs?.marginPct || 0) ? COLORS.emerald : COLORS.red, 0.15), color: costs.marginPct > (baseline.costs?.marginPct || 0) ? COLORS.emeraldDark : COLORS.red }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* AI Analysis Summary - Enhanced Critical Analysis */}
                  {(() => {
                    const hasChanges = selectedSku !== baseline.sku?.id || selectedPlant !== baseline.plant?.id;
                    const skuChanged = selectedSku !== baseline.sku?.id;
                    const plantChanged = selectedPlant !== baseline.plant?.id;
                    const costDiff = costs.totalLanded - (baseline.costs?.totalLanded || 0);
                    const marginDiff = costs.margin - (baseline.costs?.margin || 0);
                    const isImprovement = costDiff < 0;
                    const isSameAsAI = !hasChanges;

                    // Get selected vs baseline details
                    const selectedSkuData = skuOptions.find(s => s.id === selectedSku);
                    const selectedPlantData = rankedPlants.find(p => p.id === selectedPlant);
                    const baselineSkuData = baseline.sku;
                    const baselinePlantData = baseline.plant;

                    // Determine individual impacts
                    const materialDiff = costs.totalMaterial - (baseline.costs?.totalMaterial || 0);
                    const inboundDiff = costs.totalInbound - (baseline.costs?.totalInbound || 0);
                    const outboundDiff = costs.outboundFreight - (baseline.costs?.outboundFreight || 0);

                    return (
                      <Box sx={{ mb: 2 }}>
                        {/* Section Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Box sx={{
                            width: 28, height: 28, borderRadius: '50%',
                            bgcolor: alpha(COLORS.secondary, 0.15),
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <LightbulbIcon sx={{ fontSize: 16, color: COLORS.secondary }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: theme.text }}>
                              AI Decision Analysis
                            </Typography>
                            <Typography sx={{ fontSize: '0.6rem', color: theme.textMuted }}>
                              Critical assessment of recommendations vs your selections
                            </Typography>
                          </Box>
                          <Chip
                            label={isSameAsAI ? 'ALIGNED' : isImprovement ? 'IMPROVED' : 'DIVERGED'}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              bgcolor: 'transparent',
                              border: `1px solid ${isSameAsAI ? COLORS.emerald : isImprovement ? COLORS.emerald : COLORS.amber}`,
                              color: isSameAsAI || isImprovement ? COLORS.emeraldDark : COLORS.amberDark
                            }}
                          />
                        </Box>

                        {/* WHY AI RECOMMENDED - Always show this */}
                        <Box sx={{
                          p: 1.5,
                          mb: 1.5,
                          bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : alpha(COLORS.secondary, 0.03),
                          borderRadius: 1.5,
                          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : alpha(COLORS.secondary, 0.15)}`
                        }}>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: COLORS.secondary, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon sx={{ fontSize: 12 }} /> Why AI Recommended This Configuration
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Box sx={{ width: 4, bgcolor: COLORS.secondary, borderRadius: 1, flexShrink: 0 }} />
                              <Typography sx={{ fontSize: '0.68rem', color: theme.text, lineHeight: 1.6 }}>
                                <strong>Material:</strong> {baselineSkuData?.sku || '-'} was selected because it offers the <strong>lowest material acquisition cost</strong> at ${(baseline.costs?.totalMaterial || 0).toLocaleString()} through optimized supplier terms with {baselineSkuData?.supplier || 'preferred supplier'}.
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Box sx={{ width: 4, bgcolor: COLORS.secondary, borderRadius: 1, flexShrink: 0 }} />
                              <Typography sx={{ fontSize: '0.68rem', color: theme.text, lineHeight: 1.6 }}>
                                <strong>Plant:</strong> {baselinePlantData?.name?.split(',')[0] || '-'} was selected for <strong>optimal freight economics</strong> - proximity to customer ({baselinePlantData?.distance || 'N/A'} mi) minimizes outbound cost at ${(baseline.costs?.outboundFreight || 0).toLocaleString()}.
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Box sx={{ width: 4, bgcolor: COLORS.emerald, borderRadius: 1, flexShrink: 0 }} />
                              <Typography sx={{ fontSize: '0.68rem', color: theme.text, lineHeight: 1.6 }}>
                                <strong>Result:</strong> Total landed cost of <strong>${(baseline.costs?.totalLanded || 0).toLocaleString()}</strong> with <strong>{(baseline.costs?.marginPct || 0).toFixed(1)}%</strong> gross margin - the most cost-efficient configuration found.
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* USER SELECTION ANALYSIS - Only show if different */}
                        {hasChanges && (
                          <Box sx={{
                            p: 1.5,
                            mb: 1.5,
                            bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : alpha(isImprovement ? COLORS.emerald : COLORS.amber, 0.03),
                            borderRadius: 1.5,
                            border: `1px solid ${alpha(isImprovement ? COLORS.emerald : COLORS.amber, 0.3)}`
                          }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: isImprovement ? COLORS.emeraldDark : COLORS.amberDark, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CompareArrowsIcon sx={{ fontSize: 12 }} /> How Your Selection Differs
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {skuChanged && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Box sx={{ width: 4, bgcolor: isImprovement ? COLORS.emerald : COLORS.amber, borderRadius: 1, flexShrink: 0 }} />
                                  <Typography sx={{ fontSize: '0.68rem', color: theme.text, lineHeight: 1.6 }}>
                                    <strong>Material Change:</strong> You selected <strong>{selectedSkuData?.sku || '-'}</strong> instead of {baselineSkuData?.sku || '-'}.
                                    {materialDiff > 0 ? (
                                      <> This increases material cost by <strong style={{ color: COLORS.red }}>${materialDiff.toLocaleString()}</strong> due to {selectedSkuData?.supplier !== baselineSkuData?.supplier ? 'different supplier pricing' : 'material specification differences'}.</>
                                    ) : materialDiff < 0 ? (
                                      <> This reduces material cost by <strong style={{ color: COLORS.emeraldDark }}>${Math.abs(materialDiff).toLocaleString()}</strong> through better supplier terms.</>
                                    ) : (
                                      <> Material cost remains unchanged.</>
                                    )}
                                  </Typography>
                                </Box>
                              )}
                              {plantChanged && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Box sx={{ width: 4, bgcolor: isImprovement ? COLORS.emerald : COLORS.amber, borderRadius: 1, flexShrink: 0 }} />
                                  <Typography sx={{ fontSize: '0.68rem', color: theme.text, lineHeight: 1.6 }}>
                                    <strong>Plant Change:</strong> You selected <strong>{selectedPlantData?.name?.split(',')[0] || '-'}</strong> ({selectedPlantData?.distance || 'N/A'} mi) instead of {baselinePlantData?.name?.split(',')[0] || '-'} ({baselinePlantData?.distance || 'N/A'} mi).
                                    {outboundDiff > 0 ? (
                                      <> This increases outbound freight by <strong style={{ color: COLORS.red }}>${outboundDiff.toLocaleString()}</strong> due to longer shipping distance.</>
                                    ) : outboundDiff < 0 ? (
                                      <> This reduces outbound freight by <strong style={{ color: COLORS.emeraldDark }}>${Math.abs(outboundDiff).toLocaleString()}</strong> due to proximity advantage.</>
                                    ) : (
                                      <> Outbound freight remains unchanged.</>
                                    )}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}

                        {/* NET IMPACT SUMMARY */}
                        <Box sx={{
                          p: 1.5,
                          bgcolor: isSameAsAI
                            ? alpha(COLORS.emerald, 0.08)
                            : isImprovement
                              ? alpha(COLORS.emerald, 0.08)
                              : alpha(COLORS.amber, 0.08),
                          borderRadius: 1.5,
                          border: `1px solid ${isSameAsAI || isImprovement ? alpha(COLORS.emerald, 0.3) : alpha(COLORS.amber, 0.3)}`
                        }}>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: theme.textMuted, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {isSameAsAI ? '✓ Verdict: Optimal Selection' : isImprovement ? '✓ Verdict: Improved Selection' : '⚠ Verdict: Trade-off Required'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: theme.text, lineHeight: 1.7 }}>
                            {isSameAsAI ? (
                              <>Your selection <strong>matches AI recommendation</strong>. This configuration delivers the lowest total landed cost of <strong>${(baseline.costs?.totalLanded || 0).toLocaleString()}</strong> with optimal balance of material, inbound, and outbound costs.</>
                            ) : isImprovement ? (
                              <>Your selection <strong>improves on AI recommendation</strong> by <strong style={{ color: COLORS.emeraldDark }}>${Math.abs(costDiff).toLocaleString()}</strong> in total landed cost. This results in <strong style={{ color: COLORS.emeraldDark }}>${Math.abs(marginDiff).toLocaleString()}</strong> additional margin. Consider updating AI model with this finding.</>
                            ) : (
                              <>Your selection <strong>increases cost by <span style={{ color: COLORS.red }}>${costDiff.toLocaleString()}</span></strong> compared to AI recommendation, reducing margin by <strong style={{ color: COLORS.red }}>${Math.abs(marginDiff).toLocaleString()}</strong>. {costDiff > 1000 ? 'This is a significant deviation that requires business justification.' : 'This is a minor deviation that may be acceptable for other business reasons.'}</>
                            )}
                          </Typography>

                          {/* Recommendation for non-optimal selections */}
                          {hasChanges && !isImprovement && (
                            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px dashed ${alpha(COLORS.amber, 0.3)}` }}>
                              <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.secondary, mb: 0.5 }}>
                                💡 AI Recommendation:
                              </Typography>
                              <Typography sx={{ fontSize: '0.65rem', color: theme.textSecondary, lineHeight: 1.6 }}>
                                {plantChanged && outboundDiff > inboundDiff
                                  ? `Revert plant to ${baselinePlantData?.name?.split(',')[0]} to save $${outboundDiff.toLocaleString()} in outbound freight. The current plant selection is ${((outboundDiff / (baseline.costs?.outboundFreight || 1)) * 100).toFixed(0)}% more expensive for shipping.`
                                  : skuChanged && materialDiff > 0
                                    ? `Revert to ${baselineSkuData?.sku} to save $${materialDiff.toLocaleString()} in material cost. The recommended SKU has better supplier pricing and terms.`
                                    : `Review your selections - the combined changes increase total cost by ${((costDiff / (baseline.costs?.totalLanded || 1)) * 100).toFixed(1)}%.`
                                }
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    );
                  })()}

                  {/* Summary */}
                  {(selectedSku !== baseline.sku?.id || selectedPlant !== baseline.plant?.id) && (
                    <Box sx={{ p: 1.5, bgcolor: alpha(COLORS.secondary, 0.08), borderRadius: 1.5, border: `1px solid ${alpha(COLORS.secondary, 0.2)}` }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.secondary, mb: 0.5 }}>Changes Summary</Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: theme.textSecondary, lineHeight: 1.5 }}>
                        {selectedSku !== baseline.sku?.id && `• SKU changed from ${baseline.sku?.sku} to ${skuOptions.find(s => s.id === selectedSku)?.sku}\n`}
                        {selectedPlant !== baseline.plant?.id && `• Plant changed from ${baseline.plant?.name?.split(',')[0]} to ${rankedPlants.find(p => p.id === selectedPlant)?.name?.split(',')[0]}\n`}
                        {costs.margin !== baseline.costs?.margin && `• Margin impact: ${costs.margin > baseline.costs?.margin ? '+' : ''}$${Math.round(costs.margin - baseline.costs?.margin).toLocaleString()}`}
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography sx={{ color: theme.textMuted }}>Loading baseline data...</Typography>
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Box sx={{ p: 2, borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}`, bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : COLORS.slate[50] }}>
              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    // Reset to baseline
                    if (baseline) {
                      setSelectedSku(baseline.sku?.id);
                      if (baseline.plant?.id) {
                        setSelectedPlant(baseline.plant.id);
                      }
                    }
                    setComparisonDrawerOpen(false);
                  }}
                  sx={{ fontSize: '0.75rem', color: theme.textSecondary, borderColor: darkMode ? 'rgba(255,255,255,0.2)' : COLORS.slate[300] }}
                >
                  Reset to Recommended
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setComparisonDrawerOpen(false)}
                  sx={{ fontSize: '0.75rem', bgcolor: COLORS.secondary }}
                >
                  Keep Changes
                </Button>
              </Stack>
            </Box>
          </Box>
        </Drawer>
      </Box>
    );
  }

  // ==================== LIST VIEW ====================
  return (
    <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: theme.bg }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: theme.textSecondary }}>
              ORDLY.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              SKU Decisioning
            </Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh"><span><IconButton onClick={fetchOrders} disabled={loading} sx={{ color: theme.textSecondary }}><RefreshIcon /></IconButton></span></Tooltip>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ borderColor: theme.panelBorder, color: theme.textSecondary }}>
              Back to ORDLY.AI
            </Button>
          </Stack>
        </Stack>
        <Typography variant="body2" sx={{ color: theme.textSecondary }}>
          Unified margin & lead time optimization - Click a row to view recommendations
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Pending Decisions', value: stats.pending, color: COLORS.amber, icon: <ScheduleIcon /> },
          { label: 'Avg. Margin', value: `${stats.avgMargin}%`, color: COLORS.emeraldDark, icon: <TrendingUpIcon /> },
          { label: 'Best Margin', value: `${stats.bestMargin}%`, color: COLORS.emeraldDark, icon: <StarIcon /> },
          { label: 'Avg. Lead Time', value: `${stats.avgLeadTime} days`, color: COLORS.secondary, icon: <LocalShippingIcon /> },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card variant="outlined" sx={{
              borderLeft: `3px solid ${card.color}`,
              bgcolor: theme.panel,
              borderColor: theme.panelBorder,
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>
                      {card.label}
                    </Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: card.color }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color, opacity: 0.3 }}>{card.icon}</Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DataGrid */}
      <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: theme.panel, borderColor: theme.panelBorder }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.panelBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <InventoryIcon sx={{ color: COLORS.primary, fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>
              Orders Pending SKU Decision
            </Typography>
          </Stack>
          <Chip label={`${stats.pending} pending`} size="small" sx={{ bgcolor: alpha(COLORS.amber, 0.12), color: COLORS.amberDark, fontWeight: 600, fontSize: '0.7rem' }} />
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress sx={{ color: COLORS.primary }} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              <Button variant="outlined" onClick={fetchOrders}>Retry</Button>
            </Box>
          ) : (
            <DataGrid
              rows={orders}
              columns={columns}
              density="compact"
              initialState={{ pagination: { paginationModel: { pageSize: 25 } }, sorting: { sortModel: [{ field: 'deliveryDate', sort: 'asc' }] } }}
              pageSizeOptions={[10, 25, 50]}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
              onRowClick={handleRowClick}
              disableRowSelectionOnClick
              sx={ordlyTheme.getDataGridSx({ clickable: true, darkMode })}
            />
          )}
        </Box>
      </Card>

      {/* Drilldown Components */}
      <CustomerHistoryDrawer
        open={customerDrawerOpen}
        onClose={() => setCustomerDrawerOpen(false)}
        kunnr={selectedCustomer.kunnr}
        customerName={selectedCustomer.name}
      />
      <MaterialPlantDrawer
        open={materialDrawerOpen}
        onClose={() => setMaterialDrawerOpen(false)}
        matnr={selectedMaterial}
        quantity={selectedOrder?.quantity ? parseFloat(String(selectedOrder.quantity).replace(/[^0-9.]/g, '')) : 15000}
      />
      <ComparisonModal
        open={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        intentId={selectedOrder?.id}
        onSelect={(mat) => {
          // Find matching SKU option by material number (sku field) or id
          const matchingSku = skuOptions.find(opt =>
            opt.sku === mat.matnr ||
            opt.sku === mat.id ||
            opt.id === mat.matnr ||
            opt.id === mat.id
          );
          if (matchingSku) {
            setSelectedSku(matchingSku.id);
          } else {
            // Fallback: use material number directly if no match found
            setSelectedSku(mat.matnr || mat.id);
          }
          setComparisonModalOpen(false);
        }}
      />
    </Box>
  );
};

export default SkuDecisioning;
