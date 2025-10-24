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

const StoreDeployment = ({ onBack }) => {
  const [sopData, setSOPData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedView, setSelectedView] = useState('monthly');
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
      // Store Deployment Optimizer data
      const mockData = [
        {
          id: 'SD001',
          store_location: 'NYC-001',
          product_id: 'SKU-7891',
          product_name: 'Madison Reed Premium Color Kit',
          current_stock: 45,
          safety_stock: 30,
          min_level: 30,
          max_level: 80,
          forecast_demand: 52,
          replenishment_qty: 35,
          transfer_order: 'TO-89234',
          priority: 'High',
          dc_location: 'DC-East',
          dc_available_stock: 12500,
          transit_time: 2,
          last_replenishment_date: '2024-02-01',
          stock_cover_days: 6.2,
          forecast_horizon: '7 days',
          status: 'warning',
        },
        {
          id: 'SD002',
          store_location: 'LA-045',
          product_id: 'SKU-7891',
          product_name: 'Madison Reed Premium Color Kit',
          current_stock: 12,
          safety_stock: 25,
          min_level: 25,
          max_level: 75,
          forecast_demand: 48,
          replenishment_qty: 63,
          transfer_order: 'TO-89241',
          priority: 'Critical',
          dc_location: 'DC-West',
          dc_available_stock: 8200,
          transit_time: 1,
          last_replenishment_date: '2024-01-28',
          stock_cover_days: 1.8,
          forecast_horizon: '7 days',
          status: 'critical',
        },
        {
          id: 'SD003',
          store_location: 'CHI-023',
          product_id: 'SKU-4523',
          product_name: 'Color Reviving Gloss',
          current_stock: 68,
          safety_stock: 20,
          min_level: 20,
          max_level: 60,
          forecast_demand: 38,
          replenishment_qty: 0,
          transfer_order: '',
          priority: 'Low',
          dc_location: 'DC-Central',
          dc_available_stock: 15200,
          transit_time: 2,
          last_replenishment_date: '2024-01-30',
          stock_cover_days: 12.5,
          forecast_horizon: '7 days',
          status: 'ok',
        },
        {
          id: 'SD004',
          store_location: 'NYC-001',
          product_id: 'SKU-4523',
          product_name: 'Color Reviving Gloss',
          current_stock: 22,
          safety_stock: 18,
          min_level: 18,
          max_level: 55,
          forecast_demand: 41,
          replenishment_qty: 33,
          transfer_order: 'TO-89235',
          priority: 'Medium',
          dc_location: 'DC-East',
          dc_available_stock: 15200,
          transit_time: 2,
          last_replenishment_date: '2024-02-03',
          stock_cover_days: 3.8,
          forecast_horizon: '7 days',
          status: 'warning',
        },
        {
          id: 'SD005',
          store_location: 'MIA-012',
          product_id: 'SKU-9021',
          product_name: 'Root Retouch Kit',
          current_stock: 8,
          safety_stock: 15,
          min_level: 15,
          max_level: 50,
          forecast_demand: 28,
          replenishment_qty: 42,
          transfer_order: 'TO-89248',
          priority: 'Critical',
          dc_location: 'DC-South',
          dc_available_stock: 4200,
          transit_time: 1,
          last_replenishment_date: '2024-01-25',
          stock_cover_days: 2.0,
          forecast_horizon: '7 days',
          status: 'critical',
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
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'product_name',
      headerName: 'Product',
      width: 220,
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
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
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
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              STOX.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
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
          <Typography variant="h4" fontWeight={700}>
            Store Deployment Optimizer
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
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
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Speed sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Chip size="small" label="Replenishment" color="primary" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Replenishment
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_replenishment}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <AccountBalance sx={{ fontSize: 18, color: 'success.main' }} />
                  <Chip size="small" label="Stock" color="success" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Current Stock
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_current_stock}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Info sx={{ fontSize: 18, color: 'info.main' }} />
                  <Chip size="small" label="Demand" color="info" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Forecast Demand
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_forecast_demand}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: 'error.main' }} />
                  <Chip size="small" label="Critical" color="error" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Critical Stores
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.critical_stores}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: 'warning.main' }} />
                  <Chip size="small" label="Low Stock" color="warning" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Low Stock Stores
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.low_stock_stores}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 18, color: 'secondary.main' }} />
                  <Chip size="small" label="Coverage" color="secondary" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Avg Stock Cover Days
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.avg_stock_cover.toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content */}
      <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Table Toolbar */}
        <Box sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E1E4E8',
          backgroundColor: '#fafafa'
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
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid rgba(224, 224, 224, 1)',
              },
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
