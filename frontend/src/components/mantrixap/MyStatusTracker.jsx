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
  Inventory as InventoryIcon,
  Chat as ChatIcon,
  Assignment as AssignmentIcon,
  LockOpen as LockOpenIcon,
  Sync as SyncIcon,
  Article as ArticleIcon,
  CheckCircle as CheckCircleIcon,
  Pause as PauseIcon,
  Forward as ForwardIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';
import {
  dailySummary, statusInvoices,
  personalStats, personalKPIs,
  statusDetectionFeatures,
  invoiceList, invoiceLineItems,
} from './apMockData';
import { apTheme, MODULE_NAVY, NAVY_DARK } from './apTheme';
import LineItemMatchEngine from './LineItemMatchEngine';

const TILE_COLOR = '#00357a';

const tabs = [
  { key: 'all', label: 'All', count: 107 },
  { key: 'posted', label: 'Posted', count: 94 },
  { key: 'parked', label: 'Parked', count: 7 },
  { key: 'routed', label: 'Routed', count: 4 },
  { key: 'rejected', label: 'Rejected', count: 2 },
  { key: 'updates', label: 'Updates', count: 3 },
];

// Find matching invoiceList entry by vendor name
const findInvoiceEntry = (row) => {
  if (!row) return null;
  return invoiceList.find((inv) =>
    inv.vendor === row.vendor ||
    row.vendor?.includes(inv.vendor) ||
    inv.vendor?.includes(row.vendor)
  ) || null;
};

