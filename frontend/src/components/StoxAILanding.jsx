import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Stack,
  Button,
  Breadcrumbs,
  Link,
  Zoom,
  Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Lightbulb as LightbulbIcon,
  Inventory as InventoryIcon,
  ShowChart as ShowChartIcon,
  Analytics as AnalyticsIcon,
  Science as ScienceIcon,
  Map as MapIcon,
  Hub as HubIcon,
  Factory as FactoryIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  Tune as TuneIcon,
  Settings as SettingsIcon,
  PlayCircle as PlayCircleIcon,
  Recommend as RecommendIcon,
  CloudSync as CloudSyncIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  RocketLaunch as RocketLaunchIcon,
  Layers as LayersIcon,
  AccountBalance as AccountBalanceIcon,
  Storefront as StorefrontIcon,
} from '@mui/icons-material';

// Single consistent blue for all modules
const MODULE_COLOR = '#0078d4';

// Main category tiles: RETAIL and MANUFACTURING
const categoryTiles = [
  {
    id: 'retail',
    title: 'STOX.AI (RETAIL)',
    subtitle: 'Store & Distribution Center',
    description: 'End-to-end retail inventory optimization from store forecasting to DC replenishment',
    icon: StorefrontIcon,
    color: MODULE_COLOR,
    stats: { label: 'Modules', value: '12' },
  },
  {
    id: 'manufacturing',
    title: 'STOX.AI (MANUFACTURING)',
    subtitle: 'Plant & Supply Chain',
    description: '6-layer architecture for manufacturing inventory optimization with SAP integration',
    icon: FactoryIcon,
    color: MODULE_COLOR,
    stats: { label: 'Layers', value: '6' },
  },
];

// 6 Layer Tiles for Manufacturing
const layerTiles = [
  {
    id: 'layer-1',
    layer: 1,
    title: 'Foundation',
    subtitle: 'Data & Visibility',
    description: 'Real-time inventory visibility across plants, suppliers, and network with SAP integration',
    icon: StorageIcon,
    color: MODULE_COLOR,
            tileCount: 4,
  },
  {
    id: 'layer-2',
    layer: 2,
    title: 'Diagnostics',
    subtitle: 'Health & Patterns',
    description: 'Analyze inventory health, detect anomalies, and classify demand patterns with AI insights',
    icon: HealthAndSafetyIcon,
    color: MODULE_COLOR,
            tileCount: 3,
  },
  {
    id: 'layer-3',
    layer: 3,
    title: 'Prediction',
    subtitle: 'Forecasting',
    description: 'AI-powered demand forecasting with multiple models, accuracy tracking, and confidence intervals',
    icon: TrendingUpIcon,
    color: MODULE_COLOR,
            tileCount: 2,
  },
  {
    id: 'layer-4',
    layer: 4,
    title: 'Optimization',
    subtitle: 'Parameters & Costs',
    description: 'AI-driven safety stock, reorder point optimization, and cost policy management',
    icon: TuneIcon,
    color: MODULE_COLOR,
            tileCount: 4,
  },
  {
    id: 'layer-5',
    layer: 5,
    title: 'Sandbox',
    subtitle: 'Simulation & Tuning',
    description: 'Interactive parameter tuning, what-if scenarios, and impact simulation',
    icon: PsychologyIcon,
    color: MODULE_COLOR,
            tileCount: 3,
  },
  {
    id: 'layer-6',
    layer: 6,
    title: 'Execution',
    subtitle: 'Actions & Monitoring',
    description: 'AI recommendations, SAP writeback, and performance monitoring with feedback loop',
    icon: RocketLaunchIcon,
    color: MODULE_COLOR,
            tileCount: 6,
  },
];

