import React, { useState, useEffect } from 'react';
import { ClerkProvider, useUser } from '@clerk/clerk-react';
import AuthButton from './components/AuthButton';
// Removed react-router-dom imports - using tab-based navigation
import {
  Box,
  Container,
  Paper,
  Fade,
  TextField,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Snackbar,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip as MuiTooltip,
  Menu,
  Stack,
  LinearProgress,
  Dialog,
  Fab,
  Badge,
  ThemeProvider,
} from '@mui/material';
import DataSourcesTab from './components/DataSourcesTab';
import AIChatInterface from './components/AIChatInterface';
import ControlCenter from './components/ControlCenter';
import SimpleChatInterface from './components/SimpleChatInterface';
import EnhancedSidebar from './components/EnhancedSidebar';
import MarketsAIDashboard from './components/MarketsAIDashboard';
import CoreAILanding from './components/CoreAILanding';
import MargenAIDashboard from './components/margenai/MargenAIDashboard';
import AxisAIDashboard from './components/AxisAIDashboard';
import DocumentIntelligence from './components/DocumentIntelligence';
import ProcessMiningPage from './pages/ProcessMiningPage';
import ScenarioAIDashboard from './components/ScenarioAIDashboard';
import ForecastAIDashboard from './components/ForecastAIDashboard';
import ResultsTable from './components/ResultsTable';
import EnterprisePulse from './components/EnterprisePulse';
import DataCatalog from './components/DataCatalog';
// import StoxShiftAI from './components/StoxShiftAI'; // File doesn't exist
import StoxAILanding from './components/StoxAILanding';
import ShortageDetector from './components/stox/ShortageDetector';
import InventoryHeatmap from './components/stox/InventoryHeatmap';
import ReallocationOptimizer from './components/stox/ReallocationOptimizer';
import InboundRiskMonitor from './components/stox/InboundRiskMonitor';
import AgingStockIntelligence from './components/stox/AgingStockIntelligence';
import GlobalSearch from './components/GlobalSearch';
import VisionAIDashboard from './components/VisionAIDashboard';
import UserProfileManager from './components/UserProfileManager';
import { sapFioriTheme, sapChartColors } from './themes/sapFioriTheme';
import { defaultTheme } from './themes/defaultTheme';
import {
  ExpandMore as ExpandMoreIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  PlayArrow as PlayArrowIcon,
  Edit as EditIcon,
  BarChart as BarChartIcon,
  TableChart as TableChartIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  History as HistoryIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  Analytics as AnalyticsIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  QueryStats as QueryStatsIcon,
  Schema as SchemaIcon,
  HealthAndSafety as HealthIcon,
  Cable as CableIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  DataUsage as DataUsageIcon,
  PushPin as PushPinIcon,
  MenuOpen as MenuOpenIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Hub as HubIcon,
  ScatterPlot as ScatterPlotIcon,
  Radar as RadarIcon,
  ViewModule as ViewModuleIcon,
  FilterList as FilterListIcon,
  Forum as ForumIcon,
  Lock as LockIcon,
} from '@mui/icons-material';



// Helper functions
const formatNumber = (num) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};

