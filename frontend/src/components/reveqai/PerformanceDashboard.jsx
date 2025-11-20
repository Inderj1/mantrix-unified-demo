import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link, Avatar, alpha } from '@mui/material';
import { Assessment as PerformanceIcon, NavigateNext, ArrowBack } from '@mui/icons-material';

const PerformanceDashboard = ({ onBack }) => (
  <Box sx={{ p: 3 }}>
    <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
      <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>REVEQ.AI</Link>
      <Typography color="primary" variant="body1" fontWeight={600}>Performance Dashboard</Typography>
    </Breadcrumbs>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Avatar sx={{ width: 56, height: 56, bgcolor: alpha('#2196F3', 0.1) }}>
        <PerformanceIcon sx={{ fontSize: 32, color: '#2196F3' }} />
      </Avatar>
      <Box>
        <Typography variant="h5" fontWeight={700}>Performance Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Comprehensive KPIs and performance metrics</Typography>
      </Box>
    </Box>
    <Typography>Performance metrics and operational KPIs</Typography>
  </Box>
);

export default PerformanceDashboard;
