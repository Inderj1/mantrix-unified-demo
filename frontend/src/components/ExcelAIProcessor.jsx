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
import {
  CloudUpload, Psychology, Refresh, ArrowBack, NavigateNext, ArrowForward,
  Close, TableChart, Download, Add, Edit, Delete, ExpandMore,
  Layers, DataObject, Chat, AccountTree, Speed, Settings,
  Description, Code, AutoAwesome, PlayArrow, Save, Check, Search,
} from '@mui/icons-material';
import excelProcessorApi from '../services/excelProcessorApi';

const ExcelAIProcessor = ({ onBack }) => {
  // Template management
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'create', 'edit', 'execute'
  const [searchQuery, setSearchQuery] = useState('');

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

  const fileInputRef = useRef(null);
  const templateFileRef = useRef(null);

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
                bgcolor: alpha('#f59e0b', 0.02),
                border: '2px dashed',
                borderColor: alpha('#f59e0b', 0.3),
                borderRadius: 2,
              }}>
                <Search sx={{ fontSize: 64, color: alpha('#f59e0b', 0.4), mb: 2 }} />
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
                    borderColor: alpha('#f59e0b', 0.3),
                    color: '#f59e0b',
                    '&:hover': {
                      borderColor: '#f59e0b',
                      bgcolor: alpha('#f59e0b', 0.05),
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
          // Rotate colors for visual variety
          const colors = [
            { main: '#3b82f6', gradient: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(255, 255, 255, 1) 100%)', alpha: alpha('#3b82f6', 0.1) },
            { main: '#8b5cf6', gradient: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)', bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.02) 0%, rgba(255, 255, 255, 1) 100%)', alpha: alpha('#8b5cf6', 0.1) },
            { main: '#06b6d4', gradient: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)', bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.02) 0%, rgba(255, 255, 255, 1) 100%)', alpha: alpha('#06b6d4', 0.1) },
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

  // Template Execute View
  const renderTemplateExecute = () => (
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
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.02) 0%, rgba(255, 255, 255, 1) 100%)',
              border: '1px solid',
              borderColor: alpha('#8b5cf6', 0.1),
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
                borderColor: alpha('#8b5cf6', 0.1)
              }}>
                <Avatar sx={{ bgcolor: alpha('#8b5cf6', 0.1), width: 40, height: 40 }}>
                  <Settings sx={{ color: '#8b5cf6', fontSize: 24 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#8b5cf6">
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
                    <TableChart sx={{ fontSize: 18, color: '#06b6d4' }} />
                    <Typography variant="subtitle2" fontWeight={600} color="#06b6d4">
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
                            bgcolor: alpha('#06b6d4', 0.1),
                            color: '#06b6d4',
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: alpha('#06b6d4', 0.2),
                            '&:hover': {
                              bgcolor: alpha('#06b6d4', 0.2),
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
                      <AutoAwesome sx={{ fontSize: 18, color: '#f97316' }} />
                      <Typography variant="subtitle2" fontWeight={600} color="#f97316">
                        AI Instructions
                      </Typography>
                    </Box>
                    <Paper sx={{
                      p: 2,
                      bgcolor: alpha('#f97316', 0.05),
                      border: '1px solid',
                      borderColor: alpha('#f97316', 0.1),
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
