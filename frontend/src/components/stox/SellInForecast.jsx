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

const SellInForecast = ({ onBack }) => {
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
      // Sell-In Forecast data
      const mockData = [
        {
          id: 'SIF001',
          // Base columns from Input Data
          product_sku: 'SKU-7891',
          sales_date: '2024-W06',
          sales_qty: 3200,

          // Additional columns to ADD (11 total)
          customer_id: 'CUST-TARGET-001',
          week: '2024-W06',
          sell_through_forecast: 3100,
          partner_inventory: 8500,
          target_inventory: 10000,
          replenishment_qty: 1500,
          order_status: 'In Transit',
          pipeline_status: 'On Track',
          order_number: 'SO-45892',
          shipment_date: '2024-02-12',
          expected_delivery_date: '2024-02-17',

          // Supporting fields
          product_id: 'SKU-7891',
          product_name: 'Madison Reed Premium Color Kit',
          customer_name: 'Target Corporation',
          status: 'active',
        },
        {
          id: 'SIF002',
          product_sku: 'SKU-7891',
          sales_date: '2024-W07',
          sales_qty: 0,
          customer_id: 'CUST-AMAZON-001',
          week: '2024-W07',
          sell_through_forecast: 2900,
          partner_inventory: 3200,
          target_inventory: 8000,
          replenishment_qty: 4800,
          order_status: 'Planned',
          pipeline_status: 'Delayed',
          order_number: 'SO-45901',
          shipment_date: '2024-02-19',
          expected_delivery_date: '2024-02-22',
          product_id: 'SKU-7891',
          product_name: 'Madison Reed Premium Color Kit',
          customer_name: 'Amazon',
          status: 'planned',
        },
        {
          id: 'SIF003',
          product_sku: 'SKU-4523',
          sales_date: '2024-W06',
          sales_qty: 1820,
          customer_id: 'CUST-WALMART-001',
          week: '2024-W06',
          sell_through_forecast: 1850,
          partner_inventory: 950,
          target_inventory: 6000,
          replenishment_qty: 5050,
          order_status: 'Processing',
          pipeline_status: 'Critical',
          order_number: 'SO-45887',
          shipment_date: '2024-02-10',
          expected_delivery_date: '2024-02-14',
          product_id: 'SKU-4523',
          product_name: 'Color Reviving Gloss',
          customer_name: 'Walmart',
          status: 'critical',
        },
        {
          id: 'SIF004',
          product_sku: 'SKU-4523',
          sales_date: '2024-W07',
          sales_qty: 0,
          customer_id: 'CUST-TARGET-001',
          week: '2024-W07',
          sell_through_forecast: 2100,
          partner_inventory: 12500,
          target_inventory: 9000,
          replenishment_qty: 0,
          order_status: 'Not Required',
          pipeline_status: 'On Track',
          order_number: '',
          shipment_date: '',
          expected_delivery_date: '',
          product_id: 'SKU-4523',
          product_name: 'Color Reviving Gloss',
          customer_name: 'Target Corporation',
          status: 'ok',
        },
        {
          id: 'SIF005',
          product_sku: 'SKU-9021',
          sales_date: '2024-W07',
          sales_qty: 0,
          customer_id: 'CUST-AMAZON-001',
          week: '2024-W07',
          sell_through_forecast: 920,
          partner_inventory: 4200,
          target_inventory: 5000,
          replenishment_qty: 800,
          order_status: 'Planned',
          pipeline_status: 'On Track',
          order_number: 'SO-45903',
          shipment_date: '2024-02-20',
          expected_delivery_date: '2024-02-23',
          product_id: 'SKU-9021',
          product_name: 'Root Retouch Kit',
          customer_name: 'Amazon',
          status: 'planned',
        },
      ];

      setSOPData(mockData);

      // Calculate metrics
      const totalReplenishmentQty = mockData.reduce((sum, item) => sum + item.replenishment_qty, 0);
      const totalSellThroughForecast = mockData.reduce((sum, item) => sum + item.sell_through_forecast, 0);
      const totalPartnerInventory = mockData.reduce((sum, item) => sum + item.partner_inventory, 0);
      const criticalOrders = mockData.filter(item => item.pipeline_status === 'Critical').length;
      const delayedOrders = mockData.filter(item => item.pipeline_status === 'Delayed').length;
      const activeOrders = mockData.filter(item => item.order_status === 'In Transit' || item.order_status === 'Processing').length;

      setMetrics({
        total_replenishment_qty: totalReplenishmentQty,
        total_sell_through_forecast: totalSellThroughForecast,
        total_partner_inventory: totalPartnerInventory,
        critical_orders: criticalOrders,
        delayed_orders: delayedOrders,
        active_orders: activeOrders,
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
      field: 'product_name',
      headerName: 'Product',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {params.row.product_sku}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'customer_name',
      headerName: 'Customer',
      width: 160,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {params.row.customer_id}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'week',
      headerName: 'Week',
      width: 100,
      align: 'center',
    },
    {
      field: 'sell_through_forecast',
      headerName: 'Sell-Through Forecast',
      width: 150,
      align: 'right',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'partner_inventory',
      headerName: 'Partner Inventory',
      width: 140,
      align: 'right',
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value?.toLocaleString()}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Target: {params.row.target_inventory?.toLocaleString()}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'replenishment_qty',
      headerName: 'Replenishment Qty',
      width: 140,
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: params.value > 0 ? 'primary.main' : 'text.secondary' }}>
          {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'order_status',
      headerName: 'Order Status',
      width: 130,
      align: 'center',
      renderCell: (params) => {
        const statusColors = {
          'In Transit': 'info',
          'Processing': 'warning',
          'Planned': 'default',
          'Not Required': 'success',
        };
        return (
          <Chip
            label={params.value}
            size="small"
            color={statusColors[params.value] || 'default'}
          />
        );
      },
    },
    {
      field: 'pipeline_status',
      headerName: 'Pipeline Status',
      width: 130,
      align: 'center',
      renderCell: (params) => {
        const statusColors = {
          'On Track': 'success',
          'Delayed': 'warning',
          'Critical': 'error',
        };
        const statusIcons = {
          'On Track': <CheckCircle sx={{ fontSize: 16 }} />,
          'Delayed': <Warning sx={{ fontSize: 16 }} />,
          'Critical': <Warning sx={{ fontSize: 16 }} />,
        };
        return (
          <Chip
            icon={statusIcons[params.value]}
            label={params.value}
            size="small"
            color={statusColors[params.value]}
          />
        );
      },
    },
    {
      field: 'order_number',
      headerName: 'Order Number',
      width: 120,
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'shipment_date',
      headerName: 'Shipment Date',
      width: 120,
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'expected_delivery_date',
      headerName: 'Expected Delivery',
      width: 130,
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
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
              Sell-In Forecast Manager
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
            Sell-In Forecast Manager
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Shipment Planning
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
                  <Send sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Chip size="small" label="Replenish" color="primary" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Replenishment Qty
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_replenishment_qty.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Speed sx={{ fontSize: 18, color: 'info.main' }} />
                  <Chip size="small" label="Forecast" color="info" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Sell-Through Forecast
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_sell_through_forecast.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <AccountBalance sx={{ fontSize: 18, color: 'success.main' }} />
                  <Chip size="small" label="Inventory" color="success" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Partner Inventory
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_partner_inventory.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: 'error.main' }} />
                  <Chip size="small" label="Alert" color="error" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Critical Orders
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.critical_orders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: 'warning.main' }} />
                  <Chip size="small" label="Delayed" color="warning" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Delayed Orders
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.delayed_orders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 18, color: 'info.main' }} />
                  <Chip size="small" label="Active" color="info" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Active Orders
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.active_orders}
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

      {/* Product Details Dialog */}
      <Dialog
        open={consensusDialogOpen}
        onClose={() => setConsensusDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Sell-In Forecast Details - {selectedProduct?.product_name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer"
                value={selectedProduct?.customer_name || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Week"
                value={selectedProduct?.week || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Sell-Through Forecast"
                value={selectedProduct?.sell_through_forecast?.toLocaleString() || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Partner Inventory"
                value={selectedProduct?.partner_inventory?.toLocaleString() || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Target Inventory"
                value={selectedProduct?.target_inventory?.toLocaleString() || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Replenishment Qty"
                value={selectedProduct?.replenishment_qty?.toLocaleString() || 0}
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Order Number"
                value={selectedProduct?.order_number || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Shipment Date"
                value={selectedProduct?.shipment_date || ''}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes"
                placeholder="Add notes about this shipment plan..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConsensusDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellInForecast;
