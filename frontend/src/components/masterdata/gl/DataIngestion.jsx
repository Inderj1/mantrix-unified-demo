import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Breadcrumbs,
  Link,
  Avatar,
  Chip,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as UploadIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckIcon,
  Description as FileIcon,
  Storage as DatabaseIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

import { MODULE_COLOR } from '../../../config/brandColors';

// Source systems
const sourceSystems = [
  { id: 'sap-ecc', name: 'SAP ECC', icon: '🔷' },
  { id: 'oracle', name: 'Oracle EBS', icon: '🔶' },
  { id: 'jde', name: 'JD Edwards', icon: '🟣' },
  { id: 'dynamics', name: 'MS Dynamics', icon: '🟢' },
  { id: 'sage', name: 'Sage', icon: '🔵' },
  { id: 'other', name: 'Other/Custom', icon: '⚪' },
];

// Upload cards configuration
const uploadCards = [
  {
    id: 'source-coa',
    title: 'Source Chart of Accounts',
    description: 'Upload your legacy GL account master data',
    required: true,
    formats: ['CSV', 'XLSX', 'TXT'],
    fields: ['Account', 'Description', 'Type', 'Group'],
  },
  {
    id: 'target-ycoa',
    title: 'Target YCOA Structure',
    description: 'S/4HANA YCOA mapping template',
    required: true,
    formats: ['CSV', 'XLSX'],
    fields: ['YCOA Account', 'Description', 'FSV Node'],
  },
  {
    id: 'gl-balances',
    title: 'GL Balances (Optional)',
    description: 'Historical balances for validation',
    required: false,
    formats: ['CSV', 'XLSX'],
    fields: ['Account', 'Period', 'Balance', 'Currency'],
  },
];

