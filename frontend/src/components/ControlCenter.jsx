import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Grid,
  alpha,
} from '@mui/material';
import {
  Monitor as MonitorIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  AccountCircle as PersonaIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CloudQueue as CloudIcon,
} from '@mui/icons-material';

// Import the components
import SystemHealthMonitoring from './controlcenter/SystemHealthMonitoring';
import DataSourcesConnections from './controlcenter/DataSourcesConnections';
import PlatformSettings from './controlcenter/PlatformSettings';
import UserProfileManager from './UserProfileManager';
import CommsConfig from './CommsConfig';

const ControlCenter = ({ apiHealth, onRefreshStatus }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: 'Data Sources',
      description: 'Database & API connections',
      icon: <StorageIcon />,
      component: <DataSourcesConnections />,
      status: 'healthy',
      badge: '9 Active',
      color: '#0078d4',
    },
    {
      label: 'System Health',
      description: 'Performance monitoring',
      icon: <MonitorIcon />,
      component: <SystemHealthMonitoring />,
      status: 'healthy',
      badge: '99.9%',
      color: '#106ebe',
    },
    {
      label: 'Settings',
      description: 'Platform configuration',
      icon: <SettingsIcon />,
      component: <PlatformSettings />,
      status: 'healthy',
      badge: 'Config',
      color: '#354a5f',
    },
    {
      label: 'AI Persona',
      description: 'User profile & preferences',
      icon: <PersonaIcon />,
      component: <UserProfileManager />,
      status: 'healthy',
      badge: 'Profile',
      color: '#475569',
    },
    {
      label: 'COMMS Config',
      description: 'Email & notifications',
      icon: <EmailIcon />,
      component: <CommsConfig />,
      status: 'healthy',
      badge: 'Comms',
      color: '#64748b',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'building': return '#94a3b8';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon sx={{ fontSize: 14 }} />;
      case 'warning': return <WarningIcon sx={{ fontSize: 14 }} />;
      case 'error': return <ErrorIcon sx={{ fontSize: 14 }} />;
      default: return null;
    }
  };

  // Summary stats
  const summaryStats = [
    { label: 'Services Online', value: '12', icon: <CloudIcon />, color: '#10b981' },
    { label: 'API Latency', value: '45ms', icon: <SpeedIcon />, color: '#0078d4' },
    { label: 'Uptime', value: '99.9%', icon: <MonitorIcon />, color: '#106ebe' },
    { label: 'Security', value: 'Secure', icon: <SecurityIcon />, color: '#354a5f' },
  ];

  return (
    <Box sx={{ minHeight: '100%', bgcolor: '#f8fbfd' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(10, 110, 209, 0.3)',
              }}
            >
              <SettingsIcon sx={{ fontSize: 28, color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#1e293b' }}>
                Control Center
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Centralized platform management and monitoring dashboard
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              size="small"
              icon={apiHealth?.status === 'healthy' ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <ErrorIcon sx={{ fontSize: 16 }} />}
              label={`API: ${apiHealth?.status || 'Unknown'}`}
              sx={{
                bgcolor: apiHealth?.status === 'healthy' ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                color: apiHealth?.status === 'healthy' ? '#10b981' : '#ef4444',
                border: `1px solid ${apiHealth?.status === 'healthy' ? alpha('#10b981', 0.3) : alpha('#ef4444', 0.3)}`,
                fontWeight: 600,
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
            <Chip
              size="small"
              icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
              label="DB: Connected"
              sx={{
                bgcolor: alpha('#10b981', 0.1),
                color: '#10b981',
                border: `1px solid ${alpha('#10b981', 0.3)}`,
                fontWeight: 600,
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
            <IconButton
              onClick={onRefreshStatus}
              size="small"
              sx={{
                bgcolor: alpha('#0078d4', 0.1),
                color: '#0078d4',
                '&:hover': { bgcolor: alpha('#0078d4', 0.2) },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {summaryStats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha('#0078d4', 0.1),
                background: '#fff',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, ${stat.color} 0%, ${alpha(stat.color, 0.5)} 100%)`,
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: alpha(stat.color, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tab Navigation - Tile Style */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {tabs.map((tab, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Paper
              elevation={0}
              onClick={() => !tab.disabled && setActiveTab(index)}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                border: '2px solid',
                borderColor: activeTab === index ? '#0078d4' : alpha('#0078d4', 0.1),
                background: activeTab === index
                  ? 'linear-gradient(135deg, rgba(10, 110, 209, 0.08) 0%, rgba(8, 84, 160, 0.04) 100%)'
                  : '#fff',
                opacity: tab.disabled ? 0.5 : 1,
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': !tab.disabled && {
                  borderColor: '#0078d4',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(10, 110, 209, 0.15)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: activeTab === index
                    ? `linear-gradient(90deg, ${tab.color} 0%, ${alpha(tab.color, 0.5)} 100%)`
                    : 'transparent',
                },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    bgcolor: activeTab === index ? alpha(tab.color, 0.15) : alpha('#64748b', 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: activeTab === index ? tab.color : '#64748b',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {React.cloneElement(tab.icon, { sx: { fontSize: 22 } })}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{
                        color: activeTab === index ? '#1e293b' : '#475569',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {tab.label}
                    </Typography>
                    <Box sx={{ color: getStatusColor(tab.status) }}>
                      {getStatusIcon(tab.status)}
                    </Box>
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#94a3b8',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {tab.description}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ mt: 1.5 }}>
                <Chip
                  label={tab.badge}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: activeTab === index ? alpha(tab.color, 0.12) : alpha('#64748b', 0.08),
                    color: activeTab === index ? tab.color : '#64748b',
                    border: 'none',
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tab Content */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: alpha('#0078d4', 0.1),
          background: '#fff',
          minHeight: 400,
        }}
      >
        {tabs[activeTab].component}
      </Paper>
    </Box>
  );
};

export default ControlCenter;
