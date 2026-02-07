import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Breadcrumbs, Link,
  Stack, IconButton, LinearProgress, Button, Tooltip as MuiTooltip,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { getColors, MODULE_COLOR } from '../../../config/brandColors';
import { stoxTheme } from '../stoxTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// ============================================
// MOCK DATA
// ============================================

const PLANTS = ['P1000 (Fremont)', 'P2000 (Tualatin)', 'P3000 (Livermore)', 'P4000 (Chandler)'];
const STATUSES = ['Shortage', 'Tight', 'Covered', 'Excess'];

const STATUS_COLORS = {
  Shortage: '#ef4444',
  Tight: '#f59e0b',
  Covered: '#10b981',
  Excess: '#06b6d4',
};

const materialRows = [
  { id: 1, material: 'RF Generator Module', plant: 'P1000 (Fremont)', status: 'Shortage', demandEA: 4820, supplyEA: 3140, gapEA: -1680, coverage: 28, demandValue: 4218000, gapValue: -1470000, marginPct: 42.1 },
  { id: 2, material: 'Wafer Chamber Liner', plant: 'P2000 (Tualatin)', status: 'Tight', demandEA: 12640, supplyEA: 10920, gapEA: -1720, coverage: 55, demandValue: 2654000, gapValue: -361000, marginPct: 38.4 },
  { id: 3, material: 'ESC (Electrostatic Chuck)', plant: 'P1000 (Fremont)', status: 'Shortage', demandEA: 3280, supplyEA: 1960, gapEA: -1320, coverage: 22, demandValue: 5248000, gapValue: -2112000, marginPct: 46.8 },
  { id: 4, material: 'Etch Gas Manifold', plant: 'P3000 (Livermore)', status: 'Tight', demandEA: 8440, supplyEA: 7120, gapEA: -1320, coverage: 62, demandValue: 1856000, gapValue: -290000, marginPct: 35.2 },
  { id: 5, material: 'Plasma Source Assembly', plant: 'P4000 (Chandler)', status: 'Covered', demandEA: 6240, supplyEA: 7480, gapEA: 1240, coverage: 88, demandValue: 4368000, gapValue: 0, marginPct: 41.5 },
  { id: 6, material: 'CVD Showerhead', plant: 'P2000 (Tualatin)', status: 'Covered', demandEA: 18920, supplyEA: 20180, gapEA: 1260, coverage: 92, demandValue: 3216000, gapValue: 0, marginPct: 33.8 },
  { id: 7, material: 'Process Kit', plant: 'P1000 (Fremont)', status: 'Covered', demandEA: 42680, supplyEA: 44120, gapEA: 1440, coverage: 95, demandValue: 5976000, gapValue: 0, marginPct: 28.6 },
  { id: 8, material: 'Matching Network', plant: 'P3000 (Livermore)', status: 'Tight', demandEA: 5640, supplyEA: 4820, gapEA: -820, coverage: 48, demandValue: 3948000, gapValue: -574000, marginPct: 44.2 },
  { id: 9, material: 'Quartz Window', plant: 'P4000 (Chandler)', status: 'Covered', demandEA: 14280, supplyEA: 15640, gapEA: 1360, coverage: 86, demandValue: 1714000, gapValue: 0, marginPct: 31.4 },
  { id: 10, material: 'Turbomolecular Pump', plant: 'P2000 (Tualatin)', status: 'Shortage', demandEA: 2160, supplyEA: 1280, gapEA: -880, coverage: 18, demandValue: 6480000, gapValue: -2640000, marginPct: 48.6 },
  { id: 11, material: 'Gas Panel Assembly', plant: 'P1000 (Fremont)', status: 'Covered', demandEA: 7840, supplyEA: 8960, gapEA: 1120, coverage: 91, demandValue: 2744000, gapValue: 0, marginPct: 36.2 },
  { id: 12, material: 'Endpoint Detector', plant: 'P3000 (Livermore)', status: 'Tight', demandEA: 4960, supplyEA: 3840, gapEA: -1120, coverage: 52, demandValue: 3472000, gapValue: -784000, marginPct: 39.8 },
  { id: 13, material: 'Robot Arm Assembly', plant: 'P4000 (Chandler)', status: 'Covered', demandEA: 3680, supplyEA: 4240, gapEA: 560, coverage: 84, demandValue: 5152000, gapValue: 0, marginPct: 43.1 },
  { id: 14, material: 'Load Lock Assembly', plant: 'P2000 (Tualatin)', status: 'Covered', demandEA: 2840, supplyEA: 3120, gapEA: 280, coverage: 89, demandValue: 3976000, gapValue: 0, marginPct: 40.6 },
  { id: 15, material: 'Throttle Valve', plant: 'P1000 (Fremont)', status: 'Tight', demandEA: 9640, supplyEA: 8120, gapEA: -1520, coverage: 58, demandValue: 1446000, gapValue: -228000, marginPct: 29.4 },
  { id: 16, material: 'Ceramic Ring', plant: 'P3000 (Livermore)', status: 'Excess', demandEA: 22480, supplyEA: 31640, gapEA: 9160, coverage: 142, demandValue: 1124000, gapValue: 0, marginPct: 24.8 },
  { id: 17, material: 'High Flow Gas Line', plant: 'P4000 (Chandler)', status: 'Covered', demandEA: 16840, supplyEA: 18260, gapEA: 1420, coverage: 87, demandValue: 2526000, gapValue: 0, marginPct: 32.6 },
  { id: 18, material: 'Power Distribution Unit', plant: 'P2000 (Tualatin)', status: 'Excess', demandEA: 5280, supplyEA: 7420, gapEA: 2140, coverage: 138, demandValue: 3696000, gapValue: 0, marginPct: 37.4 },
];

