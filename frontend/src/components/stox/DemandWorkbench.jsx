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

const DemandWorkbench = ({ onBack }) => {
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
    const products = [
      { sku: 'SKU-7891', name: 'Madison Reed Premium Color Kit', family: 'Hair Color' },
      { sku: 'SKU-4523', name: 'Color Reviving Gloss', family: 'Hair Care' },
      { sku: 'SKU-9021', name: 'Root Retouch Kit', family: 'Hair Color' },
    ];

    const locations = [
      { id: 'NYC-001', store_id: 'STORE_001', channel: 'STORE' },
      { id: 'ONLINE', store_id: 'WEB_MAIN', channel: 'ONLINE' },
      { id: 'TARGET-DC', store_id: 'B2B_TARGET', channel: 'B2B' },
      { id: 'LA-045', store_id: 'STORE_045', channel: 'STORE' },
    ];

    const data = [];
    let idCounter = 1;

    if (granularity === 'daily') {
      // Generate 7 days of data
      for (let day = 1; day <= 7; day++) {
        products.forEach((product, pIdx) => {
          locations.forEach((location, lIdx) => {
            const baseActual = 100 + (pIdx * 300) + (lIdx * 50);
            const actual = Math.floor(baseActual * (0.9 + Math.random() * 0.2));
            const forecast = Math.floor(actual * (0.95 + Math.random() * 0.1));
            const accuracy = ((1 - Math.abs(actual - forecast) / actual) * 100).toFixed(1);

            data.push({
              id: `DW${String(idCounter++).padStart(3, '0')}`,
              store_id: location.store_id,
              product_sku: product.sku,
              location_id: location.id,
              product_id: product.sku,
              sales_date: `2024-02-${String(day).padStart(2, '0')}`,
              week: `2024-W06`,
              month: '2024-02',
              actual_sales: actual,
              promo_flag: day === 5 || day === 6 ? 'Y' : 'N',
              channel: location.channel,
              forecast_qty: forecast,
              accuracy_pct: parseFloat(accuracy),
              override_flag: accuracy < 90 ? 'Y' : 'N',
              comments: accuracy < 90 ? 'Manual adjustment needed' : '',
              forecast_model_used: location.channel === 'ONLINE' ? 'STOX.AI-v2.3-LSTM' : 'STOX.AI-v2.3-ARIMA',
              confidence_interval: `${forecast * 0.9}-${forecast * 1.1}`,
              product_family: product.family,
              product_name: product.name,
              status: 'approved',
            });
          });
        });
      }
    } else if (granularity === 'weekly') {
      // Generate 4 weeks of data
      for (let week = 3; week <= 6; week++) {
        products.forEach((product, pIdx) => {
          locations.forEach((location, lIdx) => {
            const baseActual = 700 + (pIdx * 2100) + (lIdx * 350);
            const actual = Math.floor(baseActual * (0.9 + Math.random() * 0.2));
            const forecast = Math.floor(actual * (0.95 + Math.random() * 0.1));
            const accuracy = ((1 - Math.abs(actual - forecast) / actual) * 100).toFixed(1);

            data.push({
              id: `DW${String(idCounter++).padStart(3, '0')}`,
              store_id: location.store_id,
              product_sku: product.sku,
              location_id: location.id,
              product_id: product.sku,
              sales_date: `2024-W${String(week).padStart(2, '0')}`,
              week: `2024-W${String(week).padStart(2, '0')}`,
              month: '2024-02',
              actual_sales: actual,
              promo_flag: week === 6 ? 'Y' : 'N',
              channel: location.channel,
              forecast_qty: forecast,
              accuracy_pct: parseFloat(accuracy),
              override_flag: accuracy < 90 ? 'Y' : 'N',
              comments: week === 6 ? 'Valentine promotion' : '',
              forecast_model_used: location.channel === 'ONLINE' ? 'STOX.AI-v2.3-LSTM' : 'STOX.AI-v2.3-ARIMA',
              confidence_interval: `${Math.floor(forecast * 0.9)}-${Math.floor(forecast * 1.1)}`,
              product_family: product.family,
              product_name: product.name,
              status: 'approved',
            });
          });
        });
      }
    } else if (granularity === 'monthly') {
      // Generate 3 months of data
      for (let month = 12; month <= 2; month++) {
        const monthStr = month > 10 ? `2023-${month}` : `2024-0${month}`;
        const monthLabel = month > 10 ? `2023-${month}` : `2024-0${month}`;

        products.forEach((product, pIdx) => {
          locations.forEach((location, lIdx) => {
            const baseActual = 3000 + (pIdx * 9000) + (lIdx * 1500);
            const actual = Math.floor(baseActual * (0.9 + Math.random() * 0.2));
            const forecast = Math.floor(actual * (0.95 + Math.random() * 0.1));
            const accuracy = ((1 - Math.abs(actual - forecast) / actual) * 100).toFixed(1);

            data.push({
              id: `DW${String(idCounter++).padStart(3, '0')}`,
              store_id: location.store_id,
              product_sku: product.sku,
              location_id: location.id,
              product_id: product.sku,
              sales_date: monthLabel,
              week: monthLabel,
              month: monthLabel,
              actual_sales: actual,
              promo_flag: month === 12 ? 'Y' : 'N',
              channel: location.channel,
              forecast_qty: forecast,
              accuracy_pct: parseFloat(accuracy),
              override_flag: accuracy < 90 ? 'Y' : 'N',
              comments: month === 12 ? 'Holiday season spike' : '',
              forecast_model_used: location.channel === 'ONLINE' ? 'STOX.AI-v2.3-LSTM' : 'STOX.AI-v2.3-ARIMA',
              confidence_interval: `${Math.floor(forecast * 0.9)}-${Math.floor(forecast * 1.1)}`,
              product_family: product.family,
              product_name: product.name,
              status: 'approved',
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
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'product_id',
      headerName: 'Product ID',
      flex: 1,
      minWidth: 200,
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
      field: granularity === 'daily' ? 'sales_date' : granularity === 'weekly' ? 'week' : 'month',
      headerName: granularity === 'daily' ? 'Date' : granularity === 'weekly' ? 'Week' : 'Month',
      width: 120,
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
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
      flex: 0.8,
      minWidth: 150,
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
      flex: 1,
      minWidth: 200,
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
      height: '100vh',
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
