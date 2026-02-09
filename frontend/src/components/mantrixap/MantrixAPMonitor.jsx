import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Stack, Breadcrumbs, Link, Button, Chip, Collapse, Avatar,
  Snackbar, Alert, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import {
  MonitorHeart as MonitorHeartIcon,
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  Close as CloseIcon,
  Description as InvoiceDocIcon,
  Assignment as POIcon,
  Inventory2 as GRIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { MODULE_NAVY, NAVY_BLUE, apTheme } from './apTheme';
import { MODULE_COLOR } from '../../config/brandColors';
import {
  monitorKPIs, postedRows, queuedRows, parkedRows,
  failedDetail, activityLog, errorGuide,
} from './apMonitorMockData';

// ─── Color helpers (matching MantrixAPLanding exactly) ───
const STATUS_COLORS = {
  green: '#059669', teal: '#0d9488', blue: '#2563eb', amber: '#d97706', red: '#dc2626',
};
const OWNER_COLORS = {
  slate: { bgcolor: alpha('#475569', 0.08), color: '#475569', border: `1px solid ${alpha('#475569', 0.2)}` },
  blue:  { bgcolor: alpha('#2563eb', 0.08), color: '#2563eb', border: `1px solid ${alpha('#2563eb', 0.2)}` },
  amber: { bgcolor: alpha('#d97706', 0.08), color: '#d97706', border: `1px solid ${alpha('#d97706', 0.2)}` },
  purple:{ bgcolor: alpha('#7c3aed', 0.08), color: '#7c3aed', border: `1px solid ${alpha('#7c3aed', 0.2)}` },
};
const LOG_TYPE_COLORS = {
  posted: { bgcolor: alpha('#059669', 0.08), color: '#059669' },
  auto:   { bgcolor: alpha('#0d9488', 0.08), color: '#0d9488' },
  queued: { bgcolor: alpha('#2563eb', 0.08), color: '#2563eb' },
  parked: { bgcolor: alpha('#d97706', 0.08), color: '#d97706' },
  failed: { bgcolor: alpha('#dc2626', 0.08), color: '#dc2626' },
  gr:     { bgcolor: alpha('#7c3aed', 0.08), color: '#7c3aed' },
  ingest: { bgcolor: alpha('#475569', 0.08), color: '#475569' },
};

// ─── Tab definitions ───
const TABS = [
  { id: 'posted',  label: 'Posted',       badge: 28, badgeColor: '#059669' },
  { id: 'queued',  label: 'Queued',        badge: 2,  badgeColor: '#2563eb' },
  { id: 'parked',  label: 'Parked',        badge: 4,  badgeColor: '#d97706' },
  { id: 'failed',  label: 'Failed',        badge: 1,  badgeColor: '#dc2626' },
  { id: 'log',     label: 'Activity Log',  badge: null },
  { id: 'errors',  label: 'Error Guide',   badge: null },
];

// ─── Format currency ───
const fmtAmt = (v) => {
  if (v == null) return '—';
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
};

// ─── Posted DataGrid columns ───
const makePostedColumns = (textColor, textSecondary) => [
  {
    field: 'status', headerName: 'Status', width: 80,
    renderCell: () => <Chip label="Posted" size="small" sx={{ height: 22, fontSize: '0.6rem', ...apTheme.chips.invoiceStatus.posted }} />,
  },
  { field: 'sapDoc', headerName: 'SAP Doc #', width: 110,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d9488' }}>{p.value}</Typography>,
  },
  { field: 'fy', headerName: 'FY', width: 50,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{p.value}</Typography>,
  },
  { field: 'postDate', headerName: 'Post Date', width: 70,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textColor }}>{p.value}</Typography>,
  },
  { field: 'vendor', headerName: 'Vendor', flex: 1, minWidth: 150,
    renderCell: (p) => (
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textColor }}>{p.value}</Typography>
        <Typography sx={{ fontSize: '0.65rem', color: textSecondary }}>
          {p.row.vendorCode} · {p.row.lines} lines{p.row.vendorNote ? ` · ${p.row.vendorNote}` : ''}
        </Typography>
      </Box>
    ),
  },
  { field: 'invoiceRef', headerName: 'Invoice Ref', width: 130,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textColor }}>{p.value}</Typography>,
  },
  { field: 'poNumber', headerName: 'PO Number', width: 110,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: p.value.startsWith('—') ? textSecondary : '#2563eb' }}>{p.value}</Typography>,
  },
  { field: 'poValue', headerName: 'PO Value', width: 100, align: 'right', headerAlign: 'right',
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textColor }}>{p.value != null ? fmtAmt(p.value) : '—'}</Typography>,
  },
  { field: 'invValue', headerName: 'Inv Value', width: 100, align: 'right', headerAlign: 'right',
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textColor }}>{fmtAmt(p.value)}</Typography>,
  },
  { field: 'variance', headerName: 'Variance', width: 100, align: 'right', headerAlign: 'right',
    renderCell: (p) => {
      const cls = p.row.varianceClass;
      const color = cls === 'ok' ? '#059669' : cls === 'na' ? textSecondary : '#d97706';
      return <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color }}>{p.value}</Typography>;
    },
  },
  { field: 'grRef', headerName: 'GR Ref', width: 110,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: p.value.startsWith('—') ? textSecondary : '#059669' }}>{p.value}</Typography>,
  },
  { field: 'paymentDue', headerName: 'Payment', width: 100,
    renderCell: (p) => {
      const cls = p.row.paymentClass;
      const color = cls === 'disc' ? '#059669' : cls === 'soon' ? '#d97706' : textSecondary;
      return <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color }}>{p.value} {p.row.paymentNote}</Typography>;
    },
  },
  { field: 'postedAt', headerName: 'Posted At', width: 120,
    renderCell: (p) => (
      <Box>
        <Typography component="span" sx={{ fontSize: '0.8rem', color: textSecondary }}>{p.value}</Typography>
        {p.row.auto && (
          <Chip label="AUTO" size="small" sx={{
            ml: 0.5, height: 16, fontSize: '0.5rem', fontWeight: 700,
            bgcolor: alpha('#0d9488', 0.08), color: '#0d9488', border: `1px solid ${alpha('#0d9488', 0.2)}`,
          }} />
        )}
        <Typography sx={{ fontSize: '0.6rem', color: textSecondary }}>{p.row.speed}</Typography>
      </Box>
    ),
  },
];

// ─── Queued DataGrid columns ───
const makeQueuedColumns = (textColor, textSecondary) => [
  { field: 'status', headerName: 'Status', width: 80,
    renderCell: () => <Chip label="Queued" size="small" sx={{ height: 22, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha('#2563eb', 0.08), color: '#2563eb', border: `1px solid ${alpha('#2563eb', 0.2)}` }} />,
  },
  { field: 'sapDoc', headerName: 'SAP Doc', width: 100,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: '#2563eb', fontStyle: 'italic' }}>{p.value}</Typography>,
  },
  { field: 'vendor', headerName: 'Vendor', flex: 1, minWidth: 150,
    renderCell: (p) => (
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textColor }}>{p.value}</Typography>
        <Typography sx={{ fontSize: '0.65rem', color: textSecondary }}>{p.row.vendorSub}</Typography>
      </Box>
    ),
  },
  { field: 'invoiceRef', headerName: 'Invoice Ref', width: 130,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textColor }}>{p.value}</Typography>,
  },
  { field: 'poNumber', headerName: 'PO', width: 110,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563eb' }}>{p.value}</Typography>,
  },
  { field: 'value', headerName: 'Value', width: 110, align: 'right', headerAlign: 'right',
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textColor }}>{fmtAmt(p.value)}</Typography>,
  },
  { field: 'lines', headerName: 'Lines', width: 60, align: 'center', headerAlign: 'center',
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{p.value}</Typography>,
  },
  { field: 'submitted', headerName: 'Submitted', width: 150,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{p.value}</Typography>,
  },
];

