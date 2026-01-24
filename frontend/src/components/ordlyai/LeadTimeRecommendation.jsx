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
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Speed as SpeedIcon,
  Lightbulb as LightbulbIcon,
  CompareArrows as CompareArrowsIcon,
  Tune as TuneIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import ordlyTheme from './ordlyTheme';
import { CustomerHistoryDrawer, MaterialPlantDrawer, ComparisonModal } from './drilldowns';
import InfoDialog from './InfoDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Primary blue color for ORDLY.AI
const PRIMARY_BLUE = '#002352';
const ACCENT_BLUE = '#1976d2';

// SKU options for detail view - sorted by lead time
const skuOptions = [
  { id: 'SKU-003', sku: 'RL-PET48-SIL-P', name: 'PET 48um Premium Silicone (Within Tolerance)', margin: 26.8, revenue: '$35,400', marginDollar: '$9,487', availability: '22,000 LM', leadTime: '4 days', recommended: true, tags: ['Fastest Delivery', 'Full Stock'] },
  { id: 'SKU-001', sku: 'RL-PET50-SIL-S', name: 'PET 50um Standard Silicone Release Liner', margin: 32.4, revenue: '$36,600', marginDollar: '$11,858', availability: 'In Stock', leadTime: '5 days', recommended: false, tags: ['Spec Alternate', '18,500 LM ATP'] },
  { id: 'SKU-002', sku: 'RL-PET50-SIL-P', name: 'PET 50um Premium Silicone Release Liner', margin: 28.1, revenue: '$36,750', marginDollar: '$10,328', availability: '8,200 LM', leadTime: '7 days', recommended: false, tags: ['Exact Spec', 'Partial Production'] },
  { id: 'SKU-NEW', sku: 'NEW SKU REQUIRED', name: 'Custom spec not in catalog - requires qualification', margin: null, revenue: '$38,250', marginDollar: '~$9,500', availability: 'N/A', leadTime: '21+ days', recommended: false, tags: ['Trial Required'] },
];

const leadTimeBreakdown = [
  { label: 'Production', value: '2 days', percentage: 50, type: 'neutral' },
  { label: 'Quality Check', value: '0.5 days', percentage: 12, type: 'neutral' },
  { label: 'Packaging', value: '0.5 days', percentage: 13, type: 'neutral' },
  { label: 'Transit', value: '1 day', percentage: 25, type: 'neutral' },
  { label: 'Total Lead Time', value: '4 days', percentage: 100, type: 'positive' },
];

const comparisonData = [
  { factor: 'Lead Time', opt1: '4 days', opt2: '5 days', winner: 'opt1' },
  { factor: 'Time to Customer', opt1: 'Jan 15', opt2: 'Jan 16', winner: 'opt1' },
  { factor: 'Spec Match', opt1: 'Thickness -2um', opt2: 'Standard Grade', winner: 'opt2' },
  { factor: 'Landed Margin', opt1: '26.8%', opt2: '32.4%', winner: 'opt2' },
  { factor: 'ATP Coverage', opt1: '147%', opt2: '123%', winner: 'opt1' },
  { factor: 'Expedite Cost', opt1: '$0', opt2: '$0', winner: 'tie' },
];

