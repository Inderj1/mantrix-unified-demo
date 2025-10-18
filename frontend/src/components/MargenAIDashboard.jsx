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
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Timeline as TimelineIcon,
  LocalShipping as ShippingIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
  Lightbulb as LightbulbIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  ComposedChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend,
  Treemap,
  Scatter,
  ScatterChart,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { apiService } from '../services/api';

const MargenAIDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('ytd');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [glFilter, setGlFilter] = useState('all');
  const [materialGroupFilter, setMaterialGroupFilter] = useState('all');
  const [drillDownDialog, setDrillDownDialog] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Color palette
  const COLORS = {
    primary: '#1976d2',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    chart: ['#1976d2', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'],
  };

  // Load dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeframe, selectedDivision]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // In a real implementation, these would be actual API calls
      // For now, we'll use mock data that represents PostgreSQL table structures
      const mockData = {
        // Executive Summary KPIs
        kpis: {
          revenue: {
            current: 245.8,
            target: 250,
            vsLastYear: 12,
            vsTarget: -2.1,
            trend: 'up',
            byGL: [
              { gl: '4000-4999', name: 'Revenue', amount: 245.8 },
              { gl: '5000-5999', name: 'COGS', amount: -147.5 },
              { gl: '6000-6999', name: 'OpEx', amount: -45.2 },
            ]
          },
          ebitda: {
            current: 53.1,
            margin: 21.6,
            vsLastYear: 8.5,
            trend: 'up'
          },
          cashFlow: {
            free: 42.3,
            operating: 67.8,
            runway: 6.2,
            trend: 'down'
          },
          roic: {
            current: 18.5,
            target: 20,
            trend: 'stable'
          }
        },
        // Health Score
        healthScore: {
          overall: 78,
          components: [
            { name: 'Revenue Growth', score: 85, status: 'green' },
            { name: 'Margin Health', score: 72, status: 'yellow' },
            { name: 'Cash Position', score: 68, status: 'yellow' },
            { name: 'Customer Health', score: 88, status: 'green' },
          ]
        },
        // Alerts
        alerts: [
          {
            type: 'risk',
            severity: 'high',
            title: 'Margin Compression in Division 2',
            description: 'COGS increased 15% YoY due to Material Group 105',
            impact: '-$2.3M EBITDA',
            action: 'Review supplier contracts',
            glAccount: '5100-5199'
          },
          {
            type: 'opportunity',
            severity: 'medium',
            title: 'Revenue Upside in Customer Segment A',
            description: 'Top 20% customers showing 25% growth potential',
            impact: '+$4.5M Revenue',
            action: 'Increase sales coverage',
            glAccount: '4100-4199'
          },
        ],
        // Revenue Waterfall
        revenueWaterfall: [
          { name: 'Starting Revenue', value: 219.4, absolute: 219.4 },
          { name: 'Price Increase', value: 12.3, absolute: 231.7 },
          { name: 'Volume Growth', value: 18.5, absolute: 250.2 },
          { name: 'Mix Shift', value: -4.4, absolute: 245.8 },
        ],
        // Customer Profitability (from customer_master)
        customerProfitability: {
          segments: [
            { segment: 'Champions', revenue: 98.3, profit: 24.6, count: 82, avgMargin: 25.0 },
            { segment: 'Loyal Customers', revenue: 73.5, profit: 14.7, count: 156, avgMargin: 20.0 },
            { segment: 'Potential Loyalists', revenue: 49.2, profit: 7.4, count: 234, avgMargin: 15.0 },
            { segment: 'At Risk', revenue: 24.8, profit: 2.5, count: 189, avgMargin: 10.0 },
          ],
          unprofitable: {
            count: 127,
            revenue: 12.4,
            loss: -1.8,
            actions: ['Renegotiate terms', 'Increase prices', 'Reduce service levels']
          }
        },
        // Working Capital
        workingCapital: {
          dso: { current: 45, target: 40, trend: 'up' },
          dpo: { current: 38, target: 45, trend: 'down' },
          dio: { current: 62, target: 55, trend: 'up' },
          cashConversionCycle: 69,
          opportunity: 8.5, // $M
        },
        // Material Group Performance
        materialGroups: [
          { group: 'MG-101', name: 'Core Products', revenue: 123.4, margin: 28.5, growth: 12 },
          { group: 'MG-102', name: 'Premium Line', revenue: 67.8, margin: 35.2, growth: 18 },
          { group: 'MG-103', name: 'Value Products', revenue: 45.2, margin: 15.8, growth: -5 },
          { group: 'MG-104', name: 'New Products', revenue: 9.4, margin: 22.1, growth: 145 },
        ],
        // Action Items
        actionItems: [
          {
            id: 1,
            title: 'Optimize GL 5100-5199 (Direct Materials)',
            impact: 3.2,
            effort: 'Medium',
            timeline: 'Q2',
            owner: 'CFO',
            status: 'In Progress',
            glAccounts: ['5100', '5150', '5199']
          },
          {
            id: 2,
            title: 'Expand Material Group MG-102',
            impact: 4.5,
            effort: 'High',
            timeline: 'Q3',
            owner: 'Sales VP',
            status: 'Planning',
            materialGroups: ['MG-102']
          },
        ]
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Render functions for each tab
  const renderExecutiveSummary = () => (
    <Grid container spacing={3}>
      {/* Top KPIs */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {/* Revenue KPI */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              background: dashboardData.kpis.revenue.trend === 'up' 
                ? 'linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)' 
                : 'linear-gradient(135deg, #ffebee 0%, #ffffff 100%)'
            }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography color="text.secondary" variant="body2">
                    Revenue (YTD)
                  </Typography>
                  <Chip 
                    size="small" 
                    label={`${dashboardData.kpis.revenue.vsLastYear > 0 ? '+' : ''}${dashboardData.kpis.revenue.vsLastYear}%`}
                    color={dashboardData.kpis.revenue.vsLastYear > 0 ? 'success' : 'error'}
                  />
                </Stack>
                <Typography variant="h4" fontWeight="bold">
                  ${dashboardData.kpis.revenue.current}M
                </Typography>
                <Stack direction="row" spacing={2} mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    Target: ${dashboardData.kpis.revenue.target}M
                  </Typography>
                  <Typography variant="caption" color={dashboardData.kpis.revenue.vsTarget > 0 ? 'success.main' : 'error.main'}>
                    {dashboardData.kpis.revenue.vsTarget > 0 ? '+' : ''}{dashboardData.kpis.revenue.vsTarget}%
                  </Typography>
                </Stack>
                <Box mt={2}>
                  <ResponsiveContainer width="100%" height={40}>
                    <LineChart data={[{v:210},{v:215},{v:220},{v:225},{v:230},{v:240},{v:245.8}]}>
                      <Line type="monotone" dataKey="v" stroke={COLORS.primary} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* EBITDA KPI */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography color="text.secondary" variant="body2">
                    EBITDA
                  </Typography>
                  <Chip 
                    size="small" 
                    label={`${dashboardData.kpis.ebitda.margin}%`}
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="h4" fontWeight="bold">
                  ${dashboardData.kpis.ebitda.current}M
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs LY: +{dashboardData.kpis.ebitda.vsLastYear}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Free Cash Flow KPI */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography color="text.secondary" variant="body2">
                    Free Cash Flow
                  </Typography>
                  {dashboardData.kpis.cashFlow.trend === 'down' && (
                    <WarningIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                  )}
                </Stack>
                <Typography variant="h4" fontWeight="bold">
                  ${dashboardData.kpis.cashFlow.free}M
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Runway: {dashboardData.kpis.cashFlow.runway} months
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* ROIC KPI */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography color="text.secondary" variant="body2">
                    ROIC
                  </Typography>
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
                </Stack>
                <Typography variant="h4" fontWeight="bold">
                  {dashboardData.kpis.roic.current}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target: {dashboardData.kpis.roic.target}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Health Score */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Company Health Score
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', justifyContent: 'center', my: 2 }}>
            <CircularProgress
              variant="determinate"
              value={dashboardData.healthScore.overall}
              size={120}
              thickness={4}
              sx={{ color: dashboardData.healthScore.overall > 70 ? 'success.main' : 'warning.main' }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h3" component="div" color="text.primary">
                {dashboardData.healthScore.overall}
              </Typography>
            </Box>
          </Box>
          <Stack spacing={1}>
            {dashboardData.healthScore.components.map((component) => (
              <Box key={component.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">{component.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={component.score}
                    sx={{
                      width: 60,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: component.status === 'green' ? 'success.main' : 'warning.main',
                      },
                    }}
                  />
                  <Typography variant="caption">{component.score}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>

      {/* Alerts & Actions */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Executive Alerts & Quick Actions
          </Typography>
          <Stack spacing={2}>
            {dashboardData.alerts.map((alert, index) => (
              <Alert
                key={index}
                severity={alert.type === 'risk' ? 'warning' : 'info'}
                action={
                  <Button size="small" onClick={() => setDrillDownDialog(alert)}>
                    Details
                  </Button>
                }
              >
                <AlertTitle>{alert.title}</AlertTitle>
                <Typography variant="body2">{alert.description}</Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                  <Chip label={`Impact: ${alert.impact}`} size="small" />
                  <Chip label={`GL: ${alert.glAccount}`} size="small" variant="outlined" />
                </Box>
              </Alert>
            ))}
          </Stack>
        </Paper>
      </Grid>

      {/* GL Account Breakdown */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            P&L by GL Account Category
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.kpis.revenue.byGL}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="amount" fill={(entry) => entry.amount > 0 ? COLORS.success : COLORS.error} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderRevenueProfitability = () => (
    <Grid container spacing={3}>
      {/* Revenue Waterfall */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Revenue Bridge Analysis
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dashboardData.revenueWaterfall}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="value" fill={COLORS.primary}>
                {dashboardData.revenueWaterfall.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 0 ? COLORS.success : COLORS.error} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Customer Profitability Analysis */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Customer Segment Profitability
          </Typography>
          <Stack spacing={2}>
            {dashboardData.customerProfitability.segments.map((segment) => (
              <Card key={segment.segment} variant="outlined">
                <CardContent sx={{ py: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2">{segment.segment}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {segment.count} customers
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="subtitle2">${segment.revenue}M</Typography>
                      <Typography variant="caption" color={segment.avgMargin > 20 ? 'success.main' : 'warning.main'}>
                        {segment.avgMargin}% margin
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
          
          {/* Unprofitable Customers Alert */}
          <Alert severity="warning" sx={{ mt: 2 }}>
            <AlertTitle>Action Required</AlertTitle>
            {dashboardData.customerProfitability.unprofitable.count} unprofitable customers 
            generating ${dashboardData.customerProfitability.unprofitable.loss}M loss
          </Alert>
        </Paper>
      </Grid>

      {/* Material Group Performance */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Material Group Performance Matrix
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="margin" name="Margin %" unit="%" />
              <YAxis type="number" dataKey="growth" name="Growth %" unit="%" />
              <ZAxis type="number" dataKey="revenue" range={[100, 1000]} />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Material Groups" data={dashboardData.materialGroups} fill={COLORS.primary}>
                {dashboardData.materialGroups.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <Stack direction="row" spacing={2} mt={2} justifyContent="center">
            {dashboardData.materialGroups.map((group, index) => (
              <Chip
                key={group.group}
                label={`${group.group}: ${group.name}`}
                size="small"
                sx={{ backgroundColor: COLORS.chart[index % COLORS.chart.length], color: 'white' }}
              />
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderCashWorkingCapital = () => (
    <Grid container spacing={3}>
      {/* Cash Conversion Cycle */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Cash Conversion Cycle
          </Typography>
          <Box sx={{ textAlign: 'center', my: 3 }}>
            <Typography variant="h2" color="primary">
              {dashboardData.workingCapital.cashConversionCycle}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Days
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="caption" color="text.secondary">DSO</Typography>
                  <Typography variant="h5">{dashboardData.workingCapital.dso.current}</Typography>
                  <Typography variant="caption" color={dashboardData.workingCapital.dso.current > dashboardData.workingCapital.dso.target ? 'error.main' : 'success.main'}>
                    Target: {dashboardData.workingCapital.dso.target}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="caption" color="text.secondary">DIO</Typography>
                  <Typography variant="h5">{dashboardData.workingCapital.dio.current}</Typography>
                  <Typography variant="caption" color={dashboardData.workingCapital.dio.current > dashboardData.workingCapital.dio.target ? 'error.main' : 'success.main'}>
                    Target: {dashboardData.workingCapital.dio.target}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="caption" color="text.secondary">DPO</Typography>
                  <Typography variant="h5">{dashboardData.workingCapital.dpo.current}</Typography>
                  <Typography variant="caption" color={dashboardData.workingCapital.dpo.current < dashboardData.workingCapital.dpo.target ? 'warning.main' : 'success.main'}>
                    Target: {dashboardData.workingCapital.dpo.target}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>Opportunity</AlertTitle>
            ${dashboardData.workingCapital.opportunity}M cash release opportunity by optimizing working capital
          </Alert>
        </Paper>
      </Grid>

      {/* Free Cash Flow Bridge */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Free Cash Flow Bridge
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={[
              { name: 'EBITDA', value: 53.1, cumulative: 53.1 },
              { name: 'Working Capital', value: -8.2, cumulative: 44.9 },
              { name: 'CapEx', value: -12.5, cumulative: 32.4 },
              { name: 'Tax', value: -7.8, cumulative: 24.6 },
              { name: 'Other', value: 17.7, cumulative: 42.3 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="value" fill={(entry) => entry.value > 0 ? COLORS.success : COLORS.error}>
                {[0,1,2,3,4].map((index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 || index === 4 ? COLORS.success : COLORS.error} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="cumulative" stroke={COLORS.primary} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Division Cash Performance */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Cash Generation by Division & Cost Center
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Division</TableCell>
                  <TableCell>Cost Center</TableCell>
                  <TableCell align="right">Operating Cash</TableCell>
                  <TableCell align="right">CapEx</TableCell>
                  <TableCell align="right">Free Cash Flow</TableCell>
                  <TableCell align="right">% of Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Division 1</TableCell>
                  <TableCell>CC-1001</TableCell>
                  <TableCell align="right">$28.5M</TableCell>
                  <TableCell align="right">$5.2M</TableCell>
                  <TableCell align="right">$23.3M</TableCell>
                  <TableCell align="right">55%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Division 2</TableCell>
                  <TableCell>CC-2001</TableCell>
                  <TableCell align="right">$22.1M</TableCell>
                  <TableCell align="right">$4.8M</TableCell>
                  <TableCell align="right">$17.3M</TableCell>
                  <TableCell align="right">41%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Division 3</TableCell>
                  <TableCell>CC-3001</TableCell>
                  <TableCell align="right">$17.2M</TableCell>
                  <TableCell align="right">$2.5M</TableCell>
                  <TableCell align="right">$14.7M</TableCell>
                  <TableCell align="right">35%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderGrowthMarketPosition = () => (
    <Grid container spacing={3}>
      {/* Market Share Trend */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Market Share Evolution by Sales Organization
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
              { month: 'Jan', us: 23.5, canada: 18.2, mexico: 12.1 },
              { month: 'Feb', us: 23.8, canada: 18.5, mexico: 12.3 },
              { month: 'Mar', us: 24.1, canada: 18.8, mexico: 12.5 },
              { month: 'Apr', us: 24.5, canada: 19.1, mexico: 12.8 },
              { month: 'May', us: 24.8, canada: 19.3, mexico: 13.1 },
              { month: 'Jun', us: 25.2, canada: 19.5, mexico: 13.4 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Area type="monotone" dataKey="us" stackId="1" stroke="#1976d2" fill="#1976d2" />
              <Area type="monotone" dataKey="canada" stackId="1" stroke="#4caf50" fill="#4caf50" />
              <Area type="monotone" dataKey="mexico" stackId="1" stroke="#ff9800" fill="#ff9800" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Customer Acquisition Economics */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Customer Economics by Brand
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">CAC/LTV Ratio</Typography>
                  <Typography variant="h3" color="success.main">3.2x</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Healthy ratio > 3x
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">Payback Period</Typography>
                  <Typography variant="h3">8.5</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Months
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>By Product Brand</Typography>
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Brand A</Typography>
                <Chip label="4.5x" size="small" color="success" />
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Brand B</Typography>
                <Chip label="3.1x" size="small" color="success" />
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Brand C</Typography>
                <Chip label="2.2x" size="small" color="warning" />
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Private Label</Typography>
                <Chip label="1.8x" size="small" color="error" />
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Grid>

      {/* Pipeline Analysis */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Revenue Pipeline by Stage & Product Category
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={[
              { stage: 'Prospect', core: 12.5, premium: 8.3, value: 15.2, new: 3.1 },
              { stage: 'Qualified', core: 8.2, premium: 5.6, value: 9.8, new: 2.3 },
              { stage: 'Proposal', core: 5.1, premium: 3.2, value: 4.5, new: 1.8 },
              { stage: 'Negotiation', core: 3.2, premium: 2.1, value: 2.8, new: 1.2 },
              { stage: 'Closed Won', core: 2.8, premium: 1.9, value: 2.3, new: 0.9 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="core" stackId="a" fill="#1976d2" />
              <Bar dataKey="premium" stackId="a" fill="#4caf50" />
              <Bar dataKey="value" stackId="a" fill="#ff9800" />
              <Bar dataKey="new" stackId="a" fill="#9c27b0" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderActionAccountability = () => (
    <Grid container spacing={3}>
      {/* Top Value Creation Levers */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Top 10 Value Creation Levers (Ranked by NPV)
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Initiative</TableCell>
                  <TableCell>GL Impact</TableCell>
                  <TableCell>Material Groups</TableCell>
                  <TableCell align="right">NPV ($M)</TableCell>
                  <TableCell>Timeline</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.actionItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {item.glAccounts?.map(gl => (
                          <Chip key={gl} label={gl} size="small" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {item.materialGroups?.map(mg => (
                          <Chip key={mg} label={mg} size="small" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">${item.impact}</TableCell>
                    <TableCell>{item.timeline}</TableCell>
                    <TableCell>{item.owner}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status} 
                        size="small"
                        color={item.status === 'In Progress' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <PlayArrowIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* Scenario Planning */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Scenario Impact Analysis
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[
              { metric: 'Revenue', best: 280, base: 245.8, worst: 210 },
              { metric: 'EBITDA', best: 65, base: 53.1, worst: 42 },
              { metric: 'FCF', best: 55, base: 42.3, worst: 28 },
              { metric: 'ROIC', best: 22, base: 18.5, worst: 15 },
              { metric: 'Market Share', best: 28, base: 25.2, worst: 22 },
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis />
              <Radar name="Best Case" dataKey="best" stroke="#4caf50" fill="#4caf50" fillOpacity={0.3} />
              <Radar name="Base Case" dataKey="base" stroke="#1976d2" fill="#1976d2" fillOpacity={0.5} />
              <Radar name="Worst Case" dataKey="worst" stroke="#f44336" fill="#f44336" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Board Metrics Preview */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Next Board Report Preview
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Revenue Growth"
                secondary="12% YoY growth, exceeding 10% guidance"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <WarningIcon color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Margin Compression"
                secondary="EBITDA margin down 80bps due to GL 5100-5199"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="info" />
              </ListItemIcon>
              <ListItemText 
                primary="Market Expansion"
                secondary="New market entry contributing $4.5M incremental"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Working Capital"
                secondary="CCC improved by 5 days to 69"
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Paper sx={{ 
        p: 3, 
        background: '#ffffff',
        borderRadius: 2,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <Box>
          {/* Breadcrumb Navigation */}
          {onBack && (
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" sx={{ color: '#9ca3af' }} />}
              sx={{ mb: 2 }}
            >
              <Link
                component="button"
                variant="body2"
                onClick={onBack}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: '#6b7280',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#1976d2',
                    textDecoration: 'underline',
                  }
                }}
              >
                <HomeIcon sx={{ fontSize: 16 }} />
                Core.AI Suite
              </Link>
              <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>
                MARGEN.AI
              </Typography>
            </Breadcrumbs>
          )}
          
          {/* Header Content */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: '#1976d2' }} />
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#111827',
                    fontWeight: 700,
                    letterSpacing: '-0.025em'
                  }}
                >
                  MARGEN.AI
                  <Chip label="ACTIVE" size="small" sx={{ 
                    bgcolor: '#dcfce7', 
                    color: '#166534',
                    fontWeight: 600,
                    border: '1px solid #bbf7d0'
                  }} />
                </Typography>
                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                  Executive Financial Intelligence & Margin Analytics
                </Typography>
              </Box>
            </Box>

            {/* Controls */}
            <Box display="flex" gap={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  sx={{ 
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                  }}
                >
                  <MenuItem value="mtd">MTD</MenuItem>
                  <MenuItem value="qtd">QTD</MenuItem>
                  <MenuItem value="ytd">YTD</MenuItem>
                  <MenuItem value="ly">Last Year</MenuItem>
                </Select>
              </FormControl>

              <ToggleButtonGroup
                value={glFilter}
                exclusive
                onChange={(e, newFilter) => setGlFilter(newFilter)}
                size="small"
              >
                <ToggleButton value="all">All GL</ToggleButton>
                <ToggleButton value="revenue">Revenue (4xxx)</ToggleButton>
                <ToggleButton value="cogs">COGS (5xxx)</ToggleButton>
                <ToggleButton value="opex">OpEx (6xxx)</ToggleButton>
              </ToggleButtonGroup>

              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Paper sx={{ 
        flex: 1,
        width: '100%',
        background: '#ffffff',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Tabs */}
        <Box sx={{
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#1976d2',
                height: 3
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                minHeight: 48,
                px: 3,
              }
            }}
          >
            <Tab label="Executive Summary" icon={<SpeedIcon />} iconPosition="start" />
            <Tab label="Revenue & Profitability" icon={<MoneyIcon />} iconPosition="start" />
            <Tab label="Cash & Working Capital" icon={<AccountBalanceIcon />} iconPosition="start" />
            <Tab label="Growth & Market Position" icon={<TrendingUpIcon />} iconPosition="start" />
            <Tab label="Action & Accountability" icon={<AssignmentIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ 
          p: 3,
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
        }}>
          {activeTab === 0 && renderExecutiveSummary()}
          {activeTab === 1 && renderRevenueProfitability()}
          {activeTab === 2 && renderCashWorkingCapital()}
          {activeTab === 3 && renderGrowthMarketPosition()}
          {activeTab === 4 && renderActionAccountability()}
        </Box>
      </Paper>

      {/* Drill-down Dialog */}
      {drillDownDialog && (
        <Dialog
          open={!!drillDownDialog}
          onClose={() => setDrillDownDialog(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {drillDownDialog.title} - Detailed Analysis
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Alert severity={drillDownDialog.type === 'risk' ? 'warning' : 'info'}>
                <AlertTitle>Description</AlertTitle>
                {drillDownDialog.description}
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Financial Impact</Typography>
                  <Typography variant="h6">{drillDownDialog.impact}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">GL Account</Typography>
                  <Typography variant="h6">{drillDownDialog.glAccount}</Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Recommended Action
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Typography>{drillDownDialog.action}</Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Related Transactions (from PostgreSQL)
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Material</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>2024-01-15</TableCell>
                        <TableCell>Customer A</TableCell>
                        <TableCell>MG-105</TableCell>
                        <TableCell align="right">$125,450</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2024-01-18</TableCell>
                        <TableCell>Customer B</TableCell>
                        <TableCell>MG-105</TableCell>
                        <TableCell align="right">$98,200</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDrillDownDialog(null)}>Close</Button>
            <Button variant="contained" startIcon={<DownloadIcon />}>
              Export Analysis
            </Button>
            <Button variant="contained" color="primary" startIcon={<PlayArrowIcon />}>
              Take Action
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default MargenAIDashboard;