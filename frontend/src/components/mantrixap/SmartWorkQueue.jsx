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
import { queueStats, queueItems } from './apMockData';
import { apTheme } from './apTheme';

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

const SmartWorkQueue = ({ onBack, darkMode = false, onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState('all');

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
              sx={{
                ...apTheme.getDataGridSx({ darkMode }),
                '& .queue-row-ready': { borderLeft: '3px solid #34d399' },
                '& .queue-row-review': { borderLeft: '3px solid #fbbf24' },
                '& .queue-row-exception': { borderLeft: '3px solid #f87171' },
                '& .queue-row-parked': { borderLeft: '3px solid #64748b' },
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
    </Box>
  );
};

export default SmartWorkQueue;
