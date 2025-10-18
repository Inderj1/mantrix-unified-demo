import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

/**
 * InsightsPanel - Display AI-generated insights from process mining
 */
const InsightsPanel = ({ processModel, performance, variants }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedInsights, setExpandedInsights] = useState({});

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <WarningIcon color="warning" />;
      case 'medium':
        return <InfoIcon color="info" />;
      case 'low':
        return <LightbulbIcon color="success" />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bottleneck':
        return <WarningIcon />;
      case 'automation_opportunity':
        return <AutoAwesomeIcon />;
      case 'rework':
        return <ErrorIcon />;
      case 'variant_standardization':
      case 'variant_complexity':
        return <InfoIcon />;
      case 'resource_imbalance':
        return <TrendingUpIcon />;
      case 'handover_delay':
        return <WarningIcon />;
      default:
        return <LightbulbIcon />;
    }
  };

  const generateInsights = async () => {
    if (!processModel || !performance || !variants) {
      setError('Missing data for insights generation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/process-mining/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          process_model: processModel,
          performance: performance,
          variants: variants,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setInsights(data.insights);
        // Auto-expand first 3 insights
        const initialExpanded = {};
        data.insights.slice(0, 3).forEach((insight, i) => {
          initialExpanded[i] = true;
        });
        setExpandedInsights(initialExpanded);
      } else {
        setError('Failed to generate insights');
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInsightExpansion = (index) => {
    setExpandedInsights(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  useEffect(() => {
    if (processModel && performance && variants && insights.length === 0) {
      generateInsights();
    }
  }, [processModel, performance, variants]);

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              AI-Powered Insights
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Automatically detected patterns, bottlenecks, and improvement opportunities
            </Typography>
          </Box>
          <Button
            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={generateInsights}
            disabled={loading}
            size="small"
            variant="outlined"
          >
            Refresh
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && insights.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Analyzing process and generating insights...
            </Typography>
          </Box>
        )}

        {insights.length === 0 && !loading && !error && (
          <Alert severity="info">
            No insights available. Run process discovery first.
          </Alert>
        )}

        {/* Insights Summary */}
        {insights.length > 0 && (
          <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: 'error.light' }}>
                  <CardContent>
                    <Typography variant="h4" fontWeight="bold" align="center" color="error.dark">
                      {insights.filter(i => i.severity === 'critical').length}
                    </Typography>
                    <Typography variant="caption" align="center" display="block" color="text.secondary">
                      Critical
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: 'warning.light' }}>
                  <CardContent>
                    <Typography variant="h4" fontWeight="bold" align="center" color="warning.dark">
                      {insights.filter(i => i.severity === 'high').length}
                    </Typography>
                    <Typography variant="caption" align="center" display="block" color="text.secondary">
                      High
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: 'info.light' }}>
                  <CardContent>
                    <Typography variant="h4" fontWeight="bold" align="center" color="info.dark">
                      {insights.filter(i => i.severity === 'medium').length}
                    </Typography>
                    <Typography variant="caption" align="center" display="block" color="text.secondary">
                      Medium
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: 'success.light' }}>
                  <CardContent>
                    <Typography variant="h4" fontWeight="bold" align="center" color="success.dark">
                      {insights.filter(i => i.severity === 'low').length}
                    </Typography>
                    <Typography variant="caption" align="center" display="block" color="text.secondary">
                      Low
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Insights List */}
            <Stack spacing={2}>
              {insights.map((insight, index) => (
                <Card
                  key={index}
                  sx={{
                    borderLeft: 4,
                    borderColor: `${getSeverityColor(insight.severity)}.main`,
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1 }}>
                        <Box sx={{ mt: 0.5 }}>
                          {getTypeIcon(insight.type)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="h6">
                              {insight.title}
                            </Typography>
                            <Chip
                              label={insight.severity}
                              size="small"
                              color={getSeverityColor(insight.severity)}
                            />
                            <Chip
                              label={insight.type.replace(/_/g, ' ')}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {insight.description}
                          </Typography>

                          {/* Impact Metrics */}
                          {insight.impact && (
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                              {Object.entries(insight.impact).map(([key, value]) => (
                                <Chip
                                  key={key}
                                  label={`${key.replace(/_/g, ' ')}: ${typeof value === 'number' && value % 1 !== 0 ? value.toFixed(2) : value}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mb: 0.5 }}
                                />
                              ))}
                            </Stack>
                          )}

                          {/* Estimated Improvement */}
                          {insight.estimated_improvement && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                              <Typography variant="body2">
                                <strong>Potential Impact:</strong> {insight.estimated_improvement}
                              </Typography>
                            </Alert>
                          )}

                          {/* Recommendations (Collapsible) */}
                          {insight.recommendations && insight.recommendations.length > 0 && (
                            <Box>
                              <Button
                                size="small"
                                endIcon={expandedInsights[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                onClick={() => toggleInsightExpansion(index)}
                              >
                                {expandedInsights[index] ? 'Hide' : 'Show'} Recommendations ({insight.recommendations.length})
                              </Button>
                              <Collapse in={expandedInsights[index]} timeout="auto" unmountOnExit>
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Recommended Actions:
                                  </Typography>
                                  <List dense>
                                    {insight.recommendations.map((recommendation, i) => (
                                      <ListItem key={i} sx={{ py: 0.5 }}>
                                        <ListItemText
                                          primary={
                                            <Typography variant="body2">
                                              {i + 1}. {recommendation}
                                            </Typography>
                                          }
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              </Collapse>
                            </Box>
                          )}
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default InsightsPanel;
