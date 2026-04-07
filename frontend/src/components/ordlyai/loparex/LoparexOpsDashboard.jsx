import React from 'react';
import {
  Box, Typography, Chip, Paper, Grid, Stack, Breadcrumbs, Link, Button, LinearProgress, Tabs, Tab,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { MODULE_COLOR, BRAND, SEMANTIC } from '../../../config/brandColors';

// ─── Color Constants ───
const NAVY = BRAND.navy.main;
const GREEN = SEMANTIC.success.main;
const GREEN_DARK = SEMANTIC.success.dark;
const AMBER = '#d97706';
const RED = SEMANTIC.error.main;
const PURPLE = '#6436C8';
const MUTED = '#7A90A8';

// ─── Mock Data (ported from HTML) ───
const KPI_DATA = [
  { lbl: 'Orders Received', val: '126', sub: 'This week, all channels', trend: '+14% vs prior week', up: true, accent: NAVY },
  { lbl: 'Auto-Created', val: '104', sub: 'Touchless SAP SO creation', trend: '82.5% automation rate', up: true, accent: GREEN },
  { lbl: 'Avg. Lead Time Saved', val: '\u22123.4d', sub: 'vs. pre-Ordly baseline', trend: '+0.6d improvement this week', up: true, accent: PURPLE },
  { lbl: 'Margin Uplift', val: '$27.4K', sub: 'Optimal fulfillment decisions', trend: '+$4.1K vs prior week', up: true, accent: AMBER },
];

const VOLUME_DATA = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  received:   [18, 22, 15, 27, 31, 8, 5],
  auto:       [14, 18, 12, 23, 26, 7, 4],
  exceptions: [2,  1,  3,  2,  3,  1, 1],
};

const AUTOMATION_DATA = [
  { lbl: 'Auto-Created (Touchless)', val: 104, pct: 82.5, color: NAVY },
  { lbl: 'Human Review Required', val: 13, pct: 10.3, color: AMBER },
  { lbl: 'Manual Override (CSR)', val: 9, pct: 7.1, color: MUTED },
];

const LEAD_TIME_DATA = [
  { lbl: 'Standard Orders', before: 6.8, after: 3.6 },
  { lbl: 'Strategic Accounts', before: 5.2, after: 0.4 },
  { lbl: 'Expedited Orders', before: 4.1, after: 2.0 },
  { lbl: 'EDI / Portal', before: 2.8, after: 1.3 },
];

const MARGIN_DATA = [
  { lbl: 'Optimal Plant Selection', desc: 'PL01 vs PL02/PL03 routing decisions', val: 12400 },
  { lbl: 'Substitution Intelligence', desc: 'Margin-preserving material substitutions', val: 8200 },
  { lbl: 'Avoided Low-Margin Routing', desc: 'Rejected suboptimal fulfillment paths', val: 6800 },
];

const FUNNEL_DATA = [
  { lbl: 'Received', sub: 'All channels combined', val: 126, pct: 100, color: NAVY },
  { lbl: 'Validated', sub: 'Passed SAP checks', val: 119, pct: 94.4, color: GREEN_DARK },
  { lbl: 'Auto-Created', sub: 'Touchless SO creation', val: 104, pct: 82.5, color: GREEN },
  { lbl: 'Human Review', sub: 'Exception or approval needed', val: 22, pct: 17.5, color: AMBER },
  { lbl: 'Failed / Cancelled', sub: 'Material or credit block', val: 3, pct: 2.4, color: RED },
];

const MINI_STATS = [
  { lbl: 'Touchless Rate', val: '82.5%', sub: '\u2191 from 71% pre-Ordly', col: GREEN },
  { lbl: 'First-Pass Rate', val: '94.4%', sub: 'SAP validation success', col: NAVY },
  { lbl: 'Avg. Cycle Time', val: '4.2m', sub: 'PO received \u2192 SO created', col: PURPLE },
  { lbl: 'Exception Rate', val: '10.3%', sub: '\u2193 from 18% pre-Ordly', col: AMBER },
];

