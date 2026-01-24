import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  NotificationsActive as AlertsIcon,
  Lightbulb as OpportunityIcon,
} from '@mui/icons-material';
import KitAlertDetail from './KitAlertDetail';
import {
  generateKitAlerts,
  generateAlertDetail,
  calculateAlertStats,
  ALERT_TYPE_LABELS,
} from './kitAlertMockData';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  secondary: darkMode ? '#2d8ce6' : '#002352',
  success: darkMode ? '#36d068' : '#10b981',
  warning: darkMode ? '#f59e0b' : '#f59e0b',
  error: darkMode ? '#ff6b6b' : '#ef4444',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  grey: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

// Menu props for dark mode dropdowns
const getMenuProps = (darkMode, colors) => ({
  PaperProps: {
    sx: {
      bgcolor: darkMode ? colors.cardBg : undefined,
      border: darkMode ? `1px solid ${colors.border}` : undefined,
      '& .MuiMenuItem-root': {
        color: colors.text,
        '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : undefined },
        '&.Mui-selected': { bgcolor: darkMode ? 'rgba(77,166,255,0.15)' : undefined },
      },
    },
  },
});

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return 'error';
    case 'high': return 'warning';
    case 'warning': return 'info';
    case 'opportunity': return 'success';
    case 'info': return 'default';
    default: return 'default';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'error';
    case 'acknowledged': return 'warning';
    case 'in_progress': return 'info';
    case 'snoozed': return 'default';
    case 'resolved': return 'success';
    default: return 'default';
  }
};

