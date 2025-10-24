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

const SellThroughAnalytics = ({ onBack }) => {
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
      // Simulated Sell-Through Analytics data with Input Data + Additional Columns
      const mockData = [
        {
          id: 'STA001',
          // Base columns from Input Data
          product_sku: 'SKU-7891',
          sales_date: '2024-W06',
          sales_qty: 3200,
          inventory_ending: 8500,
          stockout_flag: 'N',

          // Additional columns to ADD
          partner: 'Target',
          week: '2024-W06',
          sell_through_rate_pct: 27.3,
          days_of_supply: 18.5,
          alert_status: 'OK',
          partner_location: 'Target DC - Minneapolis',
          replenishment_lead_time: 5,
          target_service_level: 95,
          actual_service_level: 96.8,

          // Supporting fields
          product_id: 'SKU-7891',
          product_name: 'Madison Reed Premium Color Kit',
          status: 'ok',
        },
        {
          id: 'STA002',
          product_sku: 'SKU-7891',
          sales_date: '2024-W06',
          sales_qty: 2850,
          inventory_ending: 3200,
          stockout_flag: 'N',
          partner: 'Amazon',
          week: '2024-W06',
          sell_through_rate_pct: 47.1,
          days_of_supply: 7.8,
          alert_status: 'Warning',
          partner_location: 'Amazon FC - Phoenix',
          replenishment_lead_time: 3,
          target_service_level: 98,
          actual_service_level: 97.2,
          product_id: 'SKU-7891',
          product_name: 'Madison Reed Premium Color Kit',
          status: 'warning',
        },
        {
          id: 'STA003',
          product_sku: 'SKU-4523',
          sales_date: '2024-W06',
          sales_qty: 1820,
          inventory_ending: 950,
          stockout_flag: 'Y',
          partner: 'Walmart',
          week: '2024-W06',
          sell_through_rate_pct: 65.7,
          days_of_supply: 3.6,
          alert_status: 'Critical',
          partner_location: 'Walmart DC - Bentonville',
          replenishment_lead_time: 4,
          target_service_level: 95,
          actual_service_level: 88.3,
          product_id: 'SKU-4523',
          product_name: 'Color Reviving Gloss',
          status: 'critical',
        },
        {
          id: 'STA004',
          product_sku: 'SKU-4523',
          sales_date: '2024-W06',
          sales_qty: 2100,
          inventory_ending: 12500,
          stockout_flag: 'N',
          partner: 'Target',
          week: '2024-W06',
          sell_through_rate_pct: 14.4,
          days_of_supply: 41.4,
          alert_status: 'OK',
          partner_location: 'Target DC - Minneapolis',
          replenishment_lead_time: 5,
          target_service_level: 95,
          actual_service_level: 98.1,
          product_id: 'SKU-4523',
          product_name: 'Color Reviving Gloss',
          status: 'ok',
        },
        {
          id: 'STA005',
          product_sku: 'SKU-9021',
          sales_date: '2024-W06',
          sales_qty: 890,
          inventory_ending: 4200,
          stockout_flag: 'N',
          partner: 'Amazon',
          week: '2024-W06',
          sell_through_rate_pct: 17.5,
          days_of_supply: 32.8,
          alert_status: 'OK',
          partner_location: 'Amazon FC - Dallas',
          replenishment_lead_time: 3,
          target_service_level: 98,
          actual_service_level: 99.1,
          product_id: 'SKU-9021',
          product_name: 'Root Retouch Kit',
          status: 'ok',
        },
      ];

      setSOPData(mockData);

      // Calculate metrics for Sell-Through Analytics
      const totalSalesQty = mockData.reduce((sum, item) => sum + item.sales_qty, 0);
      const totalInventory = mockData.reduce((sum, item) => sum + item.inventory_ending, 0);
      const avgSellThroughRate = mockData.reduce((sum, item) => sum + item.sell_through_rate_pct, 0) / mockData.length;
      const avgDaysOfSupply = mockData.reduce((sum, item) => sum + item.days_of_supply, 0) / mockData.length;
      const criticalAlerts = mockData.filter(item => item.alert_status === 'Critical').length;
      const warningAlerts = mockData.filter(item => item.alert_status === 'Warning').length;
      const stockouts = mockData.filter(item => item.stockout_flag === 'Y').length;
      const avgServiceLevel = mockData.reduce((sum, item) => sum + item.actual_service_level, 0) / mockData.length;

      setMetrics({
        total_sales_qty: totalSalesQty,
        total_inventory: totalInventory,
        avg_sell_through_rate: avgSellThroughRate,
        avg_days_of_supply: avgDaysOfSupply,
        critical_alerts: criticalAlerts,
        warning_alerts: warningAlerts,
        stockout_count: stockouts,
        avg_service_level: avgServiceLevel,
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
      field: 'partner',
      headerName: 'Partner',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Amazon' ? 'warning' : params.value === 'Target' ? 'error' : 'info'}
        />
      ),
    },
    {
      field: 'product_id',
      headerName: 'Product ID',
      width: 110,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {params.row.product_name}
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
      field: 'sales_qty',
      headerName: 'Sales Qty',
      width: 110,
      align: 'right',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'inventory_ending',
      headerName: 'Inventory Level',
      width: 130,
      align: 'right',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'sell_through_rate_pct',
      headerName: 'Sell-Through Rate %',
      width: 160,
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(params.value, 100)}
            color={params.value > 50 ? 'error' : params.value > 30 ? 'warning' : 'success'}
            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 45 }}>
            {params.value?.toFixed(1)}%
          </Typography>
        </Box>
      ),
    },
    {
      field: 'days_of_supply',
      headerName: 'Days of Supply',
      width: 130,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value?.toFixed(1)} days`}
          size="small"
          color={params.value < 7 ? 'error' : params.value < 14 ? 'warning' : 'success'}
        />
      ),
    },
    {
      field: 'alert_status',
      headerName: 'Alert Status',
      width: 120,
      align: 'center',
      renderCell: (params) => {
        const statusColors = {
          OK: 'success',
          Warning: 'warning',
          Critical: 'error',
        };
        const statusIcons = {
          OK: <CheckCircle sx={{ fontSize: 16 }} />,
          Warning: <Warning sx={{ fontSize: 16 }} />,
          Critical: <Warning sx={{ fontSize: 16 }} />,
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
      field: 'stockout_flag',
      headerName: 'Stock-Out',
      width: 100,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Y' ? 'error' : 'default'}
          variant={params.value === 'Y' ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'partner_location',
      headerName: 'Partner Location',
      width: 200,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actual_service_level',
      headerName: 'Service Level %',
      width: 140,
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            color={params.value >= 95 ? 'success' : params.value >= 90 ? 'warning' : 'error'}
            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 40 }}>
            {params.value?.toFixed(1)}%
          </Typography>
        </Box>
      ),
    },
    {
      field: 'replenishment_lead_time',
      headerName: 'Lead Time',
      width: 100,
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value} days
        </Typography>
      ),
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
          <Tooltip title="Alert">
            <IconButton size="small" color="warning">
              <Warning fontSize="small" />
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
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
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
              Sell-Through Analytics Dashboard
            </Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            size="small"
          >
            Back
          </Button>
        </Stack>

        <Box>
          <Typography variant="h4" fontWeight={700}>
            Sell-Through Analytics Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            POS Data Visualization
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
                  <CheckCircle sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Chip size="small" label="Sales" color="primary" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Sales Qty
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_sales_qty?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <AccountBalance sx={{ fontSize: 18, color: 'info.main' }} />
                  <Chip size="small" label="Stock" color="info" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Inventory
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_inventory?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Speed sx={{ fontSize: 18, color: 'warning.main' }} />
                  <LinearProgress
                    variant="determinate"
                    value={metrics.avg_sell_through_rate}
                    sx={{ width: 50, height: 4, borderRadius: 2 }}
                    color="warning"
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Avg Sell-Through Rate
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.avg_sell_through_rate.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Info sx={{ fontSize: 18, color: 'success.main' }} />
                  <Chip size="small" label="Days" color="success" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Avg Days of Supply
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.avg_days_of_supply.toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: 'error.main' }} />
                  <Chip size="small" label="Alerts" color="error" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Critical Alerts
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.critical_alerts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Group sx={{ fontSize: 18, color: 'secondary.main' }} />
                  <LinearProgress
                    variant="determinate"
                    value={metrics.avg_service_level}
                    sx={{ width: 50, height: 4, borderRadius: 2 }}
                    color="secondary"
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Avg Service Level
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.avg_service_level.toFixed(1)}%
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

export default SellThroughAnalytics;
