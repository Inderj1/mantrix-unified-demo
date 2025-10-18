import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Divider,
  Tab,
  Tabs,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  LocalShipping as LocalShippingIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  AttachMoney as AttachMoneyIcon,
  Timeline as TimelineIcon,
  Route as RouteIcon,
  AutoAwesome as AutoAwesomeIcon,
  Insights as InsightsIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as AssessmentIcon,
  DirectionsCar as DirectionsCarIcon,
  AccountTree as AccountTreeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Cable as CableIcon,
} from '@mui/icons-material';
import DataSourcesTab from './DataSourcesTab';
import DatabaseConnectors from './DatabaseConnectors';

const ModelControlCenter = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [models, setModels] = useState({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  // Model definitions organized by category
  const modelCategories = [
    {
      name: 'Financial Analytics',
      icon: <AttachMoneyIcon />,
      color: '#4CAF50',
      models: [
        {
          id: 'prism-ai',
          name: 'PRISM.AI',
          description: 'Price optimization and margin analysis',
          icon: <TrendingUpIcon />,
          status: 'active',
          purchased: true,
          features: ['Dynamic pricing', 'Margin optimization', 'Competitor analysis'],
          metrics: { accuracy: 94, usage: 78, roi: '3.2x' }
        },
        {
          id: 'margen-ai',
          name: 'MARGEN.AI',
          description: 'Margin prediction and optimization',
          icon: <AccountBalanceIcon />,
          status: 'active',
          purchased: true,
          features: ['Margin forecasting', 'Cost analysis', 'Profitability insights'],
          metrics: { accuracy: 91, usage: 65, roi: '2.8x' }
        },
        {
          id: 'spend-ai',
          name: 'SPEND.AI',
          description: 'Spending pattern analysis and optimization',
          icon: <ShoppingCartIcon />,
          status: 'inactive',
          purchased: false,
          features: ['Spend analytics', 'Budget optimization', 'Vendor analysis'],
          metrics: { accuracy: 0, usage: 0, roi: 'N/A' }
        },
        {
          id: 'budget-ai',
          name: 'BUDGET.AI',
          description: 'Budget planning and variance analysis',
          icon: <AccountBalanceIcon />,
          status: 'inactive',
          purchased: false,
          features: ['Budget forecasting', 'Variance tracking', 'Scenario planning'],
          metrics: { accuracy: 0, usage: 0, roi: 'N/A' }
        },
      ]
    },
    {
      name: 'Operations & Logistics',
      icon: <LocalShippingIcon />,
      color: '#2196F3',
      models: [
        {
          id: 'flow-ai',
          name: 'FLOW.AI',
          description: 'Supply chain flow optimization',
          icon: <TimelineIcon />,
          status: 'active',
          purchased: true,
          features: ['Route optimization', 'Inventory flow', 'Bottleneck detection'],
          metrics: { accuracy: 89, usage: 82, roi: '2.5x' }
        },
        {
          id: 'route-ai',
          name: 'ROUTE.AI',
          description: 'Intelligent routing and logistics',
          icon: <RouteIcon />,
          status: 'active',
          purchased: true,
          features: ['Dynamic routing', 'Delivery optimization', 'Fleet management'],
          metrics: { accuracy: 92, usage: 88, roi: '3.1x' }
        },
        {
          id: 'optima-ai',
          name: 'OPTIMA.AI',
          description: 'Process optimization engine',
          icon: <SpeedIcon />,
          status: 'inactive',
          purchased: false,
          features: ['Process mining', 'Workflow optimization', 'Efficiency analysis'],
          metrics: { accuracy: 0, usage: 0, roi: 'N/A' }
        },
        {
          id: 'driver-ai',
          name: 'DRIVER.AI',
          description: 'Driver behavior and performance analytics',
          icon: <DirectionsCarIcon />,
          status: 'inactive',
          purchased: false,
          features: ['Driver scoring', 'Route compliance', 'Safety analytics'],
          metrics: { accuracy: 0, usage: 0, roi: 'N/A' }
        },
      ]
    },
    {
      name: 'Predictive Intelligence',
      icon: <PsychologyIcon />,
      color: '#9C27B0',
      models: [
        {
          id: 'forecast-ai',
          name: 'FORECAST.AI',
          description: 'Advanced demand forecasting',
          icon: <TimelineIcon />,
          status: 'active',
          purchased: true,
          features: ['Demand prediction', 'Seasonal analysis', 'Trend detection'],
          metrics: { accuracy: 93, usage: 91, roi: '4.1x' }
        },
        {
          id: 'insights-ai',
          name: 'INSIGHTS.AI',
          description: 'Automated business insights generation',
          icon: <InsightsIcon />,
          status: 'active',
          purchased: true,
          features: ['Pattern detection', 'Anomaly alerts', 'Insight generation'],
          metrics: { accuracy: 88, usage: 76, roi: '2.9x' }
        },
        {
          id: 'scenario-ai',
          name: 'SCENARIO.AI',
          description: 'What-if scenario modeling',
          icon: <AccountTreeIcon />,
          status: 'inactive',
          purchased: false,
          features: ['Scenario planning', 'Impact analysis', 'Risk assessment'],
          metrics: { accuracy: 0, usage: 0, roi: 'N/A' }
        },
      ]
    },
    {
      name: 'Strategic Intelligence',
      icon: <AnalyticsIcon />,
      color: '#FF5722',
      models: [
        {
          id: 'stox-ai',
          name: 'STOX.AI',
          description: 'Stock and inventory intelligence',
          icon: <AssessmentIcon />,
          status: 'active',
          purchased: true,
          features: ['Stock optimization', 'Reorder points', 'Dead stock analysis'],
          metrics: { accuracy: 90, usage: 84, roi: '3.5x' }
        },
        {
          id: 'sage-ai',
          name: 'SAGE.AI',
          description: 'Strategic advisor and recommendations',
          icon: <AutoAwesomeIcon />,
          status: 'inactive',
          purchased: false,
          features: ['Strategic planning', 'Market analysis', 'Growth recommendations'],
          metrics: { accuracy: 0, usage: 0, roi: 'N/A' }
        },
        {
          id: 'npi-ai',
          name: 'NPI.AI',
          description: 'New product introduction analytics',
          icon: <AutoAwesomeIcon />,
          status: 'inactive',
          purchased: false,
          features: ['Launch planning', 'Market fit analysis', 'Performance tracking'],
          metrics: { accuracy: 0, usage: 0, roi: 'N/A' }
        },
      ]
    },
    {
      name: 'Security & Compliance',
      icon: <SecurityIcon />,
      color: '#F44336',
      models: [
        {
          id: 'sentry-ai',
          name: 'SENTRY.AI',
          description: 'Security monitoring and threat detection',
          icon: <SecurityIcon />,
          status: 'active',
          purchased: true,
          features: ['Threat detection', 'Anomaly monitoring', 'Compliance tracking'],
          metrics: { accuracy: 96, usage: 100, roi: '5.2x' }
        },
      ]
    },
  ];

  useEffect(() => {
    // Initialize model states
    const initialStates = {};
    modelCategories.forEach(category => {
      category.models.forEach(model => {
        initialStates[model.id] = {
          enabled: model.status === 'active',
          purchased: model.purchased,
        };
      });
    });
    setModels(initialStates);
  }, []);

  const handleToggleModel = (modelId) => {
    const model = models[modelId];
    if (!model.purchased) {
      // Show purchase dialog or message
      alert('This model needs to be purchased to activate.');
      return;
    }
    
    setModels(prev => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        enabled: !prev[modelId].enabled
      }
    }));
  };

  const handleViewDetails = (model) => {
    setSelectedModel(model);
    setDetailsOpen(true);
  };

  const getModelStatus = (model) => {
    const state = models[model.id];
    if (!state?.purchased) {
      return { color: 'default', icon: <LockIcon />, text: 'Locked' };
    }
    if (state?.enabled) {
      return { color: 'success', icon: <CheckCircleIcon />, text: 'Active' };
    }
    return { color: 'warning', icon: <WarningIcon />, text: 'Inactive' };
  };

  const getTotalStats = () => {
    let total = 0;
    let active = 0;
    let purchased = 0;
    
    modelCategories.forEach(category => {
      category.models.forEach(model => {
        total++;
        if (models[model.id]?.purchased) purchased++;
        if (models[model.id]?.enabled) active++;
      });
    });
    
    return { total, active, purchased };
  };

  const stats = getTotalStats();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Control Center
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage ML models and data source integrations in one place
        </Typography>
      </Box>

      {/* Main Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
        >
          <Tab label="AI Models" icon={<PsychologyIcon />} iconPosition="start" />
          <Tab label="Database Connectors" icon={<AccountTreeIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Models
              </Typography>
              <Typography variant="h4">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Models
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Purchased
              </Typography>
              <Typography variant="h4" color="primary.main">
                {stats.purchased}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Available
              </Typography>
              <Typography variant="h4" color="text.secondary">
                {stats.total - stats.purchased}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedCategory}
          onChange={(e, v) => setSelectedCategory(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {modelCategories.map((category, idx) => (
            <Tab
              key={idx}
              label={category.name}
              icon={category.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Models Grid */}
      <Grid container spacing={3}>
        {modelCategories[selectedCategory].models.map((model) => {
          const status = getModelStatus(model);
          const isLocked = !models[model.id]?.purchased;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={model.id}>
              <Card
                sx={{
                  opacity: isLocked ? 0.7 : 1,
                  position: 'relative',
                  height: '100%',
                }}
              >
                {isLocked && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      zIndex: 1,
                    }}
                  >
                    <Tooltip title="Model not purchased">
                      <LockIcon color="action" />
                    </Tooltip>
                  </Box>
                )}
                
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: modelCategories[selectedCategory].color,
                        mr: 2,
                      }}
                    >
                      {model.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {model.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {model.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      size="small"
                      icon={status.icon}
                      label={status.text}
                      color={status.color}
                    />
                  </Box>

                  {!isLocked && (
                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Accuracy
                          </Typography>
                          <Typography variant="body2">
                            {model.metrics.accuracy}%
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Usage
                          </Typography>
                          <Typography variant="body2">
                            {model.metrics.usage}%
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            ROI
                          </Typography>
                          <Typography variant="body2">
                            {model.metrics.roi}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  <Stack direction="row" spacing={2} alignItems="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={models[model.id]?.enabled || false}
                          onChange={() => handleToggleModel(model.id)}
                          disabled={isLocked}
                        />
                      }
                      label={models[model.id]?.enabled ? 'Enabled' : 'Disabled'}
                    />
                    <Box sx={{ flex: 1 }} />
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(model)}
                    >
                      <InfoIcon />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

          {/* Model Details Dialog */}
          <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedModel && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: modelCategories[selectedCategory].color }}>
                  {selectedModel.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedModel.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedModel.description}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Features
                </Typography>
                <List dense>
                  {selectedModel.features.map((feature, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              {models[selectedModel.id]?.purchased && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Accuracy: {selectedModel.metrics.accuracy}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={selectedModel.metrics.accuracy}
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Usage: {selectedModel.metrics.usage}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={selectedModel.metrics.usage}
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      ROI: {selectedModel.metrics.roi}
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {!models[selectedModel.id]?.purchased && (
                <Alert severity="info">
                  This model is not yet purchased. Contact sales to add this model to your subscription.
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              {!models[selectedModel.id]?.purchased && (
                <Button variant="contained" color="primary">
                  Request Access
                </Button>
              )}
            </DialogActions>
          </>
        )}
          </Dialog>
        </Box>
      )}

      {/* Database Connectors Tab */}
      {activeTab === 1 && <DatabaseConnectors />}
    </Box>
  );
};

export default ModelControlCenter;