const weekLabels = ['Wk1', 'Wk2', 'Wk3', 'Wk4', 'Wk5', 'Wk6', 'Wk7', 'Wk8', 'Wk9', 'Wk10', 'Wk11', 'Wk12'];

const weeklyDemand = [-22400, -24800, -19600, -26200, -28000, -21800, -23400, -25600, -18400, -27200, -24000, -22800];
const weeklySupply = [18600, 21200, 17800, 24400, 26800, 20400, 22000, 23800, 16200, 25600, 22400, 30000];
const weeklyNet = weeklyDemand.map((d, i) => d + weeklySupply[i]);

const generateWaterfallData = () => {
  const opening = 4200;
  const data = [{ week: 'Opening', opening, demand: 0, supply: 0, closing: opening }];
  let balance = opening;
  weekLabels.forEach((wk, i) => {
    const demand = Math.abs(Math.round(weeklyDemand[i] / 80));
    const supply = Math.round(weeklySupply[i] / 80);
    balance = balance - demand + supply;
    data.push({ week: wk, opening: balance + demand - supply, demand, supply, closing: balance });
  });
  return data;
};

const mockSalesOrders = [
  { so: 'SO-4401287', qty: 120, date: '2025-02-14', customer: 'TSMC' },
  { so: 'SO-4401312', qty: 85, date: '2025-02-18', customer: 'Samsung' },
  { so: 'SO-4401345', qty: 64, date: '2025-02-22', customer: 'Intel' },
  { so: 'SO-4401378', qty: 42, date: '2025-03-01', customer: 'Micron' },
];

const forecastVsActual = {
  forecast: [280, 310, 265, 340, 360, 295, 320, 345, 250, 370, 330, 310],
  actual: [260, 295, 270, 320, 345, 280, 305, 330, 240, 355, 315, null],
};

