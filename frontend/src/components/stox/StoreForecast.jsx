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
      // Aligned data: 12 stores (6 DC-East, 6 DC-Midwest) - aggregates to DC-level totals
      const forecastData = [
        // DC-East Region Stores
        { id: 'FC0001', date: '2025-10-27', store_id: 'Store-Chicago-001', store_name: 'Chicago Magnificent Mile', channel: 'Retail Store', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_units: 20, confidence_level: 0.92, forecast_method: 'Prophet/ML', upper_bound: 23, lower_bound: 17, historical_avg: 20, promotion_flag: 'No', seasonality_factor: 1.0 },
        { id: 'FC0002', date: '2025-10-27', store_id: 'Store-NYC-015', store_name: 'NYC Fifth Avenue', channel: 'Retail Store', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_units: 27, confidence_level: 0.94, forecast_method: 'ARIMA', upper_bound: 31, lower_bound: 23, historical_avg: 27, promotion_flag: 'No', seasonality_factor: 1.0 },
        { id: 'FC0003', date: '2025-10-27', store_id: 'Store-Boston-022', store_name: 'Boston Newbury St', channel: 'Retail Store', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_units: 25, confidence_level: 0.91, forecast_method: 'Prophet/ML', upper_bound: 29, lower_bound: 21, historical_avg: 25, promotion_flag: 'No', seasonality_factor: 1.0 },
        { id: 'FC0004', date: '2025-10-27', store_id: 'Store-Philly-018', store_name: 'Philadelphia Rittenhouse', channel: 'Retail Store', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_units: 22, confidence_level: 0.90, forecast_method: 'ARIMA', upper_bound: 26, lower_bound: 18, historical_avg: 22, promotion_flag: 'No', seasonality_factor: 1.0 },
        { id: 'FC0005', date: '2025-10-27', store_id: 'Store-DC-Metro-012', store_name: 'DC Georgetown', channel: 'Retail Store', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_units: 23, confidence_level: 0.89, forecast_method: 'Prophet/ML', upper_bound: 27, lower_bound: 19, historical_avg: 23, promotion_flag: 'No', seasonality_factor: 1.0 },
        { id: 'FC0006', date: '2025-10-27', store_id: 'Store-Baltimore-009', store_name: 'Baltimore Harbor', channel: 'Retail Store', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_units: 20, confidence_level: 0.88, forecast_method: 'ARIMA', upper_bound: 24, lower_bound: 16, historical_avg: 20, promotion_flag: 'No', seasonality_factor: 1.0 },

        // DC-Midwest Region Stores
        { id: 'FC0007', date: '2025-10-27', store_id: 'Store-Dallas-019', store_name: 'Dallas Galleria', channel: 'Retail Store', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_units: 18, confidence_level: 0.93, forecast_method: 'Prophet/ML', upper_bound: 21, lower_bound: 15, historical_avg: 18, promotion_flag: 'No', seasonality_factor: 1.0 },
        { id: 'FC0008', date: '2025-10-27', store_id: 'Store-Miami-008', store_name: 'Miami Design District', channel: 'Retail Store', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_units: 22, confidence_level: 0.91, forecast_method: 'ARIMA', upper_bound: 26, lower_bound: 18, historical_avg: 22, promotion_flag: 'No', seasonality_factor: 1.0 },
        { id: 'FC0009', date: '2025-10-27', store_id: 'Store-Minneapolis-031', store_name: 'Minneapolis Mall', channel: 'Retail Store', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_units: 19, confidence_level: 0.90, forecast_method: 'Prophet/ML', upper_bound: 23, lower_bound: 15, historical_avg: 19, promotion_flag: 'No', seasonality_factor: 1.0 },
        { id: 'FC0010', date: '2025-10-27', store_id: 'Store-Detroit-025', store_name: 'Detroit Somerset', channel: 'Retail Store', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_units: 17, confidence_level: 0.89, forecast_method: 'ARIMA', upper_bound: 20, lower_bound: 14, historical_avg: 17, promotion_flag: 'No', seasonality_factor: 1.0 },
        { id: 'FC0011', date: '2025-10-27', store_id: 'Store-STL-014', store_name: 'St Louis Plaza', channel: 'Retail Store', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_units: 16, confidence_level: 0.87, forecast_method: 'Prophet/ML', upper_bound: 19, lower_bound: 13, historical_avg: 16, promotion_flag: 'No', seasonality_factor: 1.0 },
        { id: 'FC0012', date: '2025-10-27', store_id: 'Store-KC-027', store_name: 'Kansas City Plaza', channel: 'Retail Store', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_units: 15, confidence_level: 0.86, forecast_method: 'ARIMA', upper_bound: 18, lower_bound: 12, historical_avg: 15, promotion_flag: 'No', seasonality_factor: 1.0 },
      ];

      setForecastData(forecastData);

      // Calculate metrics
      const avgConfidence = (forecastData.reduce((sum, row) => sum + row.confidence_level, 0) / forecastData.length * 100).toFixed(1);
      const totalForecasted = forecastData.reduce((sum, row) => sum + row.forecasted_units, 0);
      const uniqueStores = new Set(forecastData.map(d => d.store_id)).size;
      const uniqueProducts = new Set(forecastData.map(d => d.product_sku)).size;

      setMetrics({
        totalForecasts: forecastData.length,
        avgConfidence: avgConfidence,
        totalUnits: totalForecasted,
        storeCount: uniqueStores,
        productCount: uniqueProducts,
      });

      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 0.8 },
    { field: 'date', headerName: 'Date', minWidth: 120, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'store_id', headerName: 'Store ID', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
    { field: 'store_name', headerName: 'Store Name', minWidth: 180, flex: 1.4 },
    { field: 'channel', headerName: 'Channel', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_name', headerName: 'Product', minWidth: 180, flex: 1.4 },
    {
      field: 'forecasted_units',
      headerName: 'Forecasted Units',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'confidence_level',
      headerName: 'Confidence',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `${(params.value * 100).toFixed(0)}%`,
    },
    { field: 'forecast_method', headerName: 'Method', minWidth: 130, flex: 1, align: 'center', headerAlign: 'center' },
    {
      field: 'upper_bound',
      headerName: 'Upper Bound (95% CI)',
      minWidth: 150,
      flex: 1.2,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'lower_bound',
      headerName: 'Lower Bound (95% CI)',
      minWidth: 150,
      flex: 1.2,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'historical_avg',
      headerName: 'Historical Avg',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    { field: 'promotion_flag', headerName: 'Promotion', minWidth: 110, flex: 0.9, align: 'center', headerAlign: 'center' },
    {
      field: 'seasonality_factor',
      headerName: 'Seasonality',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value.toFixed(2)}
          size="small"
          color={params.value > 1.1 ? 'success' : params.value < 0.9 ? 'error' : 'default'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Store System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Sell-Through Forecasting</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <TrendingUp sx={{ fontSize: 32, color: '#2563eb' }} />
              <Typography variant="h4" fontWeight={700}>Sell-Through Forecasting</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Predict future demand using ML and time-series models with confidence intervals
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={fetchForecastData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2563eb', 0.1)} 0%, ${alpha('#2563eb', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <ShowChart sx={{ color: '#2563eb' }} />
                  <Typography variant="body2" color="text.secondary">Total Forecasts</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2563eb">{metrics.totalForecasts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Avg Confidence</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.avgConfidence}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#3b82f6' }} />
                  <Typography variant="body2" color="text.secondary">Total Units</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#3b82f6">{metrics.totalUnits.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#8b5cf6', 0.1)} 0%, ${alpha('#8b5cf6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Store sx={{ color: '#8b5cf6' }} />
                  <Typography variant="body2" color="text.secondary">Stores</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#8b5cf6">{metrics.storeCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%' }}>
        <DataGrid
          rows={forecastData}
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

export default StoreForecast;
