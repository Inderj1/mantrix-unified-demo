import React, { useState } from 'react';
import { Box, Typography, Stack, Chip, IconButton, TextField, InputAdornment, Tabs, Tab, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SensorsIcon from '@mui/icons-material/Sensors';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export default function LeftSidebar({ kits = [], facilities = [], alerts = [], onAlertClick, onKitClick }) {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredKits = kits.filter(kit =>
    kit.kit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.facility_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAlerts = alerts.filter(alert =>
    alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.kit_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      'in-transit': '#3b82f6',
      'at-facility': '#10b981',
      'in-surgery': '#8b5cf6',
      'awaiting-return': '#f97316',
      'at-dc': '#64748b',
    };
    return colors[status] || '#64748b';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#ef4444',
      warning: '#f97316',
      info: '#eab308',
    };
    return colors[severity] || '#f97316';
  };

  // Count kits by status
  const statusCounts = kits.reduce((acc, kit) => {
    acc[kit.status] = (acc[kit.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: 'white',
        borderRight: '1px solid',
        borderColor: alpha('#64748b', 0.15),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.1) }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <SensorsIcon sx={{ fontSize: 18, color: '#0a6ed1' }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>SMADE.IO Tracking</Typography>
        </Stack>

        {/* Search */}
        <TextField
          placeholder="Search kits, facilities..."
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '0.75rem',
              borderRadius: 1.5,
              bgcolor: alpha('#64748b', 0.05),
            },
          }}
        />
      </Box>

      {/* Status Summary */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.1) }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', mb: 1 }}>KIT STATUS</Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <Chip
              key={status}
              label={`${status.replace('-', ' ')} (${count})`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: alpha(getStatusColor(status), 0.1),
                color: getStatusColor(status),
                textTransform: 'capitalize',
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{
          minHeight: 36,
          borderBottom: '1px solid',
          borderColor: alpha('#64748b', 0.1),
          '& .MuiTab-root': {
            minHeight: 36,
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'none',
            px: 1,
          },
        }}
      >
        <Tab
          label={`Kits (${filteredKits.length})`}
          icon={<MedicalServicesIcon sx={{ fontSize: 14 }} />}
          iconPosition="start"
        />
        <Tab
          label={`Alerts (${filteredAlerts.length})`}
          icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
          iconPosition="start"
        />
      </Tabs>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {activeTab === 0 && (
          <Stack spacing={0.75}>
            {filteredKits.slice(0, 20).map((kit) => (
              <Box
                key={kit.id}
                onClick={() => onKitClick?.(kit)}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: alpha('#64748b', 0.03),
                  border: '1px solid',
                  borderColor: alpha('#64748b', 0.1),
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha('#0a6ed1', 0.05),
                    borderColor: alpha('#0a6ed1', 0.2),
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e293b' }}>
                    {kit.kit_type.slice(0, 25)}...
                  </Typography>
                  <Chip
                    label={kit.status.replace('-', ' ')}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      bgcolor: alpha(getStatusColor(kit.status), 0.15),
                      color: getStatusColor(kit.status),
                      textTransform: 'uppercase',
                    }}
                  />
                </Stack>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b', mb: 0.5 }}>
                  {kit.facility_name.slice(0, 30)}...
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={kit.process_type}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.55rem',
                      fontWeight: 600,
                      bgcolor: kit.process_type === 'loaner' ? alpha('#3b82f6', 0.1) : alpha('#8b5cf6', 0.1),
                      color: kit.process_type === 'loaner' ? '#3b82f6' : '#8b5cf6',
                    }}
                  />
                  <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>
                    IoT: {kit.battery_level}%
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        {activeTab === 1 && (
          <Stack spacing={0.75}>
            {filteredAlerts.map((alert) => (
              <Box
                key={alert.id}
                onClick={() => onAlertClick?.(alert)}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: alpha(getSeverityColor(alert.severity), 0.05),
                  border: '1px solid',
                  borderColor: alpha(getSeverityColor(alert.severity), 0.2),
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha(getSeverityColor(alert.severity), 0.1),
                  },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <WarningAmberIcon sx={{ fontSize: 16, color: getSeverityColor(alert.severity), mt: 0.25 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e293b', mb: 0.25 }}>
                      {alert.message}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>
                      {alert.kit_id} - {alert.region}
                    </Typography>
                  </Box>
                  <Chip
                    label={alert.severity}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      bgcolor: alpha(getSeverityColor(alert.severity), 0.15),
                      color: getSeverityColor(alert.severity),
                      textTransform: 'uppercase',
                    }}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
