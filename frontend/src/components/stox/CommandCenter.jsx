import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
  TextField, InputAdornment, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Avatar, Divider, Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon,
  AttachMoney, TrendingUp, Speed, Inventory, Warning, CheckCircle, Search,
  Send, SmartToy, ArrowForward, Error as ErrorIcon, Info as InfoIcon,
  Savings, AccountBalance, LocalShipping, Schedule, Assessment,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

/**
 * Command Center - Tile 0
 *
 * Purpose: The planner's "front door" - Chat + KPIs + Top Exceptions
 *
 * Features:
 * - AI Chat interface for quick queries
 * - Top 10 Exceptions requiring attention
 * - Key KPIs summary cards
 * - Quick navigation to relevant tiles
 * - Alert feed from all layers
 */

// Mock exceptions data
const generateExceptions = () => [
  {
    id: 'EXC-001',
    type: 'critical',
    title: 'Excess Stock Alert',
    description: 'SKU-10001 at PLANT-001 has $45K excess inventory (180 days old)',
    impact: '$45,000 WC tied',
    action: 'Review excess stock',
    tile: 'working-capital-baseline',
  },
  {
    id: 'EXC-002',
    type: 'warning',
    title: 'Safety Stock Below Target',
    description: 'SKU-10005 safety stock at 65% of recommended level',
    impact: '2.3% stockout risk',
    action: 'Adjust safety stock',
    tile: 'mrp-parameter-optimizer',
  },
  {
    id: 'EXC-003',
    type: 'critical',
    title: 'Supplier Lead Time Increase',
    description: 'VND-003 lead time increased from 14 to 21 days',
    impact: 'Affects 12 SKUs',
    action: 'Update parameters',
    tile: 'supply-lead-time',
  },
  {
    id: 'EXC-004',
    type: 'info',
    title: 'Pending Recommendations',
    description: '5 high-priority recommendations awaiting approval',
    impact: '$125K potential savings',
    action: 'Review recommendations',
    tile: 'recommendations-hub',
  },
  {
    id: 'EXC-005',
    type: 'warning',
    title: 'DIO Above Target',
    description: 'PLANT-002 DIO at 52 days vs 35 day target',
    impact: '$180K WC opportunity',
    action: 'Review inventory',
    tile: 'working-capital-baseline',
  },
  {
    id: 'EXC-006',
    type: 'critical',
    title: 'Lot Size Optimization',
    description: 'EOQ analysis shows 15% reduction opportunity',
    impact: '$78K annual savings',
    action: 'Optimize lot sizes',
    tile: 'mrp-parameter-optimizer',
  },
  {
    id: 'EXC-007',
    type: 'info',
    title: 'Forecast Accuracy Drop',
    description: 'Hair Color category MAPE increased to 18%',
    impact: 'Review forecast',
    action: 'Check demand intelligence',
    tile: 'demand-intelligence',
  },
  {
    id: 'EXC-008',
    type: 'warning',
    title: 'Service Level Risk',
    description: '3 SKUs projected below 95% service target',
    impact: 'Customer impact',
    action: 'Adjust parameters',
    tile: 'inventory-health-check',
  },
];

// Mock chat messages
const initialMessages = [
  {
    id: 1,
    type: 'assistant',
    text: "Welcome to STOX.AI Command Center. I can help you with inventory optimization, working capital analysis, and parameter tuning. What would you like to explore today?",
    timestamp: new Date().toISOString(),
  },
];

