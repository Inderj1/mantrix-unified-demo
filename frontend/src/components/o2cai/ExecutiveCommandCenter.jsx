import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  alpha,
  Collapse,
  TextField,
  InputAdornment,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  SmartToy as SmartToyIcon,
  Send as SendIcon,
  Factory as FactoryIcon,
  Storage as StorageIcon,
  VerifiedUser as VerifiedUserIcon,
  Calculate as CalculateIcon,
  Science as ScienceIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import o2cTheme from './o2cTheme';

// Primary blue color
const PRIMARY_BLUE = '#0854a0';
const ACCENT_BLUE = '#1976d2';

// Data source types
const DATA_SOURCES = {
  SAP_SD: 'sap_sd',
  SAP_MASTER: 'sap_master',
  SAP_FI: 'sap_fi',
  ML_INSIGHTS: 'ml_insights',
  CALCULATED: 'calculated',
  MOCK: 'mock'
};

// Source indicator component
const SourceIndicator = ({ source, sapTable, size = 'small' }) => {
  const config = {
    [DATA_SOURCES.SAP_SD]: {
      icon: <StorageIcon sx={{ fontSize: size === 'small' ? 10 : 12 }} />,
      color: '#0854a0',
      label: `SAP SD${sapTable ? ` (${sapTable})` : ''}`
    },
    [DATA_SOURCES.SAP_MASTER]: {
      icon: <VerifiedUserIcon sx={{ fontSize: size === 'small' ? 10 : 12 }} />,
      color: '#059669',
      label: `SAP Master${sapTable ? ` (${sapTable})` : ''}`
    },
    [DATA_SOURCES.SAP_FI]: {
      icon: <StorageIcon sx={{ fontSize: size === 'small' ? 10 : 12 }} />,
      color: '#d97706',
      label: `SAP FI${sapTable ? ` (${sapTable})` : ''}`
    },
    [DATA_SOURCES.ML_INSIGHTS]: {
      icon: <PsychologyIcon sx={{ fontSize: size === 'small' ? 10 : 12 }} />,
      color: '#8b5cf6',
      label: 'ML Calculated'
    },
    [DATA_SOURCES.CALCULATED]: {
      icon: <CalculateIcon sx={{ fontSize: size === 'small' ? 10 : 12 }} />,
      color: '#6366f1',
      label: 'Derived Value'
    },
    [DATA_SOURCES.MOCK]: {
      icon: <ScienceIcon sx={{ fontSize: size === 'small' ? 10 : 12 }} />,
      color: '#f59e0b',
      label: 'Demo/Mock Data'
    }
  };

  const c = config[source] || config[DATA_SOURCES.MOCK];

  return (
    <Tooltip title={c.label} arrow placement="top">
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size === 'small' ? 14 : 18,
          height: size === 'small' ? 14 : 18,
          borderRadius: '50%',
          bgcolor: alpha(c.color, 0.15),
          color: c.color,
          ml: 0.5,
        }}
      >
        {c.icon}
      </Box>
    </Tooltip>
  );
};

// Mock data for organization structure (no sales org data in DB)
const orgData = [
  {
    id: 'us',
    name: 'US Sales Organization',
    code: 'VKORG: 1000',
    revenue: '$89.4M',
    dso: 38.2,
    dsoStatus: 'good',
    source: DATA_SOURCES.MOCK,
    children: [
      { name: 'Direct Sales (10)', value: '$52.1M' },
      { name: 'Distribution (20)', value: '$28.7M' },
      { name: 'OEM Channel (30)', value: '$8.6M' },
    ],
  },
  {
    id: 'emea',
    name: 'EMEA Sales Organization',
    code: 'VKORG: 2000',
    revenue: '$38.1M',
    dso: 48.7,
    dsoStatus: 'warning',
    source: DATA_SOURCES.MOCK,
    children: [
      { name: 'Direct Sales (10)', value: '$24.2M' },
      { name: 'Distribution (20)', value: '$13.9M' },
    ],
  },
  {
    id: 'apac',
    name: 'APAC Sales Organization',
    code: 'VKORG: 3000',
    revenue: '$19.7M',
    dso: 56.4,
    dsoStatus: 'critical',
    source: DATA_SOURCES.MOCK,
    children: [
      { name: 'Direct Sales (10)', value: '$12.4M' },
      { name: 'Distribution (20)', value: '$7.3M' },
    ],
  },
];

