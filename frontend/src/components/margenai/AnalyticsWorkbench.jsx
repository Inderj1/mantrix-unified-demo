import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as ProductIcon,
  TrendingUp as TrendingIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  TableChart as TableIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

// Import sub-components
import SupersetDashboard from './workbench/SupersetDashboard';
import RFMSegmentation from './workbench/RFMSegmentation';
import ABCAnalysis from './workbench/ABCAnalysis';
import CohortRetention from './workbench/CohortRetention';
import CustomerLifecycle from './workbench/CustomerLifecycle';
import MarginDeepDive from './workbench/MarginDeepDive';
import RegionalClusters from './workbench/RegionalClusters';
import ConcentrationRisk from './workbench/ConcentrationRisk';
import PriceVolumeAnalytics from './workbench/PriceVolumeAnalytics';

const drawerWidth = 280;

const analyticsModules = [
  {
    category: 'Customer Intelligence',
    icon: <PeopleIcon />,
    items: [
      { id: 'rfm-segmentation', name: 'RFM Segmentation', icon: <PieChartIcon />, component: 'RFMSegmentation' },
      { id: 'abc-analysis', name: 'ABC Analysis', icon: <BarChartIcon />, component: 'ABCAnalysis' },
      { id: 'customer-lifecycle', name: 'Customer Lifecycle', icon: <TimelineIcon />, component: 'CustomerLifecycle' },
      { id: 'concentration-risk', name: 'Concentration Risk', icon: <TrendingIcon />, component: 'ConcentrationRisk' },
    ]
  },
  {
    category: 'Cohort & Time Analytics',
    icon: <TimelineIcon />,
    items: [
      { id: 'cohort-retention', name: 'Cohort Retention', icon: <TableIcon />, component: 'CohortRetention' },
    ]
  },
  {
    category: 'Advanced Profitability',
    icon: <TrendingIcon />,
    items: [
      { id: 'margin-deep-dive', name: 'Margin Analysis', icon: <AnalyticsIcon />, component: 'MarginDeepDive' },
      { id: 'regional-clusters', name: 'Regional Clusters', icon: <PieChartIcon />, component: 'RegionalClusters' },
      { id: 'price-volume', name: 'Price & Volume', icon: <BarChartIcon />, component: 'PriceVolumeAnalytics' },
    ]
  },
  {
    category: 'Interactive Dashboards',
    icon: <DashboardIcon />,
    items: [
      { id: 'executive-dashboard', name: 'Executive Dashboard', icon: <DashboardIcon />, component: 'SupersetDashboard', dashboardId: 'executive' },
      { id: 'operations-dashboard', name: 'Operations Dashboard', icon: <BarChartIcon />, component: 'SupersetDashboard', dashboardId: 'operations' },
    ]
  },
];

const AnalyticsWorkbench = ({ onBack }) => {
  const theme = useTheme();
  const [selectedModule, setSelectedModule] = useState('rfm-segmentation');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleModuleSelect = (moduleId) => {
    setSelectedModule(moduleId);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const renderComponent = () => {
    // Find the selected module
    let selectedItem = null;
    let dashboardId = null;
    
    analyticsModules.forEach(category => {
      const found = category.items.find(item => item.id === selectedModule);
      if (found) {
        selectedItem = found;
        dashboardId = found.dashboardId;
      }
    });

    if (!selectedItem) return null;

    const componentProps = {
      key: refreshKey,
      onRefresh: handleRefresh,
    };

    // Render the appropriate component
    switch (selectedItem.component) {
      case 'RFMSegmentation':
        return <RFMSegmentation {...componentProps} />;
      case 'ABCAnalysis':
        return <ABCAnalysis {...componentProps} />;
      case 'CohortRetention':
        return <CohortRetention {...componentProps} />;
      case 'CustomerLifecycle':
        return <CustomerLifecycle {...componentProps} />;
      case 'MarginDeepDive':
        return <MarginDeepDive {...componentProps} />;
      case 'RegionalClusters':
        return <RegionalClusters {...componentProps} />;
      case 'ConcentrationRisk':
        return <ConcentrationRisk {...componentProps} />;
      case 'PriceVolumeAnalytics':
        return <PriceVolumeAnalytics {...componentProps} />;
      case 'SupersetDashboard':
        return <SupersetDashboard {...componentProps} dashboardId={dashboardId} />;
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Alert severity="info">
              Module "{selectedItem.name}" is under development
            </Alert>
          </Box>
        );
    }
  };

  const getCurrentModuleName = () => {
    let name = 'Analytics Workbench';
    analyticsModules.forEach(category => {
      const found = category.items.find(item => item.id === selectedModule);
      if (found) {
        name = found.name;
      }
    });
    return name;
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', position: 'relative', flexDirection: 'column', p: 3 }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              MARGEN.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Analytics Workbench
            </Typography>
          </Breadcrumbs>
          {onBack && (
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
              Back to MargenAI
            </Button>
          )}
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', height: '100%', position: 'relative' }}>
      {/* Side Navigation Drawer */}
      <Drawer
        sx={{
          width: drawerOpen ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            borderRight: `1px solid ${theme.palette.divider}`,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%)',
          },
        }}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Analytics
          </Typography>
          <IconButton onClick={handleDrawerToggle} size="small">
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <List sx={{ pt: 0 }}>
          {analyticsModules.map((category, index) => (
            <Box key={category.category}>
              {index > 0 && <Divider sx={{ my: 1 }} />}
              <ListItem sx={{ py: 0.5, px: 2 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={category.category}
                  primaryTypographyProps={{ 
                    variant: 'caption',
                    color: 'text.secondary',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                />
              </ListItem>
              {category.items.map((item) => (
                <ListItemButton
                  key={item.id}
                  selected={selectedModule === item.id}
                  onClick={() => handleModuleSelect(item.id)}
                  sx={{
                    pl: 4,
                    py: 1,
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      borderLeft: `3px solid ${theme.palette.primary.main}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.name}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                    }}
                  />
                </ListItemButton>
              ))}
            </Box>
          ))}
        </List>
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Top Toolbar */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            borderBottom: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.paper,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              {!drawerOpen && (
                <IconButton onClick={handleDrawerToggle}>
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {getCurrentModuleName()}
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                variant="outlined"
                size="small"
              >
                Refresh
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                variant="outlined"
                size="small"
                disabled
              >
                Export
              </Button>
              <Button
                startIcon={<FilterIcon />}
                variant="outlined"
                size="small"
                disabled
              >
                Filters
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Content Container */}
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          background: theme.palette.mode === 'dark'
            ? theme.palette.background.default
            : '#f5f7fa',
        }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%' 
            }}>
              <CircularProgress />
            </Box>
          ) : (
            renderComponent()
          )}
        </Box>
      </Box>
      </Box>
    </Box>
  );
};

export default AnalyticsWorkbench;