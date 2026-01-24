import React, { useState, useId } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Breadcrumbs,
  Link,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ZoomIn as ZoomInIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import './shared/chartSetup'; // Import Chart.js setup to register components
import DrillDownTable from './shared/DrillDownTable';
import InteractiveChart from './shared/InteractiveChart';
import SafeChart from './shared/SafeChart';
import { apiService } from '../../services/api';

const RevenueSalesAnalytics = ({ revenueData, growthData, summaryData, onDrillDown, onBack, darkMode = false }) => {
  const chartInstanceId = useId();
  const [groupBy, setGroupBy] = useState('customer');
  const [timePeriod, setTimePeriod] = useState('ytd');
  const [drillDownPath, setDrillDownPath] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [drillDownDialog, setDrillDownDialog] = useState(false);
  const [drillDownData, setDrillDownData] = useState(null);

  const getColors = (darkMode) => ({
    primary: darkMode ? '#4d9eff' : '#00357a',
    text: darkMode ? '#e6edf3' : '#1e293b',
    textSecondary: darkMode ? '#8b949e' : '#64748b',
    background: darkMode ? '#0d1117' : '#f8fbfd',
    paper: darkMode ? '#161b22' : '#ffffff',
    cardBg: darkMode ? '#21262d' : '#ffffff',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  });

  const colors = getColors(darkMode);

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

  const handleTableDrillDown = (row, column) => {
    const drillDownMapping = {
      customer: {
        nextLevel: 'orders',
        title: `Orders for ${row.customer}`,
        apiCall: () => apiService.getCustomerOrders(row.customer)
      },
      segment: {
        nextLevel: 'customers',
        title: `Customers in ${row.segment}`,
        apiCall: () => apiService.getSegmentCustomers(row.segment)
      },
      product: {
        nextLevel: 'customers',
        title: `Customers buying ${row.product}`,
        apiCall: () => apiService.getProductCustomers(row.product)
      }
    };

    const mapping = drillDownMapping[groupBy];
    if (mapping) {
      setDrillDownPath([...drillDownPath, { level: groupBy, value: row[groupBy] }]);
      setDrillDownData({
        title: mapping.title,
        loading: true
      });
      setDrillDownDialog(true);

      mapping.apiCall().then(response => {
        setDrillDownData({
          title: mapping.title,
          data: response.data,
          loading: false
        });
      });
    }
  };

  const handleChartDrillDown = (datasetIndex, dataIndex, chartType) => {
    const element = revenueData.data[dataIndex];
    handleTableDrillDown(element, groupBy);
  };

  const renderRevenueMetrics = () => {
    if (!revenueData) return null;

    const { data = [], summary = {}, waterfall_data = [] } = revenueData;

    return (
      <>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card
              elevation={2}
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 }, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}
              onClick={() => handleTableDrillDown({ metric: 'revenue' }, 'summary')}
            >
              <CardContent>
                <Typography sx={{ color: colors.textSecondary }} gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5" sx={{ color: colors.text }}>
                  {formatCurrency(summary.total_revenue || 0)}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                  {summaryData?.trends?.revenue_growth >= 0 ? 
                    <TrendingUpIcon color="success" fontSize="small" /> : 
                    <TrendingDownIcon color="error" fontSize="small" />
                  }
                  <Typography variant="body2" color={summaryData?.trends?.revenue_growth >= 0 ? 'success.main' : 'error.main'}>
                    {formatPercentage(summaryData?.trends?.revenue_growth || 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2} sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Typography sx={{ color: colors.textSecondary }} gutterBottom>
                  Gross Margin
                </Typography>
                <Typography variant="h5" sx={{ color: colors.text }}>
                  {formatCurrency(summary.total_gross_margin || 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {(summary.overall_margin_pct || 0).toFixed(1)}% of Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2} sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Typography sx={{ color: colors.textSecondary }} gutterBottom>
                  Avg Deal Size
                </Typography>
                <Typography variant="h5" sx={{ color: colors.text }}>
                  {formatCurrency(growthData?.pipeline_metrics?.avg_deal_size || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2} sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Typography sx={{ color: colors.textSecondary }} gutterBottom>
                  Win Rate
                </Typography>
                <Typography variant="h5" sx={{ color: colors.text }}>
                  {growthData?.market_position?.win_rate || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Revenue Table with Drill-Down */}
        <Paper elevation={2} sx={{ mb: 3, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: colors.border }}>
            <Typography variant="h6" sx={{ color: colors.text }}>Revenue Analysis</Typography>
          </Box>
          <DrillDownTable
            data={data}
            columns={[
              { id: groupBy, label: groupBy.charAt(0).toUpperCase() + groupBy.slice(1) },
              ...(groupBy === 'customer' ? [{ id: 'segment', label: 'Segment' }] : []),
              { id: 'revenue', label: 'Revenue', format: formatCurrency, align: 'right' },
              { id: 'gross_margin', label: 'Gross Margin', format: formatCurrency, align: 'right' },
              { id: 'margin_pct', label: 'Margin %', format: (v) => `${v}%`, align: 'right' },
              ...(groupBy !== 'segment' ? [{ id: 'order_count', label: 'Orders', align: 'right' }] : [])
            ]}
            onRowClick={handleTableDrillDown}
            drillDownPath={drillDownPath}
          />
        </Paper>

        {/* Waterfall Chart */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
          <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
            Revenue to Profit Waterfall
          </Typography>
          <InteractiveChart
            type="bar"
            data={{
              labels: waterfall_data.map(d => d.name),
              datasets: [{
                label: 'Value',
                data: waterfall_data.map(d => Math.abs(d.value)),
                backgroundColor: waterfall_data.map(d => 
                  d.type === 'positive' ? 'rgba(75, 192, 192, 0.6)' : 
                  d.type === 'negative' ? 'rgba(255, 99, 132, 0.6)' : 
                  'rgba(54, 162, 235, 0.6)'
                ),
              }]
            }}
            onElementClick={handleChartDrillDown}
            height={300}
          />
        </Paper>
      </>
    );
  };

  const renderSalesMetrics = () => {
    if (!growthData) return null;

    const { 
      growth_metrics = [], 
      product_performance = [], 
      sales_organization = [], 
      pipeline_metrics = {} 
    } = growthData;

    return (
      <>
        {/* Sales Pipeline */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
          <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
            Sales Pipeline Analysis
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300 }}>
                <SafeChart
                  type="doughnut"
                  data={{
                  labels: ['Qualified', 'Unqualified', 'Closed Won'],
                  datasets: [{
                    data: [
                      pipeline_metrics.qualified_pipeline || 0,
                      (pipeline_metrics.total_pipeline || 0) - (pipeline_metrics.qualified_pipeline || 0),
                      pipeline_metrics.weighted_pipeline || 0
                    ],
                    backgroundColor: ['#4caf50', '#ff9800', '#00357a']
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  onClick: (event, elements) => {
                    if (elements.length > 0) {
                      const index = elements[0].index;
                      const labels = ['Qualified', 'Unqualified', 'Closed Won'];
                      console.log('Clicked on:', labels[index]);
                    }
                  }
                }}
              />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Total Pipeline</TableCell>
                    <TableCell align="right">{formatCurrency(pipeline_metrics.total_pipeline || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Qualified Pipeline</TableCell>
                    <TableCell align="right">{formatCurrency(pipeline_metrics.qualified_pipeline || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Weighted Pipeline</TableCell>
                    <TableCell align="right">{formatCurrency(pipeline_metrics.weighted_pipeline || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Conversion Rate</TableCell>
                    <TableCell align="right">{pipeline_metrics.conversion_rate || 0}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Paper>

        {/* Product Performance */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
          <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
            Product Performance
          </Typography>
          <DrillDownTable
            data={product_performance}
            columns={[
              { id: 'product_brand', label: 'Product' },
              { id: 'revenue', label: 'Revenue', format: formatCurrency, align: 'right' },
              { id: 'gross_margin', label: 'Gross Margin', format: formatCurrency, align: 'right' },
              { id: 'margin_pct', label: 'Margin %', format: (v) => `${v}%`, align: 'right' },
              { id: 'customer_reach', label: 'Customers', align: 'right' },
              { id: 'volume', label: 'Volume', align: 'right' }
            ]}
            onRowClick={(row) => {
              setDrillDownData({
                title: `Customer Details for ${row.product_brand}`,
                loading: true
              });
              setDrillDownDialog(true);
            }}
          />
        </Paper>

        {/* Sales Organization Performance */}
        <Paper elevation={2} sx={{ p: 3, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
          <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
            Sales Organization Performance
          </Typography>
          <InteractiveChart
            type="bar"
            data={{
              labels: sales_organization.map(s => s.region),
              datasets: [
                {
                  label: 'Revenue',
                  data: sales_organization.map(s => s.revenue),
                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                  yAxisID: 'y'
                },
                {
                  label: 'Growth %',
                  data: sales_organization.map(s => s.growth_pct),
                  type: 'line',
                  borderColor: 'rgb(255, 99, 132)',
                  yAxisID: 'y1'
                }
              ]
            }}
            options={{
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  ticks: {
                    callback: (value) => formatCurrency(value)
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  ticks: {
                    callback: (value) => `${value}%`
                  }
                }
              }
            }}
            onElementClick={(datasetIndex, dataIndex) => {
              const region = sales_organization[dataIndex];
              console.log('Drill down into region:', region);
            }}
            height={300}
          />
        </Paper>
      </>
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: colors.background, minHeight: '100vh' }}>
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
                color: colors.text,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              MARGEN.AI
            </Link>
            <Typography sx={{ color: colors.primary }} variant="body1" fontWeight={600}>
              Revenue & Sales
            </Typography>
          </Breadcrumbs>
          {onBack && (
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
              Back to MargenAI
            </Button>
          )}
        </Stack>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
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
          <Grid item xs={12} md={6}>
            {drillDownPath.length > 0 && (
              <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                <Link 
                  underline="hover" 
                  color="inherit" 
                  onClick={() => setDrillDownPath([])}
                  sx={{ cursor: 'pointer' }}
                >
                  Revenue Analysis
                </Link>
                {drillDownPath.map((path, index) => (
                  <Link
                    key={index}
                    underline="hover"
                    color={index === drillDownPath.length - 1 ? 'text.primary' : 'inherit'}
                    onClick={() => setDrillDownPath(drillDownPath.slice(0, index + 1))}
                    sx={{ cursor: 'pointer' }}
                  >
                    {path.value}
                  </Link>
                ))}
              </Breadcrumbs>
            )}
          </Grid>
        </Grid>
      </Paper>

      {renderRevenueMetrics()}
      {renderSalesMetrics()}

      {/* Drill-Down Dialog */}
      <Dialog 
        open={drillDownDialog} 
        onClose={() => setDrillDownDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{drillDownData?.title}</DialogTitle>
        <DialogContent>
          {drillDownData?.loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {drillDownData?.data && (
                <pre>{JSON.stringify(drillDownData.data, null, 2)}</pre>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrillDownDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RevenueSalesAnalytics;