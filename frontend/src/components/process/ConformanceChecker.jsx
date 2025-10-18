import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';

/**
 * ConformanceChecker - Check actual process execution against reference model
 */
const ConformanceChecker = ({ processType, dateFrom, dateTo }) => {
  const [referenceModel, setReferenceModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedCases, setExpandedCases] = useState({});

  const defaultReferenceModels = {
    'order-to-cash': 'Order Created, Pickup Scheduled, Goods Picked Up, Delivery Scheduled, Goods Delivered, Invoice Generated',
    'quote-to-cash': 'Quote Created, Quote Sent, Quote Approved, Order Created',
    'procure-to-pay': 'PR Created, PO Created, Goods Receipt, Invoice Receipt, Payment Made',
  };

  const handleCheckConformance = async () => {
    setLoading(true);
    setError(null);

    try {
      const reference = referenceModel
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (reference.length === 0) {
        setError('Please enter a reference model');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/process-mining/conformance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          process_type: processType,
          date_from: dateFrom,
          date_to: dateTo,
          reference_model: reference,
          strict: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.conformance);
      } else {
        setError('Failed to check conformance');
      }
    } catch (err) {
      console.error('Error checking conformance:', err);
      setError('Failed to check conformance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCaseExpansion = (caseId) => {
    setExpandedCases(prev => ({
      ...prev,
      [caseId]: !prev[caseId]
    }));
  };

  const getSeverityColor = (fitnessScore) => {
    if (fitnessScore >= 90) return 'success';
    if (fitnessScore >= 70) return 'warning';
    return 'error';
  };

  React.useEffect(() => {
    if (processType && defaultReferenceModels[processType]) {
      setReferenceModel(defaultReferenceModels[processType]);
    }
  }, [processType]);

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Conformance Checking
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Compare actual process execution against a reference model to identify deviations
        </Typography>

        {/* Reference Model Input */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Reference Model (comma-separated activities)"
            value={referenceModel}
            onChange={(e) => setReferenceModel(e.target.value)}
            placeholder="Order Created, Goods Delivered, Invoice Generated"
            helperText="Enter the expected sequence of activities"
          />

          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <PlayIcon />}
            onClick={handleCheckConformance}
            disabled={loading || !referenceModel}
          >
            {loading ? 'Checking...' : 'Check Conformance'}
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Results */}
        {result && (
          <Box>
            <Divider sx={{ my: 3 }} />

            {/* Fitness Score */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: `${getSeverityColor(result.fitness_score)}.light` }}>
                  <CardContent>
                    <Typography variant="h3" fontWeight="bold" align="center" color={`${getSeverityColor(result.fitness_score)}.dark`}>
                      {result.fitness_score}%
                    </Typography>
                    <Typography variant="caption" align="center" display="block" color="text.secondary">
                      Fitness Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <CheckCircleIcon color="success" />
                      <Typography variant="h4" fontWeight="bold">
                        {result.conforming_cases}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" align="center" display="block" color="text.secondary">
                      Conforming Cases
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <ErrorIcon color="error" />
                      <Typography variant="h4" fontWeight="bold">
                        {result.non_conforming_cases}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" align="center" display="block" color="text.secondary">
                      Non-Conforming Cases
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" fontWeight="bold" align="center">
                      {result.total_cases}
                    </Typography>
                    <Typography variant="caption" align="center" display="block" color="text.secondary">
                      Total Cases
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Deviation Summary */}
            {result.deviation_summary && Object.keys(result.deviation_summary).length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Deviation Summary
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {Object.entries(result.deviation_summary).map(([type, count]) => (
                    <Chip
                      key={type}
                      label={`${type.replace(/_/g, ' ')}: ${count}`}
                      color="warning"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Top Deviations */}
            {result.top_deviations && result.top_deviations.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Top Deviation Patterns
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Pattern</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                        <TableCell>Sample Cases</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.top_deviations.map((deviation, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2">{deviation.pattern}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={deviation.count} size="small" color="warning" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">{deviation.percentage}%</Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              {deviation.sample_cases.slice(0, 3).map((caseId, i) => (
                                <Chip
                                  key={i}
                                  label={caseId}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                              ))}
                              {deviation.sample_cases.length > 3 && (
                                <Chip
                                  label={`+${deviation.sample_cases.length - 3}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Non-Conforming Cases Detail */}
            {result.sample_non_conforming_cases && result.sample_non_conforming_cases.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Non-Conforming Cases ({result.sample_non_conforming_cases.length} shown)
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Case ID</TableCell>
                        <TableCell># Activities</TableCell>
                        <TableCell># Deviations</TableCell>
                        <TableCell>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.sample_non_conforming_cases.map((caseData) => (
                        <React.Fragment key={caseData.case_id}>
                          <TableRow>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {caseData.case_id}
                              </Typography>
                            </TableCell>
                            <TableCell>{caseData.num_activities}</TableCell>
                            <TableCell>
                              <Chip
                                label={caseData.deviations.length}
                                size="small"
                                color="error"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => toggleCaseExpansion(caseData.case_id)}
                              >
                                {expandedCases[caseData.case_id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={4} sx={{ p: 0 }}>
                              <Collapse in={expandedCases[caseData.case_id]} timeout="auto" unmountOnExit>
                                <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                                  <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Actual Trace:
                                  </Typography>
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 2 }}>
                                    {caseData.actual_trace.map((activity, i) => (
                                      <Chip
                                        key={i}
                                        label={activity}
                                        size="small"
                                        sx={{ mb: 0.5 }}
                                      />
                                    ))}
                                  </Stack>

                                  <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Deviations:
                                  </Typography>
                                  <Stack spacing={1}>
                                    {caseData.deviations.map((deviation, i) => (
                                      <Alert key={i} severity="warning" sx={{ py: 0 }}>
                                        <Typography variant="caption">
                                          <strong>{deviation.type.replace(/_/g, ' ')}:</strong> {deviation.detail}
                                        </Typography>
                                      </Alert>
                                    ))}
                                  </Stack>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ConformanceChecker;
