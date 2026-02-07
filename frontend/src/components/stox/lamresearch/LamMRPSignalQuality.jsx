import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Breadcrumbs,
  Link,
  Stack,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  Speed as SpeedIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import stoxTheme from '../stoxTheme';
import { getColors, MODULE_COLOR } from '../../../config/brandColors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

// ============================================
// Formatting helpers
// ============================================
const formatCurrency = (value) => {
  if (value == null) return '-';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatNumber = (value) => {
  if (value == null) return '-';
  return Number(value).toLocaleString('en-US');
};

// ============================================
// Mock Data - 15 Semiconductor Materials
// ============================================
const ROOT_CAUSES = [
  'Lot size mismatch',
  'Frozen horizon violation',
  'Lead time drift',
  'Phantom demand',
  'Rounding error',
  'Obsolete BOM',
];

const MOCK_DATA = [
  { id: 1, material: 'RF Generator Module', plant: 'P1000', signal: 'Clean', messages: 62, actionable: 48, falsePOs: 2, noiseCost: 28000, plannerHrs: 5, rootCause: 'Rounding error' },
  { id: 2, material: 'Wafer Chamber Liner', plant: 'P2000', signal: 'Noisy', messages: 185, actionable: 42, falsePOs: 28, noiseCost: 245000, plannerHrs: 32, rootCause: 'Lot size mismatch' },
  { id: 3, material: 'ESC (Electrostatic Chuck)', plant: 'P1000', signal: 'Toxic', messages: 276, actionable: 18, falsePOs: 45, noiseCost: 480000, plannerHrs: 48, rootCause: 'Phantom demand' },
  { id: 4, material: 'Etch Gas Manifold', plant: 'P3000', signal: 'Noisy', messages: 142, actionable: 38, falsePOs: 22, noiseCost: 198000, plannerHrs: 26, rootCause: 'Frozen horizon violation' },
  { id: 5, material: 'Plasma Source Assembly', plant: 'P1000', signal: 'Clean', messages: 54, actionable: 41, falsePOs: 1, noiseCost: 22000, plannerHrs: 4, rootCause: 'Rounding error' },
  { id: 6, material: 'CVD Showerhead', plant: 'P2000', signal: 'Noisy', messages: 168, actionable: 55, falsePOs: 18, noiseCost: 172000, plannerHrs: 22, rootCause: 'Lead time drift' },
  { id: 7, material: 'Process Kit', plant: 'P4000', signal: 'Toxic', messages: 240, actionable: 14, falsePOs: 42, noiseCost: 415000, plannerHrs: 44, rootCause: 'Obsolete BOM' },
  { id: 8, material: 'Matching Network', plant: 'P1000', signal: 'Noisy', messages: 128, actionable: 36, falsePOs: 15, noiseCost: 156000, plannerHrs: 18, rootCause: 'Lead time drift' },
  { id: 9, material: 'Quartz Window', plant: 'P3000', signal: 'Toxic', messages: 210, actionable: 12, falsePOs: 38, noiseCost: 392000, plannerHrs: 42, rootCause: 'Phantom demand' },
  { id: 10, material: 'Turbomolecular Pump', plant: 'P2000', signal: 'Clean', messages: 48, actionable: 38, falsePOs: 0, noiseCost: 20000, plannerHrs: 4, rootCause: 'Rounding error' },
  { id: 11, material: 'Gas Panel Assembly', plant: 'P4000', signal: 'Noisy', messages: 155, actionable: 52, falsePOs: 20, noiseCost: 188000, plannerHrs: 24, rootCause: 'Lot size mismatch' },
  { id: 12, material: 'Endpoint Detector', plant: 'P3000', signal: 'Clean', messages: 58, actionable: 45, falsePOs: 1, noiseCost: 25000, plannerHrs: 6, rootCause: 'Rounding error' },
  { id: 13, material: 'Robot Arm Assembly', plant: 'P1000', signal: 'Toxic', messages: 265, actionable: 10, falsePOs: 40, noiseCost: 460000, plannerHrs: 46, rootCause: 'Frozen horizon violation' },
  { id: 14, material: 'Load Lock Assembly', plant: 'P2000', signal: 'Noisy', messages: 136, actionable: 34, falsePOs: 16, noiseCost: 165000, plannerHrs: 20, rootCause: 'Lead time drift' },
  { id: 15, material: 'Throttle Valve', plant: 'P4000', signal: 'Noisy', messages: 120, actionable: 53, falsePOs: 12, noiseCost: 134000, plannerHrs: 19, rootCause: 'Lot size mismatch' },
];

// Prescriptive fixes per root cause
const PRESCRIPTIVE_FIXES = {
  'Lot size mismatch': [
    { fix: 'Adjust lot size rounding', parameter: 'LSMR', current: 'Round to 100', proposed: 'Round to 10', impact: '-62% false POs' },
    { fix: 'Enable dynamic lot sizing', parameter: 'DLOT', current: 'Off', proposed: 'On', impact: '-45% noise msgs' },
    { fix: 'Align MOQ with demand', parameter: 'MOQ', current: '500 EA', proposed: '50 EA', impact: '-$85K/yr waste' },
  ],
  'Frozen horizon violation': [
    { fix: 'Extend frozen fence', parameter: 'FRZN', current: '7 days', proposed: '14 days', impact: '-58% violations' },
    { fix: 'Lock planned orders', parameter: 'LPLO', current: 'Manual', proposed: 'Auto', impact: '-72% replans' },
    { fix: 'Demand filter at fence', parameter: 'DFLT', current: 'None', proposed: 'Active', impact: '-$120K/yr waste' },
  ],
  'Lead time drift': [
    { fix: 'Update planned lead time', parameter: 'PLT', current: '45 days', proposed: '62 days', impact: '-40% false reschedules' },
    { fix: 'Enable LT smoothing', parameter: 'LTSM', current: 'Off', proposed: '90-day avg', impact: '-55% noise' },
    { fix: 'Add safety time buffer', parameter: 'SFTM', current: '0 days', proposed: '5 days', impact: '-$68K/yr expedite' },
  ],
  'Phantom demand': [
    { fix: 'Purge inactive forecasts', parameter: 'PIFC', current: 'Manual', proposed: 'Auto 90-day', impact: '-78% phantom signals' },
    { fix: 'Validate demand sources', parameter: 'VDSR', current: 'None', proposed: 'Active', impact: '-65% false POs' },
    { fix: 'Decouple BOM layers', parameter: 'DBOM', current: 'Coupled', proposed: 'Independent', impact: '-$180K/yr waste' },
  ],
  'Rounding error': [
    { fix: 'Reduce rounding factor', parameter: 'RNDF', current: '100 EA', proposed: '1 EA', impact: '-90% rounding noise' },
    { fix: 'Apply scrap allowance', parameter: 'SCRP', current: '5%', proposed: '2%', impact: '-42% excess orders' },
    { fix: 'Decimal precision', parameter: 'DCPR', current: '0 digits', proposed: '2 digits', impact: '-$15K/yr waste' },
  ],
  'Obsolete BOM': [
    { fix: 'Expire obsolete BOMs', parameter: 'EOBM', current: 'Manual', proposed: 'Auto 180-day', impact: '-85% phantom msgs' },
    { fix: 'BOM version control', parameter: 'BVCN', current: 'None', proposed: 'Active', impact: '-60% false demand' },
    { fix: 'Phase-out automation', parameter: 'POAU', current: 'Off', proposed: 'On', impact: '-$200K/yr waste' },
  ],
};

// ============================================
// Component
// ============================================
const LamMRPSignalQuality = ({ onBack, darkMode = false }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const colors = getColors(darkMode);

  // Signal chip helper
  const getSignalChip = (signal) => {
    const map = {
      Clean: { bg: alpha('#10b981', 0.12), color: '#059669', border: alpha('#059669', 0.3) },
      Noisy: { bg: alpha('#f59e0b', 0.12), color: '#d97706', border: alpha('#d97706', 0.3) },
      Toxic: { bg: alpha('#ef4444', 0.12), color: '#dc2626', border: alpha('#dc2626', 0.3) },
    };
    const style = map[signal] || map.Noisy;
    return (
      <Chip
        label={signal}
        size="small"
        sx={{
          bgcolor: style.bg,
          color: style.color,
          border: `1px solid ${style.border}`,
          fontWeight: 700,
          fontSize: '0.7rem',
          height: 22,
        }}
      />
    );
  };

  // Plant chip helper
  const getPlantChip = (plant) => (
    <Chip
      label={plant}
      size="small"
      sx={{
        bgcolor: alpha(MODULE_COLOR, 0.1),
        color: darkMode ? '#8bb8e8' : MODULE_COLOR,
        border: `1px solid ${alpha(MODULE_COLOR, 0.2)}`,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 22,
      }}
    />
  );

  // DataGrid columns
  const columns = useMemo(() => [
    {
      field: 'material',
      headerName: 'Material',
      flex: 1.2,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: colors.text }}>{params.value}</Typography>
      ),
    },
    {
      field: 'plant',
      headerName: 'Plant',
      width: 80,
      renderCell: (params) => getPlantChip(params.value),
    },
    {
      field: 'signal',
      headerName: 'Signal',
      width: 90,
      renderCell: (params) => getSignalChip(params.value),
    },
    {
      field: 'messages',
      headerName: 'Messages',
      width: 80,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>{formatNumber(params.value)}</Typography>
      ),
    },
    {
      field: 'actionable',
      headerName: 'Actionable',
      width: 80,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>{formatNumber(params.value)}</Typography>
      ),
    },
    {
      field: 'falsePOs',
      headerName: 'False POs',
      width: 90,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: params.value > 0 ? '#dc2626' : colors.text, fontWeight: params.value > 20 ? 700 : 400 }}>
          {formatNumber(params.value)}
        </Typography>
      ),
    },
    {
      field: 'noiseCost',
      headerName: 'Noise Cost/yr',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>{formatCurrency(params.value)}</Typography>
      ),
    },
    {
      field: 'plannerHrs',
      headerName: 'Planner Hrs',
      width: 90,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>{params.value} hrs</Typography>
      ),
    },
    {
      field: 'rootCause',
      headerName: 'Root Cause',
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary }}>{params.value}</Typography>
      ),
    },
  ], [darkMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Signal funnel stages
  const funnelStages = [
    { label: 'Raw Messages', count: 1847, pct: 100, color: MODULE_COLOR },
    { label: 'After Dedup', count: 680, pct: 37, color: '#f59e0b' },
    { label: 'After Horizon Filter', count: 412, pct: 22, color: MODULE_COLOR },
    { label: 'After Noise Filter', count: 269, pct: 15, color: '#10b981' },
    { label: 'Actionable', count: 486, pct: 26, color: '#059669' },
  ];

  // Root cause chart data for selected row
  const rootCauseChartData = useMemo(() => {
    if (!selectedRow) return null;
    const categories = ['Lot Size', 'Horizon', 'Lead Time', 'Phantom', 'Rounding', 'BOM'];
    const total = selectedRow.messages - selectedRow.actionable;
    // Distribute noise across causes, emphasizing the primary root cause
    const primaryIdx = ROOT_CAUSES.indexOf(selectedRow.rootCause);
    const values = categories.map((_, i) => {
      if (i === primaryIdx) return Math.round(total * 0.42);
      return Math.round(total * (0.58 / 5) * (0.6 + Math.random() * 0.8));
    });
    return {
      labels: categories,
      datasets: [
        {
          label: 'Noise Messages',
          data: values,
          backgroundColor: [
            alpha(MODULE_COLOR, 0.8),
            alpha('#f59e0b', 0.8),
            alpha('#06b6d4', 0.8),
            alpha('#ef4444', 0.8),
            alpha('#8b5cf6', 0.8),
            alpha('#64748b', 0.8),
          ],
          borderRadius: 4,
          barThickness: 22,
        },
      ],
    };
  }, [selectedRow]);

  // Chart options
  const chartOptions = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? '#21262d' : '#1e293b',
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
      },
    },
    scales: {
      x: {
        grid: { color: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
        ticks: { color: darkMode ? '#8b949e' : '#64748b', font: { size: 10 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: darkMode ? '#e6edf3' : '#1e293b', font: { size: 10, weight: 600 } },
      },
    },
  }), [darkMode]);

  // Dark mode styles
  const paperSx = {
    p: 2,
    bgcolor: darkMode ? '#161b22' : '#fff',
    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
    borderRadius: 2,
  };

  const cardSx = {
    bgcolor: darkMode ? '#21262d' : '#fff',
    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
    borderRadius: 2,
  };

  const dataGridDarkSx = darkMode
    ? {
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: '#21262d !important',
          color: '#e6edf3 !important',
        },
        '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.06)' },
        '& .MuiDataGrid-row': { borderColor: 'rgba(255,255,255,0.06)' },
        '& .MuiDataGrid-footerContainer': { borderColor: 'rgba(255,255,255,0.06)' },
        bgcolor: '#161b22',
        color: '#e6edf3',
      }
    : {};

  return (
    <Box sx={{ p: 2, bgcolor: darkMode ? '#0d1117' : '#f8fbfd', minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ ...paperSx, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onBack} size="small" sx={{ color: MODULE_COLOR }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14, color: colors.textSecondary }} />} sx={{ mb: 0.5 }}>
            <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.7rem', color: colors.textSecondary, cursor: 'pointer' }}>CORE.AI</Link>
            <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.7rem', color: colors.textSecondary, cursor: 'pointer' }}>STOX.AI</Link>
            <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.7rem', color: colors.textSecondary, cursor: 'pointer' }}>Lam Research</Link>
            <Typography sx={{ fontSize: '0.7rem', color: MODULE_COLOR, fontWeight: 600 }}>MRP Signal Quality</Typography>
          </Breadcrumbs>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: colors.text }}>
            MRP Signal Quality &mdash; Internal Noise Lens
          </Typography>
        </Box>
      </Paper>

      {/* Dual-lens summary */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...paperSx, borderLeft: `4px solid ${MODULE_COLOR}` }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box sx={{ p: 1, bgcolor: alpha(MODULE_COLOR, 0.1), borderRadius: 1, mt: 0.5 }}>
                <SpeedIcon sx={{ fontSize: 22, color: MODULE_COLOR }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary, fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Signal Volume
                </Typography>
                {[
                  { label: 'Total MRP Messages', value: '1,847' },
                  { label: 'Actionable (26%)', value: '486' },
                  { label: 'Noise (74%)', value: '1,361' },
                ].map((row, i) => (
                  <Stack key={i} direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: i === 2 ? '#dc2626' : colors.text }}>{row.value}</Typography>
                  </Stack>
                ))}
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...paperSx, borderLeft: '4px solid #dc2626' }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box sx={{ p: 1, bgcolor: alpha('#dc2626', 0.1), borderRadius: 1, mt: 0.5 }}>
                <AttachMoneyIcon sx={{ fontSize: 22, color: '#dc2626' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary, fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Financial Cost of Noise
                </Typography>
                {[
                  { label: 'Total Waste/yr', value: '$3.6M' },
                  { label: 'False PO Costs', value: '$1.8M' },
                  { label: 'Planner Time Waste', value: '$142K' },
                ].map((row, i) => (
                  <Stack key={i} direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: i === 0 ? '#dc2626' : colors.text }}>{row.value}</Typography>
                  </Stack>
                ))}
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Signal Funnel */}
      <Paper sx={{ ...paperSx, mb: 2 }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: colors.text, mb: 2 }}>
          Signal Funnel
        </Typography>
        <Stack spacing={1.5}>
          {funnelStages.map((stage, idx) => (
            <Box key={idx}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text }}>{stage.label}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: stage.color }}>
                    {formatNumber(stage.count)}
                  </Typography>
                  <Chip
                    label={`${stage.pct}%`}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      bgcolor: alpha(stage.color, 0.12),
                      color: stage.color,
                      border: `1px solid ${alpha(stage.color, 0.25)}`,
                    }}
                  />
                </Stack>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={stage.pct}
                sx={{
                  height: 16,
                  borderRadius: 2,
                  bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: stage.color,
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* DataGrid */}
      <Paper sx={{ ...paperSx, mb: 2 }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: colors.text, mb: 1.5 }}>
          Material Signal Analysis
        </Typography>
        <Box sx={{ height: 480 }}>
          <DataGrid
            rows={MOCK_DATA}
            columns={columns}
            density="compact"
            disableRowSelectionOnClick
            onRowClick={(params) => setSelectedRow(params.row)}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 300 },
              },
            }}
            initialState={{
              sorting: { sortModel: [{ field: 'noiseCost', sort: 'desc' }] },
            }}
            sx={{
              ...stoxTheme.getDataGridSx({ clickable: true }),
              ...dataGridDarkSx,
              border: 'none',
              '& .MuiDataGrid-toolbarContainer': {
                p: 1,
                gap: 1,
              },
            }}
          />
        </Box>
      </Paper>

      {/* Detail Panel */}
      {selectedRow && (
        <Paper sx={{ ...paperSx }}>
          <Grid container spacing={2}>
            {/* Material info + signal chip */}
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: colors.text }}>
                  {selectedRow.material}
                </Typography>
                {getSignalChip(selectedRow.signal)}
                {getPlantChip(selectedRow.plant)}
                <Button
                  size="small"
                  onClick={() => setSelectedRow(null)}
                  sx={{ ml: 'auto', textTransform: 'none', borderRadius: 2, fontWeight: 600, fontSize: '0.75rem', color: colors.textSecondary }}
                >
                  Close
                </Button>
              </Stack>
            </Grid>

            {/* Root Cause Decomposition Chart */}
            <Grid item xs={12} md={6}>
              <Card sx={{ ...cardSx, borderLeft: `4px solid ${MODULE_COLOR}` }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: colors.text, mb: 1.5 }}>
                    Root Cause Decomposition
                  </Typography>
                  <Box sx={{ height: 180 }}>
                    {rootCauseChartData && (
                      <Bar data={rootCauseChartData} options={chartOptions} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Cost Breakdown */}
            <Grid item xs={12} md={6}>
              <Card sx={{ ...cardSx, borderLeft: '4px solid #dc2626' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: colors.text, mb: 1.5 }}>
                    Cost Breakdown
                  </Typography>
                  {[
                    { label: 'False PO Costs', value: formatCurrency(Math.round(selectedRow.noiseCost * 0.52)), color: '#dc2626' },
                    { label: 'Expedite Costs', value: formatCurrency(Math.round(selectedRow.noiseCost * 0.31)), color: '#f59e0b' },
                    { label: 'Planner Waste', value: formatCurrency(Math.round(selectedRow.plannerHrs * 85 * 12)), color: '#64748b' },
                    { label: 'Total Annual Cost', value: formatCurrency(selectedRow.noiseCost), color: colors.text, bold: true },
                  ].map((item, i) => (
                    <Stack key={i} direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75, pt: i === 3 ? 0.75 : 0, borderTop: i === 3 ? `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` : 'none' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: item.bold ? 700 : 600, color: item.color }}>
                        {item.value}
                      </Typography>
                    </Stack>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Prescriptive Fixes Table */}
            <Grid item xs={12}>
              <Card sx={{ ...cardSx, borderLeft: `4px solid #10b981` }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: colors.text, mb: 1.5 }}>
                    Prescriptive Fixes
                  </Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                      <Box component="thead">
                        <Box component="tr">
                          {['Fix', 'Parameter', 'Current', 'Proposed', 'Impact'].map((h) => (
                            <Box
                              component="th"
                              key={h}
                              sx={{
                                textAlign: 'left',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: colors.textSecondary,
                                pb: 1,
                                pr: 2,
                                borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                              }}
                            >
                              {h}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {(PRESCRIPTIVE_FIXES[selectedRow.rootCause] || []).map((row, i) => (
                          <Box component="tr" key={i} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}>
                            <Box component="td" sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text, py: 0.75, pr: 2 }}>{row.fix}</Box>
                            <Box component="td" sx={{ py: 0.75, pr: 2 }}>
                              <Chip
                                label={row.parameter}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  bgcolor: alpha(MODULE_COLOR, 0.1),
                                  color: darkMode ? '#8bb8e8' : MODULE_COLOR,
                                  border: `1px solid ${alpha(MODULE_COLOR, 0.2)}`,
                                }}
                              />
                            </Box>
                            <Box component="td" sx={{ fontSize: '0.75rem', color: colors.textSecondary, py: 0.75, pr: 2 }}>{row.current}</Box>
                            <Box component="td" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', py: 0.75, pr: 2 }}>{row.proposed}</Box>
                            <Box component="td" sx={{ py: 0.75 }}>
                              <Chip
                                label={row.impact}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  bgcolor: alpha('#10b981', 0.12),
                                  color: '#059669',
                                  border: `1px solid ${alpha('#059669', 0.25)}`,
                                }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default LamMRPSignalQuality;
