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
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

const margenModules = [
  {
    id: 'revenue-growth',
    title: 'Revenue & Growth Analytics',
    subtitle: 'Financial Performance',
    description: 'Top-line revenue performance, growth trends, and sales analysis by product, customer, channel, and region',
    icon: TrendingUpIcon,
    color: '#6a6d70',
    bgColor: '#d1fae5',
    stats: { label: 'Revenue', value: '$33.5M' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #6a6d70 0%, #6a6d70 100%)',
  },
  {
    id: 'cost-cogs',
    title: 'Cost & COGS Analysis',
    subtitle: 'Financial Performance',
    description: 'Cost structure breakdown, COGS components, operating expenses, and cost optimization opportunities',
    icon: AccountBalanceIcon,
    color: '#0a6ed1',
    bgColor: '#dbeafe',
    stats: { label: 'COGS', value: '$23.3M' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0a6ed1 0%, #0854a0 100%)',
  },
  {
    id: 'margin-profitability',
    title: 'Margin & Profitability',
    subtitle: 'Financial Performance',
    description: 'Gross margin, operating margin, contribution analysis, and profitability by segment with margin waterfalls',
    icon: MoneyIcon,
    color: '#354a5f',
    bgColor: '#f3e8ff',
    stats: { label: 'Gross Margin', value: '30.4%' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #354a5f 0%, #32363a 100%)',
  },
  {
    id: 'pl-gl-explorer',
    title: 'P&L Statement & GL Explorer',
    subtitle: 'Financial Statements',
    description: 'Complete P&L view, GL account-level detail, variance analysis, and financial reconciliation with drill-down',
    icon: AssessmentIcon,
    color: '#f97316',
    bgColor: '#ffedd5',
    stats: { label: 'GL Accounts', value: '247' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  },
  {
    id: 'drivers-whatif',
    title: 'Financial Drivers & What-If',
    subtitle: 'Planning & Forecasting',
    description: 'Key value drivers, scenario modeling, sensitivity analysis, and forecasted P&L impact for strategic planning',
    icon: AnalyticsIcon,
    color: '#06b6d4',
    bgColor: '#cffafe',
    stats: { label: 'Scenarios', value: '8' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },
];

const MargenAILanding = ({ onTileClick, onBack }) => {
  const theme = useTheme();

  const handleTileClick = (moduleId) => {
    console.log('MargenAI tile clicked:', moduleId);
    if (onTileClick) {
      onTileClick(moduleId);
    }
  };

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
              CORE.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              MARGEN.AI
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
              bgcolor: alpha('#6a6d70', 0.1),
            }}
          >
            <AssessmentIcon sx={{ fontSize: 36, color: '#6a6d70' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              MARGEN.AI
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Margin Intelligence & Financial Analytics Platform
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Module Tiles */}
      <Grid container spacing={2} sx={{ maxWidth: 1400, mx: 'auto' }}>
        {margenModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={module.id}>
            <Zoom in timeout={400 + index * 100}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'white',
                  border: `2px solid ${alpha(module.color, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
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
                        bgcolor: 'transparent',
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
                              bgcolor: 'transparent',
                              color: module.color,
                              fontWeight: 600,
                              mb: 1,
                              border: `1px solid ${alpha(module.color, 0.2)}`,
                            }}
                          />
                        </Box>
                        <IconButton
                          className="action-icon"
                          sx={{
                            bgcolor: 'transparent',
                            color: module.color,
                            transition: 'transform 0.2s',
                            border: `1px solid ${alpha(module.color, 0.2)}`,
                            '&:hover': {
                              bgcolor: alpha(module.color, 0.05),
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
                            bgcolor: 'transparent',
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
                              bgcolor: 'transparent',
                              color: '#6a6d70',
                              fontWeight: 600,
                              border: `1px solid ${alpha('#6a6d70', 0.2)}`,
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
  );
};

export default MargenAILanding;
