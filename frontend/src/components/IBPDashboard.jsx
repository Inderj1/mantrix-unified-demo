import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
  Stack,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Map as MapIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  ShowChart as ShowChartIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import GeographicAnalysis from './GeographicAnalysis';

// Sample IBP data for Arizona Beverages
const ibpData = {
  kpis: {
    revenue: { current: 84300000, target: 90000000, variance: -6.3, trend: 'up' },
    volume: { current: 12500000, target: 13200000, variance: -5.3, trend: 'down' },
    marketShare: { current: 24.7, target: 26.0, variance: -5.0, trend: 'up' },
    customerSat: { current: 87.2, target: 90.0, variance: -3.1, trend: 'up' },
  },
  planningCycles: [
    {
      id: 'monthly',
      name: 'Monthly Rolling Forecast',
      status: 'active',
      completion: 85,
      dueDate: '2025-07-30',
      participants: 12,
      regions: ['Southwest', 'California', 'Texas'],
    },
    {
      id: 'quarterly',
      name: 'Q3 2025 Business Review',
      status: 'planning',
      completion: 45,
      dueDate: '2025-08-15',
      participants: 8,
      regions: ['All Regions'],
    },
    {
      id: 'annual',
      name: '2026 Strategic Plan',
      status: 'draft',
      completion: 20,
      dueDate: '2025-09-30',
      participants: 15,
      regions: ['All Regions'],
    },
  ],
  scenarios: [
    {
      id: 'base',
      name: 'Base Case',
      probability: 60,
      revenue: 84300000,
      profit: 12600000,
      riskLevel: 'low',
      active: true,
    },
    {
      id: 'optimistic',
      name: 'Growth Scenario',
      probability: 25,
      revenue: 92800000,
      profit: 15200000,
      riskLevel: 'medium',
      active: false,
    },
    {
      id: 'pessimistic',
      name: 'Conservative',
      probability: 15,
      revenue: 76200000,
      profit: 9800000,
      riskLevel: 'high',
      active: false,
    },
  ],
  regionalPerformance: [
    { region: 'Southwest', revenue: 21500000, growth: 8.2, planAccuracy: 92, riskScore: 15 },
    { region: 'California', revenue: 28400000, growth: 12.1, planAccuracy: 88, riskScore: 22 },
    { region: 'Texas', revenue: 19800000, growth: -2.3, planAccuracy: 85, riskScore: 35 },
    { region: 'Florida', revenue: 14600000, growth: 15.4, planAccuracy: 94, riskScore: 18 },
  ],
  supplyChainMetrics: {
    inventoryTurnover: 8.4,
    fillRate: 96.2,
    onTimeDelivery: 94.8,
    supplierPerformance: 91.5,
    capacityUtilization: 82.3,
  },
};

const IBPDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState('base');
  const [planningHorizon, setPlanningHorizon] = useState('monthly');
  const [showGeographicDetail, setShowGeographicDetail] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'planning': return 'warning';
      case 'draft': return 'info';
      default: return 'default';
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore < 20) return 'success';
    if (riskScore < 30) return 'warning';
    return 'error';
  };

  const renderKPICard = (title, data, icon) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" color="primary" gutterBottom>
          {title === 'Revenue' ? `$${(data.current / 1000000).toFixed(1)}M` :
           title === 'Volume' ? `${(data.current / 1000000).toFixed(1)}M units` :
           `${data.current}${title.includes('Share') || title.includes('Satisfaction') ? '%' : ''}`}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {data.trend === 'up' ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
          <Typography 
            variant="body2" 
            color={data.variance > 0 ? 'success.main' : 'error.main'}
          >
            {data.variance > 0 ? '+' : ''}{data.variance}% vs target
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={Math.abs((data.current / data.target) * 100)}
          color={data.variance > -5 ? 'success' : 'warning'}
          sx={{ mt: 1 }}
        />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BusinessIcon color="primary" />
        Integrated Business Planning (IBP)
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Arizona Beverages - Strategic Planning & Performance Management
      </Typography>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Executive Dashboard" icon={<AssessmentIcon />} />
          <Tab label="Planning Cycles" icon={<ScheduleIcon />} />
          <Tab label="Scenario Planning" icon={<ShowChartIcon />} />
          <Tab label="Geographic Analysis" icon={<MapIcon />} />
          <Tab label="Supply Chain IBP" icon={<ShippingIcon />} />
        </Tabs>
      </Paper>

      {/* Executive Dashboard Tab */}
      {activeTab === 0 && (
        <Box>
          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              {renderKPICard('Revenue', ibpData.kpis.revenue, <MoneyIcon color="primary" />)}
            </Grid>
            <Grid item xs={12} md={3}>
              {renderKPICard('Volume', ibpData.kpis.volume, <InventoryIcon color="secondary" />)}
            </Grid>
            <Grid item xs={12} md={3}>
              {renderKPICard('Market Share', ibpData.kpis.marketShare, <TrendingUpIcon color="success" />)}
            </Grid>
            <Grid item xs={12} md={3}>
              {renderKPICard('Customer Satisfaction', ibpData.kpis.customerSat, <GroupIcon color="info" />)}
            </Grid>
          </Grid>

          {/* Regional Performance */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Regional Performance Summary
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Region</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="right">Growth</TableCell>
                        <TableCell align="right">Plan Accuracy</TableCell>
                        <TableCell align="right">Risk Score</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ibpData.regionalPerformance.map((region) => (
                        <TableRow key={region.region}>
                          <TableCell>{region.region}</TableCell>
                          <TableCell align="right">
                            ${(region.revenue / 1000000).toFixed(1)}M
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${region.growth > 0 ? '+' : ''}${region.growth}%`}
                              color={region.growth > 0 ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">{region.planAccuracy}%</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={region.riskScore}
                              color={getRiskColor(region.riskScore)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              onClick={() => setShowGeographicDetail(true)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Planning Health
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircleIcon color="success" />
                      <Typography variant="body2">Monthly forecasts: On track</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WarningIcon color="warning" />
                      <Typography variant="body2">Q3 planning: Behind schedule</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" />
                      <Typography variant="body2">Data quality: Excellent</Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="secondary">
                      Next Actions
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <ScheduleIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Complete Q3 demand review"
                          secondary="Due: July 30"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <MapIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Update Texas region plan"
                          secondary="Performance review"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Planning Cycles Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {ibpData.planningCycles.map((cycle) => (
            <Grid item xs={12} md={4} key={cycle.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6">{cycle.name}</Typography>
                    <Chip label={cycle.status} color={getStatusColor(cycle.status)} size="small" />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Due: {cycle.dueDate}
                  </Typography>
                  
                  <Box sx={{ my: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Progress: {cycle.completion}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={cycle.completion}
                      color={cycle.completion > 80 ? 'success' : cycle.completion > 50 ? 'warning' : 'error'}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {cycle.participants} participants
                    </Typography>
                    <Button size="small" variant="outlined">
                      View Plan
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Scenario Planning Tab */}
      {activeTab === 2 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Scenario Comparison
            </Typography>
            <Grid container spacing={3}>
              {ibpData.scenarios.map((scenario) => (
                <Grid item xs={12} md={4} key={scenario.id}>
                  <Card 
                    sx={{ 
                      border: selectedScenario === scenario.id ? 2 : 1,
                      borderColor: selectedScenario === scenario.id ? 'primary.main' : 'divider',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {scenario.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Probability: {scenario.probability}%
                      </Typography>
                      
                      <Typography variant="h5" color="primary" gutterBottom>
                        ${(scenario.revenue / 1000000).toFixed(1)}M
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Revenue
                      </Typography>
                      
                      <Typography variant="h6" color="secondary">
                        ${(scenario.profit / 1000000).toFixed(1)}M
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Profit
                      </Typography>

                      <Chip 
                        label={`${scenario.riskLevel} risk`}
                        color={scenario.riskLevel === 'low' ? 'success' : scenario.riskLevel === 'medium' ? 'warning' : 'error'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Geographic Analysis Tab */}
      {activeTab === 3 && (
        <Box>
          <GeographicAnalysis />
        </Box>
      )}

      {/* Supply Chain IBP Tab */}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Supply Chain KPIs
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Inventory Turnover
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {ibpData.supplyChainMetrics.inventoryTurnover}x
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Fill Rate
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {ibpData.supplyChainMetrics.fillRate}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    On-Time Delivery
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {ibpData.supplyChainMetrics.onTimeDelivery}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Capacity Utilization
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {ibpData.supplyChainMetrics.capacityUtilization}%
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                IBP Integration Points
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Demand Planning"
                    secondary="Real-time sync with sales forecasts"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Supply Planning"
                    secondary="Capacity constraints identified"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Financial Planning"
                    secondary="Budget alignment verified"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Geographic Detail Dialog */}
      <Dialog
        open={showGeographicDetail}
        onClose={() => setShowGeographicDetail(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Geographic Analysis Details
        </DialogTitle>
        <DialogContent>
          <GeographicAnalysis />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGeographicDetail(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IBPDashboard;