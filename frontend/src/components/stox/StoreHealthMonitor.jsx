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
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  ShowChart,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  Warning,
  CheckCircle,
  Error,
  Store,
  Inventory,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

const StoreHealthMonitor = ({ onBack }) => {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = () => {
    setLoading(true);

    setTimeout(() => {
      // Aligned data: 12 stores (6 DC-East, 6 DC-Midwest) - aggregates to DC-level totals
      const healthData = [
        // DC-East Region Stores
        { id: 'HM0001', store_id: 'Store-Chicago-001', store_name: 'Chicago Magnificent Mile', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_demand: 20, current_inventory: 130, inbound_shipments: 20, committed_orders: 5, available_inventory: 145, target_inventory: 162, safety_stock: 22, days_of_supply: 7.25, inventory_health_pct: 88, health_status: '🟡 Reorder Soon (Yellow)', fill_rate: 0.965, stockout_risk: 'Low Risk', action: 'Plan replenishment - inventory below 70% of target' },
        { id: 'HM0002', store_id: 'Store-NYC-015', store_name: 'NYC Fifth Avenue', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_demand: 27, current_inventory: 180, inbound_shipments: 30, committed_orders: 10, available_inventory: 200, target_inventory: 190, safety_stock: 28, days_of_supply: 7.4, inventory_health_pct: 106, health_status: '🟢 Healthy (Green)', fill_rate: 0.985, stockout_risk: 'Low Risk', action: 'No action needed' },
        { id: 'HM0003', store_id: 'Store-Boston-022', store_name: 'Boston Newbury St', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_demand: 25, current_inventory: 200, inbound_shipments: 20, committed_orders: 15, available_inventory: 205, target_inventory: 180, safety_stock: 26, days_of_supply: 8.2, inventory_health_pct: 116, health_status: '🟢 Healthy (Green)', fill_rate: 0.98, stockout_risk: 'Low Risk', action: 'No action needed' },
        { id: 'HM0004', store_id: 'Store-Philly-018', store_name: 'Philadelphia Rittenhouse', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_demand: 22, current_inventory: 150, inbound_shipments: 10, committed_orders: 8, available_inventory: 152, target_inventory: 165, safety_stock: 24, days_of_supply: 6.9, inventory_health_pct: 91, health_status: '🟢 Healthy (Green)', fill_rate: 0.97, stockout_risk: 'Low Risk', action: 'No action needed' },
        { id: 'HM0005', store_id: 'Store-DC-Metro-012', store_name: 'DC Georgetown', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_demand: 23, current_inventory: 140, inbound_shipments: 15, committed_orders: 7, available_inventory: 148, target_inventory: 170, safety_stock: 25, days_of_supply: 6.4, inventory_health_pct: 85, health_status: '🟢 Healthy (Green)', fill_rate: 0.96, stockout_risk: 'Low Risk', action: 'No action needed' },
        { id: 'HM0006', store_id: 'Store-Baltimore-009', store_name: 'Baltimore Harbor', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_demand: 20, current_inventory: 120, inbound_shipments: 25, committed_orders: 5, available_inventory: 140, target_inventory: 155, safety_stock: 22, days_of_supply: 7.0, inventory_health_pct: 89, health_status: '🟢 Healthy (Green)', fill_rate: 0.97, stockout_risk: 'Low Risk', action: 'No action needed' },

        // DC-Midwest Region Stores
        { id: 'HM0007', store_id: 'Store-Dallas-019', store_name: 'Dallas Galleria', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_demand: 18, current_inventory: 95, inbound_shipments: 40, committed_orders: 5, available_inventory: 130, target_inventory: 140, safety_stock: 20, days_of_supply: 7.2, inventory_health_pct: 92, health_status: '🟢 Healthy (Green)', fill_rate: 0.975, stockout_risk: 'Low Risk', action: 'No action needed' },
        { id: 'HM0008', store_id: 'Store-Miami-008', store_name: 'Miami Design District', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_demand: 22, current_inventory: 340, inbound_shipments: 0, committed_orders: 15, available_inventory: 325, target_inventory: 170, safety_stock: 25, days_of_supply: 14.8, inventory_health_pct: 207, health_status: '🟠 Overstock (Orange)', fill_rate: 0.99, stockout_risk: 'No Risk', action: 'Slow down orders - too much inventory' },
        { id: 'HM0009', store_id: 'Store-Minneapolis-031', store_name: 'Minneapolis Mall', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_demand: 19, current_inventory: 110, inbound_shipments: 30, committed_orders: 10, available_inventory: 130, target_inventory: 145, safety_stock: 21, days_of_supply: 6.8, inventory_health_pct: 88, health_status: '🟡 Reorder Soon (Yellow)', fill_rate: 0.97, stockout_risk: 'Low Risk', action: 'Plan replenishment - inventory below 70% of target' },
        { id: 'HM0010', store_id: 'Store-Detroit-025', store_name: 'Detroit Somerset', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_demand: 17, current_inventory: 100, inbound_shipments: 20, committed_orders: 8, available_inventory: 112, target_inventory: 135, safety_stock: 19, days_of_supply: 6.6, inventory_health_pct: 80, health_status: '🟢 Healthy (Green)', fill_rate: 0.96, stockout_risk: 'Low Risk', action: 'No action needed' },
        { id: 'HM0011', store_id: 'Store-STL-014', store_name: 'St Louis Plaza', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_demand: 16, current_inventory: 90, inbound_shipments: 15, committed_orders: 6, available_inventory: 99, target_inventory: 125, safety_stock: 18, days_of_supply: 6.2, inventory_health_pct: 76, health_status: '🟢 Healthy (Green)', fill_rate: 0.95, stockout_risk: 'Low Risk', action: 'No action needed' },
        { id: 'HM0012', store_id: 'Store-KC-027', store_name: 'Kansas City Plaza', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', forecasted_demand: 15, current_inventory: 85, inbound_shipments: 10, committed_orders: 4, available_inventory: 91, target_inventory: 120, safety_stock: 17, days_of_supply: 6.1, inventory_health_pct: 72, health_status: '🟢 Healthy (Green)', fill_rate: 0.94, stockout_risk: 'Low Risk', action: 'No action needed' },
      ];

      setHealthData(healthData);

      // Calculate metrics based on health status
      const healthyCount = healthData.filter(d => d.health_status.includes('Green')).length;
      const warningCount = healthData.filter(d => d.health_status.includes('Yellow')).length;
      const criticalCount = healthData.filter(d => d.health_status.includes('Red')).length;
      const overstockCount = healthData.filter(d => d.health_status.includes('Orange')).length;
      const avgHealthScore = (healthData.reduce((sum, row) => sum + row.inventory_health_pct, 0) / healthData.length).toFixed(1);
      const avgFillRate = ((healthData.reduce((sum, row) => sum + row.fill_rate, 0) / healthData.length) * 100).toFixed(1);

      setMetrics({
        totalRecords: healthData.length,
        healthyCount,
        warningCount,
        criticalCount,
        overstockCount,
        avgHealthScore,
        avgFillRate,
      });

      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 0.8 },
    { field: 'store_id', headerName: 'Store ID', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
    { field: 'store_name', headerName: 'Store Name', minWidth: 180, flex: 1.4 },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_name', headerName: 'Product', minWidth: 180, flex: 1.4 },
    {
      field: 'forecasted_demand',
      headerName: 'Daily Forecast',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'current_inventory',
      headerName: 'Current',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'inbound_shipments',
      headerName: 'Inbound',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'committed_orders',
      headerName: 'Committed',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'available_inventory',
      headerName: 'Available',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'target_inventory',
      headerName: 'Target',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'safety_stock',
      headerName: 'Safety Stock',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'days_of_supply',
      headerName: 'Days of Stock',
      minWidth: 130,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `${params.value?.toFixed(1)} days`,
    },
    {
      field: 'inventory_health_pct',
      headerName: 'Health %',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          color={params.value >= 70 ? 'success' : params.value >= 30 ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'health_status',
      headerName: 'Status',
      minWidth: 160,
      flex: 1.3,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'fill_rate',
      headerName: 'Fill Rate',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `${(params.value * 100).toFixed(1)}%`,
    },
    {
      field: 'stockout_risk',
      headerName: 'Stockout Risk',
      minWidth: 180,
      flex: 1.4,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'action',
      headerName: 'Action / Recommendation',
      minWidth: 250,
      flex: 2,
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Store System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Inventory Health Monitor</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <ShowChart sx={{ fontSize: 32, color: '#10b981' }} />
              <Typography variant="h4" fontWeight={700}>Inventory Health Monitor</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Real-time inventory status with health alerts and days of supply monitoring
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={fetchHealthData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Healthy</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.healthyCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Warning sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">Warning</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.warningCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#ef4444', 0.1)} 0%, ${alpha('#ef4444', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Error sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" color="text.secondary">Critical</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#ef4444">{metrics.criticalCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Inventory sx={{ color: '#3b82f6' }} />
                  <Typography variant="body2" color="text.secondary">Avg Health</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#3b82f6">{metrics.avgHealthScore}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%' }}>
        <DataGrid
          rows={healthData}
          columns={columns}
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={stoxTheme.getDataGridSx()}
        />
      </Paper>
    </Box>
  );
};

export default StoreHealthMonitor;
