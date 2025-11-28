import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  CircularProgress,
  alpha,
  LinearProgress,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  Flag as FlagIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import margenTheme from './margenTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Filler, Title, ChartTooltip, Legend);

// Arizona COPA - Margin Improvement Initiatives
const generateInitiativeData = () => [
  { id: 'INI-001', initiative: 'Supplier Renegotiation - Aluminum Cans', category: 'COGS Reduction', owner: 'VP Procurement', glAccount: '5100-Materials', targetImpact: 3.2, currentImpact: 1.8, progress: 56, status: 'on-track', timeline: 'Q2 2024', startDate: '2024-01-15', endDate: '2024-06-30', priority: 1 },
  { id: 'INI-002', initiative: 'D2C Channel Expansion', category: 'Channel Mix', owner: 'VP E-Commerce', glAccount: '4100-Revenue', targetImpact: 4.5, currentImpact: 2.1, progress: 47, status: 'on-track', timeline: 'Q3 2024', startDate: '2024-02-01', endDate: '2024-09-30', priority: 2 },
  { id: 'INI-003', initiative: 'Trade Spend Optimization', category: 'Trade Efficiency', owner: 'VP Sales', glAccount: '6100-Trade', targetImpact: 2.8, currentImpact: 0.9, progress: 32, status: 'at-risk', timeline: 'Q2 2024', startDate: '2024-01-01', endDate: '2024-06-30', priority: 3 },
  { id: 'INI-004', initiative: 'Premium SKU Portfolio Expansion', category: 'Revenue Growth', owner: 'VP Marketing', glAccount: '4100-Revenue', targetImpact: 5.2, currentImpact: 3.8, progress: 73, status: 'on-track', timeline: 'Q4 2024', startDate: '2024-03-01', endDate: '2024-12-31', priority: 4 },
  { id: 'INI-005', initiative: 'Warehouse Consolidation - West', category: 'Distribution', owner: 'VP Supply Chain', glAccount: '6200-Freight', targetImpact: 1.8, currentImpact: 0.4, progress: 22, status: 'delayed', timeline: 'Q3 2024', startDate: '2024-04-01', endDate: '2024-09-30', priority: 5 },
  { id: 'INI-006', initiative: 'Price Increase - Energy Drinks', category: 'Pricing', owner: 'VP Finance', glAccount: '4100-Revenue', targetImpact: 2.2, currentImpact: 2.2, progress: 100, status: 'completed', timeline: 'Q1 2024', startDate: '2024-01-01', endDate: '2024-03-31', priority: 6 },
  { id: 'INI-007', initiative: 'Packaging Cost Engineering', category: 'COGS Reduction', owner: 'VP Operations', glAccount: '5200-Packaging', targetImpact: 1.5, currentImpact: 0.6, progress: 40, status: 'on-track', timeline: 'Q2 2024', startDate: '2024-02-15', endDate: '2024-06-30', priority: 7 },
  { id: 'INI-008', initiative: 'DSO Reduction Program', category: 'Working Capital', owner: 'VP Finance', glAccount: '1200-AR', targetImpact: 2.0, currentImpact: 0.8, progress: 40, status: 'at-risk', timeline: 'Q2 2024', startDate: '2024-01-01', endDate: '2024-06-30', priority: 8 },
];

// Arizona COPA - Owner Accountability
const generateOwnerData = () => [
  { id: 'OWN-01', owner: 'VP Procurement', initiatives: 2, targetImpact: 4.7, currentImpact: 2.4, avgProgress: 48, onTrack: 2, atRisk: 0, delayed: 0 },
  { id: 'OWN-02', owner: 'VP E-Commerce', initiatives: 1, targetImpact: 4.5, currentImpact: 2.1, avgProgress: 47, onTrack: 1, atRisk: 0, delayed: 0 },
  { id: 'OWN-03', owner: 'VP Sales', initiatives: 1, targetImpact: 2.8, currentImpact: 0.9, avgProgress: 32, onTrack: 0, atRisk: 1, delayed: 0 },
  { id: 'OWN-04', owner: 'VP Marketing', initiatives: 1, targetImpact: 5.2, currentImpact: 3.8, avgProgress: 73, onTrack: 1, atRisk: 0, delayed: 0 },
  { id: 'OWN-05', owner: 'VP Supply Chain', initiatives: 1, targetImpact: 1.8, currentImpact: 0.4, avgProgress: 22, onTrack: 0, atRisk: 0, delayed: 1 },
  { id: 'OWN-06', owner: 'VP Finance', initiatives: 2, targetImpact: 4.2, currentImpact: 3.0, avgProgress: 70, onTrack: 1, atRisk: 1, delayed: 0 },
  { id: 'OWN-07', owner: 'VP Operations', initiatives: 1, targetImpact: 1.5, currentImpact: 0.6, avgProgress: 40, onTrack: 1, atRisk: 0, delayed: 0 },
];

