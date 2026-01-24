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

const ExecutiveCommandCenter = ({ onBack, darkMode = false }) => {
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

  const generateDataByGranularity = (granularity) => {
    const kpiMetrics = [
      { name: 'Forecast Accuracy (MAPE)', category: 'Demand Planning', target: 95.0, owner: 'Demand Planning Team' },
      { name: 'Service Level %', category: 'Operations', target: 95.0, owner: 'Operations Team' },
      { name: 'Inventory Days on Hand', category: 'Inventory', target: 45.0, owner: 'Inventory Team' },
      { name: 'Stock-Out Rate %', category: 'Operations', target: 2.0, owner: 'Operations Team' },
      { name: 'On-Time Delivery %', category: 'Supply', target: 97.0, owner: 'Supply Chain Team' },
      { name: 'Component Shortage Rate %', category: 'Supply', target: 2.0, owner: 'Procurement Team' },
      { name: 'Inventory Turnover Ratio', category: 'Inventory', target: 8.0, owner: 'Inventory Team' },
      { name: 'Order Fill Rate %', category: 'Operations', target: 98.0, owner: 'Operations Team' },
    ];

    const trends = ['Improving', 'Stable', 'Declining'];
    const statuses = ['On Track', 'Warning', 'At Risk', 'Critical'];
    const data = [];
    let idCounter = 1;

    if (granularity === 'daily') {
      // Daily: Last 7 days
      for (let day = 7; day >= 1; day--) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const dateStr = date.toISOString().split('T')[0];

        kpiMetrics.forEach((kpi) => {
          const baseValue = kpi.target + (Math.random() - 0.5) * 5;
          const variance = ((baseValue - kpi.target) / kpi.target) * 100;
          const priorValue = baseValue - (Math.random() - 0.5) * 2;

          data.push({
            id: `KPI${String(idCounter++).padStart(3, '0')}`,
            metric_name: kpi.name,
            category: kpi.category,
            current_value: parseFloat(baseValue.toFixed(1)),
            target_value: kpi.target,
            variance_pct: parseFloat(variance.toFixed(1)),
            trend: trends[Math.floor(Math.random() * trends.length)],
            period: dateStr,
            status: Math.abs(variance) > 10 ? 'Critical' : Math.abs(variance) > 5 ? 'At Risk' : Math.abs(variance) > 2 ? 'Warning' : 'On Track',
            prior_period_value: parseFloat(priorValue.toFixed(1)),
            ytd_value: parseFloat((kpi.target + (Math.random() - 0.5) * 3).toFixed(1)),
            forecast_horizon_value: parseFloat((kpi.target + (Math.random() - 0.5) * 4).toFixed(1)),
            owner: kpi.owner,
            action_items: variance < -5 ? 'Urgent action required' : variance < 0 ? 'Monitor closely' : 'Maintain current performance',
          });
        });
      }
    } else if (granularity === 'weekly') {
      // Weekly: Last 4 weeks
      for (let week = 6; week >= 3; week--) {
        kpiMetrics.forEach((kpi) => {
          const baseValue = kpi.target + (Math.random() - 0.5) * 6;
          const variance = ((baseValue - kpi.target) / kpi.target) * 100;
          const priorValue = baseValue - (Math.random() - 0.5) * 3;

          data.push({
            id: `KPI${String(idCounter++).padStart(3, '0')}`,
            metric_name: kpi.name,
            category: kpi.category,
            current_value: parseFloat(baseValue.toFixed(1)),
            target_value: kpi.target,
            variance_pct: parseFloat(variance.toFixed(1)),
            trend: trends[Math.floor(Math.random() * trends.length)],
            period: `2024-W${String(week).padStart(2, '0')}`,
            status: Math.abs(variance) > 10 ? 'Critical' : Math.abs(variance) > 5 ? 'At Risk' : Math.abs(variance) > 2 ? 'Warning' : 'On Track',
            prior_period_value: parseFloat(priorValue.toFixed(1)),
            ytd_value: parseFloat((kpi.target + (Math.random() - 0.5) * 3).toFixed(1)),
            forecast_horizon_value: parseFloat((kpi.target + (Math.random() - 0.5) * 4).toFixed(1)),
            owner: kpi.owner,
            action_items: variance < -5 ? 'Urgent action required' : variance < 0 ? 'Monitor closely' : 'Maintain current performance',
          });
        });
      }
    } else if (granularity === 'monthly') {
      // Monthly: Last 3 months
      const months = ['Dec 2023', 'Jan 2024', 'Feb 2024'];
      months.forEach((month) => {
        kpiMetrics.forEach((kpi) => {
          const baseValue = kpi.target + (Math.random() - 0.5) * 8;
          const variance = ((baseValue - kpi.target) / kpi.target) * 100;
          const priorValue = baseValue - (Math.random() - 0.5) * 4;

          data.push({
            id: `KPI${String(idCounter++).padStart(3, '0')}`,
            metric_name: kpi.name,
            category: kpi.category,
            current_value: parseFloat(baseValue.toFixed(1)),
            target_value: kpi.target,
            variance_pct: parseFloat(variance.toFixed(1)),
            trend: trends[Math.floor(Math.random() * trends.length)],
            period: month,
            status: Math.abs(variance) > 10 ? 'Critical' : Math.abs(variance) > 5 ? 'At Risk' : Math.abs(variance) > 2 ? 'Warning' : 'On Track',
            prior_period_value: parseFloat(priorValue.toFixed(1)),
            ytd_value: parseFloat((kpi.target + (Math.random() - 0.5) * 3).toFixed(1)),
            forecast_horizon_value: parseFloat((kpi.target + (Math.random() - 0.5) * 4).toFixed(1)),
            owner: kpi.owner,
            action_items: variance < -5 ? 'Urgent action required' : variance < 0 ? 'Monitor closely' : 'Maintain current performance',
          });
        });
      });
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
      const avgCurrentValue = mockData.reduce((sum, item) => sum + item.current_value, 0) / mockData.length;
      const avgVariance = mockData.reduce((sum, item) => sum + item.variance_pct, 0) / mockData.length;
      const criticalKPIs = mockData.filter(item => item.status === 'Critical').length;
      const atRiskKPIs = mockData.filter(item => item.status === 'At Risk').length;
      const onTrackKPIs = mockData.filter(item => item.status === 'On Track').length;
      const improvingTrends = mockData.filter(item => item.trend === 'Improving').length;

      setMetrics({
        total_kpis: mockData.length,
        avg_current_value: avgCurrentValue,
        avg_variance: avgVariance,
        critical_kpis: criticalKPIs,
        at_risk_kpis: atRiskKPIs,
        on_track_kpis: onTrackKPIs,
        improving_trends: improvingTrends,
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
      field: 'metric_name',
      headerName: 'KPI Metric',
      width: 220,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {params.row.category}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'period',
      headerName: 'Period',
      width: 100,
      align: 'center',
    },
    {
      field: 'current_value',
      headerName: 'Current Value',
      width: 120,
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.value?.toFixed(1)}
        </Typography>
      ),
    },
    {
      field: 'target_value',
      headerName: 'Target',
      width: 100,
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value?.toFixed(1)}
        </Typography>
      ),
    },
    {
      field: 'variance_pct',
      headerName: 'Variance %',
      width: 110,
      align: 'center',
      renderCell: (params) => {
        const isPositive = params.value >= 0;
        const isHighVariance = Math.abs(params.value) > 10;
        return (
          <Chip
            label={`${isPositive ? '+' : ''}${params.value?.toFixed(1)}%`}
            size="small"
            color={isHighVariance ? 'error' : isPositive ? 'success' : 'warning'}
            variant="filled"
          />
        );
      },
    },
    {
      field: 'trend',
      headerName: 'Trend',
      width: 110,
      align: 'center',
      renderCell: (params) => {
        const trendColors = {
          Improving: 'success',
          Stable: 'info',
          Declining: 'warning',
        };
        return (
          <Chip
            label={params.value}
            size="small"
            color={trendColors[params.value] || 'default'}
          />
        );
      },
    },
    {
      field: 'prior_period_value',
      headerName: 'Prior Period',
      width: 110,
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {params.value?.toFixed(1)}
        </Typography>
      ),
    },
    {
      field: 'ytd_value',
      headerName: 'YTD Value',
      width: 100,
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value?.toFixed(1)}
        </Typography>
      ),
    },
    {
      field: 'forecast_horizon_value',
      headerName: 'Forecast',
      width: 100,
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
          {params.value?.toFixed(1)}
        </Typography>
      ),
    },
    {
      field: 'owner',
      headerName: 'Owner',
      width: 160,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      align: 'center',
      renderCell: (params) => {
        const statusColors = {
          'On Track': 'success',
          'Warning': 'warning',
          'At Risk': 'error',
          'Critical': 'error',
        };
        const statusIcons = {
          'On Track': <CheckCircle sx={{ fontSize: 16 }} />,
          'Warning': <Warning sx={{ fontSize: 16 }} />,
          'At Risk': <Warning sx={{ fontSize: 16 }} />,
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
      field: 'action_items',
      headerName: 'Action Items',
      width: 300,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
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
      bgcolor: colors.background
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
              Executive Command Center
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
            Executive Command Center
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Supply Chain KPI Dashboard - Real-Time Performance Monitoring
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
                  <Speed sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Chip size="small" label="Total" color="primary" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total KPIs
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_kpis}
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
                  Critical KPIs
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.critical_kpis}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: 'warning.main' }} />
                  <Chip size="small" label="At Risk" color="warning" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  At Risk
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.at_risk_kpis}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                  <Chip size="small" label="On Track" color="success" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  On Track
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.on_track_kpis}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Speed sx={{ fontSize: 18, color: 'info.main' }} />
                  <Chip size="small" label="Trend" color="info" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Improving Trends
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.improving_trends}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <CompareArrows sx={{ fontSize: 18, color: 'secondary.main' }} />
                  <Chip
                    size="small"
                    label={metrics.avg_variance >= 0 ? 'Positive' : 'Negative'}
                    color={Math.abs(metrics.avg_variance) > 10 ? 'error' : metrics.avg_variance >= 0 ? 'success' : 'warning'}
                    sx={{ fontSize: '0.65rem', height: 18 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Avg Variance
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.avg_variance >= 0 ? '+' : ''}{metrics.avg_variance.toFixed(1)}%
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
              New KPI
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
            {sopData.length} KPIs total
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

      {/* KPI Details Dialog */}
      <Dialog
        open={consensusDialogOpen}
        onClose={() => setConsensusDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          KPI Details - {selectedProduct?.metric_name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Current Value"
                value={selectedProduct?.current_value || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Target Value"
                value={selectedProduct?.target_value || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Variance %"
                value={selectedProduct?.variance_pct || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Prior Period"
                value={selectedProduct?.prior_period_value || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="YTD Value"
                value={selectedProduct?.ytd_value || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Forecast"
                value={selectedProduct?.forecast_horizon_value || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Owner"
                value={selectedProduct?.owner || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Action Items"
                value={selectedProduct?.action_items || ''}
                placeholder="Action items for this KPI..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConsensusDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary">Update KPI</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExecutiveCommandCenter;
