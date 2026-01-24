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
  ShowChart as ForecastIcon,
  AccountBalance as BudgetIcon,
  Speed as DriverIcon,
  Psychology as ScenarioIcon,
  Lightbulb as InsightsIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

const financeModules = [
  {
    id: 'forecast',
    title: 'FORECAST.AI',
    subtitle: 'Predictive Analytics & Forecasting',
    description: 'Advanced time series forecasting, ML-based predictions, and trend analysis for financial planning',
    icon: ForecastIcon,
    color: '#2196F3',
    bgColor: '#E3F2FD',
    path: '/financeai/forecast',
    stats: { label: 'Forecast Models', value: '8' },
    status: 'coming-soon',
  },
  {
    id: 'budget',
    title: 'BUDGET.AI',
    subtitle: 'Intelligent Budget Planning',
    description: 'Smart budget allocation, variance analysis, and rolling forecasts with GL account integration',
    icon: BudgetIcon,
    color: '#1a5a9e',
    bgColor: '#deecf9',
    path: '/financeai/budget',
    stats: { label: 'Budget Lines', value: '156' },
    status: 'coming-soon',
  },
  {
    id: 'driver',
    title: 'DRIVER.AI',
    subtitle: 'Driver-Based Planning',
    description: 'Identify key business drivers, perform sensitivity analysis, and create driver-based forecasts',
    icon: DriverIcon,
    color: '#1a5a9e',
    bgColor: '#deecf9',
    path: '/financeai/driver',
    stats: { label: 'Key Drivers', value: '24' },
    status: 'coming-soon',
  },
  {
    id: 'scenario',
    title: 'SCENARIO.AI',
    subtitle: 'Scenario Planning & What-If',
    description: 'Interactive scenario modeling, Monte Carlo simulations, and multi-scenario comparison',
    icon: ScenarioIcon,
    color: '#00357a',
    bgColor: '#F3E5F5',
    path: '/financeai/scenario',
    stats: { label: 'Active Scenarios', value: '12' },
    status: 'active',
  },
  {
    id: 'insights',
    title: 'INSIGHTS.AI',
    subtitle: 'AI-Powered Business Insights',
    description: 'Automated insight generation, anomaly detection, and prescriptive recommendations',
    icon: InsightsIcon,
    color: '#1873b4',
    bgColor: '#E0F7FA',
    path: '/financeai/insights',
    stats: { label: 'Daily Insights', value: '45' },
    status: 'coming-soon',
  },
];

const FinanceAILanding = ({ onTileClick }) => {
  const theme = useTheme();

  const handleTileClick = (module) => {
    if (module.status === 'active' && onTileClick) {
      onTileClick(module.id);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          fontWeight="bold" 
          sx={{ 
            mb: 1,
            background: 'linear-gradient(45deg, #00357a 30%, #1a5a9e 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Finance.AI Suite
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Intelligent Financial Planning & Analysis powered by Advanced AI
        </Typography>
      </Box>

      {/* Tiles Grid */}
      <Grid container spacing={2}>
        {financeModules.map((module) => {
          const Icon = module.icon;
          const isActive = module.status === 'active';
          
          return (
            <Grid item xs={12} sm={6} md={3} lg={3} key={module.id}>
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
                      transform: 'scale(1.1) rotate(5deg)',
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

      {/* Additional Feature Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
            <Typography variant="h6" gutterBottom>
              Integrated GL Account Mapping
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All Finance.AI modules are integrated with your GL account structure, providing seamless 
              financial analysis from strategic planning down to transaction-level details.
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: alpha(theme.palette.success.main, 0.04) }}>
            <Typography variant="h6" gutterBottom>
              Real-time Data Synchronization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect directly to your PostgreSQL database for real-time financial data updates, 
              ensuring your forecasts and scenarios are always based on the latest information.
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Footer Info */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Powered by advanced machine learning algorithms and integrated with your financial data ecosystem
        </Typography>
      </Box>
    </Box>
  );
};

export default FinanceAILanding;