import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Card, CardContent, Grid, Chip,
  TextField, Breadcrumbs, Link, Avatar, Stack, IconButton, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step,
  StepLabel, Divider, List, ListItem, ListItemText, ListItemIcon,
  Checkbox, FormControlLabel, Switch, MenuItem, Select, FormControl,
  InputLabel, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import {
  CloudUpload, Psychology, Refresh, ArrowBack, NavigateNext, ArrowForward,
  Close, TableChart, Download, Add, Edit, Delete, ExpandMore,
  Layers, DataObject, Chat, AccountTree, Speed, Settings,
  Description, Code, AutoAwesome, PlayArrow, Save, Check,
} from '@mui/icons-material';
import excelProcessorApi from '../services/excelProcessorApi';

const ExcelAIProcessor = ({ onBack }) => {
  // Template management
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'create', 'edit', 'execute'

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

  // Template List View
  const renderTemplateList = () => (
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
          sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
        >
          Create New Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#fafafa', border: '2px dashed', borderColor: 'divider' }}>
              <Layers sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
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
                sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              >
                Create Your First Template
              </Button>
            </Paper>
          </Grid>
        )}

        {templates.map(template => (
          <Grid item xs={12} md={6} key={template.id}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { borderColor: 'text.secondary', boxShadow: 2 },
              transition: 'all 0.3s ease'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flex: 1 }}>
                    <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }}>
                      <Layers />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {template.description}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip label={`${template.sheets.length} Sheets`} size="small" sx={{ fontSize: '0.7rem' }} />
                        <Chip label={`${template.businessRules.length} Rules`} size="small" sx={{ fontSize: '0.7rem' }} />
                      </Stack>
                    </Box>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => { setSelectedTemplate(template); setView('execute'); }}
                    sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                  >
                    Use Template
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => { setSelectedTemplate(template); setView('edit'); }}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => deleteTemplate(template.id)}
                    sx={{ border: '1px solid', borderColor: 'divider', color: 'error.main' }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );

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
        <Stepper activeStep={templateBuilder.step} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
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
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              <CloudUpload sx={{ color: 'text.secondary', mr: 1 }} />Upload Files to Process
            </Typography>
            <Box
              onClick={() => fileInputRef.current?.click()}
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
              <TableChart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" fontWeight={500}>Drop Excel files here or click to browse</Typography>
              <Typography variant="caption" color="text.secondary">Supports .xlsx, .xls, .csv</Typography>
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
              <Stack spacing={1} sx={{ mt: 3 }}>
                {files.map(file => (
                  <Box
                    key={file.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      bgcolor: '#f9fafb',
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TableChart sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{file.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{file.size}</Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Template Configuration Display */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#f9fafb', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              <Settings sx={{ color: 'text.secondary', mr: 1 }} />Template Configuration
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Sheets to Process:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {selectedTemplate?.sheets.map(sheet => (
                    <Chip key={sheet.name} label={sheet.name} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>

              {selectedTemplate?.businessRules.length > 0 && (
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Business Rules:</Typography>
                  <Stack spacing={1}>
                    {selectedTemplate.businessRules.map((rule, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <Check sx={{ fontSize: 16, color: 'success.main', mt: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">{rule.name}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {selectedTemplate?.aiInstructions && (
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>AI Instructions:</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    "{selectedTemplate.aiInstructions}"
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Process Button */}
          <Button
            onClick={processWithTemplate}
            disabled={isProcessing}
            fullWidth
            variant="contained"
            size="large"
            startIcon={isProcessing ? <AutoAwesome /> : <PlayArrow />}
            sx={{ py: 2, fontSize: '1.1rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            {isProcessing ? 'Processing with AI...' : 'Start AI Processing'}
          </Button>

          {/* Results */}
          {processedResults && (
            <Paper sx={{ p: 3, mt: 3, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)' }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Processing Complete!</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption">Files Processed</Typography>
                    <Typography variant="h4" fontWeight={700}>{processedResults.filesProcessed}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption">Sheets Analyzed</Typography>
                    <Typography variant="h4" fontWeight={700}>{processedResults.sheetsProcessed}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption">Insights</Typography>
                    <Typography variant="h4" fontWeight={700}>{processedResults.insights.length}</Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Stack spacing={1} sx={{ mb: 2 }}>
                {processedResults.insights.map((insight, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <AutoAwesome sx={{ fontSize: 16, color: '#10b981' }} />
                    <Typography variant="body2">{insight}</Typography>
                  </Box>
                ))}
              </Stack>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownload}
                sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
              >
                Download Processed Output
              </Button>
            </Paper>
          )}
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
                <Chat sx={{ color: 'text.secondary', mr: 1 }} />AI Assistant
              </Typography>
              {aiConversation.length > 0 && (
                <IconButton
                  size="small"
                  onClick={() => setAiConversation([])}
                  sx={{ color: 'text.secondary' }}
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
            />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              <AccountTree sx={{ color: 'text.secondary', mr: 1 }} />Processing Pipeline
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {processingPipeline.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  No activity yet
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {processingPipeline.map(entry => (
                    <Paper key={entry.id} sx={{ p: 1.5, bgcolor: '#f9fafb' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Chip label={entry.type} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                        <Typography variant="caption">{entry.timestamp}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{entry.message}</Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0, flexShrink: 0 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 2 }}>
          <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
            <Link
              onClick={onBack}
              sx={{ cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
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
            <Button startIcon={<ArrowBack />} onClick={onBack} variant="outlined">
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
