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
  Timeline as TimelineIcon,
  Sensors as SensorsIcon,
  Hub as HubIcon,
  Balance as BalanceIcon,
  Storage as StorageIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

const ordlyModules = [
  // MTS Flow Tiles (Make-to-Stock Pipeline)
  {
    id: 'demand-signal',
    title: 'Demand Signal',
    subtitle: 'MTS Tile 0',
    description: 'AI-powered demand capture with volatility fingerprinting, hidden constraint detection, and service risk preview',
    icon: SensorsIcon,
    color: '#2b88d8',
    bgColor: '#deecf9',
    stats: { label: 'Signals', value: '47' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #106ebe 0%, #2b88d8 100%)',
  },
  {
    id: 'network-optimizer',
    title: 'Network Optimizer',
    subtitle: 'MTS Tile 1',
    description: 'Multi-node fulfillment optimization with AI explainability, cost breakdown, and risk matrix',
    icon: HubIcon,
    color: '#2b88d8',
    bgColor: '#deecf9',
    stats: { label: 'Options', value: '5' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #106ebe 0%, #2b88d8 100%)',
  },
  {
    id: 'arbitration',
    title: 'Economic Arbitration',
    subtitle: 'MTS Tile 2',
    description: 'Policy guardrails, inventory protection, exception proposals, and approval workflows',
    icon: BalanceIcon,
    color: '#2b88d8',
    bgColor: '#deecf9',
    stats: { label: 'Policies', value: '5/6' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #106ebe 0%, #2b88d8 100%)',
  },
  {
    id: 'sap-commit',
    title: 'SAP Commit & Trace',
    subtitle: 'MTS Tile 3',
    description: 'Pre-commit validation, SAP document preview, decision timeline, and BAPI execution log',
    icon: StorageIcon,
    color: '#2b88d8',
    bgColor: '#deecf9',
    stats: { label: 'Commits', value: '4/5' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #106ebe 0%, #2b88d8 100%)',
  },
  // Learning Loop Tile
  {
    id: 'learning-loop',
    title: 'Learning Loop',
    subtitle: 'MTS Tile 4',
    description: 'Order outcome analysis, ML model confidence updates, and continuous improvement tracking',
    icon: SchoolIcon,
    color: '#2b88d8',
    bgColor: '#deecf9',
    stats: { label: 'Model Gain', value: '+2.1%' },
    status: 'active',
    gradient: 'linear-gradient(135deg, #106ebe 0%, #2b88d8 100%)',
  },
];

const OrdlyAILanding = ({ onTileClick, onBack }) => {
  const handleTileClick = (moduleId) => {
    console.log('OrdlyAI tile clicked:', moduleId);
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
      background: 'linear-gradient(180deg, rgba(8, 84, 160, 0.05) 0%, rgba(255, 255, 255, 1) 50%)',
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
              ORDLY.AI
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
            background: 'linear-gradient(180deg, #106ebe 0%, #2b88d8 100%)',
            borderRadius: 2
          }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#106ebe' }}>
                <TimelineIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px', color: '#106ebe' }}>
                ORDLY.AI
              </Typography>
              <Chip
                label="5 Modules"
                size="small"
                sx={{
                  bgcolor: alpha('#106ebe', 0.1),
                  color: '#106ebe',
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Intelligent Sales Order Management - From Customer Intent to SAP Commitment
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Module Tiles */}
      <Grid container spacing={1.5}>
        {ordlyModules.map((module, index) => (
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

      {/* Info Section */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <LightbulbIcon sx={{ color: 'warning.main' }} />
          <Typography variant="body2" color="text.secondary">
            ORDLY.AI provides intelligent order management from customer intent capture to SAP commitment
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default OrdlyAILanding;
