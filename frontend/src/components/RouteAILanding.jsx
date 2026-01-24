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
  Zoom,
  Paper,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  LocalShipping as FleetIcon,
  Route as RouteIcon,
  LocationOn as DeliveryIcon,
  Assessment as AnalyticsIcon,
  LocalGasStation as FuelIcon,
  Build as MaintenanceIcon,
} from '@mui/icons-material';

const routeModules = [
  {
    id: 'fleet-management',
    title: 'Fleet Management',
    subtitle: 'Vehicle Operations',
    description: 'Real-time vehicle tracking, driver management, and fleet utilization analytics',
    icon: FleetIcon,
    color: '#106ebe',
    bgColor: '#deecf9',
    stats: { label: 'Active Vehicles', value: '45' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #106ebe 0%, #2b88d8 100%)',
  },
  {
    id: 'route-optimization',
    title: 'Route Optimization',
    subtitle: 'Smart Routing',
    description: 'AI-powered route planning, traffic-aware optimization, and dynamic re-routing',
    icon: RouteIcon,
    color: '#2b88d8',
    bgColor: '#deecf9',
    stats: { label: 'Routes Optimized', value: '1,245' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #2b88d8 0%, #0078d4 100%)',
  },
  {
    id: 'delivery-tracking',
    title: 'Delivery Tracking',
    subtitle: 'Real-Time Monitoring',
    description: 'Live delivery status, ETAs, proof of delivery, and customer notifications',
    icon: DeliveryIcon,
    color: '#2196F3',
    bgColor: '#deecf9',
    stats: { label: 'Deliveries Today', value: '128' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  },
  {
    id: 'performance-analytics',
    title: 'Performance Analytics',
    subtitle: 'Insights & Metrics',
    description: 'Fleet efficiency metrics, driver performance, and operational KPIs',
    icon: AnalyticsIcon,
    color: '#0078d4',
    bgColor: '#f3e5f5',
    stats: { label: 'Fleet Efficiency', value: '91%' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
  },
  {
    id: 'fuel-management',
    title: 'Fuel Management',
    subtitle: 'Cost Optimization',
    description: 'Fuel consumption tracking, cost analysis, and efficiency recommendations',
    icon: FuelIcon,
    color: '#106ebe',
    bgColor: '#deecf9',
    stats: { label: 'Cost Saved', value: '$12.5K' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #106ebe 0%, #0078d4 100%)',
  },
  {
    id: 'maintenance-scheduler',
    title: 'Maintenance Scheduler',
    subtitle: 'Predictive Maintenance',
    description: 'Preventive maintenance scheduling, service alerts, and vehicle health monitoring',
    icon: MaintenanceIcon,
    color: '#005a9e',
    bgColor: '#deecf9',
    stats: { label: 'Upcoming Services', value: '8' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #005a9e 0%, #0078d4 100%)',
  },
];

const RouteAILanding = ({ onTileClick, onBack }) => {
  const theme = useTheme();

  const handleTileClick = (moduleId) => {
    console.log('RouteAI tile clicked:', moduleId);
    if (onTileClick) {
      onTileClick(moduleId);
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              CORE.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              ROUTE.AI
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
            Back to CORE.AI
          </Button>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha('#106ebe', 0.1),
            }}
          >
            <FleetIcon sx={{ fontSize: 36, color: '#106ebe' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              ROUTE.AI
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Fleet & Route Optimization Platform
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Module Tiles */}
      <Grid container spacing={1.5}>
        {routeModules.map((module, index) => (
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
    </Box>
  );
};

export default RouteAILanding;
