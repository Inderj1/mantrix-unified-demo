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

const DemandWorkbench = ({ onBack }) => {
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
      // Simulated Demand Workbench data with Input Data + Additional Columns
      const mockData = [
        {
          id: 'DW001',
          // Base columns from Input Data
          store_id: 'STORE_001',
          product_sku: 'SKU-7891',
          location_id: 'NYC-001',
          product_id: 'SKU-7891',
          sales_date: '2024-W06',
          actual_sales: 1250,
          promo_flag: 'Y',

          // Additional columns to ADD
          channel: 'STORE',
          week: '2024-W06',
          forecast_qty: 1180,
          accuracy_pct: 94.4,
          override_flag: 'N',
          comments: 'Valentine promotion driving higher sales',
          forecast_model_used: 'STOX.AI-v2.3-ARIMA',
          confidence_interval: '1050-1310',

          // Legacy fields for compatibility
          product_family: 'Hair Color',
          product_name: 'Madison Reed Premium Color Kit',
          status: 'approved',
        },
        {
          id: 'DW002',
          store_id: 'WEB_MAIN',
          product_sku: 'SKU-7891',
          location_id: 'ONLINE',
          product_id: 'SKU-7891',
          sales_date: '2024-W06',
          actual_sales: 890,
          promo_flag: 'N',
          channel: 'ONLINE',
          week: '2024-W06',
          forecast_qty: 920,
          accuracy_pct: 96.7,
          override_flag: 'N',
          comments: '',
          forecast_model_used: 'STOX.AI-v2.3-LSTM',
          confidence_interval: '820-1020',
          product_family: 'Hair Color',
          product_name: 'Madison Reed Premium Color Kit',
          status: 'approved',
        },
        {
          id: 'DW003',
          store_id: 'B2B_TARGET',
          product_sku: 'SKU-7891',
          location_id: 'TARGET-DC',
          product_id: 'SKU-7891',
          sales_date: '2024-W06',
          actual_sales: 3200,
          promo_flag: 'Y',
          channel: 'B2B',
          week: '2024-W06',
          forecast_qty: 3100,
          accuracy_pct: 96.9,
          override_flag: 'N',
          comments: 'Partner promotion aligned with our forecast',
          forecast_model_used: 'STOX.AI-v2.3-XGBoost',
          confidence_interval: '2900-3300',
          product_family: 'Hair Color',
          product_name: 'Madison Reed Premium Color Kit',
          status: 'approved',
        },
        {
          id: 'DW004',
          store_id: 'STORE_045',
          product_sku: 'SKU-4523',
          location_id: 'LA-045',
          product_id: 'SKU-4523',
          sales_date: '2024-W06',
          actual_sales: 780,
          promo_flag: 'N',
          channel: 'STORE',
          week: '2024-W06',
          forecast_qty: 850,
          accuracy_pct: 91.8,
          override_flag: 'Y',
          comments: 'Manual override - new store ramp slower than expected',
          forecast_model_used: 'STOX.AI-v2.3-ARIMA',
          confidence_interval: '750-950',
          product_family: 'Hair Care',
          product_name: 'Color Reviving Gloss',
          status: 'review',
        },
        {
          id: 'DW005',
          store_id: 'WEB_MAIN',
          product_sku: 'SKU-4523',
          location_id: 'ONLINE',
          product_id: 'SKU-4523',
          sales_date: '2024-W06',
          actual_sales: 1450,
          promo_flag: 'Y',
          channel: 'ONLINE',
          week: '2024-W06',
          forecast_qty: 1380,
          accuracy_pct: 95.2,
          override_flag: 'N',
          comments: 'Email campaign boosted sales',
          forecast_model_used: 'STOX.AI-v2.3-LSTM',
          confidence_interval: '1250-1510',
          product_family: 'Hair Care',
          product_name: 'Color Reviving Gloss',
          status: 'approved',
        },
      ];

      setSOPData(mockData);

      // Calculate metrics based on new data structure
      const totalActualSales = mockData.reduce((sum, item) => sum + item.actual_sales, 0);
      const totalForecastQty = mockData.reduce((sum, item) => sum + item.forecast_qty, 0);
      const avgAccuracy = mockData.reduce((sum, item) => sum + item.accuracy_pct, 0) / mockData.length;
      const forecastBias = ((totalForecastQty - totalActualSales) / totalActualSales) * 100;
      const overrideCount = mockData.filter(item => item.override_flag === 'Y').length;
      const promoCount = mockData.filter(item => item.promo_flag === 'Y').length;
      const approvedCount = mockData.filter(item => item.status === 'approved').length;
      const approvalProgress = (approvedCount / mockData.length) * 100;

      setMetrics({
        total_actual_sales: totalActualSales,
        total_forecast_qty: totalForecastQty,
        avg_forecast_accuracy: avgAccuracy,
        forecast_bias: forecastBias,
        override_count: overrideCount,
        promo_count: promoCount,
        approval_progress: approvalProgress,
        total_records: mockData.length,
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
      field: 'location_id',
      headerName: 'Location ID',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'product_id',
      headerName: 'Product ID',
      width: 120,
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
      field: 'channel',
      headerName: 'Channel',
      width: 100,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'STORE' ? 'primary' : params.value === 'ONLINE' ? 'info' : 'success'}
        />
      ),
    },
    {
      field: 'actual_sales',
      headerName: 'Actual Sales',
      width: 120,
      align: 'right',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'forecast_qty',
      headerName: 'Forecast Qty',
      width: 120,
      align: 'right',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'accuracy_pct',
      headerName: 'Accuracy %',
      width: 110,
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
      field: 'promo_flag',
      headerName: 'Promo',
      width: 80,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Y' ? 'warning' : 'default'}
          variant={params.value === 'Y' ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'override_flag',
      headerName: 'Override',
      width: 90,
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
      field: 'forecast_model_used',
      headerName: 'Model',
      width: 180,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'confidence_interval',
      headerName: 'Confidence Interval',
      width: 140,
      align: 'center',
      renderCell: (params) => (
        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'comments',
      headerName: 'Comments',
      width: 240,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {params.value || '-'}
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
              STOX Demand Workbench
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
            STOX Demand Workbench
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Unified Demand Forecasting Interface
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
                  <Chip size="small" label="Actual" color="primary" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Actual Sales
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_actual_sales?.toLocaleString()}
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
                  Total Forecast Qty
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_forecast_qty?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <AttachMoney sx={{ fontSize: 18, color: 'success.main' }} />
                  <LinearProgress
                    variant="determinate"
                    value={metrics.avg_forecast_accuracy}
                    sx={{ width: 50, height: 4, borderRadius: 2 }}
                    color="success"
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Avg Forecast Accuracy
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.avg_forecast_accuracy.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <CompareArrows sx={{ fontSize: 18, color: metrics.forecast_bias > 0 ? 'warning.main' : 'success.main' }} />
                  <Chip
                    size="small"
                    label={metrics.forecast_bias > 0 ? 'Over' : 'Under'}
                    color={Math.abs(metrics.forecast_bias) < 5 ? 'success' : 'warning'}
                    sx={{ fontSize: '0.65rem', height: 18 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Forecast Bias
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.forecast_bias > 0 ? '+' : ''}{metrics.forecast_bias.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: 'error.main' }} />
                  <Chip size="small" label="Manual" color="error" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Manual Overrides
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.override_count}
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
                    value={metrics.approval_progress}
                    sx={{ width: 50, height: 4, borderRadius: 2 }}
                    color="secondary"
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Approval Progress
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.approval_progress.toFixed(0)}%
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

export default DemandWorkbench;
