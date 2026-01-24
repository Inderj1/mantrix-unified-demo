import React from 'react';
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
  Zoom,
  Paper,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  Analytics as AnalyticsIcon,
  QuestionAnswer as ChatIcon,
} from '@mui/icons-material';

// Single consistent blue for all modules
const MODULE_COLOR = '#0078d4';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  secondary: darkMode ? '#2d8ce6' : '#0854a0',
  success: darkMode ? '#36d068' : '#10b981',
  warning: darkMode ? '#f59e0b' : '#f59e0b',
  error: darkMode ? '#ff6b6b' : '#ef4444',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  grey: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const margenModules = [
  {
    id: 'revenue-growth',
    title: 'Revenue & Profitability',
    subtitle: 'Tile 1',
    description: 'Product SKU profitability, customer segments, channel performance with gross margin and contribution analysis',
    icon: TrendingUpIcon,
    color: MODULE_COLOR,
    stats: { label: 'Products', value: '8' },
    status: 'active',
  },
  {
    id: 'cost-cogs',
    title: 'Cash & Working Capital',
    subtitle: 'Tile 2',
    description: 'Distributor AR/AP analysis, DSO/DPO/DIO metrics, cash conversion cycle, and working capital optimization',
    icon: AccountBalanceIcon,
    color: MODULE_COLOR,
    stats: { label: 'Distributors', value: '12' },
    status: 'active',
  },
  {
    id: 'margin-profitability',
    title: 'Growth & Market Position',
    subtitle: 'Tile 3',
    description: 'Brand market share, regional performance, competitor analysis, and growth trajectory insights',
    icon: MoneyIcon,
    color: MODULE_COLOR,
    stats: { label: 'Brands', value: '8' },
    status: 'active',
  },
  {
    id: 'pl-gl-explorer',
    title: 'Executive Summary',
    subtitle: 'Tile 4',
    description: 'COPA margin alerts, GL account summary, financial KPIs, and executive-level profitability overview',
    icon: AssessmentIcon,
    color: MODULE_COLOR,
    stats: { label: 'Alerts', value: '6' },
    status: 'active',
  },
  {
    id: 'drivers-whatif',
    title: 'Action & Accountability',
    subtitle: 'Tile 5',
    description: 'Initiative tracking, owner accountability, impact realization, milestones, and risk mitigation plans',
    icon: AnalyticsIcon,
    color: MODULE_COLOR,
    stats: { label: 'Initiatives', value: '8' },
    status: 'active',
  },
  {
    id: 'ask-margen',
    title: 'ASK.MARGEN',
    subtitle: 'AI Chat Assistant',
    description: 'Conversational interface for margin analytics - ask questions about profitability, P&L, COGS in natural language',
    icon: ChatIcon,
    color: MODULE_COLOR,
    stats: { label: 'AI Assistant', value: 'Active' },
    status: 'active',
  },
];

const MargenAILanding = ({ onTileClick, onBack, darkMode = false }) => {
  const colors = getColors(darkMode);

  const handleTileClick = (moduleId) => {
    console.log('MargenAI tile clicked:', moduleId);
    if (onTileClick) {
      onTileClick(moduleId);
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
      {/* Header with Breadcrumbs */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: colors.textSecondary }} />}>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline', color: colors.primary }
              }}
            >
              CORE.AI
            </Link>
            <Typography sx={{ color: colors.primary }} variant="body1" fontWeight={600}>
              MARGEN.AI
            </Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            size="small"
            sx={{
              borderColor: colors.border,
              color: colors.text,
              '&:hover': {
                borderColor: colors.primary,
                bgcolor: alpha(colors.primary, 0.08)
              }
            }}
          >
            Back
          </Button>
        </Stack>

        {/* System Identity Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 4,
            height: 60,
            bgcolor: MODULE_COLOR,
            borderRadius: 2
          }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: MODULE_COLOR }}>
                <AssessmentIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px', color: colors.text }}>
                MARGEN.AI
              </Typography>
              <Chip
                label="6 Modules"
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
              Arizona Beverages COPA Analytics & Margin Intelligence Platform
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Module Tiles - Exact Stox.AI styling */}
      <Grid container spacing={1.5}>
        {margenModules.map((module, index) => (
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
                    boxShadow: darkMode
                      ? `0 20px 40px ${alpha(module.color, 0.25)}, 0 8px 16px rgba(0,0,0,0.6)`
                      : `0 20px 40px ${alpha(module.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                    borderColor: alpha(module.color, 0.3),
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

      {/* Info Section */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <LightbulbIcon sx={{ color: colors.warning }} />
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            MARGEN.AI provides intelligent margin analytics and COPA insights powered by Arizona Beverages financial data
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default MargenAILanding;
