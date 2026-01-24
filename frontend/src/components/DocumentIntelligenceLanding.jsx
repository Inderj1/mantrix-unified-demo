import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  alpha,
  Zoom,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Hub as HubIcon,
  Notifications as NotificationsIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import DocumentIntelligence from './DocumentIntelligence';
import ExcelAIProcessor from './ExcelAIProcessor';
import PDFParserStudio from './PDFParserStudio';
import { apiService } from '../services/api';

// Import centralized brand colors
import { MODULE_COLOR, getColors } from '../config/brandColors';

const DocumentIntelligenceLanding = ({ onBack, darkMode = false }) => {
  const primaryBlue = MODULE_COLOR;
  const colors = getColors(darkMode);

  const [selectedView, setSelectedView] = useState(null);
  const [documentCount, setDocumentCount] = useState(0);
  const [templateCount, setTemplateCount] = useState(45);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocumentStats();
    loadTemplateCount();
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

  const loadTemplateCount = async () => {
    try {
      const response = await fetch('/api/v1/pdf-templates');
      const data = await response.json();
      if (data.success) {
        setTemplateCount(data.count || 0);
      }
    } catch (error) {
      console.error('Failed to load template count:', error);
    }
  };

  // Handle drill-in to detail views
  if (selectedView === 'document-analysis') {
    return <DocumentIntelligence onBack={() => setSelectedView(null)} />;
  }

  if (selectedView === 'excel-processor') {
    return <ExcelAIProcessor onBack={() => setSelectedView(null)} darkMode={darkMode} />;
  }

  if (selectedView === 'pdf-parser') {
    return <PDFParserStudio onBack={() => setSelectedView(null)} darkMode={darkMode} />;
  }

  // Tile configuration
  const tiles = [
    {
      id: 'document-analysis',
      icon: DescriptionIcon,
      title: 'Document Analysis & Q&A',
      subtitle: 'AI Document Understanding',
      description: 'AI-powered document understanding and Q&A across PDFs, Word, Excel, images, and more.',
      chipLabel: loading ? '...' : `${documentCount} Docs`,
      chipColor: documentCount > 0 ? 'success' : 'default',
    },
    {
      id: 'excel-processor',
      icon: TableChartIcon,
      title: 'Excel AI Processor',
      subtitle: 'Intelligent Spreadsheet Processing',
      description: 'Multi-agent AI workflows for Excel. Upload spreadsheets, apply templates, validate data quality.',
      chipLabel: '3 Templates',
      chipColor: 'primary',
    },
    {
      id: 'pdf-parser',
      icon: PictureAsPdfIcon,
      title: 'PDF Parser Studio',
      subtitle: 'Enterprise PDF Extraction',
      description: 'PDF data extraction with customizable templates, AI field recognition, and CSV transformation.',
      chipLabel: `${templateCount} Templates`,
      chipColor: 'primary',
    },
  ];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.background }}>
      {/* Header - Enterprise Pulse Style */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 0,
          flexShrink: 0,
          bgcolor: colors.paper,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <HubIcon sx={{ fontSize: 40, color: primaryBlue }} />
            <Box>
              <Typography variant="h5" fontWeight={600} sx={{ color: colors.text }}>
                Document Intelligence
              </Typography>
              <Typography variant="body2" sx={{ color: primaryBlue, fontSize: '0.875rem' }}>
                AI-powered document analysis, Excel processing, and PDF extraction
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Grid container spacing={1.5}>
            {tiles.map((tile, index) => {
              const IconComponent = tile.icon;
              return (
                <Grid item xs={12} sm={6} md={3} lg={3} key={tile.id}>
                  <Zoom in timeout={200 + index * 50}>
                    <Card
                      sx={{
                        height: 200,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: `1px solid ${colors.border}`,
                        borderRadius: 3,
                        overflow: 'hidden',
                        position: 'relative',
                        bgcolor: colors.cardBg,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: `0 20px 40px ${alpha(primaryBlue, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                          '& .module-icon': {
                            transform: 'scale(1.1)',
                            bgcolor: primaryBlue,
                            color: 'white',
                          },
                          '& .module-arrow': {
                            opacity: 1,
                            transform: 'translateX(4px)',
                          },
                        },
                      }}
                      onClick={() => setSelectedView(tile.id)}
                    >
                      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Icon and Status */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box
                            className="module-icon"
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1.5,
                              bgcolor: alpha(primaryBlue, 0.1),
                              color: primaryBlue,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <IconComponent sx={{ fontSize: 22 }} />
                          </Box>
                        </Box>

                        {/* Title */}
                        <Typography variant="body1" sx={{ fontWeight: 700, color: primaryBlue, mb: 0.5, fontSize: '0.9rem', lineHeight: 1.3 }}>
                          {tile.title}
                        </Typography>

                        {/* Subtitle */}
                        <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}>
                          {tile.subtitle}
                        </Typography>

                        {/* Description */}
                        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {tile.description}
                        </Typography>

                        {/* Footer */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(primaryBlue, 0.1) }}>
                          <Chip label={tile.chipLabel} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(primaryBlue, 0.08), color: primaryBlue, fontWeight: 600 }} />
                          <ArrowForwardIcon className="module-arrow" sx={{ color: primaryBlue, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentIntelligenceLanding;
