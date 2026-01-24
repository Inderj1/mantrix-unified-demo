import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download,
  AttachMoney, TrendingUp, CalendarMonth, CheckCircle, Schedule, Warning,
} from '@mui/icons-material';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';
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
import { LAM_PLANTS, LAM_VENDORS, getPlantName } from '../../data/arizonaBeveragesMasterData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

// Generate cash release timeline data using Arizona Beverages context
const generateTimelineData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  // Initiative types with Arizona Beverages context
  const initiatives = [
    {
      id: 1,
      name: `Safety Stock Optimization - ${getPlantName('1000')}`,
      category: 'Safety Stock',
      totalRelease: 6500000,
      confidence: 88,
      startMonth: 0,
      duration: 3,
      risk: 'Low',
      status: 'In Progress',
      owner: 'Inventory Team',
      plant: '1000',
    },
    {
      id: 2,
      name: 'EOQ Optimization - SFG Components',
      category: 'Lot Size',
      totalRelease: 2800000,
      confidence: 75,
      startMonth: 1,
      duration: 4,
      risk: 'Medium',
      status: 'Planned',
      owner: 'Procurement',
      plant: 'All',
    },
    {
      id: 3,
      name: `Excess Stock Liquidation - ${getPlantName('3000')}`,
      category: 'Excess/Obsolete',
      totalRelease: 12000000,
      confidence: 92,
      startMonth: 0,
      duration: 2,
      risk: 'Low',
      status: 'In Progress',
      owner: 'Sales Ops',
      plant: '3000',
    },
    {
      id: 4,
      name: `Lead Time Reduction - ${LAM_VENDORS[2]?.name || 'Niagara Bottling'}`,
      category: 'Pipeline Stock',
      totalRelease: 3500000,
      confidence: 68,
      startMonth: 3,
      duration: 5,
      risk: 'High',
      status: 'Planned',
      owner: 'Procurement',
      plant: 'All',
    },
    {
      id: 5,
      name: `Consignment Program - ${LAM_VENDORS[0]?.name || 'US Beverage Packers'}`,
      category: 'Terms',
      totalRelease: 1800000,
      confidence: 82,
      startMonth: 2,
      duration: 3,
      risk: 'Medium',
      status: 'Planned',
      owner: 'Supply Chain',
      plant: 'All',
    },
    {
      id: 6,
      name: 'Demand Sensing Improvement',
      category: 'Safety Stock',
      totalRelease: 290000,
      confidence: 70,
      startMonth: 4,
      duration: 6,
      risk: 'Medium',
      status: 'Planned',
      owner: 'Demand Planning',
    },
    {
      id: 7,
      name: 'Shipment Consolidation',
      category: 'Pipeline Stock',
      totalRelease: 230000,
      confidence: 78,
      startMonth: 2,
      duration: 4,
      risk: 'Low',
      status: 'In Progress',
      owner: 'Logistics',
    },
    {
      id: 8,
      name: 'C-Class SKU Rationalization',
      category: 'Excess/Obsolete',
      totalRelease: 310000,
      confidence: 85,
      startMonth: 1,
      duration: 5,
      risk: 'Low',
      status: 'Planned',
      owner: 'Product Mgmt',
    },
  ];

  // Calculate monthly release by initiative
  const initiativeMonthly = initiatives.map(init => {
    const monthlyRelease = init.totalRelease / init.duration;
    const monthlyData = Array(12).fill(0);
    for (let i = init.startMonth; i < Math.min(init.startMonth + init.duration, 12); i++) {
      monthlyData[i] = monthlyRelease;
    }
    return {
      ...init,
      monthlyData,
      riskAdjusted: Math.round(init.totalRelease * (init.confidence / 100)),
    };
  });

  // Aggregate monthly totals
  const monthlyTotals = months.map((_, idx) =>
    initiativeMonthly.reduce((sum, init) => sum + init.monthlyData[idx], 0)
  );

  // Cumulative release
  let cumulative = 0;
  const cumulativeRelease = monthlyTotals.map(val => {
    cumulative += val;
    return cumulative;
  });

  // Quarterly summary
  const quarterlyData = quarters.map((q, qIdx) => {
    const startMonth = qIdx * 3;
    const quarterTotal = monthlyTotals.slice(startMonth, startMonth + 3).reduce((s, v) => s + v, 0);
    const quarterInits = initiativeMonthly.filter(init =>
      init.startMonth >= startMonth && init.startMonth < startMonth + 3
    );
    return {
      quarter: q,
      totalRelease: Math.round(quarterTotal),
      initiatives: quarterInits.length,
      avgConfidence: quarterInits.length > 0
        ? Math.round(quarterInits.reduce((s, i) => s + i.confidence, 0) / quarterInits.length)
        : 0,
    };
  });

  // Category breakdown
  const categories = [...new Set(initiatives.map(i => i.category))];
  const categoryBreakdown = categories.map(cat => {
    const catInits = initiativeMonthly.filter(i => i.category === cat);
    return {
      category: cat,
      totalRelease: catInits.reduce((s, i) => s + i.totalRelease, 0),
      riskAdjusted: catInits.reduce((s, i) => s + i.riskAdjusted, 0),
      count: catInits.length,
    };
  });

  return {
    months,
    initiatives: initiativeMonthly,
    monthlyTotals: monthlyTotals.map(Math.round),
    cumulativeRelease: cumulativeRelease.map(Math.round),
    quarterlyData,
    categoryBreakdown,
    totals: {
      totalRelease: initiatives.reduce((s, i) => s + i.totalRelease, 0),
      riskAdjusted: initiativeMonthly.reduce((s, i) => s + i.riskAdjusted, 0),
      avgConfidence: Math.round(initiatives.reduce((s, i) => s + i.confidence, 0) / initiatives.length),
      inProgress: initiatives.filter(i => i.status === 'In Progress').length,
      planned: initiatives.filter(i => i.status === 'Planned').length,
    },
  };
};

