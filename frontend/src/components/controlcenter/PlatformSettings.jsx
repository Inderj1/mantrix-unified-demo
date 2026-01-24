import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

// Blue/grey color palette
const colors = {
  primary: '#0a6ed1',
  secondary: '#0854a0',
  dark: '#354a5f',
  slate: '#475569',
  grey: '#64748b',
  light: '#94a3b8',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  text: '#1e293b',
  bg: '#f8fbfd',
};

const PlatformSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    slackNotifications: false,
    autoRefresh: true,
    darkMode: false,
    dataRetention: 90,
    cacheExpiry: 24,
  });

  const [automationJobs, setAutomationJobs] = useState([
    {
      id: 1,
      name: 'Daily Data Sync',
      schedule: 'Daily at 2:00 AM',
      status: 'active',
      lastRun: '2025-10-18 02:00',
      nextRun: '2025-10-19 02:00',
    },
    {
      id: 2,
      name: 'Weekly Report Generation',
      schedule: 'Monday at 9:00 AM',
      status: 'active',
      lastRun: '2025-10-14 09:00',
      nextRun: '2025-10-21 09:00',
    },
    {
      id: 3,
      name: 'Cache Cleanup',
      schedule: 'Every 6 hours',
      status: 'paused',
      lastRun: '2025-10-18 12:00',
      nextRun: 'Paused',
    },
  ]);

  const handleSettingChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked !== undefined ? event.target.checked : event.target.value,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.success;
      case 'paused': return colors.warning;
      case 'failed': return colors.error;
      default: return colors.grey;
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: alpha(colors.primary, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.primary,
                }}
              >
                <SettingsIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
                General Settings
              </Typography>
            </Stack>
            <Stack spacing={2.5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoRefresh}
                    onChange={handleSettingChange('autoRefresh')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.primary },
                    }}
                  />
                }
                label={<Typography variant="body2" sx={{ color: colors.dark }}>Auto-refresh dashboards</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.darkMode}
                    onChange={handleSettingChange('darkMode')}
                    disabled
                  />
                }
                label={<Typography variant="body2" sx={{ color: colors.light }}>Dark mode (coming soon)</Typography>}
              />
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: colors.grey }}>Data Retention (days)</InputLabel>
                <Select
                  value={settings.dataRetention}
                  label="Data Retention (days)"
                  onChange={handleSettingChange('dataRetention')}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(colors.primary, 0.2) },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                  }}
                >
                  <MenuItem value={30}>30 days</MenuItem>
                  <MenuItem value={60}>60 days</MenuItem>
                  <MenuItem value={90}>90 days</MenuItem>
                  <MenuItem value={180}>180 days</MenuItem>
                  <MenuItem value={365}>1 year</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: colors.grey }}>Cache Expiry (hours)</InputLabel>
                <Select
                  value={settings.cacheExpiry}
                  label="Cache Expiry (hours)"
                  onChange={handleSettingChange('cacheExpiry')}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(colors.primary, 0.2) },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                  }}
                >
                  <MenuItem value={1}>1 hour</MenuItem>
                  <MenuItem value={6}>6 hours</MenuItem>
                  <MenuItem value={12}>12 hours</MenuItem>
                  <MenuItem value={24}>24 hours</MenuItem>
                  <MenuItem value={48}>48 hours</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: alpha(colors.secondary, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.secondary,
                }}
              >
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
                Notifications
              </Typography>
            </Stack>
            <Stack spacing={2.5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleSettingChange('emailNotifications')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.primary },
                    }}
                  />
                }
                label={<Typography variant="body2" sx={{ color: colors.dark }}>Email notifications</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.slackNotifications}
                    onChange={handleSettingChange('slackNotifications')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.primary },
                    }}
                  />
                }
                label={<Typography variant="body2" sx={{ color: colors.dark }}>Slack notifications</Typography>}
              />
              <TextField
                fullWidth
                size="small"
                label="Notification Email"
                defaultValue="admin@example.com"
                helperText="Receive alerts and reports"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Slack Webhook URL"
                placeholder="https://hooks.slack.com/..."
                helperText="Optional Slack integration"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Automation Jobs */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: alpha(colors.dark, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.dark,
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
                  Automation & Scheduling
                </Typography>
              </Stack>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                size="small"
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.secondary },
                }}
              >
                New Job
              </Button>
            </Stack>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: colors.grey, fontWeight: 600, borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>Job Name</TableCell>
                    <TableCell sx={{ color: colors.grey, fontWeight: 600, borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>Schedule</TableCell>
                    <TableCell sx={{ color: colors.grey, fontWeight: 600, borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>Status</TableCell>
                    <TableCell sx={{ color: colors.grey, fontWeight: 600, borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>Last Run</TableCell>
                    <TableCell sx={{ color: colors.grey, fontWeight: 600, borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>Next Run</TableCell>
                    <TableCell align="right" sx={{ color: colors.grey, fontWeight: 600, borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {automationJobs.map((job) => (
                    <TableRow
                      key={job.id}
                      hover
                      sx={{
                        '&:hover': { bgcolor: alpha(colors.primary, 0.03) },
                        '& td': { borderBottom: `1px solid ${alpha(colors.primary, 0.05)}` },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>
                          {job.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: colors.grey }}>
                          {job.schedule}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.status}
                          size="small"
                          sx={{
                            height: 24,
                            bgcolor: alpha(getStatusColor(job.status), 0.1),
                            color: getStatusColor(job.status),
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            textTransform: 'capitalize',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: colors.grey }}>
                          {job.lastRun}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: colors.grey }}>
                          {job.nextRun}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            sx={{
                              color: colors.primary,
                              '&:hover': { bgcolor: alpha(colors.primary, 0.1) },
                            }}
                          >
                            {job.status === 'active' ? <PauseIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{
                              color: colors.primary,
                              '&:hover': { bgcolor: alpha(colors.primary, 0.1) },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{
                              color: colors.error,
                              '&:hover': { bgcolor: alpha(colors.error, 0.1) },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              sx={{
                borderColor: colors.grey,
                color: colors.grey,
                '&:hover': { borderColor: colors.dark, bgcolor: alpha(colors.grey, 0.05) },
              }}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.primary,
                '&:hover': { bgcolor: colors.secondary },
              }}
            >
              Save Settings
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlatformSettings;
