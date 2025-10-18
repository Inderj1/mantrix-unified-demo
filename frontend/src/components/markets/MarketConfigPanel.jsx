import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { getCategoriesArray } from './CategoryIcons';

/**
 * MarketConfigPanel - Slide-out panel for configuring market categories
 *
 * Props:
 * - open: Whether panel is open
 * - onClose: Handler to close panel
 * - enabledCategories: Array of enabled category IDs
 * - onSave: Handler for save button (receives enabledCategories array)
 */
const MarketConfigPanel = ({
  open,
  onClose,
  enabledCategories: initialEnabledCategories = [],
  onSave,
}) => {
  const [enabledCategories, setEnabledCategories] = useState(initialEnabledCategories);
  const [saved, setSaved] = useState(false);

  const categories = getCategoriesArray();

  // Handle toggle
  const handleToggle = (categoryId) => {
    setEnabledCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    setSaved(false);
  };

  // Handle save
  const handleSave = () => {
    onSave?.(enabledCategories);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Handle reset
  const handleReset = () => {
    // Enable all categories by default
    const allCategoryIds = categories.map(c => c.id);
    setEnabledCategories(allCategoryIds);
    setSaved(false);
  };

  // Handle enable all
  const handleEnableAll = () => {
    const allCategoryIds = categories.map(c => c.id);
    setEnabledCategories(allCategoryIds);
    setSaved(false);
  };

  // Handle disable all
  const handleDisableAll = () => {
    setEnabledCategories([]);
    setSaved(false);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          p: 3,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Configure Market Signals
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select which market signal categories you want to monitor. Disabled categories will not show signals or alerts.
      </Typography>

      {/* Success Alert */}
      {saved && (
        <Alert
          severity="success"
          icon={<CheckIcon />}
          sx={{ mb: 2 }}
          onClose={() => setSaved(false)}
        >
          Configuration saved successfully!
        </Alert>
      )}

      {/* Summary */}
      <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Monitoring Status
        </Typography>
        <Typography variant="h6" fontWeight={600}>
          {enabledCategories.length} / {categories.length} Categories Active
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={handleEnableAll}
          sx={{ flex: 1 }}
        >
          Enable All
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={handleDisableAll}
          sx={{ flex: 1 }}
        >
          Disable All
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Category List */}
      <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
          Market Signal Categories
        </Typography>
        <List>
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isEnabled = enabledCategories.includes(category.id);

            return (
              <ListItem
                key={category.id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: isEnabled ? '#ffffff' : '#f9f9f9',
                  opacity: isEnabled ? 1 : 0.7,
                }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: `${category.color}20`,
                    }}
                  >
                    <IconComponent sx={{ fontSize: 24, color: category.color }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {category.name}
                      </Typography>
                      {isEnabled && (
                        <Chip label="Active" size="small" color="success" sx={{ height: 20 }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {category.description.length > 50
                        ? category.description.substring(0, 50) + '...'
                        : category.description}
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={isEnabled}
                      onChange={() => handleToggle(category.id)}
                      color="primary"
                    />
                  }
                  label=""
                  sx={{ mr: 0 }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Footer Actions */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ResetIcon />}
          onClick={handleReset}
          fullWidth
        >
          Reset to Default
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          fullWidth
        >
          Save Configuration
        </Button>
      </Box>

      {/* Info Box */}
      <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Pro Tip:</strong> Enable only the categories relevant to your business to reduce noise and focus on what matters most.
        </Typography>
      </Box>
    </Drawer>
  );
};

export default MarketConfigPanel;
