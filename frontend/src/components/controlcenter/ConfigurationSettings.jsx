import React from 'react';
import {
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const ConfigurationSettings = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Configuration Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          System configuration is managed through environment variables and config files
        </Typography>
      </Box>

      <Alert severity="info" icon={<SettingsIcon />}>
        Configuration settings are managed server-side.
        For security reasons, these settings cannot be modified through the UI.
        Please contact your system administrator to update configuration.
      </Alert>
    </Box>
  );
};

export default ConfigurationSettings;
