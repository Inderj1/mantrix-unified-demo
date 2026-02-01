import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Breadcrumbs,
  Link,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  ShowChart as ShowChartIcon,
  Psychology as PsychologyIcon,
  CalendarMonth as CalendarMonthIcon,
  BugReport as BugReportIcon,
  SmartToy as SmartToyIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';

// Import centralized brand colors and stoxTheme
import { MODULE_COLOR, getColors } from '../../../config/brandColors';
import stoxTheme from '../stoxTheme';

// AI Quick Insights for list view
const aiQuickInsights = {
  confidence: 87,
  summary: '127 erratic SKUs • 34 anomalies cleansed • 72% avg forecast accuracy',
  modelFit: 87,
};

// Mock data
const demandData = [
  {
    id: 'MAT-1001',
    description: 'Hydraulic Pump Assembly',
    plant: 'P1000',
    pattern: 'erratic',
    cv: 0.82,
    adi: 0.8,
    trend: 12,
    trendDir: 'up',
    seasonality: 'Moderate',
    anomalies: 2,
    abcClass: 'A',
    xyzClass: 'Z',
    forecastAccuracy: 68,
    meanDemand: 48,
    stdDev: 39.4,
    annualVolume: 17520,
    annualValue: 3500000,
    recommendedModel: 'Croston TSB',
    seasonalityStrength: 0.42,
    peakMonth: 'November',
    peakFactor: 1.35,
  },
  {
    id: 'MAT-2045',
    description: 'Bearing Assembly 2x4',
    plant: 'P2000',
    pattern: 'lumpy',
    cv: 0.65,
    adi: 1.8,
    trend: 0,
    trendDir: 'flat',
    seasonality: 'Low',
    anomalies: 0,
    abcClass: 'B',
    xyzClass: 'Y',
    forecastAccuracy: 74,
    meanDemand: 71,
    stdDev: 46.2,
    annualVolume: 25900,
    annualValue: 1554000,
    recommendedModel: 'Holt-Winters',
    seasonalityStrength: 0.18,
    peakMonth: 'March',
    peakFactor: 1.12,
  },
  {
    id: 'MAT-3089',
    description: 'Gasket Kit Standard',
    plant: 'P1000',
    pattern: 'smooth',
    cv: 0.18,
    adi: 0.2,
    trend: -5,
    trendDir: 'down',
    seasonality: 'None',
    anomalies: 0,
    abcClass: 'C',
    xyzClass: 'X',
    forecastAccuracy: 92,
    meanDemand: 27,
    stdDev: 4.9,
    annualVolume: 9855,
    annualValue: 197100,
    recommendedModel: 'Simple MA',
    seasonalityStrength: 0.05,
    peakMonth: 'N/A',
    peakFactor: 1.0,
  },
  {
    id: 'MAT-4012',
    description: 'Control Valve Assembly',
    plant: 'P3000',
    pattern: 'seasonal',
    cv: 0.52,
    adi: 0.4,
    trend: 8,
    trendDir: 'up',
    seasonality: 'Strong (Q4)',
    anomalies: 1,
    abcClass: 'A',
    xyzClass: 'X',
    forecastAccuracy: 86,
    meanDemand: 46,
    stdDev: 23.9,
    annualVolume: 16790,
    annualValue: 2518500,
    recommendedModel: 'Seasonal Decomp',
    seasonalityStrength: 0.68,
    peakMonth: 'October',
    peakFactor: 1.42,
  },
  {
    id: 'MAT-5067',
    description: 'Electronic Sensor Module',
    plant: 'P2000',
    pattern: 'intermittent',
    cv: 1.24,
    adi: 2.4,
    trend: 25,
    trendDir: 'up',
    seasonality: 'Irregular',
    anomalies: 5,
    abcClass: 'A',
    xyzClass: 'Z',
    forecastAccuracy: 52,
    meanDemand: 12,
    stdDev: 14.9,
    annualVolume: 4380,
    annualValue: 876000,
    recommendedModel: 'Croston Modified',
    seasonalityStrength: 0.25,
    peakMonth: 'Variable',
    peakFactor: 1.5,
  },
];

