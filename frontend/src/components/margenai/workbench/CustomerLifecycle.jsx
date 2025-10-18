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
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  PersonOff as PersonOffIcon,
  Loop as LoopIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CustomerLifecycle = ({ onRefresh }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stages: [],
    metrics: {
      acquisition_rate: 0,
      activation_rate: 0,
      retention_rate: 0,
      churn_rate: 0,
    }
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/margen/analytics/customer-lifecycle');
      setData(response.data);
    } catch (err) {
      setError('Failed to load customer lifecycle data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'acquisition_rate':
        return <PersonAddIcon />;
      case 'activation_rate':
        return <TrendingUpIcon />;
      case 'retention_rate':
        return <LoopIcon />;
      case 'churn_rate':
        return <PersonOffIcon />;
      default:
        return <PeopleIcon />;
    }
  };

  const getMetricColor = (metric, value) => {
    switch (metric) {
      case 'acquisition_rate':
        return value > 10 ? 'success.main' : 'warning.main';
      case 'activation_rate':
        return value > 60 ? 'success.main' : 'warning.main';
      case 'retention_rate':
        return value > 70 ? 'success.main' : value > 50 ? 'warning.main' : 'error.main';
      case 'churn_rate':
        return value < 20 ? 'success.main' : value < 30 ? 'warning.main' : 'error.main';
      default:
        return 'primary.main';
    }
  };

  const formatMetricName = (metric) => {
    return metric.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Prepare data for pie chart
  const pieData = [
    { name: 'Retained', value: data.metrics.retention_rate, color: theme.palette.success.main },
    { name: 'Churned', value: data.metrics.churn_rate, color: theme.palette.error.main },
    { name: 'Other', value: Math.max(0, 100 - data.metrics.retention_rate - data.metrics.churn_rate), color: theme.palette.grey[400] },
  ].filter(d => d.value > 0);

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
      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {Object.entries(data.metrics).map(([metric, value]) => (
          <Grid item xs={12} sm={6} md={3} key={metric}>
            <Card sx={{ 
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            }}>
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: getMetricColor(metric, value),
                    }}>
                      {getMetricIcon(metric)}
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 600,
                        color: getMetricColor(metric, value),
                      }}
                    >
                      {value.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {formatMetricName(metric)}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, value)} 
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getMetricColor(metric, value),
                        borderRadius: 3,
                      }
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Customer Lifecycle Stages */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Lifecycle Stages
            </Typography>
            <Box sx={{ mt: 3 }}>
              {data.stages && data.stages.map((stage, index) => (
                <Box key={stage} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {index + 1}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {stage}
                    </Typography>
                  </Box>
                  {index < data.stages.length - 1 && (
                    <Box sx={{ 
                      ml: 5, 
                      borderLeft: `2px dashed ${theme.palette.divider}`,
                      height: 20,
                    }} />
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Retention vs Churn Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Insights */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Key Insights
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Alert 
              severity={data.metrics.retention_rate > 70 ? 'success' : data.metrics.retention_rate > 50 ? 'warning' : 'error'}
              icon={<LoopIcon />}
            >
              <strong>Retention Rate: {data.metrics.retention_rate.toFixed(1)}%</strong>
              <br />
              {data.metrics.retention_rate > 70 
                ? 'Excellent retention! Your customers are highly engaged.'
                : data.metrics.retention_rate > 50
                ? 'Good retention, but there\'s room for improvement.'
                : 'Focus on retention strategies to reduce customer loss.'}
            </Alert>
          </Grid>
          <Grid item xs={12} md={6}>
            <Alert 
              severity={data.metrics.churn_rate < 20 ? 'success' : data.metrics.churn_rate < 30 ? 'warning' : 'error'}
              icon={<PersonOffIcon />}
            >
              <strong>Churn Rate: {data.metrics.churn_rate.toFixed(1)}%</strong>
              <br />
              {data.metrics.churn_rate < 20
                ? 'Low churn rate indicates strong customer satisfaction.'
                : data.metrics.churn_rate < 30
                ? 'Moderate churn. Consider implementing retention programs.'
                : 'High churn rate. Urgent action needed to retain customers.'}
            </Alert>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CustomerLifecycle;