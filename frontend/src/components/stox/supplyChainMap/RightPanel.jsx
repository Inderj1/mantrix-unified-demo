import React, { useState } from 'react';
import { Box, Typography, Chip, Stack, Button, Card, CardContent } from '@mui/material';
import { alpha } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RouteIcon from '@mui/icons-material/Route';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BoltIcon from '@mui/icons-material/Bolt';
import SavingsIcon from '@mui/icons-material/Savings';
import SecurityIcon from '@mui/icons-material/Security';
import SAPPlanningModal from './SAPPlanningModal';

export default function RightPanel({
  agents = [],
  actionsToday = 0,
  costSavedWeek = 0,
  issuesPrevented = 0,
}) {
  // AI proposed actions - automated responses to detected issues
  const proposedActions = [
    {
      id: '1',
      type: 'auto-reroute',
      label: 'Auto-Reroute',
      description: 'Redirect TRK-005 via I-65 to avoid weather delays - saves 2.5 hrs',
      actionLabel: 'Approve Route',
      confidence: 94,
      impact: 'High',
      icon: RouteIcon,
    },
    {
      id: '2',
      type: 'auto-transfer',
      label: 'Stock Transfer',
      description: 'Move 1,200 cases from La Vergne to Columbus DC to prevent stockout',
      actionLabel: 'Approve Transfer',
      confidence: 91,
      impact: 'Medium',
      icon: SwapHorizIcon,
    },
    {
      id: '3',
      type: 'demand-adjust',
      label: 'Demand Adjust',
      description: 'Increase Nashville delivery frequency due to +18% demand forecast',
      actionLabel: 'Review Plan',
      confidence: 87,
      impact: 'Medium',
      icon: TrendingUpIcon,
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

  // State for SAP Planning Modal
  const [sapModalOpen, setSapModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setSapModalOpen(true);
  };

  const handleSAPSave = (action, planData) => {
    console.log('Saving to SAP:', action, planData);
    // Here you would make an API call to sync with SAP
    // For now, we just close the modal
  };

  const getImpactColors = (impact) => {
    switch (impact) {
      case 'High': return { bg: alpha('#002352', 0.08), border: alpha('#002352', 0.25), text: '#002352', btn: '#002352', iconBg: alpha('#002352', 0.12) };
      case 'Medium': return { bg: alpha('#0ea5e9', 0.08), border: alpha('#0ea5e9', 0.25), text: '#0284c7', btn: '#0ea5e9', iconBg: alpha('#0ea5e9', 0.12) };
      case 'Low': return { bg: alpha('#10b981', 0.08), border: alpha('#10b981', 0.25), text: '#059669', btn: '#10b981', iconBg: alpha('#10b981', 0.12) };
      default: return { bg: alpha('#64748b', 0.08), border: alpha('#64748b', 0.25), text: '#00357a', btn: '#64748b', iconBg: alpha('#64748b', 0.12) };
    }
  };

  const getRecColor = (color) => {
    switch (color) {
      case 'emerald': return { main: '#059669', bg: alpha('#10b981', 0.1), border: alpha('#10b981', 0.2) };
      case 'blue': return { main: '#0284c7', bg: alpha('#0ea5e9', 0.1), border: alpha('#0ea5e9', 0.2) };
      case 'cyan': return { main: '#0891b2', bg: alpha('#06b6d4', 0.1), border: alpha('#06b6d4', 0.2) };
      default: return { main: '#00357a', bg: alpha('#64748b', 0.1), border: alpha('#64748b', 0.2) };
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
        borderColor: alpha('#64748b', 0.15),
        boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.04)',
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
            background: 'linear-gradient(135deg, #002352 0%, #a78bfa 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <SmartToyIcon sx={{ fontSize: 16, color: 'white' }} />
          </Box>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>AI Control Center</Typography>
        </Stack>
        <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>Intelligent Detection & Proposals</Typography>
      </Box>

      {/* Scrollable Content */}
      <Box
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
        {/* AI Proposed Actions */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <SmartToyIcon sx={{ fontSize: 14, color: '#002352' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#00357a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              AI Proposed Actions
            </Typography>
          </Stack>
          <Stack spacing={1.5}>
            {proposedActions.map((action) => {
              const colors = getImpactColors(action.impact);
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
                      <Chip
                        label={`${action.confidence}%`}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          bgcolor: alpha('#10b981', 0.12),
                          color: '#059669',
                        }}
                      />
                    </Stack>
                    <Typography sx={{ fontSize: '0.75rem', color: '#1e293b', mb: 1.5, lineHeight: 1.4 }}>
                      {action.description}
                    </Typography>
                    <Button
                      fullWidth
                      size="small"
                      variant="contained"
                      onClick={() => handleActionClick(action)}
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
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#00357a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#00357a', mb: 0.25 }}>
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
      <Box sx={{
        p: 2,
        borderTop: '1px solid',
        borderColor: alpha('#64748b', 0.15),
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      }}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <StatItem icon={<BoltIcon sx={{ fontSize: 16 }} />} label="Today" value={actionsToday} color="primary" />
          <StatItem icon={<SavingsIcon sx={{ fontSize: 16 }} />} label="Saved" value={`$${(costSavedWeek / 1000).toFixed(1)}k`} color="success" />
          <StatItem icon={<SecurityIcon sx={{ fontSize: 16 }} />} label="Prevented" value={issuesPrevented} color="info" />
        </Stack>
      </Box>

      {/* SAP Planning Modal */}
      <SAPPlanningModal
        open={sapModalOpen}
        action={selectedAction}
        onClose={() => setSapModalOpen(false)}
        onSaveToSAP={handleSAPSave}
      />
    </Box>
  );
}

function StatItem({ icon, label, value, color = 'primary' }) {
  const colors = {
    primary: { main: '#0284c7', bg: alpha('#0ea5e9', 0.1) },
    success: { main: '#059669', bg: alpha('#10b981', 0.1) },
    info: { main: '#002352', bg: alpha('#00357a', 0.1) },
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
