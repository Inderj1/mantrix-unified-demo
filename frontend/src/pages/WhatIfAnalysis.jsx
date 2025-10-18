import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  AvatarGroup,
  TextField,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Tooltip,
  Divider,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Badge,
  CircularProgress,
  useTheme,
  alpha,
  InputAdornment,
} from '@mui/material';
import {
  PlayArrow,
  Settings,
  TrendingUp,
  Psychology,
  Group,
  AutoAwesome,
  ChevronRight,
  FilterList,
  Download,
  Share,
  ElectricBolt,
  BarChart,
  ShowChart,
  PieChart as PieChartIcon,
  Speed,
  CheckCircle,
  Refresh,
  Layers,
  Language,
  Business,
  ShoppingCart,
  Favorite,
  Flight,
  AttachMoney,
  Search,
  Add,
  Storage,
  TableChart,
} from '@mui/icons-material';

const WhatIfAnalysisPage = () => {
  const theme = useTheme();
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedTables, setSelectedTables] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [collaborators] = useState([
    { id: 1, name: 'Sarah Chen', avatar: 'SC', color: '#9c27b0', active: true },
    { id: 2, name: 'Mike Johnson', avatar: 'MJ', color: '#2196f3', active: true },
    { id: 3, name: 'Ana Silva', avatar: 'AS', color: '#4caf50', active: false }
  ]);
  
  const [aiSuggestions] = useState([
    { id: 1, text: 'Analyze seasonal impact on revenue', confidence: 92 },
    { id: 2, text: 'Test 15% price increase scenario', confidence: 87 },
    { id: 3, text: 'Evaluate supply chain disruption effects', confidence: 85 }
  ]);

  const domains = [
    { id: 'finance', name: 'Finance', icon: AttachMoney, color: '#4caf50', tables: 28 },
    { id: 'retail', name: 'Retail', icon: ShoppingCart, color: '#9c27b0', tables: 34 },
    { id: 'healthcare', name: 'Healthcare', icon: Favorite, color: '#f44336', tables: 45 },
    { id: 'manufacturing', name: 'Manufacturing', icon: Business, color: '#2196f3', tables: 52 },
    { id: 'travel', name: 'Travel', icon: Flight, color: '#ff9800', tables: 31 },
    { id: 'global', name: 'Cross-Industry', icon: Language, color: '#607d8b', tables: 156 }
  ];

  const dataSources = [
    { id: 1, name: 'Sales Database', type: 'PostgreSQL', status: 'connected', records: '2.3M' },
    { id: 2, name: 'Customer Analytics', type: 'Snowflake', status: 'connected', records: '5.1M' },
    { id: 3, name: 'Real-time Events', type: 'Kafka', status: 'streaming', records: '∞' },
    { id: 4, name: 'Financial Data', type: 'SAP', status: 'syncing', records: '1.8M' }
  ];

  const [performanceMetrics, setPerformanceMetrics] = useState({
    queryTime: 47,
    accuracy: 99.2,
    cacheHit: 84,
    gpuUtilization: 62
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceMetrics(prev => ({
        queryTime: Math.max(20, prev.queryTime + (Math.random() - 0.5) * 10),
        accuracy: Math.min(99.9, Math.max(95, prev.accuracy + (Math.random() - 0.5) * 0.5)),
        cacheHit: Math.min(95, Math.max(70, prev.cacheHit + (Math.random() - 0.5) * 5)),
        gpuUtilization: Math.min(90, Math.max(30, prev.gpuUtilization + (Math.random() - 0.5) * 8))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setActiveScenario({
        id: Date.now(),
        name: 'Revenue Impact Analysis',
        status: 'completed',
        impact: '+12.4%',
        confidence: 94,
        recommendations: [
          'Implement price adjustment in Q2',
          'Focus on high-margin products',
          'Expand into emerging markets'
        ]
      });
    }, 3000);
  };

  const handleTableToggle = (tableName) => {
    setSelectedTables(prev => 
      prev.includes(tableName)
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #2196F3 0%, #9C27B0 100%)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ElectricBolt sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  What-If Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Intelligent Scenario Planning
                </Typography>
              </Box>
            </Stack>
          </Grid>
          
          <Grid item>
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Performance Badges */}
              <Chip
                icon={<Speed />}
                label={`${performanceMetrics.queryTime.toFixed(0)}ms`}
                size="small"
                sx={{ 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: 'success.dark'
                }}
              />
              <Chip
                label={`${performanceMetrics.accuracy.toFixed(1)}% Accuracy`}
                size="small"
                sx={{ 
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: 'info.dark'
                }}
              />
              
              {/* Collaborators */}
              <AvatarGroup max={4}>
                {collaborators.map((collab) => (
                  <Tooltip key={collab.id} title={collab.name}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: collab.color,
                        fontSize: 14
                      }}
                    >
                      {collab.avatar}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
              
              <Button
                variant="outlined"
                startIcon={<Share />}
                sx={{ borderRadius: 2 }}
              >
                Share
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <Stack spacing={3}>
            {/* Domain Selection */}
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Select Industry Domain
              </Typography>
              <Grid container spacing={1}>
                {domains.map((domain) => {
                  const Icon = domain.icon;
                  return (
                    <Grid item xs={6} key={domain.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          transform: selectedDomain?.id === domain.id ? 'scale(1.05)' : 'scale(1)',
                          border: selectedDomain?.id === domain.id ? 2 : 1,
                          borderColor: selectedDomain?.id === domain.id ? domain.color : 'divider',
                          bgcolor: selectedDomain?.id === domain.id ? alpha(domain.color, 0.04) : 'background.paper',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            borderColor: domain.color
                          }
                        }}
                        onClick={() => setSelectedDomain(domain)}
                      >
                        <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                          <Icon sx={{ 
                            fontSize: 28, 
                            color: selectedDomain?.id === domain.id ? domain.color : 'text.secondary'
                          }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                            {domain.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {domain.tables} tables
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>

            {/* Data Sources */}
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Data Sources
              </Typography>
              <Stack spacing={1}>
                {dataSources.map((source) => (
                  <Paper
                    key={source.id}
                    variant="outlined"
                    sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Storage sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {source.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {source.type} • {source.records}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: source.status === 'connected' ? 'success.main' :
                                 source.status === 'streaming' ? 'info.main' : 'warning.main'
                      }}
                    />
                  </Paper>
                ))}
              </Stack>
            </Paper>

            {/* AI Suggestions */}
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AutoAwesome sx={{ fontSize: 18, color: 'secondary.main' }} />
                  AI Suggestions
                </Typography>
                <IconButton size="small">
                  <Refresh sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
              <Stack spacing={1}>
                {aiSuggestions.map((suggestion) => (
                  <Paper
                    key={suggestion.id}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.04)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
                      border: 1,
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {suggestion.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Confidence: {suggestion.confidence}%
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={9}>
          {/* Toolbar */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    startIcon={isAnalyzing ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <PlayArrow />}
                    onClick={runAnalysis}
                    disabled={!selectedDomain || isAnalyzing}
                    sx={{ borderRadius: 2 }}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                  </Button>
                  
                  <TextField
                    size="small"
                    placeholder="Ask a question..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: 300 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Stack>
              </Grid>
              
              <Grid item>
                <Stack direction="row" spacing={1}>
                  <IconButton>
                    <FilterList />
                  </IconButton>
                  <IconButton>
                    <Download />
                  </IconButton>
                  <IconButton>
                    <Settings />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Canvas Area */}
          {!selectedDomain ? (
            <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box>
                <Layers sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Select a Domain to Start
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                  Choose an industry domain or use cross-industry analytics to begin your what-if analysis
                </Typography>
              </Box>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Stack spacing={3}>
                  {/* Table Selection */}
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <TableChart sx={{ mr: 1, color: 'text.secondary' }} />
                      Select Tables
                    </Typography>
                    <Grid container spacing={2}>
                      {['Orders', 'Customers', 'Products', 'Inventory', 'Transactions', 'Marketing'].map((table) => (
                        <Grid item xs={12} sm={6} md={4} key={table}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              bgcolor: selectedTables.includes(table) ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                              borderColor: selectedTables.includes(table) ? 'primary.main' : 'divider',
                              '&:hover': {
                                borderColor: 'primary.main'
                              }
                            }}
                            onClick={() => handleTableToggle(table)}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedTables.includes(table)}
                                  sx={{ p: 0, mr: 1 }}
                                />
                              }
                              label={table}
                              sx={{ m: 0, width: '100%' }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>

                  {/* Visualization Area */}
                  {activeScenario && (
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {activeScenario.name}
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Chip
                            icon={<CheckCircle />}
                            label={activeScenario.status}
                            color="success"
                            size="small"
                          />
                          <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600 }}>
                            {activeScenario.impact}
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Chart Placeholder */}
                      <Paper
                        variant="outlined"
                        sx={{
                          height: 300,
                          mb: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
                        }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <BarChart sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            Interactive visualization would render here
                          </Typography>
                        </Box>
                      </Paper>

                      {/* Recommendations */}
                      <Alert
                        severity="info"
                        icon={<Psychology />}
                      >
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          AI Recommendations
                        </Typography>
                        <Stack spacing={0.5}>
                          {activeScenario.recommendations.map((rec, idx) => (
                            <Typography key={idx} variant="body2">
                              • {rec}
                            </Typography>
                          ))}
                        </Stack>
                      </Alert>
                    </Paper>
                  )}
                </Stack>
              </Grid>

              {/* Right Panel */}
              <Grid item xs={12} lg={4}>
                <Stack spacing={3}>
                  {/* Quick Actions */}
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        { icon: ShowChart, label: 'Trend Analysis' },
                        { icon: PieChartIcon, label: 'Distribution' },
                        { icon: TrendingUp, label: 'Forecasting' },
                        { icon: Psychology, label: 'ML Insights' }
                      ].map((action, idx) => (
                        <Grid item xs={6} key={idx}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              textAlign: 'center',
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: 'primary.main'
                              }
                            }}
                          >
                            <action.icon sx={{ fontSize: 28, color: 'primary.main', mb: 1 }} />
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              {action.label}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>

                  {/* Performance Monitor */}
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f23 100%)',
                      color: 'white'
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <Speed sx={{ mr: 1 }} />
                      System Performance
                    </Typography>
                    <Stack spacing={2}>
                      {[
                        { label: 'Query Speed', value: performanceMetrics.queryTime, max: 100, color: '#4caf50' },
                        { label: 'Cache Hit Rate', value: performanceMetrics.cacheHit, max: 100, color: '#2196f3' },
                        { label: 'GPU Utilization', value: performanceMetrics.gpuUtilization, max: 100, color: '#9c27b0' }
                      ].map((metric, idx) => (
                        <Box key={idx}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">
                              {metric.label}
                            </Typography>
                            <Typography variant="caption">
                              {metric.value.toFixed(0)}{metric.label === 'Query Speed' ? 'ms' : '%'}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={metric.label === 'Query Speed' ? 100 - metric.value : metric.value}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.1)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                backgroundColor: metric.color
                              }
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default WhatIfAnalysisPage;