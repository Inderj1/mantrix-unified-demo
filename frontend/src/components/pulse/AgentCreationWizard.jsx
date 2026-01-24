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
  Inventory as InventoryIcon,
  ShowChart as ShowChartIcon,
  LocalShipping as LocalShippingIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const steps = ['Choose Template or Create', 'Configure Agent', 'Review & Deploy'];

// Category definitions for AI agents
const categories = [
  { id: 'all', label: 'All Templates', icon: AutoAwesomeIcon, color: '#6366f1' },
  { id: 'stox', label: 'Stox.AI', icon: InventoryIcon, color: '#8b5cf6', description: 'Inventory & Supply Chain' },
  { id: 'margen', label: 'Margen.AI', icon: ShowChartIcon, color: '#10b981', description: 'Margin Intelligence' },
  { id: 'coo', label: 'Operations', icon: LocalShippingIcon, color: '#0ea5e9', description: 'Operations & Logistics' },
  { id: 'cfo', label: 'Finance', icon: AttachMoneyIcon, color: '#f59e0b', description: 'Financial Monitoring' },
];

const AgentCreationWizard = ({ onClose, onSave, userId = 'demo_user', darkMode = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getColors = (darkMode) => ({
    primary: darkMode ? '#4d9eff' : '#00357a',
    text: darkMode ? '#e6edf3' : '#1e293b',
    textSecondary: darkMode ? '#8b949e' : '#64748b',
    background: darkMode ? '#0d1117' : '#f8fbfd',
    paper: darkMode ? '#161b22' : '#ffffff',
    cardBg: darkMode ? '#21262d' : '#ffffff',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  });

  const colors = getColors(darkMode);

  // Form state
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [agentData, setAgentData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  // Filter templates by selected category
  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  // Get category info for a template
  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      // Step 1: Create agent from NL or template
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
          setAgentData(data.data);
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
          setError(data.detail || 'Failed to create agent');
        }
      } catch (err) {
        setError('Error creating agent: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else if (activeStep === 1) {
      // Step 2: Review configuration
      if (!configuration.name) {
        setError('Please enter an agent name');
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      // Step 3: Save agent
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
          natural_language_query: agentData.natural_language_query,
          sql_query: agentData.sql_query,
          data_source: agentData.data_source,
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
        setError(data.detail || 'Failed to save agent');
      }
    } catch (err) {
      setError('Error saving agent: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
              Create Your Proactive Agent
            </Typography>

            {/* Category Tabs */}
            <Box mb={3}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {categories.map((cat) => {
                  const IconComponent = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <Chip
                      key={cat.id}
                      icon={<IconComponent sx={{ fontSize: 18, color: isSelected ? 'white' : cat.color }} />}
                      label={cat.label}
                      onClick={() => setSelectedCategory(cat.id)}
                      sx={{
                        bgcolor: isSelected ? cat.color : 'transparent',
                        color: isSelected ? 'white' : 'text.primary',
                        border: `1px solid ${isSelected ? cat.color : 'divider'}`,
                        fontWeight: isSelected ? 600 : 400,
                        '&:hover': {
                          bgcolor: isSelected ? cat.color : `${cat.color}15`,
                        },
                      }}
                    />
                  );
                })}
              </Box>
              {selectedCategory !== 'all' && (
                <Typography variant="caption" color="text.secondary">
                  {categories.find(c => c.id === selectedCategory)?.description}
                </Typography>
              )}
            </Box>

            {/* Quick Templates */}
            {filteredTemplates.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: colors.text }}>
                  {selectedCategory === 'all' ? 'Quick Start Templates' : `${categories.find(c => c.id === selectedCategory)?.label} Templates`}
                </Typography>
                <Grid container spacing={2}>
                  {filteredTemplates.slice(0, 6).map((template) => {
                    const catInfo = getCategoryInfo(template.category);
                    return (
                      <Grid item xs={12} md={6} key={template.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            cursor: 'pointer',
                            border: selectedTemplate?.id === template.id ? 2 : 1,
                            borderColor: selectedTemplate?.id === template.id ? catInfo.color : colors.border,
                            bgcolor: colors.cardBg,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: catInfo.color, bgcolor: darkMode ? 'rgba(77, 166, 255, 0.08)' : 'action.hover' }
                          }}
                          onClick={() => {
                            setSelectedTemplate(template);
                            setNaturalLanguage('');
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
                                {template.name}
                              </Typography>
                              <Chip
                                size="small"
                                label={catInfo.label}
                                sx={{
                                  bgcolor: `${catInfo.color}15`,
                                  color: catInfo.color,
                                  fontSize: '0.65rem',
                                  height: 20,
                                }}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ color: colors.textSecondary }} mb={1}>
                              {template.description}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              {template.default_frequency} · {template.default_severity} severity
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}

            {filteredTemplates.length === 0 && templates.length > 0 && (
              <Box mb={3} sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No templates found for this category. Try selecting a different category or create a custom agent below.
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }}>OR</Divider>

            {/* Custom Query */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ color: colors.text }}>
                Describe What You Want the Agent to Execute
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
                sx={{
                  mt: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: colors.cardBg,
                    color: colors.text,
                    '& fieldset': { borderColor: colors.border },
                  }
                }}
              />
              <Box mt={1}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Try: "Show inventory levels below safety stock", "Track gross margin by region monthly", "Monitor late deliveries over 3 days"
                </Typography>
              </Box>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
              Configure Agent Settings
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Agent Name"
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
                  <InputLabel>Execution Frequency</InputLabel>
                  <Select
                    value={configuration.frequency}
                    label="Execution Frequency"
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
              {agentData?.preview_data && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: colors.text }}>
                    Data Preview
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: colors.cardBg, borderColor: colors.border }}>
                    <DataGrid
                      rows={agentData.preview_data.map((row, idx) => ({ id: idx, ...row }))}
                      columns={Object.keys(agentData.preview_data[0] || {}).map(key => ({
                        field: key,
                        headerName: key,
                        flex: 1,
                        minWidth: 150,
                      }))}
                      autoHeight
                      hideFooter
                      density="compact"
                      sx={{
                        '& .MuiDataGrid-root': { bgcolor: colors.cardBg, color: colors.text },
                        '& .MuiDataGrid-cell': { borderColor: colors.border, color: colors.text },
                        '& .MuiDataGrid-columnHeaders': { borderColor: colors.border, bgcolor: colors.paper },
                        '& .MuiDataGrid-columnHeaderTitle': { color: colors.text },
                      }}
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
            <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
              Review & Deploy Agent
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: colors.paper, borderColor: colors.border }}>
                  <Typography variant="subtitle2" sx={{ color: colors.primary }} gutterBottom>
                    Agent Details
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>Name:</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{configuration.name}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>Frequency:</Typography>
                      <Typography variant="body2" sx={{ color: colors.text }}>{configuration.frequency}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>Severity:</Typography>
                      <Chip label={configuration.severity} size="small" color={
                        configuration.severity === 'high' ? 'error' :
                        configuration.severity === 'medium' ? 'warning' : 'default'
                      } />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: colors.paper, borderColor: colors.border }}>
                  <Typography variant="subtitle2" sx={{ color: colors.primary }} gutterBottom>
                    Query
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }} mb={1}>
                    {agentData?.natural_language_query}
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: darkMode ? '#0d1117' : 'grey.900', color: darkMode ? colors.text : 'grey.100', fontFamily: 'monospace', fontSize: 12, overflow: 'auto', border: '1px solid', borderColor: colors.border }}>
                    {agentData?.sql_query}
                  </Paper>
                </Paper>
              </Grid>

              {configuration.alertCondition && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: colors.paper, borderColor: colors.border }}>
                    <Typography variant="subtitle2" sx={{ color: colors.primary }} gutterBottom>
                      Alert Condition
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace" sx={{ color: colors.text }}>
                      {configuration.alertCondition}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12}>
                <Alert severity="info" icon={<InfoIcon />}>
                  This proactive agent will execute <strong>{configuration.frequency}</strong> to ensure business is not impacted.
                  The agent will learn from your feedback and improve accuracy over time.
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
            {loading ? 'Processing...' : activeStep === steps.length - 1 ? 'Deploy Agent' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AgentCreationWizard;
