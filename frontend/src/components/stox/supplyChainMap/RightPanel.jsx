import React from 'react';
import { Box, Typography, Chip, Stack, Button, Card, CardContent } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloudIcon from '@mui/icons-material/Cloud';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RouteIcon from '@mui/icons-material/Route';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BoltIcon from '@mui/icons-material/Bolt';
import SavingsIcon from '@mui/icons-material/Savings';
import SecurityIcon from '@mui/icons-material/Security';

export default function RightPanel({
  agents = [],
  actionsToday = 0,
  costSavedWeek = 0,
  issuesPrevented = 0,
}) {
  // Critical actions that need attention
  const criticalActions = [
    {
      id: '1',
      type: 'weather-alert',
      label: 'Weather Alert',
      description: 'Severe thunderstorms forecast for Tennessee - shipments may be affected',
      actionLabel: 'View Routes',
      timeAgo: '2 min ago',
      severity: 'error',
      icon: CloudIcon,
    },
    {
      id: '2',
      type: 'low-stock',
      label: 'Low Stock',
      description: 'Columbus DC at 45% capacity - RX Energy below reorder point',
      actionLabel: 'Request Transfer',
      timeAgo: '5 min ago',
      severity: 'warning',
      icon: InventoryIcon,
    },
    {
      id: '3',
      type: 'delay-risk',
      label: 'Delay Risk',
      description: 'AZ-TRK-002 experiencing delays on I-40 corridor',
      actionLabel: 'Reroute Options',
      timeAgo: '8 min ago',
      severity: 'info',
      icon: AccessTimeIcon,
    },
  ];

  // AI recommendations
  const recommendations = [
    {
      id: '1',
      category: 'Cost Optimization',
      description: 'Consolidate TRK-005 & TRK-007 routes',
      benefit: 'Save $1,200/week',
      icon: SavingsIcon,
      color: 'emerald',
    },
    {
      id: '2',
      category: 'Route Efficiency',
      description: 'Add Nashville stop to TRK-003 route',
      benefit: '+18% efficiency',
      icon: RouteIcon,
      color: 'blue',
    },
    {
      id: '3',
      category: 'Inventory Balance',
      description: 'Transfer 2,000 cases La Vergne → Columbus',
      benefit: 'Prevent stockout',
      icon: SwapHorizIcon,
      color: 'cyan',
    },
  ];

  const getSeverityColors = (severity) => {
    switch (severity) {
      case 'error': return { bg: alpha('#ef4444', 0.08), border: alpha('#ef4444', 0.25), text: '#dc2626', btn: '#ef4444', iconBg: alpha('#ef4444', 0.12) };
      case 'warning': return { bg: alpha('#f97316', 0.08), border: alpha('#f97316', 0.25), text: '#ea580c', btn: '#f97316', iconBg: alpha('#f97316', 0.12) };
      case 'info': return { bg: alpha('#f59e0b', 0.08), border: alpha('#f59e0b', 0.25), text: '#d97706', btn: '#f59e0b', iconBg: alpha('#f59e0b', 0.12) };
      default: return { bg: alpha('#64748b', 0.08), border: alpha('#64748b', 0.25), text: '#475569', btn: '#64748b', iconBg: alpha('#64748b', 0.12) };
    }
  };

  const getRecColor = (color) => {
    switch (color) {
      case 'emerald': return { main: '#059669', bg: alpha('#10b981', 0.1), border: alpha('#10b981', 0.2) };
      case 'blue': return { main: '#0284c7', bg: alpha('#0ea5e9', 0.1), border: alpha('#0ea5e9', 0.2) };
      case 'cyan': return { main: '#0891b2', bg: alpha('#06b6d4', 0.1), border: alpha('#06b6d4', 0.2) };
      default: return { main: '#475569', bg: alpha('#64748b', 0.1), border: alpha('#64748b', 0.2) };
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 280,
        bgcolor: 'white',
        borderLeft: '1px solid',
        borderColor: alpha('#64748b', 0.12),
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.15), bgcolor: '#f8fafc' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          <SmartToyIcon sx={{ fontSize: 18, color: '#0284c7' }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>AI Control Center</Typography>
        </Stack>
        <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>Intelligent Detection & Proposals</Typography>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Critical Actions */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <WarningAmberIcon sx={{ fontSize: 14, color: '#d97706' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Critical Actions
            </Typography>
          </Stack>
          <Stack spacing={1.5}>
            {criticalActions.map((action) => {
              const colors = getSeverityColors(action.severity);
              const IconComponent = action.icon;
              return (
                <Card
                  key={action.id}
                  sx={{
                    bgcolor: colors.bg,
                    border: '1px solid',
                    borderColor: colors.border,
                    boxShadow: 'none',
                    borderRadius: 1,
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ p: 0.5, borderRadius: 0.5, bgcolor: colors.iconBg, display: 'flex' }}>
                          <IconComponent sx={{ fontSize: 14, color: colors.text }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: colors.text, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                          {action.label}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8' }}>{action.timeAgo}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.75rem', color: '#1e293b', mb: 1.5, lineHeight: 1.4 }}>
                      {action.description}
                    </Typography>
                    <Button
                      fullWidth
                      size="small"
                      variant="contained"
                      sx={{
                        bgcolor: colors.btn,
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        py: 0.75,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: alpha(colors.btn, 0.9), boxShadow: 'none' },
                      }}
                    >
                      {action.actionLabel}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>

        {/* AI Recommendations */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <BoltIcon sx={{ fontSize: 14, color: '#0284c7' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              AI Recommendations
            </Typography>
          </Stack>
          <Stack spacing={1}>
            {recommendations.map((rec) => {
              const colors = getRecColor(rec.color);
              const IconComponent = rec.icon;
              return (
                <Box
                  key={rec.id}
                  sx={{
                    p: 1.5,
                    bgcolor: colors.bg,
                    border: '1px solid',
                    borderColor: colors.border,
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: alpha(colors.main, 0.15),
                      borderColor: alpha(colors.main, 0.4),
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ p: 0.5, borderRadius: 0.5, bgcolor: alpha(colors.main, 0.15), display: 'flex' }}>
                      <IconComponent sx={{ fontSize: 14, color: colors.main }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', mb: 0.25 }}>
                        {rec.category}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.3, mb: 0.5 }}>
                        {rec.description}
                      </Typography>
                      <Chip
                        label={rec.benefit}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          bgcolor: alpha(colors.main, 0.12),
                          color: colors.main,
                          border: '1px solid',
                          borderColor: alpha(colors.main, 0.2),
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Box>

      {/* Footer Stats */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: alpha('#64748b', 0.15), bgcolor: '#f8fafc' }}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <StatItem icon={<BoltIcon sx={{ fontSize: 16 }} />} label="Today" value={actionsToday} color="primary" />
          <StatItem icon={<SavingsIcon sx={{ fontSize: 16 }} />} label="Saved" value={`$${(costSavedWeek / 1000).toFixed(1)}k`} color="success" />
          <StatItem icon={<SecurityIcon sx={{ fontSize: 16 }} />} label="Prevented" value={issuesPrevented} color="info" />
        </Stack>
      </Box>
    </Box>
  );
}

function StatItem({ icon, label, value, color = 'primary' }) {
  const colors = {
    primary: { main: '#0284c7', bg: alpha('#0ea5e9', 0.1) },
    success: { main: '#059669', bg: alpha('#10b981', 0.1) },
    info: { main: '#7c3aed', bg: alpha('#8b5cf6', 0.1) },
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
