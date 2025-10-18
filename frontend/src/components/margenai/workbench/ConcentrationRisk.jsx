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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ConcentrationRisk = ({ onRefresh }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    gini_coefficient: 0,
    top_10_revenue_share: 0,
    top_20_revenue_share: 0,
    risk_level: 'Low',
    recommendations: []
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/margen/analytics/concentration-risk');
      setData(response.data);
    } catch (err) {
      setError('Failed to load concentration risk data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return theme.palette.success.main;
      case 'Medium': return theme.palette.warning.main;
      case 'High': return theme.palette.error.main;
      default: return theme.palette.info.main;
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'Low': return <CheckIcon />;
      case 'Medium': return <WarningIcon />;
      case 'High': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  const getGiniInterpretation = (gini) => {
    if (gini < 0.3) return 'Low inequality - revenue well distributed';
    if (gini < 0.5) return 'Moderate inequality - some concentration';
    if (gini < 0.7) return 'High inequality - significant concentration';
    return 'Very high inequality - extreme concentration';
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

  // Prepare data for pie chart
  const pieData = [
    { name: 'Top 10 Customers', value: data.top_10_revenue_share, color: theme.palette.error.main },
    { name: 'Next 10 Customers', value: data.top_20_revenue_share - data.top_10_revenue_share, color: theme.palette.warning.main },
    { name: 'Other Customers', value: 100 - data.top_20_revenue_share, color: theme.palette.success.main },
  ].filter(d => d.value > 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Risk Level Card */}
      <Card sx={{
        mb: 3,
        background: `linear-gradient(135deg, ${alpha(getRiskColor(data.risk_level), 0.1)} 0%, ${alpha(getRiskColor(data.risk_level), 0.02)} 100%)`,
      }}>
        <CardContent>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(getRiskColor(data.risk_level), 0.1),
              color: getRiskColor(data.risk_level),
            }}>
              {getRiskIcon(data.risk_level)}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Concentration Risk Level
              </Typography>
              <Stack direction="row" spacing={2} alignItems="baseline">
                <Typography variant="h3" sx={{ fontWeight: 600, color: getRiskColor(data.risk_level) }}>
                  {data.risk_level}
                </Typography>
                <Chip 
                  label={`Gini: ${data.gini_coefficient.toFixed(2)}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={2}>
              <Typography variant="h6">Gini Coefficient</Typography>
              <Typography variant="h3" sx={{ fontWeight: 600 }}>
                {data.gini_coefficient.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getGiniInterpretation(data.gini_coefficient)}
              </Typography>
              <Box sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                overflow: 'hidden',
              }}>
                <Box sx={{
                  height: '100%',
                  width: `${data.gini_coefficient * 100}%`,
                  backgroundColor: getRiskColor(data.risk_level),
                  borderRadius: 4,
                }} />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={2}>
              <Typography variant="h6">Top 10 Customer Share</Typography>
              <Typography variant="h3" sx={{ fontWeight: 600 }}>
                {data.top_10_revenue_share.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revenue from top 10 customers
              </Typography>
              <Alert 
                severity={data.top_10_revenue_share > 50 ? 'error' : data.top_10_revenue_share > 35 ? 'warning' : 'success'}
                icon={false}
              >
                {data.top_10_revenue_share > 50 
                  ? 'High concentration risk'
                  : data.top_10_revenue_share > 35
                  ? 'Moderate concentration'
                  : 'Healthy distribution'}
              </Alert>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={2}>
              <Typography variant="h6">Top 20 Customer Share</Typography>
              <Typography variant="h3" sx={{ fontWeight: 600 }}>
                {data.top_20_revenue_share.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revenue from top 20 customers
              </Typography>
              <Alert 
                severity={data.top_20_revenue_share > 70 ? 'error' : data.top_20_revenue_share > 50 ? 'warning' : 'success'}
                icon={false}
              >
                {data.top_20_revenue_share > 70 
                  ? 'Very high concentration'
                  : data.top_20_revenue_share > 50
                  ? 'Significant concentration'
                  : 'Well distributed'}
              </Alert>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Visualization and Recommendations */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Revenue Distribution
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

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recommendations
            </Typography>
            <List>
              {data.recommendations && data.recommendations.map((rec, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <TrendingUpIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={rec} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConcentrationRisk;