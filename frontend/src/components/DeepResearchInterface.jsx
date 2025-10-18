import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Grid,
  Avatar,
  Tooltip,
  CircularProgress,
  Divider,
  Stack,
  Badge,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
  DataUsage as DataIcon,
  TrendingUp as TrendIcon,
  CompareArrows as CompareIcon,
  Assessment as ReportIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
  Insights as InsightsIcon,
  Recommend as RecommendIcon,
  Schedule as ScheduleIcon,
  DataObject as DataObjectIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const RESEARCH_PHASES = {
  PLANNING: 'planning',
  DATA_GATHERING: 'data_gathering', 
  ANALYSIS: 'analysis',
  VALIDATION: 'validation',
  SYNTHESIS: 'synthesis',
  REPORTING: 'reporting',
  COMPLETED: 'completed',
  ERROR: 'error'
};

const PHASE_CONFIGS = {
  [RESEARCH_PHASES.PLANNING]: {
    label: 'Planning Research',
    icon: <PsychologyIcon />,
    color: '#1976d2',
    description: 'Creating comprehensive research plan'
  },
  [RESEARCH_PHASES.DATA_GATHERING]: {
    label: 'Gathering Data', 
    icon: <DataIcon />,
    color: '#2e7d32',
    description: 'Collecting and validating financial data'
  },
  [RESEARCH_PHASES.ANALYSIS]: {
    label: 'Analyzing Data',
    icon: <TrendIcon />,
    color: '#ed6c02', 
    description: 'Performing detailed financial analysis'
  },
  [RESEARCH_PHASES.VALIDATION]: {
    label: 'Validating Results',
    icon: <CheckIcon />,
    color: '#9c27b0',
    description: 'Cross-validating findings and data quality'
  },
  [RESEARCH_PHASES.SYNTHESIS]: {
    label: 'Synthesizing Insights',
    icon: <InsightsIcon />,
    color: '#d32f2f',
    description: 'Connecting findings into coherent insights'
  },
  [RESEARCH_PHASES.REPORTING]: {
    label: 'Generating Report',
    icon: <ReportIcon />,
    color: '#7b1fa2',
    description: 'Creating comprehensive final report'
  },
  [RESEARCH_PHASES.COMPLETED]: {
    label: 'Research Complete',
    icon: <CheckIcon />,
    color: '#388e3c',
    description: 'Analysis completed successfully'
  },
  [RESEARCH_PHASES.ERROR]: {
    label: 'Error Occurred',
    icon: <ErrorIcon />,
    color: '#d32f2f',
    description: 'An error occurred during research'
  }
};

const AGENT_ICONS = {
  financial_analyst: <AnalyticsIcon />,
  data_analyst: <DataObjectIcon />,
  trend_analyst: <TrendIcon />,
  variance_analyst: <CompareIcon />,
  report_analyst: <ReportIcon />
};

