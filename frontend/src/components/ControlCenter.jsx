import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Stack,
  Chip,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Monitor as MonitorIcon,
  Storage as StorageIcon,
  Cached as CachedIcon,
  QueryStats as QueryStatsIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  Hub as HubIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

// Import the new components
import SystemHealthMonitoring from './controlcenter/SystemHealthMonitoring';
import DataSourcesConnections from './controlcenter/DataSourcesConnections';
import CacheManagement from './controlcenter/CacheManagement';
import QueryIntelligence from './controlcenter/QueryIntelligence';
import ConfigurationSettings from './controlcenter/ConfigurationSettings';
import AutomationScheduling from './controlcenter/AutomationScheduling';

const ControlCenter = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: 'System Health',
      icon: <MonitorIcon />,
      component: <SystemHealthMonitoring />,
      status: 'healthy',
      badge: '99.9%',
    },
    {
      label: 'Data Sources',
      icon: <StorageIcon />,
      component: <DataSourcesConnections />,
      status: 'healthy',
      badge: '9 Active',
    },
    {
      label: 'Cache Management',
      icon: <CachedIcon />,
      component: <CacheManagement />,
      status: 'healthy',
      badge: '84.5%',
    },
    {
      label: 'Query Intelligence',
      icon: <QueryStatsIcon />,
      component: <QueryIntelligence />,
      status: 'healthy',
      badge: '1.2K Queries',
    },
    {
      label: 'Configuration',
      icon: <SettingsIcon />,
      component: <ConfigurationSettings />,
      status: 'healthy',
      badge: '24 Settings',
    },
    {
      label: 'Automation',
      icon: <ScheduleIcon />,
      component: <AutomationScheduling />,
      status: 'healthy',
      badge: '5 Active Jobs',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      case 'building': return theme.palette.grey[400];
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      case 'warning': return <WarningIcon sx={{ fontSize: 16 }} />;
      case 'building': return <HubIcon sx={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Control Center
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Centralized platform management and monitoring dashboard
        </Typography>
      </Box>

      {/* Tab Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 72,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              px: 3,
            },
            '& .MuiTabs-indicator': {
              height: 3,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: alpha(getStatusColor(tab.status), 0.1),
                      color: getStatusColor(tab.status),
                    }}
                  >
                    {tab.icon}
                  </Avatar>
                  <Box sx={{ textAlign: 'left' }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        {tab.label}
                      </Typography>
                      {getStatusIcon(tab.status)}
                    </Stack>
                    <Chip
                      label={tab.badge}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor: alpha(getStatusColor(tab.status), 0.1),
                        color: getStatusColor(tab.status),
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Stack>
              }
              iconPosition="start"
              disabled={tab.status === 'building'}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {tabs[activeTab].component}
      </Box>
    </Box>
  );
};

export default ControlCenter;