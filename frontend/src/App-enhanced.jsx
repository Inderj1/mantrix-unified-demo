import React, { useState, useEffect } from 'react';
import { ClerkProvider, useUser } from '@clerk/clerk-react';
import AuthButton from './components/AuthButton';
import { usePersistedState } from './hooks/usePersistedState';
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
import MargenAILanding from './components/MargenAILanding';
import ReveqAILanding from './components/ReveqAILanding';
import AssetTracking from './components/reveqai/AssetTracking';
import RevenueAnalytics from './components/reveqai/RevenueAnalytics';
import UtilizationMetrics from './components/reveqai/UtilizationMetrics';
import ReveqPerformanceDashboard from './components/reveqai/PerformanceDashboard';
import ReveqMaintenanceScheduler from './components/reveqai/MaintenanceScheduler';
import EfficiencyOptimizer from './components/reveqai/EfficiencyOptimizer';
import FinancialWorkbench from './components/reveqai/FinancialWorkbench';
import MargenAITable from './components/margenai/MargenAITable';
import SegmentAnalytics from './components/margenai/SegmentAnalytics';
import RevenueSalesAnalytics from './components/margenai/RevenueSalesAnalytics';
import CostOperationsManagement from './components/margenai/CostOperationsManagement';
import RevenueGrowthAnalytics from './components/margenai/RevenueGrowthAnalytics';
import CostCOGSAnalytics from './components/margenai/CostCOGSAnalytics';
import MarginProfitabilityAnalytics from './components/margenai/MarginProfitabilityAnalytics';
import PLGLExplorerAnalytics from './components/margenai/PLGLExplorerAnalytics';
import FinancialDriversAnalytics from './components/margenai/FinancialDriversAnalytics';
import AskMargen from './components/AskMargen';
import AxisAIDashboard from './components/AxisAIDashboard';
import DocumentIntelligenceLanding from './components/DocumentIntelligenceLanding';
import ProcessMiningPage from './pages/ProcessMiningPage';
import ScenarioAIDashboard from './components/ScenarioAIDashboard';
import ForecastAIDashboard from './components/ForecastAIDashboard';
import ResultsTable from './components/ResultsTable';
import EnterprisePulse from './components/EnterprisePulse';
// import StoxShiftAI from './components/StoxShiftAI'; // File doesn't exist
import StoxAILanding from './components/StoxAILanding';
import ShortageDetector from './components/stox/ShortageDetector';
import InventoryHeatmap from './components/stox/InventoryHeatmap';
import ReallocationOptimizer from './components/stox/ReallocationOptimizer';
import InboundRiskMonitor from './components/stox/InboundRiskMonitor';
import AgingStockIntelligence from './components/stox/AgingStockIntelligence';
import DemandWorkbench from './components/stox/DemandWorkbench.jsx';
import SellThroughAnalytics from './components/stox/SellThroughAnalytics.jsx';
import SellInForecast from './components/stox/SellInForecast.jsx';
import SKUAggregation from './components/stox/SKUAggregation.jsx';
import BOMExplorer from './components/stox/BOMExplorer.jsx';
import ComponentConsolidation from './components/stox/ComponentConsolidation.jsx';
import StoreDeployment from './components/stox/StoreDeployment.jsx';
import ExecutiveCommandCenter from './components/stox/ExecutiveCommandCenter.jsx';
import ScenarioPlanner from './components/stox/ScenarioPlanner.jsx';
import Tile0ForecastSimulation from './components/stox/Tile0ForecastSimulation.jsx';
import StoreForecast from './components/stox/StoreForecast.jsx';
import StoreHealthMonitor from './components/stox/StoreHealthMonitor.jsx';
import StoreOptimization from './components/stox/StoreOptimization.jsx';
import StoreReplenishment from './components/stox/StoreReplenishment.jsx';
import StoreFinancialImpact from './components/stox/StoreFinancialImpact.jsx';
import SupplyChainMap from './components/stox/supplyChainMap/index.jsx';
import DemandIntelligence from './components/stox/DemandIntelligence.jsx';
import ForecastingEngine from './components/stox/ForecastingEngine.jsx';
import SAPDataHub from './components/stox/SAPDataHub.jsx';
import PlantInventoryIntelligence from './components/stox/PlantInventoryIntelligence.jsx';
import InventoryHealthCheck from './components/stox/InventoryHealthCheck.jsx';
import SupplyLeadTime from './components/stox/SupplyLeadTime.jsx';
import DCDemandAggregation from './components/stox/DCDemandAggregation.jsx';
import DCHealthMonitor from './components/stox/DCHealthMonitor.jsx';
import DCOptimization from './components/stox/DCOptimization.jsx';
import DCBOM from './components/stox/DCBOM.jsx';
import DCLotSize from './components/stox/DCLotSize.jsx';
import DCSupplierExecution from './components/stox/DCSupplierExecution.jsx';
import DCFinancialImpact from './components/stox/DCFinancialImpact.jsx';
import ModuleTilesView from './components/stox/ModuleTilesView.jsx';
import FioriTileDetail from './components/stox/FioriTileDetail.jsx';
import TicketingSystem from './components/stox/TicketingSystem.jsx';
import GlobalSearch from './components/GlobalSearch';
import DocumentVisionIntelligence from './components/DocumentVisionIntelligence';
import EmailIntelligence from './components/EmailIntelligence';
import CommsConfig from './components/CommsConfig';
import RouteAI from './components/RouteAI';
import RouteAILanding from './components/RouteAILanding';
import FleetManagement from './components/routeai/FleetManagement';
import RouteOptimization from './components/routeai/RouteOptimization';
import DeliveryTracking from './components/routeai/DeliveryTracking';
import PerformanceAnalytics from './components/routeai/PerformanceAnalytics';
import FuelManagement from './components/routeai/FuelManagement';
import MaintenanceScheduler from './components/routeai/MaintenanceScheduler';
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
  const [selectedTab, setSelectedTab] = usePersistedState('mantrix-selectedTab', 0);
  const [drawerOpen, setDrawerOpen] = usePersistedState('mantrix-drawerOpen', false);
  const [coreAIView, setCoreAIView] = useState('landing'); // 'landing', 'margen', 'stox', 'route', 'reveq'
  const [stoxView, setStoxView] = usePersistedState('mantrix-stoxView', 'landing'); // 'landing', 'stoxshift'
  const [margenView, setMargenView] = usePersistedState('mantrix-margenView', 'landing'); // 'landing', 'revenue-sales', 'cost-operations', etc.
  const [routeView, setRouteView] = usePersistedState('mantrix-routeView', 'landing'); // 'landing', module IDs
  const [reveqView, setReveqView] = usePersistedState('mantrix-reveqView', 'landing'); // 'landing', module IDs
  const [currentFioriTile, setCurrentFioriTile] = useState(null); // { tileId, title, moduleId, moduleColor }
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
      // Check if this is a STOX.AI navigation
      if (action.view === 'stox' || action.view === 'margen' || ['demand-workbench', 'demand-flow', 'demand-forecasting', 'outbound-replenishment', 'dc-inventory', 'supply-planning', 'bom-explosion', 'component-consolidation', 'analytics-whatif', 'store-forecasting', 'store-health-monitor', 'store-optimization', 'store-replenishment', 'store-financial-impact', 'dc-demand-aggregation', 'dc-health-monitor', 'dc-optimization', 'dc-bom', 'dc-lot-size', 'dc-supplier-exec', 'dc-financial-impact'].includes(action.view)) {
        // First set CORE.AI view to STOX
        setCoreAIView('stox');

        // Then navigate to the specific STOX module
        if (action.view !== 'stox') {
          setStoxView(action.view);
        }
      } else {
        setCoreAIView(action.view);
      }

      // Handle STOXSHIFT.AI specific navigation
      if (action.stoxshiftTile) {
        // This would require passing props to StoxShiftAI to auto-select tile/tab
        // For now, we'll just navigate to the page
        console.log('Navigate to STOXSHIFT tile:', action.stoxshiftTile, 'tab:', action.stoxshiftTab);
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: (selectedTab === 1 && coreAIView === 'stox' && stoxView === 'supply-chain-map') ? 'white' : 'background.default' }}>
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
            {/* Global Search */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              <GlobalSearch onNavigate={handleSearchNavigation} />
            </Box>
            
            {/* Authentication Button */}
            <Box sx={{ ml: 2 }}>
              <AuthButton />
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{
          mt: (selectedTab === 1 && coreAIView === 'stox' && stoxView === 'supply-chain-map') ? 0 : 3,
          mb: (selectedTab === 1 && coreAIView === 'stox' && stoxView === 'supply-chain-map') ? 0 : 3,
          flexGrow: 1,
          overflow: 'hidden',
          width: '100%',
          px: (selectedTab === 1 && coreAIView === 'stox' && stoxView === 'supply-chain-map') ? 0 : { xs: 2, sm: 3 }
        }}>
          {/* Unified Chat Interface */}
          {selectedTab === 0 && (
            <Box sx={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <SimpleChatInterface />
            </Box>
          )}

          {/* CORE.AI Tab - Operational AI */}
          {selectedTab === 1 && (
            <Box sx={{
              height: (coreAIView === 'stox' && stoxView === 'supply-chain-map') ? 'calc(100vh - 64px)' : 'calc(100vh - 180px)',
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
                    } else if (moduleId === 'route') {
                      setCoreAIView('route');
                      setRouteView('landing');
                    } else if (moduleId === 'reveq') {
                      setCoreAIView('reveq');
                      setReveqView('landing');
                    }
                  }} />
                </Box>
              </Fade>
              <Fade in={coreAIView === 'margen'} timeout={300}>
                <Box sx={{ display: coreAIView === 'margen' ? 'block' : 'none', height: '100%', overflow: 'auto' }}>
                  {margenView === 'landing' && (
                    <MargenAILanding
                      onBack={() => setCoreAIView('landing')}
                      onTileClick={(moduleId) => {
                        console.log('MargenAI tile clicked:', moduleId);
                        setMargenView(moduleId);
                      }}
                    />
                  )}
                  {margenView === 'revenue-growth' && (
                    <RevenueGrowthAnalytics onBack={() => setMargenView('landing')} />
                  )}
                  {margenView === 'cost-cogs' && (
                    <CostCOGSAnalytics onBack={() => setMargenView('landing')} />
                  )}
                  {margenView === 'margin-profitability' && (
                    <MarginProfitabilityAnalytics onBack={() => setMargenView('landing')} />
                  )}
                  {margenView === 'pl-gl-explorer' && (
                    <PLGLExplorerAnalytics onBack={() => setMargenView('landing')} />
                  )}
                  {margenView === 'drivers-whatif' && (
                    <FinancialDriversAnalytics onBack={() => setMargenView('landing')} />
                  )}
                  {margenView === 'ask-margen' && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <AskMargen onBack={() => setMargenView('landing')} />
                    </Box>
                  )}
                </Box>
              </Fade>
              <Fade in={coreAIView === 'stox'} timeout={300}>
                <Box sx={{
                  display: coreAIView === 'stox' ? 'block' : 'none',
                  height: '100%',
                  overflow: 'auto',
                  width: '100%'
                }}>
                  {(stoxView === 'landing' || stoxView === 'store-modules' || stoxView === 'dc-modules') && (
                    <StoxAILanding
                      onBack={() => {
                        if (stoxView === 'store-modules' || stoxView === 'dc-modules') {
                          setStoxView('landing');
                        } else {
                          setCoreAIView('landing');
                        }
                      }}
                      onCategorySelect={(category) => {
                        if (category === 'store') {
                          setStoxView('store-modules');
                        } else if (category === 'dc') {
                          setStoxView('dc-modules');
                        }
                      }}
                      initialView={stoxView === 'store-modules' ? 'store' : stoxView === 'dc-modules' ? 'dc' : null}
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
                        } else if (moduleId === 'sop-planning' || moduleId === 'demand-workbench') {
                          console.log('Setting stoxView to: demand-workbench');
                          setStoxView('demand-workbench');
                        } else if (moduleId === 'sell-through-analytics') {
                          console.log('Setting stoxView to: sell-through-analytics');
                          setStoxView('sell-through-analytics');
                        } else if (moduleId === 'sell-in-forecast') {
                          console.log('Setting stoxView to: sell-in-forecast');
                          setStoxView('sell-in-forecast');
                        } else if (moduleId === 'sku-aggregation') {
                          console.log('Setting stoxView to: sku-aggregation');
                          setStoxView('sku-aggregation');
                        } else if (moduleId === 'bom-explorer') {
                          console.log('Setting stoxView to: bom-explorer');
                          setStoxView('bom-explorer');
                        } else if (moduleId === 'store-deployment') {
                          console.log('Setting stoxView to: store-deployment');
                          setStoxView('store-deployment');
                        } else if (moduleId === 'executive-command') {
                          console.log('Setting stoxView to: executive-command');
                          setStoxView('executive-command');
                        } else if (['demand-flow', 'demand-forecasting', 'outbound-replenishment', 'dc-inventory', 'supply-planning', 'bom-explosion', 'component-consolidation', 'analytics-whatif', 'tile0-forecast-simulation', 'store-forecasting', 'store-health-monitor', 'store-optimization', 'store-replenishment', 'store-financial-impact', 'supply-chain-map', 'dc-demand-aggregation', 'dc-health-monitor', 'dc-optimization', 'dc-bom', 'dc-lot-size', 'dc-supplier-exec', 'dc-financial-impact', 'demand-intelligence', 'forecasting-engine', 'sap-data-hub', 'plant-inventory-intelligence', 'inventory-health-check', 'supply-lead-time'].includes(moduleId)) {
                          console.log('Setting stoxView to module tiles:', moduleId);
                          setStoxView(moduleId);
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
                  {stoxView === 'demand-workbench' && (
                    <DemandWorkbench onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'sell-through-analytics' && (
                    <SellThroughAnalytics onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'sell-in-forecast' && (
                    <SellInForecast onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'sku-aggregation' && (
                    <SKUAggregation onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'bom-explorer' && (
                    <BOMExplorer onBack={() => setStoxView('landing')} />
                  )}
                  {/* component-consolidation now uses ModuleTilesView */}
                  {stoxView === 'store-deployment' && (
                    <StoreDeployment onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'executive-command' && (
                    <ExecutiveCommandCenter onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'scenario-planner' && (
                    <ScenarioPlanner onBack={() => setStoxView('landing')} />
                  )}
                  {/* New Store System Modules */}
                  {stoxView === 'tile0-forecast-simulation' && (
                    <Tile0ForecastSimulation onBack={() => setStoxView('store-modules')} />
                  )}
                  {stoxView === 'store-forecasting' && (
                    <StoreForecast onBack={() => setStoxView('store-modules')} />
                  )}
                  {stoxView === 'store-health-monitor' && (
                    <StoreHealthMonitor onBack={() => setStoxView('store-modules')} />
                  )}
                  {stoxView === 'store-optimization' && (
                    <StoreOptimization onBack={() => setStoxView('store-modules')} />
                  )}
                  {stoxView === 'store-replenishment' && (
                    <StoreReplenishment onBack={() => setStoxView('store-modules')} />
                  )}
                  {stoxView === 'store-financial-impact' && (
                    <StoreFinancialImpact onBack={() => setStoxView('store-modules')} />
                  )}
                  {stoxView === 'supply-chain-map' && (
                    <SupplyChainMap onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'demand-intelligence' && (
                    <DemandIntelligence onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'forecasting-engine' && (
                    <ForecastingEngine onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'sap-data-hub' && (
                    <SAPDataHub onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'plant-inventory-intelligence' && (
                    <PlantInventoryIntelligence onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'inventory-health-check' && (
                    <InventoryHealthCheck onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'supply-lead-time' && (
                    <SupplyLeadTime onBack={() => setStoxView('landing')} />
                  )}
                  {/* DC System Modules */}
                  {stoxView === 'dc-demand-aggregation' && (
                    <DCDemandAggregation onBack={() => setStoxView('dc-modules')} />
                  )}
                  {stoxView === 'dc-health-monitor' && (
                    <DCHealthMonitor onBack={() => setStoxView('dc-modules')} />
                  )}
                  {stoxView === 'dc-optimization' && (
                    <DCOptimization onBack={() => setStoxView('dc-modules')} />
                  )}
                  {stoxView === 'dc-bom' && (
                    <DCBOM onBack={() => setStoxView('dc-modules')} />
                  )}
                  {stoxView === 'dc-lot-size' && (
                    <DCLotSize onBack={() => setStoxView('dc-modules')} />
                  )}
                  {stoxView === 'dc-supplier-exec' && (
                    <DCSupplierExecution onBack={() => setStoxView('dc-modules')} />
                  )}
                  {stoxView === 'dc-financial-impact' && (
                    <DCFinancialImpact onBack={() => setStoxView('dc-modules')} />
                  )}
                  {/* PRD Module Tiles Views */}
                  {['demand-flow', 'demand-forecasting', 'outbound-replenishment', 'dc-inventory', 'supply-planning', 'bom-explosion', 'component-consolidation', 'analytics-whatif'].includes(stoxView) && !currentFioriTile && (
                    <ModuleTilesView
                      moduleId={stoxView}
                      onBack={(target) => {
                        if (target === 'stox') {
                          setStoxView('landing');
                        } else if (target === 'core') {
                          setCoreAIView('landing');
                        }
                      }}
                      onTileClick={(tileId) => {
                        console.log('Fiori tile clicked:', tileId);
                        // Get module data to pass to detail view
                        const moduleColors = {
                          'demand-flow': '#06b6d4',
                          'demand-forecasting': '#10b981',
                          'outbound-replenishment': '#3b82f6',
                          'dc-inventory': '#f59e0b',
                          'supply-planning': '#8b5cf6',
                          'bom-explosion': '#ec4899',
                          'component-consolidation': '#ef4444',
                          'analytics-whatif': '#607D8B',
                        };
                        setCurrentFioriTile({
                          tileId,
                          moduleId: stoxView,
                          moduleColor: moduleColors[stoxView] || '#3b82f6',
                        });
                      }}
                    />
                  )}
                  {/* Fiori Tile Detail View */}
                  {currentFioriTile && (
                    <FioriTileDetail
                      tileId={currentFioriTile.tileId}
                      tileTitle={currentFioriTile.tileId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      moduleColor={currentFioriTile.moduleColor}
                      onBack={(target) => {
                        if (target === 'module') {
                          setCurrentFioriTile(null);
                        } else if (target === 'stox') {
                          setCurrentFioriTile(null);
                          setStoxView('landing');
                        } else if (target === 'core') {
                          setCurrentFioriTile(null);
                          setStoxView('landing');
                          setCoreAIView('landing');
                        }
                      }}
                    />
                  )}
                </Box>
              </Fade>
              <Fade in={coreAIView === 'route'} timeout={300}>
                <Box sx={{ display: coreAIView === 'route' ? 'block' : 'none', height: '100%', overflow: 'auto' }}>
                  {routeView === 'landing' && (
                    <RouteAILanding
                      onBack={() => setCoreAIView('landing')}
                      onTileClick={(moduleId) => {
                        console.log('RouteAI tile clicked:', moduleId);
                        setRouteView(moduleId);
                      }}
                    />
                  )}
                  {routeView === 'fleet-management' && (
                    <FleetManagement onBack={() => setRouteView('landing')} />
                  )}
                  {routeView === 'route-optimization' && (
                    <RouteOptimization onBack={() => setRouteView('landing')} />
                  )}
                  {routeView === 'delivery-tracking' && (
                    <DeliveryTracking onBack={() => setRouteView('landing')} />
                  )}
                  {routeView === 'performance-analytics' && (
                    <PerformanceAnalytics onBack={() => setRouteView('landing')} />
                  )}
                  {routeView === 'fuel-management' && (
                    <FuelManagement onBack={() => setRouteView('landing')} />
                  )}
                  {routeView === 'maintenance-scheduler' && (
                    <MaintenanceScheduler onBack={() => setRouteView('landing')} />
                  )}
                  {!['landing', 'fleet-management', 'route-optimization', 'delivery-tracking', 'performance-analytics', 'fuel-management', 'maintenance-scheduler'].includes(routeView) && (
                    <RouteAI onBack={() => setRouteView('landing')} />
                  )}
                </Box>
              </Fade>
              <Fade in={coreAIView === 'reveq'} timeout={300}>
                <Box sx={{ display: coreAIView === 'reveq' ? 'block' : 'none', height: '100%', overflow: 'auto' }}>
                  {reveqView === 'landing' && (
                    <ReveqAILanding
                      onBack={() => setCoreAIView('landing')}
                      onTileClick={(moduleId) => {
                        setReveqView(moduleId);
                      }}
                    />
                  )}
                  {reveqView === 'asset-tracking' && (
                    <AssetTracking onBack={() => setReveqView('landing')} />
                  )}
                  {reveqView === 'revenue-analytics' && (
                    <RevenueAnalytics onBack={() => setReveqView('landing')} />
                  )}
                  {reveqView === 'utilization-metrics' && (
                    <UtilizationMetrics onBack={() => setReveqView('landing')} />
                  )}
                  {reveqView === 'performance-dashboard' && (
                    <ReveqPerformanceDashboard onBack={() => setReveqView('landing')} />
                  )}
                  {reveqView === 'maintenance-scheduler' && (
                    <ReveqMaintenanceScheduler onBack={() => setReveqView('landing')} />
                  )}
                  {reveqView === 'efficiency-optimizer' && (
                    <EfficiencyOptimizer onBack={() => setReveqView('landing')} />
                  )}
                  {reveqView === 'financial-workbench' && (
                    <FinancialWorkbench onBack={() => setReveqView('landing')} />
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
          {selectedTab === 4 && <ControlCenter apiHealth={apiHealth} onRefreshStatus={checkApiHealth} />}

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
          {selectedTab === 6 && <DocumentIntelligenceLanding />}

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
            <Box sx={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}>
              <DocumentVisionIntelligence onNavigateToConfig={() => setSelectedTab(4)} />
            </Box>
          )}

          {/* COMMAND TOWER Tab */}
          {selectedTab === 10 && (
            <Box sx={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}>
              <TicketingSystem onBack={() => setSelectedTab(1)} />
            </Box>
          )}

          {/* EMAIL INTEL Tab */}
          {selectedTab === 13 && (
            <Box sx={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}>
              <EmailIntelligence onNavigateToConfig={() => setSelectedTab(4)} />
            </Box>
          )}

          {/* ROUTE.AI Tab */}
          {selectedTab === 15 && (
            <Box sx={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}>
              <RouteAI />
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