import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  LocalShipping as ShippingIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import margenTheme from './margenTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

// Arizona Beverages COPA Mock Data
const generateCOPAData = () => {
  const alerts = [
    {
      id: 'ALT-001',
      type: 'risk',
      severity: 'critical',
      title: 'Gross Margin Erosion - Green Tea 23oz',
      description: 'COGS increased 18% due to aluminum can shortage',
      productLine: 'Green Tea',
      channel: 'Retail',
      region: 'Northeast',
      impactAmount: -2.3,
      glAccount: '5100-COGS',
      action: 'Renegotiate supplier contracts',
      daysOpen: 5,
    },
    {
      id: 'ALT-002',
      type: 'risk',
      severity: 'high',
      title: 'Distribution Cost Overrun - West Region',
      description: 'Freight costs up 22% vs budget',
      productLine: 'All Products',
      channel: 'Wholesale',
      region: 'West',
      impactAmount: -1.8,
      glAccount: '6200-Freight',
      action: 'Review carrier contracts',
      daysOpen: 12,
    },
    {
      id: 'ALT-003',
      type: 'opportunity',
      severity: 'medium',
      title: 'Margin Upside - Arnold Palmer Premium',
      description: 'Price elasticity allows 5% increase',
      productLine: 'Arnold Palmer',
      channel: 'Convenience',
      region: 'Southeast',
      impactAmount: 1.5,
      glAccount: '4100-Revenue',
      action: 'Implement price adjustment',
      daysOpen: 8,
    },
    {
      id: 'ALT-004',
      type: 'opportunity',
      severity: 'high',
      title: 'Channel Mix Optimization',
      description: 'Shift volume to higher-margin D2C channel',
      productLine: 'RX Energy',
      channel: 'D2C',
      region: 'All Regions',
      impactAmount: 2.1,
      glAccount: '4100-Revenue',
      action: 'Increase D2C marketing spend',
      daysOpen: 3,
    },
    {
      id: 'ALT-005',
      type: 'risk',
      severity: 'medium',
      title: 'Promotional Spend Inefficiency',
      description: 'Trade spend ROI below threshold in Midwest',
      productLine: 'Fruit Punch',
      channel: 'Retail',
      region: 'Midwest',
      impactAmount: -0.9,
      glAccount: '6100-Trade',
      action: 'Reallocate promotional budget',
      daysOpen: 15,
    },
  ];

  const profitabilityByProduct = [
    { id: 'GT-23', product: 'Green Tea 23oz', revenue: 45.2, cogs: 27.1, grossMargin: 40.0, volume: 12500, avgPrice: 3.62, cogsPerUnit: 2.17, gmVariance: -3.2 },
    { id: 'AP-20', product: 'Arnold Palmer 20oz', revenue: 38.7, cogs: 21.3, grossMargin: 45.0, volume: 9800, avgPrice: 3.95, cogsPerUnit: 2.17, gmVariance: 1.5 },
    { id: 'FP-128', product: 'Fruit Punch Gallon', revenue: 22.4, cogs: 15.7, grossMargin: 30.0, volume: 4200, avgPrice: 5.33, cogsPerUnit: 3.74, gmVariance: -1.8 },
    { id: 'RX-16', product: 'RX Energy 16oz', revenue: 18.9, cogs: 9.5, grossMargin: 50.0, volume: 6300, avgPrice: 3.00, cogsPerUnit: 1.50, gmVariance: 2.3 },
    { id: 'LM-23', product: 'Lemon Tea 23oz', revenue: 15.6, cogs: 9.4, grossMargin: 40.0, volume: 4800, avgPrice: 3.25, cogsPerUnit: 1.95, gmVariance: 0.5 },
    { id: 'MM-15', product: 'Mucho Mango 15.5oz', revenue: 12.3, cogs: 7.4, grossMargin: 40.0, volume: 5100, avgPrice: 2.41, cogsPerUnit: 1.45, gmVariance: -0.8 },
    { id: 'WM-20', product: 'Watermelon 20oz', revenue: 9.8, cogs: 5.9, grossMargin: 40.0, volume: 3200, avgPrice: 3.06, cogsPerUnit: 1.84, gmVariance: 0.2 },
    { id: 'GR-15', product: 'Grapeade 15.5oz', revenue: 7.2, cogs: 4.7, grossMargin: 35.0, volume: 2900, avgPrice: 2.48, cogsPerUnit: 1.62, gmVariance: -1.1 },
  ];

  const glSummary = [
    { id: '4100', glAccount: '4100', description: 'Gross Revenue', mtdActual: 42.3, mtdBudget: 44.0, variance: -3.9, ytdActual: 170.1, ytdBudget: 175.0, trend: 'down' },
    { id: '4200', glAccount: '4200', description: 'Trade Discounts', mtdActual: -5.2, mtdBudget: -4.8, variance: -8.3, ytdActual: -19.8, ytdBudget: -18.5, trend: 'down' },
    { id: '5100', glAccount: '5100', description: 'Cost of Goods Sold', mtdActual: -22.4, mtdBudget: -21.0, variance: -6.7, ytdActual: -89.2, ytdBudget: -85.0, trend: 'down' },
    { id: '5200', glAccount: '5200', description: 'Packaging Materials', mtdActual: -4.8, mtdBudget: -4.5, variance: -6.7, ytdActual: -18.9, ytdBudget: -17.5, trend: 'down' },
    { id: '6100', glAccount: '6100', description: 'Trade Spend', mtdActual: -3.2, mtdBudget: -3.0, variance: -6.7, ytdActual: -12.5, ytdBudget: -12.0, trend: 'stable' },
    { id: '6200', glAccount: '6200', description: 'Freight & Distribution', mtdActual: -2.8, mtdBudget: -2.4, variance: -16.7, ytdActual: -11.2, ytdBudget: -9.8, trend: 'down' },
    { id: '6300', glAccount: '6300', description: 'Sales & Marketing', mtdActual: -1.9, mtdBudget: -2.0, variance: 5.0, ytdActual: -7.8, ytdBudget: -8.0, trend: 'up' },
  ];

  return { alerts, profitabilityByProduct, glSummary };
};

