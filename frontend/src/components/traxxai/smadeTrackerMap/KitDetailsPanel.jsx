import React from 'react';
import { Box, Typography, Stack, Chip, IconButton, Divider, Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SensorsIcon from '@mui/icons-material/Sensors';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';

export default function KitDetailsPanel({ kit, alerts = [], onClose }) {
  if (!kit) return null;

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

  const relatedAlerts = alerts.filter((a) => a.kit_id === kit.id);

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
          background: 'linear-gradient(135deg, #0a6ed1 0%, #0854a0 100%)',
          color: 'white',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#fff', 0.2) }}>
              <MedicalServicesIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{kit.kit_type}</Typography>
              <Typography sx={{ fontSize: '0.65rem', opacity: 0.9 }}>{kit.id}</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {/* Status & Process Type */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={kit.status.replace('-', ' ')}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 700,
              bgcolor: alpha(getStatusColor(kit.status), 0.15),
              color: getStatusColor(kit.status),
              textTransform: 'capitalize',
            }}
          />
          <Chip
            label={kit.process_type}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 700,
              bgcolor: kit.process_type === 'loaner' ? alpha('#3b82f6', 0.15) : alpha('#8b5cf6', 0.15),
              color: kit.process_type === 'loaner' ? '#3b82f6' : '#8b5cf6',
              textTransform: 'uppercase',
            }}
          />
        </Stack>

        {/* Kit Info */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', mb: 1 }}>KIT DETAILS</Typography>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>System</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{kit.system}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Value</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>${kit.value.toLocaleString()}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Items</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{kit.item_count} items</Typography>
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Location */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', mb: 1 }}>LOCATION</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <LocalHospitalIcon sx={{ fontSize: 16, color: '#0a6ed1' }} />
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{kit.facility_name}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{kit.region} - {kit.state}</Typography>
            </Box>
          </Stack>
          <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Distributor: {kit.distributor_name}</Typography>
        </Box>

        {/* Surgery Info (if in surgery) */}
        {kit.surgeon && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', mb: 1 }}>SURGERY INFO</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <PersonIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{kit.surgeon}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <EventIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{kit.surgery_date}</Typography>
              </Stack>
            </Box>
          </>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* IoT Sensors */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
            <SensorsIcon sx={{ fontSize: 14, color: '#10b981' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>IoT SENSORS</Typography>
          </Stack>
          <Box sx={{ p: 1, bgcolor: alpha('#64748b', 0.05), borderRadius: 1 }}>
            <Typography sx={{ fontSize: '0.6rem', color: '#64748b', mb: 0.5 }}>Device: {kit.iot_device_id}</Typography>
            <Stack direction="row" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <BatteryFullIcon sx={{ fontSize: 14, color: kit.battery_level > 50 ? '#10b981' : '#f97316' }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e293b' }}>{kit.battery_level}%</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <ThermostatIcon sx={{ fontSize: 14, color: '#f97316' }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e293b' }}>{kit.temperature}°F</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <WaterDropIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e293b' }}>{kit.humidity}%</Typography>
              </Stack>
            </Stack>
            {kit.shock_detected && (
              <Chip
                label="Shock Event Detected!"
                size="small"
                sx={{
                  mt: 1,
                  height: 20,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  bgcolor: alpha('#ef4444', 0.15),
                  color: '#ef4444',
                }}
              />
            )}
          </Box>
          <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8', mt: 0.5 }}>
            Last scan: {new Date(kit.last_scan_time).toLocaleString()}
          </Typography>
        </Box>

        {/* Related Alerts */}
        {relatedAlerts.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', mb: 1 }}>RELATED ALERTS</Typography>
              <Stack spacing={0.5}>
                {relatedAlerts.map((alert) => (
                  <Box
                    key={alert.id}
                    sx={{
                      p: 0.75,
                      bgcolor: alpha('#f97316', 0.1),
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: alpha('#f97316', 0.2),
                    }}
                  >
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#c2410c' }}>{alert.message}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
