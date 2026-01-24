import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Grid,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Tooltip,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  AvatarGroup,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
} from '@mui/material';
import stoxService from '../../services/stoxService';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as VisibilityIcon,
  PlayArrow as ExecuteIcon,
  Build as MitigateIcon,
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  GridOn as GridViewIcon,
  ViewList as TableViewIcon,
  Map as MapViewIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Store as StoreIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

// Utility Functions
const formatCurrency = (value) => {
  if (!value) return '$0';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

const formatNumber = (value) => {
  if (!value && value !== 0) return '0';
  return value.toLocaleString();
};

const getStatusColor = (status) => {
  const colorMap = {
    'Critical': 'error',
    'High': 'warning',
    'Medium': 'info',
    'Low': 'success',
  };
  return colorMap[status] || 'default';
};

const getStatusIcon = (status) => {
  const iconMap = {
    'Critical': <ErrorIcon fontSize="small" />,
    'High': <WarningIcon fontSize="small" />,
    'Medium': <InfoIcon fontSize="small" />,
    'Low': <CheckCircleIcon fontSize="small" />,
  };
  return iconMap[status] || <InfoIcon fontSize="small" />;
};

const getHealthColor = (score) => {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#42A5F5';
  if (score >= 40) return '#FF9800';
  return '#F44336';
};

const formatLeadTime = (hours) => {
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
  return `${hours} hours`;
};

// TabPanel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`shortage-tabpanel-${index}`}
      aria-labelledby={`shortage-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Dark mode color helper
const getColors = (darkMode) => ({
  background: darkMode ? '#1a1a1a' : '#ffffff',
  paper: darkMode ? '#242424' : '#ffffff',
  text: {
    primary: darkMode ? '#ffffff' : '#000000',
    secondary: darkMode ? '#b0b0b0' : '#666666',
  },
  border: darkMode ? '#333333' : 'rgba(0,0,0,0.08)',
  hover: darkMode ? '#2a2a2a' : '#f5f5f5',
});

const ShortageDetector = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [materialRisk, setMaterialRisk] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);

  // Get tile data config for data source indicator
  const tileConfig = getTileDataConfig('shortage-detector');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 0) {
        // Tab 1: Critical Alerts - Remove severity filter to get all alerts
        const result = await stoxService.getShortageAlerts({ limit: 100 });
        const alerts = result.alerts || [];
        setData(alerts.map((item, idx) => ({
          id: idx + 1,
          sku: item.material_id || 'N/A',
          productName: `${item.material_id} - ${item.abc_class} Class`,
          category: item.abc_class || 'Unknown',
          location: item.plant || 'Unknown',
          currentStock: Math.round(item.current_stock || 0),
          reorderPoint: Math.round(item.stoxai_rop_qty || 0),
          avgDailySales: Math.round(item.avg_daily_demand || 0),
          daysUntilStockout: Math.round(item.days_until_stockout || 0),
          status: item.severity || 'Unknown',
          estimatedLoss: Math.round(item.current_stock_value || 0),
          supplier: item.vendor || 'Unknown',
          leadTime: Math.round((item.avg_lead_time || 2) * 24), // Convert days to hours
          inTransit: Math.round(item.stoxai_safety_stock_qty * 0.3 || 0),
          healthScore: Math.min(100, Math.round((item.vendor_otif_pct || 0.04) * 1000)),
        })));
      } else if (activeTab === 1) {
        // Tab 2: 3-Month Forecast
        const result = await stoxService.getStockoutPredictions({ months: 3 });
        console.log('Predictions API result:', result);
        // API returns {predictions: [...]}
        const predData = result.predictions || [];
        console.log('Predictions data:', predData);
        console.log('Predictions length:', predData.length);
        setPredictions(predData);
      } else if (activeTab === 2) {
        // Tab 3: Material Deep Dive
        const result = await stoxService.getMaterialRiskSummary();
        setMaterialRisk(result.materials || []);
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
      field: 'sku',
      headerName: 'SKU',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'productName',
      headerName: 'Product',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {params.row.category}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          icon={getStatusIcon(params.value)}
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          variant="filled"
        />
      ),
    },
    {
      field: 'currentStock',
      headerName: 'Current Stock',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" fontWeight="medium">
            {params.value} units
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(params.value / params.row.reorderPoint) * 100}
            sx={{
              mt: 0.5,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#E1E4E8',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getHealthColor((params.value / params.row.reorderPoint) * 100),
              },
            }}
          />
        </Box>
      ),
    },
    {
      field: 'daysUntilStockout',
      headerName: 'Days to Stockout',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value} days`}
          size="small"
          sx={{
            backgroundColor: params.value <= 3 ? '#FFEBEE' : params.value <= 7 ? '#FFF3E0' : '#E8F5E9',
            color: params.value <= 3 ? '#C62828' : params.value <= 7 ? '#E65100' : '#2E7D32',
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: 'estimatedLoss',
      headerName: 'Est. Revenue Loss',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="error.main">
            {formatCurrency(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            if stockout
          </Typography>
        </Box>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {params.value.includes('Warehouse') ? (
            <InventoryIcon fontSize="small" color="action" />
          ) : params.value.includes('Store') ? (
            <StoreIcon fontSize="small" color="action" />
          ) : (
            <ShippingIcon fontSize="small" color="action" />
          )}
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: 'inTransit',
      headerName: 'In Transit',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Tooltip title={`Lead time: ${formatLeadTime(params.row.leadTime)}`}>
          <Typography variant="body2" color={params.value > 0 ? 'success.main' : 'text.secondary'}>
            {params.value} units
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'healthScore',
      headerName: 'Health Score',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ width: '100%', px: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            <Typography variant="caption" fontWeight="bold">
              {params.value}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{
              mt: 0.5,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#E1E4E8',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getHealthColor(params.value),
                borderRadius: 3,
              },
            }}
          />
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedItem(params.row);
                setDetailsOpen(true);
              }}
              sx={{ color: '#1a5a9e' }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Execute Reorder">
            <IconButton
              size="small"
              onClick={() => handleExecute(params.row)}
              sx={{ color: '#4CAF50' }}
            >
              <ExecuteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mitigate Risk">
            <IconButton
              size="small"
              onClick={() => handleMitigate(params.row)}
              sx={{ color: '#FF9800' }}
            >
              <MitigateIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handleExecute = (row) => {
    alert(`Executing reorder for ${row.productName}`);
  };

  const handleMitigate = (row) => {
    alert(`Opening mitigation plan for ${row.productName}`);
  };

  // Row styling based on status
  const getRowClassName = (params) => {
    const statusColors = {
      'Critical': 'critical-row',
      'High': 'high-row',
      'Medium': 'medium-row',
      'Low': 'low-row',
    };
    return statusColors[params.row.status] || '';
  };

  // Summary Statistics
  const criticalCount = data.filter(item => item.status === 'Critical').length;
  const highCount = data.filter(item => item.status === 'High').length;
  const totalPotentialLoss = data.reduce((sum, item) => sum + item.estimatedLoss, 0);

  return (
    <Box sx={{
      p: 3,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      maxWidth: '100vw',
      bgcolor: colors.background,
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
            Shortage Detector
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
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
                Shortage Detector
              </Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="subtitle1" color="text.secondary">
              Real-time stockout prevention and inventory monitoring
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="table">
              <TableViewIcon fontSize="small" sx={{ mr: 0.5 }} />
              Table
            </ToggleButton>
            <ToggleButton value="grid">
              <GridViewIcon fontSize="small" sx={{ mr: 0.5 }} />
              Grid
            </ToggleButton>
            <ToggleButton value="map">
              <MapViewIcon fontSize="small" sx={{ mr: 0.5 }} />
              Map
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              bgcolor: colors.paper,
              border: darkMode ? `1px solid ${colors.border}` : 'none',
            }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Critical Alerts
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
            <Card sx={{
              bgcolor: colors.paper,
              border: darkMode ? `1px solid ${colors.border}` : 'none',
            }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      High Priority
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {highCount}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#FFF3E0', color: '#E65100' }}>
                    <WarningIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              bgcolor: colors.paper,
              border: darkMode ? `1px solid ${colors.border}` : 'none',
            }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Potential Loss
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="error.main">
                      {formatCurrency(totalPotentialLoss)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#FFEBEE', color: '#C62828' }}>
                    <TrendingDownIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              bgcolor: colors.paper,
              border: darkMode ? `1px solid ${colors.border}` : 'none',
            }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Items
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {data.length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#E3F2FD', color: '#1a5a9e' }}>
                    <InventoryIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alert Banner */}
        {criticalCount > 0 && activeTab === 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Critical Shortages Detected</AlertTitle>
            {criticalCount} item(s) require immediate attention to prevent stockouts
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
        <Paper sx={{
          mb: 2,
          bgcolor: colors.paper,
          border: darkMode ? `1px solid ${colors.border}` : 'none',
        }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Critical Alerts" />
            <Tab label="3-Month Forecast" />
            <Tab label="Material Deep Dive" />
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
        minHeight: 500,
        bgcolor: colors.paper,
        border: darkMode ? `1px solid ${colors.border}` : 'none',
      }}>
        <DataGrid
          autoHeight={false}
          sx={{
            height: '100vh',
            width: '100%',
            border: darkMode ? `1px solid ${colors.border}` : '1px solid rgba(0,0,0,0.08)',
            bgcolor: colors.paper,
            color: colors.text.primary,
            '& .MuiDataGrid-cell': {
              color: colors.text.primary,
              borderColor: colors.border,
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: darkMode ? '#1e1e1e' : '#fafafa',
              color: colors.text.primary,
              borderColor: colors.border,
            },
            '& .MuiDataGrid-columnHeader': {
              color: colors.text.primary,
            },
            '& .MuiDataGrid-footerContainer': {
              bgcolor: darkMode ? '#1e1e1e' : '#fafafa',
              borderColor: colors.border,
            },
            '& .MuiDataGrid-row': {
              bgcolor: colors.paper,
              '&:hover': {
                backgroundColor: colors.hover,
              },
            },
            '& .MuiDataGrid-row.Mui-selected': {
              bgcolor: darkMode ? '#2a2a2a' : '#f0f0f0',
              '&:hover': {
                bgcolor: darkMode ? '#333333' : '#e0e0e0',
              },
            },
            '& .MuiCheckbox-root': {
              color: darkMode ? '#b0b0b0' : 'inherit',
            },
            '& .MuiTablePagination-root': {
              color: colors.text.primary,
            },
            '& .MuiIconButton-root': {
              color: colors.text.primary,
            },
            '& .critical-row': {
              borderLeft: '4px solid #F44336',
              backgroundColor: darkMode ? '#3a1a1a' : '#FFEBEE',
            },
            '& .high-row': {
              borderLeft: '4px solid #FF9800',
              backgroundColor: darkMode ? '#3a2a1a' : '#FFF3E0',
            },
            '& .medium-row': {
              borderLeft: '4px solid #42A5F5',
            },
            '& .low-row': {
              borderLeft: '4px solid #4CAF50',
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

      {/* Tab 2: 3-Month Forecast */}
      <TabPanel value={activeTab} index={1}>
        <Paper sx={{
          p: 3,
          bgcolor: colors.paper,
          border: darkMode ? `1px solid ${colors.border}` : 'none',
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <LinearProgress sx={{ width: '50%' }} />
            </Box>
          ) : predictions.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No prediction data available
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={predictions.map((item, idx) => ({ id: idx + 1, ...item }))}
              sx={{
                border: darkMode ? `1px solid ${colors.border}` : '1px solid rgba(0,0,0,0.08)',
                bgcolor: colors.paper,
                color: colors.text.primary,
                '& .MuiDataGrid-cell': {
                  color: colors.text.primary,
                  borderColor: colors.border,
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: darkMode ? '#1e1e1e' : '#fafafa',
                  color: colors.text.primary,
                  borderColor: colors.border,
                },
                '& .MuiDataGrid-columnHeader': {
                  color: colors.text.primary,
                },
                '& .MuiDataGrid-footerContainer': {
                  bgcolor: darkMode ? '#1e1e1e' : '#fafafa',
                  borderColor: colors.border,
                },
                '& .MuiDataGrid-row': {
                  bgcolor: colors.paper,
                  '&:hover': {
                    backgroundColor: colors.hover,
                  },
                },
                '& .MuiTablePagination-root': {
                  color: colors.text.primary,
                },
                '& .MuiIconButton-root': {
                  color: colors.text.primary,
                },
              }}
              columns={[
                {
                  field: 'material_id',
                  headerName: 'Material ID',
                  flex: 1,
                  minWidth: 150,
                  renderCell: (params) => (
                    <Typography variant="body2" fontWeight="bold">
                      {params.value}
                    </Typography>
                  ),
                },
                {
                  field: 'plant',
                  headerName: 'Plant',
                  width: 120,
                  renderCell: (params) => (
                    <Chip
                      icon={<LocationIcon />}
                      label={params.value}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  ),
                },
                {
                  field: 'month',
                  headerName: 'Month',
                  width: 130,
                  renderCell: (params) => (
                    <Chip
                      label={params.value}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  ),
                },
                {
                  field: 's4_safety_stock',
                  headerName: 'S4 Safety Stock',
                  width: 160,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatNumber(Math.round(params.value || 0))}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        current
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'ibp_safety_stock',
                  headerName: 'IBP Safety Stock',
                  width: 170,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatNumber(Math.round(params.value || 0))}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        IBP plan
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'stoxai_safety_stock',
                  headerName: 'StoxAI Safety Stock',
                  width: 190,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatNumber(Math.round(params.value || 0))}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        AI optimized
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'stoxai_reason',
                  headerName: 'StoxAI Reason',
                  flex: 2,
                  minWidth: 300,
                  renderCell: (params) => (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {params.value}
                    </Typography>
                  ),
                },
              ]}
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              slots={{ toolbar: GridToolbar }}
            />
          )}
        </Paper>
      </TabPanel>

      {/* Tab 3: Material Deep Dive */}
      <TabPanel value={activeTab} index={2}>
        <Paper sx={{
          p: 3,
          bgcolor: colors.paper,
          border: darkMode ? `1px solid ${colors.border}` : 'none',
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <LinearProgress sx={{ width: '50%' }} />
            </Box>
          ) : (
            <DataGrid
              rows={materialRisk.map((item, idx) => ({ id: idx + 1, ...item }))}
              columns={[
                {
                  field: 'material_id',
                  headerName: 'Material ID',
                  flex: 1,
                  minWidth: 150,
                  renderCell: (params) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InventoryIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="bold">
                        {params.value}
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'plant',
                  headerName: 'Plant',
                  width: 120,
                  renderCell: (params) => (
                    <Chip
                      icon={<LocationIcon />}
                      label={params.value}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  ),
                },
                {
                  field: 'risk_level',
                  headerName: 'Risk Level',
                  width: 140,
                  align: 'center',
                  headerAlign: 'center',
                  renderCell: (params) => {
                    const riskColors = {
                      'A': { bg: '#FFEBEE', text: '#C62828', label: 'High (A)' },
                      'B': { bg: '#FFF3E0', text: '#E65100', label: 'Medium (B)' },
                      'C': { bg: '#E8F5E9', text: '#2E7D32', label: 'Low (C)' },
                    };
                    const config = riskColors[params.value] || { bg: '#F5F5F5', text: '#616161', label: params.value };
                    return (
                      <Chip
                        label={config.label}
                        size="small"
                        sx={{
                          backgroundColor: config.bg,
                          color: config.text,
                          fontWeight: 700,
                        }}
                      />
                    );
                  },
                },
                {
                  field: 'working_capital',
                  headerName: 'Working Capital',
                  width: 160,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {formatCurrency(params.value)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        invested
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'annual_cost',
                  headerName: 'Annual Cost',
                  width: 160,
                  align: 'right',
                  headerAlign: 'right',
                  renderCell: (params) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(params.value)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        per year
                      </Typography>
                    </Box>
                  ),
                },
                {
                  field: 'potential_savings',
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
              ]}
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: { sortModel: [{ field: 'potential_savings', sort: 'desc' }] },
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

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Shortage Details</Typography>
            {selectedItem && (
              <Chip
                icon={getStatusIcon(selectedItem.status)}
                label={selectedItem.status}
                color={getStatusColor(selectedItem.status)}
                size="small"
              />
            )}
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  SKU
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedItem.sku}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Product Name
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedItem.productName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Current Stock
                </Typography>
                <Typography variant="body1">{selectedItem.currentStock} units</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Reorder Point
                </Typography>
                <Typography variant="body1">{selectedItem.reorderPoint} units</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Days Until Stockout
                </Typography>
                <Typography variant="body1" color="error">
                  {selectedItem.daysUntilStockout} days
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Estimated Revenue Loss
                </Typography>
                <Typography variant="body1" color="error" fontWeight="bold">
                  {formatCurrency(selectedItem.estimatedLoss)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Supplier
                </Typography>
                <Typography variant="body1">{selectedItem.supplier}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Lead Time
                </Typography>
                <Typography variant="body1">{formatLeadTime(selectedItem.leadTime)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  In Transit
                </Typography>
                <Typography variant="body1" color="success.main">
                  {selectedItem.inTransit} units
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Health Score
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LinearProgress
                    variant="determinate"
                    value={selectedItem.healthScore}
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#E1E4E8',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getHealthColor(selectedItem.healthScore),
                        borderRadius: 4,
                      },
                    }}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    {selectedItem.healthScore}%
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<ExecuteIcon />}>
            Execute Reorder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            px: 3,
            py: 2,
            zIndex: 1000,
            boxShadow: 3,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" fontWeight="medium">
              {selectedRows.length} item(s) selected
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Button variant="contained" size="small" startIcon={<ExecuteIcon />}>
              Bulk Reorder
            </Button>
            <Button variant="outlined" size="small" startIcon={<MitigateIcon />}>
              Mitigate All
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default ShortageDetector;
