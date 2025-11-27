import React, { useState } from 'react';
import { Box, Typography, Chip, Stack, IconButton, Grid, Collapse } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import SavingsIcon from '@mui/icons-material/Savings';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function BottomPanel({
  pendingDecisions = [],
  completedActions = [],
  onApprove,
  onReject,
  onActionClick,
}) {
  const [collapsed, setCollapsed] = useState(false);

  const totalSavedToday = completedActions.reduce((sum, action) => sum + (action.cost_saved || 0), 0);
  const successfulActions = completedActions.filter(a => a.status === 'completed').length;
  const successRate = completedActions.length > 0 ? Math.round((successfulActions / completedActions.length) * 100) : 100;

  // Insight cards with supply chain data
  const insights = [
    {
      id: 1,
      icon: '📈',
      category: 'Demand Forecast',
      categoryColor: 'blue',
      description: 'Northeast demand +18% next week due to summer heat wave forecast',
      confidence: 87,
    },
    {
      id: 2,
      icon: '⚠️',
      category: 'Risk Alert',
      categoryColor: 'orange',
      description: 'Weather delays expected on I-40 corridor Thu-Fri affecting 3 trucks',
      confidence: 92,
    },
    {
      id: 3,
      icon: '💰',
      category: 'Cost Optimization',
      categoryColor: 'emerald',
      description: 'Consolidate Midwest routes to save $3.8K/week in fuel costs',
      confidence: 94,
    },
    {
      id: 4,
      icon: '📦',
      category: 'Inventory Alert',
      categoryColor: 'purple',
      description: 'Columbus DC reaches reorder point for RX Energy in 2 days',
      confidence: 89,
    },
    {
      id: 5,
      icon: '🚛',
      category: 'Route Efficiency',
      categoryColor: 'cyan',
      description: 'Alternative route saves 45 min on AZ-TRK-002 delivery to Nashville',
      confidence: 96,
    },
    {
      id: 6,
      icon: '⏱️',
      category: 'Capacity Planning',
      categoryColor: 'amber',
      description: 'Woodbury DC at 85% - recommend additional capacity for peak season',
      confidence: 85,
    },
  ];

  const getCategoryColor = (color) => {
    const colors = {
      blue: { bg: alpha('#3b82f6', 0.1), border: alpha('#3b82f6', 0.3), text: '#2563eb' },
      orange: { bg: alpha('#f97316', 0.1), border: alpha('#f97316', 0.3), text: '#ea580c' },
      emerald: { bg: alpha('#10b981', 0.1), border: alpha('#10b981', 0.3), text: '#059669' },
      purple: { bg: alpha('#8b5cf6', 0.1), border: alpha('#8b5cf6', 0.3), text: '#7c3aed' },
      cyan: { bg: alpha('#06b6d4', 0.1), border: alpha('#06b6d4', 0.3), text: '#0891b2' },
      amber: { bg: alpha('#f59e0b', 0.1), border: alpha('#f59e0b', 0.3), text: '#d97706' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 280,
        right: 280,
        bottom: 0,
        bgcolor: 'white',
        borderTop: '2px solid',
        borderColor: alpha('#64748b', 0.2),
        zIndex: 1000,
        transition: 'height 0.3s ease',
        height: collapsed ? 40 : 200,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 0.75,
          bgcolor: '#f8fafc',
          borderBottom: '1px solid',
          borderColor: alpha('#64748b', 0.15),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={3}>
          <Chip
            icon={<span style={{ fontSize: '0.8rem' }}>💡</span>}
            label="Insights Engine"
            size="small"
            sx={{
              bgcolor: '#3b82f6',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.65rem',
              height: 24,
              '& .MuiChip-icon': { ml: 0.5 },
            }}
          />

          <Stack direction="row" spacing={3}>
            <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>
              Success Rate: <span style={{ color: '#0891b2', fontWeight: 700 }}>{successRate}%</span>
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>
              Saved Today: <span style={{ color: '#059669', fontWeight: 700 }}>${totalSavedToday.toLocaleString()}</span>
            </Typography>
          </Stack>
        </Stack>

        <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ p: 0.5 }}>
          {collapsed ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>

      {/* Content */}
      <Collapse in={!collapsed}>
        <Box sx={{ p: 2, height: 152, overflow: 'auto' }}>
          <Grid container spacing={1.5}>
            {insights.map((insight) => {
              const colors = getCategoryColor(insight.categoryColor);
              return (
                <Grid item xs={12} sm={6} md={4} lg={2} key={insight.id}>
                  <Box
                    sx={{
                      p: 1.5,
                      height: '100%',
                      bgcolor: colors.bg,
                      border: '1px solid',
                      borderColor: colors.border,
                      borderRadius: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
                      <Typography sx={{ fontSize: '0.85rem' }}>{insight.icon}</Typography>
                      <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: colors.text, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        {insight.category}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.6rem', color: '#475569', lineHeight: 1.4, flex: 1, mb: 0.5 }}>
                      {insight.description}
                    </Typography>
                    <Typography sx={{ fontSize: '0.5rem', color: '#94a3b8' }}>
                      Confidence: {insight.confidence}%
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
}
