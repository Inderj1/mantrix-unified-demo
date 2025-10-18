import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ShowChart as ChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts';

const PriceVolumeAnalytics = ({ onRefresh }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    elasticity_coefficient: 0,
    optimal_price_point: 0,
    volume_sensitivity: 'Medium',
    price_bands: []
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/margen/analytics/price-volume-elasticity');
      setData(response.data);
    } catch (err) {
      setError('Failed to load price volume data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSensitivityColor = (sensitivity) => {
    switch (sensitivity) {
      case 'Low': return theme.palette.success.main;
      case 'Medium': return theme.palette.warning.main;
      case 'High': return theme.palette.error.main;
      default: return theme.palette.info.main;
    }
  };

  const getElasticityInterpretation = (elasticity) => {
    const absElasticity = Math.abs(elasticity);
    if (absElasticity < 0.5) return 'Inelastic - price changes have minimal impact on volume';
    if (absElasticity < 1) return 'Relatively inelastic - moderate price sensitivity';
    if (absElasticity === 1) return 'Unit elastic - proportional price-volume relationship';
    if (absElasticity < 2) return 'Relatively elastic - significant price sensitivity';
    return 'Highly elastic - volume very sensitive to price changes';
  };

  const formatCurrency = (value) => `$${value.toFixed(2)}`;
  const formatNumber = (value) => value.toLocaleString();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          }}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ChartIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Price Elasticity
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  {data.elasticity_coefficient.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getElasticityInterpretation(data.elasticity_coefficient)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
          }}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="success" />
                  <Typography variant="body2" color="text.secondary">
                    Optimal Price Point
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {formatCurrency(data.optimal_price_point)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Maximizes revenue potential
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            background: `linear-gradient(135deg, ${alpha(getSensitivityColor(data.volume_sensitivity), 0.1)} 0%, ${alpha(getSensitivityColor(data.volume_sensitivity), 0.02)} 100%)`,
          }}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedIcon sx={{ color: getSensitivityColor(data.volume_sensitivity) }} />
                  <Typography variant="body2" color="text.secondary">
                    Volume Sensitivity
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="baseline">
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 600,
                      color: getSensitivityColor(data.volume_sensitivity)
                    }}
                  >
                    {data.volume_sensitivity}
                  </Typography>
                  <Chip 
                    size="small"
                    label={
                      data.volume_sensitivity === 'High' 
                        ? 'Price careful' 
                        : data.volume_sensitivity === 'Low'
                        ? 'Price flexible'
                        : 'Balanced'
                    }
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Price Band Analysis */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Price Band Performance
        </Typography>
        {data.price_bands && data.price_bands.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data.price_bands} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis yAxisId="left" label={{ value: 'Volume', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight' }} />
              <Tooltip formatter={(value, name) => name === 'Revenue' ? formatCurrency(value) : formatNumber(value)} />
              <Legend />
              <Bar yAxisId="left" dataKey="volume" fill={theme.palette.primary.main} name="Volume" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={theme.palette.success.main} name="Revenue" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <Alert severity="info">No price band data available</Alert>
        )}
      </Paper>

      {/* Analysis and Insights */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Price Band Distribution
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {data.price_bands && data.price_bands.map((band, index) => {
                const maxRevenue = Math.max(...data.price_bands.map(b => b.revenue));
                return (
                  <Box key={band.range}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {band.range}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatNumber(band.volume)} units
                      </Typography>
                    </Stack>
                    <Box sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      overflow: 'hidden',
                    }}>
                      <Box sx={{
                        height: '100%',
                        width: `${(band.revenue / maxRevenue) * 100}%`,
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: 4,
                      }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Revenue: {formatCurrency(band.revenue)}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Pricing Strategy Insights
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Alert severity={data.volume_sensitivity === 'High' ? 'warning' : 'info'}>
                <strong>Price Sensitivity</strong>
                <br />
                {data.volume_sensitivity === 'High'
                  ? 'Customers are highly sensitive to price changes. Consider value-based pricing and clear communication of product benefits.'
                  : data.volume_sensitivity === 'Low'
                  ? 'Customers show low price sensitivity. There may be opportunity for premium pricing strategies.'
                  : 'Moderate price sensitivity detected. Balance competitive pricing with margin optimization.'}
              </Alert>
              
              <Alert severity="success">
                <strong>Optimal Pricing</strong>
                <br />
                The optimal price point of {formatCurrency(data.optimal_price_point)} balances volume and revenue.
                Consider this as your target for new products or pricing adjustments.
              </Alert>

              {Math.abs(data.elasticity_coefficient) > 1 && (
                <Alert severity="warning">
                  <strong>Elastic Demand</strong>
                  <br />
                  With elasticity of {data.elasticity_coefficient.toFixed(2)}, small price changes can significantly impact volume.
                  Test price changes carefully and monitor customer response.
                </Alert>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PriceVolumeAnalytics;