import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Stack,
  Chip,
  Avatar,
  alpha,
  IconButton,
  Divider,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  PlayArrow as ExecutingIcon,
  Block as RejectedIcon,
  AttachMoney as MoneyIcon,
  Code as CodeIcon,
  Person as PersonIcon,
  Send as SendIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
} from '@mui/icons-material';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const statusColors = {
  pending: { bg: '#6b7280', label: 'Pending' },
  approved: { bg: '#10b981', label: 'Approved' },
  executing: { bg: '#3b82f6', label: 'Executing' },
  completed: { bg: '#059669', label: 'Completed' },
  rejected: { bg: '#ef4444', label: 'Rejected' },
};

const statusIcons = {
  pending: <ScheduleIcon sx={{ fontSize: 16 }} />,
  approved: <CheckIcon sx={{ fontSize: 16 }} />,
  executing: <ExecutingIcon sx={{ fontSize: 16 }} />,
  completed: <CheckIcon sx={{ fontSize: 16 }} />,
  rejected: <RejectedIcon sx={{ fontSize: 16 }} />,
};

const ActionDetailDrawer = ({ open, onClose, action, darkMode = false, sourceType = 'vendor' }) => {
  const colors = getColors(darkMode);
  const moduleColor = sourceType === 'vendor' ? '#00357a' : '#1a5a9e';

  if (!action) return null;

  const statusConfig = statusColors[action.status];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 520,
          bgcolor: colors.paper,
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: `1px solid ${colors.border}`,
        bgcolor: alpha(moduleColor, darkMode ? 0.1 : 0.03),
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1, pr: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                label={action.action_id}
                size="small"
                sx={{
                  bgcolor: alpha(moduleColor, 0.15),
                  color: moduleColor,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              />
              <Chip
                icon={statusIcons[action.status]}
                label={statusConfig.label}
                size="small"
                sx={{
                  bgcolor: alpha(statusConfig.bg, 0.15),
                  color: statusConfig.bg,
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: statusConfig.bg },
                }}
              />
            </Stack>
            <Typography variant="h6" fontWeight={600} sx={{ color: colors.text, lineHeight: 1.3 }}>
              {action.title}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
        {/* Source Info */}
        <Paper sx={{
          p: 2,
          mb: 2,
          bgcolor: colors.cardBg,
          border: `1px solid ${colors.border}`,
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 44, height: 44, bgcolor: moduleColor }}>
              {(action.vendor_name || action.customer_name)?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.text }}>
                {action.vendor_name || action.customer_name}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Source Email ID: {action.source_email_id}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Description */}
        <Paper sx={{
          p: 2,
          mb: 2,
          bgcolor: colors.cardBg,
          border: `1px solid ${colors.border}`,
        }}>
          <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
            Description
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text, mt: 0.5 }}>
            {action.description}
          </Typography>
        </Paper>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Paper sx={{
              p: 2,
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              height: '100%',
            }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <MoneyIcon sx={{ fontSize: 18, color: '#10b981' }} />
                <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
                  Financial Impact
                </Typography>
              </Stack>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#10b981' }}>
                {action.financial_impact || 'N/A'}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{
              p: 2,
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              height: '100%',
            }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
                Risk Score
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="h5" fontWeight={700} sx={{
                  color: action.risk_score >= 70 ? '#ef4444' : action.risk_score >= 40 ? '#f59e0b' : '#10b981'
                }}>
                  {action.risk_score}
                </Typography>
                <Box sx={{
                  mt: 1,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(action.risk_score >= 70 ? '#ef4444' : action.risk_score >= 40 ? '#f59e0b' : '#10b981', 0.2),
                }}>
                  <Box sx={{
                    width: `${action.risk_score}%`,
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: action.risk_score >= 70 ? '#ef4444' : action.risk_score >= 40 ? '#f59e0b' : '#10b981',
                  }} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Timeline */}
        <Paper sx={{
          p: 2,
          mb: 2,
          bgcolor: colors.cardBg,
          border: `1px solid ${colors.border}`,
        }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>Created</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>
                {action.created_date}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>Due Date</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>
                {action.due_date}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>Assigned To</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>
                {action.assigned_to}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>Action Type</Typography>
              <Chip
                label={action.action_type?.replace(/_/g, ' ')}
                size="small"
                sx={{
                  bgcolor: alpha(moduleColor, 0.1),
                  color: moduleColor,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  mt: 0.5,
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Required Approvals */}
        {action.required_approvals?.length > 0 && (
          <Paper sx={{
            p: 2,
            mb: 2,
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <PersonIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
                Required Approvals
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {action.required_approvals.map((approver, i) => (
                <Chip
                  key={i}
                  label={approver}
                  size="small"
                  sx={{
                    bgcolor: alpha('#f59e0b', 0.1),
                    color: '#f59e0b',
                    fontWeight: 600,
                  }}
                />
              ))}
            </Stack>
          </Paper>
        )}

        {/* BAPI Payload */}
        {action.bapi_name && (
          <Paper sx={{
            p: 2,
            mb: 2,
            bgcolor: darkMode ? '#1a1f29' : '#f8f9fa',
            border: `1px solid ${colors.border}`,
          }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <CodeIcon sx={{ fontSize: 18, color: moduleColor }} />
              <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
                BAPI Configuration
              </Typography>
            </Stack>
            <Typography variant="body2" fontWeight={600} sx={{ color: moduleColor, mb: 1 }}>
              {action.bapi_name}
            </Typography>
            <Box sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: darkMode ? '#0d1117' : '#fff',
              border: `1px solid ${colors.border}`,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              overflow: 'auto',
            }}>
              <pre style={{ margin: 0, color: colors.text }}>
                {JSON.stringify(action.bapi_payload, null, 2)}
              </pre>
            </Box>
          </Paper>
        )}

        {/* Actions */}
        {action.status === 'pending' && (
          <Paper sx={{
            p: 2,
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }}>
            <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600, mb: 1.5, display: 'block' }}>
              Actions
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<ApproveIcon />}
                sx={{
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' },
                }}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                startIcon={<RejectIcon />}
                sx={{
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  '&:hover': { borderColor: '#dc2626', bgcolor: alpha('#ef4444', 0.05) },
                }}
              >
                Reject
              </Button>
              <Button
                variant="outlined"
                startIcon={<SendIcon />}
                sx={{
                  borderColor: moduleColor,
                  color: moduleColor,
                }}
              >
                Send to Command Center
              </Button>
            </Stack>
          </Paper>
        )}
      </Box>
    </Drawer>
  );
};

export default ActionDetailDrawer;
