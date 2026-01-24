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
  Lightbulb as LightbulbIcon,
  ShoppingCart as ShoppingCartIcon,
  Sensors as SensorsIcon,
  Hub as HubIcon,
  Balance as BalanceIcon,
  Storage as StorageIcon,
  School as SchoolIcon,
  Inventory as InventoryIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
  Category as CategoryIcon,
  Dashboard as DashboardIcon,
  CloudSync as CloudSyncIcon,
} from '@mui/icons-material';

// Single consistent blue for all modules
const MODULE_COLOR = '#0078d4';

// Category tiles
const categoryTiles = [
  {
    id: 'made-to-stock',
    title: 'ORDLY AI (MADE TO STOCK)',
    subtitle: 'MTS Order Pipeline',
    description: 'End-to-end Make-to-Stock order intelligence from customer intent to SAP commitment',
    icon: InventoryIcon,
    color: MODULE_COLOR,
    stats: { label: 'Tiles', value: '5' },
  },
  {
    id: 'made-to-order',
    title: 'ORDLY AI (MADE TO ORDER)',
    subtitle: 'MTO/CTO Order Pipeline',
    description: 'Configure-to-Order and Make-to-Order intelligence with demand signals, network optimization, and SAP commitment',
    icon: ShoppingCartIcon,
    color: MODULE_COLOR,
    stats: { label: 'Tiles', value: '5' },
  },
];

// MTS Flow Tiles (Make-to-Stock Pipeline)
const mtsTiles = [
  {
    id: 'sales-order-pipeline',
    title: 'Sales Order Pipeline',
    subtitle: 'MTS Tile 0',
    description: 'End-to-end sales order tracking with AI-powered status monitoring and exception management',
    icon: TimelineIcon,
    color: MODULE_COLOR,
    stats: { label: 'Orders', value: '2.4K' },
    status: 'active',
  },
  {
    id: 'customer-intent-cockpit',
    title: 'Customer Intent Cockpit',
    subtitle: 'MTS Tile 1',
    description: 'AI-powered customer intent extraction from emails, calls, and documents with confidence scoring',
    icon: PsychologyIcon,
    color: MODULE_COLOR,
    stats: { label: 'Intents', value: '156' },
    status: 'active',
  },
  {
    id: 'sku-decisioning',
    title: 'SKU Decisioning',
    subtitle: 'MTS Tile 2',
    description: 'Intelligent SKU selection and configuration with compatibility checks and substitution recommendations',
    icon: CategoryIcon,
    color: MODULE_COLOR,
    stats: { label: 'SKUs', value: '2.4K' },
    status: 'active',
  },
  {
    id: 'order-value-control-tower',
    title: 'Order Value Control Tower',
    subtitle: 'MTS Tile 3',
    description: 'Real-time order pipeline visibility with value tracking, margin analysis, and exception management',
    icon: DashboardIcon,
    color: MODULE_COLOR,
    stats: { label: 'Pipeline', value: '$4.2M' },
    status: 'active',
  },
  {
    id: 'sap-commit-trace',
    title: 'SAP Commit & Trace',
    subtitle: 'MTS Tile 4',
    description: 'Order commitment to SAP with full traceability, document generation, and BAPI integration',
    icon: CloudSyncIcon,
    color: MODULE_COLOR,
    stats: { label: 'Commits', value: '234' },
    status: 'active',
  },
];