// Sub-tiles organized by layer
const subTilesByLayer = {
  'layer-1': [
    {
      id: 'sap-data-hub',
      title: 'SAP Data Hub',
      subtitle: 'Layer 1 - Infrastructure',
      description: 'Monitor SAP system connections, data quality scores, extraction jobs, and ODQ delta queues',
      icon: HubIcon,
      color: MODULE_COLOR,
            stats: { label: 'Systems', value: '4' },
      status: 'active',
          },
    {
      id: 'plant-inventory-intelligence',
      title: 'Plant Inventory Intelligence',
      subtitle: 'Layer 1 - Foundation',
      description: 'Plant-level inventory analytics, SLOB analysis, GMROI tracking, and ABC/XYZ segmentation',
      icon: FactoryIcon,
      color: MODULE_COLOR,
            stats: { label: 'Plants', value: '4' },
      status: 'active',
          },
    {
      id: 'supply-lead-time',
      title: 'Supply & Lead Time',
      subtitle: 'Layer 1 - Procurement',
      description: 'Vendor lead time analysis, OTD tracking, variability metrics, and safety stock recommendations',
      icon: ScheduleIcon,
      color: MODULE_COLOR,
            stats: { label: 'Vendors', value: '8' },
      status: 'active',
          },
    {
      id: 'supply-chain-map',
      title: 'Supply Chain Map',
      subtitle: 'Layer 1 - Network Visibility',
      description: 'Real-time fleet tracking, inventory monitoring, and AI-powered supply chain optimization',
      icon: MapIcon,
      color: MODULE_COLOR,
            stats: { label: 'Live Tracking', value: '24/7' },
      status: 'active',
          },
  ],
  'layer-2': [
    {
      id: 'inventory-dashboard',
      title: 'Inventory Dashboard',
      subtitle: 'Layer 2 - Analytics',
      description: 'Comprehensive inventory dashboard with ABC/XYZ matrix, KPIs, drill-down analytics, and optimization',
      icon: AnalyticsIcon,
      color: MODULE_COLOR,
            stats: { label: 'SKUs', value: '28' },
      status: 'active',
          },
    {
      id: 'inventory-health-check',
      title: 'Inventory Health Check',
      subtitle: 'Layer 2 - Diagnostics',
      description: 'Comprehensive health scoring with anomaly detection, aging analysis, and risk assessment',
      icon: HealthAndSafetyIcon,
      color: MODULE_COLOR,
            stats: { label: 'Health Score', value: '87%' },
      status: 'active',
          },
    {
      id: 'working-capital-baseline',
      title: 'Working Capital Baseline',
      subtitle: 'Layer 2 - Financial',
      description: 'Establish working capital baselines and track improvements across inventory categories',
      icon: AccountBalanceIcon,
      color: MODULE_COLOR,
            stats: { label: 'WC Tied', value: '$8.2M' },
      status: 'active',
          },
  ],
  'layer-3': [
    {
      id: 'demand-intelligence',
      title: 'Demand Intelligence',
      subtitle: 'Layer 3 - Demand Signals',
      description: 'AI-driven demand signal processing, pattern recognition, and market trend analysis',
      icon: TrendingUpIcon,
      color: MODULE_COLOR,
            stats: { label: 'Signals', value: '24' },
      status: 'active',
          },
    {
      id: 'forecasting-engine',
      title: 'Forecasting Engine',
      subtitle: 'Layer 3 - Prediction',
      description: 'AI-powered demand forecasting with model selection, accuracy tracking, and confidence intervals',
      icon: AnalyticsIcon,
      color: MODULE_COLOR,
            stats: { label: 'Models', value: '6' },
      status: 'active',
          },
  ],
  'layer-4': [
    {
      id: 'cost-policy-engine',
      title: 'Cost Policy Engine',
      subtitle: 'Layer 4 - Costing',
      description: 'Manage cost methods, inventory policies, EOQ parameters, and holding costs',
      icon: AttachMoneyIcon,
      color: MODULE_COLOR,
            stats: { label: 'Policies', value: '12' },
      status: 'active',
          },
    {
      id: 'cost-configuration',
      title: 'Cost Configuration',
      subtitle: 'Layer 4 - Economics',
      description: 'Configure customer-specific cost economics: holding costs, ordering costs, and stockout costs',
      icon: SettingsIcon,
      color: MODULE_COLOR,
            stats: { label: 'Parameters', value: '15' },
      status: 'active',
          },
    {
      id: 'mrp-parameter-optimizer',
      title: 'MRP Parameter Optimizer',
      subtitle: 'Layer 4 - Optimization',
      description: 'AI-driven safety stock and reorder point optimization with savings analysis',
      icon: TuneIcon,
      color: MODULE_COLOR,
            stats: { label: 'Optimizations', value: '24' },
      status: 'active',
          },
    {
      id: 'supplier-terms-impact',
      title: 'Supplier Terms Impact',
      subtitle: 'Layer 4.5 - Terms Analysis',
      description: 'Analyze payment terms impact on WC: consignment, Net 30/60/90, early pay discounts',
      icon: ScheduleIcon,
      color: MODULE_COLOR,
            stats: { label: 'Suppliers', value: '10' },
      status: 'active',
          },
  ],
  'layer-5': [
    {
      id: 'mrp-optimizer',
      title: 'MRP Optimizer',
      subtitle: 'Layer 5 - Sandbox',
      description: 'MRP Type ↔ Parameter Optimization by SKU/Plant with AI recommendations and SAP writeback',
      icon: TuneIcon,
      color: MODULE_COLOR,
            stats: { label: 'SKUs', value: '15' },
      status: 'active',
          },
    {
      id: 'mrp-parameter-tuner',
      title: 'MRP Parameter Tuner',
      subtitle: 'Layer 5 - Fine Tuning',
      description: 'Interactive parameter tuning with real-time impact visualization and scenario comparison',
      icon: TuneIcon,
      color: MODULE_COLOR,
            stats: { label: 'Parameters', value: '32' },
      status: 'active',
          },
    {
      id: 'what-if-simulator',
      title: 'What-If Simulator',
      subtitle: 'Layer 5 - Simulation',
      description: 'Scenario-based simulation for inventory policies, demand changes, and supply disruptions',
      icon: ScienceIcon,
      color: MODULE_COLOR,
            stats: { label: 'Scenarios', value: '8' },
      status: 'active',
          },
  ],
  'layer-6': [
    {
      id: 'command-center',
      title: 'Command Center',
      subtitle: 'Layer 6 - Control Hub',
      description: 'Centralized control hub for monitoring, alerts, and decision execution across the supply chain',
      icon: SpeedIcon,
      color: MODULE_COLOR,
            stats: { label: 'Active', value: '24/7' },
      status: 'active',
          },
    {
      id: 'cfo-rollup-dashboard',
      title: 'CFO Rollup Dashboard',
      subtitle: 'Layer 6 - Executive View',
      description: 'Executive summary of Working Capital, cash release potential, and risk-adjusted savings',
      icon: AccountBalanceIcon,
      color: MODULE_COLOR,
            stats: { label: 'WC Tied', value: '$12.8M' },
      status: 'active',
          },
    {
      id: 'cash-release-timeline',
      title: 'Cash Release Timeline',
      subtitle: 'Layer 6 - Project Tracking',
      description: 'Track cash release initiatives over time with Gantt-style timeline and confidence metrics',
      icon: ScheduleIcon,
      color: MODULE_COLOR,
            stats: { label: 'Initiatives', value: '8' },
      status: 'active',
          },
    {
      id: 'recommendations-hub',
      title: 'Recommendations Hub',
      subtitle: 'Layer 6 - AI Insights',
      description: 'AI-powered recommendations for inventory optimization with approval workflow',
      icon: RecommendIcon,
      color: MODULE_COLOR,
            stats: { label: 'Recommendations', value: '15' },
      status: 'active',
          },
    {
      id: 'sap-writeback',
      title: 'SAP Writeback',
      subtitle: 'Layer 6 - Integration',
      description: 'Monitor and manage parameter updates pushed to SAP systems',
      icon: CloudSyncIcon,
      color: MODULE_COLOR,
            stats: { label: 'Jobs', value: '12' },
      status: 'active',
          },
    {
      id: 'performance-monitor',
      title: 'Performance Monitor',
      subtitle: 'Layer 6 - Feedback Loop',
      description: 'Track KPIs, service levels, inventory turns, and optimization performance',
      icon: SpeedIcon,
      color: MODULE_COLOR,
            stats: { label: 'KPIs', value: '20' },
      status: 'active',
          },
  ],
};

