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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab,
  Badge,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  LocalShipping as ShippingIcon,
  Lightbulb as LightbulbIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  Radar as RadarIcon,
  Map as MapIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  AccountTree as AccountTreeIcon,
  AutoMode as AutoModeIcon,
  SupervisorAccount as SupervisorIcon,
  PanTool as ManualIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, LineChart, Line, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';

const MarketsAIDashboard = () => {
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [automationLevel, setAutomationLevel] = useState('supervised');
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSignal, setExpandedSignal] = useState(null);

  // Simulate real-time scanning
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Enhanced radar data with more detail
  const radarData = [
    { signal: 'Weather', value: 85, trend: '+12%', details: '3 hurricanes affecting supply routes' },
    { signal: 'Competitor', value: 45, trend: '-3%', details: 'New product launch by competitor A' },
    { signal: 'Social', value: 72, trend: '+8%', details: 'Viral trend increasing demand' },
    { signal: 'Economic', value: 38, trend: '-5%', details: 'Interest rate changes affecting costs' },
    { signal: 'Supply', value: 92, trend: '+15%', details: 'Port congestion at 5 locations' },
  ];

  // Detailed signal breakdown
  const signalBreakdown = {
    Weather: {
      subSignals: [
        { name: 'Hurricane Risk', severity: 'CRITICAL', locations: ['Florida', 'Texas'], impact: '$3.2M' },
        { name: 'Drought Conditions', severity: 'HIGH', locations: ['California'], impact: '$1.1M' },
        { name: 'Flooding', severity: 'MEDIUM', locations: ['Midwest'], impact: '$0.5M' },
      ],
      affectedProducts: 234,
      affectedSuppliers: 18,
      timeToImpact: '3-5 days',
    },
    Supply: {
      subSignals: [
        { name: 'Port Congestion', severity: 'CRITICAL', locations: ['LA', 'Long Beach'], impact: '$2.5M' },
        { name: 'Supplier Shortage', severity: 'HIGH', locations: ['Asia'], impact: '$1.8M' },
        { name: 'Transportation Delays', severity: 'HIGH', locations: ['National'], impact: '$0.9M' },
      ],
      affectedProducts: 567,
      affectedSuppliers: 43,
      timeToImpact: '1-2 days',
    },
  };

  // Alert levels based on values
  const getAlertLevel = (value) => {
    if (value >= 80) return { level: 'CRITICAL', color: '#f44336', icon: <ErrorIcon /> };
    if (value >= 60) return { level: 'HIGH', color: '#ff9800', icon: <WarningIcon /> };
    if (value >= 40) return { level: 'MEDIUM', color: '#ffeb3b', icon: <WarningIcon /> };
    return { level: 'NORMAL', color: '#4caf50', icon: <CheckCircleIcon /> };
  };

  // Enhanced recommendations with approval workflow
  const recommendations = [
    { 
      id: 'REC-001',
      category: 'Supply Chain Optimization', 
      icon: <ShippingIcon />, 
      priority: 'CRITICAL',
      impact: '$2.3M cost avoidance',
      timeframe: '24-48 hours',
      confidence: '94%',
      status: automationLevel === 'autonomous' ? 'auto-approved' : 'pending',
      color: '#00357a',
      actions: [
        { 
          id: 'ACT-001',
          action: 'Reroute 47 shipments via alternative ports', 
          impact: 'Avoid 3-5 day delays', 
          confidence: '95%',
          risk: 'LOW',
          requirements: ['Supplier approval', 'Customer notification'],
          automationReady: true,
        },
        { 
          id: 'ACT-002',
          action: 'Activate backup suppliers for critical SKUs', 
          impact: '$1.2M saved', 
          confidence: '91%',
          risk: 'MEDIUM',
          requirements: ['Contract review', 'Quality verification'],
          automationReady: true,
        },
        { 
          id: 'ACT-003',
          action: 'Increase safety stock for top 50 items', 
          impact: 'Prevent stockouts', 
          confidence: '88%',
          risk: 'LOW',
          requirements: ['Warehouse capacity check', 'Working capital approval'],
          automationReady: false,
        },
      ]
    },
    { 
      id: 'REC-002',
      category: 'Dynamic Pricing', 
      icon: <MoneyIcon />, 
      priority: 'HIGH',
      impact: '+$1.8M revenue',
      timeframe: '12-24 hours',
      confidence: '87%',
      status: 'under review',
      color: '#4caf50',
      actions: [
        { 
          id: 'ACT-004',
          action: 'Implement surge pricing in affected regions', 
          impact: '+12% margin', 
          confidence: '89%',
          risk: 'MEDIUM',
          requirements: ['Legal compliance check', 'Competitor analysis'],
          automationReady: true,
        },
        { 
          id: 'ACT-005',
          action: 'Bundle slow-moving with fast-moving items', 
          impact: 'Clear $600K inventory', 
          confidence: '82%',
          risk: 'LOW',
          requirements: ['Marketing approval', 'System configuration'],
          automationReady: true,
        },
      ]
    },
  ];

  // Automation levels with descriptions
  const automationLevels = [
    { 
      value: 'manual', 
      label: 'Manual Review', 
      icon: <ManualIcon />,
      description: 'All recommendations require manual approval',
      color: '#757575',
    },
    { 
      value: 'supervised', 
      label: 'Supervised AI', 
      icon: <SupervisorIcon />,
      description: 'AI executes pre-approved actions with oversight',
      color: '#00357a',
    },
    { 
      value: 'autonomous', 
      label: 'Autonomous AI', 
      icon: <AutoModeIcon />,
      description: 'AI executes within defined guardrails',
      color: '#4caf50',
    },
  ];

  // Guardrails and controls
  const guardrails = [
    { name: 'Max Transaction Value', value: '$50K', status: 'active' },
    { name: 'Approval Required Above', value: '$10K', status: 'active' },
    { name: 'Geographic Restrictions', value: 'US/Canada only', status: 'active' },
    { name: 'Product Categories', value: '127 of 250 enabled', status: 'partial' },
    { name: 'Supplier Auto-Switch', value: 'Pre-approved only', status: 'active' },
  ];

  // Performance metrics
  const performanceMetrics = {
    responseTime: '0.3s',
    accuracy: '94.2%',
    costSaved: '$4.7M MTD',
    decisionsOptimized: '1,847',
    humanInterventions: '23',
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header with Automation Controls */}
      <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #FF5722 0%, #FF7043 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RadarIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                MARKETS.AI | Market Intelligence & Response
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Real-time market signal processing and recommendation engine
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              value={automationLevel}
              exclusive
              onChange={(e, v) => v && setAutomationLevel(v)}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}
            >
              {automationLevels.map((level) => (
                <ToggleButton 
                  key={level.value} 
                  value={level.value}
                  sx={{ 
                    color: 'white',
                    '&.Mui-selected': { 
                      bgcolor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                    }
                  }}
                >
                  <Tooltip title={level.description}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {level.icon}
                      {level.label}
                    </Box>
                  </Tooltip>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {isScanning && (
              <Chip
                label="Scanning..."
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                icon={<RefreshIcon sx={{ color: 'white' }} />}
              />
            )}
          </Box>
        </Box>
      </Paper>

      {/* Tabs for different views */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Signal Dashboard" />
          <Tab label="Recommendations" />
          <Tab label="Impact Analysis" />
          <Tab label="Automation Controls" />
        </Tabs>
      </Paper>

      {/* Signal Dashboard Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3} sx={{ flex: 1 }}>
          {/* Active Signals with Radar */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Market Signal Radar
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#e0e0e0" />
                        <PolarAngleAxis dataKey="signal" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Signal Strength"
                          dataKey="value"
                          stroke="#FF5722"
                          fill="#FF5722"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={5}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Signal Details
                    </Typography>
                    {radarData.map((signal) => {
                      const alert = getAlertLevel(signal.value);
                      return (
                        <Accordion
                          key={signal.signal}
                          expanded={expandedSignal === signal.signal}
                          onChange={() => setExpandedSignal(
                            expandedSignal === signal.signal ? null : signal.signal
                          )}
                          sx={{ 
                            bgcolor: `${alert.color}10`,
                            '&:before': { display: 'none' },
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ minHeight: 48 }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                              <Box sx={{ color: alert.color }}>{alert.icon}</Box>
                              <Typography variant="body2" fontWeight="500">
                                {signal.signal}
                              </Typography>
                              <Chip
                                label={signal.trend}
                                size="small"
                                sx={{ ml: 'auto', fontSize: '0.7rem' }}
                              />
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="caption" color="text.secondary">
                              {signal.details}
                            </Typography>
                            {signalBreakdown[signal.signal] && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" display="block" gutterBottom>
                                  <strong>Affected:</strong> {signalBreakdown[signal.signal].affectedProducts} products, {signalBreakdown[signal.signal].affectedSuppliers} suppliers
                                </Typography>
                                <Typography variant="caption" display="block">
                                  <strong>Time to Impact:</strong> {signalBreakdown[signal.signal].timeToImpact}
                                </Typography>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  sx={{ mt: 1 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSignalDetailDialog({ signal: signal.signal, data: signalBreakdown[signal.signal] });
                                  }}
                                >
                                  View Details
                                </Button>
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Signal Impact Summary */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Impact Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'error.light' }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        At Risk Revenue
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        $4.8M
                      </Typography>
                      <Typography variant="caption">
                        Next 7 days
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'success.light' }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Opportunity Value
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        $2.3M
                      </Typography>
                      <Typography variant="caption">
                        If acted upon
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Response Performance
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(performanceMetrics).map(([key, value]) => (
                      <Grid item xs={6} key={key}>
                        <Box sx={{ p: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Geographic Impact */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Geographic Impact Analysis
                </Typography>
                <Button 
                  startIcon={<MapIcon />} 
                  size="small"
                  onClick={() => setGeographicDrillDown(true)}
                >
                  Detailed Map View
                </Button>
              </Box>
              <Box
                sx={{
                  height: 300,
                  background: 'linear-gradient(135deg, #fff3e0 0%, #ffccbc 100%)',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Enhanced map visualization */}
                <Grid container sx={{ height: '100%', p: 2 }}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Critical Zones
                    </Typography>
                    <Stack spacing={1}>
                      <Chip label="West Coast Ports - 85% congestion" size="small" color="error" />
                      <Chip label="Southeast - Hurricane risk" size="small" color="warning" />
                      <Chip label="Midwest - Flooding delays" size="small" color="warning" />
                    </Stack>
                  </Grid>
                  <Grid item xs={8}>
                    {/* Map visualization placeholder */}
                    <Box sx={{ position: 'relative', height: '100%' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '20%',
                          left: '10%',
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(255,0,0,0.6) 0%, rgba(255,0,0,0) 70%)',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: '30%',
                          right: '20%',
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(255,152,0,0.5) 0%, rgba(255,152,0,0) 70%)',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '40%',
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(255,235,59,0.4) 0%, rgba(255,235,59,0) 70%)',
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Recommendations Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3} sx={{ flex: 1 }}>
          {selectedRecommendation ? (
            // Detailed recommendation view
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold">
                    Recommendation Details
                  </Typography>
                  <Button
                    startIcon={<ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} />}
                    onClick={() => setSelectedRecommendation(null)}
                  >
                    Back to List
                  </Button>
                </Box>
                {/* Detailed recommendation content */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>
                      {selectedRecommendation.category}
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Action</TableCell>
                            <TableCell>Impact</TableCell>
                            <TableCell>Confidence</TableCell>
                            <TableCell>Risk</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedRecommendation.actions.map((action) => (
                            <TableRow key={action.id}>
                              <TableCell>{action.action}</TableCell>
                              <TableCell>{action.impact}</TableCell>
                              <TableCell>
                                <Chip label={action.confidence} size="small" />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={action.risk} 
                                  size="small"
                                  color={action.risk === 'LOW' ? 'success' : action.risk === 'MEDIUM' ? 'warning' : 'error'}
                                />
                              </TableCell>
                              <TableCell>
                                {automationLevel === 'autonomous' && action.automationReady ? (
                                  <Chip label="Auto-Executing" icon={<AutoModeIcon />} color="primary" size="small" />
                                ) : (
                                  <Button 
                                    size="small" 
                                    variant="contained"
                                    onClick={() => setActionDetailDialog(action)}
                                  >
                                    Approve
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Alert severity="info">
                      <AlertTitle>Requirements</AlertTitle>
                      {selectedRecommendation.actions.map((action) => (
                        <Box key={action.id} sx={{ mb: 1 }}>
                          <Typography variant="body2" fontWeight="500">
                            {action.action}
                          </Typography>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {action.requirements.map((req, idx) => (
                              <Chip key={idx} label={req} size="small" sx={{ mt: 0.5 }} />
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </Alert>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ) : (
            // Recommendations list
            <>
              <Grid item xs={12}>
                <Alert 
                  severity={automationLevel === 'autonomous' ? 'success' : 'info'}
                  icon={automationLevel === 'autonomous' ? <VerifiedIcon /> : <InfoIcon />}
                >
                  <AlertTitle>
                    {automationLevel === 'autonomous' 
                      ? 'Autonomous Mode Active - Pre-approved actions executing within guardrails'
                      : automationLevel === 'supervised'
                      ? 'Supervised Mode - AI executing pre-approved actions with human oversight'
                      : 'Manual Mode - All recommendations require approval'}
                  </AlertTitle>
                </Alert>
              </Grid>
              {recommendations.map((rec) => (
                <Grid item xs={12} md={6} key={rec.id}>
                  <Card
                    sx={{
                      height: '100%',
                      border: rec.priority === 'CRITICAL' ? '2px solid' : '1px solid',
                      borderColor: rec.priority === 'CRITICAL' ? 'error.main' : 'divider',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: rec.color }}>{rec.icon}</Box>
                          <Typography variant="h6">{rec.category}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Chip 
                            label={rec.priority} 
                            size="small"
                            color={rec.priority === 'CRITICAL' ? 'error' : rec.priority === 'HIGH' ? 'warning' : 'default'}
                          />
                          <Chip 
                            label={rec.status}
                            size="small"
                            color={rec.status === 'auto-approved' ? 'success' : 'default'}
                          />
                        </Stack>
                      </Box>
                      
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Impact</Typography>
                          <Typography variant="body1" fontWeight="bold">{rec.impact}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Timeframe</Typography>
                          <Typography variant="body1">{rec.timeframe}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Confidence</Typography>
                          <Typography variant="body1">{rec.confidence}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Actions</Typography>
                          <Typography variant="body1">{rec.actions.length} recommended</Typography>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />

                      <Stack spacing={1}>
                        {rec.actions.slice(0, 2).map((action) => (
                          <Box key={action.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {automationLevel === 'autonomous' && action.automationReady && (
                              <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            )}
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {action.action}
                            </Typography>
                          </Box>
                        ))}
                        {rec.actions.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{rec.actions.length - 2} more actions
                          </Typography>
                        )}
                      </Stack>

                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          onClick={() => setSelectedRecommendation(rec)}
                        >
                          View Details
                        </Button>
                        {automationLevel === 'manual' && (
                          <Button
                            variant="outlined"
                            size="small"
                            fullWidth
                          >
                            Quick Approve
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </>
          )}
        </Grid>
      )}

      {/* Impact Analysis Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3} sx={{ flex: 1 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Comprehensive Impact Analysis
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Revenue Impact Timeline
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={Array.from({ length: 30 }, (_, i) => ({
                      day: `Day ${i + 1}`,
                      baseline: 100,
                      withAction: 100 + (i > 5 ? Math.min(i * 2, 30) : 0),
                      noAction: 100 - (i > 3 ? Math.min(i * 3, 45) : 0),
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="baseline" stroke="#888" strokeDasharray="5 5" name="Baseline" />
                      <Line type="monotone" dataKey="withAction" stroke="#4caf50" strokeWidth={2} name="With Actions" />
                      <Line type="monotone" dataKey="noAction" stroke="#f44336" strokeWidth={2} name="No Action" />
                    </LineChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Risk Mitigation by Category
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { category: 'Supply Chain', risk: 4.8, mitigated: 3.2 },
                      { category: 'Pricing', risk: 2.3, mitigated: 1.8 },
                      { category: 'Inventory', risk: 1.9, mitigated: 1.5 },
                      { category: 'Customer', risk: 1.2, mitigated: 0.9 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="risk" fill="#ff5252" name="Risk ($M)" />
                      <Bar dataKey="mitigated" fill="#4caf50" name="After Mitigation ($M)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Automation Controls Tab */}
      {activeTab === 3 && (
        <Grid container spacing={3} sx={{ flex: 1 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Automation Guardrails
              </Typography>
              <Stack spacing={2}>
                {guardrails.map((guardrail) => (
                  <Box key={guardrail.name} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">{guardrail.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {guardrail.value}
                      </Typography>
                    </Box>
                    <Chip
                      label={guardrail.status}
                      size="small"
                      color={guardrail.status === 'active' ? 'success' : 'warning'}
                    />
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 3 }} />
              <Alert severity="success" icon={<SecurityIcon />}>
                <AlertTitle>Security & Compliance</AlertTitle>
                All automated actions are logged, auditable, and reversible. SOC 2 Type II certified.
              </Alert>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Automation Performance
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Decision Accuracy</Typography>
                    <Typography variant="body2" fontWeight="bold">94.2%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={94.2} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Cost Optimization</Typography>
                    <Typography variant="body2" fontWeight="bold">$4.7M saved</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={78} sx={{ height: 8, borderRadius: 4 }} color="success" />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Human Override Rate</Typography>
                    <Typography variant="body2" fontWeight="bold">1.2%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={1.2} sx={{ height: 8, borderRadius: 4 }} color="warning" />
                </Box>
              </Stack>
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Based on 1,847 automated decisions this month. All decisions are reversible within 24 hours.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Signal Detail Dialog */}
      <Dialog
        open={!!signalDetailDialog}
        onClose={() => setSignalDetailDialog(null)}
        maxWidth="md"
        fullWidth
      >
        {signalDetailDialog && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{signalDetailDialog.signal} Signal Analysis</Typography>
                <IconButton onClick={() => setSignalDetailDialog(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity={(() => {
                    const signal = radarData.find(r => r.signal === signalDetailDialog.signal);
                    const alertLevel = getAlertLevel(signal ? signal.value : 0);
                    return alertLevel.level === 'CRITICAL' ? 'error' : 'warning';
                  })()}>
                    <AlertTitle>Current Status</AlertTitle>
                    {signalDetailDialog.data.subSignals.length} active sub-signals detected affecting {signalDetailDialog.data.affectedProducts} products
                  </Alert>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Sub-Signal Breakdown
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Sub-Signal</TableCell>
                          <TableCell>Severity</TableCell>
                          <TableCell>Locations</TableCell>
                          <TableCell>Financial Impact</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {signalDetailDialog.data.subSignals.map((subSignal, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{subSignal.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={subSignal.severity}
                                size="small"
                                color={subSignal.severity === 'CRITICAL' ? 'error' : subSignal.severity === 'HIGH' ? 'warning' : 'default'}
                              />
                            </TableCell>
                            <TableCell>{subSignal.locations.join(', ')}</TableCell>
                            <TableCell>{subSignal.impact}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Affected Suppliers
                    </Typography>
                    <Typography variant="h4">{signalDetailDialog.data.affectedSuppliers}</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(signalDetailDialog.data.affectedSuppliers / 100) * 100} 
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Affected Products
                    </Typography>
                    <Typography variant="h4">{signalDetailDialog.data.affectedProducts}</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(signalDetailDialog.data.affectedProducts / 1000) * 100} 
                      sx={{ mt: 1 }}
                      color="warning"
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info" icon={<ScheduleIcon />}>
                    <AlertTitle>Time to Impact: {signalDetailDialog.data.timeToImpact}</AlertTitle>
                    Immediate action recommended to mitigate potential disruptions
                  </Alert>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSignalDetailDialog(null)}>Close</Button>
              <Button variant="contained" startIcon={<AssessmentIcon />}>
                Generate Action Plan
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Geographic Impact DrillDown Dialog */}
      <Dialog
        open={!!geographicDrillDown}
        onClose={() => setGeographicDrillDown(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Geographic Impact Analysis - Detailed View</Typography>
            <IconButton onClick={() => setGeographicDrillDown(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Regional Impact Summary
              </Typography>
              <Grid container spacing={2}>
                {[
                  { region: 'West Coast', impact: 'Critical', ports: 5, shipments: 234, value: '$3.2M' },
                  { region: 'Southeast', impact: 'High', ports: 3, shipments: 156, value: '$1.8M' },
                  { region: 'Midwest', impact: 'Medium', ports: 2, shipments: 89, value: '$0.9M' },
                  { region: 'Northeast', impact: 'Low', ports: 4, shipments: 45, value: '$0.4M' },
                ].map((region) => (
                  <Grid item xs={12} sm={6} md={3} key={region.region}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{region.region}</Typography>
                        <Chip 
                          label={region.impact} 
                          size="small" 
                          color={
                            region.impact === 'Critical' ? 'error' : 
                            region.impact === 'High' ? 'warning' : 
                            region.impact === 'Medium' ? 'info' : 'default'
                          }
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2">Ports Affected: {region.ports}</Typography>
                        <Typography variant="body2">Shipments: {region.shipments}</Typography>
                        <Typography variant="body2" fontWeight="bold">At Risk: {region.value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Port Congestion Levels
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { port: 'LA', congestion: 85, avgDelay: 5.2 },
                    { port: 'Long Beach', congestion: 82, avgDelay: 4.8 },
                    { port: 'Oakland', congestion: 67, avgDelay: 3.1 },
                    { port: 'Seattle', congestion: 45, avgDelay: 2.2 },
                    { port: 'Miami', congestion: 72, avgDelay: 3.5 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="port" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="congestion" fill="#ff5252" name="Congestion %" />
                    <Bar dataKey="avgDelay" fill="#00357a" name="Avg Delay (days)" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Alternative Route Analysis
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Route</TableCell>
                      <TableCell>Additional Cost</TableCell>
                      <TableCell>Time Saved</TableCell>
                      <TableCell>Capacity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Mexico → Houston</TableCell>
                      <TableCell>+$120/container</TableCell>
                      <TableCell>3-4 days</TableCell>
                      <TableCell>Available</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Canada → Chicago</TableCell>
                      <TableCell>+$85/container</TableCell>
                      <TableCell>2-3 days</TableCell>
                      <TableCell>Limited</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Air Freight</TableCell>
                      <TableCell>+$450/container</TableCell>
                      <TableCell>5-7 days</TableCell>
                      <TableCell>Available</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGeographicDrillDown(null)}>Close</Button>
          <Button variant="contained" startIcon={<MapIcon />}>
            Activate Route Optimization
          </Button>
        </DialogActions>
      </Dialog>

      {/* Regional Impact DrillDown Dialog */}
      <Dialog
        open={!!impactDrillDown}
        onClose={() => setImpactDrillDown(null)}
        maxWidth="md"
        fullWidth
      >
        {impactDrillDown && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{impactDrillDown.region} - Impact Analysis</Typography>
                <IconButton onClick={() => setImpactDrillDown(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Alert severity={impactDrillDown.severity === 'critical' ? 'error' : impactDrillDown.severity === 'high' ? 'warning' : 'info'} sx={{ mb: 2 }}>
                <AlertTitle>Severity: {impactDrillDown.severity.toUpperCase()}</AlertTitle>
                Immediate attention required for supply chain operations in this region
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Affected Operations</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><LocationIcon /></ListItemIcon>
                      <ListItemText primary="Distribution Centers" secondary="3 facilities at capacity" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ShippingIcon /></ListItemIcon>
                      <ListItemText primary="Transit Routes" secondary="5 routes experiencing delays" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><BusinessIcon /></ListItemIcon>
                      <ListItemText primary="Key Suppliers" secondary="12 suppliers impacted" />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Financial Impact</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Revenue at Risk</Typography>
                      <Typography variant="body2" fontWeight="bold">$2.3M</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Additional Costs</Typography>
                      <Typography variant="body2" fontWeight="bold">$450K</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Customer Impact</Typography>
                      <Typography variant="body2" fontWeight="bold">1,234 orders</Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Recommended Actions</Typography>
                  <Stack spacing={1}>
                    <Chip label="Activate backup distribution center" icon={<CheckCircleIcon />} />
                    <Chip label="Reroute shipments via alternative ports" icon={<CheckCircleIcon />} />
                    <Chip label="Notify affected customers proactively" icon={<CheckCircleIcon />} />
                    <Chip label="Engage emergency freight options" icon={<WarningIcon />} color="warning" />
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setImpactDrillDown(null)}>Close</Button>
              <Button variant="contained" color="primary">
                Execute Mitigation Plan
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Action Detail Dialog */}
      <Dialog
        open={!!actionDetailDialog}
        onClose={() => setActionDetailDialog(null)}
        maxWidth="md"
        fullWidth
      >
        {actionDetailDialog && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Action Approval Details</Typography>
                <IconButton onClick={() => setActionDetailDialog(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" icon={<InfoIcon />}>
                    <AlertTitle>{actionDetailDialog.action}</AlertTitle>
                    Review the following details before approving this action
                  </Alert>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Impact Analysis</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Expected Outcome</Typography>
                      <Typography variant="body1" fontWeight="bold">{actionDetailDialog.impact}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Confidence Level</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseFloat(actionDetailDialog.confidence)} 
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2">{actionDetailDialog.confidence}</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Risk Level</Typography>
                      <Chip 
                        label={actionDetailDialog.risk} 
                        size="small"
                        color={actionDetailDialog.risk === 'LOW' ? 'success' : actionDetailDialog.risk === 'MEDIUM' ? 'warning' : 'error'}
                      />
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Requirements</Typography>
                    <Stack spacing={1}>
                      {actionDetailDialog.requirements.map((req, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2">{req}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Execution Timeline</Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={[
                        { phase: 'Preparation', progress: 0 },
                        { phase: 'Validation', progress: 25 },
                        { phase: 'Execution', progress: 75 },
                        { phase: 'Completion', progress: 100 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="phase" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="progress" stroke="#00357a" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="warning">
                    <AlertTitle>Automation Capability</AlertTitle>
                    {actionDetailDialog.automationReady 
                      ? "This action can be automated in supervised or autonomous mode"
                      : "This action requires manual execution due to complexity or compliance requirements"}
                  </Alert>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setActionDetailDialog(null)}>Cancel</Button>
              <Button variant="outlined">Request More Info</Button>
              <Button variant="contained" color="primary" startIcon={<CheckCircleIcon />}>
                Approve & Execute
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MarketsAIDashboard;