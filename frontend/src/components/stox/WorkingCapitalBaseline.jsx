import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Tabs, Tab, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  AccountBalance, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, AttachMoney,
  TrendingUp, TrendingDown, Warning, CheckCircle, Savings, Speed, Timeline, PieChart as PieChartIcon,
  Close as CloseIcon, Info as InfoIcon,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';
import { generateWorkingCapitalData, generateSummaryMetrics, generateWCTrendData } from './mockData/workingCapitalMocks';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';
import stoxService from '../../services/stoxService';

/**
 * Working Capital Baseline - Tile 2.5
 *
 * Purpose: Establish today's cash position by SKU × Plant
 *
 * Key Formula:
 * Net Working Capital (Inventory) =
 *   Inventory Value (On-hand + In-Transit + WIP)
 *   − Consignment Stock (supplier-owned)
 *   − Accounts Payable (unpaid invoices)
 *
 * Inventory Decomposition per SKU:
 * - Cycle Stock: Lot size driven (Avg = Lot Size / 2)
 * - Safety Stock: Variability driven (buffer against uncertainty)
 * - Pipeline Stock: Lead time driven (Lead Time × Daily Demand)
 * - Excess/Obsolete: Policy error (shouldn't exist)
 */
const WorkingCapitalBaseline = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterPlant, setFilterPlant] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [useApi, setUseApi] = useState(true);

  // Get tile data config for data source indicator
  const tileConfig = getTileDataConfig('working-capital-baseline');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (useApi) {
        // Try to fetch from BigQuery API
        const response = await stoxService.getWorkingCapital({ limit: 500 });
        if (response && response.data && response.data.length > 0) {
          // Transform API response to match expected format
          const wcData = response.data.map((row, idx) => ({
            id: row.record_id || idx + 1,
            plant_id: row.plant_id,
            plant_name: row.plant_name,
            sku_id: row.sku_id,
            sku_name: row.sku_name,
            category: row.category,
            total_wc_value: Number(row.total_wc_value) || 0,
            cycle_stock_value: Number(row.cycle_stock_value) || 0,
            safety_stock_value: Number(row.safety_stock_value) || 0,
            pipeline_stock_value: Number(row.pipeline_stock_value) || 0,
            excess_stock_value: Number(row.excess_stock_value) || 0,
            cycle_pct: Math.round((Number(row.cycle_stock_value) / Number(row.total_wc_value)) * 100) || 0,
            safety_pct: Math.round((Number(row.safety_stock_value) / Number(row.total_wc_value)) * 100) || 0,
            pipeline_pct: Math.round((Number(row.pipeline_stock_value) / Number(row.total_wc_value)) * 100) || 0,
            excess_pct: Math.round((Number(row.excess_stock_value) / Number(row.total_wc_value)) * 100) || 0,
            wcp: Number(row.wcp) || 0,
            dio: Number(row.dio) || 0,
            wc_savings_opportunity: Number(row.wc_savings_opportunity) || 0,
            potential_carrying_savings: Number(row.carrying_cost_savings) || 0,
            health_status: row.health_status || 'Good',
            lead_time_days: Number(row.lead_time_days) || 0,
            lot_size: Number(row.on_hand_qty) || 0,
            daily_demand: Number(row.daily_demand) || 0,
            service_level: Number(row.service_level) || 95,
            optimal_safety_stock: Number(row.safety_stock_value) * 0.8,
            optimal_cycle_stock: Number(row.cycle_stock_value) * 0.9,
            optimal_total_wc: Number(row.total_wc_value) - Number(row.wc_savings_opportunity),
          }));
          const summaryMetrics = generateSummaryMetrics(wcData);
          setData(wcData);
          setMetrics(response.summary ? {
            ...summaryMetrics,
            totalWC: Number(response.summary.total_working_capital) || summaryMetrics.totalWC,
            totalSavingsOpportunity: Number(response.summary.total_savings_opportunity) || summaryMetrics.totalSavingsOpportunity,
            avgDIO: Math.round(Number(response.summary.avg_dio)) || summaryMetrics.avgDIO,
          } : summaryMetrics);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.warn('API fetch failed, falling back to mock data:', error);
    }

    // Fallback to mock data
    setTimeout(() => {
      const wcData = generateWorkingCapitalData();
      const summaryMetrics = generateSummaryMetrics(wcData);
      const trends = generateWCTrendData();

      setData(wcData);
      setMetrics(summaryMetrics);
      setTrendData(trends);
      setLoading(false);
    }, 800);
  };

  const filteredData = data.filter(row => {
    if (filterPlant !== 'all' && row.plant_id !== filterPlant) return false;
    if (filterCategory !== 'all' && row.category !== filterCategory) return false;
    return true;
  });

  const uniquePlants = [...new Set(data.map(d => d.plant_id))];
  const uniqueCategories = [...new Set(data.map(d => d.category))];

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
    setDetailOpen(true);
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'Excellent': return '#10b981';
      case 'Good': return '#2b88d8';
      case 'At Risk': return '#f59e0b';
      case 'Critical': return '#ef4444';
      default: return '#64748b';
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 0.8 },
    { field: 'plant_id', headerName: 'Plant', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'sku_id', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'sku_name', headerName: 'Product', minWidth: 180, flex: 1.4 },
    { field: 'category', headerName: 'Category', minWidth: 110, flex: 0.9, align: 'center', headerAlign: 'center' },
    {
      field: 'total_wc_value',
      headerName: 'Total WC ($)',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value?.toLocaleString()}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#106ebe', 0.12),
            color: '#106ebe',
          }}
        />
      ),
    },
    {
      field: 'cycle_stock_value',
      headerName: 'Cycle Stock ($)',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    {
      field: 'safety_stock_value',
      headerName: 'Safety Stock ($)',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    {
      field: 'pipeline_stock_value',
      headerName: 'Pipeline ($)',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    {
      field: 'excess_stock_value',
      headerName: 'Excess ($)',
      minWidth: 120,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value?.toLocaleString()}`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value > 0 ? alpha('#ef4444', 0.12) : alpha('#10b981', 0.12),
            color: params.value > 0 ? '#dc2626' : '#059669',
          }}
        />
      ),
    },
    {
      field: 'wcp',
      headerName: 'WCP',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      description: 'Working Capital Productivity = Gross Margin $ / Avg WC',
      renderCell: (params) => (
        <Chip
          label={params.value?.toFixed(2)}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= 4 ? alpha('#10b981', 0.12) : params.value >= 2 ? alpha('#2b88d8', 0.12) : alpha('#f59e0b', 0.12),
            color: params.value >= 4 ? '#059669' : params.value >= 2 ? '#0078d4' : '#d97706',
          }}
        />
      ),
    },
    {
      field: 'dio',
      headerName: 'DIO',
      minWidth: 80,
      flex: 0.6,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      description: 'Days Inventory Outstanding',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} sx={{ color: params.value > 60 ? '#dc2626' : params.value > 30 ? '#d97706' : '#059669' }}>
          {params.value}d
        </Typography>
      ),
    },
    {
      field: 'wc_savings_opportunity',
      headerName: 'WC Savings ($)',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          icon={<Savings sx={{ fontSize: 14 }} />}
          label={`$${params.value?.toLocaleString()}`}
          size="small"
          color="success"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'health_status',
      headerName: 'Health',
      minWidth: 110,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          icon={params.value === 'Excellent' || params.value === 'Good' ? <CheckCircle sx={{ fontSize: 14 }} /> : <Warning sx={{ fontSize: 14 }} />}
          sx={{
            fontWeight: 600,
            bgcolor: alpha(getHealthColor(params.value), 0.12),
            color: getHealthColor(params.value),
            '& .MuiChip-icon': { color: getHealthColor(params.value) },
          }}
        />
      ),
    },
  ];

  // WC Decomposition Stacked Bar Component
  const WCDecompositionBar = ({ row }) => {
    const total = row.total_wc_value;
    const segments = [
      { label: 'Cycle', value: row.cycle_stock_value, pct: row.cycle_pct, color: '#2b88d8' },
      { label: 'Safety', value: row.safety_stock_value, pct: row.safety_pct, color: '#0078d4' },
      { label: 'Pipeline', value: row.pipeline_stock_value, pct: row.pipeline_pct, color: '#06b6d4' },
      { label: 'Excess', value: row.excess_stock_value, pct: row.excess_pct, color: '#ef4444' },
    ];

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', height: 24, borderRadius: 1, overflow: 'hidden', mb: 1 }}>
          {segments.map((seg, idx) => (
            <Tooltip key={idx} title={`${seg.label}: $${seg.value.toLocaleString()} (${seg.pct}%)`}>
              <Box
                sx={{
                  width: `${seg.pct}%`,
                  bgcolor: seg.color,
                  transition: 'all 0.3s',
                  '&:hover': { opacity: 0.8 },
                }}
              />
            </Tooltip>
          ))}
        </Box>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {segments.map((seg, idx) => (
            <Stack key={idx} direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: seg.color }} />
              <Typography variant="caption" color="text.secondary">
                {seg.label}: {seg.pct}%
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Layer 2: Diagnostics</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Working Capital Baseline</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <AccountBalance sx={{ fontSize: 32, color: '#106ebe' }} />
              <Typography variant="h4" fontWeight={700}>Working Capital Baseline</Typography>
              <Chip label="Tile 2.5" size="small" sx={{ bgcolor: alpha('#106ebe', 0.1), color: '#106ebe', fontWeight: 600 }} />
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Establish today's cash position by SKU × Plant with inventory decomposition (Cycle, Safety, Pipeline, Excess)
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Summary Metrics Cards */}
      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#106ebe', 0.1)} 0%, ${alpha('#106ebe', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <AttachMoney sx={{ color: '#106ebe' }} />
                  <Typography variant="body2" color="text.secondary">Total WC Tied Up</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#106ebe">${(metrics.totalWC / 1000000).toFixed(2)}M</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip label={`${metrics.skuCount} SKUs`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#106ebe', 0.08), color: '#106ebe' }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Savings sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">WC Savings Opportunity</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#10b981">${(metrics.totalSavingsOpportunity / 1000).toFixed(0)}K</Typography>
                <Typography variant="caption" color="text.secondary">
                  ${(metrics.totalPotentialCarrySavings / 1000).toFixed(0)}K annual carrying cost savings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#0078d4', 0.1)} 0%, ${alpha('#0078d4', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Speed sx={{ color: '#0078d4' }} />
                  <Typography variant="body2" color="text.secondary">Avg WCP (Productivity)</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#0078d4">{metrics.avgWCP}x</Typography>
                <Typography variant="caption" color="text.secondary">
                  Gross Margin $ / Avg WC
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Timeline sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">Avg DIO (Days)</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#f59e0b">{metrics.avgDIO} days</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {metrics.criticalCount > 0 && (
                    <Chip icon={<Warning sx={{ fontSize: 12 }} />} label={`${metrics.criticalCount} Critical`} size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }} />
                  )}
                  {metrics.atRiskCount > 0 && (
                    <Chip label={`${metrics.atRiskCount} At Risk`} size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }} />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* WC Decomposition Summary Bar */}
      {metrics && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <PieChartIcon sx={{ color: '#64748b' }} />
            <Typography variant="subtitle1" fontWeight={600}>Working Capital Decomposition</Typography>
            <Tooltip title="Shows how total working capital is distributed across Cycle Stock, Safety Stock, Pipeline Stock, and Excess/Obsolete inventory">
              <InfoIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
            </Tooltip>
          </Stack>
          <Box sx={{ display: 'flex', height: 32, borderRadius: 1, overflow: 'hidden', mb: 2 }}>
            <Tooltip title={`Cycle Stock: $${(metrics.totalCycleStock / 1000).toFixed(0)}K (${Math.round(metrics.totalCycleStock / metrics.totalWC * 100)}%)`}>
              <Box sx={{ width: `${(metrics.totalCycleStock / metrics.totalWC * 100)}%`, bgcolor: '#2b88d8', '&:hover': { opacity: 0.8 } }} />
            </Tooltip>
            <Tooltip title={`Safety Stock: $${(metrics.totalSafetyStock / 1000).toFixed(0)}K (${Math.round(metrics.totalSafetyStock / metrics.totalWC * 100)}%)`}>
              <Box sx={{ width: `${(metrics.totalSafetyStock / metrics.totalWC * 100)}%`, bgcolor: '#0078d4', '&:hover': { opacity: 0.8 } }} />
            </Tooltip>
            <Tooltip title={`Pipeline Stock: $${(metrics.totalPipelineStock / 1000).toFixed(0)}K (${Math.round(metrics.totalPipelineStock / metrics.totalWC * 100)}%)`}>
              <Box sx={{ width: `${(metrics.totalPipelineStock / metrics.totalWC * 100)}%`, bgcolor: '#06b6d4', '&:hover': { opacity: 0.8 } }} />
            </Tooltip>
            <Tooltip title={`Excess Stock: $${(metrics.totalExcessStock / 1000).toFixed(0)}K (${Math.round(metrics.totalExcessStock / metrics.totalWC * 100)}%)`}>
              <Box sx={{ width: `${(metrics.totalExcessStock / metrics.totalWC * 100)}%`, bgcolor: '#ef4444', '&:hover': { opacity: 0.8 } }} />
            </Tooltip>
          </Box>
          <Stack direction="row" spacing={4} justifyContent="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#2b88d8' }} />
              <Typography variant="body2">Cycle Stock: <strong>${(metrics.totalCycleStock / 1000).toFixed(0)}K</strong></Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#0078d4' }} />
              <Typography variant="body2">Safety Stock: <strong>${(metrics.totalSafetyStock / 1000).toFixed(0)}K</strong></Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#06b6d4' }} />
              <Typography variant="body2">Pipeline: <strong>${(metrics.totalPipelineStock / 1000).toFixed(0)}K</strong></Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ef4444' }} />
              <Typography variant="body2">Excess: <strong>${(metrics.totalExcessStock / 1000).toFixed(0)}K</strong></Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Plant</InputLabel>
          <Select value={filterPlant} label="Plant" onChange={(e) => setFilterPlant(e.target.value)}>
            <MenuItem value="all">All Plants</MenuItem>
            {uniquePlants.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select value={filterCategory} label="Category" onChange={(e) => setFilterCategory(e.target.value)}>
            <MenuItem value="all">All Categories</MenuItem>
            {uniqueCategories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <Chip
          label={`${filteredData.length} records`}
          size="small"
          sx={{ alignSelf: 'center', bgcolor: alpha('#64748b', 0.1), color: '#64748b' }}
        />
      </Stack>

      {/* Data Grid */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
          onRowClick={handleRowClick}
          sx={stoxTheme.getDataGridSx({ clickable: true })}
        />
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <AccountBalance sx={{ color: '#106ebe' }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>{selectedRow?.sku_name}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedRow?.sku_id} • {selectedRow?.plant_name}</Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setDetailOpen(false)}><CloseIcon /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRow && (
            <Grid container spacing={3}>
              {/* WC Decomposition */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Working Capital Decomposition</Typography>
                <WCDecompositionBar row={selectedRow} />
              </Grid>

              {/* Key Metrics */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: alpha('#106ebe', 0.05) }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Current State</Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Total Working Capital</Typography>
                      <Typography variant="body2" fontWeight={700}>${selectedRow.total_wc_value.toLocaleString()}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Cycle Stock</Typography>
                      <Typography variant="body2">${selectedRow.cycle_stock_value.toLocaleString()} ({selectedRow.cycle_pct}%)</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Safety Stock</Typography>
                      <Typography variant="body2">${selectedRow.safety_stock_value.toLocaleString()} ({selectedRow.safety_pct}%)</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Pipeline Stock</Typography>
                      <Typography variant="body2">${selectedRow.pipeline_stock_value.toLocaleString()} ({selectedRow.pipeline_pct}%)</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Excess Stock</Typography>
                      <Typography variant="body2" sx={{ color: selectedRow.excess_stock_value > 0 ? '#dc2626' : '#059669' }}>
                        ${selectedRow.excess_stock_value.toLocaleString()} ({selectedRow.excess_pct}%)
                      </Typography>
                    </Stack>
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5, mt: 1 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">WCP (Productivity)</Typography>
                        <Chip label={`${selectedRow.wcp}x`} size="small" color={selectedRow.wcp >= 4 ? 'success' : selectedRow.wcp >= 2 ? 'primary' : 'warning'} />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">DIO (Days)</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedRow.dio} days</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {/* Optimal vs Current */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: alpha('#10b981', 0.05) }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Optimal vs Current</Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Optimal Safety Stock</Typography>
                      <Typography variant="body2">${selectedRow.optimal_safety_stock.toLocaleString()}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Optimal Cycle Stock</Typography>
                      <Typography variant="body2">${selectedRow.optimal_cycle_stock.toLocaleString()}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Optimal Total WC</Typography>
                      <Typography variant="body2" fontWeight={700}>${selectedRow.optimal_total_wc.toLocaleString()}</Typography>
                    </Stack>
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5, mt: 1 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#10b981' }}>WC Savings Opportunity</Typography>
                        <Chip label={`$${selectedRow.wc_savings_opportunity.toLocaleString()}`} size="small" color="success" />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">Annual Carrying Savings</Typography>
                        <Typography variant="body2" sx={{ color: '#10b981' }}>${selectedRow.potential_carrying_savings.toLocaleString()}/yr</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {/* Parameters */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: alpha('#64748b', 0.05) }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Inventory Parameters</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Lead Time</Typography>
                      <Typography variant="body1" fontWeight={600}>{selectedRow.lead_time_days} days</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Lot Size</Typography>
                      <Typography variant="body1" fontWeight={600}>{selectedRow.lot_size.toLocaleString()} units</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Daily Demand</Typography>
                      <Typography variant="body1" fontWeight={600}>{selectedRow.daily_demand} units/day</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Service Level</Typography>
                      <Typography variant="body1" fontWeight={600}>{selectedRow.service_level}%</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<TrendingUp />}>Optimize</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkingCapitalBaseline;