// Summary KPIs
const summaryKPIs = [
  { label: 'Erratic Demand', value: 127, sub: 'SKUs with CV > 1.0', color: '#ef4444', borderColor: '#ef4444' },
  { label: 'Forecast Accuracy', value: '72%', sub: 'MAPE weighted avg', color: '#f59e0b', borderColor: '#f59e0b' },
  { label: 'Stable Demand', value: '1,432', sub: 'Predictable (CV < 0.5)', color: '#10b981', borderColor: '#10b981' },
  { label: 'Trending Up', value: 89, sub: '> 10% growth/mo', color: '#8b5cf6', borderColor: '#8b5cf6' },
  { label: 'Anomalies Detected', value: 34, sub: 'Last 30 days', color: '#06b6d4', borderColor: '#06b6d4' },
  { label: 'Signal Approved', value: '1,891', sub: 'Ready for planning', color: '#10b981', borderColor: '#10b981' },
];

// Pattern color mapping
const getPatternColor = (pattern) => {
  switch (pattern) {
    case 'smooth': return '#10b981';
    case 'trending': return '#06b6d4';
    case 'seasonal': return '#8b5cf6';
    case 'erratic': return '#ef4444';
    case 'lumpy': return '#f59e0b';
    case 'intermittent': return '#ec4899';
    default: return '#64748b';
  }
};

const getPatternChipSx = (pattern) => {
  const color = getPatternColor(pattern);
  return {
    bgcolor: alpha(color, 0.12),
    color: color,
    border: `1px solid ${alpha(color, 0.3)}`,
    fontWeight: 600,
    fontSize: '0.65rem',
    height: 22,
    textTransform: 'capitalize',
  };
};

const getClassChipSx = (cls, type) => {
  let color;
  if (type === 'abc') {
    color = cls === 'A' ? '#ef4444' : cls === 'B' ? '#f59e0b' : '#10b981';
  } else {
    color = cls === 'X' ? '#10b981' : cls === 'Y' ? '#f59e0b' : '#ef4444';
  }
  return {
    bgcolor: alpha(color, 0.15),
    color: color,
    fontWeight: 700,
    fontSize: '0.65rem',
    height: 20,
    minWidth: 24,
  };
};

// DataGrid column definitions
const getColumns = (colors) => [
  {
    field: 'id',
    headerName: 'Material',
    minWidth: 130,
    flex: 1,
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b5cf6' }}>{params.value}</Typography>
    ),
  },
  {
    field: 'plant',
    headerName: 'Plant',
    minWidth: 80,
    flex: 0.6,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'pattern',
    headerName: 'Pattern',
    minWidth: 100,
    flex: 0.7,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Chip label={params.value} size="small" sx={getPatternChipSx(params.value)} />
    ),
  },
  {
    field: 'cv',
    headerName: 'CV',
    minWidth: 80,
    flex: 0.5,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: params.value > 0.7 ? '#ef4444' : params.value > 0.4 ? '#f59e0b' : '#10b981' }} />
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: params.value > 0.7 ? '#ef4444' : params.value > 0.4 ? '#f59e0b' : '#10b981' }}>
          {params.value.toFixed(2)}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'adi',
    headerName: 'ADI',
    minWidth: 70,
    flex: 0.5,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: params.value > 1.32 ? '#ef4444' : '#10b981' }}>{params.value.toFixed(1)}</Typography>
    ),
  },
  {
    field: 'trend',
    headerName: 'Trend',
    minWidth: 80,
    flex: 0.6,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: params.row.trendDir === 'up' ? '#10b981' : params.row.trendDir === 'down' ? '#ef4444' : '#64748b' }}>
        {params.row.trendDir === 'up' ? '↑' : params.row.trendDir === 'down' ? '↓' : '→'} {params.value > 0 ? '+' : ''}{params.value}%
      </Typography>
    ),
  },
  {
    field: 'seasonality',
    headerName: 'Seasonality',
    minWidth: 100,
    flex: 0.7,
  },
  {
    field: 'anomalies',
    headerName: 'Anomalies',
    minWidth: 90,
    flex: 0.6,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: params.value > 2 ? '#ef4444' : params.value > 0 ? '#f59e0b' : '#10b981' }} />
        <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>{params.value}</Typography>
      </Stack>
    ),
  },
  {
    field: 'abcXyz',
    headerName: 'ABC/XYZ',
    minWidth: 100,
    flex: 0.7,
    align: 'center',
    headerAlign: 'center',
    valueGetter: (value, row) => row ? `${row.abcClass}/${row.xyzClass}` : '',
    renderCell: (params) => (
      <Stack direction="row" spacing={0.5}>
        <Chip label={params.row?.abcClass || ''} size="small" sx={getClassChipSx(params.row?.abcClass, 'abc')} />
        <Chip label={params.row?.xyzClass || ''} size="small" sx={getClassChipSx(params.row?.xyzClass, 'xyz')} />
      </Stack>
    ),
  },
  {
    field: 'forecastAccuracy',
    headerName: 'Fcst Acc',
    minWidth: 90,
    flex: 0.6,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: params.value >= 85 ? '#10b981' : params.value >= 70 ? '#f59e0b' : '#ef4444' }} />
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: params.value >= 85 ? '#10b981' : params.value >= 70 ? '#f59e0b' : '#ef4444' }}>
          {params.value}%
        </Typography>
      </Stack>
    ),
  },
];

