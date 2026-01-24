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
  LinearProgress,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  CloudQueue as CloudIcon,
  Api as ApiIcon,
  Hub as HubIcon,
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from 'recharts';

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

// Service icon mapping
const getServiceIcon = (serviceType) => {
  switch (serviceType) {
    case 'api': return <ApiIcon />;
    case 'database': return <CloudIcon />;
    case 'cache': return <StorageIcon />;
    case 'vectordb': return <HubIcon />;
    default: return <StorageIcon />;
  }
};

const SystemHealthMonitoring = ({ darkMode = false }) => {
  const colors = getColors(darkMode);
  const [systemHealth, setSystemHealth] = useState(null);
  const [services, setServices] = useState([]);
  const [metricsData, setMetricsData] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/v1/control-center/system-health');
      const data = await response.json();

      if (data.success) {
        setSystemHealth(data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching system health:', err);
      setError('Failed to load system health data');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/v1/control-center/services');
      const data = await response.json();

      if (data.success) {
        const transformedServices = data.services.map(service => ({
          ...service,
          icon: getServiceIcon(service.type),
        }));
        setServices(transformedServices);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchMetricsHistory = async () => {
    try {
      const response = await fetch('/api/v1/control-center/metrics-history?hours=1');
      const data = await response.json();

      if (data.success && data.history) {
        setMetricsData(data.history);
      }
    } catch (err) {
      console.error('Error fetching metrics history:', err);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    fetchServices();
    fetchMetricsHistory();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSystemHealth();
      fetchServices();
      fetchMetricsHistory();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([
      fetchSystemHealth(),
      fetchServices(),
      fetchMetricsHistory()
    ]).finally(() => {
      setRefreshing(false);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      default: return colors.grey;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return <CircleIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={60} sx={{ color: colors.primary }} />
        <Typography variant="h6" sx={{ mt: 2, color: colors.grey }}>
          Loading system health...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} sx={{ p: 3, bgcolor: alpha(colors.error, 0.1), border: `1px solid ${alpha(colors.error, 0.3)}`, borderRadius: 2 }}>
        <Typography sx={{ color: colors.error }}>{error}</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ color: colors.text }}>
            System Health & Monitoring
          </Typography>
          <Typography variant="body2" sx={{ color: colors.grey }}>
            Real-time monitoring of all platform services and resources
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Chip
            label={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="small"
            sx={{
              bgcolor: autoRefresh ? alpha(colors.success, 0.1) : alpha(colors.grey, 0.1),
              color: autoRefresh ? colors.success : colors.grey,
              border: `1px solid ${autoRefresh ? alpha(colors.success, 0.3) : alpha(colors.grey, 0.3)}`,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          />
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} sx={{ color: colors.primary }} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            size="small"
            sx={{
              borderColor: colors.primary,
              color: colors.primary,
              '&:hover': { borderColor: colors.secondary, bgcolor: alpha(colors.primary, 0.05) },
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Overall Health Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
                System Status
              </Typography>
              <CheckCircleIcon sx={{ color: colors.success, fontSize: 20 }} />
            </Stack>
            <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>
              {systemHealth?.health_score || 0}%
            </Typography>
            <Typography variant="caption" sx={{ color: colors.light }}>
              Services Operational
            </Typography>
            <LinearProgress
              variant="determinate"
              value={systemHealth?.health_score || 0}
              sx={{
                mt: 1.5,
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(colors.success, 0.1),
                '& .MuiLinearProgress-bar': { bgcolor: colors.success, borderRadius: 3 },
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
                CPU Usage
              </Typography>
              <TrendingUpIcon sx={{ color: colors.primary, fontSize: 20 }} />
            </Stack>
            <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>
              {systemHealth?.system_metrics?.cpu?.percent || 0}%
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
              <Chip
                label={`${systemHealth?.system_metrics?.cpu?.cores || 0} cores`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  bgcolor: alpha(colors.primary, 0.1),
                  color: colors.primary,
                }}
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
                Memory Usage
              </Typography>
              <SpeedIcon sx={{ color: colors.secondary, fontSize: 20 }} />
            </Stack>
            <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>
              {systemHealth?.system_metrics?.memory?.percent || 0}%
            </Typography>
            <Typography variant="caption" sx={{ color: colors.light }}>
              {systemHealth?.system_metrics?.memory?.used_gb || 0}GB / {systemHealth?.system_metrics?.memory?.total_gb || 0}GB
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
                Disk Usage
              </Typography>
              <StorageIcon sx={{ color: colors.dark, fontSize: 20 }} />
            </Stack>
            <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>
              {systemHealth?.system_metrics?.disk?.percent || 0}%
            </Typography>
            <Typography variant="caption" sx={{ color: colors.light }}>
              {systemHealth?.system_metrics?.disk?.used_gb || 0}GB / {systemHealth?.system_metrics?.disk?.total_gb || 0}GB
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Service Health Grid */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: colors.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text, mb: 2 }}>
          Service Health Status
        </Typography>
        <Grid container spacing={2}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: colors.cardBg,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                  },
                }}
                onClick={() => setSelectedService(service)}
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
                        {service.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.text }}>
                          {service.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem' }}>
                          {service.endpoint || 'Local Service'}
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title={service.status}>
                      <Box sx={{ color: getStatusColor(service.status) }}>
                        {React.cloneElement(getStatusIcon(service.status), { sx: { fontSize: 18 } })}
                      </Box>
                    </Tooltip>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={1}>
                      {service.latency_ms !== undefined && (
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                            Latency
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                            {service.latency_ms}ms
                          </Typography>
                        </Grid>
                      )}
                      {service.tables !== undefined && (
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                            Tables
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                            {service.tables}
                          </Typography>
                        </Grid>
                      )}
                      {service.memory_used_mb !== undefined && (
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                            Memory
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                            {service.memory_used_mb}MB
                          </Typography>
                        </Grid>
                      )}
                      {service.connected_clients !== undefined && (
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                            Clients
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                            {service.connected_clients}
                          </Typography>
                        </Grid>
                      )}
                      {service.schemas !== undefined && (
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: colors.light, fontWeight: 500 }}>
                            Schemas
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: colors.dark }}>
                            {service.schemas}
                          </Typography>
                        </Grid>
                      )}
                      {service.error && (
                        <Grid item xs={12}>
                          <Typography variant="caption" sx={{ color: colors.error }}>
                            {service.error}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  {service.message && (
                    <Paper
                      elevation={0}
                      sx={{
                        mt: 2,
                        p: 1,
                        bgcolor: alpha(colors.warning, 0.1),
                        border: `1px solid ${alpha(colors.warning, 0.3)}`,
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: colors.warning }}>
                        {service.message}
                      </Typography>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Performance Metrics */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: colors.paper,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text, mb: 2 }}>
              System Performance
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.grey, 0.2)} />
                  <XAxis dataKey="time" fontSize={11} stroke={colors.light} />
                  <YAxis fontSize={11} stroke={colors.light} />
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: `1px solid ${alpha(colors.primary, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    stroke={colors.primary}
                    strokeWidth={2}
                    name="CPU %"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="memory"
                    stroke={colors.secondary}
                    strokeWidth={2}
                    name="Memory %"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: colors.paper,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text, mb: 2 }}>
              Request Volume & Latency
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.grey, 0.2)} />
                  <XAxis dataKey="time" fontSize={11} stroke={colors.light} />
                  <YAxis fontSize={11} stroke={colors.light} />
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: `1px solid ${alpha(colors.primary, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke={colors.success}
                    fill={alpha(colors.success, 0.2)}
                    strokeWidth={2}
                    name="Requests/min"
                  />
                  <Area
                    type="monotone"
                    dataKey="latency"
                    stroke={colors.warning}
                    fill={alpha(colors.warning, 0.2)}
                    strokeWidth={2}
                    name="Latency (ms)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Alerts */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 3,
          bgcolor: colors.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
            Recent Alerts
          </Typography>
          <Button
            startIcon={<NotificationsIcon />}
            size="small"
            sx={{ color: colors.primary }}
          >
            Configure Alerts
          </Button>
        </Stack>
        <List disablePadding>
          <ListItem
            sx={{
              bgcolor: alpha(colors.warning, 0.05),
              borderRadius: 1.5,
              mb: 1,
              border: `1px solid ${alpha(colors.warning, 0.2)}`,
            }}
          >
            <ListItemIcon>
              <WarningIcon sx={{ color: colors.warning }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" fontWeight={500} sx={{ color: colors.text }}>High latency detected on Weaviate Vector DB</Typography>}
              secondary={<Typography variant="caption" sx={{ color: colors.textSecondary }}>2 minutes ago - Average response time exceeded 200ms threshold</Typography>}
            />
          </ListItem>
          <Divider sx={{ my: 1 }} />
          <ListItem
            sx={{
              bgcolor: alpha(colors.success, 0.05),
              borderRadius: 1.5,
              mb: 1,
              border: `1px solid ${alpha(colors.success, 0.2)}`,
            }}
          >
            <ListItemIcon>
              <CheckCircleIcon sx={{ color: colors.success }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" fontWeight={500} sx={{ color: colors.text }}>Redis cache memory usage normalized</Typography>}
              secondary={<Typography variant="caption" sx={{ color: colors.textSecondary }}>15 minutes ago - Memory usage dropped below 80% threshold</Typography>}
            />
          </ListItem>
          <Divider sx={{ my: 1 }} />
          <ListItem
            sx={{
              bgcolor: alpha(colors.error, 0.05),
              borderRadius: 1.5,
              border: `1px solid ${alpha(colors.error, 0.2)}`,
            }}
          >
            <ListItemIcon>
              <ErrorIcon sx={{ color: colors.error }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" fontWeight={500} sx={{ color: colors.text }}>API endpoint /api/v1/query experienced timeout</Typography>}
              secondary={<Typography variant="caption" sx={{ color: colors.textSecondary }}>1 hour ago - Query execution exceeded 30 second limit</Typography>}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default SystemHealthMonitoring;
