import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Breadcrumbs,
  Link,
  Button,
  alpha,
  Zoom,
  Paper,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Hub as HubIcon,
} from '@mui/icons-material';
import DocumentIntelligence from './DocumentIntelligence';
import ExcelAIProcessor from './ExcelAIProcessor';
import PDFParserStudio from './PDFParserStudio';
import { apiService } from '../services/api';

const DocumentIntelligenceLanding = ({ onBack }) => {
  const [selectedView, setSelectedView] = useState(null);
  const [documentCount, setDocumentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocumentStats();
  }, []);

  const loadDocumentStats = async () => {
    try {
      const response = await apiService.listDocuments();
      setDocumentCount(response.data.total_count || 0);
    } catch (error) {
      console.error('Failed to load document stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle drill-in to detail views
  if (selectedView === 'document-analysis') {
    return <DocumentIntelligence onBack={() => setSelectedView(null)} />;
  }

  if (selectedView === 'excel-processor') {
    return <ExcelAIProcessor onBack={() => setSelectedView(null)} />;
  }

  if (selectedView === 'pdf-parser') {
    return <PDFParserStudio onBack={() => setSelectedView(null)} />;
  }

  // Landing page with 3 tiles
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0, flexShrink: 0 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 2 }}>
          {/* Title Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HubIcon sx={{ fontSize: 40, color: '#0078d4' }} />
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    Document Intelligence
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.813rem">
                    AI-powered document analysis, Excel processing, and PDF extraction
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Grid container spacing={2}>
            {/* Tile 1: Document Analysis & Q&A */}
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <Zoom in timeout={400}>
                <Card
                  variant="outlined"
                  sx={{
                    height: 200,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid',
                    borderColor: alpha('#106ebe', 0.15),
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: 'linear-gradient(135deg, #106ebe 0%, #2b88d8 100%)',
                      opacity: 0.8,
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha('#106ebe', 0.15)}`,
                      borderColor: '#106ebe',
                      '& .module-icon': {
                        transform: 'scale(1.15)',
                        bgcolor: '#106ebe',
                        color: 'white',
                      },
                      '& .module-arrow': {
                        opacity: 1,
                        transform: 'translateX(4px)',
                      },
                    },
                  }}
                  onClick={() => setSelectedView('document-analysis')}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <DescriptionIcon sx={{ fontSize: 40, color: '#106ebe' }} />
                      <Chip
                        label={loading ? '...' : `${documentCount} Docs`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.65rem',
                          bgcolor: alpha('#106ebe', 0.08),
                          color: '#106ebe',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#106ebe', mb: 0.5, fontSize: '0.9rem', lineHeight: 1.3 }}>
                      Document Analysis & Q&A
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      AI-powered document understanding and Q&A across PDFs, Word, Excel, images, and more.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha('#106ebe', 0.1) }}>
                      <Chip label="AI Q&A" size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha('#106ebe', 0.08), color: '#106ebe', fontWeight: 600 }} />
                      <ArrowForwardIcon className="module-arrow" sx={{ color: '#106ebe', fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            {/* Tile 2: Excel AI Processor */}
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <Zoom in timeout={500}>
                <Card
                  variant="outlined"
                  sx={{
                    height: 200,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid',
                    borderColor: alpha('#2b88d8', 0.15),
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: 'linear-gradient(135deg, #2b88d8 0%, #106ebe 100%)',
                      opacity: 0.8,
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha('#2b88d8', 0.15)}`,
                      borderColor: '#2b88d8',
                      '& .module-icon': {
                        transform: 'scale(1.15)',
                        bgcolor: '#2b88d8',
                        color: 'white',
                      },
                      '& .module-arrow': {
                        opacity: 1,
                        transform: 'translateX(4px)',
                      },
                    },
                  }}
                  onClick={() => setSelectedView('excel-processor')}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <TableChartIcon sx={{ fontSize: 40, color: '#2b88d8' }} />
                      <Chip
                        label="3 Templates"
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.65rem',
                          bgcolor: alpha('#2b88d8', 0.08),
                          color: '#2b88d8',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#2b88d8', mb: 0.5, fontSize: '0.9rem', lineHeight: 1.3 }}>
                      Excel AI Processor
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      Intelligent Excel processing with multi-agent AI workflows, templates, and analytics.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha('#2b88d8', 0.1) }}>
                      <Chip label="AI Workflows" size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha('#2b88d8', 0.08), color: '#2b88d8', fontWeight: 600 }} />
                      <ArrowForwardIcon className="module-arrow" sx={{ color: '#2b88d8', fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            {/* Tile 3: PDF Parser Studio */}
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <Zoom in timeout={600}>
                <Card
                  variant="outlined"
                  sx={{
                    height: 200,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid',
                    borderColor: alpha('#0078d4', 0.15),
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: 'linear-gradient(135deg, #0078d4 0%, #2b88d8 100%)',
                      opacity: 0.8,
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha('#0078d4', 0.15)}`,
                      borderColor: '#0078d4',
                      '& .module-icon': {
                        transform: 'scale(1.15)',
                        bgcolor: '#0078d4',
                        color: 'white',
                      },
                      '& .module-arrow': {
                        opacity: 1,
                        transform: 'translateX(4px)',
                      },
                    },
                  }}
                  onClick={() => setSelectedView('pdf-parser')}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <PictureAsPdfIcon sx={{ fontSize: 40, color: '#0078d4' }} />
                      <Chip
                        label="3 Templates"
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.65rem',
                          bgcolor: alpha('#0078d4', 0.08),
                          color: '#0078d4',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#0078d4', mb: 0.5, fontSize: '0.9rem', lineHeight: 1.3 }}>
                      PDF Parser Studio
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      Enterprise-grade PDF extraction with AI-powered field recognition and CSV workflows.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha('#0078d4', 0.1) }}>
                      <Chip label="Extraction" size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha('#0078d4', 0.08), color: '#0078d4', fontWeight: 600 }} />
                      <ArrowForwardIcon className="module-arrow" sx={{ color: '#0078d4', fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentIntelligenceLanding;
