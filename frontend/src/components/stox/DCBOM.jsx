import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha } from '@mui/material';
import { GridToolbar } from '@mui/x-data-grid';
import { AccountTree, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, Layers } from '@mui/icons-material';
import stoxTheme from './stoxTheme';
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

const DCBOM = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const tileConfig = getTileDataConfig('dc-bom');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      // Multiple parent SKUs with component data
      const parentSKUs = [
        {
          sku: 'MR_HAIR_101',
          name: 'Premium Hair Color Kit',
          dc: 'DC-East',
          requirement_qty: 4334,
          components: [
            {
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
          ]
        },
        {
          sku: 'MR_HAIR_201',
          name: 'Root Touch-Up Spray',
          dc: 'DC-Midwest',
          requirement_qty: 2840,
          components: [
            {
              component: 'Spray Bottle 150 ml',
              usage_per_kit: 1,
              yield_pct: 0.99,
              gross_req: 2840,
              adj_req: 2869, // 2840 / 0.99
              on_hand: 3500,
              on_order: 0,
              net_req: 0, // 2869 - 3500 - 0 = 0 (no shortage)
              action: 'No Action'
            },
            {
              component: 'Spray Formula 150 ml',
              usage_per_kit: 1,
              yield_pct: 0.97,
              gross_req: 2840,
              adj_req: 2928, // 2840 / 0.97
              on_hand: 800,
              on_order: 1000,
              net_req: 1128, // 2928 - 800 - 1000
              action: 'Generate Requirement (Buy)'
            },
            {
              component: 'Cap',
              usage_per_kit: 1,
              yield_pct: 1.0,
              gross_req: 2840,
              adj_req: 2840,
              on_hand: 2000,
              on_order: 500,
              net_req: 340, // 2840 - 2000 - 500
              action: 'Generate Requirement (Buy)'
            },
            {
              component: 'Label',
              usage_per_kit: 1,
              yield_pct: 1.0,
              gross_req: 2840,
              adj_req: 2840,
              on_hand: 2500,
              on_order: 0,
              net_req: 340, // 2840 - 2500 - 0
              action: 'Generate Requirement (Make / Print)'
            }
          ]
        },
        {
          sku: 'MR_CARE_301',
          name: 'Intensive Hair Mask',
          dc: 'DC-West',
          requirement_qty: 1920,
          components: [
            {
              component: 'Jar 200 ml',
              usage_per_kit: 1,
              yield_pct: 0.98,
              gross_req: 1920,
              adj_req: 1959, // 1920 / 0.98
              on_hand: 2500,
              on_order: 0,
              net_req: 0, // 1959 - 2500 - 0 = 0 (no shortage)
              action: 'No Action'
            },
            {
              component: 'Mask Formula 200 ml',
              usage_per_kit: 1,
              yield_pct: 0.96,
              gross_req: 1920,
              adj_req: 2000, // 1920 / 0.96
              on_hand: 500,
              on_order: 800,
              net_req: 700, // 2000 - 500 - 800
              action: 'Generate Requirement (Buy)'
            },
            {
              component: 'Lid',
              usage_per_kit: 1,
              yield_pct: 1.0,
              gross_req: 1920,
              adj_req: 1920,
              on_hand: 1200,
              on_order: 0,
              net_req: 720, // 1920 - 1200 - 0
              action: 'Generate Requirement (Buy)'
            },
            {
              component: 'Instructions',
              usage_per_kit: 1,
              yield_pct: 1.0,
              gross_req: 1920,
              adj_req: 1920,
              on_hand: 1500,
              on_order: 0,
              net_req: 420, // 1920 - 1500 - 0
              action: 'Generate Requirement (Make / Print)'
            }
          ]
        }
      ];

      // Build hierarchical structure: Parent SKU → Components
      const hierarchicalData = [];
      let bomCounter = 1;
      let totalShortages = 0;
      let totalComponentCount = 0;

      parentSKUs.forEach((parent) => {
        // Calculate parent-level totals
        const totalNetReq = parent.components.reduce((sum, c) => sum + c.net_req, 0);
        const totalOnHand = parent.components.reduce((sum, c) => sum + c.on_hand, 0);
        const totalOnOrder = parent.components.reduce((sum, c) => sum + c.on_order, 0);
        const componentsNeedingOrdering = parent.components.filter(c => c.net_req > 0).length;

        totalShortages += componentsNeedingOrdering;
        totalComponentCount += parent.components.length;

        // Level 0: Parent SKU Row
        const parentId = `PARENT-${parent.sku}-${parent.dc}`;
        hierarchicalData.push({
          id: parentId,
          level: 0,
          parent_sku: parent.sku,
          dc: parent.dc,
          requirement_qty: parent.requirement_qty,
          component: `${parent.name} (Parent)`,
          usage_per_kit: null,
          yield_pct: null,
          gross_req: parent.requirement_qty,
          adj_req: parent.requirement_qty,
          on_hand: totalOnHand,
          on_order: totalOnOrder,
          net_req: totalNetReq,
          action: componentsNeedingOrdering > 0 ? `${componentsNeedingOrdering} components need ordering` : 'All components available',
        });

        // Level 1: Component Child Rows
        parent.components.forEach((comp) => {
          hierarchicalData.push({
            id: `BOM${String(bomCounter++).padStart(4, '0')}`,
            parentId: parentId,
            level: 1,
            parent_sku: parent.sku,
            dc: parent.dc,
            requirement_qty: parent.requirement_qty,
            ...comp,
          });
        });
      });

      setData(hierarchicalData);
      setMetrics({
        totalBOMs: parentSKUs.length,
        totalComponents: totalComponentCount,
        shortages: totalShortages,
      });
      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 0.8 },
    { field: 'parent_sku', headerName: 'Parent SKU', minWidth: 130, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'dc', headerName: 'DC', minWidth: 100, flex: 0.8, align: 'center', headerAlign: 'center' },
    {
      field: 'requirement_qty',
      headerName: 'Requirement',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    { field: 'component', headerName: 'Component / Part', minWidth: 200, flex: 1.5 },
    {
      field: 'usage_per_kit',
      headerName: 'Usage/Kit',
      minWidth: 100,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => params.value ? params.value : <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>-</Typography>,
    },
    {
      field: 'yield_pct',
      headerName: 'Yield %',
      minWidth: 100,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => params.value ? `${(params.value * 100).toFixed(0)}%` : <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>-</Typography>,
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
      field: 'net_req',
      headerName: 'Net Req',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => params.value > 0 ? <Chip label={params.value.toLocaleString()} size="small" color="error" sx={{ fontWeight: 700 }} /> : <Chip label="0" size="small" color="success" />,
    },
    { field: 'action', headerName: 'Action / Source', minWidth: 220, flex: 1.7 },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.background }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>DC System</Link>
            <Typography color="primary" variant="body1" fontWeight={600} sx={{ color: colors.primary }}>Bill of Materials</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <AccountTree sx={{ fontSize: 32, color: colors.primary }} />
              <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>Bill of Materials</Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>Multi-level BOM management and component tracking for finished goods assembly</Typography>
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#002352', 0.1)} 0%, ${alpha('#002352', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Layers sx={{ color: '#002352' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Total BOMs</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#002352">{metrics.totalBOMs}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#1a5a9e', 0.1)} 0%, ${alpha('#1a5a9e', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <AccountTree sx={{ color: '#1a5a9e' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Components</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#1a5a9e">{metrics.totalComponents}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#ef4444', 0.1)} 0%, ${alpha('#ef4444', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Download sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Shortages</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#ef4444">{metrics.shortages}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        <TreeDataGrid
          rows={data}
          columns={columns}
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
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

export default DCBOM;
