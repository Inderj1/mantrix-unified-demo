import React, { useState } from 'react';
import { Box, Typography, Chip, Stack, IconButton, Grid, Collapse } from '@mui/material';
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
}) {
  const [collapsed, setCollapsed] = useState(false);

  const totalSavedToday = completedActions.reduce((sum, action) => sum + (action.cost_saved || 0), 0);
  const successfulActions = completedActions.filter(a => a.status === 'completed').length;
  const successRate = completedActions.length > 0 ? Math.round((successfulActions / completedActions.length) * 100) : 100;

  // Insight cards with supply chain data
  const insights = [
    {
      id: 1,
      icon: TrendingUpIcon,
      category: 'Demand Forecast',
      categoryColor: 'blue',
      description: 'Northeast demand +18% next week due to summer heat wave forecast',
      confidence: 87,
    },
    {
      id: 2,
      icon: WarningAmberIcon,
      category: 'Risk Alert',
      categoryColor: 'orange',
      description: 'Weather delays expected on I-40 corridor Thu-Fri affecting 3 trucks',
      confidence: 92,
    },
    {
      id: 3,
      icon: SavingsIcon,
      category: 'Cost Optimization',
      categoryColor: 'emerald',
      description: 'Consolidate Midwest routes to save $3.8K/week in fuel costs',
      confidence: 94,
    },
    {
      id: 4,
      icon: InventoryIcon,
      category: 'Inventory Alert',
      categoryColor: 'purple',
      description: 'Columbus DC reaches reorder point for RX Energy in 2 days',
      confidence: 89,
    },
    {
      id: 5,
      icon: LocalShippingIcon,
      category: 'Route Efficiency',
      categoryColor: 'cyan',
      description: 'Alternative route saves 45 min on AZ-TRK-002 delivery to Nashville',
      confidence: 96,
    },
    {
      id: 6,
      icon: AccessTimeIcon,
      category: 'Capacity Planning',
      categoryColor: 'amber',
      description: 'Woodbury DC at 85% - recommend additional capacity for peak season',
      confidence: 85,
    },
  ];

  const getCategoryColor = (color) => {
    const colors = {
      blue: { bg: alpha('#0ea5e9', 0.1), border: alpha('#0ea5e9', 0.25), text: '#0284c7', iconBg: alpha('#0ea5e9', 0.15) },
      orange: { bg: alpha('#f97316', 0.1), border: alpha('#f97316', 0.25), text: '#ea580c', iconBg: alpha('#f97316', 0.15) },
      emerald: { bg: alpha('#10b981', 0.1), border: alpha('#10b981', 0.25), text: '#059669', iconBg: alpha('#10b981', 0.15) },
      purple: { bg: alpha('#8b5cf6', 0.1), border: alpha('#8b5cf6', 0.25), text: '#7c3aed', iconBg: alpha('#8b5cf6', 0.15) },
      cyan: { bg: alpha('#06b6d4', 0.1), border: alpha('#06b6d4', 0.25), text: '#0891b2', iconBg: alpha('#06b6d4', 0.15) },
      amber: { bg: alpha('#f59e0b', 0.1), border: alpha('#f59e0b', 0.25), text: '#d97706', iconBg: alpha('#f59e0b', 0.15) },
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
        borderColor: alpha('#64748b', 0.12),
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
          <Stack direction="row" alignItems="center" spacing={1}>
            <LightbulbIcon sx={{ fontSize: 16, color: '#0284c7' }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
              Insights Engine
            </Typography>
          </Stack>

          <Stack direction="row" spacing={3}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <CheckCircleIcon sx={{ fontSize: 14, color: '#0891b2' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                Success: <span style={{ color: '#0891b2', fontWeight: 700 }}>{successRate}%</span>
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <SavingsIcon sx={{ fontSize: 14, color: '#059669' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                Saved: <span style={{ color: '#059669', fontWeight: 700 }}>${totalSavedToday.toLocaleString()}</span>
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ p: 0.5 }}>
          {collapsed ? <ExpandLessIcon sx={{ fontSize: 18, color: '#64748b' }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: '#64748b' }} />}
        </IconButton>
      </Box>

      {/* Content */}
      <Collapse in={!collapsed}>
        <Box sx={{ p: 2, height: 152, overflow: 'auto' }}>
          <Grid container spacing={1.5}>
            {insights.map((insight) => {
              const colors = getCategoryColor(insight.categoryColor);
              const IconComponent = insight.icon;
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
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: alpha(colors.text, 0.15),
                        borderColor: alpha(colors.text, 0.4),
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
                      <Box sx={{ p: 0.25, borderRadius: 0.5, bgcolor: colors.iconBg, display: 'flex' }}>
                        <IconComponent sx={{ fontSize: 14, color: colors.text }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: colors.text, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        {insight.category}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.65rem', color: '#475569', lineHeight: 1.4, flex: 1, mb: 0.5 }}>
                      {insight.description}
                    </Typography>
                    <Chip
                      label={`${insight.confidence}% confidence`}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.55rem',
                        fontWeight: 600,
                        bgcolor: alpha(colors.text, 0.1),
                        color: colors.text,
                        border: '1px solid',
                        borderColor: alpha(colors.text, 0.15),
                        alignSelf: 'flex-start',
                      }}
                    />
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
