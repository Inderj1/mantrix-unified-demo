import React, { useState, useMemo, useEffect } from 'react';
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
const HORIZONS = ['7d', '14d', '30d', '60d'];

const STATUS_COLORS = {
  Shortage: '#ef4444',
  Tight: '#f59e0b',
  Covered: '#10b981',
  Excess: '#06b6d4',
};

const buildRow = (id, material, plant, status, demandEA, supplyEA, gapEA, coverage, demandValue, gapValue, marginPct, soRatio, fcRatio, onHandRatio, openPORatio, plannedRatio, fcConfidence) => {
  const soQty = Math.round(demandEA * soRatio);
  const fcQty = demandEA - soQty;
  const onHandEA = Math.round(supplyEA * onHandRatio);
  const openPO = Math.round(supplyEA * openPORatio);
  const plannedEA = Math.round(supplyEA * plannedRatio);
  const inTransit = supplyEA - onHandEA - openPO - plannedEA;
  const unitPrice = demandValue / demandEA;
  const revenueAtRisk = gapEA < 0 ? Math.round(Math.abs(gapEA) * unitPrice) : 0;
  const marginGrade = marginPct >= 40 ? 'High' : marginPct >= 30 ? 'Med' : 'Low';
  return {
    id, material, plant, status,
    soQty, fcQty, demandEA,
    onHandEA, openPO, plannedEA, inTransit, supplyEA,
    gapEA, coverage, demandValue, gapValue, marginPct,
    confidence: soRatio >= 0.95 ? 100 : fcConfidence,
    revenueAtRisk,
    marginGrade,
  };
};

const materialRows = [
  buildRow(1,  'RF Generator Module',      'P1000 (Fremont)',   'Shortage', 4820,  3140,  -1680, 28,  4218000,  -1470000, 42.1, 0.65, 0.35, 0.45, 0.30, 0.15, 74),
  buildRow(2,  'Wafer Chamber Liner',       'P2000 (Tualatin)',  'Tight',    12640, 10920, -1720, 55,  2654000,  -361000,  38.4, 0.72, 0.28, 0.42, 0.32, 0.16, 78),
  buildRow(3,  'ESC (Electrostatic Chuck)', 'P1000 (Fremont)',   'Shortage', 3280,  1960,  -1320, 22,  5248000,  -2112000, 46.8, 0.62, 0.38, 0.48, 0.28, 0.14, 71),
  buildRow(4,  'Etch Gas Manifold',         'P3000 (Livermore)', 'Tight',    8440,  7120,  -1320, 62,  1856000,  -290000,  35.2, 0.68, 0.32, 0.44, 0.31, 0.15, 76),
  buildRow(5,  'Plasma Source Assembly',    'P4000 (Chandler)',  'Covered',  6240,  7480,  1240,  88,  4368000,  0,        41.5, 0.75, 0.25, 0.46, 0.30, 0.16, 82),
  buildRow(6,  'CVD Showerhead',            'P2000 (Tualatin)',  'Covered',  18920, 20180, 1260,  92,  3216000,  0,        33.8, 0.78, 0.22, 0.43, 0.33, 0.15, 80),
  buildRow(7,  'Process Kit',               'P1000 (Fremont)',   'Covered',  42680, 44120, 1440,  95,  5976000,  0,        28.6, 0.80, 0.20, 0.50, 0.28, 0.14, 85),
  buildRow(8,  'Matching Network',          'P3000 (Livermore)', 'Tight',    5640,  4820,  -820,  48,  3948000,  -574000,  44.2, 0.66, 0.34, 0.42, 0.34, 0.16, 72),
  buildRow(9,  'Quartz Window',             'P4000 (Chandler)',  'Covered',  14280, 15640, 1360,  86,  1714000,  0,        31.4, 0.74, 0.26, 0.47, 0.30, 0.15, 79),
  buildRow(10, 'Turbomolecular Pump',       'P2000 (Tualatin)',  'Shortage', 2160,  1280,  -880,  18,  6480000,  -2640000, 48.6, 0.60, 0.40, 0.44, 0.30, 0.17, 68),
  buildRow(11, 'Gas Panel Assembly',        'P1000 (Fremont)',   'Covered',  7840,  8960,  1120,  91,  2744000,  0,        36.2, 0.76, 0.24, 0.45, 0.32, 0.15, 81),
  buildRow(12, 'Endpoint Detector',         'P3000 (Livermore)', 'Tight',    4960,  3840,  -1120, 52,  3472000,  -784000,  39.8, 0.70, 0.30, 0.43, 0.33, 0.16, 75),
  buildRow(13, 'Robot Arm Assembly',        'P4000 (Chandler)',  'Covered',  3680,  4240,  560,   84,  5152000,  0,        43.1, 0.73, 0.27, 0.48, 0.29, 0.15, 83),
  buildRow(14, 'Load Lock Assembly',        'P2000 (Tualatin)',  'Covered',  2840,  3120,  280,   89,  3976000,  0,        40.6, 0.77, 0.23, 0.46, 0.31, 0.16, 80),
  buildRow(15, 'Throttle Valve',            'P1000 (Fremont)',   'Tight',    9640,  8120,  -1520, 58,  1446000,  -228000,  29.4, 0.64, 0.36, 0.41, 0.35, 0.18, 70),
  buildRow(16, 'Ceramic Ring',              'P3000 (Livermore)', 'Excess',   22480, 31640, 9160,  142, 1124000,  0,        24.8, 0.82, 0.18, 0.50, 0.28, 0.14, 84),
  buildRow(17, 'High Flow Gas Line',        'P4000 (Chandler)',  'Covered',  16840, 18260, 1420,  87,  2526000,  0,        32.6, 0.71, 0.29, 0.44, 0.32, 0.17, 77),
  buildRow(18, 'Power Distribution Unit',   'P2000 (Tualatin)',  'Excess',   5280,  7420,  2140,  138, 3696000,  0,        37.4, 0.79, 0.21, 0.49, 0.27, 0.15, 82),
];

