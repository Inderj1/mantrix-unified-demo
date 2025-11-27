import React from 'react';
import { Box, Typography, Chip, Stack, Button, Card, CardContent, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';

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
      label: 'WEATHER ALERT',
      description: 'Severe thunderstorms forecast for Tennessee - shipments may be affected',
      actionLabel: 'View Routes',
      timeAgo: '2 min ago',
      bgColor: 'error',
    },
    {
      id: '2',
      type: 'low-stock',
      label: 'LOW STOCK',
      description: 'Columbus DC at 45% capacity - RX Energy below reorder point',
      actionLabel: 'Request Transfer',
      timeAgo: '5 min ago',
      bgColor: 'warning',
    },
    {
      id: '3',
      type: 'delay-risk',
      label: 'DELAY RISK',
      description: 'AZ-TRK-002 experiencing delays on I-40 corridor',
      actionLabel: 'Reroute Options',
      timeAgo: '8 min ago',
      bgColor: 'info',
    },
  ];

  // AI recommendations
  const recommendations = [
    {
      id: '1',
      category: 'Cost Optimization',
      description: 'Consolidate TRK-005 & TRK-007 routes',
      benefit: 'Save $1,200/week',
      color: 'emerald',
    },
    {
      id: '2',
      category: 'Route Efficiency',
      description: 'Add Nashville stop to TRK-003 route',
      benefit: '+18% efficiency',
      color: 'blue',
    },
    {
      id: '3',
      category: 'Inventory Balance',
      description: 'Transfer 2,000 cases La Vergne → Columbus',
      benefit: 'Prevent stockout',
      color: 'cyan',
    },
  ];

  const getBgColor = (type) => {
    switch (type) {
      case 'error': return { bg: alpha('#ef4444', 0.08), border: alpha('#ef4444', 0.3), text: '#dc2626', btn: '#ef4444' };
      case 'warning': return { bg: alpha('#f97316', 0.08), border: alpha('#f97316', 0.3), text: '#ea580c', btn: '#f97316' };
      case 'info': return { bg: alpha('#eab308', 0.08), border: alpha('#eab308', 0.3), text: '#ca8a04', btn: '#eab308' };
      default: return { bg: alpha('#64748b', 0.08), border: alpha('#64748b', 0.3), text: '#475569', btn: '#64748b' };
    }
  };

  const getRecColor = (color) => {
    switch (color) {
      case 'emerald': return { dot: '#10b981', text: '#059669' };
      case 'blue': return { dot: '#3b82f6', text: '#2563eb' };
      case 'cyan': return { dot: '#06b6d4', text: '#0891b2' };
      default: return { dot: '#64748b', text: '#475569' };
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
        borderColor: alpha('#64748b', 0.2),
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          <Box sx={{ width: 8, height: 8, bgcolor: '#3b82f6', borderRadius: '50%' }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>AI Control Center</Typography>
        </Stack>
        <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>Intelligent Detection & Proposals</Typography>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Critical Actions */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5 }}>
            Critical Actions
          </Typography>
          <Stack spacing={1.5}>
            {criticalActions.map((action) => {
              const colors = getBgColor(action.bgColor);
              return (
                <Card
                  key={action.id}
                  sx={{
                    bgcolor: colors.bg,
                    border: '1px solid',
                    borderColor: colors.border,
                    boxShadow: 'none',
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {action.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.55rem', color: '#94a3b8' }}>{action.timeAgo}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.7rem', color: '#1e293b', mb: 1.5, lineHeight: 1.4 }}>
                      {action.description}
                    </Typography>
                    <Button
                      fullWidth
                      size="small"
                      variant="contained"
                      sx={{
                        bgcolor: colors.btn,
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        py: 0.75,
                        textTransform: 'none',
                        '&:hover': { bgcolor: alpha(colors.btn, 0.9) },
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
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5 }}>
            AI Recommendations
          </Typography>
          <Stack spacing={1}>
            {recommendations.map((rec) => {
              const colors = getRecColor(rec.color);
              return (
                <Box
                  key={rec.id}
                  sx={{
                    p: 1.5,
                    bgcolor: alpha('#64748b', 0.04),
                    border: '1px solid',
                    borderColor: alpha('#64748b', 0.15),
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha('#64748b', 0.08) },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                    <Box sx={{ width: 8, height: 8, bgcolor: colors.dot, borderRadius: '50%', mt: 0.5, flexShrink: 0 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#475569', mb: 0.25 }}>
                        {rec.category}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.3 }}>
                        {rec.description}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: colors.text }}>
                    {rec.benefit}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Box>

      {/* Footer Stats */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: alpha('#64748b', 0.15), bgcolor: '#f8fafc' }}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>{actionsToday}</Typography>
            <Typography sx={{ fontSize: '0.55rem', color: '#64748b' }}>Actions Today</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>${(costSavedWeek / 1000).toFixed(1)}k</Typography>
            <Typography sx={{ fontSize: '0.55rem', color: '#64748b' }}>Saved This Week</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6' }}>{issuesPrevented}</Typography>
            <Typography sx={{ fontSize: '0.55rem', color: '#64748b' }}>Issues Prevented</Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