// Generate detail data for drilldown
const generateAlertDetail = (alert, allData) => {
  return {
    ...alert,
    relatedProducts: allData.profitabilityByProduct.filter(p =>
      alert.productLine === 'All Products' || p.product.includes(alert.productLine.split(' ')[0])
    ),
    historicalTrend: [
      { month: 'Jan', value: alert.type === 'risk' ? -0.5 : 0.3 },
      { month: 'Feb', value: alert.type === 'risk' ? -0.8 : 0.5 },
      { month: 'Mar', value: alert.type === 'risk' ? -1.2 : 0.8 },
      { month: 'Apr', value: alert.impactAmount },
    ],
    recommendations: alert.type === 'risk' ? [
      'Review supplier pricing agreements',
      'Evaluate alternative sourcing options',
      'Assess price adjustment feasibility',
    ] : [
      'Develop implementation roadmap',
      'Allocate resources for execution',
      'Set up tracking metrics',
    ],
  };
};

export default function ExecutiveSummaryTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateCOPAData());
      setLoading(false);
    }, 500);
  };

  const handleAlertClick = (params) => {
    const detail = generateAlertDetail(params.row, data);
    setSelectedAlert(detail);
  };

  const handleBackToList = () => {
    setSelectedAlert(null);
  };

  // KPI calculations
  const kpis = data ? {
    netRevenue: data.profitabilityByProduct.reduce((sum, p) => sum + p.revenue, 0),
    grossMargin: 39.2,
    grossMarginVariance: -2.1,
    alertsCount: data.alerts.length,
    criticalAlerts: data.alerts.filter(a => a.severity === 'critical').length,
    opportunities: data.alerts.filter(a => a.type === 'opportunity').reduce((sum, a) => sum + a.impactAmount, 0),
    risks: data.alerts.filter(a => a.type === 'risk').reduce((sum, a) => sum + a.impactAmount, 0),
  } : null;

  // Alert columns
  const alertColumns = [
    { field: 'id', headerName: 'Alert ID', width: 100 },
    { field: 'title', headerName: 'Alert', minWidth: 280, flex: 1.5 },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'risk' ? 'Risk' : 'Opportunity'}
          size="small"
          sx={{
            fontWeight: 600,
            ...(params.value === 'risk' ? margenTheme.chips.type.risk : margenTheme.chips.type.opportunity),
          }}
        />
      ),
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          size="small"
          sx={{
            fontWeight: 600,
            ...margenTheme.chips.severity[params.value],
          }}
        />
      ),
    },
    { field: 'productLine', headerName: 'Product Line', width: 130 },
    { field: 'channel', headerName: 'Channel', width: 110 },
    { field: 'region', headerName: 'Region', width: 110 },
    {
      field: 'impactAmount',
      headerName: 'Impact ($M)',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value >= 0 ? '+' : ''}${params.value.toFixed(1)}M`}
          size="small"
          sx={{
            fontWeight: 700,
            ...(params.value >= 0 ? margenTheme.chips.positive : margenTheme.chips.negative),
          }}
        />
      ),
    },
    { field: 'glAccount', headerName: 'GL Account', width: 120 },
    {
      field: 'daysOpen',
      headerName: 'Days Open',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value > 10 ? alpha('#f59e0b', 0.12) : alpha('#10b981', 0.12),
            color: params.value > 10 ? '#d97706' : '#059669',
          }}
        />
      ),
    },
  ];

  // GL Summary columns
  const glColumns = [
    { field: 'glAccount', headerName: 'GL Account', width: 110 },
    { field: 'description', headerName: 'Description', minWidth: 180, flex: 1 },
    {
      field: 'mtdActual',
      headerName: 'MTD Actual ($M)',
      width: 130,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: params.value >= 0 ? '#059669' : '#64748b' }}>
          {params.value >= 0 ? '' : ''}{params.value.toFixed(1)}
        </Typography>
      ),
    },
    {
      field: 'mtdBudget',
      headerName: 'MTD Budget ($M)',
      width: 140,
      type: 'number',
      valueFormatter: (params) => params.value?.toFixed(1),
    },
    {
      field: 'variance',
      headerName: 'Variance %',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value >= 0 ? '+' : ''}${params.value.toFixed(1)}%`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= 0 ? alpha('#10b981', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 0 ? '#059669' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'ytdActual',
      headerName: 'YTD Actual ($M)',
      width: 130,
      type: 'number',
      valueFormatter: (params) => params.value?.toFixed(1),
    },
    {
      field: 'trend',
      headerName: 'Trend',
      width: 100,
      renderCell: (params) => (
        <Chip
          icon={params.value === 'up' ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : params.value === 'down' ? <TrendingDownIcon sx={{ fontSize: 16 }} /> : null}
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value === 'up' ? alpha('#10b981', 0.12) : params.value === 'down' ? alpha('#ef4444', 0.12) : alpha('#64748b', 0.12),
            color: params.value === 'up' ? '#059669' : params.value === 'down' ? '#dc2626' : '#64748b',
          }}
        />
      ),
    },
  ];

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedAlert) return null;

    const impactColor = selectedAlert.type === 'risk' ? '#ef4444' : '#10b981';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small">
            Back to Alerts
          </Button>
          <Stack direction="row" spacing={1}>
            <Chip label={selectedAlert.id} size="small" sx={{ bgcolor: alpha('#64748b', 0.1) }} />
            <Chip
              label={selectedAlert.type === 'risk' ? 'Risk' : 'Opportunity'}
              size="small"
              sx={selectedAlert.type === 'risk' ? margenTheme.chips.type.risk : margenTheme.chips.type.opportunity}
            />
            <Chip
              label={selectedAlert.severity}
              size="small"
              sx={margenTheme.chips.severity[selectedAlert.severity]}
            />
          </Stack>
        </Stack>

        {/* Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedAlert.title}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>{selectedAlert.description}</Typography>

        {/* Key Metrics Row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Impact', value: `${selectedAlert.impactAmount >= 0 ? '+' : ''}$${Math.abs(selectedAlert.impactAmount).toFixed(1)}M`, color: impactColor, icon: <MoneyIcon /> },
            { label: 'Product Line', value: selectedAlert.productLine, color: '#1a5a9e', icon: <StoreIcon /> },
            { label: 'Channel', value: selectedAlert.channel, color: '#8b5cf6', icon: <ShippingIcon /> },
            { label: 'Days Open', value: selectedAlert.daysOpen, color: selectedAlert.daysOpen > 10 ? '#f59e0b' : '#10b981', icon: <AssessmentIcon /> },
          ].map((metric, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Card sx={{ background: `linear-gradient(135deg, ${alpha(metric.color, 0.1)} 0%, ${alpha(metric.color, 0.05)} 100%)` }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{metric.label}</Typography>
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: metric.color }}>{metric.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 3-Column Detail */}
        <Grid container spacing={2}>
          {/* Column 1: Impact Trend */}
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2, flex: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Impact Trend
                </Typography>
                <Box sx={{ height: 180, mb: 2 }}>
                  <Bar
                    data={{
                      labels: selectedAlert.historicalTrend.map(t => t.month),
                      datasets: [{
                        data: selectedAlert.historicalTrend.map(t => t.value),
                        backgroundColor: selectedAlert.historicalTrend.map(t =>
                          t.value >= 0 ? alpha('#10b981', 0.7) : alpha('#ef4444', 0.7)
                        ),
                        borderRadius: 4,
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false } },
                        y: { grid: { color: 'rgba(0,0,0,0.06)' } },
                      },
                    }}
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                  GL Account Details
                </Typography>
                <Box sx={{ p: 1.5, bgcolor: alpha('#64748b', 0.05), borderRadius: 1 }}>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedAlert.glAccount}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Region: {selectedAlert.region}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Column 2: Related Products */}
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2, flex: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Related Products ({selectedAlert.relatedProducts.length})
                </Typography>
                <Stack spacing={1}>
                  {selectedAlert.relatedProducts.slice(0, 4).map((product, idx) => (
                    <Box key={idx} sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha('#1a5a9e', 0.05), border: '1px solid', borderColor: alpha('#1a5a9e', 0.15) }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{product.product}</Typography>
                        <Chip
                          label={`${product.grossMargin.toFixed(0)}% GM`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: product.grossMargin >= 40 ? alpha('#10b981', 0.12) : alpha('#f59e0b', 0.12),
                            color: product.grossMargin >= 40 ? '#059669' : '#d97706',
                            height: 20,
                            fontSize: '0.65rem',
                          }}
                        />
                      </Stack>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Revenue: ${product.revenue.toFixed(1)}M | Variance: {product.gmVariance >= 0 ? '+' : ''}{product.gmVariance.toFixed(1)}%
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Column 3: Recommendations */}
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: '2px solid', borderColor: alpha(impactColor, 0.3) }}>
              <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Recommended Actions
                </Typography>
                <Stack spacing={1.5} sx={{ flex: 1 }}>
                  {selectedAlert.recommendations.map((rec, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: impactColor, mt: 0.2 }} />
                      <Typography sx={{ fontSize: '0.8rem' }}>{rec}</Typography>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                  Primary Action
                </Typography>
                <Box sx={{ p: 1.5, bgcolor: alpha(impactColor, 0.08), borderRadius: 1, mb: 2 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: impactColor }}>
                    {selectedAlert.action}
                  </Typography>
                </Box>
                <Button fullWidth variant="contained" sx={{ bgcolor: impactColor, '&:hover': { bgcolor: alpha(impactColor, 0.9) } }}>
                  Take Action
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {selectedAlert ? (
        renderDetailView()
      ) : (
        <>
          {/* KPI Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Net Revenue (MTD)</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>${kpis.netRevenue.toFixed(1)}M</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ background: kpis.grossMarginVariance >= 0 ? 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Gross Margin</Typography>
                    <Chip label={`${kpis.grossMarginVariance >= 0 ? '+' : ''}${kpis.grossMarginVariance}%`} size="small" color={kpis.grossMarginVariance >= 0 ? 'success' : 'error'} />
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: kpis.grossMarginVariance >= 0 ? '#059669' : '#dc2626' }}>{kpis.grossMargin}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Risk Exposure</Typography>
                    <Chip label={kpis.criticalAlerts} size="small" color="error" />
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626' }}>${Math.abs(kpis.risks).toFixed(1)}M</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Opportunities</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>+${kpis.opportunities.toFixed(1)}M</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Margin Alerts DataGrid */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Margin Alerts</Typography>
          <Box sx={{ height: 320, mb: 3 }}>
            <DataGrid
              rows={data.alerts}
              columns={alertColumns}
              density="compact"
              checkboxSelection
              disableRowSelectionOnClick
              onRowClick={handleAlertClick}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true } }}
              sx={margenTheme.getDataGridSx({ clickable: true })}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          </Box>

          {/* GL Summary DataGrid */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>GL Account Summary (COPA)</Typography>
          <Box sx={{ height: 300 }}>
            <DataGrid
              rows={data.glSummary}
              columns={glColumns}
              density="compact"
              checkboxSelection
              disableRowSelectionOnClick
              slots={{ toolbar: GridToolbar }}
              sx={margenTheme.getDataGridSx()}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[10, 25]}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
