import React from 'react';
import { Box } from '@mui/material';
import PulseCommandTab from './pulse/PulseCommandTab';

const EnterprisePulse = ({ darkMode = false }) => {
  const bgColor = darkMode ? '#0d1117' : '#f5f5f5';
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: bgColor }}>
      <PulseCommandTab darkMode={darkMode} />
    </Box>
  );
};

export default EnterprisePulse;
