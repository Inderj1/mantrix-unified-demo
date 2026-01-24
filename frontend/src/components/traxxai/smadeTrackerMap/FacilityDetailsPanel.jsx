import React from 'react';
import { Box, Typography, Stack, Chip, IconButton, Divider, Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EventIcon from '@mui/icons-material/Event';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export default function FacilityDetailsPanel({ facility, alerts = [], kits = [], onClose }) {
  if (!facility) return null;

  const facilityKits = kits.filter((k) => k.facility_id === facility.id);
  const facilityAlerts = alerts.filter((a) => a.facility_name === facility.name);

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
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#fff', 0.2) }}>
              <LocalHospitalIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{facility.name}</Typography>
              <Typography sx={{ fontSize: '0.65rem', opacity: 0.9 }}>{facility.type}</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {/* Status */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={facility.status === 'active' ? 'Active' : 'Needs Attention'}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 700,
              bgcolor: facility.status === 'active' ? alpha('#10b981', 0.15) : alpha('#f97316', 0.15),
              color: facility.status === 'active' ? '#10b981' : '#f97316',
            }}
          />
          <Chip
            label={facility.region}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: alpha('#00357a', 0.1),
              color: '#00357a',
            }}
          />
        </Stack>

        {/* Stats */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', mb: 1 }}>FACILITY STATS</Typography>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <MedicalServicesIcon sx={{ fontSize: 14, color: '#00357a' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Kits On-Site</Typography>
              </Stack>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#00357a' }}>{facility.kits_on_site}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <EventIcon sx={{ fontSize: 14, color: '#8b5cf6' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Pending Surgeries</Typography>
              </Stack>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{facility.pending_surgeries}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <AttachMoneyIcon sx={{ fontSize: 14, color: '#10b981' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Revenue (YTD)</Typography>
              </Stack>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>${facility.revenue?.toLocaleString()}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Total Cases</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{facility.cases}</Typography>
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Kits at Facility */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', mb: 1 }}>KITS AT FACILITY ({facilityKits.length})</Typography>
          {facilityKits.length > 0 ? (
            <Stack spacing={0.5}>
              {facilityKits.slice(0, 5).map((kit) => (
                <Box
                  key={kit.id}
                  sx={{
                    p: 0.75,
                    bgcolor: alpha('#64748b', 0.05),
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: alpha('#64748b', 0.1),
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e293b' }}>
                      {kit.kit_type.slice(0, 20)}...
                    </Typography>
                    <Chip
                      label={kit.status.replace('-', ' ')}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        bgcolor: alpha('#00357a', 0.1),
                        color: '#00357a',
                        textTransform: 'capitalize',
                      }}
                    />
                  </Stack>
                </Box>
              ))}
              {facilityKits.length > 5 && (
                <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center' }}>
                  +{facilityKits.length - 5} more kits
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>No kits currently at this facility</Typography>
          )}
        </Box>

        {/* Alerts */}
        {facilityAlerts.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', mb: 1 }}>ACTIVE ALERTS</Typography>
              <Stack spacing={0.5}>
                {facilityAlerts.map((alert) => (
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
                    <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8' }}>{alert.kit_id}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </>
        )}

        {/* Last Activity */}
        <Box sx={{ mt: 2, p: 1, bgcolor: alpha('#64748b', 0.03), borderRadius: 1 }}>
          <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>
            Last Activity: {new Date(facility.last_activity).toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
