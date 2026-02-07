import React, { useState, useMemo } from 'react';
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
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  Collapse,
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  VerifiedUser as TrustIcon,
  CheckCircle as DecisionIcon,
  Warning as ReviewIcon,
  Block as ExcludedIcon,
  TrendingUp,
  TrendingDown,
  Inventory as VolumeIcon,
  Info as InfoIcon,
  Timeline as DriftIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import stoxTheme from '../stoxTheme';
import { getColors, MODULE_COLOR } from '../../../config/brandColors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// ============================================
// Formatting helpers
// ============================================
const formatCurrency = (value) => {
  if (value == null) return '-';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
// Mock Data - 15 Semiconductor SKUs
// ============================================
const PLANTS = ['P1000', 'P2000', 'P3000', 'P4000'];

const generateMockData = () => {
  const materials = [
    { name: 'RF Generator Module', plant: 'P1000', trustScore: 96.3, grade: 'A', onHandEA: 128, stdCost: 24500.00, actualCost: 24890.50, bookValue: 3136000, trueValue: 3185984, demand: 45, uom: 'EA' },
    { name: 'Wafer Chamber Liner', plant: 'P2000', trustScore: 91.7, grade: 'A', onHandEA: 342, stdCost: 3800.00, actualCost: 3920.40, bookValue: 1299600, trueValue: 1340777, demand: 120, uom: 'EA' },
    { name: 'ESC (Electrostatic Chuck)', plant: 'P1000', trustScore: 88.4, grade: 'A', onHandEA: 67, stdCost: 18200.00, actualCost: 18750.00, bookValue: 1219400, trueValue: 1256250, demand: 28, uom: 'EA' },
    { name: 'Etch Gas Manifold', plant: 'P3000', trustScore: 82.1, grade: 'B', onHandEA: 215, stdCost: 5600.00, actualCost: 6180.00, bookValue: 1204000, trueValue: 1328700, demand: 88, uom: 'EA' },
    { name: 'Plasma Source Assembly', plant: 'P1000', trustScore: 79.5, grade: 'B', onHandEA: 43, stdCost: 32100.00, actualCost: 35400.00, bookValue: 1380300, trueValue: 1522200, demand: 18, uom: 'EA' },
    { name: 'CVD Showerhead', plant: 'P2000', trustScore: 93.8, grade: 'A', onHandEA: 189, stdCost: 7400.00, actualCost: 7280.00, bookValue: 1398600, trueValue: 1375920, demand: 72, uom: 'EA' },
    { name: 'Process Kit', plant: 'P4000', trustScore: 71.2, grade: 'B', onHandEA: 520, stdCost: 2100.00, actualCost: 2480.00, bookValue: 1092000, trueValue: 1289600, demand: 210, uom: 'EA' },
    { name: 'Matching Network', plant: 'P1000', trustScore: 85.6, grade: 'A', onHandEA: 95, stdCost: 14800.00, actualCost: 15200.00, bookValue: 1406000, trueValue: 1444000, demand: 38, uom: 'EA' },
    { name: 'Quartz Window', plant: 'P3000', trustScore: 64.3, grade: 'C', onHandEA: 410, stdCost: 1250.00, actualCost: 1580.00, bookValue: 512500, trueValue: 647800, demand: 165, uom: 'EA' },
    { name: 'Turbomolecular Pump', plant: 'P2000', trustScore: 90.1, grade: 'A', onHandEA: 56, stdCost: 28900.00, actualCost: 29400.00, bookValue: 1618400, trueValue: 1646400, demand: 22, uom: 'EA' },
    { name: 'Gas Panel Assembly', plant: 'P4000', trustScore: 76.8, grade: 'B', onHandEA: 138, stdCost: 9200.00, actualCost: 10100.00, bookValue: 1269600, trueValue: 1393800, demand: 52, uom: 'EA' },
    { name: 'Endpoint Detector', plant: 'P3000', trustScore: 87.9, grade: 'A', onHandEA: 82, stdCost: 11600.00, actualCost: 11850.00, bookValue: 951200, trueValue: 971700, demand: 34, uom: 'EA' },
    { name: 'Robot Arm Assembly', plant: 'P1000', trustScore: 58.4, grade: 'C', onHandEA: 31, stdCost: 42000.00, actualCost: 49800.00, bookValue: 1302000, trueValue: 1543800, demand: 12, uom: 'EA' },
    { name: 'Load Lock Assembly', plant: 'P2000', trustScore: 74.1, grade: 'B', onHandEA: 48, stdCost: 19500.00, actualCost: 22100.00, bookValue: 936000, trueValue: 1060800, demand: 15, uom: 'EA' },
    { name: 'Throttle Valve', plant: 'P4000', trustScore: 92.5, grade: 'A', onHandEA: 276, stdCost: 4300.00, actualCost: 4180.00, bookValue: 1186800, trueValue: 1153680, demand: 95, uom: 'EA' },
  ];

  return materials.map((m, idx) => {
    const driftPct = ((m.actualCost - m.stdCost) / m.stdCost) * 100;
    return {
      id: idx + 1,
      material: m.name,
      plant: m.plant,
      trustScore: m.trustScore,
      grade: m.grade,
      onHandEA: m.onHandEA,
      stdCost: m.stdCost,
      actualCost: m.actualCost,
      bookValue: m.bookValue,
      trueValue: m.trueValue,
      driftPct: parseFloat(driftPct.toFixed(1)),
      demand: m.demand,
      uom: m.uom,
    };
  });
};

const MOCK_DATA = generateMockData();

// Monthly cost trend data generator
const generateCostTrend = (stdCost, actualCost) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const stdTrend = months.map((_, i) => {
    const variation = stdCost * (0.97 + Math.random() * 0.06);
    return parseFloat(variation.toFixed(2));
  });
  const actualTrend = months.map((_, i) => {
    const base = stdTrend[i];
    const drift = base * (0.95 + Math.random() * 0.15);
    return parseFloat(drift.toFixed(2));
  });
  // Set the last month to the current values
  stdTrend[11] = stdCost;
  actualTrend[11] = actualCost;
  return { months, stdTrend, actualTrend };
};

