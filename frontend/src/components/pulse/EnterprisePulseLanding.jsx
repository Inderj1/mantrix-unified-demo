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
} from '@mui/material';
import {
  NotificationsActive as AlertsIcon,
  SmartToy as AgentsIcon,
  Radar as RadarIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

// Blue color palette - theme aware
const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  secondary: darkMode ? '#2d8ce6' : '#0854a0',
  warning: darkMode ? '#f59e0b' : '#f59e0b',
  error: darkMode ? '#ff6b6b' : '#ef4444',
  text: darkMode ? '#e6edf3' : '#1e293b',
  grey: darkMode ? '#8b949e' : '#3b82f6',
});

const EnterprisePulseLanding = ({ onTileClick, alertCount = 0, agentCount = 0, darkMode = false }) => {
  const colors = getColors(darkMode);
  const tiles = [
    {
      id: 'alerts',
      title: 'ML Insights',
      subtitle: 'Proactive Intelligence',
      description: 'Business insights from ML models - pricing optimization, margin protection, customer retention',
      icon: AlertsIcon,
      color: colors.primary,
      gradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      stats: { label: 'Active', value: alertCount },
    },
    {
      id: 'agents',
      title: 'AI Agents',
      subtitle: 'ML Model Monitoring',
      description: 'Configure proactive agents that monitor pricing, customers, and operations to surface opportunities',
      icon: AgentsIcon,
      color: colors.primary,
      gradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      stats: { label: 'Active', value: agentCount },
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
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
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid',
                    borderColor: alpha(tile.color, 0.15),
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
                      background: tile.gradient,
                      opacity: 0.8,
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha(tile.color, 0.15)}`,
                      borderColor: tile.color,
                      '& .module-icon': {
                        transform: 'scale(1.15)',
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
