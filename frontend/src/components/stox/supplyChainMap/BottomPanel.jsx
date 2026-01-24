import React from 'react';
import { Box, Typography, Stack, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SavingsIcon from '@mui/icons-material/Savings';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function BottomPanel({
  pendingDecisions = [],
  completedActions = [],
  onApprove,
  onReject,
  onActionClick,
  collapsed = false,
  onToggleCollapsed,
}) {
  const handleToggle = () => {
    onToggleCollapsed?.(!collapsed);
  };

  const totalSavedToday = completedActions.reduce((sum, action) => sum + (action.cost_saved || 0), 0);
  const successfulActions = completedActions.filter(a => a.status === 'completed').length;
  const successRate = completedActions.length > 0 ? Math.round((successfulActions / completedActions.length) * 100) : 100;

  // Insight cards with Arizona Beverages supply chain data
  const insights = [
    {
      id: 1,
      icon: TrendingUpIcon,
      category: 'Demand',
      categoryColor: 'blue',
      description: 'Walmart Q2 order: +25% Green Tea demand',
      confidence: 91,
    },
    {
      id: 2,
      icon: WarningAmberIcon,
      category: 'Risk',
      categoryColor: 'orange',
      description: 'Douglas GA at 65% - Publix order risk',
      confidence: 94,
    },
    {
      id: 3,
      icon: SavingsIcon,
      category: 'Savings',
      categoryColor: 'emerald',
      description: 'Reduce Keasbey safety stock - free $85K',
      confidence: 92,
    },
    {
      id: 4,
      icon: InventoryIcon,
      category: 'Stock',
      categoryColor: 'purple',
      description: 'Lakeland FL at 58% - Southeast impacted',
      confidence: 89,
    },
    {
      id: 5,
      icon: LocalShippingIcon,
      category: 'Shipment',
      categoryColor: 'cyan',
      description: 'SHP-001 Keasbey: Green Tea ETA 14hrs',
      confidence: 96,
    },
    {
      id: 6,
      icon: AccessTimeIcon,
      category: 'Transfer',
      categoryColor: 'amber',
      description: 'Keasbey→Douglas: 15K cases pending',
      confidence: 88,
    },
  ];

  const getCategoryColor = (color) => {
    const colors = {
      blue: { bg: alpha('#0ea5e9', 0.08), border: alpha('#0ea5e9', 0.2), text: '#0284c7', iconBg: alpha('#0ea5e9', 0.12) },
      orange: { bg: alpha('#f97316', 0.08), border: alpha('#f97316', 0.2), text: '#ea580c', iconBg: alpha('#f97316', 0.12) },
      emerald: { bg: alpha('#10b981', 0.08), border: alpha('#10b981', 0.2), text: '#059669', iconBg: alpha('#10b981', 0.12) },
      purple: { bg: alpha('#0078d4', 0.08), border: alpha('#0078d4', 0.2), text: '#005a9e', iconBg: alpha('#0078d4', 0.12) },
      cyan: { bg: alpha('#06b6d4', 0.08), border: alpha('#06b6d4', 0.2), text: '#0891b2', iconBg: alpha('#06b6d4', 0.12) },
      amber: { bg: alpha('#f59e0b', 0.08), border: alpha('#f59e0b', 0.2), text: '#d97706', iconBg: alpha('#f59e0b', 0.12) },
    };
    return colors[color] || colors.blue;
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'white',
        borderTop: '1px solid',
        borderColor: alpha('#64748b', 0.15),
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.03)',
        zIndex: 1000,
        transition: 'height 0.3s ease',
        height: collapsed ? 32 : 100,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.5,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderBottom: collapsed ? 'none' : '1px solid',
          borderColor: alpha('#64748b', 0.1),
          height: 32,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box sx={{
              p: 0.375,
              borderRadius: 0.5,
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LightbulbIcon sx={{ fontSize: 12, color: 'white' }} />
            </Box>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e293b' }}>
              Insights Engine
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <CheckCircleIcon sx={{ fontSize: 12, color: '#0891b2' }} />
              <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>
                <span style={{ color: '#0891b2', fontWeight: 600 }}>{successRate}%</span>
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <SavingsIcon sx={{ fontSize: 12, color: '#059669' }} />
              <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>
                <span style={{ color: '#059669', fontWeight: 600 }}>${totalSavedToday.toLocaleString()}</span>
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <IconButton size="small" onClick={handleToggle} sx={{ p: 0.25 }}>
          {collapsed ? <ExpandLessIcon sx={{ fontSize: 16, color: '#64748b' }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: '#64748b' }} />}
        </IconButton>
      </Box>

      {/* Content - Horizontal scrolling cards */}
      {!collapsed && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            p: 1,
            height: 68,
            overflowX: 'auto',
            overflowY: 'hidden',
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: 'transparent', borderRadius: 2 },
            '&:hover::-webkit-scrollbar-thumb': { background: 'rgba(100, 116, 139, 0.3)' },
            scrollbarWidth: 'thin',
            scrollbarColor: 'transparent transparent',
            '&:hover': { scrollbarColor: 'rgba(100, 116, 139, 0.3) transparent' },
          }}
        >
          {insights.map((insight) => {
            const colors = getCategoryColor(insight.categoryColor);
            const IconComponent = insight.icon;
            return (
              <Box
                key={insight.id}
                sx={{
                  minWidth: 180,
                  maxWidth: 180,
                  p: 0.75,
                  bgcolor: colors.bg,
                  border: '1px solid',
                  borderColor: colors.border,
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  '&:hover': {
                    bgcolor: alpha(colors.text, 0.12),
                    borderColor: alpha(colors.text, 0.35),
                  },
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.25 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ p: 0.25, borderRadius: 0.375, bgcolor: colors.iconBg, display: 'flex' }}>
                      <IconComponent sx={{ fontSize: 11, color: colors.text }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: colors.text, textTransform: 'uppercase', letterSpacing: 0.2 }}>
                      {insight.category}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.5rem', fontWeight: 600, color: colors.text, opacity: 0.8 }}>
                    {insight.confidence}%
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: '0.6rem', color: '#0078d4', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {insight.description}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
