import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  AlertTitle,
  Breadcrumbs,
  Link,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  LocalShipping as ShippingIcon,
  Business as SupplierIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as DelayIcon,
  Assessment as RiskIcon,
  TrendingDown as TrendingDownIcon,
  InfoOutlined as InfoIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import stoxService from '../../services/stoxService';

// Utility Functions
const formatNumber = (value) => {
  return value.toLocaleString();
};

const formatCurrency = (value) => {
  return `$${value.toLocaleString()}`;
};

const getRiskColor = (score) => {
  if (score >= 80) return '#F44336';
  if (score >= 60) return '#FF9800';
  if (score >= 40) return '#FFC107';
  return '#4CAF50';
};

const getRiskLabel = (score) => {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
};

const getStatusColor = (status) => {
  if (status === 'Delayed') return '#F44336';
  if (status === 'At Risk') return '#FF9800';
  if (status === 'On Track') return '#4CAF50';
  return '#42A5F5';
};

// TabPanel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inbound-risk-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const InboundRiskMonitor = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);

  // Tab 1: Vendor Scorecard
  const [vendorMetrics, setVendorMetrics] = useState([]);

  // Tab 2: Risk Alerts
  const [alerts, setAlerts] = useState([]);

  // Tab 3: Supplier Trends
  const [supplierPerf, setSupplierPerf] = useState([]);

  // Load data when tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 0) {
        // Tab 1: Vendor Scorecard
        const result = await stoxService.getVendorRiskMetrics();
        const vendors = result.vendors || [];
        setVendorMetrics(vendors.map((item, idx) => ({
          id: idx + 1,
          vendor: item.vendor || 'Unknown',
          material_count: item.material_count || 0,
          avg_otif_pct: Math.round((item.avg_otif_pct || 0) * 100),
          avg_theta: parseFloat(item.avg_theta || 0).toFixed(2),
          avg_lead_time: parseFloat(item.avg_lead_time || 0).toFixed(1),
          lead_time_variance: parseFloat(item.lead_time_variance || 0).toFixed(2),
        })));
      } else if (activeTab === 1) {
        // Tab 2: Risk Alerts
        const result = await stoxService.getInboundAlerts({ risk_threshold: 0.95 });
        const alertData = result.alerts || [];
        setAlerts(alertData.map((item, idx) => ({
          id: idx + 1,
          material_id: item.material_id || 'N/A',
          plant: item.plant || 'Unknown',
          vendor: item.vendor || 'Unknown',
          vendor_otif_pct: Math.round((item.vendor_otif_pct || 0) * 100),
          vendor_theta: parseFloat(item.vendor_theta || 0).toFixed(2),
          avg_lead_time: parseFloat(item.avg_lead_time || 0).toFixed(1),
          risk_level: item.risk_level || 'Unknown',
        })));
      } else if (activeTab === 2) {
        // Tab 3: Supplier Performance by SKU
        const result = await stoxService.getSupplierPerformance();
        const perf = result.performance || [];
        setSupplierPerf(perf.map((item, idx) => ({
          id: idx + 1,
          material_id: item.material_id || 'N/A',
          plant: item.plant || 'Unknown',
          vendor: item.vendor || 'Unknown',
          vendor_otif_pct: Math.round((item.vendor_otif_pct || 0) * 100),
          vendor_theta: parseFloat(item.vendor_theta || 0).toFixed(2),
          avg_lead_time: parseFloat(item.avg_lead_time || 0).toFixed(1),
          lt_stddev: parseFloat(item.lt_stddev || 0).toFixed(2),
          working_capital: Math.round(item.stoxai_total_working_capital || 0),
        })));
      }
    } catch (err) {
      console.error('Error loading inbound risk data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Tab 1: Vendor Scorecard Columns
  const vendorColumns = [
    {
      field: 'vendor',
      headerName: 'Vendor',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.material_count} SKUs
          </Typography>
        </Box>
      ),
    },
    {
      field: 'material_count',
      headerName: 'SKU Count',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'avg_otif_pct',
      headerName: 'Avg OTIF %',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{
            backgroundColor: params.value >= 95 ? '#E8F5E9' : params.value >= 90 ? '#FFF3E0' : '#FFEBEE',
            color: params.value >= 95 ? '#2E7D32' : params.value >= 90 ? '#E65100' : '#C62828',
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      field: 'avg_theta',
      headerName: 'Avg Theta',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'avg_lead_time',
      headerName: 'Avg Lead Time',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            days
          </Typography>
        </Box>
      ),
    },
    {
      field: 'lead_time_variance',
      headerName: 'Lead Time Variance',
      width: 170,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography
            variant="body2"
            fontWeight="medium"
            color={params.value > 5 ? 'error.main' : params.value > 3 ? 'warning.main' : 'success.main'}
          >
            ±{params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            days
          </Typography>
        </Box>
      ),
    },
  ];

  // Tab 2: Risk Alerts Columns
  const alertColumns = [
    {
      field: 'material_id',
      headerName: 'Material ID',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box>
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
      field: 'vendor',
      headerName: 'Vendor',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SupplierIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'vendor_otif_pct',
      headerName: 'OTIF %',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          icon={params.value < 80 ? <ErrorIcon /> : params.value < 90 ? <WarningIcon /> : <CheckCircleIcon />}
          sx={{
            backgroundColor: params.value < 80 ? '#FFEBEE' : params.value < 90 ? '#FFF3E0' : '#E8F5E9',
            color: params.value < 80 ? '#C62828' : params.value < 90 ? '#E65100' : '#2E7D32',
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      field: 'avg_lead_time',
      headerName: 'Lead Time',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            days
          </Typography>
        </Box>
      ),
    },
    {
      field: 'risk_level',
      headerName: 'Risk Level',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          icon={params.value === 'Critical' ? <ErrorIcon /> : params.value === 'High' ? <WarningIcon /> : <InfoIcon />}
          label={params.value}
          size="small"
          color={params.value === 'Critical' ? 'error' : params.value === 'High' ? 'warning' : 'default'}
          variant="filled"
          sx={{ fontWeight: 700 }}
        />
      ),
    },
  ];

  // Tab 3: Supplier Performance Columns
  const supplierPerfColumns = [
    {
      field: 'material_id',
      headerName: 'Material ID',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box>
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
      field: 'vendor',
      headerName: 'Vendor',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SupplierIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'vendor_otif_pct',
      headerName: 'OTIF %',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Typography
            variant="body2"
            fontWeight="bold"
            color={params.value >= 95 ? 'success.main' : params.value >= 90 ? 'warning.main' : 'error.main'}
          >
            {params.value}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{
              mt: 0.5,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#E1E4E8',
              '& .MuiLinearProgress-bar': {
                backgroundColor: params.value >= 95 ? '#2E7D32' : params.value >= 90 ? '#E65100' : '#C62828',
              },
            }}
          />
        </Box>
      ),
    },
    {
      field: 'vendor_theta',
      headerName: 'Theta',
      width: 100,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'avg_lead_time',
      headerName: 'Lead Time',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            days
          </Typography>
        </Box>
      ),
    },
    {
      field: 'lt_stddev',
      headerName: 'Lead Time StdDev',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography
            variant="body2"
            fontWeight="medium"
            color={params.value > 5 ? 'error.main' : params.value > 3 ? 'warning.main' : 'success.main'}
          >
            ±{params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            variation
          </Typography>
        </Box>
      ),
    },
    {
      field: 'working_capital',
      headerName: 'Working Capital',
      width: 170,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="success.main">
            {formatCurrency(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            invested
          </Typography>
        </Box>
      ),
    },
  ];

  // Summary Statistics
  const currentData = activeTab === 0 ? vendorMetrics : activeTab === 1 ? alerts : supplierPerf;
  const totalItems = currentData.length;
  const criticalCount = activeTab === 1 ? alerts.filter(item => item.risk_level === 'Critical').length : 0;
  const avgOTIF = currentData.length > 0 && currentData[0].avg_otif_pct !== undefined
    ? Math.round(currentData.reduce((sum, item) => sum + (item.avg_otif_pct || 0), 0) / currentData.length)
    : 0;

  return (
    <Box sx={{
      p: 3,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      maxWidth: '100vw'
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
            Inbound Risk Monitor
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
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
              Inbound Risk Monitor
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Supply chain risk analytics and shipment monitoring
            </Typography>
          </Box>
        </Stack>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Items
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {totalItems}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#E3F2FD', color: '#2b88d8' }}>
                    <SupplierIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
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
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Avg OTIF %
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {avgOTIF}%
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}>
                    <RiskIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Vendor Scorecard" />
            <Tab label="Risk Alerts" />
            <Tab label="Supplier Performance" />
          </Tabs>
        </Paper>

        {/* Error Banner */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error Loading Data</AlertTitle>
            {error}
          </Alert>
        )}
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Paper sx={{ p: 3, height: 600 }}>
          <DataGrid
            rows={vendorMetrics}
            columns={vendorColumns}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          />
        </Paper>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Paper sx={{ p: 3, height: 600 }}>
          <DataGrid
            rows={alerts}
            columns={alertColumns}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          />
        </Paper>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Paper sx={{ p: 3, height: 600 }}>
          <DataGrid
            rows={supplierPerf}
            columns={supplierPerfColumns}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          />
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default InboundRiskMonitor;
