import React, { useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Box, 
  Paper, 
  ToggleButton, 
  ToggleButtonGroup,
  Typography,
  Stack,
  Button,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  TableChart as TableIcon,
  PivotTableChart as PivotIcon,
  BarChart as BarChartIcon,
  LineStyle as LineChartIcon,
  PieChart as PieChartIcon,
  BubbleChart as ScatterIcon,
  Timeline as AreaChartIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
  Treemap, FunnelChart, Funnel, LabelList
} from 'recharts';
import { sapChartColors } from '../themes/sapFioriTheme';

// Custom Recharts components for better visualization
const CHART_COLORS = sapChartColors;

// Enhanced tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 2,
        }}
      >
        <Typography variant="body2" fontWeight="bold">
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: entry.color }}
          >
            {entry.name}: {typeof entry.value === 'number' 
              ? entry.value.toLocaleString() 
              : entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

function EnhancedResultsTable({ results }) {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState('table');
  const [chartType, setChartType] = useState('bar');
  const [selectedTab, setSelectedTab] = useState(0);
  
  if (!results || results.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
        No results to display
      </Box>
    );
  }

  // Generate columns from the first row
  const columns = Object.keys(results[0]).map((key) => ({
    field: key,
    headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      const value = params.value;
      if (value === null || value === undefined) return '-';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'number') {
        if (Number.isInteger(value)) return value.toLocaleString();
        return value.toFixed(2);
      }
      return String(value);
    },
  }));

  // Add id field if not present
  const rows = results.map((row, index) => ({
    id: row.id || index,
    ...row,
  }));

  // Detect numeric and categorical columns
  const detectColumns = () => {
    if (!results || results.length === 0) return { numeric: [], categorical: [] };
    const firstRow = results[0];
    const numeric = [];
    const categorical = [];
    
    Object.keys(firstRow).forEach(key => {
      const value = firstRow[key];
      if (typeof value === 'number' && !key.toLowerCase().includes('id')) {
        numeric.push(key);
      } else if (typeof value === 'string') {
        categorical.push(key);
      }
    });
    
    return { numeric, categorical };
  };

  const { numeric: numericColumns, categorical: categoricalColumns } = detectColumns();

  // Prepare data for charts
  const prepareChartData = () => {
    if (!results || results.length === 0) return [];
    
    // For time series, look for date columns
    const dateColumn = categoricalColumns.find(col => 
      col.toLowerCase().includes('date') || 
      col.toLowerCase().includes('time') ||
      col.toLowerCase().includes('month') ||
      col.toLowerCase().includes('year')
    );
    
    // Use the first categorical column as x-axis if no date column
    const xAxisColumn = dateColumn || categoricalColumns[0];
    const yAxisColumn = numericColumns[0];
    
    if (!xAxisColumn || !yAxisColumn) return results;
    
    // Aggregate data if needed
    const aggregated = {};
    results.forEach(row => {
      const key = row[xAxisColumn];
      if (!aggregated[key]) {
        aggregated[key] = { [xAxisColumn]: key };
        numericColumns.forEach(col => {
          aggregated[key][col] = 0;
        });
      }
      numericColumns.forEach(col => {
        aggregated[key][col] += row[col] || 0;
      });
    });
    
    return Object.values(aggregated);
  };

  const chartData = prepareChartData();

  // Render different chart types
  const renderChart = () => {
    const xAxisColumn = categoricalColumns[0] || Object.keys(results[0])[0];
    const yAxisColumns = numericColumns.length > 0 ? numericColumns : [Object.keys(results[0])[1]];
    
    const commonProps = {
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps} data={chartData}>
            <defs>
              {yAxisColumns.map((col, index) => (
                <linearGradient key={col} id={`gradient-${col}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisColumn} 
              angle={-45} 
              textAnchor="end"
              height={80}
            />
            <YAxis tickFormatter={(value) => value.toLocaleString()} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {yAxisColumns.map((col, index) => (
              <Line
                key={col}
                type="monotone"
                dataKey={col}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisColumn} 
              angle={-45} 
              textAnchor="end"
              height={80}
            />
            <YAxis tickFormatter={(value) => value.toLocaleString()} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {yAxisColumns.map((col, index) => (
              <Bar
                key={col}
                dataKey={col}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        const pieData = chartData.map((item, index) => ({
          name: item[xAxisColumn],
          value: item[yAxisColumns[0]] || 0,
          percentage: ((item[yAxisColumns[0]] / chartData.reduce((sum, d) => sum + d[yAxisColumns[0]], 0)) * 100).toFixed(1)
        }));
        
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => entry.percentage > 5 ? `${entry.percentage}%` : ''}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps} data={chartData}>
            <defs>
              {yAxisColumns.map((col, index) => (
                <linearGradient key={col} id={`areaGradient-${col}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisColumn} 
              angle={-45} 
              textAnchor="end"
              height={80}
            />
            <YAxis tickFormatter={(value) => value.toLocaleString()} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {yAxisColumns.map((col, index) => (
              <Area
                key={col}
                type="monotone"
                dataKey={col}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                fill={`url(#areaGradient-${col})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );

      case 'scatter':
        if (numericColumns.length >= 2) {
          const scatterData = results.map(row => ({
            x: row[numericColumns[0]],
            y: row[numericColumns[1]],
            label: row[categoricalColumns[0]] || '',
          }));
          
          return (
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name={numericColumns[0]}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name={numericColumns[1]}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                name="Data" 
                data={scatterData} 
                fill={CHART_COLORS[0]}
              />
            </ScatterChart>
          );
        }
        return <Typography>Need at least 2 numeric columns for scatter plot</Typography>;

      default:
        return null;
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    if (numericColumns.length === 0) return null;
    
    const stats = {};
    numericColumns.forEach(col => {
      const values = results.map(row => row[col]).filter(v => typeof v === 'number');
      stats[col] = {
        total: values.reduce((sum, v) => sum + v, 0),
        average: values.reduce((sum, v) => sum + v, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      };
    });
    
    return stats;
  };

  const stats = calculateStats();

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <Box>
      {/* View Mode Toggle */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          View Mode:
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="table">
            <TableIcon sx={{ mr: 1 }} />
            Table
          </ToggleButton>
          <ToggleButton value="charts">
            <BarChartIcon sx={{ mr: 1 }} />
            Charts
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Table View */}
      {viewMode === 'table' && (
        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50, 100]}
            checkboxSelection
            disableSelectionOnClick
            density="compact"
            sx={{
              '& .MuiDataGrid-cell': {
                fontSize: '0.875rem',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'action.hover',
                fontSize: '0.875rem',
                fontWeight: 600,
              },
            }}
          />
        </Paper>
      )}

      {/* Enhanced Charts View */}
      {viewMode === 'charts' && (
        <Box>
          {/* Chart Type Selector */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={chartType} onChange={(e, v) => setChartType(v)}>
              <Tab icon={<BarChartIcon />} label="Bar" value="bar" />
              <Tab icon={<LineChartIcon />} label="Line" value="line" />
              <Tab icon={<PieChartIcon />} label="Pie" value="pie" />
              <Tab icon={<AreaChartIcon />} label="Area" value="area" />
              <Tab icon={<ScatterIcon />} label="Scatter" value="scatter" />
            </Tabs>
          </Box>

          {/* Chart Display */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <ResponsiveContainer width="100%" height={400}>
              {renderChart()}
            </ResponsiveContainer>
          </Paper>

          {/* Statistics */}
          {stats && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Data Statistics</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {Object.entries(stats).map(([column, columnStats]) => (
                    <Box key={column}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ')}
                      </Typography>
                      <Stack direction="row" spacing={4}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Total
                          </Typography>
                          <Typography variant="body2">
                            {columnStats.total.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Average
                          </Typography>
                          <Typography variant="body2">
                            {columnStats.average.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Min
                          </Typography>
                          <Typography variant="body2">
                            {columnStats.min.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Max
                          </Typography>
                          <Typography variant="body2">
                            {columnStats.max.toLocaleString()}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      )}
    </Box>
  );
}

export default EnhancedResultsTable;