const StoxAILanding = ({ onTileClick, onBack, onCategorySelect, initialView }) => {
  const [view, setView] = useState(initialView || 'categories'); // 'categories', 'manufacturing', or layer ID
  const [selectedLayer, setSelectedLayer] = useState(null);

  const handleCategoryClick = (categoryId) => {
    if (categoryId === 'retail') {
      // Navigate to retail landing via parent
      if (onCategorySelect) {
        onCategorySelect('retail');
      }
    } else if (categoryId === 'manufacturing') {
      setView('manufacturing');
    }
  };

  const handleLayerClick = (layerId) => {
    setSelectedLayer(layerId);
    setView(layerId);
  };

  const handleSubTileClick = (moduleId) => {
    if (onTileClick) {
      onTileClick(moduleId);
    }
  };

  const handleBackToCategories = () => {
    setView('categories');
    setSelectedLayer(null);
  };

  const handleBackToLayers = () => {
    setView('manufacturing');
    setSelectedLayer(null);
  };

  const currentLayer = layerTiles.find(l => l.id === selectedLayer);
  const currentSubTiles = selectedLayer ? subTilesByLayer[selectedLayer] : [];

  // Render sub-tiles for selected layer
  if (selectedLayer && view === selectedLayer) {
    return (
      <Box sx={{
        p: 3,
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'linear-gradient(180deg, rgba(219, 234, 254, 0.1) 0%, rgba(255, 255, 255, 1) 50%)',
      }}>
        {/* Header with Breadcrumbs */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
                CORE.AI
              </Link>
              <Link component="button" variant="body1" onClick={handleBackToCategories} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
                STOX.AI
              </Link>
              <Link component="button" variant="body1" onClick={handleBackToLayers} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
                Manufacturing
              </Link>
              <Typography color="primary" variant="body1" fontWeight={600}>
                Layer {currentLayer?.layer}: {currentLayer?.title}
              </Typography>
            </Breadcrumbs>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBackToLayers} variant="outlined" size="small">
              Back to Layers
            </Button>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 4, height: 60, background: currentLayer?.gradient, borderRadius: 2 }} />
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: currentLayer?.color }}>
                  {currentLayer && <currentLayer.icon sx={{ fontSize: 18 }} />}
                </Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ color: currentLayer?.color }}>
                  Layer {currentLayer?.layer}: {currentLayer?.title}
                </Typography>
                <Chip label={`${currentSubTiles.length} Modules`} size="small" sx={{ bgcolor: alpha(currentLayer?.color || '#0078d4', 0.1), color: currentLayer?.color, fontWeight: 600, fontSize: '0.7rem' }} />
              </Stack>
              <Typography variant="body2" color="text.secondary">{currentLayer?.description}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Sub-tiles Grid */}
        <Grid container spacing={1.5}>
          {currentSubTiles.map((module, index) => (
            <Grid item xs={12} sm={6} md={3} key={module.id}>
              <Zoom in timeout={200 + index * 50}>
                <Card
                  sx={{
                    height: 200,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    borderRadius: 3,
                    position: 'relative',
                    bgcolor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 20px 40px ${alpha(module.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                      '& .module-icon': { transform: 'scale(1.1)', bgcolor: module.color, color: 'white' },
                      '& .module-arrow': { opacity: 1, transform: 'translateX(4px)' },
                    },
                  }}
                  onClick={() => handleSubTileClick(module.id)}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Avatar className="module-icon" sx={{ width: 40, height: 40, bgcolor: alpha(module.color, 0.1), color: module.color, transition: 'all 0.3s ease' }}>
                        <module.icon sx={{ fontSize: 22 }} />
                      </Avatar>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: module.color, mb: 0.5, fontSize: '0.9rem' }}>{module.title}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>{module.subtitle}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{module.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(module.color, 0.1) }}>
                      <Chip label={`${module.stats.value} ${module.stats.label}`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(module.color, 0.08), color: module.color, fontWeight: 600 }} />
                      <ArrowForwardIcon className="module-arrow" sx={{ color: module.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Render Manufacturing 6-layer view
  if (view === 'manufacturing') {
    return (
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto', background: 'linear-gradient(180deg, rgba(219, 234, 254, 0.1) 0%, rgba(255, 255, 255, 1) 50%)' }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
                CORE.AI
              </Link>
              <Link component="button" variant="body1" onClick={handleBackToCategories} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
                STOX.AI
              </Link>
              <Typography color="primary" variant="body1" fontWeight={600}>Manufacturing</Typography>
            </Breadcrumbs>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBackToCategories} variant="outlined" size="small">Back</Button>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 4, height: 60, bgcolor: MODULE_COLOR, borderRadius: 2 }} />
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: MODULE_COLOR }}><FactoryIcon sx={{ fontSize: 18 }} /></Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ color: MODULE_COLOR }}>STOX.AI (MANUFACTURING)</Typography>
                <Chip label="6-Layer Architecture" size="small" sx={{ bgcolor: alpha(MODULE_COLOR, 0.1), color: MODULE_COLOR, fontWeight: 600, fontSize: '0.7rem' }} />
              </Stack>
              <Typography variant="body2" color="text.secondary">Plant & Supply Chain Optimization Platform</Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={1.5}>
          {layerTiles.map((layer, index) => (
            <Grid item xs={12} sm={6} md={3} key={layer.id}>
              <Zoom in timeout={200 + index * 50}>
                <Card
                  sx={{
                    height: 200,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    borderRadius: 3,
                    position: 'relative',
                    bgcolor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 20px 40px ${alpha(layer.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                      '& .layer-icon': { transform: 'scale(1.1)', bgcolor: layer.color, color: 'white' },
                      '& .layer-arrow': { opacity: 1, transform: 'translateX(4px)' },
                    },
                  }}
                  onClick={() => handleLayerClick(layer.id)}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Avatar className="layer-icon" sx={{ width: 40, height: 40, bgcolor: alpha(layer.color, 0.1), color: layer.color, transition: 'all 0.3s ease' }}>
                        <layer.icon sx={{ fontSize: 22 }} />
                      </Avatar>
                      <Chip label={`L${layer.layer}`} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: layer.color, color: 'white' }} />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: layer.color, mb: 0.5, fontSize: '0.9rem' }}>{layer.title}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>{layer.subtitle}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{layer.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(layer.color, 0.1) }}>
                      <Chip icon={<LayersIcon sx={{ fontSize: 12 }} />} label={`${layer.tileCount} ${layer.tileCount === 1 ? 'Module' : 'Modules'}`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(layer.color, 0.08), color: layer.color, fontWeight: 600, '& .MuiChip-icon': { color: layer.color } }} />
                      <ArrowForwardIcon className="layer-arrow" sx={{ color: layer.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <LightbulbIcon sx={{ color: 'warning.main' }} />
            <Typography variant="body2" color="text.secondary">
              Navigate through the 6-layer architecture: Foundation → Diagnostics → Prediction → Optimization → Sandbox → Execution
            </Typography>
          </Stack>
        </Box>
      </Box>
    );
  }

  // Render main categories view (RETAIL and MANUFACTURING)
  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', background: 'linear-gradient(180deg, rgba(219, 234, 254, 0.1) 0%, rgba(255, 255, 255, 1) 50%)' }}>
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
              CORE.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>STOX.AI</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 4, height: 60, bgcolor: MODULE_COLOR, borderRadius: 2 }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: MODULE_COLOR }}><InventoryIcon sx={{ fontSize: 18 }} /></Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ color: MODULE_COLOR }}>STOX.AI</Typography>
              <Chip label="2 Modules" size="small" sx={{ bgcolor: alpha('#0078d4', 0.1), color: MODULE_COLOR, fontWeight: 600, fontSize: '0.7rem' }} />
            </Stack>
            <Typography variant="body2" color="text.secondary">Smart Inventory & Supply Chain Optimization Platform</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Category Tiles */}
      <Grid container spacing={1.5}>
        {categoryTiles.map((category, index) => (
          <Grid item xs={12} sm={6} md={3} key={category.id}>
            <Zoom in timeout={200 + index * 100}>
              <Card
                sx={{
                  height: 200,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  borderRadius: 3,
                  position: 'relative',
                  bgcolor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 20px 40px ${alpha(category.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                    '& .category-icon': { transform: 'scale(1.1)', bgcolor: category.color, color: 'white' },
                    '& .category-arrow': { opacity: 1, transform: 'translateX(4px)' },
                  },
                }}
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Avatar className="category-icon" sx={{ width: 40, height: 40, bgcolor: alpha(category.color, 0.1), color: category.color, transition: 'all 0.3s ease' }}>
                      <category.icon sx={{ fontSize: 22 }} />
                    </Avatar>
                    <Chip label={`${category.stats.value} ${category.stats.label}`} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: category.color, color: 'white' }} />
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: category.color, mb: 0.5, fontSize: '0.9rem' }}>{category.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>{category.subtitle}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{category.description}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(category.color, 0.1) }}>
                    <Typography variant="body2" sx={{ color: category.color, fontWeight: 600, fontSize: '0.7rem' }}>Explore</Typography>
                    <ArrowForwardIcon className="category-arrow" sx={{ color: category.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <LightbulbIcon sx={{ color: 'warning.main' }} />
          <Typography variant="body2" color="text.secondary">
            Choose Retail for store & DC optimization or Manufacturing for plant-level supply chain management
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default StoxAILanding;
