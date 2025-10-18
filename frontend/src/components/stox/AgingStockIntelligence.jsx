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
  Schedule as AgingIcon,
  Inventory as InventoryIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AttachMoney as MoneyIcon,
  LocalOffer as DiscountIcon,
  EventBusy as ExpiryIcon,
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

const getAgingColor = (days) => {
  if (days >= 180) return '#F44336';
  if (days >= 120) return '#FF9800';
  if (days >= 60) return '#FFC107';
  return '#4CAF50';
};

const getAgingCategory = (days) => {
  if (days >= 180) return 'Critical';
  if (days >= 120) return 'High Risk';
  if (days >= 60) return 'At Risk';
  return 'Normal';
};

const getActionColor = (action) => {
  if (action === 'Clearance Sale') return '#F44336';
  if (action === 'Discount') return '#FF9800';
  if (action === 'Transfer') return '#42A5F5';
  return '#4CAF50';
};

// TabPanel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`aging-stock-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AgingStockIntelligence = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);

  // Tab 1: Aging Analysis
  const [agingInventory, setAgingInventory] = useState([]);

  // Tab 2: Obsolescence Risk
  const [obsolescenceRisk, setObsolescenceRisk] = useState([]);

  // Tab 3: Clearance Recommendations
  const [clearanceRecs, setClearanceRecs] = useState([]);

  // Load data when tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 0) {
        // Tab 1: Aging Analysis
        const result = await stoxService.getAgingInventory();
        const inv = result.inventory || [];
        setAgingInventory(inv.map((item, idx) => ({
          id: idx + 1,
          material_id: item.material_id || 'N/A',
          plant: item.plant || 'Unknown',
          annual_demand: Math.round(item.annual_demand || 0),
          working_capital: Math.round(item.working_capital || 0),
          days_on_hand: item.days_on_hand || 0,
          aging_status: item.aging_status || 'Normal',
        })));
      } else if (activeTab === 1) {
        // Tab 2: Obsolescence Risk
        const result = await stoxService.getObsolescenceRisk();
        const risk = result.risk_items || [];
        setObsolescenceRisk(risk.map((item, idx) => ({
          id: idx + 1,
          material_id: item.material_id || 'N/A',
          plant: item.plant || 'Unknown',
          obsolescence_cost: Math.round(item.s4_obsolescence_cost || 0),
          working_capital: Math.round(item.stoxai_total_working_capital || 0),
          risk_percentage: parseFloat(item.risk_percentage || 0).toFixed(2),
        })));
      } else if (activeTab === 2) {
        // Tab 3: Clearance Recommendations
        const result = await stoxService.getClearanceRecommendations();
        const recs = result.recommendations || [];
        setClearanceRecs(recs.map((item, idx) => ({
          id: idx + 1,
          material_id: item.material_id || 'N/A',
          plant: item.plant || 'Unknown',
          annual_demand: Math.round(item.annual_demand || 0),
          stock_value: Math.round(item.stock_value || 0),
          estimated_loss: Math.round(item.estimated_loss || 0),
          suggested_markdown_pct: parseFloat(item.suggested_markdown_pct || 0).toFixed(2),
        })));
      }
    } catch (err) {
      console.error('Error loading aging stock data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Tab 1: Aging Analysis Columns
  const agingColumns = [
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
      field: 'annual_demand',
      headerName: 'Annual Demand',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="medium">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            units/year
          </Typography>
        </Box>
      ),
    },
    {
      field: 'working_capital',
      headerName: 'Working Capital',
      flex: 1,
      minWidth: 170,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {formatCurrency(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            invested
          </Typography>
        </Box>
      ),
    },
    {
      field: 'days_on_hand',
      headerName: 'Days on Hand',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Typography
            variant="body2"
            fontWeight="bold"
            color={params.value >= 180 ? 'error.main' : params.value >= 120 ? 'warning.main' : 'success.main'}
          >
            {params.value}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min((params.value / 360) * 100, 100)}
            sx={{
              mt: 0.5,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#E1E4E8',
              '& .MuiLinearProgress-bar': {
                backgroundColor: params.value >= 180 ? '#C62828' : params.value >= 120 ? '#E65100' : '#2E7D32',
              },
            }}
          />
        </Box>
      ),
    },
    {
      field: 'aging_status',
      headerName: 'Aging Status',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          icon={params.value === 'Very Slow' || params.value === 'Slow' ? <AgingIcon /> : <InventoryIcon />}
          label={params.value}
          size="small"
          color={params.value === 'Very Slow' || params.value === 'Slow' ? 'error' : params.value === 'Moderate' ? 'warning' : 'success'}
          variant="filled"
          sx={{ fontWeight: 700 }}
        />
      ),
    },
  ];

  // Tab 2: Obsolescence Risk Columns
  const obsolescenceColumns = [
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
      field: 'obsolescence_cost',
      headerName: 'Obsolescence Cost',
      width: 200,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="error.main" sx={{ fontSize: '0.95rem' }}>
            {formatCurrency(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            potential loss
          </Typography>
        </Box>
      ),
    },
    {
      field: 'working_capital',
      headerName: 'Working Capital',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {formatCurrency(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            invested
          </Typography>
        </Box>
      ),
    },
    {
      field: 'risk_percentage',
      headerName: 'Risk %',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Chip
            icon={<WarningIcon />}
            label={`${params.value}%`}
            size="small"
            sx={{
              backgroundColor: params.value >= 15 ? '#FFEBEE' : params.value >= 10 ? '#FFF3E0' : '#E8F5E9',
              color: params.value >= 15 ? '#C62828' : params.value >= 10 ? '#E65100' : '#2E7D32',
              fontWeight: 700,
            }}
          />
          <LinearProgress
            variant="determinate"
            value={Math.min((params.value / 20) * 100, 100)}
            sx={{
              mt: 0.5,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#E1E4E8',
              '& .MuiLinearProgress-bar': {
                backgroundColor: params.value >= 15 ? '#C62828' : params.value >= 10 ? '#E65100' : '#2E7D32',
              },
            }}
          />
        </Box>
      ),
    },
  ];

  // Tab 3: Clearance Recommendations Columns
  const clearanceColumns = [
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
      field: 'annual_demand',
      headerName: 'Annual Demand',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="medium">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            units/year
          </Typography>
        </Box>
      ),
    },
    {
      field: 'stock_value',
      headerName: 'Stock Value',
      width: 160,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {formatCurrency(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            current
          </Typography>
        </Box>
      ),
    },
    {
      field: 'estimated_loss',
      headerName: 'Estimated Loss',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="error.main">
            {formatCurrency(params.value)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min((params.value / 50000) * 100, 100)}
            sx={{
              mt: 0.5,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#FFEBEE',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#C62828',
              },
            }}
          />
        </Box>
      ),
    },
    {
      field: 'suggested_markdown_pct',
      headerName: 'Suggested Markdown %',
      width: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          icon={<DiscountIcon />}
          label={`${params.value}% OFF`}
          size="small"
          sx={{
            backgroundColor: params.value >= 50 ? '#FFEBEE' : params.value >= 30 ? '#FFF3E0' : '#E8F5E9',
            color: params.value >= 50 ? '#C62828' : params.value >= 30 ? '#E65100' : '#2E7D32',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        />
      ),
    },
  ];

  // Summary Statistics
  const currentData = activeTab === 0 ? agingInventory : activeTab === 1 ? obsolescenceRisk : clearanceRecs;
  const totalItems = currentData.length;
  const totalValue = currentData.reduce((sum, item) => sum + (item.working_capital || item.stock_value || 0), 0);
  const totalRisk = activeTab === 1 ? obsolescenceRisk.reduce((sum, item) => sum + (item.obsolescence_cost || 0), 0) : 0;

  return (
    <Box sx={{
      p: 3,
      height: '100%',
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
            Aging Stock Intelligence
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
              Aging Stock Intelligence
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Smart obsolescence prevention and clearance strategies
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
                  <Avatar sx={{ bgcolor: '#E3F2FD', color: '#1976d2' }}>
                    <InventoryIcon />
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
                      Total Value
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(totalValue)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}>
                    <MoneyIcon />
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
                      Total Risk
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="error.main">
                      {formatCurrency(totalRisk)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#FFEBEE', color: '#C62828' }}>
                    <WarningIcon />
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
            <Tab label="Aging Analysis" />
            <Tab label="Obsolescence Risk" />
            <Tab label="Clearance Recommendations" />
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
            rows={agingInventory}
            columns={agingColumns}
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
            rows={obsolescenceRisk}
            columns={obsolescenceColumns}
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
            rows={clearanceRecs}
            columns={clearanceColumns}
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

export default AgingStockIntelligence;