const DeepResearchInterface = ({ open, onClose, initialQuestion = '', onResults }) => {
  const theme = useTheme();
  const [question, setQuestion] = useState(initialQuestion);
  const [researchId, setResearchId] = useState(null);
  const [isResearching, setIsResearching] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  const [agentsStatus, setAgentsStatus] = useState({});
  const [researchPlan, setResearchPlan] = useState(null);
  const [showPlanPreview, setShowPlanPreview] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [editedPlan, setEditedPlan] = useState(null);
  const eventSourceRef = useRef(null);

  const phaseOrder = [
    RESEARCH_PHASES.PLANNING,
    RESEARCH_PHASES.DATA_GATHERING,
    RESEARCH_PHASES.ANALYSIS,
    RESEARCH_PHASES.VALIDATION,
    RESEARCH_PHASES.SYNTHESIS,
    RESEARCH_PHASES.REPORTING
  ];

  useEffect(() => {
    if (open && initialQuestion) {
      setQuestion(initialQuestion);
    }
  }, [open, initialQuestion]);

  useEffect(() => {
    // Cleanup event source on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    // Update active step based on current phase
    if (progress?.phase) {
      const stepIndex = phaseOrder.indexOf(progress.phase);
      if (stepIndex >= 0) {
        setActiveStep(stepIndex);
      }
    }
  }, [progress?.phase]);

  const createResearchPlan = async () => {
    if (!question.trim()) return;

    try {
      setError(null);
      setIsCreatingPlan(true);

      const response = await fetch('/api/v1/deep-research/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research_question: question,
          context: {
            timestamp: new Date().toISOString(),
            user_initiated: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create research plan: ${response.statusText}`);
      }

      const data = await response.json();
      setResearchPlan(data);
      setShowPlanPreview(true);
      
    } catch (err) {
      console.error('Error creating research plan:', err);
      setError(err.message);
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const startResearch = async () => {
    try {
      setError(null);
      setIsResearching(true);
      setProgress(null);
      setResults(null);
      setActiveStep(0);
      setShowPlanPreview(false);

      const response = await fetch('/api/v1/deep-research/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research_question: question,
          context: {
            timestamp: new Date().toISOString(),
            user_initiated: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to start research: ${response.statusText}`);
      }

      const data = await response.json();
      setResearchId(data.research_id);
      
      // Small delay to ensure research has started before connecting to stream
      setTimeout(() => {
        startProgressStream(data.research_id);
      }, 500);
      
    } catch (err) {
      console.error('Error starting research:', err);
      setError(err.message);
      setIsResearching(false);
    }
  };

  const startProgressStream = (researchId) => {
    // Close existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Start new EventSource for real-time updates
    const eventSource = new EventSource(`/api/v1/deep-research/${researchId}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        setProgress(update);

        // Check if research is completed
        if (update.phase === RESEARCH_PHASES.COMPLETED) {
          setIsResearching(false);
          fetchResults(researchId);
        } else if (update.phase === RESEARCH_PHASES.ERROR) {
          setIsResearching(false);
          setError('Research failed. Please check the issues.');
        }
      } catch (err) {
        console.error('Error parsing progress update:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource error:', err);
      
      // Check if it's a network error or connection closed
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('EventSource connection closed, falling back to polling');
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        console.log('EventSource reconnecting...');
        return; // Let it try to reconnect
      }
      
      eventSource.close();
      
      // Fall back to polling if still researching
      if (isResearching) {
        console.log('Falling back to polling progress updates');
        setTimeout(() => pollProgress(researchId), 2000);
      }
    };
  };

  const pollProgress = async (researchId) => {
    try {
      const response = await fetch(`/api/v1/deep-research/${researchId}/progress`);
      if (response.ok) {
        const progressData = await response.json();
        setProgress(progressData);

        if (progressData.phase === RESEARCH_PHASES.COMPLETED) {
          setIsResearching(false);
          fetchResults(researchId);
        } else if (progressData.phase === RESEARCH_PHASES.ERROR) {
          setIsResearching(false);
          setError('Research failed. Please check the issues.');
        } else if (isResearching) {
          // Continue polling
          setTimeout(() => pollProgress(researchId), 3000);
        }
      }
    } catch (err) {
      console.error('Error polling progress:', err);
      if (isResearching) {
        setTimeout(() => pollProgress(researchId), 5000);
      }
    }
  };

  const fetchResults = async (researchId) => {
    try {
      const response = await fetch(`/api/v1/deep-research/${researchId}/results`);
      if (response.ok) {
        const resultsData = await response.json();
        setResults(resultsData);
        
        // Notify parent component
        if (onResults) {
          onResults(resultsData);
        }
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to fetch research results');
    }
  };

  const handleClose = () => {
    // Stop any ongoing streams
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    setIsResearching(false);
    setProgress(null);
    setResults(null);
    setError(null);
    setQuestion('');
    setResearchId(null);
    setActiveStep(0);
    setResearchPlan(null);
    setShowPlanPreview(false);
    setIsCreatingPlan(false);
    setShowPlanEditor(false);
    setEditedPlan(null);
    
    onClose();
  };

  const renderPlanPreview = () => {
    if (!researchPlan) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon color="primary" />
          Research Plan Preview
        </Typography>

        {/* Plan Overview */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              Analysis Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="h4" color="secondary">
                  {researchPlan.preview.total_steps}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Analysis Steps
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h4" color="primary">
                  {researchPlan.preview.estimated_time}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Est. Duration
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h4" color="success.main">
                  {researchPlan.preview.agents_involved}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  AI Agents
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Chip 
                  label={researchPlan.preview.analysis_type.replace('_', ' ').toUpperCase()}
                  color="primary"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Analysis Steps */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              📋 Analysis Steps ({researchPlan.plan.steps.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {researchPlan.plan.steps.map((step, index) => (
              <Card key={index} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      {index + 1}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {step.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                        <Chip
                          label={step.agent.replace('_', ' ')}
                          size="small"
                          icon={AGENT_ICONS[step.agent] || <SpeedIcon />}
                          variant="outlined"
                        />
                        <Chip
                          label={`${step.duration} min`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                        <Chip
                          label={step.phase.replace('_', ' ')}
                          size="small"
                          color="primary"
                          variant="filled"
                        />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Data Requirements */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              📊 Data Requirements
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {researchPlan.plan.data_requirements.map((requirement, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <DataIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={requirement} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Success Criteria */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              ✅ Success Criteria
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {researchPlan.plan.success_criteria.map((criteria, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={criteria} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Risk Factors */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              ⚠️ Risk Factors
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {researchPlan.plan.risk_factors.map((risk, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={risk} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  };

  const renderPlanEditor = () => {
    if (!editedPlan) return null;

    return (
      <Dialog 
        open={showPlanEditor} 
        onClose={() => setShowPlanEditor(false)}
        maxWidth="lg" 
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon color="primary" />
              Edit Research Plan
            </Typography>
            <IconButton onClick={() => setShowPlanEditor(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Research Objective */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Research Objective"
                value={editedPlan.plan?.objective || ''}
                onChange={(e) => setEditedPlan({
                  ...editedPlan,
                  plan: { ...editedPlan.plan, objective: e.target.value }
                })}
              />
            </Grid>

            {/* Analysis Steps */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Analysis Steps
              </Typography>
              {editedPlan.plan?.steps?.map((step, index) => (
                <Card key={index} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Step Description"
                          value={step.description}
                          onChange={(e) => {
                            const newSteps = [...editedPlan.plan.steps];
                            newSteps[index].description = e.target.value;
                            setEditedPlan({
                              ...editedPlan,
                              plan: { ...editedPlan.plan, steps: newSteps }
                            });
                          }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Duration (min)"
                          value={step.duration}
                          onChange={(e) => {
                            const newSteps = [...editedPlan.plan.steps];
                            newSteps[index].duration = parseInt(e.target.value) || 1;
                            setEditedPlan({
                              ...editedPlan,
                              plan: { ...editedPlan.plan, steps: newSteps }
                            });
                          }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Chip
                          label={step.agent.replace('_', ' ')}
                          size="small"
                          icon={AGENT_ICONS[step.agent] || <SpeedIcon />}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Chip
                          label={step.phase.replace('_', ' ')}
                          size="small"
                          color="primary"
                          variant="filled"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Grid>

            {/* Data Requirements */}
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>
                Data Requirements
              </Typography>
              {editedPlan.plan?.data_requirements?.map((req, index) => (
                <TextField
                  key={index}
                  fullWidth
                  size="small"
                  sx={{ mb: 1 }}
                  value={req}
                  onChange={(e) => {
                    const newReqs = [...editedPlan.plan.data_requirements];
                    newReqs[index] = e.target.value;
                    setEditedPlan({
                      ...editedPlan,
                      plan: { ...editedPlan.plan, data_requirements: newReqs }
                    });
                  }}
                />
              ))}
            </Grid>

            {/* Success Criteria */}
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>
                Success Criteria
              </Typography>
              {editedPlan.plan?.success_criteria?.map((criteria, index) => (
                <TextField
                  key={index}
                  fullWidth
                  size="small"
                  sx={{ mb: 1 }}
                  value={criteria}
                  onChange={(e) => {
                    const newCriteria = [...editedPlan.plan.success_criteria];
                    newCriteria[index] = e.target.value;
                    setEditedPlan({
                      ...editedPlan,
                      plan: { ...editedPlan.plan, success_criteria: newCriteria }
                    });
                  }}
                />
              ))}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowPlanEditor(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setResearchPlan(editedPlan);
              setShowPlanEditor(false);
              setShowPlanPreview(true);
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderProgressStepper = () => (
    <Box sx={{ mb: 3 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {phaseOrder.map((phase, index) => {
          const config = PHASE_CONFIGS[phase];
          const isActive = progress?.phase === phase;
          const isCompleted = progress?.completed_steps?.includes(phase);
          const hasIssues = progress?.issues?.length > 0 && isActive;

          return (
            <Step key={phase} completed={isCompleted}>
              <StepLabel
                icon={
                  <Avatar
                    sx={{
                      bgcolor: isActive ? config.color : isCompleted ? theme.palette.success.main : theme.palette.grey[300],
                      color: 'white',
                      width: 32,
                      height: 32
                    }}
                  >
                    {config.icon}
                  </Avatar>
                }
                error={hasIssues}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: isActive ? 600 : 400 }}>
                  {config.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {config.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {isActive && progress && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {progress.current_step}
                    </Typography>
                    
                    {progress.active_agents?.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Active Agents:
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          {progress.active_agents.map(agent => (
                            <Chip
                              key={agent}
                              label={agent.replace('_', ' ')}
                              size="small"
                              icon={AGENT_ICONS[agent] || <SpeedIcon />}
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                    
                    <LinearProgress
                      variant="determinate"
                      value={progress.progress_percentage}
                      sx={{ 
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: config.color
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                      {Math.round(progress.progress_percentage)}% complete
                    </Typography>
                  </Box>
                )}
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );

  const renderResearchResults = () => {
    if (!results) return null;

    // Check if we have meaningful results
    const hasExecutiveSummary = results.executive_summary && results.executive_summary.trim().length > 0;
    const hasFindings = results.key_findings && results.key_findings.length > 0;
    const hasRecommendations = results.recommendations && results.recommendations.length > 0;
    const hasMeaningfulResults = hasExecutiveSummary || hasFindings || hasRecommendations;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckIcon color="success" />
          Research Complete
        </Typography>

        {!hasMeaningfulResults && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Research Analysis Incomplete
            </Typography>
            <Typography variant="body2">
              The system was unable to generate meaningful insights from the available data. 
              This may be due to:
            </Typography>
            <List dense sx={{ mt: 1 }}>
              <ListItem sx={{ py: 0 }}>
                <ListItemText primary="• No relevant data found for the research question" />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText primary="• Database connection issues" />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText primary="• Query processing errors" />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Please try rephrasing your research question or check system connectivity.
            </Typography>
          </Alert>
        )}

        {hasMeaningfulResults && (
          <>
            {/* Executive Summary */}
            {hasExecutiveSummary && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Executive Summary
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {results.executive_summary}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h5" color="primary">
                          {results.confidence_level ? `${Math.round(results.confidence_level * 100)}%` : 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Confidence Level
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h5" color="secondary">
                          {results.data_quality ? `${Math.round(results.data_quality * 100)}%` : 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Data Quality
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h5" color="success.main">
                          {results.key_findings?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Key Findings
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h5" color="info.main">
                          {results.recommendations?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Recommendations
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Key Findings */}
            {results.key_findings?.length > 0 && (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InsightsIcon color="primary" />
                    Key Findings ({results.key_findings.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {results.key_findings.map((finding, index) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemIcon>
                          <Badge badgeContent={index + 1} color="primary">
                            <InfoIcon />
                          </Badge>
                        </ListItemIcon>
                        <ListItemText primary={finding} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Recommendations */}
            {results.recommendations?.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RecommendIcon color="secondary" />
                    Recommendations ({results.recommendations.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {results.recommendations.map((rec, index) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemIcon>
                          <Badge badgeContent={index + 1} color="secondary">
                            <RecommendIcon />
                          </Badge>
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Issues */}
            {results.issues?.length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Issues Identified:
                </Typography>
                <List dense>
                  {results.issues.map((issue, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemText primary={issue} />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}
          </>
        )}
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon color="primary" />
            <Typography variant="h6">
              Deep Research
            </Typography>
            <Chip
              label="BETA"
              size="small"
              sx={{
                bgcolor: 'warning.light',
                color: 'warning.dark',
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 20
              }}
            />
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Question Input */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Research Question"
            placeholder="Ask a complex financial question that requires deep analysis..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isResearching}
            helperText="Example: 'Analyze the factors driving our Q3 revenue variance and recommend strategies to improve Q4 performance'"
          />
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Research Plan Preview */}
        {showPlanPreview && renderPlanPreview()}

        {/* Research Progress */}
        {isResearching && renderProgressStepper()}

        {/* Research Results */}
        {results && renderResearchResults()}

        {/* Plan Editor Dialog */}
        {renderPlanEditor()}

        {/* Issues Display */}
        {progress?.issues?.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Issues During Research:
            </Typography>
            <List dense>
              {progress.issues.map((issue, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemText primary={issue} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {results ? 'Close' : 'Cancel'}
        </Button>
        
        {/* Show Preview Plan button when not researching and no results */}
        {!isResearching && !results && !showPlanPreview && (
          <Button
            variant="contained"
            startIcon={<PsychologyIcon />}
            onClick={createResearchPlan}
            disabled={!question.trim() || isCreatingPlan}
          >
            {isCreatingPlan ? 'Creating Plan...' : 'Preview Plan'}
          </Button>
        )}
        
        {/* Show Approve & Start and Edit Plan buttons when plan preview is shown */}
        {showPlanPreview && !isResearching && !results && (
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setEditedPlan(JSON.parse(JSON.stringify(researchPlan))); // Deep copy
                setShowPlanEditor(true);
              }}
            >
              Edit Plan
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={startResearch}
            >
              Approve & Start
            </Button>
          </>
        )}
        
        {/* Show New Research button when results are available */}
        {results && (
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setResults(null);
              setProgress(null);
              setError(null);
              setActiveStep(0);
              setResearchPlan(null);
              setShowPlanPreview(false);
              setShowPlanEditor(false);
              setEditedPlan(null);
            }}
          >
            New Research
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeepResearchInterface;