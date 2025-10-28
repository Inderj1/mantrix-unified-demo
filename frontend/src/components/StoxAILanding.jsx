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

const dcSystemModules = [
  {
    id: 'dc-demand-aggregation',
    title: 'Forecast Layer',
    subtitle: 'DC Module 1',
    description: 'Aggregate demand forecasts from all store locations and channels for centralized planning',
    icon: TrendingUpIcon,
    color: '#3b82f6',
    bgColor: '#dbeafe',
    stats: { label: 'Locations', value: '450' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    view: 'dc'
  },
  {
    id: 'dc-health-monitor',
    title: 'Health Monitor',
    subtitle: 'DC Module 2',
    description: 'Real-time visibility into DC inventory health, stock levels, and availability across network',
    icon: ShowChartIcon,
    color: '#2563eb',
    bgColor: '#dbeafe',
    stats: { label: 'DCs', value: '8' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    view: 'dc'
  },
  {
    id: 'dc-optimization',
    title: 'Safety Stox Layer',
    subtitle: 'DC Module 3',
    description: 'Optimize inventory positioning and allocation across distribution center network',
    icon: AnalyticsIcon,
    color: '#1d4ed8',
    bgColor: '#dbeafe',
    stats: { label: 'SKUs', value: '12K' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
    view: 'dc'
  },
  {
    id: 'dc-bom',
    title: 'Bill of Materials',
    subtitle: 'DC Module 4',
    description: 'Multi-level BOM management and component tracking for finished goods assembly',
    icon: AccountTreeIcon,
    color: '#1e40af',
    bgColor: '#dbeafe',
    stats: { label: 'BOMs', value: '2.1K' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
    view: 'dc'
  },
  {
    id: 'dc-lot-size',
    title: 'Lot Size Optimization',
    subtitle: 'DC Module 5',
    description: 'Economic order quantity and lot size optimization for procurement efficiency',
    icon: InventoryIcon,
    color: '#1e3a8a',
    bgColor: '#dbeafe',
    stats: { label: 'Orders', value: '850' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
    view: 'dc'
  },
  {
    id: 'dc-supplier-exec',
    title: 'Supplier Execution',
    subtitle: 'DC Module 6',
    description: 'Supplier collaboration portal with order tracking, delivery management, and performance metrics',
    icon: LocalShippingIcon,
    color: '#172554',
    bgColor: '#dbeafe',
    stats: { label: 'Suppliers', value: '120' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #172554 0%, #0c1844 100%)',
    view: 'dc'
  },
  {
    id: 'dc-financial-impact',
    title: 'Financial Impact',
    subtitle: 'DC Module 7',
    description: 'Working capital analysis, inventory valuation, and financial impact reporting',
    icon: AnalyticsIcon,
    color: '#0c1844',
    bgColor: '#dbeafe',
    stats: { label: 'WC', value: '$45M' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0c1844 0%, #020617 100%)',
    view: 'dc'
  },
  {
    id: 'dc-planning-table',
    title: 'Planning Table (UI5)',
    subtitle: 'DC Module 8',
    description: 'Excel-like planning table with grouping, aggregation, and inline editing using UI5 Web Components',
    icon: DashboardIcon,
    color: '#059669',
    bgColor: '#d1fae5',
    stats: { label: 'Records', value: '1.2K' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    view: 'dc'
  },
];

const storeSystemModules = [
  {
    id: 'store-forecasting',
    title: 'Demand Forecasting',
    subtitle: 'Store Module 1',
    description: 'AI-driven store-level demand forecasting with seasonality, trends, and promotion impact',
    icon: TrendingUpIcon,
    color: '#3b82f6',
    bgColor: '#dbeafe',
    stats: { label: 'Stores', value: '450' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    view: 'store'
  },
  {
    id: 'store-health-monitor',
    title: 'Health Monitor',
    subtitle: 'Store Module 2',
    description: 'Real-time store inventory health monitoring with stock alerts and availability tracking',
    icon: ShowChartIcon,
    color: '#2563eb',
    bgColor: '#dbeafe',
    stats: { label: 'Alerts', value: '125' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    view: 'store'
  },
  {
    id: 'store-optimization',
    title: 'Inventory Optimization',
    subtitle: 'Store Module 3',
    description: 'Store-level inventory optimization with min/max levels, safety stock, and reorder points',
    icon: AnalyticsIcon,
    color: '#1d4ed8',
    bgColor: '#dbeafe',
    stats: { label: 'SKUs', value: '8.5K' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
    view: 'store'
  },
  {
    id: 'store-replenishment',
    title: 'Auto Replenishment',
    subtitle: 'Store Module 4',
    description: 'Automated replenishment order generation with DC integration and order tracking',
    icon: LocalShippingIcon,
    color: '#1e40af',
    bgColor: '#dbeafe',
    stats: { label: 'Orders', value: '3.2K' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
    view: 'store'
  },
  {
    id: 'store-financial-impact',
    title: 'Financial Impact',
    subtitle: 'Store Module 5',
    description: 'Store-level financial impact analysis with inventory carrying costs and stockout costs',
    icon: AnalyticsIcon,
    color: '#1e3a8a',
    bgColor: '#dbeafe',
    stats: { label: 'Savings', value: '$12M' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
    view: 'store'
  },
];

const stoxModules = [];

const StoxAILanding = ({ onTileClick, onBack }) => {
  const theme = useTheme();
  const [selectedView, setSelectedView] = React.useState(null);

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

  const handleViewSelect = (view) => {
    setSelectedView(view);
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

        {/* Category Tiles */}
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Store Level View */}
          <Grid item xs={12} md={6}>
            <Zoom in timeout={400}>
              <Card
                sx={{
                  height: 340,
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '2px solid',
                  borderColor: alpha('#3b82f6', 0.3),
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(255, 255, 255, 1) 100%)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                  },
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: '0 20px 60px rgba(59, 130, 246, 0.25)',
                    borderColor: '#3b82f6',
                    '& .category-header': {
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      '& .category-icon': {
                        bgcolor: 'white',
                        color: '#3b82f6',
                      },
                    },
                    '& .access-button': {
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      transform: 'translateX(8px)',
                    },
                  },
                }}
                onClick={() => handleViewSelect('store')}
              >
                <Box
                  className="category-header"
                  sx={{
                    height: 160,
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.4s ease',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '80%',
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
                    },
                  }}
                >
                  <Avatar
                    className="category-icon"
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: 'white',
                      color: '#3b82f6',
                      transition: 'all 0.4s ease',
                      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)',
                      mb: 1.5,
                    }}
                  >
                    <StoreIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#2563eb',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                    }}
                  >
                    System Access
                  </Typography>
                </Box>

                <CardContent sx={{ p: 2.5, position: 'relative' }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#3b82f6',
                      mb: 1,
                      letterSpacing: '-0.5px',
                    }}
                  >
                    Store Level View
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 2,
                      lineHeight: 1.6,
                      fontSize: '0.875rem',
                    }}
                  >
                    End-to-end supply chain optimization from demand forecasting to procurement
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <Chip
                      icon={<LayersIcon sx={{ fontSize: 14 }} />}
                      label="5 Modules"
                      size="small"
                      sx={{
                        bgcolor: alpha('#3b82f6', 0.15),
                        color: '#2563eb',
                        fontWeight: 600,
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                      }}
                    />
                    <Box
                      className="access-button"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: alpha('#3b82f6', 0.1),
                        color: '#3b82f6',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1.5,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        transition: 'all 0.4s ease',
                      }}
                    >
                      ENTER
                      <ArrowForwardIcon sx={{ fontSize: 16 }} />
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
                  height: 340,
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '2px solid',
                  borderColor: alpha('#64748b', 0.3),
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.03) 0%, rgba(255, 255, 255, 1) 100%)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #94a3b8 0%, #64748b 100%)',
                  },
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: '0 20px 60px rgba(100, 116, 139, 0.25)',
                    borderColor: '#64748b',
                    '& .category-header': {
                      background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                      '& .category-icon': {
                        bgcolor: 'white',
                        color: '#64748b',
                      },
                    },
                    '& .access-button': {
                      background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                      transform: 'translateX(8px)',
                    },
                  },
                }}
                onClick={() => handleViewSelect('dc')}
              >
                <Box
                  className="category-header"
                  sx={{
                    height: 160,
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.4s ease',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '80%',
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(100, 116, 139, 0.3) 50%, transparent 100%)',
                    },
                  }}
                >
                  <Chip
                    label="7 Modules"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: 'rgba(51, 65, 85, 0.8)',
                      color: 'white',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                      fontSize: '0.65rem',
                      px: 1,
                    }}
                  />
                  <Avatar
                    className="category-icon"
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: 'white',
                      color: '#64748b',
                      transition: 'all 0.4s ease',
                      boxShadow: '0 8px 32px rgba(100, 116, 139, 0.15)',
                      mb: 1.5,
                    }}
                  >
                    <WarehouseIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#475569',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                    }}
                  >
                    System Access
                  </Typography>
                </Box>

                <CardContent sx={{ p: 2.5, position: 'relative' }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#64748b',
                      mb: 1,
                      letterSpacing: '-0.5px',
                    }}
                  >
                    Distribution Center System
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 2,
                      lineHeight: 1.6,
                      fontSize: '0.875rem',
                    }}
                  >
                    Comprehensive DC operations and network optimization capabilities
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <Chip
                      label="Coming Soon"
                      size="small"
                      sx={{
                        bgcolor: alpha('#64748b', 0.15),
                        color: '#64748b',
                        fontWeight: 600,
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                      }}
                    />
                    <Box
                      className="access-button"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: alpha('#64748b', 0.1),
                        color: '#64748b',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1.5,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        transition: 'all 0.4s ease',
                      }}
                    >
                      ENTER
                      <ArrowForwardIcon sx={{ fontSize: 16 }} />
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
            <Link
              component="button"
              variant="body1"
              onClick={handleBackToCategories}
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              STOX.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              {selectedView === 'store' ? 'Store Level View' : 'Distribution Center System'}
            </Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToCategories}
            variant="outlined"
            size="small"
            sx={{ borderColor: 'divider' }}
          >
            Back
          </Button>
        </Stack>

        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
            {selectedView === 'store' ? 'Store Level View' : 'Distribution Center System'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {selectedView === 'store'
              ? 'End-to-end supply chain optimization from demand forecasting to procurement'
              : 'Comprehensive DC operations and network optimization capabilities'}
          </Typography>
        </Box>
      </Box>

      {/* Module Tiles */}
      <Grid container spacing={2}>
        {(selectedView === 'dc' ? dcSystemModules : selectedView === 'store' ? storeSystemModules : []).map((module, index) => (
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