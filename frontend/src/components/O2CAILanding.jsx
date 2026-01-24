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
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  AccountTree as AccountTreeIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

// Import O2C.AI Tile Components
import ExecutiveCommandCenter from './o2cai/ExecutiveCommandCenter';
import SalesAreaIntelligence from './o2cai/SalesAreaIntelligence';
import CustomerIntelligence from './o2cai/CustomerIntelligence';
import DocumentFlowAnalysis from './o2cai/DocumentFlowAnalysis';
import TransactionDrilldown from './o2cai/TransactionDrilldown';

// Import centralized brand colors
import { MODULE_COLOR } from '../config/brandColors';

// O2C.AI Modules - 5 step workflow
const o2cModules = [
  {
    id: 'executive-command-center',
    title: 'Executive Command',
    subtitle: 'Step 1',
    description: 'Org structure, KPIs, process health metrics and AI insights across the O2C landscape',
    icon: DashboardIcon,
    color: MODULE_COLOR,
    stats: { label: 'Revenue', value: '$147.2M' },
    status: 'active',
  },
  {
    id: 'sales-area-intelligence',
    title: 'Sales Intelligence',
    subtitle: 'Step 2',
    description: 'Sales area performance, DSO heatmaps, channel trends and AI recommendations',
    icon: BusinessIcon,
    color: MODULE_COLOR,
    stats: { label: 'DSO', value: '38.2' },
    status: 'active',
  },
  {
    id: 'customer-intelligence',
    title: 'Customer Intelligence',
    subtitle: 'Step 3',
    description: 'Customer segmentation (INVEST/MAINTAIN/HARVEST), AR aging, payment behavior',
    icon: PeopleIcon,
    color: MODULE_COLOR,
    stats: { label: 'Customers', value: '1,247' },
    status: 'active',
  },
  {
    id: 'document-flow-analysis',
    title: 'Document Flow',
    subtitle: 'Step 4',
    description: 'End-to-end document flow visualization, process variants, bottleneck detection',
    icon: AccountTreeIcon,
    color: MODULE_COLOR,
    stats: { label: 'Happy Path', value: '87.4%' },
    status: 'active',
  },
  {
    id: 'transaction-drilldown',
    title: 'Transaction Drilldown',
    subtitle: 'Step 5',
    description: 'Transaction-level detail, anomaly flags, AI-powered recommendations',
    icon: ReceiptIcon,
    color: MODULE_COLOR,
    stats: { label: 'Anomalies', value: '47' },
    status: 'active',
  },
];

const O2CAILanding = ({ onBack, darkMode = false }) => {
  const [selectedTile, setSelectedTile] = useState(null);

  const handleTileClick = (moduleId) => {
    setSelectedTile(moduleId);
  };

  const handleBackToMain = () => {
    setSelectedTile(null);
  };

  const handleNavigate = (tileId) => {
    setSelectedTile(tileId);
  };

  // Render Tile Components
  if (selectedTile === 'executive-command-center') {
    return <ExecutiveCommandCenter onBack={handleBackToMain} darkMode={darkMode} onNavigate={handleNavigate} />;
  }
  if (selectedTile === 'sales-area-intelligence') {
    return <SalesAreaIntelligence onBack={handleBackToMain} darkMode={darkMode} onNavigate={handleNavigate} />;
  }
  if (selectedTile === 'customer-intelligence') {
    return <CustomerIntelligence onBack={handleBackToMain} darkMode={darkMode} onNavigate={handleNavigate} />;
  }
  if (selectedTile === 'document-flow-analysis') {
    return <DocumentFlowAnalysis onBack={handleBackToMain} darkMode={darkMode} onNavigate={handleNavigate} />;
  }
  if (selectedTile === 'transaction-drilldown') {
    return <TransactionDrilldown onBack={handleBackToMain} darkMode={darkMode} onNavigate={handleNavigate} />;
  }

  // Main Landing View - Matching MARGEN.AI Layout
  return (
    <Box sx={{
      p: 3,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: 'linear-gradient(180deg, rgba(10, 110, 209, 0.05) 0%, rgba(255, 255, 255, 1) 50%)',
    }}>
      {/* Header with Breadcrumbs */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              CORE.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              O2C.AI
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
                <TrendingUpIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px', color: MODULE_COLOR }}>
                O2C.AI
              </Typography>
              <Chip
                label="5 Modules"
                size="small"
                sx={{
                  bgcolor: alpha(MODULE_COLOR, 0.1),
                  color: MODULE_COLOR,
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Order-to-Cash Intelligence Platform - End-to-end O2C process analytics and insights
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Module Tiles */}
      <Grid container spacing={1.5}>
        {o2cModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={3} lg={3} key={module.id}>
            <Zoom in timeout={200 + index * 50}>
              <Card
                sx={{
                  height: 200,
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
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Icon and Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Avatar
                      className="module-icon"
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(module.color, 0.1),
                        color: module.color,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <module.icon sx={{ fontSize: 22 }} />
                    </Avatar>
                    {module.status === 'coming-soon' && (
                      <Chip label="Soon" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#64748b', 0.1), color: '#64748b', fontWeight: 600 }} />
                    )}
                  </Box>

                  {/* Title */}
                  <Typography variant="body1" sx={{ fontWeight: 700, color: module.color, mb: 0.5, fontSize: '0.9rem', lineHeight: 1.3 }}>
                    {module.title}
                  </Typography>

                  {/* Subtitle */}
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>
                    {module.subtitle}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {module.description}
                  </Typography>

                  {/* Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(module.color, 0.1) }}>
                    <Chip label={`${module.stats.value} ${module.stats.label}`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(module.color, 0.08), color: module.color, fontWeight: 600 }} />
                    {module.status === 'active' && (
                      <ArrowForwardIcon className="module-arrow" sx={{ color: module.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
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
          <Typography variant="body2" color="text.secondary">
            O2C.AI provides end-to-end Order-to-Cash intelligence with document flow analysis and customer insights
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default O2CAILanding;
