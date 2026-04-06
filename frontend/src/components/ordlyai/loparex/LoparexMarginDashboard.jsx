import React from 'react';
import {
  Box, Typography, Chip, Paper, Grid, Stack, Breadcrumbs, Link,
  Button, LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarIcon,
  Loop as LoopIcon,
  FiberManualRecord as DotIcon,
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
const TEAL = '#0E7490';
const BLUE = NAVY;

// ─── Card height constant ───
const CARD_HEIGHT = 420;

// ─── Scrollable card sx helper ───
const scrollCardSx = (c, height = CARD_HEIGHT) => ({
  p: 2.5, borderRadius: 2.5, border: `1px solid ${c.border}`, bgcolor: c.card,
  height, overflow: 'auto',
  '&::-webkit-scrollbar': { width: 4 },
  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
  '&::-webkit-scrollbar-thumb': { bgcolor: c.border, borderRadius: 2, '&:hover': { bgcolor: c.borderMedium } },
});

// ─── Dark mode helpers ───
const dm = (darkMode) => ({
  bg: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  card: darkMode ? '#21262d' : '#ffffff',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  textMuted: darkMode ? '#6e7781' : MUTED,
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  borderMedium: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
  surface2: darkMode ? '#21262d' : '#f8f9fb',
  navy: darkMode ? '#4d9eff' : NAVY,
});

// ─── Mock Data (from HTML source) ───
const MARGIN_DATA = {
  kpis: [
    {
      lbl: 'Gross Margin %', val: '31.8%', sub: 'Weighted avg this week · ACDOCA',
      trend: '+1.2pp — Ordly plant optimization', up: true, icon: TrendingUpIcon,
      accent: GREEN, sap: 'ACDOCA-KSTAR/BETRW',
    },
    {
      lbl: 'Net Margin (after freight)', val: '29.4%', sub: 'Post-freight · ACDOCA + LIKP',
      trend: '+0.9pp — freight lane savings', up: true, icon: AccountBalanceIcon,
      accent: NAVY, sap: 'ACDOCA + DELVRY cost',
    },
    {
      lbl: 'Days Sales Outstanding', val: '28.1d', sub: 'Weighted avg DSO · BSID/BSAD',
      trend: '-6.4d vs pre-Ordly baseline', up: true, icon: CalendarIcon,
      accent: PURPLE, sap: 'BSID-ZFBDT / BSAD-AUGDT',
    },
    {
      lbl: 'Cash Conversion Cycle', val: '34.6d', sub: 'DIO + DSO - DPO · S/4HANA',
      trend: '-8.2d improvement this quarter', up: true, icon: LoopIcon,
      accent: AMBER, sap: 'MARD + BSID + BSIK',
    },
  ],
  waterfall: [
    { lbl: 'Gross Revenue',        amt: 4820000,  pct: 100.0, col: NAVY,  type: 'start' },
    { lbl: 'Cost of Goods Sold',   amt: -3287600, pct: -68.2, col: RED,   type: 'sub' },
    { lbl: 'Gross Margin',         amt: 1532400,  pct: 31.8,  col: GREEN, type: 'result' },
    { lbl: 'Freight Costs',        amt: -116800,  pct: -2.4,  col: AMBER, type: 'sub' },
    { lbl: 'Expedite Surcharges',  amt: -22100,   pct: -0.5,  col: RED,   type: 'sub' },
    { lbl: 'Net Margin (O2C)',     amt: 1393500,  pct: 28.9,  col: GREEN, type: 'result', bold: true },
  ],
  o2c: [
    { step: 'PO Received', days: 0,    col: MUTED,  sap: 'VBAK-ERDAT' },
    { step: 'SO Created',  days: 0.07, col: NAVY,   sap: 'VBAK-AUDAT (Ordly)' },
    { step: 'Delivery',    days: 3.2,  col: GREEN,  sap: 'LIKP-LFDAT' },
    { step: 'Goods Issue', days: 1.0,  col: AMBER,  sap: 'LIKP-WADAT' },
    { step: 'Invoice',     days: 0.5,  col: PURPLE, sap: 'VBRK-FKDAT' },
    { step: 'Payment',     days: 28.1, col: GREEN,  sap: 'BSAD-AUGDT' },
  ],
  plants: [
    { plant: 'PL03', name: 'Detroit, MI',  gm: 33.8, netGm: 33.4, rev: '$4.2M', col: GREEN },
    { plant: 'PL01', name: 'Chicago, IL',  gm: 31.4, netGm: 28.9, rev: '$5.8M', col: NAVY },
    { plant: 'PL02', name: 'Atlanta, GA',  gm: 29.6, netGm: 27.5, rev: '$3.1M', col: PURPLE },
  ],
  wc: {
    dso: 28.1, dio: 22.4, dpo: 31.8, ccc: 18.7,
    sapDSO: 'BSID-ZFBDT → BSAD-AUGDT',
    sapDIO: 'MARD-LABST × MARC-PLIFZ / COGS/365',
    sapDPO: 'BSIK-ZFBDT → BSAK-AUGDT',
    sapCCC: 'DSO + DIO − DPO',
  },
  freight: [
    { lane: 'PL03 → Auburn Hills MI', dist: '22 mi',  pct: 0.41, orders: 12, col: GREEN,  badge: 'Optimal' },
    { lane: 'PL01 → Charlotte NC',    dist: '788 mi', pct: 1.75, orders: 8,  col: NAVY,   badge: 'Good' },
    { lane: 'PL02 → Orlando FL',      dist: '441 mi', pct: 1.08, orders: 6,  col: NAVY,   badge: 'Good' },
    { lane: 'PL01 → Cincinnati OH',   dist: '302 mi', pct: 0.82, orders: 4,  col: AMBER,  badge: 'Watch' },
    { lane: 'PL01 → Chicago IL',      dist: '0 mi',   pct: 0.20, orders: 3,  col: GREEN,  badge: 'Local' },
    { lane: 'PL02 → Atlanta GA',      dist: '0 mi',   pct: 0.18, orders: 2,  col: GREEN,  badge: 'Local' },
  ],
  copa: [
    { lbl: 'Revenue (VKUML)',        amt: 4820000,  sap: 'ACDOCA-KSTAR 800000', col: NAVY,  sign: '+' },
    { lbl: 'COGS — Material',        amt: -2841200, sap: 'ACDOCA-KSTAR 893000', col: RED,   sign: '−' },
    { lbl: 'COGS — Labour/OH',       amt: -446400,  sap: 'ACDOCA-KSTAR 894000', col: RED,   sign: '−' },
    { lbl: 'Gross Margin I',         amt: 1532400,  sap: 'Derived: Rev − COGS',  col: GREEN, sign: '=', bold: true },
    { lbl: 'Freight Cost (outbound)', amt: -116800, sap: 'ACDOCA-KSTAR 476000', col: AMBER, sign: '−' },
    { lbl: 'Expedite Surcharges',    amt: -22100,   sap: 'ACDOCA-KSTAR 478000', col: RED,   sign: '−' },
    { lbl: 'Net Contribution',       amt: 1393500,  sap: 'Account-based CO-PA',  col: GREEN, sign: '=', bold: true },
  ],
  dso: [
    { period: 'Nov 23', tier1: 20, tier2: 30, tier3: 38 },
    { period: 'Dec 23', tier1: 21, tier2: 31, tier3: 37 },
    { period: 'Jan 24', tier1: 19, tier2: 29, tier3: 36 },
    { period: 'Feb 24', tier1: 18, tier2: 28, tier3: 35 },
    { period: 'Mar 24', tier1: 18, tier2: 28, tier3: 34 },
    { period: 'Apr 24', tier1: 17, tier2: 27, tier3: 33 },
  ],
  tierMargin: [
    { tier: 'Tier 1 Strategic', gm: '34.2%', freight: '0.41%', net: '33.8%', col: PURPLE },
    { tier: 'Tier 2 Premium',   gm: '30.8%', freight: '1.42%', net: '29.4%', col: NAVY },
    { tier: 'Tier 3 Standard',  gm: '28.1%', freight: '2.10%', net: '26.0%', col: AMBER },
    { tier: 'Tier 4 New',       gm: '25.4%', freight: '3.20%', net: '22.2%', col: MUTED },
  ],
};

// ─── Format helpers ───
const fmtAmt = (amt) => {
  const abs = Math.abs(amt);
  if (abs >= 1000000) return `$${(abs / 1000000).toFixed(2)}M`;
  return `$${(abs / 1000).toFixed(1)}K`;
};

const fmtAmtShort = (amt) => {
  const abs = Math.abs(amt);
  if (abs >= 1000000) return `$${(abs / 1000000).toFixed(2)}M`;
  return `$${(abs / 1000).toFixed(0)}K`;
};

// ──────────────────────────────────────────
// KPI Cards
// ──────────────────────────────────────────
const KPICard = ({ kpi, darkMode }) => {
  const c = dm(darkMode);
  const IconComp = kpi.icon;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25, borderRadius: 2.5, border: `1px solid ${c.border}`,
        bgcolor: c.card, position: 'relative', overflow: 'hidden',
      }}
    >
      <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: c.textMuted, mb: 1.25 }}>
        {kpi.lbl}
      </Typography>
      <Typography sx={{ fontSize: 20, fontWeight: 700, color: c.navy, lineHeight: 1, mb: 0.5, letterSpacing: -0.5 }}>
        {kpi.val}
      </Typography>
      <Typography sx={{ fontSize: 11, color: c.textSecondary, mb: 0.75 }}>
        {kpi.sub}
      </Typography>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: kpi.up ? GREEN : RED }}>
        {kpi.up ? '↑' : '↓'} {kpi.trend}
      </Typography>
      <Chip
        label={kpi.sap}
        size="small"
        sx={{
          mt: 0.5, height: 20, fontSize: 9, fontWeight: 500,
          bgcolor: c.surface2, border: `1px solid ${c.border}`,
          color: c.textMuted, borderRadius: 1,
          '& .MuiChip-label': { px: 0.75 },
        }}
      />
      <IconComp
        sx={{
          position: 'absolute', right: 16, top: 14,
          fontSize: 28, opacity: 0.1, color: c.text,
        }}
      />
    </Paper>
  );
};

