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
  LinearProgress,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Shield as ShieldIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Inventory as InventoryIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { stoxTheme } from '../stoxTheme';
import { getColors, MODULE_COLOR } from '../../../config/brandColors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  PointElement,
  LineElement
);

// ============================================
// CONSTANTS
// ============================================
const CLASS_COLORS = {
  Strategic: MODULE_COLOR,
  Excess: '#f59e0b',
  Obsolescence: '#ef4444',
  'Below SS': '#06b6d4',
};

const CLASS_ICONS = {
  Strategic: VerifiedIcon,
  Excess: WarningIcon,
  Obsolescence: DeleteIcon,
  'Below SS': ShieldIcon,
};

// ============================================
// HELPERS
// ============================================
const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const formatNumber = (value) => value.toLocaleString();

// ============================================
// MOCK DATA — 15 Semiconductor Materials
// ============================================
const generateMockData = () => {
  const materials = [
    { id: 1, material: 'Silicon Carbide Wafer 150mm', plant: 'Fremont', class: 'Strategic', onHandEA: 24500, requiredEA: 22000, coverage: 112, capitalValue: 5800000, roic: 24.2 },
    { id: 2, material: 'Etch Gas Mixture CF4/O2', plant: 'Tualatin', class: 'Strategic', onHandEA: 18200, requiredEA: 16500, coverage: 88, capitalValue: 4200000, roic: 21.8 },
    { id: 3, material: 'CVD Precursor TEOS', plant: 'Fremont', class: 'Strategic', onHandEA: 15800, requiredEA: 14200, coverage: 76, capitalValue: 3600000, roic: 26.1 },
    { id: 4, material: 'Ceramic Shower Head Assembly', plant: 'Villach', class: 'Strategic', onHandEA: 8400, requiredEA: 7800, coverage: 68, capitalValue: 2800000, roic: 19.4 },
    { id: 5, material: 'RF Generator Module 13.56MHz', plant: 'Fremont', class: 'Strategic', onHandEA: 6200, requiredEA: 5500, coverage: 72, capitalValue: 2400000, roic: 22.7 },
    { id: 6, material: 'Electrostatic Chuck ESC-300', plant: 'Tualatin', class: 'Strategic', onHandEA: 4800, requiredEA: 4200, coverage: 65, capitalValue: 2100000, roic: 18.9 },
    { id: 7, material: 'Quartz Window IR-Transparent', plant: 'Villach', class: 'Strategic', onHandEA: 3520, requiredEA: 3000, coverage: 58, capitalValue: 1500000, roic: 27.5 },
    { id: 8, material: 'Tungsten Sputtering Target', plant: 'Fremont', class: 'Strategic', onHandEA: 2700, requiredEA: 2400, coverage: 62, capitalValue: 1700000, roic: 20.3 },
    { id: 9, material: 'Photoresist EUV Polymer', plant: 'Tualatin', class: 'Excess', onHandEA: 19400, requiredEA: 8200, coverage: 118, capitalValue: 4200000, roic: 11.2 },
    { id: 10, material: 'CMP Slurry Colloidal Silica', plant: 'Fremont', class: 'Excess', onHandEA: 12800, requiredEA: 6400, coverage: 96, capitalValue: 3400000, roic: 9.8 },
    { id: 11, material: 'Plasma Confinement Ring', plant: 'Villach', class: 'Excess', onHandEA: 5600, requiredEA: 2800, coverage: 82, capitalValue: 2200000, roic: 12.6 },
    { id: 12, material: 'Edge Ring Silicon 300mm', plant: 'Tualatin', class: 'Excess', onHandEA: 4380, requiredEA: 2100, coverage: 74, capitalValue: 2000000, roic: 8.4 },
    { id: 13, material: 'Vacuum Pump Dry Scroll', plant: 'Fremont', class: 'Obsolescence', onHandEA: 8200, requiredEA: 1200, coverage: 24, capitalValue: 1800000, roic: 0 },
    { id: 14, material: 'Legacy Controller PCB v2.1', plant: 'Villach', class: 'Obsolescence', onHandEA: 6820, requiredEA: 800, coverage: 20, capitalValue: 1400000, roic: 0 },
    { id: 15, material: 'MFC Thermal Sensor Module', plant: 'Tualatin', class: 'Below SS', onHandEA: 6420, requiredEA: 9800, coverage: 28, capitalValue: 3400000, roic: 15.6 },
  ];

  return materials.map((m) => {
    const excessEA = Math.max(0, m.onHandEA - m.requiredEA);
    const excessRatio = m.onHandEA > 0 ? excessEA / m.onHandEA : 0;
    const excessCapital = Math.round(m.capitalValue * excessRatio);
    const carryRate = 0.22;
    const carryPerYear = Math.round(m.capitalValue * carryRate);
    return {
      ...m,
      excessEA,
      excessCapital,
      carryPerYear,
      aging030: Math.round(m.onHandEA * (0.35 + Math.random() * 0.15)),
      aging3160: Math.round(m.onHandEA * (0.2 + Math.random() * 0.1)),
      aging6190: Math.round(m.onHandEA * (0.1 + Math.random() * 0.1)),
      aging90plus: 0, // computed below
      bookValue: m.capitalValue,
      marketValue: Math.round(m.capitalValue * (0.6 + Math.random() * 0.35)),
    };
  }).map((m) => ({
    ...m,
    aging90plus: Math.max(0, m.onHandEA - m.aging030 - m.aging3160 - m.aging6190),
    writeDownRisk: Math.max(0, m.bookValue - m.marketValue),
  }));
};

