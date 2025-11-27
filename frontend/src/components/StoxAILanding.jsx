import React from 'react';
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
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  ShowChart as ShowChartIcon,
  Analytics as AnalyticsIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';

const storeSystemModules = [
  {
    id: 'tile0-forecast-simulation',
    title: 'Inventory Health Dashboard',
    subtitle: 'Tile 0',
    description: 'Compare AI models (ARIMA, ETS, ML), override forecasts, and confirm baseline for Tile 1',
    icon: ScienceIcon,
    color: '#354a5f',
    bgColor: '#f3e8ff',
    stats: { label: 'Models', value: '3' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #354a5f 0%, #32363a 100%)',
  },
  {
    id: 'store-forecasting',
    title: 'Demand Forecasting',
    subtitle: 'Tile 1',
    description: 'Confirmed forecast baseline with volatility, price, cost, and margin data for inventory planning',
    icon: TrendingUpIcon,
    color: '#0a6ed1',
    bgColor: '#dbeafe',
    stats: { label: 'Forecasts', value: '36' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0a6ed1 0%, #0854a0 100%)',
  },
  {
    id: 'store-health-monitor',
    title: 'Inventory Health',
    subtitle: 'Tile 2',
    description: 'Measure inventory adequacy vs. forecast, compute safety stock, ROP, and stockout risk',
    icon: ShowChartIcon,
    color: '#6a6d70',
    bgColor: '#d1fae5',
    stats: { label: 'Items', value: '36' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #6a6d70 0%, #6a6d70 100%)',
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
  },
  {
    id: 'store-replenishment',
    title: 'Stock Transfer Execution',
    subtitle: 'Tile 4',
    description: 'Match store demand to best DC based on availability, freight cost, ETA - create STO/PR in SAP',
    icon: LocalShippingIcon,
    color: '#0854a0',
    bgColor: '#dbeafe',
    stats: { label: 'STOs', value: '36' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0854a0 0%, #1d4ed8 100%)',
  },
];

const StoxAILanding = ({ onTileClick, onBack }) => {
  const handleTileClick = (moduleId) => {
    if (onTileClick) {
      onTileClick(moduleId);
    }
  };

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
            background: 'linear-gradient(180deg, #0a6ed1 0%, #0854a0 100%)',
            borderRadius: 2
          }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#0a6ed1' }}>
                <InventoryIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px', color: '#0a6ed1' }}>
                STOX.AI
              </Typography>
              <Chip
                label="5 Modules"
                size="small"
                sx={{
                  bgcolor: alpha('#0a6ed1', 0.1),
                  color: '#0a6ed1',
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

      {/* Module Tiles */}
      <Grid container spacing={1.5}>
        {storeSystemModules.map((module, index) => (
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
