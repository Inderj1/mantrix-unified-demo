import React from 'react';
import { Box, Typography, Stack, Chip, IconButton, LinearProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function TruckDetailsPanel({ truck, alerts = [], onClose }) {
  // Calculate truck metrics
  const cargoPercentage = Math.round((truck.cargo_loaded / truck.cargo_capacity) * 100);
  const fuelPercentage = Math.round(truck.fuel_level);

  // Find related alerts for this truck
  const truckAlerts = alerts.filter(alert =>
    alert.title?.includes(truck.truck_id) ||
    alert.message?.includes(truck.truck_id)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-transit': return { bg: alpha('#0284c7', 0.12), text: '#0284c7' };
      case 'delayed': return { bg: alpha('#f97316', 0.12), text: '#f97316' };
      case 'delivered': return { bg: alpha('#10b981', 0.12), text: '#10b981' };
      case 'idle': return { bg: alpha('#64748b', 0.12), text: '#64748b' };
      case 'maintenance': return { bg: alpha('#ef4444', 0.12), text: '#ef4444' };
      default: return { bg: alpha('#64748b', 0.12), text: '#64748b' };
    }
  };

  const statusColors = getStatusColor(truck.status);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 64,
        right: 296,
        width: 380,
        bgcolor: 'white',
        border: '1px solid',
        borderColor: alpha('#64748b', 0.2),
        borderRadius: 2,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        zIndex: 1600,
        maxHeight: 'calc(100vh - 100px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.15), bgcolor: '#f8fafc' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: statusColors.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LocalShippingIcon sx={{ fontSize: 24, color: statusColors.text }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                {truck.truck_id}
              </Typography>
              <Chip
                label={truck.status.toUpperCase()}
                size="small"
                sx={{ height: 20, fontSize: '0.6rem', fontWeight: 700, bgcolor: statusColors.bg, color: statusColors.text }}
              />
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
        {truck.destination_name && (
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 1 }}>
            Destination: <span style={{ color: '#0891b2', fontWeight: 600 }}>{truck.destination_name}</span>
          </Typography>
        )}
      </Box>

      {/* Content */}
      <Box sx={{
        p: 2,
        overflow: 'auto',
        flex: 1,
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'transparent', borderRadius: 3 },
        '&:hover::-webkit-scrollbar-thumb': { background: 'rgba(100, 116, 139, 0.3)' },
        scrollbarWidth: 'thin',
        scrollbarColor: 'transparent transparent',
        '&:hover': { scrollbarColor: 'rgba(100, 116, 139, 0.3) transparent' },
      }}>
        <Stack spacing={2}>
          {/* Key Metrics */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 1.5 }}>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
                <SpeedIcon sx={{ fontSize: 14, color: '#0891b2' }} />
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>Speed</Typography>
              </Stack>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#0891b2' }}>{truck.speed} mph</Typography>
            </Box>
            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 1.5 }}>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
                <LocalGasStationIcon sx={{ fontSize: 14, color: fuelPercentage < 30 ? '#ef4444' : '#10b981' }} />
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>Fuel</Typography>
              </Stack>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: fuelPercentage < 30 ? '#ef4444' : '#10b981' }}>
                {fuelPercentage}%
              </Typography>
            </Box>
          </Box>

          {/* Cargo Information */}
          <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', mb: 1.5 }}>
              Cargo Information
            </Typography>
            <Box sx={{ mb: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Capacity Utilization</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0891b2' }}>{cargoPercentage}%</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={cargoPercentage}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: alpha('#64748b', 0.15),
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #0891b2, #22d3ee)',
                    borderRadius: 5,
                  },
                }}
              />
            </Box>
            <Stack direction="row" spacing={3}>
              <Box>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>Loaded</Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{truck.cargo_loaded} units</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>Capacity</Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{truck.cargo_capacity} units</Typography>
              </Box>
            </Stack>
          </Box>

          {/* Fuel Status */}
          <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', mb: 1.5 }}>
              Fuel Status
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Fuel Level</Typography>
                <Typography sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: fuelPercentage < 20 ? '#ef4444' : fuelPercentage < 40 ? '#f97316' : '#10b981'
                }}>
                  {fuelPercentage}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={fuelPercentage}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: alpha('#64748b', 0.15),
                  '& .MuiLinearProgress-bar': {
                    background: fuelPercentage < 20
                      ? 'linear-gradient(90deg, #ef4444, #f87171)'
                      : fuelPercentage < 40
                        ? 'linear-gradient(90deg, #f97316, #fb923c)'
                        : 'linear-gradient(90deg, #10b981, #34d399)',
                    borderRadius: 5,
                  },
                }}
              />
            </Box>
            {fuelPercentage < 30 && (
              <Box sx={{
                mt: 1.5,
                px: 1.5,
                py: 1,
                bgcolor: alpha('#f97316', 0.1),
                border: '1px solid',
                borderColor: alpha('#f97316', 0.3),
                borderRadius: 1,
              }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <WarningAmberIcon sx={{ fontSize: 14, color: '#f97316' }} />
                  <Typography sx={{ fontSize: '0.7rem', color: '#9a3412' }}>Low fuel - Consider refueling soon</Typography>
                </Stack>
              </Box>
            )}
          </Box>

          {/* Location */}
          <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.5 }}>
              <LocationOnIcon sx={{ fontSize: 16, color: '#0284c7' }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>Current Location</Typography>
            </Stack>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Latitude:</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#1e293b', fontFamily: 'monospace' }}>
                  {truck.latitude.toFixed(4)}°
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Longitude:</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#1e293b', fontFamily: 'monospace' }}>
                  {truck.longitude.toFixed(4)}°
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Related Alerts */}
          {truckAlerts.length > 0 && (
            <Box sx={{
              bgcolor: alpha('#f97316', 0.08),
              border: '1px solid',
              borderColor: alpha('#f97316', 0.25),
              borderRadius: 1.5,
              p: 2,
            }}>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.5 }}>
                <WarningAmberIcon sx={{ fontSize: 16, color: '#f97316' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#9a3412' }}>
                  Active Alerts ({truckAlerts.length})
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {truckAlerts.slice(0, 3).map((alert, idx) => (
                  <Box key={idx} sx={{ bgcolor: 'white', borderRadius: 1, p: 1.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9a3412', mb: 0.5 }}>{alert.title}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{alert.message}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Status-Specific Information */}
          {truck.status === 'delayed' && (
            <Box sx={{
              bgcolor: alpha('#f97316', 0.08),
              border: '1px solid',
              borderColor: alpha('#f97316', 0.25),
              borderRadius: 1.5,
              p: 2,
            }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#9a3412', mb: 1 }}>Delay Information</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#475569' }}>
                This truck is currently experiencing delays. Route optimization AI is analyzing alternative paths.
              </Typography>
            </Box>
          )}

          {truck.status === 'maintenance' && (
            <Box sx={{
              bgcolor: alpha('#ef4444', 0.08),
              border: '1px solid',
              borderColor: alpha('#ef4444', 0.25),
              borderRadius: 1.5,
              p: 2,
            }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', mb: 1 }}>Maintenance Required</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#475569' }}>
                This truck requires maintenance and is currently out of service.
              </Typography>
            </Box>
          )}

          {/* AI Analysis */}
          <Box sx={{
            bgcolor: alpha('#0284c7', 0.08),
            border: '1px solid',
            borderColor: alpha('#0284c7', 0.2),
            borderRadius: 1.5,
            p: 2,
          }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <SmartToyIcon sx={{ fontSize: 20, color: '#0284c7' }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>Route.AI</Typography>
                <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>Route Optimization</Typography>
              </Box>
              <Box sx={{ width: 8, height: 8, bgcolor: '#0284c7', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            </Stack>
            <Typography sx={{ fontSize: '0.7rem', color: '#475569' }}>
              {truck.status === 'in-transit' && 'Monitoring route efficiency and traffic conditions. All systems operating normally.'}
              {truck.status === 'delayed' && 'Analyzing traffic patterns and alternative routes. Solution proposal in progress.'}
              {truck.status === 'idle' && 'Truck is idle. Evaluating optimal next assignment based on current network demand.'}
              {truck.status === 'delivered' && 'Delivery completed successfully. Preparing next route assignment.'}
              {truck.status === 'maintenance' && 'Truck offline for maintenance. Rerouting scheduled deliveries to alternative vehicles.'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
