import React, { useState } from 'react';
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
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  TableView as TableIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  Lightbulb as LightbulbIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';

const marginModules = [
  {
    id: 'margin-trends',
    title: 'Margin Trends',
    subtitle: 'Performance Analytics',
    description: 'Track margin performance over time with detailed trend analysis and forecasting',
    icon: TimelineIcon,
    color: '#10b981',
    bgColor: '#d1fae5',
    stats: { label: 'Avg Margin', value: '32.4%' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    id: 'margin-waterfall',
    title: 'Margin Waterfall',
    subtitle: 'Performance Analytics',
    description: 'Visualize margin breakdown from gross to net with detailed component analysis',
    icon: BarChartIcon,
    color: '#3b82f6',
    bgColor: '#dbeafe',
    stats: { label: 'Components', value: '12' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  },
  {
    id: 'product-margins',
    title: 'Product Margins',
    subtitle: 'Product Analysis',
    description: 'Deep dive into product-level profitability and contribution margins',
    icon: TableIcon,
    color: '#f97316',
    bgColor: '#ffedd5',
    stats: { label: 'Products', value: '247' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  },
  {
    id: 'customer-margins',
    title: 'Customer Margins',
    subtitle: 'Customer Analysis',
    description: 'Analyze profitability by customer segment and identify high-value relationships',
    icon: PeopleIcon,
    color: '#06b6d4',
    bgColor: '#cffafe',
    stats: { label: 'Segments', value: '11' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },
  {
    id: 'margin-drivers',
    title: 'Margin Drivers',
    subtitle: 'Insights & Analytics',
    description: 'Identify key drivers impacting margins with AI-powered analysis',
    icon: LightbulbIcon,
    color: '#8b5cf6',
    bgColor: '#f3e8ff',
    stats: { label: 'Drivers', value: '18' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  {
    id: 'margin-mix',
    title: 'Product Mix Analysis',
    subtitle: 'Insights & Analytics',
    description: 'Optimize product mix for maximum profitability and margin improvement',
    icon: PieChartIcon,
    color: '#ec4899',
    bgColor: '#fce7f3',
    stats: { label: 'Scenarios', value: '6' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  },
  {
    id: 'margin-forecast',
    title: 'Margin Forecast',
    subtitle: 'Forecasting',
    description: 'AI-powered margin forecasting with scenario planning and what-if analysis',
    icon: ShowChartIcon,
    color: '#6366f1',
    bgColor: '#e0e7ff',
    stats: { label: 'Accuracy', value: '94%' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  },
  {
    id: 'margin-alerts',
    title: 'Margin Alerts',
    subtitle: 'Monitoring',
    description: 'Real-time alerts for margin anomalies and threshold violations',
    icon: AssessmentIcon,
    color: '#f59e0b',
    bgColor: '#fef3c7',
    stats: { label: 'Active', value: '3' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    id: 'margin-benchmark',
    title: 'Margin Benchmarking',
    subtitle: 'Competitive Analysis',
    description: 'Compare margins against industry benchmarks and best practices',
    icon: TrendingUpIcon,
    color: '#64748b',
    bgColor: '#f1f5f9',
    stats: { label: 'Peers', value: '24' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
  },
];

const MargenAIDashboard = ({ onBack, onTileClick }) => {
  const theme = useTheme();

  const handleTileClick = (moduleId) => {
    console.log('Margin Performance tile clicked:', moduleId);
    if (onTileClick) {
      onTileClick(moduleId);
    }
  };

  // Group modules by category
  const categories = [
    { name: 'Performance Analytics', modules: marginModules.filter(m => m.subtitle === 'Performance Analytics') },
    { name: 'Product & Customer Analysis', modules: marginModules.filter(m => m.subtitle === 'Product Analysis' || m.subtitle === 'Customer Analysis') },
    { name: 'Insights & Analytics', modules: marginModules.filter(m => m.subtitle === 'Insights & Analytics') },
    { name: 'Forecasting & Monitoring', modules: marginModules.filter(m => m.subtitle === 'Forecasting' || m.subtitle === 'Monitoring' || m.subtitle === 'Competitive Analysis') },
  ];

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
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
              MARGEN.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Margin Performance
            </Typography>
          </Breadcrumbs>
          {onBack && (
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
              Back to MargenAI
            </Button>
          )}
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha('#8b5cf6', 0.1),
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 36, color: '#8b5cf6' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Margin Performance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive margin analysis and profitability insights
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Module Categories */}
      {categories.map((category, index) => (
        <Fade in timeout={300 + index * 100} key={category.name}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ mb: 2, color: 'text.primary', textTransform: 'uppercase', fontSize: '0.9rem' }}
            >
              {category.name}
            </Typography>

            <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto' }}>
              {category.modules.map((module, moduleIndex) => (
                <Grid item xs={12} md={6} lg={4} key={module.id}>
                  <Zoom in timeout={400 + moduleIndex * 100}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: `linear-gradient(135deg, ${alpha(module.color, 0.05)} 0%, ${alpha(
                          module.color,
                          0.02
                        )} 100%)`,
                        border: `2px solid ${alpha(module.color, 0.1)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        height: '100%',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 12px 24px ${alpha(module.color, 0.25)}`,
                          borderColor: alpha(module.color, 0.3),
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
                          height: '4px',
                          background: module.gradient,
                        },
                      }}
                      onClick={() => handleTileClick(module.id)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: module.bgColor,
                              border: `2px solid ${alpha(module.color, 0.2)}`,
                            }}
                          >
                            <module.icon sx={{ fontSize: 28, color: module.color }} />
                          </Avatar>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                              <Box>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                  {module.title}
                                </Typography>
                                <Chip
                                  label={module.subtitle}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: alpha(module.color, 0.1),
                                    color: module.color,
                                    fontWeight: 600,
                                    mb: 1,
                                  }}
                                />
                              </Box>
                              <IconButton
                                className="action-icon"
                                sx={{
                                  bgcolor: alpha(module.color, 0.1),
                                  color: module.color,
                                  transition: 'transform 0.2s',
                                  '&:hover': {
                                    bgcolor: alpha(module.color, 0.2),
                                  },
                                }}
                              >
                                <ArrowForwardIcon />
                              </IconButton>
                            </Stack>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                              {module.description}
                            </Typography>

                            <Stack direction="row" spacing={2} alignItems="center">
                              <Box
                                sx={{
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: 1,
                                  bgcolor: alpha(module.color, 0.1),
                                  border: `1px solid ${alpha(module.color, 0.2)}`,
                                }}
                              >
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  {module.stats.label}
                                </Typography>
                                <Typography variant="body2" fontWeight={700} color={module.color}>
                                  {module.stats.value}
                                </Typography>
                              </Box>

                              {module.status === 'active' && (
                                <Chip
                                  label="Active"
                                  size="small"
                                  sx={{
                                    height: 24,
                                    fontSize: '0.7rem',
                                    bgcolor: alpha('#10b981', 0.1),
                                    color: '#10b981',
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                            </Stack>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      ))}
    </Box>
  );
};

export default MargenAIDashboard;
