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
  alpha,
  Zoom,
} from '@mui/material';
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
} from '@mui/icons-material';

// 6 Layer Tiles for the main landing page (removed Command Center/Layer 0)
// All tiles use blue color palette for consistency
const layerTiles = [
  {
    id: 'layer-1',
    layer: 1,
    title: 'Foundation',
    subtitle: 'Data & Visibility',
    description: 'Real-time inventory visibility across plants, suppliers, and network with SAP integration',
    icon: StorageIcon,
    color: '#0078d4',
    bgColor: '#deecf9',
    gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    tileCount: 4,
  },
  {
    id: 'layer-2',
    layer: 2,
    title: 'Diagnostics',
    subtitle: 'Health & Patterns',
    description: 'Analyze inventory health, detect anomalies, and classify demand patterns with AI insights',
    icon: HealthAndSafetyIcon,
    color: '#0078d4',
    bgColor: '#deecf9',
    gradient: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
    tileCount: 4,
  },
  {
    id: 'layer-3',
    layer: 3,
    title: 'Prediction',
    subtitle: 'Forecasting',
    description: 'AI-powered demand forecasting with multiple models, accuracy tracking, and confidence intervals',
    icon: TrendingUpIcon,
    color: '#106ebe',
    bgColor: '#deecf9',
    gradient: 'linear-gradient(135deg, #106ebe 0%, #0078d4 100%)',
    tileCount: 1,
  },
  {
    id: 'layer-4',
    layer: 4,
    title: 'Optimization',
    subtitle: 'Parameters & Costs',
    description: 'AI-driven safety stock, reorder point optimization, and cost policy management',
    icon: TuneIcon,
    color: '#106ebe',
    bgColor: '#deecf9',
    gradient: 'linear-gradient(135deg, #106ebe 0%, #0078d4 100%)',
    tileCount: 4,
  },
  {
    id: 'layer-5',
    layer: 5,
    title: 'Sandbox',
    subtitle: 'Simulation & Tuning',
    description: 'Interactive parameter tuning, what-if scenarios, and impact simulation',
    icon: PsychologyIcon,
    color: '#0078d4',
    bgColor: '#deecf9',
    gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    tileCount: 2,
  },
  {
    id: 'layer-6',
    layer: 6,
    title: 'Execution',
    subtitle: 'Actions & Monitoring',
    description: 'AI recommendations, SAP writeback, and performance monitoring with feedback loop',
    icon: RocketLaunchIcon,
    color: '#005a9e',
    bgColor: '#deecf9',
    gradient: 'linear-gradient(135deg, #005a9e 0%, #0078d4 100%)',
    tileCount: 5,
  },
];

