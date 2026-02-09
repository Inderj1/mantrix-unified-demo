import React, { useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack, Button,
  Breadcrumbs, Link, Paper, Slider, LinearProgress, Tooltip,
  Dialog, DialogContent, IconButton, CircularProgress,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Scanner as ScannerIcon,
  Cable as CableIcon,
  Language as LanguageIcon,
  CheckCircle as CheckCircleIcon,
  SmartToy as SmartToyIcon,
  Speed as SpeedIcon,
  HourglassEmpty as HourglassIcon,
  Error as ErrorIcon,
  Sync as SyncIcon,
  PictureAsPdf as PdfIcon,
  Fullscreen as FullscreenIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
  DocumentScanner as DocumentScannerIcon,
  Description as DescriptionIcon,
  VerifiedUser as VerifiedUserIcon,
  Calculate as CalculateIcon,
  Pause as PauseIcon,
  Forward as ForwardIcon,
  Gavel as GavelIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import {
  intakePipeline, ingestionChannels, extractionFields,
  autopilotQueue, dpDocStatusLabels, generateExtractionFields,
} from './apMockDataV2';
import { apTheme, MODULE_NAVY, NAVY_DARK, NAVY_BLUE } from './apTheme';
import LineItemMatchEngine from './LineItemMatchEngine';

const TILE_COLOR = MODULE_NAVY;

// Channel icon mapping
const channelIcons = {
  email: EmailIcon,
  scan: ScannerIcon,
  edi: CableIcon,
  portal: LanguageIcon,
};

// Extraction source config
const sourceConfig = {
  OCR: { label: 'OCR', color: '#059669' },
  'OCR + Master Data': { label: 'OCR + MD', color: NAVY_BLUE },
  'Calculated (Net 30)': { label: 'Calculated', color: '#7c3aed' },
  'OCR + EKKO Lookup': { label: 'OCR + EKKO', color: NAVY_BLUE },
  'LFB1 Vendor Master': { label: 'Master Data', color: NAVY_DARK },
  'AI Suggested': { label: 'AI Suggested', color: TILE_COLOR },
  'Vendor Master': { label: 'Master Data', color: NAVY_DARK },
};

// Section navigation config
const sections = [
  { key: 'pipeline', label: 'Invoice Intake Pipeline', icon: EmailIcon },
  { key: 'extraction', label: 'AI Extraction Panel', icon: SmartToyIcon },
  { key: 'autopilot', label: 'Autopilot Queue', icon: SpeedIcon },
  { key: 'matching', label: 'Line-Item Match Engine', icon: CheckCircleIcon },
];

// Processing state config
const processingStateConfig = {
  processing: { color: '#1976d2', label: 'Processing' },
  queued: { color: '#94a3b8', label: 'Queued' },
  complete: { color: '#059669', label: 'Complete' },
  error: { color: '#dc2626', label: 'Error' },
};

// Spin animation for processing state
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Approval state config
const approvalConfig = {
  'auto-approved': { label: 'Auto', color: '#059669', bg: '#059669' },
  'pending-review': { label: 'Review', color: '#d97706', bg: '#d97706' },
  'approved': { label: 'Approved', color: '#059669', bg: '#059669' },
  'rejected': { label: 'Rejected', color: '#dc2626', bg: '#dc2626' },
};

// Mini confidence bar for inline rendering
const ConfidenceMiniBar = ({ value, width = 40 }) => {
  if (value == null) return null;
  const color = value >= 95 ? '#059669' : value >= 85 ? '#d97706' : '#dc2626';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
      <Box sx={{ width, height: 3, borderRadius: 2, bgcolor: alpha(color, 0.15), overflow: 'hidden' }}>
        <Box sx={{ width: `${value}%`, height: '100%', borderRadius: 2, bgcolor: color }} />
      </Box>
      <Typography sx={{ fontSize: '0.55rem', color, fontWeight: 600, lineHeight: 1 }}>{value}%</Typography>
    </Box>
  );
};

// Format currency
const formatCurrency = (v) => {
  if (v == null) return '—';
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
};

