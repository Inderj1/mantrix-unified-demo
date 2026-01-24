import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  IconButton,
  Avatar,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  CloudQueue as CloudIcon,
} from '@mui/icons-material';

const availableIcons = [
  { name: 'Email', component: EmailIcon },
  { name: 'Description', component: DescriptionIcon },
  { name: 'Assessment', component: AssessmentIcon },
  { name: 'Settings', component: SettingsIcon },
  { name: 'BarChart', component: BarChartIcon },
  { name: 'PieChart', component: PieChartIcon },
  { name: 'TrendingUp', component: TrendingUpIcon },
  { name: 'Speed', component: SpeedIcon },
  { name: 'Storage', component: StorageIcon },
  { name: 'Cloud', component: CloudIcon },
];

const availableColors = [
  { name: 'Blue', value: '#00357a' },
  { name: 'Dark Blue', value: '#002352' },
  { name: 'Slate', value: '#64748b' },
  { name: 'Blue Grey', value: '#354a5f' },
  { name: 'Light Blue', value: '#0ea5e9' },
  { name: 'Navy', value: '#1e3a5f' },
  { name: 'Steel', value: '#475569' },
  { name: 'Grey', value: '#6b7280' },
  { name: 'Dark Slate', value: '#334155' },
  { name: 'Charcoal', value: '#1e293b' },
];

const CustomTypeConfig = ({ open, onClose, onSave, editType = null, moduleType = 'email' }) => {
  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    icon: 'Email',
    color: '#00357a',
  });

  useEffect(() => {
    if (editType) {
      setFormData({
        display_name: editType.display_name || '',
        description: editType.description || '',
        icon: editType.icon || 'Email',
        color: editType.color || '#00357a',
      });
    } else {
      setFormData({
        display_name: '',
        description: '',
        icon: 'Email',
        color: '#00357a',
      });
    }
  }, [editType, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.display_name.trim()) {
      alert('Please enter a display name');
      return;
    }
    onSave(formData);
    onClose();
  };

  const selectedIcon = availableIcons.find((icon) => icon.name === formData.icon)?.component || EmailIcon;
  const SelectedIconComponent = selectedIcon;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {editType ? 'Edit Custom Type' : 'Create Custom Type'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Display Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Display Name"
                value={formData.display_name}
                onChange={(e) => handleChange('display_name', e.target.value)}
                placeholder="e.g., Customer Feedback, Technical Specifications"
                required
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of this type..."
              />
            </Grid>

            {/* Icon Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Select Icon
              </Typography>
              <Grid container spacing={1}>
                {availableIcons.map((icon) => {
                  const IconComp = icon.component;
                  const isSelected = formData.icon === icon.name;
                  return (
                    <Grid item key={icon.name}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          cursor: 'pointer',
                          bgcolor: isSelected ? formData.color : alpha(formData.color, 0.1),
                          color: isSelected ? 'white' : formData.color,
                          border: '2px solid',
                          borderColor: isSelected ? formData.color : 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            bgcolor: isSelected ? formData.color : alpha(formData.color, 0.2),
                          },
                        }}
                        onClick={() => handleChange('icon', icon.name)}
                      >
                        <IconComp />
                      </Avatar>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>

            {/* Color Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Select Color
              </Typography>
              <Grid container spacing={1}>
                {availableColors.map((color) => {
                  const isSelected = formData.color === color.value;
                  return (
                    <Grid item key={color.value}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          bgcolor: color.value,
                          cursor: 'pointer',
                          border: '3px solid',
                          borderColor: isSelected ? 'text.primary' : 'transparent',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                        onClick={() => handleChange('color', color.value)}
                      >
                        {isSelected && (
                          <Typography variant="h6" sx={{ color: 'white' }}>
                            ✓
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>

            {/* Preview */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Preview
              </Typography>
              <Box
                sx={{
                  height: 200,
                  border: '1px solid',
                  borderColor: alpha(formData.color, 0.15),
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(135deg, ${formData.color} 0%, ${alpha(formData.color, 0.7)} 100%)`,
                    opacity: 0.8,
                  },
                }}
              >
                <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(formData.color, 0.1),
                        color: formData.color,
                      }}
                    >
                      <SelectedIconComponent sx={{ fontSize: 22 }} />
                    </Avatar>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: formData.color, mb: 0.5, fontSize: '0.9rem', lineHeight: 1.3 }}>
                    {formData.display_name || 'Custom Type Name'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {formData.description || 'Description of the custom type...'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(formData.color, 0.1) }}>
                    <Chip label="0 Items" size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(formData.color, 0.08), color: formData.color, fontWeight: 600 }} />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editType ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomTypeConfig;
