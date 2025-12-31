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
  AttachMoney as CostIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  FilterList as FilterListIcon,
  TrendingUp,
  TrendingDown,
  Calculate,
} from '@mui/icons-material';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import stoxTheme from './stoxTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, ChartTooltip, Legend);

const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

const formatPercent = (value) => `${value.toFixed(1)}%`;

// Generate mock cost policy data
const generateCostData = () => {
  const materials = [
    { id: 'MAT-001', name: 'Hydraulic Pump', category: 'Mechanical' },
    { id: 'MAT-002', name: 'Bearing Assembly', category: 'Mechanical' },
    { id: 'MAT-003', name: 'Control Module', category: 'Electronics' },
    { id: 'MAT-004', name: 'Valve Kit', category: 'Mechanical' },
    { id: 'MAT-005', name: 'Gasket Set', category: 'Consumables' },
    { id: 'MAT-006', name: 'Sensor Array', category: 'Electronics' },
    { id: 'MAT-007', name: 'Motor Drive', category: 'Electronics' },
    { id: 'MAT-008', name: 'Filter Element', category: 'Consumables' },
    { id: 'MAT-009', name: 'Seal Kit', category: 'Consumables' },
    { id: 'MAT-010', name: 'Coupling Assembly', category: 'Mechanical' },
    { id: 'MAT-011', name: 'Shaft Bearing', category: 'Mechanical' },
    { id: 'MAT-012', name: 'Pressure Gauge', category: 'Instruments' },
  ];

  const costTypes = ['Standard', 'Moving Avg', 'FIFO', 'LIFO'];
  const policyStatus = ['Active', 'Pending Review', 'Needs Update'];

  return materials.map((mat, idx) => {
    const standardCost = Math.floor(100 + Math.random() * 900);
    const movingAvgCost = standardCost * (0.9 + Math.random() * 0.2);
    const lastPurchaseCost = standardCost * (0.85 + Math.random() * 0.3);
    const variance = ((movingAvgCost - standardCost) / standardCost * 100);
    const costType = costTypes[idx % 4];
    const status = Math.abs(variance) > 10 ? policyStatus[2] : Math.abs(variance) > 5 ? policyStatus[1] : policyStatus[0];

    return {
      id: mat.id,
      material: mat.name,
      category: mat.category,
      costType,
      standardCost,
      movingAvgCost: movingAvgCost.toFixed(2),
      lastPurchaseCost: lastPurchaseCost.toFixed(2),
      variance: variance.toFixed(1),
      varianceNum: variance,
      status,
      holdingCostPct: (15 + Math.random() * 10).toFixed(1),
      orderingCost: Math.floor(25 + Math.random() * 75),
      leadTimeDays: Math.floor(5 + Math.random() * 25),
      minOrderQty: Math.floor(10 + Math.random() * 90) * 10,
      safetyStockDays: Math.floor(5 + Math.random() * 15),
      reorderPoint: Math.floor(50 + Math.random() * 150),
      economicOrderQty: Math.floor(100 + Math.random() * 400),
      lastReviewDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextReviewDate: new Date(Date.now() + Math.floor(30 + Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      annualVolume: Math.floor(1000 + Math.random() * 9000),
      annualValue: Math.floor(50000 + Math.random() * 500000),
    };
  });
};

const CostPolicyEngine = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    costType: 'all',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const costData = generateCostData();
      setData(costData);

      // Calculate summary metrics
      const totalItems = costData.length;
      const activeCount = costData.filter(d => d.status === 'Active').length;
      const pendingCount = costData.filter(d => d.status === 'Pending Review').length;
      const needsUpdateCount = costData.filter(d => d.status === 'Needs Update').length;
      const avgVariance = costData.reduce((sum, d) => sum + Math.abs(d.varianceNum), 0) / totalItems;
      const totalAnnualValue = costData.reduce((sum, d) => sum + d.annualValue, 0);

      setMetrics({
        totalItems,
        activeCount,
        pendingCount,
        needsUpdateCount,
        avgVariance: avgVariance.toFixed(1),
        totalAnnualValue,
      });
      setLoading(false);
    }, 500);
  };

  const filteredData = data.filter(row => {
    if (filters.status !== 'all' && row.status !== filters.status) return false;
    if (filters.category !== 'all' && row.category !== filters.category) return false;
    if (filters.costType !== 'all' && row.costType !== filters.costType) return false;
    return true;
  });

  const columns = [
    { field: 'id', headerName: 'Material ID', minWidth: 110, flex: 0.8 },
    { field: 'material', headerName: 'Material', minWidth: 160, flex: 1.2 },
    { field: 'category', headerName: 'Category', minWidth: 120, flex: 0.9 },
    { field: 'costType', headerName: 'Cost Method', minWidth: 120, flex: 0.9 },
    {
      field: 'standardCost',
      headerName: 'Std Cost',
      minWidth: 100,
      flex: 0.8,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => `$${params.value}`,
    },
    {
      field: 'movingAvgCost',
      headerName: 'Moving Avg',
      minWidth: 110,
      flex: 0.8,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => `$${params.value}`,
    },
    {
      field: 'variance',
      headerName: 'Variance',
      minWidth: 110,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const val = parseFloat(params.value);
        return (
          <Chip
            icon={val > 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
            label={`${val > 0 ? '+' : ''}${params.value}%`}
            size="small"
            color={Math.abs(val) <= 5 ? 'success' : Math.abs(val) <= 10 ? 'warning' : 'error'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
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
          color={params.value === 'Active' ? 'success' : params.value === 'Pending Review' ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'holdingCostPct',
      headerName: 'Holding %',
      minWidth: 100,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => `${params.value}%`,
    },
    {
      field: 'economicOrderQty',
      headerName: 'EOQ',
      minWidth: 90,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'lastReviewDate',
      headerName: 'Last Review',
      minWidth: 110,
      flex: 0.8,
    },
  ];

  const handleRowClick = (params) => {
    setSelectedItem(params.row);
  };

  const renderDetailView = () => {
    if (!selectedItem) return null;

    const costBreakdownData = {
      labels: ['Standard', 'Moving Avg', 'Last Purchase'],
      datasets: [{
        data: [
          selectedItem.standardCost,
          parseFloat(selectedItem.movingAvgCost),
          parseFloat(selectedItem.lastPurchaseCost),
        ],
        backgroundColor: ['#0891b2', '#10b981', '#f59e0b'],
      }],
    };

    const policyMetricsData = {
      labels: ['Holding Cost', 'Ordering Cost', 'Safety Stock', 'Lead Time'],
      datasets: [{
        label: 'Policy Parameters',
        data: [
          parseFloat(selectedItem.holdingCostPct),
          selectedItem.orderingCost / 10,
          selectedItem.safetyStockDays,
          selectedItem.leadTimeDays,
        ],
        backgroundColor: ['#0891b2', '#10b981', '#0078d4', '#f59e0b'],
      }],
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
            {selectedItem.material} - Cost Policy Details
          </Typography>
          <Chip
            label={selectedItem.status}
            size="small"
            color={selectedItem.status === 'Active' ? 'success' : selectedItem.status === 'Pending Review' ? 'warning' : 'error'}
          />
        </Box>

        <Grid container spacing={2}>
          {/* Cost Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #0891b2' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Standard Cost</Typography>
                <Typography variant="h5" fontWeight={700}>${selectedItem.standardCost}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #10b981' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Moving Average</Typography>
                <Typography variant="h5" fontWeight={700}>${selectedItem.movingAvgCost}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Last Purchase</Typography>
                <Typography variant="h5" fontWeight={700}>${selectedItem.lastPurchaseCost}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: parseFloat(selectedItem.variance) > 5 ? '4px solid #ef4444' : '4px solid #10b981' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Cost Variance</Typography>
                <Typography variant="h5" fontWeight={700} color={parseFloat(selectedItem.variance) > 5 ? 'error.main' : 'success.main'}>
                  {parseFloat(selectedItem.variance) > 0 ? '+' : ''}{selectedItem.variance}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Policy Parameters */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Policy Parameters</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Holding Cost %</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.holdingCostPct}%</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Ordering Cost</Typography>
                    <Typography variant="body1" fontWeight={600}>${selectedItem.orderingCost}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Lead Time</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.leadTimeDays} days</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Min Order Qty</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.minOrderQty}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Safety Stock Days</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.safetyStockDays} days</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Reorder Point</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.reorderPoint}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Economic Order Qty</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.economicOrderQty}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Next Review</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.nextReviewDate}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Cost Comparison Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Cost Comparison</Typography>
                <Box sx={{ height: 200 }}>
                  <Bar
                    data={costBreakdownData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Cost ($)' } },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Annual Volume & Value */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Annual Metrics</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Annual Volume</Typography>
                    <Typography variant="h6" fontWeight={600}>{selectedItem.annualVolume.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Annual Value</Typography>
                    <Typography variant="h6" fontWeight={600}>{formatCurrency(selectedItem.annualValue)}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Review History */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Review Schedule</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Last Review</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.lastReviewDate}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Next Review</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.nextReviewDate}</Typography>
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
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
              STOX.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Cost Policy Engine
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ borderColor: 'divider' }}>
            Back
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <CostIcon sx={{ fontSize: 32, color: '#16a34a' }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="#16a34a">
              Cost Policy Engine
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage cost methods, inventory policies, and EOQ parameters
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
                    <Typography variant="caption" color="text.secondary">Active Policies</Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">{metrics.activeCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Pending Review</Typography>
                    <Typography variant="h5" fontWeight={700} color="warning.main">{metrics.pendingCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #ef4444' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Needs Update</Typography>
                    <Typography variant="h5" fontWeight={700} color="error.main">{metrics.needsUpdateCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #0078d4' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Avg Variance</Typography>
                    <Typography variant="h5" fontWeight={700}>{metrics.avgVariance}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #06b6d4' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Annual Value</Typography>
                    <Typography variant="h5" fontWeight={700}>{formatCurrency(metrics.totalAnnualValue)}</Typography>
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
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Pending Review">Pending Review</MenuItem>
                  <MenuItem value="Needs Update">Needs Update</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Category</InputLabel>
                <Select value={filters.category} label="Category" onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="Mechanical">Mechanical</MenuItem>
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Consumables">Consumables</MenuItem>
                  <MenuItem value="Instruments">Instruments</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Cost Method</InputLabel>
                <Select value={filters.costType} label="Cost Method" onChange={(e) => setFilters({ ...filters, costType: e.target.value })}>
                  <MenuItem value="all">All Methods</MenuItem>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Moving Avg">Moving Avg</MenuItem>
                  <MenuItem value="FIFO">FIFO</MenuItem>
                  <MenuItem value="LIFO">LIFO</MenuItem>
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

export default CostPolicyEngine;
