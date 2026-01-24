import React, { useState, useId } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link,
  Stack,
  Button,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  ZoomIn as ZoomInIcon,
  GetApp as ExportIcon,
  Timeline as TimelineIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import './shared/chartSetup'; // Import Chart.js setup to register components
import DrillDownTable from './shared/DrillDownTable';
import InteractiveChart from './shared/InteractiveChart';
import SafeChart from './shared/SafeChart';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const CostOperationsManagement = ({ cashData, revenueData, onDrillDown, onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const chartId = useId();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGL, setSelectedGL] = useState(null);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleGLAccountDrillDown = (account) => {
    setSelectedGL(account);
    onDrillDown({
      type: 'gl_transactions',
      account: account.account,
      title: `Transactions for GL ${account.account} - ${account.name}`
    });
  };

  const handleDivisionDrillDown = (division) => {
    setSelectedDivision(division);
    onDrillDown({
      type: 'division_details',
      division: division.division,
      cost_center: division.cost_center,
      title: `${division.division} - Cost Center ${division.cost_center} Details`
    });
  };

  const renderCOGSAnalysis = () => {
    if (!revenueData) return null;

    const { gl_breakdown } = revenueData;
    const cogsData = gl_breakdown?.cogs_accounts || [];

    const cogsChartData = {
      labels: cogsData.map(item => item.name),
      datasets: [{
        data: cogsData.map(item => item.amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1
      }]
    };

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Cost of Goods Sold (COGS) Breakdown
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ height: 300 }}>
                <SafeChart
                  type="pie"
                  data={cogsChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = formatCurrency(context.parsed);
                          const percentage = ((context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  },
                  onClick: (event, elements) => {
                    if (elements.length > 0) {
                      const index = elements[0].index;
                      handleGLAccountDrillDown(cogsData[index]);
                    }
                  }
                }}
              />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>GL Account</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cogsData.map((item) => (
                    <TableRow 
                      key={item.account}
                      hover
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{item.account}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Drill down to transactions">
                          <IconButton 
                            size="small"
                            onClick={() => handleGLAccountDrillDown(item)}
                          >
                            <ZoomInIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderCashFlowAnalysis = () => {
    if (!cashData) return null;

    const { cash_flow_trend = [], key_ratios = {} } = cashData;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Cash Flow Management
        </Typography>

        {/* Key Ratios */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Object.entries(key_ratios).map(([key, value]) => (
            <Grid item xs={6} md={3} key={key}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Typography>
                  <Typography variant="h6">
                    {key.includes('ratio') ? value.toFixed(2) : formatCurrency(value)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Cash Flow Trend Chart */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <InteractiveChart
            type="line"
            data={{
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
                  tension: 0.1,
                  fill: true
                }
              ]
            }}
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
            onElementClick={(datasetIndex, dataIndex) => {
              const monthData = cash_flow_trend[dataIndex];
              onDrillDown({
                type: 'cash_flow_details',
                month: monthData.year_month,
                title: `Cash Flow Details for ${monthData.year_month}`
              });
            }}
            height={300}
          />
        </Paper>
      </Box>
    );
  };

  const renderWorkingCapital = () => {
    if (!cashData) return null;

    const { working_capital = {}, division_metrics = [], gl_accounts = {} } = cashData;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Working Capital by Division
        </Typography>

        {/* Working Capital Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Current Position
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Current Assets</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(working_capital.current_assets?.total || 0)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Current Liabilities</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(working_capital.current_liabilities?.total || 0)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1" fontWeight="bold">Working Capital</Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary.main">
                    {formatCurrency(working_capital.working_capital || 0)}
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={((working_capital.current_ratio || 0) / 3) * 100} 
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Current Ratio: {(working_capital.current_ratio || 0).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Division</TableCell>
                    <TableCell>Cost Center</TableCell>
                    <TableCell align="right">Cash Position</TableCell>
                    <TableCell align="right">AR Balance</TableCell>
                    <TableCell align="right">AP Balance</TableCell>
                    <TableCell align="center">DSO</TableCell>
                    <TableCell align="center">DPO</TableCell>
                    <TableCell align="center">CCC</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {division_metrics.map((division) => (
                    <TableRow 
                      key={division.division}
                      hover
                      selected={selectedDivision?.division === division.division}
                    >
                      <TableCell>{division.division}</TableCell>
                      <TableCell>
                        <Chip label={division.cost_center} size="small" />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(division.cash_position)}</TableCell>
                      <TableCell align="right">{formatCurrency(division.ar_balance)}</TableCell>
                      <TableCell align="right">{formatCurrency(division.ap_balance)}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${division.dso} days`} 
                          size="small" 
                          color={division.dso > 45 ? 'warning' : 'success'}
                        />
                      </TableCell>
                      <TableCell align="center">{division.dpo}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${division.cash_conversion_cycle} days`} 
                          size="small"
                          color={division.cash_conversion_cycle > 50 ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small"
                          onClick={() => handleDivisionDrillDown(division)}
                        >
                          <ZoomInIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>

        {/* GL Accounts Breakdown */}
        <Grid container spacing={3}>
          {Object.entries(gl_accounts).map(([category, accounts]) => (
            <Grid item xs={12} md={4} key={category}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Typography>
                <Table size="small">
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow 
                        key={account.account}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleGLAccountDrillDown(account)}
                      >
                        <TableCell>{account.account}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell align="right">{formatCurrency(account.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderOperationalEfficiency = () => {
    // Mock operational efficiency metrics
    const efficiencyMetrics = [
      { name: 'Order Fulfillment Rate', value: 94.5, target: 95, unit: '%' },
      { name: 'Inventory Turnover', value: 12.3, target: 15, unit: 'x' },
      { name: 'On-Time Delivery', value: 89.2, target: 92, unit: '%' },
      { name: 'Cost per Order', value: 42.5, target: 40, unit: '$' },
    ];

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Operational Efficiency Metrics
        </Typography>

        <Grid container spacing={3}>
          {efficiencyMetrics.map((metric) => (
            <Grid item xs={12} md={3} key={metric.name}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    {metric.name}
                  </Typography>
                  <Box display="flex" alignItems="baseline" gap={1}>
                    <Typography variant="h4">
                      {metric.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {metric.unit}
                    </Typography>
                  </Box>
                  <Box mt={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption">Progress to Target</Typography>
                      <Typography variant="caption">{metric.target}{metric.unit}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, (metric.value / metric.target) * 100)}
                      sx={{ 
                        height: 6,
                        borderRadius: 1,
                        bgcolor: 'grey.300',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: metric.value >= metric.target ? 'success.main' : 'warning.main'
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: colors.background }}>
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
              Cost & Operations
            </Typography>
          </Breadcrumbs>
          {onBack && (
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
              Back to MargenAI
            </Button>
          )}
        </Stack>
      </Box>

      <Paper elevation={1} sx={{ mb: 3, bgcolor: colors.paper }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: colors.border }}
        >
          <Tab label="COGS Analysis" />
          <Tab label="Cash Flow" />
          <Tab label="Working Capital" />
          <Tab label="Operational Efficiency" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && renderCOGSAnalysis()}
        {activeTab === 1 && renderCashFlowAnalysis()}
        {activeTab === 2 && renderWorkingCapital()}
        {activeTab === 3 && renderOperationalEfficiency()}
      </Box>
    </Box>
  );
};

export default CostOperationsManagement;