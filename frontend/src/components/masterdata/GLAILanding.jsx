import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Stack,
  Button,
  Breadcrumbs,
  Link,
  alpha,
  Zoom,
  Paper,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Lightbulb as LightbulbIcon,
  AccountBalance as AccountBalanceIcon,
  CloudUpload as UploadIcon,
  AutoFixHigh as MatchingIcon,
  Download as ExportIcon,
} from '@mui/icons-material';

// Import step components
import DataIngestion from './gl/DataIngestion';
import AccountMatching from './gl/AccountMatching';
import OutputExport from './gl/OutputExport';

// Import centralized brand colors
import { MODULE_COLOR } from '../../config/brandColors';

// GL.AI Workflow Steps
const glWorkflowSteps = [
  {
    id: 'data-ingestion',
    title: 'Data Ingestion',
    subtitle: 'Step 1',
    description: 'Upload source Chart of Accounts, target YCOA structure, and historical GL balances',
    icon: UploadIcon,
    color: MODULE_COLOR,
    stats: { label: 'Files', value: '3' },
    status: 'active',
  },
  {
    id: 'account-matching',
    title: 'Account Matching',
    subtitle: 'Step 2',
    description: 'AI-powered mapping of source GL accounts to target S/4HANA YCOA with confidence scoring',
    icon: MatchingIcon,
    color: MODULE_COLOR,
    stats: { label: 'Mapped', value: '94%' },
    status: 'active',
  },
  {
    id: 'output-export',
    title: 'Output & Export',
    subtitle: 'Step 3',
    description: 'Review final mappings and export to CSV, Excel, or SAP LSMW format for migration',
    icon: ExportIcon,
    color: MODULE_COLOR,
    stats: { label: 'Formats', value: '4' },
    status: 'active',
  },
];

const GLAILanding = ({ onBack, darkMode = false }) => {
  const [selectedStep, setSelectedStep] = useState(null);

  const handleStepClick = (stepId) => {
    setSelectedStep(stepId);
  };

  const handleBackToMain = () => {
    setSelectedStep(null);
  };

  const handleNavigate = (stepId) => {
    setSelectedStep(stepId);
  };

  // Render Step Components
  if (selectedStep === 'data-ingestion') {
    return <DataIngestion onBack={handleBackToMain} darkMode={darkMode} onNavigate={handleNavigate} />;
  }
  if (selectedStep === 'account-matching') {
    return <AccountMatching onBack={handleBackToMain} darkMode={darkMode} onNavigate={handleNavigate} />;
  }
  if (selectedStep === 'output-export') {
    return <OutputExport onBack={handleBackToMain} darkMode={darkMode} onNavigate={handleNavigate} />;
  }

  // Main Landing View
  return (
    <Box sx={{
      p: 3,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: darkMode
        ? 'linear-gradient(180deg, rgba(0, 53, 122, 0.1) 0%, #0d1117 50%)'
        : 'linear-gradient(180deg, rgba(0, 53, 122, 0.05) 0%, rgba(255, 255, 255, 1) 50%)',
    }}>
      {/* Header with Breadcrumbs */}
      <Paper elevation={0} sx={{
        p: 2,
        borderRadius: 0,
        mb: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        bgcolor: darkMode ? '#161b22' : 'white',
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: darkMode ? '#e6edf3' : 'text.primary',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              MASTER.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              GL.AI
            </Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            size="small"
            sx={{ borderColor: 'divider' }}
          >
            Back
          </Button>
        </Stack>

        {/* System Identity Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 4,
            height: 60,
            bgcolor: MODULE_COLOR,
            borderRadius: 2
          }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: MODULE_COLOR }}>
                <AccountBalanceIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{
                letterSpacing: '-0.5px',
                color: darkMode ? '#e6edf3' : MODULE_COLOR
              }}>
                GL.AI
              </Typography>
              <Chip
                label="3 Steps"
                size="small"
                sx={{
                  bgcolor: alpha(MODULE_COLOR, 0.1),
                  color: MODULE_COLOR,
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{
              fontSize: '0.85rem',
              color: darkMode ? '#8b949e' : 'text.secondary'
            }}>
              General Ledger Intelligence - AI-powered GL account mapping from source COA to S/4HANA YCOA
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Workflow Step Tiles */}
      <Grid container spacing={2}>
        {glWorkflowSteps.map((step, index) => (
          <Grid item xs={12} sm={6} md={4} key={step.id}>
            <Zoom in timeout={200 + index * 50}>
              <Card
                sx={{
                  height: 220,
                  cursor: step.status === 'active' ? 'pointer' : 'default',
                  opacity: step.status === 'coming-soon' ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  bgcolor: darkMode ? '#161b22' : 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': step.status === 'active' ? {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 20px 40px ${alpha(step.color, 0.15)}, 0 8px 16px rgba(0,0,0,0.08)`,
                    '& .step-icon': {
                      transform: 'scale(1.1)',
                      bgcolor: step.color,
                      color: 'white',
                    },
                    '& .step-arrow': {
                      opacity: 1,
                      transform: 'translateX(4px)',
                    },
                  } : {},
                }}
                onClick={() => step.status === 'active' && handleStepClick(step.id)}
              >
                {/* Step Number Badge */}
                <Box sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: alpha(step.color, darkMode ? 0.2 : 0.1),
                  color: step.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}>
                  {index + 1}
                </Box>

                <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Icon */}
                  <Box sx={{ mb: 2 }}>
                    <Avatar
                      className="step-icon"
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: alpha(step.color, darkMode ? 0.2 : 0.1),
                        color: step.color,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <step.icon sx={{ fontSize: 26 }} />
                    </Avatar>
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    color: step.color,
                    mb: 0.5,
                    fontSize: '1rem',
                    lineHeight: 1.3
                  }}>
                    {step.title}
                  </Typography>

                  {/* Subtitle */}
                  <Typography variant="caption" sx={{
                    color: darkMode ? '#8b949e' : 'text.secondary',
                    fontWeight: 500,
                    mb: 1,
                    fontSize: '0.75rem',
                    opacity: 0.9
                  }}>
                    {step.subtitle}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" sx={{
                    color: darkMode ? '#8b949e' : 'text.secondary',
                    mb: 'auto',
                    lineHeight: 1.5,
                    fontSize: '0.75rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {step.description}
                  </Typography>

                  {/* Footer */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1.5,
                    pt: 1.5,
                    borderTop: '1px solid',
                    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : alpha(step.color, 0.1)
                  }}>
                    <Chip
                      label={`${step.stats.value} ${step.stats.label}`}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.7rem',
                        bgcolor: alpha(step.color, darkMode ? 0.15 : 0.08),
                        color: step.color,
                        fontWeight: 600
                      }}
                    />
                    {step.status === 'active' && (
                      <ArrowForwardIcon className="step-arrow" sx={{ color: step.color, fontSize: 20, opacity: 0.5, transition: 'all 0.3s ease' }} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Info Section */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <LightbulbIcon sx={{ color: 'warning.main' }} />
          <Typography variant="body2" sx={{ color: darkMode ? '#8b949e' : 'text.secondary' }}>
            GL.AI uses machine learning to intelligently map source GL accounts to target S/4HANA Chart of Accounts
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default GLAILanding;
