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
  Map as MapIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const RegionalClusters = ({ onRefresh }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ clusters: [] });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/margen/analytics/regional-clusters');
      setData(response.data);
    } catch (err) {
      setError('Failed to load regional clusters data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getColorByIndex = (index) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
    ];
    return colors[index % colors.length];
  };

  const formatRevenue = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

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

  const totalRevenue = data.clusters.reduce((sum, c) => sum + c.revenue, 0);
  const totalProducts = data.clusters.reduce((sum, c) => sum + c.products, 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapIcon color="primary" />
                  <Typography variant="caption" color="text.secondary">
                    Total Regions
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {data.clusters.length}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon color="success" />
                  <Typography variant="caption" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {formatRevenue(totalRevenue)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InventoryIcon color="info" />
                  <Typography variant="caption" color="text.secondary">
                    Total Products
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {totalProducts}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StoreIcon color="warning" />
                  <Typography variant="caption" color="text.secondary">
                    Avg Revenue/Region
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {formatRevenue(totalRevenue / (data.clusters.length || 1))}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Regional Performance Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Revenue by Region
        </Typography>
        {data.clusters && data.clusters.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.clusters} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" angle={-45} textAnchor="end" />
              <YAxis tickFormatter={(value) => formatRevenue(value)} />
              <Tooltip formatter={(value) => formatRevenue(value)} />
              <Bar dataKey="revenue" name="Revenue">
                {data.clusters.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColorByIndex(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Alert severity="info">No regional data available</Alert>
        )}
      </Paper>

      {/* Regional Details */}
      <Grid container spacing={3}>
        {data.clusters && data.clusters.map((cluster, index) => (
          <Grid item xs={12} md={6} lg={4} key={cluster.region}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {cluster.region}
                  </Typography>
                  <Chip 
                    label={`#${index + 1}`} 
                    size="small"
                    sx={{ backgroundColor: alpha(getColorByIndex(index), 0.1) }}
                  />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Products
                    </Typography>
                    <Typography variant="h6">
                      {cluster.products}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Revenue
                    </Typography>
                    <Typography variant="h6">
                      {formatRevenue(cluster.revenue)}
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  overflow: 'hidden',
                }}>
                  <Box sx={{
                    height: '100%',
                    width: `${(cluster.revenue / totalRevenue) * 100}%`,
                    backgroundColor: getColorByIndex(index),
                    borderRadius: 2,
                  }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {((cluster.revenue / totalRevenue) * 100).toFixed(1)}% of total revenue
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RegionalClusters;