import React, { useState } from 'react';
import { Box, Typography, Chip, Stack, LinearProgress, IconButton, Collapse } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import RouteIcon from '@mui/icons-material/Route';

export default function LeftSidebar({
  trucks = [],
  stores = [],
  alerts = [],
  aiActions = [],
  onAlertClick,
  onActionClick,
}) {
  const [activityCollapsed, setActivityCollapsed] = useState(false);

  // Calculate network health metrics
  const networkHealth = Math.max(60, 100 - (alerts.length * 3));
  const serviceLevel = Math.max(85, 100 - (alerts.filter(a => a.priority >= 7).length * 5));

  // Get critical alerts
  const criticalAlerts = alerts
    .filter(a => a.priority >= 7)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 10);

  // Get pending AI actions
  const pendingActions = aiActions.filter(a => a.status === 'pending-approval').slice(0, 5);

  const getAlertIcon = (alertType) => {
    if (alertType?.includes('weather')) return '🌧️';
    if (alertType?.includes('inventory')) return '📦';
    if (alertType?.includes('route')) return '🗺️';
    if (alertType?.includes('maintenance')) return '🔧';
    if (alertType?.includes('demand')) return '📈';
    return '⚠️';
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 280,
        bgcolor: 'white',
        borderRight: '1px solid',
        borderColor: alpha('#64748b', 0.2),
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.15), bgcolor: '#f8fafc' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Box sx={{ width: 8, height: 8, bgcolor: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>Network Health Monitor</Typography>
        </Stack>
        <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>
          Last Updated: {new Date().toLocaleTimeString()}
        </Typography>
      </Box>

      {/* Health Metrics */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.15), bgcolor: '#f8fafc' }}>
        <Stack spacing={1.5}>
          <HealthMetric label="Network Health" value={networkHealth} color="cyan" />
          <HealthMetric label="Service Level" value={serviceLevel} color="blue" />
        </Stack>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <WarningAmberIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Critical Alerts ({criticalAlerts.length})
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {criticalAlerts.map((alert) => (
                <Box
                  key={alert.id}
                  onClick={() => onAlertClick?.(alert)}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    borderLeft: '3px solid',
                    borderLeftColor: alert.priority >= 9 ? '#ef4444' : '#f97316',
                    bgcolor: alert.priority >= 9 ? alpha('#ef4444', 0.05) : alpha('#f97316', 0.05),
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha('#64748b', 0.1) },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Typography sx={{ fontSize: '0.9rem' }}>{getAlertIcon(alert.alert_type)}</Typography>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e293b', mb: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {alert.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {alert.message}
                      </Typography>
                      <Chip
                        label={`P${alert.priority}`}
                        size="small"
                        sx={{
                          mt: 0.5,
                          height: 16,
                          fontSize: '0.55rem',
                          fontWeight: 700,
                          bgcolor: alert.priority >= 9 ? alpha('#ef4444', 0.15) : alpha('#f97316', 0.15),
                          color: alert.priority >= 9 ? '#dc2626' : '#ea580c',
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* AI Action Queue */}
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            onClick={() => setActivityCollapsed(!activityCollapsed)}
            sx={{ mb: 1.5, cursor: 'pointer' }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 6, height: 6, bgcolor: '#3b82f6', borderRadius: '50%' }} />
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                AI Action Queue ({pendingActions.length})
              </Typography>
            </Stack>
            <IconButton size="small" sx={{ p: 0 }}>
              {activityCollapsed ? <ExpandMoreIcon sx={{ fontSize: 16 }} /> : <ExpandLessIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Stack>
          <Collapse in={!activityCollapsed}>
            <Stack spacing={1}>
              {pendingActions.map((action) => (
                <Box
                  key={action.id}
                  onClick={() => onActionClick?.(action)}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha('#3b82f6', 0.05),
                    borderLeft: '3px solid #3b82f6',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha('#3b82f6', 0.1) },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Typography sx={{ fontSize: '0.9rem' }}>
                      {action.action_type === 'transfer' ? '📦' : action.action_type === 'route' ? '🚛' : '⚡'}
                    </Typography>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e293b', mb: 0.25 }}>
                        {action.agent_name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {action.description}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        <Chip
                          label={`${action.confidence}% conf`}
                          size="small"
                          sx={{ height: 16, fontSize: '0.5rem', bgcolor: alpha('#10b981', 0.15), color: '#059669' }}
                        />
                        {action.cost_saved && (
                          <Chip
                            label={`$${action.cost_saved.toLocaleString()}`}
                            size="small"
                            sx={{ height: 16, fontSize: '0.5rem', bgcolor: alpha('#3b82f6', 0.15), color: '#2563eb' }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              ))}
              {pendingActions.length === 0 && (
                <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', py: 2 }}>
                  No pending actions
                </Typography>
              )}
            </Stack>
          </Collapse>
        </Box>
      </Box>

      {/* Footer Stats */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: alpha('#64748b', 0.15), bgcolor: '#f8fafc' }}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <StatItem icon={<LocalShippingIcon sx={{ fontSize: 14 }} />} label="Active Trucks" value={trucks.filter(t => t.status === 'in-transit').length} />
          <StatItem icon={<InventoryIcon sx={{ fontSize: 14 }} />} label="Low Stock" value={stores.filter(s => s.stock_level < 30).length} color="error" />
          <StatItem icon={<RouteIcon sx={{ fontSize: 14 }} />} label="Delayed" value={trucks.filter(t => t.status === 'delayed').length} color="warning" />
        </Stack>
      </Box>
    </Box>
  );
}

function HealthMetric({ label, value, color }) {
  const colors = {
    cyan: { text: '#0891b2', bg: alpha('#06b6d4', 0.15), bar: '#06b6d4' },
    blue: { text: '#2563eb', bg: alpha('#3b82f6', 0.15), bar: '#3b82f6' },
    orange: { text: '#ea580c', bg: alpha('#f97316', 0.15), bar: '#f97316' },
  };
  const c = colors[color] || colors.cyan;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{label}</Typography>
        <Chip
          label={`${value}%`}
          size="small"
          sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: c.bg, color: c.text }}
        />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 4,
          borderRadius: 2,
          bgcolor: alpha(c.bar, 0.2),
          '& .MuiLinearProgress-bar': { bgcolor: c.bar, borderRadius: 2 },
        }}
      />
    </Box>
  );
}

function StatItem({ icon, label, value, color = 'primary' }) {
  const colors = {
    primary: '#3b82f6',
    error: '#ef4444',
    warning: '#f97316',
  };

  return (
    <Stack alignItems="center" spacing={0.25}>
      <Box sx={{ color: colors[color] }}>{icon}</Box>
      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: colors[color] }}>{value}</Typography>
      <Typography sx={{ fontSize: '0.55rem', color: '#64748b', textAlign: 'center' }}>{label}</Typography>
    </Stack>
  );
}