// Process Bottlenecks Data (mock - no timing data in DB)
const bottleneckRows = [
  { id: 1, stage: 'Order Entry → Release', avgTime: '0.8 days', target: '1.0 days', status: 'healthy', timeColor: '#059669', source: DATA_SOURCES.MOCK },
  { id: 2, stage: 'Release → Delivery', avgTime: '1.9 days', target: '1.5 days', status: 'warning', timeColor: '#d97706', source: DATA_SOURCES.MOCK },
  { id: 3, stage: 'Delivery → Billing', avgTime: '0.4 days', target: '0.5 days', status: 'healthy', timeColor: '#059669', source: DATA_SOURCES.MOCK },
  { id: 4, stage: 'Billing → Payment', avgTime: '39.2 days', target: '30.0 days', status: 'critical', timeColor: '#dc2626', source: DATA_SOURCES.MOCK },
];

// Top Plants Data (mock - no plant performance data)
const plantRows = [
  { id: 1, plant: 'Chicago (1000)', orders: 4821, otif: 97.2, cycle: '3.8d', otifColor: '#059669', source: DATA_SOURCES.MOCK },
  { id: 2, plant: 'Dallas (1100)', orders: 3429, otif: 95.8, cycle: '4.1d', otifColor: '#059669', source: DATA_SOURCES.MOCK },
  { id: 3, plant: 'Frankfurt (2000)', orders: 2891, otif: 91.4, cycle: '4.9d', otifColor: '#d97706', source: DATA_SOURCES.MOCK },
  { id: 4, plant: 'Shanghai (3000)', orders: 2104, otif: 87.2, cycle: '5.6d', otifColor: '#dc2626', source: DATA_SOURCES.MOCK },
];

// AI Insights (mock)
const aiInsights = [
  {
    type: 'critical',
    title: 'Payment collection delays in APAC',
    description: '847 invoices totaling $4.2M are past 45 days. Recommend automated dunning sequence activation for customers in KNKK credit class B3.',
    impact: '+$890K impact',
    source: DATA_SOURCES.MOCK,
  },
  {
    type: 'optimization',
    title: 'Delivery bottleneck detected',
    description: 'Frankfurt plant showing 27% longer pick-pack time than benchmark. Root cause: Manual batch determination in LIKP. Recommend auto-batch rules.',
    impact: '-0.4 days cycle',
    source: DATA_SOURCES.MOCK,
  },
  {
    type: 'positive',
    title: 'US Direct channel outperforming',
    description: 'Order volume up 18% with DSO improving by 4.2 days. Credit policy changes from Q3 showing results.',
    impact: '+$1.2M revenue',
    source: DATA_SOURCES.MOCK,
  },
];

