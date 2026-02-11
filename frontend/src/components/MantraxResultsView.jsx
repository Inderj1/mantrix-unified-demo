import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  ExpandMore,
  Info,
  Lightbulb,
  Warning,
  CheckCircle,
  Close
} from '@mui/icons-material';
import { apiService } from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const MantraxResultsView = ({ query, sql, results, metadata, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formattedData, setFormattedData] = useState(null);

  useEffect(() => {
    formatResults();
  }, [query, sql, results]);

  const formatResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use fixed persona ID for personalized insights
      const userId = 'persona';

      const response = await apiService.formatResultsWithMantrax(
        query,
        sql,
        results,
        metadata,
        userId  // Pass persona ID for tailored insights
      );
      
      setFormattedData(response.data);
    } catch (err) {
      console.error('Failed to format results:', err);
      setError('Failed to format results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp color="success" />;
      case 'down':
        return <TrendingDown color="error" />;
      default:
        return <TrendingFlat color="action" />;
    }
  };

  const renderSummaryCard = (component) => {
    const { title, metrics, insight } = component.data;
    
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Grid container spacing={2}>
            {metrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {metric.value}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {metric.label}
                  </Typography>
                  {metric.change && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {renderTrendIcon(metric.trend)}
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {metric.change}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
          {insight && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <Info fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                {insight}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDataTable = (component) => {
    const { title, columns, data, groupBy } = component.data;
    
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align || 'left'}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} hover>
                    {columns.map((col) => (
                      <TableCell key={col.key} align={col.align || 'left'}>
                        {formatCellValue(row[col.key], col.type)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const formatCellValue = (value, type) => {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      case 'currency':
        return `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      case 'percentage':
        return `${(parseFloat(value) * 100).toFixed(2)}%`;
      case 'number': {
        const num = parseFloat(value);
        if (Number.isInteger(num) && num >= 1900 && num <= 2099) return String(num);
        return num.toLocaleString('en-US');
      }
      case 'date':
        return new Date(value).toLocaleDateString();
      default:
        return value.toString();
    }
  };

  const parseNumericValue = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove $, commas, and other formatting
      const cleaned = value.replace(/[$,]/g, '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  };

  const sanitizeChartData = (data, yAxisKey) => {
    if (!Array.isArray(data)) return [];

    return data.map(item => {
      const sanitized = { ...item };
      // Convert numeric values in the data
      Object.keys(sanitized).forEach(key => {
        if (key === yAxisKey || typeof sanitized[key] === 'string') {
          sanitized[key] = parseNumericValue(sanitized[key]);
        }
      });
      return sanitized;
    });
  };

  const renderChart = (component) => {
    const { type, title, data, xAxis, yAxis, colors } = component.data;

    // Sanitize data to ensure numeric values for charts
    const chartData = sanitizeChartData(data, yAxis?.key);

    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            {type === 'bar' && (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxis?.key} />
                <YAxis />
                <ChartTooltip formatter={(value) => typeof value === 'number' ? `$${value.toLocaleString()}` : value} />
                <Legend />
                <Bar dataKey={yAxis?.key} fill={colors?.[0] || COLORS[0]} />
              </BarChart>
            )}
            {type === 'line' && (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxis?.key} />
                <YAxis />
                <ChartTooltip formatter={(value) => typeof value === 'number' ? `$${value.toLocaleString()}` : value} />
                <Legend />
                <Line type="monotone" dataKey={yAxis?.key} stroke={colors?.[0] || COLORS[0]} />
              </LineChart>
            )}
            {type === 'pie' && (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip formatter={(value) => typeof value === 'number' ? `$${value.toLocaleString()}` : value} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderInsightCards = (component) => {
    const { insights } = component.data;
    
    return (
      <Box>
        {insights.map((insight, index) => (
          <Accordion key={index} defaultExpanded={insight.impact === 'high'}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                {insight.type === 'finding' && <Info color="info" />}
                {insight.type === 'trend' && <TrendingUp color="primary" />}
                {insight.type === 'anomaly' && <Warning color="warning" />}
                {insight.type === 'recommendation' && <Lightbulb color="success" />}
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  {insight.title}
                </Typography>
                <Chip
                  label={insight.impact}
                  size="small"
                  color={
                    insight.impact === 'high' ? 'error' :
                    insight.impact === 'medium' ? 'warning' : 'default'
                  }
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                {insight.description}
              </Typography>
              {insight.actions && insight.actions.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommended Actions:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {insight.actions.map((action, i) => (
                      <Typography component="li" variant="body2" key={i}>
                        {action}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  const renderComponent = (component) => {
    switch (component.type) {
      case 'summary-card':
        return renderSummaryCard(component);
      case 'data-table':
        return renderDataTable(component);
      case 'chart-config':
        return renderChart(component);
      case 'insight-cards':
        return renderInsightCards(component);
      default:
        return null;
    }
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

  if (!formattedData) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ flex: 1 }}>
          Detailed Results Analysis
        </Typography>
        <Tooltip title="Close">
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary */}
      {formattedData.summary && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
          <Typography variant="body1">
            {formattedData.summary}
          </Typography>
        </Paper>
      )}

      {/* Components */}
      <Grid container spacing={3}>
        {formattedData.components.map((component, index) => (
          <Grid item xs={12} key={index}>
            {renderComponent(component)}
          </Grid>
        ))}
      </Grid>

      {/* Original Query Info */}
      <Accordion sx={{ mt: 3 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">Query Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Original Query:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
              {query}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Generated SQL:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {sql}
              </Typography>
            </Paper>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default MantraxResultsView;