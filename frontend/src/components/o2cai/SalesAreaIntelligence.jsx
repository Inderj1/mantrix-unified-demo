import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  alpha,
  Select,
  MenuItem,
  FormControl,
  TextField,
  InputAdornment,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterList as FilterListIcon,
  SmartToy as SmartToyIcon,
  Send as SendIcon,
  Star as StarIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import o2cTheme from './o2cTheme';

const PRIMARY_BLUE = '#0854a0';
const ACCENT_BLUE = '#1976d2';

// KPI Data
const kpiData = [
  { label: 'Sales Area Revenue', value: '$89.4M', trend: 'up', trendValue: '14.2% vs LY', color: PRIMARY_BLUE },
  { label: 'Orders', value: '4,821', trend: 'up', trendValue: '9.8%', color: '#059669' },
  { label: 'DSO (Days)', value: '38.2', trend: 'up', trendValue: '↓ 4.1 days', color: '#059669' },
  { label: 'OTIF Rate', value: '96.4%', trend: 'up', trendValue: '2.1%', color: '#059669' },
  { label: 'Avg Order Value', value: '$18,540', trend: 'up', trendValue: '4.0%', color: '#d97706' },
];

// Sales Area Cards Data
const salesAreaCards = [
  { id: 1, name: 'US Direct - Industrial', code: '1000-10-00', revenue: '$32.1M', orders: 1842, dso: 35.2, badge: 'top' },
  { id: 2, name: 'US Direct - Automotive', code: '1000-10-01', revenue: '$18.4M', orders: 924, dso: 38.6, badge: 'growing' },
  { id: 3, name: 'US Distribution - Industrial', code: '1000-20-00', revenue: '$22.8M', orders: 1247, dso: 42.1, badge: 'top' },
  { id: 4, name: 'US OEM - Consumer', code: '1000-30-02', revenue: '$8.6M', orders: 412, dso: 52.4, badge: 'declining' },
];

// DSO Heatmap Data
const dsoHeatmapData = {
  channels: ['Direct (10)', 'Distribution (20)', 'OEM (30)'],
  divisions: ['Industrial (00)', 'Automotive (01)', 'Consumer (02)', 'Healthcare (03)'],
  values: [
    [35.2, 38.6, 41.2, 44.8],
    [42.1, 45.3, 48.7, 52.1],
    [48.4, 52.4, 56.8, 61.2],
  ],
};

// AI Recommendations
const aiRecommendations = [
  {
    type: 'opportunity',
    title: 'Expand Direct Channel in Automotive',
    description: 'Direct-Automotive showing 22% order growth but only 8% revenue share. Recommend targeted pricing strategy to capture more high-value orders.',
    impact: '+$2.4M potential',
  },
  {
    type: 'warning',
    title: 'OEM Channel DSO Trending High',
    description: 'OEM-Consumer DSO at 52.4 days, 18 days above target. Review payment terms with key accounts: CUST-4421, CUST-4502.',
    impact: '-$890K cash tied',
  },
];

