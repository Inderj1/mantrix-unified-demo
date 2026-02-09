import React, { useState } from 'react';
import {
  Box, Typography, Chip, Avatar, Stack, Button, Breadcrumbs, Link, Paper,
  LinearProgress, Collapse, Tooltip, IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import {
  Receipt as ReceiptIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Inbox as InboxIcon,
  Build as BuildIcon,
  AssignmentInd as AssignmentIndIcon,
  BarChart as BarChartIcon,
  Email as EmailIcon,
  Bolt as BoltIcon,
  Language as LanguageIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  SmartToy as SmartToyIcon,
  Save as SaveIcon,
  Send as SendIcon,
  PauseCircle as PauseCircleIcon,
  Block as BlockIcon,
  TrendingUp as TrendingUpIcon,
  Reply as ReplyIcon,
  AltRoute as AltRouteIcon,
  LocalShipping as LocalShippingIcon,
  PictureAsPdf as PdfIcon,
  OpenInNew as OpenInNewIcon,
  Fullscreen as FullscreenIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { MODULE_COLOR } from '../../config/brandColors';
import { MODULE_NAVY, NAVY_BLUE, apTheme } from './apTheme';
import {
  inboxKPIs, inboxChannels, inboxInvoices, workbenchData,
  myWorkInFlight, myWorkPosted, myWorkThreads,
} from './apMockDataV2';

// ─── Channel colors ───
const channelColors = {
  all: MODULE_NAVY,
  email: '#2563eb',
  edi: '#059669',
  portal: '#7c3aed',
};

const channelIcons = {
  all: <BarChartIcon sx={{ fontSize: 20 }} />,
  email: <EmailIcon sx={{ fontSize: 20 }} />,
  edi: <BoltIcon sx={{ fontSize: 20 }} />,
  portal: <LanguageIcon sx={{ fontSize: 20 }} />,
};

const channelLabels = {
  email: 'EMAIL', edi: 'EDI', portal: 'PORTAL',
};

// ─── Action icon map ───
const actionIcons = {
  route: <AltRouteIcon sx={{ fontSize: 14 }} />,
  gr: <LocalShippingIcon sx={{ fontSize: 14 }} />,
  hold: <PauseCircleIcon sx={{ fontSize: 14 }} />,
  reject: <BlockIcon sx={{ fontSize: 14 }} />,
  escalate: <TrendingUpIcon sx={{ fontSize: 14 }} />,
  supplier: <ReplyIcon sx={{ fontSize: 14 }} />,
};

// ─── Action button variants ───
const actionBtnStyles = {
  supplier: { bgcolor: alpha('#ea580c', 0.08), color: '#ea580c', borderColor: alpha('#ea580c', 0.2) },
  buyer:    { bgcolor: alpha('#2563eb', 0.08), color: '#2563eb', borderColor: alpha('#2563eb', 0.2) },
  gr:       { bgcolor: alpha('#d97706', 0.08), color: '#d97706', borderColor: alpha('#d97706', 0.2) },
  hold:     { bgcolor: alpha('#475569', 0.08), color: '#475569', borderColor: alpha('#475569', 0.2) },
  escalate: { bgcolor: alpha('#7c3aed', 0.08), color: '#7c3aed', borderColor: alpha('#7c3aed', 0.2) },
  reject:   { bgcolor: alpha('#dc2626', 0.08), color: '#dc2626', borderColor: alpha('#dc2626', 0.2) },
};

// ─── Format currency ───
const fmtAmt = (v) => {
  if (v == null) return '—';
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
};

const MantrixAPLanding = ({ onBack, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeChannel, setActiveChannel] = useState('all');
  const [myWorkSubTab, setMyWorkSubTab] = useState('flight');
  const [expandedThreads, setExpandedThreads] = useState({});
  const [analysisOpen, setAnalysisOpen] = useState(true);

  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';
  const surfaceBg = darkMode ? '#21262d' : '#f0f4f8';

  // ─── Tab icons ───
  const tabDefs = [
    { id: 'inbox', label: 'Inbox', icon: <InboxIcon sx={{ fontSize: 18 }} />, badge: 61, badgeColor: null },
    { id: 'workbench', label: 'Workbench', icon: <BuildIcon sx={{ fontSize: 18 }} />, badge: null },
    { id: 'mywork', label: 'My Work', icon: <AssignmentIndIcon sx={{ fontSize: 18 }} />, badge: 11, badgeColor: '#d97706' },
  ];

  // ═══════════════════════════════════════════════════════
  // INBOX TAB
  // ═══════════════════════════════════════════════════════
  const renderInbox = () => {
    const filtered = activeChannel === 'all'
      ? inboxInvoices
      : inboxInvoices.filter(inv => inv.channel === activeChannel);

    // Unified DataGrid columns — merged PO + Non-PO
    const inboxColumns = [
      {
        field: 'status', headerName: 'Status', width: 80, sortable: false,
        renderCell: (p) => {
          const chipStyle = apTheme.chips.invoiceStatus[p.value] || {};
          const label = p.value.charAt(0).toUpperCase() + p.value.slice(1);
          return <Chip label={label} size="small" sx={{ height: 22, fontSize: '0.6rem', ...chipStyle }} />;
        },
      },
      {
        field: 'type', headerName: 'Type', width: 65, sortable: false,
        renderCell: (p) => (
          <Chip label={p.value === 'po' ? 'PO' : 'Non-PO'} size="small" sx={{
            height: 20, fontSize: '0.55rem', fontWeight: 700,
            bgcolor: p.value === 'po' ? alpha('#2563eb', 0.08) : alpha('#7c3aed', 0.08),
            color: p.value === 'po' ? '#2563eb' : '#7c3aed',
            border: `1px solid ${p.value === 'po' ? alpha('#2563eb', 0.2) : alpha('#7c3aed', 0.2)}`,
          }} />
        ),
      },
      {
        field: 'vendor', headerName: 'Vendor', flex: 1, minWidth: 150, sortable: false,
        renderCell: (p) => (
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textColor }}>{p.value}</Typography>
        ),
      },
      {
        field: 'invoiceNum', headerName: 'Invoice #', width: 130, sortable: false,
        renderCell: (p) => (
          <Typography sx={{ fontSize: '0.8rem', color: textColor }}>{p.value || '—'}</Typography>
        ),
      },
      {
        field: 'poRef', headerName: 'PO Ref', width: 120, sortable: false,
        renderCell: (p) => (
          <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{p.value || '—'}</Typography>
        ),
      },
      {
        field: 'channel', headerName: 'Channel', width: 90, sortable: false,
        renderCell: (p) => {
          const chipStyle = apTheme.chips.channel[p.value] || {};
          const label = channelLabels[p.value] || p.value;
          return <Chip label={label} size="small" sx={{ height: 20, fontSize: '0.55rem', fontWeight: 700, ...chipStyle }} />;
        },
      },
      {
        field: 'amount', headerName: 'Amount', width: 110, sortable: false, align: 'right', headerAlign: 'right',
        renderCell: (p) => (
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textColor }}>
            {p.value != null ? fmtAmt(p.value) : '—'}
          </Typography>
        ),
      },
      {
        field: 'lineCount', headerName: 'Lines', width: 55, sortable: false, align: 'center', headerAlign: 'center',
        renderCell: (p) => (
          <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{p.value ?? '—'}</Typography>
        ),
      },
      {
        field: 'confidence', headerName: 'ICS', width: 80, sortable: false, align: 'center', headerAlign: 'center',
        renderCell: (p) => {
          if (p.row.status === 'processing') return <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>—</Typography>;
          const color = apTheme.getConfidenceColor(p.value);
          return (
            <Chip label={p.value} size="small" sx={{
              height: 22, fontSize: '0.7rem', fontWeight: 700,
              bgcolor: alpha(color, 0.12), color,
              minWidth: 36,
            }} />
          );
        },
      },
      {
        field: 'summary', headerName: 'AI Summary', flex: 0.8, sortable: false,
        renderCell: (p) => {
          if (p.row.status === 'processing') {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography sx={{ fontSize: '0.7rem', color: NAVY_BLUE }}>Matching...</Typography>
                <LinearProgress variant="determinate" value={p.row.confidence} sx={{
                  flex: 1, height: 3, maxWidth: 80, borderRadius: 2,
                  bgcolor: surfaceBg,
                  '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${NAVY_BLUE}, ${MODULE_NAVY})`, borderRadius: 2 },
                }} />
              </Box>
            );
          }
          return <Typography sx={{ fontSize: '0.8rem', color: textSecondary, lineHeight: 1.4 }}>{p.value}</Typography>;
        },
      },
    ];

    const inboxRows = filtered.map((inv) => ({ id: inv.id, ...inv }));

    return (
      <Box>
        {/* KPI Row */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
          {inboxKPIs.map((kpi, i) => (
            <Paper key={i} elevation={0} sx={{
              flex: 1, p: 1.5, textAlign: 'center', borderRadius: 2,
              bgcolor: cardBg, border: `1px solid ${borderColor}`,
            }}>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: kpi.color || textColor, lineHeight: 1.2 }}>
                {kpi.value}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, mt: 0.3 }}>
                {kpi.label}
              </Typography>
            </Paper>
          ))}
        </Stack>

        {/* Channel Strip */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 2 }}>
          {inboxChannels.map((ch) => {
            const isActive = activeChannel === ch.id;
            const chColor = channelColors[ch.id];
            const bk = ch.breakdown;
            const total = bk.ready + bk.review + bk.exception;
            return (
              <Paper key={ch.id} elevation={0} onClick={() => setActiveChannel(ch.id)} sx={{
                p: 1.5, cursor: 'pointer', borderRadius: 2,
                bgcolor: cardBg, border: `1px solid ${isActive ? chColor : borderColor}`,
                boxShadow: isActive ? `0 0 0 1px ${alpha(chColor, 0.2)}` : 'none',
                '&:hover': { bgcolor: alpha(chColor, 0.03), borderColor: alpha(chColor, 0.5) },
                transition: 'all 0.15s',
              }}>
                {/* Row 1: Icon + Count | Chip */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: chColor, display: 'flex' }}>{channelIcons[ch.id]}</Box>
                    <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: chColor, lineHeight: 1 }}>
                      {ch.count}
                    </Typography>
                  </Box>
                  <Chip label={ch.label.toUpperCase()} size="small" sx={{
                    height: 20, fontSize: '0.55rem', fontWeight: 700, letterSpacing: 0.5, bgcolor: alpha(chColor, 0.08), color: chColor,
                    border: `1px solid ${alpha(chColor, 0.2)}`,
                  }} />
                </Box>

                {/* Row 2: Value + Pct */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: textColor, mb: 0.5 }}>
                  {ch.value}{ch.pct ? <Typography component="span" sx={{ fontSize: '0.7rem', color: textSecondary, ml: 0.5 }}>({ch.pct})</Typography> : ''}
                </Typography>

                {/* Row 3: Progress bar */}
                {total > 0 && (
                  <Box sx={{ display: 'flex', gap: '2px', mb: 0.6, height: 4, borderRadius: 2, overflow: 'hidden', bgcolor: alpha(borderColor, 0.3) }}>
                    <Box sx={{ width: `${(bk.ready / total) * 100}%`, bgcolor: '#059669', borderRadius: 2 }} />
                    <Box sx={{ width: `${(bk.review / total) * 100}%`, bgcolor: '#d97706', borderRadius: 2 }} />
                    <Box sx={{ width: `${(bk.exception / total) * 100}%`, bgcolor: '#dc2626', borderRadius: 2 }} />
                  </Box>
                )}

                {/* Row 4: Breakdown — labeled chips */}
                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.4 }}>
                  {[
                    { count: bk.ready, color: '#059669', label: 'Ready' },
                    { count: bk.review, color: '#d97706', label: 'Review' },
                    { count: bk.exception, color: '#dc2626', label: 'Exc' },
                  ].map((s, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.3, bgcolor: alpha(s.color, 0.06), px: 0.6, py: 0.15, borderRadius: 1 }}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: s.color }} />
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: s.color }}>{s.count}</Typography>
                      <Typography sx={{ fontSize: '0.5rem', fontWeight: 600, color: alpha(s.color, 0.7), textTransform: 'uppercase', letterSpacing: 0.3 }}>{s.label}</Typography>
                    </Box>
                  ))}
                </Stack>

                {/* Row 5: Description */}
                {ch.desc && (
                  <Typography sx={{ fontSize: '0.55rem', color: textSecondary, mt: 0.6, lineHeight: 1.3, borderTop: `1px solid ${alpha(borderColor, 0.4)}`, pt: 0.5, fontStyle: 'italic' }}>{ch.desc}</Typography>
                )}
              </Paper>
            );
          })}
        </Box>

        {/* Unified Inbox DataGrid */}
        <Box sx={{ height: 480 }}>
          <DataGrid
            rows={inboxRows}
            columns={inboxColumns}
            density="compact"
            hideFooter
            disableColumnMenu
            disableSelectionOnClick
            onRowClick={(params) => {
              if (params.row.status === 'processing') return;
              setSelectedInvoice(params.row.id);
              setActiveTab('workbench');
            }}
            getRowClassName={(params) => params.row.status === 'processing' ? 'processing-row' : ''}
            sx={{
              ...apTheme.getDataGridSx({ darkMode, clickable: true }),
              '& .processing-row': { opacity: 0.55, cursor: 'default' },
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
                '&:hover': { bgcolor: darkMode ? '#21262d' : alpha(NAVY_BLUE, 0.08) },
              },
              '& .processing-row:hover': { cursor: 'default' },
            }}
          />
        </Box>
      </Box>
    );
  };

  // ═══════════════════════════════════════════════════════
  // WORKBENCH TAB
  // ═══════════════════════════════════════════════════════
  const renderWorkbench = () => {
    const wb = selectedInvoice ? workbenchData[selectedInvoice] : null;

    if (!wb) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: textSecondary }}>
          <Typography sx={{ fontSize: '0.85rem' }}>Select an invoice from the Inbox to begin review</Typography>
        </Box>
      );
    }

    const chColor = channelColors[wb.channel] || '#64748b';
    const chLabel = wb.channel === 'edi' ? 'EDI / IDOC' : wb.channel === 'portal' ? 'SUPPLIER PORTAL' : 'EMAIL / OCR';

    // Build DataGrid columns — reduced from 16 to 9
    const columns = [
      { field: 'idx', headerName: '#', width: 36, sortable: false, renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{p.value}</Typography> },
      { field: 'lineType', headerName: 'Type', width: 60, sortable: false, renderCell: (p) => (
        <Chip label={p.value === 'gl' ? 'GL' : 'PO'} size="small" sx={{
          height: 18, fontSize: '0.55rem', fontWeight: 700, bgcolor: p.value === 'gl' ? alpha('#7c3aed', 0.08) : alpha('#2563eb', 0.08),
          color: p.value === 'gl' ? '#7c3aed' : '#2563eb',
          border: `1px solid ${p.value === 'gl' ? alpha('#7c3aed', 0.2) : alpha('#2563eb', 0.2)}`,
        }} />
      )},
      { field: 'desc', headerName: 'Description', flex: 1, minWidth: 160, sortable: false },
      { field: 'col2', headerName: 'PO# / GL', width: 100, sortable: false, renderCell: (p) => (
        <Typography sx={{ fontSize: '0.8rem', color: p.row.lineType === 'gl' ? '#7c3aed' : textColor }}>{p.value}</Typography>
      )},
      { field: 'qty', headerName: 'Qty', width: 50, type: 'number', sortable: false },
      { field: 'price', headerName: 'Price', width: 90, sortable: false, align: 'right', headerAlign: 'right' },
      { field: 'amount', headerName: 'Amount', width: 100, sortable: false, align: 'right', headerAlign: 'right', renderCell: (p) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textColor }}>{p.value}</Typography>
      )},
      { field: 'grOrConf', headerName: 'GR / Conf.', width: 90, sortable: false, renderCell: (p) => {
        const isGL = p.row.lineType === 'gl';
        const val = p.value;
        if (isGL) {
          const confMatch = val.match(/(\d+)/);
          const confNum = confMatch ? parseInt(confMatch[1]) : 0;
          const color = apTheme.getConfidenceColor(confNum);
          return <Chip label={val} size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(color, 0.1), color }} />;
        }
        const gc = val === '—' || val === 'DUP' ? '#dc2626' : '#059669';
        return <Typography sx={{ fontSize: '0.8rem', color: gc }}>{val}</Typography>;
      }},
      { field: 'matchLabel', headerName: 'Status', width: 100, sortable: false, renderCell: (p) => {
        const st = p.row.matchStatus;
        const chipStyle = st === 'ok' ? apTheme.chips.lineMatch.matched
          : st === 'warning' ? apTheme.chips.lineMatch.partial
          : apTheme.chips.lineMatch.exception;
        return <Chip label={p.value} size="small" sx={{ height: 20, fontSize: '0.55rem', ...chipStyle }} />;
      }},
    ];

    const rows = wb.lines.map((line, i) => ({ id: i, idx: i + 1, ...line }));

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 260px)', minHeight: 500 }}>

        {/* ── ROW 1: Context Bar — Back + Vendor + Amount ── */}
        <Box sx={{
          display: 'flex', alignItems: 'center',
          px: 2.5, py: 0.8,
          bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '8px 8px 0 0',
        }}>
          <Button size="small" onClick={() => setActiveTab('inbox')} sx={{ fontSize: '0.75rem', color: textSecondary, textTransform: 'none', fontWeight: 500, mr: 2, '&:hover': { color: MODULE_NAVY } }}>
            <ArrowBackIcon sx={{ fontSize: 14, mr: 0.5 }} /> Back to Inbox
          </Button>
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Typography component="span" sx={{ fontSize: '0.85rem', fontWeight: 700, color: textColor }}>{wb.vendor}</Typography>
            <Typography component="span" sx={{ fontSize: '0.7rem', color: textSecondary, ml: 1.5 }}>{wb.meta}</Typography>
          </Box>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: textColor, ml: 2 }}>{wb.amount}</Typography>
        </Box>

        {/* ── ROW 2: Informational strip — Timeline + Approval + Verdicts ── */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 2, py: 0.5,
          bgcolor: surfaceBg,
          borderLeft: `1px solid ${borderColor}`, borderRight: `1px solid ${borderColor}`,
          flexWrap: 'nowrap', overflowX: 'auto',
        }}>
          {/* Timeline (compact horizontal) */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
            {wb.timeline.map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Box sx={{ width: 16, height: 2, bgcolor: (s === 1 || wb.timeline[i - 1] === 1) ? '#059669' : alpha(borderColor, 0.5), mt: '-10px' }} />}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{
                    width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.55rem', fontWeight: 700,
                    ...(s === 1 ? { bgcolor: '#059669', color: '#fff' } :
                      s === 2 ? { bgcolor: alpha(MODULE_NAVY, 0.12), color: MODULE_NAVY, border: `2px solid ${MODULE_NAVY}` } :
                      { bgcolor: cardBg, color: textSecondary, border: `1.5px solid ${borderColor}` }),
                  }}>
                    {s === 1 ? <CheckIcon sx={{ fontSize: 10 }} /> : s === 2 ? '●' : (i + 1)}
                  </Box>
                  <Typography sx={{ fontSize: '0.55rem', textTransform: 'uppercase', fontWeight: 600, mt: 0.15, textAlign: 'center', whiteSpace: 'nowrap', color: s === 1 ? '#059669' : s === 2 ? MODULE_NAVY : textSecondary }}>
                    {wb.timelineLabels[i]}
                  </Typography>
                </Box>
              </React.Fragment>
            ))}
          </Box>

          <Box sx={{ width: 1, height: 24, bgcolor: borderColor, flexShrink: 0 }} />

          {/* Approval chip */}
          {wb.approval.needed ? (
            <Tooltip title={`${wb.approval.reason}${wb.approval.who ? ` — ${wb.approval.who}` : ''}`} arrow>
              <Chip icon={<WarningIcon />} label="Approval" size="small" sx={{ height: 22, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha('#d97706', 0.08), color: '#d97706', border: `1px solid ${alpha('#d97706', 0.2)}`, '& .MuiChip-icon': { color: '#d97706', fontSize: 13 } }} />
            </Tooltip>
          ) : (
            <Chip icon={<CheckCircleIcon />} label="No Approval" size="small" sx={{ height: 22, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha('#059669', 0.08), color: '#059669', border: `1px solid ${alpha('#059669', 0.2)}`, '& .MuiChip-icon': { color: '#059669', fontSize: 13 } }} />
          )}

          {/* Verdict chips */}
          {wb.verdicts.map((v, i) => {
            let bg, fg;
            if (v.status === 'ok') { bg = alpha('#059669', 0.08); fg = '#059669'; }
            else if (v.status === 'warning') { bg = alpha('#d97706', 0.08); fg = '#d97706'; }
            else if (v.status === 'info') { bg = alpha('#7c3aed', 0.08); fg = '#7c3aed'; }
            else { bg = alpha('#dc2626', 0.08); fg = '#dc2626'; }
            return <Chip key={i} label={v.text} size="small" sx={{ height: 22, fontSize: '0.6rem', fontWeight: 500, bgcolor: bg, color: fg }} />;
          })}
        </Box>

        {/* ── ROW 3: Action strip — AI Rec (full) + Action Buttons + Save + Submit ── */}
        <Box sx={{
          display: 'flex', flexDirection: 'column',
          bgcolor: cardBg,
          borderLeft: `1px solid ${borderColor}`, borderRight: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`,
          borderTop: `1px solid ${alpha(borderColor, 0.5)}`,
        }}>
          {/* AI Recommendation — full width inline */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 2, py: 0.5, bgcolor: alpha('#7c3aed', 0.03), borderBottom: `1px solid ${alpha(borderColor, 0.3)}` }}>
            <SmartToyIcon sx={{ fontSize: 14, color: '#7c3aed', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.75rem', color: darkMode ? '#c4b5fd' : '#5b21b6', fontWeight: 500, lineHeight: 1.4 }}>{wb.aiRec}</Typography>
          </Box>
          {/* Action buttons row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.5 }}>
            {wb.actions.map((act, i) => {
              const style = actionBtnStyles[act.variant] || actionBtnStyles.hold;
              return (
                <Button key={i} size="small" startIcon={actionIcons[act.icon]} sx={{
                  textTransform: 'none', fontSize: '0.7rem', fontWeight: 600, borderRadius: 1.2, px: 1.5, py: 0.3, whiteSpace: 'nowrap',
                  bgcolor: style.bgcolor, color: style.color, border: `1px solid ${style.borderColor}`,
                  '& .MuiButton-startIcon': { mr: 0.3 },
                }}>
                  {act.label}
                </Button>
              );
            })}
            {wb.reasonOptions && (
              <Box component="select" sx={{ p: '3px 8px', border: `1px solid ${borderColor}`, borderRadius: 1, fontSize: '0.7rem', color: textColor, bgcolor: cardBg, outline: 'none' }}>
                {wb.reasonOptions.map((r, i) => <option key={i}>{r}</option>)}
              </Box>
            )}

            <Box sx={{ flex: 1 }} />

            <Button size="small" sx={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'none', border: `1px solid ${borderColor}`, borderRadius: 1.5, px: 1.5, bgcolor: cardBg, color: textSecondary, whiteSpace: 'nowrap', '&:hover': { borderColor: alpha(MODULE_NAVY, 0.3), color: MODULE_NAVY } }}>
              <SaveIcon sx={{ fontSize: 14, mr: 0.3 }} /> Save
            </Button>
            <Button size="small" sx={{
              fontSize: '0.7rem', fontWeight: 600, textTransform: 'none', borderRadius: 1.5, px: 2, color: '#fff', whiteSpace: 'nowrap',
              ...(wb.submit.variant === 'go' ? { background: `linear-gradient(135deg, #059669, ${MODULE_NAVY})` } :
                wb.submit.variant === 'approval' ? { background: 'linear-gradient(135deg, #d97706, #E5A00D)' } :
                { bgcolor: surfaceBg, color: textSecondary, cursor: 'not-allowed' }),
            }}>
              {wb.submit.label}
            </Button>
          </Box>
        </Box>

        {/* ── MAIN: 2-column — Left (PDF + Extracted Data) | Right (Headers + Grid + Analysis) ── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 0, flex: 1, overflow: 'hidden', border: `1px solid ${borderColor}`, borderRadius: '0 0 8px 8px' }}>

          {/* LEFT — PDF Viewer + Extracted Data */}
          <Box sx={{ bgcolor: cardBg, borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: alpha(MODULE_NAVY, 0.15), borderRadius: 2 } }}>
            {/* Channel badge */}
            <Box sx={{ textAlign: 'center', py: 0.6, borderBottom: `1px solid ${alpha(borderColor, 0.5)}` }}>
              <Chip icon={channelIcons[wb.channel]} label={chLabel} size="small" sx={{ height: 22, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha(chColor, 0.08), color: chColor, border: `1px solid ${alpha(chColor, 0.2)}`, '& .MuiChip-icon': { color: chColor, fontSize: 14 } }} />
            </Box>

            {/* PDF Viewer */}
            <Box sx={{ m: 1, borderRadius: 1.5, overflow: 'hidden', border: `1px solid ${alpha(borderColor, 0.5)}`, display: 'flex', flexDirection: 'column' }}>
              {/* PDF Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.5, borderBottom: '1px solid', borderColor: alpha(borderColor, 0.5), bgcolor: darkMode ? '#0f172a' : '#e2e8f0' }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <PdfIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#334155' }}>
                    {wb.meta.split(' · ')[0]}.pdf
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0}>
                  <Tooltip title="Zoom in">
                    <IconButton size="small" sx={{ color: '#64748b', p: 0.3 }}>
                      <ZoomInIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Zoom out">
                    <IconButton size="small" sx={{ color: '#64748b', p: 0.3 }}>
                      <ZoomOutIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Open in new tab">
                    <IconButton size="small" sx={{ color: '#64748b', p: 0.3 }}>
                      <OpenInNewIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Fullscreen">
                    <IconButton size="small" sx={{ color: '#64748b', p: 0.3 }}>
                      <FullscreenIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              {/* PDF Document Body */}
              <Box sx={{ bgcolor: darkMode ? '#1a1f2e' : '#f8f9fa', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', position: 'relative', minHeight: 280 }}>
                {/* Simulated PDF page */}
                <Box sx={{ width: '90%', mt: 1.5, mx: 'auto', bgcolor: darkMode ? '#252a36' : '#fff', borderRadius: 0.5, boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.1)', p: 2, overflow: 'hidden' }}>
                  {/* Header area */}
                  <Box sx={{ mb: 1.5, pb: 1, borderBottom: `1px solid ${alpha(borderColor, 0.3)}` }}>
                    <Box sx={{ width: '45%', height: 8, bgcolor: alpha(MODULE_NAVY, 0.15), borderRadius: 0.5, mb: 0.8 }} />
                    <Box sx={{ width: '65%', height: 5, bgcolor: alpha(textSecondary, 0.08), borderRadius: 0.5, mb: 0.4 }} />
                    <Box sx={{ width: '55%', height: 5, bgcolor: alpha(textSecondary, 0.08), borderRadius: 0.5 }} />
                  </Box>
                  {/* Table-like area */}
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      <Box sx={{ flex: 2, height: 6, bgcolor: alpha(MODULE_NAVY, 0.1), borderRadius: 0.3 }} />
                      <Box sx={{ flex: 1, height: 6, bgcolor: alpha(MODULE_NAVY, 0.1), borderRadius: 0.3 }} />
                      <Box sx={{ flex: 1, height: 6, bgcolor: alpha(MODULE_NAVY, 0.1), borderRadius: 0.3 }} />
                    </Box>
                    {[1,2,3,4,5,6].map(r => (
                      <Box key={r} sx={{ display: 'flex', gap: 0.5, mb: 0.4 }}>
                        <Box sx={{ flex: 2, height: 5, bgcolor: alpha(textSecondary, 0.06), borderRadius: 0.3 }} />
                        <Box sx={{ flex: 1, height: 5, bgcolor: alpha(textSecondary, 0.06), borderRadius: 0.3 }} />
                        <Box sx={{ flex: 1, height: 5, bgcolor: alpha(textSecondary, 0.06), borderRadius: 0.3 }} />
                      </Box>
                    ))}
                  </Box>
                  {/* Body text lines */}
                  {[1,2,3,4].map(l => (
                    <Box key={l} sx={{ width: `${65 + Math.random() * 30}%`, height: 4, bgcolor: alpha(textSecondary, 0.06), borderRadius: 0.3, mb: 0.4 }} />
                  ))}
                  {/* Footer area */}
                  <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${alpha(borderColor, 0.2)}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Box sx={{ width: '25%', height: 5, bgcolor: alpha(textSecondary, 0.08), borderRadius: 0.3 }} />
                      <Box sx={{ width: '15%', height: 5, bgcolor: alpha(MODULE_NAVY, 0.12), borderRadius: 0.3 }} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Extracted Data — 2-column grid in left panel */}
            <Box sx={{ px: 1.5, py: 1, borderTop: `1px solid ${alpha(borderColor, 0.3)}` }}>
              <Typography sx={{ fontSize: '0.65rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, mb: 0.8 }}>Extracted Data</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {wb.evidence.map((ev, i) => (
                  <Box key={i} sx={{ py: 0.4 }}>
                    <Typography sx={{ fontSize: '0.65rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, lineHeight: 1.2 }}>{ev.label}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.2 }}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: ev.ok ? '#059669' : '#dc2626', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: ev.ok ? '#059669' : '#dc2626' }}>{ev.value}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* RIGHT — Headers + DataGrid + Analysis & Posting */}
          <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: cardBg }}>
            {/* Header fields — compact inline row */}
            <Typography sx={{ px: 1.5, py: 0.5, borderBottom: `1px solid ${borderColor}`, bgcolor: darkMode ? 'rgba(0,0,0,0.08)' : alpha(MODULE_NAVY, 0.02), fontSize: '0.75rem', lineHeight: 1.8 }}>
              {wb.headerFields.map((hf, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <Typography component="span" sx={{ mx: 0.8, color: alpha(borderColor, 0.8), fontSize: '0.7rem' }}>|</Typography>}
                  <Typography component="span" sx={{ fontSize: '0.6rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.3, fontWeight: 600, mr: 0.4 }}>{hf.label}</Typography>
                  <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, color: hf.locked ? textSecondary : textColor }}>{hf.value}</Typography>
                </React.Fragment>
              ))}
            </Typography>

            {/* DataGrid */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                density="compact"
                hideFooter
                disableColumnMenu
                disableSelectionOnClick
                getRowClassName={(params) => params.row.lineType === 'gl' ? 'gl-row' : ''}
                sx={{
                  ...apTheme.getDataGridSx({ darkMode }),
                  border: 'none', borderRadius: 0,
                  '& .gl-row': { bgcolor: alpha('#7c3aed', 0.02), borderLeft: '3px solid #7c3aed' },
                }}
              />
            </Box>

            {/* Analysis & Posting — collapsible */}
            {(wb.rootCause || wb.bapiInfo) && (
              <Box sx={{ borderTop: `1px solid ${borderColor}` }}>
                <Box
                  onClick={() => setAnalysisOpen(!analysisOpen)}
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 1.5, py: 0.5, cursor: 'pointer',
                    bgcolor: surfaceBg, '&:hover': { bgcolor: alpha(MODULE_NAVY, 0.04) },
                  }}
                >
                  <Typography sx={{ fontSize: '0.65rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                    Analysis & Posting
                  </Typography>
                  {analysisOpen ? <ExpandLessIcon sx={{ fontSize: 16, color: textSecondary }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: textSecondary }} />}
                </Box>
                <Collapse in={analysisOpen}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: wb.rootCause ? '1fr 1fr' : '1fr', gap: 1.5, px: 1.5, py: 1 }}>
                    {/* Root cause — structured card */}
                    {wb.rootCause && (
                      <Box sx={{ p: 1.2, bgcolor: alpha('#d97706', 0.04), border: `1px solid ${alpha('#d97706', 0.15)}`, borderRadius: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                          <WarningIcon sx={{ fontSize: 14, color: '#d97706' }} />
                          <Typography sx={{ fontSize: '0.65rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Root Cause Analysis</Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8 }}>
                          <Box>
                            <Typography sx={{ fontSize: '0.6rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Pattern</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: textColor, lineHeight: 1.4, mt: 0.2 }}>{wb.rootCause.pattern}</Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '0.6rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Prediction</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: textColor, lineHeight: 1.4, mt: 0.2 }}>{wb.rootCause.prediction}</Typography>
                          </Box>
                          <Box sx={{ gridColumn: '1 / -1' }}>
                            <Typography sx={{ fontSize: '0.6rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Background</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: textColor, lineHeight: 1.4, mt: 0.2 }}>{wb.rootCause.background}</Typography>
                          </Box>
                          <Box sx={{ gridColumn: '1 / -1' }}>
                            <Typography sx={{ fontSize: '0.6rem', color: '#d97706', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Recommendation</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: textColor, fontWeight: 600, lineHeight: 1.4, mt: 0.2 }}>{wb.rootCause.recommendation}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                    {/* Posting summary — matching card */}
                    <Box sx={{ p: 1.2, bgcolor: alpha(MODULE_NAVY, 0.03), border: `1px solid ${alpha(MODULE_NAVY, 0.12)}`, borderRadius: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                        <SendIcon sx={{ fontSize: 13, color: MODULE_NAVY }} />
                        <Typography sx={{ fontSize: '0.65rem', color: MODULE_NAVY, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Posting Summary</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                        {wb.bapiInfo.split('\n').map((line, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: line.includes('Route') || line.includes('Approval') ? '#d97706' : line.includes('No BAPI') ? textSecondary : '#059669', flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '0.75rem', color: textColor, lineHeight: 1.5 }}>{line}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  // ═══════════════════════════════════════════════════════
  // MY WORK TAB
  // ═══════════════════════════════════════════════════════
  const renderMyWork = () => {
    const subTabDefs = [
      { id: 'flight', label: 'In Flight', badge: 7, badgeColor: '#d97706' },
      { id: 'posted', label: 'Posted', badge: 5, badgeColor: '#059669' },
      { id: 'threads', label: 'Threads', badge: 2, badgeColor: '#2563eb' },
    ];

    // In Flight DataGrid columns
    const flightColumns = [
      {
        field: 'statusLabel', headerName: 'Status', width: 100, sortable: false,
        renderCell: (p) => {
          const chipStyle = apTheme.chips.myWorkStatus[p.row.status] || {};
          return <Chip label={p.value} size="small" sx={{ height: 22, fontSize: '0.6rem', fontWeight: 600, ...chipStyle }} />;
        },
      },
      {
        field: 'vendor', headerName: 'Vendor', flex: 1, minWidth: 130, sortable: false,
        renderCell: (p) => (
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textColor }}>{p.value}</Typography>
        ),
      },
      {
        field: 'detail', headerName: 'Info', width: 160, sortable: false,
        renderCell: (p) => (
          <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{p.value}</Typography>
        ),
      },
      {
        field: 'amount', headerName: 'Amount', width: 110, sortable: false, align: 'right', headerAlign: 'right',
        renderCell: (p) => {
          const statusColors = { ready: '#059669', hold: '#475569', supplier: '#ea580c' };
          const color = statusColors[p.row.status] || textColor;
          return <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color }}>{p.value}</Typography>;
        },
      },
      {
        field: 'statusDetail', headerName: 'Detail', width: 160, sortable: false,
        renderCell: (p) => {
          const statusColors = { ready: '#059669', hold: '#475569', supplier: '#ea580c', buyer: '#2563eb', gr: '#d97706', escalated: '#7c3aed', approval: '#d97706' };
          const color = statusColors[p.row.status] || textSecondary;
          return <Typography sx={{ fontSize: '0.8rem', color }}>{p.value}</Typography>;
        },
      },
      {
        field: 'actionLabel', headerName: 'Action', width: 100, sortable: false,
        renderCell: (p) => {
          if (p.row.actionVariant === 'ready') {
            return (
              <Button size="small" sx={{
                fontSize: '0.7rem', fontWeight: 600, textTransform: 'none', borderRadius: 1.2, px: 1.2,
                bgcolor: alpha('#059669', 0.08), border: `1px solid ${alpha('#059669', 0.2)}`, color: '#059669',
              }}>
                {p.value}
              </Button>
            );
          }
          return <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{p.value}</Typography>;
        },
      },
    ];

    const flightRows = myWorkInFlight.map((item) => ({ ...item }));

    // Posted DataGrid columns
    const postedColumns = [
      {
        field: 'vendor', headerName: 'Vendor', flex: 1, minWidth: 130, sortable: false,
        renderCell: (p) => (
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textColor }}>{p.value}</Typography>
        ),
      },
      {
        field: 'detail', headerName: 'Info', width: 130, sortable: false,
        renderCell: (p) => (
          <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{p.value}</Typography>
        ),
      },
      {
        field: 'amount', headerName: 'Amount', width: 110, sortable: false, align: 'right', headerAlign: 'right',
        renderCell: (p) => (
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textColor }}>{p.value}</Typography>
        ),
      },
      {
        field: 'sapDoc', headerName: 'SAP Doc', width: 140, sortable: false,
        renderCell: (p) => (
          <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{p.value}</Typography>
        ),
      },
      {
        field: 'time', headerName: 'Posted', width: 140, sortable: false,
        renderCell: (p) => (
          <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{p.value}</Typography>
        ),
      },
    ];

    const postedRows = myWorkPosted.map((item) => ({ ...item }));

    return (
      <Box>
        {/* KPI Row */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
          {[
            { value: '11', label: 'In Flight', color: '#d97706' },
            { value: '5', label: 'Posted Today', color: '#059669' },
            { value: '$536,650', label: 'Value Posted', color: textColor },
          ].map((kpi, i) => (
            <Paper key={i} elevation={0} sx={{
              flex: 1, p: 1.5, textAlign: 'center', borderRadius: 2,
              bgcolor: cardBg, border: `1px solid ${borderColor}`,
            }}>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: kpi.color, lineHeight: 1.2 }}>
                {kpi.value}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, mt: 0.3 }}>
                {kpi.label}
              </Typography>
            </Paper>
          ))}
        </Stack>

        {/* Sub-tabs */}
        <Stack direction="row" spacing={0} sx={{ mb: 1.5, bgcolor: cardBg, border: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, borderRadius: '8px 8px 0 0', px: 1 }}>
          {subTabDefs.map((st) => {
            const isActive = myWorkSubTab === st.id;
            return (
              <Button key={st.id} size="small" onClick={() => setMyWorkSubTab(st.id)} sx={{
                fontSize: '0.8rem', textTransform: 'none', borderRadius: 0, px: 2, py: 1.2,
                fontWeight: isActive ? 700 : 500, minWidth: 0,
                color: isActive ? MODULE_NAVY : textSecondary,
                borderBottom: isActive ? `2px solid ${MODULE_NAVY}` : '2px solid transparent',
                '&:hover': { bgcolor: alpha(MODULE_NAVY, 0.04) },
              }}>
                {st.label}
                {st.badge != null && (
                  <Box component="span" sx={{
                    ml: 0.7, fontSize: '0.65rem', fontWeight: 700, px: 0.6, py: 0.1, borderRadius: 10,
                    bgcolor: isActive ? alpha(MODULE_NAVY, 0.12) : alpha(st.badgeColor, 0.12),
                    color: isActive ? MODULE_NAVY : st.badgeColor,
                  }}>
                    {st.badge}
                  </Box>
                )}
              </Button>
            );
          })}
        </Stack>

        <Paper elevation={0} sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}`, borderTop: 'none', borderRadius: '0 0 8px 8px', p: 2, minHeight: '50vh' }}>
          {/* In Flight */}
          {myWorkSubTab === 'flight' && (
            <Box>
              {/* NEW banner */}
              <Box sx={{
                mb: 1.5, p: '10px 14px', bgcolor: alpha('#059669', 0.06),
                borderLeft: `3px solid #059669`, borderRadius: '0 6px 6px 0',
                display: 'flex', alignItems: 'flex-start', gap: 1,
              }}>
                <Chip label="NEW" size="small" sx={{ height: 20, fontSize: '0.55rem', fontWeight: 700, bgcolor: '#059669', color: '#fff', mt: 0.2 }} />
                <Typography sx={{ fontSize: '0.75rem', color: textColor }}>
                  <strong>GR Posted:</strong> Honeywell — 3 lines ready $94,200
                </Typography>
              </Box>

              <Box sx={{ height: 380 }}>
                <DataGrid
                  rows={flightRows}
                  columns={flightColumns}
                  density="compact"
                  hideFooter
                  disableColumnMenu
                  disableSelectionOnClick
                  sx={apTheme.getDataGridSx({ darkMode })}
                />
              </Box>
            </Box>
          )}

          {/* Posted */}
          {myWorkSubTab === 'posted' && (
            <Box>
              <Box sx={{ height: 300 }}>
                <DataGrid
                  rows={postedRows}
                  columns={postedColumns}
                  density="compact"
                  hideFooter
                  disableColumnMenu
                  disableSelectionOnClick
                  sx={apTheme.getDataGridSx({ darkMode })}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderTop: `1px solid ${borderColor}`, mt: 0.5 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: textSecondary }}>5 posted</Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>$536,650</Typography>
              </Box>
            </Box>
          )}

          {/* Threads */}
          {myWorkSubTab === 'threads' && (
            <Box>
              {myWorkThreads.map((thread) => (
                <Paper key={thread.id} elevation={0} sx={{ bgcolor: surfaceBg, border: `1px solid ${borderColor}`, borderRadius: 2.5, mb: 1.5, overflow: 'hidden' }}>
                  <Box
                    onClick={() => setExpandedThreads(prev => ({ ...prev, [thread.id]: !prev[thread.id] }))}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '12px 16px', borderBottom: `1px solid ${alpha(borderColor, 0.5)}`, cursor: 'pointer' }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: textColor }}>{thread.vendor}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: textSecondary }}>{thread.issue}</Typography>
                    </Box>
                    <Chip label={thread.status} size="small" sx={{
                      height: 22, fontSize: '0.6rem', fontWeight: 600,
                      bgcolor: alpha('#d97706', 0.08), color: '#d97706', border: `1px solid ${alpha('#d97706', 0.2)}`,
                    }} />
                  </Box>
                  <Collapse in={!!expandedThreads[thread.id]}>
                    <Box sx={{ p: '12px 16px' }}>
                      {thread.messages.map((msg, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Avatar sx={{ width: 26, height: 26, fontSize: '0.55rem', fontWeight: 700, background: `linear-gradient(135deg, ${MODULE_NAVY}, ${NAVY_BLUE})`, flexShrink: 0, mt: 0.3 }}>
                            {msg.avatar}
                          </Avatar>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: textColor }}>{msg.author}</Typography>
                              <Typography sx={{ fontSize: '0.65rem', color: textSecondary }}>{msg.time}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.75rem', color: textColor, lineHeight: 1.5, mt: 0.2 }}>{msg.text}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  // ═══════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" onClick={onBack} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>
          CORE.AI
        </Link>
        <Typography color={textColor} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>AP.AI</Typography>
      </Breadcrumbs>

      {/* Module Header */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 2, bgcolor: cardBg, border: `1px solid ${borderColor}`, boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(MODULE_COLOR, 0.1), color: MODULE_COLOR }}>
            <ReceiptIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700} sx={{ color: MODULE_COLOR }}>AP.AI</Typography>
              <Chip label="Inbox · Workbench · My Work" size="small" sx={{ bgcolor: alpha(MODULE_COLOR, 0.1), color: MODULE_COLOR, fontWeight: 600, fontSize: '0.7rem' }} />
            </Stack>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              Accounts Payable Intelligence — AI-Driven Invoice Processing
            </Typography>
          </Box>
          <Button size="small" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: textSecondary, textTransform: 'none', fontSize: '0.8rem' }}>Back</Button>
        </Box>
      </Paper>

      {/* Navigation Tab Bar */}
      <Box sx={{ borderBottom: `1px solid ${borderColor}`, mb: 2 }}>
        <Stack direction="row" spacing={0}>
          {tabDefs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                size="small"
                startIcon={tab.icon}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  fontSize: '0.8rem', textTransform: 'none',
                  borderRadius: '8px 8px 0 0',
                  px: 2.5, py: 1.2, minWidth: 0,
                  fontWeight: isActive ? 700 : 500,
                  bgcolor: isActive ? alpha(MODULE_NAVY, 0.12) : 'transparent',
                  color: isActive ? MODULE_NAVY : textSecondary,
                  borderBottom: isActive ? `3px solid ${MODULE_NAVY}` : '3px solid transparent',
                  '&:hover': { bgcolor: isActive ? alpha(MODULE_NAVY, 0.12) : alpha(MODULE_NAVY, 0.04) },
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
                {tab.badge != null && (
                  <Box component="span" sx={{
                    ml: 0.8, fontSize: '0.65rem', fontWeight: 700, px: 0.7, py: 0.15, borderRadius: 10,
                    bgcolor: isActive ? alpha(MODULE_NAVY, 0.2) : alpha(tab.badgeColor || '#64748b', 0.12),
                    color: isActive ? MODULE_NAVY : (tab.badgeColor || '#64748b'),
                  }}>
                    {tab.badge}
                  </Box>
                )}
              </Button>
            );
          })}
        </Stack>
      </Box>

      {/* Tab Content */}
      {activeTab === 'inbox' && renderInbox()}
      {activeTab === 'workbench' && renderWorkbench()}
      {activeTab === 'mywork' && renderMyWork()}
    </Box>
  );
};

export default MantrixAPLanding;
