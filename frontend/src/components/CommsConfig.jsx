import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  IconButton,
  Chip,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  alpha,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  ViewList as ViewListIcon,
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

const CommsConfig = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [communicationTypes, setCommunicationTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [fields, setFields] = useState([]);
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [openFieldDialog, setOpenFieldDialog] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [typeForm, setTypeForm] = useState({
    name: '',
    display_name: '',
    description: '',
    icon: 'Email',
    color: '#0a6ed1',
    tab_order: 0,
    is_active: true,
  });

  const [fieldForm, setFieldForm] = useState({
    field_name: '',
    display_name: '',
    field_type: 'text',
    is_required: false,
    is_searchable: true,
    is_filterable: true,
    is_sortable: true,
    column_order: 0,
    column_width: 150,
    dropdown_options: [],
  });

  const fieldTypes = [
    'text', 'number', 'date', 'datetime', 'email', 'dropdown', 'boolean', 'currency', 'url', 'textarea'
  ];

  const iconOptions = [
    'Email', 'Business', 'Person', 'Receipt', 'Notifications', 'ShoppingCart',
    'Inventory', 'TrendingUp', 'Assessment', 'Assignment'
  ];

  useEffect(() => {
    fetchCommunicationTypes();
  }, []);

  useEffect(() => {
    if (selectedType) {
      fetchFields(selectedType.id);
    }
  }, [selectedType]);

  const fetchCommunicationTypes = async () => {
    try {
      const response = await fetch('/api/v1/comms/config/types?active_only=false');
      if (response.ok) {
        const data = await response.json();
        setCommunicationTypes(data);
        if (data.length > 0 && !selectedType) {
          setSelectedType(data[0]);
        }
      }
    } catch (err) {
      setError('Failed to load communication types');
    }
  };

  const fetchFields = async (typeId) => {
    try {
      const response = await fetch(`/api/v1/comms/config/fields/${typeId}`);
      if (response.ok) {
        const data = await response.json();
        setFields(data);
      }
    } catch (err) {
      setError('Failed to load fields');
    }
  };

  const handleSaveType = async () => {
    try {
      const url = editingType
        ? `/api/v1/comms/config/types/${editingType.id}`
        : '/api/v1/comms/config/types';

      const method = editingType ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(typeForm),
      });

      if (response.ok) {
        setSuccess(editingType ? 'Type updated successfully' : 'Type created successfully');
        setOpenTypeDialog(false);
        setEditingType(null);
        fetchCommunicationTypes();
        resetTypeForm();
      }
    } catch (err) {
      setError('Failed to save communication type');
    }
  };

  const handleSaveField = async () => {
    try {
      const url = editingField
        ? `/api/v1/comms/config/fields/${editingField.id}`
        : '/api/v1/comms/config/fields';

      const method = editingField ? 'PUT' : 'POST';

      const fieldData = {
        ...fieldForm,
        communication_type_id: selectedType.id,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldData),
      });

      if (response.ok) {
        setSuccess(editingField ? 'Field updated successfully' : 'Field created successfully');
        setOpenFieldDialog(false);
        setEditingField(null);
        fetchFields(selectedType.id);
        resetFieldForm();
      }
    } catch (err) {
      setError('Failed to save field');
    }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm('Are you sure you want to delete this communication type?')) return;

    try {
      const response = await fetch(`/api/v1/comms/config/types/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccess('Type deleted successfully');
        fetchCommunicationTypes();
      }
    } catch (err) {
      setError('Failed to delete communication type');
    }
  };

  const handleDeleteField = async (id) => {
    if (!window.confirm('Are you sure you want to delete this field?')) return;

    try {
      const response = await fetch(`/api/v1/comms/config/fields/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccess('Field deleted successfully');
        fetchFields(selectedType.id);
      }
    } catch (err) {
      setError('Failed to delete field');
    }
  };

  const resetTypeForm = () => {
    setTypeForm({
      name: '',
      display_name: '',
      description: '',
      icon: 'Email',
      color: '#0a6ed1',
      tab_order: 0,
      is_active: true,
    });
  };

  const resetFieldForm = () => {
    setFieldForm({
      field_name: '',
      display_name: '',
      field_type: 'text',
      is_required: false,
      is_searchable: true,
      is_filterable: true,
      is_sortable: true,
      column_order: 0,
      column_width: 150,
      dropdown_options: [],
    });
  };

  const handleEditType = (type) => {
    setEditingType(type);
    setTypeForm(type);
    setOpenTypeDialog(true);
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setFieldForm(field);
    setOpenFieldDialog(true);
  };

  const typeColumns = [
    {
      field: 'display_name',
      headerName: 'Display Name',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500} sx={{ color: colors.text }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'System Name',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: colors.grey }}>
          {params.value}
        </Typography>
      ),
    },
    { field: 'icon', headerName: 'Icon', width: 120 },
    {
      field: 'color',
      headerName: 'Color',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: params.value, borderRadius: 1 }} />
          <Typography variant="caption" sx={{ color: colors.grey }}>{params.value}</Typography>
        </Box>
      ),
    },
    { field: 'tab_order', headerName: 'Order', width: 100 },
    {
      field: 'is_active',
      headerName: 'Active',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          sx={{
            height: 24,
            bgcolor: params.value ? alpha(colors.success, 0.1) : alpha(colors.grey, 0.1),
            color: params.value ? colors.success : colors.grey,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => handleEditType(params.row)}
            sx={{ color: colors.primary, '&:hover': { bgcolor: alpha(colors.primary, 0.1) } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteType(params.row.id)}
            sx={{ color: colors.error, '&:hover': { bgcolor: alpha(colors.error, 0.1) } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const fieldColumns = [
    {
      field: 'display_name',
      headerName: 'Display Name',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500} sx={{ color: colors.text }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'field_name',
      headerName: 'Field Name',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: colors.grey }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'field_type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            height: 22,
            bgcolor: alpha(colors.primary, 0.1),
            color: colors.primary,
            fontWeight: 500,
            fontSize: '0.7rem',
          }}
        />
      ),
    },
    { field: 'column_width', headerName: 'Width', width: 100 },
    { field: 'column_order', headerName: 'Order', width: 100 },
    {
      field: 'is_required',
      headerName: 'Required',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          sx={{
            height: 22,
            bgcolor: params.value ? alpha(colors.warning, 0.1) : alpha(colors.grey, 0.1),
            color: params.value ? colors.warning : colors.grey,
            fontWeight: 500,
            fontSize: '0.7rem',
          }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => handleEditField(params.row)}
            sx={{ color: colors.primary, '&:hover': { bgcolor: alpha(colors.primary, 0.1) } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteField(params.row.id)}
            sx={{ color: colors.error, '&:hover': { bgcolor: alpha(colors.error, 0.1) } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
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
                <SettingsIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ color: colors.text }}>
                EMAIL INTEL Configuration
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: colors.grey }}>
              Configure communication types and custom fields
            </Typography>
          </Box>
        </Stack>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: alpha(colors.primary, 0.1),
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              color: colors.grey,
              '&.Mui-selected': { color: colors.primary },
            },
            '& .MuiTabs-indicator': { bgcolor: colors.primary, height: 3 },
          }}
        >
          <Tab label="Communication Types" icon={<EmailIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="Field Definitions" icon={<ViewListIcon sx={{ fontSize: 18 }} />} iconPosition="start" disabled={!selectedType} />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha(colors.primary, 0.1),
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
              Communication Types
            </Typography>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => { resetTypeForm(); setOpenTypeDialog(true); }}
              sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.secondary } }}
            >
              Add Type
            </Button>
          </Box>
          <Box sx={{ height: 450 }}>
            <DataGrid
              rows={communicationTypes}
              columns={typeColumns}
              pageSize={10}
              onRowClick={(params) => setSelectedType(params.row)}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: alpha(colors.primary, 0.03),
                  borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`,
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${alpha(colors.primary, 0.05)}`,
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: alpha(colors.primary, 0.03),
                },
              }}
            />
          </Box>
        </Paper>
      )}

      {activeTab === 1 && selectedType && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha(colors.primary, 0.1),
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
              Fields for: {selectedType.display_name}
            </Typography>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => { resetFieldForm(); setOpenFieldDialog(true); }}
              sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.secondary } }}
            >
              Add Field
            </Button>
          </Box>
          <Box sx={{ height: 450 }}>
            <DataGrid
              rows={fields}
              columns={fieldColumns}
              pageSize={10}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: alpha(colors.primary, 0.03),
                  borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`,
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${alpha(colors.primary, 0.05)}`,
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: alpha(colors.primary, 0.03),
                },
              }}
            />
          </Box>
        </Paper>
      )}

      {/* Type Dialog */}
      <Dialog open={openTypeDialog} onClose={() => setOpenTypeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.text, fontWeight: 600 }}>
          {editingType ? 'Edit' : 'Add'} Communication Type
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="System Name"
              value={typeForm.name}
              onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value.replace(/\s/g, '_').toLowerCase() })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                  '&:hover fieldset': { borderColor: colors.primary },
                  '&.Mui-focused fieldset': { borderColor: colors.primary },
                },
              }}
            />
            <TextField
              label="Display Name"
              value={typeForm.display_name}
              onChange={(e) => setTypeForm({ ...typeForm, display_name: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                  '&:hover fieldset': { borderColor: colors.primary },
                  '&.Mui-focused fieldset': { borderColor: colors.primary },
                },
              }}
            />
            <TextField
              label="Description"
              value={typeForm.description}
              onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                  '&:hover fieldset': { borderColor: colors.primary },
                  '&.Mui-focused fieldset': { borderColor: colors.primary },
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Icon</InputLabel>
              <Select
                value={typeForm.icon}
                onChange={(e) => setTypeForm({ ...typeForm, icon: e.target.value })}
                label="Icon"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(colors.primary, 0.2) },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                }}
              >
                {iconOptions.map(icon => <MenuItem key={icon} value={icon}>{icon}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Color"
              type="color"
              value={typeForm.color}
              onChange={(e) => setTypeForm({ ...typeForm, color: e.target.value })}
              fullWidth
            />
            <TextField
              label="Tab Order"
              type="number"
              value={typeForm.tab_order}
              onChange={(e) => setTypeForm({ ...typeForm, tab_order: parseInt(e.target.value) })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                  '&:hover fieldset': { borderColor: colors.primary },
                  '&.Mui-focused fieldset': { borderColor: colors.primary },
                },
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={typeForm.is_active}
                  onChange={(e) => setTypeForm({ ...typeForm, is_active: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.primary },
                  }}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenTypeDialog(false)} sx={{ color: colors.grey }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveType}
            variant="contained"
            sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.secondary } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Field Dialog */}
      <Dialog open={openFieldDialog} onClose={() => setOpenFieldDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: colors.text, fontWeight: 600 }}>
          {editingField ? 'Edit' : 'Add'} Field
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Field Name"
                value={fieldForm.field_name}
                onChange={(e) => setFieldForm({ ...fieldForm, field_name: e.target.value.replace(/\s/g, '_').toLowerCase() })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Display Name"
                value={fieldForm.display_name}
                onChange={(e) => setFieldForm({ ...fieldForm, display_name: e.target.value })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Field Type</InputLabel>
                <Select
                  value={fieldForm.field_type}
                  onChange={(e) => setFieldForm({ ...fieldForm, field_type: e.target.value })}
                  label="Field Type"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(colors.primary, 0.2) },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                  }}
                >
                  {fieldTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Column Width"
                type="number"
                value={fieldForm.column_width}
                onChange={(e) => setFieldForm({ ...fieldForm, column_width: parseInt(e.target.value) })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Column Order"
                type="number"
                value={fieldForm.column_order}
                onChange={(e) => setFieldForm({ ...fieldForm, column_order: parseInt(e.target.value) })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />
            </Grid>
            {fieldForm.field_type === 'dropdown' && (
              <Grid item xs={12}>
                <TextField
                  label="Dropdown Options (comma-separated)"
                  value={fieldForm.dropdown_options?.join(', ') || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, dropdown_options: e.target.value.split(',').map(s => s.trim()) })}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: alpha(colors.primary, 0.2) },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              </Grid>
            )}
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={fieldForm.is_required}
                    onChange={(e) => setFieldForm({ ...fieldForm, is_required: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.primary },
                    }}
                  />
                }
                label="Required"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={fieldForm.is_searchable}
                    onChange={(e) => setFieldForm({ ...fieldForm, is_searchable: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.primary },
                    }}
                  />
                }
                label="Searchable"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={fieldForm.is_filterable}
                    onChange={(e) => setFieldForm({ ...fieldForm, is_filterable: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.primary },
                    }}
                  />
                }
                label="Filterable"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={fieldForm.is_sortable}
                    onChange={(e) => setFieldForm({ ...fieldForm, is_sortable: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.primary },
                    }}
                  />
                }
                label="Sortable"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenFieldDialog(false)} sx={{ color: colors.grey }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveField}
            variant="contained"
            sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.secondary } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommsConfig;
