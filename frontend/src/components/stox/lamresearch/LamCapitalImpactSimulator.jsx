import React, { useState } from 'react';
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
  Button,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  Inventory as InventoryIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  ShowChart as ShowChartIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { stoxTheme } from '../stoxTheme';
import { getColors, MODULE_COLOR } from '../../../config/brandColors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// ============================================
// Scenario Data
// ============================================
const SCENARIOS = [
  {
    id: 'recommended',
    name: 'Recommended',
    label: 'AI Optimized',
    wc: '-$8.4M',
    risk: 'Low',
    riskColor: '#10b981',
    timeline: '12 wks',
  },
  {
    id: 'conservative',
    name: 'Conservative',
    label: 'Low Risk',
    wc: '-$4.2M',
    risk: 'Very Low',
    riskColor: '#10b981',
    timeline: '8 wks',
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    label: 'Max Impact',
    wc: '-$14.6M',
    risk: 'Medium',
    riskColor: '#f59e0b',
    timeline: '16 wks',
  },
];

// ============================================
// Chart Data
// ============================================
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WC_TRAJECTORY = [42.8, 42.1, 41.3, 40.6, 39.8, 38.9, 38.0, 37.2, 36.4, 35.6, 34.9, 34.4];
const INV_EA = [86.8, 85.2, 83.5, 81.9, 80.1, 78.4, 76.8, 75.1, 73.6, 71.8, 70.2, 68.5];

const MONTE_CARLO_RANGES = ['$2M', '$3M', '$4M', '$5M', '$6M', '$7M', '$8M', '$9M', '$10M', '$11M', '$12M', '$13M', '$14M'];
const MONTE_CARLO_PROBS = [1.2, 2.8, 5.1, 8.4, 12.6, 16.2, 18.8, 17.4, 10.2, 4.8, 1.6, 0.7, 0.2];

// ============================================
// Traceability Tiles Data
// ============================================
const TRACE_TILES = [
  { id: 'T0', name: 'Economic Ground Truth', value: 'Trust 84.2%', color: MODULE_COLOR },
  { id: 'T1', name: 'Inventory Health', value: '$42.8M', color: MODULE_COLOR },
  { id: 'T2', name: 'Demand / Supply', value: '-22,780 EA gap', color: MODULE_COLOR },
  { id: 'T3', name: 'Supply Risk', value: '78% OTD', color: MODULE_COLOR },
  { id: 'T4', name: 'Safety Stock', value: '$2.8M released', color: MODULE_COLOR },
  { id: 'T5', name: 'MRP Quality', value: '26% actionable', color: MODULE_COLOR },
];