// Detail generator
const generateInitiativeDetail = (initiative) => ({
  ...initiative,
  milestones: [
    { name: 'Discovery & Analysis', status: 'completed', date: '2024-01-30' },
    { name: 'Vendor Negotiations', status: initiative.progress > 30 ? 'completed' : 'in-progress', date: '2024-03-15' },
    { name: 'Contract Execution', status: initiative.progress > 60 ? 'completed' : initiative.progress > 30 ? 'in-progress' : 'pending', date: '2024-04-30' },
    { name: 'Implementation', status: initiative.progress > 80 ? 'in-progress' : 'pending', date: '2024-05-31' },
    { name: 'Full Realization', status: initiative.progress === 100 ? 'completed' : 'pending', date: '2024-06-30' },
  ],
  impactByMonth: [
    { month: 'Jan', target: initiative.targetImpact * 0.1, actual: initiative.currentImpact * 0.15 },
    { month: 'Feb', target: initiative.targetImpact * 0.25, actual: initiative.currentImpact * 0.35 },
    { month: 'Mar', target: initiative.targetImpact * 0.45, actual: initiative.currentImpact * 0.55 },
    { month: 'Apr', target: initiative.targetImpact * 0.70, actual: initiative.currentImpact * 0.80 },
    { month: 'May', target: initiative.targetImpact * 0.85, actual: initiative.currentImpact * 0.90 },
    { month: 'Jun', target: initiative.targetImpact, actual: initiative.currentImpact },
  ],
  risks: initiative.status === 'on-track' ? [
    'Supplier capacity constraints during peak season',
    'Currency fluctuation impact on imported materials',
  ] : initiative.status === 'at-risk' ? [
    'Key stakeholder availability limited',
    'Budget constraints affecting execution speed',
    'Competing priorities from other initiatives',
  ] : [
    'Resource reallocation needed',
    'Timeline extension required',
    'Scope adjustment under review',
  ],
});

