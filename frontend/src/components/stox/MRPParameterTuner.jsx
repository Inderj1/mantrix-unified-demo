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
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Settings as SettingsIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  FilterList as FilterListIcon,
  Save,
  Undo,
  PlayArrow,
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

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

// Dark Mode Color Helper
const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
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

// Generate mock MRP tuning data
const generateTuningData = () => {
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

  const mrpControllers = ['MRP1', 'MRP2', 'MRP3'];

  return materials.map((mat, idx) => {
    const safetyStock = Math.floor(100 + Math.random() * 400);
    const reorderPoint = Math.floor(safetyStock * 1.5 + Math.random() * 200);
    const maxStock = Math.floor(reorderPoint * 2 + Math.random() * 500);
    const lotSize = Math.floor(50 + Math.random() * 200);
    const planningTimeFence = Math.floor(7 + Math.random() * 21);
    const grProcessingTime = Math.floor(1 + Math.random() * 5);
    const schedulingMargin = Math.floor(1 + Math.random() * 3);

    const hasChanges = Math.random() > 0.6;
    const pendingApproval = hasChanges && Math.random() > 0.5;

    return {
      id: mat.id,
      material: mat.name,
      plant: mat.plant,
      mrpController: mrpControllers[idx % 3],
      safetyStock,
      originalSafetyStock: safetyStock,
      reorderPoint,
      originalReorderPoint: reorderPoint,
      maxStock,
      originalMaxStock: maxStock,
      lotSize,
      originalLotSize: lotSize,
      planningTimeFence,
      grProcessingTime,
      schedulingMargin,
      hasChanges,
      status: pendingApproval ? 'Pending Approval' : hasChanges ? 'Modified' : 'Current',
      lastModified: hasChanges ? new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '-',
      modifiedBy: hasChanges ? 'System' : '-',
      simulatedServiceLevel: (92 + Math.random() * 7).toFixed(1),
      simulatedStockValue: Math.floor(50000 + Math.random() * 200000),
    };
  });
};

