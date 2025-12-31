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
  Alert,
  AlertTitle,
  Breadcrumbs,
  Link,
  Avatar,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  SwapHoriz as TransferIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as CostIcon,
  Speed as UrgencyIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import stoxService from '../../services/stoxService';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';

// Utility Functions
const formatNumber = (value) => {
  return value.toLocaleString();
};

const formatCurrency = (value) => {
  return `$${value.toLocaleString()}`;
};

const getUrgencyColor = (level) => {
  if (level === 'Critical') return '#F44336';
  if (level === 'High') return '#FF9800';
  if (level === 'Medium') return '#42A5F5';
  return '#4CAF50';
};

const getStatusColor = (status) => {
  if (status === 'Recommended') return '#4CAF50';
  if (status === 'In Progress') return '#42A5F5';
  if (status === 'Pending Approval') return '#FF9800';
  return '#757575';
};

// TabPanel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reallocation-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ReallocationOptimizer = ({ onBack }) => {
  const tileConfig = getTileDataConfig('reallocation-optimizer');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);

  // Tab 1: Transfer Opportunities
  const [opportunities, setOpportunities] = useState([]);

  // Tab 2: Lot Size Optimization
  const [lotSizeData, setLotSizeData] = useState([]);

  // Tab 3: Transfer Recommendations
  const [transferRecs, setTransferRecs] = useState([]);

  // Load data when tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 0) {
        // Tab 1: Transfer Opportunities (reallocation by excess/deficit)
        const result = await stoxService.getReallocationOpportunities();
        const opps = result.opportunities || [];
        setOpportunities(opps.map((item, idx) => ({
          id: idx + 1,
          material_id: item.material_id || 'N/A',
          plant: item.plant || 'Unknown',
          stoxai_safety_stock: Math.round(item.stoxai_safety_stock_qty || 0),
          s4_safety_stock: Math.round(item.s4_safety_stock_qty || 0),
          excess_deficit: Math.round(item.excess_deficit || 0),
          potential_savings: Math.round(item.potential_savings || 0),
        })));
      } else if (activeTab === 1) {
        // Tab 2: Lot Size Optimization
        const result = await stoxService.getLotSizeOptimization();
        const opts = result.optimizations || [];
        setLotSizeData(opts.map((item, idx) => ({
          id: idx + 1,
          material_id: item.material_id || 'N/A',
          plant: item.plant || 'Unknown',
          s4_lot_size: Math.round(item.s4_lot_size || 0),
          stoxai_lot_size: Math.round(item.stoxai_lot_size || 0),
          s4_orders_per_year: Math.round(item.s4_orders_per_year || 0),
          stoxai_orders_per_year: Math.round(item.stoxai_orders_per_year || 0),
          order_reduction: Math.round(item.order_reduction || 0),
          annual_savings: Math.round(item.annual_savings || 0),
        })));
      } else if (activeTab === 2) {
        // Tab 3: Impact Analysis (transfer recommendations by savings)
        const result = await stoxService.getTransferRecommendations();
        const recs = result.recommendations || [];
        setTransferRecs(recs.map((item, idx) => ({
          id: idx + 1,
          material_id: item.material_id || 'N/A',
          plant: item.plant || 'Unknown',
          stoxai_lot_size: Math.round(item.stoxai_lot_size || 0),
          s4_lot_size: Math.round(item.s4_lot_size || 0),
          transfer_savings: Math.round(item.transfer_savings || 0),
        })));
      }
    } catch (err) {
      console.error('Error loading reallocation data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Tab 1: Transfer Opportunities Columns
  const opportunitiesColumns = [
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
      field: 's4_safety_stock',
      headerName: 'S4 Safety Stock',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="medium">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            units
          </Typography>
        </Box>
      ),
    },
    {
      field: 'stoxai_safety_stock',
      headerName: 'StoxAI Safety Stock',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            optimized
          </Typography>
        </Box>
      ),
    },
    {
      field: 'excess_deficit',
      headerName: 'Excess / Deficit',
      width: 160,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value > 0 ? '+' : ''}${formatNumber(params.value)}`}
          size="small"
          sx={{
            backgroundColor: params.value > 0 ? '#E8F5E9' : '#FFEBEE',
            color: params.value > 0 ? '#2E7D32' : '#C62828',
            fontWeight: 700,
            minWidth: 100,
          }}
        />
      ),
    },
    {
      field: 'potential_savings',
      headerName: 'Potential Savings',
      flex: 1.5,
      minWidth: 180,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="success.main" sx={{ fontSize: '0.95rem' }}>
            {formatCurrency(params.value)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min((params.value / 10000) * 100, 100)}
            sx={{
              mt: 0.5,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#E8F5E9',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#2E7D32',
              },
            }}
          />
        </Box>
      ),
    },
  ];

  // Tab 2: Lot Size Optimization Columns
  const lotSizeColumns = [
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
      field: 's4_lot_size',
      headerName: 'S4 Lot Size',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="medium">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            current
          </Typography>
        </Box>
      ),
    },
    {
      field: 'stoxai_lot_size',
      headerName: 'StoxAI Lot Size',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            optimal
          </Typography>
        </Box>
      ),
    },
    {
      field: 's4_orders_per_year',
      headerName: 'S4 Orders/Year',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {formatNumber(params.value)} orders
        </Typography>
      ),
    },
    {
      field: 'stoxai_orders_per_year',
      headerName: 'StoxAI Orders/Year',
      width: 170,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="success.main">
            orders
          </Typography>
        </Box>
      ),
    },
    {
      field: 'order_reduction',
      headerName: 'Order Reduction',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          icon={params.value > 0 ? <TrendingUpIcon /> : null}
          label={`${params.value > 0 ? '-' : ''}${formatNumber(Math.abs(params.value))}`}
          size="small"
          color={params.value > 0 ? 'success' : 'default'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'annual_savings',
      headerName: 'Annual Savings',
      flex: 1.5,
      minWidth: 170,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="success.main" sx={{ fontSize: '0.95rem' }}>
            {formatCurrency(params.value)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min((params.value / 5000) * 100, 100)}
            sx={{
              mt: 0.5,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#E8F5E9',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#2E7D32',
              },
            }}
          />
        </Box>
      ),
    },
  ];

  // Tab 3: Transfer Recommendations Columns
  const transferRecsColumns = [
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
      field: 's4_lot_size',
      headerName: 'S4 Lot Size',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="medium">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            current
          </Typography>
        </Box>
      ),
    },
    {
      field: 'stoxai_lot_size',
      headerName: 'StoxAI Lot Size',
      width: 170,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            recommended
          </Typography>
        </Box>
      ),
    },
    {
      field: 'transfer_savings',
      headerName: 'Transfer Savings',
      width: 200,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right', width: '100%' }}>
          <Typography variant="body2" fontWeight="bold" color="success.main" sx={{ fontSize: '0.95rem' }}>
            {formatCurrency(params.value)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min((params.value / 8000) * 100, 100)}
            sx={{
              mt: 0.5,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#E8F5E9',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#2E7D32',
              },
            }}
          />
        </Box>
      ),
    },
  ];

  // Summary Statistics
  const currentData = activeTab === 0 ? opportunities : activeTab === 1 ? lotSizeData : transferRecs;
  const totalSavings = currentData.reduce((sum, item) => sum + (item.potential_savings || item.annual_savings || item.transfer_savings || 0), 0);
  const totalItems = currentData.length;
  const avgSavings = totalItems > 0 ? Math.round(totalSavings / totalItems) : 0;

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
            Reallocation Optimizer
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
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
                Reallocation Optimizer
              </Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="subtitle1" color="text.secondary">
              Smart stock balancing and strategic transfer recommendations
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
                      Total Savings
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(totalSavings)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}>
                    <CostIcon />
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
                      Avg Savings/Item
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(avgSavings)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}>
                    <TrendingUpIcon />
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
            <Tab label="Transfer Opportunities" />
            <Tab label="Lot Size Optimization" />
            <Tab label="Impact Analysis" />
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
            rows={opportunities}
            columns={opportunitiesColumns}
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
            rows={lotSizeData}
            columns={lotSizeColumns}
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
            rows={transferRecs}
            columns={transferRecsColumns}
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

export default ReallocationOptimizer;
