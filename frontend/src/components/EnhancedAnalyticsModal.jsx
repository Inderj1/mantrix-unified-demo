import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Collapse,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Badge,
  Drawer,
  Fab,
  Zoom,
  Fade,
  Backdrop,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Close as CloseIcon,
  FullscreenExit as MinimizeIcon,
  Fullscreen as MaximizeIcon,
  QueryStats as QueryStatsIcon,
  BarChart as BarChartIcon,
  Timeline as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterPlot as ScatterIcon,
  BubbleChart as BubbleIcon,
  DonutLarge as DonutIcon,
  ShowChart as AreaChartIcon,
  Insights as InsightsIcon,
  AutoGraph as AutoGraphIcon,
  TableChart as TableIcon,
  Code as CodeIcon,
  Chat as ChatIcon,
  PlayArrow as PlayArrowIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon,
  Storage as DatabaseIcon,
  Schema as SchemaIcon,
  History as HistoryIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  DataUsage as DataUsageIcon,
  ViewColumn as ViewColumnIcon,
  FormatListBulleted as FormatListIcon,
  GridOn as GridIcon,
  Map as MapIcon,
  WaterfallChart as WaterfallIcon,
  CandlestickChart as CandlestickIcon,
  StackedBarChart as StackedBarIcon,
  MultilineChart as MultilineIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Palette as PaletteIcon,
  FormatPaint as FormatPaintIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, Scatter, Bubble, Radar, PolarArea } from 'react-chartjs-2';