const SalesAreaIntelligence = ({ onBack, onNavigate, darkMode = false }) => {
  const [selectedSalesOrg, setSelectedSalesOrg] = useState('1000');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [selectedCard, setSelectedCard] = useState(null);
  const [aiQuestion, setAiQuestion] = useState('');

  const getDsoColor = (value) => {
    if (value < 40) return '#059669';
    if (value < 50) return '#d97706';
    return '#dc2626';
  };

  const getBadgeStyle = (badge) => {
    const styles = {
      top: { bgcolor: alpha('#10b981', 0.12), color: '#059669' },
      growing: { bgcolor: alpha('#1976d2', 0.12), color: '#1565c0' },
      declining: { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626' },
    };
    return styles[badge] || styles.top;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          background: darkMode
            ? 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)'
            : o2cTheme.bannerGradient,
          borderBottom: `2px solid ${darkMode ? alpha(ACCENT_BLUE, 0.3) : alpha(ACCENT_BLUE, 0.2)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={onBack} size="small" sx={{ color: darkMode ? '#e2e8f0' : PRIMARY_BLUE }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: darkMode ? '#e2e8f0' : PRIMARY_BLUE }}>
                Sales Area Intelligence
              </Typography>
              <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Performance Matrix • DSO Heatmap • Channel Analysis
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Step 2 of 5"
            size="small"
            sx={{ bgcolor: alpha(PRIMARY_BLUE, 0.12), color: PRIMARY_BLUE, fontWeight: 600 }}
          />
        </Box>
      </Paper>

      {/* Context Filters */}
      <Box sx={{ px: 2, py: 1, bgcolor: darkMode ? '#161b22' : 'white', borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`, display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <FilterListIcon sx={{ fontSize: 16, color: darkMode ? '#8b949e' : '#64748b' }} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={selectedSalesOrg}
            onChange={(e) => setSelectedSalesOrg(e.target.value)}
            sx={{ fontSize: '0.7rem', bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.7rem' }}>All Sales Orgs</MenuItem>
            <MenuItem value="1000" sx={{ fontSize: '0.7rem' }}>US (1000)</MenuItem>
            <MenuItem value="2000" sx={{ fontSize: '0.7rem' }}>EMEA (2000)</MenuItem>
            <MenuItem value="3000" sx={{ fontSize: '0.7rem' }}>APAC (3000)</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            sx={{ fontSize: '0.7rem', bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.7rem' }}>All Channels</MenuItem>
            <MenuItem value="10" sx={{ fontSize: '0.7rem' }}>Direct (10)</MenuItem>
            <MenuItem value="20" sx={{ fontSize: '0.7rem' }}>Distribution (20)</MenuItem>
            <MenuItem value="30" sx={{ fontSize: '0.7rem' }}>OEM (30)</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            sx={{ fontSize: '0.7rem', bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.7rem' }}>All Divisions</MenuItem>
            <MenuItem value="00" sx={{ fontSize: '0.7rem' }}>Industrial (00)</MenuItem>
            <MenuItem value="01" sx={{ fontSize: '0.7rem' }}>Automotive (01)</MenuItem>
            <MenuItem value="02" sx={{ fontSize: '0.7rem' }}>Consumer (02)</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#64748b' }}>
          Showing: US Sales Org (1000) • 4,821 orders • $89.4M revenue
        </Typography>
      </Box>

      {/* KPI Strip */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: darkMode ? '#0d1117' : '#f8fafc', borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}` }}>
        <Grid container spacing={1.5}>
          {kpiData.map((kpi, index) => (
            <Grid item xs={2.4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  textAlign: 'center',
                  bgcolor: darkMode ? '#161b22' : 'white',
                  border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
                  borderRadius: 1,
                }}
              >
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: kpi.color }}>
                  {kpi.value}
                </Typography>
                <Typography sx={{ fontSize: '0.55rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase', mt: 0.5 }}>
                  {kpi.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                  {kpi.trend === 'up' ? (
                    <TrendingUpIcon sx={{ fontSize: 10, color: '#059669' }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 10, color: '#dc2626' }} />
                  )}
                  <Typography sx={{ fontSize: '0.55rem', color: kpi.trend === 'up' ? '#059669' : '#dc2626' }}>
                    {kpi.trendValue}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Grid container spacing={2}>
          {/* Left Panel - Sales Area Cards & Heatmap */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                bgcolor: darkMode ? '#161b22' : 'white',
                border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 1.5, borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`, bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} />
                  Sales Area Performance
                </Typography>
              </Box>

              {/* Sales Area Cards Grid */}
              <Box sx={{ p: 1.5 }}>
                <Grid container spacing={1.5}>
                  {salesAreaCards.map((card) => (
                    <Grid item xs={6} key={card.id}>
                      <Paper
                        elevation={0}
                        onClick={() => setSelectedCard(card.id)}
                        sx={{
                          p: 1.5,
                          cursor: 'pointer',
                          bgcolor: darkMode ? '#0d1117' : '#f8fafc',
                          border: `1px solid ${selectedCard === card.id ? PRIMARY_BLUE : darkMode ? '#21262d' : '#e2e8f0'}`,
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: darkMode ? alpha(PRIMARY_BLUE, 0.1) : alpha(PRIMARY_BLUE, 0.05),
                            borderColor: PRIMARY_BLUE,
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                              {card.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>
                              {card.code}
                            </Typography>
                          </Box>
                          <Chip
                            label={card.badge.toUpperCase()}
                            size="small"
                            sx={{ ...getBadgeStyle(card.badge), fontSize: '0.55rem', height: 18 }}
                          />
                        </Box>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: PRIMARY_BLUE }}>
                              {card.revenue}
                            </Typography>
                            <Typography sx={{ fontSize: '0.5rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase' }}>
                              Revenue
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                              {card.orders.toLocaleString()}
                            </Typography>
                            <Typography sx={{ fontSize: '0.5rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase' }}>
                              Orders
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: getDsoColor(card.dso) }}>
                              {card.dso}
                            </Typography>
                            <Typography sx={{ fontSize: '0.5rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase' }}>
                              DSO
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* DSO Heatmap */}
              <Box sx={{ p: 1.5, borderTop: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}` }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShowChartIcon sx={{ fontSize: 14, color: PRIMARY_BLUE }} />
                  DSO Heatmap (Channel × Division)
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '100px repeat(4, 1fr)', gap: 0.5 }}>
                  {/* Header Row */}
                  <Box />
                  {dsoHeatmapData.divisions.map((div, i) => (
                    <Typography key={i} sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b', textAlign: 'center' }}>
                      {div}
                    </Typography>
                  ))}
                  {/* Data Rows */}
                  {dsoHeatmapData.channels.map((channel, rowIdx) => (
                    <React.Fragment key={rowIdx}>
                      <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b', display: 'flex', alignItems: 'center' }}>
                        {channel}
                      </Typography>
                      {dsoHeatmapData.values[rowIdx].map((val, colIdx) => (
                        <Box
                          key={colIdx}
                          sx={{
                            p: 0.75,
                            textAlign: 'center',
                            borderRadius: 0.5,
                            bgcolor: alpha(getDsoColor(val), 0.15),
                          }}
                        >
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: getDsoColor(val) }}>
                            {val}
                          </Typography>
                        </Box>
                      ))}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Panel - AI Recommendations */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                bgcolor: darkMode ? '#161b22' : 'white',
                border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ p: 1.5, borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`, bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmartToyIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} />
                  AI Recommendations
                </Typography>
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
                {aiRecommendations.map((rec, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      bgcolor: darkMode
                        ? alpha(rec.type === 'warning' ? '#d97706' : PRIMARY_BLUE, 0.1)
                        : alpha(rec.type === 'warning' ? '#f59e0b' : PRIMARY_BLUE, 0.08),
                      border: `1px solid ${alpha(rec.type === 'warning' ? '#d97706' : PRIMARY_BLUE, 0.3)}`,
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        color: rec.type === 'warning' ? '#d97706' : PRIMARY_BLUE,
                        textTransform: 'uppercase',
                                              }}>
                        {rec.type === 'warning' ? '⚠️ Warning' : '💡 Opportunity'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: '#059669' }}>
                        {rec.impact}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', mb: 0.5 }}>
                      {rec.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#64748b', lineHeight: 1.5 }}>
                      {rec.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                      <Button size="small" sx={{ fontSize: '0.6rem', textTransform: 'none' }}>
                        View Details
                      </Button>
                      <Button size="small" sx={{ fontSize: '0.6rem', textTransform: 'none' }}>
                        Dismiss
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>

              {/* AI Input */}
              <Box sx={{ p: 1.5, borderTop: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}` }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask about sales area performance..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" sx={{ color: PRIMARY_BLUE }}>
                          <SendIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { fontSize: '0.7rem' },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: darkMode ? '#0d1117' : '#f8fafc' } }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderTop: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
          bgcolor: darkMode ? '#0d1117' : '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>
            SAP Tables:
          </Typography>
          {['TVKO', 'TVTW', 'TSPA', 'KNVV', 'VBAK', 'VBAP'].map((table) => (
            <Chip key={table} label={table} size="small" sx={{ fontSize: '0.55rem', height: 18 }} />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onNavigate && onNavigate('executive-command-center')}
            sx={{ fontSize: '0.7rem', textTransform: 'none', borderColor: darkMode ? '#21262d' : '#e2e8f0', color: darkMode ? '#8b949e' : '#64748b' }}
          >
            ← Back to Executive
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => onNavigate && onNavigate('customer-intelligence')}
            sx={{ fontSize: '0.7rem', textTransform: 'none', bgcolor: PRIMARY_BLUE, '&:hover': { bgcolor: '#074080' } }}
          >
            Drill into Customers →
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SalesAreaIntelligence;
