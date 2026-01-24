/**
 * CreateExcelTemplateModal Component
 *
 * Modal for creating new Excel processing templates.
 * Includes sheet configuration and input folder mapping.
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
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Folder as FolderIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';

const CreateExcelTemplateModal = ({ open, onClose, onSuccess, darkMode = false }) => {
  // Form state
  const [templateName, setTemplateName] = useState('');
  const [templateKey, setTemplateKey] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [templateType, setTemplateType] = useState('custom');
  const [inputFolderPath, setInputFolderPath] = useState('./excel-input');
  const [outputFormat, setOutputFormat] = useState('excel');
  const [aiInstructions, setAiInstructions] = useState('');
  const [sheets, setSheets] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Available input files
  const [inputFiles, setInputFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    if (open) {
      loadInputFiles();
    }
  }, [open]);

  const loadInputFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch('/api/v1/excel-templates/input-files/list');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setInputFiles(result.data || []);
          if (result.folder) {
            setInputFolderPath(result.folder);
          }
        }
      }
    } catch (err) {
      console.error('Error loading input files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const resetForm = () => {
    setTemplateName('');
    setTemplateKey('');
    setDescription('');
    setCategory('General');
    setTemplateType('custom');
    setInputFolderPath('./excel-input');
    setOutputFormat('excel');
    setAiInstructions('');
    setSheets([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addSheet = () => {
    setSheets([
      ...sheets,
      {
        id: Date.now(),
        sheet_name: '',
        source_file: '',
        expected_rows: null,
        columns: [],
        is_enabled: true,
      }
    ]);
  };

  const updateSheet = (id, field, value) => {
    setSheets(sheets.map(sheet =>
      sheet.id === id ? { ...sheet, [field]: value } : sheet
    ));
  };

  const removeSheet = (id) => {
    setSheets(sheets.filter(sheet => sheet.id !== id));
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    if (!templateKey.trim()) {
      setError('Please enter a template key');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const templateData = {
        template_key: templateKey.toLowerCase().replace(/\s+/g, '_'),
        template_name: templateName,
        description: description || `Excel processing template: ${templateName}`,
        template_type: templateType,
        category: category,
        input_folder_path: inputFolderPath,
        sheets_config: sheets.map(s => ({
          sheet_name: s.sheet_name,
          source_file: s.source_file,
          expected_rows: s.expected_rows,
          columns: s.columns,
          is_enabled: s.is_enabled,
        })),
        business_rules: [],
        filters_config: [],
        ai_instructions: aiInstructions,
        output_format: outputFormat,
        is_active: true,
      };

      const response = await fetch('/api/v1/excel-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save template');
      }

      resetForm();
      onSuccess?.();
      onClose();

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
      maxWidth="md"
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TableChartIcon sx={{ color: '#10b981' }} />
          <Typography variant="h6" fontWeight={600}>
            Create Excel Template
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Template Information */}
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: '#10b981' }}>
          Template Information
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              size="small"
              label="Template Name"
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value);
                if (!templateKey || templateKey === templateName.toLowerCase().replace(/\s+/g, '_')) {
                  setTemplateKey(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                }
              }}
              placeholder="e.g., Financial Analysis Template"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              size="small"
              label="Template Key"
              value={templateKey}
              onChange={(e) => setTemplateKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              placeholder="e.g., financial_analysis"
              helperText="Unique identifier"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Financial Analysis">Financial Analysis</MenuItem>
                <MenuItem value="Supply Chain">Supply Chain</MenuItem>
                <MenuItem value="SAP Data">SAP Data</MenuItem>
                <MenuItem value="CRM">CRM</MenuItem>
                <MenuItem value="Custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Template Type</InputLabel>
              <Select
                value={templateType}
                label="Template Type"
                onChange={(e) => setTemplateType(e.target.value)}
              >
                <MenuItem value="custom">Custom</MenuItem>
                <MenuItem value="financial-analysis">Financial Analysis</MenuItem>
                <MenuItem value="data-import">Data Import</MenuItem>
                <MenuItem value="report">Report Generation</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Input Folder Path"
              value={inputFolderPath}
              onChange={(e) => setInputFolderPath(e.target.value)}
              InputProps={{
                startAdornment: <FolderIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Output Format</InputLabel>
              <Select
                value={outputFormat}
                label="Output Format"
                onChange={(e) => setOutputFormat(e.target.value)}
              >
                <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              placeholder="Describe what this template does..."
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Sheet Configuration */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#10b981' }}>
            Sheet Configuration ({sheets.length})
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addSheet}
            sx={{ borderColor: alpha('#10b981', 0.3), color: '#10b981' }}
          >
            Add Sheet
          </Button>
        </Box>

        {sheets.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              borderStyle: 'dashed',
              borderColor: alpha('#10b981', 0.3),
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No sheets configured. Add sheets to define input file mappings.
            </Typography>
            {inputFiles.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {inputFiles.length} files available in input folder
              </Typography>
            )}
          </Paper>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 250 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Sheet Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Source File</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 100 }}>Expected Rows</TableCell>
                  <TableCell sx={{ width: 50 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {sheets.map((sheet) => (
                  <TableRow key={sheet.id}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        variant="standard"
                        value={sheet.sheet_name}
                        onChange={(e) => updateSheet(sheet.id, 'sheet_name', e.target.value)}
                        placeholder="Sheet name"
                      />
                    </TableCell>
                    <TableCell>
                      <Autocomplete
                        size="small"
                        options={inputFiles}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.filename}
                        value={inputFiles.find(f => f.filename === sheet.source_file) || null}
                        onChange={(e, newValue) => updateSheet(sheet.id, 'source_file', newValue?.filename || '')}
                        renderInput={(params) => (
                          <TextField {...params} variant="standard" placeholder="Select file..." />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            <Box>
                              <Typography variant="body2">{option.filename}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.size_formatted}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        variant="standard"
                        type="number"
                        value={sheet.expected_rows || ''}
                        onChange={(e) => updateSheet(sheet.id, 'expected_rows', parseInt(e.target.value) || null)}
                        placeholder="Rows"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => removeSheet(sheet.id)}
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

        <Divider sx={{ my: 2 }} />

        {/* AI Instructions */}
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: '#10b981' }}>
          AI Instructions (Optional)
        </Typography>
        <TextField
          fullWidth
          size="small"
          multiline
          rows={3}
          value={aiInstructions}
          onChange={(e) => setAiInstructions(e.target.value)}
          placeholder="Provide instructions for AI processing, analysis rules, or specific calculations..."
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={saveTemplate}
          disabled={!templateName.trim() || !templateKey.trim() || isSaving}
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            },
          }}
        >
          {isSaving ? 'Saving...' : 'Save Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateExcelTemplateModal;