// Seasonality chart data
const seasonalityData = [
  { month: 'Jan', index: 0.78, category: 'low' },
  { month: 'Feb', index: 0.72, category: 'low' },
  { month: 'Mar', index: 0.88, category: 'normal' },
  { month: 'Apr', index: 0.95, category: 'normal' },
  { month: 'May', index: 1.02, category: 'normal' },
  { month: 'Jun', index: 1.08, category: 'normal' },
  { month: 'Jul', index: 1.12, category: 'high' },
  { month: 'Aug', index: 1.18, category: 'high' },
  { month: 'Sep', index: 1.15, category: 'high' },
  { month: 'Oct', index: 1.28, category: 'peak' },
  { month: 'Nov', index: 1.35, category: 'peak' },
  { month: 'Dec', index: 1.12, category: 'high' },
];

const DemandVariabilityIntelligence = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [selectedItem, setSelectedItem] = useState(null);
  const [plantFilter, setPlantFilter] = useState('all');
  const [patternFilter, setPatternFilter] = useState('all');

  // AI theme color for Tile 2 (Purple-Pink)
  const aiThemeColor = '#8b5cf6';

  // Get columns with colors
  const columns = getColumns(colors);

  const filteredData = demandData.filter(item => {
    if (plantFilter !== 'all' && item.plant !== plantFilter) return false;
    if (patternFilter !== 'all' && item.pattern !== patternFilter) return false;
    return true;
  });

  const handleRowClick = (params) => {
    setSelectedItem(params.row);
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === 'plant') setPlantFilter(value);
    if (filterName === 'pattern') setPatternFilter(value);
  };

  // Generate chart data for demand history
  const generateDemandChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, idx) => ({
      month,
      actual: 1120 + Math.random() * 800 + idx * 50,
      cleansed: 1100 + Math.random() * 600 + idx * 55,
      forecast: 1100 + idx * 75,
    }));
  };

  const renderDetailView = () => {
    const item = selectedItem;
    const chartData = generateDemandChartData();

    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedItem(null)} sx={{ mb: 2, color: colors.textSecondary }}>
          Back to Demand Matrix
        </Button>

        {/* Detail Header */}
        <Card variant="outlined" sx={{ mb: 3, bgcolor: colors.cardBg, borderColor: colors.border }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: alpha('#06b6d4', 0.12), color: '#06b6d4' }}>
                <ShowChartIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#8b5cf6' }}>{item.id}</Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>@ {item.plant}</Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {item.description} | 90-day analysis window
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip label={item.pattern} sx={getPatternChipSx(item.pattern)} />
                <Chip label={item.abcClass} sx={getClassChipSx(item.abcClass, 'abc')} />
                <Chip label={item.xyzClass} sx={getClassChipSx(item.xyzClass, 'xyz')} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* KPIs */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Coefficient of Variation', value: item.cv.toFixed(2), sub: 'Threshold: 0.50', color: item.cv > 0.7 ? '#ef4444' : item.cv > 0.4 ? '#f59e0b' : '#10b981' },
            { label: 'Average Demand Interval', value: item.adi.toFixed(1), sub: 'Intermittent: > 1.32', color: item.adi > 1.32 ? '#ef4444' : '#10b981' },
            { label: 'Trend Direction', value: `${item.trend > 0 ? '↑' : item.trend < 0 ? '↓' : '→'} ${item.trend > 0 ? '+' : ''}${item.trend}%`, sub: 'Monthly growth rate', color: item.trend > 0 ? '#10b981' : item.trend < 0 ? '#ef4444' : '#64748b' },
            { label: 'Forecast Accuracy', value: `${item.forecastAccuracy}%`, sub: 'Target: > 85%', color: item.forecastAccuracy >= 85 ? '#10b981' : item.forecastAccuracy >= 70 ? '#f59e0b' : '#ef4444' },
          ].map((kpi, idx) => (
            <Grid item xs={6} md={3} key={idx}>
              <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, textAlign: 'center', p: 2 }}>
                <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>{kpi.label}</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: kpi.color }}>{kpi.value}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mt: 0.5 }}>{kpi.sub}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, p: 2, height: '100%' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShowChartIcon sx={{ fontSize: 18 }} /> Demand History & Forecast (12 months)
              </Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.textSecondary, 0.2)} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: colors.textSecondary }} />
                    <YAxis tick={{ fontSize: 10, fill: colors.textSecondary }} />
                    <Tooltip contentStyle={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: '0.75rem' }} />
                    <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                    <Line type="monotone" dataKey="actual" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} name="Actual" />
                    <Area type="monotone" dataKey="cleansed" fill={alpha('#06b6d4', 0.2)} stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 3" name="Cleansed" />
                    <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="8 4" dot={false} name="Forecast" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, p: 2, height: '100%' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShowChartIcon sx={{ fontSize: 18 }} /> Demand Statistics
                <Chip label="MATDOC" size="small" sx={{ ml: 'auto', height: 18, fontSize: '0.6rem', bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6' }} />
              </Typography>
              {[
                { label: 'Mean Daily Demand', value: `${item.meanDemand} EA` },
                { label: 'Standard Deviation', value: `${item.stdDev} EA` },
                { label: 'MAD (Mean Absolute Dev)', value: `${(item.stdDev * 0.8).toFixed(1)} EA` },
                { label: 'Median', value: `${Math.round(item.meanDemand * 0.88)} EA` },
                { label: 'Min / Max', value: `${Math.round(item.meanDemand * 0.17)} / ${Math.round(item.meanDemand * 2.96)} EA` },
                { label: 'Annual Volume', value: `${item.annualVolume.toLocaleString()} EA` },
                { label: 'Annual Value', value: `$${(item.annualValue / 1000000).toFixed(1)}M`, color: '#06b6d4' },
              ].map((row, idx) => (
                <Stack key={idx} direction="row" justifyContent="space-between" sx={{ py: 0.8, borderBottom: idx < 6 ? `1px solid ${colors.border}` : 'none' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.label}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: row.color || colors.text }}>{row.value}</Typography>
                </Stack>
              ))}
            </Card>
          </Grid>
        </Grid>

        {/* Pattern, Seasonality, Anomaly */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, p: 2 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyIcon sx={{ fontSize: 18, color: '#8b5cf6' }} /> Pattern Classification
              </Typography>
              {[
                { label: 'Demand Pattern', value: item.pattern, color: getPatternColor(item.pattern), transform: 'capitalize' },
                { label: 'ABC Classification', value: `${item.abcClass} - ${item.abcClass === 'A' ? 'High Value (Top 20%)' : item.abcClass === 'B' ? 'Medium Value' : 'Low Value'}` },
                { label: 'XYZ Classification', value: `${item.xyzClass} - ${item.xyzClass === 'X' ? 'Predictable' : item.xyzClass === 'Y' ? 'Variable' : 'Unpredictable'}`, color: item.xyzClass === 'Z' ? '#ef4444' : item.xyzClass === 'Y' ? '#f59e0b' : '#10b981' },
                { label: 'SAP ABC Indicator', value: `${item.abcClass} (MARC-MAABC)` },
                { label: 'Recommended Model', value: item.recommendedModel },
                { label: 'Planning Strategy', value: item.xyzClass === 'Z' ? 'Safety Stock Heavy' : 'Standard' },
              ].map((row, idx) => (
                <Stack key={idx} direction="row" justifyContent="space-between" sx={{ py: 0.8, borderBottom: idx < 5 ? `1px solid ${colors.border}` : 'none' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.label}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: row.color || colors.text, textTransform: row.transform }}>{row.value}</Typography>
                </Stack>
              ))}
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, p: 2 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon sx={{ fontSize: 18, color: '#8b5cf6' }} /> Seasonality Profile
              </Typography>
              {[
                { label: 'Seasonality Strength', value: `${item.seasonality} (${item.seasonalityStrength.toFixed(2)})`, color: item.seasonalityStrength > 0.5 ? '#f59e0b' : '#64748b' },
                { label: 'Peak Month', value: `${item.peakMonth} (${item.peakFactor}x)` },
                { label: 'Low Month', value: 'February (0.72x)' },
              ].map((row, idx) => (
                <Stack key={idx} direction="row" justifyContent="space-between" sx={{ py: 0.8, borderBottom: `1px solid ${colors.border}` }}>
                  <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.label}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: row.color || colors.text }}>{row.value}</Typography>
                </Stack>
              ))}
              {/* Seasonality Grid */}
              <Grid container spacing={0.5} sx={{ mt: 1.5 }}>
                {seasonalityData.map((s, idx) => {
                  const bgColor = s.category === 'peak' ? alpha('#ef4444', 0.2) : s.category === 'high' ? alpha('#f59e0b', 0.2) : s.category === 'low' ? alpha('#06b6d4', 0.2) : alpha(colors.textSecondary, 0.1);
                  const textColor = s.category === 'peak' ? '#ef4444' : s.category === 'high' ? '#f59e0b' : s.category === 'low' ? '#06b6d4' : colors.textSecondary;
                  return (
                    <Grid item xs={1} key={idx}>
                      <Box sx={{ p: 0.5, textAlign: 'center', borderRadius: 1, bgcolor: bgColor }}>
                        <Typography sx={{ fontSize: '0.5rem', color: colors.textSecondary, textTransform: 'uppercase' }}>{s.month}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: textColor }}>{s.index}</Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, p: 2 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugReportIcon sx={{ fontSize: 18, color: '#f59e0b' }} /> Anomaly Detection
              </Typography>
              {[
                { label: 'Anomalies (90 days)', value: `${item.anomalies} detected`, color: item.anomalies > 2 ? '#ef4444' : item.anomalies > 0 ? '#f59e0b' : '#10b981' },
                { label: 'Last Anomaly', value: item.anomalies > 0 ? 'Nov 12 (+142 EA spike)' : 'None' },
                { label: 'Root Cause', value: item.anomalies > 0 ? 'Large order - Customer XYZ' : 'N/A' },
                { label: 'Handling', value: item.anomalies > 0 ? 'Excluded from baseline' : 'N/A', color: '#06b6d4' },
                { label: 'Signal Status', value: 'Cleansed', color: '#10b981', hasCheck: true },
                { label: 'Outlier Threshold', value: `±2.5σ (±${(item.stdDev * 2.5).toFixed(0)} EA)` },
              ].map((row, idx) => (
                <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.8, borderBottom: idx < 5 ? `1px solid ${colors.border}` : 'none' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.label}</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {row.hasCheck && <CheckCircleIcon sx={{ fontSize: 14, color: row.color }} />}
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: row.color || colors.text }}>{row.value}</Typography>
                  </Stack>
                </Stack>
              ))}
            </Card>
          </Grid>
        </Grid>

        {/* AI Recommendation Panel */}
        <Card
          variant="outlined"
          sx={{
            bgcolor: alpha('#8b5cf6', 0.04),
            border: `1px solid ${alpha('#8b5cf6', 0.25)}`,
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated top border */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            bgcolor: '#00357a',
          }} />
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
              <Avatar sx={{ width: 44, height: 44, bgcolor: '#00357a' }}>
                <SmartToyIcon sx={{ fontSize: 24 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#00357a' }}>STOX.AI Demand Intelligence</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Pattern recognition based on 12 months of cleansed demand data</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>87%</Typography>
                <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary, textTransform: 'uppercase' }}>Model Fit</Typography>
              </Box>
            </Stack>

            {/* Business Context Analysis */}
            <Box sx={{ bgcolor: alpha('#00357a', 0.04), borderRadius: 2, p: 2, mb: 2, border: `1px solid ${alpha('#00357a', 0.12)}` }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#00357a', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                Business Context Analysis
              </Typography>

              {/* Seasonality Driver */}
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <CalendarMonthIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text }}>Seasonality Driver</Typography>
                </Stack>
                <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary, lineHeight: 1.6, pl: 3 }}>
                  {item.seasonalityStrength > 0.5
                    ? `${item.peakMonth} peak (${item.peakFactor}x) driven by year-end equipment overhauls and preventive maintenance cycles. Customers accelerate purchases to utilize remaining budgets before fiscal year-end.`
                    : item.seasonalityStrength > 0.2
                    ? `Moderate seasonality with ${item.peakMonth} peaks typically driven by production scheduling patterns and planned maintenance windows.`
                    : 'No significant seasonal pattern detected. Demand appears consistent throughout the year with minimal cyclical variation.'
                  }
                </Typography>
              </Box>

              {/* Trend Driver */}
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: item.trend > 0 ? '#10b981' : item.trend < 0 ? '#ef4444' : '#64748b' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text }}>Trend Analysis</Typography>
                </Stack>
                <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary, lineHeight: 1.6, pl: 3 }}>
                  {item.trend > 10
                    ? `Strong growth of +${item.trend}% monthly indicates expanding customer base or new market adoption. This SKU may be entering growth phase of product lifecycle. Consider increasing safety stock and vendor capacity.`
                    : item.trend > 0
                    ? `Moderate growth of +${item.trend}% suggests steady market demand. Current inventory parameters are likely adequate with minor adjustments.`
                    : item.trend < -5
                    ? `Declining demand of ${item.trend}% monthly may indicate product phase-out, market shift, or competitive pressure. Review for potential excess inventory risk.`
                    : 'Stable demand with no significant trend. This SKU shows mature, predictable consumption patterns.'
                  }
                </Typography>
              </Box>

              {/* Model Explanation */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <PsychologyIcon sx={{ fontSize: 16, color: '#06b6d4' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text }}>Why {item.recommendedModel}?</Typography>
                </Stack>
                <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary, lineHeight: 1.6, pl: 3 }}>
                  {item.recommendedModel === 'Croston TSB' || item.recommendedModel === 'Croston Modified'
                    ? `Croston-based methods are ideal for intermittent/erratic demand (ADI=${item.adi.toFixed(1)}, CV=${item.cv.toFixed(2)}). They separately forecast demand timing and quantity, avoiding the zero-inflation problem that plagues standard methods.`
                    : item.recommendedModel === 'Holt-Winters'
                    ? `Holt-Winters excels at capturing both trend and seasonality simultaneously. With CV=${item.cv.toFixed(2)} and ${item.seasonality.toLowerCase()} seasonality, this method can adapt to shifting demand levels.`
                    : item.recommendedModel === 'Seasonal Decomp'
                    ? `Seasonal Decomposition is optimal for this SKU because it has strong seasonality (${item.seasonalityStrength.toFixed(2)} strength) and relatively stable baseline demand. It cleanly separates seasonal effects from trend.`
                    : `Simple Moving Average is appropriate for this SKU due to its stable, predictable demand (CV=${item.cv.toFixed(2)}). More complex models would overfit without improving accuracy.`
                  }
                </Typography>
              </Box>
            </Box>

            {/* Recommendations */}
            <Box sx={{ bgcolor: alpha(colors.textSecondary, 0.05), borderRadius: 2, p: 2, mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>Demand Signal Optimization</Typography>
                <Chip label="HIGH PRIORITY" size="small" sx={{ height: 18, fontSize: '0.55rem', fontWeight: 700, bgcolor: alpha('#ef4444', 0.15), color: '#ef4444' }} />
              </Stack>
              <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary, lineHeight: 1.7, mb: 1.5 }}>
                <strong>Pattern Diagnosis:</strong> This A/Z SKU exhibits erratic demand (CV={item.cv}) with {item.seasonality.toLowerCase()} seasonality. The current forecast model (simple moving average) is poorly suited — contributing to the {item.forecastAccuracy}% accuracy.
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary, lineHeight: 1.7 }}>
                <strong>Recommended Actions:</strong><br />
                • <strong>Model Switch:</strong> Change from SMA to {item.recommendedModel} for better handling of {item.pattern} patterns<br />
                • <strong>Anomaly Treatment:</strong> Automatically exclude orders {'>'} 2.5σ from baseline<br />
                • <strong>Seasonal Adjustment:</strong> Apply seasonal indices (Q4 peak factor {item.peakFactor}x)<br />
                • <strong>Update Frequency:</strong> Increase forecast refresh from monthly to weekly
              </Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 2, pt: 2, borderTop: `1px solid ${colors.border}` }}>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>Forecast Accuracy:</Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>{item.forecastAccuracy}% → 82%</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>SS Reduction Potential:</Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>-$18,400</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>Stockout Risk:</Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>-35%</Typography>
                </Box>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button variant="contained" size="small" startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />} sx={{ fontSize: '0.75rem', bgcolor: '#00357a', '&:hover': { bgcolor: '#002352' } }}>
                Approve Cleansed Signal
              </Button>
              <Button variant="outlined" size="small" sx={{ fontSize: '0.75rem', borderColor: colors.border, color: colors.textSecondary }}>
                Re-run Pattern Analysis
              </Button>
              <Button variant="outlined" size="small" sx={{ fontSize: '0.75rem', borderColor: colors.border, color: colors.textSecondary }}>
                Export to Planning
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: colors.background, overflow: 'auto' }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={() => onBack('core')} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline', color: colors.primary }, cursor: 'pointer' }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={() => onBack('stox')} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline', color: colors.primary }, cursor: 'pointer' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={() => onBack('distribution')} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline', color: colors.primary }, cursor: 'pointer' }}>Distribution</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Demand Variability Intelligence</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={() => onBack('distribution')} variant="outlined" size="small" sx={{ borderColor: colors.border }}>Back to Distribution</Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: alpha('#06b6d4', 0.12), color: '#06b6d4' }}>
            <TrendingUpIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>Demand Variability Intelligence</Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>Tile 2 - Demand Signal Analysis</Typography>
          </Box>
          <Chip label="TILE 2" size="small" sx={{ ml: 'auto', bgcolor: alpha('#06b6d4', 0.12), color: '#06b6d4', fontWeight: 700 }} />
        </Stack>
      </Box>

      {selectedItem ? renderDetailView() : (
        <>
          {/* Summary KPIs */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {summaryKPIs.map((kpi, idx) => (
              <Grid item xs={6} md={2} key={idx}>
                <Card variant="outlined" sx={{ borderLeft: `4px solid ${kpi.borderColor}`, bgcolor: colors.cardBg, borderColor: colors.border }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>{kpi.label}</Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: kpi.color }}>{kpi.value}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>{kpi.sub}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* AI Quick Insight Card */}
          <Paper
            sx={{
              p: 1.5,
              mb: 2,
              bgcolor: alpha(aiThemeColor, 0.04),
              border: `1px solid ${alpha(aiThemeColor, 0.15)}`,
              borderLeft: `3px solid ${aiThemeColor}`,
              borderRadius: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(aiThemeColor, 0.15) }}>
                <SmartToyIcon sx={{ fontSize: 18, color: aiThemeColor }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>
                  <strong>AI Insights:</strong> {aiQuickInsights.summary}
                </Typography>
              </Box>
              <Chip
                label={`${aiQuickInsights.confidence}% Model Fit`}
                size="small"
                sx={{ bgcolor: alpha(aiThemeColor, 0.12), color: aiThemeColor, fontWeight: 600, fontSize: '0.7rem' }}
              />
            </Stack>
          </Paper>

          {/* Filter Bar */}
          <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
            <FilterListIcon sx={{ color: colors.textSecondary }} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: colors.textSecondary }}>Plant</InputLabel>
              <Select
                value={plantFilter}
                label="Plant"
                onChange={(e) => handleFilterChange('plant', e.target.value)}
                sx={{
                  color: colors.text,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                  '& .MuiSvgIcon-root': { color: colors.text },
                }}
                MenuProps={{ PaperProps: { sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}`, '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } } } } }}
              >
                <MenuItem value="all">All Plants</MenuItem>
                <MenuItem value="P1000">P1000 - Detroit</MenuItem>
                <MenuItem value="P2000">P2000 - Phoenix</MenuItem>
                <MenuItem value="P3000">P3000 - Seattle</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: colors.textSecondary }}>Pattern</InputLabel>
              <Select
                value={patternFilter}
                label="Pattern"
                onChange={(e) => handleFilterChange('pattern', e.target.value)}
                sx={{
                  color: colors.text,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                  '& .MuiSvgIcon-root': { color: colors.text },
                }}
                MenuProps={{ PaperProps: { sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}`, '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } } } } }}
              >
                <MenuItem value="all">All Patterns</MenuItem>
                <MenuItem value="smooth">Smooth</MenuItem>
                <MenuItem value="trending">Trending</MenuItem>
                <MenuItem value="seasonal">Seasonal</MenuItem>
                <MenuItem value="erratic">Erratic</MenuItem>
                <MenuItem value="lumpy">Lumpy</MenuItem>
                <MenuItem value="intermittent">Intermittent</MenuItem>
              </Select>
            </FormControl>
            <Typography sx={{ ml: 'auto', fontSize: '0.8rem', color: colors.textSecondary }}>
              Showing {filteredData.length} of {demandData.length} items
            </Typography>
          </Paper>

          {/* DataGrid */}
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 400, width: '100%', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              density="compact"
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              onRowClick={handleRowClick}
              sx={{
                ...stoxTheme.getDataGridSx({ clickable: true }),
                bgcolor: colors.paper,
                color: colors.text,
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  color: colors.text,
                  borderBottom: `1px solid ${colors.border}`,
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  color: colors.text,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                },
                '& .MuiDataGrid-cell': {
                  color: colors.text,
                  borderBottom: `1px solid ${colors.border}`,
                },
                '& .MuiDataGrid-row': {
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : alpha('#8b5cf6', 0.05),
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderTop: `1px solid ${colors.border}`,
                  color: colors.text,
                },
                '& .MuiTablePagination-root': {
                  color: colors.text,
                },
                '& .MuiDataGrid-toolbarContainer': {
                  color: colors.text,
                  padding: '8px 16px',
                  '& .MuiButton-root': {
                    color: colors.text,
                  },
                },
              }}
            />
          </Paper>
        </>
      )}

      {/* Footer */}
      <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${colors.border}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>
            STOX.AI Demand Variability Intelligence • Tile 2 of 5 • Layer: Demand Signal • Last Refresh: {new Date().toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>© 2025 Cloud Mantra LLC | Mantrix.AI</Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default DemandVariabilityIntelligence;