// ============================================
// HELPERS
// ============================================
const fmtNum = (v) => v == null ? '--' : v.toLocaleString();
const fmtCurrency = (v) => {
  if (v == null) return '--';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

// ============================================
// COMPONENT
// ============================================
export default function LamDemandSupplyCommand({ onBack, darkMode = false }) {
  const [selectedRow, setSelectedRow] = useState(null);
  const colors = getColors(darkMode);

  const bg = darkMode ? '#0d1117' : colors.background;
  const paperBg = darkMode ? '#161b22' : '#fff';
  const cardBg = darkMode ? '#21262d' : '#fff';
  const textPrimary = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const gridLine = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const tickColor = darkMode ? '#8b949e' : '#64748b';

  // ---- Chart data: Stacked bar + line overlay ----
  const barChartData = useMemo(() => ({
    labels: weekLabels,
    datasets: [
      {
        label: 'Demand',
        data: weeklyDemand,
        backgroundColor: darkMode ? alpha(MODULE_COLOR, 0.7) : alpha('#6366f1', 0.75),
        borderRadius: 2,
        order: 2,
      },
      {
        label: 'Supply',
        data: weeklySupply,
        backgroundColor: darkMode ? alpha('#06b6d4', 0.7) : alpha('#06b6d4', 0.75),
        borderRadius: 2,
        order: 2,
      },
      {
        label: 'Net Position',
        data: weeklyNet,
        type: 'line',
        borderColor: '#ff751f',
        backgroundColor: alpha('#ff751f', 0.1),
        pointBackgroundColor: '#ff751f',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        order: 1,
      },
    ],
  }), [darkMode]);

  const barChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: textPrimary, font: { size: 11 }, usePointStyle: true, padding: 16 } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw >= 0 ? '+' : ''}${fmtNum(ctx.raw)} EA`,
        },
      },
    },
    scales: {
      x: { grid: { color: gridLine }, ticks: { color: tickColor, font: { size: 11 } } },
      y: {
        grid: { color: gridLine },
        ticks: { color: tickColor, font: { size: 11 }, callback: (v) => `${v >= 0 ? '' : ''}${(v / 1000).toFixed(0)}K` },
      },
    },
  }), [textPrimary, gridLine, tickColor]);

  // ---- Detail panel: forecast vs actual line chart ----
  const detailLineData = useMemo(() => ({
    labels: weekLabels,
    datasets: [
      {
        label: 'Forecast',
        data: forecastVsActual.forecast,
        borderColor: MODULE_COLOR,
        backgroundColor: alpha(MODULE_COLOR, 0.1),
        pointRadius: 3,
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Actual',
        data: forecastVsActual.actual,
        borderColor: '#ff751f',
        backgroundColor: alpha('#ff751f', 0.08),
        pointRadius: 3,
        borderWidth: 2,
        borderDash: [4, 4],
        tension: 0.3,
        fill: false,
      },
    ],
  }), []);

  const detailLineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: textPrimary, font: { size: 10 }, usePointStyle: true, padding: 12 } },
    },
    scales: {
      x: { grid: { color: gridLine }, ticks: { color: tickColor, font: { size: 10 } } },
      y: { grid: { color: gridLine }, ticks: { color: tickColor, font: { size: 10 } } },
    },
  }), [textPrimary, gridLine, tickColor]);

  // ---- Waterfall ----
  const waterfallData = useMemo(() => generateWaterfallData(), []);

  // ---- DataGrid columns ----
  const columns = useMemo(() => [
    {
      field: 'material',
      headerName: 'Material',
      flex: 1.2,
      renderCell: (p) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: textPrimary }}>{p.value}</Typography>
      ),
    },
    {
      field: 'plant',
      headerName: 'Plant',
      width: 80,
      renderCell: (p) => (
        <Chip label={p.value.split(' ')[0]} size="small" sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: alpha(MODULE_COLOR, 0.1), color: MODULE_COLOR }} />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 90,
      renderCell: (p) => {
        const c = STATUS_COLORS[p.value] || '#64748b';
        return (
          <Chip label={p.value} size="small" sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: alpha(c, 0.12), color: c, border: `1px solid ${alpha(c, 0.3)}` }} />
        );
      },
    },
    {
      field: 'demandEA',
      headerName: 'Demand EA',
      width: 100,
      type: 'number',
      renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textPrimary }}>{fmtNum(p.value)}</Typography>,
    },
    {
      field: 'supplyEA',
      headerName: 'Supply EA',
      width: 100,
      type: 'number',
      renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textPrimary }}>{fmtNum(p.value)}</Typography>,
    },
    {
      field: 'gapEA',
      headerName: 'Gap EA',
      width: 90,
      type: 'number',
      renderCell: (p) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: p.value < 0 ? '#ef4444' : '#10b981' }}>
          {p.value < 0 ? '' : '+'}{fmtNum(p.value)}
        </Typography>
      ),
    },
    {
      field: 'coverage',
      headerName: 'Coverage',
      width: 100,
      renderCell: (p) => {
        const v = Math.min(p.value, 100);
        const barColor = p.value < 40 ? '#ef4444' : p.value < 80 ? '#f59e0b' : '#10b981';
        return (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={v}
              sx={{
                flex: 1, height: 6, borderRadius: 3,
                bgcolor: alpha(barColor, 0.15),
                '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 3 },
              }}
            />
            <Typography sx={{ fontSize: '0.7rem', color: textSecondary, minWidth: 28, textAlign: 'right' }}>{p.value}%</Typography>
          </Box>
        );
      },
    },
    {
      field: 'demandValue',
      headerName: 'Demand $',
      width: 110,
      type: 'number',
      renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textPrimary }}>{fmtCurrency(p.value)}</Typography>,
    },
    {
      field: 'gapValue',
      headerName: 'Gap $',
      width: 100,
      type: 'number',
      renderCell: (p) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: p.value < 0 ? '#ef4444' : textSecondary }}>
          {fmtCurrency(p.value)}
        </Typography>
      ),
    },
    {
      field: 'marginPct',
      headerName: 'Margin %',
      width: 80,
      type: 'number',
      renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textPrimary }}>{p.value}%</Typography>,
    },
  ], [textPrimary, textSecondary]);

  // ---- Summary cards data ----
  const summaryCards = [
    { label: 'Demand', ea: '284,620 EA', value: '$68.4M', icon: <TrendingUpIcon />, color: MODULE_COLOR },
    { label: 'Supply', ea: '261,840 EA', value: '$58.2M', icon: <InventoryIcon />, color: '#10b981' },
    { label: 'Gap', ea: '-22,780 EA', value: '$4.6M at risk', icon: <WarningIcon />, color: '#ef4444' },
  ];

  const bottleneckCards = [
    { label: 'Shortage', count: 34, unit: 'SKUs', color: '#ef4444', Icon: ErrorIcon },
    { label: 'Tight', count: 62, unit: 'SKUs', color: '#f59e0b', Icon: WarningIcon },
    { label: 'Covered', count: 1842, unit: 'SKUs', color: '#10b981', Icon: CheckCircleIcon },
    { label: 'Excess', count: 348, unit: 'SKUs', color: '#06b6d4', Icon: InfoIcon },
  ];

  // ---- Dark mode DataGrid sx ----
  const dataGridSx = {
    ...stoxTheme.getDataGridSx({ clickable: true }),
    border: `1px solid ${borderColor}`,
    ...(darkMode && {
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: '#21262d',
        color: '#e6edf3',
        fontSize: '0.85rem',
        fontWeight: 700,
        borderBottom: `2px solid ${borderColor}`,
      },
      '& .MuiDataGrid-cell': { fontSize: '0.8rem', borderColor },
      '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' } },
      '& .MuiDataGrid-footerContainer': { borderTop: `1px solid ${borderColor}`, color: '#8b949e' },
      '& .MuiTablePagination-root': { color: '#8b949e' },
      '& .MuiDataGrid-toolbarContainer button': { color: '#8b949e' },
    }),
  };

  // ============================================
  // LIST VIEW - summary cards, bottleneck alerts, chart, DataGrid
  // ============================================
  const renderListView = () => (
    <>
      {/* ========== DUAL-LENS SUMMARY ========== */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {summaryCards.map((card) => (
          <Grid item xs={12} md={4} key={card.label}>
            <Paper sx={{ p: 2, bgcolor: paperBg, border: `1px solid ${borderColor}`, borderRadius: 2, height: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: alpha(card.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.cloneElement(card.icon, { sx: { color: card.color, fontSize: 22 } })}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{card.label}</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: textPrimary, lineHeight: 1.2 }}>{card.ea}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: card.color, fontWeight: 600 }}>{card.value}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ========== BOTTLENECK ALERT CARDS ========== */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {bottleneckCards.map((b) => (
          <Grid item xs={6} md={3} key={b.label}>
            <Card sx={{
              bgcolor: alpha(b.color, 0.08),
              border: `1px solid ${alpha(b.color, 0.2)}`,
              borderRadius: 2,
              boxShadow: 'none',
            }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <b.Icon sx={{ color: b.color, fontSize: 20 }} />
                  <Box>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: b.color, lineHeight: 1 }}>{fmtNum(b.count)}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>{b.label} {b.unit}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ========== STACKED BAR CHART ========== */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: paperBg, border: `1px solid ${borderColor}`, borderRadius: 2 }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: textPrimary, mb: 1 }}>
          12-Week Net Position &mdash; Demand vs Supply
        </Typography>
        <Box sx={{ height: 300 }}>
          <Bar data={barChartData} options={barChartOptions} />
        </Box>
      </Paper>

      {/* ========== DATAGRID ========== */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: paperBg, border: `1px solid ${borderColor}`, borderRadius: 2 }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: textPrimary, mb: 1 }}>
          Material Demand-Supply Breakdown
        </Typography>
        <Box sx={{ height: 520 }}>
          <DataGrid
            rows={materialRows}
            columns={columns}
            density="compact"
            pageSize={18}
            rowsPerPageOptions={[10, 18, 50]}
            disableSelectionOnClick
            onRowClick={(params) => setSelectedRow(params.row)}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 200 } } }}
            sx={dataGridSx}
          />
        </Box>
      </Paper>
    </>
  );

  // ============================================
  // DETAIL VIEW - full-view replacement with material drill-down
  // ============================================
  const renderDetailView = () => (
    <>
      <Grid container spacing={2}>
        {/* ---- Quick Summary + Open Sales Orders ---- */}
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2, boxShadow: 'none', mb: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography sx={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 600, mb: 1 }}>Quick Summary</Typography>
              {[
                { l: 'Demand', v: `${fmtNum(selectedRow.demandEA)} EA` },
                { l: 'Supply', v: `${fmtNum(selectedRow.supplyEA)} EA` },
                { l: 'Gap', v: `${selectedRow.gapEA < 0 ? '' : '+'}${fmtNum(selectedRow.gapEA)} EA` },
                { l: 'Coverage', v: `${selectedRow.coverage}%` },
                { l: 'Demand $', v: fmtCurrency(selectedRow.demandValue) },
                { l: 'Gap $', v: fmtCurrency(selectedRow.gapValue) },
                { l: 'Margin', v: `${selectedRow.marginPct}%` },
              ].map((r) => (
                <Stack key={r.l} direction="row" justifyContent="space-between" sx={{ py: 0.4 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{r.l}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textPrimary }}>{r.v}</Typography>
                </Stack>
              ))}
            </CardContent>
          </Card>

          {/* ---- Open Sales Orders ---- */}
          <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2, boxShadow: 'none' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography sx={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 600, mb: 1 }}>Open Sales Orders</Typography>
              {mockSalesOrders.map((so) => (
                <Stack key={so.so} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.6, borderBottom: `1px solid ${borderColor}`, '&:last-child': { borderBottom: 'none' } }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: MODULE_COLOR }}>{so.so}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>{so.customer}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textPrimary }}>{fmtNum(so.qty)} EA</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>{so.date}</Typography>
                  </Box>
                </Stack>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* ---- Waterfall table ---- */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2, height: '100%' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textPrimary, p: 2, pb: 0 }}>
              Week-by-Week Supply / Demand Breakdown
            </Typography>
            <TableContainer sx={{ maxHeight: 420 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {['Week', 'Opening', 'Demand', 'Supply', 'Closing'].map((h) => (
                      <TableCell key={h} sx={{ fontSize: '0.7rem', fontWeight: 700, color: textPrimary, bgcolor: darkMode ? '#21262d' : '#f8fafc', borderBottom: `2px solid ${borderColor}`, py: 0.5 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {waterfallData.map((r) => (
                    <TableRow key={r.week} sx={{ '&:hover': { bgcolor: alpha(MODULE_COLOR, 0.04) } }}>
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: MODULE_COLOR, py: 0.5, borderBottom: `1px solid ${borderColor}` }}>{r.week}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: textPrimary, py: 0.5, borderBottom: `1px solid ${borderColor}` }}>{fmtNum(r.opening)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, py: 0.5, borderBottom: `1px solid ${borderColor}` }}>-{fmtNum(r.demand)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, py: 0.5, borderBottom: `1px solid ${borderColor}` }}>+{fmtNum(r.supply)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700, color: r.closing < 0 ? '#ef4444' : textPrimary, py: 0.5, borderBottom: `1px solid ${borderColor}` }}>{fmtNum(r.closing)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* ---- Forecast vs Actual line chart ---- */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2, height: '100%' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textPrimary, mb: 1.5 }}>
              12-Week Forecast vs Actual
            </Typography>
            <Box sx={{ height: 340 }}>
              <Line data={detailLineData} options={detailLineOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Box sx={{ bgcolor: bg, minHeight: '100vh', p: 2 }}>
      {/* Shared header */}
      <Paper sx={{ p: 1.5, mb: 2, bgcolor: paperBg, border: `1px solid ${borderColor}`, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={selectedRow ? () => setSelectedRow(null) : onBack} size="small" sx={{ color: MODULE_COLOR }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14, color: textSecondary }} />} sx={{ mb: 0.5 }}>
              <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.7rem', color: textSecondary, cursor: 'pointer' }}>CORE.AI</Link>
              <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.7rem', color: textSecondary, cursor: 'pointer' }}>STOX.AI</Link>
              <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.7rem', color: textSecondary, cursor: 'pointer' }}>Lam Research</Link>
              {selectedRow ? (
                <>
                  <Link underline="hover" onClick={() => setSelectedRow(null)} sx={{ fontSize: '0.7rem', color: textSecondary, cursor: 'pointer' }}>Demand vs Supply Command</Link>
                  <Typography sx={{ fontSize: '0.7rem', color: MODULE_COLOR, fontWeight: 600 }}>{selectedRow.material}</Typography>
                </>
              ) : (
                <Typography sx={{ fontSize: '0.7rem', color: MODULE_COLOR, fontWeight: 600 }}>Demand vs Supply Command</Typography>
              )}
            </Breadcrumbs>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: textPrimary }}>
              {selectedRow
                ? `${selectedRow.material} \u2014 Demand & Supply Detail`
                : 'Demand vs Supply Command Center \u2014 Operational Heart'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {selectedRow ? renderDetailView() : renderListView()}
    </Box>
  );
}
