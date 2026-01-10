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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Analytics as AnalyticsIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  Warning as WarningIcon,
  FilterList as FilterListIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import stoxTheme from './stoxTheme';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';
import { LAM_MATERIALS, LAM_MATERIAL_PLANT_DATA, LAM_PLANTS, getMaterialById, getPlantName } from '../../data/arizonaBeveragesMasterData';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

// SKU Icons mapping (semiconductor equipment)
const skuIcons = ['⚙️', '🔧', '💻', '🔬', '⚡', '🛠️', '📡', '🔩'];

// Derive pattern from XYZ classification and other factors
const getPatternFromData = (plantData) => {
  // X = Stable demand, Y = Variable demand, Z = Erratic demand
  const xyzPatterns = {
    'X': 'Stable',
    'Y': 'Seasonal',
    'Z': 'Erratic',
  };

  // Refine based on turns and DOS
  if (plantData.turns < 1) return 'Intermittent';
  if (plantData.dos > 300) return 'Intermittent';
  if (plantData.turns > 8) return 'Trending Up';
  if (plantData.turns < 2 && plantData.dos > 200) return 'Trending Down';

  return xyzPatterns[plantData.xyz] || 'Erratic';
};

// Calculate CV (Coefficient of Variation) from XYZ classification
const getCVFromXYZ = (xyz) => {
  // X = low variability (CV < 0.3), Y = medium (0.3-0.7), Z = high (> 0.7)
  if (xyz === 'X') return 0.15 + Math.random() * 0.1;  // 0.15-0.25
  if (xyz === 'Y') return 0.35 + Math.random() * 0.25; // 0.35-0.6
  return 0.75 + Math.random() * 0.35;                   // 0.75-1.1
};

// Generate demand intelligence data using Lam Research data
const generateDemandData = () => {
  return LAM_MATERIAL_PLANT_DATA.map((plantData, idx) => {
    const material = getMaterialById(plantData.materialId);
    const plantName = getPlantName(plantData.plant);

    // Derive pattern from actual XYZ classification
    const pattern = getPatternFromData(plantData);

    // Calculate CV based on XYZ classification
    const cv = getCVFromXYZ(plantData.xyz);

    // ADI (Average Demand Interval) - higher for intermittent items
    const adi = pattern === 'Intermittent' ? 3 + Math.random() * 5 : 1 + Math.random() * 1.5;

    // Trend based on pattern
    const trend = pattern === 'Trending Up' ? 'up' : pattern === 'Trending Down' ? 'down' : null;

    // Seasonality - Y class has seasonal patterns
    const seasonality = plantData.xyz === 'Y' ? 0.3 + Math.random() * 0.3 : Math.random() * 0.15;

    // Anomalies from stockouts in source data
    const anomalies = Math.min(plantData.stockouts || 0, 8);

    // Risk score based on actual MAPE, stockouts, and XYZ
    const mapeRisk = (plantData.mape || 20) * 0.8;
    const stockoutRisk = (plantData.stockouts || 0) * 8;
    const xyzRisk = plantData.xyz === 'Z' ? 20 : plantData.xyz === 'Y' ? 10 : 0;
    const riskScore = Math.min(100, Math.round(mapeRisk + stockoutRisk + xyzRisk) / 2);

    // Forecast accuracy from actual MAPE (100 - MAPE)
    const fcstAcc = Math.max(50, Math.round(100 - (plantData.mape || 20)));

    // Daily demand based on turns and stock
    const avgDaily = Math.round((plantData.totalStock / (plantData.dos || 90)) * 30); // Monthly equivalent

    return {
      id: `${plantData.materialId}-${plantData.plant}`,
      materialId: plantData.materialId,
      material: material?.name || plantData.materialId,
      plant: plantName,
      plantId: plantData.plant,
      pattern,
      cv: parseFloat(cv.toFixed(2)),
      adi: parseFloat(adi.toFixed(1)),
      trend,
      seasonality: parseFloat(seasonality.toFixed(2)),
      anomalies,
      abc: plantData.abc,
      xyz: plantData.xyz,
      riskScore,
      fcstAcc,
      icon: skuIcons[idx % skuIcons.length],
      // Detail data from actual source
      avgDaily,
      peakDemand: Math.round(avgDaily * (1 + cv)),
      minDemand: Math.round(avgDaily * Math.max(0.1, 1 - cv)),
      demandStdDev: Math.round(avgDaily * cv),
      volatilityScore: Math.round(cv * 100),
      supplyRisk: Math.round(20 + (plantData.leadTime || 90) / 5),
      demandRisk: Math.round(riskScore * 0.6),
      // Additional source data
      turns: plantData.turns,
      dos: plantData.dos,
      fillRate: plantData.fillRate,
      mape: plantData.mape,
      forecastBias: plantData.forecastBias,
    };
  });
};

