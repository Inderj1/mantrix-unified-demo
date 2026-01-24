import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Divider,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import PhoneIcon from '@mui/icons-material/Phone';
import NotificationsIcon from '@mui/icons-material/Notifications';

const AgentConfigPage = ({ darkMode = false }) => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const getColors = (darkMode) => ({
    primary: darkMode ? '#4da6ff' : '#0a6ed1',
    text: darkMode ? '#e6edf3' : '#1e293b',
    textSecondary: darkMode ? '#8b949e' : '#64748b',
    background: darkMode ? '#0d1117' : '#f8fbfd',
    paper: darkMode ? '#161b22' : '#ffffff',
    cardBg: darkMode ? '#21262d' : '#ffffff',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  });

  const colors = getColors(darkMode);

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
    fetchAgentConfig();
  }, [agentId]);

  const fetchAgentConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/pulse/monitors/${agentId}`);
      const data = await response.json();

      if (data.success) {
        const monitor = data.monitor;
        setConfig({
          name: monitor.name || '',
          description: monitor.description || '',
          severity: monitor.severity || 'medium',
          frequency: monitor.frequency || 'daily',
          enabled: monitor.enabled !== false,
          alert_condition: monitor.alert_condition || '',
          notification_config: monitor.notification_config || {
            email: false,
            sms: false,
            voice_call: false,
            slack: false,
            teams: false,
            ai_agent: false,
          },
          notification_recipients: monitor.notification_recipients || [],
        });
      } else {
        setError('Failed to load agent configuration');
      }
    } catch (err) {
      setError(`Error loading configuration: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`/api/v1/pulse/monitors/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, bgcolor: colors.background, minHeight: '100vh' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/pulse')} sx={{ color: colors.text }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ color: colors.text }}>
          Agent Configuration
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configuration saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: colors.paper, borderColor: colors.border, border: '1px solid' }}>
            <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
              Basic Settings
            </Typography>
            <Divider sx={{ mb: 3, borderColor: colors.border }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Agent Name"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
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
                  helperText="SQL condition to trigger alert (e.g., count > 5, value < 1000)"
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
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: colors.paper, borderColor: colors.border, border: '1px solid' }}>
            <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
              Notification Channels
            </Typography>
            <Divider sx={{ mb: 3, borderColor: colors.border }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6} lg={3}>
                <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: colors.primary }} />
                      <Typography variant="subtitle1" sx={{ color: colors.text }}>Email</Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.notification_config.email}
                          onChange={() => handleNotificationToggle('email')}
                        />
                      }
                      label={<Typography sx={{ color: colors.textSecondary }}>{config.notification_config.email ? 'Enabled' : 'Disabled'}</Typography>}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SmsIcon sx={{ mr: 1, color: colors.primary }} />
                      <Typography variant="subtitle1" sx={{ color: colors.text }}>SMS</Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.notification_config.sms}
                          onChange={() => handleNotificationToggle('sms')}
                        />
                      }
                      label={<Typography sx={{ color: colors.textSecondary }}>{config.notification_config.sms ? 'Enabled' : 'Disabled'}</Typography>}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ mr: 1, color: colors.primary }} />
                      <Typography variant="subtitle1" sx={{ color: colors.text }}>Voice Call</Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.notification_config.voice_call}
                          onChange={() => handleNotificationToggle('voice_call')}
                        />
                      }
                      label={<Typography sx={{ color: colors.textSecondary }}>{config.notification_config.voice_call ? 'Enabled' : 'Disabled'}</Typography>}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <NotificationsIcon sx={{ mr: 1, color: colors.primary }} />
                      <Typography variant="subtitle1" sx={{ color: colors.text }}>Slack</Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.notification_config.slack}
                          onChange={() => handleNotificationToggle('slack')}
                        />
                      }
                      label={<Typography sx={{ color: colors.textSecondary }}>{config.notification_config.slack ? 'Enabled' : 'Disabled'}</Typography>}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <NotificationsIcon sx={{ mr: 1, color: colors.primary }} />
                      <Typography variant="subtitle1" sx={{ color: colors.text }}>Teams</Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.notification_config.teams}
                          onChange={() => handleNotificationToggle('teams')}
                        />
                      }
                      label={<Typography sx={{ color: colors.textSecondary }}>{config.notification_config.teams ? 'Enabled' : 'Disabled'}</Typography>}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ bgcolor: darkMode ? 'rgba(77, 166, 255, 0.15)' : 'primary.50', borderColor: colors.border }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.text }}>
                        🤖 AI Agent Analysis
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.notification_config.ai_agent}
                          onChange={() => handleNotificationToggle('ai_agent')}
                        />
                      }
                      label={
                        <Typography sx={{ color: colors.textSecondary }}>
                          {config.notification_config.ai_agent
                            ? 'AI will analyze alerts and provide recommendations'
                            : 'Enable AI-powered alert analysis'}
                        </Typography>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Notification Recipients */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: colors.paper, borderColor: colors.border, border: '1px solid' }}>
            <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
              Notification Recipients
            </Typography>
            <Divider sx={{ mb: 3, borderColor: colors.border }} />

            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newRecipient.type}
                      label="Type"
                      onChange={(e) => setNewRecipient({ ...newRecipient, type: e.target.value })}
                    >
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="phone">Phone</MenuItem>
                      <MenuItem value="slack_channel">Slack Channel</MenuItem>
                      <MenuItem value="teams_webhook">Teams Webhook</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
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
                    variant="contained"
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
          </Paper>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate('/pulse')}>
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
    </Container>
  );
};

export default AgentConfigPage;