const MOCK_DATA = generateMockData();

// ============================================
// SUMMARY COMPUTATIONS
// ============================================
const TOTAL_ON_HAND = MOCK_DATA.reduce((s, r) => s + r.onHandEA, 0);
const TOTAL_CAPITAL = MOCK_DATA.reduce((s, r) => s + r.capitalValue, 0);
const TOTAL_CARRY = MOCK_DATA.reduce((s, r) => s + r.carryPerYear, 0);

const classSummary = (cls) => {
  const rows = MOCK_DATA.filter((r) => r.class === cls);
  const ea = rows.reduce((s, r) => s + r.onHandEA, 0);
  const cap = rows.reduce((s, r) => s + r.capitalValue, 0);
  return { ea, cap, pctQty: ((ea / TOTAL_ON_HAND) * 100).toFixed(0), pctCap: ((cap / TOTAL_CAPITAL) * 100).toFixed(0) };
};

const STRATEGIC = classSummary('Strategic');
const EXCESS = classSummary('Excess');
const OBSOLESCENCE = classSummary('Obsolescence');
const BELOW_SS = classSummary('Below SS');

// ============================================
// COMPONENT
// ============================================
export default function LamInventoryCapitalHealth({ onBack, darkMode = false }) {
  const colors = getColors(darkMode);
  const [selectedRow, setSelectedRow] = useState(null);

  // ----- Dark mode colors -----
  const bgColor = darkMode ? '#0d1117' : colors.background;
  const paperBg = darkMode ? '#161b22' : '#ffffff';
  const cardBg = darkMode ? '#21262d' : '#ffffff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  // ======== DECOMPOSITION CARDS ========
  const decompositionCards = [
    { label: 'Strategic', icon: VerifiedIcon, color: MODULE_COLOR, ea: STRATEGIC.ea, cap: STRATEGIC.cap, pct: STRATEGIC.pctQty },
    { label: 'Excess', icon: WarningIcon, color: '#f59e0b', ea: EXCESS.ea, cap: EXCESS.cap, pct: EXCESS.pctQty },
    { label: 'Obsolescence Risk', icon: DeleteIcon, color: '#ef4444', ea: OBSOLESCENCE.ea, cap: OBSOLESCENCE.cap, pct: OBSOLESCENCE.pctQty },
    { label: 'Below Safety Stock', icon: ShieldIcon, color: '#06b6d4', ea: BELOW_SS.ea, cap: BELOW_SS.cap, pct: BELOW_SS.pctQty },
  ];

  // ======== DOUGHNUT DATA ========
  const doughnutColors = [MODULE_COLOR, '#f59e0b', '#ef4444', '#06b6d4'];
  const doughnutLabels = ['Strategic', 'Excess', 'Obsolescence', 'Below SS'];

  const qtyDoughnutData = useMemo(() => ({
    labels: doughnutLabels,
    datasets: [{
      data: [Number(STRATEGIC.pctQty), Number(EXCESS.pctQty), Number(OBSOLESCENCE.pctQty), Number(BELOW_SS.pctQty)],
      backgroundColor: doughnutColors,
      borderColor: darkMode ? '#161b22' : '#ffffff',
      borderWidth: 2,
    }],
  }), [darkMode]);

  const capDoughnutData = useMemo(() => ({
    labels: doughnutLabels,
    datasets: [{
      data: [Number(STRATEGIC.pctCap), Number(EXCESS.pctCap), Number(OBSOLESCENCE.pctCap), Number(BELOW_SS.pctCap)],
      backgroundColor: doughnutColors,
      borderColor: darkMode ? '#161b22' : '#ffffff',
      borderWidth: 2,
    }],
  }), [darkMode]);

  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#e6edf3' : '#1e293b',
          font: { size: 11, weight: 600 },
          padding: 12,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  }), [darkMode]);

  // ======== DETAIL PANEL BAR CHART ========
  const agingBarData = useMemo(() => {
    if (!selectedRow) return null;
    return {
      labels: ['0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'],
      datasets: [{
        label: 'Quantity (EA)',
        data: [selectedRow.aging030, selectedRow.aging3160, selectedRow.aging6190, selectedRow.aging90plus],
        backgroundColor: [MODULE_COLOR, '#f59e0b', '#ef4444', '#991b1b'],
        borderRadius: 4,
        barPercentage: 0.6,
      }],
    };
  }, [selectedRow]);

  const agingBarOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${formatNumber(ctx.parsed.y)} EA`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: darkMode ? '#8b949e' : '#64748b', font: { size: 10 } },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: darkMode ? '#8b949e' : '#64748b',
          font: { size: 10 },
          callback: (v) => formatNumber(v),
        },
        grid: { color: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
      },
    },
  }), [darkMode]);

  // ======== DATA GRID COLUMNS ========
  const columns = [
    {
      field: 'material',
      headerName: 'Material',
      flex: 1.2,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: textColor }}>{params.value}</Typography>
      ),
    },
    {
      field: 'plant',
      headerName: 'Plant',
      width: 80,
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: alpha(MODULE_COLOR, 0.1), color: colors.primary }} />
      ),
    },
    {
      field: 'class',
      headerName: 'Class',
      width: 100,
      renderCell: (params) => {
        const colorMap = {
          Strategic: { bg: alpha('#10b981', 0.12), color: '#059669' },
          Excess: { bg: alpha('#f59e0b', 0.12), color: '#d97706' },
          Obsolescence: { bg: alpha('#ef4444', 0.12), color: '#dc2626' },
          'Below SS': { bg: alpha('#06b6d4', 0.12), color: '#0891b2' },
        };
        const style = colorMap[params.value] || colorMap.Strategic;
        return <Chip label={params.value} size="small" sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: style.bg, color: style.color }} />;
      },
    },
    {
      field: 'onHandEA',
      headerName: 'On-Hand',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: textColor }}>{formatNumber(params.value)}</Typography>
      ),
    },
    {
      field: 'requiredEA',
      headerName: 'Required',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: textColor }}>{formatNumber(params.value)}</Typography>
      ),
    },
    {
      field: 'excessEA',
      headerName: 'Excess',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: params.value > 0 ? 600 : 400, color: params.value > 0 ? '#ef4444' : textSecondary }}>
          {formatNumber(params.value)}
        </Typography>
      ),
    },
    {
      field: 'coverage',
      headerName: 'Coverage',
      width: 100,
      renderCell: (params) => {
        const days = params.value;
        const progressColor = days >= 60 ? '#10b981' : days >= 30 ? '#f59e0b' : '#ef4444';
        const pct = Math.min(100, (days / 120) * 100);
        return (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(progressColor, 0.15),
                '& .MuiLinearProgress-bar': { bgcolor: progressColor, borderRadius: 3 },
              }}
            />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: progressColor, minWidth: 28, textAlign: 'right' }}>
              {days}d
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'capitalValue',
      headerName: 'Capital',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textColor }}>{formatCurrency(params.value)}</Typography>
      ),
    },
    {
      field: 'excessCapital',
      headerName: 'Excess $',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: params.value > 0 ? '#ef4444' : textSecondary }}>{formatCurrency(params.value)}</Typography>
      ),
    },
    {
      field: 'roic',
      headerName: 'ROIC',
      width: 80,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: params.value >= 15 ? '#059669' : params.value > 0 ? '#d97706' : '#dc2626' }}>
          {params.value > 0 ? `${params.value}%` : '--'}
        </Typography>
      ),
    },
    {
      field: 'carryPerYear',
      headerName: 'Carry/Yr',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{formatCurrency(params.value)}</Typography>
      ),
    },
  ];

  // ======== DATAGRID SX ========
  const dataGridSx = {
    ...stoxTheme.getDataGridSx({ clickable: true }),
    border: `1px solid ${borderColor}`,
    bgcolor: paperBg,
    '& .MuiDataGrid-columnHeaders': {
      ...stoxTheme.getDataGridSx({ clickable: true })['& .MuiDataGrid-columnHeaders'],
      bgcolor: darkMode ? '#21262d' : '#f8fafc',
      color: textColor,
    },
    '& .MuiDataGrid-cell': {
      fontSize: '0.8rem',
      borderBottom: `1px solid ${borderColor}`,
    },
    '& .MuiDataGrid-footerContainer': {
      borderTop: `1px solid ${borderColor}`,
      bgcolor: darkMode ? '#21262d' : '#f8fafc',
    },
    '& .MuiTablePagination-root': {
      color: textSecondary,
    },
  };

  // ======== RENDER: LIST VIEW ========
  const renderListView = () => (
    <>
      {/* ---- DUAL-LENS SUMMARY ---- */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {/* Quantity Position */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: paperBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <InventoryIcon sx={{ color: MODULE_COLOR, fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: textColor }}>Quantity Position</Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography sx={{ fontSize: '0.7rem', color: textSecondary, mb: 0.3 }}>Total On-Hand</Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: MODULE_COLOR }}>{formatNumber(TOTAL_ON_HAND)} EA</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography sx={{ fontSize: '0.7rem', color: textSecondary, mb: 0.3 }}>Inventory Turns</Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: textColor }}>5.4&times;</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography sx={{ fontSize: '0.7rem', color: textSecondary, mb: 0.3 }}>Days Coverage</Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: textColor }}>68 days</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Capital Position */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: paperBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <AccountBalanceIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: textColor }}>Capital Position</Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography sx={{ fontSize: '0.7rem', color: textSecondary, mb: 0.3 }}>Total Value</Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(TOTAL_CAPITAL)}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography sx={{ fontSize: '0.7rem', color: textSecondary, mb: 0.3 }}>Carrying Cost/Yr</Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: textColor }}>{formatCurrency(TOTAL_CARRY)}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography sx={{ fontSize: '0.7rem', color: textSecondary, mb: 0.3 }}>ROIC</Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>18.2%</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* ---- 4 DECOMPOSITION CARDS ---- */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {decompositionCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid item xs={6} md={3} key={card.label}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 1 }}>
                    <Icon sx={{ color: card.color, fontSize: 18 }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: textSecondary }}>{card.label}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: textColor }}>
                    {formatNumber(card.ea)} EA
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: card.color }}>
                    {formatCurrency(card.cap)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: textSecondary, mt: 0.5 }}>
                    {card.pct}% of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ---- DOUGHNUT CHARTS ---- */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: paperBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 2,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: textColor, mb: 1.5, textAlign: 'center' }}>
              Quantity Distribution
            </Typography>
            <Box sx={{ height: 240, display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={qtyDoughnutData} options={doughnutOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: paperBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 2,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: textColor, mb: 1.5, textAlign: 'center' }}>
              Capital Distribution
            </Typography>
            <Box sx={{ height: 240, display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={capDoughnutData} options={doughnutOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ---- DATA GRID ---- */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: paperBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
          mb: 2.5,
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: `1px solid ${borderColor}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: textColor }}>
            Material Inventory Detail
          </Typography>
        </Box>
        <Box sx={{ height: 520 }}>
          <DataGrid
            rows={MOCK_DATA}
            columns={columns}
            density="compact"
            disableRowSelectionOnClick
            onRowClick={(params) => setSelectedRow(params.row)}
            initialState={{
              pagination: { paginationModel: { pageSize: 15 } },
              sorting: { sortModel: [{ field: 'capitalValue', sort: 'desc' }] },
            }}
            pageSizeOptions={[10, 15, 25]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 300 },
                sx: {
                  p: 1,
                  '& .MuiButton-root': { color: textSecondary, fontSize: '0.75rem' },
                  '& .MuiInputBase-root': { color: textColor, fontSize: '0.8rem' },
                },
              },
            }}
            sx={dataGridSx}
          />
        </Box>
      </Paper>
    </>
  );

  // ======== RENDER: DETAIL VIEW ========
  const renderDetailView = () => (
    <Box>
      <Grid container spacing={2.5}>
        {/* Material Info Card */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              bgcolor: darkMode ? alpha(MODULE_COLOR, 0.08) : alpha(MODULE_COLOR, 0.04),
              border: `1px solid ${alpha(MODULE_COLOR, 0.15)}`,
              borderRadius: 2,
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: textColor, mb: 1.5 }}>Material Info</Typography>
              {[
                { label: 'Material', value: selectedRow.material },
                { label: 'Plant', value: selectedRow.plant },
                { label: 'Class', value: selectedRow.class },
                { label: 'On-Hand', value: `${formatNumber(selectedRow.onHandEA)} EA` },
                { label: 'Required', value: `${formatNumber(selectedRow.requiredEA)} EA` },
                { label: 'Excess', value: `${formatNumber(selectedRow.excessEA)} EA` },
                { label: 'Coverage', value: `${selectedRow.coverage} days` },
              ].map((item) => (
                <Stack key={item.label} direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: textColor }}>{item.value}</Typography>
                </Stack>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Aging Analysis Bar Chart */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 2,
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: textColor, mb: 1 }}>Aging Analysis</Typography>
              <Box sx={{ height: 200 }}>
                {agingBarData && <Bar data={agingBarData} options={agingBarOptions} />}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Summary */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 2,
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: textColor, mb: 1.5 }}>Financial Summary</Typography>
              {[
                { label: 'Book Value', value: formatCurrency(selectedRow.bookValue), color: textColor },
                { label: 'Market Value', value: formatCurrency(selectedRow.marketValue), color: '#059669' },
                { label: 'Write-Down Risk', value: formatCurrency(selectedRow.writeDownRisk), color: selectedRow.writeDownRisk > 0 ? '#ef4444' : '#059669' },
                { label: 'Capital Deployed', value: formatCurrency(selectedRow.capitalValue), color: textColor },
                { label: 'Excess Capital', value: formatCurrency(selectedRow.excessCapital), color: selectedRow.excessCapital > 0 ? '#ef4444' : textSecondary },
                { label: 'Carrying Cost/Yr', value: formatCurrency(selectedRow.carryPerYear), color: '#d97706' },
                { label: 'ROIC', value: selectedRow.roic > 0 ? `${selectedRow.roic}%` : '--', color: selectedRow.roic >= 15 ? '#059669' : selectedRow.roic > 0 ? '#d97706' : '#dc2626' },
              ].map((item) => (
                <Stack key={item.label} direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: item.color }}>{item.value}</Typography>
                </Stack>
              ))}
              <Divider sx={{ my: 1, borderColor: borderColor }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: textSecondary }}>Net Position</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: selectedRow.marketValue >= selectedRow.bookValue ? '#059669' : '#ef4444' }}>
                  {selectedRow.marketValue >= selectedRow.bookValue ? '+' : '-'}{formatCurrency(Math.abs(selectedRow.marketValue - selectedRow.bookValue))}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // ======== MAIN RENDER ========
  return (
    <Box sx={{ bgcolor: bgColor, minHeight: '100vh', p: 2.5 }}>
      {/* ---- HEADER ---- */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          bgcolor: paperBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={selectedRow ? () => setSelectedRow(null) : onBack}
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              color: colors.primary,
              '&:hover': { bgcolor: alpha(MODULE_COLOR, 0.08) },
            }}
          >
            Back
          </Button>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ '& .MuiBreadcrumb-separator': { color: textSecondary } }}>
            <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.75rem', color: textSecondary, cursor: 'pointer' }}>CORE.AI</Link>
            <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.75rem', color: textSecondary, cursor: 'pointer' }}>STOX.AI</Link>
            <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.75rem', color: textSecondary, cursor: 'pointer' }}>Lam Research</Link>
            {selectedRow ? (
              <>
                <Link underline="hover" onClick={() => setSelectedRow(null)} sx={{ fontSize: '0.75rem', color: textSecondary, cursor: 'pointer' }}>Inventory Capital Health</Link>
                <Typography sx={{ fontSize: '0.75rem', color: colors.primary, fontWeight: 600 }}>{selectedRow.material} Detail</Typography>
              </>
            ) : (
              <Typography sx={{ fontSize: '0.75rem', color: colors.primary, fontWeight: 600 }}>Inventory Capital Health</Typography>
            )}
          </Breadcrumbs>
        </Stack>
        <Typography variant="h6" sx={{ fontWeight: 700, color: textColor, fontSize: '1.1rem' }}>
          {selectedRow ? `${selectedRow.material} \u2014 Detail View` : 'Inventory Capital Health \u2014 Balance Sheet Lens'}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: textSecondary, mt: 0.3 }}>
          {selectedRow
            ? `Detailed inventory position, aging analysis, and financial metrics for ${selectedRow.material}`
            : 'Comprehensive view of inventory positions, capital deployment, and return metrics for semiconductor manufacturing'}
        </Typography>
      </Paper>

      {selectedRow ? renderDetailView() : renderListView()}
    </Box>
  );
}
