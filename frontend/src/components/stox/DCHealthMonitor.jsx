import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha, Alert, AlertTitle, Collapse,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ShowChart, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, CheckCircle, Warning, Error, FilterList, Close,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

const DCHealthMonitor = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [alertFilter, setAlertFilter] = useState('all'); // 'all', 'critical', 'warning', 'healthy'
  const [showAlerts, setShowAlerts] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const dcs = ['DC-CENTRAL-01', 'DC-WEST-02', 'DC-EAST-03', 'DC-SOUTH-04'];
      const products = ['SKU-7891', 'SKU-4523', 'SKU-9021', 'SKU-3456', 'SKU-5678'];
      const healthData = [];
      let idCounter = 1;

      dcs.forEach((dc) => {
        products.forEach((product) => {
          const onHand = Math.round(500 + Math.random() * 2000);
          const available = Math.round(onHand * (0.8 + Math.random() * 0.2));
          const allocated = onHand - available;
          const inTransit = Math.round(100 + Math.random() * 500);
          const turnover = (5 + Math.random() * 10).toFixed(1);
          const healthScore = Math.round(70 + Math.random() * 30);

          healthData.push({
            id: `DH${String(idCounter++).padStart(4, '0')}`,
            dc_location: dc,
            product_sku: product,
            on_hand: onHand,
            available,
            allocated,
            in_transit: inTransit,
            turnover_rate: parseFloat(turnover),
            health_score: healthScore,
            status: healthScore > 85 ? 'Healthy' : healthScore > 70 ? 'Warning' : 'Critical',
          });
        });
      });

      setData(healthData);

      const criticalItems = healthData.filter(d => d.status === 'Critical');
      const warningItems = healthData.filter(d => d.status === 'Warning');
      const healthyItems = healthData.filter(d => d.status === 'Healthy');

      setMetrics({
        healthyCount: healthyItems.length,
        warningCount: warningItems.length,
        criticalCount: criticalItems.length,
        avgHealthScore: (healthData.reduce((sum, row) => sum + row.health_score, 0) / healthData.length).toFixed(1),
        criticalItems: criticalItems.slice(0, 3), // Top 3 critical
        lowStockItems: healthData.filter(d => d.available < 300).slice(0, 3),
        overstockItems: healthData.filter(d => d.on_hand > 2000).slice(0, 3),
      });
      setLoading(false);
    }, 800);
  };

  const filteredData = data.filter(row => {
    if (alertFilter === 'all') return true;
    if (alertFilter === 'critical') return row.status === 'Critical';
    if (alertFilter === 'warning') return row.status === 'Warning';
    if (alertFilter === 'healthy') return row.status === 'Healthy';
    return true;
  });

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 1 },
    { field: 'dc_location', headerName: 'DC Location', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'on_hand', headerName: 'On Hand', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'available', headerName: 'Available', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'allocated', headerName: 'Allocated', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'in_transit', headerName: 'In Transit', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'turnover_rate', headerName: 'Turnover', minWidth: 100, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `${params.value}x` },
    {
      field: 'health_score',
      headerName: 'Health Score',
      minWidth: 130,
      flex: 1.2,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
          <Box sx={{ width: 60, height: 6, bgcolor: alpha('#e0e0e0', 0.3), borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ width: `${params.value}%`, height: '100vh', bgcolor: params.value > 85 ? '#10b981' : params.value > 70 ? '#f59e0b' : '#ef4444' }} />
          </Box>
        </Stack>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          {params.value === 'Healthy' ? <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> :
           params.value === 'Warning' ? <Warning sx={{ fontSize: 16, color: 'warning.main' }} /> :
           <Error sx={{ fontSize: 16, color: 'error.main' }} />}
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
            <Typography color="primary" variant="body1" fontWeight={600}>Health Monitor</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <ShowChart sx={{ fontSize: 32, color: '#2563eb' }} />
              <Typography variant="h4" fontWeight={700}>DC Health Monitor</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">Real-time visibility into DC inventory health, stock levels, and availability across network</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Alert Banner */}
      {metrics && showAlerts && (metrics.criticalCount > 0 || metrics.warningCount > 0) && (
        <Collapse in={showAlerts}>
          <Alert
            severity={metrics.criticalCount > 0 ? "error" : "warning"}
            sx={{ mb: 2 }}
            action={
              <IconButton size="small" onClick={() => setShowAlerts(false)}>
                <Close fontSize="small" />
              </IconButton>
            }
          >
            <AlertTitle sx={{ fontWeight: 700 }}>
              {metrics.criticalCount > 0
                ? `${metrics.criticalCount} Critical Issues Detected`
                : `${metrics.warningCount} Items Need Attention`}
            </AlertTitle>
            {metrics.criticalCount > 0 && (
              <Typography variant="body2">
                Critical items: {metrics.criticalItems.map(item => `${item.dc_location} - ${item.product_sku}`).join(', ')}
              </Typography>
            )}
            {metrics.lowStockItems.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Low Stock: {metrics.lowStockItems.map(item => `${item.product_sku} (${item.available} units)`).join(', ')}
              </Typography>
            )}
          </Alert>
        </Collapse>
      )}

      {/* Quick Filters */}
      {metrics && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#f8fafc', 1), border: '1px solid #e2e8f0' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <FilterList sx={{ color: '#64748b' }} />
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Quick Filters:</Typography>
            <Chip
              label="All"
              onClick={() => setAlertFilter('all')}
              color={alertFilter === 'all' ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label={`Critical (${metrics.criticalCount})`}
              onClick={() => setAlertFilter('critical')}
              color={alertFilter === 'critical' ? 'error' : 'default'}
              size="small"
              icon={<Error />}
            />
            <Chip
              label={`Warning (${metrics.warningCount})`}
              onClick={() => setAlertFilter('warning')}
              color={alertFilter === 'warning' ? 'warning' : 'default'}
              size="small"
              icon={<Warning />}
            />
            <Chip
              label={`Healthy (${metrics.healthyCount})`}
              onClick={() => setAlertFilter('healthy')}
              color={alertFilter === 'healthy' ? 'success' : 'default'}
              size="small"
              icon={<CheckCircle />}
            />
          </Stack>
        </Paper>
      )}

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Healthy</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.healthyCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Warning sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">Warning</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.warningCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#ef4444', 0.1)} 0%, ${alpha('#ef4444', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Error sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" color="text.secondary">Critical</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#ef4444">{metrics.criticalCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2563eb', 0.1)} 0%, ${alpha('#2563eb', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <ShowChart sx={{ color: '#2563eb' }} />
                  <Typography variant="body2" color="text.secondary">Avg Health Score</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2563eb">{metrics.avgHealthScore}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DataGrid
          rows={filteredData}
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

export default DCHealthMonitor;