const MRPParameterTuner = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [filters, setFilters] = useState({
    status: 'all',
    plant: 'all',
    mrpController: 'all',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const tuningData = generateTuningData();
      setData(tuningData);

      const totalItems = tuningData.length;
      const modifiedCount = tuningData.filter(d => d.status === 'Modified').length;
      const pendingCount = tuningData.filter(d => d.status === 'Pending Approval').length;
      const currentCount = tuningData.filter(d => d.status === 'Current').length;
      const avgServiceLevel = tuningData.reduce((sum, d) => sum + parseFloat(d.simulatedServiceLevel), 0) / totalItems;
      const totalStockValue = tuningData.reduce((sum, d) => sum + d.simulatedStockValue, 0);

      setMetrics({
        totalItems,
        modifiedCount,
        pendingCount,
        currentCount,
        avgServiceLevel: avgServiceLevel.toFixed(1),
        totalStockValue,
      });
      setLoading(false);
    }, 500);
  };

  const filteredData = data.filter(row => {
    if (filters.status !== 'all' && row.status !== filters.status) return false;
    if (filters.plant !== 'all' && row.plant !== filters.plant) return false;
    if (filters.mrpController !== 'all' && row.mrpController !== filters.mrpController) return false;
    return true;
  });

  const columns = [
    { field: 'id', headerName: 'Material ID', minWidth: 110, flex: 0.8 },
    { field: 'material', headerName: 'Material', minWidth: 150, flex: 1.2 },
    { field: 'plant', headerName: 'Plant', minWidth: 80, flex: 0.6, align: 'center', headerAlign: 'center' },
    { field: 'mrpController', headerName: 'MRP Ctrl', minWidth: 90, flex: 0.6, align: 'center', headerAlign: 'center' },
    {
      field: 'safetyStock',
      headerName: 'Safety Stock',
      minWidth: 100,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'reorderPoint',
      headerName: 'ROP',
      minWidth: 90,
      flex: 0.6,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'maxStock',
      headerName: 'Max Stock',
      minWidth: 100,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'lotSize',
      headerName: 'Lot Size',
      minWidth: 90,
      flex: 0.6,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'planningTimeFence',
      headerName: 'PTF (days)',
      minWidth: 100,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 130,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Current' ? 'success' : params.value === 'Modified' ? 'info' : 'warning'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'simulatedServiceLevel',
      headerName: 'Sim SL %',
      minWidth: 100,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => `${params.value}%`,
    },
    {
      field: 'lastModified',
      headerName: 'Modified',
      minWidth: 100,
      flex: 0.7,
    },
  ];

  const handleRowClick = (params) => {
    setSelectedItem(params.row);
    setEditedValues({
      safetyStock: params.row.safetyStock,
      reorderPoint: params.row.reorderPoint,
      maxStock: params.row.maxStock,
      lotSize: params.row.lotSize,
      planningTimeFence: params.row.planningTimeFence,
    });
  };

  const handleValueChange = (field, value) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  const renderDetailView = () => {
    if (!selectedItem) return null;

    const impactData = {
      labels: ['Safety Stock', 'ROP', 'Max Stock', 'Lot Size'],
      datasets: [
        {
          label: 'Original',
          data: [
            selectedItem.originalSafetyStock,
            selectedItem.originalReorderPoint,
            selectedItem.originalMaxStock,
            selectedItem.originalLotSize,
          ],
          backgroundColor: '#64748b',
        },
        {
          label: 'Current/Edited',
          data: [
            editedValues.safetyStock,
            editedValues.reorderPoint,
            editedValues.maxStock,
            editedValues.lotSize,
          ],
          backgroundColor: '#0891b2',
        },
      ],
    };

    const serviceLevelTrend = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      datasets: [
        {
          label: 'Simulated Service Level',
          data: Array.from({ length: 6 }, () => 90 + Math.random() * 9),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
        },
      ],
    };

    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setSelectedItem(null)}
            variant="outlined"
            size="small"
          >
            Back to List
          </Button>
          <Typography variant="h6" fontWeight={700}>
            {selectedItem.material} - Parameter Tuning
          </Typography>
          <Chip
            label={selectedItem.status}
            size="small"
            color={selectedItem.status === 'Current' ? 'success' : selectedItem.status === 'Modified' ? 'info' : 'warning'}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button startIcon={<Undo />} variant="outlined" size="small" sx={{ mr: 1 }}>
            Reset
          </Button>
          <Button startIcon={<PlayArrow />} variant="outlined" size="small" color="info" sx={{ mr: 1 }}>
            Simulate
          </Button>
          <Button startIcon={<Save />} variant="contained" size="small" color="primary">
            Save Changes
          </Button>
        </Box>

        <Grid container spacing={2}>
          {/* Editable Parameters */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Tune Parameters</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Safety Stock</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Slider
                        value={editedValues.safetyStock}
                        onChange={(e, val) => handleValueChange('safetyStock', val)}
                        min={0}
                        max={1000}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        value={editedValues.safetyStock}
                        onChange={(e) => handleValueChange('safetyStock', parseInt(e.target.value) || 0)}
                        size="small"
                        type="number"
                        sx={{ width: 100 }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Reorder Point</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Slider
                        value={editedValues.reorderPoint}
                        onChange={(e, val) => handleValueChange('reorderPoint', val)}
                        min={0}
                        max={1500}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        value={editedValues.reorderPoint}
                        onChange={(e) => handleValueChange('reorderPoint', parseInt(e.target.value) || 0)}
                        size="small"
                        type="number"
                        sx={{ width: 100 }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Max Stock</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Slider
                        value={editedValues.maxStock}
                        onChange={(e, val) => handleValueChange('maxStock', val)}
                        min={0}
                        max={3000}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        value={editedValues.maxStock}
                        onChange={(e) => handleValueChange('maxStock', parseInt(e.target.value) || 0)}
                        size="small"
                        type="number"
                        sx={{ width: 100 }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Lot Size</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Slider
                        value={editedValues.lotSize}
                        onChange={(e, val) => handleValueChange('lotSize', val)}
                        min={1}
                        max={500}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        value={editedValues.lotSize}
                        onChange={(e) => handleValueChange('lotSize', parseInt(e.target.value) || 0)}
                        size="small"
                        type="number"
                        sx={{ width: 100 }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Planning Time Fence (days)</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Slider
                        value={editedValues.planningTimeFence}
                        onChange={(e, val) => handleValueChange('planningTimeFence', val)}
                        min={1}
                        max={60}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        value={editedValues.planningTimeFence}
                        onChange={(e) => handleValueChange('planningTimeFence', parseInt(e.target.value) || 0)}
                        size="small"
                        type="number"
                        sx={{ width: 100 }}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Parameter Comparison Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Original vs Edited</Typography>
                <Box sx={{ height: 280 }}>
                  <Bar
                    data={impactData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top' } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Simulation Results */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Simulation Results</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: alpha('#10b981', 0.1), borderLeft: '4px solid #10b981' }}>
                      <CardContent sx={{ py: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">Projected Service Level</Typography>
                        <Typography variant="h5" fontWeight={700} color="success.main">
                          {selectedItem.simulatedServiceLevel}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: alpha('#0891b2', 0.1), borderLeft: '4px solid #0891b2' }}>
                      <CardContent sx={{ py: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">Projected Stock Value</Typography>
                        <Typography variant="h5" fontWeight={700} color="info.main">
                          {formatCurrency(selectedItem.simulatedStockValue)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Service Level Trend */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Projected Service Level Trend</Typography>
                <Box sx={{ height: 200 }}>
                  <Line
                    data={serviceLevelTrend}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { min: 85, max: 100, title: { display: true, text: 'SL %' } } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Parameters */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Additional Parameters</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">Plant</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.plant}</Typography>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">MRP Controller</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.mrpController}</Typography>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">GR Processing Time</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.grProcessingTime} days</Typography>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">Scheduling Margin</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.schedulingMargin} days</Typography>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">Last Modified</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.lastModified}</Typography>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">Modified By</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.modifiedBy}</Typography>
                  </Grid>
                </Grid>
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
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Layer 5: Sandbox</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>MRP Parameter Tuner</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ borderColor: 'divider' }}>
            Back
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <SettingsIcon sx={{ fontSize: 32, color: '#0891b2' }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="#0891b2">
              MRP Parameter Tuner
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fine-tune MRP parameters with interactive sliders and real-time simulation
            </Typography>
          </Box>
        </Stack>
      </Box>

      {selectedItem ? (
        renderDetailView()
      ) : (
        <>
          {/* Summary Cards */}
          {metrics && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #0891b2' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Total Items</Typography>
                    <Typography variant="h5" fontWeight={700}>{metrics.totalItems}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #10b981' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Current</Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">{metrics.currentCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #2b88d8' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Modified</Typography>
                    <Typography variant="h5" fontWeight={700} color="info.main">{metrics.modifiedCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Pending</Typography>
                    <Typography variant="h5" fontWeight={700} color="warning.main">{metrics.pendingCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #0078d4' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Avg Service Level</Typography>
                    <Typography variant="h5" fontWeight={700}>{metrics.avgServiceLevel}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #06b6d4' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Total Stock Value</Typography>
                    <Typography variant="h5" fontWeight={700}>{formatCurrency(metrics.totalStockValue)}</Typography>
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
                <InputLabel>Status</InputLabel>
                <Select value={filters.status} label="Status" onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Current">Current</MenuItem>
                  <MenuItem value="Modified">Modified</MenuItem>
                  <MenuItem value="Pending Approval">Pending Approval</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Plant</InputLabel>
                <Select value={filters.plant} label="Plant" onChange={(e) => setFilters({ ...filters, plant: e.target.value })}>
                  <MenuItem value="all">All Plants</MenuItem>
                  <MenuItem value="P1000">P1000</MenuItem>
                  <MenuItem value="P2000">P2000</MenuItem>
                  <MenuItem value="P3000">P3000</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>MRP Controller</InputLabel>
                <Select value={filters.mrpController} label="MRP Controller" onChange={(e) => setFilters({ ...filters, mrpController: e.target.value })}>
                  <MenuItem value="all">All Controllers</MenuItem>
                  <MenuItem value="MRP1">MRP1</MenuItem>
                  <MenuItem value="MRP2">MRP2</MenuItem>
                  <MenuItem value="MRP3">MRP3</MenuItem>
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

export default MRPParameterTuner;
