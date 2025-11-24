import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Card, CardContent, Grid, Chip,
  TextField, Breadcrumbs, Link, Avatar, Stack, IconButton, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step,
  StepLabel, Divider, List, ListItem, ListItemText, ListItemIcon,
  Checkbox, FormControlLabel, Switch, MenuItem, Select, FormControl,
  InputLabel, Accordion, AccordionSummary, AccordionDetails, Fade, Zoom,
  InputAdornment,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  CloudUpload, Psychology, Refresh, ArrowBack, NavigateNext, ArrowForward,
  Close, TableChart, Download, Add, Edit, Delete, ExpandMore,
  Layers, DataObject, Chat, AccountTree, Speed, Settings,
  Description, Code, AutoAwesome, PlayArrow, Save, Check, Search,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import excelProcessorApi from '../services/excelProcessorApi';

const ExcelAIProcessor = ({ onBack }) => {
  // Template management
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'create', 'edit', 'execute'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileView, setSelectedFileView] = useState(null); // For file drilldown

  // Template builder state
  const [templateBuilder, setTemplateBuilder] = useState({
    step: 0,
    name: '',
    description: '',
    files: [],
    sheets: [],
    sheetConfig: {},
    businessRules: [],
    aiInstructions: '',
    outputFormat: 'enhanced_excel'
  });

  // Processing state
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResults, setProcessedResults] = useState(null);
  const [processingPipeline, setProcessingPipeline] = useState([]);
  const [aiConversation, setAiConversation] = useState([]);

  // Filter configuration for Financial Analysis template
  const [filterConfig, setFilterConfig] = useState({
    dateFilterType: 'specific', // 'specific', 'week', 'month', 'year', 'none'
    specificDate: '2025-08-21',
    weekStart: '',
    weekEnd: '',
    month: '',
    year: '',
    invoiceFrom: '',
    invoiceTo: '43354',
    amountMin: '0',
  });

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const templateFileRef = useRef(null);
  const templateFolderRef = useRef(null);

  // Sample data for file drilldowns
  const sampleFileData = {
    'Invoice Data': {
      columns: [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'transactionDate', headerName: 'Transaction Date', width: 130 },
        { field: 'invoice', headerName: 'Invoice #', width: 100 },
        { field: 'facility', headerName: 'Facility', width: 200 },
        { field: 'item', headerName: 'Item', width: 150 },
        { field: 'quantity', headerName: 'Quantity', width: 100, type: 'number' },
        { field: 'amount', headerName: 'Amount ($)', width: 120, type: 'number' },
      ],
      rows: [
        { id: 1, transactionDate: '2025-08-15', invoice: 43210, facility: 'Hospital ABC - Main Campus', item: 'MED-12345', quantity: 50, amount: 1250.00 },
        { id: 2, transactionDate: '2025-08-16', invoice: 43211, facility: 'Clinic XYZ - North', item: 'SURG-67890', quantity: 25, amount: 3750.50 },
        { id: 3, transactionDate: '2025-08-17', invoice: 43212, facility: 'Medical Center 123', item: 'LAB-11223', quantity: 100, amount: 850.75 },
        { id: 4, transactionDate: '2025-08-18', invoice: 43213, facility: 'Hospital ABC - East Wing', item: 'PHARM-44556', quantity: 75, amount: 2100.25 },
        { id: 5, transactionDate: '2025-08-19', invoice: 43214, facility: 'Urgent Care Center', item: 'MED-78901', quantity: 30, amount: 920.00 },
      ]
    },
    'Manufacturing Std Cost': {
      columns: [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'itemCode', headerName: 'Item Code', width: 150 },
        { field: 'description', headerName: 'Description', width: 250 },
        { field: 'standardCost', headerName: 'Std Cost ($)', width: 130, type: 'number' },
        { field: 'category', headerName: 'Category', width: 150 },
        { field: 'uom', headerName: 'UOM', width: 100 },
      ],
      rows: [
        { id: 1, itemCode: 'MED-12345', description: 'Medical Supply - Bandages 4x4', standardCost: 25.00, category: 'Medical Supplies', uom: 'BOX' },
        { id: 2, itemCode: 'SURG-67890', description: 'Surgical Instrument Set - Basic', standardCost: 150.02, category: 'Surgical', uom: 'SET' },
        { id: 3, itemCode: 'LAB-11223', description: 'Lab Test Kit - Blood Work', standardCost: 8.51, category: 'Laboratory', uom: 'KIT' },
        { id: 4, itemCode: 'PHARM-44556', description: 'Pharmaceutical - Pain Relief 500mg', standardCost: 28.00, category: 'Pharmacy', uom: 'BOTTLE' },
        { id: 5, itemCode: 'MED-78901', description: 'Medical Equipment - Thermometer Digital', standardCost: 30.67, category: 'Medical Supplies', uom: 'EACH' },
      ]
    },
    'Item Data File': {
      columns: [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'itemId', headerName: 'Item ID', width: 150 },
        { field: 'description', headerName: 'Description', width: 300 },
        { field: 'category', headerName: 'Category', width: 150 },
        { field: 'subcategory', headerName: 'Subcategory', width: 150 },
        { field: 'uom', headerName: 'UOM', width: 100 },
      ],
      rows: [
        { id: 1, itemId: 'MED-12345', description: 'Medical Supply - Bandages 4x4 Sterile', category: 'Medical Supplies', subcategory: 'Wound Care', uom: 'BOX' },
        { id: 2, itemId: 'SURG-67890', description: 'Surgical Instrument Set - Basic Surgery', category: 'Surgical', subcategory: 'Instruments', uom: 'SET' },
        { id: 3, itemId: 'LAB-11223', description: 'Lab Test Kit - Complete Blood Count', category: 'Laboratory', subcategory: 'Testing', uom: 'KIT' },
        { id: 4, itemId: 'PHARM-44556', description: 'Pharmaceutical - Pain Relief 500mg Tablets', category: 'Pharmacy', subcategory: 'Pain Management', uom: 'BOTTLE' },
        { id: 5, itemId: 'MED-78901', description: 'Medical Equipment - Thermometer Digital Infrared', category: 'Medical Supplies', subcategory: 'Diagnostics', uom: 'EACH' },
      ]
    },
    'MSR 2025 Data': {
      columns: [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'hospital', headerName: 'Hospital/Facility', width: 250 },
        { field: 'distributor', headerName: 'Distributor', width: 200 },
        { field: 'territory', headerName: 'Territory', width: 150 },
        { field: 'state', headerName: 'State', width: 100 },
        { field: 'region', headerName: 'Region', width: 120 },
      ],
      rows: [
        { id: 1, hospital: 'Hospital ABC - Main Campus', distributor: 'MedSupply Corp', territory: 'Northeast', state: 'NY', region: 'East' },
        { id: 2, hospital: 'Clinic XYZ - North', distributor: 'Healthcare Distributors Inc', territory: 'Midwest', state: 'IL', region: 'Central' },
        { id: 3, hospital: 'Medical Center 123', distributor: 'Cardinal Health', territory: 'Southwest', state: 'TX', region: 'South' },
        { id: 4, hospital: 'Hospital ABC - East Wing', distributor: 'McKesson Medical', territory: 'Northeast', state: 'NY', region: 'East' },
        { id: 5, hospital: 'Urgent Care Center', distributor: 'Amerisource Bergen', territory: 'West', state: 'CA', region: 'West' },
      ]
    },
    'Original CGS': {
      columns: [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'item', headerName: 'Item', width: 150 },
        { field: 'distributor', headerName: 'Distributor', width: 200 },
        { field: 'historicalCost', headerName: 'Historical Cost ($)', width: 150, type: 'number' },
        { field: 'date', headerName: 'Date', width: 120 },
        { field: 'facility', headerName: 'Facility', width: 200 },
      ],
      rows: [
        { id: 1, item: 'MED-12345', distributor: 'MedSupply Corp', historicalCost: 24.50, date: '2024-12-15', facility: 'Hospital ABC - Main Campus' },
        { id: 2, item: 'SURG-67890', distributor: 'Healthcare Distributors Inc', historicalCost: 148.75, date: '2024-11-20', facility: 'Clinic XYZ - North' },
        { id: 3, item: 'LAB-11223', distributor: 'Cardinal Health', historicalCost: 8.25, date: '2025-01-10', facility: 'Medical Center 123' },
        { id: 4, item: 'PHARM-44556', distributor: 'McKesson Medical', historicalCost: 27.80, date: '2024-10-05', facility: 'Hospital ABC - East Wing' },
        { id: 5, item: 'MED-78901', distributor: 'Amerisource Bergen', historicalCost: 30.00, date: '2025-02-14', facility: 'Urgent Care Center' },
      ]
    }
  };

  // Load templates from localStorage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('excelProcessorTemplates');
    if (savedTemplates) {
      try {
        const parsedTemplates = JSON.parse(savedTemplates);
        setTemplates(parsedTemplates);
      } catch (error) {
        console.error('Error loading templates from localStorage:', error);
      }
    }
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    if (templates.length >= 0) {
      localStorage.setItem('excelProcessorTemplates', JSON.stringify(templates));
    }
  }, [templates]);

  const handleCreateTemplate = () => {
    setTemplateBuilder({
      step: 0,
      name: '',
      description: '',
      files: [],
      sheets: [],
      sheetConfig: {},
      businessRules: [],
      aiInstructions: '',
      outputFormat: 'enhanced_excel'
    });
    setView('create');
  };

  const handleTemplateFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    if (uploadedFiles.length > 0) {
      // Mock sheet detection - in real implementation, parse Excel files
      const allSheets = [];
      const fileInfos = [];

      uploadedFiles.forEach((file, fileIndex) => {
        // Mock sheets for each file
        const mockSheets = [
          { name: `${file.name.replace(/\.[^/.]+$/, '')}_Sheet1`, fileName: file.name, rows: 100, columns: ['A', 'B', 'C', 'D', 'E'], fileIndex },
          { name: `${file.name.replace(/\.[^/.]+$/, '')}_Sheet2`, fileName: file.name, rows: 50, columns: ['A', 'B', 'C'], fileIndex },
          { name: `${file.name.replace(/\.[^/.]+$/, '')}_Summary`, fileName: file.name, rows: 10, columns: ['A', 'B'], fileIndex }
        ];

        allSheets.push(...mockSheets);
        fileInfos.push({
          file: file,
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          sheetCount: mockSheets.length
        });
      });

      setTemplateBuilder(prev => ({
        ...prev,
        files: fileInfos,
        sheets: allSheets,
        sheetConfig: allSheets.reduce((acc, sheet) => ({
          ...acc,
          [sheet.name]: { enabled: true, columns: sheet.columns, fileName: sheet.fileName }
        }), {})
      }));
    }
  };

  const saveTemplate = () => {
    const newTemplate = {
      id: Date.now(),
      name: templateBuilder.name,
      description: templateBuilder.description,
      sheets: templateBuilder.sheets,
      sheetConfig: templateBuilder.sheetConfig,
      businessRules: templateBuilder.businessRules,
      aiInstructions: templateBuilder.aiInstructions,
      outputFormat: templateBuilder.outputFormat,
      createdAt: new Date().toISOString()
    };

    setTemplates(prev => [...prev, newTemplate]);
    setView('list');
    addAIMessage('assistant', `Template "${newTemplate.name}" created successfully!`);
  };

  const handleFileUpload = useCallback((event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newFiles = uploadedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      status: 'uploaded'
    }));
    setFiles(prev => [...prev, ...newFiles]);
    addToPipeline('upload', `Uploaded ${uploadedFiles.length} file(s)`);
  }, []);

  const processWithTemplate = async () => {
    if (!selectedTemplate) {
      alert('Please select a template');
      return;
    }

    try {
      setIsProcessing(true);
      addToPipeline('start', `Starting AI processing with template: ${selectedTemplate.name}`);

      // Start the processing job
      const startResult = await excelProcessorApi.startFinancialAnalysis();
      const jobId = startResult.job_id;

      addToPipeline('queued', `Job ${jobId} queued for processing`);
      addAIMessage('assistant', 'Processing job started. This may take a few moments...');

      // Poll for status updates
      const finalResult = await excelProcessorApi.pollProcessingStatus(
        jobId,
        (statusUpdate) => {
          // Update progress
          if (statusUpdate.message) {
            addToPipeline('progress', statusUpdate.message);
          }
        }
      );

      // Processing complete
      addToPipeline('complete', 'Processing complete!');
      addAIMessage('assistant', `Processing complete! Generated file: ${finalResult.filename}`);

      const results = {
        timestamp: new Date().toISOString(),
        template: selectedTemplate.name,
        filesProcessed: files.length,
        sheetsProcessed: selectedTemplate.sheets.length,
        rowCount: finalResult.row_count,
        insights: [
          `Total rows processed: ${finalResult.row_count?.toLocaleString() || 'N/A'}`,
          'Financial metrics calculated',
          'Distributor mapping completed'
        ],
        downloadUrl: finalResult.download_url,
        staticUrl: finalResult.static_url,
        filename: finalResult.filename
      };

      setProcessedResults(results);
      setIsProcessing(false);
    } catch (error) {
      console.error('Processing error:', error);
      addToPipeline('error', `Error: ${error.message}`);
      addAIMessage('assistant', `Error: ${error.message}`);
      setIsProcessing(false);
      alert(`Processing failed: ${error.message}`);
    }
  };

  const addToPipeline = (type, message) => {
    setProcessingPipeline(prev => [{
      id: Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 20));
  };

  const addAIMessage = (role, content) => {
    setAiConversation(prev => [...prev, {
      id: Date.now() + Math.random(),
      role,
      content,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const deleteTemplate = (templateId) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    addAIMessage('assistant', 'Template deleted successfully.');
  };

  const handleDownload = () => {
    if (processedResults && processedResults.staticUrl) {
      excelProcessorApi.downloadFile(processedResults.staticUrl, processedResults.filename);
      addAIMessage('assistant', `Downloading ${processedResults.filename}...`);
    } else {
      alert('No file available to download');
    }
  };

  const steps = ['Upload Sample', 'Configure Sheets', 'Business Rules', 'AI Instructions', 'Review & Save'];

  // Custom Step Icon Component
  const CustomStepIcon = (props) => {
    const { active, completed, icon } = props;

    const icons = [
      { icon: CloudUpload, color: '#3b82f6' },
      { icon: Settings, color: '#06b6d4' },
      { icon: Code, color: '#8b5cf6' },
      { icon: AutoAwesome, color: '#f97316' },
      { icon: Check, color: '#10b981' },
    ];

    const { icon: IconComponent, color } = icons[Number(icon) - 1];

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

  // Template List View
  const renderTemplateList = () => {
    // Filter templates based on search query
    const filteredTemplates = templates.filter(template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>Your Processing Templates</Typography>
          <Typography variant="body2" color="text.secondary">
            Create custom templates to process Excel files based on your business requirements
          </Typography>
        </Box>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={handleCreateTemplate}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              transform: 'scale(1.02)',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
            }
          }}
        >
          Create New Template
        </Button>
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
                    <Search sx={{ color: '#3b82f6' }} />
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
                    borderColor: alpha('#3b82f6', 0.2),
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#3b82f6', 0.4),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
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
                bgcolor: 'linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(255, 255, 255, 1) 100%)',
                border: '2px dashed',
                borderColor: alpha('#3b82f6', 0.3),
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#3b82f6',
                  bgcolor: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
                }
              }}>
                <Layers sx={{ fontSize: 64, color: alpha('#3b82f6', 0.4), mb: 2 }} />
                <Typography variant="h6" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                  No Templates Created Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first template to start processing Excel files with AI
                </Typography>
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  onClick={handleCreateTemplate}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
          // Corporate color palette - blue primary, slate secondary
          const colors = [
            { main: '#3b82f6', gradient: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', bg: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(255, 255, 255, 1) 100%)', alpha: alpha('#3b82f6', 0.1) },
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
                      <Layers sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Stack direction="row" spacing={0.5}>
                      <Chip label={`${template.sheets.length} Sheets`} size="small" sx={{ bgcolor: colorScheme.alpha, color: colorScheme.main, fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                      <Chip label={`${template.businessRules.length} Rules`} size="small" sx={{ bgcolor: colorScheme.alpha, color: colorScheme.main, fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                    </Stack>
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" sx={{ fontWeight: 700, color: colorScheme.main, mb: 1, fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
                    {template.name}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.5, fontSize: '0.85rem' }}>
                    {template.description || 'Custom Excel processing template with AI-powered analysis'}
                  </Typography>

                  {/* Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid', borderColor: alpha(colorScheme.main, 0.1) }}>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={() => { setSelectedTemplate(template); setView('edit'); }} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => deleteTemplate(template.id)} sx={{ border: '1px solid', borderColor: 'divider', color: 'error.main' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Box
                      className="access-button"
                      onClick={() => { setSelectedTemplate(template); setView('execute'); }}
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
        )}
        )}
      </Grid>
    </>
    );
  };

  // Template Builder View
  const renderTemplateBuilder = () => (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          Create New Processing Template
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Build a custom template to process your Excel files with AI
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper
          activeStep={templateBuilder.step}
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
              borderColor: '#3b82f6',
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 0: Upload Sample Files */}
        {templateBuilder.step === 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Step 1: Upload Sample Excel Files
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload one or more sample Excel files to analyze their structure and configure your template
            </Typography>

            <Box>
              <Box
                onClick={() => templateFileRef.current?.click()}
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 6,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: '#fafafa',
                  '&:hover': { bgcolor: '#f5f5f5', borderColor: 'text.secondary' }
                }}
              >
                <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" fontWeight={500}>
                  Drop Excel files here or click to browse
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supports .xlsx, .xls, .csv • Multiple files allowed
                </Typography>
                <input
                  ref={templateFileRef}
                  type="file"
                  multiple
                  accept=".xlsx,.xls,.csv"
                  onChange={handleTemplateFileUpload}
                  style={{ display: 'none' }}
                />
                <input
                  ref={templateFolderRef}
                  type="file"
                  webkitdirectory=""
                  directory=""
                  onChange={handleTemplateFileUpload}
                  style={{ display: 'none' }}
                />
              </Box>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    templateFolderRef.current?.click();
                  }}
                  startIcon={<CloudUpload />}
                  sx={{ mr: 1 }}
                >
                  Select Folder
                </Button>
                <Button
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    templateFileRef.current?.click();
                  }}
                  startIcon={<CloudUpload />}
                >
                  Select Files
                </Button>
              </Box>
            </Box>

            {templateBuilder.files.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#10b981', 0.05), border: '1px solid', borderColor: alpha('#10b981', 0.2) }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Check sx={{ color: '#10b981' }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {templateBuilder.files.length} File(s) Uploaded Successfully
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {templateBuilder.sheets.length} total sheets detected
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Stack spacing={1}>
                  {templateBuilder.files.map((fileInfo, index) => (
                    <Paper key={index} sx={{ p: 2, bgcolor: '#f9fafb' }}>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <TableChart sx={{ color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{fileInfo.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {fileInfo.size} • {fileInfo.sheetCount} sheets
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newFiles = templateBuilder.files.filter((_, i) => i !== index);
                            const newSheets = templateBuilder.sheets.filter(s => s.fileName !== fileInfo.name);
                            const newSheetConfig = newSheets.reduce((acc, sheet) => ({
                              ...acc,
                              [sheet.name]: { enabled: true, columns: sheet.columns, fileName: sheet.fileName }
                            }), {});
                            setTemplateBuilder(prev => ({
                              ...prev,
                              files: newFiles,
                              sheets: newSheets,
                              sheetConfig: newSheetConfig
                            }));
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* Step 1: Configure Sheets */}
        {templateBuilder.step === 1 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Step 2: Configure Sheets to Process
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select which sheets to process and configure their settings
            </Typography>

            <Stack spacing={2}>
              {templateBuilder.sheets.map(sheet => (
                <Accordion key={sheet.name} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Checkbox
                        checked={templateBuilder.sheetConfig[sheet.name]?.enabled || false}
                        onChange={(e) => {
                          setTemplateBuilder(prev => ({
                            ...prev,
                            sheetConfig: {
                              ...prev.sheetConfig,
                              [sheet.name]: { ...prev.sheetConfig[sheet.name], enabled: e.target.checked }
                            }
                          }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <TableChart sx={{ color: 'text.secondary' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={600}>{sheet.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sheet.fileName} • {sheet.rows} rows, {sheet.columns.length} columns
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Columns: {sheet.columns.join(', ')}
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      label="Sheet Description"
                      placeholder="Describe the purpose of this sheet..."
                      value={templateBuilder.sheetConfig[sheet.name]?.description || ''}
                      onChange={(e) => {
                        setTemplateBuilder(prev => ({
                          ...prev,
                          sheetConfig: {
                            ...prev.sheetConfig,
                            [sheet.name]: { ...prev.sheetConfig[sheet.name], description: e.target.value }
                          }
                        }));
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Box>
        )}

        {/* Step 2: Business Rules */}
        {templateBuilder.step === 2 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Step 3: Define Business Rules
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add business rules and validation logic for data processing
            </Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
              {templateBuilder.businessRules.map((rule, index) => (
                <Paper key={index} sx={{ p: 2, bgcolor: '#f9fafb' }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Code sx={{ color: 'text.secondary', mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{rule.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{rule.description}</Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setTemplateBuilder(prev => ({
                          ...prev,
                          businessRules: prev.businessRules.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            <Button
              startIcon={<Add />}
              variant="outlined"
              fullWidth
              onClick={() => {
                const ruleName = prompt('Enter rule name:');
                const ruleDesc = prompt('Enter rule description:');
                if (ruleName && ruleDesc) {
                  setTemplateBuilder(prev => ({
                    ...prev,
                    businessRules: [...prev.businessRules, { name: ruleName, description: ruleDesc }]
                  }));
                }
              }}
            >
              Add Business Rule
            </Button>
          </Box>
        )}

        {/* Step 3: AI Instructions */}
        {templateBuilder.step === 3 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Step 4: AI Processing Instructions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Provide instructions for AI to process and analyze your data
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={8}
              label="AI Instructions"
              placeholder="Example: Analyze financial data, detect anomalies, calculate trends, generate insights about revenue patterns..."
              value={templateBuilder.aiInstructions}
              onChange={(e) => setTemplateBuilder(prev => ({ ...prev, aiInstructions: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth>
              <InputLabel>Output Format</InputLabel>
              <Select
                value={templateBuilder.outputFormat}
                onChange={(e) => setTemplateBuilder(prev => ({ ...prev, outputFormat: e.target.value }))}
                label="Output Format"
              >
                <MenuItem value="enhanced_excel">Enhanced Excel with Insights</MenuItem>
                <MenuItem value="summary_report">Summary Report (PDF)</MenuItem>
                <MenuItem value="data_visualization">Data Visualization Dashboard</MenuItem>
                <MenuItem value="json_api">JSON API Response</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Step 4: Review & Save */}
        {templateBuilder.step === 4 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Step 5: Review & Save Template
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review your template configuration and save it
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Template Name"
                  placeholder="e.g., Financial Analysis Template"
                  value={templateBuilder.name}
                  onChange={(e) => setTemplateBuilder(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Template Description"
                  placeholder="Describe what this template does..."
                  value={templateBuilder.description}
                  onChange={(e) => setTemplateBuilder(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>
            </Grid>

            <Paper sx={{ p: 3, mt: 3, bgcolor: '#f9fafb', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Configuration Summary</Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Sheets to process:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {Object.values(templateBuilder.sheetConfig).filter(s => s.enabled).length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Business rules:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {templateBuilder.businessRules.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Output format:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {templateBuilder.outputFormat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            onClick={() => {
              if (templateBuilder.step === 0) {
                setView('list');
              } else {
                setTemplateBuilder(prev => ({ ...prev, step: prev.step - 1 }));
              }
            }}
          >
            {templateBuilder.step === 0 ? 'Cancel' : 'Back'}
          </Button>

          {templateBuilder.step < 4 ? (
            <Button
              variant="contained"
              onClick={() => setTemplateBuilder(prev => ({ ...prev, step: prev.step + 1 }))}
              disabled={templateBuilder.step === 0 && templateBuilder.files.length === 0}
              sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={saveTemplate}
              disabled={!templateBuilder.name}
              sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              Save Template
            </Button>
          )}
        </Stack>
      </Paper>
    </>
  );

  // File Detail View
  const renderFileDetailView = () => {
    const fileData = sampleFileData[selectedFileView];
    if (!fileData) return null;

    return (
      <Fade in timeout={300}>
        <Box sx={{
          background: 'linear-gradient(180deg, rgba(248, 250, 252, 1) 0%, rgba(255, 255, 255, 1) 50%)',
          minHeight: '100%',
          pb: 4
        }}>
          {/* Header with System Identity Badge (STOX.AI style) */}
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setSelectedFileView(null)}
              variant="outlined"
              size="small"
              sx={{ mb: 2, borderColor: 'divider' }}
            >
              Back to Summary
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {/* Colored bar (STOX.AI identity pattern) */}
              <Box sx={{
                width: 4,
                height: 60,
                background: 'linear-gradient(180deg, #64748b 0%, #475569 100%)',
                borderRadius: 2
              }} />
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#64748b' }}>
                    <TableChart sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px', color: '#64748b' }}>
                    {selectedFileView}
                  </Typography>
                  <Chip
                    label={`${fileData.rows.length} Sample Rows`}
                    size="small"
                    sx={{
                      bgcolor: alpha('#64748b', 0.1),
                      color: '#64748b',
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  Sample data showing file structure and content for end-to-end flow understanding
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Compact Info Cards */}
          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Zoom in timeout={200}>
                <Card sx={{
                  height: 80,
                  border: '1px solid',
                  borderColor: alpha('#64748b', 0.15),
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 16px ${alpha('#64748b', 0.1)}`,
                    borderColor: '#64748b',
                  }
                }}>
                  <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <DataObject sx={{ fontSize: 24, color: '#64748b', mb: 0.25 }} />
                    <Typography variant="h6" fontWeight={700} color="#64748b" sx={{ fontSize: '1.2rem' }}>
                      {fileData.rows.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Sample Rows
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Zoom in timeout={250}>
                <Card sx={{
                  height: 80,
                  border: '1px solid',
                  borderColor: alpha('#3b82f6', 0.15),
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 16px ${alpha('#3b82f6', 0.1)}`,
                    borderColor: '#3b82f6',
                  }
                }}>
                  <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <TableChart sx={{ fontSize: 24, color: '#3b82f6', mb: 0.25 }} />
                    <Typography variant="h6" fontWeight={700} color="#3b82f6" sx={{ fontSize: '1.2rem' }}>
                      {fileData.columns.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Total Columns
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Zoom in timeout={300}>
                <Card sx={{
                  height: 80,
                  border: '1px solid',
                  borderColor: alpha('#10b981', 0.15),
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 16px ${alpha('#10b981', 0.1)}`,
                    borderColor: '#10b981',
                  }
                }}>
                  <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Check sx={{ fontSize: 24, color: '#10b981', mb: 0.25 }} />
                    <Typography variant="h6" fontWeight={700} color="#10b981" sx={{ fontSize: '1.2rem' }}>
                      Active
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Processing Status
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>

          {/* Data Grid - Compact */}
          <Zoom in timeout={350}>
            <Card sx={{
              border: '1px solid',
              borderColor: alpha('#64748b', 0.15),
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <CardContent sx={{ p: 2 }}>
                {/* Header */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <Avatar sx={{ bgcolor: alpha('#64748b', 0.1), width: 28, height: 28 }}>
                      <Description sx={{ color: '#64748b', fontSize: 16 }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight={700} color="#64748b" sx={{ fontSize: '0.9rem' }}>
                      Sample Data Preview
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', pl: 4.5 }}>
                    {fileData.rows.length} example records
                  </Typography>
                </Box>

                {/* Data Grid */}
                <Box sx={{ height: 350, width: '100%' }}>
                  <DataGrid
                    rows={fileData.rows}
                    columns={fileData.columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                    density="compact"
                    sx={{
                      border: 'none',
                      fontSize: '0.7rem',
                      '& .MuiDataGrid-cell': {
                        borderColor: alpha('#64748b', 0.08),
                        py: 0.25,
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        bgcolor: alpha('#64748b', 0.05),
                        color: '#64748b',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        borderColor: alpha('#64748b', 0.1),
                        minHeight: '32px !important',
                        maxHeight: '32px !important',
                      },
                      '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 700,
                      },
                      '& .MuiDataGrid-row': {
                        minHeight: '32px !important',
                        maxHeight: '32px !important',
                        '&:hover': {
                          bgcolor: alpha('#64748b', 0.05),
                        },
                      },
                      '& .MuiDataGrid-footerContainer': {
                        borderColor: alpha('#64748b', 0.1),
                        bgcolor: alpha('#64748b', 0.02),
                        minHeight: '36px',
                      },
                      '& .MuiTablePagination-root': {
                        fontSize: '0.65rem',
                      },
                    }}
                  />
                </Box>

                {/* Info Banner (compact STOX.AI style) */}
                <Paper sx={{
                  p: 1.5,
                  mt: 2,
                  bgcolor: alpha('#3b82f6', 0.05),
                  border: '1px solid',
                  borderColor: alpha('#3b82f6', 0.1),
                  borderRadius: 1,
                  borderLeft: '3px solid #3b82f6'
                }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <AutoAwesome sx={{ fontSize: 16, color: '#3b82f6', mt: 0.1 }} />
                    <Box>
                      <Typography variant="caption" fontWeight={600} color="#3b82f6" sx={{ display: 'block', mb: 0.3, fontSize: '0.7rem' }}>
                        Processing Context
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.4 }}>
                        This sample data demonstrates the structure and format of the <strong>{selectedFileView}</strong> file.
                        During actual processing, the AI will analyze the full dataset and apply the configured business rules and transformations.
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </CardContent>
            </Card>
          </Zoom>

          {/* Info Section (STOX.AI style) */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
              <LightbulbIcon sx={{ color: 'warning.main', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Sample data provides end-to-end flow visibility and builds confidence in the AI processing pipeline
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Fade>
    );
  };

  // Template Execute View
  const renderTemplateExecute = () => {
    // Show file detail view if a file is selected
    if (selectedFileView) {
      return renderFileDetailView();
    }

    return (
    <>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => { setView('list'); setSelectedTemplate(null); setFiles([]); setProcessedResults(null); }}
          sx={{ mb: 2 }}
        >
          Back to Templates
        </Button>
        <Typography variant="h6" fontWeight={600} sx={{ mb: selectedTemplate?.description && selectedTemplate.description !== selectedTemplate.name ? 1 : 0 }}>
          {selectedTemplate?.name}
        </Typography>
        {selectedTemplate?.description && selectedTemplate.description !== selectedTemplate.name && (
          <Typography variant="body2" color="text.secondary">
            {selectedTemplate.description}
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Filter Configuration for Financial Analysis */}
          {selectedTemplate?.name.toLowerCase().includes('financial') && (
            <Fade in timeout={200}>
              <Paper sx={{
                p: 3,
                mb: 3,
                background: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(255, 255, 255, 1) 100%)',
                border: '1px solid',
                borderColor: alpha('#64748b', 0.1),
                borderRadius: 2,
              }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 3,
                  pb: 2,
                  borderBottom: '2px solid',
                  borderColor: alpha('#64748b', 0.1)
                }}>
                  <Avatar sx={{ bgcolor: alpha('#64748b', 0.1), width: 40, height: 40 }}>
                    <Settings sx={{ color: '#64748b', fontSize: 24 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700} color="#64748b">
                      Filter Configuration
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Configure date and invoice filters (optional - defaults applied if left blank)
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => setFilterConfig({
                      dateFilterType: 'specific',
                      specificDate: '2025-08-21',
                      weekStart: '',
                      weekEnd: '',
                      month: '',
                      year: '',
                      invoiceFrom: '',
                      invoiceTo: '43354',
                      amountMin: '0',
                    })}
                    sx={{
                      color: '#64748b',
                      fontSize: '0.75rem',
                      '&:hover': {
                        bgcolor: alpha('#64748b', 0.1)
                      }
                    }}
                  >
                    Reset to Defaults
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {/* Date Filter Section */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight={600} color="#3b82f6" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TableChart sx={{ fontSize: 18 }} />
                      Date Filter
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Filter Type</InputLabel>
                          <Select
                            value={filterConfig.dateFilterType}
                            label="Filter Type"
                            onChange={(e) => setFilterConfig(prev => ({ ...prev, dateFilterType: e.target.value }))}
                          >
                            <MenuItem value="specific">Specific Date</MenuItem>
                            <MenuItem value="week">Week Range</MenuItem>
                            <MenuItem value="month">Month</MenuItem>
                            <MenuItem value="year">Year</MenuItem>
                            <MenuItem value="none">No Date Filter</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      {filterConfig.dateFilterType === 'specific' && (
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Date (≤)"
                            type="date"
                            value={filterConfig.specificDate}
                            onChange={(e) => setFilterConfig(prev => ({ ...prev, specificDate: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            helperText="Default: 2025-08-21"
                          />
                        </Grid>
                      )}

                      {filterConfig.dateFilterType === 'week' && (
                        <>
                          <Grid item xs={12} sm={6} md={3}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Week Start"
                              type="date"
                              value={filterConfig.weekStart}
                              onChange={(e) => setFilterConfig(prev => ({ ...prev, weekStart: e.target.value }))}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Week End"
                              type="date"
                              value={filterConfig.weekEnd}
                              onChange={(e) => setFilterConfig(prev => ({ ...prev, weekEnd: e.target.value }))}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                        </>
                      )}

                      {filterConfig.dateFilterType === 'month' && (
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Month"
                            type="month"
                            value={filterConfig.month}
                            onChange={(e) => setFilterConfig(prev => ({ ...prev, month: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      )}

                      {filterConfig.dateFilterType === 'year' && (
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Year"
                            type="number"
                            value={filterConfig.year}
                            onChange={(e) => setFilterConfig(prev => ({ ...prev, year: e.target.value }))}
                            placeholder="2025"
                          />
                        </Grid>
                      )}
                    </Grid>
                  </Grid>

                  {/* Invoice Range Section */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight={600} color="#3b82f6" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Description sx={{ fontSize: 18 }} />
                      Invoice Range (Optional)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Invoice From"
                          type="number"
                          value={filterConfig.invoiceFrom}
                          onChange={(e) => setFilterConfig(prev => ({ ...prev, invoiceFrom: e.target.value }))}
                          placeholder="Leave blank for all"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Invoice To (≤)"
                          type="number"
                          value={filterConfig.invoiceTo}
                          onChange={(e) => setFilterConfig(prev => ({ ...prev, invoiceTo: e.target.value }))}
                          helperText="Default: 43354"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Min Amount (>)"
                          type="number"
                          value={filterConfig.amountMin}
                          onChange={(e) => setFilterConfig(prev => ({ ...prev, amountMin: e.target.value }))}
                          helperText="Default: 0"
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Active Filters Summary */}
                  <Grid item xs={12}>
                    <Paper sx={{
                      p: 1.5,
                      mt: 1,
                      bgcolor: alpha('#3b82f6', 0.05),
                      border: '1px solid',
                      borderColor: alpha('#3b82f6', 0.1),
                      borderRadius: 1,
                      borderLeft: '3px solid #3b82f6'
                    }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <AutoAwesome sx={{ fontSize: 16, color: '#3b82f6', mt: 0.1 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" fontWeight={600} color="#3b82f6" sx={{ display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                            Active Filters
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.6 }}>
                            {filterConfig.dateFilterType === 'specific' && filterConfig.specificDate && `Date ≤ ${filterConfig.specificDate}`}
                            {filterConfig.dateFilterType === 'week' && filterConfig.weekStart && filterConfig.weekEnd && ` | Week: ${filterConfig.weekStart} to ${filterConfig.weekEnd}`}
                            {filterConfig.dateFilterType === 'month' && filterConfig.month && ` | Month: ${filterConfig.month}`}
                            {filterConfig.dateFilterType === 'year' && filterConfig.year && ` | Year: ${filterConfig.year}`}
                            {filterConfig.dateFilterType === 'none' && 'No date filter'}
                            {filterConfig.invoiceFrom && ` | Invoice ≥ ${filterConfig.invoiceFrom}`}
                            {filterConfig.invoiceTo && ` | Invoice ≤ ${filterConfig.invoiceTo}`}
                            {filterConfig.amountMin && ` | Amount > ${filterConfig.amountMin}`}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Fade>
          )}

          {/* File Upload */}
          <Fade in timeout={300}>
            <Paper sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(255, 255, 255, 1) 100%)',
              border: '1px solid',
              borderColor: alpha('#3b82f6', 0.1),
              borderRadius: 2,
            }}>
              {/* Header with gradient background */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 3,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: alpha('#3b82f6', 0.1)
              }}>
                <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.1), width: 40, height: 40 }}>
                  <CloudUpload sx={{ color: '#3b82f6', fontSize: 24 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#3b82f6">
                    Upload Files to Process
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Upload your Excel files for AI-powered processing
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: '2px dashed',
                    borderColor: alpha('#3b82f6', 0.3),
                    borderRadius: 2,
                    p: 6,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: alpha('#3b82f6', 0.02),
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha('#3b82f6', 0.05),
                      borderColor: '#3b82f6',
                      transform: 'scale(1.01)',
                      '& .upload-icon': {
                        transform: 'scale(1.1) translateY(-4px)',
                      }
                    }
                  }}
                >
                  <TableChart
                    className="upload-icon"
                    sx={{
                      fontSize: 64,
                      color: alpha('#3b82f6', 0.4),
                      mb: 2,
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <Typography variant="body1" fontWeight={600} color="#3b82f6" sx={{ mb: 0.5 }}>
                    Drop Excel files here or click to browse
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports .xlsx, .xls, .csv • Multiple files allowed
                  </Typography>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <input
                    ref={folderInputRef}
                    type="file"
                    webkitdirectory=""
                    directory=""
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </Box>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      folderInputRef.current?.click();
                    }}
                    startIcon={<CloudUpload />}
                    sx={{ mr: 1 }}
                  >
                    Select Folder
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    startIcon={<CloudUpload />}
                  >
                    Select Files
                  </Button>
                </Box>
              </Box>

              {files.length > 0 && (
                <Stack spacing={1.5} sx={{ mt: 3 }}>
                  {files.map((file, index) => (
                    <Fade in timeout={300 + index * 50} key={file.id}>
                      <Paper
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          bgcolor: 'white',
                          border: '1px solid',
                          borderColor: alpha('#3b82f6', 0.1),
                          borderRadius: 1.5,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#3b82f6',
                            boxShadow: `0 4px 12px ${alpha('#3b82f6', 0.1)}`,
                            transform: 'translateX(4px)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.1), width: 36, height: 36 }}>
                            <Description sx={{ color: '#3b82f6', fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{file.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{file.size}</Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: alpha('#ef4444', 0.1)
                            }
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Paper>
                    </Fade>
                  ))}
                </Stack>
              )}
            </Paper>
          </Fade>

          {/* Template Configuration Display */}
          <Fade in timeout={400}>
            <Paper sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(255, 255, 255, 1) 100%)',
              border: '1px solid',
              borderColor: alpha('#64748b', 0.1),
              borderRadius: 2,
            }}>
              {/* Header */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 3,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: alpha('#64748b', 0.1)
              }}>
                <Avatar sx={{ bgcolor: alpha('#64748b', 0.1), width: 40, height: 40 }}>
                  <Settings sx={{ color: '#64748b', fontSize: 24 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#64748b">
                    Template Configuration
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Settings and rules for this processing template
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={3}>
                {/* Sheets Section */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <TableChart sx={{ fontSize: 18, color: '#3b82f6' }} />
                    <Typography variant="subtitle2" fontWeight={600} color="#3b82f6">
                      Sheets to Process
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {selectedTemplate?.sheets.map((sheet, index) => (
                      <Zoom in timeout={500 + index * 50} key={sheet.name}>
                        <Chip
                          label={sheet.name}
                          size="small"
                          sx={{
                            bgcolor: alpha('#3b82f6', 0.1),
                            color: '#3b82f6',
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: alpha('#3b82f6', 0.2),
                            '&:hover': {
                              bgcolor: alpha('#3b82f6', 0.2),
                              transform: 'scale(1.05)',
                            }
                          }}
                        />
                      </Zoom>
                    ))}
                  </Stack>
                </Box>

                {/* Business Rules Section */}
                {selectedTemplate?.businessRules.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Code sx={{ fontSize: 18, color: '#10b981' }} />
                      <Typography variant="subtitle2" fontWeight={600} color="#10b981">
                        Business Rules
                      </Typography>
                    </Box>
                    <Stack spacing={1.5}>
                      {selectedTemplate.businessRules.map((rule, i) => (
                        <Fade in timeout={600 + i * 100} key={i}>
                          <Box sx={{
                            display: 'flex',
                            gap: 1.5,
                            alignItems: 'flex-start',
                            p: 1.5,
                            bgcolor: alpha('#10b981', 0.05),
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: alpha('#10b981', 0.1)
                          }}>
                            <Check sx={{ fontSize: 18, color: '#10b981', mt: 0.2 }} />
                            <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>
                              {rule.name}
                            </Typography>
                          </Box>
                        </Fade>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* AI Instructions Section */}
                {selectedTemplate?.aiInstructions && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <AutoAwesome sx={{ fontSize: 18, color: '#64748b' }} />
                      <Typography variant="subtitle2" fontWeight={600} color="#64748b">
                        AI Instructions
                      </Typography>
                    </Box>
                    <Paper sx={{
                      p: 2,
                      bgcolor: alpha('#64748b', 0.05),
                      border: '1px solid',
                      borderColor: alpha('#64748b', 0.1),
                      borderRadius: 1.5
                    }}>
                      <Typography variant="body2" color="text.primary" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                        "{selectedTemplate.aiInstructions}"
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Fade>

          {/* Financial Analysis Summary Section */}
          {selectedTemplate?.name.toLowerCase().includes('financial') && (
            <Fade in timeout={500}>
              <Paper sx={{
                p: 3,
                mb: 3,
                background: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(255, 255, 255, 1) 100%)',
                border: '1px solid',
                borderColor: alpha('#64748b', 0.1),
                borderRadius: 2,
              }}>
                {/* Header */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 3,
                  pb: 2,
                  borderBottom: '2px solid',
                  borderColor: alpha('#64748b', 0.1)
                }}>
                  <Avatar sx={{ bgcolor: alpha('#64748b', 0.1), width: 40, height: 40 }}>
                    <DataObject sx={{ color: '#64748b', fontSize: 24 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="#64748b">
                      Financial Analysis Summary
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Methodology, data sources, and processing logic
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  {/* Methodology Section */}
                  <Accordion
                    defaultExpanded
                    sx={{
                      bgcolor: 'white',
                      '&:before': { display: 'none' },
                      boxShadow: 'none',
                      border: '1px solid',
                      borderColor: alpha('#3b82f6', 0.1),
                      borderRadius: '8px !important',
                      '&.Mui-expanded': {
                        margin: '0 !important',
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        '& .MuiAccordionSummary-content': {
                          my: 1.5,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.1), width: 32, height: 32 }}>
                          <Description sx={{ color: '#3b82f6', fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Analysis Methodology
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Paper sx={{ p: 2, bgcolor: alpha('#3b82f6', 0.03), border: '1px solid', borderColor: alpha('#3b82f6', 0.1) }}>
                        <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                          This template processes financial data using a <strong>hybrid approach</strong> that combines multiple data sources:
                        </Typography>
                        <Stack spacing={1.5}>
                          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                            <Check sx={{ fontSize: 18, color: '#10b981', mt: 0.2 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>Invoice Data Processing</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Primary source for transaction records, filtered by date (≤ 2025-08-21) and amount (&gt; 0)
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                            <Check sx={{ fontSize: 18, color: '#10b981', mt: 0.2 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>Distributor Mapping</Typography>
                              <Typography variant="caption" color="text.secondary">
                                4-priority fallback: CGS Primary → MSR Data → Fuzzy Matching → Name Extraction
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                            <Check sx={{ fontSize: 18, color: '#10b981', mt: 0.2 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>Historical Cost Tracking</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Cost data retrieved from Original CGS with item-level matching
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                            <Check sx={{ fontSize: 18, color: '#10b981', mt: 0.2 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>Financial Metrics Calculation</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Computes Total Sales, Total Cost, Gross Margin (GM), and GM% with Excel formulas
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </Paper>
                    </AccordionDetails>
                  </Accordion>

                  {/* Input Files Section */}
                  <Accordion
                    sx={{
                      bgcolor: 'white',
                      '&:before': { display: 'none' },
                      boxShadow: 'none',
                      border: '1px solid',
                      borderColor: alpha('#64748b', 0.1),
                      borderRadius: '8px !important',
                      '&.Mui-expanded': {
                        margin: '0 !important',
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        '& .MuiAccordionSummary-content': {
                          my: 1.5,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: alpha('#64748b', 0.1), width: 32, height: 32 }}>
                          <TableChart sx={{ color: '#64748b', fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Input Files & Sample Data
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Stack spacing={2}>
                        {(() => {
                          // Generate filter criteria text based on current config
                          let filterCriteria = [];
                          if (filterConfig.dateFilterType === 'specific' && filterConfig.specificDate) {
                            filterCriteria.push(`Date ≤ ${filterConfig.specificDate}`);
                          } else if (filterConfig.dateFilterType === 'week' && filterConfig.weekStart && filterConfig.weekEnd) {
                            filterCriteria.push(`Week: ${filterConfig.weekStart} to ${filterConfig.weekEnd}`);
                          } else if (filterConfig.dateFilterType === 'month' && filterConfig.month) {
                            filterCriteria.push(`Month: ${filterConfig.month}`);
                          } else if (filterConfig.dateFilterType === 'year' && filterConfig.year) {
                            filterCriteria.push(`Year: ${filterConfig.year}`);
                          }
                          if (filterConfig.amountMin) {
                            filterCriteria.push(`Amount > ${filterConfig.amountMin}`);
                          }
                          if (filterConfig.invoiceFrom) {
                            filterCriteria.push(`Invoice ≥ ${filterConfig.invoiceFrom}`);
                          }
                          if (filterConfig.invoiceTo) {
                            filterCriteria.push(`Invoice ≤ ${filterConfig.invoiceTo}`);
                          }
                          const filterText = filterCriteria.length > 0 ? `Filtered by ${filterCriteria.join(', ')}` : 'No filters applied';

                          return [
                            { name: 'Invoice Data', rows: '13,636', cols: 'Date, Amount, Facility, Item, Quantity', sample: filterText },
                            { name: 'Manufacturing Std Cost', rows: '5,230', cols: 'Item Code, Standard Cost, Category', sample: 'Provides baseline cost data for items' },
                            { name: 'Item Data File', rows: '12,450', cols: 'Item ID, Description, Category, UOM', sample: 'Master item catalog with descriptions' },
                            { name: 'MSR 2025 Data', rows: '5,230', cols: 'Hospital, Distributor, Territory, State', sample: 'Distributor mapping for facilities' },
                            { name: 'Original CGS', rows: '8,920', cols: 'Item, Distributor, Cost, Date', sample: 'Historical cost and distributor data' }
                          ];
                        })().map((file, index) => (
                          <Fade in timeout={600 + index * 100} key={file.name}>
                            <Paper
                              onClick={() => setSelectedFileView(file.name)}
                              sx={{
                                p: 2,
                                bgcolor: alpha('#64748b', 0.03),
                                border: '1px solid',
                                borderColor: alpha('#64748b', 0.1),
                                borderLeft: '3px solid #64748b',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: alpha('#64748b', 0.08),
                                  borderColor: '#64748b',
                                  transform: 'translateX(4px)',
                                  boxShadow: `0 4px 12px ${alpha('#64748b', 0.15)}`
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" fontWeight={600} color="#64748b">
                                    {file.name}
                                  </Typography>
                                  <ArrowForward sx={{ fontSize: 16, color: '#64748b' }} />
                                </Box>
                                <Chip
                                  label={`${file.rows} rows`}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha('#64748b', 0.1),
                                    color: '#64748b',
                                    fontWeight: 600,
                                    height: 20,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                <strong>Columns:</strong> {file.cols}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                <strong>Criteria:</strong> {file.sample}
                              </Typography>
                            </Paper>
                          </Fade>
                        ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>

                  {/* Processing Logic Section */}
                  <Accordion
                    sx={{
                      bgcolor: 'white',
                      '&:before': { display: 'none' },
                      boxShadow: 'none',
                      border: '1px solid',
                      borderColor: alpha('#64748b', 0.1),
                      borderRadius: '8px !important',
                      '&.Mui-expanded': {
                        margin: '0 !important',
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        '& .MuiAccordionSummary-content': {
                          my: 1.5,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: alpha('#64748b', 0.1), width: 32, height: 32 }}>
                          <Code sx={{ color: '#64748b', fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Processing Logic & Filters
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Paper sx={{ p: 2, bgcolor: alpha('#64748b', 0.03), border: '1px solid', borderColor: alpha('#64748b', 0.1) }}>
                        <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                          The processing pipeline applies the following transformations:
                        </Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} color="#8b5cf6" sx={{ mb: 1 }}>
                              1. Data Filtering
                            </Typography>
                            <Stack spacing={0.5} sx={{ pl: 2 }}>
                              <Typography variant="caption" color="text.secondary">• Date Filter: Transaction_Date ≤ 2025-08-21</Typography>
                              <Typography variant="caption" color="text.secondary">• Amount Filter: Transactional_Gross_Amt &gt; 0</Typography>
                              <Typography variant="caption" color="text.secondary">• Invoice Filter: Invoice ≤ 43354</Typography>
                              <Typography variant="caption" color="text.secondary">• Facility Exclusions: Removes test and duplicate facilities</Typography>
                            </Stack>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} color="#8b5cf6" sx={{ mb: 1 }}>
                              2. Distributor Mapping (4-Level Priority)
                            </Typography>
                            <Stack spacing={0.5} sx={{ pl: 2 }}>
                              <Typography variant="caption" color="text.secondary">• Priority 1: CGS Primary Match (Item + Facility)</Typography>
                              <Typography variant="caption" color="text.secondary">• Priority 2: MSR Data Match (Facility lookup)</Typography>
                              <Typography variant="caption" color="text.secondary">• Priority 3: Fuzzy Matching (85% similarity threshold)</Typography>
                              <Typography variant="caption" color="text.secondary">• Priority 4: Name Extraction (Pattern matching)</Typography>
                            </Stack>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} color="#8b5cf6" sx={{ mb: 1 }}>
                              3. Financial Calculations
                            </Typography>
                            <Stack spacing={0.5} sx={{ pl: 2 }}>
                              <Typography variant="caption" color="text.secondary">• Total Sales = SUM(Transactional_Gross_Amt)</Typography>
                              <Typography variant="caption" color="text.secondary">• Total Cost = Historical_Cost × Quantity</Typography>
                              <Typography variant="caption" color="text.secondary">• Gross Margin (GM) = Total Sales - Total Cost</Typography>
                              <Typography variant="caption" color="text.secondary">• GM% = (GM / Total Sales) × 100</Typography>
                            </Stack>
                          </Box>
                        </Stack>
                      </Paper>
                    </AccordionDetails>
                  </Accordion>
                </Stack>
              </Paper>
            </Fade>
          )}

          {/* Process Button */}
          <Button
            onClick={processWithTemplate}
            disabled={isProcessing}
            fullWidth
            variant="contained"
            size="large"
            startIcon={isProcessing ? <AutoAwesome /> : <PlayArrow />}
            sx={{
              py: 2,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                transform: 'scale(1.02)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                '& .MuiCircularProgress-root': {
                  color: 'white'
                }
              }
            }}
          >
            {isProcessing ? 'Processing with AI...' : 'Start AI Processing'}
          </Button>

          {/* Results */}
          {processedResults && (
            <Zoom in timeout={500}>
              <Paper sx={{
                p: 3,
                mt: 3,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
                border: '2px solid',
                borderColor: alpha('#10b981', 0.3),
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                }
              }}>
                {/* Success Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{
                    bgcolor: '#10b981',
                    width: 56,
                    height: 56,
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                    },
                  }}>
                    <Check sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="#10b981">Processing Complete!</Typography>
                    <Typography variant="body2" color="text.secondary">Your Excel file has been successfully processed</Typography>
                  </Box>
                </Box>

                {/* Stats Grid */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Zoom in timeout={600}>
                      <Paper sx={{
                        p: 2.5,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 1) 100%)',
                        border: '1px solid',
                        borderColor: alpha('#3b82f6', 0.2),
                        transition: 'all 0.3s ease',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
                      }}>
                        <Description sx={{ fontSize: 32, color: '#3b82f6', mb: 1 }} />
                        <Typography variant="h4" fontWeight={700} color="#3b82f6">{processedResults.filesProcessed}</Typography>
                        <Typography variant="caption" color="text.secondary">Files Processed</Typography>
                      </Paper>
                    </Zoom>
                  </Grid>
                  <Grid item xs={4}>
                    <Zoom in timeout={700}>
                      <Paper sx={{
                        p: 2.5,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(255, 255, 255, 1) 100%)',
                        border: '1px solid',
                        borderColor: alpha('#06b6d4', 0.2),
                        transition: 'all 0.3s ease',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
                      }}>
                        <TableChart sx={{ fontSize: 32, color: '#06b6d4', mb: 1 }} />
                        <Typography variant="h4" fontWeight={700} color="#06b6d4">{processedResults.sheetsProcessed}</Typography>
                        <Typography variant="caption" color="text.secondary">Sheets Analyzed</Typography>
                      </Paper>
                    </Zoom>
                  </Grid>
                  <Grid item xs={4}>
                    <Zoom in timeout={800}>
                      <Paper sx={{
                        p: 2.5,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(255, 255, 255, 1) 100%)',
                        border: '1px solid',
                        borderColor: alpha('#8b5cf6', 0.2),
                        transition: 'all 0.3s ease',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
                      }}>
                        <AutoAwesome sx={{ fontSize: 32, color: '#8b5cf6', mb: 1 }} />
                        <Typography variant="h4" fontWeight={700} color="#8b5cf6">{processedResults.insights.length}</Typography>
                        <Typography variant="caption" color="text.secondary">AI Insights</Typography>
                      </Paper>
                    </Zoom>
                  </Grid>
                </Grid>

                {/* Insights List */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'white', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Key Insights</Typography>
                  <Stack spacing={1.5}>
                    {processedResults.insights.map((insight, i) => (
                      <Fade in timeout={900 + i * 100} key={i}>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                          <AutoAwesome sx={{ fontSize: 18, color: '#10b981', mt: 0.5 }} />
                          <Typography variant="body2" sx={{ flex: 1 }}>{insight}</Typography>
                        </Box>
                      </Fade>
                    ))}
                  </Stack>
                </Paper>

                {/* Download Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Download />}
                  onClick={handleDownload}
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      transform: 'scale(1.02)',
                    }
                  }}
                >
                  Download Processed Output
                </Button>
              </Paper>
            </Zoom>
          )}
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          <Fade in timeout={500}>
            <Paper sx={{
              p: 2,
              mb: 3,
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
              border: '1px solid',
              borderColor: alpha('#8b5cf6', 0.1),
              borderRadius: 2,
            }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: alpha('#8b5cf6', 0.1)
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: alpha('#8b5cf6', 0.1), width: 36, height: 36 }}>
                    <Chat sx={{ color: '#8b5cf6', fontSize: 20 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={700} color="#8b5cf6">
                    AI Assistant
                  </Typography>
                </Box>
                {aiConversation.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={() => setAiConversation([])}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: alpha('#ef4444', 0.1),
                        color: 'error.main'
                      }
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                )}
              </Box>
            <Box sx={{ height: 300, overflow: 'auto', bgcolor: '#f9fafb', borderRadius: 1, p: 2, mb: 2 }}>
              {aiConversation.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  AI assistant ready to help...
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {aiConversation.map(msg => (
                    <Paper
                      key={msg.id}
                      sx={{
                        p: 1.5,
                        bgcolor: msg.role === 'user' ? '#3b82f6' : '#f3f4f6',
                        color: msg.role === 'user' ? 'white' : 'text.primary'
                      }}
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
              <TextField
                fullWidth
                placeholder="Ask AI..."
                size="small"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    addAIMessage('user', e.target.value);
                    e.target.value = '';
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    '&:hover': {
                      '& > fieldset': {
                        borderColor: '#8b5cf6',
                      }
                    }
                  }
                }}
              />
            </Paper>
          </Fade>

          <Fade in timeout={600}>
            <Paper sx={{
              p: 2,
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
              border: '1px solid',
              borderColor: alpha('#06b6d4', 0.1),
              borderRadius: 2,
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 2,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: alpha('#06b6d4', 0.1)
              }}>
                <Avatar sx={{ bgcolor: alpha('#06b6d4', 0.1), width: 36, height: 36 }}>
                  <AccountTree sx={{ color: '#06b6d4', fontSize: 20 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} color="#06b6d4">
                  Processing Pipeline
                </Typography>
              </Box>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {processingPipeline.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Speed sx={{ fontSize: 48, color: alpha('#06b6d4', 0.3), mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No activity yet
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {processingPipeline.map((entry, index) => (
                      <Fade in timeout={300 + index * 50} key={entry.id}>
                        <Paper sx={{
                          p: 1.5,
                          bgcolor: 'white',
                          border: '1px solid',
                          borderColor: alpha('#06b6d4', 0.1),
                          borderRadius: 1,
                          borderLeft: '3px solid',
                          borderLeftColor: entry.type === 'success' ? '#10b981' : entry.type === 'error' ? '#ef4444' : '#06b6d4',
                          '&:hover': {
                            boxShadow: 1
                          }
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Chip
                              label={entry.type}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                bgcolor: entry.type === 'success' ? alpha('#10b981', 0.1) : entry.type === 'error' ? alpha('#ef4444', 0.1) : alpha('#06b6d4', 0.1),
                                color: entry.type === 'success' ? '#10b981' : entry.type === 'error' ? '#ef4444' : '#06b6d4',
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">{entry.timestamp}</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{entry.message}</Typography>
                        </Paper>
                      </Fade>
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </>
    );
  };

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, rgba(219, 234, 254, 0.1) 0%, rgba(255, 255, 255, 1) 50%)'
    }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0, flexShrink: 0 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 2 }}>
          <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
            <Link
              onClick={onBack}
              sx={{
                cursor: 'pointer',
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Document Intelligence
            </Link>
            <Typography color="primary" fontWeight={600}>Excel AI Processor</Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Psychology sx={{ fontSize: 48, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" fontWeight={700}>Excel AI Processor</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create custom templates to process Excel files with AI
                </Typography>
              </Box>
            </Box>
            <Button
              startIcon={<ArrowBack />}
              onClick={onBack}
              variant="outlined"
              sx={{
                borderRadius: 2,
                '&:hover': {
                  transform: 'translateX(-2px)',
                  transition: 'transform 0.2s ease'
                }
              }}
            >
              Back
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {view === 'list' && renderTemplateList()}
          {view === 'create' && renderTemplateBuilder()}
          {view === 'execute' && renderTemplateExecute()}
        </Box>
      </Box>
    </Box>
  );
};

export default ExcelAIProcessor;