// ============================================
// Component
// ============================================
const LamEconomicGroundTruth = ({ onBack, darkMode = false }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [unitCostOpen, setUnitCostOpen] = useState(true);
  const [marginOpen, setMarginOpen] = useState(true);
  const [trendOpen, setTrendOpen] = useState(true);
  const colors = getColors(darkMode);

  // KPI calculations
  const kpis = useMemo(() => {
    const totalItems = MOCK_DATA.length;
    const avgTrust = MOCK_DATA.reduce((sum, r) => sum + r.trustScore, 0) / totalItems;
    const decisionGrade = MOCK_DATA.filter((r) => r.grade === 'A').length;
    const reviewRequired = MOCK_DATA.filter((r) => r.grade === 'B').length;
    const excluded = MOCK_DATA.filter((r) => r.grade === 'C').length;
    const driftEvents = MOCK_DATA.filter((r) => Math.abs(r.driftPct) > 5).length;
    const totalVolume = MOCK_DATA.reduce((sum, r) => sum + r.onHandEA, 0);
    return {
      trustScore: avgTrust,
      decisionGrade: 1642,
      reviewRequired: 438,
      excluded: 206,
      driftEvents: 89,
      totalVolume: 583200,
    };
  }, []);

  // KPI card definitions
  const kpiCards = [
    { label: 'Trust Score', value: `${kpis.trustScore.toFixed(1)}%`, color: '#10b981', icon: <TrustIcon sx={{ fontSize: 20 }} /> },
    { label: 'Decision-Grade Items', value: formatNumber(kpis.decisionGrade), color: MODULE_COLOR, icon: <DecisionIcon sx={{ fontSize: 20 }} /> },
    { label: 'Review Required', value: formatNumber(kpis.reviewRequired), color: '#f59e0b', icon: <ReviewIcon sx={{ fontSize: 20 }} /> },
    { label: 'Excluded Items', value: formatNumber(kpis.excluded), color: '#ef4444', icon: <ExcludedIcon sx={{ fontSize: 20 }} /> },
    { label: 'Cost Drift Events', value: formatNumber(kpis.driftEvents), color: '#06b6d4', icon: <DriftIcon sx={{ fontSize: 20 }} /> },
    { label: 'Total Volume', value: `${formatNumber(kpis.totalVolume)} EA`, color: MODULE_COLOR, icon: <VolumeIcon sx={{ fontSize: 20 }} /> },
  ];

  // Grade chip color
  const getGradeChip = (grade) => {
    const map = {
      A: { bg: alpha('#10b981', 0.12), color: '#059669', border: alpha('#059669', 0.3) },
      B: { bg: alpha('#f59e0b', 0.12), color: '#d97706', border: alpha('#d97706', 0.3) },
      C: { bg: alpha('#ef4444', 0.12), color: '#dc2626', border: alpha('#dc2626', 0.3) },
    };
    const style = map[grade] || map.C;
    return (
      <Chip
        label={grade}
        size="small"
        sx={{
          bgcolor: style.bg,
          color: style.color,
          border: `1px solid ${style.border}`,
          fontWeight: 700,
          fontSize: '0.75rem',
          height: 24,
        }}
      />
    );
  };

  // Trust score progress color
  const getTrustColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  // Drift color
  const getDriftColor = (drift) => {
    const abs = Math.abs(drift);
    if (abs < 5) return '#10b981';
    if (abs < 15) return '#f59e0b';
    return '#ef4444';
  };

  // DataGrid columns
  const columns = [
    {
      field: 'material',
      headerName: 'Material',
      flex: 1.2,
      renderCell: (params) => (
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.8rem',
            color: darkMode ? '#4d9eff' : MODULE_COLOR,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'plant',
      headerName: 'Plant',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: alpha(MODULE_COLOR, 0.1),
            color: darkMode ? '#4d9eff' : MODULE_COLOR,
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 22,
            border: `1px solid ${alpha(MODULE_COLOR, 0.2)}`,
          }}
        />
      ),
    },
    {
      field: 'trustScore',
      headerName: 'Trust Score',
      width: 100,
      renderCell: (params) => {
        const trustColor = getTrustColor(params.value);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={params.value}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(trustColor, 0.15),
                '& .MuiLinearProgress-bar': {
                  bgcolor: trustColor,
                  borderRadius: 3,
                },
              }}
            />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: trustColor, minWidth: 32 }}>
              {params.value}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'grade',
      headerName: 'Grade',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => getGradeChip(params.value),
    },
    {
      field: 'onHandEA',
      headerName: 'On Hand (EA)',
      width: 100,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>
          {formatNumber(params.value)}
        </Typography>
      ),
    },
    {
      field: 'stdCost',
      headerName: 'Std Cost',
      width: 100,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'actualCost',
      headerName: 'Actual Cost',
      width: 100,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'bookValue',
      headerName: 'Book Value',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'trueValue',
      headerName: 'True Value',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'driftPct',
      headerName: 'Drift %',
      width: 90,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const driftColor = getDriftColor(params.value);
        const isPositive = params.value > 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            {isPositive ? (
              <TrendingUp sx={{ fontSize: 14, color: driftColor }} />
            ) : (
              <TrendingDown sx={{ fontSize: 14, color: driftColor }} />
            )}
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: driftColor }}>
              {isPositive ? '+' : ''}{params.value}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'demand',
      headerName: 'Demand',
      width: 90,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>
          {formatNumber(params.value)}
        </Typography>
      ),
    },
    {
      field: 'uom',
      headerName: 'UoM',
      width: 60,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>
          {params.value}
        </Typography>
      ),
    },
  ];

  // DataGrid dark mode overrides
  const darkGridOverrides = darkMode
    ? {
        bgcolor: colors.paper,
        border: `1px solid ${colors.border}`,
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: '#21262d',
          color: '#e6edf3',
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          color: '#e6edf3',
        },
        '& .MuiDataGrid-cell': {
          color: '#c9d1d9',
          borderColor: colors.border,
        },
        '& .MuiDataGrid-row': {
          '&:hover': {
            bgcolor: alpha('#4d9eff', 0.08),
          },
        },
        '& .MuiDataGrid-footerContainer': {
          borderTop: `1px solid ${colors.border}`,
          color: '#c9d1d9',
        },
        '& .MuiTablePagination-root': {
          color: '#c9d1d9',
        },
        '& .MuiDataGrid-toolbarContainer': {
          color: '#c9d1d9',
          '& .MuiButton-root': {
            color: '#8b949e',
          },
        },
      }
    : {};

  const dataGridSx = {
    ...stoxTheme.getDataGridSx({ clickable: true }),
    ...darkGridOverrides,
  };

  // Selected row detail data
  const selectedData = selectedRow ? MOCK_DATA.find((r) => r.id === selectedRow) : null;
  const costTrend = selectedData ? generateCostTrend(selectedData.stdCost, selectedData.actualCost) : null;

  // Chart config for detail panel
  const chartData = costTrend
    ? {
        labels: costTrend.months,
        datasets: [
          {
            label: 'Std Cost',
            data: costTrend.stdTrend,
            borderColor: MODULE_COLOR,
            backgroundColor: alpha(MODULE_COLOR, 0.1),
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: MODULE_COLOR,
            borderWidth: 2,
          },
          {
            label: 'Actual Cost',
            data: costTrend.actualTrend,
            borderColor: '#ff751f',
            backgroundColor: alpha('#ff751f', 0.1),
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#ff751f',
            borderWidth: 2,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.text,
          font: { size: 11, weight: 600 },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#21262d' : '#ffffff',
        titleColor: colors.text,
        bodyColor: colors.text,
        borderColor: colors.border,
        borderWidth: 1,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: alpha(colors.text, 0.06) },
        ticks: { color: colors.textSecondary, font: { size: 10 } },
      },
      y: {
        grid: { color: alpha(colors.text, 0.06) },
        ticks: {
          color: colors.textSecondary,
          font: { size: 10 },
          callback: (v) => formatCurrency(v),
        },
      },
    },
  };

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', p: 2 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          bgcolor: colors.paper,
          border: `1px solid ${colors.border}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Go back">
              <IconButton
                onClick={onBack}
                size="small"
                sx={{
                  bgcolor: alpha(MODULE_COLOR, 0.08),
                  color: darkMode ? '#4d9eff' : MODULE_COLOR,
                  '&:hover': { bgcolor: alpha(MODULE_COLOR, 0.15) },
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Box>
              <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 0.5 }}>
                <Link
                  underline="hover"
                  onClick={onBack}
                  sx={{ fontSize: '0.75rem', color: colors.textSecondary, cursor: 'pointer' }}
                >
                  CORE.AI
                </Link>
                <Link
                  underline="hover"
                  onClick={onBack}
                  sx={{ fontSize: '0.75rem', color: colors.textSecondary, cursor: 'pointer' }}
                >
                  STOX.AI
                </Link>
                <Link
                  underline="hover"
                  onClick={onBack}
                  sx={{ fontSize: '0.75rem', color: colors.textSecondary, cursor: 'pointer' }}
                >
                  Lam Research
                </Link>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: darkMode ? '#4d9eff' : MODULE_COLOR }}>
                  Economic Ground Truth
                </Typography>
              </Breadcrumbs>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: colors.text,
                }}
              >
                Economic Ground Truth
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Banner */}
      <Alert
        severity="info"
        icon={<InfoIcon sx={{ color: darkMode ? '#4d9eff' : MODULE_COLOR }} />}
        sx={{
          mb: 2,
          bgcolor: darkMode ? alpha('#4d9eff', 0.08) : alpha(MODULE_COLOR, 0.06),
          color: colors.text,
          border: `1px solid ${darkMode ? alpha('#4d9eff', 0.2) : alpha(MODULE_COLOR, 0.15)}`,
          borderRadius: 2,
          '& .MuiAlert-message': { fontSize: '0.82rem' },
        }}
      >
        Before optimizing — costs must be economically interpretable. This layer validates unit costs,
        flags drift, and classifies every SKU for decision-grade trust.
      </Alert>

      {/* KPI Cards */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {kpiCards.map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={2} key={idx}>
            <Card
              elevation={0}
              sx={{
                borderLeft: `4px solid ${kpi.color}`,
                borderRadius: 2,
                bgcolor: darkMode ? '#21262d' : '#ffffff',
                border: `1px solid ${colors.border}`,
                borderLeftColor: kpi.color,
                borderLeftWidth: 4,
                borderLeftStyle: 'solid',
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(kpi.color, 0.12),
                      color: kpi.color,
                    }}
                  >
                    {kpi.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {kpi.label}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: colors.text,
                    lineHeight: 1.2,
                    ml: 0.5,
                  }}
                >
                  {kpi.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DataGrid + Detail Panel */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={selectedData ? 7 : 12}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: colors.paper,
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 1.5, borderBottom: `1px solid ${colors.border}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: colors.text }}>
                SKU Economic Classification
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                Click a row to view detailed cost analysis
              </Typography>
            </Box>
            <Box sx={{ height: 520 }}>
              <DataGrid
                rows={MOCK_DATA}
                columns={columns}
                density="compact"
                disableRowSelectionOnClick
                onRowClick={(params) => setSelectedRow(params.id)}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 300 },
                  },
                }}
                initialState={{
                  pagination: { paginationModel: { pageSize: 15 } },
                }}
                pageSizeOptions={[10, 15, 25]}
                sx={{
                  ...dataGridSx,
                  '& .MuiDataGrid-row': {
                    ...dataGridSx['& .MuiDataGrid-row'],
                    '&.Mui-selected': {
                      bgcolor: darkMode ? alpha('#4d9eff', 0.12) : alpha(MODULE_COLOR, 0.08),
                      '&:hover': {
                        bgcolor: darkMode ? alpha('#4d9eff', 0.16) : alpha(MODULE_COLOR, 0.12),
                      },
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Detail Panel */}
        {selectedData && (
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: colors.paper,
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Detail Header */}
              <Box
                sx={{
                  p: 1.5,
                  borderBottom: `1px solid ${colors.border}`,
                  bgcolor: darkMode ? '#21262d' : alpha(MODULE_COLOR, 0.04),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: colors.text }}>
                    {selectedData.material}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getGradeChip(selectedData.grade)}
                    <IconButton size="small" onClick={() => setSelectedRow(null)} sx={{ color: colors.textSecondary }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={selectedData.plant}
                    size="small"
                    sx={{
                      bgcolor: alpha(MODULE_COLOR, 0.1),
                      color: darkMode ? '#4d9eff' : MODULE_COLOR,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 20,
                    }}
                  />
                  <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                    Trust: {selectedData.trustScore}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 1.5 }}>
                {/* Unit Cost Analysis — collapsible */}
                <Card
                  elevation={0}
                  sx={{
                    mb: 1.5,
                    bgcolor: darkMode ? '#161b22' : alpha(MODULE_COLOR, 0.03),
                    border: `1px solid ${colors.border}`,
                    borderLeftColor: darkMode ? '#4d9eff' : MODULE_COLOR,
                    borderLeftWidth: 4,
                    borderLeftStyle: 'solid',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.5,
                      pt: 1.5,
                      pb: unitCostOpen ? 0 : 1.5,
                      cursor: 'pointer',
                    }}
                    onClick={() => setUnitCostOpen(!unitCostOpen)}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: colors.text }}>
                      Unit Cost Analysis
                    </Typography>
                    <IconButton size="small" sx={{ color: colors.textSecondary }}>
                      {unitCostOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                  <Collapse in={unitCostOpen}>
                    <CardContent sx={{ p: 1.5, pt: 1, '&:last-child': { pb: 1.5 } }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Std Cost</Typography>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text }}>
                            {formatCurrency(selectedData.stdCost)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Actual Cost</Typography>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text }}>
                            {formatCurrency(selectedData.actualCost)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Drift %</Typography>
                          <Typography
                            sx={{
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: getDriftColor(selectedData.driftPct),
                            }}
                          >
                            {selectedData.driftPct > 0 ? '+' : ''}{selectedData.driftPct}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Last Review</Typography>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text }}>
                            2024-12-15
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>

                {/* Margin Analysis — collapsible */}
                <Card
                  elevation={0}
                  sx={{
                    mb: 1.5,
                    bgcolor: darkMode ? '#161b22' : alpha('#10b981', 0.03),
                    border: `1px solid ${colors.border}`,
                    borderLeftColor: '#10b981',
                    borderLeftWidth: 4,
                    borderLeftStyle: 'solid',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.5,
                      pt: 1.5,
                      pb: marginOpen ? 0 : 1.5,
                      cursor: 'pointer',
                    }}
                    onClick={() => setMarginOpen(!marginOpen)}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: colors.text }}>
                      Margin Analysis
                    </Typography>
                    <IconButton size="small" sx={{ color: colors.textSecondary }}>
                      {marginOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                  <Collapse in={marginOpen}>
                    <CardContent sx={{ p: 1.5, pt: 1, '&:last-child': { pb: 1.5 } }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Book Value</Typography>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text }}>
                            {formatCurrency(selectedData.bookValue)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>True Value</Typography>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text }}>
                            {formatCurrency(selectedData.trueValue)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Delta</Typography>
                          <Typography
                            sx={{
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: selectedData.trueValue >= selectedData.bookValue ? '#10b981' : '#ef4444',
                            }}
                          >
                            {formatCurrency(selectedData.trueValue - selectedData.bookValue)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Margin %</Typography>
                          <Typography
                            sx={{
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color:
                                ((selectedData.trueValue - selectedData.bookValue) / selectedData.bookValue) * 100 >= 0
                                  ? '#10b981'
                                  : '#ef4444',
                            }}
                          >
                            {formatPercent(
                              ((selectedData.trueValue - selectedData.bookValue) / selectedData.bookValue) * 100
                            )}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>

                {/* Cost Trend Chart — collapsible */}
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: darkMode ? '#161b22' : '#ffffff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.5,
                      pt: 1.5,
                      pb: trendOpen ? 0 : 1.5,
                      cursor: 'pointer',
                    }}
                    onClick={() => setTrendOpen(!trendOpen)}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: colors.text }}>
                      12-Month Cost Trend
                    </Typography>
                    <IconButton size="small" sx={{ color: colors.textSecondary }}>
                      {trendOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                  <Collapse in={trendOpen}>
                    <CardContent sx={{ p: 1.5, pt: 1, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ height: 200 }}>
                        {chartData && <Line data={chartData} options={chartOptions} />}
                      </Box>
                    </CardContent>
                  </Collapse>
                </Card>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default LamEconomicGroundTruth;