const LeadTimeRecommendation = ({ onBack, darkMode = false, selectedOrder: initialOrder = null }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSku, setSelectedSku] = useState('SKU-003');
  const [plantValue, setPlantValue] = useState(1);
  const [expediteValue, setExpediteValue] = useState(0);

  // Info dialog state (replaces browser alerts)
  const [infoDialog, setInfoDialog] = useState({ open: false, title: '', message: '', type: 'info' });

  // API data state
  const [skuOrders, setSkuOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ pending: 0, avgLeadTime: '0', onTimeRate: '0%', expediteCount: 0 });

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

  // Drilldown state
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);
  const [materialDrawerOpen, setMaterialDrawerOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState({ kunnr: null, name: null });
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/sku-optimizer/orders?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch lead time orders');
      const data = await response.json();

      // Transform API data to match DataGrid format
      const orders = data.orders.map(order => ({
        id: order.intent_id || order.id,
        status: order.status || 'pending',
        customer: order.customer,
        requestedSpec: order.requested_spec || order.requestedSpec || 'N/A',
        quantity: order.quantity,
        recommendedSku: order.recommended_sku || order.recommendedSku || 'TBD',
        leadTime: order.lead_time || '5 days',
        requestedDate: order.delivery_date || order.deliveryDate || 'TBD',
        promisedDate: order.promised_date || 'TBD',
        onTimeStatus: order.on_time_status || 'on-track',
      }));

      setSkuOrders(orders);

      // Calculate stats
      const pendingCount = orders.filter(o => o.status === 'pending').length;
      const onTrackCount = orders.filter(o => o.onTimeStatus === 'on-track').length;
      const onTimeRate = orders.length > 0 ? `${Math.round((onTrackCount / orders.length) * 100)}%` : '0%';

      setStats({
        pending: pendingCount,
        avgLeadTime: '5.2 days',
        onTimeRate: onTimeRate,
        expediteCount: orders.filter(o => o.onTimeStatus === 'expedite').length,
      });
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchOrders();
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
      field: 'leadTime',
      headerName: 'Lead Time',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const days = parseInt(params.value) || 5;
        const color = days <= 4 ? '#059669' : days <= 6 ? '#d97706' : '#dc2626';
        return <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color }}>{params.value}</Typography>;
      },
    },
    {
      field: 'onTimeStatus',
      headerName: 'On-Time',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const statusColors = {
          'on-track': { bg: alpha('#10b981', 0.12), color: '#059669', label: 'ON TRACK' },
          'at-risk': { bg: alpha('#f59e0b', 0.12), color: '#d97706', label: 'AT RISK' },
          'expedite': { bg: alpha('#dc2626', 0.12), color: '#dc2626', label: 'EXPEDITE' },
        };
        const style = statusColors[params.value] || statusColors['on-track'];
        return <Chip label={style.label} size="small" sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600, fontSize: '0.6rem' }} />;
      },
    },
    {
      field: 'requestedDate',
      headerName: 'Req. Date',
      width: 110,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{params.value}</Typography>
      ),
    },
  ];

  const handleRowClick = (params) => {
    setSelectedOrder(params.row);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
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
        title: 'Lead Time Confirmed',
        message: `Lead time option ${selectedSkuData?.leadTime || 'selected'} confirmed!\n\nOrder ${selectedOrder.id} has been promoted to the Arbitration stage.`,
        type: 'success',
      });
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error('Error promoting order:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    }
  };

  const getLeadTimeColor = (leadTime) => {
    const days = parseInt(leadTime) || 0;
    if (days <= 4) return '#059669';
    if (days <= 6) return '#d97706';
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
              <Link component="button" variant="body1" onClick={handleBackToList} sx={{ textDecoration: 'none', color: 'text.primary' }}>Lead Time Based Recommendation</Link>
              <Typography color="primary" variant="body1" fontWeight={600}>{selectedOrder.id}</Typography>
            </Breadcrumbs>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small">Back to List</Button>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <ScheduleIcon sx={{ fontSize: 40, color: '#002352' }} />
            <Box>
              <Typography variant="h5" fontWeight={600}>{selectedOrder.customer}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedOrder.requestedSpec} - {selectedOrder.quantity}</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Order Context Bar */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ py: 1.5, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Order Intent</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#1565c0', fontSize: '0.85rem' }}>{selectedOrder.id}</Typography>
            </Box>
            <Box
              onClick={() => {
                setSelectedCustomer({ kunnr: selectedOrder.kunnr || '0000100001', name: selectedOrder.customer });
                setCustomerDrawerOpen(true);
              }}
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha('#002352', 0.05), borderRadius: 1, mx: -1, px: 1 } }}
            >
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Customer</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#1565c0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {selectedOrder.customer} <OpenInNewIcon sx={{ fontSize: 12 }} />
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Requested Spec</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{selectedOrder.requestedSpec}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Quantity</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{selectedOrder.quantity}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Requested Delivery</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#d97706', fontSize: '0.85rem' }}>{selectedOrder.requestedDate}</Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <Grid container spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {/* Left Panel: SKU Ladder */}
          <Grid item xs={12} md={7}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SpeedIcon sx={{ color: '#002352', fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Lead Time Recommendation Ladder</Typography>
                </Stack>
                <Chip label="4 options" size="small" sx={{ bgcolor: alpha('#002352', 0.12), color: '#1565c0', fontWeight: 600, fontSize: '0.7rem' }} />
              </Box>
              <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
                {skuOptions.map((option, idx) => (
                  <Paper
                    key={option.id}
                    variant="outlined"
                    onClick={() => setSelectedSku(option.id)}
                    sx={{ p: 2, mb: 2, borderLeft: selectedSku === option.id ? '3px solid #002352' : option.recommended ? '3px solid #10b981' : '3px solid transparent', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', bgcolor: selectedSku === option.id ? alpha('#002352', 0.05) : 'transparent', '&:hover': { borderColor: '#002352', bgcolor: alpha('#002352', 0.03) } }}
                  >
                    <Chip label={option.recommended ? 'Fastest' : `#${idx + 1}`} size="small" icon={option.recommended ? <StarIcon sx={{ fontSize: 14 }} /> : undefined} sx={{ position: 'absolute', top: -10, left: 20, bgcolor: option.recommended ? '#10b981' : alpha('#64748b', 0.1), color: option.recommended ? 'white' : '#64748b', fontWeight: 600, fontSize: '0.65rem' }} />
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={8}>
                        <Typography
                          variant="body1"
                          fontWeight={700}
                          sx={{
                            fontSize: '0.9rem',
                            color: option.sku !== 'NEW SKU REQUIRED' ? '#1565c0' : 'text.primary',
                            cursor: option.sku !== 'NEW SKU REQUIRED' ? 'pointer' : 'default',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            '&:hover': option.sku !== 'NEW SKU REQUIRED' ? { textDecoration: 'underline' } : {},
                          }}
                          onClick={(e) => {
                            if (option.sku !== 'NEW SKU REQUIRED') {
                              e.stopPropagation();
                              setSelectedMaterial(option.sku);
                              setMaterialDrawerOpen(true);
                            }
                          }}
                        >
                          {option.sku}
                          {option.sku !== 'NEW SKU REQUIRED' && <OpenInNewIcon sx={{ fontSize: 12 }} />}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>{option.name}</Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" fontWeight={700} sx={{ color: getLeadTimeColor(option.leadTime) }}>{option.leadTime}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Lead Time</Typography>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                      {[{ label: 'Margin', value: option.margin ? `${option.margin}%` : 'TBD' }, { label: 'Margin $', value: option.marginDollar }, { label: 'Availability', value: option.availability }, { label: 'Revenue', value: option.revenue }].map((metric) => (
                        <Grid item xs={3} key={metric.label} sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary', fontSize: '0.8rem' }}>{metric.value}</Typography>
                          <Typography sx={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.6rem' }}>{metric.label}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, flexWrap: 'wrap' }}>
                      {option.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={{ bgcolor: tag.includes('Fastest') ? alpha('#10b981', 0.12) : tag.includes('Stock') || tag.includes('ATP') ? alpha('#002352', 0.12) : tag.includes('Alternate') || tag.includes('Thickness') ? alpha('#f59e0b', 0.12) : alpha('#8b5cf6', 0.12), color: tag.includes('Fastest') ? '#059669' : tag.includes('Stock') || tag.includes('ATP') ? '#1565c0' : tag.includes('Alternate') || tag.includes('Thickness') ? '#d97706' : '#7c3aed', fontSize: '0.6rem', fontWeight: 600, height: 20 }} />
                      ))}
                    </Box>
                  </Paper>
                ))}
              </Box>
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={handleBackToList} sx={{ flex: 1, fontSize: '0.75rem' }}>Back to Intent</Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CompareArrowsIcon sx={{ fontSize: 14 }} />}
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
                {/* AI Recommendation */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderLeft: '3px solid #10b981', bgcolor: alpha('#10b981', 0.05) }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#059669', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><LightbulbIcon sx={{ fontSize: 14 }} /> Why RL-PET48-SIL-P is Recommended</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.8, fontSize: '0.75rem' }}>
                    <strong>Fastest Delivery:</strong> 4-day lead time meets customer deadline with <strong>1-day buffer</strong>.<br /><br />
                    <strong>Full Availability:</strong> 22,000 LM in stock - no production wait required.<br /><br />
                    <strong>Spec Compliance:</strong> Within tolerance (-2um thickness) - <strong>customer pre-approved</strong>.<br /><br />
                    <strong>Plant Proximity:</strong> Chicago plant reduces transit by <strong>1 day</strong>.
                  </Typography>
                </Paper>

                {/* Lead Time Breakdown */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}><SpeedIcon sx={{ fontSize: 14 }} /> Lead Time Breakdown</Typography>
                <Box sx={{ mb: 2 }}>
                  {leadTimeBreakdown.map((item) => (
                    <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography sx={{ width: 90, color: '#64748b', textTransform: 'uppercase', fontSize: '0.65rem' }}>{item.label}</Typography>
                      <Box sx={{ flex: 1, height: 20, bgcolor: alpha('#64748b', 0.08), borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ width: `${item.percentage}%`, height: '100%', bgcolor: item.type === 'positive' ? '#10b981' : '#002352', borderRadius: 1 }} />
                      </Box>
                      <Typography sx={{ width: 70, textAlign: 'right', color: item.label === 'Total Lead Time' ? '#059669' : 'text.primary', fontWeight: 600, fontSize: '0.75rem' }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* Comparison Table */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}><CompareArrowsIcon sx={{ fontSize: 14 }} /> Option Comparison</Typography>
                <Table size="small" sx={{ mb: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Factor</TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>PET48 (Rec)</TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>PET50-S</TableCell>
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

                {/* Sensitivity */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}><TuneIcon sx={{ fontSize: 14 }} /> Delivery Scenarios</Typography>
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>Ship from Plant</Typography>
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{['2100 (Chicago)', '2500 (Ohio)', '3000 (Texas)'][plantValue - 1]}</Typography>
                    </Box>
                    <Slider size="small" value={plantValue} min={1} max={3} onChange={(e, v) => setPlantValue(v)} sx={{ color: '#002352' }} />
                  </Box>
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>Expedite Days Saved</Typography>
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{expediteValue} days</Typography>
                    </Box>
                    <Slider size="small" value={expediteValue} min={0} max={3} onChange={(e, v) => setExpediteValue(v)} sx={{ color: '#002352' }} />
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
            <Typography color="primary" variant="body1" fontWeight={600}>Lead Time Based Recommendation</Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh"><span><IconButton color="primary" onClick={fetchOrders} disabled={loading}><RefreshIcon /></IconButton></span></Tooltip>
            <Tooltip title="Export"><IconButton color="primary" onClick={handleExport}><DownloadIcon /></IconButton></Tooltip>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back to ORDLY.AI</Button>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <ScheduleIcon sx={{ fontSize: 40, color: '#002352' }} />
          <Typography variant="h5" fontWeight={600}>Lead Time Based Recommendation</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">AI-powered lead time optimization for on-time delivery - Click a row to view details</Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Pending Decision', value: stats.pending, color: '#f59e0b' },
          { label: 'Avg. Lead Time', value: stats.avgLeadTime, color: '#002352' },
          { label: 'On-Time Rate', value: stats.onTimeRate, color: '#10b981' },
          { label: 'Expedite Required', value: stats.expediteCount, color: '#dc2626' },
          { label: 'Fastest Option', value: '4 days', color: '#8b5cf6' },
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
            <LocalShippingIcon sx={{ color: '#002352', fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Orders Pending Lead Time Decision</Typography>
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
              <Button variant="outlined" onClick={fetchOrders}>Retry</Button>
            </Box>
          ) : (
            <DataGrid
              rows={skuOrders}
              columns={columns}
              density="compact"
              initialState={{ pagination: { paginationModel: { pageSize: 25 } }, sorting: { sortModel: [{ field: 'requestedDate', sort: 'asc' }] } }}
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

export default LeadTimeRecommendation;
