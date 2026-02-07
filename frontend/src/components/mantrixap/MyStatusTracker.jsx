import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack, Button,
  Breadcrumbs, Link, Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  FiberManualRecord as FiberManualRecordIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import {
  dailySummary, statusInvoices,
  personalStats, personalKPIs,
} from './apMockData';
import { apTheme } from './apTheme';

const TILE_COLOR = '#00357a';

const tabs = [
  { key: 'all', label: 'All', count: 107 },
  { key: 'posted', label: 'Posted', count: 94 },
  { key: 'parked', label: 'Parked', count: 7 },
  { key: 'routed', label: 'Routed', count: 4 },
  { key: 'rejected', label: 'Rejected', count: 2 },
  { key: 'updates', label: 'Updates', count: 3 },
];

const MyStatusTracker = ({ onBack, darkMode = false, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('all');

  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';

  const statusColumns = [
    {
      field: 'notification',
      headerName: '',
      width: 40,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        if (!params.row.hasNotif) return null;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <FiberManualRecordIcon
              sx={{
                fontSize: 10,
                color: TILE_COLOR,
                filter: `drop-shadow(0 0 4px ${alpha(TILE_COLOR, 0.6)})`,
                animation: 'pulse 2s infinite ease-in-out',
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'vendor',
      headerName: 'Vendor / Invoice',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ py: 0.5 }}>
          <Typography variant="body2" fontWeight={600} sx={{ color: textColor, fontSize: '0.8rem', lineHeight: 1.4 }}>
            {params.row.vendor}
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
      width: 110,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} sx={{ color: textColor, fontSize: '0.8rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const chipStyle = apTheme.chips.invoiceStatus[params.value] || {};
        return (
          <Chip
            label={params.row.statusLabel}
            size="small"
            sx={{ ...chipStyle, fontSize: '0.65rem', height: 22, letterSpacing: 0.3 }}
          />
        );
      },
    },
    {
      field: 'parkedReason',
      headerName: 'Parked Reason',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.75rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'days',
      headerName: 'Days',
      width: 60,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const d = params.value;
        const color = d > 5 ? '#dc2626' : d <= 5 ? '#d97706' : textColor;
        return (
          <Typography variant="body2" fontWeight={600} sx={{ color, fontSize: '0.8rem' }}>
            {d}
          </Typography>
        );
      },
    },
    {
      field: 'aiUpdate',
      headerName: 'AI Update',
      flex: 1.2,
      minWidth: 220,
      renderCell: (params) => {
        if (params.row.hasNotif) {
          return (
            <Typography variant="caption" sx={{ color: TILE_COLOR, fontSize: '0.72rem', lineHeight: 1.4 }}>
              {''}{params.value}
            </Typography>
          );
        }
        return (
          <Typography variant="caption" sx={{ color: darkMode ? '#6e7781' : '#94a3b8', fontSize: '0.72rem', lineHeight: 1.4 }}>
            {params.value}
          </Typography>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>
      {/* Pulse animation */}
      <Box
        component="style"
        dangerouslySetInnerHTML={{
          __html: `@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }`,
        }}
      />

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
          My Status Tracker
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
                label="TILE 5"
                size="small"
                sx={{ bgcolor: TILE_COLOR, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}
              />
              <Typography variant="caption" sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1 }}>
                My Status
              </Typography>
            </Stack>
            <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>
              My Status Tracker
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              Everything I touched, what happened to it, and what needs my attention
            </Typography>
          </Box>
          <Button size="small" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: textSecondary }}>
            Back
          </Button>
        </Stack>
      </Paper>

      {/* Daily Summary Strip */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {dailySummary.map((item, i) => (
          <Grid item xs={12} sm={6} md={2.4} key={i}>
            <Card
              sx={{
                borderRadius: 3, bgcolor: cardBg,
                border: `1px solid ${borderColor}`,
                borderTop: `3px solid ${item.color}`,
                textAlign: 'center', py: 2, px: 1.5,
              }}
            >
              <Typography variant="h4" fontWeight={800} sx={{ color: item.color, mb: 0.5, lineHeight: 1 }}>
                {item.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.65rem', display: 'block', mb: 0.5 }}
              >
                {item.label}
              </Typography>
              <Typography variant="caption" sx={{ color: darkMode ? '#6e7781' : '#94a3b8', fontSize: '0.6rem' }}>
                {item.sub}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tab Filter Bar */}
      <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isUpdates = tab.key === 'updates';
          return (
            <Chip
              key={tab.key}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {isUpdates && (
                    <FiberManualRecordIcon
                      sx={{ fontSize: 8, color: TILE_COLOR, filter: `drop-shadow(0 0 3px ${alpha(TILE_COLOR, 0.6)})` }}
                    />
                  )}
                  <span>{tab.label}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>({tab.count})</span>
                </Stack>
              }
              onClick={() => setActiveTab(tab.key)}
              sx={{
                bgcolor: isActive ? alpha('#00357a', 0.12) : alpha(textSecondary, 0.06),
                color: isActive ? '#00357a' : textSecondary,
                border: isActive ? `1px solid ${alpha('#00357a', 0.25)}` : '1px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer',
                '&:hover': { bgcolor: isActive ? alpha('#00357a', 0.16) : alpha(textSecondary, 0.1) },
              }}
            />
          );
        })}
      </Stack>

      {/* Status DataGrid */}
      <Box sx={{ mb: 3, height: 420 }}>
        <DataGrid
          rows={statusInvoices}
          columns={statusColumns}
          pageSizeOptions={[10]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          rowHeight={58}
          sx={apTheme.getDataGridSx({ darkMode })}
        />
      </Box>

      {/* Personal Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {personalStats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{ borderRadius: 3, bgcolor: cardBg, border: `1px solid ${borderColor}`, textAlign: 'center', py: 2 }}
            >
              <CardContent>
                <Typography variant="h4" fontWeight={800} sx={{ color: textColor, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.65rem', display: 'block', mb: 0.5 }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{ color: stat.trendType === 'up' ? '#059669' : textSecondary, fontSize: '0.65rem' }}
                >
                  {stat.trend}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Personal KPIs */}
      <Grid container spacing={2}>
        {personalKPIs.map((kpi, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{ borderRadius: 3, bgcolor: cardBg, border: `1px solid ${borderColor}`, height: '100%' }}
            >
              <CardContent>
                <Typography
                  variant="caption"
                  sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.6rem', display: 'block', mb: 0.5 }}
                >
                  {kpi.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: kpi.color, mb: 0.5 }}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary, lineHeight: 1.5, fontSize: '0.7rem' }}>
                  {kpi.sub}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyStatusTracker;
