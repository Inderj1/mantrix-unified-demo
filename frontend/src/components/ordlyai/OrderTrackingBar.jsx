import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  alpha,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Email as EmailIcon,
  Settings as SettingsIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonChecked as ActiveIcon,
  RadioButtonUnchecked as PendingIcon,
  ArrowForward as ArrowIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

// Stage definitions for the 3-stage workflow
const stages = [
  {
    id: 0,
    key: 'customer-intent-cockpit',
    label: 'Intent',
    fullLabel: 'Customer Intent',
    icon: EmailIcon,
    color: '#0d47a1',
  },
  {
    id: 1,
    key: 'sku-decisioning',
    label: 'Decisioning',
    fullLabel: 'SKU Decisioning',
    icon: SettingsIcon,
    color: '#00357a',
  },
  {
    id: 2,
    key: 'order-value-control-tower',
    label: 'Arbitration',
    fullLabel: 'Order Arbitration',
    icon: AccountBalanceIcon,
    color: '#00357a',
  },
];

/**
 * OrderTrackingBar - Shows order progress across all workflow stages
 *
 * @param {Object} order - The current order object with stage property
 * @param {number} currentStage - The currently active tile stage (0, 1, or 2)
 * @param {Function} onNavigate - Callback to navigate to a different stage
 * @param {boolean} darkMode - Dark mode flag
 */
const OrderTrackingBar = ({ order, currentStage, onNavigate, darkMode = false }) => {
  if (!order) return null;

  // Map order.stage to 3-stage flow (stages 1 & 2 merged into 1 in old system)
  const orderProgress = order.stage >= 3 ? 2 : (order.stage >= 1 ? 1 : 0);

  const getStageStatus = (stageId) => {
    if (stageId < orderProgress) return 'complete';
    if (stageId === orderProgress) return 'active';
    return 'pending';
  };

  const getStatusIcon = (status) => {
    if (status === 'complete') return <CheckCircleIcon sx={{ fontSize: 16 }} />;
    if (status === 'active') return <ActiveIcon sx={{ fontSize: 16 }} />;
    return <PendingIcon sx={{ fontSize: 16 }} />;
  };

  const getStatusColor = (status, baseColor) => {
    if (status === 'complete') return '#10b981';
    if (status === 'active') return baseColor;
    return '#94a3b8';
  };

  const canNavigateTo = (stageId) => {
    // Can navigate to any stage the order has reached
    return orderProgress >= stageId;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        bgcolor: darkMode ? alpha('#002352', 0.08) : alpha('#002352', 0.04),
        borderRadius: 1,
        border: `1px solid ${darkMode ? alpha('#002352', 0.2) : alpha('#002352', 0.1)}`,
      }}
    >
      {/* Order ID Badge */}
      <Chip
        label={order.id}
        size="small"
        sx={{
          bgcolor: alpha('#002352', 0.12),
          color: '#002352',
          fontWeight: 700,
          fontSize: '0.7rem',
          height: 24,
          mr: 1,
        }}
      />

      {/* Stage Indicators */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
        {stages.map((stage, idx) => {
          const status = getStageStatus(stage.id);
          const statusColor = getStatusColor(status, stage.color);
          const isCurrentTile = currentStage === stage.id;
          const canNavigate = canNavigateTo(stage.id) && !isCurrentTile;
          const StageIcon = stage.icon;

          return (
            <React.Fragment key={stage.id}>
              <Tooltip
                title={
                  <Box sx={{ p: 0.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{stage.fullLabel}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                      {status === 'complete' ? 'Completed' : status === 'active' ? 'In Progress' : 'Not Started'}
                    </Typography>
                    {canNavigate && (
                      <Typography sx={{ fontSize: '0.6rem', color: '#60a5fa', mt: 0.5 }}>
                        Click to navigate
                      </Typography>
                    )}
                  </Box>
                }
                arrow
              >
                <Box
                  onClick={() => {
                    if (canNavigate && onNavigate) {
                      onNavigate(stage.key, order);
                    }
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: isCurrentTile
                      ? alpha(stage.color, 0.15)
                      : status === 'complete'
                      ? alpha('#10b981', 0.08)
                      : 'transparent',
                    border: isCurrentTile
                      ? `2px solid ${stage.color}`
                      : `1px solid ${status === 'pending' ? alpha('#94a3b8', 0.3) : 'transparent'}`,
                    cursor: canNavigate ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    '&:hover': canNavigate
                      ? {
                          bgcolor: alpha(stage.color, 0.12),
                          transform: 'translateY(-1px)',
                        }
                      : {},
                    opacity: status === 'pending' ? 0.5 : 1,
                  }}
                >
                  <Box sx={{ color: statusColor, display: 'flex', alignItems: 'center' }}>
                    {getStatusIcon(status)}
                  </Box>
                  <StageIcon sx={{ fontSize: 14, color: statusColor }} />
                  <Typography
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: isCurrentTile ? 700 : 600,
                      color: statusColor,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {stage.label}
                  </Typography>
                  {canNavigate && (
                    <OpenInNewIcon sx={{ fontSize: 10, color: '#64748b', ml: 0.25 }} />
                  )}
                </Box>
              </Tooltip>

              {/* Arrow between stages */}
              {idx < stages.length - 1 && (
                <ArrowIcon
                  sx={{
                    fontSize: 14,
                    color: orderProgress > idx ? '#10b981' : alpha('#94a3b8', 0.4),
                    mx: 0.25,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Stack>

      {/* Order Summary */}
      <Stack direction="row" spacing={1.5} sx={{ ml: 'auto' }}>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>
            Customer
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
            {order.customer?.slice(0, 18) || '--'}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>
            Value
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
            {order.value ? `$${order.value.toLocaleString()}` : order.orderValue || '--'}
          </Typography>
        </Box>
        {order.lineCount > 1 && (
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>
              Lines
            </Typography>
            <Chip
              label={order.lineCount}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: alpha('#002352', 0.12),
                color: '#002352',
              }}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default OrderTrackingBar;