// ============================================
// Component
// ============================================
export default function LamCapitalImpactSimulator({ onBack, darkMode = false }) {
  const colors = getColors(darkMode);
  const [selectedScenario, setSelectedScenario] = useState('recommended');

  // ---- Dark mode palette ----
  const bg = darkMode ? '#0d1117' : colors.background;
  const paperBg = darkMode ? '#161b22' : '#ffffff';
  const cardBg = darkMode ? '#21262d' : '#ffffff';
  const textPrimary = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  // ---- Chart: Working Capital & Inventory ----
  const wcChartData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Working Capital ($M)',
        data: WC_TRAJECTORY,
        borderColor: MODULE_COLOR,
        backgroundColor: alpha(MODULE_COLOR, 0.1),
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: MODULE_COLOR,
        yAxisID: 'y',
      },
      {
        label: 'Inventory (K EA)',
        data: INV_EA,
        borderColor: '#f59e0b',
        backgroundColor: alpha('#f59e0b', 0.08),
        fill: false,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: '#f59e0b',
        borderDash: [5, 3],
        yAxisID: 'y1',
      },
    ],
  };

  const wcChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: textPrimary, font: { size: 11 }, usePointStyle: true, padding: 16 },
      },
      tooltip: {
        backgroundColor: darkMode ? '#21262d' : '#ffffff',
        titleColor: textPrimary,
        bodyColor: textSecondary,
        borderColor,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
        ticks: { color: darkMode ? '#8b949e' : '#64748b', font: { size: 11 } },
      },
      y: {
        position: 'left',
        title: { display: true, text: 'Working Capital ($M)', color: textSecondary, font: { size: 11 } },
        grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
        ticks: { color: darkMode ? '#8b949e' : '#64748b', font: { size: 11 }, callback: (v) => `$${v}M` },
      },
      y1: {
        position: 'right',
        title: { display: true, text: 'Inventory (K EA)', color: textSecondary, font: { size: 11 } },
        grid: { drawOnChartArea: false },
        ticks: { color: darkMode ? '#8b949e' : '#64748b', font: { size: 11 }, callback: (v) => `${v}K` },
      },
    },
  };

  // ---- Chart: Monte Carlo Distribution ----
  const selectedIdx = SCENARIOS.findIndex((s) => s.id === selectedScenario);
  const highlightRange = selectedScenario === 'recommended' ? 6 : selectedScenario === 'conservative' ? 2 : 10;

  const monteCarloData = {
    labels: MONTE_CARLO_RANGES,
    datasets: [
      {
        label: 'Probability (%)',
        data: MONTE_CARLO_PROBS,
        backgroundColor: MONTE_CARLO_PROBS.map((_, i) =>
          i === highlightRange ? '#ff751f' : alpha(MODULE_COLOR, 0.7)
        ),
        borderColor: MONTE_CARLO_PROBS.map((_, i) =>
          i === highlightRange ? '#cc5c19' : MODULE_COLOR
        ),
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  };

  const monteCarloOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: darkMode ? '#21262d' : '#ffffff',
        titleColor: textPrimary,
        bodyColor: textSecondary,
        borderColor,
        borderWidth: 1,
        callbacks: { label: (ctx) => `Probability: ${ctx.parsed.y}%` },
      },
    },
    scales: {
      x: {
        grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
        ticks: { color: darkMode ? '#8b949e' : '#64748b', font: { size: 10 } },
        title: { display: true, text: 'Working Capital Savings Range', color: textSecondary, font: { size: 11 } },
      },
      y: {
        grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
        ticks: { color: darkMode ? '#8b949e' : '#64748b', font: { size: 11 }, callback: (v) => `${v}%` },
        title: { display: true, text: 'Probability (%)', color: textSecondary, font: { size: 11 } },
      },
    },
  };

  // ---- KPI Cards data ----
  const kpiCards = [
    { label: 'Working Capital Released', value: '$8.4M', border: '#10b981', Icon: TrendingUpIcon, sub: 'Net improvement over 12 months' },
    { label: 'EBITDA Impact', value: '+$2.1M', border: '#10b981', Icon: ShowChartIcon, sub: 'Annualized margin contribution' },
    { label: 'ROIC Improvement', value: '+6.8pp', border: MODULE_COLOR, Icon: SpeedIcon, sub: 'Return on invested capital delta' },
    { label: 'Downside Risk P5', value: '$1.2M', border: '#f59e0b', Icon: WarningIcon, sub: '5th percentile worst-case floor' },
  ];

  return (
    <Box sx={{ p: 2, bgcolor: bg, minHeight: '100vh' }}>
      {/* ============================================ */}
      {/* HEADER                                       */}
      {/* ============================================ */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          bgcolor: paperBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <IconButton onClick={onBack} size="small" sx={{ color: MODULE_COLOR }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14, color: textSecondary }} />} sx={{ mb: 0.5 }}>
            <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.7rem', color: textSecondary, cursor: 'pointer' }}>CORE.AI</Link>
            <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.7rem', color: textSecondary, cursor: 'pointer' }}>STOX.AI</Link>
            <Link underline="hover" onClick={onBack} sx={{ fontSize: '0.7rem', color: textSecondary, cursor: 'pointer' }}>Lam Research</Link>
            <Typography sx={{ fontSize: '0.7rem', color: MODULE_COLOR, fontWeight: 600 }}>Capital Impact Simulator</Typography>
          </Breadcrumbs>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: textPrimary }}>
            Capital Impact Simulator — CFO / Board Lens
          </Typography>
        </Box>
        <Chip label="Tile 6" size="small" sx={{ bgcolor: alpha(MODULE_COLOR, 0.1), color: MODULE_COLOR, fontWeight: 700, fontSize: '0.7rem' }} />
      </Paper>

      {/* ============================================ */}
      {/* DUAL EXECUTIVE SUMMARY                       */}
      {/* ============================================ */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Quantity Impact */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: paperBg,
              border: `1px solid ${borderColor}`,
              borderLeft: `4px solid ${MODULE_COLOR}`,
              borderRadius: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <InventoryIcon sx={{ color: MODULE_COLOR, fontSize: 20 }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textPrimary }}>Quantity Impact</Typography>
            </Stack>
            <Grid container spacing={1}>
              {[
                { label: 'SKUs Repositioned', value: '342', color: MODULE_COLOR },
                { label: 'EA Repositioned', value: '86,820', color: MODULE_COLOR },
                { label: 'Net Reduction', value: '-31,980 EA', color: '#10b981' },
              ].map((kpi) => (
                <Grid item xs={4} key={kpi.label}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(kpi.color, 0.05), borderRadius: 1 }}>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: textSecondary, mt: 0.3 }}>{kpi.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Capital Impact */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: paperBg,
              border: `1px solid ${borderColor}`,
              borderLeft: `4px solid ${MODULE_COLOR}`,
              borderRadius: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <AccountBalanceIcon sx={{ color: MODULE_COLOR, fontSize: 20 }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textPrimary }}>Capital Impact</Typography>
            </Stack>
            <Grid container spacing={1}>
              {[
                { label: 'Capital Released', value: '$11.8M', color: '#10b981' },
                { label: 'Capital Invested', value: '$3.4M', color: '#f59e0b' },
                { label: 'Net Improvement', value: '-$8.4M', color: '#10b981' },
              ].map((kpi) => (
                <Grid item xs={4} key={kpi.label}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(kpi.color, 0.05), borderRadius: 1 }}>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: textSecondary, mt: 0.3 }}>{kpi.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* ============================================ */}
      {/* 4 KPI CARDS                                  */}
      {/* ============================================ */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {kpiCards.map((kpi) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.label}>
            <Card
              elevation={0}
              sx={{
                bgcolor: cardBg,
                border: `1px solid ${borderColor}`,
                borderLeft: `4px solid ${kpi.border}`,
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: alpha(kpi.border, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <kpi.Icon sx={{ fontSize: 18, color: kpi.border }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', color: textSecondary, fontWeight: 600 }}>{kpi.label}</Typography>
                </Stack>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: textPrimary }}>{kpi.value}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: textSecondary, mt: 0.5 }}>{kpi.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ============================================ */}
      {/* 3 SCENARIO CARDS                             */}
      {/* ============================================ */}
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textPrimary, mb: 1 }}>
        Scenario Selection
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {SCENARIOS.map((sc) => {
          const isSelected = selectedScenario === sc.id;
          return (
            <Grid item xs={12} md={4} key={sc.id}>
              <Card
                elevation={isSelected ? 2 : 0}
                sx={{
                  bgcolor: isSelected ? (darkMode ? alpha(MODULE_COLOR, 0.08) : alpha(MODULE_COLOR, 0.03)) : cardBg,
                  border: isSelected ? `2px solid ${MODULE_COLOR}` : `1px solid ${borderColor}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: MODULE_COLOR },
                }}
                onClick={() => setSelectedScenario(sc.id)}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: textPrimary }}>{sc.name}</Typography>
                    <Chip
                      label={sc.label}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        bgcolor: isSelected ? alpha(MODULE_COLOR, 0.12) : alpha(MODULE_COLOR, 0.06),
                        color: MODULE_COLOR,
                      }}
                    />
                  </Stack>
                  <Divider sx={{ mb: 1.5, borderColor }} />
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography sx={{ fontSize: '0.65rem', color: textSecondary }}>WC Impact</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>{sc.wc}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ fontSize: '0.65rem', color: textSecondary }}>Risk</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: sc.riskColor }}>{sc.risk}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ fontSize: '0.65rem', color: textSecondary }}>Timeline</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: textPrimary }}>{sc.timeline}</Typography>
                    </Grid>
                  </Grid>
                  <Button
                    variant={isSelected ? 'contained' : 'outlined'}
                    size="small"
                    fullWidth
                    sx={{
                      mt: 1.5,
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      bgcolor: isSelected ? MODULE_COLOR : 'transparent',
                      color: isSelected ? '#ffffff' : MODULE_COLOR,
                      borderColor: MODULE_COLOR,
                      '&:hover': {
                        bgcolor: isSelected ? alpha(MODULE_COLOR, 0.9) : alpha(MODULE_COLOR, 0.08),
                        borderColor: MODULE_COLOR,
                      },
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ============================================ */}
      {/* 2 CHARTS SIDE BY SIDE                        */}
      {/* ============================================ */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Working Capital & Inventory Line Chart */}
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
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textPrimary, mb: 1.5 }}>
              Working Capital & Inventory Trajectory
            </Typography>
            <Box sx={{ height: 260 }}>
              <Line data={wcChartData} options={wcChartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Monte Carlo Distribution Bar Chart */}
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
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textPrimary }}>
                Monte Carlo Distribution (10,000 simulations)
              </Typography>
              <Chip
                label={SCENARIOS.find((s) => s.id === selectedScenario)?.name}
                size="small"
                sx={{ fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha(MODULE_COLOR, 0.1), color: MODULE_COLOR }}
              />
            </Stack>
            <Box sx={{ height: 260 }}>
              <Bar data={monteCarloData} options={monteCarloOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ============================================ */}
      {/* 6 TRACEABILITY MINI-TILES                    */}
      {/* ============================================ */}
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textPrimary, mb: 1 }}>
        Decision Traceability — Linked Tiles
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {TRACE_TILES.map((tile) => (
          <Grid item xs={6} sm={4} md={2} key={tile.id}>
            <Card
              elevation={0}
              sx={{
                bgcolor: alpha(tile.color, darkMode ? 0.06 : 0.03),
                border: `1px solid ${borderColor}`,
                borderLeft: `4px solid ${tile.color}`,
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 1.2, '&:last-child': { pb: 1.2 } }}>
                <Chip
                  label={tile.id}
                  size="small"
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    height: 18,
                    bgcolor: alpha(MODULE_COLOR, 0.1),
                    color: MODULE_COLOR,
                    mb: 0.5,
                  }}
                />
                <Typography sx={{ fontSize: '0.65rem', color: textSecondary, mb: 0.3, lineHeight: 1.3 }}>
                  {tile.name}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textPrimary }}>
                  {tile.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ============================================ */}
      {/* BOARD MEMO SECTION                           */}
      {/* ============================================ */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2,
          bgcolor: paperBg,
          border: `1px solid ${borderColor}`,
          borderLeft: `4px solid ${MODULE_COLOR}`,
          borderRadius: 2,
        }}
      >
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: textPrimary, mb: 1.5 }}>
          Executive Memo — Inventory Optimization Program
        </Typography>
        <Divider sx={{ mb: 1.5, borderColor }} />
        <Typography sx={{ fontSize: '0.75rem', color: textSecondary, mb: 1.5, lineHeight: 1.7 }}>
          Following a comprehensive analysis of <em>342 SKUs</em> across Lam Research's semiconductor manufacturing
          portfolio, the AI-driven inventory optimization engine recommends a phased repositioning program projected
          to release <em>$8.4M in working capital</em> over 12 weeks. The recommendation is derived from six
          interconnected analytical layers spanning economic ground truth validation, inventory health classification,
          demand-supply gap analysis, supplier risk assessment, safety stock recalibration, and MRP quality scoring.
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: textSecondary, mb: 1.5, lineHeight: 1.7 }}>
          The recommended scenario achieves a net capital improvement of <em>-$8.4M</em> by releasing <em>$11.8M</em> in
          excess and obsolescent inventory while reinvesting <em>$3.4M</em> into strategically understocked positions.
          Monte Carlo simulation across 10,000 iterations confirms <em>95% confidence</em> that outcomes will fall within
          the <em>$6.2M to $10.8M</em> range, with a P5 downside floor of <em>$1.2M</em>. The program is expected to
          contribute <em>+$2.1M in annualized EBITDA</em> improvement and a <em>+6.8 percentage point</em> uplift in
          return on invested capital.
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: textSecondary, lineHeight: 1.7 }}>
          Execution will proceed in three waves: Wave 1 (weeks 1-4) addresses high-confidence excess positions
          with <em>$3.8M</em> in immediate releases. Wave 2 (weeks 5-8) targets safety stock recalibration
          across <em>126 SKUs</em> with supplier lead-time hedging. Wave 3 (weeks 9-12) completes the obsolescence
          disposition pipeline with projected <em>$2.4M</em> in recovery. Board approval is requested to authorize
          procurement holds on <em>68 purchase orders</em> totaling <em>$4.2M</em> and initiate disposition
          protocols for <em>94 obsolescent line items</em>.
        </Typography>
      </Paper>

      {/* ============================================ */}
      {/* 3 ACTION BUTTONS                             */}
      {/* ============================================ */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 600,
            bgcolor: '#10b981',
            color: '#ffffff',
            px: 3,
            fontSize: '0.8rem',
            '&:hover': { bgcolor: '#059669' },
          }}
        >
          Approve & Execute
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon sx={{ fontSize: 18 }} />}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 600,
            bgcolor: '#f59e0b',
            color: '#ffffff',
            px: 3,
            fontSize: '0.8rem',
            '&:hover': { bgcolor: '#d97706' },
          }}
        >
          Modify Parameters
        </Button>
        <Button
          variant="contained"
          startIcon={<CancelIcon sx={{ fontSize: 18 }} />}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 600,
            bgcolor: '#ef4444',
            color: '#ffffff',
            px: 3,
            fontSize: '0.8rem',
            '&:hover': { bgcolor: '#dc2626' },
          }}
        >
          Reject & Document
        </Button>
      </Stack>
    </Box>
  );
}
