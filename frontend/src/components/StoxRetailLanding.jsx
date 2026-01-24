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
  Zoom,
  Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Storefront as StorefrontIcon,
  Warehouse as WarehouseIcon,
  TrendingUp as TrendingUpIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  AttachMoney as AttachMoneyIcon,
  LocalShipping as LocalShippingIcon,
  Science as ScienceIcon,
  Inventory as InventoryIcon,
  Security as SecurityIcon,
  AccountTree as AccountTreeIcon,
  ViewInAr as ViewInArIcon,
  Handshake as HandshakeIcon,
  Lightbulb as LightbulbIcon,
  Tune as TuneIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

// Import centralized brand colors
import { BRAND, MODULE_COLOR, getColors, BRAND_ALPHA } from '../config/brandColors';

// Main category tiles: Store System and DC System
const categoryTiles = [
  {
    id: 'store-system',
    title: 'Store System',
    subtitle: 'Retail Inventory Management',
    description: 'End-to-end store inventory optimization from forecast simulation to stock transfer execution',
    icon: StorefrontIcon,
    color: MODULE_COLOR,
    stats: { label: 'Tiles', value: '5' },
  },
  {
    id: 'dc-system',
    title: 'Distribution Center System',
    subtitle: 'DC Operations & Planning',
    description: 'Comprehensive DC management including demand aggregation, BOM, and supplier execution',
    icon: WarehouseIcon,
    color: MODULE_COLOR,
    stats: { label: 'Modules', value: '7' },
  },
];

// Store System tiles (T0-T4)
const storeTiles = [
  {
    id: 'tile0-forecast-simulation',
    title: 'T0: Forecast Simulation',
    subtitle: 'Demand Planning',
    description: 'AI-powered demand simulation with scenario modeling and forecast accuracy tracking',
    icon: ScienceIcon,
    color: MODULE_COLOR,
    stats: { label: 'Scenarios', value: '12' },
    status: 'active',
    gradient: `linear-gradient(135deg, ${BRAND.navy.main} 0%, ${BRAND.navy.light} 100%)`,
  },
  {
    id: 'store-forecasting',
    title: 'T1: Demand Forecasting',
    subtitle: 'Predictions',
    description: 'ML-driven store-level demand forecasting with seasonal patterns and trend analysis',
    icon: TrendingUpIcon,
    color: MODULE_COLOR,
    stats: { label: 'Stores', value: '156' },
    status: 'active',
    gradient: `linear-gradient(135deg, ${BRAND.navy.light} 0%, ${BRAND.navy.main} 100%)`,
  },
  {
    id: 'store-health-monitor',
    title: 'T2: Inventory Health Monitor',
    subtitle: 'Stock Analytics',
    description: 'Real-time inventory health scoring, stockout risk detection, and overstock alerts',
    icon: HealthAndSafetyIcon,
    color: MODULE_COLOR,
    stats: { label: 'SKUs', value: '2.4K' },
    status: 'active',
    gradient: `linear-gradient(135deg, ${BRAND.navy.main} 0%, ${BRAND.navy.light} 100%)`,
  },
  {
    id: 'store-financial-impact',
    title: 'T3: Financial Impact',
    subtitle: 'Cost Analysis',
    description: 'Financial impact analysis of inventory decisions, working capital optimization',
    icon: AttachMoneyIcon,
    color: MODULE_COLOR,
    stats: { label: 'Savings', value: '$1.2M' },
    status: 'active',
    gradient: `linear-gradient(135deg, ${BRAND.navy.dark} 0%, ${BRAND.navy.main} 100%)`,
  },
  {
    id: 'store-replenishment',
    title: 'T4: Stock Transfer Execution',
    subtitle: 'Replenishment',
    description: 'Automated replenishment recommendations and store-to-store transfer optimization',
    icon: LocalShippingIcon,
    color: MODULE_COLOR,
    stats: { label: 'Transfers', value: '89' },
    status: 'active',
    gradient: `linear-gradient(135deg, ${BRAND.navy.light} 0%, ${BRAND.navy.main} 100%)`,
  },
];

