import React from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';

const CohortAnalysis = ({ onRefresh }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Cohort Retention Analysis
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          This module will display cohort retention analysis with:
          - Monthly/Weekly cohort grids
          - Retention curves
          - Cohort performance comparison
          - Revenue retention analysis
        </Alert>
      </Paper>
    </Box>
  );
};

export default CohortAnalysis;