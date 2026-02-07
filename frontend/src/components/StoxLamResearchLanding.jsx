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
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Verified as VerifiedIcon,
  AccountBalance as AccountBalanceIcon,
  ShowChart as ShowChartIcon,
  Warning as WarningIcon,
  Tune as TuneIcon,
  Speed as SpeedIcon,
  PieChart as PieChartIcon,
  Memory as MemoryIcon,
} from '@mui/icons-material';
import { MODULE_COLOR, getColors } from '../config/brandColors';

const tiles = [
  {
    id: 'lam-economic-ground-truth',
    title: 'Economic Ground Truth',
    subtitle: 'Foundation Layer',
    description: 'Cost integrity scoring, trust classification, and economic interpretability for all SKUs',
    icon: VerifiedIcon,
    color: MODULE_COLOR,
    stats: { label: 'Trust Score', value: '84.2%' },
  },
  {
    id: 'lam-inventory-capital-health',
    title: 'Inventory Capital Health',
    subtitle: 'Balance Sheet Lens',
    description: 'Dual quantity-capital decomposition with ROIC, carry cost, and aging analysis',
    icon: AccountBalanceIcon,
    color: MODULE_COLOR,
    stats: { label: 'Capital', value: '$42.8M' },
  },
  {
    id: 'lam-demand-supply-command',
    title: 'Demand vs Supply Command',
    subtitle: 'Operational Heart',
    description: '12-week demand/supply netting with shortage alerts, coverage tracking, and waterfall drill-down',
    icon: ShowChartIcon,
    color: MODULE_COLOR,
    stats: { label: 'Gap', value: '-22,780 EA' },
  },
  {
    id: 'lam-supply-risk',
    title: 'Supply Risk & Vendor Perf.',
    subtitle: 'External Risk Lens',
    description: 'Vendor OTD tracking, lead time variability, safety stock burden, and risk premium analysis',
    icon: WarningIcon,
    color: MODULE_COLOR,
    stats: { label: 'OTD', value: '78%' },
  },
  {
    id: 'lam-safety-stock-economics',
    title: 'Safety Stock Economics',
    subtitle: 'Decision Engine',
    description: 'Optimal SS recommendations with capital release/invest trade-offs and SAP parameter changes',
    icon: TuneIcon,
    color: MODULE_COLOR,
    stats: { label: 'Net Release', value: '$2.8M' },
  },
  {
    id: 'lam-mrp-signal-quality',
    title: 'MRP Signal Quality',
    subtitle: 'Internal Noise Lens',
    description: 'Signal-to-noise analysis, false PO detection, planner waste quantification, and root cause fixes',
    icon: SpeedIcon,
    color: MODULE_COLOR,
    stats: { label: 'Actionable', value: '26%' },
  },
  {
    id: 'lam-capital-impact-simulator',
    title: 'Capital Impact Simulator',
    subtitle: 'CFO / Board Lens',
    description: 'Monte Carlo scenarios, working capital projection, EBITDA impact, and board-ready memo generation',
    icon: PieChartIcon,
    color: MODULE_COLOR,
    stats: { label: 'WC Released', value: '$8.4M' },
  },
];

const StoxLamResearchLanding = ({ onTileClick, onBack, darkMode = false }) => {
  const colors = getColors(darkMode);

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', overflowX: 'hidden', bgcolor: colors.background }}>
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
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline' } }}>
              CORE.AI
            </Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline' } }}>
              STOX.AI
            </Link>
            <Typography sx={{ color: colors.primary }} variant="body1" fontWeight={600}>
              Lam Research
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
            Back to STOX.AI
          </Button>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: MODULE_COLOR }}>
                <MemoryIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
                STOX (MFG — LAM RESEARCH)
              </Typography>
              <Chip label="7 Dashboards" size="small" sx={{ bgcolor: alpha(MODULE_COLOR, darkMode ? 0.2 : 0.1), color: MODULE_COLOR, fontWeight: 600, fontSize: '0.7rem' }} />
            </Stack>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Semiconductor Equipment Manufacturing · Etch, Deposition & Clean Systems
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={1.5}>
        {tiles.map((tile, index) => (
          <Grid item xs={12} sm={6} md={3} key={tile.id}>
            <Zoom in timeout={200 + index * 50}>
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
                    '& .module-icon': { transform: 'scale(1.1)', bgcolor: tile.color, color: 'white' },
                    '& .module-arrow': { opacity: 1, transform: 'translateX(4px)' },
                  },
                }}
                onClick={() => onTileClick(tile.id)}
              >
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Avatar className="module-icon" sx={{ width: 40, height: 40, bgcolor: alpha(tile.color, darkMode ? 0.2 : 0.1), color: tile.color, transition: 'all 0.3s ease' }}>
                      <tile.icon sx={{ fontSize: 22 }} />
                    </Avatar>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: tile.color, mb: 0.5, fontSize: '0.9rem' }}>{tile.title}</Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>{tile.subtitle}</Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tile.description}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(tile.color, darkMode ? 0.2 : 0.1) }}>
                    <Chip label={`${tile.stats.value} ${tile.stats.label}`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(tile.color, darkMode ? 0.2 : 0.08), color: tile.color, fontWeight: 600 }} />
                    <ArrowForwardIcon className="module-arrow" sx={{ color: tile.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
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

export default StoxLamResearchLanding;