// Sub-tiles organized by layer - all using blue color palette
const subTilesByLayer = {
  'layer-1': [
    {
      id: 'sap-data-hub',
      title: 'SAP Data Hub',
      subtitle: 'Layer 1 - Infrastructure',
      description: 'Monitor SAP system connections, data quality scores, extraction jobs, and ODQ delta queues',
      icon: HubIcon,
      color: '#005a9e',
      bgColor: '#deecf9',
      stats: { label: 'Systems', value: '4' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #005a9e 0%, #0078d4 100%)',
    },
    {
      id: 'plant-inventory-intelligence',
      title: 'Plant Inventory Intelligence',
      subtitle: 'Layer 1 - Foundation',
      description: 'Plant-level inventory analytics, SLOB analysis, GMROI tracking, and ABC/XYZ segmentation',
      icon: FactoryIcon,
      color: '#0078d4',
      bgColor: '#deecf9',
      stats: { label: 'Plants', value: '4' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    },
    {
      id: 'supply-lead-time',
      title: 'Supply & Lead Time',
      subtitle: 'Layer 1 - Procurement',
      description: 'Vendor lead time analysis, OTD tracking, variability metrics, and safety stock recommendations',
      icon: ScheduleIcon,
      color: '#106ebe',
      bgColor: '#deecf9',
      stats: { label: 'Vendors', value: '8' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #106ebe 0%, #0078d4 100%)',
    },
    {
      id: 'supply-chain-map',
      title: 'Supply Chain Map',
      subtitle: 'Layer 1 - Network Visibility',
      description: 'Real-time fleet tracking, inventory monitoring, and AI-powered supply chain optimization',
      icon: MapIcon,
      color: '#106ebe',
      bgColor: '#deecf9',
      stats: { label: 'Live Tracking', value: '24/7' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #106ebe 0%, #0078d4 100%)',
    },
  ],
  'layer-2': [
    {
      id: 'inventory-health-check',
      title: 'Inventory Health Check',
      subtitle: 'Layer 2 - Diagnostics',
      description: 'SKU-level health scores, excess analysis, coverage metrics, and ABC/XYZ classification',
      icon: HealthAndSafetyIcon,
      color: '#106ebe',
      bgColor: '#deecf9',
      stats: { label: 'SKUs', value: '12' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #106ebe 0%, #0078d4 100%)',
    },
    {
      id: 'working-capital-baseline',
      title: 'Working Capital Baseline',
      subtitle: 'Layer 2.5 - Cash Position',
      description: 'Establish cash position by SKU × Plant with WC decomposition (Cycle, Safety, Pipeline, Excess)',
      icon: AccountBalanceIcon,
      color: '#2b88d8',
      bgColor: '#deecf9',
      stats: { label: 'WC Tied', value: '$2.8M' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #2b88d8 0%, #106ebe 100%)',
    },
    {
      id: 'tile0-forecast-simulation',
      title: 'Inventory Health Dashboard',
      subtitle: 'Layer 2 - Analytics',
      description: 'Compare AI models (ARIMA, ETS, ML), override forecasts, and confirm baseline for optimization',
      icon: ScienceIcon,
      color: '#005a9e',
      bgColor: '#deecf9',
      stats: { label: 'Models', value: '3' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #005a9e 0%, #0078d4 100%)',
    },
    {
      id: 'demand-intelligence',
      title: 'Demand Intelligence',
      subtitle: 'Layer 2 - Patterns',
      description: 'Analyze demand patterns, detect anomalies, and manage ABC/XYZ classification with AI insights',
      icon: ShowChartIcon,
      color: '#0078d4',
      bgColor: '#deecf9',
      stats: { label: 'Patterns', value: '6' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    },
  ],
  'layer-3': [
    {
      id: 'forecasting-engine',
      title: 'Forecasting Engine',
      subtitle: 'Layer 3 - Prediction',
      description: 'AI-powered demand forecasting with model selection, accuracy tracking, and confidence intervals',
      icon: AnalyticsIcon,
      color: '#0078d4',
      bgColor: '#deecf9',
      stats: { label: 'Models', value: '6' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    },
  ],
  'layer-4': [
    {
      id: 'cost-policy-engine',
      title: 'Cost Policy Engine',
      subtitle: 'Layer 4 - Costing',
      description: 'Manage cost methods, inventory policies, EOQ parameters, and holding costs',
      icon: AttachMoneyIcon,
      color: '#005a9e',
      bgColor: '#deecf9',
      stats: { label: 'Policies', value: '12' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #005a9e 0%, #0078d4 100%)',
    },
    {
      id: 'cost-configuration',
      title: 'Cost Configuration',
      subtitle: 'Layer 4 - Economics',
      description: 'Configure customer-specific cost economics: holding costs, ordering costs, and stockout costs',
      icon: SettingsIcon,
      color: '#106ebe',
      bgColor: '#deecf9',
      stats: { label: 'Parameters', value: '15' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #106ebe 0%, #2b88d8 100%)',
    },
    {
      id: 'mrp-parameter-optimizer',
      title: 'MRP Parameter Optimizer',
      subtitle: 'Layer 4 - Optimization',
      description: 'AI-driven safety stock and reorder point optimization with savings analysis',
      icon: TuneIcon,
      color: '#0078d4',
      bgColor: '#deecf9',
      stats: { label: 'Optimizations', value: '24' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    },
    {
      id: 'supplier-terms-impact',
      title: 'Supplier Terms Impact',
      subtitle: 'Layer 4.5 - Terms Analysis',
      description: 'Analyze payment terms impact on WC: consignment, Net 30/60/90, early pay discounts',
      icon: ScheduleIcon,
      color: '#106ebe',
      bgColor: '#deecf9',
      stats: { label: 'Suppliers', value: '10' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #106ebe 0%, #0078d4 100%)',
    },
  ],
  'layer-5': [
    {
      id: 'mrp-parameter-tuner',
      title: 'MRP Parameter Tuner',
      subtitle: 'Layer 5 - Fine-Tuning',
      description: 'Interactive parameter tuning with sliders, real-time simulation, and impact preview',
      icon: SettingsIcon,
      color: '#005a9e',
      bgColor: '#deecf9',
      stats: { label: 'Parameters', value: '48' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #005a9e 0%, #0078d4 100%)',
    },
    {
      id: 'what-if-simulator',
      title: 'What-If Simulator',
      subtitle: 'Layer 5 - Scenarios',
      description: 'Run scenario simulations to analyze impact on service levels, costs, and inventory',
      icon: PlayCircleIcon,
      color: '#0078d4',
      bgColor: '#deecf9',
      stats: { label: 'Scenarios', value: '8' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    },
  ],
  'layer-6': [
    {
      id: 'cfo-rollup-dashboard',
      title: 'CFO Rollup Dashboard',
      subtitle: 'Layer 6 - Executive View',
      description: 'Executive summary of Working Capital, cash release potential, and risk-adjusted savings',
      icon: AccountBalanceIcon,
      color: '#106ebe',
      bgColor: '#deecf9',
      stats: { label: 'WC Tied', value: '$12.8M' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #106ebe 0%, #2b88d8 100%)',
    },
    {
      id: 'cash-release-timeline',
      title: 'Cash Release Timeline',
      subtitle: 'Layer 6 - Project Tracking',
      description: 'Track cash release initiatives over time with Gantt-style timeline and confidence metrics',
      icon: ScheduleIcon,
      color: '#106ebe',
      bgColor: '#deecf9',
      stats: { label: 'Initiatives', value: '8' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #106ebe 0%, #0078d4 100%)',
    },
    {
      id: 'recommendations-hub',
      title: 'Recommendations Hub',
      subtitle: 'Layer 6 - AI Insights',
      description: 'AI-powered recommendations for inventory optimization with approval workflow',
      icon: RecommendIcon,
      color: '#0078d4',
      bgColor: '#deecf9',
      stats: { label: 'Recommendations', value: '15' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    },
    {
      id: 'sap-writeback',
      title: 'SAP Writeback',
      subtitle: 'Layer 6 - Integration',
      description: 'Monitor and manage parameter updates pushed to SAP systems',
      icon: CloudSyncIcon,
      color: '#2b88d8',
      bgColor: '#deecf9',
      stats: { label: 'Jobs', value: '12' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #2b88d8 0%, #0078d4 100%)',
    },
    {
      id: 'performance-monitor',
      title: 'Performance Monitor',
      subtitle: 'Layer 6 - Feedback Loop',
      description: 'Track KPIs, service levels, inventory turns, and optimization performance',
      icon: SpeedIcon,
      color: '#005a9e',
      bgColor: '#deecf9',
      stats: { label: 'KPIs', value: '20' },
      status: 'active',
      gradient: 'linear-gradient(135deg, #005a9e 0%, #0078d4 100%)',
    },
  ],
};

const StoxAILanding = ({ onTileClick, onBack }) => {
  const [selectedLayer, setSelectedLayer] = useState(null);

  const handleLayerClick = (layerId) => {
    setSelectedLayer(layerId);
  };

  const handleSubTileClick = (moduleId) => {
    if (onTileClick) {
      onTileClick(moduleId);
    }
  };

  const handleBackToLayers = () => {
    setSelectedLayer(null);
  };

  const currentLayer = layerTiles.find(l => l.id === selectedLayer);
  const currentSubTiles = selectedLayer ? subTilesByLayer[selectedLayer] : [];

  // Render sub-tiles for selected layer
  if (selectedLayer) {
    return (
      <Box sx={{
        p: 3,
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'linear-gradient(180deg, rgba(219, 234, 254, 0.1) 0%, rgba(255, 255, 255, 1) 50%)',
      }}>
        {/* Header with Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link
                component="button"
                variant="body1"
                onClick={onBack}
                sx={{
                  textDecoration: 'none',
                  color: 'text.primary',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                CORE.AI
              </Link>
              <Link
                component="button"
                variant="body1"
                onClick={handleBackToLayers}
                sx={{
                  textDecoration: 'none',
                  color: 'text.primary',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                STOX.AI
              </Link>
              <Typography color="primary" variant="body1" fontWeight={600}>
                Layer {currentLayer?.layer}: {currentLayer?.title}
              </Typography>
            </Breadcrumbs>

            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToLayers}
              variant="outlined"
              size="small"
              sx={{ borderColor: 'divider' }}
            >
              Back to Layers
            </Button>
          </Stack>

          {/* Layer Identity Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              width: 4,
              height: 60,
              background: currentLayer?.gradient,
              borderRadius: 2
            }} />
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: currentLayer?.color }}>
                  {currentLayer && <currentLayer.icon sx={{ fontSize: 18 }} />}
                </Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px', color: currentLayer?.color }}>
                  Layer {currentLayer?.layer}: {currentLayer?.title}
                </Typography>
                <Chip
                  label={`${currentSubTiles.length} Modules`}
                  size="small"
                  sx={{
                    bgcolor: alpha(currentLayer?.color || '#0078d4', 0.1),
                    color: currentLayer?.color,
                    fontWeight: 600,
                    fontSize: '0.7rem'
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                {currentLayer?.description}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Sub-tiles Grid */}
        <Grid container spacing={1.5}>
          {currentSubTiles.map((module, index) => (
            <Grid item xs={12} sm={6} md={3} lg={3} key={module.id}>
              <Zoom in timeout={200 + index * 50}>
                <Card
                  sx={{
                    height: 200,
                    cursor: module.status === 'active' ? 'pointer' : 'default',
                    opacity: module.status === 'coming-soon' ? 0.7 : 1,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid',
                    borderColor: alpha(module.color, 0.15),
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: module.gradient,
                      opacity: 0.8,
                    },
                    '&:hover': module.status === 'active' ? {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha(module.color, 0.15)}`,
                      borderColor: module.color,
                      '& .module-icon': {
                        transform: 'scale(1.15)',
                        bgcolor: module.color,
                        color: 'white',
                      },
                      '& .module-arrow': {
                        opacity: 1,
                        transform: 'translateX(4px)',
                      },
                    } : {},
                  }}
                  onClick={() => module.status === 'active' && handleSubTileClick(module.id)}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Icon and Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Avatar
                        className="module-icon"
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: alpha(module.color, 0.1),
                          color: module.color,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <module.icon sx={{ fontSize: 22 }} />
                      </Avatar>
                      {module.status === 'coming-soon' && (
                        <Chip label="Soon" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#64748b', 0.1), color: '#64748b', fontWeight: 600 }} />
                      )}
                    </Box>

                    {/* Title */}
                    <Typography variant="body1" sx={{ fontWeight: 700, color: module.color, mb: 0.5, fontSize: '0.9rem', lineHeight: 1.3 }}>
                      {module.title}
                    </Typography>

                    {/* Subtitle */}
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>
                      {module.subtitle}
                    </Typography>

                    {/* Description */}
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {module.description}
                    </Typography>

                    {/* Footer */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(module.color, 0.1) }}>
                      <Chip label={`${module.stats.value} ${module.stats.label}`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(module.color, 0.08), color: module.color, fontWeight: 600 }} />
                      {module.status === 'active' && (
                        <ArrowForwardIcon className="module-arrow" sx={{ color: module.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                      )}
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

  // Render main 6-layer landing page
  return (
    <Box sx={{
      p: 3,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: 'linear-gradient(180deg, rgba(219, 234, 254, 0.1) 0%, rgba(255, 255, 255, 1) 50%)',
    }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              CORE.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              STOX.AI
            </Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            size="small"
            sx={{ borderColor: 'divider' }}
          >
            Back
          </Button>
        </Stack>

        {/* System Identity Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{
            width: 4,
            height: 60,
            background: 'linear-gradient(180deg, #0078d4 0%, #106ebe 100%)',
            borderRadius: 2
          }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#0078d4' }}>
                <InventoryIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px', color: '#0078d4' }}>
                STOX.AI
              </Typography>
              <Chip
                label="7-Layer Architecture"
                size="small"
                sx={{
                  bgcolor: alpha('#0078d4', 0.1),
                  color: '#0078d4',
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Smart Inventory & Supply Chain Optimization Platform
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 6 Layer Tiles */}
      <Grid container spacing={1.5}>
        {layerTiles.map((layer, index) => (
          <Grid item xs={12} sm={6} md={3} lg={3} key={layer.id}>
            <Zoom in timeout={200 + index * 50}>
              <Card
                sx={{
                  height: 200,
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid',
                  borderColor: alpha(layer.color, 0.15),
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: layer.gradient,
                    opacity: 0.8,
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${alpha(layer.color, 0.15)}`,
                    borderColor: layer.color,
                    '& .layer-icon': {
                      transform: 'scale(1.15)',
                      bgcolor: layer.color,
                      color: 'white',
                    },
                    '& .layer-arrow': {
                      opacity: 1,
                      transform: 'translateX(4px)',
                    },
                  },
                }}
                onClick={() => handleLayerClick(layer.id)}
              >
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Layer Number Badge & Icon */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Avatar
                      className="layer-icon"
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(layer.color, 0.1),
                        color: layer.color,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <layer.icon sx={{ fontSize: 22 }} />
                    </Avatar>
                    <Chip
                      label={`L${layer.layer}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: layer.color,
                        color: 'white',
                      }}
                    />
                  </Box>

                  {/* Title */}
                  <Typography variant="body1" sx={{ fontWeight: 700, color: layer.color, mb: 0.5, fontSize: '0.9rem', lineHeight: 1.3 }}>
                    {layer.title}
                  </Typography>

                  {/* Subtitle */}
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>
                    {layer.subtitle}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {layer.description}
                  </Typography>

                  {/* Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(layer.color, 0.1) }}>
                    <Chip
                      icon={<LayersIcon sx={{ fontSize: 12 }} />}
                      label={`${layer.tileCount} ${layer.tileCount === 1 ? 'Module' : 'Modules'}`}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.65rem',
                        bgcolor: alpha(layer.color, 0.08),
                        color: layer.color,
                        fontWeight: 600,
                        '& .MuiChip-icon': { color: layer.color }
                      }}
                    />
                    <ArrowForwardIcon className="layer-arrow" sx={{ color: layer.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Info Section */}
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
};

export default StoxAILanding;
