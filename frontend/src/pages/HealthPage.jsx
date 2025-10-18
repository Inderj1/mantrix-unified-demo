import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Button,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock performance data
const performanceData = Array.from({ length: 20 }, (_, i) => ({
  time: `${20 - i}m`,
  queries: Math.floor(Math.random() * 50) + 20,
  latency: Math.floor(Math.random() * 100) + 50,
  cacheHit: Math.floor(Math.random() * 40) + 60,
}));

function HealthPage() {
  const { data: healthData, isLoading, error, refetch } = useQuery(
    'health',
    () => apiService.checkHealth(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const health = healthData?.data || {};
  const isHealthy = health.status === 'healthy';

  const services = [
    {
      name: 'BigQuery',
      status: health.bigquery?.includes('connected') ? 'connected' : 'disconnected',
      details: health.bigquery,
      icon: <CloudIcon />,
    },
    {
      name: 'Weaviate',
      status: health.weaviate === 'connected' ? 'connected' : 'disconnected',
      details: health.weaviate,
      icon: <StorageIcon />,
    },
    {
      name: 'Redis Cache',
      status: health.redis?.includes('connected') ? 'connected' : 'disconnected',
      details: health.redis,
      icon: <MemoryIcon />,
    },
  ];

  const cacheStats = health.cache_stats || {
    hits: 0,
    misses: 0,
    total_requests: 0,
    avg_hit_latency_ms: 0,
    avg_miss_latency_ms: 0,
    total_savings_ms: 0,
  };

  const cacheHitRate = cacheStats.total_requests > 0
    ? ((cacheStats.hits / cacheStats.total_requests) * 100).toFixed(1)
    : 0;

  if (error) {
    return (
      <Alert severity="error">
        Failed to load health status: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">System Health</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Overall Status */}
        <Grid item xs={12}>
          <Alert 
            severity={isHealthy ? 'success' : 'error'}
            icon={isHealthy ? <CheckCircleIcon /> : <ErrorIcon />}
          >
            System is {isHealthy ? 'healthy' : 'experiencing issues'}
            {health.version && ` • Version ${health.version}`}
          </Alert>
        </Grid>

        {/* Service Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Status
              </Typography>
              <List>
                {services.map((service) => (
                  <ListItem key={service.name}>
                    <ListItemIcon>
                      {service.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={service.name}
                      secondary={service.details}
                    />
                    <Chip
                      label={service.status}
                      color={service.status === 'connected' ? 'success' : 'error'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Cache Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cache Performance
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Hit Rate</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {cacheHitRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(cacheHitRate)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Hits
                  </Typography>
                  <Typography variant="h6">{cacheStats.hits}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Misses
                  </Typography>
                  <Typography variant="h6">{cacheStats.misses}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Avg Hit Latency
                  </Typography>
                  <Typography variant="h6">
                    {cacheStats.avg_hit_latency_ms.toFixed(1)}ms
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Time Saved
                  </Typography>
                  <Typography variant="h6">
                    {(cacheStats.total_savings_ms / 1000).toFixed(1)}s
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SpeedIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="API Latency"
                    secondary="~87ms average"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <StorageIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tables Available"
                    secondary="10 tables"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <MemoryIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Memory Usage"
                    secondary="248 MB / 2 GB"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Query Volume
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="queries"
                  stroke="#1976d2"
                  fill="#1976d2"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Response Time & Cache Hit Rate
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#f44336"
                  name="Latency (ms)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cacheHit"
                  stroke="#4caf50"
                  name="Cache Hit %"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default HealthPage;