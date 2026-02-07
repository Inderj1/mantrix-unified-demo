import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack,
  Button, Breadcrumbs, Link, Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import {
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  BugReport as BugReportIcon,
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarTodayIcon,
  CheckCircle as CheckCircleIcon,
  Pause as PauseIcon,
  Forward as ForwardIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { queueStats, queueItems, queueKPIs, priorityFactors, invoiceList, invoiceLineItems } from './apMockData';
import { apTheme, MODULE_NAVY, NAVY_DARK } from './apTheme';
import LineItemMatchEngine from './LineItemMatchEngine';

const TILE_COLOR = '#00357a';

const filterOptions = [
  { key: 'all', label: 'All', count: 47 },
  { key: 'ready', label: 'Ready to Post', count: 31 },
  { key: 'review', label: 'Need Review', count: 12 },
  { key: 'exception', label: 'Exceptions', count: 4 },
  { key: 'parked', label: 'Parked', count: 8 },
  { key: 'blocking', label: 'Payment Blocking', count: null },
];

const getScoreColor = (level) => {
  switch (level) {
    case 'high': return '#34d399';
    case 'mid': return '#fbbf24';
    case 'low': return '#f87171';
    case 'parked': return '#94a3b8';
    default: return '#94a3b8';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'ready': return 'Ready';
    case 'review': return 'Review';
    case 'exception': return 'Exception';
    case 'parked': return 'Parked';
    default: return status;
  }
};

// Find matching invoiceList entry by vendor name
const findInvoiceEntry = (row) => {
  if (!row) return null;
  return invoiceList.find((inv) =>
    inv.vendor === row.vendor ||
    row.vendor?.includes(inv.vendor) ||
    inv.vendor?.includes(row.vendor)
  ) || null;
};

const SmartWorkQueue = ({ onBack, darkMode = false, onNavigate, onNavigateWithInvoice }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';

  const filteredItems = activeFilter === 'all'
    ? queueItems
    : activeFilter === 'blocking'
      ? queueItems.filter((q) => q.status === 'exception')
      : queueItems.filter((q) => q.status === activeFilter);

  const columns = [
    {
      field: 'score',
      headerName: 'AI Score',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => {
        const { scoreLevel, score } = params.row;
        if (scoreLevel === 'parked' || score === null) {
          return (
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#94a3b8' }}>
              —
            </Typography>
          );
        }
        return (
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: getScoreColor(scoreLevel) }}>
            {score}
          </Typography>
        );
      },
    },
    {
      field: 'vendor',
      headerName: 'Vendor / Invoice',
      flex: 1.5,
      minWidth: 220,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ py: 0.5, overflow: 'hidden' }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: textColor, fontSize: '0.82rem', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {params.row.vendor}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: textSecondary, fontSize: '0.68rem', display: 'block', mt: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {params.row.detail}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: textColor, fontSize: '0.85rem' }}>
          {params.value}
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
        const lines = params.value ? params.value.split('\n') : [''];
        return (
          <Box sx={{ textAlign: 'center' }}>
            {lines.map((line, i) => (
              <Typography key={i} variant="caption" sx={{ color: textSecondary, fontSize: '0.68rem', display: 'block', lineHeight: 1.4 }}>
                {line}
              </Typography>
            ))}
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => {
        const chipStyle = apTheme.chips.invoiceStatus[params.value] || {};
        return (
          <Chip
            label={getStatusLabel(params.value)}
            size="small"
            sx={{ ...chipStyle, height: 22, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          />
        );
      },
    },
    {
      field: 'aiHint',
      headerName: 'AI Hint',
      flex: 1.2,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: '#002352', fontSize: '0.7rem', lineHeight: 1.5, whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {''}{params.value}
        </Typography>
      ),
    },
  ];

  const rows = filteredItems.map((item) => ({ ...item }));

  // ===== DRILLDOWN VIEW =====
  if (selectedItem) {
    const matchedInvoice = findInvoiceEntry(selectedItem);
    const invoiceId = matchedInvoice?.id;
    const scoreVal = selectedItem.score ?? selectedItem.aiScore ?? null;
    const scoreLvl = selectedItem.scoreLevel || (scoreVal > 90 ? 'high' : scoreVal > 60 ? 'mid' : scoreVal ? 'low' : 'parked');
    const scoreColor = getScoreColor(scoreLvl);

    return (
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" onClick={() => onNavigate && onNavigate('landing')} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>CORE.AI</Link>
          <Link underline="hover" color="inherit" onClick={onBack} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>AP.AI</Link>
          <Link underline="hover" color="inherit" onClick={() => setSelectedItem(null)} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>Work Queue</Link>
          <Typography color={textColor} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedItem.vendor}</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 2, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Chip label="TILE 2" size="small" sx={{ bgcolor: TILE_COLOR, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
                <Typography variant="caption" sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1 }}>Queue Item Detail</Typography>
              </Stack>
              <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>
                {selectedItem.vendor}
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                {selectedItem.detail}
              </Typography>
            </Box>
            <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => setSelectedItem(null)} sx={{ color: textSecondary }}>
              Back to Queue
            </Button>
          </Stack>
        </Paper>

        {/* Two-panel layout */}
        <Grid container spacing={2}>
          {/* LEFT: Invoice overview + AI Analysis */}
          <Grid item xs={12} md={7}>
            {/* Invoice Summary */}
            <Card sx={{ mb: 2, borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5 }}>
                  Invoice Summary
                </Typography>
                {[
                  { label: 'Amount', value: selectedItem.amount },
                  { label: 'Type', value: (selectedItem.type || '').replace('\n', ' — ') },
                  { label: 'Status', value: getStatusLabel(selectedItem.status) },
                  { label: 'AI Hint', value: selectedItem.aiHint },
                ].map((row, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.7, borderBottom: i < 3 ? `1px solid ${alpha(borderColor, 0.5)}` : 'none' }}>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.72rem' }}>{row.label}</Typography>
                    <Typography variant="caption" sx={{ color: textColor, fontWeight: 600, fontSize: '0.72rem', textAlign: 'right', maxWidth: '60%' }}>{row.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* AI Priority Reasoning */}
            <Card sx={{ mb: 2, bgcolor: alpha(TILE_COLOR, 0.04), border: '1px solid rgba(0,0,0,0.1)', borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: TILE_COLOR, boxShadow: `0 0 8px ${alpha(TILE_COLOR, 0.5)}` }} />
                  <Typography variant="caption" sx={{ color: NAVY_DARK, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, fontSize: '0.6rem' }}>
                    AI Priority Analysis
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: textColor, lineHeight: 1.8, fontSize: '0.8rem' }}>
                  {selectedItem.status === 'ready'
                    ? <><strong>Ready to Post.</strong> AI confidence is high. Match verified against PO, GR confirmed, no anomalies. This invoice can be posted immediately.</>
                    : selectedItem.status === 'review'
                      ? <><strong>Needs Review.</strong> {selectedItem.aiHint}. Clerk review required before posting — verify the variance or missing data, then decide.</>
                      : <><strong>Parked.</strong> {selectedItem.aiHint}. Waiting for external input. AI is monitoring for updates and will notify when actionable.</>
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT: Score + Actions */}
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg }}>
              <CardContent sx={{ p: 2.5 }}>
                {/* Confidence Ring */}
                <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: darkMode ? '#0d1117' : '#f8fafc', border: `1px solid ${borderColor}`, mb: 2, textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                    <CircularProgress variant="determinate" value={scoreVal || 0} size={100} thickness={4} sx={{ color: scoreColor, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
                    <CircularProgress variant="determinate" value={100} size={100} thickness={4} sx={{ color: darkMode ? alpha('#fff', 0.06) : alpha('#000', 0.06), position: 'absolute', left: 0, top: 0, zIndex: 0 }} />
                    <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                      <Typography variant="h4" fontWeight={700} sx={{ color: scoreColor, lineHeight: 1.1 }}>
                        {scoreVal || '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                        AI Score
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: textSecondary, display: 'block', fontSize: '0.72rem' }}>
                    {selectedItem.aiHint}
                  </Typography>
                </Paper>

                {/* Line Match Summary */}
                {invoiceId && invoiceLineItems[invoiceId] && (() => {
                  const lines = invoiceLineItems[invoiceId];
                  const matchedCount = lines.filter((l) => l.matchStatus === 'matched').length;
                  return (
                    <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? '#0d1117' : alpha('#f0f4f8', 0.6), border: `1px solid ${borderColor}`, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: textSecondary }}>Line-Item Match</Typography>
                      <Chip label={`${matchedCount}/${lines.length} matched`} size="small" sx={{ bgcolor: matchedCount === lines.length ? alpha('#10b981', 0.12) : alpha('#f59e0b', 0.12), color: matchedCount === lines.length ? '#059669' : '#d97706', fontWeight: 700, fontSize: '0.6rem', height: 20 }} />
                    </Paper>
                  );
                })()}

                {/* Decision Buttons */}
                <Typography variant="caption" sx={{ color: '#d97706', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, fontSize: '0.6rem', mb: 1, display: 'block' }}>
                  Your Decision
                </Typography>
                <Stack spacing={0.8}>
                  <Button fullWidth startIcon={<CheckCircleIcon />} sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: alpha('#34d399', 0.08), color: '#059669', border: `1px solid ${alpha('#34d399', 0.2)}`, borderRadius: 2, textTransform: 'none', px: 2, '&:hover': { bgcolor: alpha('#34d399', 0.16) } }}>
                    <Box><Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Post Invoice (MIRO)</Typography><Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem' }}>Posts to SAP with AI-verified data</Typography></Box>
                  </Button>
                  <Button fullWidth startIcon={<PauseIcon />} sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: alpha('#fbbf24', 0.08), color: '#d97706', border: `1px solid ${alpha('#fbbf24', 0.2)}`, borderRadius: 2, textTransform: 'none', px: 2, '&:hover': { bgcolor: alpha('#fbbf24', 0.16) } }}>
                    <Box><Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Park for Later</Typography><Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem' }}>Saves with context for review</Typography></Box>
                  </Button>
                  <Button fullWidth startIcon={<ForwardIcon />} sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: alpha('#3b82f6', 0.08), color: '#2563eb', border: `1px solid ${alpha('#3b82f6', 0.2)}`, borderRadius: 2, textTransform: 'none', px: 2, '&:hover': { bgcolor: alpha('#3b82f6', 0.16) } }}>
                    <Box><Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Route to Buyer</Typography><Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem' }}>Sends to buyer with PO discrepancy</Typography></Box>
                  </Button>
                  <Button fullWidth startIcon={<CloseIcon />} sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: alpha('#f87171', 0.08), color: '#dc2626', border: `1px solid ${alpha('#f87171', 0.2)}`, borderRadius: 2, textTransform: 'none', px: 2, '&:hover': { bgcolor: alpha('#f87171', 0.16) } }}>
                    <Box><Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Reject Invoice</Typography><Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem' }}>Returns to vendor with reason</Typography></Box>
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Line-Item Match Engine */}
        {invoiceId && invoiceLineItems[invoiceId] && (
          <LineItemMatchEngine invoiceId={invoiceId} darkMode={darkMode} />
        )}
      </Box>
    );
  }

  // ===== LIST VIEW =====
  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>

      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link
          underline="hover" color="inherit"
          onClick={() => onNavigate && onNavigate('landing')}
          sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}
        >
          CORE.AI
        </Link>
        <Link
          underline="hover" color="inherit"
          onClick={onBack}
          sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}
        >
          AP.AI
        </Link>
        <Typography color={textColor} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
          Work Queue
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper
        elevation={0}
        sx={{ p: 2.5, borderRadius: 3, mb: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Chip
                label="TILE 2"
                size="small"
                sx={{ bgcolor: TILE_COLOR, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}
              />
              <Typography variant="caption" sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1 }}>
                My Work Queue
              </Typography>
            </Stack>
            <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>
              Smart Work Queue
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              AI Prioritizes Your Day — You Process the Invoices
            </Typography>
          </Box>
          <Button size="small" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: textSecondary }}>
            Back
          </Button>
        </Stack>
      </Paper>

      {/* Queue Stats Strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {queueStats.map((stat, idx) => (
          <Grid item xs={6} sm={3} key={idx}>
            <Card
              sx={{ borderRadius: 3, bgcolor: cardBg, border: `1px solid ${borderColor}`, textAlign: 'center', py: 0.5 }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontWeight: 700, color: stat.color, fontSize: '2rem', lineHeight: 1.1, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontSize: '0.65rem', display: 'block' }}
                >
                  {stat.label}
                </Typography>
                <Typography variant="caption" sx={{ color: darkMode ? '#6e7781' : '#94a3b8', fontSize: '0.6rem', display: 'block', mt: 0.5 }}>
                  {stat.sub}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* KPI Cards */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {queueKPIs.map((kpi, idx) => {
          const icons = [<TrendingUpIcon key="t" />, <AccessTimeIcon key="a" />, <BugReportIcon key="b" />];
          const colors = ['#059669', TILE_COLOR, '#d97706'];
          return (
            <Grid item xs={12} sm={4} key={idx}>
              <Card sx={{ borderRadius: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ color: colors[idx], mt: 0.5, opacity: 0.7 }}>
                      {React.cloneElement(icons[idx], { sx: { fontSize: 20 } })}
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.6rem', display: 'block' }}>
                        {kpi.name}
                      </Typography>
                      <Typography variant="h5" fontWeight={700} sx={{ color: colors[idx], lineHeight: 1.2, my: 0.5 }}>
                        {kpi.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem', lineHeight: 1.4 }}>
                        {kpi.desc}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Filter Chips + DataGrid */}
      <Card
        sx={{ borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg, overflow: 'hidden' }}
      >
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5,
            bgcolor: darkMode ? '#21262d' : '#f1f5f9',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f87171' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fbbf24' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34d399' }} />
          <Typography variant="caption" sx={{ color: textSecondary, ml: 1 }}>
            My Work Queue — Feb 6, 2026
          </Typography>
        </Box>

        <Box sx={{ p: 2.5 }}>
          {/* Filter chips */}
          <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap' }}>
            {filterOptions.map((filter) => {
              const isActive = activeFilter === filter.key;
              const chipLabel = filter.count !== null
                ? `${filter.label} (${filter.count})`
                : filter.label;
              return (
                <Chip
                  key={filter.key}
                  label={chipLabel}
                  size="small"
                  onClick={() => setActiveFilter(filter.key)}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 28,
                    borderRadius: '8px',
                    border: '1px solid',
                    transition: 'all 0.15s ease',
                    borderColor: isActive ? alpha(TILE_COLOR, 0.4) : darkMode ? '#30363d' : alpha('#000', 0.08),
                    bgcolor: isActive ? alpha(TILE_COLOR, 0.15) : darkMode ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                    color: isActive ? TILE_COLOR : textSecondary,
                    '&:hover': {
                      bgcolor: isActive ? alpha(TILE_COLOR, 0.2) : alpha(TILE_COLOR, 0.06),
                      borderColor: alpha(TILE_COLOR, 0.25),
                    },
                  }}
                />
              );
            })}
          </Stack>

          {/* DataGrid */}
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[rows.length]}
              initialState={{ pagination: { paginationModel: { pageSize: rows.length } } }}
              disableRowSelectionOnClick
              disableColumnMenu
              hideFooter
              getRowHeight={() => 58}
              getRowClassName={(params) => `queue-row-${params.row.status}`}
              onRowClick={(params) => {
                if (params.row.status === 'exception') {
                  onNavigate && onNavigate('exception-review');
                } else {
                  setSelectedItem(params.row);
                }
              }}
              sx={{
                ...apTheme.getDataGridSx({ darkMode }),
                '& .queue-row-ready': {},
                '& .queue-row-review': {},
                '& .queue-row-exception': {},
                '& .queue-row-parked': {},
                '& .MuiDataGrid-row': {
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: darkMode ? alpha('#42a5f5', 0.08) : alpha(TILE_COLOR, 0.06),
                    transform: 'translateX(2px)',
                  },
                },
                '& .MuiDataGrid-cell': { fontSize: '0.8rem', color: textColor, display: 'flex', alignItems: 'center' },
                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* AI Prioritization Panel */}
      <Card sx={{ mt: 3, borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${borderColor}`, bgcolor: darkMode ? '#21262d' : alpha(TILE_COLOR, 0.03) }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: TILE_COLOR, boxShadow: `0 0 8px ${alpha(TILE_COLOR, 0.5)}` }} />
            <Typography variant="caption" sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontSize: '0.65rem' }}>
              AI Prioritization — How Your Queue Is Ranked
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            {priorityFactors.map((factor, idx) => {
              const icons = {
                AttachMoney: <AttachMoneyIcon />,
                Schedule: <ScheduleIcon />,
                Assignment: <AssignmentIcon />,
                CalendarToday: <CalendarTodayIcon />,
              };
              const factorColors = ['#059669', '#d97706', TILE_COLOR, '#dc2626'];
              return (
                <Grid item xs={12} sm={6} key={idx}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${borderColor}`,
                      bgcolor: darkMode ? alpha('#fff', 0.02) : alpha(factorColors[idx], 0.03),
                      height: '100%',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{ color: factorColors[idx], mt: 0.25 }}>
                        {React.cloneElement(icons[factor.icon] || <AssignmentIcon />, { sx: { fontSize: 20 } })}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ color: textColor, fontSize: '0.82rem' }}>
                            {factor.name}
                          </Typography>
                          <Chip
                            label={factor.weight}
                            size="small"
                            sx={{ bgcolor: alpha(factorColors[idx], 0.12), color: factorColors[idx], fontWeight: 700, fontSize: '0.65rem', height: 22 }}
                          />
                        </Stack>
                        <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.7rem', lineHeight: 1.6 }}>
                          {factor.desc}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Card>
    </Box>
  );
};

export default SmartWorkQueue;
