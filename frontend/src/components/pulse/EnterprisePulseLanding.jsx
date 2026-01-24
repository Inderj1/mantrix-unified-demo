import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  alpha,
  Zoom,
  Paper,
} from '@mui/material';
import {
  NotificationsActive as AlertsIcon,
  SmartToy as AgentsIcon,
  Radar as RadarIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

// Single consistent blue for all modules
const MODULE_COLOR = '#0078d4';

// Blue color palette - theme aware
const getColors = (darkMode) => ({
  primary: MODULE_COLOR,
  secondary: MODULE_COLOR,
  warning: darkMode ? '#f59e0b' : '#f59e0b',
  error: darkMode ? '#ff6b6b' : '#ef4444',
  text: darkMode ? '#e6edf3' : '#1e293b',
  grey: darkMode ? '#8b949e' : '#64748b',
});

const EnterprisePulseLanding = ({ onTileClick, alertCount = 0, agentCount = 0, darkMode = false }) => {
  const colors = getColors(darkMode);
  const tiles = [
    {
      id: 'alerts',
      title: 'Proactive Alerts',
      subtitle: 'AI-Driven Intelligence',
      description: 'Real-time alerts from AI agents monitoring pricing, margins, customers, and operations',
      icon: AlertsIcon,
      color: colors.primary,
      gradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      stats: { label: 'Active', value: alertCount },
    },
    {
      id: 'agents',
      title: 'AI Agents',
      subtitle: 'Autonomous Monitoring',
      description: 'Configure intelligent agents that continuously monitor business operations and surface opportunities',
      icon: AgentsIcon,
      color: colors.primary,
      gradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      stats: { label: 'Active', value: agentCount },
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 14px ${alpha(colors.primary, 0.3)}`,
            }}
          >
            <RadarIcon sx={{ fontSize: 24, color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
              Enterprise Pulse
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grey }}>
              Proactive monitoring and alerting for business operations
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tiles Grid - matching REVEQ style */}
      <Grid container spacing={1.5}>
        {tiles.map((tile, index) => {
          const TileIcon = tile.icon;
          return (
            <Grid item xs={12} sm={6} md={3} lg={3} key={tile.id}>
              <Zoom in timeout={200 + index * 50}>
                <Card
                  onClick={() => onTileClick(tile.id)}
                  sx={{
                    height: 200,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    bgcolor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 20px 40px ${alpha(tile.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                      '& .module-icon': {
                        transform: 'scale(1.1)',
                        bgcolor: tile.color,
                        color: 'white',
                      },
                      '& .module-arrow': {
                        opacity: 1,
                        transform: 'translateX(4px)',
                      },
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Icon and Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Avatar
                        className="module-icon"
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: alpha(tile.color, 0.1),
                          color: tile.color,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <TileIcon sx={{ fontSize: 22 }} />
                      </Avatar>
                    </Box>

                    {/* Title */}
                    <Typography variant="body1" sx={{ fontWeight: 700, color: tile.color, mb: 0.5, fontSize: '0.9rem', lineHeight: 1.3 }}>
                      {tile.title}
                    </Typography>

                    {/* Subtitle */}
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>
                      {tile.subtitle}
                    </Typography>

                    {/* Description */}
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {tile.description}
                    </Typography>

                    {/* Footer */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(tile.color, 0.1) }}>
                      <Chip label={`${tile.stats.value} ${tile.stats.label}`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(tile.color, 0.08), color: tile.color, fontWeight: 600 }} />
                      <ArrowForwardIcon className="module-arrow" sx={{ color: tile.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default EnterprisePulseLanding;
