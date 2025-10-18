import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const ShortageDetectorSimple = ({ onBack }) => {
  console.log('ShortageDetectorSimple rendering, onBack:', onBack);

  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', border: '2px solid red' }}>
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
