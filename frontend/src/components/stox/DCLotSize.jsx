import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Inventory, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, TrendingUp, LocalShipping, AttachMoney,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

const DCLotSize = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      // Real data from Lot Size Optimization tab
      const lotData = [
        {
          id: 'LS0001',
          sku: 'MR_HAIR_101',
          channel: 'Retail',
          dc: 'DC-East',
          weekly_mu: 1100,
          setup_cost: 250,
          carrying_rate: 0.2,
          unit_cost: 3,
          holding_cost_weekly: 0.0115, // (unit_cost * carrying_rate) / 52
          moq: 2000,
          pallet_multiple: 100,
          truck_capacity: 7000,
          eoq: 6914, // √((2×weekly_mu×52×setup_cost)/(unit_cost×carrying_rate))
          adj_moq: 6914,
          rounded_lot: 6900,
          final_lot: 6900,
          orders_per_year: 8, // 52/(final_lot/weekly_mu)
          total_cost: 6200, // (setup_cost×orders_per_year) + (final_lot/2×holding_cost_weekly×52)
          notes: 'Full truck every 8 weeks'
        },
        {
          id: 'LS0002',
          sku: 'MR_HAIR_101',
          channel: 'Amazon',
          dc: 'DC-East',
          weekly_mu: 900,
          setup_cost: 250,
          carrying_rate: 0.2,
          unit_cost: 3,
          holding_cost_weekly: 0.0115,
          moq: 2000,
          pallet_multiple: 100,
          truck_capacity: 7000,
          eoq: 6302,
          adj_moq: 6302,
          rounded_lot: 6300,
          final_lot: 6300,
          orders_per_year: 7,
          total_cost: 5800,
          notes: 'Slightly smaller cadence'
        },
        {
          id: 'LS0003',
          sku: 'MR_HAIR_101',
          channel: 'D2C',
          dc: 'DC-Midwest',
          weekly_mu: 600,
          setup_cost: 250,
          carrying_rate: 0.2,
          unit_cost: 3,
          holding_cost_weekly: 0.0115,
          moq: 2000,
          pallet_multiple: 100,
          truck_capacity: 7000,
          eoq: 5157,
          adj_moq: 5157,
          rounded_lot: 5200,
          final_lot: 5200,
          orders_per_year: 6,
          total_cost: 5100,
          notes: 'Partial-load pattern'
        },
        {
          id: 'LS0004',
          sku: 'MR_HAIR_101',
          channel: 'Wholesale',
          dc: 'DC-Midwest',
          weekly_mu: 400,
          setup_cost: 250,
          carrying_rate: 0.2,
          unit_cost: 3,
          holding_cost_weekly: 0.0115,
          moq: 2000,
          pallet_multiple: 100,
          truck_capacity: 7000,
          eoq: 4207,
          adj_moq: 4207,
          rounded_lot: 4200,
          final_lot: 4200,
          orders_per_year: 5,
          total_cost: 4800,
          notes: 'Combine with D2C to full truck'
        }
      ];

      setData(lotData);
      setMetrics({
        totalRecords: lotData.length,
        avgEOQ: Math.round(lotData.reduce((sum, row) => sum + row.eoq, 0) / lotData.length),
        totalAnnualCost: lotData.reduce((sum, row) => sum + row.total_cost, 0),
        avgOrdersPerYear: Math.round(lotData.reduce((sum, row) => sum + row.orders_per_year, 0) / lotData.length),
      });
      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 0.8 },
    { field: 'sku', headerName: 'SKU', minWidth: 120, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'channel', headerName: 'Channel', minWidth: 110, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'dc', headerName: 'DC', minWidth: 110, flex: 0.9, align: 'center', headerAlign: 'center' },
    {
      field: 'moq',
      headerName: 'MOQ',
      minWidth: 100,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'truck_capacity',
      headerName: 'Truck Cap',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'final_lot',
      headerName: 'Order Qty',
      minWidth: 120,
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
      field: 'orders_per_year',
      headerName: 'Orders/Year',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'total_cost',
      headerName: 'Total Cost ($)',
      minWidth: 130,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value.toLocaleString()}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#10b981', 0.12),
            color: '#059669',
          }}
        />
      ),
    },
    { field: 'notes', headerName: 'Notes / Recommendation', minWidth: 250, flex: 2 },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>DC System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Lot Size Optimization</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Inventory sx={{ fontSize: 32, color: '#1e3a8a' }} />
              <Typography variant="h4" fontWeight={700}>Lot Size Optimization</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">Economic order quantity and lot size optimization for procurement efficiency</Typography>
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#1e3a8a', 0.1)} 0%, ${alpha('#1e3a8a', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Inventory sx={{ color: '#1e3a8a' }} />
                  <Typography variant="body2" color="text.secondary">Total Records</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#1e3a8a">{metrics.totalRecords}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2b88d8', 0.1)} 0%, ${alpha('#2b88d8', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <AttachMoney sx={{ color: '#2b88d8' }} />
                  <Typography variant="body2" color="text.secondary">Total Savings</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#2b88d8">${(metrics.totalSavings / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#106ebe', 0.1)} 0%, ${alpha('#106ebe', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <LocalShipping sx={{ color: '#106ebe' }} />
                  <Typography variant="body2" color="text.secondary">Avg EOQ</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#106ebe">{metrics.avgEOQ.toLocaleString()}</Typography>
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

export default DCLotSize;
