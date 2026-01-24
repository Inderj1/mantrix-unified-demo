import React from 'react';
import { Box, Typography, Stack, Chip, Avatar, LinearProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SavingsIcon from '@mui/icons-material/Savings';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function RightPanel({ agents = [], actionsToday = 0, costSavedWeek = 0, issuesPrevented = 0 }) {
  const getAgentTypeColor = (type) => {
    const colors = {
      monitoring: '#3b82f6',
      logistics: '#10b981',
      compliance: '#f97316',
      analytics: '#8b5cf6',
    };
    return colors[type] || '#64748b';
  };

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: 'white',
        borderLeft: '1px solid',
        borderColor: alpha('#64748b', 0.15),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.1) }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SmartToyIcon sx={{ fontSize: 18, color: '#00357a' }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>AI Autopilot</Typography>
          <Chip
            label="Active"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              fontWeight: 700,
              bgcolor: alpha('#10b981', 0.15),
              color: '#10b981',
            }}
          />
        </Stack>
      </Box>

      {/* Stats */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.1) }}>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <TrendingUpIcon sx={{ fontSize: 14, color: '#00357a' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Actions Today</Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{actionsToday}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <SavingsIcon sx={{ fontSize: 14, color: '#10b981' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Cost Saved (Week)</Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>
              ${costSavedWeek.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <SecurityIcon sx={{ fontSize: 14, color: '#f97316' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Issues Prevented</Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#f97316' }}>{issuesPrevented}</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Agents */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', mb: 1 }}>ACTIVE AGENTS</Typography>
        <Stack spacing={1}>
          {agents.map((agent) => (
            <Box
              key={agent.id}
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: alpha('#64748b', 0.03),
                border: '1px solid',
                borderColor: alpha('#64748b', 0.1),
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: alpha(getAgentTypeColor(agent.type), 0.15),
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 14, color: getAgentTypeColor(agent.type) }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e293b' }}>
                      {agent.name}
                    </Typography>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: agent.status === 'active' ? '#10b981' : '#64748b',
                      }}
                    />
                  </Stack>
                  <Typography sx={{ fontSize: '0.6rem', color: '#64748b', mb: 0.5 }}>
                    {agent.description}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: '0.55rem', color: '#94a3b8' }}>
                      {agent.last_action}
                    </Typography>
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: '10px !important' }} />}
                      label={agent.actions_today}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.55rem',
                        fontWeight: 600,
                        bgcolor: alpha('#10b981', 0.1),
                        color: '#10b981',
                        '& .MuiChip-icon': { color: '#10b981' },
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: alpha('#64748b', 0.1), bgcolor: alpha('#00357a', 0.03) }}>
        <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center' }}>
          Powered by SMADE.IO IoT Platform
        </Typography>
      </Box>
    </Box>
  );
}
