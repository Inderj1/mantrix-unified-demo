import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Table, TableBody, TableRow, TableCell, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { GridToolbar } from '@mui/x-data-grid';
import {
  TrendingUp, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, Warehouse, Store, Layers,
  ExpandMore, ChevronRight, Info, TrendingDown, TrendingFlat, Functions, CalendarMonth, ViewModule,
} from '@mui/icons-material';
import { useDCDemandData } from '../../hooks/useStoxData';
import TreeDataGrid from './TreeDataGrid';
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

const DCDemandAggregation = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const tileConfig = getTileDataConfig('dc-demand-aggregation');
  // Use persistent data hook
  const { data, loading, refetch } = useDCDemandData();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [quickFilterText, setQuickFilterText] = useState('');

  // Calculate metrics from parent (DC-level) data only
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return null;

    const dcRows = data.filter(row => row.level === 0);
    const channelRows = data.filter(row => row.level === 1);

    return {
      totalDCs: dcRows.length,
      totalDemand: dcRows.reduce((sum, row) => sum + row.daily_forecast_dc, 0),
      avgWeeklyMean: Math.round(dcRows.reduce((sum, row) => sum + row.weekly_mean_dc, 0) / dcRows.length),
      channelsTracked: channelRows.length, // Total channels across all DCs
    };
  }, [data]);

  const handleDetailsClick = (channelData) => {
    setSelectedChannel(channelData);
    setDetailsOpen(true);
  };

  // Simple filtering on hierarchical data
  const filteredRows = useMemo(() => {
    const searchText = quickFilterText.toLowerCase().trim();
    if (!searchText) return data;

    return data.filter(row => {
      const searchableText = [
        row.id,
        row.dc_location,
        row.product_sku,
        row.status,
        String(row.daily_forecast_dc || ''),
      ].join(' ').toLowerCase();
      return searchableText.includes(searchText);
    });
  }, [data, quickFilterText]);

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 100,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: alpha('#0078d4', 0.12),
            color: '#0078d4',
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      minWidth: 110,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'iso_week',
      headerName: 'ISO Week',
      minWidth: 100,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'dc_location',
      headerName: 'DC / Channel',
      minWidth: 150,
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'product_sku',
      headerName: 'SKU',
      minWidth: 130,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        if (!params.value) {
          return <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>Aggregated</Typography>;
        }
        return <Typography variant="body2">{params.value}</Typography>;
      },
    },
    {
      field: 'product_name',
      headerName: 'Product',
      minWidth: 180,
      flex: 1.4,
    },
    {
      field: 'daily_forecast_dc',
      headerName: 'Daily Forecast',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toLocaleString()}
          size="small"
          sx={{ fontWeight: 700, bgcolor: alpha('#2b88d8', 0.12), color: '#0284c7', border: '1px solid', borderColor: alpha('#0284c7', 0.2) }}
        />
      ),
    },
    {
      field: 'weekly_mean_dc',
      headerName: 'Weekly Mean (μ)',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'weekly_stddev_dc',
      headerName: 'Std Dev (σ)',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toFixed(1),
    },
    {
      field: 'contribution_pct',
      headerName: 'Contribution %',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => params.value ? (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{ bgcolor: alpha('#10b981', 0.12), color: '#059669', fontWeight: 600 }}
        />
      ) : null,
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 110,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Aggregated' ? 'primary' : params.value === 'Channel' ? 'success' : 'default'}
        />
      ),
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
            <Typography color="primary" variant="body1" fontWeight={600} sx={{ color: colors.primary }}>Forecast Layer</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <TrendingUp sx={{ fontSize: 32, color: colors.primary }} />
              <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>DC Forecast Layer</Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Aggregate demand forecasts from all store locations and channels for centralized planning
            </Typography>
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2b88d8', 0.1)} 0%, ${alpha('#2b88d8', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Warehouse sx={{ color: '#2b88d8' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Total DCs</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2b88d8">{metrics.totalDCs}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#106ebe', 0.1)} 0%, ${alpha('#106ebe', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#106ebe' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Total Demand</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#106ebe">{(metrics.totalDemand / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Layers sx={{ color: '#10b981' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Avg Weekly Mean</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{(metrics.avgWeeklyMean / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Store sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Channels Tracked</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.channelsTracked}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        <TreeDataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: {
                debounceMs: 500,
                value: quickFilterText,
                onChange: (event) => setQuickFilterText(event.target.value),
              }
            }
          }}
          initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
          pageSizeOptions={[25, 50, 100, 200]}
          sx={{
            '& .MuiDataGrid-cell': {
              fontSize: '0.8rem',
              color: colors.text,
              borderColor: colors.border,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: darkMode ? '#21262d' : '#f8fafc',
              color: colors.text,
              fontSize: '0.85rem',
              fontWeight: 700,
              borderBottom: `2px solid ${colors.border}`,
            },
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
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

      {/* Level 3: Statistical Details Modal */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}` } }}>
        <DialogTitle sx={{ bgcolor: colors.paper, borderBottom: `1px solid ${colors.border}` }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Info color="primary" />
            <Box>
              <Typography variant="h6" sx={{ color: colors.text }}>Channel Statistical Details</Typography>
              {selectedChannel && (
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  {selectedChannel.channel_name} - {selectedChannel.dc_location} - {selectedChannel.product_sku}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: colors.paper }}>
          {selectedChannel && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Step 1: Channel Forecast</Typography>
              <Table size="small" sx={{ mb: 3 }}>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Daily Forecast:</strong></TableCell>
                    <TableCell>{selectedChannel.daily_forecast_qty?.toLocaleString()} units</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Date:</strong></TableCell>
                    <TableCell>{selectedChannel.date}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>ISO Week:</strong></TableCell>
                    <TableCell>{selectedChannel.iso_week}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Contribution %:</strong></TableCell>
                    <TableCell>{selectedChannel.contribution_pct}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Step 3: Statistical Measures</Typography>
              <Table size="small" sx={{ mb: 3 }}>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Daily σ:</strong></TableCell>
                    <TableCell>{selectedChannel.daily_stddev} units</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Weekly μ:</strong></TableCell>
                    <TableCell>{selectedChannel.weekly_mean?.toLocaleString()} units (Daily × 7)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Weekly σ:</strong></TableCell>
                    <TableCell>{selectedChannel.weekly_stddev} units (Daily σ × √7)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Coefficient of Variation:</strong></TableCell>
                    <TableCell>{((selectedChannel.daily_stddev / selectedChannel.daily_forecast_qty) * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Aggregation Formula (DC Level)</Typography>
              <Paper sx={{ p: 2, bgcolor: alpha('#2b88d8', 0.05), mb: 2 }}>
                <Typography variant="body2" fontFamily="monospace" gutterBottom>
                  <strong>μ_DC(t) = Σ μ_c(t)</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Where c ∈ {'{Retail, Amazon, Wholesale, D2C}'}
                </Typography>
              </Paper>

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Variance Calculations</Typography>
              <Paper sx={{ p: 2, bgcolor: alpha('#10b981', 0.05), mb: 2 }}>
                <Typography variant="body2" fontFamily="monospace" gutterBottom>
                  <strong>Independent Channels:</strong> σ_DC = √(Σ σ_c²)
                </Typography>
                <Typography variant="body2" fontFamily="monospace" gutterBottom>
                  <strong>Correlated Channels (ρ={selectedChannel.correlation_rho}):</strong>
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  σ_DC = √(Σ σ_c² + 2Σ ρ_ij σ_i σ_j)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Tip: Estimate ρ_ij from history; if unknown, use conservative ρ ∈ [0.2, 0.4]
                </Typography>
              </Paper>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                <strong>Outputs to next layer:</strong> μ_DC, σ_DC per SKU×DC per period
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DCDemandAggregation;
