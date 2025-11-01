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
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Science,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  CheckCircle,
  QueryStats,
  PlayArrow,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

const Tile0ForecastSimulation = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);

    setTimeout(() => {
      // 12 Stores with base forecast data
      const stores = [
        { id: 'Store-Chicago-001', name: 'Chicago Magnificent Mile', region: 'DC-East' },
        { id: 'Store-NYC-015', name: 'NYC Fifth Avenue', region: 'DC-East' },
        { id: 'Store-Boston-022', name: 'Boston Newbury St', region: 'DC-East' },
        { id: 'Store-Philly-018', name: 'Philadelphia Rittenhouse', region: 'DC-East' },
        { id: 'Store-DC-Metro-012', name: 'DC Georgetown', region: 'DC-East' },
        { id: 'Store-Baltimore-009', name: 'Baltimore Harbor', region: 'DC-East' },
        { id: 'Store-Dallas-019', name: 'Dallas Galleria', region: 'DC-Midwest' },
        { id: 'Store-Miami-008', name: 'Miami Design District', region: 'DC-Midwest' },
        { id: 'Store-Minneapolis-031', name: 'Minneapolis Mall', region: 'DC-Midwest' },
        { id: 'Store-Detroit-025', name: 'Detroit Somerset', region: 'DC-Midwest' },
        { id: 'Store-STL-014', name: 'St Louis Plaza', region: 'DC-Midwest' },
        { id: 'Store-KC-027', name: 'Kansas City Plaza', region: 'DC-Midwest' },
      ];

      // 3 Products
      const products = [
        { sku: 'MR_HAIR_101', name: 'Premium Hair Color Kit', family: 'Hair Care' },
        { sku: 'MR_HAIR_201', name: 'Root Touch-Up Spray', family: 'Hair Care' },
        { sku: 'MR_CARE_301', name: 'Intensive Hair Mask', family: 'Hair Treatment' },
      ];

      const forecastData = [];
      let idCounter = 1;

      stores.forEach((store) => {
        products.forEach((product) => {
          // Generate baseline forecast (represents historical average)
          const baselineForecast = Math.round(800 + Math.random() * 400); // 800-1200 units

          // Model 1 - ARIMA Forecast (±10% variance)
          const arimaForecast = Math.round(baselineForecast * (0.90 + Math.random() * 0.20));

          // Model 2 - ETS Forecast (±15% variance)
          const etsForecast = Math.round(baselineForecast * (0.85 + Math.random() * 0.30));

          // Model 3 - ML Ensemble (usually more accurate, ±8% variance)
          const mlForecast = Math.round(baselineForecast * (0.92 + Math.random() * 0.16));

          // Forecast Error σ (standard deviation of past errors)
          const forecastError = Math.round(50 + Math.random() * 100);

          // Random model selection (ML Ensemble is most common)
          const modelOptions = ['Model 1 - ARIMA', 'Model 2 - ETS', 'Model 3 - ML Ensemble'];
          const chosenModel = modelOptions[Math.floor(Math.random() * 10) % 3]; // Bias toward ML

          // Auto Forecast Result (based on chosen model)
          let autoForecastResult;
          if (chosenModel === 'Model 1 - ARIMA') autoForecastResult = arimaForecast;
          else if (chosenModel === 'Model 2 - ETS') autoForecastResult = etsForecast;
          else autoForecastResult = mlForecast;

          // Random manual override (10% of cases)
          const hasOverride = Math.random() < 0.10;
          const manualOverride = hasOverride ? Math.round(autoForecastResult * (0.90 + Math.random() * 0.20)) : null;
          const overrideReason = hasOverride ? (Math.random() > 0.5 ? 'Promotional campaign in Nov' : 'New store launch event') : '';

          // Confirmed Forecast (final accepted value)
          const confirmedForecast = manualOverride || autoForecastResult;

          // Forecast owner (random planner)
          const planners = ['J. Smith', 'A. Chen', 'M. Rodriguez', 'K. Patel'];
          const forecastOwner = planners[idCounter % 4];

          // Confirmation date (recent)
          const confirmationDate = new Date(2025, 9, 25 + (idCounter % 5)).toISOString().split('T')[0];

          forecastData.push({
            id: `FS${String(idCounter++).padStart(4, '0')}`,
            store_id: store.id,
            store_name: store.name,
            product_sku: product.sku,
            product_name: product.name,
            product_family: product.family,
            channel: 'CH01 - Stores',
            forecast_horizon: 'Monthly - 52 Months',
            model1_arima: arimaForecast,
            model2_ets: etsForecast,
            model3_ml_ensemble: mlForecast,
            forecast_error_sigma: forecastError,
            chosen_model: chosenModel,
            auto_forecast_result: autoForecastResult,
            manual_override_forecast: manualOverride,
            override_reason: overrideReason,
            confirmed_forecast_qty: confirmedForecast,
            forecast_owner: forecastOwner,
            confirmation_date: confirmationDate,
            status: manualOverride ? 'Overridden' : 'Auto-Accepted',
          });
        });
      });

      setData(forecastData);

      // Calculate metrics
      const overriddenCount = forecastData.filter(d => d.manual_override_forecast !== null).length;
      const autoAcceptedCount = forecastData.length - overriddenCount;
      const totalForecastQty = forecastData.reduce((sum, row) => sum + row.confirmed_forecast_qty, 0);
      const avgError = Math.round(forecastData.reduce((sum, row) => sum + row.forecast_error_sigma, 0) / forecastData.length);

      setMetrics({
        totalForecasts: forecastData.length,
        overriddenCount,
        autoAcceptedCount,
        totalForecastQty,
        avgForecastError: avgError,
      });

      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 0.8 },
    { field: 'store_id', headerName: 'Store ID', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
    { field: 'store_name', headerName: 'Store Name', minWidth: 180, flex: 1.4 },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_name', headerName: 'Product', minWidth: 180, flex: 1.4 },
    { field: 'product_family', headerName: 'Family', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'channel', headerName: 'Channel', minWidth: 130, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'forecast_horizon', headerName: 'Horizon', minWidth: 150, flex: 1.1, align: 'center', headerAlign: 'center' },
    {
      field: 'model1_arima',
      headerName: 'Model 1 - ARIMA',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'model2_ets',
      headerName: 'Model 2 - ETS',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'model3_ml_ensemble',
      headerName: 'Model 3 - ML',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toLocaleString()}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#10b981', 0.12),
            color: '#059669',
          }}
        />
      ),
    },
    {
      field: 'forecast_error_sigma',
      headerName: 'Error σ',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'chosen_model',
      headerName: 'Chosen Model',
      minWidth: 170,
      flex: 1.3,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value?.includes('ML') ? 'success' : 'default'}
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'auto_forecast_result',
      headerName: 'Auto Forecast',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'manual_override_forecast',
      headerName: 'Manual Override',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => params.value ? (
        <Chip
          label={params.value.toLocaleString()}
          size="small"
          color="warning"
          sx={{ fontWeight: 700 }}
        />
      ) : (
        <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>—</Typography>
      ),
    },
    {
      field: 'override_reason',
      headerName: 'Override Reason',
      minWidth: 200,
      flex: 1.5,
      renderCell: (params) => params.value || <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>—</Typography>,
    },
    {
      field: 'confirmed_forecast_qty',
      headerName: 'Confirmed Forecast',
      minWidth: 160,
      flex: 1.2,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toLocaleString()}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#2563eb', 0.12),
            color: '#2563eb',
          }}
        />
      ),
    },
    {
      field: 'forecast_owner',
      headerName: 'Owner',
      minWidth: 120,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'confirmation_date',
      headerName: 'Confirmed Date',
      minWidth: 130,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 140,
      flex: 1.1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Overridden' ? 'warning' : 'success'}
          icon={<CheckCircle />}
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
            <Typography color="primary" variant="body1" fontWeight={600}>Tile 0: Forecast Simulation</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Science sx={{ fontSize: 32, color: '#8b5cf6' }} />
              <Typography variant="h4" fontWeight={700}>Tile 0: Forecast Simulation & Acceptance</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Compare AI models (ARIMA, ETS, ML), override forecasts, and confirm baseline for Tile 1
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Run Forecasts"><IconButton color="primary"><PlayArrow /></IconButton></Tooltip>
            <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#8b5cf6', 0.1)} 0%, ${alpha('#8b5cf6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <QueryStats sx={{ color: '#8b5cf6' }} />
                  <Typography variant="body2" color="text.secondary">Total Forecasts</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#8b5cf6">{metrics.totalForecasts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">Overridden</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.overriddenCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Auto-Accepted</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.autoAcceptedCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2563eb', 0.1)} 0%, ${alpha('#2563eb', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Science sx={{ color: '#2563eb' }} />
                  <Typography variant="body2" color="text.secondary">Total Forecast Qty</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2563eb">{metrics.totalForecastQty.toLocaleString()}</Typography>
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

export default Tile0ForecastSimulation;
