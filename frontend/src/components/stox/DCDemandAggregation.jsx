import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Table, TableBody, TableRow, TableCell, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  TrendingUp, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, Warehouse, Store, Layers,
  ExpandMore, ChevronRight, Info, TrendingDown, TrendingFlat, Functions, CalendarMonth, ViewModule,
} from '@mui/icons-material';
import { useDCDemandData } from '../../hooks/useStoxData';

const DCDemandAggregation = ({ onBack }) => {
  // Use persistent data hook
  const { data, loading, refetch } = useDCDemandData();

  const [expandedRows, setExpandedRows] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [quickFilterText, setQuickFilterText] = useState('');

  // Aggregation features
  const [selectedRows, setSelectedRows] = useState([]);
  const [groupBy, setGroupBy] = useState('none');
  const [timeBucket, setTimeBucket] = useState('daily');

  // Calculate metrics from data
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return null;

    const dcsSet = new Set(data.map(row => row.dc_location));
    const totalChannels = data.length * 4; // 4 channels per row

    return {
      totalDCs: dcsSet.size,
      totalDemand: data.reduce((sum, row) => sum + row.daily_forecast_dc, 0),
      avgWeeklyMean: Math.round(data.reduce((sum, row) => sum + row.weekly_mean_dc, 0) / data.length),
      channelsTracked: totalChannels,
    };
  }, [data]);

  const handleDetailsClick = (channelData) => {
    setSelectedChannel(channelData);
    setDetailsOpen(true);
  };

  // Aggregation calculations
  const calculateAggregations = useMemo(() => {
    if (selectedRows.length === 0) return null;

    const selectedData = data.filter(row => selectedRows.includes(row.id));

    const totalForecast = selectedData.reduce((sum, row) => sum + row.daily_forecast_dc, 0);
    const avgForecast = totalForecast / selectedData.length;
    const minForecast = Math.min(...selectedData.map(row => row.daily_forecast_dc));
    const maxForecast = Math.max(...selectedData.map(row => row.daily_forecast_dc));

    const totalRetail = selectedData.reduce((sum, row) => sum + row.retail_fcst, 0);
    const totalAmazon = selectedData.reduce((sum, row) => sum + row.amazon_fcst, 0);
    const totalWholesale = selectedData.reduce((sum, row) => sum + row.wholesale_fcst, 0);
    const totalD2C = selectedData.reduce((sum, row) => sum + row.d2c_fcst, 0);

    return {
      count: selectedData.length,
      totalForecast,
      avgForecast,
      minForecast,
      maxForecast,
      totalRetail,
      totalAmazon,
      totalWholesale,
      totalD2C,
    };
  }, [selectedRows, data]);

  // Group By functionality
  const groupedData = useMemo(() => {
    if (groupBy === 'none') return data;

    const grouped = {};

    data.forEach(row => {
      let key;
      if (groupBy === 'dc') key = row.dc_location;
      else if (groupBy === 'sku') key = row.product_sku;
      else if (groupBy === 'week') key = row.iso_week;
      else return;

      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          groupKey: key,
          dc_location: groupBy === 'dc' ? key : 'All DCs',
          product_sku: groupBy === 'sku' ? key : 'All SKUs',
          iso_week: groupBy === 'week' ? key : row.iso_week,
          date: row.date,
          daily_forecast_dc: 0,
          retail_fcst: 0,
          amazon_fcst: 0,
          wholesale_fcst: 0,
          d2c_fcst: 0,
          weekly_mean_dc: 0,
          weekly_stddev_dc: 0,
          count: 0,
        };
      }

      grouped[key].daily_forecast_dc += row.daily_forecast_dc;
      grouped[key].retail_fcst += row.retail_fcst;
      grouped[key].amazon_fcst += row.amazon_fcst;
      grouped[key].wholesale_fcst += row.wholesale_fcst;
      grouped[key].d2c_fcst += row.d2c_fcst;
      grouped[key].weekly_mean_dc += row.weekly_mean_dc;
      grouped[key].count += 1;
    });

    return Object.values(grouped).map(group => ({
      ...group,
      retail_pct: ((group.retail_fcst / group.daily_forecast_dc) * 100).toFixed(1),
      amazon_pct: ((group.amazon_fcst / group.daily_forecast_dc) * 100).toFixed(1),
      wholesale_pct: ((group.wholesale_fcst / group.daily_forecast_dc) * 100).toFixed(1),
      d2c_pct: ((group.d2c_fcst / group.daily_forecast_dc) * 100).toFixed(1),
      weekly_mean_dc: Math.round(group.weekly_mean_dc / group.count),
      weekly_stddev_dc: Math.round(group.weekly_stddev_dc / group.count),
      status: 'Aggregated',
    }));
  }, [data, groupBy]);

  // Simple filtering
  const filteredRows = useMemo(() => {
    const baseData = groupBy === 'none' ? data : groupedData;
    const searchText = quickFilterText.toLowerCase().trim();
    if (!searchText) return baseData;

    return baseData.filter(row => {
      const searchableText = [
        row.id,
        row.dc_location,
        row.product_sku,
        row.status,
        String(row.daily_forecast_dc || ''),
      ].join(' ').toLowerCase();
      return searchableText.includes(searchText);
    });
  }, [data, groupedData, groupBy, quickFilterText]);

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
            bgcolor: alpha('#475569', 0.12),
            color: '#475569',
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
      headerName: 'DC',
      minWidth: 120,
      flex: 0.9,
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
    },
    {
      field: 'daily_forecast_dc',
      headerName: 'Total Forecast',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toLocaleString()}
          size="small"
          sx={{ fontWeight: 700, bgcolor: alpha('#0ea5e9', 0.12), color: '#0284c7', border: '1px solid', borderColor: alpha('#0284c7', 0.2) }}
        />
      ),
    },
    {
      field: 'retail_fcst',
      headerName: 'Retail',
      minWidth: 100,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'retail_pct',
      headerName: 'Retail %',
      minWidth: 90,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{ bgcolor: alpha('#3b82f6', 0.12), color: '#2563eb', fontWeight: 600, border: '1px solid', borderColor: alpha('#2563eb', 0.2) }}
        />
      ),
    },
    {
      field: 'amazon_fcst',
      headerName: 'Amazon',
      minWidth: 100,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'amazon_pct',
      headerName: 'Amazon %',
      minWidth: 90,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{ bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', fontWeight: 600, border: '1px solid', borderColor: alpha('#d97706', 0.2) }}
        />
      ),
    },
    {
      field: 'wholesale_fcst',
      headerName: 'Wholesale',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'wholesale_pct',
      headerName: 'Wholesale %',
      minWidth: 100,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{ bgcolor: alpha('#8b5cf6', 0.12), color: '#7c3aed', fontWeight: 600, border: '1px solid', borderColor: alpha('#7c3aed', 0.2) }}
        />
      ),
    },
    {
      field: 'd2c_fcst',
      headerName: 'D2C',
      minWidth: 90,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'd2c_pct',
      headerName: 'D2C %',
      minWidth: 80,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{ bgcolor: alpha('#ec4899', 0.12), color: '#db2777', fontWeight: 600, border: '1px solid', borderColor: alpha('#db2777', 0.2) }}
        />
      ),
    },
    {
      field: 'weekly_mean_dc',
      headerName: 'Weekly Avg (μ)',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'weekly_stddev_dc',
      headerName: 'Variability (σ)',
      minWidth: 120,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toFixed(2),
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
          color={params.value === 'Aligned' ? 'success' : params.value === 'Good' ? 'info' : 'warning'}
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>DC System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Forecast Layer</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <TrendingUp sx={{ fontSize: 32, color: '#3b82f6' }} />
              <Typography variant="h4" fontWeight={700}>DC Forecast Layer</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Aggregate demand forecasts from all store locations and channels for centralized planning
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupBy}
                label="Group By"
                onChange={(e) => setGroupBy(e.target.value)}
              >
                <MenuItem value="none">No Grouping</MenuItem>
                <MenuItem value="dc">By DC Location</MenuItem>
                <MenuItem value="sku">By Product SKU</MenuItem>
                <MenuItem value="week">By ISO Week</MenuItem>
              </Select>
            </FormControl>

            <Divider orientation="vertical" flexItem />

            <Tooltip title="Refresh"><IconButton onClick={refetch} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Warehouse sx={{ color: '#3b82f6' }} />
                  <Typography variant="body2" color="text.secondary">Total DCs</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#3b82f6">{metrics.totalDCs}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2563eb', 0.1)} 0%, ${alpha('#2563eb', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#2563eb' }} />
                  <Typography variant="body2" color="text.secondary">Total Demand</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2563eb">{(metrics.totalDemand / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Layers sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Avg Weekly Mean</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{(metrics.avgWeeklyMean / 1000).toFixed(1)}K</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Store sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">Channels Tracked</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.channelsTracked}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {calculateAggregations && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#3b82f6', 0.05), border: '1px solid', borderColor: alpha('#3b82f6', 0.2) }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Functions sx={{ color: '#3b82f6', fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={600} color="#3b82f6">
              Selection Aggregation ({calculateAggregations.count} rows)
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={6} md={2.4}>
              <Typography variant="caption" color="text.secondary">Total Forecast</Typography>
              <Typography variant="body1" fontWeight={700}>
                {calculateAggregations.totalForecast.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Typography variant="caption" color="text.secondary">Average</Typography>
              <Typography variant="body1" fontWeight={700}>
                {Math.round(calculateAggregations.avgForecast).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Typography variant="caption" color="text.secondary">Min / Max</Typography>
              <Typography variant="body1" fontWeight={700}>
                {calculateAggregations.minForecast.toLocaleString()} / {calculateAggregations.maxForecast.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Stack direction="row" spacing={1}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#2563eb' }}>Retail</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {calculateAggregations.totalRetail.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#d97706' }}>Amazon</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {calculateAggregations.totalAmazon.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Stack direction="row" spacing={1}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7c3aed' }}>Wholesale</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {calculateAggregations.totalWholesale.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#db2777' }}>D2C</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {calculateAggregations.totalD2C.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DataGrid
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
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
          disableRowSelectionOnClick
          getRowClassName={(params) => params.row.isChild ? 'child-row' : 'parent-row'}
          sx={{
            '& .MuiDataGrid-cell': {
              fontSize: '0.8rem',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8fafc',
              color: '#1e293b',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderBottom: '2px solid #64748b',
            },
            '& .parent-row': {
              bgcolor: alpha('#3b82f6', 0.02),
              '&:hover': { bgcolor: alpha('#3b82f6', 0.08) },
            },
            '& .child-row': {
              bgcolor: alpha('#f8fafc', 1),
              '&:hover': { bgcolor: alpha('#3b82f6', 0.05) },
            },
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
          }}
        />
      </Paper>

      {/* Level 3: Statistical Details Modal */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Info color="primary" />
            <Box>
              <Typography variant="h6">Channel Statistical Details</Typography>
              {selectedChannel && (
                <Typography variant="caption" color="text.secondary">
                  {selectedChannel.channel_name} - {selectedChannel.dc_location} - {selectedChannel.product_sku}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
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
              <Paper sx={{ p: 2, bgcolor: alpha('#3b82f6', 0.05), mb: 2 }}>
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