// ─── Parked DataGrid columns ───
const makeParkedColumns = (textColor, textSecondary) => [
  { field: 'status', headerName: 'Status', width: 80,
    renderCell: () => <Chip label="Parked" size="small" sx={{ height: 22, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha('#d97706', 0.08), color: '#d97706', border: `1px solid ${alpha('#d97706', 0.2)}` }} />,
  },
  { field: 'parkDoc', headerName: 'Park Doc', width: 120,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#d97706' }}>{p.value}</Typography>,
  },
  { field: 'vendor', headerName: 'Vendor', flex: 1, minWidth: 150,
    renderCell: (p) => (
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textColor }}>{p.value}</Typography>
        <Typography sx={{ fontSize: '0.65rem', color: textSecondary }}>{p.row.vendorSub}</Typography>
      </Box>
    ),
  },
  { field: 'invoiceRef', headerName: 'Invoice Ref', width: 130,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textColor }}>{p.value}</Typography>,
  },
  { field: 'poNumber', headerName: 'PO', width: 110,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: p.value.startsWith('—') ? textSecondary : '#2563eb' }}>{p.value}</Typography>,
  },
  { field: 'value', headerName: 'Value', width: 100, align: 'right', headerAlign: 'right',
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: textColor }}>{fmtAmt(p.value)}</Typography>,
  },
  { field: 'lines', headerName: 'Lines', width: 55, align: 'center', headerAlign: 'center',
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textSecondary }}>{p.value}</Typography>,
  },
  { field: 'reason', headerName: 'Reason', width: 160,
    renderCell: (p) => <Typography sx={{ fontSize: '0.8rem', color: textColor }}>{p.value}</Typography>,
  },
  { field: 'owner', headerName: 'Owner', width: 110,
    renderCell: (p) => {
      const oc = OWNER_COLORS[p.row.ownerColor] || OWNER_COLORS.slate;
      return <Chip label={`${p.row.ownerIcon} ${p.value}`} size="small" sx={{ height: 22, fontSize: '0.6rem', fontWeight: 700, ...oc }} />;
    },
  },
];