const TIER_DATA = [
  { tier: 'Tier 1', name: 'Strategic (Bosch, GE, Honeywell)', cnt: 14, fill: 98.2, dso: 18, score: 97, change: '+1.8%', tierColor: PURPLE },
  { tier: 'Tier 2', name: 'Premium Partners', cnt: 31, fill: 94.5, dso: 28, score: 91, change: '+3.2%', tierColor: NAVY },
  { tier: 'Tier 3', name: 'Standard Accounts', cnt: 58, fill: 89.1, dso: 35, score: 84, change: '+5.4%', tierColor: AMBER },
  { tier: 'Tier 4', name: 'New / Transactional', cnt: 23, fill: 82.3, dso: 42, score: 76, change: '+8.1%', tierColor: MUTED },
];

const PRODUCTIVITY_DATA = [
  { lbl: 'CSR Hours Saved', val: '38.4 hrs', badge: 'This week', badgeColor: GREEN },
  { lbl: 'Orders per CSR', val: '31.5', badge: '\u2191 from 19', badgeColor: NAVY },
  { lbl: 'Manual Keystrokes Avoided', val: '14,200', badge: 'Automated', badgeColor: PURPLE },
  { lbl: 'Avg. Exception Close Time', val: '12.3 min', badge: '\u2193 34%', badgeColor: GREEN },
];

const EXCEPTION_DATA = [
  { lbl: 'Low OCR Confidence', val: 7, color: AMBER },
  { lbl: 'Material Mapping Ambiguous', val: 4, color: RED },
  { lbl: 'Pricing / Contract Mismatch', val: 4, color: PURPLE },
  { lbl: 'Credit Near-Limit', val: 3, color: NAVY },
  { lbl: 'Stock Shortfall', val: 3, color: MUTED },
  { lbl: 'Customer-Specific Rule', val: 1, color: GREEN },
];

const AR_DATA = [
  { lbl: 'Orders Screened for Credit Risk', val: '126', sub: 'All orders evaluated via FSCM/UKM' },
  { lbl: 'Near Credit-Limit Flagged', val: '6', sub: 'Routed for review before SO creation' },
  { lbl: 'High-Risk Accounts Blocked', val: '2', sub: 'Prevented bad debt exposure' },
  { lbl: 'Strategic Account Override', val: '1', sub: 'Senior approval applied (GE Aviation)' },
  { lbl: 'Avg. DSO (Ordly-screened)', val: '28.1d', sub: 'vs 34.5d pre-Ordly baseline' },
  { lbl: 'Est. Bad Debt Avoidance', val: '$18,400', sub: 'Via proactive AR risk screening' },
];

// ─── Section Card Wrapper ───
const SectionCard = ({ title, subtitle, children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 2.5,
      border: '1px solid',
      borderColor: 'rgba(0,0,0,0.08)',
      boxShadow: '0 1px 4px rgba(12,31,63,0.07)',
      ...sx,
    }}
  >
    {title && (
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0C1F3F', mb: subtitle ? 0.5 : 2 }}>
        {title}
      </Typography>
    )}
    {subtitle && (
      <Typography sx={{ fontSize: 11, color: MUTED, mb: 2 }}>
        {subtitle}
      </Typography>
    )}
    {children}
  </Paper>
);

