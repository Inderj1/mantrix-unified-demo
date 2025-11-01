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
      // Multiple SKUs with store-level replenishment data (aligned with StoreHealthMonitor)
      const stores = [
        { id: 'Store-Chicago-001', name: 'Chicago Magnificent Mile', supplier: 'DC-East', baseData: { 'MR_HAIR_101': { current: 130, rop: 162, target: 162 }, 'MR_HAIR_201': { current: 85, rop: 105, target: 105 }, 'MR_CARE_301': { current: 60, rop: 75, target: 75 } } },
        { id: 'Store-NYC-015', name: 'NYC Fifth Avenue', supplier: 'DC-East', baseData: { 'MR_HAIR_101': { current: 180, rop: 190, target: 190 }, 'MR_HAIR_201': { current: 115, rop: 125, target: 125 }, 'MR_CARE_301': { current: 80, rop: 90, target: 90 } } },
        { id: 'Store-Boston-022', name: 'Boston Newbury St', supplier: 'DC-East', baseData: { 'MR_HAIR_101': { current: 200, rop: 180, target: 180 }, 'MR_HAIR_201': { current: 130, rop: 115, target: 115 }, 'MR_CARE_301': { current: 90, rop: 82, target: 82 } } },
        { id: 'Store-Philly-018', name: 'Philadelphia Rittenhouse', supplier: 'DC-East', baseData: { 'MR_HAIR_101': { current: 150, rop: 165, target: 165 }, 'MR_HAIR_201': { current: 95, rop: 108, target: 108 }, 'MR_CARE_301': { current: 68, rop: 78, target: 78 } } },
        { id: 'Store-DC-Metro-012', name: 'DC Georgetown', supplier: 'DC-East', baseData: { 'MR_HAIR_101': { current: 140, rop: 170, target: 170 }, 'MR_HAIR_201': { current: 92, rop: 112, target: 112 }, 'MR_CARE_301': { current: 65, rop: 80, target: 80 } } },
        { id: 'Store-Baltimore-009', name: 'Baltimore Harbor', supplier: 'DC-East', baseData: { 'MR_HAIR_101': { current: 120, rop: 155, target: 155 }, 'MR_HAIR_201': { current: 78, rop: 102, target: 102 }, 'MR_CARE_301': { current: 55, rop: 73, target: 73 } } },
        { id: 'Store-Dallas-019', name: 'Dallas Galleria', supplier: 'DC-Midwest', baseData: { 'MR_HAIR_101': { current: 95, rop: 140, target: 140 }, 'MR_HAIR_201': { current: 65, rop: 92, target: 92 }, 'MR_CARE_301': { current: 45, rop: 66, target: 66 } } },
        { id: 'Store-Miami-008', name: 'Miami Design District', supplier: 'DC-Midwest', baseData: { 'MR_HAIR_101': { current: 340, rop: 170, target: 170 }, 'MR_HAIR_201': { current: 210, rop: 112, target: 112 }, 'MR_CARE_301': { current: 145, rop: 80, target: 80 } } },
        { id: 'Store-Minneapolis-031', name: 'Minneapolis Mall', supplier: 'DC-Midwest', baseData: { 'MR_HAIR_101': { current: 110, rop: 145, target: 145 }, 'MR_HAIR_201': { current: 72, rop: 95, target: 95 }, 'MR_CARE_301': { current: 52, rop: 68, target: 68 } } },
        { id: 'Store-Detroit-025', name: 'Detroit Somerset', supplier: 'DC-Midwest', baseData: { 'MR_HAIR_101': { current: 100, rop: 135, target: 135 }, 'MR_HAIR_201': { current: 68, rop: 88, target: 88 }, 'MR_CARE_301': { current: 48, rop: 63, target: 63 } } },
        { id: 'Store-STL-014', name: 'St Louis Plaza', supplier: 'DC-Midwest', baseData: { 'MR_HAIR_101': { current: 90, rop: 125, target: 125 }, 'MR_HAIR_201': { current: 60, rop: 82, target: 82 }, 'MR_CARE_301': { current: 42, rop: 58, target: 58 } } },
        { id: 'Store-KC-027', name: 'Kansas City Plaza', supplier: 'DC-Midwest', baseData: { 'MR_HAIR_101': { current: 85, rop: 120, target: 120 }, 'MR_HAIR_201': { current: 56, rop: 78, target: 78 }, 'MR_CARE_301': { current: 40, rop: 56, target: 56 } } },
      ];

      const products = [
        { sku: 'MR_HAIR_101', name: 'Premium Hair Color Kit', unitCost: 25.00 },
        { sku: 'MR_HAIR_201', name: 'Root Touch-Up Spray', unitCost: 22.00 },
        { sku: 'MR_CARE_301', name: 'Intensive Hair Mask', unitCost: 28.00 },
      ];

      const replenishmentData = [];
      let orderCounter = 1234;

      stores.forEach((store) => {
        products.forEach((product) => {
          const base = store.baseData[product.sku];
          const baseOrderQty = base.target - base.current;
          const moq = 10;
          const orderMultiple = 12;

          let finalOrderQty = 0;
          let status = 'No Action';
          let priority = 'Hold';
          let action = '';
          let releaseDate = null;
          let expectedArrival = null;

          if (base.current < base.rop) {
            // Round up to order multiple
            finalOrderQty = Math.ceil(Math.max(baseOrderQty, moq) / orderMultiple) * orderMultiple;
            status = 'Generate Order';
            priority = 'Normal';
            action = `Order triggered: Current (${base.current}) < ROP (${base.rop})`;
            releaseDate = '2025-10-29';
            expectedArrival = '2025-11-05';
          } else if (base.current > base.target * 1.5) {
            action = `Overstock: Current (${base.current}) >> Target (${base.target}) - Stop ordering`;
          } else {
            action = 'Above ROP - no order needed';
          }

          const orderValue = finalOrderQty * product.unitCost;

          // NEW TILE 4 COLUMNS
          // 1. Source DC Region (based on supplier DC)
          const sourceDCRegion = store.supplier; // Already has DC-East or DC-Midwest

          // 2. Freight Rate ($/unit) - Distance-based calculation
          // DC-East stores get lower freight rate from DC-East, higher from DC-Midwest
          const freightRatePerUnit = store.supplier === 'DC-East' ? 0.50 : 0.75;

          // 3. Freight Cost ($) = Qty × FreightRate
          const freightCost = finalOrderQty * freightRatePerUnit;

          // 4. Final Purchase Requisition Created (Yes/No flag)
          const prCreated = status === 'Generate Order' ? (Math.random() > 0.3 ? 'Yes' : 'Pending') : 'No';

          replenishmentData.push({
            id: `ORDER-2025-${String(orderCounter++).padStart(6, '0')}`,
            store_id: store.id,
            store_name: store.name,
            product_sku: product.sku,
            product_name: product.name,
            current_inventory: base.current,
            reorder_point: base.rop,
            target_inventory: base.target,
            final_order_qty: finalOrderQty,
            unit_cost: product.unitCost,
            order_value: orderValue,
            lead_time_days: 7,
            supplier: store.supplier,
            release_date: releaseDate,
            expected_arrival: expectedArrival,
            priority: priority,
            status: status,
            action: action,
            // New Tile 4 columns
            source_dc_region: sourceDCRegion,
            freight_rate: freightRatePerUnit,
            freight_cost: freightCost,
            pr_created: prCreated,
          });
        });
      });

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
    {
      field: 'current_inventory',
      headerName: 'Current',
      minWidth: 100,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'reorder_point',
      headerName: 'ROP',
      minWidth: 100,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'final_order_qty',
      headerName: 'Order Qty',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toLocaleString()}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value > 0 ? alpha('#3b82f6', 0.12) : alpha('#94a3b8', 0.12),
            color: params.value > 0 ? '#2563eb' : '#64748b',
          }}
        />
      ),
    },
    {
      field: 'order_value',
      headerName: 'Order Value ($)',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value?.toLocaleString()}`}
          size="small"
          sx={{ fontWeight: 700, bgcolor: alpha('#10b981', 0.12), color: '#059669' }}
        />
      ),
    },
    { field: 'supplier', headerName: 'Supplier / DC', minWidth: 130, flex: 1, align: 'center', headerAlign: 'center' },
    {
      field: 'source_dc_region',
      headerName: 'Source DC Region',
      minWidth: 150,
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value === 'DC-East' ? alpha('#3b82f6', 0.12) : alpha('#8b5cf6', 0.12),
            color: params.value === 'DC-East' ? '#2563eb' : '#7c3aed',
          }}
        />
      ),
    },
    {
      field: 'freight_rate',
      headerName: 'Freight Rate ($/unit)',
      minWidth: 160,
      flex: 1.3,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toFixed(2)}`,
    },
    {
      field: 'freight_cost',
      headerName: 'Freight Cost ($)',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value?.toFixed(2)}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#f59e0b', 0.12),
            color: '#d97706',
          }}
        />
      ),
    },
    {
      field: 'pr_created',
      headerName: 'PR Created',
      minWidth: 120,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Yes' ? 'success' : params.value === 'Pending' ? 'warning' : 'default'}
          icon={params.value === 'Yes' ? <CheckCircle /> : undefined}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    { field: 'release_date', headerName: 'Release Date', minWidth: 120, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'expected_arrival', headerName: 'Expected Arrival', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
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
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Generate Order' ? 'primary' : 'default'}
        />
      ),
    },
    {
      field: 'generate_order',
      headerName: 'Action',
      minWidth: 150,
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        if (params.row.status === 'Generate Order' && params.row.final_order_qty > 0) {
          return (
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                alert(`Generating order for ${params.row.store_name}: ${params.row.final_order_qty} units of ${params.row.product_sku}`);
              }}
              sx={{ fontSize: '0.70rem', py: 0.5 }}
            >
              Create STO/PR
            </Button>
          );
        }
        return <Typography variant="caption" color="text.secondary">{params.row.action}</Typography>;
      },
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Store System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Tile 4: Stock Transfer Execution</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <LocalShipping sx={{ fontSize: 32, color: '#3b82f6' }} />
              <Typography variant="h4" fontWeight={700}>Tile 4: Stock Transfer Execution (DC → Store)</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Match store demand to best DC based on availability, freight cost, and ETA - create executable STO/PR in SAP
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
