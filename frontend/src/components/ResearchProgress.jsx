import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  CheckCircleOutlined as CompleteIcon,
  RadioButtonUncheckedOutlined as PendingIcon,
  HourglassEmptyOutlined as RunningIcon,
  ErrorOutlineOutlined as ErrorIcon,
  ExpandMoreOutlined as ExpandIcon,
  ExpandLessOutlined as CollapseIcon,
  TimerOutlined as TimerIcon,
  StorageOutlined as DataIcon,
} from '@mui/icons-material';

const statusIcons = {
  pending: <PendingIcon />,
  running: <RunningIcon color="primary" />,
  completed: <CompleteIcon color="success" />,
  failed: <ErrorIcon color="error" />,
  cancelled: <ErrorIcon color="warning" />,
};

const statusColors = {
  pending: 'default',
  running: 'primary',
  completed: 'success',
  failed: 'error',
  cancelled: 'warning',
};

const ResearchProgress = ({ executionId, onComplete, apiService }) => {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState({});
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!executionId || !polling) return;

    const pollProgress = async () => {
      try {
        const response = await apiService.getResearchStatus(executionId);
        const progressData = response.data;
        console.log('Progress data received:', progressData);
        
        // Transform the data to include steps if not present
        const transformedData = {
          ...progressData,
          steps: progressData.steps || {}
        };
        
        setProgress(transformedData);
        
        // Check if execution is complete
        if (['completed', 'failed', 'cancelled'].includes(progressData.status)) {
          setPolling(false);
          console.log('Research execution completed, calling onComplete');
          if (onComplete) {
            onComplete(progressData);
          }
        }
      } catch (err) {
        console.error('Failed to fetch progress:', err);
        setError('Failed to fetch progress updates');
      }
    };

    // Initial fetch
    pollProgress();

    // Poll every 2 seconds
    const interval = setInterval(pollProgress, 2000);

    return () => clearInterval(interval);
  }, [executionId, polling, apiService, onComplete]);

  const toggleStepExpansion = (stepId) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!progress) {
    return (
      <Box display="flex" alignItems="center" gap={2} p={2}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading research progress...</Typography>
      </Box>
    );
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '--';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card>
      <CardContent>
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Research Progress</Typography>
            <Chip
              label={progress.status.toUpperCase()}
              color={statusColors[progress.status]}
              size="small"
            />
          </Box>
          
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="body2" color="text.secondary">
              {progress.steps_completed} of {progress.total_steps} steps completed
            </Typography>
            {progress.elapsed_seconds && (
              <Typography variant="body2" color="text.secondary">
                • Elapsed: {formatDuration(progress.elapsed_seconds)}
              </Typography>
            )}
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress.progress_percentage || 0}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Execution Steps
        </Typography>

        <List>
          {Object.entries(progress.steps).map(([stepId, stepData]) => (
            <React.Fragment key={stepId}>
              <ListItem
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  backgroundColor: stepData.status === 'running' ? 'action.hover' : 'transparent',
                }}
              >
                <ListItemIcon>
                  {statusIcons[stepData.status]}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">
                        {stepData.name || `Step ${stepId}`}
                      </Typography>
                      {stepData.duration && (
                        <Chip
                          icon={<TimerIcon />}
                          label={formatDuration(stepData.duration)}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {stepData.row_count !== undefined && stepData.row_count > 0 && (
                        <Chip
                          icon={<DataIcon />}
                          label={`${stepData.row_count} rows`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    stepData.status === 'running' ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <CircularProgress size={12} />
                        <Typography variant="caption">Executing query...</Typography>
                      </Box>
                    ) : stepData.error ? (
                      <Typography variant="caption" color="error">
                        Error: {stepData.error}
                      </Typography>
                    ) : null
                  }
                />
                {(stepData.query || stepData.result_preview) && (
                  <IconButton
                    size="small"
                    onClick={() => toggleStepExpansion(stepId)}
                  >
                    {expandedSteps[stepId] ? <CollapseIcon /> : <ExpandIcon />}
                  </IconButton>
                )}
              </ListItem>
              
              <Collapse in={expandedSteps[stepId]} timeout="auto" unmountOnExit>
                <Box pl={7} pr={2} pb={2}>
                  {stepData.query && (
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        Query:
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor: 'grey.100',
                          p: 1,
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: 200,
                        }}
                      >
                        {stepData.query}
                      </Box>
                    </Box>
                  )}
                  {stepData.result_preview && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Result Preview:
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor: 'grey.50',
                          p: 1,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: 150,
                        }}
                      >
                        <pre>{JSON.stringify(stepData.result_preview, null, 2)}</pre>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </React.Fragment>
          ))}
        </List>

        {progress.status === 'failed' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Research execution failed. Please check the step errors above.
          </Alert>
        )}

        {progress.status === 'completed' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Research completed successfully! View the results below.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ResearchProgress;