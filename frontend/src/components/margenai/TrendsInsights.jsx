import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Divider,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Breadcrumbs,
  Link,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ChartIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useTrendsInsights } from '../../hooks/useMargenData';

const TrendsInsights = ({ onBack }) => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [monthsBack, setMonthsBack] = useState(12);
  const [activeTab, setActiveTab] = useState(0);

  const { data, loading, error, refetch } = useTrendsInsights(monthsBack);

  const trendsData = data?.trends_data || null;
  const insightsData = data?.insights || null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Calculate trend summaries
  const trendSummaries = useMemo(() => {
    if (!trendsData?.monthly_trends?.length) return {};

    const trends = trendsData.monthly_trends;
    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];

    if (!latest || !previous) return {};

    const revenueChange = ((latest.revenue - previous.revenue) / Math.abs(previous.revenue) * 100);
    const marginChange = ((latest.margin_percentage - previous.margin_percentage));
    const customerChange = ((latest.customers - previous.customers) / previous.customers * 100);

    return {
      revenueChange,
      marginChange,
      customerChange,
      latestRevenue: latest.revenue,
      latestMargin: latest.margin_percentage,
      latestCustomers: latest.customers,
      totalPeriods: trends.length
    };
  }, [trendsData]);

  const renderMonthlyTrends = () => {
    if (!trendsData?.monthly_trends?.length) {
      return (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
          No monthly trends data available for the selected period.
        </Typography>
      );
    }

    return (
      <Grid container spacing={3}>
        {/* Trend Summary Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h5" fontWeight={600} color="success.main">
                        ${trendSummaries.latestRevenue?.toLocaleString() || '0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Latest Month Revenue
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                        {trendSummaries.revenueChange > 0 ? (
                          <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : (
                          <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                        )}
                        <Typography 
                          variant="caption" 
                          color={trendSummaries.revenueChange > 0 ? 'success.main' : 'error.main'}
                          fontWeight={600}
                        >
                          {Math.abs(trendSummaries.revenueChange || 0).toFixed(1)}% vs prev month
                        </Typography>
                      </Stack>
                    </Box>
                    <ChartIcon sx={{ fontSize: 40, color: 'success.light' }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h5" fontWeight={600} color="primary">
                        {trendSummaries.latestMargin?.toFixed(1) || '0.0'}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Latest Margin %
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                        {trendSummaries.marginChange > 0 ? (
                          <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : (
                          <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                        )}
                        <Typography 
                          variant="caption" 
                          color={trendSummaries.marginChange > 0 ? 'success.main' : 'error.main'}
                          fontWeight={600}
                        >
                          {Math.abs(trendSummaries.marginChange || 0).toFixed(1)}pp vs prev month
                        </Typography>
                      </Stack>
                    </Box>
                    <TimelineIcon sx={{ fontSize: 40, color: 'primary.light' }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h5" fontWeight={600}>
                        {trendSummaries.latestCustomers?.toLocaleString() || '0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Customers
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                        {trendSummaries.customerChange > 0 ? (
                          <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : (
                          <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                        )}
                        <Typography 
                          variant="caption" 
                          color={trendSummaries.customerChange > 0 ? 'success.main' : 'error.main'}
                          fontWeight={600}
                        >
                          {Math.abs(trendSummaries.customerChange || 0).toFixed(1)}% vs prev month
                        </Typography>
                      </Stack>
                    </Box>
                    <AnalyticsIcon sx={{ fontSize: 40, color: 'info.light' }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h5" fontWeight={600} color="primary">
                        {trendSummaries.totalPeriods}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Analysis Periods
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {monthsBack} months of data
                      </Typography>
                    </Box>
                    <CalendarIcon sx={{ fontSize: 40, color: 'primary.light' }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Monthly Trends Table */}
        <Grid item xs={12}>
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600}>
                Monthly Performance Trends
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {trendsData.monthly_trends.length} months of historical performance data
              </Typography>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#fafafa' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Period</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Revenue</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Margin</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Margin %</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Customers</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Products</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Avg Order</th>
                  </tr>
                </thead>
                <tbody>
                  {trendsData.monthly_trends.map((trend, index) => (
                    <tr key={trend.period} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2" fontWeight={500}>
                          {trend.period}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2" color="success.main" fontWeight={500}>
                          ${trend.revenue?.toLocaleString() || '0'}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Typography 
                          variant="body2" 
                          color={trend.margin > 0 ? 'success.main' : 'error.main'}
                          fontWeight={500}
                        >
                          ${trend.margin?.toLocaleString() || '0'}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Chip
                          label={`${trend.margin_percentage?.toFixed(1) || '0.0'}%`}
                          size="small"
                          color={trend.margin_percentage > 20 ? 'success' : trend.margin_percentage > 10 ? 'warning' : 'error'}
                          variant="outlined"
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2">
                          {trend.customers?.toLocaleString() || '0'}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2">
                          {trend.products?.toLocaleString() || '0'}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2">
                          ${trend.avg_order_value?.toFixed(2) || '0.00'}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderInsights = () => {
    if (!insightsData) {
      return (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
          No insights data available.
        </Typography>
      );
    }

    return (
      <Grid container spacing={3}>
        {/* Key Insights Cards */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Top Performing Segment
              </Typography>
              {insightsData.top_performing_segment ? (
                <Box>
                  <Typography variant="h5" color="primary" fontWeight={600}>
                    {insightsData.top_performing_segment.segment_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Revenue: ${insightsData.top_performing_segment.total_revenue?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color={insightsData.top_performing_segment.avg_margin_percentage > 0 ? 'success.main' : 'error.main'}>
                    Margin: {insightsData.top_performing_segment.avg_margin_percentage?.toFixed(1)}%
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Highest Margin Segment
              </Typography>
              {insightsData.highest_margin_segment ? (
                <Box>
                  <Typography variant="h5" color="success.main" fontWeight={600}>
                    {insightsData.highest_margin_segment.segment_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Customers: {insightsData.highest_margin_segment.total_customers?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Margin: {insightsData.highest_margin_segment.avg_margin_percentage?.toFixed(1)}%
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Segment Health Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Segment Health Overview
              </Typography>
              {insightsData.segment_health_summary ? (
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight={600} color="success.main">
                        {insightsData.segment_health_summary.healthy || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Healthy Segments
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight={600} color="info.main">
                        {insightsData.segment_health_summary.stable || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Stable Segments
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight={600} color="warning.main">
                        {insightsData.segment_health_summary.at_risk || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        At Risk Segments
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight={600} color="error.main">
                        {insightsData.segment_health_summary.declining || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Declining Segments
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">No health data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* At Risk Segments */}
        {insightsData.at_risk_segments?.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Segments Requiring Attention
                </Typography>
                <Grid container spacing={2}>
                  {insightsData.at_risk_segments.map((segment, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Box sx={{ p: 2, border: 1, borderColor: 'warning.main', borderRadius: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600} color="warning.main">
                          {segment.rfm_segment}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {segment.segment_health}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Growth: {segment.growth_rate_pct?.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading trends & insights: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              MARGEN.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Trends Analysis
            </Typography>
          </Breadcrumbs>
          {onBack && (
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
              Back to MargenAI
            </Button>
          )}
        </Stack>
      </Box>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Trends & Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Historical performance analysis and predictive insights based on real PostgreSQL data
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={monthsBack}
              label="Time Period"
              onChange={(e) => setMonthsBack(e.target.value)}
            >
              <MenuItem value={3}>3 Months</MenuItem>
              <MenuItem value={6}>6 Months</MenuItem>
              <MenuItem value={12}>12 Months</MenuItem>
              <MenuItem value={18}>18 Months</MenuItem>
              <MenuItem value={24}>24 Months</MenuItem>
            </Select>
          </FormControl>
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

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Monthly Trends" 
            icon={<TimelineIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            label="Performance Insights" 
            icon={<InsightsIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && renderMonthlyTrends()}
        {activeTab === 1 && renderInsights()}
      </Box>
    </Box>
  );
};

export default TrendsInsights;