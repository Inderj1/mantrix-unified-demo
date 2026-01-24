import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  Button,
  Divider,
  Stack,
  Tooltip,
  Tab,
  Tabs,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  AccountTree as AccountTreeIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  CalendarMonth as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  ShowChart as ShowChartIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  BubbleChart as BubbleChartIcon,
  ArrowForward as ArrowForwardIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Scatter, ScatterChart, ZAxis, PieChart, Pie, Cell, RadialBarChart, RadialBar, Treemap } from 'recharts';

const ForecastAIDashboard = ({ onBack }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('quarter');
  const [selectedScenario, setSelectedScenario] = useState('base');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [drillDownDialog, setDrillDownDialog] = useState(null);
  const [expandedMetric, setExpandedMetric] = useState(null);

  // Enhanced forecast data with confidence intervals
  const forecastData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    actual: i < 6 ? 85 + Math.random() * 10 : null,
    forecast: 85 + Math.random() * 15,
    optimistic: 90 + Math.random() * 15,
    pessimistic: 80 + Math.random() * 10,
    confidence: 85 + Math.random() * 10,
  }));

  // Enhanced budget variance data with drill-down
  const budgetVariance = [
    { 
      category: 'Revenue', 
      budget: 100, 
      actual: 108, 
      variance: 8, 
      status: 'positive',
      details: {
        subcategories: [
          { name: 'Product Sales', budget: 70, actual: 78, variance: 8 },
          { name: 'Services', budget: 20, actual: 21, variance: 1 },
          { name: 'Subscriptions', budget: 10, actual: 9, variance: -1 },
        ]
      }
    },
    { 
      category: 'COGS', 
      budget: 60, 
      actual: 58, 
      variance: -2, 
      status: 'positive',
      details: {
        subcategories: [
          { name: 'Raw Materials', budget: 30, actual: 28, variance: -2 },
          { name: 'Labor', budget: 20, actual: 21, variance: 1 },
          { name: 'Overhead', budget: 10, actual: 9, variance: -1 },
        ]
      }
    },
    { 
      category: 'OpEx', 
      budget: 25, 
      actual: 27, 
      variance: 2, 
      status: 'negative',
      details: {
        subcategories: [
          { name: 'Marketing', budget: 10, actual: 12, variance: 2 },
          { name: 'Sales', budget: 8, actual: 8, variance: 0 },
          { name: 'Admin', budget: 7, actual: 7, variance: 0 },
        ]
      }
    },
  ];

  // Enhanced driver analysis with relationships
  const driverData = [
    { 
      driver: 'Market Growth', 
      impact: 75, 
      confidence: 90, 
      trend: 'increasing',
      correlation: 0.82,
      leadTime: '2 months',
      relatedDrivers: ['Competition', 'Economic Conditions']
    },
    { 
      driver: 'Price Changes', 
      impact: 60, 
      confidence: 85, 
      trend: 'stable',
      correlation: 0.71,
      leadTime: '1 month',
      relatedDrivers: ['Competition', 'Cost Structure']
    },
    { 
      driver: 'Competition', 
      impact: -45, 
      confidence: 80, 
      trend: 'decreasing',
      correlation: -0.65,
      leadTime: '3 months',
      relatedDrivers: ['Market Growth', 'Price Changes']
    },
    { 
      driver: 'Seasonality', 
      impact: 30, 
      confidence: 95, 
      trend: 'cyclical',
      correlation: 0.88,
      leadTime: 'Immediate',
      relatedDrivers: ['Inventory', 'Marketing Spend']
    },
    { 
      driver: 'Marketing Spend', 
      impact: 40, 
      confidence: 70, 
      trend: 'increasing',
      correlation: 0.58,
      leadTime: '2 months',
      relatedDrivers: ['Revenue', 'Customer Acquisition']
    },
  ];

  // Strategic scenarios with detailed breakdown
  const scenarios = [
    { 
      name: 'Base Case', 
      revenue: 450, 
      profit: 67.5, 
      growth: 8, 
      probability: 60,
      assumptions: [
        'Market growth continues at current pace',
        'No major competitive threats',
        'Supply chain remains stable'
      ],
      risks: ['Economic downturn', 'New competitor entry'],
      opportunities: ['Digital expansion', 'New product launch']
    },
    { 
      name: 'Expansion', 
      revenue: 520, 
      profit: 78, 
      growth: 15, 
      probability: 25,
      assumptions: [
        'Successful new market entry',
        'Product launch exceeds expectations',
        'Increased marketing effectiveness'
      ],
      risks: ['Execution risk', 'Market saturation'],
      opportunities: ['Strategic partnerships', 'M&A targets']
    },
    { 
      name: 'Conservative', 
      revenue: 420, 
      profit: 58.8, 
      growth: 5, 
      probability: 15,
      assumptions: [
        'Economic headwinds persist',
        'Increased competition',
        'Supply chain disruptions'
      ],
      risks: ['Revenue decline', 'Margin pressure'],
      opportunities: ['Cost optimization', 'Market consolidation']
    },
  ];

  // Executive insights with action items
  const insights = [
    { 
      id: 'INS-001',
      type: 'opportunity', 
      title: 'Q2 Revenue Acceleration', 
      description: 'Early indicators show 12% above forecast driven by new customer acquisition',
      impact: '+$2.3M', 
      confidence: 'High',
      timeframe: 'Next 30 days',
      actions: [
        'Increase inventory for high-demand SKUs',
        'Accelerate hiring in customer success',
        'Expand credit facilities'
      ],
      relatedMetrics: ['CAC', 'LTV', 'Churn Rate']
    },
    { 
      id: 'INS-002',
      type: 'risk', 
      title: 'Supply Chain Pressure', 
      description: 'Rising transportation costs and port delays may impact Q3 margins by 2-3%',
      impact: '-$1.2M', 
      confidence: 'Medium',
      timeframe: '60-90 days',
      actions: [
        'Lock in freight contracts',
        'Diversify supplier base',
        'Build safety stock'
      ],
      relatedMetrics: ['Inventory Turns', 'Lead Time', 'COGS']
    },
    { 
      id: 'INS-003',
      type: 'recommendation', 
      title: 'Invest in Digital Channel', 
      description: 'ROI analysis shows 3.2x return on digital marketing spend vs traditional',
      impact: '+$4.5M', 
      confidence: 'High',
      timeframe: '6 months',
      actions: [
        'Reallocate 30% of marketing budget',
        'Hire digital marketing team',
        'Implement attribution tracking'
      ],
      relatedMetrics: ['CAC by Channel', 'Conversion Rate', 'ROAS']
    },
  ];

  const getInsightIcon = (type) => {
    switch (type) {
      case 'opportunity': return <TrendingUpIcon sx={{ color: 'success.main' }} />;
      case 'risk': return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'recommendation': return <LightbulbIcon sx={{ color: 'info.main' }} />;
      default: return <InfoIcon />;
    }
  };

  // Color palette for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Detailed KPI breakdown
  const kpiBreakdown = {
    revenue: {
      current: 245.8,
      target: 250,
      ytd: 245.8,
      qtd: 82.3,
      mtd: 28.7,
      breakdown: [
        { segment: 'Enterprise', value: 147.5, percentage: 60 },
        { segment: 'Mid-Market', value: 73.7, percentage: 30 },
        { segment: 'SMB', value: 24.6, percentage: 10 },
      ]
    },
    profitMargin: {
      current: 15.2,
      target: 15.0,
      trend: [14.8, 14.9, 15.0, 15.1, 15.2],
      drivers: [
        { name: 'Price Optimization', impact: 0.3 },
        { name: 'Cost Reduction', impact: 0.2 },
        { name: 'Mix Shift', impact: -0.1 },
      ]
    }
  };

  const handleDrillDown = (type, data) => {
    setDrillDownDialog({ type, data });
  };

  const renderDrillDownDialog = () => {
    if (!drillDownDialog) return null;

    return (
      <Dialog
        open={!!drillDownDialog}
        onClose={() => setDrillDownDialog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {drillDownDialog.type} - Detailed Analysis
        </DialogTitle>
        <DialogContent>
          {drillDownDialog.type === 'budget' && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {drillDownDialog.data.category} Breakdown
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subcategory</TableCell>
                      <TableCell align="right">Budget</TableCell>
                      <TableCell align="right">Actual</TableCell>
                      <TableCell align="right">Variance</TableCell>
                      <TableCell align="right">%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {drillDownDialog.data.details.subcategories.map((sub) => (
                      <TableRow key={sub.name}>
                        <TableCell>{sub.name}</TableCell>
                        <TableCell align="right">${sub.budget}M</TableCell>
                        <TableCell align="right">${sub.actual}M</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${sub.variance > 0 ? '+' : ''}${sub.variance}M`}
                            size="small"
                            color={sub.variance >= 0 ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {((sub.variance / sub.budget) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          {drillDownDialog.type === 'insight' && (
            <Box>
              <Alert severity={drillDownDialog.data.type === 'risk' ? 'warning' : 'info'} sx={{ mb: 2 }}>
                <AlertTitle>{drillDownDialog.data.title}</AlertTitle>
                {drillDownDialog.data.description}
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Impact</Typography>
                  <Typography variant="h6">{drillDownDialog.data.impact}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Timeframe</Typography>
                  <Typography variant="h6">{drillDownDialog.data.timeframe}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Recommended Actions
                  </Typography>
                  <List dense>
                    {drillDownDialog.data.actions.map((action, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <CheckCircleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={action} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Related Metrics to Monitor
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {drillDownDialog.data.relatedMetrics.map((metric) => (
                      <Chip key={metric} label={metric} size="small" />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          )}
          {drillDownDialog.type === 'driver' && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {drillDownDialog.data.driver} - Impact Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Statistical Correlation
                      </Typography>
                      <Typography variant="h4">
                        {drillDownDialog.data.correlation}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.abs(drillDownDialog.data.correlation) * 100} 
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Lead Time
                      </Typography>
                      <Typography variant="h4">
                        {drillDownDialog.data.leadTime}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Time to impact revenue
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Related Drivers
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {drillDownDialog.data.relatedDrivers.map((driver) => (
                      <Chip key={driver} label={driver} variant="outlined" />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrillDownDialog(null)}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export Analysis
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header - Modern Light Theme */}
      <Paper sx={{ 
        p: 3, 
        background: '#ffffff',
        borderRadius: 2,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {onBack && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#6b7280', 
                    cursor: 'pointer',
                    '&:hover': { color: '#4b5563' }
                  }}
                  onClick={onBack}
                >
                  AXIS.AI
                </Typography>
                <Typography variant="body1" sx={{ color: '#9ca3af' }}>
                  →
                </Typography>
                <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600 }}>
                  FORECAST.AI
                </Typography>
              </Box>
            )}
            <TimelineIcon sx={{ fontSize: 32, color: '#9333ea' }} />
            <Box>
              <Typography variant="h5" sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: '#111827',
                fontWeight: 700,
                letterSpacing: '-0.025em'
              }}>
                FORECAST.AI | Predictive Analytics & Forecasting
                <Chip label="PROTOTYPE" size="small" sx={{ 
                  bgcolor: '#fef3c7', 
                  color: '#d97706',
                  fontWeight: 600,
                  border: '1px solid #fde68a'
                }} />
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Executive Intelligence & Strategic Planning System
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1a5a9e' }
                }}
              >
                <MenuItem value="month">Monthly</MenuItem>
                <MenuItem value="quarter">Quarterly</MenuItem>
                <MenuItem value="year">Annual</MenuItem>
              </Select>
            </FormControl>
            <IconButton sx={{ 
              color: '#374151',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              '&:hover': { background: '#e5e7eb' }
            }}>
              <ShareIcon />
            </IconButton>
            <IconButton sx={{ 
              color: '#374151',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              '&:hover': { background: '#e5e7eb' }
            }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Executive Dashboard" />
          <Tab label="Forecasting & Prediction" />
          <Tab label="Budget & Variance" />
          <Tab label="Scenario Planning" />
          <Tab label="Driver Analysis" />
        </Tabs>
      </Paper>

      {/* Executive Dashboard */}
      {activeTab === 0 && (
        <Grid container spacing={3} sx={{ flex: 1 }}>
          {/* KPI Cards with Drill-down */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setExpandedMetric('revenue')}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography color="text.secondary" gutterBottom>
                        Revenue YTD
                      </Typography>
                      <Chip size="small" label="+12%" color="success" />
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      $245.8M
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      vs. $219.4M last year
                    </Typography>
                    {expandedMetric === 'revenue' && (
                      <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 1 }} />
                        <Typography variant="caption" display="block">QTD: $82.3M</Typography>
                        <Typography variant="caption" display="block">MTD: $28.7M</Typography>
                        <Button size="small" onClick={(e) => {
                          e.stopPropagation();
                          handleDrillDown('revenue', kpiBreakdown.revenue);
                        }}>
                          View Details
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setExpandedMetric('margin')}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography color="text.secondary" gutterBottom>
                        Profit Margin
                      </Typography>
                      <Chip size="small" label="+0.8%" color="success" />
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      15.2%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Target: 15.0%
                    </Typography>
                    {expandedMetric === 'margin' && (
                      <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 1 }} />
                        <ResponsiveContainer width="100%" height={50}>
                          <LineChart data={kpiBreakdown.profitMargin.trend.map((v, i) => ({ value: v }))}>
                            <Line type="monotone" dataKey="value" stroke="#9C27B0" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography color="text.secondary" gutterBottom>
                        Cash Flow
                      </Typography>
                      <Chip size="small" label="-5%" color="warning" />
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      $67.3M
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      45 days runway
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography color="text.secondary" gutterBottom>
                        Forecast Accuracy
                      </Typography>
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      94.2%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Best in class
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Executive Insights with Actions */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Strategic Insights
                </Typography>
                <IconButton size="small">
                  <SettingsIcon />
                </IconButton>
              </Box>
              <Stack spacing={2}>
                {insights.map((insight) => (
                  <Alert
                    key={insight.id}
                    severity={insight.type === 'opportunity' ? 'success' : insight.type === 'risk' ? 'warning' : 'info'}
                    icon={getInsightIcon(insight.type)}
                    action={
                      <Button 
                        size="small" 
                        onClick={() => handleDrillDown('insight', insight)}
                      >
                        Details
                      </Button>
                    }
                  >
                    <AlertTitle>{insight.title}</AlertTitle>
                    <Typography variant="body2">{insight.description}</Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                      <Chip label={`Impact: ${insight.impact}`} size="small" />
                      <Chip label={`Confidence: ${insight.confidence}`} size="small" variant="outlined" />
                    </Box>
                  </Alert>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Performance Trend with Drill-down */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Revenue Trend & Forecast
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small">
                    <ShowChartIcon />
                  </IconButton>
                  <IconButton size="small">
                    <DownloadIcon />
                  </IconButton>
                </Stack>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="confidence" fill="#E1BEE7" stroke="none" fillOpacity={0.3} />
                  <Line type="monotone" dataKey="actual" stroke="#4285F4" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="forecast" stroke="#9C27B0" strokeWidth={2} strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Forecasting Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3} sx={{ flex: 1 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Multi-Scenario Revenue Forecast
                </Typography>
                <Stack direction="row" spacing={2}>
                  <FormControl size="small">
                    <InputLabel>Scenario</InputLabel>
                    <Select
                      value={selectedScenario}
                      onChange={(e) => setSelectedScenario(e.target.value)}
                      label="Scenario"
                    >
                      <MenuItem value="base">Base Case</MenuItem>
                      <MenuItem value="optimistic">Optimistic</MenuItem>
                      <MenuItem value="pessimistic">Pessimistic</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="outlined" size="small">
                    Adjust Assumptions
                  </Button>
                </Stack>
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#4285F4" strokeWidth={3} name="Actual" />
                  <Line type="monotone" dataKey="forecast" stroke="#9C27B0" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                  <Line type="monotone" dataKey="optimistic" stroke="#4CAF50" strokeWidth={1} strokeDasharray="3 3" name="Optimistic" />
                  <Line type="monotone" dataKey="pessimistic" stroke="#FF5722" strokeWidth={1} strokeDasharray="3 3" name="Pessimistic" />
                </LineChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Alert severity="info">
                      <AlertTitle>Forecast Confidence</AlertTitle>
                      Current model confidence: 94.2%
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Alert severity="success">
                      <AlertTitle>Key Driver</AlertTitle>
                      Market growth contributing +5.2%
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Alert severity="warning">
                      <AlertTitle>Risk Factor</AlertTitle>
                      Supply chain uncertainty -2.1%
                    </Alert>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Budget & Variance Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3} sx={{ flex: 1 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Budget Variance Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={budgetVariance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="budget" fill="#E1BEE7" name="Budget" />
                  <Bar dataKey="actual" fill="#9C27B0" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Click on any category for detailed breakdown
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Variance Summary
              </Typography>
              <Stack spacing={2}>
                {budgetVariance.map((item) => (
                  <Card 
                    key={item.category}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleDrillDown('budget', item)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{item.category}</Typography>
                        <Chip
                          size="small"
                          label={`${item.variance > 0 ? '+' : ''}${item.variance}%`}
                          color={item.status === 'positive' ? 'success' : 'error'}
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((item.actual / item.budget) * 100, 100)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: item.status === 'positive' ? 'success.main' : 'error.main',
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        ${item.actual}M / ${item.budget}M
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Scenario Analysis Tab */}
      {activeTab === 3 && (
        <Grid container spacing={3} sx={{ flex: 1 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Strategic Scenario Comparison
              </Typography>
              <Grid container spacing={3}>
                {scenarios.map((scenario) => (
                  <Grid item xs={12} md={4} key={scenario.name}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{scenario.name}</Typography>
                          <Chip 
                            label={`${scenario.probability}% likely`} 
                            size="small"
                            color={scenario.probability > 50 ? 'success' : 'default'}
                          />
                        </Box>
                        
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Revenue</Typography>
                            <Typography variant="h6">${scenario.revenue}M</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Profit</Typography>
                            <Typography variant="h6">${scenario.profit}M</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">Growth Rate</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h6">{scenario.growth}%</Typography>
                              <TrendingUpIcon color="success" />
                            </Box>
                          </Grid>
                        </Grid>

                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body2">Assumptions</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List dense>
                              {scenario.assumptions.map((assumption, idx) => (
                                <ListItem key={idx}>
                                  <ListItemText primary={assumption} />
                                </ListItem>
                              ))}
                            </List>
                          </AccordionDetails>
                        </Accordion>

                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">Key Risks</Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            {scenario.risks.map((risk) => (
                              <Chip key={risk} label={risk} size="small" color="warning" />
                            ))}
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Driver Analysis Tab */}
      {activeTab === 4 && (
        <Grid container spacing={3} sx={{ flex: 1 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Strategic Driver Impact Matrix
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="impact" 
                    name="Impact" 
                    unit="%" 
                    domain={[-100, 100]}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="confidence" 
                    name="Confidence" 
                    unit="%" 
                    domain={[0, 100]}
                  />
                  <ZAxis type="number" range={[100, 500]} />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter 
                    name="Drivers" 
                    data={driverData} 
                    fill="#9C27B0"
                    onClick={(data) => handleDrillDown('driver', data)}
                  >
                    {driverData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.impact > 0 ? '#4CAF50' : '#FF5722'} 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Chip 
                  icon={<TrendingUpIcon />} 
                  label="Positive Impact" 
                  color="success" 
                  size="small" 
                />
                <Chip 
                  icon={<ArrowDownwardIcon />} 
                  label="Negative Impact" 
                  color="error" 
                  size="small" 
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Driver Details
              </Typography>
              <Stack spacing={2}>
                {driverData.map((driver) => (
                  <Card 
                    key={driver.driver}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleDrillDown('driver', driver)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">{driver.driver}</Typography>
                        <Badge
                          badgeContent={
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: driver.trend === 'increasing' ? 'success.main' : 
                                        driver.trend === 'decreasing' ? 'error.main' : 'warning.main',
                              }}
                            />
                          }
                        >
                          <Box />
                        </Badge>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Typography variant="body2">
                          Impact: <strong>{driver.impact}%</strong>
                        </Typography>
                        <Typography variant="body2">
                          Confidence: <strong>{driver.confidence}%</strong>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Drill-down Dialog */}
      {renderDrillDownDialog()}
    </Box>
  );
};

export default ForecastAIDashboard;