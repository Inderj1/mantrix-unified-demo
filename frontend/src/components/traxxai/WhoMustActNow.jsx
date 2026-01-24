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
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Warning as WarningIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  Error as ErrorIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  NotificationsActive as NotificationsIcon,
} from '@mui/icons-material';
import traxxTheme from './traxxTheme';

// Format currency
const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(2)}`;
};

// Generate mock action data
const generateActionData = () => {
  const actions = [
    {
      id: 'ACT-001',
      kitId: 'NXS-PLIF-009',
      kitSerial: 'SN-2024-00089',
      kitType: 'Consignment',
      currentStatus: 'Idle',
      daysOverdue: 14,
      requiredAction: 'Schedule Return Pickup',
      actionType: 'urgent',
      ownerType: 'Distributor Rep',
      organization: 'Pacific Surgical Partners',
      accountablePerson: 'Sarah Chen',
      phone: '(415) 555-1234',
      email: 'schen@pacificsurgical.com',
      revenueAtRisk: 11200,
      marginPerDay: 5137,
      escalationLevel: 3,
      workflowStatus: 'Sent',
      backupOwner: 'Mike Torres',
      backupRole: 'Manager',
      slaWindow: 3,
      delayProbability: 0.85,
      avgMarginPerCase: 6044,
      assetValue: 45000,
      location: 'Stanford Medical Center',
    },
    {
      id: 'ACT-002',
      kitId: 'NXS-TLIF-008',
      kitSerial: 'SN-2024-00134',
      kitType: 'Loaner',
      currentStatus: 'Quarantine',
      daysOverdue: 2,
      requiredAction: 'Investigate Temp/Tamper',
      actionType: 'urgent',
      ownerType: 'Ops',
      organization: 'Texas Spine Networks',
      accountablePerson: 'James Wilson',
      phone: '(214) 555-9876',
      email: 'jwilson@texasspine.com',
      revenueAtRisk: 9800,
      marginPerDay: 4200,
      escalationLevel: 2,
      workflowStatus: 'Sent',
      backupOwner: 'Linda Martinez',
      backupRole: 'Ops Director',
      slaWindow: 1,
      delayProbability: 0.70,
      avgMarginPerCase: 6000,
      assetValue: 38000,
      location: 'Dallas Distribution Center',
    },
    {
      id: 'ACT-003',
      kitId: 'NXS-DEF-007',
      kitSerial: 'SN-2024-00098',
      kitType: 'Loaner',
      currentStatus: 'Idle',
      daysOverdue: 7,
      requiredAction: 'Reassign Kit',
      actionType: 'logistics',
      ownerType: 'Ops',
      organization: 'Southwest Surgical Supply',
      accountablePerson: 'David Park',
      phone: '(602) 555-4567',
      email: 'dpark@swsurgical.com',
      revenueAtRisk: 28500,
      marginPerDay: 3800,
      escalationLevel: 2,
      workflowStatus: 'Acknowledged',
      backupOwner: 'Rachel Kim',
      backupRole: 'Regional Manager',
      slaWindow: 5,
      delayProbability: 0.50,
      avgMarginPerCase: 7600,
      assetValue: 62000,
      location: 'Phoenix Distribution Center',
    },
    {
      id: 'ACT-004',
      kitId: 'NXS-TLIF-012',
      kitSerial: 'SN-2024-00201',
      kitType: 'Loaner',
      currentStatus: 'Usage Recorded',
      daysOverdue: 1,
      requiredAction: 'Create Sales Order',
      actionType: 'billing',
      ownerType: 'Back Office',
      organization: 'Southern Spine Distributors',
      accountablePerson: 'Emily Rodriguez',
      phone: '(901) 555-2345',
      email: 'erodriguez@southernspine.com',
      revenueAtRisk: 8950,
      marginPerDay: 4856,
      escalationLevel: 1,
      workflowStatus: 'Not Sent',
      backupOwner: 'Tom Anderson',
      backupRole: 'Billing Supervisor',
      slaWindow: 1,
      delayProbability: 0.20,
      avgMarginPerCase: 4856,
      assetValue: 35000,
      location: 'Memphis Sterile Processing',
    },
    {
      id: 'ACT-005',
      kitId: 'NXS-PLIF-003',
      kitSerial: 'SN-2024-00163',
      kitType: 'Consignment',
      currentStatus: 'In Transit',
      daysOverdue: 0,
      requiredAction: 'Confirm Delivery',
      actionType: 'logistics',
      ownerType: 'Logistics',
      organization: 'Midwest Ortho Partners',
      accountablePerson: 'Kevin Brown',
      phone: '(216) 555-7890',
      email: 'kbrown@midwestortho.com',
      revenueAtRisk: 9800,
      marginPerDay: 1200,
      escalationLevel: 1,
      workflowStatus: 'Not Sent',
      backupOwner: 'Amy White',
      backupRole: 'Logistics Manager',
      slaWindow: 2,
      delayProbability: 0.15,
      avgMarginPerCase: 5380,
      assetValue: 42000,
      location: 'In Transit to Cleveland Clinic',
    },
    {
      id: 'ACT-006',
      kitId: 'NXS-DEF-002',
      kitSerial: 'SN-2024-00215',
      kitType: 'Loaner',
      currentStatus: 'At Hospital',
      daysOverdue: 1,
      requiredAction: 'Record Usage',
      actionType: 'default',
      ownerType: 'Sales Rep',
      organization: 'Atlantic Spine Solutions',
      accountablePerson: 'Jennifer Lee',
      phone: '(410) 555-3456',
      email: 'jlee@atlanticspine.com',
      revenueAtRisk: 28500,
      marginPerDay: 15738,
      escalationLevel: 1,
      workflowStatus: 'Not Sent',
      backupOwner: 'Chris Davis',
      backupRole: 'Sales Manager',
      slaWindow: 2,
      delayProbability: 0.10,
      avgMarginPerCase: 15738,
      assetValue: 78000,
      location: 'Johns Hopkins Hospital',
    },
  ];

  // Sort by margin per day descending
  return actions.sort((a, b) => b.marginPerDay - a.marginPerDay);
};

const WhoMustActNow = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState(null);

  // Fetch data
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateActionData());
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (params) => {
    setSelectedAction(params.row);
  };

  const handleBackToList = () => {
    setSelectedAction(null);
  };

  // Summary stats
  const summaryStats = {
    openActions: data.length,
    critical: data.filter(a => a.daysOverdue > 7).length,
    warning: data.filter(a => a.daysOverdue > 3 && a.daysOverdue <= 7).length,
    totalRevenue: data.reduce((sum, a) => sum + a.revenueAtRisk, 0),
    totalMargin: data.reduce((sum, a) => sum + a.marginPerDay, 0),
    escalated: data.filter(a => a.escalationLevel >= 2).length,
  };

  // Get owner type chip style
  const getOwnerChipProps = (ownerType) => {
    const ownerKey = ownerType.toLowerCase().replace(' ', '-');
    return traxxTheme.chips.ownerTypes[ownerKey] || traxxTheme.chips.primary;
  };

  // Get escalation chip style
  const getEscalationChipProps = (level) => {
    return traxxTheme.chips.escalation[level] || traxxTheme.chips.escalation[1];
  };

  // Get action type color
  const getActionTypeColor = (type) => {
    switch (type) {
      case 'urgent': return '#ef4444';
      case 'billing': return '#ec4899';
      case 'logistics': return '#a855f7';
      default: return '#f97316';
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: 'kitId',
      headerName: 'Kit ID',
      minWidth: 130,
      flex: 0.9,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: '#0891b2', fontSize: '0.85rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'kitType',
      headerName: 'Type',
      minWidth: 110,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const typeKey = params.value.toLowerCase();
        const styles = traxxTheme.chips.kitTypes[typeKey] || traxxTheme.chips.primary;
        return <Chip label={params.value} size="small" sx={styles} />;
      },
    },
    {
      field: 'currentStatus',
      headerName: 'Status',
      minWidth: 120,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const statusKey = params.value.toLowerCase().replace(' ', '-');
        const styles = traxxTheme.chips.kitStatus[statusKey] || traxxTheme.chips.status.info;
        return <Chip label={params.value} size="small" sx={styles} />;
      },
    },
    {
      field: 'daysOverdue',
      headerName: 'Days Over',
      minWidth: 100,
      flex: 0.6,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const days = params.value;
        const color = days > 7 ? '#dc2626' : days > 3 ? '#d97706' : '#059669';
        return (
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color }}>
            {days > 0 ? `+${days}` : '—'}
          </Typography>
        );
      },
    },
    {
      field: 'requiredAction',
      headerName: 'Required Action',
      minWidth: 170,
      flex: 1.2,
      renderCell: (params) => {
        const color = getActionTypeColor(params.row.actionType);
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              bgcolor: alpha(color, 0.12),
              color: color,
              border: '1px solid',
              borderColor: alpha(color, 0.3),
              fontWeight: 600,
            }}
          />
        );
      },
    },
    {
      field: 'ownerType',
      headerName: 'Owner Type',
      minWidth: 120,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={getOwnerChipProps(params.value)} />
      ),
    },
    {
      field: 'organization',
      headerName: 'Organization',
      minWidth: 160,
      flex: 1.1,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }} noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'accountablePerson',
      headerName: 'Accountable',
      minWidth: 130,
      flex: 0.9,
      renderCell: (params) => (
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#1e293b' }}>
            {params.value}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
            <PhoneIcon sx={{ fontSize: 12, color: '#64748b' }} />
            <EmailIcon sx={{ fontSize: 12, color: '#64748b' }} />
          </Stack>
        </Box>
      ),
    },
    {
      field: 'revenueAtRisk',
      headerName: 'Revenue Risk',
      minWidth: 110,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#dc2626' }}>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'marginPerDay',
      headerName: 'Margin/Day',
      minWidth: 110,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#ec4899' }}>
          {formatCurrency(params.value)}/d
        </Typography>
      ),
    },
    {
      field: 'escalationLevel',
      headerName: 'Escalation',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const levelText = params.value === 1 ? 'Rep' : params.value === 2 ? 'Manager' : params.value === 3 ? 'Ops' : 'Exec';
        return (
          <Chip label={`L${params.value} ${levelText}`} size="small" sx={getEscalationChipProps(params.value)} />
        );
      },
    },
    {
      field: 'workflowStatus',
      headerName: 'Workflow',
      minWidth: 120,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const status = params.value;
        const dotColor = status === 'Not Sent' ? '#64748b' : status === 'Sent' ? '#f59e0b' : status === 'Acknowledged' ? '#06b6d4' : '#10b981';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#475569' }}>{status}</Typography>
          </Box>
        );
      },
    },
  ];

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedAction) return null;

    const slaBreached = selectedAction.daysOverdue > selectedAction.slaWindow;
    const totalRisk = selectedAction.revenueAtRisk + (selectedAction.marginPerDay * selectedAction.daysOverdue) + (selectedAction.assetValue * selectedAction.delayProbability * 0.1);

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Action Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(239, 68, 68, 0.05) 100%)',
            borderBottom: '2px solid',
            borderColor: alpha('#f97316', 0.2),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton sx={{ bgcolor: alpha('#f97316', 0.1) }}>
                <AssignmentIcon sx={{ color: '#f97316' }} />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f97316' }}>
                  {selectedAction.kitId}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {selectedAction.requiredAction} • {selectedAction.organization}
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={selectedAction.kitType} size="small" sx={traxxTheme.chips.kitTypes[selectedAction.kitType.toLowerCase()] || traxxTheme.chips.primary} />
              <Chip
                label={`+${selectedAction.daysOverdue} DAYS`}
                size="small"
                sx={{
                  bgcolor: selectedAction.daysOverdue > 7 ? alpha('#ef4444', 0.12) : selectedAction.daysOverdue > 3 ? alpha('#f59e0b', 0.12) : alpha('#10b981', 0.12),
                  color: selectedAction.daysOverdue > 7 ? '#dc2626' : selectedAction.daysOverdue > 3 ? '#d97706' : '#059669',
                  fontWeight: 700,
                }}
              />
            </Stack>
          </Box>
        </Paper>

        {/* Detail Sections */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Kit Context */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <InventoryIcon sx={{ color: '#0891b2' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Kit Context
                  </Typography>
                  <Chip label="ERP" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                {[
                  { label: 'Kit ID', value: selectedAction.kitId, highlight: true },
                  { label: 'Serial Number', value: selectedAction.kitSerial },
                  { label: 'Kit Type', value: selectedAction.kitType },
                  { label: 'Current Status', value: selectedAction.currentStatus },
                  { label: 'Location', value: selectedAction.location },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.highlight ? '#0891b2' : '#1e293b', maxWidth: 140 }} noWrap>{item.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Accountability */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderColor: alpha('#f97316', 0.3), background: `linear-gradient(135deg, white 0%, ${alpha('#f97316', 0.03)} 100%)` }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <PersonIcon sx={{ color: '#f97316' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Accountability
                  </Typography>
                  <Chip label="CRM" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#f97316', 0.1), color: '#ea580c' }} />
                </Stack>
                {[
                  { label: 'Primary Owner', value: selectedAction.accountablePerson, highlight: true },
                  { label: 'Role', value: selectedAction.ownerType },
                  { label: 'Phone', value: selectedAction.phone, isLink: true },
                  { label: 'Email', value: selectedAction.email, isLink: true },
                  { label: 'Backup Owner', value: `${selectedAction.backupOwner} (${selectedAction.backupRole})` },
                  { label: 'SLA Window', value: `${selectedAction.slaWindow} days ${slaBreached ? '(BREACHED)' : ''}`, warning: slaBreached },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 5 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.highlight ? '#ea580c' : item.warning ? '#d97706' : item.isLink ? '#0891b2' : '#1e293b', maxWidth: 140 }} noWrap>{item.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Economic Impact */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderColor: alpha('#ef4444', 0.3), background: `linear-gradient(135deg, white 0%, ${alpha('#ef4444', 0.03)} 100%)` }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <MoneyIcon sx={{ color: '#ef4444' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Economic Impact
                  </Typography>
                  <Chip label="DERIVED" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#ef4444', 0.1), color: '#dc2626' }} />
                </Stack>
                {[
                  { label: 'Revenue at Risk', value: formatCurrency(selectedAction.revenueAtRisk), color: '#dc2626' },
                  { label: 'Avg Margin per Case', value: formatCurrency(selectedAction.avgMarginPerCase) },
                  { label: 'Delay Probability', value: `${Math.round(selectedAction.delayProbability * 100)}%`, color: '#d97706' },
                  { label: 'Margin Lost / Day', value: formatCurrency(selectedAction.marginPerDay), color: '#dc2626' },
                  { label: 'Asset at Risk', value: formatCurrency(selectedAction.assetValue) },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.color || '#1e293b' }}>{item.value}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, mt: 1, borderTop: '2px solid', borderColor: '#ef4444', bgcolor: alpha('#ef4444', 0.05), mx: -2, px: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#dc2626' }}>Total Risk Exposure</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626' }}>{formatCurrency(totalRisk)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
              Available Actions
            </Typography>
            <Grid container spacing={1.5}>
              {[
                { label: 'Call Owner', icon: <PhoneIcon />, color: '#10b981' },
                { label: 'Email Owner', icon: <EmailIcon />, color: '#06b6d4' },
                { label: 'Send SMS/WhatsApp', icon: <NotificationsIcon />, color: '#64748b' },
                { label: 'Escalate', icon: <TrendingUpIcon />, color: '#ef4444' },
                { label: 'Trigger Return', icon: <AssignmentIcon />, color: '#f97316', primary: true },
                { label: 'Trigger Replenishment', icon: <InventoryIcon />, color: '#64748b' },
                { label: 'Trigger Billing', icon: <MoneyIcon />, color: '#64748b' },
                { label: 'Mark Complete', icon: <ScheduleIcon />, color: '#10b981' },
              ].map((btn, idx) => (
                <Grid item xs={6} sm={3} key={idx}>
                  <Button
                    variant={btn.primary ? 'contained' : 'outlined'}
                    startIcon={btn.icon}
                    fullWidth
                    sx={{
                      py: 1.5,
                      bgcolor: btn.primary ? btn.color : 'transparent',
                      color: btn.primary ? 'white' : btn.color,
                      borderColor: btn.color,
                      '&:hover': {
                        bgcolor: btn.primary ? alpha(btn.color, 0.85) : alpha(btn.color, 0.1),
                        borderColor: btn.color,
                      },
                    }}
                  >
                    {btn.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Workflow History */}
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <AssignmentIcon sx={{ color: '#64748b' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                Workflow History
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {[
                { status: 'completed', title: 'Action Created', time: 'Nov 30, 2024 14:00', desc: 'Kit idle threshold exceeded (3 days)' },
                { status: 'completed', title: 'Initial Notification Sent', time: 'Dec 3, 2024 09:00', desc: 'Email sent to Sarah Chen (Distributor Rep)' },
                { status: 'completed', title: 'Escalation to Manager', time: 'Dec 7, 2024 09:00', desc: 'No response — escalated to Mike Torres' },
                { status: 'pending', title: 'Ops Escalation Pending', time: 'Dec 14, 2024 (Today)', desc: 'Will escalate to Operations if unresolved' },
              ].map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 2, py: 1.5, borderBottom: idx < 3 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', mt: 0.5, bgcolor: item.status === 'completed' ? '#10b981' : item.status === 'pending' ? '#f59e0b' : '#64748b', flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{item.title}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>{item.time}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#475569', mt: 0.5 }}>{item.desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // Main render
  return (
    <Box sx={{ p: 3, height: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'auto', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
              TRAXX.AI
            </Link>
            {selectedAction ? (
              <>
                <Link component="button" variant="body1" onClick={() => setSelectedAction(null)} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
                  Who Must Act Now
                </Link>
                <Typography color="primary" variant="body1" fontWeight={600}>
                  {selectedAction.kitId}
                </Typography>
              </>
            ) : (
              <Typography color="primary" variant="body1" fontWeight={600}>
                Who Must Act Now
              </Typography>
            )}
          </Breadcrumbs>
          <Stack direction="row" spacing={1}>
            {!selectedAction && (
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

        {/* Urgency Banner - Only show in list view */}
        {!selectedAction && (
          <Box sx={{
            background: `linear-gradient(135deg, ${alpha('#ef4444', 0.12)} 0%, ${alpha('#f97316', 0.12)} 100%)`,
            border: '1px solid',
            borderColor: '#ef4444',
            borderRadius: 2,
            p: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography sx={{ fontSize: 32 }}>🚨</Typography>
              <Box>
                <Typography sx={{ fontWeight: 600, color: '#dc2626' }}>IMMEDIATE ACTION REQUIRED</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {summaryStats.critical + summaryStats.warning} items need action in the next 24 hours — {summaryStats.escalated} already escalated
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#dc2626', fontFamily: 'monospace' }}>
                {formatCurrency(summaryStats.totalMargin)}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Total Margin at Risk / Day</Typography>
            </Box>
          </Box>
        )}

        {/* Summary Cards - Only show in list view */}
        {!selectedAction && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Open Actions', value: summaryStats.openActions, sub: 'Require immediate attention', color: '#f97316', icon: <AssignmentIcon /> },
              { label: 'Critical (>7 days)', value: summaryStats.critical, sub: 'Highest priority', color: '#ef4444', icon: <ErrorIcon /> },
              { label: 'Warning (3-7 days)', value: summaryStats.warning, sub: 'Escalation pending', color: '#f59e0b', icon: <WarningIcon /> },
              { label: 'Revenue at Risk', value: formatCurrency(summaryStats.totalRevenue), sub: 'Delayed or pending', color: '#ec4899', icon: <MoneyIcon /> },
              { label: 'Margin Erosion', value: formatCurrency(summaryStats.totalMargin), sub: 'Per day if unresolved', color: '#a855f7', icon: <TrendingUpIcon /> },
            ].map((stat, idx) => (
              <Grid item xs={6} sm={4} md={2.4} key={idx}>
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
      {selectedAction ? (
        renderDetailView()
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.2), background: `linear-gradient(90deg, ${alpha('#f97316', 0.05)}, ${alpha('#64748b', 0.02)})` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                Action Queue — <Typography component="span" sx={{ color: '#ea580c' }}>Sorted by Margin at Risk / Day</Typography>
              </Typography>
              <Chip label="ERP | CRM | SMADE | WORKFLOW" size="small" sx={{ fontSize: '0.6rem', bgcolor: alpha('#f97316', 0.1), color: '#ea580c' }} />
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

export default WhoMustActNow;
