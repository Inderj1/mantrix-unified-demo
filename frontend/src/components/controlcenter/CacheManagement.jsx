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
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
  alpha,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Timer as TimerIcon,
  Memory as MemoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ClearAll as ClearAllIcon,
  Cached as CachedIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  QueryStats as QueryIcon,
  CloudDownload as DownloadIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

// Cache types configuration
const cacheTypes = [
  {
    id: 'sql_generation',
    name: 'SQL Generation',
    description: 'Generated SQL queries from natural language',
    ttl: 604800, // 7 days in seconds
    size: '1.2 GB',
    keys: 12450,
    hitRate: 84.5,
    costSavings: 3200,
    enabled: true,
    icon: <QueryIcon />,
    color: '#00357a',
  },
  {
    id: 'schema',
    name: 'Schema Cache',
    description: 'Database table schemas and metadata',
    ttl: 86400, // 24 hours
    size: '456 MB',
    keys: 2340,
    hitRate: 92.3,
    costSavings: 890,
    enabled: true,
    icon: <StorageIcon />,
    color: '#4caf50',
  },
  {
    id: 'embedding',
    name: 'Embeddings',
    description: 'Vector embeddings for semantic search',
    ttl: 2592000, // 30 days
    size: '890 MB',
    keys: 45600,
    hitRate: 96.7,
    costSavings: 1450,
    enabled: true,
    icon: <MemoryIcon />,
    color: '#9c27b0',
  },
  {
    id: 'validation',
    name: 'Validation Cache',
    description: 'Query validation results',
    ttl: 3600, // 1 hour
    size: '123 MB',
    keys: 3450,
    hitRate: 78.9,
    costSavings: 450,
    enabled: true,
    icon: <CheckCircleIcon />,
    color: '#ff9800',
  },
  {
    id: 'result',
    name: 'Result Cache',
    description: 'Query execution results',
    ttl: 300, // 5 minutes
    size: '2.3 GB',
    keys: 8900,
    hitRate: 65.4,
    costSavings: 2100,
    enabled: false,
    icon: <CachedIcon />,
    color: '#f44336',
  },
  {
    id: 'session',
    name: 'Session Cache',
    description: 'User session data',
    ttl: 86400, // 24 hours
    size: '67 MB',
    keys: 1230,
    hitRate: 89.2,
    costSavings: 120,
    enabled: true,
    icon: <TimerIcon />,
    color: '#00bcd4',
  },
];

// Mock popular queries data
const popularQueries = [
  { query: 'Show revenue by region for last quarter', count: 234, avgTime: 1.2, cacheHits: 198 },
  { query: 'Calculate gross margin by product category', count: 189, avgTime: 0.8, cacheHits: 176 },
  { query: 'List top 10 customers by sales volume', count: 156, avgTime: 0.5, cacheHits: 145 },
  { query: 'Show inventory levels by warehouse', count: 145, avgTime: 1.5, cacheHits: 128 },
  { query: 'Compare YoY growth rates', count: 134, avgTime: 2.1, cacheHits: 112 },
];

// Generate time series data for cache performance
const generateCachePerformanceData = () => {
  const hours = 24;
  const now = Date.now();
  return Array.from({ length: hours }, (_, i) => ({
    time: new Date(now - (hours - i) * 3600000).getHours() + ':00',
    hits: Math.floor(Math.random() * 1000 + 500),
    misses: Math.floor(Math.random() * 200 + 50),
    hitRate: Math.floor(Math.random() * 20 + 75),
  }));
};

