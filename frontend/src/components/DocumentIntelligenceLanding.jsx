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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src="/docintel.png"
                  alt="Document Intelligence"
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
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
            <Grid item xs={12} md={4}>
              <Zoom in timeout={400}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'white',
                    border: `2px solid ${alpha('#8b5cf6', 0.1)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 24px ${alpha('#8b5cf6', 0.25)}`,
                      borderColor: alpha('#8b5cf6', 0.3),
                      '& .action-icon': {
                        transform: 'translateX(4px)',
                      },
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    },
                  }}
                  onClick={() => setSelectedView('document-analysis')}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Icon and Badge */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Avatar
                        className="category-icon"
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: alpha('#8b5cf6', 0.1),
                          color: '#8b5cf6',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <DescriptionIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Chip
                        label={loading ? '...' : `${documentCount} Docs`}
                        size="small"
                        sx={{
                          bgcolor: alpha('#8b5cf6', 0.1),
                          color: '#8b5cf6',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22,
                        }}
                      />
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#8b5cf6',
                        mb: 1,
                        fontSize: '0.938rem',
                      }}
                    >
                      Document Analysis & Q&A
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mb: 'auto',
                        lineHeight: 1.5,
                        fontSize: '0.813rem'
                      }}
                    >
                      AI-powered document understanding and Q&A across PDFs, Word, Excel, images, and more.
                    </Typography>

                    {/* Footer */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: alpha('#8b5cf6', 0.1)
                      }}
                    >
                      <Box
                        className="access-button"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: alpha('#8b5cf6', 0.1),
                          color: '#8b5cf6',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        ENTER
                        <ArrowForwardIcon sx={{ fontSize: 14 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            {/* Tile 2: Excel AI Processor */}
            <Grid item xs={12} md={4}>
              <Zoom in timeout={500}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'white',
                    border: `2px solid ${alpha('#3b82f6', 0.1)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 24px ${alpha('#3b82f6', 0.25)}`,
                      borderColor: alpha('#3b82f6', 0.3),
                      '& .action-icon': {
                        transform: 'translateX(4px)',
                      },
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    },
                  }}
                  onClick={() => setSelectedView('excel-processor')}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Icon and Badge */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Avatar
                        className="category-icon"
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: alpha('#3b82f6', 0.1),
                          color: '#3b82f6',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <TableChartIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Chip
                        label="3 Templates"
                        size="small"
                        sx={{
                          bgcolor: alpha('#3b82f6', 0.1),
                          color: '#3b82f6',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22,
                        }}
                      />
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#3b82f6',
                        mb: 1,
                        fontSize: '0.938rem',
                        letterSpacing: '-0.3px'
                      }}
                    >
                      Excel AI Processor
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mb: 'auto',
                        lineHeight: 1.6,
                        fontSize: '0.813rem'
                      }}
                    >
                      Intelligent Excel processing with multi-agent AI workflows. Upload spreadsheets, apply
                      AI-powered templates, validate data quality, and generate comprehensive analytics with Claude AI.
                    </Typography>

                    {/* Footer */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: alpha('#3b82f6', 0.1)
                      }}
                    >
                      <Box
                        className="access-button"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: alpha('#3b82f6', 0.1),
                          color: '#3b82f6',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        ENTER
                        <ArrowForwardIcon sx={{ fontSize: 14 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            {/* Tile 3: PDF Parser Studio */}
            <Grid item xs={12} md={4}>
              <Zoom in timeout={600}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'white',
                    border: `2px solid ${alpha('#10b981', 0.1)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 24px ${alpha('#10b981', 0.25)}`,
                      borderColor: alpha('#10b981', 0.3),
                      '& .action-icon': {
                        transform: 'translateX(4px)',
                      },
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    },
                  }}
                  onClick={() => setSelectedView('pdf-parser')}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Icon and Badge */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Avatar
                        className="category-icon"
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: alpha('#10b981', 0.1),
                          color: '#10b981',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <PictureAsPdfIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Chip
                        label="3 Templates"
                        size="small"
                        sx={{
                          bgcolor: alpha('#10b981', 0.1),
                          color: '#10b981',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22,
                        }}
                      />
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#10b981',
                        mb: 1,
                        fontSize: '0.938rem',
                        letterSpacing: '-0.3px'
                      }}
                    >
                      PDF Parser Studio
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mb: 'auto',
                        lineHeight: 1.6,
                        fontSize: '0.813rem'
                      }}
                    >
                      Enterprise-grade PDF data extraction pipeline with customizable templates, AI-powered field
                      recognition, schema validation, and automated CSV transformation workflows.
                    </Typography>

                    {/* Footer */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: alpha('#10b981', 0.1)
                      }}
                    >
                      <Box
                        className="access-button"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: alpha('#10b981', 0.1),
                          color: '#10b981',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        ENTER
                        <ArrowForwardIcon sx={{ fontSize: 14 }} />
                      </Box>
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
