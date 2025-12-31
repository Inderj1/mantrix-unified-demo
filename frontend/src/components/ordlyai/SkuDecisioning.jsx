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
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
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
} from '@mui/icons-material';
import ordlyTheme from './ordlyTheme';
import { CustomerHistoryDrawer, MaterialPlantDrawer, ComparisonModal } from './drilldowns';
import ConfirmationDialog from './ConfirmationDialog';
import InfoDialog from './InfoDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

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
      }));

      // Store order value for margin waterfall calculations
      if (data.order_value || data.line_value) {
        setSelectedOrder(prev => ({ ...prev, orderValue: data.order_value || data.line_value }));
      }

      setSkuOptions(options.length > 0 ? options : fallbackSkuOptions);

      // Restore previous selection for this line if exists
      const previousSelection = lineSkuSelections[lineNum];
      if (previousSelection) {
        setSelectedSku(previousSelection.skuId);
      } else {
        setSelectedSku(options.length > 0 ? options[0].id : 'SKU-001');
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

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/sku-optimizer/orders?limit=50`);
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

      // Only show orders at Decisioning stage (stage 1) or higher
      const orderList = allOrders.filter(order => order.stage >= 1);

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
    setActiveLineNumber(lineNumber);
    fetchSkuOptions(selectedOrder, lineNumber);
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
  };

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
    if (!selectedOrder) return;
    try {
      const orderId = selectedOrder.id.replace(/^(PO-|INT-|ORD-)/, '');
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/order/${orderId}/promote`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to promote order');
      const selectedSkuData = skuOptions.find(s => s.id === selectedSku);

      // Show themed confirmation dialog
      setConfirmDialog({
        open: true,
        order: { ...selectedOrder, stage: 2 },
        sku: selectedSkuData?.sku || 'selected',
      });
    } catch (err) {
      console.error('Error promoting order:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
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
                SKU & BOM Decisioning
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
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.secondary }}>
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

        {/* Flow Indicator */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
          py: 1.5,
          px: 3,
          bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : COLORS.slate[50],
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[200]}`,
        }}>
          {[
            { label: 'Intent Cockpit', complete: true },
            { label: 'SKU Decisioning', active: true, step: 1 },
            { label: 'Arbitration', step: 2 },
            { label: 'SAP Commit', step: 3 },
          ].map((item, idx) => (
            <React.Fragment key={item.label}>
              {idx > 0 && <Typography sx={{ color: theme.textMuted, fontSize: '0.75rem' }}>→</Typography>}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                bgcolor: item.active
                  ? alpha(COLORS.secondary, 0.15)
                  : item.complete
                    ? alpha(COLORS.primary, 0.1)
                    : darkMode ? 'rgba(255,255,255,0.03)' : COLORS.slate[100],
                border: item.active ? `1px solid ${alpha(COLORS.secondary, 0.4)}` : 'none',
                color: item.active || item.complete ? COLORS.secondary : theme.textMuted,
              }}>
                <Box sx={{ fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  {item.complete ? <CheckIcon sx={{ fontSize: 12 }} /> : item.step || ''}
                </Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{item.label}</Typography>
              </Box>
            </React.Fragment>
          ))}
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
            { label: 'Best Margin', value: `${bestMarginSku?.margin?.toFixed(1) || '32.4'}%`, color: COLORS.emeraldDark },
            { label: 'Exact Match', value: `${exactMatchSku?.margin?.toFixed(1) || '28.1'}%`, color: COLORS.amber },
            { label: 'Margin Uplift', value: formatCurrency(marginUplift > 0 ? marginUplift : 12200), color: COLORS.emeraldDark, prefix: '+' },
            { label: 'ATP Status', value: selectedSkuData.availability || 'In Stock', color: COLORS.emeraldDark },
            { label: 'Lead Time', value: `${selectedSkuData.leadTime || 5} days`, color: theme.text },
          ].map((item) => (
            <Card key={item.label} variant="outlined" sx={{
              bgcolor: darkMode ? 'rgba(15, 23, 42, 0.8)' : '#fff',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}`,
              textAlign: 'center',
              py: 1.5,
              px: 1,
            }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: item.color }}>
                {item.prefix || ''}{item.value}
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, mt: 0.5 }}>
                {item.label}
              </Typography>
            </Card>
          ))}
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 2.5, p: 2.5, flex: 1, overflow: 'auto' }}>
          {/* Left Panel: SKU Recommendation Ladder */}
          <Card variant="outlined" sx={{
            bgcolor: theme.panel,
            border: `1px solid ${theme.panelBorder}`,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <Box sx={{
              p: 2,
              borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}`,
              bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : COLORS.slate[50],
            }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: theme.text, mb: 0.5 }}>
                SKU Recommendation Ladder
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: theme.textMuted }}>
                {skuOptions.length} candidates ranked by margin optimization
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {skuOptionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <CircularProgress sx={{ color: COLORS.secondary }} />
                </Box>
              ) : skuOptions.map((option, idx) => (
                <Paper
                  key={option.id}
                  onClick={() => handleSkuSelect(option.id)}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    cursor: 'pointer',
                    borderRadius: 2.5,
                    bgcolor: selectedSku === option.id
                      ? alpha(COLORS.secondary, darkMode ? 0.15 : 0.08)
                      : darkMode ? 'rgba(0,0,0,0.3)' : '#fff',
                    border: selectedSku === option.id
                      ? `2px solid ${COLORS.secondary}`
                      : option.recommended
                        ? `2px solid ${alpha(COLORS.secondary, 0.5)}`
                        : `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}`,
                    boxShadow: selectedSku === option.id ? `0 0 20px ${alpha(COLORS.secondary, 0.2)}` : 'none',
                    opacity: option.notRecommended ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: alpha(COLORS.secondary, 0.3),
                    },
                  }}
                >
                  {/* SKU Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        bgcolor: option.recommended ? alpha(COLORS.secondary, 0.2) : alpha(COLORS.slate[400], 0.1),
                        color: option.recommended ? COLORS.secondary : theme.textSecondary,
                      }}>
                        {idx + 1}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: theme.text }}>
                          {option.sku}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: theme.textSecondary }}>
                          {option.name}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      {option.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.55rem',
                            fontWeight: 600,
                            bgcolor: tag.includes('RECOMMENDED') || tag.includes('FASTEST')
                              ? alpha(COLORS.secondary, 0.2)
                              : tag.includes('EXACT')
                                ? alpha(COLORS.primary, 0.2)
                                : tag.includes('NOT')
                                  ? alpha(COLORS.red, 0.2)
                                  : alpha(COLORS.amber, 0.2),
                            color: tag.includes('RECOMMENDED') || tag.includes('FASTEST')
                              ? COLORS.secondary
                              : tag.includes('EXACT')
                                ? COLORS.primary
                                : tag.includes('NOT')
                                  ? COLORS.red
                                  : COLORS.amber,
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* SKU Metrics */}
                  <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                    {[
                      { label: 'Margin', value: option.margin ? `${option.margin.toFixed(1)}%` : 'TBD', color: getMarginColor(option.margin) },
                      { label: 'Margin $', value: formatCurrency(option.marginDollar || (selectedOrder?.value * (option.margin || 0) / 100)), color: COLORS.emeraldDark },
                      { label: 'Availability', value: option.availability, color: getAvailabilityColor(option.availability) },
                      { label: 'Lead Time', value: `${option.leadTime}d @ ${option.plantName || option.plant || 'Iowa City'}`, color: getLeadTimeColor(option.leadTime) },
                    ].map((metric) => (
                      <Grid item xs={3} key={metric.label} sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: metric.color }}>
                          {metric.value}
                        </Typography>
                        <Typography sx={{ fontSize: '0.55rem', color: theme.textMuted, textTransform: 'uppercase' }}>
                          {metric.label}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>

                  {/* SKU Specs */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(option.specs || []).map((spec, i) => (
                      <Chip
                        key={i}
                        label={spec}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.6rem',
                          bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100],
                          color: theme.textSecondary,
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              ))}
            </Box>
          </Card>

          {/* Right Panel: AI Explainability */}
          <Card variant="outlined" sx={{
            bgcolor: theme.panel,
            border: `1px solid ${theme.panelBorder}`,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <Box sx={{
              p: 2,
              borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200]}`,
              bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : COLORS.slate[50],
            }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: theme.text, mb: 0.5 }}>
                AI Explainability
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: theme.textMuted }}>
                Analysis for {selectedSkuData.sku || 'selected SKU'}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {/* Recommendation Rationale - Dynamic based on selected SKU */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.text, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LightbulbIcon sx={{ fontSize: 14, color: COLORS.amber }} /> SKU Analysis
                </Typography>
                <Stack spacing={1}>
                  {(() => {
                    // Generate dynamic rationale based on selected SKU properties
                    const rationale = [];
                    const marginDiff = selectedSkuData.margin - (exactMatchSku?.margin || 25.8);

                    // Margin analysis
                    if (selectedSkuData.isMarginRec || selectedSkuData.recommended) {
                      rationale.push({ icon: <TrendingUpIcon sx={{ fontSize: 16, color: COLORS.emeraldDark }} />, text: `+${marginDiff.toFixed(1)}% highest margin option available` });
                    } else if (marginDiff > 0) {
                      rationale.push({ icon: <TrendingUpIcon sx={{ fontSize: 16, color: COLORS.secondary }} />, text: `+${marginDiff.toFixed(1)}% margin uplift vs exact match` });
                    } else if (marginDiff < 0) {
                      rationale.push({ icon: <TrendingUpIcon sx={{ fontSize: 16, color: COLORS.amber }} />, text: `${marginDiff.toFixed(1)}% lower margin than best option` });
                    } else {
                      rationale.push({ icon: <TrendingUpIcon sx={{ fontSize: 16, color: COLORS.secondary }} />, text: 'Baseline margin - exact match to PO specification' });
                    }

                    // Availability analysis
                    if (selectedSkuData.availability === 'In Stock') {
                      rationale.push({ icon: <InventoryIcon sx={{ fontSize: 16, color: COLORS.emeraldDark }} />, text: 'Full ATP available - no production wait required' });
                    } else if (selectedSkuData.availability === 'Partial') {
                      rationale.push({ icon: <InventoryIcon sx={{ fontSize: 16, color: COLORS.amber }} />, text: `Partial stock (${selectedSkuData.coveragePct || 65}% coverage) - production needed` });
                    } else {
                      rationale.push({ icon: <InventoryIcon sx={{ fontSize: 16, color: COLORS.redDark }} />, text: 'No stock available - full production run required' });
                    }

                    // SKU type analysis
                    if (selectedSkuData.isExactMatch) {
                      rationale.push({ icon: <CheckCircleIcon sx={{ fontSize: 16, color: COLORS.emeraldDark }} />, text: 'Exact match to customer PO specification' });
                    } else if (selectedSkuData.tags?.includes('NOT RECOMMENDED')) {
                      rationale.push({ icon: <SwapHorizIcon sx={{ fontSize: 16, color: COLORS.redDark }} />, text: 'New SKU creation - extended lead time and setup costs' });
                    } else {
                      rationale.push({ icon: <SwapHorizIcon sx={{ fontSize: 16, color: COLORS.secondary }} />, text: 'Customer pre-approved this SKU as acceptable alternate' });
                    }

                    // Lead time analysis
                    if (selectedSkuData.isLeadTimeRec) {
                      rationale.push({ icon: <LocalShippingIcon sx={{ fontSize: 16, color: COLORS.emeraldDark }} />, text: `Fastest option - ${selectedSkuData.leadTime} day lead time` });
                    } else {
                      rationale.push({ icon: <LocalShippingIcon sx={{ fontSize: 16, color: COLORS.secondary }} />, text: `${selectedSkuData.leadTime} day lead time from ${selectedSkuData.plantName || 'plant'}` });
                    }

                    return rationale;
                  })().map((item, i) => (
                    <Paper key={i} sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      p: 1.5,
                      bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : COLORS.slate[50],
                      borderRadius: 1.5,
                    }}>
                      <Box sx={{ mt: 0.25 }}>{item.icon}</Box>
                      <Typography sx={{ fontSize: '0.7rem', color: theme.textSecondary, lineHeight: 1.5 }}>
                        <strong style={{ color: COLORS.secondary }}>{item.text.split(' ')[0]}</strong> {item.text.split(' ').slice(1).join(' ')}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              {/* Margin Waterfall */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.text, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ fontSize: 14, color: COLORS.primary }} /> Margin Waterfall
                </Typography>
                <Paper sx={{
                  p: 2,
                  bgcolor: darkMode ? 'rgba(0,0,0,0.2)' : COLORS.slate[50],
                  borderRadius: 2,
                }}>
                  {(() => {
                    // Calculate waterfall based on selected SKU and actual order value
                    const marginPct = selectedSkuData.margin || 28;
                    // Use order value from API or selected order, not derived backwards
                    const orderValue = selectedOrder?.orderValue || selectedOrder?.value || 36750;
                    // Calculate margin dollar from order value and margin percentage
                    const marginDollar = selectedSkuData.marginDollar || (orderValue * marginPct / 100);
                    const totalCosts = orderValue - marginDollar;
                    // Split costs proportionally: Material 60%, Conversion 25%, Freight 15%
                    const materialCost = totalCosts * 0.60;
                    const conversionCost = totalCosts * 0.25;
                    const freightCost = totalCosts * 0.15;

                    return [
                      { label: 'Order Value', value: formatCurrency(orderValue), pct: 100, positive: true },
                      { label: 'Material Cost', value: `-${formatCurrency(materialCost)}`, pct: Math.round((materialCost / orderValue) * 100), positive: false },
                      { label: 'Conversion', value: `-${formatCurrency(conversionCost)}`, pct: Math.round((conversionCost / orderValue) * 100), positive: false },
                      { label: 'Freight', value: `-${formatCurrency(freightCost)}`, pct: Math.round((freightCost / orderValue) * 100), positive: false },
                      { label: 'Landed Margin', value: formatCurrency(marginDollar), pct: Math.round(marginPct), positive: true, marginPct },
                    ];
                  })().map((item) => (
                    <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ width: 85, fontSize: '0.6rem', color: theme.textMuted, textTransform: 'uppercase', flexShrink: 0 }}>
                        {item.label}
                      </Typography>
                      <Box sx={{ flex: 1, height: 18, bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100], borderRadius: 1, overflow: 'hidden', mr: 1 }}>
                        <Box sx={{
                          width: `${item.pct}%`,
                          height: '100%',
                          background: item.positive
                            ? `linear-gradient(90deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`
                            : `linear-gradient(90deg, ${COLORS.red} 0%, ${COLORS.redDark} 100%)`,
                          borderRadius: 1,
                        }} />
                      </Box>
                      <Typography sx={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        color: item.positive ? COLORS.primary : COLORS.redDark,
                        minWidth: 70,
                        textAlign: 'right',
                      }}>
                        {item.value}{item.marginPct ? ` (${item.marginPct.toFixed(1)}%)` : ''}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Box>

              {/* Option Comparison */}
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.text, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CompareArrowsIcon sx={{ fontSize: 14, color: COLORS.primary }} /> Option Comparison
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: theme.textMuted, fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', borderColor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200] }}>SKU</TableCell>
                      <TableCell sx={{ color: theme.textMuted, fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', borderColor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200] }}>Margin</TableCell>
                      <TableCell sx={{ color: theme.textMuted, fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', borderColor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200] }}>ATP</TableCell>
                      <TableCell sx={{ color: theme.textMuted, fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', borderColor: darkMode ? 'rgba(255,255,255,0.1)' : COLORS.slate[200] }}>Lead/Plant</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {skuOptions.slice(0, 4).map((opt) => (
                      <TableRow key={opt.id} sx={{
                        bgcolor: selectedSku === opt.id ? alpha(COLORS.secondary, 0.1) : 'transparent',
                      }}>
                        <TableCell sx={{ fontSize: '0.7rem', color: theme.text, borderColor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100] }}>{opt.sku?.slice(-12)}</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', color: getMarginColor(opt.margin), fontWeight: 600, borderColor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100] }}>{opt.margin?.toFixed(1)}%</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', color: opt.availability === 'In Stock' ? COLORS.emeraldDark : theme.textSecondary, borderColor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100] }}>{opt.availability === 'In Stock' ? <CheckIcon sx={{ fontSize: 14 }} /> : opt.availability}</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', color: theme.text, borderColor: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.slate[100] }}>{opt.leadTime}d @ {opt.plantName || opt.plant || 'IA'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
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
          bgcolor: darkMode ? 'rgba(0,0,0,0.3)' : COLORS.slate[50],
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
              onClick={() => setComparisonModalOpen(true)}
              sx={{
                color: theme.textSecondary,
                borderColor: darkMode ? 'rgba(255,255,255,0.2)' : COLORS.slate[300],
                fontSize: '0.75rem',
                '&:hover': { borderColor: theme.textSecondary },
              }}
            >
              Override Selection
            </Button>
            <Tooltip
              title={!getLineProgress().allConfigured ? `Configure all ${getLineProgress().total} lines before proceeding` : ''}
              placement="top"
            >
              <span>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSelectAndContinue}
                  disabled={!getLineProgress().allConfigured}
                  sx={{
                    background: getLineProgress().allConfigured
                      ? `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`
                      : alpha(COLORS.slate[400], 0.3),
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '&:hover': { boxShadow: getLineProgress().allConfigured ? `0 4px 15px ${alpha(COLORS.secondary, 0.3)}` : 'none' },
                    '&:disabled': {
                      color: 'rgba(255,255,255,0.5)',
                    },
                  }}
                >
                  {(selectedOrder?.lineCount || 1) > 1
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
              SKU & BOM Decisioning
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
                    <Typography variant="h4" fontWeight={700} sx={{ color: card.color }}>
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
