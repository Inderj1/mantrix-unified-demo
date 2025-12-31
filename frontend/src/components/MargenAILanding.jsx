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

const margenModules = [
  {
    id: 'revenue-growth',
    title: 'Revenue & Profitability',
    subtitle: 'Tile 1',
    description: 'Product SKU profitability, customer segments, channel performance with gross margin and contribution analysis',
    icon: TrendingUpIcon,
    color: '#1e40af',
    bgColor: '#dbeafe',
    stats: { label: 'Products', value: '8' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
  },
  {
    id: 'cost-cogs',
    title: 'Cash & Working Capital',
    subtitle: 'Tile 2',
    description: 'Distributor AR/AP analysis, DSO/DPO/DIO metrics, cash conversion cycle, and working capital optimization',
    icon: AccountBalanceIcon,
    color: '#0a6ed1',
    bgColor: '#dbeafe',
    stats: { label: 'Distributors', value: '12' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0a6ed1 0%, #0854a0 100%)',
  },
  {
    id: 'margin-profitability',
    title: 'Growth & Market Position',
    subtitle: 'Tile 3',
    description: 'Brand market share, regional performance, competitor analysis, and growth trajectory insights',
    icon: MoneyIcon,
    color: '#0854a0',
    bgColor: '#dbeafe',
    stats: { label: 'Brands', value: '8' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0854a0 0%, #1d4ed8 100%)',
  },
  {
    id: 'pl-gl-explorer',
    title: 'Executive Summary',
    subtitle: 'Tile 4',
    description: 'COPA margin alerts, GL account summary, financial KPIs, and executive-level profitability overview',
    icon: AssessmentIcon,
    color: '#2563eb',
    bgColor: '#dbeafe',
    stats: { label: 'Alerts', value: '6' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  },
  {
    id: 'drivers-whatif',
    title: 'Action & Accountability',
    subtitle: 'Tile 5',
    description: 'Initiative tracking, owner accountability, impact realization, milestones, and risk mitigation plans',
    icon: AnalyticsIcon,
    color: '#0ea5e9',
    bgColor: '#e0f2fe',
    stats: { label: 'Initiatives', value: '8' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
  },
  {
    id: 'ask-margen',
    title: 'ASK.MARGEN',
    subtitle: 'AI Chat Assistant',
    description: 'Conversational interface for margin analytics - ask questions about profitability, P&L, COGS in natural language',
    icon: ChatIcon,
    color: '#1e3a5f',
    bgColor: '#e2e8f0',
    stats: { label: 'AI Assistant', value: 'Active' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
  },
];

const MargenAILanding = ({ onTileClick, onBack }) => {
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
      background: 'linear-gradient(180deg, rgba(10, 110, 209, 0.05) 0%, rgba(255, 255, 255, 1) 50%)',
    }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
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
              MARGEN.AI
            </Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            size="small"
            sx={{ borderColor: 'divider' }}
          >
            Back
          </Button>
        </Stack>

        {/* System Identity Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{
            width: 4,
            height: 60,
            background: 'linear-gradient(180deg, #0a6ed1 0%, #0854a0 100%)',
            borderRadius: 2
          }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#0a6ed1' }}>
                <AssessmentIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px', color: '#0a6ed1' }}>
                MARGEN.AI
              </Typography>
              <Chip
                label="6 Modules"
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
              Arizona Beverages COPA Analytics & Margin Intelligence Platform
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Module Tiles - Exact Stox.AI styling */}
      <Grid container spacing={1.5}>
        {margenModules.map((module, index) => (
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

      {/* Info Section */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <LightbulbIcon sx={{ color: 'warning.main' }} />
          <Typography variant="body2" color="text.secondary">
            MARGEN.AI provides intelligent margin analytics and COPA insights powered by Arizona Beverages financial data
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default MargenAILanding;
