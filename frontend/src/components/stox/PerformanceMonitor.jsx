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
  Speed as SpeedIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  FilterList as FilterListIcon,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, ChartTooltip, Legend, Filler);

// Import Lam Research data
import {
  LAM_PLANTS,
  LAM_MATERIAL_PLANT_DATA,
  LAM_MATERIALS,
  calculatePlantSummary,
  formatCurrency as lamFormatCurrency,
} from '../../data/arizonaBeveragesMasterData';

const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

// Generate performance KPI data using Lam Research metrics
const generateKPIData = () => {
  // Calculate actual metrics from Lam Research data
  const avgTurns = LAM_MATERIAL_PLANT_DATA.reduce((sum, d) => sum + d.turns, 0) / LAM_MATERIAL_PLANT_DATA.length;
  const avgDOS = LAM_MATERIAL_PLANT_DATA.reduce((sum, d) => sum + d.dos, 0) / LAM_MATERIAL_PLANT_DATA.length;
  const avgFillRate = LAM_MATERIAL_PLANT_DATA.reduce((sum, d) => sum + d.fillRate, 0) / LAM_MATERIAL_PLANT_DATA.length;
  const totalExcess = LAM_MATERIAL_PLANT_DATA.reduce((sum, d) => sum + (d.excessStock || 0), 0);
  const avgStockouts = LAM_MATERIAL_PLANT_DATA.reduce((sum, d) => sum + d.stockouts, 0) / LAM_MATERIAL_PLANT_DATA.length;

  // Calculate plant-level summaries
  const plantSummaries = LAM_PLANTS.map(p => calculatePlantSummary(p.id));
  const avgLeadTime = LAM_MATERIAL_PLANT_DATA.reduce((sum, d) => sum + d.leadTime, 0) / LAM_MATERIAL_PLANT_DATA.length;

  const kpis = [
    { id: 'KPI-001', name: 'Service Level - Global', category: 'Service', unit: '%', target: 95, actual: 95 - avgStockouts * 0.8 },
    { id: 'KPI-002', name: 'Fill Rate - All Plants', category: 'Service', unit: '%', target: 98, actual: avgFillRate },
    { id: 'KPI-003', name: 'Inventory Turns', category: 'Efficiency', unit: 'x', target: 6.0, actual: avgTurns },
    { id: 'KPI-004', name: 'GMROI', category: 'Financial', unit: '$', target: 2.8, actual: 2.5 + (avgTurns / 10) },
    { id: 'KPI-005', name: 'Stockout Rate', category: 'Service', unit: '%', target: 3, actual: avgStockouts * 0.5 },
    { id: 'KPI-006', name: 'Excess Inventory', category: 'Financial', unit: '$', target: 80000000, actual: totalExcess },
    { id: 'KPI-007', name: 'Days of Supply', category: 'Efficiency', unit: 'days', target: 90, actual: avgDOS },
    { id: 'KPI-008', name: 'Forecast Accuracy', category: 'Planning', unit: '%', target: 85, actual: 82 + Math.random() * 6 },
    { id: 'KPI-009', name: 'On-Time Delivery', category: 'Service', unit: '%', target: 95, actual: 93 + Math.random() * 5 },
    { id: 'KPI-010', name: 'Perfect Order Rate', category: 'Service', unit: '%', target: 90, actual: 88 + Math.random() * 6 },
    { id: 'KPI-011', name: 'Carrying Cost %', category: 'Financial', unit: '%', target: 18, actual: 15 + totalExcess / 100000000 * 5 },
    { id: 'KPI-012', name: 'Order Cycle Time', category: 'Efficiency', unit: 'days', target: avgLeadTime * 0.8, actual: avgLeadTime },
    { id: 'KPI-013', name: 'Supplier OTD', category: 'Supply', unit: '%', target: 92, actual: 89 + Math.random() * 6 },
    { id: 'KPI-014', name: 'Lead Time Variance', category: 'Supply', unit: 'days', target: 5, actual: 3 + Math.random() * 4 },
    { id: 'KPI-015', name: 'MRP Accuracy', category: 'Planning', unit: '%', target: 90, actual: 87 + Math.random() * 6 },
  ];

  return kpis.map((kpi, idx) => {
    let actual = kpi.actual;
    let previousPeriod = actual * (0.95 + Math.random() * 0.1); // Previous period slightly different

    const change = ((actual - previousPeriod) / previousPeriod * 100);
    const isLowerBetter = kpi.name.includes('Stockout') || kpi.name.includes('Carrying') || kpi.name.includes('Excess') || kpi.name.includes('Variance') || kpi.name.includes('Cycle Time') || kpi.name.includes('Days of Supply');
    const achievement = isLowerBetter
      ? actual <= kpi.target ? 100 : Math.max(0, 100 - ((actual - kpi.target) / kpi.target * 100))
      : actual >= kpi.target ? 100 : (actual / kpi.target * 100);

    const status = achievement >= 95 ? 'On Track' : achievement >= 80 ? 'At Risk' : 'Off Track';

    return {
      id: kpi.id,
      name: kpi.name,
      category: kpi.category,
      unit: kpi.unit,
      target: kpi.target,
      actual: kpi.unit === '%' ? actual.toFixed(1) : kpi.unit === '$' ? Math.floor(actual) : actual.toFixed(1),
      actualNum: actual,
      previousPeriod: kpi.unit === '%' ? previousPeriod.toFixed(1) : kpi.unit === '$' ? Math.floor(previousPeriod) : previousPeriod.toFixed(1),
      change: change.toFixed(1),
      changeNum: change,
      achievement: achievement.toFixed(0),
      status,
      isLowerBetter,
      trend: Array.from({ length: 6 }, () => kpi.unit === '%'
        ? (actual * (0.95 + Math.random() * 0.1)).toFixed(1)
        : (actual * (0.9 + Math.random() * 0.2)).toFixed(1)
      ),
    };
  });
};

