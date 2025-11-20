import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link, Avatar, alpha } from '@mui/material';
import { LocalShipping as UtilizationIcon, NavigateNext, ArrowBack } from '@mui/icons-material';

const UtilizationMetrics = ({ onBack }) => (
  <Box sx={{ p: 3 }}>
    <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
      <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>REVEQ.AI</Link>
      <Typography color="primary" variant="body1" fontWeight={600}>Utilization Metrics</Typography>
    </Breadcrumbs>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Avatar sx={{ width: 56, height: 56, bgcolor: alpha('#FF9800', 0.1) }}>
        <UtilizationIcon sx={{ fontSize: 32, color: '#FF9800' }} />
      </Avatar>
      <Box>
        <Typography variant="h5" fontWeight={700}>Utilization Metrics</Typography>
        <Typography variant="body2" color="text.secondary">Asset deployment and utilization analysis</Typography>
      </Box>
    </Box>
    <Typography>Utilization metrics and optimization recommendations</Typography>
  </Box>
);

export default UtilizationMetrics;
