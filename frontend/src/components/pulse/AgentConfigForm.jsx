import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import PhoneIcon from '@mui/icons-material/Phone';
import NotificationsIcon from '@mui/icons-material/Notifications';

const AgentConfigForm = ({ agent, onClose, isNew = false }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Core fields are read-only for existing agents
  const isReadOnly = !isNew && agent?.id;

  const [config, setConfig] = useState({
    name: '',
    description: '',
    severity: 'medium',
    frequency: 'daily',
    enabled: true,
    alert_condition: '',
    notification_config: {
      email: false,
      sms: false,
      voice_call: false,
      slack: false,
      teams: false,
      ai_agent: false,
    },
    notification_recipients: [],
  });

  const [newRecipient, setNewRecipient] = useState({ type: 'email', value: '' });

  useEffect(() => {
    if (agent) {
      setConfig({
        name: agent.name || '',
        description: agent.description || '',
        severity: agent.severity || 'medium',
        frequency: agent.frequency || 'daily',
        enabled: agent.enabled !== false,
        alert_condition: agent.alert_condition || '',
        notification_config: agent.notification_config || {
          email: false,
          sms: false,
          voice_call: false,
          slack: false,
          teams: false,
          ai_agent: false,
        },
        notification_recipients: agent.notification_recipients || [],
      });
    }
  }, [agent]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`/api/v1/pulse/monitors/${agent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(data.detail || 'Failed to update configuration');
      }
    } catch (err) {
      setError(`Error saving configuration: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = (channel) => {
    setConfig({
      ...config,
      notification_config: {
        ...config.notification_config,
        [channel]: !config.notification_config[channel],
      },
    });
  };

  const handleAddRecipient = () => {
    if (newRecipient.value.trim()) {
      setConfig({
        ...config,
        notification_recipients: [
          ...config.notification_recipients,
          { ...newRecipient },
        ],
      });
      setNewRecipient({ type: 'email', value: '' });
    }
  };

  const handleRemoveRecipient = (index) => {
    setConfig({
      ...config,
      notification_recipients: config.notification_recipients.filter((_, i) => i !== index),
    });
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Configuration saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Basic Settings
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Agent Name"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                disabled={isReadOnly}
                InputProps={{
                  readOnly: isReadOnly,
                }}
                helperText={isReadOnly ? "Agent name cannot be modified" : ""}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                disabled={isReadOnly}
                InputProps={{
                  readOnly: isReadOnly,
                }}
                helperText={isReadOnly ? "Description cannot be modified" : ""}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={config.severity}
                  label="Severity"
                  onChange={(e) => setConfig({ ...config, severity: e.target.value })}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={config.frequency}
                  label="Frequency"
                  onChange={(e) => setConfig({ ...config, frequency: e.target.value })}
                >
                  <MenuItem value="real-time">Real-time</MenuItem>
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alert Condition"
                value={config.alert_condition}
                onChange={(e) => setConfig({ ...config, alert_condition: e.target.value })}
                disabled={isReadOnly}
                InputProps={{
                  readOnly: isReadOnly,
                }}
                helperText={isReadOnly ? "Alert condition cannot be modified" : "SQL condition to trigger alert (e.g., count > 5, value < 1000)"}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  />
                }
                label="Enable Agent"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Notification Channels */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Notification Channels
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                    <Typography variant="body2">Email</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={config.notification_config.email}
                        onChange={() => handleNotificationToggle('email')}
                      />
                    }
                    label={<Typography variant="caption">{config.notification_config.email ? 'On' : 'Off'}</Typography>}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SmsIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                    <Typography variant="body2">SMS</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={config.notification_config.sms}
                        onChange={() => handleNotificationToggle('sms')}
                      />
                    }
                    label={<Typography variant="caption">{config.notification_config.sms ? 'On' : 'Off'}</Typography>}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                    <Typography variant="body2">Voice Call</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={config.notification_config.voice_call}
                        onChange={() => handleNotificationToggle('voice_call')}
                      />
                    }
                    label={<Typography variant="caption">{config.notification_config.voice_call ? 'On' : 'Off'}</Typography>}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                    <Typography variant="body2">Slack</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={config.notification_config.slack}
                        onChange={() => handleNotificationToggle('slack')}
                      />
                    }
                    label={<Typography variant="caption">{config.notification_config.slack ? 'On' : 'Off'}</Typography>}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                    <Typography variant="body2">Teams</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={config.notification_config.teams}
                        onChange={() => handleNotificationToggle('teams')}
                      />
                    }
                    label={<Typography variant="caption">{config.notification_config.teams ? 'On' : 'Off'}</Typography>}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={8}>
              <Card variant="outlined" sx={{ bgcolor: 'primary.50', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      🤖 AI Agent Analysis
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={config.notification_config.ai_agent}
                        onChange={() => handleNotificationToggle('ai_agent')}
                      />
                    }
                    label={
                      <Typography variant="caption">
                        {config.notification_config.ai_agent
                          ? 'AI analysis enabled'
                          : 'Enable AI analysis'}
                      </Typography>
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Notification Recipients */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Notification Recipients
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newRecipient.type}
                    label="Type"
                    onChange={(e) => setNewRecipient({ ...newRecipient, type: e.target.value })}
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                    <MenuItem value="slack_channel">Slack</MenuItem>
                    <MenuItem value="teams_webhook">Teams</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={7}>
                <TextField
                  fullWidth
                  size="small"
                  label="Value"
                  value={newRecipient.value}
                  onChange={(e) => setNewRecipient({ ...newRecipient, value: e.target.value })}
                  placeholder={
                    newRecipient.type === 'email'
                      ? 'user@example.com'
                      : newRecipient.type === 'phone'
                      ? '+1234567890'
                      : newRecipient.type === 'slack_channel'
                      ? '#alerts'
                      : 'https://...'
                  }
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddRecipient}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>

          {config.notification_recipients.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {config.notification_recipients.map((recipient, index) => (
                <Chip
                  key={index}
                  label={`${recipient.type}: ${recipient.value}`}
                  onDelete={() => handleRemoveRecipient(index)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              No recipients configured. Add recipients above to receive notifications.
            </Alert>
          )}
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgentConfigForm;
