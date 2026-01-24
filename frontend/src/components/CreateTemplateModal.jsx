/**
 * CreateTemplateModal Component
 *
 * Full-featured modal for creating new PDF parser templates.
 * Includes PDF import with automatic field detection and predefined column mapping.
 */

import React, { useState, useRef } from 'react';
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
  Paper,
  Alert,
  alpha,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Code as CodeIcon,
  TableChart as TableIcon,
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  AutoFixHigh as AutoFixHighIcon,
  Delete as DeleteIcon,
  AddCircleOutline as AddCircleOutlineIcon,
} from '@mui/icons-material';

// Standard PO columns that exist in the database - grouped by category
const STANDARD_COLUMNS = {
  header: {
    label: 'Header Fields',
    fields: [
      { key: 'po_number', name: 'PO Number', type: 'string', required: true },
      { key: 'customer_name', name: 'Customer Name', type: 'string', required: true },
      { key: 'po_date', name: 'PO Date', type: 'date', required: true },
      { key: 'order_date', name: 'Order Date', type: 'date', required: false },
      { key: 'delivery_date', name: 'Delivery Date', type: 'date', required: false },
      { key: 'requested_date', name: 'Requested Date', type: 'date', required: false },
      { key: 'revision_number', name: 'Revision Number', type: 'string', required: false },
      { key: 'revision_date', name: 'Revision Date', type: 'date', required: false },
    ],
  },
  shipping: {
    label: 'Shipping Information',
    fields: [
      { key: 'ship_to_name', name: 'Ship To Name', type: 'string', required: false },
      { key: 'ship_to_address', name: 'Ship To Address', type: 'string', required: false },
      { key: 'ship_to_city', name: 'Ship To City', type: 'string', required: false },
      { key: 'ship_to_state', name: 'Ship To State', type: 'string', required: false },
      { key: 'ship_to_zip', name: 'Ship To Zip', type: 'string', required: false },
      { key: 'ship_to_country', name: 'Ship To Country', type: 'string', required: false },
      { key: 'shipping_method', name: 'Shipping Method', type: 'string', required: false },
      { key: 'carrier', name: 'Carrier', type: 'string', required: false },
    ],
  },
  billing: {
    label: 'Billing Information',
    fields: [
      { key: 'bill_to_name', name: 'Bill To Name', type: 'string', required: false },
      { key: 'bill_to_address', name: 'Bill To Address', type: 'string', required: false },
      { key: 'bill_to_city', name: 'Bill To City', type: 'string', required: false },
      { key: 'bill_to_state', name: 'Bill To State', type: 'string', required: false },
      { key: 'bill_to_zip', name: 'Bill To Zip', type: 'string', required: false },
    ],
  },
  terms: {
    label: 'Terms & Conditions',
    fields: [
      { key: 'payment_terms', name: 'Payment Terms', type: 'string', required: false },
      { key: 'incoterms', name: 'Incoterms', type: 'string', required: false },
      { key: 'freight_terms', name: 'Freight Terms', type: 'string', required: false },
      { key: 'currency', name: 'Currency', type: 'string', required: false },
    ],
  },
  totals: {
    label: 'Totals & Amounts',
    fields: [
      { key: 'subtotal', name: 'Subtotal', type: 'number', required: false },
      { key: 'tax_amount', name: 'Tax Amount', type: 'number', required: false },
      { key: 'shipping_amount', name: 'Shipping Amount', type: 'number', required: false },
      { key: 'total_amount', name: 'Total Amount', type: 'number', required: false },
      { key: 'discount_amount', name: 'Discount Amount', type: 'number', required: false },
    ],
  },
  contact: {
    label: 'Contact Information',
    fields: [
      { key: 'buyer_name', name: 'Buyer Name', type: 'string', required: false },
      { key: 'buyer_email', name: 'Buyer Email', type: 'email', required: false },
      { key: 'buyer_phone', name: 'Buyer Phone', type: 'phone', required: false },
      { key: 'buyer_fax', name: 'Buyer Fax', type: 'string', required: false },
      { key: 'sales_rep', name: 'Sales Rep', type: 'string', required: false },
    ],
  },
  reference: {
    label: 'Reference Numbers',
    fields: [
      { key: 'customer_po', name: 'Customer PO', type: 'string', required: false },
      { key: 'quote_number', name: 'Quote Number', type: 'string', required: false },
      { key: 'contract_number', name: 'Contract Number', type: 'string', required: false },
      { key: 'project_number', name: 'Project Number', type: 'string', required: false },
      { key: 'release_number', name: 'Release Number', type: 'string', required: false },
    ],
  },
};

