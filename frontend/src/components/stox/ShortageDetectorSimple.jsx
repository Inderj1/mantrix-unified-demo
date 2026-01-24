import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

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
    <Box sx={{ p: 3, bgcolor: colors.background, border: `2px solid ${colors.border}` }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
        🔴 DEBUG: ShortageDetectorSimple is rendering
      </Typography>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        variant="contained"
        color="primary"
        size="large"
        sx={{ mb: 2 }}
      >
        Back to STOX.AI
      </Button>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
        Shortage Detector
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, fontSize: '1.2rem' }}>
        This is a test component to verify routing works. If you can see this text, the routing is working correctly!
      </Typography>
    </Box>
  );
};

export default ShortageDetectorSimple;
