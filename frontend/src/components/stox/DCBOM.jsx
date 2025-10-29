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
      // Real data from DC_BOM Demand Layer tab
      const bomData = [
        {
          id: 'BOM0001',
          parent_sku: 'MR_HAIR_101',
          dc: 'DC-East',
          requirement_qty: 4334,
          component: 'Shampoo 250 ml',
          usage_per_kit: 1,
          yield_pct: 0.98,
          gross_req: 4334,
          adj_req: 4422, // 4334 / 0.98
          on_hand: 5000,
          on_order: 0,
          net_req: 0, // 4422 - 5000 - 0 = 0 (no shortage)
          action: 'No Action'
        },
        {
          id: 'BOM0002',
          parent_sku: 'MR_HAIR_101',
          dc: 'DC-East',
          requirement_qty: 4334,
          component: 'Conditioner 250 ml',
          usage_per_kit: 1,
          yield_pct: 0.98,
          gross_req: 4334,
          adj_req: 4422, // 4334 / 0.98
          on_hand: 1000,
          on_order: 500,
          net_req: 2922, // 4422 - 1000 - 500
          action: 'Generate Requirement (Buy)'
        },
        {
          id: 'BOM0003',
          parent_sku: 'MR_HAIR_101',
          dc: 'DC-East',
          requirement_qty: 4334,
          component: 'Box',
          usage_per_kit: 1,
          yield_pct: 1.0,
          gross_req: 4334,
          adj_req: 4334, // 4334 / 1.0
          on_hand: 1500,
          on_order: 0,
          net_req: 2834, // 4334 - 1500 - 0
          action: 'Generate Requirement (Buy)'
        },
        {
          id: 'BOM0004',
          parent_sku: 'MR_HAIR_101',
          dc: 'DC-East',
          requirement_qty: 4334,
          component: 'Leaflet',
          usage_per_kit: 1,
          yield_pct: 1.0,
          gross_req: 4334,
          adj_req: 4334, // 4334 / 1.0
          on_hand: 4000,
          on_order: 0,
          net_req: 334, // 4334 - 4000 - 0
          action: 'Generate Requirement (Make / Print)'
        }
      ];

      setData(bomData);
      setMetrics({
        totalParentSKUs: 1,
        totalComponents: bomData.length,
        shortages: bomData.filter(d => d.net_req > 0).length,
        totalNetReq: bomData.reduce((sum, row) => sum + row.net_req, 0),
      });
      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 0.8 },
    { field: 'parent_sku', headerName: 'Parent SKU', minWidth: 130, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'dc', headerName: 'DC', minWidth: 100, flex: 0.8, align: 'center', headerAlign: 'center' },
    { field: 'requirement_qty', headerName: 'Requirement Qty', minWidth: 130, flex: 1, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'component', headerName: 'Component', minWidth: 160, flex: 1.3 },
    { field: 'usage_per_kit', headerName: 'Usage/Kit', minWidth: 100, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center' },
    { field: 'yield_pct', headerName: 'Yield %', minWidth: 100, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `${(params.value * 100).toFixed(0)}%` },
    { field: 'gross_req', headerName: 'Gross Req', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'adj_req', headerName: 'Adj. Req', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'on_hand', headerName: 'On-Hand', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    { field: 'on_order', headerName: 'On-Order', minWidth: 110, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toLocaleString() },
    {
      field: 'net_req',
      headerName: 'Net Req',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => params.value > 0 ? <Chip label={params.value.toLocaleString()} size="small" color="error" /> : <Chip label="0" size="small" color="success" />,
    },
    { field: 'action', headerName: 'Action / Source', minWidth: 200, flex: 1.5 },
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
