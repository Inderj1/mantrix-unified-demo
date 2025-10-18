import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Divider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  AccountTree as ProcessIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import ProcessExplorer from '../components/process/ProcessExplorer';
import ProcessMetrics from '../components/process/ProcessMetrics';
import EditableProcessExplorer from '../components/process/EditableProcessExplorer';
import SimulationPanel from '../components/process/SimulationPanel';
import ConformanceChecker from '../components/process/ConformanceChecker';
import InsightsPanel from '../components/process/InsightsPanel';
import { apiService } from '../services/api';
import { Tabs, Tab } from '@mui/material';

const STEPS = ['Select Process', 'Configure Analysis', 'View Results'];

const ProcessMiningPage = () => {
  // Wizard state
  const [activeStep, setActiveStep] = useState(0);

  // Configuration state
  const [availableProcesses, setAvailableProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Results state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  // Results view tabs
  const [resultsTab, setResultsTab] = useState(0); // 0: Discovery, 1: Simulation, 2: Conformance, 3: Insights

  // Simulation state
  const [modifications, setModifications] = useState({
    activity_durations: {},
    transition_probabilities: {}
  });

  // Load available processes on mount
  useEffect(() => {
    loadAvailableProcesses();

    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const loadAvailableProcesses = async () => {
    try {
      const response = await fetch('/api/v1/process-mining/processes');
      const data = await response.json();

      if (data.success) {
        setAvailableProcesses(data.processes || []);
        // Auto-select first supported process
        const firstSupported = data.processes.find(p => p.supported);
        if (firstSupported) {
          setSelectedProcess(firstSupported.id);
        }
      }
    } catch (err) {
      console.error('Error loading processes:', err);
      setError('Failed to load available processes');
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      // Last step - run analysis
      runProcessDiscovery();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setResults(null);
    setError(null);
  };

  const runProcessDiscovery = async () => {
    setLoading(true);
    setError(null);
    setActiveStep(2); // Move to results step

    try {
      const response = await fetch('/api/v1/process-mining/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          process_type: selectedProcess,
          date_from: dateFrom,
          date_to: dateTo,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
      } else {
        setError('Process discovery failed');
      }
    } catch (err) {
      console.error('Error running process discovery:', err);
      setError('Failed to discover process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProcessDetails = availableProcesses.find(
    (p) => p.id === selectedProcess
  );

  const canProceed = () => {
    if (activeStep === 0) return selectedProcess && selectedProcessDetails?.supported;
    if (activeStep === 1) return dateFrom && dateTo;
    return false;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <ProcessIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Process Mining
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Discover, analyze, and optimize your business processes from event logs
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Wizard */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Select Process */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Process Type
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose which business process you want to analyze
            </Typography>

            <Grid container spacing={2}>
              {availableProcesses.map((process) => (
                <Grid item xs={12} md={4} key={process.id}>
                  <Card
                    sx={{
                      cursor: process.supported ? 'pointer' : 'not-allowed',
                      border: selectedProcess === process.id ? 2 : 1,
                      borderColor: selectedProcess === process.id ? 'primary.main' : 'divider',
                      opacity: process.supported ? 1 : 0.6,
                      '&:hover': {
                        borderColor: process.supported ? 'primary.main' : 'divider',
                        boxShadow: process.supported ? 2 : 0,
                      },
                    }}
                    onClick={() => process.supported && setSelectedProcess(process.id)}
                  >
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">{process.name}</Typography>
                          <Chip
                            label={process.supported ? 'Available' : 'Not Available'}
                            size="small"
                            color={process.supported ? 'success' : 'default'}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {process.description}
                        </Typography>
                        {process.note && (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            <Typography variant="caption">{process.note}</Typography>
                          </Alert>
                        )}
                        {process.activities && process.activities.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Key Activities:
                            </Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                              {process.activities.slice(0, 4).map((activity, i) => (
                                <Chip
                                  key={i}
                                  label={activity}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.65rem', mb: 0.5 }}
                                />
                              ))}
                              {process.activities.length > 4 && (
                                <Chip
                                  label={`+${process.activities.length - 4} more`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.65rem', mb: 0.5 }}
                                />
                              )}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Step 2: Configure Analysis */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set the date range for process discovery
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Selected Process:</strong> {selectedProcessDetails?.name}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    The analysis will extract events from BigQuery and discover the actual process flow,
                    variants, bottlenecks, and performance metrics.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 3: View Results */}
        {activeStep === 2 && (
          <Box>
            {loading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Discovering process...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Extracting events from BigQuery and analyzing process flow
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!loading && results && (
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="h6">
                      {selectedProcessDetails?.name} - Discovery Results
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {results.date_range?.from} to {results.date_range?.to} • {results.events_count} events analyzed
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      startIcon={<RefreshIcon />}
                      onClick={runProcessDiscovery}
                      variant="outlined"
                      size="small"
                    >
                      Refresh
                    </Button>
                    <Button
                      startIcon={<DownloadIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        // Export functionality
                        const dataStr = JSON.stringify(results, null, 2);
                        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                        const exportFileDefaultName = `process-mining-${selectedProcess}-${Date.now()}.json`;
                        const linkElement = document.createElement('a');
                        linkElement.setAttribute('href', dataUri);
                        linkElement.setAttribute('download', exportFileDefaultName);
                        linkElement.click();
                      }}
                    >
                      Export
                    </Button>
                  </Stack>
                </Stack>

                {results.events_count === 0 ? (
                  <Alert severity="warning">
                    No events found for the selected date range. Try a different time period.
                  </Alert>
                ) : (
                  <Box>
                    {/* Tabs for Discovery vs Simulation vs Conformance vs Insights */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                      <Tabs value={resultsTab} onChange={(e, newValue) => setResultsTab(newValue)}>
                        <Tab label="Process Discovery" />
                        <Tab label="What-If Simulation" />
                        <Tab label="Conformance Checking" />
                        <Tab label="AI Insights" />
                      </Tabs>
                    </Box>

                    {/* Discovery Tab */}
                    {resultsTab === 0 && (
                      <Stack spacing={3}>
                        {/* Process Flow Visualization */}
                        <ProcessExplorer
                          processModel={results.process_model}
                          bottlenecks={results.bottlenecks}
                          summary={results.summary}
                        />

                        {/* Performance Metrics */}
                        <ProcessMetrics
                          performance={results.performance}
                          variants={results.variants}
                          bottlenecks={results.bottlenecks}
                        />
                      </Stack>
                    )}

                    {/* Simulation Tab */}
                    {resultsTab === 1 && (
                      <Stack spacing={3}>
                        {/* Editable Process Explorer */}
                        <EditableProcessExplorer
                          processModel={results.process_model}
                          bottlenecks={results.bottlenecks}
                          summary={results.summary}
                          onModificationsChange={setModifications}
                        />

                        {/* Simulation Panel */}
                        <SimulationPanel
                          processModel={results.process_model}
                          performance={results.performance}
                          modifications={modifications}
                        />
                      </Stack>
                    )}

                    {/* Conformance Tab */}
                    {resultsTab === 2 && (
                      <ConformanceChecker
                        processType={selectedProcess}
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                      />
                    )}

                    {/* Insights Tab */}
                    {resultsTab === 3 && (
                      <InsightsPanel
                        processModel={results.process_model}
                        performance={results.performance}
                        variants={results.variants}
                      />
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Navigation Buttons */}
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {activeStep > 0 && activeStep < 2 && (
            <Button onClick={handleBack}>Back</Button>
          )}
          {activeStep === 2 && (
            <Button onClick={handleReset}>Start New Analysis</Button>
          )}
          {activeStep < 2 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceed()}
              endIcon={activeStep === 1 ? <PlayIcon /> : null}
            >
              {activeStep === 1 ? 'Run Discovery' : 'Next'}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProcessMiningPage;
