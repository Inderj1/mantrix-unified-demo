import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Inventory, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, TrendingUp, LocalShipping, AttachMoney,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

const DCLotSize = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const products = ['SKU-7891', 'SKU-4523', 'SKU-9021', 'SKU-3456', 'SKU-5678'];
      const suppliers = ['SUP-A', 'SUP-B', 'SUP-C'];
      const lotData = [];
      let idCounter = 1;

      products.forEach((product) => {
        suppliers.forEach((supplier) => {
          const annualDemand = Math.round(10000 + Math.random() * 40000);
          const orderingCost = Math.round(50 + Math.random() * 150);
          const holdingCost = Math.round(5 + Math.random() * 20);
          const eoq = Math.round(Math.sqrt((2 * annualDemand * orderingCost) / holdingCost));
          const currentLotSize = Math.round(eoq * (0.7 + Math.random() * 0.6));
          const optimalLotSize = eoq;
          const savings = Math.round(Math.abs(currentLotSize - optimalLotSize) * (holdingCost * 0.1));

          lotData.push({
            id: `LS${String(idCounter++).padStart(4, '0')}`,
            product_sku: product,
            supplier_id: supplier,
            annual_demand: annualDemand,
            ordering_cost: orderingCost,
            holding_cost: holdingCost,
            current_lot_size: currentLotSize,
            optimal_lot_size: optimalLotSize,
            eoq,
            potential_savings: savings,
            status: Math.abs(currentLotSize - optimalLotSize) < eoq * 0.15 ? 'Optimal' : 'Review',
          });
        });
      });

      setData(lotData);
      setMetrics({
        totalRecords: lotData.length,
        optimalCount: lotData.filter(d => d.status === 'Optimal').length,
        totalSavings: lotData.reduce((sum, row) => sum + row.potential_savings, 0),
        avgEOQ: Math.round(lotData.reduce((sum, row) => sum + row.eoq, 0) / lotData.length),
      });
      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'Lot ID', minWidth: 100, flex: 1 },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'supplier_id', headerName: 'Supplier', minWidth: 110, flex: 0.9, align: 'center', headerAlign: 'center' },
    {
      field: 'annual_demand',
      headerName: 'Annual Demand',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'ordering_cost',
      headerName: 'Order Cost',
      minWidth: 120,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value}`,
    },
    {
      field: 'holding_cost',
      headerName: 'Holding Cost',
      minWidth: 120,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value}`,
    },
    {
      field: 'current_lot_size',
      headerName: 'Current Lot',
      minWidth: 120,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'optimal_lot_size',
      headerName: 'Optimal (EOQ)',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'potential_savings',
      headerName: 'Savings',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value.toLocaleString()}`}
          size="small"
          color="success"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 100,
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
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>DC System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Lot Size Optimization</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Inventory sx={{ fontSize: 32, color: '#1e3a8a' }} />
              <Typography variant="h4" fontWeight={700}>Lot Size Optimization</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">Economic order quantity and lot size optimization for procurement efficiency</Typography>
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#1e3a8a', 0.1)} 0%, ${alpha('#1e3a8a', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Inventory sx={{ color: '#1e3a8a' }} />
                  <Typography variant="body2" color="text.secondary">Total Records</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#1e3a8a">{metrics.totalRecords}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <AttachMoney sx={{ color: '#3b82f6' }} />
                  <Typography variant="body2" color="text.secondary">Total Savings</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#3b82f6">${(metrics.totalSavings / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2563eb', 0.1)} 0%, ${alpha('#2563eb', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <LocalShipping sx={{ color: '#2563eb' }} />
                  <Typography variant="body2" color="text.secondary">Avg EOQ</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2563eb">{metrics.avgEOQ.toLocaleString()}</Typography>
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

export default DCLotSize;