// Format compact currency
const formatCompactCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(2)}`;
};


// ═══════════════════════════════════════════════════════════════════
// SECTION 1: Invoice Intake Pipeline
// ═══════════════════════════════════════════════════════════════════

const IntakePipelineSection = ({ darkMode, cardBg, textColor, textSecondary, borderColor, onSelectInvoice, onHighlightInvoice, highlightedId, onNavigate }) => {
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confBand, setConfBand] = useState('all');

  // Compute pipeline totals
  const totalPipeline = ingestionChannels.reduce((sum, ch) => sum + ch.count, 0);

  // Channel summary cards data
  const channelCards = [
    { label: 'Total Pipeline', count: totalPipeline, color: TILE_COLOR, icon: SmartToyIcon },
    ...ingestionChannels.map((ch) => ({
      label: ch.label,
      count: ch.count,
      color: ch.color,
      icon: channelIcons[ch.id] || EmailIcon,
    })),
  ];

  // Filtered pipeline data
  const filteredPipeline = useMemo(() => {
    return intakePipeline.filter((row) => {
      if (channelFilter !== 'all' && row.channel !== channelFilter) return false;
      if (statusFilter !== 'all' && row.dpStatus !== statusFilter) return false;
      if (confBand === 'high' && (row.extractionConfidence == null || row.extractionConfidence < 95)) return false;
      if (confBand === 'med' && (row.extractionConfidence == null || row.extractionConfidence < 85 || row.extractionConfidence >= 95)) return false;
      if (confBand === 'low' && (row.extractionConfidence == null || row.extractionConfidence >= 85)) return false;
      return true;
    });
  }, [channelFilter, statusFilter, confBand]);

  // Unique statuses for filter
  const uniqueStatuses = [...new Set(intakePipeline.map((r) => r.dpStatus))];

  // DataGrid columns for intake pipeline
  const intakeColumns = [
    {
      field: 'processingState',
      headerName: '',
      width: 44,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => {
        const state = params.value || 'queued';
        const cfg = processingStateConfig[state];
        if (state === 'processing') {
          return (
            <Tooltip title="Processing" arrow>
              <SyncIcon sx={{ fontSize: 18, color: cfg.color, animation: `${spin} 1.5s linear infinite` }} />
            </Tooltip>
          );
        }
        if (state === 'complete') {
          return (
            <Tooltip title="Complete" arrow>
              <CheckCircleIcon sx={{ fontSize: 18, color: cfg.color }} />
            </Tooltip>
          );
        }
        if (state === 'error') {
          return (
            <Tooltip title="Error" arrow>
              <ErrorIcon sx={{ fontSize: 18, color: cfg.color }} />
            </Tooltip>
          );
        }
        return (
          <Tooltip title="Queued" arrow>
            <HourglassIcon sx={{ fontSize: 18, color: cfg.color, opacity: 0.6 }} />
          </Tooltip>
        );
      },
    },
    {
      field: 'dpDoc',
      headerName: 'DP Doc',
      width: 145,
      renderCell: (params) => (
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: NAVY_DARK,
            letterSpacing: '-0.3px',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'vendor',
      headerName: 'Vendor / Invoice',
      flex: 1.4,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ py: 0.5 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: textColor, fontSize: '0.82rem', lineHeight: 1.3 }}
          >
            {params.row.vendor}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.68rem' }}>
              {params.row.invoiceNum}
              {params.row.poRef ? ` · PO ${params.row.poRef}` : ''}
            </Typography>
            <ConfidenceMiniBar value={params.row.vendorConf} />
          </Box>
        </Box>
      ),
    },
    {
      field: 'channel',
      headerName: 'Channel',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const chipStyle = apTheme.chips.channel[params.value] || {};
        const labels = { email: 'Email', scan: 'Scan', edi: 'EDI', portal: 'Portal' };
        return (
          <Chip
            label={labels[params.value] || params.value}
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
      field: 'amount',
      headerName: 'Amount',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: textColor, fontSize: '0.85rem' }}>
            {formatCurrency(params.value)}
          </Typography>
          <ConfidenceMiniBar value={params.row.amountConf} />
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.68rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'dpStatus',
      headerName: 'DP Status',
      width: 115,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const chipStyle = apTheme.chips.dpDocStatus[params.value] || {};
        const label = dpDocStatusLabels[params.value] || params.value;
        return (
          <Chip
            label={label}
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
      field: 'extractionConfidence',
      headerName: 'Extraction',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const score = params.row.extractionConfidence;
        const fieldsExtracted = params.row.fieldsExtracted;
        const fieldsTotal = params.row.fieldsTotal;
        if (score == null) {
          return (
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#94a3b8' }}>—</Typography>
              <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.6rem' }}>
                Pending
              </Typography>
            </Box>
          );
        }
        const color = apTheme.getConfidenceColor(score);
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color }}>
              {score}%
            </Typography>
            <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.6rem' }}>
              {fieldsExtracted}/{fieldsTotal} fields
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'approval',
      headerName: 'Approval',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const val = params.value;
        if (!val) {
          return <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>—</Typography>;
        }
        const cfg = approvalConfig[val] || {};
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip
              label={cfg.label}
              size="small"
              sx={{
                bgcolor: alpha(cfg.bg, 0.12),
                color: cfg.color,
                fontWeight: 600,
                height: 22,
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                border: `1px solid ${alpha(cfg.bg, 0.2)}`,
              }}
            />
            {val === 'pending-review' && (
              <Tooltip title="Open in Exception Hub" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate('exception-approval'); }}
                  sx={{ p: 0.3, color: '#d97706', '&:hover': { bgcolor: alpha('#d97706', 0.1) } }}
                >
                  <GavelIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 50,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip title="Open detail view" arrow>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onSelectInvoice && onSelectInvoice(params.row); }}
            sx={{ p: 0.3, color: NAVY_BLUE, '&:hover': { bgcolor: alpha(NAVY_BLUE, 0.1) } }}
          >
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: 'timestamp',
      headerName: 'Time',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.7rem' }}>
          {params.value}
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      {/* Channel Summary Cards */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {channelCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Grid item xs={6} sm={4} md={2.4} key={idx}>
              <Card
                onClick={() => {
                  if (idx === 0) setChannelFilter('all');
                  else setChannelFilter(ingestionChannels[idx - 1].id);
                }}
                sx={{
                  borderRadius: 3,
                  bgcolor: cardBg,
                  border: `1px solid ${borderColor}`,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(card.color, 0.4),
                    boxShadow: `0 2px 12px ${alpha(card.color, 0.1)}`,
                  },
                }}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      bgcolor: alpha(card.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 0.5,
                    }}
                  >
                    <Icon sx={{ fontSize: 13, color: card.color }} />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: card.color,
                      fontSize: '1.2rem',
                      lineHeight: 1.1,
                      mb: 0.25,
                    }}
                  >
                    {card.count}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      fontWeight: 600,
                      fontSize: '0.58rem',
                    }}
                  >
                    {card.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Filter Chip Bar — single compact row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5,
          py: 0.75,
          mb: 1.5,
          borderRadius: 1.5,
          bgcolor: darkMode ? alpha('#42a5f5', 0.03) : alpha(TILE_COLOR, 0.02),
          border: `1px solid ${borderColor}`,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { height: 0 },
        }}
      >
        {/* Channel filters */}
        {[{ id: 'all', label: 'All' }, ...ingestionChannels.map((ch) => ({ id: ch.id, label: ch.label }))].map((ch) => (
          <Chip
            key={ch.id}
            label={ch.label}
            size="small"
            onClick={() => setChannelFilter(ch.id)}
            sx={{
              height: 20,
              fontSize: '0.58rem',
              fontWeight: channelFilter === ch.id ? 700 : 500,
              bgcolor: channelFilter === ch.id ? alpha(TILE_COLOR, 0.15) : 'transparent',
              color: channelFilter === ch.id ? TILE_COLOR : textSecondary,
              border: channelFilter === ch.id ? `1px solid ${alpha(TILE_COLOR, 0.3)}` : '1px solid transparent',
              cursor: 'pointer',
              '&:hover': { bgcolor: alpha(TILE_COLOR, 0.08) },
            }}
          />
        ))}

        <Box sx={{ width: '1px', height: 16, bgcolor: borderColor, flexShrink: 0 }} />

        {/* Status filters */}
        {[{ id: 'all', label: 'All Status' }, ...uniqueStatuses.map((s) => ({ id: s, label: dpDocStatusLabels[s] || s }))].map((s) => (
          <Chip
            key={s.id}
            label={s.label}
            size="small"
            onClick={() => setStatusFilter(s.id)}
            sx={{
              height: 20,
              fontSize: '0.58rem',
              fontWeight: statusFilter === s.id ? 700 : 500,
              bgcolor: statusFilter === s.id ? alpha(NAVY_BLUE, 0.15) : 'transparent',
              color: statusFilter === s.id ? NAVY_BLUE : textSecondary,
              border: statusFilter === s.id ? `1px solid ${alpha(NAVY_BLUE, 0.3)}` : '1px solid transparent',
              cursor: 'pointer',
              '&:hover': { bgcolor: alpha(NAVY_BLUE, 0.08) },
            }}
          />
        ))}

        <Box sx={{ width: '1px', height: 16, bgcolor: borderColor, flexShrink: 0 }} />

        {/* Confidence band filters */}
        {[
          { id: 'all', label: 'All' },
          { id: 'high', label: '≥95%' },
          { id: 'med', label: '85-94%' },
          { id: 'low', label: '<85%' },
        ].map((c) => {
          const bandColors = { all: '#64748b', high: '#059669', med: '#d97706', low: '#dc2626' };
          const cc = bandColors[c.id];
          return (
            <Chip
              key={c.id}
              label={c.label}
              size="small"
              onClick={() => setConfBand(c.id)}
              sx={{
                height: 20,
                fontSize: '0.58rem',
                fontWeight: confBand === c.id ? 700 : 500,
                bgcolor: confBand === c.id ? alpha(cc, 0.15) : 'transparent',
                color: confBand === c.id ? cc : textSecondary,
                border: confBand === c.id ? `1px solid ${alpha(cc, 0.3)}` : '1px solid transparent',
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha(cc, 0.08) },
              }}
            />
          );
        })}

        {/* Active filter count */}
        {(channelFilter !== 'all' || statusFilter !== 'all' || confBand !== 'all') && (
          <Chip
            label={`${filteredPipeline.length}`}
            size="small"
            sx={{
              ml: 'auto',
              height: 18,
              fontSize: '0.55rem',
              fontWeight: 700,
              bgcolor: alpha(TILE_COLOR, 0.1),
              color: TILE_COLOR,
            }}
          />
        )}
      </Box>

      {/* Pipeline DataGrid */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${borderColor}`,
          bgcolor: cardBg,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.5,
            bgcolor: darkMode ? '#21262d' : '#f1f5f9',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f87171' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fbbf24' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34d399' }} />
          <Typography variant="caption" sx={{ color: textSecondary, ml: 1 }}>
            Invoice Intake Pipeline — Feb 8, 2026 · {filteredPipeline.length} documents
          </Typography>
        </Box>

        <Box sx={{ height: 520, width: '100%' }}>
          <DataGrid
            rows={filteredPipeline}
            columns={intakeColumns}
            pageSizeOptions={[10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            onRowClick={(params) => onHighlightInvoice && onHighlightInvoice(params.row)}
            getRowHeight={() => 58}
            getRowClassName={(params) =>
              highlightedId === params.row.id ? 'highlighted-pipeline-row' : ''
            }
            sx={{
              ...apTheme.getDataGridSx({ darkMode, clickable: true }),
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: darkMode ? alpha('#42a5f5', 0.08) : alpha(TILE_COLOR, 0.06),
                  transform: 'translateX(2px)',
                },
              },
              '& .highlighted-pipeline-row': {
                bgcolor: darkMode ? alpha(NAVY_BLUE, 0.14) : alpha(NAVY_BLUE, 0.08),
                borderLeft: `3px solid ${NAVY_BLUE}`,
              },
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};


// ═══════════════════════════════════════════════════════════════════
// SECTION 2: AI Extraction Panel
// ═══════════════════════════════════════════════════════════════════

const ExtractionPanelSection = ({ darkMode, cardBg, textColor, textSecondary, borderColor, invoice, onSelectFromPipeline }) => {
  // Derive active fields from selected invoice or fallback to static data
  const activeFields = useMemo(() => invoice ? generateExtractionFields(invoice) : extractionFields, [invoice]);

  // Compute overall confidence
  const overallConfidence = useMemo(() => {
    const total = activeFields.reduce((sum, f) => sum + f.confidence, 0);
    return (total / activeFields.length).toFixed(1);
  }, [activeFields]);

  const overallColor = apTheme.getConfidenceColor(parseFloat(overallConfidence));

  // Count by confidence band
  const highCount = activeFields.filter((f) => f.confidence >= 95).length;
  const medCount = activeFields.filter((f) => f.confidence >= 85 && f.confidence < 95).length;
  const lowCount = activeFields.filter((f) => f.confidence < 85).length;

  // Count by source
  const sourceCounts = activeFields.reduce((acc, f) => {
    const src = f.source;
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {});

  return (
    <Box>
      {/* Overall Confidence Summary */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          mb: 2,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Big confidence score */}
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: overallColor,
                  lineHeight: 1,
                  mb: 0.5,
                }}
              >
                {overallConfidence}%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                }}
              >
                Overall Confidence
              </Typography>
            </Box>
          </Grid>

          {/* Confidence band breakdown */}
          <Grid item xs={12} sm={5}>
            <Typography
              variant="caption"
              sx={{
                color: textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
                fontSize: '0.62rem',
                mb: 1.5,
                display: 'block',
              }}
            >
              Confidence Breakdown
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  label="HIGH"
                  size="small"
                  sx={{
                    ...apTheme.chips.confidence.high,
                    height: 22,
                    fontSize: '0.62rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    minWidth: 52,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(highCount / activeFields.length) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha('#059669', 0.1),
                      '& .MuiLinearProgress-bar': { bgcolor: '#059669', borderRadius: 3 },
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', minWidth: 24 }}>
                  {highCount}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  label="MED"
                  size="small"
                  sx={{
                    ...apTheme.chips.confidence.med,
                    height: 22,
                    fontSize: '0.62rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    minWidth: 52,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(medCount / activeFields.length) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha('#d97706', 0.1),
                      '& .MuiLinearProgress-bar': { bgcolor: '#d97706', borderRadius: 3 },
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', minWidth: 24 }}>
                  {medCount}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  label="LOW"
                  size="small"
                  sx={{
                    ...apTheme.chips.confidence.low,
                    height: 22,
                    fontSize: '0.62rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    minWidth: 52,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(lowCount / activeFields.length) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha('#dc2626', 0.1),
                      '& .MuiLinearProgress-bar': { bgcolor: '#dc2626', borderRadius: 3 },
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', minWidth: 24 }}>
                  {lowCount}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Source breakdown */}
          <Grid item xs={12} sm={4}>
            <Typography
              variant="caption"
              sx={{
                color: textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
                fontSize: '0.62rem',
                mb: 1.5,
                display: 'block',
              }}
            >
              Extraction Sources
            </Typography>
            <Stack spacing={0.75}>
              {Object.entries(sourceCounts).map(([src, count]) => {
                const cfg = sourceConfig[src] || { label: src, color: '#64748b' };
                return (
                  <Box key={src} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: cfg.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={{ fontSize: '0.72rem', color: textSecondary, flex: 1 }}>
                      {cfg.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: textColor }}>
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Invoice selector chip row */}
      <Paper
        elevation={0}
        sx={{
          p: 1,
          borderRadius: 2,
          mb: 1.5,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { height: 0 },
        }}
      >
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0, mr: 0.5 }}>
          Invoice:
        </Typography>
        {intakePipeline.filter((inv) => inv.processingState === 'complete').slice(0, 8).map((inv) => (
          <Chip
            key={inv.id}
            label={`${inv.vendor.split(' ')[0]} · ${inv.invoiceNum}`}
            size="small"
            onClick={() => onSelectFromPipeline && onSelectFromPipeline(inv)}
            sx={{
              height: 22,
              fontSize: '0.58rem',
              fontWeight: invoice?.id === inv.id ? 700 : 500,
              bgcolor: invoice?.id === inv.id ? alpha(TILE_COLOR, 0.15) : 'transparent',
              color: invoice?.id === inv.id ? TILE_COLOR : textSecondary,
              border: invoice?.id === inv.id ? `1px solid ${alpha(TILE_COLOR, 0.3)}` : '1px solid transparent',
              cursor: 'pointer',
              flexShrink: 0,
              '&:hover': { bgcolor: alpha(TILE_COLOR, 0.08) },
            }}
          />
        ))}
      </Paper>

      {/* Document reference */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: 2,
          mb: 2,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <SmartToyIcon sx={{ fontSize: 18, color: TILE_COLOR }} />
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: textColor }}>
              {invoice ? `${invoice.vendor} — ${invoice.invoiceNum}` : 'Thales Defense & Security — INV-2026-045231'}
            </Typography>
            <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.68rem' }}>
              {invoice
                ? `${invoice.dpDoc} · ${invoice.poRef ? `PO ${invoice.poRef} · ` : ''}${invoice.channel?.charAt(0).toUpperCase() + invoice.channel?.slice(1)} channel · ${activeFields.length} fields extracted`
                : `DP-2026-001452 · PO 4500098765 · Email channel · ${activeFields.length} fields extracted`
              }
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            {invoice ? (
              <Chip
                label={dpDocStatusLabels[invoice.dpStatus] || invoice.dpStatus}
                size="small"
                sx={{
                  ...(apTheme.chips.dpDocStatus[invoice.dpStatus] || {}),
                  height: 22,
                  fontSize: '0.62rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              />
            ) : (
              <Chip
                label="SELECT AN INVOICE"
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.62rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  bgcolor: alpha('#d97706', 0.1),
                  color: '#d97706',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Per-Field Extraction Table */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${borderColor}`,
          bgcolor: cardBg,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.5,
            bgcolor: darkMode ? '#21262d' : '#f1f5f9',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f87171' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fbbf24' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34d399' }} />
          <Typography variant="caption" sx={{ color: textSecondary, ml: 1 }}>
            AI Extraction — Per-Field Confidence · Template-Free (Vic.ai Model)
          </Typography>
        </Box>

        {/* Table header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr 200px 120px 130px',
            gap: 0,
            px: 2,
            py: 1.2,
            bgcolor: darkMode ? '#21262d' : '#f0f4f8',
            borderBottom: darkMode ? `2px solid #42a5f5` : `2px solid ${NAVY_BLUE}`,
          }}
        >
          {['Field', 'Extracted Value', 'Confidence', 'Level', 'Source'].map((h) => (
            <Typography
              key={h}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: darkMode ? '#e6edf3' : '#0d47a1',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
              }}
            >
              {h}
            </Typography>
          ))}
        </Box>

        {/* Field rows */}
        {activeFields.map((field, idx) => {
          const confColor = apTheme.getConfidenceColor(field.confidence);
          const confLevel = apTheme.getConfidenceLevel(field.confidence);
          const confChipStyle = apTheme.chips.confidence[confLevel] || {};
          const src = sourceConfig[field.source] || { label: field.source, color: '#64748b' };

          return (
            <Box
              key={idx}
              sx={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr 200px 120px 130px',
                gap: 0,
                px: 2,
                py: 1.3,
                alignItems: 'center',
                borderBottom: `1px solid ${borderColor}`,
                bgcolor: idx % 2 === 0
                  ? 'transparent'
                  : darkMode
                    ? alpha('#42a5f5', 0.03)
                    : alpha(NAVY_BLUE, 0.02),
                transition: 'background 0.15s ease',
                '&:hover': {
                  bgcolor: darkMode ? alpha('#42a5f5', 0.06) : alpha(NAVY_BLUE, 0.05),
                },
              }}
            >
              {/* Field Name */}
              <Typography
                sx={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: textColor,
                }}
              >
                {field.field}
              </Typography>

              {/* Extracted Value */}
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: textColor,
                  fontFamily: field.value.match(/^\d/) || field.value.startsWith('$')
                    ? '"JetBrains Mono", "Fira Code", monospace'
                    : 'inherit',
                }}
              >
                {field.value}
              </Typography>

              {/* Confidence Bar + Percentage */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1, maxWidth: 120 }}>
                  <LinearProgress
                    variant="determinate"
                    value={field.confidence}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(confColor, 0.12),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: confColor,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: confColor,
                    minWidth: 40,
                  }}
                >
                  {field.confidence}%
                </Typography>
              </Box>

              {/* Confidence Level Chip */}
              <Chip
                label={confLevel.toUpperCase()}
                size="small"
                sx={{
                  ...confChipStyle,
                  height: 22,
                  fontSize: '0.62rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              />

              {/* Source Chip */}
              <Chip
                label={src.label}
                size="small"
                sx={{
                  bgcolor: alpha(src.color, 0.1),
                  color: src.color,
                  fontWeight: 600,
                  height: 22,
                  fontSize: '0.62rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              />
            </Box>
          );
        })}

        {/* Footer summary */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: darkMode ? '#161b22' : '#f8fafc',
            borderTop: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.7rem' }}>
            {activeFields.length} fields extracted · Template-free AI model · No manual mapping required
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={`${highCount} HIGH`}
              size="small"
              sx={{
                ...apTheme.chips.confidence.high,
                height: 20,
                fontSize: '0.58rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            />
            <Chip
              label={`${medCount} MED`}
              size="small"
              sx={{
                ...apTheme.chips.confidence.med,
                height: 20,
                fontSize: '0.58rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            />
            {lowCount > 0 && (
              <Chip
                label={`${lowCount} LOW`}
                size="small"
                sx={{
                  ...apTheme.chips.confidence.low,
                  height: 20,
                  fontSize: '0.58rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              />
            )}
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};


// ═══════════════════════════════════════════════════════════════════
// SECTION 3: Autopilot Queue
// ═══════════════════════════════════════════════════════════════════

const AutopilotQueueSection = ({ darkMode, cardBg, textColor, textSecondary, borderColor }) => {
  const [autopilotThreshold, setAutopilotThreshold] = useState(95);

  // Filter queue based on threshold — items >= threshold are autopilot-eligible
  const filteredQueue = useMemo(() => {
    return autopilotQueue.map((item) => ({
      ...item,
      autopilot: item.confidence >= autopilotThreshold,
    }));
  }, [autopilotThreshold]);

  // Stats
  const autoEligible = filteredQueue.filter((q) => q.autopilot).length;
  const manualReview = filteredQueue.filter((q) => !q.autopilot).length;
  const totalValue = filteredQueue
    .filter((q) => q.autopilot)
    .reduce((sum, q) => sum + q.amount, 0);
  const avgConfidence = filteredQueue.length > 0
    ? (filteredQueue.reduce((s, q) => s + q.confidence, 0) / filteredQueue.length).toFixed(1)
    : 0;

  // DataGrid columns
  const autopilotColumns = [
    {
      field: 'vendor',
      headerName: 'Vendor / Invoice',
      flex: 1.3,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ py: 0.5 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: textColor, fontSize: '0.82rem', lineHeight: 1.3 }}
          >
            {params.row.vendor}
          </Typography>
          <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.68rem' }}>
            {params.row.invoiceNum} · {params.row.dpDoc}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: textColor, fontSize: '0.85rem' }}>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const score = params.value;
        const color = apTheme.getConfidenceColor(score);
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color }}>
              {score}%
            </Typography>
            <Box sx={{ width: '100%', mt: 0.3 }}>
              <LinearProgress
                variant="determinate"
                value={score}
                sx={{
                  height: 3,
                  borderRadius: 2,
                  bgcolor: alpha(color, 0.12),
                  '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 },
                }}
              />
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'matchType',
      headerName: 'Match Type',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.7rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'glCode',
      headerName: 'GL Code',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ ...apTheme.chips.sapCode, height: 18, fontSize: '0.6rem' }}
        />
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const actionKey = params.value?.toLowerCase();
        const chipStyle = apTheme.chips.sapAction[actionKey] || {};
        return (
          <Chip
            label={params.value}
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
      field: 'autopilot',
      headerName: 'Autopilot',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        if (params.value) {
          return (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
              label="AUTO"
              size="small"
              sx={{
                ...apTheme.chips.autopilot['auto-approved'],
                height: 22,
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
          );
        }
        return (
          <Chip
            label="MANUAL"
            size="small"
            sx={{
              ...apTheme.chips.autopilot['human-override'],
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
      field: 'processingTime',
      headerName: 'Time',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography
          variant="caption"
          sx={{
            color: params.value ? '#059669' : textSecondary,
            fontSize: '0.7rem',
            fontWeight: params.value ? 600 : 400,
          }}
        >
          {params.value || '—'}
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      {/* Stats Row */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {[
          {
            value: autoEligible,
            label: 'Auto-Eligible',
            sub: `>= ${autopilotThreshold}%`,
            color: '#059669',
          },
          {
            value: manualReview,
            label: 'Manual Review',
            sub: `< ${autopilotThreshold}%`,
            color: '#d97706',
          },
          {
            value: formatCompactCurrency(totalValue),
            label: 'Auto-Post Value',
            sub: 'Eligible value',
            color: TILE_COLOR,
          },
          {
            value: `${avgConfidence}%`,
            label: 'Avg Confidence',
            sub: 'All items',
            color: NAVY_BLUE,
          },
        ].map((stat, idx) => (
          <Grid item xs={6} sm={3} key={idx}>
            <Card
              sx={{
                borderRadius: 2,
                bgcolor: cardBg,
                border: `1px solid ${borderColor}`,
                textAlign: 'center',
              }}
            >
              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: stat.color,
                    fontSize: '1.2rem',
                    lineHeight: 1.1,
                    mb: 0.25,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    fontWeight: 600,
                    fontSize: '0.58rem',
                    display: 'block',
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: textSecondary, fontSize: '0.55rem' }}
                >
                  {stat.sub}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Threshold Slider */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          mb: 2,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <Stack direction="row" spacing={3} alignItems="center">
          <Box sx={{ flex: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <SpeedIcon sx={{ fontSize: 18, color: TILE_COLOR }} />
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: textColor }}>
                Autopilot Threshold
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.68rem' }}>
              Invoices at or above this confidence level are auto-processed
            </Typography>
          </Box>
          <Box sx={{ flex: 1, maxWidth: 400, px: 2 }}>
            <Slider
              value={autopilotThreshold}
              onChange={(e, val) => setAutopilotThreshold(val)}
              min={50}
              max={100}
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
              marks={[
                { value: 50, label: '50%' },
                { value: 75, label: '75%' },
                { value: 90, label: '90%' },
                { value: 95, label: '95%' },
                { value: 100, label: '100%' },
              ]}
              sx={{
                color: TILE_COLOR,
                '& .MuiSlider-thumb': {
                  bgcolor: '#fff',
                  border: `2px solid ${TILE_COLOR}`,
                  width: 18,
                  height: 18,
                  '&:hover': { boxShadow: `0 0 0 6px ${alpha(TILE_COLOR, 0.15)}` },
                },
                '& .MuiSlider-track': {
                  bgcolor: TILE_COLOR,
                },
                '& .MuiSlider-rail': {
                  bgcolor: alpha(TILE_COLOR, 0.2),
                },
                '& .MuiSlider-mark': {
                  bgcolor: alpha(TILE_COLOR, 0.3),
                },
                '& .MuiSlider-markLabel': {
                  fontSize: '0.65rem',
                  color: textSecondary,
                },
                '& .MuiSlider-valueLabel': {
                  bgcolor: TILE_COLOR,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                },
              }}
            />
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: 60 }}>
            <Typography
              sx={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: TILE_COLOR,
                lineHeight: 1,
              }}
            >
              {autopilotThreshold}%
            </Typography>
            <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.6rem' }}>
              Current
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Autopilot DataGrid */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${borderColor}`,
          bgcolor: cardBg,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.5,
            bgcolor: darkMode ? '#21262d' : '#f1f5f9',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f87171' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fbbf24' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34d399' }} />
          <Typography variant="caption" sx={{ color: textSecondary, ml: 1 }}>
            Autopilot Queue — Threshold {autopilotThreshold}% · {autoEligible} auto-eligible · {manualReview} manual review
          </Typography>
        </Box>

        <Box sx={{ height: 480, width: '100%' }}>
          <DataGrid
            rows={filteredQueue}
            columns={autopilotColumns}
            pageSizeOptions={[10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            getRowHeight={() => 58}
            getRowClassName={(params) =>
              params.row.autopilot ? 'autopilot-eligible' : 'manual-review'
            }
            sx={{
              ...apTheme.getDataGridSx({ darkMode, clickable: false }),
              '& .autopilot-eligible': {
                bgcolor: darkMode ? alpha('#10b981', 0.04) : alpha('#10b981', 0.02),
              },
              '& .manual-review': {
                bgcolor: darkMode ? alpha('#f59e0b', 0.04) : alpha('#f59e0b', 0.02),
              },
              '& .autopilot-eligible:hover': {
                bgcolor: darkMode ? alpha('#10b981', 0.08) : alpha('#10b981', 0.05),
              },
              '& .manual-review:hover': {
                bgcolor: darkMode ? alpha('#f59e0b', 0.08) : alpha('#f59e0b', 0.05),
              },
            }}
          />
        </Box>

        {/* Footer summary */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: darkMode ? '#161b22' : '#f8fafc',
            borderTop: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.7rem' }}>
            Autopilot processes invoices above confidence threshold automatically via MIRO/FB60
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
              label={`${autoEligible} AUTO`}
              size="small"
              sx={{
                ...apTheme.chips.autopilot['auto-approved'],
                height: 20,
                fontSize: '0.58rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
            <Chip
              label={`${manualReview} MANUAL`}
              size="small"
              sx={{
                ...apTheme.chips.autopilot['human-override'],
                height: 20,
                fontSize: '0.58rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            />
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};


// ═══════════════════════════════════════════════════════════════════
// SECTION 4: Line-Item Match Engine (wrapper)
// ═══════════════════════════════════════════════════════════════════

const LineItemMatchSection = ({ darkMode, cardBg, textColor, textSecondary, borderColor }) => (
  <Box>
    {/* Context header */}
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        mb: 2,
        bgcolor: cardBg,
        border: `1px solid ${borderColor}`,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <CheckCircleIcon sx={{ fontSize: 18, color: TILE_COLOR }} />
        <Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: textColor }}>
            Line-Item Match Engine
          </Typography>
          <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.68rem' }}>
            Multi-strategy matching with cascading confidence · PO line items, GR cross-reference, semantic matching, guardrails
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <Chip
            label="6 STRATEGIES"
            size="small"
            sx={{
              ...apTheme.chips.primary,
              height: 22,
              fontSize: '0.62rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          />
        </Box>
      </Stack>
    </Paper>

    {/* Line-Item Match Engine component */}
    <Box>
      <LineItemMatchEngine darkMode={darkMode} />
    </Box>
  </Box>
);


// ═══════════════════════════════════════════════════════════════════
// INVOICE DETAIL VIEW (PDF Viewer + AI Extraction Insights)
// ═══════════════════════════════════════════════════════════════════

const InvoiceDetailView = ({ invoice, darkMode, onBack, onBackToList, onNavigate }) => {
  const [pdfFullscreen, setPdfFullscreen] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState('invoice');

  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';

  // Build extracted fields from pipeline row
  const extractedRows = [
    { label: 'Invoice #', extracted: invoice.invoiceNum, sap: null, source: 'extracted', conf: invoice.invoiceNumConf },
    { label: 'Vendor', extracted: invoice.vendor, sap: 'LFA1 — Vendor Master', source: 'extracted', conf: invoice.vendorConf },
    { label: 'Invoice Date', extracted: 'Feb 8, 2026', sap: null, source: 'extracted', conf: invoice.dateConf },
    { label: 'Gross Amount', extracted: formatCurrency(invoice.amount), sap: null, source: 'extracted', conf: invoice.amountConf },
    { label: 'PO Reference', extracted: invoice.poRef || 'Non-PO', sap: invoice.poRef ? 'EKKO/EKPO — PO Match' : null, source: 'ai', conf: invoice.poConf },
    { label: 'Payment Terms', extracted: 'Net 30', sap: 'LFB1 — Net 30', source: 'database', conf: 99 },
    { label: 'Currency', extracted: 'USD', sap: 'T001 — USD', source: 'database', conf: 99 },
    { label: 'Company Code', extracted: '1000', sap: 'T001 — 1000', source: 'database', conf: 99 },
    { label: 'Channel', extracted: invoice.channel?.charAt(0).toUpperCase() + invoice.channel?.slice(1), sap: null, source: 'extracted', conf: 99 },
  ];

  // Source indicator component
  const SourceIndicator = ({ source }) => {
    const config = {
      extracted: { icon: <DescriptionIcon sx={{ fontSize: 10 }} />, color: '#10b981', label: 'Extracted from invoice' },
      database: { icon: <VerifiedUserIcon sx={{ fontSize: 10 }} />, color: NAVY_DARK, label: 'From SAP/Database' },
      calculated: { icon: <CalculateIcon sx={{ fontSize: 10 }} />, color: '#8b5cf6', label: 'Calculated value' },
      ai: { icon: <SmartToyIcon sx={{ fontSize: 10 }} />, color: TILE_COLOR, label: 'AI pre-filled' },
    };
    const c = config[source];
    if (!c) return null;
    return (
      <Tooltip title={c.label} arrow placement="top">
        <Box sx={{ display: 'inline-flex', color: c.color, ml: 0.5 }}>{c.icon}</Box>
      </Tooltip>
    );
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" onClick={() => onNavigate && onNavigate('landing')} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>
          CORE.AI
        </Link>
        <Link underline="hover" color="inherit" onClick={onBack} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>
          AP.AI
        </Link>
        <Link underline="hover" color="inherit" onClick={onBackToList} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>
          AI Processing Center
        </Link>
        <Typography color={textColor} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
          {invoice.invoiceNum}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 2, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Chip
                label={invoice.dpDoc}
                size="small"
                sx={{ bgcolor: alpha(TILE_COLOR, 0.12), color: TILE_COLOR, fontWeight: 700, fontSize: '0.7rem' }}
              />
              {invoice.approval && (
                <Chip
                  label={approvalConfig[invoice.approval]?.label || invoice.approval}
                  size="small"
                  sx={{
                    bgcolor: alpha(approvalConfig[invoice.approval]?.color || '#64748b', 0.12),
                    color: approvalConfig[invoice.approval]?.color || '#64748b',
                    fontWeight: 600,
                    fontSize: '0.65rem',
                  }}
                />
              )}
            </Stack>
            <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>
              {invoice.vendor} — {invoice.invoiceNum}
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              {formatCurrency(invoice.amount)} · {invoice.type} · {dpDocStatusLabels[invoice.dpStatus] || invoice.dpStatus}
            </Typography>
          </Box>
          <Button size="small" startIcon={<ArrowBackIcon />} onClick={onBackToList} sx={{ color: textSecondary }}>
            Back to Pipeline
          </Button>
        </Stack>
      </Paper>

      {/* Two-Panel Layout */}
      <Grid container spacing={2}>
        {/* LEFT PANEL: Document Viewer + Extracted Fields */}
        <Grid item xs={12} md={7}>
          <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg }}>
            {/* Document header with tabs */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <DescriptionIcon sx={{ color: TILE_COLOR, fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Document Extraction
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5}>
                {[
                  { key: 'invoice', label: 'Invoice' },
                  { key: 'po', label: 'PO' },
                  { key: 'gr', label: 'GR' },
                ].map((tab) => (
                  <Chip
                    key={tab.key}
                    label={tab.label}
                    size="small"
                    onClick={() => setActiveDocTab(tab.key)}
                    sx={{
                      bgcolor: activeDocTab === tab.key ? alpha(TILE_COLOR, 0.12) : alpha('#64748b', 0.08),
                      color: activeDocTab === tab.key ? NAVY_BLUE : textSecondary,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Box sx={{ p: 2, overflow: 'auto' }}>
              {/* PDF Document Viewer */}
              <Paper
                variant="outlined"
                sx={{ mb: 2, bgcolor: darkMode ? '#1e293b' : '#f8fafc', overflow: 'hidden', position: 'relative' }}
              >
                {/* PDF Header bar */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    borderBottom: `1px solid ${borderColor}`,
                    bgcolor: darkMode ? '#0f172a' : '#e2e8f0',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PdfIcon sx={{ fontSize: 18, color: '#dc2626' }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#334155' }}>
                      {invoice.invoiceNum} — {invoice.vendor}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Open in new tab">
                      <IconButton size="small" sx={{ color: textSecondary }}>
                        <OpenInNewIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Fullscreen">
                      <IconButton size="small" onClick={() => setPdfFullscreen(true)} sx={{ color: textSecondary }}>
                        <FullscreenIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                {/* PDF Placeholder */}
                <Box sx={{ height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: darkMode ? alpha('#fff', 0.02) : alpha('#000', 0.02) }}>
                  <DocumentScannerIcon sx={{ fontSize: 48, color: textSecondary, opacity: 0.25, mb: 1 }} />
                  <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 600, mb: 0.5 }}>
                    {invoice.invoiceNum}.pdf
                  </Typography>
                  <Typography variant="caption" sx={{ color: textSecondary, opacity: 0.7 }}>
                    {activeDocTab === 'invoice' ? 'Invoice Document (OCR Complete)' : activeDocTab === 'po' ? `PO ${invoice.poRef || '—'}` : 'Goods Receipt Document'}
                  </Typography>
                  <Chip
                    label="AI Extracted"
                    size="small"
                    sx={{ mt: 1, height: 20, fontSize: '0.6rem', bgcolor: alpha('#10b981', 0.12), color: '#059669', fontWeight: 600 }}
                  />
                </Box>
              </Paper>

              {/* Fullscreen PDF Dialog */}
              <Dialog
                open={pdfFullscreen}
                onClose={() => setPdfFullscreen(false)}
                maxWidth={false}
                fullWidth
                PaperProps={{ sx: { width: '95vw', height: '95vh', maxWidth: 'none', maxHeight: 'none', m: 0 } }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderBottom: `1px solid ${borderColor}`,
                    bgcolor: NAVY_DARK,
                    color: 'white',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PdfIcon sx={{ fontSize: 20 }} />
                    <Typography fontWeight={600}>
                      {invoice.invoiceNum} — {invoice.vendor}
                    </Typography>
                  </Stack>
                  <IconButton size="small" onClick={() => setPdfFullscreen(false)} sx={{ color: 'white' }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <DialogContent sx={{ p: 0, height: 'calc(100% - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f5f9' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <DocumentScannerIcon sx={{ fontSize: 80, color: '#94a3b8', opacity: 0.3, mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#64748b' }}>
                      {invoice.invoiceNum}.pdf
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
                      PDF viewer — invoice document would render here
                    </Typography>
                  </Box>
                </DialogContent>
              </Dialog>

              {/* Extracted Fields Header */}
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} /> Extracted Invoice Fields
                <Chip
                  label={`${extractedRows.length} fields`}
                  size="small"
                  sx={{ ml: 'auto', bgcolor: alpha('#10b981', 0.1), color: '#059669', fontSize: '0.65rem', height: 18 }}
                />
              </Typography>

              {/* Data Source Legend */}
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
                mb: 1.5,
                p: 1,
                bgcolor: alpha('#64748b', 0.05),
                borderRadius: 1,
                border: `1px dashed ${alpha('#64748b', 0.2)}`,
              }}>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', mr: 0.5 }}>
                  Data Source:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <DescriptionIcon sx={{ fontSize: 10, color: '#10b981' }} />
                  <Typography sx={{ fontSize: '0.6rem', color: textSecondary }}>Extracted</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <VerifiedUserIcon sx={{ fontSize: 10, color: NAVY_DARK }} />
                  <Typography sx={{ fontSize: '0.6rem', color: textSecondary }}>Database</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <SmartToyIcon sx={{ fontSize: 10, color: TILE_COLOR }} />
                  <Typography sx={{ fontSize: '0.6rem', color: textSecondary }}>AI Pre-filled</Typography>
                </Box>
              </Box>

              {/* Column Headers */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.75, bgcolor: alpha('#10b981', 0.1), borderRadius: 1 }}>
                  <DescriptionIcon sx={{ fontSize: 12, color: '#10b981' }} />
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                    Extracted (Invoice)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.75, bgcolor: alpha(NAVY_DARK, 0.1), borderRadius: 1 }}>
                  <VerifiedUserIcon sx={{ fontSize: 12, color: NAVY_DARK }} />
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: NAVY_DARK, textTransform: 'uppercase' }}>
                    SAP Matched
                  </Typography>
                </Box>
              </Box>

              {/* Two-column extracted fields */}
              <Box sx={{ maxHeight: 350, overflow: 'auto', pr: 0.5 }}>
                {extractedRows.map((field, idx) => (
                  <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mb: 0.5 }}>
                    {/* Extracted Column */}
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        border: '1px solid rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: darkMode ? alpha('#64748b', 0.05) : 'white',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                          {field.label}
                        </Typography>
                        <SourceIndicator source={field.source} />
                        {field.conf != null && <ConfidenceMiniBar value={field.conf} width={30} />}
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.7rem', mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {field.extracted || '—'}
                      </Typography>
                    </Paper>

                    {/* SAP Matched Column */}
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        border: '1px solid rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: field.sap ? alpha(NAVY_DARK, 0.06) : alpha('#64748b', 0.02),
                      }}
                    >
                      {field.sap ? (
                        <>
                          <Typography variant="caption" sx={{ color: NAVY_DARK, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                            SAP Reference
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.7rem', mt: 0.25, color: NAVY_DARK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {field.sap}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.6rem', fontStyle: 'italic' }}>
                          —
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Action Bar */}
            <Box sx={{ p: 2, borderTop: `1px solid ${borderColor}`, display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" sx={{ flex: 1, fontSize: '0.75rem', color: TILE_COLOR, borderColor: alpha(TILE_COLOR, 0.3), textTransform: 'none', borderRadius: 2 }}>
                Re-Extract
              </Button>
              <Button variant="outlined" size="small" sx={{ flex: 1, fontSize: '0.75rem', color: TILE_COLOR, borderColor: alpha(TILE_COLOR, 0.3), textTransform: 'none', borderRadius: 2 }}>
                Request Clarification
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* RIGHT PANEL: Confidence + AI Recommendation + Actions */}
        <Grid item xs={12} md={5}>
          <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'auto', borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg }}>
            <CardContent sx={{ p: 2.5 }}>
              {/* Overall Confidence Ring */}
              <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: darkMode ? '#0d1117' : '#f8fafc', border: `1px solid ${borderColor}`, mb: 2, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                  <CircularProgress
                    variant="determinate"
                    value={invoice.extractionConfidence || 0}
                    size={110}
                    thickness={4}
                    sx={{
                      color: apTheme.getConfidenceColor(invoice.extractionConfidence || 0),
                      '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                    }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={110}
                    thickness={4}
                    sx={{
                      color: darkMode ? alpha('#fff', 0.06) : alpha('#000', 0.06),
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      zIndex: 0,
                    }}
                  />
                  <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                    <Typography variant="h4" fontWeight={700} sx={{ color: apTheme.getConfidenceColor(invoice.extractionConfidence || 0), lineHeight: 1.1 }}>
                      {invoice.extractionConfidence || '—'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Extraction
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: textSecondary, display: 'block', fontSize: '0.72rem' }}>
                  {invoice.fieldsExtracted}/{invoice.fieldsTotal} fields extracted · {invoice.channel} channel
                </Typography>
              </Paper>

              {/* Per-Field Confidence Breakdown */}
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? '#0d1117' : '#f8fafc', border: `1px solid ${borderColor}`, mb: 2 }}>
                <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.65rem', mb: 1.5, display: 'block' }}>
                  Per-Field Confidence
                </Typography>
                {[
                  { label: 'Vendor', value: invoice.vendorConf },
                  { label: 'Invoice #', value: invoice.invoiceNumConf },
                  { label: 'Amount', value: invoice.amountConf },
                  { label: 'Date', value: invoice.dateConf },
                  { label: 'PO Ref', value: invoice.poConf },
                ].filter((f) => f.value != null).map((f, i) => {
                  const color = apTheme.getConfidenceColor(f.value);
                  return (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.6, borderBottom: `1px solid ${alpha(borderColor, 0.5)}` }}>
                      <Typography sx={{ fontSize: '0.72rem', color: textSecondary, minWidth: 70 }}>{f.label}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={f.value}
                          sx={{
                            height: 5,
                            borderRadius: 3,
                            bgcolor: alpha(color, 0.12),
                            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color, minWidth: 36 }}>
                        {f.value}%
                      </Typography>
                    </Box>
                  );
                })}
              </Paper>

              {/* AI Recommendation */}
              <Card sx={{ mb: 2, bgcolor: alpha(NAVY_DARK, 0.04), border: '1px solid rgba(0,0,0,0.1)', borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: TILE_COLOR, boxShadow: `0 0 8px ${alpha(TILE_COLOR, 0.5)}` }} />
                    <Typography variant="caption" sx={{ color: NAVY_DARK, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, fontSize: '0.6rem' }}>
                      AI Recommendation
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: textColor, lineHeight: 1.8, fontSize: '0.8rem' }}>
                    {invoice.extractionConfidence >= 95 ? (
                      <><strong>Recommend: Auto-process this invoice.</strong> All field confidences above threshold. Extraction complete with {invoice.fieldsExtracted}/{invoice.fieldsTotal} fields. No anomalies detected.</>
                    ) : invoice.extractionConfidence >= 85 ? (
                      <><strong>Recommend: Manual review required.</strong> Some field confidences below auto-approval threshold. Review flagged fields before processing.</>
                    ) : (
                      <><strong>Recommend: Hold for detailed review.</strong> Low extraction confidence on multiple fields. Consider re-extraction or manual entry.</>
                    )}
                  </Typography>
                </CardContent>
              </Card>

              {/* PO Candidate Ranking (for PO-backed invoices) */}
              {invoice.poRef && (
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? '#0d1117' : '#f8fafc', border: `1px solid ${borderColor}`, mb: 2 }}>
                  <Typography variant="caption" sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, fontSize: '0.65rem', mb: 1.5, display: 'block' }}>
                    PO Candidate Ranking
                  </Typography>
                  {[
                    { po: invoice.poRef, confidence: 97, match: 'Exact vendor + amount + date', rank: 1 },
                    { po: `${invoice.poRef.slice(0, -1)}8`, confidence: 34, match: 'Same vendor, different material', rank: 2 },
                    { po: `${invoice.poRef.slice(0, -2)}01`, confidence: 12, match: 'Similar amount, different vendor', rank: 3 },
                  ].map((candidate, ci) => (
                    <Box key={ci} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: ci < 2 ? `1px solid ${alpha(borderColor, 0.5)}` : 'none' }}>
                      <Box>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Chip label={`#${candidate.rank}`} size="small" sx={{ bgcolor: ci === 0 ? alpha('#10b981', 0.12) : alpha('#64748b', 0.08), color: ci === 0 ? '#059669' : textSecondary, fontWeight: 700, fontSize: '0.6rem', height: 18, width: 28 }} />
                          <Typography variant="caption" sx={{ color: textColor, fontWeight: 600, fontSize: '0.72rem' }}>
                            PO {candidate.po}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.62rem', ml: 4, display: 'block' }}>
                          {candidate.match}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${candidate.confidence}%`}
                        size="small"
                        sx={{
                          bgcolor: candidate.confidence > 90 ? alpha('#10b981', 0.12) : candidate.confidence > 50 ? alpha('#fbbf24', 0.12) : alpha('#64748b', 0.08),
                          color: candidate.confidence > 90 ? '#059669' : candidate.confidence > 50 ? '#d97706' : textSecondary,
                          fontWeight: 700, fontSize: '0.65rem', height: 22,
                        }}
                      />
                    </Box>
                  ))}
                </Paper>
              )}

              {/* GL Auto-Coding (Non-PO invoices) */}
              {!invoice.poRef && (
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? '#0d1117' : alpha('#8b5cf6', 0.03), border: `1px solid ${borderColor}`, mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, fontSize: '0.65rem', mb: 1.5, display: 'block' }}>
                    GL Auto-Coding — AI Suggested
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: `1px solid ${alpha(borderColor, 0.5)}` }}>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.72rem' }}>GL Account</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Chip label="54200" size="small" sx={{ bgcolor: alpha('#7c3aed', 0.1), color: '#7c3aed', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
                      <Typography variant="caption" sx={{ color: textColor, fontWeight: 600, fontSize: '0.72rem' }}>Office Supplies</Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: `1px solid ${alpha(borderColor, 0.5)}` }}>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.72rem' }}>Cost Center</Typography>
                    <Typography variant="caption" sx={{ color: textColor, fontWeight: 600, fontSize: '0.72rem' }}>CC1000 — General Admin</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8 }}>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.72rem' }}>Confidence</Typography>
                    <Chip label="96.1%" size="small" sx={{ bgcolor: alpha('#10b981', 0.12), color: '#059669', fontWeight: 700, fontSize: '0.65rem', height: 22 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.62rem', mt: 1, display: 'block', lineHeight: 1.5 }}>
                    Based on prior invoices from this vendor with identical description pattern.
                  </Typography>
                </Paper>
              )}

              {/* Decision Buttons */}
              <Typography variant="caption" sx={{ color: '#d97706', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, fontSize: '0.6rem', mb: 1, display: 'block' }}>
                Your Decision
              </Typography>

              <Stack spacing={0.8}>
                <Button fullWidth startIcon={<CheckCircleIcon />} sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: alpha('#34d399', 0.08), color: '#059669', border: `1px solid ${alpha('#34d399', 0.2)}`, borderRadius: 2, textTransform: 'none', px: 2, '&:hover': { bgcolor: alpha('#34d399', 0.16) } }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Post Invoice (MIRO)</Typography>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem' }}>Posts to SAP with AI-verified data</Typography>
                  </Box>
                </Button>
                <Button fullWidth startIcon={<PauseIcon />} sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: alpha('#fbbf24', 0.08), color: '#d97706', border: `1px solid ${alpha('#fbbf24', 0.2)}`, borderRadius: 2, textTransform: 'none', px: 2, '&:hover': { bgcolor: alpha('#fbbf24', 0.16) } }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Park for Later (MIR7)</Typography>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem' }}>Saves with all context for review</Typography>
                  </Box>
                </Button>
                <Button fullWidth startIcon={<ForwardIcon />} sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: alpha('#3b82f6', 0.08), color: '#2563eb', border: `1px solid ${alpha('#3b82f6', 0.2)}`, borderRadius: 2, textTransform: 'none', px: 2, '&:hover': { bgcolor: alpha('#3b82f6', 0.16) } }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Route to Buyer</Typography>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem' }}>Sends to buyer with PO discrepancy</Typography>
                  </Box>
                </Button>
                <Button fullWidth startIcon={<CloseIcon />} sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: alpha('#f87171', 0.08), color: '#dc2626', border: `1px solid ${alpha('#f87171', 0.2)}`, borderRadius: 2, textTransform: 'none', px: 2, '&:hover': { bgcolor: alpha('#f87171', 0.16) } }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Reject Invoice</Typography>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem' }}>Returns to vendor with reason</Typography>
                  </Box>
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};


// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT: AI Processing Center
// ═══════════════════════════════════════════════════════════════════

const AIProcessingCenter = ({ onBack, darkMode = false, onNavigate }) => {
  const [activeSection, setActiveSection] = useState('pipeline');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [extractionInvoice, setExtractionInvoice] = useState(null);

  // Theme colors (matching exact pattern from InvoiceEntry / other tiles)
  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';

  // ── Drill-down view ──
  if (selectedInvoice) {
    return (
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>
        <InvoiceDetailView
          invoice={selectedInvoice}
          darkMode={darkMode}
          onBack={onBack}
          onBackToList={() => setSelectedInvoice(null)}
          onNavigate={onNavigate}
        />
      </Box>
    );
  }

  // Common props for section components
  const sectionProps = { darkMode, cardBg, textColor, textSecondary, borderColor };

  // Pipeline summary stats for header
  const totalPipeline = ingestionChannels.reduce((sum, ch) => sum + ch.count, 0);
  const avgExtraction = intakePipeline
    .filter((i) => i.extractionConfidence != null)
    .reduce((sum, i, _, arr) => sum + i.extractionConfidence / arr.length, 0)
    .toFixed(1);
  const readyCount = intakePipeline.filter((i) => i.dpStatus === 'ready').length;
  const autoEligible = autopilotQueue.filter((q) => q.confidence >= 95).length;

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>
      {/* ── Breadcrumbs ── */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => onNavigate && onNavigate('landing')}
          sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}
        >
          CORE.AI
        </Link>
        <Link
          underline="hover"
          color="inherit"
          onClick={onBack}
          sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}
        >
          AP.AI
        </Link>
        <Typography color={textColor} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
          AI Processing Center
        </Typography>
      </Breadcrumbs>

      {/* ── Header ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          mb: 2,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
              <Chip
                label="VIEW 1"
                size="small"
                sx={{ bgcolor: TILE_COLOR, color: '#fff', fontWeight: 700, fontSize: '0.62rem', height: 20 }}
              />
              <Typography
                variant="caption"
                sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.68rem' }}
              >
                AI Processing Center
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={700} sx={{ color: textColor }}>
              AI Processing Center
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary, fontSize: '0.78rem' }}>
              Multi-channel intake, template-free extraction, autopilot queue, and line-item matching
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ color: textSecondary }}
          >
            Back
          </Button>
        </Stack>
      </Paper>

      {/* ── Summary KPI Row ── */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {[
          { value: totalPipeline, label: 'In Pipeline', color: TILE_COLOR },
          { value: `${avgExtraction}%`, label: 'Avg Extraction', color: '#059669' },
          { value: readyCount, label: 'Ready to Post', color: NAVY_BLUE },
          { value: autoEligible, label: 'Autopilot Eligible', color: '#d97706' },
        ].map((stat, idx) => (
          <Grid item xs={6} sm={3} key={idx}>
            <Card
              sx={{
                borderRadius: 2,
                bgcolor: cardBg,
                border: `1px solid ${borderColor}`,
                textAlign: 'center',
              }}
            >
              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: stat.color,
                    fontSize: '1.2rem',
                    lineHeight: 1.1,
                    mb: 0.25,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    fontWeight: 600,
                    fontSize: '0.58rem',
                  }}
                >
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Quick-Nav Chip Row ── */}
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
        <Chip
          icon={<InsightsIcon sx={{ fontSize: 13 }} />}
          label="Intelligence"
          size="small"
          onClick={() => onNavigate && onNavigate('intelligence')}
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

      {/* ── Section Tab Bar ── */}
      <Stack direction="row" spacing={0.75} sx={{ mb: 1.5 }}>
        {sections.map((s) => (
          <Button
            key={s.key}
            size="small"
            onClick={() => setActiveSection(s.key)}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: activeSection === s.key ? 700 : 500,
              fontSize: '0.72rem',
              py: 0.5,
              color: activeSection === s.key ? '#fff' : textSecondary,
              bgcolor: activeSection === s.key ? TILE_COLOR : 'transparent',
              border: activeSection === s.key ? 'none' : `1px solid ${borderColor}`,
              '&:hover': {
                bgcolor: activeSection === s.key ? TILE_COLOR : alpha(TILE_COLOR, 0.08),
              },
            }}
          >
            {s.label}
          </Button>
        ))}
      </Stack>

      {/* ── Active Section Content ── */}
      {activeSection === 'pipeline' && (
        <IntakePipelineSection
          {...sectionProps}
          onSelectInvoice={setSelectedInvoice}
          onHighlightInvoice={(inv) => setExtractionInvoice(inv)}
          highlightedId={extractionInvoice?.id}
          onNavigate={onNavigate}
        />
      )}

      {activeSection === 'extraction' && (
        <ExtractionPanelSection
          {...sectionProps}
          invoice={extractionInvoice}
          onSelectFromPipeline={(inv) => setExtractionInvoice(inv)}
        />
      )}

      {activeSection === 'autopilot' && (
        <AutopilotQueueSection {...sectionProps} />
      )}

      {activeSection === 'matching' && (
        <LineItemMatchSection {...sectionProps} />
      )}
    </Box>
  );
};

export default AIProcessingCenter;