import { apiService } from '../services/api';
import ChartBuilder from './ChartBuilder';
import DatabaseConnectorModal from './DatabaseConnectorModal';
import { useTheme } from '@mui/material/styles';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const EnhancedAnalyticsModal = ({ 
  open, 
  onClose, 
  initialQuery = '', 
  initialData = null,
  mode = 'modal', // 'modal', 'drawer', 'embedded'
  onQueryExecute,
  conversationId,
}) => {
  const theme = useTheme();
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [queryMode, setQueryMode] = useState('nlp'); // 'nlp', 'sql', 'visual'
  
  // Query states
  const [nlpQuery, setNlpQuery] = useState(initialQuery);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState([]);
  const [savedQueries, setSavedQueries] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Data states
  const [queryResults, setQueryResults] = useState(initialData);
  const [selectedTable, setSelectedTable] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const [tableSchemas, setTableSchemas] = useState({});
  const [dataConnections, setDataConnections] = useState([]);
  
  // Visualization states
  const [charts, setCharts] = useState([]);
  const [activeChartId, setActiveChartId] = useState(null);
  const [chartConfigs, setChartConfigs] = useState({});
  const [dashboardLayout, setDashboardLayout] = useState([]);
  
  // UI states
  const [showDataCatalog, setShowDataCatalog] = useState(false);
  const [showChartBuilder, setShowChartBuilder] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const [filters, setFilters] = useState([]);
  const [groupBy, setGroupBy] = useState([]);
  const [aggregations, setAggregations] = useState({});
  
  // Load initial data
  useEffect(() => {
    if (open) {
      loadDataCatalog();
      loadQueryHistory();
      loadSavedQueries();
    }
  }, [open]);

  // Handle initial data
  useEffect(() => {
    if (initialData) {
      setQueryResults(initialData);
      // Auto-suggest visualizations based on data structure
      suggestVisualizations(initialData);
    }
  }, [initialData]);

  const loadDataCatalog = async () => {
    try {
      const schemas = await apiService.getSchemas();
      setAvailableTables(schemas.data.tables || []);
      setTableSchemas(schemas.data.schemas || {});
    } catch (error) {
      console.error('Failed to load data catalog:', error);
    }
  };

  const loadQueryHistory = () => {
    // Load from localStorage or API
    const history = JSON.parse(localStorage.getItem('queryHistory') || '[]');
    setQueryHistory(history.slice(0, 20)); // Keep last 20
  };

  const loadSavedQueries = () => {
    // Load from localStorage or API
    const saved = JSON.parse(localStorage.getItem('savedQueries') || '[]');
    setSavedQueries(saved);
  };

  const executeQuery = async () => {
    setIsExecuting(true);
    try {
      let response;
      
      if (queryMode === 'nlp') {
        // Generate SQL from NLP
        const sqlResponse = await apiService.generateSQL(nlpQuery);
        setSqlQuery(sqlResponse.data.sql);
        
        // Execute the generated SQL
        response = await apiService.executeQuery(nlpQuery, {
          conversationId,
          includeMetadata: true,
        });
      } else if (queryMode === 'sql') {
        // Execute SQL directly
        response = await apiService.executeQuery(sqlQuery, {
          conversationId,
          sql: sqlQuery,
          includeMetadata: true,
        });
      }
      
      if (response?.data) {
        setQueryResults(response.data);
        
        // Add to history
        const historyEntry = {
          id: Date.now(),
          query: queryMode === 'nlp' ? nlpQuery : sqlQuery,
          type: queryMode,
          timestamp: new Date().toISOString(),
          resultCount: response.data.rows?.length || 0,
        };
        
        const newHistory = [historyEntry, ...queryHistory.slice(0, 19)];
        setQueryHistory(newHistory);
        localStorage.setItem('queryHistory', JSON.stringify(newHistory));
        
        // Auto-suggest visualizations
        suggestVisualizations(response.data);
        
        // Notify parent if callback provided
        if (onQueryExecute) {
          onQueryExecute(response.data);
        }
      }
    } catch (error) {
      console.error('Query execution failed:', error);
      setQueryResults({ error: error.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const suggestVisualizations = (data) => {
    if (!data || !data.rows || data.rows.length === 0) return;
    
    const columns = Object.keys(data.rows[0]);
    const suggestions = [];
    
    // Analyze data types and suggest appropriate charts
    const numericColumns = columns.filter(col => 
      typeof data.rows[0][col] === 'number'
    );
    const categoricalColumns = columns.filter(col => 
      typeof data.rows[0][col] === 'string'
    );
    
    // Suggest based on data characteristics
    if (numericColumns.length >= 2) {
      suggestions.push({ type: 'scatter', reason: 'Good for comparing two numeric values' });
      suggestions.push({ type: 'line', reason: 'Show trends over continuous data' });
    }
    
    if (categoricalColumns.length >= 1 && numericColumns.length >= 1) {
      suggestions.push({ type: 'bar', reason: 'Compare values across categories' });
      suggestions.push({ type: 'pie', reason: 'Show composition of a whole' });
    }
    
    if (data.rows.length > 50 && numericColumns.length >= 1) {
      suggestions.push({ type: 'heatmap', reason: 'Visualize patterns in large datasets' });
    }
    
    // Auto-create first suggested chart
    if (suggestions.length > 0 && charts.length === 0) {
      createChart(suggestions[0].type);
    }
  };

  const createChart = (type) => {
    const chartId = `chart_${Date.now()}`;
    const newChart = {
      id: chartId,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
      data: queryResults,
      config: getDefaultChartConfig(type, queryResults),
    };
    
    setCharts([...charts, newChart]);
    setActiveChartId(chartId);
    setChartConfigs({
      ...chartConfigs,
      [chartId]: newChart.config,
    });
  };

  const getDefaultChartConfig = (type, data) => {
    if (!data || !data.rows || data.rows.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    const columns = Object.keys(data.rows[0]);
    
    // Find first string column for labels and first numeric column for values
    let labelColumn = columns.find(col => typeof data.rows[0][col] === 'string') || columns[0];
    let valueColumn = columns.find(col => typeof data.rows[0][col] === 'number') || columns[1];
    
    // For pie/doughnut charts, aggregate by category
    if (type === 'pie' || type === 'doughnut') {
      const aggregated = {};
      data.rows.forEach(row => {
        const key = row[labelColumn] || 'Unknown';
        if (!aggregated[key]) aggregated[key] = 0;
        aggregated[key] += parseFloat(row[valueColumn] || 0);
      });
      
      return {
        labels: Object.keys(aggregated),
        datasets: [{
          data: Object.values(aggregated),
          backgroundColor: [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.error.main,
            theme.palette.warning.main,
            theme.palette.info.main,
            theme.palette.success.main,
          ],
        }],
      };
    }
    
    // For other charts
    const labels = data.rows.map(row => row[labelColumn]);
    const values = data.rows.map(row => parseFloat(row[valueColumn] || 0));
    
    return {
      labels,
      datasets: [{
        label: valueColumn,
        data: values,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.dark,
        borderWidth: 2,
      }],
    };
  };

  const saveQuery = () => {
    const query = {
      id: Date.now(),
      name: `Query ${savedQueries.length + 1}`,
      query: queryMode === 'nlp' ? nlpQuery : sqlQuery,
      type: queryMode,
      timestamp: new Date().toISOString(),
    };
    
    const newSaved = [...savedQueries, query];
    setSavedQueries(newSaved);
    localStorage.setItem('savedQueries', JSON.stringify(newSaved));
  };

  const renderQueryInterface = () => (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={queryMode}
          exclusive
          onChange={(e, v) => v && setQueryMode(v)}
          size="small"
        >
          <ToggleButton value="nlp">
            <ChatIcon sx={{ mr: 1 }} />
            Natural Language
          </ToggleButton>
          <ToggleButton value="sql">
            <CodeIcon sx={{ mr: 1 }} />
            SQL
          </ToggleButton>
          <ToggleButton value="visual">
            <AutoGraphIcon sx={{ mr: 1 }} />
            Visual Builder
          </ToggleButton>
        </ToggleButtonGroup>
        
        <Box sx={{ flex: 1 }} />
        
        <Button
          variant="outlined"
          size="small"
          startIcon={<DatabaseIcon />}
          onClick={() => setShowDataCatalog(true)}
        >
          Browse Tables
        </Button>
      </Stack>
      
      {queryMode === 'nlp' && (
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Ask a question about your data in plain English..."
          value={nlpQuery}
          onChange={(e) => setNlpQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
      )}
      
      {queryMode === 'sql' && (
        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder="SELECT * FROM table WHERE ..."
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          sx={{ 
            mb: 2,
            '& .MuiInputBase-root': {
              fontFamily: 'monospace',
            },
          }}
        />
      )}
      
      {queryMode === 'visual' && (
        <Paper variant="outlined" sx={{ p: 3, mb: 2, minHeight: 200 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Visual query builder coming soon...
          </Typography>
        </Paper>
      )}
      
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={executeQuery}
          disabled={isExecuting || (!nlpQuery && queryMode === 'nlp') || (!sqlQuery && queryMode === 'sql')}
        >
          {isExecuting ? 'Executing...' : 'Execute Query'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={saveQuery}
          disabled={!nlpQuery && !sqlQuery}
        >
          Save Query
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={() => setActiveTab(3)}
        >
          History
        </Button>
      </Stack>
      
      {sqlQuery && queryMode === 'nlp' && (
        <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Generated SQL:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', mt: 1 }}>
            {sqlQuery}
          </Typography>
        </Paper>
      )}
    </Box>
  );

  const renderDataResults = () => (
    <Box>
      {isExecuting && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {queryResults?.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {queryResults.error}
        </Alert>
      )}
      
      {queryResults?.rows && (
        <>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h6">
              Results ({queryResults.rows.length} rows)
            </Typography>
            
            <Box sx={{ flex: 1 }} />
            
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => downloadResults('csv')}
            >
              Export CSV
            </Button>
            
            <Button
              size="small"
              startIcon={<BarChartIcon />}
              onClick={() => setShowChartBuilder(true)}
            >
              Visualize
            </Button>
          </Stack>
          
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {Object.keys(queryResults.rows[0] || {}).map((col) => (
                    <TableCell key={col}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {queryResults.rows.slice(0, 100).map((row, idx) => (
                  <TableRow key={idx}>
                    {Object.values(row).map((val, cidx) => (
                      <TableCell key={cidx}>
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {queryResults.rows.length > 100 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Showing first 100 rows of {queryResults.rows.length}
            </Typography>
          )}
        </>
      )}
    </Box>
  );

  const renderVisualizations = () => (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h6">Visualizations</Typography>
        
        <Box sx={{ flex: 1 }} />
        
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setShowChartBuilder(true)}
        >
          Add Chart
        </Button>
      </Stack>
      
      {charts.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            No visualizations yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<BarChartIcon />}
            onClick={() => setShowChartBuilder(true)}
            sx={{ mt: 2 }}
          >
            Create Your First Chart
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {charts.map((chart) => (
            <Grid item xs={12} md={6} key={chart.id}>
              <Card 
                variant="outlined"
                sx={{ 
                  border: activeChartId === chart.id ? 2 : 1,
                  borderColor: activeChartId === chart.id ? 'primary.main' : 'divider',
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">{chart.title}</Typography>
                    <Box sx={{ flex: 1 }} />
                    <IconButton size="small">
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  
                  <Box sx={{ height: 300 }}>
                    {renderChart(chart)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderChart = (chart) => {
    const config = chartConfigs[chart.id] || chart.config;
    
    if (!config || !config.labels || !config.datasets) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography color="error">Invalid chart configuration</Typography>
        </Box>
      );
    }
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
      },
    };
    
    switch (chart.type) {
      case 'line':
        return <Line data={config} options={options} />;
      case 'bar':
        return <Bar data={config} options={options} />;
      case 'pie':
        return <Pie data={config} options={options} />;
      case 'doughnut':
        return <Doughnut data={config} options={options} />;
      case 'scatter':
        return <Scatter data={config} options={options} />;
      case 'bubble':
        return <Bubble data={config} options={options} />;
      case 'radar':
        return <Radar data={config} options={options} />;
      case 'polarArea':
        return <PolarArea data={config} options={options} />;
      default:
        return <Typography>Unsupported chart type: {chart.type}</Typography>;
    }
  };

  const renderHistory = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Query History
      </Typography>
      
      <List>
        {queryHistory.map((entry) => (
          <ListItem
            key={entry.id}
            secondaryAction={
              <Stack direction="row" spacing={1}>
                <IconButton 
                  size="small"
                  onClick={() => {
                    if (entry.type === 'nlp') {
                      setNlpQuery(entry.query);
                      setQueryMode('nlp');
                    } else {
                      setSqlQuery(entry.query);
                      setQueryMode('sql');
                    }
                    setActiveTab(0);
                  }}
                >
                  <PlayArrowIcon fontSize="small" />
                </IconButton>
              </Stack>
            }
          >
            <ListItemIcon>
              {entry.type === 'nlp' ? <ChatIcon /> : <CodeIcon />}
            </ListItemIcon>
            <ListItemText
              primary={entry.query}
              secondary={`${new Date(entry.timestamp).toLocaleString()} • ${entry.resultCount} rows`}
              primaryTypographyProps={{
                sx: { 
                  fontFamily: entry.type === 'sql' ? 'monospace' : 'inherit',
                  fontSize: '0.875rem',
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const downloadResults = (format) => {
    if (!queryResults?.rows) return;
    
    if (format === 'csv') {
      const headers = Object.keys(queryResults.rows[0]);
      const csv = [
        headers.join(','),
        ...queryResults.rows.map(row => 
          headers.map(h => JSON.stringify(row[h])).join(',')
        ),
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query_results_${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <AnalyticsIcon color="primary" />
          <Typography variant="h5" sx={{ flex: 1 }}>
            Analytics Workbench
          </Typography>
          
          {mode === 'modal' && (
            <>
              <IconButton onClick={() => setFullscreen(!fullscreen)}>
                {fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
              </IconButton>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </>
          )}
        </Stack>
      </Box>
      
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Query" icon={<QueryStatsIcon />} iconPosition="start" />
        <Tab label="Results" icon={<TableIcon />} iconPosition="start" disabled={!queryResults} />
        <Tab label="Visualize" icon={<BarChartIcon />} iconPosition="start" disabled={!queryResults} />
        <Tab label="History" icon={<HistoryIcon />} iconPosition="start" />
      </Tabs>
      
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {activeTab === 0 && renderQueryInterface()}
        {activeTab === 1 && renderDataResults()}
        {activeTab === 2 && renderVisualizations()}
        {activeTab === 3 && renderHistory()}
      </Box>
      
      {/* Chart Builder Dialog */}
      <ChartBuilder
        open={showChartBuilder}
        onClose={() => setShowChartBuilder(false)}
        data={queryResults}
        onSave={(chartConfig) => {
          const chartId = `chart_${Date.now()}`;
          const newChart = {
            id: chartId,
            type: chartConfig.type,
            title: chartConfig.title,
            data: queryResults,
            config: chartConfig.config,
          };
          
          setCharts([...charts, newChart]);
          setActiveChartId(chartId);
          setChartConfigs({
            ...chartConfigs,
            [chartId]: chartConfig.config,
          });
          setShowChartBuilder(false);
        }}
      />
      
      {/* Data Catalog Dialog */}
      <DatabaseConnectorModal
        open={showDataCatalog}
        onClose={() => setShowDataCatalog(false)}
        onSelectTable={(table) => {
          // Insert table reference into query
          if (queryMode === 'sql') {
            setSqlQuery(sqlQuery + (sqlQuery ? ' ' : '') + table.name);
          } else {
            setNlpQuery(nlpQuery + (nlpQuery ? ' from ' : '') + table.name);
          }
          setShowDataCatalog(false);
        }}
      />
    </Box>
  );

  if (mode === 'modal') {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullscreen}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: fullscreen ? '100vh' : '90vh',
            maxHeight: fullscreen ? '100vh' : '90vh',
          },
        }}
      >
        {content}
      </Dialog>
    );
  } else if (mode === 'drawer') {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: '80vw', maxWidth: 1200 },
        }}
      >
        {content}
      </Drawer>
    );
  } else {
    // Embedded mode
    return <Paper sx={{ height: '100%', overflow: 'hidden' }}>{content}</Paper>;
  }
};

export default EnhancedAnalyticsModal;