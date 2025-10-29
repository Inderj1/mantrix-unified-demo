import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  InputAdornment,
  Chip,
  Divider,
  alpha,
  IconButton,
  Popper,
  Fade,
  ClickAwayListener,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ArrowForward as ArrowIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Hub as HubIcon,
  TrendingUp as TrendingIcon,
  Inventory as InventoryIcon,
  Science as ScienceIcon,
  Dashboard as DashboardIcon,
  AutoAwesome as AIIcon,
  TableChart as TableIcon,
  Map as MapIcon,
  ShowChart as ChartIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';

// Comprehensive searchable index of all platform content
const searchableItems = [
  // CORE.AI items
  {
    id: 'core-ai',
    title: 'CORE.AI',
    subtitle: 'Operational Intelligence',
    path: ['CORE.AI'],
    icon: <AnalyticsIcon />,
    color: '#4285F4',
    tags: ['operational', 'intelligence', 'core', 'analytics'],
    action: { type: 'navigate', tabId: 1 },
  },
  {
    id: 'margen-ai',
    title: 'MARGEN.AI',
    subtitle: 'Financial Analytics Dashboard',
    path: ['CORE.AI', 'MARGEN.AI'],
    icon: <TrendingIcon />,
    color: '#4CAF50',
    tags: ['margin', 'financial', 'revenue', 'cost', 'analytics'],
    action: { type: 'navigate', tabId: 1, view: 'margen' },
  },
  {
    id: 'stox-ai',
    title: 'STOX.AI',
    subtitle: 'Inventory & Supply Chain Intelligence',
    path: ['CORE.AI', 'STOX.AI'],
    icon: <InventoryIcon />,
    color: '#2196F3',
    tags: ['inventory', 'supply', 'chain', 'stock', 'logistics'],
    action: { type: 'navigate', tabId: 1, view: 'stox' },
  },
  // STOX.AI Main Modules
  {
    id: 'stox-demand-workbench',
    title: 'STOX Demand Workbench',
    subtitle: 'Unified Demand Forecasting',
    path: ['CORE.AI', 'STOX.AI', 'Demand Workbench'],
    icon: <DashboardIcon />,
    color: '#3F51B5',
    tags: ['demand', 'forecasting', 'planning', 'workbench', 'unified'],
    action: { type: 'navigate', tabId: 1, view: 'demand-workbench' },
  },
  {
    id: 'stox-demand-flow',
    title: 'Sell-Through to Sell-In Bridge',
    subtitle: 'Module 0: Demand Flow',
    path: ['CORE.AI', 'STOX.AI', 'Demand Flow'],
    icon: <DashboardIcon />,
    color: '#06b6d4',
    tags: ['sell-through', 'sell-in', 'bridge', 'demand', 'flow', 'pos', 'channels'],
    action: { type: 'navigate', tabId: 1, view: 'demand-flow' },
  },
  {
    id: 'stox-demand-forecasting',
    title: 'Multi-Channel Demand Forecasting',
    subtitle: 'Module 1: AI Forecasting',
    path: ['CORE.AI', 'STOX.AI', 'Demand Forecasting'],
    icon: <TrendingIcon />,
    color: '#10b981',
    tags: ['forecasting', 'ai', 'multi-channel', 'demand', 'prediction', 'ml'],
    action: { type: 'navigate', tabId: 1, view: 'demand-forecasting' },
  },
  {
    id: 'stox-outbound-replenishment',
    title: 'Store Replenishment Cockpit',
    subtitle: 'Module 2: Outbound Planning',
    path: ['CORE.AI', 'STOX.AI', 'Store Replenishment'],
    icon: <DashboardIcon />,
    color: '#3b82f6',
    tags: ['replenishment', 'store', 'outbound', 'dc', 'planning', 'logistics'],
    action: { type: 'navigate', tabId: 1, view: 'outbound-replenishment' },
  },
  {
    id: 'stox-dc-inventory',
    title: 'DC Inventory Cockpit',
    subtitle: 'Module 3: DC Optimization',
    path: ['CORE.AI', 'STOX.AI', 'DC Inventory'],
    icon: <InventoryIcon />,
    color: '#f59e0b',
    tags: ['dc', 'inventory', 'warehouse', 'working', 'capital', 'optimization'],
    action: { type: 'navigate', tabId: 1, view: 'dc-inventory' },
  },
  {
    id: 'stox-supply-planning',
    title: 'Supply Requirements Dashboard',
    subtitle: 'Module 4: Inbound Planning',
    path: ['CORE.AI', 'STOX.AI', 'Supply Planning'],
    icon: <DashboardIcon />,
    color: '#8b5cf6',
    tags: ['supply', 'planning', 'inbound', 'mrp', 'production', 'requirements'],
    action: { type: 'navigate', tabId: 1, view: 'supply-planning' },
  },
  {
    id: 'stox-bom-explosion',
    title: 'BOM Explosion Analyzer',
    subtitle: 'Module 5: Component Planning',
    path: ['CORE.AI', 'STOX.AI', 'BOM Explosion'],
    icon: <DashboardIcon />,
    color: '#ec4899',
    tags: ['bom', 'explosion', 'component', 'planning', 'bill', 'materials'],
    action: { type: 'navigate', tabId: 1, view: 'bom-explosion' },
  },
  {
    id: 'stox-component-consolidation',
    title: 'Component Consolidation Engine',
    subtitle: 'Module 6: Procurement Optimization',
    path: ['CORE.AI', 'STOX.AI', 'Component Consolidation'],
    icon: <InventoryIcon />,
    color: '#ef4444',
    tags: ['component', 'consolidation', 'procurement', 'optimization', 'savings'],
    action: { type: 'navigate', tabId: 1, view: 'component-consolidation' },
  },
  {
    id: 'stox-analytics-whatif',
    title: 'Executive KPI Dashboard',
    subtitle: 'Module 7: Analytics & What-If',
    path: ['CORE.AI', 'STOX.AI', 'Executive Dashboard'],
    icon: <AnalyticsIcon />,
    color: '#607D8B',
    tags: ['kpi', 'executive', 'analytics', 'what-if', 'scenario', 'planning'],
    action: { type: 'navigate', tabId: 1, view: 'analytics-whatif' },
  },
  // STOX.AI Sub-tiles
  {
    id: 'stox-partner-pos-monitor',
    title: 'Partner POS Integration Monitor',
    subtitle: 'Demand Flow Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Demand Flow', 'Partner POS'],
    icon: <SearchIcon />,
    color: '#06b6d4',
    tags: ['pos', 'partner', 'integration', 'edi', 'retail', 'monitor'],
    action: { type: 'navigate', tabId: 1, view: 'demand-flow', subtile: 'partner-pos-monitor' },
  },
  {
    id: 'stox-forecast-dashboard',
    title: 'Demand Forecast Dashboard',
    subtitle: 'AI Forecasting Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Forecasting', 'Dashboard'],
    icon: <DashboardIcon />,
    color: '#10b981',
    tags: ['forecast', 'dashboard', 'accuracy', 'metrics', 'demand'],
    action: { type: 'navigate', tabId: 1, view: 'demand-forecasting', subtile: 'forecast-dashboard' },
  },
  {
    id: 'stox-demand-analyzer',
    title: 'Multi-Dimensional Demand Analyzer',
    subtitle: 'AI Forecasting Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Forecasting', 'Analyzer'],
    icon: <TrendingIcon />,
    color: '#10b981',
    tags: ['demand', 'analyzer', 'drill-down', 'multi-dimensional', 'insights'],
    action: { type: 'navigate', tabId: 1, view: 'demand-forecasting', subtile: 'demand-analyzer' },
  },
  {
    id: 'stox-forecast-workbench',
    title: 'Forecast Collaboration Workbench',
    subtitle: 'AI Forecasting Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Forecasting', 'Workbench'],
    icon: <DashboardIcon />,
    color: '#10b981',
    tags: ['forecast', 'collaboration', 'workbench', 'override', 'consensus'],
    action: { type: 'navigate', tabId: 1, view: 'demand-forecasting', subtile: 'forecast-workbench' },
  },
  {
    id: 'stox-demand-alerts',
    title: 'Demand Alerts & Exceptions',
    subtitle: 'AI Forecasting Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Forecasting', 'Alerts'],
    icon: <DashboardIcon />,
    color: '#10b981',
    tags: ['alerts', 'exceptions', 'anomaly', 'warnings', 'demand'],
    action: { type: 'navigate', tabId: 1, view: 'demand-forecasting', subtile: 'demand-alerts' },
  },
  {
    id: 'stox-route-optimizer',
    title: 'Delivery Route Optimizer',
    subtitle: 'Outbound Planning Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Replenishment', 'Routes'],
    icon: <DashboardIcon />,
    color: '#3b82f6',
    tags: ['route', 'delivery', 'optimizer', 'logistics', 'transportation'],
    action: { type: 'navigate', tabId: 1, view: 'outbound-replenishment', subtile: 'route-optimizer' },
  },
  {
    id: 'stox-stockout-monitor',
    title: 'Stockout Risk Monitor',
    subtitle: 'Outbound Planning Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Replenishment', 'Stockout'],
    icon: <DashboardIcon />,
    color: '#3b82f6',
    tags: ['stockout', 'risk', 'monitor', 'alerts', 'shortage'],
    action: { type: 'navigate', tabId: 1, view: 'outbound-replenishment', subtile: 'stockout-monitor' },
  },
  {
    id: 'stox-channel-allocation',
    title: 'Channel Allocation Manager',
    subtitle: 'Outbound Planning Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Replenishment', 'Allocation'],
    icon: <DashboardIcon />,
    color: '#3b82f6',
    tags: ['channel', 'allocation', 'priority', 'distribution'],
    action: { type: 'navigate', tabId: 1, view: 'outbound-replenishment', subtile: 'channel-allocation' },
  },
  {
    id: 'stox-working-capital',
    title: 'Working Capital Dashboard',
    subtitle: 'DC Optimization Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'DC Inventory', 'Working Capital'],
    icon: <AttachMoneyIcon />,
    color: '#f59e0b',
    tags: ['working', 'capital', 'cash', 'flow', 'dio', 'turns'],
    action: { type: 'navigate', tabId: 1, view: 'dc-inventory', subtile: 'working-capital' },
  },
  {
    id: 'stox-excess-obsolete',
    title: 'Excess & Obsolete Manager',
    subtitle: 'DC Optimization Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'DC Inventory', 'E&O'],
    icon: <DashboardIcon />,
    color: '#f59e0b',
    tags: ['excess', 'obsolete', 'slow-moving', 'liquidation', 'markdown'],
    action: { type: 'navigate', tabId: 1, view: 'dc-inventory', subtile: 'excess-obsolete' },
  },
  {
    id: 'stox-production-optimizer',
    title: 'Production Schedule Optimizer',
    subtitle: 'Inbound Planning Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Supply Planning', 'Production'],
    icon: <DashboardIcon />,
    color: '#8b5cf6',
    tags: ['production', 'schedule', 'optimizer', 'capacity', 'planning'],
    action: { type: 'navigate', tabId: 1, view: 'supply-planning', subtile: 'production-optimizer' },
  },
  {
    id: 'stox-mrp-accelerator',
    title: 'MRP Accelerator',
    subtitle: 'Inbound Planning Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Supply Planning', 'MRP'],
    icon: <DashboardIcon />,
    color: '#8b5cf6',
    tags: ['mrp', 'accelerator', 'material', 'requirements', 'planning'],
    action: { type: 'navigate', tabId: 1, view: 'supply-planning', subtile: 'mrp-accelerator' },
  },
  {
    id: 'stox-component-tracker',
    title: 'Component Usage Tracker',
    subtitle: 'Component Planning Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'BOM Explosion', 'Tracker'],
    icon: <DashboardIcon />,
    color: '#ec4899',
    tags: ['component', 'tracker', 'where-used', 'substitution'],
    action: { type: 'navigate', tabId: 1, view: 'bom-explosion', subtile: 'component-tracker' },
  },
  {
    id: 'stox-bom-exceptions',
    title: 'BOM Exception Manager',
    subtitle: 'Component Planning Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'BOM Explosion', 'Exceptions'],
    icon: <DashboardIcon />,
    color: '#ec4899',
    tags: ['bom', 'exceptions', 'alerts', 'eco', 'engineering'],
    action: { type: 'navigate', tabId: 1, view: 'bom-explosion', subtile: 'bom-exceptions' },
  },
  {
    id: 'stox-procurement-dashboard',
    title: 'Procurement Optimization Dashboard',
    subtitle: 'Procurement Optimization Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Component Consolidation', 'Procurement'],
    icon: <DashboardIcon />,
    color: '#ef4444',
    tags: ['procurement', 'optimization', 'po', 'supplier', 'savings'],
    action: { type: 'navigate', tabId: 1, view: 'component-consolidation', subtile: 'procurement-dashboard' },
  },
  {
    id: 'stox-supplier-portal',
    title: 'Supplier Collaboration Portal',
    subtitle: 'Procurement Optimization Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Component Consolidation', 'Supplier'],
    icon: <DashboardIcon />,
    color: '#ef4444',
    tags: ['supplier', 'collaboration', 'portal', 'forecast', 'sharing'],
    action: { type: 'navigate', tabId: 1, view: 'component-consolidation', subtile: 'supplier-portal' },
  },
  {
    id: 'stox-scenario-planner',
    title: 'What-If Scenario Planner',
    subtitle: 'Analytics & What-If Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Executive Dashboard', 'Scenarios'],
    icon: <AnalyticsIcon />,
    color: '#607D8B',
    tags: ['what-if', 'scenario', 'planner', 'simulation', 'optimization'],
    action: { type: 'navigate', tabId: 1, view: 'analytics-whatif', subtile: 'scenario-planner' },
  },
  {
    id: 'stox-predictive-analytics',
    title: 'Predictive Analytics',
    subtitle: 'Analytics & What-If Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Executive Dashboard', 'Predictive'],
    icon: <TrendingIcon />,
    color: '#607D8B',
    tags: ['predictive', 'analytics', 'ai', 'insights', 'recommendations'],
    action: { type: 'navigate', tabId: 1, view: 'analytics-whatif', subtile: 'predictive-analytics' },
  },
  {
    id: 'stox-working-capital-optimizer',
    title: 'Working Capital Optimizer',
    subtitle: 'Analytics & What-If Sub-tile',
    path: ['CORE.AI', 'STOX.AI', 'Executive Dashboard', 'Capital'],
    icon: <AttachMoneyIcon />,
    color: '#607D8B',
    tags: ['working', 'capital', 'optimizer', 'cash', 'flow', 'roi'],
    action: { type: 'navigate', tabId: 1, view: 'analytics-whatif', subtile: 'working-capital-optimizer' },
  },
  // AXIS.AI items
  {
    id: 'axis-ai',
    title: 'AXIS.AI',
    subtitle: 'Platform-Wide Q&A',
    path: ['AXIS.AI'],
    icon: <TimelineIcon />,
    color: '#2196F3',
    tags: ['chat', 'query', 'question', 'nlp', 'sql', 'strategic', 'intelligence', 'axis'],
    action: { type: 'navigate', tabId: 0 },
  },
  // MARKETS.AI items
  {
    id: 'markets-ai',
    title: 'MARKETS.AI',
    subtitle: 'Market Intelligence',
    path: ['MARKETS.AI'],
    icon: <BarChartIcon />,
    color: '#FF5722',
    tags: ['market', 'intelligence', 'analysis', 'trends'],
    action: { type: 'navigate', tabId: 3 },
  },
  // Other platform features
  {
    id: 'enterprise-pulse',
    title: 'ENTERPRISE PULSE',
    subtitle: 'Real-time Business Metrics',
    path: ['ENTERPRISE PULSE'],
    icon: <DashboardIcon />,
    color: '#00ACC1',
    tags: ['dashboard', 'metrics', 'kpi', 'real-time', 'pulse'],
    action: { type: 'navigate', tabId: 8 },
  },
  {
    id: 'process-mining',
    title: 'PROCESS MINING',
    subtitle: 'Business Process Analytics',
    path: ['PROCESS MINING'],
    icon: <HubIcon />,
    color: '#FF6B35',
    tags: ['process', 'mining', 'workflow', 'analytics', 'business'],
    action: { type: 'navigate', tabId: 7 },
  },
  {
    id: 'control-center',
    title: 'Control Center',
    subtitle: 'Platform Management & Settings',
    path: ['Control Center'],
    icon: <HubIcon />,
    color: '#FF9800',
    tags: ['control', 'center', 'settings', 'management', 'config', 'system'],
    action: { type: 'navigate', tabId: 4 },
  },
  {
    id: 'vision-ai',
    title: 'VISION.AI',
    subtitle: 'Inventory & Stock Management',
    path: ['VISION.AI'],
    icon: <ScienceIcon />,
    color: '#00BCD4',
    tags: ['vision', 'inventory', 'stock', 'management', 'visual'],
    action: { type: 'navigate', tabId: 9 },
  },
  {
    id: 'doc-analysis',
    title: 'DOCUMENT HUB',
    subtitle: 'Upload & Analyze Documents',
    path: ['Mantra AI', 'DOCUMENT HUB'],
    icon: <ScienceIcon />,
    color: '#9C27B0',
    tags: ['docs', 'documents', 'upload', 'analyze', 'pdf', 'text', 'mantra'],
    action: { type: 'navigate', tabId: 6 },
  },
  {
    id: 'comms-ai',
    title: 'COMMS.AI',
    subtitle: 'Email & Communication Analysis',
    path: ['COMMS.AI'],
    icon: <ScienceIcon />,
    color: '#E91E63',
    tags: ['comms', 'email', 'communication', 'analysis', 'sentiment'],
    action: { type: 'navigate', tabId: 13 },
  },
];

