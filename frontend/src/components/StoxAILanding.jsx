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
  Science as ScienceIcon,
} from '@mui/icons-material';

const dcSystemModules = [
  {
    id: 'dc-demand-aggregation',
    title: 'Forecast Layer',
    subtitle: 'DC Module 1',
    description: 'Aggregate demand forecasts from all store locations and channels for centralized planning',
    icon: TrendingUpIcon,
    color: '#64748b',
    bgColor: '#f1f5f9',
    stats: { label: 'Locations', value: '450' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    view: 'dc'
  },
  {
    id: 'dc-health-monitor',
    title: 'Health Monitor',
    subtitle: 'DC Module 2',
    description: 'Real-time visibility into DC inventory health, stock levels, and availability across network',
    icon: ShowChartIcon,
    color: '#475569',
    bgColor: '#e2e8f0',
    stats: { label: 'DCs', value: '8' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    view: 'dc'
  },
  {
    id: 'dc-optimization',
    title: 'Safety Stox Layer',
    subtitle: 'DC Module 3',
    description: 'Optimize inventory positioning and allocation across distribution center network',
    icon: AnalyticsIcon,
    color: '#334155',
    bgColor: '#cbd5e1',
    stats: { label: 'SKUs', value: '12K' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
    view: 'dc'
  },
  {
    id: 'dc-bom',
    title: 'Bill of Materials',
    subtitle: 'DC Module 4',
    description: 'Multi-level BOM management and component tracking for finished goods assembly',
    icon: AccountTreeIcon,
    color: '#1e293b',
    bgColor: '#cbd5e1',
    stats: { label: 'BOMs', value: '2.1K' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    view: 'dc'
  },
  {
    id: 'dc-lot-size',
    title: 'Lot Size Optimization',
    subtitle: 'DC Module 5',
    description: 'Economic order quantity and lot size optimization for procurement efficiency',
    icon: InventoryIcon,
    color: '#0f172a',
    bgColor: '#cbd5e1',
    stats: { label: 'Orders', value: '850' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
    view: 'dc'
  },
  {
    id: 'dc-supplier-exec',
    title: 'Supplier Execution',
    subtitle: 'DC Module 6',
    description: 'Supplier collaboration portal with order tracking, delivery management, and performance metrics',
    icon: LocalShippingIcon,
    color: '#020617',
    bgColor: '#cbd5e1',
    stats: { label: 'Suppliers', value: '120' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #020617 0%, #000000 100%)',
    view: 'dc'
  },
  {
    id: 'dc-financial-impact',
    title: 'Financial Impact',
    subtitle: 'DC Module 7',
    description: 'Distribution center financial impact analysis with inventory carrying costs and network optimization opportunities',
    icon: AnalyticsIcon,
    color: '#64748b',
    bgColor: '#f1f5f9',
    stats: { label: 'Savings', value: '$24M' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    view: 'dc'
  },
];

const storeSystemModules = [
  {
    id: 'tile0-forecast-simulation',
    title: 'Forecast Simulation',
    subtitle: 'Tile 0',
    description: 'Compare AI models (ARIMA, ETS, ML), override forecasts, and confirm baseline for Tile 1',
    icon: ScienceIcon,
    color: '#8b5cf6',
    bgColor: '#f3e8ff',
    stats: { label: 'Models', value: '3' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    view: 'store'
  },
  {
    id: 'store-forecasting',
    title: 'Demand Forecasting',
    subtitle: 'Tile 1',
    description: 'Confirmed forecast baseline with volatility, price, cost, and margin data for inventory planning',
    icon: TrendingUpIcon,
    color: '#3b82f6',
    bgColor: '#dbeafe',
    stats: { label: 'Forecasts', value: '36' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    view: 'store'
  },
  {
    id: 'store-health-monitor',
    title: 'Inventory Health',
    subtitle: 'Tile 2',
    description: 'Measure inventory adequacy vs. forecast, compute safety stock, ROP, and stockout risk',
    icon: ShowChartIcon,
    color: '#10b981',
    bgColor: '#d1fae5',
    stats: { label: 'Items', value: '36' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    view: 'store'
  },
  {
    id: 'store-financial-impact',
    title: 'Financial Impact',
    subtitle: 'Tile 3',
    description: 'Quantify financial value with GMROI, avoided margin, carrying costs, and net value calculations',
    icon: AnalyticsIcon,
    color: '#f59e0b',
    bgColor: '#fef3c7',
    stats: { label: 'Value', value: '$2.5M' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    view: 'store'
  },
  {
    id: 'store-replenishment',
    title: 'Stock Transfer Execution',
    subtitle: 'Tile 4',
    description: 'Match store demand to best DC based on availability, freight cost, ETA - create STO/PR in SAP',
    icon: LocalShippingIcon,
    color: '#2563eb',
    bgColor: '#dbeafe',
    stats: { label: 'STOs', value: '36' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    view: 'store'
  },
];

const stoxModules = [];

const StoxAILanding = ({ onTileClick, onBack, onCategorySelect, initialView = null }) => {
  const theme = useTheme();
  const [selectedView, setSelectedView] = React.useState(initialView);

  console.log('StoxAILanding rendering, props:', { hasOnTileClick: !!onTileClick, hasOnBack: !!onBack, initialView });

  const handleTileClick = (moduleId) => {
    console.log('handleTileClick called with moduleId:', moduleId);
    if (onTileClick) {
      console.log('Calling parent onTileClick with:', moduleId);
      onTileClick(moduleId);
    } else {
      console.warn('No onTileClick handler provided');
    }
  };

  const handleViewSelect = (view) => {
    setSelectedView(view);
    // Notify parent component about category selection
    if (onCategorySelect) {
      onCategorySelect(view);
    }
  };

  const handleBackToCategories = () => {
    setSelectedView(null);
  };

  // Show category selection view
  if (!selectedView) {
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

        {/* Category Tiles - Compact */}
        <Grid container spacing={3} sx={{ mt: 1, maxWidth: 1000, mx: 'auto' }}>
          {/* Store Level View */}
          <Grid item xs={12} md={6}>
            <Zoom in timeout={400}>
              <Card
                sx={{
                  height: 220,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid',
                  borderColor: alpha('#3b82f6', 0.2),
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(255, 255, 255, 1) 100%)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                  },
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 32px rgba(59, 130, 246, 0.2)',
                    borderColor: '#3b82f6',
                    '& .category-icon': {
                      transform: 'scale(1.1)',
                      bgcolor: '#3b82f6',
                      color: 'white',
                    },
                    '& .access-button': {
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      transform: 'translateX(4px)',
                    },
                  },
                }}
                onClick={() => handleViewSelect('store')}
              >
                <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Icon and Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      className="category-icon"
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: alpha('#3b82f6', 0.1),
                        color: '#3b82f6',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <StoreIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Chip
                      label="4 Modules"
                      size="small"
                      sx={{
                        bgcolor: alpha('#3b82f6', 0.1),
                        color: '#3b82f6',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24,
                      }}
                    />
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6', mb: 1, fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
                    Store Level View
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.5, fontSize: '0.85rem' }}>
                    End-to-end supply chain optimization from demand forecasting to procurement
                  </Typography>

                  {/* Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid', borderColor: alpha('#3b82f6', 0.1) }}>
                    <Box className="access-button" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6', px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, fontSize: '0.75rem', transition: 'all 0.3s ease' }}>
                      ENTER
                      <ArrowForwardIcon sx={{ fontSize: 14 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Distribution Center System */}
          <Grid item xs={12} md={6}>
            <Zoom in timeout={500}>
              <Card
                sx={{
                  height: 220,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid',
                  borderColor: alpha('#64748b', 0.2),
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.02) 0%, rgba(255, 255, 255, 1) 100%)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #94a3b8 0%, #64748b 100%)',
                  },
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 32px rgba(100, 116, 139, 0.2)',
                    borderColor: '#64748b',
                    '& .dc-icon': {
                      transform: 'scale(1.1)',
                      bgcolor: '#64748b',
                      color: 'white',
                    },
                    '& .access-button': {
                      background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                      color: 'white',
                      transform: 'translateX(4px)',
                    },
                  },
                }}
                onClick={() => handleViewSelect('dc')}
              >
                <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Icon and badge at top */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      className="dc-icon"
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: alpha('#64748b', 0.1),
                        color: '#64748b',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <WarehouseIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Chip
                      label="7 Modules"
                      size="small"
                      sx={{
                        bgcolor: alpha('#64748b', 0.1),
                        color: '#475569',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24,
                      }}
                    />
                  </Box>

                  {/* Title and description */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#64748b',
                        mb: 1,
                        fontSize: '1.1rem',
                        letterSpacing: '-0.3px',
                      }}
                    >
                      Distribution Center System
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mb: 'auto',
                        lineHeight: 1.5,
                        fontSize: '0.85rem',
                      }}
                    >
                      Comprehensive DC operations and network optimization capabilities
                    </Typography>
                  </Box>

                  {/* Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid', borderColor: alpha('#64748b', 0.1) }}>
                    <Box
                      className="access-button"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: alpha('#64748b', 0.1),
                        color: '#64748b',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      ENTER
                      <ArrowForwardIcon sx={{ fontSize: 14 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
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
  }

  // Show module tiles for selected view
  const isStoreView = selectedView === 'store';
  const systemColor = isStoreView ? '#3b82f6' : '#64748b';
  const systemBg = isStoreView ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';

  return (
    <Box sx={{
      p: 3,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: isStoreView ? 'linear-gradient(180deg, rgba(219, 234, 254, 0.1) 0%, rgba(255, 255, 255, 1) 50%)' : 'linear-gradient(180deg, rgba(241, 245, 249, 0.2) 0%, rgba(255, 255, 255, 1) 50%)',
    }}>
      {/* Header with Visual Identity */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
              CORE.AI
            </Link>
            <Link component="button" variant="body1" onClick={handleBackToCategories} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
              STOX.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              {isStoreView ? 'Store Level' : 'Distribution Center'}
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToCategories} variant="outlined" size="small" sx={{ borderColor: 'divider' }}>
            Back
          </Button>
        </Stack>

        {/* System Identity Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{
            width: 4,
            height: 60,
            background: isStoreView ? 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(180deg, #64748b 0%, #475569 100%)',
            borderRadius: 2
          }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: systemColor }}>
                {isStoreView ? <StoreIcon sx={{ fontSize: 18 }} /> : <WarehouseIcon sx={{ fontSize: 18 }} />}
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px', color: systemColor }}>
                {isStoreView ? 'Store Level View' : 'Distribution Center System'}
              </Typography>
              <Chip
                label={isStoreView ? '4 Modules' : '6 Modules'}
                size="small"
                sx={{
                  bgcolor: alpha(systemColor, 0.1),
                  color: systemColor,
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              {isStoreView ? 'Retail location demand planning and inventory optimization' : 'Network-level supply chain orchestration and fulfillment'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Compact Module Tiles */}
      <Grid container spacing={1.5}>
        {(selectedView === 'dc' ? dcSystemModules : selectedView === 'store' ? storeSystemModules : []).map((module, index) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={module.id}>
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
                onClick={() => module.status === 'active' && handleTileClick(module.id)}
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