export default function MantrixAPMonitor({ onBack, darkMode = false }) {
  const [activeTab, setActiveTab] = useState('posted');
  const [expandedRow, setExpandedRow] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // ─── Colors — same as MantrixAPLanding ───
  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';
  const surfaceBg = darkMode ? '#21262d' : '#f0f4f8';

  const showToast = (msg) => setToast({ open: true, message: msg });

  const postedColumns = makePostedColumns(textColor, textSecondary);
  const queuedColumns = makeQueuedColumns(textColor, textSecondary);
  const parkedColumns = makeParkedColumns(textColor, textSecondary);

  // ─── Client-side search filtering ───
  const filterRows = (rows, fields) => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter((row) =>
      fields.some((f) => {
        const val = row[f];
        if (val == null) return false;
        return String(val).toLowerCase().includes(term);
      })
    );
  };

  const filteredPosted = useMemo(() =>
    filterRows(postedRows, ['sapDoc', 'vendor', 'vendorCode', 'invoiceRef', 'poNumber', 'grRef', 'variance']),
    [searchTerm]
  );
  const filteredQueued = useMemo(() =>
    filterRows(queuedRows, ['vendor', 'invoiceRef', 'poNumber', 'sapDoc']),
    [searchTerm]
  );
  const filteredParked = useMemo(() =>
    filterRows(parkedRows, ['parkDoc', 'vendor', 'invoiceRef', 'poNumber', 'reason', 'owner']),
    [searchTerm]
  );

  // ─── 3-Way Match Expand Panel ───
  const renderMatchDetail = (row) => {
    if (!row || !row.matchDetail) return null;
    const md = row.matchDetail;
    return (
      <Paper elevation={0} sx={{ mx: 0, mt: 1, mb: 1.5, bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          px: 2, py: 1, bgcolor: surfaceBg, borderBottom: `1px solid ${borderColor}`,
        }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: textColor }}>
              ✓ 3-Way Match Verified — {row.vendor} {row.invoiceRef}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>
              SAP Doc {row.sapDoc} · Posted {row.postedAt} · {md.lineItems.length}/{md.lineItems.length} lines exact
            </Typography>
          </Box>
          <Button size="small" onClick={() => setExpandedRow(null)} sx={{ minWidth: 'auto', color: textSecondary }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </Button>
        </Box>
        <Box sx={{ p: 2 }}>
          {/* Three-way cards */}
          <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
            {[
              { Icon: InvoiceDocIcon, label: 'Invoice', val: md.invoice.value, sub1: md.invoice.ref, sub2: `${md.invoice.lines} lines · ${md.invoice.date}`, link: 'View PDF →' },
              { Icon: POIcon, label: 'Purchase Order', val: md.po.value, sub1: md.po.ref, sub2: `${md.po.items} items · Created ${md.po.date}`, link: 'View in ME23N →' },
              { Icon: GRIcon, label: 'Goods Receipt', val: md.gr.value, sub1: md.gr.ref, sub2: `${md.gr.items} items · Received ${md.gr.date}`, link: 'View in MIGO →' },
            ].map((c) => (
              <Paper key={c.label} elevation={0} sx={{
                flex: 1, p: 1.5, textAlign: 'center', borderRadius: 2,
                bgcolor: alpha('#059669', 0.04), border: `1px solid ${alpha('#059669', 0.2)}`,
              }}>
                <Avatar sx={{ width: 32, height: 32, mx: 'auto', mb: 0.5, bgcolor: alpha('#059669', 0.1), color: '#059669' }}>
                  <c.Icon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography sx={{ fontSize: '0.6rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{c.label}</Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: textColor }}>{c.val}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>{c.sub1}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>{c.sub2}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600, mt: 0.5, cursor: 'pointer' }}>{c.link}</Typography>
              </Paper>
            ))}
          </Stack>

          <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', color: '#059669', fontWeight: 700, mb: 1.5 }}>
            {md.confirmText}
          </Typography>

          {/* Line-items table */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontSize: '0.65rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, bgcolor: surfaceBg, borderBottom: `2px solid ${borderColor}` } }}>
                  <TableCell>Line</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">PO Qty</TableCell>
                  <TableCell align="right">GR Qty</TableCell>
                  <TableCell align="right">Inv Qty</TableCell>
                  <TableCell align="right">PO Price</TableCell>
                  <TableCell align="right">Inv Price</TableCell>
                  <TableCell>Match</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {md.lineItems.map((li) => (
                  <TableRow key={li.line} sx={{ borderLeft: '3px solid #059669', '& td': { fontSize: '0.8rem', py: 0.5, borderBottom: `1px solid ${borderColor}` } }}>
                    <TableCell>{li.line}</TableCell>
                    <TableCell>{li.material}</TableCell>
                    <TableCell>{li.desc}</TableCell>
                    <TableCell align="right">{li.poQty}</TableCell>
                    <TableCell align="right">{li.grQty}</TableCell>
                    <TableCell align="right">{li.invQty}</TableCell>
                    <TableCell align="right">{li.poPrice}</TableCell>
                    <TableCell align="right">{li.invPrice}</TableCell>
                    <TableCell sx={{ color: '#059669', fontWeight: 700 }}>✓</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    );
  };

  // ─── Failed Tab Panel ───
  const renderFailed = () => {
    const f = failedDetail;
    return (
      <Paper elevation={0} sx={{ border: `1px solid ${alpha('#dc2626', 0.2)}`, borderRadius: 2, overflow: 'hidden', bgcolor: cardBg }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.2, bgcolor: alpha('#dc2626', 0.04), borderBottom: `1px solid ${alpha('#dc2626', 0.2)}` }}>
          <Typography sx={{ fontWeight: 700, color: '#dc2626', fontSize: '0.85rem' }}>
            ✗ {f.vendor} {f.invoiceRef} · {f.lines} lines · {fmtAmt(f.value)}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#dc2626' }}>Failed {f.failedAt}</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          {/* Error */}
          <Box sx={{ p: 1.5, mb: 1.5, bgcolor: alpha('#dc2626', 0.04), border: `1px solid ${alpha('#dc2626', 0.15)}`, borderRadius: 1.5 }}>
            <Typography sx={{ fontWeight: 700, color: '#dc2626', fontSize: '0.8rem' }}>{f.error}</Typography>
          </Box>
          {/* Translation */}
          <Box sx={{ p: 1.5, mb: 1.5, bgcolor: alpha('#d97706', 0.04), borderLeft: '3px solid #d97706', borderRadius: 1.5 }}>
            <Typography sx={{ fontSize: '0.8rem', color: textColor, lineHeight: 1.7 }}>
              <strong>⚠ Translation:</strong> {f.translation}
            </Typography>
          </Box>
          {/* AI Assessment */}
          <Box sx={{ p: 1.5, mb: 1.5, bgcolor: surfaceBg, borderRadius: 1.5 }}>
            <Typography sx={{ fontSize: '0.8rem', color: textSecondary, lineHeight: 1.6 }}>
              <strong>🤖 AI Assessment:</strong> {f.aiAssessment}
            </Typography>
          </Box>
          {/* PO / GR / Match */}
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {[
              { label: 'PO', value: f.po, color: '#2563eb' },
              { label: 'GR', value: f.gr, color: '#059669' },
              { label: 'Match', value: f.matchCount, color: '#059669' },
            ].map((c) => (
              <Paper key={c.label} elevation={0} sx={{ flex: 1, p: 1, textAlign: 'center', bgcolor: surfaceBg, border: `1px solid ${borderColor}`, borderRadius: 1.5 }}>
                <Typography sx={{ fontSize: '0.6rem', color: textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</Typography>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: c.color }}>{c.value}</Typography>
              </Paper>
            ))}
          </Stack>
          {/* Actions */}
          <Stack direction="row" spacing={0.5}>
            {f.actions.map((a) => (
              <Button key={a.label} size="small" onClick={() => showToast(a.toast)} sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 2, fontSize: '0.75rem',
                border: `1px solid ${a.primary ? alpha('#0d9488', 0.2) : borderColor}`,
                color: a.primary ? '#0d9488' : textSecondary,
                bgcolor: a.primary ? alpha('#0d9488', 0.08) : cardBg,
                '&:hover': { borderColor: alpha('#0d9488', 0.3), color: '#0d9488', bgcolor: alpha('#0d9488', 0.08) },
              }}>
                {a.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Paper>
    );
  };

  // ─── Activity Log Panel ───
  const renderLog = () => (
    <Box>
      {activityLog.map((entry, i) => {
        const tc = LOG_TYPE_COLORS[entry.type] || LOG_TYPE_COLORS.ingest;
        return (
          <Box key={i} sx={{
            display: 'grid', gridTemplateColumns: '80px 90px 1fr', gap: 1.5, py: 1, px: 0.5, alignItems: 'start',
            borderBottom: `1px solid ${borderColor}`,
          }}>
            <Typography sx={{ fontSize: '0.8rem', color: textSecondary, fontWeight: 600 }}>{entry.time}</Typography>
            <Chip label={entry.typeLabel} size="small" sx={{ ...tc, fontSize: '0.6rem', height: 22, fontWeight: 700 }} />
            <Box>
              <Typography component="span" sx={{ fontSize: '0.8rem', color: textColor, lineHeight: 1.5 }}
                dangerouslySetInnerHTML={{ __html: entry.msg }}
              />
              {entry.doc && (
                <Typography component="span" sx={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600, ml: 0.5 }}>{entry.doc}</Typography>
              )}
              {entry.value && (
                <Typography component="span" sx={{ fontSize: '0.8rem', fontWeight: 700, ml: 0.5, color: textColor }}>{entry.value}</Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  // ─── Error Guide Panel ───
  const renderErrors = () => (
    <Box>
      <Typography sx={{ fontSize: '0.7rem', color: textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
        SAP Error Translation Guide — Common BAPI Failures
      </Typography>
      <Grid container spacing={1.5}>
        {errorGuide.map((e) => (
          <Grid item xs={12} sm={6} key={e.code}>
            <Paper elevation={0} sx={{ p: 1.5, border: `1px solid ${borderColor}`, borderRadius: 2, bgcolor: cardBg }}>
              <Typography sx={{ fontWeight: 700, color: '#dc2626', fontSize: '0.8rem' }}>{e.code} — {e.title}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: textSecondary, mt: 0.5 }}>{e.sap}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: textColor, mt: 0.5, fontWeight: 500 }}>{e.human}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#0d9488', mt: 0.5, fontWeight: 600 }}>{e.action}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>
      {/* Breadcrumbs — same pattern as MantrixAPLanding */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" onClick={() => onBack && onBack()} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>
          CORE.AI
        </Link>
        <Link underline="hover" color="inherit" onClick={() => onBack && onBack()} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>
          AP.AI
        </Link>
        <Typography color={textColor} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>AP Monitor</Typography>
      </Breadcrumbs>

      {/* Module Header — Paper card matching MantrixAPLanding */}
      <Paper elevation={0} sx={{
        p: 2.5, borderRadius: 3, mb: 2, bgcolor: cardBg,
        border: `1px solid ${borderColor}`,
        boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(MODULE_COLOR, 0.1), color: MODULE_COLOR }}>
            <MonitorHeartIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700} sx={{ color: MODULE_COLOR }}>AP Monitor</Typography>
              <Chip label="SAP Posting & Pipeline" size="small" sx={{ bgcolor: alpha(MODULE_COLOR, 0.1), color: MODULE_COLOR, fontWeight: 600, fontSize: '0.7rem' }} />
            </Stack>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              Real-time SAP posting monitor — KPIs, queue status, failure analysis
            </Typography>
          </Box>
          <Button size="small" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: textSecondary, textTransform: 'none', fontSize: '0.8rem' }}>Back</Button>
        </Box>
      </Paper>

      {/* KPI Strip — rounded Paper cards matching Workbench KPI style */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        {monitorKPIs.map((kpi, i) => {
          const valColor = STATUS_COLORS[kpi.color] || textColor;
          return (
            <Paper key={i} elevation={0} sx={{
              flex: 1, p: 1.5, textAlign: 'center', borderRadius: 2, position: 'relative',
              bgcolor: cardBg, border: `1px solid ${borderColor}`,
            }}>
              {kpi.delta && (
                <Chip label={kpi.delta} size="small" sx={{
                  position: 'absolute', top: 6, right: 6, height: 18, fontSize: '0.55rem', fontWeight: 700,
                  bgcolor: alpha('#059669', 0.08), color: '#059669',
                }} />
              )}
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: valColor, lineHeight: 1.2 }}>{kpi.value}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, mt: 0.3 }}>{kpi.label}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: textSecondary, mt: 0.2 }}>{kpi.sub}</Typography>
            </Paper>
          );
        })}
      </Stack>

      {/* Tab Bar — Button tabs matching MantrixAPLanding pattern */}
      <Box sx={{ borderBottom: `1px solid ${borderColor}`, mb: 2 }}>
        <Stack direction="row" spacing={0}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                size="small"
                onClick={() => { setActiveTab(tab.id); setExpandedRow(null); setSearchTerm(''); }}
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
                    bgcolor: isActive ? alpha(MODULE_NAVY, 0.2) : alpha(tab.badgeColor, 0.12),
                    color: isActive ? MODULE_NAVY : tab.badgeColor,
                  }}>
                    {tab.badge}
                  </Box>
                )}
              </Button>
            );
          })}
        </Stack>
      </Box>

      {/* Search Bar — shown for grid tabs */}
      {['posted', 'queued', 'parked'].includes(activeTab) && (
        <TextField
          size="small"
          fullWidth
          placeholder={
            activeTab === 'posted' ? 'Search by vendor, SAP doc, invoice, PO, GR...' :
            activeTab === 'queued' ? 'Search by vendor, invoice, PO...' :
            'Search by vendor, park doc, invoice, reason...'
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: textSecondary }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              bgcolor: cardBg, borderRadius: 2, fontSize: '0.8rem',
              '& fieldset': { borderColor },
              '&:hover fieldset': { borderColor: MODULE_NAVY },
              '&.Mui-focused fieldset': { borderColor: MODULE_NAVY },
            },
            '& .MuiInputBase-input': { color: textColor },
            '& .MuiInputBase-input::placeholder': { color: textSecondary, opacity: 1 },
          }}
        />
      )}

      {/* Tab Content */}
      {activeTab === 'posted' && (
        <Box>
          <Box sx={{ height: 420 }}>
            <DataGrid
              rows={filteredPosted}
              columns={postedColumns}
              density="compact"
              disableRowSelectionOnClick
              onRowClick={(params) => {
                if (params.row.matchDetail) {
                  setExpandedRow(expandedRow === params.row.id ? null : params.row.id);
                }
              }}
              sx={{
                ...apTheme.getDataGridSx({ darkMode, clickable: true }),
                '& .MuiDataGrid-row': {
                  cursor: 'pointer',
                  '&:hover': { bgcolor: darkMode ? '#21262d' : alpha(NAVY_BLUE, 0.08) },
                },
              }}
            />
          </Box>
          {expandedRow && (
            <Collapse in={!!expandedRow}>
              {renderMatchDetail(postedRows.find((r) => r.id === expandedRow))}
            </Collapse>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderTop: `1px solid ${borderColor}`, mt: 0.5 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: textSecondary }}>
              {searchTerm ? `${filteredPosted.length} of ${postedRows.length} posted` : `Showing ${postedRows.length} of 28 posted`} · Click row to expand 3-way match
            </Typography>
          </Box>
        </Box>
      )}

      {activeTab === 'queued' && (
        <Box sx={{ height: 200 }}>
          <DataGrid
            rows={filteredQueued}
            columns={queuedColumns}
            density="compact"
            disableRowSelectionOnClick
            sx={apTheme.getDataGridSx({ darkMode })}
          />
        </Box>
      )}

      {activeTab === 'parked' && (
        <Box sx={{ height: 300 }}>
          <DataGrid
            rows={filteredParked}
            columns={parkedColumns}
            density="compact"
            disableRowSelectionOnClick
            sx={apTheme.getDataGridSx({ darkMode })}
          />
        </Box>
      )}

      {activeTab === 'failed' && renderFailed()}
      {activeTab === 'log' && renderLog()}
      {activeTab === 'errors' && renderErrors()}

      {/* Toast — matching MantrixAPLanding */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast({ open: false, message: '' })} severity="info" variant="filled" sx={{ fontSize: '0.8rem', bgcolor: MODULE_NAVY }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
