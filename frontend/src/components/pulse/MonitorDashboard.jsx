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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  Paper,
  Divider,
  LinearProgress,
  Pagination,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Sort as SortIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const MonitorDashboard = ({ userId = 'demo_user', onCreateMonitor }) => {
  const [monitors, setMonitors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMonitor, setSelectedMonitor] = useState(null);
  const [refineDialog, setRefineDialog] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState('');

  // Search, Filter, and Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showDemoOnly, setShowDemoOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [userId]);

  const loadData = async () => {
    try {
      // Fetch both user data AND demo data for all users
      const [monitorsRes, alertsRes, statsRes, demoMonitorsRes, demoAlertsRes] = await Promise.all([
        fetch(`/api/v1/pulse/monitors?user_id=${userId}`),
        fetch(`/api/v1/pulse/alerts?user_id=${userId}&limit=50`),
        fetch(`/api/v1/pulse/stats?user_id=${userId}`),
        fetch(`/api/v1/pulse/monitors?user_id=demo_user`),
        fetch(`/api/v1/pulse/alerts?user_id=demo_user&limit=50`),
      ]);

      const [monitorsData, alertsData, statsData, demoMonitorsData, demoAlertsData] = await Promise.all([
        monitorsRes.json(),
        alertsRes.json(),
        statsRes.json(),
        demoMonitorsRes.json(),
        demoAlertsRes.json(),
      ]);

      // Merge user data with demo data
      const userMonitors = monitorsData.success && monitorsData.monitors ? monitorsData.monitors : [];
      const demoMonitors = demoMonitorsData.success && demoMonitorsData.monitors ? demoMonitorsData.monitors : [];
      setMonitors([...userMonitors, ...demoMonitors]);

      const userAlerts = alertsData.success && alertsData.alerts ? alertsData.alerts : [];
      const demoAlerts = demoAlertsData.success && demoAlertsData.alerts ? demoAlertsData.alerts : [];
      setAlerts([...userAlerts, ...demoAlerts]);

      if (statsData.success) setStats(statsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, monitor) => {
    setAnchorEl(event.currentTarget);
    setSelectedMonitor(monitor);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMonitor(null);
  };

  const handleToggleMonitor = async (monitor) => {
    try {
      await fetch(`/api/v1/pulse/monitors/${monitor.id}/toggle?enabled=${!monitor.enabled}`, {
        method: 'PUT',
      });
      loadData();
    } catch (err) {
      console.error('Failed to toggle monitor:', err);
    }
    handleMenuClose();
  };

  const handleTestMonitor = async (monitor) => {
    try {
      await fetch(`/api/v1/pulse/monitors/${monitor.id}/test`, {
        method: 'POST',
      });
      loadData();
    } catch (err) {
      console.error('Failed to test monitor:', err);
    }
    handleMenuClose();
  };

  const handleDeleteMonitor = async (monitor) => {
    try {
      await fetch(`/api/v1/pulse/monitors/${monitor.id}`, {
        method: 'DELETE',
      });
      loadData();
    } catch (err) {
      console.error('Failed to delete monitor:', err);
    }
    handleMenuClose();
  };

  const handleRefineMonitor = async () => {
    if (!refineFeedback || !selectedMonitor) return;

    try {
      await fetch(`/api/v1/pulse/monitors/${selectedMonitor.id}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: refineFeedback }),
      });
      setRefineDialog(false);
      setRefineFeedback('');
      loadData();
    } catch (err) {
      console.error('Failed to refine monitor:', err);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await fetch(`/api/v1/pulse/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
      });
      loadData();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleAlertFeedback = async (alertId, feedback) => {
    try {
      await fetch(`/api/v1/pulse/alerts/${alertId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const getHealthScore = (monitor) => {
    const total = (monitor.true_positives || 0) + (monitor.false_positives || 0);
    if (total === 0) return null;
    return Math.round(((monitor.true_positives || 0) / total) * 100);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  // Filter, sort, and paginate monitors
  const filteredAndSortedMonitors = useMemo(() => {
    let filtered = [...monitors];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(query) ||
        (m.description && m.description.toLowerCase().includes(query)) ||
        (m.natural_language_query && m.natural_language_query.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m =>
        statusFilter === 'active' ? m.enabled : !m.enabled
      );
    }

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(m => m.severity === severityFilter);
    }

    // Apply demo filter
    if (showDemoOnly) {
      filtered = filtered.filter(m => m.name && m.name.includes('[DEMO]'));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
        case 'last_run':
          aVal = a.last_run ? new Date(a.last_run).getTime() : 0;
          bVal = b.last_run ? new Date(b.last_run).getTime() : 0;
          break;
        case 'created':
          aVal = a.created_at ? new Date(a.created_at).getTime() : 0;
          bVal = b.created_at ? new Date(b.created_at).getTime() : 0;
          break;
        case 'severity':
          const severityOrder = { high: 3, medium: 2, low: 1 };
          aVal = severityOrder[a.severity] || 0;
          bVal = severityOrder[b.severity] || 0;
          break;
        case 'accuracy':
          const aTotal = (a.true_positives || 0) + (a.false_positives || 0);
          const bTotal = (b.true_positives || 0) + (b.false_positives || 0);
          aVal = aTotal > 0 ? (a.true_positives || 0) / aTotal : 0;
          bVal = bTotal > 0 ? (b.true_positives || 0) / bTotal : 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [monitors, searchQuery, statusFilter, severityFilter, showDemoOnly, sortBy, sortDirection]);

  // Paginate
  const paginatedMonitors = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredAndSortedMonitors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedMonitors, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedMonitors.length / itemsPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const demoAlerts = alerts.filter(a => a.monitor_name && a.monitor_name.includes('[DEMO]'));
  const demoMonitors = monitors.filter(m => m.name && m.name.includes('[DEMO]'));
  const hasDemoData = demoAlerts.length > 0 || demoMonitors.length > 0;

  return (
    <Box>
      {/* Header with Stats */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha('#FF5722', 0.1),
            }}
          >
            <NotificationsIcon sx={{ fontSize: 36, color: '#FF5722' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Enterprise Pulse
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Proactive monitoring with AI-powered insights
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateMonitor}
        >
          Create Monitor
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Monitors
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats?.monitors?.active_monitors || 0}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'primary.light', p: 1.5, borderRadius: 2 }}>
                  <TrendingUpIcon sx={{ color: 'primary.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Alerts
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats?.alerts?.active_alerts || 0}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'error.light', p: 1.5, borderRadius: 2 }}>
                  <WarningIcon sx={{ color: 'error.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Accuracy Rate
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats?.alerts?.true_positives && (stats.alerts.true_positives + stats.alerts.false_positives) > 0
                      ? Math.round((stats.alerts.true_positives / (stats.alerts.true_positives + stats.alerts.false_positives)) * 100)
                      : 0}%
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'success.light', p: 1.5, borderRadius: 2 }}>
                  <CheckCircleIcon sx={{ color: 'success.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Monitors
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats?.monitors?.total_monitors || 0}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'info.light', p: 1.5, borderRadius: 2 }}>
                  <ScheduleIcon sx={{ color: 'info.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Active Alerts
              </Typography>
              <Badge badgeContent={activeAlerts.length} color="error">
                <WarningIcon />
              </Badge>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {activeAlerts.map((alert) => {
                const isDemo = alert.monitor_name && alert.monitor_name.includes('[DEMO]');
                return (
                  <Paper
                    key={alert.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 1,
                      ...(isDemo && {
                        bgcolor: 'rgba(33, 150, 243, 0.03)',
                        borderColor: 'info.light',
                        borderWidth: 1.5
                      })
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          {isDemo && (
                            <Chip
                              label="DEMO"
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                          <Chip
                            label={alert.severity}
                            size="small"
                            color={getSeverityColor(alert.severity)}
                          />
                          <Typography variant="subtitle2" fontWeight={600}>
                            {alert.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {alert.monitor_name} • {new Date(alert.triggered_at).toLocaleString()}
                        </Typography>
                      </Box>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="True Positive">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleAlertFeedback(alert.id, 'true_positive')}
                        >
                          <ThumbUpIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="False Positive">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleAlertFeedback(alert.id, 'false_positive')}
                        >
                          <ThumbDownIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Button
                        size="small"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    </Box>
                  </Box>
                </Paper>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Monitors List */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6" fontWeight={600}>
                Your Monitors
              </Typography>
              <Chip
                label={`${filteredAndSortedMonitors.length} total`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            <Box display="flex" gap={1}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid">
                  <Tooltip title="Grid View">
                    <ViewModuleIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="list">
                  <Tooltip title="List View">
                    <ViewListIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
              <IconButton onClick={loadData} size="small">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Search and Filters */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search monitors..."
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
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="paused">Paused</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={severityFilter}
                    label="Severity"
                    onChange={(e) => setSeverityFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="last_run">Last Run</MenuItem>
                    <MenuItem value="created">Created Date</MenuItem>
                    <MenuItem value="severity">Severity</MenuItem>
                    <MenuItem value="accuracy">Accuracy</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <Box display="flex" gap={1}>
                  <Tooltip title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}>
                    <IconButton
                      size="small"
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      sx={{ border: '1px solid', borderColor: 'divider' }}
                    >
                      <SortIcon fontSize="small" sx={{ transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Show Demo Only">
                    <IconButton
                      size="small"
                      color={showDemoOnly ? 'primary' : 'default'}
                      onClick={() => setShowDemoOnly(!showDemoOnly)}
                      sx={{ border: '1px solid', borderColor: showDemoOnly ? 'primary.main' : 'divider' }}
                    >
                      <FilterListIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {filteredAndSortedMonitors.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {searchQuery || statusFilter !== 'all' || severityFilter !== 'all' || showDemoOnly
                  ? 'No monitors match your filters. Try adjusting your search criteria.'
                  : 'No monitors yet. Create your first monitor to get started!'}
              </Typography>
              {!searchQuery && statusFilter === 'all' && severityFilter === 'all' && !showDemoOnly && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateMonitor}>
                  Create Monitor
                </Button>
              )}
            </Box>
          ) : (
            <>
              <Grid container spacing={viewMode === 'grid' ? 2 : 1}>
                {paginatedMonitors.map((monitor) => {
                const healthScore = getHealthScore(monitor);
                const isDemo = monitor.name && monitor.name.includes('[DEMO]');
                return (
                  <Grid item xs={12} md={viewMode === 'grid' ? 6 : 12} key={monitor.id}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: viewMode === 'grid' ? 2 : 1.5,
                        ...(isDemo && {
                          bgcolor: 'rgba(33, 150, 243, 0.03)',
                          borderColor: 'info.light',
                          borderWidth: 1.5
                        })
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                        <Box flex={1}>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            {isDemo && (
                              <Chip
                                label="DEMO"
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            )}
                            <Typography variant="subtitle1" fontWeight={600}>
                              {monitor.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={monitor.enabled ? 'Active' : 'Paused'}
                              color={monitor.enabled ? 'success' : 'default'}
                              icon={monitor.enabled ? <CheckCircleIcon /> : <PauseIcon />}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            {monitor.natural_language_query}
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Chip
                              label={monitor.frequency}
                              size="small"
                              variant="outlined"
                              icon={<ScheduleIcon />}
                            />
                            <Chip
                              label={monitor.severity}
                              size="small"
                              color={getSeverityColor(monitor.severity)}
                            />
                            {healthScore !== null && (
                              <Chip
                                label={`${healthScore}% accuracy`}
                                size="small"
                                color={healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'error'}
                              />
                            )}
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, monitor)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      {monitor.last_run && (
                        <Box mt={1} pt={1} borderTop={1} borderColor="divider">
                          <Typography variant="caption" color="text.disabled">
                            Last run: {new Date(monitor.last_run).toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleTestMonitor(selectedMonitor)}>
          <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
          Test Now
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          setRefineDialog(true);
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Refine Query
        </MenuItem>
        <MenuItem onClick={() => handleToggleMonitor(selectedMonitor)}>
          {selectedMonitor?.enabled ? <PauseIcon fontSize="small" sx={{ mr: 1 }} /> : <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />}
          {selectedMonitor?.enabled ? 'Pause' : 'Resume'}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteMonitor(selectedMonitor)} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Refine Dialog */}
      <Dialog open={refineDialog} onClose={() => setRefineDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Refine Monitor Query</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Describe how you want to improve this monitor. The AI agent will update the query based on your feedback.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Example: Add region breakdown, include only active customers, compare with same period last year"
            value={refineFeedback}
            onChange={(e) => setRefineFeedback(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setRefineDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleRefineMonitor}
              disabled={!refineFeedback}
            >
              Refine Query
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MonitorDashboard;
