/**
 * PDF Parser Studio Component
 *
 * Template-based PDF data extraction with customizable schemas.
 *
 * Backend Integration:
 * - Loads template schemas from backend/src/templates/*.json
 * - Mirrors template_aware_extraction.py load_templates() method
 * - Supports required_fields, optional_fields, and items_schema
 * - Compatible with backend schema structure for seamless integration
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Card, CardContent, Grid, Chip,
  TextField, Breadcrumbs, Link, Avatar, Stack, IconButton, alpha,
  Stepper, Step, StepLabel, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Select, MenuItem, FormControl,
  InputLabel, Checkbox, FormControlLabel, Fade, Zoom, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  CloudUpload, ArrowBack, NavigateNext, ArrowForward, Close, Download,
  Add, Edit, Delete, PictureAsPdf, Schema, CheckCircle, Search,
  FileDownload, Code, ContentPaste, Refresh,
} from '@mui/icons-material';

// Backend template schemas - Loaded from backend/src/templates/*.json
// Mirrors the template_aware_extraction.py load_templates() method
const BACKEND_SCHEMAS = [
  // Auto-detect template
  {
    "name": "🤖 Auto-Detect Template",
    "description": "Automatically detect the best matching template using AI",
    "required_fields": [],
    "optional_fields": [],
    "items_schema": {
      "required": [],
      "optional": []
    }
  },
  // nexxt_restock_pack_list.json
  {
    "name": "Restock Pack List",
    "description": "Packing list for restock orders",
    "required_fields": [
      "document_type",
      "date",
      "customer_name",
      "facility_name",
      "items",
      "total_items"
    ],
    "optional_fields": [
      "order_number",
      "dos",
      "notes",
      "part_number",
      "backorders"
    ],
    "items_schema": {
      "required": [
        "item_code",
        "description",
        "quantity"
      ],
      "optional": [
        "location",
        "lot_number"
      ]
    }
  },
  // nexxt_sales_order_with_invoice.json
  {
    "name": "Nexxt Spine Sales Order with Invoice",
    "description": "Nexxt Spine sales order combined with invoice",
    "required_fields": [
      "order_number",
      "invoice_number",
      "date",
      "est_ship_date",
      "customer_number",
      "customer_name",
      "customer_address",
      "bill_to_name",
      "bill_to_address",
      "ship_to_name",
      "ship_to_address",
      "items",
      "subtotal",
      "discount",
      "freight",
      "tax",
      "total",
      "payment_terms",
      "due_date"
    ],
    "optional_fields": [
      "patient",
      "sales_person",
      "notes",
      "attention",
      "po_number"
    ],
    "items_schema": {
      "required": [
        "item_code",
        "description",
        "quantity",
        "price",
        "total"
      ],
      "optional": []
    }
  },
  // nexxt_sales_order.json
  {
    "name": "Nexxt Spine Sales Order",
    "description": "Standard Nexxt Spine sales order without invoice",
    "required_fields": [
      "order_number",
      "date",
      "est_ship_date",
      "customer_number",
      "customer_name",
      "customer_address",
      "bill_to_name",
      "bill_to_address",
      "ship_to_name",
      "ship_to_address",
      "items",
      "subtotal",
      "discount",
      "freight",
      "tax",
      "total"
    ],
    "optional_fields": [
      "patient",
      "sales_person",
      "notes",
      "attention"
    ],
    "items_schema": {
      "required": [
        "item_code",
        "description",
        "quantity",
        "price",
        "total"
      ],
      "optional": []
    }
  }
];

// Convert backend schema field name to appropriate data type
const inferDataType = (fieldName) => {
  const lowerName = fieldName.toLowerCase();

  if (lowerName.includes('date')) return 'date';
  if (lowerName.includes('total') || lowerName.includes('subtotal') ||
      lowerName.includes('discount') || lowerName.includes('freight') ||
      lowerName.includes('tax') || lowerName.includes('price')) return 'currency';
  if (lowerName.includes('quantity') || lowerName.includes('number') ||
      lowerName.includes('items')) return 'number';
  return 'text';
};

// Convert backend schema to PDF Parser template format
// Mirrors the template_aware_extraction.py create_schema_prompt() method
const convertSchemaToTemplate = (schema, index) => {
  const columns = [];
  let columnId = 1;

  // Add required fields
  schema.required_fields.forEach(field => {
    columns.push({
      id: Date.now() + columnId++,
      name: field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      dataType: inferDataType(field),
      regexPattern: '',
      required: true,
    });
  });

  // Add optional fields
  schema.optional_fields.forEach(field => {
    columns.push({
      id: Date.now() + columnId++,
      name: field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      dataType: inferDataType(field),
      regexPattern: '',
      required: false,
    });
  });

  // Add items schema fields (if present)
  if (schema.items_schema) {
    // Add required item fields
    if (schema.items_schema.required) {
      schema.items_schema.required.forEach(field => {
        columns.push({
          id: Date.now() + columnId++,
          name: `Item ${field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`,
          dataType: inferDataType(field),
          regexPattern: '',
          required: true,
        });
      });
    }

    // Add optional item fields
    if (schema.items_schema.optional && schema.items_schema.optional.length > 0) {
      schema.items_schema.optional.forEach(field => {
        columns.push({
          id: Date.now() + columnId++,
          name: `Item ${field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`,
          dataType: inferDataType(field),
          regexPattern: '',
          required: false,
        });
      });
    }
  }

  return {
    id: Date.now() + index * 1000,
    name: schema.name,
    description: schema.description,
    columns: columns,
    createdAt: new Date().toISOString(),
    source: 'backend_schema'
  };
};

const PDFParserStudio = ({ onBack }) => {
  // View state
  const [view, setView] = useState('list'); // 'list', 'create-template', 'workflow'
  const [activeStep, setActiveStep] = useState(0); // Workflow steps: 0-3

  // Template management
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Template builder
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [columns, setColumns] = useState([]);

  // JSON Schema Dialog
  const [jsonSchemaDialogOpen, setJsonSchemaDialogOpen] = useState(false);
  const [jsonSchemaInput, setJsonSchemaInput] = useState('');
  const [jsonSchemaError, setJsonSchemaError] = useState('');

  // Workflow state
  const [uploadedPDF, setUploadedPDF] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [validatedData, setValidatedData] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const fileInputRef = useRef(null);

  // Load templates from localStorage or initialize with backend schemas
  useEffect(() => {
    const savedTemplates = localStorage.getItem('pdfParserTemplates');

    // Always create backend schema templates
    const backendTemplates = BACKEND_SCHEMAS.map((schema, index) =>
      convertSchemaToTemplate(schema, index)
    );

    if (savedTemplates) {
      try {
        const parsedTemplates = JSON.parse(savedTemplates);

        // Check if we already have backend schemas loaded
        const hasBackendSchemas = parsedTemplates.some(t => t.source === 'backend_schema');

        if (!hasBackendSchemas && parsedTemplates.length > 0) {
          // Merge user templates with backend schemas
          const mergedTemplates = [...backendTemplates, ...parsedTemplates];
          setTemplates(mergedTemplates);
          localStorage.setItem('pdfParserTemplates', JSON.stringify(mergedTemplates));
        } else if (parsedTemplates.length === 0) {
          // Empty array in localStorage, load backend schemas
          setTemplates(backendTemplates);
          localStorage.setItem('pdfParserTemplates', JSON.stringify(backendTemplates));
        } else {
          // Has backend schemas already, just load as-is
          setTemplates(parsedTemplates);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        // On error, load backend schemas
        setTemplates(backendTemplates);
        localStorage.setItem('pdfParserTemplates', JSON.stringify(backendTemplates));
      }
    } else {
      // No localStorage data, initialize with backend schemas
      setTemplates(backendTemplates);
      localStorage.setItem('pdfParserTemplates', JSON.stringify(backendTemplates));
    }
  }, []);

  // Save templates to localStorage
  useEffect(() => {
    if (templates.length >= 0) {
      localStorage.setItem('pdfParserTemplates', JSON.stringify(templates));
    }
  }, [templates]);

  // Custom Step Icon Component
  const CustomStepIcon = (props) => {
    const { active, completed, icon } = props;

    const icons = [
      { icon: CloudUpload, color: '#10b981' },
      { icon: Schema, color: '#06b6d4' },
      { icon: CheckCircle, color: '#8b5cf6' },
      { icon: Download, color: '#2b88d8' },
    ];

    const { icon: IconComponent, color } = icons[Number(icon) - 1] || icons[0];

    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: completed ? color : active ? alpha(color, 0.1) : '#f3f4f6',
          color: completed ? 'white' : active ? color : '#9ca3af',
          border: '2px solid',
          borderColor: completed ? color : active ? color : '#e5e7eb',
          transition: 'all 0.3s ease',
          transform: active ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <IconComponent sx={{ fontSize: 20 }} />
      </Box>
    );
  };

  // Add new column
  const addColumn = () => {
    setColumns(prev => [...prev, {
      id: Date.now(),
      name: '',
      dataType: 'text',
      regexPattern: '',
      required: false,
    }]);
  };

  // Update column
  const updateColumn = (id, field, value) => {
    setColumns(prev => prev.map(col =>
      col.id === id ? { ...col, [field]: value } : col
    ));
  };

  // Delete column
  const deleteColumn = (id) => {
    setColumns(prev => prev.filter(col => col.id !== id));
  };

  // Open JSON Schema Dialog
  const openJsonSchemaDialog = () => {
    setJsonSchemaInput('');
    setJsonSchemaError('');
    setJsonSchemaDialogOpen(true);
  };

  // Import columns from JSON schema
  const importJsonSchema = () => {
    setJsonSchemaError('');

    try {
      const parsed = JSON.parse(jsonSchemaInput);

      // Validate it's an array
      if (!Array.isArray(parsed)) {
        setJsonSchemaError('JSON must be an array of column definitions');
        return;
      }

      // Validate each column object
      const validDataTypes = ['text', 'number', 'currency', 'date', 'boolean'];
      const newColumns = [];

      for (let i = 0; i < parsed.length; i++) {
        const col = parsed[i];

        if (!col.name || typeof col.name !== 'string') {
          setJsonSchemaError(`Column at index ${i} is missing a valid "name" field`);
          return;
        }

        if (col.dataType && !validDataTypes.includes(col.dataType)) {
          setJsonSchemaError(`Column "${col.name}" has invalid dataType. Must be one of: ${validDataTypes.join(', ')}`);
          return;
        }

        newColumns.push({
          id: Date.now() + i,
          name: col.name,
          dataType: col.dataType || 'text',
          regexPattern: col.regexPattern || col.regex || '',
          required: col.required === true,
        });
      }

      // Add the new columns
      setColumns(prev => [...prev, ...newColumns]);
      setJsonSchemaDialogOpen(false);
      setJsonSchemaInput('');
      setJsonSchemaError('');
    } catch (error) {
      setJsonSchemaError(`Invalid JSON: ${error.message}`);
    }
  };

  // Save template
  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (columns.length === 0) {
      alert('Please add at least one column');
      return;
    }

    const newTemplate = {
      id: Date.now(),
      name: templateName,
      description: templateDescription,
      columns: columns,
      createdAt: new Date().toISOString(),
    };

    setTemplates(prev => [...prev, newTemplate]);
    setView('list');
    setTemplateName('');
    setTemplateDescription('');
    setColumns([]);
  };

  // Delete template
  const deleteTemplate = (templateId) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  // Reset templates to backend schemas
  const resetToBackendSchemas = () => {
    if (window.confirm('This will reset all templates to the backend schema defaults. User-created templates will be lost. Continue?')) {
      const backendTemplates = BACKEND_SCHEMAS.map((schema, index) =>
        convertSchemaToTemplate(schema, index)
      );
      setTemplates(backendTemplates);
      localStorage.setItem('pdfParserTemplates', JSON.stringify(backendTemplates));
    }
  };

  // Start new workflow
  const startWorkflow = (template) => {
    setSelectedTemplate(template);
    setView('workflow');
    setActiveStep(0);
    setUploadedPDF(null);
    setExtractedData(null);
    setValidatedData([]);
  };

  // Handle PDF upload
  const handlePDFUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedPDF({
        file: file,
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        pages: Math.floor(Math.random() * 20) + 1, // Mock page count
      });
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  // Extract data from PDF using backend API
  const extractData = async () => {
    if (!uploadedPDF || !selectedTemplate) return;

    setIsExtracting(true);

    try {
      // Convert template to backend schema format
      const templateSchema = {
        name: selectedTemplate.name,
        description: selectedTemplate.description || '',
        required_fields: [],
        optional_fields: [],
        items_schema: {
          required: [],
          optional: []
        },
        auto_detect: false  // Flag for auto-detection
      };

      // Categorize columns into required/optional and main/items fields
      selectedTemplate.columns.forEach(col => {
        const fieldName = col.name.toLowerCase().replace(/\s+/g, '_');

        // Check if it's an item field (starts with "Item ")
        if (col.name.startsWith('Item ')) {
          const itemField = col.name.substring(5).toLowerCase().replace(/\s+/g, '_');
          if (col.required) {
            templateSchema.items_schema.required.push(itemField);
          } else {
            templateSchema.items_schema.optional.push(itemField);
          }
        } else {
          // Main document field
          if (col.required) {
            templateSchema.required_fields.push(fieldName);
          } else {
            templateSchema.optional_fields.push(fieldName);
          }
        }
      });

      // Enable auto-detection if template has no fields defined
      if (templateSchema.required_fields.length === 0 &&
          templateSchema.optional_fields.length === 0 &&
          templateSchema.items_schema.required.length === 0) {
        templateSchema.auto_detect = true;
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', uploadedPDF.file);
      formData.append('template', JSON.stringify(templateSchema));

      // Call backend API
      const response = await fetch('http://localhost:8000/api/v1/pdf/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Extraction failed');
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('No data extracted from PDF');
      }

      // If auto-detection was used, dynamically generate columns from the returned schema
      let workingTemplate = selectedTemplate;
      if (result.template_schema && selectedTemplate.columns.length === 0) {
        const schema = result.template_schema;
        const generatedColumns = [];

        // Add main document fields (required)
        schema.required_fields?.forEach(field => {
          // Skip 'items' field - it's structural, not a display column
          if (field.toLowerCase() === 'items') return;

          generatedColumns.push({
            name: field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            dataType: field.toLowerCase().includes('date') ? 'date' : 'string',
            required: true
          });
        });

        // Add main document fields (optional)
        schema.optional_fields?.forEach(field => {
          // Skip 'items' field - it's structural, not a display column
          if (field.toLowerCase() === 'items') return;

          generatedColumns.push({
            name: field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            dataType: field.toLowerCase().includes('date') ? 'date' : 'string',
            required: false
          });
        });

        // Add item fields (required)
        schema.items_schema?.required?.forEach(field => {
          generatedColumns.push({
            name: 'Item ' + field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            dataType: field.toLowerCase().includes('date') ? 'date' : 'string',
            required: true
          });
        });

        // Add item fields (optional)
        schema.items_schema?.optional?.forEach(field => {
          generatedColumns.push({
            name: 'Item ' + field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            dataType: field.toLowerCase().includes('date') ? 'date' : 'string',
            required: false
          });
        });

        // Update working template with generated columns
        workingTemplate = {
          ...selectedTemplate,
          name: result.template || selectedTemplate.name,
          description: schema.description || `Auto-detected: ${result.template}`,
          columns: generatedColumns
        };

        // Update the selected template for display
        setSelectedTemplate(workingTemplate);
      }

      // Convert backend response to table rows
      const extractedData = result.data;
      const rows = [];

      // Handle items array if present
      if (extractedData.items && Array.isArray(extractedData.items)) {
        extractedData.items.forEach((item, idx) => {
          const row = { id: idx + 1 };

          // Add main document fields to each row
          workingTemplate.columns.forEach(col => {
            const fieldName = col.name.toLowerCase().replace(/\s+/g, '_');

            if (col.name.startsWith('Item ')) {
              // Item field
              const itemField = col.name.substring(5).toLowerCase().replace(/\s+/g, '_');
              let value = item[itemField];

              // Convert to proper type
              if (col.dataType === 'date' && value) {
                row[col.name] = new Date(value);
              } else {
                row[col.name] = value;
              }
            } else {
              // Main document field (same for all rows)
              let value = extractedData[fieldName];

              // Convert to proper type
              if (col.dataType === 'date' && value) {
                row[col.name] = new Date(value);
              } else {
                row[col.name] = value;
              }
            }
          });

          rows.push(row);
        });
      } else {
        // No items array - create single row with all fields
        const row = { id: 1 };

        workingTemplate.columns.forEach(col => {
          const fieldName = col.name.toLowerCase().replace(/\s+/g, '_');
          let value = extractedData[fieldName];

          // Convert to proper type
          if (col.dataType === 'date' && value) {
            row[col.name] = new Date(value);
          } else {
            row[col.name] = value;
          }
        });

        rows.push(row);
      }

      setExtractedData({
        rows: rows,
        stats: {
          totalRows: rows.length,
          columnsExtracted: workingTemplate.columns.length,
          requiredFieldsFilled: workingTemplate.columns.filter(c => c.required).length,
        },
      });
      setValidatedData(rows);
      setActiveStep(2); // Move to validate step
    } catch (error) {
      console.error('Extraction error:', error);
      alert(`Extraction failed: ${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!validatedData || validatedData.length === 0) return;

    const headers = selectedTemplate.columns.map(col => col.name);
    const csvContent = [
      headers.join(','),
      ...validatedData.map(row =>
        headers.map(header => {
          const value = row[header];
          // Handle Date objects
          if (value instanceof Date) {
            return value.toISOString().split('T')[0];
          }
          // Handle strings with commas
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.name}_${uploadedPDF.name.replace('.pdf', '')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to JSON
  const exportToJSON = () => {
    if (!validatedData || validatedData.length === 0) return;

    const jsonContent = JSON.stringify(validatedData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.name}_${uploadedPDF.name.replace('.pdf', '')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Render Template List View
  const renderTemplateList = () => {
    const filteredTemplates = templates.filter(template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>Your Extraction Templates</Typography>
            <Typography variant="body2" color="text.secondary">
              Create custom templates to extract structured data from PDF documents
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<Refresh />}
              variant="outlined"
              onClick={resetToBackendSchemas}
              size="small"
              sx={{
                borderColor: alpha('#64748b', 0.3),
                color: '#64748b',
                '&:hover': {
                  borderColor: '#64748b',
                  bgcolor: alpha('#64748b', 0.05),
                }
              }}
            >
              Reset to Defaults
            </Button>
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => setView('create-template')}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  transform: 'scale(1.02)',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                }
              }}
            >
              Create New Template
            </Button>
          </Stack>
        </Box>

        {/* Search Bar */}
        {templates.length > 0 && (
          <Fade in timeout={300}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search templates by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#10b981' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery('')}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: alpha('#10b981', 0.2),
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: alpha('#10b981', 0.4),
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                }}
              />
            </Box>
          </Fade>
        )}

        <Grid container spacing={3}>
          {templates.length === 0 && (
            <Grid item xs={12}>
              <Zoom in timeout={300}>
                <Paper sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(255, 255, 255, 1) 100%)',
                  border: '2px dashed',
                  borderColor: alpha('#10b981', 0.3),
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#10b981',
                    bgcolor: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
                  }
                }}>
                  <Schema sx={{ fontSize: 64, color: alpha('#10b981', 0.4), mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                    No Templates Created Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create your first template to start extracting data from PDF documents
                  </Typography>
                  <Button
                    startIcon={<Add />}
                    variant="contained"
                    onClick={() => setView('create-template')}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        transform: 'scale(1.02)',
                      }
                    }}
                  >
                    Create Your First Template
                  </Button>
                </Paper>
              </Zoom>
            </Grid>
          )}

          {filteredTemplates.length === 0 && templates.length > 0 && (
            <Grid item xs={12}>
              <Zoom in timeout={300}>
                <Paper sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: alpha('#64748b', 0.02),
                  border: '2px dashed',
                  borderColor: alpha('#64748b', 0.3),
                  borderRadius: 2,
                }}>
                  <Search sx={{ fontSize: 64, color: alpha('#64748b', 0.4), mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                    No Templates Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    No templates match your search "{searchQuery}". Try a different search term.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setSearchQuery('')}
                    sx={{
                      borderColor: alpha('#64748b', 0.3),
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#64748b',
                        bgcolor: alpha('#64748b', 0.05),
                      }
                    }}
                  >
                    Clear Search
                  </Button>
                </Paper>
              </Zoom>
            </Grid>
          )}

          {filteredTemplates.map((template, index) => {
            const colors = [
              { main: '#10b981', gradient: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', bg: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(255, 255, 255, 1) 100%)', alpha: alpha('#10b981', 0.1) },
              { main: '#64748b', gradient: 'linear-gradient(90deg, #64748b 0%, #475569 100%)', bg: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(255, 255, 255, 1) 100%)', alpha: alpha('#64748b', 0.1) },
            ];
            const colorScheme = colors[index % colors.length];

            return (
              <Grid item xs={12} md={6} key={template.id}>
                <Zoom in timeout={400 + index * 100}>
                  <Card sx={{
                    height: 240,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid',
                    borderColor: alpha(colorScheme.main, 0.2),
                    borderRadius: 2,
                    overflow: 'hidden',
                    background: colorScheme.bg,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: colorScheme.gradient,
                    },
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 12px 32px ${alpha(colorScheme.main, 0.2)}`,
                      borderColor: colorScheme.main,
                      '& .template-icon': {
                        transform: 'scale(1.1)',
                        bgcolor: colorScheme.main,
                        color: 'white',
                      },
                      '& .access-button': {
                        background: colorScheme.gradient,
                        color: 'white',
                        transform: 'translateX(4px)',
                      },
                    },
                  }}>
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Icon and Badge */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar
                          className="template-icon"
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: colorScheme.alpha,
                            color: colorScheme.main,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Schema sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Stack direction="row" spacing={0.5}>
                          <Chip
                            label={`${template.columns.length} Columns`}
                            size="small"
                            sx={{
                              bgcolor: colorScheme.alpha,
                              color: colorScheme.main,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 24
                            }}
                          />
                          <Chip
                            label={`${template.columns.filter(c => c.required).length} Required`}
                            size="small"
                            sx={{
                              bgcolor: colorScheme.alpha,
                              color: colorScheme.main,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 24
                            }}
                          />
                        </Stack>
                      </Box>

                      {/* Title */}
                      <Typography variant="h6" sx={{
                        fontWeight: 700,
                        color: colorScheme.main,
                        mb: 1,
                        fontSize: '1.1rem',
                        letterSpacing: '-0.3px'
                      }}>
                        {template.name}
                      </Typography>

                      {/* Description */}
                      <Typography variant="body2" sx={{
                        color: 'text.secondary',
                        mb: 'auto',
                        lineHeight: 1.5,
                        fontSize: '0.85rem'
                      }}>
                        {template.description || 'Custom PDF extraction template with field mapping'}
                      </Typography>

                      {/* Footer */}
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: alpha(colorScheme.main, 0.1)
                      }}>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTemplate(template.id);
                            }}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              color: 'error.main'
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                        <Box
                          className="access-button"
                          onClick={() => startWorkflow(template)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: colorScheme.alpha,
                            color: colorScheme.main,
                            px: 2,
                            py: 0.75,
                            borderRadius: 1.5,
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          USE
                          <ArrowForward sx={{ fontSize: 16 }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>
      </>
    );
  };

  // Render Template Builder View
  const renderTemplateBuilder = () => (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          Create New Extraction Template
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Define column mappings and extraction patterns for your PDF documents
        </Typography>
      </Box>

      <Paper sx={{
        p: 3,
        mb: 3,
        background: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(255, 255, 255, 1) 100%)',
        border: '1px solid',
        borderColor: alpha('#10b981', 0.1),
        borderRadius: 2,
      }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: '#10b981' }}>
          Template Information
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Invoice Parser, Purchase Order Extractor"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: alpha('#10b981', 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#10b981', 0.4),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#10b981',
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description (Optional)"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe what this template extracts..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: alpha('#10b981', 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#10b981', 0.4),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#10b981',
                  },
                },
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{
        p: 3,
        mb: 3,
        background: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(255, 255, 255, 1) 100%)',
        border: '1px solid',
        borderColor: alpha('#10b981', 0.1),
        borderRadius: 2,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#10b981' }}>
            Column Definitions
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<ContentPaste />}
              onClick={openJsonSchemaDialog}
              sx={{
                color: '#64748b',
                borderColor: alpha('#64748b', 0.3),
                '&:hover': {
                  borderColor: '#64748b',
                  bgcolor: alpha('#64748b', 0.05),
                }
              }}
              variant="outlined"
              size="small"
            >
              Paste JSON Schema
            </Button>
            <Button
              startIcon={<Add />}
              onClick={addColumn}
              sx={{
                color: '#10b981',
                borderColor: alpha('#10b981', 0.3),
                '&:hover': {
                  borderColor: '#10b981',
                  bgcolor: alpha('#10b981', 0.05),
                }
              }}
              variant="outlined"
              size="small"
            >
              Add Column
            </Button>
          </Stack>
        </Box>

        {columns.length === 0 ? (
          <Box sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: alpha('#10b981', 0.3),
            borderRadius: 2,
            bgcolor: alpha('#10b981', 0.02),
          }}>
            <Code sx={{ fontSize: 48, color: alpha('#10b981', 0.4), mb: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              No columns defined yet.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click "Add Column" to add one at a time, or "Paste JSON Schema" to import multiple columns at once.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>Column Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>Data Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>RegEx Pattern</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>Required</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {columns.map((column) => (
                  <TableRow key={column.id}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={column.name}
                        onChange={(e) => updateColumn(column.id, 'name', e.target.value)}
                        placeholder="Column name"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={column.dataType}
                          onChange={(e) => updateColumn(column.id, 'dataType', e.target.value)}
                        >
                          <MenuItem value="text">Text</MenuItem>
                          <MenuItem value="number">Number</MenuItem>
                          <MenuItem value="currency">Currency</MenuItem>
                          <MenuItem value="date">Date</MenuItem>
                          <MenuItem value="boolean">Boolean</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={column.regexPattern}
                        onChange={(e) => updateColumn(column.id, 'regexPattern', e.target.value)}
                        placeholder="e.g., \d+"
                        fullWidth
                        sx={{ fontFamily: 'monospace' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={column.required}
                        onChange={(e) => updateColumn(column.id, 'required', e.target.checked)}
                        sx={{
                          color: alpha('#10b981', 0.5),
                          '&.Mui-checked': {
                            color: '#10b981',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => deleteColumn(column.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setView('list')}
          sx={{
            borderColor: alpha('#64748b', 0.3),
            color: '#64748b',
            '&:hover': {
              borderColor: '#64748b',
              bgcolor: alpha('#64748b', 0.05),
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={saveTemplate}
          disabled={!templateName.trim() || columns.length === 0}
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            },
            '&:disabled': {
              background: alpha('#10b981', 0.3),
            }
          }}
        >
          Save Template
        </Button>
      </Box>
    </>
  );

  // Render Workflow View
  const renderWorkflow = () => {
    const steps = ['Upload PDF', 'Extract Data', 'Validate', 'Confirm & Export'];

    return (
      <>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
            {selectedTemplate?.name || 'PDF Parser'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Extract structured data from your PDF document
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 4,
              '& .MuiStepConnector-line': {
                borderColor: '#e5e7eb',
                borderTopWidth: 2,
              },
              '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                borderColor: '#10b981',
              },
              '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                borderColor: '#10b981',
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 0: Upload PDF */}
          {activeStep === 0 && (
            <Fade in>
              <Box>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={handlePDFUpload}
                />

                {!uploadedPDF ? (
                  <Paper
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      p: 6,
                      textAlign: 'center',
                      border: '2px dashed',
                      borderColor: alpha('#10b981', 0.3),
                      borderRadius: 2,
                      bgcolor: alpha('#10b981', 0.02),
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#10b981',
                        bgcolor: alpha('#10b981', 0.05),
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    <CloudUpload sx={{ fontSize: 64, color: alpha('#10b981', 0.5), mb: 2 }} />
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#10b981' }}>
                      Upload PDF Document
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Click to browse or drag and drop your PDF file here
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supports: PDF files up to 10MB
                    </Typography>
                  </Paper>
                ) : (
                  <Paper sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: alpha('#10b981', 0.2),
                    borderRadius: 2,
                    bgcolor: alpha('#10b981', 0.02),
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}>
                        <PictureAsPdf sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {uploadedPDF.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Size: {uploadedPDF.size} • Pages: {uploadedPDF.pages}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => setUploadedPDF(null)}
                        sx={{ color: 'error.main' }}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                  </Paper>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(1)}
                    disabled={!uploadedPDF}
                    endIcon={<ArrowForward />}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      },
                      '&:disabled': {
                        background: alpha('#10b981', 0.3),
                      }
                    }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Step 1: Extract Data */}
          {activeStep === 1 && (
            <Fade in>
              <Box>
                <Paper sx={{
                  p: 3,
                  mb: 3,
                  border: '1px solid',
                  borderColor: alpha('#06b6d4', 0.2),
                  borderRadius: 2,
                  bgcolor: alpha('#06b6d4', 0.02),
                }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: '#06b6d4' }}>
                    Template Configuration
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Template
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedTemplate?.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Columns to Extract
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedTemplate?.columns.length} columns
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={extractData}
                    disabled={isExtracting}
                    startIcon={<Schema />}
                    sx={{
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                      },
                      '&:disabled': {
                        background: alpha('#06b6d4', 0.3),
                      }
                    }}
                  >
                    {isExtracting ? 'Extracting Data...' : 'Extract Data from PDF'}
                  </Button>
                </Box>

                {isExtracting && (
                  <Paper sx={{
                    p: 3,
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: alpha('#06b6d4', 0.2),
                    borderRadius: 2,
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Processing PDF and extracting fields...
                    </Typography>
                  </Paper>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(0)}
                    startIcon={<ArrowBack />}
                    sx={{
                      borderColor: alpha('#64748b', 0.3),
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#64748b',
                        bgcolor: alpha('#64748b', 0.05),
                      }
                    }}
                  >
                    Back
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Step 2: Validate */}
          {activeStep === 2 && extractedData && (
            <Fade in>
              <Box>
                <Paper sx={{
                  p: 2,
                  mb: 3,
                  border: '1px solid',
                  borderColor: alpha('#8b5cf6', 0.2),
                  borderRadius: 2,
                  bgcolor: alpha('#8b5cf6', 0.02),
                }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: '#8b5cf6' }}>
                    Extraction Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Total Rows</Typography>
                      <Typography variant="h6" fontWeight={600}>{extractedData.stats.totalRows}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Columns Extracted</Typography>
                      <Typography variant="h6" fontWeight={600}>{extractedData.stats.columnsExtracted}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Required Fields</Typography>
                      <Typography variant="h6" fontWeight={600}>{extractedData.stats.requiredFieldsFilled}</Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: '#8b5cf6' }}>
                  Review and Edit Extracted Data
                </Typography>

                <Box sx={{ height: 400, width: '100%', mb: 3 }}>
                  <DataGrid
                    rows={validatedData}
                    columns={selectedTemplate.columns.map(col => ({
                      field: col.name,
                      headerName: col.name,
                      width: 150,
                      editable: true,
                      type: col.dataType === 'number' || col.dataType === 'currency' ? 'number' :
                            col.dataType === 'date' ? 'date' :
                            col.dataType === 'boolean' ? 'boolean' : 'string',
                      // Handle different value types
                      valueGetter: (params) => {
                        const value = params.value;
                        if (!value) return null;

                        // Handle dates
                        if (col.dataType === 'date') {
                          return value instanceof Date ? value : new Date(value);
                        }

                        // Handle objects and arrays - convert to JSON string
                        if (typeof value === 'object') {
                          return JSON.stringify(value, null, 2);
                        }

                        return value;
                      },
                    }))}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    density="compact"
                    sx={{
                      border: 'none',
                      fontSize: '0.7rem',
                      '& .MuiDataGrid-cell': {
                        borderColor: alpha('#64748b', 0.08),
                        py: 0.25,
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        bgcolor: alpha('#8b5cf6', 0.05),
                        color: '#8b5cf6',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        minHeight: '32px !important',
                        maxHeight: '32px !important',
                      },
                      '& .MuiDataGrid-row': {
                        minHeight: '32px !important',
                        maxHeight: '32px !important',
                      },
                    }}
                    processRowUpdate={(newRow) => {
                      setValidatedData(prev => prev.map(row => row.id === newRow.id ? newRow : row));
                      return newRow;
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(1)}
                    startIcon={<ArrowBack />}
                    sx={{
                      borderColor: alpha('#64748b', 0.3),
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#64748b',
                        bgcolor: alpha('#64748b', 0.05),
                      }
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(3)}
                    endIcon={<ArrowForward />}
                    sx={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      }
                    }}
                  >
                    Continue to Export
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Step 3: Confirm & Export */}
          {activeStep === 3 && (
            <Fade in>
              <Box>
                <Paper sx={{
                  p: 3,
                  mb: 3,
                  border: '1px solid',
                  borderColor: alpha('#2b88d8', 0.2),
                  borderRadius: 2,
                  bgcolor: alpha('#2b88d8', 0.02),
                }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: '#2b88d8' }}>
                    Processing Complete
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">PDF Document</Typography>
                      <Typography variant="body1" fontWeight={600}>{uploadedPDF?.name}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Template Used</Typography>
                      <Typography variant="body1" fontWeight={600}>{selectedTemplate?.name}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Rows Extracted</Typography>
                      <Typography variant="body1" fontWeight={600}>{validatedData.length}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Columns Mapped</Typography>
                      <Typography variant="body1" fontWeight={600}>{selectedTemplate?.columns.length}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip
                        label="✓ Validated"
                        size="small"
                        sx={{
                          bgcolor: alpha('#10b981', 0.1),
                          color: '#10b981',
                          fontWeight: 600,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: '#2b88d8' }}>
                  Final Data Preview
                </Typography>

                <Box sx={{ height: 300, width: '100%', mb: 3 }}>
                  <DataGrid
                    rows={validatedData}
                    columns={selectedTemplate.columns.map(col => ({
                      field: col.name,
                      headerName: col.name,
                      width: 150,
                      // Handle different value types
                      valueGetter: (params) => {
                        const value = params.value;
                        if (!value) return null;

                        // Handle dates
                        if (col.dataType === 'date') {
                          return value instanceof Date ? value : new Date(value);
                        }

                        // Handle objects and arrays - convert to JSON string
                        if (typeof value === 'object') {
                          return JSON.stringify(value, null, 2);
                        }

                        return value;
                      },
                    }))}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    density="compact"
                    sx={{
                      border: 'none',
                      fontSize: '0.7rem',
                      '& .MuiDataGrid-cell': {
                        borderColor: alpha('#64748b', 0.08),
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        bgcolor: alpha('#2b88d8', 0.05),
                        color: '#2b88d8',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      },
                    }}
                  />
                </Box>

                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: '#2b88d8' }}>
                  Export Options
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<FileDownload />}
                      onClick={exportToCSV}
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        py: 1.5,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        }
                      }}
                    >
                      Download CSV
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<FileDownload />}
                      onClick={exportToJSON}
                      sx={{
                        background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                        py: 1.5,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                        }
                      }}
                    >
                      Download JSON
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(2)}
                    startIcon={<ArrowBack />}
                    sx={{
                      borderColor: alpha('#64748b', 0.3),
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#64748b',
                        bgcolor: alpha('#64748b', 0.05),
                      }
                    }}
                  >
                    Back to Validation
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setView('list');
                      setActiveStep(0);
                      setUploadedPDF(null);
                      setExtractedData(null);
                      setValidatedData([]);
                    }}
                    sx={{
                      background: 'linear-gradient(135deg, #2b88d8 0%, #106ebe 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #106ebe 0%, #0078d4 100%)',
                      }
                    }}
                  >
                    Start New Extraction
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}
        </Paper>
      </>
    );
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: '#fafafa' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
              <Link
                component="button"
                variant="body1"
                onClick={onBack}
                sx={{
                  textDecoration: 'none',
                  color: 'text.primary',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Document Intelligence
              </Link>
              <Typography color="primary" variant="body1" fontWeight={600}>
                PDF Parser Studio
              </Typography>
            </Breadcrumbs>
          </Box>
          <Stack direction="row" spacing={1}>
            {view === 'create-template' && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setView('list')}
                sx={{
                  borderColor: alpha('#64748b', 0.3),
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#64748b',
                    bgcolor: alpha('#64748b', 0.05),
                  }
                }}
              >
                Cancel
              </Button>
            )}
            {view === 'workflow' && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setView('list');
                  setActiveStep(0);
                  setUploadedPDF(null);
                  setExtractedData(null);
                  setValidatedData([]);
                }}
                sx={{
                  borderColor: alpha('#64748b', 0.3),
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#64748b',
                    bgcolor: alpha('#64748b', 0.05),
                  }
                }}
              >
                Exit Workflow
              </Button>
            )}
            <Button
              startIcon={<ArrowBack />}
              onClick={onBack}
              variant="outlined"
              size="small"
              sx={{
                borderColor: alpha('#10b981', 0.3),
                color: '#10b981',
                '&:hover': {
                  borderColor: '#10b981',
                  bgcolor: alpha('#10b981', 0.05),
                }
              }}
            >
              Back
            </Button>
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: alpha('#10b981', 0.1) }}>
            <PictureAsPdf sx={{ fontSize: 36, color: '#10b981' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              PDF Parser Studio
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Template-Based Extraction
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      {view === 'list' && renderTemplateList()}
      {view === 'create-template' && renderTemplateBuilder()}
      {view === 'workflow' && renderWorkflow()}

      {/* JSON Schema Import Dialog */}
      <Dialog
        open={jsonSchemaDialogOpen}
        onClose={() => setJsonSchemaDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{
          bgcolor: alpha('#10b981', 0.05),
          borderBottom: '1px solid',
          borderColor: alpha('#10b981', 0.2),
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ContentPaste sx={{ color: '#10b981' }} />
            <Typography variant="h6" fontWeight={600}>
              Import Columns from JSON Schema
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Paste your JSON schema to quickly add multiple columns. The JSON should be an array of column definitions.
          </Typography>

          <Paper sx={{
            p: 2,
            mb: 2,
            bgcolor: alpha('#64748b', 0.03),
            border: '1px solid',
            borderColor: alpha('#64748b', 0.2),
          }}>
            <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block', color: '#64748b' }}>
              Example JSON Format:
            </Typography>
            <Box component="pre" sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#334155',
              m: 0,
              p: 1,
              bgcolor: 'white',
              borderRadius: 1,
              overflow: 'auto',
            }}>
{`[
  {
    "name": "Invoice Number",
    "dataType": "text",
    "regexPattern": "\\\\d+",
    "required": true
  },
  {
    "name": "Amount",
    "dataType": "currency",
    "regexPattern": "\\\\$?\\\\d+\\\\.\\\\d{2}",
    "required": true
  },
  {
    "name": "Date",
    "dataType": "date",
    "regexPattern": "\\\\d{4}-\\\\d{2}-\\\\d{2}",
    "required": false
  }
]`}
            </Box>
          </Paper>

          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Valid Data Types: <strong>text</strong>, <strong>number</strong>, <strong>currency</strong>, <strong>date</strong>, <strong>boolean</strong>
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={12}
            value={jsonSchemaInput}
            onChange={(e) => {
              setJsonSchemaInput(e.target.value);
              setJsonSchemaError('');
            }}
            placeholder="Paste your JSON schema here..."
            sx={{
              fontFamily: 'monospace',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: alpha('#10b981', 0.2),
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: alpha('#10b981', 0.4),
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#10b981',
                },
              },
            }}
          />

          {jsonSchemaError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {jsonSchemaError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
          <Button
            onClick={() => setJsonSchemaDialogOpen(false)}
            sx={{
              color: '#64748b',
              '&:hover': {
                bgcolor: alpha('#64748b', 0.05),
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={importJsonSchema}
            disabled={!jsonSchemaInput.trim()}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
              '&:disabled': {
                background: alpha('#10b981', 0.3),
              }
            }}
          >
            Import Columns
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PDFParserStudio;
