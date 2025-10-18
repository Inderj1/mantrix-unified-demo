import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Inventory as InventoryIcon,
  AccountTree as FlowIcon,
  Speed as OptimaIcon,
  Security as SecurityIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

const aiModules = [
  {
    id: 'margen',
    title: 'MARGEN.AI',
    subtitle: 'Margin Analytics & Revenue Intelligence',
    description: 'Advanced financial analytics, customer segmentation, and revenue optimization',
    icon: TrendingUpIcon,
    color: '#1976d2',
    bgColor: '#e3f2fd',
    path: '/coreai/margen',
    stats: { label: 'Active Models', value: '12' },
    status: 'active',
  },
  {
    id: 'prism',
    title: 'PRISM.AI',
    subtitle: 'Predictive Risk & Insights Management',
    description: 'Risk analysis, predictive modeling, and business intelligence',
    icon: AnalyticsIcon,
    color: '#9c27b0',
    bgColor: '#f3e5f5',
    path: '/coreai/prism',
    stats: { label: 'Risk Factors', value: '45' },
    status: 'coming-soon',
  },
  {
    id: 'stox',
    title: 'STOX.AI',
    subtitle: 'Smart Inventory Optimization',
    description: 'Inventory management, demand forecasting, and supply chain optimization',
    icon: InventoryIcon,
    color: '#2e7d32',
    bgColor: '#e8f5e9',
    path: '/coreai/stox',
    stats: { label: 'SKUs Managed', value: '2.5K' },
    status: 'active',
  },
  {
    id: 'flow',
    title: 'FLOW.AI',
    subtitle: 'Process Flow Automation',
    description: 'Workflow automation, process mining, and operational efficiency',
    icon: FlowIcon,
    color: '#ed6c02',
    bgColor: '#fff3e0',
    path: '/coreai/flow',
    stats: { label: 'Workflows', value: '38' },
    status: 'coming-soon',
  },
  {
    id: 'optima',
    title: 'OPTIMA.AI',
    subtitle: 'Performance Optimization Engine',
    description: 'Resource optimization, performance tuning, and efficiency analytics',
    icon: OptimaIcon,
    color: '#0288d1',
    bgColor: '#e1f5fe',
    path: '/coreai/optima',
    stats: { label: 'Optimizations', value: '156' },
    status: 'coming-soon',
  },
  {
    id: 'sentry',
    title: 'SENTRY.AI',
    subtitle: 'Security & Compliance Monitor',
    description: 'Security monitoring, compliance tracking, and anomaly detection',
    icon: SecurityIcon,
    color: '#d32f2f',
    bgColor: '#ffebee',
    path: '/coreai/sentry',
    stats: { label: 'Threats Blocked', value: '892' },
    status: 'coming-soon',
  },
];

const CoreAILanding = ({ onTileClick }) => {
  const theme = useTheme();

  const handleTileClick = (module) => {
    if (module.status === 'active' && onTileClick) {
      onTileClick(module.id);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 1
          }}
        >
          Core.AI Suite
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: theme.palette.text.secondary,
            mb: 3
          }}
        >
          Intelligent Business Solutions powered by Advanced AI
        </Typography>
      </Box>

      {/* Tiles Grid */}
      <Grid container spacing={3}>
        {aiModules.map((module) => {
          const Icon = module.icon;
          const isActive = module.status === 'active';
          
          return (
            <Grid item xs={12} sm={6} md={4} key={module.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: isActive ? 'pointer' : 'default',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'visible',
                  border: '2px solid',
                  borderColor: isActive ? 'transparent' : 'divider',
                  opacity: isActive ? 1 : 0.8,
                  background: isActive 
                    ? `linear-gradient(135deg, ${alpha(module.bgColor, 0.3)} 0%, ${alpha(module.bgColor, 0.1)} 100%)`
                    : 'background.paper',
                  '&:hover': isActive ? {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`,
                    borderColor: module.color,
                    '& .arrow-icon': {
                      transform: 'translateX(8px)',
                      color: module.color,
                    },
                    '& .module-icon': {
                      transform: 'scale(1.1)',
                    },
                  } : {},
                }}
                onClick={() => handleTileClick(module)}
              >
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Status Chip */}
                  {!isActive && (
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      <Chip
                        label="Coming Soon"
                        size="small"
                        sx={{
                          backgroundColor: alpha(module.color, 0.1),
                          color: module.color,
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
                  )}

                  {/* Icon and Title */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      className="module-icon"
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        backgroundColor: module.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      <Icon sx={{ fontSize: 32, color: module.color }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h5" 
                        fontWeight="bold" 
                        sx={{ 
                          color: isActive ? 'text.primary' : 'text.secondary',
                          mb: 0.5,
                        }}
                      >
                        {module.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {module.subtitle}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 3, 
                      flex: 1,
                      lineHeight: 1.6,
                    }}
                  >
                    {module.description}
                  </Typography>

                  {/* Stats and Action */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {module.stats.label}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color={module.color}>
                        {module.stats.value}
                      </Typography>
                    </Box>
                    {isActive && (
                      <IconButton
                        size="small"
                        sx={{
                          backgroundColor: alpha(module.color, 0.1),
                          color: module.color,
                          '&:hover': {
                            backgroundColor: alpha(module.color, 0.2),
                          },
                        }}
                      >
                        <ArrowForwardIcon 
                          className="arrow-icon" 
                          sx={{ 
                            fontSize: 20,
                            transition: 'transform 0.2s ease',
                          }} 
                        />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Footer Info */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Powered by advanced machine learning and real-time data analytics
        </Typography>
      </Box>
    </Box>
  );
};

export default CoreAILanding;