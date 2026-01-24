import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  alpha,
  Avatar,
  Stack,
  Zoom,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Speed as SpeedIcon,
  ArrowForward as ArrowForwardIcon,
  LocalShipping as FleetIcon,
  Lightbulb as LightbulbIcon,
  AccountTree as ProcessMiningIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  Sensors as SensorsIcon,
} from '@mui/icons-material';

// Import centralized brand colors
import { MODULE_COLOR, getColors } from '../config/brandColors';

const aiModules = [
  {
    id: 'margen',
    title: 'MARGEN.AI',
    subtitle: 'Margin Analytics & Revenue Intelligence',
    description: 'Advanced financial analytics, customer segmentation, and revenue optimization',
    icon: TrendingUpIcon,
    color: MODULE_COLOR,
    stats: { label: 'Models', value: '12' },
    status: 'active',
  },
  {
    id: 'stox',
    title: 'STOX.AI',
    subtitle: 'Smart Inventory Optimization',
    description: 'Inventory management, demand forecasting, and supply chain optimization',
    icon: InventoryIcon,
    color: MODULE_COLOR,
    stats: { label: 'SKUs', value: '2.5K' },
    status: 'active',
  },
  {
    id: 'route',
    title: 'ROUTE.AI',
    subtitle: 'Fleet & Route Optimization',
    description: 'AI-powered fleet management, route optimization, and logistics intelligence',
    icon: FleetIcon,
    color: MODULE_COLOR,
    stats: { label: 'Vehicles', value: '45' },
    status: 'active',
  },
  {
    id: 'ordly',
    title: 'ORDLY.AI',
    subtitle: 'Order Intelligence Platform',
    description: 'AI-powered order-to-cash automation with intent extraction, SKU optimization, and SAP integration',
    icon: ShoppingCartIcon,
    color: MODULE_COLOR,
    stats: { label: 'Orders', value: '2.4K' },
    status: 'active',
  },
  {
    id: 'o2c',
    title: 'O2C.AI',
    subtitle: 'Order-to-Cash Analysis',
    description: 'End-to-end O2C process intelligence with document flow analysis, customer insights, and transaction drilldown',
    icon: ReceiptIcon,
    color: MODULE_COLOR,
    stats: { label: 'Revenue', value: '$147M' },
    status: 'active',
  },
  {
    id: 'process-mining',
    title: 'PROCESS.AI',
    subtitle: 'Process Mining & Analytics',
    description: 'Discover, analyze, and optimize business processes with AI-powered insights',
    icon: ProcessMiningIcon,
    color: MODULE_COLOR,
    stats: { label: 'Processes', value: '3' },
    status: 'active',
  },
  {
    id: 'traxx',
    title: 'TRAXX.AI',
    subtitle: 'IoT Kit & Asset Tracking',
    description: 'Real-time IoT tracking for surgical kits, loaners, and consignment assets',
    icon: SensorsIcon,
    color: MODULE_COLOR,
    stats: { label: 'Trackers', value: '248' },
    status: 'active',
  },
];

const CoreAILanding = ({ onTileClick, darkMode = false }) => {
  const colors = getColors(darkMode);

  const handleTileClick = (module) => {
    if (module.status === 'active' && onTileClick) {
      onTileClick(module.id);
    }
  };

  return (
    <Box sx={{
      p: 3,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      bgcolor: colors.background,
    }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)', bgcolor: colors.paper }}>
        {/* System Identity Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SpeedIcon sx={{ fontSize: 40, color: MODULE_COLOR }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px', color: colors.text }}>
                CORE.AI
              </Typography>
              <Chip
                label="7 Modules"
                size="small"
                sx={{
                  bgcolor: alpha(MODULE_COLOR, darkMode ? 0.2 : 0.1),
                  color: MODULE_COLOR,
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: colors.textSecondary }}>
              Operational Intelligence Suite - AI-powered analytics and optimization platform
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Module Tiles */}
      <Grid container spacing={1.5}>
        {aiModules
          .filter((module) => module.id !== 'route')
          .map((module, index) => (
          <Grid item xs={12} sm={6} md={3} lg={3} key={module.id}>
            <Zoom in timeout={200 + index * 50}>
              <Card
                sx={{
                  height: 200,
                  cursor: module.status === 'active' ? 'pointer' : 'default',
                  opacity: module.status === 'coming-soon' ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  bgcolor: colors.cardBg,
                  boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': module.status === 'active' ? {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 20px 40px ${alpha(module.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                    '& .module-icon': {
                      transform: 'scale(1.1)',
                      bgcolor: module.color,
                      color: 'white',
                    },
                    '& .module-arrow': {
                      opacity: 1,
                      transform: 'translateX(4px)',
                    },
                  } : {},
                }}
                onClick={() => handleTileClick(module)}
              >
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Icon and Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Avatar
                      className="module-icon"
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(module.color, darkMode ? 0.2 : 0.1),
                        color: module.color,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <module.icon sx={{ fontSize: 22 }} />
                    </Avatar>
                    {module.status === 'coming-soon' && (
                      <Chip label="Soon" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#64748b', darkMode ? 0.2 : 0.1), color: '#64748b', fontWeight: 600 }} />
                    )}
                  </Box>

                  {/* Title */}
                  <Typography variant="body1" sx={{ fontWeight: 700, color: module.color, mb: 0.5, fontSize: '0.9rem', lineHeight: 1.3 }}>
                    {module.title}
                  </Typography>

                  {/* Subtitle */}
                  <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>
                    {module.subtitle}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {module.description}
                  </Typography>

                  {/* Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(module.color, darkMode ? 0.2 : 0.1) }}>
                    <Chip label={`${module.stats.value} ${module.stats.label}`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(module.color, darkMode ? 0.2 : 0.08), color: module.color, fontWeight: 600 }} />
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

      {/* Footer Info */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <LightbulbIcon sx={{ color: 'warning.main' }} />
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Powered by advanced machine learning and real-time data analytics
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default CoreAILanding;
