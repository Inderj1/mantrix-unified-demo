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
  useTheme,
  Zoom,
  Paper,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Engineering as EquipmentIcon,
  TrendingUp as RevenueIcon,
  Build as MaintenanceIcon,
  Assessment as PerformanceIcon,
  LocalShipping as UtilizationIcon,
  Speed as EfficiencyIcon,
  AccountBalance as FinancialIcon,
  CompareArrows as LoanerIcon,
  SwapHoriz as ConsignmentIcon,
} from '@mui/icons-material';

// Category definitions for REVEQ.AI
const categories = [
  {
    id: 'loaner',
    title: 'Loaner Process',
    subtitle: 'Asset Management & Operations',
    description: 'Comprehensive loaner equipment management including tracking, utilization, maintenance scheduling, and operational efficiency optimization',
    icon: LoanerIcon,
    color: '#0078d4',
    gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    stats: { label: 'Active Loaners', value: '86' },
  },
  {
    id: 'consignment',
    title: 'Consignment Process',
    subtitle: 'Revenue & Performance Analytics',
    description: 'End-to-end consignment analytics with revenue tracking, performance dashboards, and comprehensive financial workbench capabilities',
    icon: ConsignmentIcon,
    color: '#2b88d8',
    gradient: 'linear-gradient(135deg, #2b88d8 0%, #0078d4 100%)',
    stats: { label: 'Consignment Items', value: '42' },
  },
];

// Loaner Process Modules
const loanerModules = [
  {
    id: 'asset-tracking',
    title: 'Asset Tracking',
    subtitle: 'Real-Time Monitoring',
    description: 'Live equipment location, status tracking, and operational visibility across all assets',
    icon: EquipmentIcon,
    color: '#0078d4',
    bgColor: '#deecf9',
    stats: { label: 'Assets Tracked', value: '128' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
  },
  {
    id: 'utilization-metrics',
    title: 'Utilization Metrics',
    subtitle: 'Asset Optimization',
    description: 'Equipment utilization rates, idle time analysis, and deployment optimization',
    icon: UtilizationIcon,
    color: '#2b88d8',
    bgColor: '#deecf9',
    stats: { label: 'Avg Utilization', value: '87%' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #2b88d8 0%, #0078d4 100%)',
  },
  {
    id: 'maintenance-scheduler',
    title: 'Maintenance Scheduler',
    subtitle: 'Preventive Care',
    description: 'Automated maintenance scheduling, service alerts, and equipment health monitoring',
    icon: MaintenanceIcon,
    color: '#0078d4',
    bgColor: '#deecf9',
    stats: { label: 'Services Due', value: '12' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
  },
  {
    id: 'efficiency-optimizer',
    title: 'Efficiency Optimizer',
    subtitle: 'Cost Reduction',
    description: 'Cost optimization recommendations, efficiency improvements, and resource allocation',
    icon: EfficiencyIcon,
    color: '#106ebe',
    bgColor: '#deecf9',
    stats: { label: 'Cost Saved', value: '$18.2K' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #106ebe 0%, #0078d4 100%)',
  },
];

// Consignment Process Modules
const consignmentModules = [
  {
    id: 'revenue-analytics',
    title: 'Revenue Analytics',
    subtitle: 'Financial Performance',
    description: 'Equipment revenue tracking, profitability analysis, and ROI optimization insights',
    icon: RevenueIcon,
    color: '#0078d4',
    bgColor: '#deecf9',
    stats: { label: 'Monthly Revenue', value: '$2.4M' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
  },
  {
    id: 'performance-dashboard',
    title: 'Performance Dashboard',
    subtitle: 'KPIs & Metrics',
    description: 'Comprehensive performance metrics, efficiency scores, and operational KPIs',
    icon: PerformanceIcon,
    color: '#005a9e',
    bgColor: '#deecf9',
    stats: { label: 'Performance Score', value: '92/100' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #005a9e 0%, #0078d4 100%)',
  },
  {
    id: 'financial-workbench',
    title: 'Financial Workbench',
    subtitle: 'Financial Analysis',
    description: 'Comprehensive financial analytics, P&L tracking, budget management, and forecasting',
    icon: FinancialIcon,
    color: '#0078d4',
    bgColor: '#deecf9',
    stats: { label: 'Active Reports', value: '24' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
  },
];

const ReveqAILanding = ({ onTileClick, onBack }) => {
  const theme = useTheme();
  const [selectedView, setSelectedView] = useState(null); // null, 'loaner', 'consignment'

  const handleTileClick = (moduleId) => {
    console.log('ReveqAI tile clicked:', moduleId);
    if (onTileClick) {
      onTileClick(moduleId);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedView(categoryId);
  };

  const handleBackToCategories = () => {
    setSelectedView(null);
  };

  // Get current modules based on selected view
  const getCurrentModules = () => {
    if (selectedView === 'loaner') return loanerModules;
    if (selectedView === 'consignment') return consignmentModules;
    return [];
  };

  const getCurrentCategory = () => {
    return categories.find(cat => cat.id === selectedView);
  };

  // Render Category Selection View
  if (!selectedView) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
        {/* Header */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 0, flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <Box sx={{ maxWidth: 1400, mx: 'auto', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: '#106ebe',
                    }}
                  >
                    <EquipmentIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      REVEQ.AI
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Revenue Equipment Intelligence Platform
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
                Back to CORE.AI
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            <Grid container spacing={2}>
              {categories.map((category, index) => (
                <Grid item xs={12} sm={6} md={3} lg={3} key={category.id}>
                  <Zoom in timeout={400 + index * 100}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'white',
                        border: `1px solid ${alpha(category.color, 0.15)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 16px ${alpha(category.color, 0.15)}`,
                          borderColor: alpha(category.color, 0.3),
                          '& .action-icon': {
                            transform: 'translateX(4px)',
                          },
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: category.gradient,
                        },
                      }}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        {/* Icon and Badge */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <category.icon sx={{ fontSize: 40, color: category.color }} />
                          <Chip
                            label={`${category.stats.value} ${category.stats.label}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: alpha(category.color, 0.3),
                              color: category.color,
                              fontWeight: 600,
                              fontSize: '0.65rem',
                              height: 20,
                            }}
                          />
                        </Box>

                        {/* Title */}
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: category.color,
                            mb: 1,
                            fontSize: '0.938rem',
                          }}
                        >
                          {category.title}
                        </Typography>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            mb: 'auto',
                            lineHeight: 1.5,
                            fontSize: '0.813rem'
                          }}
                        >
                          {category.description}
                        </Typography>

                        {/* Footer */}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            mt: 1.5,
                            pt: 1.5,
                            borderTop: '1px solid',
                            borderColor: alpha(category.color, 0.1)
                          }}
                        >
                          <Box
                            className="access-button"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              bgcolor: alpha(category.color, 0.1),
                              color: category.color,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              transition: 'all 0.3s ease'
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
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    );
  }

  // Render Module View for Selected Category
  const currentCategory = getCurrentCategory();
  const currentModules = getCurrentModules();

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
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
            <Link
              component="button"
              variant="body1"
              onClick={handleBackToCategories}
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              REVEQ.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              {currentCategory?.title}
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToCategories} variant="outlined" size="small">
            Back to REVEQ.AI
          </Button>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha(currentCategory?.color || '#0078d4', 0.1),
            }}
          >
            {currentCategory && <currentCategory.icon sx={{ fontSize: 36, color: currentCategory.color }} />}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {currentCategory?.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {currentCategory?.subtitle}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Module Tiles */}
      <Grid container spacing={1.5}>
        {currentModules.map((module, index) => (
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

export default ReveqAILanding;
