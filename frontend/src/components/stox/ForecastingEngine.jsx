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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ShowChart as ShowChartIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  FilterList as FilterListIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import stoxTheme from './stoxTheme';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';
import { LAM_MATERIALS, LAM_MATERIAL_PLANT_DATA, LAM_PLANTS, getMaterialById, getPlantName } from '../../data/arizonaBeveragesMasterData';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

// SKU Icons mapping (beverage equipment)
const skuIcons = ['⚙️', '🔧', '💻', '🔬', '⚡', '🛠️', '📡', '🔩'];

// Forecasting models
const forecastModels = ['SES', 'Holt-Winters', 'Croston', 'Ensemble', 'Bootstrap', 'SARIMA'];

// Derive pattern from XYZ classification and other factors
const getPatternFromData = (plantData, material) => {
  // X = Stable demand, Y = Variable demand, Z = Erratic demand
  const xyzPatterns = {
    'X': 'Stable',      // Predictable, consistent demand
    'Y': 'Seasonal',    // Variable but with patterns
    'Z': 'Erratic',     // Unpredictable demand
  };

  // Refine based on turns and DOS
  if (plantData.turns < 1) return 'Intermittent';  // Very slow moving
  if (plantData.dos > 300) return 'Intermittent';  // Very high coverage
  if (plantData.turns > 8) return 'Trending';      // Fast moving

  return xyzPatterns[plantData.xyz] || 'Erratic';
};

// Generate forecasting data using ALL Arizona Beverages materials
const generateForecastData = () => {
  // Build materials from ALL Arizona data with patterns derived from actual XYZ classification
  const materials = LAM_MATERIAL_PLANT_DATA.map((plantData, idx) => {
    const baseMaterial = getMaterialById(plantData.materialId);
    return {
      id: `${plantData.materialId}-${plantData.plant}`,  // Unique ID combining material + plant
      materialId: plantData.materialId,
      name: baseMaterial?.name || plantData.materialId,
      plant: getPlantName(plantData.plant),
      plantId: plantData.plant,
      pattern: getPatternFromData(plantData, baseMaterial),  // Pattern derived from actual data
      xyz: plantData.xyz,
      type: baseMaterial?.type,
      turns: plantData.turns,
      dos: plantData.dos,
    };
  });

  // Get actual MAPE and bias from source data
  const getSourceData = (materialId, plantId) => {
    return LAM_MATERIAL_PLANT_DATA.find(d => d.materialId === materialId && d.plant === plantId);
  };

  return materials.map((mat, idx) => {
    // Select best model based on pattern
    const modelByPattern = {
      'Stable': 'SES',
      'Seasonal': 'Holt-Winters',
      'Trending': 'Holt-Winters',
      'Intermittent': 'Croston',
      'Erratic': 'Ensemble',
    };
    const model = modelByPattern[mat.pattern] || 'Ensemble';

    // Get source data for actual MAPE and bias
    const sourceData = getSourceData(mat.materialId, mat.plantId);

    // Generate forecasts based on actual demand patterns
    // Use turns as a proxy for demand velocity
    const baseMonthlyDemand = Math.round((mat.turns || 3) * 50);
    const fcst1m = baseMonthlyDemand + Math.round(baseMonthlyDemand * 0.1 * (Math.random() - 0.5));
    const fcst3m = fcst1m * 3;
    const fcst6m = fcst1m * 6;

    // Confidence intervals based on pattern volatility
    const spread = mat.pattern === 'Erratic' ? 0.35 : mat.pattern === 'Intermittent' ? 0.28 : mat.pattern === 'Seasonal' ? 0.18 : 0.12;
    const p10 = Math.round(fcst1m * (1 - spread));
    const p90 = Math.round(fcst1m * (1 + spread));

    // Use ACTUAL MAPE and bias from source data
    const mape = sourceData?.mape || 20;
    const bias = sourceData?.forecastBias || 0;

    return {
      id: mat.id,
      material: mat.name,
      plant: mat.plant,
      pattern: mat.pattern,
      model,
      fcst1m,
      fcst3m,
      fcst6m,
      p10,
      p90,
      mape: parseFloat(mape.toFixed(1)),
      bias: parseFloat(bias.toFixed(1)),
      icon: skuIcons[idx % skuIcons.length],  // Cycle through icons
      // Accuracy rating based on actual MAPE
      accuracyRating: mape < 10 ? 'Excellent' : mape < 20 ? 'Good' : mape < 30 ? 'Fair' : 'Poor',
      // Bias direction based on actual forecast bias
      biasDirection: bias > 5 ? 'over' : bias < -5 ? 'under' : 'balanced',
    };
  });
};

