import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack, Button,
  Breadcrumbs, Link, Paper, Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FiberManualRecord as FiberManualRecordIcon,
  Replay as ReplayIcon,
  Shield as ShieldIcon,
  Insights as InsightsIcon,
  SmartToy as SmartToyIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import {
  dailySummaryCards, statusNotifications, personalPerformance,
  aiMetricsSummary, aiMetricsTimeSeries, exceptionPareto,
  vendorReliability, complianceSummary, auditTrailRecent,
} from './apMockDataV2';
import { apTheme, MODULE_NAVY, NAVY_DARK, NAVY_BLUE } from './apTheme';

const TILE_COLOR = MODULE_NAVY;

// ---------- Sparkline SVG component ----------

const Sparkline = ({ data, color, height = 60, width = '100%' }) => {
  if (!data || data.length === 0) return null;
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) =>
    `${(i / (values.length - 1)) * 100},${100 - ((v - min) / range) * 100}`
  ).join(' ');
  const gradId = `grad-${color.replace('#', '')}`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width, height, display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#${gradId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

// ---------- Tab definitions ----------

const tabs = [
  { key: 'tracker', label: 'Personal Tracker' },
  { key: 'ai-learning', label: 'AI Learning Metrics' },
  { key: 'compliance', label: 'Compliance & Audit' },
];

// ---------- Pareto bar colors (cycle through exception type palette) ----------

const paretoColors = [
  '#d97706', '#1565c0', '#dc2626', '#059669', '#00357a', '#7c3aed', '#64748b',
];

// ---------- Helper: status label color ----------

const getStatusLabelColor = (statusLabel) => {
  if (!statusLabel) return '#64748b';
  const upper = statusLabel.toUpperCase();
  if (upper.includes('POSTED') || upper.includes('APPROVED')) return '#059669';
  if (upper.includes('RESPONDED')) return '#1565c0';
  if (upper.includes('PARKED')) return '#d97706';
  return '#64748b';
};

// ---------- Main Component ----------

