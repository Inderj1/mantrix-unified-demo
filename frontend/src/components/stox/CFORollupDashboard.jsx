import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Divider,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, TrendingUp, TrendingDown,
  AttachMoney, Savings, Warning, CheckCircle, Schedule, ShowChart, PieChart as PieChartIcon, Speed,
} from '@mui/icons-material';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';

import { LAM_PLANTS, LAM_MATERIAL_PLANT_DATA, calculatePlantSummary, getMaterialById } from '../../data/arizonaBeveragesMasterData';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, ChartTooltip, Legend, Filler);

const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

// Generate executive summary data using Arizona Beverages data
const generateCFOData = () => {
  // Calculate total excess from actual Arizona Beverages data
  const totalExcess = LAM_MATERIAL_PLANT_DATA.reduce((sum, d) => sum + (d.excessStock || 0), 0);
  const totalValue = LAM_MATERIAL_PLANT_DATA.reduce((sum, d) => {
    const mat = getMaterialById(d.materialId);
    return sum + (d.totalStock * (mat?.basePrice || 0));
  }, 0);

  // Overall WC metrics - use real data scaled appropriately
  const totalWorkingCapital = totalExcess > 0 ? totalExcess : 185000000;
  const cycleStock = totalWorkingCapital * 0.38;
  const safetyStock = totalWorkingCapital * 0.28;
  const pipelineStock = totalWorkingCapital * 0.14;
  const excessStock = totalWorkingCapital * 0.20;

  // Cash release potential
  const totalCashRelease = excessStock * 0.85; // 85% of excess is recoverable
  const highConfidence = totalCashRelease * 0.45;
  const mediumConfidence = totalCashRelease * 0.35;
  const lowConfidence = totalCashRelease * 0.20;

  // Risk-adjusted savings
  const riskAdjustedSavings = totalCashRelease * 0.72;

  // Plant breakdown using Arizona Beverages plants
  const plants = LAM_PLANTS.map(plant => {
    const summary = calculatePlantSummary(plant.id);
    return {
      name: `${plant.name}`,
      region: plant.region,
      wc: summary.totalExcess > 0 ? summary.totalExcess : totalWorkingCapital / LAM_PLANTS.length * (0.8 + Math.random() * 0.4),
      cashRelease: (summary.totalExcess || totalWorkingCapital / LAM_PLANTS.length * 0.2) * 0.15,
      confidence: Math.floor(70 + Math.random() * 25),
      serviceRisk: (1.5 + Math.random() * 3).toFixed(1),
      dioChange: Math.floor(-4 - Math.random() * 8),
    };
  });

  // Monthly WC trend (last 12 months)
  const wcTrend = Array.from({ length: 12 }, (_, i) => {
    const baseWC = totalWorkingCapital * (1 + (11 - i) * 0.015);
    return {
      month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
      wc: Math.round(baseWC + (Math.random() - 0.5) * 500000),
      target: Math.round(baseWC * 0.92),
    };
  });

  // Key recommendations
  const recommendations = [
    { id: 1, type: 'Safety Stock', action: 'Reduce SS by 15% on A-class items', impact: 420000, confidence: 88, timeline: 'Q1' },
    { id: 2, type: 'Lot Size', action: 'Optimize EOQ for slow movers', impact: 280000, confidence: 75, timeline: 'Q1-Q2' },
    { id: 3, type: 'Lead Time', action: 'Negotiate LT reduction with top 5 suppliers', impact: 350000, confidence: 68, timeline: 'Q2' },
    { id: 4, type: 'Excess Stock', action: 'Liquidate aging inventory >180 days', impact: 520000, confidence: 92, timeline: 'Q1' },
    { id: 5, type: 'Pipeline', action: 'Consolidate shipments for pipeline reduction', impact: 230000, confidence: 70, timeline: 'Q2' },
  ];

  return {
    summary: {
      totalWorkingCapital: Math.round(totalWorkingCapital),
      cycleStock: Math.round(cycleStock),
      safetyStock: Math.round(safetyStock),
      pipelineStock: Math.round(pipelineStock),
      excessStock: Math.round(excessStock),
      totalCashRelease: Math.round(totalCashRelease),
      highConfidence: Math.round(highConfidence),
      mediumConfidence: Math.round(mediumConfidence),
      lowConfidence: Math.round(lowConfidence),
      riskAdjustedSavings: Math.round(riskAdjustedSavings),
      avgDIO: 68 + Math.floor(Math.random() * 5),
      targetDIO: 58,
      inventoryTurns: (4.2 + Math.random() * 0.5).toFixed(1),
      serviceLevel: (97.2 + Math.random() * 1.5).toFixed(1),
    },
    plants,
    wcTrend,
    recommendations,
  };
};

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const CFORollupDashboard = ({ onBack, onTileClick, darkMode = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get tile data config for data source indicator
  const tileConfig = getTileDataConfig('cfo-rollup-dashboard');
  const colors = getColors(darkMode);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateCFOData());
      setLoading(false);
    }, 500);
  };

  if (loading || !data) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Loading CFO Dashboard...</Typography>
      </Box>
    );
  }

  // WC Decomposition chart
  const wcDecompChart = {
    labels: ['Cycle Stock', 'Safety Stock', 'Pipeline Stock', 'Excess/Obsolete'],
    datasets: [{
      data: [data.summary.cycleStock, data.summary.safetyStock, data.summary.pipelineStock, data.summary.excessStock],
      backgroundColor: ['#1a5a9e', '#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }],
  };

  // Cash Release by Confidence chart
  const cashReleaseChart = {
    labels: ['High (>80%)', 'Medium (60-80%)', 'Low (<60%)'],
    datasets: [{
      data: [data.summary.highConfidence, data.summary.mediumConfidence, data.summary.lowConfidence],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }],
  };

  // WC Trend chart
  const wcTrendChart = {
    labels: data.wcTrend.map(d => d.month),
    datasets: [
      {
        label: 'Actual WC',
        data: data.wcTrend.map(d => d.wc),
        borderColor: '#1a5a9e',
        backgroundColor: 'rgba(8, 84, 160, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Target WC',
        data: data.wcTrend.map(d => d.target),
        borderColor: '#10b981',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        tension: 0.4,
      },
    ],
  };

  // Plant performance chart
  const plantChart = {
    labels: data.plants.map(p => p.name),
    datasets: [
      {
        label: 'Working Capital ($M)',
        data: data.plants.map(p => p.wc / 1000000),
        backgroundColor: '#1a5a9e',
        yAxisID: 'y',
      },
      {
        label: 'Cash Release ($K)',
        data: data.plants.map(p => p.cashRelease / 1000),
        backgroundColor: '#10b981',
        yAxisID: 'y1',
      },
    ],
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: colors.background }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>Layer 6: Execution</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>CFO Rollup Dashboard</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <AccountBalanceIcon sx={{ fontSize: 32, color: '#1a5a9e' }} />
              <Typography variant="h4" fontWeight={700}>CFO Rollup Dashboard</Typography>
              <Chip label="Tile 6.3" size="small" sx={{ bgcolor: alpha('#1a5a9e', 0.1), color: '#1a5a9e', fontWeight: 600 }} />
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Executive Working Capital Summary
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={loadData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Main Content - Scrollable */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Top KPI Cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #1a5a9e', height: '100%', bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Working Capital</Typography>
                    <Typography variant="h4" fontWeight={700} color="#1a5a9e">
                      {formatCurrency(data.summary.totalWorkingCapital)}
                    </Typography>
                  </Box>
                  <AccountBalanceIcon sx={{ fontSize: 40, color: alpha('#1a5a9e', 0.2) }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #10b981', height: '100%', bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Cash Release Potential</Typography>
                    <Typography variant="h4" fontWeight={700} color="#10b981">
                      {formatCurrency(data.summary.totalCashRelease)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Risk-Adj: {formatCurrency(data.summary.riskAdjustedSavings)}
                    </Typography>
                  </Box>
                  <Savings sx={{ fontSize: 40, color: alpha('#10b981', 0.2) }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #f59e0b', height: '100%', bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Days Inventory Outstanding</Typography>
                    <Stack direction="row" alignItems="baseline" spacing={1}>
                      <Typography variant="h4" fontWeight={700}>{data.summary.avgDIO}</Typography>
                      <Chip
                        icon={<TrendingDown sx={{ fontSize: 14 }} />}
                        label={`Target: ${data.summary.targetDIO}`}
                        size="small"
                        sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontSize: '0.65rem' }}
                      />
                    </Stack>
                  </Box>
                  <Schedule sx={{ fontSize: 40, color: alpha('#f59e0b', 0.2) }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #00357a', height: '100%', bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Inventory Turns / Service Level</Typography>
                    <Typography variant="h4" fontWeight={700}>{data.summary.inventoryTurns}x</Typography>
                    <Typography variant="caption" color="text.secondary">
                      SL: {data.summary.serviceLevel}%
                    </Typography>
                  </Box>
                  <Speed sx={{ fontSize: 40, color: alpha('#00357a', 0.2) }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* WC Decomposition */}
          <Grid item xs={12} md={3}>
            <Card sx={{ height: 280, bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>WC Decomposition</Typography>
                <Box sx={{ height: 200 }}>
                  <Doughnut
                    data={wcDecompChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 }, color: colors.text } },
                        tooltip: {
                          callbacks: { label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}` },
                        },
                      },
                      cutout: '60%',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Cash Release by Confidence */}
          <Grid item xs={12} md={3}>
            <Card sx={{ height: 280, bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Cash Release by Confidence</Typography>
                <Box sx={{ height: 200 }}>
                  <Doughnut
                    data={cashReleaseChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 }, color: colors.text } },
                        tooltip: {
                          callbacks: { label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}` },
                        },
                      },
                      cutout: '60%',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* WC Trend */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 280, bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Working Capital Trend (12 Months)</Typography>
                <Box sx={{ height: 210 }}>
                  <Line
                    data={wcTrendChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 }, color: colors.text } },
                        tooltip: {
                          callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` },
                        },
                      },
                      scales: {
                        y: {
                          ticks: { callback: (v) => formatCurrency(v), color: colors.textSecondary },
                          grid: { color: colors.border },
                        },
                        x: {
                          ticks: { color: colors.textSecondary },
                          grid: { color: colors.border },
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Plant Performance and Recommendations */}
        <Grid container spacing={2}>
          {/* Plant Performance */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 320, bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Plant/DC Performance</Typography>
                <Box sx={{ height: 200, mb: 2 }}>
                  <Bar
                    data={plantChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 }, color: colors.text } },
                      },
                      scales: {
                        y: { title: { display: true, text: 'WC ($M)', color: colors.text }, position: 'left', ticks: { color: colors.textSecondary }, grid: { color: colors.border } },
                        y1: { title: { display: true, text: 'Release ($K)', color: colors.text }, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: colors.textSecondary } },
                        x: { ticks: { color: colors.textSecondary }, grid: { color: colors.border } },
                      },
                    }}
                  />
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Plant</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Confidence</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Service Risk</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>DIO Δ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.plants.map((plant) => (
                        <TableRow key={plant.name}>
                          <TableCell sx={{ fontSize: '0.7rem' }}>{plant.name}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${plant.confidence}%`}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.6rem',
                                bgcolor: plant.confidence >= 80 ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                                color: plant.confidence >= 80 ? '#10b981' : '#f59e0b',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${plant.serviceRisk}%`}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.6rem',
                                bgcolor: plant.serviceRisk <= 3 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                color: plant.serviceRisk <= 3 ? '#10b981' : '#ef4444',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                            {plant.dioChange} days
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Recommendations */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 320, bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>Top Cash Release Recommendations</Typography>
                  <Chip
                    label={`Total: ${formatCurrency(data.recommendations.reduce((s, r) => s + r.impact, 0))}`}
                    size="small"
                    sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700 }}
                  />
                </Stack>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Action</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Impact</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Conf.</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Timeline</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.recommendations.map((rec) => (
                        <TableRow key={rec.id}>
                          <TableCell sx={{ fontSize: '0.7rem' }}>
                            <Chip label={rec.type} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.7rem' }}>{rec.action}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#10b981' }}>
                            {formatCurrency(rec.impact)}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <LinearProgress
                                variant="determinate"
                                value={rec.confidence}
                                sx={{
                                  width: 40,
                                  height: 4,
                                  borderRadius: 2,
                                  bgcolor: alpha('#1a5a9e', 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: rec.confidence >= 80 ? '#10b981' : rec.confidence >= 60 ? '#f59e0b' : '#ef4444',
                                  },
                                }}
                              />
                              <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>{rec.confidence}%</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={rec.timeline}
                              size="small"
                              sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha('#1a5a9e', 0.1), color: '#1a5a9e' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CFORollupDashboard;
