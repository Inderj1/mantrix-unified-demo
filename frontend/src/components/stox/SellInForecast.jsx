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
import TimeGranularitySelector from '../common/TimeGranularitySelector';

// Dark Mode Color Helper
const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const SellInForecast = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [sopData, setSOPData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [granularity, setGranularity] = useState('daily');
  const [selectedRows, setSelectedRows] = useState([]);
  const [consensusDialogOpen, setConsensusDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchSOPData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granularity]);

  // Helper function to generate data based on granularity
  const generateDataByGranularity = (granularity) => {
    // Arizona Beverages Products
    const products = [
      { sku: 'AZ-GT-001', name: 'AZ GREEN TEA $1 24PK 20OZ TALLBOY' },
      { sku: 'AZ-AP-001', name: 'AZ ARNOLD PALMER BLACK 4PK GALLON PECO' },
      { sku: 'AZ-LT-001', name: 'AZ LEMON TEA NP 24PK 22OZ CAN' },
    ];

    // Arizona Beverages Customers (from BigQuery)
    const customers = [
      { id: 'CUST-COSTCO-001', name: 'COSTCO DEPOT TRACY' },
      { id: 'CUST-AMAZON-001', name: 'AMAZON - CMH2' },
      { id: 'CUST-WALMART-001', name: 'Walmart' },
      { id: 'CUST-PUBLIX-001', name: 'PUBLIX JACKSONVILLE WAREHOUSE' },
    ];

    const data = [];
    let idCounter = 1;
    let orderCounter = 45890;

    const orderStatuses = ['In Transit', 'Planned', 'Processing', 'Shipped', 'Delivered'];
    const pipelineStatuses = ['On Track', 'Delayed', 'Critical', 'At Risk'];

    if (granularity === 'daily') {
      // Generate 7 days of shipment data
      for (let day = 1; day <= 7; day++) {
        products.forEach((product, pIdx) => {
          customers.forEach((customer, cIdx) => {
            if (Math.random() > 0.3) { // Not every day has shipments
              const forecast = 400 + (pIdx * 500) + (cIdx * 300);
              const inventory = Math.floor(forecast * (1.5 + Math.random() * 2));
              const targetInv = Math.floor(forecast * (2 + Math.random()));
              const replenish = Math.max(0, targetInv - inventory);

              data.push({
                id: `SIF${String(idCounter++).padStart(3, '0')}`,
                product_sku: product.sku,
                sales_date: `2024-02-${String(day).padStart(2, '0')}`,
                week: `2024-W06`,
                month: '2024-02',
                sales_qty: replenish > 0 ? replenish : 0,
                customer_id: customer.id,
                sell_through_forecast: forecast,
                partner_inventory: inventory,
                target_inventory: targetInv,
                replenishment_qty: replenish,
                order_status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
                pipeline_status: replenish > targetInv * 0.5 ? 'Critical' : pipelineStatuses[Math.floor(Math.random() * pipelineStatuses.length)],
                order_number: replenish > 0 ? `SO-${orderCounter++}` : '',
                shipment_date: `2024-02-${String(day).padStart(2, '0')}`,
                expected_delivery_date: `2024-02-${String(Math.min(day + 3, 28)).padStart(2, '0')}`,
                product_id: product.sku,
                product_name: product.name,
                customer_name: customer.name,
                status: replenish === 0 ? 'ok' : replenish > targetInv * 0.5 ? 'critical' : 'active',
              });
            }
          });
        });
      }
    } else if (granularity === 'weekly') {
      // Generate 4 weeks of shipment data
      for (let week = 3; week <= 6; week++) {
        products.forEach((product, pIdx) => {
          customers.forEach((customer, cIdx) => {
            const forecast = 2800 + (pIdx * 3500) + (cIdx * 2100);
            const inventory = Math.floor(forecast * (1.5 + Math.random() * 2));
            const targetInv = Math.floor(forecast * (2 + Math.random()));
            const replenish = Math.max(0, targetInv - inventory);

            data.push({
              id: `SIF${String(idCounter++).padStart(3, '0')}`,
              product_sku: product.sku,
              sales_date: `2024-W${String(week).padStart(2, '0')}`,
              week: `2024-W${String(week).padStart(2, '0')}`,
              month: '2024-02',
              sales_qty: replenish > 0 ? replenish : 0,
              customer_id: customer.id,
              sell_through_forecast: forecast,
              partner_inventory: inventory,
              target_inventory: targetInv,
              replenishment_qty: replenish,
              order_status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
              pipeline_status: replenish > targetInv * 0.5 ? 'Critical' : pipelineStatuses[Math.floor(Math.random() * pipelineStatuses.length)],
              order_number: replenish > 0 ? `SO-${orderCounter++}` : '',
              shipment_date: week === 6 ? `2024-02-${10 + cIdx}` : '',
              expected_delivery_date: week === 6 ? `2024-02-${15 + cIdx}` : '',
              product_id: product.sku,
              product_name: product.name,
              customer_name: customer.name,
              status: replenish === 0 ? 'ok' : replenish > targetInv * 0.5 ? 'critical' : 'planned',
            });
          });
        });
      }
    } else if (granularity === 'monthly') {
      // Generate 3 months of shipment data
      for (let month = 12; month <= 2; month++) {
        const monthLabel = month > 10 ? `2023-${month}` : `2024-0${month}`;

        products.forEach((product, pIdx) => {
          customers.forEach((customer, cIdx) => {
            const forecast = 12000 + (pIdx * 15000) + (cIdx * 9000);
            const inventory = Math.floor(forecast * (1.5 + Math.random() * 2));
            const targetInv = Math.floor(forecast * (2 + Math.random()));
            const replenish = Math.max(0, targetInv - inventory);

            data.push({
              id: `SIF${String(idCounter++).padStart(3, '0')}`,
              product_sku: product.sku,
              sales_date: monthLabel,
              week: monthLabel,
              month: monthLabel,
              sales_qty: replenish > 0 ? replenish : 0,
              customer_id: customer.id,
              sell_through_forecast: forecast,
              partner_inventory: inventory,
              target_inventory: targetInv,
              replenishment_qty: replenish,
              order_status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
              pipeline_status: replenish > targetInv * 0.5 ? 'Critical' : pipelineStatuses[Math.floor(Math.random() * pipelineStatuses.length)],
              order_number: replenish > 0 ? `SO-${orderCounter++}` : '',
              shipment_date: monthLabel,
              expected_delivery_date: monthLabel,
              product_id: product.sku,
              product_name: product.name,
              customer_name: customer.name,
              status: replenish === 0 ? 'ok' : replenish > targetInv * 0.5 ? 'critical' : 'planned',
            });
          });
        });
      }
    }

    return data;
  };

  const fetchSOPData = async () => {
    setLoading(true);
    try {
      // Generate data based on current granularity
      const mockData = generateDataByGranularity(granularity);
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
      flex: 1,
      minWidth: 200,
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
      flex: 0.8,
      minWidth: 150,
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
      height: '100vh',
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
        <TimeGranularitySelector
          value={granularity}
          onChange={setGranularity}
        />
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