const IntelligenceDashboard = ({ onBack, darkMode = false, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('tracker');

  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';

  // ==============================
  //  TAB 1 — Personal Tracker
  // ==============================

  const renderTrackerTab = () => {
    // --- Notification DataGrid columns ---
    const notifColumns = [
      {
        field: 'notif',
        headerName: '',
        width: 40,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          params.row.hasNotif ? (
            <FiberManualRecordIcon
              sx={{
                fontSize: 10,
                color: NAVY_BLUE,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.3 },
                },
              }}
            />
          ) : null
        ),
      },
      {
        field: 'vendor',
        headerName: 'Vendor / Detail',
        flex: 1.5,
        minWidth: 220,
        sortable: false,
        renderCell: (params) => (
          <Box sx={{ py: 0.5, overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: '0.82rem', color: textColor, lineHeight: 1.3 }}
              noWrap
            >
              {params.row.vendor}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontSize: '0.68rem', color: textSecondary, lineHeight: 1.2 }}
              noWrap
            >
              {params.row.detail}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 110,
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: textColor }}>
            {params.row.amount}
          </Typography>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => {
          const chipStyle = apTheme.chips.invoiceStatus[params.row.status] || apTheme.chips.invoiceStatus.parked;
          return (
            <Chip
              label={params.row.status.toUpperCase()}
              size="small"
              sx={{
                ...chipStyle,
                height: 22,
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            />
          );
        },
      },
      {
        field: 'statusLabel',
        headerName: 'Status Label',
        width: 140,
        sortable: false,
        renderCell: (params) => (
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.72rem',
              color: getStatusLabelColor(params.row.statusLabel),
              letterSpacing: '0.3px',
            }}
          >
            {params.row.statusLabel}
          </Typography>
        ),
      },
      {
        field: 'daysOpen',
        headerName: 'Days Open',
        width: 85,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textColor }}>
            {params.row.daysOpen}
          </Typography>
        ),
      },
      {
        field: 'aiUpdate',
        headerName: 'AI Update',
        flex: 1.4,
        minWidth: 200,
        sortable: false,
        renderCell: (params) => (
          <Typography
            sx={{
              fontSize: '0.72rem',
              fontStyle: 'italic',
              color: textSecondary,
              lineHeight: 1.4,
            }}
            noWrap
          >
            {params.row.aiUpdate}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: '',
        width: 110,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          params.row.hasNotif ? (
            <Button
              size="small"
              startIcon={<ReplayIcon sx={{ fontSize: 14 }} />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.68rem',
                color: TILE_COLOR,
                border: `1px solid ${alpha(TILE_COLOR, 0.3)}`,
                bgcolor: alpha(TILE_COLOR, 0.06),
                px: 1.2,
                py: 0.3,
                '&:hover': {
                  bgcolor: alpha(TILE_COLOR, 0.14),
                },
              }}
            >
              Re-Process
            </Button>
          ) : null
        ),
      },
    ];

    return (
      <Box>
        {/* Daily summary cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {dailySummaryCards.map((card, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${borderColor}`,
                  /* no accent border */
                  bgcolor: cardBg,
                  boxShadow: darkMode
                    ? '0 2px 8px rgba(0,0,0,0.4)'
                    : '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography
                    sx={{
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      color: card.color,
                      lineHeight: 1.1,
                    }}
                  >
                    {card.value}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: textColor,
                      mt: 0.5,
                    }}
                  >
                    {card.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      color: textSecondary,
                      mt: 0.3,
                    }}
                  >
                    {card.sub}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Personal performance stats */}
        <Typography
          sx={{ fontSize: '0.82rem', fontWeight: 700, color: textColor, mb: 1.5 }}
        >
          Personal Performance
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {personalPerformance.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${borderColor}`,
                  bgcolor: cardBg,
                  boxShadow: darkMode
                    ? '0 2px 8px rgba(0,0,0,0.4)'
                    : '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography
                    sx={{
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      color: TILE_COLOR,
                      lineHeight: 1.1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: textColor,
                      mt: 0.5,
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.65rem',
                      color: stat.trendType === 'up' ? '#059669' : textSecondary,
                      mt: 0.3,
                      fontWeight: 500,
                    }}
                  >
                    {stat.trend}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Status notifications DataGrid */}
        <Typography
          sx={{ fontSize: '0.82rem', fontWeight: 700, color: textColor, mb: 1.5 }}
        >
          Status Notifications
        </Typography>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${borderColor}`,
            bgcolor: cardBg,
            overflow: 'hidden',
          }}
        >
          <DataGrid
            rows={statusNotifications}
            columns={notifColumns}
            autoHeight
            disableRowSelectionOnClick
            disableColumnMenu
            hideFooter
            rowHeight={56}
            sx={apTheme.getDataGridSx({ darkMode, clickable: false })}
          />
        </Paper>
      </Box>
    );
  };

  // ==============================
  //  TAB 2 — AI Learning Metrics
  // ==============================

  const renderAILearningTab = () => {
    // Metric key map for time series
    const metricKeys = [
      { key: 'extractionAccuracy', label: 'Extraction Accuracy', color: TILE_COLOR },
      { key: 'matchingAccuracy', label: 'Matching Accuracy', color: '#059669' },
      { key: 'glCodingAccuracy', label: 'GL Coding Accuracy', color: '#7c3aed' },
      { key: 'straightThroughRate', label: 'Straight-Through Rate', color: '#d97706' },
    ];

    // Vendor reliability DataGrid columns
    const reliabilityColumns = [
      {
        field: 'vendor',
        headerName: 'Vendor',
        flex: 1.3,
        minWidth: 180,
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: textColor }}>
            {params.row.vendor}
          </Typography>
        ),
      },
      {
        field: 'score',
        headerName: 'Score',
        width: 80,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => {
          const score = params.row.score;
          const scoreColor = score >= 90 ? '#059669' : score >= 80 ? '#d97706' : '#dc2626';
          return (
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: scoreColor }}>
              {score}
            </Typography>
          );
        },
      },
      {
        field: 'invoiceCount',
        headerName: 'Invoice Count',
        width: 110,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.8rem', color: textColor }}>
            {params.row.invoiceCount}
          </Typography>
        ),
      },
      {
        field: 'avgVariance',
        headerName: 'Avg Variance',
        width: 110,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.8rem', color: textColor }}>
            {params.row.avgVariance}
          </Typography>
        ),
      },
      {
        field: 'trend',
        headerName: 'Trend',
        width: 80,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => {
          const t = params.row.trend;
          if (t === 'up') return <TrendingUpIcon sx={{ fontSize: 18, color: '#059669' }} />;
          if (t === 'down') return <TrendingDownIcon sx={{ fontSize: 18, color: '#dc2626' }} />;
          return (
            <Typography sx={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 600 }}>
              --
            </Typography>
          );
        },
      },
      {
        field: 'tier',
        headerName: 'Tier',
        width: 90,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => {
          const tierKey = params.row.tier;
          const chipStyle = apTheme.chips.vendorReliability[tierKey] || {};
          return (
            <Chip
              label={tierKey.toUpperCase()}
              size="small"
              sx={{
                ...chipStyle,
                height: 22,
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            />
          );
        },
      },
    ];

    return (
      <Box>
        {/* AI Metrics summary cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {aiMetricsSummary.map((m, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${borderColor}`,
                  bgcolor: cardBg,
                  boxShadow: darkMode
                    ? '0 2px 8px rgba(0,0,0,0.4)'
                    : '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography
                    sx={{ fontSize: '0.72rem', fontWeight: 600, color: textSecondary, mb: 0.5 }}
                  >
                    {m.metric}
                  </Typography>
                  <Typography
                    sx={{ fontSize: '1.3rem', fontWeight: 800, color: TILE_COLOR, lineHeight: 1.1 }}
                  >
                    {m.current}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 14, color: '#059669' }} />
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#059669' }}>
                      {m.change}
                    </Typography>
                    <Typography sx={{ fontSize: '0.62rem', color: textSecondary }}>
                      ({m.period})
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Time series sparkline cards */}
        <Typography
          sx={{ fontSize: '0.82rem', fontWeight: 700, color: textColor, mb: 1.5 }}
        >
          90-Day Accuracy Trends
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {metricKeys.map((mk) => {
            const series = aiMetricsTimeSeries[mk.key];
            const currentVal = series && series.length > 0 ? series[series.length - 1].value : 0;
            return (
              <Grid item xs={12} sm={6} key={mk.key}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${borderColor}`,
                    bgcolor: cardBg,
                    boxShadow: darkMode
                      ? '0 2px 8px rgba(0,0,0,0.4)'
                      : '0 1px 4px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 0 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography
                        sx={{ fontSize: '0.75rem', fontWeight: 600, color: textSecondary }}
                      >
                        {mk.label}
                      </Typography>
                      <Typography
                        sx={{ fontSize: '0.95rem', fontWeight: 800, color: mk.color }}
                      >
                        {currentVal.toFixed(1)}%
                      </Typography>
                    </Stack>
                    <Sparkline data={series} color={mk.color} height={64} width="100%" />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Exception Pareto — horizontal bar chart */}
        <Typography
          sx={{ fontSize: '0.82rem', fontWeight: 700, color: textColor, mb: 1.5 }}
        >
          Exception Pareto (30 Days)
        </Typography>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${borderColor}`,
            bgcolor: cardBg,
            p: 2.5,
            mb: 2,
            boxShadow: darkMode
              ? '0 2px 8px rgba(0,0,0,0.4)'
              : '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {exceptionPareto.map((item, idx) => {
            const barColor = paretoColors[idx % paretoColors.length];
            return (
              <Box key={idx} sx={{ mb: idx < exceptionPareto.length - 1 ? 1.5 : 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.4 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: textColor }}>
                    {item.type}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: textColor }}>
                      {item.count}
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: textSecondary }}>
                      ({item.pct}%)
                    </Typography>
                  </Stack>
                </Stack>
                <Box
                  sx={{
                    width: '100%',
                    height: 10,
                    borderRadius: 5,
                    bgcolor: darkMode ? alpha(barColor, 0.1) : alpha(barColor, 0.08),
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${item.pct}%`,
                      height: '100%',
                      borderRadius: 5,
                      bgcolor: barColor,
                      transition: 'width 0.6s ease-out',
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Paper>

        {/* Vendor reliability DataGrid */}
        <Typography
          sx={{ fontSize: '0.82rem', fontWeight: 700, color: textColor, mb: 1.5 }}
        >
          Vendor Reliability Scores
        </Typography>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${borderColor}`,
            bgcolor: cardBg,
            overflow: 'hidden',
          }}
        >
          <DataGrid
            rows={vendorReliability.map((v, i) => ({ id: i + 1, ...v }))}
            columns={reliabilityColumns}
            autoHeight
            disableRowSelectionOnClick
            disableColumnMenu
            hideFooter
            rowHeight={48}
            sx={apTheme.getDataGridSx({ darkMode, clickable: false })}
          />
        </Paper>
      </Box>
    );
  };

  // ==============================
  //  TAB 3 — Compliance & Audit
  // ==============================

  const renderComplianceTab = () => {
    // Audit trail DataGrid columns
    const auditColumns = [
      {
        field: 'timestamp',
        headerName: 'Timestamp',
        width: 110,
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: textColor, fontFamily: 'monospace' }}>
            {params.row.timestamp}
          </Typography>
        ),
      },
      {
        field: 'action',
        headerName: 'Action',
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: textColor }}>
            {params.row.action}
          </Typography>
        ),
      },
      {
        field: 'document',
        headerName: 'Document',
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: NAVY_BLUE, fontFamily: 'monospace' }}>
            {params.row.document}
          </Typography>
        ),
      },
      {
        field: 'user',
        headerName: 'User',
        width: 110,
        sortable: false,
        renderCell: (params) => {
          const isAuto = params.row.user === 'AUTOPILOT';
          return (
            <Chip
              label={params.row.user}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
                ...(isAuto
                  ? {
                    bgcolor: alpha('#10b981', 0.1),
                    color: '#059669',
                    border: '1px solid',
                    borderColor: alpha('#059669', 0.2),
                  }
                  : params.row.user === 'SYSTEM'
                    ? {
                      bgcolor: alpha('#64748b', 0.1),
                      color: '#475569',
                      border: '1px solid',
                      borderColor: alpha('#64748b', 0.2),
                    }
                    : {
                      bgcolor: alpha(NAVY_BLUE, 0.1),
                      color: '#1565c0',
                      border: '1px solid',
                      borderColor: alpha('#1565c0', 0.2),
                    }
                ),
              }}
            />
          );
        },
      },
      {
        field: 'detail',
        headerName: 'Detail',
        flex: 1.5,
        minWidth: 220,
        sortable: false,
        renderCell: (params) => (
          <Typography
            sx={{ fontSize: '0.72rem', color: textSecondary, lineHeight: 1.4 }}
            noWrap
          >
            {params.row.detail}
          </Typography>
        ),
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 110,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => {
          const typeKey = params.row.type;
          const chipStyle = apTheme.chips.auditAction[typeKey] || {};
          return (
            <Chip
              label={typeKey.toUpperCase()}
              size="small"
              sx={{
                ...chipStyle,
                height: 22,
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            />
          );
        },
      },
    ];

    // Row tint based on type
    const getAuditRowBg = (type) => {
      if (type === 'autopilot') return darkMode ? alpha('#10b981', 0.04) : alpha('#10b981', 0.03);
      if (type === 'manual') return darkMode ? alpha(NAVY_BLUE, 0.04) : alpha(NAVY_BLUE, 0.03);
      if (type === 'exception') return darkMode ? alpha('#ef4444', 0.04) : alpha('#ef4444', 0.03);
      if (type === 'override') return darkMode ? alpha('#f59e0b', 0.04) : alpha('#f59e0b', 0.03);
      return 'transparent';
    };

    return (
      <Box>
        {/* Compliance summary */}
        <Typography
          sx={{ fontSize: '0.82rem', fontWeight: 700, color: textColor, mb: 1.5 }}
        >
          Compliance Rule Status
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {complianceSummary.map((rule, idx) => {
            const isWarning = rule.status === 'warning';
            const chipStyle = apTheme.chips.compliance[rule.status] || {};
            return (
              <Grid item xs={12} sm={6} key={idx}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${borderColor}`,
                    /* no accent border */
                    bgcolor: cardBg,
                    boxShadow: darkMode
                      ? '0 2px 8px rgba(0,0,0,0.4)'
                      : '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <ShieldIcon sx={{ fontSize: 16, color: isWarning ? '#d97706' : '#059669' }} />
                          <Typography
                            sx={{ fontSize: '0.78rem', fontWeight: 700, color: textColor }}
                          >
                            {rule.rule}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.8 }}>
                          <Chip
                            label={rule.status.toUpperCase()}
                            size="small"
                            sx={{
                              ...chipStyle,
                              height: 22,
                              fontSize: '0.62rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          />
                          {rule.violations > 0 && (
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#dc2626' }}>
                              {rule.violations} violation{rule.violations > 1 ? 's' : ''}
                            </Typography>
                          )}
                          {rule.violations === 0 && (
                            <Typography sx={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>
                              No violations
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                      <Typography sx={{ fontSize: '0.62rem', color: textSecondary, whiteSpace: 'nowrap' }}>
                        Last check: {rule.lastCheck}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Audit trail DataGrid */}
        <Typography
          sx={{ fontSize: '0.82rem', fontWeight: 700, color: textColor, mb: 1.5 }}
        >
          Recent Audit Trail
        </Typography>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${borderColor}`,
            bgcolor: cardBg,
            overflow: 'hidden',
          }}
        >
          <DataGrid
            rows={auditTrailRecent}
            columns={auditColumns}
            autoHeight
            disableRowSelectionOnClick
            disableColumnMenu
            hideFooter
            rowHeight={52}
            getRowClassName={(params) => `audit-row-${params.row.type}`}
            sx={{
              ...apTheme.getDataGridSx({ darkMode, clickable: false }),
              '& .audit-row-autopilot': {
                bgcolor: getAuditRowBg('autopilot'),
              },
              '& .audit-row-manual': {
                bgcolor: getAuditRowBg('manual'),
              },
              '& .audit-row-exception': {
                bgcolor: getAuditRowBg('exception'),
              },
              '& .audit-row-override': {
                bgcolor: getAuditRowBg('override'),
              },
            }}
          />
        </Paper>
      </Box>
    );
  };

  // ==============================
  //  MAIN RENDER
  // ==============================

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          color="inherit"
          onClick={onBack}
          sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}
        >
          CORE.AI
        </Link>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => onNavigate && onNavigate('landing')}
          sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}
        >
          AP.AI
        </Link>
        <Typography
          color={textColor}
          sx={{ fontSize: '0.85rem', fontWeight: 600 }}
        >
          Intelligence Dashboard
        </Typography>
      </Breadcrumbs>

      {/* Header bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          mb: 2,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          boxShadow: darkMode
            ? '0 2px 8px rgba(0,0,0,0.4)'
            : '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => onNavigate && onNavigate('landing')}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.78rem',
              color: TILE_COLOR,
              border: `1px solid ${alpha(TILE_COLOR, 0.3)}`,
              '&:hover': { bgcolor: alpha(TILE_COLOR, 0.08) },
            }}
          >
            Back
          </Button>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <InsightsIcon sx={{ fontSize: 22, color: TILE_COLOR }} />
              <Typography
                sx={{ fontSize: '0.95rem', fontWeight: 700, color: textColor }}
              >
                Intelligence Dashboard
              </Typography>
            </Stack>
            <Typography
              sx={{ fontSize: '0.72rem', color: textSecondary, mt: 0.3 }}
            >
              Personal tracker, AI learning metrics with accuracy trends, and compliance audit trail
            </Typography>
          </Box>
          <Chip
            label="LIVE"
            size="small"
            sx={{
              height: 22,
              fontSize: '0.62rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              bgcolor: alpha('#10b981', 0.12),
              color: '#059669',
              fontWeight: 700,
              border: '1px solid',
              borderColor: alpha('#059669', 0.2),
            }}
          />
        </Stack>
      </Paper>

      {/* Quick-Nav Chip Row */}
      <Paper
        elevation={0}
        sx={{
          px: 1.5, py: 0.75, mb: 1.5, borderRadius: 2,
          bgcolor: cardBg, border: `1px solid ${borderColor}`,
          display: 'flex', alignItems: 'center', gap: 1,
        }}
      >
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Navigate:
        </Typography>
        <Chip
          icon={<SmartToyIcon sx={{ fontSize: 13 }} />}
          label="Processing Center"
          size="small"
          onClick={() => onNavigate && onNavigate('processing-center')}
          sx={{
            height: 24, fontSize: '0.65rem', fontWeight: 600,
            bgcolor: alpha(TILE_COLOR, 0.06), color: TILE_COLOR,
            border: `1px solid ${alpha(TILE_COLOR, 0.15)}`,
            cursor: 'pointer',
            '&:hover': { bgcolor: alpha(TILE_COLOR, 0.14) },
            '& .MuiChip-icon': { color: TILE_COLOR },
          }}
        />
        <Chip
          icon={<GavelIcon sx={{ fontSize: 13 }} />}
          label="Exception Hub"
          size="small"
          onClick={() => onNavigate && onNavigate('exception-approval')}
          sx={{
            height: 24, fontSize: '0.65rem', fontWeight: 600,
            bgcolor: alpha(TILE_COLOR, 0.06), color: TILE_COLOR,
            border: `1px solid ${alpha(TILE_COLOR, 0.15)}`,
            cursor: 'pointer',
            '&:hover': { bgcolor: alpha(TILE_COLOR, 0.14) },
            '& .MuiChip-icon': { color: TILE_COLOR },
          }}
        />
      </Paper>

      {/* Tab bar */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {tabs.map(t => (
          <Button
            key={t.key}
            size="small"
            onClick={() => setActiveTab(t.key)}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: activeTab === t.key ? 700 : 500,
              fontSize: '0.72rem',
              color: activeTab === t.key ? '#fff' : textSecondary,
              bgcolor: activeTab === t.key ? TILE_COLOR : 'transparent',
              border: activeTab === t.key ? 'none' : `1px solid ${borderColor}`,
              '&:hover': {
                bgcolor: activeTab === t.key ? TILE_COLOR : alpha(TILE_COLOR, 0.08),
              },
            }}
          >
            {t.label}
          </Button>
        ))}
      </Stack>

      {/* Tab content */}
      {activeTab === 'tracker' && renderTrackerTab()}
      {activeTab === 'ai-learning' && renderAILearningTab()}
      {activeTab === 'compliance' && renderComplianceTab()}
    </Box>
  );
};

export default IntelligenceDashboard;
