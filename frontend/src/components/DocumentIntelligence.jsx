import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  TextField,
  Snackbar,
  ToggleButton,
  Badge,
  Drawer,
  useTheme,
  useMediaQuery,
  Avatar,
  alpha,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Analytics as AnalyticsIcon,
  Summarize as SummarizeIcon,
  CleaningServices as CleanIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  PictureAsPdf as PdfIcon,
  Article as ArticleIcon,
  TableChart as TableIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Refresh as RefreshIcon,
  Compare as CompareIcon,
  DataObject as DataIcon,
  Send as SendIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

// Dark mode color helper
const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const DocumentIntelligence = ({ onBack, darkMode = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const colors = getColors(darkMode);
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [question, setQuestion] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [questionAnswer, setQuestionAnswer] = useState(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const response = await apiService.listDocuments();
      setUploadedFiles(response.data.documents);
    } catch (error) {
      console.error('Failed to load documents:', error);
      showSnackbar('Failed to load documents', 'error');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // File type icons
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <PdfIcon />;
      case 'doc':
      case 'docx':
        return <ArticleIcon />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <TableIcon />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <ImageIcon />;
      default:
        return <FileIcon />;
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files) => {
    for (const file of Array.from(files)) {
      try {
        setLoading(true);
        const response = await apiService.uploadDocument(file);
        // Format the document for display
        const uploadedDoc = {
          ...response.data,
          size: response.data.size_bytes ? `${(response.data.size_bytes / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
          uploadDate: response.data.upload_timestamp ? new Date(response.data.upload_timestamp).toLocaleString() : new Date().toLocaleString(),
        };
        setUploadedFiles(prev => [...prev, uploadedDoc]);
        showSnackbar(`Uploaded ${file.name} successfully`, 'success');
      } catch (error) {
        console.error('Upload failed:', error);
        showSnackbar(`Failed to upload ${file.name}: ${error.response?.data?.detail || error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = async (documentId) => {
    try {
      await apiService.deleteDocument(documentId);
      setUploadedFiles(uploadedFiles.filter(file => file.document_id !== documentId));
      if (selectedFile?.document_id === documentId) {
        setSelectedFile(null);
        setAnalysis(null);
      }
      showSnackbar('Document deleted successfully', 'success');
    } catch (error) {
      console.error('Delete failed:', error);
      showSnackbar('Failed to delete document', 'error');
    }
  };

  const analyzeDocument = async (analysisType = 'comprehensive') => {
    if (!selectedFile) return;
    
    setLoading(true);
    setAnalysis(null);
    
    try {
      const response = await apiService.analyzeDocument(selectedFile.document_id, analysisType);
      const result = response.data;
      
      setAnalysis({
        summary: result.summary || result.response || 'No summary available',
        keyPoints: result.key_points || [],
        dataQuality: result.data_quality || {
          completeness: 0,
          accuracy: 0,
          consistency: 0
        },
        suggestions: result.suggestions || [],
        rawResponse: result
      });
      
      showSnackbar('Document analyzed successfully', 'success');
    } catch (error) {
      console.error('Analysis failed:', error);
      showSnackbar('Failed to analyze document', 'error');
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if ((!selectedFile && selectedDocuments.length === 0) || !question.trim()) return;
    
    setLoading(true);
    
    try {
      const documentsToQuery = comparisonMode && selectedDocuments.length > 0
        ? selectedDocuments.map(d => d.document_id)
        : [selectedFile.document_id];
      
      const response = await apiService.askDocumentQuestion(
        documentsToQuery,
        question
      );
      
      setQuestionAnswer(response.data);
      showSnackbar('Question answered successfully', 'success');
    } catch (error) {
      console.error('Question failed:', error);
      showSnackbar('Failed to answer question', 'error');
    } finally {
      setLoading(false);
    }
  };

  const extractDataFromDocument = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    
    try {
      const response = await apiService.analyzeDocument(selectedFile.document_id, 'extract_data');
      setExtractedData(response.data);
      showSnackbar('Data extracted successfully', 'success');
    } catch (error) {
      console.error('Data extraction failed:', error);
      showSnackbar('Failed to extract data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelection = (doc) => {
    if (comparisonMode) {
      const isSelected = selectedDocuments.find(d => d.document_id === doc.document_id);
      if (isSelected) {
        setSelectedDocuments(selectedDocuments.filter(d => d.document_id !== doc.document_id));
      } else {
        setSelectedDocuments([...selectedDocuments, doc]);
      }
    } else {
      setSelectedFile(doc);
      setAnalysis(null);
      setQuestionAnswer(null);
      setExtractedData(null);
    }
  };

  const compareDocuments = async () => {
    if (selectedDocuments.length < 2) {
      showSnackbar('Please select at least 2 documents to compare', 'warning');
      return;
    }
    
    setLoading(true);
    
    try {
      const docIds = selectedDocuments.map(d => d.document_id);
      const response = await apiService.askDocumentQuestion(
        docIds,
        "Compare these documents and highlight the key differences and similarities"
      );
      
      setQuestionAnswer(response.data);
      showSnackbar('Documents compared successfully', 'success');
    } catch (error) {
      console.error('Comparison failed:', error);
      showSnackbar('Failed to compare documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const drawerWidth = 320;

  const DocumentsList = () => (
    <Box sx={{ p: 2, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: colors.paper }}>
      {/* Upload Section */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            p: 3,
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : colors.border,
            bgcolor: dragActive ? (darkMode ? alpha('#fff', 0.05) : 'action.hover') : colors.cardBg,
            cursor: 'pointer',
            transition: 'all 0.3s',
            textAlign: 'center',
            borderRadius: 1,
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            multiple
            onChange={handleFileInput}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
          />
          <UploadIcon sx={{ fontSize: 32, color: colors.textSecondary, mb: 1 }} />
          <Typography variant="body2" sx={{ color: colors.text }}>
            Drop files or click to upload
          </Typography>
        </Box>
      </Box>

      {/* Document List Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: colors.text }}>
          Documents ({uploadedFiles.length})
        </Typography>
        <Stack direction="row" spacing={1}>
          <ToggleButton
            value="compare"
            selected={comparisonMode}
            onChange={() => {
              setComparisonMode(!comparisonMode);
              setSelectedDocuments([]);
            }}
            size="small"
          >
            <CompareIcon fontSize="small" />
          </ToggleButton>
          <IconButton size="small" onClick={loadDocuments}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Box>

      {comparisonMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Select multiple documents to compare
          {selectedDocuments.length >= 2 && (
            <Button
              size="small"
              sx={{ ml: 2 }}
              onClick={compareDocuments}
            >
              Compare ({selectedDocuments.length})
            </Button>
          )}
        </Alert>
      )}

      {/* Document List - Scrollable */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List dense>
          {uploadedFiles.map((file, index) => (
            <React.Fragment key={file.document_id || file.id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: darkMode ? alpha('#fff', 0.05) : 'action.hover',
                  },
                  backgroundColor: comparisonMode
                    ? selectedDocuments.some(d => d.document_id === file.document_id) ? (darkMode ? alpha('#fff', 0.1) : 'action.selected') : 'inherit'
                    : selectedFile?.document_id === file.document_id ? (darkMode ? alpha('#fff', 0.1) : 'action.selected') : 'inherit'
                }}
                onClick={() => handleDocumentSelection(file)}
              >
                <ListItemIcon>
                  {comparisonMode && (
                    <Badge
                      badgeContent={selectedDocuments.findIndex(d => d.document_id === file.document_id) + 1}
                      color="primary"
                      invisible={!selectedDocuments.some(d => d.document_id === file.document_id)}
                    >
                      {getFileIcon(file.filename || file.name)}
                    </Badge>
                  )}
                  {!comparisonMode && getFileIcon(file.filename || file.name)}
                </ListItemIcon>
                <ListItemText
                  primary={file.filename || file.name}
                  secondary={file.size}
                  primaryTypographyProps={{
                    noWrap: true,
                    fontSize: '0.875rem'
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.document_id || file.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
          {uploadedFiles.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No documents uploaded"
                secondary="Upload documents to get started"
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: colors.background }}>
      {/* Header */}
      <Paper sx={{ p: 2, zIndex: 1, borderRadius: 0, bgcolor: colors.paper, borderBottom: `1px solid ${colors.border}` }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 2 }}>
          {/* Breadcrumbs */}
          {onBack && (
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
              <Link
                onClick={onBack}
                sx={{
                  cursor: 'pointer',
                  color: colors.textSecondary,
                  textDecoration: 'none',
                  '&:hover': { color: colors.primary },
                }}
              >
                Document Intelligence
              </Link>
              <Typography color="primary" fontWeight={600} sx={{ color: colors.primary }}>
                Document Analysis & Q&A
              </Typography>
            </Breadcrumbs>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{ display: { xs: 'inline-flex', md: 'inline-flex' } }}
              >
                <MenuIcon />
              </IconButton>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: alpha('#7c3aed', 0.1),
                }}
              >
                <ArticleIcon sx={{ fontSize: 32, color: '#7c3aed' }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
                  Document Analysis & Q&A
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Upload, analyze, and extract insights from your documents using AI
                </Typography>
              </Box>
            </Box>

            {/* Back Button */}
            {onBack && (
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Back
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar - Collapsible */}
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{
            width: sidebarOpen ? drawerWidth : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              position: 'relative',
              height: '100%',
              borderRight: '1px solid',
              borderColor: colors.border,
              bgcolor: colors.paper,
            },
          }}
        >
          <DocumentsList />
        </Drawer>

        {/* Right Column - Analysis & Q&A */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 3 }}>
          <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
            <Stack spacing={3}>
              {/* Quick Actions */}
              {selectedFile && !comparisonMode && (
                <Paper sx={{ p: 2, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ color: colors.text }}>
                    Quick Actions for: <strong>{selectedFile.filename}</strong>
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AnalyticsIcon />}
                      onClick={() => analyzeDocument('comprehensive')}
                      disabled={loading}
                    >
                      Analyze
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<SummarizeIcon />}
                      onClick={() => analyzeDocument('summary')}
                      disabled={loading}
                    >
                      Summarize
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<CleanIcon />}
                      onClick={() => analyzeDocument('quality')}
                      disabled={loading}
                    >
                      Check Quality
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DataIcon />}
                      onClick={extractDataFromDocument}
                      disabled={loading}
                    >
                      Extract Data
                    </Button>
                  </Stack>
                </Paper>
              )}

              {/* Loading State */}
              {loading && (
                <Paper sx={{ p: 3, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
                  <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
                    Processing...
                  </Typography>
                  <LinearProgress />
                </Paper>
              )}

              {/* Analysis Results */}
              {analysis && !loading && (
                <Card sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: colors.text }}>Analysis Results</Typography>
                      <IconButton size="small" onClick={() => setAnalysis(null)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary }}>
                        Summary
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap', color: colors.text }}>
                        {analysis.summary}
                      </Typography>
                    </Box>

                    {analysis.keyPoints.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary }}>
                          Key Points
                        </Typography>
                        <List dense>
                          {analysis.keyPoints.map((point, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={point} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    {/* Data Quality Metrics */}
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            Completeness
                          </Typography>
                          <Typography variant="h6" sx={{ color: colors.text }}>
                            {analysis.dataQuality.completeness}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            Accuracy
                          </Typography>
                          <Typography variant="h6" sx={{ color: colors.text }}>
                            {analysis.dataQuality.accuracy}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            Consistency
                          </Typography>
                          <Typography variant="h6" sx={{ color: colors.text }}>
                            {analysis.dataQuality.consistency}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Extracted Data */}
              {extractedData && !loading && (
                <Card sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: colors.text }}>Extracted Data</Typography>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `extracted_data.json`;
                            a.click();
                          }}
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => setExtractedData(null)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Box>
                    <Box sx={{
                      bgcolor: darkMode ? alpha('#000', 0.2) : 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      maxHeight: 300,
                      overflow: 'auto'
                    }}>
                      <pre style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: darkMode ? colors.text : 'inherit' }}>
                        {JSON.stringify(extractedData, null, 2)}
                      </pre>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Q&A Section */}
              <Card sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
                    Ask Questions
                  </Typography>

                  {(selectedFile || selectedDocuments.length > 0) && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Asking about: {
                          comparisonMode && selectedDocuments.length > 0
                            ? `${selectedDocuments.length} documents`
                            : selectedFile?.filename
                        }
                      </Typography>
                    </Box>
                  )}

                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Ask any question about your documents..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          e.preventDefault();
                          askQuestion();
                        }
                      }}
                      disabled={!selectedFile && selectedDocuments.length === 0}
                    />
                    
                    {/* Suggested Questions */}
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label="Main findings?"
                        size="small"
                        onClick={() => setQuestion("What are the main findings in this document?")}
                        disabled={!selectedFile && selectedDocuments.length === 0}
                      />
                      <Chip
                        label="Key metrics?"
                        size="small"
                        onClick={() => setQuestion("What are the key metrics or numbers?")}
                        disabled={!selectedFile && selectedDocuments.length === 0}
                      />
                      <Chip
                        label="Trends?"
                        size="small"
                        onClick={() => setQuestion("What trends can you identify?")}
                        disabled={!selectedFile && selectedDocuments.length === 0}
                      />
                      {comparisonMode && selectedDocuments.length >= 2 && (
                        <Chip
                          label="Compare"
                          size="small"
                          color="primary"
                          onClick={() => setQuestion("Compare these documents and highlight differences")}
                        />
                      )}
                    </Stack>

                    <Button
                      variant="contained"
                      endIcon={<SendIcon />}
                      onClick={askQuestion}
                      disabled={(!selectedFile && selectedDocuments.length === 0) || !question || loading}
                    >
                      Ask Question
                    </Button>
                  </Stack>

                  {/* Answer Display */}
                  {questionAnswer && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2, borderColor: colors.border }} />
                      <Typography variant="subtitle2" gutterBottom sx={{ color: colors.primary }}>
                        Answer
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: colors.text }}>
                        {questionAnswer.answer}
                      </Typography>
                      {questionAnswer.confidence && (
                        <Chip
                          label={`Confidence: ${(questionAnswer.confidence * 100).toFixed(0)}%`}
                          size="small"
                          color={questionAnswer.confidence > 0.8 ? 'success' : 'warning'}
                          sx={{ mb: 2 }}
                        />
                      )}
                      {questionAnswer.follow_up_questions && questionAnswer.follow_up_questions.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ color: colors.textSecondary }} gutterBottom>
                            Follow-up questions:
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {questionAnswer.follow_up_questions.map((q, index) => (
                              <Chip
                                key={index}
                                label={q}
                                size="small"
                                variant="outlined"
                                onClick={() => setQuestion(q)}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentIntelligence;