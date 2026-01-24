import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha, Alert, AlertTitle, Collapse,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ShowChart, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, CheckCircle, Warning, Error, FilterList, Close,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';
import { useDCHealthData } from '../../hooks/useStoxData';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const DCHealthMonitor = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const tileConfig = getTileDataConfig('dc-health-monitor');
  // Use persistent data hook
  const { data, loading, refetch } = useDCHealthData();

  const [alertFilter, setAlertFilter] = useState('all'); // 'all', 'critical', 'warning', 'healthy'
  const [showAlerts, setShowAlerts] = useState(true);

  // Calculate metrics from data
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return null;

    const criticalItems = data.filter(d => d.status.includes('Critical'));
    const warningItems = data.filter(d => d.status.includes('Warning') || d.status.includes('Monitor'));
    const healthyItems = data.filter(d => d.status.includes('Normal') || d.status.includes('Healthy'));

    return {
      healthyCount: healthyItems.length,
      warningCount: warningItems.length,
      criticalCount: criticalItems.length,
      avgHealthScore: (data.reduce((sum, row) => sum + (row.health_pct * 100), 0) / data.length).toFixed(1),
      criticalItems: criticalItems.slice(0, 3),
      lowStockItems: data.filter(d => d.available < 2000).slice(0, 3),
      overstockItems: [],
    };
  }, [data]);

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
    { field: 'product_name', headerName: 'Product', minWidth: 180, flex: 1.4 },
    { field: 'channels', headerName: 'Channels', minWidth: 140, flex: 1.1 },
    {
      field: 'target',
      headerName: 'Target',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'on_hand',
      headerName: 'On-Hand',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'on_order',
      headerName: 'On-Order',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'available',
      headerName: 'Available',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toLocaleString()}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#2b88d8', 0.12),
            color: '#106ebe',
          }}
        />
      ),
    },
    {
      field: 'health_pct',
      headerName: 'Health %',
      minWidth: 130,
      flex: 1.1,
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
      minWidth: 160,
      flex: 1.3,
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
    { field: 'action', headerName: 'Action / Recommendation', minWidth: 250, flex: 2 },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.background }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>DC System</Link>
            <Typography color="primary" variant="body1" fontWeight={600} sx={{ color: colors.primary }}>Health Monitor</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <ShowChart sx={{ fontSize: 32, color: colors.primary }} />
              <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>DC Health Monitor</Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>Real-time visibility into DC inventory health, stock levels, and availability across network</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={refetch} color="primary"><Refresh /></IconButton></Tooltip>
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
        <Paper sx={{ p: 2, mb: 2, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <FilterList sx={{ color: colors.textSecondary }} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.textSecondary }}>Quick Filters:</Typography>
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Healthy</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.healthyCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Warning sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Warning</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.warningCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#ef4444', 0.1)} 0%, ${alpha('#ef4444', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Error sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Critical</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#ef4444">{metrics.criticalCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#106ebe', 0.1)} 0%, ${alpha('#106ebe', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <ShowChart sx={{ color: '#106ebe' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Avg Health Score</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#106ebe">{metrics.avgHealthScore}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
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
          sx={{
            ...stoxTheme.getDataGridSx(),
            '& .MuiDataGrid-cell': {
              color: colors.text,
              borderColor: colors.border,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: darkMode ? '#21262d' : '#f8fafc',
              color: colors.text,
              borderBottom: `2px solid ${colors.border}`,
            },
            '& .MuiDataGrid-row': {
              bgcolor: colors.paper,
              '&:hover': {
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              },
            },
            bgcolor: colors.paper,
            color: colors.text,
            border: `1px solid ${colors.border}`,
          }}
        />
      </Paper>
    </Box>
  );
};

export default DCHealthMonitor;
