import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const WhatIfAnalysisPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        What-If Analysis
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>What-If Analysis page is working!</Typography>
      </Paper>
    </Box>
  );
};

export default WhatIfAnalysisPage;