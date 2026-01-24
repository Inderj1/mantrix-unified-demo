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
  Slider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  CompareArrows as CompareArrowsIcon,
  Tune as TuneIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  Inventory as InventoryIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import ordlyTheme from './ordlyTheme';
import { CustomerHistoryDrawer, MaterialPlantDrawer, ComparisonModal } from './drilldowns';
import InfoDialog from './InfoDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Primary blue color for ORDLY.AI
const PRIMARY_BLUE = '#002352';
const ACCENT_BLUE = '#1976d2';

// Fallback SKU options (used when API fails)
const fallbackSkuOptions = [
  { id: 'SKU-001', sku: 'RL-PET50-SIL-S', name: 'PET 50um Standard Silicone Release Liner', margin: 32.4, revenue: '$36,600', marginDollar: '$11,858', availability: 'In Stock', leadTime: '5 days', recommended: true, tags: ['Spec Alternate', '18,500 LM ATP'] },
  { id: 'SKU-002', sku: 'RL-PET50-SIL-P', name: 'PET 50um Premium Silicone Release Liner', margin: 28.1, revenue: '$36,750', marginDollar: '$10,328', availability: '8,200 LM', leadTime: '7 days', recommended: false, tags: ['Exact Spec', 'Partial Production'] },
  { id: 'SKU-003', sku: 'RL-PET48-SIL-P', name: 'PET 48um Premium Silicone (Within Tolerance)', margin: 26.8, revenue: '$35,400', marginDollar: '$9,487', availability: '22,000 LM', leadTime: '4 days', recommended: false, tags: ['Thickness -2um', 'Full Stock'] },
];

// Helper to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
};

// Helper to format availability
const formatAvailability = (stock, coverage) => {
  if (coverage >= 100) return 'In Stock';
  if (stock > 0) return `${stock.toLocaleString()} LM`;
  return 'N/A';
};

