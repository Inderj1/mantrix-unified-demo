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
  LinearProgress,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  LocalHospital as HospitalIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  LocalShipping as ShippingIcon,
  Build as BuildIcon,
  Sensors as SensorsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  SwapHoriz as SwapIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import traxxTheme from './traxxTheme';

// Format currency
const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};

// Generate mock surgery data
const generateSurgeryData = () => {
  const surgeries = [
    {
      id: 'NXS-DEF-002',
      kitType: 'Loaner',
      hospital: 'Johns Hopkins Hospital',
      hospitalShort: 'Johns Hopkins',
      surgeon: 'Dr. James Chen',
      surgeryDate: '2024-12-16T06:30:00Z',
      daysUntil: 2,
      readinessScore: 45,
      readinessStatus: 'not-ready',
      missingComponents: 2,
      expiringComponents: 1,
      replenishmentLeadTime: 3,
      emergencyRequired: 'Yes',
      revenueAtRisk: 28500,
      requiredAction: 'Escalate',
      procedureType: 'Deformity',
      requiredCount: 18,
      availableCount: 16,
      substituteAllowed: false,
      fastestReplenish: 'Expedited',
      etaVsSurgery: '-1 day (LATE)',
      emergencyCost: 285,
      alternativeKit: 'NXS-DEF-007',
      confidence: 42,
      iotPresent: true,
      iotLastPing: '5 min ago',
      iotMovement: 'None',
      iotAlerts: 'OK',
      components: [
        { name: 'Pedicle Screw 6.5x45mm (12)', status: 'available' },
        { name: 'Pedicle Screw 6.5x50mm (4)', status: 'available' },
        { name: 'Cross Connector (2)', status: 'missing' },
        { name: 'Set Screw Locking (16)', status: 'expiring' },
      ],
      scoreFactors: { completeness: 65, expiry: 50, replenish: 30, iot: 100, history: 85 }
    },
    {
      id: 'NXS-CERVICAL-001',
      kitType: 'Loaner',
      hospital: 'Mayo Clinic Rochester',
      hospitalShort: 'Mayo Clinic',
      surgeon: 'Dr. Emily Park',
      surgeryDate: '2024-12-17T07:00:00Z',
      daysUntil: 3,
      readinessScore: 72,
      readinessStatus: 'at-risk',
      missingComponents: 0,
      expiringComponents: 2,
      replenishmentLeadTime: 2,
      emergencyRequired: 'Maybe',
      revenueAtRisk: 7200,
      requiredAction: 'Replenish',
      procedureType: 'Cervical',
      requiredCount: 8,
      availableCount: 8,
      substituteAllowed: true,
      fastestReplenish: 'Standard',
      etaVsSurgery: '1 day buffer',
      emergencyCost: 0,
      alternativeKit: 'None',
      confidence: 78,
      iotPresent: true,
      iotLastPing: '12 min ago',
      iotMovement: 'None',
      iotAlerts: 'OK',
      components: [
        { name: 'Cervical Plate 35mm (1)', status: 'available' },
        { name: 'Cervical Screw 14mm (4)', status: 'expiring' },
        { name: 'Cervical Disc 6mm (1)', status: 'expiring' },
        { name: 'Driver Set (1)', status: 'available' },
      ],
      scoreFactors: { completeness: 100, expiry: 45, replenish: 70, iot: 95, history: 82 }
    },
    {
      id: 'NXS-TLIF-001',
      kitType: 'Loaner',
      hospital: 'Mass General Hospital',
      hospitalShort: 'Mass General',
      surgeon: 'Dr. Sarah Mitchell',
      surgeryDate: '2024-12-19T08:00:00Z',
      daysUntil: 5,
      readinessScore: 92,
      readinessStatus: 'ready',
      missingComponents: 0,
      expiringComponents: 0,
      replenishmentLeadTime: 2,
      emergencyRequired: 'No',
      revenueAtRisk: 12500,
      requiredAction: 'None',
      procedureType: 'TLIF',
      requiredCount: 12,
      availableCount: 12,
      substituteAllowed: true,
      fastestReplenish: 'N/A',
      etaVsSurgery: '3 days buffer',
      emergencyCost: 0,
      alternativeKit: 'NXS-TLIF-003',
      confidence: 98,
      iotPresent: true,
      iotLastPing: '2 min ago',
      iotMovement: 'None',
      iotAlerts: 'OK',
      components: [
        { name: 'Pedicle Screw 6.5x45mm (6)', status: 'available' },
        { name: 'Titanium Rod 5.5x400mm (2)', status: 'available' },
        { name: 'Set Screw Locking (6)', status: 'available' },
      ],
      scoreFactors: { completeness: 100, expiry: 100, replenish: 95, iot: 100, history: 78 }
    },
    {
      id: 'NXS-PLIF-003',
      kitType: 'Consignment',
      hospital: 'Cleveland Clinic',
      hospitalShort: 'Cleveland',
      surgeon: 'Dr. Michael Torres',
      surgeryDate: '2024-12-20T09:00:00Z',
      daysUntil: 6,
      readinessScore: 88,
      readinessStatus: 'ready',
      missingComponents: 0,
      expiringComponents: 0,
      replenishmentLeadTime: 2,
      emergencyRequired: 'No',
      revenueAtRisk: 9800,
      requiredAction: 'None',
      procedureType: 'PLIF',
      requiredCount: 10,
      availableCount: 10,
      substituteAllowed: true,
      fastestReplenish: 'N/A',
      etaVsSurgery: '4 days buffer',
      emergencyCost: 0,
      alternativeKit: 'NXS-PLIF-009',
      confidence: 95,
      iotPresent: true,
      iotLastPing: '8 min ago',
      iotMovement: 'None',
      iotAlerts: 'OK',
      components: [
        { name: 'Pedicle Screw 5.5x40mm (4)', status: 'available' },
        { name: 'Interbody Cage 12mm (2)', status: 'available' },
        { name: 'Titanium Rod 5.5x350mm (2)', status: 'available' },
      ],
      scoreFactors: { completeness: 100, expiry: 100, replenish: 90, iot: 92, history: 80 }
    },
    {
      id: 'NXS-TLIF-012',
      kitType: 'Loaner',
      hospital: 'Methodist Le Bonheur',
      hospitalShort: 'Methodist',
      surgeon: 'Dr. Lisa Wang',
      surgeryDate: '2024-12-22T07:30:00Z',
      daysUntil: 8,
      readinessScore: 95,
      readinessStatus: 'ready',
      missingComponents: 0,
      expiringComponents: 0,
      replenishmentLeadTime: 2,
      emergencyRequired: 'No',
      revenueAtRisk: 8950,
      requiredAction: 'None',
      procedureType: 'TLIF',
      requiredCount: 10,
      availableCount: 10,
      substituteAllowed: true,
      fastestReplenish: 'N/A',
      etaVsSurgery: '6 days buffer',
      emergencyCost: 0,
      alternativeKit: 'NXS-TLIF-008',
      confidence: 99,
      iotPresent: true,
      iotLastPing: '1 min ago',
      iotMovement: 'None',
      iotAlerts: 'OK',
      components: [
        { name: 'Pedicle Screw 6.5x45mm (4)', status: 'available' },
        { name: 'Titanium Rod 5.5x400mm (2)', status: 'available' },
        { name: 'Set Screw Locking (4)', status: 'available' },
      ],
      scoreFactors: { completeness: 100, expiry: 100, replenish: 100, iot: 100, history: 85 }
    },
    {
      id: 'NXS-DEF-007',
      kitType: 'Loaner',
      hospital: 'Stanford Medical Center',
      hospitalShort: 'Stanford',
      surgeon: 'Dr. Robert Kim',
      surgeryDate: '2024-12-26T08:00:00Z',
      daysUntil: 12,
      readinessScore: 90,
      readinessStatus: 'ready',
      missingComponents: 0,
      expiringComponents: 0,
      replenishmentLeadTime: 3,
      emergencyRequired: 'No',
      revenueAtRisk: 11500,
      requiredAction: 'None',
      procedureType: 'Deformity',
      requiredCount: 16,
      availableCount: 16,
      substituteAllowed: true,
      fastestReplenish: 'N/A',
      etaVsSurgery: '9 days buffer',
      emergencyCost: 0,
      alternativeKit: 'NXS-DEF-002',
      confidence: 97,
      iotPresent: true,
      iotLastPing: '15 min ago',
      iotMovement: 'None',
      iotAlerts: 'OK',
      components: [
        { name: 'Pedicle Screw 6.5x45mm (8)', status: 'available' },
        { name: 'Pedicle Screw 6.5x50mm (4)', status: 'available' },
        { name: 'Cross Connector (2)', status: 'available' },
        { name: 'Titanium Rod 5.5x500mm (2)', status: 'available' },
      ],
      scoreFactors: { completeness: 100, expiry: 100, replenish: 85, iot: 90, history: 88 }
    },
  ];

  // Sort by urgency: Revenue at Risk / Days Until
  return surgeries.sort((a, b) => {
    const urgencyA = a.revenueAtRisk / Math.max(a.daysUntil, 0.5);
    const urgencyB = b.revenueAtRisk / Math.max(b.daysUntil, 0.5);
    return urgencyB - urgencyA;
  });
};

