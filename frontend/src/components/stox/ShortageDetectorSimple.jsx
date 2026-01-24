import React from 'react';
import { Box, Typography, Button, Stack, Breadcrumbs, Link, IconButton, alpha } from '@mui/material';
import { ArrowBack as ArrowBackIcon, NavigateNext as NavigateNextIcon, Warning as WarningIcon } from '@mui/icons-material';

// Dark Mode Color Helper
const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const ShortageDetectorSimple = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  console.log('ShortageDetectorSimple rendering, onBack:', onBack);

  return (
    <Box sx={{ p: 3, bgcolor: colors.background }}>
      {/* Breadcrumb Navigation */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: colors.textSecondary }} />}>
          <Link
            component="button"
            variant="body1"
            onClick={onBack}
            sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline' } }}
          >
            STOX.AI
          </Link>
          <Typography variant="body1" fontWeight={600} sx={{ color: colors.primary }}>
            Shortage Detector
          </Typography>
        </Breadcrumbs>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          variant="outlined"
          size="small"
          sx={{ color: colors.primary, borderColor: colors.primary }}
        >
          Back
        </Button>
      </Stack>

      {/* Title Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton sx={{ bgcolor: alpha(colors.primary, 0.1) }}>
          <WarningIcon sx={{ color: colors.primary }} />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>
            Shortage Detector
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Proactive shortage detection and alerting
          </Typography>
        </Box>
      </Box>

      <Typography variant="body1" sx={{ mt: 2, fontSize: '1.2rem', color: colors.text }}>
        This is a test component to verify routing works. If you can see this text, the routing is working correctly!
      </Typography>
    </Box>
  );
};

export default ShortageDetectorSimple;
