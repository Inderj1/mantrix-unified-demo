import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  IconButton,
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
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Inventory as ProductIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import stoxTheme from '../stox/stoxTheme';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api/v1/margen/csg`;

const RevenueGrowthAnalytics = ({ onBack }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // State for data
  const [summary, setSummary] = useState(null);
  const [systemData, setSystemData] = useState([]);
  const [distributorData, setDistributorData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [summaryRes, systemRes, distRes, regionRes, trendsRes] = await Promise.all([
        fetch(`${API_BASE}/revenue/summary`).then(r => r.json()),
        fetch(`${API_BASE}/revenue/by-system`).then(r => r.json()),
        fetch(`${API_BASE}/revenue/by-distributor`).then(r => r.json()),
        fetch(`${API_BASE}/revenue/by-region`).then(r => r.json()),
        fetch(`${API_BASE}/revenue/trends/monthly`).then(r => r.json()),
      ]);

      setSummary(summaryRes.summary);
      setSystemData(systemRes.systems || []);
      setDistributorData(distRes.distributors || []);
      setRegionData(regionRes.regions || []);
      setMonthlyTrends(trendsRes.trends || []);
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

  // Calculate derived metrics
  const avgTransactionValue = summary ? (summary.total_revenue / summary.transaction_count) : 0;
  const totalUnits = systemData.reduce((sum, sys) => sum + (sys.quantity || 0), 0);

  // KPI Cards
  const kpiCards = summary ? [
    {
      title: 'Total Revenue',
      value: formatCurrency(summary.total_revenue),
      subtitle: `${summary.transaction_count.toLocaleString()} transactions`,
      color: '#10b981',
      icon: TrendingUpIcon,
    },
    {
      title: 'Avg Transaction Value',
      value: formatCurrency(avgTransactionValue),
      subtitle: 'Average per transaction',
      color: '#2b88d8',
      icon: BusinessIcon,
    },
    {
      title: 'Units Sold',
      value: totalUnits.toLocaleString(),
      subtitle: 'Total quantity across all systems',
      color: '#f97316',
      icon: ProductIcon,
    },
    {
      title: 'Active Period',
      value: summary.date_range.start.split('-')[1] + '/' + summary.date_range.start.split('-')[2],
      subtitle: `to ${summary.date_range.end.split('-')[1]}/${summary.date_range.end.split('-')[2]}/25`,
      color: '#8b5cf6',
      icon: LocationIcon,
    },
  ] : [];

  // Unified DataGrid columns - used for all tabs
  const getColumns = (viewType) => {
    const nameField = viewType === 'system' ? 'system' :
                      viewType === 'distributor' ? 'distributor' : 'region';

    const nameHeader = viewType === 'system' ? 'Product System' :
                       viewType === 'distributor' ? 'Distributor' : 'Region';

    return [
      {
        field: nameField,
        headerName: nameHeader,
        width: 200,
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'total_revenue',
        headerName: 'Revenue',
        width: 140,
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600} color="primary">
            {formatCurrency(params.value)}
          </Typography>
        ),
      },
      {
        field: 'total_gm',
        headerName: 'Gross Margin',
        width: 140,
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600}>
            {formatCurrency(params.value)}
          </Typography>
        ),
      },
      {
        field: 'gm_percent',
        headerName: 'GM%',
        width: 100,
        type: 'number',
        renderCell: (params) => (
          <Chip
            label={formatPercent(params.value)}
            size="small"
            sx={{
              bgcolor: params.value > 85 ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
              color: params.value > 85 ? '#10b981' : '#f59e0b',
              fontWeight: 600,
            }}
          />
        ),
      },
      {
        field: 'transaction_count',
        headerName: 'Transactions',
        width: 120,
        type: 'number',
      },
      ...(viewType !== 'region' ? [{
        field: 'quantity',
        headerName: 'Units',
        width: 100,
        type: 'number',
      }] : []),
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
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: '#f8fafc' }}>
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
              Revenue & Growth Analytics
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
          Revenue & Growth Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Top-line revenue performance, growth trends, and sales analysis by product, channel, and region
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
            <Card sx={{ height: '100%', border: `1px solid ${alpha(kpi.color, 0.2)}` }}>
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

      {/* Tabs for different views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="By Product System" icon={<ProductIcon />} iconPosition="start" />
          <Tab label="By Distributor" icon={<BusinessIcon />} iconPosition="start" />
          <Tab label="By Region" icon={<LocationIcon />} iconPosition="start" />
        </Tabs>

        {/* Unified DataGrid - structure stays consistent across tabs */}
        <Box sx={{ p: 2, height: 600 }}>
          <DataGrid
            rows={
              activeTab === 0 ? systemData.map((row, idx) => ({ id: idx + 1, ...row })) :
              activeTab === 1 ? distributorData.map((row, idx) => ({ id: idx + 1, ...row })) :
              regionData.map((row, idx) => ({ id: idx + 1, ...row }))
            }
            columns={getColumns(
              activeTab === 0 ? 'system' :
              activeTab === 1 ? 'distributor' : 'region'
            )}
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
            sx={stoxTheme.getDataGridSx()}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default RevenueGrowthAnalytics;
