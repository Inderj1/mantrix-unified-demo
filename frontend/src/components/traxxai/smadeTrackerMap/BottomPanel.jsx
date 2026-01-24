import React, { useState } from 'react';
import { Box, Typography, Stack, Chip, Button, IconButton, Tabs, Tab } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import PendingIcon from '@mui/icons-material/Pending';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function BottomPanel({
  pendingDecisions = [],
  completedActions = [],
  onApprove,
  onReject,
  collapsed = false,
  onToggleCollapsed,
}) {
  const [activeTab, setActiveTab] = useState(0);

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#eab308',
      low: '#64748b',
    };
    return colors[priority] || '#64748b';
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 280,
        right: 280,
        height: collapsed ? 32 : 100,
        bgcolor: 'white',
        borderTop: '1px solid',
        borderColor: alpha('#64748b', 0.15),
        zIndex: 600,
        transition: 'height 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          borderBottom: collapsed ? 'none' : '1px solid',
          borderColor: alpha('#64748b', 0.1),
          cursor: 'pointer',
          bgcolor: alpha('#0a6ed1', 0.02),
        }}
        onClick={() => onToggleCollapsed?.(!collapsed)}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <AutoAwesomeIcon sx={{ fontSize: 16, color: '#0a6ed1' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>
            AI Recommendations
          </Typography>
          <Chip
            icon={<PendingIcon sx={{ fontSize: '12px !important' }} />}
            label={pendingDecisions.length}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              fontWeight: 700,
              bgcolor: alpha('#f97316', 0.15),
              color: '#f97316',
              '& .MuiChip-icon': { color: '#f97316' },
            }}
          />
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '12px !important' }} />}
            label={completedActions.length}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              fontWeight: 700,
              bgcolor: alpha('#10b981', 0.15),
              color: '#10b981',
              '& .MuiChip-icon': { color: '#10b981' },
            }}
          />
        </Stack>
        <IconButton size="small">
          {collapsed ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>

      {/* Content */}
      {!collapsed && (
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Tabs */}
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              minWidth: 100,
              borderRight: '1px solid',
              borderColor: alpha('#64748b', 0.1),
              '& .MuiTab-root': {
                minHeight: 32,
                fontSize: '0.65rem',
                fontWeight: 600,
                textTransform: 'none',
                alignItems: 'flex-start',
                px: 1,
              },
            }}
          >
            <Tab label={`Pending (${pendingDecisions.length})`} />
            <Tab label={`Done (${completedActions.length})`} />
          </Tabs>

          {/* Action Cards */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content' }}>
              {activeTab === 0 &&
                pendingDecisions.map((action) => (
                  <Box
                    key={action.id}
                    sx={{
                      minWidth: 220,
                      maxWidth: 220,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha('#64748b', 0.03),
                      border: '1px solid',
                      borderColor: alpha(getPriorityColor(action.priority), 0.3),
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e293b' }}>
                        {action.title}
                      </Typography>
                      <Chip
                        label={action.priority}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.55rem',
                          fontWeight: 700,
                          bgcolor: alpha(getPriorityColor(action.priority), 0.15),
                          color: getPriorityColor(action.priority),
                          textTransform: 'uppercase',
                        }}
                      />
                    </Stack>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b', mb: 0.75 }}>
                      {action.description}
                    </Typography>
                    <Typography sx={{ fontSize: '0.55rem', color: '#10b981', fontWeight: 600, mb: 0.75 }}>
                      Impact: {action.predicted_impact}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckCircleIcon sx={{ fontSize: '12px !important' }} />}
                        onClick={() => onApprove?.(action)}
                        sx={{
                          flex: 1,
                          height: 22,
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          bgcolor: '#10b981',
                          '&:hover': { bgcolor: '#059669' },
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CloseIcon sx={{ fontSize: '12px !important' }} />}
                        onClick={() => onReject?.(action)}
                        sx={{
                          flex: 1,
                          height: 22,
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          borderColor: '#ef4444',
                          color: '#ef4444',
                          '&:hover': { bgcolor: alpha('#ef4444', 0.1) },
                        }}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </Box>
                ))}

              {activeTab === 1 &&
                completedActions.map((action) => (
                  <Box
                    key={action.id}
                    sx={{
                      minWidth: 200,
                      maxWidth: 200,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha('#10b981', 0.05),
                      border: '1px solid',
                      borderColor: alpha('#10b981', 0.2),
                    }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} />
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e293b' }}>
                        {action.title}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>
                      {action.actual_impact || action.predicted_impact}
                    </Typography>
                  </Box>
                ))}

              {((activeTab === 0 && pendingDecisions.length === 0) ||
                (activeTab === 1 && completedActions.length === 0)) && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', py: 1 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {activeTab === 0 ? 'No pending recommendations' : 'No completed actions'}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
