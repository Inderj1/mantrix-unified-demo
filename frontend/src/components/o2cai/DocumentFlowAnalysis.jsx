import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  alpha,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  AccountTree as AccountTreeIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  LocalShipping as DeliveryIcon,
  Receipt as BillingIcon,
  Payment as PaymentIcon,
  ShoppingCart as OrderIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import o2cTheme from './o2cTheme';

// Primary blue color
const PRIMARY_BLUE = '#002352';
const ACCENT_BLUE = '#1976d2';

// Flow navigation steps
const flowSteps = [
  { id: 'executive-command-center', num: 1, label: 'Executive Overview', status: 'complete' },
  { id: 'sales-area-intelligence', num: 2, label: 'Sales Areas', status: 'complete' },
  { id: 'customer-intelligence', num: 3, label: 'Customers', status: 'complete' },
  { id: 'document-flow-analysis', num: 4, label: 'Document Flow', status: 'active' },
  { id: 'transaction-drilldown', num: 5, label: 'Transactions', status: 'pending' },
];

// KPI Data
const kpiData = [
  { label: 'Sales Orders', value: '18,429', color: PRIMARY_BLUE, trend: 'YTD 2026' },
  { label: 'Deliveries', value: '17,842', color: '#059669', trend: '96.8% fulfilled' },
  { label: 'Invoices', value: '17,156', color: ACCENT_BLUE, trend: '96.2% billed' },
  { label: 'Payments', value: '14,892', color: '#d97706', trend: '86.8% collected' },
  { label: 'Happy Path %', value: '87.4%', color: '#059669', trend: '+2.1%' },
  { label: 'Median Cycle', value: '4.2 days', color: '#d97706', trend: '-0.3 days' },
];

// Process Flow nodes
const processNodes = [
  { id: 'SO', label: 'Sales Order', icon: OrderIcon, count: '18,429', value: '$147.2M', color: PRIMARY_BLUE },
  { id: 'DL', label: 'Delivery', icon: DeliveryIcon, count: '17,842', value: '$142.8M', color: '#059669' },
  { id: 'BL', label: 'Billing', icon: BillingIcon, count: '17,156', value: '$138.4M', color: ACCENT_BLUE },
  { id: 'PY', label: 'Payment', icon: PaymentIcon, count: '14,892', value: '$118.6M', color: '#d97706' },
];

const processArrows = [
  { time: '0.8 days', target: '1.0d', ok: true },
  { time: '0.4 days', target: '0.5d', ok: true },
  { time: '39.2 days', target: '30d', ok: false },
];

// Conformance data
const conformanceData = [
  { label: 'Happy Path (SO→DL→BL→PY)', value: '87.4%', pct: 87.4, color: '#059669' },
  { label: 'Partial Delivery', value: '8.2%', pct: 8.2, color: '#d97706' },
  { label: 'Returns/Credits', value: '3.2%', pct: 3.2, color: '#dc2626' },
  { label: 'Other Variants', value: '1.2%', pct: 1.2, color: '#64748b' },
];

// Process variants
const variantRows = [
  { id: 1, rank: 1, path: 'SO → DL → BL → PY', desc: 'Happy path • Standard flow', cases: 16102, avgCycle: '3.8d', color: '#059669' },
  { id: 2, rank: 2, path: 'SO → DL₁ → DL₂ → BL → PY', desc: 'Partial delivery • 2 shipments', cases: 1512, avgCycle: '6.2d', color: '#d97706' },
  { id: 3, rank: 3, path: 'SO → DL → BL → CR → PY', desc: 'Credit memo issued', cases: 421, avgCycle: '12.4d', color: '#dc2626' },
  { id: 4, rank: 4, path: 'SO → DL → RT → BL → PY', desc: 'Return before billing', cases: 168, avgCycle: '18.1d', color: '#dc2626' },
  { id: 5, rank: 5, path: 'SO → ✗ (Blocked)', desc: 'Credit block • No delivery', cases: 226, avgCycle: '—', color: '#dc2626' },
];

// Bottlenecks
const bottlenecks = [
  {
    type: 'critical',
    title: 'Payment Collection Delay',
    impact: '+9.2 days above target',
    text: 'Billing→Payment stage averaging 39.2 days vs 30-day target. Root cause: 847 invoices in APAC region with average 56 days to payment. Credit class B3 customers responsible for 62% of delay.',
  },
  {
    type: 'warning',
    title: 'Partial Delivery Pattern',
    impact: '+2.4 days cycle impact',
    text: '8.2% of orders require multiple deliveries. Pattern detected: Materials M-4821, M-5102, M-6421 from Plant 2000 (Frankfurt) frequently split.',
  },
];

