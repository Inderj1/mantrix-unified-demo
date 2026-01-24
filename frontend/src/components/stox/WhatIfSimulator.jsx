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
  Slider,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  PlayCircle as PlayCircleIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  FilterList as FilterListIcon,
  Compare,
  Timeline,
  TrendingUp,
  TrendingDown,
  Save,
  RestartAlt,
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

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

// Generate mock scenario data
const generateScenarioData = () => {
  const scenarios = [
    { id: 'SCN-001', name: 'Demand Surge +20%', type: 'Demand' },
    { id: 'SCN-002', name: 'Lead Time Increase', type: 'Supply' },
    { id: 'SCN-003', name: 'Safety Stock Reduction', type: 'Inventory' },
    { id: 'SCN-004', name: 'New Product Launch', type: 'Demand' },
    { id: 'SCN-005', name: 'Supplier Disruption', type: 'Supply' },
    { id: 'SCN-006', name: 'Seasonal Peak', type: 'Demand' },
    { id: 'SCN-007', name: 'Cost Optimization', type: 'Cost' },
    { id: 'SCN-008', name: 'Service Level Target', type: 'Service' },
  ];

  return scenarios.map((scn, idx) => {
    const baselineServiceLevel = 94 + Math.random() * 4;
    const simulatedServiceLevel = baselineServiceLevel + (Math.random() - 0.5) * 10;
    const baselineStockValue = Math.floor(500000 + Math.random() * 1500000);
    const simulatedStockValue = Math.floor(baselineStockValue * (0.8 + Math.random() * 0.4));
    const baselineStockouts = Math.floor(5 + Math.random() * 15);
    const simulatedStockouts = Math.floor(baselineStockouts * (0.5 + Math.random() * 1));

    return {
      id: scn.id,
      name: scn.name,
      type: scn.type,
      status: Math.random() > 0.3 ? 'Completed' : 'Draft',
      baselineServiceLevel: baselineServiceLevel.toFixed(1),
      simulatedServiceLevel: simulatedServiceLevel.toFixed(1),
      serviceLevelDelta: (simulatedServiceLevel - baselineServiceLevel).toFixed(1),
      baselineStockValue,
      simulatedStockValue,
      stockValueDelta: simulatedStockValue - baselineStockValue,
      baselineStockouts,
      simulatedStockouts,
      stockoutsDelta: simulatedStockouts - baselineStockouts,
      createdBy: 'Analyst',
      createdDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastRun: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  });
};

const WhatIfSimulator = ({ onBack, darkMode = false }) => {
  const tileConfig = getTileDataConfig('what-if-simulator');
  const colors = getColors(darkMode);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [simulationParams, setSimulationParams] = useState({
    demandChange: 0,
    leadTimeChange: 0,
    safetyStockChange: 0,
    costChange: 0,
    serviceLevelTarget: 95,
  });
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const scenarioData = generateScenarioData();
      setData(scenarioData);

      const totalScenarios = scenarioData.length;
      const completedCount = scenarioData.filter(d => d.status === 'Completed').length;
      const draftCount = scenarioData.filter(d => d.status === 'Draft').length;
      const avgServiceLevelImpact = scenarioData.reduce((sum, d) => sum + parseFloat(d.serviceLevelDelta), 0) / totalScenarios;
      const totalCostImpact = scenarioData.reduce((sum, d) => sum + d.stockValueDelta, 0);

      setMetrics({
        totalScenarios,
        completedCount,
        draftCount,
        avgServiceLevelImpact: avgServiceLevelImpact.toFixed(1),
        totalCostImpact,
      });
      setLoading(false);
    }, 500);
  };

  const filteredData = data.filter(row => {
    if (filters.type !== 'all' && row.type !== filters.type) return false;
    if (filters.status !== 'all' && row.status !== filters.status) return false;
    return true;
  });

  const columns = [
    { field: 'id', headerName: 'Scenario ID', minWidth: 100, flex: 0.7 },
    { field: 'name', headerName: 'Scenario Name', minWidth: 180, flex: 1.4 },
    {
      field: 'type',
      headerName: 'Type',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Demand' ? 'info' : params.value === 'Supply' ? 'warning' : params.value === 'Cost' ? 'success' : 'secondary'}
          sx={{ fontWeight: 600 }}
        />
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
          color={params.value === 'Completed' ? 'success' : 'default'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'serviceLevelDelta',
      headerName: 'SL Impact',
      minWidth: 110,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const val = parseFloat(params.value);
        return (
          <Chip
            icon={val >= 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
            label={`${val >= 0 ? '+' : ''}${params.value}%`}
            size="small"
            color={val >= 0 ? 'success' : 'error'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: 'stockValueDelta',
      headerName: 'Cost Impact',
      minWidth: 120,
      flex: 0.9,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const val = params.value;
        const color = val <= 0 ? 'success.main' : 'error.main';
        return (
          <Typography variant="body2" fontWeight={600} color={color}>
            {val <= 0 ? '-' : '+'}{formatCurrency(Math.abs(val))}
          </Typography>
        );
      },
    },
    {
      field: 'stockoutsDelta',
      headerName: 'Stockouts',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const val = params.value;
        return (
          <Chip
            label={`${val >= 0 ? '+' : ''}${val}`}
            size="small"
            color={val <= 0 ? 'success' : 'error'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: 'lastRun',
      headerName: 'Last Run',
      minWidth: 100,
      flex: 0.7,
    },
  ];

  const handleRowClick = (params) => {
    setSelectedScenario(params.row);
  };

  const renderDetailView = () => {
    if (!selectedScenario) return null;

    const comparisonData = {
      labels: ['Service Level (%)', 'Stock Value ($K)', 'Stockouts (#)'],
      datasets: [
        {
          label: 'Baseline',
          data: [
            parseFloat(selectedScenario.baselineServiceLevel),
            selectedScenario.baselineStockValue / 1000,
            selectedScenario.baselineStockouts * 10,
          ],
          backgroundColor: '#64748b',
        },
        {
          label: 'Simulated',
          data: [
            parseFloat(selectedScenario.simulatedServiceLevel),
            selectedScenario.simulatedStockValue / 1000,
            selectedScenario.simulatedStockouts * 10,
          ],
          backgroundColor: '#0891b2',
        },
      ],
    };

    const trendData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
      datasets: [
        {
          label: 'Baseline Service Level',
          data: Array.from({ length: 8 }, () => parseFloat(selectedScenario.baselineServiceLevel) + (Math.random() - 0.5) * 3),
          borderColor: '#64748b',
          backgroundColor: 'rgba(100, 116, 139, 0.1)',
          borderDash: [5, 5],
        },
        {
          label: 'Simulated Service Level',
          data: Array.from({ length: 8 }, () => parseFloat(selectedScenario.simulatedServiceLevel) + (Math.random() - 0.5) * 3),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
        },
      ],
    };

    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {selectedScenario.name}
          </Typography>
          <Chip
            label={selectedScenario.type}
            size="small"
            color={selectedScenario.type === 'Demand' ? 'info' : selectedScenario.type === 'Supply' ? 'warning' : 'success'}
          />
          <Chip
            label={selectedScenario.status}
            size="small"
            color={selectedScenario.status === 'Completed' ? 'success' : 'default'}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button startIcon={<RestartAlt />} variant="outlined" size="small" sx={{ mr: 1 }}>
            Reset
          </Button>
          <Button startIcon={<PlayCircleIcon />} variant="contained" size="small" color="primary">
            Run Simulation
          </Button>
        </Box>

        <Grid container spacing={2}>
          {/* Impact Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #0891b2', bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Service Level Impact</Typography>
                <Typography variant="h5" fontWeight={700} color={parseFloat(selectedScenario.serviceLevelDelta) >= 0 ? 'success.main' : 'error.main'}>
                  {parseFloat(selectedScenario.serviceLevelDelta) >= 0 ? '+' : ''}{selectedScenario.serviceLevelDelta}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #10b981', bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Cost Impact</Typography>
                <Typography variant="h5" fontWeight={700} color={selectedScenario.stockValueDelta <= 0 ? 'success.main' : 'error.main'}>
                  {selectedScenario.stockValueDelta <= 0 ? '-' : '+'}{formatCurrency(Math.abs(selectedScenario.stockValueDelta))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #f59e0b', bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Stockout Change</Typography>
                <Typography variant="h5" fontWeight={700} color={selectedScenario.stockoutsDelta <= 0 ? 'success.main' : 'error.main'}>
                  {selectedScenario.stockoutsDelta >= 0 ? '+' : ''}{selectedScenario.stockoutsDelta}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #00357a', bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Simulated SL</Typography>
                <Typography variant="h5" fontWeight={700}>{selectedScenario.simulatedServiceLevel}%</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Simulation Parameters */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Simulation Parameters</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Demand Change (%)</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Slider
                        value={simulationParams.demandChange}
                        onChange={(e, val) => setSimulationParams(prev => ({ ...prev, demandChange: val }))}
                        min={-50}
                        max={50}
                        marks={[{ value: 0, label: '0%' }]}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        value={simulationParams.demandChange}
                        size="small"
                        type="number"
                        sx={{ width: 80 }}
                        InputProps={{ endAdornment: '%' }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Lead Time Change (days)</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Slider
                        value={simulationParams.leadTimeChange}
                        onChange={(e, val) => setSimulationParams(prev => ({ ...prev, leadTimeChange: val }))}
                        min={-10}
                        max={20}
                        marks={[{ value: 0, label: '0' }]}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        value={simulationParams.leadTimeChange}
                        size="small"
                        type="number"
                        sx={{ width: 80 }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Safety Stock Change (%)</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Slider
                        value={simulationParams.safetyStockChange}
                        onChange={(e, val) => setSimulationParams(prev => ({ ...prev, safetyStockChange: val }))}
                        min={-50}
                        max={50}
                        marks={[{ value: 0, label: '0%' }]}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        value={simulationParams.safetyStockChange}
                        size="small"
                        type="number"
                        sx={{ width: 80 }}
                        InputProps={{ endAdornment: '%' }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Service Level Target (%)</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Slider
                        value={simulationParams.serviceLevelTarget}
                        onChange={(e, val) => setSimulationParams(prev => ({ ...prev, serviceLevelTarget: val }))}
                        min={80}
                        max={99.9}
                        step={0.1}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        value={simulationParams.serviceLevelTarget}
                        size="small"
                        type="number"
                        sx={{ width: 80 }}
                        InputProps={{ endAdornment: '%' }}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Comparison Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Baseline vs Simulated</Typography>
                <Box sx={{ height: 280 }}>
                  <Bar
                    data={comparisonData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top', labels: { color: colors.text } } },
                      scales: {
                        y: { beginAtZero: true, ticks: { color: colors.textSecondary }, grid: { color: colors.border } },
                        x: { ticks: { color: colors.textSecondary }, grid: { color: colors.border } },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Trend Chart */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Service Level Projection</Typography>
                <Box sx={{ height: 250 }}>
                  <Line
                    data={trendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top', labels: { color: colors.text } } },
                      scales: {
                        y: { min: 85, max: 100, title: { display: true, text: 'Service Level %', color: colors.text }, ticks: { color: colors.textSecondary }, grid: { color: colors.border } },
                        x: { ticks: { color: colors.textSecondary }, grid: { color: colors.border } },
                      },
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
    <Box sx={{ p: 3, height: '100%', overflow: 'auto', bgcolor: colors.background }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            {selectedScenario ? (
              <>
                <Link component="button" variant="body1" onClick={() => setSelectedScenario(null)} sx={{ textDecoration: 'none', color: 'text.primary' }}>What-If Simulator</Link>
                <Typography color="primary" variant="body1" fontWeight={600}>{selectedScenario.name}</Typography>
              </>
            ) : (
              <Typography color="primary" variant="body1" fontWeight={600}>What-If Simulator</Typography>
            )}
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ borderColor: 'divider' }}>
            Back
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <PlayCircleIcon sx={{ fontSize: 32, color: '#00357a' }} />
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h5" fontWeight={700} color="#00357a">
                What-If Simulator
              </Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Run scenario simulations to analyze impact on service levels, costs, and inventory
            </Typography>
          </Box>
        </Stack>
      </Box>

      {selectedScenario ? (
        renderDetailView()
      ) : (
        <>
          {/* Summary Cards */}
          {metrics && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ borderLeft: '4px solid #00357a', bgcolor: colors.cardBg, borderColor: colors.border }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Total Scenarios</Typography>
                    <Typography variant="h5" fontWeight={700}>{metrics.totalScenarios}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ borderLeft: '4px solid #10b981', bgcolor: colors.cardBg, borderColor: colors.border }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Completed</Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">{metrics.completedCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ borderLeft: '4px solid #64748b', bgcolor: colors.cardBg, borderColor: colors.border }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Draft</Typography>
                    <Typography variant="h5" fontWeight={700}>{metrics.draftCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ borderLeft: '4px solid #0891b2', bgcolor: colors.cardBg, borderColor: colors.border }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Avg SL Impact</Typography>
                    <Typography variant="h5" fontWeight={700} color={parseFloat(metrics.avgServiceLevelImpact) >= 0 ? 'success.main' : 'error.main'}>
                      {parseFloat(metrics.avgServiceLevelImpact) >= 0 ? '+' : ''}{metrics.avgServiceLevelImpact}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ borderLeft: '4px solid #f59e0b', bgcolor: colors.cardBg, borderColor: colors.border }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Total Cost Impact</Typography>
                    <Typography variant="h5" fontWeight={700} color={metrics.totalCostImpact <= 0 ? 'success.main' : 'error.main'}>
                      {formatCurrency(Math.abs(metrics.totalCostImpact))}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: colors.paper, borderColor: colors.border }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <FilterListIcon color="action" />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Type</InputLabel>
                <Select value={filters.type} label="Type" onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="Demand">Demand</MenuItem>
                  <MenuItem value="Supply">Supply</MenuItem>
                  <MenuItem value="Inventory">Inventory</MenuItem>
                  <MenuItem value="Cost">Cost</MenuItem>
                  <MenuItem value="Service">Service</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select value={filters.status} label="Status" onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ flexGrow: 1 }} />
              <Button startIcon={<PlayCircleIcon />} variant="contained" size="small" color="primary">
                New Scenario
              </Button>
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
          <Paper sx={{ height: 500, bgcolor: colors.paper, borderColor: colors.border }}>
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

export default WhatIfSimulator;
