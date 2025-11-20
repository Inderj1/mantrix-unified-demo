import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link, Avatar, alpha } from '@mui/material';
import { Build as MaintenanceIcon, NavigateNext, ArrowBack } from '@mui/icons-material';

const MaintenanceScheduler = ({ onBack }) => (
  <Box sx={{ p: 3 }}>
    <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
      <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>REVEQ.AI</Link>
      <Typography color="primary" variant="body1" fontWeight={600}>Maintenance Scheduler</Typography>
    </Breadcrumbs>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Avatar sx={{ width: 56, height: 56, bgcolor: alpha('#F44336', 0.1) }}>
        <MaintenanceIcon sx={{ fontSize: 32, color: '#F44336' }} />
      </Avatar>
      <Box>
        <Typography variant="h5" fontWeight={700}>Maintenance Scheduler</Typography>
        <Typography variant="body2" color="text.secondary">Preventive maintenance and service scheduling</Typography>
      </Box>
    </Box>
    <Typography>Maintenance scheduling and equipment health monitoring</Typography>
  </Box>
);

export default MaintenanceScheduler;
