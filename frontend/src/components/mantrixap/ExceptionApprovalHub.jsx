import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack, Button,
  Breadcrumbs, Link, Paper, Snackbar, Alert, Collapse,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  SmartToy as SmartToyIcon,
  Gavel as GavelIcon,
  ThumbUp as ThumbUpIcon,
  Send as SendIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import {
  exceptions, decisionOptions, autopilotStats, autopilotApprovals,
  batchPostingQueue,
} from './apMockDataV2';
import { apTheme, MODULE_NAVY, NAVY_DARK, NAVY_BLUE } from './apTheme';

const TILE_COLOR = MODULE_NAVY;

// Map exception type strings to theme keys
const exceptionTypeKeyMap = {
  'Price — Contract': 'price-contract',
  'Price — PO Error': 'price-po',
  'Qty — Partial GR': 'qty-partial',
  'Qty — GR Pending': 'qty-gr-pending',
  'Master Data': 'master-data',
  'Duplicate': 'duplicate',
  'Policy Violation': 'policy',
};

const formatCurrency = (v) => {
  if (v == null) return '\u2014';
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
};

const formatCompact = (v) => {
  if (v == null) return '\u2014';
  if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
};

// ============================================================
// EXCEPTION DETAIL PANEL — inline expandable
// ============================================================
const ExceptionDetailPanel = ({ exception, darkMode, onDecision }) => {
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';
  const cardBg = darkMode ? '#161b22' : '#fff';

  if (!exception) return null;

  return (
    <Box sx={{ p: 2.5 }}>
      {/* Root cause */}
      <Paper
        elevation={0}
        sx={{
          p: 2, mb: 2, borderRadius: 3,
          bgcolor: darkMode ? alpha('#f59e0b', 0.06) : alpha('#f59e0b', 0.04),
          border: `1px solid ${darkMode ? alpha('#f59e0b', 0.15) : alpha('#f59e0b', 0.12)}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <WarningIcon sx={{ fontSize: 18, color: '#d97706', mt: 0.2 }} />
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
              Root Cause Analysis
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: textColor, lineHeight: 1.5 }}>
              {exception.rootCause}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Evidence table */}
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
        SAP Evidence
      </Typography>
      <TableContainer component={Paper} elevation={0} sx={{ mb: 2, borderRadius: 2, border: `1px solid ${borderColor}`, bgcolor: cardBg }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: darkMode ? '#21262d' : '#f0f4f8' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: textSecondary, borderBottom: `1px solid ${borderColor}` }}>Field</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: textSecondary, borderBottom: `1px solid ${borderColor}` }}>Value</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: textSecondary, borderBottom: `1px solid ${borderColor}` }}>SAP Ref</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exception.evidence.map((ev, idx) => (
              <TableRow key={idx} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell sx={{ fontSize: '0.75rem', color: textSecondary, borderBottom: `1px solid ${borderColor}`, py: 0.8 }}>
                  {ev.label}
                </TableCell>
                <TableCell sx={{
                  fontSize: '0.75rem', fontWeight: 600, borderBottom: `1px solid ${borderColor}`, py: 0.8,
                  color: ev.highlight === 'red' ? '#dc2626' : ev.highlight === 'amber' ? '#d97706' : ev.highlight === 'green' ? '#059669' : textColor,
                }}>
                  {ev.value}
                </TableCell>
                <TableCell sx={{ borderBottom: `1px solid ${borderColor}`, py: 0.8 }}>
                  {ev.sapRef ? (
                    <Chip
                      label={ev.sapRef}
                      size="small"
                      sx={{ ...apTheme.chips.sapCode, height: 20, fontSize: '0.6rem', letterSpacing: '0.3px' }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: '0.7rem', color: textSecondary }}>\u2014</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Precedent */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5, mb: 2, borderRadius: 2,
          bgcolor: darkMode ? alpha(NAVY_BLUE, 0.08) : alpha(NAVY_BLUE, 0.04),
          border: `1px solid ${darkMode ? alpha(NAVY_BLUE, 0.15) : alpha(NAVY_BLUE, 0.1)}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <SmartToyIcon sx={{ fontSize: 16, color: NAVY_BLUE }} />
          <Typography sx={{ fontSize: '0.75rem', color: textColor }}>
            {exception.precedent.count > 0 ? (
              <>
                <strong>Seen {exception.precedent.count} times before</strong>
                {exception.precedent.allApproved
                  ? ' \u2014 all approved'
                  : ' \u2014 mixed outcomes'}
                {exception.precedent.avgVariance && ` (avg variance: ${exception.precedent.avgVariance})`}
              </>
            ) : (
              <><strong>No precedent found</strong> \u2014 first occurrence of this pattern</>
            )}
          </Typography>
        </Stack>
      </Paper>

      {/* Decision buttons */}
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
        Decision
      </Typography>
      <Grid container spacing={1.5}>
        {decisionOptions.map((opt) => (
          <Grid item xs={6} sm={3} key={opt.key}>
            <Button
              fullWidth
              size="small"
              onClick={() => onDecision(exception.id, opt.key, opt.label)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.75rem',
                py: 1,
                color: opt.color,
                bgcolor: alpha(opt.color, 0.08),
                border: `1px solid ${alpha(opt.color, 0.2)}`,
                '&:hover': {
                  bgcolor: alpha(opt.color, 0.16),
                  border: `1px solid ${alpha(opt.color, 0.35)}`,
                },
              }}
            >
              {opt.label}
            </Button>
            <Typography sx={{ fontSize: '0.6rem', color: textSecondary, textAlign: 'center', mt: 0.5, lineHeight: 1.3 }}>
              {opt.sub}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};


// ============================================================
// MAIN COMPONENT
// ============================================================
const ExceptionApprovalHub = ({ onBack, darkMode = false, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('exceptions');
  const [selectedExceptionId, setSelectedExceptionId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedBatchRows, setSelectedBatchRows] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [batchPosted, setBatchPosted] = useState([]);

  // Theme colors
  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';

  // Exception counts
  const highCount = exceptions.filter((e) => e.severity === 'high').length;
  const medCount = exceptions.filter((e) => e.severity === 'medium').length;
  const lowCount = exceptions.filter((e) => e.severity === 'low').length;

  // Batch summary
  const batchTotal = batchPostingQueue.reduce((sum, r) => sum + r.amount, 0);
  const batchAvgConf = (batchPostingQueue.reduce((sum, r) => sum + r.confidence, 0) / batchPostingQueue.length).toFixed(1);
  const batchAnomalies = batchPostingQueue.filter((r) => r.anomaly).length;
  const activeBatchQueue = batchPostingQueue.filter((r) => !batchPosted.includes(r.id));

  // Tab definitions
  const tabs = [
    { key: 'exceptions', label: 'Exception Workbench', count: exceptions.length },
    { key: 'autopilot-approvals', label: 'Autopilot Approvals', count: autopilotApprovals.length },
    { key: 'batch-posting', label: 'Batch Posting', count: activeBatchQueue.length },
  ];

  // Decision handler
  const handleDecision = (exceptionId, decisionKey, decisionLabel) => {
    setSnackbar({
      open: true,
      message: `Exception #${exceptionId}: ${decisionLabel} \u2014 action recorded`,
      severity: decisionKey === 'reject' ? 'warning' : 'success',
    });
    setSelectedExceptionId(null);
  };

  // Batch posting handler
  const handleBatchPost = () => {
    setShowConfirmation(true);
  };

  const handleConfirmPost = () => {
    setBatchPosted((prev) => [...prev, ...selectedBatchRows]);
    setShowConfirmation(false);
    setSnackbar({
      open: true,
      message: `${selectedBatchRows.length} invoice(s) posted to SAP successfully`,
      severity: 'success',
    });
    setSelectedBatchRows([]);
  };

  const handleRemoveFromBatch = () => {
    setSnackbar({
      open: true,
      message: `${selectedBatchRows.length} invoice(s) removed from batch queue`,
      severity: 'info',
    });
    setSelectedBatchRows([]);
  };

  // ============================================================
  // TAB 1: Exception Workbench
  // ============================================================
  const renderExceptionWorkbench = () => {
    const summaryCards = [
      { label: 'Total Exceptions', value: exceptions.length, color: TILE_COLOR, icon: <GavelIcon sx={{ fontSize: 20 }} /> },
      { label: 'High Severity', value: highCount, color: '#dc2626', icon: <WarningIcon sx={{ fontSize: 20 }} /> },
      { label: 'Medium', value: medCount, color: '#d97706', icon: <WarningIcon sx={{ fontSize: 20 }} /> },
      { label: 'Low', value: lowCount, color: '#64748b', icon: <CheckCircleIcon sx={{ fontSize: 20 }} /> },
    ];

    const columns = [
      {
        field: 'exceptionType',
        headerName: 'Exception Type',
        width: 150,
        sortable: false,
        renderCell: (params) => {
          const typeKey = exceptionTypeKeyMap[params.value] || 'price-contract';
          const chipStyle = apTheme.chips.exceptionType[typeKey] || {};
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
        field: 'vendor',
        headerName: 'Vendor / Invoice',
        flex: 1.5,
        minWidth: 200,
        sortable: false,
        renderCell: (params) => (
          <Box sx={{ py: 0.5, overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: textColor, fontSize: '0.82rem', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {params.row.vendor}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
              <Typography
                variant="caption"
                sx={{ color: textSecondary, fontSize: '0.68rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {params.row.invoiceNum}
              </Typography>
              <Typography
                variant="caption"
                onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate('processing-center'); }}
                sx={{
                  fontSize: '0.6rem', color: NAVY_BLUE, fontWeight: 600, cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {params.row.dpDoc}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 700, color: textColor, fontSize: '0.85rem' }}>
            {formatCurrency(params.value)}
          </Typography>
        ),
      },
      {
        field: 'severity',
        headerName: 'Severity',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => {
          const chipStyle = apTheme.chips.exceptionSeverity[params.value] || {};
          return (
            <Chip
              label={params.value.toUpperCase()}
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
        field: 'sapCode',
        headerName: 'SAP Code',
        width: 90,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            sx={{
              ...apTheme.chips.sapCode,
              height: 22,
              fontSize: '0.62rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          />
        ),
      },
      {
        field: 'daysOpen',
        headerName: 'Days Open',
        width: 90,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: params.value >= 4 ? '#dc2626' : params.value >= 2 ? '#d97706' : textColor }}>
            {params.value}d
          </Typography>
        ),
      },
      {
        field: 'assignee',
        headerName: 'Assignee',
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.78rem', color: textSecondary }}>
            {params.value}
          </Typography>
        ),
      },
    ];

    return (
      <Box>
        {/* Summary cards */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {summaryCards.map((card, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${borderColor}`,
                  bgcolor: cardBg,
                }}
              >
                <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: '0.68rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                        {card.label}
                      </Typography>
                      <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: card.color, lineHeight: 1.2, mt: 0.3 }}>
                        {card.value}
                      </Typography>
                    </Box>
                    <Box sx={{ color: card.color, opacity: 0.3 }}>
                      {card.icon}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* DataGrid */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg, overflow: 'hidden' }}>
          <DataGrid
            rows={exceptions}
            columns={columns}
            autoHeight
            disableColumnMenu
            disableSelectionOnClick
            hideFooter
            rowHeight={56}
            onRowClick={(params) => {
              setSelectedExceptionId(
                selectedExceptionId === params.row.id ? null : params.row.id
              );
            }}
            getRowClassName={(params) =>
              selectedExceptionId === params.row.id ? 'selected-exception-row' : ''
            }
            sx={{
              ...apTheme.getDataGridSx({ darkMode, clickable: true }),
              '& .selected-exception-row': {
                bgcolor: darkMode ? alpha(NAVY_BLUE, 0.12) : alpha(NAVY_BLUE, 0.06),
              },
            }}
          />

          {/* Inline detail panel */}
          {selectedExceptionId && (
            <Collapse in={!!selectedExceptionId}>
              <Box sx={{ borderTop: `2px solid ${darkMode ? alpha(NAVY_BLUE, 0.3) : alpha(NAVY_BLUE, 0.2)}` }}>
                <ExceptionDetailPanel
                  exception={exceptions.find((e) => e.id === selectedExceptionId)}
                  darkMode={darkMode}
                  onDecision={handleDecision}
                />
              </Box>
            </Collapse>
          )}
        </Paper>
      </Box>
    );
  };


  // ============================================================
  // TAB 2: Autopilot Approvals
  // ============================================================
  const renderAutopilotApprovals = () => {
    const heroStats = [
      {
        label: 'Auto-Approved Today',
        value: autopilotStats.autoApprovedToday,
        color: '#059669',
        sub: `of ${autopilotStats.totalProcessedToday} total processed`,
      },
      {
        label: 'Avg Confidence',
        value: `${autopilotStats.avgConfidence}%`,
        color: NAVY_BLUE,
        sub: `Threshold: ${autopilotStats.thresholdCurrent}%`,
      },
      {
        label: 'Human Overrides',
        value: autopilotStats.humanOverridesToday,
        color: '#d97706',
        sub: 'Feedback recorded for learning',
      },
      {
        label: 'Savings Today',
        value: autopilotStats.savingsToday,
        color: TILE_COLOR,
        sub: `Avg processing: ${autopilotStats.avgProcessingTime}`,
      },
    ];

    const columns = [
      {
        field: 'vendor',
        headerName: 'Vendor / Invoice',
        flex: 1.5,
        minWidth: 200,
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
              {params.row.invoiceNum}
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
        sortable: false,
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
        sortable: false,
        renderCell: (params) => {
          const score = params.value;
          const color = apTheme.getConfidenceColor(score);
          return (
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color }}>
              {score}%
            </Typography>
          );
        },
      },
      {
        field: 'glCode',
        headerName: 'GL Code',
        width: 90,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: textSecondary }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'action',
        headerName: 'Action',
        width: 90,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => {
          const actionKey = params.value === 'MIRO' ? 'miro' : 'fb60';
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
        field: 'timestamp',
        headerName: 'Timestamp',
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.75rem', color: textSecondary }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => {
          const chipStyle = apTheme.chips.autopilot[params.value] || {};
          const label = params.value === 'auto-approved' ? 'AUTO-APPROVED' : 'HUMAN OVERRIDE';
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
    ];

    return (
      <Box>
        {/* Hero stats row */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {heroStats.map((stat, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${borderColor}`,
                  bgcolor: cardBg,
                }}
              >
                <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                  <Typography sx={{ fontSize: '0.68rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, mb: 0.3 }}>
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: stat.color, lineHeight: 1.2 }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: textSecondary, mt: 0.3 }}>
                    {stat.sub}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* DataGrid */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg, overflow: 'hidden' }}>
          <DataGrid
            rows={autopilotApprovals}
            columns={columns}
            autoHeight
            disableColumnMenu
            disableSelectionOnClick
            hideFooter
            rowHeight={56}
            getRowClassName={(params) =>
              params.row.status === 'human-override' ? 'human-override-row' : ''
            }
            sx={{
              ...apTheme.getDataGridSx({ darkMode, clickable: false }),
              '& .human-override-row': {
                bgcolor: darkMode ? alpha('#f59e0b', 0.04) : alpha('#f59e0b', 0.03),
              },
            }}
          />
        </Paper>

        {/* Override detail for human-override rows */}
        {autopilotApprovals.filter((a) => a.status === 'human-override').length > 0 && (
          <Paper
            elevation={0}
            sx={{
              mt: 2, p: 2, borderRadius: 3,
              bgcolor: darkMode ? alpha('#f59e0b', 0.06) : alpha('#f59e0b', 0.04),
              border: `1px solid ${darkMode ? alpha('#f59e0b', 0.15) : alpha('#f59e0b', 0.1)}`,
            }}
          >
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
              Human Overrides \u2014 Feedback Loop
            </Typography>
            {autopilotApprovals
              .filter((a) => a.status === 'human-override')
              .map((override) => (
                <Stack key={override.id} direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                  <SmartToyIcon sx={{ fontSize: 14, color: '#d97706' }} />
                  <Typography sx={{ fontSize: '0.75rem', color: textColor }}>
                    <strong>{override.vendor}</strong> ({override.invoiceNum}) \u2014 {override.overrideReason}
                  </Typography>
                  <Chip
                    label="FEEDBACK RECORDED"
                    size="small"
                    sx={{
                      height: 18, fontSize: '0.58rem', fontWeight: 600,
                      bgcolor: alpha('#d97706', 0.1), color: '#d97706',
                      letterSpacing: '0.5px',
                    }}
                  />
                </Stack>
              ))}
          </Paper>
        )}
      </Box>
    );
  };


  // ============================================================
  // TAB 3: Batch Posting
  // ============================================================
  const renderBatchPosting = () => {
    const summaryCards = [
      { label: 'Ready to Post', value: activeBatchQueue.length, color: '#059669' },
      { label: 'Total Value', value: formatCompact(batchTotal), color: TILE_COLOR },
      { label: 'Avg Confidence', value: `${batchAvgConf}%`, color: NAVY_BLUE },
      { label: 'Anomalies', value: batchAnomalies, color: batchAnomalies > 0 ? '#dc2626' : '#059669' },
    ];

    const columns = [
      {
        field: 'vendor',
        headerName: 'Vendor / Invoice',
        flex: 1.5,
        minWidth: 200,
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
              {params.row.invoiceNum}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'dpDoc',
        headerName: 'DP Doc',
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.75rem', color: NAVY_BLUE, fontWeight: 600 }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 700, color: textColor, fontSize: '0.85rem' }}>
            {formatCurrency(params.value)}
          </Typography>
        ),
      },
      {
        field: 'matchType',
        headerName: 'Match Type',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.72rem', color: textSecondary, fontWeight: 500 }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'confidence',
        headerName: 'Confidence',
        width: 110,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => {
          const score = params.value;
          const color = apTheme.getConfidenceColor(score);
          return (
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color }}>
              {score}%
            </Typography>
          );
        },
      },
      {
        field: 'action',
        headerName: 'Action',
        width: 90,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => {
          const actionKey = params.value === 'MIRO' ? 'miro' : 'fb60';
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
        field: 'anomaly',
        headerName: 'Flag',
        width: 70,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          params.value ? (
            <WarningIcon sx={{ fontSize: 16, color: '#dc2626' }} />
          ) : (
            <CheckCircleIcon sx={{ fontSize: 16, color: '#059669', opacity: 0.5 }} />
          )
        ),
      },
    ];

    return (
      <Box>
        {/* Summary cards */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {summaryCards.map((card, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${borderColor}`,
                  bgcolor: cardBg,
                }}
              >
                <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                  <Typography sx={{ fontSize: '0.68rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, mb: 0.3 }}>
                    {card.label}
                  </Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: card.color, lineHeight: 1.2 }}>
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* DataGrid with checkbox selection */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg, overflow: 'hidden' }}>
          <DataGrid
            rows={activeBatchQueue}
            columns={columns}
            autoHeight
            disableColumnMenu
            hideFooter
            rowHeight={56}
            checkboxSelection
            onSelectionModelChange={(ids) => setSelectedBatchRows(ids)}
            selectionModel={selectedBatchRows}
            getRowClassName={(params) =>
              params.row.anomaly ? 'anomaly-row' : ''
            }
            sx={{
              ...apTheme.getDataGridSx({ darkMode, clickable: true }),
              '& .anomaly-row': {
                bgcolor: darkMode ? alpha('#ef4444', 0.06) : alpha('#ef4444', 0.03),
              },
              '& .MuiCheckbox-root': {
                color: textSecondary,
              },
              '& .MuiCheckbox-root.Mui-checked': {
                color: TILE_COLOR,
              },
            }}
          />
        </Paper>

        {/* Bottom action bar */}
        <Paper
          elevation={0}
          sx={{
            mt: 2, p: 2, borderRadius: 3,
            bgcolor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: '0.78rem', color: textSecondary }}>
              {selectedBatchRows.length > 0
                ? `${selectedBatchRows.length} invoice(s) selected \u2014 ${formatCurrency(activeBatchQueue.filter((r) => selectedBatchRows.includes(r.id)).reduce((s, r) => s + r.amount, 0))}`
                : 'Select invoices to post or remove from batch'}
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button
                size="small"
                variant="outlined"
                disabled={selectedBatchRows.length === 0}
                onClick={handleRemoveFromBatch}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  color: '#dc2626',
                  borderColor: alpha('#dc2626', 0.3),
                  '&:hover': {
                    bgcolor: alpha('#dc2626', 0.06),
                    borderColor: alpha('#dc2626', 0.5),
                  },
                  '&.Mui-disabled': {
                    color: textSecondary,
                    borderColor: borderColor,
                    opacity: 0.5,
                  },
                }}
              >
                Remove from Batch
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={selectedBatchRows.length === 0}
                startIcon={<SendIcon sx={{ fontSize: 16 }} />}
                onClick={handleBatchPost}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  bgcolor: TILE_COLOR,
                  '&:hover': {
                    bgcolor: NAVY_DARK,
                  },
                  '&.Mui-disabled': {
                    bgcolor: alpha(TILE_COLOR, 0.3),
                    color: alpha('#fff', 0.5),
                  },
                }}
              >
                Post Selected ({selectedBatchRows.length})
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  };


  // ============================================================
  // MAIN RENDER
  // ============================================================
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
          Exception &amp; Approval Hub
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper
        elevation={0}
        sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <GavelIcon sx={{ fontSize: 22, color: TILE_COLOR }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: textColor, fontSize: '0.95rem' }}>
                Exception &amp; Approval Hub
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.78rem', color: textSecondary, mt: 0.5, ml: 4.5 }}>
              Exception workbench with SAP root-cause taxonomy, autopilot approval dashboard, and batch posting confirmation
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

      {/* Tab bar */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {tabs.map((t) => (
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
            {t.label} {t.count != null && <Chip label={t.count} size="small" sx={{ ml: 0.5, height: 18, fontSize: '0.6rem', bgcolor: activeTab === t.key ? alpha('#fff', 0.2) : alpha(TILE_COLOR, 0.1), color: activeTab === t.key ? '#fff' : TILE_COLOR }} />}
          </Button>
        ))}
      </Stack>

      {/* Active tab content */}
      {activeTab === 'exceptions' && renderExceptionWorkbench()}
      {activeTab === 'autopilot-approvals' && renderAutopilotApprovals()}
      {activeTab === 'batch-posting' && renderBatchPosting()}

      {/* Batch posting confirmation dialog */}
      <Dialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: cardBg,
            border: `1px solid ${borderColor}`,
          },
        }}
      >
        <DialogTitle sx={{ color: textColor, fontWeight: 700, fontSize: '1rem' }}>
          Confirm Batch Posting
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.85rem', color: textSecondary, mb: 2 }}>
            You are about to post <strong>{selectedBatchRows.length}</strong> invoice(s) to SAP totaling{' '}
            <strong>
              {formatCurrency(
                activeBatchQueue
                  .filter((r) => selectedBatchRows.includes(r.id))
                  .reduce((s, r) => s + r.amount, 0)
              )}
            </strong>.
          </Typography>

          {/* Summary of selected invoices */}
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${borderColor}`, bgcolor: cardBg }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: darkMode ? '#21262d' : '#f0f4f8' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: textSecondary, borderBottom: `1px solid ${borderColor}` }}>Vendor</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: textSecondary, borderBottom: `1px solid ${borderColor}` }}>Invoice</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem', color: textSecondary, borderBottom: `1px solid ${borderColor}` }}>Amount</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.7rem', color: textSecondary, borderBottom: `1px solid ${borderColor}` }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeBatchQueue
                  .filter((r) => selectedBatchRows.includes(r.id))
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ fontSize: '0.75rem', color: textColor, fontWeight: 600, borderBottom: `1px solid ${borderColor}`, py: 0.8 }}>
                        {row.vendor}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', color: textSecondary, borderBottom: `1px solid ${borderColor}`, py: 0.8 }}>
                        {row.invoiceNum}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.78rem', fontWeight: 700, color: textColor, borderBottom: `1px solid ${borderColor}`, py: 0.8 }}>
                        {formatCurrency(row.amount)}
                      </TableCell>
                      <TableCell align="center" sx={{ borderBottom: `1px solid ${borderColor}`, py: 0.8 }}>
                        <Chip
                          label={row.action}
                          size="small"
                          sx={{
                            ...(apTheme.chips.sapAction[row.action === 'MIRO' ? 'miro' : 'fb60'] || {}),
                            height: 20,
                            fontSize: '0.6rem',
                            letterSpacing: '0.3px',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Anomaly warning */}
          {activeBatchQueue.filter((r) => selectedBatchRows.includes(r.id) && r.anomaly).length > 0 && (
            <Paper
              elevation={0}
              sx={{
                mt: 2, p: 1.5, borderRadius: 2,
                bgcolor: darkMode ? alpha('#ef4444', 0.08) : alpha('#ef4444', 0.04),
                border: `1px solid ${alpha('#dc2626', 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <WarningIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
                  {activeBatchQueue.filter((r) => selectedBatchRows.includes(r.id) && r.anomaly).length} invoice(s) flagged with anomalies. Posting will proceed with audit notation.
                </Typography>
              </Stack>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            size="small"
            onClick={() => setShowConfirmation(false)}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, color: textSecondary }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<SendIcon sx={{ fontSize: 16 }} />}
            onClick={handleConfirmPost}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              bgcolor: '#059669',
              '&:hover': { bgcolor: '#047857' },
            }}
          >
            Confirm &amp; Post to SAP
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.8rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExceptionApprovalHub;
