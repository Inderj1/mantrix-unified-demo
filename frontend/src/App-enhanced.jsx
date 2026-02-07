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
// TODO: Restore reveqai components
// import AssetTracking from './components/reveqai/AssetTracking';
// import RevenueAnalytics from './components/reveqai/RevenueAnalytics';
// import UtilizationMetrics from './components/reveqai/UtilizationMetrics';
// import ReveqPerformanceDashboard from './components/reveqai/PerformanceDashboard';
// import ReveqMaintenanceScheduler from './components/reveqai/MaintenanceScheduler';
// import EfficiencyOptimizer from './components/reveqai/EfficiencyOptimizer';
// import FinancialWorkbench from './components/reveqai/FinancialWorkbench';
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
import StoxRetailLanding from './components/StoxRetailLanding';
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
import InventoryDashboard from './components/stox/InventoryDashboard.jsx';
import WorkingCapitalBaseline from './components/stox/WorkingCapitalBaseline.jsx';
import CommandCenter from './components/stox/CommandCenter.jsx';
import SupplyLeadTime from './components/stox/SupplyLeadTime.jsx';
import CostPolicyEngine from './components/stox/CostPolicyEngine.jsx';
import CostConfiguration from './components/stox/CostConfiguration.jsx';
import CFORollupDashboard from './components/stox/CFORollupDashboard.jsx';
import CashReleaseTimeline from './components/stox/CashReleaseTimeline.jsx';
import SupplierTermsImpact from './components/stox/SupplierTermsImpact.jsx';
import MRPParameterOptimizer from './components/stox/MRPParameterOptimizer.jsx';
import MRPParameterTuner from './components/stox/MRPParameterTuner.jsx';
import MRPOptimizerDashboard from './components/stox/MRPOptimizerDashboard.jsx';
import WhatIfSimulator from './components/stox/WhatIfSimulator.jsx';
import RecommendationsHub from './components/stox/RecommendationsHub.jsx';
import SAPWriteback from './components/stox/SAPWriteback.jsx';
import PerformanceMonitor from './components/stox/PerformanceMonitor.jsx';
import DCDemandAggregation from './components/stox/DCDemandAggregation.jsx';
import DCHealthMonitor from './components/stox/DCHealthMonitor.jsx';
import DCOptimization from './components/stox/DCOptimization.jsx';
import DCBOM from './components/stox/DCBOM.jsx';
import DCLotSize from './components/stox/DCLotSize.jsx';
import DCSupplierExecution from './components/stox/DCSupplierExecution.jsx';
import DCFinancialImpact from './components/stox/DCFinancialImpact.jsx';
import DistributionDashboard from './components/stox/distribution/DistributionDashboard';
import { default as DistInventoryHealthCheck } from './components/stox/distribution/InventoryHealthCheck';
import DemandVariabilityIntelligence from './components/stox/distribution/DemandVariabilityIntelligence';
import SupplySignalAnalyzer from './components/stox/distribution/SupplySignalAnalyzer';
import MRPParameterAdvisor from './components/stox/distribution/MRPParameterAdvisor';
import { default as DistWhatIfSimulator } from './components/stox/distribution/WhatIfSimulator';
import StoxLamResearchLanding from './components/StoxLamResearchLanding';
import LamEconomicGroundTruth from './components/stox/lamresearch/LamEconomicGroundTruth';
import LamInventoryCapitalHealth from './components/stox/lamresearch/LamInventoryCapitalHealth';
import LamDemandSupplyCommand from './components/stox/lamresearch/LamDemandSupplyCommand';
import LamSupplyRisk from './components/stox/lamresearch/LamSupplyRisk';
import LamSafetyStockEconomics from './components/stox/lamresearch/LamSafetyStockEconomics';
import LamMRPSignalQuality from './components/stox/lamresearch/LamMRPSignalQuality';
import LamCapitalImpactSimulator from './components/stox/lamresearch/LamCapitalImpactSimulator';
import ModuleTilesView from './components/stox/ModuleTilesView.jsx';
import FioriTileDetail from './components/stox/FioriTileDetail.jsx';
import TicketingSystem from './components/stox/TicketingSystem.jsx';
import GlobalSearch from './components/GlobalSearch';
import DocumentVisionIntelligence from './components/DocumentVisionIntelligence';
import EmailIntelligence from './components/EmailIntelligence';
import CommsConfig from './components/CommsConfig';
import RouteAI from './components/RouteAI';
import RouteAILanding from './components/RouteAILanding';
import OrdlyAILanding from './components/OrdlyAILanding';
import CustomerIntentCockpit from './components/ordlyai/CustomerIntentCockpit';
import SkuDecisioning from './components/ordlyai/SkuDecisioning';
import LeadTimeRecommendation from './components/ordlyai/LeadTimeRecommendation';
import OrderValueControlTower from './components/ordlyai/OrderValueControlTower';
import SalesOrderPipeline from './components/ordlyai/SalesOrderPipeline';
import SkuBomOptimizer from './components/ordlyai/SkuBomOptimizer';
import SapCommitTrace from './components/ordlyai/SapCommitTrace';
import LearningLoop from './components/ordlyai/LearningLoop';
import DemandSignal from './components/ordlyai/DemandSignal';
import NetworkOptimizer from './components/ordlyai/NetworkOptimizer';
import Arbitration from './components/ordlyai/Arbitration';
import SapCommit from './components/ordlyai/SapCommit';
import O2CAILanding from './components/O2CAILanding';
import FleetManagement from './components/routeai/FleetManagement';
import RouteOptimization from './components/routeai/RouteOptimization';
import DeliveryTracking from './components/routeai/DeliveryTracking';
import PerformanceAnalytics from './components/routeai/PerformanceAnalytics';
import FuelManagement from './components/routeai/FuelManagement';
import MaintenanceScheduler from './components/routeai/MaintenanceScheduler';
import TraxxAILanding from './components/TraxxAILanding';
import MasterDataLanding from './components/masterdata/MasterDataLanding';
import MantrixAPLanding from './components/mantrixap/MantrixAPLanding';
import InvoiceEntry from './components/mantrixap/InvoiceEntry';
import SmartWorkQueue from './components/mantrixap/SmartWorkQueue';
import ExceptionReview from './components/mantrixap/ExceptionReview';
import PostingReview from './components/mantrixap/PostingReview';
import MyStatusTracker from './components/mantrixap/MyStatusTracker';
import KitControlTower from './components/traxxai/KitControlTower';
import WhoMustActNow from './components/traxxai/WhoMustActNow';
import LogisticsEconomics from './components/traxxai/LogisticsEconomics';
import RealizedMarginCash from './components/traxxai/RealizedMarginCash';
import SurgeryReadiness from './components/traxxai/SurgeryReadiness';
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
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  AutoGraph as AutoGraphIcon,
  Inventory as InventoryIcon,
  SmartToy as SmartToyIcon,
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
  const [darkMode, setDarkMode] = usePersistedState('mantrix-darkMode', false);
  const [coreAIView, setCoreAIView] = useState('landing'); // 'landing', 'margen', 'stox', 'route', 'reveq'
  const [stoxView, setStoxView] = usePersistedState('mantrix-stoxView', 'landing'); // 'landing', 'stoxshift'
  const [margenView, setMargenView] = usePersistedState('mantrix-margenView', 'landing'); // 'landing', 'revenue-sales', 'cost-operations', etc.
  const [routeView, setRouteView] = usePersistedState('mantrix-routeView', 'landing'); // 'landing', module IDs
  const [reveqView, setReveqView] = usePersistedState('mantrix-reveqView', 'landing'); // 'landing', module IDs
  const [ordlyView, setOrdlyView] = usePersistedState('mantrix-ordlyView', 'landing'); // 'landing', module IDs
  const [o2cView, setO2cView] = usePersistedState('mantrix-o2cView', 'landing'); // 'landing', module IDs
  const [traxxView, setTraxxView] = usePersistedState('mantrix-traxxView', 'landing'); // 'landing', 'nexxt-smade', 'nexxt-operations'
  const [apView, setApView] = usePersistedState('mantrix-apView', 'landing'); // 'landing', 'invoice-entry', 'work-queue', 'exception-review', 'posting-review', 'my-status'
  const [selectedAPInvoice, setSelectedAPInvoice] = useState(null); // cross-tile nav: invoice row to open in InvoiceEntry
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
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/v1/health`);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/v1/schemas`);
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: darkMode ? '#0d1117' : ((selectedTab === 1 && coreAIView === 'stox' && stoxView === 'supply-chain-map') ? 'white' : 'background.default') }}>
      {/* Enhanced Sidebar */}
      <EnhancedSidebar
        darkMode={darkMode}
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
        <AppBar position="static" elevation={0} sx={{
          bgcolor: darkMode ? '#161b22' : 'white',
          color: darkMode ? '#e6edf3' : 'text.primary',
          borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
        }}>
          <Toolbar>
            {/* Global Search */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              <GlobalSearch darkMode={darkMode} onNavigate={handleSearchNavigation} />
            </Box>

            {/* Dark Mode Toggle */}
            <MuiTooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                onClick={() => setDarkMode(!darkMode)}
                sx={{
                  ml: 1,
                  bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                  },
                }}
              >
                {darkMode ? <LightModeIcon sx={{ color: '#f59e0b' }} /> : <DarkModeIcon sx={{ color: '#64748b' }} />}
              </IconButton>
            </MuiTooltip>

            {/* Authentication Button */}
            <Box sx={{ ml: 2 }}>
              <AuthButton onNavigateToProfile={() => setSelectedTab(4)} />
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
              <SimpleChatInterface darkMode={darkMode} />
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
                  <CoreAILanding darkMode={darkMode} onTileClick={(moduleId) => {
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
                    } else if (moduleId === 'process-mining') {
                      setCoreAIView('process-mining');
                    } else if (moduleId === 'ordly') {
                      setCoreAIView('ordly');
                      setOrdlyView('landing');
                    } else if (moduleId === 'o2c') {
                      setCoreAIView('o2c');
                      setO2cView('landing');
                    } else if (moduleId === 'traxx') {
                      setCoreAIView('traxx');
                      setTraxxView('landing');
                    } else if (moduleId === 'masterdata') {
                      setCoreAIView('masterdata');
                    } else if (moduleId === 'mantrixap') {
                      setCoreAIView('mantrixap');
                      setApView('landing');
                    }
                  }} />
                </Box>
              </Fade>
              <Fade in={coreAIView === 'margen'} timeout={300}>
                <Box sx={{ display: coreAIView === 'margen' ? 'block' : 'none', height: '100%', overflow: 'auto' }}>
                  {margenView === 'landing' && (
                    <MargenAILanding
                      darkMode={darkMode}
                      onBack={() => setCoreAIView('landing')}
                      onTileClick={(moduleId) => {
                        console.log('MargenAI tile clicked:', moduleId);
                        setMargenView(moduleId);
                      }}
                    />
                  )}
                  {margenView === 'revenue-growth' && (
                    <RevenueGrowthAnalytics darkMode={darkMode} onBack={() => setMargenView('landing')} />
                  )}
                  {margenView === 'cost-cogs' && (
                    <CostCOGSAnalytics darkMode={darkMode} onBack={() => setMargenView('landing')} />
                  )}
                  {margenView === 'margin-profitability' && (
                    <MarginProfitabilityAnalytics darkMode={darkMode} onBack={() => setMargenView('landing')} />
                  )}
                  {margenView === 'pl-gl-explorer' && (
                    <PLGLExplorerAnalytics darkMode={darkMode} onBack={() => setMargenView('landing')} />
                  )}
                  {margenView === 'drivers-whatif' && (
                    <FinancialDriversAnalytics darkMode={darkMode} onBack={() => setMargenView('landing')} />
                  )}
                  {margenView === 'ask-margen' && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <AskMargen darkMode={darkMode} onBack={() => setMargenView('landing')} />
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
                      darkMode={darkMode}
                      onBack={() => {
                        if (stoxView === 'store-modules' || stoxView === 'dc-modules') {
                          setStoxView('landing');
                        } else {
                          setCoreAIView('landing');
                        }
                      }}
                      onCategorySelect={(category) => {
                        if (category === 'retail') {
                          setStoxView('retail-landing');
                        } else if (category === 'store') {
                          setStoxView('store-modules');
                        } else if (category === 'dc') {
                          setStoxView('dc-modules');
                        } else if (category === 'distribution') {
                          setStoxView('distribution-landing');
                        } else if (category === 'lam-research') {
                          setStoxView('lam-research-landing');
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
                        } else if (['demand-flow', 'demand-forecasting', 'outbound-replenishment', 'dc-inventory', 'supply-planning', 'bom-explosion', 'component-consolidation', 'analytics-whatif', 'tile0-forecast-simulation', 'store-forecasting', 'store-health-monitor', 'store-optimization', 'store-replenishment', 'store-financial-impact', 'supply-chain-map', 'dc-demand-aggregation', 'dc-health-monitor', 'dc-optimization', 'dc-bom', 'dc-lot-size', 'dc-supplier-exec', 'dc-financial-impact', 'demand-intelligence', 'forecasting-engine', 'sap-data-hub', 'plant-inventory-intelligence', 'inventory-health-check', 'inventory-dashboard', 'working-capital-baseline', 'command-center', 'supply-lead-time', 'cost-policy-engine', 'cost-configuration', 'mrp-parameter-optimizer', 'mrp-parameter-tuner', 'mrp-optimizer', 'what-if-simulator', 'recommendations-hub', 'sap-writeback', 'performance-monitor', 'cfo-rollup-dashboard', 'cash-release-timeline', 'supplier-terms-impact'].includes(moduleId)) {
                          console.log('Setting stoxView to module tiles:', moduleId);
                          setStoxView(moduleId);
                        }
                      }}
                    />
                  )}
                  {stoxView === 'retail-landing' && (
                    <StoxRetailLanding
                      darkMode={darkMode}
                      onBack={() => setStoxView('landing')}
                      onTileClick={(moduleId) => {
                        console.log('STOX Retail tile clicked:', moduleId);
                        setStoxView(moduleId);
                      }}
                    />
                  )}
                  {stoxView === 'distribution-landing' && (
                    <DistributionDashboard
                      darkMode={darkMode}
                      onBack={() => setStoxView('landing')}
                      onTileClick={(moduleId) => {
                        console.log('Distribution tile clicked:', moduleId);
                        setStoxView(moduleId);
                      }}
                    />
                  )}
                  {stoxView === 'dist-inventory-health-check' && (
                    <DistInventoryHealthCheck darkMode={darkMode} onBack={() => setStoxView('distribution-landing')} />
                  )}
                  {stoxView === 'dist-demand-variability' && (
                    <DemandVariabilityIntelligence darkMode={darkMode} onBack={() => setStoxView('distribution-landing')} />
                  )}
                  {stoxView === 'dist-supply-signal' && (
                    <SupplySignalAnalyzer darkMode={darkMode} onBack={() => setStoxView('distribution-landing')} />
                  )}
                  {stoxView === 'dist-mrp-parameter' && (
                    <MRPParameterAdvisor darkMode={darkMode} onBack={() => setStoxView('distribution-landing')} />
                  )}
                  {stoxView === 'dist-whatif-simulator' && (
                    <DistWhatIfSimulator darkMode={darkMode} onBack={() => setStoxView('distribution-landing')} />
                  )}
                  {stoxView === 'lam-research-landing' && (
                    <StoxLamResearchLanding darkMode={darkMode}
                      onBack={() => setStoxView('landing')}
                      onTileClick={(tileId) => setStoxView(tileId)} />
                  )}
                  {stoxView === 'lam-economic-ground-truth' && (
                    <LamEconomicGroundTruth darkMode={darkMode}
                      onBack={() => setStoxView('lam-research-landing')} />
                  )}
                  {stoxView === 'lam-inventory-capital-health' && (
                    <LamInventoryCapitalHealth darkMode={darkMode}
                      onBack={() => setStoxView('lam-research-landing')} />
                  )}
                  {stoxView === 'lam-demand-supply-command' && (
                    <LamDemandSupplyCommand darkMode={darkMode}
                      onBack={() => setStoxView('lam-research-landing')} />
                  )}
                  {stoxView === 'lam-supply-risk' && (
                    <LamSupplyRisk darkMode={darkMode}
                      onBack={() => setStoxView('lam-research-landing')} />
                  )}
                  {stoxView === 'lam-safety-stock-economics' && (
                    <LamSafetyStockEconomics darkMode={darkMode}
                      onBack={() => setStoxView('lam-research-landing')} />
                  )}
                  {stoxView === 'lam-mrp-signal-quality' && (
                    <LamMRPSignalQuality darkMode={darkMode}
                      onBack={() => setStoxView('lam-research-landing')} />
                  )}
                  {stoxView === 'lam-capital-impact-simulator' && (
                    <LamCapitalImpactSimulator darkMode={darkMode}
                      onBack={() => setStoxView('lam-research-landing')} />
                  )}
                  {/* {stoxView === 'stoxshift' && (
                    <StoxShiftAI onBack={() => setStoxView('landing')} />
                  )} */}
                  {stoxView === 'shortage-detector' && (
                    <ShortageDetector darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'inventory-heatmap' && (
                    <InventoryHeatmap darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'reallocation-optimizer' && (
                    <ReallocationOptimizer darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'inbound-risk-monitor' && (
                    <InboundRiskMonitor darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'aging-stock-intelligence' && (
                    <AgingStockIntelligence darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'demand-workbench' && (
                    <DemandWorkbench darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'sell-through-analytics' && (
                    <SellThroughAnalytics darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'sell-in-forecast' && (
                    <SellInForecast darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'sku-aggregation' && (
                    <SKUAggregation darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'bom-explorer' && (
                    <BOMExplorer darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {/* component-consolidation now uses ModuleTilesView */}
                  {stoxView === 'store-deployment' && (
                    <StoreDeployment darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'executive-command' && (
                    <ExecutiveCommandCenter darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'scenario-planner' && (
                    <ScenarioPlanner darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {/* New Store System Modules */}
                  {stoxView === 'tile0-forecast-simulation' && (
                    <Tile0ForecastSimulation darkMode={darkMode} onBack={() => setStoxView('store-modules')} />
                  )}
                  {stoxView === 'store-forecasting' && (
                    <StoreForecast darkMode={darkMode} onBack={() => setStoxView('store-modules')} />
                  )}
                  {stoxView === 'store-health-monitor' && (
                    <StoreHealthMonitor darkMode={darkMode} onBack={() => setStoxView('store-modules')} />
                  )}
                  {stoxView === 'store-optimization' && (
                    <StoreOptimization darkMode={darkMode} onBack={() => setStoxView('store-modules')} />
                  )}
                  {stoxView === 'store-replenishment' && (
                    <StoreReplenishment darkMode={darkMode} onBack={() => setStoxView('store-modules')} />
                  )}
                  {stoxView === 'store-financial-impact' && (
                    <StoreFinancialImpact darkMode={darkMode} onBack={() => setStoxView('store-modules')} />
                  )}
                  {stoxView === 'supply-chain-map' && (
                    <SupplyChainMap darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'demand-intelligence' && (
                    <DemandIntelligence darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'forecasting-engine' && (
                    <ForecastingEngine darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'sap-data-hub' && (
                    <SAPDataHub darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'plant-inventory-intelligence' && (
                    <PlantInventoryIntelligence darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'inventory-health-check' && (
                    <InventoryHealthCheck darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'inventory-dashboard' && (
                    <InventoryDashboard darkMode={darkMode} onBack={() => setStoxView('landing')} onTileClick={(tileId) => setStoxView(tileId)} />
                  )}
                  {stoxView === 'working-capital-baseline' && (
                    <WorkingCapitalBaseline darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'command-center' && (
                    <CommandCenter
                      darkMode={darkMode}
                      onBack={() => setStoxView('landing')}
                      onTileClick={(tileId) => setStoxView(tileId)}
                    />
                  )}
                  {stoxView === 'supply-lead-time' && (
                    <SupplyLeadTime darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'cost-policy-engine' && (
                    <CostPolicyEngine darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'cost-configuration' && (
                    <CostConfiguration darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'supplier-terms-impact' && (
                    <SupplierTermsImpact darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'mrp-parameter-optimizer' && (
                    <MRPParameterOptimizer darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'mrp-parameter-tuner' && (
                    <MRPParameterTuner darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'mrp-optimizer' && (
                    <MRPOptimizerDashboard darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'what-if-simulator' && (
                    <WhatIfSimulator darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'recommendations-hub' && (
                    <RecommendationsHub darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'sap-writeback' && (
                    <SAPWriteback darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'performance-monitor' && (
                    <PerformanceMonitor darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'cfo-rollup-dashboard' && (
                    <CFORollupDashboard darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {stoxView === 'cash-release-timeline' && (
                    <CashReleaseTimeline darkMode={darkMode} onBack={() => setStoxView('landing')} />
                  )}
                  {/* DC System Modules */}
                  {stoxView === 'dc-demand-aggregation' && (
                    <DCDemandAggregation darkMode={darkMode} onBack={() => setStoxView('dc-modules')} />
                  )}
                  {stoxView === 'dc-health-monitor' && (
                    <DCHealthMonitor darkMode={darkMode} onBack={() => setStoxView('dc-modules')} />
                  )}
                  {stoxView === 'dc-optimization' && (
                    <DCOptimization darkMode={darkMode} onBack={() => setStoxView('dc-modules')} />
                  )}
                  {stoxView === 'dc-bom' && (
                    <DCBOM darkMode={darkMode} onBack={() => setStoxView('dc-modules')} />
                  )}
                  {stoxView === 'dc-lot-size' && (
                    <DCLotSize darkMode={darkMode} onBack={() => setStoxView('dc-modules')} />
                  )}
                  {stoxView === 'dc-supplier-exec' && (
                    <DCSupplierExecution darkMode={darkMode} onBack={() => setStoxView('dc-modules')} />
                  )}
                  {stoxView === 'dc-financial-impact' && (
                    <DCFinancialImpact darkMode={darkMode} onBack={() => setStoxView('dc-modules')} />
                  )}
                  {/* PRD Module Tiles Views */}
                  {['demand-flow', 'demand-forecasting', 'outbound-replenishment', 'dc-inventory', 'supply-planning', 'bom-explosion', 'component-consolidation', 'analytics-whatif'].includes(stoxView) && !currentFioriTile && (
                    <ModuleTilesView
                      darkMode={darkMode}
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
                          'outbound-replenishment': '#2b88d8',
                          'dc-inventory': '#f59e0b',
                          'supply-planning': '#8b5cf6',
                          'bom-explosion': '#ec4899',
                          'component-consolidation': '#ef4444',
                          'analytics-whatif': '#607D8B',
                        };
                        setCurrentFioriTile({
                          tileId,
                          moduleId: stoxView,
                          moduleColor: moduleColors[stoxView] || '#2b88d8',
                        });
                      }}
                    />
                  )}
                  {/* Fiori Tile Detail View */}
                  {currentFioriTile && (
                    <FioriTileDetail
                      darkMode={darkMode}
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
                      darkMode={darkMode}
                      onBack={() => setCoreAIView('landing')}
                      onTileClick={(moduleId) => {
                        console.log('RouteAI tile clicked:', moduleId);
                        setRouteView(moduleId);
                      }}
                    />
                  )}
                  {routeView === 'fleet-management' && (
                    <FleetManagement darkMode={darkMode} onBack={() => setRouteView('landing')} />
                  )}
                  {routeView === 'route-optimization' && (
                    <RouteOptimization darkMode={darkMode} onBack={() => setRouteView('landing')} />
                  )}
                  {routeView === 'delivery-tracking' && (
                    <DeliveryTracking darkMode={darkMode} onBack={() => setRouteView('landing')} />
                  )}
                  {routeView === 'performance-analytics' && (
                    <PerformanceAnalytics darkMode={darkMode} onBack={() => setRouteView('landing')} />
                  )}
                  {routeView === 'fuel-management' && (
                    <FuelManagement darkMode={darkMode} onBack={() => setRouteView('landing')} />
                  )}
                  {routeView === 'maintenance-scheduler' && (
                    <MaintenanceScheduler darkMode={darkMode} onBack={() => setRouteView('landing')} />
                  )}
                  {!['landing', 'fleet-management', 'route-optimization', 'delivery-tracking', 'performance-analytics', 'fuel-management', 'maintenance-scheduler'].includes(routeView) && (
                    <RouteAI darkMode={darkMode} onBack={() => setRouteView('landing')} />
                  )}
                </Box>
              </Fade>
              <Fade in={coreAIView === 'reveq'} timeout={300}>
                <Box sx={{ display: coreAIView === 'reveq' ? 'block' : 'none', height: '100%', overflow: 'auto' }}>
                  {reveqView === 'landing' && (
                    <ReveqAILanding
                      darkMode={darkMode}
                      onBack={() => setCoreAIView('landing')}
                      onTileClick={(moduleId) => {
                        setReveqView(moduleId);
                      }}
                    />
                  )}
                  {/* TODO: Restore reveqai components
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
                  */}
                </Box>
              </Fade>
              <Fade in={coreAIView === 'process-mining'} timeout={300}>
                <Box sx={{ display: coreAIView === 'process-mining' ? 'block' : 'none', height: '100%', overflow: 'auto' }}>
                  <ProcessMiningPage darkMode={darkMode} onBack={() => setCoreAIView('landing')} />
                </Box>
              </Fade>
              <Fade in={coreAIView === 'ordly'} timeout={300}>
                <Box sx={{ display: coreAIView === 'ordly' ? 'block' : 'none', height: '100%', overflow: 'auto' }}>
                  {ordlyView === 'landing' && (
                    <OrdlyAILanding
                      darkMode={darkMode}
                      onBack={() => setCoreAIView('landing')}
                      onTileClick={(moduleId) => {
                        console.log('OrdlyAI tile clicked:', moduleId);
                        setOrdlyView(moduleId);
                      }}
                    />
                  )}
                  {ordlyView === 'sales-order-pipeline' && (
                    <SalesOrderPipeline
                      darkMode={darkMode}
                      onBack={() => setOrdlyView('landing')}
                      onNavigate={(view) => {
                        if (view === 'customer-intent-cockpit') {
                          setOrdlyView('customer-intent-cockpit');
                        } else if (view === 'sku-decisioning') {
                          setOrdlyView('sku-decisioning');
                        }
                      }}
                    />
                  )}
                  {ordlyView === 'customer-intent-cockpit' && (
                    <CustomerIntentCockpit
                      darkMode={darkMode}
                      onBack={() => setOrdlyView('landing')}
                      onNavigate={(view) => {
                        if (view === 'sku-decisioning') {
                          setOrdlyView('sku-decisioning');
                        }
                      }}
                    />
                  )}
                  {ordlyView === 'sku-decisioning' && (
                    <SkuDecisioning
                      darkMode={darkMode}
                      onBack={() => setOrdlyView('landing')}
                      onNavigate={(view) => {
                        if (view === 'lead-time-recommendation') {
                          setOrdlyView('lead-time-recommendation');
                        }
                      }}
                    />
                  )}
                  {ordlyView === 'lead-time-recommendation' && (
                    <LeadTimeRecommendation
                      darkMode={darkMode}
                      onBack={() => setOrdlyView('landing')}
                      onNavigate={(view) => {
                        if (view === 'sap-commit-trace') {
                          setOrdlyView('sap-commit-trace');
                        }
                      }}
                    />
                  )}
                  {ordlyView === 'order-value-control-tower' && (
                    <OrderValueControlTower darkMode={darkMode} onBack={() => setOrdlyView('landing')} />
                  )}
                  {ordlyView === 'sku-bom-optimizer' && (
                    <SkuBomOptimizer darkMode={darkMode} onBack={() => setOrdlyView('landing')} />
                  )}
                  {ordlyView === 'sap-commit-trace' && (
                    <SapCommitTrace darkMode={darkMode} onBack={() => setOrdlyView('landing')} />
                  )}
                  {ordlyView === 'learning-loop' && (
                    <LearningLoop darkMode={darkMode} onBack={() => setOrdlyView('landing')} />
                  )}
                  {ordlyView === 'demand-signal' && (
                    <DemandSignal darkMode={darkMode} onBack={() => setOrdlyView('landing')} />
                  )}
                  {ordlyView === 'network-optimizer' && (
                    <NetworkOptimizer darkMode={darkMode} onBack={() => setOrdlyView('landing')} />
                  )}
                  {ordlyView === 'arbitration' && (
                    <Arbitration darkMode={darkMode} onBack={() => setOrdlyView('landing')} />
                  )}
                  {ordlyView === 'sap-commit' && (
                    <SapCommit darkMode={darkMode} onBack={() => setOrdlyView('landing')} />
                  )}
                </Box>
              </Fade>
              <Fade in={coreAIView === 'o2c'} timeout={300}>
                <Box sx={{ display: coreAIView === 'o2c' ? 'block' : 'none', height: '100%', overflow: 'auto' }}>
                  {o2cView === 'landing' && (
                    <O2CAILanding
                      darkMode={darkMode}
                      onBack={() => setCoreAIView('landing')}
                      onTileClick={(moduleId) => {
                        console.log('O2C tile clicked:', moduleId);
                        setO2cView(moduleId);
                      }}
                    />
                  )}
                </Box>
              </Fade>
              <Fade in={coreAIView === 'traxx'} timeout={300}>
                <Box sx={{ display: coreAIView === 'traxx' ? 'block' : 'none', height: '100%', overflow: 'auto' }}>
                  {traxxView === 'landing' && (
                    <TraxxAILanding
                      darkMode={darkMode}
                      onBack={() => setCoreAIView('landing')}
                      onTileClick={(moduleId) => {
                        console.log('TraxxAI tile clicked:', moduleId);
                        setTraxxView(moduleId);
                      }}
                    />
                  )}
                  {traxxView === 'kit-control-tower' && (
                    <KitControlTower darkMode={darkMode} onBack={() => setTraxxView('landing')} />
                  )}
                  {traxxView === 'who-must-act-now' && (
                    <WhoMustActNow darkMode={darkMode} onBack={() => setTraxxView('landing')} />
                  )}
                  {traxxView === 'logistics-economics' && (
                    <LogisticsEconomics darkMode={darkMode} onBack={() => setTraxxView('landing')} />
                  )}
                  {traxxView === 'realized-margin-cash' && (
                    <RealizedMarginCash darkMode={darkMode} onBack={() => setTraxxView('landing')} />
                  )}
                  {traxxView === 'surgery-readiness' && (
                    <SurgeryReadiness darkMode={darkMode} onBack={() => setTraxxView('landing')} />
                  )}
                </Box>
              </Fade>
              <Fade in={coreAIView === 'masterdata'} timeout={300}>
                <Box sx={{ display: coreAIView === 'masterdata' ? 'block' : 'none', height: '100%', overflow: 'auto' }}>
                  <MasterDataLanding
                    darkMode={darkMode}
                    onBack={() => setCoreAIView('landing')}
                  />
                </Box>
              </Fade>
              <Fade in={coreAIView === 'mantrixap'} timeout={300}>
                <Box sx={{ display: coreAIView === 'mantrixap' ? 'block' : 'none', height: '100%', overflow: 'auto' }}>
                  {apView === 'landing' && (
                    <MantrixAPLanding
                      darkMode={darkMode}
                      onBack={() => setCoreAIView('landing')}
                      onNavigate={(tileId) => {
                        console.log('MantrixAP tile clicked:', tileId);
                        setApView(tileId);
                      }}
                    />
                  )}
                  {apView === 'invoice-entry' && (
                    <InvoiceEntry darkMode={darkMode} onBack={() => setApView('landing')} onNavigate={(view) => setApView(view)} initialInvoice={selectedAPInvoice} onClearInitialInvoice={() => setSelectedAPInvoice(null)} />
                  )}
                  {apView === 'work-queue' && (
                    <SmartWorkQueue darkMode={darkMode} onBack={() => setApView('landing')} onNavigate={(view) => setApView(view)} onNavigateWithInvoice={(inv) => { setSelectedAPInvoice(inv); setApView('invoice-entry'); }} />
                  )}
                  {apView === 'exception-review' && (
                    <ExceptionReview darkMode={darkMode} onBack={() => setApView('landing')} onNavigate={(view) => setApView(view)} />
                  )}
                  {apView === 'posting-review' && (
                    <PostingReview darkMode={darkMode} onBack={() => setApView('landing')} onNavigate={(view) => setApView(view)} onNavigateWithInvoice={(inv) => { setSelectedAPInvoice(inv); setApView('invoice-entry'); }} />
                  )}
                  {apView === 'my-status' && (
                    <MyStatusTracker darkMode={darkMode} onBack={() => setApView('landing')} onNavigate={(view) => setApView(view)} onNavigateWithInvoice={(inv) => { setSelectedAPInvoice(inv); setApView('invoice-entry'); }} />
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
                  <AxisAIDashboard darkMode={darkMode} onTileClick={(moduleId) => {
                    setAxisAIView(moduleId);
                  }} />
                </Box>
              </Fade>
              <Fade in={axisAIView === 'forecast'} timeout={300}>
                <Box sx={{ display: axisAIView === 'forecast' ? 'block' : 'none', height: '100%' }}>
                  <ForecastAIDashboard darkMode={darkMode} onBack={() => setAxisAIView('landing')} />
                </Box>
              </Fade>
              <Fade in={axisAIView === 'scenario'} timeout={300}>
                <Box sx={{ display: axisAIView === 'scenario' ? 'block' : 'none', height: '100%' }}>
                  <ScenarioAIDashboard darkMode={darkMode} onBack={() => setAxisAIView('landing')} />
                </Box>
              </Fade>
            </Box>
          )}

          {/* MARKETS.AI Tab - Dynamic Integration */}
          {selectedTab === 3 && (
            <Box sx={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}>
              <MarketsAIDashboard darkMode={darkMode} />
            </Box>
          )}

          {/* Control Center */}
          {selectedTab === 4 && <ControlCenter darkMode={darkMode} apiHealth={apiHealth} onRefreshStatus={checkApiHealth} />}

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
          {selectedTab === 6 && <DocumentIntelligenceLanding darkMode={darkMode} />}

          {/* Process Mining Tab */}
          {selectedTab === 7 && <ProcessMiningPage darkMode={darkMode} />}
          
          {/* Enterprise Pulse Tab */}
          {selectedTab === 8 && (
            <Box sx={{ height: 'calc(100vh - 180px)' }}>
              <EnterprisePulse darkMode={darkMode} />
            </Box>
          )}
          
          {/* Vision AI Tab */}
          {selectedTab === 9 && (
            <Box sx={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}>
              <DocumentVisionIntelligence darkMode={darkMode} onNavigateToConfig={() => setSelectedTab(4)} />
            </Box>
          )}

          {/* COMMAND TOWER Tab */}
          {selectedTab === 10 && (
            <Box sx={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}>
              <TicketingSystem darkMode={darkMode} onBack={() => setSelectedTab(1)} />
            </Box>
          )}

          {/* EMAIL INTEL Tab */}
          {selectedTab === 13 && (
            <Box sx={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}>
              <EmailIntelligence darkMode={darkMode} onNavigateToConfig={() => setSelectedTab(4)} />
            </Box>
          )}

          {/* ROUTE.AI Tab */}
          {selectedTab === 15 && (
            <Box sx={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}>
              <RouteAI darkMode={darkMode} />
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
    // Brand colors from MANTRIX logo
    const brandNavy = '#00357a';
    const brandOrange = '#ff751f';

    const features = [
      { icon: <SmartToyIcon />, title: 'AI-Powered Analytics', desc: 'Natural language queries across your enterprise data' },
      { icon: <InventoryIcon />, title: 'Inventory Intelligence', desc: 'Real-time stock optimization and demand forecasting' },
      { icon: <TrendingUpIcon />, title: 'Predictive Insights', desc: 'ML-driven forecasting and trend analysis' },
      { icon: <SpeedIcon />, title: 'Real-Time Dashboards', desc: 'Live operational metrics and KPI tracking' },
    ];

    return (
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'Poppins, sans-serif',
      }}>
        <style>
          {`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeInLeft {
              from { opacity: 0; transform: translateX(-30px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}
        </style>

        {/* Left Panel - Branding */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          width: '50%',
          background: `linear-gradient(135deg, ${brandNavy} 0%, #001d42 100%)`,
          position: 'relative',
          overflow: 'hidden',
          p: { md: 4, lg: 5 },
        }}>
          {/* Subtle gradient overlay */}
          <Box sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '60%',
            height: '60%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${brandOrange}12 0%, transparent 60%)`,
          }} />

          {/* Grid pattern overlay */}
          <Box sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />

          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 420 }}>
            {/* Hero text */}
            <Box sx={{ mb: 3, animation: 'fadeInLeft 0.6s ease-out 0.2s', animationFillMode: 'both' }}>
              <Typography sx={{
                fontSize: { md: '2rem', lg: '2.4rem' },
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.1,
                mb: 1.5,
                fontFamily: 'Poppins, sans-serif',
              }}>
                Decision Intelligence{' '}
                <Box component="span" sx={{ color: brandOrange }}>Platform</Box>
              </Typography>
              <Typography sx={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.65)',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                lineHeight: 1.5,
              }}>
                Transform enterprise data into actionable insights with AI-powered analytics
              </Typography>
            </Box>

            {/* Features - 2x2 Grid */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {features.map((feature, index) => (
                <Grid item xs={6} key={index}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      transition: 'all 0.2s ease',
                      animation: `fadeInLeft 0.4s ease-out ${0.3 + index * 0.08}s`,
                      animationFillMode: 'both',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderColor: `${brandOrange}40`,
                      },
                    }}
                  >
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: `${brandOrange}20`,
                      color: brandOrange,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                      '& svg': { fontSize: 18 },
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography sx={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      fontFamily: 'Poppins, sans-serif',
                      lineHeight: 1.3,
                    }}>
                      {feature.title}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Bottom stats */}
            <Box sx={{
              display: 'flex',
              gap: 4,
              pt: 2,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              animation: 'fadeInLeft 0.6s ease-out 0.7s',
              animationFillMode: 'both',
            }}>
              {[
                { value: 'ERP', label: 'Integrated' },
                { value: 'AI', label: 'Powered' },
                { value: 'Real-time', label: 'Analytics' },
              ].map((stat, i) => (
                <Box key={i}>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: brandOrange, fontFamily: 'Poppins, sans-serif' }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Right Panel - Login Form */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#f8fafc',
          p: { xs: 3, sm: 6 },
          position: 'relative',
        }}>
          {/* Subtle background pattern */}
          <Box sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle at 25% 25%, ${brandNavy}08 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, ${brandOrange}05 0%, transparent 50%)`,
          }} />

          <Box sx={{
            width: '100%',
            maxWidth: 400,
            position: 'relative',
            zIndex: 1,
            animation: 'fadeInUp 0.6s ease-out',
          }}>
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <img src="/MANTRIX_AI.svg" alt="MANTRIX AI" style={{ height: 56 }} />
            </Box>

            <Typography sx={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: brandNavy,
              fontFamily: 'Poppins, sans-serif',
              mb: 1,
            }}>
              Welcome back
            </Typography>
            <Typography sx={{
              fontSize: '0.95rem',
              color: '#64748b',
              fontFamily: 'Poppins, sans-serif',
              mb: 4,
            }}>
              Sign in to access your dashboard
            </Typography>

            {/* Auth Button */}
            <Box sx={{ mb: 4 }}>
              <AuthButton />
            </Box>

            <Divider sx={{ my: 4 }}>
              <Typography sx={{
                fontSize: '0.7rem',
                color: '#94a3b8',
                fontFamily: 'Poppins, sans-serif',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}>
                Enterprise Security
              </Typography>
            </Divider>

            {/* Security badges */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
              mb: 4,
            }}>
              {[
                { icon: <LockIcon sx={{ fontSize: 18 }} />, label: '256-bit SSL' },
                { icon: <SecurityIcon sx={{ fontSize: 18 }} />, label: 'SOC 2' },
                { icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, label: 'SSO' },
              ].map((badge, i) => (
                <Box key={i} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: `${brandNavy}08`,
                  border: `1px solid ${brandNavy}15`,
                }}>
                  <Box sx={{ color: brandNavy }}>{badge.icon}</Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                    {badge.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Terms */}
            <Typography sx={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              fontFamily: 'Poppins, sans-serif',
              textAlign: 'center',
              lineHeight: 1.6,
            }}>
              By signing in, you agree to our{' '}
              <Box component="span" sx={{ color: brandNavy, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                Terms of Service
              </Box>
              {' '}and{' '}
              <Box component="span" sx={{ color: brandNavy, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                Privacy Policy
              </Box>
            </Typography>

            {/* Copyright */}
            <Typography sx={{
              fontSize: '0.7rem',
              color: '#cbd5e1',
              fontFamily: 'Poppins, sans-serif',
              textAlign: 'center',
              mt: 4,
            }}>
              © 2024 Arizona Beverages. All rights reserved.
            </Typography>
          </Box>
        </Box>
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
  
  // Clerk appearance customization to match MANTRIX branding
  const clerkAppearance = {
    layout: {
      socialButtonsPlacement: 'top',
      logoPlacement: 'inside',
      showOptionalFields: false,
    },
    variables: {
      colorPrimary: '#00357a',
      colorText: '#0f172a',
      colorTextSecondary: '#64748b',
      colorBackground: '#ffffff',
      colorInputBackground: '#f8fafc',
      colorInputText: '#0f172a',
      borderRadius: '8px',
      fontFamily: 'Poppins, Inter, system-ui, sans-serif',
    },
    elements: {
      rootBox: {
        fontFamily: 'Poppins, Inter, system-ui, sans-serif',
      },
      card: {
        boxShadow: '0 25px 50px -12px rgba(0, 53, 122, 0.15)',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
      },
      headerTitle: {
        fontWeight: 600,
        fontSize: '1.5rem',
        color: '#00357a',
      },
      headerSubtitle: {
        color: '#64748b',
      },
      socialButtonsBlockButton: {
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        '&:hover': {
          backgroundColor: '#f8fafc',
          borderColor: '#00357a',
        },
      },
      formButtonPrimary: {
        backgroundColor: '#00357a',
        borderRadius: '8px',
        fontWeight: 500,
        textTransform: 'none',
        '&:hover': {
          backgroundColor: '#002952',
        },
      },
      formFieldInput: {
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        '&:focus': {
          borderColor: '#00357a',
          boxShadow: '0 0 0 3px rgba(0, 53, 122, 0.1)',
        },
      },
      footerActionLink: {
        color: '#00357a',
        fontWeight: 500,
        '&:hover': {
          color: '#ff751f',
        },
      },
      identityPreviewEditButton: {
        color: '#00357a',
      },
      formFieldLabel: {
        color: '#0f172a',
        fontWeight: 500,
      },
      dividerLine: {
        backgroundColor: '#e2e8f0',
      },
      dividerText: {
        color: '#94a3b8',
      },
    },
  };

  // Clerk localization to customize text
  const clerkLocalization = {
    signIn: {
      start: {
        title: 'Sign in to MANTRIX AI',
        subtitle: 'Welcome back! Please sign in to continue',
      },
    },
    signUp: {
      start: {
        title: 'Create your MANTRIX AI account',
        subtitle: 'Get started with enterprise intelligence',
      },
    },
  };

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={clerkAppearance}
      localization={clerkLocalization}
    >
      <AuthenticatedApp />
    </ClerkProvider>
  );
}

export default AppWithAuth;