/**
 * EditTemplateModal Component
 *
 * Full-featured modal for editing PDF parser templates.
 * Includes column definitions editing, regex patterns, and JSON view.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  alpha,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Code as CodeIcon,
  TableChart as TableIcon,
} from '@mui/icons-material';

const EditTemplateModal = ({ open, onClose, onSuccess, templateId, darkMode = false }) => {
  // Loading state
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Form state
  const [templateKey, setTemplateKey] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('purchase_order');
  const [identificationKeywords, setIdentificationKeywords] = useState('');
  const [poNumberPattern, setPoNumberPattern] = useState('');
  const [datePattern, setDatePattern] = useState('');
  const [totalPattern, setTotalPattern] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [columns, setColumns] = useState([]);

  // JSON view state
  const [jsonView, setJsonView] = useState('');
  const [jsonError, setJsonError] = useState('');

  // Load template data
  useEffect(() => {
    if (open && templateId) {
      loadTemplate();
    }
  }, [open, templateId]);

  const loadTemplate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/pdf-templates/${templateId}`);
      if (!response.ok) {
        throw new Error('Failed to load template');
      }
      const result = await response.json();
      if (result.success && result.data) {
        const t = result.data;
        setTemplateKey(t.template_key || '');
        setTemplateName(t.customer_name || '');
        setTemplateDescription(t.description || '');
        setTemplateCategory(t.category || 'purchase_order');
        setIdentificationKeywords((t.identification_keywords || []).join(', '));
        setPoNumberPattern(t.po_number_pattern || '');
        setDatePattern(t.date_pattern || '');
        setTotalPattern(t.total_pattern || '');
        setIsActive(t.is_active !== false);

        // Build columns from required_fields and optional_fields
        const cols = [];
        (t.required_fields || []).forEach((field, idx) => {
          cols.push({
            id: Date.now() + idx,
            name: field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            originalKey: field,
            dataType: field.toLowerCase().includes('date') ? 'date' :
                      field.toLowerCase().includes('amount') || field.toLowerCase().includes('total') || field.toLowerCase().includes('price') ? 'number' : 'string',
            pattern: '',
            required: true,
          });
        });
        (t.optional_fields || []).forEach((field, idx) => {
          cols.push({
            id: Date.now() + 1000 + idx,
            name: field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            originalKey: field,
            dataType: field.toLowerCase().includes('date') ? 'date' :
                      field.toLowerCase().includes('amount') || field.toLowerCase().includes('total') || field.toLowerCase().includes('price') ? 'number' : 'string',
            pattern: '',
            required: false,
          });
        });
        setColumns(cols);

        // Update JSON view
        updateJsonView(t);
      }
    } catch (err) {
      console.error('Error loading template:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateJsonView = (data) => {
    const jsonData = {
      template_key: data.template_key || templateKey,
      customer_name: data.customer_name || templateName,
      description: data.description || templateDescription,
      category: data.category || templateCategory,
      identification_keywords: data.identification_keywords || identificationKeywords.split(',').map(k => k.trim()).filter(k => k),
      po_number_pattern: data.po_number_pattern || poNumberPattern,
      required_fields: data.required_fields || columns.filter(c => c.required).map(c => c.originalKey || c.name.toLowerCase().replace(/\s+/g, '_')),
      optional_fields: data.optional_fields || columns.filter(c => !c.required).map(c => c.originalKey || c.name.toLowerCase().replace(/\s+/g, '_')),
      items_schema: data.items_schema || { required: [], optional: [] },
    };
    setJsonView(JSON.stringify(jsonData, null, 2));
  };

  const handleClose = () => {
    setError(null);
    setActiveTab(0);
    onClose();
  };

  const addColumn = () => {
    setColumns([
      ...columns,
      { id: Date.now(), name: '', originalKey: '', dataType: 'string', pattern: '', required: false }
    ]);
  };

  const updateColumn = (id, field, value) => {
    setColumns(columns.map(col => {
      if (col.id === id) {
        const updated = { ...col, [field]: value };
        // Auto-generate originalKey from name if not set
        if (field === 'name' && !col.originalKey) {
          updated.originalKey = value.toLowerCase().replace(/\s+/g, '_');
        }
        return updated;
      }
      return col;
    }));
  };

  const removeColumn = (id) => {
    setColumns(columns.filter(col => col.id !== id));
  };

  const handleJsonChange = (value) => {
    setJsonView(value);
    setJsonError('');
  };

  const applyJsonChanges = () => {
    try {
      const parsed = JSON.parse(jsonView);

      // Update form fields from JSON
      if (parsed.customer_name) setTemplateName(parsed.customer_name);
      if (parsed.template_key) setTemplateKey(parsed.template_key);
      if (parsed.description) setTemplateDescription(parsed.description);
      if (parsed.category) setTemplateCategory(parsed.category);
      if (parsed.identification_keywords) {
        setIdentificationKeywords(Array.isArray(parsed.identification_keywords)
          ? parsed.identification_keywords.join(', ')
          : parsed.identification_keywords);
      }
      if (parsed.po_number_pattern) setPoNumberPattern(parsed.po_number_pattern);

      // Rebuild columns
      const newCols = [];
      if (parsed.required_fields) {
        parsed.required_fields.forEach((field, idx) => {
          newCols.push({
            id: Date.now() + idx,
            name: field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            originalKey: field,
            dataType: field.toLowerCase().includes('date') ? 'date' : 'string',
            pattern: '',
            required: true,
          });
        });
      }
      if (parsed.optional_fields) {
        parsed.optional_fields.forEach((field, idx) => {
          newCols.push({
            id: Date.now() + 1000 + idx,
            name: field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            originalKey: field,
            dataType: field.toLowerCase().includes('date') ? 'date' : 'string',
            pattern: '',
            required: false,
          });
        });
      }
      setColumns(newCols);
      setJsonError('');
      setActiveTab(0); // Switch to form view
    } catch (err) {
      setJsonError(`Invalid JSON: ${err.message}`);
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      setError('Please enter a customer name');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Build update data
      const required_fields = columns.filter(c => c.required).map(c =>
        c.originalKey || c.name.toLowerCase().replace(/\s+/g, '_')
      );
      const optional_fields = columns.filter(c => !c.required).map(c =>
        c.originalKey || c.name.toLowerCase().replace(/\s+/g, '_')
      );

      const updateData = {
        customer_name: templateName,
        description: templateDescription || `Parser template for ${templateName}`,
        category: templateCategory,
        identification_keywords: identificationKeywords.split(',').map(k => k.trim()).filter(k => k),
        po_number_pattern: poNumberPattern || null,
        date_pattern: datePattern || null,
        total_pattern: totalPattern || null,
        required_fields,
        optional_fields,
        is_active: isActive,
      };

      const response = await fetch(`/api/v1/pdf-templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save template');
      }

      onSuccess?.();
      handleClose();

    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: darkMode ? '#161b22' : 'background.paper',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Typography variant="h6" fontWeight={600}>
          Edit Template: {templateName || 'Loading...'}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<TableIcon />} iconPosition="start" label="Form View" />
              <Tab icon={<CodeIcon />} iconPosition="start" label="JSON View" />
            </Tabs>

            {/* Form View */}
            {activeTab === 0 && (
              <Box>
                {/* Template Information */}
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: '#002352' }}>
                  Template Information
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      label="Customer Name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Template Key"
                      value={templateKey}
                      disabled
                      helperText="Cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={templateCategory}
                        label="Category"
                        onChange={(e) => setTemplateCategory(e.target.value)}
                      >
                        <MenuItem value="purchase_order">Purchase Order</MenuItem>
                        <MenuItem value="invoice">Invoice</MenuItem>
                        <MenuItem value="shipping">Shipping Document</MenuItem>
                        <MenuItem value="quote">Quote</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Identification Keywords"
                      value={identificationKeywords}
                      onChange={(e) => setIdentificationKeywords(e.target.value)}
                      placeholder="Comma-separated keywords"
                      helperText="To identify this customer's PDFs"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="PO Number Pattern (Regex)"
                      value={poNumberPattern}
                      onChange={(e) => setPoNumberPattern(e.target.value)}
                      placeholder="e.g., PO[\\s-]?(\\d{6,10})"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          color="success"
                        />
                      }
                      label="Active"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Column Definitions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#002352' }}>
                    Column Definitions ({columns.length})
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addColumn}
                    sx={{ borderColor: alpha('#002352', 0.3), color: '#002352' }}
                  >
                    Add Column
                  </Button>
                </Box>

                {columns.length === 0 ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderStyle: 'dashed',
                      borderColor: alpha('#002352', 0.3),
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No columns defined. Click "Add Column" to add field definitions.
                    </Typography>
                  </Paper>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 350 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Column Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Field Key</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: 120 }}>Data Type</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: 80 }} align="center">Required</TableCell>
                          <TableCell sx={{ width: 50 }} />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {columns.map((col) => (
                          <TableRow key={col.id}>
                            <TableCell>
                              <TextField
                                fullWidth
                                size="small"
                                variant="standard"
                                value={col.name}
                                onChange={(e) => updateColumn(col.id, 'name', e.target.value)}
                                placeholder="Display name"
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                size="small"
                                variant="standard"
                                value={col.originalKey || col.name.toLowerCase().replace(/\s+/g, '_')}
                                onChange={(e) => updateColumn(col.id, 'originalKey', e.target.value)}
                                placeholder="field_key"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                fullWidth
                                size="small"
                                variant="standard"
                                value={col.dataType}
                                onChange={(e) => updateColumn(col.id, 'dataType', e.target.value)}
                              >
                                <MenuItem value="string">String</MenuItem>
                                <MenuItem value="number">Number</MenuItem>
                                <MenuItem value="date">Date</MenuItem>
                                <MenuItem value="boolean">Boolean</MenuItem>
                                <MenuItem value="email">Email</MenuItem>
                                <MenuItem value="phone">Phone</MenuItem>
                              </Select>
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={col.required}
                                onChange={(e) => updateColumn(col.id, 'required', e.target.checked)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => removeColumn(col.id)}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* JSON View */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Edit template as JSON. Click "Apply Changes" to update the form.
                </Typography>
                {jsonError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {jsonError}
                  </Alert>
                )}
                <TextField
                  fullWidth
                  multiline
                  rows={18}
                  value={jsonView}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={applyJsonChanges}
                    sx={{ borderColor: '#002352', color: '#002352' }}
                  >
                    Apply JSON Changes
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={saveTemplate}
          disabled={!templateName.trim() || isSaving || loading}
          sx={{
            background: 'linear-gradient(135deg, #002352 0%, #00357a 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00357a 0%, #1d4ed8 100%)',
            },
          }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTemplateModal;
