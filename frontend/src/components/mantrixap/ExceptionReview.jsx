import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack, Button,
  Breadcrumbs, Link, Paper, Snackbar, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  TrackChanges as TrackChangesIcon,
  ThumbUp as ThumbUpIcon,
  HourglassBottom as HourglassBottomIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { exceptionEvidence, exceptionTaxonomy, exceptionKPIs, exceptionLineDetails } from './apMockData';
import { apTheme, MODULE_NAVY, NAVY_DARK, NAVY_BLUE } from './apTheme';

const TILE_COLOR = MODULE_NAVY; // navy #00357a

const badgeColors = {
  price:  { bgcolor: alpha('#fbbf24', 0.15), color: '#d97706' },
  qty:    { bgcolor: alpha('#3b82f6', 0.15), color: '#2563eb' },
  master: { bgcolor: alpha('#f87171', 0.15), color: '#dc2626' },
  dup:    { bgcolor: alpha(NAVY_DARK, 0.15), color: NAVY_DARK },
  policy: { bgcolor: alpha('#f87171', 0.20), color: '#dc2626' },
};

const decisionButtons = [
  { label: 'Approve & Post (MIRO)', sub: 'Override SAP tolerance — contract clause justifies variance', color: '#34d399' },
  { label: 'Route to Buyer for PO Correction', sub: 'Send to buyer to update PO price via ME22N', color: '#3b82f6' },
  { label: 'Park — Need More Info', sub: 'Park invoice with AI context attached', color: '#fbbf24' },
  { label: 'Reject & Return to Vendor', sub: 'Return with variance explanation', color: '#f87171' },
];

