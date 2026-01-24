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
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  AttachMoney,
  Group,
  Warning,
  CheckCircle,
  Info,
  Speed,
  AccountBalance,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  Upload,
  Save,
  Send,
  Visibility,
  Lock,
  CompareArrows,
  Edit,
  Delete,
  Settings,
  Add,
} from '@mui/icons-material';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';

const StoreDeployment = ({ onBack, darkMode = false }) => {
  const getColors = (darkMode) => ({
    primary: darkMode ? '#4da6ff' : '#0a6ed1',
    text: darkMode ? '#e6edf3' : '#1e293b',
    textSecondary: darkMode ? '#8b949e' : '#64748b',
    background: darkMode ? '#0d1117' : '#f8fbfd',
    paper: darkMode ? '#161b22' : '#ffffff',
    cardBg: darkMode ? '#21262d' : '#ffffff',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  });

  const colors = getColors(darkMode);
  const tileConfig = getTileDataConfig('store-deployment');
  const [sopData, setSOPData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedView, setSelectedView] = useState('daily');
  const [selectedRows, setSelectedRows] = useState([]);
  const [consensusDialogOpen, setConsensusDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchSOPData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSOPData = async () => {
    setLoading(true);
    try {
      // Store Deployment Optimizer data - Arizona Beverages
      const mockData = [
        {
          id: 'SD001',
          store_location: 'COSTCO-TRACY-CA',
          product_id: 'AZ-GT-001',
          product_name: 'AZ GREEN TEA $1 24PK 20OZ TALLBOY',
          current_stock: 450,
          safety_stock: 300,
          min_level: 300,
          max_level: 800,
          forecast_demand: 520,
          replenishment_qty: 350,
          transfer_order: 'TO-AZ-89234',
          priority: 'High',
          dc_location: 'AZ-DC-KEASBEY',
          dc_available_stock: 125000,
          transit_time: 3,
          last_replenishment_date: '2024-02-01',
          stock_cover_days: 6.2,
          forecast_horizon: '7 days',
          status: 'warning',
        },
        {
          id: 'SD002',
          store_location: 'WALMART-LA-001',
          product_id: 'AZ-GT-001',
          product_name: 'AZ GREEN TEA $1 24PK 20OZ TALLBOY',
          current_stock: 120,
          safety_stock: 250,
          min_level: 250,
          max_level: 750,
          forecast_demand: 480,
          replenishment_qty: 630,
          transfer_order: 'TO-AZ-89241',
          priority: 'Critical',
          dc_location: 'AZ-DC-TRACY',
          dc_available_stock: 82000,
          transit_time: 1,
          last_replenishment_date: '2024-01-28',
          stock_cover_days: 1.8,
          forecast_horizon: '7 days',
          status: 'critical',
        },
        {
          id: 'SD003',
          store_location: 'SAMS-CLUB-CHI',
          product_id: 'AZ-AP-001',
          product_name: 'AZ ARNOLD PALMER BLACK 4PK GALLON PECO',
          current_stock: 680,
          safety_stock: 200,
          min_level: 200,
          max_level: 600,
          forecast_demand: 380,
          replenishment_qty: 0,
          transfer_order: '',
          priority: 'Low',
          dc_location: 'AZ-DC-CHICAGO',
          dc_available_stock: 152000,
          transit_time: 1,
          last_replenishment_date: '2024-01-30',
          stock_cover_days: 12.5,
          forecast_horizon: '7 days',
          status: 'ok',
        },
        {
          id: 'SD004',
          store_location: 'PUBLIX-JAX-001',
          product_id: 'AZ-LT-001',
          product_name: 'AZ LEMON TEA NP 24PK 22OZ CAN',
          current_stock: 220,
          safety_stock: 180,
          min_level: 180,
          max_level: 550,
          forecast_demand: 410,
          replenishment_qty: 330,
          transfer_order: 'TO-AZ-89235',
          priority: 'Medium',
          dc_location: 'AZ-DC-ATLANTA',
          dc_available_stock: 152000,
          transit_time: 2,
          last_replenishment_date: '2024-02-03',
          stock_cover_days: 3.8,
          forecast_horizon: '7 days',
          status: 'warning',
        },
        {
          id: 'SD005',
          store_location: 'AMAZON-MIA-RFD2',
          product_id: 'AZ-MM-001',
          product_name: 'AZ MUCHO MANGO 4PK GALLON',
          current_stock: 80,
          safety_stock: 150,
          min_level: 150,
          max_level: 500,
          forecast_demand: 280,
          replenishment_qty: 420,
          transfer_order: 'TO-AZ-89248',
          priority: 'Critical',
          dc_location: 'AZ-DC-ATLANTA',
          dc_available_stock: 42000,
          transit_time: 1,
          last_replenishment_date: '2024-01-25',
          stock_cover_days: 2.0,
          forecast_horizon: '7 days',
          status: 'critical',
        },
        {
          id: 'SD006',
          store_location: 'WINCO-SEA-132',
          product_id: 'AZ-FP-001',
          product_name: 'AZ FRUIT PUNCH 12PK 11OZ CAN SUITCS PECO',
          current_stock: 340,
          safety_stock: 200,
          min_level: 200,
          max_level: 500,
          forecast_demand: 320,
          replenishment_qty: 160,
          transfer_order: 'TO-AZ-89250',
          priority: 'Medium',
          dc_location: 'AZ-DC-TRACY',
          dc_available_stock: 95000,
          transit_time: 2,
          last_replenishment_date: '2024-02-02',
          stock_cover_days: 7.5,
          forecast_horizon: '7 days',
          status: 'ok',
        },
        {
          id: 'SD007',
          store_location: 'CVS-DALLAS-001',
          product_id: 'AZ-HV-001',
          product_name: 'AZ HARD VARIETY 2-12PK 12OZ CAN 6/3/3',
          current_stock: 95,
          safety_stock: 120,
          min_level: 120,
          max_level: 400,
          forecast_demand: 180,
          replenishment_qty: 205,
          transfer_order: 'TO-AZ-89252',
          priority: 'High',
          dc_location: 'AZ-DC-DALLAS',
          dc_available_stock: 38000,
          transit_time: 1,
          last_replenishment_date: '2024-01-29',
          stock_cover_days: 3.8,
          forecast_horizon: '7 days',
          status: 'warning',
        },
      ];

      setSOPData(mockData);

      // Calculate metrics
      const totalReplenishment = mockData.reduce((sum, item) => sum + item.replenishment_qty, 0);
      const totalCurrentStock = mockData.reduce((sum, item) => sum + item.current_stock, 0);
      const totalForecastDemand = mockData.reduce((sum, item) => sum + item.forecast_demand, 0);
      const criticalStores = mockData.filter(item => item.priority === 'Critical').length;
      const lowStockStores = mockData.filter(item => item.current_stock < item.safety_stock).length;
      const avgStockCover = mockData.reduce((sum, item) => sum + item.stock_cover_days, 0) / mockData.length;

      setMetrics({
        total_replenishment: totalReplenishment,
        total_current_stock: totalCurrentStock,
        total_forecast_demand: totalForecastDemand,
        critical_stores: criticalStores,
        low_stock_stores: lowStockStores,
        avg_stock_cover: avgStockCover,
      });
    } catch (error) {
      console.error('Error fetching S&OP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (row) => {
    setSelectedProduct(row);
  };

  const handleBuildConsensus = (row) => {
    setSelectedProduct(row);
    setConsensusDialogOpen(true);
  };

  const columns = [
    {
      field: 'store_location',
      headerName: 'Store Location',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'product_name',
      headerName: 'Product',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {params.row.product_id}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'current_stock',
      headerName: 'Current Stock',
      width: 120,
      align: 'right',
      renderCell: (params) => {
        const belowSafety = params.value < params.row.safety_stock;
        return (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: belowSafety ? 'error.main' : 'text.primary'
            }}
          >
            {params.value}
          </Typography>
        );
      },
    },
    {
      field: 'safety_stock',
      headerName: 'Safety Stock',
      width: 110,
      align: 'right',
      valueFormatter: (params) => params.value,
    },
    {
      field: 'min_level',
      headerName: 'Min Level',
      width: 100,
      align: 'right',
      valueFormatter: (params) => params.value,
    },
    {
      field: 'max_level',
      headerName: 'Max Level',
      width: 100,
      align: 'right',
      valueFormatter: (params) => params.value,
    },
    {
      field: 'forecast_demand',
      headerName: 'Forecast Demand',
      width: 130,
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'replenishment_qty',
      headerName: 'Replenishment Qty',
      width: 140,
      align: 'right',
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: params.value > 0 ? 'primary.main' : 'text.secondary'
          }}
        >
          {params.value > 0 ? params.value : '-'}
        </Typography>
      ),
    },
    {
      field: 'transfer_order',
      headerName: 'Transfer Order',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: params.value ? 500 : 400 }}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 110,
      align: 'center',
      renderCell: (params) => {
        const priorityColors = {
          Critical: 'error',
          High: 'warning',
          Medium: 'info',
          Low: 'success',
        };
        return (
          <Chip
            label={params.value}
            size="small"
            color={priorityColors[params.value]}
            variant="filled"
          />
        );
      },
    },
    {
      field: 'dc_location',
      headerName: 'DC Location',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'dc_available_stock',
      headerName: 'DC Stock',
      width: 100,
      align: 'right',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'transit_time',
      headerName: 'Transit Time',
      width: 110,
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value} days
        </Typography>
      ),
    },
    {
      field: 'stock_cover_days',
      headerName: 'Stock Cover',
      width: 110,
      align: 'center',
      renderCell: (params) => {
        const isLow = params.value < 3;
        const isOk = params.value >= 3 && params.value < 7;
        const color = isLow ? 'error' : isOk ? 'warning' : 'success';
        return (
          <Chip
            label={`${params.value} days`}
            size="small"
            color={color}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'last_replenishment_date',
      headerName: 'Last Replenishment',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      align: 'center',
      renderCell: (params) => {
        const statusColors = {
          ok: 'success',
          warning: 'warning',
          critical: 'error',
        };
        const statusIcons = {
          ok: <CheckCircle sx={{ fontSize: 16 }} />,
          warning: <Warning sx={{ fontSize: 16 }} />,
          critical: <Warning sx={{ fontSize: 16 }} />,
        };
        return (
          <Chip
            icon={statusIcons[params.value]}
            label={params.value.toUpperCase()}
            size="small"
            color={statusColors[params.value]}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleViewDetails(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error">
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{
      p: 3,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      bgcolor: colors.background,
    }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
          >
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              STOX.AI
            </Link>
            <Typography sx={{ color: colors.primary }} variant="body1" fontWeight={600}>
              Store Deployment Optimizer
            </Typography>
          </Breadcrumbs>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchSOPData} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              variant="outlined"
              size="small"
            >
              Back
            </Button>
          </Stack>
        </Stack>

        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>
              Store Deployment Optimizer
            </Typography>
            <DataSourceChip dataType={tileConfig.dataType} />
          </Stack>
          <Typography variant="subtitle1" sx={{ color: colors.textSecondary }}>
            DRP Execution
          </Typography>
        </Box>
      </Box>

      {/* Action Bar */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
        <ToggleButtonGroup
          value={selectedView}
          exclusive
          onChange={(e, newView) => newView && setSelectedView(newView)}
          size="small"
        >
          <ToggleButton value="monthly">Monthly</ToggleButton>
          <ToggleButton value="quarterly">Quarterly</ToggleButton>
          <ToggleButton value="weekly">Weekly</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<Upload />} variant="outlined" size="small">
            Import
          </Button>
          <Button startIcon={<Download />} variant="outlined" size="small">
            Export
          </Button>
          <Button startIcon={<Save />} variant="outlined" size="small">
            Save Draft
          </Button>
          <Button startIcon={<Send />} variant="contained" size="small" color="success">
            Submit for Approval
          </Button>
          <Button startIcon={<Settings />} variant="outlined" size="small">
            Configure
          </Button>
          <Button startIcon={<Refresh />} variant="contained" size="small" onClick={fetchSOPData}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      {metrics && (
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: `1px solid ${colors.border}`, bgcolor: colors.cardBg }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Speed sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Chip size="small" label="Replenishment" color="primary" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Replenishment
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text, fontSize: '1.25rem' }}>
                  {metrics.total_replenishment}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: `1px solid ${colors.border}`, bgcolor: colors.cardBg }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <AccountBalance sx={{ fontSize: 18, color: 'success.main' }} />
                  <Chip size="small" label="Stock" color="success" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Current Stock
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text, fontSize: '1.25rem' }}>
                  {metrics.total_current_stock}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: `1px solid ${colors.border}`, bgcolor: colors.cardBg }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Info sx={{ fontSize: 18, color: 'info.main' }} />
                  <Chip size="small" label="Demand" color="info" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Forecast Demand
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text, fontSize: '1.25rem' }}>
                  {metrics.total_forecast_demand}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: `1px solid ${colors.border}`, bgcolor: colors.cardBg }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: 'error.main' }} />
                  <Chip size="small" label="Critical" color="error" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Critical Stores
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text, fontSize: '1.25rem' }}>
                  {metrics.critical_stores}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: `1px solid ${colors.border}`, bgcolor: colors.cardBg }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: 'warning.main' }} />
                  <Chip size="small" label="Low Stock" color="warning" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Low Stock Stores
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text, fontSize: '1.25rem' }}>
                  {metrics.low_stock_stores}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: `1px solid ${colors.border}`, bgcolor: colors.cardBg }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 18, color: 'secondary.main' }} />
                  <Chip size="small" label="Coverage" color="secondary" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Avg Stock Cover Days
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text, fontSize: '1.25rem' }}>
                  {metrics.avg_stock_cover.toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content */}
      <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        {/* Table Toolbar */}
        <Box sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.cardBg
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              sx={{ textTransform: 'none' }}
            >
              New Plan
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Delete />}
              disabled={selectedRows.length === 0}
              sx={{ textTransform: 'none' }}
            >
              Delete Selected ({selectedRows.length})
            </Button>
          </Box>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {sopData.length} plans total
          </Typography>
        </Box>

        {/* Planning Table */}
        <DataGrid
            rows={sopData}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={setSelectedRows}
            rowSelectionModel={selectedRows}
            slots={{
              toolbar: GridToolbar,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              '& .MuiDataGrid-row:hover': {
                backgroundColor: darkMode ? alpha(colors.primary, 0.08) : 'rgba(0, 0, 0, 0.04)',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${colors.border}`,
                color: colors.text,
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: colors.cardBg,
                borderBottom: `2px solid ${colors.border}`,
                color: colors.text,
              },
              '& .MuiDataGrid-columnHeaderTitle': { color: colors.text },
              '& .MuiDataGrid-row': { bgcolor: colors.paper },
              '& .MuiDataGrid-footerContainer': { borderColor: colors.border, bgcolor: colors.cardBg },
              '& .MuiTablePagination-root': { color: colors.text },
              '& .MuiCheckbox-root': { color: colors.textSecondary },
              '& .MuiDataGrid-toolbarContainer': { color: colors.text },
            }}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 25,
                },
              },
            }}
          />
      </Paper>

      {/* Consensus Building Dialog */}
      <Dialog
        open={consensusDialogOpen}
        onClose={() => setConsensusDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Build Consensus - {selectedProduct?.product_name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Statistical Forecast"
                value={selectedProduct?.statistical_forecast || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Sales Forecast"
                value={selectedProduct?.sales_forecast || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Consensus Demand"
                value={selectedProduct?.consensus_demand || 0}
                type="number"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Comments / Justification"
                placeholder="Provide reasoning for consensus decision..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConsensusDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary">Save Consensus</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreDeployment;