const KitAlertsView = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [kitAlerts, setKitAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    setKitAlerts(generateKitAlerts(8));
  }, []);

  // Alert category mapping for filtering
  const alertCategories = {
    stox_inventory: ['stockout_risk', 'reorder_point_reached', 'excess_inventory', 'dc_rebalance_needed', 'seasonal_demand_shift'],
    pricing_intelligence: ['price_below_optimal', 'margin_erosion'],
    customer_intelligence: ['order_gap_detected', 'churn_risk_high', 'reorder_opportunity'],
    operations_intelligence: ['lead_time_risk', 'upsell_opportunity'],
  };

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    let filtered = [...kitAlerts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.message.toLowerCase().includes(query) ||
        (a.customer?.name || '').toLowerCase().includes(query) ||
        (a.quote_id || '').toLowerCase().includes(query) ||
        (a.material || '').toLowerCase().includes(query)
      );
    }
    if (severityFilter !== 'all') {
      filtered = filtered.filter(a => a.severity === severityFilter);
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => alertCategories[categoryFilter]?.includes(a.type));
    }

    return filtered;
  }, [kitAlerts, searchQuery, severityFilter, typeFilter, statusFilter, categoryFilter]);

  // Stats
  const stats = useMemo(() => calculateAlertStats(kitAlerts), [kitAlerts]);

  // Action handler
  const handleAlertAction = (action, data) => {
    setKitAlerts(prev => prev.map(alert => {
      if (alert.id !== data.alertId) return alert;

      const now = new Date().toISOString();
      const newHistoryItem = { action, by: 'Current User', at: now, notes: '' };

      switch (action) {
        case 'approve':
          newHistoryItem.notes = `Approved AI suggestion: ${data.aiSuggestion?.action}`;
          return { ...alert, status: 'resolved', action_history: [newHistoryItem, ...(alert.action_history || [])] };
        case 'escalate':
          newHistoryItem.notes = `Escalated to ${data.escalateTo}`;
          return { ...alert, severity: alert.severity === 'high' ? 'critical' : 'high', action_history: [newHistoryItem, ...(alert.action_history || [])] };
        case 'assign':
          newHistoryItem.notes = `Assigned to ${data.assignee}`;
          return { ...alert, status: 'in_progress', assigned_to: { name: data.assignee, role: 'Team Member' }, action_history: [newHistoryItem, ...(alert.action_history || [])] };
        case 'snooze':
          newHistoryItem.notes = `Snoozed for ${data.duration}`;
          return { ...alert, status: 'snoozed', action_history: [newHistoryItem, ...(alert.action_history || [])] };
        case 'note':
          newHistoryItem.action = 'note_added';
          newHistoryItem.notes = data.note;
          return { ...alert, action_history: [newHistoryItem, ...(alert.action_history || [])] };
        case 'resolve':
          newHistoryItem.notes = `Resolved as ${data.resolution}`;
          return { ...alert, status: 'resolved', action_history: [newHistoryItem, ...(alert.action_history || [])] };
        default:
          return alert;
      }
    }));

    if (selectedAlert?.id === data.alertId) {
      setSelectedAlert(null);
    }
  };

  // DataGrid columns
  const columns = useMemo(() => [
    {
      field: 'severity',
      headerName: 'Priority',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value === 'opportunity' ? 'Opportunity' : params.value}
          size="small"
          color={getSeverityColor(params.value)}
          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 160,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
          {ALERT_TYPE_LABELS[params.value] || params.value}
        </Typography>
      ),
    },
    {
      field: 'title',
      headerName: 'Insight',
      flex: 3,
      minWidth: 350,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.message}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      width: 160,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>{params.value?.name || '-'}</Typography>
          <Typography variant="caption" color="text.secondary">{params.value?.segment}</Typography>
        </Box>
      ),
    },
    {
      field: 'revenue_impact',
      headerName: 'Revenue Impact',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color={params.row.severity === 'opportunity' ? 'success.main' : 'error.main'}>
          ${(params.value || 0).toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'confidence_score',
      headerName: 'Confidence',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={`${Math.round((params.value || 0) * 100)}%`}
          size="small"
          color="info"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.65rem' }}
        />
      ),
    },
    {
      field: 'ml_model',
      headerName: 'ML Model',
      width: 130,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary">{params.value}</Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value.replace('_', ' ')}
          size="small"
          color={getStatusColor(params.value)}
          variant="outlined"
          sx={{ height: 20, fontSize: '0.65rem' }}
        />
      ),
    },
    {
      field: 'triggered_at',
      headerName: 'Triggered',
      width: 140,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(params.value).toLocaleString()}
        </Typography>
      ),
    },
  ], []);

  // If viewing detail
  if (selectedAlert) {
    return (
      <KitAlertDetail
        alert={generateAlertDetail(selectedAlert)}
        onBack={() => setSelectedAlert(null)}
        onAction={handleAlertAction}
        darkMode={darkMode}
      />
    );
  }

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100%' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)', bgcolor: colors.paper }}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            onClick={onBack}
            sx={{
              bgcolor: alpha(colors.primary, darkMode ? 0.2 : 0.1),
              color: colors.primary,
              '&:hover': { bgcolor: alpha(colors.primary, darkMode ? 0.3 : 0.2) }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(colors.primary, darkMode ? 0.2 : 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PsychologyIcon sx={{ fontSize: 24, color: colors.primary }} />
          </Box>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
              Proactive Alerts
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grey }}>
              AI-driven alerts from intelligent monitoring agents
            </Typography>
          </Box>
          <IconButton
            onClick={() => setKitAlerts(generateKitAlerts(8))}
            sx={{
              color: colors.text,
              '&:hover': { bgcolor: alpha(colors.primary, 0.1) }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={2} mb={3} sx={{ px: 2 }}>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: alpha(colors.error, 0.2), bgcolor: darkMode ? alpha(colors.error, 0.1) : alpha(colors.error, 0.03) }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Active Insights</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: colors.error }}>{stats.activeAlerts}</Typography>
              </Box>
              <WarningIcon sx={{ color: colors.error, fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: alpha(colors.success, 0.2), bgcolor: darkMode ? alpha(colors.success, 0.1) : alpha(colors.success, 0.03) }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Opportunities</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: colors.success }}>{stats.opportunities || 0}</Typography>
              </Box>
              <OpportunityIcon sx={{ color: colors.success, fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: alpha(colors.warning, 0.2), bgcolor: darkMode ? alpha(colors.warning, 0.1) : alpha(colors.warning, 0.03) }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Revenue at Risk</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: colors.warning }}>${((stats.revenueAtRisk || 0) / 1000).toFixed(0)}K</Typography>
              </Box>
              <AttachMoneyIcon sx={{ color: colors.warning, fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: alpha(colors.primary, 0.2), bgcolor: darkMode ? alpha(colors.primary, 0.1) : alpha(colors.primary, 0.03) }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Model Health</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: colors.primary }}>{stats.modelHealth || '98%'}</Typography>
              </Box>
              <TrendingUpIcon sx={{ color: colors.primary, fontSize: 32 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters and DataGrid */}
      <Card
        variant="outlined"
        sx={{
          mx: 2,
          bgcolor: colors.cardBg,
          borderColor: colors.border,
        }}
      >
        <CardContent>
          {/* Search and Filters */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: colors.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: darkMode ? colors.paper : undefined,
                    color: colors.text,
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primary },
                  },
                  '& .MuiInputBase-input': { color: colors.text },
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: colors.textSecondary }, '& .MuiOutlinedInput-root': { bgcolor: darkMode ? colors.paper : undefined, color: colors.text, '& fieldset': { borderColor: colors.border } }, '& .MuiSelect-icon': { color: colors.textSecondary } }}>
                <InputLabel>Priority</InputLabel>
                <Select value={severityFilter} label="Priority" onChange={(e) => setSeverityFilter(e.target.value)} MenuProps={getMenuProps(darkMode, colors)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="opportunity">Opportunity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: colors.textSecondary }, '& .MuiOutlinedInput-root': { bgcolor: darkMode ? colors.paper : undefined, color: colors.text, '& fieldset': { borderColor: colors.border } }, '& .MuiSelect-icon': { color: colors.textSecondary } }}>
                <InputLabel>Category</InputLabel>
                <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)} MenuProps={getMenuProps(darkMode, colors)}>
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="stox_inventory">STOX.AI Inventory</MenuItem>
                  <MenuItem value="pricing_intelligence">Pricing Intelligence</MenuItem>
                  <MenuItem value="customer_intelligence">Customer Intelligence</MenuItem>
                  <MenuItem value="operations_intelligence">Operations</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: colors.textSecondary }, '& .MuiOutlinedInput-root': { bgcolor: darkMode ? colors.paper : undefined, color: colors.text, '& fieldset': { borderColor: colors.border } }, '& .MuiSelect-icon': { color: colors.textSecondary } }}>
                <InputLabel>Type</InputLabel>
                <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)} MenuProps={getMenuProps(darkMode, colors)}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem disabled sx={{ opacity: 0.7, fontWeight: 600, fontSize: '0.7rem', bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'action.hover' }}>— STOX.AI Inventory —</MenuItem>
                  <MenuItem value="stockout_risk">Stockout Risk</MenuItem>
                  <MenuItem value="reorder_point_reached">Reorder Point Reached</MenuItem>
                  <MenuItem value="excess_inventory">Excess Inventory</MenuItem>
                  <MenuItem value="dc_rebalance_needed">DC Rebalance Needed</MenuItem>
                  <MenuItem value="seasonal_demand_shift">Seasonal Demand Shift</MenuItem>
                  <MenuItem disabled sx={{ opacity: 0.7, fontWeight: 600, fontSize: '0.7rem', bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'action.hover' }}>— Pricing Intelligence —</MenuItem>
                  <MenuItem value="price_below_optimal">Price Below Optimal</MenuItem>
                  <MenuItem value="margin_erosion">Margin Erosion</MenuItem>
                  <MenuItem disabled sx={{ opacity: 0.7, fontWeight: 600, fontSize: '0.7rem', bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'action.hover' }}>— Customer Intelligence —</MenuItem>
                  <MenuItem value="order_gap_detected">Order Gap Detected</MenuItem>
                  <MenuItem value="churn_risk_high">High Churn Risk</MenuItem>
                  <MenuItem value="reorder_opportunity">Reorder Opportunity</MenuItem>
                  <MenuItem disabled sx={{ opacity: 0.7, fontWeight: 600, fontSize: '0.7rem', bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'action.hover' }}>— Operations —</MenuItem>
                  <MenuItem value="lead_time_risk">Lead Time Risk</MenuItem>
                  <MenuItem value="upsell_opportunity">Upsell Opportunity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: colors.textSecondary }, '& .MuiOutlinedInput-root': { bgcolor: darkMode ? colors.paper : undefined, color: colors.text, '& fieldset': { borderColor: colors.border } }, '& .MuiSelect-icon': { color: colors.textSecondary } }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)} MenuProps={getMenuProps(darkMode, colors)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="acknowledged">Acknowledged</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="snoozed">Snoozed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* DataGrid */}
          <Paper sx={{ width: '100%', bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <DataGrid
              rows={filteredAlerts}
              columns={columns}
              density="standard"
              checkboxSelection
              disableRowSelectionOnClick
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
              initialState={{ pagination: { paginationModel: { pageSize: 12 } } }}
              pageSizeOptions={[12, 25, 50]}
              onRowClick={(params) => setSelectedAlert(params.row)}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: darkMode ? '#21262d' : '#f8fafc',
                  color: colors.text,
                  borderBottom: `1px solid ${colors.border}`,
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 600,
                  color: colors.text,
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${colors.border}`,
                  color: colors.text,
                },
                '& .MuiDataGrid-row': {
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  bgcolor: darkMode ? '#21262d' : '#f8fafc',
                  borderTop: `1px solid ${colors.border}`,
                  color: colors.text,
                },
                '& .MuiTablePagination-root': {
                  color: colors.text,
                },
                '& .MuiDataGrid-toolbarContainer': {
                  bgcolor: darkMode ? '#161b22' : undefined,
                  '& .MuiButton-root': { color: colors.text },
                  '& .MuiInputBase-root': { color: colors.text },
                },
                '& .MuiCheckbox-root': {
                  color: colors.textSecondary,
                },
                '& .MuiDataGrid-selectedRowCount': {
                  color: colors.textSecondary,
                },
              }}
              localeText={{
                noRowsLabel: 'No insights matching current filters',
              }}
            />
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default KitAlertsView;
