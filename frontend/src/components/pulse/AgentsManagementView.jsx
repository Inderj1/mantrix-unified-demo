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
  CircularProgress,
  Tooltip,
  Paper,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import stoxTheme from '../stox/stoxTheme';
import AgentConfigForm from './AgentConfigForm';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  LocalShipping as LocalShippingIcon,
  SmartToy as AgentsIcon,
  Psychology as PsychologyIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { kitMonitoringAgents, reveqCategoryInfo } from './kitAgentsMockData';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  secondary: darkMode ? '#2d8ce6' : '#0854a0',
  success: darkMode ? '#36d068' : '#10b981',
  warning: darkMode ? '#f59e0b' : '#f59e0b',
  error: darkMode ? '#ff6b6b' : '#ef4444',
  text: darkMode ? '#e6edf3' : '#1e293b',
  grey: darkMode ? '#8b949e' : '#64748b',
});

const AgentsManagementView = ({ userId = 'persona', onBack, onCreateAgent, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [refineDialog, setRefineDialog] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState('');
  const [configDialog, setConfigDialog] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDemoOnly, setShowDemoOnly] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadData = async () => {
    try {
      // Only use kit monitoring agents for Enterprise Pulse
      // Filter out Margen.AI and Stox.AI agents (they belong in their respective modules)
      setAgents(kitMonitoringAgents);
    } catch (err) {
      console.error('Failed to load agents:', err);
      setAgents(kitMonitoringAgents);
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
  };

  const handleToggleAgent = async (agent) => {
    try {
      await fetch(`/api/v1/pulse/monitors/${agent.id}/toggle?enabled=${!agent.enabled}`, { method: 'PUT' });
      loadData();
    } catch (err) {
      console.error('Failed to toggle agent:', err);
    }
    handleMenuClose();
  };

  const handleTestAgent = async (agent) => {
    try {
      await fetch(`/api/v1/pulse/monitors/${agent.id}/test`, { method: 'POST' });
      loadData();
    } catch (err) {
      console.error('Failed to test agent:', err);
    }
    handleMenuClose();
  };

  const handleDeleteAgent = async (agent) => {
    try {
      await fetch(`/api/v1/pulse/monitors/${agent.id}`, { method: 'DELETE' });
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const categoryInfo = {
    // Ordly AI Categories
    ordly_ml_models: { name: 'ML Models', icon: PsychologyIcon, color: '#8b5cf6' },
    ordly_pricing: { name: 'Pricing Intel', icon: TrendingUpIcon, color: '#10b981' },
    ordly_customer: { name: 'Customer Intel', icon: PeopleIcon, color: '#0ea5e9' },
    ordly_operations: { name: 'Operations', icon: LocalShippingIcon, color: '#f59e0b' },
    // General fallback
    general: { name: 'General', icon: SettingsIcon, color: '#616161' },
  };

  const filteredAgents = useMemo(() => {
    let filtered = [...agents];

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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => statusFilter === 'active' ? m.enabled : !m.enabled);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(m => m.severity === severityFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }

    if (showDemoOnly) {
      filtered = filtered.filter(m => m.name && m.name.includes('[DEMO]'));
    }

    return filtered;
  }, [agents, searchQuery, statusFilter, severityFilter, categoryFilter, showDemoOnly]);

  const columns = useMemo(() => [
    {
      field: 'name',
      headerName: 'Agent Name',
      flex: 2,
      minWidth: 320,
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
            <CategoryIcon sx={{ fontSize: 16, color: '#0a6ed1' }} />
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
        <Chip label={params.value ? 'Active' : 'Paused'} size="small" color={params.value ? 'success' : 'default'} sx={{ height: 22, fontSize: '0.7rem' }} />
      ),
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 100,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={getSeverityColor(params.value)} sx={{ height: 22, fontSize: '0.7rem' }} />
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
        <Typography variant="caption" color="text.secondary">{new Date(params.value).toLocaleString()}</Typography>
      ) : <Typography variant="body2" color="text.disabled">—</Typography>,
    },
    {
      field: 'actions',
      headerName: '',
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, params.row); }}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ], []);

  const stats = useMemo(() => ({
    activeAgents: agents.filter(a => a.enabled).length,
    totalAgents: agents.length,
    mlModelsAgents: agents.filter(a => a.category === 'ordly_ml_models').length,
    pricingAgents: agents.filter(a => a.category === 'ordly_pricing').length,
    customerAgents: agents.filter(a => a.category === 'ordly_customer').length,
    operationsAgents: agents.filter(a => a.category === 'ordly_operations').length,
  }), [agents]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
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
          <AgentsIcon sx={{ fontSize: 24, color: colors.primary }} />
        </Box>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
            Agents Management
          </Typography>
          <Typography variant="body2" sx={{ color: colors.grey }}>
            Configure and manage AI monitoring agents
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={onCreateAgent}
          sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.secondary } }}
        >
          New Agent
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={2}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: alpha(colors.success, 0.2), bgcolor: alpha(colors.success, 0.03) }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">Active</Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">{stats.activeAgents}</Typography>
              </Box>
              <CheckCircleIcon sx={{ color: colors.success, fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: alpha('#8b5cf6', 0.2), bgcolor: alpha('#8b5cf6', 0.03) }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">ML Models</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#8b5cf6' }}>{stats.mlModelsAgents}</Typography>
              </Box>
              <PsychologyIcon sx={{ color: '#8b5cf6', fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: alpha('#10b981', 0.2), bgcolor: alpha('#10b981', 0.03) }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">Pricing Intel</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#10b981' }}>{stats.pricingAgents}</Typography>
              </Box>
              <TrendingUpIcon sx={{ color: '#10b981', fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: alpha('#0ea5e9', 0.2), bgcolor: alpha('#0ea5e9', 0.03) }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">Customer Intel</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#0ea5e9' }}>{stats.customerAgents}</Typography>
              </Box>
              <PeopleIcon sx={{ color: '#0ea5e9', fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: alpha('#f59e0b', 0.2), bgcolor: alpha('#f59e0b', 0.03) }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">Operations</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#f59e0b' }}>{stats.operationsAgents}</Typography>
              </Box>
              <LocalShippingIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: alpha(colors.primary, 0.2), bgcolor: alpha(colors.primary, 0.03) }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">Total</Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">{stats.totalAgents}</Typography>
              </Box>
              <AgentsIcon sx={{ color: colors.primary, fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Agents DataGrid */}
      <Card variant="outlined" sx={{ bgcolor: darkMode ? '#161b22' : undefined }}>
        <CardContent>
          {/* Search and Filters */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Severity</InputLabel>
                <Select value={severityFilter} label="Severity" onChange={(e) => setSeverityFilter(e.target.value)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="ordly_ml_models">ML Models</MenuItem>
                  <MenuItem value="ordly_pricing">Pricing Intel</MenuItem>
                  <MenuItem value="ordly_customer">Customer Intel</MenuItem>
                  <MenuItem value="ordly_operations">Operations</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
              <IconButton onClick={loadData} size="small">
                <RefreshIcon />
              </IconButton>
            </Grid>
          </Grid>

          <Paper sx={{ width: '100%', bgcolor: darkMode ? '#161b22' : undefined }}>
            <DataGrid
              rows={filteredAgents}
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
              localeText={{ noRowsLabel: 'No agents yet. Create your first agent to get started!' }}
            />
          </Paper>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleMenuClose(); setConfigDialog(true); }}>
          <SettingsIcon fontSize="small" sx={{ mr: 1 }} /> Configure
        </MenuItem>
        <MenuItem onClick={() => handleTestAgent(selectedAgent)}>
          <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} /> Execute Now
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); setRefineDialog(true); }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Refine Agent
        </MenuItem>
        <MenuItem onClick={() => handleToggleAgent(selectedAgent)}>
          {selectedAgent?.enabled ? <PauseIcon fontSize="small" sx={{ mr: 1 }} /> : <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />}
          {selectedAgent?.enabled ? 'Pause' : 'Resume'}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteAgent(selectedAgent)} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Refine Dialog */}
      <Dialog open={refineDialog} onClose={() => setRefineDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Refine Agent</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Describe how you want to improve this agent.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Example: Add region breakdown, include only active customers"
            value={refineFeedback}
            onChange={(e) => setRefineFeedback(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setRefineDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleRefineAgent} disabled={!refineFeedback}>Refine Agent</Button>
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
            <IconButton onClick={() => setConfigDialog(false)}><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedAgent ? (
            <AgentConfigForm agent={selectedAgent} onClose={() => { setConfigDialog(false); loadData(); }} />
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AgentsManagementView;
