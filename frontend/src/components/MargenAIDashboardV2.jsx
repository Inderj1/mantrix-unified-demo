import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Assessment as AssessmentIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Insights as InsightsIcon,
  ShowChart as ShowChartIcon,
  AccountTree as AccountTreeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { apiService } from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const MargenAIDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Data states
  const [summaryData, setSummaryData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [cashData, setCashData] = useState(null);
  const [growthData, setGrowthData] = useState(null);
  const [actionData, setActionData] = useState(null);
  
  // Filters
  const [timePeriod, setTimePeriod] = useState('ytd');
  const [groupBy, setGroupBy] = useState('customer');

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab, timePeriod, groupBy]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      switch (activeTab) {
        case 0: // Executive Summary
          const summary = await apiService.getExecutiveSummary();
          setSummaryData(summary.data);
          break;
          
        case 1: // Revenue & Profitability
          const revenue = await apiService.getRevenueProfitability({
            group_by: groupBy, 
            time_period: timePeriod
          });
          setRevenueData(revenue.data);
          break;
          
        case 2: // Cash & Working Capital
          const cash = await apiService.getCashWorkingCapital();
          setCashData(cash.data);
          break;
          
        case 3: // Growth & Market Position
          const growth = await apiService.getGrowthMarketPosition();
          setGrowthData(growth.data);
          break;
          
        case 4: // Action & Accountability
          const action = await apiService.getActionAccountability();
          setActionData(action.data);
          break;
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const renderErrorState = () => (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
      <Button 
        variant="contained" 
        onClick={handleRefresh}
        disabled={refreshing}
      >
        {refreshing ? <CircularProgress size={20} /> : 'Retry'}
      </Button>
    </Box>
  );

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

  const renderExecutiveSummary = () => {
    if (!summaryData) return null;

    const { kpis, health_scores, trends, alerts, gl_summary, segment_distribution } = summaryData;

    return (
      <Box>
        {/* KPI Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography color="textSecondary" variant="h6">
                    Revenue
                  </Typography>
                  <MoneyIcon color="primary" />
                </Box>
                <Typography variant="h4" gutterBottom>
                  {formatCurrency(kpis.revenue)}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {trends.revenue_growth >= 0 ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    color={trends.revenue_growth >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatPercentage(trends.revenue_growth)} YoY
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography color="textSecondary" variant="h6">
                    Gross Margin
                  </Typography>
                  <ShowChartIcon color="primary" />
                </Box>
                <Typography variant="h4" gutterBottom>
                  {formatCurrency(kpis.gross_margin)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {kpis.margin_percentage.toFixed(1)}% of Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography color="textSecondary" variant="h6">
                    Total Customers
                  </Typography>
                  <PersonIcon color="primary" />
                </Box>
                <Typography variant="h4" gutterBottom>
                  {kpis.total_customers.toLocaleString()}
                </Typography>
                <Typography variant="body2" color={trends.customer_growth >= 0 ? 'success.main' : 'error.main'}>
                  {formatPercentage(trends.customer_growth)} growth
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography color="textSecondary" variant="h6">
                    Avg Order Value
                  </Typography>
                  <MoneyIcon color="primary" />
                </Box>
                <Typography variant="h4" gutterBottom>
                  {formatCurrency(kpis.avg_order_value)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {kpis.total_orders.toLocaleString()} orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Health Scores */}
        <Paper elevation={2} sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Business Health Scores
          </Typography>
          <Grid container spacing={3}>
            {Object.entries(health_scores).map(([key, value]) => (
              <Grid item xs={12} md={3} key={key}>
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {value}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={value} 
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      backgroundColor: 'grey.300',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: value >= 80 ? 'success.main' : value >= 60 ? 'warning.main' : 'error.main'
                      }
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <Paper elevation={2} sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Alerts & Opportunities
            </Typography>
            <List>
              {alerts.map((alert, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      {alert.type === 'warning' ? (
                        <WarningIcon color="warning" />
                      ) : (
                        <CheckCircleIcon color="success" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {alert.description}
                          </Typography>
                          <br />
                          <Typography component="span" variant="caption" color="text.secondary">
                            GL Accounts: {alert.gl_accounts.join(', ')} | Impact: {alert.impact}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < alerts.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        {/* Segment Distribution */}
        {segment_distribution && (
          <Paper elevation={2} sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Segment Distribution
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Segment</TableCell>
                    <TableCell align="right">Customers</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">% of Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {segment_distribution.map((segment) => (
                    <TableRow key={segment.segment}>
                      <TableCell>{segment.segment}</TableCell>
                      <TableCell align="right">{segment.customers.toLocaleString()}</TableCell>
                      <TableCell align="right">{formatCurrency(segment.revenue)}</TableCell>
                      <TableCell align="right">{segment.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    );
  };

  const renderRevenueProfitability = () => {
    if (!revenueData) return null;

    const { data, summary, gl_breakdown, waterfall_data } = revenueData;

    // Chart data for waterfall
    const waterfallChartData = {
      labels: waterfall_data.map(d => d.name),
      datasets: [{
        label: 'Value',
        data: waterfall_data.map(d => Math.abs(d.value)),
        backgroundColor: waterfall_data.map(d => 
          d.type === 'positive' ? 'rgba(75, 192, 192, 0.6)' : 
          d.type === 'negative' ? 'rgba(255, 99, 132, 0.6)' : 
          'rgba(54, 162, 235, 0.6)'
        ),
        borderColor: waterfall_data.map(d => 
          d.type === 'positive' ? 'rgba(75, 192, 192, 1)' : 
          d.type === 'negative' ? 'rgba(255, 99, 132, 1)' : 
          'rgba(54, 162, 235, 1)'
        ),
        borderWidth: 1
      }]
    };

    return (
      <Box>
        {/* Filters */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Group By</InputLabel>
                <Select
                  value={groupBy}
                  label="Group By"
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="material">Product</MenuItem>
                  <MenuItem value="segment">Segment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={timePeriod}
                  label="Time Period"
                  onChange={(e) => setTimePeriod(e.target.value)}
                >
                  <MenuItem value="current_month">Current Month</MenuItem>
                  <MenuItem value="current_quarter">Current Quarter</MenuItem>
                  <MenuItem value="ytd">Year to Date</MenuItem>
                  <MenuItem value="last_year">Last Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(summary.total_revenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Gross Margin
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(summary.total_gross_margin)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Margin %
                </Typography>
                <Typography variant="h5">
                  {summary.overall_margin_pct.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Records
                </Typography>
                <Typography variant="h5">
                  {summary.total_records.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Data Table */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</TableCell>
                  {groupBy === 'customer' && <TableCell>Segment</TableCell>}
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Gross Margin</TableCell>
                  <TableCell align="right">Margin %</TableCell>
                  {groupBy !== 'segment' && <TableCell align="right">Orders</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row[groupBy] || row.product || row.segment}</TableCell>
                    {groupBy === 'customer' && <TableCell>{row.segment}</TableCell>}
                    <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.gross_margin)}</TableCell>
                    <TableCell align="right">{row.margin_pct}%</TableCell>
                    {groupBy !== 'segment' && <TableCell align="right">{row.order_count}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Waterfall Chart */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            P&L Waterfall
          </Typography>
          <Box sx={{ height: 300 }}>
            <Bar data={waterfallChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => formatCurrency(value)
                  }
                }
              }
            }} />
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderCashWorkingCapital = () => {
    if (!cashData) return null;

    const { cash_flow_trend, working_capital, division_metrics, gl_accounts, key_ratios } = cashData;

    // Chart data for cash flow trend
    const cashFlowChartData = {
      labels: cash_flow_trend.map(d => d.year_month),
      datasets: [
        {
          label: 'Cash Inflow',
          data: cash_flow_trend.map(d => d.cash_inflow),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        },
        {
          label: 'Cash Outflow',
          data: cash_flow_trend.map(d => d.cash_outflow),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        },
        {
          label: 'Net Cash Flow',
          data: cash_flow_trend.map(d => d.net_cash_flow),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.1
        }
      ]
    };

    return (
      <Box>
        {/* Working Capital Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Working Capital Position
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Current Assets</Typography>
                  <Typography variant="h6">{formatCurrency(working_capital.current_assets.total)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Current Liabilities</Typography>
                  <Typography variant="h6">{formatCurrency(working_capital.current_liabilities.total)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Working Capital</Typography>
                  <Typography variant="h6" color="primary">{formatCurrency(working_capital.working_capital)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Current Ratio</Typography>
                  <Typography variant="h6">{working_capital.current_ratio.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Key Ratios
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(key_ratios).map(([key, value]) => (
                  <Grid item xs={6} key={key}>
                    <Typography variant="body2" color="textSecondary">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    <Typography variant="h6">
                      {key.includes('ratio') ? value.toFixed(2) : formatCurrency(value)}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Cash Flow Trend */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cash Flow Trend
          </Typography>
          <Box sx={{ height: 300 }}>
            <Line data={cashFlowChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => formatCurrency(value)
                  }
                }
              }
            }} />
          </Box>
        </Paper>

        {/* Division Metrics */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Division Metrics
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Division</TableCell>
                  <TableCell>Cost Center</TableCell>
                  <TableCell align="right">Cash Position</TableCell>
                  <TableCell align="right">AR Balance</TableCell>
                  <TableCell align="right">AP Balance</TableCell>
                  <TableCell align="right">DSO</TableCell>
                  <TableCell align="right">DPO</TableCell>
                  <TableCell align="right">CCC</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {division_metrics.map((division) => (
                  <TableRow key={division.division}>
                    <TableCell>{division.division}</TableCell>
                    <TableCell>{division.cost_center}</TableCell>
                    <TableCell align="right">{formatCurrency(division.cash_position)}</TableCell>
                    <TableCell align="right">{formatCurrency(division.ar_balance)}</TableCell>
                    <TableCell align="right">{formatCurrency(division.ap_balance)}</TableCell>
                    <TableCell align="right">{division.dso}</TableCell>
                    <TableCell align="right">{division.dpo}</TableCell>
                    <TableCell align="right">{division.cash_conversion_cycle}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    );
  };

  const renderGrowthMarketPosition = () => {
    if (!growthData) return null;

    const { growth_metrics, acquisition_metrics, product_performance, sales_organization, market_position } = growthData;

    // Chart data for growth trend
    const growthChartData = {
      labels: growth_metrics.map(d => `${d.year}-${d.month.toString().padStart(2, '0')}`),
      datasets: [
        {
          label: 'Revenue Growth %',
          data: growth_metrics.map(d => d.revenue_growth_pct),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          yAxisID: 'y',
          tension: 0.1
        },
        {
          label: 'Customer Growth %',
          data: growth_metrics.map(d => d.customer_growth_pct),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          yAxisID: 'y',
          tension: 0.1
        }
      ]
    };

    return (
      <Box>
        {/* Acquisition Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={2.4}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" variant="body2" gutterBottom>
                  New Customers
                </Typography>
                <Typography variant="h6">
                  {acquisition_metrics.new_customers.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" variant="body2" gutterBottom>
                  CAC
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(acquisition_metrics.cac)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" variant="body2" gutterBottom>
                  Avg LTV
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(acquisition_metrics.avg_ltv)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" variant="body2" gutterBottom>
                  LTV:CAC
                </Typography>
                <Typography variant="h6">
                  {acquisition_metrics.ltv_cac_ratio.toFixed(1)}x
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" variant="body2" gutterBottom>
                  Payback
                </Typography>
                <Typography variant="h6">
                  {acquisition_metrics.payback_period_months} mo
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Growth Trend Chart */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Growth Trends
          </Typography>
          <Box sx={{ height: 300 }}>
            <Line data={growthChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' }
              },
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  ticks: {
                    callback: (value) => `${value}%`
                  }
                }
              }
            }} />
          </Box>
        </Paper>

        {/* Product Performance */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Top Product Performance
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Gross Margin</TableCell>
                  <TableCell align="right">Margin %</TableCell>
                  <TableCell align="right">Customer Reach</TableCell>
                  <TableCell align="right">Volume</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {product_performance.slice(0, 5).map((product) => (
                  <TableRow key={product.product_brand}>
                    <TableCell>{product.product_brand}</TableCell>
                    <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                    <TableCell align="right">{formatCurrency(product.gross_margin)}</TableCell>
                    <TableCell align="right">{product.margin_pct}%</TableCell>
                    <TableCell align="right">{product.customer_reach.toLocaleString()}</TableCell>
                    <TableCell align="right">{product.volume.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Market Position */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Market Position
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Overall Market Share" secondary={`${market_position.overall_market_share}%`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Market Share Trend" secondary={`${formatPercentage(market_position.market_share_trend)}`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Win Rate" secondary={`${market_position.win_rate}%`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Competitive Wins" secondary={market_position.competitive_wins} />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sales Pipeline
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Total Pipeline" secondary={formatCurrency(growthData.pipeline_metrics.total_pipeline)} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Qualified Pipeline" secondary={formatCurrency(growthData.pipeline_metrics.qualified_pipeline)} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Conversion Rate" secondary={`${growthData.pipeline_metrics.conversion_rate}%`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Avg Deal Size" secondary={formatCurrency(growthData.pipeline_metrics.avg_deal_size)} />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderActionAccountability = () => {
    if (!actionData) return null;

    const { opportunities, scenarios, gl_impact_summary, accountability_matrix } = actionData;

    return (
      <Box>
        {/* Top Opportunities */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Value Creation Opportunities
          </Typography>
          <Grid container spacing={3}>
            {opportunities.slice(0, 3).map((opp) => (
              <Grid item xs={12} md={4} key={opp.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Chip 
                      label={opp.type.replace(/_/g, ' ').toUpperCase()} 
                      size="small" 
                      color={opp.type === 'margin_improvement' ? 'primary' : opp.type === 'revenue_growth' ? 'success' : 'secondary'}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h6" gutterBottom>
                      {opp.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Current: {formatCurrency(opp.current_value)} → Target: {formatCurrency(opp.target_value)}
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                      Impact: {formatCurrency(opp.impact)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Owner: {opp.owner} | Timeline: {opp.timeline}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="textSecondary">
                      GL Accounts: {opp.gl_accounts.join(', ')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Scenario Analysis */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Scenario Analysis
          </Typography>
          <TableContainer>
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
                {scenarios.map((scenario) => (
                  <TableRow key={scenario.name}>
                    <TableCell>{scenario.name}</TableCell>
                    <TableCell align="right">{formatCurrency(scenario.impact.revenue)}</TableCell>
                    <TableCell align="right">{formatCurrency(scenario.impact.margin)}</TableCell>
                    <TableCell align="right">{formatCurrency(scenario.impact.ebitda)}</TableCell>
                    <TableCell>
                      Margin: +{scenario.assumptions.margin_improvement}%, 
                      Revenue: +{scenario.assumptions.revenue_growth}%, 
                      Cost: -{scenario.assumptions.cost_reduction}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Accountability Matrix */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Accountability Matrix
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Owner</TableCell>
                  <TableCell align="right">Opportunities</TableCell>
                  <TableCell align="right">Total Impact</TableCell>
                  <TableCell>Key GL Accounts</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accountability_matrix.map((item) => (
                  <TableRow key={item.owner}>
                    <TableCell>{item.owner}</TableCell>
                    <TableCell align="right">{item.opportunities_count}</TableCell>
                    <TableCell align="right">{formatCurrency(item.total_impact)}</TableCell>
                    <TableCell>{item.key_gl_accounts.join(', ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <Alert severity="error">
            {error}
          </Alert>
        </Box>
      );
    }

    // Check if data is available for current tab
    const hasData = () => {
      switch (activeTab) {
        case 0: return summaryData;
        case 1: return revenueData;
        case 2: return cashData;
        case 3: return growthData;
        case 4: return actionData;
        default: return false;
      }
    };
    
    if (!hasData()) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <Typography variant="h6" color="text.secondary">
            No data available. Please check if the API server is running.
          </Typography>
        </Box>
      );
    }

    switch (activeTab) {
      case 0:
        return renderExecutiveSummary();
      case 1:
        return renderRevenueProfitability();
      case 2:
        return renderCashWorkingCapital();
      case 3:
        return renderGrowthMarketPosition();
      case 4:
        return renderActionAccountability();
      default:
        return null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header with Breadcrumbs */}
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              underline="hover"
              color="inherit"
              onClick={onBack}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
              Core.AI
            </Link>
            <Typography color="text.primary">MARGEN.AI</Typography>
          </Breadcrumbs>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Executive Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Comprehensive view of financial performance, operational metrics, and strategic opportunities
        </Typography>

        {/* Tabs */}
        <Paper elevation={1} sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Executive Summary" icon={<AssessmentIcon />} iconPosition="start" />
            <Tab label="Revenue & Profitability" icon={<MoneyIcon />} iconPosition="start" />
            <Tab label="Cash & Working Capital" icon={<AccountBalanceIcon />} iconPosition="start" />
            <Tab label="Growth & Market Position" icon={<TrendingUpIcon />} iconPosition="start" />
            <Tab label="Action & Accountability" icon={<InsightsIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {error ? renderErrorState() : renderContent()}
      </Box>
    </Box>
  );
};

export default MargenAIDashboard;