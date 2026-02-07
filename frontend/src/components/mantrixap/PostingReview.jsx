import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack,
  Button, Breadcrumbs, Link, Paper, Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Timer as TimerIcon,
  VerifiedUser as VerifiedUserIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import {
  batchSummary,
  postingQueue,
  confirmationDetails,
  postingKPIs,
  invoiceList,
  invoiceLineItems,
} from './apMockData';
import { apTheme, MODULE_NAVY, NAVY_DARK } from './apTheme';
import LineItemMatchEngine from './LineItemMatchEngine';

const TILE_COLOR = MODULE_NAVY;

// Find matching invoiceList entry by vendor name
const findInvoiceEntry = (row) => {
  if (!row) return null;
  return invoiceList.find((inv) =>
    inv.vendor === row.vendor ||
    row.vendor?.includes(inv.vendor) ||
    inv.vendor?.includes(row.vendor)
  ) || null;
};

const PostingReview = ({ onBack, darkMode = false, onNavigate, onNavigateWithInvoice }) => {
  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';

  const [selectedRows, setSelectedRows] = useState(
    postingQueue.map((item) => item.id)
  );
  const [confirmed, setConfirmed] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const rows = postingQueue.map((item) => ({ ...item, isAnomaly: item.confidence < 95.5 }));

  const columns = [
    {
      field: 'vendor',
      headerName: 'Vendor / Invoice',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ color: textColor, fontSize: '0.8rem' }}>
            {params.value}
          </Typography>
          <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.7rem' }}>
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
      renderCell: (params) => (
        <Typography fontWeight={700} sx={{ color: textColor, fontSize: '0.85rem' }}>
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
      field: 'confidence',
      headerName: 'AI Score',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const anomaly = params.row.isAnomaly;
        return (
          <Tooltip title={anomaly ? 'Below batch average — review recommended' : 'High confidence'} arrow>
            <Typography fontWeight={700} sx={{ color: anomaly ? '#d97706' : '#059669', fontSize: '0.9rem' }}>
              {params.value}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'reason',
      headerName: 'AI Reason',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: '#002352', fontSize: '0.7rem', lineHeight: 1.4 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'action',
      headerName: 'SAP Action',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isMiro = params.value === 'MIRO';
        const chipSx = isMiro ? apTheme.chips.sapAction.miro : apTheme.chips.sapAction.fb60;
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{ ...chipSx, height: 22, fontSize: '0.65rem', letterSpacing: 0.5 }}
          />
        );
      },
    },
  ];

  const summaryValueColor = (item) => {
    if (item.color === '#059669') return '#059669';
    if (item.color === '#1976d2') return TILE_COLOR;
    return textColor;
  };

  // ===== DRILLDOWN VIEW =====
  if (selectedItem) {
    const matchedInvoice = findInvoiceEntry(selectedItem);
    const invoiceId = matchedInvoice?.id;
    const confColor = selectedItem.confidence > 95 ? '#059669' : selectedItem.confidence > 80 ? '#d97706' : '#dc2626';
    const isInBatch = selectedRows.includes(selectedItem.id);

    return (
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" onClick={() => onNavigate && onNavigate('landing')} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>CORE.AI</Link>
          <Link underline="hover" color="inherit" onClick={onBack} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>AP.AI</Link>
          <Link underline="hover" color="inherit" onClick={() => setSelectedItem(null)} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>Posting Review</Link>
          <Typography color={textColor} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedItem.vendor}</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 2, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Chip label="TILE 4" size="small" sx={{ bgcolor: TILE_COLOR, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
                <Typography variant="caption" sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1 }}>Posting Detail</Typography>
              </Stack>
              <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>{selectedItem.vendor}</Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>{selectedItem.detail}</Typography>
            </Box>
            <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => setSelectedItem(null)} sx={{ color: textSecondary }}>
              Back to Batch
            </Button>
          </Stack>
        </Paper>

        {/* Two-panel layout */}
        <Grid container spacing={2}>
          {/* LEFT: Invoice + match details */}
          <Grid item xs={12} md={7}>
            <Card sx={{ mb: 2, borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5 }}>
                  Posting Details
                </Typography>
                {[
                  { label: 'Amount', value: selectedItem.amount },
                  { label: 'Match Type', value: selectedItem.matchType },
                  { label: 'SAP Action', value: selectedItem.action },
                  { label: 'AI Reason', value: selectedItem.reason },
                  { label: 'Batch Status', value: isInBatch ? 'In Batch — Selected for Posting' : 'Removed from Batch' },
                ].map((row, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.7, borderBottom: i < 4 ? `1px solid ${alpha(borderColor, 0.5)}` : 'none' }}>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.72rem' }}>{row.label}</Typography>
                    <Typography variant="caption" sx={{ color: textColor, fontWeight: 600, fontSize: '0.72rem', textAlign: 'right', maxWidth: '60%' }}>{row.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* AI Recommendation */}
            <Card sx={{ mb: 2, bgcolor: alpha(TILE_COLOR, 0.04), border: '1px solid rgba(0,0,0,0.1)', borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: TILE_COLOR, boxShadow: `0 0 8px ${alpha(TILE_COLOR, 0.5)}` }} />
                  <Typography variant="caption" sx={{ color: NAVY_DARK, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, fontSize: '0.6rem' }}>
                    AI Recommendation
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: textColor, lineHeight: 1.8, fontSize: '0.8rem' }}>
                  <strong>Recommend: Post this invoice.</strong> {selectedItem.reason}. Confidence {selectedItem.confidence}% — meets threshold for batch posting. No anomalies or guardrail violations detected.
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
                    <CircularProgress variant="determinate" value={selectedItem.confidence || 0} size={100} thickness={4} sx={{ color: confColor, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
                    <CircularProgress variant="determinate" value={100} size={100} thickness={4} sx={{ color: darkMode ? alpha('#fff', 0.06) : alpha('#000', 0.06), position: 'absolute', left: 0, top: 0, zIndex: 0 }} />
                    <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                      <Typography variant="h4" fontWeight={700} sx={{ color: confColor, lineHeight: 1.1 }}>{selectedItem.confidence}</Typography>
                      <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: 1 }}>Confidence</Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: textSecondary, display: 'block', fontSize: '0.72rem' }}>{selectedItem.reason}</Typography>
                </Paper>

                {/* SAP Action chip */}
                <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? '#0d1117' : alpha('#f0f4f8', 0.6), border: `1px solid ${borderColor}`, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: textSecondary }}>SAP Transaction</Typography>
                  <Chip label={selectedItem.action} size="small" sx={{ ...(selectedItem.action === 'MIRO' ? apTheme.chips.sapAction.miro : apTheme.chips.sapAction.fb60), height: 24, fontSize: '0.7rem' }} />
                </Paper>

                {/* Action Buttons */}
                <Typography variant="caption" sx={{ color: '#d97706', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, fontSize: '0.6rem', mb: 1, display: 'block' }}>
                  Your Decision
                </Typography>
                <Stack spacing={0.8}>
                  <Button fullWidth startIcon={<CheckCircleIcon />} sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: alpha('#34d399', 0.08), color: '#059669', border: `1px solid ${alpha('#34d399', 0.2)}`, borderRadius: 2, textTransform: 'none', px: 2, '&:hover': { bgcolor: alpha('#34d399', 0.16) } }}>
                    <Box><Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Confirm Post ({selectedItem.action})</Typography><Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem' }}>Post to SAP with AI audit trail</Typography></Box>
                  </Button>
                  <Button fullWidth startIcon={<RemoveCircleOutlineIcon />} onClick={() => { setSelectedRows((prev) => prev.filter((id) => id !== selectedItem.id)); setSelectedItem(null); }} sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: alpha('#f87171', 0.08), color: '#dc2626', border: `1px solid ${alpha('#f87171', 0.2)}`, borderRadius: 2, textTransform: 'none', px: 2, '&:hover': { bgcolor: alpha('#f87171', 0.16) } }}>
                    <Box><Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Remove from Batch</Typography><Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem' }}>Send back to queue for individual review</Typography></Box>
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
          Posting Review
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
                label="TILE 4"
                size="small"
                sx={{ bgcolor: TILE_COLOR, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}
              />
              <Typography variant="caption" sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1 }}>
                Posting Review
              </Typography>
            </Stack>
            <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>
              Posting Review &amp; Confirmation
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              AI Prepares the Posting — You Confirm with One Click
            </Typography>
          </Box>
          <Button size="small" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: textSecondary }}>
            Back
          </Button>
        </Stack>
      </Paper>

      {/* Batch Summary Strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {batchSummary.map((item, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card sx={{ borderRadius: 3, bgcolor: cardBg, border: `1px solid ${borderColor}`, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} sx={{ color: summaryValueColor(item), mb: 0.5 }}>
                  {item.value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.65rem' }}
                >
                  {item.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* KPI Cards */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {postingKPIs.map((kpi, idx) => {
          const icons = [<TimerIcon key="t" />, <VerifiedUserIcon key="v" />, <RemoveCircleOutlineIcon key="r" />];
          const colors = [TILE_COLOR, '#059669', '#d97706'];
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

      {/* Batch Review DataGrid */}
      <Card
        sx={{ mb: 3, borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg, overflow: 'hidden' }}
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
            Posting Review — 31 invoices AI-prepared &middot; Awaiting your confirmation
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <Box sx={{ height: 370 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              checkboxSelection
              rowSelectionModel={selectedRows}
              onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
              pageSizeOptions={[10]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
              rowHeight={60}
              onRowClick={(params) => setSelectedItem(params.row)}
              getRowClassName={(params) => params.row.isAnomaly ? 'posting-anomaly-row' : ''}
              sx={{
                ...apTheme.getDataGridSx({ darkMode }),
                '& .MuiDataGrid-row': {
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: darkMode ? alpha('#42a5f5', 0.08) : alpha(TILE_COLOR, 0.06),
                    transform: 'translateX(2px)',
                  },
                },
                '& .posting-anomaly-row': {
                  bgcolor: darkMode ? alpha('#fbbf24', 0.04) : alpha('#fbbf24', 0.06),
                },
                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
              }}
            />
          </Box>

          {/* Batch Action Buttons */}
          <Stack direction="row" spacing={1.5} sx={{ mt: 2.5, pt: 2.5, borderTop: `1px solid ${borderColor}` }}>
            <Button
              variant="contained"
              disableElevation
              startIcon={<CheckCircleIcon />}
              onClick={() => setConfirmed(true)}
              sx={{
                bgcolor: alpha('#10b981', 0.15), color: '#059669',
                border: `1px solid ${alpha('#10b981', 0.3)}`,
                fontWeight: 600, fontSize: '0.75rem', textTransform: 'none', px: 2.5,
                '&:hover': { bgcolor: alpha('#10b981', 0.25) },
              }}
            >
              Confirm Selected ({selectedRows.length}) — Post to SAP
            </Button>
            <Button
              variant="contained"
              disableElevation
              sx={{
                bgcolor: alpha('#f59e0b', 0.1), color: '#d97706',
                border: `1px solid ${alpha('#f59e0b', 0.2)}`,
                fontWeight: 600, fontSize: '0.75rem', textTransform: 'none', px: 2.5,
                '&:hover': { bgcolor: alpha('#f59e0b', 0.2) },
              }}
            >
              Review Individual
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={() => setSelectedRows([])}
              sx={{
                bgcolor: alpha('#64748b', 0.1), color: '#64748b',
                border: `1px solid ${alpha('#64748b', 0.2)}`,
                fontWeight: 600, fontSize: '0.75rem', textTransform: 'none', px: 2.5,
                '&:hover': { bgcolor: alpha('#64748b', 0.2) },
              }}
            >
              Deselect All
            </Button>
          </Stack>
        </Box>
      </Card>

      {/* Post-Confirmation Success Card */}
      {confirmed && (
        <Card
          sx={{ bgcolor: alpha('#10b981', 0.06), border: `1px solid ${alpha('#10b981', 0.25)}`, borderRadius: 3 }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <CheckCircleIcon sx={{ color: '#059669', fontSize: 20 }} />
              <Typography variant="body1" fontWeight={700} sx={{ color: '#059669' }}>
                31 Invoices Posted Successfully
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: textColor, lineHeight: 1.8, fontSize: '0.85rem' }}>
              All invoices posted to SAP with AI analysis as audit trail.
            </Typography>

            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha('#10b981', 0.15)}` }}>
              {confirmationDetails.map((row, i) => (
                <Stack key={i} direction="row" justifyContent="space-between" sx={{ py: 0.75 }}>
                  <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.75rem' }}>
                    {row.label}
                  </Typography>
                  <Typography variant="caption" fontWeight={600} sx={{ color: textColor, fontSize: '0.75rem' }}>
                    {row.value}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PostingReview;
