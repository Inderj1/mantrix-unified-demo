import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Check as CheckIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const DatasetSettings = ({ open, onClose }) => {
  const [dataset, setDataset] = useState('');
  const [project, setProject] = useState('');
  const [saved, setSaved] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    // Load current settings
    const currentDataset = localStorage.getItem('bigquery_dataset') || 'copa_export_copa_data_000000000000';
    const currentProject = localStorage.getItem('bigquery_project') || 'arizon-poc';
    setDataset(currentDataset);
    setProject(currentProject);
  }, [open]);

  const handleSave = () => {
    localStorage.setItem('bigquery_dataset', dataset);
    localStorage.setItem('bigquery_project', project);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      // Clear cache via API
      await fetch('http://localhost:8000/api/v1/cache/clear', {
        method: 'POST',
      });
      alert('Cache cleared successfully!');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  const presetDatasets = [
    {
      name: 'COPA Export Dataset',
      dataset: 'copa_export_copa_data_000000000000',
      project: 'arizon-poc',
    },
    {
      name: 'Sales Order Cockpit',
      dataset: 'copa_export_copa_data_000000000000',
      project: 'arizon-poc',
    },
  ];

  const handlePresetClick = (preset) => {
    setDataset(preset.dataset);
    setProject(preset.project);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SettingsIcon />
          <Typography variant="h6">Dataset Configuration</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configure which BigQuery dataset to query. This setting will be used for all queries.
          </Typography>

          <Stack spacing={3}>
            <TextField
              label="Project ID"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              fullWidth
              helperText="The Google Cloud project ID"
            />

            <TextField
              label="Dataset Name"
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              fullWidth
              helperText="The BigQuery dataset name"
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Quick Presets:
              </Typography>
              <Stack direction="row" spacing={1}>
                {presetDatasets.map((preset) => (
                  <Chip
                    key={preset.name}
                    label={preset.name}
                    onClick={() => handlePresetClick(preset)}
                    variant={
                      dataset === preset.dataset && project === preset.project
                        ? 'filled'
                        : 'outlined'
                    }
                    color={
                      dataset === preset.dataset && project === preset.project
                        ? 'primary'
                        : 'default'
                    }
                  />
                ))}
              </Stack>
            </Box>

            <Box sx={{ 
              p: 2, 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 1,
              bgcolor: 'background.default'
            }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2">Clear Query Cache</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Clear cached queries when switching datasets
                  </Typography>
                </Box>
                <Tooltip title="Clear all cached queries">
                  <IconButton 
                    onClick={handleClearCache} 
                    disabled={clearing}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            {saved && (
              <Alert severity="success" icon={<CheckIcon />}>
                Settings saved successfully!
              </Alert>
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DatasetSettings;