// ──────────────────────────────────────────
// Margin Waterfall
// ──────────────────────────────────────────
const MarginWaterfall = ({ darkMode }) => {
  const c = dm(darkMode);
  const maxAmt = 4820000;

  return (
    <Paper elevation={0} sx={scrollCardSx(c)}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: c.text, mb: 0.5 }}>
        Margin Waterfall — Account-Based CO-PA
      </Typography>
      <Typography sx={{ fontSize: 11, color: c.textMuted, mb: 2, lineHeight: 1.5 }}>
        Revenue → Cost → Gross Margin → Freight Deduction → Net Margin. Source: ACDOCA GL accounts only.
      </Typography>
      <Stack spacing={1}>
        {MARGIN_DATA.waterfall.map((w, i) => {
          const width = (Math.abs(w.amt) / maxAmt) * 100;
          const isNeg = w.amt < 0;
          const prefix = w.type === 'sub' ? '↓ ' : w.type === 'result' ? '= ' : '';
          return (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Typography sx={{ fontSize: 11, color: c.textSecondary, width: 160, flexShrink: 0, textAlign: 'right' }}>
                {prefix}{w.lbl}
              </Typography>
              <Box sx={{ flex: 1, height: 28, position: 'relative', borderRadius: 1, overflow: 'hidden', bgcolor: alpha(w.col, 0.08) }}>
                <Box
                  sx={{
                    height: '100%', borderRadius: 1, width: `${width}%`, bgcolor: w.col,
                    display: 'flex', alignItems: 'center', pl: 1,
                    ...(w.bold ? { border: `2px solid ${alpha(w.col, 0.5)}` } : {}),
                  }}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                    {isNeg ? '−' : ''}{fmtAmtShort(w.amt)}
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: w.col, width: 60, flexShrink: 0, textAlign: 'right' }}>
                {w.pct > 0 ? '+' : ''}{w.pct}%
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

// ──────────────────────────────────────────
// O2C Timeline
// ──────────────────────────────────────────
const O2CTimeline = ({ darkMode }) => {
  const c = dm(darkMode);
  const totalDays = MARGIN_DATA.o2c.reduce((a, s) => a + s.days, 0);

  return (
    <Paper elevation={0} sx={scrollCardSx(c)}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: c.text, mb: 0.5 }}>
        Order-to-Cash Cycle
      </Typography>
      <Typography sx={{ fontSize: 11, color: c.textMuted, mb: 2, lineHeight: 1.5 }}>
        Average days per O2C stage. Source: VBAK → LIKP → VF01 → BSID → BSAD.
      </Typography>

      {/* Total cycle header */}
      <Box sx={{ mb: 1.75, p: 1.25, bgcolor: c.surface2, borderRadius: 1.5, border: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: c.textSecondary }}>
          Total Avg O2C Cycle
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: c.navy }}>
          {totalDays.toFixed(1)} days
        </Typography>
      </Box>

      {/* Steps */}
      <Stack spacing={0.75}>
        {MARGIN_DATA.o2c.map((s, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              bgcolor: alpha(s.col, 0.08), border: `2px solid ${s.col}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <DotIcon sx={{ fontSize: 8, color: s.col }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: c.text }}>
                  {s.step}
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: s.col }}>
                  {s.days === 0 ? '< 5 min' : `${s.days}d`}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.max((s.days / totalDays) * 100, s.days === 0 ? 2 : 0)}
                sx={{
                  height: 5, borderRadius: 3, bgcolor: c.border,
                  '& .MuiLinearProgress-bar': { bgcolor: s.col, borderRadius: 3 },
                }}
              />
              <Typography sx={{ fontSize: 9, color: c.textMuted, mt: 0.25 }}>
                {s.sap}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Ordly impact callout */}
      <Box sx={{ mt: 1.75, p: 1.25, bgcolor: alpha(GREEN, 0.08), borderRadius: 1.5 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: GREEN_DARK, mb: 0.25 }}>
          Ordly Impact on O2C
        </Typography>
        <Typography sx={{ fontSize: 10, color: c.textSecondary, lineHeight: 1.5 }}>
          Order entry time: <strong>4.2 min</strong> (vs 38 min manual). Removes the largest single bottleneck in the cycle. VBEP confirmed at intake — no re-scheduling loops.
        </Typography>
      </Box>
    </Paper>
  );
};

// ──────────────────────────────────────────
// Plant Profitability
// ──────────────────────────────────────────
const PlantProfitability = ({ darkMode }) => {
  const c = dm(darkMode);

  return (
    <Paper elevation={0} sx={scrollCardSx(c)}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: c.text, mb: 0.5 }}>
        Plant-Level Contribution Margin
      </Typography>
      <Typography sx={{ fontSize: 11, color: c.textMuted, mb: 2, lineHeight: 1.5 }}>
        Gross margin % by fulfillment plant after freight. Source: ACDOCA → WERKS + freight cost from LIKP/DELVRY.
      </Typography>

      {/* Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.75, mb: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 4, bgcolor: GREEN, borderRadius: 0.5 }} />
          <Typography sx={{ fontSize: 10, color: c.textMuted }}>Net margin (after freight)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 4, bgcolor: c.border, borderRadius: 0.5 }} />
          <Typography sx={{ fontSize: 10, color: c.textMuted }}>Gross margin</Typography>
        </Box>
      </Box>

      {/* Plant rows */}
      <Stack divider={<Box sx={{ borderBottom: `1px solid ${c.border}` }} />}>
        {MARGIN_DATA.plants.map((p, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: p.col, width: 36 }}>
              {p.plant}
            </Typography>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: c.text, mb: 0.5 }}>
                {p.name}
              </Typography>
              <Box sx={{ position: 'relative', height: 10, bgcolor: c.border, borderRadius: 1.25, overflow: 'hidden', mb: 0.25 }}>
                <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${p.gm}%`, bgcolor: alpha(p.col, 0.2), borderRadius: 1.25 }} />
                <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${p.netGm}%`, bgcolor: p.col, borderRadius: 1.25 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 9, color: c.textMuted }}>Gross: {p.gm}%</Typography>
                <Typography sx={{ fontSize: 9, fontWeight: 700, color: p.col }}>Net: {p.netGm}%</Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: c.text }}>
                {p.netGm}%
              </Typography>
              <Typography sx={{ fontSize: 9, color: c.textMuted }}>
                {p.rev} revenue
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* CO-PA note */}
      <Box sx={{ mt: 1.25, p: 1.25, bgcolor: alpha(TEAL, 0.06), borderRadius: 1.5 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: TEAL, mb: 0.25 }}>
          CO-PA Note
        </Typography>
        <Typography sx={{ fontSize: 10, color: c.textSecondary }}>
          Account-based CO-PA only. All profitability flows via GL accounts in ACDOCA (Ledger 0L). No VV-xxx value fields — consistent with Margin Analysis configuration at this client.
        </Typography>
      </Box>
    </Paper>
  );
};

// ──────────────────────────────────────────
// Working Capital Metrics
// ──────────────────────────────────────────
const WorkingCapitalMetrics = ({ darkMode }) => {
  const c = dm(darkMode);
  const wc = MARGIN_DATA.wc;

  const wcItems = [
    { lbl: 'DSO', val: `${wc.dso}d`, desc: 'Days Sales Outstanding', col: darkMode ? '#4d9eff' : NAVY, sap: wc.sapDSO, trend: '↓ from 34.5d' },
    { lbl: 'DIO', val: `${wc.dio}d`, desc: 'Days Inventory Outstanding', col: AMBER, sap: wc.sapDIO, trend: '↓ from 28.1d' },
    { lbl: 'DPO', val: `${wc.dpo}d`, desc: 'Days Payable Outstanding', col: GREEN, sap: wc.sapDPO, trend: 'stable' },
    { lbl: 'CCC', val: `${wc.ccc}d`, desc: 'Cash Conversion Cycle', col: PURPLE, sap: wc.sapCCC, trend: '↓ from 26.9d', bold: true },
  ];

  return (
    <Paper elevation={0} sx={scrollCardSx(c)}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: c.text, mb: 0.5 }}>
        Working Capital Metrics
      </Typography>
      <Typography sx={{ fontSize: 11, color: c.textMuted, mb: 2, lineHeight: 1.5 }}>
        DSO, DIO, DPO and Cash Conversion Cycle. All from S/4HANA: BSID (AR), MARD (inventory), BSIK (AP).
      </Typography>

      {/* Formula bar */}
      <Box sx={{ mb: 2, p: 1, textAlign: 'center', bgcolor: c.surface2, borderRadius: 1.5, border: `1px solid ${c.border}` }}>
        <Typography sx={{ fontSize: 11, color: c.textSecondary }}>
          CCC = DSO + DIO − DPO &nbsp;|&nbsp;{' '}
          <Box component="span" sx={{ color: c.navy, fontWeight: 600 }}>
            {wc.dso} + {wc.dio} − {wc.dpo} = {wc.ccc} days
          </Box>
        </Typography>
      </Box>

      {/* 2x2 grid of WC metrics */}
      <Grid container spacing={1.25}>
        {wcItems.map((m, i) => (
          <Grid item xs={6} key={i}>
            <Box sx={{
              bgcolor: m.bold ? alpha(PURPLE, 0.06) : c.surface2,
              border: `1px solid ${m.bold ? alpha(PURPLE, 0.3) : c.border}`,
              borderRadius: 1.5, p: 1.25,
            }}>
              <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: c.textMuted, mb: 0.5 }}>
                {m.lbl}
              </Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: m.col, mb: 0.25 }}>
                {m.val}
              </Typography>
              <Typography sx={{ fontSize: 10, color: c.textSecondary, mb: 0.5 }}>
                {m.desc}
              </Typography>
              <Typography sx={{ fontSize: 8, color: c.textMuted }}>
                {m.sap}
              </Typography>
              <Typography sx={{ fontSize: 10, fontWeight: 600, color: GREEN, mt: 0.25 }}>
                {m.trend}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

// ──────────────────────────────────────────
// Freight Cost Analysis
// ──────────────────────────────────────────
const FreightAnalysis = ({ darkMode }) => {
  const c = dm(darkMode);

  const badgeColor = (badge) => {
    switch (badge) {
      case 'Optimal': return { bg: alpha(GREEN, 0.1), color: GREEN_DARK };
      case 'Good': return { bg: alpha(NAVY, 0.1), color: NAVY };
      case 'Watch': return { bg: alpha(AMBER, 0.1), color: AMBER };
      case 'Local': return { bg: alpha(GREEN, 0.1), color: GREEN_DARK };
      default: return { bg: alpha(MUTED, 0.1), color: MUTED };
    }
  };

  return (
    <Paper elevation={0} sx={scrollCardSx(c)}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: c.text, mb: 0.5 }}>
        Freight Cost Analysis by Lane
      </Typography>
      <Typography sx={{ fontSize: 11, color: c.textMuted, mb: 2, lineHeight: 1.5 }}>
        Freight as % of order revenue by fulfillment lane. Ordly selects lowest freight lane for each line automatically.
      </Typography>

      {/* Header row */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        pb: 1, borderBottom: `2px solid ${c.borderMedium}`, mb: 0.5,
      }}>
        <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: c.textMuted, flex: 1 }}>
          Lane (Plant → Ship-To)
        </Typography>
        <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: c.textMuted, width: 52, textAlign: 'right' }}>
          Dist
        </Typography>
        <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: c.textMuted, width: 64, textAlign: 'right' }}>
          Freight %
        </Typography>
        <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: c.textMuted, width: 48, textAlign: 'right' }}>
          Orders
        </Typography>
        <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: c.textMuted, width: 60, textAlign: 'right' }}>
          Status
        </Typography>
      </Box>

      {/* Freight rows */}
      <Stack divider={<Box sx={{ borderBottom: `1px solid ${c.border}` }} />}>
        {MARGIN_DATA.freight.map((f, i) => {
          const bc = badgeColor(f.badge);
          return (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: c.text }}>
                  {f.lane}
                </Typography>
                <Box sx={{ height: 5, bgcolor: c.border, borderRadius: 0.75, overflow: 'hidden', mt: 0.5, width: '80%' }}>
                  <Box sx={{ width: `${Math.min((f.pct / 3.5) * 100, 100)}%`, height: '100%', bgcolor: f.col, borderRadius: 0.75 }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: 10, color: c.textMuted, width: 52, textAlign: 'right' }}>
                {f.dist}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: f.col, width: 64, textAlign: 'right' }}>
                {f.pct}%
              </Typography>
              <Typography sx={{ fontSize: 12, color: c.textMuted, width: 48, textAlign: 'right' }}>
                {f.orders}
              </Typography>
              <Box sx={{ width: 60, textAlign: 'right' }}>
                <Chip
                  label={f.badge}
                  size="small"
                  sx={{
                    height: 20, fontSize: 9, fontWeight: 600,
                    bgcolor: bc.bg, color: bc.color,
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>

      {/* Insight */}
      <Box sx={{ mt: 1.25, p: 1, bgcolor: alpha(GREEN, 0.08), borderRadius: 1.5 }}>
        <Typography sx={{ fontSize: 10, color: GREEN_DARK, fontWeight: 600 }}>
          Ordly auto-selects lowest-freight eligible lane per line. PL03→Auburn Hills at 0.41% is the system benchmark.
        </Typography>
      </Box>
    </Paper>
  );
};

// ──────────────────────────────────────────
// CO-PA GL Detail
// ──────────────────────────────────────────
const COPADetail = ({ darkMode }) => {
  const c = dm(darkMode);

  return (
    <Paper elevation={0} sx={scrollCardSx(c)}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: c.text, mb: 0.5 }}>
        Account-Based CO-PA — Contribution Margin
      </Typography>
      <Typography sx={{ fontSize: 11, color: c.textMuted, mb: 2, lineHeight: 1.5 }}>
        Profitability per GL account posting. ACDOCA account-based only — no VV-xxx value fields. Ledger: 0L.
      </Typography>

      <Stack>
        {MARGIN_DATA.copa.map((row, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              py: 1.1, px: row.bold ? 1 : 0,
              borderBottom: row.bold ? 'none' : `1px solid ${c.border}`,
              ...(row.bold ? {
                bgcolor: alpha(GREEN, 0.06), borderRadius: 1.5, my: 0.5,
              } : {}),
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 11, color: c.textSecondary, fontWeight: row.bold ? 700 : 400 }}>
                <Box component="span" sx={{ color: row.col, fontWeight: 700 }}>{row.sign}</Box>{' '}
                {row.lbl}
              </Typography>
              <Typography sx={{ fontSize: 9, color: c.textMuted }}>
                {row.sap}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: row.col }}>
              {row.sign === '−' ? '−' : ''}{fmtAmtShort(row.amt)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

// ──────────────────────────────────────────
// DSO Trend Chart (SVG)
// ──────────────────────────────────────────
const DSOTrendChart = ({ darkMode }) => {
  const c = dm(darkMode);
  const data = MARGIN_DATA.dso;
  const W = 460, H = 160, padL = 30, padR = 10, padT = 10, padB = 24;
  const cW = W - padL - padR;
  const cH = H - padT - padB;
  const maxV = 45;
  const n = data.length;

  const xPos = (i) => padL + (i / (n - 1)) * cW;
  const yPos = (v) => padT + cH - (v / maxV) * cH;

  const makeLine = (vals, col) => {
    const pts = vals.map((v, i) => `${xPos(i)},${yPos(v)}`).join(' ');
    return (
      <polyline
        key={col}
        points={pts}
        fill="none"
        stroke={col}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    );
  };

  const gridLines = [20, 30, 40];

  return (
    <Paper elevation={0} sx={scrollCardSx(c)}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: c.text, mb: 0.5 }}>
        DSO Trend — 6 Months
      </Typography>
      <Typography sx={{ fontSize: 11, color: c.textMuted, mb: 2, lineHeight: 1.5 }}>
        Days Sales Outstanding by customer tier. Ordly's AR Shield prevents high-risk orders from entering the pipeline.
      </Typography>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {gridLines.map((v) => (
          <React.Fragment key={v}>
            <line
              x1={padL} y1={yPos(v)} x2={W - padR} y2={yPos(v)}
              stroke={darkMode ? 'rgba(255,255,255,0.08)' : '#E2E7EF'}
              strokeWidth={1}
            />
            <text
              x={padL - 3} y={yPos(v) + 4}
              textAnchor="end" fontSize={9}
              fill={darkMode ? '#6e7781' : MUTED}
            >
              {v}d
            </text>
          </React.Fragment>
        ))}

        {/* Data lines */}
        {makeLine(data.map((r) => r.tier1), PURPLE)}
        {makeLine(data.map((r) => r.tier2), NAVY)}
        {makeLine(data.map((r) => r.tier3), AMBER)}

        {/* Dots for each data point */}
        {data.map((r, i) => (
          <React.Fragment key={i}>
            <circle cx={xPos(i)} cy={yPos(r.tier1)} r={3} fill={PURPLE} />
            <circle cx={xPos(i)} cy={yPos(r.tier2)} r={3} fill={NAVY} />
            <circle cx={xPos(i)} cy={yPos(r.tier3)} r={3} fill={AMBER} />
          </React.Fragment>
        ))}

        {/* X labels */}
        {data.map((row, i) => (
          <text
            key={i}
            x={xPos(i)} y={H - 4}
            textAnchor="middle" fontSize={9}
            fill={darkMode ? '#6e7781' : MUTED}
          >
            {row.period}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 1.75, mt: 1, flexWrap: 'wrap' }}>
        {[
          { label: 'Tier 1 Strategic', col: PURPLE },
          { label: 'Tier 2 Premium', col: NAVY },
          { label: 'Tier 3 Standard', col: AMBER },
        ].map((leg) => (
          <Box key={leg.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 20, height: 2, bgcolor: leg.col, borderRadius: 0.25 }} />
            <Typography sx={{ fontSize: 10, color: c.textMuted }}>{leg.label}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

// ──────────────────────────────────────────
// Tier Margin Breakdown
// ──────────────────────────────────────────
const TierMarginBreakdown = ({ darkMode }) => {
  const c = dm(darkMode);

  return (
    <Paper elevation={0} sx={scrollCardSx(c)}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: c.text, mb: 0.5 }}>
        Net Margin by Customer Tier (after freight)
      </Typography>
      <Typography sx={{ fontSize: 11, color: c.textMuted, mb: 2, lineHeight: 1.5 }}>
        Gross margin minus allocated freight cost. Shows true profitability of each tier.
      </Typography>

      {/* Header */}
      <Box sx={{
        display: 'flex', gap: 1, pb: 1, borderBottom: `2px solid ${c.borderMedium}`, mb: 0.75,
      }}>
        <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: c.textMuted, flex: 1 }}>
          Tier
        </Typography>
        <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: c.textMuted, width: 58, textAlign: 'right' }}>
          Gross GM
        </Typography>
        <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: c.textMuted, width: 58, textAlign: 'right' }}>
          Freight %
        </Typography>
        <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: c.textMuted, width: 58, textAlign: 'right' }}>
          Net GM
        </Typography>
      </Box>

      {/* Rows */}
      <Stack divider={<Box sx={{ borderBottom: `1px solid ${c.border}` }} />}>
        {MARGIN_DATA.tierMargin.map((t, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.25 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: t.col }}>
                {t.tier}
              </Typography>
              {/* Stacked bar */}
              <Box sx={{ height: 8, bgcolor: c.border, borderRadius: 1, overflow: 'hidden', mt: 0.5, position: 'relative' }}>
                <Box sx={{
                  position: 'absolute', left: 0, top: 0, height: '100%',
                  width: `${parseFloat(t.gm)}%`, bgcolor: alpha(t.col, 0.2), borderRadius: 1,
                }} />
                <Box sx={{
                  position: 'absolute', left: 0, top: 0, height: '100%',
                  width: `${parseFloat(t.net)}%`, bgcolor: t.col, borderRadius: 1,
                }} />
              </Box>
            </Box>
            <Typography sx={{ fontSize: 12, color: c.textMuted, width: 52, textAlign: 'right' }}>
              {t.gm}
            </Typography>
            <Typography sx={{ fontSize: 12, color: AMBER, width: 52, textAlign: 'right' }}>
              −{t.freight}
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: t.col, width: 52, textAlign: 'right' }}>
              {t.net}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* Key insight */}
      <Box sx={{ mt: 1.25, p: 1.25, bgcolor: alpha(NAVY, 0.06), borderRadius: 1.5 }}>
        <Typography sx={{ fontSize: 10, color: darkMode ? '#4d9eff' : NAVY }}>
          <strong>Key insight:</strong> Tier 1 Strategic has lower gross margin than Tier 3 Standard (34.2% vs 28.1% gross), but Tier 1 net margin is 33.8% vs 26.0% for Tier 3 — because Ordly routes Tier 1 orders through optimal freight lanes (PL03 local, 0.41% freight-to-revenue).
        </Typography>
      </Box>
    </Paper>
  );
};

// ══════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════
const LoparexMarginDashboard = ({ onBack, darkMode = false }) => {
  const c = dm(darkMode);

  return (
    <Box sx={{ bgcolor: c.bg, minHeight: '100vh' }}>
      {/* Breadcrumb bar */}
      <Box sx={{
        px: 3, py: 1.5,
        bgcolor: c.paper,
        borderBottom: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <Button
          onClick={onBack}
          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: 'none', fontWeight: 600, fontSize: 12,
            color: c.textSecondary, borderRadius: 2,
            px: 1.5, minWidth: 0,
            '&:hover': { bgcolor: alpha(NAVY, 0.06) },
          }}
        >
          Back
        </Button>
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 14, color: c.textMuted }} />}
          sx={{ '& .MuiBreadcrumbs-li': { lineHeight: 1 } }}
        >
          <Link
            underline="hover"
            sx={{ fontSize: 12, fontWeight: 600, color: c.textMuted, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
            onClick={onBack}
          >
            ORDER SYNC
          </Link>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: c.navy }}>
            D3: Margin
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page content */}
      <Box sx={{ maxWidth: 1440, mx: 'auto', p: 3 }}>
        {/* Page header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: c.navy }}>
              Margin & Working Capital Intelligence
            </Typography>
            <Typography sx={{ fontSize: 12, color: c.textMuted, mt: 0.5 }}>
              Account-Based CO-PA · ACDOCA GL entries · No value fields · This week · SAP S/4HANA data only
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{
              width: 7, height: 7, borderRadius: '50%', bgcolor: '#00D264',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.3 },
              },
            }} />
            <Typography sx={{ fontSize: 11, color: c.textMuted }}>
              Updated 6 min ago
            </Typography>
          </Box>
        </Box>

        {/* KPI Row */}
        <Grid container spacing={1.75} sx={{ mb: 1.75 }}>
          {MARGIN_DATA.kpis.map((kpi, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <KPICard kpi={kpi} darkMode={darkMode} />
            </Grid>
          ))}
        </Grid>

        {/* Margin Waterfall + O2C Timeline */}
        <Grid container spacing={1.75} sx={{ mb: 1.75 }}>
          <Grid item xs={12} md={8}>
            <MarginWaterfall darkMode={darkMode} />
          </Grid>
          <Grid item xs={12} md={4}>
            <O2CTimeline darkMode={darkMode} />
          </Grid>
        </Grid>

        {/* Plant Profitability + Working Capital */}
        <Grid container spacing={1.75} sx={{ mb: 1.75 }}>
          <Grid item xs={12} md={6}>
            <PlantProfitability darkMode={darkMode} />
          </Grid>
          <Grid item xs={12} md={6}>
            <WorkingCapitalMetrics darkMode={darkMode} />
          </Grid>
        </Grid>

        {/* Freight + CO-PA Detail */}
        <Grid container spacing={1.75} sx={{ mb: 1.75 }}>
          <Grid item xs={12} md={6}>
            <FreightAnalysis darkMode={darkMode} />
          </Grid>
          <Grid item xs={12} md={6}>
            <COPADetail darkMode={darkMode} />
          </Grid>
        </Grid>

        {/* DSO Trend + Tier Margin */}
        <Grid container spacing={1.75} sx={{ mb: 1.75 }}>
          <Grid item xs={12} md={6}>
            <DSOTrendChart darkMode={darkMode} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TierMarginBreakdown darkMode={darkMode} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LoparexMarginDashboard;
