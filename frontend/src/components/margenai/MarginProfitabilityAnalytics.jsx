import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  AttachMoney as MoneyIcon,
  BusinessCenter as BusinessIcon,
  Inventory as ProductIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import stoxTheme from '../stox/stoxTheme';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api/v1/margen/csg`;

const COLORS = ['#10b981', '#1a5a9e', '#f59e0b', '#ef4444', '#8b5cf6'];

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const MarginProfitabilityAnalytics = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // State for data
  const [summary, setSummary] = useState(null);
  const [systemMargins, setSystemMargins] = useState([]);
  const [distributorMargins, setDistributorMargins] = useState([]);
  const [topPerformers, setTopPerformers] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [summaryRes, systemRes, distRes, performersRes] = await Promise.all([
        fetch(`${API_BASE}/revenue/summary`).then(r => r.json()),
        fetch(`${API_BASE}/margin/by-system?sort_by=gm_percent`).then(r => r.json()),
        fetch(`${API_BASE}/margin/by-distributor?sort_by=gm_percent`).then(r => r.json()),
        fetch(`${API_BASE}/margin/top-performers`).then(r => r.json()),
      ]);

      setSummary(summaryRes.summary);
      setSystemMargins(systemRes.systems || []);
      setDistributorMargins(distRes.distributors || []);
      setTopPerformers(performersRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(1)}%`;
  };

  const getMarginColor = (gmPercent) => {
    if (gmPercent >= 90) return '#10b981';
    if (gmPercent >= 85) return '#1a5a9e';
    if (gmPercent >= 80) return '#f59e0b';
    return '#ef4444';
  };

  const getMarginLabel = (gmPercent) => {
    if (gmPercent >= 90) return 'Excellent';
    if (gmPercent >= 85) return 'Good';
    if (gmPercent >= 80) return 'Fair';
    return 'Needs Attention';
  };

  // Calculate best and worst performers
  const bestSystem = systemMargins.length > 0 ? systemMargins[0] : null;
  const worstSystem = systemMargins.length > 0 ? systemMargins[systemMargins.length - 1] : null;

  // KPI Cards
  const kpiCards = summary ? [
    {
      title: 'Gross Margin $',
      value: formatCurrency(summary.total_gm),
      subtitle: 'Total gross profit',
      color: getMarginColor(summary.gm_percent),
      icon: MoneyIcon,
    },
    {
      title: 'GM %',
      value: formatPercent(summary.gm_percent),
      subtitle: `Avg: ${formatPercent(summary.avg_gm_percent)}`,
      color: getMarginColor(summary.gm_percent),
      icon: TrendingUpIcon,
    },
    {
      title: 'Best System (GM%)',
      value: bestSystem ? bestSystem.system : 'N/A',
      subtitle: bestSystem ? formatPercent(bestSystem.gm_percent) : '',
      color: '#10b981',
      icon: StarIcon,
    },
    {
      title: 'Lowest System (GM%)',
      value: worstSystem ? worstSystem.system : 'N/A',
      subtitle: worstSystem ? formatPercent(worstSystem.gm_percent) : '',
      color: '#f59e0b',
      icon: BusinessIcon,
    },
  ] : [];

  // Unified DataGrid columns - used for all tabs
  const getColumns = (viewType) => {
    const nameField = viewType === 'system' ? 'system' : 'distributor';

    const nameHeader = viewType === 'system' ? 'Product System' : 'Distributor';

    return [
      {
        field: 'rank',
        headerName: '#',
        width: 60,
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: nameField,
        headerName: nameHeader,
        width: 200,
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'gm_percent',
        headerName: 'GM%',
        width: 140,
        type: 'number',
        renderCell: (params) => (
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: getMarginColor(params.value) }}>
              {formatPercent(params.value)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(params.value, 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                mt: 0.5,
                bgcolor: alpha(getMarginColor(params.value), 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: getMarginColor(params.value),
                },
              }}
            />
          </Box>
        ),
      },
      {
        field: 'total_gm',
        headerName: 'Total GM',
        width: 130,
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600} color="primary">
            {formatCurrency(params.value)}
          </Typography>
        ),
      },
      {
        field: 'total_revenue',
        headerName: 'Revenue',
        width: 130,
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body2">
            {formatCurrency(params.value)}
          </Typography>
        ),
      },
      {
        field: 'transaction_count',
        headerName: 'Transactions',
        width: 110,
        type: 'number',
      },
    ];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: colors.background }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              MARGEN.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Margin & Profitability
            </Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              variant="outlined"
              size="small"
            >
              Refresh
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              variant="outlined"
              size="small"
            >
              Export
            </Button>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              variant="contained"
              size="small"
            >
              Back
            </Button>
          </Stack>
        </Stack>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          Margin & Profitability Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gross margin analysis, contribution margin, and profitability by segment with detailed performance metrics
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading data: {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', border: `1px solid ${alpha(kpi.color, 0.2)}`, bgcolor: colors.cardBg }}>
              <CardContent>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: kpi.color, mb: 0.5 }}>
                      {kpi.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {kpi.subtitle}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: alpha(kpi.color, 0.1),
                      borderRadius: 2,
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <kpi.icon sx={{ color: kpi.color, fontSize: 28 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Top Performers */}
      {topPerformers && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', border: `2px solid ${alpha('#10b981', 0.3)}`, bgcolor: darkMode ? colors.cardBg : alpha('#10b981', 0.02) }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <StarIcon sx={{ fontSize: 40, color: '#10b981' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Top System by GM%
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {topPerformers.top_system?.system || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {formatPercent(topPerformers.top_system?.gm_percent)} • {formatCurrency(topPerformers.top_system?.total_revenue)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', border: `2px solid ${alpha('#1a5a9e', 0.3)}`, bgcolor: darkMode ? colors.cardBg : alpha('#1a5a9e', 0.02) }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <StarIcon sx={{ fontSize: 40, color: '#1a5a9e' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Top Distributor by GM%
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {topPerformers.top_distributor?.distributor || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {formatPercent(topPerformers.top_distributor?.gm_percent)} • {formatCurrency(topPerformers.top_distributor?.total_revenue)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs for different views */}
      <Paper sx={{ mb: 3, bgcolor: colors.paper }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: colors.border }}>
          <Tab label="By Product System" icon={<ProductIcon />} iconPosition="start" />
          <Tab label="By Distributor" icon={<BusinessIcon />} iconPosition="start" />
        </Tabs>

        {/* Unified DataGrid - structure stays consistent across tabs */}
        <Box sx={{ p: 2, height: 600 }}>
          <DataGrid
            rows={
              activeTab === 0
                ? systemMargins.map((row, idx) => ({ id: idx + 1, rank: idx + 1, ...row }))
                : distributorMargins.map((row, idx) => ({ id: idx + 1, rank: idx + 1, ...row }))
            }
            columns={getColumns(activeTab === 0 ? 'system' : 'distributor')}
            loading={loading}
            density="compact"
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              ...stoxTheme.getDataGridSx(),
              bgcolor: colors.paper,
              '& .MuiDataGrid-cell': { color: colors.text, borderColor: colors.border },
              '& .MuiDataGrid-columnHeaders': { bgcolor: darkMode ? colors.cardBg : '#fafafa', color: colors.text, borderColor: colors.border },
              '& .MuiDataGrid-footerContainer': { bgcolor: colors.paper, borderColor: colors.border },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default MarginProfitabilityAnalytics;
