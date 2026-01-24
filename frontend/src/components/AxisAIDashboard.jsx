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
    // path: '/axis/forecast', // Not used in tab navigation
    stats: { label: 'Forecast Models', value: '8' },
    status: 'active',
  },
  {
    id: 'budget',
    title: 'BUDGET.AI',
    subtitle: 'Intelligent Budget Planning',
    description: 'Smart budget allocation, variance analysis, and rolling forecasts with GL account integration',
    icon: BudgetIcon,
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    // path: '/axis/budget', // Not used in tab navigation
    stats: { label: 'Budget Lines', value: '156' },
    status: 'coming-soon',
  },
  {
    id: 'driver',
    title: 'DRIVER.AI',
    subtitle: 'Driver-Based Planning',
    description: 'Identify key business drivers, perform sensitivity analysis, and create driver-based forecasts',
    icon: DriverIcon,
    color: '#FF9800',
    bgColor: '#FFF3E0',
    // path: '/axis/driver', // Not used in tab navigation
    stats: { label: 'Key Drivers', value: '24' },
    status: 'coming-soon',
  },
  {
    id: 'scenario',
    title: 'SCENARIO.AI',
    subtitle: 'Scenario Planning & What-If',
    description: 'Interactive scenario modeling, Monte Carlo simulations, and multi-scenario comparison',
    icon: ScenarioIcon,
    color: '#9C27B0',
    bgColor: '#F3E5F5',
    // path: '/scenario', // Not used in tab navigation
    stats: { label: 'Active Scenarios', value: '12' },
    status: 'active',
  },
  {
    id: 'insights',
    title: 'INSIGHTS.AI',
    subtitle: 'AI-Powered Business Insights',
    description: 'Automated insight generation, anomaly detection, and prescriptive recommendations',
    icon: InsightsIcon,
    color: '#F44336',
    bgColor: '#FFEBEE',
    // path: '/axis/insights', // Not used in tab navigation
    stats: { label: 'Daily Insights', value: '45' },
    status: 'coming-soon',
  },
];

// Dark mode color helper
const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const AxisAIDashboard = ({ onTileClick, darkMode = false }) => {
  const theme = useTheme();
  const colors = getColors(darkMode);

  const handleModuleClick = (module) => {
    if (module.status === 'active' && onTileClick) {
      onTileClick(module.id);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: colors.background }}>
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
          AXIS.AI Suite
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: theme.palette.text.secondary,
            mb: 3
          }}
        >
          Intelligent Financial Planning & Analysis powered by Advanced AI
        </Typography>
      </Box>

      {/* Module Grid */}
      <Grid container spacing={3}>
        {financeModules.map((module) => {
          const Icon = module.icon;
          const isActive = module.status === 'active';
          
          return (
            <Grid item xs={12} md={6} lg={4} key={module.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'visible',
                  cursor: isActive ? 'pointer' : 'default',
                  opacity: isActive ? 1 : 0.8,
                  transition: 'all 0.3s ease',
                  border: `2px solid ${alpha(module.color, 0.2)}`,
                  bgcolor: colors.cardBg,
                  '&:hover': isActive ? {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${alpha(module.color, 0.15)}`,
                    border: `2px solid ${alpha(module.color, 0.4)}`,
                  } : {},
                }}
                onClick={() => handleModuleClick(module)}
              >
                {!isActive && (
                  <Chip
                    label="Coming Soon"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.dark,
                      fontWeight: 600,
                    }}
                  />
                )}

                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: module.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ fontSize: 32, color: module.color }} />
                    </Box>
                    {isActive && (
                      <IconButton
                        sx={{ 
                          ml: 'auto',
                          color: module.color,
                          '&:hover': {
                            bgcolor: alpha(module.color, 0.1),
                          }
                        }}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Typography
                    variant="h6"
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
                      color: colors.text,
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    {module.subtitle}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.textSecondary,
                      mb: 3,
                      flex: 1,
                    }}
                  >
                    {module.description}
                  </Typography>

                  <Box
                    sx={{
                      pt: 2,
                      mt: 'auto',
                      borderTop: `1px solid ${alpha(module.color, 0.1)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.textSecondary,
                        fontWeight: 500,
                      }}
                    >
                      {module.stats.label}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: module.color,
                        fontWeight: 700,
                      }}
                    >
                      {module.stats.value}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Footer Information */}
      <Box sx={{ mt: 6, p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.text }}>
          Integrated GL Account Mapping
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
          All AXIS.AI modules are integrated with your GL account structure, providing seamless financial analysis from strategic planning down to transaction-level details.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3, color: colors.text }}>
          Real-time Data Synchronization
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Connect directly to your PostgreSQL database for real-time financial data updates, ensuring your forecasts and scenarios are always based on the latest information.
        </Typography>
      </Box>
    </Box>
  );
};

export default AxisAIDashboard;