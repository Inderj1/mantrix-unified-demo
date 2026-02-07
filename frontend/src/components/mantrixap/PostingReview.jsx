import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack,
  Button, Breadcrumbs, Link, Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import {
  batchSummary,
  postingQueue,
  confirmationDetails,
} from './apMockData';
import { apTheme, MODULE_NAVY } from './apTheme';

const TILE_COLOR = MODULE_NAVY;

const PostingReview = ({ onBack, darkMode = false, onNavigate }) => {
  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';

  const [selectedRows, setSelectedRows] = useState(
    postingQueue.map((item) => item.id)
  );
  const [confirmed, setConfirmed] = useState(false);

  const rows = postingQueue.map((item) => ({ ...item }));

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
      renderCell: (params) => (
        <Typography fontWeight={700} sx={{ color: '#059669', fontSize: '0.9rem' }}>
          {params.value}
        </Typography>
      ),
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
              sx={apTheme.getDataGridSx({ darkMode })}
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
