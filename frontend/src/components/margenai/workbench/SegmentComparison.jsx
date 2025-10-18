import React from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';

const SegmentComparison = ({ onRefresh }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Customer Segment Comparison
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          This module will display segment comparison with:
          - Side-by-side segment metrics
          - Segment migration analysis
          - Performance benchmarking
          - Segment profitability comparison
        </Alert>
      </Paper>
    </Box>
  );
};

export default SegmentComparison;