const formatBytes = (bytes) => {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`;
  return `${bytes} bytes`;
};

function App() {
  // Removed navigate and location - using tab-based navigation
  // Theme state - SAP theme is now default
  const useSapTheme = true;
  const currentTheme = sapFioriTheme;
  
  // State management
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [coreAIView, setCoreAIView] = useState('landing'); // 'landing', 'margen', 'stox'
  const [stoxView, setStoxView] = useState('landing'); // 'landing', 'stoxshift'
  const [axisAIView, setAxisAIView] = useState('landing'); // 'landing', 'forecast', 'budget', 'driver', 'scenario', 'insights'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [apiHealth, setApiHealth] = useState(null);
  const [connectors, setConnectors] = useState([]);
  const [selectedHistoryQuery, setSelectedHistoryQuery] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [tableDetailsOpen, setTableDetailsOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [schemaData, setSchemaData] = useState({
    summary: {
      totalTables: 0,
      totalColumns: 0,
      totalRows: 0,
      totalSize: 0,
      totalRelationships: 0,
      dataSources: 0
    },
    schemas: []
  });
  const [loadingSchema, setLoadingSchema] = useState(false);
  
  // Data Explorer filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dataSourceFilter, setDataSourceFilter] = useState('');
  const [schemaFilter, setSchemaFilter] = useState('');
  const [tableTypeFilter, setTableTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('table');

  // Handle search navigation
  const handleSearchNavigation = (action) => {
    console.log('Search navigation:', action);
    
    // Navigate to the appropriate tab
    if (action.tabId !== undefined) {
      setSelectedTab(action.tabId);
    }
    
    // Handle CORE.AI specific navigation
    if (action.view) {
      setCoreAIView(action.view);
      
      // Handle STOX.AI specific navigation
      if (action.stoxView) {
        setStoxView(action.stoxView);
        
        // Handle STOXSHIFT.AI specific navigation
        if (action.stoxshiftTile) {
          // This would require passing props to StoxShiftAI to auto-select tile/tab
          // For now, we'll just navigate to the page
          console.log('Navigate to STOXSHIFT tile:', action.stoxshiftTile, 'tab:', action.stoxshiftTab);
        }
      }
    }
    
    // Handle AXIS.AI specific navigation
    if (action.axisView) {
      setAxisAIView(action.axisView);
    }
  };

  // Initialize
  useEffect(() => {
    checkApiHealth();
    loadQueryHistory();
    loadConnectors();
  }, []);

  // Load schema data when Data Explorer tab is selected
  useEffect(() => {
    if (selectedTab === 5) {
      loadSchemaData();
    }
  }, [selectedTab]);

  // API Functions
  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/health`);
      if (response.ok) {
        const health = await response.json();
        setApiHealth(health);
        showSnackbar('API is healthy', 'success');
      } else {
        setApiHealth({ status: 'unhealthy' });
        showSnackbar('API health check failed', 'error');
      }
    } catch (error) {
      setApiHealth({ status: 'error', message: error.message });
      showSnackbar('Cannot connect to API', 'error');
    }
  };

  const loadConnectors = () => {
    // Simulated connectors data
    setConnectors([
      { name: 'BigQuery', status: 'connected', icon: '🔷', color: '#4285F4' },
      { name: 'Weaviate', status: 'connected', icon: '🟢', color: '#00FF00' },
      { name: 'Redis', status: 'connected', icon: '🔴', color: '#DC382D' },
      { name: 'Anthropic API', status: 'connected', icon: '🤖', color: '#7C3AED' },
    ]);
  };

  const loadSchemaData = async () => {
    setLoadingSchema(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/schemas`);
      if (response.ok) {
        const data = await response.json();
        // Transform backend response to match frontend structure
        const transformedData = {
          summary: {
            totalTables: data.total_count || 0,
            totalColumns: data.tables ? data.tables.reduce((sum, table) => sum + (table.columns ? table.columns.length : 0), 0) : 0,
            totalRows: data.tables ? data.tables.reduce((sum, table) => sum + (table.row_count || 0), 0) : 0,
            totalSize: data.tables ? data.tables.reduce((sum, table) => sum + (table.size_bytes || 0), 0) : 0,
            totalRelationships: 0, // Would need to be calculated from table relationships
            dataSources: 1 // BigQuery
          },
          schemas: [{
            source: 'BigQuery',
            database: 'Dataset',
            tables: data.tables || []
          }]
        };
        setSchemaData(transformedData);
      } else {
        // Use mock data for now
        setSchemaData({
          summary: {
            totalTables: 42,
            totalColumns: 847,
            totalRows: 2400000,
            totalSize: 125829120, // 120 MB in bytes
            totalRelationships: 18,
            dataSources: 3
          },
          schemas: [
            {
              source: 'BigQuery',
              database: '1k_dataset',
              tables: [
                {
                  name: 'CE11000',
                  description: 'COPA main transaction table',
                  rowCount: 5000000,
                  sizeBytes: 256000000,
                  lastModified: '2 hours ago',
                  relationships: 3,
                  columns: [
                    { name: 'GJAHR', type: 'INTEGER', nullable: false, description: 'Fiscal Year' },
                    { name: 'PERIO', type: 'INTEGER', nullable: false, description: 'Posting Period' },
                    { name: 'KOKRS', type: 'STRING', nullable: false, description: 'Controlling Area' },
                    { name: 'VV001', type: 'NUMERIC', nullable: true, description: 'Revenue' },
                  ]
                },
                {
                  name: 'products',
                  description: 'Product master data',
                  rowCount: 8421,
                  sizeBytes: 12582912,
                  lastModified: '1 day ago',
                  relationships: 5
                }
              ]
            },
            {
              source: 'PostgreSQL',
              database: 'operations_db',
              tables: [
                {
                  name: 'orders',
                  description: 'Customer orders',
                  rowCount: 543210,
                  sizeBytes: 67108864,
                  lastModified: '30 minutes ago',
                  relationships: 4
                }
              ]
            }
          ]
        });
        showSnackbar('Using sample data for demonstration', 'info');
      }
    } catch (error) {
      console.error('Error loading schema:', error);
      // Use mock data on error
      setSchemaData({
        summary: {
          totalTables: 42,
          totalColumns: 847,
          totalRows: 2400000,
          totalSize: 125829120,
          totalRelationships: 18,
          dataSources: 3
        },
        schemas: [
          {
            source: 'BigQuery',
            database: 'copa_export_copa_data_000000000000',
            tables: [
              {
                name: 'CE11000',
                description: 'COPA main transaction table',
                rowCount: 5000000,
                sizeBytes: 256000000,
                lastModified: '2 hours ago',
                relationships: 3
              }
            ]
          }
        ]
      });
      showSnackbar('Using sample data (API unavailable)', 'warning');
    } finally {
      setLoadingSchema(false);
    }
  };

  const loadQueryHistory = () => {
    const history = localStorage.getItem('queryHistory');
    if (history) {
      setQueryHistory(JSON.parse(history));
    }
  };

  const saveToHistory = (queryData) => {
    const newHistory = [{
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...queryData
    }, ...queryHistory].slice(0, 50);
    setQueryHistory(newHistory);
    localStorage.setItem('queryHistory', JSON.stringify(newHistory));
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Filter function for Data Explorer tables
  const filterTables = (schemas) => {
    if (!schemas) return [];
    
    return schemas.map(schema => {
      // First apply data source filter
      if (dataSourceFilter && schema.source.toLowerCase() !== dataSourceFilter.toLowerCase()) {
        return null;
      }
      
      // Apply schema filter (database name)
      if (schemaFilter && !schema.database.toLowerCase().includes(schemaFilter.toLowerCase())) {
        return null;
      }
      
      // Filter tables within the schema
      const filteredTables = (schema.tables || []).filter(table => {
        // Apply search term filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesName = table.name.toLowerCase().includes(searchLower);
          const matchesDescription = (table.description || '').toLowerCase().includes(searchLower);
          const matchesColumns = (table.columns || []).some(col => 
            col.name.toLowerCase().includes(searchLower) || 
            (col.description || '').toLowerCase().includes(searchLower)
          );
          
          if (!matchesName && !matchesDescription && !matchesColumns) {
            return false;
          }
        }
        
        // Apply table type filter
        if (tableTypeFilter) {
          const tableType = table.type || 'table';
          if (tableTypeFilter === 'table' && tableType !== 'table') return false;
          if (tableTypeFilter === 'view' && tableType !== 'view') return false;
          if (tableTypeFilter === 'materialized' && tableType !== 'materialized_view') return false;
        }
        
        return true;
      });
      
      // Return schema with filtered tables
      return {
        ...schema,
        tables: filteredTables
      };
    }).filter(schema => schema !== null && schema.tables.length > 0);
  };





  return (
    <ThemeProvider theme={currentTheme}>
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Enhanced Sidebar */}
      <EnhancedSidebar
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        apiHealth={apiHealth}
        useSapTheme={useSapTheme}
      />

      {/* Main Content */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%'
      }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 0, fontWeight: 500, mr: 3 }}>
              {['Chat Interface', 'CORE.AI', 'AXIS.AI', 'MARKETS.AI', 'Control Center', 'Data Catalog', 'Document Intelligence', 'Process Intelligence', 'Enterprise Pulse', 'Vision AI'][selectedTab]}
            </Typography>
            
            {/* Global Search */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              <GlobalSearch onNavigate={handleSearchNavigation} />
            </Box>
            
            <Stack direction="row" spacing={1} alignItems="center">
              {/* API Status */}
              <Chip
                size="small"
                icon={apiHealth?.status === 'healthy' ? <CheckCircleIcon /> : <ErrorIcon />}
                label={`API: ${apiHealth?.status || 'Unknown'}`}
                color={apiHealth?.status === 'healthy' ? 'success' : 'error'}
                variant="outlined"
              />
              {/* DB Status */}
              <Chip
                size="small"
                icon={<CheckCircleIcon />}
                label="DB: Connected"
                color="success"
                variant="outlined"
              />
              <MuiTooltip title="Refresh Status">
                <IconButton color="inherit" onClick={checkApiHealth} size="small">
                  <RefreshIcon />
                </IconButton>
              </MuiTooltip>
            </Stack>
            
            {/* Authentication Button */}
            <Box sx={{ ml: 2 }}>
              <AuthButton />
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{
          mt: 3,
          mb: 3,
          flexGrow: 1,
          overflow: 'hidden',
          width: '100%',
          px: { xs: 2, sm: 3 }
        }}>
          {/* Unified Chat Interface */}
          {selectedTab === 0 && <SimpleChatInterface />}

          {/* CORE.AI Tab - Operational AI */}
          {selectedTab === 1 && (
            <Box sx={{
              height: 'calc(100vh - 180px)',
              overflow: 'hidden',
              width: '100%'
            }}>
              <Fade in={coreAIView === 'landing'} timeout={300}>
                <Box sx={{ display: coreAIView === 'landing' ? 'block' : 'none', height: '100%' }}>
                  <CoreAILanding onTileClick={(moduleId) => {
                    if (moduleId === 'margen') {
                      setCoreAIView('margen');
                    } else if (moduleId === 'stox') {
                      setCoreAIView('stox');
                      setStoxView('landing');
                    }
                  }} />
                </Box>
              </Fade>
              <Fade in={coreAIView === 'margen'} timeout={300}>
                <Box sx={{ display: coreAIView === 'margen' ? 'block' : 'none', height: '100%' }}>
                  <MargenAIDashboard onBack={() => setCoreAIView('landing')} />
                </Box>
              </Fade>
              <Fade in={coreAIView === 'stox'} timeout={300}>
                <Box sx={{
                  display: coreAIView === 'stox' ? 'block' : 'none',
                  height: '100%',
                  overflow: 'hidden',
                  width: '100%'
                }}>
                  {stoxView === 'landing' && (
                    <StoxAILanding
                      onBack={() => setCoreAIView('landing')}
                      onTileClick={(moduleId) => {
                        console.log('STOX tile clicked in App-enhanced, moduleId:', moduleId);
                        console.log('Current stoxView:', stoxView);
                        if (moduleId === 'stoxshift') {
                          console.log('Setting stoxView to: stoxshift');
                          setStoxView('stoxshift');
                        } else if (moduleId === 'shortage-detector') {
                          console.log('Setting stoxView to: shortage-detector');
                          setStoxView('shortage-detector');
                        } else if (moduleId === 'inventory-heatmap') {
                          console.log('Setting stoxView to: inventory-heatmap');
                          setStoxView('inventory-heatmap');
                        } else if (moduleId === 'reallocation-optimizer') {
                          console.log('Setting stoxView to: reallocation-optimizer');
                          setStoxView('reallocation-optimizer');
                        } else if (moduleId === 'inbound-risk-monitor') {
                          console.log('Setting stoxView to: inbound-risk-monitor');
                          setStoxView('inbound-risk-monitor');
                        } else if (moduleId === 'aging-stock-intelligence') {
                          console.log('Setting stoxView to: aging-stock-intelligence');
                          setStoxView('aging-stock-intelligence');
                        }
                      }}
                    />
                  )}
                  {/* {stoxView === 'stoxshift' && (
                    <StoxShiftAI onBack={() => setStoxView('landing')} />
                  )} */}
                  {stoxView === 'shortage-detector' && (
                    <ShortageDetector onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'inventory-heatmap' && (
                    <InventoryHeatmap onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'reallocation-optimizer' && (
                    <ReallocationOptimizer onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'inbound-risk-monitor' && (
                    <InboundRiskMonitor onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'aging-stock-intelligence' && (
                    <AgingStockIntelligence onBack={() => setStoxView('landing')} />
                  )}
                </Box>
              </Fade>
            </Box>
          )}

          {/* AXIS.AI Tab - Strategic AI */}
          {selectedTab === 2 && (
            <Box sx={{ height: 'calc(100vh - 180px)' }}>
              <Fade in={axisAIView === 'landing'} timeout={300}>
                <Box sx={{ display: axisAIView === 'landing' ? 'block' : 'none', height: '100%' }}>
                  <AxisAIDashboard onTileClick={(moduleId) => {
                    setAxisAIView(moduleId);
                  }} />
                </Box>
              </Fade>
              <Fade in={axisAIView === 'forecast'} timeout={300}>
                <Box sx={{ display: axisAIView === 'forecast' ? 'block' : 'none', height: '100%' }}>
                  <ForecastAIDashboard onBack={() => setAxisAIView('landing')} />
                </Box>
              </Fade>
              <Fade in={axisAIView === 'scenario'} timeout={300}>
                <Box sx={{ display: axisAIView === 'scenario' ? 'block' : 'none', height: '100%' }}>
                  <ScenarioAIDashboard onBack={() => setAxisAIView('landing')} />
                </Box>
              </Fade>
            </Box>
          )}

          {/* MARKETS.AI Tab - Dynamic Integration */}
          {selectedTab === 3 && (
            <Box sx={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}>
              <MarketsAIDashboard />
            </Box>
          )}

          {/* Control Center */}
          {selectedTab === 4 && <ControlCenter />}



          {/* Data Catalog Tab */}
          {selectedTab === 5 && <DataCatalog />}

          {/* Old Data Explorer code - can be removed */}
          {false && selectedTab === 5 && (
            <Box>
              <Grid container spacing={3}>
                {/* Summary Cards */}
                <Grid item xs={12}>
                  {loadingSchema ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                              Total Tables
                            </Typography>
                            <Typography variant="h4">
                              {schemaData.summary.totalTables || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Across {schemaData.summary.dataSources || 0} data sources
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                              Total Columns
                            </Typography>
                            <Typography variant="h4">
                              {(schemaData.summary.totalColumns && schemaData.summary.totalColumns.toLocaleString()) || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Average {schemaData.summary.totalTables > 0 
                                ? (schemaData.summary.totalColumns / schemaData.summary.totalTables).toFixed(1) 
                                : 0} per table
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                              Total Rows
                            </Typography>
                            <Typography variant="h4">
                              {formatNumber(schemaData.summary.totalRows || 0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatBytes(schemaData.summary.totalSize || 0)} total size
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                              Relationships
                            </Typography>
                            <Typography variant="h4">
                              {schemaData.summary.totalRelationships || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Foreign key connections
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  )}
                </Grid>

                {/* Search and Filter */}
                <Grid item xs={12}>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Search tables, columns, or descriptions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Data Source</InputLabel>
                          <Select 
                            value={dataSourceFilter} 
                            label="Data Source"
                            onChange={(e) => setDataSourceFilter(e.target.value)}
                          >
                            <MenuItem value="">All Sources</MenuItem>
                            <MenuItem value="bigquery">BigQuery</MenuItem>
                            <MenuItem value="postgres">PostgreSQL</MenuItem>
                            <MenuItem value="mysql">MySQL</MenuItem>
                            <MenuItem value="snowflake">Snowflake</MenuItem>
                            <MenuItem value="mongodb">MongoDB</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Schema</InputLabel>
                          <Select 
                            value={schemaFilter} 
                            label="Schema"
                            onChange={(e) => setSchemaFilter(e.target.value)}
                          >
                            <MenuItem value="">All Schemas</MenuItem>
                            <MenuItem value="public">public</MenuItem>
                            <MenuItem value="analytics">analytics</MenuItem>
                            <MenuItem value="raw">raw</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Table Type</InputLabel>
                          <Select 
                            value={tableTypeFilter} 
                            label="Table Type"
                            onChange={(e) => setTableTypeFilter(e.target.value)}
                          >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="table">Tables</MenuItem>
                            <MenuItem value="view">Views</MenuItem>
                            <MenuItem value="materialized">Materialized Views</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ToggleButtonGroup
                          value={viewMode}
                          exclusive
                          size="small"
                          fullWidth
                          onChange={(e, newMode) => {
                            if (newMode !== null) {
                              setViewMode(newMode);
                            }
                          }}
                        >
                          <ToggleButton value="table">
                            <TableChartIcon sx={{ mr: 1 }} /> Table View
                          </ToggleButton>
                          <ToggleButton value="graph">
                            <SchemaIcon sx={{ mr: 1 }} /> Graph View
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Tables List */}
                <Grid item xs={12}>
                  {loadingSchema ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : schemaData.schemas && schemaData.schemas.length > 0 ? (() => {
                    const filteredSchemas = filterTables(schemaData.schemas);
                    return filteredSchemas.length > 0 ? (
                      filteredSchemas.map((schema, idx) => (
                      <Accordion key={idx} defaultExpanded={idx === 0} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <StorageIcon />
                            <Typography variant="h6">
                              {schema.source} - {schema.database}
                            </Typography>
                            <Chip size="small" label={`${(schema.tables && schema.tables.length) || 0} tables`} />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Table Name</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell align="right">Rows</TableCell>
                              <TableCell align="right">Size</TableCell>
                              <TableCell align="right">Last Updated</TableCell>
                              <TableCell>Relationships</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {schema.tables && schema.tables.map((table, tableIdx) => (
                              <TableRow key={tableIdx} hover>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TableChartIcon fontSize="small" color="primary" />
                                    <Typography variant="body2" fontWeight="medium">
                                      {table.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{table.description || 'No description'}</TableCell>
                                <TableCell align="right">{formatNumber(table.row_count || 0)}</TableCell>
                                <TableCell align="right">{formatBytes(table.size_bytes || 0)}</TableCell>
                                <TableCell align="right">{table.last_modified || 'Unknown'}</TableCell>
                                <TableCell>
                                  {table.relationships ? (
                                    <Chip size="small" label={`${table.relationships} FK`} variant="outlined" />
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1}>
                                  <MuiTooltip title="View details">
                                    <IconButton 
                                      size="small"
                                      onClick={async () => {
                                        // For now, show mock data since API might not be ready
                                        setSelectedTable({
                                          name: table.name,
                                          database: schema.source,
                                          schema: schema.database,
                                          description: table.description || 'No description available',
                                          rows: table.row_count || 0,
                                          size: formatBytes(table.size_bytes || 0),
                                          columns: table.columns || [],
                                          relationships: table.relationshipDetails || [],
                                          indexes: table.indexes || [],
                                          partitioning: table.partitioning,
                                          stats: table.stats || {}
                                        });
                                        setTableDetailsOpen(true);
                                      }}
                                    >
                                      <InfoIcon fontSize="small" />
                                    </IconButton>
                                  </MuiTooltip>
                                  <MuiTooltip title="View sample query">
                                    <IconButton size="small">
                                      <CodeIcon fontSize="small" />
                                    </IconButton>
                                  </MuiTooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            ))}
                            {(!schema.tables || schema.tables.length === 0) && (
                              <TableRow>
                                <TableCell colSpan={7} align="center">
                                  No tables found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    ))
                    ) : (
                      <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          No tables match your filters
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try adjusting your search criteria or clear filters to see all tables
                        </Typography>
                        <Button 
                          variant="outlined" 
                          sx={{ mt: 2 }}
                          onClick={() => {
                            setSearchTerm('');
                            setDataSourceFilter('');
                            setSchemaFilter('');
                            setTableTypeFilter('');
                          }}
                        >
                          Clear Filters
                        </Button>
                      </Paper>
                    )
                  })() : (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No schema data available. Click refresh to load schemas.
                      </Typography>
                    </Paper>
                  )}
                </Grid>

                {/* Table Details Modal/Drawer would go here */}
              </Grid>
            </Box>
          )}

          {/* Document Intelligence Tab */}
          {selectedTab === 6 && <DocumentIntelligence />}
          
          {/* Process Mining Tab */}
          {selectedTab === 7 && <ProcessMiningPage />}
          
          {/* Enterprise Pulse Tab */}
          {selectedTab === 8 && (
            <Box sx={{ height: 'calc(100vh - 180px)' }}>
              <EnterprisePulse />
            </Box>
          )}
          
          {/* Vision AI Tab */}
          {selectedTab === 9 && (
            <Box sx={{ height: 'calc(100vh - 180px)' }}>
              <VisionAIDashboard onBack={() => setSelectedTab(0)} />
            </Box>
          )}

          {/* AI Persona Tab */}
          {selectedTab === 12 && (
            <Box sx={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}>
              <UserProfileManager />
            </Box>
          )}

        </Container>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Table Details Dialog */}
      <Dialog
        open={tableDetailsOpen}
        onClose={() => setTableDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedTable && (
          <>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 3,
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {selectedTable.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedTable.database} • {selectedTable.schema}
                </Typography>
              </Box>
              <IconButton onClick={() => setTableDetailsOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ p: 3 }}>
              {/* Overview */}
              <Typography variant="h6" gutterBottom>Overview</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    {selectedTable.description}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Total Rows</Typography>
                  <Typography variant="body1">{selectedTable.rows && selectedTable.rows.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Storage Size</Typography>
                  <Typography variant="body1">{selectedTable.size}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Storage Type</Typography>
                  <Typography variant="body1">{selectedTable.stats && selectedTable.stats.storageType}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Compression</Typography>
                  <Typography variant="body1">{selectedTable.stats && selectedTable.stats.compression}</Typography>
                </Grid>
              </Grid>

              {/* Columns */}
              <Typography variant="h6" gutterBottom>Columns ({selectedTable.columns && selectedTable.columns.length})</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Column Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Nullable</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTable.columns && selectedTable.columns.map((col, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{col.name}</TableCell>
                        <TableCell>
                          <Chip size="small" label={col.type} variant="outlined" />
                        </TableCell>
                        <TableCell>{col.nullable ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{col.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Relationships */}
              <Typography variant="h6" gutterBottom>Relationships</Typography>
              <Box sx={{ mb: 3 }}>
                {selectedTable.relationships && selectedTable.relationships.map((rel, idx) => (
                  <Chip 
                    key={idx}
                    label={`${rel.column} → ${rel.references}`}
                    variant="outlined"
                    icon={<CableIcon />}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>

              {/* Indexes */}
              <Typography variant="h6" gutterBottom>Indexes</Typography>
              <Box sx={{ mb: 3 }}>
                {selectedTable.indexes && selectedTable.indexes.map((idx, i) => (
                  <Box key={i} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{idx.name}</strong> ({idx.type}) - Columns: {idx.columns.join(', ')}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Partitioning */}
              {selectedTable.partitioning && (
                <>
                  <Typography variant="h6" gutterBottom>Partitioning</Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      Type: {selectedTable.partitioning.type} on {selectedTable.partitioning.column} ({selectedTable.partitioning.interval})
                    </Typography>
                  </Box>
                </>
              )}

              {/* Sample Query */}
              <Typography variant="h6" gutterBottom>Sample Query</Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'grey.900', 
                color: 'white',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}>
                <pre style={{ margin: 0 }}>
{`SELECT 
    snapshot_date,
    sku,
    warehouse_id,
    quantity_on_hand,
    quantity_available
FROM ${selectedTable.schema}.${selectedTable.name}
WHERE snapshot_date = CURRENT_DATE()
    AND quantity_available < 10
ORDER BY quantity_available ASC
LIMIT 100;`}
                </pre>
              </Box>
            </Box>
          </>
        )}
      </Dialog>
    </Box>
    </ThemeProvider>
  );
}

// Import auth config
import authConfig from './auth_config.json';

// Authentication wrapper component
function AuthenticatedApp() {
  const { isSignedIn, isLoaded, user } = useUser();
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  // If Clerk is not configured, show the app without authentication
  if (!clerkPubKey) {
    console.warn('Clerk authentication not configured');
    return <App />;
  }

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not signed in, show enhanced login screen
  if (!isSignedIn) {
    return (
      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        bgcolor: '#fafbfc',
        fontFamily: 'Poppins, sans-serif',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}>
        {/* Import Poppins font */}
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
        
        {/* Background decoration */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}>
          <Box sx={{
            position: 'absolute',
            top: '-50%',
            right: '-25%',
            width: '80%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(25, 118, 210, 0.03) 0%, transparent 60%)',
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: '-50%',
            left: '-25%',
            width: '80%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(25, 118, 210, 0.02) 0%, transparent 60%)',
          }} />
        </Box>
        {/* Login Form */}
        <Paper sx={{ 
          p: { xs: 3, sm: 4, md: 5 },
          maxWidth: 420,
          width: '90%',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
          background: 'white',
          position: 'relative',
          zIndex: 1,
          border: '1px solid rgba(0, 0, 0, 0.04)',
          animation: 'fadeInUp 0.6s ease-out',
        }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <img 
              src="/mantra9.png" 
              alt="Cloud Mantra" 
              style={{ height: 60, objectFit: 'contain' }}
            />
          </Box>
            
          <Typography sx={{ 
            fontSize: { xs: '1.1rem', sm: '1.5rem' },
            fontWeight: 600, 
            mb: 1.5, 
            textAlign: 'center',
            color: '#0f172a',
            fontFamily: 'Poppins, sans-serif',
            letterSpacing: '-0.5px',
            whiteSpace: 'nowrap',
          }}>
            Decision Intelligence Platform
          </Typography>
          <Typography sx={{ 
            fontSize: '0.875rem',
            mb: 4, 
            textAlign: 'center', 
            color: '#64748b',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 400,
          }}>
            Transform enterprise data into actionable insights
          </Typography>
            
          {/* Auth Button */}
          <Box sx={{ mb: 4 }}>
            <AuthButton />
          </Box>
          
          <Divider sx={{ my: 4 }}>
            <Typography sx={{ 
              fontSize: '0.75rem',
              color: '#94a3b8',
              fontFamily: 'Poppins, sans-serif',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              Secure Authentication
            </Typography>
          </Divider>
          
          {/* Security Features */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center', 
              gap: 3,
              mb: 3,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon sx={{ fontSize: 16, color: '#64748b' }} />
                <Typography sx={{ 
                  fontSize: '0.8rem',
                  color: '#64748b',
                  fontFamily: 'Poppins, sans-serif',
                }}>
                  256-bit SSL
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#64748b' }} />
                <Typography sx={{ 
                  fontSize: '0.8rem',
                  color: '#64748b',
                  fontFamily: 'Poppins, sans-serif',
                }}>
                  SSO Enabled
                </Typography>
              </Box>
            </Box>
            
            <Typography sx={{ 
              fontSize: '0.75rem',
              color: '#94a3b8',
              fontFamily: 'Poppins, sans-serif',
              textAlign: 'center',
              mt: 4,
            }}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Typography>
            
            <Typography sx={{ 
              fontSize: '0.7rem',
              color: '#cbd5e1',
              fontFamily: 'Poppins, sans-serif',
              textAlign: 'center',
              mt: 2,
            }}>
              © 2024 Cloud Mantra, Inc. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Check email authorization
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  if (userEmail) {
    const { authorized_emails, authorized_domains } = authConfig.authentication.access_control;
    
    // Check if email is in whitelist
    const isEmailAuthorized = authorized_emails.includes(userEmail);
    
    // Check if domain is authorized
    const userDomain = userEmail.split('@')[1];
    const isDomainAuthorized = authorized_domains.includes(userDomain);
    
    if (!isEmailAuthorized && !isDomainAuthorized) {
      // User is signed in but not authorized
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
            <Typography variant="h4" gutterBottom color="error">
              Access Denied
            </Typography>
            <Typography variant="body1" paragraph>
              Your email address ({userEmail}) is not authorized to access this application.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please contact your administrator to request access.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Authorized domains: {authorized_domains.join(', ')}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <AuthButton />
            </Box>
          </Paper>
        </Box>
      );
    }
  }

  // User is authenticated and authorized, show the main app
  return <App />;
}

// Export the wrapped component
function AppWithAuth() {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPubKey) {
    // No Clerk key, just show the app
    return <App />;
  }
  
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthenticatedApp />
    </ClerkProvider>
  );
}

export default AppWithAuth;