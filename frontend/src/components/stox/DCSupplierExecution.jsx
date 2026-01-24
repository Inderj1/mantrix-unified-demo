import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
} from '@mui/material';
import { GridToolbar } from '@mui/x-data-grid';
import {
  LocalShipping, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, ShoppingCart, Build, SwapHoriz, AttachMoney,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';
import { useDCSupplierData } from '../../hooks/useStoxData';
import TreeDataGrid from './TreeDataGrid';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const DCSupplierExecution = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const tileConfig = getTileDataConfig('dc-supplier-execution');
  // Use persistent data hook
  const { data, loading, refetch } = useDCSupplierData();

  // Calculate metrics from supplier-level (parent) data only
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return null;

    const supplierRows = data.filter(row => row.level === 0);
    const componentRows = data.filter(row => row.level === 2);

    return {
      totalOrders: supplierRows.length,
      buyOrders: componentRows.filter(d => d.status.includes('Ready')).length,
      makeOrders: data.filter(d => d.status === 'Make').length,
      transferOrders: data.filter(d => d.status === 'Transfer').length,
      totalOrderValue: supplierRows.reduce((sum, row) => sum + row.order_value, 0),
      avgFreightUtil: ((supplierRows.reduce((sum, row) => sum + row.freight_util, 0) / supplierRows.length) * 100).toFixed(1),
    };
  }, [data]);

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: alpha('#00357a', 0.12),
            color: '#00357a',
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    { field: 'component', headerName: 'Supplier / Component', minWidth: 200, flex: 1.5 },
    { field: 'supplier', headerName: 'Supplier Name', minWidth: 150, flex: 1.2 },
    {
      field: 'net_req',
      headerName: 'Net Requirement',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString()
    },
    {
      field: 'lot_size',
      headerName: 'Lot Size',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString()
    },
    {
      field: 'lead_time_days',
      headerName: 'Lead Time (days)',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'release_date',
      headerName: 'Release Date',
      minWidth: 120,
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'need_date',
      headerName: 'Need Date',
      minWidth: 120,
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'order_value',
      headerName: 'Order Value ($)',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value?.toLocaleString()}`}
          size="small"
          sx={{ fontWeight: 700, bgcolor: alpha('#10b981', 0.12), color: '#059669' }}
        />
      ),
    },
    {
      field: 'freight_util',
      headerName: 'Freight Util %',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `${(params.value * 100).toFixed(0)}%`
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value?.includes('Ready') ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      minWidth: 150,
      flex: 1.2,
      renderCell: (params) => {
        if (params.row.level === 2 && params.value === 'Generate PO') {
          return (
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                alert(`Generating PO for: ${params.row.component}`);
              }}
              sx={{ fontSize: '0.75rem', py: 0.5 }}
            >
              Generate PO
            </Button>
          );
        }
        return <Typography variant="caption">{params.value}</Typography>;
      },
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.background }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>DC System</Link>
            <Typography color="primary" variant="body1" fontWeight={600} sx={{ color: colors.primary }}>Supplier Execution</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <LocalShipping sx={{ fontSize: 32, color: colors.primary }} />
              <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>Supplier Execution</Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>Supplier collaboration portal with order tracking, delivery management, and performance metrics</Typography>
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#172554', 0.1)} 0%, ${alpha('#172554', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <LocalShipping sx={{ color: '#172554' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Total Orders</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#172554">{metrics.totalOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <ShoppingCart sx={{ color: '#10b981' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Buy Orders</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.buyOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#1a5a9e', 0.1)} 0%, ${alpha('#1a5a9e', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Build sx={{ color: '#1a5a9e' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Make Orders</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#1a5a9e">{metrics.makeOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#1a5a9e', 0.1)} 0%, ${alpha('#1a5a9e', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <SwapHoriz sx={{ color: '#1a5a9e' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Transfer Orders</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#1a5a9e">{metrics.transferOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}


      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        <TreeDataGrid
          rows={data}
          columns={columns}
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
          pageSizeOptions={[25, 50, 100, 200]}
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

export default DCSupplierExecution;
