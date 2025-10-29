import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  LocalShipping, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, ShoppingCart, Build, SwapHoriz, AttachMoney,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';
import { useDCSupplierData } from '../../hooks/useStoxData';

const DCSupplierExecution = ({ onBack }) => {
  // Use persistent data hook
  const { data, loading, refetch } = useDCSupplierData();

  // Calculate metrics from data
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return null;

    return {
      totalOrders: data.length,
      buyOrders: data.filter(d => d.source_type === 'Buy').length,
      makeOrders: data.filter(d => d.source_type === 'Make').length,
      transferOrders: data.filter(d => d.source_type === 'Transfer').length,
      totalOrderValue: data.reduce((sum, row) => sum + row.order_value, 0),
      avgFreightUtil: ((data.reduce((sum, row) => sum + row.freight_util, 0) / data.length) * 100).toFixed(1),
    };
  }, [data]);

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 0.8 },
    { field: 'component', headerName: 'Component / SKU', minWidth: 160, flex: 1.3 },
    { field: 'dc', headerName: 'DC', minWidth: 110, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'source_type', headerName: 'Source Type', minWidth: 120, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'supplier', headerName: 'Supplier / Plant / DC', minWidth: 180, flex: 1.4 },
    { field: 'net_req', headerName: 'Net Req', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'lot_size', headerName: 'Lot Size', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'lead_time_days', headerName: 'Lead Time (days)', minWidth: 130, flex: 1, type: 'number', align: 'center', headerAlign: 'center' },
    { field: 'on_time_pct', headerName: 'On-Time %', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `${(params.value * 100).toFixed(0)}%` },
    { field: 'mode', headerName: 'Mode', minWidth: 100, flex: 0.8, align: 'center', headerAlign: 'center' },
    { field: 'release_date', headerName: 'Release Date', minWidth: 120, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'need_date', headerName: 'Need Date', minWidth: 120, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'unit_cost', headerName: 'Unit Cost ($)', minWidth: 120, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `$${params.value}` },
    { field: 'order_value', headerName: 'Order Value ($)', minWidth: 130, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `$${params.value?.toLocaleString()}` },
    { field: 'freight_util', headerName: 'Freight Util %', minWidth: 120, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `${(params.value * 100).toFixed(0)}%` },
    { field: 'status', headerName: 'Status', minWidth: 130, flex: 1.1, align: 'center', headerAlign: 'center' },
    { field: 'action', headerName: 'Action / Recommendation', minWidth: 220, flex: 1.7 },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>DC System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Supplier Execution</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <LocalShipping sx={{ fontSize: 32, color: '#172554' }} />
              <Typography variant="h4" fontWeight={700}>Supplier Execution</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">Supplier collaboration portal with order tracking, delivery management, and performance metrics</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={refetch} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#172554', 0.1)} 0%, ${alpha('#172554', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <LocalShipping sx={{ color: '#172554' }} />
                  <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#172554">{metrics.totalOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <ShoppingCart sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Buy Orders</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.buyOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Build sx={{ color: '#3b82f6' }} />
                  <Typography variant="body2" color="text.secondary">Make Orders</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#3b82f6">{metrics.makeOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2563eb', 0.1)} 0%, ${alpha('#2563eb', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <SwapHoriz sx={{ color: '#2563eb' }} />
                  <Typography variant="body2" color="text.secondary">Transfer Orders</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2563eb">{metrics.transferOrders}</Typography>
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

export default DCSupplierExecution;
