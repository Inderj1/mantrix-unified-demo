import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Stack,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  Storage as DatabaseIcon,
  Cloud as CloudIcon,
  Api as ApiIcon,
  Hub as HubIcon,
  Memory as StorageIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Circle as CircleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CloudQueue as BigQueryIcon,
  Psychology as AnthropicIcon,
  AutoAwesome as OpenAIIcon,
  AccountTree as SupersetIcon,
  DataUsage as DataUsageIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

// Import DataCatalog component
import DataCatalog from '../DataCatalog';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  secondary: darkMode ? '#5cb3ff' : '#002352',
  dark: darkMode ? '#8b949e' : '#354a5f',
  slate: darkMode ? '#8b949e' : '#475569',
  grey: darkMode ? '#8b949e' : '#64748b',
  light: darkMode ? '#6e7681' : '#94a3b8',
  success: darkMode ? '#3fb950' : '#10b981',
  warning: darkMode ? '#d29922' : '#f59e0b',
  error: darkMode ? '#f85149' : '#ef4444',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const DataSourcesConnections = ({ darkMode = false }) => {
  const colors = getColors(darkMode);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connections, setConnections] = useState({ databases: [], apis: [], integrations: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDataSources();
    const interval = setInterval(fetchDataSources, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/v1/control-center/data-sources');
      const data = await response.json();

      if (data.success && data.data_sources) {
        const enrichedData = {
          databases: data.data_sources.databases.map(db => ({
            ...db,
            icon: getIconForType(db.type),
            size: db.size || 'Unknown',
          })),
          apis: data.data_sources.apis.map(api => ({
            ...api,
            icon: getIconForType(api.type),
          })),
          integrations: data.data_sources.integrations.map(int => ({
            ...int,
            icon: getIconForType(int.type),
          })),
        };
        setConnections(enrichedData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data sources:', error);
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    const icons = {
      bigquery: <BigQueryIcon />,
      postgresql: <DatabaseIcon />,
      mongodb: <StorageIcon />,
      snowflake: <CloudIcon />,
      llm: <AnthropicIcon />,
      embeddings: <OpenAIIcon />,
      cloud: <CloudIcon />,
      vectordb: <HubIcon />,
      cache: <StorageIcon />,
      bi: <SupersetIcon />,
    };
    return icons[type] || <DatabaseIcon />;
  };

  const handleTestConnection = async (connection) => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      alert(`Connection test ${connection.status === 'connected' ? 'successful' : 'failed'}`);
    }, 2000);
  };

  const handleEditConnection = (connection) => {
    setSelectedConnection(connection);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleAddConnection = () => {
    setSelectedConnection(null);
    setEditMode(false);
    setDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return colors.success;
      case 'warning': return colors.warning;
      case 'disconnected': return colors.error;
      default: return colors.grey;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'disconnected': return <ErrorIcon />;
      default: return <CircleIcon />;
    }
  };

  const renderDatabaseCard = (db) => (
    <Grid item xs={12} md={6} key={db.id}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          borderRadius: 3,
          bgcolor: colors.cardBg,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <CardContent sx={{ pt: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: alpha(colors.primary, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.primary,
                }}
              >
                {db.icon}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
                  {db.name}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  {db.host}
                </Typography>
              </Box>
            </Box>
            <Chip
              size="small"
              icon={React.cloneElement(getStatusIcon(db.status), { sx: { fontSize: 14 } })}
              label={db.status}
              sx={{
                height: 24,
                bgcolor: alpha(getStatusColor(db.status), 0.1),
                color: getStatusColor(db.status),
                border: `1px solid ${alpha(getStatusColor(db.status), 0.3)}`,
                fontWeight: 600,
                fontSize: '0.7rem',
                textTransform: 'capitalize',
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
          </Stack>

          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                  Database
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                  {db.database}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                  Last Sync
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                  {db.lastSync}
                </Typography>
              </Grid>
              {db.tables !== undefined && (
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                    Tables
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                    {db.tables}
                  </Typography>
                </Grid>
              )}
              {db.collections !== undefined && (
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                    Collections
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                    {db.collections}
                  </Typography>
                </Grid>
              )}
              {db.size && (
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                    Size
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                    {db.size}
                  </Typography>
                </Grid>
              )}
              {db.error && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {db.error}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderIntegrationCard = (integration) => (
    <Grid item xs={12} md={4} key={integration.id}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          borderRadius: 3,
          bgcolor: colors.cardBg,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <CardContent sx={{ pt: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                {integration.icon}
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.text }}>
                  {integration.name}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem' }}>
                  {integration.endpoint}
                </Typography>
              </Box>
            </Box>
            <Tooltip title={integration.status}>
              <Box sx={{ color: getStatusColor(integration.status) }}>
                {React.cloneElement(getStatusIcon(integration.status), { sx: { fontSize: 18 } })}
              </Box>
            </Tooltip>
          </Stack>

          {integration.message && (
            <Alert severity="warning" sx={{ mt: 2, py: 0.5, '& .MuiAlert-message': { fontSize: '0.75rem' } }}>
              {integration.message}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <Grid container spacing={1}>
              {(integration.memory || integration.memory_used_mb !== undefined) && (
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                    Memory
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                    {integration.memory || `${integration.memory_used_mb} MB`}
                  </Typography>
                </Grid>
              )}
              {integration.keys !== undefined && (
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                    Keys
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                    {integration.keys}
                  </Typography>
                </Grid>
              )}
              {integration.hitRate && (
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                    Hit Rate
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                    {integration.hitRate}%
                  </Typography>
                </Grid>
              )}
              {(integration.schemas !== undefined || integration.collections !== undefined) && (
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                    {integration.schemas !== undefined ? 'Schemas' : 'Collections'}
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                    {integration.schemas || integration.collections}
                  </Typography>
                </Grid>
              )}
              {integration.dashboards && (
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                    Dashboards
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                    {integration.dashboards}
                  </Typography>
                </Grid>
              )}
              {integration.objects && (
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                    Objects
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                    {integration.objects.toLocaleString()}
                  </Typography>
                </Grid>
              )}
              {integration.error && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {integration.error}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ color: colors.text }}>
            Data Sources & Connections
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Manage database connections, API integrations, and external services
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: colors.paper,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>
                  {connections.databases.length}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Databases
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: alpha(colors.primary, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.primary,
                }}
              >
                <DatabaseIcon />
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: colors.paper,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>
                  {connections.integrations.length}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Integrations
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: alpha(colors.secondary, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.secondary,
                }}
              >
                <LinkIcon />
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: colors.paper,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" fontWeight={700} sx={{ color: colors.success }}>
                  {connections.databases.filter(d => d.status === 'connected').length +
                   connections.integrations.filter(i => i.status === 'connected' || i.status === 'healthy').length}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Active
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: alpha(colors.success, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.success,
                }}
              >
                <CheckCircleIcon />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          bgcolor: colors.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              color: colors.textSecondary,
              '&.Mui-selected': {
                color: colors.primary,
              },
            },
            '& .MuiTabs-indicator': {
              bgcolor: colors.primary,
              height: 3,
            },
          }}
        >
          <Tab label="Databases" icon={<DatabaseIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="Integrations" icon={<LinkIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="Data Catalog" icon={<DataUsageIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={2}>
          {connections.databases.map(renderDatabaseCard)}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={2}>
          {connections.integrations.map(renderIntegrationCard)}
        </Grid>
      )}

      {activeTab === 2 && (
        <Box>
          <DataCatalog darkMode={darkMode} />
        </Box>
      )}

      {/* Connection Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.text, fontWeight: 600 }}>
          {editMode ? 'Edit Connection' : 'Add New Connection'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>Connection Type</InputLabel>
                <Select defaultValue="bigquery" label="Connection Type">
                  <MenuItem value="bigquery">BigQuery</MenuItem>
                  <MenuItem value="postgresql">PostgreSQL</MenuItem>
                  <MenuItem value="mongodb">MongoDB</MenuItem>
                  <MenuItem value="snowflake">Snowflake</MenuItem>
                  <MenuItem value="api">API Service</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Connection Name"
                defaultValue={selectedConnection?.name}
              />
              <TextField
                fullWidth
                label="Host/Endpoint"
                defaultValue={selectedConnection?.host}
              />
              <TextField
                fullWidth
                label="Database/Project"
                defaultValue={selectedConnection?.database}
              />
              <TextField
                fullWidth
                label="Username"
                defaultValue="admin"
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Use SSL/TLS"
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: colors.grey }}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            startIcon={<CheckCircleIcon />}
            disabled={testingConnection}
            sx={{
              borderColor: colors.primary,
              color: colors.primary,
              '&:hover': { borderColor: colors.secondary, bgcolor: alpha(colors.primary, 0.05) },
            }}
          >
            Test Connection
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: colors.primary,
              '&:hover': { bgcolor: colors.secondary },
            }}
          >
            {editMode ? 'Save Changes' : 'Add Connection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataSourcesConnections;
