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
  TrendingUp as RevenueIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  AttachMoney as MoneyIcon,
  ShowChart as ProfitIcon,
  Assessment as AnalyticsIcon,
  AccountBalance as ROIIcon,
} from '@mui/icons-material';
import stoxTheme from '../stox/stoxTheme';

const RevenueAnalytics = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);

    setTimeout(() => {
      // Mock revenue data
      const revenueData = [
        { id: 1, asset_id: 'EQ-001', name: 'Trailer T-4501', monthly_revenue: 28500, operating_cost: 12200, net_profit: 16300, profit_margin: 57.2, roi: 133.6 },
        { id: 2, asset_id: 'EQ-002', name: 'Truck TR-2340', monthly_revenue: 22400, operating_cost: 14500, net_profit: 7900, profit_margin: 35.3, roi: 54.5 },
        { id: 3, asset_id: 'EQ-003', name: 'Trailer T-4502', monthly_revenue: 26300, operating_cost: 11800, net_profit: 14500, profit_margin: 55.1, roi: 122.9 },
        { id: 4, asset_id: 'EQ-004', name: 'Truck TR-2341', monthly_revenue: 31200, operating_cost: 15800, net_profit: 15400, profit_margin: 49.4, roi: 97.5 },
        { id: 5, asset_id: 'EQ-005', name: 'Trailer T-4503', monthly_revenue: 27800, operating_cost: 12900, net_profit: 14900, profit_margin: 53.6, roi: 115.5 },
        { id: 6, asset_id: 'EQ-006', name: 'Forklift FL-890', monthly_revenue: 8500, operating_cost: 6200, net_profit: 2300, profit_margin: 27.1, roi: 37.1 },
        { id: 7, asset_id: 'EQ-007', name: 'Truck TR-2342', monthly_revenue: 29400, operating_cost: 14200, net_profit: 15200, profit_margin: 51.7, roi: 107.0 },
        { id: 8, asset_id: 'EQ-008', name: 'Trailer T-4504', monthly_revenue: 30100, operating_cost: 13500, net_profit: 16600, profit_margin: 55.1, roi: 123.0 },
      ];

      setData(revenueData);

      // Calculate KPIs
      const totalRevenue = revenueData.reduce((sum, r) => sum + r.monthly_revenue, 0);
      const totalCost = revenueData.reduce((sum, r) => sum + r.operating_cost, 0);
      const totalProfit = revenueData.reduce((sum, r) => sum + r.net_profit, 0);
      const avgMargin = revenueData.reduce((sum, r) => sum + r.profit_margin, 0) / revenueData.length;

      setMetrics({
        totalRevenue,
        totalCost,
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
      headerName: 'Operating Cost',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value.toLocaleString()}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#ef4444', 0.12),
            color: '#dc2626',
            border: '1px solid',
            borderColor: alpha('#dc2626', 0.2),
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
        const colorStyle = value > 50
          ? { bgcolor: alpha('#10b981', 0.12), color: '#059669', border: alpha('#059669', 0.2) }
          : value > 35
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
      field: 'roi',
      headerName: 'ROI %',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `${params.value.toFixed(1)}%`,
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>REVEQ.AI</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Revenue Analytics</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <RevenueIcon sx={{ fontSize: 32, color: '#4CAF50' }} />
              <Typography variant="h4" fontWeight={700}>Revenue Analytics</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Equipment profitability and financial performance analysis
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.1)} 0%, ${alpha('#4CAF50', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <MoneyIcon sx={{ color: '#4CAF50' }} />
                  <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#4CAF50">${(metrics.totalRevenue / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2196F3', 0.1)} 0%, ${alpha('#2196F3', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <ProfitIcon sx={{ color: '#2196F3' }} />
                  <Typography variant="body2" color="text.secondary">Net Profit</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2196F3">${(metrics.totalProfit / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#FF9800', 0.1)} 0%, ${alpha('#FF9800', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <AnalyticsIcon sx={{ color: '#FF9800' }} />
                  <Typography variant="body2" color="text.secondary">Avg Margin</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#FF9800">{metrics.avgMargin.toFixed(1)}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#F44336', 0.1)} 0%, ${alpha('#F44336', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <ROIIcon sx={{ color: '#F44336' }} />
                  <Typography variant="body2" color="text.secondary">Operating Cost</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#F44336">${(metrics.totalCost / 1000).toFixed(1)}K</Typography>
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

export default RevenueAnalytics;