// Generate detail data for drilldown
const generateDetailData = (skuId, mainData) => {
  const sku = mainData.find(s => s.id === skuId);
  if (!sku) return null;

  return {
    ...sku,
    // Seasonality profile (monthly indices)
    seasonalityProfile: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: sku.pattern === 'Seasonal'
        ? [0.7, 0.8, 0.9, 1.0, 1.1, 1.3, 1.4, 1.3, 1.1, 1.0, 0.8, 0.7]
        : Array(12).fill(0).map(() => 0.9 + Math.random() * 0.2),
    },
    // Historical anomalies
    anomalyHistory: Array(sku.anomalies).fill(0).map((_, i) => ({
      date: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      type: ['Spike', 'Drop', 'Outlier'][Math.floor(Math.random() * 3)],
      magnitude: Math.round(50 + Math.random() * 150),
    })),
    // Reclassification recommendation
    reclassRecommendation: sku.riskScore > 60 ? {
      currentAbc: sku.abc,
      currentXyz: sku.xyz,
      recommendedAbc: sku.abc === 'C' ? 'B' : sku.abc,
      recommendedXyz: sku.xyz === 'Z' ? 'Y' : sku.xyz,
      reason: sku.riskScore > 80 ? 'High volatility requires closer monitoring' : 'Demand pattern shift detected',
    } : null,
  };
};

