import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  alpha,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import WorkIcon from '@mui/icons-material/Work';
import TuneIcon from '@mui/icons-material/Tune';
import { useUser } from '@clerk/clerk-react';
import { apiService } from '../services/api';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  secondary: darkMode ? '#5cb3ff' : '#0854a0',
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
    name: '',
    email: '',
    role: 'custom',
    department: '',
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
    { value: 'cash_flow', label: 'Cash Flow' }
  ];

  const visualizationOptions = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'scatter', label: 'Scatter Plot' },
    { value: 'heatmap', label: 'Heatmap' }
  ];

  useEffect(() => {
    if (user && !profile) {
      if (!formData.name && !formData.email) {
        const userName = user.fullName || user.firstName || '';
        const userEmail = user.primaryEmailAddress?.emailAddress || '';

        setFormData(prev => ({
          ...prev,
          name: userName,
          email: userEmail
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

  const handleRoleChange = (event) => {
    const role = event.target.value;
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
      let response;
      if (profile) {
        response = await apiService.updateUserProfile('persona', formData);
      } else {
        response = await apiService.createUserProfile(formData);
      }

      const savedProfile = response.data || response;
      setProfile(savedProfile);
      setHasUnsavedChanges(false);
      setSaveStatus({
        show: true,
        type: 'success',
        message: 'Persona saved successfully! All insights will now be tailored to this role.'
      });
    } catch (error) {
      setSaveStatus({
        show: true,
        type: 'error',
        message: `Failed to save persona: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleTemplate = (role) => {
    return roleTemplates.find(t => t.role === role);
  };

  const currentTemplate = getRoleTemplate(selectedRole);

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: alpha(colors.primary, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.primary,
              }}
            >
              <PersonIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight={600} sx={{ color: colors.text }}>
              AI Persona
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Select your business role to get personalized AI insights tailored to your perspective
          </Typography>
        </Box>

        {/* Save Status Alert */}
        {saveStatus.show && (
          <Alert
            severity={saveStatus.type}
            onClose={() => setSaveStatus({ show: false, type: '', message: '' })}
            sx={{
              borderRadius: 2,
              '& .MuiAlert-icon': { color: saveStatus.type === 'success' ? colors.success : colors.error },
            }}
          >
            {saveStatus.message}
          </Alert>
        )}

        {/* Basic Information */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
            bgcolor: colors.paper,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${colors.primary} 0%, ${alpha(colors.primary, 0.5)} 100%)`,
            },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: alpha(colors.primary, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.primary,
              }}
            >
              <PersonIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
              Basic Information
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Reporting Frequency</InputLabel>
                <Select
                  value={formData.reporting_frequency}
                  label="Reporting Frequency"
                  onChange={(e) => handleInputChange('reporting_frequency', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(colors.primary, 0.2) },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                  }}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Role Selection */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
            bgcolor: colors.paper,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${colors.secondary} 0%, ${alpha(colors.secondary, 0.5)} 100%)`,
            },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: alpha(colors.secondary, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.secondary,
              }}
            >
              <WorkIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
              Role & Expertise
            </Typography>
          </Stack>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              label="Role"
              onChange={handleRoleChange}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(colors.primary, 0.2) },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
              }}
            >
              <MenuItem value="custom">Custom</MenuItem>
              {roleTemplates.map((template) => (
                <MenuItem key={template.role} value={template.role}>
                  {template.display_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {currentTemplate && currentTemplate.role !== 'custom' && (
            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 2,
                bgcolor: alpha(colors.primary, 0.05),
                border: `1px solid ${alpha(colors.primary, 0.1)}`,
                borderRadius: 1.5,
              }}
            >
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                {currentTemplate.description}
              </Typography>
            </Paper>
          )}
        </Paper>

        {/* Preferences */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
            bgcolor: colors.paper,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${colors.dark} 0%, ${alpha(colors.dark, 0.5)} 100%)`,
            },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: alpha(colors.dark, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.dark,
              }}
            >
              <TuneIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
              Insight Preferences
            </Typography>
          </Stack>
          <Stack spacing={3}>
            <Autocomplete
              multiple
              options={insightFocusOptions}
              getOptionLabel={(option) => option.label}
              value={insightFocusOptions.filter(opt => formData.insight_focuses.includes(opt.value))}
              onChange={(event, newValue) => {
                handleInputChange('insight_focuses', newValue.map(v => v.value));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Focus Areas"
                  placeholder="Select areas of interest"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.label}
                    {...getTagProps({ index })}
                    sx={{
                      bgcolor: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      '& .MuiChip-deleteIcon': { color: colors.primary },
                    }}
                  />
                ))
              }
            />

            <TextField
              fullWidth
              label="Key Metrics"
              placeholder="Enter metrics separated by commas (e.g., revenue, profit, margin)"
              value={formData.key_metrics.join(', ')}
              onChange={(e) => handleInputChange('key_metrics', e.target.value.split(',').map(m => m.trim()).filter(m => m))}
              helperText="These metrics will be highlighted in your insights"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                  '&:hover fieldset': { borderColor: colors.primary },
                  '&.Mui-focused fieldset': { borderColor: colors.primary },
                },
              }}
            />

            <Autocomplete
              multiple
              options={visualizationOptions}
              getOptionLabel={(option) => option.label}
              value={visualizationOptions.filter(opt => formData.preferred_visualizations.includes(opt.value))}
              onChange={(event, newValue) => {
                handleInputChange('preferred_visualizations', newValue.map(v => v.value));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Preferred Visualizations"
                  placeholder="Select chart types"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.label}
                    {...getTagProps({ index })}
                    sx={{
                      bgcolor: alpha(colors.secondary, 0.1),
                      color: colors.secondary,
                      '& .MuiChip-deleteIcon': { color: colors.secondary },
                    }}
                  />
                ))
              }
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional Context"
              placeholder="Add any additional context that should be considered when generating insights..."
              value={formData.custom_context}
              onChange={(e) => handleInputChange('custom_context', e.target.value)}
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

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSaveProfile}
            disabled={loading || !hasUnsavedChanges}
            sx={{
              bgcolor: colors.primary,
              '&:hover': { bgcolor: colors.secondary },
              '&.Mui-disabled': { bgcolor: alpha(colors.grey, 0.3) },
            }}
          >
            {loading ? 'Saving...' : hasUnsavedChanges ? 'Save Persona' : 'Saved'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default UserProfileManager;
