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
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Visibility as VisibilityIcon,
  AttachMoney as AttachMoneyIcon,
  SmartToy as SmartToyIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import stoxTheme from '../stox/stoxTheme';
import {
  generateSampleTickets,
  calculateTicketStats,
  getPriorityColor,
  getStatusColor,
  getCategoryColor,
  getSourceLabel,
  getSourceColor,
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_CATEGORIES,
  TICKET_SOURCES,
} from './commandTowerMockData';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  secondary: darkMode ? '#2d8ce6' : '#0854a0',
  success: darkMode ? '#36d068' : '#10b981',
  warning: darkMode ? '#f59e0b' : '#f59e0b',
  error: darkMode ? '#ff6b6b' : '#ef4444',
  info: darkMode ? '#4da6ff' : '#0ea5e9',
  text: darkMode ? '#e6edf3' : '#1e293b',
  grey: darkMode ? '#8b949e' : '#64748b',
});

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const CommandTowerView = ({ onBack, onCreateTicket, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    setTickets(generateSampleTickets(25));
  }, []);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.customer?.name?.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query) ||
        t.action_label.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(t => t.source === sourceFilter);
    }

    return filtered;
  }, [tickets, searchQuery, statusFilter, priorityFilter, categoryFilter, sourceFilter]);

  // Stats
  const stats = useMemo(() => calculateTicketStats(tickets), [tickets]);

  // Handle status change
  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;

      const now = new Date().toISOString();
      const newActivity = {
        action: 'status_changed',
        by: 'Current User',
        at: now,
        notes: `Status changed to ${newStatus.replace('_', ' ')}`,
      };

      return {
        ...t,
        status: newStatus,
        updated_at: now,
        completed_at: newStatus === TICKET_STATUS.COMPLETED ? now : null,
        activity: [newActivity, ...t.activity],
      };
    }));
  };

  // View ticket detail
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setDetailDialogOpen(true);
  };

  // DataGrid columns
  const columns = useMemo(() => [
    {
      field: 'id',
      headerName: 'Ticket ID',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getPriorityColor(params.value)}
          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'action_label',
      headerName: 'Action',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>{params.value?.name || '-'}</Typography>
      ),
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={getSourceLabel(params.value)}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.65rem',
            fontWeight: 600,
            bgcolor: alpha(getSourceColor(params.value), 0.15),
            color: getSourceColor(params.value),
            border: `1px solid ${alpha(getSourceColor(params.value), 0.3)}`,
          }}
        />
      ),
    },
    {
      field: 'revenue_impact',
      headerName: 'Impact',
      width: 110,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="success.main">
          ${(params.value || 0).toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'assigned_to',
      headerName: 'Assigned',
      width: 140,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: colors.primary }}>
            {params.value?.avatar || '?'}
          </Avatar>
          <Typography variant="caption">{params.value?.name?.split(' ')[0] || '-'}</Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value.replace('_', ' ')}
          size="small"
          color={getStatusColor(params.value)}
          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 130,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary">
          {formatDateTime(params.value)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={0.5}>
          <IconButton size="small" onClick={() => handleViewTicket(params.row)} title="View Details">
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {params.row.status === TICKET_STATUS.OPEN && (
            <IconButton
              size="small"
              color="info"
              onClick={() => handleStatusChange(params.row.id, TICKET_STATUS.IN_PROGRESS)}
              title="Start Working"
            >
              <PlayArrowIcon fontSize="small" />
            </IconButton>
          )}
          {params.row.status === TICKET_STATUS.IN_PROGRESS && (
            <IconButton
              size="small"
              color="success"
              onClick={() => handleStatusChange(params.row.id, TICKET_STATUS.COMPLETED)}
              title="Mark Complete"
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ], []);

  return (
    <Box>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={onBack} sx={{ bgcolor: alpha(colors.primary, 0.1) }}>
            <ArrowBackIcon />
          </IconButton>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(colors.primary, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FlagIcon sx={{ fontSize: 24, color: colors.primary }} />
          </Box>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
              Command Tower
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grey }}>
              Track all actions across agents and alerts
            </Typography>
          </Box>
          <IconButton onClick={() => setTickets(generateSampleTickets(25))}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">Open</Typography>
                <Typography variant="h4" fontWeight={700} color="error.main">{stats.open}</Typography>
              </Box>
              <AssignmentIcon sx={{ color: colors.error, fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">In Progress</Typography>
                <Typography variant="h4" fontWeight={700} color="info.main">{stats.inProgress}</Typography>
              </Box>
              <PlayArrowIcon sx={{ color: colors.info, fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">Completed Today</Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">{stats.completedToday}</Typography>
              </Box>
              <CheckCircleIcon sx={{ color: colors.success, fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">From AI Modules</Typography>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {(stats.bySource.stox_ai || 0) + (stats.bySource.ordly_ai || 0) + (stats.bySource.margen_ai || 0) + (stats.bySource.axis_ai || 0)}
                </Typography>
              </Box>
              <SmartToyIcon sx={{ color: colors.warning, fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">Revenue Impact</Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">${(stats.totalRevenue / 1000).toFixed(0)}K</Typography>
              </Box>
              <AttachMoneyIcon sx={{ color: colors.success, fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters and DataGrid */}
      <Card sx={{ border: 'none', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <CardContent>
          {/* Search and Filters */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value={TICKET_STATUS.OPEN}>Open</MenuItem>
                  <MenuItem value={TICKET_STATUS.IN_PROGRESS}>In Progress</MenuItem>
                  <MenuItem value={TICKET_STATUS.PENDING_REVIEW}>Pending Review</MenuItem>
                  <MenuItem value={TICKET_STATUS.COMPLETED}>Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select value={priorityFilter} label="Priority" onChange={(e) => setPriorityFilter(e.target.value)}>
                  <MenuItem value="all">All Priority</MenuItem>
                  <MenuItem value={TICKET_PRIORITY.CRITICAL}>Critical</MenuItem>
                  <MenuItem value={TICKET_PRIORITY.HIGH}>High</MenuItem>
                  <MenuItem value={TICKET_PRIORITY.MEDIUM}>Medium</MenuItem>
                  <MenuItem value={TICKET_PRIORITY.LOW}>Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value={TICKET_CATEGORIES.INVENTORY}>Inventory</MenuItem>
                  <MenuItem value={TICKET_CATEGORIES.ORDER}>Order</MenuItem>
                  <MenuItem value={TICKET_CATEGORIES.FINANCIAL}>Financial</MenuItem>
                  <MenuItem value={TICKET_CATEGORIES.FORECAST}>Forecast</MenuItem>
                  <MenuItem value={TICKET_CATEGORIES.SUPPLY_CHAIN}>Supply Chain</MenuItem>
                  <MenuItem value={TICKET_CATEGORIES.AI_QUERY}>AI Query</MenuItem>
                  <MenuItem value={TICKET_CATEGORIES.PRICING}>Pricing</MenuItem>
                  <MenuItem value={TICKET_CATEGORIES.CUSTOMER}>Customer</MenuItem>
                  <MenuItem value={TICKET_CATEGORIES.OPERATIONS}>Operations</MenuItem>
                  <MenuItem value={TICKET_CATEGORIES.QUOTE}>Quote</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Source</InputLabel>
                <Select value={sourceFilter} label="Source" onChange={(e) => setSourceFilter(e.target.value)}>
                  <MenuItem value="all">All Sources</MenuItem>
                  <MenuItem value={TICKET_SOURCES.STOX_AI}>STOX.AI</MenuItem>
                  <MenuItem value={TICKET_SOURCES.ORDLY_AI}>ORDLY.AI</MenuItem>
                  <MenuItem value={TICKET_SOURCES.MARGEN_AI}>MARGEN.AI</MenuItem>
                  <MenuItem value={TICKET_SOURCES.AXIS_AI}>AXIS.AI</MenuItem>
                  <MenuItem value={TICKET_SOURCES.PROCESS_AI}>PROCESS.AI</MenuItem>
                  <MenuItem value={TICKET_SOURCES.EMAIL_INTEL}>EMAIL INTEL</MenuItem>
                  <MenuItem value={TICKET_SOURCES.ALERT_ACTION}>ML Alert</MenuItem>
                  <MenuItem value={TICKET_SOURCES.AGENT_AUTOMATED}>Agent Automated</MenuItem>
                  <MenuItem value={TICKET_SOURCES.MANUAL_ENTRY}>Manual Entry</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* DataGrid */}
          <Paper sx={{ width: '100%' }}>
            <DataGrid
              rows={filteredTickets}
              columns={columns}
              density="compact"
              checkboxSelection
              disableRowSelectionOnClick
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
              initialState={{ pagination: { paginationModel: { pageSize: 12 } } }}
              pageSizeOptions={[12, 25, 50]}
              sx={stoxTheme.getDataGridSx({ clickable: true, darkMode })}
              onRowClick={(params) => handleViewTicket(params.row)}
              localeText={{
                noRowsLabel: 'No tickets matching current filters',
              }}
            />
          </Paper>
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedTicket && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6" fontWeight={700}>{selectedTicket.id}</Typography>
                  <Chip
                    label={selectedTicket.priority}
                    size="small"
                    color={getPriorityColor(selectedTicket.priority)}
                  />
                  <Chip
                    label={selectedTicket.status.replace('_', ' ')}
                    size="small"
                    color={getStatusColor(selectedTicket.status)}
                  />
                </Box>
                <Chip
                  label={getSourceLabel(selectedTicket.source)}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Action Details
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                    <Typography variant="body1" fontWeight={600}>{selectedTicket.action_label}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {selectedTicket.description}
                    </Typography>
                    <Chip
                      label={selectedTicket.category}
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: alpha(getCategoryColor(selectedTicket.category), 0.1),
                        color: getCategoryColor(selectedTicket.category),
                      }}
                    />
                  </Paper>

                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Business Context
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Customer</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedTicket.customer?.name}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Segment</Typography>
                      <Chip label={selectedTicket.customer?.segment} size="small" variant="outlined" sx={{ height: 20 }} />
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Quote ID</Typography>
                      <Typography variant="body2">{selectedTicket.quote_id || '-'}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Material</Typography>
                      <Typography variant="body2">{selectedTicket.material || '-'}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Revenue Impact</Typography>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        ${selectedTicket.revenue_impact?.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  {selectedTicket.ml_model && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        ML Context
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">ML Model</Typography>
                          <Typography variant="body2">{selectedTicket.ml_model}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">AI Confidence</Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinearProgress
                              variant="determinate"
                              value={(selectedTicket.ai_confidence || 0) * 100}
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="body2" fontWeight={600}>
                              {Math.round((selectedTicket.ai_confidence || 0) * 100)}%
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">Source Alert</Typography>
                          <Typography variant="body2" color="primary">{selectedTicket.source_alert_id}</Typography>
                        </Box>
                      </Box>
                    </>
                  )}
                </Grid>

                {/* Right Column - Activity */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Assignment
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar sx={{ bgcolor: colors.primary }}>
                      {selectedTicket.assigned_to?.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedTicket.assigned_to?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedTicket.assigned_to?.role}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Activity Timeline
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {(selectedTicket.activity || []).map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          gap: 1.5,
                          pb: 2,
                          position: 'relative',
                          '&::before': index < (selectedTicket.activity?.length || 0) - 1 ? {
                            content: '""',
                            position: 'absolute',
                            left: 10,
                            top: 24,
                            bottom: 0,
                            width: 2,
                            bgcolor: 'divider',
                          } : {},
                        }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: alpha(colors.primary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.primary }} />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                            {item.action.replace(/_/g, ' ')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.notes}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {item.by} - {formatDateTime(item.at)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              {selectedTicket.status === TICKET_STATUS.OPEN && (
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => {
                    handleStatusChange(selectedTicket.id, TICKET_STATUS.IN_PROGRESS);
                    setDetailDialogOpen(false);
                  }}
                >
                  Start Working
                </Button>
              )}
              {selectedTicket.status === TICKET_STATUS.IN_PROGRESS && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    handleStatusChange(selectedTicket.id, TICKET_STATUS.COMPLETED);
                    setDetailDialogOpen(false);
                  }}
                >
                  Mark Complete
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CommandTowerView;
