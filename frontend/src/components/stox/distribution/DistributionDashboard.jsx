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
  Zoom,
  Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  TrendingUp as TrendingUpIcon,
  LocalShipping as LocalShippingIcon,
  Tune as TuneIcon,
  Science as ScienceIcon,
  Inventory as InventoryIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';

// Import centralized brand colors
import { MODULE_COLOR, getColors } from '../../../config/brandColors';

// Distribution tiles configuration - using navy blue (MODULE_COLOR) for consistency
const distributionTiles = [
  {
    id: 'dist-inventory-health-check',
    layer: 1,
    title: 'Inventory Health Check',
    subtitle: 'Health Scoring & Risk Assessment',
    description: 'Real-time inventory health scoring with stockout risk, excess detection, and AI-driven recommendations',
    icon: HealthAndSafetyIcon,
    color: MODULE_COLOR,
    stats: { label: 'Health Score', value: '87%' },
  },
  {
    id: 'dist-demand-variability',
    layer: 2,
    title: 'Demand Variability Intelligence',
    subtitle: 'CV Analysis & Forecast Accuracy',
    description: 'Analyze demand patterns, coefficient of variation, forecast accuracy, and ABC/XYZ classification',
    icon: TrendingUpIcon,
    color: MODULE_COLOR,
    stats: { label: 'Avg CV', value: '0.68' },
  },
  {
    id: 'dist-supply-signal',
    layer: 3,
    title: 'Supply Signal Analyzer',
    subtitle: 'Lead Time & Vendor Reliability',
    description: 'Track supplier lead times, OTD performance, variability metrics, and reliability scoring',
    icon: LocalShippingIcon,
    color: MODULE_COLOR,
    stats: { label: 'Avg OTD', value: '87%' },
  },
  {
    id: 'dist-mrp-parameter',
    layer: 4,
    title: 'MRP Parameter Advisor',
    subtitle: 'Parameter Optimization & Approval',
    description: 'AI-recommended MRP parameter changes with approval workflow and SAP integration',
    icon: TuneIcon,
    color: MODULE_COLOR,
    stats: { label: 'Pending', value: '342' },
  },
  {
    id: 'dist-whatif-simulator',
    layer: 5,
    title: 'What-If Simulator',
    subtitle: 'Monte Carlo & Scenario Planning',
    description: 'Run inventory simulations, compare scenarios, and project outcomes with AI-powered analysis',
    icon: ScienceIcon,
    color: MODULE_COLOR,
    stats: { label: 'Scenarios', value: '3' },
  },
];

const DistributionDashboard = ({ onBack, onTileClick, darkMode = false }) => {
  const colors = getColors(darkMode);

  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100vh',
        bgcolor: colors.background,
        overflow: 'auto',
      }}
    >
      {/* Header with Breadcrumbs - matching StoxAILanding style */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 0,
          mb: 3,
          boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
          bgcolor: colors.paper,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={() => onBack('core')}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              CORE.AI
            </Link>
            <Link
              component="button"
              variant="body1"
              onClick={() => onBack('stox')}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              STOX.AI
            </Link>
            <Typography sx={{ color: colors.primary }} variant="body1" fontWeight={600}>
              Distribution
            </Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => onBack('stox')}
            variant="outlined"
            size="small"
          >
            Back
          </Button>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 4, height: 60, bgcolor: MODULE_COLOR, borderRadius: 2 }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: MODULE_COLOR }}>
                <InventoryIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
                STOX.AI (Distribution)
              </Typography>
              <Chip
                label="5 Tiles"
                size="small"
                sx={{
                  bgcolor: alpha(MODULE_COLOR, darkMode ? 0.2 : 0.1),
                  color: MODULE_COLOR,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Made-to-Stock Analytics Platform
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tiles Grid - 4 tiles in first row, 1 in second */}
      <Grid container spacing={1.5}>
        {distributionTiles.map((tile, index) => (
          <Grid item xs={12} sm={6} md={3} key={tile.id}>
            <Zoom in timeout={200 + index * 100}>
              <Card
                sx={{
                  height: 200,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 3,
                  position: 'relative',
                  bgcolor: colors.cardBg,
                  boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 20px 40px ${alpha(tile.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                    '& .tile-icon': { transform: 'scale(1.1)', bgcolor: tile.color, color: 'white' },
                    '& .tile-arrow': { opacity: 1, transform: 'translateX(4px)' },
                  },
                }}
                onClick={() => onTileClick && onTileClick(tile.id)}
              >
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Avatar
                      className="tile-icon"
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(tile.color, darkMode ? 0.2 : 0.1),
                        color: tile.color,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <tile.icon sx={{ fontSize: 22 }} />
                    </Avatar>
                    <Chip
                      label={`Tile ${tile.layer}`}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: tile.color,
                        color: 'white',
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, color: tile.color, mb: 0.5, fontSize: '0.9rem' }}
                  >
                    {tile.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.textSecondary,
                      fontWeight: 500,
                      mb: 1,
                      fontSize: '0.7rem',
                      opacity: 0.8,
                    }}
                  >
                    {tile.subtitle}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.textSecondary,
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
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 1,
                      pt: 1,
                      borderTop: '1px solid',
                      borderColor: alpha(tile.color, darkMode ? 0.2 : 0.1),
                    }}
                  >
                    <Typography variant="body2" sx={{ color: tile.color, fontWeight: 600, fontSize: '0.7rem' }}>
                      Explore
                    </Typography>
                    <ArrowForwardIcon
                      className="tile-arrow"
                      sx={{ color: tile.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Footer Info - matching StoxAILanding style */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <LightbulbIcon sx={{ color: 'warning.main' }} />
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Follow the workflow: Health Check → Demand Intelligence → Supply Analyzer → MRP Advisor → What-If Simulator
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default DistributionDashboard;
