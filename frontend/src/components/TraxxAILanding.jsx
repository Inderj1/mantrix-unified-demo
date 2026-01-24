import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Button,
  alpha,
  Zoom,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Engineering as EquipmentIcon,
  Dashboard as DashboardIcon,
  PlaylistAddCheck as ActionIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';

// Import TRAXX.AI Tile Components
import KitControlTower from './traxxai/KitControlTower';
import WhoMustActNow from './traxxai/WhoMustActNow';
import LogisticsEconomics from './traxxai/LogisticsEconomics';
import RealizedMarginCash from './traxxai/RealizedMarginCash';
import SurgeryReadiness from './traxxai/SurgeryReadiness';

// Import centralized brand colors
import { MODULE_COLOR } from '../config/brandColors';

// Main Tiles - Direct access from TRAXX.AI landing (5 tiles) - Consistent blue
const mainTiles = [
  {
    id: 'kit-control-tower',
    title: 'Kit Control Tower',
    subtitle: 'Real-Time Kit Visibility',
    description: 'Full operational visibility of surgical kits with IoT telemetry, status tracking, and instance economics',
    icon: DashboardIcon,
    color: MODULE_COLOR,
    stats: { label: 'Tracked', value: '248' },
  },
  {
    id: 'who-must-act-now',
    title: 'Who Must Act Now',
    subtitle: 'Accountability Queue',
    description: 'Prioritized action queue with escalation tracking, ownership assignment, and workflow management',
    icon: ActionIcon,
    color: MODULE_COLOR,
    stats: { label: 'Pending', value: '12' },
  },
  {
    id: 'logistics-economics',
    title: 'Logistics Economics',
    subtitle: 'Transport Cost Optimization',
    description: 'Planned vs actual freight analysis with cost variance tracking and AI-powered optimization recommendations',
    icon: MoneyIcon,
    color: MODULE_COLOR,
    stats: { label: 'Freight', value: '$8.4K' },
  },
  {
    id: 'realized-margin-cash',
    title: 'Realized Margin & Cash',
    subtitle: 'Case Profitability Analytics',
    description: 'EBITDA waterfall analysis, cash velocity tracking, DSO monitoring, and margin performance by case',
    icon: AssessmentIcon,
    color: MODULE_COLOR,
    stats: { label: 'Margin', value: '62.4%' },
  },
  {
    id: 'surgery-readiness',
    title: 'Surgery Readiness',
    subtitle: 'Predictive Operations',
    description: 'Will scheduled surgeries succeed? Kit integrity, component availability, and on-time confidence scoring',
    icon: HospitalIcon,
    color: MODULE_COLOR,
    stats: { label: 'Score', value: '84' },
  },
];

const TraxxAILanding = ({ onTileClick, onBack }) => {
  const [selectedTile, setSelectedTile] = useState(null); // For rendering full tile components

  // Handle main tile click - render the component directly
  const handleMainTileClick = (tileId) => {
    console.log('TraxxAI main tile clicked:', tileId);
    setSelectedTile(tileId);
  };

  const handleBackToMain = () => {
    setSelectedTile(null);
  };

  // Render Main Tile Components
  if (selectedTile === 'kit-control-tower') {
    return <KitControlTower onBack={handleBackToMain} />;
  }
  if (selectedTile === 'who-must-act-now') {
    return <WhoMustActNow onBack={handleBackToMain} />;
  }
  if (selectedTile === 'logistics-economics') {
    return <LogisticsEconomics onBack={handleBackToMain} />;
  }
  if (selectedTile === 'realized-margin-cash') {
    return <RealizedMarginCash onBack={handleBackToMain} />;
  }
  if (selectedTile === 'surgery-readiness') {
    return <SurgeryReadiness onBack={handleBackToMain} />;
  }

  // Render Main Landing View with 5 Tiles
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
        {/* Header */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 0, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Box sx={{ maxWidth: 1400, mx: 'auto', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: MODULE_COLOR,
                    }}
                  >
                    <EquipmentIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ color: MODULE_COLOR }}>
                      TRAXX.AI
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Asset Tracking Intelligence Platform
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
                Back to CORE.AI
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* Main Tiles Section */}
            <Grid container spacing={1.5}>
              {mainTiles.map((tile, index) => (
                <Grid item xs={12} sm={6} md={3} lg={3} key={tile.id}>
                  <Zoom in timeout={200 + index * 50}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: 'white',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        height: 200,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: `0 20px 40px ${alpha(tile.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                          '& .tile-icon': {
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
                      onClick={() => handleMainTileClick(tile.id)}
                    >
                      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Icon */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Avatar
                            className="tile-icon"
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: alpha(tile.color, 0.1),
                              color: tile.color,
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <tile.icon sx={{ fontSize: 22 }} />
                          </Avatar>
                        </Box>

                        {/* Title */}
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            color: tile.color,
                            mb: 0.5,
                            fontSize: '0.9rem',
                            lineHeight: 1.3,
                          }}
                        >
                          {tile.title}
                        </Typography>

                        {/* Subtitle */}
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            mb: 1,
                            opacity: 0.8,
                          }}
                        >
                          {tile.subtitle}
                        </Typography>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            mb: 'auto',
                            lineHeight: 1.4,
                            fontSize: '0.7rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {tile.description}
                        </Typography>

                        {/* Footer */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(tile.color, 0.1) }}>
                          <Chip
                            label={`${tile.stats.value} ${tile.stats.label}`}
                            size="small"
                            sx={{
                              bgcolor: alpha(tile.color, 0.08),
                              color: tile.color,
                              fontWeight: 600,
                              fontSize: '0.65rem',
                              height: 22,
                            }}
                          />
                          <ArrowForwardIcon className="module-arrow" sx={{ color: tile.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    );
};

export default TraxxAILanding;
