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
  QuestionAnswer as QuestionIcon,
  PlayArrow as ActionIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  Lightbulb as LightbulbIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
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

const intentColors = {
  question: '#3b82f6',
  action: '#f59e0b',
};

const riskColors = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

const statusColors = {
  pending: '#6b7280',
  processed: '#10b981',
  action_queued: '#3b82f6',
};

const IntentDetailDrawer = ({ open, onClose, intent, darkMode = false, sourceType = 'vendor' }) => {
  const colors = getColors(darkMode);
  const moduleColor = sourceType === 'vendor' ? '#00357a' : '#1a5a9e';

  if (!intent) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 480,
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
                icon={intent.intent_type === 'question' ? <QuestionIcon sx={{ fontSize: 14 }} /> : <ActionIcon sx={{ fontSize: 14 }} />}
                label={intent.intent_type}
                size="small"
                sx={{
                  bgcolor: alpha(intentColors[intent.intent_type], 0.15),
                  color: intentColors[intent.intent_type],
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  '& .MuiChip-icon': { color: intentColors[intent.intent_type] },
                }}
              />
              <Chip
                label={intent.risk_level}
                size="small"
                sx={{
                  bgcolor: alpha(riskColors[intent.risk_level], 0.15),
                  color: riskColors[intent.risk_level],
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              />
              <Chip
                label={`${intent.confidence}% confidence`}
                size="small"
                sx={{
                  bgcolor: alpha('#10b981', 0.15),
                  color: '#10b981',
                  fontWeight: 600,
                }}
              />
            </Stack>
            <Typography variant="h6" fontWeight={600} sx={{ color: colors.text, lineHeight: 1.3 }}>
              {intent.subject}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
        {/* Sender Info */}
        <Paper sx={{
          p: 2,
          mb: 2,
          bgcolor: colors.cardBg,
          border: `1px solid ${colors.border}`,
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 44, height: 44, bgcolor: moduleColor }}>
              {intent.sender_name?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.text }}>
                {intent.sender_name}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                {intent.sender_email}
              </Typography>
            </Box>
            <Stack alignItems="flex-end">
              <Chip
                icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
                label={intent.received_date}
                size="small"
                sx={{
                  bgcolor: alpha(colors.textSecondary, 0.1),
                  color: colors.textSecondary,
                  '& .MuiChip-icon': { color: colors.textSecondary },
                }}
              />
            </Stack>
          </Stack>
        </Paper>

        {/* Intent Category */}
        <Paper sx={{
          p: 2,
          mb: 2,
          bgcolor: colors.cardBg,
          border: `1px solid ${colors.border}`,
        }}>
          <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
            Intent Category
          </Typography>
          <Typography variant="body1" fontWeight={600} sx={{ color: colors.text, textTransform: 'capitalize', mt: 0.5 }}>
            {intent.intent_category?.replace(/_/g, ' ')}
          </Typography>
        </Paper>

        {/* Extracted Entities */}
        <Paper sx={{
          p: 2,
          mb: 2,
          bgcolor: colors.cardBg,
          border: `1px solid ${colors.border}`,
        }}>
          <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600, mb: 1.5, display: 'block' }}>
            Extracted Entities
          </Typography>
          <Grid container spacing={2}>
            {intent.extracted_entities?.document_numbers?.length > 0 && (
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Documents</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {intent.extracted_entities.document_numbers.map((doc, i) => (
                    <Chip key={i} label={doc} size="small" sx={{ bgcolor: alpha(moduleColor, 0.1), color: moduleColor, fontWeight: 600, fontSize: '0.7rem' }} />
                  ))}
                </Stack>
              </Grid>
            )}
            {intent.extracted_entities?.amounts?.length > 0 && (
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Amounts</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {intent.extracted_entities.amounts.map((amt, i) => (
                    <Chip key={i} label={amt} size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 600, fontSize: '0.7rem' }} />
                  ))}
                </Stack>
              </Grid>
            )}
            {intent.extracted_entities?.dates?.length > 0 && (
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Dates</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {intent.extracted_entities.dates.map((date, i) => (
                    <Chip key={i} label={date} size="small" sx={{ bgcolor: alpha('#6b7280', 0.1), color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }} />
                  ))}
                </Stack>
              </Grid>
            )}
            {intent.extracted_entities?.po_references?.length > 0 && (
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>PO References</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {intent.extracted_entities.po_references.map((po, i) => (
                    <Chip key={i} label={po} size="small" sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 600, fontSize: '0.7rem' }} />
                  ))}
                </Stack>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* SAP Tables Required */}
        {intent.sap_tables_required?.length > 0 && (
          <Paper sx={{
            p: 2,
            mb: 2,
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <StorageIcon sx={{ fontSize: 18, color: moduleColor }} />
              <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
                SAP Tables Required
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {intent.sap_tables_required.map((table, i) => (
                <Chip
                  key={i}
                  label={table}
                  size="small"
                  sx={{
                    bgcolor: alpha(moduleColor, 0.1),
                    color: moduleColor,
                    fontWeight: 600,
                  }}
                />
              ))}
            </Stack>
          </Paper>
        )}

        {/* AI Recommendation */}
        <Paper sx={{
          p: 2,
          mb: 2,
          bgcolor: alpha('#10b981', darkMode ? 0.1 : 0.05),
          border: `1px solid ${alpha('#10b981', 0.2)}`,
        }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <LightbulbIcon sx={{ fontSize: 18, color: '#10b981' }} />
            <Typography variant="caption" sx={{ color: '#10b981', textTransform: 'uppercase', fontWeight: 600 }}>
              AI Recommended Action
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: colors.text }}>
            {intent.recommended_action}
          </Typography>
        </Paper>

        {/* Status */}
        <Paper sx={{
          p: 2,
          bgcolor: colors.cardBg,
          border: `1px solid ${colors.border}`,
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
                Current Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={intent.status?.replace(/_/g, ' ')}
                  sx={{
                    bgcolor: alpha(statusColors[intent.status], 0.15),
                    color: statusColors[intent.status],
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                />
              </Box>
            </Box>
            {intent.status === 'pending' && (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CheckIcon />}
                  sx={{ borderColor: '#10b981', color: '#10b981' }}
                >
                  Mark Processed
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SendIcon />}
                  sx={{ bgcolor: moduleColor }}
                >
                  Queue Action
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Box>
    </Drawer>
  );
};

export default IntentDetailDrawer;
