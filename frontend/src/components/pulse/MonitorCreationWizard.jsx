import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const steps = ['Choose Template or Create', 'Configure Monitor', 'Review & Save'];

const MonitorCreationWizard = ({ onClose, onSave, userId = 'demo_user' }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [monitorData, setMonitorData] = useState(null);
  const [configuration, setConfiguration] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    severity: 'medium',
    alertCondition: '',
    enabled: true,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/v1/pulse/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      // Step 1: Create monitor from NL or template
      if (!naturalLanguage && !selectedTemplate) {
        setError('Please enter a query or select a template');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const query = selectedTemplate
          ? selectedTemplate.natural_language_template
          : naturalLanguage;

        const response = await fetch('/api/v1/pulse/monitors/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            natural_language: query,
            name: selectedTemplate?.name || null,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setMonitorData(data.data);
          setConfiguration({
            name: data.data.name,
            description: '',
            frequency: data.data.suggested_frequency || 'daily',
            severity: data.data.suggested_severity || 'medium',
            alertCondition: data.data.suggested_conditions?.condition || '',
            enabled: true,
          });
          setActiveStep(1);
        } else {
          setError(data.detail || 'Failed to create monitor');
        }
      } catch (err) {
        setError('Error creating monitor: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else if (activeStep === 1) {
      // Step 2: Review configuration
      if (!configuration.name) {
        setError('Please enter a monitor name');
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      // Step 3: Save monitor
      await handleSave();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/pulse/monitors/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name: configuration.name,
          description: configuration.description,
          natural_language_query: monitorData.natural_language_query,
          sql_query: monitorData.sql_query,
          data_source: monitorData.data_source,
          alert_condition: configuration.alertCondition,
          severity: configuration.severity,
          frequency: configuration.frequency,
          enabled: configuration.enabled,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (onSave) onSave(data.monitor_id);
        if (onClose) onClose();
      } else {
        setError(data.detail || 'Failed to save monitor');
      }
    } catch (err) {
      setError('Error saving monitor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create Your Monitor
            </Typography>

            {/* Quick Templates */}
            {templates.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon fontSize="small" />
                  Quick Start Templates
                </Typography>
                <Grid container spacing={2}>
                  {templates.slice(0, 6).map((template) => (
                    <Grid item xs={12} md={6} key={template.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          border: selectedTemplate?.id === template.id ? 2 : 1,
                          borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                        }}
                        onClick={() => {
                          setSelectedTemplate(template);
                          setNaturalLanguage('');
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600} mb={1}>
                            {template.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            {template.description}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {template.default_frequency} · {template.default_severity} severity
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            <Divider sx={{ my: 3 }}>OR</Divider>

            {/* Custom Query */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon fontSize="small" />
                Describe What You Want to Monitor
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Example: Alert me when revenue drops more than 10% compared to last month"
                value={naturalLanguage}
                onChange={(e) => {
                  setNaturalLanguage(e.target.value);
                  setSelectedTemplate(null);
                }}
                variant="outlined"
                sx={{ mt: 1 }}
              />
              <Box mt={1}>
                <Typography variant="caption" color="text.secondary">
                  💡 Try: "Show inventory levels below safety stock", "Track gross margin by region monthly", "Monitor late deliveries over 3 days"
                </Typography>
              </Box>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Monitor Settings
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Monitor Name"
                  value={configuration.name}
                  onChange={(e) => setConfiguration({ ...configuration, name: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  multiline
                  rows={2}
                  value={configuration.description}
                  onChange={(e) => setConfiguration({ ...configuration, description: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={configuration.frequency}
                    label="Frequency"
                    onChange={(e) => setConfiguration({ ...configuration, frequency: e.target.value })}
                  >
                    <MenuItem value="real-time">Real-time (1 min)</MenuItem>
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={configuration.severity}
                    label="Severity"
                    onChange={(e) => setConfiguration({ ...configuration, severity: e.target.value })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={configuration.enabled}
                    label="Status"
                    onChange={(e) => setConfiguration({ ...configuration, enabled: e.target.value })}
                  >
                    <MenuItem value={true}>Enabled</MenuItem>
                    <MenuItem value={false}>Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Alert Condition (Optional)"
                  placeholder="e.g., value < 1000 OR pct_change < -10"
                  value={configuration.alertCondition}
                  onChange={(e) => setConfiguration({ ...configuration, alertCondition: e.target.value })}
                  helperText="SQL expression to trigger alerts. Leave empty to alert on every execution."
                />
              </Grid>

              {/* Preview Data */}
              {monitorData?.preview_data && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Data Preview
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <DataGrid
                      rows={monitorData.preview_data.map((row, idx) => ({ id: idx, ...row }))}
                      columns={Object.keys(monitorData.preview_data[0] || {}).map(key => ({
                        field: key,
                        headerName: key,
                        flex: 1,
                        minWidth: 150,
                      }))}
                      autoHeight
                      hideFooter
                      density="compact"
                    />
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Confirm
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Monitor Details
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Name:</Typography>
                      <Typography variant="body2" fontWeight={600}>{configuration.name}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" color="text.secondary">Frequency:</Typography>
                      <Typography variant="body2">{configuration.frequency}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" color="text.secondary">Severity:</Typography>
                      <Chip label={configuration.severity} size="small" color={
                        configuration.severity === 'high' ? 'error' :
                        configuration.severity === 'medium' ? 'warning' : 'default'
                      } />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Query
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {monitorData?.natural_language_query}
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', fontFamily: 'monospace', fontSize: 12, overflow: 'auto' }}>
                    {monitorData?.sql_query}
                  </Paper>
                </Paper>
              </Grid>

              {configuration.alertCondition && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Alert Condition
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      {configuration.alertCondition}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12}>
                <Alert severity="info" icon={<InfoIcon />}>
                  Monitor will execute <strong>{configuration.frequency}</strong> and alert you when conditions are met.
                  The agent will learn from your feedback to improve accuracy over time.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ minHeight: 400 }}>
        {renderStepContent()}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : activeStep === 2 ? <CheckCircleIcon /> : null}
          >
            {loading ? 'Processing...' : activeStep === steps.length - 1 ? 'Create Monitor' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MonitorCreationWizard;