const weekLabels = ['Wk1', 'Wk2', 'Wk3', 'Wk4', 'Wk5', 'Wk6', 'Wk7', 'Wk8', 'Wk9', 'Wk10', 'Wk11', 'Wk12'];

const weeklyDemand = [-22400, -24800, -19600, -26200, -28000, -21800, -23400, -25600, -18400, -27200, -24000, -22800];
const weeklySupply = [18600, 21200, 17800, 24400, 26800, 20400, 22000, 23800, 16200, 25600, 22400, 30000];
const weeklyNet = weeklyDemand.map((d, i) => d + weeklySupply[i]);

const AVG_UNIT_PRICE = 875;

const generateWaterfallData = () => {
  const opening = 4200;
  const data = [];
  let balance = opening;
  let cumulative = opening;
  data.push({ week: 'Opening', opening, demand: 0, supply: 0, closing: opening, cumPosition: cumulative, dollarExposure: opening * AVG_UNIT_PRICE });
  weekLabels.forEach((wk, i) => {
    const demand = Math.abs(Math.round(weeklyDemand[i] / 80));
    const supply = Math.round(weeklySupply[i] / 80);
    balance = balance - demand + supply;
    cumulative += balance;
    data.push({
      week: wk,
      opening: balance + demand - supply,
      demand,
      supply,
      closing: balance,
      cumPosition: cumulative,
      dollarExposure: balance * AVG_UNIT_PRICE,
    });
  });
  return data;
};

const mockSalesOrders = [
  { so: 'SO-4401287', qty: 120, date: '2025-02-14', customer: 'TSMC' },
  { so: 'SO-4401312', qty: 85, date: '2025-02-18', customer: 'Samsung' },
  { so: 'SO-4401345', qty: 64, date: '2025-02-22', customer: 'Intel' },
  { so: 'SO-4401378', qty: 42, date: '2025-03-01', customer: 'Micron' },
];

const mockForecastOrders = [
  { fc: 'FC-2025-Q1-A', qty: 180, date: '2025-03-15', confidence: 82, source: 'ML Model' },
  { fc: 'FC-2025-Q1-B', qty: 145, date: '2025-03-28', confidence: 76, source: 'Customer Signal' },
  { fc: 'FC-2025-Q2-A', qty: 210, date: '2025-04-12', confidence: 68, source: 'ML Model' },
];

