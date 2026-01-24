import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  alpha,
  TextField,
  InputAdornment,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SmartToy as SmartToyIcon,
  Send as SendIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import o2cTheme from './o2cTheme';
import SourceIndicator, { DATA_SOURCES } from './SourceIndicator';

const PRIMARY_BLUE = '#002352';
const ACCENT_BLUE = '#1976d2';

// Static AI Recommendations (mock - no real ML recommendation engine yet)
const aiRecommendations = [
  {
    type: 'opportunity',
    title: 'Upsell opportunity detected',
    description: 'Customers showing order growth may benefit from premium line adoption. Consider sales outreach for top performers.',
    impact: 'Variable',
    source: DATA_SOURCES.MOCK,
  },
  {
    type: 'warning',
    title: 'Credit risk monitoring',
    description: 'Customers with high churn probability may require credit limit review and proactive dunning strategies.',
    impact: 'Risk mitigation',
    source: DATA_SOURCES.MOCK,
  },
];

const CustomerIntelligence = ({ onBack, onNavigate, darkMode = false }) => {
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState([]);
  const [segmentCounts, setSegmentCounts] = useState({
    invest: { count: 0, totalClv: 0 },
    maintain: { count: 0, totalClv: 0 },
    harvest: { count: 0, totalClv: 0 },
  });

  // Fetch real customer data from API
  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/o2cai/customers/list?limit=200');
        if (response.ok) {
          const result = await response.json();

          // Transform data for DataGrid
          const rows = (result.data || []).map((c, idx) => {
            // Determine segment based on CLV (if available) or revenue
            const clv = c.predictedCLV || c.totalRevenue * 1.5; // Estimate if no ML CLV
            let segment = 'maintain';
            if (clv >= 2400000) segment = 'invest';
            else if (clv < 500000) segment = 'harvest';

            // Determine risk based on churn probability
            let risk = 'low';
            if (c.churnProbability > 0.6) risk = 'high';
            else if (c.churnProbability > 0.3) risk = 'medium';

            return {
              id: idx + 1,
              customerId: c.customerId,
              name: c.customerName,
              country: c.country,
              city: c.city,
              segment,
              clv: clv,
              revenue: c.totalRevenue,
              orders: c.totalOrders,
              risk,
              churnProbability: c.churnProbability,
              creditScore: c.creditScore,
              customerSegment: c.customerSegment,
              priorityLevel: c.priorityLevel,
              sources: c.sources,
            };
          });

          setCustomerData(rows);

          // Calculate segment counts
          const counts = { invest: { count: 0, totalClv: 0 }, maintain: { count: 0, totalClv: 0 }, harvest: { count: 0, totalClv: 0 } };
          rows.forEach(r => {
            if (counts[r.segment]) {
              counts[r.segment].count++;
              counts[r.segment].totalClv += r.clv;
            }
          });
          setSegmentCounts(counts);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
      setLoading(false);
    };

    fetchCustomerData();
  }, []);

  // Customer Segments with real data
  const customerSegments = [
    {
      id: 'invest',
      label: 'INVEST',
      count: segmentCounts.invest.count,
      clv: `$${(segmentCounts.invest.totalClv / 1000000).toFixed(1)}M+`,
      color: '#059669',
      description: 'High growth potential',
      source: DATA_SOURCES.CALCULATED,
    },
    {
      id: 'maintain',
      label: 'MAINTAIN',
      count: segmentCounts.maintain.count,
      clv: `$${(segmentCounts.maintain.totalClv / 1000000).toFixed(1)}M`,
      color: PRIMARY_BLUE,
      description: 'Stable performers',
      source: DATA_SOURCES.CALCULATED,
    },
    {
      id: 'harvest',
      label: 'HARVEST',
      count: segmentCounts.harvest.count,
      clv: `<$${(segmentCounts.harvest.totalClv / 1000000).toFixed(1)}M`,
      color: '#d97706',
      description: 'Declining value',
      source: DATA_SOURCES.CALCULATED,
    },
  ];

  const getSegmentColor = (segment) => {
    const colors = { invest: '#059669', maintain: PRIMARY_BLUE, harvest: '#d97706' };
    return colors[segment] || PRIMARY_BLUE;
  };

  const getRiskChip = (risk) => {
    const config = {
      low: { label: 'LOW', bgcolor: alpha('#10b981', 0.12), color: '#059669' },
      medium: { label: 'MEDIUM', bgcolor: alpha('#f59e0b', 0.12), color: '#d97706' },
      high: { label: 'HIGH', bgcolor: alpha('#ef4444', 0.12), color: '#dc2626' },
    };
    return config[risk] || config.low;
  };

  const columns = [
    {
      field: 'customerId',
      headerName: 'CUSTOMER ID',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            label={params.value}
            size="small"
            sx={{ bgcolor: alpha(PRIMARY_BLUE, 0.12), color: PRIMARY_BLUE, fontSize: '0.65rem', fontWeight: 600 }}
          />
          <SourceIndicator source={DATA_SOURCES.SAP_MASTER} sapTable="KNA1" />
        </Box>
      ),
    },
    {
      field: 'name',
      headerName: 'CUSTOMER NAME',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.7rem' }}>{params.value}</Typography>
          <SourceIndicator source={DATA_SOURCES.SAP_MASTER} sapTable="KNA1" />
        </Box>
      ),
    },
    {
      field: 'segment',
      headerName: 'SEGMENT',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            label={params.value.toUpperCase()}
            size="small"
            sx={{ bgcolor: alpha(getSegmentColor(params.value), 0.12), color: getSegmentColor(params.value), fontSize: '0.6rem', fontWeight: 600, height: 20 }}
          />
          <SourceIndicator source={DATA_SOURCES.CALCULATED} />
        </Box>
      ),
    },
    {
      field: 'clv',
      headerName: 'CLV',
      width: 110,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ color: PRIMARY_BLUE, fontWeight: 600, fontSize: '0.75rem' }}>
            ${(params.value / 1000000).toFixed(2)}M
          </Typography>
          <SourceIndicator
            source={params.row.sources?.clv ? DATA_SOURCES.ML_INSIGHTS : DATA_SOURCES.CALCULATED}
            sapTable={params.row.sources?.clv?.table}
          />
        </Box>
      ),
    },
    {
      field: 'revenue',
      headerName: 'REVENUE YTD',
      width: 110,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.75rem' }}>${(params.value / 1000).toFixed(0)}K</Typography>
          <SourceIndicator source={DATA_SOURCES.SAP_SD} sapTable="VBAK/VBAP" />
        </Box>
      ),
    },
    {
      field: 'orders',
      headerName: 'ORDERS',
      width: 90,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.75rem' }}>{params.value}</Typography>
          <SourceIndicator source={DATA_SOURCES.SAP_SD} sapTable="VBAK" />
        </Box>
      ),
    },
    {
      field: 'risk',
      headerName: 'RISK',
      width: 100,
      renderCell: (params) => {
        const style = getRiskChip(params.value);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip label={style.label} size="small" sx={{ ...style, fontSize: '0.6rem', height: 20 }} />
            <SourceIndicator
              source={params.row.churnProbability ? DATA_SOURCES.ML_INSIGHTS : DATA_SOURCES.CALCULATED}
              sapTable="cm_insights_churn"
            />
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          background: darkMode ? 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)' : o2cTheme.bannerGradient,
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
                Customer Intelligence
              </Typography>
              <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                CLV Segments • Customer Portfolio • Risk Analysis
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="Step 3 of 5" size="small" sx={{ bgcolor: alpha(PRIMARY_BLUE, 0.12), color: PRIMARY_BLUE, fontWeight: 600 }} />
            <SourceIndicator source={DATA_SOURCES.SAP_MASTER} sapTable="KNA1" size="medium" />
          </Box>
        </Box>
      </Paper>

      {/* Segment Cards */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: darkMode ? '#0d1117' : '#f8fafc', borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}` }}>
        <Grid container spacing={1.5}>
          {customerSegments.map((seg) => (
            <Grid item xs={4} key={seg.id}>
              <Paper
                elevation={0}
                onClick={() => setSelectedSegment(selectedSegment === seg.id ? null : seg.id)}
                sx={{
                  p: 1.5,
                  cursor: 'pointer',
                  bgcolor: darkMode ? '#161b22' : 'white',
                  border: `1px solid ${selectedSegment === seg.id ? seg.color : darkMode ? '#21262d' : '#e2e8f0'}`,
                  borderLeft: `4px solid ${seg.color}`,
                  borderRadius: 1,
                  '&:hover': { bgcolor: darkMode ? alpha(seg.color, 0.1) : alpha(seg.color, 0.05) },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: seg.color }}>
                        {seg.label}
                      </Typography>
                      <SourceIndicator source={seg.source} />
                    </Box>
                    <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>
                      {seg.description}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    {loading ? (
                      <Skeleton width={40} height={24} />
                    ) : (
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                        {seg.count}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: '0.55rem', color: darkMode ? '#8b949e' : '#64748b' }}>
                      CLV {seg.clv}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Grid container spacing={2}>
          {/* Left Panel - Customer Portfolio */}
          <Grid item xs={12} md={8}>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} />
                    Customer Portfolio
                    <SourceIndicator source={DATA_SOURCES.SAP_MASTER} sapTable="KNA1" />
                  </Typography>
                  {loading && <CircularProgress size={16} />}
                </Box>
                <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#64748b', mt: 0.5 }}>
                  Click row for customer details • {customerData.length} customers loaded • Sorted by Revenue
                </Typography>
              </Box>
              <Box sx={{ flex: 1, p: 1.5 }}>
                <DataGrid
                  rows={selectedSegment ? customerData.filter(r => r.segment === selectedSegment) : customerData}
                  columns={columns}
                  density="compact"
                  loading={loading}
                  disableColumnMenu
                  disableRowSelectionOnClick
                  onRowClick={(params) => setSelectedCustomer(params.row)}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  sx={{
                    ...o2cTheme.getDataGridSx({ darkMode, clickable: true }),
                    '& .MuiDataGrid-cell': { fontSize: '0.7rem' },
                    '& .MuiDataGrid-columnHeaderTitle': { fontSize: '0.65rem' },
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Right Panel - Customer Details & AI */}
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
              {/* Customer Detail Panel */}
              {selectedCustomer ? (
                <>
                  <Box sx={{ p: 1.5, borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`, bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                      {selectedCustomer.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                      <Chip label={selectedCustomer.customerId} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
                      <Chip
                        label={selectedCustomer.segment.toUpperCase()}
                        size="small"
                        sx={{ bgcolor: alpha(getSegmentColor(selectedCustomer.segment), 0.12), color: getSegmentColor(selectedCustomer.segment), fontSize: '0.6rem', height: 18 }}
                      />
                      <SourceIndicator source={DATA_SOURCES.SAP_MASTER} sapTable="KNA1" />
                    </Box>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Paper elevation={0} sx={{ p: 1, bgcolor: darkMode ? '#0d1117' : '#f8fafc', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: PRIMARY_BLUE }}>
                              ${(selectedCustomer.clv / 1000000).toFixed(2)}M
                            </Typography>
                            <SourceIndicator
                              source={selectedCustomer.sources?.clv ? DATA_SOURCES.ML_INSIGHTS : DATA_SOURCES.CALCULATED}
                              sapTable={selectedCustomer.sources?.clv?.table}
                            />
                          </Box>
                          <Typography sx={{ fontSize: '0.55rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase' }}>
                            Customer Lifetime Value
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper elevation={0} sx={{ p: 1, bgcolor: darkMode ? '#0d1117' : '#f8fafc', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={{
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: selectedCustomer.creditScore > 700 ? '#059669' : selectedCustomer.creditScore > 500 ? '#d97706' : '#dc2626'
                            }}>
                              {selectedCustomer.creditScore ? selectedCustomer.creditScore.toFixed(0) : 'N/A'}
                            </Typography>
                            <SourceIndicator
                              source={selectedCustomer.creditScore ? DATA_SOURCES.ML_INSIGHTS : DATA_SOURCES.MOCK}
                              sapTable="cm_insights_credit_risk"
                            />
                          </Box>
                          <Typography sx={{ fontSize: '0.55rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase' }}>
                            Credit Score
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper elevation={0} sx={{ p: 1, bgcolor: darkMode ? '#0d1117' : '#f8fafc', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                              ${(selectedCustomer.revenue / 1000).toFixed(0)}K
                            </Typography>
                            <SourceIndicator source={DATA_SOURCES.SAP_SD} sapTable="VBAK/VBAP" />
                          </Box>
                          <Typography sx={{ fontSize: '0.55rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase' }}>
                            Revenue YTD
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper elevation={0} sx={{ p: 1, bgcolor: darkMode ? '#0d1117' : '#f8fafc', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                              {selectedCustomer.orders}
                            </Typography>
                            <SourceIndicator source={DATA_SOURCES.SAP_SD} sapTable="VBAK" />
                          </Box>
                          <Typography sx={{ fontSize: '0.55rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase' }}>
                            Orders YTD
                          </Typography>
                        </Paper>
                      </Grid>
                      {selectedCustomer.churnProbability !== null && (
                        <Grid item xs={12}>
                          <Paper elevation={0} sx={{ p: 1, bgcolor: darkMode ? '#0d1117' : '#f8fafc', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: selectedCustomer.churnProbability < 0.3 ? '#059669' : selectedCustomer.churnProbability < 0.6 ? '#d97706' : '#dc2626'
                              }}>
                                {(selectedCustomer.churnProbability * 100).toFixed(0)}%
                              </Typography>
                              <SourceIndicator source={DATA_SOURCES.ML_INSIGHTS} sapTable="cm_insights_churn" />
                            </Box>
                            <Typography sx={{ fontSize: '0.55rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase' }}>
                              Churn Probability
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </>
              ) : (
                <Box sx={{ p: 1.5, borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`, bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SmartToyIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} />
                      AI Recommendations
                    </Typography>
                    <SourceIndicator source={DATA_SOURCES.MOCK} />
                  </Box>
                </Box>
              )}

              {/* AI Recommendations */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
                {aiRecommendations.map((rec, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      bgcolor: darkMode ? alpha(rec.type === 'warning' ? '#d97706' : PRIMARY_BLUE, 0.1) : alpha(rec.type === 'warning' ? '#f59e0b' : PRIMARY_BLUE, 0.08),
                      border: `1px solid ${alpha(rec.type === 'warning' ? '#d97706' : PRIMARY_BLUE, 0.3)}`,
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: rec.type === 'warning' ? '#d97706' : PRIMARY_BLUE, textTransform: 'uppercase' }}>
                          {rec.type === 'warning' ? '⚠️ Risk Alert' : '💡 Opportunity'}
                        </Typography>
                        <SourceIndicator source={rec.source} />
                      </Box>
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
                  </Paper>
                ))}
              </Box>

              {/* AI Input */}
              <Box sx={{ p: 1.5, borderTop: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}` }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask about customers..."
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
          {['KNA1', 'VBAK', 'VBAP'].map((table) => (
            <Chip key={table} label={table} size="small" sx={{ fontSize: '0.55rem', height: 18, bgcolor: alpha(PRIMARY_BLUE, 0.1) }} />
          ))}
          <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b', ml: 1 }}>
            ML Tables:
          </Typography>
          {['cm_insights_churn', 'cm_insights_clv'].map((table) => (
            <Chip key={table} label={table} size="small" sx={{ fontSize: '0.55rem', height: 18, bgcolor: alpha('#8b5cf6', 0.1) }} />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onNavigate && onNavigate('sales-area-intelligence')}
            sx={{ fontSize: '0.7rem', textTransform: 'none', borderColor: darkMode ? '#21262d' : '#e2e8f0', color: darkMode ? '#8b949e' : '#64748b' }}
          >
            ← Back to Sales Areas
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => onNavigate && onNavigate('document-flow-analysis')}
            sx={{ fontSize: '0.7rem', textTransform: 'none', bgcolor: PRIMARY_BLUE, '&:hover': { bgcolor: '#074080' } }}
          >
            View Document Flow →
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CustomerIntelligence;
