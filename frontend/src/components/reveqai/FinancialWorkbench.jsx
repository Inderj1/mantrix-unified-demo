import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Breadcrumbs,
  Link,
  Stack,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  AccountBalance as FinancialIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShowChart,
  Assessment,
} from '@mui/icons-material';
import stoxTheme from '../stox/stoxTheme';

const FinancialWorkbench = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);

    setTimeout(() => {
      // Mock financial data
      const financialData = [
        { id: 1, asset_id: 'EQ-001', name: 'Trailer T-4501', monthly_revenue: 28500, operating_cost: 12200, depreciation: 2100, net_profit: 14200, profit_margin: 49.8, ebitda: 16300, cash_flow: 15800, trend: 'up' },
        { id: 2, asset_id: 'EQ-002', name: 'Truck TR-2340', monthly_revenue: 22400, operating_cost: 14500, depreciation: 1800, net_profit: 6100, profit_margin: 27.2, ebitda: 7900, cash_flow: 7400, trend: 'flat' },
        { id: 3, asset_id: 'EQ-003', name: 'Trailer T-4502', monthly_revenue: 26300, operating_cost: 11800, depreciation: 1950, net_profit: 12550, profit_margin: 47.7, ebitda: 14500, cash_flow: 13900, trend: 'up' },
        { id: 4, asset_id: 'EQ-004', name: 'Truck TR-2341', monthly_revenue: 31200, operating_cost: 15800, depreciation: 2300, net_profit: 13100, profit_margin: 42.0, ebitda: 15400, cash_flow: 14800, trend: 'up' },
        { id: 5, asset_id: 'EQ-005', name: 'Trailer T-4503', monthly_revenue: 27800, operating_cost: 12900, depreciation: 2000, net_profit: 12900, profit_margin: 46.4, ebitda: 14900, cash_flow: 14300, trend: 'up' },
        { id: 6, asset_id: 'EQ-006', name: 'Forklift FL-890', monthly_revenue: 8500, operating_cost: 6200, depreciation: 450, net_profit: 1850, profit_margin: 21.8, ebitda: 2300, cash_flow: 2100, trend: 'down' },
        { id: 7, asset_id: 'EQ-007', name: 'Truck TR-2342', monthly_revenue: 29400, operating_cost: 14200, depreciation: 2100, net_profit: 13100, profit_margin: 44.6, ebitda: 15200, cash_flow: 14600, trend: 'up' },
        { id: 8, asset_id: 'EQ-008', name: 'Trailer T-4504', monthly_revenue: 30100, operating_cost: 13500, depreciation: 2050, net_profit: 14550, profit_margin: 48.3, ebitda: 16600, cash_flow: 16000, trend: 'up' },
        { id: 9, asset_id: 'EQ-009', name: 'Truck TR-2343', monthly_revenue: 24800, operating_cost: 13900, depreciation: 1900, net_profit: 9000, profit_margin: 36.3, ebitda: 10900, cash_flow: 10300, trend: 'flat' },
        { id: 10, asset_id: 'EQ-010', name: 'Trailer T-4505', monthly_revenue: 27200, operating_cost: 12400, depreciation: 1950, net_profit: 12850, profit_margin: 47.2, ebitda: 14800, cash_flow: 14200, trend: 'up' },
      ];

      setData(financialData);

      // Calculate KPIs
      const totalRevenue = financialData.reduce((sum, r) => sum + r.monthly_revenue, 0);
      const totalEbitda = financialData.reduce((sum, r) => sum + r.ebitda, 0);
      const totalProfit = financialData.reduce((sum, r) => sum + r.net_profit, 0);
      const avgMargin = financialData.reduce((sum, r) => sum + r.profit_margin, 0) / financialData.length;

      setMetrics({
        totalRevenue,
        totalEbitda,
        totalProfit,
        avgMargin,
      });

      setLoading(false);
    }, 800);
  };

  const columns = [
    {
      field: 'asset_id',
      headerName: 'Asset ID',
      minWidth: 110,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#475569', 0.12),
            color: '#475569',
            border: '1px solid',
            borderColor: alpha('#475569', 0.2),
          }}
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Asset Name',
      minWidth: 180,
      flex: 1.4,
    },
    {
      field: 'monthly_revenue',
      headerName: 'Revenue',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value.toLocaleString()}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#10b981', 0.12),
            color: '#059669',
            border: '1px solid',
            borderColor: alpha('#059669', 0.2),
          }}
        />
      ),
    },
    {
      field: 'operating_cost',
      headerName: 'Op Cost',
      minWidth: 120,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value.toLocaleString()}`,
    },
    {
      field: 'depreciation',
      headerName: 'Depreciation',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value.toLocaleString()}`,
    },
    {
      field: 'ebitda',
      headerName: 'EBITDA',
      minWidth: 120,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value.toLocaleString()}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#0ea5e9', 0.12),
            color: '#0284c7',
            border: '1px solid',
            borderColor: alpha('#0284c7', 0.2),
          }}
        />
      ),
    },
    {
      field: 'net_profit',
      headerName: 'Net Profit',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value.toLocaleString()}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#2563eb', 0.12),
            color: '#2563eb',
            border: '1px solid',
            borderColor: alpha('#2563eb', 0.2),
          }}
        />
      ),
    },
    {
      field: 'profit_margin',
      headerName: 'Margin %',
      minWidth: 120,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const value = params.value;
        const colorStyle = value > 45
          ? { bgcolor: alpha('#10b981', 0.12), color: '#059669', border: alpha('#059669', 0.2) }
          : value > 30
          ? { bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', border: alpha('#d97706', 0.2) }
          : { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', border: alpha('#dc2626', 0.2) };
        return (
          <Chip
            label={`${value.toFixed(1)}%`}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: colorStyle.bgcolor,
              color: colorStyle.color,
              border: '1px solid',
              borderColor: colorStyle.border,
            }}
          />
        );
      },
    },
    {
      field: 'cash_flow',
      headerName: 'Cash Flow',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value.toLocaleString()}`,
    },
    {
      field: 'trend',
      headerName: 'Trend',
      minWidth: 100,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const trendMap = {
          'up': { icon: TrendingUp, color: '#059669', label: 'Up' },
          'down': { icon: TrendingDown, color: '#dc2626', label: 'Down' },
          'flat': { icon: TrendingDown, color: '#64748b', label: 'Flat', rotation: 90 },
        };
        const trend = trendMap[params.value];
        const Icon = trend.icon;
        return (
          <Chip
            icon={<Icon sx={{ transform: trend.rotation ? `rotate(${trend.rotation}deg)` : 'none' }} />}
            label={trend.label}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: alpha(trend.color, 0.12),
              color: trend.color,
              border: '1px solid',
              borderColor: alpha(trend.color, 0.2),
            }}
          />
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>REVEQ.AI</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Financial Workbench</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <FinancialIcon sx={{ fontSize: 32, color: '#00ACC1' }} />
              <Typography variant="h4" fontWeight={700}>Financial Workbench</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Comprehensive financial analytics, P&L tracking, budget management, and forecasting
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <AttachMoney sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">${(metrics.totalRevenue / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#0ea5e9', 0.1)} 0%, ${alpha('#0ea5e9', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <ShowChart sx={{ color: '#0ea5e9' }} />
                  <Typography variant="body2" color="text.secondary">Total EBITDA</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#0ea5e9">${(metrics.totalEbitda / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2563eb', 0.1)} 0%, ${alpha('#2563eb', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#2563eb' }} />
                  <Typography variant="body2" color="text.secondary">Net Profit</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2563eb">${(metrics.totalProfit / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Assessment sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">Avg Margin</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.avgMargin.toFixed(1)}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={stoxTheme.getDataGridSx()}
        />
      </Paper>
    </Box>
  );
};

export default FinancialWorkbench;
