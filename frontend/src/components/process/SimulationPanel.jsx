import React, { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as NoChangeIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

/**
 * SimulationPanel - What-If Simulation Results and Comparison
 */
const SimulationPanel = ({
  processModel,
  performance,
  modifications,
  onRunSimulation
}) => {
  const [simulationResults, setSimulationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasModifications =
    modifications &&
    (Object.keys(modifications.activity_durations || {}).length > 0 ||
     Object.keys(modifications.transition_probabilities || {}).length > 0);

  const handleRunSimulation = async () => {
    if (!hasModifications) {
      setError('No modifications to simulate. Enable Edit Mode and modify activities or transitions.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/process-mining/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          process_model: processModel,
          historical_performance: performance,
          modifications: modifications,
          num_cases: 1000
        })
      });

      const data = await response.json();

      if (data.success) {
        setSimulationResults(data.simulation_results);
      } else {
        setError('Simulation failed. Please try again.');
      }
    } catch (err) {
      console.error('Simulation error:', err);
      setError('Failed to run simulation. Please check your modifications.');
    } finally {
      setLoading(false);
    }
  };

  const renderMetricComparison = (title, currentValue, simulatedValue, unit, higherIsBetter = false) => {
    if (currentValue === undefined || simulatedValue === undefined) return null;

    const delta = simulatedValue - currentValue;
    const deltaPercent = currentValue !== 0 ? ((delta / currentValue) * 100) : 0;
    const isImprovement = higherIsBetter ? delta > 0 : delta < 0;

    return (
      <TableRow>
        <TableCell><strong>{title}</strong></TableCell>
        <TableCell align="right">{currentValue.toFixed(2)} {unit}</TableCell>
        <TableCell align="right">{simulatedValue.toFixed(2)} {unit}</TableCell>
        <TableCell align="right">
          <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
            {Math.abs(delta) < 0.01 ? (
              <NoChangeIcon fontSize="small" color="disabled" />
            ) : isImprovement ? (
              <TrendingUpIcon fontSize="small" color="success" />
            ) : (
              <TrendingDownIcon fontSize="small" color="error" />
            )}
            <Typography
              variant="body2"
              color={Math.abs(delta) < 0.01 ? 'text.secondary' : isImprovement ? 'success.main' : 'error.main'}
              fontWeight="bold"
            >
              {delta > 0 ? '+' : ''}{delta.toFixed(2)} ({deltaPercent > 0 ? '+' : ''}{deltaPercent.toFixed(1)}%)
            </Typography>
          </Stack>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h6" gutterBottom>
              What-If Simulation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Run simulation to see the projected impact of your modifications
            </Typography>
          </Box>

          {/* Modifications Summary */}
          {hasModifications && (
            <Alert severity="info">
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Active Modifications:
              </Typography>
              <Stack spacing={0.5}>
                {Object.entries(modifications.activity_durations || {}).map(([activity, duration]) => (
                  <Typography key={activity} variant="caption">
                    • {activity}: {duration}h average duration
                  </Typography>
                ))}
                {Object.entries(modifications.transition_probabilities || {}).map(([transition, prob]) => (
                  <Typography key={transition} variant="caption">
                    • {transition}: {prob} frequency
                  </Typography>
                ))}
              </Stack>
            </Alert>
          )}

          {/* Run Simulation Button */}
          <Box>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
              onClick={handleRunSimulation}
              disabled={loading || !hasModifications}
              fullWidth
            >
              {loading ? 'Simulating 1000 cases...' : 'Run Simulation'}
            </Button>
            {!hasModifications && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Enable Edit Mode and modify the process to run simulations
              </Typography>
            )}
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Simulation Results */}
          {simulationResults && (
            <Box>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="h6" gutterBottom>
                Simulation Results
              </Typography>

              {/* Summary Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        SIMULATED CASES
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {simulationResults.simulated_cases?.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        TOTAL EVENTS
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {simulationResults.total_events?.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Comparison Table */}
              {simulationResults.comparison && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Metric</strong></TableCell>
                        <TableCell align="right"><strong>Current</strong></TableCell>
                        <TableCell align="right"><strong>Simulated</strong></TableCell>
                        <TableCell align="right"><strong>Delta</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {simulationResults.comparison.cycle_time &&
                        renderMetricComparison(
                          'Avg Cycle Time',
                          simulationResults.comparison.cycle_time.current_avg_hours,
                          simulationResults.comparison.cycle_time.simulated_avg_hours,
                          'hours',
                          false // Lower is better
                        )}

                      {simulationResults.comparison.throughput &&
                        renderMetricComparison(
                          'Throughput',
                          simulationResults.comparison.throughput.current_cases_per_day,
                          simulationResults.comparison.throughput.simulated_cases_per_day,
                          'cases/day',
                          true // Higher is better
                        )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Impact Summary */}
              {simulationResults.comparison && (
                <Box sx={{ mt: 2 }}>
                  <Alert
                    severity={
                      simulationResults.comparison.cycle_time?.improvement
                        ? 'success'
                        : 'warning'
                    }
                  >
                    <Typography variant="body2">
                      {simulationResults.comparison.cycle_time?.improvement ? (
                        <>
                          <strong>Positive Impact!</strong> The modifications would reduce cycle time by{' '}
                          {Math.abs(simulationResults.comparison.cycle_time.delta_percent).toFixed(1)}%
                        </>
                      ) : (
                        <>
                          <strong>Negative Impact.</strong> The modifications would increase cycle time by{' '}
                          {Math.abs(simulationResults.comparison.cycle_time?.delta_percent || 0).toFixed(1)}%
                        </>
                      )}
                    </Typography>
                  </Alert>
                </Box>
              )}

              {/* Detailed Metrics */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Detailed Simulated Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Cycle Time Statistics
                      </Typography>
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">Average:</Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {simulationResults.cycle_time?.avg_hours.toFixed(1)}h (
                            {simulationResults.cycle_time?.avg_days.toFixed(1)}d)
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">Median:</Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {simulationResults.cycle_time?.median_hours.toFixed(1)}h
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">90th Percentile:</Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {simulationResults.cycle_time?.p90_hours.toFixed(1)}h
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">Min / Max:</Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {simulationResults.cycle_time?.min_hours.toFixed(1)}h /{' '}
                            {simulationResults.cycle_time?.max_hours.toFixed(1)}h
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Throughput Projection
                      </Typography>
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">Cases per day:</Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {simulationResults.throughput?.cases_per_day.toFixed(2)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default SimulationPanel;