// DC System tiles (DC1-DC7)
const dcTiles = [
  {
    id: 'dc-demand-aggregation',
    title: 'DC1: Forecast Layer',
    subtitle: 'Demand Aggregation',
    description: 'Aggregate store forecasts to DC level with channel demand consolidation',
    icon: TrendingUpIcon,
    color: MODULE_COLOR,
    stats: { label: 'Channels', value: '8' },
    status: 'active',
    gradient: `linear-gradient(135deg, ${BRAND.navy.main} 0%, ${BRAND.navy.light} 100%)`,
  },
  {
    id: 'dc-health-monitor',
    title: 'DC2: Health Monitor',
    subtitle: 'DC Analytics',
    description: 'Distribution center inventory health, capacity utilization, and performance metrics',
    icon: HealthAndSafetyIcon,
    color: MODULE_COLOR,
    stats: { label: 'DCs', value: '4' },
    status: 'active',
    gradient: `linear-gradient(135deg, ${BRAND.navy.dark} 0%, ${BRAND.navy.main} 100%)`,
  },
  {
    id: 'dc-optimization',
    title: 'DC3: Safety Stock Layer',
    subtitle: 'Stock Optimization',
    description: 'AI-optimized safety stock levels with service level targeting and demand variability',
    icon: SecurityIcon,
    color: MODULE_COLOR,
    stats: { label: 'Optimized', value: '94%' },
    status: 'active',
    gradient: `linear-gradient(135deg, ${BRAND.navy.light} 0%, ${BRAND.navy.main} 100%)`,
  },
  {
    id: 'dc-bom',
    title: 'DC4: Bill of Materials',
    subtitle: 'BOM Management',
    description: 'Component-level BOM explosion, kit assembly planning, and material requirements',
    icon: AccountTreeIcon,
    color: MODULE_COLOR,
    stats: { label: 'BOMs', value: '245' },
    status: 'active',
    gradient: `linear-gradient(135deg, ${BRAND.navy.main} 0%, ${BRAND.navy.light} 100%)`,
  },
  {
    id: 'dc-lot-size',
    title: 'DC5: Lot Size Optimization',
    subtitle: 'Order Quantities',
    description: 'Economic order quantity optimization, MOQ analysis, and batch size recommendations',
    icon: ViewInArIcon,
    color: MODULE_COLOR,
    stats: { label: 'Savings', value: '12%' },
    status: 'active',
    gradient: `linear-gradient(135deg, ${BRAND.navy.dark} 0%, ${BRAND.navy.main} 100%)`,
  },
  {
    id: 'dc-supplier-exec',
    title: 'DC6: Supplier Execution',
    subtitle: 'Procurement',
    description: 'Supplier performance tracking, PO management, and vendor collaboration',
    icon: HandshakeIcon,
    color: MODULE_COLOR,
    stats: { label: 'Suppliers', value: '32' },
    status: 'active',
    gradient: `linear-gradient(135deg, ${BRAND.navy.light} 0%, ${BRAND.navy.main} 100%)`,
  },
  {
    id: 'dc-financial-impact',
    title: 'DC7: Financial Impact',
    subtitle: 'DC Financials',
    description: 'DC-level financial impact analysis, cost allocation, and working capital metrics',
    icon: AttachMoneyIcon,
    color: MODULE_COLOR,
    stats: { label: 'Savings', value: '$2.8M' },
    status: 'active',
    gradient: `linear-gradient(135deg, ${BRAND.navy.main} 0%, ${BRAND.navy.dark} 100%)`,
  },
];

