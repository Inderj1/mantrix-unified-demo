import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Avatar,
  Chip,
  Card,
  CardContent,
  Stack,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  alpha,
  CircularProgress,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AutoGraph as AutoGraphIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Repeat as RepeatIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import ordlyTheme from './ordlyTheme';
import InfoDialog from './InfoDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Primary blue color for ORDLY.AI
const PRIMARY_BLUE = '#0854a0';
const ACCENT_BLUE = '#1976d2';
const SUCCESS_GREEN = '#059669';
const WARNING_AMBER = '#d97706';

// Mock data from mts_tile_04_learning_loop.html
const mockLearningOrders = [
  {
    id: 'EDI-850-78432',
    orderPo: 'EDI-850-78432',
    customer: 'Walmart Distribution',
    orderValue: 247500,
    otifScore: 100,
    chargebacks: 0,
    realizedMargin: 29.1,
    plannedMargin: 28.4,
    status: 'LEARNING',
    modelConfidenceGain: 2.1,
    completedDate: '2025-01-18',
    plannedVsActual: {
      freightCost: { planned: 18450, actual: 18120, variance: -330, status: 'FAVORABLE' },
      deliveryDate: { planned: 'Jan 18', actual: 'Jan 18', status: 'ON TIME' },
      quantity: { planned: 15000, actual: 15000, status: 'IN FULL' },
      margin: { planned: 28.4, actual: 29.1, variance: 0.7, status: 'FAVORABLE' }
    },
    chargebackDetails: {
      otif: { status: 'Delivered within MABD window', amount: 0 },
      quantity: { status: '100% fill rate achieved', amount: 0 },
      documentation: { status: 'ASN, BOL, POD all matched', amount: 0 },
      carrierClaims: { status: 'No damage reported', amount: 0 }
    },
    customerSignal: {
      type: 'Positive',
      detail: 'Walmart DC-7 placed repeat promo order',
      volume: '18,000 CS (Feb 2025)',
      change: '+20%',
      interpretation: 'Repeat orders within 30 days indicate high satisfaction'
    },
    modelUpdates: [
      { model: 'Lane Cost Model', before: 94, after: 96, detail: 'Memphis → Bentonville: $1.21/CS → $1.18/CS', impact: 'Future Memphis decisions use refined cost' },
      { model: 'Service Probability Model', before: 89, after: 91, detail: 'Promo-split P(On-Time): predicted 94%, actual 100%', impact: 'Higher confidence in split-ship during promos' },
      { model: 'Inventory Shadow Pricing', before: 82, after: 84, detail: 'SKU-7742 Memphis shadow cost: $0.28/CS → $0.24/CS', impact: 'More aggressive inventory allocation' },
      { model: 'Chargeback Probability Model', before: 91, after: 93, detail: 'Walmart DC-7 promo chargebacks: predicted 6%, actual 0%', impact: 'Lower penalty expectations for Walmart promos' }
    ],
    predictionAccuracy: [
      { week: 'W1', accuracy: 87 }, { week: 'W3', accuracy: 88 },
      { week: 'W5', accuracy: 89 }, { week: 'W7', accuracy: 91 },
      { week: 'W9', accuracy: 92 }, { week: 'W12', accuracy: 94 }
    ],
    compoundingGains: {
      chargebacksAvoided: 2400000,
      freightSavings: 890000,
      marginImprovement: 2.1,
      yoyChargebackChange: 34,
      yoyFreightChange: 18,
      yoyMarginChange: 0.8
    }
  },
  {
    id: 'EDI-850-78401',
    orderPo: 'EDI-850-78401',
    customer: 'Kroger Central',
    orderValue: 156000,
    otifScore: 98,
    chargebacks: 0,
    realizedMargin: 26.8,
    plannedMargin: 25.5,
    status: 'LEARNING',
    modelConfidenceGain: 1.8,
    completedDate: '2025-01-15',
    plannedVsActual: {
      freightCost: { planned: 12200, actual: 11980, variance: -220, status: 'FAVORABLE' },
      deliveryDate: { planned: 'Jan 15', actual: 'Jan 15', status: 'ON TIME' },
      quantity: { planned: 8500, actual: 8500, status: 'IN FULL' },
      margin: { planned: 25.5, actual: 26.8, variance: 1.3, status: 'FAVORABLE' }
    },
    chargebackDetails: {
      otif: { status: 'Delivered within window', amount: 0 },
      quantity: { status: '100% fill rate', amount: 0 },
      documentation: { status: 'All docs matched', amount: 0 },
      carrierClaims: { status: 'No issues', amount: 0 }
    },
    customerSignal: {
      type: 'Positive',
      detail: 'Kroger increased order frequency',
      volume: '9,200 CS (Feb 2025)',
      change: '+8%',
      interpretation: 'Consistent ordering pattern indicates satisfaction'
    },
    modelUpdates: [
      { model: 'Lane Cost Model', before: 92, after: 94, detail: 'Dallas → Cincinnati refined', impact: 'Improved lane cost prediction' },
      { model: 'Service Probability Model', before: 88, after: 90, detail: 'Single-node accuracy improved', impact: 'Better service predictions' }
    ],
    predictionAccuracy: [
      { week: 'W1', accuracy: 85 }, { week: 'W3', accuracy: 87 },
      { week: 'W5', accuracy: 88 }, { week: 'W7', accuracy: 89 },
      { week: 'W9', accuracy: 90 }, { week: 'W12', accuracy: 92 }
    ],
    compoundingGains: {
      chargebacksAvoided: 1800000,
      freightSavings: 650000,
      marginImprovement: 1.8,
      yoyChargebackChange: 28,
      yoyFreightChange: 15,
      yoyMarginChange: 0.6
    }
  },
  {
    id: 'EDI-850-78389',
    orderPo: 'EDI-850-78389',
    customer: 'Target Southwest',
    orderValue: 198000,
    otifScore: 95,
    chargebacks: 1250,
    realizedMargin: 24.2,
    plannedMargin: 26.0,
    status: 'LEARNING',
    modelConfidenceGain: -0.5,
    completedDate: '2025-01-12',
    plannedVsActual: {
      freightCost: { planned: 14500, actual: 15200, variance: 700, status: 'UNFAVORABLE' },
      deliveryDate: { planned: 'Jan 11', actual: 'Jan 12', status: '1 DAY LATE' },
      quantity: { planned: 11000, actual: 11000, status: 'IN FULL' },
      margin: { planned: 26.0, actual: 24.2, variance: -1.8, status: 'UNFAVORABLE' }
    },
    chargebackDetails: {
      otif: { status: 'Delivered 1 day late', amount: 1250 },
      quantity: { status: '100% fill rate', amount: 0 },
      documentation: { status: 'All docs matched', amount: 0 },
      carrierClaims: { status: 'No damage', amount: 0 }
    },
    customerSignal: {
      type: 'Neutral',
      detail: 'Target maintained order volume',
      volume: '11,000 CS (Feb 2025)',
      change: '0%',
      interpretation: 'No change in ordering pattern'
    },
    modelUpdates: [
      { model: 'Carrier Capacity Model', before: 85, after: 87, detail: 'Peak season carrier constraint learned', impact: 'Better capacity planning during peaks' },
      { model: 'Chargeback Probability Model', before: 90, after: 89, detail: 'Target late penalty: predicted 4%, actual 8%', impact: 'Adjusted Target penalty expectations' }
    ],
    predictionAccuracy: [
      { week: 'W1', accuracy: 86 }, { week: 'W3', accuracy: 87 },
      { week: 'W5', accuracy: 86 }, { week: 'W7', accuracy: 88 },
      { week: 'W9', accuracy: 89 }, { week: 'W12', accuracy: 90 }
    ],
    compoundingGains: {
      chargebacksAvoided: 1500000,
      freightSavings: 520000,
      marginImprovement: 1.5,
      yoyChargebackChange: 22,
      yoyFreightChange: 12,
      yoyMarginChange: 0.4
    }
  }
];

