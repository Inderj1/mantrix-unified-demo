import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  QuestionAnswer as QuestionIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const ResultAnalysis = ({ analysis, loading, onFollowUpClick }) => {
  const [expanded, setExpanded] = React.useState('summary');

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary">
            Analyzing results with AI...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <Box>

      {/* Executive Summary */}
      <Accordion 
        expanded={expanded === 'summary'} 
        onChange={handleAccordionChange('summary')}
        sx={{ mb: 1 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="medium">
            Executive Summary
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
            {analysis.summary}
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Key Insights */}
      <Accordion 
        expanded={expanded === 'insights'} 
        onChange={handleAccordionChange('insights')}
        sx={{ mb: 1 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" fontWeight="medium">
              Key Insights
            </Typography>
            <Chip 
              size="small" 
              label={analysis.key_insights?.length || 0} 
              color="primary"
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {analysis.key_insights?.map((insight, index) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={insight}
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    sx: { lineHeight: 1.6 }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Trends */}
      {analysis.trends && analysis.trends.length > 0 && (
        <Accordion 
          expanded={expanded === 'trends'} 
          onChange={handleAccordionChange('trends')}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TrendingUpIcon fontSize="small" color="info" />
              <Typography variant="subtitle1" fontWeight="medium">
                Trends & Patterns
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {analysis.trends.map((trend, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <TrendingUpIcon color="info" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={trend}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { lineHeight: 1.6 }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Recommendations */}
      <Accordion 
        expanded={expanded === 'recommendations'} 
        onChange={handleAccordionChange('recommendations')}
        sx={{ mb: 1 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LightbulbIcon fontSize="small" color="warning" />
            <Typography variant="subtitle1" fontWeight="medium">
              Recommendations
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {analysis.recommendations?.map((rec, index) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LightbulbIcon color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={rec}
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    sx: { lineHeight: 1.6 }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Follow-up Questions */}
      {analysis.follow_up_questions && analysis.follow_up_questions.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <QuestionIcon fontSize="small" color="secondary" />
            <Typography variant="subtitle2" fontWeight="medium">
              Suggested Follow-up Questions
            </Typography>
          </Stack>
          <Stack spacing={1}>
            {analysis.follow_up_questions.map((question, index) => (
              <Chip
                key={index}
                label={question}
                onClick={() => onFollowUpClick && onFollowUpClick(question)}
                sx={{ 
                  justifyContent: 'flex-start',
                  height: 'auto',
                  minHeight: 32,
                  py: 0.5,
                  px: 2,
                  '& .MuiChip-label': {
                    whiteSpace: 'normal',
                    textAlign: 'left',
                    lineHeight: 1.4,
                    fontSize: '0.875rem',
                  },
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
                variant="outlined"
                color="primary"
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Data Quality Notes */}
      {analysis.data_quality_notes && analysis.data_quality_notes.length > 0 && (
        <Alert 
          severity="info" 
          icon={<WarningIcon />}
          sx={{ mt: 2 }}
        >
          <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
            Data Quality Notes
          </Typography>
          <List dense sx={{ mt: 0.5 }}>
            {analysis.data_quality_notes.map((note, index) => (
              <ListItem key={index} sx={{ pl: 0, py: 0 }}>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  • {note}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Alert>
      )}
    </Box>
  );
};

export default ResultAnalysis;