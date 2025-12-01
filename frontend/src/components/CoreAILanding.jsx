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
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Speed as SpeedIcon,
  ArrowForward as ArrowForwardIcon,
  LocalShipping as FleetIcon,
  Engineering as EquipmentIcon,
  Lightbulb as LightbulbIcon,
  AccountTree as ProcessMiningIcon,
} from '@mui/icons-material';

const aiModules = [
  {
    id: 'margen',
    title: 'MARGEN.AI',
    subtitle: 'Margin Analytics & Revenue Intelligence',
    description: 'Advanced financial analytics, customer segmentation, and revenue optimization',
    icon: TrendingUpIcon,
    color: '#0a6ed1',
    bgColor: '#dbeafe',
    stats: { label: 'Models', value: '12' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0a6ed1 0%, #0854a0 100%)',
  },
  {
    id: 'stox',
    title: 'STOX.AI',
    subtitle: 'Smart Inventory Optimization',
    description: 'Inventory management, demand forecasting, and supply chain optimization',
    icon: InventoryIcon,
    color: '#354a5f',
    bgColor: '#f1f5f9',
    stats: { label: 'SKUs', value: '2.5K' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #354a5f 0%, #32363a 100%)',
  },
  {
    id: 'route',
    title: 'ROUTE.AI',
    subtitle: 'Fleet & Route Optimization',
    description: 'AI-powered fleet management, route optimization, and logistics intelligence',
    icon: FleetIcon,
    color: '#64748b',
    bgColor: '#f1f5f9',
    stats: { label: 'Vehicles', value: '45' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
  },
  {
    id: 'reveq',
    title: 'REVEQ.AI',
    subtitle: 'Revenue Equipment Intelligence',
    description: 'Equipment analytics, fleet performance monitoring, and asset utilization optimization',
    icon: EquipmentIcon,
    color: '#0854a0',
    bgColor: '#dbeafe',
    stats: { label: 'Assets', value: '128' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0854a0 0%, #1d4ed8 100%)',
  },
  {
    id: 'process-mining',
    title: 'PROCESS.AI',
    subtitle: 'Process Mining & Analytics',
    description: 'Discover, analyze, and optimize business processes with AI-powered insights',
    icon: ProcessMiningIcon,
    color: '#354a5f',
    bgColor: '#f1f5f9',
    stats: { label: 'Processes', value: '8' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #354a5f 0%, #1e3a5f 100%)',
  },
];

const CoreAILanding = ({ onTileClick }) => {
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
      background: 'linear-gradient(180deg, rgba(10, 110, 209, 0.05) 0%, rgba(255, 255, 255, 1) 50%)',
    }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        {/* System Identity Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{
            width: 4,
            height: 60,
            background: 'linear-gradient(180deg, #0a6ed1 0%, #354a5f 100%)',
            borderRadius: 2
          }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#0a6ed1' }}>
                <SpeedIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px', color: '#0a6ed1' }}>
                CORE.AI
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
              Operational Intelligence Suite - AI-powered analytics and optimization platform
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Module Tiles - Matching Stox.AI/Margen.AI styling */}
      <Grid container spacing={1.5}>
        {aiModules
          .filter((module) => module.id !== 'route')
          .map((module, index) => (
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

      {/* Footer Info */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <LightbulbIcon sx={{ color: 'warning.main' }} />
          <Typography variant="body2" color="text.secondary">
            Powered by advanced machine learning and real-time data analytics
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default CoreAILanding;