// MTO Flow Tiles (Made-to-Order) - using the order pipeline tiles
const mtoTiles = [
  {
    id: 'demand-signal',
    title: 'Demand Signal',
    subtitle: 'MTO Tile 0',
    description: 'AI-powered demand capture with volatility fingerprinting, hidden constraint detection, and service risk preview',
    icon: SensorsIcon,
    color: MODULE_COLOR,
    stats: { label: 'Signals', value: '47' },
    status: 'active',
  },
  {
    id: 'network-optimizer',
    title: 'Network Optimizer',
    subtitle: 'MTO Tile 1',
    description: 'Multi-node fulfillment optimization with AI explainability, cost breakdown, and risk matrix',
    icon: HubIcon,
    color: MODULE_COLOR,
    stats: { label: 'Options', value: '5' },
    status: 'active',
  },
  {
    id: 'arbitration',
    title: 'Economic Arbitration',
    subtitle: 'MTO Tile 2',
    description: 'Policy guardrails, inventory protection, exception proposals, and approval workflows',
    icon: BalanceIcon,
    color: MODULE_COLOR,
    stats: { label: 'Policies', value: '5/6' },
    status: 'active',
  },
  {
    id: 'sap-commit',
    title: 'SAP Commit & Trace',
    subtitle: 'MTO Tile 3',
    description: 'Pre-commit validation, SAP document preview, decision timeline, and BAPI execution log',
    icon: StorageIcon,
    color: MODULE_COLOR,
    stats: { label: 'Commits', value: '4/5' },
    status: 'active',
  },
  {
    id: 'learning-loop',
    title: 'Learning Loop',
    subtitle: 'MTO Tile 4',
    description: 'Order outcome analysis, ML model confidence updates, and continuous improvement tracking',
    icon: SchoolIcon,
    color: MODULE_COLOR,
    stats: { label: 'Model Gain', value: '+2.1%' },
    status: 'active',
  },
];

