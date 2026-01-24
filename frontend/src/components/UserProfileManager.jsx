import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Chip,
  Alert,
  Paper,
  Stack,
  Autocomplete,
  Avatar,
  Divider,
  alpha,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import WorkIcon from '@mui/icons-material/Work';
import TuneIcon from '@mui/icons-material/Tune';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BuildIcon from '@mui/icons-material/Build';
import { useUser } from '@clerk/clerk-react';
import { apiService } from '../services/api';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  secondary: darkMode ? '#5cb3ff' : '#002352',
  orange: '#ff751f',
  dark: darkMode ? '#8b949e' : '#354a5f',
  slate: darkMode ? '#8b949e' : '#475569',
  grey: darkMode ? '#8b949e' : '#64748b',
  light: darkMode ? '#6e7681' : '#94a3b8',
  success: darkMode ? '#3fb950' : '#10b981',
  warning: darkMode ? '#d29922' : '#f59e0b',
  error: darkMode ? '#f85149' : '#ef4444',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const UserProfileManager = ({ darkMode = false }) => {
  const colors = getColors(darkMode);
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [roleTemplates, setRoleTemplates] = useState([]);
  const [selectedRole, setSelectedRole] = useState('custom');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, type: '', message: '' });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState({
    user_id: 'persona',
    first_name: '',
    last_name: '',
    email: '',
    role: 'custom',
    department: '',
    company: '',
    reporting_frequency: 'weekly',
    custom_context: '',
    insight_focuses: [],
    key_metrics: [],
    preferred_visualizations: []
  });

  const insightFocusOptions = [
    { value: 'financial_performance', label: 'Financial Performance' },
    { value: 'operational_efficiency', label: 'Operational Efficiency' },
    { value: 'revenue_growth', label: 'Revenue Growth' },
    { value: 'cost_optimization', label: 'Cost Optimization' },
    { value: 'customer_analytics', label: 'Customer Analytics' },
    { value: 'product_performance', label: 'Product Performance' },
    { value: 'profitability', label: 'Profitability' },
    { value: 'cash_flow', label: 'Cash Flow' },
    { value: 'inventory_management', label: 'Inventory Management' },
    { value: 'supply_chain', label: 'Supply Chain' },
  ];

  const visualizationOptions = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'scatter', label: 'Scatter Plot' },
    { value: 'heatmap', label: 'Heatmap' },
    { value: 'table', label: 'Data Table' },
  ];

  const roleOptions = [
    { value: 'cfo', label: 'CFO / Finance Leader', icon: <AccountBalanceIcon />, color: '#00357a', description: 'Financial metrics, P&L, cash flow focus' },
    { value: 'coo', label: 'COO / Operations Leader', icon: <SettingsSuggestIcon />, color: '#1a5a9e', description: 'Operational efficiency, supply chain focus' },
    { value: 'supply_chain_manager', label: 'Supply Chain Manager', icon: <LocalShippingIcon />, color: '#354a5f', description: 'Inventory, logistics, supplier focus' },
    { value: 'sales_director', label: 'Sales Director', icon: <TrendingUpIcon />, color: '#10b981', description: 'Revenue, customer, pipeline focus' },
    { value: 'procurement_manager', label: 'Procurement Manager', icon: <ShoppingCartIcon />, color: '#7c3aed', description: 'Vendor, cost, purchasing focus' },
    { value: 'analyst', label: 'Business Analyst', icon: <AnalyticsIcon />, color: '#f59e0b', description: 'Data analysis, reporting focus' },
    { value: 'custom', label: 'Custom Role', icon: <BuildIcon />, color: '#64748b', description: 'Define your own focus areas' },
  ];

  useEffect(() => {
    if (user && !profile) {
      if (!formData.first_name && !formData.email) {
        setFormData(prev => ({
          ...prev,
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          email: user.primaryEmailAddress?.emailAddress || ''
        }));
      }
    }
  }, [user, profile]);

  useEffect(() => {
    loadRoleTemplates();
    loadUserProfile();
  }, []);

  const loadRoleTemplates = async () => {
    try {
      const response = await apiService.getUserProfileTemplates();
      const templates = Array.isArray(response.data) ? response.data : response.data || response;
      setRoleTemplates(Array.isArray(templates) ? templates : []);
    } catch (error) {
      console.error('Failed to load role templates:', error);
      setRoleTemplates([]);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await apiService.getUserProfile('persona');
      const userProfile = response.data || response;
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          ...userProfile,
          first_name: userProfile.first_name || userProfile.name?.split(' ')[0] || '',
          last_name: userProfile.last_name || userProfile.name?.split(' ').slice(1).join(' ') || '',
          insight_focuses: userProfile.insight_focuses || [],
          key_metrics: userProfile.key_metrics || [],
          preferred_visualizations: userProfile.preferred_visualizations || []
        });
        setSelectedRole(userProfile.role);
      }
    } catch (error) {
      console.log('No existing persona found, starting fresh');
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setHasUnsavedChanges(true);

    const template = roleTemplates.find(t => t.role === role);
    if (template && role !== 'custom') {
      setFormData({
        ...formData,
        role: role,
        insight_focuses: template.insight_focuses || [],
        key_metrics: template.key_metrics || [],
        preferred_visualizations: template.preferred_visualizations || []
      });
    } else {
      setFormData({
        ...formData,
        role: role
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setSaveStatus({ show: false, type: '', message: '' });

    try {
      const dataToSave = {
        ...formData,
        name: `${formData.first_name} ${formData.last_name}`.trim(),
      };

      let response;
      if (profile) {
        response = await apiService.updateUserProfile('persona', dataToSave);
      } else {
        response = await apiService.createUserProfile(dataToSave);
      }

      const savedProfile = response.data || response;
      setProfile(savedProfile);
      setHasUnsavedChanges(false);
      setSaveStatus({
        show: true,
        type: 'success',
        message: 'Profile saved! AI responses will now be personalized to your role.'
      });
    } catch (error) {
      setSaveStatus({
        show: true,
        type: 'error',
        message: `Failed to save: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const first = formData.first_name?.[0] || user?.firstName?.[0] || '';
    const last = formData.last_name?.[0] || user?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <Box>
      {/* Save Status Alert */}
      {saveStatus.show && (
        <Alert
          severity={saveStatus.type}
          onClose={() => setSaveStatus({ show: false, type: '', message: '' })}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {saveStatus.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - User Profile */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${colors.border}`,
              bgcolor: colors.paper,
              height: '100%',
            }}
          >
            {/* Profile Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                src={user?.imageUrl}
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: colors.primary,
                  fontSize: '1.5rem',
                  fontWeight: 600,
                }}
              >
                {!user?.imageUrl && getInitials()}
              </Avatar>
              <Typography variant="h6" fontWeight={600} sx={{ color: colors.text }}>
                {formData.first_name || formData.last_name
                  ? `${formData.first_name} ${formData.last_name}`.trim()
                  : 'Your Name'}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                {formData.email || 'your@email.com'}
              </Typography>
              {formData.role && formData.role !== 'custom' && (
                <Chip
                  label={roleOptions.find(r => r.value === formData.role)?.label || formData.role}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: alpha(colors.primary, 0.1),
                    color: colors.primary,
                    fontWeight: 500,
                  }}
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Profile Fields */}
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <PersonIcon sx={{ fontSize: 18, color: colors.primary }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.text }}>
                  Personal Information
                </Typography>
              </Stack>

              <TextField
                fullWidth
                size="small"
                label="First Name"
                value={formData.first_name}
                InputProps={{ readOnly: true }}
                sx={{
                  '& .MuiInputBase-input': {
                    color: colors.text,
                    bgcolor: alpha(colors.grey, 0.05),
                  }
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Last Name"
                value={formData.last_name}
                InputProps={{ readOnly: true }}
                sx={{
                  '& .MuiInputBase-input': {
                    color: colors.text,
                    bgcolor: alpha(colors.grey, 0.05),
                  }
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Email"
                type="email"
                value={formData.email}
                InputProps={{ readOnly: true }}
                sx={{
                  '& .MuiInputBase-input': {
                    color: colors.text,
                    bgcolor: alpha(colors.grey, 0.05),
                  }
                }}
              />

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <BusinessIcon sx={{ fontSize: 18, color: colors.primary }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.text }}>
                  Organization
                </Typography>
              </Stack>

              <TextField
                fullWidth
                size="small"
                label="Company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Right Column - AI Persona Settings */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Role Selection */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${colors.border}`,
                bgcolor: colors.paper,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(colors.orange, 0.15) }}>
                  <SmartToyIcon sx={{ fontSize: 20, color: colors.orange }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
                    AI Persona
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    Select your role to customize AI responses
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={1.5}>
                {roleOptions.map((role) => (
                  <Grid item xs={6} sm={4} key={role.value}>
                    <Paper
                      elevation={0}
                      onClick={() => handleRoleChange(role.value)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: `2px solid ${selectedRole === role.value ? colors.primary : colors.border}`,
                        bgcolor: selectedRole === role.value ? alpha(colors.primary, 0.05) : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: colors.primary,
                          bgcolor: alpha(colors.primary, 0.03),
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: alpha(role.color, 0.12),
                            color: role.color,
                          }}
                        >
                          {React.cloneElement(role.icon, { sx: { fontSize: 18 } })}
                        </Avatar>
                        {selectedRole === role.value && (
                          <CheckCircleIcon sx={{ fontSize: 16, color: colors.primary, ml: 'auto' }} />
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, fontSize: '0.8rem' }}>
                        {role.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem' }}>
                        {role.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Insight Preferences */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${colors.border}`,
                bgcolor: colors.paper,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(colors.primary, 0.15) }}>
                  <TuneIcon sx={{ fontSize: 20, color: colors.primary }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
                    Insight Preferences
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    Customize what AI focuses on in responses
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2.5}>
                <Autocomplete
                  multiple
                  size="small"
                  options={insightFocusOptions}
                  getOptionLabel={(option) => option.label}
                  value={insightFocusOptions.filter(opt => formData.insight_focuses.includes(opt.value))}
                  onChange={(event, newValue) => {
                    handleInputChange('insight_focuses', newValue.map(v => v.value));
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Focus Areas" placeholder="Select areas..." />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.label}
                        size="small"
                        {...getTagProps({ index })}
                        sx={{
                          bgcolor: alpha(colors.primary, 0.1),
                          color: colors.primary,
                        }}
                      />
                    ))
                  }
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Key Metrics"
                  placeholder="e.g., revenue, margin, inventory turns"
                  value={formData.key_metrics.join(', ')}
                  onChange={(e) => handleInputChange('key_metrics', e.target.value.split(',').map(m => m.trim()).filter(m => m))}
                  helperText="Comma-separated metrics to highlight in insights"
                />

                <Autocomplete
                  multiple
                  size="small"
                  options={visualizationOptions}
                  getOptionLabel={(option) => option.label}
                  value={visualizationOptions.filter(opt => formData.preferred_visualizations.includes(opt.value))}
                  onChange={(event, newValue) => {
                    handleInputChange('preferred_visualizations', newValue.map(v => v.value));
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Preferred Charts" placeholder="Select chart types..." />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.label}
                        size="small"
                        {...getTagProps({ index })}
                        sx={{
                          bgcolor: alpha(colors.secondary, 0.1),
                          color: colors.secondary,
                        }}
                      />
                    ))
                  }
                />

                <FormControl fullWidth size="small">
                  <InputLabel>Reporting Frequency</InputLabel>
                  <Select
                    value={formData.reporting_frequency}
                    label="Reporting Frequency"
                    onChange={(e) => handleInputChange('reporting_frequency', e.target.value)}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  label="Additional Context for AI"
                  placeholder="Add any specific context, priorities, or preferences for AI responses..."
                  value={formData.custom_context}
                  onChange={(e) => handleInputChange('custom_context', e.target.value)}
                />
              </Stack>
            </Paper>

            {/* Save Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
                disabled={loading || !hasUnsavedChanges}
                sx={{
                  px: 4,
                  py: 1.2,
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.secondary },
                  '&.Mui-disabled': { bgcolor: alpha(colors.grey, 0.3) },
                }}
              >
                {loading ? 'Saving...' : hasUnsavedChanges ? 'Save Profile' : 'Saved'}
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfileManager;