const CommandCenter = ({ onBack, onTileClick }) => {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState(null);
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setExceptions(generateExceptions());
      setKpis({
        totalWCTied: 2850000,
        potentialSavings: 485000,
        serviceLevel: 96.2,
        serviceLevelTarget: 97.5,
        inventoryTurns: 5.8,
        inventoryTurnsTarget: 6.5,
        dioAvg: 45,
        dioTarget: 35,
        pendingRecs: 8,
        criticalAlerts: 3,
      });
      setLoading(false);
    }, 500);
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      text: chatInput,
      timestamp: new Date().toISOString(),
    };

    // Mock AI response
    const responses = {
      'wc': "Based on current analysis, you have $2.85M in working capital tied up in inventory. The largest opportunities are in excess stock ($320K) and safety stock optimization ($165K). Would you like me to show the Working Capital Baseline tile?",
      'savings': "I've identified $485K in potential WC savings across 12 recommendations. The top 3 opportunities are: 1) Excess stock liquidation ($120K), 2) Safety stock reduction ($95K), 3) Lot size optimization ($78K). Shall I take you to the Recommendations Hub?",
      'service': "Current service level is 96.2% against a 97.5% target. The gap is primarily in 3 SKUs with high demand variability. I recommend reviewing the MRP Parameter Optimizer to adjust safety stocks.",
      'default': "I can help you with working capital analysis, inventory optimization, and exception management. Try asking about 'WC opportunities', 'savings potential', or 'service level status'.",
    };

    let responseText = responses.default;
    const lowerInput = chatInput.toLowerCase();
    if (lowerInput.includes('wc') || lowerInput.includes('working capital') || lowerInput.includes('inventory')) {
      responseText = responses.wc;
    } else if (lowerInput.includes('saving') || lowerInput.includes('opportunity') || lowerInput.includes('recommend')) {
      responseText = responses.savings;
    } else if (lowerInput.includes('service') || lowerInput.includes('stockout') || lowerInput.includes('fill')) {
      responseText = responses.service;
    }

    const assistantMessage = {
      id: chatMessages.length + 2,
      type: 'assistant',
      text: responseText,
      timestamp: new Date().toISOString(),
    };

    setChatMessages([...chatMessages, userMessage, assistantMessage]);
    setChatInput('');
  };

  const handleExceptionClick = (exception) => {
    if (onTileClick && exception.tile) {
      onTileClick(exception.tile);
    }
  };

  const getExceptionIcon = (type) => {
    switch (type) {
      case 'critical': return <ErrorIcon sx={{ color: '#ef4444' }} />;
      case 'warning': return <Warning sx={{ color: '#f59e0b' }} />;
      case 'info': return <InfoIcon sx={{ color: '#0078d4' }} />;
      default: return <InfoIcon sx={{ color: '#64748b' }} />;
    }
  };

  const getExceptionColor = (type) => {
    switch (type) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#0078d4';
      default: return '#64748b';
    }
  };

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 1.5, flexShrink: 0 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 16 }} />} sx={{ mb: 1 }}>
          <Link
            component="button"
            variant="caption"
            underline="hover"
            onClick={onBack}
            sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: '#0078d4' } }}
          >
            CORE.AI
          </Link>
          <Link
            component="button"
            variant="caption"
            underline="hover"
            onClick={onBack}
            sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: '#0078d4' } }}
          >
            STOX.AI
          </Link>
          <Typography variant="caption" fontWeight={600} color="#0078d4">Command Center</Typography>
        </Breadcrumbs>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              bgcolor: alpha('#0078d4', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <DashboardIcon sx={{ fontSize: 20, color: '#0078d4' }} />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" fontWeight={700} color="#0078d4">Command Center</Typography>
                <Chip label="Tile 0" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#0078d4', 0.1), color: '#0078d4', fontWeight: 600 }} />
              </Stack>
              <Typography variant="caption" color="text.secondary">Planner's Front Door - KPIs, Exceptions & AI Assistant</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={fetchData} color="primary" size="small"><Refresh fontSize="small" /></IconButton>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
          </Stack>
        </Stack>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', gap: 1.5, overflow: 'hidden', minHeight: 0 }}>
        {/* Left Panel - AI Chat */}
        <Paper sx={{ width: 420, maxHeight: 420, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha('#0078d4', 0.05), flexShrink: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#0078d4' }}>
                <SmartToy sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700}>STOX AI Assistant</Typography>
            </Stack>
          </Box>

          {/* Chat Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 1, minHeight: 0 }}>
            {chatMessages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  mb: 0.75,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '90%',
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: msg.type === 'user' ? '#0078d4' : alpha('#0078d4', 0.08),
                    color: msg.type === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                    {msg.text}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Chat Input */}
          <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask about WC, savings..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
              sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.75 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleChatSubmit} color="primary" size="small">
                      <Send fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Paper>

        {/* Right Panel - KPIs & Exceptions */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden', minHeight: 0 }}>
          {/* Compact KPI Cards */}
          {kpis && (
            <Grid container spacing={1} sx={{ flexShrink: 0 }}>
              <Grid item xs={3}>
                <Card sx={{ borderLeft: '3px solid #0078d4' }}>
                  <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>WC Tied Up</Typography>
                    <Typography variant="h6" fontWeight={700} color="#0078d4">${(kpis.totalWCTied / 1000000).toFixed(2)}M</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={3}>
                <Card sx={{ borderLeft: '3px solid #10b981' }}>
                  <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Potential Savings</Typography>
                    <Typography variant="h6" fontWeight={700} color="#10b981">${(kpis.potentialSavings / 1000).toFixed(0)}K</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={3}>
                <Card sx={{ borderLeft: `3px solid ${kpis.serviceLevel < kpis.serviceLevelTarget ? '#f59e0b' : '#10b981'}` }}>
                  <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Service Level</Typography>
                    <Typography variant="h6" fontWeight={700} color={kpis.serviceLevel < kpis.serviceLevelTarget ? '#f59e0b' : '#10b981'}>
                      {kpis.serviceLevel}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={3}>
                <Card sx={{ borderLeft: '3px solid #005a9e' }}>
                  <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Inv. Turns</Typography>
                    <Typography variant="h6" fontWeight={700} color="#005a9e">{kpis.inventoryTurns}x</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Quick Navigation - Compact inline */}
          <Paper sx={{ p: 1, flexShrink: 0 }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap alignItems="center">
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mr: 0.5 }}>Quick:</Typography>
              {[
                { label: 'WC Baseline', tile: 'working-capital-baseline' },
                { label: 'Recommendations', tile: 'recommendations-hub' },
                { label: 'MRP Optimizer', tile: 'mrp-parameter-optimizer' },
                { label: 'Inventory Health', tile: 'inventory-health-check' },
                { label: 'Supply Lead Time', tile: 'supply-lead-time' },
                { label: 'What-If', tile: 'what-if-simulator' },
              ].map((item) => (
                <Chip
                  key={item.tile}
                  label={item.label}
                  size="small"
                  onClick={() => onTileClick && onTileClick(item.tile)}
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    bgcolor: alpha('#0078d4', 0.08),
                    color: '#0078d4',
                    fontWeight: 600,
                    '&:hover': { bgcolor: alpha('#0078d4', 0.15) },
                  }}
                />
              ))}
            </Stack>
          </Paper>

          {/* Exceptions Panel */}
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha('#0078d4', 0.03), flexShrink: 0 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Warning sx={{ color: '#ef4444', fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight={700}>Exceptions</Typography>
                  <Chip
                    label={`${exceptions.filter(e => e.type === 'critical').length} Critical`}
                    size="small"
                    sx={{ height: 20, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 600, fontSize: '0.65rem' }}
                  />
                </Stack>
                <Chip label={`${exceptions.length} Total`} size="small" sx={{ height: 20, bgcolor: alpha('#0078d4', 0.1), color: '#0078d4', fontWeight: 600, fontSize: '0.65rem' }} />
              </Stack>
            </Box>

            <List sx={{ flex: 1, overflow: 'auto', py: 0, minHeight: 0 }} dense>
              {exceptions.map((exception, idx) => (
                <React.Fragment key={exception.id}>
                  <ListItem
                    sx={{
                      py: 0.5,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(getExceptionColor(exception.type), 0.05) },
                    }}
                    onClick={() => handleExceptionClick(exception)}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {getExceptionIcon(exception.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{exception.title}</Typography>
                          <Chip
                            label={exception.type}
                            size="small"
                            sx={{ height: 16, fontSize: '0.6rem', bgcolor: alpha(getExceptionColor(exception.type), 0.1), color: getExceptionColor(exception.type), fontWeight: 600 }}
                          />
                          <Chip
                            label={exception.impact}
                            size="small"
                            sx={{ height: 16, fontSize: '0.6rem', bgcolor: alpha('#64748b', 0.08), color: '#64748b' }}
                          />
                        </Stack>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {exception.description}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => handleExceptionClick(exception)}>
                        <ArrowForward sx={{ fontSize: 16, color: getExceptionColor(exception.type) }} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {idx < exceptions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default CommandCenter;
