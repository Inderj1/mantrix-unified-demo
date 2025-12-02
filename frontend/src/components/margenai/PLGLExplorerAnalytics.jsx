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
  alpha,
  useTheme,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import stoxTheme from '../stox/stoxTheme';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api/v1/margen/csg`;

const PLGLExplorerAnalytics = ({ onBack }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, monthlyRes, categoryRes] = await Promise.all([
        fetch(`${API_BASE}/pl/summary`).then(r => r.json()),
        fetch(`${API_BASE}/pl/by-month`).then(r => r.json()),
        fetch(`${API_BASE}/pl/by-category`).then(r => r.json()),
      ]);

      setSummary(summaryRes.summary);
      setMonthlyData(monthlyRes.data || []);
      setCategoryData(categoryRes.data || []);
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

  // Calculate P&L specific metrics
  const avgMonthlyRevenue = monthlyData.length > 0
    ? summary.total_revenue / monthlyData.length
    : 0;

  const avgMonthlyCOGS = monthlyData.length > 0
    ? summary.total_cogs / monthlyData.length
    : 0;

  const bestMonth = monthlyData.length > 0
    ? monthlyData.reduce((max, month) => month.revenue > max.revenue ? month : max, monthlyData[0])
    : null;

  const avgGrossMargin = monthlyData.length > 0
    ? monthlyData.reduce((sum, month) => sum + (month.gm_percent || 0), 0) / monthlyData.length
    : 0;

  const kpiCards = summary ? [
    {
      title: 'Avg Monthly Revenue',
      value: formatCurrency(avgMonthlyRevenue),
      subtitle: `Across ${monthlyData.length} months`,
      color: '#10b981',
      icon: TrendingUpIcon,
    },
    {
      title: 'Avg Monthly COGS',
      value: formatCurrency(avgMonthlyCOGS),
      subtitle: 'Average cost per month',
      color: '#ef4444',
      icon: AccountBalanceIcon,
    },
    {
      title: 'Best Month',
      value: bestMonth ? bestMonth.month_label : 'N/A',
      subtitle: bestMonth ? formatCurrency(bestMonth.revenue) : '',
      color: '#8b5cf6',
      icon: MoneyIcon,
    },
    {
      title: 'Avg GM% Trend',
      value: formatPercent(avgGrossMargin),
      subtitle: 'Monthly average margin',
      color: '#3b82f6',
      icon: CalendarIcon,
    },
  ] : [];

  // Monthly P&L columns
  const monthlyColumns = [
    {
      field: 'month_label',
      headerName: 'Period',
      width: 140,
      flex: 1,
    },
    {
      field: 'revenue',
      headerName: 'Revenue',
      width: 140,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="success">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'cogs',
      headerName: 'COGS',
      width: 130,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="error">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'gross_margin',
      headerName: 'Gross Margin',
      width: 140,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'gm_percent',
      headerName: 'GM %',
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
      width: 110,
      type: 'number',
    },
  ];

  // Category breakdown columns
  const categoryColumns = [
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: alpha('#3b82f6', 0.1),
            color: '#3b82f6',
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: 'subcategory',
      headerName: 'Subcategory',
      width: 200,
      flex: 1,
    },
    {
      field: 'revenue',
      headerName: 'Revenue',
      width: 130,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="success">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'cogs',
      headerName: 'COGS',
      width: 130,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="error">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'gross_margin',
      headerName: 'Gross Margin',
      width: 140,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="primary">
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
              P&L Statement & GL Explorer
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
            Back
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AssessmentIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                P&L Statement & GL Explorer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Profit & loss analysis, revenue/expense tracking, and financial performance metrics
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton onClick={fetchData} sx={{ bgcolor: alpha('#8b5cf6', 0.1) }}>
              <RefreshIcon sx={{ color: '#8b5cf6' }} />
            </IconButton>
            <IconButton sx={{ bgcolor: alpha('#8b5cf6', 0.1) }}>
              <DownloadIcon sx={{ color: '#8b5cf6' }} />
            </IconButton>
          </Stack>
        </Stack>
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
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(kpi.color, 0.1)} 0%, ${alpha(kpi.color, 0.05)} 100%)`,
                border: `1px solid ${alpha(kpi.color, 0.2)}`,
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={kpi.color}>
                      {kpi.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {kpi.subtitle}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: alpha(kpi.color, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <kpi.icon sx={{ color: kpi.color, fontSize: 24 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs for different views */}
      <Paper sx={{ mb: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Monthly P&L" icon={<CalendarIcon />} iconPosition="start" />
          <Tab label="By Category" icon={<CategoryIcon />} iconPosition="start" />
        </Tabs>

        {/* Unified DataGrid - structure stays consistent across tabs */}
        <Box sx={{ p: 2, height: 600 }}>
          <DataGrid
            rows={
              activeTab === 0
                ? monthlyData.map((row, idx) => ({ id: idx + 1, ...row }))
                : categoryData.map((row, idx) => ({ id: idx + 1, ...row }))
            }
            columns={activeTab === 0 ? monthlyColumns : categoryColumns}
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

export default PLGLExplorerAnalytics;
