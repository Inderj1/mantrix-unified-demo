import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  LocalShipping, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, CheckCircle, Schedule, Send,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

const StoreReplenishment = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      // Aligned data: Uses same 12 stores and current inventory values from StoreHealthMonitor
      const replenishmentData = [
        // DC-East Region Orders
        { id: 'ORDER-2025-001234', store_id: 'Store-Chicago-001', store_name: 'Chicago Magnificent Mile', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', current_inventory: 130, reorder_point: 162, target_inventory: 162, eoq: 180, base_order_qty: 32, moq: 10, order_multiple: 12, final_order_qty: 36, unit_cost: 25.00, order_value: 900, lead_time_days: 7, supplier: 'DC-East', release_date: '2025-10-29', expected_arrival: '2025-11-05', truck_capacity: 500, truck_utilization: 0.072, priority: 'Normal', status: 'Generate Order', action: 'Order triggered: Current (130) < ROP (162)' },
        { id: 'ORDER-2025-001235', store_id: 'Store-NYC-015', store_name: 'NYC Fifth Avenue', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', current_inventory: 180, reorder_point: 190, target_inventory: 190, eoq: 228, base_order_qty: 10, moq: 10, order_multiple: 12, final_order_qty: 12, unit_cost: 25.00, order_value: 300, lead_time_days: 7, supplier: 'DC-East', release_date: '2025-10-30', expected_arrival: '2025-11-06', truck_capacity: 500, truck_utilization: 0.024, priority: 'Normal', status: 'Generate Order', action: 'Order triggered: Current (180) < ROP (190)' },
        { id: 'ORDER-2025-001236', store_id: 'Store-Boston-022', store_name: 'Boston Newbury St', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', current_inventory: 200, reorder_point: 180, target_inventory: 180, eoq: 200, base_order_qty: 0, moq: 10, order_multiple: 12, final_order_qty: 0, unit_cost: 25.00, order_value: 0, lead_time_days: 7, supplier: 'DC-East', release_date: null, expected_arrival: null, truck_capacity: 500, truck_utilization: 0, priority: 'Hold', status: 'No Action', action: 'Above target - no order needed' },
        { id: 'ORDER-2025-001237', store_id: 'Store-Philly-018', store_name: 'Philadelphia Rittenhouse', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', current_inventory: 150, reorder_point: 165, target_inventory: 165, eoq: 176, base_order_qty: 15, moq: 10, order_multiple: 12, final_order_qty: 24, unit_cost: 25.00, order_value: 600, lead_time_days: 7, supplier: 'DC-East', release_date: '2025-10-29', expected_arrival: '2025-11-05', truck_capacity: 500, truck_utilization: 0.048, priority: 'Normal', status: 'Generate Order', action: 'Order triggered: Current (150) < ROP (165)' },
        { id: 'ORDER-2025-001238', store_id: 'Store-DC-Metro-012', store_name: 'DC Georgetown', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', current_inventory: 140, reorder_point: 170, target_inventory: 170, eoq: 184, base_order_qty: 30, moq: 10, order_multiple: 12, final_order_qty: 36, unit_cost: 25.00, order_value: 900, lead_time_days: 7, supplier: 'DC-East', release_date: '2025-10-29', expected_arrival: '2025-11-05', truck_capacity: 500, truck_utilization: 0.072, priority: 'Normal', status: 'Generate Order', action: 'Order triggered: Current (140) < ROP (170)' },
        { id: 'ORDER-2025-001239', store_id: 'Store-Baltimore-009', store_name: 'Baltimore Harbor', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', current_inventory: 120, reorder_point: 155, target_inventory: 155, eoq: 160, base_order_qty: 35, moq: 10, order_multiple: 12, final_order_qty: 36, unit_cost: 25.00, order_value: 900, lead_time_days: 7, supplier: 'DC-East', release_date: '2025-10-29', expected_arrival: '2025-11-05', truck_capacity: 500, truck_utilization: 0.072, priority: 'Normal', status: 'Generate Order', action: 'Order triggered: Current (120) < ROP (155)' },

        // DC-Midwest Region Orders
        { id: 'ORDER-2025-001240', store_id: 'Store-Dallas-019', store_name: 'Dallas Galleria', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', current_inventory: 95, reorder_point: 140, target_inventory: 140, eoq: 144, base_order_qty: 45, moq: 10, order_multiple: 12, final_order_qty: 48, unit_cost: 25.00, order_value: 1200, lead_time_days: 7, supplier: 'DC-Midwest', release_date: '2025-10-29', expected_arrival: '2025-11-05', truck_capacity: 500, truck_utilization: 0.096, priority: 'Normal', status: 'Generate Order', action: 'Order triggered: Current (95) < ROP (140)' },
        { id: 'ORDER-2025-001241', store_id: 'Store-Miami-008', store_name: 'Miami Design District', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', current_inventory: 340, reorder_point: 170, target_inventory: 170, eoq: 176, base_order_qty: 0, moq: 10, order_multiple: 12, final_order_qty: 0, unit_cost: 22.00, order_value: 0, lead_time_days: 7, supplier: 'DC-Midwest', release_date: null, expected_arrival: null, truck_capacity: 500, truck_utilization: 0, priority: 'Hold', status: 'No Action', action: 'Overstock: Current (340) >> Target (170) - Stop ordering' },
        { id: 'ORDER-2025-001242', store_id: 'Store-Minneapolis-031', store_name: 'Minneapolis Mall', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', current_inventory: 110, reorder_point: 145, target_inventory: 145, eoq: 152, base_order_qty: 35, moq: 10, order_multiple: 12, final_order_qty: 36, unit_cost: 25.00, order_value: 900, lead_time_days: 7, supplier: 'DC-Midwest', release_date: '2025-10-29', expected_arrival: '2025-11-05', truck_capacity: 500, truck_utilization: 0.072, priority: 'Normal', status: 'Generate Order', action: 'Order triggered: Current (110) < ROP (145)' },
        { id: 'ORDER-2025-001243', store_id: 'Store-Detroit-025', store_name: 'Detroit Somerset', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', current_inventory: 100, reorder_point: 135, target_inventory: 135, eoq: 136, base_order_qty: 35, moq: 10, order_multiple: 12, final_order_qty: 36, unit_cost: 25.00, order_value: 900, lead_time_days: 7, supplier: 'DC-Midwest', release_date: '2025-10-29', expected_arrival: '2025-11-05', truck_capacity: 500, truck_utilization: 0.072, priority: 'Normal', status: 'Generate Order', action: 'Order triggered: Current (100) < ROP (135)' },
        { id: 'ORDER-2025-001244', store_id: 'Store-STL-014', store_name: 'St Louis Plaza', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', current_inventory: 90, reorder_point: 125, target_inventory: 125, eoq: 128, base_order_qty: 35, moq: 10, order_multiple: 12, final_order_qty: 36, unit_cost: 25.00, order_value: 900, lead_time_days: 7, supplier: 'DC-Midwest', release_date: '2025-10-29', expected_arrival: '2025-11-05', truck_capacity: 500, truck_utilization: 0.072, priority: 'Normal', status: 'Generate Order', action: 'Order triggered: Current (90) < ROP (125)' },
        { id: 'ORDER-2025-001245', store_id: 'Store-KC-027', store_name: 'Kansas City Plaza', product_sku: 'MR_HAIR_101', product_name: 'Premium Hair Color Kit', current_inventory: 85, reorder_point: 120, target_inventory: 120, eoq: 120, base_order_qty: 35, moq: 10, order_multiple: 12, final_order_qty: 36, unit_cost: 25.00, order_value: 900, lead_time_days: 7, supplier: 'DC-Midwest', release_date: '2025-10-29', expected_arrival: '2025-11-05', truck_capacity: 500, truck_utilization: 0.072, priority: 'Normal', status: 'Generate Order', action: 'Order triggered: Current (85) < ROP (120)' },
      ];

      setData(replenishmentData);

      const totalOrders = replenishmentData.filter(d => d.final_order_qty > 0).length;
      const totalValue = replenishmentData.reduce((sum, row) => sum + row.order_value, 0);
      const expediteCount = replenishmentData.filter(d => d.priority === 'Expedite').length;
      const holdCount = replenishmentData.filter(d => d.status === 'No Action').length;

      setMetrics({
        totalOrders,
        totalValue,
        expediteCount,
        holdCount,
        avgOrderValue: totalOrders > 0 ? (totalValue / totalOrders).toFixed(0) : 0,
      });
      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'Order ID', minWidth: 160, flex: 1.3 },
    { field: 'store_id', headerName: 'Store ID', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
    { field: 'store_name', headerName: 'Store Name', minWidth: 180, flex: 1.4 },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_name', headerName: 'Product', minWidth: 180, flex: 1.4 },
    { field: 'current_inventory', headerName: 'Current', minWidth: 100, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'reorder_point', headerName: 'ROP', minWidth: 100, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'base_order_qty', headerName: 'Base Qty', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'moq', headerName: 'MOQ', minWidth: 90, flex: 0.7, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'order_multiple', headerName: 'Case Pack', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'final_order_qty', headerName: 'Final Order Qty', minWidth: 130, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'unit_cost', headerName: 'Unit Cost ($)', minWidth: 120, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `$${params.value.toFixed(2)}` },
    { field: 'order_value', headerName: 'Order Value ($)', minWidth: 130, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `$${params.value.toLocaleString()}` },
    { field: 'supplier', headerName: 'Supplier / DC', minWidth: 130, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'release_date', headerName: 'Release Date', minWidth: 120, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'expected_arrival', headerName: 'Expected Arrival', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
    { field: 'truck_utilization', headerName: 'Truck Util %', minWidth: 120, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `${(params.value * 100).toFixed(1)}%` },
    {
      field: 'priority',
      headerName: 'Priority',
      minWidth: 110,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Expedite' ? 'error' : params.value === 'Normal' ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 140,
      flex: 1.1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'action',
      headerName: 'Action / Trigger',
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
            <Typography color="primary" variant="body1" fontWeight={600}>Replenishment Execution</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <LocalShipping sx={{ fontSize: 32, color: '#3b82f6' }} />
              <Typography variant="h4" fontWeight={700}>Replenishment Execution (Sell-In)</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Automatically generate purchase orders with MOQ/lot size validation and truck optimization
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <LocalShipping sx={{ color: '#3b82f6' }} />
                  <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#3b82f6">{metrics.totalOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Total Value</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">${(metrics.totalValue / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#ef4444', 0.1)} 0%, ${alpha('#ef4444', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Send sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" color="text.secondary">Expedite</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#ef4444">{metrics.expediteCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Schedule sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">On Hold</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.holdCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%' }}>
        <DataGrid
          rows={data}
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

export default StoreReplenishment;