const SkuBomOptimizer = ({ onBack, darkMode = false, selectedOrder: initialOrder = null }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [plantValue, setPlantValue] = useState(1);
  const [expediteValue, setExpediteValue] = useState(0);

  // Info dialog state (replaces browser alerts)
  const [infoDialog, setInfoDialog] = useState({ open: false, title: '', message: '', type: 'info' });

  // API data state
  const [skuOrders, setSkuOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ pending: 0, avgMargin: '0.0', altRate: '0%', totalSavings: '$0' });

  // Auto-select order passed from Pipeline navigation
  useEffect(() => {
    if (initialOrder && skuOrders.length > 0) {
      // Find matching order by ID (strip PO- prefix if present)
      const orderId = initialOrder.id?.replace('PO-', '') || initialOrder.id;
      const matchingOrder = skuOrders.find(o =>
        o.id === orderId ||
        o.id === `INT-${orderId}` ||
        o.id?.includes(orderId)
      );
      if (matchingOrder) {
        setSelectedOrder(matchingOrder);
      }
    }
  }, [initialOrder, skuOrders]);

  // SKU Options state (fetched from ML-powered API)
  const [skuOptions, setSkuOptions] = useState([]);
  const [skuOptionsLoading, setSkuOptionsLoading] = useState(false);
  const [tradeOffAnalysis, setTradeOffAnalysis] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [marginRecommendation, setMarginRecommendation] = useState(null);

  // Drilldown state
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);
  const [materialDrawerOpen, setMaterialDrawerOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState({ kunnr: null, name: null });
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Fetch real-time SKU options from ML-powered API
  const fetchSkuOptions = async (order) => {
    setSkuOptionsLoading(true);
    try {
      // Extract customer ID and spec from order
      const customerId = order.customerId || order.customer_id || '0000100001';
      const requestedSpec = order.requestedSpec || order.requested_spec || 'PET 50um Silicone Release Liner';
      const quantity = parseFloat(String(order.quantity).replace(/[^0-9.]/g, '')) || 15000;

      console.log('Fetching SKU options for:', { customerId, requestedSpec, quantity });
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/sku-options?_t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({
          customer_id: customerId,
          requested_spec: requestedSpec,
          quantity: quantity,
          requested_date: order.deliveryDate || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch SKU options');
      const data = await response.json();
      console.log('SKU options received:', data.sku_options?.map(o => `${o.matnr} (${o.margin_pct}%)`));

      // Transform API response to component format
      const options = (data.sku_options || []).map((opt, idx) => ({
        id: `SKU-${String(idx + 1).padStart(3, '0')}`,
        sku: opt.matnr || opt.sku,
        name: opt.description || opt.name,
        margin: opt.margin_pct,
        revenue: formatCurrency(opt.total_revenue),
        marginDollar: formatCurrency(opt.margin_dollar),
        availability: formatAvailability(opt.available_stock, opt.coverage_pct),
        leadTime: `${opt.lead_time_days} days`,
        recommended: opt.is_margin_rec || false,
        isLeadTimeRec: opt.is_leadtime_rec || false,
        tags: opt.tags || [],
        // Keep raw data for drilldowns
        matnr: opt.matnr,
        coveragePct: opt.coverage_pct,
        stockStatus: opt.stock_status,
        leadTimeBreakdown: opt.lead_time_breakdown,
        plant: opt.plant,
        plantName: opt.plant_name,
        unitCost: opt.unit_cost,
        unitPrice: opt.unit_price,
        totalCost: opt.total_cost,
      }));

      setSkuOptions(options);
      setSelectedSku(options.length > 0 ? options[0].id : null);
      setMarginRecommendation(data.margin_recommendation);
      setTradeOffAnalysis(data.trade_off_analysis);
      setComparisonData(data.comparison_data || []);

    } catch (err) {
      console.error('Error fetching SKU options:', err);
      // Use fallback options
      setSkuOptions(fallbackSkuOptions);
      setSelectedSku('SKU-001');
    } finally {
      setSkuOptionsLoading(false);
    }
  };

  // Fetch SKU optimizer orders from API
  const fetchSkuOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/sku-optimizer/orders?limit=3`);  // TODO: Increase to 50 after validation
      if (!response.ok) throw new Error('Failed to fetch SKU optimizer orders');
      const data = await response.json();

      // Transform API data to match DataGrid format
      const orders = data.orders.map(order => ({
        id: order.intent_id || order.id,
        status: order.status || 'pending',
        customer: order.customer,
        customerId: order.customerId || order.customer_id || '',
        materialId: order.materialId || order.material_id || '',
        plant: order.plant || '2100',
        requestedSpec: order.requested_spec || order.requestedSpec || 'N/A',
        quantity: order.quantity,
        recommendedSku: order.recommended_sku || order.recommendedSku || 'TBD',
        margin: order.margin,  // Can be null - will show as 'TBD'
        marginSavings: order.margin_savings || order.marginSavings || '$0',
        deliveryDate: order.delivery_date || order.deliveryDate || 'TBD',
      }));

      setSkuOrders(orders);

      // Calculate stats - filter out null margins
      const pendingCount = orders.filter(o => o.status === 'pending').length;
      const marginsWithValue = orders.filter(o => o.margin != null);
      const avgMargin = marginsWithValue.length > 0
        ? (marginsWithValue.reduce((sum, o) => sum + o.margin, 0) / marginsWithValue.length).toFixed(1)
        : '0.0';
      const altCount = orders.filter(o => o.recommendedSku && o.recommendedSku !== 'TBD').length;
      const altRate = orders.length > 0 ? `${Math.round((altCount / orders.length) * 100)}%` : '0%';

      setStats({
        pending: pendingCount,
        avgMargin: avgMargin,
        altRate: data.stats?.altRate || altRate,
        totalSavings: data.stats?.totalSavings || '$0',
      });
    } catch (err) {
      console.error('Error fetching SKU orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchSkuOrders();
  }, []);

  // DataGrid columns
  const columns = [
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const colors = {
          pending: { bg: alpha('#f59e0b', 0.12), color: '#d97706' },
          completed: { bg: alpha('#10b981', 0.12), color: '#059669' },
        };
        const style = colors[params.value] || colors.pending;
        return <Chip label={params.value.toUpperCase()} size="small" sx={{ ...style, fontWeight: 600, fontSize: '0.65rem' }} />;
      },
    },
    {
      field: 'id',
      headerName: 'Purchase Order',
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.8rem' }}>{params.value}</Typography>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{params.value}</Typography>
      ),
    },
    {
      field: 'requestedSpec',
      headerName: 'Requested Spec',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{params.value}</Typography>
      ),
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{params.value}</Typography>
      ),
    },
    {
      field: 'recommendedSku',
      headerName: 'Rec. SKU',
      width: 140,
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ bgcolor: alpha('#002352', 0.12), color: '#1565c0', fontWeight: 600, fontSize: '0.65rem' }} />
      ),
    },
    {
      field: 'margin',
      headerName: 'Margin',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        if (params.value == null) {
          return <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#64748b' }}>TBD</Typography>;
        }
        const color = params.value >= 30 ? '#059669' : params.value >= 25 ? '#d97706' : '#dc2626';
        return <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color }}>{params.value.toFixed(1)}%</Typography>;
      },
    },
    {
      field: 'marginSavings',
      headerName: 'Alt. Savings',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: params.value !== '$0' ? '#059669' : '#64748b' }}>{params.value}</Typography>
      ),
    },
    {
      field: 'deliveryDate',
      headerName: 'Delivery',
      width: 110,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{params.value}</Typography>
      ),
    },
  ];

  const handleRowClick = (params) => {
    const order = params.row;
    setSelectedOrder(order);
    // Fetch real-time SKU options from ML API
    fetchSkuOptions(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
    setSkuOptions([]);
    setSelectedSku(null);
  };

  // Export handler
  const handleExport = () => {
    window.open(`${API_BASE_URL}/api/ordlyai/pipeline/export`, '_blank');
  };

  // Select & Continue handler - promotes order to next stage
  const handleSelectAndContinue = async () => {
    if (!selectedOrder) return;
    try {
      const orderId = selectedOrder.id.replace('INT-', '');
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/order/${orderId}/promote`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to promote order');
      const result = await response.json();
      const selectedSkuData = skuOptions.find(s => s.id === selectedSku);
      setInfoDialog({
        open: true,
        title: 'SKU Confirmed',
        message: `SKU ${selectedSkuData?.sku || 'selected'} confirmed!\n\nOrder ${selectedOrder.id} has been promoted to the Lead Time stage.`,
        type: 'success',
      });
      setSelectedOrder(null);
      setSkuOptions([]);
      setSelectedSku(null);
      fetchSkuOrders();
    } catch (err) {
      console.error('Error promoting order:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    }
  };

  const getAvailabilityColor = (availability) => {
    if (availability === 'In Stock' || availability.includes('22,000')) return '#059669';
    if (availability.includes('8,200')) return '#d97706';
    return '#dc2626';
  };

  // ==================== DETAIL VIEW ====================
  if (selectedOrder) {
    return (
      <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#0d1117' : '#f8fafc', overflow: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>ORDLY.AI</Link>
              <Link component="button" variant="body1" onClick={handleBackToList} sx={{ textDecoration: 'none', color: 'text.primary' }}>Margin Based Recommendation</Link>
              <Typography color="primary" variant="body1" fontWeight={600}>{selectedOrder.id}</Typography>
            </Breadcrumbs>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <SettingsIcon sx={{ fontSize: 40, color: '#002352' }} />
            <Box>
              <Typography variant="h5" fontWeight={600}>{selectedOrder.customer}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedOrder.requestedSpec} - {selectedOrder.quantity}</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Order Context Bar */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ py: 1.5, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { label: 'Order Intent', value: selectedOrder.id, color: '#1565c0' },
              { label: 'Customer', value: selectedOrder.customer },
              { label: 'Requested Spec', value: selectedOrder.requestedSpec },
              { label: 'Quantity', value: selectedOrder.quantity },
              { label: 'Requested Delivery', value: selectedOrder.deliveryDate, color: '#d97706' },
            ].map((field) => (
              <Box key={field.label}>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{field.label}</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: field.color || 'text.primary', fontSize: '0.85rem' }}>{field.value}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Main Grid */}
        <Grid container spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {/* Left Panel: SKU Ladder */}
          <Grid item xs={12} md={7}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUpIcon sx={{ color: '#002352', fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>SKU Recommendation Ladder</Typography>
                  {skuOptionsLoading && <CircularProgress size={14} />}
                </Stack>
                <Chip label={`${skuOptions.length} options`} size="small" sx={{ bgcolor: alpha('#002352', 0.12), color: '#1565c0', fontWeight: 600, fontSize: '0.7rem' }} />
              </Box>
              <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
                {skuOptionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <CircularProgress />
                  </Box>
                ) : skuOptions.length === 0 ? (
                  <Alert severity="info">No SKU options found. Try adjusting the specification.</Alert>
                ) : skuOptions.map((option, idx) => (
                  <Paper
                    key={option.id}
                    variant="outlined"
                    onClick={() => setSelectedSku(option.id)}
                    sx={{ p: 2, mb: 2, borderLeft: selectedSku === option.id ? '3px solid #002352' : option.recommended ? '3px solid #10b981' : '3px solid transparent', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', bgcolor: selectedSku === option.id ? alpha('#002352', 0.05) : 'transparent', '&:hover': { borderColor: '#002352', bgcolor: alpha('#002352', 0.03) } }}
                  >
                    <Chip label={option.recommended ? 'Recommended' : `#${idx + 1}`} size="small" icon={option.recommended ? <StarIcon sx={{ fontSize: 14 }} /> : undefined} sx={{ position: 'absolute', top: -10, left: 20, bgcolor: option.recommended ? '#10b981' : alpha('#64748b', 0.1), color: option.recommended ? 'white' : '#64748b', fontWeight: 600, fontSize: '0.65rem' }} />
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={8}>
                        <Typography variant="body1" fontWeight={700} sx={{ fontSize: '0.9rem' }}>{option.sku}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>{option.name}</Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" fontWeight={700} sx={{ color: option.margin ? '#059669' : '#8b5cf6' }}>{option.margin ? `${option.margin}%` : 'TBD'}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Landed Margin</Typography>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                      {[{ label: 'Revenue', value: option.revenue }, { label: 'Margin $', value: option.marginDollar }, { label: 'Availability', value: option.availability }, { label: 'Lead Time', value: option.leadTime }].map((metric) => (
                        <Grid item xs={3} key={metric.label} sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" fontWeight={600} sx={{ color: metric.label === 'Availability' ? getAvailabilityColor(metric.value) : 'text.primary', fontSize: '0.8rem' }}>{metric.value}</Typography>
                          <Typography sx={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.6rem' }}>{metric.label}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, flexWrap: 'wrap' }}>
                      {(option.tags || []).map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={{ bgcolor: tag.includes('Exact') || tag.includes('Match') ? alpha('#10b981', 0.12) : tag.includes('Alternate') || tag.includes('Thickness') ? alpha('#f59e0b', 0.12) : tag.includes('Stock') || tag.includes('ATP') || tag.includes('Fast') ? alpha('#002352', 0.12) : alpha('#8b5cf6', 0.12), color: tag.includes('Exact') || tag.includes('Match') ? '#059669' : tag.includes('Alternate') || tag.includes('Thickness') ? '#d97706' : tag.includes('Stock') || tag.includes('ATP') || tag.includes('Fast') ? '#1565c0' : '#7c3aed', fontSize: '0.6rem', fontWeight: 600, height: 20 }} />
                      ))}
                    </Box>
                  </Paper>
                ))}
              </Box>
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CompareArrowsIcon />}
                  onClick={() => setComparisonModalOpen(true)}
                  sx={{ flex: 1, fontSize: '0.75rem' }}
                >
                  Compare All
                </Button>
                <Button variant="contained" size="small" onClick={handleSelectAndContinue} sx={{ flex: 1, fontSize: '0.75rem', bgcolor: '#002352', '&:hover': { bgcolor: '#1565c0' } }}>Select & Continue</Button>
              </Box>
            </Card>
          </Grid>

          {/* Right Panel: Explainability */}
          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                <LightbulbIcon sx={{ color: '#002352', fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Decision Explainability</Typography>
              </Box>
              <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
                {/* AI Recommendation - Dynamic */}
                {marginRecommendation && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, borderLeft: '3px solid #10b981', bgcolor: alpha('#10b981', 0.05) }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#059669', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LightbulbIcon sx={{ fontSize: 14 }} /> Why {marginRecommendation.matnr || marginRecommendation.sku} is Recommended
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.8, fontSize: '0.75rem' }}>
                      <strong>Margin Optimization:</strong> {marginRecommendation.margin_pct}% margin yields <strong>{formatCurrency(marginRecommendation.margin_dollar)}</strong>.<br /><br />
                      <strong>Stock Status:</strong> {marginRecommendation.stock_status === 'full' ? 'Full quantity available' : marginRecommendation.coverage_pct + '% coverage'} at {marginRecommendation.plant_name || marginRecommendation.plant}.<br /><br />
                      <strong>Lead Time:</strong> {marginRecommendation.lead_time_days} days to delivery.<br /><br />
                      <strong>Confidence:</strong> {marginRecommendation.margin_confidence || 'high'} prediction confidence.
                    </Typography>
                  </Paper>
                )}

                {/* Margin Waterfall - Dynamic based on selected SKU */}
                {skuOptions.length > 0 && (() => {
                  const selected = skuOptions.find(s => s.id === selectedSku) || skuOptions[0];
                  const revenue = selected.totalCost ? selected.totalCost / (1 - (selected.margin || 25) / 100) : 36600;
                  const materialCost = selected.totalCost || revenue * 0.45;
                  const margin = selected.margin || 25;
                  const marginDollar = revenue * margin / 100;
                  const waterfallItems = [
                    { label: 'Revenue', value: formatCurrency(revenue), percentage: 100, type: 'positive' },
                    { label: 'Material Cost', value: `-${formatCurrency(materialCost)}`, percentage: Math.round(materialCost / revenue * 100), type: 'negative' },
                    { label: 'Conversion', value: `-${formatCurrency(revenue * 0.18)}`, percentage: 18, type: 'negative' },
                    { label: 'Freight Est.', value: `-${formatCurrency(revenue * 0.05)}`, percentage: 5, type: 'negative' },
                    { label: 'Landed Margin', value: formatCurrency(marginDollar), percentage: Math.round(margin), type: 'positive' },
                  ];
                  return (
                    <>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}><TrendingUpIcon sx={{ fontSize: 14 }} /> Margin Waterfall</Typography>
                      <Box sx={{ mb: 2 }}>
                        {waterfallItems.map((item) => (
                          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography sx={{ width: 90, color: '#64748b', textTransform: 'uppercase', fontSize: '0.65rem' }}>{item.label}</Typography>
                            <Box sx={{ flex: 1, height: 20, bgcolor: alpha('#64748b', 0.08), borderRadius: 1, overflow: 'hidden' }}>
                              <Box sx={{ width: `${item.percentage}%`, height: '100%', bgcolor: item.type === 'positive' ? '#002352' : '#ef4444', borderRadius: 1 }} />
                            </Box>
                            <Typography sx={{ width: 80, textAlign: 'right', color: item.label === 'Landed Margin' ? '#059669' : 'text.primary', fontWeight: 600, fontSize: '0.75rem' }}>{item.value}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  );
                })()}

                {/* Comparison Table - Dynamic */}
                {comparisonData.length > 0 && (
                  <>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}><CompareArrowsIcon sx={{ fontSize: 14 }} /> Option Comparison</Typography>
                    <Table size="small" sx={{ mb: 2 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Factor</TableCell>
                          <TableCell sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Option 1</TableCell>
                          <TableCell sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Option 2</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {comparisonData.map((row) => (
                          <TableRow key={row.factor} sx={{ '&:hover': { bgcolor: alpha('#002352', 0.05) } }}>
                            <TableCell sx={{ color: '#64748b', fontSize: '0.75rem' }}>{row.factor}</TableCell>
                            <TableCell sx={{ color: row.winner === 'opt1' ? '#059669' : '#64748b', fontWeight: row.winner === 'opt1' ? 600 : 400, fontSize: '0.75rem' }}>{row.opt1}</TableCell>
                            <TableCell sx={{ color: row.winner === 'opt2' ? '#059669' : '#64748b', fontWeight: row.winner === 'opt2' ? 600 : 400, fontSize: '0.75rem' }}>{row.opt2}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}

                {/* Sensitivity */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}><TuneIcon sx={{ fontSize: 14 }} /> Sensitivity Analysis</Typography>
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>Ship from Plant</Typography>
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{['2100 (Chicago)', '2500 (Ohio)', '3000 (Texas)'][plantValue - 1]}</Typography>
                    </Box>
                    <Slider size="small" value={plantValue} min={1} max={3} onChange={(e, v) => setPlantValue(v)} sx={{ color: '#002352' }} />
                  </Box>
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>Expedite Premium</Typography>
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{expediteValue}%</Typography>
                    </Box>
                    <Slider size="small" value={expediteValue} min={0} max={25} onChange={(e, v) => setExpediteValue(v)} sx={{ color: '#002352' }} />
                  </Box>
                </Paper>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // ==================== LIST VIEW (DataGrid) ====================
  return (
    <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#0d1117' : '#f8fafc', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>ORDLY.AI</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Margin Based Recommendation</Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh"><span><IconButton color="primary" onClick={fetchSkuOrders} disabled={loading}><RefreshIcon /></IconButton></span></Tooltip>
            <Tooltip title="Export"><IconButton color="primary" onClick={handleExport}><DownloadIcon /></IconButton></Tooltip>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back to ORDLY.AI</Button>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <SettingsIcon sx={{ fontSize: 40, color: '#002352' }} />
          <Typography variant="h5" fontWeight={600}>Margin Based Recommendation</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">AI-powered margin-based product recommendation - Click a row to view details</Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Pending Decision', value: stats.pending, color: '#f59e0b' },
          { label: 'Avg. Margin', value: `${stats.avgMargin}%`, color: '#10b981' },
          { label: 'Alt. SKU Rate', value: stats.altRate, color: '#002352' },
          { label: 'Total Savings', value: stats.totalSavings, color: '#10b981' },
          { label: 'Avg. Lead Time', value: '5.2 days', color: '#8b5cf6' },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={2.4} key={card.label}>
            <Card variant="outlined" sx={{ borderLeft: `3px solid ${card.color}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>{card.label}</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: card.color }}>{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DataGrid */}
      <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <InventoryIcon sx={{ color: '#002352', fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Orders Pending SKU Decision</Typography>
          </Stack>
          <Chip label={`${stats.pending} pending`} size="small" sx={{ bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', fontWeight: 600, fontSize: '0.7rem' }} />
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              <Button variant="outlined" onClick={fetchSkuOrders}>Retry</Button>
            </Box>
          ) : (
            <DataGrid
              rows={skuOrders}
              columns={columns}
              density="compact"
              initialState={{ pagination: { paginationModel: { pageSize: 25 } }, sorting: { sortModel: [{ field: 'deliveryDate', sort: 'asc' }] } }}
              pageSizeOptions={[10, 25, 50]}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
              onRowClick={handleRowClick}
              disableRowSelectionOnClick
              sx={{
                border: '1px solid rgba(0,0,0,0.08)',
                '& .MuiDataGrid-cell': { fontSize: '0.8rem' },
                '& .MuiDataGrid-columnHeader': { bgcolor: darkMode ? '#1e293b' : '#f1f5f9', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' },
                '& .MuiDataGrid-row:hover': { bgcolor: alpha('#002352', 0.08), cursor: 'pointer' },
              }}
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
        quantity={selectedOrder?.quantity ? parseFloat(selectedOrder.quantity.replace(/[^0-9.]/g, '')) : 15000}
      />
      <ComparisonModal
        open={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        intentId={selectedOrder?.id}
        onSelect={(mat) => {
          setSelectedSku(mat.matnr);
          setComparisonModalOpen(false);
        }}
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
};

export default SkuBomOptimizer;
