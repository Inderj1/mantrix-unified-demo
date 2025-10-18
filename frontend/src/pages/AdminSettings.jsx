import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import authConfig from '../auth_config.json';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function AdminSettings() {
  const [tabValue, setTabValue] = useState(0);
  const [config, setConfig] = useState(authConfig);
  const [newEmail, setNewEmail] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAuthToggle = (key) => {
    setConfig(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        [key]: !prev.authentication[key]
      }
    }));
  };

  const handleRouteToggle = (route) => {
    setConfig(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        protected_routes: {
          ...prev.authentication.protected_routes,
          [route]: !prev.authentication.protected_routes[route]
        }
      }
    }));
  };

  const handleAddEmail = () => {
    if (newEmail && !config.authentication.access_control.authorized_emails.includes(newEmail)) {
      setConfig(prev => ({
        ...prev,
        authentication: {
          ...prev.authentication,
          access_control: {
            ...prev.authentication.access_control,
            authorized_emails: [...prev.authentication.access_control.authorized_emails, newEmail]
          }
        }
      }));
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (email) => {
    setConfig(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        access_control: {
          ...prev.authentication.access_control,
          authorized_emails: prev.authentication.access_control.authorized_emails.filter(e => e !== email)
        }
      }
    }));
  };

  const handleAddDomain = () => {
    if (newDomain && !config.authentication.access_control.authorized_domains.includes(newDomain)) {
      setConfig(prev => ({
        ...prev,
        authentication: {
          ...prev.authentication,
          access_control: {
            ...prev.authentication.access_control,
            authorized_domains: [...prev.authentication.access_control.authorized_domains, newDomain]
          }
        }
      }));
      setNewDomain('');
    }
  };

  const handleRemoveDomain = (domain) => {
    setConfig(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        access_control: {
          ...prev.authentication.access_control,
          authorized_domains: prev.authentication.access_control.authorized_domains.filter(d => d !== domain)
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      // In a real app, this would save to backend
      localStorage.setItem('authConfig', JSON.stringify(config));
      setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save settings', severity: 'error' });
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Settings
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Authentication" />
          <Tab label="Access Control" />
          <Tab label="Protected Routes" />
          <Tab label="SSO Settings" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Authentication Settings
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={config.authentication.enabled}
              onChange={() => handleAuthToggle('enabled')}
            />
          }
          label="Enable Authentication"
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          When disabled, all users can access the application without signing in.
        </Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Authorized Emails
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            label="Email Address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
          />
          <Button
            variant="contained"
            onClick={handleAddEmail}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Box>
        <List>
          {config.authentication.access_control.authorized_emails.map((email) => (
            <ListItem key={email}>
              <ListItemText primary={email} />
              <ListItemSecondaryAction>
                {config.authentication.access_control.roles.admin.includes(email) && (
                  <Chip label="Admin" size="small" color="primary" sx={{ mr: 1 }} />
                )}
                <IconButton edge="end" onClick={() => handleRemoveEmail(email)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Authorized Domains
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            label="Domain (e.g., company.com)"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
          />
          <Button
            variant="contained"
            onClick={handleAddDomain}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Box>
        <List>
          {config.authentication.access_control.authorized_domains.map((domain) => (
            <ListItem key={domain}>
              <ListItemText primary={domain} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleRemoveDomain(domain)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Protected Routes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select which routes require authentication.
        </Typography>
        <List>
          {Object.entries(config.authentication.protected_routes).map(([route, isProtected]) => (
            <ListItem key={route}>
              <ListItemText 
                primary={route}
                secondary={isProtected ? 'Authentication required' : 'Public access'}
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={isProtected}
                  onChange={() => handleRouteToggle(route)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          SSO Configuration
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={config.authentication.sso.enabled}
              onChange={() => setConfig(prev => ({
                ...prev,
                authentication: {
                  ...prev.authentication,
                  sso: {
                    ...prev.authentication.sso,
                    enabled: !prev.authentication.sso.enabled
                  }
                }
              }))}
            />
          }
          label="Enable SSO"
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Allow users to sign in using their organization's SSO provider.
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom>
          Enabled Providers:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {config.authentication.sso.providers.map((provider) => (
            <Chip key={provider} label={provider} color="primary" />
          ))}
        </Box>
        
        <Alert severity="info" sx={{ mt: 3 }}>
          SSO configuration requires setup in your Clerk dashboard. Visit the Clerk dashboard to configure SSO providers.
        </Alert>
      </TabPanel>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<SaveIcon />}
        >
          Save Settings
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default AdminSettings;