import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  LocalShipping, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, CheckCircle, Schedule, Error, Warning,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

const DCSupplierExecution = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const suppliers = ['SUP-A', 'SUP-B', 'SUP-C', 'SUP-D'];
      const products = ['SKU-7891', 'SKU-4523', 'SKU-9021', 'SKU-3456'];
      const executionData = [];
      let idCounter = 1;

      suppliers.forEach((supplier) => {
        products.forEach((product) => {
          const orderQty = Math.round(1000 + Math.random() * 5000);
          const deliveredQty = Math.round(orderQty * (0.85 + Math.random() * 0.15));
          const onTimeDelivery = Math.random() > 0.3;
          const qualityScore = Math.round(85 + Math.random() * 15);
          const leadTime = Math.round(10 + Math.random() * 20);
          const variance = orderQty - deliveredQty;

          executionData.push({
            id: `SE${String(idCounter++).padStart(4, '0')}`,
            supplier_id: supplier,
            product_sku: product,
            po_number: `PO-${10000 + idCounter}`,
            order_qty: orderQty,
            delivered_qty: deliveredQty,
            variance,
            lead_time_days: leadTime,
            on_time: onTimeDelivery ? 'Yes' : 'No',
            quality_score: qualityScore,
            order_date: new Date(Date.now() - leadTime * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            delivery_date: new Date().toISOString().split('T')[0],
            status: onTimeDelivery && variance === 0 && qualityScore > 90 ? 'Excellent' : onTimeDelivery ? 'Good' : 'Delayed',
          });
        });
      });

      setData(executionData);

      // Calculate supplier performance
      const supplierStats = {};
      suppliers.forEach(sup => {
        const supplierOrders = executionData.filter(d => d.supplier_id === sup);
        const onTimeOrders = supplierOrders.filter(d => d.on_time === 'Yes').length;
        const avgQuality = (supplierOrders.reduce((sum, row) => sum + row.quality_score, 0) / supplierOrders.length).toFixed(1);
        const avgLeadTime = (supplierOrders.reduce((sum, row) => sum + row.lead_time_days, 0) / supplierOrders.length).toFixed(1);

        supplierStats[sup] = {
          supplier: sup,
          orders: supplierOrders.length,
          onTimeRate: ((onTimeOrders / supplierOrders.length) * 100).toFixed(1),
          avgQuality: parseFloat(avgQuality),
          avgLeadTime: parseFloat(avgLeadTime),
        };
      });

      const sortedSuppliers = Object.values(supplierStats).sort((a, b) => b.onTimeRate - a.onTimeRate);

      setMetrics({
        totalOrders: executionData.length,
        excellentCount: executionData.filter(d => d.status === 'Excellent').length,
        onTimeRate: ((executionData.filter(d => d.on_time === 'Yes').length / executionData.length) * 100).toFixed(1),
        avgQuality: (executionData.reduce((sum, row) => sum + row.quality_score, 0) / executionData.length).toFixed(1),
        topPerformers: sortedSuppliers.slice(0, 3),
        bottomPerformers: sortedSuppliers.slice(-3).reverse(),
      });
      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'Exec ID', minWidth: 100, flex: 1 },
    { field: 'supplier_id', headerName: 'Supplier', minWidth: 110, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'po_number', headerName: 'PO Number', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    {
      field: 'order_qty',
      headerName: 'Ordered',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'delivered_qty',
      headerName: 'Delivered',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
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
          label={params.value === 0 ? '0' : params.value}
          size="small"
          color={params.value === 0 ? 'success' : 'warning'}
        />
      ),
    },
    {
      field: 'lead_time_days',
      headerName: 'Lead Time',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => `${params.value} days`,
    },
    {
      field: 'on_time',
      headerName: 'On Time',
      minWidth: 100,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Yes' ? 'success' : 'error'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'quality_score',
      headerName: 'Quality',
      minWidth: 100,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          color={params.value > 90 ? 'success' : params.value > 80 ? 'warning' : 'error'}
        />
      ),
    },
    { field: 'order_date', headerName: 'Order Date', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'delivery_date', headerName: 'Delivery', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 110,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          {params.value === 'Excellent' ? (
            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
          ) : params.value === 'Good' ? (
            <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
          ) : (
            <Error sx={{ fontSize: 16, color: 'error.main' }} />
          )}
          <Typography variant="caption">{params.value}</Typography>
        </Stack>
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
            <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary"><Refresh /></IconButton></Tooltip>
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
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Excellent</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.excellentCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Schedule sx={{ color: '#3b82f6' }} />
                  <Typography variant="body2" color="text.secondary">On-Time Rate</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#3b82f6">{metrics.onTimeRate}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2563eb', 0.1)} 0%, ${alpha('#2563eb', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#2563eb' }} />
                  <Typography variant="body2" color="text.secondary">Avg Quality</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2563eb">{metrics.avgQuality}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Supplier Performance Summary */}
      {metrics && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: alpha('#10b981', 0.05), border: '1px solid', borderColor: alpha('#10b981', 0.2) }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: '#10b981' }}>
                Top Performers (On-Time Delivery)
              </Typography>
              <Stack spacing={1.5}>
                {metrics.topPerformers.map((supplier, idx) => (
                  <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={`#${idx + 1}`}
                        size="small"
                        sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 700, width: 32 }}
                      />
                      <Typography variant="body2" fontWeight={600}>{supplier.supplier}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip
                        label={`${supplier.onTimeRate}% On-Time`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        label={`Quality: ${supplier.avgQuality}%`}
                        size="small"
                        sx={{ bgcolor: alpha('#10b981', 0.1) }}
                      />
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: alpha('#ef4444', 0.05), border: '1px solid', borderColor: alpha('#ef4444', 0.2) }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: '#ef4444' }}>
                Needs Improvement
              </Typography>
              <Stack spacing={1.5}>
                {metrics.bottomPerformers.map((supplier, idx) => (
                  <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={`#${metrics.topPerformers.length - idx}`}
                        size="small"
                        sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 700, width: 32 }}
                      />
                      <Typography variant="body2" fontWeight={600}>{supplier.supplier}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip
                        label={`${supplier.onTimeRate}% On-Time`}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                      <Chip
                        label={`${supplier.avgLeadTime}d Lead Time`}
                        size="small"
                        sx={{ bgcolor: alpha('#ef4444', 0.1) }}
                      />
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Paper>
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

export default DCSupplierExecution;
