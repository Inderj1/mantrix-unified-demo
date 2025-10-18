import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  AccountTree as ProcessIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

/**
 * ProcessMetrics - Display process performance metrics
 */
const ProcessMetrics = ({ performance, variants = [], bottlenecks = [] }) => {
  if (!performance) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No performance metrics available
        </Typography>
      </Box>
    );
  }

  const { cycle_times, throughput, rework, resource_utilization = [] } = performance;
  const cycleStats = cycle_times?.statistics || {};

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Cycle Time Metrics */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SpeedIcon color="primary" />
                  <Typography variant="h6">Cycle Time</Typography>
                </Stack>
                <Typography variant="h4" color="primary">
                  {cycleStats.avg_days?.toFixed(1) || '0'} days
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Average end-to-end
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={0.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption">Median:</Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {cycleStats.median_days?.toFixed(1) || '0'}d
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption">Min:</Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {cycleStats.min_hours?.toFixed(1) || '0'}h
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption">Max:</Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {cycleStats.max_days?.toFixed(1) || '0'}d
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Throughput */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUpIcon color="success" />
                  <Typography variant="h6">Throughput</Typography>
                </Stack>
                <Typography variant="h4" color="success.main">
                  {throughput?.avg_cases_completed_per_period?.toFixed(0) || '0'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cases per day (avg)
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Variants */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ProcessIcon color="info" />
                  <Typography variant="h6">Variants</Typography>
                </Stack>
                <Typography variant="h4" color="info.main">
                  {variants.length || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Unique process paths
                </Typography>
                {variants.length > 0 && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption">
                      Top variant: {variants[0]?.percentage?.toFixed(1)}% of cases
                    </Typography>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Rework Rate */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <WarningIcon color={rework?.rework_rate_percentage > 20 ? 'error' : 'warning'} />
                  <Typography variant="h6">Rework</Typography>
                </Stack>
                <Typography
                  variant="h4"
                  color={rework?.rework_rate_percentage > 20 ? 'error.main' : 'warning.main'}
                >
                  {rework?.rework_rate_percentage?.toFixed(1) || '0'}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cases with rework
                </Typography>
                {rework?.total_cases_with_rework > 0 && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption">
                      {rework.total_cases_with_rework} of {rework.total_cases} cases
                    </Typography>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Bottlenecks Table */}
        {bottlenecks && bottlenecks.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TimelineIcon color="warning" />
                    <Typography variant="h6">Top Bottlenecks</Typography>
                    <Chip
                      label={`${bottlenecks.length} detected`}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  </Stack>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Transition</TableCell>
                          <TableCell align="right">Avg Duration</TableCell>
                          <TableCell align="right">Median</TableCell>
                          <TableCell align="right">95th Percentile</TableCell>
                          <TableCell align="right">Occurrences</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bottlenecks.slice(0, 10).map((bottleneck, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              bgcolor: bottleneck.avg_hours > 48 ? 'error.light' :
                                      bottleneck.avg_hours > 24 ? 'warning.light' : 'inherit',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {bottleneck.transition}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {bottleneck.avg_hours?.toFixed(1)}h
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {bottleneck.median_hours?.toFixed(1)}h
                            </TableCell>
                            <TableCell align="right">
                              {bottleneck.p95_hours?.toFixed(1)}h
                            </TableCell>
                            <TableCell align="right">
                              {bottleneck.occurrence_count}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Process Variants Table */}
        {variants && variants.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ProcessIcon color="info" />
                    <Typography variant="h6">Process Variants</Typography>
                    <Chip
                      label={`${variants.length} unique paths`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </Stack>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Variant</TableCell>
                          <TableCell>Activities</TableCell>
                          <TableCell align="right">Frequency</TableCell>
                          <TableCell align="right">Percentage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {variants.slice(0, 10).map((variant, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                Variant #{variant.variant_id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                {variant.activities.map((activity, i) => (
                                  <Chip
                                    key={i}
                                    label={activity}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem', mb: 0.5 }}
                                  />
                                ))}
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {variant.frequency}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(variant.percentage, 100)}
                                  sx={{ width: 60, height: 6, borderRadius: 1 }}
                                />
                                <Typography variant="body2">
                                  {variant.percentage?.toFixed(1)}%
                                </Typography>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Resource Utilization */}
        {resource_utilization && resource_utilization.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Resource Utilization</Typography>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Resource</TableCell>
                          <TableCell align="right">Events</TableCell>
                          <TableCell align="right">Cases</TableCell>
                          <TableCell align="right">Utilization</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {resource_utilization.slice(0, 5).map((resource, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {resource.resource}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{resource.total_events}</TableCell>
                            <TableCell align="right">{resource.unique_cases}</TableCell>
                            <TableCell align="right">
                              <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                                <LinearProgress
                                  variant="determinate"
                                  value={resource.utilization_percentage}
                                  sx={{ width: 60, height: 6, borderRadius: 1 }}
                                />
                                <Typography variant="body2">
                                  {resource.utilization_percentage?.toFixed(1)}%
                                </Typography>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ProcessMetrics;
