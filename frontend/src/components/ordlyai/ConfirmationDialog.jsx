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
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';

// ORDLY.AI themed confirmation dialog
const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Success',
  message,
  confirmText = 'View',
  cancelText = 'Stay Here',
  icon: Icon = CheckCircleIcon,
  darkMode = false,
}) => {
  const theme = {
    bg: darkMode ? '#0d1520' : '#ffffff',
    text: darkMode ? '#e2e8f0' : '#1e293b',
    textSecondary: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? 'rgba(8, 84, 160, 0.3)' : 'rgba(8, 84, 160, 0.15)',
    primary: '#002352',
    primaryLight: '#1976d2',
    success: '#059669',
    successBg: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
  };

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
          background: `linear-gradient(90deg, ${theme.success} 0%, ${theme.primary} 100%)`,
        }}
      />

      <DialogTitle sx={{ pb: 1, pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: theme.successBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 28, color: theme.success }} />
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
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            flex: 1,
            py: 1.25,
            borderColor: darkMode ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
            color: theme.textSecondary,
            fontWeight: 500,
            fontSize: '0.875rem',
            textTransform: 'none',
            borderRadius: 2,
            '&:hover': {
              borderColor: theme.primary,
              bgcolor: alpha(theme.primary, 0.05),
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          endIcon={<NavigateNextIcon />}
          sx={{
            flex: 1,
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
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
