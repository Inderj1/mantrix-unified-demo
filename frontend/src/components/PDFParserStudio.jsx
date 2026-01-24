/**
 * PDF Parser Studio Component
 *
 * Customer Templates management for PDF extraction.
 * Allows users to view, create, edit, and manage customer templates.
 */

import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Avatar, alpha,
  Breadcrumbs, Link, Chip,
} from '@mui/material';
import {
  ArrowBack, NavigateNext, PictureAsPdf, TableChart,
} from '@mui/icons-material';
import PDFTemplatesManager from './PDFTemplatesManager';
import CreateTemplateModal from './CreateTemplateModal';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const PDFParserStudio = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [templateCount, setTemplateCount] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Load template count
  const loadTemplateCount = async () => {
    try {
      const response = await fetch('/api/v1/pdf-templates');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTemplateCount(result.count || result.data?.length || 0);
        }
      }
    } catch (error) {
      console.error('Error loading template count:', error);
    }
  };

  useEffect(() => {
    loadTemplateCount();
  }, []);

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: colors.background }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>
              Document Intelligence
            </Link>
            <Typography sx={{ color: colors.primary }} fontWeight={600}>Customer Templates</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBack />} onClick={onBack} variant="outlined" size="small">
            Back
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: alpha('#0854a0', 0.1) }}>
            <TableChart sx={{ fontSize: 28, color: '#0854a0' }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: colors.text }}>Customer Templates</Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Manage PDF extraction templates for different customers
            </Typography>
          </Box>
          <Chip
            label={`${templateCount} Templates`}
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Paper>

      {/* Customer Templates Manager */}
      <PDFTemplatesManager
        onBack={onBack}
        darkMode={darkMode}
        embedded={true}
        onCreateTemplate={() => setCreateModalOpen(true)}
        onTemplateCreated={loadTemplateCount}
      />

      {/* Create Template Modal */}
      <CreateTemplateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          loadTemplateCount();
          setCreateModalOpen(false);
        }}
        darkMode={darkMode}
      />
    </Box>
  );
};

export default PDFParserStudio;
