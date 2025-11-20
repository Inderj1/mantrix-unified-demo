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
} from '@mui/icons-material';
import DocumentIntelligence from './DocumentIntelligence';
import ExcelAIProcessor from './ExcelAIProcessor';
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

  // Landing page with 2 tiles
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0, flexShrink: 0 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 2 }}>
          {/* Title Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <img
                  src="/docintel.png"
                  alt="Document Intelligence"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Document Intelligence
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI-powered document analysis and Excel processing
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Grid container spacing={4}>
            {/* Tile 1: Document Analysis & Q&A */}
            <Grid item xs={12} md={6}>
              <Zoom in timeout={400}>
                <Card
                  sx={{
                    height: 280,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid',
                    borderColor: alpha('#8b5cf6', 0.2),
                    borderRadius: 2,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.02) 0%, rgba(255, 255, 255, 1) 100%)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                    },
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 32px rgba(139, 92, 246, 0.2)',
                      borderColor: '#8b5cf6',
                      '& .category-icon': {
                        transform: 'scale(1.1)',
                        bgcolor: '#8b5cf6',
                        color: 'white',
                      },
                      '& .access-button': {
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: 'white',
                        transform: 'translateX(4px)',
                      },
                    },
                  }}
                  onClick={() => setSelectedView('document-analysis')}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Icon and Badge */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                      <Avatar
                        className="category-icon"
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: alpha('#8b5cf6', 0.1),
                          color: '#8b5cf6',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <DescriptionIcon sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Chip
                        label={loading ? '...' : `${documentCount} Documents`}
                        size="small"
                        sx={{
                          bgcolor: alpha('#8b5cf6', 0.1),
                          color: '#8b5cf6',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 26,
                        }}
                      />
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#8b5cf6',
                        mb: 1.5,
                        fontSize: '1.15rem',
                        letterSpacing: '-0.3px'
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
                        lineHeight: 1.6,
                        fontSize: '0.9rem'
                      }}
                    >
                      AI-powered document understanding and Q&A across PDFs, Word, Excel, images, and more.
                      Upload documents, ask questions, compare files, and get instant AI-generated insights.
                    </Typography>

                    {/* Footer */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        mt: 2.5,
                        pt: 2.5,
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
                          px: 2,
                          py: 0.75,
                          borderRadius: 1.5,
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        ENTER
                        <ArrowForwardIcon sx={{ fontSize: 16 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            {/* Tile 2: Excel AI Processor */}
            <Grid item xs={12} md={6}>
              <Zoom in timeout={500}>
                <Card
                  sx={{
                    height: 280,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid',
                    borderColor: alpha('#3b82f6', 0.2),
                    borderRadius: 2,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(255, 255, 255, 1) 100%)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                    },
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 32px rgba(59, 130, 246, 0.2)',
                      borderColor: '#3b82f6',
                      '& .category-icon': {
                        transform: 'scale(1.1)',
                        bgcolor: '#3b82f6',
                        color: 'white',
                      },
                      '& .access-button': {
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        transform: 'translateX(4px)',
                      },
                    },
                  }}
                  onClick={() => setSelectedView('excel-processor')}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Icon and Badge */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                      <Avatar
                        className="category-icon"
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: alpha('#3b82f6', 0.1),
                          color: '#3b82f6',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <TableChartIcon sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Chip
                        label="3 Templates"
                        size="small"
                        sx={{
                          bgcolor: alpha('#3b82f6', 0.1),
                          color: '#3b82f6',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 26,
                        }}
                      />
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#3b82f6',
                        mb: 1.5,
                        fontSize: '1.15rem',
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
                        fontSize: '0.9rem'
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
                        mt: 2.5,
                        pt: 2.5,
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
                          px: 2,
                          py: 0.75,
                          borderRadius: 1.5,
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        ENTER
                        <ArrowForwardIcon sx={{ fontSize: 16 }} />
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