const OrdlyAILanding = ({ onTileClick, onBack }) => {
  const [view, setView] = useState('categories'); // 'categories', 'mts', or 'mto'

  const handleCategoryClick = (categoryId) => {
    if (categoryId === 'made-to-stock') {
      setView('mts');
    } else if (categoryId === 'made-to-order') {
      setView('mto');
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

  // Render MTS tiles
  if (view === 'mts') {
    return (
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto', background: 'linear-gradient(180deg, rgba(219, 234, 254, 0.1) 0%, rgba(255, 255, 255, 1) 50%)' }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>CORE.AI</Link>
              <Link component="button" variant="body1" onClick={handleBackToCategories} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>ORDLY.AI</Link>
              <Typography color="primary" variant="body1" fontWeight={600}>Made to Stock</Typography>
            </Breadcrumbs>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBackToCategories} variant="outlined" size="small">Back</Button>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 4, height: 60, bgcolor: MODULE_COLOR, borderRadius: 2 }} />
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#0078d4' }}><InventoryIcon sx={{ fontSize: 18 }} /></Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#0078d4' }}>ORDLY AI (MADE TO STOCK)</Typography>
                <Chip label="5 Tiles" size="small" sx={{ bgcolor: alpha('#0078d4', 0.1), color: '#0078d4', fontWeight: 600, fontSize: '0.7rem' }} />
              </Stack>
              <Typography variant="body2" color="text.secondary">End-to-end Make-to-Stock order intelligence from demand signal to SAP commitment</Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={1.5}>
          {mtsTiles.map((tile, index) => (
            <Grid item xs={12} sm={6} md={3} key={tile.id}>
              <Zoom in timeout={200 + index * 50}>
                <Card
                  sx={{
                    height: 200,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 3,
                    position: 'relative',
                    bgcolor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 20px 40px ${alpha(tile.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                      '& .tile-icon': { transform: 'scale(1.1)', bgcolor: tile.color, color: 'white' },
                      '& .tile-arrow': { opacity: 1, transform: 'translateX(4px)' },
                    },
                  }}
                  onClick={() => handleTileClick(tile.id)}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Avatar className="tile-icon" sx={{ width: 40, height: 40, bgcolor: alpha(tile.color, 0.1), color: tile.color, transition: 'all 0.3s ease' }}>
                        <tile.icon sx={{ fontSize: 22 }} />
                      </Avatar>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: tile.color, mb: 0.5, fontSize: '0.9rem' }}>{tile.title}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>{tile.subtitle}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tile.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(tile.color, 0.1) }}>
                      <Chip label={`${tile.stats.value} ${tile.stats.label}`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(tile.color, 0.08), color: tile.color, fontWeight: 600 }} />
                      <ArrowForwardIcon className="tile-arrow" sx={{ color: tile.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
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

  // Render MTO tiles
  if (view === 'mto') {
    return (
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto', background: 'linear-gradient(180deg, rgba(219, 234, 254, 0.1) 0%, rgba(255, 255, 255, 1) 50%)' }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>CORE.AI</Link>
              <Link component="button" variant="body1" onClick={handleBackToCategories} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>ORDLY.AI</Link>
              <Typography color="primary" variant="body1" fontWeight={600}>Made to Order</Typography>
            </Breadcrumbs>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBackToCategories} variant="outlined" size="small">Back</Button>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 4, height: 60, bgcolor: MODULE_COLOR, borderRadius: 2 }} />
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: MODULE_COLOR }}><ShoppingCartIcon sx={{ fontSize: 18 }} /></Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ color: MODULE_COLOR }}>ORDLY AI (MADE TO ORDER)</Typography>
                <Chip label="6 Tiles" size="small" sx={{ bgcolor: alpha(MODULE_COLOR, 0.1), color: MODULE_COLOR, fontWeight: 600, fontSize: '0.7rem' }} />
              </Stack>
              <Typography variant="body2" color="text.secondary">Configure-to-Order and Make-to-Order intelligence from intent to SAP commitment</Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={1.5}>
          {mtoTiles.map((tile, index) => (
            <Grid item xs={12} sm={6} md={3} key={tile.id}>
              <Zoom in timeout={200 + index * 50}>
                <Card
                  sx={{
                    height: 200,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 3,
                    position: 'relative',
                    bgcolor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 20px 40px ${alpha(tile.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                      '& .tile-icon': { transform: 'scale(1.1)', bgcolor: tile.color, color: 'white' },
                      '& .tile-arrow': { opacity: 1, transform: 'translateX(4px)' },
                    },
                  }}
                  onClick={() => handleTileClick(tile.id)}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Avatar className="tile-icon" sx={{ width: 40, height: 40, bgcolor: alpha(tile.color, 0.1), color: tile.color, transition: 'all 0.3s ease' }}>
                        <tile.icon sx={{ fontSize: 22 }} />
                      </Avatar>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: tile.color, mb: 0.5, fontSize: '0.9rem' }}>{tile.title}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>{tile.subtitle}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tile.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(tile.color, 0.1) }}>
                      <Chip label={`${tile.stats.value} ${tile.stats.label}`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(tile.color, 0.08), color: tile.color, fontWeight: 600 }} />
                      <ArrowForwardIcon className="tile-arrow" sx={{ color: tile.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
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

  // Render main categories view
  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', background: 'linear-gradient(180deg, rgba(219, 234, 254, 0.1) 0%, rgba(255, 255, 255, 1) 50%)' }}>
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>CORE.AI</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>ORDLY.AI</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 4, height: 60, bgcolor: MODULE_COLOR, borderRadius: 2 }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: MODULE_COLOR }}><ShoppingCartIcon sx={{ fontSize: 18 }} /></Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ color: MODULE_COLOR }}>ORDLY.AI</Typography>
              <Chip label="2 Modules" size="small" sx={{ bgcolor: alpha(MODULE_COLOR, 0.1), color: MODULE_COLOR, fontWeight: 600, fontSize: '0.7rem' }} />
            </Stack>
            <Typography variant="body2" color="text.secondary">Order Intelligence Platform - AI-powered order management</Typography>
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
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 3,
                  position: 'relative',
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 20px 40px ${alpha(category.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                    '& .category-icon': { transform: 'scale(1.1)', bgcolor: category.color, color: 'white' },
                    '& .category-arrow': { opacity: 1, transform: 'translateX(4px)' },
                  },
                }}
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Avatar className="category-icon" sx={{ width: 40, height: 40, bgcolor: alpha(category.color, 0.1), color: category.color, transition: 'all 0.3s ease' }}>
                      <category.icon sx={{ fontSize: 22 }} />
                    </Avatar>
                    <Chip label={`${category.stats.value} ${category.stats.label}`} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: category.color, color: 'white' }} />
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: category.color, mb: 0.5, fontSize: '0.9rem' }}>{category.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>{category.subtitle}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{category.description}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(category.color, 0.1) }}>
                    <Typography variant="body2" sx={{ color: category.color, fontWeight: 600, fontSize: '0.7rem' }}>Explore</Typography>
                    <ArrowForwardIcon className="category-arrow" sx={{ color: category.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
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
