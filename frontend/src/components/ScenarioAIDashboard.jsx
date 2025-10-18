import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  TextField,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Alert,
  Tab,
  Tabs,
  Tooltip,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  alpha,
  InputAdornment,
  Switch,
  FormControlLabel,
  ButtonGroup,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  PlayArrow,
  Settings,
  TrendingUp,
  Psychology,
  AutoAwesome,
  Download,
  Share,
  Save,
  CompareArrows,
  Timeline,
  BarChart as BarChartIcon,
  ShowChart,
  PieChart as PieChartIcon,
  BubbleChart,
  Refresh,
  Add,
  Remove,
  RestartAlt,
  Info,
  Lock,
  LockOpen,
  Speed,
  Assessment,
  Lightbulb,
  Warning,
  CheckCircle,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

const ScenarioAIDashboard = ({ onBack }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [chartType, setChartType] = useState('composed');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState(['current']);
  
  // Muted corporate color scheme
  const corporateColors = {
    revenue: '#1565c0',    // Professional blue
    costs: '#b71c1c',      // Deep red
    profit: '#2e7d32',     // Forest green
    volume: '#5e35b1',     // Deep purple
    primary: '#37474f',    // Charcoal
    secondary: '#455a64',  // Blue grey
    info: '#00695c',       // Teal
  };
  
  // Scenario parameters
  const [parameters, setParameters] = useState({
    revenue_growth: 5,
    cost_reduction: 10,
    market_expansion: 15,
    price_adjustment: 0,
    volume_change: 0,
    efficiency_gain: 20,
    risk_factor: 5,
    seasonality: 50,
  });

  // Lock state for parameters
  const [lockedParams, setLockedParams] = useState({
    revenue_growth: false,
    cost_reduction: false,
    market_expansion: false,
    price_adjustment: false,
    volume_change: false,
    efficiency_gain: false,
    risk_factor: false,
    seasonality: false,
  });

  // Saved scenarios
  const [savedScenarios, setSavedScenarios] = useState([
    { id: 'optimistic', name: 'Optimistic Growth', params: { revenue_growth: 20, cost_reduction: 15, market_expansion: 30 }, color: '#2e7d32' },
    { id: 'conservative', name: 'Conservative', params: { revenue_growth: 3, cost_reduction: 5, market_expansion: 8 }, color: '#ed6c02' },
    { id: 'aggressive', name: 'Aggressive Expansion', params: { revenue_growth: 15, cost_reduction: 20, market_expansion: 40 }, color: '#c62828' },
  ]);

  // Generate data based on parameters
  const generateData = useCallback((params) => {
    const baseData = [
      { month: 'Jan', revenue: 100, costs: 80, profit: 20 },
      { month: 'Feb', revenue: 110, costs: 85, profit: 25 },
      { month: 'Mar', revenue: 120, costs: 90, profit: 30 },
      { month: 'Apr', revenue: 115, costs: 88, profit: 27 },
      { month: 'May', revenue: 125, costs: 92, profit: 33 },
      { month: 'Jun', revenue: 130, costs: 95, profit: 35 },
    ];

    return baseData.map((item, index) => ({
      ...item,
      revenue: item.revenue * (1 + params.revenue_growth / 100) * (1 + params.price_adjustment / 100),
      costs: item.costs * (1 - params.cost_reduction / 100) * (1 - params.efficiency_gain / 100),
      profit: item.revenue * (1 + params.revenue_growth / 100) - item.costs * (1 - params.cost_reduction / 100),
      volume: 100 + params.volume_change + (params.seasonality * Math.sin(index * Math.PI / 6)),
      risk: params.risk_factor * (1 + Math.random() * 0.2),
    }));
  }, []);

  const [chartData, setChartData] = useState(generateData(parameters));

  // Update chart data when parameters change
  useEffect(() => {
    setChartData(generateData(parameters));
  }, [parameters, generateData]);

  // Sensitivity analysis data
  const sensitivityData = Object.keys(parameters).map(param => ({
    parameter: param.replace(/_/g, ' ').toUpperCase(),
    impact: Math.abs(parameters[param] * (Math.random() * 0.5 + 0.5)),
    positive: parameters[param] > 0,
  })).sort((a, b) => b.impact - a.impact);

  // KPI calculations
  const calculateKPIs = (params) => {
    const data = generateData(params);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalCosts = data.reduce((sum, item) => sum + item.costs, 0);
    const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
    const avgMargin = (totalProfit / totalRevenue) * 100;
    
    return {
      totalRevenue: totalRevenue.toFixed(0),
      totalCosts: totalCosts.toFixed(0),
      totalProfit: totalProfit.toFixed(0),
      profitMargin: avgMargin.toFixed(1),
      roi: ((totalProfit / totalCosts) * 100).toFixed(1),
    };
  };

  const currentKPIs = calculateKPIs(parameters);

  const handleParameterChange = (param, value) => {
    if (!lockedParams[param]) {
      setParameters(prev => ({ ...prev, [param]: value }));
    }
  };

  const toggleLock = (param) => {
    setLockedParams(prev => ({ ...prev, [param]: !prev[param] }));
  };

  const resetParameters = () => {
    const newParams = { ...parameters };
    Object.keys(newParams).forEach(key => {
      if (!lockedParams[key]) {
        newParams[key] = 0;
      }
    });
    setParameters(newParams);
  };

  const loadScenario = (scenario) => {
    setParameters(prev => ({ ...prev, ...scenario.params }));
  };

  // Chart components
  const renderChart = () => {
    switch (chartType) {
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill={corporateColors.revenue} name="Revenue" />
              <Bar yAxisId="left" dataKey="costs" fill={corporateColors.costs} name="Costs" />
              <Line yAxisId="right" type="monotone" dataKey="profit" stroke={corporateColors.profit} name="Profit" strokeWidth={3} />
              <Area yAxisId="right" type="monotone" dataKey="volume" fill={alpha(corporateColors.volume, 0.3)} stroke={corporateColors.volume} name="Volume" />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      case 'radar':
        const radarData = Object.keys(parameters).map(key => ({
          parameter: key.replace(/_/g, ' '),
          value: parameters[key],
          fullMark: 100,
        }));
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="parameter" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Current Scenario" dataKey="value" stroke={corporateColors.primary} fill={corporateColors.primary} fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        const scatterData = chartData.map(item => ({
          x: item.revenue,
          y: item.profit,
          z: item.volume,
        }));
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="Revenue" />
              <YAxis type="number" dataKey="y" name="Profit" />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Revenue vs Profit" data={scatterData} fill={corporateColors.primary}>
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={corporateColors.primary} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header with Breadcrumbs */}
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link
            underline="hover"
            color="inherit"
            onClick={onBack}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            AXIS.AI
          </Link>
          <Typography color="text.primary">SCENARIO.AI</Typography>
        </Breadcrumbs>
      </Paper>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Scenario Planning & What-If Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore different business scenarios and their potential impacts on financial metrics
          </Typography>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
        {/* Left Panel - Parameters */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Scenario Controls */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Scenario Parameters
                </Typography>
                <ButtonGroup size="small">
                  <Tooltip title="Reset unlocked parameters">
                    <Button onClick={resetParameters} startIcon={<RestartAlt />}>
                      Reset
                    </Button>
                  </Tooltip>
                  <Tooltip title="Save current scenario">
                    <Button startIcon={<Save />}>
                      Save
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </Box>

              <Stack spacing={3}>
                {Object.entries(parameters).map(([key, value]) => (
                  <Box key={key}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 600, minWidth: 40, textAlign: 'right' }}>
                          {value}%
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleLock(key)}
                          sx={{ 
                            color: lockedParams[key] ? 'error.main' : 'text.secondary',
                            '&:hover': { color: lockedParams[key] ? 'error.dark' : 'text.primary' }
                          }}
                        >
                          {lockedParams[key] ? <Lock fontSize="small" /> : <LockOpen fontSize="small" />}
                        </IconButton>
                      </Box>
                    </Box>
                    <Slider
                      value={value}
                      onChange={(e, newValue) => handleParameterChange(key, newValue)}
                      disabled={lockedParams[key]}
                      min={-50}
                      max={50}
                      marks={[
                        { value: -50, label: '-50' },
                        { value: 0, label: '0' },
                        { value: 50, label: '50' }
                      ]}
                      sx={{
                        '& .MuiSlider-thumb': {
                          backgroundColor: lockedParams[key] ? theme.palette.grey[400] : corporateColors.primary,
                        },
                        '& .MuiSlider-track': {
                          backgroundColor: lockedParams[key] ? theme.palette.grey[400] : corporateColors.primary,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Saved Scenarios */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Saved Scenarios
              </Typography>
              <Stack spacing={2}>
                {savedScenarios.map((scenario) => (
                  <Card 
                    key={scenario.id}
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: scenario.color,
                        transform: 'translateX(4px)',
                      }
                    }}
                    onClick={() => loadScenario(scenario)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {scenario.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Revenue: +{scenario.params.revenue_growth}% | Cost: -{scenario.params.cost_reduction}%
                          </Typography>
                        </Box>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: scenario.color }} />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Panel - Visualizations */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* KPI Cards */}
            <Grid container spacing={2}>
              {[
                { label: 'Total Revenue', value: `$${currentKPIs.totalRevenue}K`, change: '+12.5%', icon: TrendingUp, color: 'success' },
                { label: 'Total Costs', value: `$${currentKPIs.totalCosts}K`, change: '-8.3%', icon: ShowChart, color: 'error' },
                { label: 'Profit Margin', value: `${currentKPIs.profitMargin}%`, change: '+3.2%', icon: Assessment, color: 'primary' },
                { label: 'ROI', value: `${currentKPIs.roi}%`, change: '+15.7%', icon: Speed, color: 'info' },
              ].map((kpi, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {kpi.label}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, my: 0.5 }}>
                          {kpi.value}
                        </Typography>
                        <Chip
                          label={kpi.change}
                          size="small"
                          color={kpi.color}
                          sx={{ 
                            height: 20,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <kpi.icon sx={{ color: `${kpi.color}.main`, fontSize: 28 }} />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Chart Section */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                  <Tab label="Scenario Analysis" />
                  <Tab label="Sensitivity" />
                  <Tab label="Comparison" />
                </Tabs>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <ToggleButtonGroup
                    value={chartType}
                    exclusive
                    onChange={(e, v) => v && setChartType(v)}
                    size="small"
                  >
                    <ToggleButton value="composed">
                      <Tooltip title="Combined View">
                        <BarChartIcon />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="radar">
                      <Tooltip title="Radar Chart">
                        <BubbleChart />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="scatter">
                      <Tooltip title="Scatter Plot">
                        <ShowChart />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                  
                  <IconButton>
                    <Download />
                  </IconButton>
                </Box>
              </Box>

              {/* Tab Content */}
              {activeTab === 0 && renderChart()}
              
              {activeTab === 1 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Parameter Sensitivity Analysis
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={sensitivityData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="parameter" type="category" width={120} />
                      <RechartsTooltip />
                      <Bar dataKey="impact" fill={corporateColors.primary}>
                        {sensitivityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.positive ? corporateColors.profit : corporateColors.costs} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
              
              {activeTab === 2 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Select multiple scenarios from the saved scenarios panel to compare their outcomes
                    </Typography>
                  </Alert>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke={corporateColors.primary} name="Current" strokeWidth={2} />
                      {savedScenarios.map((scenario, index) => (
                        <Line
                          key={scenario.id}
                          type="monotone"
                          dataKey="revenue"
                          data={generateData(scenario.params)}
                          stroke={scenario.color}
                          name={scenario.name}
                          strokeWidth={2}
                          strokeDasharray={index % 2 === 0 ? "5 5" : "0"}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Paper>

            {/* Insights Panel */}
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.04) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Lightbulb sx={{ color: 'info.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  AI-Powered Insights
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {[
                  { type: 'success', message: 'Revenue growth of 5% combined with 10% cost reduction yields optimal profit margins' },
                  { type: 'warning', message: 'Market expansion beyond 30% may strain operational capacity' },
                  { type: 'info', message: 'Seasonal variations account for 15% of volume fluctuations' },
                ].map((insight, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Alert 
                      severity={insight.type}
                      sx={{ 
                        height: '100%',
                        '& .MuiAlert-icon': {
                          fontSize: 20,
                        }
                      }}
                    >
                      <Typography variant="body2">
                        {insight.message}
                      </Typography>
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
};

export default ScenarioAIDashboard;