// Generate detail data for drilldown
const generateDetailData = (skuId, mainData) => {
  const sku = mainData.find(s => s.id === skuId);
  if (!sku) return null;

  // Generate historical forecast vs actual data
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const baseValue = 100 + Math.random() * 200;

  const actuals = months.map((_, i) => Math.round(baseValue * (0.8 + Math.random() * 0.4)));
  const forecasts = actuals.map((a, i) => Math.round(a * (1 + (sku.bias / 100))));

  // Model comparison data
  const modelComparison = forecastModels.map(model => ({
    model,
    mape: model === sku.model ? sku.mape : sku.mape + (Math.random() * 15 - 5),
    selected: model === sku.model,
  }));

  return {
    ...sku,
    // Additional accuracy metrics
    mae: Math.round(sku.mape * 10), // Simplified
    rmse: Math.round(sku.mape * 15),
    // Model selection reasoning
    modelReason: {
      'SES': 'Selected for stable demand with no significant trend or seasonality',
      'Holt-Winters': 'Selected for data with clear trend and/or seasonal patterns',
      'Croston': 'Selected for intermittent demand with sporadic zero periods',
      'Ensemble': 'Selected for erratic patterns - combines multiple models for robustness',
      'Bootstrap': 'Selected for probabilistic forecasting with uncertainty quantification',
      'SARIMA': 'Selected for complex seasonal patterns requiring autoregressive modeling',
    }[sku.model] || 'Auto-selected based on pattern analysis',
    // Forecast breakdown by month
    monthlyForecast: [
      { month: 'Dec', value: sku.fcst1m, p10: sku.p10, p90: sku.p90 },
      { month: 'Jan', value: Math.round(sku.fcst1m * 1.02), p10: Math.round(sku.p10 * 1.02), p90: Math.round(sku.p90 * 1.02) },
      { month: 'Feb', value: Math.round(sku.fcst1m * 0.98), p10: Math.round(sku.p10 * 0.98), p90: Math.round(sku.p90 * 0.98) },
    ],
    // Historical data for chart
    historicalData: {
      labels: [...months, 'Dec', 'Jan', 'Feb'],
      actuals: [...actuals, null, null, null],
      forecasts: [...forecasts, sku.fcst1m, Math.round(sku.fcst1m * 1.02), Math.round(sku.fcst1m * 0.98)],
      p10: [...Array(6).fill(null), sku.p10, Math.round(sku.p10 * 1.02), Math.round(sku.p10 * 0.98)],
      p90: [...Array(6).fill(null), sku.p90, Math.round(sku.p90 * 1.02), Math.round(sku.p90 * 0.98)],
    },
    // Model comparison
    modelComparison,
  };
};

