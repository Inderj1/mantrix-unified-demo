import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Breadcrumbs,
  Link,
  Stack,
  IconButton,
  LinearProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  Tune as TuneIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Remove as RemoveIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import stoxTheme from '../stoxTheme';
import { getColors, MODULE_COLOR } from '../../../config/brandColors';

// ============================================
// Formatting helpers
// ============================================
const formatCurrency = (value) => {
  if (value == null) return '-';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}K`;
  return `${sign}$${abs.toLocaleString('en-US')}`;
};

const formatNumber = (value) => {
  if (value == null) return '-';
  return Number(value).toLocaleString('en-US');
};

const formatPercent = (value) => {
  if (value == null) return '-';
  return `${Number(value).toFixed(1)}%`;
};

// ============================================
// Mock Data — 15 Semiconductor Materials
// ============================================
const MOCK_DATA = [
  { id: 1,  material: 'RF Generator Module',     plant: 'P1000', action: 'Reduce',   currentSS: 4200, optimalSS: 1680, deltaEA: -2520,  deltaCapital: -617400,  reorderPt: 5600, optimalROP: 2900, lotSize: 500, optimalLot: 350, rationale: 'LT variance + high service level', marginProtected: 98.2, roi: 320 },
  { id: 2,  material: 'Wafer Chamber Liner',      plant: 'P2000', action: 'Reduce',   currentSS: 6800, optimalSS: 3400, deltaEA: -3400,  deltaCapital: -129200,  reorderPt: 8200, optimalROP: 5100, lotSize: 1000, optimalLot: 800, rationale: 'Demand CV + excess buffer', marginProtected: 97.1, roi: 185 },
  { id: 3,  material: 'ESC (Electrostatic Chuck)', plant: 'P1000', action: 'Reduce',   currentSS: 2400, optimalSS: 960,  deltaEA: -1440,  deltaCapital: -262080,  reorderPt: 3200, optimalROP: 1640, lotSize: 200, optimalLot: 150, rationale: 'LT variance + high service level', marginProtected: 96.5, roi: 410 },
  { id: 4,  material: 'Etch Gas Manifold',        plant: 'P3000', action: 'Maintain',  currentSS: 3600, optimalSS: 3600, deltaEA: 0,      deltaCapital: 0,        reorderPt: 4800, optimalROP: 4800, lotSize: 400, optimalLot: 400, rationale: 'Parameters optimal', marginProtected: 99.4, roi: 0   },
  { id: 5,  material: 'Plasma Source Assembly',    plant: 'P1000', action: 'Reduce',    currentSS: 1200, optimalSS: 480,  deltaEA: -720,   deltaCapital: -231120,  reorderPt: 1800, optimalROP: 840, lotSize: 100, optimalLot: 80, rationale: 'LT variance + demand volatility', marginProtected: 95.8, roi: 450 },
  { id: 6,  material: 'CVD Showerhead',           plant: 'P2000', action: 'Increase',  currentSS: 2800, optimalSS: 3920, deltaEA: 1120,   deltaCapital: 82880,    reorderPt: 3600, optimalROP: 4720, lotSize: 300, optimalLot: 400, rationale: 'Below SS risk + demand growth', marginProtected: 99.8, roi: 85  },
  { id: 7,  material: 'Process Kit',              plant: 'P4000', action: 'Reduce',    currentSS: 8000, optimalSS: 4000, deltaEA: -4000,  deltaCapital: -84000,   reorderPt: 9500, optimalROP: 5500, lotSize: 2000, optimalLot: 1200, rationale: 'Low service level + excess buffer', marginProtected: 93.2, roi: 140 },
  { id: 8,  material: 'Matching Network',         plant: 'P1000', action: 'Maintain',  currentSS: 1800, optimalSS: 1800, deltaEA: 0,      deltaCapital: 0,        reorderPt: 2500, optimalROP: 2500, lotSize: 150, optimalLot: 150, rationale: 'Parameters optimal', marginProtected: 98.9, roi: 0   },
  { id: 9,  material: 'Quartz Window',            plant: 'P3000', action: 'Reduce',    currentSS: 7200, optimalSS: 4320, deltaEA: -2880,  deltaCapital: -36000,   reorderPt: 8400, optimalROP: 5520, lotSize: 1500, optimalLot: 1000, rationale: 'Low CV + excess buffer', marginProtected: 92.1, roi: 110 },
  { id: 10, material: 'Turbomolecular Pump',      plant: 'P2000', action: 'Reduce',    currentSS: 800,  optimalSS: 320,  deltaEA: -480,   deltaCapital: -139200,  reorderPt: 1200, optimalROP: 580, lotSize: 50, optimalLot: 40, rationale: 'LT variance + demand volatility', marginProtected: 96.8, roi: 290 },
  { id: 11, material: 'Gas Panel Assembly',       plant: 'P4000', action: 'Increase',  currentSS: 2000, optimalSS: 2800, deltaEA: 800,    deltaCapital: 73600,    reorderPt: 2800, optimalROP: 3600, lotSize: 250, optimalLot: 350, rationale: 'Below SS risk + demand growth', marginProtected: 99.6, roi: 92  },
  { id: 12, material: 'Endpoint Detector',        plant: 'P3000', action: 'Maintain',  currentSS: 1400, optimalSS: 1400, deltaEA: 0,      deltaCapital: 0,        reorderPt: 1900, optimalROP: 1900, lotSize: 120, optimalLot: 120, rationale: 'Parameters optimal', marginProtected: 98.4, roi: 0   },
  { id: 13, material: 'Robot Arm Assembly',        plant: 'P1000', action: 'Reduce',    currentSS: 600,  optimalSS: 240,  deltaEA: -360,   deltaCapital: -151200,  reorderPt: 850, optimalROP: 440, lotSize: 30, optimalLot: 25, rationale: 'LT variance + high service level', marginProtected: 94.7, roi: 380 },
  { id: 14, material: 'Load Lock Assembly',        plant: 'P2000', action: 'Maintain',  currentSS: 900,  optimalSS: 900,  deltaEA: 0,      deltaCapital: 0,        reorderPt: 1300, optimalROP: 1300, lotSize: 60, optimalLot: 60, rationale: 'Parameters optimal', marginProtected: 97.5, roi: 0   },
  { id: 15, material: 'Throttle Valve',           plant: 'P4000', action: 'Maintain',  currentSS: 5200, optimalSS: 5200, deltaEA: 0,      deltaCapital: 0,        reorderPt: 6400, optimalROP: 6400, lotSize: 600, optimalLot: 600, rationale: 'Parameters optimal', marginProtected: 99.1, roi: 0   },
];

// Detail data per material (SAP parameters + formula variables)
const DETAIL_DATA = {
  1:  { z: 1.96, sigmaD: 12.4, lt: 14, ltVar: 3.2, plifzCurr: 14, plifzProp: 10, eisbeCurr: 4200, eisbeProp: 1680, minbeCurr: 5600, minbeProp: 2900, dislsCurr: 500, dislsProp: 350, ssCostCurr: 1029000, ssCostProp: 411600 },
  2:  { z: 1.65, sigmaD: 28.6, lt: 10, ltVar: 2.1, plifzCurr: 10, plifzProp: 8,  eisbeCurr: 6800, eisbeProp: 3400, minbeCurr: 8200, minbeProp: 5100, dislsCurr: 1000, dislsProp: 800, ssCostCurr: 258400, ssCostProp: 129200 },
  3:  { z: 1.96, sigmaD: 8.2,  lt: 21, ltVar: 4.5, plifzCurr: 21, plifzProp: 14, eisbeCurr: 2400, eisbeProp: 960,  minbeCurr: 3200, minbeProp: 1640, dislsCurr: 200, dislsProp: 150, ssCostCurr: 436800, ssCostProp: 174720 },
  4:  { z: 1.65, sigmaD: 18.4, lt: 12, ltVar: 2.0, plifzCurr: 12, plifzProp: 12, eisbeCurr: 3600, eisbeProp: 3600, minbeCurr: 4800, minbeProp: 4800, dislsCurr: 400, dislsProp: 400, ssCostCurr: 201600, ssCostProp: 201600 },
  5:  { z: 2.33, sigmaD: 5.1,  lt: 28, ltVar: 6.3, plifzCurr: 28, plifzProp: 18, eisbeCurr: 1200, eisbeProp: 480,  minbeCurr: 1800, minbeProp: 840,  dislsCurr: 100, dislsProp: 80,  ssCostCurr: 385200, ssCostProp: 154080 },
  6:  { z: 1.96, sigmaD: 15.3, lt: 8,  ltVar: 1.8, plifzCurr: 8,  plifzProp: 8,  eisbeCurr: 2800, eisbeProp: 3920, minbeCurr: 3600, minbeProp: 4720, dislsCurr: 300, dislsProp: 400, ssCostCurr: 207200, ssCostProp: 290080 },
  7:  { z: 1.28, sigmaD: 45.2, lt: 7,  ltVar: 1.5, plifzCurr: 7,  plifzProp: 7,  eisbeCurr: 8000, eisbeProp: 4000, minbeCurr: 9500, minbeProp: 5500, dislsCurr: 2000, dislsProp: 1200, ssCostCurr: 168000, ssCostProp: 84000 },
  8:  { z: 1.65, sigmaD: 9.8,  lt: 18, ltVar: 3.0, plifzCurr: 18, plifzProp: 18, eisbeCurr: 1800, eisbeProp: 1800, minbeCurr: 2500, minbeProp: 2500, dislsCurr: 150, dislsProp: 150, ssCostCurr: 266400, ssCostProp: 266400 },
  9:  { z: 1.28, sigmaD: 34.8, lt: 6,  ltVar: 1.2, plifzCurr: 6,  plifzProp: 5,  eisbeCurr: 7200, eisbeProp: 4320, minbeCurr: 8400, minbeProp: 5520, dislsCurr: 1500, dislsProp: 1000, ssCostCurr: 90000, ssCostProp: 54000 },
  10: { z: 2.33, sigmaD: 3.8,  lt: 35, ltVar: 7.0, plifzCurr: 35, plifzProp: 25, eisbeCurr: 800,  eisbeProp: 320,  minbeCurr: 1200, minbeProp: 580,  dislsCurr: 50,  dislsProp: 40,  ssCostCurr: 232000, ssCostProp: 92800 },
  11: { z: 1.65, sigmaD: 14.2, lt: 10, ltVar: 2.4, plifzCurr: 10, plifzProp: 10, eisbeCurr: 2000, eisbeProp: 2800, minbeCurr: 2800, minbeProp: 3600, dislsCurr: 250, dislsProp: 350, ssCostCurr: 184000, ssCostProp: 257600 },
  12: { z: 1.65, sigmaD: 7.6,  lt: 15, ltVar: 2.8, plifzCurr: 15, plifzProp: 15, eisbeCurr: 1400, eisbeProp: 1400, minbeCurr: 1900, minbeProp: 1900, dislsCurr: 120, dislsProp: 120, ssCostCurr: 162400, ssCostProp: 162400 },
  13: { z: 2.33, sigmaD: 2.4,  lt: 42, ltVar: 9.0, plifzCurr: 42, plifzProp: 28, eisbeCurr: 600,  eisbeProp: 240,  minbeCurr: 850,  minbeProp: 440,  dislsCurr: 30,  dislsProp: 25,  ssCostCurr: 252000, ssCostProp: 100800 },
  14: { z: 1.65, sigmaD: 4.5,  lt: 20, ltVar: 3.5, plifzCurr: 20, plifzProp: 20, eisbeCurr: 900,  eisbeProp: 900,  minbeCurr: 1300, minbeProp: 1300, dislsCurr: 60,  dislsProp: 60,  ssCostCurr: 175500, ssCostProp: 175500 },
  15: { z: 1.28, sigmaD: 22.0, lt: 9,  ltVar: 1.6, plifzCurr: 9,  plifzProp: 9,  eisbeCurr: 5200, eisbeProp: 5200, minbeCurr: 6400, minbeProp: 6400, dislsCurr: 600, dislsProp: 600, ssCostCurr: 223600, ssCostProp: 223600 },
};

// ============================================
// Component
// ============================================
const LamSafetyStockEconomics = ({ onBack, darkMode = false }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const scrollPosRef = useRef(0);
  const handleDrillDown = (id) => { scrollPosRef.current = window.scrollY; setSelectedRow(id); };
  const handleDrillBack = () => { setSelectedRow(null); };
  useEffect(() => {
    if (selectedRow) { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else { window.scrollTo({ top: scrollPosRef.current, behavior: 'smooth' }); }
  }, [selectedRow]);
  const colors = getColors(darkMode);

  // ---- KPI summaries ----
  const summaryKPIs = useMemo(() => {
    const totalSKUs = MOCK_DATA.length;
    const netReduction = MOCK_DATA.reduce((s, r) => s + (r.deltaEA < 0 ? r.deltaEA : 0), 0);
    const additions = MOCK_DATA.reduce((s, r) => s + (r.deltaEA > 0 ? r.deltaEA : 0), 0);
    const capitalReleased = MOCK_DATA.reduce((s, r) => s + (r.deltaCapital < 0 ? r.deltaCapital : 0), 0);
    const capitalInvested = MOCK_DATA.reduce((s, r) => s + (r.deltaCapital > 0 ? r.deltaCapital : 0), 0);
    const netWC = capitalReleased + capitalInvested;
    return { totalSKUs, netReduction, additions, capitalReleased: Math.abs(capitalReleased), capitalInvested, netWC };
  }, []);

  // ---- Action chip renderer ----
  const renderActionChip = (action) => {
    const map = {
      Reduce:   { icon: <ArrowDownwardIcon sx={{ fontSize: 14 }} />, label: 'Reduce \u2193',  bg: alpha('#10b981', 0.12), color: '#059669', border: alpha('#059669', 0.3) },
      Increase: { icon: <ArrowUpwardIcon sx={{ fontSize: 14 }} />,   label: 'Increase \u2191', bg: alpha('#f59e0b', 0.12), color: '#d97706', border: alpha('#d97706', 0.3) },
      Maintain: { icon: <RemoveIcon sx={{ fontSize: 14 }} />,        label: 'Maintain \u2014', bg: alpha('#64748b', 0.12), color: '#64748b', border: alpha('#64748b', 0.3) },
    };
    const s = map[action] || map.Maintain;
    return (
      <Chip
        label={s.label}
        size="small"
        sx={{ bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 700, fontSize: '0.7rem', height: 24 }}
      />
    );
  };

  // ---- DataGrid columns ----
  const columns = [
    {
      field: 'material',
      headerName: 'Material',
      width: 180,
      renderCell: (p) => <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: colors.text }}>{p.value}</Typography>,
    },
    {
      field: 'plant',
      headerName: 'Plant',
      width: 80,
      renderCell: (p) => (
        <Chip label={p.value} size="small" sx={{ bgcolor: alpha(MODULE_COLOR, 0.12), color: MODULE_COLOR, fontWeight: 700, fontSize: '0.7rem', height: 22, border: `1px solid ${alpha(MODULE_COLOR, 0.2)}` }} />
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 90,
      renderCell: (p) => renderActionChip(p.value),
    },
    {
      field: 'currentSS',
      headerName: 'Current SS',
      width: 100,
      type: 'number',
      renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>{formatNumber(p.value)} EA</Typography>,
    },
    {
      field: 'optimalSS',
      headerName: 'Optimal SS',
      width: 100,
      type: 'number',
      renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.primary }}>{formatNumber(p.value)} EA</Typography>,
    },
    {
      field: 'deltaEA',
      headerName: '\u0394 EA',
      width: 90,
      type: 'number',
      renderCell: (p) => {
        const val = p.value;
        const color = val < 0 ? '#059669' : val > 0 ? '#d97706' : colors.textSecondary;
        return <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color }}>{val > 0 ? '+' : ''}{formatNumber(val)}</Typography>;
      },
    },
    {
      field: 'deltaCapital',
      headerName: '\u0394 Capital',
      width: 110,
      type: 'number',
      renderCell: (p) => {
        const val = p.value;
        const color = val < 0 ? '#059669' : val > 0 ? '#d97706' : colors.textSecondary;
        return <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color }}>{val > 0 ? '+' : ''}{formatCurrency(val)}</Typography>;
      },
    },
    {
      field: 'reorderPt',
      headerName: 'ROP',
      width: 90,
      type: 'number',
      renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>{formatNumber(p.row.reorderPt)} EA</Typography>,
    },
    {
      field: 'lotSize',
      headerName: 'Lot Size',
      width: 90,
      type: 'number',
      renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>{formatNumber(p.row.lotSize)} EA</Typography>,
    },
    {
      field: 'rationale',
      headerName: 'Rationale',
      width: 180,
      minWidth: 140,
      renderCell: (p) => <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary, fontStyle: 'italic' }}>{p.row.rationale}</Typography>,
    },
    {
      field: 'marginProtected',
      headerName: 'Margin %',
      width: 100,
      type: 'number',
      renderCell: (p) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={p.value}
            sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: alpha('#10b981', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 3 } }}
          />
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: colors.text, minWidth: 36 }}>{formatPercent(p.value)}</Typography>
        </Box>
      ),
    },
    {
      field: 'roi',
      headerName: 'ROI',
      width: 80,
      type: 'number',
      renderCell: (p) => {
        const val = p.value;
        const color = val > 100 ? '#059669' : val > 0 ? '#d97706' : colors.textSecondary;
        return <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color }}>{val > 0 ? `${val}%` : '\u2014'}</Typography>;
      },
    },
  ];

  // ---- Detail view (full-page replacement) ----
  const renderDetailView = () => {
    const row = MOCK_DATA.find((r) => r.id === selectedRow);
    if (!row) return null;
    const d = DETAIL_DATA[row.id];
    if (!d) return null;

    const annualCarryingRate = 0.18;
    const annualCarryingSaved = (d.ssCostCurr - d.ssCostProp) * annualCarryingRate;

    const sapParams = [
      { param: 'PLIFZ', label: 'Planned Delivery Time (days)', current: `${d.plifzCurr} days`, proposed: `${d.plifzProp} days`,
        delta: d.plifzProp - d.plifzCurr === 0 ? '\u2014' : `${d.plifzProp - d.plifzCurr} days`,
        deltaCapital: d.plifzProp - d.plifzCurr === 0 ? 0 : Math.round((d.plifzProp - d.plifzCurr) * -2800) },
      { param: 'EISBE', label: 'Safety Stock (EA)', current: formatNumber(d.eisbeCurr), proposed: formatNumber(d.eisbeProp),
        delta: d.eisbeProp - d.eisbeCurr === 0 ? '\u2014' : `${d.eisbeProp - d.eisbeCurr > 0 ? '+' : ''}${formatNumber(d.eisbeProp - d.eisbeCurr)}`,
        deltaCapital: Math.round((d.eisbeProp - d.eisbeCurr) * (d.ssCostCurr / d.eisbeCurr || 0)) },
      { param: 'MINBE', label: 'Reorder Point (EA)', current: formatNumber(d.minbeCurr), proposed: formatNumber(d.minbeProp),
        delta: d.minbeProp - d.minbeCurr === 0 ? '\u2014' : `${d.minbeProp - d.minbeCurr > 0 ? '+' : ''}${formatNumber(d.minbeProp - d.minbeCurr)}`,
        deltaCapital: Math.round((d.minbeProp - d.minbeCurr) * (d.ssCostCurr / d.eisbeCurr || 0) * 0.4) },
      { param: 'DISLS', label: 'Lot Size (EA)', current: formatNumber(d.dislsCurr), proposed: formatNumber(d.dislsProp),
        delta: d.dislsProp - d.dislsCurr === 0 ? '\u2014' : `${d.dislsProp - d.dislsCurr > 0 ? '+' : ''}${formatNumber(d.dislsProp - d.dislsCurr)}`,
        deltaCapital: Math.round((d.dislsProp - d.dislsCurr) * (d.ssCostCurr / d.eisbeCurr || 0) * 0.2) },
    ];

    return (
      <>
        <Grid container spacing={2}>
          {/* Material info card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: colors.paper, border: `1px solid ${colors.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: colors.text, mb: 1 }}>{row.material}</Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Plant</Typography>
                    <Chip label={row.plant} size="small" sx={{ bgcolor: alpha(MODULE_COLOR, 0.12), color: MODULE_COLOR, fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Action</Typography>
                    {renderActionChip(row.action)}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Margin Protected</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>{formatPercent(row.marginProtected)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>ROI</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: row.roi > 100 ? '#059669' : '#d97706' }}>{row.roi > 0 ? `${row.roi}%` : '\u2014'}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Safety Stock Formula card */}
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: colors.paper, border: `1px solid ${colors.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: colors.text, mb: 1.5 }}>Safety Stock Formula</Typography>
                <Box sx={{ bgcolor: darkMode ? '#0d1117' : '#f8fafc', borderRadius: 1, p: 1.5, mb: 1.5, border: `1px solid ${colors.border}` }}>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: colors.primary, fontFamily: 'monospace', textAlign: 'center' }}>
                    SS = Z &times; &sigma;<sub>d</sub> &times; &radic;(LT + LT<sub>var</sub>)
                  </Typography>
                </Box>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Z (Service Factor)', value: d.z.toFixed(2) },
                    { label: '\u03C3d (Demand Std Dev)', value: `${d.sigmaD} EA/day` },
                    { label: 'LT (Lead Time)', value: `${d.lt} days` },
                    { label: 'LT var (Lead Time Variance)', value: `${d.ltVar} days` },
                    { label: 'Computed Optimal SS', value: `${formatNumber(row.optimalSS)} EA` },
                  ].map((v, i) => (
                    <Grid item xs={6} sm={4} key={i}>
                      <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{v.label}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: colors.text }}>{v.value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* SAP Parameter Changes Table */}
          <Grid item xs={12} md={7}>
            <Card sx={{ bgcolor: colors.paper, border: `1px solid ${colors.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: colors.text, mb: 1.5 }}>SAP Parameter Changes</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontSize: '0.75rem', fontWeight: 700, color: colors.textSecondary, borderBottom: `2px solid ${colors.border}`, py: 0.75 } }}>
                        <TableCell>Parameter</TableCell>
                        <TableCell align="right">Current</TableCell>
                        <TableCell align="right">Proposed</TableCell>
                        <TableCell align="right">&Delta;</TableCell>
                        <TableCell align="right">&Delta; Capital</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sapParams.map((sp) => (
                        <TableRow key={sp.param} sx={{ '& td': { fontSize: '0.8rem', color: colors.text, borderBottom: `1px solid ${colors.border}`, py: 0.75 } }}>
                          <TableCell>
                            <Box>
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>{sp.param}</Typography>
                              <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>{sp.label}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{sp.current}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: `${colors.primary} !important` }}>{sp.proposed}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: sp.delta === '\u2014' ? `${colors.textSecondary} !important` : `#059669 !important` }}>{sp.delta}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: `${sp.deltaCapital < 0 ? '#059669' : sp.deltaCapital > 0 ? '#d97706' : colors.textSecondary} !important` }}>{formatCurrency(sp.deltaCapital)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Capital Impact Summary */}
          <Grid item xs={12} md={5}>
            <Card sx={{ bgcolor: colors.paper, border: `1px solid ${colors.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: colors.text, mb: 1.5 }}>Capital Impact</Typography>
                <Stack spacing={1.5}>
                  {[
                    { label: 'Current SS Cost', value: formatCurrency(d.ssCostCurr), color: colors.text },
                    { label: 'Proposed SS Cost', value: formatCurrency(d.ssCostProp), color: colors.primary },
                    { label: 'Delta', value: `${d.ssCostProp - d.ssCostCurr > 0 ? '+' : ''}${formatCurrency(d.ssCostProp - d.ssCostCurr)}`, color: d.ssCostProp - d.ssCostCurr <= 0 ? '#059669' : '#d97706' },
                    { label: 'Annual Carrying Saved', value: annualCarryingSaved > 0 ? formatCurrency(annualCarryingSaved) : '\u2014', color: annualCarryingSaved > 0 ? '#059669' : colors.textSecondary },
                  ].map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: item.color }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  };

  // ---- Dark mode DataGrid overrides ----
  const darkGridSx = darkMode
    ? {
        '& .MuiDataGrid-columnHeaders': { backgroundColor: '#21262d !important', color: '#e6edf3 !important' },
        '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.06)' },
        '& .MuiDataGrid-row': { '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' } },
        '& .MuiDataGrid-footerContainer': { borderColor: 'rgba(255,255,255,0.06)' },
        '& .MuiTablePagination-root': { color: '#e6edf3' },
        '& .MuiDataGrid-toolbarContainer button': { color: '#8b949e' },
      }
    : {};

  // ---- List view (summary cards + DataGrid) ----
  const renderListView = () => (
    <>
      {/* Dual-lens summary cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Quantity Recommendations */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: colors.paper,
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: alpha(MODULE_COLOR, 0.1), display: 'flex' }}>
                <TuneIcon sx={{ fontSize: 20, color: MODULE_COLOR }} />
              </Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: colors.text }}>Quantity Recommendations</Typography>
            </Box>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>SKUs Analyzed</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: colors.text }}>{summaryKPIs.totalSKUs}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Net Reduction</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>{formatNumber(summaryKPIs.netReduction)} EA</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Additions</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706' }}>+{formatNumber(summaryKPIs.additions)} EA</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Financial Impact */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: colors.paper,
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: alpha('#10b981', 0.1), display: 'flex' }}>
                <AttachMoneyIcon sx={{ fontSize: 20, color: '#10b981' }} />
              </Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: colors.text }}>Financial Impact</Typography>
            </Box>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Capital Released</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>{formatCurrency(summaryKPIs.capitalReleased)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Capital Invested</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706' }}>{formatCurrency(summaryKPIs.capitalInvested)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Net Working Capital</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>{formatCurrency(summaryKPIs.netWC)}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* DataGrid */}
      <Paper elevation={0} sx={{ bgcolor: colors.paper, border: `1px solid ${colors.border}`, borderRadius: 2, mb: 2 }}>
        <Box sx={{ height: 520 }}>
            <DataGrid
              rows={MOCK_DATA}
              columns={columns}
              density="compact"
              disableRowSelectionOnClick
              onRowClick={(params) => handleDrillDown(params.id)}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } },
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 15 } },
                sorting: { sortModel: [{ field: 'deltaCapital', sort: 'asc' }] },
              }}
              pageSizeOptions={[10, 15, 25]}
              sx={{
                border: 'none',
                ...stoxTheme.getDataGridSx({ clickable: true }),
                '& .MuiDataGrid-row': {
                  cursor: 'pointer',
                  '&:hover': { bgcolor: alpha(MODULE_COLOR, 0.06) },
                },
                ...darkGridSx,
              }}
            />
        </Box>
      </Paper>
    </>
  );

  // ============================================
  // Render
  // ============================================
  const selectedData = selectedRow ? MOCK_DATA.find((r) => r.id === selectedRow) : null;

  return (
    <Box sx={{ p: 2, bgcolor: colors.background, minHeight: '100vh' }}>
      {/* Shared header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          bgcolor: colors.paper,
          border: `1px solid ${colors.border}`,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <IconButton onClick={selectedRow ? handleDrillBack : onBack} size="small" sx={{ bgcolor: alpha(MODULE_COLOR, 0.08), '&:hover': { bgcolor: alpha(MODULE_COLOR, 0.15) } }}>
          <ArrowBackIcon sx={{ fontSize: 20, color: MODULE_COLOR }} />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14, color: colors.textSecondary }} />} sx={{ mb: 0.5 }}>
            <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.7rem', color: colors.textSecondary, cursor: 'pointer' }}>Lam Research</Link>
            {selectedData ? [
              <Link key="tile" underline="hover" onClick={handleDrillBack} sx={{ fontSize: '0.7rem', color: colors.textSecondary, cursor: 'pointer' }}>Safety Stock Economics</Link>,
              <Typography key="detail" sx={{ fontSize: '0.7rem', color: MODULE_COLOR, fontWeight: 700 }}>{selectedData.material}</Typography>,
            ] : (
              <Typography sx={{ fontSize: '0.7rem', color: MODULE_COLOR, fontWeight: 700 }}>Safety Stock Economics</Typography>
            )}
          </Breadcrumbs>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: colors.text }}>
            {selectedData
              ? `${selectedData.plant} \u2014 Safety Stock Detail`
              : 'Safety Stock & Reorder Economics \u2014 Decision Engine'}
          </Typography>
        </Box>
        {!selectedRow && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.75rem',
              borderColor: alpha(MODULE_COLOR, 0.3),
              color: MODULE_COLOR,
              '&:hover': { borderColor: MODULE_COLOR, bgcolor: alpha(MODULE_COLOR, 0.05) },
            }}
          >
            Export
          </Button>
        )}
      </Paper>

      {selectedRow ? renderDetailView() : renderListView()}
    </Box>
  );
};

export default LamSafetyStockEconomics;