const MyStatusTracker = ({ onBack, darkMode = false, onNavigate, onNavigateWithInvoice }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

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

  // ===== DRILLDOWN VIEW =====
  if (selectedItem) {
    const matchedInvoice = findInvoiceEntry(selectedItem);
    const invoiceId = matchedInvoice?.id;
    const statusColors = { updated: '#1565c0', routed: '#1565c0', parked: '#d97706', posted: '#059669', rejected: '#dc2626' };
    const statusColor = statusColors[selectedItem.status] || textSecondary;

    return (
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" onClick={() => onNavigate && onNavigate('landing')} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>CORE.AI</Link>
          <Link underline="hover" color="inherit" onClick={onBack} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>AP.AI</Link>
          <Link underline="hover" color="inherit" onClick={() => setSelectedItem(null)} sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}>My Status</Link>
          <Typography color={textColor} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedItem.vendor}</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 2, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Chip label="TILE 5" size="small" sx={{ bgcolor: TILE_COLOR, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
                <Typography variant="caption" sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1 }}>Status Detail</Typography>
                {selectedItem.hasNotif && (
                  <Chip label="UPDATE" size="small" sx={{ bgcolor: alpha(TILE_COLOR, 0.12), color: TILE_COLOR, fontWeight: 700, fontSize: '0.6rem', height: 20, animation: 'pulse 2s infinite ease-in-out' }} />
                )}
              </Stack>
              <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>{selectedItem.vendor}</Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>{selectedItem.detail}</Typography>
            </Box>
            <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => setSelectedItem(null)} sx={{ color: textSecondary }}>
              Back to Tracker
            </Button>
          </Stack>
        </Paper>

        {/* Two-panel layout */}
        <Grid container spacing={2}>
          {/* LEFT: Status details + AI Update */}
          <Grid item xs={12} md={7}>
            {/* Status Summary */}
            <Card sx={{ mb: 2, borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5 }}>
                  Invoice Status
                </Typography>
                {[
                  { label: 'Amount', value: selectedItem.amount },
                  { label: 'Status', value: selectedItem.statusLabel, color: statusColor },
                  { label: 'Parked Reason', value: selectedItem.parkedReason },
                  { label: 'Days Open', value: `${selectedItem.days} day${selectedItem.days > 1 ? 's' : ''}`, color: selectedItem.days > 5 ? '#dc2626' : '#d97706' },
                ].map((row, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.7, borderBottom: i < 3 ? `1px solid ${alpha(borderColor, 0.5)}` : 'none' }}>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.72rem' }}>{row.label}</Typography>
                    <Typography variant="caption" sx={{ color: row.color || textColor, fontWeight: 600, fontSize: '0.72rem', textAlign: 'right', maxWidth: '60%' }}>{row.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* AI Update */}
            <Card sx={{ mb: 2, bgcolor: selectedItem.hasNotif ? alpha(TILE_COLOR, 0.04) : alpha('#64748b', 0.03), border: `1px solid ${selectedItem.hasNotif ? alpha(TILE_COLOR, 0.15) : 'rgba(0,0,0,0.1)'}`, borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: selectedItem.hasNotif ? TILE_COLOR : '#94a3b8', boxShadow: selectedItem.hasNotif ? `0 0 8px ${alpha(TILE_COLOR, 0.5)}` : 'none' }} />
                  <Typography variant="caption" sx={{ color: selectedItem.hasNotif ? NAVY_DARK : textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, fontSize: '0.6rem' }}>
                    AI Status Update
                  </Typography>
                  {selectedItem.hasNotif && (
                    <Chip label="NEW" size="small" sx={{ bgcolor: alpha(TILE_COLOR, 0.12), color: TILE_COLOR, fontWeight: 700, fontSize: '0.55rem', height: 16, ml: 1 }} />
                  )}
                </Stack>
                <Typography variant="body2" sx={{ color: textColor, lineHeight: 1.8, fontSize: '0.8rem' }}>
                  {selectedItem.aiUpdate}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT: Actions */}
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg }}>
              <CardContent sx={{ p: 2.5 }}>
                {/* Current Status Chip */}
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: darkMode ? '#0d1117' : '#f8fafc', border: `1px solid ${borderColor}`, mb: 2, textAlign: 'center' }}>
                  <Chip label={selectedItem.statusLabel} size="medium" sx={{ ...(apTheme.chips.invoiceStatus[selectedItem.status] || {}), fontSize: '0.8rem', height: 32, fontWeight: 700, letterSpacing: 0.5, mb: 1 }} />
                  <Typography variant="caption" sx={{ color: textSecondary, display: 'block', fontSize: '0.72rem', mt: 1 }}>
                    {selectedItem.parkedReason}
                  </Typography>
                  <Typography variant="caption" sx={{ color: selectedItem.days > 5 ? '#dc2626' : '#d97706', display: 'block', fontSize: '0.65rem', fontWeight: 600, mt: 0.5 }}>
                    Open {selectedItem.days} day{selectedItem.days > 1 ? 's' : ''}
                  </Typography>
                </Paper>

                {/* Decision Buttons */}
                <Typography variant="caption" sx={{ color: '#d97706', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, fontSize: '0.6rem', mb: 1, display: 'block' }}>
                  Your Decision
                </Typography>
                <Stack spacing={0.8}>
                  {selectedItem.hasNotif && (
                    <Button fullWidth startIcon={<ReplayIcon />} sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: alpha('#34d399', 0.08), color: '#059669', border: `1px solid ${alpha('#34d399', 0.2)}`, borderRadius: 2, textTransform: 'none', px: 2, '&:hover': { bgcolor: alpha('#34d399', 0.16) } }}>
                      <Box><Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Re-Process Invoice</Typography><Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem' }}>Status changed — re-run AI match</Typography></Box>
                    </Button>
                  )}
                  <Button fullWidth startIcon={<PauseIcon />} sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: alpha('#fbbf24', 0.08), color: '#d97706', border: `1px solid ${alpha('#fbbf24', 0.2)}`, borderRadius: 2, textTransform: 'none', px: 2, '&:hover': { bgcolor: alpha('#fbbf24', 0.16) } }}>
                    <Box><Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Keep Parked</Typography><Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem' }}>Continue waiting for resolution</Typography></Box>
                  </Button>
                  <Button fullWidth startIcon={<ForwardIcon />} sx={{ justifyContent: 'flex-start', textAlign: 'left', bgcolor: alpha('#3b82f6', 0.08), color: '#2563eb', border: `1px solid ${alpha('#3b82f6', 0.2)}`, borderRadius: 2, textTransform: 'none', px: 2, '&:hover': { bgcolor: alpha('#3b82f6', 0.16) } }}>
                    <Box><Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Escalate / Route</Typography><Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem' }}>Send to buyer or manager</Typography></Box>
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
          AP.AI
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
          getRowClassName={(params) => params.row.hasNotif ? 'status-actionable' : ''}
          onRowClick={(params) => {
            setSelectedItem(params.row);
          }}
          sx={{
            ...apTheme.getDataGridSx({ darkMode }),
            '& .MuiDataGrid-row.status-actionable': {
              cursor: 'pointer',
              '&:hover': {
                bgcolor: darkMode ? alpha('#42a5f5', 0.08) : alpha(TILE_COLOR, 0.06),
                transform: 'translateX(2px)',
              },
            },
            '& .MuiDataGrid-row': {
              transition: 'all 0.15s ease',
            },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
          }}
        />
      </Box>

      {/* AI Status Detection Section */}
      <Card sx={{ mb: 3, borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${borderColor}`, bgcolor: darkMode ? '#21262d' : alpha(TILE_COLOR, 0.03) }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: TILE_COLOR, boxShadow: `0 0 8px ${alpha(TILE_COLOR, 0.5)}` }} />
            <Typography variant="caption" sx={{ color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontSize: '0.65rem' }}>
              AI Status Detection — What Mantrix Monitors For You
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            {statusDetectionFeatures.map((feat, idx) => {
              const iconMap = {
                Inventory: <InventoryIcon />,
                Chat: <ChatIcon />,
                Assignment: <AssignmentIcon />,
                LockOpen: <LockOpenIcon />,
                Sync: <SyncIcon />,
                Article: <ArticleIcon />,
              };
              const featureColors = ['#059669', TILE_COLOR, '#d97706', '#dc2626', '#2563eb', '#059669'];
              return (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${borderColor}`,
                      bgcolor: darkMode ? alpha('#fff', 0.02) : '#fff',
                      height: '100%',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Box sx={{ color: featureColors[idx] }}>
                        {React.cloneElement(iconMap[feat.icon] || <AssignmentIcon />, { sx: { fontSize: 18 } })}
                      </Box>
                      <Typography variant="body2" fontWeight={700} sx={{ color: textColor, fontSize: '0.78rem' }}>
                        {feat.name}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.68rem', lineHeight: 1.6, display: 'block' }}>
                      {feat.desc}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Card>

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
