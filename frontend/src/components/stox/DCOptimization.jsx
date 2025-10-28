import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Analytics, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, TrendingUp, Inventory,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

const DCOptimization = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const dcs = ['DC-CENTRAL-01', 'DC-WEST-02', 'DC-EAST-03'];
      const products = ['SKU-7891', 'SKU-4523', 'SKU-9021', 'SKU-3456'];
      const optData = [];
      let idCounter = 1;

      dcs.forEach((dc) => {
        products.forEach((product) => {
          const currentStock = Math.round(800 + Math.random() * 1200);
          const optimalStock = Math.round(currentStock * (0.85 + Math.random() * 0.3));
          const recommended_action = currentStock > optimalStock * 1.2 ? 'Reduce' : currentStock < optimalStock * 0.8 ? 'Increase' : 'Maintain';

          optData.push({
            id: `DO${String(idCounter++).padStart(4, '0')}`,
            dc_location: dc,
            product_sku: product,
            current_stock: currentStock,
            optimal_stock: optimalStock,
            variance: currentStock - optimalStock,
            utilization_pct: ((currentStock / optimalStock) * 100).toFixed(1),
            recommended_action,
            potential_savings: Math.round(Math.abs(currentStock - optimalStock) * 15),
          });
        });
      });

      setData(optData);
      setMetrics({
        totalRecords: optData.length,
        optimalCount: optData.filter(d => d.recommended_action === 'Maintain').length,
        totalSavings: optData.reduce((sum, row) => sum + row.potential_savings, 0),
      });
      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 1 },
    { field: 'dc_location', headerName: 'DC', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'current_stock', headerName: 'Current', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'optimal_stock', headerName: 'Optimal', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    {
      field: 'variance',
      headerName: 'Variance',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => <Chip label={params.value > 0 ? `+${params.value}` : params.value} size="small" color={Math.abs(params.value) < 100 ? 'success' : 'warning'} />,
    },
    { field: 'utilization_pct', headerName: 'Utilization %', minWidth: 130, flex: 1.1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `${params.value}%` },
    {
      field: 'recommended_action',
      headerName: 'Action',
      minWidth: 110,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => <Chip label={params.value} size="small" color={params.value === 'Maintain' ? 'success' : params.value === 'Increase' ? 'info' : 'warning'} />,
    },
    { field: 'potential_savings', headerName: 'Savings', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `$${params.value?.toLocaleString()}` },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>DC System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Safety Stox Layer</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Analytics sx={{ fontSize: 32, color: '#1d4ed8' }} />
              <Typography variant="h4" fontWeight={700}>DC Safety Stox Layer</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">Optimize inventory positioning and allocation across distribution center network</Typography>
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
                  <Typography variant="body2" color="text.secondary">Optimal</Typography>
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
                  <Typography variant="body2" color="text.secondary">Total Savings</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#3b82f6">${(metrics.totalSavings / 1000).toFixed(1)}K</Typography>
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

export default DCOptimization;
