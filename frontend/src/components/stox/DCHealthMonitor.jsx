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
      // Aligned data: Aggregated from 12 stores (6 per DC) - matches Store-level totals
      const healthData = [
        {
          id: 'DH0001',
          dc_location: 'DC-East',
          product_sku: 'MR_HAIR_101',
          channels: 'Retail Stores (6 stores)',
          weekly_mu: 959, // Sum of 6 stores: (20+27+25+22+23+20)×7 = 137×7 = 959
          sigma: 192,
          lead_time_weeks: 2,
          sigma_l: 0.5,
          service_level: 0.98,
          z_score: 2.05,
          beta: 0.3,
          on_time: 0.9,
          safety_stock: 147, // Sum of 6 stores: 22+28+26+24+25+22 = 147
          rop: 2065, // (959×2)+147
          target: 1022, // Sum of 6 stores: 162+190+180+165+170+155 = 1022
          on_hand: 920, // Sum of 6 stores: 130+180+200+150+140+120 = 920
          on_order: 120, // Sum of 6 stores: 20+30+20+10+15+25 = 120
          allocated: 50, // Sum of 6 stores: 5+10+15+8+7+5 = 50
          available: 990, // Sum of 6 stores: 145+200+205+152+148+140 = 990
          health_pct: 0.97, // available/target = 990/1022 = 96.9%
          status: '🟢 Healthy',
          requirement_qty: 32, // target - available = 1022-990
          freight_util: 0.85,
          action: 'Healthy inventory position - maintain current levels'
        },
        {
          id: 'DH0002',
          dc_location: 'DC-Midwest',
          product_sku: 'MR_HAIR_101',
          channels: 'Retail Stores (6 stores)',
          weekly_mu: 749, // Sum of 6 stores: (18+22+19+17+16+15)×7 = 107×7 = 749
          sigma: 150,
          lead_time_weeks: 2,
          sigma_l: 0.3,
          service_level: 0.95,
          z_score: 1.64,
          beta: 0.3,
          on_time: 0.85,
          safety_stock: 120, // Sum of 6 stores: 20+25+21+19+18+17 = 120
          rop: 1618, // (749×2)+120
          target: 835, // Sum of 6 stores: 140+170+145+135+125+120 = 835
          on_hand: 820, // Sum of 6 stores: 95+340+110+100+90+85 = 820
          on_order: 115, // Sum of 6 stores: 40+0+30+20+15+10 = 115
          allocated: 48, // Sum of 6 stores: 5+15+10+8+6+4 = 48
          available: 887, // Sum of 6 stores: 130+325+130+112+99+91 = 887
          health_pct: 1.06, // available/target = 887/835 = 106.2%
          status: '🟠 Overstock',
          requirement_qty: 0, // available > target
          freight_util: 0.92,
          action: 'Overstock detected (Miami 325 vs target 170) - rebalance inventory'
        }
      ];

      setData(healthData);

      const criticalItems = healthData.filter(d => d.status.includes('Critical'));
      const warningItems = healthData.filter(d => d.status.includes('Warning'));
      const healthyItems = healthData.filter(d => d.status.includes('Normal') || d.status.includes('Healthy'));

      setMetrics({
        healthyCount: healthyItems.length,
        warningCount: warningItems.length,
        criticalCount: criticalItems.length,
        avgHealthScore: (healthData.reduce((sum, row) => sum + (row.health_pct * 100), 0) / healthData.length).toFixed(1),
        criticalItems: criticalItems.slice(0, 3),
        lowStockItems: healthData.filter(d => d.available < 2000).slice(0, 3),
        overstockItems: [],
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
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 0.8 },
    { field: 'dc_location', headerName: 'DC', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'channels', headerName: 'Channels Aggregated', minWidth: 200, flex: 1.5 },
    { field: 'weekly_mu', headerName: 'μ (Weekly)', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'sigma', headerName: 'σ', minWidth: 80, flex: 0.7, type: 'number', align: 'center', headerAlign: 'center' },
    { field: 'safety_stock', headerName: 'Safety Stock', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'rop', headerName: 'ROP', minWidth: 100, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'target', headerName: 'Target Inventory', minWidth: 130, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'on_hand', headerName: 'On-Hand', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'on_order', headerName: 'On-Order', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'allocated', headerName: 'Allocated', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'available', headerName: 'Available', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    {
      field: 'health_pct',
      headerName: 'Health %',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" fontWeight={600}>{(params.value * 100).toFixed(0)}%</Typography>
          <Box sx={{ width: 60, height: 6, bgcolor: alpha('#e0e0e0', 0.3), borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ width: `${params.value * 100}%`, height: '100%', bgcolor: params.value > 0.85 ? '#10b981' : params.value > 0.70 ? '#f59e0b' : '#ef4444' }} />
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
          {params.value?.includes('Normal') || params.value?.includes('🟢') ? <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> :
           params.value?.includes('Warning') || params.value?.includes('⚠') ? <Warning sx={{ fontSize: 16, color: 'warning.main' }} /> :
           <Error sx={{ fontSize: 16, color: 'error.main' }} />}
          <Typography variant="caption">{params.value}</Typography>
        </Stack>
      ),
    },
    { field: 'requirement_qty', headerName: 'Requirement Qty', minWidth: 130, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'freight_util', headerName: 'Freight Util %', minWidth: 120, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `${(params.value * 100).toFixed(0)}%` },
    { field: 'action', headerName: 'Action / Recommendation', minWidth: 250, flex: 2 },
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