const mockPurchaseOrders = [
  { po: 'PO-8801234', qty: 200, vendor: 'VENDOR-KYOCERA', dueDate: '2025-02-20', otdRisk: 22 },
  { po: 'PO-8801256', qty: 150, vendor: 'VENDOR-EDWARDS', dueDate: '2025-03-05', otdRisk: 38 },
  { po: 'PO-8801278', qty: 95, vendor: 'VENDOR-MKS', dueDate: '2025-03-15', otdRisk: 12 },
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

const MARGIN_GRADE_COLORS = { High: '#10b981', Med: '#f59e0b', Low: '#ef4444' };

// ============================================
// COMPONENT
// ============================================
export default function LamDemandSupplyCommand({ onBack, darkMode = false }) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [horizon, setHorizon] = useState('30d');
  useEffect(() => { if (selectedRow) window.scrollTo(0, 0); }, [selectedRow]);
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
      headerName: 'Total Demand',
      width: 110,
      type: 'number',
      renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textPrimary }}>{fmtNum(p.value)}</Typography>,
    },
    {
      field: 'soQty',
      headerName: 'SO Qty',
      width: 90,
      type: 'number',
      renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textPrimary }}>{fmtNum(p.value)}</Typography>,
    },
    {
      field: 'fcQty',
      headerName: 'FC Qty',
      width: 90,
      type: 'number',
      renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textPrimary }}>{fmtNum(p.value)}</Typography>,
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 90,
      renderCell: (p) => {
        const chipColor = p.value === 100 ? '#10b981' : '#f59e0b';
        return (
          <Chip
            label={`${p.value}%`}
            size="small"
            sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: alpha(chipColor, 0.12), color: chipColor, border: `1px solid ${alpha(chipColor, 0.3)}` }}
          />
        );
      },
    },
    {
      field: 'supplyEA',
      headerName: 'Total Supply',
      width: 110,
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
      field: 'revenueAtRisk',
      headerName: 'Rev @ Risk',
      width: 110,
      type: 'number',
      renderCell: (p) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: p.value > 0 ? '#ef4444' : textSecondary }}>
          {p.value > 0 ? fmtCurrency(p.value) : '--'}
        </Typography>
      ),
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
      field: 'marginGrade',
      headerName: 'Margin',
      width: 80,
      renderCell: (p) => {
        const c = MARGIN_GRADE_COLORS[p.value] || '#64748b';
        return (
          <Chip label={p.value} size="small" sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: alpha(c, 0.12), color: c, border: `1px solid ${alpha(c, 0.3)}` }} />
        );
      },
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

      {/* ========== BOTTLENECK HORIZON TOGGLE + ALERT CARDS ========== */}
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        {HORIZONS.map((h) => (
          <Chip
            key={h}
            label={h}
            size="small"
            onClick={() => setHorizon(h)}
            sx={{
              fontWeight: 600,
              fontSize: '0.7rem',
              bgcolor: horizon === h ? MODULE_COLOR : alpha(MODULE_COLOR, 0.08),
              color: horizon === h ? '#fff' : MODULE_COLOR,
              cursor: 'pointer',
              '&:hover': { bgcolor: horizon === h ? MODULE_COLOR : alpha(MODULE_COLOR, 0.15) },
            }}
          />
        ))}
      </Stack>

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
        {/* ---- Quick Summary + Open Sales Orders + Forecast Orders + Purchase Orders ---- */}
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2, boxShadow: 'none', mb: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography sx={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 600, mb: 1 }}>Quick Summary</Typography>
              {[
                { l: 'Demand', v: `${fmtNum(selectedRow.demandEA)} EA` },
                { l: 'SO Demand', v: `${fmtNum(selectedRow.soQty)} EA` },
                { l: 'FC Demand', v: `${fmtNum(selectedRow.fcQty)} EA` },
                { l: 'Supply', v: `${fmtNum(selectedRow.supplyEA)} EA` },
                { l: 'On-Hand', v: `${fmtNum(selectedRow.onHandEA)} EA` },
                { l: 'Open PO', v: `${fmtNum(selectedRow.openPO)} EA` },
                { l: 'Planned', v: `${fmtNum(selectedRow.plannedEA)} EA` },
                { l: 'In-Transit', v: `${fmtNum(selectedRow.inTransit)} EA` },
                { l: 'Gap', v: `${selectedRow.gapEA < 0 ? '' : '+'}${fmtNum(selectedRow.gapEA)} EA` },
                { l: 'Coverage', v: `${selectedRow.coverage}%` },
                { l: 'Confidence', v: `${selectedRow.confidence}%` },
                { l: 'Demand $', v: fmtCurrency(selectedRow.demandValue) },
                { l: 'Gap $', v: fmtCurrency(selectedRow.gapValue) },
                { l: 'Revenue at Risk', v: selectedRow.revenueAtRisk > 0 ? fmtCurrency(selectedRow.revenueAtRisk) : '--' },
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
          <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2, boxShadow: 'none', mb: 2 }}>
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

          {/* ---- Forecast Orders ---- */}
          <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2, boxShadow: 'none', mb: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography sx={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 600, mb: 1 }}>Forecast Orders</Typography>
              {mockForecastOrders.map((fc) => (
                <Stack key={fc.fc} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.6, borderBottom: `1px solid ${borderColor}`, '&:last-child': { borderBottom: 'none' } }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: MODULE_COLOR }}>{fc.fc}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>{fc.source}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textPrimary }}>{fmtNum(fc.qty)} EA</Typography>
                      <Chip
                        label={`${fc.confidence}%`}
                        size="small"
                        sx={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          height: 18,
                          bgcolor: alpha(fc.confidence >= 80 ? '#10b981' : '#f59e0b', 0.12),
                          color: fc.confidence >= 80 ? '#10b981' : '#f59e0b',
                        }}
                      />
                    </Stack>
                    <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>{fc.date}</Typography>
                  </Box>
                </Stack>
              ))}
            </CardContent>
          </Card>

          {/* ---- Open Purchase Orders ---- */}
          <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2, boxShadow: 'none' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography sx={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 600, mb: 1 }}>Open Purchase Orders</Typography>
              {mockPurchaseOrders.map((po) => (
                <Stack key={po.po} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.6, borderBottom: `1px solid ${borderColor}`, '&:last-child': { borderBottom: 'none' } }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: MODULE_COLOR }}>{po.po}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>{po.vendor}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textPrimary }}>{fmtNum(po.qty)} EA</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                      <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>{po.dueDate}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: po.otdRisk > 20 ? '#ef4444' : textSecondary }}>
                        OTD {po.otdRisk}%
                      </Typography>
                    </Stack>
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
                    {['Week', 'Opening', 'Demand', 'Supply', 'Closing', 'Cum. Position', '$ Exposure'].map((h) => (
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
                      <TableCell sx={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, py: 0.5, borderBottom: `1px solid ${borderColor}` }}>{r.demand === 0 ? '--' : `-${fmtNum(r.demand)}`}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, py: 0.5, borderBottom: `1px solid ${borderColor}` }}>{r.supply === 0 ? '--' : `+${fmtNum(r.supply)}`}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700, color: r.closing < 0 ? '#ef4444' : textPrimary, py: 0.5, borderBottom: `1px solid ${borderColor}` }}>{fmtNum(r.closing)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: r.cumPosition < 0 ? '#ef4444' : textPrimary, py: 0.5, borderBottom: `1px solid ${borderColor}` }}>{fmtNum(r.cumPosition)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: r.dollarExposure < 0 ? '#ef4444' : textPrimary, py: 0.5, borderBottom: `1px solid ${borderColor}` }}>{fmtCurrency(r.dollarExposure)}</TableCell>
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
              <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.7rem', color: textSecondary, cursor: 'pointer' }}>Lam Research</Link>
              {selectedRow ? [
                <Link key="tile" underline="hover" onClick={() => setSelectedRow(null)} sx={{ fontSize: '0.7rem', color: textSecondary, cursor: 'pointer' }}>Demand vs Supply Command</Link>,
                <Typography key="detail" sx={{ fontSize: '0.7rem', color: MODULE_COLOR, fontWeight: 600 }}>{selectedRow.material}</Typography>,
              ] : (
                <Typography sx={{ fontSize: '0.7rem', color: MODULE_COLOR, fontWeight: 600 }}>Demand vs Supply Command</Typography>
              )}
            </Breadcrumbs>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: textPrimary }}>
              {selectedRow
                ? 'Demand & Supply Detail'
                : 'Demand vs Supply Command Center \u2014 Operational Heart'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {selectedRow ? renderDetailView() : renderListView()}
    </Box>
  );
}