const DataIngestion = ({ onBack, darkMode = false, onNavigate }) => {
  const [selectedSystem, setSelectedSystem] = useState('sap-ecc');
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploading, setUploading] = useState(null);

  const handleFileUpload = (cardId) => {
    // Simulate file upload
    setUploading(cardId);
    setTimeout(() => {
      setUploadedFiles(prev => ({
        ...prev,
        [cardId]: {
          name: `${cardId.replace('-', '_')}_data.xlsx`,
          rows: Math.floor(Math.random() * 3000) + 1000,
          uploadedAt: new Date().toLocaleTimeString(),
        }
      }));
      setUploading(null);
    }, 1500);
  };

  const canProceed = uploadedFiles['source-coa'] && uploadedFiles['target-ycoa'];

  return (
    <Box sx={{
      p: 3,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      bgcolor: darkMode ? '#0d1117' : '#f8fafc',
    }}>
      {/* Header */}
      <Paper elevation={0} sx={{
        p: 2,
        borderRadius: 0,
        mb: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        bgcolor: darkMode ? '#161b22' : 'white',
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack}
              sx={{ textDecoration: 'none', color: darkMode ? '#e6edf3' : 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
              GL.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Data Ingestion
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ borderColor: 'divider' }}>
            Back
          </Button>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: MODULE_COLOR }}>
            <UploadIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: darkMode ? '#e6edf3' : MODULE_COLOR }}>
              Step 1: Data Ingestion
            </Typography>
            <Typography variant="body2" sx={{ color: darkMode ? '#8b949e' : 'text.secondary' }}>
              Upload source Chart of Accounts and target YCOA structure for AI-powered mapping
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Source System Selection */}
      <Paper elevation={0} sx={{
        p: 3,
        borderRadius: 3,
        mb: 3,
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        bgcolor: darkMode ? '#161b22' : 'white',
      }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: darkMode ? '#e6edf3' : 'text.primary' }}>
          Select Source System
        </Typography>
        <Grid container spacing={1.5}>
          {sourceSystems.map((system) => (
            <Grid item xs={6} sm={4} md={2} key={system.id}>
              <Paper
                elevation={0}
                onClick={() => setSelectedSystem(system.id)}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderRadius: 2,
                  border: `2px solid ${selectedSystem === system.id ? MODULE_COLOR : darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  bgcolor: selectedSystem === system.id ? alpha(MODULE_COLOR, darkMode ? 0.15 : 0.05) : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: MODULE_COLOR,
                    bgcolor: alpha(MODULE_COLOR, darkMode ? 0.1 : 0.03),
                  },
                }}
              >
                <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{system.icon}</Typography>
                <Typography variant="caption" fontWeight={600} sx={{ color: darkMode ? '#e6edf3' : 'text.primary' }}>
                  {system.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Upload Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {uploadCards.map((card) => {
          const isUploaded = uploadedFiles[card.id];
          const isUploading = uploading === card.id;

          return (
            <Grid item xs={12} md={4} key={card.id}>
              <Paper
                elevation={0}
                onClick={() => !isUploaded && !isUploading && handleFileUpload(card.id)}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  cursor: isUploaded ? 'default' : 'pointer',
                  border: `2px dashed ${isUploaded ? '#10b981' : darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                  bgcolor: isUploaded ? alpha('#10b981', darkMode ? 0.1 : 0.05) : darkMode ? '#161b22' : 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': !isUploaded && {
                    borderColor: MODULE_COLOR,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${alpha(MODULE_COLOR, 0.15)}`,
                  },
                }}
              >
                {/* Icon */}
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: isUploaded ? alpha('#10b981', 0.15) : alpha(MODULE_COLOR, darkMode ? 0.15 : 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}>
                  {isUploaded ? (
                    <CheckIcon sx={{ fontSize: 28, color: '#10b981' }} />
                  ) : (
                    <UploadIcon sx={{ fontSize: 28, color: MODULE_COLOR }} />
                  )}
                </Box>

                {/* Title & Required Badge */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: darkMode ? '#e6edf3' : 'text.primary' }}>
                    {card.title}
                  </Typography>
                  {card.required && (
                    <Chip label="Required" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }} />
                  )}
                </Stack>

                {/* Description */}
                <Typography variant="body2" sx={{ color: darkMode ? '#8b949e' : 'text.secondary', mb: 2 }}>
                  {card.description}
                </Typography>

                {/* File Formats */}
                <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
                  {card.formats.map((fmt) => (
                    <Chip key={fmt} label={fmt} size="small" sx={{
                      height: 22,
                      fontSize: '0.65rem',
                      bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      color: darkMode ? '#8b949e' : 'text.secondary',
                    }} />
                  ))}
                </Stack>

                {/* Upload Progress or Success */}
                {isUploading && (
                  <Box>
                    <LinearProgress sx={{ borderRadius: 1, mb: 1 }} />
                    <Typography variant="caption" sx={{ color: darkMode ? '#8b949e' : 'text.secondary' }}>
                      Uploading...
                    </Typography>
                  </Box>
                )}

                {isUploaded && (
                  <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha('#10b981', darkMode ? 0.15 : 0.08),
                  }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FileIcon sx={{ fontSize: 18, color: '#10b981' }} />
                      <Box>
                        <Typography variant="caption" fontWeight={600} sx={{ color: '#10b981', display: 'block' }}>
                          {isUploaded.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: darkMode ? '#8b949e' : 'text.secondary' }}>
                          {isUploaded.rows.toLocaleString()} rows • {isUploaded.uploadedAt}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Configuration Panel */}
      <Paper elevation={0} sx={{
        p: 3,
        borderRadius: 3,
        mb: 3,
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        bgcolor: darkMode ? '#161b22' : 'white',
      }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: darkMode ? '#e6edf3' : 'text.primary' }}>
          Migration Configuration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Target System</InputLabel>
              <Select defaultValue="s4hana" label="Target System">
                <MenuItem value="s4hana">SAP S/4HANA</MenuItem>
                <MenuItem value="s4cloud">SAP S/4HANA Cloud</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>YCOA Template</InputLabel>
              <Select defaultValue="ycoa-standard" label="YCOA Template">
                <MenuItem value="ycoa-standard">Standard YCOA</MenuItem>
                <MenuItem value="ycoa-ext">Extended YCOA</MenuItem>
                <MenuItem value="ycoa-custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Matching Strategy</InputLabel>
              <Select defaultValue="ai-hybrid" label="Matching Strategy">
                <MenuItem value="ai-auto">Fully Automated</MenuItem>
                <MenuItem value="ai-hybrid">AI + Manual Review</MenuItem>
                <MenuItem value="rule-based">Rule-Based Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Confidence Threshold"
              type="number"
              defaultValue="85"
              InputProps={{ endAdornment: <Typography variant="caption">%</Typography> }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Footer Actions */}
      <Paper elevation={0} sx={{
        p: 2,
        borderRadius: 3,
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        bgcolor: darkMode ? '#161b22' : 'white',
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" sx={{ color: darkMode ? '#8b949e' : 'text.secondary' }}>
              {Object.keys(uploadedFiles).length} of {uploadCards.filter(c => c.required).length} required files uploaded
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            disabled={!canProceed}
            onClick={() => onNavigate && onNavigate('account-matching')}
            sx={{
              bgcolor: MODULE_COLOR,
              '&:hover': { bgcolor: alpha(MODULE_COLOR, 0.9) },
              '&.Mui-disabled': { bgcolor: alpha(MODULE_COLOR, 0.3) },
            }}
          >
            Proceed to Account Matching
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default DataIngestion;
