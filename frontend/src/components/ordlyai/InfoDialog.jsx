import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

// ORDLY.AI themed info/alert dialog (replaces browser alert())
const InfoDialog = ({
  open,
  onClose,
  title = 'Information',
  message,
  type = 'info', // 'info', 'success', 'warning', 'error'
  buttonText = 'OK',
  darkMode = false,
}) => {
  const theme = {
    bg: darkMode ? '#0d1520' : '#ffffff',
    text: darkMode ? '#e2e8f0' : '#1e293b',
    textSecondary: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? 'rgba(8, 84, 160, 0.3)' : 'rgba(8, 84, 160, 0.15)',
    primary: '#0854a0',
    primaryLight: '#1976d2',
  };

  const typeConfig = {
    info: {
      color: '#0854a0',
      bgColor: darkMode ? 'rgba(8, 84, 160, 0.15)' : 'rgba(8, 84, 160, 0.1)',
      Icon: InfoIcon,
    },
    success: {
      color: '#059669',
      bgColor: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
      Icon: CheckCircleIcon,
    },
    warning: {
      color: '#d97706',
      bgColor: darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
      Icon: WarningIcon,
    },
    error: {
      color: '#dc2626',
      bgColor: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
      Icon: ErrorIcon,
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.Icon;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.bg,
          borderRadius: 3,
          border: `1px solid ${theme.border}`,
          boxShadow: darkMode
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header accent */}
      <Box
        sx={{
          height: 4,
          bgcolor: config.color,
        }}
      />

      <DialogTitle sx={{ pb: 1, pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: config.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 28, color: config.color }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.text,
              fontSize: '1.1rem',
            }}
          >
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 3 }}>
        <Typography
          sx={{
            color: theme.textSecondary,
            fontSize: '0.95rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 0,
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            py: 1.25,
            background: `linear-gradient(135deg, ${theme.primaryLight} 0%, ${theme.primary} 100%)`,
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            borderRadius: 2,
            boxShadow: `0 4px 14px ${alpha(theme.primary, 0.3)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.primary} 0%, #074080 100%)`,
              boxShadow: `0 6px 20px ${alpha(theme.primary, 0.4)}`,
            },
          }}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoDialog;
