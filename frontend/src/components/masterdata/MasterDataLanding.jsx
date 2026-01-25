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
  Zoom,
  Paper,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Lightbulb as LightbulbIcon,
  Hub as HubIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

// Import sub-module components
import GLAIModule from './GLAIModule';
import BPAIModule from './BPAIModule';

// Import centralized brand colors
import { MODULE_COLOR } from '../../config/brandColors';

// MASTER.AI Modules - 2 sub-modules
const masterDataModules = [
  {
    id: 'gl-ai',
    title: 'GL.AI',
    subtitle: 'GL Master Data Migration Intelligence',
    description: 'Semantic account matching to YCOA with field-level AI recommendations (Open Item, Sort Key, Line Item Display) based on 1-year transaction analysis',
    icon: AccountBalanceIcon,
    color: MODULE_COLOR,
    stats: { label: 'SKA1/SKB1 Fields', value: '55+' },
    status: 'active',
  },
  {
    id: 'bp-ai',
    title: 'BP.AI',
    subtitle: 'Business Partner Migration Intelligence',
    description: 'Entity resolution across customer/vendor masters with field-level recommendations for BP roles, groupings, and partner functions based on transaction patterns',
    icon: PeopleIcon,
    color: MODULE_COLOR,
    stats: { label: 'KNA1/LFA1 Fields', value: '80+' },
    status: 'active',
  },
];

const MasterDataLanding = ({ onBack, darkMode = false }) => {
  const [selectedModule, setSelectedModule] = useState(null);

  const handleModuleClick = (moduleId) => {
    setSelectedModule(moduleId);
  };

  const handleBackToMain = () => {
    setSelectedModule(null);
  };

  // Render Sub-Module Components
  if (selectedModule === 'gl-ai') {
    return <GLAIModule onBack={handleBackToMain} darkMode={darkMode} />;
  }
  if (selectedModule === 'bp-ai') {
    return <BPAIModule onBack={handleBackToMain} darkMode={darkMode} />;
  }

  // Main Landing View
  return (
    <Box sx={{
      p: 3,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: darkMode
        ? 'linear-gradient(180deg, rgba(0, 53, 122, 0.1) 0%, #0d1117 50%)'
        : 'linear-gradient(180deg, rgba(0, 53, 122, 0.05) 0%, rgba(255, 255, 255, 1) 50%)',
    }}>
      {/* Header with Breadcrumbs */}
      <Paper elevation={0} sx={{
        p: 2,
        borderRadius: 0,
        mb: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        bgcolor: darkMode ? '#161b22' : 'white',
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: darkMode ? '#e6edf3' : 'text.primary',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              CORE.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              MASTER.AI
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
                <HubIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{
                letterSpacing: '-0.5px',
                color: darkMode ? '#e6edf3' : MODULE_COLOR
              }}>
                MASTER.AI
              </Typography>
              <Chip
                label="2 Modules"
                size="small"
                sx={{
                  bgcolor: alpha(MODULE_COLOR, 0.1),
                  color: MODULE_COLOR,
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{
              fontSize: '0.85rem',
              color: darkMode ? '#8b949e' : 'text.secondary'
            }}>
              Master Data Intelligence Engine - AI-powered data migration and governance for S/4HANA transformations
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Module Tiles */}
      <Grid container spacing={2}>
        {masterDataModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
            <Zoom in timeout={200 + index * 50}>
              <Card
                sx={{
                  height: 220,
                  cursor: module.status === 'active' ? 'pointer' : 'default',
                  opacity: module.status === 'coming-soon' ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  bgcolor: darkMode ? '#161b22' : 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': module.status === 'active' ? {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 20px 40px ${alpha(module.color, 0.15)}, 0 8px 16px rgba(0,0,0,0.08)`,
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
                onClick={() => module.status === 'active' && handleModuleClick(module.id)}
              >
                <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Icon and Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      className="module-icon"
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: alpha(module.color, darkMode ? 0.2 : 0.1),
                        color: module.color,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <module.icon sx={{ fontSize: 26 }} />
                    </Avatar>
                    {module.status === 'coming-soon' && (
                      <Chip label="Soon" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#64748b', 0.1), color: '#64748b', fontWeight: 600 }} />
                    )}
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    color: module.color,
                    mb: 0.5,
                    fontSize: '1rem',
                    lineHeight: 1.3
                  }}>
                    {module.title}
                  </Typography>

                  {/* Subtitle */}
                  <Typography variant="caption" sx={{
                    color: darkMode ? '#8b949e' : 'text.secondary',
                    fontWeight: 500,
                    mb: 1,
                    fontSize: '0.75rem',
                    opacity: 0.9
                  }}>
                    {module.subtitle}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" sx={{
                    color: darkMode ? '#8b949e' : 'text.secondary',
                    mb: 'auto',
                    lineHeight: 1.5,
                    fontSize: '0.75rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {module.description}
                  </Typography>

                  {/* Footer */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1.5,
                    pt: 1.5,
                    borderTop: '1px solid',
                    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : alpha(module.color, 0.1)
                  }}>
                    <Chip
                      label={`${module.stats.value} ${module.stats.label}`}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.7rem',
                        bgcolor: alpha(module.color, darkMode ? 0.15 : 0.08),
                        color: module.color,
                        fontWeight: 600
                      }}
                    />
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

      {/* Info Section */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <LightbulbIcon sx={{ color: 'warning.main' }} />
          <Typography variant="body2" sx={{ color: darkMode ? '#8b949e' : 'text.secondary' }}>
            YCOA defaults + AI-driven field overrides with evidence-based rationale for every recommendation
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default MasterDataLanding;