const GlobalSearch = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Global keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Filter search results based on query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = searchableItems.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const subtitleMatch = item.subtitle.toLowerCase().includes(query);
      const pathMatch = item.path.some(p => p.toLowerCase().includes(query));
      const tagMatch = item.tags.some(tag => tag.includes(query));
      
      return titleMatch || subtitleMatch || pathMatch || tagMatch;
    });

    // Sort results by relevance
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      // Exact matches first
      if (aTitle === query) return -1;
      if (bTitle === query) return 1;
      
      // Then starts with
      if (aTitle.startsWith(query)) return -1;
      if (bTitle.startsWith(query)) return 1;
      
      return 0;
    });

    setSearchResults(results);
    setIsOpen(results.length > 0);
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleResultClick(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (item) => {
    console.log('Navigating to:', item);
    setSearchQuery('');
    setIsOpen(false);
    onNavigate(item.action);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <Box sx={{ position: 'relative' }} ref={searchRef}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: { xs: 280, sm: 360, md: 480 },
          px: 2,
          py: 0.5,
          borderRadius: 3,
          bgcolor: alpha('#000', 0.04),
          border: '1px solid',
          borderColor: 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: alpha('#000', 0.06),
            borderColor: alpha('#0a6ed1', 0.2),
          },
          '&:focus-within': {
            bgcolor: 'background.paper',
            borderColor: 'primary.main',
            boxShadow: `0 0 0 3px ${alpha('#0a6ed1', 0.1)}`,
          },
        }}
      >
        <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
        <TextField
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search anything..."
          fullWidth
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '0.875rem',
              '& input': {
                padding: '6px 0',
                '&::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.8,
                },
              },
            },
            endAdornment: (
              <Stack direction="row" spacing={1} alignItems="center">
                {searchQuery && (
                  <Fade in timeout={200}>
                    <IconButton 
                      size="small" 
                      onClick={handleClear}
                      sx={{ 
                        padding: '4px',
                        '&:hover': {
                          bgcolor: alpha('#000', 0.04),
                        },
                      }}
                    >
                      <ClearIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Fade>
                )}
                {!searchQuery && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: alpha('#000', 0.04),
                      border: '1px solid',
                      borderColor: alpha('#000', 0.08),
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.65rem',
                        fontFamily: 'monospace',
                        color: 'text.secondary',
                        fontWeight: 600,
                      }}
                    >
                      ⌘K
                    </Typography>
                  </Box>
                )}
              </Stack>
            ),
          }}
        />
        {searchQuery && (
          <Chip
            size="small"
            label={`${searchResults.length} results`}
            sx={{
              ml: 1,
              height: 20,
              fontSize: '0.7rem',
              bgcolor: alpha('#0a6ed1', 0.1),
              color: 'primary.main',
              fontWeight: 600,
            }}
          />
        )}
      </Paper>

      <Popper
        open={isOpen}
        anchorEl={searchRef.current}
        placement="bottom-start"
        transition
        style={{ zIndex: 1300, width: searchRef.current?.offsetWidth }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={4}
              sx={{
                mt: 1,
                maxHeight: 420,
                overflow: 'hidden',
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha('#0a6ed1', 0.15),
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}
            >
              <ClickAwayListener onClickAway={() => setIsOpen(false)}>
                <Box>
                  {/* Results header */}
                  <Box sx={{ 
                    px: 2, 
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: alpha('#0a6ed1', 0.02),
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      Search Results
                    </Typography>
                  </Box>
                  
                  <List sx={{ py: 0, maxHeight: 380, overflow: 'auto' }}>
                  {searchResults.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <ListItemButton
                        selected={index === selectedIndex}
                        onClick={() => handleResultClick(item)}
                        sx={{
                          py: 1.5,
                          px: 2,
                          borderLeft: '3px solid transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: alpha(item.color, 0.04),
                            borderLeftColor: alpha(item.color, 0.3),
                            transform: 'translateX(4px)',
                          },
                          '&.Mui-selected': {
                            bgcolor: alpha(item.color, 0.08),
                            borderLeftColor: item.color,
                            '&:hover': {
                              bgcolor: alpha(item.color, 0.12),
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 48 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, ${alpha(item.color, 0.2)} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: item.color,
                              boxShadow: `0 2px 8px ${alpha(item.color, 0.2)}`,
                            }}
                          >
                            {React.cloneElement(item.icon, { fontSize: 'small' })}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body2" 
                              fontWeight={600}
                              sx={{ color: 'text.primary', mb: 0.25 }}
                            >
                              {item.title}
                            </Typography>
                          }
                          secondary={
                            <Stack spacing={0.5}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'text.secondary',
                                  display: 'block',
                                }}
                              >
                                {item.subtitle}
                              </Typography>
                              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                                {item.path.map((p, i) => (
                                  <React.Fragment key={i}>
                                    {i > 0 && (
                                      <ArrowIcon 
                                        sx={{ 
                                          fontSize: 10, 
                                          color: 'text.disabled',
                                          mx: 0.25,
                                        }} 
                                      />
                                    )}
                                    <Chip
                                      label={p}
                                      size="small"
                                      sx={{
                                        height: 16,
                                        fontSize: '0.65rem',
                                        bgcolor: i === item.path.length - 1 
                                          ? alpha(item.color, 0.1)
                                          : 'transparent',
                                        color: i === item.path.length - 1 
                                          ? item.color 
                                          : 'text.secondary',
                                        fontWeight: i === item.path.length - 1 ? 600 : 400,
                                        '& .MuiChip-label': {
                                          px: 0.75,
                                        },
                                      }}
                                    />
                                  </React.Fragment>
                                ))}
                              </Stack>
                            </Stack>
                          }
                        />
                        <Box sx={{ ml: 'auto', pl: 2 }}>
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: alpha(item.color, 0.6),
                              '&:hover': {
                                color: item.color,
                                bgcolor: alpha(item.color, 0.08),
                              },
                            }}
                          >
                            <ArrowIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </ListItemButton>
                      {index < searchResults.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  {searchResults.length === 0 && searchQuery && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          bgcolor: alpha('#000', 0.04),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        <SearchIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        No results found for "{searchQuery}"
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Try searching for "STOX", "inventory", "ML", or "financial"
                      </Typography>
                    </Box>
                  )}
                  </List>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default GlobalSearch;