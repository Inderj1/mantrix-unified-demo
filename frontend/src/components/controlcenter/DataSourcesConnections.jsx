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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  Divider,
  Avatar,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Badge,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Storage as DatabaseIcon,
  Cloud as CloudIcon,
  Api as ApiIcon,
  Hub as HubIcon,
  Memory as StorageIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Key as KeyIcon,
  Link as LinkIcon,
  Settings as SettingsIcon,
  CheckCircle as TestIcon,
  Circle as CircleIcon,
  VpnKey as VpnKeyIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CloudQueue as BigQueryIcon,
  Psychology as AnthropicIcon,
  AutoAwesome as OpenAIIcon,
  AccountTree as SupersetIcon,
} from '@mui/icons-material';

// Mock data for connections
const connections = {
  databases: [
    {
      id: 'bigquery-prod',
      name: 'BigQuery Production',
      type: 'bigquery',
      icon: <BigQueryIcon />,
      status: 'connected',
      host: 'arizona-beverages.us-central1',
      database: 'analytics_prod',
      lastSync: '2 minutes ago',
      tables: 156,
      size: '2.4 TB',
      config: {
        project: 'arizona-beverages',
        dataset: 'analytics_prod',
        location: 'us-central1',
      },
    },
    {
      id: 'postgres-staging',
      name: 'PostgreSQL Staging',
      type: 'postgresql',
      icon: <DatabaseIcon />,
      status: 'connected',
      host: 'pg-staging.arizona.internal',
      database: 'staging_db',
      lastSync: '5 minutes ago',
      tables: 89,
      size: '156 GB',
      config: {
        host: 'pg-staging.arizona.internal',
        port: 5432,
        ssl: true,
      },
    },
    {
      id: 'mongodb-conversations',
      name: 'MongoDB Conversations',
      type: 'mongodb',
      icon: <StorageIcon />,
      status: 'connected',
      host: 'mongodb://localhost:27017',
      database: 'conversations',
      lastSync: 'Real-time',
      collections: 12,
      size: '8.3 GB',
      config: {
        replicaSet: 'rs0',
        authSource: 'admin',
      },
    },
    {
      id: 'snowflake-analytics',
      name: 'Snowflake Analytics',
      type: 'snowflake',
      icon: <CloudIcon />,
      status: 'disconnected',
      host: 'arizona.snowflakecomputing.com',
      database: 'ANALYTICS',
      lastSync: 'Never',
      tables: 0,
      size: '0 B',
      config: {
        account: 'arizona',
        warehouse: 'COMPUTE_WH',
        role: 'ANALYTICS_ROLE',
      },
    },
  ],
  apis: [
    {
      id: 'anthropic-claude',
      name: 'Anthropic Claude',
      type: 'llm',
      icon: <AnthropicIcon />,
      status: 'connected',
      endpoint: 'https://api.anthropic.com/v1',
      model: 'claude-3-opus-20240229',
      usage: {
        requests: 12450,
        tokens: 8.5,
        cost: 127.50,
      },
      quotaUsed: 42,
      quotaLimit: 100000,
    },
    {
      id: 'openai-embeddings',
      name: 'OpenAI Embeddings',
      type: 'embeddings',
      icon: <OpenAIIcon />,
      status: 'connected',
      endpoint: 'https://api.openai.com/v1',
      model: 'text-embedding-3-small',
      usage: {
        requests: 34500,
        tokens: 12.3,
        cost: 4.85,
      },
      quotaUsed: 12,
      quotaLimit: 1000000,
    },
    {
      id: 'google-cloud',
      name: 'Google Cloud Platform',
      type: 'cloud',
      icon: <CloudIcon />,
      status: 'connected',
      endpoint: 'https://bigquery.googleapis.com',
      project: 'arizona-beverages',
      services: ['BigQuery', 'Cloud Storage', 'Cloud Functions'],
      billing: {
        current: 2450.00,
        projected: 3200.00,
        limit: 5000.00,
      },
    },
  ],
  integrations: [
    {
      id: 'weaviate-vector',
      name: 'Weaviate Vector DB',
      type: 'vectordb',
      icon: <HubIcon />,
      status: 'warning',
      endpoint: 'http://localhost:8080',
      schemas: 24,
      objects: 156000,
      indexSize: '2.1 GB',
      message: 'High memory usage detected',
    },
    {
      id: 'redis-cache',
      name: 'Redis Cache',
      type: 'cache',
      icon: <StorageIcon />,
      status: 'connected',
      endpoint: 'redis://localhost:6379',
      memory: '4.2 GB',
      keys: 45600,
      hitRate: 94.5,
      evictions: 120,
    },
    {
      id: 'apache-superset',
      name: 'Apache Superset',
      type: 'bi',
      icon: <SupersetIcon />,
      status: 'connected',
      endpoint: 'http://localhost:8088',
      dashboards: 12,
      charts: 89,
      users: 45,
      lastSync: '10 minutes ago',
    },
  ],
};