const CashReleaseTimeline = ({ onBack, onTileClick, darkMode = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('monthly');

  // Get tile data config for data source indicator
  const tileConfig = getTileDataConfig('cash-release-timeline');
  const colors = getColors(darkMode);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateTimelineData());
      setLoading(false);
    }, 500);
  };

  if (loading || !data) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Loading Cash Release Timeline...</Typography>
      </Box>
    );
  }

  // Monthly/Cumulative chart
  const timelineChart = {
    labels: data.months,
    datasets: viewMode === 'monthly' ? [
      {
        label: 'Monthly Cash Release',
        data: data.monthlyTotals,
        backgroundColor: '#1a5a9e',
        borderRadius: 4,
      },
    ] : [
      {
        label: 'Cumulative Cash Release',
        data: data.cumulativeRelease,
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
    ],
  };

  // Category breakdown chart
  const categoryChart = {
    labels: data.categoryBreakdown.map(c => c.category),
    datasets: [
      {
        label: 'Total Release',
        data: data.categoryBreakdown.map(c => c.totalRelease),
        backgroundColor: '#1a5a9e',
      },
      {
        label: 'Risk-Adjusted',
        data: data.categoryBreakdown.map(c => c.riskAdjusted),
        backgroundColor: '#10b981',
      },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return '#10b981';
      case 'Planned': return '#1a5a9e';
      case 'Completed': return '#64748b';
      default: return '#64748b';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'High': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: colors.background }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>Layer 6: Execution</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Cash Release Timeline</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <TimelineIcon sx={{ fontSize: 32, color: '#1a5a9e' }} />
              <Typography variant="h4" fontWeight={700}>Cash Release Timeline</Typography>
              <Chip label="Tile 6.2" size="small" sx={{ bgcolor: alpha('#1a5a9e', 0.1), color: '#1a5a9e', fontWeight: 600 }} />
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Track cash release by initiative over time
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={loadData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderLeft: '4px solid #1a5a9e', bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Total Cash Release</Typography>
                <Typography variant="h5" fontWeight={700} color="#1a5a9e">{formatCurrency(data.totals.totalRelease)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderLeft: '4px solid #10b981', bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Risk-Adjusted</Typography>
                <Typography variant="h5" fontWeight={700} color="#10b981">{formatCurrency(data.totals.riskAdjusted)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderLeft: '4px solid #1a5a9e', bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Avg Confidence</Typography>
                <Typography variant="h5" fontWeight={700}>{data.totals.avgConfidence}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderLeft: '4px solid #f59e0b', bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Initiatives</Typography>
                <Stack direction="row" spacing={1} alignItems="baseline">
                  <Typography variant="h5" fontWeight={700}>{data.initiatives.length}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({data.totals.inProgress} active)
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Timeline Chart */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: 300, bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>Cash Release Over Time</Typography>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, v) => v && setViewMode(v)}
                    size="small"
                  >
                    <ToggleButton value="monthly" sx={{ px: 1.5, py: 0.3, fontSize: '0.7rem' }}>Monthly</ToggleButton>
                    <ToggleButton value="cumulative" sx={{ px: 1.5, py: 0.3, fontSize: '0.7rem' }}>Cumulative</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
                <Box sx={{ height: 230 }}>
                  <Bar
                    data={timelineChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: { label: (ctx) => formatCurrency(ctx.raw) },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
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

          {/* Category Breakdown */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 300, bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>By Category</Typography>
                <Box sx={{ height: 230 }}>
                  <Bar
                    data={categoryChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: 'y',
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 }, color: colors.text } },
                        tooltip: {
                          callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` },
                        },
                      },
                      scales: {
                        x: {
                          ticks: { callback: (v) => formatCurrency(v), color: colors.textSecondary },
                          grid: { color: colors.border },
                        },
                        y: {
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

        {/* Quarterly Summary */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {data.quarterlyData.map((q) => (
            <Grid item xs={6} sm={3} key={q.quarter}>
              <Card sx={{ bgcolor: alpha('#1a5a9e', darkMode ? 0.15 : 0.03), borderColor: colors.border }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#1a5a9e">{q.quarter} 2025</Typography>
                  <Typography variant="h6" fontWeight={700}>{formatCurrency(q.totalRelease)}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={`${q.initiatives} initiatives`} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                    <Chip label={`${q.avgConfidence}% conf`} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Initiatives Gantt-style Table */}
        <Card sx={{ bgcolor: colors.cardBg, borderColor: colors.border }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Initiative Timeline</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', minWidth: 200 }}>Initiative</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Release</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Conf.</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Risk</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Status</TableCell>
                    {/* Gantt bars for each month */}
                    {data.months.map((m) => (
                      <TableCell key={m} align="center" sx={{ fontWeight: 700, fontSize: '0.6rem', p: 0.5, minWidth: 30 }}>{m.slice(0, 1)}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.initiatives.map((init) => (
                    <TableRow key={init.id}>
                      <TableCell sx={{ fontSize: '0.7rem' }}>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{init.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{init.owner}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={init.category} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#10b981' }}>
                        {formatCurrency(init.totalRelease)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${init.confidence}%`}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            bgcolor: init.confidence >= 80 ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                            color: init.confidence >= 80 ? '#10b981' : '#f59e0b',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={init.risk}
                          size="small"
                          sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha(getRiskColor(init.risk), 0.1), color: getRiskColor(init.risk) }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={init.status}
                          size="small"
                          sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha(getStatusColor(init.status), 0.1), color: getStatusColor(init.status) }}
                        />
                      </TableCell>
                      {/* Gantt bars */}
                      {data.months.map((_, idx) => (
                        <TableCell key={idx} sx={{ p: 0.5 }}>
                          {idx >= init.startMonth && idx < init.startMonth + init.duration ? (
                            <Box
                              sx={{
                                height: 12,
                                bgcolor: getStatusColor(init.status),
                                borderRadius: idx === init.startMonth ? '4px 0 0 4px' : idx === init.startMonth + init.duration - 1 ? '0 4px 4px 0' : 0,
                              }}
                            />
                          ) : null}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default CashReleaseTimeline;
