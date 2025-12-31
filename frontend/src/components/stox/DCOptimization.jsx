import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Analytics, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, TrendingUp, Inventory,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

const DCOptimization = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      // Aligned data: Aggregated from 12 stores (6 per DC) - matches Store-level totals
      const safetyStockData = [
        {
          id: 'SS0001',
          dc_location: 'DC-East',
          product_sku: 'MR_HAIR_101',
          channels: 'Retail Stores (6 stores)',
          weekly_mu: 959, // Sum of 6 stores: (20+27+25+22+23+20)×7 = 959
          sigma: 192, // Aggregated standard deviation
          lead_time_weeks: 2,
          sigma_l: 0.5,
          service_level: 0.98,
          z_score: 2.05,
          base_ss: 139, // Simplified calculation for aligned data
          supplier_ontime: 0.9,
          beta: 0.3,
          adjusted_ss: 147, // Sum of 6 stores: 22+28+26+24+25+22 = 147
          rop: 2065, // (959×2)+147
          target_inventory: 1022 // Sum of 6 stores: 162+190+180+165+170+155 = 1022
        },
        {
          id: 'SS0002',
          dc_location: 'DC-Midwest',
          product_sku: 'MR_HAIR_101',
          channels: 'Retail Stores (6 stores)',
          weekly_mu: 749, // Sum of 6 stores: (18+22+19+17+16+15)×7 = 749
          sigma: 150, // Aggregated standard deviation
          lead_time_weeks: 2,
          sigma_l: 0.3,
          service_level: 0.95,
          z_score: 1.64,
          base_ss: 114, // Simplified calculation for aligned data
          supplier_ontime: 0.85,
          beta: 0.3,
          adjusted_ss: 120, // Sum of 6 stores: 20+25+21+19+18+17 = 120
          rop: 1618, // (749×2)+120
          target_inventory: 835 // Sum of 6 stores: 140+170+145+135+125+120 = 835
        }
      ];

      setData(safetyStockData);
      setMetrics({
        totalRecords: safetyStockData.length,
        avgServiceLevel: (safetyStockData.reduce((sum, row) => sum + row.service_level, 0) / safetyStockData.length * 100).toFixed(1),
        totalTargetInventory: safetyStockData.reduce((sum, row) => sum + row.target_inventory, 0),
      });
      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 0.8 },
    { field: 'dc_location', headerName: 'DC', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'channels', headerName: 'Channels', minWidth: 180, flex: 1.4 },
    {
      field: 'lead_time_weeks',
      headerName: 'Lead Time (Weeks)',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'service_level',
      headerName: 'Service Level',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${(params.value * 100).toFixed(0)}%`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#10b981', 0.12),
            color: '#059669',
          }}
        />
      ),
    },
    {
      field: 'adjusted_ss',
      headerName: 'Safety Stock',
      minWidth: 130,
      flex: 1,
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
      field: 'rop',
      headerName: 'ROP',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'target_inventory',
      headerName: 'Target',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>DC System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Safety Stox Layer</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Analytics sx={{ fontSize: 32, color: '#0078d4' }} />
              <Typography variant="h4" fontWeight={700}>DC Safety Stox Layer</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">Optimize inventory positioning and allocation across distribution center network</Typography>
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#0078d4', 0.1)} 0%, ${alpha('#0078d4', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Inventory sx={{ color: '#0078d4' }} />
                  <Typography variant="body2" color="text.secondary">Total Records</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#0078d4">{metrics.totalRecords}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
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
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2b88d8', 0.1)} 0%, ${alpha('#2b88d8', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Analytics sx={{ color: '#2b88d8' }} />
                  <Typography variant="body2" color="text.secondary">Total Savings</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#2b88d8">${(metrics.totalSavings / 1000).toFixed(1)}K</Typography>
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

export default DCOptimization;