const SurgeryReadiness = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurgery, setSelectedSurgery] = useState(null);

  // Fetch data
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateSurgeryData());
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (params) => {
    setSelectedSurgery(params.row);
  };

  const handleBackToList = () => {
    setSelectedSurgery(null);
  };

  // Summary stats
  const summaryStats = {
    total: data.length,
    ready: data.filter(s => s.readinessStatus === 'ready').length,
    atRisk: data.filter(s => s.readinessStatus === 'at-risk').length,
    notReady: data.filter(s => s.readinessStatus === 'not-ready').length,
    totalRevenue: data.reduce((sum, s) => sum + s.revenueAtRisk, 0),
    atRiskRevenue: data.filter(s => s.readinessStatus !== 'ready').reduce((sum, s) => sum + s.revenueAtRisk, 0),
    avgScore: data.length > 0 ? Math.round(data.reduce((sum, s) => sum + s.readinessScore, 0) / data.length) : 0,
    emergencyCount: data.filter(s => s.emergencyRequired === 'Yes').length,
    riskCount: data.filter(s => s.readinessStatus === 'at-risk' || s.readinessStatus === 'not-ready').length,
  };

  // Get readiness status style
  const getStatusStyle = (status) => {
    const styles = {
      'ready': { bgcolor: alpha('#10b981', 0.12), color: '#059669', border: '1px solid', borderColor: alpha('#059669', 0.2) },
      'at-risk': { bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', border: '1px solid', borderColor: alpha('#d97706', 0.2) },
      'not-ready': { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', border: '1px solid', borderColor: alpha('#dc2626', 0.2) },
    };
    return styles[status] || styles['ready'];
  };

  // Get score circle style
  const getScoreCircleStyle = (score) => {
    if (score >= 80) return { bgcolor: alpha('#10b981', 0.15), color: '#059669', borderColor: '#10b981' };
    if (score >= 60) return { bgcolor: alpha('#f59e0b', 0.15), color: '#d97706', borderColor: '#f59e0b' };
    return { bgcolor: alpha('#ef4444', 0.15), color: '#dc2626', borderColor: '#ef4444' };
  };

  // Get days countdown style
  const getDaysStyle = (days) => {
    if (days <= 2) return { color: '#dc2626' };
    if (days <= 5) return { color: '#d97706' };
    return { color: '#059669' };
  };

  // Get emergency badge style
  const getEmergencyStyle = (value) => {
    const styles = {
      'Yes': { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626' },
      'Maybe': { bgcolor: alpha('#f59e0b', 0.12), color: '#d97706' },
      'No': { bgcolor: alpha('#10b981', 0.12), color: '#059669' },
    };
    return styles[value] || styles['No'];
  };

  // Get action badge style
  const getActionStyle = (action) => {
    const styles = {
      'Escalate': { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', borderColor: alpha('#dc2626', 0.3) },
      'Replenish': { bgcolor: alpha('#a855f7', 0.12), color: '#9333ea', borderColor: alpha('#9333ea', 0.3) },
      'None': { bgcolor: alpha('#10b981', 0.12), color: '#059669', borderColor: alpha('#059669', 0.3) },
    };
    return { ...styles[action] || styles['None'], border: '1px solid' };
  };

  // DataGrid columns
  const columns = [
    {
      field: 'id',
      headerName: 'Kit ID',
      minWidth: 130,
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: '#0891b2', fontSize: '0.85rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'kitType',
      headerName: 'Type',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            ...(params.value === 'Loaner'
              ? { bgcolor: alpha('#a855f7', 0.12), color: '#9333ea' }
              : { bgcolor: alpha('#06b6d4', 0.12), color: '#0891b2' }),
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      ),
    },
    {
      field: 'hospitalShort',
      headerName: 'Hospital',
      minWidth: 110,
      flex: 0.9,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }} noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'surgeon',
      headerName: 'Surgeon',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }} noWrap>
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
      field: 'daysUntil',
      headerName: 'Days Out',
      minWidth: 80,
      flex: 0.5,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, ...getDaysStyle(params.value), fontSize: '0.9rem' }}>
          {params.value}d
        </Typography>
      ),
    },
    {
      field: 'readinessScore',
      headerName: 'Score',
      minWidth: 70,
      flex: 0.5,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const style = getScoreCircleStyle(params.value);
        return (
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${style.borderColor}`, bgcolor: style.bgcolor }}>
            <Typography sx={{ fontWeight: 700, color: style.color, fontSize: '0.75rem' }}>{params.value}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'readinessStatus',
      headerName: 'Status',
      minWidth: 100,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const label = params.value === 'ready' ? 'Ready' : params.value === 'at-risk' ? 'At Risk' : 'Not Ready';
        return <Chip label={label} size="small" sx={{ ...getStatusStyle(params.value), fontWeight: 600, fontSize: '0.7rem' }} />;
      },
    },
    {
      field: 'missingComponents',
      headerName: 'Missing',
      minWidth: 70,
      flex: 0.5,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: params.value > 0 ? '#dc2626' : '#059669', fontSize: '0.8rem' }}>
          {params.value > 0 ? `${params.value}` : '0'}
        </Typography>
      ),
    },
    {
      field: 'expiringComponents',
      headerName: 'Expiring',
      minWidth: 70,
      flex: 0.5,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: params.value > 0 ? '#d97706' : '#059669', fontSize: '0.8rem' }}>
          {params.value > 0 ? `${params.value}` : '0'}
        </Typography>
      ),
    },
    {
      field: 'replenishmentLeadTime',
      headerName: 'Lead Time',
      minWidth: 80,
      flex: 0.5,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>{params.value}d</Typography>
      ),
    },
    {
      field: 'emergencyRequired',
      headerName: 'Emergency?',
      minWidth: 90,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ ...getEmergencyStyle(params.value), fontWeight: 600, fontSize: '0.65rem' }} />
      ),
    },
    {
      field: 'revenueAtRisk',
      headerName: 'Revenue',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: '#ec4899', fontSize: '0.85rem' }}>
          ${(params.value / 1000).toFixed(1)}K
        </Typography>
      ),
    },
    {
      field: 'requiredAction',
      headerName: 'Action',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ ...getActionStyle(params.value), fontWeight: 600, fontSize: '0.65rem' }} />
      ),
    },
  ];

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedSurgery) return null;

    const s = selectedSurgery;
    const scoreStyle = getScoreCircleStyle(s.readinessScore);
    const statusLabel = s.readinessStatus === 'ready' ? 'READY' : s.readinessStatus === 'at-risk' ? 'AT RISK' : 'NOT READY';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header with Back Button */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small">
            Back to Readiness Board
          </Button>
          <Stack direction="row" spacing={1}>
            <Chip label={s.kitType} size="small" sx={s.kitType === 'Loaner' ? { bgcolor: alpha('#a855f7', 0.12), color: '#9333ea', fontWeight: 600 } : { bgcolor: alpha('#06b6d4', 0.12), color: '#0891b2', fontWeight: 600 }} />
            <Chip label={statusLabel} size="small" sx={{ ...getStatusStyle(s.readinessStatus), fontWeight: 600 }} />
          </Stack>
        </Stack>

        {/* Title and Score */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#a855f7' }}>{s.id}</Typography>
            <Typography sx={{ color: '#64748b', mb: 1 }}>{s.procedureType} Procedure — {s.hospital} — {new Date(s.surgeryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 100, height: 100, borderRadius: '50%', border: `4px solid ${scoreStyle.borderColor}`, bgcolor: scoreStyle.bgcolor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: scoreStyle.color }}>{s.readinessScore}</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Score</Typography>
            </Box>
            <Typography sx={{ fontWeight: 600, color: scoreStyle.color }}>{statusLabel}</Typography>
          </Box>
        </Box>

        {/* Detail Sections */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Surgery Context */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <HospitalIcon sx={{ color: '#a855f7' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Surgery Context
                  </Typography>
                </Stack>
                {[
                  { label: 'Surgery Date', value: new Date(s.surgeryDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }), highlight: true },
                  { label: 'Days Until Surgery', value: `${s.daysUntil} days`, color: getDaysStyle(s.daysUntil).color },
                  { label: 'Procedure Type', value: s.procedureType },
                  { label: 'Surgeon', value: s.surgeon },
                  { label: 'Hospital', value: s.hospital },
                  { label: 'Expected Revenue', value: formatCurrency(s.revenueAtRisk), color: '#ec4899' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 5 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.highlight ? '#a855f7' : item.color || '#1e293b', maxWidth: 150 }} noWrap>{item.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Kit Integrity */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderColor: alpha('#a855f7', 0.3), background: `linear-gradient(135deg, #fff 0%, ${alpha('#a855f7', 0.03)} 100%)` }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <BuildIcon sx={{ color: '#a855f7' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Kit Integrity
                  </Typography>
                </Stack>
                {[
                  { label: 'Required Components', value: s.requiredCount },
                  { label: 'Available', value: s.availableCount, color: s.availableCount >= s.requiredCount ? '#059669' : '#dc2626' },
                  { label: 'Missing Critical', value: s.missingComponents, color: s.missingComponents === 0 ? '#059669' : '#dc2626' },
                  { label: 'Expiring Before Surgery', value: s.expiringComponents, color: s.expiringComponents === 0 ? '#059669' : '#d97706' },
                  { label: 'Substitute Allowed', value: s.substituteAllowed ? 'Yes' : 'No', color: s.substituteAllowed ? '#059669' : '#dc2626' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.color || '#1e293b' }}>{item.value}</Typography>
                  </Box>
                ))}
                {/* Component List */}
                <Box sx={{ mt: 2 }}>
                  {s.components.map((c, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, mb: 1, bgcolor: '#f8fafc', borderRadius: 1 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: '#475569' }}>{c.name}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: c.status === 'available' ? '#059669' : c.status === 'missing' ? '#dc2626' : '#d97706' }}>
                        {c.status === 'available' ? 'Available' : c.status === 'missing' ? 'Missing' : 'Expiring'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Fixability Analysis */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderColor: alpha('#06b6d4', 0.3), background: `linear-gradient(135deg, #fff 0%, ${alpha('#06b6d4', 0.03)} 100%)` }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <SpeedIcon sx={{ color: '#06b6d4' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Fixability Analysis
                  </Typography>
                </Stack>
                {[
                  { label: 'Fastest Replenish Option', value: s.fastestReplenish },
                  { label: 'Replenishment Lead Time', value: `${s.replenishmentLeadTime} days` },
                  { label: 'ETA vs Surgery', value: s.etaVsSurgery, color: s.etaVsSurgery.includes('buffer') ? '#059669' : '#dc2626' },
                  { label: 'Emergency Shipping Cost', value: s.emergencyCost > 0 ? `$${s.emergencyCost}` : '$0 (not needed)' },
                  { label: 'Alternative Kit Available', value: s.alternativeKit === 'None' ? 'None available' : `Yes (${s.alternativeKit})`, color: s.alternativeKit !== 'None' ? '#059669' : '#64748b' },
                  { label: 'On-Time Confidence', value: `${s.confidence}%`, color: s.confidence >= 80 ? '#059669' : s.confidence >= 60 ? '#d97706' : '#dc2626' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 5 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.color || '#1e293b' }}>{item.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* IoT Confirmation & Score Factors */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* IoT Confirmation */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <SensorsIcon sx={{ color: '#10b981' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    IoT Confirmation
                  </Typography>
                </Stack>
                <Grid container spacing={1}>
                  {[
                    { icon: '📍', label: 'Kit Present', value: s.iotPresent ? 'Confirmed' : 'Not Found', status: s.iotPresent ? 'good' : 'bad' },
                    { icon: '📶', label: 'Last Ping', value: s.iotLastPing, status: 'good' },
                    { icon: '🚨', label: 'Unexpected Move', value: s.iotMovement, status: 'good' },
                    { icon: '🌡️', label: 'Temp/Tamper', value: s.iotAlerts, status: 'good' },
                  ].map((item, idx) => (
                    <Grid item xs={6} key={idx}>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
                        <Typography sx={{ fontSize: '1.2rem', mb: 0.5 }}>{item.icon}</Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>{item.label}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: item.status === 'good' ? '#059669' : '#dc2626' }}>{item.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Score Factors */}
          <Grid item xs={12} md={8}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <PsychologyIcon sx={{ color: '#a855f7' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Readiness Score Breakdown
                  </Typography>
                </Stack>
                {[
                  { label: 'Component Completeness (35%)', value: s.scoreFactors.completeness },
                  { label: 'Expiry Risk (20%)', value: s.scoreFactors.expiry },
                  { label: 'Replenishment Feasibility (20%)', value: s.scoreFactors.replenish },
                  { label: 'IoT Presence (15%)', value: s.scoreFactors.iot },
                  { label: 'Historical Reliability (10%)', value: s.scoreFactors.history },
                ].map((item, idx) => {
                  const barColor = item.value >= 80 ? '#10b981' : item.value >= 60 ? '#f59e0b' : '#ef4444';
                  return (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                      <Typography sx={{ width: 180, fontSize: '0.7rem', color: '#64748b' }}>{item.label}</Typography>
                      <Box sx={{ flex: 1, height: 8, bgcolor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{ width: `${item.value}%`, height: '100%', bgcolor: barColor, borderRadius: 4 }} />
                      </Box>
                      <Typography sx={{ width: 30, fontSize: '0.75rem', fontWeight: 700, textAlign: 'right', color: barColor }}>{item.value}</Typography>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Grid container spacing={2}>
          {[
            { label: 'Trigger Replenishment', icon: <ShippingIcon />, color: 'primary', variant: 'contained' },
            { label: 'Upgrade to Expedited', icon: <SpeedIcon />, color: 'secondary', variant: 'outlined' },
            { label: 'Swap Kit', icon: <SwapIcon />, color: 'secondary', variant: 'outlined' },
            { label: 'Escalate to Ops', icon: <TrendingUpIcon />, color: 'error', variant: 'outlined' },
            { label: 'Notify Rep', icon: <EmailIcon />, color: 'secondary', variant: 'outlined' },
            { label: 'Notify Hospital', icon: <HospitalIcon />, color: 'secondary', variant: 'outlined' },
          ].map((btn, idx) => (
            <Grid item xs={6} md={2} key={idx}>
              <Button
                fullWidth
                variant={btn.variant}
                color={btn.color}
                startIcon={btn.icon}
                sx={{ py: 1.5, fontSize: '0.75rem' }}
                onClick={() => alert(`${btn.label} action triggered`)}
              >
                {btn.label}
              </Button>
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
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>
              TRAXX.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              {selectedSurgery ? selectedSurgery.id : 'Surgery Readiness'}
            </Typography>
          </Breadcrumbs>
          {!selectedSurgery && (
            <Stack direction="row" spacing={1}>
              <Chip label="PREDICTIVE" size="small" sx={{ bgcolor: alpha('#a855f7', 0.12), color: '#9333ea', fontWeight: 600 }} />
              <Tooltip title="Refresh">
                <IconButton onClick={fetchData} color="primary"><Refresh /></IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton color="primary"><Download /></IconButton>
              </Tooltip>
            </Stack>
          )}
        </Stack>

        {/* Readiness Banner - Only show in list view */}
        {!selectedSurgery && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, mb: 3, borderRadius: 2, background: `linear-gradient(135deg, ${alpha('#a855f7', 0.08)}, ${alpha('#6366f1', 0.08)})`, border: `1px solid ${alpha('#a855f7', 0.3)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PsychologyIcon sx={{ fontSize: 32, color: '#a855f7' }} />
              <Box>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#a855f7' }}>NEXT 14 DAYS — SURGERY READINESS</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {summaryStats.total} surgeries scheduled — {summaryStats.riskCount} require attention
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={4}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>{summaryStats.avgScore}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Avg Readiness Score</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706' }}>{formatCurrency(summaryStats.atRiskRevenue)}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Revenue at Risk</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>{summaryStats.emergencyCount}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Emergency Ship Needed</Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Summary Cards - Only show in list view */}
        {!selectedSurgery && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Scheduled (14 days)', value: summaryStats.total, sub: 'Upcoming procedures', color: '#a855f7', icon: <ScheduleIcon /> },
              { label: 'Ready', value: summaryStats.ready, sub: 'No action required', color: '#10b981', icon: <CheckIcon /> },
              { label: 'At Risk', value: summaryStats.atRisk, sub: 'Needs attention', color: '#f59e0b', icon: <WarningIcon /> },
              { label: 'Not Ready', value: summaryStats.notReady, sub: 'Immediate action', color: '#ef4444', icon: <ErrorIcon /> },
              { label: 'Total Revenue', value: formatCurrency(summaryStats.totalRevenue), sub: 'At stake next 14 days', color: '#ec4899', icon: <TrendingUpIcon /> },
            ].map((stat, idx) => (
              <Grid item xs={6} sm={4} md={2.4} key={idx}>
                <Card sx={{ borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `3px solid ${stat.color}` }}>
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
      {selectedSurgery ? (
        renderDetailView()
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.2), background: `linear-gradient(90deg, ${alpha('#a855f7', 0.05)}, ${alpha('#64748b', 0.02)})` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                Surgery Readiness Board — <Typography component="span" sx={{ color: '#a855f7' }}>Click Row for Details</Typography>
              </Typography>
              <Chip label="ERP | CRM | BOM | ML/RULES" size="small" sx={{ fontSize: '0.6rem', bgcolor: alpha('#a855f7', 0.1), color: '#a855f7' }} />
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

export default SurgeryReadiness;
