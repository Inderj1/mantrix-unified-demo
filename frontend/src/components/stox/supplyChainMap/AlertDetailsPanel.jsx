import React from 'react';
import { Box, Typography, Stack, Chip, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import CloudIcon from '@mui/icons-material/Cloud';
import BuildIcon from '@mui/icons-material/Build';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function AlertDetailsPanel({ alert, onClose }) {
  // Map agent types to AI agent info
  const getAIAgentInfo = (agentId) => {
    const agentMap = {
      'route-optimizer': { name: 'Route.AI', icon: LocalShippingIcon, specialty: 'Route Optimization', color: '#2b88d8' },
      'inventory-manager': { name: 'Stox.AI', icon: InventoryIcon, specialty: 'Inventory Management', color: '#0078d4' },
      'demand-forecaster': { name: 'Markets.AI', icon: CloudIcon, specialty: 'External Factors - Weather, Tariffs, Events', color: '#06b6d4' },
      'cost-optimizer': { name: 'Cost.AI', icon: TrendingUpIcon, specialty: 'Cost Optimization', color: '#10b981' },
    };
    return agentMap[agentId] || { name: 'Logistics.AI', icon: SmartToyIcon, specialty: 'General Analysis', color: '#64748b' };
  };

  const agentInfo = getAIAgentInfo(alert.agent_id || 'route-optimizer');
  const AgentIcon = agentInfo.icon;

  const severity = alert.severity || (
    alert.priority >= 9 ? 'critical' :
    alert.priority >= 6 ? 'high' :
    alert.priority >= 3 ? 'medium' : 'low'
  );

  const getSeverityColors = (sev) => {
    switch (sev) {
      case 'critical': return { bg: alpha('#ef4444', 0.12), text: '#dc2626', border: alpha('#ef4444', 0.3) };
      case 'high': return { bg: alpha('#f97316', 0.12), text: '#ea580c', border: alpha('#f97316', 0.3) };
      case 'medium': return { bg: alpha('#f59e0b', 0.12), text: '#d97706', border: alpha('#f59e0b', 0.3) };
      default: return { bg: alpha('#0284c7', 0.12), text: '#0284c7', border: alpha('#0284c7', 0.3) };
    }
  };

  const severityColors = getSeverityColors(severity);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 64,
        left: 296,
        width: 420,
        bgcolor: 'white',
        border: '1px solid',
        borderColor: alpha('#64748b', 0.2),
        borderRadius: 2,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        zIndex: 1600,
        maxHeight: 'calc(100vh - 100px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.15), bgcolor: '#f8fafc' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
              <WarningAmberIcon sx={{ fontSize: 22, color: severityColors.text, mt: 0.25 }} />
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                {alert.title}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mb: 1.5 }}>
              {alert.message}
            </Typography>
            <Chip
              label={severity.toUpperCase()}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: severityColors.bg,
                color: severityColors.text,
              }}
            />
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{
        p: 2,
        overflow: 'auto',
        flex: 1,
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'transparent', borderRadius: 3 },
        '&:hover::-webkit-scrollbar-thumb': { background: 'rgba(100, 116, 139, 0.3)' },
        scrollbarWidth: 'thin',
        scrollbarColor: 'transparent transparent',
        '&:hover': { scrollbarColor: 'rgba(100, 116, 139, 0.3) transparent' },
      }}>
        <Stack spacing={2}>
          {/* AI Agent Analysis */}
          <Box sx={{
            bgcolor: alpha(agentInfo.color, 0.08),
            border: '1px solid',
            borderColor: alpha(agentInfo.color, 0.2),
            borderRadius: 1.5,
            p: 2,
          }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{
                p: 0.75,
                borderRadius: 1,
                bgcolor: alpha(agentInfo.color, 0.15),
                display: 'flex',
              }}>
                <AgentIcon sx={{ fontSize: 20, color: agentInfo.color }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: agentInfo.color }}>{agentInfo.name}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{agentInfo.specialty}</Typography>
              </Box>
              <Box sx={{
                width: 8,
                height: 8,
                bgcolor: agentInfo.color,
                borderRadius: '50%',
                animation: 'pulse 2s infinite',
              }} />
            </Stack>

            {/* AI Analysis Timeline */}
            <Stack spacing={1.5}>
              {/* Alert Received */}
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{
                  mt: 0.25,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <CheckCircleIcon sx={{ fontSize: 12, color: 'white' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>Alert Received</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>System detected anomaly</Typography>
                </Box>
              </Stack>

              {/* AI Triggered */}
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{
                  mt: 0.25,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: '#0891b2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <CheckCircleIcon sx={{ fontSize: 12, color: 'white' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0891b2' }}>{agentInfo.name} Triggered</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>Agent assigned to analyze</Typography>
                </Box>
              </Stack>

              {/* AI Analyzing */}
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{
                  mt: 0.25,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Box sx={{
                    width: 10,
                    height: 10,
                    bgcolor: 'white',
                    borderRadius: '50%',
                    animation: 'ping 1.5s infinite',
                  }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284c7' }}>AI Analyzing</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>Processing solution...</Typography>
                </Box>
              </Stack>

              {/* Solution Ready */}
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{
                  mt: 0.25,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: alpha('#64748b', 0.3),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Box sx={{ width: 8, height: 8, bgcolor: alpha('#64748b', 0.3), borderRadius: '50%' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Solution Ready</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>Pending completion</Typography>
                </Box>
              </Stack>
            </Stack>

            {/* AI Working Indicator */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: alpha(agentInfo.color, 0.2) }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Stack direction="row" spacing={0.5}>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 6,
                        height: 6,
                        bgcolor: agentInfo.color,
                        borderRadius: '50%',
                        animation: 'bounce 1s infinite',
                        animationDelay: `${i * 150}ms`,
                      }}
                    />
                  ))}
                </Stack>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: agentInfo.color }}>
                  AI is working on analysis and solution...
                </Typography>
              </Stack>
            </Box>
          </Box>

          {/* Suggested Actions */}
          {alert.suggested_actions && alert.suggested_actions.length > 0 && (
            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', mb: 1.5 }}>
                Suggested Actions
              </Typography>
              <Stack spacing={1}>
                {alert.suggested_actions.map((action, idx) => (
                  <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#0891b2', mt: 0.75 }} />
                    <Typography sx={{ fontSize: '0.75rem', color: '#0078d4' }}>{action}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {/* Alert Priority */}
          <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>Priority Level</Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0078d4' }}>{alert.priority}/10</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5}>
              {[...Array(10)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    height: 14,
                    borderRadius: 0.5,
                    bgcolor: i < alert.priority
                      ? alert.priority >= 8 ? '#ef4444' :
                        alert.priority >= 5 ? '#f97316' : '#f59e0b'
                      : alpha('#64748b', 0.15),
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Alert Type Info */}
          <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', mb: 1 }}>
              Alert Information
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Alert Type:</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#1e293b' }}>
                  {alert.alert_type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Status:</Typography>
                <Chip
                  label={alert.status?.toUpperCase() || 'ACTIVE'}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    bgcolor: alpha('#f97316', 0.12),
                    color: '#f97316',
                  }}
                />
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Location:</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#1e293b', fontFamily: 'monospace' }}>
                  {alert.latitude?.toFixed(2)}°, {alert.longitude?.toFixed(2)}°
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </Box>
  );
}
