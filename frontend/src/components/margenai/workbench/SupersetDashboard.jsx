import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  OpenInNew as OpenInNewIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

// Superset configuration
const SUPERSET_CONFIG = {
  baseUrl: import.meta.env.VITE_SUPERSET_URL || 'https://dev.cloudmantra.ai/superset',
  embedUrl: import.meta.env.VITE_SUPERSET_EMBED_URL || 'https://dev.cloudmantra.ai/superset/dashboard',
  username: import.meta.env.VITE_SUPERSET_USER || 'admin',
  password: import.meta.env.VITE_SUPERSET_PASSWORD || 'admin',
  
  // Dashboard IDs mapped to PostgreSQL analytics
  dashboards: {
    'executive': {
      id: '1',
      name: 'Executive Dashboard',
      description: 'High-level KPIs and business metrics',
      filters: ['date_range', 'segment', 'region'],
    },
    'customer-analytics': {
      id: '2', 
      name: 'Customer Analytics',
      description: 'Customer segmentation and lifetime value analysis',
      filters: ['date_range', 'segment', 'customer_id'],
    },
    'operations': {
      id: '3',
      name: 'Operations Dashboard',
      description: 'Operational metrics and performance (Coming Soon)',
      filters: ['date_range', 'product', 'warehouse'],
    },
    'sales': {
      id: '4',
      name: 'Sales Dashboard', 
      description: 'Sales performance and trends (Coming Soon)',
      filters: ['date_range', 'sales_rep', 'product', 'customer_segment'],
    },
    'seasonal-trends': {
      id: '5',
      name: 'Seasonal Trends',
      description: 'Seasonal patterns and forecasting (Coming Soon)',
      filters: ['year', 'quarter', 'product_category'],
    },
    'product-performance': {
      id: '6',
      name: 'Product Performance',
      description: 'Product analytics and profitability (Coming Soon)',
      filters: ['product_id', 'category', 'date_range'],
    },
  }
};

const SupersetDashboard = ({ dashboardId = 'executive', onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const dashboard = SUPERSET_CONFIG.dashboards[dashboardId] || SUPERSET_CONFIG.dashboards.executive;

  useEffect(() => {
    // Simple loading timeout
    setTimeout(() => setLoading(false), 1500);
  }, [dashboardId]);

  const handleFullscreen = () => {
    if (!fullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleOpenInNew = () => {
    const url = `${SUPERSET_CONFIG.baseUrl}/dashboard/${dashboard.id}`;
    window.open(url, '_blank');
  };

  const applyFilters = () => {
    // Build filter query string
    const filterParams = Object.entries(filters)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    if (iframeRef.current && filterParams) {
      const baseUrl = `${SUPERSET_CONFIG.embedUrl}/${dashboard.id}`;
      iframeRef.current.src = `${baseUrl}?standalone=1&${filterParams}`;
    }
    setSettingsOpen(false);
  };

  // Build iframe URL
  const getIframeUrl = () => {
    // Use the actual dashboard URL with standalone mode for embedding
    let url = `${SUPERSET_CONFIG.baseUrl}/superset/dashboard/${dashboard.id}/?standalone=1`;
    
    // Add any filter parameters
    const filterParams = Object.entries(filters)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    if (filterParams) {
      url += `&${filterParams}`;
    }
    
    return url;
  };

  return (
    <Box ref={containerRef} sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" gutterBottom>
              {dashboard.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dashboard.description}
            </Typography>
            {dashboard.filters && dashboard.filters.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {dashboard.filters.map(filter => (
                  <Chip
                    key={filter}
                    label={filter.replace('_', ' ')}
                    size="small"
                    variant="outlined"
                    icon={<FilterIcon />}
                  />
                ))}
              </Stack>
            )}
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Configure Filters">
              <IconButton onClick={() => setSettingsOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Dashboard">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in New Tab">
              <IconButton onClick={handleOpenInNew}>
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton onClick={handleFullscreen}>
                {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Dashboard Content */}
      <Paper sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
            <Button onClick={loadDashboard} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        {!error && (
          <>
            {/* Superset requires login - provide clear interface to open dashboards */}
            {SUPERSET_CONFIG.baseUrl ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                p: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2
              }}>
                <Paper sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
                  <Typography variant="h4" gutterBottom>
                    {dashboard.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {dashboard.description}
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      This dashboard contains interactive visualizations of your PostgreSQL data including customer segments, revenue metrics, and profitability analysis.
                    </Typography>
                  </Alert>
                  
                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<OpenInNewIcon />}
                      onClick={() => {
                        window.open(`https://dev.cloudmantra.ai/superset/superset/dashboard/${dashboard.id}/`, '_blank');
                      }}
                      sx={{ py: 1.5 }}
                    >
                      Open Dashboard in Superset
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      onClick={() => {
                        window.open('https://dev.cloudmantra.ai/superset/login/', '_blank');
                      }}
                    >
                      Login to Superset First
                    </Button>
                  </Stack>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Credentials: admin / admin
                  </Typography>
                  
                  {dashboard.id === '1' && (
                    <Box sx={{ mt: 3, textAlign: 'left' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Executive Dashboard includes:
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li>Total Revenue & Customer KPIs</li>
                        <li>Customer Segment Distribution</li>
                        <li>Top 10 Products by Revenue</li>
                        <li>Revenue Trends</li>
                      </ul>
                    </Box>
                  )}
                  
                  {dashboard.id === '2' && (
                    <Box sx={{ mt: 3, textAlign: 'left' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Customer Analytics includes:
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li>Customer Lifetime Value Distribution</li>
                        <li>RFM Segmentation Analysis</li>
                        <li>Customer Behavior Patterns</li>
                      </ul>
                    </Box>
                  )}
                </Paper>
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Superset Integration
                  </Typography>
                  <Typography variant="body2" paragraph>
                    This dashboard will display Apache Superset visualizations when configured.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    To enable Superset dashboards:
                  </Typography>
                  <ol style={{ textAlign: 'left', marginTop: 8 }}>
                    <li>Install and configure Apache Superset</li>
                    <li>Connect Superset to your PostgreSQL database</li>
                    <li>Create dashboards and charts in Superset</li>
                    <li>Update VITE_SUPERSET_URL in your .env file</li>
                    <li>Configure guest token authentication for embedding</li>
                  </ol>
                </Alert>
                
                <Button
                  variant="contained"
                  onClick={() => window.open('https://superset.apache.org/docs/installation/installing-superset-using-docker-compose', '_blank')}
                >
                  Superset Documentation
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dashboard Filters</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {dashboard.filters && dashboard.filters.map(filter => (
              <TextField
                key={filter}
                label={filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                fullWidth
                value={filters[filter] || ''}
                onChange={(e) => setFilters({ ...filters, [filter]: e.target.value })}
                variant="outlined"
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button onClick={applyFilters} variant="contained">Apply Filters</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupersetDashboard;