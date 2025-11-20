import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link, Avatar, alpha } from '@mui/material';
import { Speed as EfficiencyIcon, NavigateNext, ArrowBack } from '@mui/icons-material';

const EfficiencyOptimizer = ({ onBack }) => (
  <Box sx={{ p: 3 }}>
    <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
      <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>REVEQ.AI</Link>
      <Typography color="primary" variant="body1" fontWeight={600}>Efficiency Optimizer</Typography>
    </Breadcrumbs>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Avatar sx={{ width: 56, height: 56, bgcolor: alpha('#607D8B', 0.1) }}>
        <EfficiencyIcon sx={{ fontSize: 32, color: '#607D8B' }} />
      </Avatar>
      <Box>
        <Typography variant="h5" fontWeight={700}>Efficiency Optimizer</Typography>
        <Typography variant="body2" color="text.secondary">Cost reduction and efficiency recommendations</Typography>
      </Box>
    </Box>
    <Typography>Optimization recommendations and cost savings opportunities</Typography>
  </Box>
);

export default EfficiencyOptimizer;
