import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Stack,
  Button,
  Breadcrumbs,
  Link,
  alpha,
  useTheme,
  Fade,
  Zoom,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Lightbulb as LightbulbIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Layers as LayersIcon,
  AccountTree as AccountTreeIcon,
  LocalShipping as LocalShippingIcon,
  Store as StoreIcon,
  ShowChart as ShowChartIcon,
  SwapHoriz as SwapHorizIcon,
  Factory as FactoryIcon,
  Warehouse as WarehouseIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

const stoxModules = [
  {
    id: 'demand-workbench',
    title: 'STOX Demand Workbench',
    subtitle: 'Unified Demand Forecasting',
    description: 'Unified interface for Store, Online, and B2B demand forecasting with AI-driven insights and what-if scenarios',
    icon: DashboardIcon,
    color: '#3F51B5',
    bgColor: '#E8EAF6',
    stats: { label: 'Forecasts', value: '1.2K' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #3F51B5 0%, #5C6BC0 100%)',
    metadata: {
      users: 'Demand Planners, Category Managers',
      features: 'Forecast overrides, promotion modeling, accuracy metrics',
      integration: 'STOX.AI API, S/4HANA MD04, /IBP/TIME',
      updateFreq: 'Real-time (15-min refresh)'
    }
  },
  {
    id: 'demand-flow',
    title: 'Sell-Through to Sell-In Bridge',
    subtitle: 'Module 0: Demand Flow',
    description: 'Visualize complete demand flow from consumer POS to shipment forecasts across all channels with end-to-end traceability',
    icon: SwapHorizIcon,
    color: '#06b6d4',
    bgColor: '#cffafe',
    stats: { label: 'Channels', value: '4' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    metadata: {
      users: 'Demand Planners, Supply Chain Analysts',
      features: 'POS integration, partner EDI feeds, sell-through tracking',
      integration: 'VBRK/VBRP, VBAK/VBAP, Partner EDI, TVTWT',
      updateFreq: 'Real-time (15-min refresh)'
    }
  },
  {
    id: 'demand-forecasting',
    title: 'Multi-Channel Demand Forecasting',
    subtitle: 'Module 1: AI Forecasting',
    description: 'AI-driven forecasting from POS data across all sales channels with promotion modeling and accuracy tracking',
    icon: TrendingUpIcon,
    color: '#10b981',
    bgColor: '#d1fae5',
    stats: { label: 'Accuracy', value: '92%' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    metadata: {
      users: 'Demand Planners, Category Managers',
      features: 'ML models, promo impact, forecast collaboration, alerts',
      integration: 'VBRK/VBRP, MARA/MARC, KONV, T001W',
      updateFreq: 'Daily (overnight batch)'
    }
  },
  {
    id: 'outbound-replenishment',
    title: 'Store Replenishment Cockpit',
    subtitle: 'Module 2: Outbound Planning',
    description: 'DC to channels replenishment planning with store-level optimization, route planning, and stockout monitoring',
    icon: LocalShippingIcon,
    color: '#3b82f6',
    bgColor: '#dbeafe',
    stats: { label: 'Stores', value: '450' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    metadata: {
      users: 'Replenishment Planners, DC Managers',
      features: 'Store replenishment, route optimization, channel allocation',
      integration: 'MARD, LIKP/LIPS, MARC, T001W',
      updateFreq: 'Real-time (on-demand)'
    }
  },
  {
    id: 'dc-inventory',
    title: 'DC Inventory Cockpit',
    subtitle: 'Module 3: DC Optimization',
    description: 'Central hub inventory management with working capital optimization, ATP visibility, and E&O management',
    icon: WarehouseIcon,
    color: '#f59e0b',
    bgColor: '#fef3c7',
    stats: { label: 'Turns', value: '10x' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    metadata: {
      users: 'Inventory Managers, CFO Team',
      features: 'DC visibility, working capital dashboard, slow-moving analysis',
      integration: 'MARD, EKKO/EKPO, RESB, MBEW',
      updateFreq: 'Real-time (live dashboard)'
    }
  },
  {
    id: 'supply-planning',
    title: 'Supply Requirements Dashboard',
    subtitle: 'Module 4: Inbound Planning',
    description: 'DC to plant supply requirements with MRP integration, production scheduling, and capacity planning',
    icon: FactoryIcon,
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    stats: { label: 'SKUs', value: '8.5K' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    metadata: {
      users: 'Supply Planners, Production Planners',
      features: 'MRP accelerator, production scheduling, planned orders',
      integration: 'MD04, PLAF, AFKO/AFPO, MARC, CM01',
      updateFreq: 'Weekly (planning cycle)'
    }
  },
  {
    id: 'bom-explosion',
    title: 'BOM Explosion Analyzer',
    subtitle: 'Module 5: Component Planning',
    description: 'Multi-level BOM explosion showing component requirements across finished goods with where-used analysis',
    icon: AccountTreeIcon,
    color: '#ec4899',
    bgColor: '#fce7f3',
    stats: { label: 'BOMs', value: '2.1K' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    metadata: {
      users: 'Material Planners, Production Planners',
      features: 'Multi-level BOM, component tracker, BOM exceptions',
      integration: 'STPO, STKO, MAST, CS15, MD04',
      updateFreq: 'Real-time (MRP-driven)'
    }
  },
  {
    id: 'component-consolidation',
    title: 'Component Consolidation Engine',
    subtitle: 'Module 6: Procurement Optimization',
    description: 'Aggregate component requirements across all FGs for volume discounts and optimized procurement',
    icon: InventoryIcon,
    color: '#ef4444',
    bgColor: '#fee2e2',
    stats: { label: 'Savings', value: '20%' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    metadata: {
      users: 'Procurement Team, Supply Chain Managers',
      features: 'Consolidation engine, procurement optimization, supplier portal',
      integration: 'EBAN, EKKO/EKPO, EORD, LFA1, ME21N',
      updateFreq: 'Real-time (MRP execution)'
    }
  },
  {
    id: 'analytics-whatif',
    title: 'Executive KPI Dashboard',
    subtitle: 'Module 7: Analytics & What-If',
    description: 'Scenario planning, KPI monitoring, predictive analytics, and working capital optimization',
    icon: AnalyticsIcon,
    color: '#607D8B',
    bgColor: '#ECEFF1',
    stats: { label: 'MAPE', value: '12.5%' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #607D8B 0%, #78909C 100%)',
    metadata: {
      users: 'VP Supply Chain, C-Suite, Executives',
      features: 'What-if scenarios, KPI dashboard, predictive analytics, WC optimizer',
      integration: 'VBRK/VBRP, MARD, MBEW, Analytics Engine',
      updateFreq: 'Real-time (live dashboard)'
    }
  },
];

const StoxAILanding = ({ onTileClick, onBack }) => {
  const theme = useTheme();

  console.log('StoxAILanding rendering, props:', { hasOnTileClick: !!onTileClick, hasOnBack: !!onBack });

  const handleTileClick = (moduleId) => {
    console.log('handleTileClick called with moduleId:', moduleId);
    if (onTileClick) {
      console.log('Calling parent onTileClick with:', moduleId);
      onTileClick(moduleId);
    } else {
      console.warn('No onTileClick handler provided');
    }
  };

  return (
    <Box sx={{
      p: 3,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
          >
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

        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
            STOX.AI
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Smart Inventory & Supply Chain Optimization Platform
          </Typography>
        </Box>
      </Box>

      {/* Module Tiles */}
      <Grid container spacing={2}>
        {stoxModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={module.id}>
            <Zoom in timeout={300 + index * 100}>
              <Card
                sx={{
                  height: '100%',
                  cursor: module.status === 'active' ? 'pointer' : 'default',
                  opacity: module.status === 'coming-soon' ? 0.8 : 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  '&:hover': module.status === 'active' ? {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8],
                    borderColor: module.color,
                    '& .module-header': {
                      background: module.gradient,
                    },
                    '& .module-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                    '& .arrow-icon': {
                      transform: 'translateX(4px)',
                    },
                  } : {},
                }}
                onClick={() => module.status === 'active' && handleTileClick(module.id)}
              >
                <Box
                  className="module-header"
                  sx={{
                    height: 80,
                    background: `linear-gradient(135deg, ${module.bgColor} 0%, ${alpha(module.color, 0.1)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Avatar
                    className="module-icon"
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: 'white',
                      color: module.color,
                      transition: 'transform 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  >
                    <module.icon sx={{ fontSize: 28 }} />
                  </Avatar>
                  {module.status === 'coming-soon' && (
                    <Chip
                      label="Coming Soon"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>

                <CardContent sx={{ p: 1.5 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: module.color,
                      mb: 0.25,
                      fontSize: '0.95rem',
                    }}
                  >
                    {module.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      mb: 1,
                      fontSize: '0.7rem',
                    }}
                  >
                    {module.subtitle}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 1.5,
                      minHeight: 36,
                      lineHeight: 1.4,
                      fontSize: '0.75rem',
                    }}
                  >
                    {module.description}
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 'auto',
                  }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {module.stats.label}:
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color={module.color} sx={{ fontSize: '0.8rem' }}>
                        {module.stats.value}
                      </Typography>
                    </Stack>
                    {module.status === 'active' && (
                      <ArrowForwardIcon 
                        className="arrow-icon"
                        sx={{ 
                          color: module.color,
                          transition: 'transform 0.3s ease',
                        }} 
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Info Section */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <LightbulbIcon sx={{ color: 'warning.main' }} />
          <Typography variant="body2" color="text.secondary">
            STOX.AI provides intelligent inventory optimization and supply chain analytics powered by advanced AI/ML algorithms
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default StoxAILanding;