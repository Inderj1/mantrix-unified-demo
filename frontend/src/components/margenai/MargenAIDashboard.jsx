import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  TableView as TableIcon,
  Analytics as AnalyticsIcon,
  ShowChart as TrendsIcon,
  Assessment as SummaryIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Forum as ChatIcon,
  Science as WorkbenchIcon,
} from '@mui/icons-material';

// Import the MargenAI components
import MargenAITable from './MargenAITable';
import SegmentAnalytics from './SegmentAnalytics';
import TrendsInsights from './TrendsInsights';
import MargenAIChat from './MargenAIChat';
import AnalyticsWorkbench from './AnalyticsWorkbench';

const MargenAIDashboard = ({ onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  const tabs = [
    { 
      label: 'Overview', 
      icon: <SummaryIcon />,
      description: 'Key margin metrics and performance indicators'
    },
    { 
      label: 'Product Analysis', 
      icon: <TableIcon />,
      description: 'Interactive product margin analysis with drill-down'
    },
    { 
      label: 'Segment Analytics', 
      icon: <AnalyticsIcon />,
      description: 'Customer segment profitability analysis'
    },
    { 
      label: 'Trends & Insights', 
      icon: <TrendsIcon />,
      description: 'Historical trends and performance insights'
    },
    { 
      label: 'Ask MargenAI', 
      icon: <ChatIcon />,
      description: 'Natural language queries about margin data'
    },
    { 
      label: 'Analytics Workbench', 
      icon: <WorkbenchIcon />,
      description: 'Advanced analytics with Superset visualizations'
    },
  ];

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/margen/summary');
      if (!response.ok) throw new Error('Failed to fetch summary');
      const result = await response.json();
      setSummaryData(result.summary);
    } catch (err) {
      console.error('Error fetching summary data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSummaryData();
    setRefreshing(false);
  };

  const renderOverviewTab = () => {
    if (!summaryData) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {/* Key Metrics Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="primary">
                    {summaryData.total_products?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Products
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'primary.light' }} />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Active in system
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    ${summaryData.total_revenue?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.light' }} />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Across all products
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    ${summaryData.total_margin?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Margin
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'success.light' }} />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  {summaryData.overall_margin_pct?.toFixed(1) || '0.0'}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  margin rate
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {summaryData.total_customers?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customers
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'info.light' }} />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Unique customers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Breakdown */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Profitability Breakdown
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" fontWeight={600} color="success.main">
                      {((summaryData.high_profit_pct || 0)).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High Profit
                    </Typography>
                    <Chip 
                      label=">25% margin" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" fontWeight={600} color="warning.main">
                      {(100 - (summaryData.high_profit_pct || 0) - (summaryData.loss_making_pct || 0)).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Moderate
                    </Typography>
                    <Chip 
                      label="5-25% margin" 
                      size="small" 
                      color="warning" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" fontWeight={600} color="error.main">
                      {(summaryData.loss_making_pct || 0).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Loss Making
                    </Typography>
                    <Chip 
                      label="<0% margin" 
                      size="small" 
                      color="error" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" fontWeight={600}>
                      {summaryData.total_orders?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Orders
                    </Typography>
                    <Chip 
                      label="transactions" 
                      size="small" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Data Period
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {summaryData.data_start_date ? 
                      new Date(summaryData.data_start_date).toLocaleDateString() : 
                      'N/A'
                    }
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {summaryData.data_end_date ? 
                      new Date(summaryData.data_end_date).toLocaleDateString() : 
                      'N/A'
                    }
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Data Source
                  </Typography>
                  <Typography variant="body1" fontWeight={500} color="primary">
                    PostgreSQL Database
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderProductAnalysisTab = () => {
    return <MargenAITable onRowClick={() => {}} />;
  };

  const renderSegmentAnalyticsTab = () => {
    return <SegmentAnalytics />;
  };

  const renderTrendsInsightsTab = () => {
    return <TrendsInsights />;
  };

  const renderChatTab = () => {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <MargenAIChat />
      </Box>
    );
  };

  const renderWorkbenchTab = () => {
    return <AnalyticsWorkbench />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link
                component="button"
                variant="body2"
                onClick={onBack}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <HomeIcon fontSize="small" />
                Home
              </Link>
              <Typography variant="body2" color="text.primary" fontWeight={600}>
                MargenAI Analytics
              </Typography>
            </Breadcrumbs>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              Margin Intelligence Platform
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time profitability analysis powered by PostgreSQL data
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <RefreshIcon sx={{ color: 'primary.main' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs Navigation */}
      <Paper sx={{ borderRadius: 0, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 72,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              px: 3,
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: activeTab === index ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: activeTab === index ? 'white' : 'primary.main',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {tab.icon}
                  </Box>
                  <Box sx={{ textAlign: 'left', display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="body2" fontWeight={600}>
                      {tab.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tab.description}
                    </Typography>
                  </Box>
                </Stack>
              }
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, p: activeTab === 1 ? 0 : activeTab === 2 ? 0 : activeTab === 3 ? 0 : activeTab === 4 ? 0 : activeTab === 5 ? 0 : 3, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 0 && renderOverviewTab()}
          {activeTab === 1 && renderProductAnalysisTab()}
          {activeTab === 2 && renderSegmentAnalyticsTab()}
          {activeTab === 3 && renderTrendsInsightsTab()}
          {activeTab === 4 && renderChatTab()}
          {activeTab === 5 && renderWorkbenchTab()}
        </Box>
      </Box>
    </Box>
  );
};

export default MargenAIDashboard;