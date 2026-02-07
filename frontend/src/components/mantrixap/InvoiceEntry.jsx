import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack,
  Button, Breadcrumbs, Link, Paper, CircularProgress,
  IconButton, Tooltip, Dialog, DialogContent,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  DocumentScanner as DocumentScannerIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonChecked as ActiveIcon,
  RadioButtonUnchecked as PendingIcon,
  Pause as PauseIcon,
  Forward as ForwardIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Fullscreen as FullscreenIcon,
  OpenInNew as OpenInNewIcon,
  Description as DescriptionIcon,
  VerifiedUser as VerifiedUserIcon,
  Calculate as CalculateIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import {
  invoiceList,
  invoiceFields,
  matchDetails,
  poScheduleCheck,
  workflowSteps,
  invoiceLineItems,
} from './apMockData';
import { apTheme, MODULE_NAVY, NAVY_DARK, NAVY_BLUE } from './apTheme';
import LineItemMatchEngine from './LineItemMatchEngine';

const TILE_COLOR = MODULE_NAVY;

const getScoreColor = (level) => {
  switch (level) {
    case 'high': return '#059669';
    case 'mid': return '#d97706';
    case 'low': return '#dc2626';
    default: return '#94a3b8';
  }
};

// Source indicator component (matches ORDLY.AI pattern)
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

// Normalize a row from any tile into InvoiceEntry's expected shape
const normalizeInvoice = (row) => {
  if (!row) return null;
  // If already has invoiceNum, it's native — return as-is
  if (row.invoiceNum) return row;
  // Extract invoice # and PO from `detail` field (e.g. "INV-LM-8834 · PO 4500087654 · ...")
  const parts = (row.detail || '').split(' · ');
  const invNum = parts[0] || 'Unknown';
  const poMatch = (row.detail || '').match(/PO (\d+)/);
  const poRef = poMatch ? poMatch[1] : (row.detail || '').includes('Non-PO') ? '—' : '—';
  // Try to find exact match in invoiceList by invoice number
  const found = invoiceList.find((inv) => inv.invoiceNum === invNum);
  if (found) return found;
  // Try fuzzy match by vendor name
  const vendorMatch = invoiceList.find((inv) => inv.vendor === row.vendor || row.vendor?.includes(inv.vendor) || inv.vendor?.includes(row.vendor));
  if (vendorMatch) return vendorMatch;
  // Build from available fields
  const scoreVal = row.score ?? row.confidence ?? row.aiScore ?? null;
  const scoreLvl = row.scoreLevel || (scoreVal > 90 ? 'high' : scoreVal > 60 ? 'mid' : scoreVal ? 'low' : 'parked');
  return {
    id: row.id || 0,
    invoiceNum: invNum,
    vendor: row.vendor || 'Unknown',
    date: '02/04/2026',
    amount: row.amount || '$0.00',
    poRef,
    type: (row.type || '').split('\n')[0] || (poRef === '—' ? 'Non-PO' : 'PO-Backed'),
    matchType: row.matchType || (row.type || '').split('\n')[1] || '—',
    aiScore: scoreVal,
    scoreLevel: scoreLvl,
    status: row.status === 'ready' ? 'matched' : row.status || 'review',
    aiHint: row.aiHint || row.reason || row.aiUpdate || '—',
  };
};

const InvoiceEntry = ({ onBack, darkMode = false, onNavigate, initialInvoice = null, onClearInitialInvoice }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(() => normalizeInvoice(initialInvoice));
  const [pdfFullscreen, setPdfFullscreen] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState('invoice');

  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';

  const sapCodeChip = (code) => (
    <Chip
      label={code}
      size="small"
      sx={{ ...apTheme.chips.sapCode, height: 18, fontSize: '0.6rem', mr: 0.5 }}
    />
  );

  // DataGrid columns for invoice list
  const columns = [
    {
      field: 'aiScore',
      headerName: 'AI Score',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const { scoreLevel, aiScore } = params.row;
        if (scoreLevel === 'parked' || aiScore === null) {
          return <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#94a3b8' }}>—</Typography>;
        }
        return (
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: getScoreColor(scoreLevel) }}>
            {aiScore}
          </Typography>
        );
      },
    },
    {
      field: 'vendor',
      headerName: 'Vendor / Invoice',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ py: 0.5 }}>
          <Typography variant="body2" fontWeight={600} sx={{ color: textColor, fontSize: '0.82rem', lineHeight: 1.3 }}>
            {params.row.vendor}
          </Typography>
          <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.68rem' }}>
            {params.row.invoiceNum} · {params.row.poRef !== '—' ? `PO ${params.row.poRef}` : 'Non-PO'}
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
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} sx={{ color: textColor, fontSize: '0.85rem' }}>
          {params.value}
        </Typography>
      ),
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
      field: 'status',
      headerName: 'Status',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const chipStyle = apTheme.chips.invoiceStatus[params.value] || {};
        const labels = { matched: 'Matched', review: 'Review', exception: 'Exception', parked: 'Parked' };
        return (
          <Chip
            label={labels[params.value] || params.value}
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
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: NAVY_DARK, fontSize: '0.7rem', lineHeight: 1.5 }}>
          {params.value}
        </Typography>
      ),
    },
  ];

  const handleRowClick = (params) => {
    setSelectedInvoice(params.row);
    setActiveDocTab('invoice');
    setPdfFullscreen(false);
  };

  const handleBackToList = () => {
    setSelectedInvoice(null);
    if (onClearInitialInvoice) onClearInitialInvoice();
  };

  // Build dynamic extracted fields for the selected invoice
  const getExtractedFieldRows = (inv) => {
    if (!inv) return [];
    return [
      { label: 'Invoice #', extracted: inv.invoiceNum, sap: null, source: 'extracted' },
      { label: 'Vendor', extracted: inv.vendor, sap: 'LFA1 — Vendor Master', source: 'extracted' },
      { label: 'Invoice Date', extracted: inv.date, sap: null, source: 'extracted' },
      { label: 'Gross Amount', extracted: inv.amount, sap: null, source: 'extracted' },
      { label: 'PO Reference', extracted: inv.poRef !== '—' ? inv.poRef : 'Non-PO', sap: inv.poRef !== '—' ? 'EKKO/EKPO — PO Match' : null, source: 'ai' },
      { label: 'Payment Terms', extracted: 'Net 30', sap: 'LFB1 — Net 30', source: 'database' },
      { label: 'Match Type', extracted: inv.matchType, sap: null, source: 'ai' },
      { label: 'Currency', extracted: 'USD', sap: 'T001 — USD', source: 'database' },
      { label: 'Company Code', extracted: '1000', sap: 'T001 — 1000', source: 'database' },
    ];
  };

  // AP Workflow stepper — current step based on invoice status
  const getActiveStep = (inv) => {
    if (!inv) return 0;
    if (inv.status === 'parked') return 2;
    if (inv.status === 'exception') return 3;
    if (inv.status === 'review') return 3;
    if (inv.status === 'matched') return 4;
    return 2;
  };

  // ===== DRILLDOWN VIEW =====
  if (selectedInvoice) {
    const activeStep = getActiveStep(selectedInvoice);
    const extractedRows = getExtractedFieldRows(selectedInvoice);

    return (
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" onClick={() => onNavigate && onNavigate('landing')} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>
            CORE.AI
          </Link>
          <Link underline="hover" color="inherit" onClick={onBack} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>
            AP.AI
          </Link>
          <Link underline="hover" color="inherit" onClick={handleBackToList} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>
            Invoice Entry
          </Link>
          <Typography color={textColor} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {selectedInvoice.invoiceNum}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 2, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Chip label="TILE 1" size="small" sx={{ bgcolor: TILE_COLOR, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
                <Typography variant="caption" sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Invoice Detail
                </Typography>
              </Stack>
              <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>
                {selectedInvoice.vendor} — {selectedInvoice.invoiceNum}
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                {selectedInvoice.amount} · {selectedInvoice.matchType}
              </Typography>
            </Box>
            <Button size="small" startIcon={<ArrowBackIcon />} onClick={handleBackToList} sx={{ color: textSecondary }}>
              Back to List
            </Button>
          </Stack>
        </Paper>

        {/* AP Workflow Stepper */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 2,
            py: 1,
            mb: 2,
            bgcolor: darkMode ? alpha(TILE_COLOR, 0.08) : alpha(TILE_COLOR, 0.04),
            borderRadius: 2,
            border: `1px solid ${alpha(TILE_COLOR, 0.1)}`,
          }}
        >
          <Chip
            label={selectedInvoice.invoiceNum}
            size="small"
            sx={{ bgcolor: alpha(TILE_COLOR, 0.12), color: TILE_COLOR, fontWeight: 700, fontSize: '0.7rem', height: 24, mr: 1 }}
          />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
            {workflowSteps.map((ws, idx) => {
              const isComplete = idx < activeStep;
              const isActive = idx === activeStep;
              const isPending = idx > activeStep;
              const statusColor = isComplete ? '#10b981' : isActive ? TILE_COLOR : '#94a3b8';
              return (
                <React.Fragment key={ws.step}>
                  <Tooltip
                    title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{ws.name}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>{ws.desc}</Typography>
                        <Chip label={ws.who === 'ai' ? 'AI' : 'Human'} size="small" sx={{ mt: 0.5, height: 16, fontSize: '0.55rem', bgcolor: ws.who === 'ai' ? alpha(TILE_COLOR, 0.15) : alpha('#ff751f', 0.15), color: ws.who === 'ai' ? TILE_COLOR : '#e5600a', fontWeight: 700 }} />
                      </Box>
                    }
                    arrow
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: isActive ? alpha(TILE_COLOR, 0.15) : isComplete ? alpha('#10b981', 0.08) : 'transparent',
                        border: isActive ? `2px solid ${TILE_COLOR}` : `1px solid ${isPending ? alpha('#94a3b8', 0.3) : 'transparent'}`,
                        opacity: isPending ? 0.5 : 1,
                      }}
                    >
                      <Box sx={{ color: statusColor, display: 'flex', alignItems: 'center' }}>
                        {isComplete ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : isActive ? <ActiveIcon sx={{ fontSize: 14 }} /> : <PendingIcon sx={{ fontSize: 14 }} />}
                      </Box>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: isActive ? 700 : 600, color: statusColor, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                        {ws.name}
                      </Typography>
                    </Box>
                  </Tooltip>
                  {idx < workflowSteps.length - 1 && (
                    <ArrowForwardIcon sx={{ fontSize: 12, color: idx < activeStep ? '#10b981' : alpha('#94a3b8', 0.4), mx: 0.25 }} />
                  )}
                </React.Fragment>
              );
            })}
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ ml: 'auto' }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.6rem', color: textSecondary, textTransform: 'uppercase' }}>Amount</Typography>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: textColor }}>{selectedInvoice.amount}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.6rem', color: textSecondary, textTransform: 'uppercase' }}>Score</Typography>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: getScoreColor(selectedInvoice.scoreLevel) }}>
                {selectedInvoice.aiScore || '—'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Two-Panel Layout */}
        <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          {/* LEFT PANEL: Document Viewer + Extracted Fields */}
          <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg }}>
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

              <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
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
                        {selectedInvoice.invoiceNum} — {selectedInvoice.vendor}
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
                      {selectedInvoice.invoiceNum}.pdf
                    </Typography>
                    <Typography variant="caption" sx={{ color: textSecondary, opacity: 0.7 }}>
                      {activeDocTab === 'invoice' ? 'Invoice Document (OCR Complete)' : activeDocTab === 'po' ? `PO ${selectedInvoice.poRef}` : 'Goods Receipt Document'}
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
                        {selectedInvoice.invoiceNum} — {selectedInvoice.vendor}
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
                        {selectedInvoice.invoiceNum}.pdf
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
                <Box sx={{ maxHeight: 320, overflow: 'auto', pr: 0.5 }}>
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
                <Button variant="outlined" size="small" sx={{ flex: 1, fontSize: '0.75rem', color: TILE_COLOR, borderColor: alpha(TILE_COLOR, 0.3) }}>
                  Re-Extract
                </Button>
                <Button variant="outlined" size="small" sx={{ flex: 1, fontSize: '0.75rem', color: TILE_COLOR, borderColor: alpha(TILE_COLOR, 0.3) }}>
                  Request Clarification
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* RIGHT PANEL: Confidence + Match + AI Recommendation + Actions */}
          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg }}>
              <CardContent sx={{ p: 2.5 }}>
                {/* Line-Item Match Summary (if line items exist) */}
                {invoiceLineItems[selectedInvoice.id] && (() => {
                  const lines = invoiceLineItems[selectedInvoice.id];
                  const matchedCount = lines.filter((l) => l.matchStatus === 'matched').length;
                  const exceptionCount = lines.filter((l) => ['exception', 'partial', 'unplanned'].includes(l.matchStatus)).length;
                  return (
                    <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? '#0d1117' : alpha('#f0f4f8', 0.6), border: `1px solid ${borderColor}`, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: textSecondary }}>
                        Line-Item Match
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        <Chip
                          label={`${matchedCount}/${lines.length} matched`}
                          size="small"
                          sx={{
                            bgcolor: matchedCount === lines.length ? alpha('#10b981', 0.12) : alpha('#f59e0b', 0.12),
                            color: matchedCount === lines.length ? '#059669' : '#d97706',
                            fontWeight: 700, fontSize: '0.6rem', height: 20,
                          }}
                        />
                        {exceptionCount > 0 && (
                          <Chip
                            label={`${exceptionCount} exception${exceptionCount > 1 ? 's' : ''}`}
                            size="small"
                            sx={{ bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', fontWeight: 600, fontSize: '0.6rem', height: 20 }}
                          />
                        )}
                      </Stack>
                    </Paper>
                  );
                })()}

                {/* Confidence Ring */}
                <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: darkMode ? '#0d1117' : '#f8fafc', border: `1px solid ${borderColor}`, mb: 2, textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                    <CircularProgress variant="determinate" value={selectedInvoice.aiScore || 0} size={110} thickness={4} sx={{ color: getScoreColor(selectedInvoice.scoreLevel), '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
                    <CircularProgress variant="determinate" value={100} size={110} thickness={4} sx={{ color: darkMode ? alpha('#fff', 0.06) : alpha('#000', 0.06), position: 'absolute', left: 0, top: 0, zIndex: 0 }} />
                    <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                      <Typography variant="h4" fontWeight={700} sx={{ color: getScoreColor(selectedInvoice.scoreLevel), lineHeight: 1.1 }}>
                        {selectedInvoice.aiScore || '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Match Score
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: textSecondary, display: 'block', fontSize: '0.72rem' }}>
                    {selectedInvoice.aiHint}
                  </Typography>
                </Paper>

                {/* Match Details */}
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? '#0d1117' : '#f8fafc', border: `1px solid ${borderColor}`, mb: 2 }}>
                  <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.65rem', mb: 1, display: 'block' }}>
                    Match Details
                  </Typography>
                  {matchDetails.map((m, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.7, borderBottom: i < matchDetails.length - 1 ? `1px solid ${alpha(borderColor, 0.5)}` : 'none' }}>
                      <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.72rem' }}>{m.label}</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {m.status === 'pass' && <CheckCircleIcon sx={{ fontSize: 13, color: '#059669' }} />}
                        <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, fontSize: '0.7rem' }}>{m.value}</Typography>
                      </Stack>
                    </Box>
                  ))}
                </Paper>

                {/* PO Schedule vs GR Check */}
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? '#0d1117' : '#f8fafc', border: `1px solid ${borderColor}`, mb: 2 }}>
                  <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.65rem', mb: 1, display: 'block' }}>
                    PO Schedule vs GR Check
                  </Typography>
                  {poScheduleCheck.map((pc, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.7, borderBottom: i < poScheduleCheck.length - 1 ? `1px solid ${alpha(borderColor, 0.5)}` : 'none' }}>
                      <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.72rem' }}>{pc.label}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.72rem', color: textColor }}>
                        {pc.sapCode && sapCodeChip(pc.sapCode)}{pc.value}
                      </Typography>
                    </Box>
                  ))}
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
                      <strong>Recommend: Post this invoice.</strong> Price within 0.3%
                      tolerance. Quantity exact. GR confirmed. Vendor reliability 96.8
                      across 247 invoices. No duplicates. No anomalies detected.
                    </Typography>
                  </CardContent>
                </Card>

                {/* PO Candidate Ranking (PO-backed invoices) */}
                {selectedInvoice.poRef && selectedInvoice.poRef !== '—' && (
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? '#0d1117' : '#f8fafc', border: `1px solid ${borderColor}`, mb: 2 }}>
                    <Typography variant="caption" sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, fontSize: '0.65rem', mb: 1.5, display: 'block' }}>
                      PO Candidate Ranking
                    </Typography>
                    {[
                      { po: selectedInvoice.poRef, confidence: 97, match: 'Exact vendor + amount + date', rank: 1 },
                      { po: `${selectedInvoice.poRef.slice(0, -1)}8`, confidence: 34, match: 'Same vendor, different material', rank: 2 },
                      { po: `${selectedInvoice.poRef.slice(0, -2)}01`, confidence: 12, match: 'Similar amount, different vendor', rank: 3 },
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

                {/* GL Auto-Coding (Non-PO invoices, or PO invoices with unplanned cost lines) */}
                {((!selectedInvoice.poRef || selectedInvoice.poRef === '—') || (invoiceLineItems[selectedInvoice.id] && invoiceLineItems[selectedInvoice.id].some((l) => l.matchStatus === 'unplanned'))) && (
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
                      Based on 14 prior invoices from this vendor with identical description pattern.
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

        {/* Line-Item Match Engine — full width below two-panel layout */}
        {invoiceLineItems[selectedInvoice.id] && (
          <LineItemMatchEngine invoiceId={selectedInvoice.id} darkMode={darkMode} />
        )}
      </Box>
    );
  }

  // ===== LIST VIEW (DataGrid) =====
  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" onClick={() => onNavigate && onNavigate('landing')} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>
          CORE.AI
        </Link>
        <Link underline="hover" color="inherit" onClick={onBack} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>
          AP.AI
        </Link>
        <Typography color={textColor} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
          Invoice Entry
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Chip label="TILE 1" size="small" sx={{ bgcolor: TILE_COLOR, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
              <Typography variant="caption" sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1 }}>
                Invoice Entry
              </Typography>
            </Stack>
            <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>
              Invoice Entry & AI-Assisted Matching
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              8 invoices received today — click any row to open the invoice workbench
            </Typography>
          </Box>
          <Button size="small" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: textSecondary }}>
            Back
          </Button>
        </Stack>
      </Paper>

      {/* Summary Stats */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {[
          { value: 8, label: 'New Today', color: TILE_COLOR },
          { value: 4, label: 'Matched', color: '#059669' },
          { value: 2, label: 'Need Review', color: '#d97706' },
          { value: 1, label: 'Exception', color: '#dc2626' },
        ].map((stat, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card sx={{ borderRadius: 3, bgcolor: cardBg, border: `1px solid ${borderColor}`, textAlign: 'center' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography sx={{ fontWeight: 700, color: stat.color, fontSize: '1.8rem', lineHeight: 1.1, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontSize: '0.65rem' }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Invoice DataGrid */}
      <Card sx={{ borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, bgcolor: darkMode ? '#21262d' : '#f1f5f9', borderBottom: `1px solid ${borderColor}` }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f87171' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fbbf24' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34d399' }} />
          <Typography variant="caption" sx={{ color: textSecondary, ml: 1 }}>
            Invoice Entry — Feb 6, 2026 · 8 invoices received
          </Typography>
        </Box>

        <Box sx={{ height: 480, width: '100%' }}>
          <DataGrid
            rows={invoiceList}
            columns={columns}
            pageSizeOptions={[10]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            getRowHeight={() => 58}
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
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default InvoiceEntry;