const CacheManagement = () => {
  const theme = useTheme();
  const [selectedCache, setSelectedCache] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [warmingDialogOpen, setWarmingDialogOpen] = useState(false);
  const [performanceData] = useState(generateCachePerformanceData());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [warming, setWarming] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [cacheTypes, setCacheTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    size: 0,
    keys: 0,
    costSavings: 0,
    avgHitRate: 0,
    enabledCount: 0,
  });

  // Fetch cache types from API
  useEffect(() => {
    fetchCacheTypes();
    const interval = setInterval(fetchCacheTypes, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchCacheTypes = async () => {
    try {
      const response = await fetch('/api/v1/control-center/cache/types');
      const data = await response.json();

      if (data.success && data.cache_types) {
        // Add icon and color to each cache type
        const enrichedCacheTypes = data.cache_types.map(cache => ({
          ...cache,
          icon: getCacheIcon(cache.id),
          color: getCacheColor(cache.id),
          size: formatBytes(data.memory_used_mb * 1024 * 1024 / data.cache_types.length), // Distribute memory
          hitRate: data.hit_rate || 0,
        }));

        setCacheTypes(enrichedCacheTypes);

        // Calculate total stats
        const stats = {
          size: data.memory_used_mb / 1024, // Convert to GB
          keys: data.total_keys || enrichedCacheTypes.reduce((sum, c) => sum + (c.keys || 0), 0),
          costSavings: 0, // TODO: Calculate from actual data
          avgHitRate: data.hit_rate || 0,
          enabledCount: enrichedCacheTypes.filter(c => c.enabled).length,
        };
        setTotalStats(stats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cache types:', error);
      setLoading(false);
    }
  };

  const getCacheIcon = (id) => {
    const icons = {
      sql_generation: <QueryIcon />,
      schema: <StorageIcon />,
      embedding: <MemoryIcon />,
      validation: <CheckCircleIcon />,
    };
    return icons[id] || <CachedIcon />;
  };

  const getCacheColor = (id) => {
    const colors = {
      sql_generation: '#00357a',
      schema: '#4caf50',
      embedding: '#9c27b0',
      validation: '#ff9800',
    };
    return colors[id] || '#00bcd4';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Cache size distribution for pie chart (based on number of keys)
  const cacheDistribution = cacheTypes.map(cache => ({
    name: cache.name,
    value: cache.keys || 0,
    color: cache.color,
  }));

  const handleClearCache = async (cacheType) => {
    setClearing(true);
    try {
      const response = await fetch(
        `/api/v1/control-center/cache/${cacheType.id}`,
        { method: 'DELETE' }
      );
      const data = await response.json();

      if (data.success) {
        alert(`${data.message}`);
        // Refresh cache types
        await fetchCacheTypes();
      } else {
        alert(`Error: ${data.detail || 'Failed to clear cache'}`);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Error clearing cache');
    } finally {
      setClearing(false);
      setClearDialogOpen(false);
    }
  };

  const handleWarmCache = async () => {
    setWarming(true);
    // Simulate cache warming
    setTimeout(() => {
      setWarming(false);
      setWarmingDialogOpen(false);
      alert('Cache warming completed successfully');
    }, 5000);
  };

  const handleEditCache = (cache) => {
    setSelectedCache(cache);
    setDialogOpen(true);
  };

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
            Cache Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and manage Redis cache layers for optimal performance
          </Typography>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {totalStats.size.toFixed(1)} GB
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Cache Size
                  </Typography>
                </Box>
                <StorageIcon sx={{ fontSize: 40, color: 'primary.light' }} />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(totalStats.size / 8) * 100} // Assuming 8GB Redis limit
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary">
                {((totalStats.size / 8) * 100).toFixed(1)}% of 8 GB limit
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {totalStats.avgHitRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Hit Rate
                  </Typography>
                </Box>
                <SpeedIcon sx={{ fontSize: 40, color: 'success.light' }} />
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ mt: 2 }}>
                {cacheTypes.filter(c => c.enabled).map(cache => (
                  <Tooltip key={cache.id} title={`${cache.name}: ${cache.hitRate}%`}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: cache.hitRate > 80 ? 'success.main' : 'warning.main',
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {(totalStats.keys / 1000).toFixed(1)}K
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cached Keys
                  </Typography>
                </Box>
                <CachedIcon sx={{ fontSize: 40, color: 'info.light' }} />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                <TrendingUpIcon fontSize="small" color="success" />
                <Typography variant="body2" color="success.main">
                  +12% from last week
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    ${(totalStats.costSavings / 1000).toFixed(1)}K
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Savings
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'success.light' }} />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                From reduced API calls and queries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cache Performance Chart */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cache Performance (24h)
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="time" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="hits"
                    stackId="1"
                    stroke={theme.palette.success.main}
                    fill={alpha(theme.palette.success.main, 0.8)}
                    name="Cache Hits"
                  />
                  <Area
                    type="monotone"
                    dataKey="misses"
                    stackId="1"
                    stroke={theme.palette.error.main}
                    fill={alpha(theme.palette.error.main, 0.8)}
                    name="Cache Misses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cache Size Distribution
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cacheDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cacheDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Cache Types Management */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cache Configuration
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {cacheTypes.map((cache) => (
            <Grid item xs={12} md={6} lg={4} key={cache.id}>
              <Card
                sx={{
                  border: '1px solid',
                  borderColor: cache.enabled ? alpha(cache.color, 0.3) : 'divider',
                  bgcolor: cache.enabled ? alpha(cache.color, 0.02) : 'background.paper',
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: alpha(cache.color, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: cache.color,
                        }}
                      >
                        {cache.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {cache.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cache.description}
                        </Typography>
                      </Box>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={cache.enabled}
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: cache.color,
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: cache.color,
                            },
                          }}
                        />
                      }
                      label=""
                    />
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Size
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {cache.size}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Keys
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {cache.keys.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Hit Rate
                        </Typography>
                        <Typography variant="body2" fontWeight={500} color={cache.hitRate > 80 ? 'success.main' : 'warning.main'}>
                          {cache.hitRate}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          TTL
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {cache.ttl_seconds > 86400 ? `${Math.round(cache.ttl_seconds / 86400)}d` : `${Math.round(cache.ttl_seconds / 3600)}h`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Popular Queries */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Popular Cached Queries
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Query</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Avg Time (s)</TableCell>
                <TableCell align="right">Cache Hits</TableCell>
                <TableCell align="right">Hit Rate</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {popularQueries
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((query, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {query.query}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{query.count}</TableCell>
                    <TableCell align="right">{query.avgTime}</TableCell>
                    <TableCell align="right">{query.cacheHits}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${((query.cacheHits / query.count) * 100).toFixed(0)}%`}
                        size="small"
                        color={query.cacheHits / query.count > 0.8 ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={popularQueries.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Edit Cache Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Configure {selectedCache?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="TTL (seconds)"
              type="number"
              defaultValue={selectedCache?.ttl_seconds}
              helperText="Time to live for cached entries"
            />
            <TextField
              fullWidth
              label="Max Keys"
              type="number"
              defaultValue="100000"
              helperText="Maximum number of keys to store"
            />
            <TextField
              fullWidth
              label="Max Memory (MB)"
              type="number"
              defaultValue="2048"
              helperText="Maximum memory allocation"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable compression"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable eviction when full"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Clear Cache Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>
          Clear {selectedCache ? selectedCache.name : 'All'} Cache
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action will remove all cached entries{selectedCache ? ` for ${selectedCache.name}` : ' from all cache types'}. 
            This may temporarily impact performance as the cache rebuilds.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleClearCache(selectedCache)}
            disabled={clearing}
            startIcon={clearing ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {clearing ? 'Clearing...' : 'Clear Cache'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Warm Cache Dialog */}
      <Dialog open={warmingDialogOpen} onClose={() => setWarmingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Warm Cache
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Alert severity="info">
              Cache warming pre-loads frequently used queries to improve performance.
            </Alert>
            <FormControl fullWidth>
              <InputLabel>Cache Type</InputLabel>
              <Select defaultValue="all" label="Cache Type">
                <MenuItem value="all">All Cache Types</MenuItem>
                {cacheTypes.map(cache => (
                  <MenuItem key={cache.id} value={cache.id}>{cache.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Query Limit"
              type="number"
              defaultValue="100"
              helperText="Number of popular queries to pre-load"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Include related queries"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarmingDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleWarmCache}
            disabled={warming}
            startIcon={warming ? <CircularProgress size={16} /> : <PlayIcon />}
          >
            {warming ? 'Warming Cache...' : 'Start Warming'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CacheManagement;