export default function ActionAccountabilityTab() {
  const [loading, setLoading] = useState(true);
  const [initiativeData, setInitiativeData] = useState([]);
  const [ownerData, setOwnerData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setInitiativeData(generateInitiativeData());
      setOwnerData(generateOwnerData());
      setLoading(false);
    }, 500);
  }, []);

  // Summary KPIs
  const kpis = initiativeData.length ? {
    totalTarget: initiativeData.reduce((sum, i) => sum + i.targetImpact, 0),
    totalRealized: initiativeData.reduce((sum, i) => sum + i.currentImpact, 0),
    avgProgress: Math.round(initiativeData.reduce((sum, i) => sum + i.progress, 0) / initiativeData.length),
    onTrack: initiativeData.filter(i => i.status === 'on-track').length,
    atRisk: initiativeData.filter(i => i.status === 'at-risk').length,
    delayed: initiativeData.filter(i => i.status === 'delayed').length,
    completed: initiativeData.filter(i => i.status === 'completed').length,
  } : null;

  // Initiative columns
  const initiativeColumns = [
    { field: 'priority', headerName: '#', width: 50, type: 'number' },
    { field: 'initiative', headerName: 'Initiative', minWidth: 250, flex: 1.5 },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value.includes('COGS') ? alpha('#ef4444', 0.12) : params.value.includes('Revenue') ? alpha('#10b981', 0.12) : alpha('#3b82f6', 0.12),
            color: params.value.includes('COGS') ? '#dc2626' : params.value.includes('Revenue') ? '#059669' : '#2563eb',
          }}
        />
      ),
    },
    { field: 'owner', headerName: 'Owner', width: 130 },
    { field: 'glAccount', headerName: 'GL Account', width: 120 },
    {
      field: 'targetImpact',
      headerName: 'Target ($M)',
      width: 110,
      type: 'number',
      renderCell: (params) => <Typography sx={{ fontWeight: 600 }}>${params.value.toFixed(1)}</Typography>,
    },
    {
      field: 'currentImpact',
      headerName: 'Realized ($M)',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`$${params.value.toFixed(1)}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#10b981', 0.12),
            color: '#059669',
          }}
        />
      ),
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 130,
      renderCell: (params) => (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              bgcolor: alpha('#64748b', 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: params.value >= 70 ? '#10b981' : params.value >= 40 ? '#f59e0b' : '#ef4444',
                borderRadius: 4,
              },
            }}
          />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, minWidth: 35 }}>{params.value}%</Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => {
        const statusConfig = {
          'on-track': { label: 'On Track', color: '#059669', bg: alpha('#10b981', 0.12) },
          'at-risk': { label: 'At Risk', color: '#d97706', bg: alpha('#f59e0b', 0.12) },
          'delayed': { label: 'Delayed', color: '#dc2626', bg: alpha('#ef4444', 0.12) },
          'completed': { label: 'Completed', color: '#2563eb', bg: alpha('#3b82f6', 0.12) },
        };
        const config = statusConfig[params.value];
        return (
          <Chip
            label={config.label}
            size="small"
            sx={{ fontWeight: 600, bgcolor: config.bg, color: config.color }}
          />
        );
      },
    },
    { field: 'timeline', headerName: 'Timeline', width: 100 },
  ];

  // Owner columns
  const ownerColumns = [
    { field: 'owner', headerName: 'Owner', minWidth: 150, flex: 1 },
    { field: 'initiatives', headerName: '# Initiatives', width: 100, type: 'number' },
    {
      field: 'targetImpact',
      headerName: 'Target ($M)',
      width: 110,
      type: 'number',
      renderCell: (params) => <Typography sx={{ fontWeight: 600 }}>${params.value.toFixed(1)}</Typography>,
    },
    {
      field: 'currentImpact',
      headerName: 'Realized ($M)',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Chip label={`$${params.value.toFixed(1)}`} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#10b981', 0.12), color: '#059669' }} />
      ),
    },
    {
      field: 'avgProgress',
      headerName: 'Avg Progress',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value >= 50 ? alpha('#10b981', 0.12) : params.value >= 30 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 50 ? '#059669' : params.value >= 30 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'onTrack',
      headerName: 'On Track',
      width: 90,
      type: 'number',
      renderCell: (params) => params.value > 0 ? <Chip label={params.value} size="small" sx={{ bgcolor: alpha('#10b981', 0.12), color: '#059669', fontWeight: 600 }} /> : '-',
    },
    {
      field: 'atRisk',
      headerName: 'At Risk',
      width: 80,
      type: 'number',
      renderCell: (params) => params.value > 0 ? <Chip label={params.value} size="small" sx={{ bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', fontWeight: 600 }} /> : '-',
    },
    {
      field: 'delayed',
      headerName: 'Delayed',
      width: 80,
      type: 'number',
      renderCell: (params) => params.value > 0 ? <Chip label={params.value} size="small" sx={{ bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', fontWeight: 600 }} /> : '-',
    },
  ];

  const handleRowClick = (params) => {
    setSelectedRow(generateInitiativeDetail(params.row));
  };

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedRow) return null;

    const statusColor = selectedRow.status === 'on-track' ? '#10b981' : selectedRow.status === 'at-risk' ? '#f59e0b' : selectedRow.status === 'completed' ? '#3b82f6' : '#ef4444';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedRow(null)} variant="outlined" size="small">
            Back to List
          </Button>
          <Stack direction="row" spacing={1}>
            <Chip label={`#${selectedRow.priority}`} size="small" sx={{ bgcolor: alpha('#64748b', 0.1) }} />
            <Chip label={selectedRow.category} size="small" color="info" />
            <Chip
              label={selectedRow.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              size="small"
              sx={{ bgcolor: alpha(statusColor, 0.12), color: statusColor, fontWeight: 600 }}
            />
          </Stack>
        </Stack>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedRow.initiative}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>Owner: {selectedRow.owner} | GL: {selectedRow.glAccount}</Typography>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Target Impact', value: `$${selectedRow.targetImpact.toFixed(1)}M`, color: '#3b82f6', icon: <FlagIcon /> },
            { label: 'Realized', value: `$${selectedRow.currentImpact.toFixed(1)}M`, color: '#10b981', icon: <MoneyIcon /> },
            { label: 'Progress', value: `${selectedRow.progress}%`, color: statusColor, icon: <PlayArrowIcon /> },
            { label: 'Timeline', value: selectedRow.timeline, color: '#8b5cf6', icon: <ScheduleIcon /> },
          ].map((metric, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Card sx={{ background: `linear-gradient(135deg, ${alpha(metric.color, 0.1)} 0%, ${alpha(metric.color, 0.05)} 100%)` }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{metric.label}</Typography>
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: metric.color }}>{metric.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 3-Column Detail */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Impact Realization
                </Typography>
                <Box sx={{ height: 200 }}>
                  <Bar
                    data={{
                      labels: selectedRow.impactByMonth.map(m => m.month),
                      datasets: [
                        { label: 'Target', data: selectedRow.impactByMonth.map(m => m.target), backgroundColor: alpha('#64748b', 0.3), borderRadius: 4 },
                        { label: 'Actual', data: selectedRow.impactByMonth.map(m => m.actual), backgroundColor: alpha('#10b981', 0.7), borderRadius: 4 },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Milestones
                </Typography>
                <Stack spacing={1.5}>
                  {selectedRow.milestones.map((milestone, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {milestone.status === 'completed' ? (
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
                      ) : milestone.status === 'in-progress' ? (
                        <PlayArrowIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
                      ) : (
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid', borderColor: '#cbd5e1' }} />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: milestone.status !== 'pending' ? 600 : 400 }}>{milestone.name}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{milestone.date}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1, border: '2px solid', borderColor: alpha(statusColor, 0.3) }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Risks & Mitigations
                </Typography>
                <Stack spacing={1.5}>
                  {selectedRow.risks.map((risk, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.5, bgcolor: alpha('#f59e0b', 0.05), borderRadius: 1, border: '1px solid', borderColor: alpha('#f59e0b', 0.15) }}>
                      <WarningIcon sx={{ fontSize: 18, color: '#f59e0b', mt: 0.2 }} />
                      <Typography sx={{ fontSize: '0.8rem' }}>{risk}</Typography>
                    </Box>
                  ))}
                </Stack>
                <Button fullWidth variant="contained" sx={{ mt: 2, bgcolor: statusColor }}>
                  Update Status
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {selectedRow ? (
        renderDetailView()
      ) : (
        <>
          {/* KPI Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Target Impact</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2563eb' }}>${kpis?.totalTarget.toFixed(1)}M</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Realized</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>${kpis?.totalRealized.toFixed(1)}M</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Avg Progress</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#7c3aed' }}>{kpis?.avgProgress}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>On Track</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>{kpis?.onTrack}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>At Risk</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ea580c' }}>{kpis?.atRisk}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Delayed</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626' }}>{kpis?.delayed}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Initiative DataGrid */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Margin Improvement Initiatives</Typography>
          <Box sx={{ height: 320, mb: 3 }}>
            <DataGrid
              rows={initiativeData}
              columns={initiativeColumns}
              density="compact"
              checkboxSelection
              disableRowSelectionOnClick
              onRowClick={handleRowClick}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true } }}
              sx={margenTheme.getDataGridSx({ clickable: true })}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[10, 25]}
            />
          </Box>

          {/* Owner Accountability DataGrid */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Owner Accountability</Typography>
          <Box sx={{ height: 280 }}>
            <DataGrid
              rows={ownerData}
              columns={ownerColumns}
              density="compact"
              disableRowSelectionOnClick
              sx={margenTheme.getDataGridSx()}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[10, 25]}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
