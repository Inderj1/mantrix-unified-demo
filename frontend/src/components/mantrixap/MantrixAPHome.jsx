import React from 'react';
import {
  Box, Typography, Card, CardContent, Avatar, Chip, Grid, Breadcrumbs, Link, Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Receipt as ReceiptIcon,
  MonitorHeart as MonitorHeartIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { MODULE_NAVY, NAVY_BLUE } from './apTheme';
import { getColors } from '../../config/brandColors';

const tiles = [
  {
    id: 'mantrixap-workbench',
    title: 'AP Workbench',
    subtitle: 'Invoice Processing & Workflow',
    description: 'AI-powered invoice intake, 3-way matching, exception handling, and automated SAP posting across Inbox, Workbench, and My Work views.',
    icon: ReceiptIcon,
    stats: '3 Tabs',
    color: MODULE_NAVY,
  },
  {
    id: 'mantrixap-monitor',
    title: 'AP Monitor',
    subtitle: 'SAP Posting & Pipeline',
    description: 'Real-time SAP posting monitor with KPI tracking, queue status, parked invoice management, failure analysis, and error guide.',
    icon: MonitorHeartIcon,
    stats: '6 Tabs',
    color: MODULE_NAVY,
  },
];

export default function MantrixAPHome({ onNavigate, onBack, darkMode = false }) {
  const colors = getColors(darkMode);

  return (
    <Box sx={{ p: 3, minHeight: '100%' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ cursor: 'pointer', fontSize: '0.8rem', color: colors.textSecondary, fontWeight: 500 }}
          onClick={onBack}
        >
          CORE.AI
        </Link>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: MODULE_NAVY }}>AP.AI</Typography>
      </Breadcrumbs>

      {/* Module Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            textTransform: 'none', fontWeight: 600, borderRadius: 2,
            color: darkMode ? '#e6edf3' : MODULE_NAVY,
            bgcolor: darkMode ? alpha('#e6edf3', 0.08) : alpha(MODULE_NAVY, 0.06),
            '&:hover': { bgcolor: darkMode ? alpha('#e6edf3', 0.14) : alpha(MODULE_NAVY, 0.12) },
          }}
        >
          Back
        </Button>
        <Avatar sx={{
          width: 44, height: 44,
          bgcolor: alpha(MODULE_NAVY, darkMode ? 0.25 : 0.1),
          color: darkMode ? '#90caf9' : MODULE_NAVY,
        }}>
          <ReceiptIcon sx={{ fontSize: 24 }} />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: darkMode ? '#e6edf3' : MODULE_NAVY }}>
            AP.AI
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
            Accounts Payable Intelligence
          </Typography>
        </Box>
      </Box>

      {/* Tile Cards */}
      <Grid container spacing={3}>
        {tiles.map((tile) => (
          <Grid item xs={12} sm={6} md={4} key={tile.id}>
            <Card
              sx={{
                height: 220,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: `1px solid ${colors.border}`,
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: colors.cardBg,
                boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: `0 20px 40px ${alpha(tile.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                  '& .tile-icon': {
                    transform: 'scale(1.1)',
                    bgcolor: tile.color,
                    color: 'white',
                  },
                  '& .tile-arrow': {
                    opacity: 1,
                    transform: 'translateX(4px)',
                  },
                },
              }}
              onClick={() => onNavigate(tile.id)}
            >
              <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Avatar
                    className="tile-icon"
                    sx={{
                      width: 40, height: 40,
                      bgcolor: alpha(tile.color, darkMode ? 0.2 : 0.1),
                      color: tile.color,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <tile.icon sx={{ fontSize: 22 }} />
                  </Avatar>
                </Box>

                <Typography variant="body1" sx={{ fontWeight: 700, color: tile.color, mb: 0.5, fontSize: '0.9rem' }}>
                  {tile.title}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 500, mb: 1, fontSize: '0.7rem' }}>
                  {tile.subtitle}
                </Typography>
                <Typography variant="body2" sx={{
                  color: colors.textSecondary, mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {tile.description}
                </Typography>

                <Box sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(tile.color, 0.1),
                }}>
                  <Chip
                    label={tile.stats}
                    size="small"
                    sx={{ bgcolor: alpha(tile.color, darkMode ? 0.2 : 0.08), color: tile.color, fontWeight: 600 }}
                  />
                  <ArrowForwardIcon
                    className="tile-arrow"
                    sx={{ color: tile.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
