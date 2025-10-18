import React from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';

const TimeSeriesAnalysis = ({ onRefresh }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Time Series Performance Analysis
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          This module will display time series analysis with:
          - Revenue and profit trends over time
          - Seasonal decomposition
          - Moving averages and forecasting
          - Year-over-year comparisons
        </Alert>
      </Paper>
    </Box>
  );
};

export default TimeSeriesAnalysis;