// ─── Volume Chart (inline SVG) ───
const VolumeChart = ({ darkMode }) => {
  const d = VOLUME_DATA;
  const W = 600, H = 200, padL = 30, padR = 10, padT = 14, padB = 28;
  const cW = W - padL - padR;
  const cH = H - padT - padB;
  const maxV = Math.max(...d.received) + 4;
  const n = d.days.length;
  const grpW = cW / n;
  const barW = Math.min(16, grpW * 0.28);
  const gap = 3;
  const sy = v => padT + cH - (v / maxV) * cH;
  const gridLines = [0, 10, 20, 30].filter(v => v <= maxV + 2);
  const textColor = darkMode ? '#8b949e' : MUTED;
  const gridColor = darkMode ? 'rgba(255,255,255,0.1)' : '#E2E7EF';
  const receivedColor = NAVY;
  const autoColor = GREEN;
  const excColor = AMBER;

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: '100%', display: 'block' }}>
        {/* Legend */}
        <g transform="translate(0,18)">
          <rect x="0" y="0" width="10" height="10" rx="2" fill={receivedColor} />
          <text x="14" y="9" fontSize="10" fill={textColor}>Received</text>
          <rect x="78" y="0" width="10" height="10" rx="2" fill={autoColor} />
          <text x="92" y="9" fontSize="10" fill={textColor}>Auto-Created</text>
          <rect x="178" y="0" width="10" height="10" rx="2" fill={excColor} />
          <text x="192" y="9" fontSize="10" fill={textColor}>Exceptions</text>
        </g>
        {/* Grid lines */}
        {gridLines.map(v => (
          <g key={v}>
            <line x1={padL} y1={sy(v)} x2={W - padR} y2={sy(v)} stroke={gridColor} strokeWidth="1" />
            <text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={textColor}>{v}</text>
          </g>
        ))}
        {/* Bars */}
        {d.days.map((day, i) => {
          const cx = padL + i * grpW + grpW / 2;
          const x0 = cx - barW - gap;
          const x1 = cx;
          const x2 = cx + barW + gap;
          const hR = (d.received[i] / maxV) * cH;
          const hA = (d.auto[i] / maxV) * cH;
          const hE = (d.exceptions[i] / maxV) * cH;
          return (
            <g key={day}>
              <rect x={x0 - barW / 2} y={sy(d.received[i])} width={barW} height={hR} rx="2" fill={receivedColor} opacity="0.85" />
              <rect x={x1 - barW / 2} y={sy(d.auto[i])} width={barW} height={hA} rx="2" fill={autoColor} />
              <rect x={x2 - barW / 2} y={sy(d.exceptions[i])} width={barW} height={hE} rx="2" fill={excColor} />
              <text x={cx} y={H - 6} textAnchor="middle" fontSize="11" fill={textColor}>{day}</text>
            </g>
          );
        })}
      </svg>
    </Box>
  );
};

