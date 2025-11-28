import React, { useState, useEffect, useMemo } from 'react';
import AgentConfigForm from './AgentConfigForm';
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
  CircularProgress,
  Tooltip,
  Paper,
  Divider,
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
  Settings as SettingsIcon,
  Close as CloseIcon,
  LocalShipping as LocalShippingIcon,
  Build as BuildIcon,
  AccountBalance as AccountBalanceIcon,
  Analytics as AnalyticsIcon,
  Inventory as InventoryIcon,
  ShowChart as ShowChartIcon,
  Radar as RadarIcon,
} from '@mui/icons-material';

const AgentDashboard = ({ userId = 'demo_user', onCreateAgent }) => {
  const [agents, setAgents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [refineDialog, setRefineDialog] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState('');
  const [configDialog, setConfigDialog] = useState(false);

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
      // Only fetch demo data if user is not demo_user (to avoid duplicates)
      const shouldFetchDemo = userId !== 'demo_user';

      const fetchPromises = [
        fetch(`/api/v1/pulse/monitors?user_id=${userId}`),
        fetch(`/api/v1/pulse/alerts?user_id=${userId}&limit=50`),
        fetch(`/api/v1/pulse/stats?user_id=${userId}`),
      ];

      if (shouldFetchDemo) {
        fetchPromises.push(
          fetch(`/api/v1/pulse/monitors?user_id=demo_user`),
          fetch(`/api/v1/pulse/alerts?user_id=demo_user&limit=50`)
        );
      }

      const responses = await Promise.all(fetchPromises);
      const [agentsData, alertsData, statsData, demoAgentsData, demoAlertsData] = await Promise.all(
        responses.map(r => r.json())
      );

      // Merge user data with demo data (only if demo was fetched)
      const userAgents = agentsData.success && agentsData.monitors ? agentsData.monitors : [];
      const demoAgents = shouldFetchDemo && demoAgentsData?.success && demoAgentsData.monitors ? demoAgentsData.monitors : [];

      // Deduplicate by ID to ensure no duplicates
      const allAgents = [...userAgents, ...demoAgents];
      const uniqueAgents = Array.from(new Map(allAgents.map(agent => [agent.id, agent])).values());
      setAgents(uniqueAgents);

      const userAlerts = alertsData.success && alertsData.alerts ? alertsData.alerts : [];
      const demoAlerts = shouldFetchDemo && demoAlertsData?.success && demoAlertsData.alerts ? demoAlertsData.alerts : [];
      setAlerts([...userAlerts, ...demoAlerts]);

      if (statsData.success) setStats(statsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, agent) => {
    setAnchorEl(event.currentTarget);
    setSelectedAgent(agent);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't reset selectedAgent here - let it persist for dialog usage
  };

  const handleToggleAgent = async (agent) => {
    try {
      await fetch(`/api/v1/pulse/monitors/${agent.id}/toggle?enabled=${!agent.enabled}`, {
        method: 'PUT',
      });
      loadData();
    } catch (err) {
      console.error('Failed to toggle agent:', err);
    }
    handleMenuClose();
  };

  const handleTestAgent = async (agent) => {
    try {
      await fetch(`/api/v1/pulse/monitors/${agent.id}/test`, {
        method: 'POST',
      });
      loadData();
    } catch (err) {
      console.error('Failed to test agent:', err);
    }
    handleMenuClose();
  };

  const handleDeleteAgent = async (agent) => {
    try {
      await fetch(`/api/v1/pulse/monitors/${agent.id}`, {
        method: 'DELETE',
      });
      loadData();
    } catch (err) {
      console.error('Failed to delete agent:', err);
    }
    handleMenuClose();
  };

  const handleRefineAgent = async () => {
    if (!refineFeedback || !selectedAgent) return;

    try {
      await fetch(`/api/v1/pulse/monitors/${selectedAgent.id}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: refineFeedback }),
      });
      setRefineDialog(false);
      setRefineFeedback('');
      loadData();
    } catch (err) {
      console.error('Failed to refine agent:', err);
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

  const getHealthScore = (agent) => {
    const total = (agent.true_positives || 0) + (agent.false_positives || 0);
    if (total === 0) return null;
    return Math.round(((agent.true_positives || 0) / total) * 100);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  // Category display names and icons for grouping agents
  const categoryInfo = {
    stox: {
      name: 'Stox.AI',
      icon: InventoryIcon,
      color: '#8b5cf6',
      description: 'Inventory & Supply Chain'
    },
    margen: {
      name: 'Margen.AI',
      icon: ShowChartIcon,
      color: '#10b981',
      description: 'Margin Intelligence'
    },
    supply_chain_operations: {
      name: 'Supply Chain Operations',
      icon: LocalShippingIcon,
      color: '#1976d2'
    },
    asset_health_maintenance: {
      name: 'Asset Health & Maintenance',
      icon: BuildIcon,
      color: '#f57c00'
    },
    financial_operations: {
      name: 'Financial Operations',
      icon: AccountBalanceIcon,
      color: '#388e3c'
    },
    performance_analytics: {
      name: 'Performance Analytics',
      icon: AnalyticsIcon,
      color: '#7b1fa2'
    },
    coo: {
      name: 'Operations',
      icon: LocalShippingIcon,
      color: '#0ea5e9',
      description: 'Operations & Logistics'
    },
    cfo: {
      name: 'Finance',
      icon: AccountBalanceIcon,
      color: '#f59e0b',
      description: 'Financial Monitoring'
    },
    general: {
      name: 'General',
      icon: SettingsIcon,
      color: '#616161'
    }
  };

  // Filter, sort, and paginate agents
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = [...agents];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => {
        const categoryName = m.category ? categoryInfo[m.category]?.name?.toLowerCase() || m.category.toLowerCase() : '';
        return (
          m.name.toLowerCase().includes(query) ||
          (m.description && m.description.toLowerCase().includes(query)) ||
          (m.natural_language_query && m.natural_language_query.toLowerCase().includes(query)) ||
          categoryName.includes(query)
        );
      });
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
  }, [agents, searchQuery, statusFilter, severityFilter, showDemoOnly, sortBy, sortDirection]);

  // Group agents by category
  const groupedAgents = useMemo(() => {
    const groups = {};
    filteredAndSortedAgents.forEach(agent => {
      const category = agent.category || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(agent);
    });
    return groups;
  }, [filteredAndSortedAgents]);

  // Paginate
  const paginatedAgents = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredAndSortedAgents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedAgents, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedAgents.length / itemsPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const demoAlerts = alerts.filter(a => a.monitor_name && a.monitor_name.includes('[DEMO]'));
  const demoAgents = agents.filter(m => m.name && m.name.includes('[DEMO]'));
  const hasDemoData = demoAlerts.length > 0 || demoAgents.length > 0;

  return (
    <Box>
      {/* Header with Stats */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <RadarIcon sx={{ fontSize: 40, color: '#0a6ed1' }} />
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Enterprise Pulse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Proactive agents that monitor and protect business operations
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={onCreateAgent}
          sx={{ fontSize: '0.75rem' }}
        >
          New Agent
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={1.5} mb={2}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">
                Active Agents
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {stats?.monitors?.active_monitors || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">
                Active Alerts
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {stats?.alerts?.active_alerts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">
                Accuracy Rate
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {stats?.alerts?.true_positives && (stats.alerts.true_positives + stats.alerts.false_positives) > 0
                  ? Math.round((stats.alerts.true_positives / (stats.alerts.true_positives + stats.alerts.false_positives)) * 100)
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">
                Total Agents
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {stats?.monitors?.total_monitors || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Active Alerts
                </Typography>
              </Box>
              <Chip label={activeAlerts.length} size="small" color="error" />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: 250, overflow: 'auto' }}>
              {activeAlerts.map((alert) => {
                const isDemo = alert.monitor_name && alert.monitor_name.includes('[DEMO]');
                return (
                  <Paper
                    key={alert.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
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
                        <Box display="flex" alignItems="center" gap={0.5} mb={0.5} flexWrap="wrap">
                          {isDemo && (
                            <Chip
                              label="DEMO"
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                            />
                          )}
                          <Chip
                            label={alert.severity}
                            size="small"
                            variant="outlined"
                            color={getSeverityColor(alert.severity)}
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                          <Typography variant="body2" fontWeight={600}>
                            {alert.title}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                          {alert.monitor_name} • {new Date(alert.triggered_at).toLocaleString()}
                        </Typography>
                      </Box>
                    <Box display="flex" gap={0.5} alignItems="center">
                      <Tooltip title="True Positive">
                        <IconButton
                          size="small"
                          onClick={() => handleAlertFeedback(alert.id, 'true_positive')}
                          sx={{ p: 0.5 }}
                        >
                          <ThumbUpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="False Positive">
                        <IconButton
                          size="small"
                          onClick={() => handleAlertFeedback(alert.id, 'false_positive')}
                          sx={{ p: 0.5 }}
                        >
                          <ThumbDownIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        </IconButton>
                      </Tooltip>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        sx={{ fontSize: '0.7rem', py: 0.25, px: 1, minWidth: 0 }}
                      >
                        Ack
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

      {/* Agents List */}
      <Card variant="outlined">
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle2" fontWeight={600}>
                Your Agents
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({filteredAndSortedAgents.length})
              </Typography>
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
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={1.5} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search agents..."
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

          <Divider sx={{ mb: 1.5 }} />

          {filteredAndSortedAgents.length === 0 ? (
            <Box textAlign="center" py={3}>
              <Typography variant="caption" color="text.secondary" mb={1.5} sx={{ display: 'block' }}>
                {searchQuery || statusFilter !== 'all' || severityFilter !== 'all' || showDemoOnly
                  ? 'No agents match your filters. Try adjusting your search criteria.'
                  : 'No agents yet. Create your first agent to get started!'}
              </Typography>
              {!searchQuery && statusFilter === 'all' && severityFilter === 'all' && !showDemoOnly && (
                <Button variant="outlined" size="small" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={onCreateAgent}>
                  New Agent
                </Button>
              )}
            </Box>
          ) : (
            <>
              {/* Render agents grouped by category */}
              {Object.entries(groupedAgents).map(([category, categoryAgents]) => {
                const CategoryIcon = categoryInfo[category]?.icon || SettingsIcon;
                const categoryColor = categoryInfo[category]?.color || '#616161';

                return (
                  <Box key={category} mb={2}>
                    {/* Category Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mb: 1,
                        pb: 0.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <CategoryIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                      <Typography variant="caption" fontWeight={600} sx={{ flex: 1, color: 'text.secondary' }}>
                        {categoryInfo[category]?.name || category}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                        {categoryAgents.length}
                      </Typography>
                    </Box>

                  <Grid container spacing={1.5}>
                    {categoryAgents.map((agent) => {
                      const healthScore = getHealthScore(agent);
                      const isDemo = agent.name && agent.name.includes('[DEMO]');
                      const notificationConfig = agent.notification_config || {};
                      const hasNotifications = Object.values(notificationConfig).some(v => v);

                      return (
                        <Grid item xs={12} md={viewMode === 'grid' ? 6 : 12} key={agent.id}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              ...(isDemo && {
                                bgcolor: 'rgba(33, 150, 243, 0.03)',
                                borderColor: 'info.light',
                                borderWidth: 1.5
                              })
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={0.5}>
                              <Box flex={1}>
                                <Box display="flex" alignItems="center" gap={0.5} mb={0.5} flexWrap="wrap">
                                  {agent.scope === 'global' && (
                                    <Chip
                                      label="GLOBAL"
                                      size="small"
                                      variant="outlined"
                                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                                    />
                                  )}
                                  {isDemo && (
                                    <Chip
                                      label="DEMO"
                                      size="small"
                                      color="info"
                                      variant="outlined"
                                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                                    />
                                  )}
                                  <Typography variant="body2" fontWeight={600}>
                                    {agent.name}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label={agent.enabled ? 'Active' : 'Paused'}
                                    color={agent.enabled ? 'success' : 'default'}
                                    sx={{ height: 18, fontSize: '0.65rem' }}
                                  />
                                  {hasNotifications && (
                                    <Tooltip title={`Notifications: ${Object.keys(notificationConfig).filter(k => notificationConfig[k]).join(', ')}`}>
                                      <NotificationsIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    </Tooltip>
                                  )}
                                </Box>
                                <Typography variant="caption" color="text.secondary" mb={0.5} sx={{ display: 'block' }}>
                                  {agent.natural_language_query}
                                </Typography>
                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                  <Chip
                                    label={agent.frequency}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                  <Chip
                                    label={agent.severity}
                                    size="small"
                                    variant="outlined"
                                    color={getSeverityColor(agent.severity)}
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                  {healthScore !== null && (
                                    <Chip
                                      label={`${healthScore}%`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                  )}
                                </Box>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, agent)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </Box>

                            {agent.last_run && (
                              <Box mt={1} pt={1} borderTop={1} borderColor="divider">
                                <Typography variant="caption" color="text.disabled">
                                  Last run: {new Date(agent.last_run).toLocaleString()}
                                </Typography>
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
                );
              })}

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
        <MenuItem onClick={() => {
          handleMenuClose();
          setConfigDialog(true);
        }}>
          <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
          Configure
        </MenuItem>
        <MenuItem onClick={() => handleTestAgent(selectedAgent)}>
          <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
          Execute Now
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          setRefineDialog(true);
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Refine Agent
        </MenuItem>
        <MenuItem onClick={() => handleToggleAgent(selectedAgent)}>
          {selectedAgent?.enabled ? <PauseIcon fontSize="small" sx={{ mr: 1 }} /> : <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />}
          {selectedAgent?.enabled ? 'Pause' : 'Resume'}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteAgent(selectedAgent)} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Refine Dialog */}
      <Dialog open={refineDialog} onClose={() => setRefineDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Refine Agent</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Describe how you want to improve this agent. The AI will update the agent's query based on your feedback.
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
              onClick={handleRefineAgent}
              disabled={!refineFeedback}
            >
              Refine Agent
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Agent Configuration Dialog */}
      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <SettingsIcon />
              <Typography variant="h6">Configure Agent</Typography>
            </Box>
            <IconButton onClick={() => setConfigDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedAgent ? (
            <AgentConfigForm agent={selectedAgent} onClose={() => {
              setConfigDialog(false);
              fetchAgents();
            }} />
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading agent configuration...
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AgentDashboard;