const PerformanceMonitor = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
  });

  // Get tile data config for data source indicator
  const tileConfig = getTileDataConfig('performance-monitor');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const kpiData = generateKPIData();
      setData(kpiData);

      const totalKPIs = kpiData.length;
      const onTrackCount = kpiData.filter(d => d.status === 'On Track').length;
      const atRiskCount = kpiData.filter(d => d.status === 'At Risk').length;
      const offTrackCount = kpiData.filter(d => d.status === 'Off Track').length;
      const avgAchievement = kpiData.reduce((sum, d) => sum + parseFloat(d.achievement), 0) / totalKPIs;
      const improvingCount = kpiData.filter(d => {
        const change = parseFloat(d.change);
        return d.isLowerBetter ? change < 0 : change > 0;
      }).length;

      setMetrics({
        totalKPIs,
        onTrackCount,
        atRiskCount,
        offTrackCount,
        avgAchievement: avgAchievement.toFixed(0),
        improvingCount,
      });
      setLoading(false);
    }, 500);
  };

  const filteredData = data.filter(row => {
    if (filters.category !== 'all' && row.category !== filters.category) return false;
    if (filters.status !== 'all' && row.status !== filters.status) return false;
    return true;
  });

  const columns = [
    { field: 'id', headerName: 'KPI ID', minWidth: 90, flex: 0.6 },
    { field: 'name', headerName: 'KPI Name', minWidth: 160, flex: 1.2 },
    {
      field: 'category',
      headerName: 'Category',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Service' ? 'info' : params.value === 'Financial' ? 'success' : params.value === 'Efficiency' ? 'warning' : 'secondary'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'target',
      headerName: 'Target',
      minWidth: 90,
      flex: 0.6,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const unit = params.row.unit;
        if (unit === '$') return formatCurrency(params.value);
        if (unit === '%') return `${params.value}%`;
        return `${params.value} ${unit}`;
      },
    },
    {
      field: 'actual',
      headerName: 'Actual',
      minWidth: 90,
      flex: 0.6,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const unit = params.row.unit;
        if (unit === '$') return formatCurrency(params.value);
        if (unit === '%') return `${params.value}%`;
        return `${params.value} ${unit}`;
      },
    },
    {
      field: 'change',
      headerName: 'Change',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const val = parseFloat(params.value);
        const isImproving = params.row.isLowerBetter ? val < 0 : val > 0;
        return (
          <Chip
            icon={isImproving ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
            label={`${val >= 0 ? '+' : ''}${params.value}%`}
            size="small"
            color={isImproving ? 'success' : 'error'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: 'achievement',
      headerName: 'Achievement',
      minWidth: 120,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(parseFloat(params.value), 100)}
            sx={{ flex: 1, height: 6, borderRadius: 3 }}
            color={parseFloat(params.value) >= 95 ? 'success' : parseFloat(params.value) >= 80 ? 'warning' : 'error'}
          />
          <Typography variant="caption" fontWeight={600}>{params.value}%</Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'On Track' ? 'success' : params.value === 'At Risk' ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
  ];

  const handleRowClick = (params) => {
    setSelectedKPI(params.row);
  };

  const renderDetailView = () => {
    if (!selectedKPI) return null;

    const trendData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      datasets: [
        {
          label: 'Actual',
          data: selectedKPI.trend.map(v => parseFloat(v)),
          borderColor: '#0891b2',
          backgroundColor: 'rgba(8, 145, 178, 0.1)',
          fill: true,
        },
        {
          label: 'Target',
          data: Array(6).fill(selectedKPI.target),
          borderColor: '#10b981',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
        },
      ],
    };

    const categoryDistribution = {
      labels: ['Service', 'Financial', 'Efficiency', 'Planning', 'Supply'],
      datasets: [{
        data: [5, 3, 3, 2, 2],
        backgroundColor: ['#0891b2', '#10b981', '#f59e0b', '#0078d4', '#ec4899'],
      }],
    };

    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setSelectedKPI(null)}
            variant="outlined"
            size="small"
          >
            Back to List
          </Button>
          <Typography variant="h6" fontWeight={700}>
            {selectedKPI.name}
          </Typography>
          <Chip
            label={selectedKPI.category}
            size="small"
            color={selectedKPI.category === 'Service' ? 'info' : selectedKPI.category === 'Financial' ? 'success' : 'warning'}
          />
          <Chip
            label={selectedKPI.status}
            size="small"
            color={selectedKPI.status === 'On Track' ? 'success' : selectedKPI.status === 'At Risk' ? 'warning' : 'error'}
          />
        </Box>

        <Grid container spacing={2}>
          {/* KPI Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #0891b2' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Target</Typography>
                <Typography variant="h5" fontWeight={700}>
                  {selectedKPI.unit === '$' ? formatCurrency(selectedKPI.target) : `${selectedKPI.target}${selectedKPI.unit === '%' ? '%' : ` ${selectedKPI.unit}`}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #10b981' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Actual</Typography>
                <Typography variant="h5" fontWeight={700} color={parseFloat(selectedKPI.achievement) >= 95 ? 'success.main' : parseFloat(selectedKPI.achievement) >= 80 ? 'warning.main' : 'error.main'}>
                  {selectedKPI.unit === '$' ? formatCurrency(selectedKPI.actual) : `${selectedKPI.actual}${selectedKPI.unit === '%' ? '%' : ` ${selectedKPI.unit}`}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #0078d4' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Achievement</Typography>
                <Typography variant="h5" fontWeight={700}>{selectedKPI.achievement}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: parseFloat(selectedKPI.change) >= 0 ? (selectedKPI.isLowerBetter ? '4px solid #ef4444' : '4px solid #10b981') : (selectedKPI.isLowerBetter ? '4px solid #10b981' : '4px solid #ef4444') }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Period Change</Typography>
                <Typography variant="h5" fontWeight={700}>
                  {parseFloat(selectedKPI.change) >= 0 ? '+' : ''}{selectedKPI.change}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Trend Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>6-Week Trend</Typography>
                <Box sx={{ height: 280 }}>
                  <Line
                    data={trendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top' } },
                      scales: {
                        y: {
                          beginAtZero: selectedKPI.unit !== '%',
                          min: selectedKPI.unit === '%' ? Math.max(0, selectedKPI.target - 20) : undefined,
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* KPI Details */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>KPI Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Category</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedKPI.category}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Unit</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedKPI.unit}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Previous Period</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedKPI.unit === '$' ? formatCurrency(selectedKPI.previousPeriod) : `${selectedKPI.previousPeriod}${selectedKPI.unit === '%' ? '%' : ''}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Direction</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedKPI.isLowerBetter ? 'Lower is Better' : 'Higher is Better'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Chip
                      label={selectedKPI.status}
                      size="small"
                      color={selectedKPI.status === 'On Track' ? 'success' : selectedKPI.status === 'At Risk' ? 'warning' : 'error'}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>KPIs by Category</Typography>
                <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                  <Doughnut
                    data={categoryDistribution}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'right' } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
              STOX.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Performance Monitor
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ borderColor: 'divider' }}>
            Back
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <SpeedIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h5" fontWeight={700} color="#f59e0b">
                Performance Monitor
              </Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Track KPIs, service levels, inventory turns, and optimization performance
            </Typography>
          </Box>
        </Stack>
      </Box>

      {selectedKPI ? (
        renderDetailView()
      ) : (
        <>
          {/* Summary Cards */}
          {metrics && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Total KPIs</Typography>
                    <Typography variant="h5" fontWeight={700}>{metrics.totalKPIs}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #10b981' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">On Track</Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">{metrics.onTrackCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">At Risk</Typography>
                    <Typography variant="h5" fontWeight={700} color="warning.main">{metrics.atRiskCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #ef4444' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Off Track</Typography>
                    <Typography variant="h5" fontWeight={700} color="error.main">{metrics.offTrackCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #0078d4' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Avg Achievement</Typography>
                    <Typography variant="h5" fontWeight={700}>{metrics.avgAchievement}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #0891b2' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Improving</Typography>
                    <Typography variant="h5" fontWeight={700} color="info.main">{metrics.improvingCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <FilterListIcon color="action" />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Category</InputLabel>
                <Select value={filters.category} label="Category" onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="Service">Service</MenuItem>
                  <MenuItem value="Financial">Financial</MenuItem>
                  <MenuItem value="Efficiency">Efficiency</MenuItem>
                  <MenuItem value="Planning">Planning</MenuItem>
                  <MenuItem value="Supply">Supply</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select value={filters.status} label="Status" onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="On Track">On Track</MenuItem>
                  <MenuItem value="At Risk">At Risk</MenuItem>
                  <MenuItem value="Off Track">Off Track</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ flexGrow: 1 }} />
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchData} size="small">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton size="small">
                  <Download />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>

          {/* Data Grid */}
          <Paper sx={{ height: 500 }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              loading={loading}
              density="compact"
              checkboxSelection
              disableRowSelectionOnClick
              onRowClick={handleRowClick}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              sx={stoxTheme.getDataGridSx({ clickable: true })}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default PerformanceMonitor;
