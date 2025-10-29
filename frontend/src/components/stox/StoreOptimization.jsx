import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Analytics, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, TrendingUp, Inventory,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

const StoreOptimization = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      // Sample data based on store-tiles.xlsx Tab 4 (Inventory Optimizer) and E2E Flow
      const optimizationData = [
        {
          id: 'OPT0001',
          store_id: 'Store-Chicago-001',
          store_name: 'Chicago Magnificent Mile',
          product_sku: 'MR_HAIR_101',
          product_name: 'Premium Hair Color Kit',
          avg_daily_demand: 20,
          demand_std_dev: 5,
          lead_time_days: 7,
          service_level: 0.95,
          z_score: 1.64,
          safety_stock: 22, // 1.64 × 5 × √7
          cycle_stock: 140, // 7 × 20
          reorder_point: 162, // 140 + 22
          unit_cost: 25.00,
          annual_demand: 7300,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 171, // √(2×7300×50÷5)
          eoq_rounded: 180, // Rounded to case pack of 12
          target_inventory: 162, // Cycle Stock + Safety Stock
          abc_class: 'A',
          review_frequency: 'Weekly',
          annual_holding_cost: 405, // 81 × $25 × 20%
          annual_ordering_cost: 2028, // (7300÷180) × $50
          total_annual_cost: 2433 // 405 + 2028
        },
        {
          id: 'OPT0002',
          store_id: 'Store-NYC-015',
          store_name: 'NYC Fifth Avenue',
          product_sku: 'MR_HAIR_101',
          product_name: 'Premium Hair Color Kit',
          avg_daily_demand: 27,
          demand_std_dev: 6,
          lead_time_days: 7,
          service_level: 0.98,
          z_score: 2.05,
          safety_stock: 33, // 2.05 × 6 × √7
          cycle_stock: 189, // 7 × 27
          reorder_point: 222, // 189 + 33
          unit_cost: 25.00,
          annual_demand: 9855,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 222, // √(2×9855×50÷5)
          eoq_rounded: 228, // Rounded to case pack of 12
          target_inventory: 222,
          abc_class: 'A',
          review_frequency: 'Weekly',
          annual_holding_cost: 555, // 111 × $25 × 20%
          annual_ordering_cost: 2165, // (9855÷228) × $50
          total_annual_cost: 2720
        },
        {
          id: 'OPT0003',
          store_id: 'Store-LA-032',
          store_name: 'LA Beverly Center',
          product_sku: 'MR_HAIR_102',
          product_name: 'Root Touch-Up Kit',
          avg_daily_demand: 15,
          demand_std_dev: 4,
          lead_time_days: 5,
          service_level: 0.95,
          z_score: 1.64,
          safety_stock: 15, // 1.64 × 4 × √5
          cycle_stock: 75, // 5 × 15
          reorder_point: 90, // 75 + 15
          unit_cost: 18.00,
          annual_demand: 5475,
          ordering_cost: 45.00,
          carrying_cost_pct: 0.20,
          eoq: 175, // √(2×5475×45÷3.6)
          eoq_rounded: 180,
          target_inventory: 90,
          abc_class: 'B',
          review_frequency: 'Bi-weekly',
          annual_holding_cost: 162, // 45 × $18 × 20%
          annual_ordering_cost: 1369, // (5475÷180) × $45
          total_annual_cost: 1531
        },
        {
          id: 'OPT0004',
          store_id: 'Store-Miami-008',
          store_name: 'Miami Design District',
          product_sku: 'MR_HAIR_103',
          product_name: 'Color Reviving Gloss',
          avg_daily_demand: 12,
          demand_std_dev: 3,
          lead_time_days: 7,
          service_level: 0.93,
          z_score: 1.48,
          safety_stock: 12, // 1.48 × 3 × √7
          cycle_stock: 84, // 7 × 12
          reorder_point: 96, // 84 + 12
          unit_cost: 22.00,
          annual_demand: 4380,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 149, // √(2×4380×50÷4.4)
          eoq_rounded: 156, // Rounded to case pack of 12
          target_inventory: 96,
          abc_class: 'C',
          review_frequency: 'Monthly',
          annual_holding_cost: 211, // 48 × $22 × 20%
          annual_ordering_cost: 1404, // (4380÷156) × $50
          total_annual_cost: 1615
        }
      ];

      setData(optimizationData);

      const aCount = optimizationData.filter(d => d.abc_class === 'A').length;
      const bCount = optimizationData.filter(d => d.abc_class === 'B').length;
      const cCount = optimizationData.filter(d => d.abc_class === 'C').length;
      const avgEOQ = Math.round(optimizationData.reduce((sum, row) => sum + row.eoq_rounded, 0) / optimizationData.length);
      const totalAnnualCost = optimizationData.reduce((sum, row) => sum + row.total_annual_cost, 0);

      setMetrics({
        totalRecords: optimizationData.length,
        aItems: aCount,
        bItems: bCount,
        cItems: cCount,
        avgEOQ,
        totalAnnualCost,
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
    { field: 'avg_daily_demand', headerName: 'Avg Daily Demand', minWidth: 140, flex: 1.1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'demand_std_dev', headerName: 'Std Dev (σ)', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center' },
    { field: 'lead_time_days', headerName: 'Lead Time (days)', minWidth: 130, flex: 1, type: 'number', align: 'center', headerAlign: 'center' },
    { field: 'service_level', headerName: 'Service Level', minWidth: 120, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `${(params.value * 100).toFixed(0)}%` },
    { field: 'z_score', headerName: 'Z-Score', minWidth: 100, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center' },
    { field: 'safety_stock', headerName: 'Safety Stock', minWidth: 120, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'cycle_stock', headerName: 'Cycle Stock', minWidth: 120, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'reorder_point', headerName: 'ROP', minWidth: 100, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'eoq', headerName: 'EOQ', minWidth: 100, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'eoq_rounded', headerName: 'EOQ (Rounded)', minWidth: 130, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'target_inventory', headerName: 'Target Inventory', minWidth: 140, flex: 1.1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    {
      field: 'abc_class',
      headerName: 'ABC Class',
      minWidth: 110,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'A' ? 'error' : params.value === 'B' ? 'warning' : 'success'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    { field: 'review_frequency', headerName: 'Review Frequency', minWidth: 150, flex: 1.2, align: 'center', headerAlign: 'center' },
    { field: 'unit_cost', headerName: 'Unit Cost ($)', minWidth: 120, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `$${params.value.toFixed(2)}` },
    { field: 'annual_demand', headerName: 'Annual Demand', minWidth: 140, flex: 1.1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'annual_holding_cost', headerName: 'Holding Cost ($)', minWidth: 140, flex: 1.1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `$${params.value?.toLocaleString()}` },
    { field: 'annual_ordering_cost', headerName: 'Ordering Cost ($)', minWidth: 150, flex: 1.2, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `$${params.value?.toLocaleString()}` },
    {
      field: 'total_annual_cost',
      headerName: 'Total Annual Cost ($)',
      minWidth: 170,
      flex: 1.3,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value.toLocaleString()}`}
          size="small"
          color="primary"
          sx={{ fontWeight: 700 }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Store System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Inventory Optimization</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Analytics sx={{ fontSize: 32, color: '#8b5cf6' }} />
              <Typography variant="h4" fontWeight={700}>Inventory Optimization</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Calculate optimal inventory policies: ROP, EOQ, Safety Stock, and ABC classification
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#ef4444', 0.1)} 0%, ${alpha('#ef4444', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" color="text.secondary">A Items</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#ef4444">{metrics.aItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">B Items</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.bItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">C Items</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.cItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#8b5cf6', 0.1)} 0%, ${alpha('#8b5cf6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Inventory sx={{ color: '#8b5cf6' }} />
                  <Typography variant="body2" color="text.secondary">Avg EOQ</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#8b5cf6">{metrics.avgEOQ}</Typography>
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

export default StoreOptimization;
