import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Analytics, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, AttachMoney, TrendingUp, TrendingDown,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';

// Dark Mode Color Helper
const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const DCFinancialImpact = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const tileConfig = getTileDataConfig('dc-financial-impact');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const dcs = ['DC-001', 'DC-002', 'DC-003', 'DC-004', 'DC-005', 'DC-006', 'DC-007', 'DC-008'];
      const financialData = [];
      let idCounter = 1;

      dcs.forEach((dc) => {
        const inventoryValue = Math.round(2500000 + Math.random() * 3000000);
        const carryingCost = Math.round(inventoryValue * 0.025);
        const stockoutCost = Math.round(50000 + Math.random() * 150000);
        const obsolescenceCost = Math.round(20000 + Math.random() * 80000);
        const totalCost = carryingCost + stockoutCost + obsolescenceCost;
        const potentialSavings = Math.round(totalCost * (0.15 + Math.random() * 0.25));

        financialData.push({
          id: `DCFI${String(idCounter++).padStart(4, '0')}`,
          dc_id: dc,
          inventory_value: inventoryValue,
          carrying_cost: carryingCost,
          stockout_cost: stockoutCost,
          obsolescence_cost: obsolescenceCost,
          total_cost: totalCost,
          potential_savings: potentialSavings,
          cost_percentage: ((totalCost / inventoryValue) * 100).toFixed(2),
          savings_percentage: ((potentialSavings / totalCost) * 100).toFixed(1),
          status: potentialSavings > 150000 ? 'High Opportunity' : 'Optimized',
        });
      });

      setData(financialData);
      setMetrics({
        totalInventoryValue: financialData.reduce((sum, row) => sum + row.inventory_value, 0),
        totalCarryingCost: financialData.reduce((sum, row) => sum + row.carrying_cost, 0),
        totalPotentialSavings: financialData.reduce((sum, row) => sum + row.potential_savings, 0),
        avgSavingsPercentage: (financialData.reduce((sum, row) => sum + parseFloat(row.savings_percentage), 0) / financialData.length).toFixed(1),
      });
      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 1 },
    { field: 'dc_id', headerName: 'DC ID', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    {
      field: 'inventory_value',
      headerName: 'Inventory Value',
      minWidth: 150,
      flex: 1.2,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    {
      field: 'carrying_cost',
      headerName: 'Carrying Cost',
      minWidth: 130,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    {
      field: 'stockout_cost',
      headerName: 'Stockout Cost',
      minWidth: 130,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    {
      field: 'obsolescence_cost',
      headerName: 'Obsolescence',
      minWidth: 130,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    {
      field: 'total_cost',
      headerName: 'Total Cost',
      minWidth: 130,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    {
      field: 'potential_savings',
      headerName: 'Potential Savings',
      minWidth: 160,
      flex: 1.2,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value.toLocaleString()}`}
          size="small"
          color="success"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'cost_percentage',
      headerName: 'Cost %',
      minWidth: 100,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `${params.value}%`,
    },
    {
      field: 'savings_percentage',
      headerName: 'Savings %',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `${params.value}%`,
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 150,
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'High Opportunity' ? 'success' : 'default'}
          icon={params.value === 'High Opportunity' ? <TrendingUp /> : <TrendingDown />}
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.background }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Distribution Center System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Financial Impact</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Analytics sx={{ fontSize: 32, color: '#64748b' }} />
              <Typography variant="h4" fontWeight={700}>DC Financial Impact</Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" color="text.secondary">Distribution center financial impact analysis with inventory carrying costs and network optimization opportunities</Typography>
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#64748b', 0.1)} 0%, ${alpha('#64748b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <AttachMoney sx={{ color: '#64748b' }} />
                  <Typography variant="body2" color="text.secondary">Inventory Value</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#64748b">${(metrics.totalInventoryValue / 1000000).toFixed(2)}M</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#ef4444', 0.1)} 0%, ${alpha('#ef4444', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingDown sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" color="text.secondary">Carrying Cost</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#ef4444">${(metrics.totalCarryingCost / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Potential Savings</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#10b981">${(metrics.totalPotentialSavings / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#64748b', 0.1)} 0%, ${alpha('#64748b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Analytics sx={{ color: '#64748b' }} />
                  <Typography variant="body2" color="text.secondary">Avg Savings %</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#64748b">{metrics.avgSavingsPercentage}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
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

export default DCFinancialImpact;
