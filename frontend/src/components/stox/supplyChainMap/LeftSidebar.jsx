import React, { useState } from 'react';
import { Box, Typography, Chip, Stack, LinearProgress, IconButton, Collapse } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import RouteIcon from '@mui/icons-material/Route';
import CloudIcon from '@mui/icons-material/Cloud';
import BuildIcon from '@mui/icons-material/Build';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BoltIcon from '@mui/icons-material/Bolt';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
    if (alertType?.includes('weather')) return <CloudIcon sx={{ fontSize: 16, color: '#64748b' }} />;
    if (alertType?.includes('inventory')) return <InventoryIcon sx={{ fontSize: 16, color: '#64748b' }} />;
    if (alertType?.includes('route')) return <RouteIcon sx={{ fontSize: 16, color: '#64748b' }} />;
    if (alertType?.includes('maintenance')) return <BuildIcon sx={{ fontSize: 16, color: '#64748b' }} />;
    if (alertType?.includes('demand')) return <TrendingUpIcon sx={{ fontSize: 16, color: '#64748b' }} />;
    return <WarningAmberIcon sx={{ fontSize: 16, color: '#64748b' }} />;
  };

  const getActionIcon = (actionType) => {
    if (actionType === 'transfer') return <SwapHorizIcon sx={{ fontSize: 16, color: '#0284c7' }} />;
    if (actionType === 'route') return <LocalShippingIcon sx={{ fontSize: 16, color: '#0284c7' }} />;
    return <BoltIcon sx={{ fontSize: 16, color: '#0284c7' }} />;
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
        borderColor: alpha('#64748b', 0.15),
        boxShadow: '4px 0 16px rgba(0, 0, 0, 0.04)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: alpha('#64748b', 0.15),
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          <Box sx={{
            p: 0.75,
            borderRadius: 1,
            background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <SpeedIcon sx={{ fontSize: 16, color: 'white' }} />
          </Box>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Network Health</Typography>
          <Box sx={{
            width: 8,
            height: 8,
            bgcolor: '#10b981',
            borderRadius: '50%',
            ml: 'auto',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
          }} />
        </Stack>
        <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>
          Updated: {new Date().toLocaleTimeString()}
        </Typography>
      </Box>

      {/* Health Metrics */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
        <Stack spacing={1.5}>
          <HealthMetric label="Network Health" value={networkHealth} color="cyan" />
          <HealthMetric label="Service Level" value={serviceLevel} color="blue" />
        </Stack>
      </Box>

      {/* Scrollable Content */}
      <Box
        className="scrollbar-hover"
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'transparent', borderRadius: 3 },
          '&:hover::-webkit-scrollbar-thumb': { background: 'rgba(100, 116, 139, 0.3)' },
          scrollbarWidth: 'thin',
          scrollbarColor: 'transparent transparent',
          '&:hover': { scrollbarColor: 'rgba(100, 116, 139, 0.3) transparent' },
        }}
      >
        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <WarningAmberIcon sx={{ fontSize: 14, color: '#d97706' }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#0078d4', textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
                    border: '1px solid',
                    borderColor: alert.priority >= 9 ? alpha('#ef4444', 0.3) : alpha('#f97316', 0.3),
                    bgcolor: alert.priority >= 9 ? alpha('#ef4444', 0.06) : alpha('#f97316', 0.06),
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: alert.priority >= 9 ? alpha('#ef4444', 0.1) : alpha('#f97316', 0.1),
                      borderColor: alert.priority >= 9 ? alpha('#ef4444', 0.5) : alpha('#f97316', 0.5),
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{
                      p: 0.5,
                      borderRadius: 0.5,
                      bgcolor: alpha('#64748b', 0.08),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {getAlertIcon(alert.alert_type)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', mb: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {alert.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {alert.message}
                      </Typography>
                      <Chip
                        label={`Priority ${alert.priority}`}
                        size="small"
                        sx={{
                          mt: 0.75,
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          bgcolor: alert.priority >= 9 ? alpha('#ef4444', 0.12) : alpha('#f97316', 0.12),
                          color: alert.priority >= 9 ? '#dc2626' : '#ea580c',
                          border: '1px solid',
                          borderColor: alert.priority >= 9 ? alpha('#ef4444', 0.2) : alpha('#f97316', 0.2),
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
              <BoltIcon sx={{ fontSize: 14, color: '#0284c7' }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#0078d4', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                AI Actions ({pendingActions.length})
              </Typography>
            </Stack>
            <IconButton size="small" sx={{ p: 0 }}>
              {activityCollapsed ? <ExpandMoreIcon sx={{ fontSize: 16, color: '#64748b' }} /> : <ExpandLessIcon sx={{ fontSize: 16, color: '#64748b' }} />}
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
                    bgcolor: alpha('#0ea5e9', 0.06),
                    border: '1px solid',
                    borderColor: alpha('#0ea5e9', 0.2),
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: alpha('#0ea5e9', 0.1),
                      borderColor: alpha('#0ea5e9', 0.4),
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{
                      p: 0.5,
                      borderRadius: 0.5,
                      bgcolor: alpha('#0ea5e9', 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {getActionIcon(action.action_type)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', mb: 0.25 }}>
                        {action.agent_name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {action.description}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.75 }}>
                        <Chip
                          key="confidence"
                          label={`${action.confidence}%`}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            bgcolor: alpha('#10b981', 0.12),
                            color: '#059669',
                            border: '1px solid',
                            borderColor: alpha('#10b981', 0.2),
                          }}
                        />
                        {action.cost_saved && (
                          <Chip
                            key="cost"
                            label={`$${action.cost_saved.toLocaleString()}`}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.6rem',
                              fontWeight: 600,
                              bgcolor: alpha('#0ea5e9', 0.12),
                              color: '#0284c7',
                              border: '1px solid',
                              borderColor: alpha('#0ea5e9', 0.2),
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              ))}
              {pendingActions.length === 0 && (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 24, color: '#10b981', mb: 0.5 }} />
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                    No pending actions
                  </Typography>
                </Box>
              )}
            </Stack>
          </Collapse>
        </Box>
      </Box>

      {/* Footer Stats */}
      <Box sx={{
        p: 2,
        borderTop: '1px solid',
        borderColor: alpha('#64748b', 0.15),
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      }}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <StatItem icon={<LocalShippingIcon sx={{ fontSize: 16 }} />} label="Active" value={trucks.filter(t => t.status === 'in-transit').length} color="primary" />
          <StatItem icon={<InventoryIcon sx={{ fontSize: 16 }} />} label="Low Stock" value={stores.filter(s => s.stock_level < 30).length} color="error" />
          <StatItem icon={<RouteIcon sx={{ fontSize: 16 }} />} label="Delayed" value={trucks.filter(t => t.status === 'delayed').length} color="warning" />
        </Stack>
      </Box>
    </Box>
  );
}

function HealthMetric({ label, value, color }) {
  const colors = {
    cyan: { text: '#0891b2', bg: alpha('#06b6d4', 0.12), bar: '#06b6d4' },
    blue: { text: '#0284c7', bg: alpha('#0ea5e9', 0.12), bar: '#0ea5e9' },
    orange: { text: '#ea580c', bg: alpha('#f97316', 0.12), bar: '#f97316' },
  };
  const c = colors[color] || colors.cyan;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#0078d4' }}>{label}</Typography>
        <Chip
          label={`${value}%`}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.7rem',
            fontWeight: 700,
            bgcolor: c.bg,
            color: c.text,
            border: '1px solid',
            borderColor: alpha(c.bar, 0.2),
          }}
        />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: alpha(c.bar, 0.15),
          '& .MuiLinearProgress-bar': { bgcolor: c.bar, borderRadius: 3 },
        }}
      />
    </Box>
  );
}

function StatItem({ icon, label, value, color = 'primary' }) {
  const colors = {
    primary: { main: '#0284c7', bg: alpha('#0ea5e9', 0.1) },
    error: { main: '#dc2626', bg: alpha('#ef4444', 0.1) },
    warning: { main: '#d97706', bg: alpha('#f59e0b', 0.1) },
  };
  const c = colors[color];

  return (
    <Stack alignItems="center" spacing={0.5}>
      <Box sx={{
        color: c.main,
        p: 0.75,
        borderRadius: 1,
        bgcolor: c.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: c.main }}>{value}</Typography>
      <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textAlign: 'center' }}>{label}</Typography>
    </Stack>
  );
}