const ExceptionReview = ({ onBack, darkMode = false, onNavigate }) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';

  const taxonomyColumns = [
    {
      field: 'type',
      headerName: 'Root Cause',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => {
        const style = badgeColors[params.row.badge] || badgeColors.price;
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{ ...style, fontWeight: 700, fontSize: '0.65rem', height: 24, textTransform: 'uppercase', letterSpacing: 0.5 }}
          />
        );
      },
    },
    { field: 'detection', headerName: 'AI Detection', flex: 1.2, minWidth: 200 },
    { field: 'clerkSees', headerName: 'What Clerk Sees', flex: 1.2, minWidth: 200 },
    { field: 'resolution', headerName: 'Typical Resolution', flex: 1.2, minWidth: 200 },
  ];

  const taxonomyRows = exceptionTaxonomy.map((t, i) => ({ id: i + 1, ...t }));

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
          Exception Review
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
                label="TILE 3"
                size="small"
                sx={{ bgcolor: TILE_COLOR, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}
              />
              <Typography variant="caption" sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1 }}>
                Exception Review
              </Typography>
            </Stack>
            <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>
              Exception Review & Resolution
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              AI Diagnoses the Root Cause — You Decide the Resolution
            </Typography>
          </Box>
          <Button size="small" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: textSecondary }}>
            Back
          </Button>
        </Stack>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {exceptionKPIs.slice(0, 4).map((kpi, idx) => {
          const icons = [<AccessTimeIcon key="a" />, <TrackChangesIcon key="t" />, <ThumbUpIcon key="th" />, <HourglassBottomIcon key="h" />];
          const colors = ['#d97706', '#059669', TILE_COLOR, '#dc2626'];
          return (
            <Grid item xs={6} sm={3} key={idx}>
              <Card sx={{ borderRadius: 3, bgcolor: cardBg, border: `1px solid ${borderColor}`, height: '100%' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ color: colors[idx], mb: 0.5, opacity: 0.7 }}>
                    {React.cloneElement(icons[idx], { sx: { fontSize: 18 } })}
                  </Box>
                  <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.6rem', display: 'block' }}>
                    {kpi.name}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: colors[idx], lineHeight: 1.2, my: 0.5 }}>
                    {kpi.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.6rem', lineHeight: 1.4 }}>
                    {kpi.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Two-Panel Screen Mockup */}
      <Card
        sx={{ mb: 3, borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg, overflow: 'hidden' }}
      >
        {/* Mock browser bar */}
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
            Exception Review — INV-LM-8834 - Lockheed Martin - Price Variance
          </Typography>
        </Box>

        <Box sx={{ p: 2.5 }}>
          <Grid container spacing={2.5}>

            {/* LEFT PANEL */}
            <Grid item xs={12} md={7}>
              {/* Exception Banner */}
              <Card
                sx={{
                  mb: 2,
                  bgcolor: alpha(TILE_COLOR, 0.06),
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1" fontWeight={700} sx={{ color: textColor }}>
                        Lockheed Martin - INV-LM-8834
                      </Typography>
                      <Typography variant="caption" sx={{ color: textSecondary }}>
                        PO 4500087654 - Line 10 - Material 300045
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: TILE_COLOR }}>
                        $312,500
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 600 }}>
                        Stuck 4 days
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Root Cause */}
              <Card
                sx={{
                  mb: 2,
                  bgcolor: darkMode ? '#21262d' : '#fafafa',
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography
                    variant="caption"
                    sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontSize: '0.65rem' }}
                  >
                    AI Root Cause Analysis
                  </Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ color: textColor, mt: 1, mb: 0.5 }}>
                    Price Variance — Contract Escalation
                  </Typography>
                  <Typography variant="body2" sx={{ color: textColor, lineHeight: 1.8, fontSize: '0.82rem' }}>
                    Invoice price <strong style={{ color: TILE_COLOR }}>$312,500</strong> vs
                    PO price <strong style={{ color: TILE_COLOR }}>$306,250</strong> — a
                    2.04% variance. The underlying contract (condition ZPR0 in{' '}
                    <Chip label="KONV" size="small" sx={{ ...apTheme.chips.sapCode, height: 18, fontSize: '0.6rem' }} />
                    ) has a valid annual escalation clause allowing up to 3%.
                  </Typography>
                </CardContent>
              </Card>

              {/* Evidence Rows */}
              <Card
                sx={{ mb: 2, bgcolor: darkMode ? '#161b22' : '#fff', border: `1px solid ${borderColor}`, borderRadius: 2 }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography
                    variant="caption"
                    sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.65rem', mb: 1.5, display: 'block' }}
                  >
                    SAP Evidence — Fields AI Checked
                  </Typography>

                  {exceptionEvidence.map((ev, idx) => {
                    let valueColor = textColor;
                    if (ev.highlight === 'amber') valueColor = TILE_COLOR;
                    if (ev.highlight === 'green') valueColor = '#34d399';

                    return (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8,
                          borderBottom: idx < exceptionEvidence.length - 1 ? `1px solid ${alpha(borderColor, 0.5)}` : 'none',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.75rem' }}>
                          {ev.label}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          {ev.sapCode && (
                            <Chip label={ev.sapCode} size="small" sx={{ ...apTheme.chips.sapCode, height: 18, fontSize: '0.6rem' }} />
                          )}
                          <Typography variant="caption" sx={{ color: valueColor, fontWeight: 600, fontSize: '0.75rem' }}>
                            {ev.value}
                          </Typography>
                        </Stack>
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Line-Level Exception Table */}
              {exceptionLineDetails[3] && (() => {
                const lines = exceptionLineDetails[3];
                const exLines = lines.filter((l) => l.exceptionType);
                return (
                  <Card sx={{ mb: 2, bgcolor: darkMode ? '#161b22' : '#fff', border: `1px solid ${borderColor}`, borderRadius: 2 }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.65rem' }}>
                          Line-Level Exception Detail
                        </Typography>
                        <Chip
                          label={`${exLines.length} of ${lines.length} lines have exceptions`}
                          size="small"
                          sx={{ bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', fontWeight: 600, fontSize: '0.6rem', height: 20 }}
                        />
                      </Stack>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ '& th': { bgcolor: darkMode ? '#21262d' : '#f8fafc', color: darkMode ? '#e6edf3' : TILE_COLOR, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, py: 0.8, borderBottom: `1px solid ${borderColor}` } }}>
                              <TableCell sx={{ width: 40 }}>Line</TableCell>
                              <TableCell>Exception</TableCell>
                              <TableCell>Field</TableCell>
                              <TableCell align="right">Invoice</TableCell>
                              <TableCell align="right">PO</TableCell>
                              <TableCell align="center">Variance</TableCell>
                              <TableCell>AI Suggestion</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {lines.map((line) => {
                              const varianceNum = parseFloat(line.variance);
                              const varianceColor = !line.exceptionType ? '#059669' : Math.abs(varianceNum) > 2 ? '#dc2626' : Math.abs(varianceNum) >= 1 ? '#d97706' : '#059669';
                              return (
                                <TableRow key={line.lineNum} sx={{ '& td': { borderBottom: `1px solid ${alpha(borderColor, 0.5)}`, py: 0.8 } }}>
                                  <TableCell sx={{ color: textColor, fontSize: '0.72rem', fontWeight: 600 }}>{line.lineNum}</TableCell>
                                  <TableCell>
                                    {line.exceptionType ? (
                                      <Chip label={line.exceptionType} size="small" sx={{ bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', fontWeight: 600, fontSize: '0.58rem', height: 20 }} />
                                    ) : (
                                      <Chip label="OK" size="small" sx={{ bgcolor: alpha('#10b981', 0.12), color: '#059669', fontWeight: 600, fontSize: '0.58rem', height: 20 }} />
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ color: textSecondary, fontSize: '0.68rem' }}>{line.field || '—'}</TableCell>
                                  <TableCell align="right" sx={{ color: textColor, fontSize: '0.7rem', fontWeight: 600 }}>{line.invoiceVal}</TableCell>
                                  <TableCell align="right" sx={{ color: textSecondary, fontSize: '0.7rem' }}>{line.poVal}</TableCell>
                                  <TableCell align="center" sx={{ color: varianceColor, fontSize: '0.72rem', fontWeight: 700 }}>{line.variance}</TableCell>
                                  <TableCell sx={{ color: textSecondary, fontSize: '0.65rem', maxWidth: 200 }}>
                                    <Typography noWrap sx={{ fontSize: '0.65rem', color: textSecondary }}>{line.aiSuggestion}</Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Precedent */}
              <Card
                sx={{ mb: 1, bgcolor: alpha(NAVY_DARK, 0.06), border: `1px solid ${alpha(NAVY_DARK, 0.2)}`, borderRadius: 2 }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography
                    variant="caption"
                    sx={{ color: NAVY_DARK, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, fontSize: '0.65rem' }}
                  >
                    Historical Precedent
                  </Typography>
                  <Typography variant="body2" sx={{ color: textColor, lineHeight: 1.8, mt: 1, fontSize: '0.82rem' }}>
                    This exact pattern (Lockheed Martin + price variance within contract escalation)
                    has occurred <strong style={{ color: '#34d399' }}>18 times</strong> in the last
                    12 months. All 18 approved and posted. Zero reversals. Zero audit flags.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* RIGHT PANEL */}
            <Grid item xs={12} md={5}>
              <Card
                sx={{ bgcolor: darkMode ? '#0d1117' : '#fafbfd', border: `1px solid ${borderColor}`, borderRadius: 3, height: '100%' }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  {/* AI Recommendation */}
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 2 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: NAVY_DARK, boxShadow: `0 0 8px ${alpha(NAVY_DARK, 0.5)}` }} />
                    <Typography
                      variant="caption"
                      sx={{ color: NAVY_DARK, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontSize: '0.6rem' }}
                    >
                      AI Recommendation
                    </Typography>
                  </Stack>

                  <Card
                    sx={{ mb: 2.5, bgcolor: darkMode ? '#161b22' : '#fff', borderRadius: 2, border: '1px solid rgba(0,0,0,0.1)' }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="body2" sx={{ color: textColor, lineHeight: 1.9, fontSize: '0.82rem' }}>
                        <strong>Recommend: Post within tolerance.</strong>
                        <br /><br />
                        Variance is within contract escalation clause. 18/18 historical
                        precedent approved. Vendor reliability 97.1. No anomalies. GR complete.
                        <br /><br />
                        SAP static tolerance (<Chip label="OMR6" size="small" sx={{ ...apTheme.chips.sapCode, height: 16, fontSize: '0.55rem' }} />
                        : 1.0%) is exceeded. Posting requires your confirmation to override.
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Decision Buttons */}
                  <Typography
                    variant="caption"
                    sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontSize: '0.6rem', mb: 1.5, display: 'block' }}
                  >
                    Your Decision
                  </Typography>

                  <Stack spacing={0.8} sx={{ mb: 2 }}>
                    {decisionButtons.map((btn, idx) => (
                      <Button
                        key={idx}
                        fullWidth
                        variant="text"
                        onClick={() => {
                          const messages = [
                            'Invoice INV-LM-8834 posted to SAP (MIRO) with tolerance override. Audit trail logged.',
                            'Invoice INV-LM-8834 routed to Buyer J. Martinez for PO correction (ME22N).',
                            'Invoice INV-LM-8834 parked with AI context attached. Will monitor for updates.',
                            'Invoice INV-LM-8834 rejected and returned to Lockheed Martin with variance explanation.',
                          ];
                          const severities = ['success', 'info', 'warning', 'error'];
                          setSnackbar({ open: true, message: messages[idx], severity: severities[idx] });
                        }}
                        sx={{
                          justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none',
                          bgcolor: alpha(btn.color, 0.1), color: btn.color,
                          border: `1px solid ${alpha(btn.color, 0.25)}`,
                          borderRadius: 2, px: 2, py: 1.2, fontWeight: 600, fontSize: '0.8rem',
                          '&:hover': { bgcolor: alpha(btn.color, 0.18) },
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ color: btn.color, fontSize: '0.8rem' }}>
                            {btn.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 400, fontSize: '0.65rem', display: 'block', mt: 0.2 }}>
                            {btn.sub}
                          </Typography>
                        </Box>
                      </Button>
                    ))}
                  </Stack>

                  <Box sx={{ bgcolor: darkMode ? '#0d1117' : alpha('#000', 0.03), borderRadius: 2, p: 1.5 }}>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem', lineHeight: 1.7 }}>
                      <strong style={{ color: TILE_COLOR }}>Your decision is logged.</strong>{' '}
                      Overrides improve future AI recommendations.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Exception Taxonomy DataGrid */}
      <Card
        sx={{ borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg, overflow: 'hidden' }}
      >
        <Box sx={{ height: 420, width: '100%' }}>
          <DataGrid
            rows={taxonomyRows}
            columns={taxonomyColumns}
            pageSizeOptions={[10]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            rowHeight={52}
            sx={apTheme.getDataGridSx({ darkMode })}
          />
        </Box>
      </Card>

      {/* Decision Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', fontWeight: 600, fontSize: '0.8rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExceptionReview;