// ─── Donut Chart (inline SVG) ───
const DonutChart = ({ darkMode }) => {
  const data = AUTOMATION_DATA;
  const total = data.reduce((a, d) => a + d.val, 0);
  const r = 52, cx = 70, cy = 70, sw = 14;
  const circ = 2 * Math.PI * r;
  const textColor = darkMode ? '#e6edf3' : '#0C1F3F';

  let offset = 0;
  const arcs = data.map((d, i) => {
    const len = (d.val / total) * circ;
    const dashArray = `${len - 2} ${circ - len + 2}`;
    const arc = (
      <circle
        key={i}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={d.color}
        strokeWidth={sw}
        strokeDasharray={dashArray}
        strokeDashoffset={-offset}
        strokeLinecap="butt"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
    offset += len;
    return arc;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 1 }}>
      {/* Donut chart centered */}
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={darkMode ? 'rgba(255,255,255,0.1)' : '#E2E7EF'} strokeWidth={sw} />
        {arcs}
        <text x={cx} y={cy - 7} textAnchor="middle" fontSize="22" fontWeight="700" fill={textColor}>82.5</text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize="11" fill={MUTED}>% touchless</text>
      </svg>
      {/* Legend rows */}
      <Stack spacing={0.75} sx={{ width: '100%' }}>
        {data.map((d, i) => (
          <Box key={i} sx={{
            display: 'flex', alignItems: 'center', gap: 1.25,
            p: '8px 12px', borderRadius: 1.5,
            bgcolor: darkMode ? 'rgba(255,255,255,0.04)' : alpha(d.color, 0.04),
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : alpha(d.color, 0.1)}`,
          }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 11, color: darkMode ? '#8b949e' : '#3D5066', flex: 1 }}>{d.lbl}</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: textColor }}>{d.val}</Typography>
            <Typography sx={{ fontSize: 10, color: MUTED, minWidth: 32, textAlign: 'right' }}>{d.pct}%</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

// ─── Main Dashboard Component ───
const LoparexOpsDashboard = ({ onBack, darkMode = false }) => {
  const bgColor = darkMode ? '#0d1117' : '#F1F4F8';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textPrimary = darkMode ? '#e6edf3' : '#0C1F3F';
  const textSecondary = darkMode ? '#8b949e' : '#3D5066';
  const borderColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const surfaceBg = darkMode ? '#21262d' : '#F8F9FB';
  const gridLineColor = darkMode ? 'rgba(255,255,255,0.1)' : '#E2E7EF';

  const maxLT = Math.max(...LEAD_TIME_DATA.map(d => d.before));
  const maxExc = Math.max(...EXCEPTION_DATA.map(d => d.val));
  const marginTotal = MARGIN_DATA.reduce((a, d) => a + d.val, 0);

  const CARD_HEIGHT = 420;
  const cardSx = {
    p: 2.5,
    borderRadius: 2.5,
    border: '1px solid',
    borderColor,
    bgcolor: cardBg,
    boxShadow: darkMode ? 'none' : '0 1px 4px rgba(12,31,63,0.07)',
  };
  const scrollCardSx = {
    ...cardSx,
    height: CARD_HEIGHT,
    overflow: 'auto',
    '&::-webkit-scrollbar': { width: 4 },
    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
    '&::-webkit-scrollbar-thumb': { bgcolor: borderColor, borderRadius: 2, '&:hover': { bgcolor: alpha('#000', 0.15) } },
  };

  return (
    <Box sx={{ bgcolor: bgColor, minHeight: '100vh', pb: 4 }}>
      {/* ─── Breadcrumb Bar ─── */}
      <Box sx={{
        px: 3, py: 1.5,
        bgcolor: cardBg,
        borderBottom: '1px solid',
        borderColor,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 13,
            color: NAVY,
            borderRadius: 2,
            '&:hover': { bgcolor: alpha(NAVY, 0.08) },
          }}
        >
          Back
        </Button>
        <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 16 }} />} sx={{ fontSize: 13 }}>
          <Link
            underline="hover"
            sx={{ fontSize: 13, fontWeight: 600, color: NAVY, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
            onClick={onBack}
          >
            ORDER SYNC
          </Link>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>D1: Ops</Typography>
        </Breadcrumbs>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{
            width: 7, height: 7, borderRadius: '50%', bgcolor: '#00D264',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
          }} />
          <Typography sx={{ fontSize: 11, color: MUTED }}>Updated 4 minutes ago</Typography>
        </Box>
      </Box>

      {/* ─── Page Content ─── */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, pt: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 1.75, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>
              Order Performance & Value Intelligence
            </Typography>
            <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.5 }}>
              Order-to-Cash &middot; SAP S/4HANA &middot; IBP-connected &middot; Last 7 days
            </Typography>
          </Box>
        </Box>

        {/* ─── KPI Cards ─── */}
        <Grid container spacing={1.75} sx={{ mb: 1.75 }}>
          {KPI_DATA.map((kpi, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper elevation={0} sx={cardSx}>
                <Typography sx={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: 0.8, color: MUTED, mb: 1.25,
                }}>
                  {kpi.lbl}
                </Typography>
                <Typography sx={{
                  fontSize: 20, fontWeight: 700, color: textPrimary,
                  lineHeight: 1, mb: 0.75, letterSpacing: '-1px',
                }}>
                  {kpi.val}
                </Typography>
                <Typography sx={{ fontSize: 11, color: textSecondary, mb: 1.25 }}>
                  {kpi.sub}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: 14, color: GREEN }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: GREEN }}>
                    {kpi.trend}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ─── Volume Chart + Automation Donut ─── */}
        <Grid container spacing={1.75} sx={{ mb: 1.75 }}>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={scrollCardSx}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: textPrimary, mb: 0.5 }}>
                Order Volume — 7-Day Trend
              </Typography>
              <Typography sx={{ fontSize: 11, color: MUTED, mb: 2 }}>
                Received vs. Auto-Created vs. Exceptions by day
              </Typography>
              <VolumeChart darkMode={darkMode} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={scrollCardSx}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: textPrimary, mb: 0.5 }}>
                Automation Breakdown
              </Typography>
              <Typography sx={{ fontSize: 11, color: MUTED, mb: 1 }}>
                Order processing disposition this week
              </Typography>
              <DonutChart darkMode={darkMode} />
            </Paper>
          </Grid>
        </Grid>

        {/* ─── Lead Time + Margin + Funnel ─── */}
        <Grid container spacing={1.75} sx={{ mb: 1.75 }}>
          {/* Lead Time */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={scrollCardSx}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: textPrimary, mb: 0.5 }}>
                Lead Time Impact
              </Typography>
              <Typography sx={{ fontSize: 11, color: MUTED, mb: 2 }}>
                Before Ordly vs. After Ordly (days)
              </Typography>
              <Stack spacing={1.75}>
                {LEAD_TIME_DATA.map((lt, i) => {
                  const delta = (lt.before - lt.after).toFixed(1);
                  const pctBefore = (lt.before / maxLT) * 100;
                  const pctAfter = (lt.after / maxLT) * 100;
                  return (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 500, color: textSecondary }}>{lt.lbl}</Typography>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: GREEN }}>{'\u2212'}{delta} days</Typography>
                      </Box>
                      <Stack spacing={0.4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: 9, color: MUTED, width: 42, textAlign: 'right', flexShrink: 0 }}>Before</Typography>
                          <Box sx={{ flex: 1, height: 8, bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F4F8', borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ width: `${pctBefore}%`, height: '100%', bgcolor: '#C8D4E0', borderRadius: 1 }} />
                          </Box>
                          <Typography sx={{ fontSize: 9, color: MUTED, width: 28, flexShrink: 0 }}>{lt.before}d</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: 9, color: MUTED, width: 42, textAlign: 'right', flexShrink: 0 }}>After</Typography>
                          <Box sx={{ flex: 1, height: 8, bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F4F8', borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ width: `${pctAfter}%`, height: '100%', bgcolor: GREEN, borderRadius: 1 }} />
                          </Box>
                          <Typography sx={{ fontSize: 9, color: GREEN, fontWeight: 700, width: 28, flexShrink: 0 }}>{lt.after}d</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>

          {/* Margin Intelligence */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={scrollCardSx}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: textPrimary, mb: 0.5 }}>
                Margin Intelligence
              </Typography>
              <Typography sx={{ fontSize: 11, color: MUTED, mb: 2 }}>
                Weekly uplift by decision source
              </Typography>
              <Stack spacing={1}>
                {MARGIN_DATA.map((m, i) => (
                  <Box key={i} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    p: '10px 12px', bgcolor: surfaceBg, borderRadius: 1.5,
                    border: '1px solid', borderColor,
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: textPrimary, mb: 0.25 }}>{m.lbl}</Typography>
                      <Typography sx={{ fontSize: 10, color: MUTED }}>{m.desc}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: GREEN }}>+${m.val.toLocaleString()}</Typography>
                  </Box>
                ))}
              </Stack>
              <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                p: '12px 14px', mt: 1.25,
                bgcolor: alpha(GREEN, 0.1),
                border: '1px solid',
                borderColor: alpha(GREEN, 0.3),
                borderRadius: 1.5,
              }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: GREEN }}>Total Weekly Margin Uplift</Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: GREEN }}>+${marginTotal.toLocaleString()}</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Processing Funnel */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={scrollCardSx}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: textPrimary, mb: 0.5 }}>
                Processing Funnel
              </Typography>
              <Typography sx={{ fontSize: 11, color: MUTED, mb: 2 }}>
                Where every order goes
              </Typography>
              <Stack spacing={1}>
                {FUNNEL_DATA.map((f, i) => (
                  <Box key={i} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    p: '10px 14px', bgcolor: surfaceBg,
                    border: '1px solid', borderColor, borderRadius: 1.5,
                  }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: f.color, width: 54, flexShrink: 0 }}>
                      {f.val}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: textPrimary }}>{f.lbl}</Typography>
                      <Typography sx={{ fontSize: 10, color: MUTED }}>{f.sub}</Typography>
                      <Box sx={{ mt: 0.5, height: 6, bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F4F8', borderRadius: 0.75, overflow: 'hidden' }}>
                        <Box sx={{ width: `${f.pct}%`, height: '100%', bgcolor: f.color, opacity: 0.7, borderRadius: 0.75 }} />
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: f.color, width: 42, textAlign: 'right', flexShrink: 0 }}>
                      {f.pct}%
                    </Typography>
                  </Box>
                ))}
              </Stack>
              {/* Mini Stats */}
              <Grid container spacing={1} sx={{ mt: 1.5 }}>
                {MINI_STATS.map((s, i) => (
                  <Grid item xs={6} key={i}>
                    <Box sx={{
                      bgcolor: surfaceBg, border: '1px solid', borderColor,
                      borderRadius: 1.5, p: '10px 12px',
                    }}>
                      <Typography sx={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                        {s.lbl}
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: s.col }}>
                        {s.val}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: MUTED, mt: 0.25 }}>
                        {s.sub}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* ─── Customer Tier Table + Productivity ─── */}
        <Grid container spacing={1.75} sx={{ mb: 1.75 }}>
          {/* Customer Tier Table */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={scrollCardSx}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: textPrimary, mb: 0.5 }}>
                Customer Centricity Performance
              </Typography>
              <Typography sx={{ fontSize: 11, color: MUTED, mb: 2 }}>
                Fill rate, DSO, and service score by customer tier — powered by KNVV segmentation + ACDOCA
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="thead">
                    <Box component="tr">
                      {['Tier', 'Account Segment', 'Orders', 'Fill Rate', 'DSO (days)', 'Service Score', 'vs. Pre-Ordly'].map(h => (
                        <Box component="th" key={h} sx={{
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: 0.7, color: MUTED, textAlign: 'left',
                          p: '8px 12px', borderBottom: '2px solid', borderColor: gridLineColor,
                        }}>
                          {h}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {TIER_DATA.map((t, i) => {
                      const fillColor = t.fill >= 95 ? GREEN : t.fill >= 88 ? NAVY : AMBER;
                      const scoreColor = t.score >= 95 ? GREEN : t.score >= 88 ? NAVY : AMBER;
                      return (
                        <Box component="tr" key={i} sx={{
                          '&:hover td': { bgcolor: surfaceBg },
                          '& td': { p: '10px 12px', fontSize: 12, borderBottom: '1px solid', borderColor },
                          '&:last-child td': { borderBottom: 'none' },
                        }}>
                          <Box component="td">
                            <Chip
                              label={t.tier}
                              size="small"
                              sx={{
                                fontSize: 10, fontWeight: 700, height: 22,
                                bgcolor: alpha(t.tierColor, 0.1),
                                color: t.tierColor,
                              }}
                            />
                          </Box>
                          <Box component="td" sx={{ fontSize: 11, color: textSecondary }}>{t.name}</Box>
                          <Box component="td" sx={{ fontWeight: 500 }}>{t.cnt}</Box>
                          <Box component="td">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 80, height: 6, borderRadius: 0.75, overflow: 'hidden', bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F4F8' }}>
                                <Box sx={{ width: `${t.fill}%`, height: '100%', bgcolor: fillColor, borderRadius: 0.75 }} />
                              </Box>
                              <Typography sx={{ fontSize: 11, fontWeight: 500 }}>{t.fill}%</Typography>
                            </Box>
                          </Box>
                          <Box component="td" sx={{ fontWeight: 500 }}>{t.dso}</Box>
                          <Box component="td">
                            <Box sx={{
                              width: 36, height: 36, borderRadius: '50%',
                              border: '3px solid', borderColor: scoreColor,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 700, color: textPrimary,
                            }}>
                              {t.score}
                            </Box>
                          </Box>
                          <Box component="td" sx={{ color: GREEN, fontWeight: 700, fontSize: 12 }}>{t.change}</Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Productivity */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={scrollCardSx}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: textPrimary, mb: 0.5 }}>
                Team Productivity
              </Typography>
              <Typography sx={{ fontSize: 11, color: MUTED, mb: 2 }}>
                CSR efficiency gains this week
              </Typography>
              <Stack spacing={0.75}>
                {PRODUCTIVITY_DATA.map((p, i) => (
                  <Box key={i} sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    p: '8px 12px', borderRadius: 1.5,
                    bgcolor: surfaceBg, border: '1px solid', borderColor,
                  }}>
                    <Typography sx={{ fontSize: 11, color: textSecondary }}>{p.lbl}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>{p.val}</Typography>
                      <Chip
                        label={p.badge}
                        size="small"
                        sx={{
                          height: 20, fontSize: 9, fontWeight: 700,
                          bgcolor: alpha(p.badgeColor, 0.12),
                          color: p.badgeColor,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
              {/* Ordly vs Traditional callout */}
              <Box sx={{
                mt: 2, p: 1.75,
                background: `linear-gradient(135deg, ${NAVY}, #1A3560)`,
                borderRadius: 1.5,
                color: 'white',
              }}>
                <Typography sx={{
                  fontSize: 10, color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase', letterSpacing: 0.7, mb: 1,
                }}>
                  Ordly vs. Traditional Order Entry
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                  Traditional tools <strong style={{ color: 'white' }}>digitize the front door.</strong><br />
                  Ordly AI <strong style={{ color: '#00D264' }}>optimizes the decision at the front door.</strong>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* ─── Exception Analysis + AR ─── */}
        <Grid container spacing={1.75}>
          {/* Exception Root Cause */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={scrollCardSx}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: textPrimary, mb: 0.5 }}>
                Exception Root Cause Analysis
              </Typography>
              <Typography sx={{ fontSize: 11, color: MUTED, mb: 2 }}>
                Why orders required human review this week
              </Typography>
              <Stack spacing={1}>
                {EXCEPTION_DATA.map((d, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ width: 160, fontSize: 11, color: textSecondary, textAlign: 'right', flexShrink: 0 }}>
                      {d.lbl}
                    </Typography>
                    <Box sx={{ flex: 1, height: 10, bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F4F8', borderRadius: 1.25, overflow: 'hidden' }}>
                      <Box sx={{ width: `${(d.val / maxExc) * 100}%`, height: '100%', bgcolor: d.color, borderRadius: 1.25 }} />
                    </Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: d.color, width: 20 }}>
                      {d.val}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Box sx={{
                mt: 1.5, p: '10px 12px',
                bgcolor: alpha(AMBER, 0.1),
                border: '1px solid',
                borderColor: alpha(AMBER, 0.3),
                borderRadius: 1.5,
              }}>
                <Typography sx={{ fontSize: 11, color: AMBER }}>
                  <strong>Top fix:</strong> Improve PDF template parsing for low-confidence customers. Can reduce exceptions by ~35%.
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* AR & Commercial Quality */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={scrollCardSx}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: textPrimary, mb: 0.5 }}>
                AR & Commercial Quality
              </Typography>
              <Typography sx={{ fontSize: 11, color: MUTED, mb: 2 }}>
                Orders screened against credit and payment risk
              </Typography>
              <Grid container spacing={1}>
                {AR_DATA.map((s, i) => (
                  <Grid item xs={6} key={i}>
                    <Box sx={{
                      bgcolor: surfaceBg, border: '1px solid', borderColor,
                      borderRadius: 1.5, p: '12px 14px',
                    }}>
                      <Typography sx={{
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: 0.6, color: MUTED, mb: 0.75,
                      }}>
                        {s.lbl}
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: textPrimary, mb: 0.4 }}>
                        {s.val}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: MUTED }}>{s.sub}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {/* AR Shield callout */}
              <Box sx={{
                mt: 1.5, p: '12px 14px',
                background: `linear-gradient(135deg, ${alpha(GREEN, 0.1)}, ${alpha(NAVY, 0.08)})`,
                border: '1px solid',
                borderColor: alpha(GREEN, 0.3),
                borderRadius: 1.5,
              }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: GREEN, mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  Ordly AR Shield
                </Typography>
                <Typography sx={{ fontSize: 11, color: textSecondary, lineHeight: 1.6 }}>
                  Every order is scored against FSCM credit exposure, BSID payment history, and ACDOCA profitability
                  before the sales order is created. This week, Ordly prevented <strong>$18,400 in at-risk receivables</strong> from
                  entering the pipeline.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LoparexOpsDashboard;
