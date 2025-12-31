import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  AlertTitle,
  Breadcrumbs,
  Link,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import stoxService from '../../services/stoxService';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warehouse as WarehouseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Map as MapIcon,
  GridOn as GridViewIcon,
  ViewList as TableViewIcon,
} from '@mui/icons-material';

// Utility Functions
const formatNumber = (value) => {
  return value.toLocaleString();
};

const getStockLevelColor = (percentage) => {
  if (percentage >= 80) return '#4CAF50';
  if (percentage >= 50) return '#42A5F5';
  if (percentage >= 30) return '#FF9800';
  return '#F44336';
};

const getStockLevelStatus = (percentage) => {
  if (percentage >= 80) return 'Optimal';
  if (percentage >= 50) return 'Normal';
  if (percentage >= 30) return 'Low';
  return 'Critical';
};

const formatCurrency = (value) => {
  if (!value) return '$0';
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

// TabPanel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`heatmap-tabpanel-${index}`}
      aria-labelledby={`heatmap-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const InventoryHeatmap = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [locationMetrics, setLocationMetrics] = useState([]);
  const [plantPerformance, setPlantPerformance] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 0) {
        // Tab 1: Plant Distribution
        const result = await stoxService.getInventoryDistribution();
        const locations = result.locations || [];
        setData(locations.map((item, idx) => ({
          id: idx + 1,
          locationCode: item.plant || 'N/A',
          locationName: `Plant ${item.plant}`,
          region: 'N/A',
          category: 'All',
          currentStock: item.total_materials || 0,
          capacity: item.total_materials * 1.5 || 0,
          stockPercentage: Math.min(100, Math.round((item.total_materials / (item.total_materials * 1.5)) * 100)),
          availableSpace: item.total_materials * 0.5 || 0,
          turnoverRate: 75,
          lastReplenishment: new Date().toISOString(),
          workingCapital: item.total_working_capital || 0,
        })));
      } else if (activeTab === 1) {
        // Tab 2: Working Capital
        const result = await stoxService.getLocationMetrics();
        setLocationMetrics(result.metrics || []);
      } else if (activeTab === 2) {
        // Tab 3: Performance Matrix
        const result = await stoxService.getPlantPerformance();
        setPlantPerformance(result.plants || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // DataGrid Columns Configuration
  const columns = [
    {
      field: 'locationCode',
      headerName: 'Location Code',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'locationName',
      headerName: 'Location',
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <LocationIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="body2">{params.value}</Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.region} Region
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'stockPercentage',
      headerName: 'Stock Level',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const status = getStockLevelStatus(params.value);
        const color = getStockLevelColor(params.value);

        return (
          <Box sx={{ width: '100%', px: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 0.5 }}>
              <Typography variant="caption" fontWeight="bold">
                {params.value}%
              </Typography>
              <Chip
                label={status}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: `${color}20`,
                  color: color,
                  fontWeight: 600
                }}
              />
            </Stack>
            <LinearProgress
              variant="determinate"
              value={params.value}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: '#E1E4E8',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'currentStock',
      headerName: 'Current Stock',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            of {formatNumber(params.row.capacity)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'availableSpace',
      headerName: 'Available Space',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" color="success.main" fontWeight="medium">
          {formatNumber(params.value)} units
        </Typography>
      ),
    },
    {
      field: 'turnoverRate',
      headerName: 'Turnover Rate',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <TrendingUpIcon fontSize="small" color="success" />
          <Typography variant="body2" fontWeight="bold">
            {params.value}%
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'temperature',
      headerName: 'Temp (°C)',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}°C`}
          size="small"
          sx={{
            bgcolor: params.value > 25 ? '#FFF3E0' : '#E3F2FD',
            color: params.value > 25 ? '#E65100' : '#1565C0',
          }}
        />
      ),
    },
    {
      field: 'humidity',
      headerName: 'Humidity (%)',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}%
        </Typography>
      ),
    },
    {
      field: 'lastReplenishment',
      headerName: 'Last Replenishment',
      width: 160,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(params.value).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </Typography>
      ),
    },
  ];

  // Row styling based on stock level
  const getRowClassName = (params) => {
    const percentage = params.row.stockPercentage;
    if (percentage >= 80) return 'optimal-row';
    if (percentage >= 50) return 'normal-row';
    if (percentage >= 30) return 'low-row';
    return 'critical-row';
  };

  // Summary Statistics
  const optimalCount = data.filter(item => item.stockPercentage >= 80).length;
  const criticalCount = data.filter(item => item.stockPercentage < 30).length;
  const avgStockLevel = data.length > 0
    ? Math.round(data.reduce((sum, item) => sum + item.stockPercentage, 0) / data.length)
    : 0;
  const totalCapacity = data.reduce((sum, item) => sum + item.capacity, 0);

  return (
    <Box sx={{
      p: 3,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      maxWidth: '100vw'
    }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body1"
            onClick={onBack}
            sx={{
              textDecoration: 'none',
              color: 'text.primary',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            STOX.AI
          </Link>
          <Typography color="primary" variant="body1" fontWeight={600}>
            Inventory Heatmap
          </Typography>
        </Breadcrumbs>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            size="small"
            sx={{ borderColor: 'divider' }}
          >
            Back
          </Button>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
              Inventory Heatmap
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Visual stock distribution across warehouses and stores
            </Typography>
          </Box>
        </Stack>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Optimal Locations
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {optimalCount}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}>
                    <CheckCircleIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Critical Locations
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {criticalCount}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#FFEBEE', color: '#C62828' }}>
                    <ErrorIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Avg Stock Level
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {avgStockLevel}%
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#E3F2FD', color: '#2b88d8' }}>
                    <InventoryIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Capacity
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatNumber(totalCapacity)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#F3E5F5', color: '#7B1FA2' }}>
                    <WarehouseIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alert Banner */}
        {criticalCount > 0 && activeTab === 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Critical Stock Levels Detected</AlertTitle>
            {criticalCount} location(s) have critically low stock levels requiring immediate attention
          </Alert>
        )}

        {/* Error Banner */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error Loading Data</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Plant Distribution" />
            <Tab label="Working Capital" />
            <Tab label="Performance Matrix" />
          </Tabs>
        </Paper>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {/* Tab 1: DataGrid */}
      <Paper sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%',
        height: 'calc(100vh - 520px)',
        minHeight: 500
      }}>
        <DataGrid
          autoHeight={false}
          sx={{
            height: '100vh',
            width: '100%',
            border: 'none',
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f5f5f5',
            },
            '& .optimal-row': {
              borderLeft: '4px solid #4CAF50',
              backgroundColor: '#F1F8F4',
            },
            '& .normal-row': {
              borderLeft: '4px solid #42A5F5',
            },
            '& .low-row': {
              borderLeft: '4px solid #FF9800',
              backgroundColor: '#FFF8E1',
            },
            '& .critical-row': {
              borderLeft: '4px solid #F44336',
              backgroundColor: '#FFEBEE',
            },
          }}
          rows={data}
          columns={columns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
          rowSelectionModel={selectedRows}
          getRowClassName={getRowClassName}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
        />
      </Paper>
      </TabPanel>

      {/* Tab 2: Working Capital */}
      <TabPanel value={activeTab} index={1}>
        <Paper sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <LinearProgress sx={{ width: '50%' }} />
            </Box>
          ) : (
            <DataGrid
              rows={locationMetrics.map((item, idx) => ({ id: idx + 1, ...item }))}
              columns={[
                {
                  field: 'plant',
                  headerName: 'Plant',
                  width: 140,
                  renderCell: (params) => (
                    <Chip
                      icon={<LocationIcon />}
                      label={params.value}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  ),
                },
                {
                  field: 'total_materials',
                  headerName: 'Total Materials',
                  width: 150,
                  align: 'center',
                  headerAlign: 'center',
                  renderCell: (params) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                      <InventoryIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="bold">
                        {formatNumber(params.value)}
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'total_working_capital',
                  headerName: 'Working Capital',
                  flex: 1,
                  minWidth: 180,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {formatCurrency(params.value)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        total invested
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'avg_working_capital',
                  headerName: 'Avg WC per SKU',
                  flex: 1,
                  minWidth: 170,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(params.value)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        per material
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'total_savings',
                  headerName: 'Potential Savings',
                  flex: 1,
                  minWidth: 180,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrency(params.value)}
                      </Typography>
                      <Typography variant="caption" color="success.dark">
                        opportunity
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'savings_percentage',
                  headerName: 'Savings %',
                  width: 140,
                  align: 'center',
                  headerAlign: 'center',
                  renderCell: (params) => (
                    <Box sx={{ width: '100%' }}>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={params.value >= 15 ? 'success.main' : params.value >= 10 ? 'warning.main' : 'text.primary'}
                      >
                        {params.value?.toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(params.value || 0, 100)}
                        sx={{
                          mt: 0.5,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: '#E1E4E8',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: params.value >= 15 ? '#2E7D32' : params.value >= 10 ? '#E65100' : '#2b88d8',
                          },
                        }}
                      />
                    </Box>
                  ),
                },
              ]}
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: { sortModel: [{ field: 'total_working_capital', sort: 'desc' }] },
              }}
              slots={{ toolbar: GridToolbar }}
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            />
          )}
        </Paper>
      </TabPanel>

      {/* Tab 3: Performance Matrix */}
      <TabPanel value={activeTab} index={2}>
        <Paper sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <LinearProgress sx={{ width: '50%' }} />
            </Box>
          ) : (
            <DataGrid
              rows={plantPerformance.map((item, idx) => ({ id: idx + 1, ...item }))}
              columns={[
                {
                  field: 'plant',
                  headerName: 'Plant',
                  width: 140,
                  renderCell: (params) => (
                    <Chip
                      icon={<LocationIcon />}
                      label={params.value}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  ),
                },
                {
                  field: 's4_working_capital',
                  headerName: 'S4 WC',
                  width: 150,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(params.value)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        S4/HANA
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'ibp_working_capital',
                  headerName: 'IBP WC',
                  width: 150,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(params.value)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        IBP plan
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'stoxai_working_capital',
                  headerName: 'StoxAI WC',
                  width: 160,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrency(params.value)}
                      </Typography>
                      <Typography variant="caption" color="success.dark">
                        AI optimized
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 's4_annual_cost',
                  headerName: 'S4 Annual Cost',
                  width: 160,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(params.value)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        S4/HANA
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'ibp_annual_cost',
                  headerName: 'IBP Annual Cost',
                  width: 160,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(params.value)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        IBP plan
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'stoxai_annual_cost',
                  headerName: 'StoxAI Annual Cost',
                  width: 180,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrency(params.value)}
                      </Typography>
                      <Typography variant="caption" color="success.dark">
                        AI optimized
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'working_capital_savings',
                  headerName: 'WC Savings',
                  flex: 1,
                  minWidth: 160,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrency(params.value)}
                      </Typography>
                      <Typography variant="caption" color="success.dark">
                        saved
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'annual_cost_savings',
                  headerName: 'Cost Savings',
                  flex: 1,
                  minWidth: 160,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrency(params.value)}
                      </Typography>
                      <Typography variant="caption" color="success.dark">
                        per year
                      </Typography>
                    </Box>
                  ),
                },
              ]}
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              slots={{ toolbar: GridToolbar }}
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            />
          )}
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default InventoryHeatmap;