// Standard line item fields
const LINE_ITEM_FIELDS = [
  { key: 'line_number', name: 'Line Number', type: 'number', required: true },
  { key: 'description', name: 'Description', type: 'string', required: true },
  { key: 'quantity', name: 'Quantity', type: 'number', required: true },
  { key: 'customer_part_number', name: 'Customer Part Number', type: 'string', required: false },
  { key: 'loparex_part_number', name: 'Loparex Part Number', type: 'string', required: false },
  { key: 'uom', name: 'Unit of Measure', type: 'string', required: false },
  { key: 'unit_price', name: 'Unit Price', type: 'number', required: false },
  { key: 'extended_price', name: 'Extended Price', type: 'number', required: false },
  { key: 'width', name: 'Width', type: 'number', required: false },
  { key: 'length', name: 'Length', type: 'number', required: false },
  { key: 'requested_date', name: 'Requested Date', type: 'date', required: false },
  { key: 'promise_date', name: 'Promise Date', type: 'date', required: false },
];

const CreateTemplateModal = ({ open, onClose, onSuccess, darkMode = false }) => {
  const fileInputRef = useRef(null);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Form state
  const [templateKey, setTemplateKey] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('purchase_order');
  const [identificationKeywords, setIdentificationKeywords] = useState('');
  const [poNumberPattern, setPoNumberPattern] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Selected columns state
  const [selectedColumns, setSelectedColumns] = useState({
    // Default required fields
    po_number: true,
    customer_name: true,
    po_date: true,
  });

  // Line item fields selection
  const [selectedLineItems, setSelectedLineItems] = useState({
    line_number: true,
    description: true,
    quantity: true,
  });

  // Detected fields from PDF
  const [detectedFields, setDetectedFields] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Custom columns state
  const [customHeaderFields, setCustomHeaderFields] = useState([]);
  const [customLineItemFields, setCustomLineItemFields] = useState([]);
  const [newHeaderField, setNewHeaderField] = useState({ name: '', key: '', type: 'string', required: false });
  const [newLineItemField, setNewLineItemField] = useState({ name: '', key: '', type: 'string', required: false });

  // JSON view state
  const [jsonView, setJsonView] = useState('');

  const generateTemplateKey = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setTemplateName(name);
    if (!templateKey || templateKey === generateTemplateKey(templateName)) {
      setTemplateKey(generateTemplateKey(name));
    }
  };

  const handleClose = () => {
    // Reset form
    setTemplateKey('');
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('purchase_order');
    setIdentificationKeywords('');
    setPoNumberPattern('');
    setIsActive(true);
    setSelectedColumns({ po_number: true, customer_name: true, po_date: true });
    setSelectedLineItems({ line_number: true, description: true, quantity: true });
    setDetectedFields([]);
    setUploadedFileName('');
    setCustomHeaderFields([]);
    setCustomLineItemFields([]);
    setNewHeaderField({ name: '', key: '', type: 'string', required: false });
    setNewLineItemField({ name: '', key: '', type: 'string', required: false });
    setError(null);
    setSuccess(null);
    setActiveTab(0);
    onClose();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use the detect-fields endpoint to analyze the PDF
      const response = await fetch('/api/v1/pdf/unified/detect-fields', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze PDF');
      }

      const result = await response.json();

      if (result.success) {
        // Store detected fields
        setDetectedFields(result.detected_fields || []);

        // Auto-select columns that were detected
        const newSelectedColumns = { ...selectedColumns };
        const newSelectedLineItems = { ...selectedLineItems };

        (result.detected_fields || []).forEach(field => {
          const fieldKey = field.field_name || field.key;
          const fieldKeyNormalized = fieldKey?.toLowerCase().replace(/[\s-]/g, '_');

          // Check if it's a header field
          Object.values(STANDARD_COLUMNS).forEach(category => {
            category.fields.forEach(stdField => {
              if (stdField.key === fieldKeyNormalized ||
                  fieldKeyNormalized?.includes(stdField.key.replace(/_/g, '')) ||
                  stdField.key.includes(fieldKeyNormalized?.replace(/_/g, '') || '')) {
                newSelectedColumns[stdField.key] = true;
              }
            });
          });

          // Check if it's a line item field
          LINE_ITEM_FIELDS.forEach(liField => {
            if (liField.key === fieldKeyNormalized ||
                fieldKeyNormalized?.includes(liField.key.replace(/_/g, ''))) {
              newSelectedLineItems[liField.key] = true;
            }
          });
        });

        setSelectedColumns(newSelectedColumns);
        setSelectedLineItems(newSelectedLineItems);

        // Try to auto-detect customer name from the PDF
        if (!templateName && result.detected_fields) {
          const customerField = result.detected_fields.find(f =>
            f.field_name === 'buyer_company' || f.field_name === 'customer_name'
          );
          if (customerField?.sample_value) {
            const detectedName = customerField.sample_value;
            setTemplateName(detectedName);
            setTemplateKey(generateTemplateKey(detectedName));
            setIdentificationKeywords(detectedName);
          }
        }

        setSuccess(`Detected ${result.total_fields || 0} fields from PDF`);
      }
    } catch (err) {
      console.error('PDF analysis error:', err);
      setError(err.message || 'Failed to analyze PDF');
    } finally {
      setIsAnalyzing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleColumn = (key) => {
    setSelectedColumns(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleLineItem = (key) => {
    setSelectedLineItems(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectAllInCategory = (category) => {
    const newSelected = { ...selectedColumns };
    STANDARD_COLUMNS[category].fields.forEach(field => {
      newSelected[field.key] = true;
    });
    setSelectedColumns(newSelected);
  };

  const deselectAllInCategory = (category) => {
    const newSelected = { ...selectedColumns };
    STANDARD_COLUMNS[category].fields.forEach(field => {
      // Don't deselect required fields
      if (!field.required) {
        newSelected[field.key] = false;
      }
    });
    setSelectedColumns(newSelected);
  };

  const getSelectedCount = (category) => {
    return STANDARD_COLUMNS[category].fields.filter(f => selectedColumns[f.key]).length;
  };

  const generateFieldKey = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);
  };

  const addCustomHeaderField = () => {
    if (!newHeaderField.name.trim()) {
      setError('Please enter a field name');
      return;
    }

    const key = newHeaderField.key.trim() || generateFieldKey(newHeaderField.name);

    // Check for duplicate keys
    const allKeys = [
      ...Object.values(STANDARD_COLUMNS).flatMap(c => c.fields.map(f => f.key)),
      ...customHeaderFields.map(f => f.key),
    ];
    if (allKeys.includes(key)) {
      setError(`Field key "${key}" already exists`);
      return;
    }

    setCustomHeaderFields([...customHeaderFields, {
      key,
      name: newHeaderField.name.trim(),
      type: newHeaderField.type,
      required: newHeaderField.required,
      isCustom: true,
    }]);
    setSelectedColumns({ ...selectedColumns, [key]: true });
    setNewHeaderField({ name: '', key: '', type: 'string', required: false });
    setError(null);
  };

  const removeCustomHeaderField = (key) => {
    setCustomHeaderFields(customHeaderFields.filter(f => f.key !== key));
    const newSelected = { ...selectedColumns };
    delete newSelected[key];
    setSelectedColumns(newSelected);
  };

  const addCustomLineItemField = () => {
    if (!newLineItemField.name.trim()) {
      setError('Please enter a field name');
      return;
    }

    const key = newLineItemField.key.trim() || generateFieldKey(newLineItemField.name);

    // Check for duplicate keys
    const allKeys = [
      ...LINE_ITEM_FIELDS.map(f => f.key),
      ...customLineItemFields.map(f => f.key),
    ];
    if (allKeys.includes(key)) {
      setError(`Line item field key "${key}" already exists`);
      return;
    }

    setCustomLineItemFields([...customLineItemFields, {
      key,
      name: newLineItemField.name.trim(),
      type: newLineItemField.type,
      required: newLineItemField.required,
      isCustom: true,
    }]);
    setSelectedLineItems({ ...selectedLineItems, [key]: true });
    setNewLineItemField({ name: '', key: '', type: 'string', required: false });
    setError(null);
  };

  const removeCustomLineItemField = (key) => {
    setCustomLineItemFields(customLineItemFields.filter(f => f.key !== key));
    const newSelected = { ...selectedLineItems };
    delete newSelected[key];
    setSelectedLineItems(newSelected);
  };

  const buildTemplateData = () => {
    const required_fields = [];
    const optional_fields = [];

    // Process selected columns from standard fields
    Object.entries(STANDARD_COLUMNS).forEach(([_, category]) => {
      category.fields.forEach(field => {
        if (selectedColumns[field.key]) {
          if (field.required || ['po_number', 'customer_name', 'po_date'].includes(field.key)) {
            required_fields.push(field.key);
          } else {
            optional_fields.push(field.key);
          }
        }
      });
    });

    // Process custom header fields
    customHeaderFields.forEach(field => {
      if (selectedColumns[field.key]) {
        if (field.required) {
          required_fields.push(field.key);
        } else {
          optional_fields.push(field.key);
        }
      }
    });

    // Build line items schema from standard fields
    const items_required = [];
    const items_optional = [];
    LINE_ITEM_FIELDS.forEach(field => {
      if (selectedLineItems[field.key]) {
        if (field.required) {
          items_required.push(field.key);
        } else {
          items_optional.push(field.key);
        }
      }
    });

    // Process custom line item fields
    customLineItemFields.forEach(field => {
      if (selectedLineItems[field.key]) {
        if (field.required) {
          items_required.push(field.key);
        } else {
          items_optional.push(field.key);
        }
      }
    });

    return {
      template_key: templateKey,
      customer_name: templateName,
      description: templateDescription || `Parser template for ${templateName}`,
      category: templateCategory,
      identification_keywords: identificationKeywords.split(',').map(k => k.trim()).filter(k => k),
      po_number_pattern: poNumberPattern || null,
      required_fields,
      optional_fields,
      items_schema: {
        required: items_required,
        optional: items_optional,
      },
      custom_fields: customHeaderFields.length > 0 || customLineItemFields.length > 0 ? {
        header: customHeaderFields.map(f => ({ key: f.key, name: f.name, type: f.type })),
        line_items: customLineItemFields.map(f => ({ key: f.key, name: f.name, type: f.type })),
      } : undefined,
      is_active: isActive,
    };
  };

  const updateJsonView = () => {
    const data = buildTemplateData();
    setJsonView(JSON.stringify(data, null, 2));
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      setError('Please enter a customer name');
      return;
    }

    if (!templateKey.trim()) {
      setError('Please enter a template key');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const templateData = buildTemplateData();

      const response = await fetch('/api/v1/pdf-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create template');
      }

      const result = await response.json();
      if (result.success) {
        onSuccess?.(result.data);
        handleClose();
      } else {
        throw new Error(result.detail || 'Failed to create template');
      }
    } catch (err) {
      console.error('Error creating template:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const totalSelectedColumns = Object.values(selectedColumns).filter(Boolean).length;
  const totalSelectedLineItems = Object.values(selectedLineItems).filter(Boolean).length;
  const totalCustomHeaderFields = customHeaderFields.length;
  const totalCustomLineItemFields = customLineItemFields.length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: darkMode ? '#161b22' : 'background.paper',
          maxHeight: '92vh',
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 1,
      }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Create New Template
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define column mappings for a new customer PDF format
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* PDF Import Section */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            borderStyle: 'dashed',
            borderColor: alpha('#002352', 0.4),
            bgcolor: alpha('#002352', 0.02),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CloudUploadIcon sx={{ fontSize: 40, color: '#002352' }} />
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                Import Sample PDF (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload a sample PDF to auto-detect fields and pre-select matching columns
              </Typography>
            </Box>
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              startIcon={isAnalyzing ? <CircularProgress size={16} color="inherit" /> : <UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              sx={{
                background: 'linear-gradient(135deg, #002352 0%, #00357a 100%)',
              }}
            >
              {isAnalyzing ? 'Analyzing...' : 'Upload PDF'}
            </Button>
          </Box>

          {uploadedFileName && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} />
              <Typography variant="body2" color="success.main">
                Analyzed: {uploadedFileName}
              </Typography>
              {detectedFields.length > 0 && (
                <Chip
                  label={`${detectedFields.length} fields detected`}
                  size="small"
                  color="success"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          )}
        </Paper>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, v) => {
            if (v === 1) updateJsonView();
            setActiveTab(v);
          }}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<TableIcon />} iconPosition="start" label="Column Selection" />
          <Tab icon={<CodeIcon />} iconPosition="start" label="JSON Preview" />
        </Tabs>

        {/* Column Selection View */}
        {activeTab === 0 && (
          <Box>
            {/* Basic Information */}
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
                  onChange={handleNameChange}
                  placeholder="e.g., Acme Corporation"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Template Key"
                  value={templateKey}
                  onChange={(e) => setTemplateKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g., acme_corp"
                  helperText="Unique identifier (lowercase, no spaces)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Identification Keywords"
                  value={identificationKeywords}
                  onChange={(e) => setIdentificationKeywords(e.target.value)}
                  placeholder="Keywords to identify this customer's PDFs"
                  helperText="Comma-separated"
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
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Header Fields Selection */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#002352' }}>
                Header Fields ({totalSelectedColumns} selected)
              </Typography>
              {detectedFields.length > 0 && (
                <Chip
                  icon={<AutoFixHighIcon />}
                  label="Auto-matched from PDF"
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
            </Box>

            {/* Category Accordions */}
            {Object.entries(STANDARD_COLUMNS).map(([categoryKey, category]) => (
              <Accordion key={categoryKey} defaultExpanded={categoryKey === 'header'}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography fontWeight={500}>{category.label}</Typography>
                    <Chip
                      label={`${getSelectedCount(categoryKey)}/${category.fields.length}`}
                      size="small"
                      color={getSelectedCount(categoryKey) > 0 ? 'primary' : 'default'}
                      sx={{ ml: 'auto', mr: 2 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button size="small" onClick={() => selectAllInCategory(categoryKey)}>
                      Select All
                    </Button>
                    <Button size="small" onClick={() => deselectAllInCategory(categoryKey)}>
                      Deselect Optional
                    </Button>
                  </Box>
                  <Grid container spacing={1}>
                    {category.fields.map(field => (
                      <Grid item xs={6} sm={4} md={3} key={field.key}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1,
                            cursor: 'pointer',
                            borderColor: selectedColumns[field.key] ? '#002352' : 'divider',
                            bgcolor: selectedColumns[field.key] ? alpha('#002352', 0.05) : 'transparent',
                            '&:hover': {
                              borderColor: '#002352',
                              bgcolor: alpha('#002352', 0.02),
                            },
                          }}
                          onClick={() => !field.required && toggleColumn(field.key)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Checkbox
                              checked={!!selectedColumns[field.key]}
                              disabled={field.required}
                              size="small"
                              sx={{ p: 0.5 }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {field.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {field.type} {field.required && '• Required'}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}

            <Divider sx={{ my: 3 }} />

            {/* Line Item Fields */}
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: '#002352' }}>
              Line Item Fields ({totalSelectedLineItems} selected)
            </Typography>

            <Grid container spacing={1}>
              {LINE_ITEM_FIELDS.map(field => (
                <Grid item xs={6} sm={4} md={3} key={field.key}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      borderColor: selectedLineItems[field.key] ? '#8b5cf6' : 'divider',
                      bgcolor: selectedLineItems[field.key] ? alpha('#8b5cf6', 0.05) : 'transparent',
                      '&:hover': {
                        borderColor: '#8b5cf6',
                        bgcolor: alpha('#8b5cf6', 0.02),
                      },
                    }}
                    onClick={() => !field.required && toggleLineItem(field.key)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox
                        checked={!!selectedLineItems[field.key]}
                        disabled={field.required}
                        size="small"
                        sx={{ p: 0.5, color: '#8b5cf6', '&.Mui-checked': { color: '#8b5cf6' } }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {field.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {field.type} {field.required && '• Required'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Custom Columns Section */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: '#10b981' }}>
              Custom Columns {(totalCustomHeaderFields + totalCustomLineItemFields) > 0 && `(${totalCustomHeaderFields + totalCustomLineItemFields} added)`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add custom fields that are not in the predefined list above
            </Typography>

            {/* Add Custom Header Field */}
            <Accordion defaultExpanded={customHeaderFields.length > 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography fontWeight={500}>Custom Header Fields</Typography>
                  {customHeaderFields.length > 0 && (
                    <Chip
                      label={customHeaderFields.length}
                      size="small"
                      sx={{ ml: 'auto', mr: 2, bgcolor: '#10b981', color: 'white' }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    label="Field Name"
                    value={newHeaderField.name}
                    onChange={(e) => setNewHeaderField({ ...newHeaderField, name: e.target.value })}
                    placeholder="e.g., Vendor Code"
                    sx={{ minWidth: 180 }}
                  />
                  <TextField
                    size="small"
                    label="Field Key"
                    value={newHeaderField.key}
                    onChange={(e) => setNewHeaderField({ ...newHeaderField, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    placeholder="e.g., vendor_code"
                    sx={{ minWidth: 150 }}
                    helperText="Auto-generated if empty"
                  />
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newHeaderField.type}
                      label="Type"
                      onChange={(e) => setNewHeaderField({ ...newHeaderField, type: e.target.value })}
                    >
                      <MenuItem value="string">String</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="date">Date</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="phone">Phone</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Checkbox
                      checked={newHeaderField.required}
                      onChange={(e) => setNewHeaderField({ ...newHeaderField, required: e.target.checked })}
                      size="small"
                    />
                    <Typography variant="body2">Required</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={addCustomHeaderField}
                    sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                  >
                    Add
                  </Button>
                </Box>

                {/* Display added custom header fields */}
                {customHeaderFields.length > 0 && (
                  <Grid container spacing={1}>
                    {customHeaderFields.map(field => (
                      <Grid item xs={6} sm={4} md={3} key={field.key}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1,
                            borderColor: '#10b981',
                            bgcolor: alpha('#10b981', 0.05),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {field.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {field.key} • {field.type} {field.required && '• Required'}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeCustomHeaderField(field.key)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Add Custom Line Item Field */}
            <Accordion defaultExpanded={customLineItemFields.length > 0} sx={{ mt: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography fontWeight={500}>Custom Line Item Fields</Typography>
                  {customLineItemFields.length > 0 && (
                    <Chip
                      label={customLineItemFields.length}
                      size="small"
                      sx={{ ml: 'auto', mr: 2, bgcolor: '#10b981', color: 'white' }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    label="Field Name"
                    value={newLineItemField.name}
                    onChange={(e) => setNewLineItemField({ ...newLineItemField, name: e.target.value })}
                    placeholder="e.g., Weight"
                    sx={{ minWidth: 180 }}
                  />
                  <TextField
                    size="small"
                    label="Field Key"
                    value={newLineItemField.key}
                    onChange={(e) => setNewLineItemField({ ...newLineItemField, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    placeholder="e.g., weight"
                    sx={{ minWidth: 150 }}
                    helperText="Auto-generated if empty"
                  />
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newLineItemField.type}
                      label="Type"
                      onChange={(e) => setNewLineItemField({ ...newLineItemField, type: e.target.value })}
                    >
                      <MenuItem value="string">String</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="date">Date</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Checkbox
                      checked={newLineItemField.required}
                      onChange={(e) => setNewLineItemField({ ...newLineItemField, required: e.target.checked })}
                      size="small"
                    />
                    <Typography variant="body2">Required</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={addCustomLineItemField}
                    sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                  >
                    Add
                  </Button>
                </Box>

                {/* Display added custom line item fields */}
                {customLineItemFields.length > 0 && (
                  <Grid container spacing={1}>
                    {customLineItemFields.map(field => (
                      <Grid item xs={6} sm={4} md={3} key={field.key}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1,
                            borderColor: '#10b981',
                            bgcolor: alpha('#10b981', 0.05),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {field.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {field.key} • {field.type} {field.required && '• Required'}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeCustomLineItemField(field.key)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Detected fields from PDF that don't match standard columns */}
            {detectedFields.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: '#f59e0b' }}>
                  Detected Fields from PDF ({detectedFields.length})
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                  <Grid container spacing={1}>
                    {detectedFields.map((field, idx) => (
                      <Grid item xs={6} sm={4} key={idx}>
                        <Tooltip title={`Sample: ${field.sample_value || 'N/A'}`}>
                          <Chip
                            label={field.field_name || field.field_label}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 0.5 }}
                          />
                        </Tooltip>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </>
            )}
          </Box>
        )}

        {/* JSON Preview */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Review the template configuration before creating. This JSON will be saved to the database.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={22}
              value={jsonView}
              InputProps={{ readOnly: true }}
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                },
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {totalSelectedColumns} header fields, {totalSelectedLineItems} line item fields
            {(totalCustomHeaderFields + totalCustomLineItemFields) > 0 && (
              <span style={{ color: '#10b981', fontWeight: 500 }}>
                {' '}(+ {totalCustomHeaderFields + totalCustomLineItemFields} custom)
              </span>
            )}
          </Typography>
        </Box>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={saveTemplate}
          disabled={!templateName.trim() || !templateKey.trim() || isSaving}
          startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
          sx={{
            background: 'linear-gradient(135deg, #002352 0%, #00357a 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00357a 0%, #1d4ed8 100%)',
            },
          }}
        >
          {isSaving ? 'Creating...' : 'Create Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTemplateModal;
