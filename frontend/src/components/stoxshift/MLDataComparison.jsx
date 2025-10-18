import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
  alpha,
  Grid,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Science as ScienceIcon,
  DataUsage as DataIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const MLDataComparison = () => {
  const [viewType, setViewType] = useState('comparison');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [timeRange, setTimeRange] = useState('30days');

  // Sample data for Madison Reed products
  const productData = {
    'Siena Brown': {
      raw: [2800, 2900, 3100, 2700, 2600, 2900, 3200],
      ml: [3200, 3150, 3300, 3100, 3250, 3400, 3500],
      actual: [3150, 3100, 3280, 3050, 3200, 3350, null],
      accuracy: 94.2,
    },
    'Ravenna Red': {
      raw: [1200, 1300, 1150, 1400, 1250, 1100, 1350],
      ml: [1850, 1900, 1750, 1950, 1800, 1850, 1900],
      actual: [1820, 1880, 1730, 1920, 1780, 1830, null],
      accuracy: 96.8,
    },
    'Valencia Blonde': {
      raw: [1500, 1600, 1450, 1700, 1550, 1650, 1800],
      ml: [2100, 2200, 2050, 2300, 2150, 2250, 2400],
      actual: [2050, 2150, 2000, 2250, 2100, 2200, null],
      accuracy: 95.5,
    },
    'Palermo Black': {
      raw: [5100, 5000, 5200, 4900, 5050, 4950, 5150],
      ml: [4800, 4750, 4900, 4700, 4850, 4750, 4900],
      actual: [4850, 4800, 4920, 4730, 4880, 4780, null],
      accuracy: 97.2,
    },
  };

  const dates = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'];

  // Calculate aggregate data for all products
  const aggregateData = () => {
    const raw = dates.map((_, idx) => 
      Object.values(productData).reduce((sum, product) => sum + product.raw[idx], 0)
    );
    const ml = dates.map((_, idx) => 
      Object.values(productData).reduce((sum, product) => sum + product.ml[idx], 0)
    );
    const actual = dates.map((_, idx) => 
      Object.values(productData).reduce((sum, product) => 
        product.actual[idx] !== null ? sum + product.actual[idx] : sum, 0
      )
    );
    return { raw, ml, actual };
  };

  const currentData = selectedProduct === 'all' ? aggregateData() : productData[selectedProduct];

  // Chart configurations
  const comparisonChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Raw Demand Forecast',
        data: currentData.raw,
        borderColor: '#ff9800',
        backgroundColor: alpha('#ff9800', 0.1),
        tension: 0.3,
      },
      {
        label: 'ML-Enhanced Forecast',
        data: currentData.ml,
        borderColor: '#2196f3',
        backgroundColor: alpha('#2196f3', 0.1),
        tension: 0.3,
      },
      {
        label: 'Actual Demand',
        data: currentData.actual,
        borderColor: '#4caf50',
        backgroundColor: alpha('#4caf50', 0.1),
        borderDash: [5, 5],
        tension: 0.3,
      },
    ],
  };

  const accuracyData = {
    labels: Object.keys(productData),
    datasets: [
      {
        label: 'ML Model Accuracy %',
        data: Object.values(productData).map(p => p.accuracy),
        backgroundColor: [
          alpha('#2196f3', 0.8),
          alpha('#f44336', 0.8),
          alpha('#ff9800', 0.8),
          alpha('#4caf50', 0.8),
        ],
      },
    ],
  };

  const improvementData = {
    labels: Object.keys(productData),
    datasets: [
      {
        label: 'Improvement over Raw Forecast',
        data: Object.entries(productData).map(([_, data]) => {
          const rawError = data.actual.slice(0, -1).reduce((sum, actual, idx) => 
            sum + Math.abs(actual - data.raw[idx]), 0
          );
          const mlError = data.actual.slice(0, -1).reduce((sum, actual, idx) => 
            sum + Math.abs(actual - data.ml[idx]), 0
          );
          return ((rawError - mlError) / rawError * 100).toFixed(1);
        }),
        backgroundColor: alpha('#4caf50', 0.7),
        borderColor: '#4caf50',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              ML vs Raw Data Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compare traditional forecasting with ML-enhanced predictions
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Product</InputLabel>
              <Select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                label="Product"
              >
                <MenuItem value="all">All Products</MenuItem>
                <MenuItem value="Siena Brown">Siena Brown</MenuItem>
                <MenuItem value="Ravenna Red">Ravenna Red</MenuItem>
                <MenuItem value="Valencia Blonde">Valencia Blonde</MenuItem>
                <MenuItem value="Palermo Black">Palermo Black</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={(e, v) => v && setViewType(v)}
              size="small"
            >
              <ToggleButton value="comparison">
                <LineChartIcon />
              </ToggleButton>
              <ToggleButton value="accuracy">
                <BarChartIcon />
              </ToggleButton>
              <ToggleButton value="improvement">
                <PieChartIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            <IconButton size="small">
              <DownloadIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Key Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <AIIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  ML Model Performance
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={600} color="primary">
                95.4%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average accuracy across all products
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="subtitle2" color="text.secondary">
                  Forecast Improvement
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={600} color="success.main">
                +42.3%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Better than traditional methods
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <DataIcon color="info" />
                <Typography variant="subtitle2" color="text.secondary">
                  Data Points Analyzed
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={600} color="info.main">
                1.2M
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Including social signals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <ScienceIcon color="secondary" />
                <Typography variant="subtitle2" color="text.secondary">
                  ML Training Data
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={600} color="secondary.main">
                36mo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Historical data used
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Paper sx={{ p: 3 }}>
        {viewType === 'comparison' && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Demand Forecast Comparison</Typography>
              <Chip
                label="Live Data"
                color="success"
                size="small"
                icon={<InfoIcon />}
              />
            </Stack>
            <Box sx={{ height: 400 }}>
              <Line data={comparisonChartData} options={chartOptions} />
            </Box>
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Key Insights:</strong>
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  • ML predictions show {selectedProduct === 'all' ? '35%' : '42%'} higher accuracy than raw forecasts
                </Typography>
                <Typography variant="body2">
                  • Social media trend integration improves demand spike prediction by 2-3 weeks
                </Typography>
                <Typography variant="body2">
                  • ML model successfully predicted {selectedProduct === 'all' ? '89%' : '92%'} of actual demand patterns
                </Typography>
              </Stack>
            </Box>
          </Box>
        )}

        {viewType === 'accuracy' && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>ML Model Accuracy by Product</Typography>
            <Box sx={{ height: 400 }}>
              <Bar 
                data={accuracyData} 
                options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '%';
                        },
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>
        )}

        {viewType === 'improvement' && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>ML Improvement Over Traditional Methods</Typography>
            <Box sx={{ height: 400 }}>
              <Bar 
                data={improvementData} 
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return value + '%';
                        },
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </Paper>

      {/* ML Model Details */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>ML Model Configuration</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: alpha('#2196f3', 0.1), borderRadius: 1 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Input Features
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">• Historical sales data (36 months)</Typography>
                <Typography variant="body2">• Social media sentiment scores</Typography>
                <Typography variant="body2">• Influencer mention frequency</Typography>
                <Typography variant="body2">• Seasonal patterns</Typography>
                <Typography variant="body2">• Promotional calendar</Typography>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: alpha('#4caf50', 0.1), borderRadius: 1 }}>
              <Typography variant="subtitle2" color="success.main" gutterBottom>
                ML Algorithms Used
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">• LSTM for time series</Typography>
                <Typography variant="body2">• Random Forest for feature importance</Typography>
                <Typography variant="body2">• XGBoost for trend detection</Typography>
                <Typography variant="body2">• Neural networks for pattern recognition</Typography>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: alpha('#ff9800', 0.1), borderRadius: 1 }}>
              <Typography variant="subtitle2" color="warning.main" gutterBottom>
                Real-time Adjustments
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">• TikTok trend monitoring</Typography>
                <Typography variant="body2">• Instagram hashtag analysis</Typography>
                <Typography variant="body2">• Weather event integration</Typography>
                <Typography variant="body2">• Competitor activity tracking</Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default MLDataComparison;