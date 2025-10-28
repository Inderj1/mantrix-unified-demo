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
  ButtonGroup,
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
  DateRange as WeeklyIcon,
  EventNote as MonthlyIcon,
} from '@mui/icons-material';

const SKUAggregation = ({ onBack }) => {
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

  // Helper function to generate data based on granularity (Weekly/Monthly only - Daily doesn't make sense for aggregation)
  const generateDataByGranularity = (granularity) => {
    const products = [
      { sku: 'SKU-7891', name: 'Madison Reed Premium Color Kit' },
      { sku: 'SKU-4523', name: 'Color Reviving Gloss' },
      { sku: 'SKU-9021', name: 'Root Retouch Kit' },
      { sku: 'SKU-3312', name: 'Shine Therapy Conditioner' },
      { sku: 'SKU-5641', name: 'Volume Boost Shampoo' },
    ];

    const data = [];
    let idCounter = 1;
    let pirCounter = 1;

    if (granularity === 'weekly') {
      // Generate 4 weeks of aggregated data
      for (let week = 3; week <= 6; week++) {
        products.forEach((product, pIdx) => {
          const storeBase = 700 + (pIdx * 200);
          const onlineBase = 800 + (pIdx * 250);
          const b2bBase = 5000 + (pIdx * 1500);

          const storeForecast = Math.floor(storeBase * (0.9 + Math.random() * 0.2));
          const onlineForecast = Math.floor(onlineBase * (0.9 + Math.random() * 0.2));
          const b2bForecast = Math.floor(b2bBase * (0.9 + Math.random() * 0.2));
          const totalDemand = storeForecast + onlineForecast + b2bForecast;

          const prevWeekTotal = Math.floor(totalDemand * (0.85 + Math.random() * 0.15));
          const yoyGrowth = ((totalDemand - prevWeekTotal) / prevWeekTotal * 100).toFixed(1);

          data.push({
            id: `SKA${String(idCounter++).padStart(3, '0')}`,
            product_sku: product.sku,
            sales_date: `2024-W${String(week).padStart(2, '0')}`,
            week: `2024-W${String(week).padStart(2, '0')}`,
            month: '2024-02',
            store_forecast: storeForecast,
            online_forecast: onlineForecast,
            b2b_forecast: b2bForecast,
            total_demand: totalDemand,
            store_mix_pct: parseFloat(((storeForecast / totalDemand) * 100).toFixed(1)),
            online_mix_pct: parseFloat(((onlineForecast / totalDemand) * 100).toFixed(1)),
            b2b_mix_pct: parseFloat(((b2bForecast / totalDemand) * 100).toFixed(1)),
            pir_status: week === 6 ? 'Created' : week === 5 ? 'Pending' : 'Completed',
            pir_number: week >= 5 ? `PIR-240207-${String(pirCounter++).padStart(3, '0')}` : '',
            mrp_run_date: `2024-02-07 03:00:00`,
            previous_week_total: prevWeekTotal,
            yoy_growth_pct: parseFloat(yoyGrowth),
            product_id: product.sku,
            product_name: product.name,
            status: week === 6 ? 'active' : week === 5 ? 'pending' : 'completed',
          });
        });
      }
    } else if (granularity === 'monthly') {
      // Generate 3 months of aggregated data
      for (let month = 12; month <= 2; month++) {
        const monthLabel = month > 10 ? `2023-${month}` : `2024-0${month}`;

        products.forEach((product, pIdx) => {
          const storeBase = 3000 + (pIdx * 800);
          const onlineBase = 3500 + (pIdx * 1000);
          const b2bBase = 20000 + (pIdx * 6000);

          const storeForecast = Math.floor(storeBase * (0.9 + Math.random() * 0.2));
          const onlineForecast = Math.floor(onlineBase * (0.9 + Math.random() * 0.2));
          const b2bForecast = Math.floor(b2bBase * (0.9 + Math.random() * 0.2));
          const totalDemand = storeForecast + onlineForecast + b2bForecast;

          const prevMonthTotal = Math.floor(totalDemand * (0.85 + Math.random() * 0.15));
          const yoyGrowth = ((totalDemand - prevMonthTotal) / prevMonthTotal * 100).toFixed(1);

          data.push({
            id: `SKA${String(idCounter++).padStart(3, '0')}`,
            product_sku: product.sku,
            sales_date: monthLabel,
            week: monthLabel,
            month: monthLabel,
            store_forecast: storeForecast,
            online_forecast: onlineForecast,
            b2b_forecast: b2bForecast,
            total_demand: totalDemand,
            store_mix_pct: parseFloat(((storeForecast / totalDemand) * 100).toFixed(1)),
            online_mix_pct: parseFloat(((onlineForecast / totalDemand) * 100).toFixed(1)),
            b2b_mix_pct: parseFloat(((b2bForecast / totalDemand) * 100).toFixed(1)),
            pir_status: month === 2 ? 'Created' : month === 1 ? 'Pending' : 'Completed',
            pir_number: month >= 1 ? `PIR-2024${String(month).padStart(2, '0')}-${String(pirCounter++).padStart(3, '0')}` : '',
            mrp_run_date: `${monthLabel}-01 03:00:00`,
            previous_week_total: prevMonthTotal,
            yoy_growth_pct: parseFloat(yoyGrowth),
            product_id: product.sku,
            product_name: product.name,
            status: month === 2 ? 'active' : month === 1 ? 'pending' : 'completed',
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
      const totalDemand = mockData.reduce((sum, item) => sum + item.total_demand, 0);
      const totalStoreForecast = mockData.reduce((sum, item) => sum + item.store_forecast, 0);
      const totalOnlineForecast = mockData.reduce((sum, item) => sum + item.online_forecast, 0);
      const totalB2BForecast = mockData.reduce((sum, item) => sum + item.b2b_forecast, 0);
      const avgYoYGrowth = mockData.reduce((sum, item) => sum + item.yoy_growth_pct, 0) / mockData.length;
      const pirCreated = mockData.filter(item => item.pir_status === 'Created').length;

      setMetrics({
        total_demand: totalDemand,
        total_store_forecast: totalStoreForecast,
        total_online_forecast: totalOnlineForecast,
        total_b2b_forecast: totalB2BForecast,
        avg_yoy_growth: avgYoYGrowth,
        pir_created_count: pirCreated,
      });
    } catch (error) {
      console.error('Error fetching S&OP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (row) => {
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
      field: 'week',
      headerName: 'Week',
      width: 100,
      align: 'center',
    },
    {
      field: 'total_demand',
      headerName: 'Total Demand',
      width: 120,
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'store_forecast',
      headerName: 'Store Forecast',
      width: 150,
      align: 'right',
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.value?.toLocaleString()}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {params.row.store_mix_pct}%
          </Typography>
        </Box>
      ),
    },
    {
      field: 'online_forecast',
      headerName: 'Online Forecast',
      width: 150,
      align: 'right',
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.value?.toLocaleString()}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {params.row.online_mix_pct}%
          </Typography>
        </Box>
      ),
    },
    {
      field: 'b2b_forecast',
      headerName: 'B2B Forecast',
      width: 140,
      align: 'right',
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.value?.toLocaleString()}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {params.row.b2b_mix_pct}%
          </Typography>
        </Box>
      ),
    },
    {
      field: 'store_mix_pct',
      headerName: 'Store Mix %',
      width: 130,
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            color="primary"
            sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
          />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {params.value}%
          </Typography>
        </Box>
      ),
    },
    {
      field: 'online_mix_pct',
      headerName: 'Online Mix %',
      width: 130,
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            color="info"
            sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
          />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {params.value}%
          </Typography>
        </Box>
      ),
    },
    {
      field: 'b2b_mix_pct',
      headerName: 'B2B Mix %',
      width: 120,
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            color="success"
            sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
          />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {params.value}%
          </Typography>
        </Box>
      ),
    },
    {
      field: 'yoy_growth_pct',
      headerName: 'YoY Growth %',
      width: 120,
      align: 'center',
      renderCell: (params) => {
        const isPositive = params.value >= 0;
        return (
          <Chip
            label={`${isPositive ? '+' : ''}${params.value}%`}
            size="small"
            color={isPositive ? 'success' : 'error'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: 'previous_week_total',
      headerName: 'Previous Week',
      width: 120,
      align: 'right',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'pir_status',
      headerName: 'PIR Status',
      width: 110,
      align: 'center',
      renderCell: (params) => {
        const statusColors = {
          Created: 'success',
          Pending: 'warning',
        };
        const statusIcons = {
          Created: <CheckCircle sx={{ fontSize: 16 }} />,
          Pending: <Warning sx={{ fontSize: 16 }} />,
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
      field: 'pir_number',
      headerName: 'PIR Number',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: params.value ? 'text.primary' : 'text.disabled' }}>
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'mrp_run_date',
      headerName: 'MRP Run Date',
      width: 160,
      renderCell: (params) => (
        <Typography variant="caption">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      align: 'center',
      renderCell: (params) => {
        const statusColors = {
          active: 'success',
          pending: 'warning',
        };
        const statusIcons = {
          active: <CheckCircle sx={{ fontSize: 16 }} />,
          pending: <Info sx={{ fontSize: 16 }} />,
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
              SKU Aggregation Console
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
            SKU Aggregation Console
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Channel Consolidation
          </Typography>
        </Box>
      </Box>

      {/* Action Bar */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            View By:
          </Typography>
          <ButtonGroup size="small" variant="outlined">
            <Button
              variant={granularity === 'weekly' ? 'contained' : 'outlined'}
              onClick={() => setGranularity('weekly')}
              startIcon={<WeeklyIcon sx={{ fontSize: 16 }} />}
              sx={{ minWidth: 100 }}
            >
              Weekly
            </Button>
            <Button
              variant={granularity === 'monthly' ? 'contained' : 'outlined'}
              onClick={() => setGranularity('monthly')}
              startIcon={<MonthlyIcon sx={{ fontSize: 16 }} />}
              sx={{ minWidth: 100 }}
            >
              Monthly
            </Button>
          </ButtonGroup>
        </Box>
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
                  <AttachMoney sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Chip size="small" label="Total" color="primary" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Demand
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_demand?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <AccountBalance sx={{ fontSize: 18, color: 'info.main' }} />
                  <Chip size="small" label="Store" color="info" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Store Channel
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_store_forecast?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Speed sx={{ fontSize: 18, color: 'secondary.main' }} />
                  <Chip size="small" label="Online" color="secondary" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Online Channel
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_online_forecast?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Group sx={{ fontSize: 18, color: 'success.main' }} />
                  <Chip size="small" label="B2B" color="success" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  B2B Channel
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_b2b_forecast?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: metrics.avg_yoy_growth >= 0 ? 'success.main' : 'error.main' }} />
                  <Chip
                    size="small"
                    label="Growth"
                    color={metrics.avg_yoy_growth >= 0 ? 'success' : 'error'}
                    sx={{ fontSize: '0.65rem', height: 18 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  YoY Growth %
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.avg_yoy_growth >= 0 ? '+' : ''}{metrics.avg_yoy_growth?.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                  <Chip size="small" label="PIR" color="success" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  PIR Created
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.pir_created_count}
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

      {/* SKU Aggregation Details Dialog */}
      <Dialog
        open={consensusDialogOpen}
        onClose={() => setConsensusDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          SKU Aggregation Details - {selectedProduct?.product_name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product SKU"
                value={selectedProduct?.product_sku || ''}
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
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Store Forecast"
                value={selectedProduct?.store_forecast || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Online Forecast"
                value={selectedProduct?.online_forecast || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="B2B Forecast"
                value={selectedProduct?.b2b_forecast || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Total Demand"
                value={selectedProduct?.total_demand || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Store Mix %"
                value={selectedProduct?.store_mix_pct || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Online Mix %"
                value={selectedProduct?.online_mix_pct || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="B2B Mix %"
                value={selectedProduct?.b2b_mix_pct || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="PIR Status"
                value={selectedProduct?.pir_status || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="PIR Number"
                value={selectedProduct?.pir_number || 'N/A'}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="YoY Growth %"
                value={selectedProduct?.yoy_growth_pct || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Previous Week Total"
                value={selectedProduct?.previous_week_total || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="MRP Run Date"
                value={selectedProduct?.mrp_run_date || ''}
                disabled
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConsensusDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SKUAggregation;
