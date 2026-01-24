import React, { useState, useEffect, useMemo } from 'react';
import AgentConfigForm from './AgentConfigForm';
import KitAlertDetail from './KitAlertDetail';
import {
  generateKitAlerts,
  generateAlertDetail,
  calculateAlertStats,
  ALERT_TYPE_LABELS,
  SEVERITY,
  STATUS,
} from './kitAlertMockData';
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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import stoxTheme from '../stox/stoxTheme';
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
  Settings as SettingsIcon,
  Close as CloseIcon,
  LocalShipping as LocalShippingIcon,
  Build as BuildIcon,
  AccountBalance as AccountBalanceIcon,
  Analytics as AnalyticsIcon,
  Inventory as InventoryIcon,
  ShowChart as ShowChartIcon,
  Radar as RadarIcon,
  Error as ErrorIcon,
  AttachMoney as AttachMoneyIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';

const AgentDashboard = ({ userId = 'demo_user', onCreateAgent, darkMode = false }) => {
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

  // Kit Alerts state
  const [kitAlerts, setKitAlerts] = useState([]);
  const [selectedKitAlert, setSelectedKitAlert] = useState(null);
  const [kitAlertSeverityFilter, setKitAlertSeverityFilter] = useState('all');
  const [kitAlertTypeFilter, setKitAlertTypeFilter] = useState('all');
  const [kitAlertStatusFilter, setKitAlertStatusFilter] = useState('all');
  const [kitAlertProcessFilter, setKitAlertProcessFilter] = useState('all');

  useEffect(() => {
    loadData();
    // Load kit alerts (mock data)
    setKitAlerts(generateKitAlerts(20));
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'warning';
      case 'warning': return 'info';
      case 'low': return 'info';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  // Kit Alert action handler
  const handleKitAlertAction = (action, data) => {
    console.log('Kit Alert Action:', action, data);
    // Update the alert in state based on action
    setKitAlerts(prev => prev.map(alert => {
      if (alert.id !== data.alertId) return alert;

      const now = new Date().toISOString();
      const newHistoryItem = {
        action,
        by: 'Current User',
        at: now,
        notes: '',
      };

      switch (action) {
        case 'approve':
          newHistoryItem.notes = `Approved AI suggestion: ${data.aiSuggestion?.action}`;
          return {
            ...alert,
            status: 'resolved',
            action_history: [newHistoryItem, ...(alert.action_history || [])],
          };
        case 'escalate':
          newHistoryItem.notes = `Escalated to ${data.escalateTo}`;
          return {
            ...alert,
            severity: alert.severity === 'high' ? 'critical' : 'high',
            action_history: [newHistoryItem, ...(alert.action_history || [])],
          };
        case 'assign':
          newHistoryItem.notes = `Assigned to ${data.assignee}`;
          return {
            ...alert,
            status: 'in_progress',
            assigned_to: { name: data.assignee, role: 'Team Member' },
            action_history: [newHistoryItem, ...(alert.action_history || [])],
          };
        case 'snooze':
          newHistoryItem.notes = `Snoozed for ${data.duration}`;
          return {
            ...alert,
            status: 'snoozed',
            action_history: [newHistoryItem, ...(alert.action_history || [])],
          };
        case 'note':
          newHistoryItem.action = 'note_added';
          newHistoryItem.notes = data.note;
          return {
            ...alert,
            action_history: [newHistoryItem, ...(alert.action_history || [])],
          };
        case 'resolve':
          newHistoryItem.notes = `Resolved as ${data.resolution}`;
          return {
            ...alert,
            status: 'resolved',
            action_history: [newHistoryItem, ...(alert.action_history || [])],
          };
        default:
          return alert;
      }
    }));

    // If we're viewing the detail, update selectedKitAlert too
    if (selectedKitAlert?.id === data.alertId) {
      setSelectedKitAlert(null); // Go back to list after action
    }
  };

  // Filtered kit alerts
  const filteredKitAlerts = useMemo(() => {
    let filtered = [...kitAlerts];

    if (kitAlertSeverityFilter !== 'all') {
      filtered = filtered.filter(a => a.severity === kitAlertSeverityFilter);
    }
    if (kitAlertTypeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === kitAlertTypeFilter);
    }
    if (kitAlertStatusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === kitAlertStatusFilter);
    }
    if (kitAlertProcessFilter !== 'all') {
      filtered = filtered.filter(a => a.process_type === kitAlertProcessFilter);
    }

    return filtered;
  }, [kitAlerts, kitAlertSeverityFilter, kitAlertTypeFilter, kitAlertStatusFilter, kitAlertProcessFilter]);

  // Kit alert stats
  const kitAlertStats = useMemo(() => calculateAlertStats(kitAlerts), [kitAlerts]);

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
      description: 'Financial Agents'
    },
    general: {
      name: 'General',
      icon: SettingsIcon,
      color: '#616161'
    }
  };

  // Filter agents (sorting handled by DataGrid)
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

    return filtered;
  }, [agents, searchQuery, statusFilter, severityFilter, showDemoOnly]);

  // DataGrid columns configuration
  const columns = useMemo(() => [
    {
      field: 'name',
      headerName: 'Agent Name',
      flex: 2,
      minWidth: 280,
      renderCell: (params) => {
        const isDemo = params.row.name?.includes('[DEMO]');
        const isGlobal = params.row.scope === 'global';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isGlobal && <Chip label="GLOBAL" size="small" color="default" sx={{ height: 18, fontSize: '0.65rem' }} />}
            {isDemo && <Chip label="DEMO" size="small" color="info" sx={{ height: 18, fontSize: '0.65rem' }} />}
            <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'natural_language_query',
      headerName: 'Query',
      flex: 3,
      minWidth: 350,
      renderCell: (params) => (
        <Tooltip title={params.value || ''}>
          <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 160,
      renderCell: (params) => {
        const CategoryIcon = categoryInfo[params.value]?.icon || SettingsIcon;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CategoryIcon sx={{ fontSize: 16, color: '#00357a' }} />
            <Typography variant="body2">{categoryInfo[params.value]?.name || params.value || 'General'}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'enabled',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Paused'}
          size="small"
          color={params.value ? 'success' : 'default'}
          sx={{ height: 22, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getSeverityColor(params.value)}
          sx={{ height: 22, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'frequency',
      headerName: 'Frequency',
      width: 100,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
      ),
    },
    {
      field: 'accuracy',
      headerName: 'Accuracy',
      width: 90,
      valueGetter: (params) => {
        const row = params.row;
        const total = (row?.true_positives || 0) + (row?.false_positives || 0);
        return total > 0 ? Math.round((row?.true_positives || 0) / total * 100) : null;
      },
      renderCell: (params) => params.value !== null ? (
        <Chip label={`${params.value}%`} size="small" color="info" sx={{ height: 22, fontSize: '0.7rem' }} />
      ) : <Typography variant="body2" color="text.disabled">—</Typography>,
    },
    {
      field: 'last_run',
      headerName: 'Last Run',
      width: 150,
      renderCell: (params) => params.value ? (
        <Typography variant="caption" color="text.secondary">
          {new Date(params.value).toLocaleString()}
        </Typography>
      ) : <Typography variant="body2" color="text.disabled">—</Typography>,
    },
    {
      field: 'actions',
      headerName: '',
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleMenuOpen(e, params.row);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ], []);

  // Blue/grey color palette
  const colors = {
    primary: '#00357a',
    secondary: '#002352',
    dark: '#354a5f',
    slate: '#475569',
    grey: '#64748b',
    light: '#94a3b8',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    text: '#1e293b',
  };

  // Calculate stats from agents data if API stats are empty
  const computedStats = useMemo(() => {
    const activeAgents = agents.filter(a => a.enabled).length;
    const totalAgents = agents.length;
    const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
    const truePositives = agents.reduce((sum, a) => sum + (a.true_positives || 0), 0);
    const falsePositives = agents.reduce((sum, a) => sum + (a.false_positives || 0), 0);
    const total = truePositives + falsePositives;
    const accuracyRate = total > 0 ? Math.round((truePositives / total) * 100) : 95; // Default to 95% if no data

    return {
      activeAgents: stats?.monitors?.active_monitors || activeAgents || 8,
      totalAgents: stats?.monitors?.total_monitors || totalAgents || 12,
      activeAlerts: stats?.alerts?.active_alerts || activeAlertsCount || 3,
      accuracyRate: stats?.alerts?.true_positives
        ? Math.round((stats.alerts.true_positives / (stats.alerts.true_positives + stats.alerts.false_positives)) * 100)
        : accuracyRate,
    };
  }, [agents, alerts, stats]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress sx={{ color: colors.primary }} />
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 14px ${alpha(colors.primary, 0.3)}`,
            }}
          >
            <RadarIcon sx={{ fontSize: 28, color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>
              Enterprise Pulse
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grey }}>
              Proactive agents that monitor and protect business operations
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={onCreateAgent}
          sx={{
            fontSize: '0.75rem',
            bgcolor: colors.primary,
            '&:hover': { bgcolor: colors.secondary },
          }}
        >
          New Agent
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: darkMode ? alpha(colors.primary, 0.2) : alpha(colors.primary, 0.1),
              bgcolor: darkMode ? '#161b22' : undefined,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${colors.primary} 0%, ${alpha(colors.primary, 0.5)} 100%)`,
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: colors.grey, fontWeight: 500 }}>
                  Active Agents
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
                  {computedStats.activeAgents}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  bgcolor: alpha(colors.primary, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.primary,
                }}
              >
                <CheckCircleIcon />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: darkMode ? alpha(colors.warning, 0.2) : alpha(colors.primary, 0.1),
              bgcolor: darkMode ? '#161b22' : undefined,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${colors.warning} 0%, ${alpha(colors.warning, 0.5)} 100%)`,
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: colors.grey, fontWeight: 500 }}>
                  Active Alerts
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
                  {computedStats.activeAlerts}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  bgcolor: alpha(colors.warning, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.warning,
                }}
              >
                <WarningIcon />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: darkMode ? alpha(colors.success, 0.2) : alpha(colors.primary, 0.1),
              bgcolor: darkMode ? '#161b22' : undefined,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${colors.success} 0%, ${alpha(colors.success, 0.5)} 100%)`,
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: colors.grey, fontWeight: 500 }}>
                  Accuracy Rate
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
                  {computedStats.accuracyRate}%
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  bgcolor: alpha(colors.success, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.success,
                }}
              >
                <TrendingUpIcon />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: darkMode ? alpha(colors.secondary, 0.2) : alpha(colors.primary, 0.1),
              bgcolor: darkMode ? '#161b22' : undefined,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${colors.secondary} 0%, ${alpha(colors.secondary, 0.5)} 100%)`,
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: colors.grey, fontWeight: 500 }}>
                  Total Agents
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
                  {computedStats.totalAgents}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  bgcolor: alpha(colors.secondary, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.secondary,
                }}
              >
                <RadarIcon />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Kit Management Alerts - Show detail view or list */}
      {selectedKitAlert ? (
        <KitAlertDetail
          alert={generateAlertDetail(selectedKitAlert)}
          onBack={() => setSelectedKitAlert(null)}
          onAction={handleKitAlertAction}
        />
      ) : (
        <>
          {/* Kit Alerts KPI Cards */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(colors.error, 0.2),
                  bgcolor: darkMode ? '#161b22' : alpha(colors.error, 0.03),
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Active Alerts</Typography>
                    <Typography variant="h5" fontWeight={700} color="error.main">
                      {kitAlertStats.activeAlerts}
                    </Typography>
                  </Box>
                  <WarningIcon sx={{ color: colors.error, fontSize: 28 }} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(colors.error, 0.3),
                  bgcolor: darkMode ? '#161b22' : alpha(colors.error, 0.05),
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Critical</Typography>
                    <Typography variant="h5" fontWeight={700} color="error.dark">
                      {kitAlertStats.criticalAlerts}
                    </Typography>
                  </Box>
                  <ErrorIcon sx={{ color: colors.error, fontSize: 28 }} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(colors.warning, 0.2),
                  bgcolor: darkMode ? '#161b22' : alpha(colors.warning, 0.03),
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">At Risk Value</Typography>
                    <Typography variant="h5" fontWeight={700} color="warning.dark">
                      ${(kitAlertStats.atRiskValue / 1000).toFixed(0)}K
                    </Typography>
                  </Box>
                  <AttachMoneyIcon sx={{ color: colors.warning, fontSize: 28 }} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(colors.primary, 0.2),
                  bgcolor: darkMode ? '#161b22' : alpha(colors.primary, 0.03),
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Avg Response</Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {kitAlertStats.avgResponseTime}
                    </Typography>
                  </Box>
                  <AccessTimeIcon sx={{ color: colors.primary, fontSize: 28 }} />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Kit Alerts Section */}
          <Card variant="outlined" sx={{ mb: 2, bgcolor: darkMode ? '#161b22' : undefined }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocalShippingIcon sx={{ fontSize: 18, color: colors.primary }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Kit Management Alerts
                  </Typography>
                  <Chip label={filteredKitAlerts.length} size="small" color="error" />
                </Box>
                <IconButton onClick={() => setKitAlerts(generateKitAlerts(20))} size="small">
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Kit Alert Filters */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={kitAlertSeverityFilter}
                    label="Severity"
                    onChange={(e) => setKitAlertSeverityFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Alert Type</InputLabel>
                  <Select
                    value={kitAlertTypeFilter}
                    label="Alert Type"
                    onChange={(e) => setKitAlertTypeFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="shipment_delay">Shipment Delay</MenuItem>
                    <MenuItem value="dwell_time_exceeded">Dwell Time</MenuItem>
                    <MenuItem value="return_overdue">Return Overdue</MenuItem>
                    <MenuItem value="temperature_excursion">Temp Excursion</MenuItem>
                    <MenuItem value="geofence_violation">Geofence</MenuItem>
                    <MenuItem value="low_stock">Low Stock</MenuItem>
                    <MenuItem value="payment_overdue">Payment Overdue</MenuItem>
                    <MenuItem value="automation_failure">Automation Failure</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={kitAlertStatusFilter}
                    label="Status"
                    onChange={(e) => setKitAlertStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="acknowledged">Acknowledged</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="snoozed">Snoozed</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <InputLabel>Process</InputLabel>
                  <Select
                    value={kitAlertProcessFilter}
                    label="Process"
                    onChange={(e) => setKitAlertProcessFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="loaner">Loaner</MenuItem>
                    <MenuItem value="consignment">Consignment</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Kit Alerts List */}
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {filteredKitAlerts.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: colors.success, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No alerts matching current filters
                    </Typography>
                  </Box>
                ) : (
                  filteredKitAlerts.map((alert) => (
                    <Paper
                      key={alert.id}
                      variant="outlined"
                      onClick={() => setSelectedKitAlert(alert)}
                      sx={{
                        p: 2,
                        mb: 1,
                        cursor: 'pointer',
                        bgcolor: darkMode ? '#161b22' : undefined,
                        borderLeft: 4,
                        borderLeftColor: alert.severity === 'critical' ? 'error.main' :
                          alert.severity === 'high' ? 'warning.main' :
                          alert.severity === 'warning' ? 'info.main' : 'grey.400',
                        '&:hover': {
                          bgcolor: darkMode ? '#21262d' : alpha(colors.primary, 0.03),
                          borderColor: alpha(colors.primary, 0.3),
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box flex={1}>
                          <Box display="flex" alignItems="center" gap={0.5} mb={0.5} flexWrap="wrap">
                            <Chip
                              label={alert.severity}
                              size="small"
                              color={getSeverityColor(alert.severity)}
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                            />
                            <Chip
                              label={ALERT_TYPE_LABELS[alert.type] || alert.type}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.65rem' }}
                            />
                            <Chip
                              label={alert.process_type}
                              size="small"
                              color={alert.process_type === 'loaner' ? 'primary' : 'secondary'}
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.65rem' }}
                            />
                            {alert.status !== 'new' && (
                              <Chip
                                label={alert.status.replace('_', ' ')}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                            {alert.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {alert.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                            {alert.kit_id} • {alert.hospital} • {new Date(alert.triggered_at).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box textAlign="right" sx={{ ml: 2 }}>
                          <Typography variant="h6" fontWeight={700} color="error.main" sx={{ lineHeight: 1.2 }}>
                            ${alert.estimated_value?.toLocaleString()}
                          </Typography>
                          {alert.days_overdue > 0 && (
                            <Typography variant="caption" color="warning.main" fontWeight={600}>
                              {alert.days_overdue} days
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {/* Agents List - Hide when viewing alert detail */}
      {!selectedKitAlert && (
      <Card variant="outlined" sx={{ bgcolor: darkMode ? '#161b22' : undefined }}>
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
            <IconButton onClick={loadData} size="small">
              <RefreshIcon />
            </IconButton>
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
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 1.5 }} />

          <Paper sx={{ width: '100%', bgcolor: darkMode ? '#161b22' : undefined }}>
            <DataGrid
              rows={filteredAndSortedAgents}
              columns={columns}
              density="compact"
              checkboxSelection
              disableRowSelectionOnClick
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
              initialState={{ pagination: { paginationModel: { pageSize: 12 } } }}
              pageSizeOptions={[12, 25, 50]}
              onRowClick={(params) => {
                setSelectedAgent(params.row);
                setConfigDialog(true);
              }}
              sx={stoxTheme.getDataGridSx({ clickable: true, darkMode })}
              localeText={{
                noRowsLabel: 'No agents yet. Create your first agent to get started!',
              }}
            />
          </Paper>
        </CardContent>
      </Card>
      )}

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
