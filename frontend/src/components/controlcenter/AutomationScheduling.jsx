import React from 'react';
import {
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';

const AutomationScheduling = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Automation & Scheduling
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Scheduled jobs and automation tasks
        </Typography>
      </Box>

      <Alert severity="info" icon={<ScheduleIcon />}>
        Automation and scheduling features are coming soon.
        Currently, automated tasks are managed through external schedulers (cron, airflow, etc.).
      </Alert>
    </Box>
  );
};

export default AutomationScheduling;
