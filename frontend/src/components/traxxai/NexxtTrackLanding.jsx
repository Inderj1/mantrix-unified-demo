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
  Paper,
  Zoom,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Sensors as SensorsIcon,
  Inventory as InventoryIcon,
  Map as MapIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';

// Single consistent blue for all modules
const MODULE_COLOR = '#0078d4';

// TRACK AI Module Tiles - Blue palette
const nexxtTrackModules = [
  {
    id: 'nexxt-smade',
    title: 'Tracking Map',
    subtitle: 'Real-Time IoT Visualization',
    description: 'GPS and IoT tracking of surgical kits with AI-powered chat, facility visualization, and alert monitoring',
    icon: SensorsIcon,
    color: MODULE_COLOR,
    stats: { label: 'Live Trackers', value: '248' },
    status: 'active',
  },
  {
    id: 'nexxt-operations',
    title: 'Operations',
    subtitle: 'Tracker Management',
    description: 'Tabular view of all SMADE trackers with lifecycle events, battery status, autoclave cycles, and alerts',
    icon: InventoryIcon,
    color: MODULE_COLOR,
    stats: { label: 'Active Alerts', value: '12' },
    status: 'active',
  },
];

const NexxtTrackLanding = ({ onBack, onTileClick }) => {
  const handleTileClick = (moduleId) => {
    console.log('TRACK AI tile clicked:', moduleId);
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
              TRAXX.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              TRACK AI
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
            Back to TRAXX.AI
          </Button>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha(MODULE_COLOR, 0.1),
            }}
          >
            <SensorsIcon sx={{ fontSize: 36, color: MODULE_COLOR }} />
          </Avatar>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h4" fontWeight={700} sx={{ color: MODULE_COLOR }}>
                TRACK AI
              </Typography>
              <Chip
                label="IoT"
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: alpha(MODULE_COLOR, 0.15),
                  color: MODULE_COLOR,
                }}
              />
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Real-Time IoT Intelligence for Surgical Kit Tracking
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Module Tiles */}
      <Grid container spacing={2}>
        {nexxtTrackModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={6} lg={4} key={module.id}>
            <Zoom in timeout={200 + index * 50}>
              <Card
                sx={{
                  height: 220,
                  cursor: module.status === 'active' ? 'pointer' : 'default',
                  opacity: module.status === 'coming-soon' ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': module.status === 'active' ? {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 20px 40px ${alpha(module.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
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
                <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Icon and Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      className="module-icon"
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: alpha(module.color, 0.1),
                        color: module.color,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <module.icon sx={{ fontSize: 26 }} />
                    </Avatar>
                    {module.status === 'coming-soon' && (
                      <Chip label="Soon" size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6', fontWeight: 600 }} />
                    )}
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" sx={{ fontWeight: 700, color: module.color, mb: 0.5, fontSize: '1rem', lineHeight: 1.3 }}>
                    {module.title}
                  </Typography>

                  {/* Subtitle */}
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, fontSize: '0.75rem', opacity: 0.8 }}>
                    {module.subtitle}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.5, fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {module.description}
                  </Typography>

                  {/* Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: alpha(module.color, 0.1) }}>
                    <Chip label={`${module.stats.value} ${module.stats.label}`} size="small" sx={{ height: 24, fontSize: '0.7rem', bgcolor: alpha(module.color, 0.1), color: module.color, fontWeight: 600 }} />
                    {module.status === 'active' && (
                      <ArrowForwardIcon className="module-arrow" sx={{ color: module.color, fontSize: 20, opacity: 0.5, transition: 'all 0.3s ease' }} />
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

export default NexxtTrackLanding;
