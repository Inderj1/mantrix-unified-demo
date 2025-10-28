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
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  TrendingUp,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  ShowChart,
  Store,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import TimeGranularitySelector from '../common/TimeGranularitySelector';
import stoxTheme from './stoxTheme';

const StoreForecast = ({ onBack }) => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [granularity, setGranularity] = useState('daily');

  useEffect(() => {
    fetchForecastData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granularity]);

  const fetchForecastData = () => {
    setLoading(true);

    setTimeout(() => {
      const stores = [
        { id: 'STORE-001', name: 'NYC Fifth Avenue', region: 'Northeast' },
        { id: 'STORE-045', name: 'LA Beverly Hills', region: 'West' },
        { id: 'STORE-089', name: 'Chicago Magnificent Mile', region: 'Midwest' },
        { id: 'STORE-123', name: 'Miami Design District', region: 'Southeast' },
      ];

      const products = [
        { sku: 'SKU-7891', name: 'Premium Color Kit', category: 'Hair Color' },
        { sku: 'SKU-4523', name: 'Color Reviving Gloss', category: 'Hair Care' },
        { sku: 'SKU-9021', name: 'Root Retouch Kit', category: 'Hair Color' },
      ];

      const data = [];
      let idCounter = 1;

      stores.forEach((store) => {
        products.forEach((product) => {
          const baseline = 80 + Math.random() * 120;
          const trend = 1 + (Math.random() * 0.2 - 0.1);
          const seasonality = 1 + Math.sin(Date.now() / 1000000) * 0.15;
          const forecast = Math.round(baseline * trend * seasonality);
          const actual = Math.round(forecast * (0.92 + Math.random() * 0.16));
          const accuracy = ((1 - Math.abs(actual - forecast) / actual) * 100).toFixed(1);
          const stockLevel = Math.round(forecast * (2 + Math.random()));
          const daysOfStock = Math.round(stockLevel / actual);

          data.push({
            id: `SF${String(idCounter++).padStart(4, '0')}`,
            store_id: store.id,
            store_name: store.name,
            region: store.region,
            product_sku: product.sku,
            product_name: product.name,
            category: product.category,
            forecast_qty: forecast,
            actual_qty: actual,
            accuracy: parseFloat(accuracy),
            stock_level: stockLevel,
            days_of_stock: daysOfStock,
            status: accuracy > 90 ? 'Excellent' : accuracy > 80 ? 'Good' : 'Review',
            last_updated: new Date().toISOString(),
          });
        });
      });

      setForecastData(data);

      // Calculate metrics
      const totalForecast = data.reduce((sum, row) => sum + row.forecast_qty, 0);
      const totalActual = data.reduce((sum, row) => sum + row.actual_qty, 0);
      const avgAccuracy = data.reduce((sum, row) => sum + row.accuracy, 0) / data.length;
      const excellentForecasts = data.filter(d => d.accuracy > 90).length;

      setMetrics({
        totalStores: stores.length,
        totalSKUs: products.length,
        avgAccuracy: avgAccuracy.toFixed(1),
        excellentRate: ((excellentForecasts / data.length) * 100).toFixed(1),
      });

      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'Forecast ID', minWidth: 120, flex: 1 },
    { field: 'store_id', headerName: 'Store ID', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'store_name', headerName: 'Store Name', minWidth: 180, flex: 1.2, align: 'center', headerAlign: 'center' },
    { field: 'region', headerName: 'Region', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_name', headerName: 'Product', minWidth: 180, flex: 1.2, align: 'center', headerAlign: 'center' },
    { field: 'category', headerName: 'Category', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    {
      field: 'forecast_qty',
      headerName: 'Forecast',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'actual_qty',
      headerName: 'Actual',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'accuracy',
      headerName: 'Accuracy %',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          color={params.value > 90 ? 'success' : params.value > 80 ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'stock_level',
      headerName: 'Stock Level',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'days_of_stock',
      headerName: 'Days of Stock',
      minWidth: 130,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value} days`}
          size="small"
          color={params.value < 7 ? 'error' : params.value < 14 ? 'warning' : 'success'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          {params.value === 'Excellent' ? (
            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
          ) : params.value === 'Good' ? (
            <ShowChart sx={{ fontSize: 16, color: 'warning.main' }} />
          ) : (
            <Warning sx={{ fontSize: 16, color: 'error.main' }} />
          )}
          <Typography variant="caption">{params.value}</Typography>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>
              STOX.AI
            </Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>
              Store Level View
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Demand Forecasting
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
            Back
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <TrendingUp sx={{ fontSize: 32, color: '#3b82f6' }} />
              <Typography variant="h4" fontWeight={700}>
                Store-Level Demand Forecasting
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              AI-driven store-level demand forecasting with seasonality, trends, and promotion impact
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchForecastData} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Data">
              <IconButton color="primary">
                <Download />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Metrics */}
      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Store sx={{ color: '#3b82f6' }} />
                  <Typography variant="body2" color="text.secondary">Total Stores</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#3b82f6">{metrics.totalStores}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2563eb', 0.1)} 0%, ${alpha('#2563eb', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <ShowChart sx={{ color: '#2563eb' }} />
                  <Typography variant="body2" color="text.secondary">Total SKUs</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2563eb">{metrics.totalSKUs}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Avg Accuracy</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.avgAccuracy}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#059669', 0.1)} 0%, ${alpha('#059669', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#059669' }} />
                  <Typography variant="body2" color="text.secondary">Excellent Rate</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#059669">{metrics.excellentRate}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Time Granularity Selector */}
      <Box sx={{ mb: 2 }}>
        <TimeGranularitySelector value={granularity} onChange={setGranularity} />
      </Box>

      {/* DataGrid */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DataGrid
          rows={forecastData}
          columns={columns}
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
      </Paper>
    </Box>
  );
};

export default StoreForecast;