const ExecutiveCommandCenter = ({ onBack, onNavigate, darkMode = false }) => {
  const [expandedOrgs, setExpandedOrgs] = useState({});
  const [aiQuestion, setAiQuestion] = useState('');
  const [kpiData, setKpiData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real KPI data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch KPIs
        const kpiResponse = await fetch('/api/o2cai/executive/kpis');
        if (kpiResponse.ok) {
          const kpiResult = await kpiResponse.json();
          setKpiData(kpiResult.kpis || []);
        }

        // Fetch top customers
        const custResponse = await fetch('/api/o2cai/executive/top-customers?limit=5');
        if (custResponse.ok) {
          const custResult = await custResponse.json();
          setTopCustomers(custResult.data || []);
        }

      } catch (error) {
        console.error('Error fetching O2C data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleOrg = (orgId) => {
    setExpandedOrgs(prev => ({ ...prev, [orgId]: !prev[orgId] }));
  };

  const getStatusChip = (status) => {
    const config = {
      healthy: { label: 'ON TARGET', bgcolor: alpha('#10b981', 0.12), color: '#059669' },
      warning: { label: 'DELAYED', bgcolor: alpha('#f59e0b', 0.12), color: '#d97706' },
      critical: { label: 'CRITICAL', bgcolor: alpha('#ef4444', 0.12), color: '#dc2626' },
    };
    const c = config[status] || config.healthy;
    return (
      <Chip
        label={c.label}
        size="small"
        sx={{
          bgcolor: c.bgcolor,
          color: c.color,
          fontWeight: 600,
          fontSize: '0.65rem',
          height: 20,
        }}
      />
    );
  };

  const bottleneckColumns = [
    { field: 'stage', headerName: 'STAGE', flex: 1.5, minWidth: 150 },
    {
      field: 'avgTime',
      headerName: 'AVG TIME',
      flex: 0.8,
      minWidth: 80,
      renderCell: (params) => (
        <Typography sx={{ color: params.row.timeColor, fontWeight: 600, fontSize: '0.75rem' }}>
          {params.value}
        </Typography>
      ),
    },
    { field: 'target', headerName: 'TARGET', flex: 0.8, minWidth: 80 },
    {
      field: 'status',
      headerName: 'STATUS',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: 'source',
      headerName: '',
      width: 30,
      renderCell: (params) => <SourceIndicator source={params.value} />,
    },
  ];

  const plantColumns = [
    { field: 'plant', headerName: 'PLANT', flex: 1.2, minWidth: 120 },
    {
      field: 'orders',
      headerName: 'ORDERS',
      flex: 0.7,
      minWidth: 70,
      renderCell: (params) => params.value.toLocaleString(),
    },
    {
      field: 'otif',
      headerName: 'OTIF %',
      flex: 0.7,
      minWidth: 70,
      renderCell: (params) => (
        <Typography sx={{ color: params.row.otifColor, fontWeight: 600, fontSize: '0.75rem' }}>
          {params.value}%
        </Typography>
      ),
    },
    { field: 'cycle', headerName: 'CYCLE', flex: 0.6, minWidth: 60 },
    {
      field: 'source',
      headerName: '',
      width: 30,
      renderCell: (params) => <SourceIndicator source={params.value} />,
    },
  ];

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
                Executive Command Center
              </Typography>
              <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Organization Overview • KPIs • Process Health
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Data Source Legend" arrow>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mr: 1 }}>
                <SourceIndicator source={DATA_SOURCES.SAP_SD} size="medium" />
                <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>Real</Typography>
                <SourceIndicator source={DATA_SOURCES.MOCK} size="medium" />
                <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>Mock</Typography>
              </Box>
            </Tooltip>
            <Chip
              label="Step 1 of 5"
              size="small"
              sx={{
                bgcolor: alpha(PRIMARY_BLUE, 0.12),
                color: PRIMARY_BLUE,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* KPI Strip - Real Data */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: darkMode ? '#0d1117' : '#f8fafc', borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}` }}>
        <Grid container spacing={1.5}>
          {loading ? (
            // Skeleton loaders
            [...Array(6)].map((_, index) => (
              <Grid item xs={2} key={index}>
                <Skeleton variant="rounded" height={80} sx={{ bgcolor: darkMode ? '#21262d' : undefined }} />
              </Grid>
            ))
          ) : (
            kpiData.map((kpi, index) => (
              <Grid item xs={2} key={index}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: kpi.color }}>
                      {kpi.value}
                    </Typography>
                    <SourceIndicator source={kpi.source} sapTable={kpi.sapTable} />
                  </Box>
                  <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase', mt: 0.5 }}>
                    {kpi.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                    {kpi.trend === 'up' ? (
                      <TrendingUpIcon sx={{ fontSize: 12, color: '#059669' }} />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: 12, color: '#dc2626' }} />
                    )}
                    <Typography sx={{ fontSize: '0.6rem', color: kpi.trend === 'up' ? '#059669' : '#dc2626' }}>
                      {kpi.trendValue}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Left Panel - Organization Structure */}
          <Grid item xs={12} md={4}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} />
                    Organization Structure
                  </Typography>
                  <SourceIndicator source={DATA_SOURCES.MOCK} />
                </Box>
                <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#64748b', mt: 0.5 }}>
                  Sales Org → Distribution Channel → Division
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, maxHeight: 400, overflow: 'auto' }}>
                {orgData.map((org) => (
                  <Box key={org.id} sx={{ mb: 1 }}>
                    <Paper
                      elevation={0}
                      onClick={() => toggleOrg(org.id)}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        bgcolor: darkMode ? '#0d1117' : '#f8fafc',
                        border: `1px solid ${expandedOrgs[org.id] ? PRIMARY_BLUE : darkMode ? '#21262d' : '#e2e8f0'}`,
                        borderLeft: `3px solid ${expandedOrgs[org.id] ? PRIMARY_BLUE : 'transparent'}`,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: darkMode ? alpha(PRIMARY_BLUE, 0.1) : alpha(PRIMARY_BLUE, 0.05),
                          borderLeftColor: PRIMARY_BLUE,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {expandedOrgs[org.id] ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                          <Box>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                              {org.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>
                              {org.code}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: PRIMARY_BLUE }}>
                            {org.revenue}
                          </Typography>
                          <Typography sx={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            color: org.dsoStatus === 'good' ? '#059669' : org.dsoStatus === 'warning' ? '#d97706' : '#dc2626',
                          }}>
                            DSO: {org.dso}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                    <Collapse in={expandedOrgs[org.id]}>
                      <Box sx={{ pl: 3, pt: 1 }}>
                        {org.children.map((child, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              p: 1,
                              mb: 0.5,
                              bgcolor: darkMode ? '#0d1117' : '#f1f5f9',
                              borderRadius: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Typography sx={{ fontSize: '0.7rem', color: darkMode ? '#8b949e' : '#64748b' }}>
                              {child.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#059669' }}>
                              {child.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Collapse>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Middle Panel - Process Health */}
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} />
                    O2C Process Health
                  </Typography>
                  <SourceIndicator source={DATA_SOURCES.MOCK} />
                </Box>
                <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#64748b', mt: 0.5 }}>
                  Cycle time, conformance & bottleneck analysis
                </Typography>
              </Box>

              {/* Process Bottlenecks Table */}
              <Box sx={{ p: 1.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon sx={{ fontSize: 14, color: '#dc2626' }} />
                  Process Bottlenecks
                </Typography>
                <DataGrid
                  rows={bottleneckRows}
                  columns={bottleneckColumns}
                  density="compact"
                  hideFooter
                  disableColumnMenu
                  disableRowSelectionOnClick
                  sx={{
                    ...o2cTheme.getDataGridSx({ darkMode }),
                    height: 180,
                    '& .MuiDataGrid-cell': { fontSize: '0.7rem' },
                    '& .MuiDataGrid-columnHeaderTitle': { fontSize: '0.65rem' },
                  }}
                />
              </Box>

              {/* Top Plants Table */}
              <Box sx={{ p: 1.5, flex: 1 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FactoryIcon sx={{ fontSize: 14, color: '#059669' }} />
                  Top Performing Plants
                </Typography>
                <DataGrid
                  rows={plantRows}
                  columns={plantColumns}
                  density="compact"
                  hideFooter
                  disableColumnMenu
                  disableRowSelectionOnClick
                  sx={{
                    ...o2cTheme.getDataGridSx({ darkMode }),
                    height: 180,
                    '& .MuiDataGrid-cell': { fontSize: '0.7rem' },
                    '& .MuiDataGrid-columnHeaderTitle': { fontSize: '0.65rem' },
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Right Panel - AI Insights & Top Customers */}
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
                  O2C.AI Insights & Top Customers
                </Typography>
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
                {/* Top Customers - Real Data */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    bgcolor: darkMode ? alpha(PRIMARY_BLUE, 0.1) : alpha(PRIMARY_BLUE, 0.05),
                    border: `1px solid ${alpha(PRIMARY_BLUE, 0.2)}`,
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: PRIMARY_BLUE, textTransform: 'uppercase' }}>
                      Top 5 Customers (Revenue)
                    </Typography>
                    <SourceIndicator source={DATA_SOURCES.SAP_SD} sapTable="VBAK/VBAP" />
                  </Box>
                  {loading ? (
                    <Skeleton variant="rectangular" height={100} />
                  ) : (
                    <Stack spacing={0.5}>
                      {topCustomers.map((cust, idx) => (
                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: idx < topCustomers.length - 1 ? `1px solid ${alpha(PRIMARY_BLUE, 0.1)}` : 'none' }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {cust.customerName}
                            </Typography>
                            <Typography sx={{ fontSize: '0.55rem', color: darkMode ? '#8b949e' : '#64748b' }}>
                              {cust.orders.toLocaleString()} orders
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                            ${cust.revenue.toFixed(1)}M
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Paper>

                {/* AI Insight Cards - Mock */}
                {aiInsights.map((insight, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      bgcolor: darkMode
                        ? alpha(insight.type === 'critical' ? '#d97706' : insight.type === 'positive' ? '#059669' : PRIMARY_BLUE, 0.1)
                        : alpha(insight.type === 'critical' ? '#f59e0b' : insight.type === 'positive' ? '#10b981' : PRIMARY_BLUE, 0.08),
                      border: `1px solid ${alpha(insight.type === 'critical' ? '#d97706' : insight.type === 'positive' ? '#059669' : PRIMARY_BLUE, 0.3)}`,
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        color: insight.type === 'critical' ? '#d97706' : insight.type === 'positive' ? '#059669' : PRIMARY_BLUE,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}>
                        {insight.type === 'critical' ? '⚠️' : insight.type === 'positive' ? '✓' : '💡'}
                        {insight.type === 'critical' ? 'Critical Finding' : insight.type === 'positive' ? 'Positive Trend' : 'Optimization'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: '#059669' }}>
                          {insight.impact}
                        </Typography>
                        <SourceIndicator source={insight.source} />
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', mb: 0.5 }}>
                      {insight.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#64748b', lineHeight: 1.5 }}>
                      {insight.description}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              {/* AI Input */}
              <Box sx={{ p: 1.5, borderTop: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}` }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask about O2C performance..."
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: darkMode ? '#0d1117' : '#f8fafc',
                    },
                  }}
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
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>
            Data Sources:
          </Typography>
          <Chip
            icon={<StorageIcon sx={{ fontSize: '0.7rem !important' }} />}
            label="VBAK/VBAP (Real)"
            size="small"
            sx={{ fontSize: '0.55rem', height: 18, bgcolor: alpha('#0854a0', 0.1), color: '#0854a0' }}
          />
          <Chip
            icon={<VerifiedUserIcon sx={{ fontSize: '0.7rem !important' }} />}
            label="KNA1 (Real)"
            size="small"
            sx={{ fontSize: '0.55rem', height: 18, bgcolor: alpha('#059669', 0.1), color: '#059669' }}
          />
          <Chip
            icon={<ScienceIcon sx={{ fontSize: '0.7rem !important' }} />}
            label="Org/Process (Mock)"
            size="small"
            sx={{ fontSize: '0.55rem', height: 18, bgcolor: alpha('#f59e0b', 0.1), color: '#d97706' }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            sx={{
              fontSize: '0.7rem',
              textTransform: 'none',
              borderColor: darkMode ? '#21262d' : '#e2e8f0',
              color: darkMode ? '#8b949e' : '#64748b',
            }}
          >
            Export Report
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => onNavigate && onNavigate('sales-area-intelligence')}
            sx={{
              fontSize: '0.7rem',
              textTransform: 'none',
              bgcolor: PRIMARY_BLUE,
              '&:hover': { bgcolor: '#074080' },
            }}
          >
            Drill into Sales Areas →
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ExecutiveCommandCenter;
