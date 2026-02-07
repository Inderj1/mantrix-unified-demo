import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack, Button,
  Breadcrumbs, Link, Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { exceptionEvidence, exceptionTaxonomy } from './apMockData';
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
          MANTRIX AP
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
                  border: `1px solid ${alpha(TILE_COLOR, 0.2)}`,
                  borderLeft: `4px solid ${TILE_COLOR}`,
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
                  borderLeft: `4px solid ${TILE_COLOR}`,
                  borderRadius: 2,
                  border: `1px solid ${borderColor}`,
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
                    sx={{ mb: 2.5, bgcolor: darkMode ? '#161b22' : '#fff', borderLeft: `3px solid ${NAVY_DARK}`, borderRadius: 2, border: `1px solid ${alpha(NAVY_DARK, 0.15)}` }}
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
    </Box>
  );
};

export default ExceptionReview;
