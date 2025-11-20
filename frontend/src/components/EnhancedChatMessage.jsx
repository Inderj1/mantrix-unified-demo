import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Chip,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
  Button,
  Menu,
  MenuItem,
  Divider,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from '@mui/material';
import {
  Person as PersonIcon,
  SmartToy as AIIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  TableChart as TableIcon,
  PivotTableChart as PivotIcon,
  BarChart as BarChartIcon,
  LineStyle as LineChartIcon,
  PieChart as PieChartIcon,
  Download as DownloadIcon,
  Code as CodeIcon,
  Analytics as AnalyticsIcon,
  AttachMoney as AttachMoneyIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import SQLDisplay from './SQLDisplay';
import CustomPlotlyRenderers from './CustomPlotlyRenderers';

const CHART_COLORS = ['#4285F4', '#34A853', '#FBBC04', '#EA4335', '#9C27B0', '#00BCD4', '#FF5722', '#607D8B'];

const EnhancedChatMessage = ({ message, aiConfig }) => {
  const [viewMode, setViewMode] = useState('table');
  const [chartType, setChartType] = useState('bar');
  const [pivotState, setPivotState] = useState({});
  const [expanded, setExpanded] = useState(true);

  // Copy functions
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadCSV = (data) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render user message
  if (message.type === 'user') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Stack direction="row" spacing={2} sx={{ maxWidth: '70%', alignItems: 'flex-start' }}>
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="body1">{message.content}</Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
              {message.timestamp.toLocaleTimeString()}
            </Typography>
          </Paper>
          <Avatar sx={{ bgcolor: 'grey.500', width: 36, height: 36 }}>
            <PersonIcon />
          </Avatar>
        </Stack>
      </Box>
    );
  }

  // Render AI message with query results
  if (message.type === 'ai_query_result') {
    const { sql, results, metadata, explanation } = message;
    
    console.log('EnhancedChatMessage - Rendering query result:', {
      hasSQL: !!sql,
      hasResults: !!results,
      resultsLength: results?.length,
      resultsData: results,
      metadata,
      fullMessage: message
    });
    
    // Prepare data for charts
    const prepareChartData = () => {
      if (!results || results.length === 0) return [];
      
      const numericColumns = Object.keys(results[0]).filter(key => 
        typeof results[0][key] === 'number' && !key.toLowerCase().includes('id')
      );
      const categoricalColumns = Object.keys(results[0]).filter(key => 
        typeof results[0][key] === 'string'
      );
      
      const xAxisColumn = categoricalColumns[0] || Object.keys(results[0])[0];
      const yAxisColumn = numericColumns[0] || Object.keys(results[0])[1];
      
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
    
    console.log('EnhancedChatMessage - Chart Data:', {
      chartDataLength: chartData.length,
      chartData: chartData,
      firstRow: chartData[0]
    });
    
    // DataGrid columns
    console.log('Preparing DataGrid data:', { results, resultsLength: results?.length });
    
    const columns = results && results.length > 0
      ? Object.keys(results[0]).map((key) => {
          // Check if this is a quantity/count column (should NOT be formatted as currency)
          const isQuantity = key.toLowerCase().includes('quantity') ||
                            key.toLowerCase().includes('qty') ||
                            key.toLowerCase().includes('count') ||
                            key.toLowerCase().includes('units');

          // Check if this is a currency amount column
          const isAmount = !isQuantity && (
                          key.toLowerCase().includes('amount') ||
                          key.toLowerCase().includes('revenue') ||
                          key.toLowerCase().includes('cost') ||
                          key.toLowerCase().includes('sales') ||
                          key.toLowerCase().includes('gm') ||
                          key.toLowerCase().includes('margin') ||
                          key.toLowerCase().includes('total') ||
                          key.toLowerCase().includes('price'));

          console.log(`Column: ${key}, isQuantity: ${isQuantity}, isAmount: ${isAmount}`);

          return {
            field: key,
            headerName: key
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' '),
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
              // Format numbers with commas and currency for amount fields
              if (typeof params.value === 'number') {
                console.log(`Rendering ${key}: value=${params.value}, isAmount=${isAmount}`);
                if (isAmount) {
                  return `$${params.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
                return params.value.toLocaleString('en-US');
              }
              return params.value || '';
            },
            align: typeof results[0][key] === 'number' ? 'right' : 'left',
            headerAlign: typeof results[0][key] === 'number' ? 'right' : 'left',
          };
        })
      : [];

    const rows = results ? results.map((row, index) => ({
      id: row.id || index,
      ...row,
    })) : [];
    
    console.log('DataGrid prepared:', { columnsCount: columns.length, rowsCount: rows.length });

    return (
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{ bgcolor: aiConfig?.color || '#4285F4', width: 36, height: 36 }}>
            {aiConfig?.icon || <AIIcon />}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            {/* AI Explanation */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', mb: 2 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {explanation || 'Query executed successfully.'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {message.timestamp.toLocaleTimeString()}
              </Typography>
            </Paper>

            {/* SQL Query */}
            {sql && (
              <Accordion defaultExpanded sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CodeIcon fontSize="small" />
                    <Typography variant="subtitle2">Generated SQL Query</Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                      <IconButton size="small" onClick={() => copyToClipboard(sql)}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <SQLDisplay sql={sql} />
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Query Metadata */}
            {metadata && (
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Query Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AttachMoneyIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Cost</Typography>
                          <Typography variant="body2">
                            ${metadata.estimated_cost_usd?.toFixed(8) || '0.00'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SpeedIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Complexity</Typography>
                          <Typography variant="body2">{metadata.complexity || 'Medium'}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <StorageIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Data Scanned</Typography>
                          <Typography variant="body2">
                            {(metadata.bytes_processed || 0).toLocaleString()} bytes
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TableIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Tables Used</Typography>
                          <Typography variant="body2">{metadata.tables_used?.length || 0}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Results Section */}
            {results && results.length > 0 ? (
              <Paper elevation={1} sx={{ p: 2 }}>
                {console.log('Results section - data check:', { 
                  hasResults: !!results, 
                  resultsLength: results?.length,
                  firstRow: results?.[0],
                  viewMode 
                })}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Query Results ({results.length} rows)
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(e, newMode) => newMode && setViewMode(newMode)}
                      size="small"
                    >
                      <ToggleButton value="table">
                        <TableIcon sx={{ mr: 0.5 }} fontSize="small" />
                        Table
                      </ToggleButton>
                      <ToggleButton value="pivot">
                        <PivotIcon sx={{ mr: 0.5 }} fontSize="small" />
                        Pivot
                      </ToggleButton>
                      <ToggleButton value="chart">
                        <BarChartIcon sx={{ mr: 0.5 }} fontSize="small" />
                        Chart
                      </ToggleButton>
                    </ToggleButtonGroup>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadCSV(results)}
                    >
                      Export
                    </Button>
                  </Stack>
                </Stack>

                {/* Table View */}
                {viewMode === 'table' && (
                  <Box sx={{ height: 400, width: '100%' }}>
                    {console.log('Rendering DataGrid with:', { rows, columns, rowsLength: rows.length, columnsLength: columns.length })}
                    {rows.length > 0 && columns.length > 0 ? (
                      <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: 10, page: 0 },
                          },
                        }}
                        pageSizeOptions={[10, 25, 50]}
                        density="compact"
                        disableRowSelectionOnClick
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
                    ) : (
                      <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        No data to display
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Pivot Table View */}
                {viewMode === 'pivot' && (
                  <Box sx={{ width: '100%', overflow: 'auto' }}>
                    <PivotTableUI
                      data={results}
                      onChange={s => setPivotState(s)}
                      renderers={Object.assign({}, TableRenderers, CustomPlotlyRenderers)}
                      {...pivotState}
                    />
                  </Box>
                )}

                {/* Chart View */}
                {viewMode === 'chart' && (
                  <Box>
                    <Tabs value={chartType} onChange={(e, v) => setChartType(v)} sx={{ mb: 2 }}>
                      <Tab value="bar" label="Bar" />
                      <Tab value="line" label="Line" />
                      <Tab value="pie" label="Pie" />
                      <Tab value="area" label="Area" />
                    </Tabs>
                    
                    <ResponsiveContainer width="100%" height={400}>
                      {chartType === 'bar' && (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={Object.keys(chartData[0] || {})[0]} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {chartData.length > 0 && Object.keys(chartData[0] || {}).slice(1).map((key, idx) => (
                            <Bar key={key} dataKey={key} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                          ))}
                        </BarChart>
                      )}
                      
                      {chartType === 'line' && chartData.length > 0 && (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={Object.keys(chartData[0] || {})[0]} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {Object.keys(chartData[0] || {}).slice(1).map((key, idx) => (
                            <Line 
                              key={key} 
                              type="monotone" 
                              dataKey={key} 
                              stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                              strokeWidth={2}
                            />
                          ))}
                        </LineChart>
                      )}
                      
                      {chartType === 'pie' && chartData.length > 0 && (
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey={Object.keys(chartData[0] || {}).find(k => typeof chartData[0][k] === 'number')}
                            label
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      )}
                      
                      {chartType === 'area' && chartData.length > 0 && (
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={Object.keys(chartData[0] || {})[0]} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {Object.keys(chartData[0] || {}).slice(1).map((key, idx) => (
                            <Area 
                              key={key} 
                              type="monotone" 
                              dataKey={key} 
                              fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                            />
                          ))}
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                    
                    {chartData.length === 0 && (
                      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">
                          No data available for chart visualization
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            ) : (
              results && results.length === 0 && (
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    No results found for this query.
                  </Typography>
                </Paper>
              )
            )}

            {/* Error Display */}
            {message.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {message.error}
              </Alert>
            )}
          </Box>
        </Stack>
      </Box>
    );
  }

  // Default AI text message
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar sx={{ bgcolor: aiConfig?.color || '#4285F4', width: 36, height: 36 }}>
          {aiConfig?.icon || <AIIcon />}
        </Avatar>
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', maxWidth: '70%' }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {message.content}
          </Typography>
          {message.error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {message.error}
            </Alert>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {message.timestamp.toLocaleTimeString()}
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
};

export default EnhancedChatMessage;