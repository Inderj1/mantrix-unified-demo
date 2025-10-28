import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { AccountTree, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, Layers } from '@mui/icons-material';
import stoxTheme from './stoxTheme';

const DCBOM = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const fgProducts = ['FG-7891', 'FG-4523', 'FG-9021'];
      const components = ['COMP-A', 'COMP-B', 'COMP-C', 'COMP-D'];
      const bomData = [];
      let idCounter = 1;

      fgProducts.forEach((fg) => {
        components.forEach((comp) => {
          const qty_per_unit = Math.round(1 + Math.random() * 5);
          const fg_demand = Math.round(500 + Math.random() * 1500);
          const comp_required = qty_per_unit * fg_demand;
          const on_hand = Math.round(comp_required * (0.8 + Math.random() * 0.4));
          const shortage = Math.max(0, comp_required - on_hand);

          bomData.push({
            id: `BOM${String(idCounter++).padStart(4, '0')}`,
            finished_good: fg,
            component_sku: comp,
            qty_per_unit,
            fg_demand,
            component_required: comp_required,
            on_hand,
            shortage,
            status: shortage > 0 ? 'Shortage' : 'Available',
          });
        });
      });

      setData(bomData);
      setMetrics({
        totalBOMs: fgProducts.length,
        totalComponents: bomData.length,
        shortages: bomData.filter(d => d.status === 'Shortage').length,
      });
      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'BOM ID', minWidth: 110, flex: 1 },
    { field: 'finished_good', headerName: 'Finished Good', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
    { field: 'component_sku', headerName: 'Component', minWidth: 130, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'qty_per_unit', headerName: 'Qty/Unit', minWidth: 100, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center' },
    { field: 'fg_demand', headerName: 'FG Demand', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'component_required', headerName: 'Required', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'on_hand', headerName: 'On Hand', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    {
      field: 'shortage',
      headerName: 'Shortage',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => params.value > 0 ? <Chip label={params.value.toLocaleString()} size="small" color="error" /> : <Chip label="0" size="small" color="success" />,
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 110,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => <Chip label={params.value} size="small" color={params.value === 'Available' ? 'success' : 'error'} />,
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>DC System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Bill of Materials</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <AccountTree sx={{ fontSize: 32, color: '#1e40af' }} />
              <Typography variant="h4" fontWeight={700}>Bill of Materials</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">Multi-level BOM management and component tracking for finished goods assembly</Typography>
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#1e40af', 0.1)} 0%, ${alpha('#1e40af', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Layers sx={{ color: '#1e40af' }} />
                  <Typography variant="body2" color="text.secondary">Total BOMs</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#1e40af">{metrics.totalBOMs}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <AccountTree sx={{ color: '#3b82f6' }} />
                  <Typography variant="body2" color="text.secondary">Components</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#3b82f6">{metrics.totalComponents}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#ef4444', 0.1)} 0%, ${alpha('#ef4444', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Download sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" color="text.secondary">Shortages</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#ef4444">{metrics.shortages}</Typography>
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

export default DCBOM;
