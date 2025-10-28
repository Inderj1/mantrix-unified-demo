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
      const stores = ['STORE-001', 'STORE-045', 'STORE-089', 'STORE-123', 'STORE-167'];
      const products = ['SKU-7891', 'SKU-4523', 'SKU-9021', 'SKU-3456'];
      const replenishmentData = [];
      let idCounter = 1;

      stores.forEach((store) => {
        products.forEach((product) => {
          const orderQty = Math.round(50 + Math.random() * 150);
          const priority = ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)];
          const status = ['Pending', 'In Transit', 'Delivered'][Math.floor(Math.random() * 3)];
          const leadTime = Math.round(1 + Math.random() * 5);

          replenishmentData.push({
            id: `RO${String(idCounter++).padStart(4, '0')}`,
            store_id: store,
            product_sku: product,
            order_qty: orderQty,
            priority,
            status,
            lead_time_days: leadTime,
            est_arrival: new Date(Date.now() + leadTime * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dc_location: 'DC-CENTRAL-01',
            order_date: new Date().toISOString().split('T')[0],
          });
        });
      });

      setData(replenishmentData);
      setMetrics({
        totalOrders: replenishmentData.length,
        pendingOrders: replenishmentData.filter(d => d.status === 'Pending').length,
        inTransit: replenishmentData.filter(d => d.status === 'In Transit').length,
        delivered: replenishmentData.filter(d => d.status === 'Delivered').length,
      });
      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'Order ID', minWidth: 110, flex: 1 },
    { field: 'store_id', headerName: 'Store', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'order_qty', headerName: 'Order Qty', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center' },
    {
      field: 'priority',
      headerName: 'Priority',
      minWidth: 110,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={params.value === 'High' ? 'error' : params.value === 'Medium' ? 'warning' : 'default'} />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 130,
      flex: 1.1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          {params.value === 'Delivered' ? <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> :
           params.value === 'In Transit' ? <LocalShipping sx={{ fontSize: 16, color: 'info.main' }} /> :
           <Schedule sx={{ fontSize: 16, color: 'warning.main' }} />}
          <Typography variant="caption">{params.value}</Typography>
        </Stack>
      ),
    },
    { field: 'lead_time_days', headerName: 'Lead Time', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', renderCell: (params) => `${params.value} days` },
    { field: 'est_arrival', headerName: 'Est. Arrival', minWidth: 120, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'dc_location', headerName: 'DC Location', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
    { field: 'order_date', headerName: 'Order Date', minWidth: 120, flex: 1, align: 'center', headerAlign: 'center' },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Store Level View</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Auto Replenishment</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <LocalShipping sx={{ fontSize: 32, color: '#1e40af' }} />
              <Typography variant="h4" fontWeight={700}>Auto Replenishment Orders</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">Automated replenishment order generation with DC integration and order tracking</Typography>
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#1e40af', 0.1)} 0%, ${alpha('#1e40af', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Send sx={{ color: '#1e40af' }} />
                  <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#1e40af">{metrics.totalOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Schedule sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.pendingOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <LocalShipping sx={{ color: '#3b82f6' }} />
                  <Typography variant="body2" color="text.secondary">In Transit</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#3b82f6">{metrics.inTransit}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Delivered</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.delivered}</Typography>
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

export default StoreReplenishment;
