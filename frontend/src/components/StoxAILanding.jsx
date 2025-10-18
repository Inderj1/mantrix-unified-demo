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
  Inventory as InventoryIcon,
  AutoAwesome as AIIcon,
  TrendingUp as DemandIcon,
  LocalShipping as SupplyIcon,
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon,
  GridOn as HeatmapIcon,
  SwapHoriz as ReallocationIcon,
  ReportProblem as RiskIcon,
  Schedule as AgingIcon,
} from '@mui/icons-material';

const stoxModules = [
  {
    id: 'shortage-detector',
    title: 'Shortage Detector',
    subtitle: 'Real-time Stockout Prevention',
    description: 'AI-powered early warning system for potential stockouts across all locations',
    icon: WarningIcon,
    color: '#FF5722',
    bgColor: '#FBE9E7',
    stats: { label: 'Alerts', value: '47' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #FF5722 0%, #FF7043 100%)',
  },
  {
    id: 'inventory-heatmap',
    title: 'Inventory Heatmap',
    subtitle: 'Visual Stock Distribution',
    description: 'Interactive heat mapping of inventory levels across warehouses and stores',
    icon: HeatmapIcon,
    color: '#E91E63',
    bgColor: '#FCE4EC',
    stats: { label: 'Locations', value: '156' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
  },
  {
    id: 'reallocation-optimizer',
    title: 'Reallocation Optimizer',
    subtitle: 'Smart Stock Balancing',
    description: 'Optimize inventory distribution and recommend strategic stock transfers',
    icon: ReallocationIcon,
    color: '#00BCD4',
    bgColor: '#E0F7FA',
    stats: { label: 'Moves', value: '89' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #00BCD4 0%, #26C6DA 100%)',
  },
  {
    id: 'inbound-risk-monitor',
    title: 'Inbound Risk Monitor',
    subtitle: 'Supply Chain Risk Analytics',
    description: 'Monitor and predict risks in incoming shipments and supplier performance',
    icon: RiskIcon,
    color: '#FF9800',
    bgColor: '#FFF3E0',
    stats: { label: 'Risk Score', value: '12%' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
  },
  {
    id: 'aging-stock-intelligence',
    title: 'Aging Stock Intelligence',
    subtitle: 'Smart Obsolescence Prevention',
    description: 'Identify slow-moving inventory and recommend clearance strategies',
    icon: AgingIcon,
    color: '#9C27B0',
    bgColor: '#F3E5F5',
    stats: { label: 'At Risk', value: '$2.3M' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
  },
];

const StoxAILanding = ({ onTileClick, onBack }) => {
  const theme = useTheme();

  console.log('StoxAILanding rendering, props:', { hasOnTileClick: !!onTileClick, hasOnBack: !!onBack });

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
      overflowX: 'hidden'
    }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          sx={{ mb: 2 }}
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

        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            size="small"
            sx={{ borderColor: 'divider' }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
              STOX.AI
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Smart Inventory & Supply Chain Optimization Platform
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Module Tiles */}
      <Grid container spacing={3}>
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
                  borderRadius: 3,
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
                    height: 140,
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
                      width: 80,
                      height: 80,
                      bgcolor: 'white',
                      color: module.color,
                      transition: 'transform 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  >
                    <module.icon sx={{ fontSize: 40 }} />
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

                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: module.color,
                      mb: 0.5,
                    }}
                  >
                    {module.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    {module.subtitle}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 3,
                      minHeight: 60,
                      lineHeight: 1.6,
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
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {module.stats.label}:
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color={module.color}>
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