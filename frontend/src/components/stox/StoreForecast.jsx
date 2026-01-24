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
  CalendarToday,
} from '@mui/icons-material';
import TimeGranularitySelector from '../common/TimeGranularitySelector';
import stoxTheme from './stoxTheme';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';

const StoreForecast = ({ onBack, darkMode = false }) => {
  const getColors = (darkMode) => ({
    primary: darkMode ? '#4d9eff' : '#00357a',
    text: darkMode ? '#e6edf3' : '#1e293b',
    textSecondary: darkMode ? '#8b949e' : '#64748b',
    background: darkMode ? '#0d1117' : '#f8fbfd',
    paper: darkMode ? '#161b22' : '#ffffff',
    cardBg: darkMode ? '#21262d' : '#ffffff',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  });

  const colors = getColors(darkMode);
  const tileConfig = getTileDataConfig('store-forecast');
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
      // Multiple SKUs with store-level forecast data
      const stores = [
        { id: 'Store-Chicago-001', name: 'Chicago Magnificent Mile', baseUnits: { 'MR_HAIR_101': 20, 'MR_HAIR_201': 13, 'MR_CARE_301': 9 } },
        { id: 'Store-NYC-015', name: 'NYC Fifth Avenue', baseUnits: { 'MR_HAIR_101': 27, 'MR_HAIR_201': 17, 'MR_CARE_301': 12 } },
        { id: 'Store-Boston-022', name: 'Boston Newbury St', baseUnits: { 'MR_HAIR_101': 25, 'MR_HAIR_201': 16, 'MR_CARE_301': 11 } },
        { id: 'Store-Philly-018', name: 'Philadelphia Rittenhouse', baseUnits: { 'MR_HAIR_101': 22, 'MR_HAIR_201': 14, 'MR_CARE_301': 10 } },
        { id: 'Store-DC-Metro-012', name: 'DC Georgetown', baseUnits: { 'MR_HAIR_101': 23, 'MR_HAIR_201': 15, 'MR_CARE_301': 10 } },
        { id: 'Store-Baltimore-009', name: 'Baltimore Harbor', baseUnits: { 'MR_HAIR_101': 20, 'MR_HAIR_201': 13, 'MR_CARE_301': 9 } },
        { id: 'Store-Dallas-019', name: 'Dallas Galleria', baseUnits: { 'MR_HAIR_101': 18, 'MR_HAIR_201': 12, 'MR_CARE_301': 8 } },
        { id: 'Store-Miami-008', name: 'Miami Design District', baseUnits: { 'MR_HAIR_101': 22, 'MR_HAIR_201': 14, 'MR_CARE_301': 10 } },
        { id: 'Store-Minneapolis-031', name: 'Minneapolis Mall', baseUnits: { 'MR_HAIR_101': 19, 'MR_HAIR_201': 12, 'MR_CARE_301': 9 } },
        { id: 'Store-Detroit-025', name: 'Detroit Somerset', baseUnits: { 'MR_HAIR_101': 17, 'MR_HAIR_201': 11, 'MR_CARE_301': 8 } },
        { id: 'Store-STL-014', name: 'St Louis Plaza', baseUnits: { 'MR_HAIR_101': 16, 'MR_HAIR_201': 10, 'MR_CARE_301': 7 } },
        { id: 'Store-KC-027', name: 'Kansas City Plaza', baseUnits: { 'MR_HAIR_101': 15, 'MR_HAIR_201': 10, 'MR_CARE_301': 7 } },
      ];

      const products = [
        { sku: 'MR_HAIR_101', name: 'Premium Hair Color Kit', avgPrice: 25.00, unitCost: 10.00 },
        { sku: 'MR_HAIR_201', name: 'Root Touch-Up Spray', avgPrice: 22.00, unitCost: 9.00 },
        { sku: 'MR_CARE_301', name: 'Intensive Hair Mask', avgPrice: 28.00, unitCost: 11.00 },
      ];

      const methods = ['Prophet/ML', 'ARIMA'];
      const forecastData = [];
      let idCounter = 1;

      // Determine time periods based on granularity
      const periods = [];
      const startDate = new Date('2025-11-01');

      if (granularity === 'daily') {
        // Daily: 30 days (monthly forecast)
        for (let i = 0; i < 30; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          periods.push({
            label: date.toISOString().split('T')[0],
            weekNumber: null,
            dayOfWeek: date.getDay(), // 0=Sunday, 6=Saturday
            dayOfMonth: date.getDate(),
          });
        }
      } else if (granularity === 'weekly') {
        // Weekly: 52 weeks (yearly forecast)
        for (let i = 0; i < 52; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + (i * 7));
          const year = date.getFullYear();
          const weekNum = i + 1;
          periods.push({
            label: `${year}-W${String(weekNum).padStart(2, '0')}`,
            weekNumber: weekNum,
            dayOfWeek: null,
            dayOfMonth: null,
          });
        }
      }

      // Generate forecast data for each period × store × product
      periods.forEach((period, periodIndex) => {
        stores.forEach((store) => {
          products.forEach((product) => {
            const baseUnits = store.baseUnits[product.sku];
            const method = methods[idCounter % 2];

            // Add seasonality variation based on period
            let seasonalityFactor = 1.0;
            if (granularity === 'daily') {
              // Weekend boost for retail stores
              if (period.dayOfWeek === 0 || period.dayOfWeek === 6) {
                seasonalityFactor = 1.15 + Math.random() * 0.10;
              } else {
                seasonalityFactor = 0.95 + Math.random() * 0.10;
              }
            } else if (granularity === 'weekly') {
              // Holiday/seasonal patterns for weeks
              const weekNum = period.weekNumber;
              if (weekNum >= 47 || weekNum <= 2) {
                // Holiday season (Nov-Dec-Jan)
                seasonalityFactor = 1.25 + Math.random() * 0.15;
              } else if (weekNum >= 20 && weekNum <= 24) {
                // Summer boost
                seasonalityFactor = 1.10 + Math.random() * 0.10;
              } else {
                seasonalityFactor = 0.90 + Math.random() * 0.20;
              }
            }

            const adjustedUnits = Math.round(baseUnits * seasonalityFactor);
            const confidence = 0.85 + Math.random() * 0.10;
            const variance = Math.ceil(adjustedUnits * 0.15);

            // Check for promotions (random 10% chance)
            const hasPromotion = Math.random() < 0.10;
            const promotionBoost = hasPromotion ? 1.20 : 1.0;
            const finalUnits = Math.round(adjustedUnits * promotionBoost);

            // New Tile 1 columns: Forecast Error σ, Price, Cost, Value, Margin
            const forecastErrorSigma = Math.round(5 + Math.random() * 10); // σ = 5-15 units
            const avgUnitPrice = product.avgPrice;
            const unitCost = product.unitCost;
            const forecastValue = finalUnits * avgUnitPrice; // Revenue
            const forecastMargin = finalUnits * (avgUnitPrice - unitCost); // Gross Margin

            forecastData.push({
              id: `FC${String(idCounter++).padStart(6, '0')}`,
              date: period.label,
              week: period.weekNumber,
              store_id: store.id,
              store_name: store.name,
              channel: 'Retail Store',
              product_sku: product.sku,
              product_name: product.name,
              forecasted_units: finalUnits,
              confidence_level: confidence,
              upper_bound: finalUnits + variance,
              lower_bound: Math.max(0, finalUnits - variance),
              historical_avg: baseUnits,
              promotion_flag: hasPromotion ? 'Yes' : 'No',
              seasonality_factor: seasonalityFactor,
              forecast_error_sigma: forecastErrorSigma,
              avg_unit_price: avgUnitPrice,
              unit_cost: unitCost,
              forecast_value: forecastValue,
              forecast_margin: forecastMargin,
            });
          });
        });
      });

      setForecastData(forecastData);

      // Calculate metrics
      const avgConfidence = (forecastData.reduce((sum, row) => sum + row.confidence_level, 0) / forecastData.length * 100).toFixed(1);
      const totalForecasted = forecastData.reduce((sum, row) => sum + row.forecasted_units, 0);
      const uniqueStores = new Set(forecastData.map(d => d.store_id)).size;
      const uniqueProducts = new Set(forecastData.map(d => d.product_sku)).size;
      const periodCount = periods.length;

      setMetrics({
        totalForecasts: forecastData.length,
        avgConfidence: avgConfidence,
        totalUnits: totalForecasted,
        storeCount: uniqueStores,
        productCount: uniqueProducts,
        periodCount: periodCount,
        forecastHorizon: granularity === 'daily' ? '30 Days' : '52 Weeks',
      });

      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 0.8 },
    {
      field: 'date',
      headerName: granularity === 'weekly' ? 'Week' : 'Date',
      minWidth: 120,
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    },
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
    {
      field: 'forecast_error_sigma',
      headerName: 'Error σ',
      minWidth: 100,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'avg_unit_price',
      headerName: 'Avg Price ($)',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toFixed(2)}`,
    },
    {
      field: 'unit_cost',
      headerName: 'Unit Cost ($)',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toFixed(2)}`,
    },
    {
      field: 'forecast_value',
      headerName: 'Forecast Value ($)',
      minWidth: 150,
      flex: 1.2,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value?.toLocaleString()}`}
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
      field: 'forecast_margin',
      headerName: 'Forecast Margin ($)',
      minWidth: 160,
      flex: 1.3,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value?.toLocaleString()}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#1a5a9e', 0.12),
            color: '#1a5a9e',
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.background }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>Layer 3: Prediction</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>Store System</Link>
            <Typography sx={{ color: colors.primary }} variant="body1" fontWeight={600}>Tile 1: Demand Forecasting</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <TrendingUp sx={{ fontSize: 32, color: '#1a5a9e' }} />
              <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>Tile 1: Demand Forecasting (Baseline)</Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {granularity === 'daily'
                ? 'Daily tracking - 30-day forecast with weekend patterns and promotions'
                : granularity === 'weekly'
                ? 'Weekly tracking - 52-week yearly forecast with seasonal trends'
                : 'Monthly tracking - quarterly forecast with seasonal patterns'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <TimeGranularitySelector
              value={granularity}
              onChange={(value) => setGranularity(value)}
            />
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh"><IconButton onClick={fetchForecastData} color="primary"><Refresh /></IconButton></Tooltip>
              <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#1a5a9e', 0.1)} 0%, ${alpha('#1a5a9e', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <ShowChart sx={{ color: '#1a5a9e' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Total Forecasts</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#1a5a9e">{metrics.totalForecasts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Avg Confidence</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.avgConfidence}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#1a5a9e', 0.1)} 0%, ${alpha('#1a5a9e', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#1a5a9e' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Total Units</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#1a5a9e">{metrics.totalUnits.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#00357a', 0.1)} 0%, ${alpha('#00357a', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CalendarToday sx={{ color: '#00357a' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Forecast Horizon</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#00357a">{metrics.forecastHorizon}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
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
          sx={{
            ...stoxTheme.getDataGridSx(),
            ...(darkMode && {
              '& .MuiDataGrid-root': { color: colors.text, bgcolor: colors.paper },
              '& .MuiDataGrid-cell': { borderColor: colors.border, color: colors.text },
              '& .MuiDataGrid-columnHeaders': { bgcolor: colors.cardBg, borderColor: colors.border, color: colors.text },
              '& .MuiDataGrid-columnHeaderTitle': { color: colors.text },
              '& .MuiDataGrid-row': { bgcolor: colors.paper, '&:hover': { bgcolor: alpha(colors.primary, 0.08) } },
              '& .MuiDataGrid-footerContainer': { borderColor: colors.border, bgcolor: colors.cardBg },
              '& .MuiTablePagination-root': { color: colors.text },
              '& .MuiCheckbox-root': { color: colors.textSecondary },
              '& .MuiDataGrid-toolbarContainer': { color: colors.text },
            })
          }}
        />
      </Paper>
    </Box>
  );
};

export default StoreForecast;
