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
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  HealthAndSafety as HealthIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import stoxTheme from './stoxTheme';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, ChartTooltip, Legend, Filler);

const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

// Generate mock inventory health data
const generateHealthData = () => {
  const materials = [
    { id: 'MAT-001', name: 'Hydraulic Pump', plant: 'P1000' },
    { id: 'MAT-002', name: 'Bearing Assembly', plant: 'P1000' },
    { id: 'MAT-003', name: 'Control Module', plant: 'P2000' },
    { id: 'MAT-004', name: 'Valve Kit', plant: 'P2000' },
    { id: 'MAT-005', name: 'Gasket Set', plant: 'P3000' },
    { id: 'MAT-006', name: 'Sensor Array', plant: 'P1000' },
    { id: 'MAT-007', name: 'Motor Drive', plant: 'P2000' },
    { id: 'MAT-008', name: 'Filter Element', plant: 'P3000' },
    { id: 'MAT-009', name: 'Seal Kit', plant: 'P1000' },
    { id: 'MAT-010', name: 'Coupling Assembly', plant: 'P2000' },
    { id: 'MAT-011', name: 'Shaft Bearing', plant: 'P3000' },
    { id: 'MAT-012', name: 'Pressure Gauge', plant: 'P1000' },
  ];

  const abcOptions = ['A', 'B', 'C'];
  const xyzOptions = ['X', 'Y', 'Z'];
  const valuationTypes = ['MAP', 'STD', 'FIFO'];

  return materials.map((mat, idx) => {
    const healthScore = Math.floor(20 + Math.random() * 80);
    const isHealthy = healthScore >= 75;
    const isCritical = healthScore < 50;
    const abc = abcOptions[idx % 3];
    const xyz = xyzOptions[Math.floor(idx / 4) % 3];

    const excessValue = isCritical ? Math.floor(50000 + Math.random() * 150000) : isHealthy ? 0 : Math.floor(10000 + Math.random() * 50000);
    const daysCover = isCritical ? Math.floor(120 + Math.random() * 250) : isHealthy ? Math.floor(30 + Math.random() * 30) : Math.floor(60 + Math.random() * 60);
    const turns = isCritical ? (0.5 + Math.random() * 1.5).toFixed(1) : isHealthy ? (5 + Math.random() * 3).toFixed(1) : (2.5 + Math.random() * 2.5).toFixed(1);
    const fillRate = isCritical ? (85 + Math.random() * 8).toFixed(1) : isHealthy ? (96 + Math.random() * 3).toFixed(1) : (90 + Math.random() * 6).toFixed(1);
    const valuation = valuationTypes[idx % 3];
    const stockValue = Math.floor(50000 + Math.random() * 300000);

    return {
      id: mat.id,
      material: mat.name,
      plant: mat.plant,
      abc,
      xyz,
      abcXyz: `${abc}/${xyz}`,
      healthScore,
      status: isHealthy ? 'Healthy' : isCritical ? 'Critical' : 'Moderate',
      excessValue,
      daysCover: daysCover > 365 ? '365+' : daysCover,
      daysCoverNum: daysCover,
      turns: parseFloat(turns),
      fillRate: parseFloat(fillRate),
      valuation,
      stockValue,
      // Detail data
      unrestrictedStock: Math.floor(800 + Math.random() * 1500),
      qiStock: Math.floor(50 + Math.random() * 200),
      blockedStock: isCritical ? Math.floor(20 + Math.random() * 80) : 0,
      inTransit: Math.floor(100 + Math.random() * 300),
      safetyStock: Math.floor(200 + Math.random() * 400),
      reorderPoint: Math.floor(400 + Math.random() * 600),
      maxStock: Math.floor(1500 + Math.random() * 1000),
      avgDailyUsage: Math.floor(20 + Math.random() * 50),
      excessScore: isHealthy ? Math.floor(90 + Math.random() * 10) : isCritical ? Math.floor(20 + Math.random() * 30) : Math.floor(50 + Math.random() * 30),
      coverageScore: isHealthy ? Math.floor(85 + Math.random() * 15) : isCritical ? Math.floor(25 + Math.random() * 25) : Math.floor(50 + Math.random() * 25),
      turnsScore: isHealthy ? Math.floor(80 + Math.random() * 20) : isCritical ? Math.floor(20 + Math.random() * 25) : Math.floor(45 + Math.random() * 25),
      serviceScore: isHealthy ? Math.floor(90 + Math.random() * 10) : isCritical ? Math.floor(70 + Math.random() * 15) : Math.floor(80 + Math.random() * 15),
      stockoutEvents: isCritical ? Math.floor(5 + Math.random() * 10) : isHealthy ? 0 : Math.floor(1 + Math.random() * 4),
      trend: Array.from({ length: 6 }, () => Math.floor(30 + Math.random() * 70)),
    };
  });
};

