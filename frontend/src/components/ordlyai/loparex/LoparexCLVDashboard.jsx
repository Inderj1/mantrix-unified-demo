import React from 'react';
import {
  Box, Typography, Chip, Paper, Grid, Stack, Breadcrumbs, Link, Button, LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon, NavigateNext as NavigateNextIcon,
  Diamond as DiamondIcon, Favorite as FavoriteIcon,
  SquareFoot as SquareFootIcon, Star as StarIcon,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { MODULE_COLOR, BRAND, SEMANTIC } from '../../../config/brandColors';

// ─── Color Constants ───
const NAVY = BRAND.navy.main;
const NAVY_DARK = BRAND.navy.dark;
const GREEN = SEMANTIC.success.main;
const GREEN_DARK = SEMANTIC.success.dark;
const AMBER = '#d97706';
const RED = SEMANTIC.error.main;
const PURPLE = '#6436C8';
const MUTED = '#7A90A8';
const TEAL = '#0E7490';
const BORDER = 'rgba(0,0,0,0.08)';

// ─── Mock Data ───
const CLV_DATA = {
  kpis: [
    { lbl: 'Total 12M CLV Forecast', val: '$8.24M', sub: 'Across 32 active customers', trend: '+14% vs prior 12M', up: true, icon: '💎', accent: PURPLE, sap: 'VBAK × ACDOCA' },
    { lbl: 'Weighted Avg P(Alive)', val: '87.4%', sub: 'Probability customers still active', trend: '+2.1pp — improved retention', up: true, icon: '❤️', accent: GREEN, sap: 'VBAK-ERDAT patterns' },
    { lbl: 'CLV Gini Coefficient', val: '0.74', sub: 'Inequality of CLV distribution', trend: 'Top 20% = 81% of total CLV', up: false, icon: '📐', accent: NAVY, sap: 'VBAK + ACDOCA calc' },
    { lbl: 'Champions Count', val: '4', sub: 'Customers in highest CLV tier', trend: '+1 promotion this quarter', up: true, icon: '⭐', accent: AMBER, sap: 'KNVV segment + CLV rank' },
  ],
  segments: [
    { label: 'Champions', color: PURPLE, count: 4, clvTotal: '$4.28M', clvAvg: '$1.07M', palive: '96%', desc: 'High frequency + recent + high margin. Prioritize retention above all.' },
    { label: 'Loyal', color: NAVY, count: 9, clvTotal: '$2.81M', clvAvg: '$312K', palive: '89%', desc: 'Reliable cadence. Service well. Identify upsell opportunities.' },
    { label: 'At-Risk', color: AMBER, count: 12, clvTotal: '$970K', clvAvg: '$81K', palive: '64%', desc: 'Declining frequency or long recency gap. Immediate re-engagement needed.' },
    { label: 'Lost / Dormant', color: MUTED, count: 7, clvTotal: '$187K', clvAvg: '$27K', palive: '31%', desc: 'No purchase in 6+ months. Low recovery probability. Minimal resource allocation.' },
  ],
  customers: [
    { id: 'CUST-30112', name: 'Bosch Manufacturing', seg: 'Champion', rfm: { r: 7, f: 36, m: 67800, margin: 34.2 }, clv: { pAlive: 0.97, expectedOrders: 28, clv12m: 820000, churnRisk: 0.03 }, revRank: 2, clvRank: 1 },
    { id: 'CUST-50201', name: 'GE Aviation Systems', seg: 'Champion', rfm: { r: 7, f: 18, m: 138333, margin: 29.6 }, clv: { pAlive: 0.95, expectedOrders: 15, clv12m: 614000, churnRisk: 0.05 }, revRank: 1, clvRank: 2 },
    { id: 'CUST-10045', name: 'Honeywell Industrial', seg: 'Loyal', rfm: { r: 14, f: 24, m: 48200, margin: 31.4 }, clv: { pAlive: 0.91, expectedOrders: 20, clv12m: 290000, churnRisk: 0.09 }, revRank: 3, clvRank: 3 },
    { id: 'CUST-99031', name: 'Caterpillar Inc.', seg: 'Loyal', rfm: { r: 21, f: 20, m: 55200, margin: 30.1 }, clv: { pAlive: 0.88, expectedOrders: 17, clv12m: 245000, churnRisk: 0.12 }, revRank: 5, clvRank: 4 },
    { id: 'CUST-20031', name: 'Siemens Energy AG', seg: 'Loyal', rfm: { r: 28, f: 12, m: 89200, margin: 28.1 }, clv: { pAlive: 0.84, expectedOrders: 11, clv12m: 198000, churnRisk: 0.16 }, revRank: 4, clvRank: 5 },
    { id: 'CUST-88214', name: '3M Industrial', seg: 'Loyal', rfm: { r: 35, f: 15, m: 42100, margin: 32.8 }, clv: { pAlive: 0.80, expectedOrders: 13, clv12m: 143000, churnRisk: 0.20 }, revRank: 6, clvRank: 6 },
    { id: 'CUST-40088', name: 'Parker Hannifin', seg: 'At-Risk', rfm: { r: 56, f: 6, m: 67800, margin: null }, clv: { pAlive: 0.61, expectedOrders: 5, clv12m: 94000, churnRisk: 0.39 }, revRank: 7, clvRank: 7 },
    { id: 'CUST-77012', name: 'Eaton Corporation', seg: 'At-Risk', rfm: { r: 72, f: 8, m: 31400, margin: 27.4 }, clv: { pAlive: 0.55, expectedOrders: 6, clv12m: 62000, churnRisk: 0.45 }, revRank: 8, clvRank: 8 },
  ],
  pAliveCurves: {
    months: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
    champion: [1.00, 0.990, 0.981, 0.972, 0.963, 0.954, 0.946, 0.937, 0.929, 0.921, 0.913, 0.905, 0.897],
    loyal:    [1.00, 0.970, 0.941, 0.913, 0.886, 0.860, 0.835, 0.810, 0.786, 0.763, 0.740, 0.718, 0.697],
    atRisk:   [1.00, 0.935, 0.875, 0.819, 0.767, 0.718, 0.672, 0.629, 0.589, 0.551, 0.516, 0.483, 0.452],
    newAcct:  [1.00, 0.888, 0.794, 0.712, 0.639, 0.575, 0.518, 0.466, 0.421, 0.380, 0.343, 0.310, 0.280],
  },
  rankComparison: [
    { name: 'Bosch Manufacturing', revRank: 2, clvRank: 1 },
    { name: 'GE Aviation Systems', revRank: 1, clvRank: 2 },
    { name: 'Honeywell Industrial', revRank: 3, clvRank: 3 },
    { name: 'Caterpillar Inc.', revRank: 5, clvRank: 4 },
    { name: 'Siemens Energy AG', revRank: 4, clvRank: 5 },
    { name: '3M Industrial', revRank: 6, clvRank: 6 },
    { name: 'Parker Hannifin', revRank: 7, clvRank: 7 },
  ],
  nbdExpected: [
    { seg: 'Champions', e: 28, max: 32, color: PURPLE, note: 'P(alive) x freq = 28/yr' },
    { seg: 'Loyal', e: 18, max: 32, color: NAVY, note: 'Stable cadence' },
    { seg: 'At-Risk', e: 7, max: 32, color: AMBER, note: 'Declining signal' },
    { seg: 'New Accts', e: 4, max: 32, color: MUTED, note: 'Insufficient history' },
  ],
  sapSources: [
    { table: 'VBAK', field: 'ERDAT, KUNNR', desc: 'Purchase dates per customer — Recency (t_x), Frequency (x), Observation window (T)', metric: 'BG/NBD inputs r, a' },
    { table: 'ACDOCA', field: 'PRCTR, KSTAR, BETRW', desc: 'Actual P&L docs — Gross margin per customer per period = Monetary Value (M)', metric: 'CLV = P(alive) x E[X] x M' },
    { table: 'BSID', field: 'KUNNR, ZFBDT, AUGDT', desc: 'Open AR items — Payment behavior, DSO per customer — Churn risk adjustment', metric: 'sBG beta parameter tuning' },
    { table: 'KNVV', field: 'KUNNR, KDGRP, VKBUR', desc: 'Customer master sales view — Initial segment classification, Sales district', metric: 'Segment priors (a, b init)' },
    { table: 'VBAP', field: 'MATNR, NETWR, MENGE', desc: 'Order line items — Average order value, material mix, margin contribution', metric: 'E[X] x Avg Margin' },
    { table: 'VBEP', field: 'EDATU, BMENG, WMENG', desc: 'Schedule lines — Delivery reliability pattern — Service quality signal in CLV', metric: 'Retention rate adjustment' },
  ],
};

// ─── Helpers ───
const segColor = (seg) => seg === 'Champion' ? PURPLE : seg === 'Loyal' ? NAVY : seg === 'At-Risk' ? AMBER : MUTED;
const pAliveColor = (p) => p >= 0.85 ? GREEN : p >= 0.65 ? AMBER : RED;
const churnColor = (r) => r < 0.10 ? GREEN : r < 0.25 ? AMBER : RED;
const fmtK = (v) => `$${Math.round(v / 1000)}K`;

// ─── P(Alive) SVG Chart ───
const PAliveChart = ({ darkMode }) => {
  const d = CLV_DATA.pAliveCurves;
  const W = 560, H = 200, padL = 36, padR = 12, padT = 16, padB = 28;
  const cW = W - padL - padR, cH = H - padT - padB;
  const n = d.months.length;
  const xScale = (i) => padL + (i / (n - 1)) * cW;
  const yScale = (v) => padT + cH - v * cH;

  const makePath = (vals, col, dashed = false) => {
    const pts = vals.map((v, i) => `${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' L ');
    return (
      <path
        d={`M ${pts}`}
        fill="none"
        stroke={col}
        strokeWidth="2.5"
        strokeDasharray={dashed ? '5,3' : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  const makeDot = (vals, col) => {
    const idx = d.months.indexOf(12);
    const x = xScale(idx), y = yScale(vals[idx]);
    return (
      <>
        <circle cx={x} cy={y} r={4} fill={col} stroke="white" strokeWidth="1.5" />
        <text x={x + 8} y={y + 4} fontSize="9" fill={col} fontWeight="600">{Math.round(vals[idx] * 100)}%</text>
      </>
    );
  };

  const gridColor = darkMode ? 'rgba(255,255,255,0.08)' : '#E2E7EF';
  const labelColor = darkMode ? 'rgba(255,255,255,0.45)' : MUTED;
  const t12Idx = d.months.indexOf(12);

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
        {/* 12M reference line */}
        <line x1={xScale(t12Idx)} y1={padT} x2={xScale(t12Idx)} y2={H - padB} stroke="#C4B5FD" strokeWidth="1" strokeDasharray="3,2" />
        <text x={xScale(t12Idx)} y={padT - 3} textAnchor="middle" fontSize="8" fill={PURPLE}>12M mark</text>

        {/* Grid lines + Y labels */}
        {[0, 0.25, 0.5, 0.75, 1.0].map((v) => (
          <g key={v}>
            <line x1={padL} y1={yScale(v)} x2={W - padR} y2={yScale(v)} stroke={gridColor} strokeWidth="1" />
            <text x={padL - 4} y={yScale(v) + 4} textAnchor="end" fontSize="9" fill={labelColor}>{Math.round(v * 100)}%</text>
          </g>
        ))}

        {/* X labels */}
        {d.months.filter((_, i) => i % 2 === 0).map((m) => {
          const i = d.months.indexOf(m);
          return <text key={m} x={xScale(i)} y={H - 4} textAnchor="middle" fontSize="9" fill={labelColor}>{m}m</text>;
        })}

        {/* Lines */}
        {makePath(d.champion, PURPLE)}
        {makePath(d.loyal, NAVY)}
        {makePath(d.atRisk, AMBER)}
        {makePath(d.newAcct, MUTED, true)}

        {/* Dots at 12M */}
        {makeDot(d.champion, PURPLE)}
        {makeDot(d.loyal, NAVY)}
        {makeDot(d.atRisk, AMBER)}
        {makeDot(d.newAcct, MUTED)}
      </svg>

      {/* Legend */}
      <Stack direction="row" spacing={2} sx={{ mt: 1.25, flexWrap: 'wrap' }}>
        {[
          { label: 'Champions (a=5, b=1.2)', color: PURPLE },
          { label: 'Loyal (a=3, b=2)', color: NAVY },
          { label: 'At-Risk (a=1.5, b=4)', color: AMBER },
          { label: 'New Accounts (a=1, b=8)', color: MUTED },
        ].map((l) => (
          <Stack key={l.label} direction="row" alignItems="center" spacing={0.75}>
            <Box sx={{ width: 24, height: 3, bgcolor: l.color, borderRadius: 1 }} />
            <Typography sx={{ fontSize: 10, color: darkMode ? 'rgba(255,255,255,0.5)' : MUTED }}>{l.label}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

// ─── Main Component ───
const LoparexCLVDashboard = ({ onBack, darkMode = false }) => {
  const bg = darkMode ? '#0d1117' : '#f8fbfd';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : BORDER;
  const textPrimary = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#475569';
  const textMuted = darkMode ? 'rgba(255,255,255,0.45)' : MUTED;
  const surfaceBg = darkMode ? '#21262d' : '#f8f9fb';

  const CARD_HEIGHT = 420;
  const cardSx = {
    bgcolor: cardBg,
    borderRadius: '10px',
    border: `1px solid ${borderColor}`,
    boxShadow: darkMode ? 'none' : '0 2px 8px rgba(12,31,63,0.09)',
    p: 2.5,
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
    <Box sx={{ bgcolor: bg, minHeight: '100vh', pb: 4 }}>
      {/* ─── Breadcrumb Bar ─── */}
      <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${borderColor}`, bgcolor: cardBg, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            textTransform: 'none', fontWeight: 600, fontSize: 13, color: NAVY,
            borderRadius: 2, '&:hover': { bgcolor: alpha(NAVY, 0.08) },
          }}
        >
          Back
        </Button>
        <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 16 }} />} sx={{ '& .MuiBreadcrumbs-separator': { color: textMuted } }}>
          <Link underline="hover" sx={{ fontSize: 13, fontWeight: 600, color: NAVY, fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}>ORDER SYNC</Link>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>D2: Customer CLV Intelligence</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ maxWidth: 1440, mx: 'auto', px: 3, pt: 3 }}>
        {/* ─── Fader Quote Banner ─── */}
        <Box sx={{
          background: `linear-gradient(135deg, ${NAVY_DARK}, #1E3A5F)`,
          borderRadius: '10px', p: '20px 24px', mb: 1.75,
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.6, fontStyle: 'italic', mb: 0.75 }}>
              "Not all customers are created equal. The goal is not to maximize customer satisfaction — it is to maximize the lifetime value of your customer base. Focus on the right customers."
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
              — Prof. Peter Fader, Wharton School &middot; Author: Customer Centricity &middot; BG/NBD, Pareto/NBD, sBG model architect
            </Typography>
          </Box>
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '6px', p: '12px 16px', flexShrink: 0, minWidth: 280,
          }}>
            <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.5)', mb: 1 }}>
              Ordly CLV Engine &middot; SAP S/4HANA Data Only
            </Typography>
            {[
              'BG/NBD model — purchase frequency prediction',
              'sBG model — churn / P(Alive) survival curve',
              'Pareto/NBD — heterogeneous lifetime',
              'VBAK + ACDOCA + BSID + KNVV inputs only',
            ].map((item) => (
              <Typography key={item} sx={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box component="span" sx={{ color: 'rgba(255,255,255,0.3)' }}>→</Box> {item}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* ─── KPI Cards ─── */}
        <Grid container spacing={1.75} sx={{ mb: 1.75 }}>
          {CLV_DATA.kpis.map((k) => (
            <Grid item xs={3} key={k.lbl}>
              <Box sx={cardSx}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: textMuted, mb: 1.25 }}>{k.lbl}</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: darkMode ? '#e6edf3' : NAVY_DARK, lineHeight: 1, mb: 0.625, letterSpacing: -0.5 }}>{k.val}</Typography>
                <Typography sx={{ fontSize: 11, color: textSecondary, mb: 1 }}>{k.sub}</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: k.up ? GREEN : textMuted }}>
                  {k.up ? '↑ ' : ''}{k.trend}
                </Typography>
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.5,
                  fontSize: 9, color: textMuted, bgcolor: surfaceBg,
                  border: `1px solid ${borderColor}`, px: 0.875, py: 0.25, borderRadius: '4px', mt: 0.5,
                }}>
                  📊 {k.sap}
                </Box>
                <Box sx={{ position: 'absolute', right: 16, top: 14, fontSize: 24, opacity: 0.12 }}>{k.icon}</Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* ─── CLV Segments ─── */}
        <Box sx={{ ...scrollCardSx, mb: 1.75 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: textPrimary, mb: 0.375 }}>Customer CLV Segments</Typography>
          <Typography sx={{ fontSize: 11, color: textMuted, mb: 2, lineHeight: 1.5 }}>
            Fader segmentation — forward-looking CLV, not backward-looking revenue. Computed from purchase history patterns in VBAK + margin in ACDOCA.
          </Typography>
          <Grid container spacing={1.25}>
            {CLV_DATA.segments.map((s) => (
              <Grid item xs={3} key={s.label}>
                <Box sx={{
                  borderRadius: '6px', p: 1.75,
                  border: `1px solid ${alpha(s.color, 0.18)}`,
                  bgcolor: darkMode ? alpha(s.color, 0.08) : alpha(s.color, 0.06),
                }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: s.color, mb: 1 }}>{s.label}</Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1, color: s.color, mb: 0.375 }}>{s.count}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: textPrimary, mb: 0.75 }}>customers</Typography>
                  <Box sx={{ height: 1, bgcolor: alpha(s.color, 0.12), my: 1 }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.clvTotal} CLV</Typography>
                  <Typography sx={{ fontSize: 10, color: textMuted }}>Avg: {s.clvAvg}/customer</Typography>
                  <Typography sx={{ fontSize: 10, color: s.color, mt: 0.625 }}><strong>{s.palive}</strong> avg P(Alive)</Typography>
                  <Typography sx={{ fontSize: 10, color: textMuted, mt: 0.75, lineHeight: 1.4 }}>{s.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ─── P(Alive) + CLV vs Revenue Rank (3:2 grid) ─── */}
        <Grid container spacing={1.75} sx={{ mb: 1.75 }}>
          {/* P(Alive) Survival Curves */}
          <Grid item xs={7.2}>
            <Box sx={scrollCardSx}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: textPrimary, mb: 0.375 }}>P(Alive) Survival Curves — sBG Model</Typography>
              <Typography sx={{ fontSize: 11, color: textMuted, mb: 2, lineHeight: 1.5 }}>
                Probability a customer is still "active" as a function of time since last purchase. Computed from VBAK order frequency + recency patterns. Higher a = more loyal cohort.
              </Typography>
              {/* Formula box */}
              <Box sx={{ bgcolor: surfaceBg, border: `1px solid ${borderColor}`, borderRadius: '6px', p: '10px 14px', mb: 1.75 }}>
                <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: textMuted, mb: 0.75 }}>
                  sBG Survival Function (Fader & Hardie)
                </Typography>
                <Typography sx={{ fontSize: 11, color: darkMode ? '#e6edf3' : NAVY_DARK, lineHeight: 1.8 }}>
                  P(alive at period t | a, b) = B(a, b + t) / B(a, b)<br />
                  where B = Beta function, a/b = shape params fitted to VBAK purchase cadence<br />
                  <Box component="span" sx={{ color: textMuted }}>Input: VBAK-ERDAT (order dates) per VBAK-KUNNR (customer) over trailing 24 months</Box>
                </Typography>
              </Box>
              <PAliveChart darkMode={darkMode} />
            </Box>
          </Grid>

          {/* CLV vs Revenue Rank */}
          <Grid item xs={4.8}>
            <Box sx={scrollCardSx}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: textPrimary, mb: 0.375 }}>CLV Rank vs. Revenue Rank</Typography>
              <Typography sx={{ fontSize: 11, color: textMuted, mb: 2, lineHeight: 1.5 }}>
                The Fader Insight: who you think is your best customer (by revenue today) vs. who actually is (by forward CLV). Gaps reveal misallocated attention.
              </Typography>

              {/* Fader Insight box */}
              <Box sx={{
                fontSize: 10, color: textSecondary, mb: 1.25, p: '8px 10px',
                bgcolor: darkMode ? alpha(PURPLE, 0.12) : '#EDE9FE',
                borderRadius: '6px',
              }}>
                <strong style={{ color: PURPLE }}>The Fader Insight:</strong>{' '}
                GE Aviation is #1 by annual revenue but #2 by CLV — expedite costs + AS9100 constraints compress future margin. Caterpillar is #5 by revenue but #4 by CLV — highly reliable purchase cadence + improving margins.
              </Box>

              {/* Header row */}
              <Box sx={{
                display: 'flex', justifyContent: 'space-between', py: 0.75,
                borderBottom: `2px solid ${borderColor}`, mb: 0.5,
              }}>
                <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: textMuted }}>CLV Rank</Typography>
                <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: textMuted }}>Customer</Typography>
                <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: textMuted }}>vs. Revenue Rank</Typography>
              </Box>

              {/* Rows */}
              {CLV_DATA.rankComparison.map((r) => {
                const delta = r.revRank - r.clvRank;
                return (
                  <Box key={r.name} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.25, py: 1,
                    borderBottom: `1px solid ${borderColor}`,
                  }}>
                    <Typography sx={{ fontSize: 10, color: textMuted, width: 20, textAlign: 'center' }}>#{r.clvRank}</Typography>
                    <Typography sx={{ flex: 1, fontSize: 11, fontWeight: 500, color: textPrimary }}>{r.name}</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Typography sx={{ fontSize: 9, color: textMuted }}>Rev rank:</Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: textSecondary }}>#{r.revRank}</Typography>
                      <Typography sx={{ fontSize: 10, width: 70, textAlign: 'right', fontWeight: 700, color: delta > 0 ? GREEN : delta < 0 ? RED : textMuted }}>
                        {delta > 0 ? `↑${delta} in CLV` : delta < 0 ? `↓${Math.abs(delta)} in CLV` : '= same'}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>

        {/* ─── Customer CLV Table ─── */}
        <Box sx={{ ...scrollCardSx, mb: 1.75 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: textPrimary, mb: 0.375 }}>
            Customer CLV Intelligence — Ranked by 12-Month Projected CLV
          </Typography>
          <Typography sx={{ fontSize: 11, color: textMuted, mb: 2, lineHeight: 1.5 }}>
            CLV&#8321;&#8322; = P(Alive) x E[X(12)] x Avg_Margin_per_Order &nbsp;|&nbsp; E[X(t)] = BG/NBD predicted future transactions &nbsp;|&nbsp; All inputs: VBAK (frequency/recency), ACDOCA (margin), BSID (payment), KNVV (segment)
          </Typography>

          {/* Table Header */}
          <Box sx={{
            display: 'grid', gridTemplateColumns: '60px 1.5fr 90px 1.2fr 80px 70px 90px 80px',
            borderBottom: `2px solid ${borderColor}`, pb: 1, mb: 0.5,
          }}>
            {['CLV Rank', 'Customer', 'Segment', 'R / F / M', 'P(Alive)', 'E[X] 12M', '12M CLV', 'Churn Risk'].map((h) => (
              <Typography key={h} sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: textMuted, px: 1.5 }}>{h}</Typography>
            ))}
          </Box>

          {/* Table Rows */}
          {CLV_DATA.customers.map((c, i) => {
            const sc = segColor(c.seg);
            return (
              <Box key={c.id} sx={{
                display: 'grid', gridTemplateColumns: '60px 1.5fr 90px 1.2fr 80px 70px 90px 80px',
                alignItems: 'center', py: 1.25, px: 0,
                borderBottom: `1px solid ${borderColor}`,
                '&:hover': { bgcolor: surfaceBg },
                '&:last-child': { borderBottom: 'none' },
              }}>
                {/* Rank */}
                <Box sx={{ px: 1.5 }}>
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                    bgcolor: i < 3 ? NAVY_DARK : i < 6 ? surfaceBg : borderColor,
                    color: i < 3 ? '#fff' : textMuted,
                  }}>
                    #{i + 1}
                  </Box>
                </Box>

                {/* Customer */}
                <Box sx={{ px: 1.5 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: textPrimary }}>{c.name}</Typography>
                  <Typography sx={{ fontSize: 9, color: textMuted }}>{c.id}</Typography>
                </Box>

                {/* Segment */}
                <Box sx={{ px: 1.5 }}>
                  <Chip
                    label={c.seg}
                    size="small"
                    sx={{
                      fontSize: 10, fontWeight: 700, color: sc, bgcolor: alpha(sc, 0.1),
                      height: 22, borderRadius: '10px', '& .MuiChip-label': { px: 1 },
                    }}
                  />
                </Box>

                {/* R / F / M */}
                <Box sx={{ px: 1.5 }}>
                  <Typography sx={{ fontSize: 10, color: textSecondary }}>
                    R: <strong>{c.rfm.r}d</strong> &middot; F: <strong>{c.rfm.f}</strong> &middot; M: <strong>${Math.round(c.rfm.m / 1000)}K</strong>
                  </Typography>
                  <Typography sx={{ fontSize: 9, color: textMuted }}>GM: {c.rfm.margin !== null ? `${c.rfm.margin}%` : 'unknown'}</Typography>
                </Box>

                {/* P(Alive) */}
                <Box sx={{ px: 1.5 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: pAliveColor(c.clv.pAlive) }}>
                    {Math.round(c.clv.pAlive * 100)}%
                  </Typography>
                  <Box sx={{ width: 60, height: 6, bgcolor: borderColor, borderRadius: 3, overflow: 'hidden', mt: 0.5 }}>
                    <Box sx={{ width: `${c.clv.pAlive * 100}%`, height: '100%', bgcolor: pAliveColor(c.clv.pAlive), borderRadius: 3 }} />
                  </Box>
                </Box>

                {/* E[X] */}
                <Box sx={{ px: 1.5 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: textPrimary }}>{c.clv.expectedOrders}</Typography>
                </Box>

                {/* 12M CLV */}
                <Box sx={{ px: 1.5 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: darkMode ? '#e6edf3' : NAVY_DARK }}>{fmtK(c.clv.clv12m)}</Typography>
                </Box>

                {/* Churn Risk */}
                <Box sx={{ px: 1.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: churnColor(c.clv.churnRisk) }}>
                    {Math.round(c.clv.churnRisk * 100)}%
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ─── BG/NBD Expected Purchases + SAP Sources (1:1 grid) ─── */}
        <Grid container spacing={1.75}>
          {/* BG/NBD Expected Purchases */}
          <Grid item xs={6}>
            <Box sx={scrollCardSx}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: textPrimary, mb: 0.375 }}>Expected Future Purchases — BG/NBD Model</Typography>
              <Typography sx={{ fontSize: 11, color: textMuted, mb: 2, lineHeight: 1.5 }}>
                12-month purchase probability distribution per segment. Inputs: x (frequency), t_x (recency), T (observation window) from VBAK.
              </Typography>

              {/* Formula box */}
              <Box sx={{ bgcolor: surfaceBg, border: `1px solid ${borderColor}`, borderRadius: '6px', p: '10px 14px', mb: 1.75 }}>
                <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: textMuted, mb: 0.75 }}>
                  BG/NBD Expected Transactions (Fader & Hardie 2005)
                </Typography>
                <Typography sx={{ fontSize: 11, color: darkMode ? '#e6edf3' : NAVY_DARK, lineHeight: 1.8 }}>
                  E[X(t) | r,a,s,b,T,x] = <Box component="span" sx={{ color: PURPLE }}>(r+x)/(a+T)</Box> x <Box component="span" sx={{ color: GREEN }}>A(r+x+1, a+T, s, b+T)</Box><br />
                  <Box component="span" sx={{ color: textMuted }}>r,a = transaction heterogeneity params &middot; s,b = lifetime heterogeneity params</Box><br />
                  <Box component="span" sx={{ color: textMuted }}>x = VBAK order count &middot; t_x = days since last VBAK-ERDAT &middot; T = 24-month window</Box>
                </Typography>
              </Box>

              {/* Bar chart */}
              <Stack spacing={1.5}>
                {CLV_DATA.nbdExpected.map((d) => (
                  <Box key={d.seg}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.625 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: d.color }}>{d.seg}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: darkMode ? '#e6edf3' : NAVY_DARK }}>
                        {d.e} orders/yr <Box component="span" sx={{ fontSize: 9, fontWeight: 400, color: textMuted }}>avg per customer</Box>
                      </Typography>
                    </Stack>
                    <Box sx={{ height: 10, bgcolor: surfaceBg, borderRadius: '5px', overflow: 'hidden', border: `1px solid ${borderColor}` }}>
                      <Box sx={{ width: `${(d.e / d.max) * 100}%`, height: '100%', bgcolor: d.color, borderRadius: '5px' }} />
                    </Box>
                    <Typography sx={{ fontSize: 9, color: textMuted, mt: 0.375 }}>{d.note}</Typography>
                  </Box>
                ))}
              </Stack>

              {/* Decision rule box */}
              <Box sx={{
                mt: 1.5, p: '10px 12px',
                bgcolor: darkMode ? alpha(PURPLE, 0.12) : '#EDE9FE',
                borderRadius: '6px',
              }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: PURPLE, mb: 0.5 }}>BG/NBD Decision Rule</Typography>
                <Typography sx={{ fontSize: 10, color: textSecondary, lineHeight: 1.5 }}>
                  A customer with E[X] declining period-over-period and recency gap growing faster than their historical interval → classify as At-Risk. Trigger re-engagement before P(Alive) drops below 65%.
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* SAP Sources */}
          <Grid item xs={6}>
            <Box sx={scrollCardSx}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: textPrimary, mb: 0.375 }}>SAP S/4HANA Data Sources</Typography>
              <Typography sx={{ fontSize: 11, color: textMuted, mb: 2, lineHeight: 1.5 }}>
                Every CLV metric computed exclusively from S/4HANA. No external data enrichment.
              </Typography>
              <Grid container spacing={1.25}>
                {CLV_DATA.sapSources.map((s) => (
                  <Grid item xs={4} key={s.table}>
                    <Box sx={{
                      bgcolor: surfaceBg, border: `1px solid ${borderColor}`,
                      borderRadius: '6px', p: '12px 14px', height: '100%',
                    }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: NAVY, mb: 0.5 }}>{s.table}</Typography>
                      <Typography sx={{ fontSize: 10, color: textMuted, mb: 0.5 }}>{s.field}</Typography>
                      <Typography sx={{ fontSize: 10, color: textSecondary, lineHeight: 1.4, mb: 0.75 }}>{s.desc}</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 600, color: PURPLE }}>→ {s.metric}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LoparexCLVDashboard;