const DataSourcesConnections = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connections, setConnections] = useState({ databases: [], apis: [], integrations: [] });
  const [loading, setLoading] = useState(true);

  // Fetch data sources from API
  useEffect(() => {
    fetchDataSources();
    const interval = setInterval(fetchDataSources, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/v1/control-center/data-sources');
      const data = await response.json();

      if (data.success && data.data_sources) {
        // Enrich data with icons and UI properties
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
    // Simulate connection test
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
      case 'connected': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'disconnected': return theme.palette.error.main;
      default: return theme.palette.grey[500];
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
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(getStatusColor(db.status), 0.1),
                  color: getStatusColor(db.status),
                }}
              >
                {db.icon}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {db.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {db.host}
                </Typography>
              </Box>
            </Box>
            <Chip
              size="small"
              icon={getStatusIcon(db.status)}
              label={db.status}
              color={db.status === 'connected' ? 'success' : 'error'}
            />
          </Stack>

          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Database
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {db.database}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Last Sync
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {db.lastSync}
                </Typography>
              </Grid>
              {db.tables !== undefined && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Tables
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {db.tables}
                  </Typography>
                </Grid>
              )}
              {db.collections !== undefined && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Collections
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {db.collections}
                  </Typography>
                </Grid>
              )}
              {db.size && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Size
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
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

  const renderAPICard = (api) => (
    <Grid item xs={12} md={4} key={api.id}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              >
                {api.icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {api.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {api.model || api.type}
                </Typography>
              </Box>
            </Box>
            <Tooltip title={api.status}>
              <Box sx={{ color: getStatusColor(api.status) }}>
                {getStatusIcon(api.status)}
              </Box>
            </Tooltip>
          </Stack>

          {api.usage && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary">
                API Usage
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">
                    {api.usage.requests.toLocaleString()} requests
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${api.usage.cost.toFixed(2)}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={api.quotaUsed}
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {api.quotaUsed}% of {(api.quotaLimit / 1000).toFixed(0)}K quota
                </Typography>
              </Box>
            </Box>
          )}

          {api.billing && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Monthly Billing
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight={500}>
                    ${api.billing.current.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    of ${api.billing.limit.toLocaleString()}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(api.billing.current / api.billing.limit) * 100}
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  color={api.billing.current > api.billing.limit * 0.8 ? 'warning' : 'primary'}
                />
              </Box>
            </Box>
          )}

        </CardContent>
      </Card>
    </Grid>
  );

  const renderIntegrationCard = (integration) => (
    <Grid item xs={12} md={4} key={integration.id}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(getStatusColor(integration.status), 0.1),
                  color: getStatusColor(integration.status),
                }}
              >
                {integration.icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {integration.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {integration.endpoint}
                </Typography>
              </Box>
            </Box>
            <Tooltip title={integration.status}>
              <Box sx={{ color: getStatusColor(integration.status) }}>
                {getStatusIcon(integration.status)}
              </Box>
            </Tooltip>
          </Stack>

          {integration.message && (
            <Alert severity="warning" sx={{ mt: 2, py: 0 }}>
              <Typography variant="caption">{integration.message}</Typography>
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Grid container spacing={1}>
              {(integration.memory || integration.memory_used_mb !== undefined) && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Memory
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {integration.memory || `${integration.memory_used_mb} MB`}
                  </Typography>
                </Grid>
              )}
              {integration.keys !== undefined && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Keys
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {integration.keys}
                  </Typography>
                </Grid>
              )}
              {integration.hitRate && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Hit Rate
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {integration.hitRate}%
                  </Typography>
                </Grid>
              )}
              {(integration.schemas !== undefined || integration.collections !== undefined) && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    {integration.schemas !== undefined ? 'Schemas' : 'Collections'}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {integration.schemas || integration.collections}
                  </Typography>
                </Grid>
              )}
              {integration.dashboards && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Dashboards
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {integration.dashboards}
                  </Typography>
                </Grid>
              )}
              {integration.objects && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Objects
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Data Sources & Connections
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage database connections, API integrations, and external services
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {connections.databases.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Databases
                  </Typography>
                </Box>
                <DatabaseIcon sx={{ fontSize: 40, color: 'primary.light' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {connections.integrations.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Integrations
                  </Typography>
                </Box>
                <LinkIcon sx={{ fontSize: 40, color: 'success.light' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {connections.databases.filter(d => d.status === 'connected').length +
                     connections.integrations.filter(i => i.status === 'connected' || i.status === 'healthy').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.light' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
        >
          <Tab label="Databases" icon={<DatabaseIcon />} iconPosition="start" />
          <Tab label="Integrations" icon={<LinkIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {connections.databases.map(renderDatabaseCard)}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {connections.integrations.map(renderIntegrationCard)}
        </Grid>
      )}

      {/* Connection Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
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
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="outlined"
            startIcon={<TestIcon />}
            disabled={testingConnection}
          >
            Test Connection
          </Button>
          <Button variant="contained">
            {editMode ? 'Save Changes' : 'Add Connection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataSourcesConnections;