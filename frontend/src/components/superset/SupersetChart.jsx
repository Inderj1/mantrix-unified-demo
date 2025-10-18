import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  Edit as EditIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import Plot from 'react-plotly.js';
import { ResponsiveContainer, BarChart, LineChart, PieChart, Cell, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import supersetApiClient from '../../services/supersetApiClient';
import { sapChartColors } from '../../themes/sapFioriTheme';

const SupersetChart = ({
  chartId,
  chartConfig,
  title,
  height = 400,
  showControls = true,
  renderEngine = 'auto', // 'plotly', 'recharts', 'auto'
  onEdit,
  onDelete,
  customLayout = {},
}) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch chart data from Superset
  useEffect(() => {
    if (chartId) {
      fetchChartData();
    } else if (chartConfig) {
      // Use provided config directly
      setChartData(chartConfig);
      setLoading(false);
    }
  }, [chartId, chartConfig]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get chart metadata
      const chartInfo = await supersetApiClient.getChart(chartId);
      
      // Check if chart exists
      if (!chartInfo.result) {
        throw new Error(`Chart ${chartId} not found`);
      }
      
      // Get chart data using the chart's form data
      const formData = chartInfo.result?.params ? JSON.parse(chartInfo.result.params) : {};
      const dataResponse = await supersetApiClient.getChartData(chartId, formData);
      
      setChartData({
        ...chartInfo.result,
        data: dataResponse.result,
      });
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
      const errorMessage = err.response?.status === 404 ? 
        `Chart ${chartId} not found` : 
        err.message || 'Failed to load chart';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChartData();
    setRefreshing(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = async (format = 'png') => {
    try {
      const exportData = await supersetApiClient.exportChart(chartId, format);
      // Handle download logic here
      console.log('Export data:', exportData);
    } catch (err) {
      console.error('Failed to export chart:', err);
    }
    handleMenuClose();
  };

  // Determine best rendering engine
  const determineRenderEngine = useMemo(() => {
    if (renderEngine !== 'auto') return renderEngine;
    
    if (!chartData) return 'plotly';
    
    const vizType = chartData.viz_type || chartData.chartType;
    
    // Use Recharts for simple charts, Plotly for complex ones
    const rechartsTypes = ['bar', 'line', 'area', 'pie', 'scatter'];
    const plotlyTypes = ['box', 'violin', 'heatmap', 'surface', '3d_scatter', 'waterfall'];
    
    if (rechartsTypes.includes(vizType)) return 'recharts';
    if (plotlyTypes.includes(vizType)) return 'plotly';
    
    return 'plotly'; // Default to Plotly for unknown types
  }, [renderEngine, chartData]);

  // Transform Superset data for Recharts
  const transformDataForRecharts = useMemo(() => {
    if (!chartData?.data) return [];
    
    const data = chartData.data[0]?.data || chartData.data;
    if (!Array.isArray(data)) return [];
    
    return data.map((item, index) => ({
      id: index,
      name: item.name || item.x || `Item ${index}`,
      value: item.value || item.y || 0,
      ...item,
    }));
  }, [chartData]);

  // Transform Superset data for Plotly
  const transformDataForPlotly = useMemo(() => {
    if (!chartData?.data) return [];
    
    const data = chartData.data[0]?.data || chartData.data;
    const vizType = chartData.viz_type || chartData.chartType || 'bar';
    
    if (vizType === 'bar') {
      return [{
        type: 'bar',
        x: data.map(d => d.name || d.x),
        y: data.map(d => d.value || d.y),
        marker: { color: sapChartColors[0] },
      }];
    }
    
    if (vizType === 'line') {
      return [{
        type: 'scatter',
        mode: 'lines+markers',
        x: data.map(d => d.name || d.x),
        y: data.map(d => d.value || d.y),
        line: { color: sapChartColors[0] },
      }];
    }
    
    if (vizType === 'pie') {
      return [{
        type: 'pie',
        labels: data.map(d => d.name || d.x),
        values: data.map(d => d.value || d.y),
        marker: { colors: sapChartColors },
      }];
    }
    
    // Default to bar chart
    return [{
      type: 'bar',
      x: data.map(d => d.name || d.x),
      y: data.map(d => d.value || d.y),
      marker: { color: sapChartColors[0] },
    }];
  }, [chartData]);

  // Plotly layout with SAP Fiori theming
  const plotlyLayout = useMemo(() => ({
    autosize: true,
    margin: { t: 40, r: 30, b: 60, l: 60 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(248,248,248,0.3)',
    colorway: sapChartColors,
    font: {
      family: '"72", "Helvetica Neue", Arial, sans-serif',
      size: 12,
      color: '#32363a',
    },
    xaxis: {
      gridcolor: '#e5e5e5',
      linecolor: '#cccccc',
      tickcolor: '#cccccc',
    },
    yaxis: {
      gridcolor: '#e5e5e5',
      linecolor: '#cccccc',
      tickcolor: '#cccccc',
    },
    ...customLayout,
  }), [customLayout]);

  const plotlyConfig = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    responsive: true,
  };

  // Render Recharts component
  const renderRechartsChart = () => {
    const vizType = chartData?.viz_type || chartData?.chartType || 'bar';
    const data = transformDataForRecharts;
    
    const chartProps = {
      width: '100%',
      height: height - 100,
      data: data,
      margin: { top: 20, right: 30, left: 20, bottom: 60 },
    };

    switch (vizType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height - 100}>
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#32363a' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12, fill: '#32363a' }} />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #cccccc',
                  borderRadius: '4px'
                }} 
              />
              <Legend />
              <Bar dataKey="value" fill={sapChartColors[0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height - 100}>
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 12, fill: '#32363a' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12, fill: '#32363a' }} />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #cccccc',
                  borderRadius: '4px'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={sapChartColors[0]} 
                strokeWidth={2}
                dot={{ fill: sapChartColors[0], strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height - 100}>
            <PieChart {...chartProps}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(height - 100, 300) / 3}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={sapChartColors[index % sapChartColors.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return renderPlotlyChart();
    }
  };

  // Render Plotly component
  const renderPlotlyChart = () => (
    <Plot
      data={transformDataForPlotly}
      layout={plotlyLayout}
      config={plotlyConfig}
      style={{ width: '100%', height: height - 100 }}
      useResizeHandler={true}
    />
  );

  if (loading) {
    return (
      <Card sx={{ height }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height }}>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          {chartId && (
            <Box sx={{ textAlign: 'center' }}>
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <RefreshIcon />
              </IconButton>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            {title || chartData?.slice_name || 'Chart'}
          </Typography>
          
          {showControls && (
            <Box>
              <Tooltip title="Refresh">
                <IconButton 
                  size="small" 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => handleDownload('png')}>
                  <DownloadIcon sx={{ mr: 1 }} /> Export PNG
                </MenuItem>
                <MenuItem onClick={() => handleDownload('pdf')}>
                  <DownloadIcon sx={{ mr: 1 }} /> Export PDF
                </MenuItem>
                {onEdit && (
                  <MenuItem onClick={() => { onEdit(chartId || chartData); handleMenuClose(); }}>
                    <EditIcon sx={{ mr: 1 }} /> Edit Chart
                  </MenuItem>
                )}
              </Menu>
            </Box>
          )}
        </Box>
        
        {chartData?.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {chartData.description}
          </Typography>
        )}
      </CardContent>

      {/* Chart Content */}
      <CardContent sx={{ flex: 1, pt: 0 }}>
        <Box sx={{ height: height - 120 }}>
          {determineRenderEngine === 'recharts' ? renderRechartsChart() : renderPlotlyChart()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SupersetChart;