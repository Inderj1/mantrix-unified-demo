import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Breadcrumbs,
  Link,
  Stack,
  IconButton,
  Tooltip,
  alpha,
  Divider,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import traxxTheme from './traxxTheme';

// Format currency
const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};

// Generate mock case data
const generateCaseData = () => {
  const cases = [
    {
      id: 'CASE-2024-0847',
      kitId: 'NXS-TLIF-001',
      surgeryDate: '2024-12-16T11:30:00Z',
      hospital: 'Mass General Hospital',
      hospitalShort: 'Mass General',
      distributor: 'Northeast Spine Solutions',
      distributorShort: 'Northeast Spine',
      procedureType: 'TLIF',
      revenue: 12450,
      implantCOGS: 4280,
      transportCost: 87.50,
      handlingCost: 235,
      totalDirectCost: 4602.50,
      grossMargin: 7847.50,
      grossMarginPercent: 63.0,
      commission: 1245,
      allocatedOps: 755.50,
      ebitdaContribution: 5847,
      ebitdaPercent: 47.0,
      daysToInvoice: 1,
      daysToCash: 32,
      cashCollected: 0,
      outstandingAR: 12450,
      invoiceDate: '2024-12-17T15:00:00Z',
      paymentDueDate: '2025-01-16T00:00:00Z',
      paymentDate: null,
      hospitalTier: 'Tier 1',
      avgMarginForType: 58.2,
    },
    {
      id: 'CASE-2024-0851',
      kitId: 'NXS-DEF-002',
      surgeryDate: '2024-12-15T06:30:00Z',
      hospital: 'Johns Hopkins Hospital',
      hospitalShort: 'Johns Hopkins',
      distributor: 'Atlantic Spine Solutions',
      distributorShort: 'Atlantic Spine',
      procedureType: 'Deformity',
      revenue: 28500,
      implantCOGS: 9800,
      transportCost: 112,
      handlingCost: 450,
      totalDirectCost: 10362,
      grossMargin: 18138,
      grossMarginPercent: 63.6,
      commission: 2850,
      allocatedOps: 1425,
      ebitdaContribution: 13863,
      ebitdaPercent: 48.6,
      daysToInvoice: 2,
      daysToCash: 28,
      cashCollected: 28500,
      outstandingAR: 0,
      invoiceDate: '2024-12-17T10:00:00Z',
      paymentDueDate: '2025-01-16T00:00:00Z',
      paymentDate: '2024-12-13T00:00:00Z',
      hospitalTier: 'Tier 1',
      avgMarginForType: 61.5,
    },
    {
      id: 'CASE-2024-0839',
      kitId: 'NXS-TLIF-012',
      surgeryDate: '2024-12-12T08:00:00Z',
      hospital: 'Methodist Le Bonheur',
      hospitalShort: 'Methodist LB',
      distributor: 'Southern Spine Distributors',
      distributorShort: 'Southern Spine',
      procedureType: 'TLIF',
      revenue: 8950,
      implantCOGS: 3100,
      transportCost: 98.25,
      handlingCost: 180,
      totalDirectCost: 3378.25,
      grossMargin: 5571.75,
      grossMarginPercent: 62.3,
      commission: 895,
      allocatedOps: 537,
      ebitdaContribution: 4139.75,
      ebitdaPercent: 46.3,
      daysToInvoice: 1,
      daysToCash: 35,
      cashCollected: 8950,
      outstandingAR: 0,
      invoiceDate: '2024-12-13T14:00:00Z',
      paymentDueDate: '2025-01-12T00:00:00Z',
      paymentDate: '2024-12-15T00:00:00Z',
      hospitalTier: 'Tier 2',
      avgMarginForType: 58.2,
    },
    {
      id: 'CASE-2024-0798',
      kitId: 'NXS-PLIF-009',
      surgeryDate: '2024-11-29T10:00:00Z',
      hospital: 'Stanford Medical Center',
      hospitalShort: 'Stanford',
      distributor: 'Pacific Surgical Partners',
      distributorShort: 'Pacific Surgical',
      procedureType: 'PLIF',
      revenue: 11200,
      implantCOGS: 3890,
      transportCost: 145.50,
      handlingCost: 225,
      totalDirectCost: 4260.50,
      grossMargin: 6939.50,
      grossMarginPercent: 62.0,
      commission: 1120,
      allocatedOps: 672,
      ebitdaContribution: 5147.50,
      ebitdaPercent: 46.0,
      daysToInvoice: 3,
      daysToCash: 45,
      cashCollected: 11200,
      outstandingAR: 0,
      invoiceDate: '2024-12-02T11:00:00Z',
      paymentDueDate: '2025-01-01T00:00:00Z',
      paymentDate: '2024-12-13T00:00:00Z',
      hospitalTier: 'Tier 1',
      avgMarginForType: 59.8,
    },
    {
      id: 'CASE-2024-0862',
      kitId: 'NXS-CERVICAL-001',
      surgeryDate: '2024-12-15T07:00:00Z',
      hospital: 'Mayo Clinic Rochester',
      hospitalShort: 'Mayo Clinic',
      distributor: 'Midwest Ortho Partners',
      distributorShort: 'Midwest Ortho',
      procedureType: 'Cervical',
      revenue: 7200,
      implantCOGS: 2480,
      transportCost: 178.50,
      handlingCost: 145,
      totalDirectCost: 2803.50,
      grossMargin: 4396.50,
      grossMarginPercent: 61.1,
      commission: 720,
      allocatedOps: 432,
      ebitdaContribution: 3244.50,
      ebitdaPercent: 45.1,
      daysToInvoice: 2,
      daysToCash: 30,
      cashCollected: 0,
      outstandingAR: 7200,
      invoiceDate: '2024-12-17T09:00:00Z',
      paymentDueDate: '2025-01-16T00:00:00Z',
      paymentDate: null,
      hospitalTier: 'Tier 1',
      avgMarginForType: 57.5,
    },
    {
      id: 'CASE-2024-0829',
      kitId: 'NXS-PLIF-003',
      surgeryDate: '2024-12-10T09:00:00Z',
      hospital: 'Cleveland Clinic',
      hospitalShort: 'Cleveland',
      distributor: 'Midwest Ortho Partners',
      distributorShort: 'Midwest Ortho',
      procedureType: 'PLIF',
      revenue: 9800,
      implantCOGS: 3420,
      transportCost: 124.75,
      handlingCost: 195,
      totalDirectCost: 3739.75,
      grossMargin: 6060.25,
      grossMarginPercent: 61.8,
      commission: 980,
      allocatedOps: 588,
      ebitdaContribution: 4492.25,
      ebitdaPercent: 45.8,
      daysToInvoice: 2,
      daysToCash: 38,
      cashCollected: 9800,
      outstandingAR: 0,
      invoiceDate: '2024-12-12T15:00:00Z',
      paymentDueDate: '2025-01-11T00:00:00Z',
      paymentDate: '2024-12-14T00:00:00Z',
      hospitalTier: 'Tier 2',
      avgMarginForType: 59.8,
    },
    {
      id: 'CASE-2024-0815',
      kitId: 'NXS-DEF-007',
      surgeryDate: '2024-12-05T07:30:00Z',
      hospital: 'Phoenix General',
      hospitalShort: 'Phoenix Gen',
      distributor: 'Southwest Surgical Supply',
      distributorShort: 'Southwest Surg',
      procedureType: 'Deformity',
      revenue: 11000,
      implantCOGS: 4120,
      transportCost: 156,
      handlingCost: 275,
      totalDirectCost: 4551,
      grossMargin: 6449,
      grossMarginPercent: 58.6,
      commission: 1100,
      allocatedOps: 660,
      ebitdaContribution: 4689,
      ebitdaPercent: 42.6,
      daysToInvoice: 4,
      daysToCash: 42,
      cashCollected: 11000,
      outstandingAR: 0,
      invoiceDate: '2024-12-09T10:00:00Z',
      paymentDueDate: '2025-01-08T00:00:00Z',
      paymentDate: '2024-12-15T00:00:00Z',
      hospitalTier: 'Tier 2',
      avgMarginForType: 61.5,
    },
    {
      id: 'CASE-2024-0855',
      kitId: 'NXS-TLIF-008',
      surgeryDate: '2024-12-10T14:00:00Z',
      hospital: 'Baylor Dallas',
      hospitalShort: 'Baylor Dallas',
      distributor: 'Texas Spine Networks',
      distributorShort: 'Texas Spine',
      procedureType: 'TLIF',
      revenue: 7200,
      implantCOGS: 2100,
      transportCost: 89,
      handlingCost: 145,
      totalDirectCost: 2334,
      grossMargin: 4866,
      grossMarginPercent: 67.6,
      commission: 720,
      allocatedOps: 432,
      ebitdaContribution: 3714,
      ebitdaPercent: 51.6,
      daysToInvoice: 1,
      daysToCash: 28,
      cashCollected: 0,
      outstandingAR: 7200,
      invoiceDate: '2024-12-11T11:00:00Z',
      paymentDueDate: '2025-01-10T00:00:00Z',
      paymentDate: null,
      hospitalTier: 'Tier 2',
      avgMarginForType: 58.2,
    },
  ];

  return cases;
};