const generateDetailData = (id, data) => {
  const sku = data.find(d => d.id === id);
  if (!sku) return null;
  return sku;
};

const InventoryHealthCheck = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    abc: 'all',
    xyz: 'all',
    plant: 'all',
  });

  // Get tile data config for data source indicator
  const tileConfig = getTileDataConfig('inventory-health-check');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const healthData = generateHealthData();
      setData(healthData);

      const healthy = healthData.filter(d => d.status === 'Healthy').length;
      const moderate = healthData.filter(d => d.status === 'Moderate').length;
      const critical = healthData.filter(d => d.status === 'Critical').length;
      const totalExcess = healthData.reduce((sum, d) => sum + d.excessValue, 0);
      const avgFillRate = healthData.reduce((sum, d) => sum + d.fillRate, 0) / healthData.length;
      const avgTurns = healthData.reduce((sum, d) => sum + d.turns, 0) / healthData.length;

      setMetrics({
        healthy,
        moderate,
        critical,
        totalExcess,
        avgFillRate: avgFillRate.toFixed(1),
        avgTurns: avgTurns.toFixed(1),
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

  const filteredData = data.filter(row => {
    if (filters.status !== 'all' && row.status !== filters.status) return false;
    if (filters.abc !== 'all' && row.abc !== filters.abc) return false;
    if (filters.xyz !== 'all' && row.xyz !== filters.xyz) return false;
    if (filters.plant !== 'all' && row.plant !== filters.plant) return false;
    return true;
  });

  const uniquePlants = [...new Set(data.map(d => d.plant))];

  // DataGrid columns - matching DemandIntelligence/ForecastingEngine pattern
  const columns = [
    { field: 'id', headerName: 'Material ID', minWidth: 120, flex: 1 },
    { field: 'material', headerName: 'Material', minWidth: 160, flex: 1.3 },
    { field: 'plant', headerName: 'Plant', minWidth: 100, flex: 0.8, align: 'center', headerAlign: 'center' },
    {
      field: 'abcXyz',
      headerName: 'ABC/XYZ',
      minWidth: 100,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ fontWeight: 700, bgcolor: alpha('#0078d4', 0.12), color: '#005a9e' }}
        />
      ),
    },
    {
      field: 'healthScore',
      headerName: 'Health Score',
      minWidth: 120,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value >= 75 ? 'success' : params.value >= 50 ? 'warning' : 'error'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Healthy' ? 'success' : params.value === 'Moderate' ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'excessValue',
      headerName: 'Excess $',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={formatCurrency(params.value)}
          size="small"
          color={params.value === 0 ? 'success' : params.value < 50000 ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'daysCover',
      headerName: 'Days Cover',
      minWidth: 110,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const val = params.row.daysCoverNum;
        return (
          <Chip
            label={params.value}
            size="small"
            color={val <= 60 ? 'success' : val <= 120 ? 'warning' : 'error'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: 'turns',
      headerName: 'Turns',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value >= 5 ? 'success' : params.value >= 3 ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'fillRate',
      headerName: 'Fill Rate',
      minWidth: 100,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          color={params.value >= 97 ? 'success' : params.value >= 93 ? 'warning' : 'error'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    { field: 'valuation', headerName: 'Valuation', minWidth: 100, flex: 0.7, align: 'center', headerAlign: 'center' },
  ];

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedSku) return null;

    const isHealthy = selectedSku.status === 'Healthy';
    const isCritical = selectedSku.status === 'Critical';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small" sx={{ mb: 2 }}>
          Back to List
        </Button>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <HealthIcon sx={{ fontSize: 40, color: '#06b6d4' }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>{selectedSku.id} | {selectedSku.plant}</Typography>
            <Typography color="text.secondary">{selectedSku.material}</Typography>
          </Box>
          <Chip
            label={selectedSku.status}
            color={isHealthy ? 'success' : isCritical ? 'error' : 'warning'}
            sx={{ ml: 'auto', fontWeight: 600 }}
          />
        </Stack>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Health Score Card */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Health Score
                </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    color: isHealthy ? '#10b981' : isCritical ? '#ef4444' : '#f59e0b',
                  }}
                >
                  {selectedSku.healthScore}
                </Typography>
                <Typography sx={{ color: '#64748b', mb: 2 }}>
                  {isHealthy ? 'Excellent' : isCritical ? 'Critical' : 'Moderate'}
                </Typography>
                {[
                  { label: 'Excess Score', value: selectedSku.excessScore },
                  { label: 'Coverage Score', value: selectedSku.coverageScore },
                  { label: 'Turns Score', value: selectedSku.turnsScore },
                  { label: 'Service Score', value: selectedSku.serviceScore },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderTop: idx === 0 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.2) }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.value >= 75 ? '#10b981' : item.value >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Inventory Position */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Inventory Position
                  </Typography>
                  <Chip label="MARD/MBEW" size="small" sx={{ fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                {[
                  { label: 'Unrestricted Stock', value: `${selectedSku.unrestrictedStock.toLocaleString()} EA` },
                  { label: 'Quality Inspection', value: `${selectedSku.qiStock.toLocaleString()} EA` },
                  { label: 'Blocked Stock', value: `${selectedSku.blockedStock.toLocaleString()} EA`, highlight: selectedSku.blockedStock > 0 },
                  { label: 'In Transit', value: `${selectedSku.inTransit.toLocaleString()} EA` },
                  { label: 'Total Stock Value', value: formatCurrency(selectedSku.stockValue), bold: true },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: colors.border }}>
                    <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary, fontWeight: item.bold ? 600 : 400 }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: item.bold ? 700 : 600, color: item.highlight ? '#ef4444' : item.bold ? '#06b6d4' : colors.text }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Planning Parameters */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Planning Parameters
                  </Typography>
                  <Chip label="MARC/MM02" size="small" sx={{ fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                {[
                  { label: 'Safety Stock', value: `${selectedSku.safetyStock.toLocaleString()} EA` },
                  { label: 'Reorder Point', value: `${selectedSku.reorderPoint.toLocaleString()} EA` },
                  { label: 'Max Stock Level', value: `${selectedSku.maxStock.toLocaleString()} EA` },
                  { label: 'Avg Daily Usage', value: `${selectedSku.avgDailyUsage} EA/day` },
                  { label: 'Stockout Events (30d)', value: selectedSku.stockoutEvents, highlight: selectedSku.stockoutEvents > 0 },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: colors.border }}>
                    <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.highlight ? '#ef4444' : colors.text }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Health Trend Chart */}
        <Card variant="outlined" sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
          <CardContent sx={{ p: 2 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
              Health Score Trend (6 Months)
            </Typography>
            <Box sx={{ height: 200 }}>
              <Line
                data={{
                  labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
                  datasets: [{
                    data: selectedSku.trend,
                    borderColor: isHealthy ? '#10b981' : isCritical ? '#ef4444' : '#f59e0b',
                    backgroundColor: alpha(isHealthy ? '#10b981' : isCritical ? '#ef4444' : '#f59e0b', 0.1),
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: isHealthy ? '#10b981' : isCritical ? '#ef4444' : '#f59e0b',
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }, ticks: { color: colors.textSecondary, font: { size: 10 } } },
                    y: { grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }, ticks: { color: colors.textSecondary, font: { size: 10 } }, min: 0, max: 100 },
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.background }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Layer 2: Diagnostics</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              {selectedSku ? `${selectedSku.id} Detail` : 'Inventory Health Check'}
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
              <HealthIcon sx={{ fontSize: 40, color: '#06b6d4' }} />
              <Typography variant="h5" fontWeight={600} sx={{ color: colors.text }}>Inventory Health Check</Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Monitor inventory health scores, excess stock, coverage metrics, and service levels
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
                <Card variant="outlined" sx={{ borderLeft: `3px solid #10b981`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Healthy</Typography>
                    <Typography variant="h4" fontWeight={700} color="#059669">{metrics.healthy}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #f59e0b`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Moderate</Typography>
                    <Typography variant="h4" fontWeight={700} color="#d97706">{metrics.moderate}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #ef4444`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Critical</Typography>
                    <Typography variant="h4" fontWeight={700} color="#dc2626">{metrics.critical}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #ef4444`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Excess $</Typography>
                    <Typography variant="h4" fontWeight={700} color="#dc2626">{formatCurrency(metrics.totalExcess)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #f59e0b`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Fill Rate</Typography>
                    <Typography variant="h4" fontWeight={700} color="#d97706">{metrics.avgFillRate}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #06b6d4`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Avg Turns</Typography>
                    <Typography variant="h4" fontWeight={700} color="#0891b2">{metrics.avgTurns}x</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
            <FilterListIcon sx={{ color: colors.textSecondary }} />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: colors.textSecondary }}>Status</InputLabel>
              <Select value={filters.status} label="Status" onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{ color: colors.text, '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border }, '& .MuiSvgIcon-root': { color: colors.text } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}`, '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } } } } }}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Healthy">Healthy</MenuItem>
                <MenuItem value="Moderate">Moderate</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel sx={{ color: colors.textSecondary }}>ABC</InputLabel>
              <Select value={filters.abc} label="ABC" onChange={(e) => handleFilterChange('abc', e.target.value)}
                sx={{ color: colors.text, '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border }, '& .MuiSvgIcon-root': { color: colors.text } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}`, '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } } } } }}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel sx={{ color: colors.textSecondary }}>XYZ</InputLabel>
              <Select value={filters.xyz} label="XYZ" onChange={(e) => handleFilterChange('xyz', e.target.value)}
                sx={{ color: colors.text, '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border }, '& .MuiSvgIcon-root': { color: colors.text } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}`, '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } } } } }}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="X">X</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
                <MenuItem value="Z">Z</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: colors.textSecondary }}>Plant</InputLabel>
              <Select value={filters.plant} label="Plant" onChange={(e) => handleFilterChange('plant', e.target.value)}
                sx={{ color: colors.text, '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border }, '& .MuiSvgIcon-root': { color: colors.text } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}`, '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } } } } }}>
                <MenuItem value="all">All Plants</MenuItem>
                {uniquePlants.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <Typography sx={{ ml: 'auto', fontSize: '0.8rem', color: colors.textSecondary }}>
              Showing {filteredData.length} of {data.length} items
            </Typography>
          </Paper>

          {/* DataGrid */}
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
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
                },
                '& .MuiDataGrid-cell': {
                  color: colors.text,
                  borderBottom: `1px solid ${colors.border}`,
                },
                '& .MuiDataGrid-row': {
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
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
                  '& .MuiButton-root': {
                    color: colors.text,
                  },
                },
              }}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default InventoryHealthCheck;