const LearningLoop = ({ onBack, darkMode = false }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [infoDialog, setInfoDialog] = useState({ open: false, title: '', message: '', type: 'info' });
  const [learningOrders, setLearningOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    avgOtif: 0,
    totalChargebacks: 0,
    avgMarginGain: 0,
    chargebacksAvoided: 0,
    freightSavings: 0
  });

  // Fetch learning loop orders from API (with fallback to mock)
  const fetchLearningOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/learning-loop/orders?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch learning loop orders');
      const data = await response.json();
      setLearningOrders(data.orders || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error('Error fetching learning loop orders, using mock data:', err);
      // Use mock data as fallback
      setLearningOrders(mockLearningOrders);

      // Calculate stats from mock data
      const totalOrders = mockLearningOrders.length;
      const avgOtif = mockLearningOrders.reduce((sum, o) => sum + o.otifScore, 0) / totalOrders;
      const totalChargebacks = mockLearningOrders.reduce((sum, o) => sum + o.chargebacks, 0);
      const avgMarginGain = mockLearningOrders.reduce((sum, o) => sum + o.modelConfidenceGain, 0) / totalOrders;

      setStats({
        totalOrders,
        avgOtif: avgOtif.toFixed(1),
        totalChargebacks,
        avgMarginGain: avgMarginGain.toFixed(1),
        chargebacksAvoided: 2400000,
        freightSavings: 890000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningOrders();
  }, []);

  // DataGrid columns
  const columns = [
    {
      field: 'orderPo',
      headerName: 'Order PO',
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: ACCENT_BLUE, fontSize: '0.8rem' }}>{params.value}</Typography>
      )
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{params.value}</Typography>
      )
    },
    {
      field: 'orderValue',
      headerName: 'Order Value',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
          ${params.value?.toLocaleString() || 0}
        </Typography>
      )
    },
    {
      field: 'otifScore',
      headerName: 'OTIF',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const score = params.value || 0;
        const color = score >= 98 ? SUCCESS_GREEN : score >= 95 ? WARNING_AMBER : '#dc2626';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 40, height: 6, bgcolor: alpha('#64748b', 0.2), borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ width: `${score}%`, height: '100%', bgcolor: color, borderRadius: 3 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color }}>{score}%</Typography>
          </Box>
        );
      }
    },
    {
      field: 'chargebacks',
      headerName: 'Chargebacks',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const amount = params.value || 0;
        const color = amount === 0 ? SUCCESS_GREEN : '#dc2626';
        return (
          <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color }}>
            ${amount.toLocaleString()}
          </Typography>
        );
      }
    },
    {
      field: 'realizedMargin',
      headerName: 'Margin',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const row = params.row;
        const variance = (row.realizedMargin || 0) - (row.plannedMargin || 0);
        const isPositive = variance >= 0;
        return (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
              {params.value?.toFixed(1)}%
            </Typography>
            {isPositive ? (
              <TrendingUpIcon sx={{ fontSize: 14, color: SUCCESS_GREEN }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 14, color: '#dc2626' }} />
            )}
          </Stack>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          icon={<SchoolIcon sx={{ fontSize: 14 }} />}
          sx={{
            bgcolor: alpha(ACCENT_BLUE, 0.12),
            color: ACCENT_BLUE,
            fontWeight: 600,
            fontSize: '0.65rem',
            '& .MuiChip-icon': { color: ACCENT_BLUE }
          }}
        />
      )
    },
    {
      field: 'modelConfidenceGain',
      headerName: 'Model Gain',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const gain = params.value || 0;
        const isPositive = gain >= 0;
        const color = isPositive ? SUCCESS_GREEN : '#dc2626';
        return (
          <Chip
            label={`${isPositive ? '+' : ''}${gain.toFixed(1)}%`}
            size="small"
            icon={isPositive ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
            sx={{
              bgcolor: alpha(color, 0.12),
              color: color,
              fontWeight: 600,
              fontSize: '0.65rem',
              '& .MuiChip-icon': { color: color }
            }}
          />
        );
      }
    },
  ];

  // List View
  const renderListView = () => (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack}
              sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
              ORDLY.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Learning Loop
            </Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchLearningOrders} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export">
              <IconButton size="small">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
              Back
            </Button>
          </Stack>
        </Stack>

        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ width: 4, height: 60, background: `linear-gradient(180deg, ${PRIMARY_BLUE} 0%, ${ACCENT_BLUE} 100%)`, borderRadius: 2 }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: PRIMARY_BLUE }}>
                <SchoolIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px', color: PRIMARY_BLUE }}>
                Learning Loop
              </Typography>
              <Chip label="Tile 4" size="small" sx={{ bgcolor: alpha(PRIMARY_BLUE, 0.1), color: PRIMARY_BLUE, fontWeight: 600, fontSize: '0.7rem' }} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Order outcome analysis, ML model updates, and continuous improvement tracking
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha(PRIMARY_BLUE, 0.08), border: `1px solid ${alpha(PRIMARY_BLUE, 0.2)}` }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">Total Orders</Typography>
              <Typography variant="h5" fontWeight={700} color={PRIMARY_BLUE}>{stats.totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha(SUCCESS_GREEN, 0.08), border: `1px solid ${alpha(SUCCESS_GREEN, 0.2)}` }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">Avg OTIF</Typography>
              <Typography variant="h5" fontWeight={700} color={SUCCESS_GREEN}>{stats.avgOtif}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha('#dc2626', 0.08), border: `1px solid ${alpha('#dc2626', 0.2)}` }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">Total Chargebacks</Typography>
              <Typography variant="h5" fontWeight={700} color="#dc2626">${(stats.totalChargebacks || 0).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha(ACCENT_BLUE, 0.08), border: `1px solid ${alpha(ACCENT_BLUE, 0.2)}` }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">Avg Model Gain</Typography>
              <Typography variant="h5" fontWeight={700} color={ACCENT_BLUE}>+{stats.avgMarginGain}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha(SUCCESS_GREEN, 0.08), border: `1px solid ${alpha(SUCCESS_GREEN, 0.2)}` }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">Chargebacks Avoided</Typography>
              <Typography variant="h5" fontWeight={700} color={SUCCESS_GREEN}>${((stats.chargebacksAvoided || 0) / 1000000).toFixed(1)}M</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha(SUCCESS_GREEN, 0.08), border: `1px solid ${alpha(SUCCESS_GREEN, 0.2)}` }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">Freight Savings</Typography>
              <Typography variant="h5" fontWeight={700} color={SUCCESS_GREEN}>${((stats.freightSavings || 0) / 1000).toFixed(0)}K</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DataGrid */}
      <Card
        variant="outlined"
        sx={{
          height: 500,
          bgcolor: darkMode ? '#161b22' : 'white',
          border: `1px solid ${alpha(PRIMARY_BLUE, 0.15)}`,
          borderRadius: 2,
        }}
      >
        {/* Card Header */}
        <Box sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: darkMode ? '#1e293b' : '#f8fafc'
        }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SchoolIcon sx={{ color: PRIMARY_BLUE, fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Learning Loop Orders
            </Typography>
            <Chip
              label={`${learningOrders.length} orders`}
              size="small"
              sx={{
                bgcolor: alpha(PRIMARY_BLUE, 0.1),
                color: PRIMARY_BLUE,
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Click any row to view learning details
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100% - 56px)' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        ) : (
          <DataGrid
            rows={learningOrders}
            columns={columns}
            density="compact"
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
              sorting: { sortModel: [{ field: 'completedDate', sort: 'desc' }] }
            }}
            pageSizeOptions={[10, 25, 50]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 }
              }
            }}
            onRowClick={(params) => setSelectedOrder(params.row)}
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              height: 'calc(100% - 56px)',
              '& .MuiDataGrid-cell': {
                fontSize: '0.8rem',
                borderColor: darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.08),
              },
              '& .MuiDataGrid-columnHeader': {
                bgcolor: darkMode ? '#1e293b' : '#f1f5f9',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase'
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: alpha(PRIMARY_BLUE, 0.08),
                cursor: 'pointer'
              },
              '& .MuiDataGrid-toolbarContainer': {
                p: 1.5,
                gap: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
            }}
          />
        )}
      </Card>
    </Box>
  );

  // Flow steps for the 5-stage MTS pipeline
  const flowSteps = [
    { id: 0, label: 'Demand Signal', status: 'complete' },
    { id: 1, label: 'Network Optimizer', status: 'complete' },
    { id: 2, label: 'Arbitration', status: 'complete' },
    { id: 3, label: 'SAP Commit', status: 'complete' },
    { id: 4, label: 'Learning Loop', status: 'active' },
  ];

  // Detail View
  const renderDetailView = () => {
    if (!selectedOrder) return null;

    const order = selectedOrder;
    const pva = order.plannedVsActual || {};
    const chargebacks = order.chargebackDetails || {};
    const signal = order.customerSignal || {};
    const models = order.modelUpdates || [];
    const accuracy = order.predictionAccuracy || [];
    const gains = order.compoundingGains || {};
    const isPerfectOrder = order.otifScore >= 98 && order.chargebacks === 0;

    return (
      <Box sx={{ height: '100%', overflow: 'auto', bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
        {/* Order Context Bar */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 1.5,
          bgcolor: darkMode ? alpha(PRIMARY_BLUE, 0.1) : alpha(PRIMARY_BLUE, 0.05),
          borderBottom: `1px solid ${alpha(PRIMARY_BLUE, 0.2)}`,
        }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => setSelectedOrder(null)}
              size="small"
              variant="outlined"
              sx={{ borderColor: 'divider' }}
            >
              Back to Queue
            </Button>
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: PRIMARY_BLUE }}>{order.orderPo}</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography sx={{ fontSize: '0.85rem', color: 'text.primary' }}>{order.customer}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>SKU-7742 Energy Drink 12-Pack • {pva.quantity?.actual?.toLocaleString() || '15,000'} cases</Typography>
              </Stack>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: SUCCESS_GREEN }}>${order.orderValue?.toLocaleString()}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', textTransform: 'uppercase' }}>Order Value</Typography>
            </Box>
            <Chip
              icon={<SchoolIcon sx={{ fontSize: 14 }} />}
              label="LEARNING"
              sx={{
                bgcolor: alpha(PRIMARY_BLUE, 0.12),
                color: PRIMARY_BLUE,
                fontWeight: 600,
                fontSize: '0.7rem',
                '& .MuiChip-icon': { color: PRIMARY_BLUE }
              }}
            />
          </Stack>
        </Box>

        {/* Flow Indicator - 5-Stage Pipeline */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
          py: 1.5,
          px: 3,
          bgcolor: darkMode ? alpha('#000', 0.2) : alpha('#f1f5f9', 0.8),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          {flowSteps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <Chip
                label={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {step.status === 'complete' ? (
                      <CheckIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                        {step.id}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: '0.7rem' }}>{step.label}</Typography>
                  </Stack>
                }
                size="small"
                sx={{
                  bgcolor: step.status === 'active'
                    ? alpha(PRIMARY_BLUE, 0.15)
                    : step.status === 'complete'
                      ? alpha(SUCCESS_GREEN, 0.1)
                      : alpha('#64748b', 0.08),
                  color: step.status === 'active'
                    ? PRIMARY_BLUE
                    : step.status === 'complete'
                      ? SUCCESS_GREEN
                      : 'text.secondary',
                  border: step.status === 'active' ? `1px solid ${alpha(PRIMARY_BLUE, 0.3)}` : 'none',
                  fontWeight: step.status === 'active' ? 600 : 400,
                }}
              />
              {idx < flowSteps.length - 1 && (
                <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>→</Typography>
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* Outcome Banner */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          bgcolor: isPerfectOrder
            ? alpha(SUCCESS_GREEN, 0.08)
            : alpha(WARNING_AMBER, 0.08),
          borderBottom: `1px solid ${alpha(isPerfectOrder ? SUCCESS_GREEN : WARNING_AMBER, 0.2)}`,
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CheckCircleIcon sx={{ fontSize: 32, color: isPerfectOrder ? SUCCESS_GREEN : WARNING_AMBER }} />
            <Box>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: isPerfectOrder ? SUCCESS_GREEN : WARNING_AMBER }}>
                {isPerfectOrder ? 'Perfect Order Achieved — Decision Validated' : 'Order Completed with Issues — Learning Applied'}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                {isPerfectOrder
                  ? 'Delivered on-time, in-full, no chargebacks • Models updated'
                  : `${order.chargebacks > 0 ? `$${order.chargebacks.toLocaleString()} chargebacks • ` : ''}Models updated with learnings`}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: order.otifScore >= 98 ? SUCCESS_GREEN : WARNING_AMBER }}>{order.otifScore}%</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', textTransform: 'uppercase' }}>OTIF Score</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: order.chargebacks === 0 ? SUCCESS_GREEN : '#dc2626' }}>${order.chargebacks?.toLocaleString() || 0}</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', textTransform: 'uppercase' }}>Chargebacks</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: order.modelConfidenceGain >= 0 ? SUCCESS_GREEN : '#dc2626' }}>
                {order.modelConfidenceGain >= 0 ? '+' : ''}{order.modelConfidenceGain}%
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', textTransform: 'uppercase' }}>Model Confidence</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Summary Strip - 6 Cards */}
        <Grid container spacing={1.5} sx={{ px: 3, py: 2, bgcolor: darkMode ? alpha('#000', 0.2) : alpha('#f1f5f9', 0.5) }}>
          {[
            { label: 'Actual Freight', value: `$${pva.freightCost?.actual?.toLocaleString() || '18,120'}`, color: SUCCESS_GREEN },
            { label: 'Actual Delivery', value: pva.deliveryDate?.actual || 'Jan 18', color: SUCCESS_GREEN },
            { label: 'Chargebacks', value: `$${order.chargebacks?.toLocaleString() || 0}`, color: order.chargebacks === 0 ? SUCCESS_GREEN : '#dc2626' },
            { label: 'Deductions', value: '$0', color: SUCCESS_GREEN },
            { label: 'Realized Margin', value: `${order.realizedMargin || pva.margin?.actual}%`, color: SUCCESS_GREEN },
            { label: 'Models Updated', value: models.length.toString(), color: PRIMARY_BLUE },
          ].map((card) => (
            <Grid item xs={6} sm={4} md={2} key={card.label}>
              <Card variant="outlined" sx={{ textAlign: 'center' }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: card.color }}>{card.value}</Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', textTransform: 'uppercase', mt: 0.5 }}>{card.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Content - Two Columns */}
        <Grid container spacing={2.5} sx={{ p: 3 }}>
          {/* Left Panel - Planned vs Actual Analysis */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: darkMode ? alpha('#000', 0.2) : alpha(PRIMARY_BLUE, 0.03) }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>Planned vs Actual Analysis</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Closing the loop between decision and outcome</Typography>
              </Box>
              <CardContent sx={{ p: 2 }}>
                {/* Variance Analysis Section */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoGraphIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} /> Variance Analysis
                </Typography>
                <Grid container spacing={1.5} sx={{ mb: 3 }}>
                  {[
                    { label: 'Freight Cost', planned: pva.freightCost?.planned, actual: pva.freightCost?.actual, variance: pva.freightCost?.variance, isGood: pva.freightCost?.variance <= 0, format: '$' },
                    { label: 'Delivery Date', planned: pva.deliveryDate?.planned, actual: pva.deliveryDate?.actual, status: pva.deliveryDate?.status, isGood: pva.deliveryDate?.status === 'ON TIME' },
                    { label: 'Quantity Delivered', planned: `${pva.quantity?.planned?.toLocaleString()} CS`, actual: `${pva.quantity?.actual?.toLocaleString()} CS`, status: pva.quantity?.status, isGood: true },
                    { label: 'Realized Margin', planned: `${pva.margin?.planned}%`, actual: `${pva.margin?.actual}%`, variance: pva.margin?.variance, isGood: pva.margin?.variance >= 0, suffix: '%' },
                  ].map((item) => (
                    <Grid item xs={6} key={item.label}>
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, borderColor: alpha(item.isGood ? SUCCESS_GREEN : '#dc2626', 0.3) }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', textTransform: 'uppercase' }}>{item.label}</Typography>
                          <Chip
                            label={item.status || `${item.variance >= 0 ? '+' : ''}${item.format || ''}${item.variance}${item.suffix || ''}`}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.6rem',
                              fontWeight: 600,
                              bgcolor: alpha(item.isGood ? SUCCESS_GREEN : '#dc2626', 0.12),
                              color: item.isGood ? SUCCESS_GREEN : '#dc2626',
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Planned: {item.format === '$' ? '$' : ''}{typeof item.planned === 'number' ? item.planned.toLocaleString() : item.planned}</Typography>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
                            {item.format === '$' ? '$' : ''}{typeof item.actual === 'number' ? item.actual.toLocaleString() : item.actual}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={100}
                          sx={{
                            mt: 1,
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(item.isGood ? SUCCESS_GREEN : '#dc2626', 0.15),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor: item.isGood ? SUCCESS_GREEN : '#dc2626',
                            }
                          }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {/* Chargeback & Deduction Tracking */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon sx={{ fontSize: 16, color: order.chargebacks === 0 ? SUCCESS_GREEN : '#dc2626' }} /> Chargeback & Deduction Tracking
                </Typography>
                <Stack spacing={1} sx={{ mb: 3 }}>
                  {[
                    { icon: <CheckCircleIcon sx={{ fontSize: 18, color: SUCCESS_GREEN }} />, type: 'OTIF Compliance', detail: chargebacks.otif?.status || 'Delivered within MABD window', amount: chargebacks.otif?.amount || 0 },
                    { icon: <InventoryIcon sx={{ fontSize: 18, color: SUCCESS_GREEN }} />, type: 'Quantity Variance', detail: chargebacks.quantity?.status || '100% fill rate achieved', amount: chargebacks.quantity?.amount || 0 },
                    { icon: <AutoGraphIcon sx={{ fontSize: 18, color: SUCCESS_GREEN }} />, type: 'Documentation Compliance', detail: chargebacks.documentation?.status || 'ASN, BOL, POD all matched', amount: chargebacks.documentation?.amount || 0 },
                    { icon: <ShippingIcon sx={{ fontSize: 18, color: SUCCESS_GREEN }} />, type: 'Carrier Claims', detail: chargebacks.carrierClaims?.status || 'No damage reported', amount: chargebacks.carrierClaims?.amount || 0 },
                  ].map((item) => (
                    <Paper key={item.type} variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 1 }}>
                      {item.icon}
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary' }}>{item.type}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>{item.detail}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: item.amount === 0 ? SUCCESS_GREEN : '#dc2626' }}>
                        ${item.amount.toLocaleString()}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>

                {/* Customer Satisfaction Signal */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: SUCCESS_GREEN }} /> Customer Satisfaction Signal
                </Typography>
                <Paper variant="outlined" sx={{
                  p: 2,
                  bgcolor: alpha(SUCCESS_GREEN, 0.05),
                  borderColor: alpha(SUCCESS_GREEN, 0.2),
                  borderRadius: 1.5,
                }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <ThumbUpIcon sx={{ fontSize: 18, color: SUCCESS_GREEN }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: SUCCESS_GREEN }}>Positive Signal Detected</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.6 }}>
                    {signal.detail || 'Walmart DC-7 has placed a'} <strong style={{ color: 'inherit' }}>repeat promo order</strong> for Feb 2025 — {signal.volume || '18,000 CS'} ({signal.change || '+20%'} vs this order). {signal.interpretation || 'Historical pattern: repeat orders within 30 days indicate high satisfaction.'}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Panel - Model Updates & Learning */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: darkMode ? alpha('#000', 0.2) : alpha(PRIMARY_BLUE, 0.03) }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>Model Updates & Learning</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Compounding intelligence from every execution</Typography>
              </Box>
              <CardContent sx={{ p: 2 }}>
                {/* Models Updated Section */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PsychologyIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} /> Models Updated
                </Typography>
                <Stack spacing={1} sx={{ mb: 3 }}>
                  {models.map((model, idx) => (
                    <Paper key={idx} variant="outlined" sx={{
                      p: 1.5,
                      borderColor: alpha(PRIMARY_BLUE, 0.2),
                      borderRadius: 1.5,
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: PRIMARY_BLUE }}>{model.model}</Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>{model.before}%</Typography>
                          <TrendingUpIcon sx={{ fontSize: 12, color: SUCCESS_GREEN }} />
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: SUCCESS_GREEN }}>{model.after}%</Typography>
                        </Stack>
                      </Box>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.5, mb: 1 }}>
                        {model.detail}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                        Impact: {model.impact}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>

                {/* Prediction Accuracy Trend */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoGraphIcon sx={{ fontSize: 16, color: SUCCESS_GREEN }} /> Prediction Accuracy Trend
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.primary' }}>OTIF Prediction Accuracy (Last 12 Weeks)</Typography>
                    <Chip label={`${accuracy[0]?.accuracy}% → ${accuracy[accuracy.length - 1]?.accuracy}%`} size="small" sx={{ bgcolor: alpha(SUCCESS_GREEN, 0.1), color: SUCCESS_GREEN, fontSize: '0.6rem', fontWeight: 600 }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 80 }}>
                    {accuracy.map((week, idx) => {
                      const barHeight = Math.max(20, (week.accuracy - 80) * 5);
                      const barColor = week.accuracy >= 92 ? SUCCESS_GREEN : week.accuracy >= 88 ? WARNING_AMBER : '#dc2626';
                      return (
                        <Box key={idx} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box sx={{
                            width: '100%',
                            height: barHeight,
                            borderRadius: '3px 3px 0 0',
                            bgcolor: barColor,
                          }} />
                          <Typography sx={{ fontSize: '0.5rem', color: 'text.disabled', mt: 0.5 }}>{week.week}</Typography>
                          <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary', fontWeight: 600 }}>{week.accuracy}%</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>

                {/* Compounding Gains (YTD) */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: SUCCESS_GREEN }} /> Compounding Gains (YTD)
                </Typography>
                <Paper variant="outlined" sx={{
                  p: 2,
                  bgcolor: alpha(SUCCESS_GREEN, 0.03),
                  borderColor: alpha(SUCCESS_GREEN, 0.2),
                  borderRadius: 1.5,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary' }}>Cumulative Value Created</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Jan - Dec 2024</Typography>
                  </Box>
                  <Grid container spacing={1.5}>
                    {[
                      { label: 'Chargebacks Avoided', value: `$${(gains.chargebacksAvoided / 1000000).toFixed(1)}M`, delta: `↑ ${gains.yoyChargebackChange}%` },
                      { label: 'Freight Savings', value: `$${(gains.freightSavings / 1000).toFixed(0)}K`, delta: `↑ ${gains.yoyFreightChange}%` },
                      { label: 'Margin Improvement', value: `+${gains.marginImprovement}%`, delta: `↑ ${gains.yoyMarginChange}%` },
                    ].map((metric) => (
                      <Grid item xs={4} key={metric.label}>
                        <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: SUCCESS_GREEN }}>{metric.value}</Typography>
                          <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary', mt: 0.5 }}>{metric.label}</Typography>
                          <Chip label={metric.delta} size="small" sx={{ mt: 0.5, height: 16, fontSize: '0.5rem', bgcolor: alpha(SUCCESS_GREEN, 0.1), color: SUCCESS_GREEN }} />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Footer */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: darkMode ? alpha('#000', 0.2) : alpha('#f1f5f9', 0.8),
        }}>
          <Stack direction="row" spacing={3}>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Loop Closed: <Typography component="span" sx={{ color: SUCCESS_GREEN, fontWeight: 600 }}>{order.completedDate || 'Jan 22, 2025'}</Typography>
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Models Updated: <Typography component="span" sx={{ color: PRIMARY_BLUE, fontWeight: 600 }}>{models.length}</Typography>
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Next Recalibration: <Typography component="span" sx={{ fontWeight: 500 }}>Weekly batch</Typography>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" size="small" sx={{ fontSize: '0.75rem', borderColor: 'divider' }}>
              View Model Dashboard
            </Button>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} sx={{ fontSize: '0.75rem', borderColor: 'divider' }}>
              Export Report
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setSelectedOrder(null)}
              sx={{
                bgcolor: PRIMARY_BLUE,
                '&:hover': { bgcolor: ACCENT_BLUE },
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              Process Next Order →
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
      {selectedOrder ? renderDetailView() : renderListView()}
      <InfoDialog
        open={infoDialog.open}
        onClose={() => setInfoDialog({ ...infoDialog, open: false })}
        title={infoDialog.title}
        message={infoDialog.message}
        type={infoDialog.type}
      />
    </Box>
  );
};

export default LearningLoop;