const RealizedMarginCash = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);

  // Fetch data
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateCaseData());
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (params) => {
    setSelectedCase(params.row);
  };

  const handleBackToList = () => {
    setSelectedCase(null);
  };

  // Summary stats
  const summaryStats = {
    totalRevenue: data.reduce((sum, c) => sum + c.revenue, 0),
    totalMargin: data.reduce((sum, c) => sum + c.grossMargin, 0),
    totalCash: data.reduce((sum, c) => sum + c.cashCollected, 0),
    totalAR: data.reduce((sum, c) => sum + c.outstandingAR, 0),
    avgDSO: data.length > 0 ? Math.round(data.reduce((sum, c) => sum + c.daysToCash, 0) / data.length) : 0,
    totalEBITDA: data.reduce((sum, c) => sum + c.ebitdaContribution, 0),
  };

  const marginPercent = summaryStats.totalRevenue > 0 ? ((summaryStats.totalMargin / summaryStats.totalRevenue) * 100).toFixed(1) : 0;
  const collectedPercent = summaryStats.totalRevenue > 0 ? Math.round((summaryStats.totalCash / summaryStats.totalRevenue) * 100) : 0;

  // Get margin badge style
  const getMarginBadgeStyle = (percent) => {
    if (percent >= 60) return { bgcolor: alpha('#10b981', 0.12), color: '#059669', border: '1px solid', borderColor: alpha('#059669', 0.2) };
    if (percent >= 45) return { bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', border: '1px solid', borderColor: alpha('#d97706', 0.2) };
    return { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', border: '1px solid', borderColor: alpha('#dc2626', 0.2) };
  };

  // Get days style
  const getDaysStyle = (days, type) => {
    if (type === 'invoice') {
      if (days <= 1) return { color: '#059669' };
      if (days <= 3) return { color: '#d97706' };
      return { color: '#dc2626' };
    } else {
      if (days <= 30) return { color: '#059669' };
      if (days <= 45) return { color: '#d97706' };
      return { color: '#dc2626' };
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: 'id',
      headerName: 'Case ID',
      minWidth: 130,
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: '#ec4899', fontSize: '0.85rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'kitId',
      headerName: 'Kit ID',
      minWidth: 120,
      flex: 0.9,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: '#0891b2', fontSize: '0.8rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'surgeryDate',
      headerName: 'Surgery',
      minWidth: 80,
      flex: 0.6,
      valueGetter: (value) => new Date(value),
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>
          {new Date(params.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Typography>
      ),
    },
    {
      field: 'revenue',
      headerName: 'Revenue',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: '#059669', fontSize: '0.85rem' }}>
          ${(params.value / 1000).toFixed(1)}K
        </Typography>
      ),
    },
    {
      field: 'implantCOGS',
      headerName: 'COGS',
      minWidth: 80,
      flex: 0.6,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem' }}>
          ${(params.value / 1000).toFixed(1)}K
        </Typography>
      ),
    },
    {
      field: 'transportCost',
      headerName: 'Transport',
      minWidth: 80,
      flex: 0.6,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
          ${params.value.toFixed(0)}
        </Typography>
      ),
    },
    {
      field: 'handlingCost',
      headerName: 'Handling',
      minWidth: 80,
      flex: 0.6,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
          ${params.value}
        </Typography>
      ),
    },
    {
      field: 'grossMargin',
      headerName: 'Margin',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const percent = params.row.grossMarginPercent;
        const color = percent >= 60 ? '#059669' : percent >= 45 ? '#d97706' : '#dc2626';
        return (
          <Typography sx={{ fontWeight: 700, color, fontSize: '0.85rem' }}>
            ${(params.value / 1000).toFixed(1)}K
          </Typography>
        );
      },
    },
    {
      field: 'grossMarginPercent',
      headerName: 'Margin %',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value.toFixed(1)}%`}
          size="small"
          sx={{ ...getMarginBadgeStyle(params.value), fontWeight: 700, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'daysToInvoice',
      headerName: 'Days Inv',
      minWidth: 70,
      flex: 0.5,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, ...getDaysStyle(params.value, 'invoice'), fontSize: '0.8rem' }}>
          {params.value}d
        </Typography>
      ),
    },
    {
      field: 'daysToCash',
      headerName: 'Days Cash',
      minWidth: 80,
      flex: 0.6,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, ...getDaysStyle(params.value, 'cash'), fontSize: '0.8rem' }}>
          {params.value}d
        </Typography>
      ),
    },
    {
      field: 'cashCollected',
      headerName: 'Collected',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: '#0891b2', fontSize: '0.8rem' }}>
          {params.value > 0 ? `$${(params.value / 1000).toFixed(1)}K` : '—'}
        </Typography>
      ),
    },
    {
      field: 'outstandingAR',
      headerName: 'AR',
      minWidth: 80,
      flex: 0.6,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: '#d97706', fontSize: '0.8rem' }}>
          {params.value > 0 ? `$${(params.value / 1000).toFixed(1)}K` : '—'}
        </Typography>
      ),
    },
    {
      field: 'ebitdaContribution',
      headerName: 'EBITDA',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const color = params.value > 0 ? '#84cc16' : '#dc2626';
        return (
          <Typography sx={{ fontWeight: 700, color, fontSize: '0.85rem' }}>
            ${(params.value / 1000).toFixed(1)}K
          </Typography>
        );
      },
    },
  ];

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedCase) return null;

    const c = selectedCase;
    const varianceMargin = c.grossMarginPercent - c.avgMarginForType;
    const collectedPercent = (c.cashCollected / c.revenue) * 100;

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Case Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%)',
            borderBottom: '2px solid',
            borderColor: alpha('#ec4899', 0.2),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton sx={{ bgcolor: alpha('#ec4899', 0.1) }}>
                <AssessmentIcon sx={{ color: '#ec4899' }} />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ec4899' }}>
                  {c.id}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {c.procedureType} Procedure • {c.hospital} • {new Date(c.surgeryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={c.kitId} size="small" sx={{ bgcolor: alpha('#06b6d4', 0.12), color: '#0891b2', fontWeight: 600 }} />
              <Chip label={c.hospitalShort} size="small" sx={{ bgcolor: alpha('#10b981', 0.12), color: '#059669', fontWeight: 600 }} />
            </Stack>
          </Box>
        </Paper>

        {/* EBITDA Banner */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, mb: 3, borderRadius: 2, bgcolor: alpha('#84cc16', 0.08), border: `1px solid ${alpha('#84cc16', 0.3)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUpIcon sx={{ fontSize: 32, color: '#84cc16' }} />
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>EBITDA Contribution</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>{c.ebitdaPercent.toFixed(1)}% contribution margin</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#84cc16' }}>
            ${c.ebitdaContribution.toLocaleString()}
          </Typography>
        </Box>

        {/* Detail Sections */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Financial Timeline */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <ScheduleIcon sx={{ color: '#06b6d4' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Financial Timeline
                  </Typography>
                </Stack>
                {[
                  { event: 'Surgery Completed', date: new Date(c.surgeryDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), status: 'completed' },
                  { event: 'Usage Logged', date: 'Same Day', delta: '+2.5 hrs', status: 'completed' },
                  { event: 'Sales Order Created', date: 'Next Day', delta: '+19 hrs', status: 'completed' },
                  { event: 'Invoice Posted', date: new Date(c.invoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), delta: `+${c.daysToInvoice}d`, status: 'completed' },
                  { event: c.paymentDate ? 'Payment Received' : 'Payment Expected', date: c.paymentDate ? new Date(c.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : new Date(c.paymentDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), delta: c.paymentDate ? `${c.daysToCash}d` : 'Net 30', status: c.paymentDate ? 'completed' : 'pending' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', mt: 0.5, bgcolor: item.status === 'completed' ? '#10b981' : item.status === 'pending' ? '#f59e0b' : '#ef4444' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{item.event}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{item.date} {item.delta && <span style={{ color: '#94a3b8' }}>({item.delta})</span>}</Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Profit Waterfall */}
          <Grid item xs={12} md={8}>
            <Card variant="outlined" sx={{ borderColor: alpha('#ec4899', 0.3), background: `linear-gradient(135deg, #fff 0%, ${alpha('#ec4899', 0.03)} 100%)` }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <AssessmentIcon sx={{ color: '#ec4899' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Profit Waterfall
                  </Typography>
                </Stack>
                {/* Waterfall bars */}
                {[
                  { label: 'Revenue', value: c.revenue, color: '#10b981', type: 'add' },
                  { label: 'Implant COGS', value: c.implantCOGS, color: '#ef4444', type: 'subtract' },
                  { label: 'Transport Cost', value: c.transportCost, color: '#ef4444', type: 'subtract' },
                  { label: 'Handling/Steril.', value: c.handlingCost, color: '#ef4444', type: 'subtract' },
                  { label: 'Gross Margin', value: c.grossMargin, color: '#ec4899', type: 'result', divider: true },
                  { label: 'Commission (10%)', value: c.commission, color: '#ef4444', type: 'subtract' },
                  { label: 'Allocated Ops', value: c.allocatedOps, color: '#ef4444', type: 'subtract' },
                  { label: 'EBITDA Contribution', value: c.ebitdaContribution, color: '#84cc16', type: 'final', divider: true },
                ].map((item, idx) => (
                  <Box key={idx}>
                    {item.divider && <Divider sx={{ my: 1.5, borderColor: item.type === 'final' ? '#ec4899' : '#e2e8f0' }} />}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography sx={{ width: 120, fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>
                        {item.type === 'subtract' ? '−' : ''} {item.label}
                      </Typography>
                      <Box sx={{ flex: 1, height: 24, bgcolor: '#f1f5f9', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ width: `${(item.value / c.revenue) * 100}%`, height: '100%', bgcolor: item.color, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 1 }}>
                          {(item.value / c.revenue) * 100 > 15 && (
                            <Typography sx={{ fontSize: '0.65rem', color: '#fff', fontWeight: 600 }}>
                              ${item.value.toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Typography sx={{ width: 80, fontSize: '0.8rem', fontWeight: 700, textAlign: 'right', color: item.type === 'subtract' ? '#dc2626' : item.color }}>
                        {item.type === 'subtract' ? '−' : ''}${item.value.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Cash Velocity & Margin Analysis */}
        <Grid container spacing={2}>
          {/* Cash Velocity */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <MoneyIcon sx={{ color: '#06b6d4' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Cash Velocity
                  </Typography>
                </Stack>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(c.daysToInvoice <= 1 ? '#10b981' : c.daysToInvoice <= 3 ? '#f59e0b' : '#ef4444', 0.1), borderRadius: 2 }}>
                      <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, color: c.daysToInvoice <= 1 ? '#059669' : c.daysToInvoice <= 3 ? '#d97706' : '#dc2626' }}>
                        {c.daysToInvoice}
                      </Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Days to Invoice</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(c.daysToCash <= 30 ? '#10b981' : c.daysToCash <= 45 ? '#f59e0b' : '#ef4444', 0.1), borderRadius: 2 }}>
                      <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, color: c.daysToCash <= 30 ? '#059669' : c.daysToCash <= 45 ? '#d97706' : '#dc2626' }}>
                        {c.daysToCash}
                      </Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Days to Cash</Typography>
                    </Box>
                  </Grid>
                </Grid>
                {/* AR Progress Bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#059669' }}>Collected: <strong>${c.cashCollected.toLocaleString()}</strong></Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#d97706' }}>Outstanding: <strong>${c.outstandingAR.toLocaleString()}</strong></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', height: 20, borderRadius: 1, overflow: 'hidden' }}>
                    <Box sx={{ width: `${collectedPercent}%`, bgcolor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {collectedPercent > 20 && <Typography sx={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600 }}>${c.cashCollected.toLocaleString()}</Typography>}
                    </Box>
                    <Box sx={{ width: `${100 - collectedPercent}%`, bgcolor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(100 - collectedPercent) > 20 && <Typography sx={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600 }}>${c.outstandingAR.toLocaleString()}</Typography>}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Margin Analysis */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <TrendingUpIcon sx={{ color: '#ec4899' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Margin Analysis
                  </Typography>
                </Stack>
                {[
                  { label: 'Gross Margin %', value: `${c.grossMarginPercent.toFixed(1)}%`, color: '#059669' },
                  { label: 'EBITDA Margin %', value: `${c.ebitdaPercent.toFixed(1)}%`, color: '#84cc16' },
                  { label: 'Avg for Kit Type', value: `${c.avgMarginForType.toFixed(1)}%` },
                  { label: 'Variance to Avg', value: `${varianceMargin >= 0 ? '+' : ''}${varianceMargin.toFixed(1)}%`, color: varianceMargin >= 0 ? '#059669' : '#dc2626' },
                  { label: 'Hospital Tier', value: c.hospitalTier },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.color || '#1e293b' }}>{item.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alerts */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[
            c.daysToInvoice <= 1 && { type: 'success', icon: <CheckIcon />, title: 'Fast Invoice', desc: `Invoiced within ${c.daysToInvoice} day of usage` },
            varianceMargin > 3 && { type: 'success', icon: <TrendingUpIcon />, title: 'Above Avg Margin', desc: `+${varianceMargin.toFixed(1)}% vs kit type average` },
            c.outstandingAR > 0 ? { type: 'info', icon: <AccessTimeIcon />, title: 'Payment Pending', desc: `Net 30 terms — due ${new Date(c.paymentDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` } : { type: 'success', icon: <MoneyIcon />, title: 'Fully Collected', desc: `$${c.cashCollected.toLocaleString()} received` },
            c.ebitdaPercent > 45 && { type: 'success', icon: <TrendingUpIcon />, title: 'Strong EBITDA', desc: `${c.ebitdaPercent.toFixed(0)}% contribution margin` },
          ].filter(Boolean).map((alert, idx) => (
            <Grid item xs={6} md={3} key={idx}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, borderLeft: `3px solid ${alert.type === 'success' ? '#10b981' : alert.type === 'warning' ? '#f59e0b' : '#06b6d4'}`, bgcolor: alpha(alert.type === 'success' ? '#10b981' : alert.type === 'warning' ? '#f59e0b' : '#06b6d4', 0.05) }}>
                <Box sx={{ color: alert.type === 'success' ? '#10b981' : alert.type === 'warning' ? '#f59e0b' : '#06b6d4' }}>{alert.icon}</Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{alert.title}</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{alert.desc}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Main render
  return (
    <Box sx={{ p: 3, height: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
              TRAXX.AI
            </Link>
            {selectedCase ? (
              <>
                <Link component="button" variant="body1" onClick={() => setSelectedCase(null)} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
                  Realized Margin & Cash
                </Link>
                <Typography color="primary" variant="body1" fontWeight={600}>
                  {selectedCase.id}
                </Typography>
              </>
            ) : (
              <Typography color="primary" variant="body1" fontWeight={600}>
                Realized Margin & Cash
              </Typography>
            )}
          </Breadcrumbs>
          <Stack direction="row" spacing={1}>
            {!selectedCase && (
              <>
                <Tooltip title="Refresh">
                  <IconButton onClick={fetchData} color="primary"><Refresh /></IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton color="primary"><Download /></IconButton>
                </Tooltip>
              </>
            )}
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ color: '#00357a', borderColor: '#00357a' }}>
              Back
            </Button>
          </Stack>
        </Stack>

        {/* Performance Banner - Only show in list view */}
        {!selectedCase && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, mb: 3, borderRadius: 2, background: `linear-gradient(135deg, ${alpha('#ec4899', 0.08)}, ${alpha('#a855f7', 0.08)})`, border: `1px solid ${alpha('#ec4899', 0.3)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssessmentIcon sx={{ fontSize: 32, color: '#ec4899' }} />
              <Box>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#ec4899' }}>MTD FINANCIAL PERFORMANCE</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {data.length} usage cases processed — {collectedPercent}% cash collected
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={4}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>{formatCurrency(summaryStats.totalRevenue)}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Revenue Recognized</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#ec4899' }}>{formatCurrency(summaryStats.totalMargin)}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Gross Margin</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706' }}>{summaryStats.avgDSO} days</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Avg DSO</Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Summary Cards - Only show in list view */}
        {!selectedCase && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Revenue (MTD)', value: formatCurrency(summaryStats.totalRevenue), sub: `${data.length} cases invoiced`, color: '#10b981', icon: <ReceiptIcon /> },
              { label: 'Gross Margin', value: `${marginPercent}%`, sub: `${formatCurrency(summaryStats.totalMargin)} contribution`, color: '#ec4899', icon: <TrendingUpIcon /> },
              { label: 'Cash Collected', value: formatCurrency(summaryStats.totalCash), sub: `${collectedPercent}% of billed`, color: '#06b6d4', icon: <MoneyIcon /> },
              { label: 'Outstanding AR', value: formatCurrency(summaryStats.totalAR), sub: `${data.filter(c => c.outstandingAR > 0).length} invoices pending`, color: '#f59e0b', icon: <AccountBalanceIcon /> },
              { label: 'Avg Days to Cash', value: summaryStats.avgDSO, sub: 'Target: 30 days', color: '#a855f7', icon: <ScheduleIcon /> },
              { label: 'EBITDA Contribution', value: formatCurrency(summaryStats.totalEBITDA), sub: `${summaryStats.totalRevenue > 0 ? ((summaryStats.totalEBITDA / summaryStats.totalRevenue) * 100).toFixed(1) : 0}% of revenue`, color: '#84cc16', icon: <AssessmentIcon /> },
            ].map((stat, idx) => (
              <Grid item xs={6} sm={4} md={2} key={idx}>
                <Card sx={{ borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `3px solid ${stat.color}` }}>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Box sx={{ color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                      <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b' }}>{stat.value}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{stat.sub}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Content */}
      {selectedCase ? (
        renderDetailView()
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.2), background: `linear-gradient(90deg, ${alpha('#ec4899', 0.05)}, ${alpha('#64748b', 0.02)})` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                Case Profitability — <Typography component="span" sx={{ color: '#ec4899' }}>Click Row for Details</Typography>
              </Typography>
              <Chip label="ERP | TILE 3 (Transport) | DERIVED" size="small" sx={{ fontSize: '0.6rem', bgcolor: alpha('#ec4899', 0.1), color: '#ec4899' }} />
            </Stack>
          </Box>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <DataGrid
              rows={data}
              columns={columns}
              loading={loading}
              density="compact"
              onRowClick={handleRowClick}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: { sortModel: [{ field: 'ebitdaContribution', sort: 'desc' }] },
              }}
              sx={traxxTheme.getDataGridSx({ clickable: true })}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default RealizedMarginCash;
