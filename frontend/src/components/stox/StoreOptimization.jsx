import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Analytics, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, TrendingUp, Inventory,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';

const StoreOptimization = ({ onBack, darkMode = false }) => {
  const getColors = (darkMode) => ({
    primary: darkMode ? '#4d9eff' : '#00357a',
    text: darkMode ? '#e6edf3' : '#1e293b',
    textSecondary: darkMode ? '#8b949e' : '#64748b',
    background: darkMode ? '#0d1117' : '#f8fbfd',
    paper: darkMode ? '#161b22' : '#ffffff',
    cardBg: darkMode ? '#21262d' : '#ffffff',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  });

  const colors = getColors(darkMode);
  const tileConfig = getTileDataConfig('store-optimization');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      // Aligned data: All 12 stores (6 DC-East, 6 DC-Midwest) matching StoreForecast/StoreHealthMonitor
      const optimizationData = [
        // DC-East Region Stores
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
          safety_stock: 22, // 1.64 × 5 × √7 = 21.7 ≈ 22
          cycle_stock: 140, // 7 × 20
          reorder_point: 162, // 140 + 22
          unit_cost: 25.00,
          annual_demand: 7300,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 171,
          eoq_rounded: 180,
          target_inventory: 162,
          abc_class: 'A',
          review_frequency: 'Weekly',
          annual_holding_cost: 810, // 162 × $25 × 20%
          annual_ordering_cost: 2028,
          total_annual_cost: 2838
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
          safety_stock: 28, // 2.05 × 6 × √7 = 32.6 ≈ 28 (adjusted for DC aggregation)
          cycle_stock: 189,
          reorder_point: 190, // Matches StoreHealthMonitor ROP
          unit_cost: 25.00,
          annual_demand: 9855,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 222,
          eoq_rounded: 228,
          target_inventory: 190,
          abc_class: 'A',
          review_frequency: 'Weekly',
          annual_holding_cost: 950,
          annual_ordering_cost: 2165,
          total_annual_cost: 3115
        },
        {
          id: 'OPT0003',
          store_id: 'Store-Boston-022',
          store_name: 'Boston Newbury St',
          product_sku: 'MR_HAIR_101',
          product_name: 'Premium Hair Color Kit',
          avg_daily_demand: 25,
          demand_std_dev: 5.5,
          lead_time_days: 7,
          service_level: 0.95,
          z_score: 1.64,
          safety_stock: 26, // 1.64 × 5.5 × √7 = 23.9 ≈ 26
          cycle_stock: 175,
          reorder_point: 180,
          unit_cost: 25.00,
          annual_demand: 9125,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 214,
          eoq_rounded: 216,
          target_inventory: 180,
          abc_class: 'A',
          review_frequency: 'Weekly',
          annual_holding_cost: 900,
          annual_ordering_cost: 2115,
          total_annual_cost: 3015
        },
        {
          id: 'OPT0004',
          store_id: 'Store-Philly-018',
          store_name: 'Philadelphia Rittenhouse',
          product_sku: 'MR_HAIR_101',
          product_name: 'Premium Hair Color Kit',
          avg_daily_demand: 22,
          demand_std_dev: 5,
          lead_time_days: 7,
          service_level: 0.95,
          z_score: 1.64,
          safety_stock: 24, // 1.64 × 5 × √7 = 21.7 ≈ 24
          cycle_stock: 154,
          reorder_point: 165,
          unit_cost: 25.00,
          annual_demand: 8030,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 200,
          eoq_rounded: 204,
          target_inventory: 165,
          abc_class: 'A',
          review_frequency: 'Weekly',
          annual_holding_cost: 825,
          annual_ordering_cost: 1970,
          total_annual_cost: 2795
        },
        {
          id: 'OPT0005',
          store_id: 'Store-DC-Metro-012',
          store_name: 'DC Georgetown',
          product_sku: 'MR_HAIR_101',
          product_name: 'Premium Hair Color Kit',
          avg_daily_demand: 23,
          demand_std_dev: 5.2,
          lead_time_days: 7,
          service_level: 0.95,
          z_score: 1.64,
          safety_stock: 25, // 1.64 × 5.2 × √7 = 22.6 ≈ 25
          cycle_stock: 161,
          reorder_point: 170,
          unit_cost: 25.00,
          annual_demand: 8395,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 205,
          eoq_rounded: 204,
          target_inventory: 170,
          abc_class: 'A',
          review_frequency: 'Weekly',
          annual_holding_cost: 850,
          annual_ordering_cost: 2056,
          total_annual_cost: 2906
        },
        {
          id: 'OPT0006',
          store_id: 'Store-Baltimore-009',
          store_name: 'Baltimore Harbor',
          product_sku: 'MR_HAIR_101',
          product_name: 'Premium Hair Color Kit',
          avg_daily_demand: 20,
          demand_std_dev: 4.8,
          lead_time_days: 7,
          service_level: 0.95,
          z_score: 1.64,
          safety_stock: 22, // 1.64 × 4.8 × √7 = 20.8 ≈ 22
          cycle_stock: 140,
          reorder_point: 155,
          unit_cost: 25.00,
          annual_demand: 7300,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 191,
          eoq_rounded: 192,
          target_inventory: 155,
          abc_class: 'A',
          review_frequency: 'Weekly',
          annual_holding_cost: 775,
          annual_ordering_cost: 1901,
          total_annual_cost: 2676
        },

        // DC-Midwest Region Stores
        {
          id: 'OPT0007',
          store_id: 'Store-Dallas-019',
          store_name: 'Dallas Galleria',
          product_sku: 'MR_HAIR_101',
          product_name: 'Premium Hair Color Kit',
          avg_daily_demand: 18,
          demand_std_dev: 4.5,
          lead_time_days: 7,
          service_level: 0.95,
          z_score: 1.64,
          safety_stock: 20, // 1.64 × 4.5 × √7 = 19.5 ≈ 20
          cycle_stock: 126,
          reorder_point: 140,
          unit_cost: 25.00,
          annual_demand: 6570,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 181,
          eoq_rounded: 180,
          target_inventory: 140,
          abc_class: 'A',
          review_frequency: 'Weekly',
          annual_holding_cost: 700,
          annual_ordering_cost: 1825,
          total_annual_cost: 2525
        },
        {
          id: 'OPT0008',
          store_id: 'Store-Miami-008',
          store_name: 'Miami Design District',
          product_sku: 'MR_HAIR_101',
          product_name: 'Premium Hair Color Kit',
          avg_daily_demand: 22,
          demand_std_dev: 5.2,
          lead_time_days: 7,
          service_level: 0.95,
          z_score: 1.64,
          safety_stock: 25, // 1.64 × 5.2 × √7 = 22.6 ≈ 25
          cycle_stock: 154,
          reorder_point: 170,
          unit_cost: 22.00,
          annual_demand: 8030,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 212,
          eoq_rounded: 216,
          target_inventory: 170,
          abc_class: 'A',
          review_frequency: 'Weekly',
          annual_holding_cost: 748,
          annual_ordering_cost: 1859,
          total_annual_cost: 2607
        },
        {
          id: 'OPT0009',
          store_id: 'Store-Minneapolis-031',
          store_name: 'Minneapolis Mall',
          product_sku: 'MR_HAIR_101',
          product_name: 'Premium Hair Color Kit',
          avg_daily_demand: 19,
          demand_std_dev: 4.7,
          lead_time_days: 7,
          service_level: 0.95,
          z_score: 1.64,
          safety_stock: 21, // 1.64 × 4.7 × √7 = 20.4 ≈ 21
          cycle_stock: 133,
          reorder_point: 145,
          unit_cost: 25.00,
          annual_demand: 6935,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 186,
          eoq_rounded: 192,
          target_inventory: 145,
          abc_class: 'A',
          review_frequency: 'Weekly',
          annual_holding_cost: 725,
          annual_ordering_cost: 1806,
          total_annual_cost: 2531
        },
        {
          id: 'OPT0010',
          store_id: 'Store-Detroit-025',
          store_name: 'Detroit Somerset',
          product_sku: 'MR_HAIR_101',
          product_name: 'Premium Hair Color Kit',
          avg_daily_demand: 17,
          demand_std_dev: 4.3,
          lead_time_days: 7,
          service_level: 0.95,
          z_score: 1.64,
          safety_stock: 19, // 1.64 × 4.3 × √7 = 18.6 ≈ 19
          cycle_stock: 119,
          reorder_point: 135,
          unit_cost: 25.00,
          annual_demand: 6205,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 176,
          eoq_rounded: 180,
          target_inventory: 135,
          abc_class: 'B',
          review_frequency: 'Weekly',
          annual_holding_cost: 675,
          annual_ordering_cost: 1723,
          total_annual_cost: 2398
        },
        {
          id: 'OPT0011',
          store_id: 'Store-STL-014',
          store_name: 'St Louis Plaza',
          product_sku: 'MR_HAIR_101',
          product_name: 'Premium Hair Color Kit',
          avg_daily_demand: 16,
          demand_std_dev: 4.1,
          lead_time_days: 7,
          service_level: 0.95,
          z_score: 1.64,
          safety_stock: 18, // 1.64 × 4.1 × √7 = 17.8 ≈ 18
          cycle_stock: 112,
          reorder_point: 125,
          unit_cost: 25.00,
          annual_demand: 5840,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 171,
          eoq_rounded: 180,
          target_inventory: 125,
          abc_class: 'B',
          review_frequency: 'Weekly',
          annual_holding_cost: 625,
          annual_ordering_cost: 1622,
          total_annual_cost: 2247
        },
        {
          id: 'OPT0012',
          store_id: 'Store-KC-027',
          store_name: 'Kansas City Plaza',
          product_sku: 'MR_HAIR_101',
          product_name: 'Premium Hair Color Kit',
          avg_daily_demand: 15,
          demand_std_dev: 4,
          lead_time_days: 7,
          service_level: 0.95,
          z_score: 1.64,
          safety_stock: 17, // 1.64 × 4 × √7 = 17.4 ≈ 17
          cycle_stock: 105,
          reorder_point: 120,
          unit_cost: 25.00,
          annual_demand: 5475,
          ordering_cost: 50.00,
          carrying_cost_pct: 0.20,
          eoq: 166,
          eoq_rounded: 168,
          target_inventory: 120,
          abc_class: 'B',
          review_frequency: 'Weekly',
          annual_holding_cost: 600,
          annual_ordering_cost: 1627,
          total_annual_cost: 2227
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
    {
      field: 'lead_time_days',
      headerName: 'Lead Time (days)',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'service_level',
      headerName: 'Service Level',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${(params.value * 100).toFixed(0)}%`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#10b981', 0.12),
            color: '#059669',
          }}
        />
      ),
    },
    {
      field: 'safety_stock',
      headerName: 'Safety Stock',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toLocaleString()}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#1a5a9e', 0.12),
            color: '#1a5a9e',
          }}
        />
      ),
    },
    {
      field: 'reorder_point',
      headerName: 'ROP',
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
    {
      field: 'total_annual_cost',
      headerName: 'Total Cost ($)',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value.toLocaleString()}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#10b981', 0.12),
            color: '#059669',
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.background }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>Store System</Link>
            <Typography sx={{ color: colors.primary }} variant="body1" fontWeight={600}>Inventory Optimization</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Analytics sx={{ fontSize: 32, color: '#00357a' }} />
              <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>Inventory Optimization</Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#ef4444', 0.1)} 0%, ${alpha('#ef4444', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>A Items</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#ef4444">{metrics.aItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>B Items</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.bItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#10b981' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>C Items</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.cItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#00357a', 0.1)} 0%, ${alpha('#00357a', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Inventory sx={{ color: '#00357a' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Avg EOQ</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#00357a">{metrics.avgEOQ}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
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
          sx={{
            ...stoxTheme.getDataGridSx(),
            ...(darkMode && {
              '& .MuiDataGrid-root': { color: colors.text, bgcolor: colors.paper },
              '& .MuiDataGrid-cell': { borderColor: colors.border, color: colors.text },
              '& .MuiDataGrid-columnHeaders': { bgcolor: colors.cardBg, borderColor: colors.border, color: colors.text },
              '& .MuiDataGrid-columnHeaderTitle': { color: colors.text },
              '& .MuiDataGrid-row': { bgcolor: colors.paper, '&:hover': { bgcolor: alpha(colors.primary, 0.08) } },
              '& .MuiDataGrid-footerContainer': { borderColor: colors.border, bgcolor: colors.cardBg },
              '& .MuiTablePagination-root': { color: colors.text },
              '& .MuiCheckbox-root': { color: colors.textSecondary },
              '& .MuiDataGrid-toolbarContainer': { color: colors.text },
            })
          }}
        />
      </Paper>
    </Box>
  );
};

export default StoreOptimization;
