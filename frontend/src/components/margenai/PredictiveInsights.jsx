import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Slider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Tooltip,
  Breadcrumbs,
  Link,
  Stack,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  PlayArrow as PlayIcon,
  Timeline as TimelineIcon,
  AccountTree as ScenarioIcon,
  AttachMoney as MoneyIcon,
  ZoomIn as ZoomInIcon,
  Edit as EditIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import './shared/chartSetup'; // Import Chart.js setup to register components first
import { Line, Bar } from 'react-chartjs-2';
import InteractiveChart from './shared/InteractiveChart';

const PredictiveInsights = ({ actionData, growthData, summaryData, onDrillDown, onBack }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState('Base Case');
  const [forecastHorizon, setForecastHorizon] = useState(12); // months
  const [whatIfParams, setWhatIfParams] = useState({
    revenue_growth: 8,
    margin_improvement: 3.5,
    cost_reduction: 5,
    customer_retention: 85
  });
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [actionDialog, setActionDialog] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const calculateForecast = () => {
    // Simplified forecast calculation
    const baseRevenue = summaryData?.kpis?.revenue || 10000000;
    const monthlyGrowth = whatIfParams.revenue_growth / 12 / 100;
    
    const forecast = [];
    let cumulativeRevenue = baseRevenue;
    
    for (let i = 1; i <= forecastHorizon; i++) {
      cumulativeRevenue *= (1 + monthlyGrowth);
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      
      forecast.push({
        month: month.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        revenue: cumulativeRevenue,
        margin: cumulativeRevenue * ((summaryData?.kpis?.margin_percentage || 30) + whatIfParams.margin_improvement) / 100,
        costs: cumulativeRevenue * (1 - ((summaryData?.kpis?.margin_percentage || 30) + whatIfParams.margin_improvement) / 100) * (1 - whatIfParams.cost_reduction / 100)
      });
    }
    
    return forecast;
  };

  const renderOpportunities = () => {
    if (!actionData) return null;

    const { opportunities = [], gl_impact_summary = {} } = actionData;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Value Creation Opportunities
        </Typography>

        <Grid container spacing={3}>
          {opportunities.map((opp) => (
            <Grid item xs={12} md={6} lg={4} key={opp.id}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={() => setSelectedOpportunity(opp)}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip 
                      label={opp.type.replace(/_/g, ' ').toUpperCase()} 
                      size="small" 
                      color={
                        opp.type === 'margin_improvement' ? 'primary' : 
                        opp.type === 'revenue_growth' ? 'success' : 
                        'secondary'
                      }
                    />
                    <Chip 
                      label={opp.timeline} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    {opp.title}
                  </Typography>
                  
                  <Box sx={{ my: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Current Value
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(opp.current_value)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Target Value
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(opp.target_value)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(opp.current_value / opp.target_value) * 100}
                      sx={{ my: 1, height: 6, borderRadius: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="h5" color="primary" gutterBottom>
                    Impact: {formatCurrency(opp.impact)}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={1} mt={2}>
                    <AssignmentIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {opp.owner}
                    </Typography>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    GL Accounts: {opp.gl_accounts.join(', ')}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOpportunity(opp);
                      setActionDialog(true);
                    }}
                  >
                    View Actions
                  </Button>
                  <Button 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDrillDown({
                        type: 'opportunity_details',
                        opportunity: opp,
                        title: `Deep Dive: ${opp.title}`
                      });
                    }}
                  >
                    Deep Dive
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* GL Impact Summary */}
        <Paper elevation={2} sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Projected GL Impact
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Revenue Accounts</Typography>
              <List dense>
                {(gl_impact_summary.revenue_accounts || []).map((account) => (
                  <ListItem key={account.account}>
                    <ListItemText 
                      primary={`${account.account} - ${account.name}`}
                      secondary={formatCurrency(account.impact)}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => onDrillDown({
                          type: 'gl_forecast',
                          account: account.account,
                          title: `Forecast for GL ${account.account}`
                        })}
                      >
                        <ZoomInIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Expense Accounts</Typography>
              <List dense>
                {(gl_impact_summary.expense_accounts || []).map((account) => (
                  <ListItem key={account.account}>
                    <ListItemText 
                      primary={`${account.account} - ${account.name}`}
                      secondary={formatCurrency(account.impact)}
                      secondaryTypographyProps={{ color: 'error' }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => onDrillDown({
                          type: 'gl_forecast',
                          account: account.account,
                          title: `Forecast for GL ${account.account}`
                        })}
                      >
                        <ZoomInIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Net Impact</Typography>
            <Typography variant="h5" color="primary">
              {formatCurrency(gl_impact_summary.net_impact || 0)}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderForecasts = () => {
    const forecastData = calculateForecast();
    
    const chartData = {
      labels: forecastData.map(d => d.month),
      datasets: [
        {
          label: 'Revenue Forecast',
          data: forecastData.map(d => d.revenue),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        },
        {
          label: 'Margin Forecast',
          data: forecastData.map(d => d.margin),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.1
        },
        {
          label: 'Cost Forecast',
          data: forecastData.map(d => d.costs),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        }
      ]
    };

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Financial Forecasts
        </Typography>

        {/* Forecast Controls */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <Typography gutterBottom>Forecast Horizon</Typography>
              <Slider
                value={forecastHorizon}
                onChange={(e, v) => setForecastHorizon(v)}
                min={3}
                max={24}
                step={3}
                marks
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v} months`}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Typography variant="subtitle2" gutterBottom>Key Metrics (Next 12 Months)</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="body2" color="text.secondary">Projected Revenue</Typography>
                      <Typography variant="h6">{formatCurrency(forecastData[11]?.revenue || 0)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="body2" color="text.secondary">Projected Margin</Typography>
                      <Typography variant="h6">{formatCurrency(forecastData[11]?.margin || 0)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="body2" color="text.secondary">Revenue Growth</Typography>
                      <Typography variant="h6">{formatPercentage(whatIfParams.revenue_growth * 12)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="body2" color="text.secondary">Margin Improvement</Typography>
                      <Typography variant="h6">{formatPercentage(whatIfParams.margin_improvement)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* Forecast Chart */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <InteractiveChart
            type="line"
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => formatCurrency(value)
                  }
                }
              }
            }}
            height={400}
            onElementClick={(datasetIndex, dataIndex) => {
              const month = forecastData[dataIndex];
              onDrillDown({
                type: 'forecast_details',
                month: month.month,
                title: `Forecast Details for ${month.month}`
              });
            }}
          />
        </Paper>
      </Box>
    );
  };

  const renderWhatIfAnalysis = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          What-If Scenario Analysis
        </Typography>

        <Grid container spacing={3}>
          {/* Parameter Controls */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Adjust Parameters
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>Revenue Growth (%)</Typography>
                <Slider
                  value={whatIfParams.revenue_growth}
                  onChange={(e, v) => setWhatIfParams(prev => ({ ...prev, revenue_growth: v }))}
                  min={-10}
                  max={30}
                  step={0.5}
                  marks
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v}%`}
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>Margin Improvement (%)</Typography>
                <Slider
                  value={whatIfParams.margin_improvement}
                  onChange={(e, v) => setWhatIfParams(prev => ({ ...prev, margin_improvement: v }))}
                  min={-5}
                  max={10}
                  step={0.5}
                  marks
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v}%`}
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>Cost Reduction (%)</Typography>
                <Slider
                  value={whatIfParams.cost_reduction}
                  onChange={(e, v) => setWhatIfParams(prev => ({ ...prev, cost_reduction: v }))}
                  min={0}
                  max={20}
                  step={0.5}
                  marks
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v}%`}
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>Customer Retention (%)</Typography>
                <Slider
                  value={whatIfParams.customer_retention}
                  onChange={(e, v) => setWhatIfParams(prev => ({ ...prev, customer_retention: v }))}
                  min={50}
                  max={100}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v}%`}
                />
              </Box>
              
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 3 }}
                startIcon={<PlayIcon />}
              >
                Run Scenario
              </Button>
            </Paper>
          </Grid>

          {/* Scenario Comparison */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Scenario Comparison
              </Typography>
              
              {actionData?.scenarios && (
                <TableContainer sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Scenario</TableCell>
                        <TableCell align="right">Revenue Impact</TableCell>
                        <TableCell align="right">Margin Impact</TableCell>
                        <TableCell align="right">EBITDA Impact</TableCell>
                        <TableCell>Key Assumptions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {actionData.scenarios.map((scenario) => (
                        <TableRow 
                          key={scenario.name}
                          selected={scenario.name === selectedScenario}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setSelectedScenario(scenario.name)}
                        >
                          <TableCell>
                            <Chip 
                              label={scenario.name} 
                              size="small"
                              color={scenario.name === selectedScenario ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">{formatCurrency(scenario.impact.revenue)}</TableCell>
                          <TableCell align="right">{formatCurrency(scenario.impact.margin)}</TableCell>
                          <TableCell align="right">{formatCurrency(scenario.impact.ebitda)}</TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              Margin: +{scenario.assumptions.margin_improvement}%, 
                              Revenue: +{scenario.assumptions.revenue_growth}%, 
                              Cost: -{scenario.assumptions.cost_reduction}%
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell>
                          <Chip 
                            label="Custom Scenario" 
                            size="small"
                            color="secondary"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            (summaryData?.kpis?.revenue || 10000000) * 
                            (whatIfParams.revenue_growth / 100)
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            (summaryData?.kpis?.revenue || 10000000) * 
                            (whatIfParams.margin_improvement / 100)
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            (summaryData?.kpis?.revenue || 10000000) * 
                            ((whatIfParams.revenue_growth + whatIfParams.margin_improvement - whatIfParams.cost_reduction) / 100)
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            Based on current parameter settings
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderRiskAlerts = () => {
    const risks = [
      {
        id: 1,
        severity: 'high',
        title: 'Cash Flow Risk',
        description: 'Projected cash flow may turn negative in Q3 if current trends continue',
        impact: '$850,000',
        mitigation: 'Accelerate collections, delay non-critical capex',
        probability: 65
      },
      {
        id: 2,
        severity: 'medium',
        title: 'Customer Concentration',
        description: 'Top 3 customers represent 45% of revenue',
        impact: '$2.3M at risk',
        mitigation: 'Diversify customer base, strengthen contracts',
        probability: 40
      },
      {
        id: 3,
        severity: 'low',
        title: 'Inventory Turnover',
        description: 'Inventory turnover declining, may impact working capital',
        impact: '$320,000',
        mitigation: 'Implement JIT practices, review slow-moving SKUs',
        probability: 30
      }
    ];

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Risk Alerts & Mitigation
        </Typography>

        <Grid container spacing={3}>
          {risks.map((risk) => (
            <Grid item xs={12} key={risk.id}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3,
                  borderLeft: 4,
                  borderColor: 
                    risk.severity === 'high' ? 'error.main' : 
                    risk.severity === 'medium' ? 'warning.main' : 
                    'info.main'
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <WarningIcon 
                        color={
                          risk.severity === 'high' ? 'error' : 
                          risk.severity === 'medium' ? 'warning' : 
                          'info'
                        }
                      />
                      <Typography variant="h6">{risk.title}</Typography>
                      <Chip 
                        label={risk.severity.toUpperCase()} 
                        size="small"
                        color={
                          risk.severity === 'high' ? 'error' : 
                          risk.severity === 'medium' ? 'warning' : 
                          'info'
                        }
                      />
                    </Box>
                    <Typography variant="body1" gutterBottom>
                      {risk.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mitigation: {risk.mitigation}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Impact</Typography>
                        <Typography variant="h6">{risk.impact}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Probability</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6">{risk.probability}%</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={risk.probability} 
                            sx={{ flex: 1, height: 6, borderRadius: 1 }}
                            color={
                              risk.severity === 'high' ? 'error' : 
                              risk.severity === 'medium' ? 'warning' : 
                              'info'
                            }
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

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
              Predictive Insights
            </Typography>
          </Breadcrumbs>
          {onBack && (
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
              Back to MargenAI
            </Button>
          )}
        </Stack>
      </Box>

      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Opportunities" icon={<MoneyIcon />} iconPosition="start" />
          <Tab label="Forecasts" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="What-If Analysis" icon={<ScenarioIcon />} iconPosition="start" />
          <Tab label="Risk Alerts" icon={<WarningIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && renderOpportunities()}
        {activeTab === 1 && renderForecasts()}
        {activeTab === 2 && renderWhatIfAnalysis()}
        {activeTab === 3 && renderRiskAlerts()}
      </Box>

      {/* Action Dialog */}
      <Dialog 
        open={actionDialog} 
        onClose={() => setActionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Action Plan: {selectedOpportunity?.title}
        </DialogTitle>
        <DialogContent>
          {selectedOpportunity && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Owner: {selectedOpportunity.owner} | Timeline: {selectedOpportunity.timeline}
              </Alert>
              <Typography variant="subtitle1" gutterBottom>
                Required Actions:
              </Typography>
              <List>
                {selectedOpportunity.actions.map((action, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={action} />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Expected Impact:
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(selectedOpportunity.impact)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Close</Button>
          <Button 
            variant="contained"
            onClick={() => {
              onDrillDown({
                type: 'opportunity_execution',
                opportunity: selectedOpportunity,
                title: `Execute: ${selectedOpportunity.title}`
              });
              setActionDialog(false);
            }}
          >
            Start Execution
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PredictiveInsights;