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
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
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
  Cell,
} from 'recharts';

const MarginDeepDive = ({ onRefresh }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    overall_margin: 0,
    by_category: [],
    trends: []
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/margen/analytics/margin-analysis');
      setData(response.data);
    } catch (err) {
      setError('Failed to load margin analysis data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMarginColor = (margin) => {
    if (margin >= 30) return theme.palette.success.main;
    if (margin >= 20) return theme.palette.info.main;
    if (margin >= 10) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getMarginStatus = (margin) => {
    if (margin >= 30) return { label: 'Excellent', color: 'success' };
    if (margin >= 20) return { label: 'Good', color: 'info' };
    if (margin >= 10) return { label: 'Fair', color: 'warning' };
    return { label: 'Poor', color: 'error' };
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

  const marginStatus = getMarginStatus(data.overall_margin);

  return (
    <Box sx={{ p: 3 }}>
      {/* Overall Margin Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          }}>
            <CardContent>
              <Stack direction="row" spacing={3} alignItems="center">
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(getMarginColor(data.overall_margin), 0.1),
                  color: getMarginColor(data.overall_margin),
                }}>
                  <AssessmentIcon sx={{ fontSize: 40 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Overall Margin
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="baseline">
                    <Typography variant="h2" sx={{ fontWeight: 600, color: getMarginColor(data.overall_margin) }}>
                      {data.overall_margin?.toFixed(1)}%
                    </Typography>
                    <Chip 
                      label={marginStatus.label}
                      color={marginStatus.color}
                      size="small"
                    />
                  </Stack>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  {data.overall_margin >= 20 ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TrendingUpIcon color="success" />
                      <Typography color="success.main" variant="body2">
                        Above target
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TrendingDownIcon color="error" />
                      <Typography color="error.main" variant="body2">
                        Below target
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Margin by Category */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Margin by Category
            </Typography>
            {data.by_category && data.by_category.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.by_category} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    label={{ value: 'Margin %', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="margin" name="Margin %">
                    {data.by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getMarginColor(entry.margin)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Alert severity="info">No category data available</Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Categories by Margin
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {data.by_category && data.by_category
                .sort((a, b) => b.margin - a.margin)
                .slice(0, 5)
                .map((category, index) => (
                  <Box key={category.category}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {index + 1}. {category.category}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: getMarginColor(category.margin)
                        }}
                      >
                        {category.margin.toFixed(1)}%
                      </Typography>
                    </Stack>
                    <Box sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      overflow: 'hidden',
                    }}>
                      <Box sx={{
                        height: '100%',
                        width: `${Math.min(100, (category.margin / 50) * 100)}%`,
                        backgroundColor: getMarginColor(category.margin),
                        borderRadius: 2,
                      }} />
                    </Box>
                  </Box>
                ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Insights and Recommendations */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Insights & Recommendations
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Alert severity={marginStatus.color} icon={<AssessmentIcon />}>
              <strong>Overall Performance</strong>
              <br />
              {data.overall_margin >= 30 
                ? 'Excellent margin performance! Maintain current pricing and cost strategies.'
                : data.overall_margin >= 20
                ? 'Good margin levels. Look for opportunities to optimize underperforming categories.'
                : data.overall_margin >= 10
                ? 'Fair margins. Consider reviewing pricing strategy and cost reduction opportunities.'
                : 'Low margins require immediate attention. Review pricing and cost structure.'}
            </Alert>
          </Grid>
          <Grid item xs={12} md={6}>
            <Alert severity="info">
              <strong>Category Analysis</strong>
              <br />
              {data.by_category && data.by_category.length > 0 && (
                <>
                  Best performing: {data.by_category.sort((a, b) => b.margin - a.margin)[0]?.category} 
                  ({data.by_category.sort((a, b) => b.margin - a.margin)[0]?.margin.toFixed(1)}%)
                  <br />
                  {data.by_category.length > 1 && (
                    <>
                      Needs improvement: {data.by_category.sort((a, b) => a.margin - b.margin)[0]?.category}
                      ({data.by_category.sort((a, b) => a.margin - b.margin)[0]?.margin.toFixed(1)}%)
                    </>
                  )}
                </>
              )}
            </Alert>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default MarginDeepDive;