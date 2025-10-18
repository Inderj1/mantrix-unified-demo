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
  Badge,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  AccountBalance as AccountBalanceIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Analytics as AnalyticsIcon,
  AutoMode as AutoModeIcon,
  ArrowForward as ArrowForwardIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Lightbulb as LightbulbIcon,
  SupervisorAccount as SupervisorIcon,
  PanTool as ManualIcon,
  Verified as VerifiedIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  AttachMoney as AttachMoneyIcon,
  Group as GroupIcon,
  Build as BuildIcon,
  ThumbUp as ThumbUpIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ComposedChart, Scatter } from 'recharts';

const CoreAIDashboard = () => {
  const [executionMode, setExecutionMode] = useState('supervised');
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedRecommendation, setExpandedRecommendation] = useState(null);
  const [operationDetailDialog, setOperationDetailDialog] = useState(null);
  const [recommendationDrillDown, setRecommendationDrillDown] = useState(null);
  const [processDetailDialog, setProcessDetailDialog] = useState(null);
  const [metricsDrillDown, setMetricsDrillDown] = useState(null);
  
  const [operationsData, setOperationsData] = useState({
    orderToCash: { 
      status: 'monitoring', 
      efficiency: 94, 
      opportunities: 23, 
      potentialValue: '$127K',
      trend: '+5%',
      alerts: 2,
    },
    pricing: { 
      status: 'analyzing', 
      efficiency: 87, 
      opportunities: 45, 
      potentialValue: '$89K',
      trend: '+12%',
      alerts: 5,
    },
    inventory: { 
      status: 'optimizing', 
      efficiency: 91, 
      opportunities: 18, 
      potentialValue: '$234K',
      trend: '-3%',
      alerts: 1,
    },
    margin: { 
      status: 'monitoring', 
      efficiency: 89, 
      opportunities: 31, 
      potentialValue: '$156K',
      trend: '+8%',
      alerts: 3,
    },
    fraud: { 
      status: 'detecting', 
      efficiency: 99.7, 
      opportunities: 3, 
      potentialValue: '$2.1M prevented',
      trend: '0%',
      alerts: 3,
    },
  });

  // Execution modes
  const executionModes = [
    { 
      value: 'manual', 
      label: 'Manual', 
      icon: <ManualIcon />,
      description: 'All recommendations require manual review and approval',
    },
    { 
      value: 'supervised', 
      label: 'Supervised', 
      icon: <SupervisorIcon />,
      description: 'AI assists with pre-approved actions under supervision',
    },
    { 
      value: 'autonomous', 
      label: 'Autonomous', 
      icon: <AutoModeIcon />,
      description: 'AI operates within defined guardrails',
    },
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOperationsData(prev => ({
        ...prev,
        orderToCash: {
          ...prev.orderToCash,
          opportunities: prev.orderToCash.opportunities + Math.floor(Math.random() * 3),
          efficiency: Math.min(100, prev.orderToCash.efficiency + (Math.random() - 0.5) * 2),
        },
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Detailed recommendations
  const recommendations = {
    orderToCash: [
      {
        id: 'O2C-001',
        title: 'Accelerate Payment Terms',
        description: 'Offer 2% discount for payments within 10 days',
        impact: '$45K improved cash flow',
        confidence: '92%',
        effort: 'Low',
        timeframe: '1-2 days',
        requirements: ['Finance approval', 'Customer communication'],
        status: executionMode === 'autonomous' ? 'auto-approved' : 'pending',
      },
      {
        id: 'O2C-002',
        title: 'Automate Invoice Processing',
        description: 'Implement OCR for invoice capture and validation',
        impact: 'Save 120 hours/month',
        confidence: '88%',
        effort: 'Medium',
        timeframe: '2 weeks',
        requirements: ['IT resources', 'Process mapping'],
        status: 'pending',
      },
    ],
    pricing: [
      {
        id: 'PRC-001',
        title: 'Dynamic Bundle Pricing',
        description: 'Create product bundles for slow-moving items',
        impact: '+$32K revenue',
        confidence: '85%',
        effort: 'Low',
        timeframe: '3 days',
        requirements: ['Marketing approval', 'System update'],
        status: 'under review',
      },
      {
        id: 'PRC-002',
        title: 'Competitor Price Adjustment',
        description: 'Adjust prices for 127 SKUs based on market analysis',
        impact: '+$57K margin',
        confidence: '91%',
        effort: 'Medium',
        timeframe: '1 week',
        requirements: ['Legal review', 'Market validation'],
        status: executionMode === 'autonomous' ? 'auto-approved' : 'pending',
      },
    ],
  };

  // Performance metrics over time
  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    efficiency: 85 + Math.random() * 10,
    opportunities: Math.floor(20 + Math.random() * 30),
    value: Math.floor(50 + Math.random() * 100),
  }));

  // Process optimization data
  const processOptimization = [
    { process: 'Order Entry', current: 4.2, optimized: 2.1, unit: 'min' },
    { process: 'Credit Check', current: 24, optimized: 8, unit: 'hrs' },
    { process: 'Fulfillment', current: 3.5, optimized: 2.8, unit: 'days' },
    { process: 'Invoice to Payment', current: 45, optimized: 30, unit: 'days' },
  ];

  // Working capital components
  const workingCapitalData = [
    { name: 'DSO', value: 45, target: 38, color: '#4285F4' },
    { name: 'DPO', value: 32, target: 40, color: '#34A853' },
    { name: 'DIO', value: 28, target: 25, color: '#FBBC04' },
  ];

  const renderOperationCard = (title, icon, data, color, key) => (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s',
        border: selectedOperation === key ? `2px solid ${color}` : '1px solid transparent',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
      onClick={() => setSelectedOperation(key)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color, display: 'flex' }}>{icon}</Box>
            <Typography variant="h6" fontWeight="bold">{title}</Typography>
          </Box>
          {data.alerts > 0 && (
            <Badge badgeContent={data.alerts} color="error">
              <InfoIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            </Badge>
          )}
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Efficiency</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="h6" fontWeight="bold">{data.efficiency}%</Typography>
              <Chip label={data.trend} size="small" sx={{ fontSize: '0.7rem' }} />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Opportunities</Typography>
            <Typography variant="h6" fontWeight="bold">{data.opportunities}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">Potential Value</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color }}>
              {data.potentialValue}
            </Typography>
          </Grid>
        </Grid>
        
        <LinearProgress
          variant="determinate"
          value={data.efficiency}
          sx={{
            mt: 2,
            height: 6,
            borderRadius: 3,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              bgcolor: color,
            },
          }}
        />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #4285F4 0%, #5E97F6 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AnalyticsIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                CORE.AI | Operational Intelligence
                <Chip label="DEMO" size="small" color="warning" sx={{ bgcolor: '#FF9800', color: 'white' }} />
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Real-time ERP optimization and recommendation engine
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              value={executionMode}
              exclusive
              onChange={(e, v) => v && setExecutionMode(v)}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}
            >
              {executionModes.map((mode) => (
                <ToggleButton 
                  key={mode.value} 
                  value={mode.value}
                  sx={{ 
                    color: 'white',
                    '&.Mui-selected': { 
                      bgcolor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                    }
                  }}
                >
                  <Tooltip title={mode.description}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {mode.icon}
                      {mode.label}
                    </Box>
                  </Tooltip>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <IconButton sx={{ color: 'white' }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Operations Overview" />
          <Tab label="Recommendations" />
          <Tab label="Process Analytics" />
          <Tab label="Performance Insights" />
        </Tabs>
      </Paper>

      {/* Operations Overview Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3} sx={{ flex: 1 }}>
          {/* Operation Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2.4}>
                {renderOperationCard('Order-to-Cash', <MoneyIcon />, operationsData.orderToCash, '#4285F4', 'orderToCash')}
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                {renderOperationCard('Dynamic Pricing', <TrendingUpIcon />, operationsData.pricing, '#34A853', 'pricing')}
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                {renderOperationCard('Inventory Mgmt', <InventoryIcon />, operationsData.inventory, '#FBBC04', 'inventory')}
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                {renderOperationCard('Margin Analysis', <AccountBalanceIcon />, operationsData.margin, '#EA4335', 'margin')}
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                {renderOperationCard('Fraud Detection', <SecurityIcon />, operationsData.fraud, '#9C27B0', 'fraud')}
              </Grid>
            </Grid>
          </Grid>

          {/* Key Metrics */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Operational Performance Trends
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <ComposedChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="value" fill="#4285F4" stroke="#4285F4" fillOpacity={0.2} name="Value Created ($K)" />
                  <Line yAxisId="left" type="monotone" dataKey="efficiency" stroke="#34A853" strokeWidth={2} name="Efficiency %" />
                  <Bar yAxisId="right" dataKey="opportunities" fill="#FBBC04" name="Opportunities" />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Working Capital Metrics */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Working Capital Optimization
              </Typography>
              <Box sx={{ mt: 3 }}>
                {workingCapitalData.map((metric) => (
                  <Box key={metric.name} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{metric.name}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {metric.value} days (Target: {metric.target})
                      </Typography>
                    </Box>
                    <Box sx={{ position: 'relative' }}>
                      <LinearProgress
                        variant="determinate"
                        value={(metric.value / metric.target) * 100}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: metric.value <= metric.target ? metric.color : '#EA4335',
                          },
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `${100}%`,
                          top: -2,
                          width: 2,
                          height: 14,
                          bgcolor: 'text.primary',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Alert severity="success" icon={<TrendingUpIcon />}>
                <AlertTitle>Cash Cycle Improvement</AlertTitle>
                15 days faster than industry average
              </Alert>
            </Paper>
          </Grid>

          {/* Process Optimization */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Process Optimization Opportunities
              </Typography>
              <Grid container spacing={3}>
                {processOptimization.map((process) => (
                  <Grid item xs={12} sm={6} md={3} key={process.process}>
                    <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {process.process}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Current</Typography>
                          <Typography variant="h6">{process.current} {process.unit}</Typography>
                        </Box>
                        <ArrowForwardIcon sx={{ color: 'primary.main' }} />
                        <Box>
                          <Typography variant="caption" color="success.main">Optimized</Typography>
                          <Typography variant="h6" color="success.main">
                            {process.optimized} {process.unit}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={`${Math.round(((process.current - process.optimized) / process.current) * 100)}% improvement`}
                        size="small"
                        color="success"
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Recommendations Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3} sx={{ flex: 1 }}>
          <Grid item xs={12}>
            <Alert 
              severity={executionMode === 'autonomous' ? 'success' : 'info'}
              icon={executionMode === 'autonomous' ? <VerifiedIcon /> : <InfoIcon />}
              sx={{ mb: 2 }}
            >
              <AlertTitle>
                {executionMode === 'autonomous' 
                  ? 'Autonomous Mode - Executing pre-approved optimizations within guardrails'
                  : executionMode === 'supervised'
                  ? 'Supervised Mode - AI recommendations with human oversight'
                  : 'Manual Mode - All recommendations require approval'}
              </AlertTitle>
              Total opportunity identified: $4.2M across 119 recommendations
            </Alert>
          </Grid>

          {selectedOperation && recommendations[selectedOperation] ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                  {selectedOperation.charAt(0).toUpperCase() + selectedOperation.slice(1)} Recommendations
                </Typography>
                <Button onClick={() => setSelectedOperation(null)}>
                  View All Operations
                </Button>
              </Box>
              <Grid container spacing={3}>
                {recommendations[selectedOperation].map((rec) => (
                  <Grid item xs={12} md={6} key={rec.id}>
                    <Accordion
                      expanded={expandedRecommendation === rec.id}
                      onChange={() => setExpandedRecommendation(
                        expandedRecommendation === rec.id ? null : rec.id
                      )}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {rec.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rec.description}
                            </Typography>
                          </Box>
                          <Chip
                            label={rec.status}
                            size="small"
                            color={rec.status === 'auto-approved' ? 'success' : 'default'}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Impact</Typography>
                            <Typography variant="body2" fontWeight="bold">{rec.impact}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Confidence</Typography>
                            <Typography variant="body2">{rec.confidence}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Effort</Typography>
                            <Typography variant="body2">{rec.effort}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Timeframe</Typography>
                            <Typography variant="body2">{rec.timeframe}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">Requirements</Typography>
                            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                              {rec.requirements.map((req, idx) => (
                                <Chip key={idx} label={req} size="small" />
                              ))}
                            </Stack>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              {executionMode === 'manual' && (
                                <>
                                  <Button 
                                    variant="contained" 
                                    size="small"
                                    onClick={() => setRecommendationDrillDown(rec)}
                                  >
                                    Approve & Execute
                                  </Button>
                                  <Button variant="outlined" size="small">
                                    Request Details
                                  </Button>
                                </>
                              )}
                              {executionMode === 'supervised' && rec.status !== 'auto-approved' && (
                                <Button 
                                  variant="contained" 
                                  size="small"
                                  onClick={() => setRecommendationDrillDown(rec)}
                                >
                                  Approve for Automation
                                </Button>
                              )}
                              {rec.status === 'auto-approved' && (
                                <Chip
                                  label="Executing with guardrails"
                                  icon={<AutoModeIcon />}
                                  color="primary"
                                />
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select an operation from the overview to see specific recommendations
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(operationsData).map(([key, data]) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Card
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setSelectedOperation(key)}
                    >
                      <CardContent>
                        <Typography variant="h6">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </Typography>
                        <Typography variant="h4" sx={{ my: 1 }}>
                          {data.opportunities}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Recommendations Available
                        </Typography>
                        <Typography variant="body1" color="primary.main" fontWeight="bold">
                          {data.potentialValue} potential
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      )}

      {/* Process Analytics Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3} sx={{ flex: 1 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                End-to-End Process Analytics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Process</TableCell>
                      <TableCell>Current Time</TableCell>
                      <TableCell>Target Time</TableCell>
                      <TableCell>Bottlenecks</TableCell>
                      <TableCell>Automation %</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Order Processing</TableCell>
                      <TableCell>4.2 hours</TableCell>
                      <TableCell>2.0 hours</TableCell>
                      <TableCell>
                        <Chip label="Credit Check" size="small" color="warning" />
                      </TableCell>
                      <TableCell>67%</TableCell>
                      <TableCell>
                        <Button 
                          size="small"
                          onClick={() => setProcessDetailDialog({
                            process: 'Order Processing',
                            current: 4.2,
                            target: 2.0,
                            unit: 'hours',
                            bottleneck: 'Credit Check',
                            automation: 67
                          })}
                        >
                          Optimize
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Invoice to Payment</TableCell>
                      <TableCell>45 days</TableCell>
                      <TableCell>30 days</TableCell>
                      <TableCell>
                        <Chip label="Manual Follow-up" size="small" color="error" />
                      </TableCell>
                      <TableCell>23%</TableCell>
                      <TableCell>
                        <Button 
                          size="small"
                          onClick={() => setProcessDetailDialog({
                            process: 'Invoice to Payment',
                            current: 45,
                            target: 30,
                            unit: 'days',
                            bottleneck: 'Manual Follow-up',
                            automation: 23
                          })}
                        >
                          Optimize
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Inventory Replenishment</TableCell>
                      <TableCell>7 days</TableCell>
                      <TableCell>5 days</TableCell>
                      <TableCell>
                        <Chip label="Approval Chain" size="small" color="warning" />
                      </TableCell>
                      <TableCell>81%</TableCell>
                      <TableCell>
                        <Button size="small">Optimize</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Performance Insights Tab */}
      {activeTab === 3 && (
        <Grid container spacing={3} sx={{ flex: 1 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                AI Performance Metrics
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Recommendation Accuracy</Typography>
                    <Typography variant="body2" fontWeight="bold">92.3%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={92.3} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Value Delivered</Typography>
                    <Typography variant="body2" fontWeight="bold">$3.7M YTD</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={74} sx={{ height: 8, borderRadius: 4 }} color="success" />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Adoption Rate</Typography>
                    <Typography variant="body2" fontWeight="bold">78%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={78} sx={{ height: 8, borderRadius: 4 }} color="warning" />
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Guardrails & Compliance
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Max Automated Transaction</Typography>
                  <Chip label="$25K" size="small" color="primary" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Approval Required Above</Typography>
                  <Chip label="$5K" size="small" color="primary" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Audit Trail</Typography>
                  <Chip label="100% Complete" size="small" color="success" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Compliance Status</Typography>
                  <Chip label="SOC 2 Certified" size="small" color="success" />
                </Box>
              </Stack>
              <Alert severity="info" sx={{ mt: 2 }}>
                All automated actions are reversible within 24 hours and fully auditable.
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Operation Detail Dialog */}
      <Dialog
        open={!!operationDetailDialog}
        onClose={() => setOperationDetailDialog(null)}
        maxWidth="md"
        fullWidth
      >
        {operationDetailDialog && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{operationDetailDialog.title} - Alert Details</Typography>
                <IconButton onClick={() => setOperationDetailDialog(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <AlertTitle>{operationDetailDialog.data.alerts} Active Alerts</AlertTitle>
                Review the following issues that require attention
              </Alert>
              
              <Grid container spacing={2}>
                {operationDetailDialog.key === 'orderToCash' && (
                  <>
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Overdue Invoices</Typography>
                            <Chip label="High Priority" color="error" size="small" />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            12 invoices totaling $450K are overdue by more than 30 days
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Button size="small" variant="outlined">View Details</Button>
                            <Button size="small" variant="contained" sx={{ ml: 1 }}>
                              Send Reminders
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Processing Delays</Typography>
                            <Chip label="Medium Priority" color="warning" size="small" />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Order processing time has increased by 23% in the last 48 hours
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Button size="small" variant="outlined">Investigate</Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                )}
                {operationDetailDialog.key === 'pricing' && (
                  <>
                    <Grid item xs={12}>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Alert Type</TableCell>
                              <TableCell>Products Affected</TableCell>
                              <TableCell>Impact</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>Competitor Price Drop</TableCell>
                              <TableCell>127 SKUs</TableCell>
                              <TableCell>-$89K potential</TableCell>
                              <TableCell>
                                <Button size="small">Match Prices</Button>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Margin Erosion</TableCell>
                              <TableCell>45 SKUs</TableCell>
                              <TableCell>-12% margin</TableCell>
                              <TableCell>
                                <Button size="small">Review Costs</Button>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Price Mismatch</TableCell>
                              <TableCell>8 SKUs</TableCell>
                              <TableCell>Customer complaints</TableCell>
                              <TableCell>
                                <Button size="small">Fix Now</Button>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOperationDetailDialog(null)}>Close</Button>
              <Button variant="contained" color="primary">
                Resolve All Alerts
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Working Capital Metrics DrillDown Dialog */}
      <Dialog
        open={!!metricsDrillDown}
        onClose={() => setMetricsDrillDown(null)}
        maxWidth="lg"
        fullWidth
      >
        {metricsDrillDown && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{metricsDrillDown.metric.name} - Detailed Analysis</Typography>
                <IconButton onClick={() => setMetricsDrillDown(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Current Performance</Typography>
                    <Typography variant="h3">{metricsDrillDown.metric.value} days</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <TrendingUpIcon color="error" />
                      <Typography variant="body2" color="error.main">
                        +{metricsDrillDown.metric.value - metricsDrillDown.metric.target} days vs target
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Trend Analysis</Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={Array.from({ length: 12 }, (_, i) => ({
                        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
                        value: metricsDrillDown.metric.value + (Math.random() - 0.5) * 10,
                        target: metricsDrillDown.metric.target,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="value" stroke="#2196f3" strokeWidth={2} name="Actual" />
                        <Line type="monotone" dataKey="target" stroke="#4caf50" strokeDasharray="5 5" name="Target" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Top Contributors</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Customer/Supplier</TableCell>
                            <TableCell>Days Outstanding</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[
                            { name: 'ABC Corp', days: 67, amount: '$125K', status: 'Overdue' },
                            { name: 'XYZ Ltd', days: 54, amount: '$89K', status: 'At Risk' },
                            { name: 'Global Inc', days: 45, amount: '$234K', status: 'Normal' },
                          ].map((row) => (
                            <TableRow key={row.name}>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.days}</TableCell>
                              <TableCell>{row.amount}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={row.status} 
                                  size="small"
                                  color={row.status === 'Overdue' ? 'error' : row.status === 'At Risk' ? 'warning' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                <Button size="small">Contact</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info">
                    <AlertTitle>Optimization Opportunities</AlertTitle>
                    <Stack spacing={1}>
                      <Typography variant="body2">• Implement early payment discounts to reduce DSO by 5-7 days</Typography>
                      <Typography variant="body2">• Automate invoice processing to save 2-3 days in cycle time</Typography>
                      <Typography variant="body2">• Negotiate better payment terms with top 10 suppliers</Typography>
                    </Stack>
                  </Alert>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setMetricsDrillDown(null)}>Close</Button>
              <Button variant="contained" startIcon={<AssessmentIcon />}>
                Generate Improvement Plan
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Recommendation DrillDown Dialog */}
      <Dialog
        open={!!recommendationDrillDown}
        onClose={() => setRecommendationDrillDown(null)}
        maxWidth="md"
        fullWidth
      >
        {recommendationDrillDown && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Recommendation Approval - {recommendationDrillDown.title}</Typography>
                <IconButton onClick={() => setRecommendationDrillDown(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info">
                    <AlertTitle>{recommendationDrillDown.description}</AlertTitle>
                    Review the implementation details before approving
                  </Alert>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Impact Analysis
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Financial Impact</Typography>
                        <Typography variant="h6">{recommendationDrillDown.impact}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Confidence Level</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={parseFloat(recommendationDrillDown.confidence)} 
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="body2">{recommendationDrillDown.confidence}</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Implementation Time</Typography>
                        <Typography variant="body1">{recommendationDrillDown.timeframe}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Implementation Requirements
                    </Typography>
                    <Stack spacing={1}>
                      {recommendationDrillDown.requirements.map((req, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2">{req}</Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Effort Level: <Chip label={recommendationDrillDown.effort} size="small" />
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Implementation Steps</Typography>
                    <Stepper activeStep={0} alternativeLabel>
                      <Step>
                        <StepLabel>Validation</StepLabel>
                      </Step>
                      <Step>
                        <StepLabel>Approval</StepLabel>
                      </Step>
                      <Step>
                        <StepLabel>Execution</StepLabel>
                      </Step>
                      <Step>
                        <StepLabel>Monitoring</StepLabel>
                      </Step>
                    </Stepper>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="success">
                    <AlertTitle>Success Metrics</AlertTitle>
                    <Typography variant="body2">
                      This recommendation will be considered successful if it achieves at least 80% of the projected {recommendationDrillDown.impact} within {recommendationDrillDown.timeframe}.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRecommendationDrillDown(null)}>Cancel</Button>
              <Button variant="outlined">Schedule for Later</Button>
              <Button variant="contained" color="primary" startIcon={<ThumbUpIcon />}>
                Approve & Execute
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Process Detail Dialog */}
      <Dialog
        open={!!processDetailDialog}
        onClose={() => setProcessDetailDialog(null)}
        maxWidth="lg"
        fullWidth
      >
        {processDetailDialog && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{processDetailDialog.process} - Optimization Details</Typography>
                <IconButton onClick={() => setProcessDetailDialog(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="warning">
                    <AlertTitle>Process Bottleneck: {processDetailDialog.bottleneck}</AlertTitle>
                    This is causing a {processDetailDialog.current - processDetailDialog.target} {processDetailDialog.unit} delay vs target
                  </Alert>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Process Flow Analysis</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { step: 'Initiation', time: 0.5, automated: true },
                        { step: 'Validation', time: 1.2, automated: true },
                        { step: 'Approval', time: 3.5, automated: false },
                        { step: 'Processing', time: 1.8, automated: true },
                        { step: 'Completion', time: 0.2, automated: true },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="step" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="time">
                          {[
                            { step: 'Initiation', time: 0.5, automated: true },
                            { step: 'Validation', time: 1.2, automated: true },
                            { step: 'Approval', time: 3.5, automated: false },
                            { step: 'Processing', time: 1.8, automated: true },
                            { step: 'Completion', time: 0.2, automated: true },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.automated ? '#4caf50' : '#ff5252'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Automation Opportunities</Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Current Automation</Typography>
                        <Typography variant="body2" fontWeight="bold">{processDetailDialog.automation}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={processDetailDialog.automation} />
                      
                      <Typography variant="body2" sx={{ mt: 2 }}>Recommended Actions:</Typography>
                      <Stack spacing={1}>
                        <Chip label="Implement RPA for approval routing" icon={<CheckCircleIcon />} />
                        <Chip label="Add ML-based validation rules" icon={<CheckCircleIcon />} />
                        <Chip label="Enable straight-through processing" icon={<CheckCircleIcon />} />
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Process Step</TableCell>
                          <TableCell>Current Time</TableCell>
                          <TableCell>Target Time</TableCell>
                          <TableCell>Optimization</TableCell>
                          <TableCell>Impact</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Manual Approval</TableCell>
                          <TableCell>3.5 {processDetailDialog.unit}</TableCell>
                          <TableCell>0.5 {processDetailDialog.unit}</TableCell>
                          <TableCell>Automated approval for low-risk items</TableCell>
                          <TableCell>
                            <Chip label="-3 days" color="success" size="small" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Data Entry</TableCell>
                          <TableCell>1.2 {processDetailDialog.unit}</TableCell>
                          <TableCell>0.1 {processDetailDialog.unit}</TableCell>
                          <TableCell>OCR and auto-capture</TableCell>
                          <TableCell>
                            <Chip label="-1.1 days" color="success" size="small" />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setProcessDetailDialog(null)}>Close</Button>
              <Button variant="contained" startIcon={<TimelineIcon />}>
                Implement Optimizations
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CoreAIDashboard;