const StoxRetailLanding = ({ onBack, onTileClick, darkMode = false }) => {
  const [view, setView] = useState('categories'); // 'categories', 'store', or 'dc'

  const getColors = (darkMode) => ({
    primary: darkMode ? '#4d9eff' : '#00357a',
    text: darkMode ? '#e6edf3' : '#1e293b',
    textSecondary: darkMode ? '#8b949e' : '#64748b',
    background: darkMode ? '#0d1117' : '#f8fbfd',
    paper: darkMode ? '#161b22' : '#ffffff',
    cardBg: darkMode ? '#21262d' : '#ffffff',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  });

  const colors = getColors(darkMode);

  const handleCategoryClick = (categoryId) => {
    if (categoryId === 'store-system') {
      setView('store');
    } else if (categoryId === 'dc-system') {
      setView('dc');
    }
  };

  const handleTileClick = (moduleId) => {
    if (onTileClick) {
      onTileClick(moduleId);
    }
  };

  const handleBackToCategories = () => {
    setView('categories');
  };

  // Render Store System tiles
  if (view === 'store') {
    return (
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto', background: colors.background }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: colors.textSecondary }} />}>
              <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline' } }}>STOX.AI</Link>
              <Link component="button" variant="body1" onClick={handleBackToCategories} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline' } }}>Retail</Link>
              <Typography sx={{ color: colors.primary }} variant="body1" fontWeight={600}>Store System</Typography>
            </Breadcrumbs>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBackToCategories} variant="outlined" size="small" sx={{ borderColor: colors.border, color: colors.text, '&:hover': { borderColor: colors.primary } }}>Back</Button>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 4, height: 60, bgcolor: colors.primary, borderRadius: 2 }} />
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: colors.primary }}><StorefrontIcon sx={{ fontSize: 18 }} /></Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ color: colors.primary }}>Store System</Typography>
                <Chip label="5 Tiles" size="small" sx={{ bgcolor: alpha(colors.primary, 0.15), color: colors.primary, fontWeight: 600, fontSize: '0.7rem' }} />
              </Stack>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>End-to-end store inventory optimization from forecast simulation to stock transfer execution</Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={1.5}>
          {storeTiles.map((tile, index) => (
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
                    boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: darkMode ? `0 20px 40px ${alpha(colors.primary, 0.2)}, 0 8px 16px rgba(0,0,0,0.4)` : `0 20px 40px ${alpha(colors.primary, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                      '& .tile-icon': { transform: 'scale(1.1)', bgcolor: colors.primary, color: 'white' },
                      '& .tile-arrow': { opacity: 1, transform: 'translateX(4px)' },
                    },
                  }}
                  onClick={() => handleTileClick(tile.id)}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Avatar className="tile-icon" sx={{ width: 40, height: 40, bgcolor: alpha(colors.primary, 0.15), color: colors.primary, transition: 'all 0.3s ease' }}>
                        <tile.icon sx={{ fontSize: 22 }} />
                      </Avatar>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: colors.primary, mb: 0.5, fontSize: '0.9rem' }}>{tile.title}</Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>{tile.subtitle}</Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tile.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: `1px solid ${colors.border}` }}>
                      <Chip label={`${tile.stats.value} ${tile.stats.label}`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(colors.primary, 0.12), color: colors.primary, fontWeight: 600 }} />
                      <ArrowForwardIcon className="tile-arrow" sx={{ color: colors.primary, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Render DC System tiles
  if (view === 'dc') {
    return (
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto', background: colors.background }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: colors.textSecondary }} />}>
              <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline' } }}>STOX.AI</Link>
              <Link component="button" variant="body1" onClick={handleBackToCategories} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline' } }}>Retail</Link>
              <Typography sx={{ color: colors.primary }} variant="body1" fontWeight={600}>Distribution Center System</Typography>
            </Breadcrumbs>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBackToCategories} variant="outlined" size="small" sx={{ borderColor: colors.border, color: colors.text, '&:hover': { borderColor: colors.primary } }}>Back</Button>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 4, height: 60, bgcolor: colors.primary, borderRadius: 2 }} />
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: colors.primary }}><WarehouseIcon sx={{ fontSize: 18 }} /></Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ color: colors.primary }}>Distribution Center System</Typography>
                <Chip label="7 Modules" size="small" sx={{ bgcolor: alpha(colors.primary, 0.15), color: colors.primary, fontWeight: 600, fontSize: '0.7rem' }} />
              </Stack>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>Comprehensive DC management including demand aggregation, BOM, and supplier execution</Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={1.5}>
          {dcTiles.map((tile, index) => (
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
                    boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: darkMode ? `0 20px 40px ${alpha(colors.primary, 0.2)}, 0 8px 16px rgba(0,0,0,0.4)` : `0 20px 40px ${alpha(colors.primary, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                      '& .tile-icon': { transform: 'scale(1.1)', bgcolor: colors.primary, color: 'white' },
                      '& .tile-arrow': { opacity: 1, transform: 'translateX(4px)' },
                    },
                  }}
                  onClick={() => handleTileClick(tile.id)}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Avatar className="tile-icon" sx={{ width: 40, height: 40, bgcolor: alpha(colors.primary, 0.15), color: colors.primary, transition: 'all 0.3s ease' }}>
                        <tile.icon sx={{ fontSize: 22 }} />
                      </Avatar>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: colors.primary, mb: 0.5, fontSize: '0.9rem' }}>{tile.title}</Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>{tile.subtitle}</Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tile.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: `1px solid ${colors.border}` }}>
                      <Chip label={`${tile.stats.value} ${tile.stats.label}`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(colors.primary, 0.12), color: colors.primary, fontWeight: 600 }} />
                      <ArrowForwardIcon className="tile-arrow" sx={{ color: colors.primary, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Render main categories view (Store System and DC System)
  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', background: colors.background }}>
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: colors.textSecondary }} />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline' } }}>STOX.AI</Link>
            <Typography sx={{ color: colors.primary }} variant="body1" fontWeight={600}>Retail</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ borderColor: colors.border, color: colors.text, '&:hover': { borderColor: colors.primary } }}>Back</Button>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 4, height: 60, bgcolor: colors.primary, borderRadius: 2 }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: colors.primary }}><StorefrontIcon sx={{ fontSize: 18 }} /></Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ color: colors.primary }}>STOX.AI (RETAIL)</Typography>
              <Chip label="2 Systems" size="small" sx={{ bgcolor: alpha(colors.primary, 0.15), color: colors.primary, fontWeight: 600, fontSize: '0.7rem' }} />
            </Stack>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>Store & Distribution Center Inventory Intelligence</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Category Tiles */}
      <Grid container spacing={1.5}>
        {categoryTiles.map((category, index) => (
          <Grid item xs={12} sm={6} md={3} key={category.id}>
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
                  boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: darkMode ? `0 20px 40px ${alpha(colors.primary, 0.2)}, 0 8px 16px rgba(0,0,0,0.4)` : `0 20px 40px ${alpha(colors.primary, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                    '& .category-icon': { transform: 'scale(1.1)', bgcolor: colors.primary, color: 'white' },
                    '& .category-arrow': { opacity: 1, transform: 'translateX(4px)' },
                  },
                }}
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Avatar className="category-icon" sx={{ width: 40, height: 40, bgcolor: alpha(colors.primary, 0.15), color: colors.primary, transition: 'all 0.3s ease' }}>
                      <category.icon sx={{ fontSize: 22 }} />
                    </Avatar>
                    <Chip label={`${category.stats.value} ${category.stats.label}`} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: colors.primary, color: 'white' }} />
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: colors.primary, mb: 0.5, fontSize: '0.9rem' }}>{category.title}</Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>{category.subtitle}</Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{category.description}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: `1px solid ${colors.border}` }}>
                    <Typography variant="body2" sx={{ color: colors.primary, fontWeight: 600, fontSize: '0.7rem' }}>{category.id === 'store-system' ? 'Explore Tiles' : 'Explore Modules'}</Typography>
                    <ArrowForwardIcon className="category-arrow" sx={{ color: colors.primary, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <LightbulbIcon sx={{ color: darkMode ? '#ffa726' : '#f57c00' }} />
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Store System: Forecast to Execution | DC System: Aggregation to Supplier Management
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default StoxRetailLanding;
