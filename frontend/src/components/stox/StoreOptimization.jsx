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
      const stores = ['STORE-001', 'STORE-045', 'STORE-089', 'STORE-123'];
      const products = ['SKU-7891', 'SKU-4523', 'SKU-9021'];
      const optimizationData = [];
      let idCounter = 1;

      stores.forEach((store) => {
        products.forEach((product) => {
          const currentStock = Math.round(80 + Math.random() * 120);
          const optimalStock = Math.round(currentStock * (0.85 + Math.random() * 0.3));
          const minLevel = Math.round(optimalStock * 0.4);
          const maxLevel = Math.round(optimalStock * 1.6);
          const reorderPoint = Math.round(optimalStock * 0.5);
          const safetyStock = Math.round(optimalStock * 0.25);

          optimizationData.push({
            id: `SO${String(idCounter++).padStart(4, '0')}`,
            store_id: store,
            product_sku: product,
            current_stock: currentStock,
            optimal_stock: optimalStock,
            min_level: minLevel,
            max_level: maxLevel,
            reorder_point: reorderPoint,
            safety_stock: safetyStock,
            variance: currentStock - optimalStock,
            status: Math.abs(currentStock - optimalStock) < 20 ? 'Optimal' : 'Adjust',
          });
        });
      });

      setData(optimizationData);
      setMetrics({
        totalRecords: optimizationData.length,
        optimalCount: optimizationData.filter(d => d.status === 'Optimal').length,
        avgVariance: (optimizationData.reduce((sum, row) => sum + Math.abs(row.variance), 0) / optimizationData.length).toFixed(1),
      });
      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 1 },
    { field: 'store_id', headerName: 'Store', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'current_stock', headerName: 'Current', minWidth: 100, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center' },
    { field: 'optimal_stock', headerName: 'Optimal', minWidth: 100, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center' },
    { field: 'min_level', headerName: 'Min', minWidth: 90, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center' },
    { field: 'max_level', headerName: 'Max', minWidth: 90, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center' },
    { field: 'reorder_point', headerName: 'Reorder Point', minWidth: 130, flex: 1.1, type: 'number', align: 'center', headerAlign: 'center' },
    { field: 'safety_stock', headerName: 'Safety Stock', minWidth: 120, flex: 1, type: 'number', align: 'center', headerAlign: 'center' },
    {
      field: 'variance',
      headerName: 'Variance',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value > 0 ? `+${params.value}` : params.value}
          size="small"
          color={Math.abs(params.value) < 20 ? 'success' : 'warning'}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 110,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={params.value === 'Optimal' ? 'success' : 'warning'} />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Store Level View</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Inventory Optimization</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Analytics sx={{ fontSize: 32, color: '#1d4ed8' }} />
              <Typography variant="h4" fontWeight={700}>Store Inventory Optimization</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">Store-level inventory optimization with min/max levels, safety stock, and reorder points</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#1d4ed8', 0.1)} 0%, ${alpha('#1d4ed8', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Inventory sx={{ color: '#1d4ed8' }} />
                  <Typography variant="body2" color="text.secondary">Total Records</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#1d4ed8">{metrics.totalRecords}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Optimal Count</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.optimalCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Analytics sx={{ color: '#3b82f6' }} />
                  <Typography variant="body2" color="text.secondary">Avg Variance</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#3b82f6">{metrics.avgVariance}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