const ForecastingEngine = ({ onBack, onTileClick }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [filters, setFilters] = useState({
    model: 'all',
    accuracy: 'all',
    bias: 'all',
    plant: 'all',
  });

  // Get tile data config for data source indicator
  const tileConfig = getTileDataConfig('forecasting-engine');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const forecastData = generateForecastData();
      setData(forecastData);

      // Calculate summary metrics
      const excellent = forecastData.filter(d => d.accuracyRating === 'Excellent').length;
      const good = forecastData.filter(d => d.accuracyRating === 'Good').length;
      const fair = forecastData.filter(d => d.accuracyRating === 'Fair').length;
      const poor = forecastData.filter(d => d.accuracyRating === 'Poor').length;
      const overForecasting = forecastData.filter(d => d.biasDirection === 'over').length;
      const underForecasting = forecastData.filter(d => d.biasDirection === 'under').length;

      setMetrics({
        excellent,
        good,
        fair,
        poor,
        overForecasting,
        underForecasting,
      });

      setLoading(false);
    }, 800);
  };

  const handleRowClick = (params) => {
    const detailData = generateDetailData(params.row.id, data);
    setSelectedSku(detailData);
  };

  const handleBackToList = () => {
    setSelectedSku(null);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  // Filter data
  const filteredData = data.filter(row => {
    if (filters.model !== 'all' && row.model !== filters.model) return false;
    if (filters.accuracy !== 'all' && row.accuracyRating !== filters.accuracy) return false;
    if (filters.bias !== 'all' && row.biasDirection !== filters.bias) return false;
    if (filters.plant !== 'all' && row.plant !== filters.plant) return false;
    return true;
  });

  // Get unique values for filters
  const uniquePlants = [...new Set(data.map(d => d.plant))];

  // DataGrid columns (styled to match Tile 4)
  const columns = [
    { field: 'id', headerName: 'Material ID', minWidth: 130, flex: 1 },
    { field: 'material', headerName: 'Material', minWidth: 180, flex: 1.4 },
    { field: 'plant', headerName: 'Plant', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
    {
      field: 'pattern',
      headerName: 'Pattern',
      minWidth: 120,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Stable' ? 'success' : params.value === 'Erratic' ? 'error' : params.value === 'Intermittent' ? 'secondary' : 'info'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'model',
      headerName: 'Model',
      minWidth: 130,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: alpha('#0078d4', 0.12),
            color: '#005a9e',
          }}
        />
      ),
    },
    {
      field: 'fcst1m',
      headerName: 'Fcst 1M',
      minWidth: 110,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value.toLocaleString()}
          size="small"
          sx={{ fontWeight: 700, bgcolor: alpha('#2b88d8', 0.12), color: '#106ebe' }}
        />
      ),
    },
    {
      field: 'fcst3m',
      headerName: 'Fcst 3M',
      minWidth: 110,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'fcst6m',
      headerName: 'Fcst 6M',
      minWidth: 110,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'p10',
      headerName: 'P10',
      minWidth: 100,
      flex: 0.7,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'p90',
      headerName: 'P90',
      minWidth: 100,
      flex: 0.7,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'mape',
      headerName: 'MAPE (%)',
      minWidth: 110,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value < 10 ? alpha('#10b981', 0.12) : params.value < 20 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value < 10 ? '#059669' : params.value < 20 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'bias',
      headerName: 'Bias (%)',
      minWidth: 120,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value > 0 ? '+' : ''}${params.value}%`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: Math.abs(params.value) <= 5 ? alpha('#10b981', 0.12) : params.value > 5 ? alpha('#ef4444', 0.12) : alpha('#2b88d8', 0.12),
            color: Math.abs(params.value) <= 5 ? '#059669' : params.value > 5 ? '#dc2626' : '#0284c7',
          }}
        />
      ),
    },
  ];

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { boxWidth: 12, font: { size: 10 } },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    plugins: { ...chartOptions.plugins, legend: { display: false } },
    indexAxis: 'y',
  };

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedSku) return null;

    const mapeColor = selectedSku.mape < 10 ? '#10b981' : selectedSku.mape < 20 ? '#f59e0b' : '#ef4444';
    const biasColor = Math.abs(selectedSku.bias) <= 5 ? '#10b981' : selectedSku.bias > 5 ? '#ef4444' : '#2b88d8';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header with Back Button */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToList}
            variant="outlined"
            size="small"
          >
            Back to List
          </Button>
          <Stack direction="row" spacing={1}>
            <Chip label={selectedSku.id} size="small" sx={{ bgcolor: alpha('#64748b', 0.1) }} />
            <Chip label={selectedSku.pattern} size="small" color="info" />
            <Chip label={selectedSku.model} size="small" sx={{ bgcolor: alpha('#0078d4', 0.12), color: '#005a9e', fontWeight: 600 }} />
          </Stack>
        </Stack>

        {/* Material Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedSku.material}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>{selectedSku.plant}</Typography>

        {/* Key Metrics Row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Fcst 1M', value: selectedSku.fcst1m?.toLocaleString() || selectedSku.monthlyForecast?.[0]?.value?.toLocaleString(), color: '#2b88d8', icon: <ShowChartIcon /> },
            { label: 'MAPE', value: `${selectedSku.mape}%`, color: mapeColor, icon: <SpeedIcon /> },
            { label: 'Bias', value: `${selectedSku.bias > 0 ? '+' : ''}${selectedSku.bias}%`, color: biasColor, icon: <AnalyticsIcon /> },
            { label: 'Accuracy', value: selectedSku.accuracyRating, color: mapeColor, icon: <SpeedIcon /> },
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

        {/* Main Content - Single Row with 3 Equal Cards */}
        <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          {/* Forecast vs Actual Chart */}
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Forecast vs Actual
                </Typography>
                <Box sx={{ flex: 1, minHeight: 250 }}>
                  <Line
                    data={{
                      labels: selectedSku.historicalData.labels,
                      datasets: [
                        { label: 'Actual', data: selectedSku.historicalData.actuals, borderColor: '#2b88d8', backgroundColor: 'transparent', borderWidth: 2, pointBackgroundColor: '#2b88d8', pointRadius: 3, tension: 0.3 },
                        { label: 'Forecast', data: selectedSku.historicalData.forecasts, borderColor: '#0078d4', backgroundColor: 'transparent', borderWidth: 2, borderDash: [5, 5], pointBackgroundColor: '#0078d4', pointRadius: 3, tension: 0.3 },
                        { label: 'P90', data: selectedSku.historicalData.p90, borderColor: 'transparent', backgroundColor: alpha('#0078d4', 0.1), fill: '+1', pointRadius: 0, tension: 0.3 },
                        { label: 'P10', data: selectedSku.historicalData.p10, borderColor: 'transparent', backgroundColor: 'transparent', pointRadius: 0, tension: 0.3 },
                      ],
                    }}
                    options={chartOptions}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Model Comparison + Monthly Forecast */}
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Model Comparison (MAPE)
                </Typography>
                <Box sx={{ height: 160, mb: 2 }}>
                  <Bar
                    data={{
                      labels: selectedSku.modelComparison.map(m => m.model),
                      datasets: [{
                        data: selectedSku.modelComparison.map(m => m.mape.toFixed(1)),
                        backgroundColor: selectedSku.modelComparison.map(m => m.selected ? '#0078d4' : alpha('#64748b', 0.3)),
                        borderRadius: 4,
                      }],
                    }}
                    options={barChartOptions}
                  />
                </Box>
                <Box sx={{ borderTop: '1px solid', borderColor: alpha('#64748b', 0.15), pt: 2, flex: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                    Monthly Forecast
                  </Typography>
                  <Stack spacing={1}>
                    {selectedSku.monthlyForecast.map((m, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: alpha('#0078d4', 0.03), borderRadius: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{m.month}</Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{m.p10.toLocaleString()}</Typography>
                          <Chip label={m.value.toLocaleString()} size="small" sx={{ bgcolor: alpha('#0078d4', 0.12), color: '#005a9e', fontWeight: 700, height: 22 }} />
                          <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{m.p90.toLocaleString()}</Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Accuracy Metrics + Model Selection */}
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: '2px solid', borderColor: alpha('#0078d4', 0.2) }}>
              <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Accuracy Metrics
                </Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {[
                    { label: 'MAPE', value: `${selectedSku.mape}%`, color: mapeColor },
                    { label: 'MAE', value: selectedSku.mae, color: '#64748b' },
                    { label: 'RMSE', value: selectedSku.rmse, color: '#64748b' },
                    { label: 'Bias', value: `${selectedSku.bias > 0 ? '+' : ''}${selectedSku.bias}%`, color: biasColor },
                  ].map((item, idx) => (
                    <Grid item xs={6} key={idx}>
                      <Box sx={{ p: 1.5, bgcolor: alpha(item.color, 0.08), borderRadius: 1, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: item.color }}>{item.value}</Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>{item.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ borderTop: '1px solid', borderColor: alpha('#64748b', 0.15), pt: 2, flex: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0078d4', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                    Selected Model
                  </Typography>
                  <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                    <Chip label={selectedSku.model} sx={{ bgcolor: '#0078d4', color: 'white', fontWeight: 700, fontSize: '0.9rem', height: 32, px: 1 }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', lineHeight: 1.5, mb: 1.5 }}>
                    {selectedSku.modelReason}
                  </Typography>
                  <Stack spacing={0.5}>
                    {[
                      { label: 'Demand Type', value: selectedSku.pattern },
                      { label: 'Confidence', value: 'High', color: '#10b981' },
                      { label: 'Auto-Selected', value: 'Yes', color: '#0078d4' },
                    ].map((row, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{row.label}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: row.color || 'inherit' }}>{row.value}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Button fullWidth variant="outlined" size="small" sx={{ mt: 1.5, borderColor: '#0078d4', color: '#0078d4' }}>
                    Override Model
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Main render
  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={() => selectedSku ? setSelectedSku(null) : onBack()} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>Layer 3: Prediction</Link>
            {selectedSku ? (
              <>
                <Link component="button" variant="body1" onClick={() => setSelectedSku(null)} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>Forecasting Engine</Link>
                <Typography color="primary" variant="body1" fontWeight={600}>{selectedSku.material} Detail</Typography>
              </>
            ) : (
              <Typography color="primary" variant="body1" fontWeight={600}>Forecasting Engine</Typography>
            )}
          </Breadcrumbs>
          {!selectedSku && (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary"><Refresh /></IconButton></Tooltip>
              <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
            </Stack>
          )}
        </Stack>

        {!selectedSku && (
          <>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <PsychologyIcon sx={{ fontSize: 40, color: '#0078d4' }} />
              <Typography variant="h5" fontWeight={600}>Forecasting Engine</Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              AI-powered demand forecasting with model selection, accuracy tracking, and confidence intervals
            </Typography>
            <Chip
              label="MAPE and Bias from XYZ classification analysis | Forecasts derived from inventory turns"
              size="small"
              sx={{ mt: 1, bgcolor: alpha('#10b981', 0.1), color: '#059669', fontSize: '0.65rem' }}
            />
          </>
        )}
      </Box>

      {selectedSku ? (
        renderDetailView()
      ) : (
        <>
          {/* Summary Cards */}
          {metrics && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #10b981` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Excellent</Typography>
                    <Typography variant="h4" fontWeight={700} color="#059669">{metrics.excellent}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>MAPE &lt; 10%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #f59e0b` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Good</Typography>
                    <Typography variant="h4" fontWeight={700} color="#d97706">{metrics.good}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>MAPE 10-20%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #f97316` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Fair</Typography>
                    <Typography variant="h4" fontWeight={700} color="#ea580c">{metrics.fair}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>MAPE 20-30%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #ef4444` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Poor</Typography>
                    <Typography variant="h4" fontWeight={700} color="#dc2626">{metrics.poor}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>MAPE &gt; 30%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #2b88d8` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Over-Fcst</Typography>
                    <Typography variant="h4" fontWeight={700} color="#0284c7">{metrics.overForecasting}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>Bias &gt; +5%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #0078d4` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Under-Fcst</Typography>
                    <Typography variant="h4" fontWeight={700} color="#005a9e">{metrics.underForecasting}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>Bias &lt; -5%</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FilterListIcon sx={{ color: '#64748b' }} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Model</InputLabel>
              <Select
                value={filters.model}
                label="Model"
                onChange={(e) => handleFilterChange('model', e.target.value)}
              >
                <MenuItem value="all">All Models</MenuItem>
                {forecastModels.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Accuracy</InputLabel>
              <Select
                value={filters.accuracy}
                label="Accuracy"
                onChange={(e) => handleFilterChange('accuracy', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Excellent">Excellent</MenuItem>
                <MenuItem value="Good">Good</MenuItem>
                <MenuItem value="Fair">Fair</MenuItem>
                <MenuItem value="Poor">Poor</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Bias</InputLabel>
              <Select
                value={filters.bias}
                label="Bias"
                onChange={(e) => handleFilterChange('bias', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="over">Over-forecasting</MenuItem>
                <MenuItem value="under">Under-forecasting</MenuItem>
                <MenuItem value="balanced">Balanced</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Plant</InputLabel>
              <Select
                value={filters.plant}
                label="Plant"
                onChange={(e) => handleFilterChange('plant', e.target.value)}
              >
                <MenuItem value="all">All Plants</MenuItem>
                {uniquePlants.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <Typography sx={{ ml: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
              Showing {filteredData.length} of {data.length} items
            </Typography>
          </Paper>

          {/* DataGrid */}
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%' }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              loading={loading}
              density="compact"
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              checkboxSelection
              disableRowSelectionOnClick
              onRowClick={handleRowClick}
              sx={stoxTheme.getDataGridSx()}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default ForecastingEngine;