const DemandIntelligence = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [filters, setFilters] = useState({
    pattern: 'all',
    abc: 'all',
    xyz: 'all',
    plant: 'all',
  });

  // Get tile data config for data source indicator
  const tileConfig = getTileDataConfig('demand-intelligence');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const demandData = generateDemandData();
      setData(demandData);

      // Calculate summary metrics
      const highRisk = demandData.filter(d => d.riskScore >= 70).length;
      const trendingUp = demandData.filter(d => d.trend === 'up').length;
      const declining = demandData.filter(d => d.trend === 'down').length;
      const intermittent = demandData.filter(d => d.pattern === 'Intermittent').length;
      const withAnomalies = demandData.filter(d => d.anomalies > 0).length;
      const needsReclass = demandData.filter(d => d.riskScore > 60).length;

      setMetrics({
        highRisk,
        trendingUp,
        declining,
        intermittent,
        anomalies: withAnomalies,
        reclassNeeded: needsReclass,
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

  // Filter data based on selections
  const filteredData = data.filter(row => {
    if (filters.pattern !== 'all' && row.pattern !== filters.pattern) return false;
    if (filters.abc !== 'all' && row.abc !== filters.abc) return false;
    if (filters.xyz !== 'all' && row.xyz !== filters.xyz) return false;
    if (filters.plant !== 'all' && row.plant !== filters.plant) return false;
    return true;
  });

  // Get unique values for filters
  const uniquePlants = [...new Set(data.map(d => d.plant))];
  const uniquePatterns = [...new Set(data.map(d => d.pattern))];

  // DataGrid columns (styled to match Tile 4)
  const columns = [
    { field: 'id', headerName: 'Material ID', minWidth: 130, flex: 1 },
    { field: 'material', headerName: 'Material', minWidth: 180, flex: 1.4 },
    { field: 'plant', headerName: 'Plant', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
    {
      field: 'pattern',
      headerName: 'Pattern',
      minWidth: 130,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Stable' ? 'success' : params.value === 'Erratic' ? 'error' : params.value === 'Intermittent' ? 'secondary' : 'warning'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'cv',
      headerName: 'CV',
      minWidth: 100,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value.toFixed(2)}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value < 0.3 ? alpha('#10b981', 0.12) : params.value < 0.7 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value < 0.3 ? '#059669' : params.value < 0.7 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'adi',
      headerName: 'ADI',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toFixed(1),
    },
    {
      field: 'trend',
      headerName: 'Trend',
      minWidth: 100,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 'up' ? 'Up' : params.value === 'down' ? 'Down' : '-'}
          size="small"
          color={params.value === 'up' ? 'success' : params.value === 'down' ? 'error' : 'default'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'seasonality',
      headerName: 'Seasonality',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `${(params.value * 100).toFixed(0)}%`,
    },
    {
      field: 'anomalies',
      headerName: 'Anomalies',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 0 ? 'success' : params.value < 3 ? 'warning' : 'error'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      field: 'abc',
      headerName: 'ABC',
      minWidth: 80,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'A' ? 'success' : params.value === 'B' ? 'warning' : 'default'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      field: 'xyz',
      headerName: 'XYZ',
      minWidth: 80,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'X' ? 'success' : params.value === 'Y' ? 'warning' : 'error'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      field: 'riskScore',
      headerName: 'Risk Score',
      minWidth: 120,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value < 40 ? alpha('#10b981', 0.12) : params.value < 70 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value < 40 ? '#059669' : params.value < 70 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'fcstAcc',
      headerName: 'Fcst Acc (%)',
      minWidth: 120,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= 85 ? alpha('#10b981', 0.12) : params.value >= 70 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 85 ? '#059669' : params.value >= 70 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
  ];

  // Chart options for seasonality
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { color: '#64748b', font: { size: 10 } },
        min: 0,
        max: 2,
      },
    },
  };

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedSku) return null;

    const riskColor = selectedSku.riskScore < 40 ? '#10b981' : selectedSku.riskScore < 70 ? '#f59e0b' : '#ef4444';
    const cvColor = selectedSku.cv < 0.3 ? '#10b981' : selectedSku.cv < 0.7 ? '#f59e0b' : '#ef4444';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header with Back Button */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small">
            Back to List
          </Button>
          <Stack direction="row" spacing={1}>
            <Chip label={selectedSku.id} size="small" sx={{ bgcolor: alpha('#64748b', 0.1) }} />
            <Chip label={selectedSku.pattern} size="small" color="info" />
            <Chip label={`${selectedSku.abc}/${selectedSku.xyz}`} size="small" sx={{ bgcolor: alpha('#06b6d4', 0.12), color: '#0891b2', fontWeight: 600 }} />
          </Stack>
        </Stack>

        {/* Material Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedSku.material}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>{selectedSku.plant}</Typography>

        {/* Key Metrics Row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Risk Score', value: selectedSku.riskScore, color: riskColor, icon: <WarningIcon /> },
            { label: 'CV', value: selectedSku.cv.toFixed(2), color: cvColor, icon: <AnalyticsIcon /> },
            { label: 'Anomalies', value: selectedSku.anomalies, color: selectedSku.anomalies === 0 ? '#10b981' : '#f59e0b', icon: <WarningIcon /> },
            { label: 'Fcst Acc', value: `${selectedSku.fcstAcc}%`, color: selectedSku.fcstAcc >= 85 ? '#10b981' : '#f59e0b', icon: <InsightsIcon /> },
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
          {/* Seasonality + Classification */}
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Seasonality Profile
                </Typography>
                <Box sx={{ height: 180, mb: 2 }}>
                  <Bar
                    data={{
                      labels: selectedSku.seasonalityProfile.labels,
                      datasets: [{
                        data: selectedSku.seasonalityProfile.data,
                        backgroundColor: alpha('#06b6d4', 0.6),
                        borderColor: '#06b6d4',
                        borderWidth: 1,
                      }],
                    }}
                    options={chartOptions}
                  />
                </Box>
                <Box sx={{ borderTop: '1px solid', borderColor: alpha('#64748b', 0.15), pt: 2, flex: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                    Classification
                  </Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {[
                      { label: 'ABC', value: selectedSku.abc, color: '#10b981' },
                      { label: 'XYZ', value: selectedSku.xyz, color: '#f59e0b' },
                      { label: 'Combined', value: `${selectedSku.abc}${selectedSku.xyz}`, color: '#06b6d4' },
                    ].map((item, idx) => (
                      <Grid item xs={4} key={idx}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(item.color, 0.08), borderRadius: 1 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: item.color }}>{item.value}</Typography>
                          <Typography sx={{ fontSize: '0.55rem', color: '#64748b' }}>{item.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Grid container spacing={1}>
                    {[
                      { label: 'Avg Daily', value: `${selectedSku.avgDaily} CS` },
                      { label: 'Peak', value: `${selectedSku.peakDemand} CS` },
                      { label: 'ADI', value: selectedSku.adi.toFixed(1) },
                    ].map((item, idx) => (
                      <Grid item xs={4} key={idx}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.value}</Typography>
                          <Typography sx={{ fontSize: '0.55rem', color: '#64748b' }}>{item.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Anomalies + Reclassification */}
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Anomaly History ({selectedSku.anomalies})
                </Typography>
                {selectedSku.anomalyHistory.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 2, bgcolor: alpha('#10b981', 0.05), borderRadius: 1, mb: 2 }}>
                    <Typography sx={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>No anomalies detected</Typography>
                  </Box>
                ) : (
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {selectedSku.anomalyHistory.map((anomaly, idx) => (
                      <Box key={idx} sx={{ p: 1, borderRadius: 1, bgcolor: alpha('#f59e0b', 0.05), border: '1px solid', borderColor: alpha('#f59e0b', 0.2) }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{anomaly.type}</Typography>
                          <Chip label={`${anomaly.magnitude}%`} size="small" sx={{ bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', fontWeight: 600, height: 18, fontSize: '0.65rem' }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{anomaly.date}</Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
                <Box sx={{ borderTop: '1px solid', borderColor: alpha('#64748b', 0.15), pt: 2, flex: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0078d4', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                    Reclassification
                  </Typography>
                  {selectedSku.reclassRecommendation ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1.5 }}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha('#64748b', 0.05), borderRadius: 1 }}>
                          <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#64748b' }}>
                            {selectedSku.reclassRecommendation.currentAbc}/{selectedSku.reclassRecommendation.currentXyz}
                          </Typography>
                          <Typography sx={{ fontSize: '0.55rem', color: '#64748b' }}>Current</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '1.2rem', color: '#0078d4' }}>→</Typography>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha('#0078d4', 0.1), borderRadius: 1 }}>
                          <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#0078d4' }}>
                            {selectedSku.reclassRecommendation.recommendedAbc}/{selectedSku.reclassRecommendation.recommendedXyz}
                          </Typography>
                          <Typography sx={{ fontSize: '0.55rem', color: '#64748b' }}>Recommended</Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', mb: 1.5 }}>
                        {selectedSku.reclassRecommendation.reason}
                      </Typography>
                      <Button fullWidth variant="outlined" size="small" sx={{ borderColor: '#0078d4', color: '#0078d4' }}>
                        Apply Reclassification
                      </Button>
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2, bgcolor: alpha('#10b981', 0.05), borderRadius: 1 }}>
                      <Typography sx={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>Classification is Optimal</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>No changes needed</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Risk Breakdown */}
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: '2px solid', borderColor: alpha(riskColor, 0.3) }}>
              <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Risk Breakdown
                </Typography>
                {/* Risk Gauge */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={100} size={100} thickness={5} sx={{ color: alpha('#64748b', 0.1) }} />
                    <CircularProgress variant="determinate" value={selectedSku.riskScore} size={100} thickness={5} sx={{ color: riskColor, position: 'absolute', left: 0 }} />
                    <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: riskColor }}>{selectedSku.riskScore}</Typography>
                      <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Risk</Typography>
                    </Box>
                  </Box>
                </Box>
                {/* Risk Components */}
                <Stack spacing={1} sx={{ mt: 2, flex: 1 }}>
                  {[
                    { label: 'Volatility Score', value: selectedSku.volatilityScore },
                    { label: 'Supply Risk', value: selectedSku.supplyRisk },
                    { label: 'Demand Risk', value: selectedSku.demandRisk },
                  ].map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: alpha('#64748b', 0.03), borderRadius: 1 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{item.label}</Typography>
                      <Chip
                        label={item.value}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: item.value < 40 ? alpha('#10b981', 0.12) : item.value < 70 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
                          color: item.value < 40 ? '#059669' : item.value < 70 ? '#d97706' : '#dc2626',
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
                {/* Additional Metrics */}
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
                  <Grid container spacing={1}>
                    {[
                      { label: 'CV', value: selectedSku.cv.toFixed(2), color: cvColor },
                      { label: 'Seasonality', value: `${(selectedSku.seasonality * 100).toFixed(0)}%`, color: '#06b6d4' },
                    ].map((item, idx) => (
                      <Grid item xs={6} key={idx}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(item.color, 0.08), borderRadius: 1 }}>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: item.color }}>{item.value}</Typography>
                          <Typography sx={{ fontSize: '0.55rem', color: '#64748b' }}>{item.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
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
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Layer 2: Diagnostics</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              {selectedSku ? `${selectedSku.material} Detail` : 'Demand Intelligence'}
            </Typography>
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
              <AnalyticsIcon sx={{ fontSize: 40, color: '#06b6d4' }} />
              <Typography variant="h5" fontWeight={600}>Demand Intelligence</Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Analyze demand patterns, detect anomalies, and manage ABC/XYZ classification
            </Typography>
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
                <Card variant="outlined" sx={{ borderLeft: `3px solid #ef4444` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>High Risk</Typography>
                    <Typography variant="h4" fontWeight={700} color="#dc2626">{metrics.highRisk}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #10b981` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Trending Up</Typography>
                    <Typography variant="h4" fontWeight={700} color="#059669">{metrics.trendingUp}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #f59e0b` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Declining</Typography>
                    <Typography variant="h4" fontWeight={700} color="#d97706">{metrics.declining}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #0078d4` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Intermittent</Typography>
                    <Typography variant="h4" fontWeight={700} color="#005a9e">{metrics.intermittent}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #06b6d4` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Anomalies</Typography>
                    <Typography variant="h4" fontWeight={700} color="#0891b2">{metrics.anomalies}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #2b88d8` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Reclass Needed</Typography>
                    <Typography variant="h4" fontWeight={700} color="#0284c7">{metrics.reclassNeeded}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FilterListIcon sx={{ color: '#64748b' }} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Pattern</InputLabel>
              <Select
                value={filters.pattern}
                label="Pattern"
                onChange={(e) => handleFilterChange('pattern', e.target.value)}
              >
                <MenuItem value="all">All Patterns</MenuItem>
                {uniquePatterns.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>ABC</InputLabel>
              <Select
                value={filters.abc}
                label="ABC"
                onChange={(e) => handleFilterChange('abc', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>XYZ</InputLabel>
              <Select
                value={filters.xyz}
                label="XYZ"
                onChange={(e) => handleFilterChange('xyz', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="X">X</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
                <MenuItem value="Z">Z</MenuItem>
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

export default DemandIntelligence;