// Cycle time distribution
const cycleDistribution = [
  { label: '0-2d', value: 4200, color: '#059669' },
  { label: '2-4d', value: 6800, color: '#059669' },
  { label: '4-6d', value: 4100, color: '#059669' },
  { label: '6-8d', value: 1800, color: '#d97706' },
  { label: '8-10d', value: 900, color: '#d97706' },
  { label: '10+d', value: 629, color: '#dc2626' },
];

const DocumentFlowAnalysis = ({ onBack, darkMode = false, onNavigate }) => {
  const [selectedVariant, setSelectedVariant] = useState(1);

  const getStatusChip = (status) => {
    const config = {
      complete: { label: '✓', bgcolor: alpha('#10b981', 0.12), color: '#059669' },
      active: { label: '4', bgcolor: alpha(PRIMARY_BLUE, 0.12), color: PRIMARY_BLUE },
      pending: { label: '5', bgcolor: alpha('#64748b', 0.12), color: '#64748b' },
    };
    const c = config[status] || config.pending;
    return c;
  };

  const variantColumns = [
    {
      field: 'rank',
      headerName: '#',
      width: 50,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: PRIMARY_BLUE, fontSize: '0.75rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'path',
      headerName: 'PROCESS PATH',
      flex: 1.5,
      minWidth: 180,
      renderCell: (params) => (
        <Box>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
            {params.value}
          </Typography>
          <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>
            {params.row.desc}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'cases',
      headerName: 'CASES',
      width: 90,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: params.row.color, fontSize: '0.75rem' }}>
          {params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'avgCycle',
      headerName: 'AVG CYCLE',
      width: 90,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', fontSize: '0.75rem' }}>
          {params.value}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          background: darkMode
            ? 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)'
            : o2cTheme.bannerGradient,
          borderBottom: `2px solid ${darkMode ? alpha(ACCENT_BLUE, 0.3) : alpha(ACCENT_BLUE, 0.2)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={onBack} size="small" sx={{ color: darkMode ? '#e2e8f0' : PRIMARY_BLUE }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: darkMode ? '#e2e8f0' : PRIMARY_BLUE }}>
                Document Flow Analysis
              </Typography>
              <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Process Mining • Variants • Bottleneck Detection
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Step 4 of 5"
            size="small"
            sx={{
              bgcolor: alpha(PRIMARY_BLUE, 0.12),
              color: PRIMARY_BLUE,
              fontWeight: 600,
            }}
          />
        </Box>
      </Paper>

      {/* Flow Navigation */}
      <Box sx={{ px: 2, py: 1, bgcolor: darkMode ? '#0d1117' : '#f8fafc', borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center' }}>
          {flowSteps.map((step, idx) => {
            const chipConfig = getStatusChip(step.status);
            return (
              <React.Fragment key={step.id}>
                <Chip
                  label={`${step.status === 'complete' ? '✓' : step.num}. ${step.label}`}
                  size="small"
                  onClick={() => step.status !== 'active' && onNavigate && onNavigate(step.id)}
                  sx={{
                    bgcolor: chipConfig.bgcolor,
                    color: chipConfig.color,
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    cursor: step.status === 'active' ? 'default' : 'pointer',
                    border: step.status === 'active' ? `1px solid ${PRIMARY_BLUE}` : 'none',
                    '&:hover': step.status !== 'active' ? {
                      bgcolor: alpha(chipConfig.color, 0.2),
                    } : {},
                  }}
                />
                {idx < flowSteps.length - 1 && (
                  <Typography sx={{ color: darkMode ? '#475569' : '#94a3b8', fontSize: '0.75rem' }}>→</Typography>
                )}
              </React.Fragment>
            );
          })}
        </Box>
      </Box>

      {/* KPI Strip */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: darkMode ? '#0d1117' : '#f8fafc', borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}` }}>
        <Grid container spacing={1.5}>
          {kpiData.map((kpi, index) => (
            <Grid item xs={2} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  textAlign: 'center',
                  bgcolor: darkMode ? '#161b22' : 'white',
                  border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
                  borderRadius: 1,
                }}
              >
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: kpi.color }}>
                  {kpi.value}
                </Typography>
                <Typography sx={{ fontSize: '0.55rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase', mt: 0.5 }}>
                  {kpi.label}
                </Typography>
                <Typography sx={{ fontSize: '0.6rem', color: kpi.trend.includes('+') || kpi.trend.includes('-') ? '#059669' : darkMode ? '#8b949e' : '#64748b', mt: 0.5 }}>
                  {kpi.trend}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Process Flow Visualization */}
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            bgcolor: darkMode ? '#161b22' : 'white',
            border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 1.5, borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`, bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountTreeIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} />
              End-to-End Document Flow
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#64748b', mt: 0.5 }}>
              Sales Order → Delivery → Billing → Payment (VBFA document flow)
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            {/* Process Flow Diagram */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              bgcolor: darkMode ? '#0d1117' : '#f8fafc',
              borderRadius: 2,
              mb: 2,
            }}>
              {processNodes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(node.color, 0.12),
                      border: `2px solid ${alpha(node.color, 0.5)}`,
                    }}>
                      <node.icon sx={{ fontSize: 24, color: node.color }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b' }}>{node.label}</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>{node.count} docs</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: PRIMARY_BLUE }}>{node.value}</Typography>
                  </Box>
                  {idx < processNodes.length - 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: processArrows[idx].ok ? '#059669' : '#dc2626' }}>
                        {processArrows[idx].time}
                      </Typography>
                      <Box sx={{
                        width: 60,
                        height: 2,
                        bgcolor: processArrows[idx].ok ? '#059669' : '#dc2626',
                        position: 'relative',
                      }} />
                      <Typography sx={{ fontSize: '0.5rem', color: processArrows[idx].ok ? (darkMode ? '#8b949e' : '#64748b') : '#dc2626' }}>
                        Target: {processArrows[idx].target}
                      </Typography>
                    </Box>
                  )}
                </React.Fragment>
              ))}
            </Box>

            {/* Conformance Cards */}
            <Grid container spacing={1.5}>
              {conformanceData.map((conf, idx) => (
                <Grid item xs={3} key={idx}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      bgcolor: darkMode ? '#0d1117' : '#f8fafc',
                      border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
                      borderRadius: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: conf.color }}>{conf.value}</Typography>
                    <Typography sx={{ fontSize: '0.55rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase', mt: 0.5 }}>{conf.label}</Typography>
                    <Box sx={{ height: 4, bgcolor: darkMode ? '#21262d' : '#e2e8f0', borderRadius: 1, mt: 1, overflow: 'hidden' }}>
                      <Box sx={{ width: `${conf.pct}%`, height: '100%', bgcolor: conf.color, borderRadius: 1 }} />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>

        {/* Two Column Layout - Variants & Bottlenecks */}
        <Grid container spacing={2}>
          {/* Left Panel: Variants */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                bgcolor: darkMode ? '#161b22' : 'white',
                border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 1.5, borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`, bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} />
                  Process Variants
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#64748b', mt: 0.5 }}>
                  Discovered execution paths
                </Typography>
              </Box>
              <Box sx={{ p: 1.5 }}>
                <DataGrid
                  rows={variantRows}
                  columns={variantColumns}
                  density="compact"
                  hideFooter
                  disableColumnMenu
                  disableRowSelectionOnClick
                  onRowClick={(params) => setSelectedVariant(params.row.rank)}
                  sx={{
                    ...o2cTheme.getDataGridSx({ darkMode, clickable: true }),
                    height: 220,
                    '& .MuiDataGrid-cell': { fontSize: '0.7rem' },
                    '& .MuiDataGrid-columnHeaderTitle': { fontSize: '0.65rem' },
                    '& .MuiDataGrid-row': {
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: darkMode ? alpha(PRIMARY_BLUE, 0.1) : alpha(PRIMARY_BLUE, 0.08),
                      },
                    },
                  }}
                />

                {/* Cycle Time Distribution */}
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                      Cycle Time Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, fontSize: '0.55rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: '#059669' }} />
                        <span style={{ color: darkMode ? '#8b949e' : '#94a3b8' }}>On-time</span>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: '#d97706' }} />
                        <span style={{ color: darkMode ? '#8b949e' : '#94a3b8' }}>Delayed</span>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: '#dc2626' }} />
                        <span style={{ color: darkMode ? '#8b949e' : '#94a3b8' }}>Critical</span>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 80, gap: 0.5 }}>
                    {cycleDistribution.map((bar, idx) => (
                      <Box key={idx} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{
                          width: '100%',
                          height: `${(bar.value / 7000) * 100}%`,
                          bgcolor: bar.color,
                          borderRadius: '4px 4px 0 0',
                        }} />
                        <Typography sx={{ fontSize: '0.5rem', color: darkMode ? '#8b949e' : '#64748b', mt: 0.5 }}>{bar.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Panel: Bottlenecks */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                bgcolor: darkMode ? '#161b22' : 'white',
                border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 1.5, borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`, bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                  Bottlenecks & AI Insights
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#64748b', mt: 0.5 }}>
                  Process mining findings
                </Typography>
              </Box>
              <Box sx={{ p: 1.5 }}>
                {bottlenecks.map((bn, idx) => (
                  <Paper
                    key={idx}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      bgcolor: bn.type === 'critical'
                        ? (darkMode ? alpha('#dc2626', 0.1) : alpha('#ef4444', 0.08))
                        : (darkMode ? alpha('#d97706', 0.1) : alpha('#f59e0b', 0.08)),
                      border: `1px solid ${bn.type === 'critical' ? alpha('#dc2626', 0.3) : alpha('#d97706', 0.3)}`,
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: bn.type === 'critical' ? '#dc2626' : '#d97706' }}>
                        {bn.type === 'critical' ? '⚠️' : '⚡'} {bn.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6rem', color: '#d97706', fontWeight: 600 }}>{bn.impact}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#e2e8f0' : '#475569', lineHeight: 1.5 }}>{bn.text}</Typography>
                    <Box sx={{ mt: 1.5 }}>
                      <Button
                        size="small"
                        sx={{
                          fontSize: '0.6rem',
                          py: 0.5,
                          px: 1.5,
                          bgcolor: bn.type === 'critical' ? alpha('#dc2626', 0.2) : alpha('#d97706', 0.2),
                          color: bn.type === 'critical' ? '#dc2626' : '#d97706',
                          '&:hover': {
                            bgcolor: bn.type === 'critical' ? alpha('#dc2626', 0.3) : alpha('#d97706', 0.3),
                          },
                        }}
                      >
                        {bn.type === 'critical' ? 'View Affected Invoices →' : 'Analyze Materials →'}
                      </Button>
                    </Box>
                  </Paper>
                ))}

                {/* AI Recommendation */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor: darkMode ? alpha('#059669', 0.1) : alpha('#10b981', 0.08),
                    border: `1px solid ${alpha('#059669', 0.3)}`,
                    borderRadius: 1,
                    mt: 2,
                  }}
                >
                  <Typography sx={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SmartToyIcon sx={{ fontSize: 14 }} />
                    AI Recommendation
                  </Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#e2e8f0' : '#475569', lineHeight: 1.5 }}>
                    <strong style={{ color: '#059669' }}>Implement automated dunning:</strong> Analysis of 14,892 payment records shows customers who receive automated payment reminders at Day 7 and Day 21 pay 4.8 days faster on average. Projected DSO improvement: 3.2 days = $1.8M working capital release.
                  </Typography>
                </Paper>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderTop: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
          bgcolor: darkMode ? '#0d1117' : '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>
            SAP Tables:
          </Typography>
          {['VBFA', 'VBAK', 'VBAP', 'LIKP', 'LIPS', 'VBRK', 'VBRP', 'BSID', 'BSAD'].map((table) => (
            <Chip key={table} label={table} size="small" sx={{ fontSize: '0.55rem', height: 18 }} />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
            onClick={() => onNavigate && onNavigate('customer-intelligence')}
            sx={{
              fontSize: '0.7rem',
              textTransform: 'none',
              borderColor: darkMode ? '#21262d' : '#e2e8f0',
              color: darkMode ? '#8b949e' : '#64748b',
            }}
          >
            Customers
          </Button>
          <Button
            variant="contained"
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            onClick={() => onNavigate && onNavigate('transaction-drilldown')}
            sx={{
              fontSize: '0.7rem',
              textTransform: 'none',
              bgcolor: PRIMARY_BLUE,
              '&:hover': { bgcolor: '#074080' },
            }}
          >
            Drill into Transactions
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DocumentFlowAnalysis;
