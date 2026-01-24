import React from 'react';
import { Box, Typography, Stack, Chip, IconButton, Divider, Avatar, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AlertDetailsPanel({ alert, onClose }) {
  if (!alert) return null;

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#ef4444',
      warning: '#f97316',
      info: '#eab308',
    };
    return colors[severity] || '#f97316';
  };

  const getAlertTypeInfo = (type) => {
    const info = {
      'kit-delay': { title: 'Kit Shipment Delay', action: 'Contact logistics team' },
      'low-battery': { title: 'IoT Device Battery Low', action: 'Schedule device service' },
      'temperature-alert': { title: 'Temperature Out of Range', action: 'Check biologics immediately' },
      'shock-detected': { title: 'Shock Event Detected', action: 'Inspect kit contents' },
      'return-overdue': { title: 'Kit Return Overdue', action: 'Schedule pickup' },
      'missing-scan': { title: 'Missing IoT Scan', action: 'Verify kit location' },
    };
    return info[type] || { title: 'Alert', action: 'Review and resolve' };
  };

  const alertInfo = getAlertTypeInfo(alert.type);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 48,
        right: 280,
        width: 320,
        maxHeight: 'calc(100% - 148px)',
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        m: 1,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          background: `linear-gradient(135deg, ${getSeverityColor(alert.severity)} 0%, ${alpha(getSeverityColor(alert.severity), 0.8)} 100%)`,
          color: 'white',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#fff', 0.2) }}>
              <WarningAmberIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{alertInfo.title}</Typography>
              <Typography sx={{ fontSize: '0.65rem', opacity: 0.9 }}>{alert.id}</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {/* Severity & Status */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={alert.severity}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 700,
              bgcolor: alpha(getSeverityColor(alert.severity), 0.15),
              color: getSeverityColor(alert.severity),
              textTransform: 'uppercase',
            }}
          />
          <Chip
            label={alert.status}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: alpha('#64748b', 0.1),
              color: '#64748b',
              textTransform: 'capitalize',
            }}
          />
        </Stack>

        {/* Alert Message */}
        <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(getSeverityColor(alert.severity), 0.05), borderRadius: 1, border: '1px solid', borderColor: alpha(getSeverityColor(alert.severity), 0.2) }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
            {alert.message}
          </Typography>
        </Box>

        {/* Details */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', mb: 1 }}>ALERT DETAILS</Typography>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Kit ID</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{alert.kit_id}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Facility</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{alert.facility_name}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Region</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{alert.region}</Typography>
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Timeline */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', mb: 1 }}>TIMELINE</Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 14, color: '#64748b' }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
              Created: {new Date(alert.created_at).toLocaleString()}
            </Typography>
          </Stack>
        </Box>

        {/* Assignment */}
        {alert.assigned_to && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', mb: 1 }}>ASSIGNED TO</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: alpha('#00357a', 0.15) }}>
                  <PersonIcon sx={{ fontSize: 14, color: '#00357a' }} />
                </Avatar>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{alert.assigned_to}</Typography>
              </Stack>
            </Box>
          </>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Recommended Action */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', mb: 1 }}>RECOMMENDED ACTION</Typography>
          <Box sx={{ p: 1, bgcolor: alpha('#10b981', 0.05), borderRadius: 1, border: '1px solid', borderColor: alpha('#10b981', 0.2) }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#059669', fontWeight: 500 }}>
              {alertInfo.action}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            fullWidth
            sx={{
              height: 36,
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: '#10b981',
              '&:hover': { bgcolor: '#059669' },
            }}
          >
            Resolve Alert
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
